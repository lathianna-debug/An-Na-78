export type UserRole = 'ADMIN' | 'STUDENT';

export interface AdminUser {
  id: string;
  username: string;
  displayName: string;
  role: 'ADMIN';
  createdAt: string;
  lastLoginAt?: string;
}

export type ClassGrade9 = '9A8' | '9A9' | '9A10' | '9A11' | '9A12' | string;

export interface Student {
  id: string;
  stt?: number;
  name: string;
  class: ClassGrade9;
  createdAt: string;
  updatedAt: string;
  isDeleted: boolean;
  deletedAt?: string;
  submissionsCount?: number;
  avgScore?: number;
  lastActive?: string;
  lessonScores?: Record<number, number | null>;
}

export interface Lesson {
  id: string;
  number: number;
  title: string;
  description: string;
  status: 'active' | 'locked';
  assignmentsCount?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;
}

export type AssignmentType =
  | 'bai_tap'
  | 'luyen_tap'
  | 'tinh_huong'
  | 'van_dung'
  | 'phieu_cung_co';

export type ReviewMode =
  | 'NO_REVIEW' // 🔒 Không cho xem bài
  | 'SCORE_ONLY' // ⭐ Chỉ xem điểm
  | 'QUESTIONS_NO_ANSWER' // 📝 Xem bài nhưng ẩn đáp án đúng
  | 'FULL_REVIEW'; // 🔓 Xem đầy đủ

export type AssignmentLockStatus =
  | 'OPEN'
  | 'MANUALLY_LOCKED'
  | 'SCHEDULED_NOT_OPEN_YET'
  | 'SCHEDULED_EXPIRED';

export interface Assignment {
  id: string;
  lessonId: string;
  lessonNumber?: number;
  lessonTitle?: string;
  title: string;
  type: AssignmentType;
  code: string;
  description: string;
  durationMinutes: number;
  isLocked: boolean;
  order: number;
  reviewMode: ReviewMode;
  questionsCount?: number;
  createdAt: string;
  updatedAt: string;
  isDeleted?: boolean;

  // Time-based lock & unlock scheduling
  timeLimitEnabled?: boolean;
  openTime?: string | null;
  closeTime?: string | null;
  scheduleNote?: string;

  // Computed status fields
  lockStatus?: AssignmentLockStatus;
  lockMessage?: string;
  isAvailable?: boolean;
}

export interface PublicAssignmentStatus {
  id: string;
  lessonId: string;
  lessonNumber: number;
  lessonTitle: string;
  title: string;
  code: string;
  type: AssignmentType;
  description: string;
  durationMinutes: number;
  isLocked: boolean;
  timeLimitEnabled: boolean;
  openTime: string | null;
  closeTime: string | null;
  scheduleNote?: string;
  lockStatus: AssignmentLockStatus;
  lockMessage: string;
  isAvailable: boolean;
  questionsCount: number;
}

export interface QuestionOption {
  key: 'A' | 'B' | 'C' | 'D';
  text: string;
}

export interface Question {
  id: string;
  assignmentId: string;
  order: number;
  content: string;
  imageUrl?: string;
  options: QuestionOption[];
  correctOption: 'A' | 'B' | 'C' | 'D';
  explanation?: string;
  points: number;
}

// Client-facing question without answer details
export interface ClientQuestion {
  id: string;
  assignmentId: string;
  order: number;
  content: string;
  imageUrl?: string;
  options: QuestionOption[];
  points: number;
}

export type SubmissionStatus = 'IN_PROGRESS' | 'SUBMITTED_LOCKED';

export interface Submission {
  id: string;
  assignmentId: string;
  assignmentTitle?: string;
  lessonNumber?: number;
  lessonTitle?: string;
  studentId: string;
  studentName: string;
  studentClass: ClassGrade9;
  startTime: string;
  serverDueTime: string;
  submittedAt?: string;
  totalTimeSeconds?: number;
  status: SubmissionStatus;
  score?: number;
  maxScore?: number;
  correctCount?: number;
  totalQuestions?: number;
  isLate?: boolean;
  teacherNote?: string;
}

export interface StudentAnswer {
  id: string;
  submissionId: string;
  questionId: string;
  selectedOption: string;
  savedAt: string;
  isCorrect?: boolean;
  pointsEarned?: number;
}

export interface DetailedSubmissionItem {
  questionId: string;
  order: number;
  content: string;
  options: QuestionOption[];
  selectedOption: string;
  correctOption: 'A' | 'B' | 'C' | 'D';
  isCorrect: boolean;
  pointsEarned: number;
  maxPoints: number;
  explanation?: string;
  savedAt?: string;
}

export interface DetailedSubmissionView {
  submission: Submission;
  items: DetailedSubmissionItem[];
  reviewMode: ReviewMode;
}

export interface SystemSettings {
  lockImmediatelyOnSubmit: boolean;
  hideAnswersAfterSubmit: boolean;
  preventViewingOthersSubmissions: boolean;
  teacherOnlyReview: boolean;
  showScoreAfterSubmit: boolean;
  showTimeAfterSubmit: boolean;
  showCorrectAnswersAfterSubmit: boolean;
  allowReviewDetailAfterSubmit: boolean;
  // Custom Images & Banner
  customBannerImage?: string;
  useCustomBanner?: boolean;
  bannerFitMode?: 'contain' | 'cover' | 'original';
  bannerBorderRadius?: 'rounded-none' | 'rounded-2xl' | 'rounded-3xl' | 'rounded-full';
  bannerShadow?: 'none' | 'shadow-md' | 'shadow-xl' | 'shadow-2xl';
  schoolLogo?: string;
  teacherAvatar?: string;
  isBannerLocked?: boolean;
  schoolName?: string;
  backgroundTheme?: 'default' | 'royal-purple' | 'golden-tan-hai' | 'ocean-blue' | 'emerald-growth' | 'warm-sunset';
}

export interface AuditLog {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  targetEntity: string;
  details: string;
}

export interface DashboardStats {
  totalStudents: number;
  totalAssignmentsAssigned: number;
  completedSubmissions: number;
  inProgressSubmissions: number;
  averageScore: number;
  completionRate: number;
}

export interface QuestionMistakeStat {
  questionId: string;
  assignmentId: string;
  assignmentTitle: string;
  lessonNumber: number;
  order: number;
  content: string;
  totalAnswered: number;
  incorrectCount: number;
  mistakeRate: number; // percentage (e.g. 61)
  correctOption: string;
  optionsDistribution: Record<string, number>;
  classMistakes: Record<string, number>;
}

export interface ClassLessonStatistic {
  lessonNumber: number;
  lessonTitle: string;
  assignmentId?: string;
  assignmentCode?: string;
  submittedCount: number;
  unsubmittedCount: number;
  totalStudents: number;
  submissionRate: number; // percentage (e.g. 92)
  avgScore: number | null;
  unsubmittedStudents: { id: string; name: string; stt?: number }[];
}

export interface ClassStatistic {
  className: string;
  totalStudents: number;
  submittedSubmissionsCount: number;
  inProgressSubmissionsCount: number;
  activeStudentsCount: number;
  neverSubmittedStudentsCount: number;
  overallSubmissionRate: number; // percentage
  avgScore: number | null;
  lessons: ClassLessonStatistic[];
}

export interface ClassStatisticsResponse {
  summary: {
    totalClasses: number;
    totalStudents: number;
    totalSubmissions: number;
    overallAvgScore: number | null;
  };
  classes: ClassStatistic[];
}
