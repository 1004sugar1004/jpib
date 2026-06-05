import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowLeft, Bot, User, Award, RefreshCw, Play, Trophy, Volume2, VolumeX, Sparkles, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

// Sound synthesis helper using Web Audio API to prevent external file issues
const playSynthSound = (type: 'select' | 'bingo' | 'win' | 'lose') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'select') {
      // Short blip sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'bingo') {
      // Golden double sound
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.2);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else if (type === 'win') {
      // Arpeggio leading to high chord
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C major
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.4);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } else if (type === 'lose') {
      // descending sad buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Web Audio API not supported or blocked by browser policies.");
  }
};

// IB standard content definitions for thematic Bingo Mode
const BINGO_CATEGORIES = [
  {
    title: "🌟 IB 학습자 프로필",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    hoverBg: "hover:bg-blue-500/20 hover:text-white",
    words: ["탐구하는 사람", "지식있는 사람", "생각하는 사람", "소통하는 사람", "원칙있는 사람", "열린 마음", "배려하는 사람", "도전하는 사람", "균형잡힌 사람", "성찰하는 사람"]
  },
  {
    title: "🔍 IB 핵심 개념",
    color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    hoverBg: "hover:bg-indigo-500/20 hover:text-white",
    words: ["형태 개념", "기능 개념", "원인 개념", "변화 개념", "연결 개념", "관점 개념", "책임 개념"]
  },
  {
    title: "⚙️ 학습 접근 기능 (ATL)",
    color: "bg-violet-500/10 border-violet-500/30 text-violet-300",
    hoverBg: "hover:bg-violet-500/20 hover:text-white",
    words: ["사고 기능", "조사 기능", "의사소통 기능", "대인관계 기능", "자기관리 기능"]
  },
  {
    title: "🚀 실천과 행동",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    hoverBg: "hover:bg-emerald-500/20 hover:text-white",
    words: ["배우기", "행동하기", "성장하기", "협력하기", "존중하기", "공감 능력", "창의성", "글로벌 마인드"]
  }
];

const ALL_WORDS = BINGO_CATEGORIES.flatMap(cat => cat.words);

interface Cell {
  value: string;
  marked: boolean;
}

interface BingoGameViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'bingo') => void;
  onEarnXP: (xp: number, activityType?: string) => void;
  soundEnabled: boolean;
}

