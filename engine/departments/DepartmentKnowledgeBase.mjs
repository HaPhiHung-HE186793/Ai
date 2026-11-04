/**
 * ============================================================================
 * DEPARTMENT KNOWLEDGE BASE & PERSISTENT SELF-LEARNING REGISTRY
 * ============================================================================
 * Lưu trữ quy chuẩn quốc tế (SOP), lịch sử bắt lỗi của từng Chuyên gia Quốc tế,
 * và tự động cập nhật Quy tắc Phòng ban (Self-Improving Rules) để lỗi đã gặp
 * một lần sẽ KHÔNG BAO GIỜ lặp lại ở các lần sản xuất sau.
 */

import fs from 'fs';
import path from 'path';

export class DepartmentKnowledgeBase {
  constructor(storagePath) {
    this.storagePath = storagePath;
    this.data = this._loadOrInitialize();
  }

  _loadOrInitialize() {
    if (fs.existsSync(this.storagePath)) {
      try {
        return JSON.parse(fs.readFileSync(this.storagePath, 'utf8'));
      } catch (e) {
        // Fallback to default structure if corrupted
      }
    }

    const initialData = {
      studioVersion: '3.0.0-INTERNATIONAL-5-DEPT-PIPELINE',
      updatedAt: new Date().toISOString(),
      departments: {
        DEPT_01_SHOWRUNNER_DIRECTOR: {
          name: 'Phòng Đạo Diễn & Biên Kịch Phân Cảnh (Showrunner & Action Director Dept)',
          internationalExpert: 'Hollywood DGA Senior Action Director & Showrunner Inspector',
          internationalStandards: ['DGA 180-Degree Axis Floor Plan', 'Aristotelian Action-Reaction Causal Chain', 'Ufotable Sakuga Micro-Silence Pacing'],
          permanentSOPRules: [
            'RULE_DGA_01: Khóa trục 180 độ xuyên suốt trận đấu: @KENJI luôn trấn giữ bên Trái (Screen-Left, hướng nhìn và tấn công sang Phải); @KURORYU luôn trấn giữ bên Phải (Screen-Right, hướng nhìn và tấn công sang Trái).',
            'RULE_DGA_02: Cấm tuyệt đối hội chứng Cool Poster Syndrome (nhân vật quay lưng vào kẻ địch và chạy về phía ống kính máy quay).',
            'RULE_DGA_03: Mạch Nhân-Quả bắt buộc: Mỗi Beat phải là hệ quả vật lý trực tiếp của Beat liền trước (VD: Beat 3 Rồng vồ sang Trái -> Beat 4 Kenji nhảy sang Phải chém trúng lõi ngực -> Beat 5 Lõi ngực Rồng mang vết chém phát nổ điện từ -> Beat 6 Giao kiếm quyết định).'
          ],
          learnedRulesHistory: [],
          signOffHistory: []
        },
        DEPT_02_ART_COSTUME_PROP: {
          name: 'Phòng Thiết Kế Mỹ Thuật, Phục Trang & Đạo Cụ (Art, Costume & Weapons Prop Dept)',
          internationalExpert: 'Weta Workshop Concept Art, Costume & Weapons Prop Master',
          internationalStandards: ['3-Anchor Immutable Visual DNA', 'Rigid Steel Weapon Geometry', 'Two-Handed Tsuka Grip Constraint'],
          permanentSOPRules: [
            'RULE_PROP_01: Khóa 3-Anchor DNA (@KENJI, @KURORYU, @KYOTO_SHRINE) trong mọi cú máy.',
            'RULE_PROP_02: Khóa phục trang @KENJI: BAREHEADED, wet black topknot hair, NO HELMET, NO KABUTO, NO MASK.',
            'RULE_PROP_03: Khóa hình học thanh Katana: 100% RIGID STRAIGHT STEEL BLADE (cấm mũi kiếm bị cong/rũ ở đầu clip), SINGLE UNBROKEN STRAIGHT TSUKA HILT (cấm tách làm 2 đuôi chuôi kiếm ở tay phải), SINGLE SCABBARD ON LEFT HIP.',
            'RULE_PROP_04: Trong các cảnh cận cảnh vũ khí (ECU), cả First Keyframe và Last Keyframe bắt buộc giữ CÙNG MỘT GÓC NGHIÊNG 45 ĐỘ để tránh AI bẻ cong lưỡi kiếm khi nội suy từ ngang sang chéo.'
          ],
          learnedRulesHistory: [],
          signOffHistory: []
        },
        DEPT_03_STORYBOARD_LAYOUT_PREVIZ: {
          name: 'Phòng Storyboard, 3D Layout & Quay Phim (ASC Cinematography & Continuity Dept)',
          internationalExpert: 'ASC Director of Photography (DP) & Hollywood Script/Continuity Supervisor',
          internationalStandards: ['ASC Anamorphic Lens Grammar', 'Script Supervisor Eyeline & Axis Match', 'Zero-Credit Pre-Flight Vision Gate'],
          permanentSOPRules: [
            'RULE_ASC_01: Soi kiểm định 100% ảnh First Keyframe & Last Keyframe bằng Gemini Vision trước khi cho phép render video (tiết kiệm 100% Credit nếu phát hiện lỗi).',
            'RULE_ASC_02: Kiểm tra khớp góc nghiêng vũ khí giữa First Frame và Last Frame (ngăn chặn lỗi lưỡi kiếm biến dạng dẻo như cao su ở giây 0:06-0:07).',
            'RULE_ASC_03: Kiểm tra hướng mắt (Eyeline Match) và vị trí Trái/Phải đúng Trục 180 độ trên từng tấm ảnh Keyframe.'
          ],
          learnedRulesHistory: [],
          signOffHistory: []
        },
        DEPT_04_VFX_ANIMATION_VIDEO: {
          name: 'Phòng Diễn Hoạt & Render Video AI (VES Animation & Temporal Physics Dept)',
          internationalExpert: 'VES (Visual Effects Society) Senior Animation & Temporal Physics Supervisor',
          internationalStandards: ['Dual-Keyframe Sandwich Temporal Lock', '1fps Multi-Frame In-Video Physics Audit', 'Zero Dead-Tail Kinetic Trimming'],
          permanentSOPRules: [
            'RULE_VES_01: Bắt buộc khóa Dual-Keyframe Sandwich (First Frame + Last Frame) khi gọi Veo 3.1 I2V.',
            'RULE_VES_02: Sau khi render xong video, bắt buộc trích xuất dải ảnh từng giây (1fps strip) của chính đoạn video đó để Chuyên gia VES soi lỗi phát sinh ở các giây giữa (như lỗi chuôi kiếm ở 0:09 hay lỗi cong mũi kiếm ở 0:07).',
            'RULE_VES_03: Cắt bỏ hoàn toàn phần đuôi tĩnh (Dead-Tail Trimming) chỉ giữ lại cửa sổ chuyển động vàng (Peak Kinetic Window).'
          ],
          learnedRulesHistory: [],
          signOffHistory: []
        },
        DEPT_05_EDITORIAL_COLOR_SOUND_POST: {
          name: 'Phòng Hậu Kỳ: Dựng Phim, Chỉnh Màu DI & Âm Thanh (ACE Editorial, SMPTE DI & EBU R128 Post Dept)',
          internationalExpert: 'ACE Senior Film Editor, CSI Master Colorist & Dolby/EBU R128 Re-Recording Mixer',
          internationalStandards: ['Immutable SHA-256 Shot Node Lock', 'SMPTE Legal Luminance Highlight Roll-Off (YMAX <= 245)', 'EBU R128 / Netflix Broadcast Loudness (-14 to -18 LUFS, TP <= -1.5 dBTP)'],
          permanentSOPRules: [
            'RULE_POST_01: Khóa mã băm SHA-256 cho từng Beat đã được 4 phòng trước nghiệm thu; khi sửa 1 Beat tuyệt đối không động chạm tới các Beat khác.',
            'RULE_POST_02: Áp dụng bộ giới hạn vùng sáng cao (SMPTE Highlight Limiter) để giữ chi tiết lõi tia lửa vàng và kiếm khí.',
            'RULE_POST_03: Chuẩn hóa âm lượng tổng thể theo chuẩn EBU R128 và xuất bảng kiểm định 1fps toàn bộ bộ phim.'
          ],
          learnedRulesHistory: [],
          signOffHistory: []
        }
      }
    };

    this._save(initialData);
    return initialData;
  }

