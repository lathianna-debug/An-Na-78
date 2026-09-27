const fs = require('fs');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'database.json');
const db = JSON.parse(fs.readFileSync(dbPath, 'utf-8'));

// ---------------------------------------------------------------------------
// 1. ASSIGNMENT 11 (BÀI 10 - QUYỀN TỰ DO KINH DOANH VÀ NGHĨA VỤ NỘP THUẾ)
// ---------------------------------------------------------------------------
let assign11 = db.assignments.find(a => a.id === 'assign-11');
if (!assign11) {
  assign11 = {
    id: 'assign-11',
    lessonId: 'lesson-10',
    title: 'Bài 10: Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “Startup 15 tuổi – Mở shop nhưng đừng vượt vạch!”',
    type: 'bai_tap',
    code: 'GDCD9-B10',
    description: 'Phiếu học tập GDCD 9: Bài 10. Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “Startup 15 tuổi – Mở shop nhưng đừng vượt vạch!”. Hành trình tư duy: HIỂU QUYỀN → NHẬN RA GIỚI HẠN → HIỂU NGHĨA VỤ → BIẾT HÀNH ĐỘNG.',
    durationMinutes: 15,
    isLocked: false,
    order: 1,
    reviewMode: 'NO_REVIEW',
    createdAt: '2026-09-20T08:00:00.000Z',
    updatedAt: new Date().toISOString()
  };
  db.assignments.push(assign11);
} else {
  assign11.title = 'Bài 10: Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “Startup 15 tuổi – Mở shop nhưng đừng vượt vạch!”';
  assign11.code = 'GDCD9-B10';
  assign11.description = 'Phiếu học tập GDCD 9: Bài 10. Quyền tự do kinh doanh và nghĩa vụ nộp thuế — Thử thách: “Startup 15 tuổi – Mở shop nhưng đừng vượt vạch!”. Hành trình tư duy: HIỂU QUYỀN → NHẬN RA GIỚI HẠN → HIỂU NGHĨA VỤ → BIẾT HÀNH ĐỘNG.';
  assign11.updatedAt = new Date().toISOString();
}

