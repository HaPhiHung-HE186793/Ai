#!/usr/bin/env python3
"""
🎬 BÀN DỰNG ĐA GÓC MÁY (MULTI-SHOT DIRECTOR'S SEQUENCE BUILDER — V3)
Ghép 4 Góc máy Điện ảnh (Chuẩn ErikDoesVFX & @taion_aiwork Pacing Map):
  - SHOT 1 (0.0s - 2.2s | 35mm Wide OTS): Thợ săn giương cung & bắn Mũi tên 3D Ballistic.
  - SHOT 2 (2.2s - 4.0s | 85mm Macro Insert): Cận cảnh Mũi tên 3D cắm phập vào thân cây 8K,
    đuôi tên rung bần bật (Damped Harmonic Oscillation) & nổ tung 22 mảnh dăm gỗ 3D!
  - SHOT 3 (4.0s - 6.0s | 24mm Low-Angle Stomp): Góc thấp sát mặt đất khi chân 3 móng vuốt
    của T-Rex đạp nổ tung bùn đất & dương xỉ theo sinh cơ học đà điểu/Cassowary.
  - SHOT 4 (6.0s - 8.5s | 50mm Apex Climax): T-Rex áp sát sau thân cây cổ thụ 8K (Alpha Stencil Roto)
    và gầm rú trực diện trước người thợ săn đứng vững ở tiền cảnh.
"""

import os
import shutil
import subprocess

OUT_DIR = "/mnt/data/backup/project_personal/AI/previz_output"
CLAY_DIR = os.path.join(OUT_DIR, "frames_clay")
ROTO_DIR = os.path.join(OUT_DIR, "frames_fg_roto_mask")
ARROW_DIR = os.path.join(OUT_DIR, "frames_arrow_rgba")
SHOT2_CLAY_DIR = os.path.join(OUT_DIR, "frames_shot2_clay")
SHOT2_VFX_DIR = os.path.join(OUT_DIR, "frames_shot2_arrow_rgba")
SHOT3_CLAY_DIR = os.path.join(OUT_DIR, "frames_shot3_lowangle_clay")

ARTIFACT_DIR = "/home/user/.gemini/antigravity/brain/092f7d00-e0a7-4cec-be77-f8cff1234933"

ai_clean_jpg = os.path.join(OUT_DIR, "ai_neural_frame_0001_clean.jpg")
veo_clean_mp4 = os.path.join(OUT_DIR, "veo31_neural_video_v2_clean.mp4")

shot1_master = os.path.join(OUT_DIR, "shot1_ots_release.mp4")
shot2_master = os.path.join(OUT_DIR, "shot2_macro_arrow_splinter.mp4")
shot3_master = os.path.join(OUT_DIR, "shot3_lowangle_charge.mp4")
shot4_master = os.path.join(OUT_DIR, "shot4_apex_roar_climax.mp4")

shot1_previz = os.path.join(OUT_DIR, "shot1_previz.mp4")
shot2_previz = os.path.join(OUT_DIR, "shot2_previz.mp4")
shot3_previz = os.path.join(OUT_DIR, "shot3_previz.mp4")
shot4_previz = os.path.join(OUT_DIR, "shot4_previz.mp4")

master_multishot_mp4 = os.path.join(OUT_DIR, "05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4")
breakdown_multishot_mp4 = os.path.join(OUT_DIR, "06_MULTISHOT_3D_VS_FINAL_BREAKDOWN.mp4")
storyboard_audit_png = os.path.join(OUT_DIR, "09_MULTISHOT_STORYBOARD_AUDIT_SHEET.png")

DI_GRADE_AND_SCOPE = (
    "colorbalance=rh=0.04:gh=0.02:bh=-0.03:rs=-0.04:gs=0.01:bs=0.05,"
    "eq=contrast=1.10:saturation=1.12,"
    "noise=alls=3:allf=t+u,"
    "vignette=PI/6,"
    "drawbox=x=0:y=0:w=iw:h=48:color=black@1:t=fill,"
    "drawbox=x=0:y=ih-48:w=iw:h=48:color=black@1:t=fill,"
    "setsar=1:1,format=yuv420p"
)


