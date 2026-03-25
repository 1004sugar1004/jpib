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
import { FlashcardView } from './components/views/FlashcardView';
import { MemoryGameView } from './components/views/MemoryGameView';
import { GameCornerView } from './components/views/GameCornerView';
import { MusicQuizView } from './components/views/MusicQuizView';
import { CertificateView } from './components/views/CertificateView';
import { LevelUpModal } from './components/ui/LevelUpModal';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { UserProfile } from './types';
import { getLevel } from './lib/utils';
import { backgrounds } from './constants';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate'>('home');
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

  // Auth Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        try {
          const docRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(docRef);
          if (docSnap.exists()) {
            setProfile(docSnap.data() as UserProfile);
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
    // Fetch all users to ensure everyone is counted, even if score field is missing
    const q = query(collection(db, 'users'), limit(3000));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => {
        const userData = doc.data() as UserProfile;
        // Ensure scores are at least 0
        return { 
          ...userData, 
          score: userData.score || 0,
          monthlyScore: userData.monthlyScore || 0
        };
      });
      // Sort by score descending in memory
      data.sort((a, b) => b.score - a.score);
      console.log(`Fetched ${data.length} users for ranking.`);
      setRankings(data);
    }, (error) => {
      handleFirestoreError(error, OperationType.LIST, 'users');
    });
    return () => unsubscribe();
  }, [isAuthReady, user]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Login failed", error);
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
      lastActiveMonth: getCurrentMonth(),
      completedStudyItems: [],
      photoURL: user.photoURL || undefined,
    };
    try {
      await setDoc(doc(db, 'users', user.uid), newProfile);
      setProfile(newProfile);
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
    }
  };

  const handleFinishQuiz = React.useCallback(async (quizScore: number, maxStreak: number, correctCount: number) => {
    if (profile) {
      const currentMonth = getCurrentMonth();
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + quizScore;
      const newLevel = getLevel(newTotalScore).name;
      
      // Handle monthly score
      let newMonthlyScore = (profile.monthlyScore || 0);
      if (profile.lastActiveMonth !== currentMonth) {
        newMonthlyScore = quizScore;
      } else {
        newMonthlyScore += quizScore;
      }

      // 10 questions -> 3 tickets (proportional)
      const newTickets = (profile.gameTickets || 0) + Math.floor((correctCount / 10) * 3);

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          lastQuizDate: new Date().toISOString(),
          streak: maxStreak,
          gameTickets: newTickets
        });
        setProfile({ 
          ...profile, 
          score: newTotalScore, 
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth,
          gameTickets: newTickets 
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  }, [profile]);

  const handleEarnXP = React.useCallback(async (xp: number) => {
    if (profile) {
      const currentMonth = getCurrentMonth();
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + xp;
      const newLevel = getLevel(newTotalScore).name;

      // Handle monthly score
      let newMonthlyScore = (profile.monthlyScore || 0);
      if (profile.lastActiveMonth !== currentMonth) {
        newMonthlyScore = xp;
      } else {
        newMonthlyScore += xp;
      }

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          score: newTotalScore,
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth
        });
        setProfile({ 
          ...profile, 
          score: newTotalScore, 
          monthlyScore: newMonthlyScore,
          lastActiveMonth: currentMonth 
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  }, [profile]);

  const handleToggleStudyItem = React.useCallback(async (itemId: string) => {
    if (!profile || !user) return;
    
    const currentCompleted = profile.completedStudyItems || [];
    const isCompleted = currentCompleted.includes(itemId);
    
    if (!isCompleted && soundEnabled) {
      const audio = new Audio(ASSETS.sounds.joyful);
      audio.volume = 0.5;
      audio.play().catch(e => console.log('Sound play error:', e));
    }
    
    let newCompleted;
    let scoreChange = 0;
    
    if (isCompleted) {
      newCompleted = currentCompleted.filter(id => id !== itemId);
      scoreChange = -30;
    } else {
      newCompleted = [...currentCompleted, itemId];
      scoreChange = 30;
    }
    
    const newScore = Math.max(0, profile.score + scoreChange);
    const currentMonth = getCurrentMonth();
    
    // Handle monthly score update
    let newMonthlyScore = (profile.monthlyScore || 0);
    if (profile.lastActiveMonth !== currentMonth) {
      newMonthlyScore = Math.max(0, scoreChange);
    } else {
      newMonthlyScore = Math.max(0, newMonthlyScore + scoreChange);
    }
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        completedStudyItems: newCompleted,
        score: newScore,
        monthlyScore: newMonthlyScore,
        lastActiveMonth: currentMonth
      });
      setProfile({ 
        ...profile, 
        completedStudyItems: newCompleted, 
        score: newScore,
        monthlyScore: newMonthlyScore,
        lastActiveMonth: currentMonth
      });
      
      if (!isCompleted) {
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
  }, [profile, user, soundEnabled]);

  const handleSaveReflection = React.useCallback(async () => {
    if (!user) return;
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
    if (!profile || !user) return;
    const newTickets = Math.max(0, (profile.gameTickets || 0) - 1);
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        gameTickets: newTickets
      });
      setProfile({ ...profile, gameTickets: newTickets });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `users/${user.uid}`);
    }
  }, [profile, user]);

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
        {!user ? (
          <motion.div key="login" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
            <LoginView onLogin={handleLogin} />
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
                onLogout={() => signOut(auth)} 
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
            {view === 'certificate' && (
              <CertificateView 
                profile={profile} 
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
