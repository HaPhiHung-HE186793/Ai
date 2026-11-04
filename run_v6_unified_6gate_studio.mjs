#!/usr/bin/env node
/**
 * ============================================================================
 * 5-DEPARTMENT INTERNATIONAL FILM STUDIO PIPELINE (V6 UNIFIED 6-GATE MASTER)
 * Dự án: "CHRONO BLADE: SAMURAI CYBER-RONIN VS. OBSIDIAN MECHA-DRAGON" (30s)
 * ============================================================================
 * Giải quyết triệt để đồng thời 4 lỗ hổng Rắc-cô & Vật lý nâng cao do khán giả
 * phát hiện trong bản V5:
 *  1. [VFX / Creature Damage Physics - 0:15-0:19 (Beat 4)]: Xóa bỏ vệt kẻ 2D màu cam
 *     giả tạo trôi theo che hết thân Rồng sau cú chém -> Thay bằng sát thương
 *     vật lý 3D tại Lõi lò phản ứng ngực (nứt vỡ lõi tròn trước ngực, phụt khói
 *     đen, tia lửa và hồ quang sét vàng từ hốc ngực, giữ nguyên sang Cảnh 5 & 6).
 *  2. [Makeup & Prosthetics - 0:06-0:09 (Beat 2)]: Xóa bỏ vết chém chảy máu dọc mắt/má
 *     vô lý trên mặt Samurai khi đang đỡ đòn thành công -> Khóa mặt Samurai
 *     sạch sẽ, ướt mưa, hoàn toàn không có vết chém chảy máu.
 *  3. [Creature Anatomy Continuity - 0:00-0:30 (All Beats)]: Rồng KURORYU bắt buộc phải có
 *     2 ĐÔI CÁNH RỒNG CƠ KHÍ KHỔNG LỒ (TWO MASSIVE BIOMECHANICAL DRAGON WINGS)
 *     xuyên suốt MỌI CẢNH (Cảnh 1, 3, 4, 5, 6), tuyệt đối không biến thành
 *     khủng long cụt cánh ở đầu và cuối phim.
 *  4. [Production Design / Set Continuity - 0:00-0:30 (All Beats)]: Đồng nhất 100% kiến trúc
 *     Sân đền Kyoto thông qua Master Scene Composite Anchor (e9b05664-d2eb-405d-8c50-1a56cc2b2359):
 *     nhà gỗ tối màu 1 tầng mái ngói bên trái, đèn đá vuông, nền đá phiến ướt mưa, và
 *     ĐÚNG 1 cổng Torii đỏ nguyên vẹn phía sau Rồng; Cảnh 2 cận mặt Samurai chỉ thấy
 *     mái hiên gỗ + tường đá + đèn đá phía sau lưng (cấm cổng Torii nhảy ra sau lưng Samurai).
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

// Master Scene Composite Anchor từ Beat 3 (có sẵn Rồng 2 cánh + Sân đền nhà gỗ + Đèn đá vuông + 1 Cổng Torii đỏ)
const MASTER_SCENE_COMPOSITE_ID = 'e9b05664-d2eb-405d-8c50-1a56cc2b2359';

async function main() {
  console.log('================================================================================');
  console.log('🏛️ KHỞI ĐỘNG BỘ MÁY 5 PHÒNG BAN QUỐC TẾ V6 (UNIFIED 6-GATE CONTINUITY MASTER)');
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

  // 1. Khóa cứng 3 Mỏ Neo DNA gốc với đặc tả V6 (Rồng 2 cánh + Mặt Samurai sạch không vết chém + Sân đền đồng nhất)
  await engine.lockCoreAnchors([
    {
      id: 'KENJI',
      fileName: '01_anchor_samurai_kenji_sheet',
      identityLockEn:
        '@KENJI (32-year-old Japanese cyber-ronin samurai with a sharp masculine jawline, CLEAN UNINJURED FACE WET WITH RAIN with ZERO facial cuts and ZERO cheek scars, BAREHEADED with tied-back wet dark hair, wearing matte-black carbon-fiber lamellar armor with subtle glowing amber seams and a dark rain cloak)',
      negativeLockEn:
        'BAREHEADED WITH TIED-BACK DARK HAIR AND CLEAN UNINJURED FACE, STRICTLY NO HELMET, NO KABUTO, NO FACE MASK, NO HAT, NO FACIAL SLASH CUT, NO BLEEDING CHEEK WOUND, SINGLE KATANA SCABBARD AT LEFT HIP ONLY',
      prompt:
        '16:9 three-panel character reference sheet on #808080 neutral gray background: KENJI, 32-year-old Japanese cyber-ronin samurai, bareheaded with tied-back dark hair, clean uninjured face, matte-black carbon-fiber samurai armor with amber seams.'
    },
    {
      id: 'KURORYU',
      fileName: '02_anchor_mecha_dragon_sheet',
      identityLockEn:
        '@KURORYU (colossal bipedal biomechanical obsidian mecha-dragon with TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS spread wide from its back, interlocking matte-black titanium armor plates, a single circular molten-amber plasma core at the center of its chest sternum, and razor-sharp metallic jaws)',
      negativeLockEn:
        'BIPEDAL WINGED MECHA-DRAGON WITH TWO MASSIVE BAT-LIKE DRAGON WINGS SPREAD WIDE, NEVER WINGLESS GODZILLA, SINGLE ROUND AMBER CORE AT CENTER CHEST, NO FAKE 2D FLOATING DIAGONAL LASER SLASH BAR OVER BODY, ZERO EXTRA HEADS',
      prompt:
        '16:9 three-panel creature reference sheet on #808080 neutral gray background: KURORYU, colossal biomechanical obsidian mecha-dragon with two massive bat-like dragon wings, matte-black titanium plates, and glowing molten-amber chest core.'
    },
    {
      id: 'KYOTO_SHRINE',
      fileName: '03_anchor_kyoto_rain_temple_plate',
      identityLockEn:
        'Enclosed ancient Kyoto shrine courtyard at night during a heavy monsoon rainstorm, flanked by a single-story dark-wood shrine hall with tiled eaves on the left, four glowing square stone pedestal lanterns on mossy stone walls, a single towering intact vermilion-red wooden Torii gate at center-back, and wet dark slate flagstones.',
      negativeLockEn:
        'NO FOREST WOODS, NO PINE TREES IN COURTYARD, NO MULTIPLE TORII GATES, NO ORANGE FENCES, NO MODERN CARS, NO TEXT OR SUBTITLES',
      prompt:
        '16:9 wide cinematic establishing plate of an empty Kyoto shrine courtyard at night in heavy rain with a single red Torii gate, dark-wood temple hall, and square stone lanterns.'
    }
  ]);

  // 2. Đồ thị 6 Beats Điện Ảnh V6 (Đồng bộ 100% Đôi cánh Rồng + Mặt Samurai sạch + Nổ lõi ngực 3D + Sân đền)
  const v6ShotGraph = [
    // BEAT 1 (0:00 -> 0:05.5) | Cự ly: [15m -> 15m]
    // Sửa lỗi V5: Bổ sung ĐÔI CÁNH RỒNG KHỔNG LỒ cho @KURORYU ngay từ Cảnh 1 + Giữ nguyên cổng Torii + Bắn cầu lửa trực diện!
    {
      shotId: 'beat1_v6_winged_dragon_intact_torii_direct_fireball',
      forceRerender: true,
      masterSceneCompositeId: MASTER_SCENE_COMPOSITE_ID,
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'DIRECT_PROJECTILE_ATTACK',
      distanceStartMeters: 15,
      distanceEndMeters: 15,
      cameraLens: '35mm Anamorphic Wide Establishing OTS Shot, low angle in enclosed Kyoto shrine courtyard',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI Screen-Left Foreground (facing Right) <-> WINGED @KURORYU at 15m standing IN FRONT OF the intact red Torii Gate (facing Left)',
      causalLink: {
        cause: 'Colossal WINGED Mecha-Dragon (with two massive bat-like dragon wings spread wide) stands in the courtyard IN FRONT OF the intact red Torii gate, 15m from Kenji',
        effect: 'The winged Dragon stomps the wet flagstones and blasts a focused stream of golden plasma fire straight at Kenji while the Torii gate behind it remains intact, forcing Kenji to block the fireball in Beat 2'
      },
      startFrameActionEn:
        'Wide low-angle shot inside the exact enclosed Kyoto shrine courtyard (dark-wood shrine hall with tiled eaves on the left, glowing square stone lanterns, wet dark slate flagstones): Bareheaded @KENJI stands in the lower-left foreground (back 3/4 view facing Right, NO HELMET, gripping his single glowing amber-gold katana with a SINGLE unbroken straight hilt) looking 15 meters across the courtyard at colossal WINGED @KURORYU standing clearly IN FRONT OF the single intact red wooden Torii gate on screen-right, with TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS spread wide from its back and a glowing circular amber chest core.',
      endFrameActionEn:
        'Identical wide low-angle courtyard framing (dark-wood shrine hall on left, square stone lanterns, 100% intact red Torii gate at center-back): Bareheaded @KENJI braces his single katana in the lower-left foreground as colossal WINGED @KURORYU (standing in front of the intact red Torii gate with TWO MASSIVE BIOMECHANICAL BAT-LIKE DRAGON WINGS spread wide from its back) blasts a concentrated blazing stream of golden-amber plasma fire from its jaws DIRECTLY FORWARD ACROSS THE COURTYARD AT @KENJI in the lower-left foreground!',
      videoKinematicsEn:
        'Standing in front of the intact red Torii gate inside the dark-wood shrine courtyard with its two massive biomechanical bat-like dragon wings spread wide, colossal @KURORYU roars and blasts a concentrated torrent of golden plasma fire straight forward across the wet flagstones directly at bareheaded @KENJI in the lower-left foreground.',
      sfxCueEn: 'heavy mechanical stomp and wing flap, roaring plasma fireball stream rushing straight toward the samurai',
      trimStartSec: 0.0,
      trimEndSec: 5.5
    },

    // BEAT 2 (0:05.5 -> 0:09.8) | Cự ly: [15m -> 15m]
    // Sửa lỗi V5: Xóa bỏ vết chém chảy máu dọc mắt/má trên mặt Samurai khi đang đỡ đòn + Xóa cổng Torii nhảy ra sau lưng Samurai!
    {
      shotId: 'beat2_v6_ecu_clean_face_single_hilt_courtyard_eaves',
      forceRerender: true,
      excludeEnvRefFromImageGeneration: true,
      cameraSpecificEnvOverrideEn:
        'Background behind @KENJI shows the dark-wood traditional shrine hall porch eaves, a mossy stone retaining wall, and a warm amber square stone pedestal lantern in heavy midnight rain (STRICTLY NO red Torii gate behind Kenji, NO forest trees).',
      subjects: ['KENJI'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'DEFLECT_INCOMING_PROJECTILE',
      distanceStartMeters: 15,
      distanceEndMeters: 15,
      cameraLens: '85mm Anamorphic Medium-Close-Up (MCU) on clean uninjured face and diagonal katana guard, shallow rain bokeh',
      spatialAxisLock: '180-DEGREE EYELINE LOCK: @KENJI on Screen-Left looking strictly Right with CLEAN UNINJURED FACE, holding rigid 45-degree katana deflecting incoming dragon fireball',
      causalLink: {
        cause: 'Incoming golden plasma fireball blasted directly at Kenji at the end of Beat 1 (0:05)',
        effect: 'Kenji with a completely clean uninjured face blocks and slices the incoming fireball with his rigid 45-degree katana into sparks against the dark wooden shrine porch background, then sprints forward in Beat 3'
      },
      startFrameActionEn:
        '85mm medium-close-up on bareheaded @KENJI positioned on Screen-Left looking fiercely toward Screen-Right: His face is 100% CLEAN, UNINJURED, SMOOTH MASCULINE SKIN WET WITH RAIN (ZERO FACIAL CUTS, ZERO SCARS, ZERO BLEEDING WOUNDS ON CHEEK OR EYE). Both black-gloved hands tightly grip a SINGLE UNBROKEN straight 15cm black katana hilt held in front of his chest at a rigid 45-degree diagonal guard angle as the incoming golden-orange dragon fireball stream arrives from Screen-Right and slams into his straight glowing steel blade. Behind his back are dark-wood shrine roof eaves and a warm square stone lantern in rain (NO red Torii gate behind him).',
      endFrameActionEn:
        'Identical 85mm medium-close-up framing against the dark-wood shrine roof eaves and glowing square stone lantern (NO Torii gate behind him): Bareheaded @KENJI with a 100% CLEAN UNINJURED RAIN-WET FACE (NO facial cuts, NO scars, NO blood) holds his rigid straight katana with both hands on the SINGLE unbroken hilt, deflecting the orange fireball plasma into a dramatic shower of golden sparks and white steam.',
      videoKinematicsEn:
        'Bareheaded @KENJI with a completely clean uninjured rain-wet face braces his rigid straight katana with both hands on its single unbroken hilt, deflecting the blazing golden-orange dragon fireball arriving from Screen-Right into a fierce shower of sparks and steam.',
      sfxCueEn: 'incoming fireball impact roar, metallic katana deflection sizzle, steam hiss in heavy rain',
      trimStartSec: 0.0,
      trimEndSec: 4.3
    },

    // BEAT 3 (0:09.8 -> 0:15.0) | Cự ly: [15m -> 2m]
    // Cảnh chuẩn gốc (Master Scene): Đã có Rồng 2 cánh lớn + Nhà gỗ mái ngói bên trái + Đèn đá vuông + 1 Cổng Torii đỏ nguyên vẹn + Lao vào chém ngực!
    {
      shotId: 'beat4_v2_charge_directly_at_dragon',
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLOSE_DISTANCE_AND_SLASH_CHEST',
      distanceStartMeters: 15,
      distanceEndMeters: 2,
      cameraLens: '35mm Anamorphic Dynamic Side-Tracking Action Shot following from left to right along the 180-degree axis',
      spatialAxisLock: '180-DEGREE LOCK: @KENJI sprints from Screen-Left (15m) to Screen-Right (2m), leaps and slashes WINGED @KURORYU chest core',
      causalLink: {
        cause: 'Having deflected the ranged fireball at 15m in Beat 2, Kenji charges across the courtyard to close the 15m distance',
        effect: 'Kenji closes the gap from 15m to 2m, leaps mid-air to slash the winged Dragon circular chest reactor core, and lands 2m in front of the wounded Dragon'
      },
      lockedSourceVideo: path.join(RUN_DIR, 'beat4_v2_charge_directly_at_dragon_veo31_raw8s.mp4'),
      trimStartSec: 0.2,
      trimEndSec: 5.4
    },

    // BEAT 4 (0:15.0 -> 0:19.2) | Cự ly: [2m -> 2m]
    // Sửa lỗi V5: Xóa bỏ hoàn toàn thanh laser 2D màu cam thẳng đuột (\) dán đè lên người Rồng -> Thay bằng Lõi tròn giữa ngực bị nứt vỡ vật lý 3D phụt khói đen, tia lửa và hồ quang điện!
    {
      shotId: 'beat4_v6_winged_dragon_3d_cracked_core_overload',
      forceRerender: true,
      masterSceneCompositeId: MASTER_SCENE_COMPOSITE_ID,
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'WOUND_OVERLOAD_REACTION',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '50mm Anamorphic Medium-Wide Shot at 2m range inside the enclosed Kyoto shrine courtyard',
      spatialAxisLock: '180-DEGREE LOCK: Bareheaded @KENJI in lower-left foreground at 2m; WINGED @KURORYU on Screen-Right in front of the intact red Torii gate recoiling with cracked circular chest reactor core',
      causalLink: {
        cause: 'Direct physical impact from Kenji slashing the winged Dragon circular chest reactor core at the end of Beat 3 (0:14)',
        effect: 'The circular chest reactor core in the center of the winged Dragon sternum cracks open in 3D, spewing thick black smoke, molten sparks, and erratic golden lightning arcs across its chest plates at 2m range'
      },
      startFrameActionEn:
        'Medium-wide shot at 2m range inside the exact enclosed Kyoto shrine courtyard (dark-wood shrine hall with tiled eaves on the left, glowing square stone lanterns, intact red Torii gate at center-back): Bareheaded @KENJI stands crouched in the lower-left foreground holding his glowing katana after landing his strike, while on Screen-Right colossal WINGED @KURORYU (with TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS spread wide from its back) reels backward in pain as its circular chest reactor core in the center of its sternum is cracked and shattered in 3D, erupting with a localized spherical burst of golden sparks and thick black smoke (STRICTLY NO flat 2D straight diagonal orange line or laser bar across its body).',
      endFrameActionEn:
        'Identical 50mm courtyard framing in front of the intact red Torii gate and dark-wood shrine hall: Bareheaded @KENJI holds his guard in the lower-left foreground at 2m distance while colossal WINGED @KURORYU (with TWO MASSIVE BIOMECHANICAL BAT-LIKE DRAGON WINGS spread wide) roars in agony as thick black smoke and branching golden electrical lightning arcs pour out of its cracked circular chest reactor cavity (NO straight diagonal slash line, NO floating 2D laser bar).',
      videoKinematicsEn:
        'At 2m distance inside the dark-wood shrine courtyard in front of the intact red Torii gate, winged mecha-dragon @KURORYU (with two massive bat-like dragon wings spread wide) staggers back roaring in pain as its cracked circular chest reactor core spews thick black smoke, molten sparks, and crackling golden lightning arcs while bareheaded @KENJI watches from the lower-left foreground.',
      sfxCueEn: 'shattered chest reactor core explosion, agonized mechanical dragon roar, crackling electric arcs and black smoke hiss',
      trimStartSec: 0.0,
      trimEndSec: 4.2
    },

    // BEAT 5 (0:19.2 -> 0:23.8) | Cự ly: [2m -> 2m]
    // Sửa lỗi V5: Rồng có đủ 2 CÁNH KHỔNG LỒ ngay từ giây đầu tiên + Giữ nguyên Lõi ngực nứt bốc khói đen + Giữ nguyên Sân đền nhà gỗ & Đèn đá vuông (xóa hàng rào đỏ & rừng cây)!
    {
      shotId: 'beat5_v6_winged_dragon_2m_claw_clash_courtyard',
      forceRerender: true,
      masterSceneCompositeId: MASTER_SCENE_COMPOSITE_ID,
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLOSE_QUARTERS_MELEE_CLASH',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '24mm Anamorphic Low-Angle 180-Degree Close-Quarters Action Shot (2m separation) in enclosed Kyoto shrine courtyard',
      spatialAxisLock: '180-DEGREE LOCK: Bareheaded @KENJI on Screen-Left and WINGED @KURORYU on Screen-Right engaged at 2-meter close-quarters range in front of the intact red Torii gate',
      causalLink: {
        cause: 'Enraged by its smoking cracked chest reactor in Beat 4, the winged Dragon standing 2m in front of Kenji lashes out with a desperate close-range claw smash',
        effect: 'The winged Dragon slams its mechanical claw down at Kenji at 2m range in a blinding explosion of sparks, leading directly into Kenji parrying and knocking the winged Dragon to its knees in Beat 6'
      },
      startFrameActionEn:
        'Low-angle close-quarters 24mm shot at 2m separation inside the exact enclosed Kyoto shrine courtyard (dark-wood shrine hall with tiled eaves on the left, glowing square stone lanterns, single intact red Torii gate at center-back): Bareheaded @KENJI stands on Screen-Left raising his single straight glowing katana in a two-handed guard as colossal WINGED @KURORYU stands 2 meters in front of him on Screen-Right with TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS spread wide from its back and black smoke leaking from its cracked circular chest reactor core, raising its massive mechanical left claw to strike down.',
      endFrameActionEn:
        'Identical low-angle 24mm courtyard framing in front of the intact red Torii gate and dark-wood shrine hall: At 2m close range, bareheaded @KENJI on Screen-Left parries the downward claw strike of colossal WINGED @KURORYU on Screen-Right (whose TWO MASSIVE BIOMECHANICAL BAT-LIKE DRAGON WINGS remain spread wide and circular chest core smokes), unleashing a blinding spherical explosion of golden-and-amber sparks and water spray between them!',
      videoKinematicsEn:
        'At 2 meters close-quarters range inside the dark-wood shrine courtyard in front of the intact red Torii gate, winged mecha-dragon @KURORYU (with two massive bat-like dragon wings spread wide and smoke pouring from its cracked chest core) slams its massive mechanical claw down at bareheaded @KENJI on Screen-Left, who parries the blow with his rigid glowing katana in an explosive burst of sparks.',
      sfxCueEn: 'massive dragon wings beating, heavy mechanical claw slam, deafening metallic katana parry and spark explosion',
      trimStartSec: 0.0,
      trimEndSec: 4.6
    },

    // BEAT 6 (0:23.8 -> 0:30.4) | Cự ly: [2m -> 2m]
    // Sửa lỗi V5: Rồng có đủ 2 CÁNH KHỔNG LỒ + Quỳ gục trước ĐÚNG 1 cổng Torii đỏ nguyên vẹn trong Sân đền nhà gỗ (xóa đường phố nhiều cổng Torii & xóa khủng long cụt cánh)!
    {
      shotId: 'beat6_v6_winged_dragon_defeat_kneel_courtyard_finale',
      forceRerender: true,
      masterSceneCompositeId: MASTER_SCENE_COMPOSITE_ID,
      subjects: ['KENJI', 'KURORYU'],
      environmentId: 'KYOTO_SHRINE',
      combatRole: 'CLIMAX_PARRY_AND_VICTORY',
      distanceStartMeters: 2,
      distanceEndMeters: 2,
      cameraLens: '35mm Anamorphic Medium-Wide Hero Confrontation & Victory Shot at 2m range inside the enclosed Kyoto shrine courtyard',
      spatialAxisLock: '180-DEGREE LOCK: Bareheaded @KENJI stands victorious on Screen-Left at 2m range as WINGED @KURORYU collapses onto its knees in defeat on Screen-Right in front of the single intact red Torii gate',
      causalLink: {
        cause: 'Continuing directly from the 2m close-quarters claw parry explosion at the end of Beat 5 (0:23.8)',
        effect: 'Kenji forces the wounded winged Dragon backward onto its knees in a billow of white steam as its cracked chest reactor powers down, holding his victorious low-ready katana stance'
      },
      startFrameActionEn:
        '35mm medium-wide hero shot at 2m separation inside the exact enclosed Kyoto shrine courtyard (dark-wood shrine hall with tiled eaves on the left, four glowing square stone lanterns, and EXACTLY ONE intact red wooden Torii gate at center-back): Bareheaded @KENJI stands in the lower-left foreground completing a powerful parry swing with his single straight glowing katana, driving colossal WINGED @KURORYU on Screen-Right (with TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS spread wide from its back) backward onto one knee amidst billowing white steam and black smoke rising from its cracked circular chest reactor core.',
      endFrameActionEn:
        'Identical 35mm master finale framing inside the enclosed Kyoto shrine courtyard (dark-wood shrine hall on left, glowing square stone lanterns, single intact red Torii gate at center-back): Colossal WINGED @KURORYU has collapsed onto its knees in defeat on Screen-Right with its TWO MASSIVE BIOMECHANICAL BAT-LIKE DRAGON WINGS drooping heavy at its sides and its cracked circular chest reactor core flickering out in dark smoke and white steam, while bareheaded @KENJI stands calm and victorious on Screen-Left at 2m distance holding his single straight glowing katana in a low-ready stance under the falling rain.',
      videoKinematicsEn:
        'Inside the dark-wood Kyoto shrine courtyard in front of the single intact red Torii gate, bareheaded @KENJI stands victorious on Screen-Left at 2m range as colossal winged mecha-dragon @KURORYU (with its two massive biomechanical bat-like dragon wings drooping) collapses onto its knees in defeat amidst billowing white steam and dark smoke from its extinguished chest core.',
      sfxCueEn: 'colossal winged mecha-dragon collapsing onto wet stone pavement, reactor power-down turbine whine, heavy midnight rain',
      trimStartSec: 0.0,
      trimEndSec: 6.6
    }
  ];

  // 3. Chạy dây chuyền 5 Phòng Ban Độc Lập V6
  const executedShots = [];
  for (let i = 0; i < v6ShotGraph.length; i++) {
    const rawSpec = v6ShotGraph[i];
    console.log('\n================================================================================');
    console.log(
      `🎬 BẮT ĐẦU DÂY CHUYỀN 5 PHÒNG BAN V6 CHO BEAT ${i + 1}/6: ${rawSpec.shotId} [${rawSpec.distanceStartMeters}m -> ${rawSpec.distanceEndMeters}m]`
    );
    console.log('================================================================================');

    const approvedSpec = dept01Director.auditAndApproveBeat(rawSpec, i, v6ShotGraph);
    const compiledPrompts = dept02PropMaster.auditAndCompilePrompts(approvedSpec);
    await dept03AscLayout.produceAndAuditKeyframes(approvedSpec, compiledPrompts);
    const executed = await dept04VesVideo.renderAndAuditVideoBeat(approvedSpec);
    executedShots.push(executed);
  }

  // 4. PHÒNG 5: Xuất bản Master V6
  const finalDeliverable = dept05PostMaster.masterAndAuditFinalFilm(
    executedShots,
    '60_SAMURAI_V6_UNIFIED_6GATE_MASTER.mp4'
  );

  // 5. Trích xuất lưới ảnh nghiệm thu 1fps toàn bộ 30 giây của bản V6
  const qcGrid1 = path.join(RUN_DIR, '61_V6_UNIFIED_1FPS_QC_GRID_01.png');
  const qcGrid2 = path.join(RUN_DIR, '61_V6_UNIFIED_1FPS_QC_GRID_02.png');
  execSync(
    `ffmpeg -y -i "${finalDeliverable.masterPath}" -vf "fps=1,scale=480:270,drawtext=text='V6 6-GATE QC t=%{pts\\:hms}':x=10:y=10:fontsize=18:fontcolor=lime:box=1:boxcolor=black@0.75,tile=4x4" -frames:v 2 "${path.join(RUN_DIR, '61_V6_UNIFIED_1FPS_QC_GRID_%02d.png')}"`,
    { stdio: 'ignore' }
  );

  // 6. Tạo video đối chiếu Side-by-Side V5 (Cũ) vs V6 (Mới)
  const v5Master = path.join(RUN_DIR, '50_SAMURAI_V5_WORLD_STATE_CONTINUITY_MASTER.mp4');
  const comparisonMp4 = path.join(RUN_DIR, '62_V5_VS_V6_UNIFIED_6GATE_COMPARISON.mp4');
  if (fs.existsSync(v5Master)) {
    execSync(
      `ffmpeg -y -i "${v5Master}" -i "${finalDeliverable.masterPath}" -filter_complex "[0:v]scale=640:360,drawtext=text='V5 OLD (Wingless 1/5/6 + Facial Cut + 2D Slash Bar + Set Drift)':x=10:y=10:fontsize=15:fontcolor=orange:box=1:boxcolor=black@0.75[v0];[1:v]scale=640:360,drawtext=text='V6 NEW (Winged Dragon All Shots + Clean Face + 3D Core + Unified Set)':x=10:y=10:fontsize=15:fontcolor=lime:box=1:boxcolor=black@0.75[v1];[v0][v1]hstack=inputs=2[v]" -map "[v]" -map 1:a -c:v libx264 -preset fast -crf 20 -c:a aac -shortest "${comparisonMp4}"`,
      { stdio: 'ignore' }
    );
  }

  kb.exportFullReport(KB_PATH);
  if (fs.existsSync(ARTIFACT_DIR)) {
    for (const f of [finalDeliverable.masterPath, qcGrid1, qcGrid2, comparisonMp4, KB_PATH]) {
      if (fs.existsSync(f)) {
        fs.copyFileSync(f, path.join(ARTIFACT_DIR, path.basename(f)));
      }
    }
  }

  console.log('\n================================================================================');
  console.log('🏆 HOÀN TẤT XUẤT BẢN V6 UNIFIED 6-GATE MASTER!');
  console.log(`   👉 Master MP4: ${finalDeliverable.masterPath}`);
  console.log(`   👉 QC Grid 01 (0s-15s): ${qcGrid1}`);
  console.log(`   👉 QC Grid 02 (16s-30s): ${qcGrid2}`);
  console.log(`   👉 Side-by-Side V5 vs V6: ${comparisonMp4}`);
  console.log('================================================================================');
}

main().catch((err) => {
  console.error('\n❌ [STUDIO V6 FATAL ERROR]:', err);
  process.exit(1);
});
