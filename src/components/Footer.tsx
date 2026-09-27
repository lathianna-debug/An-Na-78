import React from 'react';
import { Heart, BookOpen, ShieldCheck, Sparkles } from 'lucide-react';

export const Footer: React.FC<{ onOpenTeacherLogin?: () => void }> = ({ onOpenTeacherLogin }) => {
  return (
    <footer className="mt-16 bg-gradient-to-b from-white to-purple-50/70 border-t-2 border-indigo-200/80 text-slate-700 shadow-inner">
      <div className="max-w-6xl mx-auto px-4 py-8 sm:py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-start">
          {/* Brand & Slogan */}
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 flex items-center justify-center text-white text-xl shadow-md shadow-purple-300">
                🌟
              </div>
              <span className="font-black text-slate-900 tracking-tight text-base sm:text-lg">
                HÀNH TRÌNH CÔNG DÂN NHÍ
              </span>
            </div>
            <div className="flex flex-col gap-0.5">
              <span className="font-black text-xs uppercase tracking-wider text-purple-800">
                MÔN GIÁO DỤC CÔNG DÂN 9 — TRƯỜNG THCS TÂN HẢI
              </span>
              <span className="text-[11px] font-bold text-amber-700">
                🏫 Ngôi trường rèn đức, luyện tài, trưởng thành công dân tích cực
              </span>
            </div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-purple-100 to-indigo-100 text-purple-900 text-xs font-bold border border-purple-200 shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-purple-600" />
              <span>📚 Học bài • 🧠 Hiểu bài • ✨ Vận dụng • 🌱 Trưởng thành</span>
            </div>
          </div>

          {/* Classes & Modules */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <span>🏫 KHỐI 9 — TRƯỜNG THCS TÂN HẢI</span>
            </h4>
            <div className="flex flex-wrap gap-2 text-xs">
              {['9A8', '9A9', '9A10', '9A11', '9A12'].map((cls) => (
                <span
                  key={cls}
                  className="px-3 py-1 rounded-xl bg-white font-extrabold text-indigo-700 border-2 border-indigo-200/80 shadow-xs hover:border-indigo-400 transition"
                >
                  Lớp {cls}
                </span>
              ))}
            </div>
            <p className="text-xs text-slate-600 pt-1 leading-relaxed font-medium">
              Chương trình GDCD 9 (Kết nối tri thức): 10 bài học chuẩn bồi dưỡng đạo đức, pháp luật, kỹ năng sống và trách nhiệm công dân.
            </p>
          </div>

          {/* Admin & Security Notes */}
          <div className="space-y-2.5 text-xs">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Hệ thống Giáo dục Trực tuyến An Toàn
            </h4>
            <p className="text-slate-600 leading-relaxed font-medium">
              Dữ liệu bài làm học sinh và hình nền giao diện được khóa bảo vệ nghiêm ngặt trên máy chủ. Điểm và thống kê phục vụ quan sát tiến bộ của từng em.
            </p>
            {onOpenTeacherLogin && (
              <div className="pt-1">
                <button
                  onClick={onOpenTeacherLogin}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-100/80 text-purple-800 hover:bg-purple-200 font-bold transition border border-purple-200 shadow-xs"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-700" />
                  Khu vực Quản trị Giáo viên – Cô An Na
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-purple-100 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 font-medium gap-2">
          <p>© 2026 Hành trình Công dân nhí – Môn Giáo dục Công dân 9 – Trường THCS Tân Hải. Tất cả quyền được bảo lưu.</p>
          <p className="flex items-center gap-1 font-semibold text-purple-900">
            Đồng hành cùng học sinh lớp 9 trưởng thành <Heart className="w-4 h-4 text-rose-500 inline fill-rose-500" />
          </p>
        </div>
      </div>
    </footer>
  );
};
