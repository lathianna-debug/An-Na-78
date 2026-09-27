import React, { useState, useMemo } from 'react';
import {
  Upload,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  FileText,
  HelpCircle,
  Clock,
  Layers,
  Check,
  Eye,
  Edit3,
  X,
  BookOpen,
} from 'lucide-react';
import { parseAssignmentContent, ParsedQuestion, ParseResult } from '../lib/questionParser.ts';
import { AssignmentType, Lesson } from '../types.ts';
import { KET_NOI_TRI_THUC_GDCD9_LESSONS } from '../lib/ketNoiLessons.ts';

interface SmartAssignmentUploaderModalProps {
  isOpen: boolean;
  onClose: () => void;
  lessons: Lesson[];
  selectedLessonId?: string;
  targetAssignmentId?: string;
  onImportSuccess: (count: number) => void;
  onCreateAssignmentAndImport: (assignmentData: any, questions: ParsedQuestion[]) => Promise<void>;
  onImportToExisting: (assignmentId: string, questions: ParsedQuestion[]) => Promise<void>;
}

export const SmartAssignmentUploaderModal: React.FC<SmartAssignmentUploaderModalProps> = ({
  isOpen,
  onClose,
  lessons,
  selectedLessonId,
  targetAssignmentId,
  onImportSuccess,
  onCreateAssignmentAndImport,
  onImportToExisting,
}) => {
  const [activeStep, setActiveStep] = useState<'paste' | 'preview'>('paste');
  const [rawPastedText, setRawPastedText] = useState('');
  const [selectedLesson, setSelectedLesson] = useState<string>(selectedLessonId || (lessons[0]?.id ?? ''));

  // Assignment metadata
  const currentLessonObj = useMemo(() => {
    return lessons.find((l) => l.id === selectedLesson) || lessons[0];
  }, [lessons, selectedLesson]);

  const ketNoiPreset = useMemo(() => {
    if (!currentLessonObj) return null;
    return KET_NOI_TRI_THUC_GDCD9_LESSONS.find((k) => k.number === currentLessonObj.number);
  }, [currentLessonObj]);

  const [assignmentTitle, setAssignmentTitle] = useState('');
  const [assignmentCode, setAssignmentCode] = useState('');
  const [assignmentType, setAssignmentType] = useState<AssignmentType>('bai_tap');
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [description, setDescription] = useState('');

  // Parsed result
  const [parsedData, setParsedData] = useState<ParseResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [editingQuestionIndex, setEditingQuestionIndex] = useState<number | null>(null);

  // Sync default code when lesson changes if not existing assignment
  React.useEffect(() => {
    if (selectedLessonId) {
      setSelectedLesson(selectedLessonId);
    }
  }, [selectedLessonId]);

  React.useEffect(() => {
    if (currentLessonObj && !targetAssignmentId) {
      const num = currentLessonObj.number;
      setAssignmentCode(`GDCD9-B${num}`);
      setAssignmentTitle(`Phiếu bài tập Bài ${num}: ${currentLessonObj.title}`);
    }
  }, [currentLessonObj, targetAssignmentId]);

  if (!isOpen) return null;

  // Example template loader
  const handleInsertSample = () => {
    const sample = `Bài tập củng cố Giáo dục công dân 9 - Kết nối tri thức
Bài ${currentLessonObj?.number || 1}: ${currentLessonObj?.title || 'Sống có lí tưởng'}

Câu 1: Lí tưởng sống của thanh niên Việt Nam hiện nay là gì?
A. Phấn đấu làm giàu cho bản thân bằng mọi giá
B. Phấn đấu xây dựng đất nước Việt Nam độc lập, dân giàu, nước mạnh, dân chủ, công bằng, văn minh
C. Chỉ quan tâm đến việc học và sở thích cá nhân
D. Đi du học và định cư ở nước ngoài
Đáp án: B
Giải thích: Thanh niên thời đại mới xác định lí tưởng cống hiến vì sự phồn vinh của Tổ quốc.

Câu 2: Người sống có lí tưởng luôn thể hiện thái độ nào sau đây?
A. Trì hoãn công việc và ỷ lại vào người khác
B. Chủ động lập kế hoạch, nỗ lực học tập và rèn luyện đạo đức
C. Sống thụ động, an phận thủ thường
D. Không quan tâm đến các vấn đề xã hội
Đáp án: B
Giải thích: Người có lí tưởng sống luôn có kế hoạch rõ ràng và kiên trì rèn luyện.

Câu 3: Hành vi nào dưới đây THỂ HIỆN lối sống thiếu lí tưởng?
A. Tích cực tham gia hoạt động tình nguyện bảo vệ môi trường
B. Đam mê nghiên cứu khoa học kỹ thuật
C. Sa đà vào trò chơi điện tử bạo lực, bỏ bê học tập
D. Giúp đỡ các bạn có hoàn cảnh khó khăn
Đáp án: C
Giải thích: Sa đà vào tệ nạn, lười biếng là biểu hiện của lối sống thiếu lí tưởng.`;

    setRawPastedText(sample);
  };

  const handleParseContent = () => {
    if (!rawPastedText.trim()) return;
    const res = parseAssignmentContent(rawPastedText);
    setParsedData(res);
    if (res.titleCandidate && !assignmentTitle) {
      setAssignmentTitle(res.titleCandidate);
    }
    setActiveStep('preview');
  };

  const handleUpdateOptionCorrect = (qIndex: number, optKey: 'A' | 'B' | 'C' | 'D') => {
    if (!parsedData) return;
    const updatedQuestions = [...parsedData.questions];
    updatedQuestions[qIndex].correctOption = optKey;
    setParsedData({ ...parsedData, questions: updatedQuestions });
  };

  const handleUpdateQuestionContent = (qIndex: number, field: string, val: string) => {
    if (!parsedData) return;
    const updatedQuestions = [...parsedData.questions];
    (updatedQuestions[qIndex] as any)[field] = val;
    setParsedData({ ...parsedData, questions: updatedQuestions });
  };

  const handleUpdateOptionText = (qIndex: number, optKey: 'A' | 'B' | 'C' | 'D', text: string) => {
    if (!parsedData) return;
    const updatedQuestions = [...parsedData.questions];
    const opt = updatedQuestions[qIndex].options.find((o) => o.key === optKey);
    if (opt) opt.text = text;
    setParsedData({ ...parsedData, questions: updatedQuestions });
  };

  const handleConfirmUpload = async () => {
    if (!parsedData || parsedData.questions.length === 0) return;
    setIsProcessing(true);
    try {
      if (targetAssignmentId) {
        // Import into an existing assignment
        await onImportToExisting(targetAssignmentId, parsedData.questions);
      } else {
        // Create new assignment under chosen lesson + import
        const newAssign = {
          lessonId: selectedLesson,
          title: assignmentTitle.trim() || `Bài tập Bài ${currentLessonObj?.number}`,
          code: assignmentCode.trim().toUpperCase(),
          type: assignmentType,
          description: description.trim() || `Bộ câu hỏi trực tuyến gồm ${parsedData.questions.length} câu`,
          durationMinutes: Number(durationMinutes) || 15,
          reviewMode: 'NO_REVIEW',
        };
        await onCreateAssignmentAndImport(newAssign, parsedData.questions);
      }
      onImportSuccess(parsedData.questions.length);
      onClose();
    } catch (err: any) {
      alert(err.message || 'Lỗi khi tải bài tập lên.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-4xl w-full my-auto shadow-2xl border border-purple-100 flex flex-col max-h-[92vh] overflow-hidden">
        {/* MODAL HEADER */}
        <div className="px-6 py-4 bg-gradient-to-r from-purple-700 via-indigo-600 to-cyan-600 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-xl shadow-inner">
              ✨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-white/20 text-white">
                  Công Cụ Nạp Bài Tập Thông Minh
                </span>
                <span className="text-xs text-purple-200">GDCD 9 Kết Nối Tri Thức</span>
              </div>
              <h2 className="text-lg font-black tracking-tight text-white mt-0.5">
                {targetAssignmentId
                  ? 'Nạp Thêm Câu Hỏi Vào Nhiệm Vụ'
                  : 'Dán & Tự Động Phân Loại Bài Tập Theo Bài Học'}
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP PROGRESS INDICATOR */}
        <div className="bg-purple-50/80 px-6 py-2.5 border-b border-purple-100 flex items-center justify-between text-xs">
          <div className="flex items-center gap-6">
            <button
              onClick={() => setActiveStep('paste')}
              className={`flex items-center gap-2 font-bold transition ${
                activeStep === 'paste' ? 'text-purple-700' : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep === 'paste' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                1
              </span>
              <span>Dán Nội Dung Bài Tập</span>
            </button>

            <span className="text-slate-300">→</span>

            <button
              disabled={!parsedData}
              onClick={() => setActiveStep('preview')}
              className={`flex items-center gap-2 font-bold transition ${
                activeStep === 'preview'
                  ? 'text-purple-700'
                  : parsedData
                  ? 'text-slate-700 hover:text-purple-700'
                  : 'text-slate-400 cursor-not-allowed'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                  activeStep === 'preview' ? 'bg-purple-600 text-white' : 'bg-slate-200 text-slate-700'
                }`}
              >
                2
              </span>
              <span>Xem Trước Trực Quan & Xác Nhận</span>
              {parsedData && (
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px]">
                  {parsedData.validQuestions} câu chuẩn
                </span>
              )}
            </button>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-slate-500 font-medium">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Tự phân tích A-B-C-D, đáp án & giải thích</span>
          </div>
        </div>

        {/* STEP 1: PASTE CONTENT & CONFIG */}
        {activeStep === 'paste' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-5">
            {/* 1. Chọn bài học trong 10 bài GDCD 9 Kết nối tri thức */}
            {!targetAssignmentId && (
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border border-purple-100 space-y-3">
                <label className="text-xs font-black uppercase text-purple-900 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-purple-600" />
                  <span>Chọn Bài Học Trong 10 Bài Giáo Dục Công Dân 9 (Kết Nối Tri Thức)</span>
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <select
                      value={selectedLesson}
                      onChange={(e) => setSelectedLesson(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl border border-purple-200 bg-white text-sm font-bold text-slate-800 focus:ring-2 focus:ring-purple-400 focus:outline-none"
                    >
                      {lessons.map((lesson) => {
                        const kn = KET_NOI_TRI_THUC_GDCD9_LESSONS.find((k) => k.number === lesson.number);
                        return (
                          <option key={lesson.id} value={lesson.id}>
                            {kn?.icon || '📘'} Bài {lesson.number}: {lesson.title}
                          </option>
                        );
                      })}
                    </select>
                  </div>

                  <div className="text-xs text-purple-800 bg-white/70 p-2.5 rounded-xl border border-purple-200/60 flex items-center gap-2">
                    <span className="text-lg">{ketNoiPreset?.icon || '🌟'}</span>
                    <span className="line-clamp-2">
                      <strong>Chủ đề:</strong> {currentLessonObj?.description}
                    </span>
                  </div>
                </div>

                {/* Assignment settings: Title, Code, Type, Duration */}
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 pt-1">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Tên Phiếu Bài Tập / Nhiệm Vụ
                    </label>
                    <input
                      type="text"
                      value={assignmentTitle}
                      onChange={(e) => setAssignmentTitle(e.target.value)}
                      placeholder="VD: Phiếu trắc nghiệm củng cố Bài 1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-semibold"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Mã Nhiệm Vụ (Học sinh nhập)
                    </label>
                    <input
                      type="text"
                      value={assignmentCode}
                      onChange={(e) => setAssignmentCode(e.target.value.toUpperCase())}
                      placeholder="GDCD9-B1"
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-mono font-bold text-purple-700"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-700 block mb-1">
                      Thời Gian (Phút)
                    </label>
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-blue-600" />
                      <input
                        type="number"
                        min={1}
                        max={120}
                        value={durationMinutes}
                        onChange={(e) => setDurationMinutes(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white text-xs font-bold"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 2. Textarea dán câu hỏi với hướng dẫn và nút mẫu */}
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <label className="text-xs font-black uppercase text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-purple-600" />
                    <span>Dán Nội Dung Bài Tập Từ Word, PDF Hoặc Tài Liệu Giảng Dạy</span>
                  </label>
                  <p className="text-[11px] text-slate-500">
                    Hỗ trợ mọi định dạng: &quot;Câu 1:&quot;, &quot;1.&quot;, &quot;A.&quot;, đáp án ghi dưới hoặc bảng đáp án.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleInsertSample}
                  className="px-3 py-1.5 rounded-xl bg-purple-100 hover:bg-purple-200 text-purple-800 text-xs font-bold transition flex items-center gap-1 self-start sm:self-auto"
                >
                  <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                  <span>Dán nội dung mẫu Bài {currentLessonObj?.number}</span>
                </button>
              </div>

              <div className="relative">
                <textarea
                  rows={12}
                  value={rawPastedText}
                  onChange={(e) => setRawPastedText(e.target.value)}
                  placeholder={`Dán nội dung bài tập vào đây, ví dụ:\n\nCâu 1: Lí tưởng sống của thanh niên là gì?\nA. Chỉ lo cho bản thân\nB. Cống hiến cho quê hương, đất nước\nC. Tránh né khó khăn\nD. Sống thụ động\nĐáp án: B\nGiải thích: Lí tưởng sống cao đẹp gắn liền với cống hiến.\n\nCâu 2: ...`}
                  className="w-full p-4 rounded-2xl border-2 border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 text-xs font-mono leading-relaxed transition resize-y"
                />

                {rawPastedText.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setRawPastedText('')}
                    className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-600 text-[10px] font-bold"
                  >
                    Xóa sạch
                  </button>
                )}
              </div>
            </div>

            {/* Smart tip guide */}
            <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
              <span className="text-base">💡</span>
              <div className="space-y-1">
                <span className="font-bold">Hệ thống tự động nhận diện:</span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] text-amber-800">
                  <div>• Bắt đầu câu: &quot;Câu 1:&quot;, &quot;Bài 1.&quot;, &quot;1.&quot;, &quot;1)&quot;</div>
                  <div>• Lựa chọn: &quot;A.&quot;, &quot;B.&quot;, &quot;C.&quot;, &quot;D.&quot; (dòng riêng hoặc chung dòng)</div>
                  <div>• Đáp án: &quot;Đáp án: B&quot;, &quot;ĐA: C&quot; hoặc bảng đáp án cuối bài</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: PREVIEW & DIRECT ADJUSTMENT */}
        {activeStep === 'preview' && parsedData && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {/* Summary bar */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-base">
                  {parsedData.totalQuestions}
                </div>
                <div>
                  <div className="font-bold text-slate-900 text-sm">
                    {assignmentTitle || `Bài ${currentLessonObj?.number}: ${currentLessonObj?.title}`}
                  </div>
                  <div className="text-slate-500 text-xs">
                    Mã làm bài: <strong className="text-purple-700 font-mono">{assignmentCode}</strong> • Thời gian:{' '}
                    <strong>{durationMinutes} phút</strong> • Tự tính điểm:{' '}
                    <strong>{parsedData.questions[0]?.points || 1} đ/câu</strong> (Tổng 10đ)
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveStep('paste')}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-white text-slate-700 font-bold transition text-xs"
                >
                  ✏️ Sửa lại văn bản gốc
                </button>
              </div>
            </div>

            {/* Any parsing warnings */}
            {parsedData.errors.length > 0 && (
              <div className="p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs space-y-1">
                <div className="font-bold flex items-center gap-1.5">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <span>Một số câu hỏi cần lưu ý:</span>
                </div>
                <ul className="list-disc pl-5 text-[11px] text-rose-700 space-y-0.5">
                  {parsedData.errors.map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            )}

            {/* List of parsed questions with interactive controls */}
            <div className="space-y-4">
              {parsedData.questions.map((q, qIdx) => (
                <div
                  key={q.id}
                  className={`p-4 rounded-2xl border transition bg-white shadow-xs ${
                    q.error ? 'border-amber-300 ring-2 ring-amber-100' : 'border-slate-200'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-1 rounded-lg bg-purple-100 text-purple-800 font-black text-xs">
                        CÂU {q.order}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-500">({q.points} điểm)</span>
                      {q.error && (
                        <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          Cần kiểm tra
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-xs">
                      <span className="text-slate-500 text-[11px] font-medium mr-1">Đáp án đúng:</span>
                      {(['A', 'B', 'C', 'D'] as const).map((optKey) => (
                        <button
                          key={optKey}
                          type="button"
                          onClick={() => handleUpdateOptionCorrect(qIdx, optKey)}
                          className={`w-7 h-7 rounded-lg font-bold text-xs transition ${
                            q.correctOption === optKey
                              ? 'bg-emerald-600 text-white shadow-sm ring-2 ring-emerald-300'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {optKey}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Question Content */}
                  <textarea
                    rows={2}
                    value={q.content}
                    onChange={(e) => handleUpdateQuestionContent(qIdx, 'content', e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-200 text-xs font-semibold text-slate-800 focus:ring-1 focus:ring-purple-400 mb-3"
                  />

                  {/* 4 Options Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-3">
                    {q.options.map((opt) => {
                      const isCorrect = q.correctOption === opt.key;
                      return (
                        <div
                          key={opt.key}
                          onClick={() => handleUpdateOptionCorrect(qIdx, opt.key)}
                          className={`p-2.5 rounded-xl border flex items-center gap-2 cursor-pointer transition ${
                            isCorrect
                              ? 'bg-emerald-50/80 border-emerald-300 ring-1 ring-emerald-200'
                              : 'bg-slate-50 border-slate-200 hover:bg-slate-100/70'
                          }`}
                        >
                          <span
                            className={`w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isCorrect ? 'bg-emerald-600 text-white' : 'bg-white border border-slate-300 text-slate-700'
                            }`}
                          >
                            {opt.key}
                          </span>
                          <input
                            type="text"
                            value={opt.text}
                            onClick={(e) => e.stopPropagation()}
                            onChange={(e) => handleUpdateOptionText(qIdx, opt.key, e.target.value)}
                            className="flex-1 bg-transparent border-none text-xs text-slate-800 focus:outline-none focus:bg-white focus:px-2 focus:py-1 focus:rounded"
                          />
                          {isCorrect && <Check className="w-4 h-4 text-emerald-600 shrink-0" />}
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation if any */}
                  <div className="flex items-center gap-2 pt-1 border-t border-slate-100 text-[11px] text-slate-600">
                    <span className="font-bold text-purple-700 shrink-0">💡 Giải thích:</span>
                    <input
                      type="text"
                      value={q.explanation}
                      placeholder="Thêm gợi ý hoặc giải thích vì sao đáp án đúng..."
                      onChange={(e) => handleUpdateQuestionContent(qIdx, 'explanation', e.target.value)}
                      className="flex-1 bg-slate-50/60 px-2 py-1 rounded-lg border border-slate-200 text-[11px]"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MODAL FOOTER */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-slate-500 font-medium">
            {activeStep === 'paste' ? (
              <span>Dán nội dung bài tập, sau đó bấm &quot;Phân tích & Tự điều chỉnh&quot;.</span>
            ) : (
              <span>
                Học sinh sẽ làm bài trực tiếp trên máy tính hoặc điện thoại với giao diện thân thiện, tự động lưu và tính
                điểm.
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isProcessing}
              className="px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-bold text-slate-700 transition"
            >
              Hủy bỏ
            </button>

            {activeStep === 'paste' ? (
              <button
                type="button"
                onClick={handleParseContent}
                disabled={!rawPastedText.trim()}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white text-xs font-black shadow-md shadow-purple-200 disabled:opacity-50 transition flex items-center gap-1.5"
              >
                <Sparkles className="w-4 h-4 text-purple-200" />
                <span>Phân Tích & Tự Điều Chỉnh</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleConfirmUpload}
                disabled={isProcessing || !parsedData || parsedData.questions.length === 0}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-xs font-black shadow-md shadow-emerald-200 disabled:opacity-50 transition flex items-center gap-2"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>
                  {isProcessing
                    ? 'Đang nạp câu hỏi...'
                    : `Xác Nhận Nạp ${parsedData?.validQuestions || 0} Câu Cho Học Sinh Làm`}
                </span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
