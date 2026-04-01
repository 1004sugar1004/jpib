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
import { CertificateView } from './components/views/CertificateView';
import { PlanView } from './components/views/PlanView';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { UserProfile, ActivityLog, DailyQuest } from './types';
import { getLevel } from './lib/utils';
import { backgrounds } from './constants';

const DAILY_XP_LIMIT = 500;

const DEFAULT_DAILY_QUESTS: DailyQuest[] = [
  { id: 'q1', title: '지식탐험 모든 키워드 완독', description: '지식 탐험의 모든 항목(34개)을 읽고 확인하세요.', type: 'study', target: 34, progress: 0, completed: false, xpReward: 150 },
  { id: 'q2', title: '플래시카드 10개 학습', description: '플래시카드를 10번 뒤집어 학습하세요.', type: 'flashcards', target: 10, progress: 0, completed: false, xpReward: 30 },
  { id: 'q3', title: '메모리 게임 1회 승리', description: '메모리 게임을 한 판 완료하세요.', type: 'memory', target: 1, progress: 0, completed: false, xpReward: 40 },
];

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard'>('home');
  const [rankings, setRankings] = useState<UserProfile[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.5);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
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
    if (!profile) return { newQuests: [], questXP: 0 };
    const quests = profile.dailyQuests || DEFAULT_DAILY_QUESTS;
    let questXP = 0;
    const newQuests = quests.map(q => {
      if (q.type === type && !q.completed) {
        const newProgress = q.progress + amount;
        const completed = newProgress >= q.target;
        if (completed) questXP += q.xpReward;
        return { ...q, progress: newProgress, completed };
      }
      return q;
    });
    return { newQuests, questXP };
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
                dailyQuests: DEFAULT_DAILY_QUESTS,
                completedStudyItems: [] // Reset study items daily
              };
              await updateDoc(docRef, {
                dailyXP: 0,
                dailyScore: 0,
                lastXPDate: today,
                activityCounts: {},
                dailyQuests: DEFAULT_DAILY_QUESTS,
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
            setProfile(userData);
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${firebaseUser.uid}`);
        }
      } else {
        setProfile(null);
      }
      setIsAuthReady(true);
    });
    return () => unsubscribe();
  }, []);

  // Ranking Listener
  useEffect(() => {
    if (!isAuthReady || !user) return;
    // Fetch from publicProfiles instead of users to avoid permission errors and PII leaks
    const q = query(collection(db, 'publicProfiles'), limit(3000));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const today = getCurrentDate();
      const currentMonth = getCurrentMonth();
      const data = snapshot.docs.map(doc => {
        const userData = doc.data() as any;
        return { 
          ...userData, 
          score: userData.score || 0,
          monthlyScore: userData.lastActiveMonth === currentMonth ? (userData.monthlyScore || 0) : 0,
          dailyScore: userData.lastXPDate === today ? (userData.dailyScore || 0) : 0
        };
      });
      // Sort by score descending in memory
      data.sort((a, b) => b.score - a.score);
      console.log(`Fetched ${data.length} users for ranking.`);
      setRankings(data as UserProfile[]);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'publicProfiles');
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      setIsGuest(false);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleGuestLogin = () => {
    setIsGuest(true);
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
    setView('home');
  };

  const handleLogout = async () => {
    if (isGuest) {
      setIsGuest(false);
      setProfile(null);
      setView('home');
    } else {
      await signOut(auth);
    }
  };

  const handleCreateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!user) return;
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
      photoURL: user.photoURL || undefined,
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      // Also create public profile for rankings
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
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const handleFinishQuiz = React.useCallback(async (quizScore: number, maxStreak: number, correctCount: number, totalCount: number, duration: number) => {
    if (profile) {
      const accuracy = correctCount / totalCount;
      const today = getCurrentDate();
      
      // Check for anti-spam (if duration is too short)
      if (duration < 3) {
        alert("너무 빨리 풀었어요! 잠시 쉬어 가세요.");
        return;
      }

      if (isGuest) {
        // Guest rewards: Only tickets for perfect score
        let newTickets = (profile.gameTickets || 0);
        if (correctCount === totalCount) {
          newTickets += 3;
          alert("만점입니다! 게임 티켓 3장을 획득했습니다!");
        } else {
          alert("정답률이 100%가 아니라 티켓을 획득하지 못했습니다. 만점에 도전해보세요!");
        }
        
        setProfile(prev => prev ? ({ 
          ...prev, 
          gameTickets: newTickets,
        }) : null);
        return;
      }

      const currentDailyXP = profile.lastXPDate === today ? (profile.dailyXP || 0) : 0;

      // Accuracy check: Only give XP if accuracy >= 80%
      let xpToGain = quizScore;
      if (accuracy < 0.8) {
        xpToGain = 0;
        alert("정답률이 80% 미만이라 경험치를 획득하지 못했습니다. 다시 도전해보세요!");
      }

      // Daily XP limit check
      if (currentDailyXP >= DAILY_XP_LIMIT) {
        xpToGain = 0;
        alert(`오늘 획득할 수 있는 기본 경험치 상한선(${DAILY_XP_LIMIT}XP)에 도달했습니다. 일일 퀘스트 보상은 계속 받을 수 있습니다!`);
      } else if (currentDailyXP + xpToGain > DAILY_XP_LIMIT) {
        xpToGain = DAILY_XP_LIMIT - currentDailyXP;
      }

      const { newQuests, questXP } = updateDailyQuests('quiz');
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
      const newTickets = (profile.gameTickets || 0) + Math.floor((correctCount / 10) * 3);

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

      const { newQuests, questXP } = updateDailyQuests(activityType, questAmount);
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
          dailyQuests: newQuests
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
    
    if (!isCompleted && soundEnabled) {
      const audio = new Audio(ASSETS.sounds.joyful);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound play error:', e));
    }
    
    let newCompleted;
    if (isCompleted) {
      newCompleted = currentCompleted.filter(id => id !== itemId);
    } else {
      newCompleted = [...currentCompleted, itemId];
    }

    if (isGuest) {
      setProfile(prev => prev ? ({ ...prev, completedStudyItems: newCompleted }) : null);
      return;
    }
    
    let scoreChange = isCompleted ? -30 : 30;
    
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
    if (!isCompleted) {
      const result = updateDailyQuests('study', 1);
      newQuests = result.newQuests;
      questXP = result.questXP;
    }

    const finalXP = xpToGain + questXP;
    const finalNewScore = Math.max(0, profile.score + finalXP);
    
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
        dailyQuests: newQuests
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
        dailyQuests: newQuests
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
    
    // Validation: Check if there's meaningful content (at least 10 characters)
    const allText = Object.values(reflectionData).join('').trim();
    if (allText.length < 10) {
      // We'll handle the UI feedback in the component, 
      // but this is a safety check.
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

  if (!isAuthReady) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-indigo-50">
        <motion.div 
          animate={{ rotate: 360 }}
          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
          className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  const currentBgKey = !user ? 'login' : !profile ? 'setup' : view;

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
      
      <AnimatePresence mode="wait">
        <BackgroundMusic playing={bgMusicPlaying} volume={bgMusicVolume} />
        {!user && !isGuest ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginView onLogin={handleLogin} onGuestLogin={handleGuestLogin} />
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
                profile={profile} 
                reflectionData={reflectionData} 
                setView={setView} 
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
                setView={setView} 
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
                onClose={() => setView('home')}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'music-quiz' && (
              <MusicQuizView 
                onFinish={handleFinishQuiz}
                onClose={() => setView('home')}
                soundEnabled={soundEnabled}
              />
            )}
            {view === 'ranking' && (
              <RankingView 
                setView={setView} 
                rankings={rankings} 
              />
            )}
            {view === 'dashboard' && profile?.name === '김혜진' && (
              <TeacherDashboardView 
                setView={setView} 
              />
            )}
            {view === 'certificate' && (
              <CertificateView 
                profile={profile} 
                onClose={() => setView('home')} 
              />
            )}
            {view === 'plan' && (
              <PlanView 
                onClose={() => setView('home')} 
              />
            )}
            {view === 'flashcards' && (
              <FlashcardView 
                setView={setView} 
                onEarnXP={handleEarnXP} 
                soundEnabled={soundEnabled} 
              />
            )}
            {view === 'memory' && (
              <MemoryGameView 
                setView={setView} 
                onEarnXP={handleEarnXP} 
                soundEnabled={soundEnabled} 
              />
            )}
            {view === 'games' && (
              <GameCornerView 
                profile={profile}
                setView={setView} 
                onUseTicket={handleUseTicket}
                soundEnabled={soundEnabled} 
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>

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
