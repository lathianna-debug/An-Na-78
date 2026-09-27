import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  HelpCircle,
  BarChart3,
  CheckCircle2,
  XCircle,
  Users,
  School,
  Sparkles,
} from 'lucide-react';
import { QuestionMistakeStat } from '../types.ts';
import { api } from '../lib/api.ts';

export const MistakesAnalyticsView: React.FC = () => {
  const [mistakes, setMistakes] = useState<QuestionMistakeStat[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionMistakeStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api
      .getMistakeStats()
      .then((res) => {
        setMistakes(res.mistakes);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
          <span>⚠️</span>
          <span>PHÂN TÍCH “CÂU HỌC SINH SAI NHIỀU”</span>
        </h2>
        <p className="text-xs sm:text-sm text-slate-500 font-medium">
          Hỗ trợ cô giáo phát hiện ngay lỗ hổng kiến thức hoặc bẫy tư duy để củng cố kịp thời trên lớp.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-slate-400">
          <div className="w-8 h-8 border-3 border-purple-500 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Đang tổng hợp dữ liệu sư phạm...</p>
        </div>
      ) : mistakes.length === 0 ? (
        <div className="bg-white rounded-3xl p-10 text-center border border-slate-200/80 space-y-3">
          <div className="text-3xl">🎉</div>
          <h4 className="text-base font-bold text-slate-800">
            Chưa phát hiện câu hỏi nào có tỷ lệ sai vượt mức!
          </h4>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Học sinh hiện đang làm bài rất tốt hoặc chưa có đủ lượt nộp bài để hình thành mẫu thống kê.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {mistakes.map((item) => {
            const isHighRisk = item.mistakeRate >= 50;

            return (
              <div
                key={item.questionId}
                onClick={() => setSelectedQuestion(item)}
                className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm hover:shadow-md hover:border-purple-300 transition cursor-pointer flex flex-col justify-between space-y-3 group"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-xs font-bold text-purple-700 bg-purple-50 px-2.5 py-0.5 rounded-full border border-purple-100">
                      {item.assignmentTitle}
                    </span>

                    <span
                      className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold border ${
                        isHighRisk
                          ? 'bg-rose-50 text-rose-700 border-rose-200 animate-pulse'
                          : 'bg-amber-50 text-amber-700 border-amber-200'
                      }`}
                    >
                      ⚠️ {item.mistakeRate}% sai
                    </span>
                  </div>

                  <h4 className="text-sm sm:text-base font-bold text-slate-900 group-hover:text-purple-700 transition line-clamp-2">
                    {item.content}
                  </h4>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span className="flex items-center gap-1">
                    <Users className="w-3.5 h-3.5" />
                    <strong>{item.totalAnswered}</strong> em đã làm
                  </span>
                  <span className="text-purple-600 font-bold group-hover:underline flex items-center gap-1">
                    <span>Xem phân tích A/B/C/D</span> →
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* 📊 MODAL PHÂN TÍCH CHI TIẾT */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full p-6 space-y-5 shadow-2xl border border-purple-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b pb-3">
              <div>
                <span className="text-xs font-bold text-purple-700 uppercase">
                  BÁO CÁO PHÂN TÍCH SƯ PHẠM
                </span>
                <h3 className="text-lg font-extrabold text-slate-900 mt-0.5">
                  {selectedQuestion.content}
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  Bài tập: <strong>{selectedQuestion.assignmentTitle}</strong> (Bài {selectedQuestion.lessonNumber})
                </p>
              </div>

              <button
                onClick={() => setSelectedQuestion(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-600 text-xs font-bold"
              >
                Đóng
              </button>
            </div>

            {/* Metrics cards */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                <span className="text-[11px] font-bold uppercase text-slate-500 block">Tổng số làm</span>
                <span className="text-2xl font-black text-slate-800">{selectedQuestion.totalAnswered}</span>
              </div>
              <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
                <span className="text-[11px] font-bold uppercase text-emerald-700 block">Tỉ lệ đúng</span>
                <span className="text-2xl font-black text-emerald-900">
                  {100 - selectedQuestion.mistakeRate}%
                </span>
              </div>
              <div className="p-3 bg-rose-50 rounded-2xl border border-rose-100">
                <span className="text-[11px] font-bold uppercase text-rose-700 block">Tỉ lệ sai</span>
                <span className="text-2xl font-black text-rose-900">{selectedQuestion.mistakeRate}%</span>
              </div>
            </div>

            {/* Biểu đồ chọn các đáp án A / B / C / D */}
            <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200/80">
              <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <BarChart3 className="w-4 h-4 text-purple-600" />
                <span>BIỂU ĐỒ PHÂN BỐ LỰA CHỌN (A / B / C / D)</span>
              </h4>

              <div className="space-y-2 text-xs">
                {(['A', 'B', 'C', 'D'] as const).map((optKey) => {
                  const isCorrect = selectedQuestion.correctOption === optKey;
                  const count = selectedQuestion.optionsDistribution[optKey] || 0;
                  const total = selectedQuestion.totalAnswered || 1;
                  const pct = Math.round((count / total) * 100);

                  return (
                    <div key={optKey} className="space-y-1">
                      <div className="flex items-center justify-between font-semibold">
                        <span className="flex items-center gap-1.5">
                          <strong className={isCorrect ? 'text-emerald-700' : 'text-slate-700'}>
                            Đáp án {optKey}
                          </strong>
                          {isCorrect && (
                            <span className="text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.2 rounded font-bold">
                              Đáp án chuẩn
                            </span>
                          )}
                        </span>
                        <span className="text-slate-600 font-mono">
                          {count} lượt ({pct}% )
                        </span>
                      </div>

                      {/* Bar visual */}
                      <div className="w-full h-3 bg-white rounded-full overflow-hidden border border-slate-200 p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            isCorrect ? 'bg-emerald-500' : pct > 30 ? 'bg-rose-400' : 'bg-slate-400'
                          }`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Lớp nào sai nhiều nhất */}
            <div className="space-y-2">
              <h4 className="text-xs font-bold uppercase text-slate-700 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                <span>PHÂN BỐ LỖI THEO LỚP HỌC</span>
              </h4>

              <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-center text-xs">
                {['9A8', '9A9', '9A10', '9A11', '9A12'].map((cls) => {
                  const wrongCount = (selectedQuestion.classMistakes as any)[cls] || 0;

                  return (
                    <div
                      key={cls}
                      className={`p-3 rounded-2xl border ${
                        wrongCount > 2
                          ? 'bg-rose-50 border-rose-200 text-rose-900 font-bold'
                          : 'bg-white border-slate-200 text-slate-700'
                      }`}
                    >
                      <span className="block text-[11px] text-slate-500 font-bold">Lớp {cls}</span>
                      <span className="text-lg font-black block mt-0.5">{wrongCount}</span>
                      <span className="text-[10px] text-slate-400">em làm sai</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
