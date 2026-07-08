export interface UserProfile {
  uid: string;
  name: string;
  grade: string;
  class: string;
  role: 'student' | 'teacher';
  score: number;
  monthlyScore?: number;
  lastActiveMonth?: string;
  lastQuizDate?: string;
  level?: number;
  streak?: number;
  completedStudyItems?: string[];
  gameTickets?: number;
  highScore?: number;
  photoURL?: string;
  caricatureSvg?: string;
  // New fields for anti-abusing and engagement
  dailyXP?: number;
  dailyScore?: number;
  lastXPDate?: string; // YYYY-MM-DD
  activityCounts?: Record<string, number>; // { quiz: 5, cards: 2, ... }
  dailyQuests?: DailyQuest[];
  lastActivityTimestamp?: number;
}

export interface DailyQuest {
  id: string;
  title: string;
  description: string;
  type: 'quiz' | 'flashcards' | 'memory' | 'study';
  target: number;
  progress: number;
  completed: boolean;
  xpReward: number;
  ticketReward?: number;
}

export interface ActivityLog {
  id?: string;
  uid: string;
  userName: string;
  grade: string;
  class: string;
  activityType: string;
  timestamp: number;
  duration: number; // in seconds
  accuracy: number; // 0 to 1
  xpGained: number;
  isSuspicious?: boolean;
}

export interface Feedback {
  id?: string;
  uid: string;
  userName: string;
  grade: string;
  class: string;
  content: string;
  timestamp: number;
}

export interface TeacherNote {
  id?: string;
  senderName: string; // e.g., "김혜진 선생님"
  targetName: string; // e.g., "윤성빈"
  targetGrade: string; // e.g., "4학년" or "4"
  targetClass: string; // e.g., "4반" or "4"
  content: string;
  timestamp: number;
  readBy?: string[]; // uids of students who marked it as read
}

