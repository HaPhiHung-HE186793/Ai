# 🎬 HANDOFF & FULL CHAT CONTEXT — Hybrid 3D Blender + Google Flow (`Nano Banana Pro` + `Veo 3.1`)

> **Mục đích file này**: Lưu trữ toàn bộ ngữ cảnh (Context), lịch sử quyết định kỹ thuật, thông số `mediaId` và hướng dẫn chạy tiếp tại nhà cho dự án **AI Cinema / Hybrid 3D VFX & Zero-Drift Multi-Shot Veo 3.1**.
> - **Conversation ID**: `092f7d00-e0a7-4cec-be77-f8cff1234933`
> - **Log hội thoại gốc (JSONL đầy đủ)**:
>   - [`chat_context/transcript.jsonl`](./chat_context/transcript.jsonl)
>   - [`chat_context/transcript_full.jsonl`](./chat_context/transcript_full.jsonl)
>   - [`chat_context/walkthrough.md`](./chat_context/walkthrough.md)

---

## 1. Tóm tắt toàn bộ tiến trình & Nội dung đoạn Chat

### Giai đoạn 1: Phân tích 4 Video tham khảo (`@taion_aiwork` & YouTube) & Nâng cấp Hybrid 3D Pipeline
1. **Phân tích 4 video mẫu**:
   - `https://www.tiktok.com/@taion_aiwork/video/7625838424372694280` (2D Concept sang 3D Blender Previz + AI Neural Skinning)
   - `https://www.tiktok.com/@taion_aiwork/video/7693111969267731718` (Weavy Node Graph + 12 góc Camera 3D đa chiều)
   - `https://www.tiktok.com/@taion_aiwork/video/7692418751064558856` (Biomechanical Creature Rigging & Heavy Mass Physics)
   - `https://www.youtube.com/watch?v=40uRWuhfZI0` (Industrial Hybrid 3D-to-AI VFX Workflow)
2. **Nâng cấp hệ thống & Skill**:
   - Cập nhật [`AI_CINEMA_WORKFLOW_GUIDE.md`](./AI_CINEMA_WORKFLOW_GUIDE.md), [`blender_studio_library.py`](./blender_studio_library.py) (thêm `RULE-3D-05` `render_3d_angle_reprojection_pass` và `RULE-3D-06` `build_biomechanical_veo_prompt`), [`hybrid_3d_ai_bridge.mjs`](./hybrid_3d_ai_bridge.mjs), và bộ skill [`skills/ai-film-studio/`](./skills/ai-film-studio/) (thêm `MEM-20` & `MEM-21`).

---

### Giai đoạn 2: Dựng cảnh "Ranger vs. T-Rex" (8 giây đơn & 4-Shot Director's Cut)
1. **Xử lý 4 lỗi gốc của bản Previz đầu tiên**:
   - Thay thế khối hình học cơ bản bằng **Rigged 3D Mesh thực tế** từ [`assets_3d/`](./assets_3d/).
   - Tách lớp **Foreground Roto Mask (`frames_fg_roto_mask`)** để giữ nhân vật Ranger tiền cảnh sắc nét.
   - Render bản 8 giây đầy đủ (`03b_di_graded_cinemascope_full_8s_1x.mp4`) và mở rộng thành **4-Shot Multi-Camera Director's Cut**:
     - [`previz_output/05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4`](./previz_output/05_MULTISHOT_DIRECTORS_CUT_MASTER.mp4)
     - [`previz_output/06_MULTISHOT_3D_VS_FINAL_BREAKDOWN.mp4`](./previz_output/06_MULTISHOT_3D_VS_FINAL_BREAKDOWN.mp4)
     - [`previz_output/09_MULTISHOT_STORYBOARD_AUDIT_SHEET.png`](./previz_output/09_MULTISHOT_STORYBOARD_AUDIT_SHEET.png)

---

### Giai đoạn 3: So sánh thực nghiệm "100% Pure Blender 4.2 (Không dùng AI Veo)" vs. "Hybrid AI Veo 3.1"
- **Yêu cầu của bạn**: Tự làm bằng quy trình chuẩn trên Blender không dùng AI video Veo, xuất video thành phẩm và đặt cạnh bản AI Veo để đánh giá.
- **Script thực thi**: [`blender_pure_3d_master.py`](./blender_pure_3d_master.py) và [`assemble_pure_vs_veo_comparison.py`](./assemble_pure_vs_veo_comparison.py).
- **Kết quả xuất ra**:
  - Bản 100% Pure Blender 4.2 (Procedural PBR Scales, Volumetric Fog, 1200 Rain Particles, Camera Shake): [`previz_output/10_PURE_BLENDER_NO_VEO_MASTER.mp4`](./previz_output/10_PURE_BLENDER_NO_VEO_MASTER.mp4)
  - Video đặt cạnh nhau (Side-by-Side Comparison): [`previz_output/11_PURE_BLENDER_VS_AI_VEO_COMPARISON.mp4`](./previz_output/11_PURE_BLENDER_VS_AI_VEO_COMPARISON.mp4)
  - Bảng Audit 4 Shot: [`previz_output/12_BLENDER_VS_VEO_4SHOT_AUDIT_SHEET.png`](./previz_output/12_BLENDER_VS_VEO_4SHOT_AUDIT_SHEET.png)
