# Gói kiến thức làm phim AI: từ "prompt lỗi" đến phim liền mạch

> Tổng hợp từ chuỗi thí nghiệm ngày 2026-11-04 (phiên làm việc với Claude Code).
> Mọi con số trong tài liệu đều đo trên file thật nằm trong `previz_output/`. Có thể chạy lại bằng các script đi kèm.

---

## 1. Mười bài học cốt lõi

1. **AI video không có thế giới 3D.** Veo, Kling, Sora chỉ đoán từng khung hình. Không có vật lý, không nhớ vật thể, không giữ hướng màn hình. Viết thêm luật vào prompt không sửa được điều đó.
2. **Trong 1 shot ngắn và chậm, AI bám điểm gần như cảnh quay thật.** Ghép VFX 2D lên nền AI vẫn làm được (thí nghiệm 1).
3. **Sau khoảng 1 giây, AI bắt đầu tự bịa phần thế giới mới lọt vào khung hình.** Cảnh càng dài càng lạc xa nơi ban đầu (thí nghiệm 1 và 2).
4. **Nối đuôi (khung cuối → khung đầu) để kéo dài cảnh là sai.** Thế giới trôi dần, màu rực dần, camera khựng ở mỗi chỗ nối (thí nghiệm 2).
5. **Tính liên tục chỉ đến từ khung neo, không đến từ prompt.** Neo bằng ảnh thật hoặc ảnh gốc chung thì giữ được đúng nơi (thí nghiệm 2 và 4).
6. **Chất lượng nằm ở bàn dựng.** Shot ngắn 1,5–2,5 giây, mỗi shot một hành động, cắt theo nhịp nhạc (thí nghiệm 3).
7. **Mỗi clip 8 giây chỉ dùng 1,5–2,5 giây đẹp nhất.** Hầu hết clip bắt đầu biến dạng từ giây 3–5.
8. **Dựng hay thì nhịp tốt, nhưng logic phải đến từ blocking.** Cần sơ đồ bối cảnh, trục 180° và bảng trạng thái (thí nghiệm 4).
9. **Sửa lỗi ở bước storyboard (ảnh) rẻ hơn rất nhiều so với sửa ở bước video.**
10. **Video AI "mượt" trên mạng đều dùng mẹo:** cắt liên tục, nhân vật nhất quán thay vì bối cảnh nhất quán, cảnh thật làm xương sống, nhạc làm keo, chỉ đăng take tốt nhất.

---

## 2. Vì sao "có prompt rồi mà vẫn lỗi"

| AI video làm được | AI video **không** làm được |
|---|---|
| Ánh sáng, chất liệu, không khí đẹp | Mô phỏng vật lý (vỡ, va chạm, lửa đúng quỹ đạo) |
| Một hành động đơn giản trong 3–5 giây | Nhớ trạng thái giữa các clip (mũ giáp, chuôi kiếm, vết thương) |
| Bám theo ảnh đầu (và ảnh cuối) | Giữ hướng màn hình, tỷ lệ, vị trí giữa các shot |

Bằng chứng trong repo: từ V2 đến V6 (`previz_output/samurai_30s_run/`), prompt được thêm "5 Department", "Physics", "World-State", "6 Gate", nhưng các lỗi chuôi kiếm, mũ giáp, cổng torii, hướng rồng vẫn lặp lại. Câu phủ định như "no helmet" còn hay phản tác dụng.

---

## 3. Phân tích các video tham khảo

| Dạng | Ví dụ | Cách họ làm | Độ khó |
|---|---|---|---|
| **A. Hoạt hình kiểu Pixar làm bằng AI** | 2 reel Facebook (cô bé trên đảo, khủng long con) | Shot 1–2 giây, một hành động, camera gần như đứng yên, cắt liên tục, nhân vật giữ bằng ảnh tham chiếu | Dễ nhất |
| **B. Nội dung/quảng cáo trộn AI** | TikTok @taion_aiwork | Người thật nói trước camera hoặc cảnh sự kiện thật làm xương sống; AI chỉ chèn b-roll vài giây; nhạc và phụ đề làm keo | Trung bình |
| **C. VFX điện ảnh** | ErikDoesVFX, "$10 AI vs $10,000 VFX" | Quay plate thật → track camera → model 3D và animation → render → Nuke (roto, khớp màu, rung, méo ống kính). AI chỉ làm element tĩnh (lỗ gỗ vỡ), sau đó vẫn roto và grade thủ công | Khó nhất |

Bài học từ video của Erik: bản AI $10.000 của Higgsfield (Seedance 2.5) bị đổi mặt, chuyển động "như đồ chơi", mất motion blur, kết thúc shot sớm. Họ phải làm mờ mặt mới chạy được. Bí quyết của TaiOn cũng vậy: **đừng "quăng cho AI làm hết"**, hãy bóc tách quy trình; con người giữ phần sáng tạo.

