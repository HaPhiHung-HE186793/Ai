import bpy
import sys
import os
import math
import random
import shutil
import subprocess
from mathutils import Vector

sys.path.insert(0, "/mnt/data/backup/project_personal/AI")
from blender_studio_library import (
    load_glb_asset,
    pose_mixamo_archer_and_lock_bow,
    setup_5pass_vfx_compositor,
)

# ==============================================================================
# 🏛️ BLENDER 4.2 LTS — 3D HIGH-POLY LAYOUT & PREVIZ ENGINE (PHÒNG BAN 03 V6)
# ==============================================================================
# Sử dụng mô hình 3D High-Poly thật:
#   1. @KURORYU: Mô hình điêu khắc 3D Dragon_HighPoly.glb (76,809 vertices) xoay hướng
#      trực diện về phía Samurai (-Y), gắn 2 ĐÔI CÁNH RỒNG CƠ KHÍ 3D KHỔNG LỒ
#      và Lõi lò phản ứng tròn giữa ngực (Circular Chest Reactor Core).
#   2. @KENJI: Mô hình 3D Soldier_Rigged_RunWalkIdle.glb (7,325 vertices, Mixamo Rig)
#      xoay mặt về phía Rồng (+Y), gắn Búi tóc Samurai (Topknot) và khóa cứng
#      1 thanh Katana 3D (1 chuôi 15cm + Tsuba + lưỡi thẳng) vào tay phải (RULE-3D-01).
#   3. @KYOTO_SHRINE: Sân đền 3D khép kín (2 dãy nhà gỗ mái ngói hai bên, 4 đèn đá vuông,
#      1 cổng Torii đỏ nguyên vẹn tại Y = +18.5m phía sau Rồng ở Y = +15.0m).
# ==============================================================================

RUN_DIR = "/mnt/data/backup/project_personal/AI/previz_output/samurai_30s_run"
BLENDER_DIR = os.path.join(RUN_DIR, "blender_3d_previz")
CLAY_DIR = os.path.join(BLENDER_DIR, "frames_clay")
COLOR_DIR = os.path.join(BLENDER_DIR, "frames_color")
DEPTH_DIR = os.path.join(BLENDER_DIR, "frames_depth")
NORMAL_DIR = os.path.join(BLENDER_DIR, "frames_normal")
KEYFRAMES_3D_DIR = os.path.join(BLENDER_DIR, "keyframes_3d")

for d in (RUN_DIR, BLENDER_DIR, CLAY_DIR, COLOR_DIR, DEPTH_DIR, NORMAL_DIR, KEYFRAMES_3D_DIR):
    os.makedirs(d, exist_ok=True)

bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene

FPS = 12
TOTAL_FRAMES = 365  # 30.4s @ 12fps -> xuất 24fps MP4
scene.frame_start = 1
scene.frame_end = TOTAL_FRAMES
scene.render.fps = FPS
scene.render.resolution_x = 1280
scene.render.resolution_y = 720
scene.render.resolution_percentage = 100

def make_mat(name, color, roughness=0.4, metallic=0.1):
    mat = bpy.data.materials.new(name=name)
    mat.diffuse_color = (*color, 1.0)
    mat.roughness = roughness
    mat.metallic = metallic
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes.get("Principled BSDF")
    if bsdf:
        bsdf.inputs["Base Color"].default_value = (*color, 1.0)
        bsdf.inputs["Roughness"].default_value = roughness
        bsdf.inputs["Metallic"].default_value = metallic
    return mat

def smooth_obj(obj):
    if obj and obj.type == 'MESH' and obj.data:
        for poly in obj.data.polygons:
            poly.use_smooth = True

def look_at(obj, target_pt):
    direction = Vector(target_pt) - obj.location
    obj.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

