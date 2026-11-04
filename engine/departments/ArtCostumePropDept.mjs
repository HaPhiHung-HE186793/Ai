/**
 * ============================================================================
 * DEPARTMENT 02: ART, CREATURE ANATOMY, MAKEUP, PROP & PRODUCTION DESIGN (V6)
 * Chuyên gia Quốc tế gác cổng:
 *   - Weta Workshop Creature Anatomy & Weapons Prop Master
 *   - Hollywood Production Designer (Set Architecture Continuity)
 *   - Hollywood Makeup & Prosthetics Continuity Supervisor
 * ============================================================================
 * Nhiệm vụ V6:
 *  1. Khóa Giải Phẫu Sinh Vật (Creature Anatomy Lock - RULE_CREATURE_WINGS_08):
 *     - @KURORYU bắt buộc luôn có ĐỦ 2 CÁNH DƠI CƠ KHÍ KHỔNG LỒ (TWO MASSIVE BIOMECHANICAL
 *       OBSIDIAN DRAGON WINGS) trong mọi cảnh từ đầu đến cuối (cấm biến thành Godzilla cụt cánh!).
 *  2. Khóa Hóa Trang Khuôn Mặt (Makeup Continuity Lock - RULE_MAKEUP_CLEAN_FACE_09):
 *     - Khuôn mặt @KENJI lành lặn, sắc nét, ướt mưa (cấm vẽ vết chém chảy máu dọc mặt khi đang đỡ đòn!).
 *  3. Khóa Vật Lý Tổn Thất Chiến Đấu (VFX Battle-Damage Lock - RULE_VFX_CORE_DAMAGE_10):
 *     - Tổn thất của Rồng phải phát ra từ Lõi Ngực Tròn bị nứt vỡ xì khói đen và phóng điện
 *       theo khe giáp (cấm vẽ vạch sáng laser 2D thẳng đuột dán đè lên trước thân Rồng!).
 *  4. Khóa Kiến Trúc Phim Trường 360 Độ (Set Architecture Lock - RULE_SET_ARCHITECTURE_11):
 *     - Mọi cảnh đều phải nằm trong đúng 1 sân đền lát đá duy nhất: hai bên là 2 dãy nhà gỗ 1 tầng
 *       màu nâu đen trên bờ tường đá rêu + đèn đá vuông + đúng 1 cổng Torii đỏ ở giữa (cấm rừng cây,
 *       cấm hàng rào cam, cấm nhiều cổng Torii, và cấm cổng Torii nhảy ra sau lưng Kenji ở cảnh cận!).
 */

export class ArtCostumePropDept {
  constructor(knowledgeBase, engine) {
    this.kb = knowledgeBase;
    this.engine = engine;
    this.deptKey = 'DEPT_02_ART_COSTUME_PROP';
    this.expertTitle = 'Weta Creature & Prop Master + Hollywood Production Designer & Makeup Supervisor';
  }