---

## 4. Lộ trình học (theo thứ tự ưu tiên)

| Tầng | Học gì | Công cụ miễn phí | Thời gian |
|---|---|---|---|
| 1 | Ngôn ngữ điện ảnh: cỡ cảnh, ống kính, **trục 180°**, hướng màn hình, continuity, coverage | Xem phim và phân tích | 2–4 tuần |
| 2 | Dựng phim và âm thanh: nhịp cắt, cắt theo nhạc, match on action | DaVinci Resolve, CapCut | Song song |
| 3 | AI video có kiểm soát: ảnh tham chiếu nhân vật, ảnh đầu/cuối, một hành động mỗi shot, nhiều take | Google Flow (Nano Banana Pro + Veo) | 1–2 tháng |
| 4 | 3D cơ bản: blockout bối cảnh, camera, render bố cục làm neo cho AI | Blender | 1–2 tháng |
| 5 | Compositing: camera tracking, roto, keying, khớp màu | Fusion (trong Resolve), Nuke Non-commercial | Vài tháng |
| 6 | Mô phỏng FX: cháy nổ, phá huỷ, chất lỏng | Houdini Apprentice, EmberGen, Blender | Tính bằng năm |

**Bài tập đầu tiên kiểu Erik:** quay 5 giây bằng điện thoại (hoặc lấy video từ Pexels), track một điểm hoặc mặt phẳng, ghép một quả cầu lửa vào cảnh, khớp màu. Không cần thuê người, không cần đi xa.

**Không có tiền đi quay?** Dùng Pexels, Pixabay hoặc Mixkit (video quay thật, giấy phép cho phép chỉnh sửa). **Đừng** tải video của người khác trên TikTok hay YouTube về làm nền. Nền AI dùng được để tập nếu shot ngắn và camera chậm (xem thí nghiệm 1).

---

## 5. Thí nghiệm 1: Nền quay thật vs nền AI (8 giây)

`previz_output/real_vs_ai_plate_test/`

- **Thật:** Pexels 18784571 (đi bộ qua cổng torii trên núi), 720p, 24fps.
- **AI:** Veo 3.1 Lite, cùng khung hình đầu, cùng chuyển động được yêu cầu.

| Chỉ số | Thật | AI |
|---|---|---|
| Nhiễu khi bám điểm (sai số tiến–lùi, px) | 0,012 | 0,019 (+58%) |
| Điểm bám sống được 2 giây | 32,0% | 25,6% |
| Bám đi 1 giây rồi quay lại đúng chỗ (<1px) | 87,1% | 82,4% |
| Khớp hình học 3D (Sampson, 16 khung, % <1px) | 67,0% | 70,5% |
| Sai số dựng lại 3D ở cùng mức dịch chuyển 60–90px | 5,8px | 5,4px |

**Kết luận:**
- Tracking ngắn hạn trên nền AI dùng được. Quả cầu lửa ghép bằng planar track bám ổn ở cả hai clip.
- Khác biệt lớn nhất: **sau khoảng 1 giây AI bịa ra nơi khác**. Tường đá thành bụi cây, quả đồi thành dãy núi khác, xuất hiện thêm một cổng torii thứ hai.
- AI không nghe lời về chuyển động: yêu cầu "đi chậm" nhưng camera đi nhanh hơn khoảng 1,6 lần.

---

## 6. Thí nghiệm 2: Cảnh 32 giây, nối đuôi vs có neo

`previz_output/real_vs_ai_long_test/` (video `70_REAL_VS_AI_32S_CHAIN_VS_ANCHOR.mp4`)

- **Thật:** Pexels 17433358 (đi bộ qua đám đông về cổng chùa Kiyomizu-dera), cắt 32 giây.
- **A, nối đuôi:** 4 shot Veo × 8 giây; khung cuối shot trước làm khung đầu shot sau.
- **B, có neo:** 4 shot; mỗi shot được cho khung đầu và khung cuối lấy từ video thật (các mốc 0, 8, 16, 24, 32 giây).

| Chỉ số | Thật | A nối đuôi | B có neo |
|---|---|---|---|
| Còn ở "đúng nơi" (điểm khớp hình học, theo từng 4 giây) | 200–320 | 283 → 101 → 74 → 45 → 30 → 19 → 15 → 12 | 156–354 |
| Độ bão hoà màu theo 8 giây | ~40–43 | 42 → 50 → 62 → 65 | ~40–43 |
| Ở chỗ nối | — | Camera **khựng**: tốc độ 1,1–1,8 tụt xuống 0,25 | Có **cú giật**: tốc độ vọt 1,4–5,3 (bình thường ~0,4) |
| Khung cuối khớp đích (PSNR) | — | — | 24 → 22 → 18 → 18 dB |