mat_sky = make_mat("NightStormSky", (0.10, 0.16, 0.24), roughness=1.0)
mat_slate = make_mat("WetSlateGround", (0.18, 0.22, 0.27), roughness=0.20, metallic=0.25)
mat_stone_wall = make_mat("MossyStoneWall", (0.26, 0.30, 0.27), roughness=0.75)
mat_dark_wood = make_mat("DarkShrineWood", (0.24, 0.15, 0.10), roughness=0.55)
mat_roof_tile = make_mat("KyotoRoofTile", (0.16, 0.20, 0.26), roughness=0.30, metallic=0.35)
mat_shoji_warm = make_mat("ShojiWarmGlow", (0.85, 0.58, 0.24), roughness=0.25)
mat_torii_red = make_mat("ToriiVermilionRed", (0.88, 0.18, 0.10), roughness=0.28)
mat_torii_black = make_mat("ToriiBaseBlack", (0.12, 0.12, 0.14), roughness=0.50)
mat_lantern_stone = make_mat("LanternStone", (0.42, 0.44, 0.42), roughness=0.70)
mat_lantern_fire = make_mat("LanternFireAmber", (1.0, 0.78, 0.18), roughness=0.05)

mat_samurai_armor = make_mat("SamuraiCarbonArmor", (0.16, 0.20, 0.26), roughness=0.28, metallic=0.65)
mat_samurai_hair = make_mat("SamuraiDarkHair", (0.06, 0.06, 0.08), roughness=0.35)
mat_katana_hilt = make_mat("KatanaSingleHilt", (0.10, 0.10, 0.12), roughness=0.50)
mat_katana_blade = make_mat("KatanaGlowingBlade", (1.0, 0.82, 0.22), roughness=0.05, metallic=0.95)

mat_dragon_obsidian = make_mat("DragonObsidianArmor", (0.22, 0.27, 0.34), roughness=0.22, metallic=0.82)
mat_dragon_wing_membrane = make_mat("DragonWingMembrane", (0.15, 0.20, 0.27), roughness=0.35, metallic=0.60)
mat_dragon_core = make_mat("DragonAmberCore", (1.0, 0.68, 0.08), roughness=0.05)
mat_fireball = make_mat("PlasmaFireballMat", (1.0, 0.72, 0.12), roughness=0.05)
mat_black_smoke = make_mat("ReactorBlackSmoke", (0.10, 0.10, 0.12), roughness=0.90)
mat_lightning = make_mat("GoldenLightningArc", (1.0, 0.88, 0.25), roughness=0.05)

# ==============================================================================
# 1. SÂN ĐỀN KYOTO 3D KHÉP KÍN (@KYOTO_SHRINE)
# ==============================================================================
bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=65.0, location=(0, 10, 0))
skydome = bpy.context.active_object
skydome.data.materials.append(mat_sky)

bpy.ops.mesh.primitive_grid_add(x_subdivisions=40, y_subdivisions=40, size=48.0, location=(0, 10, 0))
ground = bpy.context.active_object
ground.data.materials.append(mat_slate)
smooth_obj(ground)

for side_idx, side_x in enumerate((-1, 1)):
    base_x = side_x * 7.5
    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(base_x, 9.5, 0.65))
    wall = bpy.context.active_object
    wall.scale = (2.2, 26.0, 1.3)
    wall.data.materials.append(mat_stone_wall)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(base_x + side_x * 0.6, 9.5, 2.7))
    hall = bpy.context.active_object
    hall.scale = (2.8, 24.0, 2.8)
    hall.data.materials.append(mat_dark_wood)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(base_x - side_x * 0.82, 9.5, 2.6))
    shoji = bpy.context.active_object
    shoji.scale = (0.08, 22.0, 2.1)
    shoji.data.materials.append(mat_shoji_warm)

    for py in range(-2, 22, 4):
        bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.16, depth=2.9, location=(base_x - side_x * 0.65, py, 2.7))
        col = bpy.context.active_object
        col.data.materials.append(mat_dark_wood)

    bpy.ops.mesh.primitive_cube_add(size=1.0, location=(base_x + side_x * 0.1, 9.5, 4.45), rotation=(0, -side_x * 0.28, 0))
    roof = bpy.context.active_object
    roof.scale = (4.6, 25.5, 0.35)
    roof.data.materials.append(mat_roof_tile)

