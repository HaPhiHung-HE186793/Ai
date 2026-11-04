#!/usr/bin/env node
/**
 * ============================================================================
 * RUN V5: 5-DEPARTMENT INTERNATIONAL FILM STUDIO PIPELINE
 * (PERSISTENT WORLD-STATE & SET CONTINUITY + Z-DEPTH CLEARANCE UPGRADE)
 * ============================================================================
 * Giải quyết triệt để bài toán Đồng bộ Hiện trường Bối cảnh (Set / World-State Continuity):
 *   - Ở V3: Rồng đứng DƯỚI gầm cổng Torii, ngóc đầu xuyên qua xà ngang cổng (lỗi xuyên thấu).
 *   - Ở V4: Rồng húc gãy cổng Torii ở Cảnh 1, nhưng sang Cảnh 2, 3, 4, 5, 6 cổng Torii ở
 *     hậu cảnh lại nguyên vẹn (lỗi rắc-cô hiện trường: cảnh trước phá rồi sao cảnh sau còn nguyên!).
 *   - Giải pháp Chuẩn Quốc Tế V5 (RULE_ART_WORLD_STATE_07 - 3D Z-Depth Staging & Set Lock):
 *     1. Đặt @KURORYU đứng HẲN VỀ PHÍA TRƯỚC cổng Torii 3 mét trong sân đền (IN FRONT OF the
 *        intact red Torii gate, clear of the crossbar). Khi Rồng vươn mình đứng dậy, móng vuốt
 *        Rồng dậm nát mặt đá sân đền dưới chân, đầu Rồng vươn cao ở mặt phẳng phía trước cổng
 *        (không chạm vào cổng -> KHÔNG XUYÊN THẤU, và CỔNG TORII GIỮ NGUYÊN VẸN 100% XUYÊN SUỐT CẢ 6 CẢNH!).
 *     2. Rồng vẫn khạc luồng cầu lửa plasma vàng rực bắn thẳng trực diện vào @KENJI ở 0:03-0:05,
 *        nối khớp 100% với cảnh @KENJI giơ kiếm 45° đỡ cầu lửa ở 0:06-0:09!
 *     3. Giữ nguyên Biểu đồ Khoảng cách Một chiều [15m -> 15m -> (15m->2m) -> 2m -> 2m -> 2m]!
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
  console.log('🏛️ KHỞI ĐỘNG BỘ MÁY 5 PHÒNG BAN QUỐC TẾ V5 (PERSISTENT WORLD-STATE CONTINUITY)');
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

  // 2. Ghi nhận Bài Học Rắc-cô Hiện trường (Set Continuity / World-State Persistence) vào Sổ tay Phòng 2 & Phòng 3
  kb.recordDefectAndLearnRule(
    'DEPT_02_ART_COSTUME_PROP',
    'beat1_to_beat6_world_state_audit',
    'SET_DRESSING_TORII_DESTRUCTION_CONTINUITY_MISMATCH',
    'Ở bản V4, Cảnh 1 phá gãy cổng Torii nhưng sang các Cảnh 2, 3, 4, 5, 6 cổng Torii ở hậu cảnh lại còn nguyên vẹn (vi phạm tính liên tục của hiện trường bối cảnh - Persistent World State).',
    'RULE_ART_WORLD_STATE_07: Mọi trạng thái kiến trúc bối cảnh (như cổng Torii) phải đồng nhất từ Cảnh 1 đến Cảnh 6. Đặt @KURORYU đứng ở sân đền PHÍA TRƯỚC cổng Torii (standing IN FRONT OF the intact Torii gate, clear in Z-depth) để khi Rồng vươn đầu phun lửa vào Samurai thì không chạm/xuyên qua xà ngang cổng, đồng thời giữ cổng Torii nguyên vẹn 100% khớp với toàn bộ các cảnh sau!'
  );

  // 3. Đồ thị 6 Beats Điện Ảnh V5 (Đồng bộ 100%: Không xuyên cổng + Hiện trường cổng nguyên vẹn xuyên suốt + Đạn đạo cầu lửa + Khoảng cách 15m->2m)
  const v5ShotGraph = [
    // BEAT 1 (0:00 -> 0:05.5) | Cự ly: [15m -> 15m]
    // Rồng đứng Ở PHÍA TRƯỚC cổng Torii (đã bước qua cổng vào sân đền):
    //   - Chân dậm nứt mặt đá sân đền (tương tác vật lý mặt đất)
    //   - Đầu vươn lên ở phía trước cổng (không xuyên qua xà ngang cổng)
    //   - Cổng Torii phía sau lưng giữ nguyên vẹn 100% (đồng bộ hoàn toàn với Cảnh 2, 3, 4, 5, 6!)
    //   - Miệng khạc luồng cầu lửa plasma bắn thẳng trực diện vào @KENJI (đồng bộ 100% với cảnh đỡ kiếm ở 0:06!)
    {
      shotId: 'beat1_v5_in_front_of_intact_torii_direct_fireball',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'DIRECT_PROJECTILE_ATTACK',
      distanceStartMeters: 15,
      distanceEndMeters: 15,
      cameraLens: '35mm Anamorphic Wide Establishing OTS Shot, low angle',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI Screen-Left Foreground (facing Right) <-> @KURORYU at 15m standing IN FRONT OF the intact Torii Gate (facing Left)',
      causalLink: {
        cause: 'Colossal Mecha-Dragon stands in the open courtyard IN FRONT OF the intact red Torii gate, 15m from Kenji',
        effect: 'Dragon stomps the wet stone flagstones and blasts a focused stream of golden plasma fire straight at Kenji while the Torii gate behind it remains intact, forcing Kenji to block the fireball in Beat 2'
      },
      startFrameActionEn:
        'Wide low-angle over-the-shoulder shot past @KENJI standing on screen-left foreground (BAREHEADED with tied-back wet dark hair, NO HELMET, single scabbard on left hip, gripping his glowing amber-cyan katana in his right hand, 100% RIGID STRAIGHT STEEL BLADE, SINGLE UNBROKEN STRAIGHT TSUKA HILT) looking across 15 meters of rain-soaked flagstones toward colossal @KURORYU standing clearly IN FRONT OF the intact red wooden Torii gate in the open courtyard on screen-right (the intact red Torii gate stands several meters behind the dragon as a clean background landmark).',
      endFrameActionEn:
        'Wide low-angle over-the-shoulder shot past @KENJI bracing his glowing katana in the left foreground (SINGLE UNBROKEN STRAIGHT TSUKA HILT) as colossal @KURORYU standing IN FRONT OF the intact red wooden Torii gate stomps the wet stone pavement (cracking the flagstones under its feet) and blasts a massive concentrated stream of golden-amber plasma fire straight forward DIRECTLY AT @KENJI in the left foreground! The red wooden Torii gate behind the dragon remains 100% intact and undamaged.',
      videoKinematicsEn:
        '[0.0s-2.0s] Standing in the open courtyard clearly in front of the intact red Torii gate, the colossal black mecha-dragon stomps its heavy mechanical foot into the wet flagstones, splashing mud and cracking the stone under its claws while the Torii gate behind it remains completely intact. [2.0s-5.5s] The mecha-dragon opens its jaws and blasts a concentrated torrent of golden plasma fire straight forward along the axis directly at @KENJI in the left foreground, engulfing the air right in front of the bareheaded samurai in blinding golden fire and sparks.',
      sfxCueEn: 'heavy mechanical stomp cracking wet stone pavement, roaring plasma fireball stream rushing straight toward the samurai',
      trimStartSec: 0.0,
      trimEndSec: 5.5
    },

    // BEAT 2 (0:05.5 -> 0:10.0) | Cự ly: [15m -> 15m]
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

    // BEAT 3 (0:10.0 -> 0:15.2) | Cự ly: [15m -> 2m] (Chạy thu hẹp khoảng cách từ 15m vào 2m & Nhảy chém ngực Rồng; cổng Torii phía sau nguyên vẹn!)
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

    // BEAT 4 (0:15.2 -> 0:19.2) | Cự ly: [2m -> 2m] (Vết chém trên ngực Rồng phát nổ; cổng Torii phía sau nguyên vẹn!)
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

    // BEAT 5 (0:19.2 -> 0:23.7) | Cự ly: [2m -> 2m] (Cận chiến ở cự ly 2 bước chân; cổng Torii phía sau nguyên vẹn!)
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

    // BEAT 6 (0:23.7 -> 0:30.9) | Cự ly: [2m -> 2m] (Giao kiếm kết liễu ở cự ly 2m; cổng Torii phía sau nguyên vẹn!)
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

  // 4. Chạy dây chuyền 5 Phòng Ban Độc Lập
  const executedShots = [];
  for (let i = 0; i < v5ShotGraph.length; i++) {
    const rawSpec = v5ShotGraph[i];
    console.log('\n================================================================================');
    console.log(
      `🎬 BẮT ĐẦU DÂY CHUYỀN 5 PHÒNG BAN V5 CHO BEAT ${i + 1}/6: ${rawSpec.shotId} [${rawSpec.distanceStartMeters}m -> ${rawSpec.distanceEndMeters}m]`
    );
    console.log('================================================================================');

    const approvedSpec = dept01Director.auditAndApproveBeat(rawSpec, i, v5ShotGraph);
    const compiledPrompts = dept02PropMaster.auditAndCompilePrompts(approvedSpec);
    await dept03AscLayout.produceAndAuditKeyframes(approvedSpec, compiledPrompts);
    const executed = await dept04VesVideo.renderAndAuditVideoBeat(approvedSpec);
    executedShots.push(executed);
  }

  // 5. PHÒNG 5: Xuất bản Master V5
  const finalDeliverable = dept05PostMaster.masterAndAuditFinalFilm(
    executedShots,
    '50_SAMURAI_V5_WORLD_STATE_CONTINUITY_MASTER.mp4'
  );

  const qcGrid1 = path.join(RUN_DIR, '51_V5_WORLD_STATE_1FPS_QC_GRID_01.png');
  const qcGrid2 = path.join(RUN_DIR, '51_V5_WORLD_STATE_1FPS_QC_GRID_02.png');
  execSync(
    `ffmpeg -y -i "${finalDeliverable.masterPath}" -vf "fps=1,scale=480:270,drawtext=text='V5 WORLD-STATE QC t=%{pts\\:hms}':x=10:y=10:fontsize=18:fontcolor=lime:box=1:boxcolor=black@0.75,tile=4x4" -frames:v 2 "${path.join(RUN_DIR, '51_V5_WORLD_STATE_1FPS_QC_GRID_%02d.png')}"`,
    { stdio: 'ignore' }
  );

  kb.exportFullReport(KB_PATH);
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(finalDeliverable.masterPath, path.join(ARTIFACT_DIR, '50_SAMURAI_V5_WORLD_STATE_CONTINUITY_MASTER.mp4'));
    fs.copyFileSync(qcGrid1, path.join(ARTIFACT_DIR, '51_V5_WORLD_STATE_1FPS_QC_GRID_01.png'));
    fs.copyFileSync(qcGrid2, path.join(ARTIFACT_DIR, '51_V5_WORLD_STATE_1FPS_QC_GRID_02.png'));
  }

  console.log('\n================================================================================');
  console.log('🏆 HOÀN TẤT SẢN XUẤT BẢN MASTER V5 (100% PERSISTENT WORLD-STATE CONTINUITY)!');
  console.log(`   👉 Master V5 MP4: ${finalDeliverable.masterPath}`);
  console.log(`   👉 QC Grid 01:    ${qcGrid1}`);
  console.log(`   👉 QC Grid 02:    ${qcGrid2}`);
  console.log('================================================================================');
}

main().catch(err => {
  console.error('❌ Lỗi nghiêm trọng trong dây chuyền 5 Phòng Ban V5:', err);
  process.exit(1);
});

