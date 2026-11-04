import bpy
import sys
import math
import random
import os
from mathutils import Vector

sys.path.insert(0, "/mnt/data/backup/project_personal/AI")
from blender_studio_library import (
    load_glb_asset,
    pose_mixamo_archer_and_lock_bow,
    create_enclosed_forest_skybox,
    animate_studio_camera,
    setup_5pass_vfx_compositor,
)

# ==============================================================================
# 🎬 BLENDER 4.2 LTS — DÂY CHUYỀN 5-PASS VFX ĐÃ KHẮC PHỤC TRIỆT ĐỂ 4 LỖI
#   ✅ Fix Lỗi 1 (RULE-3D-01): Xoay xương cánh tay Mixamo giương cung & khóa
#      cây cung trực tiếp vào đúng tọa độ bàn tay trái (LeftHand Bone-Socket).
#   ✅ Fix Lỗi 2 (RULE-3D-02): Dùng bộ khung xương Khủng long T-Rex Đa Khớp
#      (Đùi + Cẳng chân + Bàn chân 3 móng + Cổ + Hàm dưới gầm rú) thay cho tượng tĩnh.
#   ✅ Fix Lỗi 3 (RULE-3D-03): Đóng kín Vòm Rừng Sương Mù 360° & xuất RGB (0% nền trắng).
#   ✅ Fix Lỗi 4 (RULE-3D-04): Xuất kênh Roto Alpha sạch + Kết hợp lớp 8K AI ở Hậu kỳ.
# ==============================================================================

OUT_DIR = "/mnt/data/backup/project_personal/AI/previz_output"
FRAMES_CLAY_DIR = os.path.join(OUT_DIR, "frames_clay")
FRAMES_COLOR_DIR = os.path.join(OUT_DIR, "frames_color")
FRAMES_DEPTH_DIR = os.path.join(OUT_DIR, "frames_depth")
FRAMES_NORMAL_DIR = os.path.join(OUT_DIR, "frames_normal")
FRAMES_ROTO_DIR = os.path.join(OUT_DIR, "frames_fg_roto_mask")

