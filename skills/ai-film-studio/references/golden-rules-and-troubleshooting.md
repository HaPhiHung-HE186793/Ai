# 📚 Tham Chiếu Chuyên Sâu: 6 Quy Chuẩn Vàng & Bảng Khắc Phục Lỗi `flow-sdk` (`MEM-01` -> `MEM-10`)

Tài liệu này là phụ lục kỹ thuật của skill `ai-film-studio`, tổng hợp từ [AGENT.md](../../../../AGENT.md), [MEMORY.md](../../../../MEMORY.md) và [context.md](../../../../context.md).

---

## 1. Công Thức Prompt Chuẩn Cho 3 Tài Sản Cốt Lõi (0 Credit — `🍌 Nano Banana Pro`)

### A. Prompt Bảng Tham Chiếu Nhân Vật 3 Góc Độ (`3-Panel Neutral Gray Reference Sheet`)
```text
16:9 three-panel character reference sheet split into 3 views: (1) close-up portrait of face and head details, (2) full-body front view standing straight, (3) full-body three-quarter back view. Subject: <MÔ_TẢ_CHI_TIẾT_NHÂN_VẬT_TIẾNG_ANH>. Isolated on a flat neutral gray studio background (#808080) with shadowless studio lighting, zero cast shadows, identical facial features, hairstyle, mole/scar placement, and costume details across all three angles, 8k photorealistic.
```

### B. Prompt Khóa Bối Cảnh Sạch Không Người (`Clean Environment Lock`)
```text
16:9 wide cinematic establishing shot of environment: <MÔ_TẢ_CHI_TIẾT_BỐI_CẢNH_TIẾNG_ANH>. STRICTLY EMPTY ENVIRONMENT: zero people, no humans, no characters, no crowds, no silhouettes, uninhabited clean architectural space, locked lighting and atmosphere, 8k photorealistic movie set plate.
```

### C. Prompt Khung Hình Storyboard Độ Phân Giải Đầy Đủ (`Full-Res Storyboard Start/End Frame` — Gọi `@TênNhânVật` & `[SKILL_...]`)
```text
16:9 full-resolution cinematic storyboard frame (SINGLE UNSPLIT WIDESCREEN FRAME, NO GRID). @<TÊN_NHÂN_VẬT> [CHARACTER: <TÊN_NHÂN_VẬT>] (<MÔ_TẢ_NHÂN_VẬT>) inside @STAGE: <TÊN_BỐI_CẢNH> [ENVIRONMENT LOCK: <TÊN_BỐI_CẢNH>] (<MÔ_TẢ_BỐI_CẢNH>). Invoking signature character folder skill/action: [<MÃ_CHIÊU_THỨC_SKILL_HOẶC_ACTION>]. Action: <MÔ_TẢ_HÀNH_ĐỘNG_CẢNH>. Camera: <GÓC_MÁY_VÀ_ỐNG_KÍNH>. Maintain 100% character anatomy, emotional soul, and combat posture from locked Character Folders and exact environment lighting from environment plate.
```

### D. Prompt Video Sinh Cơ Học & Quang Học (`Biomechanical & Optical Veo 3.1 Prompt` — Chuẩn `ErikDoesVFX` & Blender 4.2 Bridge)
```text
[CAMERA & PLATE LOCK]: <GÓC_MÁY_35MM_ANAMORPHIC_VÀ_KHÓA_NHÂN_VẬT_TIỀN_CẢNH>. [CREATURE/SUBJECT KINEMATICS]: <HÀNH_ĐỘNG_CHÍNH_3_NHỊP>. [BIOMECHANICAL WEIGHT]: Combining the real-world biomechanical weight transfer of <ĐỘNG_VẬT_THẬT_THAM_CHIẾU_VD_CASSOWARY_OSTRICH_KOMODO>, heavy muscular torso roll and ground impact physics. [OPTICAL PHYSICS]: 180-degree cinema shutter drag, natural motion blur on fast-moving limbs, elliptical anamorphic bokeh. [GUARDRAILS]: Zero floating objects, zero arrows, zero disappearing characters, zero actor face morphing, 100% photorealistic live-action physics. (no subtitles) — no subtitles
```

---

## 2. Bảng Tra Cứu Nhanh Các Quy Tắc Kỹ Thuật Ngầm (`MEM-01` -> `MEM-21`)