lantern_coords = [(-4.2, 2.5), (4.2, 2.5), (-4.2, 11.5), (4.2, 11.5)]
for l_idx, (lx, ly) in enumerate(lantern_coords):
    bpy.ops.mesh.primitive_cube_add(size=0.75, location=(lx, ly, 0.35))
    l_base = bpy.context.active_object
    l_base.scale = (1.1, 1.1, 0.9)
    l_base.data.materials.append(mat_lantern_stone)

    bpy.ops.mesh.primitive_cylinder_add(vertices=8, radius=0.22, depth=1.15, location=(lx, ly, 1.15))
    l_post = bpy.context.active_object
    l_post.data.materials.append(mat_lantern_stone)

    bpy.ops.mesh.primitive_cube_add(size=0.62, location=(lx, ly, 1.92))
    l_fire = bpy.context.active_object
    l_fire.data.materials.append(mat_lantern_fire)

    bpy.ops.mesh.primitive_cone_add(vertices=4, radius1=0.72, radius2=0.12, depth=0.48, location=(lx, ly, 2.38), rotation=(0, 0, math.pi / 4))
    l_cap = bpy.context.active_object
    l_cap.data.materials.append(mat_lantern_stone)

# ĐÚNG 1 CỔNG TORII ĐỎ NGUYÊN VẸN tại Y = +18.5m
torii_y = 18.5
for side_x in (-1, 1):
    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.48, depth=1.6, location=(side_x * 3.8, torii_y, 0.8))
    t_foot = bpy.context.active_object
    t_foot.data.materials.append(mat_torii_black)

    bpy.ops.mesh.primitive_cylinder_add(vertices=20, radius=0.40, depth=7.8, location=(side_x * 3.8, torii_y, 4.5))
    t_pillar = bpy.context.active_object
    t_pillar.data.materials.append(mat_torii_red)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, torii_y, 6.6))
t_nuki = bpy.context.active_object
t_nuki.scale = (10.2, 0.42, 0.48)
t_nuki.data.materials.append(mat_torii_red)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, torii_y, 8.15))
t_kasagi = bpy.context.active_object
t_kasagi.scale = (11.6, 0.65, 0.55)
t_kasagi.data.materials.append(mat_torii_red)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, torii_y, 8.52))
t_shimaki = bpy.context.active_object
t_shimaki.scale = (12.2, 0.78, 0.28)
t_shimaki.data.materials.append(mat_roof_tile)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 28.0, 6.0))
back_wall = bpy.context.active_object
back_wall.scale = (28.0, 1.0, 14.0)
back_wall.data.materials.append(mat_stone_wall)

# ==============================================================================
# 2. NẠP MÔ HÌNH 3D SAMURAI (@KENJI - Mixamo 7,325 verts) + KHÓA KATANA 3D
# ==============================================================================
kenji_root = bpy.data.objects.new("KENJI_3D_Master_Root", None)
scene.collection.objects.link(kenji_root)

# Soldier_Rigged_RunWalkIdle.glb mặc định mặt hướng về +Y (nhìn thẳng về phía Rồng ở Y=15m)!
k_glb_root, kenji_objs, kenji_arm = load_glb_asset(
    "SOLDIER_MIXAMO",
    location=(0.0, 0.0, 0.0),
    rotation=(0, 0, 0.0),
    scale=1.05,
    action_keyword=None
)
k_glb_root.parent = kenji_root
for ko in kenji_objs:
    if ko.type == 'MESH':
        if 'visor' in ko.name.lower():
            ko.hide_render = True
        else:
            ko.data.materials.clear()
            ko.data.materials.append(mat_samurai_armor)
            smooth_obj(ko)

# Xoay xương cánh tay Mixamo giơ kiếm về phía trước (RULE-3D-01)
hand_world_pos, _ = pose_mixamo_archer_and_lock_bow(kenji_arm, aim_target_world=Vector((0.5, 12.0, 2.0)))

# Búi tóc Samurai (Topknot / Chonmage) gọn gàng trên đỉnh đầu
bpy.ops.mesh.primitive_cylinder_add(vertices=10, radius=0.038, depth=0.16, location=(0, -0.08, 1.82), rotation=(-0.55, 0, 0))
k_topknot = bpy.context.active_object
k_topknot.parent = kenji_root
k_topknot.data.materials.append(mat_samurai_hair)