**Kết luận:** không dùng nối đuôi để kéo dài cảnh. Có neo thì giữ đúng nơi, nhưng Veo không dừng đúng vào khung cuối, nên mỗi chỗ nối phải trở thành **một cú cắt có chủ đích** (đổi góc máy), không giả làm shot liền.

---

## 7. Thí nghiệm 3: V7, dựng theo nhịp

`previz_output/samurai_v7_editcut/` (`80_SAMURAI_V7_EDIT_CUT_MASTER.mp4`, `81_V6_VS_V7_EDIT_CUT_COMPARISON.mp4`)

- Cùng model Veo 3.1 Lite, cùng ảnh tham chiếu với V6. Chỉ đổi cách viết kịch bản và cách dựng.
- 15 shot × 1,5–2,5 giây, mỗi shot một hành động, cắt đúng phách nhạc taiko 120 BPM (nhạc tổng hợp bằng code, `music.py`).
- Chọn đoạn 1,5–2,5 giây tốt nhất trong clip 8 giây (`edit.json`). Tạo lại take lỗi: S03 lưỡi kiếm trồi ra từ phía chuôi; S13 rồng gục rồi tự đứng dậy.
- **Kết quả:** nhịp và chất lượng tăng rõ. **Nhưng logic giữa các cảnh bị nhảy cóc:** kiếm tự rút, rồng đổi kích thước, lửa và chạy mỗi shot một hướng, Kenji chạy ra xa rồng, nhảy ở sân khác, quỳ đúng chỗ rồng vừa gục.
- **Nguyên nhân:** mỗi shot tạo độc lập. Ảnh tham chiếu chỉ giữ nhân vật trông thế nào, không khoá vị trí, hướng, tỷ lệ, trạng thái.

---

## 8. Thí nghiệm 4: V8, giữ liền mạch

`previz_output/samurai_v8_continuity/` (`90_SAMURAI_V8_CONTINUITY_MASTER.mp4`, `91_V7_VS_V8_CONTINUITY_COMPARISON.mp4`)

1. **Ảnh toàn cảnh gốc** (`master_t2.png`): cổng torii giữa, Kenji trái nhìn phải, rồng phải nhìn trái, rồng cao khoảng 1,3 lần cổng, kiếm trong vỏ.
2. **Mọi ảnh đầu tạo từ ảnh gốc** với tiền tố cố định (`PREFIX` trong `produce_v8.mjs`). Chỉ đổi góc máy.
3. **Trục 180°**: máy quay luôn một bên trục, nên Kenji luôn trái, rồng luôn phải, lửa phải → trái, Kenji lao trái → phải.
4. **Bảng trạng thái** cho từng shot (trường `state` trong `shots_v8.json`).
5. **Shot liên kết**: qua vai Kenji nhìn rồng (S04), từ sau lưng rồng nhìn Kenji trên không (S11), toàn cảnh mở và kết.
6. **Duyệt storyboard trước khi tạo video** (`storyboard_t1.jpg`). Đã sửa ở bước ảnh: kiếm rút sẵn trong ảnh gốc, rồng xuất hiện quá sớm ở S02/S03, đầu rồng sai hướng ở S07 (lật ngang ảnh).
7. Sửa ở bước video: S04 phun lửa quá sớm (tạo lại take chỉ gầm); S09 cắt sớm hơn cho khớp vị trí với S10.

**Lỗi nhỏ còn lại:** S13 rồng lệch về giữa và trái khung; kiếm bừng sáng khi rút (S05 → S06) chưa được chủ đích dàn dựng; S14 có vụ nổ ngoài kịch bản. Bước tiếp theo: blockout Blender để khoá vị trí cho từng góc máy.

---

## 9. Quy trình chuẩn 6 bước

```
1. Kịch bản + SƠ ĐỒ BỐI CẢNH (ai đứng đâu, trục 180°, máy quay bên nào)
2. BẢNG TRẠNG THÁI từng shot (vũ khí, vết thương, lửa/khói, thời tiết, vị trí, khoảng cách)
3. ẢNH TOÀN CẢNH GỐC → mọi ảnh đầu tạo từ ảnh này (chỉ đổi góc máy)
4. DUYỆT STORYBOARD (hướng, tỷ lệ, trạng thái) TRƯỚC khi tạo video
5. Tạo video → chọn đoạn 1,5–2,5 giây tốt nhất → tạo lại take lỗi
6. Dựng theo nhạc → chỉnh màu đồng nhất → SOI TỪNG CHỖ CẮT → xuất bản
```

