import {
  AdminUser,
  Assignment,
  AuditLog,
  ClassGrade9,
  ClassStatisticsResponse,
  ClientQuestion,
  DashboardStats,
  DetailedSubmissionView,
  Lesson,
  PublicAssignmentStatus,
  Question,
  QuestionMistakeStat,
  Student,
  Submission,
  SystemSettings,
} from '../types.ts';
import { clientFallbackEngine } from './clientFallbackEngine.ts';

const ADMIN_TOKEN_KEY = 'htcdn_admin_token';

export const authStorage = {
  getAdminToken: (): string | null => localStorage.getItem(ADMIN_TOKEN_KEY),
  setAdminToken: (token: string): void => localStorage.setItem(ADMIN_TOKEN_KEY, token),
  removeAdminToken: (): void => localStorage.removeItem(ADMIN_TOKEN_KEY),
};

async function fetchJson<T>(url: string, options: RequestInit = {}): Promise<T> {
  const token = authStorage.getAdminToken();
  const headers = new Headers(options.headers || {});
  if (token && !headers.has('Authorization')) {
    headers.set('Authorization', `Bearer ${token}`);
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }

  try {
    const response = await fetch(url, { ...options, headers });
    if (response.ok) {
      return (await response.json()) as T;
    }

    // If 404 (e.g. Netlify static deploy or route not found), fall back to client engine
    if (response.status === 404) {
      try {
        const fallbackData = await clientFallbackEngine.handleRequest(url, options);
        return fallbackData as T;
      } catch (fbErr: any) {
        if (fbErr && fbErr.message && !fbErr.message.includes('Endpoint not found')) {
          throw fbErr;
        }
      }
    }

    let errorMsg = `Lỗi hệ thống (${response.status})`;
    try {
      const errData = await response.json();
      errorMsg = errData.message || errData.error || errorMsg;
    } catch {
      // fallback
    }
    throw new Error(errorMsg);
  } catch (networkErr: any) {
    // If network failed (e.g. offline, failed to fetch, static deploy)
    try {
      const fallbackData = await clientFallbackEngine.handleRequest(url, options);
      return fallbackData as T;
    } catch (fbErr: any) {
      if (fbErr && fbErr.message && !fbErr.message.includes('Endpoint not found')) {
        throw fbErr;
      }
    }
    throw networkErr;
  }
}