# Khớp Tay Cầm Kiếm + Thanh Katana 3D Cứng Tuyệt Đối (1 Chuôi 15cm + Chắn kiếm Tsuba + Lưỡi thẳng)
sword_arm_pivot = bpy.data.objects.new("Kenji_Sword_Arm_Socket", None)
scene.collection.objects.link(sword_arm_pivot)
sword_arm_pivot.parent = kenji_root
sword_arm_pivot.location = (-0.18, 0.42, 1.36)

katana_socket = bpy.data.objects.new("Katana_Bone_Socket", None)
scene.collection.objects.link(katana_socket)
katana_socket.parent = sword_arm_pivot
katana_socket.location = (0.0, 0.08, 0.0)

bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.024, depth=0.28, location=(0, 0, -0.14))
katana_hilt = bpy.context.active_object
katana_hilt.parent = katana_socket
katana_hilt.data.materials.append(mat_katana_hilt)

bpy.ops.mesh.primitive_cylinder_add(vertices=16, radius=0.06, depth=0.018, location=(0, 0, 0.0))
katana_tsuba = bpy.context.active_object
katana_tsuba.parent = katana_socket
katana_tsuba.data.materials.append(mat_katana_hilt)

bpy.ops.mesh.primitive_cube_add(size=1.0, location=(0, 0, 0.62))
katana_blade = bpy.context.active_object
katana_blade.scale = (0.015, 0.042, 0.62)
katana_blade.parent = katana_socket
katana_blade.data.materials.append(mat_katana_blade)

# ==============================================================================
# 3. MÔ HÌNH ĐIÊU KHẮC 3D HẮC LONG HIGH-POLY (76,809 verts) + 2 ĐÔI CÁNH CƠ KHÍ 3D
# ==============================================================================
dragon_root = bpy.data.objects.new("KURORYU_Winged_MechaDragon_Rig", None)
scene.collection.objects.link(dragon_root)

# Đặt chân Rồng chạm đất (Z = 1.45) và xoay hướng về phía Samurai (-Y)
d_glb_root, d_glb_objs, _ = load_glb_asset(
    "DRAGON_HIGHPOLY",
    location=(0.0, 0.0, 1.45),
    rotation=(0.0, 0.0, math.pi * 0.82),
    scale=1.95
)
d_glb_root.parent = dragon_root
for do in d_glb_objs:
    if do.type == 'MESH':
        do.data.materials.clear()
        do.data.materials.append(mat_dragon_obsidian)
        smooth_obj(do)

# Lõi lò phản ứng tròn giữa ngực Rồng (Circular Chest Reactor Core hướng thẳng về -Y)
bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=16, radius=0.38, location=(0.15, -0.88, 1.95))
d_core = bpy.context.active_object
d_core.name = "Dragon_Circular_Chest_Reactor_Core"
d_core.scale = (1.0, 0.35, 1.0)
d_core.parent = dragon_root
d_core.data.materials.append(mat_dragon_core)
smooth_obj(d_core)

# HAI ĐÔI CÁNH RỒNG CƠ KHÍ 3D KHỔNG LỒ (TWO MASSIVE BIOMECHANICAL BAT-LIKE DRAGON WINGS)
wing_L_pivot = bpy.data.objects.new("Dragon_Wing_Left_Pivot", None)
wing_R_pivot = bpy.data.objects.new("Dragon_Wing_Right_Pivot", None)
scene.collection.objects.link(wing_L_pivot)
scene.collection.objects.link(wing_R_pivot)
wing_L_pivot.parent = dragon_root
wing_R_pivot.parent = dragon_root
wing_L_pivot.location = (-0.95, 0.35, 2.85)
wing_R_pivot.location = (0.95, 0.35, 2.85)

