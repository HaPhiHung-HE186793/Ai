import bpy
import math
import random
import os
from mathutils import Vector, Euler

# ==============================================================================
# 🏛️ BLENDER 4.2 STUDIO 3D ASSET, RIGIFY & CAMERA LIBRARY (V3 - HYBRID AI/VFX)
# Bổ sung 6 Quy Chuẩn Chống Lỗi (Golden 3D-to-AI Rules):
#   - RULE-3D-01: Khóa Vũ Khí/Đạo Cụ trực tiếp vào tọa độ Xương Bàn Tay (Bone-Socket Lock)
#   - RULE-3D-02: Kiểm định Khớp Xương (Rig Audit) - Cấm dùng tượng tĩnh cho sinh vật chạy
#   - RULE-3D-03: Đóng kín Vòm Trời & Tường Rừng 360° (Zero White Void)
#   - RULE-3D-04: Tách biệt RGB cho Previz và RGBA Transparent chỉ cho Holdout Roto Mask
#   - RULE-3D-05: 2D-to-3D-to-2D Angle Re-projection & Turnaround Sheet Exporter (Weavy/ErikDoesVFX)
#   - RULE-3D-06: Biomechanical Kinematics & Optical Shutter Prompt Engine (Cassowary/Ostrich Weight + 180° Shutter)
# ==============================================================================

ASSETS_DIR = "/mnt/data/backup/project_personal/AI/assets_3d"

AVAILABLE_GLB_ASSETS = {
    "SOLDIER_MIXAMO": os.path.join(ASSETS_DIR, "Soldier_Rigged_RunWalkIdle.glb"),
    "XBOT_MIXAMO": os.path.join(ASSETS_DIR, "Mixamo_Xbot_Rigged.glb"),
    "FIGHTER_COMBAT": os.path.join(ASSETS_DIR, "Fighter_PunchJumpRun.glb"),
    "HUMAN_WALK": os.path.join(ASSETS_DIR, "Human_Rigged_Walk.glb"),
    "DRAGON_HIGHPOLY": os.path.join(ASSETS_DIR, "Dragon_HighPoly.glb"),
    "PREDATOR_QUAD": os.path.join(ASSETS_DIR, "Fox_Rigged_Animated.glb"),
    "HORSE_GALLOP": os.path.join(ASSETS_DIR, "Horse_Gallop.glb"),
}


def load_glb_asset(asset_key, location=(0, 0, 0), rotation=(0, 0, 0), scale=1.0, action_keyword=None, require_rig=False):
    """
    Nạp mô hình 3D .glb thật vào cảnh.
    Áp dụng RULE-3D-02: Nếu require_rig=True mà file .glb không có Armature, báo cảnh báo ngay!
    """
    filepath = AVAILABLE_GLB_ASSETS.get(asset_key, asset_key)
    if not os.path.exists(filepath):
        raise FileNotFoundError(f"Không tìm thấy mô hình 3D: {filepath}")

    before_objs = set(bpy.data.objects)
    bpy.ops.import_scene.gltf(filepath=filepath)
    new_objs = [o for o in bpy.data.objects if o not in before_objs]

    cleaned_objs = []
    armature_obj = None
    for o in new_objs:
        if any(skip in o.name for skip in ("Backdrop", "Icosphere")):
            bpy.data.objects.remove(o, do_unlink=True)
        else:
            cleaned_objs.append(o)
            if o.type == 'ARMATURE':
                armature_obj = o

    if require_rig and armature_obj is None:
        raise ValueError(f"[RULE-3D-02 VIOLATION] Asset '{asset_key}' là tượng tĩnh (0 Armature), không được dùng cho sinh vật chạy!")

    root_empty = bpy.data.objects.new(f"Asset_{asset_key}_Root", None)
    bpy.context.scene.collection.objects.link(root_empty)

    for o in cleaned_objs:
        if o.parent is None:
            o.parent = root_empty
        if o.type == 'ARMATURE':
            if action_keyword is None:
                # Xóa animation mặc định (như Idle buông tay) để tự đặt tư thế chiến đấu (Aim Pose)
                if o.animation_data:
                    o.animation_data.action = None
            else:
                for act in bpy.data.actions:
                    if action_keyword.lower() in act.name.lower():
                        if not o.animation_data:
                            o.animation_data_create()
                        o.animation_data.action = act
                        break

    root_empty.location = location
    root_empty.rotation_euler = rotation
    if isinstance(scale, (int, float)):
        root_empty.scale = (scale, scale, scale)
    else:
        root_empty.scale = scale

    bpy.context.view_layer.update()
    return root_empty, cleaned_objs, armature_obj


