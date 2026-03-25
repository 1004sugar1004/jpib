import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, RefreshCw, Trophy, Brain, Star } from 'lucide-react';
import confetti from 'canvas-confetti';
import { ibLearnerProfile, ibThemes, ibKeyConcepts, ibATL } from '../../content';
import { cn } from '../../lib/utils';

const DEFAULT_EMOJIS = ['🍎', '🍊', '🍇', '🍉', '🍓', '🍒', '🍍', '🥝', '🥑', '🥦', '🥕', '🌽'];

interface MemoryCard {
  id: number;
  pairId: number;
  content: string;
  description?: string;
  image?: string;
  type: 'visual' | 'text';
  isFlipped: boolean;
  isMatched: boolean;
}

interface MemoryGameViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games' | 'memory') => void;
  onEarnXP: (xp: number) => void;
  soundEnabled: boolean;
  initialCategory?: string;
}

export const MemoryGameView = ({ setView, onEarnXP, soundEnabled, initialCategory }: MemoryGameViewProps) => {
  const [category, setCategory] = useState<string>(initialCategory || 'learner');
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flippedIndices, setFlippedIndices] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [isWon, setIsWon] = useState(false);
  const [bestScore, setBestScore] = useState(() => Number(localStorage.getItem(`memory-best-score-${category}`) || Infinity));

  const categories = [
    { id: 'learner', name: '학습자상', data: ibLearnerProfile },
    { id: 'themes', name: '탐구 주제', data: ibThemes },
    { id: 'concepts', name: '핵심 개념', data: ibKeyConcepts },
    { id: 'atl', name: 'ATL 기술', data: ibATL },
    { id: 'emoji', name: '과일 & 채소', data: DEFAULT_EMOJIS.map(e => ({ title: e, description: '맛있는 과일/채소' })) },
  ];

  const initializeGame = useCallback(() => {
    const selectedCategoryData = categories.find(c => c.id === category);
    const selectedData = selectedCategoryData?.data || [];
    
    // Take 6 items for a 3x4 grid (12 cards) or 8 items for 4x4 (16 cards)
    // Let's stick to 8 items (16 cards) for a better challenge
    const gameData = [...selectedData].sort(() => Math.random() - 0.5).slice(0, 8);
    
    const newCards: MemoryCard[] = [];
    gameData.forEach((item, index) => {
      // Visual Card (Always Image if available)
      newCards.push({
        id: index * 2,
        pairId: index,
        content: item.title,
        image: (item as any).image,
        type: 'visual',
        isFlipped: false,
        isMatched: false,
      });
      // Text Card (Title + Description)
      newCards.push({
        id: index * 2 + 1,
        pairId: index,
        content: item.title,
        description: (item as any).description,
        type: 'text',
        isFlipped: false,
        isMatched: false,
      });
    });

    setCards(newCards.sort(() => Math.random() - 0.5));
    setFlippedIndices([]);
    setMoves(0);
    setIsWon(false);
  }, [category]);

  useEffect(() => {
    initializeGame();
    setBestScore(Number(localStorage.getItem(`memory-best-score-${category}`) || Infinity));
  }, [initializeGame, category]);

  const handleCardClick = (index: number) => {
    if (cards[index].isFlipped || cards[index].isMatched || flippedIndices.length === 2) return;

    const newCards = [...cards];
    newCards[index].isFlipped = true;
    setCards(newCards);

    const newFlipped = [...flippedIndices, index];
    setFlippedIndices(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(m => m + 1);
      const [first, second] = newFlipped;

      if (cards[first].pairId === cards[second].pairId) {
        // Match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isMatched = true;
            updated[second].isMatched = true;
            return updated;
          });
          setFlippedIndices([]);
          
          if (soundEnabled) {
            const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
            audio.volume = 0.2;
            audio.play().catch(() => {});
          }
        }, 500);
      } else {
        // No match
        setTimeout(() => {
          setCards(prev => {
            const updated = [...prev];
            updated[first].isFlipped = false;
            updated[second].isFlipped = false;
            return updated;
          });
          setFlippedIndices([]);
        }, 1000);
      }
    }
  };

  useEffect(() => {
    if (cards.length > 0 && cards.every(card => card.isMatched) && !isWon) {
      setIsWon(true);
      onEarnXP(50);
      if (moves < bestScore) {
        setBestScore(moves);
        localStorage.setItem(`memory-best-score-${category}`, moves.toString());
      }
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  }, [cards, moves, bestScore, onEarnXP, category, isWon]);

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Brain className="w-32 h-32" />
        </div>
        <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
        <h2 className="text-3xl font-black text-gray-900">기억력 강화 게임</h2>
        <p className="text-gray-500 font-bold">그림(또는 이름)과 그에 맞는 설명을 찾아 짝을 맞춰보세요!</p>
        
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={cn(
                "px-4 py-2 rounded-xl text-xs font-black transition-all border-2",
                category === cat.id 
                  ? "bg-indigo-600 border-transparent text-white shadow-lg shadow-indigo-100"
                  : "bg-white border-gray-100 text-gray-400 hover:border-gray-200"
              )}
            >
              {cat.name}
            </button>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-center gap-8">
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">현재 시도</span>
            <span className="text-2xl font-black text-indigo-600">{moves}회</span>
          </div>
          <div className="flex flex-col items-center">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">최고 기록</span>
            <span className="text-2xl font-black text-amber-600">{bestScore === Infinity ? '-' : `${bestScore}회`}</span>
          </div>
        </div>
      </header>

      <div className="grid grid-cols-4 gap-3 md:gap-4 max-w-2xl mx-auto">
        {cards.map((card, index) => (
          <motion.div
            key={card.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => handleCardClick(index)}
            className="aspect-square cursor-pointer perspective-1000"
          >
            <motion.div
              initial={false}
              animate={{ rotateY: card.isFlipped || card.isMatched ? 180 : 0 }}
              transition={{ duration: 0.6, type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front (Hidden) */}
              <div className="absolute inset-0 bg-indigo-500 rounded-xl md:rounded-2xl border-4 border-indigo-400 flex items-center justify-center backface-hidden shadow-lg">
                <Brain className="w-6 h-6 md:w-8 md:h-8 text-white/50" />
              </div>
              
              {/* Back (Content) */}
              <div className="absolute inset-0 bg-white rounded-xl md:rounded-2xl border-4 border-indigo-100 flex flex-col items-center justify-center backface-hidden rotate-y-180 shadow-lg p-2 overflow-hidden">
                {card.type === 'visual' ? (
                  card.image ? (
                    <img src={card.image} alt={card.content} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                  ) : (
                    <span className="text-2xl md:text-3xl font-black text-indigo-900 text-center leading-tight">{card.content}</span>
                  )
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center p-1 gap-1">
                    <span className="text-[10px] md:text-xs font-black text-indigo-600 uppercase tracking-tighter text-center">{card.content}</span>
                    {card.description && (
                      <span className={cn(
                        "font-bold text-indigo-900 text-center leading-tight",
                        card.description.length > 40 ? "text-[7px] md:text-[8px]" : 
                        card.description.length > 20 ? "text-[8px] md:text-[10px]" : "text-[10px] md:text-xs"
                      )}>
                        {card.description}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>

      <div className="flex justify-center pt-4">
        <Button 
          onClick={initializeGame} 
          icon={RefreshCw}
          className="bg-white text-gray-600 hover:bg-gray-50 border-2 border-gray-100 px-8 py-4 rounded-2xl font-black"
        >
          게임 초기화
        </Button>
      </div>

      <AnimatePresence>
        {isWon && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <Card className="max-w-sm w-full p-8 text-center space-y-6 bg-white rounded-[3rem] border-8 border-indigo-100 shadow-2xl">
              <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center mx-auto">
                <Trophy className="w-12 h-12 text-indigo-600 animate-bounce" />
              </div>
              <div>
                <h3 className="text-3xl font-black text-gray-900">축하합니다!</h3>
                <p className="text-gray-500 font-bold mt-2">모든 짝을 찾았습니다!</p>
              </div>
              <div className="bg-indigo-50 p-4 rounded-2xl space-y-1">
                <p className="text-sm font-bold text-indigo-400 uppercase tracking-widest">기록</p>
                <p className="text-4xl font-black text-indigo-600">{moves}회 시도</p>
                <p className="text-xs font-black text-indigo-400">+50 XP 획득!</p>
              </div>
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={initializeGame}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg"
                >
                  한 번 더 하기
                </Button>
                <Button 
                  variant="ghost" 
                  onClick={() => setView('home')}
                  className="w-full text-gray-400 font-bold"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
