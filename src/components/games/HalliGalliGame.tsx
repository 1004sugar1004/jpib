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
import { quizQuestions } from '../../content';

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
  playedCount?: number;
}

const RenderCard = ({ card, label, isCpu, playedCount = 0 }: RenderCardProps) => {
  if (!card) {
    return (
      <div className="w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 border-2 border-dashed border-white/20 rounded-xl bg-black/20 flex flex-col items-center justify-center text-zinc-400 text-[10px] sm:text-xs font-bold shadow-inner animate-pulse">
        <span className="opacity-40 text-[9px] uppercase tracking-wider">{label || '배치 대기'}</span>
      </div>
    );
  }

  const fruitChar = FRUITS[card.fruit];
  const fruitName = FRUIT_NAMES[card.fruit];

  const renderFruitContents = () => {
    const list = Array.from({ length: card.count });
    
    const getGridCols = () => {
      if (card.count === 1) return "flex items-center justify-center";
      if (card.count === 2) return "grid grid-cols-2 gap-2 sm:gap-3";
      if (card.count === 3) return "grid grid-cols-3 gap-1 sm:gap-1.5";
      if (card.count === 4) return "grid grid-cols-2 gap-2 sm:gap-2.5";
      return "grid grid-cols-3 gap-1 sm:gap-1.5";
    };

    return (
      <div className={`${getGridCols()} w-full max-w-full justify-items-center items-center`}>
        {list.map((_, i) => (
          <span 
            key={i} 
            className={`select-none hover:scale-110 transition-transform duration-200 block text-center leading-none ${
              card.count === 1 
                ? 'text-4xl sm:text-5xl md:text-6xl' 
                : card.count === 2
                  ? 'text-3xl sm:text-4xl' 
                  : card.count === 3
                    ? 'text-2xl sm:text-3xl'
                    : 'text-xl sm:text-2xl'
            }`}
          >
            {fruitChar}
          </span>
        ))}
      </div>
    );
  };

  // Number of background stacked card visuals
  const numVisualCards = Math.min(playedCount - 1, 8);

  // Exact vertical stacking offset for an organized clean look (no chaotic rotation)
  const stackPositions = [
    { x: 1, y: 1.5, r: 0 },
    { x: 2, y: 3, r: 0 },
    { x: 3, y: 4.5, r: 0 },
    { x: 4, y: 6, r: 0 },
    { x: 5, y: 7.5, r: 0 },
    { x: 6, y: 9, r: 0 },
    { x: 7, y: 10.5, r: 0 },
    { x: 8, y: 12, r: 0 }
  ];

  return (
    <div className="relative">
      {/* 바닥에 흐트러짐 없이 정론하게 정렬되어 깊이감을 주는 카드 레이어들 */}
      {numVisualCards > 0 && Array.from({ length: numVisualCards }).map((_, i) => {
        const pos = stackPositions[i % stackPositions.length];
        return (
          <div 
            key={i}
            className="absolute inset-0 bg-zinc-50 border border-zinc-200 rounded-xl shadow-[2px_4px_10px_rgba(0,0,0,0.12)] pointer-events-none"
            style={{ 
              transform: `translate(${pos.x}px, ${pos.y}px) rotate(${pos.r}deg)`,
              zIndex: -1 - i,
              opacity: Math.max(0.6, 0.95 - (i * 0.06))
            }}
          />
        );
      })}

      <div className={`w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 bg-white border border-zinc-200 text-zinc-900 rounded-xl flex flex-col justify-between p-2 sm:p-3 shadow-xl relative select-none transform transition-all hover:scale-[1.02] hover:shadow-2xl`}>
        {/* Mini top badge */}
        <div className="flex justify-between items-center w-full">
          <span className="text-xs sm:text-base font-black text-indigo-600 font-mono leading-none">{card.count}</span>
          <span className="text-[8px] sm:text-[10px] font-extrabold text-zinc-400 font-sans tracking-tight uppercase">{fruitName}</span>
        </div>

        {/* Center Fruit display */}
        <div className="flex-1 flex items-center justify-center p-0.5 overflow-hidden">
          {renderFruitContents()}
        </div>

        {/* Mini bottom inverted badge */}
        <div className="flex justify-between items-center w-full rotate-180 select-none">
          <span className="text-xs sm:text-base font-black text-indigo-600 font-mono leading-none">{card.count}</span>
          <span className="text-[8px] sm:text-[10px] font-extrabold text-zinc-400 font-sans tracking-tight uppercase">{fruitName}</span>
        </div>

        {/* 바닥에 깔린 총 개수 서브 알림배지 */}
        {playedCount > 0 && (
          <div className="absolute -bottom-2 -right-2 bg-rose-600 border border-white text-[8px] sm:text-[9px] font-black text-white px-2 py-0.5 rounded-full shadow-md z-35 transform hover:scale-110 transition-transform">
            {playedCount}장 쌓임
          </div>
        )}
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
  isPlayer?: boolean;
}

const RenderDeck = ({ count, label, isPlayerTurn, onClick, disabled, isPlayer }: RenderDeckProps) => {
  const hasCards = count > 0;
  const stackOffsets = count > 20 ? 5 : count > 10 ? 3 : count > 3 ? 2 : count > 0 ? 1 : 0;

  return (
    <div className="relative select-none" style={{ paddingBottom: `${stackOffsets * 3}px` }}>
      {/* 3D Stack Effect Layers */}
      {hasCards && Array.from({ length: stackOffsets }).map((_, i) => (
        <div 
          key={i}
          className={`absolute inset-0 border rounded-xl pointer-events-none ${
            isPlayer ? 'bg-amber-800/80 border-amber-600/30' : 'bg-indigo-950 border-indigo-700/20'
          }`}
          style={{ 
            transform: `translate(${ (i + 1) * 2 }px, ${ (i + 1) * -2 }px)`,
            zIndex: -1 - i
          }}
        />
      ))}

      <button
        type="button"
        disabled={disabled || !hasCards}
        onClick={onClick}
        className={`w-20 h-28 sm:w-24 sm:h-34 md:w-28 md:h-40 rounded-xl flex flex-col justify-between p-2 sm:p-3 shadow-lg transition-all border outline-none select-none relative ${
          hasCards 
            ? isPlayer
              ? `bg-gradient-to-br from-amber-400 to-amber-500 border-amber-300 ${isPlayerTurn ? 'cursor-pointer ring-4 ring-amber-300/40 scale-102 shadow-amber-500/10' : 'opacity-85'}`
              : 'bg-gradient-to-br from-indigo-700 to-indigo-950 border-indigo-500/30'
            : 'bg-zinc-950/40 border-white/5 border-dashed cursor-not-allowed'
        }`}
      >
        {hasCards ? (
          <>
            {/* Cards remaining display */}
            <div className={`text-[8px] sm:text-[10px] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-black font-mono leading-none bg-black/25 ${
              isPlayer ? 'text-amber-950 font-black' : 'text-indigo-200'
            }`}>
              {count}장
            </div>

            {/* Middle visual icon */}
            <div className="flex-1 flex flex-col items-center justify-center my-1 select-none">
              <span className={`text-[10px] sm:text-xs font-black uppercase tracking-wider ${
                isPlayer ? 'text-amber-950 font-black' : 'text-indigo-200'
              }`}>
                {isPlayer ? (isPlayerTurn ? 'TAP!' : '대기중') : 'IB봇'}
              </span>
              <span className={`text-2xl sm:text-3xl leading-none my-1 ${isPlayerTurn ? 'animate-bounce' : 'animate-pulse'}`}>
                {isPlayer ? '✨' : '📚'}
              </span>
              <span className={`text-[8px] font-black uppercase tracking-widest ${
                isPlayer ? 'text-amber-900 font-extrabold' : 'text-indigo-400'
              }`}>
                {label}
              </span>
            </div>

            {/* Bottom notification */}
            <div className={`text-[7px] sm:text-[8px] font-black uppercase py-0.5 sm:py-1 px-1.5 sm:px-2.5 rounded bg-black/10 tracking-widest ${
              isPlayer ? 'text-amber-950 font-black' : 'text-indigo-400'
            }`}>
              {isPlayer ? (isPlayerTurn ? '뒤집기' : '내 차례 대기') : '대기중'}
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-zinc-600 text-center">
            <span className="text-2xl">🫙</span>
            <span className="text-[8px] font-bold text-zinc-500 mt-1 uppercase leading-none">카드 소진</span>
          </div>
        )}
      </button>
    </div>
  );
};

let sharedAudioContext: AudioContext | null = null;

export const HalliGalliGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const difficultyRef = useRef<'easy' | 'normal' | 'hard'>('normal');
  const [playerDeck, setPlayerDeck] = useState<Card[]>([]);
  const [bot1Deck, setBot1Deck] = useState<Card[]>([]);
  const [bot2Deck, setBot2Deck] = useState<Card[]>([]);
  const [playerPlayed, setPlayerPlayed] = useState<Card[]>([]);
  const [bot1Played, setBot1Played] = useState<Card[]>([]);
  const [bot2Played, setBot2Played] = useState<Card[]>([]);
  const [currentTurn, setCurrentTurn] = useState<'player' | 'bot1' | 'bot2'>('player');
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [winner, setWinner] = useState<'player' | 'bot1' | 'bot2' | 'draw' | null>(null);

  const [message, setMessage] = useState<string>('카드를 뒤집어 시작하세요! 👇');
  const [toastText, setToastText] = useState<{ main: string; sub: string } | null>(null);
  
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [showHelp, setShowHelp] = useState<boolean>(false);

  // IB Mission Quiz states
  const [totalGameFlips, setTotalGameFlips] = useState<number>(0);
  const [showQuizPopup, setShowQuizPopup] = useState<boolean>(false);
  const [hasPromptedQuiz, setHasPromptedQuiz] = useState<boolean>(false);
  const [quizQuestion, setQuizQuestion] = useState<any>(null);
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [quizAnswered, setQuizAnswered] = useState<boolean>(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState<boolean>(false);

  const bot1ActionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const bot2ActionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const processingBellRef = useRef<boolean>(false);

  // Latest state refs to solve asynchronous stale closure errors
  const playerDeckRef = useRef<Card[]>([]);
  const bot1DeckRef = useRef<Card[]>([]);
  const bot2DeckRef = useRef<Card[]>([]);
  const playerPlayedRef = useRef<Card[]>([]);
  const bot1PlayedRef = useRef<Card[]>([]);
  const bot2PlayedRef = useRef<Card[]>([]);
  const currentTurnRef = useRef<'player' | 'bot1' | 'bot2'>('player');
  const gameOverRef = useRef<boolean>(false);
  const lastFlipTimeRef = useRef<number>(0);
  const lastFlipByRef = useRef<'player' | 'bot1' | 'bot2' | null>(null);

  // Synchronize state with latest state refs
  useEffect(() => { playerDeckRef.current = playerDeck; }, [playerDeck]);
  useEffect(() => { bot1DeckRef.current = bot1Deck; }, [bot1Deck]);
  useEffect(() => { bot2DeckRef.current = bot2Deck; }, [bot2Deck]);
  useEffect(() => { playerPlayedRef.current = playerPlayed; }, [playerPlayed]);
  useEffect(() => { bot1PlayedRef.current = bot1Played; }, [bot1Played]);
  useEffect(() => { bot2PlayedRef.current = bot2Played; }, [bot2Played]);
  useEffect(() => { currentTurnRef.current = currentTurn; }, [currentTurn]);
  useEffect(() => { gameOverRef.current = gameOver; }, [gameOver]);
  useEffect(() => { difficultyRef.current = difficulty; }, [difficulty]);

  const showQuizPopupRef = useRef<boolean>(false);
  useEffect(() => { showQuizPopupRef.current = showQuizPopup; }, [showQuizPopup]);

  // Play synthetic beeps so there are no network delay or loading issues on schools iPads!
  const playSound = useCallback((type: 'beep' | 'win' | 'fail' | 'flip') => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!sharedAudioContext) {
        sharedAudioContext = new AudioContextClass();
      }
      const ctx = sharedAudioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'beep') {
        // High-pitch crisp primary chime (metallic impact)
        const pOsc = ctx.createOscillator();
        const pGain = ctx.createGain();
        pOsc.type = 'triangle';
        pOsc.frequency.setValueAtTime(1480, ctx.currentTime);
        pGain.gain.setValueAtTime(0.25, ctx.currentTime);
        pOsc.connect(pGain);
        pGain.connect(ctx.destination);
        pOsc.start();
        pGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.85);
        pOsc.stop(ctx.currentTime + 0.85);

        // Shine/shimmer wave (higher overtone)
        const sOsc = ctx.createOscillator();
        const sGain = ctx.createGain();
        sOsc.type = 'sine';
        sOsc.frequency.setValueAtTime(2150, ctx.currentTime);
        sGain.gain.setValueAtTime(0.12, ctx.currentTime);
        sOsc.connect(sGain);
        sGain.connect(ctx.destination);
        sOsc.start();
        sGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
        sOsc.stop(ctx.currentTime + 0.45);
        
        // Low warm resonance body (solid brass ring)
        const bOsc = ctx.createOscillator();
        const bGain = ctx.createGain();
        bOsc.type = 'sine';
        bOsc.frequency.setValueAtTime(440, ctx.currentTime);
        bGain.gain.setValueAtTime(0.08, ctx.currentTime);
        bOsc.connect(bGain);
        bGain.connect(ctx.destination);
        bOsc.start();
        bGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.55);
        bOsc.stop(ctx.currentTime + 0.55);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, ctx.currentTime + 0.3);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'fail') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(250, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(100, ctx.currentTime + 0.35);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
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

  // Clean helper to check turn rotation skip
  const getNextTurn = (
    current: 'player' | 'bot1' | 'bot2', 
    decks: { player: Card[], bot1: Card[], bot2: Card[] }
  ): 'player' | 'bot1' | 'bot2' => {
    const order: ('player' | 'bot1' | 'bot2')[] = ['player', 'bot1', 'bot2'];
    let idx = order.indexOf(current);
    for (let i = 1; i <= 3; i++) {
      const next = order[(idx + i) % 3];
      const hasFacedown = decks[next]?.length > 0;
      if (hasFacedown) {
        return next;
      }
    }
    return current;
  };

  const startQuizPopup = useCallback(() => {
    if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
    if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);
    
    // Choose a random question from quizQuestions
    const randomIndex = Math.floor(Math.random() * quizQuestions.length);
    const q = quizQuestions[randomIndex];
    setQuizQuestion(q);
    setSelectedOption(null);
    setQuizAnswered(false);
    setIsAnswerCorrect(false);
    setHasPromptedQuiz(true);
    setShowQuizPopup(true);
  }, []);

  const initGame = useCallback(() => {
    if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
    if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);
    processingBellRef.current = false;
    lastFlipTimeRef.current = 0;
    lastFlipByRef.current = null;
    setGameOver(false);
    setWinner(null);
    setToastText(null);

    setTotalGameFlips(0);
    setHasPromptedQuiz(false);
    setShowQuizPopup(false);
    setQuizQuestion(null);
    setSelectedOption(null);
    setQuizAnswered(false);
    setIsAnswerCorrect(false);

    const full = makeDeck();
    // 10 cards each as explicitly requested!
    const initPlayer = full.slice(0, 10);
    const initBot1 = full.slice(10, 20);
    const initBot2 = full.slice(20, 30);

    playerDeckRef.current = initPlayer;
    bot1DeckRef.current = initBot1;
    bot2DeckRef.current = initBot2;
    playerPlayedRef.current = [];
    bot1PlayedRef.current = [];
    bot2PlayedRef.current = [];
    currentTurnRef.current = 'player';
    gameOverRef.current = false;

    setPlayerDeck(initPlayer);
    setBot1Deck(initBot1);
    setBot2Deck(initBot2);
    setPlayerPlayed([]);
    setBot1Played([]);
    setBot2Played([]);
    setCurrentTurn('player');
    setGameState('PLAYING');
    setMessage('내 차례 — 카드를 뒤집으세요! 👇');
  }, []);

  const getTopFruitCountsInternal = (pPlayed: Card[], b1Played: Card[], b2Played: Card[]) => {
    const counts: Record<number, number> = {};
    const tops = [
      pPlayed.length > 0 ? pPlayed[pPlayed.length - 1] : null,
      b1Played.length > 0 ? b1Played[b1Played.length - 1] : null,
      b2Played.length > 0 ? b2Played[b2Played.length - 1] : null,
    ].filter(Boolean) as Card[];

    tops.forEach(c => {
      counts[c.fruit] = (counts[c.fruit] || 0) + c.count;
    });
    return counts;
  };

  const getTopFruitCounts = useCallback(() => {
    return getTopFruitCountsInternal(playerPlayedRef.current, bot1PlayedRef.current, bot2PlayedRef.current);
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

  const checkWinnerAndEliminations = (
    pDeck: Card[], pPlayed: Card[],
    b1Deck: Card[], b1Played: Card[],
    b2Deck: Card[], b2Played: Card[]
  ) => {
    const pTotal = pDeck.length + pPlayed.length;
    const b1Total = b1Deck.length + b1Played.length;
    const b2Total = b2Deck.length + b2Played.length;

    // 1. 모든 카드가 소진되어 더 이상 경기를 지속할 수 없거나 무승부인 경우
    if (pTotal === 0 && b1Total === 0 && b2Total === 0) {
      setWinner('draw');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('fail');
      return true;
    }

    // 2. 내가 카드를 전부 소진한 경우 (즉시 게임 종료)
    if (pTotal === 0) {
      // 나뿐만 아니라 다른 봇들도 카드가 떨어진 무승부 상황인 경우
      if (b1Total === 0 && b2Total === 0) {
        setWinner('draw');
        setGameOver(true);
        gameOverRef.current = true;
        setGameState('END');
        playSound('fail');
        return true;
      }
      
      const highestBot = b1Total >= b2Total ? 'bot1' : 'bot2';
      // 만약 우승 대기 상태인 봇 역시 0장이라면 무승부 처리!
      if (highestBot === 'bot1' && b1Total === 0) {
        setWinner('draw');
      } else if (highestBot === 'bot2' && b2Total === 0) {
        setWinner('draw');
      } else {
        setWinner(highestBot);
      }
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('fail');
      return true;
    }

    // 3. 어떤 플레이어든지 30장 카드를 모두 모으면 승리! (10+10+10 총 30장)
    if (pTotal === 30) {
      setWinner('player');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('win');
      triggerConfetti();
      return true;
    }
    if (b1Total === 30) {
      setWinner('bot1');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('fail');
      return true;
    }
    if (b2Total === 30) {
      setWinner('bot2');
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      playSound('fail');
      return true;
    }

    // 4. 모든 플레이어의 뒤집기 더미(facedown deck)가 0장이 된 경우
    // 더 이상 필드에 카드를 추가할 수 없으므로, 즉시 소지 카드가 가장 많은 사람을 승리자로 지정하고 동점이면 무승부 처리!
    const pDeckEmpty = pDeck.length === 0;
    const b1DeckEmpty = b1Deck.length === 0;
    const b2DeckEmpty = b2Deck.length === 0;

    if (pDeckEmpty && b1DeckEmpty && b2DeckEmpty) {
      const maxTotal = Math.max(pTotal, b1Total, b2Total);
      const candidates: ('player' | 'bot1' | 'bot2')[] = [];
      if (pTotal === maxTotal) candidates.push('player');
      if (b1Total === maxTotal) candidates.push('bot1');
      if (b2Total === maxTotal) candidates.push('bot2');

      if (candidates.length > 1) {
        // 공동 1위이므로 무승부!
        setWinner('draw');
        setGameOver(true);
        gameOverRef.current = true;
        setGameState('END');
        playSound('fail');
        return true;
      } else {
        const singleWinner = candidates[0];
        setWinner(singleWinner);
        setGameOver(true);
        gameOverRef.current = true;
        setGameState('END');
        if (singleWinner === 'player') {
          playSound('win');
          triggerConfetti();
        } else {
          playSound('fail');
        }
        return true;
      }
    }

    // 카드가 온전히 남아있는 활성 플레이어 리스트
    const activePlayers = [
      { id: 'player' as const, total: pTotal },
      { id: 'bot1' as const, total: b1Total },
      { id: 'bot2' as const, total: b2Total }
    ].filter(p => p.total > 0);

    // 나를 제외한 다른 봇들이 모두 탈락해 최후의 1인이 남은 경우 승리!
    if (activePlayers.length === 1) {
      const winnerId = activePlayers[0].id;
      setWinner(winnerId);
      setGameOver(true);
      gameOverRef.current = true;
      setGameState('END');
      if (winnerId === 'player') {
        playSound('win');
        triggerConfetti();
      } else {
        playSound('fail');
      }
      return true;
    }
    return false;
  };

  // Trigger bot bell rings under 5 condition
  const triggerBotsBellReaction = () => {
    if (gameOverRef.current || processingBellRef.current) return;

    if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
    if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);

    const b1Total = bot1DeckRef.current.length + bot1PlayedRef.current.length;
    const b2Total = bot2DeckRef.current.length + bot2PlayedRef.current.length;

    // Dynamic reaction speeds based on selected difficulty
    const diff = difficultyRef.current;
    let b1ReactTime = 750 + Math.random() * 350; // 750ms to 1100ms (normal)
    let b2ReactTime = 800 + Math.random() * 400; // 800ms to 1200ms (normal)

    if (diff === 'easy') {
      b1ReactTime = 1200 + Math.random() * 600; // 1200ms to 1800ms
      b2ReactTime = 1300 + Math.random() * 700; // 1300ms to 2000ms
    } else if (diff === 'hard') {
      b1ReactTime = 250 + Math.random() * 200; // 250ms to 450ms (super fast pro level!)
      b2ReactTime = 280 + Math.random() * 220; // 280ms to 500ms
    }

    if (b1Total > 0) {
      bot1ActionTimerRef.current = setTimeout(() => {
        ringBell('bot1');
      }, b1ReactTime);
    }

    if (b2Total > 0) {
      bot2ActionTimerRef.current = setTimeout(() => {
        ringBell('bot2');
      }, b2ReactTime);
    }
  };

  const ringBell = (who: 'player' | 'bot1' | 'bot2') => {
    if (gameOverRef.current || processingBellRef.current || showQuizPopup) return;

    const pPlayed = playerPlayedRef.current;
    const b1Played = bot1PlayedRef.current;
    const b2Played = bot2PlayedRef.current;
    const allPlayed = [...pPlayed, ...b1Played, ...b2Played];

    const pTotal = playerDeckRef.current.length + pPlayed.length;
    const b1Total = bot1DeckRef.current.length + b1Played.length;
    const b2Total = bot2DeckRef.current.length + b2Played.length;

    // 이미 탈락한(카드가 0장인) 플레이어는 종을 칠 수 없음
    if (who === 'player' && pTotal === 0) return;
    if (who === 'bot1' && b1Total === 0) return;
    if (who === 'bot2' && b2Total === 0) return;

    if (allPlayed.length === 0) return;

    processingBellRef.current = true;

    // Clear react timers
    if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
    if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);

    setIsRinging(true);
    playSound('beep');
    setTimeout(() => setIsRinging(false), 250);

    const correct = hasFiveActive();

    let nextPlayerDeck = [...playerDeckRef.current];
    let nextBot1Deck = [...bot1DeckRef.current];
    let nextBot2Deck = [...bot2DeckRef.current];

    // Reset played piles from the field
    let nextPlayerPlayed: Card[] = [];
    let nextBot1Played: Card[] = [];
    let nextBot2Played: Card[] = [];

    if (correct) {
      playSound('win');
      const shuffledWin = shuffle(allPlayed);

      if (who === 'player') {
        nextPlayerDeck = [...nextPlayerDeck, ...shuffledWin];
        setPlayerDeck(nextPlayerDeck);
        showToast('🎉 정답!', `바닥의 카드 ${allPlayed.length}장을 획득했습니다!`);
        setMessage(`정답! 내가 카드 ${allPlayed.length}장 획득! 🌟`);
        setCurrentTurn('player');
        currentTurnRef.current = 'player';
      } else if (who === 'bot1') {
        nextBot1Deck = [...nextBot1Deck, ...shuffledWin];
        setBot1Deck(nextBot1Deck);
        showToast('🤖 IB봇 1 선착!', `아이비봇 1이 먼저 종을 쳐서 카드 ${allPlayed.length}장을 가져갔습니다!`);
        setMessage(`아이비봇 1 선착! 카드를 뺏겼습니다 😭`);
        setCurrentTurn('bot1');
        currentTurnRef.current = 'bot1';
      } else {
        nextBot2Deck = [...nextBot2Deck, ...shuffledWin];
        setBot2Deck(nextBot2Deck);
        showToast('🤖 IB봇 2 선착!', `아이비봇 2가 먼저 종을 쳐서 카드 ${allPlayed.length}장을 가져갔습니다!`);
        setMessage(`아이비봇 2 선착! 카드를 뺏겼습니다 😭`);
        setCurrentTurn('bot2');
        currentTurnRef.current = 'bot2';
      }

      setPlayerPlayed([]);
      setBot1Played([]);
      setBot2Played([]);
      playerPlayedRef.current = [];
      bot1PlayedRef.current = [];
      bot2PlayedRef.current = [];
    } else {
      playSound('fail');
      nextPlayerPlayed = [...playerPlayedRef.current];
      nextBot1Played = [...bot1PlayedRef.current];
      nextBot2Played = [...bot2PlayedRef.current];
      // Penalty: Wrong ringer gives 1 card from their facedown deck to each of other players!
      if (who === 'player') {
        let penaltyDesc = '';
        if (nextPlayerDeck.length > 0) {
          const c1 = nextPlayerDeck.shift()!;
          nextBot1Deck.push(c1);
          penaltyDesc += ' (봇1에 1장)';
        }
        if (nextPlayerDeck.length > 0) {
          const c2 = nextPlayerDeck.shift()!;
          nextBot2Deck.push(c2);
          penaltyDesc += ' (봇2에 1장)';
        }
        setPlayerDeck(nextPlayerDeck);
        setBot1Deck(nextBot1Deck);
        setBot2Deck(nextBot2Deck);
        showToast('❌ 틀렸습니다!', `5개가 아닙니다! 두 봇에게 각각 1장씩 선물했습니다.${penaltyDesc}`);
        setMessage('실수! 오답 패널티로 카드를 나누어 주었습니다 😢');
      } else if (who === 'bot1') {
        if (nextBot1Deck.length > 0) {
          const c1 = nextBot1Deck.shift()!;
          nextPlayerDeck.push(c1);
        }
        if (nextBot1Deck.length > 0) {
          const c2 = nextBot1Deck.shift()!;
          nextBot2Deck.push(c2);
        }
        setPlayerDeck(nextPlayerDeck);
        setBot1Deck(nextBot1Deck);
        setBot2Deck(nextBot2Deck);
        showToast('🤖 IB봇 1 오답!', `아이비봇 1이 실수했습니다! 다른 플레이어들이 카드를 받았습니다.`);
        setMessage('IB 봇 1 오답! 행운의 보너스티 카드를 1장 얻었습니다! 🎉');
      } else {
        if (nextBot2Deck.length > 0) {
          const c1 = nextBot2Deck.shift()!;
          nextPlayerDeck.push(c1);
        }
        if (nextBot2Deck.length > 0) {
          const c2 = nextBot2Deck.shift()!;
          nextBot1Deck.push(c2);
        }
        setPlayerDeck(nextPlayerDeck);
        setBot1Deck(nextBot1Deck);
        setBot2Deck(nextBot2Deck);
        showToast('🤖 IB봇 2 오답!', `아이비봇 2가 실수했습니다! 다른 플레이어들이 카드를 받았습니다.`);
        setMessage('IB 봇 2 오답! 행운의 보너스티 카드를 1장 얻었습니다! 🎉');
      }
    }

    playerDeckRef.current = nextPlayerDeck;
    bot1DeckRef.current = nextBot1Deck;
    bot2DeckRef.current = nextBot2Deck;

    const isFinished = checkWinnerAndEliminations(
      nextPlayerDeck, nextPlayerPlayed,
      nextBot1Deck, nextBot1Played,
      nextBot2Deck, nextBot2Played
    );

    if (!isFinished) {
      setTimeout(() => {
        processingBellRef.current = false;
        const nextTurnId = currentTurnRef.current;
        if (nextTurnId === 'player') {
          setMessage('내 차례 — 카드를 뒤집으세요! 👇');
        } else {
          setMessage(`아이비봇 ${nextTurnId === 'bot1' ? '1' : '2'}의 차례입니다... 🤖`);
          triggerBotFlip(nextTurnId);
        }
      }, 1500);
    }
  };

  const handleQuizCorrectResume = () => {
    setShowQuizPopup(false);
    
    // Check if there is still a game playing (not over)
    if (gameOverRef.current) return;
    
    // Assess 5 conditions normally
    const counts = getTopFruitCountsInternal(
      playerPlayedRef.current,
      bot1PlayedRef.current,
      bot2PlayedRef.current
    );
    const hasFive = Object.values(counts).some(v => v === 5);

    if (hasFive) {
      setMessage('🔔 한 과일이 정확히 5개! 빨리 종을 누르세요!');
      triggerBotsBellReaction();
    } else {
      const nextTurnId = currentTurnRef.current;
      if (nextTurnId !== 'player') {
        triggerBotFlip(nextTurnId);
      } else {
        setMessage('내 차례 — 카드를 뒤집으세요! 👇');
      }
    }
  };

  const triggerBotFlip = (botId: 'bot1' | 'bot2') => {
    if (gameOverRef.current) return;

    if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
    if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);

    // Natural bot flip interval based on difficulty
    let delay = 1000 + Math.random() * 800;
    const diff = difficultyRef.current;
    if (diff === 'easy') {
      delay = 1600 + Math.random() * 1000;
    } else if (diff === 'hard') {
      delay = 600 + Math.random() * 600;
    }

    const timer = setTimeout(() => {
      if (currentTurnRef.current !== botId) return;

      let botDeck = botId === 'bot1' ? bot1DeckRef.current : bot2DeckRef.current;
      const botPlayed = botId === 'bot1' ? bot1PlayedRef.current : bot2PlayedRef.current;

      if (botDeck.length === 0) {
        // Skip since deck is empty, but they can still participate in bell ringing
        const nextTurnId = getNextTurn(botId, {
          player: playerDeckRef.current,
          bot1: bot1DeckRef.current,
          bot2: bot2DeckRef.current
        });
        setCurrentTurn(nextTurnId);
        currentTurnRef.current = nextTurnId;

        if (nextTurnId === 'player') {
          setMessage(`아이비봇 ${botId === 'bot1' ? '1' : '2'} 카드 소진(덱 0장)! 내 차례입니다. 👇`);
        } else {
          setMessage(`아이비봇 ${nextTurnId === 'bot1' ? '1' : '2'}의 차례입니다... 🤖`);
          triggerBotFlip(nextTurnId);
        }
        return;
      }

      const nextBotDeck = [...botDeck];
      const card = nextBotDeck.shift()!;

      let nextBotPlayed: Card[];
      if (botId === 'bot1') {
        setBot1Deck(nextBotDeck);
        bot1DeckRef.current = nextBotDeck;
        nextBotPlayed = [...bot1PlayedRef.current, card];
        setBot1Played(nextBotPlayed);
        bot1PlayedRef.current = nextBotPlayed;
      } else {
        setBot2Deck(nextBotDeck);
        bot2DeckRef.current = nextBotDeck;
        nextBotPlayed = [...bot2PlayedRef.current, card];
        setBot2Played(nextBotPlayed);
        bot2PlayedRef.current = nextBotPlayed;
      }

      playSound('flip');
      lastFlipTimeRef.current = Date.now();
      lastFlipByRef.current = botId;

      // Pivot turn rotation
      const nextTurnId = getNextTurn(botId, {
        player: playerDeckRef.current,
        bot1: bot1DeckRef.current,
        bot2: bot2DeckRef.current
      });
      setCurrentTurn(nextTurnId);
      currentTurnRef.current = nextTurnId;

      if (nextTurnId === 'player') {
        setMessage('내 차례 — 카드를 뒤집으세요! 👇');
      } else {
        setMessage(`아이비봇 ${nextTurnId === 'bot1' ? '1' : '2'}의 차례입니다... 🤖`);
      }

      setTotalGameFlips(prev => {
        const nextFlips = prev + 1;
        if (nextFlips === 8 && !hasPromptedQuiz) {
          setTimeout(() => startQuizPopup(), 100);
          return nextFlips;
        }

        // Assess 5 conditions
        const counts = getTopFruitCountsInternal(
          playerPlayedRef.current,
          bot1PlayedRef.current,
          bot2PlayedRef.current
        );
        const hasFive = Object.values(counts).some(v => v === 5);

        if (hasFive) {
          setMessage('🔔 한 과일이 정확히 5개! 빨리 종을 누르세요!');
          triggerBotsBellReaction();
        } else {
          if (nextTurnId !== 'player') {
            triggerBotFlip(nextTurnId);
          }
        }
        return nextFlips;
      });

    }, delay);

    if (botId === 'bot1') {
      bot1ActionTimerRef.current = timer;
    } else {
      bot2ActionTimerRef.current = timer;
    }
  };

  const playerFlip = () => {
    if (gameOverRef.current || processingBellRef.current || currentTurnRef.current !== 'player' || showQuizPopup) return;
    
    let activePlayerDeck = [...playerDeckRef.current];
    let nextPlayerPlayed = [...playerPlayedRef.current];
    
    if (activePlayerDeck.length === 0) {
      return; // No cards to flip
    }

    const nextPlayerDeck = [...activePlayerDeck];
    const card = nextPlayerDeck.shift()!;
    setPlayerDeck(nextPlayerDeck);
    playerDeckRef.current = nextPlayerDeck;

    const nextPlayerPlayedFinal = [...nextPlayerPlayed, card];
    setPlayerPlayed(nextPlayerPlayedFinal);
    playerPlayedRef.current = nextPlayerPlayedFinal;

    playSound('flip');
    lastFlipTimeRef.current = Date.now();
    lastFlipByRef.current = 'player';

    // Pivot turn to bots
    const nextTurnId = getNextTurn('player', {
      player: nextPlayerDeck,
      bot1: bot1DeckRef.current,
      bot2: bot2DeckRef.current
    });
    setCurrentTurn(nextTurnId);
    currentTurnRef.current = nextTurnId;

    if (nextTurnId === 'player') {
      setMessage('내 차례 — 카드를 뒤집으세요! 👇');
    } else {
      setMessage(`아이비봇 ${nextTurnId === 'bot1' ? '1' : '2'}의 차례입니다... 🤖`);
    }

    setTotalGameFlips(prev => {
      const nextFlips = prev + 1;
      if (nextFlips === 8 && !hasPromptedQuiz) {
        setTimeout(() => startQuizPopup(), 100);
        return nextFlips;
      }

      // Is there a 5 on the board now?
      const counts = getTopFruitCountsInternal(
        nextPlayerPlayed,
        bot1PlayedRef.current,
        bot2PlayedRef.current
      );
      const hasFive = Object.values(counts).some(v => v === 5);

      if (hasFive) {
        setMessage('🔔 한 과일이 정확히 5개! 빨리 종을 누르세요!');
        triggerBotsBellReaction();
      } else {
        if (nextTurnId !== 'player') {
          triggerBotFlip(nextTurnId);
        }
      }
      return nextFlips;
    });
  };

  // Keyboard hooks
  const ringBellStaticRef = useRef(ringBell);
  const playerFlipStaticRef = useRef(playerFlip);
  useEffect(() => { ringBellStaticRef.current = ringBell; });
  useEffect(() => { playerFlipStaticRef.current = playerFlip; });

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (showQuizPopupRef.current) return;
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
      if (bot1ActionTimerRef.current) clearTimeout(bot1ActionTimerRef.current);
      if (bot2ActionTimerRef.current) clearTimeout(bot2ActionTimerRef.current);
    };
  }, []);

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
            <h1 className="text-xs md:text-sm font-black tracking-tight leading-none text-amber-300">신나는 한글 할리갈리 (3인 버전)</h1>
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
          <h2 className="text-lg font-black text-amber-200 mb-2 leading-snug">💡 3인 대결 할리갈리 규칙 안내</h2>
          <div className="w-full bg-emerald-950/65 p-3.5 rounded-xl border border-emerald-500/20 text-left text-[11px] text-emerald-100 mb-4 space-y-2 leading-relaxed">
            <p>1. <b>대결 인원</b>: 나(학습자), 그리고 두 명의 뛰어난 인공지능 <b>아이비봇 1, 아이비봇 2</b>와 함께 총 3명이서 진행합니다.</p>
            <p>2. <b>시작 카드</b>: 각각 <b>10장씩</b> 사이좋게 카드를 나누어 받고 대결을 개시합니다.</p>
            <p>3. <b>카드 뒤집기</b>: 내 순서에 내 덱을 터치하면 바닥에 카드가 뒤집혀 노출됩니다.</p>
            <p>4. <b>종 치기(🛎️)</b>: 세 명의 플레이어가 깔아놓은 활성 공개 카드 속 과일들을 더했을 때, <b>어떤 종류든 합계가 정확히 5개</b>가 되는 즉시 가운데 벨을 칩니다!</p>
            <p>5. <b>카드 쓸어가기</b>: 종을 가장 빨리 터치한 사람이 <b>바닥에 쌓인 모든 카드들을 획득</b>하여 본인의 덱 뒤로 쏙 집어넣습니다.</p>
            <p>6. <b>패널티</b>: 5개가 아닐 때 실수로 빈 벨을 울리면, <b>다른 두 명의 플레이어에게 카드를 1장씩 선물로 넘겨주는</b> 엄격한 패널티가 가용됩니다!</p>
          </div>

          {/* 난이도 선택 */}
          <div className="w-full mb-5">
            <span className="text-xs font-black text-amber-300 block mb-2">🔥 봇 난이도 선택</span>
            <div className="grid grid-cols-3 gap-2 bg-emerald-950/80 p-1.5 rounded-2xl border border-emerald-500/30">
              <button
                type="button"
                onClick={() => setDifficulty('easy')}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'easy'
                    ? 'bg-emerald-500 text-white shadow-md border border-emerald-300/30'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                하 (초보자)
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('normal')}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'normal'
                    ? 'bg-amber-400 text-slate-950 shadow-md border border-amber-300/30'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                중 (일반)
              </button>
              <button
                type="button"
                onClick={() => setDifficulty('hard')}
                className={`py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                  difficulty === 'hard'
                    ? 'bg-rose-600 text-white shadow-md border border-rose-300/30'
                    : 'text-emerald-300 hover:bg-emerald-900/40'
                }`}
              >
                상 (프로)
              </button>
            </div>
          </div>

          <Button 
            onClick={initGame}
            icon={Play}
            className="py-3 px-8 text-xs font-black bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 rounded-xl w-full border-b-4 border-amber-800 shadow-lg active:scale-95 transition-all"
            id="start-halligalli-btn"
          >
            3인 대결 시작하기 (각 10장)
          </Button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col justify-between p-2 sm:p-3 relative z-10 h-full overflow-y-auto">
          
          {/* TOP DIFFICULTY BAR */}
          <div className="flex justify-between items-center px-2.5 py-1.5 mb-1.5 bg-black/20 rounded-xl border border-white/5">
            <span className="text-[10px] font-black text-emerald-200">🤖 대결 봇 난이도</span>
            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black tracking-wider ${
              difficulty === 'easy' ? 'bg-emerald-500 text-white' :
              difficulty === 'normal' ? 'bg-amber-400 text-slate-950' : 'bg-rose-600 text-white'
            }`}>
              {difficulty === 'easy' ? '하 (초보자)' :
               difficulty === 'normal' ? '중 (일반)' : '상 (프로)'}
            </span>
          </div>

          {/* TOP 3-WAY STATUS PANEL */}
          <div className="grid grid-cols-3 gap-1.5 bg-black/35 border border-white/5 p-2 rounded-xl text-center">
            <div className={`p-1 rounded-lg border transition-all ${
              currentTurn === 'player' ? 'bg-amber-400/20 border-amber-400' : 'bg-slate-900/40 border-transparent text-zinc-400'
            }`}>
              <span className="text-[10px] font-black block">👦 나 (학습자)</span>
              <span className="text-[9px] font-bold text-amber-300">{playerDeck.length + playerPlayed.length}장 </span>
              {currentTurn === 'player' && <span className="text-[8px] bg-amber-500 text-slate-950 px-1 rounded font-black inline-block ml-1 animate-pulse">TURN</span>}
            </div>
            <div className={`p-1 rounded-lg border transition-all ${
              currentTurn === 'bot1' ? 'bg-orange-500/20 border-orange-400' : 'bg-slate-900/40 border-transparent text-zinc-400'
            }`}>
              <span className="text-[10px] font-black block">🤖 아이비봇 1</span>
              <span className="text-[9px] font-bold text-orange-300">{bot1Deck.length + bot1Played.length}장</span>
              {currentTurn === 'bot1' && <span className="text-[8px] bg-orange-500 text-slate-950 px-1 rounded font-black inline-block ml-1 animate-pulse">TURN</span>}
            </div>
            <div className={`p-1 rounded-lg border transition-all ${
              currentTurn === 'bot2' ? 'bg-pink-500/20 border-pink-400' : 'bg-slate-900/40 border-transparent text-zinc-400'
            }`}>
              <span className="text-[10px] font-black block">🤖 아이비봇 2</span>
              <span className="text-[9px] font-bold text-pink-300">{bot2Deck.length + bot2Played.length}장</span>
              {currentTurn === 'bot2' && <span className="text-[8px] bg-pink-500 text-slate-950 px-1 rounded font-black inline-block ml-1 animate-pulse">TURN</span>}
            </div>
          </div>

          {/* REAL COLLABORATIVE FELT TABLE (Triangle circular layout modeled like the image) */}
          <div className="flex-1 my-2 bg-emerald-950/40 border border-green-800/20 rounded-2xl p-3 flex flex-col justify-between items-center relative overflow-hidden shadow-inner min-h-[360px] sm:min-h-[400px]">
            
            {/* Top Row: The two artificial intelligence bots facing downward */}
            <div className="flex justify-between items-start w-full px-2">
              
              {/* Bot 1 (Left) */}
              <div className="flex flex-col items-center gap-1.5 max-w-[45%]">
                <div className="text-[9px] text-orange-200 font-extrabold flex items-center gap-1">
                  <span>🤖 봇1</span>
                  <span className="text-[8px] font-mono text-orange-400">({bot1Deck.length}장 대기)</span>
                </div>
                <div className="flex items-center gap-1.5 scale-90 sm:scale-100 origin-top-left">
                  <RenderDeck count={bot1Deck.length} label="봇1" />
                  <RenderCard card={bot1Played.length > 0 ? bot1Played[bot1Played.length - 1] : null} label="공공 필드" playedCount={bot1Played.length} />
                </div>
              </div>

              {/* Bot 2 (Right) */}
              <div className="flex flex-col items-center gap-1.5 max-w-[45%]">
                <div className="text-[9px] text-pink-200 font-extrabold flex items-center gap-1">
                  <span>🤖 봇2</span>
                  <span className="text-[8px] font-mono text-pink-400">({bot2Deck.length}장 대기)</span>
                </div>
                <div className="flex items-center gap-1.5 scale-90 sm:scale-100 origin-top-right">
                  <RenderCard card={bot2Played.length > 0 ? bot2Played[bot2Played.length - 1] : null} label="공공 필드" playedCount={bot2Played.length} />
                  <RenderDeck count={bot2Deck.length} label="봇2" />
                </div>
              </div>

            </div>

            {/* Center Row: Mechanical Bell */}
            <div className="w-full flex flex-col items-center justify-center py-2 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-20 pointer-events-auto">
              <div className="relative flex items-center justify-center w-24 h-24 sm:w-28 sm:h-28">
                {/* Visual ripple when ringing */}
                {isRinging && (
                  <>
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 0.8 }}
                      animate={{ scale: 2.2, opacity: 0 }}
                      transition={{ duration: 0.4 }}
                      className="absolute inset-0 rounded-full bg-amber-400/25 border-2 border-amber-400 pointer-events-none z-0"
                    />
                    <motion.div 
                      initial={{ scale: 0.8, opacity: 1 }}
                      animate={{ scale: 1.7, opacity: 0 }}
                      transition={{ duration: 0.3, delay: 0.08 }}
                      className="absolute inset-0 rounded-full bg-amber-300/20 border border-amber-200 pointer-events-none z-0"
                    />
                  </>
                )}

                {/* Sparkling glow is five trigger active */}
                {hasFiveActive() && (
                  <div className="absolute -inset-3 rounded-full border-4 border-dashed border-amber-400 animate-spin opacity-85 pointer-events-none duration-1000 z-0" />
                )}

                {/* 3D Mechanical Golden Desk Bell Button */}
                <motion.button
                  whileHover={{ scale: 1.04 }}
                  whileTap={{ scale: 0.94 }}
                  onClick={() => ringBell('player')}
                  className="w-20 h-20 sm:w-24 sm:h-24 rounded-full cursor-pointer bg-gradient-to-b from-zinc-800 via-zinc-900 to-black p-1 shadow-[0_8px_20px_rgba(0,0,0,0.5)] border-4 border-zinc-700 flex items-center justify-center relative select-none z-10"
                  animate={isRinging ? { scale: [1, 1.15, 0.95, 1.05, 1], rotate: [0, -12, 12, -6, 0] } : {}}
                  transition={{ duration: 0.25 }}
                  id="halligalli-bell-dome"
                >
                  <div className="w-full h-full rounded-full bg-gradient-to-tr from-amber-700 via-amber-300 to-amber-500 border-2 border-amber-200 flex items-center justify-center shadow-[inset_0_4px_12px_rgba(255,255,255,0.4)] relative">
                    <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gradient-to-b from-amber-800 via-amber-600 to-amber-950 border border-amber-400 shadow-md flex items-center justify-center">
                      <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-gradient-to-t from-zinc-700 via-zinc-200 to-zinc-400 border-2 border-zinc-100 flex items-center justify-center shadow-[inset_0_2px_4px_rgba(255,255,255,0.6)]">
                        <span className="text-xs sm:text-sm">🛎️</span>
                      </div>
                    </div>
                    {hasFiveActive() && (
                      <div className="absolute top-1.5 w-2.5 h-2.5 rounded-full bg-red-500 border border-white animate-ping" />
                    )}
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Bottom Row: Player (👦 나) Area */}
            <div className="w-full flex justify-center items-end mt-auto pt-10">
              <div className="flex flex-col items-center gap-1 max-w-[85%]">
                <div className="flex items-center gap-3 sm:gap-4 md:gap-6">
                  
                  {/* Player played card */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-zinc-400 font-bold">내 공개 카드</span>
                    <RenderCard card={playerPlayed.length > 0 ? playerPlayed[playerPlayed.length - 1] : null} label="빈 필드" playedCount={playerPlayed.length} />
                  </div>

                  {/* Player deck to flip */}
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-[8px] text-zinc-400 font-bold">내 카드 덱</span>
                    <RenderDeck 
                      count={playerDeck.length} 
                      label="내 카드" 
                      isPlayerTurn={currentTurn === 'player'} 
                      onClick={playerFlip}
                      disabled={currentTurn !== 'player' || playerDeck.length === 0}
                      isPlayer={true}
                    />
                  </div>

                </div>
                <div className="text-[9px] text-[#86efac] font-bold mt-1">👦 나 (학습자) · 총 {playerDeck.length + playerPlayed.length}장 보유</div>
              </div>
            </div>

          </div>

          {/* LIVE ACCUMULATED TALLY ON FIELD */}
          <div className="mb-2 p-2 bg-black/25 border border-white/5 rounded-xl">
            <span className="text-[9px] sm:text-[10px] font-extrabold text-[#86efac] block text-center mb-1">바닥에 오픈된 삼총사 과일 합계</span>
            <div className="grid grid-cols-4 gap-1 sm:gap-1.5 justify-center">
              {FRUITS.map((f, idx) => {
                const count = activeTally[idx] || 0;
                const isFive = count === 5;
                return (
                  <div 
                    key={idx}
                    className={`flex flex-col sm:flex-row items-center justify-center gap-0.5 sm:gap-1 py-1 px-1 sm:px-2 rounded-lg text-[10px] sm:text-xs font-black transition-all ${
                      isFive 
                        ? 'bg-amber-400 border border-amber-500 text-slate-950 scale-102 shadow-md animate-pulse animate-infinite' 
                        : 'bg-emerald-950/60 border border-green-950/20 text-emerald-100'
                    }`}
                  >
                    <div className="flex items-center gap-0.5">
                      <span className="text-xs sm:text-sm leading-none">{f}</span>
                    </div>
                    <span className={`text-[9px] sm:text-[10px] font-black ${isFive ? 'text-indigo-950' : 'text-amber-200'}`}>
                      {count}개
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* NOTIFICATION LOG */}
          <div className="text-center bg-zinc-950/60 py-1.5 px-3 rounded-xl max-w-sm mx-auto mb-2 border border-white/5 flex items-center justify-center gap-1.5 shadow">
            <p className="text-[8px] text-emerald-500 font-black animate-pulse">●</p>
            <p className="text-[10px] text-emerald-100 font-extrabold leading-tight">{message}</p>
          </div>

          {/* BOTTOM CONTROLS */}
          <div className="flex gap-2 font-bold text-[10px] sm:text-[11px] w-full">
            <button
              onClick={initGame}
              className="px-3 py-2 bg-[#0e3b16] hover:bg-[#154d20] text-emerald-100 border border-emerald-700/50 rounded-xl flex items-center justify-center gap-1 transition-all cursor-pointer"
              id="halligalli-reset-bottom-btn"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              <span>새 대결 시작</span>
            </button>
            <button
              onClick={playerFlip}
              disabled={currentTurn !== 'player' || playerDeck.length === 0}
              className={`flex-1 py-2 bg-gradient-to-r from-amber-400 to-amber-500 text-slate-950 hover:from-amber-500 hover:to-amber-600 border-b-2 border-amber-700 rounded-xl flex items-center justify-center gap-1 transition-all font-black select-none ${
                currentTurn === 'player' ? 'cursor-pointer' : 'opacity-35 cursor-not-allowed text-zinc-500'
              }`}
              id="halligalli-flip-bottom-btn"
            >
              <span>내 카드 뒤집기 (Enter / 덱 탭) ▶</span>
            </button>
            <button
              onClick={() => ringBell('player')}
              className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl border-b-2 border-rose-800 flex items-center justify-center gap-1 shadow font-black animate-pulse transition-all cursor-pointer"
              id="halligalli-bell-manual-btn"
            >
              <span>🛎️ 종치기 (Space)</span>
            </button>
          </div>

        </div>
      )}

      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-5 text-center max-w-sm mx-auto z-10 overflow-y-auto w-full">
          <div className="w-16 h-16 rounded-2xl bg-zinc-950/40 border border-white/10 flex items-center justify-center shadow-lg mb-4 text-3xl">
            {winner === 'player' ? '🏆' : winner === 'draw' ? '🤝' : '🤖'}
          </div>
          <h2 className="text-lg font-black mb-1.5 text-amber-200">
            {winner === 'player' 
              ? '🎉 내가 승리했습니다!!' 
              : winner === 'draw' 
                ? '🤝 무승부로 끝났습니다!' 
                : `🤖 아이비봇 ${winner === 'bot1' ? '1' : '2'} 승리!`}
          </h2>
          <p className="text-[11px] text-zinc-300 font-semibold mb-6 max-w-[280px] leading-relaxed">
            {winner === 'player' 
              ? '아이비봇 두 명의 카드를 완전히 싹 쓸어왔습니다! 당신은 할리갈리의 왕이군요!' 
              : winner === 'draw' 
                ? '모든 플레이어의 카드가 완전히 분배되거나 소진되어 승부를 가릴 수 없습니다. 치열한 대결이었습니다!' 
                : `아이비봇 ${winner === 'bot1' ? '1' : '2'}이 영광의 승리를 쟁취했습니다. 다시 시작하여 굴복시키세요!`}
          </p>

          <Button 
            onClick={initGame}
            icon={RefreshCw}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-950 text-xs font-black py-3 rounded-xl shadow-lg border-b-4 border-amber-700 active:scale-95 cursor-pointer"
            id="halligalli-restart-end-btn"
          >
            대결 다시 시작하기
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
            className="absolute top-[40%] left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950/95 border-2 border-amber-500/60 p-4 rounded-2xl text-center shadow-2xl z-50 max-w-[260px] w-full"
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
                    • <b>[ENTER]</b> 또는 <b>[→ 오른쪽 방향키]</b>로 카드를 뒤집을 수 있습니다!
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

      {/* IB MISSION QUIZ MODAL POPUP */}
      <AnimatePresence>
        {showQuizPopup && quizQuestion && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 flex flex-col items-center justify-center p-4 text-center z-50 backdrop-blur-md"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-amber-500/40 p-6 rounded-3xl max-w-md w-full text-left relative shadow-2xl overflow-y-auto max-h-[90vh]"
            >
              <div className="flex items-center gap-3 mb-4 border-b border-zinc-800 pb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-2xl shrink-0">
                  {quizQuestion.emoji || '🌟'}
                </div>
                <div>
                  <h3 className="text-sm font-black text-amber-300">IB 탐험가 깜짝 미션 퀴즈!</h3>
                  <p className="text-[10px] text-zinc-400 font-bold">정답을 맞추면 멈춘 할리갈리 게임을 계속할 수 있어요!</p>
                </div>
              </div>

              <div className="mb-5 bg-zinc-950/40 p-4 rounded-2xl border border-zinc-800/30">
                <p className="text-xs font-bold text-zinc-100 leading-relaxed">
                  {quizQuestion.question}
                </p>
              </div>

              <div className="space-y-2 mb-5">
                {quizQuestion.options.map((option: string, idx: number) => {
                  const isSelected = selectedOption === idx;
                  const isCorrectAnswer = idx === quizQuestion.correctAnswer;
                  
                  let btnStyle = "bg-zinc-800/60 hover:bg-zinc-855 border-zinc-700/50 text-zinc-200";
                  if (isSelected) {
                    if (isCorrectAnswer) {
                      btnStyle = "bg-green-500/20 border-green-500 text-green-300";
                    } else {
                      btnStyle = "bg-red-500/20 border-red-500 text-red-300";
                    }
                  } else if (quizAnswered && isCorrectAnswer) {
                    btnStyle = "bg-green-500/20 border-green-500 text-green-300";
                  }

                  return (
                    <button
                      key={idx}
                      disabled={quizAnswered && isAnswerCorrect}
                      onClick={() => {
                        setSelectedOption(idx);
                        if (idx === quizQuestion.correctAnswer) {
                          playSound('win');
                          setIsAnswerCorrect(true);
                          setQuizAnswered(true);
                          try {
                            confetti({ particleCount: 30, spread: 50, origin: { y: 0.6 } });
                          } catch (e) {}
                        } else {
                          playSound('fail');
                          setIsAnswerCorrect(false);
                          setQuizAnswered(true);
                        }
                      }}
                      className={`w-full text-left p-3 rounded-xl border text-xs font-bold transition-all duration-200 flex items-center justify-between gap-2 cursor-pointer disabled:opacity-80 active:scale-98 ${btnStyle}`}
                    >
                      <span>{option}</span>
                      {isSelected && (
                        <span className="text-xs shrink-0 select-none">
                          {isCorrectAnswer ? '✅ 정답' : '❌ 오답'}
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <AnimatePresence mode="wait">
                {quizAnswered && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="p-3.5 rounded-2xl border bg-zinc-950/60 text-[10px] leading-relaxed mb-4"
                    style={{
                      borderColor: isAnswerCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'
                    }}
                  >
                    {isAnswerCorrect ? (
                      <div>
                        <p className="text-green-400 font-extrabold mb-1 flex items-center gap-1 text-xs">
                          🎉 완벽합니다! 정답이에요!
                        </p>
                        <p className="text-zinc-300 font-medium">
                          {quizQuestion.explanation}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <p className="text-red-400 font-extrabold mb-1 text-xs">
                          😢 틀렸습니다! 다시 생각해보세요.
                        </p>
                        <p className="text-zinc-400 font-medium">
                          IB 핵심 철학을 잘 되짚어보고 올바른 선택지를 탭하세요!
                        </p>
                      </div>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>

              {isAnswerCorrect && (
                <Button 
                  onClick={handleQuizCorrectResume}
                  className="w-full bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-zinc-950 text-xs font-black py-3 rounded-xl shadow-lg border-b-4 border-emerald-700 active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
                  id="halligalli-quiz-resume-btn"
                >
                  <Sparkles className="w-4 h-4 text-emerald-950 fill-current" />
                  계속 게임하기
                </Button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
