import React, { useState, useEffect } from 'react';
import {
  Lock,
  Eye,
  Clock,
  Calendar,
  CheckCircle2,
  XCircle,
  Shield,
  HelpCircle,
  Filter,
  Trash2,
  Sparkles,
  Edit3,
  RotateCcw,
  MessageSquare,
} from 'lucide-react';
import { Assignment, DetailedSubmissionView, ReviewMode, Submission, ClassGrade9 } from '../types.ts';
import { api } from '../lib/api.ts';

const ALL_CLASSES: string[] = ['9A8', '9A9', '9A10', '9A11', '9A12'];

export const LockedSubmissionsView: React.FC = () => {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedClass, setSelectedClass] = useState<string>('ALL');
  const [selectedAssignmentId, setSelectedAssignmentId] = useState<string>('ALL');

  // Detail Modal
  const [activeSubmissionDetail, setActiveSubmissionDetail] = useState<DetailedSubmissionView | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);

  // Review mode change
  const [reviewModeChanging, setReviewModeChanging] = useState(false);

  // Edit Submission Modal for Cô An Na
  const [editingSub, setEditingSub] = useState<Submission | null>(null);
  const [editScore, setEditScore] = useState<string>('');
  const [editTeacherNote, setEditTeacherNote] = useState<string>('');
  const [editStatus, setEditStatus] = useState<'SUBMITTED_LOCKED' | 'IN_PROGRESS'>('SUBMITTED_LOCKED');
  const [editStudentName, setEditStudentName] = useState<string>('');
  const [editStudentClass, setEditStudentClass] = useState<string>('9A10');
  const [savingEdit, setSavingEdit] = useState(false);

  const loadSubmissions = async () => {
    setLoading(true);
    try {
      const subRes = await api.getSubmissions({
        classFilter: selectedClass === 'ALL' ? undefined : selectedClass,
        assignmentId: selectedAssignmentId === 'ALL' ? undefined : selectedAssignmentId,
      });
      setSubmissions(subRes.submissions);

      const assignRes = await api.getAssignments();
      setAssignments(assignRes.assignments);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSubmissions();
  }, [selectedClass, selectedAssignmentId]);

  const handleOpenDetail = async (subId: string) => {
    setDetailLoading(true);
    try {
      const detail = await api.getSubmissionDetail(subId);
      setActiveSubmissionDetail(detail);
    } catch (err: any) {
      alert(err.message);
    } finally {
      setDetailLoading(false);
    }
  };

  const handleOpenEdit = (sub: Submission) => {
    setEditingSub(sub);
    setEditScore(sub.score !== undefined ? sub.score.toString() : '');
    setEditTeacherNote(sub.teacherNote || '');
    setEditStatus(sub.status || 'SUBMITTED_LOCKED');
    setEditStudentName(sub.studentName || '');
    setEditStudentClass(sub.studentClass || '9A10');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSub) return;
    setSavingEdit(true);
    try {
      const numScore = parseFloat(editScore);
      const res = await api.updateSubmission(editingSub.id, {
        score: !isNaN(numScore) ? numScore : undefined,
        teacherNote: editTeacherNote,
        status: editStatus,
        studentName: editStudentName,
        studentClass: editStudentClass as ClassGrade9,
      });

      // Update local state
      setSubmissions((prev) =>
        prev.map((s) => (s.id === editingSub.id ? { ...s, ...res.submission } : s))
      );

      if (activeSubmissionDetail && activeSubmissionDetail.submission.id === editingSub.id) {
        setActiveSubmissionDetail({
          ...activeSubmissionDetail,
          submission: { ...activeSubmissionDetail.submission, ...res.submission },
        });
      }

      setEditingSub(null);
      alert('Đã cập nhật bài làm thành công!');
    } catch (err: any) {
      alert(err.message || 'Không thể lưu thay đổi');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleUpdateReviewMode = async (assignmentId: string, newMode: ReviewMode) => {
    setReviewModeChanging(true);
    try {
      await api.updateAssignment(assignmentId, { reviewMode: newMode });
      if (activeSubmissionDetail) {
        setActiveSubmissionDetail({
          ...activeSubmissionDetail,
          reviewMode: newMode,
        });
      }
      alert('Đã cập nhật chế độ xem bài của học sinh!');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setReviewModeChanging(false);
    }
  };

  const handleDeleteSubmission = async (subId: string, studentName?: string) => {
    const confirmMsg = studentName
      ? `Cô An Na có chắc muốn xóa bản nộp bài của học sinh ${studentName}? Sau khi xóa, học sinh có thể làm lại bài mới nếu cần.`
      : 'Cô có chắc muốn xóa bản nộp bài này? Học sinh có thể làm lại bài.';
    if (!window.confirm(confirmMsg)) return;
    try {
      await api.deleteSubmission(subId);
      loadSubmissions();
      if (activeSubmissionDetail?.submission.id === subId) {
        setActiveSubmissionDetail(null);
      }
      alert('Đã xóa bài làm thành công.');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
            <span>🔐</span>
            <span>BÀI LÀM HỌC SINH ĐÃ KHÓA</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 font-medium">
            Toàn bộ bài thi được khóa bảo mật trên máy chủ ngay sau khi nộp. Chỉ Cô An Na có quyền xem chi tiết.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-50 px-3.5 py-2 rounded-2xl border border-emerald-200">
          <Shield className="w-4 h-4 text-emerald-600" />
          <span>Server-Side Secure Locked</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 bg-white rounded-3xl border border-slate-200/80 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Lọc theo lớp học ({ALL_CLASSES.length} lớp Khối 8 & Khối 9)
          </label>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả lớp ({ALL_CLASSES[0]} – {ALL_CLASSES[ALL_CLASSES.length - 1]})</option>
            <optgroup label="Khối 8">
              {ALL_CLASSES.filter((c) => c.startsWith('8')).map((c) => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </optgroup>
            <optgroup label="Khối 9">
              {ALL_CLASSES.filter((c) => c.startsWith('9')).map((c) => (
                <option key={c} value={c}>Lớp {c}</option>
              ))}
            </optgroup>
          </select>
        </div>

        <div>
          <label className="text-[11px] font-bold uppercase text-slate-400 block mb-1">
            Lọc theo nhiệm vụ / bài tập
          </label>
          <select
            value={selectedAssignmentId}
            onChange={(e) => setSelectedAssignmentId(e.target.value)}
            className="w-full px-3.5 py-2.5 rounded-2xl bg-slate-50 border border-slate-200 text-xs sm:text-sm font-semibold text-slate-700 outline-none cursor-pointer"
          >
            <option value="ALL">Tất cả bài tập</option>
            {assignments.map((a) => (
              <option key={a.id} value={a.id}>
                {a.title} ({a.code})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Submissions Table */}
      <div className="bg-white rounded-3xl border border-slate-200/80 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
              <tr>
                <th className="py-3 px-4">Học sinh</th>
                <th className="py-3 px-3">Lớp</th>
                <th className="py-3 px-4">Bài tập / Nhiệm vụ</th>
                <th className="py-3 px-3 text-center">Điểm số</th>
                <th className="py-3 px-3 text-center">Thời gian làm</th>
                <th className="py-3 px-3 text-center">Trạng thái</th>
                <th className="py-3 px-4 text-right">Thao tác của Cô An Na</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {submissions.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-400">
                    Chưa có bài nộp nào phù hợp tiêu chí lọc.
                  </td>
                </tr>
              ) : (
                submissions.map((sub) => {
                  const mins = sub.totalTimeSeconds ? Math.floor(sub.totalTimeSeconds / 60) : 0;
                  const secs = sub.totalTimeSeconds ? sub.totalTimeSeconds % 60 : 0;
                  const duration = `${mins}:${secs.toString().padStart(2, '0')}`;

                  return (
                    <tr key={sub.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-3.5 px-4">
                        <div className="font-bold text-slate-900">{sub.studentName}</div>
                        {sub.teacherNote && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[11px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded-md border border-purple-100">
                            <MessageSquare className="w-3 h-3 shrink-0" />
                            <span className="line-clamp-1">{sub.teacherNote}</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3.5 px-3">
                        <span className="px-2 py-0.5 rounded-lg bg-indigo-50 text-indigo-700 font-bold text-xs">
                          {sub.studentClass}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-slate-700">
                        <p className="font-semibold line-clamp-1">{sub.assignmentTitle || 'Nhiệm vụ'}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Bài {sub.lessonNumber || 1}</p>
                      </td>
                      <td className="py-3.5 px-3 text-center font-extrabold text-base text-purple-700">
                        {sub.score !== undefined ? (
                          <span>
                            {sub.score.toString().replace('.', ',')}
                            <span className="text-xs text-slate-400 font-normal">/{sub.maxScore || 10}</span>
                          </span>
                        ) : (
                          '—'
                        )}
                      </td>
                      <td className="py-3.5 px-3 text-center font-mono text-slate-600">
                        {duration}
                      </td>
                      <td className="py-3.5 px-3 text-center">
                        {sub.status === 'IN_PROGRESS' ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-50 text-amber-700 border border-amber-200">
                            <RotateCcw className="w-3 h-3" /> Đang làm lại
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            <Lock className="w-3 h-3" /> Đã khóa
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenDetail(sub.id)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-purple-50 text-purple-700 font-bold hover:bg-purple-100 transition border border-purple-200 text-xs"
                            title="Xem chi tiết câu trả lời"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Xem bài</span>
                          </button>
                          <button
                            onClick={() => handleOpenEdit(sub)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 transition border border-blue-200 text-xs"
                            title="Cô An Na sửa điểm, nhận xét, hoặc sửa tên/lớp"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                            <span>Sửa</span>
                          </button>
                          <button
                            onClick={() => handleDeleteSubmission(sub.id, sub.studentName)}
                            title="Xóa bản nộp của học sinh này"
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ✏️ MODAL: CÔ AN NA CHỈNH SỬA BÀI LÀM */}
      {editingSub && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-purple-100 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">
                    CHỈNH SỬA BÀI LÀM – CÔ AN NA
                  </h3>
                  <p className="text-xs text-slate-500">
                    Cập nhật điểm số, nhận xét hoặc sửa tên/lớp nếu bị sai
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditingSub(null)}
                className="p-1 rounded-full text-slate-400 hover:bg-slate-100 text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Tên học sinh (sửa nếu sai)
                  </label>
                  <input
                    type="text"
                    required
                    value={editStudentName}
                    onChange={(e) => setEditStudentName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Lớp
                  </label>
                  <select
                    value={editStudentClass}
                    onChange={(e) => setEditStudentClass(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                  >
                    {ALL_CLASSES.map((c) => (
                      <option key={c} value={c}>Lớp {c}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Điểm số (Thang điểm 10)
                  </label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={editScore}
                    onChange={(e) => setEditScore(e.target.value)}
                    placeholder="VD: 9.5"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 focus:border-purple-500 text-sm font-bold text-purple-900"
                  />
                </div>

                <div>
                  <label className="font-bold text-slate-700 uppercase block mb-1">
                    Trạng thái bài làm
                  </label>
                  <select
                    value={editStatus}
                    onChange={(e) => setEditStatus(e.target.value as any)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                  >
                    <option value="SUBMITTED_LOCKED">🔒 Đã khóa (Hoàn thành)</option>
                    <option value="IN_PROGRESS">🔄 Mở khóa cho học sinh làm lại</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 uppercase block mb-1 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-purple-600" />
                  <span>Lời nhận xét / Đánh giá của Cô An Na</span>
                </label>
                <textarea
                  rows={3}
                  value={editTeacherNote}
                  onChange={(e) => setEditTeacherNote(e.target.value)}
                  placeholder="VD: Em nắm rất chắc bài học, câu 4 cần suy nghĩ cẩn thận hơn..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium focus:border-purple-500 outline-none"
                />
              </div>

              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100 text-[11px] text-purple-900">
                💡 <strong>Ghi chú:</strong> Khi lưu thay đổi, hệ thống sẽ tự động cập nhật lại điểm trung bình của học sinh và ghi nhật ký quản trị của Cô An Na.
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSub(null)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-bold hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold shadow-md shadow-purple-200 flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {savingEdit ? 'Đang lưu...' : 'Lưu cập nhật'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 👁️ MODAL: CHI TIẾT BÀI LÀM ĐÃ KHÓA */}
      {activeSubmissionDetail && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            {/* Header info */}
            <div className="flex items-start justify-between border-b pb-4">
              <div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 text-xs font-bold uppercase mb-2 border border-emerald-200">
                  <Lock className="w-3.5 h-3.5" />
                  <span>BẢN NỘP ĐÃ KHÓA BẢO MẬT</span>
                </div>
                <h3 className="text-xl font-black text-slate-900">
                  {activeSubmissionDetail.submission.studentName} – Lớp {activeSubmissionDetail.submission.studentClass}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Nhiệm vụ: <strong>{activeSubmissionDetail.submission.assignmentTitle}</strong> (Bài {activeSubmissionDetail.submission.lessonNumber})
                </p>
                {activeSubmissionDetail.submission.teacherNote && (
                  <div className="mt-2 p-2.5 bg-purple-50 rounded-xl border border-purple-200 text-xs text-purple-900">
                    <strong>Nhận xét của Cô An Na:</strong> {activeSubmissionDetail.submission.teacherNote}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleOpenEdit(activeSubmissionDetail.submission)}
                  className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold border border-blue-200 flex items-center gap-1"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Sửa bài này</span>
                </button>
                <button
                  onClick={() => setActiveSubmissionDetail(null)}
                  className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
                >
                  Đóng
                </button>
              </div>
            </div>

            {/* Time & Score Overview */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="p-3 bg-purple-50 rounded-2xl border border-purple-100">
                <span className="text-[11px] font-bold uppercase text-purple-700 block">Điểm số</span>
                <span className="text-2xl font-black text-purple-900">
                  {activeSubmissionDetail.submission.score?.toString().replace('.', ',')}
                  <span className="text-xs font-normal text-purple-500">/{activeSubmissionDetail.submission.maxScore || 10}</span>
                </span>
              </div>

              <div className="p-3 bg-blue-50 rounded-2xl border border-blue-100">
                <span className="text-[11px] font-bold uppercase text-blue-700 block">Số câu đúng</span>
                <span className="text-2xl font-black text-blue-900">
                  {activeSubmissionDetail.submission.correctCount}/{activeSubmissionDetail.submission.totalQuestions}
                </span>
              </div>

              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block">Thời gian làm</span>
                <span className="text-2xl font-black text-emerald-900 font-mono">
                  {Math.floor((activeSubmissionDetail.submission.totalTimeSeconds || 0) / 60)}:
                  {((activeSubmissionDetail.submission.totalTimeSeconds || 0) % 60).toString().padStart(2, '0')}
                </span>
              </div>

              <div className="p-3 bg-amber-50 rounded-2xl border border-amber-100">
                <span className="text-[11px] font-bold uppercase text-amber-700 block">Thời gian nộp</span>
                <span className="text-xs font-bold text-amber-900 block mt-1">
                  {activeSubmissionDetail.submission.submittedAt
                    ? new Date(activeSubmissionDetail.submission.submittedAt).toLocaleTimeString('vi-VN')
                    : '—'}
                </span>
                <span className="text-[10px] text-amber-700 block">
                  {activeSubmissionDetail.submission.submittedAt
                    ? new Date(activeSubmissionDetail.submission.submittedAt).toLocaleDateString('vi-VN')
                    : '—'}
                </span>
              </div>
            </div>

            {/* 🔓 Options: Cho phép học sinh xem lại */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-2">
              <label className="text-xs font-extrabold uppercase text-slate-700 flex items-center gap-1.5">
                <span>🔓 TÙY CHỌN: CHO PHÉP HỌC SINH XEM LẠI</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {[
                  { value: 'NO_REVIEW', label: '🔒 Không cho xem (Mặc định bảo mật)' },
                  { value: 'SCORE_ONLY', label: '⭐ Chỉ xem điểm số' },
                  { value: 'QUESTIONS_NO_ANSWER', label: '📝 Xem bài nhưng ẩn đáp án đúng' },
                  { value: 'FULL_REVIEW', label: '🔓 Xem đầy đủ câu hỏi & đáp án' },
                ].map((item) => (
                  <button
                    key={item.value}
                    type="button"
                    disabled={reviewModeChanging}
                    onClick={() =>
                      handleUpdateReviewMode(activeSubmissionDetail.submission.assignmentId, item.value as ReviewMode)
                    }
                    className={`p-2.5 rounded-xl border text-left font-semibold transition ${
                      activeSubmissionDetail.reviewMode === item.value
                        ? 'bg-purple-600 text-white border-purple-700 shadow-sm'
                        : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-100'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Question Breakdown List */}
            <div className="space-y-4">
              <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider">
                CHI TIẾT TỪNG CÂU HỎI
              </h4>

              {activeSubmissionDetail.items.map((item, idx) => (
                <div
                  key={item.questionId}
                  className={`p-4 rounded-2xl border ${
                    item.isCorrect
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-rose-50/50 border-rose-200'
                  } space-y-2`}
                >
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-slate-800">
                      Câu {idx + 1} ({item.pointsEarned}/{item.maxPoints} điểm)
                    </span>

                    <div className="flex items-center gap-2">
                      {item.savedAt && (
                        <span className="text-[10px] text-slate-400 font-mono flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Lưu: {new Date(item.savedAt).toLocaleTimeString('vi-VN')}
                        </span>
                      )}
                      {item.isCorrect ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Đúng
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[11px]">
                          <XCircle className="w-3.5 h-3.5" /> Chưa đúng
                        </span>
                      )}
                    </div>
                  </div>

                  <p className="text-sm font-semibold text-slate-900">{item.content}</p>

                  {/* Options */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {item.options.map((opt) => {
                      const isStudentChoice = item.selectedOption === opt.key;
                      const isCorrectChoice = item.correctOption === opt.key;

                      let style = 'bg-white border-slate-200 text-slate-700';
                      if (isCorrectChoice) {
                        style = 'bg-emerald-100/80 border-emerald-300 text-emerald-950 font-bold';
                      } else if (isStudentChoice && !item.isCorrect) {
                        style = 'bg-rose-100/80 border-rose-300 text-rose-950 line-through';
                      }

                      return (
                        <div key={opt.key} className={`p-2 rounded-xl border flex items-center justify-between ${style}`}>
                          <span>
                            <strong>{opt.key}.</strong> {opt.text}
                          </span>
                          <span className="text-[10px] font-bold">
                            {isStudentChoice && '👈 Trả lời'}
                            {isCorrectChoice && ' ✅ Chuẩn'}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {item.explanation && (
                    <p className="text-xs text-slate-600 bg-white/80 p-2.5 rounded-xl border border-slate-200/60 mt-1">
                      💡 <strong>Giải thích chuẩn:</strong> {item.explanation}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
