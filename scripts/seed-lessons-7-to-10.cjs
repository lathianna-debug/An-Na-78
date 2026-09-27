const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// 1. Reset student data, submissions, answers as requested by user to allow fresh upload of school roster
db.students = [];
db.submissions = [];
db.answers = [];

console.log('Cleared students, submissions, and answers for fresh school roster upload.');

// 2. Define or update Assignments 8, 9, 10, 11
const newAssignments = [
  {
    id: 'assign-8',
    lessonId: 'lesson-7',
    title: 'Bài 7: Thích ứng với thay đổi — Thử thách: “UPDATE BẢN THÂN 9.0”',
    type: 'bai_tap',
    code: 'GDCD9-B7',
    description: 'Phiếu học tập GDCD 9: Bài 7. Thích ứng với thay đổi — Thử thách: “UPDATE BẢN THÂN 9.0”. Nhiệm vụ: NHẬN RA → BÌNH TĨNH → ĐIỀU CHỈNH → TIẾP TỤC TIẾN LÊN. 🌬️ Ta không phải lúc nào cũng đổi được “hướng gió”, nhưng có thể học cách điều chỉnh “cánh buồm”.',
    durationMinutes: 15,
    isLocked: false,
    order: 1,
    reviewMode: 'NO_REVIEW',
    createdAt: '2026-09-21T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assign-9',
    lessonId: 'lesson-8',
    title: 'Bài 8: Tiêu dùng thông minh — Thử thách: “SMART SHOPPER – ĐỪNG ĐỂ CHIẾC VÍ QUYẾT ĐỊNH TRONG 3 GIÂY!”',
    type: 'bai_tap',
    code: 'GDCD9-B8',
    description: 'Phiếu học tập GDCD 9: Bài 8. Tiêu dùng thông minh — Thử thách: “SMART SHOPPER – ĐỪNG ĐỂ CHIẾC VÍ QUYẾT ĐỊNH TRONG 3 GIÂY!”. Hành trình: NHẬN RA → KIỂM TRA → SO SÁNH → QUYẾT ĐỊNH. Người tiêu dùng thông minh biết mình đang mua gì – vì sao mua – và mua như thế nào.',
    durationMinutes: 15,
    isLocked: false,
    order: 1,
    reviewMode: 'NO_REVIEW',
    createdAt: '2026-09-21T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assign-10',
    lessonId: 'lesson-9',
    title: 'Bài 9: Vi phạm pháp luật và trách nhiệm pháp lí — Thử thách: “PHÒNG ĐIỀU TRA PHÁP LÍ 9A”',
    type: 'bai_tap',
    code: 'GDCD9-B9',
    description: 'Phiếu học tập GDCD 9: Bài 9. Vi phạm pháp luật và trách nhiệm pháp lí — Nhiệm vụ: “PHÒNG ĐIỀU TRA PHÁP LÍ 9A”. Hành trình: NHẬN DIỆN → PHÂN LOẠI → GHÉP HẬU QUẢ → BIẾT TUÂN THỦ. ⚖️ Đừng phán đoán bằng cảm tính, hãy tìm đúng dấu hiệu pháp lí.',
    durationMinutes: 15,
    isLocked: false,
    order: 1,
    reviewMode: 'NO_REVIEW',
    createdAt: '2026-09-21T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'assign-11',
    lessonId: 'lesson-10',
    title: 'Bài 10: Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “STARTUP 15 TUỔI – MỞ SHOP NHƯNG ĐỪNG VƯỢT VẠCH!”',
    type: 'bai_tap',
    code: 'GDCD9-B10',
    description: 'Phiếu học tập GDCD 9: Bài 10. Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “STARTUP 15 TUỔI – MỞ SHOP NHƯNG ĐỪNG VƯỢT VẠCH!”. Hành trình tư duy: HIỂU QUYỀN → NHẬN RA GIỚI HẠN → HIỂU NGHĨA VỤ → BIẾT HÀNH ĐỘNG.',
    durationMinutes: 15,
    isLocked: false,
    order: 1,
    reviewMode: 'NO_REVIEW',
    createdAt: '2026-09-21T08:00:00.000Z',
    updatedAt: new Date().toISOString(),
  },
];

newAssignments.forEach(newAssign => {
  const existingIndex = db.assignments.findIndex(a => a.id === newAssign.id);
  if (existingIndex >= 0) {
    db.assignments[existingIndex] = { ...db.assignments[existingIndex], ...newAssign };
  } else {
    db.assignments.push(newAssign);
  }
});

// 3. Remove any old questions for assign-8, assign-9, assign-10, assign-11
db.questions = db.questions.filter(q => !['assign-8', 'assign-9', 'assign-10', 'assign-11'].includes(q.assignmentId));

