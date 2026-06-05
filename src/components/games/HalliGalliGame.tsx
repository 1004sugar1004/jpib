import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Play, 
  HelpCircle, 
  Sparkles, 
  Award,
  BellRing,
  Smartphone,
  MousePointer
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Card {
  fruit: number; // 0: 🍓, 1: 🍌, 2: 🫐, 3: 🍋
  count: number; // 1 to 5
}

const FRUITS = ['🍓', '🍌', '🫐', '🍋'];
const FRUIT_NAMES = ['딸기', '바나나', '자두', '라임'];

function makeDeck(): Card[] {
  const d: Card[] = [];
  for (let f = 0; f < 4; f++) {
    for (let n = 1; n <= 5; n++) {
      // 3 cards of each combination (60 cards total)
      for (let i = 0; i < 3; i++) {
        d.push({ fruit: f, count: n });
      }
    }
  }
  return shuffle(d);
}

function shuffle(arr: Card[]): Card[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

interface RenderCardProps {
  card: Card | null;
  label?: string;
  isCpu?: boolean;
}

const RenderCard = ({ card, label, isCpu }: RenderCardProps) => {
  if (!card) {
    return (
      <div className="w-18 h-26 sm:w-22 sm:h-30 md:w-24 md:h-34 border-2 border-dashed border-white/20 rounded-xl bg-black/20 flex flex-col items-center justify-center text-zinc-400 text-[10px] font-bold shadow-inner">
        <span className="opacity-40 text-[9px] uppercase tracking-wider">{label || '배치 대기'}</span>
      </div>
    );
  }

  const fruitChar = FRUITS[card.fruit];
  const fruitName = FRUIT_NAMES[card.fruit];

  const renderFruitContents = () => {
    const list = Array.from({ length: card.count });
    
    let gridStyle = "grid gap-1 justify-center items-center";
    if (card.count === 1) gridStyle += " grid-cols-1";
    else if (card.count === 2) gridStyle += " grid-cols-2";
    else if (card.count === 3) gridStyle += " grid-cols-3";
    else if (card.count === 4) gridStyle += " grid-cols-2_gap-1.5";
    else if (card.count === 5) gridStyle += " grid-cols-3_gap-1";

    const getGridCols = () => {
      if (card.count === 1) return "flex flex-col items-center justify-center";
      if (card.count === 2) return "grid grid-cols-2 gap-2";
      if (card.count === 3) return "grid grid-cols-3 gap-1.5";
      if (card.count === 4) return "grid grid-cols-2 gap-2";
      return "grid grid-cols-3 gap-1.5";
    };

    return (
      <div className={`${getGridCols()} p-1 max-w-full justify-items-center align-items-center`}>
        {list.map((_, i) => (
          <span 
            key={i} 
            className={`select-none hover:scale-110 transition-transform duration-200 block text-center leading-none ${
              card.count === 1 
                ? 'text-3xl sm:text-4xl' 
                : card.count >= 4 
                  ? 'text-base sm:text-xl' 
                  : 'text-xl sm:text-2xl'
            }`}
          >
            {fruitChar}
          </span>
        ))}
      </div>
    );
  };

  return (
    <div className={`w-18 h-26 sm:w-22 sm:h-30 md:w-24 md:h-34 bg-white border border-zinc-100 text-zinc-900 rounded-xl flex flex-col justify-between p-1.5 sm:p-2 shadow-xl relative select-none transform transition-all hover:scale-[1.02] hover:shadow-2xl`}>
      {/* Mini top badge */}
      <div className="flex justify-between items-center w-full">
        <span className="text-[11px] sm:text-sm font-black text-indigo-600 font-mono leading-none">{card.count}</span>
        <span className="text-[8px] sm:text-[9px] font-extrabold text-zinc-400 font-sans tracking-tight uppercase">{fruitName}</span>
      </div>

      {/* Center Fruit display */}
      <div className="flex-1 flex items-center justify-center p-0.5 overflow-hidden">
        {renderFruitContents()}
      </div>

      {/* Mini bottom inverted badge */}
      <div className="flex justify-between items-center w-full rotate-180 select-none">
        <span className="text-[11px] sm:text-sm font-black text-indigo-600 font-mono leading-none">{card.count}</span>
        <span className="text-[8px] sm:text-[9px] font-extrabold text-zinc-400 font-sans tracking-tight uppercase">{fruitName}</span>
      </div>
    </div>
  );
};

interface RenderDeckProps {
  count: number;
  label: string;
  isPlayerTurn?: boolean;
  onClick?: () => void;
  disabled?: boolean;
}

const RenderDeck = ({ count, label, isPlayerTurn, onClick, disabled }: RenderDeckProps) => {
  const hasCards = count > 0;
  const stackOffsets = count > 20 ? 3 : count > 10 ? 2 : count > 3 ? 1 : 0;

  return (
    <div className="relative select-none" style={{ paddingBottom: `${stackOffsets * 2}px` }}>
      {/* 3D Stack Effect Layers */}
      {hasCards && Array.from({ length: stackOffsets }).map((_, i) => (
        <div 
          key={i}
          className="absolute inset-0 bg-indigo-950 border border-indigo-700/20 rounded-xl pointer-events-none"
          style={{ 
            transform: `translate(${ (i + 1) * 1.5 }px, ${ (i + 1) * -1.5 }px)`,
            zIndex: -1 - i
          }}
        />
      ))}

      <button
        type="button"
        disabled={disabled || !hasCards}
        onClick={onClick}
        className={`w-18 h-26 sm:w-22 sm:h-30 md:w-24 md:h-34 rounded-xl flex flex-col justify-between p-1.5 sm:p-2 shadow-lg transition-all border outline-none select-none relative ${
          hasCards 
            ? isPlayerTurn
              ? 'bg-gradient-to-br from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 border-amber-300 cursor-pointer hover:shadow-amber-500/10 hover:scale-105 active:scale-95'
              : 'bg-gradient-to-br from-indigo-700 to-indigo-950 border-indigo-500/30'
            : 'bg-zinc-950/40 border-white/5 border-dashed cursor-not-allowed'
        }`}
      >
        {hasCards ? (
          <>
            {/* Cards remaining display */}
            <div className={`text-[9px] sm:text-[10px] px-1.5 py-0.5 rounded-full font-black font-mono leading-none bg-black/25 ${
              isPlayerTurn ? 'text-amber-950' : 'text-indigo-200'
            }`}>
              {count}장
            </div>

            {/* Middle visual icon */}
            <div className="flex-1 flex flex-col items-center justify-center my-1 select-none">
              <span className={`text-[11px] sm:text-[12px] font-black uppercase tracking-wider ${
                isPlayerTurn ? 'text-amber-950' : 'text-indigo-200'
              }`}>
                {isPlayerTurn ? 'TAP' : 'IB봇'}
              </span>
              <span className={`text-xl sm:text-2xl leading-none my-0.5 animate-pulse`}>
                {isPlayerTurn ? '✨' : '📚'}
              </span>
              <span className={`text-[8px] font-bold uppercase tracking-widest ${
                isPlayerTurn ? 'text-amber-900' : 'text-indigo-400'
              }`}>
                {label}
              </span>
            </div>

            {/* Bottom notification */}
            <div className={`text-[7px] sm:text-[8px] font-extrabold uppercase py-0.5 px-1.5 rounded bg-black/10 tracking-widest ${
              isPlayerTurn ? 'text-amber-950' : 'text-indigo-400'
            }`}>
              {isPlayerTurn ? '뒤집기' : '대기중'}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-center">
            <span className="text-lg">🫙</span>
            <span className="text-[7px] font-bold text-zinc-500 mt-1 uppercase leading-none">카드 소진</span>
          </div>
        )}
      </button>
    </div>
  );
};

export const HalliGalliGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [cpuDeck, setCpuDeck] = useState<Card[]>([]);
  const [playerPlayed, setPlayerPlayed] = useState<Card[]>([]);
  const [cpuPlayed, setCpuPlayed] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'cpu'>('player');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'cpu' | null>(null);

  const [message, setMessage] = useState<string>('카드를 뒤집어 시작하세요! 👇');
  const [toastText, setToastText] = useState<{ main: string; sub: string } | null>(null);
  
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  const cpuActionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingBellRef = useRef<boolean>(false);

  // Latest state refs to solve asynchronous stale closure errors
  const playerDeckRef = useRef<Card[]>([]);
  const cpuDeckRef = useRef<Card[]>([]);
  const playerPlayedRef = useRef<Card[]>([]);
  const cpuPlayedRef = useRef<Card[]>([]);
  const currentTurnRef = useRef<'player' | 'cpu'>('player');
  const gameOverRef = useRef<boolean>(false);

  // Synchronize state with latest state refs
  useEffect(() => { playerDeckRef.current = playerDeck; }, [playerDeck]);
  useEffect(() => { cpuDeckRef.current = cpuDeck; }, [cpuDeck]);
  useEffect(() => { playerPlayedRef.current = playerPlayed; }, [playerPlayed]);
  useEffect(() => { cpuPlayedRef.current = cpuPlayed; }, [cpuPlayed]);
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);

  // Play synthetic beeps so there are no network delay or loading issues on schools iPads!
  const playSound = useCallback((type: 'beep' | 'win' | 'fail' | 'flip') => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      const ctx = new AudioContextClass();
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);

      if (type === 'beep') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.15);
        osc.stop(ctx.currentTime + 0.15);
      } else if (type === 'win') {
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'fail') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'flip') {
        osc.type = 'sine';
        osc.frequency.setValueAtTime(350, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(450, ctx.currentTime + 0.08);
        gain.gain.setValueAtTime(0.05, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.08);
        osc.stop(ctx.currentTime + 0.08);
      }
    } catch (e) {
      console.log('Synth play error', e);
    }
  }, [isMuted]);

  const initGame = useCallback(() => {
    if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);
    processingBellRef.current = false;
    setGameOver(false);
    setWinner(null);
    setToastText(null);

    const full = makeDeck();
    const initPlayer = full.slice(0, 30);
    const initCpu = full.slice(30, 60);

    playerDeckRef.current = initPlayer;
    cpuDeckRef.current = initCpu;
    playerPlayedRef.current = [];
    cpuPlayedRef.current = [];
    currentTurnRef.current = 'player';
    gameOverRef.current = false;

    setPlayerDeck(initPlayer);
    setCpuDeck(initCpu);
    setPlayerPlayed([]);
    setCpuPlayed([]);
    setCurrentTurn('player');
    setGameState('PLAYING');
    setMessage('내 차례 — 카드를 뒤집으세요! 👇');
  }, []);

  const getTopFruitCounts = useCallback(() => {
    const counts: Record<number, number> = {};
    const tops = [
      playerPlayedRef.current.length > 0 ? playerPlayedRef.current[playerPlayedRef.current.length - 1] : null,
      cpuPlayedRef.current.length > 0 ? cpuPlayedRef.current[cpuPlayedRef.current.length - 1] : null,
    ].filter(Boolean) as Card[];

    tops.forEach(c => {
      counts[c.fruit] = (counts[c.fruit] || 0) + c.count;
    });
    return counts;
  }, []);

  const hasFiveActive = useCallback(() => {
    return Object.values(getTopFruitCounts()).some(v => v === 5);
  }, [getTopFruitCounts]);

  const triggerConfetti = () => {
    confetti({
      particleCount: 50,
      spread: 60,
      origin: { y: 0.75 },
      colors: ['#fbbf24', '#f59e0b', '#10b981', '#3b82f6']
    });
  };

  const showToast = (main: string, sub: string, dur: number = 1800) => {
    setToastText({ main, sub });
    setTimeout(() => {
      setToastText(prev => prev && prev.main === main ? null : prev);
    }, dur);
  };

  const checkElimination = useCallback((pDeckLen: number, cDeckLen: number, pPlayedLen: number, cPlayedLen: number) => {
    const pTotal = pDeckLen + pPlayedLen;
    const cTotal = cDeckLen + cPlayedLen;

    if (pTotal === 0) {
      setWinner('cpu');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('fail');
      return true;
    }
    if (cTotal === 0) {
      setWinner('player');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('win');
      triggerConfetti();
      return true;
    }
    return false;
  }, [playSound]);

  // Declared clean non-closure recursive handlers
  const ringBell = (who: 'player' | 'cpu') => {
    if (gameOverRef.current || processingBellRef.current) return;
    const pPlayed = playerPlayedRef.current;
    const cPlayed = cpuPlayedRef.current;
    if (pPlayed.length + cPlayed.length === 0) return;

    processingBellRef.current = true;
    if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);

    setIsRinging(true);
    playSound('beep');
    setTimeout(() => setIsRinging(false), 250);

    const correct = hasFiveActive();
    const allCards = [...pPlayed, ...cPlayed];

    let nextPlayerDeck = [...playerDeckRef.current];
    let nextCpuDeck = [...cpuDeckRef.current];
    let nextPlayerPlayed: Card[] = [];
    let nextCpuPlayed: Card[] = [];

    if (correct) {
      const shuffledWin = shuffle(allCards);
      if (who === 'player') {
        nextPlayerDeck = [...nextPlayerDeck, ...shuffledWin];
        setPlayerDeck(nextPlayerDeck);
        showToast('🎉 정답!', `바닥의 카드 ${allCards.length}장을 획득했습니다!`);
        setMessage(`정답! 내가 카드 ${allCards.length}장 획득! 🌟`);
        setCurrentTurn('player');
        currentTurnRef.current = 'player';
      } else {
        nextCpuDeck = [...nextCpuDeck, ...shuffledWin];
        setCpuDeck(nextCpuDeck);
        showToast('🤖 IB봇 선착!', 'IB봇이 먼저 종을 쳤습니다!');
        setMessage('IB봇 선착! 카드를 뺏겼습니다 😭');
        setCurrentTurn('cpu');
        currentTurnRef.current = 'cpu';
      }
      setPlayerPlayed([]);
      setCpuPlayed([]);
      playerPlayedRef.current = [];
      cpuPlayedRef.current = [];
      playSound('win');
    } else {
      playSound('fail');
      if (who === 'player') {
        const shuffledToCpu = shuffle(allCards);
        nextCpuDeck = [...nextCpuDeck, ...shuffledToCpu];
        
        let penaltyDesc = '';
        if (nextPlayerDeck.length > 0) {
          const penaltyCard = nextPlayerDeck.shift()!;
          nextCpuDeck.push(penaltyCard);
          penaltyDesc = ' (추가 1장 제공)';
        }
        setPlayerDeck(nextPlayerDeck);
        setCpuDeck(nextCpuDeck);
        showToast('❌ 틀렸습니다!', `5개가 아닙니다! IB봇에게 카드 제공${penaltyDesc}`);
        setMessage('실수! 오답 패널티를 냈습니다 😢');
        setCurrentTurn('player');
        currentTurnRef.current = 'player';
      } else {
        const shuffledToPlayer = shuffle(allCards);
        nextPlayerDeck = [...nextPlayerDeck, ...shuffledToPlayer];

        let penaltyDesc = '';
        if (nextCpuDeck.length > 0) {
          const penaltyCard = nextCpuDeck.shift()!;
          nextPlayerDeck.push(penaltyCard);
          penaltyDesc = ' (추가 1장 획득)';
        }
        setPlayerDeck(nextPlayerDeck);
        setCpuDeck(nextCpuDeck);
        showToast('🤖 IB봇 오답!', `IB봇 실수! 카드를 몽땅 얻었습니다!${penaltyDesc}`);
        setMessage('IB봇 오답! 기회가 찾아왔습니다! 🎉');
        setCurrentTurn('cpu');
        currentTurnRef.current = 'cpu';
      }
      setPlayerPlayed([]);
      setCpuPlayed([]);
      playerPlayedRef.current = [];
      cpuPlayedRef.current = [];
    }

    // Sync refs instantly before state finishes setting to prevent race conditions
    playerDeckRef.current = nextPlayerDeck;
    cpuDeckRef.current = nextCpuDeck;

    const isFinished = checkElimination(
      nextPlayerDeck.length,
      nextCpuDeck.length,
      nextPlayerPlayed.length,
      nextCpuPlayed.length
    );

    if (!isFinished) {
      setTimeout(() => {
        processingBellRef.current = false;
        if (who === 'cpu' || !correct) {
          if (correct) { // CPU won match, then it plays again
            triggerCpuFlip();
          }
        }
      }, 1500);
    }
  };

  const triggerCpuFlip = () => {
    if (gameOverRef.current) return;
    if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);

    cpuActionTimerRef.current = setTimeout(() => {
      const activeCpuDeck = cpuDeckRef.current;
      if (activeCpuDeck.length === 0) {
        setCurrentTurn('player');
        currentTurnRef.current = 'player';
        setMessage('IB봇 카드 바닥남! 내 차례입니다.');
        return;
      }
      
      const nextCpuDeck = [...activeCpuDeck];
      const card = nextCpuDeck.shift()!;
      setCpuDeck(nextCpuDeck);
      cpuDeckRef.current = nextCpuDeck;

      const nextCpuPlayed = [...cpuPlayedRef.current, card];
      setCpuPlayed(nextCpuPlayed);
      cpuPlayedRef.current = nextCpuPlayed;

      playSound('flip');
      setCurrentTurn('player');
      currentTurnRef.current = 'player';

      const tops = {
        player: playerPlayedRef.current.length > 0 ? playerPlayedRef.current[playerPlayedRef.current.length - 1] : null,
        cpu: card
      };
      
      const totalCounts: Record<number, number> = {};
      if (tops.player) totalCounts[tops.player.fruit] = (totalCounts[tops.player.fruit] || 0) + tops.player.count;
      totalCounts[tops.cpu.fruit] = (totalCounts[tops.cpu.fruit] || 0) + tops.cpu.count;
      const hasFive = Object.values(totalCounts).some(v => v === 5);

      if (hasFive) {
        setMessage('🔔 한 과일이 정확히 5개! 빨리 종을 누르세요!');
        // AI reaction timer
        const reactTime = 1300 + Math.random() * 1100;
        if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);
        cpuActionTimerRef.current = setTimeout(() => {
          ringBell('cpu');
        }, reactTime);
      } else {
        setMessage('내 차례 — 카드를 뒤집으세요! 👇');
      }
    }, 1200 + Math.random() * 800);
  };

  const playerFlip = () => {
    if (gameOverRef.current || processingBellRef.current || currentTurnRef.current !== 'player') return;
    const activePlayerDeck = playerDeckRef.current;
    if (activePlayerDeck.length === 0) return;

    const nextPlayerDeck = [...activePlayerDeck];
    const card = nextPlayerDeck.shift()!;
    setPlayerDeck(nextPlayerDeck);
    playerDeckRef.current = nextPlayerDeck;

    const nextPlayerPlayed = [...playerPlayedRef.current, card];
    setPlayerPlayed(nextPlayerPlayed);
    playerPlayedRef.current = nextPlayerPlayed;

    playSound('flip');
    setCurrentTurn('cpu');
    currentTurnRef.current = 'cpu';
    setMessage('IB봇이 차례를 진행 중입니다... 🤖');

    // Assess 5 condition immediately
    const tops = {
      player: card,
      cpu: cpuPlayedRef.current.length > 0 ? cpuPlayedRef.current[cpuPlayedRef.current.length - 1] : null
    };
    const totalCounts: Record<number, number> = {};
    totalCounts[tops.player.fruit] = (totalCounts[tops.player.fruit] || 0) + tops.player.count;
    if (tops.cpu) totalCounts[tops.cpu.fruit] = (totalCounts[tops.cpu.fruit] || 0) + tops.cpu.count;
    const hasFive = Object.values(totalCounts).some(v => v === 5);

    if (hasFive) {
      setMessage('🔔 한 과일이 정확히 5개! 빨리 종을 누르세요!');
      
      // AI Reaction
      const reactTime = 1300 + Math.random() * 1100;
      if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);
      cpuActionTimerRef.current = setTimeout(() => {
        ringBell('cpu');
      }, reactTime);
    } else {
      triggerCpuFlip();
    }
  };

  // Keyboard accessibility
  const ringBellStaticRef = useRef(ringBell);
  const playerFlipStaticRef = useRef(playerFlip);
  useEffect(() => { ringBellStaticRef.current = ringBell; });
  useEffect(() => { playerFlipStaticRef.current = playerFlip; });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        ringBellStaticRef.current('player');
      }
      if (e.code === 'Enter' || e.code === 'ArrowRight') {
        e.preventDefault();
        playerFlipStaticRef.current();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      if (cpuActionTimerRef.current) clearTimeout(cpuActionTimerRef.current);
    };
  }, []);

  // Counts for visible items
  const activeTally = getTopFruitCounts();

  return (
    <div className="w-full h-full bg-[#124d1e] text-white flex flex-col justify-between selection:bg-none relative font-sans overflow-hidden">
      
      {/* Felt background texture simulation */}
      <div className="absolute inset-0 bg-radial-at-c from-[#1d7c35] to-[#0a3313] opacity-90 pointer-events-none z-0" />

      {/* HEADER BAR */}
      <header className="px-4 py-2 border-b border-white/10 z-10 flex items-center justify-between bg-black/20">
        <div className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/xe54lqW.png" 
            alt="HalliGalli Icon" 
            referrerPolicy="no-referrer"
            className="w-8 h-8 object-contain bg-white/10 p-1 rounded-lg"
          />
          <div>
            <h1 className="text-xs md:text-sm font-black tracking-tight leading-none text-amber-300">신나는 한글 할리갈리</h1>
            <p className="text-[9px] text-[#86efac] font-bold mt-0.5 sm:mt-1">바닥 과일 합계가 무조건 5개면 종을 칩니다!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setShowHelp(p => !p)}
            className="p-1 px-2.5 rounded-lg bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600/30 text-[10px] font-bold flex items-center gap-1 transition-all"
            id="halli-help-btn"
          >
            <HelpCircle className="w-3 h-3 text-amber-300" />
            <span>도움말</span>
          </button>
          <button 
            onClick={() => setIsMuted(prev => !prev)}
            className="p-1 bg-emerald-800/80 hover:bg-emerald-700/80 border border-emerald-600/30 rounded-lg text-emerald-300 transition-all cursor-pointer"
            id="halli-sound-btn"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      </header>

      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 text-center z-10 max-w-sm mx-auto overflow-y-auto">
          <div className="w-16 h-16 bg-white/10 backdrop-blur-md rounded-2xl flex items-center justify-center mb-3.5 border border-white/20 shadow">
            <img 
              src="https://i.imgur.com/xe54lqW.png" 
              alt="HalliGalli Bell" 
              referrerPolicy="no-referrer"
              className="w-12 h-12 object-contain"
            />
          </div>
          <h2 className="text-lg font-black text-amber-200 mb-1 leading-snug">실시간 과일 세기 대결</h2>
          <p className="text-[11px] text-emerald-200 font-bold mb-4 leading-relaxed">
            바닥에 공개된 카드 중 같은 종류 과일 수의 합이 <br/>
            <span className="text-amber-300 font-black">정확히 5개</span>가 되는 순간!<br/>
            재빨리 황금색 벨 🛎️ 을 터치하세요!
          </p>

          <div className="w-full bg-zinc-950/40 p-3 rounded-xl border border-white/5 space-y-1.5 text-left text-[10px] text-zinc-300 mb-4 font-semibold leading-tight">
            <p className="font-extrabold text-[#ca8a04]">📱 터치 및 클릭 조작 안내</p>
            <p>• <b>카드 뒤집기</b>: 내 덱 📚 카드 스택을 가볍게 탭합니다.</p>
            <p>• <b>종 치기</b>: 가운데 동그란 황금 벨 🛎️ 을 곧바로 터치합니다.</p>
            <p>• <b>정답</b>: 카드를 모두 가져갑니다. 오답 시 1장 패널티가 발생해요!</p>
          </div>

          <Button 
            onClick={initGame}
            icon={Play}
            className="py-3 px-8 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl w-full border-b-4 border-amber-800 shadow-lg active:scale-95 transition-all"
            id="start-halligalli-btn"
          >
            대결 시작하기
          </Button>
        </div>
      )}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col justify-between p-2.5 sm:p-4 relative z-10 h-full overflow-y-auto">
          
          {/* 1. CPU (IB봇) MINI BAR */}
          <div className="flex items-center justify-between bg-black/25 border border-white/5 px-3 py-1.5 rounded-xl gap-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-orange-600 flex items-center justify-center font-extrabold shadow text-sm">🤖</div>
              <div>
                <h4 className="text-2xs sm:text-xs font-black leading-none">IB봇 (CPU)</h4>
                <p className="text-[9px] text-[#86efac] mt-0.5 font-bold">
                  총 보유: <span className="text-amber-300 font-extrabold">{cpuDeck.length + cpuPlayed.length}장</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-extrabold transition-all ${
                currentTurn === 'cpu' 
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse' 
                  : 'text-zinc-500 opacity-50'
              }`}>
                {currentTurn === 'cpu' ? '● 생각하는 중...' : '대기 중'}
              </div>
            </div>
          </div>

          {/* 2. REAL TABLE FELT (The Heart of Halli Galli) */}
          <div className="flex-1 my-3 bg-emerald-950/40 border border-green-800/20 rounded-2xl p-3 flex flex-col justify-between items-center relative overflow-hidden shadow-inner">
            
            {/* Top Field: CPU Open/Closed Cards */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 w-full pt-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">상대 카드 덱</span>
                <RenderDeck count={cpuDeck.length} label="IB 봇" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">상대 공개 카드</span>
                <RenderCard card={cpuPlayed.length > 0 ? cpuPlayed[cpuPlayed.length - 1] : null} label="빈 필드" />
              </div>
            </div>

            {/* Middle: THE GOLDEN BELL & STATUS SHIPS */}
            <div className="w-full flex flex-col items-center justify-center py-2 relative z-20">
              
              {/* Overlaid Gold Bell Dome with dynamic ring effects */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => ringBell('player')}
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-full cursor-pointer bg-gradient-to-t from-zinc-300 via-zinc-100 to-white hover:from-white hover:to-zinc-100 shadow-2xl border-4 border-zinc-400 flex items-center justify-center relative select-none"
                animate={isRinging ? { scale: [1, 1.15, 0.95, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.2 }}
                id="halligalli-bell-dome"
              >
                {/* Brass bell center core */}
                <div className="w-14 h-14 sm:w-18 sm:h-18 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-700 border border-amber-300 flex items-center justify-center shadow-inner">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-b from-zinc-700 to-zinc-950 border border-zinc-600 flex items-center justify-center shadow shadow-inner text-[10px] sm:text-xs">🛎️</div>
                </div>

                {/* Blinking yellow beacon if sum equals 5 */}
                {hasFiveActive() && (
                  <div className="absolute -inset-2.5 rounded-full border-4 border-amber-400 animate-ping opacity-75 pointer-events-none" />
                )}
              </motion.button>
              
              {/* TOUCH INDICATOR */}
              <span className={`text-[8px] sm:text-[9px] font-black tracking-widest mt-2 px-2.5 py-0.5 bg-black/45 hover:bg-black/60 rounded-full cursor-pointer select-none border border-white/5 transition-all ${
                hasFiveActive() ? 'text-amber-300 animate-bounce' : 'text-emerald-400'
              }`} onClick={() => ringBell('player')}>
                {hasFiveActive() ? '🔔 지금!! 터치하여 종 치기 🔔' : '터치하여 종 치기 🛎️'}
              </span>

            </div>

            {/* Bottom Field: Player Open/Closed Cards */}
            <div className="flex items-center justify-center gap-6 sm:gap-10 w-full pb-1">
              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">내 공개 카드</span>
                <RenderCard card={playerPlayed.length > 0 ? playerPlayed[playerPlayed.length - 1] : null} label="빈 필드" />
              </div>

              <div className="flex flex-col items-center gap-1">
                <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-wider">내 카드 덱</span>
                <RenderDeck 
                  count={playerDeck.length} 
                  label="카드 뒤집기" 
                  isPlayerTurn={currentTurn === 'player'} 
                  onClick={playerFlip}
                  disabled={currentTurn !== 'player' || playerDeck.length === 0}
                />
              </div>
            </div>

          </div>

          {/* 3. LIVE FIELD STATUS CHIPS (Displays current totals in a sleek bar) */}
          <div className="mb-2 p-2 bg-black/25 border border-white/5 rounded-xl">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-emerald-200 block text-center mb-1.5">과일 종류별 실시간 바닥 누적 합계</span>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 justify-center">
              {FRUITS.map((f, idx) => {
                const count = activeTally[idx] || 0;
                const isFive = count === 5;
                return (
                  <div 
                    key={idx}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 sm:px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                      isFive 
                        ? 'bg-amber-400 border border-amber-500 text-slate-950 scale-102 shadow-md animate-pulse' 
                        : 'bg-emerald-950/60 border border-green-905/20 text-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-1">
                      <span className="text-xs sm:text-sm leading-none">{f}</span>
                      <span className="hidden md:inline text-[8px] font-bold opacity-75">{FRUIT_NAMES[idx]}</span>
                    </div>
                    <span className={`text-[10px] sm:text-xs font-black ${isFive ? 'text-indigo-900' : 'text-amber-200'}`}>
                      {count}개
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* 4. EVENT MESSAGE LOG */}
          <div className="text-center bg-zinc-950/60 py-1.5 px-4 rounded-xl max-w-sm mx-auto mb-2 border border-white/5 flex items-center justify-center gap-1.5 shadow">
            <p className="text-[8px] text-emerald-500 font-black animate-pulse">●</p>
            <p className="text-[10px] text-emerald-100 font-extrabold leading-tight">{message}</p>
          </div>

          {/* 5. PLAYER MINI BAR */}
          <div className="flex items-center justify-between bg-black/25 border border-white/5 px-3 py-1.5 rounded-xl gap-2 w-full">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 flex items-center justify-center font-extrabold shadow text-sm">👦</div>
              <div>
                <h4 className="text-2xs sm:text-xs font-black leading-none font-sans text-indigo-300">나 (학습자)</h4>
                <p className="text-[9px] text-[#86efac] mt-0.5 font-bold">
                  총 보유: <span className="text-amber-300 font-extrabold">{playerDeck.length + playerPlayed.length}장</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2.5">
              <div className={`px-2 py-0.5 rounded-full text-[9px] font-bold transition-all ${
                currentTurn === 'player' ? 'bg-amber-400 text-slate-950 font-black animate-pulse' : 'text-zinc-500 opacity-40'
              }`}>
                {currentTurn === 'player' ? '내 차례! 카드를 클릭하세요' : '상대 턴'}
              </div>
            </div>
          </div>

          {/* 6. BOTTOM ACTIONS */}
          <div className="flex gap-2.5 mt-2.5 font-bold text-[11px]">
            <button
              onClick={initGame}
              className="px-3 py-2.5 bg-[#0e3b16] hover:bg-[#154d20] text-emerald-100 border border-emerald-700/50 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
              id="halligalli-reset-bottom-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>처음부터 세기</span>
            </button>
            <button
              onClick={playerFlip}
              disabled={currentTurn !== 'player' || playerDeck.length === 0}
              className={`flex-1 py-2.5 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600 border-b-2 border-amber-700 rounded-xl flex items-center justify-center gap-1 transition-all font-black select-none ${
                currentTurn === 'player' ? 'cursor-pointer' : 'opacity-35 cursor-not-allowed text-zinc-500'
              }`}
              id="halligalli-flip-bottom-btn"
            >
              <span>내 카드 한장 뒤집기 (Enter / 덱 클릭) ▶</span>
            </button>
          </div>

        </div>
      )}

      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center max-w-sm mx-auto z-10 overflow-y-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-zinc-950/40 border border-white/10 flex items-center justify-center shadow-lg mb-4 text-3xl">
            {winner === 'player' ? '🏆' : '👾'}
          </div>
          <h2 className="text-xl font-black mb-1.5 text-amber-200">
            {winner === 'player' ? '축하합니다! 대승리!' : '아쉬운 대결 패배!'}
          </h2>
          <p className="text-[11px] text-zinc-300 font-semibold mb-6 max-w-[280px] leading-relaxed">
            {winner === 'player' 
              ? 'IB봇의 카드를 완벽하게 모두 빼앗았습니다! 엄청난 연산과 터치 속도입니다!' 
              : 'IB봇이 모든 카드를 휩쓸어갔습니다. 집중력을 발휘해 5개를 찾아보세요!'}
          </p>

          <Button 
            onClick={initGame}
            icon={RefreshCw}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black py-3 rounded-xl shadow-lg border-b-4 border-amber-700 active:scale-95 cursor-pointer"
            id="halligalli-restart-end-btn"
          >
            다시 도전하기
          </Button>
        </div>
      )}

      {/* FLOATING REAL-TIME TOAST / ALERT */}
      <AnimatePresence>
        {toastText && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: -20 }}
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/95 border-2 border-amber-500/60 p-4 rounded-2xl text-center shadow-2xl z-50 max-w-[250px] w-full"
          >
            <h3 className="text-sm font-black text-amber-300 flex items-center justify-center gap-1">
              <Sparkles className="w-4 h-4 fill-current shrink-0 text-amber-400" />
              <span>{toastText.main}</span>
            </h3>
            <p className="text-[10px] text-zinc-300 font-bold mt-1.5 leading-snug">
              {toastText.sub}
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* IN-GAME EXPLANARY HELPMENU MODAL */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-4 text-center z-50 backdrop-blur-sm"
          >
            <div className="bg-[#123119] border border-green-800 p-5 rounded-2xl max-w-xs w-full text-left relative shadow-2xl">
              <button 
                onClick={() => setShowHelp(false)}
                className="absolute top-2.5 right-2.5 text-zinc-400 hover:text-white p-1 rounded-lg bg-emerald-950"
              >
                ✕ 닫기
              </button>
              <div className="flex items-center gap-2 mb-3.5">
                <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-300 shrink-0">
                  <HelpCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-amber-100">할리갈리 조작법 완벽 가이드</h3>
                  <p className="text-[8px] text-[#86efac] font-bold">학생 태블릿에 특화된 반응형 UI</p>
                </div>
              </div>

              <div className="space-y-3.5 text-[10px] text-zinc-200">
                <div className="p-2 rounded-xl bg-emerald-950/40 border border-green-800/20">
                  <h4 className="font-extrabold text-amber-300 mb-0.5 flex items-center gap-1">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    📱 태블릿 (터치스크린)
                  </h4>
                  <p className="leading-normal pl-0.5">
                    • <b>바닥 내 덱 📚</b>을 직접 탭해서 손쉽게 다음 카드를 뒤집으세요.<br/>
                    • 과일 합계가 <b>정확히 5개</b>가 되는 순간 즉시 <b>가운데 벨 🛎️</b>을 손가락으로 누릅니다.
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-emerald-950/40 border border-green-800/20">
                  <h4 className="font-extrabold text-amber-300 mb-0.5 flex items-center gap-1">
                    <MousePointer className="w-3.5 h-3.5 shrink-0" />
                    💻 컴퓨터 (PC 및 키보드 단축키)
                  </h4>
                  <p className="leading-normal pl-0.5">
                    • <b>[SPACE]</b> 스페이스바 키를 눌러 초스피드로 벨을 칠 수 있습니다.<br/>
                    • <b>[ENTER]</b> 또는 <b>[→ 오른쪽 방향키]</b>로 우회 카드를 뒤집을 수 있습니다!
                  </p>
                </div>

                <div className="p-2 rounded-xl bg-amber-950/30 border border-amber-900/30 text-amber-200">
                  <p className="leading-normal">
                    💡 <b>과일 세기 연습 팁!</b> 바닥에 펼쳐진 카드 과일 수가 정확하게 도합 5개가 되면 tally 가 실시간으로 주황색 불빛에 리듬 있게 깜빡이니 보고 연습해 보세요!
                  </p>
                </div>
              </div>

              <button 
                onClick={() => setShowHelp(false)}
                className="w-full mt-4 py-2 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 font-black text-2xs rounded-xl shadow cursor-pointer"
              >
                닫고 게임으로 복귀하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
