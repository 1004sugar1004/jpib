import React, { useState, useEffect, useMemo, Component, ReactNode } from 'react';
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
import { 
  ibLearnerProfile, 
  ibThemes, 
  ibKeyConcepts, 
  ibInquiryCycle, 
  ibATL, 
  ibReflectionQuestions,
  quizQuestions, 
  QuizQuestion 
} from './content';
import { ASSETS } from './assets';
import confetti from 'canvas-confetti';
import { 
  BookOpen, 
  Trophy, 
  Gamepad2, 
  LogOut, 
  User, 
  ChevronRight, 
  CheckCircle2, 
  XCircle, 
  ArrowLeft,
  GraduationCap,
  School,
  UserCircle,
  AlertCircle,
  RefreshCcw,
  Star,
  Zap,
  Timer,
  Compass,
  Map as MapIcon,
  Sparkles,
  Flame,
  Target,
  Music,
  Volume2,
  VolumeX,
  Play,
  Pause,
  Box,
  Settings,
  Link,
  Eye,
  ShieldCheck,
  Search,
  MessageSquare,
  Globe,
  Clock,
  Lightbulb
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Utility ---
function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---
interface UserProfile {
  uid: string;
  name: string;
  grade: string;
  class: string;
  score: number;
  lastQuizDate?: string;
  level?: number;
  streak?: number;
  completedStudyItems?: string[];
}

const getLevel = (score: number) => {
  if (score < 100) return { name: '초보 탐험가', color: 'text-gray-500', bg: 'bg-gray-100', img: ASSETS.characters.explorer_beginner };
  if (score < 300) return { name: '견습 탐험가', color: 'text-emerald-500', bg: 'bg-emerald-100', img: ASSETS.characters.explorer_apprentice };
  if (score < 600) return { name: '숙련 탐험가', color: 'text-blue-500', bg: 'bg-blue-100', img: ASSETS.characters.explorer_skilled };
  if (score < 1000) return { name: '베테랑 탐험가', color: 'text-purple-500', bg: 'bg-purple-100', img: ASSETS.characters.explorer_veteran };
  return { name: '전설의 탐험가', color: 'text-yellow-500', bg: 'bg-yellow-100', img: ASSETS.characters.explorer_legend };
};

// --- Components ---

const Card = ({ children, className }: { children: React.ReactNode; className?: string; key?: React.Key }) => (
  <div className={cn("bg-white rounded-[2.5rem] shadow-sm border border-gray-100 overflow-hidden", className)}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'primary', 
  className,
  disabled,
  icon: Icon
}: { 
  children: React.ReactNode; 
  onClick?: () => void; 
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  className?: string;
  disabled?: boolean;
  icon?: any;
}) => {
  const variants = {
    primary: "bg-indigo-600 text-white hover:bg-indigo-700 shadow-indigo-100",
    secondary: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-100",
    outline: "border-2 border-indigo-600 text-indigo-600 hover:bg-indigo-50",
    ghost: "text-gray-600 hover:bg-gray-100"
  };

  return (
    <button 
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all active:scale-95 disabled:opacity-50 disabled:pointer-events-none shadow-lg",
        variants[variant],
        className
      )}
    >
      {Icon && <Icon className="w-5 h-5" />}
      {children}
    </button>
  );
};

// --- View Props Interfaces ---

interface LoginViewProps {
  onLogin: () => void;
}

interface ProfileSetupViewProps {
  onCreateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
}

interface HomeViewProps {
  profile: UserProfile | null;
  reflectionData: Record<string, string>;
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  bgMusicPlaying: boolean;
  setBgMusicPlaying: (playing: boolean) => void;
  bgMusicVolume: number;
  setBgMusicVolume: (volume: number) => void;
  onLogout: () => void;
}

interface StudyViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking') => void;
  atlData: Record<string, number>;
  onSaveATL: (key: string, value: number) => void;
  reflectionData: Record<string, string>;
  setReflectionData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSaveReflection: () => void;
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  soundEnabled: boolean;
}

interface QuizViewProps {
  profile: UserProfile | null;
  onFinish: (score: number, maxStreak: number) => Promise<void>;
  onClose: () => void;
  soundEnabled: boolean;
}

interface RankingViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking') => void;
  rankings: UserProfile[];
}

interface LevelUpModalProps {
  show: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

// --- Views ---

const LevelUpModal = ({ show, onClose, profile }: LevelUpModalProps) => {
  const level = getLevel(profile?.score || 0);
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 100 }}
            className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white -z-10" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6"
            >
              <img src={ASSETS.characters.level_up} alt="Level Up" className="w-32 h-32 mx-auto drop-shadow-xl" referrerPolicy="no-referrer" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">LEVEL UP!</h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest">새로운 칭호를 획득했습니다</p>
            
            <div className={cn("p-6 rounded-3xl mb-8 border-2 border-dashed flex flex-col items-center", level.bg, level.color.replace('text', 'border'))}>
              <img src={level.img} alt={level.name} className="w-16 h-16 mb-3 object-contain" referrerPolicy="no-referrer" />
              <p className="text-2xl font-black">{level.name}</p>
            </div>
            
            <Button onClick={onClose} className="w-full py-4 text-xl">
              계속 탐험하기
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

