import React, { useState, useEffect, useCallback } from 'react';
import { motion, useAnimation } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';
import confetti from 'canvas-confetti';

export const AnipangGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [grid, setGrid] = useState<string[][]>([]);
  const [selected, setSelected] = useState<[number, number] | null>(null);
  const [score, setScore] = useState(0);
  const [movesLeft, setMovesLeft] = useState(5);
  const [showQuiz, setShowQuiz] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isShaking, setIsShaking] = useState(false);
  const emojis = ['🍬', '🍭', '🍫', '🍩', '🍪', '🧁'];
  const controls = useAnimation();

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

  const resolveMatches = async (currentGrid: string[][]) => {
    let matches = checkMatches(currentGrid);
    if (matches.length === 0) return currentGrid;

    setIsProcessing(true);
    let workingGrid = [...currentGrid.map(row => [...row])];
    let totalMatches = 0;

    while (matches.length > 0) {
      // Visual feedback for explosion
      setIsShaking(true);
      
      // Confetti burst at center of matches
      const avgR = matches.reduce((acc, [r]) => acc + r, 0) / matches.length;
      const avgC = matches.reduce((acc, [_, c]) => acc + c, 0) / matches.length;
      
      confetti({
        particleCount: 60,
        spread: 100,
        origin: { x: 0.5 + (avgC - 2.5) * 0.12, y: 0.5 + (avgR - 2.5) * 0.12 },
        colors: ['#FF69B4', '#FFD700', '#00CED1', '#FF4500', '#9370DB', '#00FF00'],
        ticks: 300,
        gravity: 1.5,
        scalar: 1.2,
        drift: 0,
      });

      if (soundEnabled) {
        // Multiple sounds for "bigger" feel
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.5;
        audio.play().catch(() => {});
        
        // Slight delay for second sound to create "pop pop pop" feel
        setTimeout(() => {
          const audio2 = new Audio(ASSETS.sounds.correct);
          audio2.volume = 0.4;
          audio2.playbackRate = 1.4;
          audio2.play().catch(() => {});
        }, 80);

        setTimeout(() => {
          const audio3 = new Audio(ASSETS.sounds.joyful);
          audio3.volume = 0.3;
          audio3.playbackRate = 1.6;
          audio3.play().catch(() => {});
        }, 160);
      }

      matches.forEach(([r, c]) => {
        workingGrid[r][c] = '';
      });
      totalMatches += matches.length;
      setGrid([...workingGrid]);
      
      await new Promise(r => setTimeout(r, 400));
      setIsShaking(false);

      for (let c = 0; c < 6; c++) {
        let emptyRow = 5;
        for (let r = 5; r >= 0; r--) {
          if (workingGrid[r][c] !== '') {
            const temp = workingGrid[r][c];
            workingGrid[r][c] = '';
            workingGrid[emptyRow][c] = temp;
            emptyRow--;
          }
        }
        for (let r = emptyRow; r >= 0; r--) {
          workingGrid[r][c] = emojis[Math.floor(Math.random() * emojis.length)];
        }
      }
      
      setGrid([...workingGrid]);
      await new Promise(r => setTimeout(r, 300));
      matches = checkMatches(workingGrid);
    }

    setScore(s => s + totalMatches * 10);
    setIsProcessing(false);
    return workingGrid;
  };

  useEffect(() => {
    let initialGrid = Array(6).fill(0).map(() => Array(6).fill(0).map(() => emojis[Math.floor(Math.random() * emojis.length)]));
    while (checkMatches(initialGrid).length > 0) {
      initialGrid = Array(6).fill(0).map(() => Array(6).fill(0).map(() => emojis[Math.floor(Math.random() * emojis.length)]));
    }
    setGrid(initialGrid);
  }, []);

  const handleCellClick = async (r: number, c: number) => {
    if (showQuiz || isProcessing) return;
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
          setMovesLeft(prev => {
            const next = prev - 1;
            if (next === 0) setShowQuiz(true);
            return next;
          });
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

  return (
    <motion.div 
      animate={isShaking ? {
        x: [0, -15, 15, -15, 15, 0],
        y: [0, 10, -10, 10, -10, 0],
        rotate: [0, -1, 1, -1, 1, 0],
        transition: { duration: 0.3 }
      } : {}}
      className="w-full h-full flex flex-col items-center justify-center p-4 md:p-8 bg-pink-50 relative overflow-hidden"
    >
      {showQuiz && <MiniQuiz soundEnabled={soundEnabled} onCorrect={() => { setShowQuiz(false); setMovesLeft(5); }} />}
      
      <div className="mb-4 md:mb-8 text-center">
        <div className="flex items-center justify-center gap-4 mb-2">
          <p className="text-pink-600 font-black text-2xl md:text-3xl">점수: {score}</p>
          <div className="px-3 py-1 bg-white rounded-full border-2 border-pink-200 shadow-sm">
            <p className="text-pink-500 font-black text-sm md:text-base">남은 턴: {movesLeft}</p>
          </div>
        </div>
        <p className="text-pink-400 font-bold text-xs md:text-sm">3개 이상 맞추면 터져요! 5번 움직이면 퀴즈 타임!</p>
      </div>
      <div className="grid grid-cols-6 gap-1 md:gap-2 bg-white p-2 md:p-4 rounded-[1.5rem] md:rounded-[2rem] shadow-xl border-4 border-pink-200">
        {grid.map((row, r) => row.map((cell, c) => (
          <motion.div
            key={`${r}-${c}`}
            layout
            initial={false}
            animate={cell === '' ? { scale: [1, 1.5, 0], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
            whileHover={!isProcessing ? { scale: 1.1 } : {}}
            whileTap={!isProcessing ? { scale: 0.9 } : {}}
            onClick={() => handleCellClick(r, c)}
            className={cn(
              "w-10 h-10 sm:w-12 sm:h-12 md:w-16 md:h-16 flex items-center justify-center text-2xl sm:text-3xl md:text-4xl cursor-pointer rounded-xl md:rounded-2xl transition-all",
              selected?.[0] === r && selected?.[1] === c ? "bg-pink-200 scale-110 shadow-inner" : "bg-gray-50 hover:bg-pink-50",
              cell === '' && "pointer-events-none"
            )}
          >
            {cell}
          </motion.div>
        )))}
      </div>
    </motion.div>
  );
};
