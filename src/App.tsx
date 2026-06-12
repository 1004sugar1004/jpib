import React, { useState, useEffect } from 'react';
import { 
  onAuthStateChanged, 
  signInWithPopup, 
  signOut, 
  User as FirebaseUser 
} from 'firebase/auth';
import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db, googleProvider, handleFirestoreError, OperationType } from './firebase';
import { quizQuestions, songQuizQuestions } from './content';
import { ASSETS } from './assets';
import confetti from 'canvas-confetti';
import { motion, AnimatePresence } from 'motion/react';
import { LoginView } from './components/views/LoginView';
import { ProfileSetupView } from './components/views/ProfileSetupView';
import { HomeView } from './components/views/HomeView';
import { StudyView } from './components/views/StudyView';
import { QuizView } from './components/views/QuizView';
import { RankingView } from './components/views/RankingView';
import { TeacherDashboardView } from './components/views/TeacherDashboardView';
import { FlashcardView } from './components/views/FlashcardView';
import { MemoryGameView } from './components/views/MemoryGameView';
import { GameCornerView } from './components/views/GameCornerView';
import { MusicQuizView } from './components/views/MusicQuizView';
import { BingoGameView } from './components/views/BingoGameView';
import { CertificateView } from './components/views/CertificateView';
import { PlanView } from './components/views/PlanView';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { AnnouncementPopup } from './components/ui/AnnouncementPopup';
import { EventPopup } from './components/ui/EventPopup';
import { FeedbackForm } from './components/ui/FeedbackForm';
import { UserProfile, ActivityLog, DailyQuest } from './types';
import { getLevel } from './lib/utils';
import { backgrounds } from './constants';
import { Button } from './components/ui/Button';
import { AlertTriangle } from 'lucide-react';

const DAILY_XP_LIMIT = 1500;

const QUESTS_POOL: Record<string, Omit<DailyQuest, 'progress' | 'completed'>[]> = {
  study: [
    { id: 'study_1', title: 'IB 지식 탐험 모든 키워드 완독', description: '지식 탐험의 모든 항목(34개)을 한 번씩 읽으세요.', type: 'study', target: 34, xpReward: 150, ticketReward: 2 },
    { id: 'study_2', title: '지식 탐험 키워드 5개 성찰하기', description: '지식 탐험에서 키워드를 5개 읽어 개념을 성찰하세요.', type: 'study', target: 5, xpReward: 50, ticketReward: 1 },
    { id: 'study_3', title: '지식 탐험 집중 학습 12회 완료', description: '탐색 항목을 클릭하여 12회 이상 학습을 확인하세요.', type: 'study', target: 12, xpReward: 80, ticketReward: 2 },
    { id: 'study_4', title: '초성 퀴즈 1회 정답 도전', description: '지식 탐험의 초성 퀴즈를 1회 맞추어 보세요.', type: 'study', target: 1, xpReward: 50, ticketReward: 1 },
  ],
  flashcards: [
    { id: 'fc_1', title: '플래시카드 10회 학습', description: '개념 플래시카드를 10번 넘겨 학습을 진행하세요.', type: 'flashcards', target: 10, xpReward: 40, ticketReward: 2 },
    { id: 'fc_2', title: '플래시카드 마스터 20회 달성', description: '플래시카드를 20번 뒤집어 확실히 머리에 복습하세요.', type: 'flashcards', target: 20, xpReward: 80, ticketReward: 2 },
    { id: 'fc_3', title: '속성 플래시카드 6장 완독', description: '다양한 카드로 속속들이 6장의 핵심 단어를 터치하세요.', type: 'flashcards', target: 6, xpReward: 30, ticketReward: 1 },
  ],
  memory: [
    { id: 'mem_1', title: '메모리 매칭 게임 1회 달성', description: '단어 매칭 메모리 게임을 완성해 두뇌를 단련하세요.', type: 'memory', target: 1, xpReward: 50, ticketReward: 2 },
    { id: 'mem_2', title: '메모리 카드 고수 도전 (2회 완료)', description: '메모리 게임을 2판 완주하여 IB 키워드 짝을 맞추세요.', type: 'memory', target: 2, xpReward: 90, ticketReward: 3 },
  ],
  quiz: [
    { id: 'quiz_1', title: '개념 퀴즈 또는 지식 빙고 1회 완료', description: '개념 퀴즈나 지식 빙고를 한 세트 플레이하여 정복하세요.', type: 'quiz', target: 1, xpReward: 50, ticketReward: 2 },
    { id: 'quiz_2', title: '종합 퀴즈&빙고 더블 패스(2회)', description: '퀴즈 혹은 지식 빙고를 2판 완벽하게 마무리하세요.', type: 'quiz', target: 2, xpReward: 100, ticketReward: 3 },
    { id: 'quiz_3', title: 'IB 퀴즈 또는 음악 퀴즈 1회', description: 'IB 퀴즈나 신기한 음악 퀴즈를 1회 플레이해 보세요.', type: 'quiz', target: 1, xpReward: 50, ticketReward: 2 },
    { id: 'quiz_4', title: '개념 초성 퀴즈 정답 달성', description: '초성 단어 맞추기 퀴즈에서 정답을 골라 성공하세요.', type: 'quiz', target: 1, xpReward: 50, ticketReward: 1 },
  ]
};

