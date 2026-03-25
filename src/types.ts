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
}
