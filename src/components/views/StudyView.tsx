import React, { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
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
      whileHover={!isLocked ? { scale: 1.05 } : {}}
      whileTap={!isLocked ? { scale: 0.95 } : {}}
      onClick={() => handleToggle(id)}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-2xl text-sm font-bold transition-all border-2 w-fit",
        completed 
          ? "bg-green-500 border-transparent text-white shadow-lg shadow-green-100" 
          : isLocked
            ? "bg-gray-50 border-gray-100 text-gray-400 cursor-not-allowed opacity-70"
            : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
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
];

export const StudyView = ({ 
  setView, 
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
  const [activeTab, setActiveTab] = useState(0);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [tabStartTime, setTabStartTime] = useState(Date.now());
  const [message, setMessage] = useState<string | null>(null);
  const lastClickTimeRef = useRef<number>(0);

  const randomQuestions = useMemo(() => {
    return [...ibReflectionQuestions].sort(() => Math.random() - 0.5).slice(0, 2);
  }, []);

  const isReflectionMeaningful = useMemo(() => {
    const answers = randomQuestions.map(q => reflectionData[q] || '');
    return answers.every(a => a.trim().length >= 15);
  }, [reflectionData, randomQuestions]);

  const handleSaveReflectionClick = () => {
    if (!isReflectionMeaningful) {
      setMessage("모든 질문에 대해 정성껏 답변을 적어주세요! (각 질문당 최소 15자)");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    onSaveReflection();
  };

  const tabCompletionStatus = useMemo(() => {
    return tabs.map(tab => {
      if (tab.id === 5) {
        const answers = randomQuestions.map(q => reflectionData[q] || '');
        return answers.every(a => a.trim().length >= 15);
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

  const handleToggle = React.useCallback((id: string) => {
    const now = Date.now();
    const isCompleted = completedItems.includes(id);
    
    if (now - lastClickTimeRef.current < 500) return;

    if (!isCompleted && now - tabStartTime < 2000) {
      setMessage("내용을 충분히 읽고 확인해주세요! (최소 2초)");
      setTimeout(() => setMessage(null), 3000);
      return;
    }

    lastClickTimeRef.current = now;
    onToggleItem(id);
    setMessage(null);

    if (!isCompleted) {
      setTimeout(() => {
        setCurrentCardIndex(prev => {
          if (prev < currentItems.length - 1) {
            return prev + 1;
          }
          return prev;
        });
      }, 600);
    }
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

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {tabs.map((tab, idx) => {
          const isCompleted = tabCompletionStatus[idx];
          return (
            <motion.button
              key={tab.id}
              whileHover={{ scale: 1.05, y: -5 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleTabChange(tab.id)}
              className={cn(
                "flex flex-col items-center gap-2 p-4 rounded-3xl transition-all border-2 relative",
                activeTab === tab.id 
                  ? cn("border-transparent text-white shadow-xl", tab.color)
                  : isCompleted
                    ? "bg-green-50 text-green-600 border-green-100 hover:bg-green-100"
                    : "bg-white text-gray-400 border-gray-100 hover:border-gray-200"
              )}
            >
              {isCompleted && activeTab !== tab.id && (
                <div className="absolute -top-1 -right-1 bg-green-500 text-white rounded-full p-1 shadow-md">
                  <CheckCircle2 className="w-3 h-3" />
                </div>
              )}
              <tab.icon className={cn("w-6 h-6", activeTab === tab.id ? "text-white" : isCompleted ? "text-green-500" : "text-gray-300")} />
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
                        onClick={() => setCurrentCardIndex(idx)}
                        className={cn(
                          "px-4 py-2 rounded-xl text-xs font-black transition-all border-2 flex items-center gap-2",
                          currentCardIndex === idx
                            ? "bg-indigo-600 border-transparent text-white shadow-lg scale-105"
                            : isCompleted
                              ? "bg-green-500 border-transparent text-white shadow-md"
                              : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
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
                                onClick={nextCard}
                                disabled={isLastCard}
                                className="w-14 h-14 p-0 rounded-2xl flex items-center justify-center bg-gray-100 text-gray-600 disabled:opacity-30 hover:bg-gray-200 transition-all active:scale-95"
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
          ) : (
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
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