### 9.1 Mẫu một shot (`shots_v8.json`)
```json
{"id":"S09","dur":2.0,
 "state":"Kenji lao trái → phải · kiếm sáng",
 "refs":["master","kenji"],
 "img":"New camera: side tracking medium-wide shot, KENJI bursts out of steam on the left and sprints to the right toward the dragon...",
 "vid":"He sprints from left to right across the wet stone. The camera tracks sideways with him."}
```

### 9.2 Luật viết prompt
- **Ảnh đầu:** bắt đầu bằng tiền tố khoá ảnh gốc ("Use reference image 1 as the exact same location, lighting, scale and positions: KENJI on the LEFT facing RIGHT, the dragon on the RIGHT facing LEFT…"), sau đó mới là "New camera: …".
- **Video:** 1–2 câu, **một hành động**, ghi **hướng** (left → right) và **camera** (static / push-in / tracks sideways).
- Muốn AI *không* làm gì thì mô tả trạng thái tích cực ("its mouth stays empty, only steam") kèm câu cấm cụ thể. Đừng chỉ viết "no X".
- Hai nhân vật **không tiếp xúc vật lý** trong cùng khung. Đòn đánh và hậu quả tách thành 2 shot, để cú cắt tự nối.

### 9.3 Checklist duyệt storyboard
- [ ] Nhân vật A luôn cùng một bên màn hình, nhìn cùng một hướng
- [ ] Hướng chuyển động (lửa, chạy, nhảy, chém) đúng luật trục
- [ ] Tỷ lệ (rồng so với cổng, người so với rồng) không đổi
- [ ] Trạng thái khớp bảng (kiếm trong vỏ hay đã rút, vết thương, lửa)
- [ ] Không có thứ xuất hiện sớm hoặc biến mất vô lý
- [ ] Có shot liên kết cho khán giả biết ai ở đâu

### 9.4 Checklist chọn đoạn và dựng
- [ ] Xem bảng zoom mỗi 0,5 giây (`zoom.py`); bỏ 0,3 giây đầu (thường đứng yên)
- [ ] Cắt **trước** lúc biến dạng (thường từ giây 3–5)
- [ ] Độ dài shot là bội số của phách (120 BPM → 0,5 giây)
- [ ] Cắt giữa động tác (match on action) cho cặp shot liên tiếp
- [ ] Chỉnh màu chung cho toàn phim; khung 2.39:1 tuỳ chọn
- [ ] Âm lượng −16 LUFS; âm thanh gốc của Veo trộn nhỏ làm hiệu ứng (khoảng 0,35)
- [ ] **Soi hai bên mọi chỗ cắt** (`cuts_v8.py`) trước khi xuất

---

## 10. Chạy lại

Cần: bridge Google Flow đang chạy (`node bridge/launch-chrome-flow.mjs` rồi `node bridge/flow-ultra-bridge.mjs`), Python có `opencv-python-headless numpy matplotlib pillow`, và ffmpeg.

```bash
# V8 (quy trình liền mạch)
cd previz_output/samurai_v8_continuity
node produce_v8.mjs master none t2       # ảnh toàn cảnh gốc
node produce_v8.mjs frames all t1        # ảnh đầu 16 shot
python board.py t1                       # storyboard để duyệt
node produce_v8.mjs videos all t1        # video Veo
python music_v8.py && python edit_v8.py  # nhạc + dựng (đoạn chọn trong edit.json)
python cuts_v8.py                        # soi các chỗ cắt
```

Các thí nghiệm đo lường: `real_vs_ai_plate_test/analyze.py`, `solve2.py`, `render.py`; `real_vs_ai_long_test/analyze_long.py`, `render_long.py`.

Clip nguồn quay thật lấy từ Pexels (giấy phép Pexels: dùng và chỉnh sửa miễn phí; không bán bản chưa chỉnh sửa, không đăng lại lên trang stock khác). Bản cắt ngắn dùng cho thí nghiệm nằm trong repo; bản gốc tải tại:
- https://www.pexels.com/video/walking-through-a-gate-in-the-mountains-in-japan-18784571/
- https://www.pexels.com/video/people-are-walking-around-a-temple-in-japan-17433358/

---

## 11. Chi phí tham khảo (gói Google Flow Ultra)

| Việc | Veo 3.1 Lite | Nano Banana Pro |
|---|---|---|
| Thí nghiệm 1 | 1 | 0 |
| Thí nghiệm 2 | 8 | 0 |
| V7 | 17 (15 + 2 take làm lại) | 15 |
| V8 | 18 (16 + 2 take làm lại) | ~20 |
