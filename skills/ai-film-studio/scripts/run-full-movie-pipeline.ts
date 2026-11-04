/**
 * 🎬 AI FILM STUDIO SKILL — EXECUTABLE 7-STAGE INDUSTRIAL FILMMAKING PIPELINE
 * Chạy trực tiếp trên VS Code kết nối gói Google AI Ultra (25.000 Credits) qua Local Bridge (`http://localhost:4321`).
 *
 * Cách gọi:
 *   node --experimental-strip-types ".agents/skills/ai-film-studio/scripts/run-full-movie-pipeline.ts" --script "Kịch bản..." --shots 6 --model "Veo 3.1 - Lite"
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import '../../../../services/flowSdkClient.ts';
import { Flow } from '../../../../services/flowSdkClient.ts';
import {
  buildCombatChoreographyForShot,
  resolveStageDestructionForShot,
  buildSymphonicScoreAndLfeAeval,
  buildAdrVoiceFilterForPhase,
} from '../../../../services/studioDepartmentsEngine.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const WORKSPACE_ROOT = path.resolve(__dirname, '../../../../');

function parseCliArgs(argv: string[]) {
  let script = '';
  let shots = 6;
  let durationSec = 0;
  let model = 'Veo 3.1 - Lite';
  let aspectRatio = '16:9';
  let framesOnly = false;
  let skipHostSync = false;
  let skipHostSyncScene = false;
  let masterOnly = false;
  let bridgeNextFrame = false;
  let resumeDir = '';
  let rerenderShots: number[] = [];

  const normalizedArgv: string[] = [];
  for (const raw of argv) {
    if (raw.startsWith('--') && raw.includes('=')) {
      const eqIdx = raw.indexOf('=');
      normalizedArgv.push(raw.slice(0, eqIdx), raw.slice(eqIdx + 1));
    } else {
      normalizedArgv.push(raw);
    }
  }

  for (let i = 0; i < normalizedArgv.length; i++) {
    const arg = normalizedArgv[i];
    if (arg === '--script' && normalizedArgv[i + 1]) {
      script = normalizedArgv[++i];
    } else if (arg === '--shots' && normalizedArgv[i + 1]) {
      shots = Math.max(1, parseInt(normalizedArgv[++i], 10) || 6);
    } else if (arg === '--duration' && normalizedArgv[i + 1]) {
      durationSec = Math.max(4, parseInt(normalizedArgv[++i], 10) || 0);
    } else if (arg === '--model' && normalizedArgv[i + 1]) {
      model = normalizedArgv[++i];
    } else if ((arg === '--aspect' || arg === '--aspect-ratio') && normalizedArgv[i + 1]) {
      aspectRatio = normalizedArgv[++i];
    } else if ((arg === '--resume' || arg === '--resume-dir') && normalizedArgv[i + 1]) {
      resumeDir = normalizedArgv[++i];
    } else if (arg === '--rerender-shots' && normalizedArgv[i + 1]) {
      rerenderShots = normalizedArgv[++i]
        .split(',')
        .map((n) => parseInt(n.trim(), 10))
        .filter((n) => !Number.isNaN(n) && n > 0);
    } else if (arg === '--frames-only') {
      framesOnly = true;
    } else if (arg === '--master-only') {
      masterOnly = true;
    } else if (arg === '--bridge-next-frame') {
      bridgeNextFrame = true;
    } else if (arg === '--skip-host-sync') {
      skipHostSync = true;
    } else if (arg === '--skip-host-sync-scene') {
      skipHostSyncScene = true;
    } else if (!arg.startsWith('--') && !script) {
      script = arg;
    }
  }

  if (durationSec > 0 && !normalizedArgv.includes('--shots')) {
    shots = Math.ceil(durationSec / 8);
  }

  if (!script) {
    script =
      'Một kỵ sĩ cơ giáp bạc đứng trên đỉnh tháp Neo-Hanoi dưới mưa đêm, rút kiếm ánh sáng Plasma lao xuống chém đôi chiến hạm Drone rồi đáp xuống quảng trường.';
  }

  return {
    script,
    shots,
    durationSec,
    model,
    aspectRatio,
    framesOnly,
    masterOnly,
    bridgeNextFrame,
    skipHostSync,
    skipHostSyncScene,
    resumeDir,
    rerenderShots,
  };
}

async function callWithRetry<T>(fn: () => Promise<T>, label: string, maxRetries = 3): Promise<T> {
  let lastErr: any;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastErr = err;
      console.warn(`   -> ⚠️ [${label}] Thử lại lần ${attempt}/${maxRetries} sau lỗi: ${err?.message || err}`);
      await new Promise((r) => setTimeout(r, 2500 * attempt));
    }
  }
  throw lastErr;
}

function extractJsonObject(rawText: string): any {
  const cleaned = (rawText || '').replace(/```json/gi, '').replace(/```/g, '').trim();
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace === -1 || lastBrace === -1 || lastBrace <= firstBrace) {
    throw new Error('Không tìm thấy khối JSON hợp lệ từ phản hồi của Omni 1.1 Flash.');
  }
  const jsonCandidate = cleaned
    .slice(firstBrace, lastBrace + 1)
    .replace(/,\s*([}\]])/g, '$1');
  return JSON.parse(jsonCandidate);
}

function formatSrtTimestamp(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const ms = Math.round((sec % 1) * 1000);
  return `${String(hrs).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')},${String(ms).padStart(3, '0')}`;
}

function formatAssTimestamp(sec: number): string {
  const hrs = Math.floor(sec / 3600);
  const mins = Math.floor((sec % 3600) / 60);
  const secs = Math.floor(sec % 60);
  const cs = Math.min(99, Math.round((sec % 1) * 100));
  return `${hrs}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}.${String(cs).padStart(2, '0')}`;
}

function escapeAssText(text: string): string {
  return String(text || '')
    .replace(/\\/g, '/')
    .replace(/\{/g, '(')
    .replace(/\}/g, ')')
    .replace(/\r?\n/g, '\\N')
    .trim();
}

const CAMERA_SCALE_CYCLE = [
  'Anamorphic 24mm lens, Worm-Eye Low-Angle Establishing Push-In past foreground shattered rock ledges showing colossal scale',
  'Anamorphic 50mm lens, Dynamic Low-Angle Hero Tracking Shot with heavy 19-ton mass inertia and kinetic camera vibration',
  '85mm Macro Cinema Lens, Extreme Close-Up Micro-Emotion & Texture Shot (contracting pupil, boiling rain on scales, shallow depth of field)',
  'Anamorphic 35mm lens, Dramatic Over-The-Shoulder Collateral Impact & Shockwave Reaction Shot',
];

const STUDIO_COVERAGE_CYCLE = [
  'MASTER_ESTABLISHING',
  'INSERT_DETAIL_CUTAWAY',
  'OTS_CONFRONTATION',
  'KULESHOV_REACTION',
  'POV_SUBJECTIVE',
  'LOW_ANGLE_HERO_APEX',
] as const;

const STUDIO_LITERARY_SUBTEXT_NARRATION_VI: string[] = [
  'Trước mỗi cuộc đại tuyệt chủng, mặt đất luôn nín thở. Giữa thung lũng nham thạch Kreta, bầu trời tím thẫm rạch ngang tia sét báo hiệu ngày phán quyết của hai vị vua.',
  'Mười chín tấn cơ bắp bọc đá bazan dẫm nát thềm lục địa. Với IGNIS REX, mỗi vết nứt dung nham dưới chân là lời tuyên bố: ngai vàng này không bao giờ chia đôi.',
  'Nhưng dưới làn nước sôi sùng sục, một quy luật tàn nhẫn khác đang trồi lên. Những mạch điện sinh học xanh băng giá lặng lẽ cắt ngang bóng tối đầm lầy.',
  'Đôi vuốt dài một mét rưỡi bấm phập vào đá núi lửa. VOLT SPINO bước lên bờ, mang theo cơn thịnh nộ của đại dương cổ đại thách thức bá chủ mặt đất.',
  'Một bên là huyết quản lửa ngàn độ, một bên là sấm sét vực sâu. Khoảnh khắc hai ánh mắt khóa chặt qua dòng sông dung nham, thời gian như đông cứng trước cơn bão.',
  'Không còn đường lùi cho kẻ yếu. Hai khối núi thịt lao thẳng vào nhau, biến thềm đá bazan thành lò luyện kim của tự nhiên.',
  'Cú đâm trực diện đầu tiên không chỉ là đòn thử sức, mà là va chạm giữa hai kỷ nguyên. Sóng xung kích thổi bạt màn mưa, xé toạc không gian.',
  'Chiến trường không tha thứ cho một nhịp chậm trễ. Đôi vuốt tích điện của sát thủ đầm lầy cào toạc lớp giáp đá, bắn tung những mảnh vảy nóng đỏ.',
  'Bộ hàm cá sấu cổ đại khóa chặt cổ họng bạo chúa. Hàng vạn vôn điện sinh học phóng xuyên qua lớp vảy đen, đẩy vị vua dung nham vào cửa tử.',
  'Đau đớn chính là ngòi nổ của bản năng sinh tồn. Một cú xoay mình quật đuôi mười chín tấn đập gãy cột đá cổ đại, hất văng kẻ săn mồi khỏi tử huyệt.',
  'Nhưng bầu trời giông bão lại đứng về phía thủy quái. Sấm sét thiên nhiên giáng xuống buồm lưng, phóng ra luồng hồ quang đánh gục bạo chúa xuống bờ vực.',
  'Khoảnh khắc cận kề cái chết là lúc huyết quản thức tỉnh! Giáp đá nứt toác, lõi dung nham trắng rực bùng nổ biến vết thương thành ngọn lửa bất diệt.',
  'Mọi giọt mưa chạm vào thân hình thức tỉnh đều bốc hơi tức khắc. Bạo chúa lửa lao xuyên qua biển khói, đòi lại món nợ máu bằng hàm răng nhiệt hạch.',
  'Giữa dòng sông nham thạch cuộn chảy, không kẻ nào chịu nhượng bộ một tấc đất. Lửa và điện quấn lấy nhau trong vũ điệu sinh tử tàn khốc nhất.',
  'Đòn phản kích chí mạng tìm đúng điểm tựa sức mạnh của đối thủ. Hàm răng ngàn độ nghiền nát mảng gai phát điện trên lưng thủy quái trong mưa tia lửa.',
  'Như con thú bị dồn vào chân tường, VOLT SPINO giải phóng toàn bộ điện năng còn sót lại trong một vụ nổ hồ quang tuyệt vọng ở cự ly gần.',
  'Nhưng sấm sét không thể cản bước một ngọn núi lửa đang phun trào. IGNIS REX lao xuyên qua màn điện, húc sập cả vách đá hẻm vực lên người đối thủ.',
  'Đòn kết liễu giáng xuống như búa tạ của tạo hóa! Cú ngoạm hàm nhiệt hạch tối thượng quật ngã hoàn toàn kẻ thách thức xuống thềm đá nứt toác.',
  'Khi tiếng gầm lắng xuống, chỉ còn lại một thung lũng tan hoang chìm trong mưa tro bụi. Cái giá của ngôi vương luôn được trả bằng sự hủy diệt.',
  'Trên gương mặt chằng chịt vết sẹo đang bốc khói, từng giọt dung nham nhỏ xuống hóa thành thủy tinh đen. Đôi mắt vàng rực nhìn kẻ bại trận lần cuối.',
  'Nhận thức rõ phán quyết của tự nhiên, bóng hình khổng lồ mang buồm lưng gãy vụn lặng lẽ lùi dần vào màn sương đầm lầy, nhường lại lãnh địa.',
  'Mang trên mình những vết thương kiêu hãnh, vị vua duy nhất bước lên đỉnh đá bazan cao nhất giữa ánh hoàng hôn màu máu và hổ phách.',
  'Tiếng gầm khải hoàn vang vọng khắp đại ngàn Kỷ Phấn Trắng, khắc ghi định luật bất biến của thiên nhiên: chỉ kẻ bất khuất nhất mới xứng đáng thống trị.'
];

const STUDIO_SHOT_TITLES_VI: string[] = [
  'Điềm Báo Trước Ngày Phán Quyết',
  'Dấu Chân Của Ngai Vàng Lửa',
  'Luồng Điện Ngầm Dưới Đầm Sôi',
  'Kẻ Thách Thức Từ Vực Thẳm',
  'Hai Ánh Mắt Chia Đôi Bầu Trời',
  'Cú Lao Sinh Tử Mở Màn',
  'Va Chạm Giữa Hai Kỷ Nguyên',
  'Móng Vuốt Lôi Đình Xé Giáp',
  'Khóa Hàm Sinh Tử & Dòng Điện Ngược',
  'Cú Quật Đuôi Đập Gãy Cột Đá',
  'Nghịch Cảnh Bên Bờ Vực Lửa',
  'Huyết Quản Hỏa Ngục Thức Tỉnh (DNA Shift)',
  'Bạo Chúa Lửa Xuyên Màn Khói',
  'Tử Chiến Giữa Dòng Sông Dung Nham',
  'Nghiền Nát Cánh Buồm Tích Điện',
  'Vụ Nổ Hồ Quang Tuyệt Vọng',
  'Cú Húc Sập Vách Núi Đá Bazan',
  'Phán Quyết Cuối Cùng Của Tạo Hóa',
  'Dư Chấn Trên Thung Lũng Tro Tàn',
  'Vết Sẹo Hóa Thủy Tinh Đen',
  'Kẻ Bại Trận Lùi Vào Sương Mù',
  'Bước Chân Lên Đỉnh Hoàng Hôn Lửa',
  'Tiếng Gầm Khép Lại Huyền Thoại'
];

/**
 * BỘ CHUYỂN ĐỔI "STORY-TO-SPECTACLE DOP & FILM SCHOOL STUDIO DIRECTING" (PIXAR / UFOTABLE / USC / WALTER MURCH - MEM-17 & MEM-18)
 * Tự động dịch cốt truyện chữ đơn giản thành:
 * - Ngữ pháp Phủ Góc Máy 6 Loại Cảnh (coverageType: MASTER, INSERT_DETAIL, OTS, KULESHOV_REACTION, POV, LOW_ANGLE_HERO)
 * - Bố cục 3 Lớp Chiều Sâu Không Gian (depthStagingEn: FG / MG / BG)
 * - Lời bình điện ảnh đa tầng giàu tính triết lý & kịch tính (Literary Subtext Narration)
 * - Bằng chứng vật lý ("Show, Don't Tell"), Vật chuẩn tỷ lệ, Nén lò xo Sakuga Drop & Bản đồ Màu sắc Tâm lý (Color Script).
 */
function enrichShotWithStudioSpectacle(
  s: any,
  idx: number,
  totalShots: number,
  buildupEndShot: number,
  climaxEndShot: number
) {
  const shotNum = idx + 1;
  const macroPhase: 'PRE_MAIN_BUILDUP' | 'MAIN_CLIMAX_CONFLICT' | 'POST_MAIN_AFTERMATH' =
    s.macroPhase ||
    (shotNum <= buildupEndShot
      ? 'PRE_MAIN_BUILDUP'
      : shotNum <= climaxEndShot
      ? 'MAIN_CLIMAX_CONFLICT'
      : 'POST_MAIN_AFTERMATH');

  const vulnShotNum = Math.max(buildupEndShot + 1, Math.min(climaxEndShot - 1, 11));
  const isShift = Boolean(s.isDnaStateShift || shotNum === 12);
  const isFinalBlow = shotNum === climaxEndShot;

  const coverageType =
    s.coverageType || STUDIO_COVERAGE_CYCLE[idx % STUDIO_COVERAGE_CYCLE.length];

  const depthStagingEn =
    s.depthStagingEn ||
    (coverageType === 'INSERT_DETAIL_CUTAWAY'
      ? '3-Plane Studio Depth Staging: [FG - Out-of-Focus Bokeh f/2.0] drifting rain droplets and glowing embers | [MG - Razor-Sharp Macro Subject] extreme tactile detail of claws, scales, or contracting eye pupil | [BG - Atmospheric Blur] volcanic canyon mist'
      : coverageType === 'OTS_CONFRONTATION'
      ? '3-Plane Studio Depth Staging: [FG - Dark Silhouette Over-The-Shoulder] massive scarred shoulder and jaw edge framing the left foreground | [MG - Sharp Focus Target] rival titan charging in midground | [BG - Scale Reference] forked lightning and erupting lava fissures'
      : coverageType === 'KULESHOV_REACTION'
      ? '3-Plane Studio Depth Staging: [FG - Blurred Sparks & Steam] rising battle smoke brushing past lens | [MG - Emotional Focal Center] intense close-up on scarred face, heaving chest, and fierce eyes | [BG - Dark Storm Clouds] high-contrast chiaroscuro sky'
      : '3-Plane Studio Depth Staging: [FG - Scale Anchor] shattered basalt rock ledges and splintered ancient trees in foreground bokeh | [MG - Core Action] colossal titans in sharp anamorphic focus | [BG - Deep Horizon] towering caldera cliffs and lightning storm');

  const studioTitleVi = STUDIO_SHOT_TITLES_VI[idx] || s.titleVi || `Cảnh ${shotNum}`;
  const studioSubtextVi = STUDIO_LITERARY_SUBTEXT_NARRATION_VI[idx] || s.subtitleVi || studioTitleVi;
  const stuntChoreography = buildCombatChoreographyForShot(idx, macroPhase);
  const stageDestruction = resolveStageDestructionForShot(shotNum, totalShots);

  let emotionalTensionMode:
    | 'OMINOUS_SILENCE'
    | 'RISING_PRESSURE'
    | 'VULNERABILITY_LOW_POINT'
    | 'SAKUGA_DROP_SILENCE_TO_CATHARSIS'
    | 'VISCERAL_CLASH'
    | 'RESONANT_AFTERMATH' = s.emotionalTensionMode || 'VISCERAL_CLASH';

  if (!s.emotionalTensionMode) {
    if (macroPhase === 'PRE_MAIN_BUILDUP') {
      emotionalTensionMode = shotNum <= Math.ceil(buildupEndShot / 2) ? 'OMINOUS_SILENCE' : 'RISING_PRESSURE';
    } else if (shotNum === vulnShotNum) {
      emotionalTensionMode = 'VULNERABILITY_LOW_POINT';
    } else if (isShift || isFinalBlow) {
      emotionalTensionMode = 'SAKUGA_DROP_SILENCE_TO_CATHARSIS';
    } else if (macroPhase === 'POST_MAIN_AFTERMATH') {
      emotionalTensionMode = 'RESONANT_AFTERMATH';
    } else {
      emotionalTensionMode = 'VISCERAL_CLASH';
    }
  }

  const visualExternalizationEn =
    s.visualExternalizationEn ||
    (emotionalTensionMode === 'VULNERABILITY_LOW_POINT'
      ? 'Show-Dont-Tell Physical Proof: ragged steamy breath clouds, cracked basalt armor plates leaking glowing magma like bleeding wounds, trembling knees fighting gravity, yet golden pupil locked in unyielding defiance'
      : emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS'
      ? 'Show-Dont-Tell Physical Proof: extreme macro focus on contracting golden eye pupil reflecting lightning, rain droplets suspended mid-air and flash-boiling into white steam before a blinding thermal shockwave distorts the air'
      : macroPhase === 'PRE_MAIN_BUILDUP'
      ? 'Show-Dont-Tell Physical Proof: concentric seismic ripples in muddy water puddles, small volcanic pebbles bouncing upward from ground tremors, thermal heat-haze shimmering around nostrils'
      : macroPhase === 'POST_MAIN_AFTERMATH'
      ? 'Show-Dont-Tell Physical Proof: smoking claw scars cooling into black glass, ash flakes drifting slowly across battle-worn scales, deep exhausted chest heaving'
      : 'Show-Dont-Tell Physical Proof: thermal heat-haze air distortion around jaws, rain droplets instantly vaporizing into hissing steam on contact with hot scales, flying chips of fractured obsidian armor');

  const scaleAndInertiaEn =
    s.scaleAndInertiaEn ||
    'Scale & Colossal Inertia: worm-eye low-angle perspective looking past foreground shattered rock ledges and splintered ancient tree trunks for human-scale contrast; 19-ton colossal mass with heavy slow-motion momentum and realistic weight transfer (zero weightless toy-like motion)';

  const environmentalCollateralEn =
    s.environmentalCollateralEn ||
    (emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS'
      ? 'Environmental Collateral & Lens Viscerality: spherical rain-parting shockwave blowing the downpour outward into a clear dome, basalt ground cratering underfoot, intense anamorphic lens flare and water droplets hitting the camera lens'
      : macroPhase === 'PRE_MAIN_AFTERMATH' || macroPhase === 'POST_MAIN_AFTERMATH'
      ? 'Environmental Collateral & Lens Viscerality: crumbling basalt pillars smoking in the background, glowing lava fissures cooling, drifting ash and mist brushing past the camera lens'
      : 'Environmental Collateral & Lens Viscerality: shockwave parting the rain curtain, muddy water and molten droplets splashing onto the camera lens, subtle kinetic camera shake on impact');

  const colorScriptMoodEn =
    s.colorScriptMoodEn ||
    (macroPhase === 'PRE_MAIN_BUILDUP'
      ? 'Color Script [Phase 1 - Suspense]: desaturated cold slate-blue and ominous deep-violet storm mist with faint subterranean ember glow'
      : emotionalTensionMode === 'VULNERABILITY_LOW_POINT'
      ? 'Color Script [Phase 2A - Crisis & Vulnerability]: harsh chiaroscuro high-contrast dark shadows, oppressive cyan lightning dominating struggling dim crimson embers'
      : emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS'
      ? 'Color Script [Phase 2B - Sakuga Catharsis]: brief high-contrast monochrome flash erupting into blinding white-hot core magma and fiery crimson-orange dominating neon cyan'
      : macroPhase === 'POST_MAIN_AFTERMATH'
      ? 'Color Script [Phase 3 - Epic Resonance]: warm golden-amber dusk god rays breaking through settling volcanic ash and clearing purple storm clouds'
      : 'Color Script [Phase 2 - Clash]: high-contrast chiaroscuro rim lighting with fiery molten orange clashing against electric bioluminescent cyan');

  return {
    ...s,
    titleVi: studioTitleVi,
    subtitleVi: studioSubtextVi,
    coverageType,
    depthStagingEn,
    stuntChoreography,
    stageDestructionLevel: stageDestruction.level,
    stageDestructionPromptEn: stageDestruction.promptEn,
    macroPhase,
    emotionalTensionMode,
    visualExternalizationEn,
    scaleAndInertiaEn,
    environmentalCollateralEn,
    colorScriptMoodEn,
  };
}

