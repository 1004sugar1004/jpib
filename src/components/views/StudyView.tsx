import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../assets';
import { 
  ArrowLeft, 
  UserCircle, 
  School, 
  AlertCircle, 
  RefreshCcw, 
  GraduationCap, 
  BookOpen, 
  CheckCircle2, 
  ChevronRight,
  Target,
  Lightbulb,
  Compass,
  Map as MapIcon,
  Globe,
  Clock,
  MessageSquare,
  ShieldCheck,
  Eye,
  Settings,
  Link,
  Search,
  Box,
  Star
} from 'lucide-react';
import { 
  ibLearnerProfile, 
  ibThemes, 
  ibKeyConcepts, 
  ibInquiryCycle, 
  ibATL, 
  ibReflectionQuestions 
} from '../../content';

interface StudyViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard') => void;
  initialTab?: number;
  atlData: Record<string, number>;
  onSaveATL: (key: string, value: number) => void;
  reflectionData: Record<string, string>;
  setReflectionData: React.Dispatch<React.SetStateAction<Record<string, string>>>;
  onSaveReflection: () => void;
  completedItems: string[];
  onToggleItem: (itemId: string) => void;
  onEarnXP: (xp: number, activityType?: any, accuracy?: number, duration?: number, questAmount?: number) => void;
  soundEnabled: boolean;
}

const StudyCheck = ({ 
  id, 
  completed, 
  handleToggle, 
  tabStartTime 
}: { 
  id: string, 
  completed: boolean, 
  handleToggle: (id: string) => void,
  tabStartTime: number
}) => {
  const [currentTime, setCurrentTime] = useState(Date.now());
  
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 200);
    return () => clearInterval(interval);
  }, []);

  const timeInTab = currentTime - tabStartTime;
  const isLocked = !completed && timeInTab < 2000;
  const remaining = Math.ceil((2000 - timeInTab) / 1000);

  return (
    <motion.button
      whileHover={!isLocked && !completed ? { scale: 1.05 } : {}}
      whileTap={!isLocked && !completed ? { scale: 0.95 } : {}}
      onClick={() => {
        if (!completed) handleToggle(id);
      }}
      disabled={completed}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2 w-fit",
        completed 
          ? "bg-green-500 border-transparent text-white shadow-lg shadow-green-100 cursor-default opacity-90" 
          : isLocked
            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-70"
            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200 cursor-pointer"
      )}
    >
      {completed ? (
        <CheckCircle2 className="w-4 h-4" />
      ) : isLocked ? (
        <Clock className="w-4 h-4 animate-pulse" />
      ) : (
        <div className="w-4 h-4 rounded-full border-2 border-gray-200" />
      )}
      {completed 
        ? "이해했습니다! (+30 XP)" 
        : isLocked 
          ? `읽는 중... (${remaining}초)` 
          : "읽고 이해했습니다"}
    </motion.button>
  );
};

const tabs = [
  { id: 0, label: "학습자상", icon: UserCircle, color: "bg-indigo-500" },
  { id: 1, label: "탐구 주제", icon: School, color: "bg-emerald-500" },
  { id: 2, label: "핵심 개념", icon: AlertCircle, color: "bg-amber-500" },
  { id: 3, label: "탐구 사이클", icon: RefreshCcw, color: "bg-blue-500" },
  { id: 4, label: "ATL 기능", icon: GraduationCap, color: "bg-purple-500" },
  { id: 5, label: "성찰 일지", icon: BookOpen, color: "bg-rose-500" },
  { id: 6, label: "초성 퀴즈", icon: Lightbulb, color: "bg-cyan-500" },
];

interface ConsonantQuestion {
  word: string;
  consonants: string;
  category: '학습자상' | '7대 개념' | 'ATL 기능';
  description: string;
}