db.questions = db.questions.filter(q => q.assignmentId !== 'assign-11');

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
    explanation: 'Đáp án: C. Có quyền tự do kinh doanh những ngành, nghề mà pháp luật không cấm và phải tuân thủ quy định pháp luật về kinh doanh.\n🔐 Mật mã: TUỲ Ý. Quyền tự do kinh doanh của công dân luôn được thực hiện trong khuôn khổ pháp luật, không phải là tự do vô điều kiện hay tùy tiện thích gì làm nấy.',
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
    explanation: 'Đáp án: A. Làn hợp pháp: 1, 2, 3, 4. Vượt vạch: 5, 6.\nChủ thể kinh doanh được tự do lựa chọn ngành nghề pháp luật không cấm, lựa chọn hình thức tổ chức, đồng thời bắt buộc phải tuân thủ pháp luật và tôn trọng quyền lợi của khách hàng.',
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
    explanation: 'Đáp án: A. Quyền: A, C, F. Nghĩa vụ: B, D, E.\n- Quyền của người kinh doanh: Tự do chọn ngành nghề (không cấm), chọn quy mô và hình thức kinh doanh.\n- Nghĩa vụ bắt buộc: Đăng ký thuế, khai thuế, nộp thuế đầy đủ đúng hạn và tuân thủ các quy định bảo đảm trật tự an toàn xã hội.',
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
    explanation: 'Đáp án: A. 1 ✗ – 2 ✓ – 3 ✓ – 4 ✗ – 5 ✓.\n- Nhận định 1 Sai (✗) vì pháp luật nghiêm cấm kinh doanh một số ngành nghề nguy hiểm (ma túy, pháo nổ, động vật hoang dã quý hiếm...).\n- Nhận định 4 Sai (✗) vì nộp thuế là nghĩa vụ pháp lí bắt buộc, không phụ thuộc vào ý muốn chủ quan.',
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
    explanation: 'Đáp án: B. Trước hết phải xem ngành nghề, hàng hóa và hoạt động kinh doanh đó có phù hợp quy định pháp luật hay không.\n💥 Mật mã: PHÁP LUẬT. Lợi nhuận không bao giờ là giấy phép để đứng trên hay vượt qua giới hạn của pháp luật và đạo đức xã hội.',
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
    explanation: 'Đáp án: C. Không vì lợi nhuận mà kinh doanh hàng hóa không bảo đảm yêu cầu pháp luật; phải bảo đảm thông tin và quyền lợi hợp pháp của người tiêu dùng.\nKinh doanh chân chính phải xây dựng trên nền tảng trung thực, minh bạch nguồn gốc và bảo vệ sức khỏe, tài sản của khách hàng.',
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
    explanation: 'Đáp án: A. 1–B ; 2–C ; 3–A ; 4–D.\nNgười nộp thuế có nghĩa vụ: Đăng kí thuế với cơ quan nhà nước (B), Khai thuế trung thực đầy đủ (C), Nộp tiền thuế đúng hạn (A), và đây là nghĩa vụ pháp lí bắt buộc (D).',
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
    explanation: 'Đáp án: C. Người có nghĩa vụ phải khai thuế chính xác, trung thực, đầy đủ và chịu trách nhiệm theo quy định pháp luật.\nHành vi cố tình kê khai sai doanh thu để giảm thuế là hành vi gian lận/trốn thuế vi phạm pháp luật và sẽ bị xử phạt nghiêm khắc.',
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
    explanation: 'Đáp án: A. B → D → A → C (hoặc B → D → C → A).\nQuy trình tư duy: Đầu tiên xác định mặt hàng pháp luật có cấm không (B) → Chọn hình thức quy mô phù hợp (D) → Thực hiện đăng ký nghĩa vụ thuế (A) → Bảo đảm quyền lợi khách hàng và xã hội (C).',
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
    explanation: 'Đáp án: C. Không thể căn cứ chỉ vào việc bán online để kết luận không có nghĩa vụ thuế; nghĩa vụ phải thực hiện theo quy định pháp luật áp dụng.\nKinh doanh thương mại điện tử (online) khi đạt mức doanh thu theo luật định đều phải kê khai và nộp thuế theo đúng quy định của Nhà nước.',
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
    explanation: 'Đáp án: A. QUYỀN – NGHĨA VỤ – PHÁP LUẬT – LỢI NHUẬN.\nCông thức chuẩn: QUYỀN tự do kinh doanh đi liền với NGHĨA VỤ tuân thủ quy định trong KHUÔN KHỔ PHÁP LUẬT, không chỉ mù quáng chạy theo LỢI NHUẬN.',
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
    explanation: 'Đáp án: A. 4 đáp án đầu (Người kinh doanh, Người tiêu dùng, Người lao động, Lợi ích xã hội).\nTuân thủ pháp luật tạo ra môi trường cạnh tranh lành mạnh, bảo vệ người tiêu dùng khỏi hàng giả, bảo vệ quyền của người lao động và tạo nguồn thu thuế xây dựng đất nước.',
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
    explanation: 'Đáp án: C. Nên kiểm tra quy định pháp luật và điều kiện kinh doanh trước khi thực hiện.\n💥 Neo tư duy: NHIỀU NGƯỜI LÀM ≠ PHÁP LUẬT CHO PHÉP. Việc người khác vi phạm chưa bị xử lý không có nghĩa là hành vi đó hợp pháp.',
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
    explanation: 'Đáp án: A. Hợp pháp: ①, ②, ④, ⑤. Vượt vạch: ③, ⑥.\n🔐 Mật mã: TRÁCH NHIỆM / NGHĨA VỤ. Một doanh nghiệp muốn phát triển bền vững bắt buộc phải tôn trọng pháp luật và thực hiện đầy đủ trách nhiệm với cộng đồng.',
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

db.questions.push(...qLesson10);

fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
console.log('Successfully saved Bài 10 (assign-11) and 15 questions to database.json!');
const totalPoints10 = Math.round(qLesson10.reduce((sum, q) => sum + q.points, 0) * 10) / 10;
console.log('Total points sum for Bài 10:', totalPoints10);