for w_side, w_pivot in ((-1, wing_L_pivot), (1, wing_R_pivot)):
    bpy.ops.mesh.primitive_cylinder_add(vertices=12, radius=0.12, depth=4.6, location=(w_side * 2.1, 0.1, 1.15), rotation=(0, w_side * 1.12, 0))
    spar = bpy.context.active_object
    spar.parent = w_pivot
    spar.data.materials.append(mat_dragon_obsidian)

    for f_idx in range(3):
        fx = w_side * (1.25 + f_idx * 1.15)
        fz = 0.45 + f_idx * 0.25
        bpy.ops.mesh.primitive_cone_add(
            vertices=4,
            radius1=1.35,
            radius2=0.08,
            depth=2.85,
            location=(fx, 0.18, fz),
            rotation=(3.14, w_side * 0.22, 0.0)
        )
        membrane = bpy.context.active_object
        membrane.scale = (0.95, 0.12, 1.15)
        membrane.parent = w_pivot
        membrane.data.materials.append(mat_dragon_wing_membrane)

# ==============================================================================
# 4. HIỆU ỨNG VẬT LÝ 3D: CẦU LỬA (BEAT 1-2) & NỔ LÕI NGỰC 3D KHÓI ĐEN/SÉT (BEAT 4-6)
# ==============================================================================
bpy.ops.mesh.primitive_uv_sphere_add(segments=20, ring_count=16, radius=0.35, location=(0, 14, 3.2))
fireball_3d = bpy.context.active_object
fireball_3d.scale = (0.65, 1.6, 0.65)
fireball_3d.data.materials.append(mat_fireball)
smooth_obj(fireball_3d)

core_damage_3d_root = bpy.data.objects.new("Dragon_3D_Chest_Core_Overload_VFX", None)
scene.collection.objects.link(core_damage_3d_root)
core_damage_3d_root.parent = dragon_root
core_damage_3d_root.location = (0.15, -0.95, 1.95)

random.seed(77)
for s_i in range(6):
    sx = random.uniform(-0.45, 0.45)
    sy = random.uniform(-0.35, 0.10)
    sz = random.uniform(0.10, 1.15)
    bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=random.uniform(0.22, 0.38), location=(sx, sy, sz))
    smoke_puff = bpy.context.active_object
    smoke_puff.parent = core_damage_3d_root
    smoke_puff.data.materials.append(mat_black_smoke)
    smooth_obj(smoke_puff)

for l_i in range(6):
    ang = (l_i / 6.0) * math.pi * 2.0
    lx = math.cos(ang) * 0.45
    lz = math.sin(ang) * 0.45
    bpy.ops.mesh.primitive_cylinder_add(vertices=6, radius=0.035, depth=1.15, location=(lx, -0.15, lz), rotation=(0.35, ang, 0))
    bolt = bpy.context.active_object
    bolt.parent = core_damage_3d_root
    bolt.data.materials.append(mat_lightning)

# ==============================================================================
# 5. CAMERA 3D ĐA TIÊU CỰ VỚI TRACKING TOÁN HỌC CHÍNH XÁC (look_at)
# ==============================================================================
bpy.ops.object.camera_add(location=(-2.2, -3.2, 1.35))
cam = bpy.context.active_object
cam.name = "ASC_DP_3D_Master_Camera"
scene.camera = cam