const LoginView = ({ onLogin }: LoginViewProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden border border-white/20"
    >
      <div className="absolute -top-10 -right-10 opacity-10">
        <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-40 h-40" referrerPolicy="no-referrer" />
      </div>
      <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 overflow-hidden">
        <img src={ASSETS.quiz.logo} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">증평 IB 탐험대</h1>
      <p className="text-gray-600 mb-8">IB 이론을 배우고 퀴즈를 풀며 탐험을 시작해볼까요?</p>
      <Button onClick={onLogin} className="w-full py-4 text-lg" icon={UserCircle}>
        구글 계정으로 시작하기
      </Button>
    </motion.div>
  </div>
);

const ProfileSetupView = ({ onCreateProfile }: ProfileSetupViewProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <Card className="max-w-md w-full p-10 bg-white/90 backdrop-blur-md rounded-[3rem] border-white/20 shadow-2xl">
      <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">프로필 설정</h2>
      <form onSubmit={onCreateProfile} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
          <div className="relative">
            <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input name="grade" required placeholder="예: 3학년" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">반</label>
          <div className="relative">
            <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input name="class" required placeholder="예: 1반" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
          <div className="relative">
            <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
            <input name="name" required placeholder="이름을 입력하세요" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
          </div>
        </div>
        <Button className="w-full mt-4">탐험 시작하기</Button>
      </form>
    </Card>
  </div>
);

const HomeView = ({ 
  profile, 
  reflectionData, 
  setView, 
  soundEnabled, 
  setSoundEnabled, 
  bgMusicPlaying,
  setBgMusicPlaying,
  bgMusicVolume,
  setBgMusicVolume,
  onLogout 
}: HomeViewProps) => {
  const level = getLevel(profile?.score || 0);
  const studyProgress = Math.floor((Object.keys(reflectionData).length / ibReflectionQuestions.length) * 100);
  
  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-48 h-48 object-contain" referrerPolicy="no-referrer" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative">
            <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden", level.bg)}>
              <img src={level.img} alt={level.name} className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg border-2 border-white">
              <Star className="w-4 h-4 fill-current" />
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <h2 className="text-2xl font-black text-gray-900">{profile?.name} 탐험가님</h2>
              <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", level.bg, level.color)}>
                {level.name}
              </span>
            </div>
            <p className="text-gray-500 font-medium mb-4">{profile?.grade} {profile?.class} • 증평초등학교</p>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-bold text-gray-400">탐험 경험치 (XP)</span>
                <span className="font-black text-indigo-600">{profile?.score} XP</span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min((profile?.score || 0) / 10, 100)}%` }}
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                />
              </div>
            </div>
          </div>
          
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2 bg-gray-50/50 p-2 rounded-2xl border border-gray-100">
              <Button 
                variant="ghost" 
                onClick={() => setBgMusicPlaying(!bgMusicPlaying)} 
                icon={bgMusicPlaying ? Music : VolumeX} 
                className={cn("w-10 h-10 p-0 rounded-xl", bgMusicPlaying ? "text-indigo-600 bg-indigo-50" : "text-gray-400")}
              >
                {""}
              </Button>
              <div className="flex flex-col gap-1 pr-2">
                <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">배경음악</span>
                <input 
                  type="range" 
                  min="0" 
                  max="1" 
                  step="0.01" 
                  value={bgMusicVolume} 
                  onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                  className="w-20 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
              </div>
            </div>
            <Button variant="ghost" onClick={() => setSoundEnabled(!soundEnabled)} icon={soundEnabled ? Zap : Flame} className="text-gray-400">
              {soundEnabled ? "효과음 ON" : "효과음 OFF"}
            </Button>
            <Button variant="ghost" onClick={onLogout} icon={LogOut} className="text-gray-400 hover:text-red-500">
              로그아웃
            </Button>
          </div>
        </div>
      </header>

      {/* XP Guide Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center">
            <Sparkles className="w-6 h-6 text-indigo-600" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-gray-900">XP 획득 가이드</h3>
            <p className="text-gray-500 font-bold text-sm uppercase tracking-widest">HOW TO EARN XP</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <BookOpen className="w-8 h-8 text-blue-600" />
            </div>
            <div>
              <h4 className="font-black text-blue-900">지식 탐험</h4>
              <p className="text-sm text-blue-700 font-bold">항목당 +10 XP</p>
              <p className="text-xs text-blue-500 mt-1">IB 핵심 개념을 학습하고 체크하세요!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Trophy className="w-8 h-8 text-purple-600" />
            </div>
            <div>
              <h4 className="font-black text-purple-900">퀴즈 챌린지</h4>
              <p className="text-sm text-purple-700 font-bold">정답당 +20 XP ~</p>
              <p className="text-xs text-purple-500 mt-1">빠른 정답과 콤보로 추가 보너스 XP!</p>
            </div>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('study')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-blue-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-blue-50/30">
            <div className="w-20 h-20 bg-blue-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-blue-100 overflow-hidden">
              <img src={ASSETS.quiz.logo} alt="Knowledge" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">지식 탐험</h3>
            <p className="text-gray-500 text-sm font-medium">IB의 핵심 가치와 기술을 마스터하세요!</p>
            
            <div className="w-full mt-4 space-y-1">
              <div className="flex justify-between text-[10px] font-black text-blue-400 uppercase">
                <span>QUEST PROGRESS</span>
                <span>{studyProgress}%</span>
              </div>
              <div className="h-1.5 bg-blue-100 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${studyProgress}%` }}
                  className="h-full bg-blue-500"
                />
              </div>
            </div>

            <div className="mt-6 flex items-center gap-1 text-blue-600 font-bold text-sm">
              탐험 시작하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('quiz')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-emerald-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-emerald-50/30">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-100 overflow-hidden">
              <img src={ASSETS.quiz.quiz_icon} alt="Quiz" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">퀴즈 챌린지</h3>
            <p className="text-gray-500 text-sm font-medium">도전! 퀴즈를 풀고 XP를 획득하세요.</p>
            <div className="mt-6 flex items-center gap-1 text-emerald-600 font-bold text-sm">
              도전하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('ranking')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-yellow-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-yellow-50/30">
            <div className="w-20 h-20 bg-yellow-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-yellow-100 overflow-hidden">
              <img src={ASSETS.quiz.ranking_icon} alt="Ranking" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">명예의 전당</h3>
            <p className="text-gray-500 text-sm font-medium">최고의 탐험가는 누구일까요?</p>
            <div className="mt-6 flex items-center gap-1 text-yellow-600 font-bold text-sm">
              순위 확인 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