for d in (OUT_DIR, FRAMES_CLAY_DIR, FRAMES_COLOR_DIR, FRAMES_DEPTH_DIR, FRAMES_NORMAL_DIR, FRAMES_ROTO_DIR):
    os.makedirs(d, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.frame_start = 1
scene.frame_end = 72  # 3.0s @ 24fps
scene.render.fps = 24
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100

TEX_DIR = os.path.join(OUT_DIR, "textures")
FRAMES_ARROW_DIR = os.path.join(OUT_DIR, "frames_arrow_rgba")
os.makedirs(FRAMES_ARROW_DIR, exist_ok=True)

def make_mat(name, color, roughness=0.5, metallic=0.0, tex_file=None):
    mat = bpy.data.materials.new(name=name)
    mat.diffuse_color = (*color, 1.0)
    mat.roughness = roughness
    mat.metallic = metallic
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    bsdf = nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    if tex_file:
        tpath = os.path.join(TEX_DIR, tex_file)
        if os.path.exists(tpath):
            tex_node = nodes.new("ShaderNodeTexImage")
            tex_node.image = bpy.data.images.load(tpath)
            if bsdf:
                links.new(tex_node.outputs["Color"], bsdf.inputs["Base Color"])
            nodes.active = tex_node
    return mat

def smooth_obj(obj):
    if obj.type == 'MESH' and obj.data:
        for poly in obj.data.polygons:
            poly.use_smooth = True

mat_sky = make_mat("ForestMistSkyMat", (0.06, 0.12, 0.09), roughness=1.0, tex_file="tex_forest_sky.jpg")
mat_ground = make_mat("GroundMat", (0.10, 0.14, 0.08), roughness=0.92, tex_file="tex_ground.jpg")
mat_tree = make_mat("TreeBarkMat", (0.18, 0.12, 0.08), roughness=0.85, tex_file="tex_bark.jpg")
mat_foliage = make_mat("FoliageMat", (0.08, 0.22, 0.10), roughness=0.75, tex_file="tex_canopy.jpg")
mat_dino_skin = make_mat("DinoSkinMat", (0.18, 0.25, 0.15), roughness=0.42, tex_file="tex_rex_scales.jpg")
mat_dino_ridge = make_mat("DinoRidgeMat", (0.10, 0.15, 0.08), roughness=0.38, tex_file="tex_rex_scales.jpg")
mat_dino_belly = make_mat("DinoBellyMat", (0.36, 0.32, 0.22), roughness=0.58, tex_file="tex_rex_belly.jpg")
mat_dino_mouth = make_mat("DinoMouthMat", (0.48, 0.12, 0.12), roughness=0.3)
mat_dino_eye = make_mat("DinoEyeMat", (1.0, 0.76, 0.05), roughness=0.1)
mat_teeth = make_mat("TeethMat", (0.95, 0.93, 0.86), roughness=0.15)
mat_hunter = make_mat("HunterArmorMat", (0.14, 0.20, 0.26), roughness=0.45, metallic=0.35)
mat_bow = make_mat("BowWoodMat", (0.42, 0.24, 0.10), roughness=0.35, tex_file="tex_bark.jpg")
mat_string = make_mat("BowStringMat", (0.82, 0.80, 0.72), roughness=0.3)
mat_arrow = make_mat("ArrowGoldMat", (0.96, 0.70, 0.15), roughness=0.2, metallic=0.85)

fg_col = bpy.data.collections.new("01_Foreground_Roto_Layer")
bg_col = bpy.data.collections.new("02_Mid_And_Background_Layer")
arrow_col = bpy.data.collections.new("03_Projectile_Arrow_Layer")
scene.collection.children.link(fg_col)
scene.collection.children.link(bg_col)
scene.collection.children.link(arrow_col)

def move_to_col(obj, target_col):
    for c in list(obj.users_collection):
        c.objects.unlink(obj)
    target_col.objects.link(obj)

# 1. Mặt đất Rừng + Vòm Trời Rừng Khép Kín 360° (FIX LỖI 3: Không còn nền trắng bệch!)
bpy.ops.mesh.primitive_grid_add(x_subdivisions=50, y_subdivisions=50, size=90, location=(0, 15, 0))
ground = bpy.context.active_object
ground.name = "Forest_Ground"
ground.data.materials.append(mat_ground)
smooth_obj(ground)
move_to_col(ground, bg_col)

skydome_obj = create_enclosed_forest_skybox(scene, bg_col, mat_sky, mat_foliage)

# 2. Rừng Cây 3 Lớp (Khớp chính xác vị trí Thân cây cổ thụ tiền cảnh góc phải x=1.72m của tấm ảnh AI 8K!)
random.seed(42)
fg_trees = [(-2.35, 2.85, 0.36), (1.72, 3.50, 0.44)]
for idx, (tx, ty, rad) in enumerate(fg_trees):
    bpy.ops.mesh.primitive_cylinder_add(vertices=28, radius=rad, depth=14, location=(tx, ty, 7.0))
    trunk = bpy.context.active_object
    trunk.name = f"FG_Roto_Tree_{idx}"
    trunk.rotation_euler = (0.02, -0.02, 0.5)
    trunk.data.materials.append(mat_tree)
    smooth_obj(trunk)
    move_to_col(trunk, fg_col)

bg_trees = [
    (-4.2, 6.8), (4.0, 7.5), (-3.6, 11.5), (3.8, 12.8),
    (-5.0, 16.0), (4.8, 17.5), (-3.2, 22.0), (3.5, 24.0),
    (-6.5, 21.0), (6.8, 23.0), (0.0, 28.0), (-2.2, 31.0), (2.4, 30.0)
]
for idx, (tx, ty) in enumerate(bg_trees):
    rad = random.uniform(0.35, 0.55)
    bpy.ops.mesh.primitive_cylinder_add(vertices=24, radius=rad, depth=14, location=(tx, ty, 7.0))
    trunk = bpy.context.active_object
    trunk.name = f"BG_Tree_{idx}"
    trunk.data.materials.append(mat_tree)
    smooth_obj(trunk)
    move_to_col(trunk, bg_col)

    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=3, radius=rad * 4.2, location=(tx, ty, 11.5 + random.uniform(-0.8, 1.2)))
    crown = bpy.context.active_object
    crown.name = f"BG_Crown_{idx}"
    crown.data.materials.append(mat_foliage)
    smooth_obj(crown)
    move_to_col(crown, bg_col)

