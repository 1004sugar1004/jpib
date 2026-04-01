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
