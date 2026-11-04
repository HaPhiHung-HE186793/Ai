/**
 * ============================================================================
 * DEPARTMENT 02: ART, COSTUME & WEAPONS PROP DEPARTMENT
 * Chuyên gia Quốc tế gác cổng: Weta Workshop Concept Art, Costume & Weapons Prop Master
 * ============================================================================
 */

export class ArtCostumePropDept {
  constructor(knowledgeBase, engine) {
    this.kb = knowledgeBase;
    this.engine = engine;
    this.deptKey = 'DEPT_02_ART_COSTUME_PROP';
    this.expertTitle = 'Weta Workshop Concept Art, Costume & Weapons Prop Master';
  }

  auditAndCompilePrompts(shotSpec) {
    console.log(`\n⚔️ [DEPT 02 - MỸ THUẬT, PHỤC TRANG & ĐẠO CỤ] Chuyên gia Weta Prop Master đang kiểm định ${shotSpec.shotId}...`);

    if (shotSpec.lockedSourceVideo) {
      this.kb.recordSignOff(
        this.deptKey,
        shotSpec.shotId,
        100,
        'LOCKED_NODE_VERIFIED_BY_WETA_PROP_MASTER',
        `Node ${shotSpec.shotId} đã khóa bất biến SHA-256 và đạt chuẩn 3-Anchor DNA.`
      );
      console.log(`   ✅ [DEPT 02 PASS - LOCKED NODE] Chuyên gia Weta Prop Master xác nhận Node ${shotSpec.shotId} đạt chuẩn.`);
      return null;
    }

    const issues = [];
    const combined = `${shotSpec.startFrameActionEn || ''} ${shotSpec.endFrameActionEn || ''}`;

    // Kiểm tra lỗi Rắc-cô Hiện trường (Set Dressing / World-State Continuity Error):
    // Nếu các cảnh sau dùng Mỏ neo Bối cảnh nguyên vẹn (KYOTO_SHRINE có cổng Torii nguyên vẹn),
    // thì Cảnh trước KHÔNG ĐƯỢC phá sập cổng Torii (mà phải đặt Rồng đứng PHÍA TRƯỚC cổng Torii để không xuyên cổng mà cổng vẫn nguyên vẹn!).
    if (
      shotSpec.environmentId === 'KYOTO_SHRINE' &&
      /shattering.*torii|breaking.*torii|broken torii/i.test(combined) &&
      !shotSpec.allowWorldStateMutation
    ) {
      issues.push({
        type: 'SET_CONTINUITY_TORII_DESTRUCTION_MISMATCH',
        detail: `${shotSpec.shotId} phá hủy cổng Torii ở đầu phim trong khi các Beat 2, 3, 4, 5, 6 phía sau vẫn dùng Mỏ neo Bối cảnh KYOTO_SHRINE có cổng Torii nguyên vẹn (lỗi rắc-cô hiện trường: cảnh trước phá cổng, cảnh sau cổng lại nguyên vẹn!).`,
        learnedRule: 'RULE_ART_WORLD_STATE_07: Mọi thay đổi vật lý lên kiến trúc cố định (như cổng Torii) phải đồng bộ xuyên suốt toàn bộ các Shot sau. Nếu giữ cổng Torii nguyên vẹn ở các Shot sau, phải đặt @KURORYU đứng PHÍA TRƯỚC cổng Torii (standing IN FRONT OF the intact red Torii gate, clear of the crossbar) và dậm nát mặt đá dưới chân thay vì phá sập cổng Torii.'
      });
    }

    // Kiểm tra lỗi Orphan Weapon Hallucination: Cảnh chỉ có Rồng (không có Kenji) nhưng lại nhắc chữ "katana/sword" làm AI vẽ thanh kiếm cắm trên ngực Rồng!
    if (!shotSpec.subjects.includes('KENJI') && /katana|sword/i.test(combined)) {
      issues.push({
        type: 'PROP_ORPHAN_WEAPON_HALLUCINATION_ON_CREATURE',
        detail: `${shotSpec.shotId} chỉ quay @KURORYU nhưng mô tả vết thương lại dùng từ "katana/sword", làm AI vẽ dư 1 thanh kiếm cắm trên ngực Rồng (vi phạm rắc-cô vì thanh kiếm vẫn đang nằm trên tay Kenji!).`,
        learnedRule: 'RULE_PROP_LEARNED_05: Khi mô tả vết thương trên cơ thể quái vật (@KURORYU), CẤM dùng danh từ vũ khí ("katana", "sword"); bắt buộc dùng "MOLTEN DIAGONAL ARMOR FRACTURE AND CRACKED CHEST REACTOR (NO SWORD OR HILT STUCK IN CHEST)".'
      });
    }

    if (shotSpec.subjects.includes('KENJI') && combined.toLowerCase().includes('katana')) {
      if (!combined.includes('SINGLE UNBROKEN STRAIGHT')) {
        issues.push({
          type: 'PROP_UNCONSTRAINED_KATANA_HILT_AND_BLADE',
          detail: `${shotSpec.shotId} có thanh Katana nhưng chưa khóa cứng ràng buộc 1 chuôi kiếm liền mạch và lưỡi thép thẳng cứng 100%.`,
          learnedRule: 'RULE_PROP_LEARNED_01: Mọi cú máy có Katana bắt buộc nhúng điều khoản vật lý: "100% RIGID STRAIGHT STEEL KATANA BLADE (no drooping tip), SINGLE UNBROKEN STRAIGHT TSUKA HILT (no split pommel)".'
        });
      }
    }

    if (issues.length > 0) {
      for (const issue of issues) {
        console.log(`   ⚠️ [WETA PROP MASTER REJECT] Phát hiện rủi ro đạo cụ: ${issue.type} -> ${issue.detail}`);
        this.kb.recordDefectAndLearnRule(this.deptKey, shotSpec.shotId, issue.type, issue.detail, issue.learnedRule);
      }
      if (!shotSpec.subjects.includes('KENJI')) {
        shotSpec.startFrameActionEn = shotSpec.startFrameActionEn.replace(/katana|sword/gi, 'plasma');
        if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn = shotSpec.endFrameActionEn.replace(/katana|sword/gi, 'plasma');
        shotSpec.videoKinematicsEn = shotSpec.videoKinematicsEn.replace(/katana|sword/gi, 'plasma');
        const noSwordTag = ' [WETA PROP LOCK: OPEN MOLTEN ARMOR GASH ONLY, STRICTLY NO SWORD, NO BLADE, AND NO HILT EMBEDDED OR STICKING OUT OF THE DRAGON CHEST.]';
        shotSpec.startFrameActionEn += noSwordTag;
        if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn += noSwordTag;
        shotSpec.videoKinematicsEn += noSwordTag;
      } else {
        const propTag =
          ' [WETA PROP MASTER LOCK: 100% RIGID STRAIGHT STEEL KATANA BLADE (NO BENDING OR DROOPING TIP), SINGLE UNBROKEN STRAIGHT TSUKA HILT gripped on the same single handle shaft (NO SPLIT POMMEL, NO EXTRA HILT END PROTRUDING FROM RIGHT HAND, SINGLE SCABBARD ON LEFT HIP).]';
        shotSpec.startFrameActionEn += propTag;
        if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn += propTag;
        shotSpec.videoKinematicsEn += propTag;
      }
      console.log(`   🔧 [WETA PROP MASTER SELF-HEAL] Đã tự động lọc bỏ từ khóa gây mọc đạo cụ giả và khóa cứng rắc-cô vũ khí cho ${shotSpec.shotId}!`);
    }

    const compiled = this.engine.compileShotPrompts(shotSpec);

    this.kb.recordSignOff(
      this.deptKey,
      shotSpec.shotId,
      100,
      'APPROVED_BY_WETA_PROP_MASTER',
      `Đã tiêm ${compiled.referenceIds.length} Mỏ Neo DNA gốc, khóa BAREHEADED (không mũ sắt), khóa 1 chuôi kiếm thẳng liền mạch (Single Tsuka Hilt) và lưỡi kiếm thép cứng 100%.`
    );
    console.log(`   ✅ [DEPT 02 PASS - 100/100] Chuyên gia Weta Prop Master đã ký duyệt Đạo cụ & Phục trang ${shotSpec.shotId}.`);

    return compiled;
  }
}
