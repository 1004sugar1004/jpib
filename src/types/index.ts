export interface UserProfile {
  uid: string;
  name: string;
  grade: string;
  class: string;
  role: 'student' | 'teacher';
  score: number;
  email?: string;
  lastQuizDate?: string;
  level?: number;
  streak?: number;
  completedStudyItems?: string[];
  gameTickets?: number;
}

export interface QuizQuestion {
  question: string;
  options: string[];
  correctAnswer: number;
  emoji?: string;
}
