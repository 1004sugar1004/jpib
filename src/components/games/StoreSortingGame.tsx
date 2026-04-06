import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';
import { Button } from '../ui/Button';
import { CheckCircle2, Trophy, RefreshCw } from 'lucide-react';

const ITEM_GROUPS = [
  ['🥤', '🧃', '🧉', '🍼', '🥛', '☕', '🍵', '🍶'], // Stage 1: Beverages
  ['🍱', '🍙', '🍛', '🍜', '🍲', '🍳', '🥘', '🥙'], // Stage 2: Lunch boxes
  ['🥨', '🥐', '🥯', '🥖', '🍞', '🥪', '🍔', '🍟'], // Stage 3: Snacks
  ['🍫', '🍬', '🍭', '🍮', '🍩', '🍪', '🍰', '🧁'], // Stage 4: Candy
  ['🍦', '🍧', '🍨', '🧊', '🥤', '🧋', '🥛', '🍓'], // Stage 5: Ice cream
];

const ROWS = 4;
const COLS = 4;
const SHELF_COUNT = ROWS * COLS;
const SLOT_PER_SHELF = 3;
const STAGE_TIME = 60;

interface Selection {
  shelfIdx: number;
  itemIdx: number;
}

const makeInitialShelves = (stage: number): string[][] => {
  const totalSlots = SHELF_COUNT * SLOT_PER_SHELF;
  const itemTypesNeeded = totalSlots / 3;
  
  // Use a specific group based on stage
  const groupIdx = (stage - 1) % ITEM_GROUPS.length;
  const availableItems = ITEM_GROUPS[groupIdx];
  
  let pool: string[] = [];
  for (let i = 0; i < itemTypesNeeded; i++) {
    const item = availableItems[i % availableItems.length];
    pool.push(item, item, item);
  }
  
  // Shuffle pool
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const newShelves: string[][] = [];
  for (let i = 0; i < SHELF_COUNT; i++) {
    newShelves.push(pool.slice(i * SLOT_PER_SHELF, (i + 1) * SLOT_PER_SHELF));
  }

  return newShelves;
};

