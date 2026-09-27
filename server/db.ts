import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';
import {
  AdminUser,
  Student,
  Lesson,
  Assignment,
  Question,
  Submission,
  StudentAnswer,
  SystemSettings,
  AuditLog,
  ClassGrade9,
} from '../src/types.ts';

export interface DatabaseSchema {
  version: number;
  admins: AdminUser[];
  adminPasswordHash: string;
  classes: ClassGrade9[];
  students: Student[];
  lessons: Lesson[];
  assignments: Assignment[];
  questions: Question[];
  submissions: Submission[];
  answers: StudentAnswer[];
  settings: SystemSettings;
  auditLogs: AuditLog[];
}

const DATA_DIR = path.join(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');
const BACKUP_FILE = path.join(DATA_DIR, 'backup_database.json');

const INITIAL_CLASSES: ClassGrade9[] = [
  '9A8',
  '9A9',
  '9A10',
  '9A11',
  '9A12',
];

function ensureDirectoryExists() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function getInitialDatabase(): DatabaseSchema {
  const initialPassword = process.env.ADMIN_INITIAL_PASSWORD || 'Annalhp1978';
  const salt = bcrypt.genSaltSync(10);
  const passwordHash = bcrypt.hashSync(initialPassword, salt);

  const admin: AdminUser = {
    id: 'admin-coanna',
    username: 'coanna',
    displayName: 'CÔ AN NA (lathianna@gmail.com)',
    role: 'ADMIN',
    createdAt: '2026-09-01T08:00:00.000Z',
    lastLoginAt: '2026-09-19T08:30:00.000Z',
  };

  const lessons: Lesson[] = [
    {
      id: 'lesson-1',
      number: 1,
      title: 'Sống có lí tưởng',
      description: 'Xác định mục đích sống cao đẹp, kế hoạch phấn đấu học tập, rèn luyện vì tương lai bản thân và cống hiến cho quê hương, đất nước.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-2',
      number: 2,
      title: 'Khoan dung',
      description: 'Rộng lòng tha thứ, tôn trọng và thông cảm với người khác, không định kiến hay cố chấp trước lỗi lầm đã biết sửa chữa.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-3',
      number: 3,
      title: 'Tích cực tham gia các hoạt động cộng đồng',
      description: 'Tự giác, hăng hái tham gia phong trào tập thể, công tác thiện nguyện, xây dựng môi trường xanh - sạch - đẹp tại địa phương.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-4',
      number: 4,
      title: 'Khách quan và công bằng',
      description: 'Nhìn nhận, đánh giá sự vật hiện tượng đúng bản chất thực tế; đối xử bình đẳng, không thiên vị hay tư lợi cá nhân.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-5',
      number: 5,
      title: 'Bảo vệ hòa bình',
      description: 'Khát vọng và trách nhiệm xây dựng quan hệ hữu nghị, ngăn chặn chiến tranh, phòng ngừa xung đột và bạo lực học đường.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-6',
      number: 6,
      title: 'Quản lí thời gian hiệu quả',
      description: 'Phương pháp lập kế hoạch học tập khoa học, phân loại thứ tự ưu tiên công việc, tránh trì hoãn và cân bằng cuộc sống.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-7',
      number: 7,
      title: 'Thích ứng với thay đổi',
      description: 'Kỹ năng thích nghi với môi trường sống và học tập mới, đón nhận thử thách và ứng phó linh hoạt trước các biến đổi.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-8',
      number: 8,
      title: 'Tiêu dùng thông minh',
      description: 'Quản lý tài chính cá nhân, phân biệt nhu cầu thiết yếu và sở thích, thói quen tiết kiệm và lựa chọn hàng hóa an toàn.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-9',
      number: 9,
      title: 'Vi phạm pháp luật và trách nhiệm pháp lí',
      description: 'Khái niệm, dấu hiệu vi phạm pháp luật; phân biệt các loại vi phạm pháp luật và trách nhiệm pháp lý tương ứng.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
    {
      id: 'lesson-10',
      number: 10,
      title: 'Quyền tự do kinh doanh và nghĩa vụ nộp thuế',
      description: 'Quyền và nghĩa vụ của công dân trong hoạt động kinh doanh, ý thức chấp hành pháp luật và nghĩa vụ đóng thuế.',
      status: 'active',
      createdAt: '2026-09-01T08:00:00.000Z',
      updatedAt: '2026-09-01T08:00:00.000Z',
    },
  ];

  const assignments: Assignment[] = [
    {
      id: 'assign-1',
      lessonId: 'lesson-1',
      title: 'Bài 1: Sống có lí tưởng — Thử thách: “La bàn tuổi 15”',
      type: 'bai_tap',
      code: 'GDCD9-B1',
      description: 'Phiếu học tập GDCD: Thử thách La bàn tuổi 15. Mỗi lựa chọn hôm nay là một bước tạo nên con người em ngày mai. (Thời gian: 10–15 phút | Mục tiêu: Hiểu – Nhớ – Vận dụng)',
      durationMinutes: 15,
      isLocked: false,
      order: 1,
      reviewMode: 'NO_REVIEW',
      createdAt: '2026-09-02T08:00:00.000Z',
      updatedAt: '2026-09-02T08:00:00.000Z',
    },
    {
      id: 'assign-2',
      lessonId: 'lesson-1',
      title: 'Tình huống 01: Ứng xử trong tập thể lớp',
      type: 'tinh_huong',
      code: 'CHICONG-01',
      description: 'Xử lý các tình huống phân chia công việc và đánh giá thi đua công tâm.',
      durationMinutes: 20,
      isLocked: false,
      order: 2,
      reviewMode: 'NO_REVIEW',
      createdAt: '2026-09-03T08:00:00.000Z',
      updatedAt: '2026-09-03T08:00:00.000Z',
    },
    {
      id: 'assign-3',
      lessonId: 'lesson-2',
      title: 'Nhiệm vụ 02: Rèn luyện tính Tự chủ ở tuổi thiếu niên',
      type: 'luyen_tap',
      code: 'TUCHU-9A',
      description: 'Học cách quản lý cảm xúc trước áp lực học tập và các cám dỗ mạng xã hội.',
      durationMinutes: 15,
      isLocked: false,
      order: 1,
      reviewMode: 'NO_REVIEW',
      createdAt: '2026-09-05T08:00:00.000Z',
      updatedAt: '2026-09-05T08:00:00.000Z',
    },
    {
      id: 'assign-4',
      lessonId: 'lesson-3',
      title: 'Phiếu củng cố: Dân chủ gắn liền với Kỉ luật',
      type: 'phieu_cung_co',
      code: 'DANCHU-9',
      description: 'Tìm hiểu mối quan hệ hai chiều giữa quyền làm chủ và trách nhiệm kỷ luật tập thể.',
      durationMinutes: 15,
      isLocked: false,
      order: 1,
      reviewMode: 'NO_REVIEW',
      createdAt: '2026-09-10T08:00:00.000Z',
      updatedAt: '2026-09-10T08:00:00.000Z',
    },
    {
      id: 'assign-5',
      lessonId: 'lesson-4',
      title: 'Vận dụng: Sứ giả Hòa bình học đường',
      type: 'van_dung',
      code: 'HOABINH-9',
      description: 'Hành động thiết thực phòng chống bạo lực học đường và xây dựng môi trường văn minh.',
      durationMinutes: 20,
      isLocked: false,
      order: 1,
      reviewMode: 'NO_REVIEW',
      createdAt: '2026-09-12T08:00:00.000Z',
      updatedAt: '2026-09-12T08:00:00.000Z',
    },
  ];

  const questions: Question[] = [
    // Questions for assign-1: BÀI 1. SỐNG CÓ LÍ TƯỞNG — THỬ THÁCH “LA BÀN TUỔI 15”
    // THỬ THÁCH 1
    {
      id: 'q-1-1',
      assignmentId: 'assign-1',
      order: 1,
      content: '🧠 THỬ THÁCH 1 — BẮT ĐÚNG “LÍ TƯỞNG” (⏱️ 1 phút)\n\nTheo em, bạn nào dưới đây thể hiện sống có lí tưởng rõ nhất?',
      options: [
        { key: 'A', text: 'Minh muốn nổi tiếng nên làm mọi cách để nhiều người biết đến mình.' },
        { key: 'B', text: 'Lan đặt mục tiêu học tốt để phát triển bản thân và sau này tạo ra những sản phẩm hữu ích cho cộng đồng.' },
        { key: 'C', text: 'Nam chưa cần nghĩ đến tương lai vì “đến đâu hay đến đó”.' },
        { key: 'D', text: 'An chỉ chọn việc nào đem lại lợi ích cho riêng mình.' },
      ],
      correctOption: 'B',
      explanation: 'Đáp án: B. Lan đặt mục tiêu vừa phát triển bản thân vừa hướng tới những giá trị tốt đẹp, tạo ra sản phẩm hữu ích cho cộng đồng.',
      points: 1.0,
    },
    {
      id: 'q-1-2',
      assignmentId: 'assign-1',
      order: 2,
      content: '🔑 THỬ THÁCH 1 — TỪ KHÓA EM VỪA PHÁT HIỆN\n\nLí tưởng không chỉ hướng tới BẢN THÂN mà còn hướng tới những giá trị tốt đẹp cho ___________?',
      options: [
        { key: 'A', text: 'Cộng đồng, xã hội, quê hương đất nước và nhân loại' },
        { key: 'B', text: 'Riêng cá nhân mình và người thân trong gia đình' },
        { key: 'C', text: 'Sự nổi tiếng nhất thời và lượt theo dõi trên mạng xã hội' },
        { key: 'D', text: 'Những quyền lợi vật chất trước mắt' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: "cộng đồng / xã hội / đất nước, nhân loại". Lí tưởng chân chính luôn gắn liền với lợi ích chung của tập thể và xã hội.',
      points: 1.0,
    },

    // THỬ THÁCH 2
    {
      id: 'q-1-3',
      assignmentId: 'assign-1',
      order: 3,
      content: '🧩 THỬ THÁCH 2 — GHÉP MẢNH “SỐNG CÓ LÍ TƯỞNG” (⏱️ 1,5 phút | Nối cặp)\n\nNối mỗi biểu hiện ở cột A với ý phù hợp nhất ở cột B:\n\n• CỘT A:\n  1. Có đích đến rõ ràng\n  2. Biết mình cần làm gì\n  3. Không bỏ cuộc khi gặp khó\n  4. Bắt tay thực hiện từ hôm nay\n\n• CỘT B:\n  A. Kiên trì\n  B. Mục đích\n  C. Hành động\n  D. Kế hoạch\n\nEm hãy chọn phương án ghép cặp chính xác nhất:',
      options: [
        { key: 'A', text: '1–B ; 2–D ; 3–A ; 4–C' },
        { key: 'B', text: '1–A ; 2–B ; 3–C ; 4–D' },
        { key: 'C', text: '1–D ; 2–B ; 3–A ; 4–C' },
        { key: 'D', text: '1–B ; 2–A ; 3–D ; 4–C' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 1–B (Có đích đến rõ ràng → Mục đích) ; 2–D (Biết mình cần làm gì → Kế hoạch) ; 3–A (Không bỏ cuộc khi gặp khó → Kiên trì) ; 4–C (Bắt tay thực hiện từ hôm nay → Hành động).',
      points: 1.0,
    },
    {
      id: 'q-1-4',
      assignmentId: 'assign-1',
      order: 4,
      content: '🔐 THỬ THÁCH 2 — GIẢI MÃ MẬT MÃ\n\nHoàn thành công thức mật mã quan trọng sau:\n\nMỤC ĐÍCH + KẾ HOẠCH + HÀNH ĐỘNG + KIÊN TRÌ → SỐNG CÓ ____________.',
      options: [
        { key: 'A', text: 'LÍ TƯỞNG' },
        { key: 'B', text: 'MAY MẮN' },
        { key: 'C', text: 'AN NHÀN' },
        { key: 'D', text: 'DANH VỌNG' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: Mật mã: LÍ TƯỞNG. Khi một người có mục đích tốt đẹp, kế hoạch rõ ràng, hành động quyết liệt và kiên trì không bỏ cuộc, người đó đang sống có lí tưởng.',
      points: 1.0,
    },

    // THỬ THÁCH 3
    {
      id: 'q-1-5',
      assignmentId: 'assign-1',
      order: 5,
      content: '🚦 THỬ THÁCH 3 — “MỤC TIÊU” HAY “LÍ TƯỞNG”? (Phân loại 1)\n💡 Bẫy tư duy: Không phải mọi mục tiêu cá nhân đều tự động trở thành lí tưởng sống.\n\nĐiều một bạn trẻ mong muốn:\n«1. Đạt 8 điểm môn Toán học kì này» thuộc loại nào?',
      options: [
        { key: 'A', text: '🎯 Mục tiêu cá nhân' },
        { key: 'B', text: '🌟 Có thể gắn với lí tưởng sống' },
        { key: 'C', text: 'Lí tưởng suốt đời' },
        { key: 'D', text: 'Mục tiêu phục vụ cộng đồng' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 1 → Mục tiêu cá nhân. Đây là mục tiêu cụ thể, ngắn hạn trong học tập của cá nhân học sinh.',
      points: 0.5,
    },
    {
      id: 'q-1-6',
      assignmentId: 'assign-1',
      order: 6,
      content: '🚦 THỬ THÁCH 3 — “MỤC TIÊU” HAY “LÍ TƯỞNG”? (Phân loại 2)\n\nĐiều một bạn trẻ mong muốn:\n«2. Học công nghệ để tạo sản phẩm hỗ trợ người khuyết tật» thuộc loại nào?',
      options: [
        { key: 'A', text: '🎯 Chỉ là mục tiêu cá nhân ngắn hạn' },
        { key: 'B', text: '🌟 Có thể gắn với lí tưởng sống' },
        { key: 'C', text: 'Sở thích giải trí đơn thuần' },
        { key: 'D', text: 'Nghĩa vụ pháp lý bắt buộc' },
      ],
      correctOption: 'B',
      explanation: 'Đáp án giáo viên: 2 → Có thể gắn với lí tưởng sống. Mục tiêu này mang giá trị nhân văn cao đẹp, hướng tới phục vụ và hỗ trợ người yếu thế trong cộng đồng.',
      points: 0.5,
    },
    {
      id: 'q-1-7',
      assignmentId: 'assign-1',
      order: 7,
      content: '🚦 THỬ THÁCH 3 — “MỤC TIÊU” HAY “LÍ TƯỞNG”? (Phân loại 3)\n\nĐiều một bạn trẻ mong muốn:\n«3. Chạy được 3 km trong tháng tới» thuộc loại nào?',
      options: [
        { key: 'A', text: '🎯 Mục tiêu cá nhân' },
        { key: 'B', text: '🌟 Có thể gắn với lí tưởng sống' },
        { key: 'C', text: 'Lí tưởng cống hiến cho xã hội' },
        { key: 'D', text: 'Trách nhiệm với quốc gia' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 3 → Mục tiêu cá nhân. Đây là mục tiêu rèn luyện thể chất riêng cho bản thân trong một khoảng thời gian nhất định.',
      points: 0.5,
    },
    {
      id: 'q-1-8',
      assignmentId: 'assign-1',
      order: 8,
      content: '🚦 THỬ THÁCH 3 — “MỤC TIÊU” HAY “LÍ TƯỞNG”? (Phân loại 4)\n\nĐiều một bạn trẻ mong muốn:\n«4. Rèn luyện để sau này làm công việc có ích cho xã hội» thuộc loại nào?',
      options: [
        { key: 'A', text: '🎯 Mục tiêu cá nhân hạn hẹp' },
        { key: 'B', text: '🌟 Có thể gắn với lí tưởng sống' },
        { key: 'C', text: 'Ước mơ không khả thi' },
        { key: 'D', text: 'Chỉ là sự bắt chước' },
      ],
      correctOption: 'B',
      explanation: 'Đáp án giáo viên: 4 → Có thể gắn với lí tưởng sống. Mục tiêu định hướng cống hiến cho xã hội là nền tảng hình thành lí tưởng sống cao đẹp của thanh thiếu niên.',
      points: 0.5,
    },

    // THỬ THÁCH 4
    {
      id: 'q-1-9',
      assignmentId: 'assign-1',
      order: 9,
      content: '⚡ THỬ THÁCH 4 — “QUÉT” HÀNH VI TRONG 30 GIÂY (Nhận định 1)\n⏱️ Đánh giá tính Đúng (✓) hoặc Sai (✗):\n\n«1. Có lí tưởng thì chỉ cần ước mơ thật lớn.»',
      options: [
        { key: 'A', text: '✗ Sai (Chỉ ước mơ lớn mà không hành động thực tế thì không phải là sống có lí tưởng)' },
        { key: 'B', text: '✓ Đúng (Chỉ cần có ước mơ thật lớn là đủ trở thành người có lí tưởng)' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 1 ✗ (Sai). Ước mơ lớn nếu thiếu kế hoạch và hành động kiên trì thì chỉ là mơ mộng viển vông, không phải sống có lí tưởng.',
      points: 0.5,
    },
    {
      id: 'q-1-10',
      assignmentId: 'assign-1',
      order: 10,
      content: '⚡ THỬ THÁCH 4 — “QUÉT” HÀNH VI TRONG 30 GIÂY (Nhận định 2)\n⏱️ Đánh giá tính Đúng (✓) hoặc Sai (✗):\n\n«2. Học tập nghiêm túc cũng là một cách học sinh từng bước thực hiện lí tưởng.»',
      options: [
        { key: 'A', text: '✓ Đúng (Học tập chăm chỉ là nền tảng tri thức và kỹ năng để hiện thực hóa ước mơ)' },
        { key: 'B', text: '✗ Sai (Học sinh đi học chỉ là nghĩa vụ, chưa liên quan đến lí tưởng sống)' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 2 ✓ (Đúng). Việc học tập nghiêm túc mỗi ngày chính là hành động thiết thực nhất của lứa tuổi học sinh để chuẩn bị hành trang thực hiện lí tưởng.',
      points: 0.5,
    },
    {
      id: 'q-1-11',
      assignmentId: 'assign-1',
      order: 11,
      content: '⚡ THỬ THÁCH 4 — “QUÉT” HÀNH VI TRONG 30 GIÂY (Nhận định 3)\n⏱️ Đánh giá tính Đúng (✓) hoặc Sai (✗):\n\n«3. Lí tưởng tốt đẹp có thể tạo động lực để con người vượt khó.»',
      options: [
        { key: 'A', text: '✓ Đúng (Lí tưởng soi sáng con đường và tiếp thêm nghị lực vượt qua thử thách)' },
        { key: 'B', text: '✗ Sai (Lí tưởng chỉ là lý thuyết, không tạo ra sức mạnh thực tế)' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 3 ✓ (Đúng). Lí tưởng sống đúng đắn và cao đẹp luôn là ngọn đuốc soi đường và điểm tựa tinh thần vững chắc giúp con người vượt qua mọi gian khó.',
      points: 0.5,
    },
    {
      id: 'q-1-12',
      assignmentId: 'assign-1',
      order: 12,
      content: '⚡ THỬ THÁCH 4 — “QUÉT” HÀNH VI TRONG 30 GIÂY (Nhận định 4)\n⏱️ Đánh giá tính Đúng (✓) hoặc Sai (✗):\n\n«4. Phải làm được việc thật lớn mới được xem là sống có lí tưởng.»',
      options: [
        { key: 'A', text: '✗ Sai (Sống có lí tưởng bắt nguồn từ những việc làm cụ thể, có ích hàng ngày)' },
        { key: 'B', text: '✓ Đúng (Chỉ những vĩ nhân làm nên việc chấn động thế giới mới có lí tưởng)' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 4 ✗ (Sai). Không phải đợi làm việc vĩ đại mới là có lí tưởng; sống có lí tưởng thể hiện qua trách nhiệm, sự nỗ lực làm tốt từng việc nhỏ mỗi ngày.',
      points: 0.5,
    },
    {
      id: 'q-1-13',
      assignmentId: 'assign-1',
      order: 13,
      content: '⚡ THỬ THÁCH 4 — “QUÉT” HÀNH VI TRONG 30 GIÂY (Nhận định 5)\n⏱️ Đánh giá tính Đúng (✓) hoặc Sai (✗):\n\n«5. Rèn luyện phẩm chất, năng lực và trách nhiệm với cộng đồng là việc học sinh có thể bắt đầu ngay.»',
      options: [
        { key: 'A', text: '✓ Đúng (Học sinh hoàn toàn có thể bắt tay thực hiện ngay từ những việc ở trường lớp, gia đình)' },
        { key: 'B', text: '✗ Sai (Học sinh còn nhỏ tuổi, phải đợi đến khi ra trường mới bắt đầu)' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 5 ✓ (Đúng). Tuổi 15 là giai đoạn vàng để học sinh bắt đầu rèn luyện đạo đức, tích lũy kiến thức và xây dựng ý thức trách nhiệm với cộng đồng.',
      points: 0.5,
    },

    // THỬ THÁCH 5
    {
      id: 'q-1-14',
      assignmentId: 'assign-1',
      order: 14,
      content: '🔎 THỬ THÁCH 5 — AI ĐÃ “CÀI” SAI MỘT CHI TIẾT? (⏱️ 1 phút)\n\nMột AI viết:\n🤖 “Sống có lí tưởng là có một ước mơ mình yêu thích. Chỉ cần xác định được ước mơ ấy thì đã là sống có lí tưởng, không nhất thiết phải hành động để thực hiện.”\n\nCó 01 chi tiết quan trọng chưa hợp lí. Em hãy phát hiện phần sai và chọn miếng vá thích hợp nhất:',
      options: [
        { key: 'A', text: 'Lí tưởng chỉ dành cho người trưởng thành.' },
        { key: 'B', text: 'Cần nỗ lực/phấn đấu bằng hành động để thực hiện mục đích.' },
        { key: 'C', text: 'Lí tưởng càng khó thực hiện càng tốt.' },
        { key: 'D', text: 'Chỉ cần thay đổi ước mơ thường xuyên theo xu hướng.' },
      ],
      correctOption: 'B',
      explanation: 'Đáp án giáo viên: Chọn “Cần nỗ lực/phấn đấu bằng hành động để thực hiện mục đích.” AI sai ở chỗ nói rằng "không nhất thiết phải hành động", vì lí tưởng bắt buộc phải đi liền với hành động thực tiễn.',
      points: 1.0,
    },

    // THỬ THÁCH 6
    {
      id: 'q-1-15',
      assignmentId: 'assign-1',
      order: 15,
      content: '🎮 THỬ THÁCH 6 — “NẾU LÀ EM?” (⏱️ 2 phút | Giải quyết tình huống)\n\n• Tình huống:\nMai muốn sau này làm một công việc có ích cho cộng đồng. Nhưng gần đây Mai thường thức khuya xem video, đi học thiếu tập trung và nghĩ:\n“Lí tưởng là chuyện của tương lai. Lớp 9 chưa cần làm gì cả.”\n\nNếu là bạn của Mai, em sẽ gửi cho Mai 02 nút hành động đúng đắn nào?',
      options: [
        { key: 'A', text: '📚 Xây dựng lại thói quen học tập + 💪 Rèn luyện phẩm chất, sức khỏe và năng lực từ bây giờ.' },
        { key: 'B', text: '📱 Xem tiếp, sau này thay đổi cũng được + 💤 Chờ đến khi có cảm hứng mới bắt đầu.' },
        { key: 'C', text: '👀 Chỉ cần theo dõi những người thành công trên mạng + 📱 Xem tiếp video giải trí.' },
        { key: 'D', text: '💤 Chờ đến khi có cảm hứng mới bắt đầu + 👀 Theo dõi người thành công trên mạng.' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: 📚 Xây dựng lại thói quen học tập + 💪 Rèn luyện phẩm chất, sức khỏe và năng lực từ bây giờ. Mai cần hiểu rằng tương lai được dệt nên từ những thói quen tốt ngay hôm nay.',
      points: 1.0,
    },

    // THỬ THÁCH 7
    {
      id: 'q-1-16',
      assignmentId: 'assign-1',
      order: 16,
      content: '🪜 THỬ THÁCH 7 — XẾP ĐÚNG “ĐƯỜNG ĐI” (⏱️ 1 phút | Sắp xếp hành trình)\n\nMột học sinh có 4 “mảnh ghép”:\nA. Hành động\nB. Xác định mục đích tốt đẹp\nC. Kiên trì điều chỉnh và tiếp tục\nD. Lập kế hoạch\n\nHãy sắp xếp thành một hành trình hợp lí:',
      options: [
        { key: 'A', text: 'B → D → A → C' },
        { key: 'B', text: 'A → B → C → D' },
        { key: 'C', text: 'D → A → B → C' },
        { key: 'D', text: 'B → A → D → C' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: B → D → A → C (Xác định mục đích tốt đẹp → Lập kế hoạch → Bắt tay hành động → Kiên trì điều chỉnh và tiếp tục).',
      points: 1.0,
    },

    // THỬ THÁCH 8
    {
      id: 'q-1-17',
      assignmentId: 'assign-1',
      order: 17,
      content: '🇻🇳 THỬ THÁCH 8 — THANH NIÊN VIỆT NAM HÔM NAY (⏱️ 1 phút | Ba lô thanh niên)\n\nCho 7 thẻ hành vi và thói quen:\n📚 HỌC TẬP | 💪 RÈN LUYỆN | 🤝 HỢP TÁC | 🌱 CỐNG HIẾN | 🇻🇳 XÂY DỰNG VÀ BẢO VỆ TỔ QUỐC | 😴 Ỷ LẠI | 🙈 THỜ Ơ\n\nHãy chọn đúng 5 thẻ xứng đáng đưa vào “BA LÔ THANH NIÊN VIỆT NAM”:',
      options: [
        { key: 'A', text: '📚 Học tập – 💪 Rèn luyện – 🤝 Hợp tác – 🌱 Cống hiến – 🇻🇳 Xây dựng và bảo vệ Tổ quốc' },
        { key: 'B', text: 'Học tập – Rèn luyện – Ỷ lại – Thờ ơ – Hợp tác' },
        { key: 'C', text: 'Cống hiến – Thờ ơ – Hợp tác – Học tập – Ỷ lại' },
        { key: 'D', text: 'Xây dựng và bảo vệ Tổ quốc – Ỷ lại – Rèn luyện – Thờ ơ – Cống hiến' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: Học tập – Rèn luyện – Hợp tác – Cống hiến – Xây dựng và bảo vệ Tổ quốc. Cần kiên quyết loại bỏ 2 thói xấu tiêu cực là "Ỷ lại" và "Thờ ơ".',
      points: 1.0,
    },

    // CHỐT PHIẾU
    {
      id: 'q-1-18',
      assignmentId: 'assign-1',
      order: 18,
      content: '❤️ CHỐT PHIẾU — “1% TỐT HƠN TỪ NGÀY MAI” (⏱️ 1 phút | Vận dụng cá nhân)\n\n«Không cần viết lí tưởng thật to lớn. Lí tưởng cho ta hướng đi. Hành động hôm nay đưa ta đến gần hướng đi ấy.»\n\n🏆 THANH TIẾN TRÌNH: HIỂU BÀI 🧠 → NHỚ BÀI 🔑 → BIẾT LÀM 💪 → MUỐN TIẾN LÊN 🚀\nChọn đúng cam kết 7 ngày thiết thực nhất của em:',
      options: [
        { key: 'A', text: 'Chọn 01 việc nhỏ có thể làm ngay (tập trung học, bớt 20 phút điện thoại, hoàn thành việc trì hoãn, giúp đỡ người khác) và kiên trì thực hiện trong 7 ngày.' },
        { key: 'B', text: 'Đặt ra kế hoạch vĩ mô xa vời nhưng vẫn giữ nguyên thói quen thức khuya và lười biếng.' },
        { key: 'C', text: 'Cho rằng lứa tuổi học sinh lớp 8, lớp 9 chưa cần rèn luyện phẩm chất hay thói quen tốt.' },
        { key: 'D', text: 'Chỉ rèn luyện khi có cô giáo hoặc cha mẹ nhắc nhở, không có ý thức tự giác.' },
      ],
      correctOption: 'A',
      explanation: 'Đáp án giáo viên: Tinh thần của Chốt phiếu là "1% tốt hơn từ ngày mai", học sinh chọn 01 việc nhỏ có thể bắt đầu ngay và kiên trì rèn luyện thói quen tốt trong 7 ngày.',
      points: 0.5,
    },

    // Questions for assign-3 (TUCHU-9A)
    {
      id: 'q-3-1',
      assignmentId: 'assign-3',
      order: 1,
      content: 'Người có tính tự chủ thường thể hiện biểu hiện nào sau đây khi đứng trước tình huống bất ngờ?',
      options: [
        { key: 'A', text: 'Nóng nảy, hành động ngay theo cảm xúc bột phát.' },
        { key: 'B', text: 'Bình tĩnh, suy nghĩ thấu đáo trước khi đưa ra quyết định.' },
        { key: 'C', text: 'Hoang mang, lo lắng và đùn đẩy trách nhiệm cho người khác.' },
        { key: 'D', text: 'Bắt chước phản ứng của đám đông xung quanh.' },
      ],
      correctOption: 'B',
      explanation: 'Tự chủ là làm chủ suy nghĩ và hành động, giữ được sự điềm tĩnh và phán đoán sáng suốt.',
      points: 2.5,
    },
    {
      id: 'q-3-2',
      assignmentId: 'assign-3',
      order: 2,
      content: 'Trước kỳ thi quan trọng, Nam nhận được lời rủ đi chơi game thâu đêm từ nhóm bạn quen. Hành động thể hiện tính tự chủ cao nhất của Nam là:',
      options: [
        { key: 'A', text: 'Tham gia một nửa thời gian rồi về để bạn bè không chê cười.' },
        { key: 'B', text: 'Lịch sự từ chối, giải thích lý do và tập trung hoàn thành kế hoạch ôn tập.' },
        { key: 'C', text: 'Đi chơi thoải mái rồi mai thi chép bài của bạn.' },
        { key: 'D', text: 'Trách mắng gay gắt nhóm bạn vì đã rủ rê mình.' },
      ],
      correctOption: 'B',
      explanation: 'Tự chủ là biết từ chối các cám dỗ, kiên định mục tiêu học tập chính đáng của mình.',
      points: 2.5,
    },
    {
      id: 'q-3-3',
      assignmentId: 'assign-3',
      order: 3,
      content: 'Ý kiến nào sau đây đúng khi nói về mối quan hệ giữa tự chủ và việc tiếp thu ý kiến của người khác?',
      options: [
        { key: 'A', text: 'Người tự chủ tuyệt đối không bao giờ nghe lời khuyên của bất kỳ ai.' },
        { key: 'B', text: 'Người tự chủ biết lắng nghe, chọn lọc và quyết định trên nền tảng đúng đắn.' },
        { key: 'C', text: 'Tự chủ đồng nghĩa với việc bảo thủ, khăng khăng ý kiến cá nhân.' },
        { key: 'D', text: 'Ai nói gì cũng đồng ý để thể hiện tính lịch sự.' },
      ],
      correctOption: 'B',
      explanation: 'Tự chủ không phải là độc đoán hay cố chấp, mà là biết lắng nghe thông minh và có chính kiến độc lập.',
      points: 2.5,
    },
    {
      id: 'q-3-4',
      assignmentId: 'assign-3',
      order: 4,
      content: 'Để rèn luyện tính tự chủ, học sinh lớp 9 KHÔNG NÊN làm điều gì sau đây?',
      options: [
        { key: 'A', text: 'Tập suy nghĩ kỹ trước khi phát ngôn trên mạng xã hội.' },
        { key: 'B', text: 'Buông thả bản thân theo các trào lưu tiêu cực khi bị kích động.' },
        { key: 'C', text: 'Tự giác lập thời gian biểu và nghiêm túc thực hiện.' },
        { key: 'D', text: 'Tập hít thở sâu và lấy lại bình tĩnh khi có tranh cãi.' },
      ],
      correctOption: 'B',
      explanation: 'Buông thả theo cám dỗ hoặc kích động là biểu hiện đối lập hoàn toàn với tính tự chủ.',
      points: 2.5,
    },
  ];

  const students: Student[] = [];

  const submissions: Submission[] = [
    {
      id: 'sub-1',
      assignmentId: 'assign-1',
      assignmentTitle: 'Nhiệm vụ 01: Nhận diện phẩm chất Chí công vô tư',
      lessonNumber: 1,
      lessonTitle: 'Chí công vô tư',
      studentId: 'hs-1',
      studentName: 'Nguyễn Minh Anh',
      studentClass: '9A10',
      startTime: '2026-09-05T08:00:00.000Z',
      serverDueTime: '2026-09-05T08:15:00.000Z',
      submittedAt: '2026-09-05T08:12:37.000Z',
      totalTimeSeconds: 757, // 12:37
      status: 'SUBMITTED_LOCKED',
      score: 8.5,
      maxScore: 10,
      correctCount: 4,
      totalQuestions: 5,
      isLate: false,
    },
    {
      id: 'sub-2',
      assignmentId: 'assign-3',
      assignmentTitle: 'Nhiệm vụ 02: Rèn luyện tính Tự chủ ở tuổi thiếu niên',
      lessonNumber: 2,
      lessonTitle: 'Tự chủ',
      studentId: 'hs-1',
      studentName: 'Nguyễn Minh Anh',
      studentClass: '9A10',
      startTime: '2026-09-12T08:00:00.000Z',
      serverDueTime: '2026-09-12T08:15:00.000Z',
      submittedAt: '2026-09-12T08:10:42.000Z',
      totalTimeSeconds: 642, // 10:42
      status: 'SUBMITTED_LOCKED',
      score: 9.0,
      maxScore: 10,
      correctCount: 4,
      totalQuestions: 4,
      isLate: false,
    },
    {
      id: 'sub-3',
      assignmentId: 'assign-1',
      assignmentTitle: 'Nhiệm vụ 01: Nhận diện phẩm chất Chí công vô tư',
      lessonNumber: 1,
      lessonTitle: 'Chí công vô tư',
      studentId: 'hs-2',
      studentName: 'Trần Bảo Nam',
      studentClass: '9A10',
      startTime: '2026-09-05T08:05:00.000Z',
      serverDueTime: '2026-09-05T08:20:00.000Z',
      submittedAt: '2026-09-05T08:18:15.000Z',
      totalTimeSeconds: 795,
      status: 'SUBMITTED_LOCKED',
      score: 10.0,
      maxScore: 10,
      correctCount: 5,
      totalQuestions: 5,
      isLate: false,
    },
    {
      id: 'sub-4',
      assignmentId: 'assign-1',
      assignmentTitle: 'Nhiệm vụ 01: Nhận diện phẩm chất Chí công vô tư',
      lessonNumber: 1,
      lessonTitle: 'Chí công vô tư',
      studentId: 'hs-3',
      studentName: 'Lê Phương Linh',
      studentClass: '9A8',
      startTime: '2026-09-05T08:10:00.000Z',
      serverDueTime: '2026-09-05T08:25:00.000Z',
      submittedAt: '2026-09-05T08:21:00.000Z',
      totalTimeSeconds: 660,
      status: 'SUBMITTED_LOCKED',
      score: 9.5,
      maxScore: 10,
      correctCount: 5,
      totalQuestions: 5,
      isLate: false,
    },
    {
      id: 'sub-5',
      assignmentId: 'assign-1',
      assignmentTitle: 'Nhiệm vụ 01: Nhận diện phẩm chất Chí công vô tư',
      lessonNumber: 1,
      lessonTitle: 'Chí công vô tư',
      studentId: 'hs-4',
      studentName: 'Hoàng Đức Anh',
      studentClass: '9A9',
      startTime: '2026-09-05T08:00:00.000Z',
      serverDueTime: '2026-09-05T08:15:00.000Z',
      submittedAt: '2026-09-05T08:16:10.000Z',
      totalTimeSeconds: 970,
      status: 'SUBMITTED_LOCKED',
      score: 7.0,
      maxScore: 10,
      correctCount: 3,
      totalQuestions: 5,
      isLate: true,
    },
  ];

  const answers: StudentAnswer[] = [
    // Answers for sub-1 (Nguyen Minh Anh)
    { id: 'ans-1-1', submissionId: 'sub-1', questionId: 'q-1-1', selectedOption: 'B', savedAt: '2026-09-05T08:02:10.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-1-2', submissionId: 'sub-1', questionId: 'q-1-2', selectedOption: 'C', savedAt: '2026-09-05T08:05:22.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-1-3', submissionId: 'sub-1', questionId: 'q-1-3', selectedOption: 'A', savedAt: '2026-09-05T08:08:10.000Z', isCorrect: false, pointsEarned: 0 },
    { id: 'ans-1-4', submissionId: 'sub-1', questionId: 'q-1-4', selectedOption: 'A', savedAt: '2026-09-05T08:10:45.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-1-5', submissionId: 'sub-1', questionId: 'q-1-5', selectedOption: 'B', savedAt: '2026-09-05T08:12:30.000Z', isCorrect: true, pointsEarned: 2 },

    // Answers for sub-2 (Nguyen Minh Anh - lesson 2)
    { id: 'ans-2-1', submissionId: 'sub-2', questionId: 'q-3-1', selectedOption: 'B', savedAt: '2026-09-12T08:02:00.000Z', isCorrect: true, pointsEarned: 2.5 },
    { id: 'ans-2-2', submissionId: 'sub-2', questionId: 'q-3-2', selectedOption: 'B', savedAt: '2026-09-12T08:04:30.000Z', isCorrect: true, pointsEarned: 2.5 },
    { id: 'ans-2-3', submissionId: 'sub-2', questionId: 'q-3-3', selectedOption: 'B', savedAt: '2026-09-12T08:07:15.000Z', isCorrect: true, pointsEarned: 2.5 },
    { id: 'ans-2-4', submissionId: 'sub-2', questionId: 'q-3-4', selectedOption: 'B', savedAt: '2026-09-12T08:10:30.000Z', isCorrect: true, pointsEarned: 2.5 },

    // Answers for sub-3 (Tran Bao Nam)
    { id: 'ans-3-1', submissionId: 'sub-3', questionId: 'q-1-1', selectedOption: 'B', savedAt: '2026-09-05T08:06:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-3-2', submissionId: 'sub-3', questionId: 'q-1-2', selectedOption: 'C', savedAt: '2026-09-05T08:09:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-3-3', submissionId: 'sub-3', questionId: 'q-1-3', selectedOption: 'B', savedAt: '2026-09-05T08:12:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-3-4', submissionId: 'sub-3', questionId: 'q-1-4', selectedOption: 'A', savedAt: '2026-09-05T08:15:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-3-5', submissionId: 'sub-3', questionId: 'q-1-5', selectedOption: 'B', savedAt: '2026-09-05T08:18:00.000Z', isCorrect: true, pointsEarned: 2 },

    // Answers for sub-5 (Hoang Duc Anh - more mistakes on q-1-3 and q-1-4)
    { id: 'ans-5-1', submissionId: 'sub-5', questionId: 'q-1-1', selectedOption: 'B', savedAt: '2026-09-05T08:03:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-5-2', submissionId: 'sub-5', questionId: 'q-1-2', selectedOption: 'A', savedAt: '2026-09-05T08:07:00.000Z', isCorrect: false, pointsEarned: 0 },
    { id: 'ans-5-3', submissionId: 'sub-5', questionId: 'q-1-3', selectedOption: 'D', savedAt: '2026-09-05T08:11:00.000Z', isCorrect: false, pointsEarned: 0 },
    { id: 'ans-5-4', submissionId: 'sub-5', questionId: 'q-1-4', selectedOption: 'A', savedAt: '2026-09-05T08:14:00.000Z', isCorrect: true, pointsEarned: 2 },
    { id: 'ans-5-5', submissionId: 'sub-5', questionId: 'q-1-5', selectedOption: 'B', savedAt: '2026-09-05T08:16:00.000Z', isCorrect: true, pointsEarned: 2 },
  ];

  const settings: SystemSettings = {
    lockImmediatelyOnSubmit: true,
    hideAnswersAfterSubmit: true,
    preventViewingOthersSubmissions: true,
    teacherOnlyReview: true,
    showScoreAfterSubmit: true,
    showTimeAfterSubmit: true,
    showCorrectAnswersAfterSubmit: false,
    allowReviewDetailAfterSubmit: false,
    isBannerLocked: true,
    schoolName: 'TRƯỜNG THCS TÂN HẢI',
    customBannerImage: '/uploads/banner_1790495237357_fdc4121b.png',
    useCustomBanner: true,
    bannerFitMode: 'contain',
    bannerBorderRadius: 'rounded-3xl',
    bannerShadow: 'shadow-xl',
    backgroundTheme: 'default',
  };

  const auditLogs: AuditLog[] = [
    {
      id: 'log-1',
      timestamp: '2026-09-01T08:00:00.000Z',
      actor: 'Hệ thống',
      action: 'Khởi tạo hệ thống',
      targetEntity: 'Hành trình Công dân nhí 9',
      details: 'Khởi tạo cấu trúc chương trình GDCD 9, phân quyền Cô An Na và 5 lớp 9A8-9A12',
    },
    {
      id: 'log-2',
      timestamp: '2026-09-16T10:00:00.000Z',
      actor: 'Cô An Na',
      action: 'Xóa học sinh ảo',
      targetEntity: 'Nguyễn Văn TestẢo – 9A10',
      details: 'Chuyển vào thùng rác do tên không hợp lệ',
    },
  ];

  return {
    version: 2,
    admins: [admin],
    adminPasswordHash: passwordHash,
    classes: INITIAL_CLASSES,
    students,
    lessons,
    assignments,
    questions,
    submissions,
    answers,
    settings,
    auditLogs,
  };
}

class DatabaseManager {
  private data: DatabaseSchema;

  constructor() {
    ensureDirectoryExists();
    this.data = this.loadDatabase();
  }

  private loadDatabase(): DatabaseSchema {
    try {
      if (fs.existsSync(DB_FILE)) {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        const parsed = JSON.parse(raw) as DatabaseSchema;
        // Migration check: If version < 3 or lessons are outdated/less than 10, update lessons to standard 10 Ket Noi Tri Thuc lessons
        if (parsed && parsed.version) {
          const hasInvalidClass =
            !parsed.classes ||
            parsed.classes.some((c) => !INITIAL_CLASSES.includes(c)) ||
            parsed.classes.length !== INITIAL_CLASSES.length;
          if (hasInvalidClass) {
            parsed.classes = INITIAL_CLASSES;
            parsed.students = [];
            parsed.submissions = [];
            parsed.answers = [];
            this.saveDatabase(parsed);
          }
          if (parsed.version < 3 || !parsed.lessons || parsed.lessons.length < 10 || parsed.lessons[0].title !== 'Sống có lí tưởng') {
            const initial = getInitialDatabase();
            parsed.version = 3;
            parsed.lessons = initial.lessons;
            this.saveDatabase(parsed);
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error('Lỗi khi đọc file database, khởi tạo dữ liệu mặc định:', e);
    }
    const initial = getInitialDatabase();
    this.saveDatabase(initial);
    return initial;
  }

  public saveDatabase(dataToSave?: DatabaseSchema): void {
    ensureDirectoryExists();
    const current = dataToSave || this.data;
    try {
      // Create backup
      if (fs.existsSync(DB_FILE)) {
        fs.copyFileSync(DB_FILE, BACKUP_FILE);
      }
      fs.writeFileSync(DB_FILE, JSON.stringify(current, null, 2), 'utf-8');
    } catch (err) {
      console.error('Lỗi khi lưu database:', err);
    }
  }

  public getData(): DatabaseSchema {
    return this.data;
  }

  // AUDIT LOG
  public addAuditLog(actor: string, action: string, targetEntity: string, details: string): void {
    const log: AuditLog = {
      id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      timestamp: new Date().toISOString(),
      actor,
      action,
      targetEntity,
      details,
    };
    this.data.auditLogs.unshift(log);
    // Keep last 300 logs
    if (this.data.auditLogs.length > 300) {
      this.data.auditLogs = this.data.auditLogs.slice(0, 300);
    }
    this.saveDatabase();
  }

  // ADMIN AUTH
  public verifyAdminPassword(inputPassword: string): boolean {
    return bcrypt.compareSync(inputPassword, this.data.adminPasswordHash);
  }

  public updateAdminPassword(newPassword: string, actor: string = 'Cô An Na'): void {
    const salt = bcrypt.genSaltSync(10);
    this.data.adminPasswordHash = bcrypt.hashSync(newPassword, salt);
    this.addAuditLog(actor, 'Đổi mật khẩu', 'Tài khoản Quản trị', 'Đã cập nhật mật khẩu quản trị mới an toàn');
    this.saveDatabase();
  }

  public getAdminProfile(): AdminUser {
    return this.data.admins[0];
  }
}

export const dbManager = new DatabaseManager();