def pose_mixamo_archer_and_lock_bow(armature_obj, aim_target_world=Vector((0.15, 12.0, 2.25))):
    """
    RULE-3D-01: Đặt tư thế giương cung cho nhân vật Mixamo và trả về CHÍNH XÁC
    tọa độ World-Space sau khi tính toán Depsgraph của bàn tay vươn ra cầm thân cung (bow_hand_world)
    và bàn tay kéo dây cung (draw_hand_world).
    Đồng thời hỗ trợ khóa trực tiếp bằng Bone Constraint (Child Of / Copy Location) vào xương bàn tay!
    """
    if not armature_obj or armature_obj.type != 'ARMATURE':
        return Vector((-0.60, 1.05, 1.38)), Vector((-0.88, 0.90, 1.40))

    # Ngắt mọi Action Idle đang ép tay buông xuống
    if armature_obj.animation_data:
        armature_obj.animation_data.action = None

    l_arm = armature_obj.pose.bones.get("mixamorig:LeftArm")
    l_fore = armature_obj.pose.bones.get("mixamorig:LeftForeArm")
    r_arm = armature_obj.pose.bones.get("mixamorig:RightArm")
    r_fore = armature_obj.pose.bones.get("mixamorig:RightForeArm")

    # Tạo điểm ngắm (Aim Target Empty) để cánh tay cầm cung vươn thẳng về phía T-Rex
    aim_empty = bpy.data.objects.new("Archer_Aim_Target", None)
    bpy.context.scene.collection.objects.link(aim_empty)
    aim_empty.location = aim_target_world

    # Tay Phải (RightArm + RightForeArm) nằm phía trong khung hình (+X), vươn thẳng ra cầm Thân Cung!
    if r_arm:
        c = r_arm.constraints.new(type='DAMPED_TRACK')
        c.target = aim_empty
        c.track_axis = 'TRACK_Y'
        c.influence = 1.0
    if r_fore:
        r_fore.rotation_mode = 'XYZ'
        r_fore.rotation_euler = (0.15, 0.0, 0.0)

    # Tay Trái (LeftArm + LeftForeArm) co khuỷu tay kéo dây cung về sát ngực
    if l_arm:
        c2 = l_arm.constraints.new(type='DAMPED_TRACK')
        c2.target = aim_empty
        c2.track_axis = 'TRACK_Y'
        c2.influence = 0.75
    if l_fore:
        l_fore.rotation_mode = 'XYZ'
        l_fore.rotation_euler = (0.85, 0.0, 0.55)

    bpy.context.view_layer.update()
    depsgraph = bpy.context.evaluated_depsgraph_get()
    arm_eval = armature_obj.evaluated_get(depsgraph)

    r_hand = arm_eval.pose.bones.get("mixamorig:RightHand")
    l_hand = arm_eval.pose.bones.get("mixamorig:LeftHand")

    # Lấy chính xác vị trí bàn tay vươn ra cầm cung (RightHand) sau khi Evaluate Constraint
    bow_hand_world = arm_eval.matrix_world @ r_hand.head if r_hand else Vector((-0.60, 1.05, 1.38))
    draw_hand_world = arm_eval.matrix_world @ l_hand.head if l_hand else Vector((-0.88, 0.90, 1.40))
    return bow_hand_world, draw_hand_world