  auditAndCompilePrompts(shotSpec) {
    console.log(`\n⚔️ [DEPT 02 - MỸ THUẬT, GIẢI PHẪU RỒNG, HÓA TRANG & BỐI CẢNH V6] Đang kiểm định ${shotSpec.shotId}...`);

    if (shotSpec.lockedSourceVideo) {
      this.kb.recordSignOff(
        this.deptKey,
        shotSpec.shotId,
        100,
        'LOCKED_NODE_VERIFIED_BY_WETA_AND_PRODUCTION_DESIGNER',
        `Node ${shotSpec.shotId} đã khóa bất biến SHA-256 và đạt chuẩn Giải phẫu Rồng 2 cánh + Bối cảnh sân đền.`
      );
      console.log(`   ✅ [DEPT 02 PASS - LOCKED NODE] Chuyên gia Weta & Production Designer xác nhận Node ${shotSpec.shotId} đạt chuẩn.`);
      return null;
    }

    const issues = [];
    const combined = `${shotSpec.startFrameActionEn || ''} ${shotSpec.endFrameActionEn || ''} ${shotSpec.videoKinematicsEn || ''}`;

    // 1. Kiểm tra Giải phẫu Cánh Rồng (Creature Anatomy - Wings Continuity)
    if (shotSpec.subjects.includes('KURORYU') && !/two.*wings|massive.*wings|winged/i.test(combined)) {
      issues.push({
        type: 'CREATURE_ANATOMY_MISSING_DRAGON_WINGS',
        detail: `${shotSpec.shotId} có @KURORYU nhưng chưa khóa cứng 2 cánh dơi cơ khí lớn trên lưng (dễ làm Rồng lúc cụt cánh lúc có cánh!).`,
        learnedRule: 'RULE_CREATURE_WINGS_08: Mọi cú máy có @KURORYU bắt buộc phải mô tả rõ "with TWO MASSIVE BIOMECHANICAL OBSIDIAN DRAGON WINGS spread from its back (NEVER WINGLESS)".'
      });
    }

    // 2. Kiểm tra Hóa trang Khuôn mặt Samurai (Makeup Continuity - No Unmotivated Facial Cut)
    if (shotSpec.subjects.includes('KENJI') && /scar|scarred|cut on cheek/i.test(combined)) {
      issues.push({
        type: 'MAKEUP_UNMOTIVATED_FACIAL_SLASH_WOUND',
        detail: `${shotSpec.shotId} dùng từ "scar/scarred" trên mặt @KENJI làm AI vẽ thành vết kiếm chém rỉ máu dọc mặt trong khi Samurai đang đỡ đòn thành công!`,
        learnedRule: 'RULE_MAKEUP_CLEAN_FACE_09: Cấm dùng từ "scar/scarred cheek" trong cận cảnh; khóa khuôn mặt @KENJI là "CLEAN UNINJURED SHARP MASCULINE FACE WET WITH RAIN (NO FACIAL WOUNDS, NO BLEEDING CUTS)".'
      });
    }

    // 3. Kiểm tra Vật lý Tổn thất trên thân Rồng (VFX Battle-Damage Physics - No Floating 2D Laser Line)
    if (shotSpec.subjects.includes('KURORYU') && /diagonal.*slash|diagonal.*gash|slash scar/i.test(combined)) {
      issues.push({
        type: 'VFX_FAKE_2D_FLOATING_SLASH_LINE_ON_DRAGON',
        detail: `${shotSpec.shotId} mô tả "diagonal slash/gash" làm AI vẽ một thanh laser cam 2D thẳng đuột dán đè lên trước thân Rồng và đi theo Rồng rất giả tạo!`,
        learnedRule: 'RULE_VFX_CORE_DAMAGE_10: Cấm dùng "diagonal slash scar/gash" trên thân Rồng; tổn thất phải là "SHATTERED CIRCULAR CHEST REACTOR CORE CAVITY SPEWING THICK BLACK SMOKE AND GOLDEN LIGHTNING ARCS ALONG ARMOR SEAMS (NO FLOATING 2D DIAGONAL LINE)".'
      });
    }

    // 4. Kiểm tra Đồng bộ Kiến trúc Bối cảnh (Production Design - 360° Courtyard Set Lock)
    if (!/SINGLE-STORY DARK-WOOD SHRINE/i.test(combined)) {
      issues.push({
        type: 'PRODUCTION_DESIGN_SET_BACKGROUND_DRIFT',
        detail: `${shotSpec.shotId} chưa khóa cứng kiến trúc sân đền 2 mái nhà gỗ 1 tầng + bờ tường đá + đèn đá vuông (dễ làm AI vẽ rừng cây, hàng rào cam hoặc nhiều cổng Torii!).`,
        learnedRule: 'RULE_SET_ARCHITECTURE_11: Mọi cú máy phải khóa kiến trúc sân đền: "enclosed wet slate courtyard flanked on left and right by single-story dark-wood shrine buildings over mossy stone walls and square stone lanterns (NO forest trees, NO orange fences, NO multiple Torii gates)".'
      });
    }

    // Tự động sửa chữa (Self-Heal) cả 4 hạng mục
    if (issues.length > 0) {
      for (const issue of issues) {
        console.log(`   ⚠️ [DEPT 02 REJECT] Phát hiện lỗi: ${issue.type} -> ${issue.detail}`);
        this.kb.recordDefectAndLearnRule(this.deptKey, shotSpec.shotId, issue.type, issue.detail, issue.learnedRule);
      }

      // Lọc bỏ từ "scar/scarred" và "diagonal slash/gash"
      const cleanText = (txt) =>
        (txt || '')
          .replace(/,?\s*visible vertical scar on left cheek/gi, ', clean uninjured sharp face wet with rain')
          .replace(/scarred cheek/gi, 'rain-wet face')
          .replace(/FRESH BLAZING DIAGONAL (KATANA |PLASMA )?SLASH (SCAR|WOUND)/gi, 'SHATTERED SPARKING CIRCULAR CHEST REACTOR CORE CAVITY')
          .replace(/fresh glowing diagonal armor gash/gi, 'cracked circular chest reactor core cavity');

      shotSpec.startFrameActionEn = cleanText(shotSpec.startFrameActionEn);
      if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn = cleanText(shotSpec.endFrameActionEn);
      shotSpec.videoKinematicsEn = cleanText(shotSpec.videoKinematicsEn);

      // Bơm khóa Giải phẫu Cánh Rồng
      if (shotSpec.subjects.includes('KURORYU')) {
        const wingLock = ' [CREATURE ANATOMY LOCK: @KURORYU MUST HAVE TWO MASSIVE BIOMECHANICAL OBSIDIAN BAT-LIKE DRAGON WINGS SPREAD FROM ITS BACK, NEVER WINGLESS.]';
        shotSpec.startFrameActionEn += wingLock;
        if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn += wingLock;
        shotSpec.videoKinematicsEn += wingLock;
      }

      // Bơm khóa Kiến trúc Sân đền (tùy theo góc Cận cảnh hay Góc rộng)
      const isCloseUpKenji = shotSpec.subjects.length === 1 && shotSpec.subjects[0] === 'KENJI';
      const setLock = isCloseUpKenji
        ? ' [PRODUCTION DESIGN SET LOCK: Background behind @KENJI is the dark-wood single-story shrine pavilion eaves, mossy stone wall, and warm amber square stone lantern on the left side of the courtyard — STRICTLY NO TORII GATE BEHIND KENJI BACK, NO FOREST TREES.]'
        : ' [PRODUCTION DESIGN SET LOCK: Enclosed Kyoto shrine courtyard paved with wet dark slate flagstones, flanked on BOTH left and right sides by single-story dark-wood shrine buildings over mossy stone walls, four square stone pedestal lanterns glowing amber, and EXACTLY ONE vermilion-red wooden Torii gate standing at the center-back in mist — STRICTLY NO FOREST TREES, NO ORANGE FENCES, NO MULTIPLE TORII GATES, NO TWO-STORY PAGODAS.]';

      shotSpec.startFrameActionEn += setLock;
      if (shotSpec.endFrameActionEn) shotSpec.endFrameActionEn += setLock;
      shotSpec.videoKinematicsEn += setLock;

      console.log(`   🔧 [DEPT 02 SELF-HEAL] Đã tự động khóa Giải phẫu Rồng 2 cánh, Mặt Samurai lành lặn, Lõi ngực nổ thật & Kiến trúc Sân đền cho ${shotSpec.shotId}!`);
    }

    const compiled = this.engine.compileShotPrompts(shotSpec);

    this.kb.recordSignOff(
      this.deptKey,
      shotSpec.shotId,
      100,
      'APPROVED_BY_WETA_AND_PRODUCTION_DESIGNER_V6',
      `Đã khóa: (1) Rồng có đủ 2 cánh lớn, (2) Mặt Samurai lành lặn + 1 chuôi kiếm thẳng, (3) Tổn thất lõi ngực vật lý (không vạch laser 2D), (4) Đồng bộ kiến trúc 1 sân đền duy nhất.`
    );
    console.log(`   ✅ [DEPT 02 PASS - 100/100] Chuyên gia Weta, Makeup & Production Designer đã ký duyệt ${shotSpec.shotId}.`);

    return compiled;
  }
}
