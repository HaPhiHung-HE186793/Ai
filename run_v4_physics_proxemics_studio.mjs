#!/usr/bin/env node
/**
 * ============================================================================
 * RUN V4: 5-DEPARTMENT INTERNATIONAL FILM STUDIO PIPELINE
 * (INTER-SHOT PHYSICS, PROJECTILE TRAJECTORY & MONOTONIC PROXEMICS UPGRADE)
 * ============================================================================
 * Giải quyết triệt để 3 lỗi Liên Cảnh & Vật Lý do Đạo diễn/Khán giả phát hiện ở V3:
 *   1. Lỗi 0:03 (Xuyên thấu cổng Torii): Khi Rồng khổng lồ đứng dưới cổng Torii vươn cổ lên,
 *      thanh xà ngang bằng gỗ phía trên cổng Torii BẮT BUỘC PHẢI BỊ HÚC GÃY TUNG thành
 *      từng mảnh gỗ vụn bốc cháy (Rigid-Body Collision & Destruction Physics).
 *   2. Lỗi 0:05 -> 0:06 (Đứt gãy Đạn đạo): Cuối Beat 1 (0:04-0:05), Rồng BẮT BUỘC PHẢI
 *      KHẠC LUỒNG CẦU LỬA PLASMA BẮN THẲNG TRỰC DIỆN VÀO SAMURAI ở tiền cảnh Trái,
 *      để sang đầu Beat 2 (0:06) Samurai giơ kiếm nghiêng 45 độ đỡ luồng lửa đó nổ tung tóe!
 *   3. Lỗi 0:12 -> 0:15 (Nhảy lùi Khoảng cách Không gian): Khóa cứng Biểu đồ Khoảng cách
 *      Thu hẹp Một chiều (Monotonic Proxemics Graph):
 *        - Beat 1 (0:00 - 0:05.5): [15m -> 15m] Rồng húc vỡ xà ngang cổng Torii & bắn cầu lửa thẳng vào Kenji.
 *        - Beat 2 (0:05.5 - 0:10.0): [15m -> 15m] Kenji giơ kiếm 45° đỡ tan luồng cầu lửa đang bay tới.
 *        - Beat 3 (0:10.0 - 0:15.2): [15m -> 2m] Kenji lao từ xa (15m) thu hẹp khoảng cách, bật nhảy chém rách ngực Rồng và đáp xuống cách Rồng 2m.
 *        - Beat 4 (0:15.2 - 0:19.2): [2m -> 2m] Ở cự ly 2m, vết chém chéo trên lõi ngực Rồng xì khói đen và phát nổ quá tải điện từ.
 *        - Beat 5 (0:19.2 - 0:23.7): [2m -> 2m] Đang đứng sát nhau 2m, con Rồng bị thương điên cuồng vung vuốt vồ xuống ngay trước mặt Kenji nổ tung.
 *        - Beat 6 (0:23.7 - 0:30.9): [2m -> 2m] Ở đúng cự ly 2m đó, Kenji khóa kiếm đánh bật Rồng lùi vào màn sương và đứng thế chiến thắng!
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { DirectorCompilerEngine } from './engine/DirectorCompilerEngine.mjs';
import { DepartmentKnowledgeBase } from './engine/departments/DepartmentKnowledgeBase.mjs';
import { ShowrunnerDirectorDept } from './engine/departments/ShowrunnerDirectorDept.mjs';
import { ArtCostumePropDept } from './engine/departments/ArtCostumePropDept.mjs';
import { StoryboardLayoutPrevizDept } from './engine/departments/StoryboardLayoutPrevizDept.mjs';
import { VfxAnimationVideoDept } from './engine/departments/VfxAnimationVideoDept.mjs';
import { EditorialColorSoundPostDept } from './engine/departments/EditorialColorSoundPostDept.mjs';

const RUN_DIR = '/mnt/data/backup/project_personal/AI/previz_output/samurai_30s_run';
const ARTIFACT_DIR = '/home/user/.gemini/antigravity/brain/092f7d00-e0a7-4cec-be77-f8cff1234933';
const KB_PATH = path.join(RUN_DIR, 'STUDIO_5_DEPT_EXPERT_AUDIT_REPORT.json');

async function main() {
  console.log('================================================================================');
  console.log('🏛️ KHỞI ĐỘNG BỘ MÁY 5 PHÒNG BAN QUỐC TẾ V4 (PHYSICS, TRAJECTORY & PROXEMICS)');
  console.log('================================================================================\n');

  const kb = new DepartmentKnowledgeBase(KB_PATH);
  const engine = new DirectorCompilerEngine({
    runDir: RUN_DIR,
    artifactDir: ARTIFACT_DIR
  });

  const dept01Director = new ShowrunnerDirectorDept(kb);
  const dept02PropMaster = new ArtCostumePropDept(kb, engine);
  const dept03AscLayout = new StoryboardLayoutPrevizDept(kb, engine);
  const dept04VesVideo = new VfxAnimationVideoDept(kb, engine);
  const dept05PostMaster = new EditorialColorSoundPostDept(kb, engine);

  // 1. Khóa cứng 3 Mỏ Neo DNA gốc
  await engine.lockCoreAnchors([
    {
      id: 'KENJI',
      fileName: '01_anchor_samurai_kenji_sheet',
      identityLockEn:
        '@KENJI (32-year-old Japanese cyber-ronin samurai with a sharp jawline, a thin vertical scar across his left cheek, BAREHEADED with tied-back wet dark hair, wearing matte-black carbon-fiber lamellar armor with subtle glowing amber seams and a dark rain cloak)',
      negativeLockEn:
        'BAREHEADED WITH TIED-BACK DARK HAIR AND EXPOSED FACE, STRICTLY NO HELMET, NO KABUTO, NO FACE MASK, NO HAT, SINGLE KATANA SCABBARD AT LEFT HIP ONLY',
      prompt:
        '16:9 three-panel character reference sheet on #808080 neutral gray background: KENJI, 32-year-old Japanese cyber-ronin samurai, bareheaded with tied-back dark hair, thin vertical scar on left cheek, matte-black carbon-fiber samurai armor with amber seams.'
    },
    {
      id: 'KURORYU',
      fileName: '02_anchor_mecha_dragon_sheet',
      identityLockEn:
        '@KURORYU (colossal bipedal Godzilla-proportioned obsidian mecha-dragon with interlocking matte-black titanium armor plates, a single circular molten-amber plasma core at the center of its chest sternum, and razor-sharp metallic jaws)',
      negativeLockEn:
        'BIPEDAL UPRIGHT MECHA-DRAGON POSTURE, SINGLE ROUND AMBER CORE AT CENTER CHEST, ZERO EXTRA HEADS',
      prompt:
        '16:9 three-panel creature reference sheet on #808080 neutral gray background: KURORYU, colossal biomechanical obsidian mecha-dragon with matte-black titanium plates and glowing molten-amber chest core.'
    },
    {
      id: 'KYOTO_SHRINE',
      fileName: '03_anchor_kyoto_rain_temple_plate',
      identityLockEn:
        'Ancient Kyoto mountain shrine courtyard at night during a heavy monsoon rainstorm, flanked by wet stone lanterns, a towering vermilion and dark-wood Torii gate wrapped in mist, and wet dark slate flagstones reflecting cold cyan moonlight and warm amber lantern glow.',
      negativeLockEn: 'NO MODERN CARS, NO NEON BILLBOARDS, NO TEXT OR SUBTITLES',
      prompt:
        '16:9 wide cinematic establishing plate of an empty Kyoto shrine courtyard at night in heavy rain with Torii gate and stone lanterns.'
    }
  ]);

  // 2. Ghi nhận 3 Bài Học Vật Lý - Đạn Đạo - Khoảng Cách V4 vào Sổ tay 5 Phòng Ban
  kb.recordDefectAndLearnRule(
    'DEPT_04_VFX_ANIMATION_VIDEO',
    'beat1_v3_torii_collision_audit',
    'RIGID_BODY_TORII_CROSSBAR_INTERPENETRATION_AT_00_03',
    'Ở bản V3 giây 0:03, đầu Rồng ngóc lên xuyên qua thanh xà ngang bằng gỗ của cổng Torii mà cổng không bị gãy vỡ.',
    'RULE_VES_PHYSICS_04: Khi vật thể khổng lồ (@KURORYU) vươn đầu qua gầm cổng Torii, thanh xà ngang phía trên của cổng Torii BẮT BUỘC PHẢI BỊ HÚC GÃY TUNG thành các mảnh gỗ vỡ bốc cháy (Rigid-Body Destruction Physics).'
  );

  kb.recordDefectAndLearnRule(
    'DEPT_01_SHOWRUNNER_DIRECTOR',
    'beat1_to_beat2_trajectory_audit',
    'UNMOTIVATED_DEFENSE_BROKEN_PROJECTILE_HANDOFF_00_05_TO_00_06',
    'Ở bản V3 giây 0:05, Rồng phóng tia lửa xuống đất ở 2 bên cột cổng (không bắn vào Samurai), làm cảnh Samurai giơ kiếm đỡ lửa ở giây 0:06 bị vô lý.',
    'RULE_DGA_PROJECTILE_05: Cuối Beat 1 (0:04-0:05), Rồng bắt buộc phải bắn một luồng cầu lửa plasma bay thẳng trực diện vào vị trí của @KENJI, nối khớp hoàn hảo với cảnh @KENJI giơ kiếm nghiêng 45 độ đỡ cầu lửa ở đầu Beat 2 (0:06).'
  );

  kb.recordDefectAndLearnRule(
    'DEPT_05_EDITORIAL_COLOR_SOUND_POST',
    'beat3_to_beat4_proxemics_audit',
    'SPATIAL_DISTANCE_REGRESSION_2M_TO_12M_AT_00_12_TO_00_15',
    'Ở bản V3, giây 0:12 hai nhân vật đã đứng sát nhau 2 bước chân (2m), nhưng sang giây 0:15 lại bị nhảy lùi ra xa 12m để chạy lại.',
    'RULE_POST_PROXEMICS_06: Khóa Biểu đồ Khoảng cách Thu hẹp Một chiều (15m -> 15m -> [15m->2m] -> 2m -> 2m -> 2m). Đặt cảnh chạy thu hẹp khoảng cách (15m->2m) ở Beat 3 trước, sau đó toàn bộ các Beat 4, 5, 6 đều diễn ra ở đúng cự ly cận chiến 2m!'
  );

  // 3. Đồ thị 6 Beats Điện Ảnh V4 (Tuân thủ tuyệt đối Vật lý Va chạm, Đạn đạo & Biểu đồ Khoảng cách 15m -> 2m)
  const v4ShotGraph = [
    // BEAT 1 (0:00 -> 0:05.5) | Cự ly: [15m -> 15m]
    // SỬA LỖI 0:03 & 0:05: Rồng vươn lên HÚC GÃY NÁT XÀ NGANG CỔNG TORII thành mảnh gỗ cháy bay tung tóe,
    // đồng thời KHẠC LUỒNG CẦU LỬA PLASMA BẮN THẲNG TRỰC DIỆN VÀO VỊ TRÍ CỦA SAMURAI KENJI ở tiền cảnh Trái!
    {
      shotId: 'beat1_v4_torii_shatter_and_direct_fireball',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'DIRECT_PROJECTILE_ATTACK',
      distanceStartMeters: 15,
      distanceEndMeters: 15,
      cameraLens: '35mm Anamorphic Wide Establishing OTS Shot, low angle',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI Screen-Left Foreground (facing Right) <-> @KURORYU at 15m under Torii Gate (facing Left)',
      causalLink: {
        cause: 'Colossal Mecha-Dragon rises up beneath the wooden Torii gate at 15m distance',
        effect: 'Dragon head physically shatters the upper wooden crossbar of the Torii gate into burning debris and blasts a stream of golden plasma fire straight at Kenji, forcing Kenji to block it with his katana in Beat 2'
      },
      startFrameActionEn:
        'Wide low-angle over-the-shoulder shot past @KENJI standing on screen-left foreground (BAREHEADED with tied-back wet dark hair, NO HELMET, single scabbard on left hip, gripping his glowing amber-cyan katana in his right hand) looking across 15 meters of rain-soaked flagstones toward colossal @KURORYU crouched low beneath the intact red wooden Torii gate on screen-right.',
      endFrameActionEn:
        'Wide low-angle over-the-shoulder shot past @KENJI bracing his glowing katana in the left foreground as colossal @KURORYU rears up tall, its armored head and shoulders VIOLENTLY SHATTERING AND BREAKING THE UPPER RED WOODEN CROSSBAR OF THE TORII GATE INTO FLYING BURNING TIMBER SPLINTERS (broken Torii gate top beam exploding outward), while @KURORYU blasts a massive focused stream of golden-amber plasma fire straight forward DIRECTLY AT @KENJI in the left foreground!',
      videoKinematicsEn:
        '[0.0s-2.5s] As the colossal black mecha-dragon rises up beneath the red wooden Torii gate, its massive armored head and shoulders physically collide with and violently shatter the upper wooden crossbar of the Torii gate, sending broken red wooden beams and burning splinters flying through the rain. [2.5s-5.5s] Through the shattered Torii gate, the mecha-dragon opens its jaws and blasts a concentrated torrent of golden plasma fire straight forward along the axis directly at @KENJI in the left foreground, engulfing the air right in front of the samurai in blinding golden fire and sparks.',
      sfxCueEn: 'colossal wooden Torii beam cracking and shattering into splinters, roaring plasma fireball blast rushing straight toward camera',
      trimStartSec: 0.0,
      trimEndSec: 5.5
    },

    // BEAT 2 (0:05.5 -> 0:10.0) | Cự ly: [15m -> 15m]
    // Nối khớp Đạn đạo 100% với cuối Beat 1: Cầu lửa vừa bay tới từ 0:05 -> Ở 0:06 Kenji giơ kiếm nghiêng 45 độ ĐỠ TAN LUỒNG LỬA ĐÓ!
    {
      shotId: 'beat2_v3_ecu_rigid_45deg_katana',
      subjects: ['KENJI'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'DEFLECT_INCOMING_PROJECTILE',
      distanceStartMeters: 15,
      distanceEndMeters: 15,
      cameraLens: '85mm Anamorphic Extreme Close-Up (ECU) on face and diagonal katana guard, shallow bokeh rain',
      spatialAxisLock: '180-DEGREE EYELINE LOCK: @KENJI on Screen-Left looking strictly Right, holding rigid 45-degree katana deflecting incoming dragon fireball',
      causalLink: {
        cause: 'Incoming golden plasma fireball blasted directly at Kenji at the end of Beat 1 (0:05)',
        effect: 'Kenji blocks and slices the incoming fireball with his rigid 45-degree katana into sparks and white steam, then immediately sprints forward in Beat 3 to close the 15m gap'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat2_v3_ecu_rigid_45deg_katana_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 4.7
    },

    // BEAT 3 (0:10.0 -> 0:15.2) | Cự ly: [15m -> 2m] (THU HẸP KHOẢNG CÁCH TỪ 15M VÀO ÁP SÁT 2M & CHÉM TRÚNG NGỰC RỒNG!)
    // Đặt đúng thứ tự Vật lý: Sau khi đỡ đòn bắn xa ở 15m (Beat 2), Kenji mới chạy từ 15m vào áp sát 2m, bật nhảy chém rách ngực Rồng và đáp xuống cách Rồng 2 bước chân!
    {
      shotId: 'beat4_v2_charge_directly_at_dragon',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLOSE_DISTANCE_AND_SLASH_CHEST',
      distanceStartMeters: 15,
      distanceEndMeters: 2,
      cameraLens: '35mm Anamorphic Dynamic Side-Tracking Action Shot following from left to right along the 180-degree axis',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI sprints from Screen-Left (15m) to Screen-Right (2m), leaps and slashes @KURORYU chest core',
      causalLink: {
        cause: 'Having deflected the ranged fireball at 15m in Beat 2, Kenji charges across the courtyard to close the 15m distance',
        effect: 'Kenji closes the gap from 15m to 2m, leaps mid-air to slash across the Dragon chest core, and lands 2 steps (2m) in front of the wounded Dragon'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat4_v2_charge_directly_at_dragon_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 5.4
    },

    // BEAT 4 (0:15.2 -> 0:19.2) | Cự ly: [2m -> 2m] (HỆ QUẢ TRỰC TIẾP Ở CỰ LY GẦN 2M: VẾT CHÉM TRÊN LÕI NGỰC RỒNG PHÁT NỔ!)
    {
      shotId: 'beat5_v3_ruptured_chest_reactor_no_sword',
      subjects: ['KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'WOUND_OVERLOAD_REACTION',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '50mm Anamorphic Medium Close-Up on Dragon positioned on Screen-Right angled Left at 2m range',
      spatialAxisLock: '180-DEGREE LOCK: @KURORYU on Screen-Right angled Left at 2m range, displaying the fresh diagonal molten gash across its chest reactor',
      causalLink: {
        cause: 'Direct physical damage from Kenji slashing the Dragon chest reactor at the end of Beat 3 (0:14)',
        effect: 'The cracked chest reactor leaks black smoke and explodes with unstable golden overload energy at 2m range, driving the wounded Dragon to lunge wildly at Kenji in Beat 5'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat5_v3_ruptured_chest_reactor_no_sword_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 4.2
    },

    // BEAT 5 (0:19.2 -> 0:23.7) | Cự ly: [2m -> 2m] (ĐÁNH CẬN CHIẾN Ở ĐÚNG CỰ LY 2 BƯỚC CHÂN — KHÔNG HỀ BỊ NHẢY LÙI KHOẢNG CÁCH!)
    {
      shotId: 'beat3_v3_dragon_lunge_right_to_left',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLOSE_QUARTERS_MELEE_CLASH',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '24mm Anamorphic Low-Angle 180-Degree Close-Quarters Action Shot (2m separation)',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI on Screen-Left and @KURORYU on Screen-Right engaged at 2-meter close-quarters range',
      causalLink: {
        cause: 'Enraged by its overloading chest reactor in Beat 4, the Dragon standing 2 steps (2m) in front of Kenji rears up for a desperate close-range claw smash',
        effect: 'The Dragon slams its claws down right at Kenji at 2m range in a blinding explosion of sparks, leading directly into Kenji parrying and knocking the Dragon back in Beat 6'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat3_v3_dragon_lunge_right_to_left_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 4.7
    },

    // BEAT 6 (0:23.7 -> 0:30.9) | Cự ly: [2m -> 2m] (KẾT LIỄU CẬN CHIẾN Ở CỰ LY 2M: ĐÁNH BẬT RỒNG LÙI VÀO SƯƠNG MÙ & CHIẾN THẮNG!)
    {
      shotId: 'beat6_v2_bareheaded_apex_clash_victory',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLIMAX_PARRY_AND_VICTORY',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '50mm Anamorphic Medium-Wide Hero Confrontation Shot obeying the 180-degree axis at 2m range',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI on Screen-Left clashes with and parries @KURORYU on Screen-Right at 2m range',
      causalLink: {
        cause: 'Continuing directly from the 2m close-quarters explosion at the end of Beat 5 (0:23.5)',
        effect: 'Kenji parries the Dragon backward in a massive shockwave of white steam and holds his victorious low-ready katana stance'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat6_v2_bareheaded_apex_clash_victory_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 7.4
    }
  ];

  // 4. Chạy dây chuyền 5 Phòng Ban Độc Lập cho từng Beat
  const executedShots = [];
  for (let i = 0; i < v4ShotGraph.length; i++) {
    const rawSpec = v4ShotGraph[i];
    console.log('\n================================================================================');
    console.log(
      `🎬 BẮT ĐẦU DÂY CHUYỀN 5 PHÒNG BAN V4 CHO BEAT ${i + 1}/6: ${rawSpec.shotId} [${rawSpec.distanceStartMeters}m -> ${rawSpec.distanceEndMeters}m]`
    );
    console.log('================================================================================');

    // PHÒNG 1: Đạo diễn DGA kiểm định Vật lý Va chạm, Đạn đạo Liên cảnh & Biểu đồ Khoảng cách
    const approvedSpec = dept01Director.auditAndApproveBeat(rawSpec, i, v4ShotGraph);

    // PHÒNG 2: Weta Prop Master kiểm định Đạo cụ, Phục trang & Biên dịch Prompt 3 Mỏ Neo
    const compiledPrompts = dept02PropMaster.auditAndCompilePrompts(approvedSpec);

    // PHÒNG 3: ASC DP & Script Supervisor dựng Keyframes & soi Vision 0-Credit
    await dept03AscLayout.produceAndAuditKeyframes(approvedSpec, compiledPrompts);

    // PHÒNG 4: VES Supervisor render video Veo 3.1 & soi dải 1fps Temporal Strip
    const executed = await dept04VesVideo.renderAndAuditVideoBeat(approvedSpec);
    executedShots.push(executed);
  }

  // 5. PHÒNG 5: ACE Editor kiểm định Khớp nối Khoảng cách Liên cảnh (Inter-Shot Proxemics Gate) & xuất Master V4
  const finalDeliverable = dept05PostMaster.masterAndAuditFinalFilm(
    executedShots,
    '40_SAMURAI_V4_PHYSICS_PROXEMICS_MASTER.mp4'
  );

  // 6. Tạo video đặt cạnh nhau (V3 vs V4 Physics & Proxemics Master)
  const v3Path = path.join(RUN_DIR, '30_SAMURAI_V3_5DEPT_INTERNATIONAL_MASTER.mp4');
  const v4Path = finalDeliverable.masterPath;
  const cmpPath = path.join(RUN_DIR, '42_V3_VS_V4_PHYSICS_PROXEMICS_COMPARISON.mp4');

  if (fs.existsSync(v3Path) && fs.existsSync(v4Path)) {
    console.log('\n🔬 Đang xuất Video Đối Chiếu Side-by-Side (V3 vs V4 Physics & Proxemics Master)...');
    const cmpFilter = [
      `[0:v]scale=640:360,setsar=1:1,drawtext=text='V3 (Torii Clipping at 03s, Side Blast at 05s, Distance Jump at 14s)':x=12:y=14:fontsize=15:fontcolor=yellow:box=1:boxcolor=black@0.75[v3];`,
      `[1:v]scale=640:360,setsar=1:1,drawtext=text='V4 (Torii Shatter + Direct Fireball + Monotonic 15m->2m Distance)':x=12:y=14:fontsize=15:fontcolor=lime:box=1:boxcolor=black@0.75[v4];`,
      `[v3][v4]hstack=inputs=2[vout]`
    ].join('');
    execSync(
      `ffmpeg -y -i "${v3Path}" -i "${v4Path}" -filter_complex "${cmpFilter}" -map "[vout]" -map 1:a -shortest -c:v libx264 -preset fast -crf 20 -c:a copy "${cmpPath}"`,
      { stdio: 'ignore' }
    );
    console.log(`   ✅ Đã xuất Video Đối Chiếu V3 vs V4: ${cmpPath}`);
  }

  // 7. Lưu Biên bản Nghiệm thu 5 Phòng Ban Quốc tế & Copy sang Artifact Directory
  kb.exportFullReport(KB_PATH);
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(v4Path, path.join(ARTIFACT_DIR, '40_SAMURAI_V4_PHYSICS_PROXEMICS_MASTER.mp4'));
    fs.copyFileSync(finalDeliverable.qcGrid1, path.join(ARTIFACT_DIR, '41_V4_PHYSICS_1FPS_QC_GRID_01.png'));
    fs.copyFileSync(finalDeliverable.qcGrid2, path.join(ARTIFACT_DIR, '41_V4_PHYSICS_1FPS_QC_GRID_02.png'));
    if (fs.existsSync(cmpPath)) {
      fs.copyFileSync(cmpPath, path.join(ARTIFACT_DIR, '42_V3_VS_V4_PHYSICS_PROXEMICS_COMPARISON.mp4'));
    }
  }

  console.log('\n================================================================================');
  console.log('🏆 HOÀN TẤT SẢN XUẤT BẢN MASTER V4 (PHYSICS, TRAJECTORY & PROXEMICS)!');
  console.log(`   👉 Master V4 MP4: ${v4Path}`);
  console.log(`   👉 QC Grid 01:    ${finalDeliverable.qcGrid1}`);
  console.log(`   👉 QC Grid 02:    ${finalDeliverable.qcGrid2}`);
  console.log(`   👉 Audit Report:  ${KB_PATH}`);
  console.log('================================================================================');
}

main().catch(err => {
  console.error('❌ Lỗi nghiêm trọng trong dây chuyền 5 Phòng Ban V4:', err);
  process.exit(1);
});

