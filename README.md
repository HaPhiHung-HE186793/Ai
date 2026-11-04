# 🎬 AI Cinema Studio — Hybrid 3D Blender 4.2 + Google Flow (`Nano Banana Pro` & `Veo 3.1`)

Repository này chứa toàn bộ mã nguồn, tài nguyên 3D (`assets_3d/`), video thành phẩm (`previz_output/`), bộ cầu nối Google Flow Ultra (`bridge/flow-ultra-bridge.mjs`), bộ Skill (`skills/ai-film-studio/`) và **toàn bộ Context / Lịch sử hội thoại (`HANDOFF_CONTEXT.md` & `chat_context/`)** để tiếp tục phát triển tại nhà.

## 📌 Tài liệu quan trọng cần đọc đầu tiên
0. **[`docs/AI_FILM_KNOWLEDGE_PACK.md`](./docs/AI_FILM_KNOWLEDGE_PACK.md)** — ⭐ Gói kiến thức mới nhất: vì sao prompt vẫn lỗi, số liệu thí nghiệm nền thật vs AI (8s và 32s), V7 dựng theo nhịp, V8 giữ liền mạch (ảnh gốc + trục 180° + bảng trạng thái), lộ trình học và checklist. Ưu tiên hơn các tài liệu bên dưới nếu mâu thuẫn.
1. **[`HANDOFF_CONTEXT.md`](./HANDOFF_CONTEXT.md)** — Tóm tắt đầy đủ nội dung đoạn chat, các so sánh kỹ thuật (`Pure Blender` vs `Nano Banana Pro` vs `Seedance 2.5` vs `Veo 3.1`), kiến trúc **Zero-Drift 32 giây (4 Shot × 8s)**, hướng dẫn cài đặt ở nhà và **Prompt mẫu để nạp lại context cho AI**.
2. **[`AI_CINEMA_WORKFLOW_GUIDE.md`](./AI_CINEMA_WORKFLOW_GUIDE.md)** — Quy trình công nghiệp 7 bước kết hợp 3D Blender & AI Video.
3. **[`chat_context/walkthrough.md`](./chat_context/walkthrough.md)** — Báo cáo trực quan kèm hình ảnh Audit Sheet và kết quả thực nghiệm.
4. **[`chat_context/transcript_full.jsonl`](./chat_context/transcript_full.jsonl)** — Bản ghi nguyên văn toàn bộ đoạn chat (Full Conversation Transcript).

## 📂 Cấu trúc thư mục
- [`run_30s_zero_drift_veo31.mjs`](./run_30s_zero_drift_veo31.mjs): Script tự động hóa sản xuất phim 32 giây (4 Shot × 8s) không biến dạng trên `Veo 3.1` ("CHRONO BLADE: Samurai Cyber-Ronin vs. Obsidian Mecha-Dragon").
- [`hybrid_3d_ai_bridge.mjs`](./hybrid_3d_ai_bridge.mjs): Bridge kết nối các Pass 3D Blender với Google Flow (`Stage 0 Art Direction Lock`, `Weavy Node Graph`, `Biomechanical Prompting`).
- [`blender_studio_library.py`](./blender_studio_library.py): Thư viện chuẩn hóa Camera, Lighting, Compositor & 3D Angle Reprojection trong Blender 4.2.
- [`blender_pure_3d_master.py`](./blender_pure_3d_master.py) & [`assemble_pure_vs_veo_comparison.py`](./assemble_pure_vs_veo_comparison.py): Dựng phim 100% bằng Blender 4.2 thuần (không dùng Veo) và ghép video đối chiếu trực tiếp với bản AI Veo 3.1.
- [`blender_multishot_vfx.py`](./blender_multishot_vfx.py) & [`build_multishot_sequence.py`](./build_multishot_sequence.py): Pipeline 4-Shot Director's Cut cho cảnh "Ranger vs. T-Rex".
- [`bridge/flow-ultra-bridge.mjs`](./bridge/flow-ultra-bridge.mjs): HTTP Server (`localhost:4321`) điều khiển Google Flow qua Chrome CDP (`localhost:9222`).
- [`skills/ai-film-studio/`](./skills/ai-film-studio/): Toàn bộ Skill `ai-film-studio` đã nâng cấp (`MEM-20`, `MEM-21`).
- [`previz_output/real_vs_ai_plate_test/`](./previz_output/real_vs_ai_plate_test/) & [`previz_output/real_vs_ai_long_test/`](./previz_output/real_vs_ai_long_test/): Thí nghiệm đo tracking và độ trôi thế giới giữa nền quay thật và nền Veo (8 giây và 32 giây).
- [`previz_output/samurai_v7_editcut/`](./previz_output/samurai_v7_editcut/): V7, 15 shot ngắn dựng theo nhịp nhạc taiko.
- [`previz_output/samurai_v8_continuity/`](./previz_output/samurai_v8_continuity/): V8, quy trình giữ liền mạch (ảnh gốc, trục 180°, bảng trạng thái, duyệt storyboard, soi chỗ cắt).
- [`previz_output/samurai_30s_run/`](./previz_output/samurai_30s_run/): Chứa 3-Panel DNA Anchors, 4 Start Frames 8K, 4 Shot MP4 8s và bản Master 32s [`10_SAMURAI_32S_ZERO_DRIFT_MASTER.mp4`](./previz_output/samurai_30s_run/10_SAMURAI_32S_ZERO_DRIFT_MASTER.mp4).

