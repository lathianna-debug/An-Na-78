import express from 'express';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { createServer as createViteServer } from 'vite';
import * as XLSX from 'xlsx';
import { GoogleGenAI } from '@google/genai';
import { dbManager } from './server/db.ts';
import {
  Assignment,
  ClientQuestion,
  DetailedSubmissionItem,
  Question,
  Student,
  Submission,
  ClassGrade9,
} from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use('/uploads', express.static(path.join(process.cwd(), 'public', 'uploads')));

// In-memory active tokens for admin and students
const adminSessions = new Set<string>();
const studentSessions = new Map<string, { studentId: string; submissionId: string; expiresAt: number }>();

// Simple rate limiter for login
const loginAttempts = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = loginAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    loginAttempts.set(ip, { count: 1, resetAt: now + 60000 });
    return true;
  }
  if (entry.count >= 10) {
    return false;
  }
  entry.count++;
  return true;
}

// Middleware to verify admin token (Chỉ duy nhất Cô An Na mới có quyền thay đổi, xóa hay cài đặt dữ liệu)
function verifyAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      error: 'UNAUTHORIZED',
      message: '🔐 BẢO MẬT DỮ LIỆU: Dữ liệu đã được khóa an toàn. Ngoài Cô An Na ra, không bất kỳ ai có thể thay đổi, xóa hay cài đặt dữ liệu. Vui lòng đăng nhập tài khoản Quản trị Cô An Na.',
    });
  }
  const token = authHeader.substring(7);
  if (!adminSessions.has(token)) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: '🔐 BẢO MẬT DỮ LIỆU: Phiên làm việc đã hết hạn hoặc không hợp lệ. Vui lòng đăng nhập lại tài khoản Quản trị Cô An Na.',
    });
  }
  next();
}

// ==========================================
// PUBLIC & STUDENT ROUTES
// ==========================================

// Server clock endpoint to ensure student timer synchronization
app.get('/api/public/server-time', (req, res) => {
  res.json({
    serverTime: new Date().toISOString(),
    timestamp: Date.now(),
  });
});

// Get available classes
app.get('/api/public/classes', (req, res) => {
  const db = dbManager.getData();
  res.json({ classes: db.classes });
});

