#!/usr/bin/env node
/**
 * ============================================================================
 * RUN V3: 5-DEPARTMENT INTERNATIONAL FILM STUDIO PIPELINE
 * "CHRONO BLADE: THE DRAGON GATE" — 30s INTERNATIONAL EXPERT DIRECTOR'S CUT
 * ============================================================================
 * Quy trình 5 Phòng Ban Độc Lập Kiểm Soát Lẫn Nhau:
 *   - DEPT 01: Phòng Đạo Diễn & Biên Kịch Phân Cảnh (Hollywood DGA Action Director)
 *   - DEPT 02: Phòng Thiết Kế Mỹ Thuật, Phục Trang & Đạo Cụ (Weta Workshop Prop Master)
 *   - DEPT 03: Phòng Storyboard, 3D Layout & Quay Phim (ASC DP & Script Supervisor)
 *   - DEPT 04: Phòng Diễn Hoạt & Render Video AI (VES Temporal Physics Supervisor)
 *   - DEPT 05: Phòng Hậu Kỳ: Dựng Phim ACE, Màu SMPTE & Âm Thanh EBU R128
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
  console.log('🏛️ KHỞI ĐỘNG BỘ MÁY 5 PHÒNG BAN SẢN XUẤT PHIM QUỐC TẾ (V3 INTERNATIONAL STUDIO)');
  console.log('================================================================================\n');

  const kb = new DepartmentKnowledgeBase(KB_PATH);
  const engine = new DirectorCompilerEngine({
    runDir: RUN_DIR,
    artifactDir: ARTIFACT_DIR
  });

  // Khởi tạo 5 Phòng Ban Độc Lập với 5 Chuyên Gia Quốc Tế Gác Cổng
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

  // Ghi nhận các lỗi lịch sử mà 5 Phòng ban đã bắt được từ bản V2 để lưu vĩnh viễn vào Sổ tay Phòng ban
  kb.recordDefectAndLearnRule(
    'DEPT_02_ART_COSTUME_PROP',
    'beat2_v2_audit',
    'BLADE_ANGLE_MISMATCH_AT_00_06_AND_SPLIT_HILT_AT_00_09',
    'Ở bản V2, Start Frame giữ kiếm nằm ngang còn End Frame giữ kiếm chéo 45 độ khiến giây 0:06-0:07 mũi kiếm bị uốn dẻo khi xoay lên.',
    'RULE_PROP_V3_LOCK: Trong cảnh ECU vũ khí (Beat 2), cả Start Frame và End Frame bắt buộc giữ thanh Katana ở CÙNG MỘT GÓC NGHIÊNG 45 ĐỘ (Fixed 45-degree diagonal guard) với 1 chuôi kiếm thẳng liền mạch (Single Unbroken Tsuka Hilt).'
  );

  kb.recordDefectAndLearnRule(
    'DEPT_01_SHOWRUNNER_DIRECTOR',
    'beat3_and_beat5_v2_audit',
    'SYMMETRIC_CENTER_DRAGON_AXIS_AND_MISSING_SLASH_WOUND',
    'Ở bản V2, Beat 3 (0:11-0:14) và Beat 5 (0:20-0:23) dùng chung góc máy chính diện con Rồng đứng giữa màn hình, chưa khóa trục Phải->Trái đồng bộ với Beat 4 và chưa hiển thị vết chém chéo trên lõi ngực Rồng ở Beat 5.',
    'RULE_DGA_V3_LOCK: Beat 3 phải đặt Rồng ở bên Phải (Screen-Right) lao sang Trái về phía vai Kenji (OTS Screen-Left). Beat 5 phải đặc tả vết chém chéo rực lửa trên lõi ngực Rồng (hệ quả trực tiếp từ nhát chém của Kenji ở giây 0:18-0:19).'
  );

  // 2. Đồ thị 6 Beats Điện Ảnh V3 (Đã được 5 Chuyên Gia Quốc Tế thiết kế & kiểm soát)
  const v3ShotGraph = [
    // BEAT 1 (0:00 -> 0:05.5): Giữ Node 1 đã đạt chuẩn 100/100
    {
      shotId: 'beat1_ots_arrival_locked',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI Screen-Left Foreground (facing Right) <-> @KURORYU Center-Right under Torii Gate (facing Left)',
      causalLink: {
        cause: 'Opening standoff in rain-drenched Kyoto Shrine courtyard',
        effect: 'Dragon ignites molten amber chest core, forcing Kenji to lock his katana guard in Beat 2'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'shot1_8s_ots_arrival.mp4'),
      trimStartSec: 0.0,
      trimEndSec: 5.5
    },

    // BEAT 2 (0:05.5 -> 0:10.0): Đã được PHÒNG 2 (WETA PROP MASTER) & PHÒNG 3 (ASC DP) nâng cấp và khóa SHA-256
    {
      shotId: 'beat2_v3_ecu_rigid_45deg_katana',
      subjects: ['KENJI'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '85mm Anamorphic Extreme Close-Up (ECU) on face and diagonal katana guard, shallow bokeh rain',
      spatialAxisLock: '180-DEGREE EYELINE LOCK: @KENJI on Screen-Left looking strictly Right toward the Dragon, holding katana at fixed 45-degree diagonal guard angle',
      causalLink: {
        cause: 'Triggered by Dragon igniting its chest core in Beat 1',
        effect: 'Kenji locks his rigid 45-degree glowing plasma katana guard, provoking the Dragon to lunge in Beat 3'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat2_v3_ecu_rigid_45deg_katana_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 4.7
    },

    // BEAT 3 (0:10.0 -> 0:14.5): Đã được PHÒNG 1 (DGA ACTION DIRECTOR) & PHÒNG 3 (ASC DP) nâng cấp và khóa SHA-256
    {
      shotId: 'beat3_v3_dragon_lunge_right_to_left',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '24mm Anamorphic Low-Angle 180-Degree Action Shot (OTS past Kenji on Left toward Dragon lunging from Right)',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI dark armored shoulder on far Screen-Left foreground <-> @KURORYU on Screen-Right lunging aggressively from Right to Left',
      causalLink: {
        cause: 'Provoked by Kenji locking his glowing plasma katana guard in Beat 2',
        effect: 'Dragon lunges from Screen-Right toward Screen-Left, smashing stone lanterns and forcing Kenji to leap Left-to-Right in counter-attack in Beat 4'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat3_v3_dragon_lunge_right_to_left_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 4.7
    },

    // BEAT 4 (0:14.5 -> 0:19.7): Giữ Node 4 đã phẫu thuật chuẩn 100/100 (Kenji lao từ Trái sang Phải, bật nhảy chém trúng lõi ngực Rồng)
    {
      shotId: 'beat4_v2_charge_directly_at_dragon',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '35mm Anamorphic Dynamic Side-Tracking Action Shot following from left to right along the 180-degree axis',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI charges & leaps from Screen-Left to Screen-Right directly into @KURORYU on Screen-Right',
      causalLink: {
        cause: 'Counter-attacking the Dragon lunging from Screen-Right in Beat 3',
        effect: 'Kenji leaps mid-air and slashes his glowing katana directly across the Dragon chest reactor at 0:18-0:19, causing the chest wound explosion in Beat 5'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat4_v2_charge_directly_at_dragon_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 5.4
    },

    // BEAT 5 (0:19.7 -> 0:23.7): PHÒNG 2 (WETA PROP MASTER) TỰ ĐỘNG BẮT LỖI "ORPHAN WEAPON HALLUCINATION" & SỬA LẠI!
    // Khi mô tả vết chém trên ngực Rồng, Weta Prop Master phát hiện từ khóa "katana" làm AI vẽ dư 1 cái chuôi kiếm cắm trên ngực Rồng,
    // nên tự động kích hoạt RULE_PROP_LEARNED_05 lọc bỏ từ "katana" và ép "OPEN MOLTEN ARMOR FRACTURE ONLY (NO SWORD STUCK IN CHEST)"!
    {
      shotId: 'beat5_v3_ruptured_chest_reactor_no_sword',
      subjects: ['KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '50mm Anamorphic Medium Close-Up on Dragon positioned on Screen-Right angled Left',
      spatialAxisLock: '180-DEGREE LOCK: @KURORYU positioned on Screen-Right angled strictly Left toward Kenji, displaying the cracked molten armor gash across its chest reactor',
      causalLink: {
        cause: 'Direct physical damage from Kenji slashing the Dragon chest reactor at 0:18-0:19 in Beat 4',
        effect: 'The cracked chest reactor destabilizes and erupts with violent golden lightning, triggering the final desperate clash in Beat 6'
      },
      startFrameActionEn:
        'Dramatic medium close-up of colossal @KURORYU positioned on screen-right and angled strictly toward screen-left in the rain-soaked Kyoto shrine. Directly across the Dragon circular molten-amber chest core is a FRESH BLAZING DIAGONAL KATANA SLASH SCAR leaking golden plasma sparks and thick black smoke as the wounded mecha-dragon roars toward screen-left in agony and fury.',
      endFrameActionEn:
        'Dramatic medium close-up of @KURORYU on screen-right angled strictly toward screen-left as its CRACKED CHEST REACTOR violently destabilizes and overcharges, erupting with blinding golden-amber lightning arcs across its damaged carbon-fiber chest armor and roaring metallic jaws in the pouring rain.',
      videoKinematicsEn:
        '[0.0s-4.0s] Close-up on the colossal black mecha-dragon on screen-right facing left: the fresh glowing diagonal armor gash across its circular chest core sparks violently and leaks black smoke, then suddenly destabilizes in a massive eruption of golden-amber lightning arcs crawling across its armor plates.',
      sfxCueEn: 'damaged reactor alarm whine, crackling high-voltage golden plasma explosion, wounded metallic dragon roar',
      trimStartSec: 0.2,
      trimEndSec: 4.2
    },

    // BEAT 6 (0:23.7 -> 0:30.9): Giữ Node 6 đã đạt chuẩn 100/100 (Giao kiếm quyết định Trái-Phải, đánh bật Rồng và đứng thế chiến thắng)
    {
      shotId: 'beat6_v2_bareheaded_apex_clash_victory',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      cameraLens: '50mm Anamorphic Medium-Wide Hero Confrontation Shot obeying the 180-degree axis',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI on Screen-Left clashes with and parries @KURORYU on Screen-Right',
      causalLink: {
        cause: 'Wounded, overcharged Dragon from Beat 5 launches one final desperate strike from Screen-Right',
        effect: 'Kenji parries the strike in a blinding shockwave, knocking the Dragon back into the mist and holding his victorious low-ready katana stance'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat6_v2_bareheaded_apex_clash_victory_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 7.4
    }
  ];

  // 3. Chạy dây chuyền 5 Phòng Ban Độc Lập cho từng Beat
  const executedShots = [];
  for (let i = 0; i < v3ShotGraph.length; i++) {
    const rawSpec = v3ShotGraph[i];
    console.log('\n================================================================================');
    console.log(`🎬 BẮT ĐẦU DÂY CHUYỀN 5 PHÒNG BAN CHO BEAT ${i + 1}/6: ${rawSpec.shotId}`);
    console.log('================================================================================');

    // PHÒNG 1: Đạo diễn DGA kiểm định Mạch Nhân-Quả & Trục 180 độ
    const approvedSpec = dept01Director.auditAndApproveBeat(rawSpec, i);

    // PHÒNG 2: Weta Prop Master kiểm định Đạo cụ, Phục trang & Biên dịch Prompt 3 Mỏ Neo
    const compiledPrompts = dept02PropMaster.auditAndCompilePrompts(approvedSpec);

    // PHÒNG 3: ASC DP & Script Supervisor dựng Keyframes & soi Vision 0-Credit
    await dept03AscLayout.produceAndAuditKeyframes(approvedSpec, compiledPrompts);

    // PHÒNG 4: VES Supervisor render video Veo 3.1 & soi dải 1fps Temporal Strip
    const executed = await dept04VesVideo.renderAndAuditVideoBeat(approvedSpec);
    executedShots.push(executed);
  }

  // 4. PHÒNG 5: ACE Editor, CSI Colorist & Dolby Mixer dựng Master V3, đo EBU R128 & xuất 1fps QC Grids
  const finalDeliverable = dept05PostMaster.masterAndAuditFinalFilm(
    executedShots,
    '30_SAMURAI_V3_5DEPT_INTERNATIONAL_MASTER.mp4'
  );

  // 5. Tạo video đặt cạnh nhau (V2 vs V3 5-Department International Master)
  const v2Path = path.join(RUN_DIR, '20_SAMURAI_V2_SENIOR_ENGINE_MASTER.mp4');
  const v3Path = finalDeliverable.masterPath;
  const cmpPath = path.join(RUN_DIR, '32_V2_VS_V3_5DEPT_EXPERT_COMPARISON.mp4');

  if (fs.existsSync(v2Path) && fs.existsSync(v3Path)) {
    console.log('\n🔬 Đang xuất Video Đối Chiếu Side-by-Side (V2 vs V3 5-Department International Studio)...');
    const cmpFilter = [
      `[0:v]scale=640:360,setsar=1:1,drawtext=text='V2 (Before Full 5-Dept Audit)':x=16:y=16:fontsize=18:fontcolor=yellow:box=1:boxcolor=black@0.75[v2];`,
      `[1:v]scale=640:360,setsar=1:1,drawtext=text='V3 (After 5 International Dept Experts Sign-Off)':x=16:y=16:fontsize=18:fontcolor=lime:box=1:boxcolor=black@0.75[v3];`,
      `[v2][v3]hstack=inputs=2[vout]`
    ].join('');
    execSync(
      `ffmpeg -y -i "${v2Path}" -i "${v3Path}" -filter_complex "${cmpFilter}" -map "[vout]" -map 1:a -shortest -c:v libx264 -preset fast -crf 20 -c:a copy "${cmpPath}"`,
      { stdio: 'ignore' }
    );
    console.log(`   ✅ Đã xuất Video Đối Chiếu V2 vs V3: ${cmpPath}`);
  }

  // 6. Lưu Biên bản Nghiệm thu 5 Phòng Ban Quốc tế & Copy sang Artifact Directory
  kb.exportFullReport(KB_PATH);
  if (fs.existsSync(ARTIFACT_DIR)) {
    fs.copyFileSync(v3Path, path.join(ARTIFACT_DIR, '30_SAMURAI_V3_5DEPT_INTERNATIONAL_MASTER.mp4'));
    fs.copyFileSync(finalDeliverable.qcGrid1, path.join(ARTIFACT_DIR, '31_V3_5DEPT_1FPS_QC_GRID_01.png'));
    fs.copyFileSync(finalDeliverable.qcGrid2, path.join(ARTIFACT_DIR, '31_V3_5DEPT_1FPS_QC_GRID_02.png'));
    if (fs.existsSync(cmpPath)) {
      fs.copyFileSync(cmpPath, path.join(ARTIFACT_DIR, '32_V2_VS_V3_5DEPT_EXPERT_COMPARISON.mp4'));
    }
  }

  console.log('\n================================================================================');
  console.log('🏆 HOÀN TẤT SẢN XUẤT BẢN MASTER V3 CHUẨN 5 PHÒNG BAN QUỐC TẾ!');
  console.log(`   👉 Master V3 MP4: ${v3Path}`);
  console.log(`   👉 QC Grid 01:    ${finalDeliverable.qcGrid1}`);
  console.log(`   👉 QC Grid 02:    ${finalDeliverable.qcGrid2}`);
  console.log(`   👉 Audit Report:  ${KB_PATH}`);
  console.log('================================================================================');
}

main().catch(err => {
  console.error('❌ Lỗi nghiêm trọng trong dây chuyền 5 Phòng Ban:', err);
  process.exit(1);
});
