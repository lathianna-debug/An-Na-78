import React, { useState, useEffect } from 'react';
import {
  Rocket,
  Sparkles,
  User,
  School,
  KeyRound,
  AlertCircle,
  ArrowLeft,
  Lock,
  Unlock,
  Clock,
  CheckCircle2,
  Calendar,
  AlertTriangle,
  Info,
  Award,
  Search,
  ChevronDown,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';
import { ClassGrade9, PublicAssignmentStatus } from '../types.ts';
import { api } from '../lib/api.ts';

interface StudentJoinModalProps {
  onBack: () => void;
  onStartSuccess: (data: any) => void;
}

interface RosterStudent {
  id: string;
  stt: number;
  name: string;
  class: ClassGrade9;
}

export const StudentJoinModal: React.FC<StudentJoinModalProps> = ({ onBack, onStartSuccess }) => {
  const [activeTab, setActiveTab] = useState<'join' | 'scorecard'>('join');
  const [studentName, setStudentName] = useState('');
  const [classList, setClassList] = useState<string[]>([
    '9A8',
    '9A9',
    '9A10',
    '9A11',
    '9A12',
  ]);
  const [studentClass, setStudentClass] = useState<ClassGrade9>('9A8');
  const [taskCode, setTaskCode] = useState('GDCD9-B1');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadySubmittedInfo, setAlreadySubmittedInfo] = useState<{
    message: string;
    score?: number;
    lessonNumber?: number;
  } | null>(null);

  // All students across all classes for instant auto-recognition
  const [allStudents, setAllStudents] = useState<RosterStudent[]>([]);
  // Roster of students in the currently selected class
  const [rosterStudents, setRosterStudents] = useState<RosterStudent[]>([]);
  const [loadingRoster, setLoadingRoster] = useState(false);

  // Live assignments list with real-time lock and schedule status
  const [assignments, setAssignments] = useState<PublicAssignmentStatus[]>([]);
  const [loadingAssignments, setLoadingAssignments] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'open' | 'scheduled'>('all');

  // Client helper to normalize Vietnamese string
  const normalizeVietnameseClient = (str: string) => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/đ/g, 'd')
      .replace(/Đ/g, 'D')
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ');
  };

  // Find matching student across roster in current class (or exact match across school)
  const matchedStudent = React.useMemo(() => {
    if (!studentName.trim() || studentName.trim().length < 2) return null;
    const cleanInput = studentName.trim().replace(/\s+/g, ' ');
    const normInput = normalizeVietnameseClient(cleanInput);

    // 1. Try currently selected class first
    const exactInClass = rosterStudents.find((st) => {
      const normRoster = normalizeVietnameseClient(st.name);
      return st.name.toLowerCase() === cleanInput.toLowerCase() || normRoster === normInput;
    });
    if (exactInClass) return exactInClass;

    // 1b. Partial in selected class only if input is reasonably specific (>= 3 chars)
    if (normInput.length >= 3) {
      const partialInClass = rosterStudents.filter((st) => {
        const normRoster = normalizeVietnameseClient(st.name);
        return normRoster.endsWith(' ' + normInput) || normRoster.startsWith(normInput + ' ') || normRoster.includes(normInput);
      });
      if (partialInClass.length === 1) return partialInClass[0];
    }

    // 2. Try across all classes only if exact match on full name
    const exactAcross = allStudents.find((st) => {
      const normRoster = normalizeVietnameseClient(st.name);
      return st.name.toLowerCase() === cleanInput.toLowerCase() || normRoster === normInput;
    });
    return exactAcross || null;
  }, [studentName, rosterStudents, allStudents]);

  // Personal scorecard state
  const [scorecardLoading, setScorecardLoading] = useState(false);
  const [scorecardError, setScorecardError] = useState<string | null>(null);
  const [scorecardData, setScorecardData] = useState<{
    student: { id: string; stt: number; name: string; class: ClassGrade9; avgScore: number; submissionsCount: number };
    lessonScores: Record<number, number | null>;
    submissionsSummary: Array<{
      id: string;
      assignmentId: string;
      assignmentTitle: string;
      lessonNumber: number;
      score: number;
      maxScore: number;
      totalTimeSeconds: number;
      submittedAt: string;
      isLate: boolean;
      status: string;
    }>;
  } | null>(null);

  // Load available classes & all students roster
  useEffect(() => {
    api.getClasses().then((res) => {
      if (res && res.classes && res.classes.length > 0) {
        setClassList(res.classes);
        if (!res.classes.includes(studentClass)) {
          setStudentClass(res.classes[0]);
        }
      }
    }).catch(() => {});

    api.getAllStudents().then((res) => {
      if (res && res.students) {
        setAllStudents(res.students as RosterStudent[]);
      }
    }).catch(() => {});
  }, []);

  // Load official roster for the selected class
  useEffect(() => {
    setLoadingRoster(true);
    api
      .getStudentsByClass(studentClass)
      .then((res) => {
        if (res && res.students) {
          setRosterStudents(res.students as RosterStudent[]);
        }
      })
      .catch((e) => {
        console.error('Failed to load class roster', e);
      })
      .finally(() => {
        setLoadingRoster(false);
      });
  }, [studentClass]);

  const loadAssignmentsStatus = async () => {
    try {
      const data = await api.getPublicAssignmentsStatus();
      if (data && data.assignments) {
        setAssignments(data.assignments);
        // If current taskCode is not open, pick the first open assignment if available
        const currentSelected = data.assignments.find(
          (a) => a.code.toUpperCase() === taskCode.toUpperCase()
        );
        if (!currentSelected || !currentSelected.isAvailable) {
          const firstOpen = data.assignments.find((a) => a.isAvailable);
          if (firstOpen) {
            setTaskCode(firstOpen.code);
          }
        }
      }
    } catch (e) {
      console.error('Failed to load assignments status', e);
    } finally {
      setLoadingAssignments(false);
    }
  };

  useEffect(() => {
    loadAssignmentsStatus();
    const interval = setInterval(loadAssignmentsStatus, 30000);
    return () => clearInterval(interval);
  }, []);

  const selectedAssignment = React.useMemo(() => {
    if (!assignments || assignments.length === 0) return null;
    const raw = (taskCode || '').trim().toUpperCase();
    const norm = normalizeVietnameseClient(taskCode).replace(/[^a-z0-9]/g, '');

    // 1. Direct code match
    const byCode = assignments.find((a) => a.code.toUpperCase() === raw);
    if (byCode) return byCode;

    // 2. By lesson number (1..10)
    for (let num = 10; num >= 1; num--) {
      const patterns = [`${num}`, `b${num}`, `bai${num}`, `gdcd${num}`, `gdcd9b${num}`];
      if (patterns.includes(norm)) {
        const byNum = assignments.find((a) => a.lessonNumber === num);
        if (byNum) return byNum;
      }
    }

    // 3. Number in raw text (e.g. "bài 2")
    const numMatch = raw.match(/\b(10|[1-9])\b/);
    if (numMatch) {
      const num = parseInt(numMatch[1], 10);
      const byNum = assignments.find((a) => a.lessonNumber === num);
      if (byNum) return byNum;
    }

    // 4. Default to first open or first available assignment
    return assignments.find((a) => a.isAvailable) || assignments[0] || null;
  }, [assignments, taskCode]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentName.trim()) {
      setError('Vui lòng nhập Họ và tên của em.');
      return;
    }

    const codeToUse = selectedAssignment?.code || taskCode.trim() || 'GDCD9-B1';

    if (selectedAssignment && !selectedAssignment.isAvailable) {
      setError(selectedAssignment.lockMessage || 'Bài tập này hiện đang bị khóa hoặc chưa đến thời gian mở.');
      return;
    }

    setLoading(true);
    setError(null);
    setAlreadySubmittedInfo(null);

    try {
      const data = await api.startMission({
        studentName: studentName.trim(),
        studentClass,
        taskCode: codeToUse,
      });
      onStartSuccess(data);
    } catch (err: any) {
      const msg = err.message || '';
      if (
        msg.includes('EM_DA_NOP_BAI') ||
        msg.includes('đã nộp bài') ||
        msg.includes('HET_GIO_LOCKED') ||
        msg.includes('kết thúc') ||
        msg.includes('khóa bài làm')
      ) {
        setAlreadySubmittedInfo({
          message: msg.includes('HET_GIO') || msg.includes('kết thúc')
            ? 'Thời gian làm bài tập này đã kết thúc. Bài làm của em đã được tự động nộp và khóa an toàn trên hệ thống.'
            : 'Em đã nộp bài tập này rồi và điểm đã được khóa an toàn trên hệ thống!',
          lessonNumber: selectedAssignment?.lessonNumber || 1,
        });
      } else {
        setError(msg || 'Không thể bắt đầu nhiệm vụ. Vui lòng kiểm tra lại họ tên và mã bài tập.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleFetchScorecard = async () => {
    if (!studentName.trim()) {
      setScorecardError('Vui lòng nhập tên của em để tra cứu điểm.');
      return;
    }

    setScorecardLoading(true);
    setScorecardError(null);
    try {
      const res = await api.getStudentScorecard({
        studentName: studentName.trim(),
        studentClass,
      });
      setScorecardData(res);
      // If student was from another class, update displayed class
      if (res.student && res.student.class && res.student.class !== studentClass) {
        setStudentClass(res.student.class);
      }
    } catch (err: any) {
      setScorecardError(err.message || 'Không tìm thấy bảng điểm của em. Em kiểm tra lại họ tên và lớp nhé!');
      setScorecardData(null);
    } finally {
      setLoading(false);
      setScorecardLoading(false);
    }
  };

  const formatDateTime = (dateStr: string | null | undefined) => {
    if (!dateStr) return '';
    try {
      const d = new Date(dateStr);
      return d.toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  const filteredAssignments = assignments.filter((a) => {
    if (filterMode === 'open') return a.isAvailable;
    if (filterMode === 'scheduled') return a.timeLimitEnabled;
    return true;
  });

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-10">
      <button
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-purple-700 transition mb-6 cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Về trang chủ</span>
      </button>

      <div className="bg-white rounded-3xl shadow-2xl shadow-indigo-200/60 border-2 border-indigo-200 overflow-hidden">
        {/* 🔒 Hình nền chính thức của Cô An Na (Khóa cố định, không hiển thị hình cũ) */}
        <div className="relative w-full bg-slate-900 border-b border-indigo-200 overflow-hidden max-h-36 sm:max-h-52 flex items-center justify-center">
          <img
            src="/uploads/banner_1790495237357_fdc4121b.png"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/banner_co_an_na.png';
            }}
            alt="Hình nền Hành trình Công dân nhí 9 - Trường THCS Tân Hải"
            className="w-full h-auto max-h-36 sm:max-h-52 object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-950/20 to-black/30 pointer-events-none" />
          <div className="absolute top-2 sm:top-3 left-3 sm:left-4 right-3 sm:right-4 flex items-center justify-between pointer-events-none">
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/60 backdrop-blur-md text-[10px] sm:text-[11px] font-black text-amber-300 border border-amber-400/40 shadow-sm">
              🏫 TRƯỜNG THCS TÂN HẢI • GDCD 9
            </span>
            <span className="px-2.5 sm:px-3 py-0.5 sm:py-1 rounded-full bg-black/70 backdrop-blur-md text-[9px] sm:text-[10px] font-extrabold text-amber-300 border border-amber-300/50 shadow-sm flex items-center gap-1">
              <span>🔒</span>
              <span className="hidden sm:inline">HÌNH NỀN CÔ AN NA • ĐÃ KHÓA CỐ ĐỊNH</span>
              <span className="sm:hidden">ẢNH ĐÃ KHÓA</span>
            </span>
          </div>
        </div>

        {/* Top Header Gradient */}
        <div className="bg-gradient-to-r from-amber-500 via-purple-700 to-indigo-800 p-4 sm:p-7 text-white relative overflow-hidden shadow-inner">
          <div className="absolute right-0 top-0 translate-x-4 -translate-y-4 w-36 h-36 bg-white/15 rounded-full blur-2xl" />
          <div className="flex flex-wrap items-center gap-2 mb-2 sm:mb-3">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-yellow-400 text-slate-900 text-[11px] sm:text-xs font-black tracking-wide uppercase shadow-sm">
              <span>🏫 TRƯỜNG THCS TÂN HẢI</span>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] sm:text-xs font-bold tracking-wide uppercase text-yellow-200">
              <Sparkles className="w-3.5 h-3.5 text-yellow-300" />
              <span>MÔN GDCD 9</span>
            </span>
          </div>
          <h1 className="text-xl sm:text-3xl font-black tracking-tight drop-shadow-xs">
            🎒 KHÔNG GIAN HỌC TẬP HỌC SINH
          </h1>
          <p className="text-purple-100 text-xs sm:text-sm mt-1 font-semibold">
            Chọn lớp (9A8 – 9A12), tự nhập họ tên để vào làm bài và theo dõi điểm số các cột!
          </p>

          {/* 🔐 Data Lock Badge */}
          <div className="mt-2.5 sm:mt-3.5 inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-black/25 backdrop-blur-md border border-white/20 text-[10px] sm:text-[11px] font-semibold text-amber-200">
            <ShieldCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-emerald-300 shrink-0" />
            <span>Dữ liệu đã khóa bảo mật: Học sinh chỉ xem và làm bài của mình.</span>
          </div>
        </div>

        {/* 📑 TAB SWITCHER: LÀM BÀI vs TRA CỨU ĐIỂM CÁ NHÂN */}
        <div className="grid grid-cols-2 p-1.5 bg-slate-100 border-b border-slate-200 text-xs sm:text-sm font-black">
          <button
            type="button"
            onClick={() => setActiveTab('join')}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'join'
                ? 'bg-white text-purple-800 shadow-sm border border-slate-200/80 ring-2 ring-purple-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Rocket className="w-4 h-4 text-purple-600" />
            <span>✍️ Vào làm bài tập</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('scorecard');
              if (studentName.trim()) {
                handleFetchScorecard();
              }
            }}
            className={`py-3 px-4 rounded-2xl flex items-center justify-center gap-2 transition cursor-pointer ${
              activeTab === 'scorecard'
                ? 'bg-white text-indigo-800 shadow-sm border border-slate-200/80 ring-2 ring-indigo-100'
                : 'text-slate-500 hover:text-slate-900 hover:bg-slate-200/60'
            }`}
          >
            <Award className="w-4 h-4 text-indigo-600" />
            <span>📊 Bảng điểm của em (Bài 1 → 10)</span>
          </button>
        </div>

        {/* TAB 1: VÀO LÀM BÀI */}
        {activeTab === 'join' && (
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 space-y-6">
            {error && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-semibold">{error}</div>
              </div>
            )}

            {/* 🔒 THÔNG BÁO BÀI ĐÃ ĐƯỢC NỘP / KHÓA AN TOÀN */}
            {alreadySubmittedInfo && (
              <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-50 via-purple-50 to-indigo-50 border-2 border-indigo-200 text-slate-800 space-y-3 shadow-md">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 text-xl shadow-xs">
                    🔒
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-extrabold text-sm text-indigo-950">
                      BÀI LÀM ĐÃ ĐƯỢC NỘP VÀ KHÓA AN TOÀN!
                    </h4>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {alreadySubmittedInfo.message}
                    </p>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveTab('scorecard');
                      handleFetchScorecard();
                    }}
                    className="py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black flex items-center gap-1.5 shadow-sm transition cursor-pointer"
                  >
                    <Award className="w-4 h-4" />
                    <span>Xem bảng điểm của em (Bài 1 → 10)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setAlreadySubmittedInfo(null);
                      const nextOpen = assignments.find((a) => a.code !== taskCode && a.isAvailable);
                      if (nextOpen) {
                        setTaskCode(nextOpen.code);
                      }
                    }}
                    className="py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 text-xs font-bold transition cursor-pointer"
                  >
                    <span>Chọn bài tập khác</span>
                  </button>
                </div>
              </div>
            )}

            {/* 🏫 1. Chọn Lớp học */}
            <div className="space-y-1.5">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                <School className="w-4 h-4 text-indigo-600" />
                <span>1. Chọn Lớp học của em</span>
              </label>
              <div className="grid grid-cols-5 gap-2">
                {classList.map((cls) => (
                  <button
                    key={cls}
                    type="button"
                    onClick={() => {
                      setStudentClass(cls as ClassGrade9);
                    }}
                    className={`py-2.5 px-2 rounded-2xl font-black text-xs sm:text-sm border-2 transition text-center cursor-pointer ${
                      studentClass === cls
                        ? 'bg-purple-600 text-white border-purple-600 shadow-md ring-2 ring-purple-200'
                        : 'bg-slate-50 text-slate-700 border-slate-200 hover:border-purple-300 hover:bg-white'
                    }`}
                  >
                    Lớp {cls}
                  </button>
                ))}
              </div>
            </div>

            {/* 👤 2. Tự đăng nhập Họ và tên */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>2. Tự đăng nhập Họ và tên (Lớp {studentClass})</span>
                </label>
                {rosterStudents.length > 0 ? (
                  <span className="text-[11px] text-emerald-700 font-bold flex items-center gap-1">
                    <Lock className="w-3 h-3 text-emerald-600" />
                    <span>{rosterStudents.length} học sinh</span>
                  </span>
                ) : (
                  <span className="text-[11px] text-purple-700 font-bold flex items-center gap-1 bg-purple-50 px-2 py-0.5 rounded-full border border-purple-200">
                    <Sparkles className="w-3 h-3 text-purple-600" />
                    <span>Tự do đăng nhập (Tự động ghi danh)</span>
                  </span>
                )}
              </div>

              {/* Text Input for student self-login */}
              <div className="relative">
                <input
                  type="text"
                  required
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                  }}
                  placeholder="Nhập họ và tên của em (Ví dụ: Nguyễn Văn An)"
                  className="w-full px-4 py-3.5 rounded-2xl bg-slate-50 border-2 border-slate-200 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-100 outline-none text-slate-800 font-bold transition text-sm sm:text-base placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              {/* Roster Match Feedback */}
              {matchedStudent && matchedStudent.class === studentClass ? (
                <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>
                    ✓ Đã nhận diện học sinh: <strong>{matchedStudent.name}</strong> • STT: <strong>{matchedStudent.stt}</strong> (Lớp {studentClass})
                  </span>
                </div>
              ) : matchedStudent && matchedStudent.class !== studentClass ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-amber-50 border border-amber-300 text-amber-900 text-xs font-semibold">
                  <span>
                    💡 Tìm thấy học sinh <strong>{matchedStudent.name}</strong> ở <strong>Lớp {matchedStudent.class}</strong>.
                  </span>
                  <button
                    type="button"
                    onClick={() => setStudentClass(matchedStudent.class)}
                    className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shrink-0 cursor-pointer shadow-xs"
                  >
                    Chuyển sang Lớp {matchedStudent.class}
                  </button>
                </div>
              ) : studentName.trim().length >= 2 ? (
                <div className="flex items-center gap-2 p-2 rounded-xl bg-purple-50 border border-purple-200 text-purple-900 text-xs">
                  <Info className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                  <span>
                    {rosterStudents.length > 0
                      ? `Gợi ý: Em có thể gõ có dấu hoặc không dấu. Hệ thống sẽ tự động đối chiếu với danh sách Lớp ${studentClass}.`
                      : `✨ Tên em "${studentName.trim()}" sẽ được ghi danh vào Lớp ${studentClass} khi bấm bắt đầu làm bài!`}
                  </span>
                </div>
              ) : null}
            </div>

            {/* 📚 3. Chọn Bài tập GDCD 9 (Bài 1 → Bài 10) */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <KeyRound className="w-4 h-4 text-cyan-600" />
                  <span>3. Chọn Bài tập em muốn làm:</span>
                </label>
                <div className="flex items-center gap-1 text-[11px]">
                  <button
                    type="button"
                    onClick={() => setFilterMode('all')}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      filterMode === 'all'
                        ? 'bg-purple-100 text-purple-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Tất cả ({assignments.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilterMode('open')}
                    className={`px-2 py-0.5 rounded-md font-bold transition cursor-pointer ${
                      filterMode === 'open'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'text-slate-500 hover:text-slate-800'
                    }`}
                  >
                    Đang mở ({assignments.filter((a) => a.isAvailable).length})
                  </button>
                </div>
              </div>

              {loadingAssignments ? (
                <div className="py-6 text-center text-xs text-slate-400">
                  Đang kiểm tra trạng thái các bài tập...
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                  {filteredAssignments.map((a) => {
                    const isSelected = selectedAssignment?.id === a.id || a.code.toUpperCase() === taskCode.trim().toUpperCase();
                    return (
                      <button
                        key={a.id}
                        type="button"
                        onClick={() => {
                          setTaskCode(a.code);
                        }}
                        className={`p-3 rounded-2xl border text-left transition flex items-center justify-between gap-2.5 cursor-pointer ${
                          isSelected
                            ? 'bg-purple-50/90 border-purple-600 ring-2 ring-purple-200 shadow-sm'
                            : 'bg-slate-50 border-slate-200 hover:border-purple-300 hover:bg-white'
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-1.5 mb-0.5">
                            <span className="font-mono font-black text-xs text-purple-700 bg-white px-1.5 py-0.2 rounded border border-purple-200">
                              {a.code}
                            </span>
                            <span className="text-[11px] font-bold text-slate-500">
                              Bài {a.lessonNumber}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-black text-purple-700 bg-purple-200/80 px-1.5 py-0.2 rounded-full">
                                ✓ Đang chọn
                              </span>
                            )}
                          </div>
                          <p className="text-xs font-bold text-slate-800 truncate">
                            {a.title}
                          </p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500 mt-1">
                            <span>⏱️ {a.durationMinutes} phút</span>
                            <span>•</span>
                            <span>{a.questionsCount} câu hỏi</span>
                          </div>
                        </div>

                        <div className="shrink-0">
                          {a.isAvailable ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold border border-emerald-300">
                              <Unlock className="w-3 h-3 text-emerald-600" />
                              <span>Mở</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[10px] font-bold border border-slate-300">
                              <Lock className="w-3 h-3 text-slate-500" />
                              <span>Khóa</span>
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* REAL-TIME STATUS CARD FOR THE SELECTED ASSIGNMENT */}
              {selectedAssignment && (
                <div
                  className={`p-3.5 sm:p-4 rounded-2xl border transition-all ${
                    selectedAssignment.isAvailable
                      ? 'bg-emerald-50/90 border-emerald-200 text-emerald-900'
                      : selectedAssignment.lockStatus === 'SCHEDULED_NOT_OPEN_YET'
                      ? 'bg-amber-50/90 border-amber-200 text-amber-900'
                      : selectedAssignment.lockStatus === 'SCHEDULED_EXPIRED'
                      ? 'bg-slate-100 border-slate-300 text-slate-700'
                      : 'bg-rose-50/90 border-rose-200 text-rose-900'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black px-2 py-0.5 rounded-md bg-white/80 border text-slate-800">
                          {selectedAssignment.code}
                        </span>
                        <span className="font-bold text-sm">
                          {selectedAssignment.title}
                        </span>
                      </div>
                      <p className="text-xs opacity-90">
                        {selectedAssignment.description}
                      </p>
                      <div className="flex flex-wrap items-center gap-3 text-xs pt-1 opacity-80">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Thời gian: {selectedAssignment.durationMinutes} phút</span>
                        </span>
                        <span>•</span>
                        <span>{selectedAssignment.questionsCount} câu hỏi</span>
                      </div>
                    </div>

                    <div className="shrink-0 text-right">
                      {selectedAssignment.isAvailable ? (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-600 text-white font-bold text-xs shadow-xs animate-pulse">
                          <Unlock className="w-3.5 h-3.5" />
                          <span>Đang mở</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-600 text-white font-bold text-xs shadow-xs">
                          <Lock className="w-3.5 h-3.5" />
                          <span>Đang khóa</span>
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-2.5 pt-2 border-t border-black/10 flex items-center gap-1.5 text-xs font-semibold">
                    <Info className="w-3.5 h-3.5 shrink-0" />
                    <span>{selectedAssignment.lockMessage}</span>
                  </div>
                </div>
              )}
            </div>

            {/* Action Submit Button */}
            <button
              type="submit"
              disabled={loading || (selectedAssignment ? !selectedAssignment.isAvailable : false) || !studentName.trim()}
              className="w-full py-4 px-6 rounded-2xl font-black text-white text-base bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 shadow-lg shadow-purple-200 transition flex items-center justify-center gap-2.5 active:scale-95 disabled:opacity-50 disabled:pointer-events-none cursor-pointer"
            >
              <Rocket className="w-5 h-5 text-amber-300" />
              <span>
                {loading
                  ? 'Đang vào bài làm...'
                  : selectedAssignment
                  ? `Bắt đầu làm: ${selectedAssignment.title.split('—')[0] || selectedAssignment.code}`
                  : 'Bắt đầu làm bài ngay'}
              </span>
            </button>
          </form>
        )}

        {/* TAB 2: TRA CỨU BẢNG ĐIỂM CÁ NHÂN (CỘT BÀI 1 ĐẾN BÀI 10) */}
        {activeTab === 'scorecard' && (
          <div className="p-6 sm:p-8 space-y-6">
            {scorecardError && (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                <div className="leading-relaxed font-semibold">{scorecardError}</div>
              </div>
            )}

            {/* Selector: Lớp & Tên */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <School className="w-4 h-4 text-indigo-600" />
                  <span>Chọn Lớp học:</span>
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {classList.map((cls) => (
                    <button
                      key={cls}
                      type="button"
                      onClick={() => {
                        setStudentClass(cls as ClassGrade9);
                        setScorecardData(null);
                      }}
                      className={`py-2 px-1 rounded-xl font-bold text-xs border text-center transition cursor-pointer ${
                        studentClass === cls
                          ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-indigo-300'
                      }`}
                    >
                      {cls}
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1.5">
                  <User className="w-4 h-4 text-purple-600" />
                  <span>Tự nhập họ và tên của em trong Lớp {studentClass}:</span>
                </label>
                <input
                  type="text"
                  value={studentName}
                  onChange={(e) => {
                    setStudentName(e.target.value);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleFetchScorecard();
                    }
                  }}
                  placeholder="Nhập họ và tên để tra cứu điểm (Ví dụ: Nguyễn Võ Trầm Anh)"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-slate-300 focus:border-purple-500 outline-none font-bold text-sm placeholder:font-normal placeholder:text-slate-400"
                />
              </div>

              <button
                type="button"
                onClick={handleFetchScorecard}
                disabled={scorecardLoading || !studentName.trim()}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-xs sm:text-sm hover:from-indigo-700 hover:to-purple-700 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                <Search className="w-4 h-4" />
                <span>{scorecardLoading ? 'Đang tra cứu điểm...' : 'Tra cứu bảng điểm cá nhân'}</span>
              </button>
            </div>

            {/* Display Scorecard Result */}
            {scorecardData && (
              <div className="space-y-5">
                {/* Student Info Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-50 via-indigo-50 to-blue-50 border-2 border-indigo-200 flex items-center justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-purple-700 uppercase">HỌC SINH</span>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {scorecardData.student.name}
                    </h3>
                    <p className="text-xs text-slate-600">
                      STT: <span className="font-bold text-purple-800">{scorecardData.student.stt}</span> • Lớp: <span className="font-bold text-purple-800">{scorecardData.student.class}</span>
                    </p>
                  </div>

                  <div className="text-right">
                    <span className="text-[11px] font-bold text-purple-700 uppercase">ĐIỂM TRUNG BÌNH</span>
                    <div className="text-2xl font-black text-purple-900">
                      {scorecardData.student.avgScore > 0 ? scorecardData.student.avgScore.toFixed(1).replace('.0', '') : '—'}
                    </div>
                    <span className="text-[10px] text-slate-500 font-semibold">
                      Đã hoàn thành {scorecardData.student.submissionsCount} bài
                    </span>
                  </div>
                </div>

                {/* 10 LESSON COLUMNS */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-700 flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-purple-600" />
                    <span>CỘT ĐIỂM CÁC BÀI TẬP (BÀI 1 ĐẾN BÀI 10)</span>
                  </h4>

                  <div className="overflow-x-auto pb-1">
                    <div className="grid grid-cols-10 gap-1.5 min-w-[500px]">
                      {([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((num) => {
                        const score = scorecardData.lessonScores[num];
                        return (
                          <div
                            key={num}
                            className={`p-2.5 rounded-xl text-center border transition ${
                              score !== null && score !== undefined
                                ? score >= 8
                                  ? 'bg-emerald-50 border-emerald-300 text-emerald-900 shadow-xs'
                                  : score >= 5
                                  ? 'bg-blue-50 border-blue-300 text-blue-900 shadow-xs'
                                  : 'bg-rose-50 border-rose-300 text-rose-900 shadow-xs'
                                : 'bg-slate-50 border-slate-200 text-slate-400'
                            }`}
                          >
                            <div className="text-[10px] font-bold uppercase text-slate-500">
                              Bài {num}
                            </div>
                            <div className="text-sm font-black mt-1">
                              {score !== null && score !== undefined
                                ? score.toString().replace('.', ',')
                                : '—'}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Submissions Detail List */}
                <div className="space-y-2">
                  <h4 className="text-xs font-black uppercase text-slate-700">
                    Chi tiết các bài đã nộp ({scorecardData.submissionsSummary.length})
                  </h4>

                  {scorecardData.submissionsSummary.length === 0 ? (
                    <div className="p-4 rounded-xl bg-slate-50 text-slate-400 text-xs text-center">
                      Em chưa hoàn thành bài tập nào. Hãy chọn bài đang mở để bắt đầu nhé!
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {scorecardData.submissionsSummary.map((sub) => (
                        <div
                          key={sub.id}
                          className="p-3 rounded-xl border border-slate-200 bg-white flex items-center justify-between text-xs"
                        >
                          <div>
                            <div className="font-bold text-slate-900">
                              Bài {sub.lessonNumber}: {sub.assignmentTitle}
                            </div>
                            <p className="text-[11px] text-slate-400 font-mono">
                              Nộp lúc: {formatDateTime(sub.submittedAt)}
                            </p>
                          </div>

                          <div className="flex items-center gap-3">
                            <span className="px-2 py-0.5 rounded-md bg-purple-100 text-purple-900 font-black text-xs">
                              {sub.score} / {sub.maxScore} điểm
                            </span>
                            <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                              🔐 Đã khóa
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Security Guarantee Note */}
                <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 flex items-start gap-2">
                  <Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Bảo mật thông tin:</strong> Học sinh chỉ xem được điểm số tổng hợp của chính mình.
                    Toàn bộ nội dung câu hỏi và đáp án chi tiết được khóa bảo vệ, học sinh không thể mở bài của bạn khác để sao chép.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
