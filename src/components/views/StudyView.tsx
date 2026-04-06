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
    const allText = Object.values(reflectionData).join('').trim();
    return allText.length >= 10;
  }, [reflectionData]);

  const handleSaveReflectionClick = () => {
    if (!isReflectionMeaningful) {
      setMessage("성찰 일지를 조금 더 자세히 적어주세요! (최소 10자)");
      setTimeout(() => setMessage(null), 3000);
      return;
    }
    onSaveReflection();
  };

  const tabs = [
    { id: 0, label: "학습자상", icon: UserCircle, color: "bg-indigo-500" },
    { id: 1, label: "탐구 주제", icon: School, color: "bg-emerald-500" },
    { id: 2, label: "핵심 개념", icon: AlertCircle, color: "bg-amber-500" },
    { id: 3, label: "탐구 사이클", icon: RefreshCcw, color: "bg-blue-500" },
    { id: 4, label: "ATL 기능", icon: GraduationCap, color: "bg-purple-500" },
    { id: 5, label: "성찰 일지", icon: BookOpen, color: "bg-rose-500" },
  ];

  React.useEffect(() => {
    setTabStartTime(Date.now());
    setCurrentCardIndex(0);
    setMessage(null);
  }, [activeTab]);

  // Reset timer when card changes
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

  const handleToggle = React.useCallback((id: string) => {
    const isCompleted = completedItems.includes(id);
    
    // If already completed, allow toggling off immediately
    if (isCompleted) {
      onToggleItem(id);
      return;
    }

    const now = Date.now();
    
    // Check if enough time has passed since opening the card (reduced to 2s)
    const timeInCard = now - tabStartTime;
    if (timeInCard < 2000) {
      const remaining = Math.ceil((2000 - timeInCard) / 1000);
      setMessage(`내용을 충분히 읽어주세요! (${remaining}초 남음)`);
      setTimeout(() => setMessage(null), 2000);
      return;
    }

    lastClickTimeRef.current = now;
    onToggleItem(id);
    setMessage(null);

    // Automatically move to the next card after a short delay if completing
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

  // getCurrentData was moved up
  const currentItem = currentItems[currentCardIndex];
  const isLastCard = currentCardIndex === currentItems.length - 1;
  const isFirstCard = currentCardIndex === 0;

  const nextCard = () => {
    if (currentCardIndex < currentItems.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(prev => prev - 1);
    }
  };

  // StudyCheck component was moved outside

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
      
      {/* Message Overlay */}
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
              {/* Keyword Overview Grid */}
              <div className="bg-white/50 backdrop-blur-sm p-6 rounded-[2.5rem] border border-white/20 shadow-inner">
                <div className="flex items-center justify-between mb-4 px-2">
                  <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Search className="w-4 h-4" />
                    키워드 한눈에 보기
                  </h3>
                  <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                    {currentCardIndex + 1} / {currentItems.length}
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
                              ? "bg-green-50 border-green-100 text-green-600"
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

              {/* Card News Interface */}
              <div className="relative group">
                <AnimatePresence mode="wait">
                  {(() => {
                    const TabIcon = tabs[activeTab].icon;
                    return (
                      <motion.div
                        key={`${activeTab}-${currentCardIndex}`}
                        initial={{ opacity: 0, x: 50, rotateY: 10 }}
                        animate={{ opacity: 1, x: 0, rotateY: 0 }}
                        exit={{ opacity: 0, x: -50, rotateY: -10 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="bg-white rounded-[3.5rem] shadow-2xl border border-gray-50 overflow-hidden min-h-[500px] flex flex-col md:flex-row"
                      >
                        {/* Left: Image Section */}
                        <div className={cn(
                          "w-full md:w-2/5 p-12 flex items-center justify-center relative overflow-hidden",
                          tabs[activeTab].color
                        )}>
                          <div className="absolute inset-0 opacity-10">
                            <TabIcon className="w-full h-full scale-150 rotate-12" />
                          </div>
                          <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="relative z-10 w-48 h-48 bg-white/20 backdrop-blur-md rounded-[3rem] p-6 shadow-2xl border border-white/30"
                          >
                            <img 
                              src={currentItem.image} 
                              alt={currentItem.title} 
                              className="w-full h-full object-contain drop-shadow-2xl" 
                              referrerPolicy="no-referrer" 
                            />
                          </motion.div>
                        </div>

                        {/* Right: Content Section */}
                        <div className="flex-1 p-12 flex flex-col justify-center space-y-6">
                          <div>
                            <span className="px-4 py-1 bg-gray-100 rounded-full text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] mb-4 inline-block">
                              {tabs[activeTab].label} #{currentCardIndex + 1}
                            </span>
                            <h2 className="text-4xl font-black text-gray-900 mb-4 leading-tight">
                              {currentItem.title}
                            </h2>
                            <p className="text-xl font-bold text-indigo-600 mb-6">
                              {currentItem.description}
                            </p>
                          </div>

                          <div className="bg-gray-50 p-8 rounded-[2rem] border-l-8 border-indigo-500">
                            <p className="text-gray-600 text-lg leading-relaxed font-medium italic">
                              {currentItem.details ? currentItem.details[0] : currentItem.description}
                            </p>
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
                              id={`${currentPrefix}-${currentCardIndex}`} 
                              completed={completedItems.includes(`${currentPrefix}-${currentCardIndex}`)} 
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
                                className={cn(
                                  "flex-1 sm:flex-none px-10 h-14 rounded-2xl font-black flex items-center justify-center gap-2 text-white transition-all hover:brightness-110 active:scale-95 disabled:opacity-30 shadow-lg",
                                  tabs[activeTab].color,
                                  !completedItems.includes(`${currentPrefix}-${currentCardIndex}`) && !isLastCard ? "opacity-50" : "opacity-100"
                                )}
                              >
                                {isLastCard ? "탐험 완료!" : "다음 탐험"}
                                {!isLastCard && <ChevronRight className="w-6 h-6" />}
                              </button>
                            </div>
                          </div>
                        </div>
                      </motion.div>
                    );
                  })()}
                </AnimatePresence>

                {/* Progress Bar */}
                <div className="mt-8 h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${((currentCardIndex + 1) / currentItems.length) * 100}%` }}
                    className={cn("h-full transition-all duration-500", tabs[activeTab].color)}
                  />
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Reflection Overview */}
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

              {/* Progress Bar */}
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