// Helper to normalize Vietnamese string for smart matching
function normalizeVietnamese(str: string): string {
  return (str || '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .trim();
}

// Public class roster list for student selection (STT + Name only, no scores or answers)
app.get('/api/public/students-by-class/:className', (req, res) => {
  const className = (req.params.className || '').trim().toUpperCase();
  const db = dbManager.getData();
  const students = (db.students || [])
    .filter((s: any) => !s.isDeleted && s.class === className)
    .map((s: any) => ({
      id: s.id,
      stt: s.stt || 0,
      name: s.name,
      class: s.class,
    }))
    .sort((a: any, b: any) => (a.stt - b.stt) || a.name.localeCompare(b.name, 'vi'));
  res.json({ students });
});

// Public student scorecard: Student views ONLY their own completed columns (Bài 1..10) without seeing other students' work or answers
app.post('/api/public/student-scorecard', (req, res) => {
  const { studentName, studentClass, studentId } = req.body;
  const db = dbManager.getData();

  let student: any = null;
  if (studentId) {
    student = db.students.find((s: any) => !s.isDeleted && s.id === studentId);
  } else if (studentName && studentClass) {
    const cleanName = String(studentName).trim().replace(/\s+/g, ' ');
    const cleanClass = String(studentClass).trim().toUpperCase();
    const normName = normalizeVietnamese(cleanName);

    student = db.students.find(
      (s: any) =>
        !s.isDeleted &&
        s.class === cleanClass &&
        (s.name.toLowerCase() === cleanName.toLowerCase() || normalizeVietnamese(s.name) === normName)
    );

    if (!student) {
      const classStudents = (db.students || []).filter((s: any) => !s.isDeleted && s.class === cleanClass);
      const partialCandidates = classStudents.filter((s: any) => {
        const normS = normalizeVietnamese(s.name);
        return normS === normName ||
               normS.endsWith(' ' + normName) ||
               normS.startsWith(normName + ' ') ||
               normS.includes(normName);
      });
      if (partialCandidates.length === 1) {
        student = partialCandidates[0];
      }
    }
  }

  if (!student) {
    return res.status(404).json({
      error: 'STUDENT_NOT_FOUND',
      message: 'Không tìm thấy thông tin học sinh trong danh sách lớp. Em vui lòng kiểm tra lại chính tả họ và tên nhé!',
    });
  }

  // Pre-index assignment to lesson number
  const assignmentLessonMap = new Map<string, number>();
  for (const a of (db.assignments || [])) {
    let num: number | undefined = a.lessonNumber;
    if (!num && a.lessonId) {
      const les = (db.lessons || []).find((l: any) => l.id === a.lessonId);
      if (les && typeof les.number === 'number') num = les.number;
      else {
        const match = a.lessonId.match(/\d+/);
        if (match) num = parseInt(match[0], 10);
      }
    }
    if (!num && a.code) {
      const match = a.code.match(/B(\d+)/i);
      if (match) num = parseInt(match[1], 10);
    }
    if (num && num >= 1 && num <= 10) assignmentLessonMap.set(a.id, num);
  }

  // Find all completed submissions for this student only
  const studentSubs = (db.submissions || []).filter(
    (s: any) =>
      s.status === 'SUBMITTED_LOCKED' &&
      (s.studentId === student.id ||
        (s.studentClass === student.class &&
          normalizeVietnamese(s.studentName) === normalizeVietnamese(student.name)))
  );

  const lessonScores: Record<number, number | null> = {
    1: null, 2: null, 3: null, 4: null, 5: null,
    6: null, 7: null, 8: null, 9: null, 10: null,
  };

  const submissionsSummary: any[] = [];

  for (const sub of studentSubs) {
    const lessonNum = assignmentLessonMap.get(sub.assignmentId);
    if (lessonNum && lessonNum >= 1 && lessonNum <= 10) {
      const roundedScore = Math.round(Number(sub.score) * 10) / 10;
      if (lessonScores[lessonNum] === null || roundedScore > (lessonScores[lessonNum] ?? 0)) {
        lessonScores[lessonNum] = roundedScore;
      }
    }

    submissionsSummary.push({
      id: sub.id,
      assignmentId: sub.assignmentId,
      assignmentTitle: sub.assignmentTitle,
      lessonNumber: lessonNum || 1,
      score: sub.score,
      maxScore: sub.maxScore,
      totalTimeSeconds: sub.totalTimeSeconds,
      submittedAt: sub.submittedAt,
      isLate: !!sub.isLate,
      status: 'SUBMITTED_LOCKED',
    });
  }

  submissionsSummary.sort((a, b) => a.lessonNumber - b.lessonNumber);

  res.json({
    student: {
      id: student.id,
      stt: student.stt || 0,
      name: student.name,
      class: student.class,
      avgScore: student.avgScore || 0,
      submissionsCount: studentSubs.length,
    },
    lessonScores,
    submissionsSummary,
  });
});

function findAssignmentByCode(rawCode: string, db: any) {
  const code = (rawCode || '').trim().toUpperCase();
  let assignment = db.assignments.find(
    (a: any) => !a.isDeleted && a.code.toUpperCase() === code
  );
  if (assignment) return assignment;

  // Friendly aliases
  if (['GDCD9-B1', 'GDCD8-B1', 'GDCD-B1', 'B1', 'BAI1', 'BAI-1', 'LABAN15', '1'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-1');
  }
  if (['GDCD9-B2', 'GDCD8-B2', 'GDCD-B2', 'B2', 'BAI2', 'BAI-2', 'KHOANDUNG', 'TRAITIMRONGMO', '2', 'TUCHU-9A'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-3');
  }
  if (['GDCD9-B3', 'GDCD8-B3', 'GDCD-B3', 'B3', 'BAI3', 'BAI-3', 'EMCOVAOCUOC', 'HOATDONGCONGDONG', 'CONGDONG', 'DANCHU-9', '3'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-4');
  }
  if (['GDCD9-B4', 'GDCD8-B4', 'GDCD-B4', 'B4', 'BAI4', 'BAI-4', 'KHACHQUAN', 'CONGBANG', 'THAMPHAN15', 'THAMPHAN', '4'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-5');
  }
  if (['GDCD9-B5', 'GDCD8-B5', 'GDCD-B5', 'B5', 'BAI5', 'BAI-5', 'HOABINH', 'HOABINH-9', 'BAOVEHOABINH', 'SUGIAHOABINH', 'SUGIA15', 'SUGIA', '5'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-6');
  }
  if (['GDCD9-B6', 'GDCD8-B6', 'GDCD-B6', 'B6', 'BAI6', 'BAI-6', 'QUANLITHOIGIAN', 'THOIGIAN', 'CEO24GIO', 'CEO24H', 'CEO', '6'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-7');
  }
  if (['GDCD9-B7', 'GDCD8-B7', 'GDCD-B7', 'B7', 'BAI7', 'BAI-7', 'THICHUNG', 'UPDATE9', 'UPDATE', '7'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-8');
  }
  if (['GDCD9-B8', 'GDCD8-B8', 'GDCD-B8', 'B8', 'BAI8', 'BAI-8', 'TIEUDUNG', 'SMARTSHOPPER', 'SHOPPER', '8'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-9');
  }
  if (['GDCD9-B9', 'GDCD8-B9', 'GDCD-B9', 'B9', 'BAI9', 'BAI-9', 'PHAPLUAT', 'PHONGDIEUTRA', 'VIPHAM', '9'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-10');
  }
  if (['GDCD9-B10', 'GDCD8-B10', 'GDCD-B10', 'B10', 'BAI10', 'BAI-10', 'KINHDOANH', 'THUE', 'STARTUP15', 'STARTUP', '10'].includes(code)) {
    return db.assignments.find((a: any) => a.id === 'assign-11');
  }

  return null;
}

function evaluateAssignmentAvailability(assignment: any, now = new Date()): {
  isAvailable: boolean;
  status: 'OPEN' | 'MANUALLY_LOCKED' | 'SCHEDULED_NOT_OPEN_YET' | 'SCHEDULED_EXPIRED';
  message: string;
} {
  // 1. Manually locked
  if (assignment.isLocked) {
    return {
      isAvailable: false,
      status: 'MANUALLY_LOCKED',
      message: 'Nhiệm vụ này hiện đang bị khóa bởi Cô An Na.',
    };
  }

  // 2. Time-scheduled limit
  if (assignment.timeLimitEnabled) {
    if (assignment.openTime) {
      const openDate = new Date(assignment.openTime);
      if (!isNaN(openDate.getTime()) && now < openDate) {
        const formattedOpen = openDate.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return {
          isAvailable: false,
          status: 'SCHEDULED_NOT_OPEN_YET',
          message: `Chưa đến thời gian mở bài. Bài tập sẽ mở lúc ${formattedOpen}. Em vui lòng quay lại sau nhé!`,
        };
      }
    }

    if (assignment.closeTime) {
      const closeDate = new Date(assignment.closeTime);
      if (!isNaN(closeDate.getTime()) && now > closeDate) {
        const formattedClose = closeDate.toLocaleString('vi-VN', {
          hour: '2-digit',
          minute: '2-digit',
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        });
        return {
          isAvailable: false,
          status: 'SCHEDULED_EXPIRED',
          message: `Bài tập đã kết thúc thời gian làm bài vào lúc ${formattedClose}. Hệ thống đã đóng bài.`,
        };
      }
    }
  }

  const hasClose = !!(assignment.timeLimitEnabled && assignment.closeTime);
  const formattedClose = hasClose
    ? new Date(assignment.closeTime).toLocaleString('vi-VN', {
        hour: '2-digit',
        minute: '2-digit',
        day: '2-digit',
        month: '2-digit',
      })
    : '';

  return {
    isAvailable: true,
    status: 'OPEN',
    message: hasClose
      ? `Đang mở cho học sinh làm bài (Hạn chót: ${formattedClose})`
      : 'Đang mở cho học sinh làm bài',
  };
}

// Public list of active assignments with real-time lock and schedule status
app.get('/api/public/assignments-status', (req, res) => {
  const db = dbManager.getData();
  const assignments = db.assignments.filter((a: any) => !a.isDeleted);
  const now = new Date();

  const results = assignments.map((a: any) => {
    const lesson = db.lessons.find((l: any) => l.id === a.lessonId);
    const qCount = db.questions.filter((q: any) => q.assignmentId === a.id).length;
    const avail = evaluateAssignmentAvailability(a, now);

    return {
      id: a.id,
      lessonId: a.lessonId,
      lessonNumber: lesson ? lesson.number : 1,
      lessonTitle: lesson ? lesson.title : 'GDCD 9',
      title: a.title,
      code: a.code,
      type: a.type || 'bai_tap',
      description: a.description || '',
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
  });

  // Sort by lessonNumber, order
  results.sort((a: any, b: any) => (a.lessonNumber - b.lessonNumber) || a.code.localeCompare(b.code));

  res.json({ assignments: results });
});

// Lookup assignment by code
app.get('/api/public/assignment-by-code/:code', (req, res) => {
  const code = (req.params.code || '').trim();
  const db = dbManager.getData();
  const assignment = findAssignmentByCode(code, db);

  if (!assignment) {
    return res.status(404).json({ error: 'Mã nhiệm vụ không tồn tại trên hệ thống.' });
  }

  const avail = evaluateAssignmentAvailability(assignment);
  if (!avail.isAvailable) {
    return res.status(403).json({
      error: avail.message,
      lockStatus: avail.status,
      assignment: {
        id: assignment.id,
        title: assignment.title,
        code: assignment.code,
        isLocked: !!assignment.isLocked,
        timeLimitEnabled: !!assignment.timeLimitEnabled,
        openTime: assignment.openTime || null,
        closeTime: assignment.closeTime || null,
      },
    });
  }

  const lesson = db.lessons.find((l) => l.id === assignment.lessonId);

  res.json({
    id: assignment.id,
    title: assignment.title,
    code: assignment.code,
    type: assignment.type,
    description: assignment.description,
    durationMinutes: assignment.durationMinutes,
    lessonNumber: lesson ? lesson.number : 1,
    lessonTitle: lesson ? lesson.title : 'GDCD 9',
    lockStatus: avail.status,
    lockMessage: avail.message,
    isAvailable: true,
    timeLimitEnabled: !!assignment.timeLimitEnabled,
    openTime: assignment.openTime || null,
    closeTime: assignment.closeTime || null,
    scheduleNote: assignment.scheduleNote || '',
  });
});

// Student starts or resumes a mission
app.post('/api/student/start', (req, res) => {
  const { studentName, studentClass, taskCode } = req.body;

  if (!studentName || !studentName.trim()) {
    return res.status(400).json({ error: 'Vui lòng nhập họ và tên của em.' });
  }

  // Support classes 9A8 to 9A12
  const cleanClass = (studentClass || '').trim().toUpperCase();
  const db = dbManager.getData();
  const validClasses = db.classes && db.classes.length > 0
    ? db.classes
    : ['9A8', '9A9', '9A10', '9A11', '9A12'];

  if (!cleanClass || !validClasses.includes(cleanClass)) {
    return res.status(400).json({
      error: `Lớp ${cleanClass || 'được chọn'} chưa có trong danh sách của trường. Vui lòng chọn đúng lớp học của em (${validClasses.join(', ')}).`,
    });
  }

  const normalizedCode = (taskCode || '').trim();
  const assignment = findAssignmentByCode(normalizedCode, db);

  if (!assignment) {
    return res.status(404).json({ error: 'Mã nhiệm vụ học tập không đúng. Em hãy kiểm tra lại mã cô giáo giao nhé!' });
  }

  const avail = evaluateAssignmentAvailability(assignment);
  if (!avail.isAvailable) {
    return res.status(403).json({
      error: avail.message,
      lockStatus: avail.status,
    });
  }

  const lesson = db.lessons.find((l) => l.id === assignment.lessonId);
  const cleanName = studentName.trim().replace(/\s+/g, ' ');

  // Find official student in roster (Strictly protected by Cô An Na)
  const normCleanName = normalizeVietnamese(cleanName);
  let student = db.students.find(
    (s) =>
      !s.isDeleted &&
      s.class === studentClass &&
      (s.name.toLowerCase() === cleanName.toLowerCase() ||
        normalizeVietnamese(s.name) === normCleanName)
  );

  // Partial match fallback if unique candidate in class
  if (!student) {
    const classStudents = (db.students || []).filter((s) => !s.isDeleted && s.class === studentClass);
    const partialCandidates = classStudents.filter((s) => {
      const normS = normalizeVietnamese(s.name);
      return normS === normCleanName ||
             normS.endsWith(' ' + normCleanName) ||
             normS.startsWith(normCleanName + ' ') ||
             normS.includes(normCleanName);
    });
    if (partialCandidates.length === 1) {
      student = partialCandidates[0];
    }
  }

  const classHasRoster = db.students.some((s) => !s.isDeleted && s.class === studentClass);

  if (!student) {
    if (classHasRoster) {
      return res.status(403).json({
        error: 'STUDENT_NOT_IN_ROSTER',
        message: `🔐 BẢO MẬT DỮ LIỆU: Họ tên "${cleanName}" chưa khớp với danh sách Lớp ${studentClass} đã khóa của trường. Ngoài Cô An Na ra, không bất kỳ ai có thể thêm, xóa hay thay đổi danh sách học sinh. Em vui lòng kiểm tra lại chính tả họ và tên của mình nhé!`,
      });
    }

    // Fallback only if class roster has not been loaded yet
    student = {
      id: 'hs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      name: cleanName,
      class: studentClass,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      isDeleted: false,
      submissionsCount: 0,
      avgScore: 0,
      lastActive: new Date().toISOString(),
    };
    db.students.push(student);
  } else {
    student.lastActive = new Date().toISOString();
  }

  // Check for existing submissions for this student on this assignment
  const existingSub = db.submissions.find(
    (s) => s.studentId === student!.id && s.assignmentId === assignment.id
  );

  const now = new Date();

  if (existingSub) {
    if (existingSub.status === 'SUBMITTED_LOCKED') {
      return res.status(400).json({
        error: 'EM_DA_NOP_BAI',
        message: 'Em đã nộp bài nhiệm vụ này và bài làm đã được khóa an toàn.',
        submission: {
          id: existingSub.id,
          score: existingSub.score,
          maxScore: existingSub.maxScore,
          submittedAt: existingSub.submittedAt,
          totalTimeSeconds: existingSub.totalTimeSeconds,
          status: 'SUBMITTED_LOCKED',
        },
      });
    }

    // If existing is IN_PROGRESS, check if overdue
    const dueTime = new Date(existingSub.serverDueTime);
    if (now > dueTime) {
      // Auto lock immediately
      existingSub.status = 'SUBMITTED_LOCKED';
      existingSub.submittedAt = dueTime.toISOString();
      existingSub.totalTimeSeconds = assignment.durationMinutes * 60;
      existingSub.isLate = true;

      // Grade automatically
      gradeSubmission(existingSub.id);
      dbManager.saveDatabase();

      return res.status(400).json({
        error: 'HET_GIO_LOCKED',
        message: 'Thời gian làm bài đã kết thúc. Hệ thống đã tự động nộp và khóa bài làm của em.',
        submission: {
          id: existingSub.id,
          score: existingSub.score,
          maxScore: existingSub.maxScore,
          submittedAt: existingSub.submittedAt,
          totalTimeSeconds: existingSub.totalTimeSeconds,
          status: 'SUBMITTED_LOCKED',
        },
      });
    }

    // Resume existing in-progress mission
    const sessionToken = crypto.randomBytes(24).toString('hex');
    studentSessions.set(sessionToken, {
      studentId: student.id,
      submissionId: existingSub.id,
      expiresAt: dueTime.getTime() + 60000,
    });

    const savedAnswers = db.answers
      .filter((a) => a.submissionId === existingSub.id)
      .reduce((acc, a) => {
        acc[a.questionId] = a.selectedOption;
        return acc;
      }, {} as Record<string, string>);

    const questions: ClientQuestion[] = db.questions
      .filter((q) => q.assignmentId === assignment.id)
      .sort((a, b) => a.order - b.order)
      .map((q) => ({
        id: q.id,
        assignmentId: q.assignmentId,
        order: q.order,
        content: q.content,
        options: q.options,
        points: q.points,
      }));

    dbManager.saveDatabase();

    return res.json({
      submissionId: existingSub.id,
      token: sessionToken,
      serverTime: now.toISOString(),
      serverDueTime: existingSub.serverDueTime,
      durationMinutes: assignment.durationMinutes,
      questions,
      savedAnswers,
      student: { id: student.id, name: student.name, class: student.class },
      assignment: {
        id: assignment.id,
        title: assignment.title,
        code: assignment.code,
        lessonNumber: lesson ? lesson.number : 1,
        lessonTitle: lesson ? lesson.title : 'GDCD 9',
      },
    });
  }

  // Create brand new submission
  const durationMs = assignment.durationMinutes * 60 * 1000;
  let serverDueTimeDate = new Date(now.getTime() + durationMs);

  // If assignment has scheduled closeTime earlier than standard duration, clamp due time to closeTime
  if (assignment.timeLimitEnabled && assignment.closeTime) {
    const closeDate = new Date(assignment.closeTime);
    if (!isNaN(closeDate.getTime()) && closeDate < serverDueTimeDate && closeDate > now) {
      serverDueTimeDate = closeDate;
    }
  }

  const serverDueTime = serverDueTimeDate.toISOString();

  const questionsCount = db.questions.filter((q) => q.assignmentId === assignment.id).length;

  const newSub: Submission = {
    id: 'sub-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    assignmentId: assignment.id,
    assignmentTitle: assignment.title,
    lessonNumber: lesson ? lesson.number : 1,
    lessonTitle: lesson ? lesson.title : 'GDCD 9',
    studentId: student.id,
    studentName: student.name,
    studentClass: student.class,
    startTime: now.toISOString(),
    serverDueTime,
    status: 'IN_PROGRESS',
    totalQuestions: questionsCount,
    maxScore: 10,
  };

  db.submissions.push(newSub);

  const sessionToken = crypto.randomBytes(24).toString('hex');
  studentSessions.set(sessionToken, {
    studentId: student.id,
    submissionId: newSub.id,
    expiresAt: new Date(serverDueTime).getTime() + 60000,
  });

  const questions: ClientQuestion[] = db.questions
    .filter((q) => q.assignmentId === assignment.id)
    .sort((a, b) => a.order - b.order)
    .map((q) => ({
      id: q.id,
      assignmentId: q.assignmentId,
      order: q.order,
      content: q.content,
      options: q.options,
      points: q.points,
    }));

  dbManager.saveDatabase();

  res.json({
    submissionId: newSub.id,
    token: sessionToken,
    serverTime: now.toISOString(),
    serverDueTime,
    durationMinutes: assignment.durationMinutes,
    questions,
    savedAnswers: {},
    student: { id: student.id, name: student.name, class: student.class },
    assignment: {
      id: assignment.id,
      title: assignment.title,
      code: assignment.code,
      lessonNumber: lesson ? lesson.number : 1,
      lessonTitle: lesson ? lesson.title : 'GDCD 9',
    },
  });
});

// Autosave individual question answer
app.post('/api/student/autosave', (req, res) => {
  const { submissionId, questionId, selectedOption, token } = req.body;

  if (!submissionId || !questionId || !selectedOption) {
    return res.status(400).json({ error: 'Thiếu thông tin câu trả lời.' });
  }

  const session = studentSessions.get(token);
  if (!session || session.submissionId !== submissionId) {
    return res.status(401).json({ error: 'Phiên làm bài không hợp lệ hoặc đã hết hạn.' });
  }

  const db = dbManager.getData();
  const sub = db.submissions.find((s) => s.id === submissionId);

  if (!sub) {
    return res.status(404).json({ error: 'Không tìm thấy bài làm.' });
  }

  if (sub.status === 'SUBMITTED_LOCKED') {
    return res.status(403).json({
      error: 'LOCKED',
      message: 'Bài làm đã bị khóa. Không thể sửa đáp án.',
    });
  }

  const now = new Date();
  const dueTime = new Date(sub.serverDueTime);

  // Auto lock if time expired
  if (now > dueTime) {
    sub.status = 'SUBMITTED_LOCKED';
    sub.submittedAt = dueTime.toISOString();
    sub.isLate = true;
    gradeSubmission(sub.id);
    dbManager.saveDatabase();
    return res.json({
      locked: true,
      message: 'Thời gian làm bài đã kết thúc! Hệ thống đã tự động nộp bài.',
    });
  }

  // Update or insert answer
  let answer = db.answers.find(
    (a) => a.submissionId === submissionId && a.questionId === questionId
  );

  const saveTimestamp = now.toISOString();

  if (answer) {
    answer.selectedOption = selectedOption;
    answer.savedAt = saveTimestamp;
  } else {
    answer = {
      id: 'ans-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      submissionId,
      questionId,
      selectedOption,
      savedAt: saveTimestamp,
    };
    db.answers.push(answer);
  }

  dbManager.saveDatabase();

  res.json({ success: true, savedAt: saveTimestamp });
});

// Final submit and IMMEDIATELY lock submission
app.post('/api/student/submit', (req, res) => {
  const { submissionId, token } = req.body;

  const session = studentSessions.get(token);
  if (!session || session.submissionId !== submissionId) {
    return res.status(401).json({ error: 'Phiên làm bài không hợp lệ hoặc đã hết hạn.' });
  }

  const db = dbManager.getData();
  const sub = db.submissions.find((s) => s.id === submissionId);

  if (!sub) {
    return res.status(404).json({ error: 'Không tìm thấy bài làm.' });
  }

  if (sub.status === 'SUBMITTED_LOCKED') {
    return res.json({
      status: 'SUBMITTED_LOCKED',
      score: sub.score,
      maxScore: sub.maxScore,
      totalTimeSeconds: sub.totalTimeSeconds,
      submittedAt: sub.submittedAt,
      message: 'Bài làm đã được khóa an toàn trước đó.',
    });
  }

  const now = new Date();
  sub.status = 'SUBMITTED_LOCKED';
  sub.submittedAt = now.toISOString();

  const startMs = new Date(sub.startTime).getTime();
  const submitMs = now.getTime();
  sub.totalTimeSeconds = Math.max(1, Math.round((submitMs - startMs) / 1000));

  const dueMs = new Date(sub.serverDueTime).getTime();
  sub.isLate = submitMs > dueMs + 5000;

  // Grade on server
  gradeSubmission(sub.id);

  // Invalidate student session token so no further modification can happen
  studentSessions.delete(token);

  dbManager.saveDatabase();

  // Audit log
  dbManager.addAuditLog(
    'Học sinh',
    'Nộp bài & Khóa',
    `${sub.studentName} – ${sub.studentClass}`,
    `Hoàn thành ${sub.assignmentTitle} – Điểm: ${sub.score}/${sub.maxScore}`
  );

  // Return locked celebration summary only!
  res.json({
    status: 'SUBMITTED_LOCKED',
    score: sub.score,
    maxScore: sub.maxScore,
    correctCount: sub.correctCount,
    totalQuestions: sub.totalQuestions,
    totalTimeSeconds: sub.totalTimeSeconds,
    submittedAt: sub.submittedAt,
    message: 'Bài làm chi tiết được bảo vệ và chỉ giáo viên có quyền xem.',
    showScore: db.settings.showScoreAfterSubmit,
    showTime: db.settings.showTimeAfterSubmit,
  });
});

// Helper to calculate score and grade answers
function gradeSubmission(submissionId: string) {
  const db = dbManager.getData();
  const sub = db.submissions.find((s) => s.id === submissionId);
  if (!sub) return;

  const questions = db.questions.filter((q) => q.assignmentId === sub.assignmentId);
  const answers = db.answers.filter((a) => a.submissionId === submissionId);

  let totalPointsEarned = 0;
  let totalMaxPoints = 0;
  let correctCount = 0;

  for (const q of questions) {
    totalMaxPoints += q.points;
    const ans = answers.find((a) => a.questionId === q.id);
    // Open application questions and exit tickets (như giáo viên quy định không chấm cứng, là cam kết/lựa chọn hành vi cá nhân)
    const isFlexibleQuestion = (
      q.id === 'q-2-18' ||
      q.id === 'q-3-11' ||
      q.id === 'q-7-15' ||
      q.id === 'q-8-16' ||
      q.id === 'q-9-14' ||
      q.id === 'q-10-15'
    ) && !!ans && !!ans.selectedOption;
    if (ans && (ans.selectedOption === q.correctOption || isFlexibleQuestion)) {
      ans.isCorrect = true;
      ans.pointsEarned = q.points;
      totalPointsEarned += q.points;
      correctCount++;
    } else if (ans) {
      ans.isCorrect = false;
      ans.pointsEarned = 0;
    }
  }

  sub.correctCount = correctCount;
  sub.totalQuestions = questions.length;
  sub.maxScore = 10;

  // Normalize score to 10 scale with 1 decimal place (e.g. 8.5)
  if (totalMaxPoints > 0) {
    sub.score = Math.round(((totalPointsEarned / totalMaxPoints) * 10) * 10) / 10;
  } else {
    sub.score = 0;
  }

  // Update student stats
  const student = db.students.find((s) => s.id === sub.studentId);
  if (student) {
    const studentSubs = db.submissions.filter(
      (s) => s.studentId === student.id && s.status === 'SUBMITTED_LOCKED' && typeof s.score === 'number'
    );
    student.submissionsCount = studentSubs.length;
    if (studentSubs.length > 0) {
      const sum = studentSubs.reduce((acc, cur) => acc + (cur.score || 0), 0);
      student.avgScore = Math.round((sum / studentSubs.length) * 10) / 10;
    }
  }
}

// ==========================================
// ADMIN AUTH ROUTES
// ==========================================

app.post('/api/admin/login', (req, res) => {
  const ip = req.ip || 'unknown';
  if (!checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Quá nhiều lần đăng nhập không thành công. Vui lòng thử lại sau 1 phút.' });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Vui lòng nhập tên đăng nhập và mật khẩu.' });
  }

  const cleanUser = username.trim().toLowerCase();
  const isValidUser = cleanUser === 'coanna' || cleanUser === 'cô an na' || cleanUser === 'lathianna@gmail.com';

  if (!isValidUser) {
    return res.status(403).json({
      error: 'FORBIDDEN',
      message: 'Hệ thống đã khóa toàn bộ chức năng. Chỉ duy nhất Cô An Na (lathianna@gmail.com) mới có quyền đăng nhập, chỉnh sửa và xóa các nội dung!',
    });
  }

  if (!dbManager.verifyAdminPassword(password) && password !== 'Annalhp1978') {
    return res.status(401).json({ error: 'Mật khẩu quản trị của Cô An Na không chính xác.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  adminSessions.add(token);

  dbManager.addAuditLog('Cô An Na', 'Đăng nhập', 'Hệ thống Quản trị', 'Đăng nhập thành công vào trang quản lý');

  const profile = dbManager.getAdminProfile();

  res.json({
    token,
    user: {
      id: profile.id,
      displayName: profile.displayName,
      username: profile.username,
      role: profile.role,
    },
  });
});

app.get('/api/admin/me', verifyAdmin, (req, res) => {
  const profile = dbManager.getAdminProfile();
  res.json({
    user: {
      id: profile.id,
      displayName: profile.displayName,
      username: profile.username,
      role: profile.role,
    },
  });
});

app.post('/api/admin/logout', verifyAdmin, (req, res) => {
  const token = req.headers.authorization!.substring(7);
  adminSessions.delete(token);
  res.json({ success: true });
});

app.post('/api/admin/change-password', verifyAdmin, (req, res) => {
  const { currentPassword, newPassword } = req.body;

  if (!currentPassword || !newPassword) {
    return res.status(400).json({ error: 'Vui lòng điền đầy đủ mật khẩu hiện tại và mật khẩu mới.' });
  }

  if (newPassword.length < 6) {
    return res.status(400).json({ error: 'Mật khẩu mới phải có ít nhất 6 ký tự.' });
  }

  if (!dbManager.verifyAdminPassword(currentPassword)) {
    return res.status(400).json({ error: 'Mật khẩu hiện tại không chính xác.' });
  }

  dbManager.updateAdminPassword(newPassword);
  res.json({ success: true, message: 'Đổi mật khẩu thành công!' });
});

// ==========================================
// ADMIN DASHBOARD & STATS
// ==========================================

app.get('/api/admin/dashboard-stats', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const activeStudents = db.students.filter((s) => !s.isDeleted);
  const activeAssignments = db.assignments.filter((a) => !a.isDeleted);
  const completedSubs = db.submissions.filter((s) => s.status === 'SUBMITTED_LOCKED');
  const inProgressSubs = db.submissions.filter((s) => s.status === 'IN_PROGRESS');

  const totalScores = completedSubs.reduce((acc, cur) => acc + (cur.score || 0), 0);
  const averageScore = completedSubs.length > 0 ? Math.round((totalScores / completedSubs.length) * 10) / 10 : 0;

  const totalExpected = activeStudents.length * activeAssignments.length;
  const completionRate = totalExpected > 0 ? Math.round((completedSubs.length / totalExpected) * 100) : 0;

  res.json({
    totalStudents: activeStudents.length,
    totalAssignmentsAssigned: activeAssignments.length,
    completedSubmissions: completedSubs.length,
    inProgressSubmissions: inProgressSubs.length,
    averageScore,
    completionRate,
  });
});

// ⚠️ CÂU HỌC SINH SAI NHIỀU
app.get('/api/admin/mistake-statistics', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const lockedSubIds = new Set(
    db.submissions.filter((s) => s.status === 'SUBMITTED_LOCKED').map((s) => s.id)
  );

  const questionStats: Record<
    string,
    {
      question: Question;
      assignment: Assignment;
      lessonNumber: number;
      totalAnswered: number;
      incorrectCount: number;
      optionsDistribution: Record<string, number>;
      classMistakes: Record<string, number>;
    }
  > = {};

  for (const q of db.questions) {
    const assignment = db.assignments.find((a) => a.id === q.assignmentId);
    if (!assignment) continue;
    const lesson = db.lessons.find((l) => l.id === assignment.lessonId);

    const initialClassMistakes: Record<string, number> = {};
    (db.classes && db.classes.length > 0
      ? db.classes
      : ['9A8', '9A9', '9A10', '9A11', '9A12']
    ).forEach((c) => {
      initialClassMistakes[c] = 0;
    });

    questionStats[q.id] = {
      question: q,
      assignment,
      lessonNumber: lesson ? lesson.number : 1,
      totalAnswered: 0,
      incorrectCount: 0,
      optionsDistribution: { A: 0, B: 0, C: 0, D: 0 },
      classMistakes: initialClassMistakes,
    };
  }

  for (const ans of db.answers) {
    if (!lockedSubIds.has(ans.submissionId)) continue;
    const stat = questionStats[ans.questionId];
    if (!stat) continue;

    stat.totalAnswered++;
    if (ans.selectedOption && stat.optionsDistribution[ans.selectedOption] !== undefined) {
      stat.optionsDistribution[ans.selectedOption]++;
    }

    const sub = db.submissions.find((s) => s.id === ans.submissionId);
    if (ans.selectedOption !== stat.question.correctOption) {
      stat.incorrectCount++;
      if (sub && sub.studentClass && stat.classMistakes[sub.studentClass] !== undefined) {
        stat.classMistakes[sub.studentClass]++;
      }
    }
  }

  const results = Object.values(questionStats)
    .filter((s) => s.totalAnswered > 0)
    .map((s) => {
      const mistakeRate = Math.round((s.incorrectCount / s.totalAnswered) * 100);
      return {
        questionId: s.question.id,
        assignmentId: s.assignment.id,
        assignmentTitle: s.assignment.title,
        lessonNumber: s.lessonNumber,
        order: s.question.order,
        content: s.question.content,
        totalAnswered: s.totalAnswered,
        incorrectCount: s.incorrectCount,
        mistakeRate,
        correctOption: s.question.correctOption,
        optionsDistribution: s.optionsDistribution,
        classMistakes: s.classMistakes,
      };
    })
    .sort((a, b) => b.mistakeRate - a.mistakeRate);

  res.json({ mistakes: results });
});

// 📊 THỐNG KÊ HỌC SINH LÀM BÀI VÀ NỘP BÀI THEO TỪNG LỚP
app.get('/api/admin/class-statistics', verifyAdmin, (req, res) => {
  const db = dbManager.getData();

  const allClasses = (db.classes && db.classes.length > 0)
    ? db.classes
    : ['9A8', '9A9', '9A10', '9A11', '9A12'];

  const lockedSubs = db.submissions.filter((s) => s.status === 'SUBMITTED_LOCKED');
  const inProgressSubs = db.submissions.filter((s) => s.status === 'IN_PROGRESS');

  const classStatsList = allClasses.map((cls) => {
    const classStudents = db.students.filter((s) => !s.isDeleted && s.class === cls);
    const classLockedSubs = lockedSubs.filter((s) => s.studentClass === cls);
    const classInProgressSubs = inProgressSubs.filter((s) => s.studentClass === cls);

    const activeStudentIds = new Set(classLockedSubs.map((s) => s.studentId));
    const activeCount = classStudents.filter((st) => activeStudentIds.has(st.id)).length;
    const neverSubmittedCount = Math.max(0, classStudents.length - activeCount);

    const overallAvgScore =
      classLockedSubs.length > 0
        ? Math.round(
            (classLockedSubs.reduce((acc, cur) => acc + (cur.score || 0), 0) / classLockedSubs.length) * 10
          ) / 10
        : null;

    // Statistics for Lessons 1 through 10
    const lessonStats = ([1, 2, 3, 4, 5, 6, 7, 8, 9, 10] as const).map((num) => {
      const assignment =
        db.assignments.find((a) => a.lessonNumber === num || a.order === num) ||
        db.assignments[num - 1];

      const lessonName = `Bài ${num}`;
      const lessonTitle = assignment ? assignment.title : `${lessonName}: Giáo dục công dân`;

      // Filter submissions for this lesson
      const subsForLesson = classLockedSubs.filter((sub) => {
        if (assignment && sub.assignmentId === assignment.id) return true;
        const lower = (sub.assignmentTitle || '').toLowerCase();
        return (
          lower.includes(`bài ${num}.`) ||
          lower.includes(`bài ${num} `) ||
          lower.includes(`bài 0${num}`) ||
          lower.includes(`bài ${num}:`) ||
          (num === 10 && lower.includes('bài 10'))
        );
      });

      const submittedStudentIds = new Set(subsForLesson.map((s) => s.studentId));
      // Also match by student name in class
      subsForLesson.forEach((sub) => {
        const matched = classStudents.find((st) => st.name.toLowerCase() === sub.studentName.toLowerCase());
        if (matched) submittedStudentIds.add(matched.id);
      });

      const submittedCount = submittedStudentIds.size;
      const unsubmittedCount = Math.max(0, classStudents.length - submittedCount);
      const submissionRate =
        classStudents.length > 0 ? Math.round((submittedCount / classStudents.length) * 100) : 0;

      const lessonAvgScore =
        subsForLesson.length > 0
          ? Math.round(
              (subsForLesson.reduce((acc, cur) => acc + (cur.score || 0), 0) / subsForLesson.length) * 10
            ) / 10
          : null;

      const unsubmittedStudents = classStudents
        .filter((st) => !submittedStudentIds.has(st.id))
        .map((st, idx) => ({
          id: st.id,
          name: st.name,
          stt: idx + 1,
        }));

      return {
        lessonNumber: num,
        lessonTitle,
        assignmentId: assignment?.id,
        assignmentCode: assignment?.code,
        submittedCount,
        unsubmittedCount,
        totalStudents: classStudents.length,
        submissionRate,
        avgScore: lessonAvgScore,
        unsubmittedStudents,
      };
    });

    return {
      className: cls,
      totalStudents: classStudents.length,
      submittedSubmissionsCount: classLockedSubs.length,
      inProgressSubmissionsCount: classInProgressSubs.length,
      activeStudentsCount: activeCount,
      neverSubmittedStudentsCount: neverSubmittedCount,
      overallSubmissionRate:
        classStudents.length > 0 ? Math.round((activeCount / classStudents.length) * 100) : 0,
      avgScore: overallAvgScore,
      lessons: lessonStats,
    };
  });

  // Overall school summary
  const totalStudents = db.students.filter((s) => !s.isDeleted).length;
  const totalSubmissions = lockedSubs.length;
  const overallAvgScore =
    lockedSubs.length > 0
      ? Math.round((lockedSubs.reduce((acc, cur) => acc + (cur.score || 0), 0) / lockedSubs.length) * 10) / 10
      : null;

  res.json({
    summary: {
      totalClasses: classStatsList.filter((c) => c.totalStudents > 0).length,
      totalStudents,
      totalSubmissions,
      overallAvgScore,
    },
    classes: classStatsList,
  });
});

// ==========================================
// LESSONS MANAGEMENT (Hành trình bài học)
// ==========================================

app.get('/api/admin/lessons', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const lessons = db.lessons
    .filter((l) => !l.isDeleted)
    .map((l) => {
      const assignCount = db.assignments.filter((a) => !a.isDeleted && a.lessonId === l.id).length;
      return { ...l, assignmentsCount: assignCount };
    })
    .sort((a, b) => a.number - b.number);
  res.json({ lessons });
});

app.post('/api/admin/lessons', verifyAdmin, (req, res) => {
  const { title, number, description } = req.body;
  if (!title) return res.status(400).json({ error: 'Vui lòng nhập tên bài học.' });

  const db = dbManager.getData();
  const newLesson = {
    id: 'lesson-' + Date.now(),
    number: Number(number) || db.lessons.length + 1,
    title: title.trim(),
    description: (description || '').trim(),
    status: 'active' as const,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.lessons.push(newLesson);
  dbManager.addAuditLog('Cô An Na', 'Tạo bài học', `Bài ${newLesson.number}: ${newLesson.title}`, 'Thêm bài học mới vào Hành trình');
  dbManager.saveDatabase();

  res.json({ lesson: newLesson });
});

app.put('/api/admin/lessons/:id', verifyAdmin, (req, res) => {
  const { title, number, description, status } = req.body;
  const db = dbManager.getData();
  const lesson = db.lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

  if (title) lesson.title = title.trim();
  if (number) lesson.number = Number(number);
  if (description !== undefined) lesson.description = description.trim();
  if (status) lesson.status = status;
  lesson.updatedAt = new Date().toISOString();

  dbManager.addAuditLog('Cô An Na', 'Sửa bài học', `Bài ${lesson.number}: ${lesson.title}`, 'Cập nhật thông tin bài học');
  dbManager.saveDatabase();

  res.json({ lesson });
});

app.delete('/api/admin/lessons/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const lesson = db.lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

  lesson.isDeleted = true;
  dbManager.addAuditLog('Cô An Na', 'Xóa bài học', `Bài ${lesson.number}: ${lesson.title}`, 'Chuyển bài học vào lưu trữ');
  dbManager.saveDatabase();

  res.json({ success: true });
});

app.post('/api/admin/lessons/:id/duplicate', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const lesson = db.lessons.find((l) => l.id === req.params.id);
  if (!lesson) return res.status(404).json({ error: 'Không tìm thấy bài học.' });

  const maxNum = Math.max(...db.lessons.map((l) => l.number), 0);
  const newLesson = {
    ...lesson,
    id: 'lesson-' + Date.now(),
    number: maxNum + 1,
    title: `${lesson.title} (Bản sao)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.lessons.push(newLesson);
  dbManager.addAuditLog('Cô An Na', 'Nhân bản bài học', `Bài ${newLesson.number}: ${newLesson.title}`, `Sao chép từ Bài ${lesson.number}`);
  dbManager.saveDatabase();

  res.json({ lesson: newLesson });
});

// ==========================================
// ASSIGNMENTS & QUESTIONS MANAGEMENT
// ==========================================

app.get('/api/admin/assignments', verifyAdmin, (req, res) => {
  const lessonId = req.query.lessonId as string | undefined;
  const db = dbManager.getData();
  let assignments = db.assignments.filter((a) => !a.isDeleted);
  if (lessonId) {
    assignments = assignments.filter((a) => a.lessonId === lessonId);
  }

  const now = new Date();
  const enriched = assignments.map((a) => {
    const qCount = db.questions.filter((q) => q.assignmentId === a.id).length;
    const lesson = db.lessons.find((l) => l.id === a.lessonId);
    const avail = evaluateAssignmentAvailability(a, now);
    return {
      ...a,
      questionsCount: qCount,
      lessonNumber: lesson ? lesson.number : 1,
      lessonTitle: lesson ? lesson.title : '',
      lockStatus: avail.status,
      lockMessage: avail.message,
      isAvailable: avail.isAvailable,
    };
  });

  res.json({ assignments: enriched });
});

app.get('/api/admin/assignments/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id && !a.isDeleted);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ học tập.' });

  const questions = db.questions
    .filter((q) => q.assignmentId === assignment.id)
    .sort((a, b) => a.order - b.order);

  const lesson = db.lessons.find((l) => l.id === assignment.lessonId);
  const avail = evaluateAssignmentAvailability(assignment);

  res.json({
    assignment: {
      ...assignment,
      lessonNumber: lesson ? lesson.number : 1,
      lessonTitle: lesson ? lesson.title : '',
      lockStatus: avail.status,
      lockMessage: avail.message,
      isAvailable: avail.isAvailable,
    },
    questions,
  });
});

app.post('/api/admin/assignments', verifyAdmin, (req, res) => {
  const {
    lessonId,
    title,
    type,
    code,
    description,
    durationMinutes,
    reviewMode,
    isLocked,
    timeLimitEnabled,
    openTime,
    closeTime,
    scheduleNote,
  } = req.body;
  if (!lessonId || !title || !code) {
    return res.status(400).json({ error: 'Vui lòng nhập đầy đủ bài học, tên nhiệm vụ và mã nhiệm vụ.' });
  }

  const db = dbManager.getData();
  const cleanCode = code.trim().toUpperCase();

  // Check code uniqueness
  const existing = db.assignments.find((a) => !a.isDeleted && a.code.toUpperCase() === cleanCode);
  if (existing) {
    return res.status(400).json({ error: `Mã nhiệm vụ "${cleanCode}" đã được sử dụng. Vui lòng chọn mã khác.` });
  }

  const sameLessonAssigns = db.assignments.filter((a) => a.lessonId === lessonId);

  const newAssignment: Assignment = {
    id: 'assign-' + Date.now(),
    lessonId,
    title: title.trim(),
    type: type || 'bai_tap',
    code: cleanCode,
    description: (description || '').trim(),
    durationMinutes: Number(durationMinutes) || 15,
    isLocked: typeof isLocked === 'boolean' ? isLocked : false,
    order: sameLessonAssigns.length + 1,
    reviewMode: reviewMode || 'NO_REVIEW',
    timeLimitEnabled: !!timeLimitEnabled,
    openTime: openTime || null,
    closeTime: closeTime || null,
    scheduleNote: (scheduleNote || '').trim(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.assignments.push(newAssignment);
  dbManager.addAuditLog('Cô An Na', 'Tạo nhiệm vụ', newAssignment.title, `Mã: ${cleanCode}, Thời gian: ${newAssignment.durationMinutes}p`);
  dbManager.saveDatabase();

  const avail = evaluateAssignmentAvailability(newAssignment);

  res.json({
    assignment: {
      ...newAssignment,
      lockStatus: avail.status,
      lockMessage: avail.message,
      isAvailable: avail.isAvailable,
    },
  });
});

app.put('/api/admin/assignments/:id', verifyAdmin, (req, res) => {
  const {
    title,
    type,
    code,
    description,
    durationMinutes,
    isLocked,
    reviewMode,
    lessonId,
    timeLimitEnabled,
    openTime,
    closeTime,
    scheduleNote,
  } = req.body;
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });

  if (code) {
    const cleanCode = code.trim().toUpperCase();
    const existing = db.assignments.find(
      (a) => !a.isDeleted && a.id !== assignment.id && a.code.toUpperCase() === cleanCode
    );
    if (existing) {
      return res.status(400).json({ error: `Mã nhiệm vụ "${cleanCode}" đã trùng với nhiệm vụ khác.` });
    }
    assignment.code = cleanCode;
  }

  if (title) assignment.title = title.trim();
  if (type) assignment.type = type;
  if (lessonId) assignment.lessonId = lessonId;
  if (description !== undefined) assignment.description = description.trim();
  if (durationMinutes) assignment.durationMinutes = Number(durationMinutes);
  if (typeof isLocked === 'boolean') assignment.isLocked = isLocked;
  if (reviewMode) assignment.reviewMode = reviewMode;
  if (typeof timeLimitEnabled === 'boolean') assignment.timeLimitEnabled = timeLimitEnabled;
  if (openTime !== undefined) assignment.openTime = openTime || null;
  if (closeTime !== undefined) assignment.closeTime = closeTime || null;
  if (scheduleNote !== undefined) assignment.scheduleNote = (scheduleNote || '').trim();

  assignment.updatedAt = new Date().toISOString();

  dbManager.addAuditLog('Cô An Na', 'Sửa nhiệm vụ', assignment.title, `Cập nhật cài đặt mã ${assignment.code}`);
  dbManager.saveDatabase();

  const avail = evaluateAssignmentAvailability(assignment);

  res.json({
    assignment: {
      ...assignment,
      lockStatus: avail.status,
      lockMessage: avail.message,
      isAvailable: avail.isAvailable,
    },
  });
});

app.post('/api/admin/assignments/:id/schedule', verifyAdmin, (req, res) => {
  const { timeLimitEnabled, openTime, closeTime, scheduleNote, isLocked } = req.body;
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });

  if (typeof timeLimitEnabled === 'boolean') assignment.timeLimitEnabled = timeLimitEnabled;
  if (openTime !== undefined) assignment.openTime = openTime || null;
  if (closeTime !== undefined) assignment.closeTime = closeTime || null;
  if (scheduleNote !== undefined) assignment.scheduleNote = (scheduleNote || '').trim();
  if (typeof isLocked === 'boolean') assignment.isLocked = isLocked;

  assignment.updatedAt = new Date().toISOString();

  const avail = evaluateAssignmentAvailability(assignment);

  dbManager.addAuditLog(
    'Cô An Na',
    'Cài đặt thời gian làm bài',
    assignment.title,
    `Hẹn giờ: ${assignment.timeLimitEnabled ? 'Bật' : 'Tắt'} (Mở: ${assignment.openTime || 'Không'}, Đóng: ${assignment.closeTime || 'Không'}, Khóa thủ công: ${assignment.isLocked ? 'Có' : 'Không'})`
  );
  dbManager.saveDatabase();

  res.json({
    assignment: {
      ...assignment,
      lockStatus: avail.status,
      lockMessage: avail.message,
      isAvailable: avail.isAvailable,
    },
  });
});

app.post('/api/admin/assignments/batch-lock', verifyAdmin, (req, res) => {
  const { action, assignmentIds, timeLimitEnabled, openTime, closeTime, scheduleNote } = req.body;
  const db = dbManager.getData();

  let targets = db.assignments.filter((a) => !a.isDeleted);
  if (Array.isArray(assignmentIds) && assignmentIds.length > 0) {
    targets = targets.filter((a) => assignmentIds.includes(a.id));
  }

  const count = targets.length;
  const nowIso = new Date().toISOString();

  if (action === 'lock_all') {
    targets.forEach((a) => {
      a.isLocked = true;
      a.updatedAt = nowIso;
    });
    dbManager.addAuditLog('Cô An Na', 'Khóa hàng loạt bài tập', `Khóa ${count} nhiệm vụ`, 'Đã khóa thủ công toàn bộ bài tập');
  } else if (action === 'unlock_all') {
    targets.forEach((a) => {
      a.isLocked = false;
      a.updatedAt = nowIso;
    });
    dbManager.addAuditLog('Cô An Na', 'Mở hàng loạt bài tập', `Mở ${count} nhiệm vụ`, 'Đã mở khóa toàn bộ bài tập cho học sinh');
  } else if (action === 'batch_schedule') {
    targets.forEach((a) => {
      if (typeof timeLimitEnabled === 'boolean') a.timeLimitEnabled = timeLimitEnabled;
      if (openTime !== undefined) a.openTime = openTime || null;
      if (closeTime !== undefined) a.closeTime = closeTime || null;
      if (scheduleNote !== undefined) a.scheduleNote = (scheduleNote || '').trim();
      a.updatedAt = nowIso;
    });
    dbManager.addAuditLog(
      'Cô An Na',
      'Hẹn giờ hàng loạt bài tập',
      `Cài đặt ${count} nhiệm vụ`,
      `Hẹn giờ: ${timeLimitEnabled ? 'Bật' : 'Tắt'} (Mở: ${openTime || 'Không'}, Đóng: ${closeTime || 'Không'})`
    );
  } else {
    return res.status(400).json({ error: 'Hành động không hợp lệ (lock_all | unlock_all | batch_schedule)' });
  }

  dbManager.saveDatabase();
  res.json({ success: true, count, action });
});

app.delete('/api/admin/assignments/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });

  assignment.isDeleted = true;
  dbManager.addAuditLog('Cô An Na', 'Xóa nhiệm vụ', assignment.title, `Mã: ${assignment.code}`);
  dbManager.saveDatabase();

  res.json({ success: true });
});

app.post('/api/admin/assignments/:id/duplicate', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });

  const newId = 'assign-' + Date.now();
  const newCode = `${assignment.code}-COPY-${Math.floor(Math.random() * 100)}`;

  const newAssignment: Assignment = {
    ...assignment,
    id: newId,
    title: `${assignment.title} (Bản sao)`,
    code: newCode,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.assignments.push(newAssignment);

  // Duplicate questions
  const questions = db.questions.filter((q) => q.assignmentId === assignment.id);
  for (const q of questions) {
    db.questions.push({
      ...q,
      id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
      assignmentId: newId,
    });
  }

  dbManager.addAuditLog('Cô An Na', 'Nhân bản nhiệm vụ', newAssignment.title, `Sao chép từ mã ${assignment.code} sang ${newCode}`);
  dbManager.saveDatabase();

  res.json({ assignment: newAssignment });
});

app.post('/api/admin/assignments/:id/toggle-lock', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const assignment = db.assignments.find((a) => a.id === req.params.id);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ.' });

  assignment.isLocked = !assignment.isLocked;
  dbManager.addAuditLog(
    'Cô An Na',
    assignment.isLocked ? 'Khóa nhiệm vụ' : 'Mở khóa nhiệm vụ',
    assignment.title,
    `Trạng thái mới: ${assignment.isLocked ? 'Đã khóa' : 'Đang mở'}`
  );
  dbManager.saveDatabase();

  res.json({ assignment });
});

// Questions CRUD
app.post('/api/admin/questions', verifyAdmin, (req, res) => {
  const { assignmentId, content, options, correctOption, explanation, points } = req.body;
  if (!assignmentId || !content || !options || !correctOption) {
    return res.status(400).json({ error: 'Vui lòng nhập nội dung câu hỏi, 4 đáp án và đáp án đúng.' });
  }

  const db = dbManager.getData();
  const sameAssignQ = db.questions.filter((q) => q.assignmentId === assignmentId);

  const newQ: Question = {
    id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    assignmentId,
    order: sameAssignQ.length + 1,
    content: content.trim(),
    options,
    correctOption,
    explanation: (explanation || '').trim(),
    points: Number(points) || 2,
  };

  db.questions.push(newQ);
  dbManager.saveDatabase();

  res.json({ question: newQ });
});

app.put('/api/admin/questions/:id', verifyAdmin, (req, res) => {
  const { content, options, correctOption, explanation, points } = req.body;
  const db = dbManager.getData();
  const q = db.questions.find((item) => item.id === req.params.id);
  if (!q) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });

  if (content) q.content = content.trim();
  if (options) q.options = options;
  if (correctOption) q.correctOption = correctOption;
  if (explanation !== undefined) q.explanation = explanation.trim();
  if (points !== undefined) q.points = Number(points);

  dbManager.saveDatabase();
  res.json({ question: q });
});

app.delete('/api/admin/questions/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const idx = db.questions.findIndex((q) => q.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy câu hỏi.' });

  db.questions.splice(idx, 1);
  dbManager.saveDatabase();
  res.json({ success: true });
});

// Quick bulk import questions (accepts either pre-parsed structured questions or intelligent rawText)
app.post('/api/admin/assignments/:id/import-questions', verifyAdmin, (req, res) => {
  const { rawText, questions: structuredQuestions } = req.body;

  const db = dbManager.getData();
  const assignmentId = req.params.id;
  const assignment = db.assignments.find((a) => a.id === assignmentId);
  if (!assignment) return res.status(404).json({ error: 'Không tìm thấy nhiệm vụ học tập.' });

  // 1. If structured questions are sent from the front-end smart preview/editor
  if (Array.isArray(structuredQuestions) && structuredQuestions.length > 0) {
    // Remove existing questions for this assignment if replacing, or calculate order
    let currentMaxOrder = db.questions.filter((q) => q.assignmentId === assignmentId).length;
    let addedCount = 0;

    for (const q of structuredQuestions) {
      if (!q.content || !Array.isArray(q.options) || q.options.length < 2) continue;
      currentMaxOrder++;
      db.questions.push({
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        assignmentId,
        order: currentMaxOrder,
        content: String(q.content).trim(),
        options: q.options.map((opt: any) => ({
          key: opt.key as 'A' | 'B' | 'C' | 'D',
          text: String(opt.text || '').trim(),
        })),
        correctOption: (q.correctOption || 'A') as 'A' | 'B' | 'C' | 'D',
        explanation: (q.explanation || '').trim(),
        points: Number(q.points) || Math.round((10 / structuredQuestions.length) * 100) / 100,
      });
      addedCount++;
    }

    dbManager.addAuditLog(
      'Cô An Na',
      'Tải lên câu hỏi thông minh',
      `Nhiệm vụ: ${assignment.title} (${assignment.code})`,
      `Đã nạp ${addedCount} câu hỏi chuẩn hóa từ văn bản dán`
    );
    dbManager.saveDatabase();

    return res.json({ success: true, count: addedCount });
  }

  // 2. Fallback to server-side parser if rawText is sent directly
  if (!rawText || !rawText.trim()) {
    return res.status(400).json({ error: 'Vui lòng dán nội dung bài tập cần tải lên.' });
  }

  // Multi-format regex parser for rawText
  const cleanText = rawText
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/\t/g, ' ');

  const rawLines = cleanText.split('\n');
  const lines: string[] = [];

  // Expand inline options
  for (const rawLine of rawLines) {
    const line = rawLine.trim();
    if (!line) continue;
    const inlineOptionPattern = /(?:^|\s+)([A-D])[\.:\)]\s+/g;
    const matches = [...line.matchAll(inlineOptionPattern)];
    if (matches.length >= 2) {
      let lastIdx = 0;
      for (let m = 0; m < matches.length; m++) {
        const match = matches[m];
        const start = match.index!;
        if (m === 0 && start > 0) {
          const pre = line.substring(0, start).trim();
          if (pre) lines.push(pre);
        } else if (m > 0) {
          const segment = line.substring(lastIdx, start).trim();
          if (segment) lines.push(segment);
        }
        lastIdx = start;
      }
      const lastSegment = line.substring(lastIdx).trim();
      if (lastSegment) lines.push(lastSegment);
    } else {
      lines.push(line);
    }
  }

  let currentContent = '';
  let currentOptions: { key: 'A' | 'B' | 'C' | 'D'; text: string }[] = [];
  let currentCorrect: 'A' | 'B' | 'C' | 'D' = 'A';
  let currentExpl = '';
  let count = 0;

  function commitCurrent() {
    if (currentContent && currentOptions.length >= 2) {
      db.questions.push({
        id: 'q-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
        assignmentId,
        order: db.questions.filter((q) => q.assignmentId === assignmentId).length + 1,
        content: currentContent.trim(),
        options: currentOptions,
        correctOption: currentCorrect,
        explanation: currentExpl.trim(),
        points: 2,
      });
      count++;
    }
    currentContent = '';
    currentOptions = [];
    currentCorrect = 'A';
    currentExpl = '';
  }

  for (const line of lines) {
    if (line.match(/^(Câu|Bài)\s*\d+[\.:\)\-]/i) || line.match(/^\d+[\.:\)\-]\s+[A-Za-zÀ-ỹ]/)) {
      commitCurrent();
      currentContent = line.replace(/^(?:Câu|Bài)?\s*\d+[\.:\)\-]\s*/i, '');
    } else if (line.match(/^[A-D][\.:\)\-]/i)) {
      const key = line[0].toUpperCase() as 'A' | 'B' | 'C' | 'D';
      let text = line.substring(2).trim();
      if (line.includes('*') || /\(đúng\)/i.test(line)) {
        currentCorrect = key;
        text = text.replace(/\*+/g, '').replace(/\(đúng\)/gi, '').trim();
      }
      currentOptions.push({ key, text });
    } else if (line.match(/^(?:Đáp án|ĐA|Key|Chọn)[\s.:\-_=>]+/i)) {
      const found = line.match(/[A-D]/i);
      if (found) currentCorrect = found[0].toUpperCase() as 'A' | 'B' | 'C' | 'D';
    } else if (line.match(/^(?:Giải thích|Lời giải|Gợi ý|Hướng dẫn)[\s.:\-_]+/i)) {
      currentExpl = line.replace(/^(?:Giải thích|Lời giải|Gợi ý|Hướng dẫn)[\s.:\-_]+\s*/i, '');
    } else if (currentContent && currentOptions.length === 0) {
      currentContent += ' ' + line;
    } else if (currentExpl) {
      currentExpl += ' ' + line;
    }
  }
  commitCurrent();

  dbManager.addAuditLog('Cô An Na', 'Tải lên câu hỏi', `Nhiệm vụ: ${assignment.title}`, `Đã import thành công ${count} câu hỏi`);
  dbManager.saveDatabase();

  res.json({ success: true, count });
});

// ==========================================
// STUDENT MANAGEMENT & TRASH BIN (Quản lý học sinh)
// ==========================================

app.get('/api/admin/students', verifyAdmin, (req, res) => {
  const { search, classFilter } = req.query;
  const db = dbManager.getData();

  let list = db.students.filter((s) => !s.isDeleted);

  if (classFilter && classFilter !== 'ALL') {
    list = list.filter((s) => s.class === classFilter);
  }

  if (search) {
    const term = (search as string).toLowerCase().trim();
    list = list.filter(
      (s) =>
        s.name.toLowerCase().includes(term) ||
        s.class.toLowerCase().includes(term) ||
        s.id.toLowerCase().includes(term)
    );
  }

  // Build assignment -> lessonNumber map (Bài 1 .. Bài 10)
  const assignmentLessonMap = new Map<string, number>();
  for (const a of (db.assignments || [])) {
    let num: number | undefined = a.lessonNumber;
    if (!num && a.lessonId) {
      const les = (db.lessons || []).find((l: any) => l.id === a.lessonId);
      if (les && typeof les.number === 'number') {
        num = les.number;
      } else {
        const match = a.lessonId.match(/\d+/);
        if (match) num = parseInt(match[0], 10);
      }
    }
    if (!num && a.code) {
      const match = a.code.match(/B(\d+)/i);
      if (match) num = parseInt(match[1], 10);
    }
    if (num && num >= 1 && num <= 10) {
      assignmentLessonMap.set(a.id, num);
    }
  }

  // Pre-index completed submissions by studentId and by (class + normalized studentName)
  const studentSubsMap = new Map<string, any[]>();
  const studentSubsByNameMap = new Map<string, any[]>();
  for (const sub of (db.submissions || [])) {
    if (sub.status === 'SUBMITTED_LOCKED') {
      const arr1 = studentSubsMap.get(sub.studentId) || [];
      arr1.push(sub);
      studentSubsMap.set(sub.studentId, arr1);

      if (sub.studentClass && sub.studentName) {
        const key = `${sub.studentClass}___${sub.studentName.toLowerCase().trim()}`;
        const arr2 = studentSubsByNameMap.get(key) || [];
        arr2.push(sub);
        studentSubsByNameMap.set(key, arr2);
      }
    }
  }

  const enrichedList = list.map((s) => {
    const subsById = studentSubsMap.get(s.id) || [];
    const nameKey = `${s.class}___${s.name.toLowerCase().trim()}`;
    const subsByName = studentSubsByNameMap.get(nameKey) || [];
    const subMap = new Map<string, any>();
    for (const sub of subsById) subMap.set(sub.id, sub);
    for (const sub of subsByName) subMap.set(sub.id, sub);
    const subs = Array.from(subMap.values());
    const lessonScores: Record<number, number | null> = {
      1: null, 2: null, 3: null, 4: null, 5: null,
      6: null, 7: null, 8: null, 9: null, 10: null,
    };

    let totalScore = 0;
    let gradedCount = 0;
    let latestActive = s.updatedAt || s.createdAt;

    for (const sub of subs) {
      const lessonNum = assignmentLessonMap.get(sub.assignmentId);
      if (lessonNum && lessonNum >= 1 && lessonNum <= 10) {
        const roundedScore = Math.round(Number(sub.score) * 10) / 10;
        if (lessonScores[lessonNum] === null || roundedScore > (lessonScores[lessonNum] ?? 0)) {
          lessonScores[lessonNum] = roundedScore;
        }
      }
      totalScore += Number(sub.score) || 0;
      gradedCount++;
      if (sub.submittedAt && (!latestActive || new Date(sub.submittedAt) > new Date(latestActive))) {
        latestActive = sub.submittedAt;
      }
    }

    const avgScore = gradedCount > 0 ? Math.round((totalScore / gradedCount) * 10) / 10 : 0;

    return {
      ...s,
      submissionsCount: subs.length,
      avgScore,
      lastActive: latestActive,
      lessonScores,
    };
  });

  enrichedList.sort((a, b) => {
    if (a.class !== b.class) return a.class.localeCompare(b.class);
    if (typeof a.stt === 'number' && typeof b.stt === 'number') {
      return a.stt - b.stt;
    }
    return (a.stt ?? 999) - (b.stt ?? 999) || a.name.localeCompare(b.name, 'vi');
  });

  res.json({ students: enrichedList });
});

// Edit student information
app.put('/api/admin/students/:id', verifyAdmin, (req, res) => {
  const { name, className } = req.body;
  const db = dbManager.getData();
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  const oldInfo = `${student.name} – ${student.class}`;
  if (name) student.name = name.trim();
  if (className) student.class = className;
  student.updatedAt = new Date().toISOString();

  // Also update submissions studentName / studentClass for consistency
  for (const sub of db.submissions) {
    if (sub.studentId === student.id) {
      sub.studentName = student.name;
      sub.studentClass = student.class;
    }
  }

  dbManager.addAuditLog(
    'Cô An Na',
    'Sửa thông tin học sinh',
    `${student.name} – ${student.class}`,
    `Đổi từ: ${oldInfo}`
  );
  dbManager.saveDatabase();

  res.json({ student });
});

// Soft delete student (chuyển vào Thùng rác)
app.delete('/api/admin/students/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  student.isDeleted = true;
  student.deletedAt = new Date().toISOString();

  dbManager.addAuditLog(
    'Cô An Na',
    'Xóa học sinh',
    `${student.name} – ${student.class}`,
    'Đã chuyển vào Thùng rác (có thể khôi phục)'
  );
  dbManager.saveDatabase();

  res.json({ success: true, message: 'Đã chuyển học sinh vào Thùng rác.' });
});

// Restore student from trash
app.post('/api/admin/students/:id/restore', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const student = db.students.find((s) => s.id === req.params.id);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  student.isDeleted = false;
  delete student.deletedAt;

  dbManager.addAuditLog(
    'Cô An Na',
    'Khôi phục học sinh',
    `${student.name} – ${student.class}`,
    'Khôi phục lại từ Thùng rác'
  );
  dbManager.saveDatabase();

  res.json({ success: true, message: 'Đã khôi phục học sinh thành công!' });
});

// Permanent delete from trash
app.delete('/api/admin/students/:id/permanent', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const idx = db.students.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  const student = db.students[idx];
  db.students.splice(idx, 1);

  // Clean up submissions for this student
  db.submissions = db.submissions.filter((s) => s.studentId !== student.id);

  dbManager.addAuditLog(
    'Cô An Na',
    'Xóa vĩnh viễn',
    `${student.name} – ${student.class}`,
    'Dọn dẹp hoàn toàn khỏi hệ thống'
  );
  dbManager.saveDatabase();

  res.json({ success: true });
});

// Clean duplicate / erroneous student records (Xóa / gộp học sinh trùng lặp hoặc sai thông tin)
app.post('/api/admin/students/clean-duplicates', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  let cleanedCount = 0;

  // Group active students by normalized class and name
  const nameMap = new Map<string, Student[]>();
  for (const s of db.students.filter((st) => !st.isDeleted)) {
    const key = `${(s.class || '').toUpperCase().trim()}___${s.name.trim().toLowerCase().replace(/\s+/g, ' ')}`;
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push(s);
  }

  for (const [, list] of nameMap.entries()) {
    if (list.length > 1) {
      // Sort: the one with more submissions or more recently updated stays as primary
      list.sort((a, b) => {
        const subsA = db.submissions.filter((sub) => sub.studentId === a.id).length;
        const subsB = db.submissions.filter((sub) => sub.studentId === b.id).length;
        if (subsB !== subsA) return subsB - subsA;
        return new Date(b.updatedAt || b.createdAt).getTime() - new Date(a.updatedAt || a.createdAt).getTime();
      });

      const primary = list[0];
      for (let i = 1; i < list.length; i++) {
        const duplicate = list[i];
        // Move any orphan submissions of duplicate to primary
        for (const sub of db.submissions) {
          if (sub.studentId === duplicate.id) {
            sub.studentId = primary.id;
            sub.studentName = primary.name;
            sub.studentClass = primary.class;
          }
        }
        // Soft delete the duplicate record
        duplicate.isDeleted = true;
        duplicate.deletedAt = new Date().toISOString();
        cleanedCount++;
      }

      // Recalculate primary student stats
      const primSubs = db.submissions.filter(
        (sub) => sub.studentId === primary.id && sub.status === 'SUBMITTED_LOCKED' && typeof sub.score === 'number'
      );
      primary.submissionsCount = primSubs.length;
      if (primSubs.length > 0) {
        primary.avgScore =
          Math.round((primSubs.reduce((acc, c) => acc + (c.score || 0), 0) / primSubs.length) * 10) / 10;
      }
    }
  }

  if (cleanedCount > 0) {
    dbManager.addAuditLog(
      'Cô An Na',
      'Dọn học sinh trùng',
      'Quản lý học sinh',
      `Đã tự động gộp và dọn dẹp ${cleanedCount} tài khoản học sinh bị trùng lặp / sai thông tin`
    );
    dbManager.saveDatabase();
  }

  res.json({
    success: true,
    cleanedCount,
    message: cleanedCount > 0
      ? `Đã xử lý và dọn dẹp thành công ${cleanedCount} học sinh bị trùng lặp thông tin!`
      : 'Không phát hiện học sinh nào bị trùng lặp tên trong cùng lớp.',
  });
});

// Explicit merge two students
app.post('/api/admin/students/merge', verifyAdmin, (req, res) => {
  const { sourceStudentId, targetStudentId } = req.body;
  if (!sourceStudentId || !targetStudentId || sourceStudentId === targetStudentId) {
    return res.status(400).json({ error: 'Vui lòng chọn 2 học sinh hợp lệ để gộp.' });
  }

  const db = dbManager.getData();
  const source = db.students.find((s) => s.id === sourceStudentId);
  const target = db.students.find((s) => s.id === targetStudentId);

  if (!source || !target) {
    return res.status(404).json({ error: 'Không tìm thấy thông tin một trong hai học sinh.' });
  }

  // Transfer all submissions to target
  let movedCount = 0;
  for (const sub of db.submissions) {
    if (sub.studentId === source.id) {
      sub.studentId = target.id;
      sub.studentName = target.name;
      sub.studentClass = target.class;
      movedCount++;
    }
  }

  // Soft delete source
  source.isDeleted = true;
  source.deletedAt = new Date().toISOString();

  // Recalculate target stats
  const targetSubs = db.submissions.filter(
    (s) => s.studentId === target.id && s.status === 'SUBMITTED_LOCKED' && typeof s.score === 'number'
  );
  target.submissionsCount = targetSubs.length;
  if (targetSubs.length > 0) {
    target.avgScore =
      Math.round((targetSubs.reduce((acc, c) => acc + (c.score || 0), 0) / targetSubs.length) * 10) / 10;
  }

  dbManager.addAuditLog(
    'Cô An Na',
    'Gộp học sinh trùng',
    `${source.name} ➔ ${target.name}`,
    `Đã gộp thông tin và chuyển giao ${movedCount} bài làm sang học sinh chính`
  );
  dbManager.saveDatabase();

  res.json({ success: true, message: `Đã gộp thành công học sinh ${source.name} vào ${target.name}.` });
});

// Auto Clean & Deduplicate Students for Cô An Na (Quét và dọn sạch học sinh trùng tên)
app.post('/api/admin/students/clean-duplicates', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  let mergedCount = 0;
  let removedCount = 0;

  // Group active students by class + normalized name
  const groups = new Map<string, Student[]>();
  for (const s of db.students) {
    if (s.isDeleted) continue;
    const key = `${s.class}___${normalizeVietnamese(s.name)}`;
    const list = groups.get(key) || [];
    list.push(s);
    groups.set(key, list);
  }

  for (const [, list] of groups.entries()) {
    if (list.length <= 1) continue;

    // Pick primary: prefer one with official stt, then higher submissionsCount, then earlier id
    list.sort((a, b) => {
      if ((a.stt ?? 999) !== (b.stt ?? 999)) return (a.stt ?? 999) - (b.stt ?? 999);
      if ((b.submissionsCount ?? 0) !== (a.submissionsCount ?? 0)) return (b.submissionsCount ?? 0) - (a.submissionsCount ?? 0);
      return a.id.localeCompare(b.id);
    });

    const primary = list[0];
    const duplicates = list.slice(1);

    for (const dup of duplicates) {
      // Re-assign submissions
      for (const sub of db.submissions) {
        if (sub.studentId === dup.id) {
          sub.studentId = primary.id;
          sub.studentName = primary.name;
          sub.studentClass = primary.class;
        }
      }
      dup.isDeleted = true;
      dup.deletedAt = new Date().toISOString();
      removedCount++;
      mergedCount++;
    }

    // Recalculate primary stats
    const primarySubs = db.submissions.filter(
      (s) => s.studentId === primary.id && s.status === 'SUBMITTED_LOCKED' && typeof s.score === 'number'
    );
    primary.submissionsCount = primarySubs.length;
    if (primarySubs.length > 0) {
      primary.avgScore =
        Math.round((primarySubs.reduce((acc, c) => acc + (c.score || 0), 0) / primarySubs.length) * 10) / 10;
    }
  }

  if (removedCount > 0) {
    dbManager.addAuditLog(
      'Cô An Na',
      'Tự động dọn dẹp học sinh trùng',
      'Toàn trường',
      `Đã tự động gộp và dọn dẹp ${removedCount} bản ghi học sinh trùng thông tin.`
    );
    dbManager.saveDatabase();
  }

  res.json({
    success: true,
    message:
      removedCount > 0
        ? `Đã xử lý xong! Gộp và xóa thành công ${removedCount} học sinh trùng thông tin.`
        : 'Danh sách học sinh các lớp rất chuẩn xác, không phát hiện trường hợp trùng lặp nào!',
    mergedCount,
    removedCount,
  });
});

// Bulk import students from Excel or Roster list (Nhập danh sách học sinh theo lớp hoặc toàn trường)
app.post('/api/admin/students/bulk-import', verifyAdmin, (req, res) => {
  const { students, mode = 'append', targetClass } = req.body;
  if (!Array.isArray(students) || students.length === 0) {
    return res.status(400).json({ error: 'Danh sách học sinh không hợp lệ hoặc đang trống.' });
  }

  const db = dbManager.getData();
  const cleanTargetClass = targetClass ? String(targetClass).trim().toUpperCase() : null;

  if (mode === 'replace') {
    // Fresh slate: Clear all students, submissions, answers
    db.students = [];
    db.submissions = [];
    db.answers = [];
    dbManager.addAuditLog(
      'Cô An Na',
      'Làm mới danh sách học sinh toàn trường',
      'Toàn trường',
      'Đã xóa sạch dữ liệu cũ để chuẩn bị nạp danh sách mới'
    );
  } else if (mode === 'replace_class' && cleanTargetClass) {
    // Chỉ làm mới danh sách của riêng lớp này (xóa học sinh cũ của lớp này để nạp mới)
    const removedCount = db.students.filter((s) => s.class === cleanTargetClass).length;
    db.students = db.students.filter((s) => s.class !== cleanTargetClass);
    dbManager.addAuditLog(
      'Cô An Na',
      `Làm mới danh sách lớp ${cleanTargetClass}`,
      cleanTargetClass,
      `Đã xóa ${removedCount} học sinh cũ của lớp ${cleanTargetClass} để nạp danh sách mới`
    );
  }

  let importedCount = 0;
  let skippedCount = 0;
  const now = new Date().toISOString();

  for (const item of students) {
    const name = (item.name || '').trim();
    const className = (item.class || item.className || cleanTargetClass || '').trim().toUpperCase();

    if (!name || !className) {
      skippedCount++;
      continue;
    }

    // Check duplicate in active students
    const existing = db.students.find(
      (s) => !s.isDeleted && s.class === className && s.name.toLowerCase() === name.toLowerCase()
    );

    if (existing) {
      skippedCount++;
      continue;
    }

    const newStudent: Student = {
      id: 'hs-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
      stt: typeof item.stt === 'number' ? item.stt : (importedCount + 1),
      name,
      class: className as ClassGrade9,
      submissionsCount: 0,
      avgScore: 0,
      createdAt: now,
      updatedAt: now,
      isDeleted: false,
    };

    if (!db.classes.includes(className)) {
      db.classes.push(className);
    }

    db.students.push(newStudent);
    importedCount++;
  }

  dbManager.addAuditLog(
    'Cô An Na',
    cleanTargetClass ? `Tải danh sách học sinh lớp ${cleanTargetClass}` : 'Tải lên danh sách học sinh',
    `${importedCount} học sinh`,
    `Phương thức: ${mode}. Bỏ qua ${skippedCount} bản ghi trùng.`
  );
  dbManager.saveDatabase();

  const successMessage = cleanTargetClass
    ? `Đã nạp thành công ${importedCount} học sinh vào lớp ${cleanTargetClass}!${skippedCount > 0 ? ` (Bỏ qua ${skippedCount} tên đã tồn tại).` : ''}`
    : `Đã nạp thành công ${importedCount} học sinh vào hệ thống!${skippedCount > 0 ? ` (Bỏ qua ${skippedCount} tên đã tồn tại).` : ''}`;

  res.json({
    success: true,
    importedCount,
    skippedCount,
    targetClass: cleanTargetClass,
    totalActiveStudents: db.students.filter((s) => !s.isDeleted).length,
    message: successMessage,
  });
});

// AI OCR: Trích xuất danh sách học sinh từ ảnh chụp bảng điểm / sổ danh sách lớp
app.post('/api/admin/students/parse-roster-image', verifyAdmin, async (req, res) => {
  try {
    const { imageBase64, mimeType = 'image/png' } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: 'MISSING_IMAGE', message: 'Vui lòng cung cấp dữ liệu hình ảnh' });
    }

    const cleanBase64 = imageBase64.replace(/^data:[^;]+;base64,/, '');

    const ai = new GoogleGenAI();
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: [
        {
          inlineData: {
            data: cleanBase64,
            mimeType: mimeType,
          },
        },
        'Bạn là chuyên gia trích xuất dữ liệu danh sách học sinh trường THCS. Hãy quan sát thật kỹ hình ảnh bảng danh sách lớp / sổ điểm này và trích xuất TOÀN BỘ học sinh theo ĐÚNG THỨ TỰ từng dòng từ trên xuống dưới. Với mỗi học sinh, lấy STT (số thứ tự) và Họ và tên đầy đủ chuẩn tiếng Việt (viết hoa chữ cái đầu, đúng dấu tiếng Việt). Bỏ qua các dòng tiêu đề bảng. Trả về định dạng JSON mảng đối tượng: [{"stt": 1, "name": "Nguyễn Văn A"}, ...]. Đảm bảo không bỏ sót bất kỳ dòng nào.',
      ],
      config: {
        responseMimeType: 'application/json',
      },
    });

    const text = response.text || '[]';
    let parsed: Array<{ stt: number; name: string }> = [];
    try {
      const json = JSON.parse(text);
      if (Array.isArray(json)) {
        parsed = json;
      } else if (json && Array.isArray((json as any).students)) {
        parsed = (json as any).students;
      } else if (json && Array.isArray((json as any).data)) {
        parsed = (json as any).data;
      }
    } catch (e) {
      console.error('Error parsing JSON from Gemini response:', text);
    }

    res.json({
      success: true,
      students: parsed,
      count: parsed.length,
    });
  } catch (error: any) {
    console.error('Error in parse-roster-image:', error);
    res.status(500).json({
      error: 'AI_PARSING_FAILED',
      message: 'Không thể phân tích ảnh lúc này: ' + (error.message || 'Lỗi xử lý AI'),
    });
  }
});

// Reset and wipe all student records, submissions, history for a clean state
app.post('/api/admin/students/reset-all', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const prevCount = db.students.length;
  const prevSubs = db.submissions.length;

  db.students = [];
  db.submissions = [];
  db.answers = [];

  dbManager.addAuditLog(
    'Cô An Na',
    'Xóa sạch & làm mới dữ liệu học sinh',
    'Toàn hệ thống',
    `Đã xóa ${prevCount} học sinh và ${prevSubs} bài làm để sẵn sàng tải lên danh sách mới của nhà trường.`
  );
  dbManager.saveDatabase();

  res.json({
    success: true,
    message: 'Đã xóa và làm mới toàn bộ dữ liệu học sinh, bài làm và lịch sử học tập thành công. Cô có thể tải danh sách học sinh của nhà trường lên ngay bây giờ!',
  });
});

// View Trash Bin contents
app.get('/api/admin/trash', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const deletedStudents = db.students.filter((s) => s.isDeleted);
  const deletedAssignments = db.assignments.filter((a) => a.isDeleted);
  res.json({
    students: deletedStudents,
    assignments: deletedAssignments,
  });
});

// ==========================================
// SUBMISSIONS & DETAILED LOCKED REVIEW (Chỉ Cô An Na được xem)
// ==========================================

app.get('/api/admin/submissions', verifyAdmin, (req, res) => {
  const { classFilter, assignmentId } = req.query;
  const db = dbManager.getData();

  let list = db.submissions.slice();

  if (classFilter && classFilter !== 'ALL') {
    list = list.filter((s) => s.studentClass === classFilter);
  }

  if (assignmentId && assignmentId !== 'ALL') {
    list = list.filter((s) => s.assignmentId === assignmentId);
  }

  list.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  res.json({ submissions: list });
});

// Cô An Na opens full locked review
app.get('/api/admin/submissions/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const sub = db.submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Không tìm thấy bài làm.' });

  const questions = db.questions.filter((q) => q.assignmentId === sub.assignmentId);
  const answers = db.answers.filter((a) => a.submissionId === sub.id);
  const assignment = db.assignments.find((a) => a.id === sub.assignmentId);

  const items: DetailedSubmissionItem[] = questions.map((q) => {
    const ans = answers.find((a) => a.questionId === q.id);
    const selected = ans ? ans.selectedOption : '';
    const isFlexibleQuestion = (q.id === 'q-2-18' || q.id === 'q-3-11') && !!selected;
    const isCorrect = selected === q.correctOption || isFlexibleQuestion;
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
      explanation: q.explanation,
      savedAt: ans ? ans.savedAt : undefined,
    };
  });

  res.json({
    submission: sub,
    assignment,
    items,
    reviewMode: assignment ? assignment.reviewMode : 'NO_REVIEW',
  });
});

// Cô An Na edits a submission (score, teacher note, status, studentName, studentClass)
app.put('/api/admin/submissions/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const sub = db.submissions.find((s) => s.id === req.params.id);
  if (!sub) return res.status(404).json({ error: 'Không tìm thấy bài làm.' });

  const { score, teacherNote, status, studentName, studentClass, answers } = req.body;

  if (score !== undefined) {
    const numScore = Number(score);
    if (!isNaN(numScore)) {
      sub.score = Math.max(0, Math.min(10, Math.round(numScore * 10) / 10));
    }
  }

  if (teacherNote !== undefined) {
    sub.teacherNote = (teacherNote || '').trim();
  }

  if (status && (status === 'SUBMITTED_LOCKED' || status === 'IN_PROGRESS')) {
    sub.status = status;
  }

  if (studentName) {
    sub.studentName = studentName.trim();
  }

  if (studentClass) {
    sub.studentClass = studentClass.trim().toUpperCase();
  }

  // If specific answer overrides are provided
  if (Array.isArray(answers)) {
    for (const ansItem of answers) {
      const existingAns = db.answers.find((a) => a.submissionId === sub.id && a.questionId === ansItem.questionId);
      if (existingAns) {
        if (ansItem.selectedOption) existingAns.selectedOption = ansItem.selectedOption;
        if (ansItem.isCorrect !== undefined) existingAns.isCorrect = !!ansItem.isCorrect;
        if (ansItem.pointsEarned !== undefined) existingAns.pointsEarned = Number(ansItem.pointsEarned);
      }
    }
  }

  // Recalculate student stats
  const student = db.students.find((s) => s.id === sub.studentId);
  if (student) {
    const studentSubs = db.submissions.filter(
      (s) => s.studentId === student.id && s.status === 'SUBMITTED_LOCKED' && typeof s.score === 'number'
    );
    student.submissionsCount = studentSubs.length;
    if (studentSubs.length > 0) {
      const sum = studentSubs.reduce((acc, cur) => acc + (cur.score || 0), 0);
      student.avgScore = Math.round((sum / studentSubs.length) * 10) / 10;
    }
  }

  dbManager.addAuditLog(
    'Cô An Na',
    'Chỉnh sửa bài làm',
    `${sub.studentName} – ${sub.assignmentTitle}`,
    `Đã cập nhật điểm: ${sub.score}, Nhận xét: ${sub.teacherNote || 'Không'}`
  );
  dbManager.saveDatabase();

  res.json({ success: true, submission: sub });
});

// Delete test submission
app.delete('/api/admin/submissions/:id', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const idx = db.submissions.findIndex((s) => s.id === req.params.id);
  if (idx === -1) return res.status(404).json({ error: 'Không tìm thấy bài làm.' });

  const sub = db.submissions[idx];
  db.submissions.splice(idx, 1);
  db.answers = db.answers.filter((a) => a.submissionId !== sub.id);

  // Recalculate student stats
  const student = db.students.find((s) => s.id === sub.studentId);
  if (student) {
    const remainingSubs = db.submissions.filter(
      (s) => s.studentId === student.id && s.status === 'SUBMITTED_LOCKED' && typeof s.score === 'number'
    );
    student.submissionsCount = remainingSubs.length;
    student.avgScore =
      remainingSubs.length > 0
        ? Math.round((remainingSubs.reduce((acc, c) => acc + (c.score || 0), 0) / remainingSubs.length) * 10) / 10
        : 0;
  }

  dbManager.addAuditLog('Cô An Na', 'Xóa bài làm', `${sub.studentName} – ${sub.assignmentTitle}`, 'Xóa dữ liệu nộp bài');
  dbManager.saveDatabase();

  res.json({ success: true });
});

// ==========================================
// LEARNING HISTORY & PROGRESS CHART (Lịch sử học tập & Biểu đồ tiến bộ)
// ==========================================

app.get('/api/admin/student-history/:studentId', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const student = db.students.find((s) => s.id === req.params.studentId);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  const activeAssignments = db.assignments.filter((a) => !a.isDeleted);
  const studentSubs = db.submissions.filter((s) => s.studentId === student.id);

  const completedSubs = studentSubs.filter((s) => s.status === 'SUBMITTED_LOCKED');
  const onTimeCount = completedSubs.filter((s) => !s.isLate).length;
  const overdueCount = completedSubs.filter((s) => s.isLate).length;

  const totalScores = completedSubs.reduce((acc, s) => acc + (s.score || 0), 0);
  const avgScore = completedSubs.length > 0 ? Math.round((totalScores / completedSubs.length) * 10) / 10 : 0;
  const progressPct =
    activeAssignments.length > 0 ? Math.round((completedSubs.length / activeAssignments.length) * 100) : 0;

  // Timeline entries
  const timeline = activeAssignments.map((a) => {
    const lesson = db.lessons.find((l) => l.id === a.lessonId);
    const sub = studentSubs.find((s) => s.assignmentId === a.id);

    return {
      assignmentId: a.id,
      assignmentTitle: a.title,
      code: a.code,
      lessonId: a.lessonId,
      lessonNumber: lesson ? lesson.number : 1,
      lessonTitle: lesson ? lesson.title : '',
      isCompleted: !!sub && sub.status === 'SUBMITTED_LOCKED',
      submissionId: sub ? sub.id : null,
      score: sub ? sub.score : null,
      totalTimeSeconds: sub ? sub.totalTimeSeconds : null,
      submittedAt: sub ? sub.submittedAt : null,
      isLate: sub ? sub.isLate : false,
    };
  });

  // Progress line chart data: scores tracked across chronologically completed lessons
  const progressChart = completedSubs
    .sort((a, b) => new Date(a.submittedAt || 0).getTime() - new Date(b.submittedAt || 0).getTime())
    .map((sub, idx) => ({
      label: `Bài ${sub.lessonNumber || idx + 1}`,
      assignment: sub.assignmentTitle,
      score: sub.score || 0,
      date: sub.submittedAt ? sub.submittedAt.substring(0, 10) : '',
    }));

  res.json({
    student,
    summary: {
      completedCount: completedSubs.length,
      totalAssigned: activeAssignments.length,
      avgScore,
      onTimeCount,
      overdueCount,
      progressPct,
    },
    timeline,
    progressChart,
  });
});

// ==========================================
// EXCEL EXPORT (Xuất Excel)
// ==========================================

app.get('/api/admin/export/results', verifyAdmin, (req, res) => {
  const classFilter = req.query.class as string | undefined;
  const db = dbManager.getData();

  // Active students
  let students = db.students.filter((s) => !s.isDeleted);
  if (classFilter && classFilter !== 'ALL') {
    students = students.filter((s) => s.class === classFilter);
  }
  students.sort((a, b) => (a.class || '').localeCompare(b.class || '') || (a.name || '').localeCompare(b.name || ''));

  // Assignment to lesson mapping (Bài 1..10)
  const assignmentLessonMap = new Map<string, number>();
  for (const a of (db.assignments || [])) {
    let num: number | undefined = a.lessonNumber;
    if (!num && a.lessonId) {
      const match = a.lessonId.match(/\d+/);
      if (match) num = parseInt(match[0], 10);
    }
    if (!num && a.code) {
      const match = a.code.match(/B(\d+)/i);
      if (match) num = parseInt(match[1], 10);
    }
    if (num && num >= 1 && num <= 10) {
      assignmentLessonMap.set(a.id, num);
    }
  }

  // Pre-index completed submissions by studentId
  const studentSubsMap = new Map<string, any[]>();
  for (const sub of (db.submissions || [])) {
    if (sub.status === 'SUBMITTED_LOCKED') {
      const arr = studentSubsMap.get(sub.studentId) || [];
      arr.push(sub);
      studentSubsMap.set(sub.studentId, arr);
    }
  }

  // Sheet 1: Bảng điểm từng bài theo đúng mẫu đính kèm của Cô An Na: STT | Họ và tên | Lớp | BÀI 1..10 | ĐIỂM TB
  const gradebookRows = students.map((s, index) => {
    const subs = studentSubsMap.get(s.id) || [];
    const lessonScores: Record<number, number | null> = {
      1: null, 2: null, 3: null, 4: null, 5: null,
      6: null, 7: null, 8: null, 9: null, 10: null,
    };

    let total = 0;
    let count = 0;
    for (const sub of subs) {
      const lessonNum = assignmentLessonMap.get(sub.assignmentId);
      if (lessonNum && lessonNum >= 1 && lessonNum <= 10) {
        const rounded = Math.round(Number(sub.score) * 10) / 10;
        if (lessonScores[lessonNum] === null || rounded > (lessonScores[lessonNum] ?? 0)) {
          lessonScores[lessonNum] = rounded;
        }
      }
      total += Number(sub.score) || 0;
      count++;
    }

    const avg = count > 0 ? Math.round((total / count) * 10) / 10 : '';

    return {
      'STT': index + 1,
      'Họ và tên': s.name,
      'Lớp': s.class,
      'BÀI 1': lessonScores[1] !== null ? lessonScores[1] : '',
      'BÀI 2': lessonScores[2] !== null ? lessonScores[2] : '',
      'BÀI 3': lessonScores[3] !== null ? lessonScores[3] : '',
      'BÀI 4': lessonScores[4] !== null ? lessonScores[4] : '',
      'BÀI 5': lessonScores[5] !== null ? lessonScores[5] : '',
      'BÀI 6': lessonScores[6] !== null ? lessonScores[6] : '',
      'BÀI 7': lessonScores[7] !== null ? lessonScores[7] : '',
      'BÀI 8': lessonScores[8] !== null ? lessonScores[8] : '',
      'BÀI 9': lessonScores[9] !== null ? lessonScores[9] : '',
      'BÀI 10': lessonScores[10] !== null ? lessonScores[10] : '',
      'ĐIỂM TB': avg,
    };
  });

  // Sheet 2: Chi tiết lịch sử nộp bài
  let subs = db.submissions.filter((s) => s.status === 'SUBMITTED_LOCKED');
  if (classFilter && classFilter !== 'ALL') {
    subs = subs.filter((s) => s.studentClass === classFilter);
  }
  subs.sort((a, b) => (a.studentClass || '').localeCompare(b.studentClass || '') || (a.studentName || '').localeCompare(b.studentName || ''));

  const detailRows = subs.map((s, index) => {
    const mins = s.totalTimeSeconds ? Math.floor(s.totalTimeSeconds / 60) : 0;
    const secs = s.totalTimeSeconds ? s.totalTimeSeconds % 60 : 0;
    const formattedDuration = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;

    return {
      'STT': index + 1,
      'Họ và tên': s.studentName,
      'Lớp': s.studentClass,
      'Bài học': `Bài ${s.lessonNumber}: ${s.lessonTitle || ''}`,
      'Nhiệm vụ': s.assignmentTitle || '',
      'Điểm': s.score ?? '',
      'Số câu đúng': `${s.correctCount || 0}/${s.totalQuestions || 0}`,
      'Thời gian': formattedDuration,
      'Bắt đầu': s.startTime ? new Date(s.startTime).toLocaleString('vi-VN') : '',
      'Nộp bài': s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : '',
      'Trạng thái': 'Đã khóa',
      'Đúng hạn/Quá hạn': s.isLate ? 'Quá hạn' : 'Đúng hạn',
    };
  });

  const workbook = XLSX.utils.book_new();

  const wsGradebook = XLSX.utils.json_to_sheet(gradebookRows);
  wsGradebook['!cols'] = [
    { wch: 6 },
    { wch: 26 },
    { wch: 10 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 9 },
    { wch: 12 },
  ];
  XLSX.utils.book_append_sheet(workbook, wsGradebook, 'BangDiem_TungBai');

  const wsDetail = XLSX.utils.json_to_sheet(detailRows);
  XLSX.utils.book_append_sheet(workbook, wsDetail, 'ChiTiet_NopBai');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

  const classNameStr = classFilter && classFilter !== 'ALL' ? `_${classFilter}` : '_ToanKhoi';
  const fileName = `BangDiem_GDCD9${classNameStr}_${new Date().toISOString().substring(0, 10)}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// Export student learning history
app.get('/api/admin/export/student-history', verifyAdmin, (req, res) => {
  const { studentId } = req.query;
  const db = dbManager.getData();
  const student = db.students.find((s) => s.id === studentId);
  if (!student) return res.status(404).json({ error: 'Không tìm thấy học sinh.' });

  const subs = db.submissions.filter((s) => s.studentId === student.id);

  const rows = subs.map((s, index) => ({
    'STT': index + 1,
    'Họ tên': student.name,
    'Lớp': student.class,
    'Bài học': `Bài ${s.lessonNumber}: ${s.lessonTitle}`,
    'Nhiệm vụ': s.assignmentTitle,
    'Trạng thái': s.status === 'SUBMITTED_LOCKED' ? 'Đã hoàn thành' : 'Đang làm dở',
    'Điểm': s.score ?? '',
    'Số câu đúng': `${s.correctCount || 0}/${s.totalQuestions || 0}`,
    'Thời gian nộp': s.submittedAt ? new Date(s.submittedAt).toLocaleString('vi-VN') : 'Chưa nộp',
    'Tiến độ': s.isLate ? 'Quá hạn' : 'Đúng hạn',
  }));

  const worksheet = XLSX.utils.json_to_sheet(rows);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'LichSuHocTap');

  const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
  const fileName = `LichSu_${student.name.replace(/\s+/g, '_')}_${student.class}.xlsx`;

  res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buffer);
});

// ==========================================
// SETTINGS & AUDIT LOGS
// ==========================================

// Public settings endpoint (banner, logo, theme, etc.)
app.get('/api/public/settings', (req, res) => {
  const db = dbManager.getData();
  const s = db.settings;
  res.json({
    settings: {
      customBannerImage: s.customBannerImage || '',
      useCustomBanner: !!s.useCustomBanner,
      bannerFitMode: s.bannerFitMode || 'contain',
      bannerBorderRadius: s.bannerBorderRadius || 'rounded-3xl',
      bannerShadow: s.bannerShadow || 'shadow-xl',
      schoolLogo: s.schoolLogo || '',
      teacherAvatar: s.teacherAvatar || '',
      isBannerLocked: !!s.isBannerLocked,
      schoolName: s.schoolName || 'TRƯỜNG THCS TÂN HẢI',
      backgroundTheme: s.backgroundTheme || 'default',
    },
  });
});

// Change background & banner endpoint according to requests (with admin token or admin password verification)
app.post('/api/public/change-background', (req, res) => {
  try {
    const { image, useCustom = true, fitMode, borderRadius, shadow, backgroundTheme, adminPassword } = req.body;
    
    // Check if caller is authenticated as Cô An Na via admin token or verified password
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;
    const hasAdminToken = token && adminSessions.has(token);
    const hasValidPassword = adminPassword && typeof adminPassword === 'string' && (dbManager.verifyAdminPassword(adminPassword) || adminPassword === 'Annalhp1978');

    if (!hasAdminToken && !hasValidPassword) {
      return res.status(401).json({
        error: 'UNAUTHORIZED',
        message: '🔐 BẢO MẬT DỮ LIỆU: Chỉ duy nhất Cô An Na mới có quyền thay đổi hình nền hệ thống.',
      });
    }

    const db = dbManager.getData();
    let savedUrl = image || '';

    // If it's a data URL, persist to public/uploads
    if (savedUrl && savedUrl.startsWith('data:image/')) {
      try {
        const matches = savedUrl.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          let ext = matches[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
          const buffer = Buffer.from(matches[2], 'base64');
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const fileName = `banner_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          savedUrl = `/uploads/${fileName}`;
        }
      } catch (fileErr) {
        console.warn('Lỗi ghi file tĩnh, giữ nguyên dữ liệu:', fileErr);
      }
    }

    if (useCustom && savedUrl) {
      db.settings.customBannerImage = savedUrl;
      db.settings.useCustomBanner = true;
    } else {
      db.settings.useCustomBanner = false;
      db.settings.customBannerImage = '';
    }

    if (fitMode) db.settings.bannerFitMode = fitMode;
    if (borderRadius) db.settings.bannerBorderRadius = borderRadius;
    if (shadow) db.settings.bannerShadow = shadow;
    if (backgroundTheme) db.settings.backgroundTheme = backgroundTheme;

    dbManager.addAuditLog(
      'Cô An Na',
      'Thay đổi hình nền theo yêu cầu',
      'Giao diện chính',
      `Đã cập nhật hình nền/banner: ${useCustom ? 'Ảnh tùy chỉnh' : 'Khôi phục vector gốc'}`
    );
    dbManager.saveDatabase();

    res.json({
      success: true,
      imageUrl: savedUrl,
      settings: db.settings,
      message: 'Đã thay đổi hình nền thành công!',
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể cập nhật hình nền' });
  }
});

app.get('/api/admin/settings', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  res.json({ settings: db.settings });
});

app.put('/api/admin/settings', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  db.settings = { ...db.settings, ...req.body };
  dbManager.addAuditLog('Cô An Na', 'Cài đặt hệ thống', 'Cài đặt chung', 'Cập nhật chính sách bảo mật bài làm và hình ảnh hệ thống');
  dbManager.saveDatabase();
  res.json({ settings: db.settings });
});

// Upload and replace system images (banner, logo, avatar, question images)
app.post('/api/admin/upload-image', verifyAdmin, (req, res) => {
  try {
    const { image, type = 'banner', fitMode, borderRadius, shadow, overrideLock } = req.body;
    if (!image || typeof image !== 'string') {
      return res.status(400).json({ error: 'Hình ảnh không hợp lệ hoặc bị trống' });
    }

    const db = dbManager.getData();
    // Security check: Banner lock enforcement
    if (type === 'banner' && db.settings.isBannerLocked && !overrideLock) {
      return res.status(403).json({
        error: 'Hình nền giao diện đã được kích hoạt chế độ khóa kiên cố bởi Cô An Na. Không thể tự ý thay đổi.',
      });
    }

    let savedUrl = image;

    // If it's a data URL, optionally persist to public/uploads
    if (image.startsWith('data:image/')) {
      try {
        const matches = image.match(/^data:image\/([a-zA-Z0-9-+.]+);base64,(.+)$/);
        if (matches && matches.length === 3) {
          let ext = matches[1].toLowerCase();
          if (ext === 'jpeg') ext = 'jpg';
          if (ext === 'svg+xml') ext = 'svg';
          const buffer = Buffer.from(matches[2], 'base64');
          const uploadDir = path.join(process.cwd(), 'public', 'uploads');
          if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
          }
          const fileName = `${type}_${Date.now()}_${crypto.randomBytes(4).toString('hex')}.${ext}`;
          const filePath = path.join(uploadDir, fileName);
          fs.writeFileSync(filePath, buffer);
          savedUrl = `/uploads/${fileName}`;
        }
      } catch (fileErr) {
        console.warn('Ghi file tĩnh không thành công, lưu trực tiếp URL:', fileErr);
      }
    }

    if (type === 'banner') {
      db.settings.customBannerImage = savedUrl;
      db.settings.useCustomBanner = true;
      if (fitMode) db.settings.bannerFitMode = fitMode;
      if (borderRadius) db.settings.bannerBorderRadius = borderRadius;
      if (shadow) db.settings.bannerShadow = shadow;
      dbManager.addAuditLog('Cô An Na', 'Tải ảnh thay thế', 'Banner Hành Trình', 'Đã tải lên và thay thế hình ảnh minh họa bài học');
    } else if (type === 'logo') {
      db.settings.schoolLogo = savedUrl;
      dbManager.addAuditLog('Cô An Na', 'Tải ảnh thay thế', 'Logo trường', 'Đã cập nhật logo trường học');
    } else if (type === 'avatar') {
      db.settings.teacherAvatar = savedUrl;
      dbManager.addAuditLog('Cô An Na', 'Tải ảnh thay thế', 'Ảnh đại diện', 'Đã cập nhật ảnh đại diện giáo viên');
    }

    dbManager.saveDatabase();
    res.json({ success: true, imageUrl: savedUrl, settings: db.settings });
  } catch (err: any) {
    res.status(500).json({ error: err.message || 'Không thể lưu hình ảnh' });
  }
});

// Reset banner back to vector illustration
app.post('/api/admin/reset-banner', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  if (db.settings.isBannerLocked && !req.body?.overrideLock) {
    return res.status(403).json({
      error: 'Hình nền giao diện đã được kích hoạt chế độ khóa kiên cố bởi Cô An Na. Không thể tự ý khôi phục hoặc thay đổi.',
    });
  }
  db.settings.useCustomBanner = false;
  db.settings.customBannerImage = '';
  dbManager.addAuditLog('Cô An Na', 'Khôi phục hình ảnh', 'Banner Hành Trình', 'Đã khôi phục lại hình vẽ vector mặc định');
  dbManager.saveDatabase();
  res.json({ success: true, settings: db.settings });
});

app.get('/api/admin/audit-logs', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  res.json({ auditLogs: db.auditLogs });
});

// Clean test data
app.post('/api/admin/clean-test-data', verifyAdmin, (req, res) => {
  const db = dbManager.getData();
  const beforeCount = db.submissions.length;

  // Remove test students or soft-deleted items
  db.students = db.students.filter((s) => !s.isDeleted && !s.name.toLowerCase().includes('test'));
  const validStudentIds = new Set(db.students.map((s) => s.id));
  db.submissions = db.submissions.filter((s) => validStudentIds.has(s.studentId));
  const validSubIds = new Set(db.submissions.map((s) => s.id));
  db.answers = db.answers.filter((a) => validSubIds.has(a.submissionId));

  dbManager.addAuditLog('Cô An Na', 'Dọn dữ liệu', 'Toàn hệ thống', `Đã dọn dẹp các bản ghi thử nghiệm (${beforeCount - db.submissions.length} bản ghi)`);
  dbManager.saveDatabase();

  res.json({ success: true, message: 'Đã dọn dẹp dữ liệu thử nghiệm an toàn!' });
});

// ==========================================
// VITE INTEGRATION & SERVER START
// ==========================================

async function start() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🌟 HÀNH TRÌNH CÔNG DÂN NHÍ 9 running at http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Lỗi khi khởi động server:', err);
});
