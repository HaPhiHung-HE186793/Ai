#!/usr/bin/env node
/**
 * 🌉 MẢNH GHÉP 3 (V3 - STUDIO HYBRID AI/VFX): CẦU NỐI BLENDER 3D <-> GOOGLE FLOW ULTRA (VEO 3.1)
 * Tích hợp 6 Quy Chuẩn Thực Chiến (Weavy AI Node Graph + FPD Academy Stage 0 + ErikDoesVFX Hybrid Matrix):
 *   0. [STAGE 0 ART DIRECTION LOCK]: Khóa Xung đột Ý tưởng (Contrast), Moodboard Ánh sáng & Nhịp độ (Pacing) trước khi gọi AI.
 *   1. [WEAVY NODE-GRAPH ARCHITECTURE]: Tách biệt độc lập Prompt Node + Turnaround Sheet Node + Clean Plate Node + 3D Camera Angle Pass.
 *   2. [CLEAN PLATE & PROJECTILE SEPARATION]: Dùng First Frame 8K Đã Tách Sạch Mũi Tên (ai_neural_frame_0001_clean.jpg) để Veo 3.1 KHÔNG vẽ mũi tên cao su/lơ lửng.
 *   3. [ACTOR IDENTITY & SINGLE-ANCHOR LOCK]: Khóa Camera Over-The-Shoulder giữ nguyên 100% danh tính & vị trí Thợ săn tiền cảnh (chống biến dạng mặt/tàng hình).
 *   4. [BIOMECHANICAL & OPTICAL KINEMATICS]: Mô tả chuyển động T-Rex theo sinh cơ học động vật thật (Cassowary + Ostrich + Komodo torso roll) + 180° Shutter Drag & Elliptical Bokeh.
 *   5. [NUKE-STYLE ALPHA STENCIL & 3D BALLISTIC COMPOSITING]: Ghép Mũi Tên 3D (frames_arrow_rgba) + Mặt nạ Roto Thân cây 8K thật (alphamerge) ở hậu kỳ 24fps.
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

const BRIDGE_URL = process.env.FLOW_BRIDGE_URL || 'http://localhost:4321';
const PREVIZ_DIR = '/mnt/data/backup/project_personal/AI/previz_output';

/**
 * STAGE 0: PRE-PRODUCTION & ART DIRECTION LOCK (0% AI - Chuẩn TVC Agency @taion_aiwork)
 */
export const STAGE_0_ART_DIRECTION_LOCK = {
  conceptContrast: {
    phaseA_StaticTension: '0.0s - 0.6s: Stillness of the hooded ranger aiming bow in misty redwood forest (Manual/Human precision)',
    transitionTrigger: '0.4s - 0.6s: High-velocity 3D ballistic arrow release & impact flash',
    phaseB_ExplosiveApex: '0.6s - 3.0s: Colossal T-Rex biomechanical charge & earth-shattering roar (Prehistoric spectacle)',
  },
  moodboardPalette: {
    lightingStyle: 'Overcast Pacific Northwest Volumetric Mist, High-Contrast Rim Light, Wet Reptilian Specular Highlights',
    colorScript: 'Deep Emerald & Cold Teal Shadows vs. Warm Amber Eye/Arrow Accents (2.39:1 CinemaScope DI)',
    lensOptics: '35mm Panavision Anamorphic Prime, 180-degree shutter drag, elliptical bokeh highlights',
  },
};

/**
 * STAGE 1: WEAVY-STYLE MODULAR NODE GRAPH (Tách riêng từng thành phần tham chiếu thay vì gõ 1 prompt cầu may)
 */
export const WEAVY_NODE_GRAPH = {
  turnaroundSheetNode: path.join(PREVIZ_DIR, 'trex_turnaround_sheet_808080.jpg'),
  cleanEnvironmentPlateNode: path.join(PREVIZ_DIR, 'ai_neural_frame_0001_clean.jpg'),
  camera3dDepthNode: path.join(PREVIZ_DIR, 'frames_depth/depth_0001.png'),
  fgHoldoutRotoNode: path.join(PREVIZ_DIR, 'frames_fg_roto_mask/roto_0001.png'),
  ballisticArrow3dNode: path.join(PREVIZ_DIR, 'frames_arrow_rgba/arrow_0001.png'),
};

/**
 * STAGE 4: ERIKDOESVFX BIOMECHANICAL & OPTICAL VEO 3.1 PROMPT ENGINE
 */
export function buildBiomechanicalVeoPrompt({
  cameraLock = '16:9 35mm Anamorphic Cinema Lens, locked stationary tripod camera directly behind the hooded ranger on screen-left. DO NOT dolly forward past the ranger; keep the ranger on screen-left and the mossy redwood tree trunk on screen-right anchored in the foreground throughout the entire shot.',
  creatureAction = 'The hooded ranger on screen-left holds his wooden bow steady in the foreground while the colossal dark-green scaly Tyrannosaurus Rex in the center forest roars ferociously and charges straight forward toward the camera on heavy muscular hind legs, kicking up dirt, ferns, and forest debris with every massive footstep until its jaws and chest loom right in front of the foreground redwood tree.',
  biomechanics = 'Combining the real-world charging biomechanics of a giant cassowary, ostrich, and Komodo dragon: its heavy torso rolls naturally with each weight transfer as its three-toed claws crush into the wet forest mud.',
  optics = '180-degree cinema shutter drag, natural motion blur on fast-moving limbs, elliptical anamorphic bokeh in the misty background.',
  guardrails = 'Zero floating objects, zero arrows, zero disappearing characters, zero actor identity drift or face morphing, 100% photorealistic live-action physics.',
} = {}) {
  return (
    `[CAMERA & PLATE LOCK]: ${cameraLock} ` +
    `[CREATURE KINEMATICS]: ${creatureAction} ` +
    `[BIOMECHANICAL WEIGHT]: ${biomechanics} ` +
    `[OPTICAL PHYSICS]: ${optics} ` +
    `[GUARDRAILS]: ${guardrails} (no subtitles) — no subtitles`
  );
}

