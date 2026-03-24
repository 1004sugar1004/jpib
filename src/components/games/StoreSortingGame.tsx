import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';

const ITEMS = ['🥤', '🍱', '🍙', '🥪', '🍦', '🍪', '🥛', '🍎'];
const SHELF_COUNT = 6;
const SLOT_PER_SHELF = 3;
const CLICKS_PER_ROUND = 15;

const randomItem = () => ITEMS[Math.floor(Math.random() * ITEMS.length)];

const makeInitialShelves = (): string[][] => {
  // Create a pool of items that can be sorted into sets of 3
  const totalSets = Math.floor((SHELF_COUNT * SLOT_PER_SHELF) / 3) - 1; // Leave some empty space
  let pool: string[] = [];
  for (let i = 0; i < totalSets; i++) {
    const item = randomItem();
    pool.push(item, item, item);
  }
  
  // Fill the rest with random items or leave empty
  while (pool.length < SHELF_COUNT * SLOT_PER_SHELF - 3) {
    pool.push(randomItem());
  }

  // Shuffle pool
  pool.sort(() => Math.random() - 0.5);

  const newShelves: string[][] = Array.from({ length: SHELF_COUNT }, () => []);
  pool.forEach((item, i) => {
    newShelves[i % SHELF_COUNT].push(item);
  });

  return newShelves;
};

export const StoreSortingGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [shelves, setShelves] = useState<string[][]>(makeInitialShelves);
  const [selectedShelf, setSelectedShelf] = useState<number | null>(null);
  const [score, setScore] = useState(0);
  const [clicksLeft, setClicksLeft] = useState(CLICKS_PER_ROUND);
  const [showQuiz, setShowQuiz] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [closedShelves, setClosedShelves] = useState<number[]>([]);

  const restart = useCallback(() => {
    setShelves(makeInitialShelves());
    setSelectedShelf(null);
    setScore(0);
    setClicksLeft(CLICKS_PER_ROUND);
    setShowQuiz(false);
    setGameOver(false);
    setClosedShelves([]);
  }, []);

  const handleShelfClick = (shelfIdx: number) => {
    if (showQuiz || gameOver || closedShelves.includes(shelfIdx)) return;

    if (selectedShelf === null) {
      // Select top item from shelf
      if (shelves[shelfIdx].length > 0) {
        setSelectedShelf(shelfIdx);
      }
    } else {
      // Move item from selectedShelf to shelfIdx
      if (selectedShelf === shelfIdx) {
        setSelectedShelf(null);
        return;
      }

      const sourceShelf = [...shelves[selectedShelf]];
      const targetShelf = [...shelves[shelfIdx]];

      if (targetShelf.length < SLOT_PER_SHELF) {
        const item = sourceShelf.pop()!;
        targetShelf.push(item);

        const newShelves = [...shelves];
        newShelves[selectedShelf] = sourceShelf;
        newShelves[shelfIdx] = targetShelf;

        // Check if target shelf is now closed (3 identical items)
        if (targetShelf.length === SLOT_PER_SHELF && targetShelf.every(v => v === targetShelf[0])) {
          setScore(s => s + 500);
          setClosedShelves(prev => [...prev, shelfIdx]);
          if (soundEnabled) {
            const audio = new Audio(ASSETS.sounds.correct);
            audio.volume = 0.2;
            audio.play().catch(() => {});
          }
        }

        setShelves(newShelves);
        setSelectedShelf(null);
        
        // Click count
        setClicksLeft(prev => {
          const next = prev - 1;
          if (next === 0) setShowQuiz(true);
          return next;
        });

        // Check if all items are sorted or no moves left? 
        // For simplicity, let's just spawn new items if many shelves are closed
        if (closedShelves.length + 1 >= SHELF_COUNT - 1) {
           // Win condition or refresh?
           // Let's just refresh the open shelves with some new items
           setTimeout(() => {
             const resetShelves = makeInitialShelves();
             setShelves(resetShelves);
             setClosedShelves([]);
           }, 1000);
        }
      } else {
        // Target full, just change selection
        if (shelves[shelfIdx].length > 0) {
          setSelectedShelf(shelfIdx);
        } else {
          setSelectedShelf(null);
        }
      }
    }
  };

  return (
    <div className="w-full h-full bg-emerald-50 flex flex-col p-2 md:p-4 relative overflow-hidden">

      {/* 퀴즈 오버레이 */}
      {showQuiz && (
        <MiniQuiz
          soundEnabled={soundEnabled}
          onCorrect={() => {
            setShowQuiz(false);
            setClicksLeft(CLICKS_PER_ROUND);
          }}
        />
      )}

      {/* 상단 HUD */}
      <div className="flex justify-between items-center mb-2 md:mb-4">
        <div className="text-emerald-600 font-black text-xl md:text-2xl">점수: {score}</div>
        <div className="bg-white px-3 py-1 rounded-full border-2 border-emerald-200 text-emerald-500 font-black text-sm md:text-base">
          남은 클릭: {clicksLeft}
        </div>
      </div>

      {/* 선반 그리드 */}
      <div className="flex-1 grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-6 p-2 md:p-4 overflow-y-auto">
        {shelves.map((shelfItems, idx) => {
          const isClosed = closedShelves.includes(idx);
          const isSelected = selectedShelf === idx;

          return (
            <motion.div
              key={idx}
              whileHover={!isClosed ? { scale: 1.02 } : {}}
              whileTap={!isClosed ? { scale: 0.98 } : {}}
              onClick={() => handleShelfClick(idx)}
              className={cn(
                "relative h-32 md:h-40 rounded-2xl border-4 transition-all flex flex-col-reverse p-2 gap-1",
                isClosed ? "bg-emerald-100 border-emerald-400 opacity-60" : 
                isSelected ? "bg-white border-indigo-400 shadow-lg ring-4 ring-indigo-100" :
                "bg-white border-emerald-100 shadow-sm hover:border-emerald-300"
              )}
            >
              {/* Shelf Slots */}
              {Array.from({ length: SLOT_PER_SHELF }).map((_, slotIdx) => (
                <div 
                  key={slotIdx}
                  className="flex-1 bg-gray-50 rounded-lg border border-gray-100 flex items-center justify-center text-2xl md:text-3xl relative"
                >
                  {shelfItems[slotIdx] || ''}
                  {isSelected && slotIdx === shelfItems.length - 1 && (
                    <motion.div 
                      layoutId="selection-indicator"
                      className="absolute inset-0 border-2 border-indigo-500 rounded-lg animate-pulse"
                    />
                  )}
                </div>
              ))}

              {isClosed && (
                <div className="absolute inset-0 flex items-center justify-center bg-emerald-500/20 rounded-xl">
                  <motion.span 
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="text-white font-black text-2xl drop-shadow-md"
                  >
                    CLOSED
                  </motion.span>
                </div>
              )}
            </motion.div>
          );
        })}
      </div>

      <div className="text-center mt-2 md:mt-4 text-emerald-400 font-bold text-[10px] md:text-xs">
        선반을 터치해 물건을 옮기세요! • 같은 물건 3개가 모이면 선반이 닫힙니다 • {CLICKS_PER_ROUND}번 이동하면 퀴즈 타임
      </div>

      <div className="mt-4 flex justify-center">
        <Button onClick={restart} variant="outline" className="text-emerald-600 border-emerald-200">
          게임 초기화
        </Button>
      </div>
    </div>
  );
};