export function getRandomDailyQuests(): DailyQuest[] {
  const categories: ('study' | 'flashcards' | 'memory' | 'quiz')[] = ['study', 'flashcards', 'memory', 'quiz'];
  // Shuffle categories
  const shuffledCats = [...categories].sort(() => Math.random() - 0.5);
  const selectedCats = shuffledCats.slice(0, 3);
  
  return selectedCats.map((cat, index) => {
    const list = QUESTS_POOL[cat];
    const picked = list[Math.floor(Math.random() * list.length)];
    return {
      ...picked,
      id: `q_${cat}_${index}`,
      progress: 0,
      completed: false
    } as DailyQuest;
  });
}

const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', title: '지식탐험 모든 키워드 완독', description: '지식 탐험의 모든 항목(34개)을 읽고 확인하세요. (보상: 150XP + 티켓 2장)', type: 'study', target: 34, progress: 0, completed: false, xpReward: 150, ticketReward: 2 },
  { id: 'q2', title: '플래시카드 10개 학습', description: '플래시카드를 10번 뒤집어 학습하세요. (보상: 30XP + 티켓 2장)', type: 'flashcards', target: 10, progress: 0, completed: false, xpReward: 30, ticketReward: 2 },
  { id: 'q3', title: '메모리 게임 1회 승리', description: '메모리 게임을 한 판 완료하세요. (보상: 40XP + 티켓 2장)', type: 'memory', target: 1, progress: 0, completed: false, xpReward: 40, ticketReward: 2 },
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'study' | 'quiz' | 'music-quiz' | 'bingo' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard'>('home');
  const [rankings, setRankings] = useState<UserProfile[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.5);
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showExitConfirm, setShowExitConfirm] = useState(false);
  const [dontShowForAWeek, setDontShowForAWeek] = useState(false);
  const [pendingView, setPendingView] = useState<typeof view | null>(null);
  const [studyInitialTab, setStudyInitialTab] = useState<number | undefined>(undefined);
  const [reflectionData, setReflectionData] = useState<Record<string, string>>({});
  const [atlData, setAtlData] = useState<Record<string, number>>({});

  const getCurrentMonth = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  };

  // Load persistence data
  useEffect(() => {
    if (user) {
      const loadData = async () => {
        const reflectionRef = doc(db, 'reflections', user.uid);
        const atlRef = doc(db, 'atl', user.uid);
        
        const [reflectionSnap, atlSnap] = await Promise.all([
          getDoc(reflectionRef),
          getDoc(atlRef)
        ]);

        if (reflectionSnap.exists()) setReflectionData(reflectionSnap.data());
        if (atlSnap.exists()) setAtlData(atlSnap.data());
      };
      loadData();
    }
  }, [user]);

  const getCurrentDate = () => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  };

  // Load guest profile from localStorage on mount
  useEffect(() => {
    const persistedIsGuest = localStorage.getItem('isGuest') === 'true';
    if (persistedIsGuest) {
      setIsGuest(true);
      const persistedProfile = localStorage.getItem('guestProfile');
      if (persistedProfile) {
        try {
          const parsed = JSON.parse(persistedProfile);
          setProfile(parsed);
        } catch (e) {
          console.error("Failed to parse guest profile", e);
        }
      } else {
        setProfile({
          uid: 'guest',
          name: '게스트 탐험가',
          grade: '게스트',
          class: '탐험대',
          role: 'student',
          score: 0,
          gameTickets: 0,
          completedStudyItems: [],
          dailyXP: 0,
          dailyScore: 0,
          lastXPDate: getCurrentDate(),
        });
      }
    }
  }, []);

  // Save guest profile to localStorage when it changes
  useEffect(() => {
    if (isGuest && profile && profile.uid === 'guest') {
      localStorage.setItem('isGuest', 'true');
      localStorage.setItem('guestProfile', JSON.stringify(profile));
    }
  }, [isGuest, profile]);

  const logActivity = async (log: Omit<ActivityLog, 'uid' | 'userName' | 'grade' | 'class' | 'timestamp'>) => {
    if (!profile) return;
    const fullLog: ActivityLog = {
      ...log,
      uid: profile.uid,
      userName: profile.name,
      grade: profile.grade,
      class: profile.class,
      timestamp: Date.now(),
      // Simple suspicious check: if duration is very short for the activity
      isSuspicious: log.duration < 5 && log.activityType === 'quiz'
    };
    try {
      await setDoc(doc(collection(db, 'activityLogs')), fullLog);
    } catch (error) {
      console.error("Failed to log activity", error);
    }
  };

  const updateDailyQuests = (type: DailyQuest['type'], amount: number = 1) => {
    if (!profile) return { newQuests: [], questXP: 0, questTickets: 0 };
    const quests = profile.dailyQuests || DEFAULT_DAILY_QUESTS;
    let questXP = 0;
    let questTickets = 0;
    const newQuests = quests.map(q => {
      if (q.type === type && !q.completed) {
        const newProgress = q.progress + amount;
        const completed = newProgress >= q.target;
        if (completed) {
          questXP += q.xpReward;
          questTickets += (q.ticketReward || 0);
        }
        return { ...q, progress: newProgress, completed };
      }
      return q;
    });
    return { newQuests, questXP, questTickets };
  };

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            let userData = docSnap.data() as UserProfile;
            const today = getCurrentDate();
            
            // Reset daily stats if it's a new day
            if (userData.lastXPDate !== today) {
              userData = {
                ...userData,
                dailyXP: 0,
                dailyScore: 0,
                lastXPDate: today,
                activityCounts: {},
                dailyQuests: getRandomDailyQuests(),
                completedStudyItems: [] // Reset study items daily
              };
              await updateDoc(docRef, {
                dailyXP: 0,
                dailyScore: 0,
                lastXPDate: today,
                activityCounts: {},
                dailyQuests: getRandomDailyQuests(),
                completedStudyItems: []
              });
              // Sync reset to public profile with full info to ensure it exists
              await setDoc(doc(db, 'publicProfiles', firebaseUser.uid), {
                uid: userData.uid,
                name: userData.name,
                grade: userData.grade,
                class: userData.class,
                score: userData.score,
                monthlyScore: userData.monthlyScore || 0,
                lastActiveMonth: userData.lastActiveMonth || getCurrentMonth(),
                dailyScore: 0,
                lastXPDate: today,
                photoURL: userData.photoURL || ""
              }, { merge: true });
            } else if (!userData.dailyQuests || userData.dailyQuests.length === 0) {
              // Ensure dailyQuests exist even if it's not a new day (for transitional users)
              userData.dailyQuests = getRandomDailyQuests();
              await updateDoc(docRef, { dailyQuests: getRandomDailyQuests() });
            } else {
              // Repair logic: ensure public profile exists even if it's not a new day
              const publicRef = doc(db, 'publicProfiles', firebaseUser.uid);
              const publicSnap = await getDoc(publicRef);
              if (!publicSnap.exists()) {
                await setDoc(publicRef, {
                  uid: userData.uid,
                  name: userData.name,
                  grade: userData.grade,
                  class: userData.class,
                  score: userData.score,
                  monthlyScore: userData.monthlyScore || 0,
                  lastActiveMonth: userData.lastActiveMonth || getCurrentMonth(),
                  dailyScore: userData.dailyScore || 0,
                  lastXPDate: userData.lastXPDate || today,
                  photoURL: userData.photoURL || ""
                });
              }
            }

            // [DATA FIX] Special fix for Lee Yeeun (Change role Teacher -> Student)
            if (userData.name === '이예은' && userData.role === 'teacher') {
              console.log("Applying data fix for Lee Yeeun...");
              const updatedFields = {
                role: 'student' as const,
                grade: '5학년',
                class: '5반'
              };
              await updateDoc(docRef, updatedFields);
              await updateDoc(doc(db, 'publicProfiles', firebaseUser.uid), updatedFields);
              userData = { ...userData, ...updatedFields };
            }

            setProfile(userData);
          }
        } catch (error) {
          console.error("Error fetching profile:", error);
          // Don't throw here to avoid breaking the auth listener flow
        }
      } else {
        const persistedIsGuest = localStorage.getItem('isGuest') === 'true';
        if (!persistedIsGuest) {
          setProfile(null);
        }
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Active runtime check to instantly reset daily and monthly statistics (for sleep/wake cycles, active tabs past midnight/month shifts, etc.)
  useEffect(() => {
    if (!profile || isGuest) return;
    const checkAndResetDaily = async () => {
      const today = getCurrentDate();
      const currentMonth = getCurrentMonth();
      
      const isNewDay = profile.lastXPDate && profile.lastXPDate !== today;
      const isNewMonth = profile.lastActiveMonth && profile.lastActiveMonth !== currentMonth;
      
      if (isNewDay || isNewMonth) {
        console.log("New calendar day or month detected during active session - resetting stats.");
        const docRef = doc(db, 'users', profile.uid);
        
        const updatedConfig: any = {
          dailyXP: 0,
          dailyScore: 0,
          lastXPDate: today,
          activityCounts: {},
          dailyQuests: getRandomDailyQuests(),
          completedStudyItems: []
        };
        
        const publicUpdates: any = {
          dailyScore: 0,
          lastXPDate: today
        };
        
        if (isNewMonth) {
          updatedConfig.monthlyScore = 0;
          updatedConfig.lastActiveMonth = currentMonth;
          publicUpdates.monthlyScore = 0;
          publicUpdates.lastActiveMonth = currentMonth;
        }
        
        try {
          await updateDoc(docRef, updatedConfig);
          // Sync changes directly to publicProfile collection
          await updateDoc(doc(db, 'publicProfiles', profile.uid), publicUpdates);
          
          setProfile(prev => prev ? {
            ...prev,
            ...updatedConfig
          } : null);
        } catch (error) {
          console.error("Failed to auto-reset stats on calendar transition:", error);
        }
      }
    };

    checkAndResetDaily();
    window.addEventListener('focus', checkAndResetDaily);
    const interval = setInterval(checkAndResetDaily, 30000); // Check every 30 seconds
    return () => {
      window.removeEventListener('focus', checkAndResetDaily);
      clearInterval(interval);
    };
  }, [profile, isGuest]);

  // Ranking Fetcher (Optimized: Removed onSnapshot to save costs)
  const fetchRankings = React.useCallback(async () => {
    if (!isAuthReady || (!user && !isGuest)) return;
    try {
      const q = query(collection(db, 'publicProfiles'), orderBy('score', 'desc'), limit(100)); // Limit to top 100
      
      const { getDocs } = await import('firebase/firestore');
      const querySnapshot = await getDocs(q);
      
      const today = getCurrentDate();
      const currentMonth = getCurrentMonth();
      const data = querySnapshot.docs.map(doc => {
        const userData = doc.data() as any;
        return { 
          ...userData, 
          score: userData.score || 0,
          monthlyScore: userData.lastActiveMonth === currentMonth ? (userData.monthlyScore || 0) : 0,
          dailyScore: userData.lastXPDate === today ? (userData.dailyScore || 0) : 0
        };
      });
      setRankings(data as UserProfile[]);
      console.log(`Fetched ${data.length} users for ranking.`);
    } catch (error) {
      console.error("Error fetching rankings:", error);
      handleFirestoreError(error, OperationType.GET, 'publicProfiles');
    }
  }, [isAuthReady, user, isGuest]);

  // Initial ranking load and periodic refresh (every 5 mins instead of real-time)
  useEffect(() => {
    fetchRankings();
    const interval = setInterval(fetchRankings, 5 * 60 * 1000); // 5 mins
    return () => clearInterval(interval);
  }, [fetchRankings]);

  const handleLogin = async () => {
    if (isLoggingIn) return;
    setIsLoggingIn(true);
    setLoginError(null);
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
    } catch (error: any) {
      console.error("Login failed", error);
      let localizedError = "로그인에 실패했습니다. 다시 시도해 주세요.";
      if (error && (error.code === 'auth/cancelled-popup-request' || error.message?.includes('cancelled-popup-request'))) {
        localizedError = "이미 진행 중인 로그인 창이 열려있거나 취소되었습니다. 대기 후 다시 클릭해 주시거나 주소창의 팝업 차단 여부를 체크해 주세요.";
      } else if (error && (error.code === 'auth/popup-blocked' || error.message?.includes('popup-blocked'))) {
        localizedError = "브라우저에 의해 로그인 창이 차단되었습니다. 주소창 부근의 팝업 차단 해제 설정을 한 후 다시 시도해 주세요.";
      } else if (error?.message) {
        localizedError = `로그인 오류: ${error.message}`;
      }
      setLoginError(localizedError);
    } finally {
      setIsLoggingIn(false);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
    localStorage.setItem('isGuest', 'true');
    const defaultGuest: UserProfile = {
      uid: 'guest',
      name: '게스트 탐험가',
      grade: '게스트',
      class: '탐험대',
      role: 'student',
      score: 0,
      gameTickets: 0,
      completedStudyItems: [],
      dailyXP: 0,
      dailyScore: 0,
      lastXPDate: getCurrentDate(),
    };
    setProfile(defaultGuest);
    localStorage.setItem('guestProfile', JSON.stringify(defaultGuest));
    setView('home');
  };

  const handleLogout = async () => {
    localStorage.removeItem('isGuest');
    localStorage.removeItem('guestProfile');
    if (isGuest) {
      setIsGuest(false);
      setProfile(null);
      setView('home');
    } else {
      try {
        await signOut(auth);
        setUser(null);
        setProfile(null);
        setView('home');
      } catch (error) {
        console.error("Logout failed", error);
      }
    }
  };

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) {
      console.log("Login required");
      return;
    }
    
    const submitButton = e.currentTarget.querySelector('button[type="submit"]') as HTMLButtonElement;
    if (submitButton) submitButton.disabled = true;

    const formData = new FormData(e.currentTarget);
    const newProfile: UserProfile = {
      uid: user.uid,
      name: formData.get('name') as string,
      grade: formData.get('grade') as string,
      class: formData.get('class') as string,
      role: formData.get('role') as 'student' | 'teacher',
      score: 0,
      monthlyScore: 0,
      dailyScore: 0,
      dailyXP: 0,
      lastXPDate: getCurrentDate(),
      lastActiveMonth: getCurrentMonth(),
      completedStudyItems: [],
      dailyQuests: getRandomDailyQuests(),
      photoURL: user.photoURL || undefined,
    };

    console.log("Creating profile:", newProfile);

    try {
      // 1. Create user profile
      await setDoc(doc(db, 'users', user.uid), newProfile);
      
      // 2. Create public profile for rankings
      await setDoc(doc(db, 'publicProfiles', user.uid), {
        uid: newProfile.uid,
        name: newProfile.name,
        grade: newProfile.grade,
        class: newProfile.class,
        score: newProfile.score,
        monthlyScore: newProfile.monthlyScore,
        lastActiveMonth: newProfile.lastActiveMonth,
        dailyScore: 0,
        lastXPDate: getCurrentDate(),
        photoURL: newProfile.photoURL
      });

      console.log("Profile created successfully");
      setProfile(newProfile);
    } catch (error) {
      console.error("Profile creation failed:", error);
      if (submitButton) submitButton.disabled = false;
    }
  };

  const handleFinishQuiz = React.useCallback(async (quizScore: number, maxStreak: number, correctCount: number, totalCount: number, duration: number) => {
    if (profile) {
      const accuracy = correctCount / totalCount;
      const today = getCurrentDate();
      
      // Check for anti-spam (if duration is too short)
      if (duration < 3) {
        console.log("Quiz finished too quickly");
        return;
      }

      if (isGuest) {
        // Guest rewards: Only tickets for perfect score
        let newTickets = (profile.gameTickets || 0);
        if (correctCount === totalCount) {
          newTickets += 3;
          console.log("Perfect score! 3 tickets earned.");
        } else {
          console.log("Not a perfect score. No tickets earned.");
        }
        
        setProfile(prev => prev ? ({ 
          ...prev, 
          gameTickets: newTickets,
        }) : null);
        return;
      }

      const currentDailyXP = profile.lastXPDate === today ? (profile.dailyXP || 0) : 0;

      // Always award full quizScore as XP
      let xpToGain = quizScore;

      // Daily XP limit check
      if (currentDailyXP >= DAILY_XP_LIMIT) {
        xpToGain = 0;
        console.log("Daily XP limit reached.");
      } else if (currentDailyXP + xpToGain > DAILY_XP_LIMIT) {
        xpToGain = DAILY_XP_LIMIT - currentDailyXP;
      }

      const { newQuests, questXP, questTickets } = updateDailyQuests('quiz');
      const finalXP = xpToGain + questXP;

      const currentMonth = getCurrentMonth();
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + finalXP;
      const newLevel = getLevel(newTotalScore).name;
      
      const currentDailyScore = profile.lastXPDate === today ? (profile.dailyScore || 0) : 0;
      const newDailyScore = currentDailyScore + finalXP;

      // Handle monthly score
      let newMonthlyScore = (profile.monthlyScore || 0);
      if (profile.lastActiveMonth !== currentMonth) {
        newMonthlyScore = finalXP;
      } else {
        newMonthlyScore += finalXP;
      }

      // 10 questions -> 3 tickets (proportional)
      const newTickets = (profile.gameTickets || 0) + Math.floor((correctCount / 10) * 3) + questTickets;

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        const userRef = doc(db, 'users', profile.uid);
        const publicRef = doc(db, 'publicProfiles', profile.uid);
        
        await updateDoc(userRef, {
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          lastQuizDate: new Date().toISOString(),
          streak: maxStreak,
          gameTickets: newTickets,
          dailyXP: currentDailyXP + xpToGain,
          dailyScore: newDailyScore,
          lastXPDate: today,
          dailyQuests: newQuests
        });

        // Sync to public profile with full info to satisfy security rules
        await setDoc(publicRef, {
          uid: profile.uid,
          name: profile.name,
          grade: profile.grade,
          class: profile.class,
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          dailyScore: newDailyScore,
          lastXPDate: today,
          photoURL: profile.photoURL || ""
        }, { merge: true });
        
        await logActivity({
          activityType: 'quiz',
          duration,
          accuracy,
          xpGained: finalXP
        });

        setProfile(prev => prev ? ({ 
          ...prev, 
          score: newTotalScore, 
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          gameTickets: newTickets,
          dailyXP: currentDailyXP + xpToGain,
          dailyScore: newDailyScore,
          lastXPDate: today,
          dailyQuests: newQuests
        }) : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  }, [profile, isGuest]);

  const handleEarnXP = React.useCallback(async (xp: number, activityType: DailyQuest['type'] = 'study', accuracy: number = 1, duration: number = 10, questAmount: number = 1) => {
    if (profile) {
      if (isGuest) return; // Guests don't earn persistent XP
      const today = getCurrentDate();
      const currentDailyXP = profile.lastXPDate === today ? (profile.dailyXP || 0) : 0;

      let xpToGain = xp;

      // Daily XP limit check
      if (currentDailyXP >= DAILY_XP_LIMIT) {
        xpToGain = 0;
      } else if (currentDailyXP + xpToGain > DAILY_XP_LIMIT) {
        xpToGain = DAILY_XP_LIMIT - currentDailyXP;
      }

      const { newQuests, questXP, questTickets } = updateDailyQuests(activityType, questAmount);
      const finalXP = xpToGain + questXP;

      const currentMonth = getCurrentMonth();
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + finalXP;
      const newLevel = getLevel(newTotalScore).name;

      const currentDailyScore = profile.lastXPDate === today ? (profile.dailyScore || 0) : 0;
      const newDailyScore = currentDailyScore + finalXP;

      // Handle monthly score
      let newMonthlyScore = (profile.monthlyScore || 0);
      if (profile.lastActiveMonth !== currentMonth) {
        newMonthlyScore = finalXP;
      } else {
        newMonthlyScore += finalXP;
      }

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      const newTickets = (profile.gameTickets || 0) + questTickets;

      try {
        const userRef = doc(db, 'users', profile.uid);
        const publicRef = doc(db, 'publicProfiles', profile.uid);

        await updateDoc(userRef, {
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          dailyXP: currentDailyXP + xpToGain,
          dailyScore: newDailyScore,
          lastXPDate: today,
          dailyQuests: newQuests,
          gameTickets: newTickets
        });

        // Sync to public profile with full info to satisfy security rules
        await setDoc(publicRef, {
          uid: profile.uid,
          name: profile.name,
          grade: profile.grade,
          class: profile.class,
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          dailyScore: newDailyScore,
          lastXPDate: today,
          photoURL: profile.photoURL || ""
        }, { merge: true });

        await logActivity({
          activityType,
          duration,
          accuracy,
          xpGained: finalXP
        });

        setProfile(prev => prev ? ({ 
          ...prev, 
          score: newTotalScore, 
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          dailyXP: currentDailyXP + xpToGain,
          dailyScore: newDailyScore,
          lastXPDate: today,
          dailyQuests: newQuests,
          gameTickets: newTickets
        }) : null);
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  }, [profile, isGuest]);

  const handleToggleStudyItem = React.useCallback(async (itemId: string) => {
    if (!profile || (!user && !isGuest)) return;
    
    const currentCompleted = profile.completedStudyItems || [];
    const isCompleted = currentCompleted.includes(itemId);
    
    // Safety guard to solve the bug of repeated clicks / daily quest logs
    if (isCompleted) return;
    
    if (soundEnabled) {
      const audio = new Audio(ASSETS.sounds.joyful);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound play error:', e));
    }
    
    const newCompleted = [...currentCompleted, itemId];

    if (isGuest) {
      setProfile(prev => prev ? ({ ...prev, completedStudyItems: newCompleted }) : null);
      return;
    }
    
    let scoreChange = 30;
    
    const today = getCurrentDate();
    const currentMonth = getCurrentMonth();
    const currentDailyXP = profile.lastXPDate === today ? (profile.dailyXP || 0) : 0;

    let xpToGain = scoreChange;

    // Daily XP limit check
    if (currentDailyXP >= DAILY_XP_LIMIT) {
      xpToGain = 0;
    } else if (currentDailyXP + xpToGain > DAILY_XP_LIMIT) {
      xpToGain = DAILY_XP_LIMIT - currentDailyXP;
    }

    // Update daily quests for study
    let newQuests = profile.dailyQuests || DEFAULT_DAILY_QUESTS;
    let questXP = 0;
    let questTickets = 0;
    if (!isCompleted) {
      const result = updateDailyQuests('study', 1);
      newQuests = result.newQuests;
      questXP = result.questXP;
      questTickets = result.questTickets;
    }

    const finalXP = xpToGain + questXP;
    const finalNewScore = Math.max(0, profile.score + finalXP);
    const finalNewTickets = (profile.gameTickets || 0) + questTickets;
    
    const currentDailyScore = profile.lastXPDate === today ? (profile.dailyScore || 0) : 0;
    const newDailyScore = currentDailyScore + finalXP;

    // Handle monthly score update
    let newMonthlyScore = (profile.monthlyScore || 0);
    if (profile.lastActiveMonth !== currentMonth) {
      newMonthlyScore = Math.max(0, finalXP);
    } else {
      newMonthlyScore = Math.max(0, newMonthlyScore + finalXP);
    }
    
    try {
      const userRef = doc(db, 'users', user.uid);
      const publicRef = doc(db, 'publicProfiles', user.uid);

      await updateDoc(userRef, {
        completedStudyItems: newCompleted,
        score: finalNewScore,
        monthlyScore: newMonthlyScore,
        lastActiveMonth: currentMonth,
        dailyXP: currentDailyXP + xpToGain,
        dailyScore: newDailyScore,
        lastXPDate: today,
        dailyQuests: newQuests,
        gameTickets: finalNewTickets
      });

      // Sync to public profile with full info to satisfy security rules
      await setDoc(publicRef, {
        uid: profile.uid,
        name: profile.name,
        grade: profile.grade,
        class: profile.class,
        score: finalNewScore,
        monthlyScore: newMonthlyScore,
        lastActiveMonth: currentMonth,
        dailyScore: newDailyScore,
        lastXPDate: today,
        photoURL: profile.photoURL || ""
      }, { merge: true });

      setProfile(prev => prev ? ({ 
        ...prev, 
        completedStudyItems: newCompleted, 
        score: finalNewScore,
        monthlyScore: newMonthlyScore,
        lastActiveMonth: currentMonth,
        dailyXP: currentDailyXP + xpToGain,
        dailyScore: newDailyScore,
        lastXPDate: today,
        dailyQuests: newQuests,
        gameTickets: finalNewTickets
      }) : null);
      
      if (!isCompleted && xpToGain > 0) {
        await logActivity({
          activityType: 'study',
          xpGained: finalXP,
          accuracy: 1,
          duration: 10
        });
        confetti({
          particleCount: 30,
          spread: 50,
          origin: { y: 0.8 },
          colors: ['#4f46e5', '#10b981']
        });
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [profile, user, soundEnabled, isGuest]);

  const handleSaveReflection = React.useCallback(async () => {
    if (!user) return;
    
    // Validation: Check if there's meaningful content (at least 20 characters per answer)
    const answers = Object.values(reflectionData) as string[];
    const isMeaningful = answers.length >= 2 && answers.every(a => a.trim().length >= 20);
    if (!isMeaningful) {
      return;
    }

    try {
      await setDoc(doc(db, 'reflections', user.uid), reflectionData);
      handleEarnXP(50);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af']
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reflections/${user.uid}`);
    }
  }, [user, reflectionData]);

  const handleSaveATL = React.useCallback(async (key: string, value: number) => {
    if (!user) return;
    const newData = { ...atlData, [key]: value };
    setAtlData(newData);
    try {
      await setDoc(doc(db, 'atl', user.uid), newData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `atl/${user.uid}`);
    }
  }, [user, atlData]);

  const handleUseTicket = React.useCallback(async () => {
    if (!profile || (!user && !isGuest)) return;
    const newTickets = Math.max(0, (profile.gameTickets || 0) - 1);
    
    if (isGuest) {
      setProfile(prev => prev ? ({ ...prev, gameTickets: newTickets }) : null);
      return;
    }

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        gameTickets: newTickets
      });
      setProfile(prev => prev ? ({ ...prev, gameTickets: newTickets }) : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [profile, user, isGuest]);

  const handleUpdateProfile = async (data: Partial<UserProfile>) => {
    if (!user || !profile) return;
    try {
      const userRef = doc(db, 'users', user.uid);
      const publicRef = doc(db, 'publicProfiles', user.uid);

      await updateDoc(userRef, data);
      
      // Update public profile if relevant fields changed
      const publicData: any = {};
      if (data.name) publicData.name = data.name;
      if (data.grade) publicData.grade = data.grade;
      if (data.class) publicData.class = data.class;
      if (data.score !== undefined) publicData.score = data.score;
      if (data.monthlyScore !== undefined) publicData.monthlyScore = data.monthlyScore;
      if (data.photoURL) publicData.photoURL = data.photoURL;

      if (Object.keys(publicData).length > 0) {
        await setDoc(publicRef, publicData, { merge: true });
      }

      setProfile(prev => prev ? ({ ...prev, ...data }) : null);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
      throw error;
    }
  };

  const currentBgKey = !user ? 'login' : !profile ? 'setup' : view;

  // Navigation Guard
  useEffect(() => {
    const protectedViews = ['quiz', 'music-quiz', 'bingo', 'memory', 'flashcards', 'games'];
    const isProtected = protectedViews.includes(view);

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      const dontShowUntil = localStorage.getItem('dontShowExitConfirmUntil');
      const isMuted = dontShowUntil && new Date().getTime() < parseInt(dontShowUntil);

      if (isProtected && !isMuted) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    const handlePopState = (e: PopStateEvent) => {
      const dontShowUntil = localStorage.getItem('dontShowExitConfirmUntil');
      const isMuted = dontShowUntil && new Date().getTime() < parseInt(dontShowUntil);

      if (isProtected && !isMuted) {
        setPendingView('home');
        setShowExitConfirm(true);
      }
    };

    if (isProtected) {
      window.addEventListener('beforeunload', handleBeforeUnload);
      // Push an extra state so the back button triggers popstate instead of leaving
      // window.history.pushState(null, '', window.location.pathname);
      window.addEventListener('popstate', handlePopState);
    }

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
      window.removeEventListener('popstate', handlePopState);
    };
  }, [view]);

  const confirmExit = () => {
    if (dontShowForAWeek) {
      const oneWeekLater = new Date().getTime() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('dontShowExitConfirmUntil', oneWeekLater.toString());
    }

    if (pendingView) {
      setView(pendingView);
    } else {
      setView('home');
    }
    setShowExitConfirm(false);
    setPendingView(null);
    setDontShowForAWeek(false);
  };

  const handleProtectedViewChange = (newView: typeof view, initialStudyTab?: number) => {
    const protectedViews = ['quiz', 'music-quiz', 'bingo', 'memory', 'flashcards', 'games'];
    const dontShowUntil = localStorage.getItem('dontShowExitConfirmUntil');
    const isMuted = dontShowUntil && new Date().getTime() < parseInt(dontShowUntil);

    if (newView === 'study') {
      setStudyInitialTab(initialStudyTab);
    }

    if (protectedViews.includes(view) && newView === 'home' && !isMuted) {
      setPendingView(newView);
      setShowExitConfirm(true);
    } else {
      setView(newView);
    }
  };

  return (
    <div className="min-h-screen font-sans text-gray-900 relative overflow-x-hidden bg-indigo-50/30">
      {/* Dynamic Background Layer */}
      <AnimatePresence initial={false}>
        <motion.div
          key={currentBgKey}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.5, ease: "easeInOut" }}
          className="fixed inset-0 -z-10 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${backgrounds[currentBgKey]})` }}
        />
      </AnimatePresence>
      
      {/* Stable Overlay to prevent flickering */}
      <div className="fixed inset-0 -z-10 bg-white/70" />

      <LevelUpModal 
        show={showLevelUp} 
        onClose={() => setShowLevelUp(false)} 
        profile={profile} 
      />

      <AnnouncementPopup />
      <EventPopup />
      
      {/* Exit Confirmation Modal */}
      <AnimatePresence>
        {showExitConfirm && (
          <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-sm w-full border-4 border-rose-100 shadow-2xl text-center"
            >
              <div className="w-16 h-16 bg-rose-100 rounded-full flex items-center justify-center mb-6 mx-auto">
                <AlertTriangle className="w-8 h-8 text-rose-600" />
              </div>
              <h3 className="text-2xl font-black text-gray-900 mb-2">잠깐만요!</h3>
              <p className="text-gray-500 font-bold mb-6 leading-relaxed">
                지금 나가면 <span className="text-rose-600">진행 중인 학습 데이터가 사라집니다.</span> 정말 그만둘까요?
              </p>
              
              <div className="flex items-center justify-center gap-2 mb-8">
                <input 
                  type="checkbox" 
                  id="dontShow"
                  checked={dontShowForAWeek}
                  onChange={(e) => setDontShowForAWeek(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 text-rose-600 focus:ring-rose-500"
                />
                <label htmlFor="dontShow" className="text-sm font-bold text-gray-500 cursor-pointer">
                  일주일 동안 보지 않기
                </label>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="ghost" 
                  onClick={() => {
                    setShowExitConfirm(false);
                    setPendingView(null);
                  }}
                  className="flex-1 py-4 rounded-2xl font-black"
                >
                  계속하기
                </Button>
                <Button 
                  onClick={confirmExit}
                  className="flex-1 py-4 bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black shadow-lg shadow-rose-100"
                >
                  그만두기
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      
      <AnimatePresence mode="wait">
        <BackgroundMusic playing={bgMusicPlaying} volume={bgMusicVolume} />
        
        {!isAuthReady ? (
          <motion.div 
            key="loading" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white"
          >
            <div className="w-16 h-16 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin mb-4" />
            <p className="text-gray-500 font-bold animate-pulse">탐험대 상태 확인 중...</p>
          </motion.div>
        ) : !user && !isGuest ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginView 
              onLogin={handleLogin} 
              onGuestLogin={handleGuestLogin} 
              isLoggingIn={isLoggingIn} 
              loginError={loginError} 
            />
          </motion.div>
        ) : !profile ? (
          <motion.div key="setup" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <ProfileSetupView onCreateProfile={handleCreateProfile} />
          </motion.div>
        ) : (
          <motion.div
            key={view}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="relative z-10"
          >
            {view === 'home' && (
              <HomeView 
                user={user}
                profile={profile} 
                reflectionData={reflectionData} 
                setView={handleProtectedViewChange} 
                rankings={rankings}
                soundEnabled={soundEnabled} 
                setSoundEnabled={setSoundEnabled} 
                bgMusicPlaying={bgMusicPlaying}
                setBgMusicPlaying={setBgMusicPlaying}
                bgMusicVolume={bgMusicVolume}
                setBgMusicVolume={setBgMusicVolume}
                onLogout={handleLogout} 
                onUpdateProfile={handleUpdateProfile}
              />
            )}
            {view === 'study' && (
              <StudyView 
                setView={(v) => {
                  if (v !== 'study') {
                    setStudyInitialTab(undefined);
                  }
                  handleProtectedViewChange(v);
                }} 
                initialTab={studyInitialTab}
                atlData={atlData} 
                onSaveATL={handleSaveATL} 
                reflectionData={reflectionData} 
                setReflectionData={setReflectionData} 
                onSaveReflection={handleSaveReflection} 
                completedItems={profile?.completedStudyItems || []}
                onToggleItem={handleToggleStudyItem}
                onEarnXP={handleEarnXP}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'quiz' && (
              <QuizView 
                profile={profile}
                questions={quizQuestions}
                title="IB QUIZ"
                onFinish={handleFinishQuiz}
                onClose={() => handleProtectedViewChange('home')}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'music-quiz' && (
              <MusicQuizView 
                onFinish={handleFinishQuiz}
                onClose={() => handleProtectedViewChange('home')}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'bingo' && (
              <BingoGameView 
                setView={handleProtectedViewChange}
                onEarnXP={handleEarnXP}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'ranking' && (
              <RankingView 
                setView={handleProtectedViewChange} 
                rankings={rankings} 
              />
            )}
            {view === 'dashboard' && user?.email === '1004sugar1004@gmail.com' && (
              <TeacherDashboardView 
                setView={handleProtectedViewChange} 
              />
            )}
            {view === 'certificate' && (
              <CertificateView 
                profile={profile} 
                onClose={() => handleProtectedViewChange('home')} 
              />
            )}
            {view === 'plan' && (
              <PlanView 
                onClose={() => handleProtectedViewChange('home')} 
              />
            )}
            {view === 'flashcards' && (
              <FlashcardView 
                setView={handleProtectedViewChange} 
                onEarnXP={handleEarnXP} 
                soundEnabled={soundEnabled} 
              />
            )}
            {view === 'memory' && (
              <MemoryGameView 
                setView={handleProtectedViewChange} 
                onEarnXP={handleEarnXP} 
                soundEnabled={soundEnabled} 
              />
            )}
            {view === 'games' && (
              <GameCornerView 
                profile={profile}
                setView={handleProtectedViewChange} 
                onUseTicket={handleUseTicket}
                soundEnabled={soundEnabled} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Feedback Form */}
      {view === 'home' && profile && (
        <FeedbackForm profile={profile} />
      )}

      {/* Footer */}
      {view !== 'games' && (
        <footer className="relative z-10 py-12 text-center">
          <div className="max-w-4xl mx-auto px-4">
            <div className="h-px bg-gradient-to-r from-transparent via-gray-200 to-transparent mb-8" />
            <div className="flex flex-col items-center gap-4">
              <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm px-6 py-2 rounded-full border border-white/20 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Developer</span>
                <div className="w-1 h-1 bg-indigo-400 rounded-full" />
                <span className="text-sm font-bold text-gray-600">증평초 김혜진</span>
              </div>
              <p className="text-[10px] font-medium text-gray-400">© 2026 IB Explorer. All rights reserved.</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
