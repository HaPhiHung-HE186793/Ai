#!/usr/bin/env python3
"""
⚖️ BÀN DỰNG ĐỐI CHIẾU TRỰC TIẾP: 100% THUẦN BLENDER 4.2 (NO VEO) vs. HYBRID AI VEO 3.1
Xuất 3 tài sản kiểm định:
  1. 10_PURE_BLENDER_NO_VEO_MASTER.mp4: Phim ngắn 4 Góc máy làm 100% bằng Blender 4.2 (0% AI Video Veo).
  2. 11_PURE_BLENDER_VS_AI_VEO_COMPARISON.mp4: Video Split-Screen so sánh trực tiếp Pure Blender (Trái) vs. AI Veo 3.1 (Phải).
  3. 12_BLENDER_VS_VEO_4SHOT_AUDIT_SHEET.png: Bảng đối chiếu 4 Shot (Hàng trên: Pure Blender | Hàng dưới: AI Veo 3.1).
"""

import os
import shutil
import subprocess

OUT_DIR = "/mnt/data/backup/project_personal/AI/previz_output"
PURE_S1_DIR = os.path.join(OUT_DIR, "pure_blender_s1")
PURE_S2_DIR = os.path.join(OUT_DIR, "pure_blender_s2")
PURE_S3_DIR = os.path.join(OUT_DIR, "pure_blender_s3")
PURE_S4_DIR = os.path.join(OUT_DIR, "pure_blender_s4")

ARTIFACT_DIR = "/home/user/.gemini/antigravity/brain/092f7d00-e0a7-4cec-be77-f8cff1234933"

pure_s1_mp4 = os.path.join(OUT_DIR, "pure_s1.mp4")
pure_s2_mp4 = os.path.join(OUT_DIR, "pure_s2.mp4")
pure_s3_mp4 = os.path.join(OUT_DIR, "pure_s3.mp4")
pure_s4_mp4 = os.path.join(OUT_DIR, "pure_s4.mp4")

veo_s1_mp4 = os.path.join(OUT_DIR, "shot1_ots_release.mp4")
veo_s2_mp4 = os.path.join(OUT_DIR, "shot2_macro_arrow_splinter.mp4")
veo_s3_mp4 = os.path.join(OUT_DIR, "shot3_lowangle_charge.mp4")
veo_s4_mp4 = os.path.join(OUT_DIR, "shot4_apex_roar_climax.mp4")

pure_master_mp4 = os.path.join(OUT_DIR, "10_PURE_BLENDER_NO_VEO_MASTER.mp4")
veo_master_mp4 = os.path.join(OUT_DIR, "05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4")
comparison_mp4 = os.path.join(OUT_DIR, "11_PURE_BLENDER_VS_AI_VEO_COMPARISON.mp4")
audit_sheet_png = os.path.join(OUT_DIR, "12_BLENDER_VS_VEO_4SHOT_AUDIT_SHEET.png")

DI_GRADE_AND_SCOPE = (
    "scale=1280:720,"
    "colorbalance=rh=0.03:gh=0.03:bh=-0.02:rs=-0.03:gs=0.02:bs=0.04,"
    "eq=contrast=1.14:saturation=1.18:brightness=0.03,"
    "unsharp=5:5:0.8:5:5:0.0,"
    "noise=alls=3:allf=t+u,"
    "vignette=PI/6,"
    "drawbox=x=0:y=0:w=iw:h=48:color=black@1:t=fill,"
    "drawbox=x=0:y=ih-48:w=iw:h=48:color=black@1:t=fill,"
    "setsar=1:1,format=yuv420p"
)


def encode_pure_shot(img_pattern, start_num, duration_s, out_mp4):
    subprocess.run([
        "ffmpeg", "-y",
        "-framerate", "24", "-start_number", str(start_num),
        "-i", img_pattern,
        "-t", str(duration_s),
        "-vf", DI_GRADE_AND_SCOPE,
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        out_mp4
    ], check=True)