export const api = {
  // Public & Student
  getServerTime: () => fetchJson<{ serverTime: string; timestamp: number }>('/api/public/server-time'),
  getClasses: () => fetchJson<{ classes: ClassGrade9[] }>('/api/public/classes'),
  getStudentsByClass: (className: string) =>
    fetchJson<{ students: Array<{ id: string; stt: number; name: string; class: ClassGrade9 }> }>(
      `/api/public/students-by-class/${encodeURIComponent(className)}`
    ),
  getAllStudents: () =>
    fetchJson<{ students: Array<{ id: string; stt: number; name: string; class: ClassGrade9 }> }>(
      '/api/public/all-students'
    ),
  getStudentScorecard: (data: { studentName?: string; studentClass?: string; studentId?: string }) =>
    fetchJson<{
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
    }>('/api/public/student-scorecard', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getPublicAssignmentsStatus: () => fetchJson<{ assignments: PublicAssignmentStatus[] }>('/api/public/assignments-status'),
  getAssignmentByCode: (code: string) =>
    fetchJson<{
      id: string;
      title: string;
      code: string;
      type: string;
      description: string;
      durationMinutes: number;
      lessonNumber: number;
      lessonTitle: string;
    }>(`/api/public/assignment-by-code/${encodeURIComponent(code)}`),

  startMission: (data: { studentName: string; studentClass: ClassGrade9; taskCode: string }) =>
    fetchJson<{
      submissionId: string;
      token: string;
      serverTime: string;
      serverDueTime: string;
      durationMinutes: number;
      questions: ClientQuestion[];
      savedAnswers: Record<string, string>;
      student: { id: string; name: string; class: ClassGrade9 };
      assignment: { id: string; title: string; code: string; lessonNumber: number; lessonTitle: string };
    }>('/api/student/start', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  autosaveAnswer: (data: { submissionId: string; questionId: string; selectedOption: string; token: string }) =>
    fetchJson<{ success?: boolean; savedAt?: string; locked?: boolean; message?: string }>('/api/student/autosave', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  submitMission: (data: { submissionId: string; token: string }) =>
    fetchJson<{
      status: 'SUBMITTED_LOCKED';
      score?: number;
      maxScore?: number;
      correctCount?: number;
      totalQuestions?: number;
      totalTimeSeconds?: number;
      submittedAt?: string;
      message: string;
      showScore: boolean;
      showTime: boolean;
    }>('/api/student/submit', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Auth
  adminLogin: (data: { username: string; password: string }) =>
    fetchJson<{ token: string; user: AdminUser }>('/api/admin/login', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  getAdminMe: () => fetchJson<{ user: AdminUser }>('/api/admin/me'),
  adminLogout: () =>
    fetchJson<{ success: boolean }>('/api/admin/logout', {
      method: 'POST',
    }),
  changeAdminPassword: (data: { currentPassword: string; newPassword: string }) =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/change-password', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  // Admin Dashboard & Statistics
  getDashboardStats: () => fetchJson<DashboardStats>('/api/admin/dashboard-stats'),
  getClassStatistics: () => fetchJson<ClassStatisticsResponse>('/api/admin/class-statistics'),
  getMistakeStats: () => fetchJson<{ mistakes: QuestionMistakeStat[] }>('/api/admin/mistake-statistics'),

  // Lessons
  getLessons: () => fetchJson<{ lessons: Lesson[] }>('/api/admin/lessons'),
  createLesson: (data: Partial<Lesson>) =>
    fetchJson<{ lesson: Lesson }>('/api/admin/lessons', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateLesson: (id: string, data: Partial<Lesson>) =>
    fetchJson<{ lesson: Lesson }>(`/api/admin/lessons/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteLesson: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/lessons/${id}`, {
      method: 'DELETE',
    }),
  duplicateLesson: (id: string) =>
    fetchJson<{ lesson: Lesson }>(`/api/admin/lessons/${id}/duplicate`, {
      method: 'POST',
    }),

  // Assignments
  getAssignments: (lessonId?: string) => {
    const url = lessonId ? `/api/admin/assignments?lessonId=${lessonId}` : '/api/admin/assignments';
    return fetchJson<{ assignments: Assignment[] }>(url);
  },
  getAssignmentDetail: (id: string) =>
    fetchJson<{ assignment: Assignment; questions: Question[] }>(`/api/admin/assignments/${id}`),
  createAssignment: (data: Partial<Assignment>) =>
    fetchJson<{ assignment: Assignment }>('/api/admin/assignments', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateAssignment: (id: string, data: Partial<Assignment>) =>
    fetchJson<{ assignment: Assignment }>(`/api/admin/assignments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteAssignment: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/assignments/${id}`, {
      method: 'DELETE',
    }),
  duplicateAssignment: (id: string) =>
    fetchJson<{ assignment: Assignment }>(`/api/admin/assignments/${id}/duplicate`, {
      method: 'POST',
    }),
  toggleLockAssignment: (id: string) =>
    fetchJson<{ assignment: Assignment }>(`/api/admin/assignments/${id}/toggle-lock`, {
      method: 'POST',
    }),
  scheduleAssignment: (
    id: string,
    data: {
      timeLimitEnabled: boolean;
      openTime?: string | null;
      closeTime?: string | null;
      scheduleNote?: string;
      isLocked?: boolean;
    }
  ) =>
    fetchJson<{ assignment: Assignment }>(`/api/admin/assignments/${id}/schedule`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  batchLockAssignments: (data: {
    action: 'lock_all' | 'unlock_all' | 'batch_schedule';
    assignmentIds?: string[];
    timeLimitEnabled?: boolean;
    openTime?: string | null;
    closeTime?: string | null;
    scheduleNote?: string;
  }) =>
    fetchJson<{ success: boolean; count: number; action: string }>('/api/admin/assignments/batch-lock', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  importQuestions: (assignmentId: string, payload: { rawText?: string; questions?: any[] } | string) => {
    const body = typeof payload === 'string' ? { rawText: payload } : payload;
    return fetchJson<{ success: boolean; count: number }>(`/api/admin/assignments/${assignmentId}/import-questions`, {
      method: 'POST',
      body: JSON.stringify(body),
    });
  },

  // Questions
  createQuestion: (data: Partial<Question>) =>
    fetchJson<{ question: Question }>('/api/admin/questions', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  updateQuestion: (id: string, data: Partial<Question>) =>
    fetchJson<{ question: Question }>(`/api/admin/questions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteQuestion: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/questions/${id}`, {
      method: 'DELETE',
    }),

  // Students
  getStudents: (params?: { search?: string; classFilter?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.set('search', params.search);
    if (params?.classFilter) searchParams.set('classFilter', params.classFilter);
    return fetchJson<{ students: Student[] }>(`/api/admin/students?${searchParams.toString()}`);
  },
  updateStudent: (id: string, data: { name: string; className: ClassGrade9 }) =>
    fetchJson<{ student: Student }>(`/api/admin/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  softDeleteStudent: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/students/${id}`, {
      method: 'DELETE',
    }),
  restoreStudent: (id: string) =>
    fetchJson<{ success: boolean; message: string }>(`/api/admin/students/${id}/restore`, {
      method: 'POST',
    }),
  permanentDeleteStudent: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/students/${id}/permanent`, {
      method: 'DELETE',
    }),
  cleanDuplicateStudents: () =>
    fetchJson<{ success: boolean; cleanedCount: number; message: string }>('/api/admin/students/clean-duplicates', {
      method: 'POST',
    }),
  bulkImportStudents: (data: {
    students: Array<{ name: string; class: string; stt?: number }>;
    mode?: 'append' | 'replace' | 'replace_class';
    targetClass?: string;
  }) =>
    fetchJson<{ success: boolean; importedCount: number; skippedCount: number; totalActiveStudents: number; message: string }>('/api/admin/students/bulk-import', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  parseRosterImage: (imageBase64: string, mimeType?: string) =>
    fetchJson<{ success: boolean; students: Array<{ stt: number; name: string }>; count: number }>(
      '/api/admin/students/parse-roster-image',
      {
        method: 'POST',
        body: JSON.stringify({ imageBase64, mimeType }),
      }
    ),
  resetAllStudents: () =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/students/reset-all', {
      method: 'POST',
    }),
  mergeDuplicateStudents: (sourceStudentId: string, targetStudentId: string) =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/students/merge', {
      method: 'POST',
      body: JSON.stringify({ sourceStudentId, targetStudentId }),
    }),
  getTrash: () =>
    fetchJson<{ students: Student[]; assignments: Assignment[] }>('/api/admin/trash'),

  // Submissions
  getSubmissions: (params?: { classFilter?: string; assignmentId?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.classFilter) searchParams.set('classFilter', params.classFilter);
    if (params?.assignmentId) searchParams.set('assignmentId', params.assignmentId);
    return fetchJson<{ submissions: Submission[] }>(`/api/admin/submissions?${searchParams.toString()}`);
  },
  getSubmissionDetail: (id: string) =>
    fetchJson<DetailedSubmissionView>(`/api/admin/submissions/${id}`),
  updateSubmission: (id: string, data: Partial<Submission> & { answers?: any[] }) =>
    fetchJson<{ success: boolean; submission: Submission }>(`/api/admin/submissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
  deleteSubmission: (id: string) =>
    fetchJson<{ success: boolean }>(`/api/admin/submissions/${id}`, {
      method: 'DELETE',
    }),

  // History & Chart
  getStudentHistory: (studentId: string) =>
    fetchJson<{
      student: Student;
      summary: {
        completedCount: number;
        totalAssigned: number;
        avgScore: number;
        onTimeCount: number;
        overdueCount: number;
        progressPct: number;
      };
      timeline: Array<{
        assignmentId: string;
        assignmentTitle: string;
        code: string;
        lessonId: string;
        lessonNumber: number;
        lessonTitle: string;
        isCompleted: boolean;
        submissionId: string | null;
        score: number | null;
        totalTimeSeconds: number | null;
        submittedAt: string | null;
        isLate: boolean;
      }>;
      progressChart: Array<{
        label: string;
        assignment: string;
        score: number;
        date: string;
      }>;
    }>(`/api/admin/student-history/${studentId}`),

  // Settings & Logs
  getPublicSettings: () => fetchJson<{ settings: Partial<SystemSettings> }>('/api/public/settings'),
  getSettings: () => fetchJson<{ settings: SystemSettings }>('/api/admin/settings'),
  updateSettings: (settings: Partial<SystemSettings>) =>
    fetchJson<{ settings: SystemSettings }>('/api/admin/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
    uploadImage: (data: {
    image: string;
    type?: 'banner' | 'logo' | 'avatar' | 'question' | 'general';
    fitMode?: string;
    borderRadius?: string;
    shadow?: string;
    overrideLock?: boolean;
  }) =>
    fetchJson<{ success: boolean; imageUrl: string; settings: SystemSettings }>('/api/admin/upload-image', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  changeBackground: (data: {
    image?: string;
    useCustom?: boolean;
    fitMode?: string;
    borderRadius?: string;
    shadow?: string;
    backgroundTheme?: string;
    adminPassword?: string;
    overrideLock?: boolean;
    isTeacherAction?: boolean;
  }) =>
    fetchJson<{ success: boolean; imageUrl?: string; settings: SystemSettings; message: string }>('/api/public/change-background', {
      method: 'POST',
      body: JSON.stringify(data),
    }),
  resetBanner: () =>
    fetchJson<{ success: boolean; settings: SystemSettings }>('/api/admin/reset-banner', {
      method: 'POST',
    }),
  getAuditLogs: () => fetchJson<{ auditLogs: AuditLog[] }>('/api/admin/audit-logs'),
  cleanTestData: () =>
    fetchJson<{ success: boolean; message: string }>('/api/admin/clean-test-data', {
      method: 'POST',
    }),

  // Excel downloads
  getResultsExportUrl: (className?: string) => {
    const token = authStorage.getAdminToken();
    return `/api/admin/export/results?class=${className || 'ALL'}&auth=${token}`;
  },
  getHistoryExportUrl: (studentId: string) => {
    const token = authStorage.getAdminToken();
    return `/api/admin/export/student-history?studentId=${studentId}&auth=${token}`;
  },
};
