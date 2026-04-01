import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft, 
  Gamepad2, 
  Trophy, 
  Grid3X3, 
  Rocket, 
  Apple, 
  ShoppingCart, 
  Lock 
} from 'lucide-react';
import { AnipangGame } from '../games/AnipangGame';
import { GalagaGame } from '../games/GalagaGame';
import { FruitMergeGame } from '../games/FruitMergeGame';
import { StoreSortingGame } from '../games/StoreSortingGame';
import { MarioGame } from '../games/MarioGame';
import { RhythmTrainingGame } from '../games/RhythmTrainingGame';

import { UserProfile } from '../../types';

interface GameCornerViewProps {
  profile: UserProfile | null;
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
  onUseTicket: () => void;
  soundEnabled: boolean;
}

export const GameCornerView = ({ profile, setView, onUseTicket, soundEnabled }: GameCornerViewProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const isTeacher = profile?.role === 'teacher';
  const [showCardWarning, setShowCardWarning] = useState(
    !isTeacher && (profile?.completedStudyItems?.length || 0) === 0 && (profile?.gameTickets || 0) === 0
  );
  const score = profile?.score || 0;
  const tickets = profile?.gameTickets || 0;

  const games = [
    { id: 'anipang', name: 'IB 애니팡', icon: Grid3X3, color: 'bg-pink-500', unlockXp: 0, description: '3개를 맞춰보세요!', bgImage: 'https://i.imgur.com/UMcVNRB.png' },
    { id: 'galaga', name: 'IB 갤러그', icon: Rocket, color: 'bg-blue-600', unlockXp: 0, description: '우주선을 조종하세요!', bgImage: 'https://i.imgur.com/jHXUiJ7.png' },
    { id: 'fruit', name: 'IB 지식 머지', icon: Apple, color: 'bg-orange-500', unlockXp: 0, description: '과일을 합치며 IB 핵심 지식을 쌓아요!', bgImage: 'https://i.imgur.com/DrD9Hmx.png' },
    { id: 'store', name: 'IB 편의점 정리', icon: ShoppingCart, color: 'bg-emerald-500', unlockXp: 0, description: '선반을 정리하세요!', bgImage: 'https://i.imgur.com/QKpwzWZ.png' },
    { id: 'mario', name: 'IB 마리오', icon: Gamepad2, color: 'bg-red-600', unlockXp: 0, description: '장애물을 뛰어넘으세요!', bgImage: 'https://i.imgur.com/xBUw4hj.png' },
    { id: 'rhythm', name: 'IB 리듬 트레이닝', icon: Trophy, color: 'bg-yellow-500', unlockXp: 0, description: '박자에 맞춰 화살표를 눌러보세요!', bgImage: 'https://i.imgur.com/rLktNhW.png' },
  ];

  if (selectedGame) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col bg-gray-900/10 p-2 md:p-4">
        <header className="flex items-center justify-between mb-4 px-4 py-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-white/20">
          <Button variant="ghost" onClick={() => setSelectedGame(null)} icon={ArrowLeft} className="text-gray-600">게임 목록</Button>
          <h2 className="text-lg md:text-2xl font-black text-gray-900">{games.find(g => g.id === selectedGame)?.name}</h2>
          <div className="w-20 hidden md:block" />
        </header>
        
        <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
          <div className="w-full max-w-4xl aspect-[3/4] md:aspect-video bg-gray-900 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden relative border-4 md:border-8 border-gray-800 shadow-2xl">
            {selectedGame === 'anipang' && <AnipangGame soundEnabled={soundEnabled} />}
            {selectedGame === 'galaga' && <GalagaGame soundEnabled={soundEnabled} />}
            {selectedGame === 'fruit' && <FruitMergeGame soundEnabled={soundEnabled} />}
            {selectedGame === 'store' && <StoreSortingGame soundEnabled={soundEnabled} />}
            {selectedGame === 'mario' && <MarioGame soundEnabled={soundEnabled} />}
            {selectedGame === 'rhythm' && <RhythmTrainingGame soundEnabled={soundEnabled} />}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 py-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gamepad2 className="w-32 h-32" />
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setView('home')} 
          icon={ArrowLeft} 
          className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
        >
          뒤로 가기
        </Button>
        <h2 className="text-3xl font-black text-gray-900">IB 게임 코너</h2>
        <p className="text-gray-500 font-bold">
          {isTeacher ? '선생님은 모든 게임을 자유롭게 체험하실 수 있습니다.' : '퀴즈를 풀고 얻은 티켓으로 게임을 즐겨보세요!'}
        </p>
        
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-indigo-900">
            {isTeacher ? '무제한 체험 모드' : `보유 티켓: ${tickets}개`}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const isLocked = false; // All games unlocked as requested
          return (
            <motion.div
              key={game.id}
              whileHover={!isLocked && (tickets > 0 || isTeacher) ? { scale: 1.02 } : {}}
              whileTap={!isLocked && (tickets > 0 || isTeacher) ? { scale: 0.98 } : {}}
              onClick={() => {
                if (isLocked) return;
                if (tickets <= 0 && !isTeacher) {
                  alert('게임 티켓이 부족합니다! 퀴즈를 풀어 티켓을 획득하세요.');
                  return;
                }
                if (!isTeacher) onUseTicket();
                setSelectedGame(game.id);
              }}
              className={cn(
                "cursor-pointer group relative",
                isLocked && "cursor-not-allowed opacity-75"
              )}
            >
              <Card 
                className={cn(
                  "p-8 h-full flex flex-col items-center text-center transition-all border-4 relative overflow-hidden",
                  isLocked ? "bg-gray-50 border-gray-200" : "hover:border-indigo-400 border-transparent"
                )}
                style={!isLocked ? { 
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url("${game.bgImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg relative",
                  isLocked ? "bg-gray-400" : game.color
                )}>
                  {isLocked ? <Lock className="w-10 h-10" /> : <game.icon className="w-10 h-10" />}
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">{game.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{game.description}</p>
                
                <div className="mt-auto flex items-center gap-1 text-indigo-600 font-bold text-sm">
                  게임 시작하기 <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Card Warning Popup */}
      {showCardWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl border-4 border-indigo-400"
          >
            <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">잠깐! 탐험가님!</h2>
            <p className="text-xl font-bold text-gray-600 mb-8 leading-relaxed">
              카드가 없는 친구들은 <span className="text-indigo-600">퀴즈 챌린지</span>에 도전하고 카드를 얻으세요!
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setView('quiz')} 
                className="w-full py-5 text-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                퀴즈 챌린지 도전하기
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowCardWarning(false)} 
                className="w-full py-4 text-gray-400 hover:text-gray-600"
              >
                그냥 둘러볼래요
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  </div>
  );
};