export const BingoGameView = ({ setView, onEarnXP, soundEnabled }: BingoGameViewProps) => {
  const [gameState, setGameState] = useState<'intro' | 'setup' | 'playing' | 'ended'>('intro');
  
  // Game metrics
  const [playerBoard, setPlayerBoard] = useState<Cell[]>([]);
  const [computerBoard, setComputerBoard] = useState<Cell[]>([]);
  const [markedValues, setMarkedValues] = useState<Set<string>>(new Set());
  
  const [playerBingos, setPlayerBingos] = useState<number>(0);
  const [computerBingos, setComputerBingos] = useState<number>(0);
  const [turn, setTurn] = useState<'player' | 'computer'>('player');
  const [lastSelectedValue, setLastSelectedValue] = useState<string | null>(null);
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [isMusicEnabled, setIsMusicEnabled] = useState(soundEnabled);
  const [statusMessage, setStatusMessage] = useState('원하는 단어를 선택하세요!');

  const BINGO_TARGET = 3;

  // Initialize empty setup board
  const initializeSetupBoard = () => {
    setPlayerBoard(Array.from({ length: 25 }, () => ({ value: '', marked: false })));
  };

  // Shuffle array helper
  const shuffle = (array: string[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  // Add a word from the pool to the next empty cell of player board
  const handleSelectWordFromPool = (word: string) => {
    if (gameState !== 'setup') return;
    
    // Check if word is already selected
    const alreadySelected = playerBoard.some(cell => cell.value === word);
    if (alreadySelected) return;

    // Find first empty cell
    const emptyIndex = playerBoard.findIndex(cell => cell.value === '');
    if (emptyIndex === -1) return; // Full

    const newBoard = [...playerBoard];
    newBoard[emptyIndex] = { value: word, marked: false };
    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  // Remove a word from a specific board cell by clicking it
  const handleRemoveWordFromBoard = (index: number) => {
    if (gameState !== 'setup') return;
    const newBoard = [...playerBoard];
    newBoard[index] = { value: '', marked: false };
    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  // Auto fill all remaining empty positions with random unique words
  const handleRandomFill = () => {
    if (gameState !== 'setup') return;
    const selectedWords = playerBoard.map(c => c.value).filter(v => v !== '');
    const remainingWords = ALL_WORDS.filter(w => !selectedWords.includes(w));
    const shuffledRemaining = shuffle(remainingWords);

    const newBoard = playerBoard.map(cell => {
      if (cell.value !== '') return cell;
      const nextWord = shuffledRemaining.shift();
      return { value: nextWord || '', marked: false };
    });

    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  // Clear setup board
  const handleClearBoard = () => {
    if (gameState !== 'setup') return;
    initializeSetupBoard();
  };

  // Finalize setup and launch match against AI
  const handleStartMatch = () => {
    const selectedWords = playerBoard.map(c => c.value);
    const isValid = selectedWords.every(w => w !== '');
    if (!isValid) return;

    setShuffling(true);
    // Computer gets exact same 25 words shuffled randomly for a perfect, fair matchup!
    const computerWords = shuffle(selectedWords);

    setComputerBoard(computerWords.map(w => ({ value: w, marked: false })));
    setMarkedValues(new Set());
    setPlayerBingos(0);
    setComputerBingos(0);
    setLastSelectedValue(null);
    setWinner(null);
    setTurn('player');
    setStatusMessage('첫 번째 뒤집을 단어를 내 판에서 골라 터치하세요! 🎯');
    setGameState('playing');

    setTimeout(() => setShuffling(false), 450);
  };

  // Re-start game fully from intro/setup
  const initializeBoards = () => {
    initializeSetupBoard();
    setGameState('setup');
  };

  useEffect(() => {
    initializeSetupBoard();
  }, [gameState === 'setup']);

  // Calculate completed bingo lines (returns array of winning line indices: rows 0-4, cols 5-9, diag 10, diag 11)
  const calculateCompletedLines = (board: Cell[]): number[] => {
    if (board.length === 0) return [];
    const lines: number[] = [];

    // Rows
    for (let r = 0; r < 5; r++) {
      if (board.slice(r * 5, r * 5 + 5).every(cell => cell.marked)) {
        lines.push(r); // rows index 0-4
      }
    }

    // Columns
    for (let c = 0; c < 5; c++) {
      let isColComplete = true;
      for (let r = 0; r < 5; r++) {
        if (!board[r * 5 + c].marked) {
          isColComplete = false;
          break;
        }
      }
      if (isColComplete) {
        lines.push(5 + c); // cols index 5-9
      }
    }

    // Diagonal top-left to bottom-right
    let diag1 = true;
    for (let i = 0; i < 5; i++) {
      if (!board[i * 5 + i].marked) {
        diag1 = false;
        break;
      }
    }
    if (diag1) lines.push(10);

    // Diagonal top-right to bottom-left
    let diag2 = true;
    for (let i = 0; i < 5; i++) {
      if (!board[i * 5 + (4 - i)].marked) {
        diag2 = false;
        break;
      }
    }
    if (diag2) lines.push(11);

    return lines;
  };

  // Check Game State and trigger Bingos counting
  const handleMark = (value: string | number) => {
    if (markedValues.has(value) || winner) return;

    // Update markers
    const newMarked = new Set(markedValues);
    newMarked.add(value);
    setMarkedValues(newMarked);
    setLastSelectedValue(value);

    // Sound effect
    if (isMusicEnabled) playSynthSound('select');

    // Make updates to cells
    const newPlayerBoard = playerBoard.map(cell => 
      cell.value === value ? { ...cell, marked: true } : cell
    );
    const newComputerBoard = computerBoard.map(cell => 
      cell.value === value ? { ...cell, marked: true } : cell
    );

    setPlayerBoard(newMarkedBoard => {
      const updated = playerBoard.map(cell => 
        cell.value === value ? { ...cell, marked: true } : cell
      );
      const prevL = calculateCompletedLines(playerBoard).length;
      const newL = calculateCompletedLines(updated).length;
      if (newL > prevL && isMusicEnabled) setTimeout(() => playSynthSound('bingo'), 80);
      setPlayerBingos(newL);
      return updated;
    });

    setComputerBoard(newMarkedBoard => {
      const updated = computerBoard.map(cell => 
        cell.value === value ? { ...cell, marked: true } : cell
      );
      setComputerBingos(calculateCompletedLines(updated).length);
      return updated;
    });
  };

  // Check winner on board changes
  useEffect(() => {
    if (gameState !== 'playing' || winner) return;

    if (playerBingos >= BINGO_TARGET && computerBingos >= BINGO_TARGET) {
      if (playerBingos > computerBingos) {
        triggerWin();
      } else if (computerBingos > playerBingos) {
        triggerLose();
      } else {
        // Tie goes to player (student friendly)
        triggerWin();
      }
    } else if (playerBingos >= BINGO_TARGET) {
      triggerWin();
    } else if (computerBingos >= BINGO_TARGET) {
      triggerLose();
    }
  }, [playerBingos, computerBingos, gameState]);

  const triggerWin = () => {
    setWinner('player');
    setGameState('ended');
    if (isMusicEnabled) playSynthSound('win');
    confetti({
      particleCount: 150,
      spread: 80,
      origin: { y: 0.6 }
    });
    // Call reward function!
    onEarnXP(50, 'quiz');
  };

  const triggerLose = () => {
    setWinner('computer');
    setGameState('ended');
    if (isMusicEnabled) playSynthSound('lose');
  };

  // Player clicks a keyword on their board
  const handlePlayerCellClick = (value: string | number) => {
    if (gameState !== 'playing' || turn !== 'player' || winner) return;
    if (markedValues.has(value)) return;

    handleMark(value);
    
    // Switch turn to computer with a slight delay for realistic processing feel
    setTurn('computer');
    setStatusMessage('🤖 컴퓨터가 고민하고 있어요...');
  };

  // Computer AI Opponent logic
  useEffect(() => {
    if (gameState !== 'playing' || turn !== 'computer' || winner) return;

    const timer = setTimeout(() => {
      // Find unselected values on board
      const unselectedCells = computerBoard.filter(c => !c.marked);
      if (unselectedCells.length === 0) return;

      // Smart AI Selection Strategy
      // 1. Analyze both boards (Player and AI own) for lines with 3 or 4 elements marked
      // 2. Choose optimal item to block student or win
      let choice: string | number | null = null;

      // Calculate priority scores for unselected cells
      let bestScore = -1;
      let bestCell: Cell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];

      unselectedCells.forEach(cell => {
        let cellScore = 0;

        // Check columns, rows, diagonals containing this cell on AI board
        const cIndex = computerBoard.findIndex(c => c.value === cell.value);
        if (cIndex !== -1) {
          const r = Math.floor(cIndex / 5);
          const c = cIndex % 5;

          // Row score (how many already marked in this row)
          const rowCells = computerBoard.slice(r * 5, r * 5 + 5);
          const rowMarkedCount = rowCells.filter(cell => cell.marked).length;
          cellScore += rowMarkedCount * 1.5;

          // Column score
          let colMarkedCount = 0;
          for (let i = 0; i < 5; i++) {
            if (computerBoard[i * 5 + c].marked) colMarkedCount++;
          }
          cellScore += colMarkedCount * 1.5;

          // Diagonal 1 (top-left to bottom-right)
          if (r === c) {
            let d1Marked = 0;
            for (let i = 0; i < 5; i++) {
              if (computerBoard[i * 5 + i].marked) d1Marked++;
            }
            cellScore += d1Marked * 1.2;
          }

          // Diagonal 2 (top-right to bottom-left)
          if (r + c === 4) {
            let d2Marked = 0;
            for (let i = 0; i < 5; i++) {
              if (computerBoard[i * 5 + (4 - i)].marked) d2Marked++;
            }
            cellScore += d2Marked * 1.2;
          }
        }

        // Add defense scoring (check player board for items about to complete)
        const pIndex = playerBoard.findIndex(p => p.value === cell.value);
        if (pIndex !== -1) {
          const pr = Math.floor(pIndex / 5);
          const pc = pIndex % 5;

          // Row blocker score
          const pRowCells = playerBoard.slice(pr * 5, pr * 5 + 5);
          const pRowMarked = pRowCells.filter(cell => cell.marked).length;
          if (pRowMarked >= 3) {
            cellScore += pRowMarked * 2; // high defensive weight to block player Completing Bingo
          }

          // Column blocker score
          let pColMarked = 0;
          for (let i = 0; i < 5; i++) {
            if (playerBoard[i * 5 + pc].marked) pColMarked++;
          }
          if (pColMarked >= 3) {
            cellScore += pColMarked * 2;
          }
        }

        // Add slight random noise to prevent predictability
        cellScore += Math.random() * 0.5;

        if (cellScore > bestScore) {
          bestScore = cellScore;
          bestCell = cell;
        }
      });

      choice = bestCell.value;

      // Mark selected value
      handleMark(choice);
      
      // Update turn
      setTurn('player');
      setStatusMessage(`🤖 컴퓨터가 "${choice}"을(를) 불렀습니다! 내 차례입니다.`);
    }, 1200);

    return () => clearTimeout(timer);
  }, [gameState, turn, computerBoard, playerBoard, winner]);

  const playerWinLines = calculateCompletedLines(playerBoard);
  const computerWinLines = calculateCompletedLines(computerBoard);

  const filledCount = playerBoard.filter(c => c.value !== '').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-3 relative overflow-x-hidden font-sans">
      
      {/* Background Grid Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      {/* Header Bar */}
      <header className="relative w-full max-w-5xl flex items-center justify-between py-2 mb-3 border-b border-white/10 z-10 font-sans">
        <button 
          onClick={() => setView('home')}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
          id="bingo-header-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          마을로 돌아가기
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all border border-white/5"
            id="bingo-music-toggle-btn"
          >
            {isMusicEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          
          <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-lg px-2.5 py-1 text-xs text-indigo-200 font-extrabold flex items-center gap-1 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>승리보상 +50 XP</span>
          </div>
        </div>
      </header>

      {gameState === 'intro' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full text-center relative z-10 px-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-6 bg-slate-900/90 rounded-[2rem] border-2 border-indigo-500/20 shadow-2xl space-y-6 w-full"
          >
            <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
              <Award className="w-9 h-9 text-white animate-bounce" />
            </div>

            <div>
              <h2 className="text-2xl md:text-3xl font-black tracking-tight text-white mb-2">
                IB 핵심 지식 빙고 대결!
              </h2>
              <p className="text-gray-400 font-medium text-xs md:text-sm leading-snug">
                컴퓨터 AI와 겨루는 흥미진진한 탐험 빙고!<br/>
                기존 숫자 빙고 대신, 내가 학습한 핵심 IB 어휘들로 직접 판을 설계해보세요!
              </p>
            </div>

            {/* Instruction Panel */}
            <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 text-left text-xs leading-relaxed text-gray-450 space-y-2">
              <p className="font-extrabold text-indigo-300">🎮 주요 대결 규칙 변경 안내</p>
              <p className="text-emerald-400">• <span className="font-bold">나만의 설계</span>: 예시 단어를 하나씩 클릭해 배치하거나, 랜덤으로 보드를 채울 수 있습니다.</p>
              <p className="text-emerald-400">• <span className="font-bold">비공개 매칭</span>: 컴퓨터의 보드 속 단어 위치는 베일에 싸여있어 소리 내어 불렀을 때만 하나씩 공개됩니다!</p>
              <p className="text-indigo-200">• 먼저 <span className="font-bold text-amber-400">3줄의 빙고</span>를 완성하면 완벽한 승리를 일구며 50 XP를 받습니다!</p>
            </div>

            <Button 
              onClick={() => {
                initializeSetupBoard();
                setGameState('setup');
              }}
              className="w-full py-3.5 text-sm md:text-base font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border-none"
              id="start-bingo-quiz-game-btn"
            >
              내 빙고판 만들러 가기 <Sparkles className="w-4 h-4 inline ml-1.5" />
            </Button>
          </motion.div>
        </div>
      )}

      {/* SETUP STATE: CUSTOMIZE BOARD */}
      {gameState === 'setup' && (
        <div className="flex-1 flex flex-col w-full max-w-5xl justify-between relative z-10">
          
          <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
            <div>
              <h3 className="text-lg font-black text-indigo-300">나만의 IB 탐험 빙고판 만들기</h3>
              <p className="text-xs text-gray-400 mt-1">예시 단어 리스트에서 하나씩 터치하여 25칸을 채우거나, 랜덤 채우기를 이용해 즉시 시작할 수 있습니다.</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleRandomFill}
                className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 rounded-xl text-xs font-black text-indigo-200 transition-all flex items-center gap-1 shadow-md"
              >
                🎲 랜덤 채우기
              </button>
              <button
                onClick={handleClearBoard}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-xl text-xs font-black text-gray-400 transition-all flex items-center gap-1 shadow-inner"
              >
                🔄 전체 초기화
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start justify-center flex-1">
            
            {/* Draft Board Section (Left) */}
            <div className="lg:col-span-5 flex flex-col gap-3">
              <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
                <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-indigo-500/10">
                  <span className="text-xs font-black text-gray-300">내 설계 보드 (Draft)</span>
                  <div className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 flex items-center gap-1.5">
                    채워진 칸: 
                    <span className="text-white text-xs font-black">{filledCount} / 25</span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-slate-950 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
                  <div 
                    className="bg-indigo-500 h-full transition-all duration-300"
                    style={{ width: `${(filledCount / 25) * 100}%` }}
                  />
                </div>

                <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                  {playerBoard.map((cell, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleRemoveWordFromBoard(idx)}
                      className={cn(
                        "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center p-1.5 text-center cursor-pointer transition-all uppercase select-none overflow-hidden outline-none break-all",
                        cell.value !== ''
                          ? "bg-indigo-950/80 border-indigo-500 text-indigo-200 hover:border-rose-500 hover:text-rose-300 font-extrabold focus:outline-none"
                          : "bg-slate-950 border-white/5 border-dashed text-gray-500 hover:bg-slate-900/50"
                      )}
                      title={cell.value ? "클릭하면 이 위치의 단어를 지웁니다." : "오른쪽 단어 풀에서 단어를 골라 채우세요."}
                    >
                      {cell.value ? (
                        <span className="text-[9px] md:text-[10px] font-black leading-tight tracking-tight whitespace-pre-wrap">
                          {cell.value}
                        </span>
                      ) : (
                        <span className="text-xs font-bold text-gray-700">+</span>
                      )}
                    </button>
                  ))}
                </div>
              </Card>

              {/* Start Match Button */}
              {filledCount === 25 ? (
                <motion.button
                  initial={{ scale: 0.98 }}
                  animate={{ scale: [0.98, 1.02, 0.98] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  onClick={handleStartMatch}
                  className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 border-none cursor-pointer"
                >
                  <Bot className="w-5 h-5" />
                  AI 컴퓨터와 대결 시작하기! ⚡ 
                </motion.button>
              ) : (
                <button
                  disabled
                  className="w-full py-4 bg-slate-900 border border-white/5 text-gray-500 font-black text-sm md:text-base rounded-2xl cursor-not-allowed text-center"
                >
                  단어 {25 - filledCount}칸을 더 채우면 활성화됩니다 🧩
                </button>
              )}
            </div>

            {/* Word Pool Section - Categorized (Right) */}
            <div className="lg:col-span-7 flex flex-col gap-4">
              <Card className="p-4 bg-slate-900/60 border-indigo-500/20 max-h-[64vh] overflow-y-auto custom-scrollbar space-y-5">
                <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                  <span className="text-xs font-black text-indigo-300 tracking-wider">📋 단어 수집기 (카테고리별 예시)</span>
                  <span className="text-[10px] text-gray-400">터치하여 빈 칸에 쏙 넣으세요!</span>
                </div>

                <div className="space-y-4">
                  {BINGO_CATEGORIES.map((cat, catIdx) => (
                    <div key={catIdx} className="space-y-2">
                      <h4 className="text-[11px] font-extrabold text-slate-300 border-l-2 border-indigo-500 pl-1.5">
                        {cat.title}
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {cat.words.map((word, wIdx) => {
                          const isUsed = playerBoard.some(c => c.value === word);
                          return (
                            <button
                              key={wIdx}
                              onClick={() => handleSelectWordFromPool(word)}
                              disabled={isUsed || filledCount >= 25}
                              className={cn(
                                "text-[10px] md:text-xs px-2.5 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer select-none outline-none",
                                isUsed
                                  ? "bg-indigo-900/40 border-indigo-500/20 text-indigo-400/40 opacity-40 cursor-not-allowed"
                                  : "bg-slate-950 border-white/5 text-slate-300 hover:border-indigo-500/60"
                              )}
                            >
                              {word}
                              {isUsed && <span className="text-[9px] text-emerald-400 ml-1">✓</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>

          </div>

        </div>
      )}

      {gameState === 'playing' && (
        <div className="flex-1 flex flex-col w-full max-w-5xl justify-between relative z-10">
          
          {/* Status Message Panel */}
          <div className="bg-slate-950 border border-white/10 rounded-2xl p-2.5 mb-3 flex items-center justify-between shadow-lg gap-2 text-center font-sans">
            <div className="flex items-center gap-2">
              <span className={cn(
                "w-2 h-2 rounded-full",
                turn === 'player' ? "bg-emerald-500 animate-ping" : "bg-amber-400"
              )} />
              <p className="text-[11px] md:text-xs font-extrabold text-slate-200">
                {statusMessage}
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-white/5 py-1 px-2.5 rounded-lg text-gray-400">
                <span className="font-extrabold text-[10px] text-indigo-400 uppercase">모드</span>
                <span className="text-[10px] font-black text-white">IB 핵심 지식 매칭</span>
              </div>
              <button 
                onClick={() => {
                  setGameState('setup');
                  initializeSetupBoard();
                }}
                disabled={shuffling}
                className="p-1 px-2 text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 text-indigo-450 hover:text-indigo-300 rounded border border-indigo-500/20 flex items-center gap-1 transition-colors outline-none"
                id="bingo-board-reshuffle"
              >
                <RefreshCw className={cn("w-3 h-3", shuffling && "animate-spin")} />
                설계 재설정 (준비화면)
              </button>
            </div>
          </div>

          {/* Dual Board Grid System - Optimized for landscape tablets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch justify-center flex-1 min-h-[45vh] font-sans">
            
            {/* Player 5x5 Board */}
            <Card className="p-3 md:p-4 bg-slate-900/60 border-indigo-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-500/10">
                  <div className="flex items-center gap-1.5 text-emerald-400">
                    <User className="w-4 h-4" />
                    <span className="text-xs font-black">내 탐험 보드 (Player)</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                    완성 빙고: <span className="text-white text-xs ml-1">{playerBingos} / {BINGO_TARGET}</span>
                  </div>
                </div>

                <div className="relative">
                  {/* Grid of Cards */}
                  <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                    {playerBoard.map((cell, idx) => {
                      const r = Math.floor(idx / 5);
                      const c = idx % 5;
                      
                      // Check if cell is in a winning line
                      const isWinningCell = playerWinLines.some(lineIdx => {
                        if (lineIdx < 5) return lineIdx === r; // horizontal row
                        if (lineIdx < 10) return (lineIdx - 5) === c; // vertical col
                        if (lineIdx === 10) return r === c; // diag 1
                        if (lineIdx === 11) return r + c === 4; // diag 2
                        return false;
                      });

                      return (
                        <button
                          key={idx}
                          id={`p-cell-${idx}`}
                          onClick={() => handlePlayerCellClick(cell.value)}
                          disabled={cell.marked || turn !== 'player' || winner !== null}
                          className={cn(
                            "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-all uppercase select-none outline-none overflow-hidden",
                            cell.marked 
                              ? isWinningCell
                                ? "bg-amber-500 border-amber-300 text-slate-900 font-extrabold shadow-md scale-95 duration-200"
                                : "bg-indigo-600 border-indigo-400 text-white font-extrabold shadow-inner scale-95"
                              : "bg-slate-950 border-white/5 text-gray-300 hover:bg-slate-800 hover:border-indigo-500/50"
                          )}
                        >
                          {/* Overlay for highlighted newest choice */}
                          {lastSelectedValue === cell.value && cell.marked && (
                            <span className="absolute inset-0 bg-white/25 animate-ping rounded-xl pointer-events-none" />
                          )}
                          <span className="font-black tracking-tight break-all leading-tight text-center text-[9px] md:text-[10px] whitespace-pre-wrap">
                            {cell.value}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Progress Line indicating Bingo counts */}
              <div className="mt-3 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[10px] text-gray-400">
                <span>🎯 {BINGO_TARGET}개 한 줄 빙고 채우기</span>
                <span>나머지 칠 칸: {25 - markedValues.size} 칸</span>
              </div>
            </Card>

            {/* Computer Opponent 5x5 Board with Hiding mechanism strictly implemented */}
            <Card className="p-3 md:p-4 bg-slate-900/60 border-purple-500/20 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-purple-500/10">
                  <div className="flex items-center gap-1.5 text-purple-400">
                    <Bot className="w-4 h-4" />
                    <span className="text-xs font-black">AI 컴퓨터의 보드 (숨김처리 🔒)</span>
                  </div>
                  <div className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400">
                    완성 빙고: <span className="text-white text-xs ml-1">{computerBingos} / {BINGO_TARGET}</span>
                  </div>
                </div>

                <div className="relative">
                  {/* Grid of Cards */}
                  <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                    {computerBoard.map((cell, idx) => {
                      const r = Math.floor(idx / 5);
                      const c = idx % 5;
                      
                      // Check if cell is in a winning line
                      const isWinningCell = computerWinLines.some(lineIdx => {
                        if (lineIdx < 5) return lineIdx === r; // horizontal row
                        if (lineIdx < 10) return (lineIdx - 5) === c; // vertical col
                        if (lineIdx === 10) return r === c; // diag 1
                        if (lineIdx === 11) return r + c === 4; // diag 2
                        return false;
                      });

                      return (
                        <div
                          key={idx}
                          id={`c-cell-${idx}`}
                          className={cn(
                            "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center p-1 transition-all select-none overflow-hidden text-center",
                            cell.marked 
                              ? isWinningCell
                                ? "bg-amber-500 border-amber-300 text-slate-900 font-extrabold shadow-md scale-95 duration-200"
                                : "bg-purple-900 border-purple-400 text-white font-extrabold shadow-inner scale-95"
                              : "bg-slate-950 border-white/5 text-gray-650 bg-gradient-to-tr from-slate-950 to-indigo-950/20"
                          )}
                        >
                          {/* If not marked, we HIDE the text value completely and render a mystery icon as per user requests */}
                          {cell.marked ? (
                            <span className="font-extrabold text-[9px] md:text-[10px] leading-tight text-white tracking-tight break-all whitespace-pre-wrap">
                              {cell.value}
                            </span>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-indigo-500/40">
                              <Bot className="w-4 h-4 animate-pulse" />
                              <span className="text-[9px] text-indigo-500/40 font-bold tracking-widest mt-1">?</span>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Opponent Status panel */}
              <div className="mt-3 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[10px] text-gray-400">
                <span>🤖 가상 지능 강화 모듈 가동 중</span>
                <span>마지막 터치된 단어: <span className="text-amber-300 font-black">{lastSelectedValue || '-'}</span></span>
              </div>
            </Card>

          </div>

          {/* Quick Guidance info on the bottom */}
          <div className="mt-3 text-center text-[10px] text-gray-500 font-sans">
            * 상대 컴퓨터의 빙고판은 베일에 가려져있어, 소리 내어 불린 단어만 하나씩 활성화됩니다.
          </div>

        </div>
      )}

      {/* Game Ended Popup overlay */}
      {gameState === 'ended' && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="p-8 max-w-sm w-full bg-slate-900 border-2 border-indigo-500/30 rounded-[2rem] text-center space-y-6"
          >
            <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
              <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
            </div>

            <div>
              <h3 className={cn(
                "text-2xl font-black",
                winner === 'player' ? "text-emerald-400" : "text-rose-400"
              )}>
                {winner === 'player' ? "빙고 대승리! 🎉" : "컴퓨터의 빙고 달성! 🤖"}
              </h3>
              <p className="text-gray-400 font-bold text-xs mt-1.5 leading-relaxed">
                {winner === 'player' 
                  ? "훌륭한 지식 전략가로 임무를 완료했습니다! 축하금 50 XP가 탐험 기록에 추가되었어요."
                  : "컴퓨터가 먼저 3 빙고라인을 완성했어요. 다시 단어를 조합하여 도전장 보낼까요?"}
              </p>
            </div>

            <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-400">
                <span>내 최종 완성선</span>
                <span className="text-white font-extrabold">{playerBingos} 줄</span>
              </div>
              <div className="flex justify-between text-gray-400">
                <span>컴퓨터 완성선</span>
                <span className="text-white font-extrabold">{computerBingos} 줄</span>
              </div>
              {winner === 'player' && (
                <div className="border-t border-white/5 pt-1.5 flex justify-between font-black text-indigo-400 text-[11px]">
                  <span>보상 획득</span>
                  <span className="text-emerald-400">+50 XP</span>
                </div>
              )}
            </div>

            <div className="flex gap-2.5">
              <Button 
                onClick={initializeBoards}
                className="w-1/2 py-3 bg-slate-950 border border-white/10 hover:bg-slate-900 text-gray-300 font-extrabold rounded-xl text-xs"
                id="retry-bingo-quiz-game-btn"
              >
                다시 설계하기
              </Button>
              <Button 
                onClick={() => setView('home')}
                className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs"
                id="back-home-bingo-btn"
              >
                마을 홈으로
              </Button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};