const CONSONANT_QUESTIONS: ConsonantQuestion[] = [
  { word: "탐구하는 사람", consonants: "ㅌㄱㅎㄴ ㅅㄹ", category: "학습자상", description: "질문을 품고 스스로 깊이 탐구하고 조사하며 배움을 주도하는 사람입니다." },
  { word: "지식이 풍부한 사람", consonants: "ㅈㅅㅇ ㅍㅂㅎ ㅅㄹ", category: "학습자상", description: "중요한 개념과 지식을 깊이 있게 탐구하여 전 세계의 다양한 문제에 대해 다각도로 아는 사람입니다." },
  { word: "생각하는 사람", consonants: "ㅅㄱㅎㄴ ㅅㄹ", category: "학습자상", description: "문제를 발견하고 창의적이고 비판적인 사고를 통해 윤리적이고 합리적인 결정을 내리는 사람입니다." },
  { word: "소통하는 사람", consonants: "ㅅㅌㅎㄴ ㅅㄹ", category: "학습자상", description: "자신의 생각과 유용한 정보를 다양한 의사소통 방식으로 자신감 있고 풍성하게 나눌 줄 아는 사람입니다." },
  { word: "원칙을 지키는 사람", consonants: "ㅇㅊㅇ ㅈㅋㄴ ㅅㄹ", category: "학습자상", description: "정직함과 공정함을 바탕으로 행동하며, 타인의 권리와 공동체의 가치를 존중하고 책임감 있게 행동하는 사람입니다." },
  { word: "열린 마음을 가진 사람", consonants: "ㅇㄹ ㅁㅇㅇ ㄱㅈ ㅅㄹ", category: "학습자상", description: "자신의 가치뿐만 아니라 타인의 문화와 관점을 포용하며, 다양한 생각에서 배울 수 있도록 수용하는 사람입니다." },
  { word: "배려하는 사람", consonants: "ㅂㄹㅎㄴ ㅅㄹ", category: "학습자상", description: "타인을 존중하고, 아끼며, 주위의 복지와 환경에 긍정적인 변화를 일으키기 위해 봉사하고 행동하는 사람입니다." },
  { word: "도전하는 사람", consonants: "ㄷㅈㅎㄴ ㅅㄹ", category: "학습자상", description: "새로운 상황에 능동적으로 대처하며, 자신의 신념을 자신 있게 관철하고 다양한 모험을 즐겁게 경험하는 사람입니다." },
  { word: "균형 잡힌 사람", consonants: "ㄱㅎ ㅈㅎ ㅅㄹ", category: "학습자상", description: "지성, 신체, 감성이 조화를 이룰 수 있도록 균형을 유지하고, 자신과 세계의 웰빙을 성실하게 가꾸는 사람입니다." },
  { word: "성찰하는 사람", consonants: "ㅅㅊㅎㄴ ㅅㄹ", category: "학습자상", description: "자신의 배움과 삶을 진지하게 깊이 돌아보며 스스로 장단점을 성실하게 보완하고 발전해 나가는 사람입니다." },
  { word: "형태", consonants: "ㅎㅌ", category: "7대 개념", description: "이것은 어떠한 특징과 구조를 지니고 있을까? 고유한 성질을 깊이 관찰하는 질문 렌즈입니다." },
  { word: "기능", consonants: "ㄱㄴ", category: "7대 개념", description: "이것은 어떠한 역할을 하며 어떻게 작동하고 있을까? 쓰임새와 작동 원리를 탐색하는 질문 렌즈입니다." },
  { word: "인과 관계", consonants: "ㅇㄱ ㄱㄱ", category: "7대 개념", description: "왜 이런 일이 일어났을까? 원인과 결과는 무엇이고 어떻게 연결되어 있는지 탐색하는 질문 렌즈입니다." },
  { word: "변화", consonants: "ㅂㅎ", category: "7대 개념", description: "이것은 시간이 흐르며 어떠한 모습으로 다르게 달라지고 있을까? 상태의 이행을 연구하는 질문 렌즈입니다." },
  { word: "연결", consonants: "ㅇㄱ", category: "7대 개념", description: "이것은 다른 것들과 어떠한 관계가 있고 어떻게 서로 상호작용하고 있을까? 네트워크적 연결을 묻는 질문 렌즈입니다." },
  { word: "관점", consonants: "ㄱㅈ", category: "7대 개념", description: "이 물건을 엄마는 어떻게 보시고 내 친구는 어떻게 생각할까? 서로 다른 시각과 가치관을 탐색하는 질문 렌즈입니다." },
  { word: "책임", consonants: "ㅊㅇ", category: "7대 개념", description: "내가 알게 된 지식과 행동을 바탕으로 나는 어떠한 실천을 해야 할까? 행동과 윤리적 의무를 성찰하는 질문 렌즈입니다." },
  { word: "성찰", consonants: "ㅅㅊ", category: "7대 개념", description: "자신의 배움과 활동 과정을 돌아보고 발전 방향을 깊이 모색하는 질문 렌즈입니다." },
  { word: "사고 기능", consonants: "ㅅㄱ ㄱㄴ", category: "ATL 기능", description: "개념과 이론을 비판적으로 평가하고, 아이디어를 창의적으로 융합하여 새로운 해결책을 설계하는 기능입니다." },
  { word: "의사소통 기능", consonants: "ㅇㅅㅅㅌ ㄱㄴ", category: "ATL 기능", description: "자신의 생각과 정보를 읽기, 쓰기, 말하기, 듣기 등 다양한 수단으로 안전하고 유용하게 주고받는 기능입니다." },
  { word: "사회적 기능", consonants: "ㅅㅎㅈ ㄱㄴ", category: "ATL 기능", description: "다른 사람과 서로 존중하며 긍정적으로 소통하고, 공동의 목적을 위해 배려하고 협력해 협동하는 기능입니다." },
  { word: "자기 관리 기능", consonants: "ㅈㄱ ㄱㄹ ㄱㄴ", category: "ATL 기능", description: "시간을 계획적으로 관리하고 목표를 달성하며, 자신의 감정, 동기, 마음을 건강하게 조율하는 기능입니다." },
  { word: "조사 기능", consonants: "ㅈㅅ ㄱㄴ", category: "ATL 기능", description: "다양한 매체에서 필요한 데이터를 수집 및 선별하고, 비교/분석을 거쳐 가치 있는 정보로 엮어내는 기능입니다." }
];

