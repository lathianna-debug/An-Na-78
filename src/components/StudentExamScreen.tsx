import React, { useState, useEffect, useRef } from 'react';
import {
  Clock,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Save,
  AlertTriangle,
  Send,
  HelpCircle,
} from 'lucide-react';
import { ClientQuestion } from '../types.ts';
import { api } from '../lib/api.ts';

interface StudentExamScreenProps {
  sessionData: {
    submissionId: string;
    token: string;
    serverTime: string;
    serverDueTime: string;
    durationMinutes: number;
    questions: ClientQuestion[];
    savedAnswers: Record<string, string>;
    student: { id: string; name: string; class: string };
    assignment: { id: string; title: string; code: string; lessonNumber: number; lessonTitle: string };
  };
  onCompleted: (result: any) => void;
}

export const StudentExamScreen: React.FC<StudentExamScreenProps> = ({ sessionData, onCompleted }) => {
  const { submissionId, token, serverDueTime, questions, savedAnswers, student, assignment } = sessionData;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>(savedAnswers || {});
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const [saveTimeout, setSaveTimeoutState] = useState<any>(null);

  // Time tracking
  const dueTimestamp = new Date(serverDueTime).getTime();
  const [timeLeftSeconds, setTimeLeftSeconds] = useState<number>(() => {
    return Math.max(0, Math.floor((dueTimestamp - Date.now()) / 1000));
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const totalQ = questions?.length || 0;
  const currentQ = questions?.[currentIndex];
  const answeredCount = Object.keys(answers).length;

  // Timer countdown
  useEffect(() => {
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((dueTimestamp - Date.now()) / 1000));
      setTimeLeftSeconds(remaining);

      // Auto submit when time runs out
      if (remaining <= 0) {
        clearInterval(interval);
        handleAutoSubmitTimeout();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [dueTimestamp]);

  const handleAutoSubmitTimeout = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      const result = await api.submitMission({ submissionId, token });
      onCompleted({ ...result, student, assignment });
    } catch (err: any) {
      setErrorMessage('Thời gian làm bài đã hết. Bài thi đã tự động khóa trên máy chủ.');
      onCompleted({
        status: 'SUBMITTED_LOCKED',
        message: 'Hết giờ làm bài. Hệ thống đã khóa bài nộp.',
        student,
        assignment,
      });
    }
  };

  const handleSelectOption = async (optionKey: 'A' | 'B' | 'C' | 'D') => {
    const currentQ = questions[currentIndex];
    if (!currentQ) return;

    const newAnswers = { ...answers, [currentQ.id]: optionKey };
    setAnswers(newAnswers);

    // Keep session storage updated locally
    try {
      const stored = sessionStorage.getItem('htcdn_exam_session');
      if (stored) {
        const parsed = JSON.parse(stored);
        parsed.savedAnswers = newAnswers;
        sessionStorage.setItem('htcdn_exam_session', JSON.stringify(parsed));
      }
    } catch {}

    // Autosave trigger
    setSaveStatus('saving');
    try {
      const res = await api.autosaveAnswer({
        submissionId,
        questionId: currentQ.id,
        selectedOption: optionKey,
        token,
      });

      if (res.locked) {
        // Auto locked by server
        onCompleted({
          status: 'SUBMITTED_LOCKED',
          message: 'Thời gian đã hết. Bài thi đã được tự động khóa.',
        });
        return;
      }

      setSaveStatus('saved');
      if (saveTimeout) clearTimeout(saveTimeout);
      const t = setTimeout(() => setSaveStatus('idle'), 2000);
      setSaveTimeoutState(t);
    } catch (err: any) {
      console.error('Lỗi khi tự động lưu:', err);
      setSaveStatus('idle');
    }
  };

  // Keyboard navigation on Computer / Laptop (A, B, C, D, 1, 2, 3, 4, Arrows, Enter)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) {
        return;
      }

      if (showConfirmModal) {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleFinalSubmit();
        } else if (e.key === 'Escape') {
          e.preventDefault();
          setShowConfirmModal(false);
        }
        return;
      }

      const key = e.key.toUpperCase();
      if (key === 'A' || key === '1') {
        e.preventDefault();
        handleSelectOption('A');
      } else if (key === 'B' || key === '2') {
        e.preventDefault();
        handleSelectOption('B');
      } else if (key === 'C' || key === '3') {
        e.preventDefault();
        handleSelectOption('C');
      } else if (key === 'D' || key === '4') {
        e.preventDefault();
        handleSelectOption('D');
      } else if (e.key === 'ArrowRight' || e.key === 'PageDown') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' || e.key === 'PageUp') {
        e.preventDefault();
        setCurrentIndex((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, answers, showConfirmModal, totalQ]);

  const handleFinalSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmModal(false);
    try {
      const result = await api.submitMission({ submissionId, token });
      onCompleted({ ...result, student, assignment });
    } catch (err: any) {
      setErrorMessage(err.message || 'Lỗi khi nộp bài. Vui lòng thử lại.');
      setIsSubmitting(false);
    }
  };

  const progressPercent = totalQ > 0 ? Math.round(((currentIndex + 1) / totalQ) * 100) : 0;

  // Format time remaining
  const mins = Math.floor(timeLeftSeconds / 60);
  const secs = timeLeftSeconds % 60;
  const formattedTime = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  const isUrgent = timeLeftSeconds <= 120; // 2 minutes warning

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-between">
      {/* 🌟 Responsive Top Header (Mobile & Computer) */}
      <div className="sticky top-0 z-30 bg-white border-b-2 border-indigo-200/90 shadow-md shadow-indigo-100/50 px-3 sm:px-4 py-2.5">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0">
            <span className="text-xl sm:text-2xl drop-shadow-xs shrink-0">🌟</span>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs sm:text-sm font-black text-slate-900 tracking-tight truncate">
                  Hành trình Công dân nhí
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded-md bg-amber-100 text-amber-900 text-[10px] font-black border border-amber-300 shrink-0">
                  THCS TÂN HẢI
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-purple-700 font-bold truncate">
                {student.name} • Lớp {student.class}
              </p>
            </div>
          </div>

          {/* Quick Submit & Clock Timer */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              className="py-1.5 px-2.5 sm:px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-extrabold text-[11px] sm:text-xs flex items-center gap-1 shadow-sm active:scale-95 transition cursor-pointer"
              title="Nộp bài bất kỳ lúc nào"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Nộp bài ({answeredCount}/{totalQ})</span>
              <span className="sm:hidden">Nộp ({answeredCount}/{totalQ})</span>
            </button>

            <div
              className={`flex items-center gap-1 sm:gap-1.5 px-2.5 sm:px-3 py-1.5 rounded-2xl font-mono font-bold text-xs sm:text-base border transition ${
                isUrgent
                  ? 'bg-rose-50 border-rose-300 text-rose-600 animate-pulse'
                  : 'bg-indigo-50 border-indigo-200 text-indigo-700'
              }`}
            >
              <Clock className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isUrgent ? 'text-rose-500' : 'text-indigo-600'}`} />
              <span>{formattedTime}</span>
            </div>
          </div>
        </div>

        {/* CÂU & Thanh tiến trình */}
        <div className="max-w-2xl mx-auto mt-2">
          <div className="flex items-center justify-between text-xs font-bold mb-1">
            <div className="flex items-center gap-2">
              <span className="text-purple-700 uppercase tracking-wider">
                CÂU {currentIndex + 1}/{totalQ}
              </span>
              <span className="hidden md:inline text-[11px] text-slate-400 font-normal">
                (Phím 1-4 hoặc A-D • Mũi tên ← →)
              </span>
            </div>
            <div className="flex items-center gap-2">
              {/* 💾 Autosave Indicator */}
              {saveStatus === 'saved' && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md transition-all">
                  <Save className="w-3 h-3" /> Đã lưu
                </span>
              )}
              {saveStatus === 'saving' && (
                <span className="text-[11px] text-slate-400 font-medium animate-pulse">
                  Đang lưu...
                </span>
              )}
              <span className="text-slate-500">{progressPercent}%</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200/60">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-indigo-500 to-cyan-400 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main Single-Question Stage (Mobile-First & Desktop Friendly) */}
      <div className="max-w-2xl mx-auto w-full px-4 py-5 sm:py-6 flex-1 flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-4 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {currentQ ? (
          <div className="space-y-4">
            {/* Mission / Lesson Header Card */}
            <div className="bg-gradient-to-r from-purple-900 via-indigo-950 to-slate-900 rounded-2xl p-3.5 sm:p-4 text-white shadow-md border border-purple-800/50">
              <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] font-bold text-yellow-300 mb-1">
                <span>
                  {assignment.lessonNumber === 10 || (assignment.code && (assignment.code.toUpperCase().includes('B10') || assignment.code.toUpperCase().includes('STARTUP') || assignment.code.toUpperCase().includes('KINHDOANH')))
                    ? '🚀 THỬ THÁCH: “STARTUP 15 TUỔI – MỞ SHOP NHƯNG ĐỪNG VƯỢT VẠCH!”'
                    : assignment.lessonNumber === 9 || (assignment.code && (assignment.code.toUpperCase().includes('B9') || assignment.code.toUpperCase().includes('DIEUTRA') || assignment.code.toUpperCase().includes('PHAPLUAT')))
                    ? '🕵️ NHIỆM VỤ: “PHÒNG ĐIỀU TRA PHÁP LÍ 9A”'
                    : assignment.lessonNumber === 8 || (assignment.code && (assignment.code.toUpperCase().includes('B8') || assignment.code.toUpperCase().includes('SHOPPER') || assignment.code.toUpperCase().includes('TIEUDUNG')))
                    ? '🛒 THỬ THÁCH: “SMART SHOPPER – ĐỪNG ĐỂ CHIẾC VÍ QUYẾT ĐỊNH TRONG 3 GIÂY!”'
                    : assignment.lessonNumber === 7 || (assignment.code && (assignment.code.toUpperCase().includes('B7') || assignment.code.toUpperCase().includes('UPDATE') || assignment.code.toUpperCase().includes('THICHUNG')))
                    ? '🔄 THỬ THÁCH: “UPDATE BẢN THÂN 9.0”'
                    : assignment.lessonNumber === 6 || (assignment.code && (assignment.code.toUpperCase().includes('B6') || assignment.code.toUpperCase().includes('THOIGIAN') || assignment.code.toUpperCase().includes('CEO')))
                    ? '🚀 THỬ THÁCH: “CEO CỦA 24 GIỜ”'
                    : assignment.lessonNumber === 5 || (assignment.code && (assignment.code.toUpperCase().includes('B5') || assignment.code.toUpperCase().includes('HOABINH') || assignment.code.toUpperCase().includes('SUGIA')))
                    ? '🕊️ MẬT LỆNH: “SỨ GIẢ HOÀ BÌNH 15 TUỔI”'
                    : assignment.lessonNumber === 4 || (assignment.code && (assignment.code.toUpperCase().includes('B4') || assignment.code.toUpperCase().includes('THAMPHAN') || assignment.code.toUpperCase().includes('KHACHQUAN')))
                    ? '🕵️ THỬ THÁCH: “THẨM PHÁN 15 TUỔI”'
                    : assignment.lessonNumber === 3 || (assignment.code && (assignment.code.toUpperCase().includes('B3') || assignment.code.toUpperCase().includes('CONGDONG')))
                    ? '🎒 THỬ THÁCH: “EM CÓ VÀO CUỘC?”'
                    : assignment.lessonNumber === 2 || (assignment.code && assignment.code.toUpperCase().includes('B2'))
                    ? '💛 THỬ THÁCH: “TRÁI TIM RỘNG MỞ”'
                    : '🚀 THỬ THÁCH: “LA BÀN TUỔI 15”'}
                </span>
                <span className="bg-white/10 px-2 py-0.5 rounded-full text-purple-200">Mã: {assignment.code}</span>
              </div>
              <h1 className="text-xs sm:text-sm font-bold text-white line-clamp-1">
                {assignment.title}
              </h1>
              <p className="text-[10px] sm:text-[11px] text-purple-200/90 mt-0.5 italic font-medium">
                {assignment.lessonNumber === 10 || (assignment.code && (assignment.code.toUpperCase().includes('B10') || assignment.code.toUpperCase().includes('STARTUP') || assignment.code.toUpperCase().includes('KINHDOANH')))
                  ? '«Hiểu quyền → Nhận ra giới hạn → Hiểu nghĩa vụ → Biết hành động | Được quyền kinh doanh không có nghĩa là kinh doanh bất cứ thứ gì, bằng bất cứ cách nào»'
                  : assignment.lessonNumber === 9 || (assignment.code && (assignment.code.toUpperCase().includes('B9') || assignment.code.toUpperCase().includes('DIEUTRA') || assignment.code.toUpperCase().includes('PHAPLUAT')))
                  ? '«Nhận diện → Phân loại → Ghép hậu quả → Biết tuân thủ | Đừng phán đoán bằng cảm tính. Hãy tìm đúng dấu hiệu pháp lí»'
                  : assignment.lessonNumber === 8 || (assignment.code && (assignment.code.toUpperCase().includes('B8') || assignment.code.toUpperCase().includes('SHOPPER') || assignment.code.toUpperCase().includes('TIEUDUNG')))
                  ? '«Hành trình: Nhận ra → Kiểm tra → So sánh → Quyết định | Người tiêu dùng thông minh biết mình đang mua gì – vì sao mua – và mua như thế nào»'
                  : assignment.lessonNumber === 7 || (assignment.code && (assignment.code.toUpperCase().includes('B7') || assignment.code.toUpperCase().includes('UPDATE') || assignment.code.toUpperCase().includes('THICHUNG')))
                  ? '«Nhiệm vụ: Nhận ra → Bình tĩnh → Điều chỉnh → Tiếp tục tiến lên | Ta không phải lúc nào cũng đổi được hướng gió, nhưng có thể học cách điều chỉnh cánh buồm»'
                  : assignment.lessonNumber === 6 || (assignment.code && (assignment.code.toUpperCase().includes('B6') || assignment.code.toUpperCase().includes('THOIGIAN') || assignment.code.toUpperCase().includes('CEO')))
                  ? '«Mục tiêu: HIỂU → BIẾT ƯU TIÊN → BIẾT LẬP KẾ HOẠCH → BIẾT HÀNH ĐỘNG | Mỗi người đều có 24 giờ. Khác biệt nằm ở cách chúng ta sử dụng 24 giờ ấy»'
                  : assignment.lessonNumber === 5 || (assignment.code && (assignment.code.toUpperCase().includes('B5') || assignment.code.toUpperCase().includes('HOABINH') || assignment.code.toUpperCase().includes('SUGIA')))
                  ? '«Hành trình: HIỂU → NHẬN DIỆN → RA QUYẾT ĐỊNH → BIẾT HÀNH ĐỘNG | Hoà bình không chỉ là điều mong muốn, nó được tạo nên từ cách chúng ta ứng xử mỗi ngày»'
                  : assignment.lessonNumber === 4 || (assignment.code && (assignment.code.toUpperCase().includes('B4') || assignment.code.toUpperCase().includes('THAMPHAN') || assignment.code.toUpperCase().includes('KHACHQUAN')))
                  ? '«Hiểu đúng → Nhận ra → Biết quyết định → Biết ứng xử | Luật duy nhất: Đừng chọn theo cảm tính, hãy chọn theo dữ kiện»'
                  : assignment.lessonNumber === 3 || (assignment.code && (assignment.code.toUpperCase().includes('B3') || assignment.code.toUpperCase().includes('CONGDONG')))
                  ? '«Một người làm một việc nhỏ. Nhiều người cùng làm có thể tạo nên thay đổi lớn.»'
                  : assignment.lessonNumber === 2 || (assignment.code && assignment.code.toUpperCase().includes('B2'))
                  ? '«Hiểu đúng → Nhận ra → Biết xử lí → Biết sống khoan dung»'
                  : '«Mỗi lựa chọn hôm nay là một bước tạo nên con người em ngày mai»'}
              </p>
            </div>

            {/* Question Card */}
            <div className="bg-white rounded-3xl p-5 sm:p-7 shadow-lg shadow-purple-50 border border-purple-100/80">
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="px-3 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-700">
                  Câu hỏi {currentIndex + 1} / {totalQ}
                </span>
                <span className="text-xs text-slate-400 font-medium">
                  {currentQ.points} điểm
                </span>
              </div>
              <div className="text-base sm:text-lg font-bold text-slate-800 leading-relaxed whitespace-pre-line">
                {currentQ.content}
              </div>
            </div>

            {/* Answer Options: Large Tactile Cards */}
            <div className="space-y-3">
              {currentQ.options.map((opt) => {
                const isSelected = answers[currentQ.id] === opt.key;
                return (
                  <button
                    type="button"
                    key={opt.key}
                    onClick={() => handleSelectOption(opt.key)}
                    className={`w-full text-left p-4 sm:p-5 rounded-2xl border-2 transition-all flex items-start gap-3 sm:gap-4 select-none cursor-pointer touch-manipulation active:scale-[0.99] ${
                      isSelected
                        ? 'bg-purple-50/80 border-purple-600 shadow-md shadow-purple-100 ring-4 ring-purple-100 text-slate-900'
                        : 'bg-white border-slate-200 hover:border-purple-300 hover:bg-slate-50/60 text-slate-700 shadow-sm'
                    }`}
                  >
                    {/* Option letter badge */}
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-xl font-bold flex items-center justify-center shrink-0 text-sm sm:text-base transition ${
                        isSelected
                          ? 'bg-purple-600 text-white shadow-sm'
                          : 'bg-slate-100 text-slate-700'
                      }`}
                    >
                      {opt.key}
                    </div>

                    <div className="flex-1 text-sm sm:text-base font-medium pt-1 sm:pt-1.5 leading-relaxed">
                      {opt.text}
                    </div>

                    {/* Desktop Key Hint */}
                    <span className="hidden sm:inline-block text-[11px] text-slate-400 font-normal shrink-0 pt-1">
                      (Phím {opt.key})
                    </span>

                    {isSelected && (
                      <CheckCircle2 className="w-5 h-5 sm:w-6 sm:h-6 text-purple-600 shrink-0 mt-1 animate-in zoom-in-50 duration-200" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-slate-500">Đang tải câu hỏi...</p>
          </div>
        )}

        {/* Question Jumper Grid */}
        <div className="mt-6 pt-4 border-t border-slate-200/80">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 mb-2">
            <span>Danh sách câu hỏi:</span>
            <span>{answeredCount}/{totalQ} đã làm</span>
          </div>
          <div className="flex flex-wrap gap-1.5 justify-center">
            {questions.map((q, idx) => {
              const isAnswered = !!answers[q.id];
              const isCurrent = idx === currentIndex;
              return (
                <button
                  key={q.id}
                  onClick={() => setCurrentIndex(idx)}
                  className={`w-9 h-9 sm:w-8 sm:h-8 rounded-xl font-bold text-xs transition cursor-pointer select-none touch-manipulation ${
                    isCurrent
                      ? 'bg-purple-600 text-white ring-2 ring-purple-300 shadow-sm'
                      : isAnswered
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 📱 Bottom Navigation Bar (Responsive max-w-2xl) */}
      <div className="sticky bottom-0 bg-white/95 backdrop-blur-md border-t border-slate-200 px-4 py-3 shadow-lg">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-3">
          <button
            onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
            disabled={currentIndex === 0}
            className="flex-1 py-3 px-3 rounded-2xl border border-slate-200 bg-white font-bold text-slate-700 text-xs sm:text-sm flex items-center justify-center gap-1.5 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-slate-50 transition active:scale-95"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>← CÂU TRƯỚC</span>
          </button>

          {currentIndex < totalQ - 1 ? (
            <button
              onClick={() => setCurrentIndex((prev) => Math.min(totalQ - 1, prev + 1))}
              className="flex-1 py-3 px-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-1.5 transition active:scale-95 shadow-md shadow-indigo-200"
            >
              <span>CÂU TIẾP →</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={() => setShowConfirmModal(true)}
              className="flex-1 py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-extrabold text-xs sm:text-sm flex items-center justify-center gap-1.5 shadow-md shadow-emerald-200 transition active:scale-95"
            >
              <Send className="w-4 h-4" />
              <span>✅ NỘP BÀI</span>
            </button>
          )}
        </div>
      </div>

      {/* Confirmation Modal Before Locking & Submitting */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-purple-100 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 mx-auto flex items-center justify-center text-2xl shadow-inner">
              🎯
            </div>
            <div>
              <h4 className="text-lg font-extrabold text-slate-900">
                XÁC NHẬN NỘP BÀI?
              </h4>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Em đã trả lời <strong className="text-purple-700">{answeredCount}/{totalQ}</strong> câu hỏi.
              </p>
            </div>

            <div className="p-3 bg-amber-50 rounded-2xl border border-amber-200 text-left text-xs text-amber-800 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <span>
                <strong>Lưu ý bảo mật:</strong> Sau khi nộp, bài thi sẽ được <strong>KHÓA NGAY</strong> trên hệ thống và chỉ Cô An Na có quyền xem chi tiết.
              </span>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl border border-slate-200 font-bold text-xs text-slate-600 hover:bg-slate-100 transition"
              >
                Làm tiếp
              </button>
              <button
                type="button"
                onClick={handleFinalSubmit}
                disabled={isSubmitting}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 font-extrabold text-xs text-white shadow-md shadow-purple-200 hover:from-purple-700 hover:to-indigo-700 transition"
              >
                {isSubmitting ? 'Đang nộp...' : 'Nộp bài ngay'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