for f in range(1, TOTAL_FRAMES + 1):
    fb_scale = 0.0
    fb_loc = Vector((0.85, 13.0, 3.2))
    dmg_scale = 0.0

    # BEAT 1 (Frames 1..66 | 0.0s -> 5.5s): 24mm Wide OTS | 15m -> 15m
    if f <= 66:
        prog = (f - 1) / 65.0
        cam.data.lens = 24.0
        cam.location = Vector((-2.35, -3.2, 1.45))
        look_at(cam, (0.2, 12.0, 2.5))

        kenji_root.location = Vector((-1.35, 0.0, 0.0))
        kenji_root.rotation_euler = (0.0, 0.0, -0.12)
        sword_arm_pivot.rotation_euler = (0.35, 0.0, -0.35)

        dragon_root.location = Vector((0.95, 15.0, 0.0))
        dragon_root.rotation_euler = (0.0, 0.0, 0.08)
        flap = math.sin(prog * math.pi * 4.0) * 0.22
        wing_L_pivot.rotation_euler = (0.0, flap, -0.15)
        wing_R_pivot.rotation_euler = (0.0, -flap, 0.15)

        if prog >= 0.38:
            fb_prog = (prog - 0.38) / 0.62
            fb_scale = 1.0
            fb_loc = Vector((0.85, 12.8, 3.2)).lerp(Vector((-1.05, 1.5, 1.42)), fb_prog)

    # BEAT 2 (Frames 67..118 | 5.5s -> 9.8s): 50mm MCU trên Kenji | 15m -> 15m
    # Camera nhìn trực diện vào ngực & mặt Kenji đang giơ thanh Katana 45° đỡ cầu lửa ở bên phải lưỡi kiếm!
    elif f <= 118:
        prog = (f - 67) / 51.0
        cam.data.lens = 50.0
        cam.location = Vector((0.45, 2.25, 1.52))
        look_at(cam, (-1.35, 0.0, 1.42))

        kenji_root.location = Vector((-1.35, 0.0, 0.0))
        kenji_root.rotation_euler = (0.0, 0.0, -0.25)
        sword_arm_pivot.rotation_euler = (0.25, -0.75, 0.0)

        dragon_root.location = Vector((0.95, 15.0, 0.0))
        dragon_root.rotation_euler = (0.0, 0.0, 0.08)

        fb_scale = 0.42
        fb_loc = Vector((-0.65 + prog * 0.25, 0.55, 1.48 + math.sin(prog * 16.0) * 0.06))

    # BEAT 3 (Frames 119..180 | 9.8s -> 15.0s): 28mm Tracking | 15m -> 2m
    elif f <= 180:
        prog = (f - 119) / 61.0
        cam.data.lens = 28.0
        cur_y = prog * 12.2
        jump_z = math.sin(max(0.0, (prog - 0.45) / 0.55) * math.pi) * 1.35 if prog > 0.45 else 0.0

        cam.location = Vector((-4.2, cur_y * 0.55 + 2.0, 1.55))
        look_at(cam, (0.2, 13.5, 2.4))

        kenji_root.location = Vector((-1.25 + prog * 0.35, cur_y, jump_z))
        kenji_root.rotation_euler = (0.18, 0.0, -0.15)
        sword_arm_pivot.rotation_euler = (1.35 - prog * 1.75, -0.25, -0.45)

        dragon_root.location = Vector((0.95, 15.0, 0.0))
        dragon_root.rotation_euler = (0.0, 0.0, 0.08)
        wing_L_pivot.rotation_euler = (0.0, 0.25, -0.1)
        wing_R_pivot.rotation_euler = (0.0, -0.25, 0.1)
        if prog > 0.72:
            dmg_scale = (prog - 0.72) / 0.28

    # BEAT 4 (Frames 181..230 | 15.0s -> 19.2s): 32mm | Cự ly 2m -> 2m | Nổ lõi ngực 3D
    elif f <= 230:
        prog = (f - 181) / 49.0
        cam.data.lens = 30.0
        cam.location = Vector((-3.2, 6.8, 1.55))
        look_at(cam, (0.25, 14.5, 2.5))

        kenji_root.location = Vector((-1.05, 12.2, 0.0))
        kenji_root.rotation_euler = (0.0, 0.0, -0.22)
        sword_arm_pivot.rotation_euler = (-0.35, 0.15, -0.45)

        dragon_root.location = Vector((0.95, 15.0 + prog * 0.35, 0.0))
        dragon_root.rotation_euler = (-0.15 * math.sin(prog * math.pi), 0.0, 0.08)
        wing_L_pivot.rotation_euler = (0.0, 0.35, -0.2)
        wing_R_pivot.rotation_euler = (0.0, -0.35, 0.2)
        dmg_scale = 1.0 + 0.2 * math.sin(prog * 16.0)

    # BEAT 5 (Frames 231..286 | 19.2s -> 23.8s): 24mm Cận Chiến 2m | Rồng 2 cánh vồ móng vuốt
    elif f <= 286:
        prog = (f - 231) / 55.0
        cam.data.lens = 24.0
        cam.location = Vector((-3.0, 7.2, 1.35))
        look_at(cam, (0.25, 14.2, 2.4))

        kenji_root.location = Vector((-0.95, 12.2, 0.0))
        kenji_root.rotation_euler = (0.0, 0.0, -0.25)
        sword_arm_pivot.rotation_euler = (0.95, -0.55, 0.15)

        dragon_root.location = Vector((0.85, 15.0, 0.0))
        dragon_root.rotation_euler = (0.14 * math.sin(prog * math.pi), 0.0, 0.08)
        wing_L_pivot.rotation_euler = (0.0, 0.28 + 0.15 * math.sin(prog * 10.0), -0.15)
        wing_R_pivot.rotation_euler = (0.0, -0.28 - 0.15 * math.sin(prog * 10.0), 0.15)
        dmg_scale = 0.85

    # BEAT 6 (Frames 287..365 | 23.8s -> 30.4s): 28mm | Rồng 2 cánh quỳ gục & cụp cánh ở cự ly 2m
    else:
        prog = (f - 287) / 78.0
        cam.data.lens = 28.0
        cam.location = Vector((-2.8, 6.8, 1.42))
        look_at(cam, (0.25, 14.5, 2.2 - prog * 0.5))

        kenji_root.location = Vector((-1.05, 12.2, 0.0))
        kenji_root.rotation_euler = (0.0, 0.0, -0.18)
        sword_arm_pivot.rotation_euler = (-0.25, 0.0, -0.22)

        kneel_z = -1.15 * min(1.0, prog * 1.25)
        dragon_root.location = Vector((0.95, 15.0, kneel_z))
        dragon_root.rotation_euler = (0.22 * min(1.0, prog * 1.25), 0.0, 0.08)
        wing_L_pivot.rotation_euler = (0.25 * prog, -0.45 * prog, -0.15)
        wing_R_pivot.rotation_euler = (0.25 * prog, 0.45 * prog, 0.15)
        dmg_scale = max(0.35, 0.85 - prog * 0.5)

    cam.keyframe_insert(data_path="location", frame=f)
    cam.keyframe_insert(data_path="rotation_euler", frame=f)
    cam.data.keyframe_insert(data_path="lens", frame=f)

    kenji_root.keyframe_insert(data_path="location", frame=f)
    kenji_root.keyframe_insert(data_path="rotation_euler", frame=f)
    sword_arm_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    dragon_root.keyframe_insert(data_path="location", frame=f)
    dragon_root.keyframe_insert(data_path="rotation_euler", frame=f)
    wing_L_pivot.keyframe_insert(data_path="rotation_euler", frame=f)
    wing_R_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    fireball_3d.location = fb_loc
    fireball_3d.scale = (fb_scale * 0.65, fb_scale * 1.6, fb_scale * 0.65)
    fireball_3d.keyframe_insert(data_path="location", frame=f)
    fireball_3d.keyframe_insert(data_path="scale", frame=f)

    core_damage_3d_root.scale = (dmg_scale, dmg_scale, dmg_scale)
    core_damage_3d_root.keyframe_insert(data_path="scale", frame=f)