const StudyView = ({ 
  setView, 
  atlData, 
  onSaveATL, 
  reflectionData, 
  setReflectionData, 
  onSaveReflection,
  completedItems,
  onToggleItem,
  soundEnabled
}: StudyViewProps) => {
  const [activeTab, setActiveTab] = useState(0);
  
  const randomQuestions = useMemo(() => {
    return [...ibReflectionQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
  }, []);

  const tabs = [
    { id: 0, label: "학습자상", icon: UserCircle, color: "bg-indigo-500" },
    { id: 1, label: "탐구 주제", icon: School, color: "bg-emerald-500" },
    { id: 2, label: "핵심 개념", icon: AlertCircle, color: "bg-amber-500" },
    { id: 3, label: "탐구 사이클", icon: RefreshCcw, color: "bg-blue-500" },
    { id: 4, label: "ATL 기술", icon: GraduationCap, color: "bg-purple-500" },
    { id: 5, label: "성찰 일지", icon: BookOpen, color: "bg-rose-500" },
  ];

  const StudyCheck = ({ id, completed, onToggle }: { id: string, completed: boolean, onToggle: (id: string) => void }) => (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={() => onToggle(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2 w-fit",
        completed 
          ? "bg-green-500 border-transparent text-white shadow-lg shadow-green-100" 
          : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
      )}
    >
      {completed ? <CheckCircle2 className="w-4 h-4" /> : <div className="w-4 h-4 rounded-full border-2 border-gray-200" />}
      {completed ? "이해했습니다! (+10 XP)" : "읽고 이해했습니다"}
    </motion.button>
  );

  return (
    <div className="max-w-5xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="w-fit">
            기지로 돌아가기
          </Button>
          <div className="text-right">
            <h1 className="text-3xl font-black text-indigo-900 flex items-center gap-3 justify-end">
              <div className="w-12 h-12 bg-indigo-100 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-indigo-100">
                <img src={ASSETS.quiz.logo} alt="Knowledge" className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
              </div>
              지식 탐험 가이드
            </h1>
            <p className="text-gray-500 font-bold">IB PYP 탐구의 모든 것을 마스터하세요!</p>
          </div>
        </div>
      </header>

      {/* Quest Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab) => (
          <motion.button
            key={tab.id}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2",
              activeTab === tab.id 
                ? cn("border-transparent text-white shadow-xl", tab.color)
                : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
            )}
          >
            <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-white" : "text-gray-300")} />
            <span className="text-xs font-black uppercase tracking-tighter">{tab.label}</span>
          </motion.button>
        ))}
      </div>
      
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab === 0 && (
            <section className="space-y-8 relative">
              <motion.img 
                src={ASSETS.quiz.logo} 
                className="absolute -left-10 top-40 w-20 h-20 opacity-10 -z-10"
                animate={{ rotate: [0, 10, -10, 0] }}
                transition={{ repeat: Infinity, duration: 5 }}
                referrerPolicy="no-referrer"
              />
              <div className="bg-indigo-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-indigo-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -right-4 -bottom-4 opacity-40 w-64 h-64"
                >
                  <img src={ASSETS.quiz.decoration} alt="Learner Profile" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 01</span>
                  <h2 className="text-4xl font-black mb-4">IB 학습자상 (Learner Profile)</h2>
                  <p className="text-indigo-100 text-lg font-medium max-w-2xl">IB 교육이 추구하는 10가지 인재의 모습입니다. 탐구 과정에서 지속적으로 길러야 할 자질입니다.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ibLearnerProfile.map((item, idx) => (
                  <motion.div key={idx} whileHover={{ scale: 1.02 }}>
                    <Card className="p-8 hover:shadow-2xl transition-all border-b-4 border-b-indigo-500 h-full flex flex-col">
                      <div className="flex items-center gap-4 mb-6">
                        <div className="w-12 h-12 bg-indigo-100 text-indigo-600 rounded-2xl flex items-center justify-center font-black text-xl">
                          {idx + 1}
                        </div>
                        <div className="flex items-center gap-3">
                          <h4 className="text-2xl font-black text-gray-900">{item.title}</h4>
                          {item.image && (
                            <img src={item.image} alt="" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                          )}
                        </div>
                      </div>
                      <p className="text-gray-600 mb-6 font-medium leading-relaxed flex-grow">{item.description}</p>
                      <div className="space-y-3 mb-6">
                        {item.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex items-start gap-3 p-3 bg-indigo-50/50 rounded-xl">
                            <CheckCircle2 className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
                            <span className="text-sm font-bold text-indigo-900/70">{detail}</span>
                          </div>
                        ))}
                      </div>
                      <StudyCheck 
                        id={`lp-${item.title}`} 
                        completed={completedItems.includes(`lp-${item.title}`)} 
                        onToggle={onToggleItem} 
                      />
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 1 && (
            <section className="space-y-8 relative">
              <motion.img 
                src={ASSETS.quiz.decoration} 
                className="absolute -left-10 top-20 w-24 h-24 opacity-10 -z-10"
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 25, ease: "linear" }}
                referrerPolicy="no-referrer"
              />
              <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ rotate: [0, 5, 0] }}
                  transition={{ repeat: Infinity, duration: 5, ease: "easeInOut" }}
                  className="absolute -right-8 -bottom-8 opacity-40 w-72 h-72"
                >
                  <img src={ASSETS.quiz.ranking_icon} alt="Themes" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 02</span>
                  <h2 className="text-4xl font-black mb-4">초학문적 주제 (Themes)</h2>
                  <p className="text-emerald-100 text-lg font-medium max-w-2xl">우리가 세상을 탐구하는 6가지 큰 틀입니다. 교과서 단원과 연결하여 생각해보세요.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ibThemes.map((item, idx) => (
                  <Card key={idx} className="p-8 border-l-8 border-l-emerald-500 flex flex-col">
                    <div className="flex items-center gap-4 mb-4">
                      <h4 className="text-2xl font-black text-emerald-600">{item.title}</h4>
                      {item.image && (
                        <img src={item.image} alt="" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                      )}
                    </div>
                    <p className="text-gray-600 mb-6 font-bold leading-relaxed">{item.description}</p>
                    <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100 mb-6 flex-grow">
                      <p className="text-xs font-black text-gray-400 mb-4 uppercase tracking-widest">학년별 탐구 질문</p>
                      <ul className="space-y-4">
                        {item.details.map((detail, dIdx) => (
                          <li key={dIdx} className="text-sm font-bold text-gray-700 flex items-start gap-3">
                            <div className="w-6 h-6 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center text-[10px] flex-shrink-0 mt-0.5">
                              {dIdx + 4}
                            </div>
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <StudyCheck 
                      id={`theme-${item.title}`} 
                      completed={completedItems.includes(`theme-${item.title}`)} 
                      onToggle={onToggleItem} 
                    />
                  </Card>
                ))}
              </div>
            </section>
          )}

          {activeTab === 2 && (
            <section className="space-y-8 relative">
              <motion.img 
                src={ASSETS.quiz.daily_mission} 
                className="absolute -right-10 top-40 w-20 h-20 opacity-10 -z-10"
                animate={{ y: [0, -20, 0] }}
                transition={{ repeat: Infinity, duration: 3 }}
                referrerPolicy="no-referrer"
              />
              <div className="bg-amber-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-amber-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
                  className="absolute -right-4 -bottom-4 opacity-40 w-64 h-64"
                >
                  <img src={ASSETS.quiz.logo} alt="Key Concepts" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 03</span>
                  <h2 className="text-4xl font-black mb-4">핵심 개념 (Key Concepts)</h2>
                  <p className="text-amber-50 text-lg font-medium max-w-2xl">질문 렌즈를 통해 세상을 더 깊이 있게 탐구합니다.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ibKeyConcepts.map((item, idx) => {
                  const ConceptIcon = (() => {
                    if (item.title.includes('형태')) return Box;
                    if (item.title.includes('기능')) return Settings;
                    if (item.title.includes('인과')) return Zap;
                    if (item.title.includes('변화')) return RefreshCcw;
                    if (item.title.includes('연결')) return Link;
                    if (item.title.includes('관점')) return Eye;
                    if (item.title.includes('책임')) return ShieldCheck;
                    return AlertCircle;
                  })();

                  return (
                    <Card key={idx} className="p-8 border-t-8 border-t-amber-400 hover:shadow-2xl transition-all flex flex-col">
                      <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-6">
                        <ConceptIcon className="w-6 h-6 text-amber-600" />
                      </div>
                      <div className="flex items-center gap-4 mb-4">
                        <h4 className="text-2xl font-black text-amber-600">{item.title}</h4>
                        {item.image && (
                          <img src={item.image} alt="" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <p className="text-sm font-black text-gray-400 mb-6 italic uppercase tracking-widest">{item.description}</p>
                      <ul className="space-y-3 mb-6 flex-grow">
                        {item.details.map((detail, dIdx) => (
                          <li key={dIdx} className="text-sm font-bold text-gray-700 flex items-start gap-3 p-3 bg-amber-50/30 rounded-xl">
                            <ChevronRight className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                      <StudyCheck 
                        id={`kc-${item.title}`} 
                        completed={completedItems.includes(`kc-${item.title}`)} 
                        onToggle={onToggleItem} 
                      />
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 3 && (
            <section className="space-y-8 relative">
              <motion.img 
                src={ASSETS.quiz.quiz_icon} 
                className="absolute -left-10 bottom-20 w-24 h-24 opacity-10 -z-10"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ repeat: Infinity, duration: 4 }}
                referrerPolicy="no-referrer"
              />
              <div className="bg-blue-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  className="absolute -right-12 -bottom-12 opacity-30 w-80 h-80"
                >
                  <img src={ASSETS.quiz.quiz_icon} alt="Inquiry Cycle" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 04</span>
                  <h2 className="text-4xl font-black mb-4">탐구 사이클 (Inquiry Cycle)</h2>
                  <p className="text-blue-100 text-lg font-medium max-w-2xl">사고 루틴을 활용하여 체계적으로 탐구하는 6단계 과정입니다.</p>
                </div>
              </div>
              <div className="space-y-6">
                {ibInquiryCycle.map((item, idx) => (
                  <motion.div key={idx} whileHover={{ x: 10 }}>
                    <Card className="p-8 flex flex-col md:flex-row gap-8 items-center bg-white border-2 border-gray-50 hover:border-blue-200 transition-all">
                      <div className="w-20 h-20 bg-blue-600 text-white rounded-[2rem] flex items-center justify-center font-black text-3xl shadow-xl shadow-blue-100 flex-shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 text-center md:text-left space-y-4">
                        <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                          <h4 className="text-2xl font-black text-blue-600">{item.title}</h4>
                          {item.image && (
                            <img src={item.image} alt="" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <p className="text-gray-600 font-bold">{item.description}</p>
                        <StudyCheck 
                          id={`cycle-${item.title}`} 
                          completed={completedItems.includes(`cycle-${item.title}`)} 
                          onToggle={onToggleItem} 
                        />
                      </div>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 4 && (
            <section className="space-y-8 relative">
              <motion.img 
                src={ASSETS.quiz.ranking_icon} 
                className="absolute -right-10 bottom-40 w-24 h-24 opacity-10 -z-10"
                animate={{ rotate: [0, -10, 10, 0] }}
                transition={{ repeat: Infinity, duration: 6 }}
                referrerPolicy="no-referrer"
              />
              <div className="bg-purple-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-purple-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ x: [0, 10, 0], y: [0, -5, 0] }}
                  transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
                  className="absolute -right-4 -bottom-4 opacity-40 w-64 h-64"
                >
                  <img src={ASSETS.quiz.ranking_icon} alt="ATL Skills" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 05</span>
                  <h2 className="text-4xl font-black mb-4">ATL 자기점검 (Self-Check)</h2>
                  <p className="text-purple-100 text-lg font-medium max-w-2xl">나의 탐구 기능 수준을 파악하고 더 성장시켜 보아요.</p>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {ibATL.map((item, idx) => {
                  const SkillIcon = (() => {
                    if (item.title.includes('사고')) return Lightbulb;
                    if (item.title.includes('소통')) return MessageSquare;
                    if (item.title.includes('사회적')) return Globe;
                    if (item.title.includes('자기 관리')) return Clock;
                    if (item.title.includes('조사')) return Search;
                    return Zap;
                  })();

                  return (
                    <Card key={idx} className="p-8 border-b-8 border-b-purple-500">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center">
                          <SkillIcon className="w-6 h-6 text-purple-600" />
                        </div>
                        <h4 className="text-2xl font-black text-purple-600">{item.title}</h4>
                        {item.image && (
                          <img src={item.image} alt="" className="w-16 h-16 object-contain" referrerPolicy="no-referrer" />
                        )}
                      </div>
                      <p className="text-sm font-bold text-gray-400 mb-8 uppercase tracking-widest">{item.description}</p>
                      <div className="space-y-4 mb-6">
                        {item.details.map((detail, dIdx) => (
                          <div key={dIdx} className="flex flex-col gap-3 p-5 bg-gray-50 rounded-[2rem] border border-gray-100 hover:bg-white hover:shadow-xl transition-all">
                            <span className="text-sm font-black text-gray-700">{detail}</span>
                            <div className="flex gap-2 justify-end">
                              {[1, 2, 3].map((star) => (
                                <motion.button 
                                  key={star} 
                                  whileHover={{ scale: 1.2 }}
                                  whileTap={{ scale: 0.8 }}
                                  onClick={() => onSaveATL(`${idx}-${dIdx}`, star)}
                                  className={cn(
                                    "w-10 h-10 rounded-xl border-2 flex items-center justify-center transition-all",
                                    (atlData[`${idx}-${dIdx}`] || 0) >= star
                                      ? "bg-purple-500 border-transparent"
                                      : "border-purple-100 hover:bg-purple-50"
                                  )}
                                >
                                  <Star className={cn(
                                    "w-5 h-5 transition-colors",
                                    (atlData[`${idx}-${dIdx}`] || 0) >= star ? "text-white fill-current" : "text-purple-200"
                                  )} />
                                </motion.button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                      <StudyCheck 
                        id={`atl-${item.title}`} 
                        completed={completedItems.includes(`atl-${item.title}`)} 
                        onToggle={onToggleItem} 
                      />
                    </Card>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 5 && (
            <section className="space-y-8">
              <div className="bg-rose-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-rose-100 relative overflow-hidden min-h-[220px] flex items-center">
                <motion.div 
                  animate={{ scale: [1, 1.05, 1], rotate: [-2, 2, -2] }}
                  transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                  className="absolute -right-4 -bottom-4 opacity-40 w-64 h-64"
                >
                  <img src="https://i.imgur.com/O1KKztA.png" alt="Journal" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                </motion.div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 06</span>
                  <h2 className="text-4xl font-black mb-4">UOI 성찰 일지 (Journal)</h2>
                  <p className="text-rose-50 text-lg font-medium max-w-2xl">탐구 후 나의 성장을 기록하는 시간입니다. 당신의 생각을 자유롭게 적어보세요.</p>
                </div>
              </div>
              
              <div className="relative">
                {/* Decorative elements for Journal */}
                <motion.img 
                  src="https://i.imgur.com/LsNAIca.png" 
                  className="absolute -left-12 top-10 w-24 h-24 opacity-20 -z-10 rotate-12"
                  animate={{ y: [0, 10, 0] }}
                  transition={{ repeat: Infinity, duration: 4 }}
                  referrerPolicy="no-referrer"
                />
                <motion.img 
                  src="https://i.imgur.com/B5lPhZj.png" 
                  className="absolute -right-10 bottom-20 w-32 h-32 opacity-10 -z-10 -rotate-12"
                  animate={{ rotate: [0, 360] }}
                  transition={{ repeat: Infinity, duration: 20, ease: "linear" }}
                  referrerPolicy="no-referrer"
                />

                <Card className="p-10 shadow-2xl border-2 border-rose-50 bg-white/90 backdrop-blur-sm relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-2 bg-rose-400 opacity-30" />
                  <div className="space-y-10">
                    {randomQuestions.map((q, idx) => (
                      <div key={idx} className="space-y-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center font-black text-lg shadow-sm">
                            {idx + 1}
                          </div>
                          <label className="block font-black text-xl text-gray-800">{q}</label>
                        </div>
                        <div className="relative">
                          <textarea 
                            value={reflectionData[q] || ''}
                            onChange={(e) => setReflectionData(prev => ({ ...prev, [q]: e.target.value }))}
                            placeholder="여기에 당신의 위대한 생각을 기록하세요..."
                            className="w-full p-8 rounded-[2.5rem] border-2 border-gray-100 focus:border-rose-400 focus:ring-8 focus:ring-rose-50 outline-none min-h-[180px] bg-gray-50/30 font-bold transition-all text-lg leading-relaxed shadow-inner"
                          />
                          <div className="absolute bottom-4 right-6 opacity-20">
                            <BookOpen className="w-8 h-8 text-rose-400" />
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    <div className="pt-4">
                      <Button 
                        className="w-full py-6 text-2xl shadow-rose-200 bg-rose-500 hover:bg-rose-600" 
                        variant="secondary" 
                        onClick={onSaveReflection}
                        icon={Sparkles}
                      >
                        성찰 완료하고 보상 받기
                      </Button>
                    </div>

                    <div className="flex justify-center pt-4">
                      <StudyCheck 
                        id="journal-guide" 
                        completed={completedItems.includes('journal-guide')} 
                        onToggle={onToggleItem} 
                      />
                    </div>
                  </div>
                </Card>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

const QuizView = ({ profile, onFinish, onClose, soundEnabled }: QuizViewProps) => {
  const shuffledQuestions = useMemo(() => {
    return [...quizQuestions].sort(() => Math.random() - 0.5).slice(0, 10);
  }, []);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);

  // Timer Effect
  useEffect(() => {
    if (!quizFinished && selectedOption === null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && selectedOption === null) {
      handleAnswer(-1); // Time out
    }
  }, [quizFinished, selectedOption, timeLeft]);

  const handleAnswer = (optionIdx: number) => {
    if (selectedOption !== null) return;
    setSelectedOption(optionIdx);
    const correct = optionIdx === shuffledQuestions[currentQuestionIdx].correctAnswer;
    setIsCorrect(correct);
    
    if (correct) {
      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Sound play error:', e));
      }
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      
      // Bonus points for streak and speed
      const timeBonus = Math.floor(timeLeft / 2);
      const streakBonus = Math.floor(newStreak * 5);
      const points = 20 + timeBonus + streakBonus;
      setQuizScore(prev => prev + points);

      // XP Popup
      const id = Date.now();
      setXpPopups(prev => [...prev, { id, x: Math.random() * 100 - 50, y: -50, amount: points }]);
      setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1000);
      
      if (newStreak >= 3) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      }
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < shuffledQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(15);
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    setQuizFinished(true);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    await onFinish(quizScore, maxStreak);
  };

  const currentQuestion = shuffledQuestions[currentQuestionIdx];

  const mascotImg = isCorrect === true 
    ? "https://i.imgur.com/v7KIyBI.png" // Happy
    : isCorrect === false 
    ? "https://i.imgur.com/8pKDYvD.png" // Thinking/Sad
    : "https://i.imgur.com/8pKDYvD.png"; // Normal

  if (quizFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden border border-white/20"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <img src="https://i.imgur.com/sEqw0FL.png" alt="Success" className="w-40 h-40 mx-auto drop-shadow-2xl animate-bounce" referrerPolicy="no-referrer" />
            </motion.div>
            
            <h2 className="text-4xl font-black mb-2 text-gray-900">탐험 성공!</h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest">MISSION COMPLETE</p>
            
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-indigo-50 p-6 rounded-3xl border border-indigo-100 shadow-sm">
                <p className="text-xs font-bold text-indigo-400 mb-1 uppercase tracking-tighter">획득 XP</p>
                <p className="text-3xl font-black text-indigo-600">+{quizScore}</p>
              </div>
              <div className="bg-orange-50 p-6 rounded-3xl border border-orange-100 shadow-sm">
                <p className="text-xs font-bold text-orange-400 mb-1 uppercase tracking-tighter">최대 콤보</p>
                <p className="text-3xl font-black text-orange-600">{maxStreak}</p>
              </div>
            </div>
            
            <Button onClick={onClose} className="w-full py-5 text-xl shadow-indigo-200" icon={ArrowLeft}>
              기지로 돌아가기
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 relative">
      {/* Decorative Background Elements */}
      <motion.img 
        src="https://i.imgur.com/B5lPhZj.png" 
        className="fixed top-20 left-10 w-32 h-32 opacity-10 -z-10"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        referrerPolicy="no-referrer"
      />
      <motion.img 
        src="https://i.imgur.com/LsNAIca.png" 
        className="fixed bottom-20 right-10 w-24 h-24 opacity-10 -z-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        referrerPolicy="no-referrer"
      />

      <header className="mb-10 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} icon={ArrowLeft} className="px-3 py-1.5 text-sm h-10 hover:bg-red-50 hover:text-red-500">
              그만두기
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                {currentQuestionIdx + 1}
              </div>
              <div className="hidden sm:block">
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">CURRENT QUEST</p>
                <p className="text-lg font-bold text-gray-900">탐구 질문 {currentQuestionIdx + 1} / {shuffledQuestions.length}</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {streak >= 2 && (
                <motion.div 
                  key="streak"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg shadow-orange-200"
                >
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                  {streak} COMBO!
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black transition-all shadow-sm",
              timeLeft <= 5 ? "bg-red-500 text-white shadow-red-200" : "bg-gray-100 text-gray-600"
            )}>
              <Timer className={cn("w-5 h-5", timeLeft <= 5 && "animate-bounce")} />
              <span className="tabular-nums text-lg">{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50 p-1">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIdx + 1) / shuffledQuestions.length) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
          </motion.div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mascot Area */}
        <div className="hidden lg:flex flex-col items-center gap-4 sticky top-12">
          <motion.div
            key={mascotImg}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 bg-white/50 backdrop-blur-sm rounded-[3rem] p-6 border border-white/20 shadow-xl flex items-center justify-center"
          >
            <img src={mascotImg} alt="Mascot" className="w-full h-full object-contain drop-shadow-lg" referrerPolicy="no-referrer" />
          </motion.div>
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 text-center">
            {isCorrect === true ? "대단해요! 정답이에요!" : isCorrect === false ? "음... 다시 생각해볼까요?" : "문제를 잘 읽어보세요!"}
          </div>
        </div>

        <div className="lg:col-span-3 min-h-[650px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-10 mb-8 border-b-8 border-b-indigo-100 shadow-2xl relative overflow-hidden bg-white min-h-[420px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Target className="w-48 h-48" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl animate-pulse">{currentQuestion.emoji}</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">IB KNOWLEDGE QUEST</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-10 leading-tight">
                    {currentQuestion.question}
                  </h3>
                  
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.options.map((option, idx) => (
                      <motion.button
                        key={idx}
                        whileHover={selectedOption === null ? { scale: 1.02, x: 10 } : {}}
                        whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                        onClick={() => handleAnswer(idx)}
                        disabled={selectedOption !== null}
                        className={cn(
                          "w-full p-6 rounded-[2rem] text-left font-bold transition-all border-2 text-lg flex items-center justify-between group relative shadow-sm",
                          selectedOption === null ? "border-gray-100 bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-50" : 
                          idx === currentQuestion.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-50" :
                          selectedOption === idx ? "border-red-500 bg-red-50 text-red-700" : "border-gray-100 opacity-50"
                        )}
                      >
                        <div className="flex items-center gap-5">
                          <div className={cn(
                            "w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black transition-all",
                            selectedOption === null ? "bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12" :
                            idx === currentQuestion.correctAnswer ? "bg-emerald-500 text-white rotate-12" :
                            selectedOption === idx ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
                          )}>
                            {String.fromCharCode(65 + idx)}
                          </div>
                          <span className="text-xl">{option}</span>
                        </div>
                        
                        {/* XP Popups */}
                        <AnimatePresence>
                          {selectedOption === idx && isCorrect && xpPopups.map(popup => (
                            <motion.div
                              key={popup.id}
                              initial={{ opacity: 0, y: 0 }}
                              animate={{ opacity: 1, y: -80 }}
                              exit={{ opacity: 0 }}
                              className="absolute right-12 top-0 text-3xl font-black text-emerald-500 pointer-events-none drop-shadow-sm"
                            >
                              +{popup.amount} XP
                            </motion.div>
                          ))}
                        </AnimatePresence>

                        {selectedOption !== null && idx === currentQuestion.correctAnswer && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                            <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                          </motion.div>
                        )}
                        {selectedOption === idx && idx !== currentQuestion.correctAnswer && (
                          <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                            <XCircle className="w-8 h-8 text-red-500" />
                          </motion.div>
                        )}
                      </motion.button>
                    ))}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {selectedOption !== null && (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className={cn(
                    "p-8 rounded-[2.5rem] border-2 shadow-2xl bg-white relative overflow-hidden",
                    isCorrect ? "border-emerald-100 text-emerald-900" : "border-red-100 text-red-900"
                  )}>
                    <div className={cn("absolute top-0 left-0 w-2 h-full", isCorrect ? "bg-emerald-500" : "bg-red-500")} />
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                        {isCorrect ? <Sparkles className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                      </div>
                      <div>
                        <p className="font-black text-2xl">{isCorrect ? "완벽해요! 정답입니다!" : "아쉬워요! 정답을 확인해보세요."}</p>
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest">EXPLORER FEEDBACK</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg leading-relaxed bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                      {currentQuestion.explanation}
                    </p>
                  </div>
                  
                  <Button onClick={nextQuestion} className="w-full py-6 text-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700" variant="primary" icon={ChevronRight}>
                    {currentQuestionIdx === shuffledQuestions.length - 1 ? "최종 결과 확인" : "다음 스테이지로"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};

const RankingView = ({ setView, rankings }: RankingViewProps) => (
  <div className="max-w-2xl mx-auto p-4 py-8 space-y-8">
    <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center">
      <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
      <div className="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg shadow-yellow-100">
        <img src="https://i.imgur.com/EhA2HQZ.png" alt="Ranking" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
      <h2 className="text-3xl font-black text-gray-900">명예의 전당</h2>
      <p className="text-gray-500 font-bold">증평 IB 탐험대의 최고 탐험가들을 소개합니다!</p>
    </header>

    <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
      {rankings.map((rank, idx) => (
        <div key={rank.uid} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
          <div className="flex items-center gap-4">
            <div className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
              idx === 0 ? "bg-yellow-100 text-yellow-700" :
              idx === 1 ? "bg-gray-100 text-gray-700" :
              idx === 2 ? "bg-orange-100 text-orange-700" : "text-gray-400"
            )}>
              {idx + 1}
            </div>
            <div>
              <div className="font-bold text-gray-900">{rank.name}</div>
              <div className="text-xs text-gray-500">{rank.grade} {rank.class}</div>
            </div>
          </div>
          <div className="text-xl font-black text-indigo-600">{rank.score}점</div>
        </div>
      ))}
      {rankings.length === 0 && (
        <div className="p-12 text-center text-gray-500">아직 등록된 탐험가가 없습니다.</div>
      )}
    </Card>
  </div>
);

const backgrounds = {
  home: 'https://i.imgur.com/4c2LpFS.png',
  study: 'https://i.imgur.com/w0yXCnG.png',
  quiz: 'https://i.imgur.com/sgheo2K.png',
  ranking: 'https://i.imgur.com/O1KKztA.png',
  login: 'https://i.imgur.com/4c2LpFS.png',
  setup: 'https://i.imgur.com/4c2LpFS.png'
};

const BackgroundMusic = ({ playing, volume }: { playing: boolean; volume: number }) => {
  const audioRef = React.useRef<HTMLAudioElement>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = volume;
      if (playing) {
        audioRef.current.play().catch(err => {
          console.log("Audio play failed:", err);
        });
      } else {
        audioRef.current.pause();
      }
    }
  }, [playing, volume]);

  return (
    <audio
      ref={audioRef}
      src="https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3"
      loop
    />
  );
};

// --- Main App ---

export default function App() {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isAuthReady, setIsAuthReady] = useState(false);
  const [view, setView] = useState<'home' | 'study' | 'quiz' | 'ranking'>('home');
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
    const q = query(collection(db, 'users'), orderBy('score', 'desc'), limit(10));
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

  const handleFinishQuiz = async (quizScore: number, maxStreak: number) => {
    if (profile) {
      const oldLevel = getLevel(profile.score).name;
      const newTotalScore = profile.score + quizScore;
      const newLevel = getLevel(newTotalScore).name;

      if (oldLevel !== newLevel) {
        setShowLevelUp(true);
      }

      try {
        await updateDoc(doc(db, 'users', profile.uid), {
          score: newTotalScore,
          lastQuizDate: new Date().toISOString(),
          streak: maxStreak
        });
        setProfile({ ...profile, score: newTotalScore });
      } catch (error) {
        handleFirestoreError(error, OperationType.UPDATE, `users/${profile.uid}`);
      }
    }
  };

  const handleToggleStudyItem = async (itemId: string) => {
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
      scoreChange = -10;
    } else {
      newCompleted = [...currentCompleted, itemId];
      scoreChange = 10;
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
  };

  const handleSaveReflection = async () => {
    if (!user) return;
    try {
      await setDoc(doc(db, 'reflections', user.uid), reflectionData);
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#f43f5e', '#fb7185', '#fda4af']
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `reflections/${user.uid}`);
    }
  };

  const handleSaveATL = async (key: string, value: number) => {
    if (!user) return;
    const newData = { ...atlData, [key]: value };
    setAtlData(newData);
    try {
      await setDoc(doc(db, 'atl', user.uid), newData);
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `atl/${user.uid}`);
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
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
