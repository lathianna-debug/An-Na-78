import type {
  Assignment,
  ClientQuestion,
  DetailedSubmissionItem,
  DetailedSubmissionView,
  Lesson,
  PublicAssignmentStatus,
  Question,
  Student,
  Submission,
  ClassGrade9,
} from '../types.ts';
import {
  DEFAULT_ASSIGNMENTS,
  DEFAULT_CLASSES,
  DEFAULT_LESSONS,
  DEFAULT_QUESTIONS,
} from '../data/defaultAssignmentsData.ts';

// Vietnamese diacritics normalizer
export function normalizeVietnamese(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim()
    .replace(/\s+/g, ' ');
}

// Local Storage helpers with in-memory fallback
const STORAGE_KEYS = {
  STUDENTS: 'htcdn_local_students_v2',
  SUBMISSIONS: 'htcdn_local_submissions_v2',
  ANSWERS: 'htcdn_local_answers_v2',
};

const memoryStore = new Map<string, string>();

function getStorageItem(key: string): string | null {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      return window.localStorage.getItem(key);
    } catch {
      // fallback
    }
  }
  return memoryStore.get(key) || null;
}

function setStorageItem(key: string, value: string): void {
  if (typeof window !== 'undefined' && typeof window.localStorage !== 'undefined') {
    try {
      window.localStorage.setItem(key, value);
      return;
    } catch {
      // fallback
    }
  }
  memoryStore.set(key, value);
}

