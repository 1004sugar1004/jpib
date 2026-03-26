import React, { useState, useMemo } from 'react';
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
  onEarnXP: (amount: number) => void;
  soundEnabled: boolean;
}

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
      {completed ? "이해했습니다! (+30 XP)" : "읽고 이해했습니다"}
    </motion.button>
  );

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
                {ibLearnerProfile.map((profile, idx) => (
                  <motion.div 
                    key={idx}
                    initial={{ opacity: 0, x: idx % 2 === 0 ? -20 : 20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col gap-4 group hover:shadow-2xl transition-all"
                  >
                    <div className="flex items-center gap-6">
                      <div className="w-20 h-20 bg-indigo-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform p-3">
                        <img src={profile.image} alt={profile.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-2xl font-black text-gray-900 mb-1">{profile.title}</h3>
                        <p className="text-indigo-600 font-bold text-sm">{profile.description}</p>
                      </div>
                    </div>
                    <div className="bg-gray-50 p-4 rounded-2xl">
                      <p className="text-gray-500 text-sm leading-relaxed italic">"{profile.details[0]}"</p>
                    </div>
                    <StudyCheck 
                      id={`learner-${idx}`} 
                      completed={completedItems.includes(`learner-${idx}`)} 
                      onToggle={onToggleItem} 
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 1 && (
            <section className="space-y-8">
              <div className="bg-emerald-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-emerald-100 relative overflow-hidden flex items-center min-h-[220px]">
                <div className="absolute -right-10 -top-10 opacity-20">
                  <Globe className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 02</span>
                  <h2 className="text-4xl font-black mb-4">초학문적 주제 (Transdisciplinary Themes)</h2>
                  <p className="text-emerald-100 text-lg font-medium max-w-2xl">우리가 살아가는 세상의 중요한 문제들을 6가지 주제로 나누어 탐구합니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ibThemes.map((theme, idx) => (
                  <motion.div 
                    key={idx}
                    className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col gap-4 hover:shadow-2xl transition-all"
                  >
                    <div className="w-24 h-24 bg-emerald-50 rounded-3xl flex items-center justify-center mb-4 p-2 group-hover:scale-110 transition-transform shadow-inner">
                      <img src={theme.image} alt={theme.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                    <h3 className="text-xl font-black text-gray-900">{theme.title}</h3>
                    <p className="text-gray-500 text-sm leading-relaxed flex-1">{theme.description}</p>
                    <StudyCheck 
                      id={`theme-${idx}`} 
                      completed={completedItems.includes(`theme-${idx}`)} 
                      onToggle={onToggleItem} 
                    />
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {activeTab === 2 && (
            <section className="space-y-8">
              <div className="bg-amber-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-amber-100 relative overflow-hidden flex items-center min-h-[220px]">
                <div className="absolute -right-10 -bottom-10 opacity-20">
                  <Compass className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 03</span>
                  <h2 className="text-4xl font-black mb-4">핵심 개념 (Key Concepts)</h2>
                  <p className="text-amber-50 text-lg font-medium max-w-2xl">세상을 바라보는 7가지 렌즈입니다. 이 렌즈를 통해 더 깊이 있게 탐구할 수 있습니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {ibKeyConcepts.map((concept, idx) => {
                  return (
                    <motion.div 
                      key={idx}
                      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col gap-4 hover:shadow-2xl transition-all"
                    >
                      <div className="w-24 h-24 bg-amber-50 rounded-3xl flex items-center justify-center p-2 group-hover:scale-110 transition-transform shadow-inner">
                        <img src={concept.image} alt={concept.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900">{concept.title}</h3>
                      <p className="text-gray-500 text-sm leading-relaxed flex-1">{concept.description}</p>
                      <StudyCheck 
                        id={`concept-${idx}`} 
                        completed={completedItems.includes(`concept-${idx}`)} 
                        onToggle={onToggleItem} 
                      />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 3 && (
            <section className="space-y-8">
              <div className="bg-blue-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-blue-100 relative overflow-hidden flex items-center min-h-[220px]">
                <div className="absolute -right-10 -top-10 opacity-20">
                  <RefreshCcw className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 04</span>
                  <h2 className="text-4xl font-black mb-4">탐구 사이클 (Inquiry Cycle)</h2>
                  <p className="text-blue-50 text-lg font-medium max-w-2xl">탐구가 이루어지는 순환 과정입니다. 질문에서 시작하여 실천으로 이어집니다.</p>
                </div>
              </div>

              <div className="relative">
                <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-blue-100 -translate-x-1/2 hidden lg:block" />
                <div className="grid grid-cols-1 gap-12 relative z-10">
                  {ibInquiryCycle.map((step, idx) => (
                    <motion.div 
                      key={idx}
                      className={cn(
                        "flex flex-col lg:flex-row items-center gap-8",
                        idx % 2 === 1 ? "lg:flex-row-reverse" : ""
                      )}
                    >
                      <div className="flex-1 w-full">
                        <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 hover:shadow-2xl transition-all">
                          <div className="flex items-center gap-4 mb-4">
                            <span className="w-10 h-10 bg-blue-600 text-white rounded-full flex items-center justify-center font-black text-xl">
                              {idx + 1}
                            </span>
                            <h3 className="text-2xl font-black text-gray-900">{step.title}</h3>
                          </div>
                          <p className="text-gray-500 text-lg leading-relaxed mb-6">{step.description}</p>
                          <StudyCheck 
                            id={`inquiry-${idx}`} 
                            completed={completedItems.includes(`inquiry-${idx}`)} 
                            onToggle={onToggleItem} 
                          />
                        </div>
                      </div>
                      <div className="w-28 h-28 bg-blue-600 rounded-full flex items-center justify-center text-white shadow-2xl relative z-20 shrink-0 border-4 border-white">
                        <img src={step.image} alt={step.title} className="w-20 h-20 object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                      </div>
                      <div className="flex-1 hidden lg:block" />
                    </motion.div>
                  ))}
                </div>
              </div>
            </section>
          )}

          {activeTab === 4 && (
            <section className="space-y-8">
              <div className="bg-purple-600 p-10 rounded-[3rem] text-white shadow-2xl shadow-purple-100 relative overflow-hidden flex items-center min-h-[220px]">
                <div className="absolute -right-10 -bottom-10 opacity-20">
                  <GraduationCap className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 05</span>
                  <h2 className="text-4xl font-black mb-4">ATL 기술 (Approaches to Learning)</h2>
                  <p className="text-purple-100 text-lg font-medium max-w-2xl">학습하는 방법을 배우는 5가지 기술입니다. 평생 학습자가 되기 위한 필수 도구입니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {ibATL.map((atl, idx) => {
                  return (
                    <motion.div 
                      key={idx}
                      className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-gray-50 flex flex-col gap-6 hover:shadow-2xl transition-all"
                    >
                      <div className="flex items-center gap-6">
                        <div className="w-28 h-28 bg-purple-50 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform shadow-inner overflow-hidden">
                          <img 
                            src={atl.image} 
                            alt={atl.title} 
                            className={cn(
                              "w-full h-full object-contain",
                              (atl.title.includes("의사소통") || atl.title.includes("자기 관리")) ? "scale-125" : "scale-110"
                            )} 
                            referrerPolicy="no-referrer" 
                          />
                        </div>
                        <h3 className="text-2xl font-black text-gray-900">{atl.title}</h3>
                      </div>
                      <div className="space-y-4 flex-1">
                        <p className="text-gray-500 text-sm leading-relaxed">{atl.description}</p>
                        <div className="space-y-3">
                          <p className="text-xs font-black text-purple-600 uppercase tracking-widest">나의 실천 점수</p>
                          <div className="flex gap-2">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <button
                                key={star}
                                onClick={() => onSaveATL(atl.title, star)}
                                className={cn(
                                  "w-8 h-8 rounded-lg flex items-center justify-center transition-all",
                                  (atlData[atl.title] || 0) >= star 
                                    ? "bg-purple-600 text-white shadow-lg shadow-purple-100" 
                                    : "bg-gray-50 text-gray-300 hover:bg-gray-100"
                                )}
                              >
                                <Star className={cn("w-4 h-4", (atlData[atl.title] || 0) >= star ? "fill-current" : "")} />
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <StudyCheck 
                        id={`atl-${idx}`} 
                        completed={completedItems.includes(`atl-${idx}`)} 
                        onToggle={onToggleItem} 
                      />
                    </motion.div>
                  );
                })}
              </div>
            </section>
          )}

          {activeTab === 5 && (
            <section className="space-y-8">
              <div className="bg-rose-500 p-10 rounded-[3rem] text-white shadow-2xl shadow-rose-100 relative overflow-hidden flex items-center min-h-[220px]">
                <div className="absolute -right-10 -top-10 opacity-20">
                  <BookOpen className="w-64 h-64" />
                </div>
                <div className="relative z-10">
                  <span className="px-4 py-1 bg-white/20 rounded-full text-xs font-black uppercase tracking-widest mb-4 inline-block">MISSION 06</span>
                  <h2 className="text-4xl font-black mb-4">성찰 일지 (Reflection Journal)</h2>
                  <p className="text-rose-50 text-lg font-medium max-w-2xl">오늘의 배움을 되돌아보고 생각하는 시간입니다. 성찰을 통해 더 크게 성장할 수 있습니다.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {randomQuestions.map((q, idx) => (
                  <motion.div 
                    key={idx}
                    className="bg-white p-10 rounded-[3rem] shadow-xl border border-gray-50 space-y-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-rose-50 rounded-2xl flex items-center justify-center text-rose-600">
                        <Lightbulb className="w-6 h-6" />
                      </div>
                      <h3 className="text-xl font-black text-gray-900 leading-tight">{q}</h3>
                    </div>
                    <textarea
                      value={reflectionData[q] || ''}
                      onChange={(e) => setReflectionData(prev => ({ ...prev, [q]: e.target.value }))}
                      placeholder="여기에 생각을 적어주세요..."
                      className="w-full h-40 p-6 rounded-[2rem] bg-gray-50 border-2 border-transparent focus:border-rose-200 focus:bg-white outline-none transition-all resize-none font-medium text-gray-700"
                    />
                  </motion.div>
                ))}
              </div>
              <div className="flex justify-center pt-4">
                <Button 
                  onClick={onSaveReflection}
                  className="px-12 py-5 text-xl bg-rose-500 hover:bg-rose-600 shadow-2xl shadow-rose-100"
                  icon={CheckCircle2}
                >
                  성찰 일지 저장하기 (+50 XP)
                </Button>
              </div>
            </section>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
