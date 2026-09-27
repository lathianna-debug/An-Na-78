import React from 'react';
import { Sparkles, Shield, User, LogOut, Home, Compass } from 'lucide-react';
import { AdminUser } from '../types.ts';

interface HeaderProps {
  currentView: 'home' | 'student-mission' | 'teacher-dashboard' | 'exam';
  onNavigate: (view: 'home' | 'student-mission' | 'teacher-dashboard') => void;
  adminUser: AdminUser | null;
  onAdminLogout: () => void;
  onOpenTeacherLogin: () => void;
  onOpenChangeBackground?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  adminUser,
  onAdminLogout,
  onOpenTeacherLogin,
  onOpenChangeBackground,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b-2 border-indigo-200/80 shadow-md shadow-indigo-100/50 transition-all">
      {/* Top Banner with School Name & Slogan */}
      <div className="bg-gradient-to-r from-amber-500 via-purple-700 to-indigo-800 text-white text-xs py-1.5 px-4 shadow-inner">
        <div className="max-w-6xl mx-auto flex items-center justify-between font-bold">
          <div className="flex items-center gap-2 truncate">
            <span className="inline-flex items-center justify-center bg-yellow-400 text-slate-900 rounded-full px-2.5 py-0.5 text-[11px] font-black shadow-xs">
              🏫 TRƯỜNG THCS TÂN HẢI
            </span>
            <span className="hidden md:inline text-yellow-200">|</span>
            <span className="hidden sm:inline text-white/95">📚 Học bài • 🧠 Hiểu bài • ✨ Vận dụng • 🌱 Trưởng thành</span>
            <span className="sm:hidden text-yellow-200 font-semibold">✨ GDCD 9</span>
          </div>
          <div className="flex items-center gap-2 text-[11px]">
            <span className="bg-white/20 text-white px-2 py-0.5 rounded-full font-extrabold border border-white/30">
              5 Lớp: 9A8 – 9A12
            </span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-6xl mx-auto px-4 py-2.5 sm:py-3.5 flex items-center justify-between">
        {/* Logo & Brand */}
        <button
          onClick={() => onNavigate('home')}
          className="flex items-center gap-2.5 sm:gap-3.5 text-left group transition"
          aria-label="Về trang chủ"
        >
          <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-400 via-rose-500 to-purple-600 p-0.5 shadow-lg shadow-purple-300 group-hover:scale-105 transition-transform flex items-center justify-center">
            <div className="w-full h-full bg-white rounded-[14px] flex items-center justify-center shadow-inner">
              <span className="text-2xl sm:text-2xl drop-shadow-sm">🌟</span>
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-base sm:text-lg tracking-tight text-slate-900 group-hover:text-purple-700 transition-colors">
                HÀNH TRÌNH CÔNG DÂN NHÍ
              </span>
              <span className="hidden md:inline-block px-2.5 py-0.5 text-[10px] font-black uppercase rounded-full bg-gradient-to-r from-amber-500 to-rose-500 text-white shadow-xs">
                Lớp 9
              </span>
            </div>
            <p className="text-xs sm:text-sm font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-700 via-indigo-600 to-blue-600 truncate max-w-[220px] sm:max-w-none">
              Môn Giáo dục Công dân 9 — Trường THCS Tân Hải
            </p>
          </div>
        </button>

        {/* Right Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {adminUser && onOpenChangeBackground && (
            <button
              onClick={onOpenChangeBackground}
              title="Thay đổi hình nền theo yêu cầu (Cô An Na)"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-black text-purple-900 bg-purple-50 hover:bg-purple-100 border border-purple-200 transition shadow-xs cursor-pointer active:scale-95"
            >
              <span>🎨</span>
              <span className="hidden sm:inline">Đổi hình nền</span>
            </button>
          )}

          {currentView !== 'home' && (
            <button
              onClick={() => onNavigate('home')}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-purple-700 bg-slate-100 hover:bg-purple-100/70 transition border border-slate-200/80 shadow-xs"
            >
              <Home className="w-4 h-4 text-purple-600" />
              <span className="hidden sm:inline">Trang chủ</span>
            </button>
          )}

          {adminUser ? (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('teacher-dashboard')}
                className={`inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-xl text-xs font-black transition shadow-md ${
                  currentView === 'teacher-dashboard'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-purple-300'
                    : 'bg-purple-100 text-purple-800 border-2 border-purple-300 hover:bg-purple-200'
                }`}
              >
                <Shield className="w-4 h-4 text-yellow-300" />
                <span className="truncate max-w-[130px]">{adminUser.displayName}</span>
              </button>

              <button
                onClick={onAdminLogout}
                title="Đăng xuất"
                className="p-2 rounded-xl text-rose-500 hover:text-white hover:bg-rose-600 border border-rose-200 hover:border-rose-600 transition shadow-xs"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => onNavigate('student-mission')}
                className="inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs font-black bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-700 hover:via-indigo-700 hover:to-cyan-600 text-white shadow-md shadow-blue-300/50 hover:shadow-lg transition active:scale-95 border border-white/20"
              >
                <Compass className="w-4 h-4 text-yellow-300" />
                <span>Vào làm bài</span>
              </button>

              <button
                onClick={onOpenTeacherLogin}
                className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold text-purple-900 bg-gradient-to-r from-purple-100 to-amber-100 border-2 border-purple-300 hover:border-purple-400 hover:bg-purple-200 transition shadow-xs"
              >
                <Shield className="w-4 h-4 text-purple-700" />
                <span className="hidden sm:inline">Cô An Na</span>
                <span className="sm:hidden">GV</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
