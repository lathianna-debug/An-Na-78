import React, { useState, useEffect } from 'react';
import {
  Users,
  CheckCircle2,
  Clock,
  Award,
  AlertTriangle,
  RefreshCw,
  Download,
  Copy,
  Check,
  ChevronRight,
  Filter,
  FileSpreadsheet,
  Search,
  BookOpen,
  ArrowUpRight,
  X,
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { api } from '../lib/api.ts';
import { ClassStatistic, ClassLessonStatistic, ClassStatisticsResponse } from '../types.ts';

interface ClassStatisticsViewProps {
  initialClass?: string;
  onNavigateToStudent?: (studentId: string) => void;
}

export const ClassStatisticsView: React.FC<ClassStatisticsViewProps> = ({
  initialClass,
  onNavigateToStudent,
}) => {
  const [data, setData] = useState<ClassStatisticsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedClass, setSelectedClass] = useState<string>(initialClass || 'ALL');
  const [searchStudent, setSearchStudent] = useState('');
  const [selectedDetailLesson, setSelectedDetailLesson] = useState<{
    className: string;
    lesson: ClassLessonStatistic;
  } | null>(null);
  const [copiedZalo, setCopiedZalo] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const res = await api.getClassStatistics();
      setData(res);
    } catch (err) {
      console.error('Lỗi tải thống kê theo lớp:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // 🟢 Tự động đồng bộ mỗi 5 giây
    const interval = setInterval(() => {
      api.getClassStatistics().then(setData).catch(() => {});
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  // Filter classes based on selection
  const displayedClasses = (data?.classes || []).filter((cls) => {
    if (selectedClass === 'ALL') {
      // If ALL is selected, show classes that have at least 1 student or default 9A8..9A12
      return (
        cls.totalStudents > 0 ||
        ['9A8', '9A9', '9A10', '9A11', '9A12'].includes(cls.className)
      );
    }
    return cls.className === selectedClass;
  });

  // Export class statistics to Excel
  const handleExportExcel = () => {
    if (!data) return;

    // Sheet 1: Tổng hợp các lớp
    const summaryRows = data.classes
      .filter((c) => c.totalStudents > 0 || c.submittedSubmissionsCount > 0)
      .map((c, idx) => {
        const row: any = {
          'STT': idx + 1,
          'Lớp': c.className,
          'Sĩ số (Học sinh)': c.totalStudents,
          'Đã nộp bài (Học sinh)': c.activeStudentsCount,
          'Chưa nộp bài (Học sinh)': c.neverSubmittedStudentsCount,
          'Tỷ lệ nộp bài (%)': `${c.overallSubmissionRate}%`,
          'Điểm trung bình': c.avgScore !== null ? c.avgScore : '—',
        };

        // Lesson columns
        c.lessons.forEach((l) => {
          row[`BÀI ${l.lessonNumber} (Nộp)`] = `${l.submittedCount}/${l.totalStudents}`;
          row[`BÀI ${l.lessonNumber} (%)`] = `${l.submissionRate}%`;
          row[`BÀI ${l.lessonNumber} (ĐTB)`] = l.avgScore !== null ? l.avgScore : '—';
        });

        return row;
      });

    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [
      { wch: 6 },
      { wch: 10 },
      { wch: 16 },
      { wch: 20 },
      { wch: 22 },
      { wch: 16 },
      { wch: 14 },
    ];

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, wsSummary, 'ThongKe_CacLop');
    XLSX.writeFile(wb, `BaoCao_ThongKe_NopBai_TheoLop_THCS_TanHai_${new Date().toISOString().slice(0, 10)}.xlsx`);
  };

  // Copy unsubmitted student list for Zalo
  const handleCopyZaloNotice = (className: string, lesson: ClassLessonStatistic) => {
    if (!lesson.unsubmittedStudents || lesson.unsubmittedStudents.length === 0) return;

    const listText = lesson.unsubmittedStudents
      .map((st, i) => `${i + 1}. ${st.name}`)
      .join('\n');

    const message = `📢 THÔNG BÁO TỪ CÔ AN NA - LỚP ${className}\n` +
      `Môn: Giáo dục công dân 9\n` +
      `Nhiệm vụ: ${lesson.lessonTitle} (Bài ${lesson.lessonNumber})\n` +
      `Sĩ số lớp: ${lesson.totalStudents} học sinh | Đã nộp: ${lesson.submittedCount} em\n\n` +
      `Hiện tại còn ${lesson.unsubmittedStudents.length} em học sinh sau đây CHƯA NỘP BÀI:\n` +
      listText +
      `\n\n👉 Đề nghị các em nhanh chóng vào hệ thống làm bài và bấm NỘP BÀI để cô tổng kết điểm số nhé!\n` +
      `Trân trọng thông báo đến Quý Phụ huynh và các em học sinh.`;

    navigator.clipboard.writeText(message);
    setCopiedZalo(true);
    setTimeout(() => setCopiedZalo(false), 3000);
  };

  return (
    <div className="space-y-6">
      {/* 🚀 Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 rounded-3xl p-6 sm:p-7 text-white shadow-xl border border-purple-500/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-xs font-bold flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Tự động cập nhật trực tiếp (Live Sync)</span>
              </span>
              <span className="px-3 py-1 rounded-full bg-white/10 text-purple-200 text-xs font-mono">
                Chuẩn ~50 HS/lớp
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              <span>📊</span>
              <span>THỐNG KÊ HỌC SINH LÀM BÀI VÀ NỘP BÀI THEO TỪNG LỚP</span>
            </h2>
            <p className="text-xs sm:text-sm text-purple-200/80">
              Theo dõi chi tiết số lượng nộp bài, tỷ lệ hoàn thành và danh sách học sinh chưa làm từ Bài 1 đến Bài 10.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button
              type="button"
              onClick={handleExportExcel}
              className="px-4 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-900/40 transition active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Xuất Excel Thống kê</span>
            </button>
            <button
              type="button"
              onClick={loadData}
              disabled={loading}
              title="Làm mới dữ liệu thống kê"
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition active:scale-95 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overview metric pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6 pt-5 border-t border-white/10">
          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase text-purple-300 block">🏫 Tổng số lớp</span>
            <span className="text-2xl font-black text-white mt-0.5 block">
              {data?.summary.totalClasses || 0} lớp
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase text-purple-300 block">👨🎓 Tổng sĩ số</span>
            <span className="text-2xl font-black text-yellow-300 mt-0.5 block">
              {data?.summary.totalStudents || 0} HS
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase text-purple-300 block">📝 Bài đã nộp (Khóa)</span>
            <span className="text-2xl font-black text-emerald-400 mt-0.5 block">
              {data?.summary.totalSubmissions || 0} bài
            </span>
          </div>

          <div className="bg-white/5 rounded-2xl p-3 border border-white/10">
            <span className="text-[11px] font-bold uppercase text-purple-300 block">⭐ Điểm TB toàn trường</span>
            <span className="text-2xl font-black text-cyan-300 mt-0.5 block">
              {data?.summary.overallAvgScore ? data.summary.overallAvgScore.toFixed(1).replace('.', ',') : '—'}
            </span>
          </div>
        </div>
      </div>

      {/* 🔍 Class Selector & Search Filter */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Quick class buttons */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">
              Chọn lớp xem thống kê:
            </span>
            <div className="flex flex-wrap items-center gap-1.5">
              <button
                type="button"
                onClick={() => setSelectedClass('ALL')}
                className={`px-3 py-1.5 rounded-xl font-extrabold text-xs transition cursor-pointer ${
                  selectedClass === 'ALL'
                    ? 'bg-purple-600 text-white shadow-md shadow-purple-200'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Tất cả các lớp
              </button>

              <span className="text-slate-300 mx-1">|</span>

              {/* Grade 9 classes */}
              {['9A8', '9A9', '9A10', '9A11', '9A12'].map((cls) => {
                const classData = (data?.classes || []).find((c) => c.className === cls);
                const hasStudents = classData && classData.totalStudents > 0;
                return (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => setSelectedClass(cls)}
                    className={`px-2.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer relative ${
                      selectedClass === cls
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200'
                        : hasStudents
                        ? 'bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200'
                        : 'bg-slate-50 text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span>{cls}</span>
                    {hasStudents && (
                      <span className="ml-1 text-[10px] opacity-80">({classData.totalStudents})</span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick instructions */}
          <div className="text-xs text-slate-500 bg-purple-50/70 p-3 rounded-2xl border border-purple-100 max-w-sm">
            <span className="font-bold text-purple-900 block flex items-center gap-1">
              <span>💡</span>
              <span>Gợi ý cho Cô An Na:</span>
            </span>
            <span className="text-[11px] text-purple-700">
              Nhấn vào từng ô <strong>Bài 1 → 10</strong> của mỗi lớp để xem ngay danh sách em nào chưa làm và sao chép danh sách nhắc nhở gửi nhóm Zalo lớp!
            </span>
          </div>
        </div>
      </div>

      {/* 📋 LIST OF CLASSES AND THEIR PROGRESS */}
      {displayedClasses.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-sm space-y-3">
          <div className="w-14 h-14 mx-auto rounded-2xl bg-purple-100 flex items-center justify-center text-purple-600">
            <Users className="w-7 h-7" />
          </div>
          <h4 className="text-base font-bold text-slate-800">Chưa có dữ liệu học sinh lớp này</h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Cô An Na hãy tải lên danh sách học sinh theo lớp (khoảng 50 em/lớp) từ file Excel để hệ thống tự động tổng hợp tiến độ.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {displayedClasses.map((cls) => {
            const hasStudents = cls.totalStudents > 0;
            return (
              <div
                key={cls.className}
                className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition"
              >
                {/* Class Header Bar */}
                <div className="px-5 py-4 bg-gradient-to-r from-slate-50 to-indigo-50/50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-black text-sm shadow-md shadow-indigo-200">
                      {cls.className}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="text-base font-black text-slate-900">
                          LỚP {cls.className}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-800 font-extrabold text-xs">
                          Sĩ số: {cls.totalStudents} học sinh
                        </span>
                        {cls.totalStudents >= 45 && cls.totalStudents <= 55 && (
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                            ✓ Đúng chuẩn (~50 HS)
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Trường THCS Tân Hải • Niên khóa 2026 – 2027
                      </p>
                    </div>
                  </div>

                  {/* Summary badges for this class */}
                  <div className="flex flex-wrap items-center gap-2">
                    <div className="px-3 py-1 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Đã nộp: <strong>{cls.activeStudentsCount}/{cls.totalStudents}</strong></span>
                      <span className="text-[10px] text-emerald-600">({cls.overallSubmissionRate}%)</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                      <span>Chưa nộp: <strong>{cls.neverSubmittedStudentsCount}</strong> em</span>
                    </div>

                    <div className="px-3 py-1 rounded-xl bg-purple-50 border border-purple-200 text-purple-800 text-xs font-bold flex items-center gap-1.5">
                      <Award className="w-3.5 h-3.5 text-purple-600" />
                      <span>Điểm TB lớp: <strong>{cls.avgScore !== null ? cls.avgScore : '—'}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-100 h-1.5">
                  <div
                    className="bg-gradient-to-r from-emerald-500 to-teal-500 h-1.5 transition-all duration-500"
                    style={{ width: `${cls.overallSubmissionRate}%` }}
                  />
                </div>

                {/* Lessons 1 to 10 Progress Grid */}
                <div className="p-4 sm:p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                      <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Tiến độ nộp bài từng bài (Bài 1 → Bài 10):</span>
                    </span>
                    <span className="text-[11px] text-slate-400">
                      Bấm vào từng bài để xem chi tiết & danh sách chưa nộp
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 lg:grid-cols-10 gap-2">
                    {cls.lessons.map((lesson) => {
                      const isComplete = hasStudents && lesson.submittedCount === cls.totalStudents;
                      const hasSubmissions = lesson.submittedCount > 0;

                      return (
                        <div
                          key={lesson.lessonNumber}
                          onClick={() => setSelectedDetailLesson({ className: cls.className, lesson })}
                          className={`p-2.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between group hover:scale-[1.03] active:scale-95 shadow-2xs ${
                            isComplete
                              ? 'bg-emerald-50/80 border-emerald-300 hover:border-emerald-500 text-emerald-950'
                              : hasSubmissions
                              ? 'bg-blue-50/70 border-blue-200 hover:border-blue-400 text-blue-950'
                              : 'bg-slate-50 border-slate-200 hover:border-slate-300 text-slate-600'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="text-[11px] font-black uppercase tracking-tight text-slate-900 group-hover:text-purple-700">
                                BÀI {lesson.lessonNumber}
                              </span>
                              {isComplete ? (
                                <span className="w-2 h-2 rounded-full bg-emerald-500" title="Hoàn thành 100%" />
                              ) : hasSubmissions ? (
                                <span className="w-2 h-2 rounded-full bg-blue-500" title="Đang làm" />
                              ) : null}
                            </div>

                            <p className="text-sm font-black mt-1">
                              {lesson.submittedCount}
                              <span className="text-[10px] text-slate-400 font-semibold">/{cls.totalStudents || 50}</span>
                            </p>

                            <div className="mt-1 flex items-center justify-between">
                              <span
                                className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md ${
                                  lesson.submissionRate >= 80
                                    ? 'bg-emerald-100 text-emerald-800'
                                    : lesson.submissionRate > 0
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-slate-200 text-slate-600'
                                }`}
                              >
                                {lesson.submissionRate}%
                              </span>

                              {lesson.avgScore !== null && (
                                <span className="text-[10px] font-extrabold text-purple-700">
                                  {lesson.avgScore}đ
                                </span>
                              )}
                            </div>
                          </div>

                          <div className="mt-2 pt-1 border-t border-slate-200/60 flex items-center justify-between text-[10px] font-bold text-slate-400 group-hover:text-purple-600">
                            <span>Chi tiết</span>
                            <ChevronRight className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 🔍 DETAIL MODAL: UN-SUBMITTED STUDENTS & ZALO REMINDER */}
      {selectedDetailLesson && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-in fade-in duration-150 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-2xl w-full border border-slate-200 shadow-2xl overflow-hidden my-6">
            {/* Modal Header */}
            <div className="p-5 sm:p-6 bg-gradient-to-r from-indigo-900 via-purple-900 to-slate-900 text-white flex items-center justify-between">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-lg bg-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                    LỚP {selectedDetailLesson.className}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-lg bg-white/10 text-purple-200 text-xs font-bold">
                    BÀI {selectedDetailLesson.lesson.lessonNumber}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight">
                  {selectedDetailLesson.lesson.lessonTitle}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedDetailLesson(null)}
                className="p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-5 sm:p-6 space-y-5">
              {/* Quick stats grid */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200 text-center">
                  <span className="text-[11px] font-bold text-slate-500 block">Sĩ số lớp</span>
                  <span className="text-xl font-black text-slate-900 block mt-0.5">
                    {selectedDetailLesson.lesson.totalStudents} HS
                  </span>
                </div>

                <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-200 text-center">
                  <span className="text-[11px] font-bold text-emerald-700 block">Đã nộp bài</span>
                  <span className="text-xl font-black text-emerald-800 block mt-0.5">
                    {selectedDetailLesson.lesson.submittedCount} em ({selectedDetailLesson.lesson.submissionRate}%)
                  </span>
                </div>

                <div className="p-3 bg-rose-50 rounded-2xl border border-rose-200 text-center">
                  <span className="text-[11px] font-bold text-rose-700 block">Chưa nộp bài</span>
                  <span className="text-xl font-black text-rose-800 block mt-0.5">
                    {selectedDetailLesson.lesson.unsubmittedCount} em
                  </span>
                </div>
              </div>

              {/* UN-SUBMITTED STUDENTS SECTION */}
              <div className="space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase tracking-wider text-rose-800 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Danh sách học sinh CHƯA nộp bài ({selectedDetailLesson.lesson.unsubmittedCount} em):</span>
                  </h4>

                  {selectedDetailLesson.lesson.unsubmittedCount > 0 && (
                    <button
                      type="button"
                      onClick={() =>
                        handleCopyZaloNotice(
                          selectedDetailLesson.className,
                          selectedDetailLesson.lesson
                        )
                      }
                      className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-sm transition flex items-center gap-1.5 cursor-pointer active:scale-95"
                    >
                      {copiedZalo ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Đã sao chép tin nhắn Zalo!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Sao chép thông báo gửi Zalo lớp</span>
                        </>
                      )}
                    </button>
                  )}
                </div>

                {selectedDetailLesson.lesson.unsubmittedStudents.length === 0 ? (
                  <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-200 text-center text-emerald-800 space-y-1">
                    <CheckCircle2 className="w-8 h-8 mx-auto text-emerald-600" />
                    <p className="font-extrabold text-sm">Tuyệt vời! 100% học sinh đã nộp bài đầy đủ</p>
                    <p className="text-xs text-emerald-600">Không còn học sinh nào chưa nộp trong bài học này.</p>
                  </div>
                ) : (
                  <div className="max-h-60 overflow-y-auto rounded-2xl border border-slate-200 bg-slate-50/50 p-2">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {selectedDetailLesson.lesson.unsubmittedStudents.map((st, i) => (
                        <div
                          key={st.id}
                          className="flex items-center justify-between p-2.5 bg-white rounded-xl border border-slate-200 text-xs shadow-2xs"
                        >
                          <div className="flex items-center gap-2">
                            <span className="w-6 h-6 rounded-lg bg-rose-100 text-rose-800 font-bold flex items-center justify-center text-[10px]">
                              {i + 1}
                            </span>
                            <span className="font-bold text-slate-800">{st.name}</span>
                          </div>
                          <span className="text-[10px] text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded-md border border-rose-100">
                            Chưa nộp
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedDetailLesson(null)}
                className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
