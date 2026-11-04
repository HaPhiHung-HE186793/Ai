# Playbook: Dựng theo nhịp + giữ liền mạch (V7 → V8)

Tài liệu đầy đủ, số liệu và lộ trình học: [docs/AI_FILM_KNOWLEDGE_PACK.md](../../../docs/AI_FILM_KNOWLEDGE_PACK.md).
Mã nguồn mẫu chạy được: `previz_output/samurai_v8_continuity/` (`shots_v8.json`, `produce_v8.mjs`, `board.py`, `edit_v8.py`, `cuts_v8.py`, `music_v8.py`).

## Bằng chứng đo được

| Thí nghiệm | Kết quả chính |
|---|---|
| Nền thật vs nền AI, 8 giây | Tracking ngắn hạn gần như nhau (sai số 3D 5,8 vs 5,4px), nhưng sau ~1 giây AI bịa ra nơi khác (thêm một cổng torii, đổi núi) |
| 32 giây nối đuôi | Điểm khớp với nơi thật 283 → 12; độ bão hoà màu 42 → 65; camera khựng ở mỗi chỗ nối (tốc độ tụt xuống 0,25) |
| 32 giây có neo đầu + cuối | Giữ đúng nơi (156–354), nhưng khung cuối không khớp hẳn (PSNR 24 → 18 dB), nên có cú giật ở chỗ nối → biến thành cú cắt đổi góc |
| V7 dựng theo nhịp | Nhịp tốt; logic hỏng: kiếm tự rút, rồng đổi kích thước, hướng lửa/chạy lộn xộn |
| V8 ảnh gốc + 180° + bảng trạng thái | Cả 15 chỗ cắt giữ đúng hướng, tỷ lệ, trạng thái |

## Runbook cho agent

1. **Blocking:** viết sơ đồ bối cảnh. Chọn trục 180° giữa hai phe; máy quay luôn một bên. Ghi luật màn hình (ví dụ: A trái nhìn phải, B phải nhìn trái, đòn tấn công của B bay phải → trái).
2. **Shot list** (JSON): `id, dur (bội số phách), state, refs, img, vid`. Mỗi shot một hành động. Có ít nhất 1 shot toàn cảnh và 1–2 shot qua vai làm liên kết.
3. **Ảnh gốc:** `generate.image` (Nano Banana Pro) với refs [nhân vật A, nhân vật B, bối cảnh]. Kiểm tra vị trí, hướng, tỷ lệ, **trạng thái ban đầu** (ví dụ kiếm còn trong vỏ). Sai thì tạo lại.
4. **Ảnh đầu từng shot:** refs = [ảnh gốc, sheet nhân vật liên quan]; prompt = `PREFIX` khoá vị trí + "New camera: …".
5. **Duyệt storyboard** (lưới ảnh kèm trường `state`). Sai hướng thì lật ngang (`cv2.flip`) rồi upload lại; sai trạng thái thì tạo lại ảnh với câu "IMPORTANT: …".
6. **Video:** Veo, `firstFrameImageMediaId` = ảnh đầu. Prompt 1–2 câu: hành động + hướng + camera. Muốn cấm gì thì mô tả trạng thái thay thế ("mouth stays empty, only steam").
7. **Chọn đoạn:** lưới zoom mỗi 0,5 giây. Bỏ 0,3 giây đầu, cắt trước lúc biến dạng. Take hỏng (vật lý sai, làm ngược kịch bản) thì tạo lại với hành động đơn giản hơn, dùng lại ảnh đầu (`REUSE_IMG=1`).
8. **Dựng:** `edit.json` (take + start). Ghép theo nhạc, chỉnh màu chung, khung 2.39:1 tuỳ chọn, âm Veo trộn ~0,35, loudnorm −16 LUFS.
9. **Soi chỗ cắt:** lấy khung cuối shot i và khung đầu shot i+1 cho mọi chỗ cắt. Kiểm hướng, vị trí, trạng thái, tỷ lệ. Sửa bằng cách đổi `start` hoặc tạo lại take.

## Bẫy thường gặp
- Ảnh gốc mang sẵn trạng thái sai (kiếm đã rút) thì mọi shot sau chép theo.
- Nhân vật "chưa xuất hiện" vẫn lọt vào ảnh đầu vì ảnh gốc có nó. Phải ghi rõ "completely hidden in fog".
- Veo hay tự thêm hành động đòn kết (phun lửa, nổ) sớm hơn kịch bản. Kiểm từng 0,5 giây.
- Nhân vật ngã xuống rồi tự đứng dậy ở giây 3–4. Cắt trước, hoặc prompt "stays down and does not get up".
- Lưỡi kiếm trồi ra từ phía chuôi khi yêu cầu rút kiếm cận cảnh. Dùng góc trung cảnh, hoặc chỉ quay tay siết chuôi.