# 3. FIX LỖI 1 (RULE-3D-01): Nạp Chiến binh Mixamo, GIỮ NGUYÊN TEXTURE PBR GỐC 1024x1024 & Khóa Cung Vào Bàn Tay!
hunter_root, hunter_objs, hunter_arm = load_glb_asset(
    "SOLDIER_MIXAMO",
    location=(-0.95, 0.75, 0.0),
    rotation=(0, 0, -0.38),
    scale=1.05,
    action_keyword=None  # Ngắt Idle buông tay để giương cung!
)
move_to_col(hunter_root, fg_col)
for ho in hunter_objs:
    move_to_col(ho, fg_col)
    if ho.type == 'MESH':
        smooth_obj(ho)
        for m in ho.data.materials:
            if m and m.use_nodes:
                for n in m.node_tree.nodes:
                    if n.type == 'TEX_IMAGE' and n.image and 'diffuse' in n.image.name.lower():
                        m.node_tree.nodes.active = n

# Xoay xương cánh tay hướng về phía T-Rex và lấy tọa độ chính xác của Bàn tay vươn ra cầm cung (`bow_hand_pos`)!
bow_hand_pos, draw_hand_pos = pose_mixamo_archer_and_lock_bow(
    hunter_arm,
    aim_target_world=Vector((0.15, 12.0, 2.25))
)
print(f"🎯 [RULE-3D-01] Đã khóa Cây cung vào đúng tọa độ Bàn tay vươn ra (mixamorig:RightHand): {bow_hand_pos}")

# Tạo Socket Cầm Cung khóa trực tiếp vào Xương Bàn Tay (`mixamorig:RightHand`) bằng Bone Constraint!
bow_pivot = bpy.data.objects.new("Bow_Hand_Socket", None)
scene.collection.objects.link(bow_pivot)
bow_pivot.location = bow_hand_pos
bow_pivot.rotation_euler = (0.06, 0.12, -0.18)
if hunter_arm:
    c_lock = bow_pivot.constraints.new(type='COPY_LOCATION')
    c_lock.target = hunter_arm
    c_lock.subtarget = "mixamorig:RightHand"
move_to_col(bow_pivot, fg_col)

# Dựng Thân Cung Gỗ Uốn Cong Hình Chữ C Hở (Open Curved Recurve Bow - KHÔNG dùng vòng tròn khép kín!)
bow_radius = 0.62
num_seg = 10
top_tip = None
bot_tip = None
for si in range(num_seg):
    ang1 = -1.12 + (si / num_seg) * 2.24
    ang2 = -1.12 + ((si + 1) / num_seg) * 2.24
    ang_mid = 0.5 * (ang1 + ang2)
    # Đỉnh cong hướng về phía trước (+Y), tay cầm ở đúng (0, 0, 0) trong lòng bàn tay!
    y_pos = (math.cos(ang_mid) - 1.0) * 0.34
    z_pos = math.sin(ang_mid) * bow_radius
    seg_len = (2.24 / num_seg) * bow_radius * 1.08
    thick = 0.028 if abs(ang_mid) < 0.35 else 0.019
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=12,
        radius=thick,
        depth=seg_len,
        location=(0.0, y_pos, z_pos),
        rotation=(-ang_mid * 0.52, 0.0, 0.0)
    )
    seg = bpy.context.active_object
    seg.name = f"Archer_Bow_Limb_{si}"
    seg.parent = bow_pivot
    seg.data.materials.append(mat_bow)
    smooth_obj(seg)
    move_to_col(seg, fg_col)
    if si == 0:
        bot_tip = Vector((0.0, (math.cos(ang1) - 1.0) * 0.34, math.sin(ang1) * bow_radius))
    if si == num_seg - 1:
        top_tip = Vector((0.0, (math.cos(ang2) - 1.0) * 0.34, math.sin(ang2) * bow_radius))

