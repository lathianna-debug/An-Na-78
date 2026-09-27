import React, { useEffect, useState } from 'react';
import confetti from 'canvas-confetti';
import { Star, Clock, Calendar, Lock, CheckCircle, Home, Sparkles, Award, ShieldCheck } from 'lucide-react';
import { api } from '../lib/api.ts';

interface CompletionScreenProps {
  result: {
    status: 'SUBMITTED_LOCKED';
    score?: number;
    maxScore?: number;
    correctCount?: number;
    totalQuestions?: number;
    totalTimeSeconds?: number;
    submittedAt?: string;
    message?: string;
    showScore?: boolean;
    showTime?: boolean;
    student?: { id: string; name: string; class: string };
    assignment?: { id: string; title: string; code: string; lessonNumber?: number; lessonTitle?: string };
  };
  onGoHome: () => void;
}

export const CompletionScreen: React.FC<CompletionScreenProps> = ({ result, onGoHome }) => {
  const [scorecard, setScorecard] = useState<{
    lessonScores: Record<number, number | null>;
    avgScore: number;
    submissionsCount: number;
  } | null>(null);

  useEffect(() => {
    // Confetti burst for 2.5 seconds
    try {
      const end = Date.now() + 2500;
      const colors = ['#8B5CF6', '#3B82F6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899'];

      const frame = () => {
        confetti({
          particleCount: 4,
          angle: 60,
          spread: 55,
          origin: { x: 0, y: 0.7 },
          colors,
        });
        confetti({
          particleCount: 4,
          angle: 120,
          spread: 55,
          origin: { x: 1, y: 0.7 },
          colors,
        });

        if (Date.now() < end) {
          requestAnimationFrame(frame);
        }
      };
      frame();
    } catch (e) {
      console.error(e);
    }
  }, []);

  // Fetch updated student scorecard to show scores across columns
  useEffect(() => {
    if (result.student) {
      api
        .getStudentScorecard({
          studentId: result.student.id,
          studentName: result.student.name,
          studentClass: result.student.class,
        })
        .then((data) => {
          if (data && data.lessonScores) {
            setScorecard({
              lessonScores: data.lessonScores,
              avgScore: data.student.avgScore,
              submissionsCount: data.student.submissionsCount,
            });
          }
        })
        .catch(() => {});
    }
  }, [result]);

  const mins = result.totalTimeSeconds ? Math.floor(result.totalTimeSeconds / 60) : 0;
  const secs = result.totalTimeSeconds ? result.totalTimeSeconds % 60 : 0;
  const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

  const completionDate = result.submittedAt
    ? new Date(result.submittedAt).toLocaleDateString('vi-VN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : new Date().toLocaleDateString('vi-VN');

  const currentLessonNum = result.assignment?.lessonNumber || 1;

  return (
    <div className="max-w-2xl mx-auto px-4 py-8 sm:py-12">
      <div className="bg-white rounded-3xl p-6 sm:p-10 shadow-2xl shadow-purple-100/70 border-2 border-indigo-200 text-center space-y-6 relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-48 h-48 bg-gradient-to-b from-purple-200 to-transparent rounded-full blur-3xl pointer-events-none" />

        {/* 🌟 Sparkling Icon Mascot Badge */}
        <div className="relative inline-block">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-400 to-pink-500 mx-auto flex items-center justify-center text-4xl sm:text-5xl shadow-lg shadow-orange-200 animate-bounce">
            🌟
          </div>
          <span className="absolute -bottom-1 -right-1 p-1.5 bg-emerald-500 rounded-full text-white shadow-md">
            <CheckCircle className="w-4 h-4" />
          </span>
        </div>

        {/* Title & Congratulations */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-2">
            <Sparkles className="w-3.5 h-3.5 text-purple-600" />
            <span>TRƯỜNG THCS TÂN HẢI • MÔN GDCD 9</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 leading-tight">
            🎉 XUẤT SẮC HOÀN THÀNH BÀI LÀM!
          </h1>
          {result.student && (
            <p className="text-sm sm:text-base font-bold text-purple-800 mt-1">
              Học sinh: <span className="font-extrabold text-indigo-950">{result.student.name}</span> — Lớp <span className="font-extrabold text-indigo-950">{result.student.class}</span>
            </p>
          )}
          {result.assignment && (
            <p className="text-xs text-slate-500 font-medium mt-0.5">
              {result.assignment.title}
            </p>
          )}
        </div>

        {/* Metrics Cards */}
        <div className="grid grid-cols-2 gap-3 sm:gap-4 text-left">
          {/* ⭐ Điểm số */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-indigo-50/50 border border-purple-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-purple-700 mb-1">
              <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
              <span>Điểm số bài này</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900">
              {typeof result.score === 'number' ? (
                <span>
                  {result.score.toString().replace('.', ',')}
                  <span className="text-sm font-semibold text-slate-400">/{result.maxScore || 10}</span>
                </span>
              ) : (
                <span className="text-base text-slate-500">Đã ghi nhận</span>
              )}
            </div>
            {result.correctCount !== undefined && result.totalQuestions !== undefined && (
              <p className="text-[11px] text-emerald-700 font-semibold mt-0.5">
                ✓ Đúng {result.correctCount}/{result.totalQuestions} câu hỏi
              </p>
            )}
          </div>

          {/* ⏰ Thời gian */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-50 to-cyan-50/50 border border-blue-200 shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-blue-700 mb-1">
              <Clock className="w-4 h-4 text-blue-500" />
              <span>Thời gian hoàn thành</span>
            </div>
            <div className="text-2xl sm:text-3xl font-black text-slate-900 font-mono">
              {formattedDuration}
            </div>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Đúng thời gian quy định
            </p>
          </div>
        </div>

        {/* 📊 BẢNG ĐIỂM CÁC CỘT TƯƠNG ỨNG CỦA EM (BÀI 1 ĐẾN BÀI 10) */}
        <div className="p-4 sm:p-5 rounded-3xl bg-slate-50 border-2 border-indigo-100/90 text-left space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-purple-600" />
              <h3 className="text-xs sm:text-sm font-extrabold text-slate-900">
                CỘT ĐIỂM TƯƠNG ỨNG CÁC BÀI CỦA EM (BÀI 1 → 10)
              </h3>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-300">
              Đã ghi điểm
            </span>
          </div>

          <p className="text-[11px] text-slate-500">
            Điểm số của em đã tự động lưu vào cột tương ứng và đồng bộ lên bảng điểm của Cô An Na:
          </p>

          <div className="overflow-x-auto pb-1">
            <div className="grid grid-cols-10 gap-1.5 min-w-[500px]">
              {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((num) => {
                let cellScore = scorecard?.lessonScores?.[num];
                // Fallback to current score if this is the current lesson
                if ((cellScore === null || cellScore === undefined) && num === currentLessonNum && typeof result.score === 'number') {
                  cellScore = result.score;
                }
                const isCurrent = num === currentLessonNum;

                return (
                  <div
                    key={num}
                    className={`p-2 rounded-xl text-center border transition ${
                      isCurrent
                        ? 'bg-purple-600 text-white border-purple-700 shadow-md ring-2 ring-purple-300'
                        : cellScore !== null && cellScore !== undefined
                        ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}
                  >
                    <div className={`text-[10px] font-black uppercase ${isCurrent ? 'text-amber-200' : 'text-slate-500'}`}>
                      Bài {num}
                    </div>
                    <div className="text-sm font-black mt-0.5">
                      {cellScore !== null && cellScore !== undefined
                        ? cellScore.toString().replace('.', ',')
                        : '—'}
                    </div>
                    {isCurrent && (
                      <div className="text-[9px] font-bold text-amber-200 mt-0.5">Vừa nộp</div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* 🔐 THÔNG BÁO BẢO MẬT & KHÓA DỮ LIỆU */}
        <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 text-left space-y-2">
          <div className="flex items-center gap-2 text-purple-900 font-bold text-xs sm:text-sm">
            <ShieldCheck className="w-5 h-5 text-purple-700 shrink-0" />
            <span>BẢO MẬT & KHÓA DỮ LIỆU BÀI THI</span>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed font-medium">
            🔒 <strong className="text-slate-800">Bài làm đã được khóa an toàn.</strong> Ngoài Cô An Na ra, không bất kỳ ai có thể thay đổi hoặc xem bài làm chi tiết của bạn khác.
            Mỗi học sinh chỉ làm và xem điểm số của chính mình.
          </p>
        </div>

        {/* Home Button */}
        <button
          onClick={onGoHome}
          className="w-full py-3.5 px-6 rounded-2xl font-black text-sm sm:text-base text-white bg-gradient-to-r from-purple-700 to-indigo-700 hover:from-purple-800 hover:to-indigo-800 shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2 cursor-pointer active:scale-95"
        >
          <Home className="w-4 h-4" />
          <span>Về trang chủ</span>
        </button>
      </div>
    </div>
  );
};