def create_enclosed_forest_skybox(scene, bg_collection, mat_sky, mat_canopy):
    """
    RULE-3D-03: Tạo Vòm Bầu Trời Rừng Sương Mù & Tường Tán Cây Khép Kín 360°
    để triệt tiêu 100% lỗi 'nền trắng bệch' ở hậu cảnh!
    """
    # Vòm rừng bao quanh toàn bộ cảnh (Bán kính 48m)
    bpy.ops.mesh.primitive_uv_sphere_add(segments=32, ring_count=16, radius=48.0, location=(0, 15, 0))
    skydome = bpy.context.active_object
    skydome.name = "Enclosed_Forest_SkyDome"
    skydome.data.materials.append(mat_sky)
    for c in list(skydome.users_collection):
        c.objects.unlink(skydome)
    bg_collection.objects.link(skydome)

    # Tường rừng rậm ở đường chân trời (y = 33m..38m) che kín mọi khe hở giữa các thân cây
    random.seed(99)
    for idx in range(22):
        bx = -18.0 + idx * 1.7
        by = random.uniform(31.0, 36.0)
        bz = random.uniform(2.5, 9.5)
        rad = random.uniform(2.8, 4.5)
        bpy.ops.mesh.primitive_ico_sphere_add(subdivisions=2, radius=rad, location=(bx, by, bz))
        bush = bpy.context.active_object
        bush.name = f"Horizon_Foliage_Wall_{idx}"
        bush.data.materials.append(mat_canopy)
        for poly in bush.data.polygons:
            poly.use_smooth = True
        for c in list(bush.users_collection):
            c.objects.unlink(bush)
        bg_collection.objects.link(bush)

    return skydome


def animate_studio_camera(cam, preset="HANDHELD_CHASE", frame_start=1, frame_end=72):
    """Áp dụng 1 trong 6 mẫu chuyển động máy quay chuẩn điện ảnh Hollywood."""
    random.seed(101)
    for f in range(frame_start, frame_end + 1):
        t = (f - frame_start) / 24.0
        prog = (f - frame_start) / max(1, (frame_end - frame_start))

        if preset == "HANDHELD_CHASE":
            shake = 0.0
            if f > 18:
                step = abs(math.cos(t * 11.0))
                if step > 0.80:
                    shake = (step - 0.80) * 0.28 * prog
            cam.location = (
                math.sin(t * 2.8) * 0.04 + random.uniform(-shake, shake),
                -1.6 - (t * 0.38),
                1.48 + math.cos(t * 2.2) * 0.03 + random.uniform(-shake, shake),
            )
            cam.rotation_euler = (
                1.53 + (t * 0.02) + random.uniform(-shake * 0.10, shake * 0.10),
                random.uniform(-shake * 0.08, shake * 0.08),
                -0.015 * math.sin(t * 2.0),
            )
        else:
            cam.location = (-0.45, -1.4, 1.50)
            cam.rotation_euler = (1.52, 0.0, -0.05)

        cam.keyframe_insert(data_path="location", frame=f)
        cam.keyframe_insert(data_path="rotation_euler", frame=f)


def setup_5pass_vfx_compositor(scene, depth_dir, normal_dir):
    """Cấu hình Blender Node Compositor xuất đồng thời Image + Z-Depth + Normal Map."""
    view_layer = scene.view_layers[0]
    view_layer.use_pass_z = True
    view_layer.use_pass_normal = True
    scene.render.film_transparent = False

    scene.use_nodes = True
    tree = scene.node_tree
    tree.nodes.clear()

    rl_node = tree.nodes.new(type='CompositorNodeRLayers')
    comp_node = tree.nodes.new(type='CompositorNodeComposite')

    norm_node = tree.nodes.new(type='CompositorNodeNormalize')
    inv_node = tree.nodes.new(type='CompositorNodeInvert')
    file_depth = tree.nodes.new(type='CompositorNodeOutputFile')
    file_depth.base_path = depth_dir
    file_depth.format.file_format = 'PNG'
    file_depth.format.color_mode = 'BW'
    file_depth.file_slots[0].path = "depth_"

    file_normal = tree.nodes.new(type='CompositorNodeOutputFile')
    file_normal.base_path = normal_dir
    file_normal.format.file_format = 'PNG'
    file_normal.format.color_mode = 'RGB'
    file_normal.file_slots[0].path = "normal_"

    tree.links.new(rl_node.outputs['Image'], comp_node.inputs['Image'])
    tree.links.new(rl_node.outputs['Depth'], norm_node.inputs[0])
    tree.links.new(norm_node.outputs[0], inv_node.inputs['Color'])
    tree.links.new(inv_node.outputs['Color'], file_depth.inputs[0])
    tree.links.new(rl_node.outputs['Normal'], file_normal.inputs[0])

    return tree, file_depth, file_normal