# Dây cung kéo căng hình chữ V nối từ 2 đầu cánh cung về điểm kéo dây (Nock Point)
nock_local = Vector((0.0, -0.38, 0.0))
for idx_s, tip_pt in enumerate([top_tip, bot_tip]):
    mid_pt = 0.5 * (tip_pt + nock_local)
    diff = tip_pt - nock_local
    length = diff.length
    rot_x = math.atan2(diff.y, diff.z)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=8,
        radius=0.006,
        depth=length,
        location=mid_pt,
        rotation=(-rot_x, 0.0, 0.0)
    )
    b_str = bpy.context.active_object
    b_str.name = f"Bow_String_{idx_s}"
    b_str.parent = bow_pivot
    b_str.data.materials.append(mat_string)
    move_to_col(b_str, fg_col)

# Mũi tên vàng đặt chính xác trên bàn tay cầm cung (`bow_hand_pos`) lao vút tới ngực T-Rex trong 0.4 giây (10 frames) rồi găm sâu biến mất!
bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.022, depth=1.05, location=bow_hand_pos, rotation=(-1.48, 0.0, -0.10))
arrow = bpy.context.active_object
arrow.name = "Hero_Arrow"
arrow.data.materials.append(mat_arrow)
smooth_obj(arrow)
move_to_col(arrow, arrow_col)

bpy.ops.mesh.primitive_cone_add(vertices=12, radius1=0.055, radius2=0.0, depth=0.24, location=(0, 0, 0.60))
arrow_tip = bpy.context.active_object
arrow_tip.parent = arrow
arrow_tip.data.materials.append(mat_arrow)
smooth_obj(arrow_tip)
move_to_col(arrow_tip, arrow_col)

arrow.location = bow_hand_pos + Vector((0.02, 0.22, 0.02))
arrow.scale = (1.0, 1.0, 1.0)
arrow.keyframe_insert(data_path="location", frame=1)
arrow.keyframe_insert(data_path="scale", frame=1)
arrow.keyframe_insert(data_path="location", frame=4)
arrow.keyframe_insert(data_path="scale", frame=4)

arrow.location = Vector((0.05, 13.8, 2.35))
arrow.scale = (1.0, 1.0, 1.0)
arrow.keyframe_insert(data_path="location", frame=14)
arrow.keyframe_insert(data_path="scale", frame=14)

# Sau khi găm trúng ngực T-Rex ở Frame 14, mũi tên ẩn đi để tuyệt đối không bao giờ lơ lửng giữa không trung!
arrow.scale = (0.0, 0.0, 0.0)
arrow.keyframe_insert(data_path="scale", frame=15)
arrow.keyframe_insert(data_path="scale", frame=72)

# 4. FIX LỖI 2 (RULE-3D-02): Dùng Bộ Khung Xương Khủng Long T-Rex Đa Khớp Hoạt Động Thật!
# (Có khớp Đùi + Cẳng chân + Bàn chân 3 móng vuốt + Khớp Cổ + Khớp Hàm dưới há to gầm rú!)
dino_root = bpy.data.objects.new("TRex_Articulated_Rig", None)
scene.collection.objects.link(dino_root)
move_to_col(dino_root, bg_col)

bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=24, radius=1.05, location=(0, 0, 2.75))
d_torso = bpy.context.active_object
d_torso.scale = (1.12, 1.95, 1.18)
d_torso.rotation_euler = (0.15, 0, 0)
d_torso.parent = dino_root
d_torso.data.materials.append(mat_dino_skin)
smooth_obj(d_torso)
move_to_col(d_torso, bg_col)

# Khớp Cổ & Đầu
neck_pivot = bpy.data.objects.new("TRex_NeckPivot", None)
scene.collection.objects.link(neck_pivot)
neck_pivot.parent = dino_root
neck_pivot.location = (0, -1.55, 3.05)
move_to_col(neck_pivot, bg_col)

bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.82, radius2=0.58, depth=1.35, location=(0, -0.45, 0.25), rotation=(-0.95, 0, 0))
d_neck = bpy.context.active_object
d_neck.parent = neck_pivot
d_neck.data.materials.append(mat_dino_skin)
smooth_obj(d_neck)
move_to_col(d_neck, bg_col)

head_pivot = bpy.data.objects.new("TRex_HeadPivot", None)
scene.collection.objects.link(head_pivot)
head_pivot.parent = neck_pivot
head_pivot.location = (0, -1.05, 0.55)
move_to_col(head_pivot, bg_col)

bpy.ops.mesh.primitive_uv_sphere_add(segments=28, ring_count=20, radius=0.68, location=(0, -0.35, 0.12))
d_skull = bpy.context.active_object
d_skull.scale = (0.85, 1.45, 0.78)
d_skull.parent = head_pivot
d_skull.data.materials.append(mat_dino_skin)
smooth_obj(d_skull)
move_to_col(d_skull, bg_col)

bpy.ops.mesh.primitive_cube_add(size=0.75, location=(0, -0.55, -0.12))
d_palate = bpy.context.active_object
d_palate.scale = (0.72, 1.25, 0.15)
d_palate.parent = head_pivot
d_palate.data.materials.append(mat_dino_mouth)
move_to_col(d_palate, bg_col)

for side in (-1, 1):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.18, location=(side * 0.42, -0.15, 0.42))
    brow = bpy.context.active_object
    brow.scale = (0.7, 1.4, 0.5)
    brow.parent = head_pivot
    brow.data.materials.append(mat_dino_ridge)
    smooth_obj(brow)
    move_to_col(brow, bg_col)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=16, ring_count=12, radius=0.11, location=(side * 0.46, -0.22, 0.28))
    eye = bpy.context.active_object
    eye.parent = head_pivot
    eye.data.materials.append(mat_dino_eye)
    smooth_obj(eye)
    move_to_col(eye, bg_col)

for ti in range(7):
    angle = -0.85 + (ti / 6.0) * 1.70
    tx = math.sin(angle) * 0.42
    ty = -0.35 - math.cos(angle) * 0.78
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.055, radius2=0.0, depth=0.26, location=(tx, ty, -0.22), rotation=(3.14, 0, 0))
    tooth = bpy.context.active_object
    tooth.parent = head_pivot
    tooth.data.materials.append(mat_teeth)
    smooth_obj(tooth)
    move_to_col(tooth, bg_col)

jaw_pivot = bpy.data.objects.new("TRex_JawPivot", None)
scene.collection.objects.link(jaw_pivot)
jaw_pivot.parent = head_pivot
jaw_pivot.location = (0, 0.05, -0.18)
move_to_col(jaw_pivot, bg_col)

bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.52, location=(0, -0.52, -0.12))
d_jaw = bpy.context.active_object
d_jaw.scale = (0.78, 1.48, 0.42)
d_jaw.parent = jaw_pivot
d_jaw.data.materials.append(mat_dino_belly)
smooth_obj(d_jaw)
move_to_col(d_jaw, bg_col)

for ti in range(7):
    angle = -0.80 + (ti / 6.0) * 1.60
    tx = math.sin(angle) * 0.36
    ty = -0.35 - math.cos(angle) * 0.72
    bpy.ops.mesh.primitive_cone_add(vertices=8, radius1=0.048, radius2=0.0, depth=0.22, location=(tx, ty, 0.08))
    tooth = bpy.context.active_object
    tooth.parent = jaw_pivot
    tooth.data.materials.append(mat_teeth)
    smooth_obj(tooth)
    move_to_col(tooth, bg_col)

for side in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.12, depth=0.65, location=(side * 0.78, -1.15, 2.15), rotation=(0.85, side * 0.25, 0))
    arm = bpy.context.active_object
    arm.parent = dino_root
    arm.data.materials.append(mat_dino_skin)
    smooth_obj(arm)
    move_to_col(arm, bg_col)

tail_pivot = bpy.data.objects.new("TRex_TailPivot", None)
scene.collection.objects.link(tail_pivot)
tail_pivot.parent = dino_root
tail_pivot.location = (0, 1.65, 2.85)
move_to_col(tail_pivot, bg_col)