def build_shot1():
    print("🎬 [1/4] Đang dựng SHOT 1 (0.0s - 2.2s | 35mm OTS Standoff & 3D Ballistic Arrow Release)...")
    filter_s1 = (
        "[0:v]trim=start=0.0:end=2.2,setpts=PTS-STARTPTS,fps=24,scale=1280:720,format=rgba[veo_s1];"
        "[1:v]scale=1280:720,format=rgba,crop=340:720:940:0,alphaextract,boxblur=6:2[tree_alpha];"
        "[2:v]scale=1280:720,crop=340:720:940:0,format=rgb24[ai_tree_rgb];"
        "[ai_tree_rgb][tree_alpha]alphamerge[real_8k_fg_tree];"
        "[veo_s1][real_8k_fg_tree]overlay=x=940:y=0:format=auto[with_roto];"
        "[3:v]scale=1280:720,format=rgba,boxblur=2:1[arrow_3d];"
        f"[with_roto][arrow_3d]overlay=0:0:format=auto,{DI_GRADE_AND_SCOPE}[vout]"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-i", veo_clean_mp4,
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(ROTO_DIR, "roto_%04d.png"),
        "-loop", "1", "-t", "2.2", "-i", ai_clean_jpg,
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(ARROW_DIR, "arrow_%04d.png"),
        "-filter_complex", filter_s1,
        "-map", "[vout]", "-t", "2.2",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        shot1_master
    ], check=True)

    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(CLAY_DIR, "clay_%04d.png"),
        "-t", "2.2", "-vf", "scale=1280:720,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        shot1_previz
    ], check=True)


def build_shot2():
    print("🎯 [2/4] Đang dựng SHOT 2 (2.2s - 4.0s | 85mm Macro Arrow Tree Impact + 26 Bark Chips + Shaft Vibration)...")
    # Dùng Mặt nạ Alpha Stencil từ Roto Mask 3D (roto_0001.png) làm mềm biên 16px (boxblur=16:2)
    # để tách riêng Thân cây cổ thụ rêu phong 8K sắc nét ở bên phải trên nền rừng mờ Bokeh 85mm (0% vết cắt dọc!)
    roto_frame01 = os.path.join(ROTO_DIR, "roto_0001.png")
    filter_s2 = (
        # Nền rừng 85mm Bokeh mịn màng (zoom vào góc phải của tấm ảnh 8K)
        "[0:v]scale=1920:1080,crop=1280:720:640:180,boxblur=16:2,eq=brightness=-0.05[bg_bokeh];"
        # Bản 8K sắc nét cùng góc độ
        "[0:v]scale=1920:1080,crop=1280:720:640:180,unsharp=5:5:1.1:5:5:0.0,format=rgb24[sharp_full];"
        # Trích xuất mặt nạ Alpha của riêng thân cây bên phải từ Roto 3D và làm mềm biên 18px để hòa quyện 100% không vết cắt
        "[2:v]scale=1920:1080,crop=1280:720:640:180,format=rgba,"
        "drawbox=x=0:y=0:w=620:h=720:color=black@1:t=fill,alphaextract,boxblur=18:2[tree_mask];"
        "[sharp_full][tree_mask]alphamerge[sharp_tree_rgba];"
        "[bg_bokeh][sharp_tree_rgba]overlay=0:0:format=auto[plate_composite];"
        # Rung chấn máy quay (Impact Camera Shake) đúng khoảnh khắc mũi tên cắm vào vỏ cây (t=0.24s..0.58s)
        "[plate_composite]scale=1320:744,"
        "crop=1280:720:'20+if(between(t,0.24,0.58),14*sin(t*95)*exp(-6*(t-0.24)),0)':'12+if(between(t,0.24,0.58),10*cos(t*110)*exp(-6*(t-0.24)),0)'[shaken_plate];"
        # Bóng đổ tiếp xúc (Contact Shadow) của mũi tên lên vỏ cây
        "[1:v]scale=1280:720,format=rgba,colorchannelmixer=rr=0:gg=0:bb=0:aa=0.65,boxblur=5:2[arrow_shadow];"
        "[shaken_plate][arrow_shadow]overlay=x=8:y=12:format=auto[with_shadow];"
        # Đè lớp Mũi tên 3D có Texture gỗ rung bần bật + 26 mảnh dăm gỗ văng tung tóe
        "[1:v]scale=1280:720,format=rgba[arrow_vfx];"
        "[with_shadow][arrow_vfx]overlay=0:0:format=auto,"
        "eq=brightness='if(between(t,0.24,0.33),0.08,0)':eval=frame,"
        f"{DI_GRADE_AND_SCOPE}[vout]"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-loop", "1", "-t", "1.83", "-i", ai_clean_jpg,
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(SHOT2_VFX_DIR, "shot2_vfx_%04d.png"),
        "-loop", "1", "-t", "1.83", "-i", roto_frame01,
        "-filter_complex", filter_s2,
        "-map", "[vout]", "-t", "1.83",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        shot2_master
    ], check=True)

    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", "24", "-start_number", "1", "-i", os.path.join(SHOT2_CLAY_DIR, "shot2_clay_%04d.png"),
        "-t", "1.83", "-vf", "scale=1280:720,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        shot2_previz
    ], check=True)


