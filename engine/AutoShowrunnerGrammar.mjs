/**
 * 🧠 AUTO-SHOWRUNNER GRAMMAR COMPILER (DÀNH CHO NGƯỜI DÙNG KHÔNG BIẾT ĐẠO DIỄN)
 * ============================================================================
 * Biến 1 câu ý tưởng đơn giản của người dùng thường thành Bản Thiết Kế 6-Shot Hollywood
 * (mỗi Shot quay 8.0s bằng Dual-Keyframe nhưng chỉ cắt lấy 4.0s - 6.0s "Khoảnh khắc Vàng")
 * để tổng thời lượng đạt đúng ~30-32 giây không bao giờ bị lặp chuyển động hay sai rắc-cô.
 */

export const HOLLYWOOD_6SHOT_30S_GRAMMAR = [
  {
    slot: 1,
    role: 'ESTABLISHING_OTS_STANDOFF',
    cameraLens: '35mm Anamorphic Wide Over-The-Shoulder shot, deep volumetric perspective',
    recommendedTrim: [0.0, 6.2],
    description: 'Thiết lập không gian đối đầu: Nhân vật chính ở tiền cảnh trái nhìn về phía Quái vật khổng lồ ở trung tâm bối cảnh.',
  },
  {
    slot: 2,
    role: 'INSERT_ECU_WEAPON_IGNITION',
    cameraLens: '85mm Anamorphic Extreme Close-Up (ECU), shallow depth-of-field elliptical bokeh',
    recommendedTrim: [3.4, 8.0],
    description: 'Cận cảnh đặc tả ánh mắt nhân vật chính và động tác kích hoạt vũ khí lên thế thủ dứt khoát 1 lần duy nhất.',
  },
  {
    slot: 3,
    role: 'LOW_ANGLE_CREATURE_MASS_CHARGE',
    cameraLens: '24mm Ultra-Wide Low-Angle ground-level camera with heavy impact shake',
    recommendedTrim: [0.0, 4.0],
    description: 'Góc máy sát mặt đất ngước lên đặc tả sức nặng hàng chục tấn của Quái vật giẫm chân lao tới (cắt đúng đỉnh va chạm trước khi AI kịp lùi lại).',
  },
  {
    slot: 4,
    role: 'DYNAMIC_TRACKING_HERO_SPRINT',
    cameraLens: '35mm Low-Tracking Action Camera moving parallel with the hero',
    recommendedTrim: [0.2, 6.0],
    description: 'Máy quay lướt theo nhân vật chính (giữ nguyên 100% đầu trần/trang phục gốc) lao xuyên qua mưa và vũng nước, vung vũ khí phát sáng về phía trước.',
  },
  {
    slot: 5,
    role: 'APEX_CLASH_IMPACT',
    cameraLens: '50mm Anamorphic Medium-Wide Hero Confrontation profile shot (180-degree axis locked)',
    recommendedTrim: [0.2, 6.0],
    description: 'Đỉnh điểm giao tranh: Nhân vật chính bên trái chém vũ khí va chạm trực diện với hàm Quái vật bên phải, bắn tung tia lửa điện (khóa chặt 3 Mỏ Neo chống mọc mũ/đạo cụ thừa).',
  },
  {
    slot: 6,
    role: 'AFTERMATH_HERO_POSE',
    cameraLens: '85mm Anamorphic Medium Close-Up Hero Aftermath shot amidst rising white steam',
    recommendedTrim: [0.4, 5.9],
    description: 'Hậu quả & Kết màn: Khói trắng bốc lên giữa mưa đêm, nhân vật chính hạ vũ khí đang bốc khói trong tư thế chiến thắng.',
  },
];

