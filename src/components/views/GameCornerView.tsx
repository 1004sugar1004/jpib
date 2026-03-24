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

import { UserProfile } from '../../types';

interface GameCornerViewProps {
  profile: UserProfile | null;
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games') => void;
  onUseTicket: () => void;
  soundEnabled: boolean;
}

export const GameCornerView = ({ profile, setView, onUseTicket, soundEnabled }: GameCornerViewProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const score = profile?.score || 0;
  const tickets = profile?.gameTickets || 0;

  const games = [
    { id: 'anipang', name: 'IB 애니팡', icon: Grid3X3, color: 'bg-pink-500', unlockXp: 0, description: '3개를 맞춰보세요!' },
    { id: 'galaga', name: 'IB 갤러그', icon: Rocket, color: 'bg-blue-600', unlockXp: 300, description: '우주선을 조종하세요!' },
    { id: 'fruit', name: 'IB 지식 머지', icon: Apple, color: 'bg-orange-500', unlockXp: 600, description: '과일을 합치며 IB 핵심 지식을 쌓아요!' },
    { id: 'store', name: 'IB 편의점 정리', icon: ShoppingCart, color: 'bg-emerald-500', unlockXp: 1000, description: '선반을 정리하세요!' },
    { id: 'mario', name: 'IB 마리오', icon: Gamepad2, color: 'bg-red-600', unlockXp: 1500, description: '장애물을 뛰어넘으세요!' },
  ];

  if (selectedGame) {
    return (
      <div className="w-full h-full min-h-screen flex flex-col bg-gray-50 p-2 md:p-6">
        <header className="flex items-center justify-between mb-4 px-4">
          <Button variant="ghost" onClick={() => setSelectedGame(null)} icon={ArrowLeft} className="bg-white/50 backdrop-blur-sm">게임 목록</Button>
          <h2 className="text-xl md:text-3xl font-black text-gray-900 drop-shadow-sm">{games.find(g => g.id === selectedGame)?.name}</h2>
          <div className="w-20 hidden md:block" />
        </header>
        
        <div className="flex-1 w-full bg-gray-900 rounded-[2rem] md:rounded-[3.5rem] overflow-hidden relative border-4 md:border-8 border-gray-800 shadow-2xl">
          {selectedGame === 'anipang' && <AnipangGame soundEnabled={soundEnabled} />}
          {selectedGame === 'galaga' && <GalagaGame soundEnabled={soundEnabled} />}
          {selectedGame === 'fruit' && <FruitMergeGame soundEnabled={soundEnabled} />}
          {selectedGame === 'store' && <StoreSortingGame soundEnabled={soundEnabled} />}
          {selectedGame === 'mario' && <MarioGame soundEnabled={soundEnabled} />}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gamepad2 className="w-32 h-32" />
        </div>
        <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
        <h2 className="text-3xl font-black text-gray-900">IB 게임 코너</h2>
        <p className="text-gray-500 font-bold">퀴즈를 풀고 얻은 티켓으로 게임을 즐겨보세요!</p>
        
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-indigo-900">보유 티켓: {tickets}개</span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const isTester = profile?.name === '김혜진' && profile?.role === 'teacher';
          const isLocked = isTester ? false : score < game.unlockXp;
          return (
            <motion.div
              key={game.id}
              whileHover={!isLocked && (tickets > 0 || isTester) ? { scale: 1.02 } : {}}
              whileTap={!isLocked && (tickets > 0 || isTester) ? { scale: 0.98 } : {}}
              onClick={() => {
                if (isLocked) return;
                if (tickets <= 0 && !isTester) {
                  alert('게임 티켓이 부족합니다! 퀴즈를 풀어 티켓을 획득하세요.');
                  return;
                }
                if (!isTester) onUseTicket();
                setSelectedGame(game.id);
              }}
              className={cn(
                "cursor-pointer group relative",
                isLocked && "cursor-not-allowed opacity-75"
              )}
            >
              <Card className={cn(
                "p-8 h-full flex flex-col items-center text-center transition-all border-4",
                isLocked ? "bg-gray-50 border-gray-200" : "hover:border-indigo-400 border-transparent"
              )}>
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg relative",
                  isLocked ? "bg-gray-400" : game.color
                )}>
                  {isLocked ? <Lock className="w-10 h-10" /> : <game.icon className="w-10 h-10" />}
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">{game.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{game.description}</p>
                
                {isLocked ? (
                  <div className="mt-auto w-full">
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden mb-2">
                      <div className="h-full bg-gray-400" style={{ width: `${(score / game.unlockXp) * 100}%` }} />
                    </div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">잠금 해제까지 {game.unlockXp - score} XP 필요</p>
                  </div>
                ) : (
                  <div className="mt-auto flex items-center gap-1 text-indigo-600 font-bold text-sm">
                    게임 시작하기 <ArrowLeft className="w-4 h-4 rotate-180" />
                  </div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};