def build_shot3():
    print("🦖 [3/4] Đang dựng SHOT 3 (4.0s - 6.0s | 24mm Tight Low-Angle Biomechanical Foot Stomp & Mud Explosion)...")
    # Cắt cận cảnh góc thấp tập trung hoàn toàn vào đôi chân 3 móng vuốt và cơ thể T-Rex đạp nổ tung bùn đất (loại bỏ thợ săn ở rìa trái để chuyển cảnh chuẩn ngữ pháp dựng phim)
    filter_s3 = (
        "[0:v]trim=start=2.1:end=4.1,setpts=PTS-STARTPTS,fps=24,"
        "scale=2200:1238,crop=1280:720:'520+10*sin(t*22)':'280+12*abs(cos(t*11))',"
        f"{DI_GRADE_AND_SCOPE}[vout]"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-i", veo_clean_mp4,
        "-filter_complex", filter_s3,
        "-map", "[vout]", "-t", "2.0",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        shot3_master
    ], check=True)

    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", "24", "-start_number", "18", "-i", os.path.join(SHOT3_CLAY_DIR, "shot3_clay_%04d.png"),
        "-t", "2.0", "-vf", "scale=1280:720,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        shot3_previz
    ], check=True)


def build_shot4():
    print("🔥 [4/4] Đang dựng SHOT 4 (6.0s - 8.5s | 50mm Apex Jaws Roar Climax + 8K Alpha Stencil Roto)...")
    filter_s4 = (
        "[0:v]trim=start=4.6:end=7.1,setpts=PTS-STARTPTS,fps=24,scale=1280:720,format=rgba[veo_s4];"
        "[1:v]scale=1280:720,format=rgba,crop=340:720:940:0,alphaextract,boxblur=6:2[tree_alpha];"
        "[2:v]scale=1280:720,crop=340:720:940:0,format=rgb24[ai_tree_rgb];"
        "[ai_tree_rgb][tree_alpha]alphamerge[real_8k_fg_tree];"
        f"[veo_s4][real_8k_fg_tree]overlay=x=940:y=0:format=auto,{DI_GRADE_AND_SCOPE}[vout]"
    )
    subprocess.run([
        "ffmpeg", "-y",
        "-i", veo_clean_mp4,
        "-framerate", "24", "-start_number", "13", "-i", os.path.join(ROTO_DIR, "roto_%04d.png"),
        "-loop", "1", "-t", "2.5", "-i", ai_clean_jpg,
        "-filter_complex", filter_s4,
        "-map", "[vout]", "-t", "2.5",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        shot4_master
    ], check=True)

    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", "24", "-start_number", "13", "-i", os.path.join(ROTO_DIR, "roto_%04d.png"),
        "-t", "2.5", "-vf", "scale=1280:720,format=yuv420p",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        shot4_previz
    ], check=True)


