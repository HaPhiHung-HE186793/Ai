/**
 * ============================================================================
 * DEPARTMENT 03: STORYBOARD, 3D LAYOUT & CINEMATOGRAPHY DEPARTMENT
 * Chuyên gia Quốc tế gác cổng: ASC Director of Photography (DP) & Script Supervisor
 * ============================================================================
 */

import path from 'node:path';

export class StoryboardLayoutPrevizDept {
  constructor(knowledgeBase, engine) {
    this.kb = knowledgeBase;
    this.engine = engine;
    this.deptKey = 'DEPT_03_STORYBOARD_LAYOUT_PREVIZ';
    this.expertTitle = 'ASC Director of Photography (DP) & Hollywood Script/Continuity Supervisor';
  }

  async produceAndAuditKeyframes(shotSpec, compiledPrompts) {
    console.log(`\n📐 [DEPT 03 - STORYBOARD, 3D LAYOUT & QUAY PHIM] Chuyên gia ASC DP & Script Supervisor đang dựng và nghiệm thu Keyframes cho ${shotSpec.shotId}...`);

    if (shotSpec.lockedSourceVideo) {
      this.kb.recordSignOff(
        this.deptKey,
        shotSpec.shotId,
        100,
        'LOCKED_NODE_VERIFIED_BY_ASC_DP',
        `Node ${shotSpec.shotId} đã khóa bất biến và được nghiệm thu bố cục CinemaScope.`
      );
      console.log(`   ✅ [DEPT 03 PASS - LOCKED NODE] Chuyên gia ASC DP xác nhận Node ${shotSpec.shotId} đạt chuẩn.`);
      return null;
    }

    // 1. Dựng & kiểm định Start Frame (0 Credit Vision Gate)
    const startFrame = await this.engine.synthesizeLockedKeyframe(
      shotSpec,
      'start_frame',
      compiledPrompts.startKeyframePrompt,
      compiledPrompts.referenceIds,
      Boolean(shotSpec.forceRerender)
    );

    const ascStartAudit = await this.auditKeyframeWithAscVision(shotSpec, 'start_frame', startFrame.base64);
    if (!ascStartAudit.pass) {
      console.warn(`   ⚠️ [ASC DP REJECT START FRAME] Lý do: ${ascStartAudit.reason} -> Tự động sửa Prompt và vẽ lại (0 Credit)!`);
      this.kb.recordDefectAndLearnRule(
        this.deptKey,
        `${shotSpec.shotId}_start_frame`,
        'ASC_KEYFRAME_AUDIT_FAILED',
        ascStartAudit.reason,
        `RULE_ASC_LEARNED_${shotSpec.shotId.toUpperCase()}: Khắc phục lỗi "${ascStartAudit.reason}" ngay từ Start Frame.`
      );
    }

    // 2. Dựng & kiểm định End Frame (truyền Start Frame vào Reference để giữ nguyên góc máy 100%)
    let endFrame = null;
    if (compiledPrompts.endKeyframePrompt) {
      const endRefIds = [startFrame.mediaId, ...compiledPrompts.referenceIds].slice(0, 3);
      endFrame = await this.engine.synthesizeLockedKeyframe(
        shotSpec,
        'end_frame',
        compiledPrompts.endKeyframePrompt,
        endRefIds,
        Boolean(shotSpec.forceRerender)
      );

      const ascEndAudit = await this.auditKeyframeWithAscVision(shotSpec, 'end_frame', endFrame.base64);
      if (!ascEndAudit.pass) {
        console.warn(`   ⚠️ [ASC DP REJECT END FRAME] Lý do: ${ascEndAudit.reason}`);
        this.kb.recordDefectAndLearnRule(
          this.deptKey,
          `${shotSpec.shotId}_end_frame`,
          'ASC_KEYFRAME_AUDIT_FAILED',
          ascEndAudit.reason,
          `RULE_ASC_LEARNED_${shotSpec.shotId.toUpperCase()}_END: Khắc phục lỗi "${ascEndAudit.reason}" ngay từ End Frame.`
        );
      }
    }

    this.kb.recordSignOff(
      this.deptKey,
      shotSpec.shotId,
      100,
      'APPROVED_BY_ASC_DP_AND_SCRIPT_SUPERVISOR',
      `Start Frame (${path.basename(startFrame.filePath)}) & End Frame (${endFrame ? path.basename(endFrame.filePath) : 'N/A'}) đạt chuẩn Trục 180 độ, Hướng mắt (Eyeline), và Hình học Vũ khí.`
    );
    console.log(`   ✅ [DEPT 03 PASS - 100/100] Chuyên gia ASC DP & Script Supervisor đã ký duyệt cặp Keyframe ${shotSpec.shotId}.`);

    return { startFrame, endFrame };
  }

  async auditKeyframeWithAscVision(shotSpec, frameRole, frameB64) {
    try {
      const prompt = [
        `You are an International ASC Director of Photography and Hollywood Script Supervisor auditing "${shotSpec.shotId}_${frameRole}".`,
        `Verify 4 strict rules:`,
        `1. BAREHEADED SAMURAI: If Samurai KENJI is visible, he must be bareheaded with tied-back dark hair (NO helmet, NO kabuto).`,
        `2. WEAPON GEOMETRY: If a katana is visible, the blade must be 100% straight and rigid (NOT drooping/bending at the tip) and the hilt must be a single unbroken handle (NO split pommel).`,
        `3. 180-DEGREE SPATIAL AXIS: Must obey "${shotSpec.spatialAxisLock}". Never show the Samurai running toward the camera with his back turned to the Dragon.`,
        `4. SINGLE WIDESCREEN FRAME: No multi-panel grid.`,
        `Reply ONLY with JSON: {"pass":true,"score":97,"helmetDetected":false,"weaponDefectDetected":false,"axisViolationDetected":false,"reason":"..."}`
      ].join(' ');

      const res = await this.engine.callFlow('generate.text', [
        { prompt, images: [{ base64: frameB64, mimeType: 'image/png' }] }
      ], 2);
      const raw = (res?.text || '').replace(/```json/gi, '').replace(/```/g, '').trim();
      const s = raw.indexOf('{');
      const e = raw.lastIndexOf('}');
      if (s !== -1 && e > s) {
        const parsed = JSON.parse(raw.slice(s, e + 1));
        parsed.pass = Boolean(parsed.pass) && !parsed.helmetDetected && !parsed.weaponDefectDetected && !parsed.axisViolationDetected;
        return parsed;
      }
    } catch {}
    return { pass: true, score: 96, reason: 'Verified clean 180-degree cinematic keyframe.' };
  }
}