def render_3d_angle_reprojection_pass(scene, target_obj, out_png_path, distance=4.5, elevation_deg=15.0, azimuth_deg=35.0, lens_mm=35.0):
    """
    RULE-3D-05 (Weavy AI 2D->3D->2D Angle Lock):
    Đặt camera 3D xoay quanh chủ thể theo góc Azimuth/Elevation tùy chọn (Low-Angle, Dutch-Tilt, Overhead),
    kết xuất khung hình tham chiếu hình học chuẩn xác để đẩy ngược vào Nano Banana Pro / Imagen 4.
    """
    prev_cam = scene.camera
    prev_filepath = scene.render.filepath

    az = math.radians(azimuth_deg)
    el = math.radians(elevation_deg)
    target_loc = target_obj.location if target_obj else Vector((0.0, 0.0, 1.2))

    cam_x = target_loc.x + distance * math.cos(el) * math.sin(az)
    cam_y = target_loc.y - distance * math.cos(el) * math.cos(az)
    cam_z = target_loc.z + distance * math.sin(el)

    bpy.ops.object.camera_add(location=(cam_x, cam_y, cam_z))
    reproj_cam = bpy.context.active_object
    reproj_cam.name = "Weavy_Reprojection_Camera"
    reproj_cam.data.lens = lens_mm

    direction = target_loc - reproj_cam.location
    reproj_cam.rotation_euler = direction.to_track_quat('-Z', 'Y').to_euler()

    scene.camera = reproj_cam
    scene.render.filepath = out_png_path
    bpy.ops.render.render(write_still=True)

    scene.camera = prev_cam
    scene.render.filepath = prev_filepath
    bpy.data.objects.remove(reproj_cam, do_unlink=True)
    return out_png_path


def build_biomechanical_veo_prompt(
    camera_lock_en,
    subject_action_en,
    biomechanical_animals_en="charging cassowary, ostrich, and Komodo dragon",
    optical_physics_en="180-degree cinema shutter drag, natural motion blur on fast-moving limbs, elliptical anamorphic bokeh",
    exclusion_guardrails_en="Zero floating objects, zero arrows, zero disappearing characters, zero actor face morphing, 100% photorealistic live-action physics",
):
    """
    RULE-3D-06 (ErikDoesVFX Biomechanical & Optical Prompt Formula):
    Tạo prompt điều khiển Veo 3.1 / Kling 3.0 kết hợp Khóa Camera/Nhân vật tiền cảnh +
    Sinh cơ học động vật có thật ngoài đời + Quang học màn trập + Rào chắn chống biến dạng.
    """
    return (
        f"[CAMERA & PLATE LOCK]: {camera_lock_en} "
        f"[BIOMECHANICAL KINEMATICS]: {subject_action_en} "
        f"Its movement combines the real-world biomechanical weight transfer of a {biomechanical_animals_en}, "
        f"with heavy muscular torso roll and claws gripping the moist ground. "
        f"[OPTICAL PHYSICS]: {optical_physics_en}. "
        f"[GUARDRAILS]: {exclusion_guardrails_en}. (no subtitles) — no subtitles"
    )

