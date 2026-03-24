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
  Gamepad2,
  Flame,
  Brain
} from 'lucide-react';
import { ibReflectionQuestions } from '../../content';

import { UserProfile } from '../../types';
import { getLevel } from '../../lib/utils';

interface HomeViewProps {
  profile: UserProfile | null;
  reflectionData: Record<string, string>;
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games' | 'memory') => void;
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  bgMusicPlaying: boolean;
  setBgMusicPlaying: (playing: boolean) => void;
  bgMusicVolume: number;
  setBgMusicVolume: (volume: number) => void;
  onLogout: () => void;
}

export const HomeView = ({ 
  profile, 
  reflectionData, 
  setView, 
  soundEnabled, 
  setSoundEnabled, 
  bgMusicPlaying,
  setBgMusicPlaying,
  bgMusicVolume,
  setBgMusicVolume,
  onLogout,
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
              <h2 className="text-2xl font-black text-gray-900">{profile?.name} {profile?.role === 'teacher' ? '선생님' : '탐험가님'}</h2>
              <span className={cn("px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest", level.bg, level.color)}>
                {level.name}
              </span>
            </div>
            <p className="text-gray-500 font-medium mb-4">
              {profile?.role === 'teacher' ? '교사' : `${profile?.grade} ${profile?.class}`} • 증평초등학교
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
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="flex items-center gap-4 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
            <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 p-2">
              <img src={ASSETS.quiz.logo} alt="Knowledge" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-black text-blue-900">지식 탐험</h4>
              <p className="text-sm text-blue-700 font-bold">항목당 +10 XP</p>
              <p className="text-xs text-blue-500 mt-1">IB 핵심 개념을 학습하고 체크하세요!</p>
            </div>
          </div>
          
          <div className="flex items-center gap-4 p-6 bg-amber-50/50 rounded-3xl border border-amber-100">
            <div className="w-14 h-14 bg-amber-100 rounded-2xl flex items-center justify-center flex-shrink-0 p-2">
              <img src={ASSETS.quiz.flashcard_icon} alt="Flashcards" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-black text-amber-900">플래시카드</h4>
              <p className="text-sm text-amber-700 font-bold">세트당 +50 XP</p>
              <p className="text-xs text-amber-500 mt-1">한 세트를 모두 학습하면 보너스 XP!</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-2xl flex items-center justify-center flex-shrink-0 p-2">
              <img src={ASSETS.quiz.memory_icon} alt="Memory" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-black text-indigo-900">기억력 강화</h4>
              <p className="text-sm text-indigo-700 font-bold">성공 시 +50 XP</p>
              <p className="text-xs text-indigo-500 mt-1">모든 짝을 맞추고 두뇌를 훈련하세요!</p>
            </div>
          </div>

          <div className="flex items-center gap-4 p-6 bg-purple-50/50 rounded-3xl border border-purple-100">
            <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center flex-shrink-0 p-2">
              <img src={ASSETS.quiz.quiz_icon} alt="Quiz" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
            </div>
            <div>
              <h4 className="font-black text-purple-900">퀴즈 챌린지</h4>
              <p className="text-sm text-purple-700 font-bold">정답당 +20 XP & 티켓 2장</p>
              <p className="text-xs text-purple-500 mt-1">1문제 맞힐 때마다 게임 2판 가능!</p>
            </div>
          </div>
        </div>
      </motion.div>

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
              완료 시 50 XP
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
              1문제당 티켓 2장!
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
      </div>
    </div>
  );
};
