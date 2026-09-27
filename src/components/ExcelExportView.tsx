import React, { useState } from 'react';
import { Download, FileSpreadsheet, CheckCircle2, School, Sparkles, Filter } from 'lucide-react';
import { api } from '../lib/api.ts';

export const ExcelExportView: React.FC = () => {
  const [selectedClass, setSelectedClass] = useState<string>('ALL');

  const exportUrl = api.getResultsExportUrl(selectedClass);

  const classes = [
    { value: 'ALL', label: 'Toàn bộ khối 9 (Tất cả lớp 9A8 – 9A12)' },
    { value: '9A8', label: 'Lớp 9A8' },
    { value: '9A9', label: 'Lớp 9A9' },
    { value: '9A10', label: 'Lớp 9A10' },
    { value: '9A11', label: 'Lớp 9A11' },
    { value: '9A12', label: 'Lớp 9A12' },
  ];

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>📥</span>
          <span>XUẤT DỮ LIỆU BÁO CÁO EXCEL</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Tải bảng điểm và kết quả làm bài chuẩn định dạng Excel (.xlsx) để cô báo cáo nhà trường hoặc lưu hồ sơ chuyên môn.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200/80 shadow-sm space-y-6">
        {/* Class selection options */}
        <div className="space-y-3">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
            <School className="w-4 h-4 text-purple-600" />
            <span>Chọn phạm vi lớp học cần xuất:</span>
          </label>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {classes.map((cls) => (
              <label
                key={cls.value}
                className={`p-3.5 rounded-2xl border-2 cursor-pointer transition flex items-center gap-3 select-none ${
                  selectedClass === cls.value
                    ? 'bg-purple-50/80 border-purple-600 shadow-sm text-purple-900 font-bold ring-2 ring-purple-100'
                    : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-700 font-medium'
                }`}
              >
                <input
                  type="radio"
                  name="classExport"
                  value={cls.value}
                  checked={selectedClass === cls.value}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className="w-4 h-4 text-purple-600 focus:ring-purple-500"
                />
                <span className="text-xs sm:text-sm">{cls.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Expected columns specification */}
        <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2 text-xs">
          <h4 className="font-bold text-slate-800 flex items-center gap-1.5">
            <FileSpreadsheet className="w-4 h-4 text-emerald-600" />
            <span>Định dạng file Excel gồm đầy đủ 12 cột chuẩn:</span>
          </h4>
          <div className="flex flex-wrap gap-1.5 pt-1">
            {[
              '1. STT',
              '2. Họ và tên',
              '3. Lớp',
              '4. Bài học',
              '5. Tên bài tập',
              '6. Điểm số',
              '7. Số câu đúng',
              '8. Thời gian làm',
              '9. Thời gian bắt đầu',
              '10. Thời gian nộp bài',
              '11. Trạng thái (Đã khóa)',
              '12. Đúng hạn / Quá hạn',
            ].map((col) => (
              <span
                key={col}
                className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-[11px]"
              >
                {col}
              </span>
            ))}
          </div>
        </div>

        {/* Download Action Button */}
        <a
          href={exportUrl}
          download
          className="w-full py-4 px-6 rounded-2xl font-extrabold text-white text-base bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 shadow-lg shadow-emerald-200 transition flex items-center justify-center gap-2.5 active:scale-95"
        >
          <Download className="w-5 h-5" />
          <span>📥 TẢI FILE EXCEL KẾT QUẢ (.XLSX)</span>
        </a>
      </div>
    </div>
  );
};