function getLocalStudents(): Student[] {
  try {
    const raw = getStorageItem(STORAGE_KEYS.STUDENTS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalStudents(students: Student[]): void {
  try {
    setStorageItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
  } catch (e) {
    console.error('Failed to save local students', e);
  }
}

function getLocalSubmissions(): Submission[] {
  try {
    const raw = getStorageItem(STORAGE_KEYS.SUBMISSIONS);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalSubmissions(submissions: Submission[]): void {
  try {
    setStorageItem(STORAGE_KEYS.SUBMISSIONS, JSON.stringify(submissions));
  } catch (e) {
    console.error('Failed to save local submissions', e);
  }
}

function getLocalAnswers(): Record<string, Record<string, string>> {
  try {
    const raw = getStorageItem(STORAGE_KEYS.ANSWERS);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveLocalAnswers(answers: Record<string, Record<string, string>>): void {
  try {
    setStorageItem(STORAGE_KEYS.ANSWERS, JSON.stringify(answers));
  } catch (e) {
    console.error('Failed to save local answers', e);
  }
}

function getLessonNumberForAssignment(a: Assignment): number {
  if (typeof a.lessonNumber === 'number' && a.lessonNumber > 0) {
    return a.lessonNumber;
  }
  if (typeof a.order === 'number' && a.order > 0) {
    return a.order;
  }
  if (a.lessonId) {
    const les = DEFAULT_LESSONS.find((l) => l.id === a.lessonId);
    if (les && typeof les.number === 'number') {
      return les.number;
    }
    const match = a.lessonId.match(/\d+/);
    if (match) return parseInt(match[0], 10);
  }
  if (a.code) {
    const match = a.code.match(/B(\d+)/i) || a.code.match(/BAI(\d+)/i) || a.code.match(/(\d+)/);
    if (match) return parseInt(match[1], 10);
  }
  return 1;
}

export function findAssignmentByCode(code: string): Assignment | undefined {
  if (!code) return DEFAULT_ASSIGNMENTS[0];
  const cleanInput = code.trim();
  const lowerInput = cleanInput.toLowerCase();
  const normInput = normalizeVietnamese(cleanInput);

  // 1. Direct code or ID match
  const exact = DEFAULT_ASSIGNMENTS.find(
    (a) =>
      a.code.toLowerCase() === lowerInput ||
      a.id.toLowerCase() === lowerInput ||
      a.code.toUpperCase() === cleanInput.toUpperCase()
  );
  if (exact) return exact;

  // 2. Friendly lesson aliases
  const aliasMap: Record<string, number> = {
    'bài 1': 1, 'bai 1': 1, 'b1': 1, '1': 1,
    'bài 2': 2, 'bai 2': 2, 'b2': 2, '2': 2,
    'bài 3': 3, 'bai 3': 3, 'b3': 3, '3': 3,
    'bài 4': 4, 'bai 4': 4, 'b4': 4, '4': 4,
    'bài 5': 5, 'bai 5': 5, 'b5': 5, '5': 5,
    'bài 6': 6, 'bai 6': 6, 'b6': 6, '6': 6,
    'bài 7': 7, 'bai 7': 7, 'b7': 7, '7': 7,
    'bài 8': 8, 'bai 8': 8, 'b8': 8, '8': 8,
    'bài 9': 9, 'bai 9': 9, 'b9': 9, '9': 9,
    'bài 10': 10, 'bai 10': 10, 'b10': 10, '10': 10,
  };

  const matchedLessonNum = aliasMap[normInput];
  if (matchedLessonNum !== undefined) {
    const found = DEFAULT_ASSIGNMENTS.find((a) => getLessonNumberForAssignment(a) === matchedLessonNum);
    if (found) return found;
  }

  // 3. Regex for Bài X or Bx
  const match = normInput.match(/(?:bai|b)\s*(\d+)/i) || normInput.match(/^(\d+)$/);
  if (match) {
    const targetNum = parseInt(match[1], 10);
    const found = DEFAULT_ASSIGNMENTS.find((a) => getLessonNumberForAssignment(a) === targetNum);
    if (found) return found;
  }

  // 4. Substring match
  const partial = DEFAULT_ASSIGNMENTS.find(
    (a) =>
      a.code.toLowerCase().includes(lowerInput) ||
      normalizeVietnamese(a.title).includes(normInput)
  );
  if (partial) return partial;

  return DEFAULT_ASSIGNMENTS[0];
}

export function evaluateAssignmentAvailability(assignment: Assignment): {
  isAvailable: boolean;
  status: 'OPEN' | 'MANUALLY_LOCKED' | 'SCHEDULED_NOT_OPEN_YET' | 'SCHEDULED_EXPIRED';
  message: string;
} {
  if (assignment.isLocked) {
    return {
      isAvailable: false,
      status: 'MANUALLY_LOCKED',
      message: 'Bài tập này hiện đang bị khóa bởi Giáo viên bộ môn. Vui lòng quay lại sau.',
    };
  }
  return {
    isAvailable: true,
    status: 'OPEN',
    message: 'Nhiệm vụ đang mở làm bài.',
  };
}

// Client Fallback Engine Controller
export const clientFallbackEngine = {
  isAvailable: true,

  handleRequest: async (url: string, options: RequestInit = {}): Promise<any> => {
    const method = (options.method || 'GET').toUpperCase();
    const cleanUrl = url.split('?')[0];

    // GET /api/public/server-time
    if (cleanUrl === '/api/public/server-time') {
      const now = new Date();
      return { serverTime: now.toISOString(), timestamp: now.getTime() };
    }

    // GET /api/public/classes
    if (cleanUrl === '/api/public/classes') {
      return { classes: DEFAULT_CLASSES };
    }

    // GET /api/public/assignments-status
    if (cleanUrl === '/api/public/assignments-status') {
      const publicAssignments: PublicAssignmentStatus[] = DEFAULT_ASSIGNMENTS.map((a) => {
        const lesson = DEFAULT_LESSONS.find((l) => l.id === a.lessonId);
        const lesNum = getLessonNumberForAssignment(a);
        const qCount = DEFAULT_QUESTIONS.filter((q) => q.assignmentId === a.id).length;
        const avail = evaluateAssignmentAvailability(a);
        return {
          id: a.id,
          lessonId: a.lessonId,
          lessonNumber: lesNum,
          lessonTitle: lesson ? lesson.title : `Bài ${lesNum}`,
          title: a.title,
          code: a.code,
          type: a.type,
          description: a.description,
          durationMinutes: a.durationMinutes || 15,
          isLocked: !!a.isLocked,
          timeLimitEnabled: !!a.timeLimitEnabled,
          openTime: a.openTime || null,
          closeTime: a.closeTime || null,
          scheduleNote: a.scheduleNote || '',
          lockStatus: avail.status,
          lockMessage: avail.message,
          isAvailable: avail.isAvailable,
          questionsCount: qCount,
        };
      }).sort((a, b) => a.lessonNumber - b.lessonNumber);

      return {
        assignments: publicAssignments,
        serverTime: new Date().toISOString(),
      };
    }

    // GET /api/public/assignment-by-code/:code
    if (cleanUrl.startsWith('/api/public/assignment-by-code/')) {
      const code = decodeURIComponent(cleanUrl.replace('/api/public/assignment-by-code/', ''));
      const a = findAssignmentByCode(code);
      if (!a) throw new Error('Không tìm thấy nhiệm vụ học tập này.');
      const lesson = DEFAULT_LESSONS.find((l) => l.id === a.lessonId);
      const lesNum = getLessonNumberForAssignment(a);
      const avail = evaluateAssignmentAvailability(a);
      return {
        id: a.id,
        title: a.title,
        code: a.code,
        type: a.type,
        description: a.description,
        durationMinutes: a.durationMinutes,
        lessonNumber: lesNum,
        lessonTitle: lesson ? lesson.title : `Bài ${lesNum}`,
        lockStatus: avail.status,
        lockMessage: avail.message,
        isAvailable: avail.isAvailable,
        timeLimitEnabled: !!a.timeLimitEnabled,
        openTime: a.openTime || null,
        closeTime: a.closeTime || null,
        scheduleNote: a.scheduleNote || '',
      };
    }

    // GET /api/public/students-by-class/:className
    if (cleanUrl.startsWith('/api/public/students-by-class/')) {
      const targetClass = decodeURIComponent(cleanUrl.replace('/api/public/students-by-class/', '')).toUpperCase();
      const students = getLocalStudents()
        .filter((s) => !s.isDeleted && s.class === targetClass)
        .sort((a, b) => (a.stt || 0) - (b.stt || 0) || a.name.localeCompare(b.name, 'vi'))
        .map((s) => ({
          id: s.id,
          name: s.name,
          stt: s.stt || 1,
          class: s.class,
        }));
      return { students };
    }

    // GET /api/public/all-students
    if (cleanUrl === '/api/public/all-students') {
      const students = getLocalStudents()
        .filter((s) => !s.isDeleted)
        .map((s) => ({
          id: s.id,
          name: s.name,
          stt: s.stt || 1,
          class: s.class,
        }));
      return { students };
    }

    // POST /api/student/start
    if (cleanUrl === '/api/student/start' && method === 'POST') {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      const { studentName, studentClass, taskCode } = body;

      if (!studentName || !studentName.trim()) {
        throw new Error('Vui lòng nhập họ và tên của em.');
      }

      const cleanClass = (studentClass || '9A8').trim().toUpperCase();
      const cleanName = studentName.trim().replace(/\s+/g, ' ');
      const assignment = findAssignmentByCode(taskCode || 'GDCD9-B1') || DEFAULT_ASSIGNMENTS[0];
      const lesson = DEFAULT_LESSONS.find((l) => l.id === assignment.lessonId);
      const lesNum = getLessonNumberForAssignment(assignment);

      const students = getLocalStudents();
      const normName = normalizeVietnamese(cleanName);

      // Find or register student
      let student = students.find(
        (s) => !s.isDeleted && s.class === cleanClass && (s.name.toLowerCase() === cleanName.toLowerCase() || normalizeVietnamese(s.name) === normName)
      );

      if (!student) {
        const classStudents = students.filter((s) => !s.isDeleted && s.class === cleanClass);
        const formattedName = cleanName
          .split(/\s+/)
          .map((w: string) => (w.length > 0 ? w.charAt(0).toUpperCase() + w.slice(1) : ''))
          .filter(Boolean)
          .join(' ');

        student = {
          id: 'hs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          stt: classStudents.length + 1,
          name: formattedName || cleanName,
          class: cleanClass,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isDeleted: false,
          submissionsCount: 0,
          avgScore: 0,
          lastActive: new Date().toISOString(),
        };
        students.push(student);
        saveLocalStudents(students);
      } else {
        student.lastActive = new Date().toISOString();
        saveLocalStudents(students);
      }

      // Check for existing submissions
      const submissions = getLocalSubmissions();
      const existingSub = submissions.find((s) => s.studentId === student!.id && s.assignmentId === assignment.id);

      if (existingSub) {
        if (existingSub.status === 'SUBMITTED_LOCKED') {
          throw new Error('EM_DA_NOP_BAI: Em đã hoàn thành bài tập này rồi!');
        }
      }

      const now = new Date();
      const durationMinutes = assignment.durationMinutes || 15;
      const dueTime = new Date(now.getTime() + durationMinutes * 60 * 1000).toISOString();

      let sub = existingSub;
      if (!sub) {
        sub = {
          id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
          assignmentId: assignment.id,
          assignmentTitle: assignment.title,
          lessonNumber: lesNum,
          lessonTitle: lesson ? lesson.title : `Bài ${lesNum}`,
          studentId: student.id,
          studentName: student.name,
          studentClass: student.class,
          startTime: now.toISOString(),
          serverDueTime: dueTime,
          status: 'IN_PROGRESS',
          totalQuestions: DEFAULT_QUESTIONS.filter((q) => q.assignmentId === assignment.id).length,
          maxScore: 10,
        };
        submissions.push(sub);
        saveLocalSubmissions(submissions);
      }

      const token = 'local-token-' + Date.now();
      const questions: ClientQuestion[] = DEFAULT_QUESTIONS
        .filter((q) => q.assignmentId === assignment.id)
        .sort((a, b) => a.order - b.order)
        .map((q) => ({
          id: q.id,
          assignmentId: q.assignmentId,
          order: q.order,
          content: q.content,
          options: q.options,
          points: q.points,
          imageUrl: q.imageUrl,
        }));

      const allAnswers = getLocalAnswers();
      const savedAnswers = allAnswers[sub.id] || {};

      return {
        submissionId: sub.id,
        token,
        serverTime: now.toISOString(),
        serverDueTime: sub.serverDueTime,
        durationMinutes,
        questions,
        savedAnswers,
        student: { id: student.id, name: student.name, class: student.class },
        assignment: {
          id: assignment.id,
          title: assignment.title,
          code: assignment.code,
          lessonNumber: lesNum,
          lessonTitle: lesson ? lesson.title : `Bài ${lesNum}`,
        },
      };
    }

    // POST /api/student/autosave
    if (cleanUrl === '/api/student/autosave' && method === 'POST') {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      const { submissionId, questionId, selectedOption } = body;
      if (submissionId && questionId) {
        const allAnswers = getLocalAnswers();
        if (!allAnswers[submissionId]) allAnswers[submissionId] = {};
        allAnswers[submissionId][questionId] = selectedOption;
        saveLocalAnswers(allAnswers);
      }
      return { success: true, savedAt: new Date().toISOString() };
    }

    // POST /api/student/submit
    if (cleanUrl === '/api/student/submit' && method === 'POST') {
      const body = typeof options.body === 'string' ? JSON.parse(options.body) : options.body || {};
      const { submissionId } = body;

      const submissions = getLocalSubmissions();
      const sub = submissions.find((s) => s.id === submissionId);
      if (!sub) throw new Error('Không tìm thấy bài làm này.');

      const assignment = DEFAULT_ASSIGNMENTS.find((a) => a.id === sub.assignmentId) || DEFAULT_ASSIGNMENTS[0];
      const questions = DEFAULT_QUESTIONS.filter((q) => q.assignmentId === assignment.id);
      const allAnswers = getLocalAnswers();
      const userAnswers = allAnswers[sub.id] || {};

      let correctCount = 0;
      let totalEarnedPoints = 0;
      let totalMaxPoints = 0;

      for (const q of questions) {
        const ans = userAnswers[q.id];
        const isCorrect = ans === q.correctOption;
        totalMaxPoints += q.points || 1;
        if (isCorrect) {
          correctCount++;
          totalEarnedPoints += q.points || 1;
        }
      }

      const score = totalMaxPoints > 0 ? Math.round((totalEarnedPoints / totalMaxPoints) * 100) / 10 : 0;
      const now = new Date();
      const startTime = new Date(sub.startTime).getTime();
      const totalTimeSeconds = Math.max(1, Math.round((now.getTime() - startTime) / 1000));

      sub.status = 'SUBMITTED_LOCKED';
      sub.submittedAt = now.toISOString();
      sub.score = score;
      sub.maxScore = 10;
      sub.correctCount = correctCount;
      sub.totalQuestions = questions.length;
      sub.totalTimeSeconds = totalTimeSeconds;
      saveLocalSubmissions(submissions);

      // Update student stats
      const students = getLocalStudents();
      const st = students.find((s) => s.id === sub.studentId);
      if (st) {
        const studentSubs = submissions.filter((s) => s.studentId === st.id && s.status === 'SUBMITTED_LOCKED');
        st.submissionsCount = studentSubs.length;
        const totalScores = studentSubs.reduce((acc, cur) => acc + (cur.score || 0), 0);
        st.avgScore = studentSubs.length > 0 ? Math.round((totalScores / studentSubs.length) * 10) / 10 : score;
        st.lastActive = now.toISOString();
        saveLocalStudents(students);
      }

      return {
        status: 'SUBMITTED_LOCKED',
        score,
        maxScore: 10,
        correctCount,
        totalQuestions: questions.length,
        totalTimeSeconds,
      };
    }

    // GET /api/student/submission/:id
    if (cleanUrl.startsWith('/api/student/submission/')) {
      const subId = cleanUrl.replace('/api/student/submission/', '');
      const submissions = getLocalSubmissions();
      const sub = submissions.find((s) => s.id === subId);
      if (!sub) throw new Error('Không tìm thấy bài nộp');

      const assignment = DEFAULT_ASSIGNMENTS.find((a) => a.id === sub.assignmentId) || DEFAULT_ASSIGNMENTS[0];
      const questions = DEFAULT_QUESTIONS.filter((q) => q.assignmentId === assignment.id);
      const allAnswers = getLocalAnswers();
      const userAnswers = allAnswers[sub.id] || {};

      const items: DetailedSubmissionItem[] = questions.map((q) => {
        const selected = userAnswers[q.id] || '';
        const isCorrect = selected === q.correctOption;
        return {
          questionId: q.id,
          order: q.order,
          content: q.content,
          options: q.options,
          selectedOption: selected,
          correctOption: q.correctOption,
          isCorrect,
          pointsEarned: isCorrect ? q.points : 0,
          maxPoints: q.points,
          explanation: q.explanation || '',
        };
      });

      const res: DetailedSubmissionView = {
        submission: sub,
        items,
        reviewMode: assignment.reviewMode || 'FULL_REVIEW',
      };
      return res;
    }

    // GET /api/public/student-scorecard
    if (cleanUrl === '/api/public/student-scorecard') {
      const urlObj = new URL(url, 'http://localhost');
      const studentName = urlObj.searchParams.get('studentName') || '';
      const studentClass = urlObj.searchParams.get('studentClass') || '';
      const cleanName = studentName.trim();
      const normName = normalizeVietnamese(cleanName);

      const students = getLocalStudents();
      const student = students.find(
        (s) => !s.isDeleted && s.class === studentClass && (s.name.toLowerCase() === cleanName.toLowerCase() || normalizeVietnamese(s.name) === normName)
      );

      if (!student) {
        throw new Error('Chưa tìm thấy kết quả làm bài của học sinh này.');
      }

      const submissions = getLocalSubmissions().filter(
        (s) => s.studentId === student.id && s.status === 'SUBMITTED_LOCKED'
      );

      const lessonScores: Record<number, number | null> = {};
      for (let i = 1; i <= 10; i++) lessonScores[i] = null;

      for (const s of submissions) {
        if (s.lessonNumber && typeof s.score === 'number') {
          lessonScores[s.lessonNumber] = s.score;
        }
      }

      return {
        student: {
          id: student.id,
          stt: student.stt || 1,
          name: student.name,
          class: student.class,
          avgScore: student.avgScore || 0,
          submissionsCount: student.submissionsCount || 0,
        },
        lessonScores,
        submissionsSummary: submissions.map((s) => ({
          id: s.id,
          assignmentId: s.assignmentId,
          assignmentTitle: s.assignmentTitle || '',
          lessonNumber: s.lessonNumber || 1,
          lessonTitle: s.lessonTitle || '',
          score: s.score || 0,
          maxScore: 10,
          correctCount: s.correctCount || 0,
          totalQuestions: s.totalQuestions || 0,
          submittedAt: s.submittedAt || '',
          isLate: !!s.isLate,
          status: s.status,
        })),
      };
    }

    // Default error for unhandled fallback endpoints
    throw new Error(`Endpoint not found in client fallback: ${cleanUrl}`);
  },
};