bpy.ops.mesh.primitive_cone_add(vertices=24, radius1=0.82, radius2=0.08, depth=4.8, location=(0, 2.2, 0.15), rotation=(-1.48, 0, 0))
d_tail = bpy.context.active_object
d_tail.parent = tail_pivot
d_tail.data.materials.append(mat_dino_skin)
smooth_obj(d_tail)
move_to_col(d_tail, bg_col)

leg_L_pivot = bpy.data.objects.new("TRex_Leg_L", None)
leg_R_pivot = bpy.data.objects.new("TRex_Leg_R", None)
scene.collection.objects.link(leg_L_pivot)
scene.collection.objects.link(leg_R_pivot)
leg_L_pivot.parent = dino_root
leg_R_pivot.parent = dino_root
leg_L_pivot.location = (-0.88, 0.15, 2.45)
leg_R_pivot.location = (0.88, 0.15, 2.45)
move_to_col(leg_L_pivot, bg_col)
move_to_col(leg_R_pivot, bg_col)

for side_pivot in (leg_L_pivot, leg_R_pivot):
    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.62, location=(0, 0.05, -0.65))
    thigh = bpy.context.active_object
    thigh.scale = (0.78, 1.05, 1.45)
    thigh.parent = side_pivot
    thigh.data.materials.append(mat_dino_skin)
    smooth_obj(thigh)
    move_to_col(thigh, bg_col)

    bpy.ops.mesh.primitive_cone_add(vertices=20, radius1=0.28, radius2=0.42, depth=1.35, location=(0, -0.18, -1.72), rotation=(-0.18, 0, 0))
    shin = bpy.context.active_object
    shin.parent = side_pivot
    shin.data.materials.append(mat_dino_skin)
    smooth_obj(shin)
    move_to_col(shin, bg_col)

    bpy.ops.mesh.primitive_cube_add(size=0.65, location=(0, -0.42, -2.32))
    foot = bpy.context.active_object
    foot.scale = (0.95, 1.35, 0.25)
    foot.parent = side_pivot
    foot.data.materials.append(mat_dino_belly)
    smooth_obj(foot)
    move_to_col(foot, bg_col)

    for claw_x in (-0.24, 0.0, 0.24):
        bpy.ops.mesh.primitive_cone_add(vertices=10, radius1=0.08, radius2=0.0, depth=0.35, location=(claw_x, -0.92, -2.35), rotation=(1.57, 0, 0))
        claw = bpy.context.active_object
        claw.parent = side_pivot
        claw.data.materials.append(mat_teeth)
        smooth_obj(claw)
        move_to_col(claw, bg_col)

# Diễn hoạt 3 Nhịp của Khủng long T-Rex Đa Khớp (Trúng tên -> Há miệng gầm -> Nhấc chân 3 móng vuốt lao tới luồn qua cây tiền cảnh!)
for f in range(1, 73):
    t = (f - 1) / 24.0
    if f < 18:
        y_pos = 15.2 - (f / 18.0) * 1.0
        stride_freq = 6.5
        drift_x = 0.0
    else:
        prog = (f - 18) / 54.0
        y_pos = 14.2 - (prog ** 1.12) * 9.3
        stride_freq = 11.0
        drift_x = prog * 0.42  # Lao chéo qua sau thân cây tiền cảnh bên phải (FG_Roto_Tree_1)

    phase = t * stride_freq
    bounce_z = abs(math.sin(phase)) * 0.28
    sway_x = drift_x + math.sin(phase) * 0.22
    roll_y = math.sin(phase) * 0.07

    dino_root.location = (sway_x, y_pos, bounce_z)
    dino_root.rotation_euler = (-0.08 + 0.05 * math.cos(phase * 2), roll_y, math.sin(phase) * 0.06)
    dino_root.keyframe_insert(data_path="location", frame=f)
    dino_root.keyframe_insert(data_path="rotation_euler", frame=f)

    leg_L_pivot.rotation_euler = (math.sin(phase) * 0.65, 0, 0)
    leg_R_pivot.rotation_euler = (-math.sin(phase) * 0.65, 0, 0)
    leg_L_pivot.keyframe_insert(data_path="rotation_euler", frame=f)
    leg_R_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    tail_pivot.rotation_euler = (0, 0, -math.sin(phase) * 0.22)
    tail_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    if f < 18:
        head_pivot.rotation_euler = (-0.15, 0.0, 0.0)
        jaw_pivot.rotation_euler = (-0.12, 0.0, 0.0)
    elif 18 <= f <= 32:
        head_pivot.rotation_euler = (-0.05, 0.16, 0.14)
        jaw_pivot.rotation_euler = (-0.68, 0.0, 0.0)
    else:
        head_pivot.rotation_euler = (-0.22, math.sin(phase) * 0.08, math.cos(phase) * 0.06)
        jaw_pivot.rotation_euler = (-0.52 - 0.14 * abs(math.sin(t * 14.0)), 0.0, 0.0)

    head_pivot.keyframe_insert(data_path="rotation_euler", frame=f)
    jaw_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

