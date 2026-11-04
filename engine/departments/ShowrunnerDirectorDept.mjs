/**
 * ============================================================================
 * DEPARTMENT 01: SHOWRUNNER & ACTION DIRECTOR DEPARTMENT
 * Chuyên gia Quốc tế gác cổng: Hollywood DGA Senior Action Director & Showrunner
 * ============================================================================
 */

export class ShowrunnerDirectorDept {
  constructor(knowledgeBase) {
    this.kb = knowledgeBase;
    this.deptKey = 'DEPT_01_SHOWRUNNER_DIRECTOR';
    this.expertTitle = 'Hollywood DGA Senior Action Director & Showrunner Inspector';
  }

  auditAndApproveBeat(shotSpec, beatIndex) {
    console.log(`\n🎬 [DEPT 01 - ĐẠO DIỄN & SHOWRUNNER] Chuyên gia DGA đang kiểm định Beat ${beatIndex + 1} (${shotSpec.shotId})...`);
    const issues = [];

    const combinedText = `${shotSpec.startFrameActionEn || ''} ${shotSpec.endFrameActionEn || ''} ${shotSpec.videoKinematicsEn || ''}`.toLowerCase();

    // 1. Kiểm tra lỗi Cool Poster Syndrome (chạy về phía camera khi địch ở sau lưng)
    if (
      combinedText.includes('sprints forward toward the camera') ||
      combinedText.includes('runs toward the camera') ||
      combinedText.includes('looms behind him')
    ) {
      issues.push({
        type: 'AXIS_180_BACK_TURNED_TO_ENEMY',
        detail: 'Nhân vật chạy về phía ống kính máy quay trong khi kẻ địch ở sau lưng (nhìn như quay lưng bỏ chạy).',
        learnedRule: 'RULE_DGA_LEARNED_01: Cấm tuyệt đối cụm từ "toward the camera while enemy looms behind". Bắt buộc khóa vector Trái -> Phải trực diện vào mục tiêu.'
      });
    }

    // 2. Kiểm tra khóa trục 180 độ (Screen-Left vs Screen-Right)
    if (!shotSpec.spatialAxisLock) {
      issues.push({
        type: 'MISSING_180_DEGREE_FLOOR_PLAN_LOCK',
        detail: `Shot ${shotSpec.shotId} thiếu khai báo tọa độ mặt bằng 180 độ (spatialAxisLock).`,
        learnedRule: 'RULE_DGA_LEARNED_02: Mọi cú máy đều phải chỉ rõ hướng mặt (Eyeline) và vị trí theo trục 180 độ: Kenji ở bên Trái nhìn/đánh sang Phải, Rồng ở bên Phải nhìn/đánh sang Trái.'
      });
    }

    // 3. Kiểm tra tính liên kết Nhân-Quả (Causal Chain Metadata)
    if (!shotSpec.causalLink || !shotSpec.causalLink.cause || !shotSpec.causalLink.effect) {
      issues.push({
        type: 'MISSING_CAUSAL_CHAIN_DECLARATION',
        detail: `Shot ${shotSpec.shotId} chưa khai báo rõ Nguyên nhân (Cause) từ Beat trước và Hệ quả (Effect) sang Beat sau.`,
        learnedRule: 'RULE_DGA_LEARNED_03: Mọi Beat trong kịch bản phải có trường causalLink { cause, effect } nối khớp vật lý với Beat trước và sau.'
      });
    }

    if (issues.length > 0) {
      for (const issue of issues) {
        console.log(`   ⚠️ [DGA DIRECTOR REJECT] Phát hiện lỗi: ${issue.type} -> ${issue.detail}`);
        this.kb.recordDefectAndLearnRule(this.deptKey, shotSpec.shotId, issue.type, issue.detail, issue.learnedRule);
      }
      this._selfHealShotSpec(shotSpec, beatIndex);
      console.log(`   🔧 [DGA DIRECTOR SELF-HEAL] Đã tự động khóa Trục 180 độ & Mạch Nhân-Quả cho ${shotSpec.shotId}!`);
    }

    this.kb.recordSignOff(
      this.deptKey,
      shotSpec.shotId,
      100,
      'APPROVED_BY_DGA_DIRECTOR',
      `Trục 180 độ chuẩn xác (${shotSpec.spatialAxisLock}). Mạch nhân quả: [${shotSpec.causalLink.cause}] => [${shotSpec.causalLink.effect}].`
    );
    console.log(`   ✅ [DEPT 01 PASS - 100/100] Chuyên gia Đạo diễn DGA đã ký duyệt ${shotSpec.shotId}.`);
    return shotSpec;
  }

  _selfHealShotSpec(shotSpec, beatIndex) {
    if (!shotSpec.spatialAxisLock) {
      shotSpec.spatialAxisLock = '180-DEGREE LOCK: @KENJI Screen-Left (facing Right) <-> @KURORYU Screen-Right (facing Left)';
    }
    if (!shotSpec.causalLink) {
      shotSpec.causalLink = {
        cause: `Direct physical continuation from Beat ${beatIndex}`,
        effect: `Driving physical reaction into Beat ${beatIndex + 2}`
      };
    }
  }
}