export const StoreSortingGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [stage, setStage] = useState(1);
  const [shelves, setShelves] = useState<string[][]>(() => makeInitialShelves(1));
  const [closedShelves, setClosedShelves] = useState<number[]>([]);
  const [selection, setSelection] = useState<Selection | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(STAGE_TIME);
  const [showQuiz, setShowQuiz] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  const [gameState, setGameState] = useState<'START' | 'PLAYING'>('START');
  const [isPaused, setIsPaused] = useState(false);
  const [lastActionTime, setLastActionTime] = useState(Date.now());
  const [hintShelfIdx, setHintShelfIdx] = useState<number | null>(null);
  const [justClosedShelf, setJustClosedShelf] = useState<number | null>(null);
  const bgmRef = useRef<HTMLAudioElement | null>(null);

  const playSound = useCallback((type: 'correct' | 'click' | 'fail') => {
    if (!soundEnabled) return;
    let sound = ASSETS.sounds.joyful;
    if (type === 'correct') sound = ASSETS.sounds.correct;
    if (type === 'fail') sound = ASSETS.sounds.wrong;
    
    const audio = new Audio(sound);
    audio.volume = 0.2;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  // BGM Control
  useEffect(() => {
    if (soundEnabled && gameState === 'PLAYING' && !showQuiz && !gameWon && !gameOver) {
      if (!bgmRef.current) {
        bgmRef.current = new Audio(ASSETS.sounds.store_bgm);
        bgmRef.current.loop = true;
        bgmRef.current.volume = 0.15;
      }
      bgmRef.current.play().catch(() => {});
    } else {
      if (bgmRef.current) {
        bgmRef.current.pause();
      }
    }
    return () => {
      if (bgmRef.current) {
        bgmRef.current.pause();
        bgmRef.current = null;
      }
    };
  }, [soundEnabled, gameState, showQuiz, gameWon, gameOver]);

  // Timer logic
  useEffect(() => {
    if (gameState !== 'PLAYING' || showQuiz || gameWon || gameOver || isPaused) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        const next = prev - 1;
        
        // Every 20 seconds, show quiz (Changed from 10s to 20s)
        if (next > 0 && (STAGE_TIME - next) % 20 === 0) {
          setShowQuiz(true);
        }
        
        if (next <= 0) {
          clearInterval(timer);
          setGameOver(true);
          playSound('fail');
          return 0;
        }
        return next;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [gameState, showQuiz, gameWon, gameOver, isPaused, playSound]);

  // Hint logic
  useEffect(() => {
    if (gameState !== 'PLAYING' || showQuiz || gameWon || gameOver || isPaused) return;

    const hintTimer = setInterval(() => {
      if (Date.now() - lastActionTime > 7000) { // 7 seconds of inactivity
        // Find a shelf that can be completed or has items that can be moved
        // For simplicity, just pick a random non-closed shelf
        const openShelves = Array.from({ length: SHELF_COUNT }, (_, i) => i).filter(i => !closedShelves.includes(i));
        if (openShelves.length > 0) {
          setHintShelfIdx(openShelves[Math.floor(Math.random() * openShelves.length)]);
        }
      } else {
        setHintShelfIdx(null);
      }
    }, 1000);

    return () => clearInterval(hintTimer);
  }, [gameState, showQuiz, gameWon, gameOver, isPaused, lastActionTime, closedShelves]);

  const checkShelf = (shelf: string[]) => {
    return shelf.length === SLOT_PER_SHELF && shelf.every(v => v === shelf[0]);
  };

  const handleItemClick = (shelfIdx: number, itemIdx: number) => {
    if (showQuiz || gameWon || gameOver || closedShelves.includes(shelfIdx) || gameState !== 'PLAYING') return;

    setLastActionTime(Date.now());
    setHintShelfIdx(null);
    playSound('click');

    if (!selection) {
      setSelection({ shelfIdx, itemIdx });
    } else {
      if (selection.shelfIdx === shelfIdx && selection.itemIdx === itemIdx) {
        setSelection(null);
        return;
      }

      const newShelves = [...shelves.map(s => [...s])];
      const temp = newShelves[selection.shelfIdx][selection.itemIdx];
      newShelves[selection.shelfIdx][selection.itemIdx] = newShelves[shelfIdx][itemIdx];
      newShelves[shelfIdx][itemIdx] = temp;

      const newlyClosed: number[] = [];
      if (checkShelf(newShelves[selection.shelfIdx]) && !closedShelves.includes(selection.shelfIdx)) {
        newlyClosed.push(selection.shelfIdx);
      }
      if (checkShelf(newShelves[shelfIdx]) && !closedShelves.includes(shelfIdx)) {
        newlyClosed.push(shelfIdx);
      }

      if (newlyClosed.length > 0) {
        setScore(s => s + (newlyClosed.length * 500 * stage));
        setClosedShelves(prev => [...prev, ...newlyClosed]);
        setJustClosedShelf(newlyClosed[newlyClosed.length - 1]);
        setTimeout(() => setJustClosedShelf(null), 1000);
        playSound('correct');
      }

      setShelves(newShelves);
      setSelection(null);
    }
  };

  useEffect(() => {
    if (closedShelves.length === SHELF_COUNT && SHELF_COUNT > 0) {
      setGameWon(true);
      playSound('correct');
    }
  }, [closedShelves, playSound]);

  const nextStage = () => {
    const nextS = stage + 1;
    setStage(nextS);
    setShelves(makeInitialShelves(nextS));
    setClosedShelves([]);
    setSelection(null);
    setTimeLeft(STAGE_TIME);
    setGameWon(false);
    setShowQuiz(false);
  };

  const restart = () => {
    setStage(1);
    setShelves(makeInitialShelves(1));
    setClosedShelves([]);
    setSelection(null);
    setScore(0);
    setQuizWrongCount(0);
    setTimeLeft(STAGE_TIME);
    setShowQuiz(false);
    setGameWon(false);
    setGameOver(false);
    setGameState('PLAYING');
  };

  if (gameState === 'START') {
    return (
      <div className="w-full h-full bg-[#fdf6e3] flex flex-col items-center justify-center p-8 text-center">
        <motion.div 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="max-w-md bg-white p-8 rounded-[2.5rem] shadow-2xl border-8 border-[#8b4513]"
        >
          <div className="text-6xl mb-6">🏪</div>
          <h1 className="text-4xl font-black text-[#5d4037] mb-4">편의점 정리왕</h1>
          <p className="text-[#8d6e63] mb-8 font-medium leading-relaxed">
            제한 시간 내에 모든 선반을 정리하세요!<br/>
            10초마다 퀴즈가 나타납니다.<br/>
            스테이지를 클리어하면 새로운 물건이 등장합니다!
          </p>
          <Button 
            onClick={() => setGameState('PLAYING')}
            className="w-full py-6 text-xl bg-[#8b4513] hover:bg-[#5d4037] text-white rounded-2xl shadow-lg"
          >
            정리 시작하기
          </Button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#fdf6e3] flex flex-col p-2 md:p-4 relative overflow-hidden font-sans">
      {/* Blurry Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-25 pointer-events-none bg-cover bg-center bg-no-repeat blur-md"
        style={{ backgroundImage: 'url("https://i.imgur.com/QKpwzWZ.png")' }}
      />
      <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#8b4513 1px, transparent 1px)', backgroundSize: '20px 20px' }} />

      {/* Quiz Overlay */}
      {showQuiz && (
        <MiniQuiz
          soundEnabled={soundEnabled}
          wrongCount={quizWrongCount}
          onCorrect={() => {
            setShowQuiz(false);
          }}
          onWrong={() => {
            setQuizWrongCount(prev => prev + 1);
          }}
          onFail={() => {
            setShowQuiz(false);
            restart(); // Reset game
          }}
        />
      )}

      {/* Stage Clear Overlay */}
      <AnimatePresence>
        {gameWon && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-yellow-400 text-center max-w-sm w-full"
            >
              <Trophy className="w-20 h-20 text-yellow-400 mx-auto mb-4" />
              <h2 className="text-3xl font-black text-gray-900 mb-2">STAGE {stage} CLEAR!</h2>
              <p className="text-gray-500 mb-6 font-bold text-lg">현재 점수: {score}</p>
              <Button onClick={nextStage} className="w-full py-4 bg-yellow-400 hover:bg-yellow-500 text-white font-black rounded-2xl">
                다음 스테이지로
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Game Over Overlay */}
      <AnimatePresence>
        {gameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
          >
            <motion.div 
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white p-8 rounded-[3rem] shadow-2xl border-8 border-red-500 text-center max-w-sm w-full"
            >
              <div className="text-6xl mb-4">⏰</div>
              <h2 className="text-3xl font-black text-gray-900 mb-2">TIME OVER</h2>
              <p className="text-gray-500 mb-6 font-bold text-lg">최종 점수: {score}</p>
              <Button onClick={restart} className="w-full py-4 bg-red-500 hover:bg-red-600 text-white font-black rounded-2xl">
                다시 도전하기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header HUD */}
      <div className="flex justify-between items-center mb-4 z-10">
        <div className="flex gap-4">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest opacity-60">Stage</span>
            <div className="text-3xl font-black text-[#5d4037] tabular-nums">{stage}</div>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-[#8b4513] uppercase tracking-widest opacity-60">Score</span>
            <div className="text-3xl font-black text-[#5d4037] tabular-nums">{score.toLocaleString()}</div>
          </div>
        </div>
        
        <div className="flex gap-2">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-[#8b4513]/20 flex flex-col items-center min-w-[100px]">
            <span className="text-[8px] font-black text-[#8b4513] uppercase">Time Left</span>
            <span className={cn(
              "text-xl font-black tabular-nums",
              timeLeft <= 10 ? "text-red-500 animate-pulse" : "text-[#5d4037]"
            )}>{timeLeft}s</span>
          </div>
          <Button onClick={restart} variant="outline" size="sm" className="rounded-2xl border-2 border-[#8b4513]/20 bg-white/80 p-2">
            <RefreshCw className="w-5 h-5 text-[#8b4513]" />
          </Button>
        </div>
      </div>

      {/* Shelf Grid */}
      <div className="flex-1 bg-[#8b4513]/10 rounded-[1.5rem] p-2 md:p-3 border-4 border-[#8b4513]/20 overflow-hidden">
        <div className="grid grid-cols-4 gap-1.5 md:gap-2 h-full">
          <style>{`
            @keyframes shelf-hint-blink {
              0%, 100% { border-color: #d2b48c; box-shadow: none; }
              50% { border-color: #fbbf24; box-shadow: 0 0 15px #fbbf24; }
            }
            .shelf-hint {
              animation: shelf-hint-blink 1s infinite ease-in-out;
            }
          `}</style>
          {shelves.map((shelfItems, sIdx) => {
            const isClosed = closedShelves.includes(sIdx);
            const isHint = hintShelfIdx === sIdx;
            const isJustClosed = justClosedShelf === sIdx;
            
            return (
              <div
                key={sIdx}
                className={cn(
                  "relative rounded-lg border-b-4 border-x-2 border-t transition-all flex flex-row items-center justify-around p-0.5 shadow-inner",
                  isClosed 
                    ? "bg-gray-200 border-gray-300 opacity-40 grayscale" 
                    : "bg-[#f5deb3] border-[#d2b48c] shadow-[inset_0_2px_0_rgba(255,255,255,0.5)]",
                  isHint && "shelf-hint"
                )}
              >
                {/* Fancy Closing Effect */}
                <AnimatePresence>
                  {isJustClosed && (
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: [1, 1.5, 1], opacity: [0, 1, 0] }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 z-40 flex items-center justify-center pointer-events-none"
                    >
                      <div className="w-full h-full bg-yellow-400/30 rounded-lg border-4 border-yellow-400 blur-sm" />
                      <span className="absolute text-2xl font-black text-yellow-600 drop-shadow-lg">완료!</span>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Shelf Items */}
                {shelfItems.map((item, iIdx) => {
                  const isSelected = selection?.shelfIdx === sIdx && selection?.itemIdx === iIdx;
                  
                  return (
                    <motion.div
                      key={iIdx}
                      whileHover={!isClosed ? { scale: 1.1, zIndex: 20 } : {}}
                      whileTap={!isClosed ? { scale: 0.9 } : {}}
                      onClick={() => handleItemClick(sIdx, iIdx)}
                      className={cn(
                        "flex-1 flex items-center justify-center text-3xl md:text-4xl cursor-pointer relative select-none h-full",
                        isSelected && "z-30"
                      )}
                    >
                      <span className={cn(
                        "transition-transform",
                        isSelected && "scale-125 drop-shadow-[0_0_8px_rgba(255,255,255,1)]"
                      )}>
                        {item}
                      </span>
                      {isSelected && (
                        <motion.div 
                          layoutId="selection-glow"
                          className="absolute inset-0 bg-white/40 rounded-md ring-2 ring-white animate-pulse"
                        />
                      )}
                    </motion.div>
                  );
                })}

                {/* Closed Indicator */}
                {isClosed && (
                  <div className="absolute inset-0 flex items-center justify-center bg-black/10 rounded-lg pointer-events-none">
                    <CheckCircle2 className="w-6 h-6 text-green-600 drop-shadow-md" />
                  </div>
                )}
                
                {/* Shelf Wood Texture Detail */}
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#8b4513]/20 rounded-full mx-1 mb-0.5" />
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 text-center">
        <p className="text-[10px] md:text-xs font-bold text-[#8b4513]/60 uppercase tracking-widest">
          10초마다 퀴즈가 나옵니다! 시간 내에 모든 선반을 정리하세요.
        </p>
      </div>
    </div>
  );
};
