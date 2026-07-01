import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
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
  Settings,
  Lightbulb,
  Megaphone,
  X,
  Gift,
  Trees,
  Pin,
  Camera,
  Award,
  MessageSquare
} from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';
import { ibReflectionQuestions } from '../../content';

import { UserProfile } from '../../types';
import { getLevel, formatGradeClass } from '../../lib/utils';
import { ProfileEditModal } from '../ui/ProfileEditModal';

interface HomeViewProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  reflectionData: Record<string, string>;
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'bingo' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard' | 'concept-forest' | 'certificate-gallery' | 'ib-board', initialStudyTab?: number) => void;
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
  user,
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
  const [showNotice, setShowNotice] = React.useState(() => {
    try {
      return !sessionStorage.getItem('dismissed_notice_month_end');
    } catch (e) {
      return true;
    }
  });
  const level = getLevel(profile?.score || 0);
  const studyProgress = Math.floor((Object.keys(reflectionData).length / ibReflectionQuestions.length) * 100);

  const DAILY_XP_LIMIT = 1500; // Should match App.tsx

  const currentMonth = new Date().getMonth() + 1;

  // Calculate class rankings based on monthly score
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
        classMap[groupKey].score += (user.monthlyScore || 0);
        classMap[groupKey].count += 1;
      }
    });
    
    return Object.values(classMap).sort((a, b) => b.score - a.score).slice(0, 3);
  }, [rankings]);

  const topMonthlyRankings = React.useMemo(() => {
    return [...rankings].sort((a, b) => (b.monthlyScore || 0) - (a.monthlyScore || 0)).slice(0, 3);
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
            {user?.email === '1004sugar1004@gmail.com' && (
              <Button 
                variant="secondary" 
                size="sm" 
                onClick={() => setView('dashboard')}
                className="bg-rose-600 text-white hover:bg-rose-700 shadow-lg shadow-rose-100 mt-2"
                icon={Activity}
              >
                활동로그(관리자 전용)
              </Button>
            )}
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setShowNotice(true)}
              className="bg-amber-500 text-white hover:bg-amber-600 shadow-lg shadow-amber-100 mt-2 font-black"
              icon={Megaphone}
            >
              의견반영 & 버그수정 공지
            </Button>
            <Button 
              variant="secondary" 
              size="sm" 
              onClick={() => setView('plan')}
              className="bg-indigo-600 text-white hover:bg-indigo-700 shadow-lg shadow-indigo-100 mt-1"
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
                <p className="text-[10px] text-indigo-600 font-black mt-1">🎁 퀘스트 완료 시 게임 티켓 2장을 드립니다!</p>
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
              <h3 className="text-2xl font-black text-gray-900">🏆 {currentMonth}월 실시간 누적 랭킹 TOP 3</h3>
              <p className="text-yellow-600 font-bold text-sm uppercase tracking-widest">MONTHLY LEADERS</p>
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
          {topMonthlyRankings.map((rank, index) => {
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
                  <span className="text-indigo-600 font-black">{(rank.monthlyScore || 0).toLocaleString()} XP</span>
                </div>
              </div>
            );
          })}
          {topMonthlyRankings.length === 0 && (
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
              <h3 className="text-2xl font-black text-gray-900">🏫 {currentMonth}월 학급 대항전 TOP 3</h3>
              <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">MONTHLY CLASS LEADERS</p>
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

      {/* NEW SECTION: AI Caricature & IB Board Collaborative Notice */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-gradient-to-r from-indigo-900 via-slate-900 to-purple-950 text-white rounded-[40px] p-8 md:p-10 shadow-2xl border border-indigo-500/20 relative overflow-hidden"
        id="homeview-promotional-announcements"
      >
        {/* Decorative ambient blobs */}
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-4 max-w-3xl">
              <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-indigo-500/20 border border-indigo-400/30 rounded-full text-xs font-black text-indigo-300 uppercase tracking-widest animate-pulse">
                <Sparkles className="w-3.5 h-3.5" />
                Special New Corner Open!
              </span>
              <h3 className="text-3xl md:text-4xl font-black tracking-tight leading-tight">
                📸 나만의 AI 캐리커쳐 자격증 발급 & IB 보드 코너 오픈!
              </h3>
              <p className="text-slate-300 font-semibold text-sm md:text-base leading-relaxed">
                탐험가 여러분! 이제 자격증 코너에서 내 얼굴 사진을 직접 카메라로 찍거나 업로드하여 <span className="text-amber-400 font-black">세상에 단 하나뿐인 AI 캐리커쳐 자격증</span>을 즉시 발급받으실 수 있습니다!
              </p>
            </div>
            
            <div className="flex flex-wrap gap-4 shrink-0">
              <Button
                onClick={() => setView('certificate')}
                className="px-6 py-4 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white font-black text-sm rounded-2xl shadow-lg border-none"
              >
                📸 자격증 캐리커쳐 만들기
              </Button>
              <Button
                onClick={() => setView('ib-board')}
                className="px-6 py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-black text-sm rounded-2xl shadow-lg border-none"
              >
                📌 IB 패들렛 글쓰기
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-10 pt-8 border-t border-white/10">
            {/* Feature 1 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 bg-indigo-500/20 rounded-2xl flex items-center justify-center text-indigo-400 mb-4 font-black">
                <Camera className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black mb-1.5 text-white">1. 카메라로 내사진 찰칵!</h4>
              <p className="text-slate-400 text-xs font-semibold leading-normal">
                자격증 코너에서 카메라로 얼굴을 촬영해 나만의 학습자 캐리커쳐를 만들어 보세요! 
                <span className="text-rose-400 block font-bold mt-1">⚠️ 안정적 생성을 위해 개인 하루 3회, 전체 50회 양만 한정 생성됩니다!</span>
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 bg-purple-500/20 rounded-2xl flex items-center justify-center text-purple-400 mb-4 font-black">
                <Award className="w-5 h-5" />
              </div>
              <h4 className="text-base font-black mb-1.5 text-white">2. 자격증 자랑 코너 (+50 XP)</h4>
              <p className="text-slate-400 text-xs font-semibold leading-normal">
                완성된 자격증 이미지를 내 기기에 저장한 후, <strong>자랑 코너에 업로드하여 공유</strong>해 주세요! 등록하는 모든 탐험가에게 <strong>즉시 50 XP 포인트</strong>를 드립니다! 🎁✨
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/5 backdrop-blur-sm p-5 rounded-3xl border border-white/5 hover:border-white/10 transition-colors">
              <div className="w-10 h-10 bg-amber-500/20 rounded-2xl flex items-center justify-center text-amber-400 mb-4 font-black">
                <Pin className="w-5 h-5 fill-amber-400/30 text-amber-400" />
              </div>
              <h4 className="text-base font-black mb-1.5 text-white">3. IB 패들렛 소통 보드 (+30 XP)</h4>
              <p className="text-slate-400 text-xs font-semibold leading-normal">
                내가 가장 좋아하는 IB 학습자상과 이유, 혹은 탐구하고 싶은 탐구 주제와 이유를 패들렛 보드에 작성해 보세요! 
                <strong> 정성 가득 잘 쓴 사람에게는 아주 특별한 선물</strong>을 드립니다! 🎁
              </p>
            </div>
          </div>
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
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

          <div 
            onClick={() => setView('bingo')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-amber-50 transition-colors group"
            id="homeview-quick-bingo"
          >
            <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform">
              <img src={ASSETS.quiz.game_icon} alt="Bingo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h4 className="font-black text-amber-900 text-sm">지식 빙고</h4>
            <p className="text-xs text-amber-700 font-bold mt-1">+50 XP</p>
          </div>

          <div 
            onClick={() => setView('concept-forest')}
            className="flex flex-col items-center text-center p-4 bg-white/60 rounded-3xl border border-white shadow-sm cursor-pointer hover:bg-emerald-50 transition-colors group"
            id="homeview-quick-forest"
          >
            <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mb-3 p-2 group-hover:scale-110 transition-transform text-emerald-600">
              <Trees className="w-8 h-8" />
            </div>
            <h4 className="font-black text-emerald-900 text-sm">개념의 숲</h4>
            <p className="text-xs text-emerald-700 font-bold mt-1">+50 XP</p>
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
          <div className="mb-4 mt-2 p-4 bg-amber-50 border border-amber-200/60 rounded-3xl flex items-start gap-3">
            <span className="text-lg">📢</span>
            <div className="text-xs text-amber-900 font-semibold leading-relaxed">
              <span className="text-amber-800 block font-black mb-0.5">탐험가 레벨 시스템 20단계 전면 개편 안내!</span>
              더 알찬 탐험과 풍성한 성취감을 위해 <strong>총 20단계 레벨 시스템</strong>으로 전면 재편되었습니다. 등급 체계 개편에 따라 각 레벨 구간 및 달성 기준 XP도 새롭게 상향 조정되었습니다.
            </div>
          </div>
          <div className="pt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            {[0, 200, 600, 1200, 2000, 3000, 5000, 10000, 20000, 35000, 50000, 70000, 90000, 110000, 130000, 150000, 170000, 190000, 210000, 225000].map((threshold) => {
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
          onClick={() => setView('study', 6)}
          className="group"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-cyan-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-cyan-50/30">
            <div className="w-20 h-20 bg-cyan-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-cyan-100 overflow-hidden p-3 text-cyan-600">
              <Lightbulb className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">개념 초성 퀴즈</h3>
            <p className="text-gray-500 text-sm font-medium mb-1">초성 힌트를 보고 한글 단어를 맞춰보세요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-cyan-50 rounded-full text-[10px] font-black text-cyan-600 border border-cyan-100 mt-2">
              <Star className="w-3 h-3 fill-cyan-400 text-cyan-500" />
              정답 당 +50 XP
            </div>
            <div className="mt-6 flex items-center gap-1 text-cyan-600 font-bold text-sm">
              퀴즈 시작하기 <ChevronRight className="w-4 h-4" />
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
          onClick={() => setView('bingo')}
          className="group"
          id="homeview-card-bingo"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-amber-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-amber-50/30">
            <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-amber-100 overflow-hidden p-2">
              <img src={ASSETS.quiz.game_icon} alt="Bingo Game" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">지식 빙고</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">컴퓨터 AI와 겨루는 지능 빙고 대결!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-amber-50 rounded-full text-[10px] font-black text-amber-600 border border-amber-100">
              <Gamepad2 className="w-3 h-3" />
              승리 시 +50 XP 획득!
            </div>
            <div className="mt-6 flex items-center gap-1 text-amber-600 font-bold text-sm">
              도전하기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('concept-forest')}
          className="group"
          id="homeview-card-forest"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-emerald-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-emerald-50/30">
            <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-emerald-100 overflow-hidden p-3 text-emerald-600">
              <Trees className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">개념의 숲</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">IB 개념 질문을 풀고 개념 나무를 키워요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-emerald-50 rounded-full text-[10px] font-black text-emerald-600 border border-emerald-100">
              <Trees className="w-3 h-3" />
              완료 시 +50 XP 획득!
            </div>
            <div className="mt-6 flex items-center gap-1 text-emerald-600 font-bold text-sm">
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

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('certificate-gallery')}
          className="group"
          id="homeview-card-certificate-gallery"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-purple-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-purple-50/30">
            <div className="w-20 h-20 bg-purple-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-purple-100 overflow-hidden p-3 text-purple-600">
              <Sparkles className="w-12 h-12" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">자격증 자랑 코너</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">내 자격증을 올리고 칭찬도 주고 받아요!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-purple-50 rounded-full text-[10px] font-black text-purple-600 border border-purple-100">
              <Sparkles className="w-3 h-3" />
              업로드 시 +50 XP 획득!
            </div>
            <div className="mt-6 flex items-center gap-1 text-purple-600 font-bold text-sm">
              자랑하러 가기 <ChevronRight className="w-4 h-4" />
            </div>
          </Card>
        </motion.div>

        <motion.div 
          whileHover={{ y: -10, scale: 1.02 }} 
          whileTap={{ scale: 0.98 }}
          onClick={() => setView('ib-board')}
          className="group"
          id="homeview-card-ib-board"
        >
          <Card className="p-8 cursor-pointer border-2 border-transparent group-hover:border-orange-400 transition-all h-full flex flex-col items-center text-center bg-gradient-to-b from-white to-orange-50/30">
            <div className="w-20 h-20 bg-orange-100 rounded-3xl flex items-center justify-center mb-6 group-hover:rotate-12 transition-transform shadow-lg shadow-orange-100 overflow-hidden p-3 text-orange-600">
              <Pin className="w-12 h-12 fill-orange-500 text-orange-600" />
            </div>
            <h3 className="text-2xl font-black mb-2 text-gray-900">IB 보드 (패들렛)</h3>
            <p className="text-gray-500 text-sm font-medium mb-2">가장 좋아하는 학습자상과 탐구하고 싶은 주제 나누기!</p>
            <div className="flex items-center gap-1 px-3 py-1 bg-orange-50 rounded-full text-[10px] font-black text-orange-600 border border-orange-100">
              <Sparkles className="w-3 h-3 text-orange-500" />
              등록 시 +30 XP & 우수글 특별선물!
            </div>
            <div className="mt-6 flex items-center gap-1 text-orange-600 font-bold text-sm">
              패들렛 보러 가기 <ChevronRight className="w-4 h-4" />
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

      {/* BUG FIX & OPINIONS NOTICE MODAL POPUP */}
      <AnimatePresence>
        {showNotice && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 z-50 overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.95, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.95, y: 20 }}
              className="bg-white border-4 border-amber-400 p-6 md:p-8 rounded-[2.5rem] max-w-2xl w-full relative shadow-2xl overflow-hidden text-gray-800"
            >
              {/* Top gradient badge & close button */}
              <div className="absolute top-0 left-0 right-0 h-3 bg-gradient-to-r from-amber-400 via-orange-400 to-yellow-400" />
              
              <button 
                onClick={() => {
                  try {
                    sessionStorage.setItem('dismissed_notice_month_end', 'true');
                  } catch (e) {}
                  setShowNotice(false);
                }}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center transition-colors shadow-sm cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-4 mb-6 mt-2">
                <div className="w-14 h-14 rounded-2xl bg-amber-100 flex items-center justify-center border-2 border-amber-300 text-3xl shrink-0 animate-bounce">
                  📢
                </div>
                <div>
                  <h3 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight leading-tight">
                    소중한 의견 반영 & 버그 수정 안내!
                  </h3>
                  <p className="text-sm text-gray-500 font-bold mt-1">
                    학생 여러분이 제출해주신 의견과 버그 내용을 열심히 패치했어요!
                  </p>
                </div>
              </div>

              {/* Notice Details Content Grid */}
              <div className="space-y-3.5 mb-6 max-h-[50vh] overflow-y-auto pr-2">
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  
                  <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">🛠️</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-emerald-950 mb-0.5">김*린 학생: 초성퀴즈 버그 수정 완료!</p>
                      <p className="text-emerald-700 font-medium leading-relaxed">초성퀴즈의 오작동 및 멈춤 버그를 완벽하게 고쳤어요.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">🏪</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-indigo-950 mb-0.5">이*민 학생: 편의점 버그 패치 완료!</p>
                      <p className="text-indigo-700 font-medium leading-relaxed">편의점 정리 3스테이지 클리어 후 시간이 계속 가거나 다음 스테이지가 안 가던 버그를 고쳤어요.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">⚡</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-sky-955 mb-0.5">전*원 학생: 할리갈리 렉 개선 완료!</p>
                      <p className="text-sky-700 font-medium leading-relaxed">할리갈리 게임 진행 속도와 원치 않는 로딩 렉 버그를 제어했어요.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-pink-50 rounded-2xl border border-pink-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">🥤</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-pink-950 mb-0.5">반*아 학생: 할리갈리 컵 쌓기 (성공 출시! 🎉)</p>
                      <p className="text-pink-700 font-medium leading-relaxed">반*아 학생의 아주 신나고 재미있는 컵할리갈리 기획이 훌륭한 게임으로 정식 탑재 및 완성되었습니다!</p>
                    </div>
                  </div>

                  <div className="p-4 bg-rose-50 rounded-2xl border border-rose-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">🏔️</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-rose-950 mb-0.5">조*아 학생: 점프맵 관련 안내</p>
                      <p className="text-rose-700 font-medium leading-relaxed">점프맵 게임은 무거운 렌더링 서버 및 제작 비용이 아주 크게 들어, 대체할 수 있는 멋진 아이디어를 생각 중이에요.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 shadow-sm flex items-start gap-3">
                    <span className="text-lg">🃏</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-amber-955 mb-0.5">권*훈 학생: 도블 게임 (성공 출시! 🎉)</p>
                      <p className="text-amber-700 font-medium leading-relaxed">권*훈 학생이 제안하고 기획한 고품격 도블 카드 매칭 게임이 멋진 디자인과 함께 정식 런칭되었습니다!</p>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-50 rounded-2xl border border-purple-100 shadow-sm flex items-start gap-3 col-span-1 md:col-span-2">
                    <span className="text-lg">🎮</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-purple-950 mb-0.5">엄*우 학생: 1인 2인 패드 모드 관련 안내</p>
                      <p className="text-purple-700 font-medium leading-relaxed">친구와 대면해서 <strong>하나의 태블릿 패드로 함께 조작</strong>하는 미니게임은 기획 중이에요! 각자의 무선 태블릿 패드로 실시간 연동하는 것은 서버 버그가 많아 면밀히 알아보고 있어요.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-cyan-50 rounded-2xl border border-cyan-100 shadow-sm flex items-start gap-3 col-span-1 md:col-span-2">
                    <span className="text-lg">🥷</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-cyan-950 mb-0.5">손날닌자 카메라 꿀팁!</p>
                      <p className="text-cyan-700 font-medium leading-relaxed">카메라 기능이 제대로 켜져 있는지 확인해 보세요! <strong>카메라가 활성화되면 화면을 직접 터치하지 않고도</strong> 손날 모션을 인식해 더 편하게 게임할 수 있답니다.</p>
                    </div>
                  </div>

                  <div className="p-4 bg-teal-50 rounded-2xl border border-teal-100 shadow-sm flex items-start gap-3 col-span-1 md:col-span-2">
                    <span className="text-lg">📅</span>
                    <div className="text-xs">
                      <p className="font-extrabold text-teal-950 mb-0.5">엄*수 학생: 일일퀘스트 다양화!</p>
                      <p className="text-teal-700 font-medium leading-relaxed">매일 완료할 수 있는 일일 탐험 퀘스트를 더 신나고 질리지 않도록 다양한 퀘스트들을 성실하게 보강 완료했습니다.</p>
                    </div>
                  </div>

                </div>

                {/* Gift Event Announcement Box */}
                <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-yellow-500/10 border-2 border-dashed border-amber-300 p-5 rounded-3xl mt-4 text-center relative overflow-hidden">
                  <div className="absolute -top-3 -right-3 opacity-20 select-none pointer-events-none">
                    <Gift className="w-16 h-16 text-amber-500" />
                  </div>
                  <div className="flex justify-center mb-2 text-2xl">
                    🎁 🎉 💝
                  </div>
                  <h4 className="text-sm font-black text-amber-900 tracking-tight mb-1">
                    소중한 의견 감사 선물 추첨 이벤트!
                  </h4>
                  <p className="text-xs text-gray-700 font-bold leading-relaxed">
                    여러분들의 애정 어린 탐험가 의견들에 진심으로 감사드립니다! 소중한 아이디어를 제출해준 <br />
                    <span className="text-amber-800 font-extrabold">모든 학생들을 대상으로 이번 월말에 정성스런 기프트 추첨을 통해 선물을 증정할게요! ^^</span>
                  </p>
                </div>

                <div className="text-center py-2">
                  <p className="text-xs font-black text-indigo-600 bg-indigo-50 py-2.5 px-4 rounded-full inline-block border border-indigo-100">
                    💡 오늘도 열심히 탐구하는 영리한 IB 가치 탐험가가 되어 보세요!
                  </p>
                </div>

              </div>

              {/* Close Bottom CTA Button */}
              <div className="flex gap-3">
                <Button 
                  onClick={() => {
                    try {
                      sessionStorage.setItem('dismissed_notice_month_end', 'true');
                    } catch (e) {}
                    setShowNotice(false);
                  }}
                  className="w-full bg-gradient-to-r from-amber-400 to-orange-500 hover:from-amber-500 hover:to-orange-600 text-white text-base font-black py-4 rounded-2xl shadow-xl shadow-amber-200 border-b-4 border-orange-700 flex items-center justify-center gap-2 cursor-pointer"
                  id="notice-popup-close-btn"
                >
                  확인했습니다 ! 탐험 계속하기
                </Button>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  </div>
  );
};