- **Kết luận kỹ thuật**:
  - **Blender thuần** thắng tuyệt đối về **kiểm soát không gian 3D, quỹ đạo camera và không bao giờ biến dạng mesh**, nhưng thiếu chi tiết vi mô hữu cơ (cơ bắp co giãn dưới mưa, nước bọt, bùn văng tự nhiên) nếu chỉ làm bởi 1 người.
  - **Hybrid (Blender khóa bố cục + Veo 3.1 đắp da/vật lý)** mang lại chất lượng điện ảnh Hollywood cao nhất.

---

### Giai đoạn 4: Đánh giá kỹ thuật theo các câu hỏi chuyên sâu trong Chat
1. **"Không dùng Veo 3 mà chỉ dùng Nano Banana Pro đắp lớp da cho từng frame Blender rồi ghép lại chạy có được không?"**
   - **Trả lời**: **KHÔNG NÊN** chạy `Nano Banana Pro` độc lập trên từng frame (192 frames) vì `Nano Banana Pro` là mô hình sinh ảnh tĩnh (Spatial Diffusion), không có **3D Spatio-Temporal Attention** giữa các frame. Khi ghép 24 ảnh/giây lại sẽ bị **nhấp nháy dữ dội (Temporal Flickering / Boiling Texture)** — vảy khủng long, giọt mưa, tán cây biến đổi vị trí mỗi 1/24 giây.
   - **Vai trò chuẩn**: `Nano Banana Pro` chỉ dùng để tạo **Keyframe מỏ neo 8K (`Start Frame` / `End Frame`)**, còn **`Veo 3.1`** chịu trách nhiệm nội suy chuyển động 24fps mượt mà ở giữa.
2. **"So sánh chất lượng `Veo 3.1` vs `Seedance 2.5` (ByteDance)"**:
   - **`Veo 3.1`** thắng về: Vật lý hạng nặng (nước mưa, bùn bắn, khói lửa, cơ bắp), chất màu điện ảnh 35mm IMAX, và **Native Audio** (tự sinh âm thanh gầm rú, tiếng sấm, tiếng kiếm đồng bộ từng frame). Giới hạn là 8 giây/shot.
   - **`Seedance 2.5`** thắng về: Thời lượng shot đơn dài hơn (10s–15s–30s), giữ ID khuôn mặt khi xoay 360 độ và võ thuật nhanh, nhưng vật lý môi trường có cảm giác "nhẹ/game CG" hơn `Veo 3.1`.
3. **"Nhưng nếu video dài 30 giây đồng nhất 1 cảnh thì vẫn hơn là ghép 3–4 shot của Veo 3.1 dễ bị lỗi biến dạng?"**
   - **Giải pháp đột phá được chứng minh**: Ghép 4 shot × 8s trên `Veo 3.1` chỉ bị biến dạng khi người dùng mắc lỗi **Nối đuôi mù (Blind Daisy-Chaining)** — lấy frame cuối bị mờ của Shot 1 làm Start Frame cho Shot 2.
   - Chúng ta thiết kế kiến trúc **Zero-Drift Multi-Shot (Song song từ 1 DNA gốc)** giúp 4 Shot × 8s = **32 giây trên `Veo 3.1` đồng nhất 100% không biến dạng**.

---

### Giai đoạn 5: Thực nghiệm kịch bản 32 giây (4 Shot × 8s) hoàn toàn mới trên `Veo 3.1`
- **Tên phim**: *"CHRONO BLADE: Samurai Cyber-Ronin vs. Obsidian Mecha-Dragon"*
- **Script chạy tự động**: [`run_30s_zero_drift_veo31.mjs`](./run_30s_zero_drift_veo31.mjs)
- **4 Quy tắc Zero-Drift đã áp dụng**:
  1. **Khóa 3-Panel DNA Anchors trên nền `#808080`** trước khi dựng:
     - Samurai Kenji (`mediaId`: `46351645-0b10-4c90-8aee-9aefa18add2a`) -> [`previz_output/samurai_30s_run/01_anchor_samurai_kenji_sheet.png`](./previz_output/samurai_30s_run/01_anchor_samurai_kenji_sheet.png)
     - Mecha-Dragon Kuroryu (`mediaId`: `26fb13b5-691b-4422-9455-842869f799f9`) -> [`previz_output/samurai_30s_run/02_anchor_mecha_dragon_sheet.png`](./previz_output/samurai_30s_run/02_anchor_mecha_dragon_sheet.png)
     - Đền Kyoto đêm mưa (`mediaId`: `a0c4766f-7c90-4408-bee1-fc945d93cfa5`) -> [`previz_output/samurai_30s_run/03_anchor_kyoto_rain_temple_plate.png`](./previz_output/samurai_30s_run/03_anchor_kyoto_rain_temple_plate.png)
  2. **Không nối đuôi (Zero Daisy-Chaining)**: Cả 4 `Start Frame` của 4 Shot đều được `🍌 Nano Banana Pro` sinh trực tiếp từ bộ 3 `mediaId` gốc ở trên.
  3. **Insert Cutaway ở Shot 2 (`00:08–00:16`)**: Cận cảnh `85mm` đặc tả bàn tay rút kiếm và vết sẹo trên mặt Kenji để xóa cảm giác nhảy cắt giữa các góc rộng.
  4. **Master 2.39:1 DI Grading + Native Audio**: Ghép 4 video `Veo 3.1` (kèm âm thanh gốc 48kHz) qua bộ lọc màu CinemaScope 2.39:1 thống nhất.
