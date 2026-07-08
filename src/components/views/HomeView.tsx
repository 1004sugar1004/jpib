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
  MessageSquare,
  User as UserIcon,
  Ticket
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
  const [showAllMenuModal, setShowAllMenuModal] = React.useState(false);
  const [activeLayout, setActiveLayout] = React.useState<'classic' | 'dashboard' | 'bento' | 'sidebar'>(() => {
    try {
      return (localStorage.getItem('home_layout_style') as any) || 'sidebar';
    } catch (e) {
      return 'sidebar';
    }
  });
  const [dashboardTab, setDashboardTab] = React.useState<'study' | 'ranking' | 'guide'>('study');
  const [sidebarOpen, setSidebarOpen] = React.useState(true); // Open by default so they see it instantly!
  const [sidebarPinned, setSidebarPinned] = React.useState(true);

  const exploreItems = [
    { 
      id: 'study', 
      name: '지식 탐험', 
      desc: 'IB 핵심 마스터', 
      badge: 'NEW', 
      category: 'CORE VALUES', 
      actionText: '자세히 보기', 
      circleBg: 'bg-emerald-50 text-emerald-600', 
      icon: '🏕️',
      action: () => setView('study') 
    },
    { 
      id: 'chorus', 
      name: '개념 초성 퀴즈', 
      desc: '초성 단어 맞추기', 
      badge: 'HOT', 
      category: 'BRAIN GAME', 
      actionText: '도전하기', 
      circleBg: 'bg-cyan-50 text-cyan-600', 
      icon: '💡',
      action: () => setView('study', 6) 
    },
    { 
      id: 'flashcards', 
      name: '플래시카드', 
      desc: '카드를 뒤집으며 학습', 
      badge: '', 
      category: 'STUDY TOOLS', 
      actionText: '연습하기', 
      circleBg: 'bg-amber-50 text-amber-600', 
      icon: '🃏',
      action: () => setView('flashcards') 
    },
    { 
      id: 'memory', 
      name: '기억력 강화', 
      desc: '같은 그림 찾기 게임', 
      badge: '', 
      category: 'BRAIN GAME', 
      actionText: '도전하기', 
      circleBg: 'bg-indigo-50 text-indigo-600', 
      icon: '🧩',
      action: () => setView('memory') 
    },
    { 
      id: 'quiz', 
      name: '퀴즈 챌린지', 
      desc: '도전! 실력 점검 퀴즈', 
      badge: 'BEST', 
      category: 'CHALLENGE', 
      actionText: '도전하기', 
      circleBg: 'bg-purple-50 text-purple-600', 
      icon: '📝',
      action: () => setView('quiz') 
    },
    { 
      id: 'music-quiz', 
      name: '음악 퀴즈', 
      desc: '재미있는 가사/멜로디 퀴즈', 
      badge: '', 
      category: 'CREATIVE', 
      actionText: '감상하고 풀기', 
      circleBg: 'bg-rose-50 text-rose-600', 
      icon: '🎵',
      action: () => setView('music-quiz') 
    },
    { 
      id: 'bingo', 
      name: '지식 빙고', 
      desc: 'AI 컴퓨터와 겨루는 빙고', 
      badge: '', 
      category: 'BRAIN GAME', 
      actionText: '도전하기', 
      circleBg: 'bg-yellow-50 text-yellow-600', 
      icon: '🎲',
      action: () => setView('bingo') 
    },
    { 
      id: 'concept-forest', 
      name: '개념의 숲', 
      desc: '질문 풀고 나무 키우기', 
      badge: '', 
      category: 'STUDY TOOLS', 
      actionText: '키워보기', 
      circleBg: 'bg-emerald-50 text-emerald-600', 
      icon: '🌳',
      action: () => setView('concept-forest') 
    },
    { 
      id: 'games', 
      name: '게임 코너', 
      desc: '티켓으로 미니게임 즐기기', 
      badge: 'COOL', 
      category: 'ARCADE', 
      actionText: '플레이하기', 
      circleBg: 'bg-pink-50 text-pink-600', 
      icon: '🎰',
      action: () => setView('games') 
    },
    { 
      id: 'ranking', 
      name: '명예의 전당', 
      desc: '최고의 탐험가 순위', 
      badge: 'LIVE', 
      category: 'LEADERBOARD', 
      actionText: '랭킹 확인', 
      circleBg: 'bg-yellow-50 text-yellow-600', 
      icon: '🏆',
      action: () => setView('ranking') 
    },
    { 
      id: 'certificate', 
      name: '자격증 발급', 
      desc: '나만의 탐험가 자격증', 
      badge: '', 
      category: 'REWARDS', 
      actionText: '발급받기', 
      circleBg: 'bg-indigo-50 text-indigo-600', 
      icon: '📸',
      action: () => setView('certificate') 
    },
    { 
      id: 'certificate-gallery', 
      name: '자격증 자랑 코너', 
      desc: '내 자격증 올리기', 
      badge: '', 
      category: 'COMMUNITY', 
      actionText: '올려보기', 
      circleBg: 'bg-purple-50 text-purple-600', 
      icon: '✨',
      action: () => setView('certificate-gallery') 
    },
    { 
      id: 'ib-board', 
      name: 'IB 보드 (패들렛)', 
      desc: '의견과 탐구 주제 공유', 
      badge: '', 
      category: 'COMMUNITY', 
      actionText: '의견 나누기', 
      circleBg: 'bg-orange-50 text-orange-600', 
      icon: '📌',
      action: () => setView('ib-board') 
    }
  ];

  const handleLayoutChange = (style: 'classic' | 'dashboard' | 'bento' | 'sidebar') => {
    setActiveLayout(style);
    try {
      localStorage.setItem('home_layout_style', style);
    } catch (e) {}
  };

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
  
  const activitiesList = [
    { id: 'study', name: '지식 탐험', desc: 'IB 핵심 가치 마스터', icon: ASSETS.quiz.logo, bg: 'from-blue-50 to-white hover:border-blue-400', progress: studyProgress, action: () => setView('study'), color: 'blue', isImg: true },
    { id: 'chorus', name: '개념 초성 퀴즈', desc: '초성 힌트로 단어 맞추기', icon: '💡', bg: 'from-cyan-50 to-white hover:border-cyan-400', action: () => setView('study', 6), color: 'cyan', xp: '정답 당 +50 XP' },
    { id: 'flashcards', name: '플래시카드', desc: '카드를 뒤집으며 학습', icon: ASSETS.quiz.flashcard_icon, bg: 'from-amber-50 to-white hover:border-amber-400', action: () => setView('flashcards'), color: 'amber', xp: '완료 시 150 XP', isImg: true },
    { id: 'memory', name: '기억력 강화', desc: '같은 그림 찾기 게임', icon: ASSETS.quiz.memory_icon, bg: 'from-indigo-50 to-white hover:border-indigo-400', action: () => setView('memory'), color: 'indigo', xp: '완료 시 50 XP', isImg: true },
    { id: 'quiz', name: '퀴즈 챌린지', desc: '도전! 실력 점검 퀴즈', icon: ASSETS.quiz.quiz_icon, bg: 'from-emerald-50 to-white hover:border-emerald-400', action: () => setView('quiz'), color: 'emerald', ticket: '티켓 3장!', isImg: true },
    { id: 'music-quiz', name: '음악 퀴즈', desc: '재미있는 가사/멜로디 퀴즈', icon: ASSETS.quiz.music_icon, bg: 'from-rose-50 to-white hover:border-rose-400', action: () => setView('music-quiz'), color: 'rose', xp: '정답당 +50 XP', isImg: true },
    { id: 'bingo', name: '지식 빙고', desc: 'AI 컴퓨터와 겨루는 빙고', icon: ASSETS.quiz.game_icon, bg: 'from-amber-50 to-white hover:border-amber-400', action: () => setView('bingo'), color: 'amber', xp: '승리 시 +50 XP', isImg: true },
    { id: 'forest', name: '개념의 숲', desc: '질문 풀고 나무 키우기', icon: '🌳', bg: 'from-emerald-50 to-white hover:border-emerald-400', action: () => setView('concept-forest'), color: 'emerald', xp: '완료 시 +50 XP' },
    { id: 'games', name: '게임 코너', desc: '티켓으로 미니게임 즐기기', icon: ASSETS.quiz.game_icon, bg: 'from-pink-50 to-white hover:border-pink-400', action: () => setView('games'), color: 'pink', isImg: true },
    { id: 'ranking', name: '명예의 전당', desc: '최고의 탐험가 순위', icon: ASSETS.quiz.ranking_icon, bg: 'from-yellow-50 to-white hover:border-yellow-400', action: () => setView('ranking'), color: 'yellow', isImg: true },
    { id: 'certificate', name: '자격증 발급', desc: '나만의 탐험가 자격증', icon: 'https://i.imgur.com/ToOjCxD.png', bg: 'from-indigo-50 to-white hover:border-indigo-400', action: () => setView('certificate'), color: 'indigo', isImg: true },
    { id: 'gallery', name: '자격증 자랑 코너', desc: '내 자격증 올리기', icon: '✨', bg: 'from-purple-50 to-white hover:border-purple-400', action: () => setView('certificate-gallery'), color: 'purple', xp: '업로드 시 +50 XP' },
    { id: 'board', name: 'IB 보드 (패들렛)', desc: '의견과 탐구 주제 공유', icon: '📌', bg: 'from-orange-50 to-white hover:border-orange-400', action: () => setView('ib-board'), color: 'orange', xp: '등록 시 +30 XP' }
  ];

  const renderLayoutSwitcher = () => (
    <div className="bg-gradient-to-r from-indigo-50/90 via-purple-50/90 to-pink-50/90 backdrop-blur-md rounded-3xl p-5 border border-indigo-100 shadow-md flex flex-col md:flex-row items-center justify-between gap-4 w-full">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-indigo-600 rounded-2xl flex items-center justify-center text-white text-lg font-black shadow-lg shadow-indigo-100 shrink-0">
          🎨
        </div>
        <div>
          <h4 className="text-sm font-black text-indigo-950 flex items-center gap-1.5">
            <span>🎨 홈화면 디자인 레이아웃 체험관</span>
            <span className="bg-indigo-600 text-white text-[9px] px-1.5 py-0.5 rounded-full font-black animate-pulse">NEW</span>
          </h4>
          <p className="text-[11px] text-indigo-600 font-bold">콘텐츠가 많아 깔끔하게 정돈하고 싶다면? 마음에 드는 디자인 테마를 즉시 적용해 보세요!</p>
        </div>
      </div>
      <div className="flex flex-wrap gap-1 bg-white/80 p-1 rounded-2xl border border-indigo-100/60 shadow-inner shrink-0">
        <button
          onClick={() => handleLayoutChange('classic')}
          className={cn(
            "px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1",
            activeLayout === 'classic' 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          🏕️ 클래식 어드벤처
        </button>
        <button
          onClick={() => handleLayoutChange('dashboard')}
          className={cn(
            "px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1",
            activeLayout === 'dashboard' 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          ⚡ 미니멀 대시보드
        </button>
        <button
          onClick={() => handleLayoutChange('bento')}
          className={cn(
            "px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1",
            activeLayout === 'bento' 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          🍱 인터랙티브 벤토
        </button>
        <button
          onClick={() => handleLayoutChange('sidebar')}
          className={cn(
            "px-3 py-2 rounded-xl text-[11px] font-black transition-all cursor-pointer flex items-center gap-1",
            activeLayout === 'sidebar' 
              ? "bg-indigo-600 text-white shadow-md" 
              : "text-gray-500 hover:text-gray-800 hover:bg-gray-50"
          )}
        >
          📱 모던 슬라이드 내비
        </button>
      </div>
    </div>
  );

  const renderDashboardLayout = () => {
    return (
      <div className="max-w-6xl mx-auto p-4 py-8 space-y-8 text-gray-800">
        {renderLayoutSwitcher()}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Sidebar Info panel */}
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-white/90 backdrop-blur-md rounded-3xl p-6 shadow-xl border border-gray-100 space-y-6">
              {/* Compact User Identity */}
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setShowEditModal(true)}
                  className={cn("w-16 h-16 rounded-2xl flex items-center justify-center shadow-inner overflow-hidden cursor-pointer transition-transform hover:scale-105 p-1", level.bg)}
                >
                  {profile?.photoURL === 'caricature' && profile?.caricatureSvg ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: profile.caricatureSvg }} 
                      className="w-12 h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    />
                  ) : (
                    <img src={level.img} alt={level.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div>
                  <h3 className="text-lg font-black text-gray-900">{profile?.name} {profile?.role === 'teacher' ? '선생님' : '탐험가'}</h3>
                  <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-widest mt-1", level.bg, level.color)}>
                    {level.name}
                  </span>
                </div>
              </div>

              {/* Progress Bars */}
              <div className="space-y-4 pt-4 border-t border-gray-100">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-400">누적 경험치</span>
                    <span className="font-black text-indigo-600">{profile?.score} XP</span>
                  </div>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden border border-gray-50">
                    <motion.div 
                       initial={{ width: 0 }}
                       animate={{ width: `${Math.min((profile?.score || 0) / 10, 100)}%` }}
                       className="h-full bg-gradient-to-r from-indigo-500 to-purple-500"
                    />
                  </div>
                </div>

                <div className="space-y-1.5 p-3.5 bg-indigo-50/40 rounded-2xl border border-indigo-100/40">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-black text-indigo-900 flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500" /> 일일 목표</span>
                    <span className="font-black text-indigo-600">{profile?.dailyXP || 0} / {DAILY_XP_LIMIT} XP</span>
                  </div>
                  <div className="h-1.5 bg-white rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(((profile?.dailyXP || 0) / DAILY_XP_LIMIT) * 100, 100)}%` }}
                      className={cn("h-full", (profile?.dailyXP || 0) >= DAILY_XP_LIMIT ? "bg-green-500" : "bg-amber-400")}
                    />
                  </div>
                </div>
              </div>

              {/* Settings and Buttons */}
              <div className="space-y-2 pt-4 border-t border-gray-100">
                <div className="flex items-center justify-between bg-gray-50 p-2.5 rounded-xl border border-gray-100">
                  <span className="text-xs font-black text-gray-500">배경음악 볼륨</span>
                  <div className="flex items-center gap-2">
                    <button onClick={() => setBgMusicPlaying(!bgMusicPlaying)} className="text-indigo-600 hover:text-indigo-800">
                      {bgMusicPlaying ? <Music className="w-4 h-4" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                    </button>
                    <input 
                      type="range" min="0" max="1" step="0.1" value={bgMusicVolume} 
                      onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                      className="w-16 h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-center">
                  <Button variant="ghost" onClick={() => setSoundEnabled(!soundEnabled)} className="text-gray-500 text-[11px] py-1">
                    {soundEnabled ? "🔊 효과음 ON" : "🔇 효과음 OFF"}
                  </Button>
                  <Button variant="ghost" onClick={onLogout} className="text-red-500 text-[11px] py-1">
                    로그아웃
                  </Button>
                </div>

                <Button variant="secondary" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-announcement', { detail: { tab: 'user_feedback_patches' } }))} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2 rounded-xl mt-2 flex items-center justify-center gap-1.5 shadow-md">
                  <Megaphone className="w-3.5 h-3.5" /> 의견반영 & 공지
                </Button>
                <Button variant="secondary" size="sm" onClick={() => setView('plan')} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1.5 shadow-md">
                  <BookOpen className="w-3.5 h-3.5" /> 활용계획서
                </Button>
              </div>
            </div>

            {/* Daily Quests Compact */}
            {profile?.dailyQuests && profile.dailyQuests.length > 0 && (
              <div className="bg-white/90 backdrop-blur-md rounded-3xl p-5 shadow-xl border border-gray-100 space-y-4">
                <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5">
                  <ListTodo className="w-4 h-4 text-emerald-500" />
                  🎯 오늘의 일일 미션
                </h4>
                <div className="space-y-2.5">
                  {profile.dailyQuests.map((quest) => (
                    <div 
                      key={quest.id} 
                      onClick={() => {
                        if (quest.completed) return;
                        const viewMap: Record<string, any> = { 'study': 'study', 'flashcards': 'flashcards', 'memory': 'memory', 'quiz': 'quiz' };
                        if (viewMap[quest.type]) setView(viewMap[quest.type]);
                      }}
                      className={cn(
                        "p-3 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-2 text-xs",
                        quest.completed ? "bg-emerald-50/50 border-emerald-100 text-emerald-800" : "bg-gray-50/50 border-gray-100 hover:border-indigo-200"
                      )}
                    >
                      <div className="min-w-0 flex-1">
                        <p className="font-extrabold truncate">{quest.title}</p>
                        <p className="text-[10px] text-gray-400 mt-0.5">{quest.progress} / {quest.target} 완료</p>
                      </div>
                      {quest.completed ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                      ) : (
                        <span className="text-[10px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-black">+{quest.xpReward} XP</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Main Panel */}
          <div className="lg:col-span-2 space-y-6">
            {/* Horizontal Tabs bar */}
            <div className="flex bg-white/90 backdrop-blur-sm p-1.5 rounded-2xl border border-gray-100 shadow-md">
              <button 
                onClick={() => setDashboardTab('study')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  dashboardTab === 'study' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-800"
                )}
              >
                🎮 탐험 학습 콘텐츠
              </button>
              <button 
                onClick={() => setDashboardTab('ranking')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  dashboardTab === 'ranking' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-800"
                )}
              >
                🏆 실시간 랭킹
              </button>
              <button 
                onClick={() => setDashboardTab('guide')}
                className={cn(
                  "flex-1 py-3 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-1.5",
                  dashboardTab === 'guide' ? "bg-indigo-600 text-white shadow-lg" : "text-gray-500 hover:text-gray-800"
                )}
              >
                💡 포인트 & 가이드
              </button>
            </div>

            {/* Tab content 1: Activities Grid */}
            {dashboardTab === 'study' && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {activitiesList.map((item) => (
                  <motion.div
                    key={item.id}
                    whileHover={{ y: -4, scale: 1.01 }}
                    whileTap={{ scale: 0.99 }}
                    onClick={item.action}
                    className="group bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all cursor-pointer flex items-center gap-4"
                  >
                    <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center shrink-0 p-1 bg-gray-50 group-hover:scale-105 transition-transform")}>
                      {item.isImg ? (
                        <img src={item.icon} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                      ) : (
                        <span className="text-2xl">{item.icon}</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <h4 className="font-black text-gray-900 text-sm group-hover:text-indigo-900 transition-colors flex items-center gap-1.5">
                        {item.name}
                        {item.xp && <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded-full font-bold">{item.xp}</span>}
                      </h4>
                      <p className="text-gray-400 text-[11px] font-medium truncate mt-0.5">{item.desc}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors shrink-0" />
                  </motion.div>
                ))}
              </div>
            )}

            {/* Tab content 2: Rankings & Classes */}
            {dashboardTab === 'ranking' && (
              <div className="space-y-6">
                {/* Individual Top 3 */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-4">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-yellow-500 animate-bounce" /> {currentMonth}월 실시간 랭킹 TOP 3</h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {topMonthlyRankings.map((rank, index) => (
                      <div key={rank.uid} className="bg-gray-50/50 border border-gray-100 rounded-2xl p-4 text-center relative flex flex-col items-center justify-center">
                        <span className={cn("absolute top-3 left-3 w-5 h-5 rounded-full text-[10px] font-black text-white flex items-center justify-center shadow", index === 0 ? "bg-yellow-400" : index === 1 ? "bg-slate-400" : "bg-orange-400")}>{index + 1}</span>
                        <div className="w-12 h-12 rounded-full overflow-hidden bg-white border border-gray-100 mb-2 flex items-center justify-center">
                          {rank.photoURL === 'caricature' && rank.caricatureSvg ? (
                            <div dangerouslySetInnerHTML={{ __html: rank.caricatureSvg }} className="w-10 h-10 flex items-center justify-center" />
                          ) : (
                            <img src={getLevel(rank.score).img} alt={rank.name} className="w-10 h-10 object-contain" referrerPolicy="no-referrer" />
                          )}
                        </div>
                        <h5 className="font-black text-xs">{rank.name}</h5>
                        <p className="text-[10px] text-gray-400 font-bold">{formatGradeClass(rank.grade, rank.class, rank.role)}</p>
                        <p className="text-indigo-600 font-black text-[11px] mt-1.5 bg-white px-2 py-0.5 rounded-full border border-gray-100">{(rank.monthlyScore || 0).toLocaleString()} XP</p>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Class rankings */}
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-4">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5"><Brain className="w-4 h-4 text-indigo-500" /> 🏫 {currentMonth}월 학급 대항전</h4>
                  <div className="space-y-2">
                    {classRankings.map((cls, idx) => (
                      <div key={cls.name} className="flex items-center justify-between p-3 bg-gray-50/50 rounded-2xl border border-gray-100 text-xs font-bold">
                        <div className="flex items-center gap-3">
                          <span className={cn("w-5 h-5 rounded-full text-[10px] text-white flex items-center justify-center font-black", idx === 0 ? "bg-yellow-400" : "bg-indigo-300")}>{idx + 1}위</span>
                          <span className="text-gray-900 font-black">{cls.name}</span>
                        </div>
                        <span className="text-indigo-600 font-black">{cls.score.toLocaleString()} XP (참여 {cls.count}명)</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Tab content 3: Guides */}
            {dashboardTab === 'guide' && (
              <div className="space-y-6">
                <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-4">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5">🗺️ 탐험가 단계 레벨 안내</h4>
                  <p className="text-[11px] text-gray-500 font-medium leading-relaxed">각 등급별로 승급하기 위한 목표 XP 테이블입니다. 열심히 학습하여 마스터 등급을 획득하세요!</p>
                  <div className="grid grid-cols-2 gap-2 max-h-60 overflow-y-auto pr-1">
                    {[0, 200, 600, 1200, 2000, 3000, 5000, 10000, 20000, 35000].map((threshold) => {
                      const lv = getLevel(threshold);
                      return (
                        <div key={threshold} className="flex items-center gap-2 p-2 bg-gray-50 rounded-xl border border-gray-100 text-[11px]">
                          <img src={lv.img} alt={lv.name} className="w-8 h-8 object-contain shrink-0" referrerPolicy="no-referrer" />
                          <div className="min-w-0 flex-1">
                            <p className="font-black truncate text-gray-800">{lv.name}</p>
                            <p className="text-[9px] text-indigo-500 font-bold">{threshold.toLocaleString()} XP+</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Modals placed inside the render container */}
        <ProfileEditModal show={showEditModal} onClose={() => setShowEditModal(false)} profile={profile} onUpdate={onUpdateProfile} />
      </div>
    );
  };

  const renderBentoLayout = () => {
    return (
      <div className="max-w-6xl mx-auto p-4 py-8 space-y-8 text-gray-800">
        {renderLayoutSwitcher()}

        {/* Bento Grid container */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Profile & Progress Bento Box (spans 2 cols) */}
          <div className="md:col-span-2 bg-gradient-to-br from-indigo-900 to-purple-950 rounded-3xl p-6 md:p-8 text-white relative overflow-hidden shadow-xl flex flex-col justify-between min-h-[220px]">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Sparkles className="w-32 h-32 text-white" />
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start justify-between gap-6 relative z-10">
              <div className="flex items-center gap-4">
                <div 
                  onClick={() => setShowEditModal(true)}
                  className={cn("w-16 h-16 rounded-2xl flex items-center justify-center overflow-hidden cursor-pointer bg-white/10 border border-white/20 p-1")}
                >
                  {profile?.photoURL === 'caricature' && profile?.caricatureSvg ? (
                    <div dangerouslySetInnerHTML={{ __html: profile.caricatureSvg }} className="w-12 h-12 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
                  ) : (
                    <img src={level.img} alt={level.name} className="w-12 h-12 object-contain" referrerPolicy="no-referrer" />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{profile?.name} {profile?.role === 'teacher' ? '선생님' : '탐험가'}</h3>
                  <p className="text-indigo-200 text-xs font-semibold mt-0.5">{formatGradeClass(profile?.grade, profile?.class, profile?.role)}</p>
                  <span className={cn("inline-block px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-widest mt-1.5", level.bg, level.color)}>
                    {level.name}
                  </span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="ghost" onClick={() => setShowEditModal(true)} className="text-white hover:bg-white/10 text-xs py-1.5 px-3 rounded-xl bg-white/5 border border-white/10">정보 수정</Button>
                <Button variant="ghost" onClick={onLogout} className="text-rose-300 hover:bg-white/10 text-xs py-1.5 px-3 rounded-xl bg-white/5 border border-white/10">로그아웃</Button>
              </div>
            </div>

            <div className="space-y-2 mt-6 relative z-10 border-t border-white/10 pt-4">
              <div className="flex justify-between text-xs font-black text-indigo-200">
                <span>탐험 경험치 성취율</span>
                <span>{profile?.score} XP</span>
              </div>
              <div className="h-2.5 bg-white/10 rounded-full overflow-hidden">
                <div style={{ width: `${Math.min((profile?.score || 0) / 10, 100)}%` }} className="h-full bg-gradient-to-r from-amber-400 to-orange-500" />
              </div>
            </div>
          </div>

          {/* Card 2: Quests Bento Box (spans 1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl flex flex-col justify-between">
            <div>
              <h4 className="font-black text-gray-900 text-sm flex items-center gap-1.5 mb-4">
                <ListTodo className="w-4 h-4 text-emerald-500" />
                🎯 일일 퀘스트
              </h4>
              <div className="space-y-2.5">
                {profile?.dailyQuests?.slice(0, 2).map((quest) => (
                  <div key={quest.id} className="p-3 rounded-xl bg-gray-50 border border-gray-100/60 text-[11px] font-bold">
                    <p className="font-black text-gray-800 truncate">{quest.title}</p>
                    <p className="text-indigo-600 font-extrabold mt-0.5">{quest.progress}/{quest.target} 완료 (+{quest.xpReward} XP)</p>
                  </div>
                ))}
                {(!profile?.dailyQuests || profile.dailyQuests.length === 0) && (
                  <p className="text-gray-400 text-xs font-bold text-center py-6">오늘 완료한 퀘스트가 없습니다!</p>
                )}
              </div>
            </div>
            
            <div className="pt-4 border-t border-gray-50 mt-4 text-center">
              <Button variant="secondary" size="sm" onClick={() => setView('plan')} className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-700 text-xs py-2 rounded-xl">활용계획서 보기</Button>
            </div>
          </div>

          {/* Card 3: Activities Bento Board (spans 3 cols) */}
          <div className="md:col-span-3 space-y-4">
            <h4 className="font-black text-gray-900 text-base flex items-center gap-2">
              <span className="text-xl">🗺️</span>
              탐험 플레이 벤토 박스
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {activitiesList.map((item, idx) => {
                const isWide = (idx === 0 || idx === 4 || idx === 11);
                return (
                  <div
                    key={item.id}
                    onClick={item.action}
                    className={cn(
                      "group rounded-3xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between min-h-[140px] bg-gradient-to-b",
                      item.bg,
                      isWide ? "sm:col-span-2" : "col-span-1"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center p-1 font-black">
                        {item.isImg ? <img src={item.icon} alt={item.name} className="w-full h-full object-contain" referrerPolicy="no-referrer" /> : <span className="text-xl">{item.icon}</span>}
                      </div>
                      <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                    </div>
                    <div>
                      <h5 className="font-black text-sm text-gray-900 group-hover:text-indigo-900 transition-colors flex items-center gap-1.5 mt-4">
                        {item.name}
                        {item.xp && <span className="text-[9px] bg-indigo-600 text-white px-1.5 py-0.5 rounded-full font-bold shrink-0">{item.xp}</span>}
                      </h5>
                      <p className="text-[11px] text-gray-400 font-bold truncate mt-1">{item.desc}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 4: Leaderboard Bento Board (spans 2 cols) */}
          <div className="md:col-span-2 bg-white rounded-3xl p-6 border border-gray-100 shadow-xl space-y-4">
            <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5"><Trophy className="w-4 h-4 text-yellow-500" /> 실시간 랭킹 & 대항전</h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-3">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">INDIVIDUAL TOP 3</p>
                {topMonthlyRankings.slice(0, 3).map((rank, idx) => (
                  <div key={rank.uid} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="font-black text-gray-700">{idx + 1}위 {rank.name}</span>
                    <span className="text-indigo-600 font-black">{(rank.monthlyScore || 0).toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
              <div className="space-y-3">
                <p className="text-[11px] font-black text-gray-400 uppercase tracking-widest">CLASS COMPETITIONS</p>
                {classRankings.slice(0, 3).map((cls, idx) => (
                  <div key={cls.name} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100 text-xs">
                    <span className="font-black text-gray-700">{idx + 1}위 {cls.name}</span>
                    <span className="text-indigo-600 font-black">{cls.score.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Card 5: Sound Controls Bento Box (spans 1 col) */}
          <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xl flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-black text-sm text-gray-900 flex items-center gap-1.5"><Music className="w-4 h-4 text-purple-500" /> 사운드 스테이션</h4>
              <div className="space-y-3 bg-gray-50 p-3 rounded-2xl border border-gray-100 text-xs">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-gray-500">배경음악 ON</span>
                  <button onClick={() => setBgMusicPlaying(!bgMusicPlaying)} className="w-8 h-8 rounded-full bg-white shadow-sm flex items-center justify-center text-indigo-600">
                    {bgMusicPlaying ? <Music className="w-4 h-4 animate-spin-slow" /> : <VolumeX className="w-4 h-4 text-gray-400" />}
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-[10px] text-gray-400 block">배경음악 볼륨</span>
                  <input 
                    type="range" min="0" max="1" step="0.1" value={bgMusicVolume} 
                    onChange={(e) => setBgMusicVolume(parseFloat(e.target.value))}
                    className="w-full h-1 bg-gray-200 rounded-lg cursor-pointer accent-indigo-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="text-center pt-4">
              <Button variant="secondary" size="sm" onClick={() => window.dispatchEvent(new CustomEvent('open-announcement', { detail: { tab: 'user_feedback_patches' } }))} className="w-full bg-amber-500 hover:bg-amber-600 text-white font-black text-xs py-2 rounded-xl flex items-center justify-center gap-1">📢 의견반영 공지</Button>
            </div>
          </div>
        </div>

        {/* Modals placed inside the render container */}
        <ProfileEditModal show={showEditModal} onClose={() => setShowEditModal(false)} profile={profile} onUpdate={onUpdateProfile} />
      </div>
    );
  };

  const renderSidebarDrawerContent = (isPinnedLayout: boolean) => {
    const getBadgeColor = (badge: string) => {
      switch (badge) {
        case 'NEW': return 'bg-emerald-500';
        case 'HOT': return 'bg-orange-500';
        case 'BEST': return 'bg-purple-500';
        case 'LIVE': return 'bg-rose-500';
        case 'COOL': return 'bg-pink-500';
        default: return 'bg-indigo-500';
      }
    };

    return (
      <div className="flex flex-col h-full justify-between gap-6">
        {/* Drawer Header */}
        <div className="flex items-center justify-between pb-4 border-b border-gray-100 shrink-0">
          <h2 className="text-2xl font-black text-gray-900 tracking-tight">Menu</h2>
          
          <div className="flex items-center gap-3">
            {/* User Account / Profile icon */}
            <button 
              onClick={() => {
                setShowEditModal(true);
                if (!isPinnedLayout) setSidebarOpen(false);
              }}
              className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-700 hover:text-[#3c5647] transition-colors cursor-pointer border-none"
              title="내 프로필 수정"
            >
              <UserIcon className="w-5 h-5" />
            </button>

            {/* Shopping cart style - Tickets for games */}
            <button 
              onClick={() => {
                setView('games');
                if (!isPinnedLayout) setSidebarOpen(false);
              }}
              className="w-8 h-8 rounded-full hover:bg-amber-50 flex items-center justify-center text-amber-500 hover:text-amber-600 transition-colors relative cursor-pointer border-none"
              title="게임 티켓"
            >
              <Ticket className="w-5 h-5" />
              <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border border-white">
                3
              </span>
            </button>

            {/* Close Button */}
            {!isPinnedLayout && (
              <button 
                onClick={() => setSidebarOpen(false)}
                className="w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center text-gray-400 hover:text-gray-900 transition-colors cursor-pointer border-none"
              >
                <X className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>

        {/* Section 1: EXPLORE navigation cards */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin space-y-4">
          <p className="text-[10px] tracking-widest text-gray-400 font-extrabold uppercase shrink-0">
            EXPLORE
          </p>

          <div className="grid grid-cols-1 gap-3">
            {exploreItems.map((item, idx) => (
              <div 
                key={idx}
                onClick={() => {
                  item.action();
                  if (!isPinnedLayout) setSidebarOpen(false);
                }}
                className="relative bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden"
              >
                {/* Floating background circle containing the icon */}
                <div className="absolute -bottom-3 -right-3 w-16 h-16 rounded-full bg-indigo-50/40 flex items-center justify-center p-2 group-hover:scale-110 transition-transform">
                  <span className="text-2xl select-none">{item.icon}</span>
                </div>

                <div className="relative z-10 pr-8">
                  {/* Badge */}
                  {item.badge && (
                    <span className={cn(
                      "inline-block text-white text-[9px] px-2.5 py-0.5 rounded-full font-black mb-1.5 uppercase tracking-wider",
                      getBadgeColor(item.badge)
                    )}>
                      {item.badge}
                    </span>
                  )}
                  {/* Category */}
                  <p className="text-[9px] text-gray-400 font-extrabold uppercase tracking-widest leading-none mb-1">
                    {item.category}
                  </p>
                  {/* Title */}
                  <h4 className="text-sm font-black text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors">
                    {item.name}
                  </h4>
                  {/* Description */}
                  <p className="text-[10px] text-gray-400 font-bold mt-0.5 leading-normal">
                    {item.desc}
                  </p>

                  {/* Action Link */}
                  <div className="text-[10px] font-black text-gray-600 mt-4 flex items-center gap-1 group-hover:text-indigo-600 transition-colors">
                    <span>{item.actionText}</span>
                    <span className="text-gray-400 group-hover:text-indigo-500 font-semibold transition-transform group-hover:translate-x-0.5">›</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mini Daily Quests Tracker */}
          {profile?.dailyQuests && profile.dailyQuests.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <p className="text-[10px] tracking-widest text-gray-400 font-extrabold uppercase mb-3 flex items-center justify-between">
                <span>DAILY QUESTS (일일 퀘스트)</span>
                <span className="text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded font-bold">Bonus XP</span>
              </p>
              <div className="space-y-2">
                {profile.dailyQuests.map((quest) => (
                  <div 
                    key={quest.id}
                    className={cn(
                      "p-2.5 rounded-xl border text-xs font-bold transition-all flex items-center justify-between",
                      quest.completed 
                        ? "bg-emerald-50/50 border-emerald-100/60 text-emerald-800" 
                        : "bg-gray-50/50 border-gray-100"
                    )}
                  >
                    <div className="min-w-0 flex-1">
                      <p className={cn("truncate", quest.completed ? "line-through text-gray-400" : "text-gray-700")}>
                        {quest.title}
                      </p>
                      <p className="text-[9px] text-gray-400 font-medium mt-0.5">
                        진행률: {quest.progress} / {quest.target}
                      </p>
                    </div>
                    <div className="shrink-0 text-right ml-2">
                      {quest.completed ? (
                        <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black">완료</span>
                      ) : (
                        <span className="text-[9px] text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded font-black">+{quest.xpReward} XP</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Section 2: TOP TREATMENTS custom horizontal cards */}
        <div className="pt-4 border-t border-gray-100 shrink-0">
          <p className="text-[10px] tracking-widest text-gray-400 font-extrabold uppercase mb-3">
            TOP TREATMENTS (추천 코스)
          </p>
          
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none snap-x">
            {/* Treatment Card 1 */}
            <div 
              onClick={() => {
                setView('games');
                if (!isPinnedLayout) setSidebarOpen(false);
              }}
              className="bg-[#fbf9f6] border border-[#eceae2] rounded-2xl p-3 min-w-[140px] flex flex-col justify-between h-[115px] cursor-pointer hover:border-[#3c5647] hover:bg-white transition-all snap-start group"
            >
              <span className="self-start text-[8px] font-black bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                Rx Popular
              </span>
              <div className="mt-2">
                <p className="text-[11px] font-black text-[#1c2c24] leading-tight group-hover:text-[#3c5647]">
                  편의점 정리
                </p>
                <p className="text-[9px] text-[#818a84] font-semibold mt-0.5">
                  티켓으로 게임 즐기기
                </p>
              </div>
            </div>

            {/* Treatment Card 2 */}
            <div 
              onClick={() => {
                setView('ranking');
                if (!isPinnedLayout) setSidebarOpen(false);
              }}
              className="bg-[#fbf9f6] border border-[#eceae2] rounded-2xl p-3 min-w-[140px] flex flex-col justify-between h-[115px] cursor-pointer hover:border-[#3c5647] hover:bg-white transition-all snap-start group"
            >
              <span className="self-start text-[8px] font-black bg-rose-100 text-rose-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                🔥 HOT
              </span>
              <div className="mt-2">
                <p className="text-[11px] font-black text-[#1c2c24] leading-tight group-hover:text-[#3c5647]">
                  실시간 대항전
                </p>
                <p className="text-[9px] text-[#818a84] font-semibold mt-0.5">
                  최고 학급 가려내기
                </p>
              </div>
            </div>

            {/* Treatment Card 3 */}
            <div 
              onClick={() => {
                setView('concept-forest');
                if (!isPinnedLayout) setSidebarOpen(false);
              }}
              className="bg-[#fbf9f6] border border-[#eceae2] rounded-2xl p-3 min-w-[140px] flex flex-col justify-between h-[115px] cursor-pointer hover:border-[#3c5647] hover:bg-white transition-all snap-start group"
            >
              <span className="self-start text-[8px] font-black bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-full uppercase tracking-wider">
                🌳 NEW
              </span>
              <div className="mt-2">
                <p className="text-[11px] font-black text-[#1c2c24] leading-tight group-hover:text-[#3c5647]">
                  개념의 숲
                </p>
                <p className="text-[9px] text-[#818a84] font-semibold mt-0.5">
                  질문 풀고 나무 키우기
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderSidebarLayout = () => {
    return (
      <div className="max-w-7xl mx-auto p-4 py-8 space-y-8 text-gray-800 bg-[#fbf9f6] rounded-[2.5rem] shadow-sm border border-[#eceae2]/70 min-h-[90vh] transition-colors duration-300">
        {/* Layout Switcher at the very top */}
        {renderLayoutSwitcher()}

        {/* Hims-Style Custom Header inside the layout */}
        <div className="flex items-center justify-between py-4 border-b border-[#f0ede6] px-4">
          <div className="flex items-center gap-2">
            <span className="text-xs bg-[#e2ded5] text-[#1c2c24] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider">IB Edition</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Desktop Pin Toggle */}
            <button 
              onClick={() => {
                setSidebarPinned(!sidebarPinned);
                setSidebarOpen(!sidebarOpen);
              }}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-white hover:bg-gray-50 border border-gray-200 transition-all text-gray-600 shadow-sm cursor-pointer"
              title="사이드바 접기/펼치기"
            >
              📌 {sidebarPinned ? "사이드바 접기" : "사이드바 고정 펼치기"}
            </button>

            {/* Profile Avatar trigger */}
            <div 
              onClick={() => setShowEditModal(true)}
              className="w-10 h-10 rounded-full border-2 border-white shadow-sm overflow-hidden bg-white flex items-center justify-center p-0.5 cursor-pointer hover:scale-105 transition-transform"
            >
              {profile?.photoURL === 'caricature' && profile?.caricatureSvg ? (
                <div dangerouslySetInnerHTML={{ __html: profile.caricatureSvg }} className="w-8 h-8 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full" />
              ) : (
                <img src={level.img} alt={level.name} className="w-8 h-8 object-contain" referrerPolicy="no-referrer" />
              )}
            </div>

            {/* Main Menu Button (matches screenshot trigger) */}
            <button
              onClick={() => {
                setShowAllMenuModal(true);
              }}
              className="px-4 py-2 bg-[#1c2c24] hover:bg-[#2e4237] text-white font-black text-xs rounded-xl flex items-center gap-1.5 shadow-sm transition-all cursor-pointer border-none"
            >
              전체메뉴 보기 ☰
            </button>
          </div>
        </div>

        {/* Outer Split Container (Content on left, persistent sidebar on right if pinned) */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 relative">
          
          {/* Main Content Pane */}
          <div className={cn(
            "space-y-8 transition-all duration-300",
            sidebarPinned ? "lg:col-span-3" : "lg:col-span-4"
          )}>
            
            {/* Hims-Style Hero Banner */}
            <div className="py-12 px-6 md:px-8 rounded-[2rem] bg-[#f5f4f0] relative overflow-hidden flex flex-col justify-between min-h-[260px] border border-[#eceae2]">
              <div className="absolute right-0 bottom-0 top-0 w-1/2 opacity-10 pointer-events-none flex items-center justify-center">
                <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              </div>

              <div className="max-w-xl space-y-4 relative z-10">
                <span className="text-xs bg-[#e2ded5] text-[#1c2c24] font-black px-2.5 py-1 rounded-full uppercase tracking-wider animate-pulse">
                  Customized learning starts here
                </span>
                <h1 className="text-4xl md:text-5xl font-black text-[#1c2c24] tracking-tight leading-none mt-2">
                  IB 가치 탐험<br />
                  <span className="text-[#3c5647]">personalized to you.</span>
                </h1>
                <p className="text-[#5a6e60] font-bold text-sm leading-relaxed mt-2">
                  오늘도 탐험가 {profile?.name || '가치'}님의 성향에 맞춘 가치 탐구 코스가 준비되어 있습니다.<br />
                  원하는 공부 테마를 선택하고 나만의 자격증을 완성해 보세요!
                </p>
              </div>

              {/* Status Row */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-[#e5e3da] relative z-10">
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm">
                  <p className="text-[10px] text-[#818a84] font-extrabold uppercase tracking-wider">My Current Level</p>
                  <p className="text-sm font-black text-[#1c2c24] mt-0.5">{level.name}</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm">
                  <p className="text-[10px] text-[#818a84] font-extrabold uppercase tracking-wider">Total Explorer XP</p>
                  <p className="text-sm font-black text-[#1c2c24] mt-0.5">{(profile?.score || 0).toLocaleString()} XP</p>
                </div>
                <div className="bg-white/60 backdrop-blur-sm p-4 rounded-2xl border border-white/40 shadow-sm col-span-2">
                  <p className="text-[10px] text-[#818a84] font-extrabold uppercase tracking-wider">Knowledge Quest Progress</p>
                  <div className="flex items-center gap-3 mt-1.5">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div className="h-full bg-[#3c5647] rounded-full" style={{ width: `${studyProgress}%` }} />
                    </div>
                    <span className="text-xs font-black text-[#1c2c24]">{studyProgress}%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Daily Quests Banner in Sidebar Layout */}
            {profile?.dailyQuests && profile.dailyQuests.length > 0 && (
              <div className="p-6 bg-gradient-to-r from-amber-50 to-orange-50/20 rounded-[2rem] border border-amber-200/50 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">⚡</span>
                    <h3 className="text-base font-black text-amber-950">오늘의 탐험 일일 퀘스트</h3>
                  </div>
                  <span className="text-[10px] text-amber-700 font-extrabold bg-amber-100/60 px-2.5 py-0.5 rounded-full uppercase tracking-wider">Bonus XP</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {profile.dailyQuests.map((quest) => {
                    const viewMap: Record<string, any> = {
                      reflection: 'study',
                      quiz: 'quiz',
                      flashcard: 'flashcards',
                      memory: 'memory',
                      game: 'games',
                      concept_forest: 'concept-forest',
                      music_quiz: 'music-quiz',
                      bingo: 'bingo'
                    };
                    return (
                      <div 
                        key={quest.id}
                        onClick={() => {
                          if (quest.completed) return;
                          if (viewMap[quest.type]) setView(viewMap[quest.type]);
                        }}
                        className={cn(
                          "p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between h-[105px] group",
                          quest.completed 
                            ? "bg-emerald-50/40 border-emerald-100/60 text-emerald-800" 
                            : "bg-white border-gray-100 hover:border-amber-400/60 shadow-sm"
                        )}
                      >
                        <div>
                          <div className="flex justify-between items-start gap-1">
                            <p className={cn("font-extrabold text-xs leading-snug truncate max-w-[170px]", quest.completed ? "text-emerald-950 line-through" : "text-gray-800")}>{quest.title}</p>
                            {quest.completed ? (
                              <span className="text-[9px] bg-emerald-500 text-white px-1.5 py-0.5 rounded font-black shrink-0">완료</span>
                            ) : (
                              <span className="text-[9px] text-amber-600 bg-amber-100/60 px-1.5 py-0.5 rounded font-black shrink-0">+{quest.xpReward} XP</span>
                            )}
                          </div>
                          <p className="text-[10px] text-gray-400 mt-1">{quest.progress} / {quest.target} 완료됨</p>
                        </div>
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden mt-2">
                          <div 
                            className={cn("h-full transition-all duration-500", quest.completed ? "bg-emerald-500" : "bg-amber-500")}
                            style={{ width: `${Math.min((quest.progress / quest.target) * 100, 100)}%` }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Background Hims-Style Content Cards */}
            <div className="space-y-6">
              <div className="flex items-center justify-between px-2">
                <h3 className="text-lg font-black text-[#1c2c24]">Test for what matters (추천 메뉴)</h3>
                <span className="text-xs font-bold text-[#5a6e60] cursor-pointer hover:underline" onClick={() => setShowAllMenuModal(true)}>전체 탐험 목록 보기 →</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                
                {/* Card 1: 지식 탐험 */}
                <div 
                  onClick={() => setView('study')}
                  className="rounded-[2rem] bg-white border border-[#eceae2] shadow-sm p-6 flex flex-col justify-between h-[180px] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden animate-fade-in"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-emerald-500 text-white px-2 py-0.5 rounded-full font-black uppercase tracking-wider">New</span>
                    </div>
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Core Values</p>
                    <h4 className="text-lg font-black text-[#1c2c24] group-hover:text-[#3c5647] transition-colors leading-tight">
                      지식 탐험<br />
                      <span className="text-xs text-gray-400 font-bold block mt-1">IB 핵심 마스터</span>
                    </h4>
                  </div>
                  <div className="text-xs font-black text-[#3c5647] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    자세히 보기 <ChevronRight className="w-3 h-3" />
                  </div>
                  {/* Circular graphic backdrop */}
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center p-3 opacity-80 group-hover:scale-110 transition-transform">
                    <img src={ASSETS.quiz.logo} alt="quiz" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>

                {/* Card 2: 개념 초성 퀴즈 */}
                <div 
                  onClick={() => setView('study', 6)}
                  className="rounded-[2rem] bg-white border border-[#eceae2] shadow-sm p-6 flex flex-col justify-between h-[180px] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden animate-fade-in"
                >
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Brain Game</p>
                    <h4 className="text-lg font-black text-[#1c2c24] group-hover:text-[#3c5647] transition-colors leading-tight">
                      개념 초성 퀴즈<br />
                      <span className="text-xs text-gray-400 font-bold block mt-1">초성 단어 맞추기</span>
                    </h4>
                  </div>
                  <div className="text-xs font-black text-[#3c5647] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    도전하기 <ChevronRight className="w-3 h-3" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-cyan-50 rounded-full flex items-center justify-center text-3xl opacity-80 group-hover:scale-110 transition-transform">
                    💡
                  </div>
                </div>

                {/* Card 3: 자격증 발급 */}
                <div 
                  onClick={() => setView('certificate')}
                  className="rounded-[2rem] bg-white border border-[#eceae2] shadow-sm p-6 flex flex-col justify-between h-[180px] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden animate-fade-in"
                >
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Certification</p>
                    <h4 className="text-lg font-black text-[#1c2c24] group-hover:text-[#3c5647] transition-colors leading-tight">
                      자격증 발급<br />
                      <span className="text-xs text-gray-400 font-bold block mt-1">AI 캐리커쳐 제작</span>
                    </h4>
                  </div>
                  <div className="text-xs font-black text-[#3c5647] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    인증서 생성 <ChevronRight className="w-3 h-3" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center p-4 opacity-80 group-hover:scale-110 transition-transform">
                    <img src="https://i.imgur.com/ToOjCxD.png" alt="cert" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  </div>
                </div>

                {/* Card 4: IB 패들렛 보드 */}
                <div 
                  onClick={() => setView('ib-board')}
                  className="rounded-[2rem] bg-white border border-[#eceae2] shadow-sm p-6 flex flex-col justify-between h-[180px] hover:shadow-md transition-all cursor-pointer group relative overflow-hidden animate-fade-in"
                >
                  <div className="space-y-1.5">
                    <p className="text-[10px] text-gray-400 font-extrabold uppercase tracking-wider">Social Feed</p>
                    <h4 className="text-lg font-black text-[#1c2c24] group-hover:text-[#3c5647] transition-colors leading-tight">
                      IB 패들렛 보드<br />
                      <span className="text-xs text-gray-400 font-bold block mt-1">의견과 탐구 공유</span>
                    </h4>
                  </div>
                  <div className="text-xs font-black text-[#3c5647] flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                    글쓰기 <ChevronRight className="w-3 h-3" />
                  </div>
                  <div className="absolute -bottom-4 -right-4 w-20 h-20 bg-orange-50 rounded-full flex items-center justify-center text-3xl opacity-80 group-hover:scale-110 transition-transform">
                    📌
                  </div>
                </div>

              </div>
            </div>

            {/* Quick Informational Notice inside Layout */}
            <div className="p-6 rounded-[2rem] bg-[#eceae2]/40 border border-[#eceae2]/70 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-2xl">📢</span>
                <div>
                  <h4 className="text-xs font-black text-[#1c2c24]">[소중한 피드백 수렴 완료] 6월 최종 학급 랭킹 및 퀴즈 버그가 전면 해결되었습니다.</h4>
                  <p className="text-[10px] text-gray-400 font-bold mt-1">열심히 퀴즈를 풀고 피드백을 공유해주신 모든 탐험가 학생분들께 감사드립니다!</p>
                </div>
              </div>
            </div>

          </div>

          {/* Persistent Sidebar on Right */}
          {sidebarPinned && (
            <div className="hidden lg:block lg:col-span-1 bg-white border border-[#eceae2]/70 rounded-[2rem] p-6 shadow-sm h-fit sticky top-6">
              {renderSidebarDrawerContent(true)}
            </div>
          )}

          {/* Drawer for non-pinned / mobile view */}
          <AnimatePresence>
            {!sidebarPinned && sidebarOpen && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 0.4 }}
                  exit={{ opacity: 0 }}
                  onClick={() => setSidebarOpen(false)}
                  className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
                />
                <motion.div 
                  initial={{ x: '100%' }}
                  animate={{ x: 0 }}
                  exit={{ x: '100%' }}
                  transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                  className="fixed right-0 top-0 bottom-0 w-80 bg-white border-l border-gray-100 z-50 p-6 overflow-y-auto"
                >
                  <div className="flex items-center justify-between mb-6">
                    <h3 className="font-black text-sm text-[#1c2c24]">탐험 메이트 & 학급 랭킹</h3>
                    <button 
                      onClick={() => setSidebarOpen(false)}
                      className="text-gray-400 hover:text-gray-600 font-bold cursor-pointer border-none bg-transparent"
                    >
                      ✕
                    </button>
                  </div>
                  {renderSidebarDrawerContent(false)}
                </motion.div>
              </>
            )}
          </AnimatePresence>

        </div>

        {/* Beautiful Dialog All Menu Modal */}
        <AnimatePresence>
          {showAllMenuModal && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              onClick={() => setShowAllMenuModal(false)}
              className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4"
            >
              {/* Animated Inner Modal Card */}
              <motion.div
                initial={{ scale: 0.96, opacity: 0, y: 10 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.96, opacity: 0, y: 10 }}
                transition={{ type: "spring", damping: 25, stiffness: 350 }}
                onClick={(e) => e.stopPropagation()}
                className="relative bg-[#fbf9f6] w-full max-w-4xl rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border border-gray-100 flex flex-col max-h-[85vh] overflow-hidden"
              >
                {/* Floating subtle background gradient pattern */}
                <div className="absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-indigo-50/40 to-transparent pointer-events-none" />

                {/* Modal Header */}
                <div className="relative z-10 px-5 py-4 md:px-6 md:py-5 border-b border-gray-100 flex items-center justify-between shrink-0 bg-white/50 backdrop-blur-md">
                  <div className="space-y-0.5">
                    <div className="inline-flex items-center gap-1 bg-indigo-50 text-indigo-700 px-2 py-0.5 rounded-full text-[9px] font-black select-none">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>ALL EXPLORATION ROUTES</span>
                    </div>
                    <h2 className="text-lg md:text-xl font-black text-gray-900 tracking-tight">
                      IB 에디션 전체 탐험 메뉴판
                    </h2>
                  </div>
                  
                  {/* Close Button */}
                  <button
                    onClick={() => setShowAllMenuModal(false)}
                    className="bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 p-1.5 rounded-full transition-all cursor-pointer border-none flex items-center justify-center shrink-0"
                    title="닫기"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Scrollable Content Grid */}
                <div className="relative z-10 flex-1 overflow-y-auto p-4 md:p-6 scrollbar-thin space-y-4">
                  <p className="text-[11px] text-gray-400 font-bold leading-relaxed">
                    원하는 모험 카드를 클릭하여 즉시 탐험을 시작해보세요!
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 pb-4">
                    {exploreItems.map((item, idx) => {
                      const getBadgeColor = (badge: string) => {
                        switch (badge) {
                          case 'NEW': return 'bg-emerald-500';
                          case 'HOT': return 'bg-orange-500';
                          case 'BEST': return 'bg-purple-500';
                          case 'LIVE': return 'bg-rose-500';
                          case 'COOL': return 'bg-pink-500';
                          default: return 'bg-indigo-500';
                        }
                      };

                      return (
                        <div 
                          key={idx}
                          onClick={() => {
                            item.action();
                            setShowAllMenuModal(false);
                          }}
                          className="relative bg-white border border-gray-100 rounded-2xl p-4 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all cursor-pointer group overflow-hidden flex flex-col justify-between min-h-[115px]"
                        >
                          {/* Floating backdrop circle containing the icon */}
                          <div className="absolute -bottom-1 -right-1 w-11 h-11 rounded-full bg-indigo-50/40 flex items-center justify-center p-1.5 group-hover:scale-110 transition-transform">
                            <span className="text-xl select-none">{item.icon}</span>
                          </div>

                          <div className="relative z-10 pr-3 flex-1 flex flex-col">
                            {/* Badge & Category Row */}
                            <div className="flex items-center gap-1.5 mb-1">
                              {item.badge && (
                                <span className={cn(
                                  "inline-block text-white text-[8px] px-1.5 py-0.5 rounded-full font-black uppercase tracking-wider leading-none",
                                  getBadgeColor(item.badge)
                                )}>
                                  {item.badge}
                                </span>
                              )}
                              <p className="text-[8px] text-gray-400 font-extrabold uppercase tracking-widest leading-none">
                                {item.category}
                              </p>
                            </div>

                            {/* Title */}
                            <h4 className="text-xs font-black text-gray-800 leading-snug group-hover:text-indigo-600 transition-colors mt-0.5">
                              {item.name}
                            </h4>
                            {/* Description */}
                            <p className="text-[10px] text-gray-400 font-medium mt-1 leading-normal">
                              {item.desc}
                            </p>

                            {/* Action Link */}
                            <div className="text-[9px] font-black text-[#3c5647] mt-auto pt-3 flex items-center gap-0.5 group-hover:text-indigo-600 transition-colors">
                              <span>{item.actionText}</span>
                              <span className="text-gray-400 group-hover:text-indigo-500 font-semibold transition-transform group-hover:translate-x-0.5">›</span>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile edit modal */}
        <ProfileEditModal show={showEditModal} onClose={() => setShowEditModal(false)} profile={profile} onUpdate={onUpdateProfile} />
      </div>
    );
  };

  if (activeLayout === 'dashboard') {
    return (
      <div className="relative">
        {renderDashboardLayout()}
      </div>
    );
  }

  if (activeLayout === 'bento') {
    return (
      <div className="relative">
        {renderBentoLayout()}
      </div>
    );
  }

  if (activeLayout === 'sidebar') {
    return (
      <div className="relative">
        {renderSidebarLayout()}
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      {renderLayoutSwitcher()}

      <header className="relative overflow-hidden bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-48 h-48 object-contain" referrerPolicy="no-referrer" />
        </div>
        
        <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
          <div className="relative group cursor-pointer" onClick={() => setShowEditModal(true)}>
            <div className={cn("w-24 h-24 rounded-3xl flex items-center justify-center shadow-inner overflow-hidden transition-transform group-hover:scale-105 p-1.5", level.bg)}>
              {profile?.photoURL === 'caricature' && profile?.caricatureSvg ? (
                <div 
                  dangerouslySetInnerHTML={{ __html: profile.caricatureSvg }} 
                  className="w-20 h-20 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                />
              ) : (
                <img src={level.img} alt={level.name} className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
              )}
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
              onClick={() => window.dispatchEvent(new CustomEvent('open-announcement', { detail: { tab: 'user_feedback_patches' } }))}
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
                  <div className="w-24 h-24 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white flex items-center justify-center p-1.5">
                    {rank.photoURL === 'caricature' && rank.caricatureSvg ? (
                      <div 
                        dangerouslySetInnerHTML={{ __html: rank.caricatureSvg }} 
                        className="w-20 h-20 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                      />
                    ) : (
                      <img 
                        src={level.img} 
                        alt={rank.name}
                        className="w-20 h-20 object-contain"
                        referrerPolicy="no-referrer"
                      />
                    )}
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
    </div>
  </div>
  );
};