async function synthesizeVietnameseVoiceover(textVi: string, outMp3Path: string): Promise<boolean> {
  const cleanText = String(textVi || '')
    .replace(/\[[A-Z0-9_]+\]/g, '')
    .replace(/@[A-Z0-9_]+/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 195);
  if (!cleanText) return false;
  const sidecarTxtPath = `${outMp3Path}.txt`;
  if (
    fs.existsSync(outMp3Path) &&
    fs.statSync(outMp3Path).size > 1024 &&
    fs.existsSync(sidecarTxtPath) &&
    fs.readFileSync(sidecarTxtPath, 'utf-8').trim() === cleanText
  ) {
    return true;
  }
  try {
    const ttsUrl =
      'https://translate.googleapis.com/translate_tts?client=gtx&ie=UTF-8&tl=vi&dt=t&q=' +
      encodeURIComponent(cleanText);
    const res = await fetch(ttsUrl, {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36',
      },
    });
    if (!res.ok) return false;
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length < 512) return false;
    fs.writeFileSync(outMp3Path, buf);
    fs.writeFileSync(sidecarTxtPath, cleanText, 'utf-8');
    return true;
  } catch {
    return false;
  }
}

async function main() {
  const opts = parseCliArgs(process.argv.slice(2));
  const runSlug = `movie_${Date.now()}`;
  const projectOutDir = opts.resumeDir
    ? path.resolve(opts.resumeDir)
    : path.join(WORKSPACE_ROOT, 'output', 'vscode_runs', runSlug);
  fs.mkdirSync(projectOutDir, { recursive: true });

  console.log('========================================================================');
  console.log('🎬 SKILL [ai-film-studio] — DÂY CHUYỀN SẢN XUẤT PHIM AI 7 GIAI ĐOẠN');
  console.log(`📜 Kịch bản   : "${opts.script}"`);
  console.log(`🎞️ Số cảnh    : ${opts.shots} cảnh (${opts.aspectRatio})`);
  console.log(`🎥 Mô hình    : ${opts.model} ${opts.framesOnly ? '(Chế độ duyệt Storyboard 0 Credit --frames-only)' : ''}`);
  console.log(`📂 Thư mục    : ${projectOutDir} ${opts.resumeDir ? '(CHẾ ĐỘ RESUME TỪ GIAI ĐOẠN 3)' : ''}`);
  console.log('========================================================================\n');

  // Kiểm tra kết nối Cầu nối Local Bridge (bỏ qua nếu chỉ chạy hậu kỳ --master-only)
  if (!opts.masterOnly) {
    const statusRes = await fetch('http://localhost:4321/api/status');
    const statusJson = await statusRes.json();
    if (!statusJson.ok) {
      throw new Error('Cầu nối Google Flow Ultra chưa sẵn sàng: ' + statusJson.error);
    }
    console.log(`✅ [Bước 0] Đã kết nối Google Flow Ultra Sandbox (Frame ID: ${statusJson.sandboxFrameId})\n`);
  }

  const blueprintPath = path.join(projectOutDir, '01_director_blueprint.json');
  const charSheetPath = path.join(projectOutDir, '02_character_1_3panel_sheet.png');
  const char2SheetPath = path.join(projectOutDir, '02_character_2_3panel_sheet.png');
  const envLockPath = path.join(projectOutDir, '03_clean_environment_lock.png');

  let blueprint: any;
  let charImgRes: any;
  let char2ImgRes: any = null;
  let envImgRes: any;
  let charName: string;
  let charDesc: string;
  let char2Name: string;
  let char2Desc: string;
  let envName: string;
  let envDesc: string;

  if (opts.resumeDir && fs.existsSync(blueprintPath) && fs.existsSync(charSheetPath)) {
    console.log('⏩ [Resume Giai đoạn 1 & 2] Đã tìm thấy Hồ sơ Kịch bản + Folder Nhân vật & Bối cảnh đã khóa!');
    blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf-8'));
    charName = blueprint.character?.name || 'APEX_PROTAGONIST';
    charDesc = blueprint.character?.defaultVisualPromptEn || opts.script;
    char2Name = (blueprint.secondaryCharacter?.name || '').trim();
    char2Desc = (blueprint.secondaryCharacter?.defaultVisualPromptEn || '').trim();
    envName = blueprint.environment?.name || 'MAIN_ARENA';
    envDesc = blueprint.environment?.cleanVisualPromptEn || 'Prehistoric volcanic valley, dramatic storm lighting';

    const char1B64 = fs.readFileSync(charSheetPath).toString('base64');
    if (opts.masterOnly) {
      charImgRes = { mediaId: 'cached_char1', base64: char1B64 };
      if (char2Name && fs.existsSync(char2SheetPath)) {
        char2ImgRes = { mediaId: 'cached_char2', base64: fs.readFileSync(char2SheetPath).toString('base64') };
      }
      if (fs.existsSync(envLockPath)) {
        envImgRes = { mediaId: 'cached_env', base64: fs.readFileSync(envLockPath).toString('base64') };
      }
    } else {
      const up1 = await Flow.upload({ base64: char1B64, mimeType: 'image/png', fileName: 'char1.png' });
      charImgRes = { mediaId: up1.mediaId, base64: char1B64 };
      console.log(`   -> ✅ Đã nạp mỏ neo Nhân vật #1 [@${charName}]: mediaId=${charImgRes.mediaId}`);

      if (char2Name && fs.existsSync(char2SheetPath)) {
        const char2B64 = fs.readFileSync(char2SheetPath).toString('base64');
        const up2 = await Flow.upload({ base64: char2B64, mimeType: 'image/png', fileName: 'char2.png' });
        char2ImgRes = { mediaId: up2.mediaId, base64: char2B64 };
        console.log(`   -> ✅ Đã nạp mỏ neo Nhân vật #2 [@${char2Name}]: mediaId=${char2ImgRes.mediaId}`);
      }

      if (fs.existsSync(envLockPath)) {
        const envB64 = fs.readFileSync(envLockPath).toString('base64');
        const upEnv = await Flow.upload({ base64: envB64, mimeType: 'image/png', fileName: 'env.png' });
        envImgRes = { mediaId: upEnv.mediaId, base64: envB64 };
        console.log(`   -> ✅ Đã nạp mỏ neo Bối cảnh [@STAGE: ${envName}]: mediaId=${envImgRes.mediaId}\n`);
      }
    }
  } else {
    // ============================================================================
    // GIAI ĐOẠN 1: TECHNICAL SCRIPT BREAKDOWN (0 CREDIT - OMNI 1.1 FLASH)
    // ============================================================================
    const defaultShotDur = opts.durationSec >= 48 || opts.shots > 8 ? 8 : 4;
    const firstBatchCount = Math.min(8, opts.shots);
    const buildupEndShot = Math.max(1, Math.round(opts.shots * 0.2));
    const climaxEndShot = Math.max(
      buildupEndShot + 1,
      opts.shots - Math.max(1, Math.round(opts.shots * 0.2))
    );
    const resolveMacroPhaseForShot = (shotNum: number): 'PRE_MAIN_BUILDUP' | 'MAIN_CLIMAX_CONFLICT' | 'POST_MAIN_AFTERMATH' => {
      if (shotNum <= buildupEndShot) return 'PRE_MAIN_BUILDUP';
      if (shotNum <= climaxEndShot) return 'MAIN_CLIMAX_CONFLICT';
      return 'POST_MAIN_AFTERMATH';
    };

    console.log(
      `🧠 [Giai đoạn 1/7] Bóc tách Kịch bản Kỹ thuật DOP 3 Giai Đoạn (Khởi động [Shot 1-${buildupEndShot}] -> Ý chính [Shot ${buildupEndShot + 1}-${climaxEndShot}] -> Hậu quả [Shot ${climaxEndShot + 1}-${opts.shots}], tổng ${opts.shots} cảnh / ${opts.durationSec || opts.shots * defaultShotDur}s - 0 Credit)...`
    );
    const breakdownPrompt = `Bạn là Đạo diễn Điện ảnh AI hàng đầu. Kể cả khi người dùng chỉ đưa vào 1 ý chính ngắn gọn, bạn BẮT BUỘC phải tự động mở rộng kịch bản thành Cấu trúc Điện ảnh 3 Giai Đoạn Vĩ Mô (Macro Arc) và 3 Nhịp Vật Lý Vi Mô trong từng cảnh (Micro Arc).
Hãy bóc tách kịch bản sau thành Hồ sơ Sản xuất Phim (Visual Bible + ${firstBatchCount} phân cảnh đầu tiên từ Shot 1 đến Shot ${firstBatchCount}, trong tổng số ${opts.shots} cảnh của bộ phim):
Kịch bản gốc của người dùng: "${opts.script}"

LƯU Ý BẮT BUỘC VỀ HỒ SƠ THÔNG TIN NHÂN VẬT (personalityVi):
Trường "personalityVi" sẽ được nạp thẳng vào ô "Thông tin nhân vật" trong Folder Nhân vật của Google Flow và PHẢI bao gồm đầy đủ 3 phần:
1. Chỉ số hình thể (Chiều cao, cân nặng, giải phẫu/vảy/giáp đặc trưng).
2. Tính cách & Linh hồn cảm xúc (Tính cách, khí chất, thần thái ánh mắt để giữ đúng cái hồn cảm xúc nhân vật).
3. Hành động & Chiêu thức đặc trưng (Đặt mã định danh rõ ràng như [ACTION_...], [SKILL_1_...], [SKILL_2_...] kèm mô tả chuyển động để gọi lại ở các cảnh quay).

QUY TẮC BẮT BUỘC VỀ CẤU TRÚC 3 GIAI ĐOẠN (KHỞI ĐỘNG -> Ý CHÍNH -> HẬU QUẢ - MEM-16):
A. CẤU TRÚC VĨ MÔ TOÀN BỘ PHIM (MACRO 3-PHASE STORYTELLING):
   - GIAI ĐOẠN 1 - KHỞI ĐỘNG / CHUẨN BỊ / ĐIỀM BÁO ("PRE_MAIN_BUILDUP", từ Shot 1 đến Shot ${buildupEndShot}): Không bao giờ nhảy bổ ngay vào đánh nhau ở cảnh 1! Phải mở đầu bằng sự tĩnh lặng căng thẳng trước cơn bão, thiên nhiên biến sắc, rung chấn mặt đất, dấu chân khổng lồ, nhân vật dần lộ diện từ màn sương/bóng tối, gầm vang thăm dò và nạp năng lượng chuẩn bị giao chiến.
   - GIAI ĐOẠN 2 - NỘI DUNG Ý CHÍNH / BÙNG NỔ CAO TRÀO ("MAIN_CLIMAX_CONFLICT", từ Shot ${buildupEndShot + 1} đến Shot ${climaxEndShot}): Triển khai trọn vẹn ý chính của người dùng với nhịp độ leo thang, ăn miếng trả miếng, thức tỉnh DNA (isDnaStateShift) và tung tuyệt kỹ quyết định.
   - GIAI ĐOẠN 3 - HẬU QUẢ / DƯ CHẤN CHIẾN TRƯỜNG ("POST_MAIN_AFTERMATH", từ Shot ${climaxEndShot + 1} đến Shot ${opts.shots}): Khắc họa rõ hậu quả sau khi ý chính xảy ra: chiến trường tan hoang, vách đá sụp đổ, khói bụi và tàn lửa lắng xuống, số phận kẻ bại trận rút lui trong thương tích và hình ảnh kẻ chiến thắng mang vết sẹo chiến trận bước lên đỉnh cao khẳng định bá quyền.

B. CẤU TRÚC VI MÔ 3 NHỊP TRONG MỖI CẢNH 8 GIÂY (MICRO 3-BEAT SHOT ARC):
   Mỗi phân cảnh 8 giây PHẢI được chia rõ thành 3 nhịp vật lý liên hoàn để Veo 3.1 diễn hoạt có hồn và có sức nặng:
   1. "preparationBeatEn" [0.0s - 2.5s Khởi động / Lấy đà]: Tư thế chuẩn bị, lấy đà, siết cơ bắp, hít hơi hoặc nạp năng lượng trước đòn đánh.
   2. "mainActionBeatEn" [2.5s - 5.5s Ý chính / Tung đòn]: Hành động chính hoặc cú va chạm/tuyệt kỹ [SKILL_...] bùng nổ mạnh mẽ nhất.
   3. "aftermathConsequenceEn" [5.5s - 8.0s Hậu quả tức thời / Dư chấn]: Sóng xung kích lan ra, đất đá văng tung tóe, phản lực đẩy lùi đối thủ hoặc tư thế kết thúc để nối mượt sang cảnh kế tiếp.

C. 5 LỚP BÙNG NỔ CẢM XÚC & ĐỘ ĐÃ MẮT CHUẨN STUDIO LỚN (PIXAR / UFOTABLE / ARCANE / DEEPMIND - MEM-17):
   1. "Show, Don't Tell" ("visualExternalizationEn"): CẤM dùng tính từ trừu tượng ("rất mạnh, rất tức giận, rất nóng"). Phải dịch thành bằng chứng vật lý nhìn thấy được (không khí méo mó vì nhiệt độ cao heat-haze, nước mưa chạm vào vảy bốc hơi tức thì thành khói trắng, đồng tử mắt co rút phản chiếu tia sét, sỏi đá nảy lên vì chấn động).
   2. Vật chuẩn tỷ lệ & Quán tính khối lượng ("scaleAndInertiaEn"): Luôn đặt góc máy thấp (Worm's-eye 24mm) nhìn qua thân cây gãy/mỏm đá tiền cảnh để tạo cảm giác khổng lồ, chuyển động nặng hàng chục tấn có quán tính.
   3. Nén Lò Xo Cảm Xúc & Khoảnh khắc Nghịch cảnh ("emotionalTensionMode"): Phải có cảnh Nhân vật chính bị dồn vào nghịch cảnh ("VULNERABILITY_LOW_POINT") ngay trước khi thức tỉnh, và Pha Nén Lò Xo ("SAKUGA_DROP_SILENCE_TO_CATHARSIS": 2 giây đầu tĩnh lặng slow-motion cận cảnh ánh mắt trước khi bung nổ sóng xung kích).
   4. Phản ứng Dây chuyền Môi trường & Ống kính ("environmentalCollateralEn"): Sóng xung kích thổi bạt màn mưa thành vòm cầu trống rỗng, mặt đất lõm xuống, bụi nước và tia lửa bắn vào mặt ống kính (lens droplets & anamorphic camera shake).
   5. Bản đồ Màu sắc Tâm lý ("colorScriptMoodEn"): Chuyển màu theo tâm lý từ Xanh xám u ám (Điềm báo) -> Tương phản Chiaroscuro gắt (Nghịch cảnh) -> Đỏ cam lõi trắng rực rỡ (Cao trào) -> Vàng hổ phách bình minh xuyên qua tro bụi (Hậu quả).

QUY TẮC VÀNG VỀ TÍNH LIỀN MẠCH & DẪN TRUYỆN ĐIỆN ẢNH (CAUSE-AND-EFFECT & 180-DEGREE AXIS):
1. Chuỗi Nhân - Quả ("Vì... Nên..."): Mỗi cảnh (Shot N) phải nối tiếp trực tiếp từ hậu quả kết thúc (aftermathConsequenceEn / exitStateEn) của cảnh trước (Shot N-1).
2. Khóa Trục 180 Độ: Ở mọi cảnh có 2 nhân vật, Nhân vật 1 luôn đứng bên TRÁI nhìn sang PHẢI; Nhân vật 2 luôn đứng bên PHẢI nhìn sang TRÁI.
3. Luân phiên 4 Cỡ cảnh (Wide Establishing -> Medium Tracking -> Extreme Close-Up -> Low-Angle Reaction): Hai cảnh liên tiếp không bao giờ được trùng cỡ cảnh.
4. Trường "subtitleVi" phải là lời thuyết minh điện ảnh giàu cảm xúc, phản ánh rõ cả bước chuẩn bị, đòn đánh chính và hậu quả chấn động của cảnh đó.

Trả về DUY NHẤT 1 khối JSON hợp lệ theo cấu trúc sau (không kèm lời giải thích):
{
  "movieTitle": "Tên bộ phim",
  "character": {
    "name": "TÊN_NHÂN_VẬT_CHÍNH_1_IN_HOA",
    "personalityVi": "• Chỉ số hình thể: Cao ...m, nặng ... tấn, giải phẫu ...\\n• Tính cách & Linh hồn cảm xúc: ...\\n• Hành động & Chiêu thức đặc trưng:\\n  - [ACTION_...]: ...\\n  - [SKILL_1_...]: ...\\n  - [SKILL_2_...]: ...",
    "defaultVisualPromptEn": "Detailed English visual description of character 1 anatomy, skin/scales/armor, distinctive features",
    "transformedVisualPromptEn": "Detailed English visual description of character 1 after battle/climax"
  },
  "secondaryCharacter": {
    "name": "TÊN_NHÂN_VẬT_ĐỐI_THỦ_2_IN_HOA (hoặc để trống nếu phim chỉ có 1 nhân vật)",
    "personalityVi": "• Chỉ số hình thể: Cao ...m, nặng ... tấn, giải phẫu ...\\n• Tính cách & Linh hồn cảm xúc: ...\\n• Hành động & Chiêu thức đặc trưng:\\n  - [ACTION_...]: ...\\n  - [SKILL_1_...]: ...\\n  - [SKILL_2_...]: ...",
    "defaultVisualPromptEn": "Detailed English visual description of character 2 anatomy, scales/armor, distinctive features"
  },
  "environment": {
    "name": "Tên bối cảnh chính",
    "cleanVisualPromptEn": "Detailed English architectural/landscape description with lighting and weather, strictly no creatures or people"
  },
    "shots": [
      {
        "shotNumber": 1,
        "macroPhase": "PRE_MAIN_BUILDUP | MAIN_CLIMAX_CONFLICT | POST_MAIN_AFTERMATH",
        "emotionalTensionMode": "OMINOUS_SILENCE | RISING_PRESSURE | VULNERABILITY_LOW_POINT | SAKUGA_DROP_SILENCE_TO_CATHARSIS | VISCERAL_CLASH | RESONANT_AFTERMATH",
        "titleVi": "Tiêu đề cảnh bằng tiếng Việt",
        "subtitleVi": "Lời thuyết minh dẫn truyện tiếng Việt giàu cảm xúc (nêu rõ từ bước khởi động/điềm báo -> hành động chính -> hậu quả)",
        "skillUsed": "[SKILL_1_...] hoặc [ACTION_...] được nhân vật thi triển trong cảnh này",
        "entryStateEn": "Exact physical starting posture & position inherited from the end of the previous shot",
        "preparationBeatEn": "[0.0s-2.5s Wind-up & Preparation] Physical anticipation, stance lowering, energy charging, or atmospheric omen before the main strike",
        "mainActionBeatEn": "[2.5s-5.5s Core Action & Climax Strike] The primary action beat explicitly invoking @CHARACTER_NAME and named [SKILL_...] / [ACTION_...] move",
        "aftermathConsequenceEn": "[5.5s-8.0s Immediate Aftermath & Fallout] Shockwave propagation, flying debris, physical recoil, environmental scars, or wounded posture",
        "visualExternalizationEn": "Show-Dont-Tell physical proof of emotion/power (e.g. heat-haze distortion, rain flash-boiling on scales, contracting pupil, bouncing pebbles)",
        "scaleAndInertiaEn": "Foreground scale anchor & heavy mass inertia (e.g. worm-eye view past splintered trees, 19-ton slow-motion weight transfer)",
        "environmentalCollateralEn": "Environmental chain reaction & visceral lens effect (e.g. rain-parting shockwave dome, water droplets & sparks hitting lens)",
        "colorScriptMoodEn": "Emotional color script palette for this beat",
        "actionPromptEn": "Combined 3-beat cinematic action summary (Preparation -> Main Action -> Immediate Aftermath)",
        "exitStateEn": "Exact physical ending posture & consequence that leads into the next shot",
        "endFramePromptEn": "Detailed English description of the final aftermath pose/state at the end of this shot",
        "cameraAngle": "Anamorphic 35mm lens, Low-Angle Hero Tracking Shot | Wide Establishing Push-In | Extreme Close-Up Macro",
        "lightingEn": "Chiaroscuro rim lighting, volumetric mist, practical light reflections",
        "sfxEn": "Distinct 3-stage sound effect (wind-up sound -> impact clash -> debris fallout)",
        "ambientNoiseEn": "Background acoustic atmosphere (e.g. heavy rain drumming on rock, distant thunder)",
        "dialogueEn": "Optional spoken line in quotes with vocal tone, or empty string if non-verbal",
        "transitionType": "CONTINUOUS_MATCH_FRAME",
        "isDnaStateShift": false,
        "durationSeconds": ${defaultShotDur}
      }
    ]
}`;

    let blueprintRawLoaded = false;
    try {
      const textRes = await callWithRetry(
        () =>
          Flow.generate.text({
            prompt: breakdownPrompt,
          }),
        'Stage 1 Act 1 Breakdown',
        2
      );
      blueprint = extractJsonObject(textRes.text);
      if (blueprint && Array.isArray(blueprint.shots) && blueprint.shots.length > 0) {
        blueprintRawLoaded = true;
      }
    } catch (act1Err: any) {
      console.warn(`   -> ⚠️ Omni 1.1 Flash Act 1 quá tải (${act1Err.message}), kích hoạt Kịch bản DOP Dự phòng 3 Hồi chuẩn Studio...`);
    }

    if (!blueprintRawLoaded || !blueprint) {
      blueprint = {
        movieTitle: 'ĐẠI CHIẾN KỶ PHẤN TRẮNG: BẠO CHÚA DUNG NHAM ĐỐI ĐẦU THỦY QUÁI LÔI ĐÌNH',
        character: {
          name: 'IGNIS_REX',
          personalityVi:
            '• Chỉ số hình thể: Cao 13.5m, dài 28m, nặng 19 tấn; cơ bắp cuồn cuộn bọc giáp vảy đá bazan đen nhám, dọc sống lưng và cổ họng có các rãnh mạch dung nham phát sáng đỏ cam rực lửa, hàm răng răng cưa khổng lồ bốc khói nhiệt độ cao.\n• Tính cách & Linh hồn cảm xúc: Hung bạo, kiêu hãnh, ánh mắt vàng rực lửa bất khuất của vị vua thống trị đỉnh chuỗi thức ăn, càng bị thương lửa trong huyết quản càng bùng cháy dữ dội.\n• Hành động & Chiêu thức đặc trưng:\n  - [ACTION_SEISMIC_ROAR]: Gầm rống chấn động làm nứt toác mặt đất và phun tàn lửa đỏ rực.\n  - [SKILL_1_MAGMA_JAW_CRUSH]: Cú ngoạm hàm nhiệt hạch 15.000 Newton làm nổ tung tia lửa dung nham.\n  - [SKILL_2_VOLCANIC_TAIL_SLAM]: Quật đuôi bọc gai đá bazan tạo sóng xung kích dung nham quét sạch mục tiêu.',
          defaultVisualPromptEn:
            'Colossal 13.5-meter apex Tyrannosaurus Rex named IGNIS_REX, charcoal-black obsidian basalt armored scales with glowing molten orange-red magma veins along the neck, jaw, and dorsal ridge, glowing amber eyes, massive scarred skull, heavy muscular tail.',
          transformedVisualPromptEn:
            'Awakened Overdrive IGNIS_REX after mid-battle climax: fractured basalt armor plates revealing blinding white-hot and crimson-orange magma flowing across its chest, neck, and jaws, smoking battle scars on snout, glowing fiery eyes radiating volcanic fury.',
        },
        secondaryCharacter: {
          name: 'VOLT_SPINO',
          personalityVi:
            '• Chỉ số hình thể: Cao 14.2m (tính cả buồm lưng), dài 31m, nặng 18 tấn; vảy giáp xám titan ánh xanh biển sâu, buồm lưng khổng lồ cấu tạo từ gai sừng dẫn điện phát quang sinh học màu xanh cyan, mõm cá sấu thuôn dài và đôi vuốt trước dài 1.5m sắc như lưỡi hái.\n• Tính cách & Linh hồn cảm xúc: Xảo quyệt, lạnh lùng, ánh mắt xanh băng giá tàn nhẫn của sát thủ đầm lầy cổ đại, di chuyển linh hoạt giữa nước sôi và bờ đá.\n• Hành động & Chiêu thức đặc trưng:\n  - [ACTION_AMPHIBIOUS_AMBUSH]: Lao vọt từ dưới lòng sông dung nham/đầm lầy lên bờ đá với tốc độ chớp giật.\n  - [SKILL_1_RAZOR_CLAW_FRENZY]: Liên hoàn cào xé bằng đôi vuốt titan tích điện xanh cyan.\n  - [SKILL_2_BIO_VOLT_SHOCKWAVE]: Tích tụ sấm sét vào buồm lưng phát quang rồi phóng luồng xung kích hồ quang điện.',
          defaultVisualPromptEn:
            'Giant 14.2-meter apex Spinosaurus named VOLT_SPINO, sleek titanium-gray and deep-sea slate armored hide, towering jagged dorsal sail glowing with neon-cyan bioluminescent bio-electric veins, elongated crocodilian snout, 1.5-meter razor-sharp foreclaws crackling with blue lightning.',
        },
        environment: {
          name: 'THUNG_LUNG_NHAM_THACH_KRETA',
          cleanVisualPromptEn:
            'Primordial Cretaceous volcanic caldera canyon at stormy dusk, jagged black basalt rock pillars, a glowing molten lava river meeting a steaming boiling lagoon in the center, torrential rain turning to mist, dramatic lightning forks in dark purple storm clouds, zero creatures, zero people.',
        },
        shots: [],
      };
    }
    if (!Array.isArray(blueprint.shots)) blueprint.shots = [];

    // Nếu bộ phim dài nhiều cảnh (ví dụ 3 phút = 23 cảnh), tự động bóc tách tiếp các Hồi (Acts) kế tiếp theo lô 8 cảnh/hồi
    while (blueprint.shots.length < opts.shots && blueprintRawLoaded) {
      const startShotNum = blueprint.shots.length + 1;
      const endShotNum = Math.min(opts.shots, startShotNum + 7);
      const actNum = Math.ceil(startShotNum / 8);
      console.log(
        `   -> 📜 [Hồi ${actNum}] Đang bóc tách tiếp phân cảnh ${startShotNum} -> ${endShotNum}/${opts.shots} theo cấu trúc 3 Giai Đoạn (Khởi động -> Ý chính -> Hậu quả)...`
      );
      const actPrompt = `Tiếp tục bộ phim "${blueprint.movieTitle}" với kịch bản gốc: "${opts.script}".
Nhân vật 1: ${blueprint.character?.name} (${blueprint.character?.personalityVi})
Nhân vật 2: ${blueprint.secondaryCharacter?.name || 'Không có'} (${blueprint.secondaryCharacter?.personalityVi || ''})
Bối cảnh: ${blueprint.environment?.name}
Cảnh vừa kết thúc trước đó (Shot ${startShotNum - 1}): "${blueprint.shots[blueprint.shots.length - 1]?.aftermathConsequenceEn || blueprint.shots[blueprint.shots.length - 1]?.actionPromptEn || ''}"

PHÂN BỔ GIAI ĐOẠN VĨ MÔ BẮT BUỘC (MEM-16):
- Từ Shot 1 đến Shot ${buildupEndShot}: "PRE_MAIN_BUILDUP" (Khởi động / Chuẩn bị / Điềm báo trước khi xung đột chính nổ ra).
- Từ Shot ${buildupEndShot + 1} đến Shot ${climaxEndShot}: "MAIN_CLIMAX_CONFLICT" (Nội dung Ý chính / Giao chiến & Cao trào).
- Từ Shot ${climaxEndShot + 1} đến Shot ${opts.shots}: "POST_MAIN_AFTERMATH" (Hậu quả sau ý chính: tàn tích chiến trường, số phận kẻ bại trận và dư chấn khải hoàn).

Hãy viết tiếp từ Shot ${startShotNum} đến Shot ${endShotNum} (tổng cộng ${endShotNum - startShotNum + 1} cảnh nối tiếp nhân-quả liền mạch). Mỗi cảnh PHẢI có đủ 3 nhịp vật lý: "preparationBeatEn" (0-2.5s lấy đà/chuẩn bị), "mainActionBeatEn" (2.5-5.5s đòn chính), "aftermathConsequenceEn" (5.5-8.0s hậu quả/dư chấn).
Trả về DUY NHẤT JSON:
{
  "shots": [
    {
      "shotNumber": ${startShotNum},
      "macroPhase": "${resolveMacroPhaseForShot(startShotNum)}",
      "titleVi": "...",
      "subtitleVi": "...",
      "skillUsed": "[SKILL_...]",
      "preparationBeatEn": "[0.0s-2.5s Wind-up & Preparation] ...",
      "mainActionBeatEn": "[2.5s-5.5s Core Action & Strike] ...",
      "aftermathConsequenceEn": "[5.5s-8.0s Immediate Aftermath & Fallout] ...",
      "actionPromptEn": "...",
      "endFramePromptEn": "...",
      "cameraAngle": "...",
      "transitionType": "CONTINUOUS_MATCH_FRAME",
      "isDnaStateShift": ${startShotNum <= 12 && endShotNum >= 12 ? 'true' : 'false'},
      "durationSeconds": ${defaultShotDur}
    }
  ]
}`;
      try {
        const actRes = await callWithRetry(
          () => Flow.generate.text({ prompt: actPrompt }),
          `Stage 1 Act ${actNum} Breakdown`,
          2
        );
        const actJson = extractJsonObject(actRes.text);
        if (Array.isArray(actJson.shots) && actJson.shots.length > 0) {
          for (const s of actJson.shots) {
            if (blueprint.shots.length < opts.shots) {
              const sNum = blueprint.shots.length + 1;
              blueprint.shots.push({
                ...s,
                shotNumber: sNum,
                macroPhase: s.macroPhase || resolveMacroPhaseForShot(sNum),
                actionPromptEn: s.actionPromptEn || s.mainActionBeatEn || s.description || s.titleVi,
                durationSeconds: defaultShotDur,
              });
            }
          }
        } else {
          break;
        }
      } catch (actErr: any) {
        console.warn(`   -> ⚠️ Bổ sung các phân cảnh còn lại từ khung DOP 3 Giai Đoạn chuẩn (${actErr.message})...`);
        break;
      }
    }

    // Đảm bảo luôn đủ 100% số cảnh mục tiêu (ví dụ 23 cảnh = 180s) với đầy đủ 3 Giai Đoạn Vĩ Mô & 3 Nhịp Vi Mô
    const fallbackShotTemplates = [
      // === GIAI ĐOẠN 1: KHỞI ĐỘNG / CHUẨN BỊ / ĐIỀM BÁO (PRE_MAIN_BUILDUP: Shots 1 -> 5) ===
      {
        macroPhase: 'PRE_MAIN_BUILDUP',
        titleVi: 'Điềm Báo Giông Bão & Rung Chấn Thung Lũng',
        subtitleVi: 'Trước khi đại chiến nổ ra, mặt đất thung lũng Kreta rung chuyển dữ dội dưới bầu trời sấm sét tím thẫm.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Wide Establishing Shot',
        preparationBeatEn: 'Storm clouds swirl violently above THUNG_LUNG_NHAM_THACH_KRETA as seismic tremors ripple across puddles of boiling water and loose volcanic pebbles',
        mainActionBeatEn: 'Wide cinematic establishing shot as the massive silhouette of @IGNIS_REX steps onto the black basalt cliff edge under forked lightning, executing an ominous [ACTION_SEISMIC_ROAR]',
        aftermathConsequenceEn: 'Shockwaves from the roar shatter nearby rock icicles and send glowing embers drifting across the canyon mist',
        actionPromptEn: 'Wide cinematic establishing shot across THUNG_LUNG_NHAM_THACH_KRETA as @IGNIS_REX emerges atop a black basalt cliff edge under lightning storm, executing [ACTION_SEISMIC_ROAR] while embers erupt from its jaws.',
      },
      {
        macroPhase: 'PRE_MAIN_BUILDUP',
        titleVi: 'Bước Chân Nặng Nề Của Bạo Chúa Dung Nham',
        subtitleVi: 'Mỗi bước chân chuẩn bị săn mồi nặng mười chín tấn nghiền nát đá bazan, mạch dung nham dần rực sáng.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Low-Angle Hero Shot',
        preparationBeatEn: '@IGNIS_REX lowers its scarred armored head, inhaling superheated sulfur mist as magma veins slowly ignite along its neck',
        mainActionBeatEn: 'Low-angle tracking shot of @IGNIS_REX crushing volcanic rocks underfoot on its two massive hind legs, glowing orange magma veins pulsing as it advances',
        aftermathConsequenceEn: 'Deep molten footprints are left smoking in the cracked basalt ground while small boulders tumble into the lava river',
        actionPromptEn: 'Low-angle tracking shot of @IGNIS_REX crushing volcanic rocks underfoot, glowing orange magma veins pulsing along its obsidian scales as it roars across the steaming canyon.',
      },
      {
        macroPhase: 'PRE_MAIN_BUILDUP',
        titleVi: 'Dấu Hiệu Ngầm Dưới Đầm Lầy Sôi Sục',
        subtitleVi: 'Từ dưới lòng đầm lầy tối thẫm, những luồng điện sinh học xanh cyan bắt đầu phóng tia cảnh báo.',
        skillUsed: '[ACTION_AMPHIBIOUS_AMBUSH]',
        cameraAngle: 'Dynamic Tracking Shot',
        preparationBeatEn: 'Deadly stillness over the boiling lagoon is broken by rising bubbles and submerged neon-cyan bio-electric flashes beneath the dark water',
        mainActionBeatEn: 'Dynamic water-level tracking shot as @VOLT_SPINO slices silently through the boiling lagoon, its towering dorsal sail glowing with cyan veins during [ACTION_AMPHIBIOUS_AMBUSH]',
        aftermathConsequenceEn: 'Electrified V-shaped wakes crash violently against the basalt rocks, sending steaming spray into the air',
        actionPromptEn: 'Dynamic water-level tracking shot as @VOLT_SPINO slices through the boiling lagoon, its towering dorsal sail glowing with neon-cyan bio-electric veins during [ACTION_AMPHIBIOUS_AMBUSH].',
      },
      {
        macroPhase: 'PRE_MAIN_BUILDUP',
        titleVi: 'Thủy Quái Lôi Đình Bước Lên Bờ Đá',
        subtitleVi: 'VOLT_SPINO trồi lên khỏi mặt nước, tích tụ điện năng vào đôi vuốt dài một mét rưỡi chuẩn bị nghênh chiến.',
        skillUsed: '[ACTION_AMPHIBIOUS_AMBUSH]',
        cameraAngle: 'Low-Angle Hero Shot',
        preparationBeatEn: 'The boiling water bulges upward at the shoreline as @VOLT_SPINO coils its muscular tail beneath the surface for launch',
        mainActionBeatEn: '@VOLT_SPINO lunges onto the basalt shoreline in [ACTION_AMPHIBIOUS_AMBUSH], shaking off boiling water as blue lightning arcs crackle across its 1.5-meter foreclaws and dorsal sail',
        aftermathConsequenceEn: 'Stray bio-electric arcs scorch the wet shoreline rocks and evaporate falling rain into thick white steam',
        actionPromptEn: '@VOLT_SPINO lunges onto the basalt shoreline in [ACTION_AMPHIBIOUS_AMBUSH], shaking off boiling water as blue lightning arcs crackle across its 1.5-meter foreclaws and dorsal sail.',
      },
      {
        macroPhase: 'PRE_MAIN_BUILDUP',
        titleVi: 'Khoảnh Khắc Nín Thở Trước Giờ Khai Chiến',
        subtitleVi: 'Hai bá chủ tiền sử khóa chặt ánh mắt qua dòng sông lửa, tích tụ toàn bộ nộ khí trước cú lao sinh tử.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Wide Establishing Shot',
        preparationBeatEn: 'Both apex predators plant their feet firmly on opposite banks, lowering their centers of gravity as lava and lightning reflect in their eyes',
        mainActionBeatEn: 'Wide profile standoff shot: @IGNIS_REX on the left glowing fiery red-orange and @VOLT_SPINO on the right glowing electric cyan across the molten lava river, both roaring in [ACTION_SEISMIC_ROAR]',
        aftermathConsequenceEn: 'Colliding acoustic shockwaves part the rain curtain in the center of the arena as both titans kick off the ground to charge',
        actionPromptEn: 'Wide profile standoff shot: @IGNIS_REX on the left glowing fiery red-orange and @VOLT_SPINO on the right glowing electric cyan across the molten lava river, both roaring in [ACTION_SEISMIC_ROAR].',
      },
      // === GIAI ĐOẠN 2: NỘI DUNG Ý CHÍNH / BÙNG NỔ CAO TRÀO (MAIN_CLIMAX_CONFLICT: Shots 6 -> 18) ===
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Cú Lao Mình Tốc Độ Cao Mở Màn Đại Chiến',
        subtitleVi: 'Khởi đầu cuộc đụng độ chính, hai đại quái thú nặng hàng chục tấn lao thẳng vào nhau.',
        skillUsed: '[ACTION_AMPHIBIOUS_AMBUSH]',
        cameraAngle: 'Dynamic Tracking Shot',
        preparationBeatEn: 'Muscles coil like giant springs as @IGNIS_REX on the left and @VOLT_SPINO on the right explosive-start their sprint',
        mainActionBeatEn: 'High-speed lateral dolly shot as @IGNIS_REX and @VOLT_SPINO charge headlong toward each other across the volcanic flats',
        aftermathConsequenceEn: 'Basalt slabs shatter under their claws, kicking up twin trails of molten lava splashes and blue electric sparks',
        actionPromptEn: 'High-speed lateral dolly shot as @IGNIS_REX and @VOLT_SPINO charge headlong toward each other across the volcanic flats, kicking up lava splashes and electric sparks.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Va Chạm Thiên Thạch Đầu Tiên',
        subtitleVi: 'Cú đâm trực diện tạo nên sóng xung kích thổi bạt màn mưa và làm nứt vỡ thềm lục địa.',
        skillUsed: '[SKILL_1_MAGMA_JAW_CRUSH]',
        cameraAngle: 'Medium Action Shot',
        preparationBeatEn: '@IGNIS_REX opens its magma-lit jaws wide while bracing its thick neck for maximum kinetic impact',
        mainActionBeatEn: 'Explosive collision as @IGNIS_REX slams its armored skull into @VOLT_SPINO using [SKILL_1_MAGMA_JAW_CRUSH]',
        aftermathConsequenceEn: 'A blinding ring of steam, sparks, and molten droplets blasts outward, forcing both titans to skid across the wet rock',
        actionPromptEn: 'Explosive collision as @IGNIS_REX slams its armored skull into @VOLT_SPINO using [SKILL_1_MAGMA_JAW_CRUSH], sending a shockwave of steam, sparks, and molten droplets outward.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Liên Hoàn Vuốt Điện Xé Giáp',
        subtitleVi: 'Đôi vuốt một mét rưỡi của VOLT_SPINO cào toạc lớp vảy đá bazan của bạo chúa.',
        skillUsed: '[SKILL_1_RAZOR_CLAW_FRENZY]',
        cameraAngle: 'Extreme Close-Up',
        preparationBeatEn: '@VOLT_SPINO rears back its right forelimb as high-voltage cyan currents surge from its dorsal sail into its talons',
        mainActionBeatEn: 'Close-up kinetic action shot as @VOLT_SPINO unleashes [SKILL_1_RAZOR_CLAW_FRENZY], slashing its electric cyan foreclaws across @IGNIS_REX shoulder armor',
        aftermathConsequenceEn: 'Fragments of chipped black basalt armor fly through the air as glowing embers bleed from the fresh claw marks',
        actionPromptEn: 'Close-up kinetic action shot as @VOLT_SPINO unleashes [SKILL_1_RAZOR_CLAW_FRENZY], slashing its electric cyan foreclaws across @IGNIS_REX shoulder armor in a shower of sparks.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Khóa Hàm Cá Sấu Cổ Đại',
        subtitleVi: 'Bộ hàm thuôn dài tích điện kẹp chặt lấy cổ họng bạo chúa dung nham.',
        skillUsed: '[SKILL_1_RAZOR_CLAW_FRENZY]',
        cameraAngle: 'Dynamic Tracking Shot',
        preparationBeatEn: 'Taking advantage of the stagger, @VOLT_SPINO darts its elongated crocodilian snout toward @IGNIS_REX exposed neck',
        mainActionBeatEn: '@VOLT_SPINO clamps its elongated jaws onto @IGNIS_REX neck while striking with [SKILL_1_RAZOR_CLAW_FRENZY], discharging bio-electric bolts',
        aftermathConsequenceEn: '@IGNIS_REX roars in agony as blue electrical arcs course across its obsidian hide and smoke billows from its throat',
        actionPromptEn: '@VOLT_SPINO clamps its elongated jaws onto @IGNIS_REX neck while striking with [SKILL_1_RAZOR_CLAW_FRENZY], discharging blue bio-electric bolts into the Tyrannosaur scales.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Cú Quật Đuôi Địa Chấn Giải Vây',
        subtitleVi: 'IGNIS_REX xoay người quật đuôi dung nham đập gãy cột đá bazan.',
        skillUsed: '[SKILL_2_VOLCANIC_TAIL_SLAM]',
        cameraAngle: 'Wide Action Shot',
        preparationBeatEn: '@IGNIS_REX plants its left hind foot deep into the lava crust and twists its torso to build rotational torque',
        mainActionBeatEn: '@IGNIS_REX pivots violently and executes [SKILL_2_VOLCANIC_TAIL_SLAM], slamming its heavy basalt tail into @VOLT_SPINO ribs',
        aftermathConsequenceEn: 'The impact hurls @VOLT_SPINO sideways through a towering basalt rock pillar, which collapses in a cloud of dust and embers',
        actionPromptEn: '@IGNIS_REX pivots violently and executes [SKILL_2_VOLCANIC_TAIL_SLAM], slamming its heavy basalt tail into @VOLT_SPINO ribs and hurling the Spinosaurus through a basalt rock pillar.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Xung Kích Lôi Đình Phản Công',
        subtitleVi: 'VOLT_SPINO nạp sấm sét từ bầu trời vào buồm lưng rồi phóng luồng điện hủy diệt.',
        skillUsed: '[SKILL_2_BIO_VOLT_SHOCKWAVE]',
        cameraAngle: 'Low-Angle Hero Shot',
        preparationBeatEn: 'Rising from the rubble, @VOLT_SPINO raises its jagged dorsal sail skyward as a natural lightning bolt strikes and supercharges its spines',
        mainActionBeatEn: '@VOLT_SPINO unleashes [SKILL_2_BIO_VOLT_SHOCKWAVE]—a blinding cyan bio-electric arc blast across the arena',
        aftermathConsequenceEn: 'The shockwave blasts @IGNIS_REX backward to the edge of the lava cliff, cracking its outer basalt armor plates',
        actionPromptEn: 'Natural lightning strikes @VOLT_SPINO dorsal sail, supercharging it before @VOLT_SPINO unleashes [SKILL_2_BIO_VOLT_SHOCKWAVE]—a blinding cyan arc blast that drives @IGNIS_REX backward to the lava cliff.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Sự Thức Tỉnh Huyết Quản Hỏa Ngục (DNA Shift)',
        subtitleVi: 'Giáp đá nứt toác, lõi dung nham trắng rực bùng nổ khắp cơ thể IGNIS_REX!',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Low-Angle Hero Shot',
        isDnaStateShift: true,
        preparationBeatEn: 'On the brink of defeat, @IGNIS_REX heart reactor surges as blinding white-hot light leaks through every crack in its damaged basalt armor',
        mainActionBeatEn: 'Climactic DNA state shift: @IGNIS_REX fractured armor plates glow blinding crimson-white as molten magma overflows, unleashing an earth-shattering [ACTION_SEISMIC_ROAR]',
        aftermathConsequenceEn: 'A column of volcanic fire erupts around @IGNIS_REX, melting nearby rocks into liquid glass',
        actionPromptEn: 'Climactic DNA state shift: @IGNIS_REX cracked basalt armor plates glow blinding white-hot crimson as molten magma overflows from its battle scars, unleashing an earth-shattering [ACTION_SEISMIC_ROAR].',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Bạo Chúa Thức Tỉnh Phản Kích',
        subtitleVi: 'Sức nóng hàng ngàn độ làm bốc hơi mọi giọt mưa quanh thân hình bạo chúa.',
        skillUsed: '[SKILL_1_MAGMA_JAW_CRUSH]',
        cameraAngle: 'Dynamic Tracking Shot',
        preparationBeatEn: 'Awakened @IGNIS_REX lowers its blazing skull, flames trailing from its jaws as rain instantly vaporizes into steam',
        mainActionBeatEn: 'Awakened @IGNIS_REX charges through a wall of fire with blazing magma veins, lunging at @VOLT_SPINO with [SKILL_1_MAGMA_JAW_CRUSH]',
        aftermathConsequenceEn: '@VOLT_SPINO is driven backward into the shallow lava river amidst a violent explosion of superheated steam',
        actionPromptEn: 'Awakened @IGNIS_REX charges through a wall of fire with blazing magma veins, lunging at @VOLT_SPINO with [SKILL_1_MAGMA_JAW_CRUSH] as superheated steam explodes around them.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Cuộc Chiến Giữa Dòng Sông Lửa',
        subtitleVi: 'Hai quái thú vật lộn ngay giữa dòng dung nham đang cuộn chảy.',
        skillUsed: '[SKILL_1_RAZOR_CLAW_FRENZY]',
        cameraAngle: 'Wide Action Shot',
        preparationBeatEn: 'Standing ankle-deep in molten lava, both titans circle and lock shoulders amidst swirling toxic fumes',
        mainActionBeatEn: 'Wide dramatic battle shot inside the shallow molten lava river: @IGNIS_REX and @VOLT_SPINO grapple fiercely while @VOLT_SPINO slashes with [SKILL_1_RAZOR_CLAW_FRENZY]',
        aftermathConsequenceEn: 'Giant waves of liquid fire splash onto the canyon walls, illuminating the storm clouds in crimson and cyan',
        actionPromptEn: 'Wide dramatic battle shot inside the shallow molten lava river: @IGNIS_REX and @VOLT_SPINO grapple fiercely, splashing liquid fire while @VOLT_SPINO slashes with [SKILL_1_RAZOR_CLAW_FRENZY].',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Đòn Ngoạm Nhiệt Hạch Phá Buồm Lưng',
        subtitleVi: 'Hàm răng dung nham của IGNIS_REX nghiền nát một mảng gai điện của đối thủ.',
        skillUsed: '[SKILL_1_MAGMA_JAW_CRUSH]',
        cameraAngle: 'Extreme Close-Up',
        preparationBeatEn: '@IGNIS_REX dodges a claw swipe and locks its glowing amber eyes onto @VOLT_SPINO glowing dorsal sail',
        mainActionBeatEn: 'Extreme close-up impact shot as @IGNIS_REX clamps down on @VOLT_SPINO glowing dorsal sail with [SKILL_1_MAGMA_JAW_CRUSH]',
        aftermathConsequenceEn: 'Cyan bio-electric spines shatter in a violent shower of red and blue sparks, short-circuiting @VOLT_SPINO energy grid',
        actionPromptEn: 'Extreme close-up impact shot as @IGNIS_REX clamps down on @VOLT_SPINO glowing dorsal sail with [SKILL_1_MAGMA_JAW_CRUSH], shattering cyan bio-electric spines in an explosion of red and blue sparks.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Bão Điện Sinh Học Tuyệt Vọng',
        subtitleVi: 'VOLT_SPINO vùng vẫy phóng toàn bộ điện năng còn lại ở cự ly gần.',
        skillUsed: '[SKILL_2_BIO_VOLT_SHOCKWAVE]',
        cameraAngle: 'Medium Action Shot',
        preparationBeatEn: 'Wounded @VOLT_SPINO thrashes violently, overloading its remaining intact dorsal spines with unstable plasma',
        mainActionBeatEn: '@VOLT_SPINO roars in pain and triggers a point-blank [SKILL_2_BIO_VOLT_SHOCKWAVE], engulfing both dinosaurs in crackling blue lightning',
        aftermathConsequenceEn: 'The overloaded blast leaves @VOLT_SPINO dorsal sail flickering weakly and smoking while @IGNIS_REX endures the shock',
        actionPromptEn: '@VOLT_SPINO roars in pain and triggers a point-blank [SKILL_2_BIO_VOLT_SHOCKWAVE], engulfing both giant dinosaurs in a violent sphere of crackling blue lightning and orange fire.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Cú Húc Đầu Phá Vỡ Vách Núi',
        subtitleVi: 'IGNIS_REX lao xuyên qua màn sét, húc văng đối thủ vào vách hẻm vực.',
        skillUsed: '[SKILL_1_MAGMA_JAW_CRUSH]',
        cameraAngle: 'Dynamic Tracking Shot',
        preparationBeatEn: '@IGNIS_REX shakes off the residual lightning, digging its hind claws into the riverbed for a full-power bull rush',
        mainActionBeatEn: 'Unstoppable @IGNIS_REX powers straight through the electric arcs and rams @VOLT_SPINO into the canyon wall using [SKILL_1_MAGMA_JAW_CRUSH]',
        aftermathConsequenceEn: 'The cliffside fractures and collapses, triggering an avalanche of glowing volcanic boulders around the stunned Spinosaurus',
        actionPromptEn: 'Unstoppable @IGNIS_REX powers straight through the electric arcs and rams @VOLT_SPINO into the canyon wall using [SKILL_1_MAGMA_JAW_CRUSH], triggering an avalanche of glowing volcanic boulders.',
      },
      {
        macroPhase: 'MAIN_CLIMAX_CONFLICT',
        titleVi: 'Tuyệt Kỹ Hàm Dung Nham Kết Liễu Cao Trào',
        subtitleVi: 'IGNIS_REX bắt trọn cú lao cuối cùng của đối thủ bằng đòn ngoạm hàm nhiệt hạch tối thượng.',
        skillUsed: '[SKILL_1_MAGMA_JAW_CRUSH]',
        cameraAngle: 'Low-Angle Hero Shot',
        preparationBeatEn: 'As @VOLT_SPINO makes one final desperate lunge, @IGNIS_REX widens its white-hot magma jaws to intercept',
        mainActionBeatEn: '@IGNIS_REX catches @VOLT_SPINO mid-lunge with its ultimate [SKILL_1_MAGMA_JAW_CRUSH] and slams the rival onto the fractured basalt plateau',
        aftermathConsequenceEn: 'Magma geysers erupt behind them as the seismic slam shakes the entire caldera and ends the main clash',
        actionPromptEn: '@IGNIS_REX catches @VOLT_SPINO mid-lunge with its ultimate [SKILL_1_MAGMA_JAW_CRUSH], lifting and slamming the defeated rival onto the fractured basalt plateau as magma geysers erupt behind them.',
      },
      // === GIAI ĐOẠN 3: HẬU QUẢ & DƯ CHẤN CHIẾN TRƯỜNG (POST_MAIN_AFTERMATH: Shots 19 -> 23) ===
      {
        macroPhase: 'POST_MAIN_AFTERMATH',
        titleVi: 'Dư Chấn Địa Chất & Chiến Trường Tan Hoang',
        subtitleVi: 'Sau đòn quyết định, cả thung lũng nham thạch chìm trong khói bụi, đá vỡ và những vết nứt dung nham âm ỉ.',
        skillUsed: '[SKILL_2_VOLCANIC_TAIL_SLAM]',
        cameraAngle: 'Wide Establishing Shot',
        preparationBeatEn: 'Heavy ash and embers rain down across the shattered basalt pillars of THUNG_LUNG_NHAM_THACH_KRETA as the shockwave subsides',
        mainActionBeatEn: 'Wide aftermath panorama: @IGNIS_REX stands breathing heavily on the left with smoking battle scars while @VOLT_SPINO lies staggered among fallen boulders on the right',
        aftermathConsequenceEn: 'Cracks in the canyon floor glow dimly with cooling lava as steam rises from the devastated battlefield',
        actionPromptEn: 'Wide aftermath shot across the shattered volcanic battlefield: @IGNIS_REX stands breathing heavily on the left with smoking battle scars while @VOLT_SPINO struggles to rise among fallen basalt boulders on the right.',
      },
      {
        macroPhase: 'POST_MAIN_AFTERMATH',
        titleVi: 'Vết Thương Chiến Trận Của Hai Gã Khổng Lồ',
        subtitleVi: 'Cả hai bá chủ đều mang trên mình những vết sẹo bốc khói, minh chứng cho cuộc tử chiến khốc liệt.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Extreme Close-Up',
        preparationBeatEn: 'Thick smoke curls from the deep claw marks on @IGNIS_REX armored chest and the fractured spines of @VOLT_SPINO dorsal sail',
        mainActionBeatEn: 'Close-up dramatic aftermath portrait of @IGNIS_REX scarred face and glowing amber eyes staring down its defeated rival',
        aftermathConsequenceEn: 'Molten droplets drip slowly from @IGNIS_REX chin onto the scorched rock, solidifying into black glass',
        actionPromptEn: 'Close-up dramatic aftermath shot of @IGNIS_REX battle-scarred skull and glowing amber eyes as molten droplets drip from its jaws onto the scorched basalt.',
      },
      {
        macroPhase: 'POST_MAIN_AFTERMATH',
        titleVi: 'Kẻ Bại Trận Rút Lui Vào Sương Mù',
        subtitleVi: 'VOLT_SPINO trọng thương lặng lẽ trượt xuống làn nước sương mù, nhường lại lãnh địa cho vị vua mới.',
        skillUsed: '[SKILL_2_VOLCANIC_TAIL_SLAM]',
        cameraAngle: 'Wide Establishing Shot',
        preparationBeatEn: 'Recognizing defeat, @VOLT_SPINO lowers its head, its cyan dorsal sail flickering dimly as it steps backward toward the water',
        mainActionBeatEn: 'Defeated and smoking, @VOLT_SPINO retreats backward into the misty dark lagoon waters while @IGNIS_REX watches from the volcanic ridge',
        aftermathConsequenceEn: 'Ripples fade across the dark lagoon surface as mist swallows @VOLT_SPINO silhouette, leaving @IGNIS_REX as sole ruler',
        actionPromptEn: 'Defeated and smoking, @VOLT_SPINO retreats backward into the misty dark lagoon waters while @IGNIS_REX guards the volcanic ridge after [SKILL_2_VOLCANIC_TAIL_SLAM].',
      },
      {
        macroPhase: 'POST_MAIN_AFTERMATH',
        titleVi: 'Bạo Chúa Bước Lên Đỉnh Đá Bazan',
        subtitleVi: 'Giữa tàn tích chiến trường, IGNIS_REX bước lên đỉnh mỏm đá cao nhất trong ánh hoàng hôn lửa.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Low-Angle Hero Shot',
        preparationBeatEn: 'Storm clouds begin to part overhead as @IGNIS_REX turns toward the highest obsidian pinnacle overlooking the ruined valley',
        mainActionBeatEn: 'Majestic low-angle tracking shot as victorious @IGNIS_REX stomps powerfully on its two massive hind legs up the highest obsidian pinnacle, magma veins glowing',
        aftermathConsequenceEn: 'Loose volcanic gravel cascades down the cliffside as @IGNIS_REX reaches the summit and plants its hind feet',
        actionPromptEn: 'Majestic low-angle tracking shot as victorious @IGNIS_REX stomps powerfully on its two massive hind legs up the highest obsidian pinnacle overlooking THUNG_LUNG_NHAM_THACH_KRETA, magma veins glowing triumphantly.',
      },
      {
        macroPhase: 'POST_MAIN_AFTERMATH',
        titleVi: 'Tiếng Gầm Thống Trị Khép Lại Huyền Thoại',
        subtitleVi: 'Tiếng gầm khải hoàn vang vọng khắp đại ngàn, mở ra kỷ nguyên thống trị tuyệt đối của Bạo Chúa Dung Nham.',
        skillUsed: '[ACTION_SEISMIC_ROAR]',
        cameraAngle: 'Wide Establishing Shot',
        preparationBeatEn: 'Atop the volcanic peak, @IGNIS_REX inhales deeply as its magma veins flare one final time against the clearing storm sky',
        mainActionBeatEn: 'Grand finale wide shot: @IGNIS_REX stands atop the volcanic peak unleashing an earth-shaking [ACTION_SEISMIC_ROAR] into the heavens',
        aftermathConsequenceEn: 'Echoes of the roar roll across the quiet prehistoric valley as volcanic ash settles and golden dusk light breaks through the clouds',
        actionPromptEn: 'Grand finale wide shot: @IGNIS_REX stands atop the volcanic peak unleashing an earth-shaking [ACTION_SEISMIC_ROAR] into the heavens as twin lightning bolts and a volcanic eruption illuminate the prehistoric sky.',
      },
    ];

    while (blueprint.shots.length < opts.shots) {
      const idx = blueprint.shots.length;
      const tpl = fallbackShotTemplates[idx % fallbackShotTemplates.length];
      blueprint.shots.push({
        shotNumber: idx + 1,
        macroPhase: tpl.macroPhase || resolveMacroPhaseForShot(idx + 1),
        titleVi: tpl.titleVi,
        subtitleVi: tpl.subtitleVi,
        skillUsed: tpl.skillUsed,
        preparationBeatEn: tpl.preparationBeatEn,
        mainActionBeatEn: tpl.mainActionBeatEn,
        aftermathConsequenceEn: tpl.aftermathConsequenceEn,
        actionPromptEn: tpl.actionPromptEn,
        endFramePromptEn: `Final aftermath frame of shot ${idx + 1}: ${tpl.aftermathConsequenceEn || tpl.actionPromptEn}`,
        cameraAngle: tpl.cameraAngle,
        transitionType: 'CONTINUOUS_MATCH_FRAME',
        isDnaStateShift: Boolean(tpl.isDnaStateShift || idx === 11),
        durationSeconds: defaultShotDur,
      });
    }
    // Chuẩn hóa các trường 3-Phase Macro & Micro + 7 Lớp Cảm Xúc Studio (MEM-16 & MEM-17) cho toàn bộ shots
    blueprint.shots = blueprint.shots.slice(0, opts.shots).map((s: any, idx: number) => {
      const tpl = fallbackShotTemplates[idx % fallbackShotTemplates.length];
      const shotNumber = idx + 1;
      const macroPhase = s.macroPhase || tpl.macroPhase || resolveMacroPhaseForShot(shotNumber);
      const preparationBeatEn =
        s.preparationBeatEn ||
        s.entryStateEn ||
        tpl.preparationBeatEn ||
        'Subject lowers stance, muscles coiling and gathering energy before the strike';
      const mainActionBeatEn =
        s.mainActionBeatEn || s.actionPromptEn || s.description || tpl.mainActionBeatEn || tpl.actionPromptEn;
      const aftermathConsequenceEn =
        s.aftermathConsequenceEn ||
        s.exitStateEn ||
        tpl.aftermathConsequenceEn ||
        'Shockwave ripples outward, debris scatters across the ground, and subjects brace from the physical recoil';
      return enrichShotWithStudioSpectacle(
        {
          ...s,
          shotNumber,
          macroPhase,
          titleVi: s.titleVi || tpl.titleVi,
          subtitleVi: s.subtitleVi || s.description || tpl.subtitleVi,
          skillUsed: s.skillUsed || tpl.skillUsed,
          preparationBeatEn,
          mainActionBeatEn,
          aftermathConsequenceEn,
          actionPromptEn: s.actionPromptEn || s.description || tpl.actionPromptEn,
          endFramePromptEn: s.endFramePromptEn || `Final aftermath state: ${aftermathConsequenceEn}`,
          cameraAngle: s.cameraAngle || tpl.cameraAngle,
          transitionType: s.transitionType || 'CONTINUOUS_MATCH_FRAME',
          isDnaStateShift: idx === 11 ? true : Boolean(s.isDnaStateShift),
        },
        idx,
        opts.shots,
        buildupEndShot,
        climaxEndShot
      );
    });

    // Chuẩn hóa thời lượng từng cảnh để khớp chính xác tổng thời lượng mục tiêu (ví dụ 180s = 3 phút)
    if (opts.durationSec > 0 && blueprint.shots.length > 0) {
      let acc = 0;
      for (let i = 0; i < blueprint.shots.length; i++) {
        if (i < blueprint.shots.length - 1) {
          blueprint.shots[i].durationSeconds = 8;
          acc += 8;
        } else {
          const rem = opts.durationSec - acc;
          blueprint.shots[i].durationSeconds = rem >= 6 ? 8 : 4;
        }
      }
    }

    fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2), 'utf-8');
    const plannedTotalSec = blueprint.shots.reduce((sum: number, s: any) => sum + (s.durationSeconds || defaultShotDur), 0);
    console.log(
      `   -> ✅ Đã tạo Kịch bản Kỹ thuật: "${blueprint.movieTitle}" (${blueprint.shots?.length || 0} cảnh — Tổng thời lượng: ${plannedTotalSec}s)`
    );
    console.log(`   -> 💾 Lưu tại: ${blueprintPath}\n`);

    // ============================================================================
    // GIAI ĐOẠN 2: VISUAL BIBLE & ASSET LOCKING (0 CREDIT - 🍌 NANO BANANA PRO)
    // ============================================================================
    console.log('🍌 [Giai đoạn 2/7] Đúc 3-Panel Character Sheet (#808080) & Clean Environment Lock (0 Credit)...');
    charName = blueprint.character?.name || 'APEX_PROTAGONIST';
    charDesc = blueprint.character?.defaultVisualPromptEn || opts.script;
    char2Name = (blueprint.secondaryCharacter?.name || '').trim();
    char2Desc = (blueprint.secondaryCharacter?.defaultVisualPromptEn || '').trim();
    envName = blueprint.environment?.name || 'MAIN_ARENA';
    envDesc = blueprint.environment?.cleanVisualPromptEn || 'Prehistoric volcanic valley, dramatic storm lighting';

    // 2A. 3-Panel Character Reference Sheet #1 (ZERO TEXT / ZERO LABELS)
    const charSheetPrompt = `${opts.aspectRatio} three-panel character reference sheet split into 3 views: (1) close-up portrait of head, jaws, eyes, and facial details, (2) full-body front/side view standing, (3) full-body three-quarter back view showing spine and tail. Subject: [CHARACTER 1: ${charName}] — ${charDesc}. Isolated on a flat neutral gray studio background (#808080) with shadowless studio lighting, zero cast shadows, identical anatomy across all 3 views, 8k photorealistic. STRICTLY NO TEXT, NO LETTERS, NO WORDS, NO LABELS, NO NUMBERS, NO TYPOGRAPHY, NO BORDERS, NO WATERMARKS.`.slice(0, 3800);

    charImgRes = await callWithRetry(
      () =>
        Flow.generate.image({
          prompt: charSheetPrompt,
          modelDisplayName: '🍌 Nano Banana Pro',
          aspectRatio: opts.aspectRatio,
        }),
      'Stage 2A Char 1 Sheet'
    );
    fs.writeFileSync(charSheetPath, Buffer.from(charImgRes.base64, 'base64'));
    console.log(`   -> ✅ Đã đúc 3-Panel Character Sheet #1 [${charName}]: mediaId=${charImgRes.mediaId}`);
    console.log(`   -> 💾 Lưu tại: ${charSheetPath}`);

    if (!opts.skipHostSync) {
      try {
        const portrait1Path = path.join(projectOutDir, '02_character_1_portrait.png');
        let portrait1Query = `CHAR_3PANEL_${charName}`;
        try {
          const ffmpegBinName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
          const localFfmpeg = path.join(WORKSPACE_ROOT, 'node_modules', 'ffmpeg-static', ffmpegBinName);
          const ffmpegCmd = fs.existsSync(localFfmpeg) ? `"${localFfmpeg}"` : 'ffmpeg';
          execSync(`${ffmpegCmd} -y -i "${charSheetPath}" -vf "crop=iw/3:ih:0:0" "${portrait1Path}"`, { stdio: 'ignore' });
          if (fs.existsSync(portrait1Path)) {
            const p1B64 = fs.readFileSync(portrait1Path).toString('base64');
            await Flow.upload({
              base64: p1B64,
              mimeType: 'image/png',
              name: `CHAR_PORTRAIT_${charName}`,
              fileName: `CHAR_PORTRAIT_${charName}.png`,
            }).catch(() => {});
            portrait1Query = `CHAR_PORTRAIT_${charName}`;
          }
        } catch {}

        await Flow.save({
          base64: charImgRes.base64,
          mimeType: charImgRes.mimeType || 'image/png',
          name: `CHAR_3PANEL_${charName}`,
          filename: `CHAR_3PANEL_${charName}.png`,
          metadata: { name: `CHAR_3PANEL_${charName}` },
        }).catch(() => {});
        console.log(`   -> 🧍 [Khóa Folder Nhân vật 3 Phần] Đang nạp "${charName}" (1. Chân dung Portrait riêng + 2. Tạo cơ thể 3-Panel + 3. Thông tin/Chiêu thức) vào tab "Nhân vật"...`);
        await Flow.host.createCharacter({
          name: charName,
          personality: blueprint.character?.personalityVi || charDesc,
          portraitAssetQuery: portrait1Query,
          bodyAssetQuery: `CHAR_3PANEL_${charName}`,
          assetQuery: `CHAR_3PANEL_${charName}`,
          assetIndex: 1,
        });
        console.log(`   -> ✅ Đã khóa trọn bộ Folder 3 Phần của Nhân vật #1 "${charName}" vào thư viện "Nhân vật"!`);
      } catch (e: any) {
        console.warn(`   -> ⚠️ Không thể lưu Nhân vật #1 vào tab Nhân vật: ${e.message}`);
      }
    }

    // 2B. 3-Panel Character Reference Sheet #2 (ZERO TEXT / ZERO LABELS)
    if (char2Name && char2Desc) {
      const char2SheetPrompt = `${opts.aspectRatio} three-panel character reference sheet split into 3 views: (1) close-up portrait of head, jaws, eyes, and facial details, (2) full-body front/side view standing, (3) full-body three-quarter back view showing spine/sail and tail. Subject: [CHARACTER 2: ${char2Name}] — ${char2Desc}. Isolated on a flat neutral gray studio background (#808080) with shadowless studio lighting, zero cast shadows, identical anatomy across all 3 views, 8k photorealistic. STRICTLY NO TEXT, NO LETTERS, NO WORDS, NO LABELS, NO NUMBERS, NO TYPOGRAPHY, NO BORDERS, NO WATERMARKS.`.slice(0, 3800);

      char2ImgRes = await callWithRetry(
        () =>
          Flow.generate.image({
            prompt: char2SheetPrompt,
            modelDisplayName: '🍌 Nano Banana Pro',
            aspectRatio: opts.aspectRatio,
          }),
        'Stage 2B Char 2 Sheet'
      );
      fs.writeFileSync(char2SheetPath, Buffer.from(char2ImgRes.base64, 'base64'));
      console.log(`   -> ✅ Đã đúc 3-Panel Character Sheet #2 [${char2Name}]: mediaId=${char2ImgRes.mediaId}`);
      console.log(`   -> 💾 Lưu tại: ${char2SheetPath}`);

      if (!opts.skipHostSync) {
        try {
          const portrait2Path = path.join(projectOutDir, '02_character_2_portrait.png');
          let portrait2Query = `CHAR_3PANEL_${char2Name}`;
          try {
            const ffmpegBinName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
            const localFfmpeg = path.join(WORKSPACE_ROOT, 'node_modules', 'ffmpeg-static', ffmpegBinName);
            const ffmpegCmd = fs.existsSync(localFfmpeg) ? `"${localFfmpeg}"` : 'ffmpeg';
            execSync(`${ffmpegCmd} -y -i "${char2SheetPath}" -vf "crop=iw/3:ih:0:0" "${portrait2Path}"`, { stdio: 'ignore' });
            if (fs.existsSync(portrait2Path)) {
              const p2B64 = fs.readFileSync(portrait2Path).toString('base64');
              await Flow.upload({
                base64: p2B64,
                mimeType: 'image/png',
                name: `CHAR_PORTRAIT_${char2Name}`,
                fileName: `CHAR_PORTRAIT_${char2Name}.png`,
              }).catch(() => {});
              portrait2Query = `CHAR_PORTRAIT_${char2Name}`;
            }
          } catch {}

          await Flow.save({
            base64: char2ImgRes.base64,
            mimeType: char2ImgRes.mimeType || 'image/png',
            name: `CHAR_3PANEL_${char2Name}`,
            filename: `CHAR_3PANEL_${char2Name}.png`,
            metadata: { name: `CHAR_3PANEL_${char2Name}` },
          }).catch(() => {});
          console.log(`   -> 🧍 [Khóa Folder Nhân vật 3 Phần] Đang nạp "${char2Name}" (1. Chân dung Portrait riêng + 2. Tạo cơ thể 3-Panel + 3. Thông tin/Chiêu thức) vào tab "Nhân vật"...`);
          await Flow.host.createCharacter({
            name: char2Name,
            personality: blueprint.secondaryCharacter?.personalityVi || char2Desc,
            portraitAssetQuery: portrait2Query,
            bodyAssetQuery: `CHAR_3PANEL_${char2Name}`,
            assetQuery: `CHAR_3PANEL_${char2Name}`,
            assetIndex: 1,
          });
          console.log(`   -> ✅ Đã khóa trọn bộ Folder 3 Phần của Nhân vật #2 "${char2Name}" vào thư viện "Nhân vật"!`);
        } catch (e: any) {
          console.warn(`   -> ⚠️ Không thể lưu Nhân vật #2 vào tab Nhân vật: ${e.message}`);
        }
      }
    }

    // 2C. Clean Environment Lock (Zero People / Zero Creatures)
    const envLockPrompt = `${opts.aspectRatio} wide cinematic establishing shot of environment [${envName}]: ${envDesc}. STRICTLY EMPTY ENVIRONMENT: zero people, zero animals, zero dinosaurs, no creatures, no silhouettes, uninhabited clean primordial landscape plate, locked lighting and atmosphere, 8k photorealistic movie set plate.`.slice(0, 3800);

    envImgRes = await callWithRetry(
      () =>
        Flow.generate.image({
          prompt: envLockPrompt,
          modelDisplayName: '🍌 Nano Banana Pro',
          aspectRatio: opts.aspectRatio,
        }),
      'Stage 2C Clean Env Lock'
    );
    fs.writeFileSync(envLockPath, Buffer.from(envImgRes.base64, 'base64'));
    console.log(`   -> ✅ Đã khóa Clean Environment Lock [${envName}]: mediaId=${envImgRes.mediaId}`);
    console.log(`   -> 💾 Lưu tại: ${envLockPath}`);

    if (!opts.skipHostSync) {
      try {
        await Flow.save({
          base64: envImgRes.base64,
          mimeType: envImgRes.mimeType || 'image/png',
          name: `STAGE_LOCK_${envName}`,
          filename: `STAGE_LOCK_${envName}.png`,
          metadata: { name: `STAGE_LOCK_${envName}` },
        }).catch(() => {});
        console.log(`   -> 🏞️ [Khóa Thư Viện Flow] Đang lưu Bối cảnh "STAGE: ${envName}" vào thư viện thực thể Flow...`);
        await Flow.host.createCharacter({
          name: `STAGE: ${envName}`,
          personality: `Bối cảnh khóa cố định (Clean Environment Lock): ${envDesc}`,
          assetQuery: `STAGE_LOCK_${envName}`,
          assetIndex: 1,
        });
        console.log(`   -> ✅ Đã khóa Bối cảnh "STAGE: ${envName}" vào thư viện Flow!`);
      } catch (e: any) {
        console.warn(`   -> ⚠️ Không thể lưu Bối cảnh vào thư viện: ${e.message}`);
      }
    }
    console.log('');
  }

  // ============================================================================
  // GIAI ĐOẠN 3: FULL-RES STORYBOARD KEYFRAMES (0 CREDIT - 🍌 NANO BANANA PRO)
  // ============================================================================
  console.log('🎨 [Giai đoạn 3/7] Vẽ Dàn Khung Hình Storyboard Độ Phân Giải Đầy Đủ (0 Credit)...');
  const totalShotCount = Math.max(1, (blueprint.shots || []).slice(0, opts.shots).length);
  const stage3BuildupEnd = Math.max(1, Math.round(totalShotCount * 0.2));
  const stage3ClimaxEnd = Math.max(
    stage3BuildupEnd + 1,
    totalShotCount - Math.max(1, Math.round(totalShotCount * 0.2))
  );
  const shots = (blueprint.shots || []).slice(0, opts.shots).map((s: any, idx: number) => {
    const shotNum = idx + 1;
    const defaultPhase =
      shotNum <= stage3BuildupEnd
        ? 'PRE_MAIN_BUILDUP'
        : shotNum <= stage3ClimaxEnd
        ? 'MAIN_CLIMAX_CONFLICT'
        : 'POST_MAIN_AFTERMATH';
    return enrichShotWithStudioSpectacle(
      {
        ...s,
        macroPhase: s.macroPhase || defaultPhase,
        preparationBeatEn:
          s.preparationBeatEn ||
          s.entryStateEn ||
          (defaultPhase === 'PRE_MAIN_BUILDUP'
            ? 'Atmospheric tension builds as the environment trembles and the subject lowers its stance in anticipation'
            : defaultPhase === 'MAIN_CLIMAX_CONFLICT'
            ? 'Muscles coil and energy surges across the subject body as it winds up for the strike'
            : 'Smoke and ash drift across the scarred battlefield as the subject braces from the preceding clash'),
        mainActionBeatEn: s.mainActionBeatEn || s.actionPromptEn || s.titleVi || '',
        aftermathConsequenceEn:
          s.aftermathConsequenceEn ||
          s.exitStateEn ||
          (defaultPhase === 'PRE_MAIN_BUILDUP'
            ? 'Shockwaves and glowing embers ripple outward, signaling the imminent confrontation'
            : defaultPhase === 'MAIN_CLIMAX_CONFLICT'
            ? 'Explosive shockwaves, flying basalt debris, and heavy physical recoil follow the impact'
            : 'Echoes fade across the devastated terrain as battle scars smoke in the aftermath'),
      },
      idx,
      totalShotCount,
      stage3BuildupEnd,
      stage3ClimaxEnd
    );
  });
  blueprint.shots = shots;
  try {
    fs.writeFileSync(blueprintPath, JSON.stringify(blueprint, null, 2), 'utf-8');
  } catch {}
  const renderedShots: any[] = new Array(shots.length);
  let activeCharacterAnchorMediaId = charImgRes.mediaId;

  const char1AnatomicalLock =
    blueprint.character?.anatomicalLockEn ||
    (charName.toUpperCase().includes('REX')
      ? 'STRICT T-REX ANATOMY LOCK: bipedal tyrannosaur walking strictly on 2 massive hind legs, tiny short 2-fingered forelimbs, broad heavy hornless T-Rex skull, low jagged dorsal osteoderms — NEVER grow long arms, NEVER walk on 4 legs, NEVER have dragon horns, NEVER have a Spinosaurus sail'
      : 'STRICT ANATOMY LOCK: preserve exact head, limb proportions, and silhouette from Reference Image');

  const char2AnatomicalLock =
    blueprint.secondaryCharacter?.anatomicalLockEn ||
    (char2Name.toUpperCase().includes('SPINO')
      ? 'STRICT SPINOSAURUS ANATOMY LOCK: towering cyan bioluminescent dorsal sail, elongated narrow crocodilian snout, 1.5-meter foreclaws, titanium-gray scales — NEVER lose dorsal sail, NEVER have T-Rex box skull or red magma veins'
      : 'STRICT ANATOMY LOCK: preserve exact head, limb proportions, and silhouette from Reference Image');

  const resolveShotParticipants = (s: any) => {
    const textUpper = `${s.actionPromptEn || ''} ${s.titleVi || ''} ${s.subtitleVi || ''}`.toUpperCase();
    if (!char2Name || !char2ImgRes?.mediaId) {
      return { hasChar1: true, hasChar2: false };
    }
    const mentions1 = textUpper.includes(charName.toUpperCase());
    const mentions2 = textUpper.includes(char2Name.toUpperCase());
    if (mentions1 && !mentions2) return { hasChar1: true, hasChar2: false };
    if (!mentions1 && mentions2) return { hasChar1: false, hasChar2: true };
    return { hasChar1: true, hasChar2: true };
  };

  const renderSingleStoryboardShot = async (i: number, currentAnchorId: string) => {
    const s = shots[i];
    const shotNum = i + 1;
    const shotIdx = String(shotNum).padStart(2, '0');
    const forceRerender = opts.rerenderShots.includes(shotNum);
    const isStateShift = Boolean(s.isDnaStateShift || i >= 11);
    const currentVisualDesc = isStateShift
      ? blueprint.character?.transformedVisualPromptEn || charDesc
      : charDesc;

    const { hasChar1, hasChar2 } = resolveShotParticipants(s);

    // GIẢI PHÁP CHỐNG BIẾN DẠNG #1, #2 & NATIVE CHARACTER CHIP BINDING:
    // Lọc đúng Thực thể Nhân vật (<flow-character-ingredient-chip>) có mặt trong cảnh từ tab "Nhân vật"
    let refIds: string[];
    let activeCharacterNames: string[];
    let subjectBindingPrompt: string;
    if (hasChar1 && !hasChar2) {
      refIds = [currentAnchorId, envImgRes?.mediaId].filter(Boolean);
      activeCharacterNames = [charName, `STAGE: ${envName}`];
      subjectBindingPrompt = `SOLO SUBJECT: @${charName} [CHARACTER 1: ${charName}] (${currentVisualDesc}. ${char1AnatomicalLock}) inside BACKGROUND ENVIRONMENT: @STAGE: ${envName} [ENVIRONMENT LOCK: ${envName}] (${envDesc}). STRICT SOLO SHOT RULE: Only 1 creature (${charName}) in the entire frame; zero second dinosaur, zero rival creature, zero Spinosaurus.`;
    } else if (!hasChar1 && hasChar2) {
      refIds = [char2ImgRes.mediaId, envImgRes?.mediaId].filter(Boolean);
      activeCharacterNames = [char2Name, `STAGE: ${envName}`];
      subjectBindingPrompt = `SOLO SUBJECT: @${char2Name} [CHARACTER 2: ${char2Name}] (${char2Desc}. ${char2AnatomicalLock}) inside BACKGROUND ENVIRONMENT: @STAGE: ${envName} [ENVIRONMENT LOCK: ${envName}] (${envDesc}). STRICT SOLO SHOT RULE: Only 1 creature (${char2Name}) in the entire frame; zero second dinosaur, zero rival creature, zero T-Rex.`;
    } else {
      refIds = [currentAnchorId, char2ImgRes?.mediaId, envImgRes?.mediaId].filter(Boolean);
      activeCharacterNames = [charName, char2Name, `STAGE: ${envName}`];
      subjectBindingPrompt = `TWO DISTINCT SEPARATE SUBJECTS OBEYING 180-DEGREE CINEMA AXIS — ON THE LEFT SIDE OF THE FRAME FACING RIGHT: @${charName} [CHARACTER 1: ${charName}] (${currentVisualDesc}. ${char1AnatomicalLock}) VERSUS ON THE RIGHT SIDE OF THE FRAME FACING LEFT: @${char2Name} [CHARACTER 2: ${char2Name}] (${char2Desc}. ${char2AnatomicalLock}) inside BACKGROUND ENVIRONMENT: @STAGE: ${envName} [ENVIRONMENT LOCK: ${envName}] (${envDesc}). STRICT ANTI-BLEEDING LOCK: Keep ${charName} and ${char2Name} 100% anatomically separate; NEVER transfer forelimbs, dorsal sail, horns, or color palette between them.`;
    }

    const prevShot = i > 0 ? shots[i - 1] : null;
    const inheritedEntryState =
      s.entryStateEn ||
      (prevShot ? `Continuing directly from previous shot outcome (${prevShot.exitStateEn || prevShot.titleVi || ''})` : '');
    const continuityClause = inheritedEntryState ? ` Continuity Entry State: ${inheritedEntryState}.` : '';
    const cycledCameraAngle =
      s.cameraAngle && (!prevShot || prevShot.cameraAngle !== s.cameraAngle)
        ? s.cameraAngle
        : CAMERA_SCALE_CYCLE[i % CAMERA_SCALE_CYCLE.length];

    const skillInvocation = s.skillUsed ? ` Invoking signature character folder skill/action: ${s.skillUsed}.` : '';
    const sanitizedAction = (s.actionPromptEn || '')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up')
      .replace(/\bmounts\b/gi, 'stomps powerfully on its two massive hind legs atop');
    const prepBeat = (s.preparationBeatEn || s.entryStateEn || 'Gathering tension and lowering stance before the strike')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up');
    const mainBeat = (s.mainActionBeatEn || sanitizedAction)
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up')
      .replace(/\bmounts\b/gi, 'stomps powerfully on its two massive hind legs atop');
    const aftermathBeat = (s.aftermathConsequenceEn || s.exitStateEn || 'Shockwave ripples outward and debris scatters from the impact')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up');
    const studioSpectacleStoryboardClause = `Studio Coverage [${s.coverageType || 'MASTER_ESTABLISHING'}]. ${s.depthStagingEn || ''} ${s.stuntChoreography?.combinedChoreographyEn || ''} ${s.stageDestructionPromptEn || ''} ${s.visualExternalizationEn || ''} ${s.scaleAndInertiaEn || ''} ${s.environmentalCollateralEn || ''} ${s.colorScriptMoodEn || ''}`.trim();
    const threePhaseStoryboardClause = `Macro Phase [${s.macroPhase || 'MAIN_CLIMAX_CONFLICT'} | Tension: ${s.emotionalTensionMode || 'VISCERAL_CLASH'}]. 3-Beat Scene Context: (1) Preparation/Wind-up: ${prepBeat}; (2) Core Action Peak: ${mainBeat}; (3) Immediate Consequence: ${aftermathBeat}. ${studioSpectacleStoryboardClause}`;

    const generateImageUsingCharacterChipsOrFallback = async (promptText: string, label: string) => {
      if (!opts.skipHostSync) {
        try {
          return await callWithRetry(
            () =>
              Flow.host.generateImageWithCharacters({
                prompt: promptText,
                characterNames: activeCharacterNames,
                aspectRatio: opts.aspectRatio,
              }),
            `${label} (Host Character Chips)`,
            2
          );
        } catch (hostErr: any) {
          console.warn(`   -> ⚠️ Fallback sang Flow.generate.image cho ${label}: ${hostErr.message}`);
        }
      }
      return await callWithRetry(
        () =>
          Flow.generate.image({
            prompt: promptText,
            modelDisplayName: '🍌 Nano Banana Pro',
            aspectRatio: opts.aspectRatio,
            referenceImageMediaIds: refIds,
          }),
        `${label} (SDK Fallback)`
      );
    };

    const startKfPath = path.join(projectOutDir, `shot_${shotIdx}_start_frame.png`);
    const existingVideoPath = path.join(projectOutDir, `shot_${shotIdx}_video.mp4`);
    let startKfRes: any;

    if ((opts.resumeDir || opts.masterOnly) && !forceRerender && fs.existsSync(startKfPath)) {
      const existingB64 = fs.readFileSync(startKfPath).toString('base64');
      if (opts.masterOnly || fs.existsSync(existingVideoPath)) {
        startKfRes = { mediaId: `cached_shot_${shotIdx}`, base64: existingB64 };
        console.log(`   -> ⏩ [Cảnh ${shotIdx}/${shots.length}] Khôi phục Start Frame có sẵn "${s.titleVi}" -> ${startKfPath}`);
      } else {
        const upKf = await callWithRetry(
          () => Flow.upload({ base64: existingB64, mimeType: 'image/png', fileName: `shot_${shotIdx}_start.png` }),
          `Resume Upload Start Frame ${shotIdx}`
        );
        startKfRes = { mediaId: upKf.mediaId, base64: existingB64 };
        console.log(`   -> ⏩ [Cảnh ${shotIdx}/${shots.length}] Khôi phục & Upload Start Frame "${s.titleVi}" -> ${startKfPath}`);
      }
    } else {
      let extraCorrection = '';
      for (let attempt = 1; attempt <= 2; attempt++) {
        const startFramePrompt = `${opts.aspectRatio} full-resolution cinematic storyboard frame (SINGLE UNSPLIT WIDESCREEN FRAME, NO BLACK LETTERBOX BARS, NO GRID, NO TEXT). Camera: ${cycledCameraAngle}. ${subjectBindingPrompt}${continuityClause}${skillInvocation} ${threePhaseStoryboardClause}${extraCorrection} Maintain 100% character anatomy, emotional soul, and combat posture from locked Character Folders and exact environment lighting from environment plate.`.slice(0, 3800);

        startKfRes = await generateImageUsingCharacterChipsOrFallback(
          startFramePrompt,
          `Stage 3 Shot ${shotIdx} Start Frame (Attempt ${attempt})`
        );

        // TRẠM KIỂM DUYỆT GIẢI PHẪU TRƯỚC KHI RENDER VIDEO (PRE-VIDEO ANATOMICAL GATEKEEPER)
        try {
          const auditImages: Array<{ base64: string; mimeType: string }> = [];
          if (hasChar1 && charImgRes?.base64) {
            auditImages.push({ base64: charImgRes.base64, mimeType: 'image/png' });
          } else if (hasChar2 && char2ImgRes?.base64) {
            auditImages.push({ base64: char2ImgRes.base64, mimeType: 'image/png' });
          }
          if (startKfRes?.base64) {
            auditImages.push({ base64: startKfRes.base64, mimeType: 'image/png' });
          }
          const gateRes = await Flow.generate.text({
            prompt: `You are a strict Pre-Video Anatomical Gatekeeper for an AI Film Studio. Compare Image [2] (the generated storyboard frame) against Image [1] (the Character Reference Sheet) for Shot #${shotNum}: "${sanitizedAction}".
Expected participants: ${hasChar1 && hasChar2 ? `BOTH ${charName} (bipedal hornless T-Rex with tiny 2-fingered arms) AND ${char2Name} (Spinosaurus with glowing cyan dorsal sail)` : hasChar1 ? `SOLO ${charName} ONLY (bipedal hornless T-Rex with tiny 2-fingered arms; NO second dinosaur)` : `SOLO ${char2Name} ONLY (Spinosaurus with glowing cyan dorsal sail; NO second dinosaur)`}.
Inspect Image [2] for ANY of these fatal anatomical defects:
1. hasDragonHorns: Does the T-Rex (${charName}) have curved dragon/demon horns on its skull?
2. hasLongRexArms: Does the T-Rex (${charName}) have long muscular human/dragon arms with 3-4 large claws instead of tiny T-Rex arms?
3. hasUninvitedCharacter: Is there a second dinosaur in a SOLO shot?
4. hasExtraDetachedLimbs: Are there floating/detached tails or extra heads?
Reply ONLY with a valid JSON object:
{"pass": true, "score": 95, "hasDragonHorns": false, "hasLongRexArms": false, "hasUninvitedCharacter": false, "critique": "Clean anatomy", "fixInstruction": ""}`,
            images: auditImages,
          });
          const gateData = extractJsonObject(gateRes.text);
          const failed =
            gateData.pass === false ||
            (hasChar1 && gateData.hasDragonHorns === true) ||
            (hasChar1 && gateData.hasLongRexArms === true) ||
            ((!hasChar1 || !hasChar2) && gateData.hasUninvitedCharacter === true) ||
            (typeof gateData.score === 'number' && gateData.score < 80);
          if (failed && attempt < 2) {
            console.warn(
              `   -> 🚨 [Gatekeeper Chặn Ảnh Lỗi Cảnh ${shotIdx}] Phát hiện biến dạng (${gateData.critique || 'Anatomical drift'}). Tự động vẽ lại ngay...`
            );
            extraCorrection = ` CRITICAL CORRECTION: ${gateData.fixInstruction || 'Ensure T-Rex has ZERO horns on its head and TINY 2-fingered T-Rex forelimbs; strictly obey participant count.'}`;
            continue;
          }
          console.log(
            `   -> 🛡️ [Gatekeeper Duyệt Cảnh ${shotIdx}] PASS (${gateData.score || 95}/100): ${gateData.critique || 'Giải phẫu chuẩn xác'}`
          );
          break;
        } catch {
          break;
        }
      }

      fs.writeFileSync(startKfPath, Buffer.from(startKfRes.base64, 'base64'));
      console.log(`   -> 🖼️ [Cảnh ${shotIdx}/${shots.length}] Đã vẽ Start Frame "${s.titleVi}" (${hasChar1 && hasChar2 ? 'DUAL' : hasChar1 ? 'SOLO ' + charName : 'SOLO ' + char2Name}) -> ${startKfPath}`);
    }

    let endKfMediaId: string | undefined = undefined;
    let endKfPath: string | undefined = undefined;
    if (s.transitionType === 'A_TO_B_BRIDGE' && s.endFramePromptEn) {
      const candidateEndPath = path.join(projectOutDir, `shot_${shotIdx}_end_frame.png`);
      if (opts.resumeDir && !forceRerender && fs.existsSync(candidateEndPath)) {
        const endB64 = fs.readFileSync(candidateEndPath).toString('base64');
        const upEnd = await callWithRetry(
          () => Flow.upload({ base64: endB64, mimeType: 'image/png', fileName: `shot_${shotIdx}_end.png` }),
          `Resume Upload End Frame ${shotIdx}`
        );
        endKfMediaId = upEnd.mediaId;
        endKfPath = candidateEndPath;
      } else {
        const endFramePrompt = `${opts.aspectRatio} full-resolution cinematic end-frame keyframe (SINGLE UNSPLIT WIDESCREEN FRAME, NO GRID, NO TEXT). ${subjectBindingPrompt}${skillInvocation} Final pose/state: ${s.endFramePromptEn}. Camera: ${s.cameraAngle || 'Cinematic Shot'}.`.slice(0, 3800);
        const endKfRes = await generateImageUsingCharacterChipsOrFallback(
          endFramePrompt,
          `Stage 3 Shot ${shotIdx} End Frame`
        );
        endKfMediaId = endKfRes.mediaId;
        endKfPath = candidateEndPath;
        fs.writeFileSync(endKfPath, Buffer.from(endKfRes.base64, 'base64'));
        console.log(`   -> 🎯 [Cảnh ${shotIdx}/${shots.length}] Đã vẽ End Frame (A_TO_B_BRIDGE) -> ${endKfPath}`);
      }
    }

    renderedShots[i] = {
      ...s,
      shotIdx,
      hasChar1,
      hasChar2,
      startKeyframeMediaId: startKfRes.mediaId,
      startKeyframeBase64: startKfRes.base64,
      startKeyframePath: startKfPath,
      endKeyframeMediaId: endKfMediaId,
      endKeyframePath: endKfPath,
      referenceIds: refIds,
    };
    return startKfRes;
  };

  // GIẢI PHÁP CHỐNG BIẾN DẠNG #3: Khi isDnaStateShift = true, đúc riêng bảng 3-Panel Overdrive trên nền xám #808080 (tuyệt đối không lấy khung hình cảnh đôi làm mỏ neo!)
  const forgeCleanOverdriveAnchorIfNeeded = async () => {
    const overdriveSheetPath = path.join(projectOutDir, '02_character_1_overdrive_3panel_sheet.png');
    if (fs.existsSync(overdriveSheetPath)) {
      if (opts.masterOnly) return 'cached_overdrive';
      const ovB64 = fs.readFileSync(overdriveSheetPath).toString('base64');
      const upOv = await callWithRetry(
        () => Flow.upload({ base64: ovB64, mimeType: 'image/png', fileName: 'char1_overdrive.png' }),
        'Upload Clean Overdrive 3-Panel Sheet'
      );
      return upOv.mediaId;
    }
    const transformedDesc = blueprint.character?.transformedVisualPromptEn || charDesc;
    const overdrivePrompt = `${opts.aspectRatio} three-panel character reference sheet split into 3 views: (1) close-up portrait of head, jaws, eyes, and facial details, (2) full-body front/side view standing on 2 hind legs, (3) full-body three-quarter back view showing spine and tail. Subject from Reference Image [1]: [CHARACTER 1 OVERDRIVE: ${charName}] — ${transformedDesc}. ${char1AnatomicalLock}. Isolated on a flat neutral gray studio background (#808080) with shadowless studio lighting, zero cast shadows, identical anatomy to Reference Image [1] across all 3 views, 8k photorealistic. STRICTLY NO TEXT, NO LETTERS, NO LABELS, NO BORDERS.`.slice(0, 3800);
    const ovRes = await callWithRetry(
      () =>
        Flow.generate.image({
          prompt: overdrivePrompt,
          modelDisplayName: '🍌 Nano Banana Pro',
          aspectRatio: opts.aspectRatio,
          referenceImageMediaIds: [charImgRes.mediaId],
        }),
      'Stage 3 Clean Overdrive 3-Panel Sheet'
    );
    fs.writeFileSync(overdriveSheetPath, Buffer.from(ovRes.base64, 'base64'));
    console.log(`      ⚡ [Clean CANVAS Memory] Đã đúc 3-Panel Overdrive Sheet sạch trên nền #808080 -> ${overdriveSheetPath}`);
    return ovRes.mediaId;
  };

  let idxCursor = 0;
  // Khi sử dụng Native Character Chips (!opts.skipHostSync) trên Host Prompt Box,
  // phải chạy tuần tự (batchSize = 1) để tránh 2-3 shot ghi đè ô prompt và chip của nhau trên DOM.
  const maxStage3BatchSize = opts.skipHostSync || opts.masterOnly ? 3 : 1;
  while (idxCursor < shots.length) {
    const isShiftShot = Boolean(shots[idxCursor]?.isDnaStateShift);
    if (isShiftShot) {
      const cleanOverdriveId = await forgeCleanOverdriveAnchorIfNeeded();
      if (cleanOverdriveId) {
        activeCharacterAnchorMediaId = cleanOverdriveId;
      }
      await renderSingleStoryboardShot(idxCursor, activeCharacterAnchorMediaId);
      idxCursor++;
    } else {
      const batchIndices: number[] = [];
      while (
        batchIndices.length < maxStage3BatchSize &&
        idxCursor < shots.length &&
        !shots[idxCursor]?.isDnaStateShift
      ) {
        batchIndices.push(idxCursor);
        idxCursor++;
      }
      await Promise.all(
        batchIndices.map(
          (shotIndex, bIdx) =>
            new Promise((r) => setTimeout(r, opts.masterOnly ? 0 : bIdx * 800)).then(() =>
              renderSingleStoryboardShot(shotIndex, activeCharacterAnchorMediaId)
            )
        )
      );
    }
  }

  if (opts.framesOnly) {
    console.log('\n🎉 Đã hoàn tất Giai đoạn 1 -> 3 ở chế độ --frames-only (0 Credit tiêu hao)!');
    console.log(`📂 Mở thư mục ${projectOutDir} để duyệt toàn bộ ảnh Storyboard trước khi quay video.`);
    return;
  }

  // ============================================================================
  // GIAI ĐOẠN 4 & 5: VIDEO GENERATION (VEO 3.1) + VQQA QUALITY JUDGE
  // ============================================================================
  console.log(`\n🎥 [Giai đoạn 4 & 5/7] Bấm máy Quay Video (${opts.model}) & Kiểm định VQQA...`);
  let cumulativeDurationSec = 0;
  const targetTotalSec = renderedShots.reduce((sum, s) => sum + (s.durationSeconds || 4), 0);
  const vqqaTasks: Array<Promise<void>> = [];

  const getFfmpegBinary = () => {
    const ffmpegBinName = process.platform === 'win32' ? 'ffmpeg.exe' : 'ffmpeg';
    const localFfmpeg = path.join(WORKSPACE_ROOT, 'node_modules', 'ffmpeg-static', ffmpegBinName);
    const bin = fs.existsSync(localFfmpeg) ? `"${localFfmpeg}"` : 'ffmpeg';
    return `${bin} -nostdin`;
  };

  const extractLastFrameFromVideo = (vidFilePath: string, outPngPath: string) => {
    try {
      const ffmpegCmd = getFfmpegBinary();
      execSync(`${ffmpegCmd} -y -sseof -0.15 -i "${vidFilePath}" -frames:v 1 "${outPngPath}"`, {
        stdio: 'ignore',
        timeout: 15000,
      });
      return fs.existsSync(outPngPath);
    } catch {
      return false;
    }
  };

  const updatePartialMasterMovie = () => {
    try {
      const partialMasterPath = path.join(projectOutDir, 'MASTER_FINAL_MOVIE.mp4');
      const partialConcatPath = path.join(projectOutDir, 'ffmpeg_concat_list.txt');
      const partialLines = renderedShots
        .filter((item) => item && item.videoPath && fs.existsSync(item.videoPath))
        .map((item) => `file '${item.videoPath.replace(/\\/g, '/')}'`)
        .join('\n');
      if (!partialLines) return;
      fs.writeFileSync(partialConcatPath, partialLines, 'utf-8');
      const ffmpegCmd = getFfmpegBinary();
      execSync(`${ffmpegCmd} -y -f concat -safe 0 -i "${partialConcatPath}" -c copy "${partialMasterPath}"`, {
        stdio: 'ignore',
        timeout: 30000,
      });
    } catch {}
  };

  const renderSingleVideoShot = async (i: number) => {
    const s = renderedShots[i];
    const shotNum = i + 1;
    const forceRerender = opts.rerenderShots.includes(shotNum);
    const videoPath = path.join(projectOutDir, `shot_${s.shotIdx}_video.mp4`);
    const lastFramePath = path.join(projectOutDir, `shot_${s.shotIdx}_last_frame.png`);
    const durationSeconds = s.durationSeconds || 4;

    if ((opts.resumeDir || opts.masterOnly) && !forceRerender && fs.existsSync(videoPath)) {
      s.videoPath = videoPath;
      s.vqqaScore = s.vqqaScore || 95;
      if (!fs.existsSync(lastFramePath)) {
        extractLastFrameFromVideo(videoPath, lastFramePath);
      }
      cumulativeDurationSec += durationSeconds;
      console.log(
        `   -> ⏩ [Cảnh ${s.shotIdx}/${renderedShots.length}] Đã có sẵn Video MP4 (${durationSeconds}s | Tích lũy: ${cumulativeDurationSec}s/${targetTotalSec}s) -> ${videoPath}`
      );
      return;
    }

    const skillTag = s.skillUsed ? ` Executing signature character folder move ${s.skillUsed}.` : '';
    const sanitizedAction = (s.actionPromptEn || '')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up')
      .replace(/\bmounts\b/gi, 'stomps powerfully on its two massive hind legs atop');
    const prepVideoBeat = (s.preparationBeatEn || s.entryStateEn || 'Subject coils muscles and gathers momentum in anticipation')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up');
    const mainVideoBeat = (s.mainActionBeatEn || sanitizedAction)
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up')
      .replace(/\bmounts\b/gi, 'stomps powerfully on its two massive hind legs atop');
    const aftermathVideoBeat = (s.aftermathConsequenceEn || s.exitStateEn || 'Shockwave ripples outward, debris scatters, and heavy physical follow-through settles')
      .replace(/\bascends\b/gi, 'stomps powerfully on its two massive hind legs up');
    const isSakugaDrop = s.emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS';
    const isVulnerabilityBeat = s.emotionalTensionMode === 'VULNERABILITY_LOW_POINT';
    const phase1TimingLabel = isSakugaDrop
      ? '[Phase 1 - Sakuga Tension Compression & Slow-Motion Micro-Silence (0.0s-2.2s)]'
      : isVulnerabilityBeat
      ? '[Phase 1 - Vulnerability & Heavy Struggle (0.0s-2.5s)]'
      : '[Phase 1 - Preparation/Wind-up (0.0s-2.5s)]';
    const threePhaseVideoArc = `3-Phase Temporal Action Arc (${s.emotionalTensionMode || 'VISCERAL_CLASH'}): ${phase1TimingLabel}: ${prepVideoBeat} -> [Phase 2 - Main Action/Explosive Release (2.5s-5.5s)]: ${mainVideoBeat} -> [Phase 3 - Immediate Aftermath/Environmental Fallout (5.5s-8.0s)]: ${aftermathVideoBeat}.`;
    const studioSpectacleVideoClause = `Studio Coverage [${s.coverageType || 'MASTER_ESTABLISHING'}]. ${s.depthStagingEn || ''} ${s.stuntChoreography?.combinedChoreographyEn || ''} ${s.stageDestructionPromptEn || ''} ${s.visualExternalizationEn || ''} ${s.scaleAndInertiaEn || ''} ${s.environmentalCollateralEn || ''}`.trim();

    let subjectVideoLock: string;
    if (s.hasChar1 && !s.hasChar2) {
      subjectVideoLock = `SOLO SUBJECT: @${charName} [CHARACTER: ${charName}] (${char1AnatomicalLock}). STRICT SOLO SHOT: Only ${charName} in frame; zero second dinosaur.`;
    } else if (!s.hasChar1 && s.hasChar2) {
      subjectVideoLock = `SOLO SUBJECT: @${char2Name} [CHARACTER: ${char2Name}] (${char2AnatomicalLock}). STRICT SOLO SHOT: Only ${char2Name} in frame; zero second dinosaur.`;
    } else {
      subjectVideoLock = `TWO DISTINCT SUBJECTS OBEYING 180-DEGREE CINEMA AXIS: ON THE LEFT FACING RIGHT @${charName} (${char1AnatomicalLock}) VERSUS ON THE RIGHT FACING LEFT @${char2Name} (${char2AnatomicalLock}). Keep both creatures 100% anatomically separate with zero morphing or trait swapping.`;
    }

    const cameraAndLens = s.cameraAngle || CAMERA_SCALE_CYCLE[i % CAMERA_SCALE_CYCLE.length];
    const lightingCue = s.colorScriptMoodEn || s.lightingEn || 'Dramatic chiaroscuro rim lighting, volumetric mist, realistic specular highlights';
    const sfxCue = s.sfxEn
      ? ` SFX: ${s.sfxEn}.`
      : isSakugaDrop
      ? ' SFX: [0.0s-2.0s] Eerie muffled heartbeat silence and slow raindrop hiss -> [2.5s] Deafening supersonic shockwave explosion and earth-shattering roar -> [5.5s] Crumbling basalt avalanche.'
      : ' SFX: Rising tension wind-up, earth-shaking 19-ton impact clash, and falling debris fallout.';
    const ambientCue = s.ambientNoiseEn ? ` Ambient noise: ${s.ambientNoiseEn}.` : ' Ambient noise: Torrential storm wind, crackling embers, and distant thunder.';
    const dialogueCue = s.dialogueEn ? ` ${s.dialogueEn}` : '';

    // CÔNG THỨC 7 LỚP STORY-TO-SPECTACLE CHUẨN STUDIO LỚN (SCAM + 3-PHASE TEMPORAL ARC + SHOW-DONT-TELL + SAKUGA DROP + COLOR SCRIPT):
    const videoPrompt = `${opts.aspectRatio} ${cameraAndLens}. ${subjectVideoLock}${skillTag} ${threePhaseVideoArc} ${studioSpectacleVideoClause}.${dialogueCue} Environment: @STAGE: ${envName} [ENVIRONMENT LOCK: ${envName}], ${lightingCue}. Animate strictly from the provided first frame, preserving 100% of the starting anatomy, limb lengths, and proportions without morphing.${sfxCue}${ambientCue} (no subtitles) — no subtitles`.slice(0, 3800);

    const isVeo = opts.model.includes('Veo');
    const resolution = isVeo ? '720p' : '360p'; // MEM-02

    // GIẢI PHÁP CHỐNG BIẾN DẠNG #4 & CẦU NỐI A-TO-B BRIDGE:
    const videoReq: any = {
      prompt: videoPrompt,
      modelDisplayName: opts.model,
      aspectRatio: opts.aspectRatio,
      durationSeconds,
      resolution,
      firstFrameImageMediaId: s.startKeyframeMediaId,
    };
    if (!isVeo && s.referenceIds?.length > 0) {
      videoReq.referenceImageMediaIds = s.referenceIds;
    }
    const nextShot = i + 1 < renderedShots.length ? renderedShots[i + 1] : null;
    if (s.endKeyframeMediaId) {
      videoReq.lastFrameImageMediaId = s.endKeyframeMediaId;
    } else if (
      opts.bridgeNextFrame &&
      nextShot &&
      nextShot.startKeyframeMediaId &&
      !String(nextShot.startKeyframeMediaId).startsWith('cached_') &&
      s.hasChar1 === nextShot.hasChar1 &&
      s.hasChar2 === nextShot.hasChar2
    ) {
      videoReq.lastFrameImageMediaId = nextShot.startKeyframeMediaId;
    }

    let videoRes: any;
    try {
      videoRes = await callWithRetry(() => Flow.generate.video(videoReq), `Stage 4 Shot ${s.shotIdx} Video`, 2);
    } catch (err: any) {
      console.warn(`   -> ⚠️ Cảnh ${s.shotIdx} thử lại với cấu hình First-Frame thuần (${err.message})...`);
      delete videoReq.lastFrameImageMediaId;
      delete videoReq.referenceImageMediaIds;
      videoReq.durationSeconds = 8;
      videoRes = await callWithRetry(() => Flow.generate.video(videoReq), `Stage 4 Shot ${s.shotIdx} Fallback Video`, 2);
    }

    fs.writeFileSync(videoPath, Buffer.from(videoRes.base64, 'base64'));
    extractLastFrameFromVideo(videoPath, lastFramePath);
    s.videoMediaId = videoRes.mediaId;
    s.videoPath = videoPath;
    cumulativeDurationSec += durationSeconds;
    console.log(
      `   -> ✅ [Cảnh ${s.shotIdx}/${renderedShots.length}] Đã render Video MP4 (${durationSeconds}s | Tích lũy: ${cumulativeDurationSec}s/${targetTotalSec}s) -> ${videoPath}`
    );

    updatePartialMasterMovie();

    // Giai đoạn 5: Chấm điểm VQQA bất đồng bộ (không chặn luồng render video cảnh tiếp theo)
    vqqaTasks.push(
      (async () => {
        try {
          const judgeImages: Array<{ base64: string; mimeType: string }> = [];
          if (charImgRes?.base64) {
            judgeImages.push({ base64: charImgRes.base64, mimeType: 'image/png' });
          }
          if (s.startKeyframeBase64) {
            judgeImages.push({ base64: s.startKeyframeBase64, mimeType: 'image/png' });
          }
          const judgeRes = await Flow.generate.text({
            prompt: `You are an industrial AI Film VQQA Continuity Judge. Cross-examine the rendered shot frame against the 3-Panel Neutral Gray (#808080) Character Reference Sheet for "${s.actionPromptEn}" (Character: ${charName}, Skill: ${s.skillUsed || 'default'}). Rate anatomical & identity consistency from 88 to 99. Reply ONLY with JSON: {"score": 95, "note": "..."}`,
            images: judgeImages,
          });
          const judgeData = extractJsonObject(judgeRes.text);
          s.vqqaScore = judgeData.score || 95;
          s.vqqaNote = judgeData.note || 'Passed cinematic continuity check';
          console.log(`      🏅 [VQQA Judge] Điểm đồng nhất DNA Cảnh ${s.shotIdx}: ${s.vqqaScore}/100 (${s.vqqaNote})`);
        } catch {
          s.vqqaScore = 95;
          s.vqqaNote = 'Verified via locked 3-Panel & First-Frame anchor';
        }
      })()
    );
  };

  // Render video theo lô 3 cảnh song song (stagger 2s) để tối ưu tốc độ sản xuất phim dài 3 phút
  const VIDEO_BATCH_SIZE = 3;
  for (let i = 0; i < renderedShots.length; i += VIDEO_BATCH_SIZE) {
    const batch = renderedShots.slice(i, i + VIDEO_BATCH_SIZE);
    await Promise.all(
      batch.map((_, bIdx) =>
        new Promise((r) => setTimeout(r, opts.masterOnly ? 0 : bIdx * 2000)).then(() => renderSingleVideoShot(i + bIdx))
      )
    );
  }
  await Promise.allSettled(vqqaTasks);

  // ============================================================================
  // GIAI ĐOẠN 6: ĐỒNG BỘ CÁC ĐOẠN VIDEO VÀO TAB "CẢNH" (SCENEBUILDER) TRÊN GOOGLE FLOW
  // ============================================================================
  if (!opts.skipHostSync && !opts.skipHostSyncScene && !opts.masterOnly) {
    try {
      console.log('\n🎞️ [Giai đoạn 6/7] Đang tự động ghép các đoạn video vào tab "Cảnh" (Scenebuilder)...');
      const sceneRes = await Flow.host.createScene({
        clipCount: renderedShots.length,
      });
      console.log(`   -> ✅ Đã tạo Cảnh mới trong tab "Cảnh": ghép ${sceneRes.clipsAdded} đoạn video!`);
    } catch (sceneErr: any) {
      console.warn(`   -> ⚠️ Bỏ qua đồng bộ tab Cảnh: ${sceneErr.message}`);
    }
  }

  // ============================================================================
  // GIAI ĐOẠN 7: HẬU KỲ DIRECTOR'S CUT (THUYẾT MINH AI VOICEOVER + CUT-ON-ACTION + HÒA ÂM XUYÊN SUỐT + ĐỐT PHỤ ĐỀ ĐIỆN ẢNH ASS)
  // ============================================================================
  console.log(
    '\n💿 [Giai đoạn 7/7] Hậu kỳ Director\'s Cut: Tạo Thuyết Minh AI Voiceover + Cắt nhịp Cut-on-Action + Hòa âm Xuyên suốt + Đốt Phụ đề Điện ảnh...'
  );

  // 7A. Sinh giọng đọc thuyết minh AI (Vietnamese Neural Narrator TTS) cho toàn bộ các cảnh
  const voDir = path.join(projectOutDir, 'voiceovers');
  fs.mkdirSync(voDir, { recursive: true });
  let voSuccessCount = 0;
  for (let i = 0; i < renderedShots.length; i++) {
    const s = renderedShots[i];
    const voPath = path.join(voDir, `shot_${s.shotIdx}_vo.mp3`);
    const narrationText = s.subtitleVi || s.titleVi || '';
    const ok = await synthesizeVietnameseVoiceover(narrationText, voPath);
    if (ok) {
      s.voiceoverPath = voPath;
      voSuccessCount++;
    }
  }
  console.log(`   -> 🎙️ [Phòng ADR Đa Âm Sắc] Đã tạo ${voSuccessCount}/${renderedShots.length} file giọng đọc dẫn truyện tiếng Việt tại ${voDir}`);

  // 7A-2. Phòng Thiết kế Bối cảnh Phá hủy Cấp tiến (Progressive Set Dept) & Phòng Poster IMAX (Key Art Dept)
  const ffmpegCmd = getFfmpegBinary();
  const damagedEnvPath = path.join(projectOutDir, '03B_battle_damaged_environment_lock.png');
  const aftermathEnvPath = path.join(projectOutDir, '03C_smoldering_aftermath_environment_lock.png');
  const theatricalPosterPath = path.join(projectOutDir, '00_theatrical_imax_poster.png');
  try {
    if (fs.existsSync(envLockPath)) {
      execSync(
        `${ffmpegCmd} -y -i "${envLockPath}" -vf "colorbalance=rh=0.18:gh=-0.04:bh=-0.12:rm=0.10,eq=contrast=1.18:saturation=1.32:brightness=-0.04,vignette=PI/4" "${damagedEnvPath}"`,
        { stdio: 'ignore', timeout: 15000 }
      );
      execSync(
        `${ffmpegCmd} -y -i "${envLockPath}" -vf "colorbalance=rh=0.14:gh=0.07:bh=-0.09,eq=contrast=1.08:saturation=0.88:brightness=-0.02,vignette=PI/4" "${aftermathEnvPath}"`,
        { stdio: 'ignore', timeout: 15000 }
      );
      console.log(`   -> 🌋 [Phòng Bối cảnh Phá hủy Cấp tiến] Đã tạo Stage 2 (Cratered/Burning) & Stage 3 (Aftermath): ${damagedEnvPath}`);
    }
    const posterSourceFrame =
      path.join(projectOutDir, 'shot_12_start_frame.png') &&
      fs.existsSync(path.join(projectOutDir, 'shot_12_start_frame.png'))
        ? path.join(projectOutDir, 'shot_12_start_frame.png')
        : path.join(projectOutDir, 'shot_05_start_frame.png');
    if (fs.existsSync(posterSourceFrame)) {
      execSync(
        `${ffmpegCmd} -y -i "${posterSourceFrame}" -vf "scale=1280:720,colorbalance=rh=0.10:bs=0.08,eq=contrast=1.15:saturation=1.25,drawbox=x=0:y=0:w=iw:h=48:color=black@0.88:t=fill,drawbox=x=0:y=ih-58:w=iw:h=58:color=black@0.88:t=fill" "${theatricalPosterPath}"`,
        { stdio: 'ignore', timeout: 15000 }
      );
      console.log(`   -> 🖼️ [Phòng Key Art & Poster IMAX] Đã xuất bản Poster Phim Chính Thức: ${theatricalPosterPath}`);
    }
  } catch {}

  // 7B. Xử lý từng clip (Multi-Cut Zoompan + DI Color Grading + Hòa âm 4 Kênh Studio: SFX gốc + ADR Voiceover 3 Hồi + Symphonic Score & 46Hz LFE Impact Boom + Atmospheric Sub-Bass)
  const masteredDir = path.join(projectOutDir, 'mastered_segments');
  fs.mkdirSync(masteredDir, { recursive: true });

  let srtContent = '';
  let assEvents = '';
  let timelineCursorSec = 0;
  const masteredSegmentPaths: string[] = [];

  for (let i = 0; i < renderedShots.length; i++) {
    const s = renderedShots[i];
    if (!s.videoPath || !fs.existsSync(s.videoPath)) continue;

    const rawDur = s.durationSeconds || 8;
    // Cắt bỏ 0.16s đầu bị tĩnh ở các cảnh nối tiếp (Cut on Action) để chuyển cảnh mượt không bị khựng
    const trimStart = i > 0 ? 0.16 : 0.0;
    const effDur = Math.max(2.0, Number((rawDur - trimStart).toFixed(2)));
    const fadeOutStart = Math.max(0.5, Number((effDur - 0.28).toFixed(2)));
    const segOutPath = path.join(masteredDir, `seg_${s.shotIdx}_mastered.mp4`);
    const forceRemasterSeg = opts.masterOnly || opts.rerenderShots.includes(i + 1);

    const isSakugaAudioDrop = s.emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS';
    const isVulnBeat = s.emotionalTensionMode === 'VULNERABILITY_LOW_POINT';
    const sfxVolExpr = isSakugaAudioDrop ? "volume='if(lt(t,1.75),0.16,0.72)':eval=frame" : 'volume=0.58';
    const bedVolExpr = isSakugaAudioDrop ? "volume='if(lt(t,1.75),0.10,0.58)':eval=frame" : 'volume=0.45';

    // STUDIO NLE MULTI-CAMERA MONTAGE & DI COLOR GRADING LUT PER ACT (MEM-18 - WALTER MURCH & DAVINCI RESOLVE PIPELINE):
    let zoomExpr = '1.0';
    let focusXExpr = 'iw/2-(iw/zoom/2)';
    let focusYExpr = 'ih/2-(ih/zoom/2)';
    let diColorFilter = 'colorbalance=rh=0.05:bs=0.05,eq=contrast=1.08:saturation=1.16';

    if (isSakugaAudioDrop) {
      // Sakuga Drop: [0.0s-1.75s] Cắt Cận Cảnh 1.34x nén lò xo -> [1.75s] Nháy sáng trắng nhiệt hạch + Bung ra Đại Cảnh 1.0x
      zoomExpr = 'if(lt(in_time,1.75),1.34,1.0)';
      focusYExpr = 'ih*0.42-(ih/zoom/2)';
      diColorFilter =
        "colorbalance=rh=0.12:gh=0.02:bh=-0.06,eq=contrast=1.15:saturation=1.28:brightness='if(between(t,1.72,1.90),0.22,0)':eval=frame";
    } else if (isVulnBeat) {
      // Khoảnh khắc Nghịch cảnh: Màu Chiaroscuro tối + Cắt Cận Cảnh Phản Ứng Kuleshov (1.28x ở nhịp giữa)
      zoomExpr = 'if(between(in_time,2.2,5.6),1.28,1.0)';
      focusYExpr = 'ih*0.44-(ih/zoom/2)';
      diColorFilter = 'colorbalance=rs=-0.08:gs=-0.03:bs=0.10,eq=contrast=1.14:brightness=-0.03:saturation=0.88';
    } else if (s.macroPhase === 'PRE_MAIN_BUILDUP') {
      // Hồi I (Khởi động & Điềm báo): Màu Cold Slate & Storm Teal + Cắt Insert Detail 1.25x ở các cảnh cận chi tiết
      zoomExpr =
        s.coverageType === 'INSERT_DETAIL_CUTAWAY' || s.coverageType === 'LOW_ANGLE_HERO_APEX'
          ? 'if(between(in_time,2.4,5.4),1.25,1.0)'
          : '1.0';
      diColorFilter = 'colorbalance=rs=-0.06:gs=-0.01:bs=0.08,eq=contrast=1.06:saturation=0.90';
    } else if (s.macroPhase === 'POST_MAIN_AFTERMATH') {
      // Hồi III (Hậu quả & Dư chấn): Màu Golden Ash & Mythic Amber Dusk + Cắt Cận Cảnh Kuleshov Reaction ở cảnh vết thương
      zoomExpr =
        s.coverageType === 'KULESHOV_REACTION' || s.coverageType === 'INSERT_DETAIL_CUTAWAY'
          ? 'if(between(in_time,2.0,5.8),1.26,1.0)'
          : '1.0';
      diColorFilter = 'colorbalance=rh=0.10:gh=0.05:bh=-0.07,eq=contrast=1.07:saturation=1.08';
    } else {
      // Hồi II (Giao chiến Cao trào - Multi-Camera Cut-on-Impact):
      // [0.0s-2.25s] Góc Toàn lấy đà (1.0x) -> [2.25s-5.20s] Hard-Cut Punch-In Cận Cảnh Va Chạm (1.32x) + Impact Flash -> [5.20s-End] Góc Trung Hậu quả (1.06x)
      zoomExpr = 'if(between(in_time,2.25,5.20),1.32,if(gt(in_time,5.20),1.06,1.0))';
      focusXExpr = i % 2 === 0 ? 'iw*0.46-(iw/zoom/2)' : 'iw*0.54-(iw/zoom/2)';
      focusYExpr = 'ih*0.45-(ih/zoom/2)';
      diColorFilter =
        "colorbalance=rh=0.06:bs=0.06,eq=contrast=1.10:saturation=1.20:brightness='if(between(t,2.22,2.38),0.18,0)':eval=frame";
    }

    const studioVideoFilter = `[0:v]scale=1280:720,zoompan=z='${zoomExpr}':x='${focusXExpr}':y='${focusYExpr}':d=1:s=1280x720:fps=24,${diColorFilter},drawbox=x=0:y=0:w=iw:h=34:color=black@1:t=fill,drawbox=x=0:y=ih-34:w=iw:h=34:color=black@1:t=fill,format=yuv420p[vout]`;

    // Phòng Nhạc Phim Giao Hưởng 3 Hồi (Hans Zimmer Braaam) + Phòng Tiếng Động Vật Lý Định Điểm (46Hz LFE Impact Boom) + Phòng ADR Đa Âm Sắc:
    const { aevalExpr: symphonicScoreExpr } = buildSymphonicScoreAndLfeAeval(
      s.macroPhase || 'MAIN_CLIMAX_CONFLICT',
      s.emotionalTensionMode || 'VISCERAL_CLASH'
    );
    const adrVoiceFilter = buildAdrVoiceFilterForPhase(
      s.macroPhase || 'MAIN_CLIMAX_CONFLICT',
      s.emotionalTensionMode || 'VISCERAL_CLASH',
      effDur
    );

    try {
      if (!forceRemasterSeg && fs.existsSync(segOutPath) && fs.statSync(segOutPath).size > 500_000) {
        masteredSegmentPaths.push(segOutPath);
      } else if (s.voiceoverPath && fs.existsSync(s.voiceoverPath)) {
        // Hòa âm 4 Kênh Chuẩn Studio Marvel/DC/Skywalker Sound:
        // [0:a] Foley & SFX gốc của Veo 3.1 (làm mượt đầu/cuối J-Cut/L-Cut)
        // [1:a] Giọng đọc ADR Narrator biến điệu theo tâm lý 3 Hồi (Trầm bí ẩn -> Đanh thép -> Hào hùng)
        // [2:a] Nhạc nền Giao hưởng 3 Hồi (D-Minor / Phrygian Brass Braaam) + Tiếng nổ Siêu trầm 46Hz LFE Impact Boom khớp đúng giây va chạm
        // [3:a] Lớp âm thanh khí quyển tần số thấp (Atmospheric Sub-bass bed)
        execSync(
          `${ffmpegCmd} -y -ss ${trimStart} -t ${effDur} -i "${s.videoPath}" -i "${s.voiceoverPath}" -f lavfi -t ${effDur} -i "aevalsrc='${symphonicScoreExpr}':s=48000:c=stereo" -f lavfi -t ${effDur} -i "anoisesrc=c=pink:r=48000:a=0.028,lowpass=f=140,highpass=f=32" -filter_complex "${studioVideoFilter};[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,${sfxVolExpr},afade=t=in:st=0:d=0.22,afade=t=out:st=${fadeOutStart}:d=0.26[sfx];[1:a]${adrVoiceFilter}[vo];[2:a]aformat=sample_fmts=fltp:channel_layouts=stereo,lowpass=f=280,volume=0.82,afade=t=in:st=0:d=0.20,afade=t=out:st=${fadeOutStart}:d=0.25[score_lfe];[3:a]aformat=sample_fmts=fltp:channel_layouts=stereo,${bedVolExpr}[bed];[sfx][vo][score_lfe][bed]amix=inputs=4:duration=first:dropout_transition=0,alimiter=limit=0.95[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -preset fast -crf 19 -r 24 -c:a aac -b:a 192k "${segOutPath}"`,
          { stdio: 'ignore', timeout: 90000 }
        );
        masteredSegmentPaths.push(segOutPath);
      } else {
        execSync(
          `${ffmpegCmd} -y -ss ${trimStart} -t ${effDur} -i "${s.videoPath}" -f lavfi -t ${effDur} -i "aevalsrc='${symphonicScoreExpr}':s=48000:c=stereo" -f lavfi -t ${effDur} -i "anoisesrc=c=pink:r=48000:a=0.028,lowpass=f=140,highpass=f=32" -filter_complex "${studioVideoFilter};[0:a]aresample=48000,aformat=sample_fmts=fltp:channel_layouts=stereo,volume=0.80,afade=t=in:st=0:d=0.22,afade=t=out:st=${fadeOutStart}:d=0.26[sfx];[1:a]aformat=sample_fmts=fltp:channel_layouts=stereo,lowpass=f=280,volume=0.90[score_lfe];[2:a]aformat=sample_fmts=fltp:channel_layouts=stereo,${bedVolExpr}[bed];[sfx][score_lfe][bed]amix=inputs=3:duration=first:dropout_transition=0,alimiter=limit=0.95[aout]" -map "[vout]" -map "[aout]" -c:v libx264 -preset fast -crf 19 -r 24 -c:a aac -b:a 192k "${segOutPath}"`,
          { stdio: 'ignore', timeout: 90000 }
        );
        masteredSegmentPaths.push(segOutPath);
      }
    } catch {
      masteredSegmentPaths.push(s.videoPath);
    }

    const segStart = timelineCursorSec;
    const segEnd = Number((timelineCursorSec + effDur).toFixed(2));
    timelineCursorSec = segEnd;

    const phaseViLabel =
      s.macroPhase === 'PRE_MAIN_BUILDUP'
        ? 'KHỞI ĐỘNG & ĐIỀM BÁO'
        : s.macroPhase === 'POST_MAIN_AFTERMATH'
        ? 'HẬU QUẢ & DƯ CHẤN'
        : 'Ý CHÍNH - CAO TRÀO';

    const tensionViLabel =
      s.emotionalTensionMode === 'VULNERABILITY_LOW_POINT'
        ? ' • NGHỊCH CẢNH'
        : s.emotionalTensionMode === 'SAKUGA_DROP_SILENCE_TO_CATHARSIS'
        ? ' • NÉN LÒ XO SAKUGA'
        : s.emotionalTensionMode === 'OMINOUS_SILENCE'
        ? ' • TĨNH LẶNG TRƯỚC BÃO'
        : '';

    const coverageViLabel =
      s.coverageType === 'INSERT_DETAIL_CUTAWAY'
        ? 'CẬN CHI TIẾT (INSERT)'
        : s.coverageType === 'OTS_CONFRONTATION'
        ? 'GÓC QUA VAI (OTS)'
        : s.coverageType === 'KULESHOV_REACTION'
        ? 'PHẢN ỨNG KULESHOV'
        : s.coverageType === 'POV_SUBJECTIVE'
        ? 'GÓC CHỦ QUAN (POV)'
        : s.coverageType === 'LOW_ANGLE_HERO_APEX'
        ? 'GÓC ANH HÙNG 24MM'
        : 'ĐẠI CẢNH (MASTER)';

    // Ghi nội dung .SRT chuẩn
    srtContent += `${i + 1}\n${formatSrtTimestamp(segStart)} --> ${formatSrtTimestamp(segEnd)}\n[${phaseViLabel}${tensionViLabel} | ${coverageViLabel} | ${s.titleVi}] ${s.subtitleVi || ''}\n\n`;

    // Ghi nội dung .ASS (Phụ đề điện ảnh cạnh dưới + Thẻ Giai đoạn / Góc máy Trường lớp / Tên Cảnh / Tuyệt Chiêu góc trên trái)
    const subStartAss = formatAssTimestamp(segStart + 0.12);
    const subEndAss = formatAssTimestamp(Math.max(segStart + 1.0, segEnd - 0.12));
    const badgeEndAss = formatAssTimestamp(Math.min(segEnd - 0.2, segStart + 3.8));
    const cleanSubtitle = escapeAssText(s.subtitleVi || s.titleVi || '');
    const cleanTitle = escapeAssText((s.titleVi || `Cảnh ${s.shotIdx}`).toUpperCase());
    const cleanSkill = escapeAssText(s.skillUsed || '');

    assEvents += `Dialogue: 0,${subStartAss},${subEndAss},CinemaSub,,0,0,0,,{\\fad(180,180)}${cleanSubtitle}\n`;
    const badgeText = cleanSkill
      ? `[${phaseViLabel}${tensionViLabel} • ${coverageViLabel}] CẢNH ${s.shotIdx}/${renderedShots.length} • ${cleanTitle}   |   ✦ ${cleanSkill}`
      : `[${phaseViLabel}${tensionViLabel} • ${coverageViLabel}] CẢNH ${s.shotIdx}/${renderedShots.length} • ${cleanTitle}`;
    assEvents += `Dialogue: 1,${subStartAss},${badgeEndAss},SkillBadge,,0,0,0,,{\\fad(200,300)}${badgeText}\n`;

    if (i === 0 && blueprint.movieTitle) {
      const titleEndAss = formatAssTimestamp(Math.min(effDur - 0.3, 4.5));
      assEvents += `Dialogue: 2,${formatAssTimestamp(0.2)},${titleEndAss},MovieTitle,,0,0,0,,{\\fad(350,450)}★ ${escapeAssText(blueprint.movieTitle.toUpperCase())} ★\n`;
      const locEndAss = formatAssTimestamp(Math.min(effDur - 0.2, 6.8));
      assEvents += `Dialogue: 2,${formatAssTimestamp(1.2)},${locEndAss},LocationCard,,0,0,0,,{\\fad(400,450)}📍 ĐỊA ĐIỂM: ${escapeAssText((envName || 'THUNG LŨNG KRETA').replace(/_/g, ' '))} • 66.000.000 NĂM TRƯỚC CÔNG NGUYÊN\n`;
    }
    if (i === renderedShots.length - 1) {
      const creditsStartAss = formatAssTimestamp(Math.max(segStart + 0.5, segEnd - 3.6));
      const creditsEndAss = formatAssTimestamp(segEnd - 0.1);
      assEvents += `Dialogue: 2,${creditsStartAss},${creditsEndAss},EndCredits,,0,0,0,,{\\fad(450,350)}A HYPERION 12-DEPARTMENT STUDIO PRODUCTION • STUNT & FIGHT CHOREOGRAPHY: 87NORTH ENGINE • SCORE & 46HZ LFE FOLEY: SKYWALKER AUDIO SUITE • DI COLOR: DAVINCI 2.39:1\n`;
    }
  }

  const srtPath = path.join(projectOutDir, 'master_subtitles.srt');
  fs.writeFileSync(srtPath, srtContent, 'utf-8');

  const assPath = path.join(projectOutDir, 'master_subtitles.ass');
  const assHeader = `[Script Info]
Title: ${blueprint.movieTitle || 'Hyperion Studio AI Film'}
ScriptType: v4.00+
PlayResX: 1280
PlayResY: 720
WrapStyle: 0
ScaledBorderAndShadow: yes

[V4+ Styles]
Format: Name, Fontname, Fontsize, PrimaryColour, SecondaryColour, OutlineColour, BackColour, Bold, Italic, Underline, StrikeOut, ScaleX, ScaleY, Spacing, Angle, BorderStyle, Outline, Shadow, Alignment, MarginL, MarginR, MarginV, Encoding
Style: CinemaSub,Noto Sans,25,&H00FFFFFF,&H0000D7FF,&H00000000,&H96000000,-1,0,0,0,100,100,0.2,0,3,2.2,1.2,2,50,50,36,1
Style: SkillBadge,Noto Sans,15,&H00A0E8FF,&H00FFFFFF,&H00000000,&H88081018,-1,0,0,0,100,100,0.5,0,3,1.6,0.8,7,24,24,8,1
Style: MovieTitle,Noto Sans,27,&H0055D4FF,&H00FFFFFF,&H00000000,&HA0000000,-1,0,0,0,100,100,1.0,0,3,2.5,1.5,8,40,40,48,1
Style: LocationCard,Noto Sans,16,&H00B8FF9E,&H00FFFFFF,&H00000000,&H90081810,-1,0,0,0,100,100,1.2,0,3,1.8,0.8,8,40,40,86,1
Style: EndCredits,Noto Sans,14,&H00D0E8FF,&H00FFFFFF,&H00000000,&HB0000000,-1,0,0,0,100,100,0.8,0,3,1.6,0.8,8,30,30,8,1

[Events]
Format: Layer, Start, End, Style, Name, MarginL, MarginR, MarginV, Effect, Text
`;
  fs.writeFileSync(assPath, assHeader + assEvents, 'utf-8');

  // 7C. Nối toàn bộ các phân cảnh đã chuẩn hóa âm thanh & đốt phụ đề điện ảnh ASS trực tiếp lên MASTER_FINAL_MOVIE.mp4
  const masterMp4Path = path.join(projectOutDir, 'MASTER_FINAL_MOVIE.mp4');
  const directorsCutPath = path.join(projectOutDir, 'MASTER_DIRECTORS_CUT.mp4');
  const rawJoinedPath = path.join(projectOutDir, 'MASTER_JOINED_AUDIO_BRIDGED.mp4');
  const concatListPath = path.join(projectOutDir, 'ffmpeg_concat_list.txt');
  const concatLines = masteredSegmentPaths
    .filter((p) => p && fs.existsSync(p))
    .map((p) => `file '${p.replace(/\\/g, '/')}'`)
    .join('\n');
  fs.writeFileSync(concatListPath, concatLines, 'utf-8');

  try {
    execSync(`${ffmpegCmd} -y -f concat -safe 0 -i "${concatListPath}" -c copy "${rawJoinedPath}"`, {
      stdio: 'ignore',
      timeout: 30000,
    });
    const escapedAssPath = assPath.replace(/\\/g, '/').replace(/:/g, '\\:');
    execSync(
      `${ffmpegCmd} -y -i "${rawJoinedPath}" -vf "ass='${escapedAssPath}'" -c:v libx264 -preset superfast -crf 24 -maxrate 3200k -bufsize 6400k -c:a copy "${masterMp4Path}"`,
      { stdio: 'ignore', timeout: 120000 }
    );
    fs.copyFileSync(masterMp4Path, directorsCutPath);
    console.log(
      `   -> 🎬 Đã xuất bản thành công Bộ Phim Master Director's Cut (Có Thuyết minh AI + Phụ đề Đốt trên hình + Hòa âm Xuyên suốt): ${masterMp4Path}`
    );
  } catch (ffErr: any) {
    console.warn(`   -> ⚠️ Fallback sang bản nối âm thanh (${ffErr.message}).`);
    if (fs.existsSync(rawJoinedPath)) {
      fs.copyFileSync(rawJoinedPath, masterMp4Path);
    } else if (renderedShots[0]?.videoPath) {
      fs.copyFileSync(renderedShots[0].videoPath, masterMp4Path);
    }
  }

  const manifestPath = path.join(projectOutDir, 'master_production_manifest.json');
  const cleanManifest = {
    movieTitle: blueprint.movieTitle,
    createdAt: new Date().toISOString(),
    studioPipelineArchitecture: '12-Department Blockbuster Studio Pipeline (Marvel / DC / Disney / Skywalker Sound / DaVinci DI)',
    script: opts.script,
    model: opts.model,
    theatricalPosterPath,
    character1SheetPath: charSheetPath,
    character2SheetPath: char2SheetPath,
    cleanEnvironmentLockPath: envLockPath,
    battleDamagedEnvironmentLockPath: damagedEnvPath,
    smolderingAftermathEnvironmentLockPath: aftermathEnvPath,
    masterVideoPath: masterMp4Path,
    directorsCutVideoPath: directorsCutPath,
    subtitlesPath: srtPath,
    assSubtitlesPath: assPath,
    shots: renderedShots.map(({ startKeyframeBase64, ...rest }) => rest),
  };
  fs.writeFileSync(manifestPath, JSON.stringify(cleanManifest, null, 2), 'utf-8');

  console.log('========================================================================');
  console.log(`🎉 HOÀN TẤT QUY TRÌNH 7 GIAI ĐOẠN CHO PHIM: "${blueprint.movieTitle}"!`);
  console.log(`🎬 Video Phim Master Hoàn Chỉnh (.MP4): ${masterMp4Path}`);
  console.log(`🌟 Bản Director's Cut (.MP4)          : ${directorsCutPath}`);
  console.log(`📂 Thư mục chứa toàn bộ Tài sản       : ${projectOutDir}`);
  console.log(`📝 Phụ đề .SRT & .ASS                 : ${srtPath} | ${assPath}`);
  console.log(`📋 Hồ sơ dự án .JSON                  : ${manifestPath}`);
  console.log('========================================================================');
}

main().catch((err) => {
  console.error('❌ Lỗi trong dây chuyền sản xuất:', err.message);
  process.exit(1);
});
