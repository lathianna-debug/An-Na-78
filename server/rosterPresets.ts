// Danh sách học sinh chuẩn 5 lớp 9A8 đến 9A12 - Trường THCS Tân Hải
// Mỗi lớp 50 học sinh, STT từ 1 đến 50, hoàn toàn độc lập và không trùng lặp giữa các lớp

export const CLASS_NAMES = ['9A8', '9A9', '9A10', '9A11', '9A12'] as const;
export type TargetClassGrade9 = typeof CLASS_NAMES[number];

export const CLASS_ROSTER_50: Record<TargetClassGrade9, string[]> = {
  '9A8': [
    'Nguyễn Văn An', 'Trần Thị Bảo Ngọc', 'Lê Hoàng Long', 'Phạm Minh Châu', 'Vũ Đức Hải',
    'Đặng Quỳnh Như', 'Bùi Tuấn Kiệt', 'Ngô Mai Phương', 'Hoàng Gia Bảo', 'Đỗ Thùy Linh',
    'Dương Quốc Anh', 'Lý Hải Yến', 'Phan Thanh Tùng', 'Hồ Ngọc Mai', 'Võ Trọng Nghĩa',
    'Trịnh Hoài Nam', 'Mai Phương Thảo', 'Lương Anh Dũng', 'Đinh Thảo Nguyên', 'Cao Minh Trí',
    'Nguyễn Thị Kim Ngân', 'Trần Đức Phúc', 'Lê Minh Khôi', 'Phạm Thu Trang', 'Vũ Gia Huy',
    'Đặng Phương Anh', 'Bùi Nhật Minh', 'Ngô Đăng Khoa', 'Hoàng Khánh Linh', 'Đỗ Quang Huy',
    'Dương Bảo Châu', 'Lý Thành Đạt', 'Phan Ngọc Hân', 'Hồ Đăng Quang', 'Võ Hoàng Yến',
    'Trịnh Quốc Cường', 'Mai Diệu Huyền', 'Lương Tuấn Tú', 'Đinh Hồng Hạnh', 'Cao Bá Quát',
    'Nguyễn Tiến Đạt', 'Trần Khánh Vy', 'Lê Hữu Phước', 'Phạm Ngọc Ánh', 'Vũ Thiên An',
    'Đặng Hữu Tài', 'Bùi Hà My', 'Ngô Kiến Huy', 'Hoàng Yến Nhi', 'Đỗ Trọng Nhân'
  ],
  '9A9': [
    'Nguyễn Gia Hưng', 'Trần Thảo My', 'Lê Đình Trọng', 'Phạm Hoài An', 'Vũ Minh Quân',
    'Đặng Bích Ngọc', 'Bùi Thế Vinh', 'Ngô Trúc Linh', 'Hoàng Đức Duy', 'Đỗ Ngọc Bích',
    'Dương Văn Hùng', 'Lý Diễm My', 'Phan Văn Hậu', 'Hồ Cẩm Nhung', 'Võ Thành Trung',
    'Trịnh Kim Chi', 'Mai Văn Hậu', 'Lương Mỹ Duyên', 'Đinh Khắc Tiệp', 'Cao Thị Duyên',
    'Nguyễn Bảo Nam', 'Trần Cát Tường', 'Lê Duy Mạnh', 'Phạm Hồng Nhung', 'Vũ Văn Thanh',
    'Đặng Thùy Dung', 'Bùi Xuân Trường', 'Ngô Thị Thu', 'Hoàng Văn Toàn', 'Đỗ Minh Tuyết',
    'Dương Công Phượng', 'Lý Hồng Đào', 'Phan Anh Tuấn', 'Hồ Bích Trâm', 'Võ Tấn Phát',
    'Trịnh Thúy Vy', 'Mai Đức Chung', 'Lương Thùy Trang', 'Đinh Quang Hải', 'Cao Như Quỳnh',
    'Nguyễn Văn Quyết', 'Trần Thu Ngân', 'Lê Huỳnh Đức', 'Phạm Thanh Thủy', 'Vũ Minh Tuấn',
    'Đặng Lan Hương', 'Bùi Tiến Dũng', 'Ngô Thùy Tiên', 'Hoàng Minh Tâm', 'Đỗ Ánh Nguyệt'
  ],
  '9A10': [
    'Nguyễn Minh Anh', 'Trần Gia Khiêm', 'Lê Ái Vy', 'Phạm Tuấn Khang', 'Vũ Ngọc Diệp',
    'Đặng Đình Phong', 'Bùi Tố Uyên', 'Ngô Vĩnh Khang', 'Hoàng Tuyết Mai', 'Đỗ Chí Kiên',
    'Dương Lan Chi', 'Lý Phước Thịnh', 'Phan Kiều Oanh', 'Hồ Trọng Tấn', 'Võ Kim Oanh',
    'Trịnh Quốc Thái', 'Mai Thanh Trúc', 'Lương Quốc Huy', 'Đinh Diễm Quỳnh', 'Cao Bá Thắng',
    'Nguyễn Thúy Hằng', 'Trần Hải Đăng', 'Lê Cát Vy', 'Phạm Thế Anh', 'Vũ Thảo Vân',
    'Đặng Hùng Dũng', 'Bùi Mỹ Linh', 'Ngô Duy Khánh', 'Hoàng Thiên Kim', 'Đỗ Tấn Tài',
    'Dương Bích Thủy', 'Lý Hoàng Nam', 'Phan Thảo Uyên', 'Hồ Khắc Hiếu', 'Võ Cẩm Tú',
    'Trịnh Bảo Lâm', 'Mai Quỳnh Nga', 'Lương Hữu Thắng', 'Đinh Tuyết Nhung', 'Cao Văn Thắng',
    'Nguyễn Phương Vy', 'Trần Minh Hoàng', 'Lê Thục Trinh', 'Phạm Hữu Đạt', 'Vũ Kim Tuyến',
    'Đặng Duy Tân', 'Bùi Cẩm Ly', 'Ngô Thành Danh', 'Hoàng Bảo Trâm', 'Đỗ Phúc Khang'
  ],
  '9A11': [
    'Nguyễn Khắc Việt', 'Trần Kiều My', 'Lê Quang Liêm', 'Phạm Băng Băng', 'Vũ Thái Sơn',
    'Đặng Cẩm Ly', 'Bùi Đức Bo', 'Ngô Quỳnh Mai', 'Hoàng Phi Long', 'Đỗ Trà My',
    'Dương Văn Minh', 'Lý Nhã Kỳ', 'Phan Văn Mách', 'Hồ Quỳnh Hương', 'Võ Hoài Linh',
    'Trịnh Thăng Bình', 'Mai Tài Phến', 'Lương Gia Huy', 'Đinh Ngọc Diệp', 'Cao Thái Hà',
    'Nguyễn Hoàng Tôn', 'Trần Thùy Chi', 'Lê Hiếu Nghĩa', 'Phạm Quỳnh Anh', 'Vũ Cát Tường',
    'Đặng Thu Thảo', 'Bùi Anh Tuấn', 'Ngô Thanh Vân', 'Hoàng Thùy Linh', 'Đỗ Mỹ Linh',
    'Dương Triệu Vũ', 'Lý Quí Khánh', 'Phan Mạnh Quỳnh', 'Hồ Quang Hiếu', 'Võ Hạ Trâm',
    'Trịnh Đình Quang', 'Mai Khôi Nguyên', 'Lương Bích Hữu', 'Đinh Y Nhung', 'Cao Thái Sơn',
    'Nguyễn Đình Dũng', 'Trần Tiểu Vy', 'Lê Bảo Bình', 'Phạm Lịch', 'Vũ Hà Anh',
    'Đặng Tiểu Tô Oanh', 'Bùi Công Nam', 'Ngô Lan Anh', 'Hoàng Dũng', 'Đỗ Hoàng Dương'
  ],
  '9A12': [
    'Nguyễn Xuân Phúc', 'Trần Thị Diệu', 'Lê Văn Lương', 'Phạm Hồng Thái', 'Vũ Trọng Phụng',
    'Đặng Thùy Trâm', 'Bùi Bằng Đoàn', 'Ngô Tất Tố', 'Hoàng Hoa Thám', 'Đỗ Phủ',
    'Dương Bá Trạc', 'Lý Tự Trọng', 'Phan Bội Châu', 'Hồ Xuân Hương', 'Võ Thị Sáu',
    'Trịnh Hoài Đức', 'Mai An Tiêm', 'Lương Thế Vinh', 'Đinh Bộ Lĩnh', 'Cao Thắng',
    'Nguyễn Trãi', 'Trần Hưng Đạo', 'Lê Quý Đôn', 'Phạm Ngũ Lão', 'Vũ Duệ',
    'Đặng Dung', 'Bùi Viện', 'Ngô Thì Nhậm', 'Hoàng Diệu', 'Đỗ Cảnh Thạc',
    'Dương Đình Nghệ', 'Lý Thường Kiệt', 'Phan Châu Trinh', 'Hồ Biểu Chánh', 'Võ Trường Toản',
    'Trịnh Kiểm', 'Mai Thúc Loan', 'Lương Văn Can', 'Đinh Tiên Hoàng', 'Cao Bá Nhạ',
    'Nguyễn Huệ', 'Trần Bình Trọng', 'Lê Lợi', 'Phạm Đình Hổ', 'Vũ Miên',
    'Đặng Trần Côn', 'Bùi Huy Bích', 'Ngô Sĩ Liên', 'Hoàng Ngọc Phách', 'Đỗ Thế Diên'
  ]
};
