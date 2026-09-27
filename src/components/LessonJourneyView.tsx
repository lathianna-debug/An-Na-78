import React, { useState, useEffect } from 'react';
import {
  BookOpen,
  FolderOpen,
  Plus,
  Edit2,
  Copy,
  Trash2,
  Lock,
  Unlock,
  Eye,
  Upload,
  Clock,
  KeyRound,
  CheckCircle2,
  ArrowLeft,
  Sparkles,
  AlertCircle,
  HelpCircle,
  Calendar,
  AlertTriangle,
  Timer,
  Check,
  Settings2,
} from 'lucide-react';
import { Assignment, AssignmentType, Lesson, Question, ReviewMode } from '../types.ts';
import { api } from '../lib/api.ts';
import { SmartAssignmentUploaderModal } from './SmartAssignmentUploaderModal.tsx';
import { KET_NOI_TRI_THUC_GDCD9_LESSONS } from '../lib/ketNoiLessons.ts';
import { ParsedQuestion } from '../lib/questionParser.ts';

const toDatetimeLocal = (isoStr: string | null | undefined) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  if (isNaN(d.getTime())) return '';
  const pad = (n: number) => n.toString().padStart(2, '0');
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

const formatVNDateTime = (isoStr: string | null | undefined) => {
  if (!isoStr) return '';
  try {
    const d = new Date(isoStr);
    return d.toLocaleString('vi-VN', {
      hour: '2-digit',
      minute: '2-digit',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  } catch {
    return isoStr;
  }
};

export const LessonJourneyView: React.FC = () => {
  const [lessons, setLessons] = useState<Lesson[]>([]);
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [showEditLessonModal, setShowEditLessonModal] = useState(false);
  const [lessonFormData, setLessonFormData] = useState({ title: '', number: 1, description: '' });

  const [showAddAssignModal, setShowAddAssignModal] = useState(false);
  const [showEditAssignModal, setShowEditAssignModal] = useState(false);
  const [assignFormData, setAssignFormData] = useState<{
    id?: string;
    title: string;
    code: string;
    type: AssignmentType;
    description: string;
    durationMinutes: number;
    reviewMode: ReviewMode;
    isLocked?: boolean;
    timeLimitEnabled?: boolean;
    openTime?: string;
    closeTime?: string;
    scheduleNote?: string;
  }>({
    title: '',
    code: '',
    type: 'bai_tap',
    description: '',
    durationMinutes: 15,
    reviewMode: 'NO_REVIEW',
    isLocked: false,
    timeLimitEnabled: false,
    openTime: '',
    closeTime: '',
    scheduleNote: '',
  });

  // Time Schedule Modal state
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleTarget, setScheduleTarget] = useState<Assignment | null>(null);
  const [scheduleData, setScheduleData] = useState<{
    timeLimitEnabled: boolean;
    isLocked: boolean;
    openTime: string;
    closeTime: string;
    scheduleNote: string;
    applyToAllInLesson: boolean;
  }>({
    timeLimitEnabled: false,
    isLocked: false,
    openTime: '',
    closeTime: '',
    scheduleNote: '',
    applyToAllInLesson: false,
  });

  // Smart Uploader Modal state
  const [showSmartUploader, setShowSmartUploader] = useState(false);
  const [uploaderLessonId, setUploaderLessonId] = useState<string | undefined>(undefined);
  const [uploaderAssignmentId, setUploaderAssignmentId] = useState<string | undefined>(undefined);

  // Preview questions modal
  const [previewAssignment, setPreviewAssignment] = useState<{ assignment: Assignment; questions: Question[] } | null>(null);

  const [toast, setToast] = useState<string | null>(null);

  const showNotification = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const loadLessons = async () => {
    setLoading(true);
    try {
      const data = await api.getLessons();
      setLessons(data.lessons);
    } catch (e: any) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const loadAssignments = async (lessonId: string) => {
    try {
      const data = await api.getAssignments(lessonId);
      setAssignments(data.assignments);
    } catch (e: any) {
      console.error(e);
    }
  };

  useEffect(() => {
    loadLessons();
  }, []);

  const handleOpenLesson = (lesson: Lesson) => {
    setSelectedLesson(lesson);
    loadAssignments(lesson.id);
  };

  const handleCreateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.createLesson(lessonFormData);
      setShowAddLessonModal(false);
      setLessonFormData({ title: '', number: lessons.length + 1, description: '' });
      showNotification('Tạo bài học thành công!');
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateLesson = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    try {
      await api.updateLesson(selectedLesson.id, lessonFormData);
      setShowEditLessonModal(false);
      showNotification('Cập nhật bài học thành công!');
      loadLessons();
      setSelectedLesson({ ...selectedLesson, ...lessonFormData });
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteLesson = async (lesson: Lesson) => {
    if (!window.confirm(`Cô có chắc chắn muốn xóa "${lesson.title}"?`)) return;
    try {
      await api.deleteLesson(lesson.id);
      showNotification('Đã xóa bài học.');
      if (selectedLesson?.id === lesson.id) {
        setSelectedLesson(null);
      }
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicateLesson = async (lesson: Lesson) => {
    try {
      await api.duplicateLesson(lesson.id);
      showNotification('Nhân bản bài học thành công!');
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  // ASSIGNMENTS ACTIONS
  const handleCreateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLesson) return;
    try {
      await api.createAssignment({
        ...assignFormData,
        openTime: assignFormData.openTime ? new Date(assignFormData.openTime).toISOString() : null,
        closeTime: assignFormData.closeTime ? new Date(assignFormData.closeTime).toISOString() : null,
        lessonId: selectedLesson.id,
      });
      setShowAddAssignModal(false);
      setAssignFormData({
        title: '',
        code: '',
        type: 'bai_tap',
        description: '',
        durationMinutes: 15,
        reviewMode: 'NO_REVIEW',
        isLocked: false,
        timeLimitEnabled: false,
        openTime: '',
        closeTime: '',
        scheduleNote: '',
      });
      showNotification('Tạo nhiệm vụ học tập mới thành công!');
      loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleUpdateAssignment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!assignFormData.id || !selectedLesson) return;
    try {
      await api.updateAssignment(assignFormData.id, {
        ...assignFormData,
        openTime: assignFormData.openTime ? new Date(assignFormData.openTime).toISOString() : null,
        closeTime: assignFormData.closeTime ? new Date(assignFormData.closeTime).toISOString() : null,
      });
      setShowEditAssignModal(false);
      showNotification('Cập nhật nhiệm vụ thành công!');
      loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDeleteAssignment = async (assign: Assignment) => {
    if (!window.confirm(`Cô có chắc muốn xóa "${assign.title}" (Mã: ${assign.code})?`)) return;
    try {
      await api.deleteAssignment(assign.id);
      showNotification('Đã xóa nhiệm vụ.');
      if (selectedLesson) loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleDuplicateAssignment = async (assign: Assignment) => {
    try {
      await api.duplicateAssignment(assign.id);
      showNotification('Nhân bản nhiệm vụ thành công!');
      if (selectedLesson) loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleToggleLock = async (assign: Assignment) => {
    try {
      await api.toggleLockAssignment(assign.id);
      showNotification(assign.isLocked ? 'Đã mở khóa nhiệm vụ!' : 'Đã khóa nhiệm vụ!');
      if (selectedLesson) loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenScheduleModal = (assign?: Assignment) => {
    if (assign) {
      setScheduleTarget(assign);
      setScheduleData({
        timeLimitEnabled: !!assign.timeLimitEnabled,
        isLocked: !!assign.isLocked,
        openTime: assign.openTime ? toDatetimeLocal(assign.openTime) : '',
        closeTime: assign.closeTime ? toDatetimeLocal(assign.closeTime) : '',
        scheduleNote: assign.scheduleNote || '',
        applyToAllInLesson: false,
      });
    } else {
      setScheduleTarget(null);
      const now = new Date();
      const in45m = new Date(Date.now() + 45 * 60000);
      setScheduleData({
        timeLimitEnabled: true,
        isLocked: false,
        openTime: toDatetimeLocal(now.toISOString()),
        closeTime: toDatetimeLocal(in45m.toISOString()),
        scheduleNote: 'Thời gian làm bài trên lớp quy định bởi Cô An Na',
        applyToAllInLesson: true,
      });
    }
    setShowScheduleModal(true);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (scheduleTarget && !scheduleData.applyToAllInLesson) {
        await api.scheduleAssignment(scheduleTarget.id, {
          timeLimitEnabled: scheduleData.timeLimitEnabled,
          isLocked: scheduleData.isLocked,
          openTime: scheduleData.openTime ? new Date(scheduleData.openTime).toISOString() : null,
          closeTime: scheduleData.closeTime ? new Date(scheduleData.closeTime).toISOString() : null,
          scheduleNote: scheduleData.scheduleNote,
        });
        showNotification(`Đã cập nhật thời gian mở/khóa bài "${scheduleTarget.title}"`);
      } else {
        const ids = assignments.map((a) => a.id);
        if (ids.length === 0) {
          alert('Chưa có bài tập nào trong bài học này để cài đặt.');
          return;
        }
        await api.batchLockAssignments({
          action: 'batch_schedule',
          assignmentIds: ids,
          timeLimitEnabled: scheduleData.timeLimitEnabled,
          openTime: scheduleData.openTime ? new Date(scheduleData.openTime).toISOString() : null,
          closeTime: scheduleData.closeTime ? new Date(scheduleData.closeTime).toISOString() : null,
          scheduleNote: scheduleData.scheduleNote,
        });
        showNotification(`Đã áp dụng thời gian làm bài cho toàn bộ ${ids.length} bài tập!`);
      }
      setShowScheduleModal(false);
      if (selectedLesson) loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleBatchLockAll = async (action: 'lock_all' | 'unlock_all') => {
    if (assignments.length === 0) {
      alert('Chưa có nhiệm vụ nào trong bài học này.');
      return;
    }
    const isLock = action === 'lock_all';
    const confirmMsg = isLock
      ? `Cô có chắc chắn muốn KHÓA TOÀN BỘ ${assignments.length} nhiệm vụ trong Bài ${selectedLesson?.number}? Học sinh sẽ không thể vào làm bài.`
      : `Cô có chắc chắn muốn MỞ KHÓA TOÀN BỘ ${assignments.length} nhiệm vụ trong Bài ${selectedLesson?.number} cho học sinh làm bài?`;
    if (!window.confirm(confirmMsg)) return;

    try {
      const ids = assignments.map((a) => a.id);
      await api.batchLockAssignments({
        action,
        assignmentIds: ids,
      });
      showNotification(isLock ? 'Đã khóa toàn bộ nhiệm vụ!' : 'Đã mở khóa toàn bộ nhiệm vụ!');
      if (selectedLesson) loadAssignments(selectedLesson.id);
      loadLessons();
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenPreview = async (assign: Assignment) => {
    try {
      const data = await api.getAssignmentDetail(assign.id);
      setPreviewAssignment(data);
    } catch (err: any) {
      alert(err.message);
    }
  };

  const handleOpenSmartUploader = (lessonId?: string, assignmentId?: string) => {
    setUploaderLessonId(lessonId || (selectedLesson ? selectedLesson.id : undefined));
    setUploaderAssignmentId(assignmentId);
    setShowSmartUploader(true);
  };

  const handleCreateAssignmentAndImport = async (assignmentData: any, questions: ParsedQuestion[]) => {
    // 1. Create assignment
    const res = await api.createAssignment(assignmentData);
    const newId = res.assignment.id;
    // 2. Import questions
    await api.importQuestions(newId, { questions });
    loadLessons();
    if (selectedLesson) {
      loadAssignments(selectedLesson.id);
    }
  };

  const handleImportToExisting = async (assignmentId: string, questions: ParsedQuestion[]) => {
    await api.importQuestions(assignmentId, { questions });
    if (selectedLesson) {
      loadAssignments(selectedLesson.id);
    }
    loadLessons();
  };

  const typeLabels: Record<AssignmentType, { label: string; color: string; icon: string }> = {
    bai_tap: { label: 'Bài tập', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: '📝' },
    luyen_tap: { label: 'Luyện tập', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: '🎯' },
    tinh_huong: { label: 'Tình huống', color: 'bg-amber-100 text-amber-800 border-amber-200', icon: '🧠' },
    van_dung: { label: 'Vận dụng', color: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: '🌱' },
    phieu_cung_co: { label: 'Phiếu củng cố', color: 'bg-rose-100 text-rose-800 border-rose-200', icon: '📋' },
  };

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-20 right-4 z-50 bg-slate-900 text-white px-4 py-2.5 rounded-2xl shadow-xl text-xs font-semibold flex items-center gap-2 border border-slate-700 animate-in slide-in-from-top-2">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* QUICK BANNER: 10 BÀI KẾT NỐI TRI THỨC VÀ NÚT TẢI BÀI TẬP THÔNG MINH */}
      <div className="p-5 rounded-3xl bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 text-white shadow-lg shadow-purple-200/50 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-bold backdrop-blur-md">
            <span>✨ CHƯƠNG TRÌNH CHUẨN</span>
            <span>• 10 BÀI KẾT NỐI TRI THỨC VỚI CUỘC SỐNG</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Quản Lý &amp; Tải Lên Bài Tập Theo Từng Bài
          </h2>
          <p className="text-xs sm:text-sm text-purple-100 max-w-2xl leading-relaxed">
            Dán trực tiếp câu hỏi từ Word / PDF. Hệ thống sẽ tự động bóc tách câu hỏi, đáp án A-B-C-D, gợi ý giải thích và điều chỉnh thang điểm chuẩn 10 để học sinh làm trực tiếp trên điện thoại hoặc máy tính.
          </p>
        </div>

        <button
          onClick={() => handleOpenSmartUploader(selectedLesson?.id)}
          className="self-start md:self-auto px-5 py-3 rounded-2xl bg-white hover:bg-purple-50 text-purple-900 font-black text-xs sm:text-sm shadow-xl shadow-purple-900/20 hover:scale-105 active:scale-95 transition flex items-center gap-2"
        >
          <Sparkles className="w-5 h-5 text-purple-600" />
          <span>📤 DÁN &amp; TỰ PHÂN LOẠI BÀI TẬP</span>
        </button>
      </div>

      {/* Breadcrumb & Navigation */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {selectedLesson && (
            <button
              onClick={() => setSelectedLesson(null)}
              className="p-2 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-600 hover:text-purple-700 transition"
              title="Quay lại danh sách bài học"
            >
              <ArrowLeft className="w-4 h-4" />
            </button>
          )}
          <div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
              <span>📚</span>
              <span>{selectedLesson ? `Bài ${selectedLesson.number}: ${selectedLesson.title}` : '10 BÀI HỌC GDCD 9 KẾT NỐI TRI THỨC'}</span>
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 font-medium">
              {selectedLesson
                ? selectedLesson.description || 'Quản lý các nhiệm vụ, bài tập và tình huống học tập'
                : 'Mục lục 10 bài học chuẩn SGK Kết nối tri thức với các ô tải bài tập chuyên biệt'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {selectedLesson ? (
            <>
              <button
                onClick={() => handleOpenSmartUploader(selectedLesson.id)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-purple-700 bg-purple-100 hover:bg-purple-200 transition"
              >
                <Upload className="w-4 h-4" />
                <span>📤 Dán bài tập nhanh</span>
              </button>
              <button
                onClick={() => {
                  setAssignFormData({
                    title: '',
                    code: `GDCD9-B${selectedLesson.number}-${assignments.length + 1}`,
                    type: 'bai_tap',
                    description: '',
                    durationMinutes: 15,
                    reviewMode: 'NO_REVIEW',
                  });
                  setShowAddAssignModal(true);
                }}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-200 transition"
              >
                <Plus className="w-4 h-4" />
                <span>➕ Tạo bài thủ công</span>
              </button>
            </>
          ) : (
            <button
              onClick={() => {
                setLessonFormData({
                  title: '',
                  number: lessons.length + 1,
                  description: '',
                });
                setShowAddLessonModal(true);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 shadow-sm shadow-purple-200 transition"
            >
              <Plus className="w-4 h-4" />
              <span>➕ Thêm bài học mới</span>
            </button>
          )}
        </div>
      </div>

      {/* VIEW 1: LESSONS GRID */}
      {!selectedLesson ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {lessons.map((lesson) => {
            const knDef = KET_NOI_TRI_THUC_GDCD9_LESSONS.find((k) => k.number === lesson.number);
            const cardColors = [
              'from-purple-500/10 to-indigo-500/5 border-purple-200/80',
              'from-blue-500/10 to-cyan-500/5 border-blue-200/80',
              'from-emerald-500/10 to-teal-500/5 border-emerald-200/80',
              'from-amber-500/10 to-orange-500/5 border-amber-200/80',
              'from-rose-500/10 to-pink-500/5 border-rose-200/80',
            ];
            const colorClass = cardColors[(lesson.number - 1) % cardColors.length];

            return (
              <div
                key={lesson.id}
                className={`rounded-3xl p-5 sm:p-6 bg-gradient-to-br ${colorClass} bg-white border shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all flex flex-col justify-between group`}
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 rounded-full text-xs font-black bg-white shadow-sm border border-slate-200 text-slate-800 flex items-center gap-1.5">
                      <span>{knDef?.icon || '📘'}</span>
                      <span>BÀI {lesson.number}</span>
                    </span>
                    <span className="text-xs font-semibold text-slate-500">
                      📝 {lesson.assignmentsCount || 0} bài tập
                    </span>
                  </div>

                  <h3 className="text-base sm:text-lg font-extrabold text-slate-900 tracking-tight leading-snug group-hover:text-purple-700 transition-colors">
                    {lesson.title}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                    {lesson.description || knDef?.description || 'Chưa có mô tả cho bài học này.'}
                  </p>
                </div>

                <div className="mt-5 pt-4 border-t border-slate-200/60 flex flex-col gap-2">
                  {/* Dedicated Action Button: TẢI BÀI TẬP LÊN BÀI NÀY */}
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleOpenLesson(lesson)}
                      className="py-2 px-3 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm shadow-purple-200 transition"
                    >
                      <FolderOpen className="w-3.5 h-3.5" />
                      <span>📂 MỞ BÀI</span>
                    </button>

                    <button
                      onClick={() => handleOpenSmartUploader(lesson.id)}
                      className="py-2 px-3 rounded-xl bg-white hover:bg-purple-50 text-purple-700 border-2 border-purple-200 hover:border-purple-300 font-bold text-xs flex items-center justify-center gap-1.5 shadow-xs transition"
                    >
                      <Upload className="w-3.5 h-3.5 text-purple-600" />
                      <span>📤 TẢI BÀI</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[11px] font-semibold text-slate-400">
                      Mã gợi ý: <code className="text-purple-600 font-bold">{knDef?.defaultCode || `GDCD9-B${lesson.number}`}</code>
                    </span>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => {
                          setSelectedLesson(lesson);
                          setLessonFormData({
                            title: lesson.title,
                            number: lesson.number,
                            description: lesson.description,
                          });
                          setShowEditLessonModal(true);
                        }}
                        title="Sửa tên bài"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-blue-700 hover:bg-white transition"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDuplicateLesson(lesson)}
                        title="Nhân bản bài"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-emerald-700 hover:bg-white transition"
                      >
                        <Copy className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => handleDeleteLesson(lesson)}
                        title="Xóa bài học"
                        className="p-1.5 rounded-lg text-slate-400 hover:text-rose-700 hover:bg-white transition"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* VIEW 2: INSIDE A LESSON (List of Assignments) */
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50/70 to-pink-50/70 border border-purple-200/80 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs shadow-xs">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono font-black bg-purple-700 text-white px-2.5 py-0.5 rounded-lg">
                  BÀI {selectedLesson.number}
                </span>
                <span className="font-extrabold text-sm text-slate-900">{selectedLesson.title}</span>
              </div>
              <div className="flex flex-wrap items-center gap-2 pt-1">
                <span className="px-2 py-0.5 rounded-md bg-white border border-slate-200 font-bold text-slate-700">
                  📝 Tổng: {assignments.length} nhiệm vụ
                </span>
                <span className="px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                  🟢 Đang mở: {assignments.filter((a) => a.isAvailable !== false && !a.isLocked).length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 font-bold border border-rose-200">
                  🔒 Đã khóa: {assignments.filter((a) => a.isLocked || a.isAvailable === false).length}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-800 font-bold border border-purple-200">
                  ⏰ Có hẹn giờ: {assignments.filter((a) => a.timeLimitEnabled).length}
                </span>
              </div>
            </div>

            {/* Batch Actions Buttons for Cô An Na */}
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => handleBatchLockAll('unlock_all')}
                className="px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                title="Mở tất cả bài tập trong bài học này cho học sinh làm"
              >
                <Unlock className="w-3.5 h-3.5" />
                <span>Mở tất cả</span>
              </button>

              <button
                type="button"
                onClick={() => handleBatchLockAll('lock_all')}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                title="Khóa toàn bộ bài tập trong bài học này"
              >
                <Lock className="w-3.5 h-3.5" />
                <span>Khóa tất cả</span>
              </button>

              <button
                type="button"
                onClick={() => handleOpenScheduleModal()}
                className="px-3 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white font-extrabold text-xs flex items-center gap-1.5 shadow-sm transition active:scale-95"
                title="Hẹn giờ mở và đóng bài tập cho toàn bộ bài học này"
              >
                <Clock className="w-3.5 h-3.5" />
                <span>⏰ Hẹn giờ bài học</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setLessonFormData({
                    title: selectedLesson.title,
                    number: selectedLesson.number,
                    description: selectedLesson.description,
                  });
                  setShowEditLessonModal(true);
                }}
                className="p-2 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-purple-700 hover:border-purple-300 font-semibold transition"
                title="Sửa thông tin bài học"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {assignments.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-300 p-8 space-y-3">
              <div className="text-3xl">📝</div>
              <p className="text-sm font-semibold text-slate-700">
                Bài học này chưa có nhiệm vụ hoặc bài tập nào.
              </p>
              <button
                onClick={() => setShowAddAssignModal(true)}
                className="px-4 py-2 rounded-xl bg-purple-600 text-white font-bold text-xs"
              >
                ➕ Thêm bài tập ngay
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assignments.map((assign) => {
                const typeInfo = typeLabels[assign.type] || typeLabels.bai_tap;
                const isManuallyLocked = !!assign.isLocked;
                const isNotOpenYet = !isManuallyLocked && assign.timeLimitEnabled && assign.openTime && new Date() < new Date(assign.openTime);
                const isExpired = !isManuallyLocked && assign.timeLimitEnabled && assign.closeTime && new Date() > new Date(assign.closeTime);

                return (
                  <div
                    key={assign.id}
                    className={`bg-white rounded-3xl p-5 border shadow-sm hover:shadow-md transition space-y-3 flex flex-col justify-between ${
                      isManuallyLocked
                        ? 'border-rose-200/90 bg-rose-50/20'
                        : isNotOpenYet
                        ? 'border-amber-200/90 bg-amber-50/20'
                        : isExpired
                        ? 'border-slate-300/80 bg-slate-50/40'
                        : 'border-slate-200/80 hover:border-purple-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border flex items-center gap-1 ${typeInfo.color}`}>
                          <span>{typeInfo.icon}</span>
                          <span>{typeInfo.label}</span>
                        </span>

                        {/* Quick Lock / Unlock toggle button */}
                        <div className="flex items-center gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleToggleLock(assign)}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-black border shadow-xs transition active:scale-95 cursor-pointer ${
                              assign.isLocked
                                ? 'bg-rose-600 text-white border-rose-700 hover:bg-rose-700'
                                : 'bg-emerald-600 text-white border-emerald-700 hover:bg-emerald-700'
                            }`}
                            title={assign.isLocked ? 'Bấm để MỞ KHÓA cho học sinh làm bài' : 'Bấm để KHÓA BÀI TẬP ngay lập tức'}
                          >
                            {assign.isLocked ? (
                              <>
                                <Lock className="w-3.5 h-3.5" /> <span>ĐÃ KHÓA</span>
                              </>
                            ) : (
                              <>
                                <Unlock className="w-3.5 h-3.5" /> <span>ĐANG MỞ</span>
                              </>
                            )}
                          </button>
                        </div>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 tracking-tight">
                        {assign.title}
                      </h4>

                      {/* Real-time Schedule status banner */}
                      <div className="pt-1">
                        {isManuallyLocked ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-rose-100/80 text-rose-800 text-[11px] font-bold border border-rose-200">
                            <Lock className="w-3 h-3 text-rose-600" />
                            <span>Khóa thủ công: Học sinh không thể vào làm bài</span>
                          </div>
                        ) : isNotOpenYet ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold border border-amber-200">
                            <Clock className="w-3 h-3 text-amber-600" />
                            <span>Chưa đến giờ: Sẽ mở lúc {formatVNDateTime(assign.openTime)}</span>
                          </div>
                        ) : isExpired ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-200 text-slate-800 text-[11px] font-bold border border-slate-300">
                            <AlertTriangle className="w-3 h-3 text-slate-600" />
                            <span>Đã hết hạn: Đã đóng lúc {formatVNDateTime(assign.closeTime)}</span>
                          </div>
                        ) : assign.timeLimitEnabled && assign.closeTime ? (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-900 text-[11px] font-bold border border-emerald-200">
                            <Clock className="w-3 h-3 text-emerald-600" />
                            <span>Đang mở • Hạn chót: {formatVNDateTime(assign.closeTime)}</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-[11px] font-semibold border border-emerald-200">
                            <Check className="w-3 h-3 text-emerald-600" />
                            <span>Đang mở tự do (Không giới hạn thời gian đóng)</span>
                          </div>
                        )}

                        {assign.scheduleNote && (
                          <p className="text-[11px] text-purple-700 font-medium italic mt-1">
                            📌 {assign.scheduleNote}
                          </p>
                        )}
                      </div>

                      <p className="text-xs text-slate-500 mt-2 line-clamp-2">
                        {assign.description || 'Chưa có mô tả cụ thể.'}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 pt-3 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <KeyRound className="w-3.5 h-3.5 text-purple-600" />
                          <strong className="text-slate-800 font-mono">{assign.code}</strong>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <Clock className="w-3.5 h-3.5 text-blue-600" />
                          <span>{assign.durationMinutes} phút</span>
                        </span>
                        <span className="flex items-center gap-1 bg-slate-100 px-2.5 py-1 rounded-lg">
                          <HelpCircle className="w-3.5 h-3.5 text-amber-600" />
                          <span>{assign.questionsCount || 0} câu hỏi</span>
                        </span>
                      </div>
                    </div>

                    {/* Action Toolbar */}
                    <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => handleOpenPreview(assign)}
                          className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-purple-100 text-slate-700 font-bold hover:text-purple-800 transition flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Xem</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleOpenSmartUploader(selectedLesson.id, assign.id)}
                          className="px-2.5 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-700 font-bold border border-purple-200 transition flex items-center gap-1"
                        >
                          <Upload className="w-3.5 h-3.5" />
                          <span>Nạp câu</span>
                        </button>

                        {/* ⏰ Nút Hẹn giờ làm bài */}
                        <button
                          type="button"
                          onClick={() => handleOpenScheduleModal(assign)}
                          className="px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold border border-amber-200 transition flex items-center gap-1"
                          title="Cài đặt thời gian mở / khóa bài tập này"
                        >
                          <Clock className="w-3.5 h-3.5 text-amber-600" />
                          <span>Hẹn giờ</span>
                        </button>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          type="button"
                          onClick={() => {
                            setAssignFormData({
                              id: assign.id,
                              title: assign.title,
                              code: assign.code,
                              type: assign.type,
                              description: assign.description,
                              durationMinutes: assign.durationMinutes,
                              reviewMode: assign.reviewMode,
                              isLocked: !!assign.isLocked,
                              timeLimitEnabled: !!assign.timeLimitEnabled,
                              openTime: assign.openTime ? toDatetimeLocal(assign.openTime) : '',
                              closeTime: assign.closeTime ? toDatetimeLocal(assign.closeTime) : '',
                              scheduleNote: assign.scheduleNote || '',
                            });
                            setShowEditAssignModal(true);
                          }}
                          title="Sửa nội dung"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-blue-600 hover:bg-slate-100 transition"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDuplicateAssignment(assign)}
                          title="Nhân bản"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-slate-100 transition"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>

                        <button
                          type="button"
                          onClick={() => handleDeleteAssignment(assign)}
                          title="Xóa"
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-slate-100 transition"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* MODAL: ADD / EDIT LESSON */}
      {(showAddLessonModal || showEditLessonModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-purple-100">
            <h3 className="text-lg font-extrabold text-slate-900">
              {showEditLessonModal ? '✏️ SỬA TÊN BÀI HỌC' : '➕ THÊM BÀI HỌC MỚI'}
            </h3>
            <form
              onSubmit={showEditLessonModal ? handleUpdateLesson : handleCreateLesson}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Thứ tự bài (Số)
                </label>
                <input
                  type="number"
                  required
                  min={1}
                  value={lessonFormData.number}
                  onChange={(e) =>
                    setLessonFormData({ ...lessonFormData, number: Number(e.target.value) })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Tên bài học
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Kế thừa và phát huy truyền thống tốt đẹp của dân tộc"
                  value={lessonFormData.title}
                  onChange={(e) => setLessonFormData({ ...lessonFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-medium"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Mô tả / Tóm tắt trọng tâm
                </label>
                <textarea
                  rows={3}
                  placeholder="Khái niệm và biểu hiện phẩm chất..."
                  value={lessonFormData.description}
                  onChange={(e) =>
                    setLessonFormData({ ...lessonFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-normal"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddLessonModal(false);
                    setShowEditLessonModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-md shadow-purple-200"
                >
                  Lưu bài học
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD / EDIT ASSIGNMENT */}
      {(showAddAssignModal || showEditAssignModal) && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900">
              {showEditAssignModal ? '✏️ CHỈNH SỬA NHIỆM VỤ' : '➕ TẠO NHIỆM VỤ HỌC TẬP MỚI'}
            </h3>
            <form
              onSubmit={showEditAssignModal ? handleUpdateAssignment : handleCreateAssignment}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Tên nhiệm vụ / bài tập
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ví dụ: Nhiệm vụ 01: Nhận diện phẩm chất Chí công vô tư"
                  value={assignFormData.title}
                  onChange={(e) => setAssignFormData({ ...assignFormData, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                    Mã nhiệm vụ (Code)
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="GDCD9-B1"
                    value={assignFormData.code}
                    onChange={(e) =>
                      setAssignFormData({ ...assignFormData, code: e.target.value.toUpperCase() })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-bold uppercase font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                    Thời gian làm (Phút)
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    max={120}
                    value={assignFormData.durationMinutes}
                    onChange={(e) =>
                      setAssignFormData({
                        ...assignFormData,
                        durationMinutes: Number(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Phân loại nhiệm vụ
                </label>
                <select
                  value={assignFormData.type}
                  onChange={(e) =>
                    setAssignFormData({ ...assignFormData, type: e.target.value as AssignmentType })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                >
                  <option value="bai_tap">📝 Bài tập</option>
                  <option value="luyen_tap">🎯 Luyện tập</option>
                  <option value="tinh_huong">🧠 Tình huống</option>
                  <option value="van_dung">🌱 Vận dụng</option>
                  <option value="phieu_cung_co">📋 Phiếu củng cố</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Mô tả nhiệm vụ
                </label>
                <textarea
                  rows={2}
                  placeholder="Yêu cầu học sinh đọc kỹ tình huống..."
                  value={assignFormData.description}
                  onChange={(e) =>
                    setAssignFormData({ ...assignFormData, description: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-normal"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1">
                  Chế độ cho học sinh xem lại sau nộp
                </label>
                <select
                  value={assignFormData.reviewMode}
                  onChange={(e) =>
                    setAssignFormData({ ...assignFormData, reviewMode: e.target.value as ReviewMode })
                  }
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-semibold cursor-pointer"
                >
                  <option value="NO_REVIEW">🔒 Không cho xem bài chi tiết (Mặc định)</option>
                  <option value="SCORE_ONLY">⭐ Chỉ xem điểm số</option>
                  <option value="QUESTIONS_NO_ANSWER">📝 Xem bài nhưng ẩn đáp án đúng</option>
                  <option value="FULL_REVIEW">🔓 Cho phép xem đầy đủ</option>
                </select>
              </div>

              {/* ⏰ CÀI ĐẶT THỜI GIAN & KHÓA BÀI TẬP */}
              <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-purple-900 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-purple-600" />
                    <span>Cài đặt Khóa & Hẹn giờ mở bài</span>
                  </span>
                  <label className="inline-flex items-center gap-1.5 text-xs font-bold text-rose-700 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={!!assignFormData.isLocked}
                      onChange={(e) => setAssignFormData({ ...assignFormData, isLocked: e.target.checked })}
                      className="w-4 h-4 rounded text-rose-600 focus:ring-rose-500 cursor-pointer"
                    />
                    <span>🔒 Khóa bài ngay</span>
                  </label>
                </div>

                <label className="flex items-center gap-2 text-xs font-bold text-slate-800 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={!!assignFormData.timeLimitEnabled}
                    onChange={(e) => setAssignFormData({ ...assignFormData, timeLimitEnabled: e.target.checked })}
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>⏰ Bật mở bài tập theo khung thời gian (Hẹn giờ)</span>
                </label>

                {assignFormData.timeLimitEnabled && (
                  <div className="space-y-2 pt-1 border-t border-purple-200/50">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Giờ bắt đầu mở bài
                        </label>
                        <input
                          type="datetime-local"
                          value={assignFormData.openTime || ''}
                          onChange={(e) => setAssignFormData({ ...assignFormData, openTime: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[11px] font-bold text-slate-600 block mb-1">
                          Giờ kết thúc / Khóa bài
                        </label>
                        <input
                          type="datetime-local"
                          value={assignFormData.closeTime || ''}
                          onChange={(e) => setAssignFormData({ ...assignFormData, closeTime: e.target.value })}
                          className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-slate-600 block mb-1">
                        Ghi chú thời gian (hiển thị cho học sinh)
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Làm bài trong tiết học thứ 3 Thứ Sáu"
                        value={assignFormData.scheduleNote || ''}
                        onChange={(e) => setAssignFormData({ ...assignFormData, scheduleNote: e.target.value })}
                        className="w-full px-2.5 py-1.5 rounded-xl border border-slate-200 text-xs font-normal"
                      />
                    </div>
                  </div>
                )}
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddAssignModal(false);
                    setShowEditAssignModal(false);
                  }}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-xs font-bold text-white shadow-md shadow-purple-200"
                >
                  Lưu nhiệm vụ
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* SMART UPLOADER MODAL (DÁN VÀ TỰ PHÂN LOẠI THEO BÀI) */}
      <SmartAssignmentUploaderModal
        isOpen={showSmartUploader}
        onClose={() => setShowSmartUploader(false)}
        lessons={lessons}
        selectedLessonId={uploaderLessonId}
        targetAssignmentId={uploaderAssignmentId}
        onImportSuccess={(count) => {
          showNotification(`Đã tải lên và chuẩn hóa thành công ${count} câu hỏi!`);
        }}
        onCreateAssignmentAndImport={handleCreateAssignmentAndImport}
        onImportToExisting={handleImportToExisting}
      />

      {/* MODAL: PREVIEW ASSIGNMENT QUESTIONS */}
      {previewAssignment && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-purple-100 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">
                  👁️ XEM TRƯỚC NHIỆM VỤ
                </span>
                <h3 className="text-lg font-extrabold text-slate-900">
                  {previewAssignment.assignment.title}
                </h3>
                <p className="text-xs text-slate-500">
                  Mã: {previewAssignment.assignment.code} • {previewAssignment.questions.length} câu hỏi • {previewAssignment.assignment.durationMinutes} phút
                </p>
              </div>
              <button
                onClick={() => setPreviewAssignment(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 hover:bg-slate-200 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            <div className="space-y-4">
              {previewAssignment.questions.map((q, i) => (
                <div key={q.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold">
                    <span className="text-purple-700">Câu {i + 1} ({q.points} điểm)</span>
                    <span className="text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                      Đáp án đúng: {q.correctOption}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{q.content}</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs pt-1">
                    {q.options.map((opt) => (
                      <div
                        key={opt.key}
                        className={`p-2.5 rounded-xl border flex items-start gap-2 ${
                          opt.key === q.correctOption
                            ? 'bg-emerald-50 border-emerald-300 font-semibold text-emerald-900'
                            : 'bg-white border-slate-200 text-slate-700'
                        }`}
                      >
                        <span className="font-bold">{opt.key}.</span>
                        <span>{opt.text}</span>
                      </div>
                    ))}
                  </div>
                  {q.explanation && (
                    <div className="p-2.5 bg-purple-50/70 rounded-xl text-xs text-purple-800 border border-purple-100 mt-2">
                      💡 <strong>Giải thích:</strong> {q.explanation}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ⏰ MODAL: SCHEDULE ASSIGNMENT (HẸN GIỜ MỞ / KHÓA BÀI TẬP) */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-purple-200 max-h-[90vh] overflow-y-auto">
            <div className="border-b pb-3">
              <div className="flex items-center gap-2 text-amber-700 text-xs font-black uppercase tracking-wider">
                <Clock className="w-4 h-4 text-amber-600" />
                <span>CÀI ĐẶT THỜI GIAN MỞ / KHÓA BÀI TẬP</span>
              </div>
              <h3 className="text-lg font-black text-slate-900 mt-1">
                {scheduleTarget
                  ? `⏰ ${scheduleTarget.title}`
                  : `⏰ Hẹn giờ toàn bộ Bài ${selectedLesson?.number}: ${selectedLesson?.title}`}
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                {scheduleTarget
                  ? `Mã: ${scheduleTarget.code} • Đặt thời gian chính xác học sinh được phép làm bài`
                  : `Áp dụng khung giờ đồng bộ cho toàn bộ ${assignments.length} nhiệm vụ trong bài học này`}
              </p>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              {/* PHÍM CHỌN NHANH KHUNG GIỜ (QUICK PRESETS) */}
              <div>
                <label className="text-xs font-bold uppercase text-slate-700 block mb-1.5 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Chọn nhanh khung thời gian phổ biến:</span>
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const in45m = new Date(Date.now() + 45 * 60000);
                      setScheduleData({
                        ...scheduleData,
                        isLocked: false,
                        timeLimitEnabled: true,
                        openTime: toDatetimeLocal(now.toISOString()),
                        closeTime: toDatetimeLocal(in45m.toISOString()),
                        scheduleNote: 'Kiểm tra 45 phút trực tiếp trên lớp',
                      });
                    }}
                    className="p-2 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold border border-purple-200 transition text-left"
                  >
                    ⏱️ Mở 45 phút trên lớp
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const in90m = new Date(Date.now() + 90 * 60000);
                      setScheduleData({
                        ...scheduleData,
                        isLocked: false,
                        timeLimitEnabled: true,
                        openTime: toDatetimeLocal(now.toISOString()),
                        closeTime: toDatetimeLocal(in90m.toISOString()),
                        scheduleNote: 'Làm bài trong 90 phút',
                      });
                    }}
                    className="p-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-indigo-800 text-xs font-bold border border-indigo-200 transition text-left"
                  >
                    ⏱️ Mở 90 phút
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const endToday = new Date();
                      endToday.setHours(23, 59, 0, 0);
                      setScheduleData({
                        ...scheduleData,
                        isLocked: false,
                        timeLimitEnabled: true,
                        openTime: toDatetimeLocal(now.toISOString()),
                        closeTime: toDatetimeLocal(endToday.toISOString()),
                        scheduleNote: 'Hạn chót 23:59 hôm nay',
                      });
                    }}
                    className="p-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-blue-800 text-xs font-bold border border-blue-200 transition text-left"
                  >
                    🌙 Đến 23:59 hôm nay
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      const now = new Date();
                      const in7d = new Date(Date.now() + 7 * 86400000);
                      setScheduleData({
                        ...scheduleData,
                        isLocked: false,
                        timeLimitEnabled: true,
                        openTime: toDatetimeLocal(now.toISOString()),
                        closeTime: toDatetimeLocal(in7d.toISOString()),
                        scheduleNote: 'Hạn chót trong 7 ngày tới',
                      });
                    }}
                    className="p-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200 transition text-left"
                  >
                    📅 Mở trong 7 ngày
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScheduleData({
                        ...scheduleData,
                        isLocked: false,
                        timeLimitEnabled: false,
                        openTime: '',
                        closeTime: '',
                        scheduleNote: '',
                      });
                    }}
                    className="p-2 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold border border-teal-200 transition text-left"
                  >
                    🟢 Mở tự do (Vô thời hạn)
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setScheduleData({
                        ...scheduleData,
                        isLocked: true,
                      });
                    }}
                    className="p-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-800 text-xs font-bold border border-rose-200 transition text-left"
                  >
                    🔒 Khóa bài ngay lập tức
                  </button>
                </div>
              </div>

              {/* TÙY CHỌN KHÓA THỦ CÔNG */}
              <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-slate-800 block">
                    Trạng thái Khóa bài thủ công
                  </span>
                  <span className="text-[11px] text-slate-500">
                    Khi khóa, học sinh hoàn toàn không thể bấm bắt đầu làm bài
                  </span>
                </div>
                <button
                  type="button"
                  onClick={() => setScheduleData({ ...scheduleData, isLocked: !scheduleData.isLocked })}
                  className={`px-3 py-1.5 rounded-xl font-bold text-xs flex items-center gap-1.5 transition ${
                    scheduleData.isLocked
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-emerald-600 text-white shadow-sm'
                  }`}
                >
                  {scheduleData.isLocked ? (
                    <>
                      <Lock className="w-3.5 h-3.5" /> <span>ĐANG KHÓA</span>
                    </>
                  ) : (
                    <>
                      <Unlock className="w-3.5 h-3.5" /> <span>ĐANG MỞ</span>
                    </>
                  )}
                </button>
              </div>

              {/* HẸN GIỜ MỞ / KHÓA */}
              <div className="p-4 rounded-2xl bg-purple-50/70 border border-purple-200 space-y-3">
                <label className="flex items-center gap-2 text-xs font-bold text-slate-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleData.timeLimitEnabled}
                    onChange={(e) =>
                      setScheduleData({ ...scheduleData, timeLimitEnabled: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500 cursor-pointer"
                  />
                  <span>⏰ Kích hoạt chế độ mở / khóa bài tập theo mốc thời gian</span>
                </label>

                {scheduleData.timeLimitEnabled && (
                  <div className="space-y-3 pt-2 border-t border-purple-200/60">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          🟢 Thời gian bắt đầu mở bài
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduleData.openTime}
                          onChange={(e) =>
                            setScheduleData({ ...scheduleData, openTime: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Trước giờ này, học sinh vào sẽ thấy thông báo chờ mở
                        </span>
                      </div>

                      <div>
                        <label className="text-[11px] font-bold text-slate-700 block mb-1">
                          ⛔ Thời gian đóng / Khóa bài (Hạn chót)
                        </label>
                        <input
                          type="datetime-local"
                          value={scheduleData.closeTime}
                          onChange={(e) =>
                            setScheduleData({ ...scheduleData, closeTime: e.target.value })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-semibold focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                        />
                        <span className="text-[10px] text-slate-400 mt-0.5 block">
                          Sau giờ này, hệ thống tự động khóa và ngừng nhận bài
                        </span>
                      </div>
                    </div>

                    <div>
                      <label className="text-[11px] font-bold text-slate-700 block mb-1">
                        📌 Ghi chú thời gian dặn dò học sinh
                      </label>
                      <input
                        type="text"
                        placeholder="Ví dụ: Làm bài trong tiết học thứ 3 Thứ Sáu"
                        value={scheduleData.scheduleNote}
                        onChange={(e) =>
                          setScheduleData({ ...scheduleData, scheduleNote: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-slate-300 text-xs font-normal focus:border-purple-500 focus:ring-2 focus:ring-purple-200 outline-none"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* TÙY CHỌN ÁP DỤNG HÀNG LOẠT (NẾU ĐANG CHỌN 1 BÀI) */}
              {scheduleTarget && (
                <label className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-bold text-amber-900 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={scheduleData.applyToAllInLesson}
                    onChange={(e) =>
                      setScheduleData({ ...scheduleData, applyToAllInLesson: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500 cursor-pointer"
                  />
                  <span>Áp dụng khung thời gian này cho TẤT CẢ các nhiệm vụ trong Bài {selectedLesson?.number}</span>
                </label>
              )}

              <div className="flex gap-2 pt-2 border-t">
                <button
                  type="button"
                  onClick={() => setShowScheduleModal(false)}
                  className="flex-1 py-3 rounded-2xl border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-100 transition"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-xs font-extrabold text-white shadow-lg shadow-purple-200 transition"
                >
                  💾 Lưu cài đặt thời gian
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
