export interface KetNoiLessonDef {
  number: number;
  title: string;
  theme: 'dao_duc' | 'phap_luat' | 'ky_nang_song';
  description: string;
  defaultCode: string;
  icon: string;
}

export const KET_NOI_TRI_THUC_GDCD9_LESSONS: KetNoiLessonDef[] = [
  {
    number: 1,
    title: 'Sống có lí tưởng',
    theme: 'dao_duc',
    description: 'Xác định mục đích sống cao đẹp, kế hoạch phấn đấu học tập, rèn luyện vì tương lai bản thân và cống hiến cho quê hương, đất nước.',
    defaultCode: 'GDCD9-B1',
    icon: '🌟',
  },
  {
    number: 2,
    title: 'Khoan dung',
    theme: 'dao_duc',
    description: 'Rộng lòng tha thứ, tôn trọng và thông cảm với người khác, không định kiến hay cố chấp trước lỗi lầm đã biết sửa chữa.',
    defaultCode: 'GDCD9-B2',
    icon: '🤝',
  },
  {
    number: 3,
    title: 'Tích cực tham gia các hoạt động cộng đồng',
    theme: 'dao_duc',
    description: 'Tự giác, hăng hái tham gia phong trào tập thể, công tác thiện nguyện, xây dựng môi trường xanh - sạch - đẹp tại địa phương.',
    defaultCode: 'GDCD9-B3',
    icon: '🌱',
  },
  {
    number: 4,
    title: 'Khách quan và công bằng',
    theme: 'dao_duc',
    description: 'Nhìn nhận, đánh giá sự vật hiện tượng đúng bản chất thực tế; đối xử bình đẳng, không thiên vị hay tư lợi cá nhân.',
    defaultCode: 'GDCD9-B4',
    icon: '⚖️',
  },
  {
    number: 5,
    title: 'Bảo vệ hòa bình',
    theme: 'dao_duc',
    description: 'Nâng cao ý thức gìn giữ môi trường hòa bình, hữu nghị giữa các dân tộc, chủ động ngăn ngừa xung đột và bạo lực học đường.',
    defaultCode: 'GDCD9-B5',
    icon: '🕊️',
  },
  {
    number: 6,
    title: 'Quản lí thời gian hiệu quả',
    theme: 'ky_nang_song',
    description: 'Phương pháp lập kế hoạch học tập khoa học, phân loại thứ tự ưu tiên, tránh trì hoãn và cân bằng thời gian biểu cá nhân.',
    defaultCode: 'GDCD9-B6',
    icon: '⏰',
  },
  {
    number: 7,
    title: 'Thích ứng với thay đổi',
    theme: 'ky_nang_song',
    description: 'Kỹ năng làm quen với môi trường mới, ứng phó linh hoạt trước các biến chuyển tâm sinh lý lứa tuổi và kỷ nguyên số.',
    defaultCode: 'GDCD9-B7',
    icon: '🔄',
  },
  {
    number: 8,
    title: 'Tiêu dùng thông minh',
    theme: 'ky_nang_song',
    description: 'Kỹ năng lập ngân sách cá nhân, phân biệt giữa nhu cầu thiết yếu và mong muốn nhất thời, mua sắm an toàn và tiết kiệm.',
    defaultCode: 'GDCD9-B8',
    icon: '💡',
  },
  {
    number: 9,
    title: 'Vi phạm pháp luật và trách nhiệm pháp lí',
    theme: 'phap_luat',
    description: 'Nhận diện các hành vi vi phạm pháp luật hình sự, hành chính, dân sự, kỷ luật và các chế tài xử phạt theo quy định Nhà nước.',
    defaultCode: 'GDCD9-B9',
    icon: '🛡️',
  },
  {
    number: 10,
    title: 'Quyền tự do kinh doanh và nghĩa vụ nộp thuế',
    theme: 'phap_luat',
    description: 'Hiểu về quyền tự do kinh doanh đúng pháp luật và nghĩa vụ công dân đóng góp thuế vào ngân sách xây dựng đất nước.',
    defaultCode: 'GDCD9-B10',
    icon: '💼',
  },
];