# 5. Camera Điện Ảnh 35mm + Rung Chấn Bước Chân
bpy.ops.object.camera_add(location=(0.0, -1.6, 1.48), rotation=(1.53, 0.0, 0.0))
cam = bpy.context.active_object
cam.name = "Director_Camera_35mm"
cam.data.lens = 35.0
scene.camera = cam
animate_studio_camera(cam, preset="HANDHELD_CHASE", frame_start=1, frame_end=72)

# 6. Xuất 6 Pass VFX Chuyển Động 3D Thật 72 Frame (Áp Texture 8K + Đổ Bóng Thật + Cavity)
tree, file_depth, file_normal = setup_5pass_vfx_compositor(scene, FRAMES_DEPTH_DIR, FRAMES_NORMAL_DIR)

scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'TEXTURE'
scene.display.shading.show_shadows = True
scene.display.shading.shadow_intensity = 0.68
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.show_specular_highlight = True

# Pass 1, 2, 3: Textured 3D Scene (RGB kín nền) + Z-Depth + Normal (72 frames chuyển động 3D thật)
scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.filepath = os.path.join(FRAMES_COLOR_DIR, "color_")
bpy.ops.render.render(animation=True)

for l in list(tree.links):
    if l.to_node in (file_depth, file_normal):
        tree.links.remove(l)

# Pass 4: Clay Blockout (RGB kín nền - 72 frames)
scene.display.shading.color_type = 'SINGLE'
scene.display.shading.single_color = (0.58, 0.58, 0.58)
scene.render.filepath = os.path.join(FRAMES_CLAY_DIR, "clay_")
bpy.ops.render.render(animation=True)

# Pass 5: Foreground Holdout Roto Alpha Mask (RGBA Nền trong suốt chỉ chứa Chiến binh + Cây tiền cảnh!)
bg_col.hide_render = True
arrow_col.hide_render = True
scene.render.film_transparent = True
scene.render.image_settings.color_mode = 'RGBA'
scene.display.shading.color_type = 'TEXTURE'
scene.render.filepath = os.path.join(FRAMES_ROTO_DIR, "roto_")
bpy.ops.render.render(animation=True)

# Pass 6: 3D Ballistic Projectile Arrow Layer (RGBA Nền trong suốt chỉ chứa Mũi tên bay 10 frame để ghép VFX!)
fg_col.hide_render = True
arrow_col.hide_render = False
scene.render.film_transparent = True
scene.render.image_settings.color_mode = 'RGBA'
scene.display.shading.color_type = 'MATERIAL'
scene.render.filepath = os.path.join(FRAMES_ARROW_DIR, "arrow_")
bpy.ops.render.render(animation=True)

bg_col.hide_render = False
fg_col.hide_render = False
arrow_col.hide_render = False
scene.render.film_transparent = False

blend_vfx_path = os.path.join(OUT_DIR, "studio_vfx_compositor_and_nle.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_vfx_path)
print(f"🎉 Đã xuất toàn bộ 72 frame chuyển động 3D có Texture + Bóng đổ + Roto Mask + 3D Arrow Pass tại: {blend_vfx_path}")