def assemble_master_and_breakdown():
    print("🎞️ Đang nối 4 Shot thành Phim Ngắn Đa Góc Máy Hoàn Chỉnh (05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4)...")
    # Thiết kế Âm thanh 4 Lớp (Multi-Shot Sound Design):
    # - Shot 1 (t=0.4s): Tiếng bật dây cung & mũi tên xé gió
    # - Shot 2 (t=2.45s): Tiếng mũi tên đâm phập vào gỗ + dăm gỗ vỡ + tiếng rung thân tên (185Hz)
    # - Shot 3 (t=4.0s..6.0s): Tiếng bước chân khủng long 46Hz LFE dồn dập
    # - Shot 4 (t=6.0s..8.5s): Tiếng gầm T-Rex trầm hùng (95Hz + 190Hz)
    audio_expr = (
        "0.35*sin(2*PI*(620+700*t)*t)*exp(-7*(t-0.35))*between(t,0.35,0.85) + "
        "0.55*sin(2*PI*145*(t-2.44))*exp(-16*(t-2.44))*between(t,2.44,2.85) + "
        "0.28*sin(2*PI*58*(t-2.48))*exp(-4.5*(t-2.48))*between(t,2.48,3.80) + "
        "0.42*sin(2*PI*46*t)*exp(-4.2*mod(t,0.45))*between(t,4.0,8.5) + "
        "0.32*sin(2*PI*(112-12*(t-6.0))*t)*between(t,6.0,8.4)"
    )

    subprocess.run([
        "ffmpeg", "-y",
        "-i", shot1_master,
        "-i", shot2_master,
        "-i", shot3_master,
        "-i", shot4_master,
        "-f", "lavfi", "-t", "8.53", "-i", f"aevalsrc='{audio_expr}':s=48000:c=stereo",
        "-filter_complex",
        "[0:v]setsar=1:1[v0];[1:v]setsar=1:1[v1];[2:v]setsar=1:1[v2];[3:v]setsar=1:1[v3];"
        "[v0][v1][v2][v3]concat=n=4:v=1:a=0[vcat];"
        "[4:a]lowpass=f=1600,alimiter=limit=0.95[aout]",
        "-map", "[vcat]", "-map", "[aout]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        master_multishot_mp4
    ], check=True)

    print("🎬 Đang xuất Video Split-Screen Breakdown: 3D Previz/VFX Pass vs. Final Hybrid Master (06_MULTISHOT_3D_VS_FINAL_BREAKDOWN.mp4)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", shot1_previz,
        "-i", shot2_previz,
        "-i", shot3_previz,
        "-i", shot4_previz,
        "-i", master_multishot_mp4,
        "-filter_complex",
        "[0:v]setsar=1:1[p0];[1:v]setsar=1:1[p1];[2:v]setsar=1:1[p2];[3:v]setsar=1:1[p3];"
        "[p0][p1][p2][p3]concat=n=4:v=1:a=0,scale=640:360,setsar=1:1[left_3d];"
        "[4:v]scale=640:360,setsar=1:1[right_final];"
        "[left_3d][right_final]hstack=inputs=2,format=yuv420p[vout]",
        "-map", "[vout]", "-map", "4:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "18",
        "-c:a", "copy",
        breakdown_multishot_mp4
    ], check=True)

    print("🖼️ Đang xuất Bảng Storyboard 4 Shot Đối Chiếu 3D vs. Final (09_MULTISHOT_STORYBOARD_AUDIT_SHEET.png)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-ss", "0.5", "-i", shot1_previz,
        "-ss", "0.4", "-i", shot2_previz,
        "-ss", "0.8", "-i", shot3_previz,
        "-ss", "1.2", "-i", shot4_previz,
        "-ss", "0.5", "-i", shot1_master,
        "-ss", "0.4", "-i", shot2_master,
        "-ss", "0.8", "-i", shot3_master,
        "-ss", "1.2", "-i", shot4_master,
        "-filter_complex",
        "[0:v]scale=480:270,setsar=1:1[p1];[1:v]scale=480:270,setsar=1:1[p2];[2:v]scale=480:270,setsar=1:1[p3];[3:v]scale=480:270,setsar=1:1[p4];"
        "[4:v]scale=480:270,setsar=1:1[m1];[5:v]scale=480:270,setsar=1:1[m2];[6:v]scale=480:270,setsar=1:1[m3];[7:v]scale=480:270,setsar=1:1[m4];"
        "[p1][p2][p3][p4]hstack=inputs=4[row_previz];"
        "[m1][m2][m3][m4]hstack=inputs=4[row_master];"
        "[row_previz][row_master]vstack=inputs=2[out]",
        "-map", "[out]", "-frames:v", "1", "-update", "1",
        storyboard_audit_png
    ], check=True)

    if os.path.exists(ARTIFACT_DIR):
        shutil.copy2(master_multishot_mp4, os.path.join(ARTIFACT_DIR, "05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4"))
        shutil.copy2(breakdown_multishot_mp4, os.path.join(ARTIFACT_DIR, "06_MULTISHOT_3D_VS_FINAL_BREAKDOWN.mp4"))
        shutil.copy2(storyboard_audit_png, os.path.join(ARTIFACT_DIR, "09_MULTISHOT_STORYBOARD_AUDIT_SHEET.png"))


if __name__ == "__main__":
    build_shot1()
    build_shot2()
    build_shot3()
    build_shot4()
    assemble_master_and_breakdown()
    print("🎉 Hoàn tất 100% Bản Dựng Phim Ngắn 4 Góc Máy (Multi-Shot Director's Sequence)!")
