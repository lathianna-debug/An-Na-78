import React, { useState, useEffect } from 'react';
import {
  History,
  TrendingUp,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Filter,
  Download,
  School,
  Sparkles,
  Edit2,
  Trash2,
  ShieldCheck,
  X,
} from 'lucide-react';
import { ClassGrade9, Student } from '../types.ts';
import { api } from '../lib/api.ts';

interface StudentHistoryViewProps {
  initialStudentId?: string;
}

export const StudentHistoryView: React.FC<StudentHistoryViewProps> = ({ initialStudentId }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [classList, setClassList] = useState<string[]>([
    '9A8',
    '9A9',
    '9A10',
    '9A11',
    '9A12',
  ]);
  const [selectedClass, setSelectedClass] = useState<ClassGrade9>('9A8');
  const [selectedStudentId, setSelectedStudentId] = useState<string>(initialStudentId || '');
  const [historyData, setHistoryData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [hoveredPoint, setHoveredPoint] = useState<any>(null);

  // Edit Submission state for Cô An Na
  const [editingItem, setEditingItem] = useState<any>(null);
  const [editScore, setEditScore] = useState<string>('');
  const [editNote, setEditNote] = useState<string>('');
  const [savingEdit, setSavingEdit] = useState(false);

  // Filter for timeline
  const [timelineFilter, setTimelineFilter] = useState<'ALL' | 'DONE' | 'NOT_DONE' | 'ON_TIME' | 'LATE'>('ALL');

  const fetchHistory = () => {
    if (!selectedStudentId) return;
    setLoading(true);
    api
      .getStudentHistory(selectedStudentId)
      .then((data) => {
        setHistoryData(data);
      })
      .catch((err) => {
        console.error(err);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  // Load students and classes for selector
  useEffect(() => {
    api.getClasses().then((res) => {
      if (res && res.classes && res.classes.length > 0) {
        setClassList(res.classes);
      }
    }).catch(() => {});

    api.getStudents().then((res) => {
      setStudents(res.students);
      if (!selectedStudentId && res.students.length > 0) {
        const inClass = res.students.find((s) => s.class === selectedClass);
        setSelectedStudentId(inClass ? inClass.id : res.students[0].id);
      }
    });
  }, []);

  // When selected student changes, fetch history
  useEffect(() => {
    fetchHistory();
  }, [selectedStudentId]);

  const handleDeleteSubmission = async (subId: string, title: string) => {
    if (!window.confirm(`Cô An Na có chắc chắn muốn xóa bài làm "${title}" của học sinh này? Sau khi xóa, học sinh có thể làm lại bài mới nếu cần.`)) {
      return;
    }
    try {
      await api.deleteSubmission(subId);
      alert('Đã xóa bài làm thành công!');
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi xóa bài làm');
    }
  };

  const handleOpenEdit = (item: any) => {
    setEditingItem(item);
    setEditScore(item.score !== null && item.score !== undefined ? item.score.toString() : '');
    setEditNote('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.submissionId) return;
    const num = parseFloat(editScore);
    if (isNaN(num) || num < 0 || num > 10) {
      alert('Vui lòng nhập điểm số hợp lệ từ 0 đến 10');
      return;
    }

    setSavingEdit(true);
    try {
      await api.updateSubmission(editingItem.submissionId, {
        score: num,
        teacherNote: editNote.trim() || undefined,
      });
      alert('Đã cập nhật điểm số bài làm thành công!');
      setEditingItem(null);
      fetchHistory();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi cập nhật điểm');
    } finally {
      setSavingEdit(false);
    }
  };

  // Filter timeline items
  const filteredTimeline = historyData?.timeline
    ? historyData.timeline.filter((item: any) => {
        if (timelineFilter === 'DONE') return item.isCompleted;
        if (timelineFilter === 'NOT_DONE') return !item.isCompleted;
        if (timelineFilter === 'ON_TIME') return item.isCompleted && !item.isLate;
        if (timelineFilter === 'LATE') return item.isCompleted && item.isLate;
        return true;
      })
    : [];

  const classStudents = students.filter((s) => s.class === selectedClass);
  const chartPoints: Array<{ label: string; score: number; assignment: string }> =
    historyData?.progressChart || [];

  // SVG Chart Dimensions calculation
  const chartWidth = 600;
  const chartHeight = 220;
  const paddingX = 50;
  const paddingY = 30;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>🕘</span>
          <span>LỊCH SỬ HỌC TẬP & BIỂU ĐỒ TIẾN BỘ</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Dành riêng cho giáo viên quan sát tiến bộ của từng em theo thời gian, nuôi dưỡng thói quen tự chủ và trách nhiệm.
        </p>
      </div>

      {/* Selectors: LỚP → HỌC SINH */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            1. Chọn lớp học
          </label>
          <select
            value={selectedClass}
            onChange={(e) => {
              const newClass = e.target.value as ClassGrade9;
              setSelectedClass(newClass);
              const firstInNewClass = students.find((s) => s.class === newClass);
              if (firstInNewClass) setSelectedStudentId(firstInNewClass.id);
            }}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
          >
            {classList.map((cls) => (
              <option key={cls} value={cls}>
                Lớp {cls}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            2. Chọn học sinh
          </label>
          <select
            value={selectedStudentId}
            onChange={(e) => setSelectedStudentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
          >
            {classStudents.length === 0 ? (
              <option value="">Không có học sinh trong lớp này</option>
            ) : (
              classStudents.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} (Điểm TB: {s.avgScore ? s.avgScore.toString().replace('.', ',') : '—'})
                </option>
              ))
            )}
          </select>
        </div>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Đang tải hành trình học tập của học sinh...</p>
        </div>
      ) : historyData ? (
        <div className="space-y-6">
          {/* Card Tổng quan */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b pb-4">
              <div>
                <span className="text-[11px] font-bold uppercase text-purple-700 tracking-wider">
                  HỒ SƠ HỌC TẬP CÁ NHÂN
                </span>
                <h3 className="text-xl font-black text-slate-900">
                  {historyData.student.name} – Lớp {historyData.student.class}
                </h3>
              </div>

              <a
                href={api.getHistoryExportUrl(historyData.student.id)}
                download
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-800 text-xs font-bold transition border border-slate-200 hover:border-emerald-200 self-start sm:self-auto"
              >
                <Download className="w-3.5 h-3.5 text-emerald-600" />
                <span>Xuất file Excel (.xlsx)</span>
              </a>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div className="p-3.5 rounded-2xl bg-purple-50/60 border border-purple-100">
                <span className="text-[11px] font-bold uppercase text-purple-700 block">📚 Đã hoàn thành</span>
                <span className="text-2xl font-black text-purple-900 mt-1 block">
                  {historyData.summary.completedCount}/{historyData.summary.totalAssigned}
                </span>
                <span className="text-[10px] text-purple-600">bài tập giao</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-100">
                <span className="text-[11px] font-bold uppercase text-amber-700 block">⭐ Điểm TB</span>
                <span className="text-2xl font-black text-amber-900 mt-1 block">
                  {historyData.summary.avgScore ? historyData.summary.avgScore.toString().replace('.', ',') : '—'}
                </span>
                <span className="text-[10px] text-amber-600">Thang điểm 10</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block">⏰ Đúng hạn</span>
                <span className="text-2xl font-black text-emerald-900 mt-1 block">
                  {historyData.summary.onTimeCount}
                </span>
                <span className="text-[10px] text-emerald-600">bài hoàn thành tốt</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-rose-50/60 border border-rose-100">
                <span className="text-[11px] font-bold uppercase text-rose-700 block">⚠️ Quá hạn</span>
                <span className="text-2xl font-black text-rose-900 mt-1 block">
                  {historyData.summary.overdueCount}
                </span>
                <span className="text-[10px] text-rose-600">cần nhắc nhở</span>
              </div>

              <div className="p-3.5 rounded-2xl bg-cyan-50/60 border border-cyan-100 col-span-2 sm:col-span-1">
                <span className="text-[11px] font-bold uppercase text-cyan-700 block">📈 Tiến độ</span>
                <span className="text-2xl font-black text-cyan-900 mt-1 block">
                  {historyData.summary.progressPct}%
                </span>
                <span className="text-[10px] text-cyan-600">Hành trình môn học</span>
              </div>
            </div>
          </div>

          {/* 📈 17. BIỂU ĐỒ TIẾN BỘ (Handcrafted Responsive SVG Line Chart) */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
              <div>
                <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  <span>BIỂU ĐỒ TIẾN BỘ QUA CÁC BÀI HỌC</span>
                </h4>
                <p className="text-xs text-slate-500">
                  Đường biểu diễn điểm số qua từng chặng để cô trò cùng nhìn lại sự tiến bộ: Bài 1 → Bài 2 → Bài 3...
                </p>
              </div>

              <div className="text-[11px] text-slate-400 italic">
                * Quan sát tiến bộ theo thời gian, không so sánh cạnh tranh
              </div>
            </div>

            {chartPoints.length > 0 ? (
              <div className="w-full overflow-x-auto pt-2">
                <div className="min-w-[500px]">
                  <svg
                    viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                    className="w-full h-auto overflow-visible select-none"
                  >
                    <defs>
                      <linearGradient id="lineGradient" x1="0" y1="0" x2="1" y2="0">
                        <stop offset="0%" stopColor="#8B5CF6" />
                        <stop offset="100%" stopColor="#06B6D4" />
                      </linearGradient>
                      <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.25" />
                        <stop offset="100%" stopColor="#8B5CF6" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Horizontal Grid lines (0, 2.5, 5, 7.5, 10) */}
                    {[0, 2.5, 5, 7.5, 10].map((val) => {
                      const y = paddingY + usableHeight - (val / 10) * usableHeight;
                      return (
                        <g key={val}>
                          <line
                            x1={paddingX}
                            y1={y}
                            x2={chartWidth - paddingX}
                            y2={y}
                            stroke="#E2E8F0"
                            strokeDasharray="4 4"
                          />
                          <text
                            x={paddingX - 10}
                            y={y + 4}
                            textAnchor="end"
                            fontSize="11"
                            fill="#94A3B8"
                            fontWeight="bold"
                          >
                            {val}
                          </text>
                        </g>
                      );
                    })}

                    {/* Generate path and dots */}
                    {(() => {
                      const stepX =
                        chartPoints.length > 1
                          ? usableWidth / (chartPoints.length - 1)
                          : usableWidth / 2;

                      const coords = chartPoints.map((pt, i) => {
                        const x =
                          chartPoints.length > 1
                            ? paddingX + i * stepX
                            : paddingX + usableWidth / 2;
                        const y = paddingY + usableHeight - (pt.score / 10) * usableHeight;
                        return { x, y, pt };
                      });

                      const pathD = coords.reduce(
                        (acc, curr, i) =>
                          i === 0 ? `M ${curr.x} ${curr.y}` : `${acc} L ${curr.x} ${curr.y}`,
                        ''
                      );

                      const areaD =
                        coords.length > 0
                          ? `${pathD} L ${coords[coords.length - 1].x} ${
                              paddingY + usableHeight
                            } L ${coords[0].x} ${paddingY + usableHeight} Z`
                          : '';

                      return (
                        <>
                          {/* Shaded Area under line */}
                          {areaD && <path d={areaD} fill="url(#areaGradient)" />}

                          {/* Connecting Line */}
                          <path
                            d={pathD}
                            fill="none"
                            stroke="url(#lineGradient)"
                            strokeWidth="3.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Data points */}
                          {coords.map((c, i) => (
                            <g
                              key={i}
                              onMouseEnter={() => setHoveredPoint(c.pt)}
                              onMouseLeave={() => setHoveredPoint(null)}
                              className="cursor-pointer group"
                            >
                              {/* Outer ring */}
                              <circle
                                cx={c.x}
                                cy={c.y}
                                r="6"
                                fill="#8B5CF6"
                                stroke="#FFFFFF"
                                strokeWidth="2.5"
                                className="transition-transform group-hover:scale-125"
                              />

                              {/* Score label on top of dot */}
                              <text
                                x={c.x}
                                y={c.y - 10}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="bold"
                                fill="#6D28D9"
                              >
                                {c.pt.score.toString().replace('.', ',')}
                              </text>

                              {/* X Axis Label */}
                              <text
                                x={c.x}
                                y={chartHeight - 6}
                                textAnchor="middle"
                                fontSize="11"
                                fontWeight="bold"
                                fill="#64748B"
                              >
                                {c.pt.label}
                              </text>
                            </g>
                          ))}
                        </>
                      );
                    })()}
                  </svg>
                </div>

                {/* Hover Tooltip display */}
                {hoveredPoint && (
                  <div className="mt-3 p-3 bg-slate-900 text-white rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold text-amber-300">{hoveredPoint.label}</span>:{' '}
                      {hoveredPoint.assignment}
                    </div>
                    <div className="font-extrabold text-sm text-cyan-300">
                      {hoveredPoint.score.toString().replace('.', ',')} / 10 điểm
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="py-10 text-center text-slate-400 text-xs">
                Chưa có dữ liệu bài làm để vẽ biểu đồ tiến bộ.
              </div>
            )}
          </div>

          {/* Timeline từng bài với bộ lọc */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <h4 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-600" />
                <span>TIMELINE CHI TIẾT CÁC BÀI TẬP</span>
              </h4>

              {/* Filters */}
              <div className="flex flex-wrap gap-1.5 text-xs">
                {[
                  { key: 'ALL', label: 'TẤT CẢ' },
                  { key: 'DONE', label: '✅ ĐÃ LÀM' },
                  { key: 'NOT_DONE', label: '⏳ CHƯA LÀM' },
                  { key: 'ON_TIME', label: '🟢 ĐÚNG HẠN' },
                  { key: 'LATE', label: '🔴 QUÁ HẠN' },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setTimelineFilter(f.key as any)}
                    className={`px-2.5 py-1 rounded-xl font-bold transition text-[11px] ${
                      timelineFilter === f.key
                        ? 'bg-purple-600 text-white shadow-sm'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List */}
            <div className="space-y-3 pt-2">
              {filteredTimeline.length === 0 ? (
                <p className="text-center py-6 text-slate-400 text-xs">
                  Không có bài tập nào theo bộ lọc này.
                </p>
              ) : (
                filteredTimeline.map((item: any) => (
                  <div
                    key={item.assignmentId}
                    className="p-4 rounded-2xl border border-slate-200/70 hover:border-purple-200 transition flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-purple-700 bg-purple-50 px-2 py-0.5 rounded text-[10px]">
                          Bài {item.lessonNumber}
                        </span>
                        <span className="font-bold text-slate-900 text-sm">
                          {item.assignmentTitle}
                        </span>
                      </div>
                      <p className="text-slate-400 font-mono text-[11px]">
                        Mã: {item.code} • {item.lessonTitle}
                      </p>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      {item.isCompleted ? (
                        <>
                          <div className="text-right">
                            <span className="text-base font-black text-purple-700 block">
                              {item.score?.toString().replace('.', ',')}/10
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {item.submittedAt
                                ? new Date(item.submittedAt).toLocaleDateString('vi-VN')
                                : ''}
                            </span>
                          </div>

                          <span
                            className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${
                              item.isLate
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            }`}
                          >
                            {item.isLate ? '🔴 Quá hạn' : '🟢 Đúng hạn'}
                          </span>

                          {/* 🛠️ Action buttons for Cô An Na */}
                          <div className="flex items-center gap-1 pl-1 border-l border-slate-200">
                            <button
                              type="button"
                              onClick={() => handleOpenEdit(item)}
                              title="Cô An Na sửa điểm số bài này"
                              className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition cursor-pointer"
                            >
                              <Edit2 className="w-3.5 h-3.5" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDeleteSubmission(item.submissionId, item.assignmentTitle)}
                              title="Cô An Na xóa bài làm này để học sinh làm lại"
                              className="p-1.5 rounded-lg text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                          ⏳ Chưa làm
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      ) : null}

      {/* ✏️ MODAL SỬA ĐIỂM DÀNH CHO CÔ AN NA */}
      {editingItem && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border-2 border-indigo-200 space-y-5 animate-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-purple-100 flex items-center justify-center text-purple-700">
                  <Edit2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-black text-slate-900 uppercase">
                    CHỈNH SỬA ĐIỂM BÀI LÀM
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Quyền quản trị của Cô An Na
                  </p>
                </div>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-3 rounded-2xl bg-purple-50 text-xs text-purple-900 font-semibold space-y-1">
              <div>Bài: {editingItem.assignmentTitle}</div>
              <div className="text-slate-500 text-[11px]">Học sinh: {historyData?.student?.name} (Lớp {selectedClass})</div>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Điểm số mới (Thang điểm 10):
                </label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="10"
                  required
                  value={editScore}
                  onChange={(e) => setEditScore(e.target.value)}
                  placeholder="Ví dụ: 8.5"
                  className="w-full px-4 py-3 rounded-xl border border-slate-300 focus:border-purple-600 outline-none font-black text-lg text-purple-900"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase text-slate-700 mb-1">
                  Ghi chú / Lời nhận xét của Cô An Na (Tùy chọn):
                </label>
                <textarea
                  value={editNote}
                  onChange={(e) => setEditNote(e.target.value)}
                  placeholder="Ví dụ: Đã xem xét và cộng điểm câu hỏi tự luận..."
                  rows={3}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-300 focus:border-purple-600 outline-none text-xs"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingItem(null)}
                  className="flex-1 py-3 rounded-xl border border-slate-300 text-slate-700 font-bold text-xs hover:bg-slate-50 cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs shadow-md shadow-purple-200 transition cursor-pointer disabled:opacity-50"
                >
                  {savingEdit ? 'Đang lưu...' : 'Lưu thay đổi'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
