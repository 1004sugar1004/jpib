import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';
import { Timer, Trophy, Zap, ArrowRight, RefreshCw } from 'lucide-react';
import { Button } from '../ui/Button';

const STAGE_CONFIGS = [
  { name: '캔디 나라', emojis: ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'], target: 500, color: 'bg-pink-50', border: 'border-pink-200', text: 'text-pink-600' },
  { name: '과일 농장', emojis: ['🍎', '🍊', '🍇', '🍉', '🍓', '🍒'], target: 800, color: 'bg-orange-50', border: 'border-orange-200', text: 'text-orange-600' },
  { name: '부릉부릉 마을', emojis: ['🚗', '🚕', '🚙', '🚌', '🚎', '🏎️'], target: 1200, color: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-600' },
  { name: '푸른 바다', emojis: ['🐳', '🐬', '🐙', '🦑', '🦀', '🦞'], target: 1500, color: 'bg-cyan-50', border: 'border-cyan-200', text: 'text-cyan-600' },
];

export const AnipangGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [stage, setStage] = useState(0);
  const [grid, setGrid] = useState<string[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  const [gameState, setGameState] = useState<'playing' | 'cleared' | 'gameover' | 'quiz'>('playing');
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasShownMidQuiz, setHasShownMidQuiz] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentStage = STAGE_CONFIGS[stage % STAGE_CONFIGS.length];
  const emojis = currentStage.emojis;

  const checkMatches = (currentGrid: string[][]) => {
    const matches: [number, number][] = [];
    const rows = currentGrid.length;
    const cols = currentGrid[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols - 2; c++) {
        const emoji = currentGrid[r][c];
        if (emoji && emoji === currentGrid[r][c + 1] && emoji === currentGrid[r][c + 2]) {
          matches.push([r, c], [r, c + 1], [r, c + 2]);
        }
      }
    }

    for (let c = 0; c < cols; c++) {
      for (let r = 0; r < rows - 2; r++) {
        const emoji = currentGrid[r][c];
        if (emoji && emoji === currentGrid[r + 1][c] && emoji === currentGrid[r + 2][c]) {
          matches.push([r, c], [r + 1, c], [r + 2, c]);
        }
      }
    }

    return matches;
  };

  const hasPossibleMoves = (currentGrid: string[][]) => {
    const rows = currentGrid.length;
    const cols = currentGrid[0].length;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // Try horizontal swap
        if (c < cols - 1) {
          const tempGrid = currentGrid.map(row => [...row]);
          const temp = tempGrid[r][c];
          tempGrid[r][c] = tempGrid[r][c + 1];
          tempGrid[r][c + 1] = temp;
          if (checkMatches(tempGrid).length > 0) return true;
        }
        // Try vertical swap
        if (r < rows - 1) {
          const tempGrid = currentGrid.map(row => [...row]);
          const temp = tempGrid[r][c];
          tempGrid[r][c] = tempGrid[r + 1][c];
          tempGrid[r + 1][c] = temp;
          if (checkMatches(tempGrid).length > 0) return true;
        }
      }
    }
    return false;
  };

  const reshuffle = async () => {
    setIsProcessing(true);
    let newGrid = grid.map(row => [...row]);
    
    // Flatten, shuffle, and rebuild
    const flat = newGrid.flat();
    for (let i = flat.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [flat[i], flat[j]] = [flat[j], flat[i]];
    }
    
    let k = 0;
    for (let r = 0; r < 6; r++) {
      for (let c = 0; c < 6; c++) {
        newGrid[r][c] = flat[k++];
      }
    }
    
    // Ensure no immediate matches and at least one possible move
    while (checkMatches(newGrid).length > 0 || !hasPossibleMoves(newGrid)) {
      for (let i = flat.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [flat[i], flat[j]] = [flat[j], flat[i]];
      }
      k = 0;
      for (let r = 0; r < 6; r++) {
        for (let c = 0; c < 6; c++) {
          newGrid[r][c] = flat[k++];
        }
      }
    }
    
    setGrid(newGrid);
    setIsProcessing(false);
    alert('움직일 수 있는 칸이 없어 보드를 섞었습니다!');
  };

  const resolveMatches = async (currentGrid: string[][]) => {
    let matches = checkMatches(currentGrid);
    if (matches.length === 0) return currentGrid;

    setIsProcessing(true);
    let workingGrid = currentGrid.map(row => [...row]);
    let totalMatches = 0;
    const rows = workingGrid.length;
    const cols = workingGrid[0].length;

    while (matches.length > 0) {
      // Unique matches to avoid double counting if needed, though here we just clear them
      const uniqueMatches = Array.from(new Set(matches.map(m => `${m[0]},${m[1]}`)))
        .map(s => s.split(',').map(Number) as [number, number]);

      // Confetti burst at center of matches
      const avgR = uniqueMatches.reduce((acc, [r]) => acc + r, 0) / uniqueMatches.length;
      const avgC = uniqueMatches.reduce((acc, [_, c]) => acc + c, 0) / uniqueMatches.length;
      
      confetti({
        particleCount: 40,
        spread: 80,
        origin: { x: 0.5 + (avgC - 2.5) * 0.12, y: 0.5 + (avgR - 2.5) * 0.12 },
        colors: ['#FF69B4', '#FFD700', '#00CED1', '#FF4500', '#9370DB', '#00FF00'],
        ticks: 200,
        gravity: 1.2,
      });

      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }

      // Clear matches
      uniqueMatches.forEach(([r, c]) => {
        workingGrid[r][c] = '';
      });
      totalMatches += uniqueMatches.length;
      
      // Show empty spaces briefly
      setGrid(workingGrid.map(row => [...row]));
      await new Promise(r => setTimeout(r, 300));

      // Gravity and Refill
      for (let c = 0; c < cols; c++) {
        let columnItems = [];
        for (let r = rows - 1; r >= 0; r--) {
          if (workingGrid[r][c] !== '') {
            columnItems.push(workingGrid[r][c]);
          }
        }
        
        // Fill the rest with random emojis
        while (columnItems.length < rows) {
          columnItems.push(emojis[Math.floor(Math.random() * emojis.length)]);
        }
        
        // Put back into workingGrid (from bottom to top)
        for (let r = 0; r < rows; r++) {
          workingGrid[rows - 1 - r][c] = columnItems[r];
        }
      }
      
      // Update grid state with refilled items
      setGrid(workingGrid.map(row => [...row]));
      await new Promise(r => setTimeout(r, 250));
      
      // Check for cascading matches
      matches = checkMatches(workingGrid);
    }

    setScore(prev => {
      const newScore = prev + totalMatches * 10;
      if (newScore >= currentStage.target) {
        setGameState('cleared');
        confetti({
          particleCount: 200,
          spread: 100,
          origin: { y: 0.6 }
        });
      }
      return newScore;
    });

    setIsProcessing(false);
    
    // Check if any moves are possible, if not reshuffle
    if (!hasPossibleMoves(workingGrid)) {
      await reshuffle();
    }
    
    return workingGrid;
  };

  const initGrid = useCallback(() => {
    let initialGrid = Array(6).fill(0).map(() => Array(6).fill(0).map(() => emojis[Math.floor(Math.random() * emojis.length)]));
    while (checkMatches(initialGrid).length > 0 || !hasPossibleMoves(initialGrid)) {
      initialGrid = Array(6).fill(0).map(() => Array(6).fill(0).map(() => emojis[Math.floor(Math.random() * emojis.length)]));
    }
    setGrid(initialGrid);
    setScore(0);
    setTimeLeft(60);
    setGameState('playing');
    setHasShownMidQuiz(false);
    setSelected(null);
  }, [emojis]);

  useEffect(() => {
    initGrid();
  }, [initGrid]);

  useEffect(() => {
    if (gameState === 'playing' && timeLeft > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft(prev => {
          if (prev === 31 && !hasShownMidQuiz) {
            setGameState('quiz');
            setHasShownMidQuiz(true);
            return 30;
          }
          if (prev <= 1) {
            setGameState('gameover');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [gameState, timeLeft, hasShownMidQuiz]);

  const handleCellClick = async (r: number, c: number) => {
    if (gameState !== 'playing' || isProcessing) return;
    if (!selected) {
      setSelected([r, c]);
    } else {
      const [pr, pc] = selected;
      const isAdjacent = (Math.abs(pr - r) === 1 && pc === c) || (Math.abs(pc - c) === 1 && pr === r);
      
      if (isAdjacent) {
        const newGrid = [...grid.map(row => [...row])];
        const temp = newGrid[r][c];
        newGrid[r][c] = newGrid[pr][pc];
        newGrid[pr][pc] = temp;
        
        setGrid(newGrid);
        setSelected(null);

        const matches = checkMatches(newGrid);
        if (matches.length > 0) {
          await resolveMatches(newGrid);
        } else {
          await new Promise(res => setTimeout(res, 300));
          const revertedGrid = [...newGrid.map(row => [...row])];
          revertedGrid[pr][pc] = revertedGrid[r][c];
          revertedGrid[r][c] = temp;
          setGrid(revertedGrid);
        }
      } else {
        setSelected([r, c]);
      }
    }
  };

  const nextStage = () => {
    setStage(prev => prev + 1);
  };

  const restartGame = () => {
    setStage(0);
    setQuizWrongCount(0);
    initGrid();
  };

  return (
    <div className={cn("w-full h-full flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden transition-colors duration-500", currentStage.color)}>
      {/* Blurry Background Image */}
      <div 
        className="absolute inset-0 z-0 opacity-25 pointer-events-none bg-cover bg-center bg-no-repeat blur-md"
        style={{ backgroundImage: 'url("https://i.imgur.com/UMcVNRB.png")' }}
      />
      
      {gameState === 'quiz' && (
        <MiniQuiz 
          soundEnabled={soundEnabled} 
          wrongCount={quizWrongCount}
          onCorrect={() => {
            setGameState('playing');
          }} 
          onWrong={() => {
            setQuizWrongCount(prev => prev + 1);
          }}
          onFail={() => {
            setGameState('playing');
            restartGame(); // Reset game
          }}
        />
      )}

      <div className="w-full max-w-md mb-6 space-y-4">
        <div className="flex items-center justify-between bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white/50">
          <div className="flex flex-col">
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">스테이지 {stage + 1}</span>
            <span className={cn("text-xl font-black", currentStage.text)}>{currentStage.name}</span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex flex-col items-end">
              <div className="flex items-center gap-1 text-gray-500">
                <Timer className="w-3 h-3" />
                <span className="text-[10px] font-bold uppercase">남은 시간</span>
              </div>
              <span className={cn("text-xl font-black", timeLeft < 10 ? "text-red-500 animate-pulse" : "text-gray-700")}>
                {timeLeft}초
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white/80 backdrop-blur-md p-4 rounded-3xl shadow-lg border-2 border-white/50">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-500" />
              <span className="text-sm font-black text-gray-700">목표 점수: {currentStage.target}</span>
            </div>
            <span className="text-sm font-black text-indigo-600">현재: {score}</span>
          </div>
          <div className="w-full h-3 bg-gray-100 rounded-full overflow-hidden border border-gray-200">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (score / currentStage.target) * 100)}%` }}
              className={cn("h-full transition-all duration-300", 
                score >= currentStage.target ? "bg-green-500" : "bg-indigo-500"
              )}
            />
          </div>
        </div>
      </div>

      <div className={cn("grid grid-cols-6 gap-1 md:gap-2 bg-white p-2 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-2xl border-4 transition-colors duration-500", currentStage.border)}>
        {grid.map((row, r) => row.map((cell, c) => (
          <motion.div
            key={`${r}-${c}`}
            layout
            initial={false}
            animate={cell === '' ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
            whileHover={gameState === 'playing' && !isProcessing ? { scale: 1.1 } : {}}
            whileTap={gameState === 'playing' && !isProcessing ? { scale: 0.9 } : {}}
            onClick={() => handleCellClick(r, c)}
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl cursor-pointer rounded-xl md:rounded-2xl transition-all",
              selected?.[0] === r && selected?.[1] === c ? "bg-indigo-100 scale-110 shadow-inner" : "bg-gray-50 hover:bg-gray-100",
              (cell === '' || gameState !== 'playing') && "pointer-events-none"
            )}
          >
            {cell}
          </motion.div>
        )))}
      </div>

      <AnimatePresence>
        {gameState !== 'playing' && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.8, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-white rounded-[3rem] p-8 max-w-sm w-full text-center shadow-2xl border-8 border-white"
            >
              {gameState === 'cleared' ? (
                <>
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Trophy className="w-10 h-10 text-green-600 animate-bounce" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">스테이지 클리어!</h3>
                  <p className="text-gray-500 font-bold mb-8">대단해요! 다음 단계로 넘어갈까요?</p>
                  <Button 
                    onClick={nextStage}
                    className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    다음 스테이지 <ArrowRight className="w-5 h-5" />
                  </Button>
                </>
              ) : (
                <>
                  <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <RefreshCw className="w-10 h-10 text-red-600" />
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-2">시간 종료!</h3>
                  <p className="text-gray-500 font-bold mb-8">아쉽네요. 다시 도전해볼까요?</p>
                  <Button 
                    onClick={restartGame}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-4 rounded-2xl font-black text-lg shadow-lg flex items-center justify-center gap-2"
                  >
                    다시 시작하기 <RefreshCw className="w-5 h-5" />
                  </Button>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