def main():
    print("🎬 [1/3] Đang đóng gói 4 Shot Thuần Blender 4.2 (0% AI Video Veo) với DI Color Grade & 2.39:1 Scope...")
    encode_pure_shot(os.path.join(PURE_S1_DIR, "s1_%04d.png"), 1, 2.2, pure_s1_mp4)
    encode_pure_shot(os.path.join(PURE_S2_DIR, "s2_%04d.png"), 1, 1.83, pure_s2_mp4)
    encode_pure_shot(os.path.join(PURE_S3_DIR, "s3_%04d.png"), 48, 2.0, pure_s3_mp4)
    encode_pure_shot(os.path.join(PURE_S4_DIR, "s4_%04d.png"), 102, 2.5, pure_s4_mp4)

    audio_expr = (
        "0.35*sin(2*PI*(620+700*t)*t)*exp(-7*(t-0.35))*between(t,0.35,0.85) + "
        "0.55*sin(2*PI*145*(t-2.44))*exp(-16*(t-2.44))*between(t,2.44,2.85) + "
        "0.28*sin(2*PI*58*(t-2.48))*exp(-4.5*(t-2.48))*between(t,2.48,3.80) + "
        "0.42*sin(2*PI*46*t)*exp(-4.2*mod(t,0.45))*between(t,4.0,8.5) + "
        "0.32*sin(2*PI*(112-12*(t-6.0))*t)*between(t,6.0,8.4)"
    )

    subprocess.run([
        "ffmpeg", "-y",
        "-i", pure_s1_mp4,
        "-i", pure_s2_mp4,
        "-i", pure_s3_mp4,
        "-i", pure_s4_mp4,
        "-f", "lavfi", "-t", "8.53", "-i", f"aevalsrc='{audio_expr}':s=48000:c=stereo",
        "-filter_complex",
        "[0:v]setsar=1:1[v0];[1:v]setsar=1:1[v1];[2:v]setsar=1:1[v2];[3:v]setsar=1:1[v3];"
        "[v0][v1][v2][v3]concat=n=4:v=1:a=0[vcat];"
        "[4:a]lowpass=f=1600,alimiter=limit=0.95[aout]",
        "-map", "[vcat]", "-map", "[aout]",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "aac", "-b:a", "192k",
        pure_master_mp4
    ], check=True)

    print("⚖️ [2/3] Đang xuất Video Đối Chiếu Song Song: Pure Blender 4.2 (Trái) vs. Hybrid AI Veo 3.1 (Phải)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-i", pure_master_mp4,
        "-i", veo_master_mp4,
        "-filter_complex",
        "[0:v]scale=640:360,setsar=1:1[left_blender];"
        "[1:v]scale=640:360,setsar=1:1[right_veo];"
        "[left_blender][right_veo]hstack=inputs=2,format=yuv420p[vout]",
        "-map", "[vout]", "-map", "1:a",
        "-c:v", "libx264", "-pix_fmt", "yuv420p", "-crf", "17",
        "-c:a", "copy",
        comparison_mp4
    ], check=True)

    print("🖼️ [3/3] Đang xuất Bảng Kiểm Định 4 Shot: Pure Blender 4.2 (Hàng trên) vs. AI Veo 3.1 (Hàng dưới)...")
    subprocess.run([
        "ffmpeg", "-y",
        "-ss", "0.5", "-i", pure_s1_mp4,
        "-ss", "0.4", "-i", pure_s2_mp4,
        "-ss", "0.8", "-i", pure_s3_mp4,
        "-ss", "1.2", "-i", pure_s4_mp4,
        "-ss", "0.5", "-i", veo_s1_mp4,
        "-ss", "0.4", "-i", veo_s2_mp4,
        "-ss", "0.8", "-i", veo_s3_mp4,
        "-ss", "1.2", "-i", veo_s4_mp4,
        "-filter_complex",
        "[0:v]scale=480:270,setsar=1:1[b1];[1:v]scale=480:270,setsar=1:1[b2];[2:v]scale=480:270,setsar=1:1[b3];[3:v]scale=480:270,setsar=1:1[b4];"
        "[4:v]scale=480:270,setsar=1:1[v1];[5:v]scale=480:270,setsar=1:1[v2];[6:v]scale=480:270,setsar=1:1[v3];[7:v]scale=480:270,setsar=1:1[v4];"
        "[b1][b2][b3][b4]hstack=inputs=4[row_blender];"
        "[v1][v2][v3][v4]hstack=inputs=4[row_veo];"
        "[row_blender][row_veo]vstack=inputs=2[out]",
        "-map", "[out]", "-frames:v", "1", "-update", "1",
        audit_sheet_png
    ], check=True)

    if os.path.exists(ARTIFACT_DIR):
        shutil.copy2(pure_master_mp4, os.path.join(ARTIFACT_DIR, "10_PURE_BLENDER_NO_VEO_MASTER.mp4"))
        shutil.copy2(comparison_mp4, os.path.join(ARTIFACT_DIR, "11_PURE_BLENDER_VS_AI_VEO_COMPARISON.mp4"))
        shutil.copy2(audit_sheet_png, os.path.join(ARTIFACT_DIR, "12_BLENDER_VS_VEO_4SHOT_AUDIT_SHEET.png"))

    print("🎉 Hoàn tất 100% việc xuất và đối chiếu Pure Blender 4.2 vs. AI Veo 3.1!")


if __name__ == "__main__":
    main()

