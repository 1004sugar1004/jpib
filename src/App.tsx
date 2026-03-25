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
import { quizQuestions } from './content';
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
import { LevelUpModal } from './components/ui/LevelUpModal';
import { BackgroundMusic } from './components/ui/BackgroundMusic';
import { UserProfile } from './types';
import { getLevel } from './lib/utils';
import { backgrounds } from './constants';

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games' | 'memory'>('home');
  const [rankings, setRankings] = useState<UserProfile[]>([]);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [bgMusicPlaying, setBgMusicPlaying] = useState(false);
  const [bgMusicVolume, setBgMusicVolume] = useState(0.5);
  
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [reflectionData, setReflectionData] = useState<Record<string, string>>({});
  const [atlData, setAtlData] = useState<Record<string, number>>({});

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
    const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(30));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => doc.data() as UserProfile);
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
      completedStudyItems: [],
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
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + quizScore;
      const newLevel = getLevel(newTotalScore).name;
      // 10 questions -> 3 tickets (proportional)
      const newTickets = (profile.gameTickets || 0) + Math.floor((correctCount / 10) * 3);

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          score: newTotalScore,
          lastQuizDate: new Date().toISOString(),
          streak: maxStreak,
          gameTickets: newTickets
        });
        setProfile({ ...profile, score: newTotalScore, gameTickets: newTickets });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  }, [profile]);

  const handleEarnXP = React.useCallback(async (xp: number) => {
    if (profile) {
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + xp;
      const newLevel = getLevel(newTotalScore).name;

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          score: newTotalScore
        });
        setProfile({ ...profile, score: newTotalScore });
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
    
    try {
      await updateDoc(doc(db, 'users', user.uid), {
        completedStudyItems: newCompleted,
        score: newScore
      });
      setProfile({ ...profile, completedStudyItems: newCompleted, score: newScore });
      
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
    </div>
  );
}