| Mã | Quy tắc Kỹ thuật Bắt buộc |
| :--- | :--- |
| **`MEM-01`** | Mọi `prompt` gửi vào `Flow.generate.image` hoặc `Flow.generate.video` phải `.slice(0, 3800)` vì host Google Flow ném lỗi `Error("ll")` nếu dài quá `4000` ký tự. |
| **`MEM-02`** | Tham số `resolution` trong `Flow.generate.video` chỉ được truyền `"720p"` (cho `Veo 3.1`) hoặc `"360p"` (cho `Omni 1.1 Flash`). Không truyền `"1080p"` trực tiếp để tránh lỗi `Error("pl")`. |
| **`MEM-03`** | Khi đọc JSON từ `Flow.generate.text` (`Omni 1.1 Flash`), luôn tìm vị trí dấu `{` đầu tiên và `}` cuối cùng để lọc bỏ phần văn bản dẫn nhập. |
| **`MEM-04`** | Khi gọi `Flow.generate.image` hoặc `Flow.generate.video` có tham chiếu, truyền mảng `referenceImageMediaIds: [characterSheetMediaId, cleanEnvMediaId]` (tối đa 3 ID). |
| **`MEM-05`** | Khi gặp cảnh có `isDnaStateShift: true` (nhân vật biến hình, vỡ giáp, đổi trang phục), cập nhật `canvasMemoryAnchorMediaId` bằng `startKeyframeMediaId` của cảnh đó cho toàn bộ các cảnh kế tiếp. |
| **`MEM-06`** | Khi gọi MLLM Judge chấm điểm ảnh, chỉ truyền chuỗi Base64 của ảnh PNG (`startKeyframe` hoặc `lastFrame`), tuyệt đối không truyền chuỗi Base64 của file `.mp4` với nhãn `image/png`. |
| **`MEM-07`** | Khi gọi `Flow.generate.video` với cả `firstFrameImageMediaId` + `lastFrameImageMediaId` (Interpolation) trên `Veo 3.1`, bọc `try / catch` để tự động thử lại với `durationSeconds: 8` nếu `durationSeconds: 4` bị từ chối. |
| **`MEM-08`** | Khi quay lại (Retake) cảnh có `endKeyframeMediaId`, luôn truyền kèm `lastFrameImageMediaId` để không làm mất khóa điểm cuối. |
| **`MEM-09`** | Tiền tố tỷ lệ khung hình trong prompt (`16:9` hoặc `9:16`) phải đồng bộ với tham số `aspectRatio`. |
| **`MEM-10`** | **BẮT BUỘC NGAY TẠI GIAI ĐOẠN 2**: Dùng `Flow.host.createCharacter` để khóa mỗi nhân vật vào tab **"Nhân vật"** (`/project/<id>/character/<uuid>`) với **đầy đủ 3 phần**: **(1) Tab `Chân dung`** (Avatar), **(2) Tab `Tạo cơ thể` -> `Cơ thể`** (Gắn bảng thiết kế Full-Body 3 góc độ và tư thế hành động/chiêu thức), **(3) Ô `Thông tin nhân vật`** (Ghi rõ Chiều cao, Cân nặng, Tính cách/Linh hồn cảm xúc và Mã hành động/Chiêu thức `[ACTION_...]`, `[SKILL_...]`). Ở Giai đoạn 3 & 4, prompt gọi `@TênNhânVật` kèm `[SKILL_...]` để Google Flow lấy trọn bộ Folder nhân vật ra dựng cảnh. Dùng `Flow.host.createScene` ở Giai đoạn 6 để ghép các clip vào tab **"Cảnh"** (`Scenebuilder`). |
| **`MEM-20`** | **Stage 0 Art Direction (0% AI) & Weavy Node-Based Multi-Reference (`@taion_aiwork`)**: Khóa **Xung đột Thị giác (Contrast Concept)** + **Moodboard Ánh sáng** + **Nhịp độ Dựng (Pacing Map)** trước khi viết prompt. Sử dụng kỹ thuật xoay góc 3D (`2D -> 3D -> 2D Re-projection`) từ Blender 4.2 / `Meshy` để khóa các góc máy điện ảnh khó trước khi đưa vào `🍌 Nano Banana Pro`. |
| **`MEM-21`** | **Ma trận Hybrid 3D VFX vs. AI (`ErikDoesVFX` & Blender 4.2)**: (1) Tách sạch đạo cụ đạn đạo nhỏ bay nhanh (mũi tên, đạn) khỏi ảnh AI gốc và render riêng bằng lớp 3D RGBA (`frames_arrow_rgba`), (2) Khóa Single-Anchor First Frame + mặt nạ 3D Roto (`alphamerge`) để chống biến dạng mặt diễn viên (`Actor Identity Drift`) và giữ nguyên vỏ cây 8K tiền cảnh, (3) Bắt buộc dùng công thức **Biomechanical Kinematics + 180° Shutter Drag** cho mọi chuyển động sinh vật/hành động trên `Veo 3.1`. |