- **File kết quả 32 giây**:
  - 🎬 **Video Master 32s**: [`previz_output/samurai_30s_run/10_SAMURAI_32S_ZERO_DRIFT_MASTER.mp4`](./previz_output/samurai_30s_run/10_SAMURAI_32S_ZERO_DRIFT_MASTER.mp4)
  - 🖼️ **Bảng kiểm định Zero-Drift (`t=1.0s` vs `t=6.8s`)**: [`previz_output/samurai_30s_run/11_SAMURAI_32S_CONSISTENCY_AUDIT_SHEET.png`](./previz_output/samurai_30s_run/11_SAMURAI_32S_CONSISTENCY_AUDIT_SHEET.png)

---

## 2. Hướng dẫn chạy tiếp khi về nhà (Home Setup Guide)

### Bước 1: Clone Repository
```bash
git clone https://github.com/HaPhiHung-HE186793/Ai.git
cd Ai
```

### Bước 2: Khôi phục Skill `ai-film-studio` vào máy ở nhà (nếu dùng Antigravity / Gemini CLI)
```bash
mkdir -p ~/.gemini/config/skills/
cp -rf ./skills/ai-film-studio ~/.gemini/config/skills/
```

### Bước 3: Khởi động Chrome CDP (Port `9222`) & Google Flow Ultra Bridge (Port `4321`)
1. Mở Google Chrome với cờ Remote Debugging và đăng nhập sẵn vào [Google Flow (`labs.google/fx/vi/tools/flow`)](https://labs.google/fx/vi/tools/flow), mở 1 Project bất kỳ:
   ```bash
   google-chrome --remote-debugging-port=9222 --user-data-dir=$HOME/.chrome-flow-profile &
   ```
2. Chạy Daemon Bridge kết nối vào Chrome (từ thư mục `bridge/` đã đóng gói sẵn trong repo này):
   ```bash
   node ./bridge/flow-ultra-bridge.mjs
   ```
   *(Bridge sẽ lắng nghe tại `http://localhost:4321/api/status`, `/api/generate-image`, `/api/generate-video`).*

### Bước 4: Chạy tiếp Pipeline 32 giây hoặc tạo kịch bản mới trên `Veo 3.1`
```bash
node ./run_30s_zero_drift_veo31.mjs
```
- Script có cơ chế **Resume thông minh**: File nào đã có sẵn trong `previz_output/samurai_30s_run/*.json` sẽ được giữ nguyên `mediaId` mà không tốn thêm credit; nếu muốn render kịch bản mới, chỉ cần sửa prompt trong `run_30s_zero_drift_veo31.mjs` hoặc đổi `OUT_DIR`.

### Bước 5: (Tùy chọn) Nếu muốn chạy các script 3D Blender tại nhà
- Cài Blender 4.2+ (hoặc tải bản portable `blender-4.2.3-linux-x64` giải nén vào `./tools/blender-4.2.3-linux-x64/blender`), sau đó chạy:
  ```bash
  ./tools/blender-4.2.3-linux-x64/blender -b -P blender_pure_3d_master.py
  ```

---

## 3. Prompt Copy-Paste để nạp lại Context ngay lập tức cho AI ở nhà

Khi về nhà và mở phiên chat mới, bạn chỉ cần copy đoạn dưới đây dán vào khung chat:

```text
Hãy đọc file HANDOFF_CONTEXT.md, AI_CINEMA_WORKFLOW_GUIDE.md, run_30s_zero_drift_veo31.mjs và chat_context/walkthrough.md trong workspace này để nắm toàn bộ ngữ cảnh phiên làm việc trước của tôi (bao gồm hệ thống Hybrid 3D Blender + Google Flow Nano Banana Pro + Veo 3.1 và kiến trúc Zero-Drift 4-Shot 32 giây). Sau khi đọc xong hãy xác nhận để chúng ta làm tiếp!
```

