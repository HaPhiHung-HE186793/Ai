import bpy
import sys
import os
import math
import random
from mathutils import Vector

sys.path.insert(0, "/mnt/data/backup/project_personal/AI")

OUT_DIR = "/mnt/data/backup/project_personal/AI/previz_output"
TEX_DIR = os.path.join(OUT_DIR, "textures")
SHOT2_CLAY_DIR = os.path.join(OUT_DIR, "frames_shot2_clay")
SHOT2_VFX_DIR = os.path.join(OUT_DIR, "frames_shot2_arrow_rgba")
SHOT3_CLAY_DIR = os.path.join(OUT_DIR, "frames_shot3_lowangle_clay")

for d in (SHOT2_CLAY_DIR, SHOT2_VFX_DIR, SHOT3_CLAY_DIR):
    os.makedirs(d, exist_ok=True)


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


# ==============================================================================
# 🎯 SHOT 2 (ERIKDOESVFX "THE ARROW" FIX — V2 SEAMLESS):
# Cận cảnh 85mm Mũi tên 3D găm sâu vào rìa thân cây cổ thụ (x=0.38m),
# đầu mũi tên ngập vào trong lớp vỏ cây, đuôi tên rung bật tắt dần (Damped
# Harmonic Shaft Oscillation) và bắn tung 26 mảnh vỏ cây/dăm gỗ có Texture thật!
# ==============================================================================
def render_shot2_arrow_tree_impact():
    bpy.ops.wm.read_factory_settings(use_empty=True)
    scene = bpy.context.scene
    scene.frame_start = 1
    scene.frame_end = 44  # 1.83s @ 24fps
    scene.render.fps = 24
    scene.render.resolution_x = 1280
    scene.render.resolution_y = 720
    scene.render.resolution_percentage = 100

    mat_bark = make_mat("BarkMat", (0.20, 0.13, 0.08), roughness=0.88, tex_file="tex_bark.jpg")
    mat_splinter = make_mat("WoodSplinterMat", (0.42, 0.27, 0.14), roughness=0.75, tex_file="tex_bark.jpg")
    mat_shaft = make_mat("WoodShaftMat", (0.34, 0.20, 0.09), roughness=0.40, tex_file="tex_bark.jpg")
    mat_head = make_mat("BroadheadSteelMat", (0.52, 0.56, 0.60), roughness=0.25, metallic=0.88)
    mat_fletch = make_mat("FeatherFletchMat", (0.72, 0.16, 0.10), roughness=0.55)
    mat_bg = make_mat("ForestBgMat", (0.07, 0.13, 0.09), roughness=1.0, tex_file="tex_forest_sky.jpg")

    env_col = bpy.data.collections.new("Shot2_Tree_Env")
    vfx_col = bpy.data.collections.new("Shot2_Arrow_And_Splinters_VFX")
    scene.collection.children.link(env_col)
    scene.collection.children.link(vfx_col)

    def to_col(obj, col):
        for c in list(obj.users_collection):
            c.objects.unlink(obj)
        col.objects.link(obj)

    bpy.ops.mesh.primitive_uv_sphere_add(segments=24, ring_count=12, radius=25.0, location=(0, 5, 1.5))
    dome = bpy.context.active_object
    dome.data.materials.append(mat_bg)
    to_col(dome, env_col)

    # Thân cây cổ thụ góc phải khớp chính xác với vị trí thân cây 8K (x=0.35m..1.25m)
    bpy.ops.mesh.primitive_cylinder_add(vertices=48, radius=0.62, depth=6.0, location=(0.82, 2.15, 1.50))
    tree = bpy.context.active_object
    tree.name = "Target_Redwood_Trunk"
    tree.data.materials.append(mat_bark)
    smooth_obj(tree)
    to_col(tree, env_col)

    # Điểm găm mũi tên nằm đúng vào phần thịt vỏ cây bên phải (x=0.38, y=2.05, z=1.50)
    impact_pt = Vector((0.38, 2.05, 1.50))
    arrow_pivot = bpy.data.objects.new("Arrow_Impact_Pivot", None)
    scene.collection.objects.link(arrow_pivot)
    to_col(arrow_pivot, vfx_col)

    # Thân tên gỗ mảnh chuẩn tỉ lệ thực (radius=0.011m, dài 0.78m)
    bpy.ops.mesh.primitive_cylinder_add(
        vertices=16, radius=0.011, depth=0.78,
        location=(-0.39, 0.0, 0.0),
        rotation=(0.0, 1.5708, 0.0)
    )
    shaft = bpy.context.active_object
    shaft.parent = arrow_pivot
    shaft.data.materials.append(mat_shaft)
    smooth_obj(shaft)
    to_col(shaft, vfx_col)

    # Đầu mũi tên thép vừa chạm ngập vào lớp vỏ cây (location=(-0.01, 0, 0))
    bpy.ops.mesh.primitive_cone_add(
        vertices=12, radius1=0.022, radius2=0.0, depth=0.09,
        location=(-0.01, 0.0, 0.0),
        rotation=(0.0, 1.5708, 0.0)
    )
    tip = bpy.context.active_object
    tip.parent = arrow_pivot
    tip.data.materials.append(mat_head)
    smooth_obj(tip)
    to_col(tip, vfx_col)

    # 3 cánh lông vũ ở đuôi tên
    for fi in range(3):
        ang = fi * (2.0 * math.pi / 3.0)
        fy = math.sin(ang) * 0.018
        fz = math.cos(ang) * 0.018
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=(-0.71, fy, fz))
        fletch = bpy.context.active_object
        fletch.scale = (0.11, 0.003, 0.022)
        fletch.rotation_euler = (ang, 0.06, 0.0)
        fletch.parent = arrow_pivot
        fletch.data.materials.append(mat_fletch)
        to_col(fletch, vfx_col)

    start_pt = Vector((-2.10, 1.85, 1.58))
    base_rot = (0.03, -0.04, -0.10)

    for f in range(1, 45):
        if f < 7:
            prog = (f - 1) / 6.0
            arrow_pivot.location = start_pt.lerp(impact_pt, prog)
            arrow_pivot.rotation_euler = base_rot
        else:
            dt = (f - 7) / 24.0
            arrow_pivot.location = impact_pt
            # Dao động tắt dần chuẩn vật lý của thân tên gỗ sau khi cắm phập vào cây
            vib_z = math.sin(dt * 62.0) * math.exp(-5.8 * dt) * 0.095
            vib_y = math.cos(dt * 48.0) * math.exp(-6.2 * dt) * 0.065
            arrow_pivot.rotation_euler = (base_rot[0], base_rot[1] + vib_y, base_rot[2] + vib_z)

        arrow_pivot.keyframe_insert(data_path="location", frame=f)
        arrow_pivot.keyframe_insert(data_path="rotation_euler", frame=f)

    # 26 Mảnh dăm gỗ & vỏ cây dẹt sắc cạnh (Jagged Bark Chips) bắn tung tóe!
    random.seed(88)
    for si in range(26):
        bpy.ops.mesh.primitive_cube_add(size=1.0)
        sp = bpy.context.active_object
        sp.name = f"Bark_Chip_{si}"
        # Tạo hình dăm gỗ mỏng, dài, sắc cạnh thay vì khối nón to
        sx = random.uniform(0.018, 0.055)
        sy = random.uniform(0.004, 0.010)
        sz = random.uniform(0.008, 0.022)
        sp.data.materials.append(mat_splinter if si % 2 == 0 else mat_bark)
        to_col(sp, vfx_col)

        vx = random.uniform(-2.2, -0.25)
        vy = random.uniform(-1.1, 0.6)
        vz = random.uniform(0.2, 1.9)
        rx = random.uniform(-16.0, 16.0)
        ry = random.uniform(-16.0, 16.0)
        rz = random.uniform(-16.0, 16.0)

        for f in range(1, 45):
            if f < 7:
                sp.location = impact_pt
                sp.scale = (0.0, 0.0, 0.0)
                sp.rotation_euler = (0.0, 0.0, 0.0)
            else:
                dt = (f - 7) / 24.0
                sp.scale = (sx, sy, sz)
                sp.location = (
                    impact_pt.x - 0.08 + vx * dt,
                    impact_pt.y + vy * dt,
                    impact_pt.z + vz * dt - 0.5 * 7.5 * (dt ** 2)
                )
                sp.rotation_euler = (rx * dt, ry * dt, rz * dt)

            sp.keyframe_insert(data_path="location", frame=f)
            sp.keyframe_insert(data_path="rotation_euler", frame=f)
            sp.keyframe_insert(data_path="scale", frame=f)

    bpy.ops.object.camera_add(location=(-0.15, 0.15, 1.50), rotation=(1.5708, 0.0, -0.08))
    cam = bpy.context.active_object
    cam.data.lens = 85.0
    scene.camera = cam

    for f in range(1, 45):
        shk = 0.0
        if 7 <= f <= 15:
            shk = math.exp(-(f - 7) * 0.48) * 0.018
        cam.location = (
            -0.15 + math.sin(f * 1.9) * shk,
            0.15 - (f / 44.0) * 0.10,
            1.50 + math.cos(f * 2.5) * shk
        )
        cam.keyframe_insert(data_path="location", frame=f)

    scene.render.engine = 'BLENDER_WORKBENCH'
    scene.display.shading.light = 'STUDIO'
    scene.display.shading.show_shadows = True
    scene.display.shading.shadow_intensity = 0.72
    scene.display.shading.show_cavity = True
    scene.display.shading.cavity_type = 'BOTH'
    scene.display.shading.show_specular_highlight = True

    # 1. Xuất Clay Previz cho Shot 2
    scene.render.film_transparent = False
    scene.render.image_settings.file_format = 'PNG'
    scene.render.image_settings.color_mode = 'RGB'
    scene.display.shading.color_type = 'SINGLE'
    scene.display.shading.single_color = (0.58, 0.58, 0.58)
    scene.render.filepath = os.path.join(SHOT2_CLAY_DIR, "shot2_clay_")
    bpy.ops.render.render(animation=True)

    # 2. Xuất Lớp VFX RGBA Có Texture Gỗ & Bóng Đổ Thật
    env_col.hide_render = True
    scene.render.film_transparent = True
    scene.render.image_settings.color_mode = 'RGBA'
    scene.display.shading.color_type = 'TEXTURE'
    scene.render.filepath = os.path.join(SHOT2_VFX_DIR, "shot2_vfx_")
    bpy.ops.render.render(animation=True)


if __name__ == "__main__":
    render_shot2_arrow_tree_impact()
    print("✅ Đã kết xuất lại Shot 2 (Seamless Textured Arrow + 26 Jagged Bark Chips)!")