// ---------------------------------------------------------------------------
// QUESTIONS FOR BÀI 7 (assign-8)
// ---------------------------------------------------------------------------
const qLesson7 = [
  {
    id: 'q-7-1',
    assignmentId: 'assign-8',
    order: 1,
    content: '🔍 LEVEL 1 — “CHANGE DETECTOR” (1 phút | Chọn đáp án)\n\nLan chuyển sang một lớp mới vì gia đình thay đổi nơi ở. Những ngày đầu, Lan chưa quen bạn bè và cách học của lớp.\n👉 Cách ứng xử nào thể hiện khả năng thích ứng tốt nhất?\n\n🔐 MẬT MÃ: Thích ứng không phải chờ hoàn cảnh thay đổi theo mình, mà biết ____________ bản thân phù hợp.',
    options: [
      { key: 'A', text: '“Mình ghét mọi thứ ở đây, mình sẽ không tham gia bất cứ hoạt động gì cả.”' },
      { key: 'B', text: '“Mình phải lập tức thấy vui như chưa từng có chuyện gì xảy ra.”' },
      { key: 'C', text: '“Mình chưa quen, nhưng sẽ tìm hiểu môi trường mới, kết bạn và điều chỉnh cách học.”' },
      { key: 'D', text: '“Mọi người trong lớp mới phải thay đổi để giống như lớp cũ của mình.”' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. “Mình chưa quen, nhưng sẽ tìm hiểu môi trường mới, kết bạn và điều chỉnh cách học.”\n🔐 Mật mã: ĐIỀU CHỈNH. Người có khả năng thích ứng tốt luôn biết chủ động quan sát, làm quen với môi trường mới và linh hoạt điều chỉnh hành vi của bản thân thay vì thụ động hay đòi hỏi hoàn cảnh phải chiều theo ý mình.',
    points: 0.7
  },
  {
    id: 'q-7-2',
    assignmentId: 'assign-8',
    order: 2,
    content: '🎒 LEVEL 2 — “BA LÔ THÍCH ỨNG” (1 phút | Kéo – thả / Chọn hành trang)\n\nCho các thẻ sau:\n1. 💗 Chấp nhận thực tế\n2. 🧘 Giữ bình tĩnh\n3. 🔍 Tìm hiểu tình hình\n4. 🔄 Điều chỉnh cách làm\n5. 🤝 Tìm kiếm hỗ trợ khi cần\n6. 🙈 Giả vờ không có thay đổi\n7. 😡 Đổ lỗi cho mọi người\n8. 🚪 Bỏ cuộc ngay\n\n👉 Chọn 5 thẻ HỮU ÍCH mang vào ba lô và 3 thẻ CẦN ĐỂ LẠI:',
    options: [
      { key: 'A', text: '🎒 MANG THEO: Chấp nhận thực tế, Giữ bình tĩnh, Tìm hiểu tình hình, Điều chỉnh cách làm, Tìm kiếm hỗ trợ | 🗑️ ĐỂ LẠI: Giả vờ không thay đổi, Đổ lỗi, Bỏ cuộc' },
      { key: 'B', text: '🎒 MANG THEO: Giả vờ không thay đổi, Giữ bình tĩnh, Đổ lỗi, Bỏ cuộc, Điều chỉnh cách làm | 🗑️ ĐỂ LẠI: Chấp nhận thực tế, Tìm hiểu tình hình, Tìm hỗ trợ' },
      { key: 'C', text: '🎒 MANG THEO: Chấp nhận thực tế, Đổ lỗi, Tìm hiểu tình hình, Bỏ cuộc, Tìm hỗ trợ | 🗑️ ĐỂ LẠI: Giữ bình tĩnh, Điều chỉnh cách làm, Giả vờ' },
      { key: 'D', text: '🎒 MANG THEO: Bỏ cuộc, Giả vờ không thay đổi, Đổ lỗi, Điều chỉnh cách làm, Giữ bình tĩnh | 🗑️ ĐỂ LẠI: Chấp nhận thực tế, Tìm hiểu, Tìm hỗ trợ' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Mang theo: 1, 2, 3, 4, 5. Để lại: 6, 7, 8.\nBiện pháp thích ứng hiệu quả: Chấp nhận sự thay đổi là tất yếu, làm chủ cảm xúc trước biến cố và chủ động tìm cách giải quyết vấn đề tích cực; khi vượt quá khả năng cần tìm kiếm sự hỗ trợ đáng tin cậy.',
    points: 0.7
  },
  {
    id: 'q-7-3',
    assignmentId: 'assign-8',
    order: 3,
    content: '🌦️ LEVEL 3 — “ĐỔI ĐƯỢC / KHÔNG ĐỔI ĐƯỢC” (1 phút | Phân loại quyền kiểm soát)\n\nHôm nay kế hoạch của Minh bị ảnh hưởng bởi 6 yếu tố:\nA. Trời bất ngờ mưa lớn.\nB. Cách Minh sắp xếp lại lịch học.\nC. Một hoạt động của trường đột xuất đổi giờ.\nD. Thái độ của Minh trước thay đổi.\nE. Cách Minh tìm phương án khác.\nF. Việc người khác đột ngột thay đổi quyết định.\n\n👉 Phân loại chuẩn vào 2 nhóm:\n💡 MẬT MÃ: Đừng tiêu hết năng lượng vào điều mình không thể kiểm soát.',
    options: [
      { key: 'A', text: '🔒 KHÔNG HOÀN TOÀN KIỂM SOÁT: A – C – F | 🎮 CÓ THỂ CHỦ ĐỘNG ĐIỀU CHỈNH: B – D – E' },
      { key: 'B', text: '🔒 KHÔNG HOÀN TOÀN KIỂM SOÁT: B – D – E | 🎮 CÓ THỂ CHỦ ĐỘNG ĐIỀU CHỈNH: A – C – F' },
      { key: 'C', text: '🔒 KHÔNG HOÀN TOÀN KIỂM SOÁT: A – B – C | 🎮 CÓ THỂ CHỦ ĐỘNG ĐIỀU CHỈNH: D – E – F' },
      { key: 'D', text: '🔒 KHÔNG HOÀN TOÀN KIỂM SOÁT: D – E – F | 🎮 CÓ THỂ CHỦ ĐỘNG ĐIỀU CHỈNH: A – B – C' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Không hoàn toàn kiểm soát: A, C, F (thời tiết, quyết định nhà trường, hành vi của người khác). Có thể chủ động điều chỉnh: B, D, E (cách sắp xếp lịch, thái độ của bản thân, phương án thay thế).',
    points: 0.7
  },
  {
    id: 'q-7-4',
    assignmentId: 'assign-8',
    order: 4,
    content: '🚦 LEVEL 4 — “ĐÚNG HAY BẪY?” (1 phút | Đúng/Sai)\n\nĐánh giá tính Đúng (✓) hoặc Sai (✗) của 5 nhận định sau:\n1. Thay đổi là điều tất yếu có thể xảy ra trong cuộc sống.\n2. Thích ứng nghĩa là không bao giờ được buồn hay lo lắng.\n3. Khi hoàn cảnh thay đổi, có thể cần điều chỉnh cách làm.\n4. Chấp nhận thay đổi đồng nghĩa với buông xuôi, phó mặc.\n5. Có thể tìm kiếm sự hỗ trợ nếu vấn đề vượt quá khả năng của mình.\n\n👉 Kết quả đánh giá từ 1 đến 5 là:',
    options: [
      { key: 'A', text: '1-Đúng (✓) — 2-Sai (✗) — 3-Đúng (✓) — 4-Sai (✗) — 5-Đúng (✓)' },
      { key: 'B', text: '1-Đúng (✓) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Sai (✗) — 5-Đúng (✓)' },
      { key: 'C', text: '1-Sai (✗) — 2-Sai (✗) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'D', text: '1-Đúng (✓) — 2-Sai (✗) — 3-Sai (✗) — 4-Sai (✗) — 5-Đúng (✓)' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1 ✓ – 2 ✗ – 3 ✓ – 4 ✗ – 5 ✓.\n- Nhận định 2 Sai vì có cảm xúc buồn/lo lắng là tự nhiên của con người, thích ứng là làm chủ cảm xúc chứ không phải triệt tiêu cảm xúc.\n- Nhận định 4 Sai vì chấp nhận là nhìn thẳng thực tế để hành động, không phải buông xuôi.',
    points: 0.7
  },
  {
    id: 'q-7-5',
    assignmentId: 'assign-8',
    order: 5,
    content: '🤖 LEVEL 5 — “AI ĐANG HIỂU SAI!” (1 phút | Tìm điểm chưa hợp lí)\n\nAI tư vấn tâm lí phát biểu:\n🤖 “Người thích ứng tốt là người không bao giờ buồn, lo lắng hay thất vọng trước bất cứ thay đổi nào.”\n\n🚨 Hãy chọn bản vá tư duy chuẩn xác nhất:\n🧠 NHỚ: THÍCH ỨNG ≠ KHÔNG CÓ CẢM XÚC',
    options: [
      { key: 'A', text: 'Muốn thích ứng phải loại bỏ hoàn toàn mọi cảm xúc tiêu cực và giả vờ không quan tâm.' },
      { key: 'B', text: 'Có cảm xúc trước thay đổi là bình thường; điều quan trọng là biết làm chủ cảm xúc và tìm cách ứng phó phù hợp.' },
      { key: 'C', text: 'Khi gặp chuyện buồn thì nên giấu kín, giả vờ như không có chuyện gì xảy ra.' },
      { key: 'D', text: 'Người thích ứng tốt là người có thể tự làm mọi việc mà không bao giờ cần sự giúp đỡ.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Có cảm xúc trước thay đổi là bình thường; điều quan trọng là biết làm chủ cảm xúc và tìm cách ứng phó phù hợp.\nNão bộ luôn có phản ứng cảm xúc trước sự xáo trộn, bản lĩnh thích ứng thể hiện ở việc bình tâm nhận diện và điều hướng hành vi tích cực.',
    points: 0.7
  },
  {
    id: 'q-7-6',
    assignmentId: 'assign-8',
    order: 6,
    content: '💥 LEVEL 6 — “KẾ HOẠCH A BỊ HỦY!” (1 phút | Chọn đáp án xử lí tình huống)\n\nNhóm của Vy chuẩn bị thuyết trình bằng máy chiếu. Đến giờ học, máy chiếu của lớp bất ngờ gặp sự cố hỏng hóc.\n👉 Nhóm của Vy nên xử lí thế nào?\n\n🔐 MẬT MÃ: KẾ HOẠCH A HỎNG ≠ MỤC TIÊU HỎNG',
    options: [
      { key: 'A', text: 'Hủy bỏ bài thuyết trình và từ chối báo cáo vì không có máy chiếu.' },
      { key: 'B', text: 'Trách móc nhà trường và ngồi im chờ đến hết tiết học.' },
      { key: 'C', text: 'Bình tĩnh, chuyển sang phương án trình bày bằng bảng/tài liệu đã có và điều chỉnh cách thuyết trình sinh động.' },
      { key: 'D', text: 'Đòi cô giáo cho điểm tối đa luôn vì sự cố không phải do lỗi của nhóm.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Bình tĩnh, chuyển sang phương án trình bày bằng bảng/tài liệu đã có và điều chỉnh cách thuyết trình.\nKhi công cụ hỗ trợ gặp trục trặc, người linh hoạt sẽ kích hoạt kế hoạch B (dùng sơ đồ trên bảng, tài liệu giấy, hỏi đáp trực tiếp) để hoàn thành mục tiêu bài báo cáo.',
    points: 0.7
  },
  {
    id: 'q-7-7',
    assignmentId: 'assign-8',
    order: 7,
    content: '🧩 LEVEL 7 — “GHÉP ĐÚNG PHẢN XẠ” (1 phút | Nối cặp tình huống và phản xạ)\n\nNối mỗi tình huống thay đổi với phản xạ hành động phù hợp:\n\n• TÌNH HUỐNG:\n1. Chuyển sang môi trường học mới\n2. Kết quả học tập môn Toán bị giảm sút\n3. Kế hoạch dã ngoại đột ngột không thực hiện được do thời tiết\n4. Gặp biến cố lớn vượt quá khả năng giải quyết của bản thân\n\n• PHẢN XẠ PHÙ HỢP:\nA. Tìm phương án thay thế khác hữu ích\nB. Chủ động làm quen, tìm hiểu nội quy và môi trường mới\nC. Tìm rõ nguyên nhân và điều chỉnh phương pháp học tập\nD. Tìm người lớn đáng tin cậy để nhận sự hỗ trợ\n\n👉 Mật mã nối đúng là:',
    options: [
      { key: 'A', text: '1–B ; 2–C ; 3–A ; 4–D' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–C ; 2–D ; 3–A ; 4–B' },
      { key: 'D', text: '1–B ; 2–A ; 3–D ; 4–C' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–B ; 2–C ; 3–A ; 4–D.\n- Môi trường mới → Làm quen, tìm hiểu (B)\n- Điểm số giảm → Tìm nguyên nhân & đổi cách học (C)\n- Kế hoạch hỏng → Phương án thay thế (A)\n- Vượt khả năng → Nhờ hỗ trợ kịp thời (D)',
    points: 0.7
  },
  {
    id: 'q-7-8',
    assignmentId: 'assign-8',
    order: 8,
    content: '🧠 LEVEL 8 — “4 BƯỚC UPDATE” (1 phút | Sắp xếp quy trình thích ứng)\n\nKhi một thay đổi bất ngờ xảy ra, 4 bước tư duy bị xáo trộn:\nA. Chọn cách giải quyết tích cực, phù hợp với hoàn cảnh mới.\nB. Giữ bình tĩnh và làm chủ cảm xúc của bản thân.\nC. Nhận diện và chấp nhận điều thực tế đã thay đổi.\nD. Đánh giá xem mình có thể làm gì và cần hỗ trợ gì từ ai.\n\n🔑 CÔNG THỨC: CHẤP NHẬN → BÌNH TĨNH → ĐÁNH GIÁ → HÀNH ĐỘNG\n👉 Trình tự sắp xếp chuẩn xác là:',
    options: [
      { key: 'A', text: 'C → B → D → A (Nhận diện chấp nhận → Bình tĩnh làm chủ → Đánh giá phương án → Hành động giải quyết)' },
      { key: 'B', text: 'A → B → C → D' },
      { key: 'C', text: 'B → C → A → D' },
      { key: 'D', text: 'D → A → B → C' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. C → B → D → A.\nQuy trình thích ứng khoa học: 1. Nhận diện chấp nhận sự thật đã thay đổi (C) → 2. Bình tĩnh làm chủ cảm xúc (B) → 3. Đánh giá nguồn lực và sự hỗ trợ (D) → 4. Hành động tích cực (A).',
    points: 0.7
  },
  {
    id: 'q-7-9',
    assignmentId: 'assign-8',
    order: 9,
    content: '⚡ LEVEL 9 — “CHẤP NHẬN ≠ BUÔNG XUÔI” (1 phút | Phân loại thái độ sống)\n\nPhân loại 4 câu nói sau vào đúng vùng:\nA. “Chuyện đã xảy ra rồi, mình sẽ tìm cách phù hợp để tiếp tục bước tiếp.”\nB. “Thôi, thế nào cũng được, chẳng cần cố gắng làm gì nữa.”\nC. “Mình chưa thay đổi được việc này ngay, nhưng mình có thể thay đổi cách ứng phó của mình.”\nD. “Không diễn ra đúng như ý muốn ban đầu của mình thì mình bỏ luôn!”\n\n💥 CÂU CHỐT: CHẤP NHẬN THỰC TẾ ≠ ____________ NỖ LỰC',
    options: [
      { key: 'A', text: '🌱 CHẤP NHẬN TÍCH CỰC: A – C | 💤 BUÔNG XUÔI: B – D (Mật mã: TỪ BỎ / NGỪNG)' },
      { key: 'B', text: '🌱 CHẤP NHẬN TÍCH CỰC: B – D | 💤 BUÔNG XUÔI: A – C' },
      { key: 'C', text: '🌱 CHẤP NHẬN TÍCH CỰC: A – B | 💤 BUÔNG XUÔI: C – D' },
      { key: 'D', text: '🌱 CHẤP NHẬN TÍCH CỰC: C – D | 💤 BUÔNG XUÔI: A – B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Chấp nhận tích cực: A, C. Buông xuôi: B, D.\n💥 Mật mã: TỪ BỎ / NGỪNG nỗ lực. Chấp nhận thực tế là điểm khởi đầu cho hành động mới, khác hoàn toàn với thái độ buông xuôi, phó mặc hay bỏ cuộc.',
    points: 0.7
  },
  {
    id: 'q-7-10',
    assignmentId: 'assign-8',
    order: 10,
    content: '📱 LEVEL 10 — “GROUP CHAT BẤT NGỜ” (1,5 phút | Giải quyết tình huống nhóm)\n\nNhóm của Nam đã phân công dự án học tập. Tối trước ngày hoàn thiện nộp cô giáo, một thành viên nhắn tin báo bị ốm sốt cao và không thể hoàn thành phần việc của mình.\nNam lập tức nhắn vào nhóm: “Thế là xong! Kế hoạch hỏng hết rồi. Không làm nữa!”\n\n👉 Nếu em là một thành viên trong nhóm, em sẽ lựa chọn cách ứng xử nào?',
    options: [
      { key: 'A', text: 'Đồng ý với Nam hủy bỏ dự án và chịu điểm kém cả nhóm.' },
      { key: 'B', text: 'Trách móc và đổ lỗi cho bạn bị ốm vì làm ảnh hưởng đến thành tích chung.' },
      { key: 'C', text: 'Bình tĩnh kiểm tra phần việc còn lại, động viên bạn dưỡng bệnh, điều chỉnh phân công giữa các bạn còn lại và đề nghị giáo viên hỗ trợ nếu cần thiết.' },
      { key: 'D', text: 'Âm thầm làm thay tất cả một mình thâu đêm dù không đủ sức khỏe và thời gian.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Bình tĩnh xem phần việc còn lại, điều chỉnh phân công và đề nghị hỗ trợ nếu cần.\nĐây là kỹ năng thích ứng và làm việc nhóm chuẩn mực: cảm thông với biến cố bất khả kháng của bạn, tái cơ cấu nhiệm vụ và tìm sự trợ giúp khi cần thiết.',
    points: 0.7
  },
  {
    id: 'q-7-11',
    assignmentId: 'assign-8',
    order: 11,
    content: '🕵️ LEVEL 11 — “TÍCH CỰC GIẢ” (1 phút | Tìm điểm chưa hợp lí)\n\nMai vừa gặp một sự cố thay đổi khiến em ấy rất buồn và rơi nước mắt.\nMột bạn trong lớp chạy lại bảo Mai: “Đừng buồn nữa! Phải tích cực lên chứ! Cứ cười lên là mọi chuyện xong hết!”\n\n👉 Điểm chưa hợp lí trong lời khuyên của bạn là gì?\n💡 NHỚ: TÍCH CỰC ≠ GIẢ VỜ MỌI THỨ ĐỀU ỔN',
    options: [
      { key: 'A', text: 'Mai hoàn toàn không được phép buồn khi gặp sự cố.' },
      { key: 'B', text: 'Thích ứng không phải là phủ nhận hay kìm nén cảm xúc; cần tôn trọng cảm xúc, bình tĩnh chấp nhận và từng bước tìm cách ứng phó lành mạnh.' },
      { key: 'C', text: 'Chỉ cần gượng cười thì mọi rắc rối sẽ tự động biến mất kì diệu.' },
      { key: 'D', text: 'Gặp sự cố thì tuyệt đối không nên chia sẻ hay tâm sự với bất kì ai.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Thích ứng không phải phủ nhận cảm xúc; cần bình tĩnh, chấp nhận cảm xúc và từng bước tìm cách ứng phó.\n"Tích cực độc hại" (toxic positivity) là ép buộc bản thân phải vui vẻ và kìm nén nỗi buồn. Tích cực thật sự là cho phép mình buồn trong chốc lát, sau đó bình tâm đứng dậy tìm giải pháp.',
    points: 0.7
  },
  {
    id: 'q-7-12',
    assignmentId: 'assign-8',
    order: 12,
    content: '🎯 LEVEL 12 — “MỤC TIÊU HAY CON ĐƯỜNG?” (1 phút | Chọn đáp án tư duy)\n\nHà đặt mục tiêu thi đỗ điểm cao môn Tiếng Anh vào lớp 10. Tuy nhiên, cách học thuộc lòng ngữ pháp cũ của Hà không còn đem lại hiệu quả trong các đề thi mới.\n\n👉 Hà nên làm gì?\n🚀 MẬT MÃ LỚN: CÓ THỂ THAY ĐỔI ____________ MÀ KHÔNG CẦN TỪ BỎ ____________.',
    options: [
      { key: 'A', text: 'Giữ nguyên cách học cũ vì thay đổi nghĩa là thừa nhận mình thất bại.' },
      { key: 'B', text: 'Bỏ luôn mục tiêu thi vào trường chuyên/lớp chọn tiếng Anh.' },
      { key: 'C', text: 'Kiên định giữ mục tiêu nhưng linh hoạt thử các cách học, phương pháp tiếp cận mới phù hợp hơn.' },
      { key: 'D', text: 'Không làm gì cả, chờ đợi đến khi đề thi tự trở nên dễ hơn.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Giữ mục tiêu nhưng thử cách học khác phù hợp hơn.\n🚀 Mật mã: CON ĐƯỜNG / CÁCH LÀM – MỤC TIÊU. Người thành công kiên định với mục tiêu lý tưởng, nhưng luôn mềm dẻo, linh hoạt thay đổi phương pháp và con đường tiếp cận khi hoàn cảnh đòi hỏi.',
    points: 0.7
  },
  {
    id: 'q-7-13',
    assignmentId: 'assign-8',
    order: 13,
    content: '🆘 LEVEL 13 — “TỰ GIẢI QUYẾT HAY GỌI HỖ TRỢ?” (1 phút | Phân loại tình huống)\n\nĐánh giá 4 tình huống sau đây theo hướng xử lí phù hợp:\n1. Lịch học thêm bất ngờ đổi giờ sang ngày khác\n2. Những ngày đầu chưa quen bạn mới ở lớp\n3. Một biến cố gia đình lớn khiến bản thân hoang mang, mất phương hướng\n4. Gặp vấn đề bạo lực hoặc áp lực tâm lí vượt quá khả năng chịu đựng của bản thân\n\n🔑 MẬT MÃ: BIẾT NHỜ GIÚP ĐỠ CŨNG LÀ MỘT KĨ NĂNG THÍCH ỨNG.\n👉 Nhận định phân loại đúng là:',
    options: [
      { key: 'A', text: 'Tình huống 1 & 2: Có thể chủ động tự xử lí | Tình huống 3 & 4: Nên chủ động tìm kiếm sự hỗ trợ từ người lớn đáng tin cậy' },
      { key: 'B', text: 'Tất cả 4 tình huống đều phải tự mình chịu đựng một mình' },
      { key: 'C', text: 'Tất cả 4 tình huống đều phải nhờ người khác làm hộ' },
      { key: 'D', text: 'Tình huống 1 & 3: Tự xử lí | Tình huống 2 & 4: Nhờ người khác' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Với những thay đổi thông thường trong tầm tay (1, 2), em có thể tự sắp xếp, kết bạn. Nhưng khi gặp biến cố lớn hoặc vấn đề vượt quá khả năng (3, 4), biết tìm kiếm sự hỗ trợ từ cha mẹ, thầy cô, chuyên gia tâm lí chính là biểu hiện của kĩ năng thích ứng khôn ngoan.',
    points: 0.6
  },
  {
    id: 'q-7-14',
    assignmentId: 'assign-8',
    order: 14,
    content: '🏆 FINAL BOSS — “30 GIÂY CỨU KẾ HOẠCH” (1,5 phút | Vận dụng tình huống thực tế)\n\nSáng mai lớp có buổi hoạt động trải nghiệm ngoài trời mà em rất mong chờ suốt tháng qua. Bất ngờ tối nay nhận được thông báo từ nhà trường:\n🌧️ “Do thời tiết bão mưa lớn ngập lụt, hoạt động ngoài trời bị hủy và chuyển sang sinh hoạt chủ đề trong hội trường.”\n\n👉 Chuỗi phản xạ thích ứng chuẩn xác nhất là:\n🌟 CÔNG THỨC: CẢM XÚC → CHẤP NHẬN → ĐIỀU CHỈNH → TIẾP TỤC',
    options: [
      { key: 'A', text: '① Cho phép mình tiếc nuối trong giây lát → ② Chấp nhận thông tin thời tiết thực tế → ③ Chủ động tìm hiểu và chuẩn bị trang phục, ý tưởng cho hoạt động trong hội trường.' },
      { key: 'B', text: '① Tức giận than thở cả đêm → ② Tẩy chay không tham gia hoạt động hội trường → ③ Đăng bài bức xúc lên mạng xã hội.' },
      { key: 'C', text: '① Giả vờ vui mừng hớn hở → ② Không chuẩn bị gì cả → ③ Chờ đến sáng mai rồi tính.' },
      { key: 'D', text: '① Bỏ học ngày mai → ② Ở nhà ngủ → ③ Trách nhà trường hủy lịch.' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Cảm xúc thật (tiếc nuối) → Chấp nhận thực tế thời tiết an toàn → Điều chỉnh hành động và chuẩn bị chu đáo cho phương án mới trong hội trường.',
    points: 0.6
  },
  {
    id: 'q-7-15',
    assignmentId: 'assign-8',
    order: 15,
    content: '❤️ EXIT TICKET — “UPDATE 1% BẢN THÂN” (Cam kết hành vi)\n\n🌬️ KHÔNG PHẢI MỌI “HƯỚNG GIÓ” ĐỀU DO TA CHỌN. NHƯNG TA CÓ THỂ HỌC CÁCH ĐIỀU CHỈNH CÁNH BUỒM.\n\n👉 Chọn 01 phản xạ vàng em quyết tâm rèn luyện mỗi khi gặp việc không như ý:',
    options: [
      { key: 'A', text: '🌱 DỪNG LẠI & BÌNH TÂM: Không phản ứng vội khi tức giận; tự hỏi: “Điều gì mình còn kiểm soát được?” và tìm phương án thay thế tích cực!' },
      { key: 'B', text: 'Cố chấp đòi mọi việc phải theo ý mình, nếu không thì bỏ cuộc.' },
      { key: 'C', text: 'Đổ lỗi cho hoàn cảnh và những người xung quanh.' },
      { key: 'D', text: 'Kìm nén mọi cảm xúc tiêu cực và giả vờ không có chuyện gì xảy ra.' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Mật khẩu xuất cảnh: Luôn làm chủ cảm xúc, tập trung vào vòng tròn ảnh hưởng (điều mình kiểm soát được) và sẵn sàng tìm kiếm giải pháp linh hoạt.',
    points: 0.6
  }
];

// ---------------------------------------------------------------------------
// QUESTIONS FOR BÀI 8 (assign-9)
// ---------------------------------------------------------------------------
const qLesson8 = [
  {
    id: 'q-8-1',
    assignmentId: 'assign-9',
    order: 1,
    content: '⚡ LEVEL 1 — “CẦN HAY MUỐN?” (45 giây | Phân loại nhu cầu)\n\nMai có 300.000 đồng và đang cần mua đồ dùng học tập cho năm học mới:\nA. Bút đã hết mực.\nB. Cuốn sổ thứ 6 vì bìa đang “hot”.\nC. Thước cũ đã hỏng.\nD. Móc khóa giống thần tượng.\nE. Tài liệu cần cho môn học.\n\n👉 Hãy phân loại các thẻ vào 2 vùng CẦN ƯU TIÊN và MUỐN – CÂN NHẮC:\n🔐 MẬT MÃ: “THÍCH” chưa chắc = “__________”.',
    options: [
      { key: 'A', text: '🎯 CẦN ƯU TIÊN: A – C – E | 💗 MUỐN – CÂN NHẮC: B – D (Mật mã: CẦN)' },
      { key: 'B', text: '🎯 CẦN ƯU TIÊN: B – D | 💗 MUỐN – CÂN NHẮC: A – C – E' },
      { key: 'C', text: '🎯 CẦN ƯU TIÊN: A – B – C | 💗 MUỐN – CÂN NHẮC: D – E' },
      { key: 'D', text: '🎯 CẦN ƯU TIÊN: C – D – E | 💗 MUỐN – CÂN NHẮC: A – B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Cần ưu tiên: A – C – E (bút hết mực, thước hỏng, tài liệu học). Muốn cân nhắc: B – D (sổ thứ 6, móc khóa theo trend).\n🔐 Mật mã: CẦN. Người tiêu dùng thông minh luôn phân định rõ giữa "Nhu cầu thiết yếu" (Need) và "Sở thích nhất thời" (Want).',
    points: 0.7
  },
  {
    id: 'q-8-2',
    assignmentId: 'assign-9',
    order: 2,
    content: '🔥 LEVEL 2 — “SALE 70%!” (1 phút | Chọn đáp án & Bẫy IQ)\n\nMột chiếc áo giá gốc 500.000đ, đang giảm sốc 70% (còn 150.000đ).\nEm thấy rất rẻ nhưng trong tủ đồ đã có nhiều áo tương tự và bản thân không hề có nhu cầu mua thêm.\n\n👉 Cách xử lí thông minh nhất và bản chất của việc chi tiền này là:\n💥 GIẢM GIÁ ≠ TIẾT KIỆM nếu món đồ không cần thiết.',
    options: [
      { key: 'A', text: 'Cách xử lí: Mua ngay để tiết kiệm 350.000đ | Bản chất: Tiết kiệm được tiền' },
      { key: 'B', text: 'Cách xử lí: Mua hai chiếc vì hiếm khi có đợt giảm sâu | Bản chất: Tiết kiệm 700.000đ' },
      { key: 'C', text: 'Cách xử lí: Không mua nếu không có nhu cầu thực sự | Bản chất: Bỏ ra 150.000đ mua thứ không cần là đã CHI 150.000đ, chứ không phải tiết kiệm 350.000đ' },
      { key: 'D', text: 'Cách xử lí: Rủ bạn mua cùng để đỡ phí mã giảm giá | Bản chất: Tiết kiệm thông minh' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không mua nếu không có nhu cầu thực sự; Nếu bỏ 150.000đ mua thứ không cần, em đã CHI 150.000đ chứ không hề tiết kiệm 350.000đ nào cả!',
    points: 0.7
  },
  {
    id: 'q-8-3',
    assignmentId: 'assign-9',
    order: 3,
    content: '🎒 LEVEL 3 — “BA LÔ SMART SHOPPER” (1 phút | Chọn hành trang mua sắm)\n\nCho 9 thao tác trước khi mua sắm:\n1. 🎯 Xác định nhu cầu\n2. 💰 Xem khả năng chi trả\n3. 🔍 Tìm hiểu sản phẩm\n4. ⚖️ So sánh lựa chọn\n5. 🛡️ Kiểm tra an toàn\n6. 💳 Chọn cách thanh toán phù hợp\n7. 🔥 Mua vì đang trend\n8. 📢 Tin ngay quảng cáo\n9. 😎 Mua để bằng bạn bè\n\n👉 Chọn 6 thẻ mang vào BA LÔ SMART SHOPPER và 3 thẻ LOẠI VÀO THÙNG RÁC:',
    options: [
      { key: 'A', text: '🎒 MANG THEO: Xác định nhu cầu – Xem khả năng chi trả – Tìm hiểu sản phẩm – So sánh – Kiểm tra an toàn – Chọn thanh toán phù hợp | 🗑️ LOẠI: Đang trend – Tin ngay quảng cáo – Bằng bạn bè' },
      { key: 'B', text: '🎒 MANG THEO: Đang trend – Tin ngay quảng cáo – Bằng bạn bè – So sánh – Kiểm tra an toàn – Thanh toán | 🗑️ LOẠI: Nhu cầu – Chi trả – Tìm hiểu sản phẩm' },
      { key: 'C', text: '🎒 MANG THEO: Nhu cầu – Đang trend – Bằng bạn bè – Tin quảng cáo – Chi trả – Thanh toán | 🗑️ LOẠI: So sánh – Kiểm tra an toàn – Tìm hiểu' },
      { key: 'D', text: '🎒 MANG THEO: So sánh – Nhu cầu – Chi trả – Tin ngay quảng cáo – Đang trend – Thanh toán | 🗑️ LOẠI: Bằng bạn bè – Kiểm tra an toàn – Tìm hiểu' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Mang theo 6 thẻ chuẩn: Xác định nhu cầu, Xem khả năng chi trả, Tìm hiểu thông tin, So sánh, Kiểm tra an toàn, Chọn thanh toán phù hợp. Loại 3 thẻ: Trend, Tin ngay quảng cáo, Mua để bằng bạn bè.',
    points: 0.7
  },
  {
    id: 'q-8-4',
    assignmentId: 'assign-9',
    order: 4,
    content: '🕵️ LEVEL 4 — “QUẢNG CÁO NÓI THẬT?” (1 phút | Tìm điểm chưa hợp lí)\n\nMột video quảng cáo nói:\n📱 “Sản phẩm này đang viral! 99% người dùng yêu thích. KOL X dùng mỗi ngày. CHỐT ĐƠN NGAY!”\nNam liền kết luận: “Người nổi tiếng dùng thì chắc chắn sản phẩm tốt và phù hợp với mình.”\n\n👉 Nhận định của Nam sai ở đâu?',
    options: [
      { key: 'A', text: 'Người nổi tiếng theo quy định của pháp luật không bao giờ được phép nhận quảng cáo.' },
      { key: 'B', text: 'Tất cả các sản phẩm được người nổi tiếng quảng cáo đều có chất lượng xấu.' },
      { key: 'C', text: 'Quảng cáo chỉ là một nguồn thông tin mang tính thương mại; người tiêu dùng cần kiểm tra thêm chất lượng, công dụng, giá cả thực tế và mức độ phù hợp với bản thân.' },
      { key: 'D', text: 'Người tiêu dùng chỉ nên mua những mặt hàng hoàn toàn không xuất hiện trên quảng cáo.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Quảng cáo chỉ là một nguồn thông tin; cần kiểm tra thêm chất lượng, công dụng, giá cả và mức độ phù hợp.\nKOL được trả tiền để quảng bá sản phẩm, người tiêu dùng thông thái phải có tư duy phản biện và kiểm chứng độc lập.',
    points: 0.7
  },
  {
    id: 'q-8-5',
    assignmentId: 'assign-9',
    order: 5,
    content: '⭐ LEVEL 5 — “5 SAO = MUA NGAY?” (1 phút | Đúng/Sai)\n\nĐánh giá tính Đúng (✓) hoặc Sai (✗) của 5 nhận định sau:\n1. Giá rẻ nhất luôn là lựa chọn tốt nhất.\n2. Nên tìm hiểu thông tin sản phẩm trước khi mua.\n3. Một sản phẩm được nhiều người mua chưa chắc đã phù hợp với nhu cầu của mình.\n4. Cần cân nhắc đồng thời giữa nhu cầu và khả năng chi trả của bản thân.\n5. Thấy đánh giá “5 sao” trên mạng là đủ căn cứ tin cậy để mua ngay.\n\n👉 Kết quả từ 1 đến 5 là:',
    options: [
      { key: 'A', text: '1-Sai (✗) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'B', text: '1-Đúng (✓) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Đúng (✓)' },
      { key: 'C', text: '1-Sai (✗) — 2-Sai (✗) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'D', text: '1-Đúng (✓) — 2-Đúng (✓) — 3-Sai (✗) — 4-Đúng (✓) — 5-Sai (✗)' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1 ✗ – 2 ✓ – 3 ✓ – 4 ✓ – 5 ✗.\n- Nhận định 1 Sai vì giá quá rẻ có thể đi kèm hàng giả, kém chất lượng hoặc độc hại.\n- Nhận định 5 Sai vì lượt vote 5 sao trên mạng có thể bị làm giả (review seeding ảo).',
    points: 0.7
  },
  {
    id: 'q-8-6',
    assignmentId: 'assign-9',
    order: 6,
    content: '🤖 LEVEL 6 — “AI SHOPPING ĐANG LỖI!” (1 phút | Tìm điểm chưa hợp lí)\n\nAI trợ lí mua sắm tư vấn:\n🤖 “Muốn tiêu dùng thông minh, hãy luôn mua sản phẩm rẻ nhất. Giá càng thấp càng tiết kiệm.”\n\n🚨 Hãy chọn bản vá tư duy đúng đắn:\n🔑 MẬT MÃ: RẺ ≠ ____________',
    options: [
      { key: 'A', text: 'Luôn mua sản phẩm đắt nhất mới thể hiện đẳng cấp thông minh.' },
      { key: 'B', text: 'Cần xem xét đồng thời nhu cầu, chất lượng, công dụng, độ an toàn, giá cả và khả năng chi trả của bản thân.' },
      { key: 'C', text: 'Không cần quan tâm đến giá cả khi đi mua sắm.' },
      { key: 'D', text: 'Chỉ mua những món đồ mang thương hiệu quốc tế nổi tiếng nhất.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Cần xem xét đồng thời nhu cầu, chất lượng, công dụng, độ an toàn, giá cả và khả năng chi trả.\n🔑 Mật mã: TỐT / PHÙ HỢP / THÔNG MINH. Giá rẻ nhưng kém bền, độc hại hoặc không dùng được thì còn lãng phí hơn.',
    points: 0.7
  },
  {
    id: 'q-8-7',
    assignmentId: 'assign-9',
    order: 7,
    content: '🧩 LEVEL 7 — “GHÉP ĐÚNG PHẢN XẠ” (1 phút | Nối cặp tình huống và phản xạ)\n\nNối mỗi tình huống mua sắm với phản xạ tương ứng:\n\n• TÌNH HUỐNG:\n1. Giá rẻ bất thường so với thị trường\n2. Đang phân vân giữa hai sản phẩm tương tự\n3. Chuẩn bị bấm nút thanh toán đơn hàng\n4. Quảng cáo trên mạng vô cùng hấp dẫn và giục giã\n\n• PHẢN XẠ:\nA. Kiểm tra lại số dư tài khoản và tổng số tiền thanh toán\nB. Kiểm tra kỹ nguồn gốc, hạn sử dụng và thông tin sản phẩm\nC. So sánh công dụng, giá trị sử dụng và độ bền\nD. Không vội quyết định chỉ vì lời kêu gọi quảng cáo\n\n👉 Mật mã nối đúng là:',
    options: [
      { key: 'A', text: '1–B ; 2–C ; 3–A ; 4–D' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–C ; 2–D ; 3–A ; 4–B' },
      { key: 'D', text: '1–D ; 2–C ; 3–B ; 4–A' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–B (Giá rẻ bất thường → Kiểm tra nguồn gốc); 2–C (Hai sản phẩm → So sánh); 3–A (Thanh toán → Kiểm tra số tiền); 4–D (Quảng cáo giục giã → Không quyết định vì quảng cáo).',
    points: 0.7
  },
  {
    id: 'q-8-8',
    assignmentId: 'assign-9',
    order: 8,
    content: '🧠 LEVEL 8 — “4 BƯỚC TRƯỚC NÚT MUA” (1 phút | Sắp xếp trình tự thông minh)\n\nBốn bước chuẩn bị mua sắm bị xáo trộn:\nA. So sánh các lựa chọn tương đương trên thị trường.\nB. Xác định rõ mình có thực sự cần món đồ này không.\nC. Kiểm tra thông tin, nguồn gốc xuất xứ và độ an toàn sản phẩm.\nD. Kiểm tra giá cả và đối chiếu với khả năng chi trả của túi tiền.\n\n🚦 QUY TẮC: CẦN? → BIẾT RÕ? → PHÙ HỢP? → MỚI ____________.\n👉 Trình tự sắp xếp chuẩn xác là:',
    options: [
      { key: 'A', text: 'B → C → A → D (hoặc B → C → D → A: Xác định nhu cầu → Kiểm tra thông tin → So sánh/Khả năng chi trả)' },
      { key: 'B', text: 'A → B → C → D' },
      { key: 'C', text: 'D → A → B → C' },
      { key: 'D', text: 'C → D → A → B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. B → C → A → D (hoặc B → C → D → A).\n🚦 Quy tắc: CẦN? (B) → BIẾT RÕ? (C) → PHÙ HỢP? (A/D) → MỚI MUA.\nTừ khóa kết thúc: MUA.',
    points: 0.7
  },
  {
    id: 'q-8-9',
    assignmentId: 'assign-9',
    order: 9,
    content: '📱 LEVEL 9 — “FLASH SALE 60 GIÂY” (1 phút | Giải quyết áp lực thời gian)\n\nMàn hình điện thoại hiện đồng hồ đếm ngược gấp gáp:\n🔥 FLASH SALE! CÒN 01:00 PHÚT — Tai nghe chỉ 99.000đ — “Chỉ còn 2 sản phẩm cuối cùng!”\nEm chưa biết rõ cửa hàng này là ai, chất lượng tai nghe thế nào hay chính sách đổi trả ra sao.\n\n👉 Em nên xử lí thế nào?\n🧠 NHỚ: GẤP TRONG QUẢNG CÁO ≠ GẤP VỚI NHU CẦU CỦA EM',
    options: [
      { key: 'A', text: 'Bấm mua ngay lập tức vì sắp hết 1 phút, kẻo người khác mua mất.' },
      { key: 'B', text: 'Mua ngay vì giá chỉ có 99.000đ, hỏng thì vứt đi không tiếc.' },
      { key: 'C', text: 'Bình tĩnh, không để đồng hồ đếm ngược ép buộc quyết định; kiểm tra thông tin cửa hàng, chất lượng và chính sách trước khi xuống tiền.' },
      { key: 'D', text: 'Cứ đặt mua giao về nhà rồi lúc đó mới kiểm tra sau.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không để đồng hồ đếm ngược ép quyết định; kiểm tra thông tin trước.\nĐồng hồ đếm ngược và "còn 2 cái" là chiêu tâm lý FOMO phổ biến tạo cảm giác khan hiếm giả tạo để khách hàng vội vã chốt đơn.',
    points: 0.7
  },
  {
    id: 'q-8-10',
    assignmentId: 'assign-9',
    order: 10,
    content: '💳 LEVEL 10 — “5 GIÂY TRƯỚC KHI THANH TOÁN” (1 phút | Chọn 4 thao tác an toàn)\n\nTrước khi bấm nút xác nhận THANH TOÁN, em nên thực hiện những việc nào?\n1. Kiểm tra sản phẩm (tên, số lượng, mẫu mã).\n2. Kiểm tra giá và tổng số tiền phải trả (bao gồm cả phí ship).\n3. Kiểm tra phương thức thanh toán an toàn.\n4. Bảo mật thông tin tài khoản, mã OTP cá nhân.\n5. Gửi mã xác thực cho người lạ nếu họ tự xưng là nhân viên kỹ thuật sàn.\n6. Bấm thật nhanh tay để khỏi mất ưu đãi mà không cần đọc lại.\n\n👉 4 việc làm đúng đắn là:',
    options: [
      { key: 'A', text: '1 + 2 + 3 + 4 (Kiểm tra sản phẩm + Kiểm tra giá/tiền + Kiểm tra phương thức + Bảo mật tài khoản)' },
      { key: 'B', text: '2 + 3 + 4 + 5 (Chia sẻ mã OTP cho nhân viên)' },
      { key: 'C', text: '1 + 2 + 5 + 6 (Bấm nhanh và gửi OTP)' },
      { key: 'D', text: '3 + 4 + 5 + 6' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 4 việc đúng: 1, 2, 3, 4.\nTuyệt đối không gửi mã OTP cho bất kỳ ai (kể cả người xưng là nhân viên), và không bấm vội vàng bỏ qua kiểm tra số tiền.',
    points: 0.7
  },
  {
    id: 'q-8-11',
    assignmentId: 'assign-9',
    order: 11,
    content: '🧾 LEVEL 11 — “HÓA ĐƠN ĐỪNG VỨT!” (45 giây | Điền từ khóa)\n\nChọn 2 từ trong 4 từ: ĐỔI TRẢ – CHỨNG TỪ – TRANG TRÍ – BẢO VỆ để hoàn thành câu:\n\n“Hóa đơn mua hàng có thể là một (1) __________ giao dịch, hữu ích khi cần xử lí vấn đề hoặc (2) __________ sản phẩm.”\n\n👉 Hai từ khóa theo thứ tự là:',
    options: [
      { key: 'A', text: 'CHỨNG TỪ – ĐỔI TRẢ' },
      { key: 'B', text: 'TRANG TRÍ – BẢO VỆ' },
      { key: 'C', text: 'ĐỔI TRẢ – CHỨNG TỪ' },
      { key: 'D', text: 'BẢO VỆ – TRANG TRÍ' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. CHỨNG TỪ – ĐỔI TRẢ.\nHóa đơn và biên lai là chứng từ pháp lý chứng minh giao dịch đã diễn ra, bảo vệ quyền lợi người tiêu dùng khi hàng lỗi cần bảo hành hay đổi trả.',
    points: 0.6
  },
  {
    id: 'q-8-12',
    assignmentId: 'assign-9',
    order: 12,
    content: '🛍️ LEVEL 12 — “GIỎ HÀNG 500K” (1,5 phút | Quyết định ngân sách thông minh)\n\nEm có ngân sách tiết kiệm đúng 500.000đ. Danh sách hàng hóa:\n• 🎒 Cặp học: Giá 350K (Tình trạng: Cặp hiện tại đã bị rách hỏng nặng)\n• 👟 Phụ kiện giày: Giá 180K (Tình trạng: Món đồ đang hot trên mạng)\n• 📚 Sách bài tập cần học: Giá 120K (Tình trạng: Cần dùng ngay trong tuần)\n• 🧸 Móc khóa: Giá 90K (Tình trạng: Ở nhà đã có 4 cái tương tự)\n\n👉 Phương án chi tiêu thông minh nhất là:\n🔐 CÔNG THỨC: NHU CẦU + NGÂN SÁCH → QUYẾT ĐỊNH',
    options: [
      { key: 'A', text: 'Cặp học (350K) + Sách cần học (120K) = 470K (Vừa đủ nhu cầu thiết yếu và nằm gọn trong ngân sách 500K)' },
      { key: 'B', text: 'Phụ kiện giày (180K) + Móc khóa (90K) = 270K' },
      { key: 'C', text: 'Mua cả bốn món = 740K (Vay mượn thêm tiền bạn bè)' },
      { key: 'D', text: 'Phụ kiện giày (180K) + Sách (120K) + Móc khóa (90K) = 390K (Để cặp rách không mua)' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Cặp + Sách = 470K.\nCặp bị rách hỏng và sách học là hai nhu cầu bắt buộc phải có cho việc học. Tổng chi phí 470K vừa vặn dưới mức ngân sách 500K.',
    points: 0.6
  },
  {
    id: 'q-8-13',
    assignmentId: 'assign-9',
    order: 13,
    content: '🧃 LEVEL 13 — “RẺ BẤT THƯỜNG” (1 phút | Chọn đáp án)\n\nMột loại đồ uống nhập khẩu bình thường có giá khoảng 30.000đ/chai. Em thấy một tài khoản mạng xã hội lạ rao bán:\n“Hàng chính hãng 100% – hôm nay sale sốc chỉ 5.000đ – bắt buộc chuyển khoản cọc trước 100%!”\n\n👉 Phản xạ phù hợp nhất của em là:',
    options: [
      { key: 'A', text: 'Chuyển khoản mua ngay 10 chai vì giá rẻ không tưởng.' },
      { key: 'B', text: 'Chuyển tiền cọc thật nhanh trước khi hết suất ưu đãi.' },
      { key: 'C', text: 'Cảnh giác cao độ; kiểm tra nguồn bán, thông tin sản phẩm và độ tin cậy; không chuyển tiền cho tài khoản lạ khi có dấu hiệu lừa đảo/hàng giả.' },
      { key: 'D', text: 'Gửi ngay link cho cả lớp rủ cùng chuyển tiền mua chung.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Kiểm tra nguồn bán, thông tin sản phẩm và độ tin cậy trước khi quyết định.\nGiá rẻ gấp 6 lần thị trường kèm yêu cầu chuyển khoản trước 100% là dấu hiệu điển hình của thủ đoạn lừa đảo chiếm đoạt tài sản trên không gian mạng.',
    points: 0.6
  },
  {
    id: 'q-8-14',
    assignmentId: 'assign-9',
    order: 14,
    content: '⚖️ LEVEL 14 — “TIẾT KIỆM HAY KEO KIỆT?” (1 phút | Bẫy tư duy)\n\nHùng phát biểu:\n“Tiêu dùng thông minh nghĩa là tuyệt đối không mua bất cứ thứ gì cả để tiết kiệm tối đa số tiền mình có.”\n\n👉 Đánh giá ý kiến của Hùng:\n💥 MẬT MÃ: TIÊU DÙNG THÔNG MINH ≠ KHÔNG ____________',
    options: [
      { key: 'A', text: 'Đúng hoàn toàn, không tiêu gì mới là người thông minh nhất.' },
      { key: 'B', text: 'Chưa đúng. Tiêu dùng thông minh là chi tiêu có kế hoạch, hợp lí và phù hợp với nhu cầu cần thiết cũng như điều kiện tài chính của bản thân.' },
      { key: 'C', text: 'Tiêu dùng thông minh là thích gì mua nấy không cần nghĩ.' },
      { key: 'D', text: 'Tiết kiệm và keo kiệt hoàn toàn giống hệt nhau.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Chưa đúng. Tiêu dùng thông minh là chi tiêu có kế hoạch, hợp lí và phù hợp với nhu cầu, điều kiện của bản thân.\n💥 Mật mã: MUA / CHI TIÊU. Tiêu dùng để phục vụ cuộc sống và học tập là điều cần thiết; thông minh là mua đúng, mua hợp lý chứ không phải nhịn chi tiêu thiết yếu.',
    points: 0.6
  },
  {
    id: 'q-8-15',
    assignmentId: 'assign-9',
    order: 15,
    content: '🏆 FINAL BOSS — “NÚT MUA NGAY” (1,5 phút | Vận dụng tổng hợp Smart Shopper)\n\nEm muốn mua một đôi giày thể thao online:\n👟 Giá: 399.000đ | 🔥 “SALE DUY NHẤT HÔM NAY” | ⭐ 4,9 sao | 📢 Influencer giới thiệu | 💳 Bắt buộc thanh toán trước | ❓ Em chưa biết rõ người bán và chính sách bảo hành/đổi trả.\n\nCho 6 nút tư duy:\n① 🎯 Tôi có thực sự cần đôi giày này không?\n② 🔍 Người bán/sản phẩm có đáng tin cậy không?\n③ ⚖️ Có lựa chọn nào phù hợp và uy tín hơn không?\n④ 💰 Giá cả và cách thanh toán có an toàn không?\n⑤ 🔥 Influencer khen thích nên mua ngay!\n⑥ ⏳ Đồng hồ sale sắp hết giờ nên mua vội!\n\n👉 Hãy chọn 4 nút NÊN BẤM TRƯỚC KHI ẤN NÚT “MUA”:',
    options: [
      { key: 'A', text: 'Bấm 4 nút đầu: ① Nhu cầu thực sự? → ② Người bán tin cậy? → ③ Lựa chọn phù hợp? → ④ Thanh toán an toàn? → 🛒' },
      { key: 'B', text: 'Bấm: ⑤ Influencer thích + ⑥ Sale sắp hết + ① Nhu cầu + ④ Thanh toán' },
      { key: 'C', text: 'Bấm: ② Người bán + ③ Lựa chọn + ⑤ Influencer + ⑥ Sale' },
      { key: 'D', text: 'Bấm duy nhất 1 nút: ⑥ Sale sắp hết' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Bốn nút đầu tiên: ① Thật sự cần? ② Tin cậy? ③ So sánh lựa chọn? ④ Thanh toán an toàn?\nĐây là bộ lọc 4 lớp bảo vệ túi tiền của Smart Shopper trước mọi cám dỗ thị trường.',
    points: 0.6
  },
  {
    id: 'q-8-16',
    assignmentId: 'assign-9',
    order: 16,
    content: '❤️ EXIT TICKET — “QUY TẮC 10 GIÂY” (Cam kết hành động)\n\nLần tới khi thấy một món đồ rất muốn mua, em sẽ tự hỏi 3 câu:\n① 🎯 MÌNH CÓ THỰC SỰ CẦN KHÔNG?\n② 🔍 MÌNH ĐÃ KIỂM TRA ĐỦ THÔNG TIN CHƯA?\n③ 💰 NÓ CÓ PHÙ HỢP VỚI KHẢ NĂNG CHI TRẢ KHÔNG?\n\n🧠 ĐỪNG ĐỂ “MUA NGAY” ĐI TRƯỚC “NGHĨ KĨ”.\n👉 Em cam kết áp dụng quy tắc này vào thời điểm nào?',
    options: [
      { key: 'A', text: '🌱 NGAY TỪ HÔM NAY VÀ TRONG MỌI LẦN MUA SẮM TIẾP THEO: Luôn dừng lại 10 giây suy xét trước khi quyết định chi tiêu!' },
      { key: 'B', text: 'Thích gì mua nấy cho sướng, không cần nghĩ ngợi.' },
      { key: 'C', text: 'Chỉ áp dụng khi nào hết sạch tiền.' },
      { key: 'D', text: 'Nghe theo bạn bè và quảng cáo trên mạng xã hội.' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Cam kết rèn luyện thói quen tư duy tiêu dùng thông minh bền vững suốt cuộc đời.',
    points: 0.5
  }
];

// ---------------------------------------------------------------------------
// QUESTIONS FOR BÀI 9 (assign-10)
// ---------------------------------------------------------------------------
const qLesson9 = [
  {
    id: 'q-9-1',
    assignmentId: 'assign-10',
    order: 1,
    content: '🔍 HỒ SƠ 1 — “QUÉT DẤU HIỆU” (1 phút | Kéo – thả / Chọn dấu hiệu pháp lí)\n\nCho 6 thẻ đặc điểm:\nA. Hành vi trái pháp luật\nB. Hành vi có lỗi (cố ý hoặc vô ý)\nC. Do chủ thể có năng lực trách nhiệm pháp lí thực hiện\nD. Chỉ cần người khác không thích hành vi đó\nE. Xâm hại các quan hệ xã hội được pháp luật bảo vệ\nF. Bất cứ suy nghĩ tiêu cực nào thoáng qua trong đầu\n\n👉 Hãy chọn 4 thẻ thuộc DẤU HIỆU CỦA VI PHẠM PHÁP LUẬT và 2 thẻ LOẠI:\n👉 Mật mã: Không thể chỉ thấy một hành vi “không hay” rồi lập tức kết luận đó là __________________.',
    options: [
      { key: 'A', text: '🔎 MÁY QUÉT (4 dấu hiệu): A – B – C – E | 🗑️ LOẠI: D – F (Mật mã: vi phạm pháp luật)' },
      { key: 'B', text: '🔎 MÁY QUÉT: D – F – A – B | 🗑️ LOẠI: C – E' },
      { key: 'C', text: '🔎 MÁY QUÉT: A – C – D – E | 🗑️ LOẠI: B – F' },
      { key: 'D', text: '🔎 MÁY QUÉT: B – C – E – F | 🗑️ LOẠI: A – D' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Dấu hiệu: A – B – C – E. Loại: D – F.\nVi phạm pháp luật phải có đủ 4 dấu hiệu: 1. Là hành vi trái pháp luật; 2. Có lỗi; 3. Do chủ thể có năng lực trách nhiệm pháp lý thực hiện; 4. Xâm phạm các quan hệ xã hội được pháp luật bảo vệ. (Chỉ suy nghĩ tiêu cực hoặc điều người khác không thích thì không phải vi phạm pháp luật).',
    points: 0.7
  },
  {
    id: 'q-9-2',
    assignmentId: 'assign-10',
    order: 2,
    content: '🧠 HỒ SƠ 2 — “4 CÁNH CỬA PHÁP LÍ” (1 phút | Điền từ khóa 4 loại vi phạm)\n\nĐiền 4 từ: HÌNH SỰ – DÂN SỰ – HÀNH CHÍNH – KỈ LUẬT vào chỗ trống:\n\n1. 🚨 Xâm phạm quan hệ được pháp luật hình sự bảo vệ, có tính nguy hiểm cho xã hội theo quy định → Vi phạm (1) __________\n2. 📄 Xâm phạm quan hệ tài sản hoặc quan hệ nhân thân → Vi phạm (2) __________\n3. 🚦 Vi phạm quy định quản lí nhà nước mà không phải tội phạm → Vi phạm (3) __________\n4. 🏫 Vi phạm quy định nội quy trong cơ quan, tổ chức, trường học → Vi phạm (4) __________\n\n👉 Thứ tự 4 từ khóa điền vào là:',
    options: [
      { key: 'A', text: 'HÌNH SỰ – DÂN SỰ – HÀNH CHÍNH – KỈ LUẬT' },
      { key: 'B', text: 'DÂN SỰ – HÌNH SỰ – KỈ LUẬT – HÀNH CHÍNH' },
      { key: 'C', text: 'HÀNH CHÍNH – KỈ LUẬT – HÌNH SỰ – DÂN SỰ' },
      { key: 'D', text: 'KỈ LUẬT – HÀNH CHÍNH – DÂN SỰ – HÌNH SỰ' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. HÌNH SỰ – DÂN SỰ – HÀNH CHÍNH – KỈ LUẬT.\nĐây là 4 loại vi phạm pháp luật cơ bản được quy định rõ trong chương trình GDCD 9.',
    points: 0.7
  },
  {
    id: 'q-9-3',
    assignmentId: 'assign-10',
    order: 3,
    content: '⚡ HỒ SƠ 3 — “3 GIÂY PHÂN LOẠI” (1,5 phút | Phân loại hồ sơ vi phạm)\n\nĐưa từng hồ sơ vào đúng ô loại vi phạm:\nA. Một người điều khiển xe máy vượt đèn đỏ vi phạm quy định giao thông và bị cảnh sát xử phạt.\nB. Người vay tiền đến hạn thỏa thuận nhưng cố tình không thực hiện nghĩa vụ trả nợ.\nC. Nhân viên nhiều lần đi muộn, vi phạm nội quy làm việc của cơ quan.\nD. Một đối tượng thực hiện hành vi trộm cắp tài sản giá trị lớn, được Bộ luật Hình sự quy định là tội phạm.\n\n👉 Kết quả phân loại vào 4 ô [HÌNH SỰ] – [DÂN SỰ] – [HÀNH CHÍNH] – [KỈ LUẬT] là:',
    options: [
      { key: 'A', text: '🚨 HÌNH SỰ: D | 📄 DÂN SỰ: B | 🚦 HÀNH CHÍNH: A | 🏫 KỈ LUẬT: C' },
      { key: 'B', text: '🚨 HÌNH SỰ: A | 📄 DÂN SỰ: C | 🚦 HÀNH CHÍNH: D | 🏫 KỈ LUẬT: B' },
      { key: 'C', text: '🚨 HÌNH SỰ: B | 📄 DÂN SỰ: D | 🚦 HÀNH CHÍNH: C | 🏫 KỈ LUẬT: A' },
      { key: 'D', text: '🚨 HÌNH SỰ: C | 📄 DÂN SỰ: A | 🚦 HÀNH CHÍNH: B | 🏫 KỈ LUẬT: D' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. D → Hình sự; B → Dân sự; A → Hành chính; C → Kỉ luật.',
    points: 0.7
  },
  {
    id: 'q-9-4',
    assignmentId: 'assign-10',
    order: 4,
    content: '🔗 HỒ SƠ 4 — “VI PHẠM NÀO – TRÁCH NHIỆM ẤY” (1 phút | Nối cặp tương ứng)\n\nNối loại vi phạm pháp luật với trách nhiệm pháp lí tương ứng:\n\n• LOẠI VI PHẠM:\n1. Vi phạm hình sự\n2. Vi phạm dân sự\n3. Vi phạm hành chính\n4. Vi phạm kỉ luật\n\n• TRÁCH NHIỆM TƯƠNG ỨNG:\nA. Trách nhiệm hành chính\nB. Trách nhiệm kỉ luật\nC. Trách nhiệm hình sự\nD. Trách nhiệm dân sự\n\n👉 Mật mã nối đúng là:',
    options: [
      { key: 'A', text: '1–C ; 2–D ; 3–A ; 4–B' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–D ; 2–C ; 3–B ; 4–A' },
      { key: 'D', text: '1–C ; 2–A ; 3–D ; 4–B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–C ; 2–D ; 3–A ; 4–B.\nNguyên tắc cơ bản: Vi phạm hình sự chịu trách nhiệm hình sự; vi phạm dân sự chịu trách nhiệm dân sự; vi phạm hành chính chịu trách nhiệm hành chính; vi phạm kỉ luật chịu trách nhiệm kỉ luật.',
    points: 0.7
  },
  {
    id: 'q-9-5',
    assignmentId: 'assign-10',
    order: 5,
    content: '🚦 HỒ SƠ 5 — “ĐÚNG HAY BẪY?” (1 phút | Đúng/Sai)\n\nĐánh giá tính Đúng (✓) hoặc Sai (✗) của 5 nhận định sau:\n1. Mọi vi phạm pháp luật đều giống nhau về tính chất và hậu quả pháp lí.\n2. Vi phạm pháp luật được chia thành nhiều loại khác nhau.\n3. Vi phạm hành chính và vi phạm hình sự thực chất là một.\n4. Chủ thể vi phạm pháp luật có thể phải chịu trách nhiệm pháp lí tương ứng.\n5. Trách nhiệm pháp lí chỉ có duy nhất mục đích làm người vi phạm cảm thấy “sợ”.\n\n👉 Kết quả từ 1 đến 5 là:',
    options: [
      { key: 'A', text: '1-Sai (✗) — 2-Đúng (✓) — 3-Sai (✗) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'B', text: '1-Đúng (✓) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'C', text: '1-Sai (✗) — 2-Sai (✗) — 3-Sai (✗) — 4-Đúng (✓) — 5-Đúng (✓)' },
      { key: 'D', text: '1-Sai (✗) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Sai (✗) — 5-Sai (✗)' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1 ✗ – 2 ✓ – 3 ✗ – 4 ✓ – 5 ✗.\n- Nhận định 1 Sai vì các loại vi phạm có mức độ nguy hiểm và hậu quả khác nhau.\n- Nhận định 3 Sai vì vi phạm hành chính khác tội phạm hình sự về mức độ nguy hiểm cho xã hội.\n- Nhận định 5 Sai vì trách nhiệm pháp lý còn nhằm giáo dục ý thức tôn trọng luật và duy trì trật tự xã hội.',
    points: 0.7
  },
  {
    id: 'q-9-6',
    assignmentId: 'assign-10',
    order: 6,
    content: '🤖 HỒ SƠ 6 — “AI LUẬT SƯ ĐANG LỖI!” (1 phút | Tìm điểm chưa hợp lí)\n\nAI tư vấn pháp lí phát biểu:\n🤖 “Chỉ cần thấy một hành vi trái pháp luật thì trong mọi trường hợp đều có thể kết luận ngay người thực hiện đã vi phạm pháp luật.”\n\n🚨 Chọn bản sửa phù hợp nhất:\n🧠 NEO TƯ DUY: MỘT DẤU HIỆU ≠ ĐỦ MỘT KẾT LUẬN',
    options: [
      { key: 'A', text: 'Đúng hoàn toàn, cứ trái luật là lập tức bị kết tội vi phạm pháp luật.' },
      { key: 'B', text: 'Muốn xác định vi phạm pháp luật cần xem xét đầy đủ các dấu hiệu theo quy định (hành vi trái luật, có lỗi, có năng lực trách nhiệm pháp lí, xâm hại quan hệ xã hội được bảo vệ), không chỉ duy nhất yếu tố hành vi trái pháp luật.' },
      { key: 'C', text: 'Chỉ cần xem hành vi đó có bị cộng đồng mạng phản đối hay không là đủ.' },
      { key: 'D', text: 'Chỉ người đã đủ 18 tuổi trưởng thành mới có thể vi phạm pháp luật.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Muốn xác định vi phạm pháp luật cần xem xét đầy đủ các dấu hiệu theo quy định.\nVí dụ: Người mắc bệnh tâm thần mất năng lực hành vi hoặc trẻ em quá nhỏ không có năng lực trách nhiệm pháp lý thì hành vi không cấu thành vi phạm pháp luật.',
    points: 0.7
  },
  {
    id: 'q-9-7',
    assignmentId: 'assign-10',
    order: 7,
    content: '🕵️ HỒ SƠ 7 — “AI CHỊU TRÁCH NHIỆM GÌ?” (1,5 phút | Nối tình huống và trách nhiệm)\n\nNối tình huống với nhóm trách nhiệm pháp lí tương ứng:\n\n• TÌNH HUỐNG:\n1. Vi phạm quy định quản lí nhà nước và bị cơ quan có thẩm quyền xử phạt\n2. Vi phạm nghĩa vụ tài sản trong hợp đồng và phải bồi thường thiệt hại\n3. Thực hiện hành vi tội phạm và bị Tòa án áp dụng hình phạt tù\n4. Vi phạm nội quy, kỉ luật lao động của cơ quan và bị khiển trách\n\n• NHÓM TRÁCH NHIỆM:\nA. Trách nhiệm dân sự\nB. Trách nhiệm kỉ luật\nC. Trách nhiệm hành chính\nD. Trách nhiệm hình sự\n\n👉 Mật mã nối đúng là:',
    options: [
      { key: 'A', text: '1–C ; 2–A ; 3–D ; 4–B' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–D ; 2–C ; 3–B ; 4–A' },
      { key: 'D', text: '1–C ; 2–D ; 3–A ; 4–B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–C ; 2–A ; 3–D ; 4–B.\n- Phạt quản lý nhà nước → Hành chính (C)\n- Bồi thường nghĩa vụ tài sản → Dân sự (A)\n- Tội phạm bị Tòa án kết án → Hình sự (D)\n- Xử lý nội quy cơ quan → Kỉ luật (B)',
    points: 0.7
  },
  {
    id: 'q-9-8',
    assignmentId: 'assign-10',
    order: 8,
    content: '⚖️ HỒ SƠ 8 — “PHẠT XONG LÀ HẾT?” (1 phút | Chọn đáp án về ý nghĩa trách nhiệm pháp lí)\n\nMinh nói: “Trách nhiệm pháp lí chỉ có một mục đích duy nhất: trừng phạt người vi phạm cho bõ tức.”\n\n👉 Phát biểu nào dưới đây đầy đủ và chuẩn xác nhất theo nội dung môn GDCD 9?',
    options: [
      { key: 'A', text: 'Minh hoàn toàn đúng, pháp luật sinh ra chỉ để trừng phạt.' },
      { key: 'B', text: 'Trách nhiệm pháp lí không có bất kì ý nghĩa gì đối với xã hội.' },
      { key: 'C', text: 'Ngoài xử lí người vi phạm, trách nhiệm pháp lí còn nhằm giáo dục ý thức tôn trọng pháp luật, răn đe phòng ngừa vi phạm, bảo vệ quyền lợi công dân và duy trì trật tự an toàn xã hội.' },
      { key: 'D', text: 'Chỉ có những người vi phạm pháp luật mới cần quan tâm và tìm hiểu đến pháp luật.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Ngoài xử lí người vi phạm, trách nhiệm pháp lí còn góp phần giáo dục ý thức tôn trọng pháp luật, phòng ngừa vi phạm và duy trì trật tự xã hội.',
    points: 0.7
  },
  {
    id: 'q-9-9',
    assignmentId: 'assign-10',
    order: 9,
    content: '🧩 HỒ SƠ 9 — “GHÉP HẬU QUẢ” (1 phút | Nối loại trách nhiệm với chế tài cụ thể)\n\nNối loại trách nhiệm với ví dụ về hậu quả pháp lí phù hợp theo tài liệu:\n\n• TRÁCH NHIỆM:\n1. Trách nhiệm hình sự\n2. Trách nhiệm dân sự\n3. Trách nhiệm hành chính\n4. Trách nhiệm kỉ luật\n\n• VÍ DỤ CHẾ TÀI HẬU QUẢ:\nA. Buộc bồi thường thiệt hại về tài sản\nB. Áp dụng hình phạt tù\nC. Phạt tiền theo quyết định xử phạt vi phạm hành chính\nD. Khiển trách, cảnh cáo, buộc thôi việc theo nội quy cơ quan\n\n👉 Kết quả nối đúng là:',
    options: [
      { key: 'A', text: '1–B ; 2–A ; 3–C ; 4–D' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–C ; 2–D ; 3–A ; 4–B' },
      { key: 'D', text: '1–B ; 2–C ; 3–A ; 4–D' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–B ; 2–A ; 3–C ; 4–D.\n- Hình sự → Phạt tù (B)\n- Dân sự → Bồi thường thiệt hại (A)\n- Hành chính → Phạt tiền theo biên bản hành chính (C)\n- Kỉ luật → Khiển trách, cảnh cáo (D)',
    points: 0.7
  },
  {
    id: 'q-9-10',
    assignmentId: 'assign-10',
    order: 10,
    content: '📱 HỒ SƠ 10 — “CHỈ LÀ MỘT NÚT SHARE?” (1 phút | Giải quyết tình huống mạng xã hội)\n\nMột người bạn gửi vào nhóm chat một đường link có nội dung bịa đặt, bôi nhọ danh dự người khác và nhắn:\n“Share đi! Nhiều người trên mạng đang chia sẻ lắm, chắc chẳng sao đâu.”\nEm chưa biết rõ nội dung thực hư và hậu quả của việc tiếp tay lan truyền.\n\n👉 Cách xử lí chuẩn mực nhất của em là:\n🔐 MẬT MÃ: “NHIỀU NGƯỜI CÙNG LÀM” ≠ “HÀNH VI ĐÓ ____________”.',
    options: [
      { key: 'A', text: 'Chia sẻ ngay vì thấy nhiều người làm thì mình làm theo.' },
      { key: 'B', text: 'Chia sẻ lên trang cá nhân, nếu bị nhắc nhở thì vội vàng xóa sau.' },
      { key: 'C', text: 'Tuyệt đối không tiếp tay chia sẻ; kiểm tra thông tin và báo với người lớn/thầy cô có trách nhiệm nếu nhận thấy nguy cơ vi phạm pháp luật.' },
      { key: 'D', text: 'Viết thêm các bình luận thêu dệt, kích động để bài viết nhiều like hơn.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không tiếp tay; kiểm tra thông tin và báo người lớn/giáo viên phù hợp.\n🔐 Mật mã: HỢP PHÁP / ĐÚNG PHÁP LUẬT. Hành vi chia sẻ thông tin sai sự thật, xúc phạm danh dự người khác trên mạng là vi phạm pháp luật (Luật An ninh mạng).',
    points: 0.7
  },
  {
    id: 'q-9-11',
    assignmentId: 'assign-10',
    order: 11,
    content: '🔎 HỒ SƠ 11 — “ĐỪNG TỰ LÀM THẨM PHÁN” (1 phút | Tìm cách ứng xử đúng đắn)\n\nTrong nhóm lớp xuất hiện tin đồn chưa kiểm chứng:\n“Bạn X chắc chắn đã phạm tội ăn cắp! Mọi người đăng ảnh và tên bạn ấy lên mạng để cảnh cáo đi!”\n\n👉 Em nên hành động như thế nào?\n💡 NEO TƯ DUY: TÔN TRỌNG PHÁP LUẬT cũng bao gồm không tùy tiện “kết tội” người khác.',
    options: [
      { key: 'A', text: 'Đăng tải và chia sẻ ảnh của bạn X ngay để cảnh báo mọi người.' },
      { key: 'B', text: 'A dua hùa theo số đông để kết luận bạn X có tội.' },
      { key: 'C', text: 'Không tự ý kết luận hay phát tán thông tin hình ảnh; để sự việc được cơ quan/thầy cô xác minh theo đúng quy định và kịp thời báo người có trách nhiệm.' },
      { key: 'D', text: 'Vào trang cá nhân của bạn X để lại các bình luận lăng mạ, xúc phạm.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không tự kết luận hay phát tán thông tin; để sự việc được xác minh, xử lí theo đúng quy định.\nChỉ có cơ quan tiến hành tố tụng có thẩm quyền mới có quyền định tội một người theo quy định của pháp luật.',
    points: 0.7
  },
  {
    id: 'q-9-12',
    assignmentId: 'assign-10',
    order: 12,
    content: '🧠 HỒ SƠ 12 — “4 BƯỚC PHÁP LÍ” (1 phút | Sắp xếp tư duy công dân)\n\nKhi gặp một tình huống nghi ngờ có dấu hiệu vi phạm trong cuộc sống, học sinh nên suy nghĩ theo trình tự nào?\nA. Chọn cách ứng xử phù hợp, kiên quyết không tiếp tay cho hành vi sai trái.\nB. Xác định rõ hành vi thực tế đang xảy ra là gì.\nC. Đối chiếu với quy định và nguyên tắc pháp luật đã được học.\nD. Xem xét cẩn trọng các dấu hiệu liên quan, không vội vàng kết luận cảm tính.\n\n🔐 CÔNG THỨC: SỰ VIỆC → CĂN CỨ → DẤU HIỆU → HÀNH ĐỘNG\n👉 Thứ tự sắp xếp chuẩn là:',
    options: [
      { key: 'A', text: 'B → C → D → A (Xác định hành vi → Đối chiếu quy định → Xem xét dấu hiệu → Chọn ứng xử phù hợp)' },
      { key: 'B', text: 'A → B → C → D' },
      { key: 'C', text: 'C → B → A → D' },
      { key: 'D', text: 'D → A → B → C' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. B → C → D → A.\nTrình tự tư duy pháp lí chuẩn mực: Nhìn nhận sự việc thực tế (B) → Đối chiếu căn cứ luật định (C) → Phân tích các dấu hiệu cấu thành (D) → Quyết định hành động ứng xử đúng đắn (A).',
    points: 0.6
  },
  {
    id: 'q-9-13',
    assignmentId: 'assign-10',
    order: 13,
    content: '💥 FINAL BOSS — “30 GIÂY PHÁ ÁN” (1,5 phút | Ghép cặp vi phạm & trách nhiệm)\n\nĐọc 4 thẻ tình huống:\n① Một người thực hiện hành vi nguy hiểm cho xã hội được pháp luật hình sự quy định là tội phạm.\n② Một người vi phạm nghĩa vụ tài sản theo quan hệ hợp đồng dân sự.\n③ Một người vi phạm quy định quản lí nhà nước nhưng hành vi chưa đến mức cấu thành tội phạm.\n④ Một nhân viên trong cơ quan vi phạm quy định nội quy, kỉ luật lao động của đơn vị.\n\n👉 Kéo mỗi thẻ vào đúng “đường ray” loại vi phạm và trách nhiệm tương ứng:',
    options: [
      { key: 'A', text: '① Vi phạm hình sự → Trách nhiệm hình sự | ② Vi phạm dân sự → Trách nhiệm dân sự | ③ Vi phạm hành chính → Trách nhiệm hành chính | ④ Vi phạm kỉ luật → Trách nhiệm kỉ luật' },
      { key: 'B', text: '① Vi phạm dân sự → Trách nhiệm hành chính | ② Vi phạm hình sự → Trách nhiệm kỉ luật | ③ Vi phạm kỉ luật → Trách nhiệm dân sự | ④ Vi phạm hành chính → Trách nhiệm hình sự' },
      { key: 'C', text: '① Vi phạm hành chính → Trách nhiệm hành chính | ② Vi phạm kỉ luật → Trách nhiệm kỉ luật | ③ Vi phạm hình sự → Trách nhiệm hình sự | ④ Vi phạm dân sự → Trách nhiệm dân sự' },
      { key: 'D', text: '① Vi phạm kỉ luật → Trách nhiệm kỉ luật | ② Vi phạm hành chính → Trách nhiệm hành chính | ③ Vi phạm dân sự → Trách nhiệm dân sự | ④ Vi phạm hình sự → Trách nhiệm hình sự' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. ① Vi phạm hình sự → trách nhiệm hình sự; ② Vi phạm dân sự → trách nhiệm dân sự; ③ Vi phạm hành chính → trách nhiệm hành chính; ④ Vi phạm kỉ luật → trách nhiệm kỉ luật.',
    points: 0.6
  },
  {
    id: 'q-9-14',
    assignmentId: 'assign-10',
    order: 14,
    content: '❤️ EXIT TICKET — “NÚT DỪNG 5 GIÂY” (Phản xạ công dân chuẩn mực)\n\nLần tới khi bạn bè rủ em làm một việc trái quy định và bảo:\n“Có ai biết đâu mà sợ! Cứ làm đi!”\n\n👉 Em muốn bật phản xạ nào?\n⚖️ TUÂN THỦ PHÁP LUẬT KHÔNG BẮT ĐẦU TỪ NỖI SỢ BỊ PHẠT. NÓ BẮT ĐẦU TỪ VIỆC BIẾT DỪNG LẠI – SUY XÉT – CHỊU TRÁCH NHIỆM.',
    options: [
      { key: 'A', text: '🛡️ BẬT PHẢN XẠ CÔNG DÂN: Dừng lại 5 giây tự hỏi: “Việc này có đúng pháp luật/nội quy không? Hậu quả có thể là gì?” và dứt khoát từ chối hành vi sai trái!' },
      { key: 'B', text: '“Không bị ai phát hiện thì cứ làm thoải mái.”' },
      { key: 'C', text: '“Bạn bè làm thì mình cũng làm theo cho vui.”' },
      { key: 'D', text: '“Cứ làm trước đi, hậu quả tính sau.”' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Bản lĩnh công dân đích thực là sự tự giác tuân thủ pháp luật xuất phát từ lương tâm và hiểu biết, chứ không phụ thuộc vào việc có người giám sát hay không.',
    points: 0.6
  }
];

// ---------------------------------------------------------------------------
// QUESTIONS FOR BÀI 10 (assign-11)
// ---------------------------------------------------------------------------
const qLesson10 = [
  {
    id: 'q-10-1',
    assignmentId: 'assign-11',
    order: 1,
    content: '🚀 LEVEL 1 — “MỞ SHOP ĐƯỢC KHÔNG?” (1 phút | Chọn đáp án)\n\nMột người muốn mở cửa hàng online. Bạn ấy nói:\n“Đã có quyền tự do kinh doanh thì mình thích kinh doanh ngành nghề nào cũng được.”\n\n👉 Phát biểu nào dưới đây phù hợp nhất với pháp luật?\n🔐 MẬT MÃ: TỰ DO KINH DOANH ≠ TỰ DO ____________.',
    options: [
      { key: 'A', text: 'Đúng, vì đã là “tự do” thì không có bất kỳ giới hạn nào.' },
      { key: 'B', text: 'Chỉ cần có vốn thì được kinh doanh mọi thứ theo ý thích.' },
      { key: 'C', text: 'Có quyền tự do kinh doanh những ngành, nghề mà pháp luật không cấm và phải tuân thủ quy định pháp luật về kinh doanh.' },
      { key: 'D', text: 'Chỉ các doanh nghiệp lớn mới có quyền tự do kinh doanh.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Có quyền tự do kinh doanh những ngành, nghề mà pháp luật không cấm và phải tuân thủ quy định pháp luật về kinh doanh.\n🔐 Mật mã: TUỲ Ý. Quyền tự do kinh doanh luôn gắn liền với khuôn khổ pháp luật.',
    points: 0.7
  },
  {
    id: 'q-10-2',
    assignmentId: 'assign-11',
    order: 2,
    content: '🛣️ LEVEL 2 — “LÀN ĐƯỜNG TỰ DO” (1 phút | Kéo – thả / Phân loại)\n\nCho 6 hành vi trong hoạt động kinh doanh:\n1. 🎯 Lựa chọn ngành nghề pháp luật không cấm\n2. 🏪 Lựa chọn hình thức kinh doanh phù hợp\n3. ⚖️ Tuân thủ quy định pháp luật về kinh doanh\n4. 🛡️ Tôn trọng quyền, lợi ích hợp pháp của người tiêu dùng\n5. 💣 Mặt hàng lời cao thì bán, dù pháp luật cấm\n6. 🎭 Gắn nhãn sai để dễ bán\n\n👉 Hãy chọn đúng 4 thẻ trong “LÀN ĐƯỜNG HỢP PHÁP” và 2 thẻ “VƯỢT VẠCH”:',
    options: [
      { key: 'A', text: '🟢 LÀN ĐƯỜNG HỢP PHÁP: Ngành nghề không cấm – Hình thức phù hợp – Tuân thủ pháp luật – Tôn trọng người tiêu dùng | 🔴 VƯỢT VẠCH: Bán hàng cấm kiếm lời – Gắn nhãn sai' },
      { key: 'B', text: '🟢 LÀN ĐƯỜNG HỢP PHÁP: Bán hàng cấm – Gắn nhãn sai – Ngành nghề không cấm – Tuân thủ pháp luật | 🔴 VƯỢT VẠCH: Tôn trọng người tiêu dùng – Hình thức phù hợp' },
      { key: 'C', text: '🟢 LÀN ĐƯỜNG HỢP PHÁP: Bán hàng cấm – Hình thức phù hợp – Tuân thủ pháp luật – Gắn nhãn sai | 🔴 VƯỢT VẠCH: Ngành nghề không cấm – Tôn trọng người tiêu dùng' },
      { key: 'D', text: '🟢 LÀN ĐƯỜNG HỢP PHÁP: Tôn trọng người tiêu dùng – Gắn nhãn sai – Bán hàng cấm – Ngành nghề không cấm | 🔴 VƯỢT VẠCH: Hình thức phù hợp – Tuân thủ pháp luật' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Làn hợp pháp: 1, 2, 3, 4. Vượt vạch: 5, 6.\nChủ thể kinh doanh được tự do lựa chọn ngành nghề pháp luật không cấm, đồng thời phải bảo đảm quyền lợi người tiêu dùng và tuân thủ luật.',
    points: 0.7
  },
  {
    id: 'q-10-3',
    assignmentId: 'assign-11',
    order: 3,
    content: '🎮 LEVEL 3 — “QUYỀN HAY NGHĨA VỤ?” (1 phút | Phân loại)\n\nPhân loại các thẻ sau vào vùng QUYỀN hoặc NGHĨA VỤ:\nA. Lựa chọn ngành nghề kinh doanh mà pháp luật không cấm.\nB. Khai thuế theo quy định.\nC. Lựa chọn hình thức kinh doanh.\nD. Nộp thuế đầy đủ, đúng thời hạn theo quy định.\nE. Tuân thủ pháp luật trong hoạt động kinh doanh.\nF. Lựa chọn cách thức tổ chức hoạt động kinh doanh phù hợp quy định.\n\n👉 Kết quả phân loại chuẩn là:\n🧠 NEO TƯ DUY: CÓ QUYỀN ↔ CÓ TRÁCH NHIỆM',
    options: [
      { key: 'A', text: '🟢 QUYỀN: A – C – F | 🔵 NGHĨA VỤ: B – D – E' },
      { key: 'B', text: '🟢 QUYỀN: B – D – E | 🔵 NGHĨA VỤ: A – C – F' },
      { key: 'C', text: '🟢 QUYỀN: A – B – C | 🔵 NGHĨA VỤ: D – E – F' },
      { key: 'D', text: '🟢 QUYỀN: C – D – E | 🔵 NGHĨA VỤ: A – B – F' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Quyền: A, C, F. Nghĩa vụ: B, D, E.',
    points: 0.7
  },
  {
    id: 'q-10-4',
    assignmentId: 'assign-11',
    order: 4,
    content: '🚦 LEVEL 4 — “ĐÚNG HAY BẪY?” (1 phút | Đúng/Sai)\n\nĐánh giá tính Đúng (✓) hoặc Sai (✗) của 5 nhận định sau:\n1. Tự do kinh doanh nghĩa là được kinh doanh mọi ngành nghề.\n2. Mọi người có quyền tự do kinh doanh những ngành nghề mà pháp luật không cấm.\n3. Hoạt động kinh doanh phải tuân thủ pháp luật.\n4. Nghĩa vụ thuế chỉ cần thực hiện khi người nộp thuế “muốn”.\n5. Khai thuế phải bảo đảm chính xác, trung thực theo quy định.\n\n👉 Kết quả từ 1 đến 5 là:',
    options: [
      { key: 'A', text: '1-Sai (✗) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Sai (✗) — 5-Đúng (✓)' },
      { key: 'B', text: '1-Đúng (✓) — 2-Đúng (✓) — 3-Đúng (✓) — 4-Sai (✗) — 5-Đúng (✓)' },
      { key: 'C', text: '1-Sai (✗) — 2-Sai (✗) — 3-Đúng (✓) — 4-Đúng (✓) — 5-Sai (✗)' },
      { key: 'D', text: '1-Sai (✗) — 2-Đúng (✓) — 3-Sai (✗) — 4-Sai (✗) — 5-Đúng (✓)' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1 ✗ – 2 ✓ – 3 ✓ – 4 ✗ – 5 ✓.',
    points: 0.7
  },
  {
    id: 'q-10-5',
    assignmentId: 'assign-11',
    order: 5,
    content: '🤖 LEVEL 5 — “AI STARTUP ĐANG LỖI!” (1 phút | Tìm điểm chưa hợp lí)\n\nAI tư vấn khởi nghiệp:\n🤖 “Nếu một mặt hàng đem lại lợi nhuận rất cao thì nên kinh doanh. Lợi nhuận là tiêu chí quan trọng nhất, còn pháp luật có thể xem sau.”\n\n🚨 Hãy chọn bản vá chuẩn xác nhất:\n💥 MẬT MÃ: LỢI NHUẬN ≠ GIẤY PHÉP VƯỢT QUA ____________.',
    options: [
      { key: 'A', text: 'Đúng hoàn toàn, kinh doanh là phải kiếm thật nhiều tiền bất chấp tất cả.' },
      { key: 'B', text: 'Trước hết phải xem ngành nghề, hàng hóa và hoạt động kinh doanh đó có phù hợp quy định pháp luật hay không.' },
      { key: 'C', text: 'Chỉ cần khách hàng đồng ý mua là được phép bán.' },
      { key: 'D', text: 'Chỉ cần che giấu khéo léo để không ai phát hiện là được.' }
    ],
    correctOption: 'B',
    explanation: 'Đáp án: B. Trước hết phải xem ngành nghề, hàng hóa và hoạt động kinh doanh đó có phù hợp quy định pháp luật hay không.\n💥 Mật mã: PHÁP LUẬT.',
    points: 0.7
  },
  {
    id: 'q-10-6',
    assignmentId: 'assign-11',
    order: 6,
    content: '🛒 LEVEL 6 — “SHOP ONLINE 9A” (1 phút | Giải quyết tình huống)\n\nMột cửa hàng online phát hiện một sản phẩm không rõ nguồn gốc xuất xứ đang rất “hot”.\nMột người đề nghị: “Cứ đăng bán đi! Khách hỏi thì nói hàng xịn. Lãi gấp ba đấy!”\n\n👉 Người kinh doanh có trách nhiệm nên quyết định như thế nào?\n🔐 NEO: KINH DOANH ≠ KIẾM LỢI BẰNG MỌI GIÁ',
    options: [
      { key: 'A', text: 'Bán ngay lập tức vì cơ hội hot kiếm tiền nhanh chóng.' },
      { key: 'B', text: 'Đăng bán thử vài đơn, nếu khách khiếu nại thì lập tức xóa bài.' },
      { key: 'C', text: 'Không vì lợi nhuận mà kinh doanh hàng hóa không bảo đảm yêu cầu pháp luật; phải bảo đảm thông tin trung thực và quyền lợi hợp pháp của người tiêu dùng.' },
      { key: 'D', text: 'Đổi tên thương hiệu và tem mác khác để tránh bị kiểm tra.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không vì lợi nhuận mà kinh doanh hàng hóa không bảo đảm yêu cầu pháp luật; phải bảo đảm thông tin và quyền lợi hợp pháp của người tiêu dùng.',
    points: 0.7
  },
  {
    id: 'q-10-7',
    assignmentId: 'assign-11',
    order: 7,
    content: '💰 LEVEL 7 — “THUẾ ĐI ĐÂU?” (1 phút | Nối cặp nghĩa vụ thuế)\n\nNối mỗi từ khóa nghĩa vụ với ý nghĩa phù hợp theo quy định pháp luật:\n\n• TỪ KHÓA:\n1. Đăng kí thuế\n2. Khai thuế\n3. Nộp thuế\n4. Nghĩa vụ thuế\n\n• Ý NGHĨA:\nA. Thực hiện đúng thời hạn theo quy định\nB. Thực hiện thủ tục đăng kí mã số thuế theo quy định\nC. Cung cấp thông tin doanh thu chính xác, trung thực\nD. Nghĩa vụ bắt buộc phải thực hiện theo pháp luật\n\n👉 Mật mã ghép nối đúng là:',
    options: [
      { key: 'A', text: '1–B ; 2–C ; 3–A ; 4–D (1–Thủ tục đăng kí ; 2–Khai trung thực ; 3–Nộp đúng hạn ; 4–Nghĩa vụ bắt buộc)' },
      { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
      { key: 'C', text: '1–B ; 2–A ; 3–C ; 4–D' },
      { key: 'D', text: '1–C ; 2–D ; 3–A ; 4–B' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 1–B ; 2–C ; 3–A ; 4–D.',
    points: 0.7
  },
  {
    id: 'q-10-8',
    assignmentId: 'assign-11',
    order: 8,
    content: '🧾 LEVEL 8 — “HÓA ĐƠN ẢO” (1 phút | Tìm điểm chưa hợp lí)\n\nChủ một cửa hàng nói:\n“Nếu khai doanh thu thấp hơn thực tế thì số thuế phải nộp có thể giảm. Công việc của mình mà, có ảnh hưởng ai đâu.”\n\n👉 Suy nghĩ trên sai ở điểm nào?\n🧠 CHÌA KHÓA: “TIỀN CỦA MÌNH” ≠ “NGHĨA VỤ THUẾ LÀ TÙY CHỌN”',
    options: [
      { key: 'A', text: 'Không sai vì tiền mình kiếm được thì mình tự quyết.' },
      { key: 'B', text: 'Chỉ các doanh nghiệp lớn mới bắt buộc phải khai trung thực.' },
      { key: 'C', text: 'Người có nghĩa vụ phải khai thuế chính xác, trung thực, đầy đủ và chịu trách nhiệm trước pháp luật về hành vi trốn thuế, gian lận thuế.' },
      { key: 'D', text: 'Miễn vẫn bán hàng chạy cho khách thì việc khai thuế thế nào cũng được.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Người có nghĩa vụ phải khai thuế chính xác, trung thực, đầy đủ và chịu trách nhiệm theo quy định pháp luật.',
    points: 0.7
  },
  {
    id: 'q-10-9',
    assignmentId: 'assign-11',
    order: 9,
    content: '🧩 LEVEL 9 — “4 BƯỚC CHECK STARTUP” (1 phút | Sắp xếp tư duy khởi nghiệp)\n\nTrước một ý tưởng khởi nghiệp kinh doanh, hãy sắp xếp 4 câu hỏi theo trình tự hợp lí:\nA. Tôi phải thực hiện những nghĩa vụ thuế và pháp lí nào?\nB. Ngành nghề/hàng hóa này có được pháp luật cho phép kinh doanh không?\nC. Hoạt động này có bảo đảm quyền lợi hợp pháp của khách hàng và xã hội không?\nD. Tôi sẽ lựa chọn hình thức/cách thức kinh doanh nào phù hợp quy định?\n\n🔐 CÔNG THỨC: HỢP PHÁP → CÁCH LÀM → TRÁCH NHIỆM → QUYỀN LỢI\n👉 Trình tự sắp xếp chuẩn là:',
    options: [
      { key: 'A', text: 'B → D → A → C (hoặc B → D → C → A: Kiểm tra tính hợp pháp → Chọn cách làm → Nghĩa vụ thuế → Bảo đảm quyền lợi)' },
      { key: 'B', text: 'A → B → C → D' },
      { key: 'C', text: 'C → B → D → A' },
      { key: 'D', text: 'D → A → B → C' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. B → D → A → C (hoặc B → D → C → A).',
    points: 0.7
  },
  {
    id: 'q-10-10',
    assignmentId: 'assign-11',
    order: 10,
    content: '⚡ LEVEL 10 — “FREESHIP THUẾ?” (1 phút | Chọn đáp án)\n\nMột người bán hàng qua mạng nói:\n“Tôi bán hàng chủ yếu trên mạng nên chắc kinh doanh online thì không liên quan gì đến nghĩa vụ thuế cả.”\n\n👉 Em hãy phân tích quan điểm này:',
    options: [
      { key: 'A', text: 'Đúng vì bán trên mạng không có mặt bằng cố định nên không cần thuế.' },
      { key: 'B', text: 'Đúng nếu chỉ bán qua trang mạng xã hội cá nhân.' },
      { key: 'C', text: 'Không thể căn cứ chỉ vào việc bán online để kết luận không có nghĩa vụ thuế; nghĩa vụ thuế phải thực hiện theo quy định pháp luật áp dụng cho mọi hình thức kinh doanh.' },
      { key: 'D', text: 'Thuế là việc của người mua hàng, người bán không bao giờ phải nộp.' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Không thể căn cứ chỉ vào việc bán online để kết luận không có nghĩa vụ thuế; nghĩa vụ phải thực hiện theo quy định pháp luật áp dụng.',
    points: 0.7
  },
  {
    id: 'q-10-11',
    assignmentId: 'assign-11',
    order: 11,
    content: '🕵️ LEVEL 11 — “BẪY TỰ DO” (1 phút | Điền từ khóa)\n\nChọn 4 từ: PHÁP LUẬT – LỢI NHUẬN – QUYỀN – NGHĨA VỤ để hoàn thành công thức:\n\n🟢 KINH DOANH HỢP PHÁP =\n(1) __________ tự do kinh doanh\n➕\n(2) __________ tuân thủ quy định\n➕\nKHUÔN KHỔ (3) __________\n≠\nchỉ chạy theo (4) __________\n\n👉 Bốn từ khóa theo thứ tự là:',
    options: [
      { key: 'A', text: 'QUYỀN – NGHĨA VỤ – PHÁP LUẬT – LỢI NHUẬN' },
      { key: 'B', text: 'LỢI NHUẬN – QUYỀN – NGHĨA VỤ – PHÁP LUẬT' },
      { key: 'C', text: 'PHÁP LUẬT – LỢI NHUẬN – QUYỀN – NGHĨA VỤ' },
      { key: 'D', text: 'NGHĨA VỤ – QUYỀN – LỢI NHUẬN – PHÁP LUẬT' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. QUYỀN – NGHĨA VỤ – PHÁP LUẬT – LỢI NHUẬN.',
    points: 0.6
  },
  {
    id: 'q-10-12',
    assignmentId: 'assign-11',
    order: 12,
    content: '🧠 LEVEL 12 — “AI ĐƯỢC LỢI?” (1 phút | Chọn nhiều đáp án)\n\nViệc thực hiện đúng quy định pháp luật trong kinh doanh góp phần bảo vệ quyền lợi của những đối tượng nào dưới đây?\n1. 👤 Người kinh doanh chân chính\n2. 🛒 Người tiêu dùng\n3. 👷 Người lao động trong cơ sở kinh doanh\n4. 🌱 Những lợi ích chung của xã hội được pháp luật bảo vệ\n5. ❌ Chỉ duy nhất người bán hàng\n\n👉 Có bao nhiêu nhóm đối tượng được bảo vệ hợp pháp?',
    options: [
      { key: 'A', text: '4 nhóm đối tượng (Người kinh doanh, Người tiêu dùng, Người lao động và Lợi ích chung của xã hội)' },
      { key: 'B', text: 'Chỉ 1 đối tượng duy nhất là người kinh doanh' },
      { key: 'C', text: '2 đối tượng' },
      { key: 'D', text: '3 đối tượng' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. 4 đáp án đầu (Người kinh doanh, Người tiêu dùng, Người lao động, Lợi ích xã hội).',
    points: 0.6
  },
  {
    id: 'q-10-13',
    assignmentId: 'assign-11',
    order: 13,
    content: '📱 LEVEL 13 — “TIN NHẮN TỪ NGƯỜI THÂN” (1 phút | Vận dụng tình huống)\n\nNgười thân nhắn tin hỏi em:\n“Cô đang định bán một mặt hàng online. Người quen bảo mặt hàng này có thể thuộc diện bị hạn chế kinh doanh nhưng cô thấy nhiều shop trên mạng vẫn bán. Chắc bán theo họ được nhỉ?”\n\n👉 Là một học sinh GDCD 9 hiểu biết, em nên khuyên người thân thế nào?\n💥 NEO TƯ DUY: NHIỀU NGƯỜI LÀM ≠ PHÁP LUẬT CHO PHÉP',
    options: [
      { key: 'A', text: '“Nhiều người đang bán thì chắc chắn pháp luật cho phép, cô cứ yên tâm bán.”' },
      { key: 'B', text: '“Cứ bán thử vài hôm kiếm lời, khi nào bị cơ quan chức năng nhắc nhở thì dừng.”' },
      { key: 'C', text: '“Nên kiểm tra kỹ quy định pháp luật và điều kiện kinh doanh trước khi thực hiện; không thể thấy người khác làm sai mà làm theo.”' },
      { key: 'D', text: '“Bán trên mạng thì không bao giờ bị xử phạt đâu cô đừng lo.”' }
    ],
    correctOption: 'C',
    explanation: 'Đáp án: C. Nên kiểm tra quy định pháp luật và điều kiện kinh doanh trước khi thực hiện.\n💥 Neo tư duy: NHIỀU NGƯỜI LÀM ≠ PHÁP LUẬT CHO PHÉP.',
    points: 0.6
  },
  {
    id: 'q-10-14',
    assignmentId: 'assign-11',
    order: 14,
    content: '🏆 FINAL BOSS — “STARTUP 300 TRIỆU” (1,5 phút | Ra quyết định chuẩn CEO)\n\nMột người chuẩn bị kinh doanh với số vốn 300 triệu. Có 6 quyết định sau:\n① Tìm hiểu xem ngành nghề có được phép kinh doanh không.\n② Chọn cách kinh doanh phù hợp quy định.\n③ Quảng cáo sai công dụng để tăng doanh số gấp ba.\n④ Thực hiện nghĩa vụ thuế đầy đủ theo quy định.\n⑤ Bảo đảm quyền, lợi ích hợp pháp của khách hàng.\n⑥ Nếu doanh thu tốt thì khai thấp xuống để giảm tiền thuế.\n\n👉 Hãy phân loại vào 2 vùng: STARTUP HỢP PHÁP và VƯỢT VẠCH:\n🔐 MẬT MÃ CUỐI: TỰ DO + ____________ = KINH DOANH CÓ TRÁCH NHIỆM',
    options: [
      { key: 'A', text: '🟢 STARTUP HỢP PHÁP: ① – ② – ④ – ⑤ | 🔴 VƯỢT VẠCH: ③ – ⑥ | Mật mã: TRÁCH NHIỆM / NGHĨA VỤ' },
      { key: 'B', text: '🟢 STARTUP HỢP PHÁP: ③ – ⑥ | 🔴 VƯỢT VẠCH: ① – ② – ④ – ⑤' },
      { key: 'C', text: '🟢 STARTUP HỢP PHÁP: ① – ③ – ⑤ | 🔴 VƯỢT VẠCH: ② – ④ – ⑥' },
      { key: 'D', text: '🟢 STARTUP HỢP PHÁP: ② – ③ – ⑥ | 🔴 VƯỢT VẠCH: ① – ④ – ⑤' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Hợp pháp: ①, ②, ④, ⑤. Vượt vạch: ③, ⑥.\n🔐 Mật mã: TRÁCH NHIỆM / NGHĨA VỤ.',
    points: 0.6
  },
  {
    id: 'q-10-15',
    assignmentId: 'assign-11',
    order: 15,
    content: '❤️ EXIT TICKET — “15 TUỔI THÌ LIÊN QUAN GÌ?” (Cam kết nhận thức công dân)\n\n⚖️ TỰ DO KHÔNG ĐỨNG NGOÀI PHÁP LUẬT.\nKinh doanh có quyền – có giới hạn – có nghĩa vụ – có trách nhiệm.\n\n👉 Chọn 01 thông điệp và hành động em quyết tâm mang ra khỏi lớp học hôm nay:',
    options: [
      { key: 'A', text: '🌱 TÔI HIỂU VÀ HÀNH ĐỘNG: Quyền luôn đi liền với nghĩa vụ trong khuôn khổ pháp luật + Không mua/bán hàng vi phạm, nhắc người thân tuân thủ quy định kinh doanh và nộp thuế!' },
      { key: 'B', text: 'Kinh doanh là chuyện của người lớn, học sinh 15 tuổi không cần biết đến pháp luật.' },
      { key: 'C', text: 'Miễn kiếm được nhiều tiền thì phương thức kinh doanh không quan trọng.' },
      { key: 'D', text: 'Chỉ cần không bị bắt thì kinh doanh bất cứ thứ gì cũng được.' }
    ],
    correctOption: 'A',
    explanation: 'Đáp án: A. Mật khẩu rời lớp: Nhận thức đúng đắn rằng quyền luôn gắn liền với nghĩa vụ và tự giác thực hiện trách nhiệm công dân từ những việc làm thiết thực ngay hôm nay.',
    points: 0.6
  }
];

// Append all new questions
db.questions.push(...qLesson7, ...qLesson8, ...qLesson9, ...qLesson10);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully updated database.json!');
console.log(`Bài 7: ${qLesson7.length} questions`);
console.log(`Bài 8: ${qLesson8.length} questions`);
console.log(`Bài 9: ${qLesson9.length} questions`);
console.log(`Bài 10: ${qLesson10.length} questions`);
console.log(`Total questions in database: ${db.questions.length}`);