export const StudyView = ({ 
  setView, 
  initialTab,
  atlData, 
  onSaveATL, 
  reflectionData, 
  setReflectionData, 
  onSaveReflection,
  completedItems,
  onToggleItem,
  onEarnXP,
  soundEnabled
}: StudyViewProps) => {
  const [activeTab, setActiveTab] = useState(initialTab !== undefined ? initialTab : 0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  
  // Consonant Quiz States
  const [consonantQuestions] = useState<ConsonantQuestion[]>(() => {
    return [...CONSONANT_QUESTIONS].sort(() => Math.random() - 0.5);
  });
  const [consonantIdx, setConsonantIdx] = useState(0);
  const [consonantInput, setConsonantInput] = useState('');
  const [consonantFeedback, setConsonantFeedback] = useState<'correct' | 'wrong' | null>(null);
  const [consonantStreak, setConsonantStreak] = useState(0);

  const handleCheckConsonant = () => {
    if (consonantFeedback === 'correct') return;
    if (!consonantQuestions || consonantQuestions.length === 0) return;

    const q = consonantQuestions[consonantIdx];
    if (!q) return;

    const userAns = consonantInput.trim().replace(/\s+/g, '');
    let correctAns = q.word.trim().replace(/\s+/g, '');

    let isCorrect = (userAns === correctAns);

    // 균형 잡힌 사람의 경우, 예외적으로 구어 발음 혹은 맞춤법 오류 대처 (예: 균형자핀사람) 허용하여 유연한 학습 보장 및 오답 수용성 확대
    if (!isCorrect && q.word === "균형 잡힌 사람") {
      const allowedAltAnswers = ["균형잡힌사람", "균형자핀사람", "균형잡힌", "균형자핀"];
      if (allowedAltAnswers.includes(userAns)) {
        isCorrect = true;
      }
    }

    if (isCorrect) {
      setConsonantFeedback('correct');
      setConsonantStreak(prev => prev + 1);
      if (soundEnabled) {
        const soundUrl = ASSETS.sounds.correct || "https://ik.imagekit.io/foefnjeua/correct.mp3";
        const audio = new Audio(soundUrl);
        audio.volume = 0.2;
        audio.play().catch(() => {});
      }
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.75 }
      });
      // award +50 XP and log to count for quests!
      onEarnXP(50, 'study', 1, 15, 1);
    } else {
      setConsonantFeedback('wrong');
      setConsonantStreak(0);
      if (soundEnabled) {
        const soundUrl = ASSETS.sounds.wrong || "https://ik.imagekit.io/foefnjeua/wrong.mp3";
        const audio = new Audio(soundUrl);
        audio.volume = 0.2;
        audio.play().catch(() => {});
      }
    }
  };

  const handleNextConsonant = () => {
    setConsonantInput('');
    setConsonantFeedback(null);
    if (consonantQuestions && consonantQuestions.length > 0) {
      setConsonantIdx(prev => (prev + 1) % consonantQuestions.length);
    }
  };
  const [tabStartTime, setTabStartTime] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);
  const [currentTime, setCurrentTime] = useState(Date.now());
  const lastClickTimeRef = useRef<number>(0);

  // Update current time for reactive timers
  React.useEffect(() => {
    const interval = setInterval(() => setCurrentTime(Date.now()), 200);
    return () => clearInterval(interval);
  }, []);

  const randomQuestions = useMemo(() => {
    return [...ibReflectionQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
  }, []);

  const isReflectionMeaningful = useMemo(() => {
    const answers = randomQuestions.map(q => reflectionData[q] || '');
    return answers.every(a => {
      const trimmed = a.trim();
      // Check length (min 20)
      if (trimmed.length < 20) return false;
      
      // Basic anti-spam: check for variety (at least 5 unique characters)
      const uniqueChars = new Set(trimmed.split('')).size;
      if (uniqueChars < 5) return false;

      // Check for repeated patterns (e.g., "asdfasdfasdf")
      if (/^(.+)\1+$/.test(trimmed) && trimmed.length > 10) return false;

      return true;
    });
  }, [reflectionData, randomQuestions]);

  const handleSaveReflectionClick = () => {
    if (!isReflectionMeaningful) {
      setMessage("모든 질문에 대해 정성껏 답변을 적어주세요! (각 질문당 최소 20자, 의미 있는 내용)");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    onSaveReflection();
  };

  const tabCompletionStatus = useMemo(() => {
    return tabs.map(tab => {
      if (tab.id === 6) {
        return consonantIdx > 0 || consonantFeedback === 'correct';
      }
      if (tab.id === 5) {
        const answers = randomQuestions.map(q => reflectionData[q] || '');
        return answers.every(a => {
          const trimmed = a.trim();
          return trimmed.length >= 20 && new Set(trimmed.split('')).size >= 5;
        });
      }
      
      let items: any[] = [];
      let prefix = '';
      switch (tab.id) {
        case 0: items = ibLearnerProfile; prefix = 'learner'; break;
        case 1: items = ibThemes; prefix = 'theme'; break;
        case 2: items = ibKeyConcepts; prefix = 'concept'; break;
        case 3: items = ibInquiryCycle; prefix = 'inquiry'; break;
        case 4: items = ibATL; prefix = 'atl'; break;
      }
      
      if (items.length === 0) return false;
      return items.every((_, idx) => completedItems.includes(`${prefix}-${idx}`));
    });
  }, [completedItems, reflectionData, randomQuestions]);

  const allPreviousTabsCompleted = useMemo(() => {
    return tabCompletionStatus.slice(0, 5).every(status => status === true);
  }, [tabCompletionStatus]);

  const handleTabChange = (tabId: number) => {
    if (tabId === activeTab) return;
    setActiveTab(tabId);
    setCurrentCardIndex(0);
    setTabStartTime(Date.now());
    setMessage(null);
  };

  React.useEffect(() => {
    setTabStartTime(Date.now());
  }, [activeTab]);

  React.useEffect(() => {
    setTabStartTime(Date.now());
  }, [currentCardIndex]);

  const getCurrentData = () => {
    switch (activeTab) {
      case 0: return { data: ibLearnerProfile, prefix: 'learner' };
      case 1: return { data: ibThemes, prefix: 'theme' };
      case 2: return { data: ibKeyConcepts, prefix: 'concept' };
      case 3: return { data: ibInquiryCycle, prefix: 'inquiry' };
      case 4: return { data: ibATL, prefix: 'atl' };
      default: return { data: [], prefix: '' };
    }
  };

  const { data: currentItems, prefix: currentPrefix } = getCurrentData();
  const safeIndex = currentCardIndex >= currentItems.length ? 0 : currentCardIndex;
  
  const isCurrentCardCompleted = completedItems.includes(`${currentPrefix}-${safeIndex}`);
  const isNavigationBlocked = !isCurrentCardCompleted;
  const timeInTab = currentTime - tabStartTime;
  const isCompletionButtonLocked = !isCurrentCardCompleted && timeInTab < 2000;

  const handleToggle = React.useCallback((id: string) => {
    const isCompleted = completedItems.includes(id);
    if (isCompleted) return; // Prevent double-clicks or triggers if completed
    
    const now = Date.now();
    if (now - lastClickTimeRef.current < 500) return;

    if (now - tabStartTime < 2000) {
      setMessage("내용을 충분히 읽고 확인해주세요! (최소 2초)");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    lastClickTimeRef.current = now;
    onToggleItem(id);
    setMessage(null);

    setTimeout(() => {
      setCurrentCardIndex(prev => {
        if (prev < currentItems.length - 1) {
          return prev + 1;
        }
        return prev;
      });
    }, 600);
  }, [completedItems, onToggleItem, tabStartTime, currentItems.length]);

  const currentItem = currentItems[safeIndex];
  const isLastCard = safeIndex === currentItems.length - 1;
  const isFirstCard = safeIndex === 0;

  const nextCard = () => {
    if (safeIndex < currentItems.length - 1) {
      setCurrentCardIndex(safeIndex + 1);
    }
  };

  const prevCard = () => {
    if (safeIndex > 0) {
      setCurrentCardIndex(safeIndex - 1);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <Button 
            variant="secondary" 
            onClick={() => setView('home')} 
            icon={ArrowLeft} 
            className="w-fit bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
          >
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

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {tabs.map((tab, idx) => {
          const isCompleted = tabCompletionStatus[idx];
          const isLocked = tab.id === 5 && !allPreviousTabsCompleted;
          
          return (
            <motion.button
              key={tab.id}
              whileHover={!isLocked ? { scale: 1.05, y: -5 } : {}}
              whileTap={!isLocked ? { scale: 0.95 } : {}}
              onClick={() => {
                if (isLocked) {
                  setMessage("이전 탐험을 모두 마쳐야 성찰 일지를 쓸 수 있어요!");
                  setTimeout(() => setMessage(null), 3000);
                  return;
                }
                handleTabChange(tab.id);
              }}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 relative",
                activeTab === tab.id 
                  ? cn("border-transparent text-white shadow-xl", tab.color)
                  : isCompleted
                    ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                    : isLocked
                      ? "bg-gray-50 text-gray-300 border-gray-100 cursor-not-allowed opacity-60"
                      : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
              )}
            >
              {isCompleted && activeTab !== tab.id && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
              {isLocked ? (
                <ShieldCheck className="w-6 h-6 text-gray-300" />
              ) : (
                <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-white" : isCompleted ? "text-green-500" : "text-gray-300")} />
              )}
              <span className="text-xs font-black uppercase tracking-tighter">{tab.label}</span>
            </motion.button>
          );
        })}
      </div>
      
      <AnimatePresence>
        {message && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 bg-gray-900 text-white px-6 py-3 rounded-2xl font-bold shadow-2xl flex items-center gap-2"
          >
            <AlertCircle className="w-5 h-5 text-amber-400" />
            {message}
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="space-y-8"
        >
          {activeTab < 5 ? (
            <div className="space-y-8">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/20 shadow-inner">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    키워드 한눈에 보기
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {currentItems.length > 0 ? safeIndex + 1 : 0} / {currentItems.length}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {currentItems.map((item: any, idx: number) => {
                    const isCompleted = completedItems.includes(`${currentPrefix}-${idx}`);
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          if (isNavigationBlocked && idx > safeIndex) {
                            setMessage("'읽고 이해했습니다' 버튼을 먼저 눌러주세요!");
                            setTimeout(() => setMessage(null), 2000);
                            return;
                          }
                          setCurrentCardIndex(idx);
                        }}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-2",
                          currentCardIndex === idx
                            ? "bg-indigo-600 border-transparent text-white shadow-lg scale-105"
                            : isCompleted
                              ? "bg-green-500 border-transparent text-white shadow-md"
                              : "bg-white border-gray-100 text-gray-400 hover:border-gray-200",
                          isNavigationBlocked && idx > safeIndex && "opacity-50 cursor-not-allowed"
                        )}
                      >
                        {isCompleted && <CheckCircle2 className="w-3 h-3" />}
                        {item.title}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="relative group">
                <AnimatePresence mode="wait">
                  {(() => {
                    if (!currentItem) return null;
                    return (
                      <motion.div
                        key={`${activeTab}-${safeIndex}`}
                        initial={{ opacity: 0, x: 50, rotateY: 10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden min-h-[500px] flex flex-col md:flex-row"
                      >
                        <div className="w-full md:w-2/5 relative overflow-hidden bg-gray-100">
                          <img 
                            src={currentItem.image} 
                            alt={currentItem.title} 
                            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            referrerPolicy="no-referrer"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />
                        </div>
                        <div className="flex-1 p-8 md:p-12 flex flex-col justify-between">
                          <div className="space-y-6">
                            <div className="flex items-center gap-3">
                              <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center text-white shadow-lg", tabs[activeTab].color)}>
                                {React.createElement(tabs[activeTab].icon, { className: "w-6 h-6" })}
                              </div>
                              <span className="text-sm font-black text-gray-400 uppercase tracking-widest">{tabs[activeTab].label} #{safeIndex + 1}</span>
                            </div>
                            <h2 className="text-4xl font-black text-gray-900 leading-tight">
                              {currentItem.title}
                            </h2>
                            <p className="text-xl text-gray-600 font-medium leading-relaxed">
                              {currentItem.description}
                            </p>
                            
                            <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                              <p className="text-gray-700 font-medium italic">
                                "{currentItem.details ? currentItem.details[0] : currentItem.description}"
                              </p>
                            </div>
                          </div>

                          {activeTab === 4 && (
                            <div className="space-y-3 pt-4">
                              <p className="text-xs font-black text-purple-600 uppercase tracking-widest">나의 실천 점수</p>
                              <div className="flex gap-2">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <button
                                    key={star}
                                    onClick={() => onSaveATL(currentItem.title, star)}
                                    className={cn(
                                      "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
                                      (atlData[currentItem.title] || 0) >= star 
                                        ? "bg-purple-600 text-white shadow-lg shadow-purple-100" 
                                        : "bg-gray-100 text-gray-300 hover:bg-gray-200"
                                    )}
                                  >
                                    <Star className={cn("w-5 h-5", (atlData[currentItem.title] || 0) >= star ? "fill-current" : "")} />
                                  </button>
                                ))}
                              </div>
                            </div>
                          )}

                          <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                            <StudyCheck 
                              id={`${currentPrefix}-${safeIndex}`} 
                              completed={completedItems.includes(`${currentPrefix}-${safeIndex}`)} 
                              handleToggle={handleToggle}
                              tabStartTime={tabStartTime}
                            />
                            
                              <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                                <button
                                  onClick={prevCard}
                                  disabled={isFirstCard}
                                  className="w-14 h-14 p-0 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition-all active:scale-95"
                                >
                                  <ArrowLeft className="w-7 h-7" />
                                </button>
                                <button
                                  onClick={() => {
                                    if (isNavigationBlocked) {
                                      setMessage("'읽고 이해했습니다' 버튼을 눌러야 다음으로 갈 수 있어요!");
                                      setTimeout(() => setMessage(null), 2000);
                                      return;
                                    }
                                    nextCard();
                                  }}
                                  disabled={isLastCard || isNavigationBlocked}
                                  className={cn(
                                    "w-14 h-14 p-0 rounded-2xl flex items-center justify-center transition-all active:scale-95",
                                    isNavigationBlocked 
                                      ? "bg-gray-50 text-gray-300 cursor-not-allowed" 
                                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 disabled:opacity-30"
                                  )}
                                >
                                  <ChevronRight className="w-7 h-7" />
                                </button>
                              </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                <div className="mt-8 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${currentItems.length > 0 ? ((safeIndex + 1) / currentItems.length) * 100 : 0}%` }}
                    className={cn("h-full transition-all duration-500", tabs[activeTab].color)}
                  />
                </div>
              </div>
            </div>
          ) : activeTab === 5 ? (
            <div className="space-y-8">
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/20 shadow-inner">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <BookOpen className="w-4 h-4" />
                    성찰 단계
                  </h3>
                  <span className="text-xs font-bold text-rose-600 bg-rose-50 px-3 py-1 rounded-full">
                    {currentCardIndex + 1} / {randomQuestions.length + 1}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {randomQuestions.map((_, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentCardIndex(idx)}
                      className={cn(
                        "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                        currentCardIndex === idx
                          ? "bg-rose-500 border-transparent text-white shadow-lg scale-105"
                          : reflectionData[randomQuestions[idx]]
                            ? "bg-rose-50 border-rose-100 text-rose-600"
                            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                      )}
                    >
                      질문 {idx + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentCardIndex(randomQuestions.length)}
                    className={cn(
                      "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                      currentCardIndex === randomQuestions.length
                        ? "bg-rose-500 border-transparent text-white shadow-lg scale-105"
                        : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
                    )}
                  >
                    저장하기
                  </button>
                </div>
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={`reflection-${currentCardIndex}`}
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden min-h-[500px] flex flex-col md:flex-row"
                >
                  {currentCardIndex < randomQuestions.length ? (
                    <>
                      <div className="w-full md:w-2/5 p-12 bg-rose-500 flex flex-col items-center justify-center text-white relative overflow-hidden">
                        <div className="absolute inset-0 opacity-10">
                          <Lightbulb className="w-full h-full scale-150 rotate-12" />
                        </div>
                        <div className="relative z-10 w-32 h-32 bg-white/20 backdrop-blur-md rounded-[2.5rem] flex items-center justify-center mb-6">
                          <MessageSquare className="w-16 h-16" />
                        </div>
                        <h3 className="text-2xl font-black text-center relative z-10">오늘의 질문</h3>
                      </div>
                      <div className="flex-1 p-12 flex flex-col justify-center space-y-6">
                        <h2 className="text-3xl font-black text-gray-900 leading-tight">
                          {randomQuestions[currentCardIndex]}
                        </h2>
                        <textarea
                          value={reflectionData[randomQuestions[currentCardIndex]] || ''}
                          onChange={(e) => setReflectionData(prev => ({ ...prev, [randomQuestions[currentCardIndex]]: e.target.value }))}
                          placeholder="여기에 생각을 적어주세요..."
                          className="w-full h-48 p-8 rounded-[2.5rem] bg-gray-50 border-2 border-transparent focus:border-rose-200 focus:bg-white outline-none transition-all resize-none font-medium text-lg text-gray-700"
                        />
                        <div className="flex justify-end gap-3">
                          <button
                            onClick={() => setCurrentCardIndex(prev => prev - 1)}
                            disabled={currentCardIndex === 0}
                            className="w-14 h-14 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200"
                          >
                            <ArrowLeft className="w-7 h-7" />
                          </button>
                          <button
                            onClick={() => setCurrentCardIndex(prev => prev + 1)}
                            className="px-10 h-14 rounded-2xl bg-rose-500 text-white font-black flex items-center gap-2 hover:bg-rose-600 shadow-lg shadow-rose-100"
                          >
                            다음 단계
                            <ChevronRight className="w-6 h-6" />
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full p-12 flex flex-col items-center justify-center text-center space-y-8">
                      <div className="w-24 h-24 bg-rose-100 rounded-[2rem] flex items-center justify-center text-rose-600 mb-4">
                        <CheckCircle2 className="w-12 h-12" />
                      </div>
                      <div>
                        <h2 className="text-4xl font-black text-gray-900 mb-4">성찰을 완료했습니다!</h2>
                        <p className="text-xl text-gray-500 font-medium max-w-md mx-auto">
                          작성하신 소중한 생각들이 저장될 준비가 되었습니다.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button
                          onClick={() => setCurrentCardIndex(0)}
                          className="px-8 h-14 rounded-2xl bg-gray-100 text-gray-600 font-black hover:bg-gray-200"
                        >
                          다시 읽기
                        </button>
                        <Button 
                          onClick={handleSaveReflectionClick}
                          className={cn(
                            "px-12 h-14 text-xl shadow-2xl shadow-rose-100",
                            isReflectionMeaningful ? "bg-rose-500 hover:bg-rose-600" : "bg-gray-400 cursor-not-allowed"
                          )}
                          icon={CheckCircle2}
                        >
                          성찰 일지 저장하기 (+50 XP)
                        </Button>
                      </div>
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>

              <div className="h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentCardIndex + 1) / (randomQuestions.length + 1)) * 100}%` }}
                  className="h-full bg-rose-500 transition-all duration-500"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-100 overflow-hidden p-8 md:p-12 flex flex-col md:flex-row gap-8 items-center">
                
                {/* Visual Area */}
                <div className="w-full md:w-1/2 bg-gradient-to-br from-cyan-50 to-emerald-50/50 p-8 rounded-[2.5rem] border border-cyan-100/60 flex flex-col items-center justify-center text-center relative overflow-hidden min-h-[300px]">
                  <div className="absolute top-4 right-4 bg-white/80 backdrop-blur-sm px-4 py-1.5 rounded-full border border-cyan-100 flex items-center gap-1.5 shadow-sm">
                    <Star className="w-4 h-4 text-cyan-500 fill-cyan-400" />
                    <span className="text-xs font-black text-cyan-700">연속 {consonantStreak}회 달성</span>
                  </div>

                  <div className="px-4 py-1.5 bg-cyan-500 text-white font-extrabold text-xs rounded-full shadow-md shadow-cyan-100 mb-6 uppercase tracking-widest">
                    {consonantQuestions[consonantIdx]?.category}
                  </div>

                  {/* Consonants representation */}
                  <div className="text-4xl md:text-5xl font-black text-cyan-900 tracking-wider py-4 select-none drop-shadow-sm font-mono bg-white px-8 py-5 rounded-3xl shadow-sm border border-cyan-100">
                    {consonantQuestions[consonantIdx]?.consonants}
                  </div>

                  <p className="mt-6 text-sm text-gray-500 font-semibold leading-relaxed max-w-sm">
                    "{consonantQuestions[consonantIdx]?.description}"
                  </p>
                </div>

                {/* Solving Area */}
                <div className="flex-1 w-full flex flex-col justify-center space-y-6">
                  <div>
                    <h2 className="text-2xl font-black text-gray-900 tracking-tight">🔎 IB 탐험 초성 퀴즈</h2>
                    <p className="text-xs font-bold text-gray-400 mt-1">올바른 개념이나 학습자상 이름을 한글로 정확히 입력하세요.</p>
                  </div>

                  <input
                    type="text"
                    value={consonantInput}
                    onChange={(e) => {
                      setConsonantInput(e.target.value);
                      setConsonantFeedback(null);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        if (consonantFeedback === 'correct') {
                          handleNextConsonant();
                        } else {
                          handleCheckConsonant();
                        }
                      }
                    }}
                    placeholder="정답 단어를 적어주세요 (예 : 소통하는 사람)"
                    className="w-full px-6 py-5 rounded-[2rem] bg-gray-50 border-2 border-gray-100 focus:border-cyan-300 focus:bg-white outline-none transition-all text-center text-xl font-black text-cyan-950 shadow-inner"
                  />

                  <div className="flex gap-3">
                    <Button
                      onClick={handleCheckConsonant}
                      disabled={consonantFeedback === 'correct'}
                      className="flex-1 h-14 text-base font-black bg-cyan-500 hover:bg-cyan-600 shrink-0 text-white shadow-lg shadow-cyan-100 rounded-2xl flex items-center justify-center gap-2"
                      icon={ShieldCheck}
                    >
                      {consonantFeedback === 'correct' ? '정답 확인 완료' : '정답 확인'}
                    </Button>
                    <button
                      onClick={handleNextConsonant}
                      className="px-6 h-14 rounded-2xl bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors flex items-center justify-center font-bold gap-1"
                    >
                      다음 문제
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </div>

                  {/* Feedback Overlay inside panel */}
                  <AnimatePresence mode="wait">
                    {consonantFeedback === 'correct' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-emerald-50 text-emerald-800 font-bold border border-emerald-100 rounded-[2rem] text-center flex flex-col gap-1 shadow-sm"
                      >
                        <div className="text-base flex items-center justify-center gap-1.5">
                          🎉 완벽합니다! 정답이에요! (+50 XP)
                        </div>
                        <div className="text-xs text-emerald-600">성장 완료: "{consonantQuestions[consonantIdx]?.word}"</div>
                      </motion.div>
                    )}
                    {consonantFeedback === 'wrong' && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        className="p-5 bg-rose-50 text-rose-800 font-bold border border-rose-100 rounded-[2rem] text-center flex flex-col gap-1 shadow-sm"
                      >
                        <div className="text-base">❌ 어라, 다시 한 번 볼까요?</div>
                        <div className="text-xs text-rose-600">초성과 힌트 설명을 자세히 읽고 알맞은 단어 조합을 입력하세요.</div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>

              </div>

              {/* Progress visual bar */}
              <div className="mt-8 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${consonantQuestions.length > 0 ? ((consonantIdx + 1) / consonantQuestions.length) * 100 : 0}%` }}
                  className="h-full bg-cyan-500 transition-all duration-500"
                />
              </div>
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
