import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FileText,
  Users,
  School,
  Lock,
  History,
  BarChart3,
  Download,
  Settings,
  Sparkles,
  Award,
  Clock,
  ArrowRight,
  Shield,
  TrendingUp,
} from 'lucide-react';
import { AdminUser, DashboardStats } from '../types.ts';
import { api } from '../lib/api.ts';
import { LessonJourneyView } from './LessonJourneyView.tsx';
import { StudentManagementView } from './StudentManagementView.tsx';
import { LockedSubmissionsView } from './LockedSubmissionsView.tsx';
import { StudentHistoryView } from './StudentHistoryView.tsx';
import { MistakesAnalyticsView } from './MistakesAnalyticsView.tsx';
import { ExcelExportView } from './ExcelExportView.tsx';
import { SettingsView } from './SettingsView.tsx';
import { ClassStatisticsView } from './ClassStatisticsView.tsx';

interface TeacherDashboardProps {
  adminUser: AdminUser;
  onLogout: () => void;
}

type DashboardTab =
  | 'overview'
  | 'class_stats'
  | 'lessons'
  | 'students'
  | 'submissions'
  | 'history'
  | 'analytics'
  | 'export'
  | 'settings';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({ adminUser, onLogout }) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('overview');
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [inspectStudentId, setInspectStudentId] = useState<string | undefined>(undefined);
  const [autoOpenImport, setAutoOpenImport] = useState(false);

  const loadStats = async () => {
    try {
      const data = await api.getDashboardStats();
      setStats(data);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [activeTab]);

  const handleNavigateToStudentHistory = (studentId: string) => {
    setInspectStudentId(studentId);
    setActiveTab('history');
  };

  // Dashboard cards for quick access
  const dashboardCards = [
    {
      id: 'class_stats' as DashboardTab,
      title: 'THỐNG KÊ LÀM BÀI THEO LỚP',
      desc: 'Theo dõi tiến độ làm bài & nộp bài theo từng lớp (Sĩ số 50 HS, nộp, chưa nộp từ Bài 1 → 10)',
      icon: '📊',
      color: 'from-purple-500/10 to-indigo-500/10 border-purple-200 text-purple-700',
      badge: 'Tiến độ theo lớp',
    },
    {
      id: 'students' as DashboardTab,
      title: 'TẢI LÊN DANH SÁCH HỌC SINH',
      desc: 'Nạp danh sách học sinh theo từng lớp (~50 HS/lớp) từ file Excel hoặc dán nhanh',
      icon: '📥',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700',
      badge: `Nhập Excel theo lớp`,
    },
    {
      id: 'students' as DashboardTab,
      title: 'SỔ ĐIỂM & QUẢN LÝ HỌC SINH',
      desc: 'Sổ điểm 10 bài học, tự động cập nhật điểm số trực tiếp khi học sinh nộp bài',
      icon: '👨‍🎓',
      color: 'from-emerald-500/10 to-teal-500/10 border-emerald-200 text-emerald-700',
      badge: `${stats?.totalStudents || 0} học sinh`,
    },
    {
      id: 'lessons' as DashboardTab,
      title: 'BÀI TẬP & NHIỆM VỤ',
      desc: 'Tạo trắc nghiệm, tình huống đạo đức, phiếu củng cố và khóa/mở',
      icon: '📝',
      color: 'from-blue-500/10 to-cyan-500/10 border-blue-200 text-blue-700',
      badge: `${stats?.totalAssignmentsAssigned || 0} nhiệm vụ`,
    },
    {
      id: 'submissions' as DashboardTab,
      title: 'BÀI LÀM HỌC SINH',
      desc: 'Xem chi tiết bài nộp đã khóa bảo mật, thời gian và đáp án',
      icon: '🔐',
      color: 'from-amber-500/10 to-orange-500/10 border-amber-200 text-amber-700',
      badge: `${stats?.completedSubmissions || 0} bản nộp`,
    },
    {
      id: 'history' as DashboardTab,
      title: 'LỊCH SỬ HỌC TẬP',
      desc: 'Biểu đồ tiến bộ qua các bài học, quan sát sự phát triển cá nhân',
      icon: '🕘',
      color: 'from-indigo-500/10 to-purple-500/10 border-indigo-200 text-indigo-700',
      badge: 'Biểu đồ tiến bộ',
    },
    {
      id: 'analytics' as DashboardTab,
      title: 'THỐNG KÊ & PHÂN TÍCH LỖI SAI',
      desc: 'Phân tích câu hỏi học sinh sai nhiều, biểu đồ lựa chọn A/B/C/D',
      icon: '📉',
      color: 'from-rose-500/10 to-pink-500/10 border-rose-200 text-rose-700',
      badge: 'Phân tích lỗi sai',
    },
    {
      id: 'export' as DashboardTab,
      title: 'XUẤT FILE EXCEL',
      desc: 'Xuất kết quả 12 cột chuẩn theo từng lớp 9A8-9A12 hoặc toàn khối',
      icon: '📥',
      color: 'from-teal-500/10 to-emerald-500/10 border-teal-200 text-teal-700',
      badge: 'File .xlsx',
    },
    {
      id: 'settings' as DashboardTab,
      title: 'CÀI ĐẶT HỆ THỐNG',
      desc: 'Đổi mật khẩu, quy tắc khóa bài nộp, quyền xem kết quả và audit logs',
      icon: '⚙️',
      color: 'from-slate-500/10 to-purple-500/10 border-slate-200 text-slate-700',
      badge: 'Bảo mật & Logs',
    },
  ];

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      {/* 👋 Top Greeting Header */}
      <div className="bg-gradient-to-r from-amber-500 via-purple-700 to-indigo-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl shadow-purple-300/40 relative overflow-hidden border-2 border-amber-300/60">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-64 h-64 bg-white/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-yellow-400 text-slate-900 text-xs font-black tracking-wide uppercase shadow-sm">
                <span>🏫 TRƯỜNG THCS TÂN HẢI</span>
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-xs font-bold uppercase tracking-wider text-yellow-200">
                <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
                <span>MÔN GIÁO DỤC CÔNG DÂN 9</span>
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
              👋 XIN CHÀO, CÔ AN NA!
            </h1>
            <p className="text-purple-100 text-xs sm:text-sm font-semibold">
              📚 Học bài • 🧠 Hiểu bài • ✨ Vận dụng • 🌱 Trưởng thành — Đồng hành cùng 5 lớp 9A8 – 9A12
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-start md:self-auto">
            {activeTab !== 'overview' && (
              <>
                <button
                  onClick={() => setActiveTab('overview')}
                  className="px-3.5 py-2 rounded-xl bg-white/20 hover:bg-white/30 text-white font-bold text-xs transition backdrop-blur-sm border border-white/20 shadow-xs cursor-pointer"
                >
                  ← Tổng quan
                </button>
                <button
                  onClick={() => setActiveTab('class_stats')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    activeTab === 'class_stats'
                      ? 'bg-yellow-400 text-slate-900 border-yellow-300 shadow-md font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  📊 Thống kê theo lớp
                </button>
                <button
                  onClick={() => setActiveTab('students')}
                  className={`px-3 py-2 rounded-xl font-bold text-xs transition border cursor-pointer ${
                    activeTab === 'students'
                      ? 'bg-yellow-400 text-slate-900 border-yellow-300 shadow-md font-black'
                      : 'bg-white/10 hover:bg-white/20 text-white border-white/20'
                  }`}
                >
                  👨‍🎓 Sổ điểm 10 bài
                </button>
              </>
            )}
          </div>
        </div>
      </div>

      {/* 📊 Top Overview Metrics (Live Database) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 border border-purple-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">👨🎓 Tổng học sinh</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
            {stats?.totalStudents || 0}
          </span>
          <span className="text-[10px] text-purple-600 font-semibold">5 Lớp 9A8–9A12</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-blue-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">📝 Bài đã giao</span>
          <span className="text-2xl sm:text-3xl font-black text-slate-900 block mt-1">
            {stats?.totalAssignmentsAssigned || 0}
          </span>
          <span className="text-[10px] text-blue-600 font-semibold">Nhiệm vụ học tập</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">✅ Đã hoàn thành</span>
          <span className="text-2xl sm:text-3xl font-black text-emerald-700 block mt-1">
            {stats?.completedSubmissions || 0}
          </span>
          <span className="text-[10px] text-emerald-600 font-semibold">Bài nộp đã khóa</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-amber-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">⏳ Chưa nộp</span>
          <span className="text-2xl sm:text-3xl font-black text-amber-700 block mt-1">
            {stats?.inProgressSubmissions || 0}
          </span>
          <span className="text-[10px] text-amber-600 font-semibold">Đang theo dõi</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-indigo-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">⭐ Điểm trung bình</span>
          <span className="text-2xl sm:text-3xl font-black text-indigo-700 block mt-1">
            {stats && stats.completedSubmissions > 0 ? stats.averageScore.toString().replace('.', ',') : '—'}
          </span>
          <span className="text-[10px] text-indigo-600 font-semibold">Thang điểm 10</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-cyan-100 shadow-sm">
          <span className="text-[11px] font-bold uppercase text-slate-400 block">📈 Tỷ lệ nộp</span>
          <span className="text-2xl sm:text-3xl font-black text-cyan-700 block mt-1">
            {stats && stats.completedSubmissions > 0 ? `${stats.completionRate}%` : '0%'}
          </span>
          <span className="text-[10px] text-cyan-600 font-semibold">Tiến độ chung</span>
        </div>
      </div>

      {/* SUBVIEW CONTAINER */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>🎯</span>
              <span>DANH MỤC QUẢN TRỊ TRỌNG TÂM</span>
            </h3>
            <span className="text-xs text-slate-400 font-medium">Bấm vào từng mục để thao tác</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {dashboardCards.map((card) => (
              <div
                key={card.title}
                onClick={() => {
                  if (card.title === 'TẢI LÊN DANH SÁCH HỌC SINH') {
                    setAutoOpenImport(true);
                  } else {
                    setAutoOpenImport(false);
                  }
                  setActiveTab(card.id);
                }}
                className={`bg-white rounded-3xl p-5 border-2 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer flex flex-col justify-between group ${card.color}`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-3xl">{card.icon}</span>
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white border shadow-xs text-slate-700">
                      {card.badge}
                    </span>
                  </div>

                  <h4 className="text-base font-extrabold text-slate-900 tracking-tight group-hover:text-purple-700 transition">
                    {card.title}
                  </h4>

                  <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                    {card.desc}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span>Mở quản lý</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'class_stats' && (
        <ClassStatisticsView onNavigateToStudent={handleNavigateToStudentHistory} />
      )}
      {activeTab === 'lessons' && <LessonJourneyView />}
      {activeTab === 'students' && (
        <StudentManagementView
          onViewHistory={handleNavigateToStudentHistory}
          initialOpenImport={autoOpenImport}
        />
      )}
      {activeTab === 'submissions' && <LockedSubmissionsView />}
      {activeTab === 'history' && (
        <StudentHistoryView initialStudentId={inspectStudentId} />
      )}
      {activeTab === 'analytics' && <MistakesAnalyticsView />}
      {activeTab === 'export' && <ExcelExportView />}
      {activeTab === 'settings' && <SettingsView />}
    </div>
  );
};