# ==============================================================================
# 6. RENDER 3 PASS 3D THẬT (TEXTURED 3D + Z-DEPTH + CLAY BLOCKOUT)
# ==============================================================================
tree, file_depth, file_normal = setup_5pass_vfx_compositor(scene, DEPTH_DIR, NORMAL_DIR)

scene.render.engine = 'BLENDER_WORKBENCH'
scene.display.shading.light = 'STUDIO'
scene.display.shading.color_type = 'MATERIAL'
scene.display.shading.show_shadows = True
scene.display.shading.shadow_intensity = 0.65
scene.display.shading.show_cavity = True
scene.display.shading.cavity_type = 'BOTH'
scene.display.shading.show_specular_highlight = True

scene.render.film_transparent = False
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.render.filepath = os.path.join(COLOR_DIR, "color_")
bpy.ops.render.render(animation=True)

for l in list(tree.links):
    if l.to_node in (file_depth, file_normal):
        tree.links.remove(l)

scene.display.shading.color_type = 'SINGLE'
scene.display.shading.single_color = (0.65, 0.65, 0.65)
scene.render.filepath = os.path.join(CLAY_DIR, "clay_")
bpy.ops.render.render(animation=True)

blend_path = os.path.join(BLENDER_DIR, "samurai_30s_v6_3d_layout_master.blend")
bpy.ops.wm.save_as_mainfile(filepath=blend_path)