  _save(data = this.data) {
    data.updatedAt = new Date().toISOString();
    fs.mkdirSync(path.dirname(this.storagePath), { recursive: true });
    fs.writeFileSync(this.storagePath, JSON.stringify(data, null, 2));
  }

  recordDefectAndLearnRule(deptKey, beatId, defectType, defectDetail, newPermanentRule) {
    const dept = this.data.departments[deptKey];
    if (!dept) return;

    const entry = {
      timestamp: new Date().toISOString(),
      beatId,
      defectType,
      defectDetail,
      correctiveRuleAdded: newPermanentRule
    };
    dept.learnedRulesHistory.push(entry);

    if (newPermanentRule && !dept.permanentSOPRules.includes(newPermanentRule)) {
      dept.permanentSOPRules.push(newPermanentRule);
    }
    this._save();
  }

  recordSignOff(deptKey, beatId, score, status, expertComment, metrics = {}) {
    const dept = this.data.departments[deptKey];
    if (!dept) return;

    dept.signOffHistory.push({
      timestamp: new Date().toISOString(),
      beatId,
      expert: dept.internationalExpert,
      score,
      status,
      expertComment,
      metrics
    });
    this._save();
  }

  getDepartmentRules(deptKey) {
    return this.data.departments[deptKey]?.permanentSOPRules || [];
  }

  exportFullReport(outputPath) {
    fs.writeFileSync(outputPath, JSON.stringify(this.data, null, 2));
    return outputPath;
  }
}

