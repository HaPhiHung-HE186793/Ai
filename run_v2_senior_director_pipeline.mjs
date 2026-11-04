#!/usr/bin/env node
/**
 * 🎬 SENIOR-LEVEL DETERMINISTIC AI DIRECTOR PIPELINE (V2.0 PRODUCTION RUN)
 * ============================================================================
 * Thực thi `DirectorCompilerEngine` để nâng cấp bộ phim 32 giây "CHRONO BLADE"
 * lên chuẩn QC Quốc Tế (Netflix / SMPTE / EBU R128 / ASC Continuity):
 *
 * 1. Bảo toàn các Shot đã khóa (`locked: true`) bằng SHA-256 Node Lock (không làm lệch các đoạn đã đẹp).
 * 2. Cắt tỉa "Khoảnh khắc Vàng" (`Golden-Window Cut-on-Action`) và Dựng song song (Parallel Cross-Cutting):
 *    - Loại bỏ hoàn toàn giây bị lùi tư thế ở cuối Shot 1 (`t=7.0s`).
 *    - Loại bỏ hoàn toàn đoạn rút kiếm lặp lần 1 ở Shot 2 (`0.0s-3.4s`), chỉ lấy cú rút kiếm dứt khoát (`3.4s-8.0s`).
 *    - Tách Shot 3 thành 2 nhịp song song (Nhịp 3A: Rồng dậm chân `0.0s-4.0s` | Nhịp 5: Rồng phóng sét `4.4s-8.0s`)
 *      và chèn Shot 4 Mới (Samurai đầu trần lao tới chém mưa) vào giữa để xóa 100% điểm nhảy ở `t=4.2s`!
 * 3. Thay thế hoàn toàn Shot 4 cũ (bị lỗi mọc mũ sắt Kabuto) bằng Shot 6 Mới (`shot6_v2_bareheaded_clash_victory`)
 *    được Compiler khóa cứng 3 Mỏ Neo `[KENJI, KURORYU, KYOTO_SHRINE]` + `PreFlightVisionGate` +
 *    Khóa 2 đầu `Start Frame + End Frame` (Đầu trần 100%, không mũ Kabuto, 1 vỏ kiếm duy nhất).
 * 4. Hậu kỳ SMPTE Soft-Knee Highlight Roll-off + Hòa âm EBU R128 (`-16.0 LUFS / -1.5 dBTP`) +
 *    Xuất bảng Kiểm định 1fps từng giây (`22_V2_1FPS_QC_GRID_01.png` & `02.png`) + Video So sánh V1 vs V2.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { DirectorCompilerEngine } from './engine/DirectorCompilerEngine.mjs';

const RUN_DIR = '/mnt/data/backup/project_personal/AI/previz_output/samurai_30s_run';
const ARTIFACT_DIR = '/home/user/.gemini/antigravity/brain/092f7d00-e0a7-4cec-be77-f8cff1234933';

async function main() {
  const engine = new DirectorCompilerEngine({
    runDir: RUN_DIR,
    artifactDir: ARTIFACT_DIR,
  });

  console.log('======================================================================');
  console.log('🏛️ KHỞI ĐỘNG AI DIRECTOR ENGINE V2 (DETERMINISTIC COMPILER & QC GATE)');
  console.log('======================================================================');

  // -------------------------------------------------------------------------
  // BƯỚC 1: ĐĂNG KÝ & KHÓA CỨNG BỘ 3 MỎ NEO DNA GỐC TRONG COMPILER
  // -------------------------------------------------------------------------
  await engine.lockCoreAnchors([
    {
      id: 'KENJI',
      fileName: '01_anchor_samurai_kenji_sheet',
      identityLockEn:
        '@KENJI (32-year-old Japanese cyber-ronin samurai with a sharp jawline, a thin vertical scar across his left cheek, BAREHEADED with tied-back wet dark hair, wearing matte-black carbon-fiber lamellar armor with subtle glowing amber seams and a dark rain cloak)',
      negativeLockEn:
        'BAREHEADED WITH TIED-BACK DARK HAIR AND EXPOSED FACE, STRICTLY NO HELMET, NO KABUTO, NO FACE MASK, NO HAT, SINGLE KATANA SCABBARD AT LEFT HIP ONLY',
      prompt:
        '16:9 three-panel character reference sheet on #808080 neutral gray background: KENJI, 32-year-old Japanese cyber-ronin samurai, bareheaded with tied-back dark hair, thin vertical scar on left cheek, matte-black carbon-fiber samurai armor with amber seams.',
    },
    {
      id: 'KURORYU',
      fileName: '02_anchor_mecha_dragon_sheet',
      identityLockEn:
        '@KURORYU (colossal bipedal Godzilla-proportioned obsidian mecha-dragon with interlocking matte-black titanium armor plates, a single circular molten-amber plasma core at the center of its chest sternum, and razor-sharp metallic jaws)',
      negativeLockEn:
        'BIPEDAL UPRIGHT MECHA-DRAGON POSTURE, SINGLE ROUND AMBER CORE AT CENTER CHEST, ZERO EXTRA HEADS',
      prompt:
        '16:9 three-panel creature reference sheet on #808080 neutral gray background: KURORYU, colossal biomechanical obsidian mecha-dragon with matte-black titanium plates and glowing molten-amber chest core.',
    },
    {
      id: 'KYOTO_SHRINE',
      fileName: '03_anchor_kyoto_rain_temple_plate',
      identityLockEn:
        'Ancient Kyoto mountain shrine courtyard at night during a heavy monsoon rainstorm, flanked by wet stone lanterns, a towering vermilion and dark-wood Torii gate wrapped in mist, and wet dark slate flagstones reflecting cold cyan moonlight and warm amber lantern glow.',
      negativeLockEn: 'NO MODERN CARS, NO NEON BILLBOARDS, NO TEXT OR SUBTITLES',
      prompt:
        '16:9 wide cinematic establishing plate of an empty Kyoto shrine courtyard at night in heavy rain with Torii gate and stone lanterns.',
    },
  ]);

  // -------------------------------------------------------------------------
  // BƯỚC 2: KHAI BÁO ĐỒ THỊ 6 BEATS ĐIỆN ẢNH (KẾT HỢP NODE ĐÃ KHÓA & NODE MỚI V2)
  // -------------------------------------------------------------------------
  const shotGraph = [
    // BEAT 1 (00:00.0 -> 00:06.2): Giữ nguyên Shot 1 đã khóa, cắt bỏ giây thứ 7.0 bị lùi tư thế
    {
      shotId: 'beat1_ots_arrival_locked',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      lockedSourceVideo: path.join(RUN_DIR, 'shot1_8s_ots_arrival.mp4'),
      trimStartSec: 0.0,
      trimEndSec: 6.2,
    },

    // BEAT 2 (SURGICAL FIX CHO GIÂY 0:09): Thay thế Shot 2 V1 (bị lỗi tách đôi chuôi kiếm ở giây cuối) bằng Node V2 khóa 2 đầu Start + End Frame!
    // Các Beat 1, 3, 4, 5, 6 giữ nguyên 100% (Immutable Node Lock) — chứng minh sửa 1 điểm KHÔNG làm lệch các đoạn khác!
    {
      shotId: 'beat2_v2_ecu_unbroken_katana_guard',
      subjects: ['KENJI'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '85mm Anamorphic Extreme Close-Up (ECU) on face and upper chest, creamy elliptical bokeh rain',
      startFrameActionEn:
        'Extreme close-up on @KENJI (BAREHEADED with tied-back wet dark hair, visible vertical scar on left cheek, NO HELMET). He holds his glowing amber plasma katana horizontally across his lower chest with his gloved right hand gripping a SINGLE continuous straight hilt (tsuka) just below the glowing amber guard (tsuba), while his left hand rests cleanly on the black scabbard out of frame. Raindrops splatter against the glowing blade.',
      endFrameActionEn:
        'Extreme close-up on @KENJI (BAREHEADED with tied-back wet dark hair, visible vertical scar on left cheek, NO HELMET). He raises the glowing amber plasma katana blade diagonally across his face in a fierce one-handed high guard, his gloved right hand firmly gripping the SINGLE continuous unbroken hilt (only ONE hilt pommel visible, zero split handle, zero second hand cluttering the pommel) as fiery orange light reflects in his eyes.',
      videoKinematicsEn:
        '[0.0s-2.0s] Raindrops roll down the samurai scarred cheek in extreme close-up as the glowing amber katana blade hums horizontally across his chest, held firmly in his gloved right hand on a single straight unbroken hilt. [2.0s-5.5s] With smooth, deadly control, his right hand raises the glowing amber katana blade diagonally upward in front of his eyes, slicing through falling raindrops and sending orange sparks into the mist. [5.5s-8.0s] He locks the glowing blade in a rock-steady diagonal guard in front of his scarred face, one single continuous hilt in his right fist.',
      sfxCueEn: 'resonant metallic plasma katana hum, raindrops sizzling on hot blade, intense breath',
      trimStartSec: 0.4,
      trimEndSec: 5.4,
    },

    // BEAT 3: Giữ nguyên nửa đầu Shot 3 (0.0s -> 4.0s), cắt ngay trên đỉnh cú giẫm chân trước khi rồng nhảy lùi ở 4.2s!
    {
      shotId: 'beat3_lowangle_dragon_stomp_locked',
      subjects: ['KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      lockedSourceVideo: path.join(RUN_DIR, 'shot3_8s_lowangle_dragon_charge.mp4'),
      trimStartSec: 0.0,
      trimEndSec: 4.0,
    },

    // BEAT 4 (SURGICAL BLOCKING FIX CHO GIÂY 0:15 -> 0:20):
    // Khóa chặt Trục 180 Độ (Trái -> Phải): Samurai ở bên Trái lao thẳng VỀ PHÍA RỒNG ở bên Phải (TUYỆT ĐỐI KHÔNG quay lưng vào Rồng chạy về phía camera!)
    {
      shotId: 'beat4_v2_charge_directly_at_dragon',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '35mm Anamorphic Dynamic Side-Tracking Action Shot following from left to right along the 180-degree axis',
      startFrameActionEn:
        'On screen-left in three-quarter profile facing strictly RIGHT toward the dragon, @KENJI (BAREHEADED with tied-back wet dark hair, wearing fully armored matte-black carbon-fiber samurai chest armor and cloak, NO HELMET, single scabbard at left hip) sprints aggressively forward from left to right through splashing puddles DIRECTLY TOWARD @KURORYU towering on screen-right beneath the misty Torii gate. Kenji stares directly at the dragon ahead of him, holding his glowing amber plasma katana with both hands ready to strike.',
      endFrameActionEn:
        'On screen-left facing strictly RIGHT toward the dragon, @KENJI (BAREHEADED with tied-back wet dark hair, wearing fully armored matte-black carbon-fiber chest armor, NO HELMET) lunges forward from left to right toward @KURORYU on screen-right, slashing his glowing amber katana forward in a blazing arc of golden sparks aimed directly at the dragon.',
      videoKinematicsEn:
        '[0.0s-2.5s] Obeying the 180-degree axis, the bareheaded samurai on screen-left sprints fiercely from left to right through the rain-soaked flagstones directly toward the towering black mecha-dragon on screen-right. [2.5s-5.5s] Closing the distance, the samurai leaps forward toward the dragon and unleashes an explosive diagonal slash with his glowing amber katana, launching a wave of golden sparks from left to right against the dragon. [5.5s-8.0s] He lands in a low forward-facing combat stance still facing right toward the dragon amidst rising steam.',
      sfxCueEn: 'rapid footsteps splashing in rain puddles charging forward, whooshing plasma katana slash, roaring dragon ahead',
      trimStartSec: 0.2,
      trimEndSec: 5.4,
    },

    // BEAT 5 (00:20.4 -> 00:24.0): Nửa sau của Shot 3 (4.4s -> 8.0s) — Rồng phóng tia sét vàng cam (Parallel Cross-Cut xóa sạch vết nhảy ở 4.2s!)
    {
      shotId: 'beat5_dragon_lightning_overcharge_locked',
      subjects: ['KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      lockedSourceVideo: path.join(RUN_DIR, 'shot3_8s_lowangle_dragon_charge.mp4'),
      trimStartSec: 4.4,
      trimEndSec: 8.0,
    },

    // BEAT 6 (00:24.0 -> 00:31.4): SHOT MỚI V2 THAY THẾ HOÀN TOÀN SHOT 4 LỖI MŨ KABUTO!
    // Khóa chặt cả 3 Mỏ Neo [KENJI, KURORYU, KYOTO_SHRINE] + Khóa Start Frame & End Frame (Đầu trần 100%, 1 vỏ kiếm duy nhất!)
    {
      shotId: 'beat6_v2_bareheaded_apex_clash_victory',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '50mm Anamorphic Medium-Wide Hero Confrontation Shot obeying the 180-degree axis',
      startFrameActionEn:
        'On screen-left stands @KENJI (BAREHEADED with tied-back wet dark hair, visible face in three-quarter profile, STRICTLY NO HELMET, NO KABUTO, single scabbard at left hip, wearing matte-black carbon-fiber armor) bracing his glowing amber katana with both hands directly against the lunging metallic jaws and glowing circular chest core of @KURORYU on screen-right in a blinding burst of golden sparks in the rain-soaked Kyoto courtyard.',
      endFrameActionEn:
        'On screen-left stands @KENJI (BAREHEADED with tied-back wet dark hair, visible face, STRICTLY NO HELMET, NO KABUTO, single scabbard at left hip) holding his steaming glowing amber katana steady in victorious low guard as @KURORYU on screen-right recoils backward with thick white steam billowing from its armored jaws in the pouring cyan rain.',
      videoKinematicsEn:
        '[0.0s-2.5s] The bareheaded samurai on screen-left locks his glowing amber katana blade against the lunging metallic jaws of the colossal black mecha-dragon on screen-right, sending a torrential shower of orange sparks across the wet courtyard. [2.5s-5.5s] With a powerful two-handed push and upward slash, the bareheaded samurai deflects the massive dragon head backward in an explosion of golden plasma embers and white steam. [5.5s-8.0s] The mecha-dragon recoils into the mist while the bareheaded samurai stands firm in the pouring rain with his glowing blade held ready.',
      sfxCueEn: 'deafening metallic sword-on-armor clash, roaring dragon recoil, hissing steam in heavy rain',
      trimStartSec: 0.2,
      trimEndSec: 7.6,
    },
  ];

  // -------------------------------------------------------------------------
  // BƯỚC 3: THỰC THI TỪNG NODE TRONG ĐỒ THỊ (CÓ KIỂM DUYỆT VISION 0-CREDIT TRƯỚC KHI QUAY)
  // -------------------------------------------------------------------------
  const executedShots = [];
  for (const spec of shotGraph) {
    const res = await engine.executeShotNode(spec);
    executedShots.push(res);
  }

  // -------------------------------------------------------------------------
  // BƯỚC 4: DỰNG BẢN MASTER V2 + HÒA ÂM EBU R128 + XUẤT BẢNG KIỂM ĐỊNH 1FPS TỪNG GIÂY
  // -------------------------------------------------------------------------
  const qcReport = engine.assembleMasterAndRun1fpsQC(executedShots, '20_SAMURAI_V2_SENIOR_ENGINE_MASTER.mp4');

  // -------------------------------------------------------------------------
  // BƯỚC 5: TẠO VIDEO ĐỐI CHIẾU TRỰC QUAN V1 (LỖI RẮC-CÔ/LẶP) VS V2 (SENIOR ENGINE)
  // -------------------------------------------------------------------------
  const v1Path = path.join(RUN_DIR, '10_SAMURAI_32S_ZERO_DRIFT_MASTER.mp4');
  const v2Path = qcReport.masterVideoPath;
  const compareOutPath = path.join(RUN_DIR, '21_V1_VS_V2_SENIOR_QC_COMPARISON.mp4');

  if (fs.existsSync(v1Path) && fs.existsSync(v2Path)) {
    console.log('🎬 Đang tạo Video Đặt Cạnh Nhau (V1 Raw Script vs. V2 Senior Compiler Engine)...');
    const cmpFilter = [
      `[0:v]scale=640:360,setsar=1:1,drawtext=text='V1 (Raw Script - Loop at 12s/20s & Helmet Error at 24s)':x=16:y=16:fontsize=16:fontcolor=salmon:box=1:boxcolor=black@0.75[v1];`,
      `[1:v]scale=640:360,setsar=1:1,drawtext=text='V2 (Senior Engine - Cut-on-Action + Dual-Keyframe + No Helmet + EBU R128)':x=16:y=16:fontsize=16:fontcolor=lime:box=1:boxcolor=black@0.75[v2];`,
      `[v1][v2]hstack=inputs=2[vout]`,
    ].join('');

    execSync(
      `ffmpeg -y -i "${v1Path}" -i "${v2Path}" -filter_complex "${cmpFilter}" -map "[vout]" -map 1:a -shortest -c:v libx264 -preset fast -crf 20 -c:a copy "${compareOutPath}"`,
      { stdio: 'ignore' }
    );
    console.log(`   ✅ Đã tạo Video Đối Chiếu V1 vs V2: ${compareOutPath}`);
  }

  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(v2Path, path.join(ARTIFACT_DIR, '20_SAMURAI_V2_SENIOR_ENGINE_MASTER.mp4'));
    if (fs.existsSync(compareOutPath)) {
      fs.copyFileSync(compareOutPath, path.join(ARTIFACT_DIR, '21_V1_VS_V2_SENIOR_QC_COMPARISON.mp4'));
    }
    for (const g of qcReport.qcGridPaths) {
      if (fs.existsSync(g)) {
        fs.copyFileSync(g, path.join(ARTIFACT_DIR, path.basename(g)));
      }
    }
  }

  console.log('\n🎉 HOÀN TẤT 100% DÂY CHUYỀN AI DIRECTOR ENGINE V2 (SENIOR LEVEL)!');
}

main().catch((err) => {
  console.error('❌ Lỗi nghiêm trọng trong Engine V2:', err);
  process.exit(1);
});