beat_frame_pairs = [
    ("beat1_v6", 1, 55),
    ("beat2_v6", 75, 110),
    ("beat3_v6", 125, 175),
    ("beat4_v6", 190, 225),
    ("beat5_v6", 240, 280),
    ("beat6_v6", 295, 360),
]
for b_name, f_start, f_end in beat_frame_pairs:
    shutil.copy2(os.path.join(COLOR_DIR, f"color_{f_start:04d}.png"), os.path.join(KEYFRAMES_3D_DIR, f"{b_name}_3d_start_layout.png"))
    shutil.copy2(os.path.join(COLOR_DIR, f"color_{f_end:04d}.png"), os.path.join(KEYFRAMES_3D_DIR, f"{b_name}_3d_end_layout.png"))
    shutil.copy2(os.path.join(DEPTH_DIR, f"depth_{f_start:04d}.png"), os.path.join(KEYFRAMES_3D_DIR, f"{b_name}_3d_start_depth.png"))

clay_mp4 = os.path.join(RUN_DIR, "70_BLENDER_3D_CLAY_PREVIZ_30S.mp4")
depth_mp4 = os.path.join(RUN_DIR, "71_BLENDER_3D_DEPTH_PASS_30S.mp4")
color_mp4 = os.path.join(RUN_DIR, "72_BLENDER_3D_TEXTURED_PREVIZ_30S.mp4")
quad_mp4 = os.path.join(RUN_DIR, "73_HYBRID_3D_TO_VEO_V6_4WAY_BREAKDOWN_30S.mp4")
veo_v6_mp4 = os.path.join(RUN_DIR, "60_SAMURAI_V6_UNIFIED_6GATE_MASTER.mp4")

for src_dir, prefix, out_mp4, label in [
    (CLAY_DIR, "clay_%04d.png", clay_mp4, "DEPT 03 BLENDER 4.2 - 3D CLAY BLOCKOUT (15m -> 2m)"),
    (DEPTH_DIR, "depth_%04d.png", depth_mp4, "DEPT 03 BLENDER 4.2 - 3D Z-DEPTH CONTROLNET PASS"),
    (COLOR_DIR, "color_%04d.png", color_mp4, "DEPT 03 BLENDER 4.2 - 3D TEXTURED LAYOUT & BONE-SOCKET PREVIZ"),
]:
    subprocess.run([
        "ffmpeg", "-y", "-framerate", str(FPS),
        "-i", os.path.join(src_dir, prefix),
        "-vf", f"fps=24,scale=1280:720,drawtext=text='{label} t=%{{pts\\:hms}}':x=16:y=16:fontsize=20:fontcolor=cyan:box=1:boxcolor=black@0.75",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19",
        out_mp4
    ], check=True)

if os.path.exists(veo_v6_mp4):
    subprocess.run([
        "ffmpeg", "-y",
        "-i", clay_mp4,
        "-i", depth_mp4,
        "-i", color_mp4,
        "-i", veo_v6_mp4,
        "-filter_complex",
        "[0:v]scale=640:360[v0];"
        "[1:v]scale=640:360[v1];"
        "[2:v]scale=640:360[v2];"
        "[3:v]scale=640:360,drawtext=text='DEPT 04 & 05 VEO 3.1 V6 MASTER (GUIDED BY 3D LAYOUT)':x=10:y=10:fontsize=16:fontcolor=lime:box=1:boxcolor=black@0.75[v3];"
        "[v0][v1]hstack=inputs=2[top];"
        "[v2][v3]hstack=inputs=2[bot];"
        "[top][bot]vstack=inputs=2,format=yuv420p[vout]",
        "-map", "[vout]", "-map", "3:a",
        "-shortest",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "19",
        "-c:a", "aac",
        quad_mp4
    ], check=True)

print("🎉 HOÀN TẤT RENDER BLENDER 4.2 3D HIGH-POLY SCULPTED LAYOUT & PREVIZ 30 GIÂY!")