async function callFlowBridge(method, args = []) {
  const res = await fetch(`${BRIDGE_URL}/api/flow`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ method, args }),
  });
  const payload = await res.json();
  if (!res.ok || !payload.ok) {
    throw new Error(payload.error || `Lỗi gọi Flow.${method}`);
  }
  return payload.data;
}

async function checkBridgeStatus() {
  try {
    const res = await fetch(`${BRIDGE_URL}/api/status`);
    if (!res.ok) return false;
    const data = await res.json();
    return Boolean(data?.ok);
  } catch {
    return false;
  }
}

async function main() {
  console.log('====================================================================');
  console.log('🎬 HYBRID 3D BLENDER 4.2 + AI VEO 3.1 (V3 STUDIO HYBRID PIPELINE)');
  console.log('====================================================================');
  console.log('🧭 [STAGE 0 ART DIRECTION]:', STAGE_0_ART_DIRECTION_LOCK.conceptContrast.transitionTrigger);
  console.log('🧩 [STAGE 1 WEAVY NODE GRAPH]:', Object.keys(WEAVY_NODE_GRAPH).join(' -> '));

  const arrowPass01 = path.join(PREVIZ_DIR, 'frames_arrow_rgba/arrow_0001.png');
  const aiCleanStartJpg = path.join(PREVIZ_DIR, 'ai_neural_frame_0001_clean.jpg');
  const veoCleanMp4 = path.join(PREVIZ_DIR, 'veo31_neural_video_v2_clean.mp4');
  const veoOutMp4 = path.join(PREVIZ_DIR, 'veo31_neural_video.mp4');

  if (!fs.existsSync(arrowPass01) || process.argv.includes('--rebuild-3d')) {
    console.log('⚙️ Đang gọi Blender 4.2 xuất 6 Pass 3D (bao gồm 3D Ballistic Arrow Pass & Aligned Roto Mask)...');
    execSync('/mnt/data/backup/project_personal/AI/tools/blender-4.2.3-linux-x64/blender -b -P /mnt/data/backup/project_personal/AI/blender_previz_pipeline.py', {
      stdio: 'inherit',
    });
  }

  const isBridgeOnline = await checkBridgeStatus();
  if (isBridgeOnline && (!fs.existsSync(veoCleanMp4) || process.argv.includes('--force-veo'))) {
    console.log('🟢 Google Flow Ultra Bridge (localhost:4321) ĐANG ONLINE!');
    console.log('📤 [1/2] Đang Upload Clean First Frame 8K (Không có mũi tên thừa) lên Google Flow Ultra...');
    const b64Start = fs.readFileSync(aiCleanStartJpg).toString('base64');
    const upStart = await callFlowBridge('upload', [
      {
        base64: b64Start,
        mimeType: 'image/jpeg',
        name: 'Blender3D_Clean_FirstFrame_0001.jpg',
      },
    ]);
    console.log(`   -> Clean First Frame MediaId: ${upStart.mediaId}`);

    console.log('🎥 [2/2] Đang gọi Veo 3.1 (Biomechanical Kinematics + 180° Shutter + Actor Identity Lock)...');
    const videoPrompt = buildBiomechanicalVeoPrompt();

    const videoRes = await callFlowBridge('generate.video', [
      {
        prompt: videoPrompt,
        modelDisplayName: 'Veo 3.1 - Lite',
        aspectRatio: '16:9',
        durationSeconds: 8,
        firstFrameImageMediaId: upStart.mediaId,
      },
    ]);

    if (videoRes && videoRes.base64) {
      fs.writeFileSync(veoCleanMp4, Buffer.from(videoRes.base64, 'base64'));
      fs.copyFileSync(veoCleanMp4, veoOutMp4);
      console.log(`✅ Đã kết xuất thành công Video Veo 3.1 V2 Sạch 100% tại: ${veoCleanMp4}`);
    }
  }

  console.log('🎞️ Đang chạy Bàn dựng Nuke-Style Alpha Stencil Cutout + 3D Ballistic Arrow + 1.0x Real-Time Speed...');
  execSync('python3 /mnt/data/backup/project_personal/AI/build_studio_demo.py', { stdio: 'inherit' });
  console.log('🎉 Hoàn tất 100% dây chuyền Hybrid 3D + AI Veo 3.1 (Chuẩn 10/10 VFX)!');
}

main().catch((err) => {
  console.error('❌ Lỗi:', err.message);
  process.exit(1);
});
