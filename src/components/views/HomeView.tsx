import React from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../assets';
import { 
  Star, 
  Music, 
  VolumeX, 
  LogOut, 
  Sparkles, 
  BookOpen, 
  Zap, 
  Trophy, 
  ChevronRight, 
  ChevronDown,
  ChevronUp,
  Gamepad2,
  Flame,
  Brain,
  CheckCircle2,
  ListTodo,
  Activity,
  Settings
} from 'lucide-react';
import { ibReflectionQuestions } from '../../content';

import { UserProfile } from '../../types';
import { getLevel, formatGradeClass } from '../../lib/utils';
import { ProfileEditModal } from '../ui/ProfileEditModal';

interface HomeViewProps {
  profile: UserProfile | null;
  reflectionData: Record<string, string>;
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard') => void;
  rankings: UserProfile[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  bgMusicPlaying: boolean;
  setBgMusicPlaying: (playing: boolean) => void;
  bgMusicVolume: number;
  setBgMusicVolume: (volume: number) => void;
  onLogout: () => void;
  onUpdateQuests?: () => void;
  onUpdateProfile: (data: Partial<UserProfile>) => Promise<void>;
}

export const HomeView = ({ 
  profile, 
  reflectionData, 
  setView, 
  rankings,
  soundEnabled, 
  setSoundEnabled, 
  bgMusicPlaying,
  setBgMusicPlaying,
  bgMusicVolume,
  setBgMusicVolume,
  onLogout,
  onUpdateQuests,
  onUpdateProfile
}: HomeViewProps) => {
  const [showLevelGuide, setShowLevelGuide] = React.useState(false);
  const [showEditModal, setShowEditModal] = React.useState(false);
  const level = getLevel(profile?.score || 0);
  const studyProgress = Math.floor((Object.keys(reflectionData).length / ibReflectionQuestions.length) * 100);

  const DAILY_XP_LIMIT = 500; // Should match App.tsx

  // Calculate class rankings
  const classRankings = React.useMemo(() => {
    const classMap: { [key: string]: { name: string; score: number; count: number } } = {};
    
    rankings.forEach(user => {
      if (user.role === 'teacher') return;
      
      const extractNumbers = (val: string) => {
        if (!val) return [];
        const matches = val.toString().match(/\d+/g);
        return matches ? matches.map(m => parseInt(m, 10).toString()) : [];
      };

      const allNums = [
        ...extractNumbers(user.grade || ''),
        ...extractNumbers(user.class || '')
      ];
      
      if (allNums.length >= 2) {
        const nGrade = allNums[0];
        const nClass = allNums[1];
        const groupKey = `${nGrade}-${nClass}`;
        const groupName = `${nGrade}학년 ${nClass}반`;
        
        if (!classMap[groupKey]) {
          classMap[groupKey] = { name: groupName, score: 0, count: 0 };
        }
        classMap[groupKey].score += (user.score || 0);
        classMap[groupKey].count += 1;
      }
    });
    
    return Object.values(classMap).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [rankings]);
  
  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <header className="relative overflow-hidden bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-48 h-48 object-contain" referrerPolicy="no-referrer" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
            <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden transition-transform group-hover:scale-105", level.bg)}>
              <img src={level.img} alt={level.name} className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
            </div>
            <div className="absolute -bottom-2 -right-2 bg-yellow-400 text-white p-1.5 rounded-full shadow-lg border-2 border-white group-hover:bg-indigo-500 transition-colors">
              <Settings className="w-4 h-4" />
            </div>
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors rounded-3xl flex items-center justify-center">
              <span className="text-[10px] font-black text-white opacity-0 group-hover:opacity-100 transition-opacity uppercase tracking-widest">Edit</span>
            </div>
          </div>
          
          <div className="text-center md:text-left flex-1">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mb-2">
              <h2 className="text-2xl font-black text-gray-900">{profile?.name} {profile?.role === 'teacher' ? '선생님' : '탐험가님'}</h2>
              <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", level.bg, level.color)}>
                {level.name}
              </span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => setShowEditModal(true)}
                className="h-8 px-3 text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full flex items-center gap-1.5 border border-indigo-100"
              >
                <Settings className="w-3.5 h-3.5" />
                <span className="text-[10px] font-black uppercase">정보 수정</span>
              </Button>
            </div>
            <p className="text-gray-500 font-medium mb-4 cursor-pointer hover:text-indigo-600 transition-colors" onClick={() => setShowEditModal(true)}>
              {formatGradeClass(profile?.grade, profile?.class, profile?.role)} • 증평초등학교
            </p>
            
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

            {/* Daily XP Limit Progress */}
            <div className="mt-4 p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="text-xs font-black text-indigo-900 uppercase tracking-tighter">오늘의 경험치 상한</span>
                </div>
                <span className="text-xs font-black text-indigo-600">
                  {profile?.dailyXP || 0} / {DAILY_XP_LIMIT} XP
                </span>
              </div>
              <div className="h-2 bg-white rounded-full overflow-hidden border border-indigo-50">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${Math.min(((profile?.dailyXP || 0) / DAILY_XP_LIMIT) * 100, 100)}%` }}
                  className={cn(
                    "h-full transition-colors",
                    (profile?.dailyXP || 0) >= DAILY_XP_LIMIT ? "bg-green-500" : "bg-amber-400"
                  )}
                />
              </div>
              {(profile?.dailyXP || 0) >= DAILY_XP_LIMIT && (
                <p className="text-[10px] text-green-600 font-bold mt-1">✨ 오늘의 목표 경험치를 모두 달성했습니다! 내일 또 만나요!</p>
              )}
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
            {profile?.name === '김혜진' && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setView('dashboard')}
                className="bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100 mt-2"
                icon={Activity}
              >
                활동 로그 (교사용)
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setView('plan')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 mt-2"
              icon={BookOpen}
            >
              활용계획서
            </Button>
          </div>
        </div>
      </header>

      {/* Daily Quests Section */}
      {profile?.dailyQuests && profile.dailyQuests.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white/80 backdrop-blur-md rounded-[40px] p-8 border border-white/40 shadow-xl"
        >
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-emerald-500 rounded-2xl flex items-center justify-center shadow-lg shadow-emerald-200">
                <ListTodo className="w-6 h-6 text-white" />
              </div>
              <div>
                <h3 className="text-2xl font-black text-gray-900">🎯 오늘의 일일 퀘스트</h3>
                <p className="text-emerald-600 font-bold text-sm uppercase tracking-widest">DAILY MISSIONS</p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {profile.dailyQuests.map((quest) => (
              <motion.div 
                key={quest.id}
                whileHover={!quest.completed ? { y: -5, scale: 1.02 } : {}}
                whileTap={!quest.completed ? { scale: 0.98 } : {}}
                onClick={() => {
                  if (quest.completed) return;
                  const viewMap: Record<string, any> = {
                    'study': 'study',
                    'flashcards': 'flashcards',
                    'memory': 'memory',
                    'quiz': 'quiz'
                  };
                  if (viewMap[quest.type]) {
                    setView(viewMap[quest.type]);
                  }
                }}
                className={cn(
                  "p-5 rounded-3xl border-2 transition-all flex flex-col gap-3 cursor-pointer group",
                  quest.completed 
                    ? "bg-emerald-50 border-emerald-200 shadow-inner cursor-default" 
                    : "bg-white border-gray-100 shadow-sm hover:border-indigo-200 hover:shadow-md"
                )}
              >
                <div className="flex items-center justify-between">
                  <span className={cn(
                    "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                    quest.completed ? "bg-emerald-200 text-emerald-700" : "bg-gray-100 text-gray-400 group-hover:bg-indigo-100 group-hover:text-indigo-600"
                  )}>
                    {quest.completed ? "COMPLETED" : "IN PROGRESS"}
                  </span>
                  {quest.completed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                  ) : (
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-400 transition-colors" />
                  )}
                </div>
                
                <div>
                  <h4 className={cn("font-black text-sm", quest.completed ? "text-emerald-900" : "text-gray-900 group-hover:text-indigo-900")}>
                    {quest.title}
                  </h4>
                  <p className="text-xs text-gray-500 font-medium mt-1">{quest.description}</p>
                </div>

                <div className="mt-auto pt-3 border-t border-gray-100/50">
                  <div className="flex items-center justify-between text-[10px] font-black mb-1">
                    <span className="text-gray-400">PROGRESS</span>
                    <span className="text-indigo-600">{quest.progress} / {quest.target}</span>
                  </div>
                  <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                      className={cn("h-full", quest.completed ? "bg-emerald-500" : "bg-indigo-500")}
                    />
                  </div>
                  <div className="mt-2 flex items-center gap-1 text-[10px] font-black text-amber-600">
                    <Star className="w-3 h-3 fill-amber-600" />
                    +{quest.xpReward} XP
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Top 3 Rankings Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/40 backdrop-blur-md rounded-[40px] p-8 border border-white/40 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-yellow-400 rounded-2xl flex items-center justify-center shadow-lg shadow-yellow-200">
              <Trophy className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">🏆 실시간 누적 랭킹 TOP 3</h3>
              <p className="text-yellow-600 font-bold text-sm uppercase tracking-widest">CURRENT LEADERS</p>
            </div>
          </div>
          <Button 
            variant="secondary" 
            size="sm" 
            onClick={() => setView('ranking')}
            className="bg-white/80 hover:bg-white"
          >
            전체 순위 보기
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {rankings.slice(0, 3).map((rank, index) => {
            const level = getLevel(rank.score);
            return (
              <div 
                key={rank.uid}
                className={cn(
                  "relative p-6 rounded-3xl border-2 flex flex-col items-center text-center transition-all hover:scale-105",
                  index === 0 ? "bg-gradient-to-b from-yellow-50 to-white border-yellow-200 shadow-yellow-100 shadow-lg" :
                  index === 1 ? "bg-gradient-to-b from-slate-50 to-white border-slate-200" :
                  "bg-gradient-to-b from-orange-50 to-white border-orange-200"
                )}
              >
                <div className={cn(
                  "absolute -top-4 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full flex items-center justify-center text-white font-black text-lg shadow-md z-20",
                  index === 0 ? "bg-yellow-400" : index === 1 ? "bg-slate-400" : "bg-orange-400"
                )}>
                  {index + 1}
                </div>
                
                <div className="relative mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center">
                    <img 
                      src={level.img} 
                      alt={rank.name}
                      className="w-20 h-20 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-black shadow-md border-2 border-white whitespace-nowrap z-30",
                    level.bg,
                    level.color
                  )}>
                    {level.name}
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-gray-900">{rank.name}</h4>
                <p className="text-gray-500 font-bold text-xs mb-3">{formatGradeClass(rank.grade, rank.class, rank.role)}</p>
                
                <div className="px-4 py-1.5 bg-white rounded-full border border-gray-100 shadow-sm">
                  <span className="text-indigo-600 font-black">{rank.score.toLocaleString()} XP</span>
                </div>
              </div>
            );
          })}
          {rankings.length === 0 && (
            <div className="col-span-3 py-12 text-center text-gray-400 font-bold italic">
              아직 탐험가가 없습니다. 첫 번째 주인공이 되어보세요!
            </div>
          )}
        </div>
      </motion.div>

      {/* Top 3 Classes Section */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-indigo-50/50 backdrop-blur-md rounded-[40px] p-8 border border-indigo-100 shadow-xl"
      >
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">🏫 학급 대항전 TOP 3</h3>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">CLASS LEADERS</p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {classRankings.map((cls, index) => {
            const avgScore = Math.round(cls.score / cls.count);
            const level = getLevel(avgScore);
            return (
              <div 
                key={cls.name}
                className={cn(
                  "relative p-6 rounded-3xl border-2 flex flex-col items-center text-center bg-white shadow-sm transition-all hover:scale-105",
                  index === 0 ? "border-yellow-400 ring-4 ring-yellow-50" : "border-gray-100"
                )}
              >
                <div className={cn(
                  "absolute -top-4 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full text-white font-black text-xs shadow-md z-20",
                  index === 0 ? "bg-yellow-400" : index === 1 ? "bg-slate-400" : "bg-orange-400"
                )}>
                  {index + 1}위
                </div>
                
                <div className="relative mb-4">
                  <div className="w-20 h-20 rounded-2xl bg-gray-50 border-2 border-white shadow-inner overflow-hidden flex items-center justify-center">
                    <img 
                      src={level.img} 
                      alt={cls.name}
                      className="w-16 h-16 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                  <div className={cn(
                    "absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[8px] font-black shadow-md border-2 border-white whitespace-nowrap z-30",
                    level.bg,
                    level.color
                  )}>
                    {level.name.split(' ')[0]} 반
                  </div>
                </div>
                
                <h4 className="text-xl font-black text-gray-900 mt-2">{cls.name}</h4>
                <p className="text-gray-500 font-bold text-xs mb-4">참여 학생: {cls.count}명</p>
                
                <div className="w-full space-y-2">
                  <div className="flex justify-between text-[10px] font-black text-indigo-400 uppercase">
                    <span>TOTAL SCORE</span>
                    <span>{cls.score.toLocaleString()} XP</span>
                  </div>
                  <div className="h-2 bg-indigo-50 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min((cls.score / (classRankings[0]?.score || 1)) * 100, 100)}%` }}
                      className="h-full bg-indigo-500"
                    />
                  </div>
                </div>
              </div>
            );
          })}
          {classRankings.length === 0 && (
            <div className="col-span-3 py-12 text-center text-gray-400 font-bold italic">
              아직 학급 데이터가 없습니다.
            </div>
          )}
        </div>
      </motion.div>

      {/* XP Guide Card - Information Section */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-indigo-900/5 backdrop-blur-md p-8 rounded-[2.5rem] border-2 border-indigo-100/50"
      >
        <div className="flex items-center gap-4 mb-6">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-2xl font-black text-indigo-900">💎 포인트 획득 방법 (안내)</h3>
            <p className="text-indigo-500 font-bold text-sm uppercase tracking-widest">XP ACQUISITION GUIDE</p>
          </div>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div 
            onClick={() => setView('study')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-blue-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.logo} alt="Knowledge" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-blue-900 text-sm">지식 탐험</h4>
            <p className="text-xs text-blue-700 font-bold mt-1">+30 XP</p>
          </div>
          
          <div 
            onClick={() => setView('flashcards')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-amber-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.flashcard_icon} alt="Flashcards" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-amber-900 text-sm">플래시카드</h4>
            <p className="text-xs text-amber-700 font-bold mt-1">+150 XP</p>
          </div>

          <div 
            onClick={() => setView('memory')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-indigo-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.memory_icon} alt="Memory" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-indigo-900 text-sm">기억력 강화</h4>
            <p className="text-xs text-indigo-700 font-bold mt-1">+50 XP</p>
          </div>

          <div 
            onClick={() => setView('quiz')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-purple-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.quiz_icon} alt="Quiz" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-purple-900 text-sm">퀴즈 챌린지</h4>
            <p className="text-xs text-purple-700 font-bold mt-1">+50 XP</p>
          </div>

          <div 
            onClick={() => setView('music-quiz')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-rose-50 transition-colors group"
          >
            <div className="w-12 h-12 bg-rose-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.music_icon} alt="Music" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-rose-900 text-sm">음악 퀴즈</h4>
            <p className="text-xs text-rose-700 font-bold mt-1">+50 XP</p>
          </div>
        </div>
      </motion.div>

      {/* Explorer Level Guide */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-white/60 backdrop-blur-md rounded-[2.5rem] border-2 border-white shadow-xl overflow-hidden"
      >
        <button 
          onClick={() => setShowLevelGuide(!showLevelGuide)}
          className="w-full flex items-center justify-between p-8 hover:bg-white/40 transition-colors text-left"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-200">
              <Star className="w-6 h-6 text-white fill-current" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-gray-900">🗺️ 탐험가 단계 안내</h3>
              <p className="text-amber-600 font-bold text-sm uppercase tracking-widest">EXPLORER LEVEL GUIDE</p>
            </div>
          </div>
          <div className={cn(
            "w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center transition-transform duration-300",
            showLevelGuide ? "rotate-180" : ""
          )}>
            <ChevronDown className="w-6 h-6 text-gray-400" />
          </div>
        </button>

        <motion.div 
          initial={false}
          animate={{ 
            height: showLevelGuide ? 'auto' : 0,
            opacity: showLevelGuide ? 1 : 0
          }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
          className="px-8 pb-8"
        >
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 200, 600, 1200, 2000, 3000, 4500, 6000, 8000, 10000].map((threshold) => {
              const lv = getLevel(threshold);
              return (
                <div key={threshold} className="flex items-center gap-4 p-4 bg-white/80 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shrink-0", lv.bg)}>
                    <img src={lv.img} alt={lv.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <h4 className="font-black text-gray-900 truncate">{lv.name}</h4>
                      <span className="text-[10px] font-black text-indigo-500 bg-indigo-50 px-2 py-0.5 rounded-full shrink-0">
                        {threshold.toLocaleString()} XP+
                      </span>
                    </div>
                    <p className="text-xs text-gray-500 font-medium line-clamp-1">{lv.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      </motion.div>

      <div className="space-y-6">
        <div className="flex items-center gap-3 px-2">
          <div className="w-2 h-8 bg-indigo-600 rounded-full" />
          <h3 className="text-2xl font-black text-gray-900">🚀 탐험 시작하기 (입장)</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
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
          onClick={() => setView('flashcards')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-amber-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-amber-50/30">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-amber-100 overflow-hidden p-2">
              <img src={ASSETS.quiz.flashcard_icon} alt="Flashcards" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">플래시카드</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">카드를 뒤집으며 재미있게 익혀요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full text-[10px] font-black text-amber-600 border border-amber-100">
              <Star className="w-3 h-3 fill-amber-600" />
              완료 시 150 XP
            </div>
            <div className="mt-6 flex items-center gap-1 text-amber-600 font-bold text-sm">
              학습 시작하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('memory')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-indigo-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-indigo-50/30">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100 overflow-hidden p-2">
              <img src={ASSETS.quiz.memory_icon} alt="Memory" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">기억력 강화</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">같은 그림을 찾아 기억력을 높여요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-indigo-50 rounded-full text-[10px] font-black text-indigo-600 border border-indigo-100">
              <Star className="w-3 h-3 fill-indigo-600" />
              완료 시 50 XP
            </div>
            <div className="mt-6 flex items-center gap-1 text-indigo-600 font-bold text-sm">
              게임 시작하기 <ChevronRight className="w-4 h-4" />
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
            <p className="text-gray-500 text-sm font-medium mb-2">도전! 퀴즈를 풀고 XP와 티켓을 얻으세요.</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 border border-emerald-100">
              <Gamepad2 className="w-3 h-3" />
              10문제 만점 시 티켓 3장!
            </div>
            <div className="mt-6 flex items-center gap-1 text-emerald-600 font-bold text-sm">
              도전하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('music-quiz')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-rose-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-rose-50/30">
            <div className="w-20 h-20 bg-rose-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-rose-100 overflow-hidden p-2">
              <img src={ASSETS.quiz.music_icon} alt="Music Quiz" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">음악 퀴즈</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">음악 지식을 뽐내보세요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-rose-50 rounded-full text-[10px] font-black text-rose-600 border border-rose-100">
              <Music className="w-3 h-3" />
              정답당 +50 XP
            </div>
            <div className="mt-6 flex items-center gap-1 text-rose-600 font-bold text-sm">
              도전하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('games')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-pink-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-pink-50/30">
            <div className="w-20 h-20 bg-pink-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-pink-100 overflow-hidden p-2">
              <img src={ASSETS.quiz.game_icon} alt="Games" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">게임 코너</h3>
            <p className="text-gray-500 text-sm font-medium">퀴즈 풀고 얻은 티켓으로 게임을 즐겨요!</p>
            <div className="mt-6 flex items-center gap-1 text-pink-600 font-bold text-sm">
              입장하기 <ChevronRight className="w-4 h-4" />
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

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('certificate')}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-indigo-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-indigo-50/30">
            <div className="w-20 h-20 bg-indigo-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-indigo-100 overflow-hidden p-2">
              <img 
                src="https://i.imgur.com/ToOjCxD.png" 
                alt="Certificate" 
                className="w-full h-full object-contain" 
                referrerPolicy="no-referrer"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "https://picsum.photos/seed/award/200/200";
                }}
              />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">자격증 발급</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">나만의 탐험가 자격증을 받아보세요!</p>
            <div className="mt-6 flex items-center gap-1 text-indigo-600 font-bold text-sm">
              발급하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>
      </div>
      <ProfileEditModal 
        show={showEditModal} 
        onClose={() => setShowEditModal(false)} 
        profile={profile} 
        onUpdate={onUpdateProfile} 
      />
    </div>
  </div>
  );
};
