import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { 
  Volume2, 
  VolumeX, 
  Play, 
  HelpCircle, 
  Sparkles, 
  Award,
  BellRing,
  ArrowRight,
  RotateCcw,
  User,
  Computer,
  Sparkle,
  Hourglass,
  Trophy,
  Info,
  Layers,
  ArrowUp,
  ArrowRightLeft
} from 'lucide-react';
import confetti from 'canvas-confetti';

// 5가지 기본 컵 색상 키
const CUP_COLOR_KEYS = ['red', 'yellow', 'blue', 'green', 'black'] as const;
type CupColorKey = typeof CUP_COLOR_KEYS[number];

// 테마 정의 (클래식, 과일, 동물)
type ThemeKey = 'classic' | 'fruit' | 'animal';

interface ThemeColorDetail {
  emoji: string;
  name: string;
  bgClass: string;
  borderClass: string;
}

const THEME_MAP: Record<ThemeKey, {
  name: string;
  icon: string;
  desc: string;
  colors: Record<CupColorKey, ThemeColorDetail>;
}> = {
  classic: {
    name: '클래식 원색 컵',
    icon: '🥤',
    desc: '오리지널 컵쌓기의 알록달록한 감성입니다.',
    colors: {
      red: { emoji: '🔴', name: '빨간 컵', bgClass: 'bg-red-500 hover:bg-red-600 shadow-red-500/30 text-white', borderClass: 'border-red-400' },
      yellow: { emoji: '🟡', name: '노란 컵', bgClass: 'bg-amber-400 hover:bg-amber-500 shadow-yellow-500/30 text-yellow-950', borderClass: 'border-amber-300' },
      blue: { emoji: '🔵', name: '파란 컵', bgClass: 'bg-blue-500 hover:bg-blue-600 shadow-blue-500/30 text-white', borderClass: 'border-blue-400' },
      green: { emoji: '🟢', name: '초록 컵', bgClass: 'bg-emerald-500 hover:bg-emerald-600 shadow-emerald-500/30 text-white', borderClass: 'border-emerald-400' },
      black: { emoji: '⚫', name: '검은 컵', bgClass: 'bg-zinc-800 hover:bg-zinc-900 shadow-zinc-800/30 text-white', borderClass: 'border-zinc-700' }
    }
  },
  fruit: {
    name: '새콤달콤 과일 정원',
    icon: '🍓',
    desc: '딸기, 바나나, 개성 가득한 과일 컬렉션입니다.',
    colors: {
      red: { emoji: '🍓', name: '딸기 컵', bgClass: 'bg-rose-500 hover:bg-rose-600 shadow-rose-500/30 text-white', borderClass: 'border-rose-300' },
      yellow: { emoji: '🍌', name: '바나나 컵', bgClass: 'bg-amber-300 hover:bg-amber-400 shadow-amber-300/30 text-yellow-950', borderClass: 'border-amber-200' },
      blue: { emoji: '🫐', name: '블루베리 컵', bgClass: 'bg-blue-600 hover:bg-blue-750 shadow-blue-600/30 text-white', borderClass: 'border-blue-400' },
      green: { emoji: '🍏', name: '풋사과 컵', bgClass: 'bg-emerald-400 hover:bg-emerald-500 shadow-emerald-400/30 text-white', borderClass: 'border-emerald-300' },
      black: { emoji: '🍇', name: '포도 컵', bgClass: 'bg-purple-600 hover:bg-purple-750 shadow-purple-600/30 text-white', borderClass: 'border-purple-400' }
    }
  },
  animal: {
    name: '숲속 동물 친구들',
    icon: '🦁',
    desc: '사자, 개구리 등 장난꾸러기 서커스 테마입니다.',
    colors: {
      red: { emoji: '🐙', name: '문어 컵', bgClass: 'bg-red-500 hover:bg-red-650 shadow-red-500/30 text-white', borderClass: 'border-red-400' },
      yellow: { emoji: '🦁', name: '사자 컵', bgClass: 'bg-amber-500 hover:bg-amber-550 shadow-amber-500/30 text-yellow-950', borderClass: 'border-amber-400' },
      blue: { emoji: '🐳', name: '고래 컵', bgClass: 'bg-sky-500 hover:bg-sky-600 shadow-sky-500/30 text-white', borderClass: 'border-sky-400' },
      green: { emoji: '🐸', name: '개구리 컵', bgClass: 'bg-green-500 hover:bg-green-600 shadow-green-500/30 text-white', borderClass: 'border-green-400' },
      black: { emoji: '🐻', name: '아기곰 컵', bgClass: 'bg-orange-900 hover:bg-orange-950 shadow-orange-950/30 text-orange-100', borderClass: 'border-orange-850' }
    }
  }
};

interface CupCard {
  id: string;
  pattern: CupColorKey[];
  direction: 'vertical' | 'horizontal';
  themeWord: string; // IB 성격 단어
  themeDesc: string; // 설명
}

const CARDS_POOL: CupCard[] = [
  { id: '1', pattern: ['red', 'yellow', 'blue', 'green', 'black'], direction: 'horizontal', themeWord: '성찰하는 사람', themeDesc: '스스로의 행동과 학습을 깊이 되돌아보며 성장의 발판을 삼아요.' },
  { id: '2', pattern: ['black', 'green', 'blue', 'yellow', 'red'], direction: 'horizontal', themeWord: '도전하는 사람', themeDesc: '새로운 도전과 변화를 두려워하지 않고 열린 마인드로 맞서요.' },
  { id: '3', pattern: ['blue', 'black', 'red', 'green', 'yellow'], direction: 'vertical', themeWord: '배려하는 사람', themeDesc: '타인의 감정을 공감하고 주위 커뮤니티에 따뜻한 도움을 줍니다.' },
  { id: '4', pattern: ['yellow', 'green', 'red', 'black', 'blue'], direction: 'vertical', themeWord: '원칙을 지키는 사람', themeDesc: '지구 공동체의 정의와 정직, 공정함을 바탕으로 약속을 실천해요.' },
  { id: '5', pattern: ['green', 'yellow', 'black', 'red', 'blue'], direction: 'horizontal', themeWord: '열린 마음', themeDesc: '우리 고유의 문화뿐 아니라 다른 공동체의 관점과 생각도 소중히 여깁니다.' },
  { id: '6', pattern: ['blue', 'red', 'yellow', 'black', 'green'], direction: 'vertical', themeWord: '지식 있는 사람', themeDesc: '다양한 탐구를 넘어서 개념적 지식과 지역사회의 문제를 엮어 생각합니다.' },
  { id: '7', pattern: ['red', 'black', 'blue', 'green', 'yellow'], direction: 'horizontal', themeWord: '소통하는 사람', themeDesc: '정보와 의견을 다양한 언어와 수단으로 자신감 있고 창의적으로 표현해요.' },
  { id: '8', pattern: ['black', 'yellow', 'green', 'blue', 'red'], direction: 'vertical', themeWord: '균형 잡힌 사람', themeDesc: '지적, 신체적, 조화로운 성장을 통해 삶의 균형을 올바르게 맞춰갑니다.' },
  { id: '9', pattern: ['green', 'blue', 'red', 'yellow', 'black'], direction: 'horizontal', themeWord: '생각하는 사람', themeDesc: '복잡한 문제도 주저하지 않고 비판적이고 창의적인 사색으로 다가갑니다.' },
  { id: '10', pattern: ['yellow', 'red', 'blue', 'black', 'green'], direction: 'vertical', themeWord: '탐구하는 사람', themeDesc: '배움에 대한 적극적인 호기심을 지니고 일평생 질문을 던지는 사람입니다.' },
  { id: '11', pattern: ['blue', 'green', 'yellow', 'red', 'black'], direction: 'horizontal', themeWord: '글로벌 마인드', themeDesc: '나와 타인이 서로 다를 수 있음을 인정하며 세계 평화에 기여합니다.' },
  { id: '12', pattern: ['red', 'yellow', 'green', 'blue', 'black'], direction: 'vertical', themeWord: '개념적 이해', themeDesc: '단순 지식 암기를 뛰어넘어 여러 교과에 스며 있는 원리를 깊이 꿰뚫어봅니다.' }
];

interface CupHalliGalliGameProps {
  soundEnabled: boolean;
}

export const CupHalliGalliGame = ({ soundEnabled }: CupHalliGalliGameProps) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [gameMode, setGameMode] = useState<'computer' | 'solo'>('computer');
  const [selectedTheme, setSelectedTheme] = useState<ThemeKey>('fruit'); // 과일 테마가 기본
  const [cpuDifficulty, setCpuDifficulty] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [totalRound, setTotalRound] = useState<number>(5);
  const [currentRound, setCurrentRound] = useState<number>(1);
  
  // 스코어
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [cpuScore, setCpuScore] = useState<number>(0);

  // 나홀로 도전용 시간 타이머
  const [elapsedTime, setElapsedTime] = useState<number>(0);
  const [isTimerRunning, setIsTimerRunning] = useState<boolean>(false);
  const [bestSoloRecord, setBestSoloRecord] = useState<number | null>(null);

  const [currentCard, setCurrentCard] = useState<CupCard>(CARDS_POOL[0]);
  const [deck, setDeck] = useState<CupCard[]>([]);

  // 실시간 배치 중인 유저의 컵 조립 바구니
  const [userCups, setUserCups] = useState<CupColorKey[]>([]);
  // 유저 클릭/드래그용 리저브(아직 바구니에 안 들어간 컵들)
  const [availableCups, setAvailableCups] = useState<CupColorKey[]>(['red', 'yellow', 'blue', 'green', 'black']);

  const [feedback, setFeedback] = useState<string>('카드의 패턴 순서대로 컵을 조립하고 중앙의 종을 누르세요!');
  const [feedbackType, setFeedbackType] = useState<'normal' | 'correct' | 'wrong' | 'cpu_win'>('normal');

  // 드래그를 관리하기 위한 인덱스 레퍼런스
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
  const [draggedColor, setDraggedColor] = useState<CupColorKey | null>(null);

  // 타이머 작동 용도
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 로컬 컴퓨터 자동 매칭용 타이머
  const cpuTimerRef = useRef<NodeJS.Timeout | null>(null);
  const acceptingBellRef = useRef<boolean>(true);

  // 로컬 최고 점수 로드
  useEffect(() => {
    try {
      const record = localStorage.getItem('ib_cuphalligalli_best');
      if (record) {
        setBestSoloRecord(parseFloat(record));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  // 사운드 이펙트 헬퍼
  const playSound = useCallback((type: 'start' | 'bell' | 'correct' | 'wrong' | 'cpu_win' | 'click' | 'drag') => {
    if (!soundEnabled) return;
    let url = ASSETS.sounds.joyful; // 기본값
    if (type === 'start') url = ASSETS.sounds.joyful;
    if (type === 'bell') url = ASSETS.sounds.correct;
    if (type === 'correct') url = ASSETS.sounds.correct;
    if (type === 'wrong') url = ASSETS.sounds.wrong;
    if (type === 'cpu_win') url = ASSETS.sounds.wrong;
    if (type === 'click') url = ASSETS.sounds.joyful;
    if (type === 'drag') url = ASSETS.sounds.joyful;
    
    const audio = new Audio(url);
    audio.volume = 0.35;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  // 나홀로 도전 시간 계산
  useEffect(() => {
    if (isTimerRunning && gameState === 'PLAYING') {
      const startTime = Date.now() - elapsedTime * 1000;
      timerIntervalRef.current = setInterval(() => {
        const diff = (Date.now() - startTime) / 1000;
        setElapsedTime(parseFloat(diff.toFixed(2)));
      }, 30);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [isTimerRunning, gameState]);

  // 라운드 최초 진입 세팅
  const initRound = useCallback((roundIndex: number, newDeck: CupCard[]) => {
    if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
    acceptingBellRef.current = true;
    
    const targetCard = newDeck[roundIndex - 1] || CARDS_POOL[Math.floor(Math.random() * CARDS_POOL.length)];
    setCurrentCard(targetCard);
    setUserCups([]);
    setAvailableCups(['red', 'yellow', 'blue', 'green', 'black']);
    
    if (gameMode === 'computer') {
      setFeedback('바구니에 완벽하게 컵을 정렬하고 컴퓨터보다 빠르게 종을 전율하며 치세요! 🔔');
    } else {
      setFeedback('타이머가 가동 중입니다! 신속 정확하게 쌓고 종(BELL)을 치세요! ⏱️');
    }
    setFeedbackType('normal');

    // 컴퓨터 대결 모드일 경우에만 작동하는 라이벌 타이머
    if (gameMode === 'computer') {
      let cpuDelay = 9500;
      if (cpuDifficulty === 'easy') cpuDelay = 11000 + Math.random() * 3500;
      if (cpuDifficulty === 'medium') cpuDelay = 7200 + Math.random() * 2000;
      if (cpuDifficulty === 'hard') cpuDelay = 4700 + Math.random() * 1000;

      cpuTimerRef.current = setTimeout(() => {
        if (!acceptingBellRef.current) return;
        handleCpuWin(targetCard);
      }, cpuDelay);
    }
  }, [cpuDifficulty, gameMode]);

  // AI가 앞서 대결에서 정답을 맞춘 시점
  const handleCpuWin = (targetCard: CupCard) => {
    acceptingBellRef.current = false;
    setCpuScore(prev => prev + 1);
    setFeedback(`컴퓨터가 한발 앞서 완벽히 컵을 쌓고 🔔벨을 울렸습니다! (해당 키워드: ${targetCard.themeWord}) 😭`);
    setFeedbackType('cpu_win');
    playSound('cpu_win');

    setTimeout(() => {
      progressRound();
    }, 3500);
  };

  // 다음 라운드 진행 컨트롤
  const progressRound = () => {
    if (currentRound < totalRound) {
      setCurrentRound(prev => {
        const next = prev + 1;
        initRound(next, deck);
        return next;
      });
    } else {
      // 대망의 게임 피날레
      setGameState('END');
      setIsTimerRunning(false);
      playSound('correct');
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.55 }
      });

      // 최고의 나홀로 챌린지 기록 검증 및 로컬스토리지 갱신
      if (gameMode === 'solo') {
        const nowRecord = elapsedTime;
        if (!bestSoloRecord || nowRecord < bestSoloRecord) {
          setBestSoloRecord(nowRecord);
          try {
            localStorage.setItem('ib_cuphalligalli_best', nowRecord.toString());
          } catch (e) {
            console.error(e);
          }
        }
      }
    }
  };

  // 새로운 시작
  const startNewGame = () => {
    playSound('start');
    const shuffledDeck = [...CARDS_POOL].sort(() => Math.random() - 0.5);
    setDeck(shuffledDeck);
    setPlayerScore(0);
    setCpuScore(0);
    setCurrentRound(1);
    setElapsedTime(0);
    setGameState('PLAYING');
    
    if (gameMode === 'solo') {
      setIsTimerRunning(true);
    } else {
      setIsTimerRunning(false);
    }

    setTimeout(() => {
      initRound(1, shuffledDeck);
    }, 100);
  };

  // 원본 박스에서 컵을 클릭하여 추가할 때
  const handleAddCup = (color: CupColorKey) => {
    if (!acceptingBellRef.current) return;
    playSound('click');
    setUserCups(prev => {
      if (prev.includes(color)) return prev;
      return [...prev, color];
    });
    setAvailableCups(prev => prev.filter(c => c !== color));
  };

  // 제작 바구니에서 임의 컵 클릭 시 다시 원복시킴
  const handleRemoveCup = (color: CupColorKey) => {
    if (!acceptingBellRef.current) return;
    playSound('click');
    setUserCups(prev => prev.filter(c => c !== color));
    setAvailableCups(prev => {
      const res = [...prev, color];
      return CUP_COLOR_KEYS.filter(k => res.includes(k));
    });
  };

  // ==========================================
  // [완벽한 순수 Drag & Drop 무설치 구현부]
  // ==========================================
  
  // 1-1. 사용 대기 상자에서 드래그 시작할 때
  const handleSourceDragStart = (e: React.DragEvent, color: CupColorKey) => {
    if (!acceptingBellRef.current) return;
    setDraggedColor(color);
    setDraggedIndex(null);
    e.dataTransfer.effectAllowed = 'move';
    playSound('drag');
  };

  // 1-2. 바구니 내부에 장착된 컵에서 드래그 시작할 때 (순서 스왑용)
  const handleBasketDragStart = (e: React.DragEvent, index: number) => {
    if (!acceptingBellRef.current) return;
    setDraggedIndex(index);
    setDraggedColor(null);
    e.dataTransfer.effectAllowed = 'move';
    playSound('drag');
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  // 1-3. 바구니 특정 위치 위로 지나갈 때
  const handleBasketDragOver = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    if (!acceptingBellRef.current) return;
    
    // 바구니 한도 내 순서 스왑 (실시간 스왑 애니메이션 피드백)
    if (draggedIndex !== null && draggedIndex !== targetIndex) {
      const reordered = [...userCups];
      const [removed] = reordered.splice(draggedIndex, 1);
      reordered.splice(targetIndex, 0, removed);
      setUserCups(reordered);
      setDraggedIndex(targetIndex);
    }
  };

  // 1-4. 완전 드랍 마감할 때
  const handleDropToBasketArea = (e: React.DragEvent, targetIndex?: number) => {
    e.preventDefault();
    if (!acceptingBellRef.current) return;

    // 만약 원본 대기소에서 끌고 온 새 친구인 경우
    if (draggedColor) {
      const color = draggedColor;
      
      setUserCups(prev => {
        if (prev.includes(color)) return prev;
        const reordered = [...prev];
        if (targetIndex !== undefined) {
          reordered.splice(targetIndex, 0, color);
        } else {
          reordered.push(color);
        }
        return reordered;
      });
      // 대기소에서 제거
      setAvailableCups(prev => prev.filter(c => c !== color));
      playSound('click');
    }

    setDraggedColor(null);
    setDraggedIndex(null);
  };

  const handleDragEnd = () => {
    setDraggedColor(null);
    setDraggedIndex(null);
  };

  // ==========================================
  // [종 치기 벨 정합성 연동]
  // ==========================================
  const handleRingBell = () => {
    if (!acceptingBellRef.current) return;
    playSound('bell');
    
    // 5개가 조립되어야 함
    if (userCups.length < 5) {
      setFeedback('바구니에 5개의 모든 컵이 완벽하게 결합되어야 합니다! 🥤');
      setFeedbackType('wrong');
      playSound('wrong');
      return;
    }

    // 미션 카드 패턴과 대조
    const isMatched = currentCard.pattern.every((color, index) => userCups[index] === color);

    if (isMatched) {
      acceptingBellRef.current = false;
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
      
      setPlayerScore(prev => prev + 1);
      setFeedback(`축하합니다! 완벽한 순서로 적재하고 🔔벨을 쳤습니다! [${currentCard.themeWord}]`);
      setFeedbackType('correct');
      playSound('correct');

      confetti({
        particleCount: 40,
        spread: 50,
        colors: ['#3b82f6', '#22c55e', '#fbbf24', '#ec4899']
      });

      setTimeout(() => {
        progressRound();
      }, 3500);
    } else {
      setFeedback('조립된 컵 순서가 미션과 다릅니다! 드래그나 클릭으로 조정을 시도하세요! ❌');
      setFeedbackType('wrong');
      playSound('wrong');
    }
  };

  useEffect(() => {
    return () => {
      if (cpuTimerRef.current) clearTimeout(cpuTimerRef.current);
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, []);

  const activeTheme = THEME_MAP[selectedTheme];

  return (
    <div className="flex flex-col h-full bg-slate-950 border-indigo-500/20 text-white p-3 md:p-5 relative overflow-y-auto select-none rounded-[1.5rem] md:rounded-[2.5rem]">
      
      {/* 1. START STATE (게임 진입로) */}
      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center py-6 px-4 text-center max-w-2xl mx-auto w-full">
          
          <div className="relative mb-5 flex gap-2">
            <div className="w-16 h-16 bg-teal-500/10 border-2 border-teal-400 rounded-3xl flex items-center justify-center shadow-xl animate-bounce text-3xl">
              🍓
            </div>
            <div className="w-16 h-16 bg-amber-500/10 border-2 border-amber-400 rounded-3xl flex items-center justify-center shadow-xl animate-bounce text-3xl delay-100">
              🦁
            </div>
            <div className="w-16 h-16 bg-indigo-505/10 border-2 border-indigo-400 rounded-3xl flex items-center justify-center shadow-xl animate-bounce text-3xl delay-200">
              🥤
            </div>
          </div>

          <h3 className="text-3xl md:text-4xl font-extrabold mb-1 bg-gradient-to-r from-teal-400 via-amber-300 to-indigo-400 bg-clip-text text-transparent tracking-tight">
            IB 만능 컵할리갈리 🥤🔔
          </h3>
          
          <p className="text-zinc-400 text-xs md:text-sm font-semibold max-w-md mx-auto leading-relaxed mb-6">
            반*아 학생이 기획한 최고 인기 보드게임! 카드 지령 순서대로 아래 컵을 정렬해 보세요. 드래그해서 위치를 순식간에 교체할 수 있습니다!
          </p>

          <div className="w-full bg-slate-900/80 border border-slate-800 p-5 rounded-3xl mb-6 space-y-4 text-left text-xs md:text-sm">
            
            {/* 플레이 모드 선택 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="font-bold text-zinc-300 flex items-center gap-1">
                🎮 게임 플레이 모드
              </span>
              <div className="flex gap-2">
                <button
                  onClick={() => setGameMode('computer')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full font-black text-xs transition-all border flex items-center justify-center gap-1 ${
                    gameMode === 'computer'
                      ? 'bg-gradient-to-r from-teal-400 to-emerald-500 border-teal-300 text-slate-950 font-black'
                      : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Computer className="w-3.5 h-3.5" />
                  컴퓨터 AI 대결
                </button>
                <button
                  onClick={() => setGameMode('solo')}
                  className={`flex-1 sm:flex-none px-4 py-1.5 rounded-full font-black text-xs transition-all border flex items-center justify-center gap-1 ${
                    gameMode === 'solo'
                      ? 'bg-gradient-to-r from-amber-400 to-yellow-500 border-amber-300 text-slate-950 font-black'
                      : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Hourglass className="w-3.5 h-3.5" />
                  나홀로 최고기록 도전
                </button>
              </div>
            </div>

            {/* 과일 / 동물 / 오리지널 테마 지정 */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
              <span className="font-bold text-zinc-300">🍉 과일 & 동물 색상 선택</span>
              <div className="flex gap-1.5">
                {(Object.keys(THEME_MAP) as ThemeKey[]).map(theme => (
                  <button
                    key={theme}
                    onClick={() => setSelectedTheme(theme)}
                    className={`px-3 py-1.5 rounded-full text-xs font-black transition-all border flex items-center gap-1 ${
                      selectedTheme === theme
                        ? 'bg-indigo-600 border-indigo-400 text-white font-black'
                        : 'bg-slate-950 border-slate-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{THEME_MAP[theme].icon}</span>
                    <span>{THEME_MAP[theme].name.split(' ')[0]}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* AI 난이도 대조 (컴퓨터 모드전용) */}
            {gameMode === 'computer' && (
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <span className="font-bold text-zinc-400">🤖 AI 컴퓨터 성능 (신속도)</span>
                <div className="flex gap-1.5">
                  {(['easy', 'medium', 'hard'] as const).map(diff => (
                    <button
                      key={diff}
                      onClick={() => setCpuDifficulty(diff)}
                      className={`px-3 py-1 rounded-full font-black text-[10px] md:text-xs transition-all border ${
                        cpuDifficulty === diff 
                          ? 'bg-rose-500 border-rose-400 text-white' 
                          : 'bg-slate-950 border-slate-800 text-zinc-500 hover:text-zinc-300'
                      }`}
                    >
                      {diff === 'easy' ? '초보' : diff === 'medium' ? '보통' : '지옥'}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* 라운드 수 */}
            <div className="flex items-center justify-between pt-1">
              <span className="font-bold text-zinc-400">🎯 최종 도달 라운드</span>
              <div className="flex gap-1.5">
                {[3, 5, 8].map(r => (
                  <button
                    key={r}
                    onClick={() => setTotalRound(r)}
                    className={`px-3.5 py-1 rounded-full font-black text-xs transition-all border ${
                      totalRound === r 
                        ? 'bg-teal-400 border-teal-300 text-slate-950 font-black' 
                        : 'bg-slate-950 border-slate-800 text-zinc-500 hover:text-zinc-300'
                    }`}
                  >
                    {r}판
                  </button>
                ))}
              </div>
            </div>

            {/* 최고 기록 안내 */}
            {bestSoloRecord && gameMode === 'solo' && (
              <div className="bg-amber-500/10 border border-amber-500/20 text-amber-400 p-2.5 rounded-2xl flex items-center gap-2 mt-2">
                <Trophy className="w-4 h-4 shrink-0 animate-pulse" />
                <span className="font-medium text-xs">
                  나의 혼자하기 최고 기록: <strong className="font-mono text-sm">{bestSoloRecord}초</strong> ({totalRound}라운드 기준)
                </span>
              </div>
            )}
          </div>

          <Button 
            onClick={startNewGame} 
            className="w-full py-4 text-base font-black bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 rounded-2xl shadow-xl shadow-teal-500/10 flex items-center justify-center gap-2 border border-teal-400"
          >
            <Play className="w-5 h-5 fill-current" />
            선택 테마로 게임 시작!
          </Button>
        </div>
      )}

      {/* 2. PLAYING STATE */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col justify-between">
          
          {/* Header Dashboard HUD */}
          <div className="flex items-center justify-between bg-slate-900 border border-slate-800 p-3 rounded-2xl mb-4">
            <div className="flex items-center gap-2">
              <span className="text-[10px] bg-slate-800 text-zinc-400 px-2 py-0.5 rounded-md font-bold">ROUND</span>
              <span className="font-mono text-sm md:text-base font-black text-teal-400">{currentRound} / {totalRound}</span>
              <span className="text-[10px] hidden sm:inline-block bg-indigo-950 text-indigo-300 border border-indigo-900/60 px-2.5 py-0.5 rounded-full font-bold ml-1">
                {activeTheme.name} ({activeTheme.icon})
              </span>
            </div>
            
            {/* 모드별 우측 HUD 계측기 */}
            <div>
              {gameMode === 'computer' ? (
                <div className="flex gap-4">
                  <div className="flex items-center gap-1">
                    <User className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">나:</span>
                    <span className="font-mono text-sm md:text-base font-black text-emerald-400">{playerScore}점</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Computer className="w-4 h-4 text-rose-450" />
                    <span className="text-xs font-semibold">컴퓨터:</span>
                    <span className="font-mono text-sm md:text-base font-black text-rose-400">{cpuScore}점</span>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Hourglass className="w-4 h-4 text-amber-400 animate-spin" />
                  <span className="text-xs font-semibold">소요 소수점 시간:</span>
                  <span className="font-mono text-base md:text-lg font-black text-amber-400 bg-amber-950/20 px-3 py-0.5 rounded-full border border-amber-900/20">{elapsedTime}초</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4 flex-1 items-stretch">
            
            {/* [카드 지령판 - 좌측 영역] */}
            <div className="md:col-span-5 flex flex-col items-center justify-center bg-slate-900/40 rounded-[2rem] p-3 border border-slate-800/50 shadow-inner min-h-[240px]">
              <div className="text-center font-bold text-teal-400 text-[10px] mb-2 tracking-wider flex items-center gap-1 bg-teal-950/60 py-1 px-3 rounded-full border border-teal-900/40">
                <Sparkle className="w-3.5 h-3.5" />
                <span>미션 지령 카드</span>
              </div>
              
              <div className="relative w-[170px] xs:w-[190px] sm:w-[210px] aspect-[5/7] bg-white text-zinc-950 rounded-2xl p-4 shadow-2xl border-4 border-amber-300 flex flex-col justify-between">
                <div>
                  <h4 className="text-center font-black text-xs sm:text-sm text-indigo-950 line-clamp-1 border-b border-indigo-100 pb-1 mb-1">
                    {currentCard.themeWord}
                  </h4>
                  <p className="text-[8.5px] sm:text-[9.5px] text-zinc-500 text-center leading-normal font-bold">
                    {currentCard.themeDesc}
                  </p>
                </div>

                {/* 컵 배치 패턴 표시 */}
                <div className="relative flex flex-col items-center justify-center my-auto py-2">
                  
                  {currentCard.direction === 'vertical' ? (
                    /* 세로 빌딩형 스택 구조체 */
                    <div className="flex flex-col-reverse items-center justify-center gap-1.5 bg-slate-50 border border-slate-150 p-2.5 rounded-xl w-full min-h-[175px] relative">
                      {/* 중앙 세로 지지대 기둥 (디렉션 명료화) */}
                      <div className="absolute top-3 bottom-8 w-1 bg-indigo-100 rounded" />
                      
                      {currentCard.pattern.map((color, index) => {
                        const detail = activeTheme.colors[color];
                        return (
                          <motion.div
                            key={index}
                            initial={{ scale: 0.8, y: 10, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            transition={{ delay: index * 0.08 }}
                            className="relative z-10 flex items-center justify-center bg-white shadow-md border border-slate-200/80 rounded-full w-9 h-9 sm:w-10 sm:h-10 hover:scale-110 transition-transform"
                          >
                            {/* 동물/과일 본연의 귀여운 모습 전시 */}
                            <span className="text-xl sm:text-2xl select-none leading-none">{detail.emoji}</span>
                            
                            {/* 우측 층수 레이블로 완벽 정보 전달 */}
                            <span className="absolute -right-8 bg-zinc-200/80 text-[7px] px-1 py-0.5 rounded text-zinc-800 font-extrabold leading-none scale-90">
                              {index + 1}층
                            </span>
                          </motion.div>
                        );
                      })}

                      {/* 바닥 기반 판 (아래에서부터 시작임을 명료화) */}
                      <div className="w-4/5 h-2.5 bg-indigo-600 rounded-full mt-1 relative z-10 flex items-center justify-center shadow-sm">
                        <span className="text-[7.5px] text-white font-extrabold pb-0.5 select-none leading-none">
                          🌱 1층 바닥 (시작점)
                        </span>
                      </div>
                    </div>
                  ) : (
                    /* 가로 정렬형 구조체 */
                    <div className="flex flex-col items-center justify-center gap-2 bg-slate-50 border border-slate-150 p-2 rounded-xl w-full min-h-[175px]">
                      <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-2">
                        {currentCard.pattern.map((color, index) => {
                          const detail = activeTheme.colors[color];
                          return (
                            <motion.div
                              key={index}
                              initial={{ scale: 0.8, x: -10, opacity: 0 }}
                              animate={{ scale: 1, x: 0, opacity: 1 }}
                              transition={{ delay: index * 0.08 }}
                              className="flex flex-col items-center gap-1 relative"
                            >
                              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-white shadow-md border border-slate-200 rounded-full flex items-center justify-center hover:scale-110 transition-transform">
                                <span className="text-lg sm:text-xl select-none leading-none">{detail.emoji}</span>
                              </div>
                              <span className="text-[7px] text-zinc-500 font-extrabold scale-90">
                                {index + 1}열
                              </span>
                            </motion.div>
                          );
                        })}
                      </div>
                      
                      <div className="text-[7.5px] text-zinc-400 font-black mt-2 leading-none flex items-center gap-1">
                        <span className="bg-emerald-100 text-emerald-800 px-1 py-0.5 rounded">시작(왼쪽)</span>
                        <span className="text-emerald-500 font-black">➡️</span>
                        <span className="bg-rose-100 text-rose-800 px-1 py-0.5 rounded">끝(오른쪽)</span>
                      </div>
                    </div>
                  )}
                </div>

                <div className="text-center font-bold text-[8.5px] py-1 bg-slate-100 border border-slate-250 rounded-xl leading-none">
                  {currentCard.direction === 'vertical' ? (
                    <span className="text-indigo-600 flex items-center justify-center gap-0.5 font-black">
                      ▲ 아래층(🌱1층 바닥)부터 위로 쌓으세요!
                    </span>
                  ) : (
                    <span className="text-emerald-600 flex items-center justify-center gap-0.5 font-black">
                      ◀▶ 왼쪽(1열)부터 오른쪽 순서로 나열하세요!
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* [중앙 벨 및 수동 조립 완료 영역] */}
            <div className="md:col-span-3 flex flex-col items-center justify-center select-none py-4 gap-4">
              <motion.button
                whileHover={acceptingBellRef.current ? { scale: 1.08 } : {}}
                whileTap={acceptingBellRef.current ? { scale: 0.92 } : {}}
                onClick={handleRingBell}
                disabled={!acceptingBellRef.current}
                className={`relative w-24 h-24 sm:w-28 sm:h-28 rounded-full flex flex-col items-center justify-center border-4 shadow-2xl transition-all cursor-pointer ${
                  acceptingBellRef.current
                    ? 'bg-gradient-to-b from-amber-400 to-yellow-500 border-amber-300 hover:brightness-110 active:brightness-95 animate-bounce shadow-yellow-400/20'
                    : 'bg-zinc-800 border-zinc-700 opacity-60 cursor-not-allowed'
                }`}
              >
                <div className="absolute -top-1 w-8 h-2.5 bg-neutral-200 border border-amber-200 rounded-full" />
                <div className="w-16 h-16 sm:w-18 sm:h-18 rounded-full bg-yellow-600/30 flex items-center justify-center">
                  <BellRing className={`w-8 h-8 sm:w-10 sm:h-10 text-white ${acceptingBellRef.current ? 'animate-wiggle' : ''}`} />
                </div>
                <span className="text-[10px] font-black text-yellow-950 mt-1 uppercase tracking-wider bg-yellow-300 px-1.5 py-0.5 rounded-full leading-none">
                  BELL
                </span>
              </motion.button>
              
              <div className="text-center font-bold space-y-1">
                <span className="text-[10px] text-zinc-400 block">조립 순서 완성 즉시 벨 타격!</span>
                <span className="text-[9px] text-yellow-400 bg-amber-950/40 px-2 py-0.5 rounded-full border border-amber-900/30 font-black inline-block">
                  {gameMode === 'computer' ? 'AI 성능: ' + cpuDifficulty.toUpperCase() : '기록 단축하기!'}
                </span>
              </div>
            </div>

            {/* [유저 대기 컵 및 조합 플레이스 홀더 전용 바구니] */}
            <div className="md:col-span-4 flex flex-col justify-between gap-3">
              
              {/* 내 조립 상태 바구니 */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDropToBasketArea(e)}
                className="bg-slate-900/80 p-4 rounded-3xl border border-slate-800 relative flex flex-col items-center min-h-[200px] justify-between shadow-xl"
              >
                <div className="w-full flex items-center justify-between pb-2 border-b border-slate-800/30">
                  <span className="text-[10px] bg-teal-500/10 border border-teal-500/20 text-teal-400 font-extrabold px-2.5 py-1 rounded-full flex items-center gap-1">
                    <ArrowRightLeft className="w-3 h-3 text-teal-400" />
                    나의 조동 바구니 ({userCups.length}/5)
                  </span>
                  
                  {userCups.length > 0 && (
                    <button
                      onClick={() => {
                        playSound('click');
                        setUserCups([]);
                        setAvailableCups(['red', 'yellow', 'blue', 'green', 'black']);
                      }}
                      className="text-red-400 hover:text-red-350 font-black text-[9px] hover:bg-red-950/30 border border-red-500/10 rounded-md px-2 py-0.5 transition-all"
                    >
                      초기화
                    </button>
                  )}
                </div>

                {/* 여기에 컵들이 가로로 정렬되거나 세밀하게 정돈 */}
                <div className="flex items-end justify-center gap-1.5 h-24 w-full mt-4 mb-2">
                  <AnimatePresence mode="popLayout">
                    {userCups.length === 0 ? (
                      <div className="text-zinc-600 font-bold text-center text-xs h-full flex flex-col items-center justify-center p-2">
                        <span>아래 컵을 끌어오거나(드래그),</span>
                        <span>번개 클릭으로 수동 채우세요!</span>
                      </div>
                    ) : (
                      userCups.map((color, index) => {
                        const detail = activeTheme.colors[color];
                        return (
                          <motion.div
                            key={color}
                            layout
                            initial={{ scale: 0.6, y: 15, opacity: 0 }}
                            animate={{ scale: 1, y: 0, opacity: 1 }}
                            exit={{ scale: 0.6, y: -15, opacity: 0 }}
                            
                            // 드래그 및 드롭 순서 변경 관련 핸들러 추가
                            draggable={acceptingBellRef.current}
                            onDragStart={(e) => handleBasketDragStart(e, index)}
                            onDragOver={(e) => handleBasketDragOver(e, index)}
                            onDrop={(e) => handleDropToBasketArea(e, index)}
                            onDragEnd={handleDragEnd}
                            
                            onClick={() => handleRemoveCup(color)}
                            className={`w-9 h-14 sm:w-11 sm:h-16 rounded-t-xl border-3 ${detail.bgClass} ${detail.borderClass} relative flex flex-col items-center justify-between shadow-xl cursor-pointer hover:-translate-y-1.5 transition-transform`}
                          >
                            <span className="text-[9px] font-black text-white/50 pt-0.5 scale-90">
                              {index + 1}
                            </span>
                            <span className="text-lg sm:text-xl mb-1 select-none pointer-events-none">{detail.emoji}</span>
                            
                            {/* 안내 레이블 달기 */}
                            <span className="text-[7.5px] font-black bg-black/40 text-white shrink-0 select-none pb-0.5 leading-none w-full text-center rounded-sm">
                              {currentCard.direction === 'vertical' ? `${index + 1}층` : `${index + 1}열`}
                            </span>
                          </motion.div>
                        );
                      })
                    )}
                  </AnimatePresence>
                </div>

                <div className="flex items-center gap-1 text-[8.5px] text-zinc-500 font-extrabold pb-0.5">
                  <Info className="w-3 h-3 text-zinc-500 shrink-0" />
                  <span>컵을 드래그해서 좌우 정렬 순서를 바꿀 수 있습니다!</span>
                </div>
              </div>

              {/* 컵 조작용 선택함 */}
              <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-3xl relative">
                <span className="text-[10px] text-zinc-400 font-extrabold block mb-2">
                  🥤 꺼낼 컵 수납함 (드래그 지원)
                </span>
                
                <div className="flex gap-2 justify-center py-1">
                  {CUP_COLOR_KEYS.map((color) => {
                    const isUsed = !availableCups.includes(color);
                    const detail = activeTheme.colors[color];
                    return (
                      <div
                        key={color}
                        draggable={!isUsed && acceptingBellRef.current}
                        onDragStart={(e) => handleSourceDragStart(e, color)}
                        onDragEnd={handleDragEnd}
                        onClick={() => {
                          if (!isUsed) handleAddCup(color);
                        }}
                        className={`w-10 h-16 sm:w-12 sm:h-18 rounded-t-xl border-3 flex flex-col items-center justify-center shadow-lg relative transition-transform ${
                          isUsed 
                            ? 'bg-zinc-800/10 border-slate-850 opacity-15 cursor-not-allowed scale-90 filter brightness-50' 
                            : `${detail.bgClass} ${detail.borderClass} hover:scale-110 active:scale-95 cursor-pointer`
                        }`}
                      >
                        <span className="text-xl sm:text-2xl mb-1.5 select-none pointer-events-none">{detail.emoji}</span>
                        <div className="absolute bottom-3 left-0 right-0 h-1 bg-white/10" />
                        <span className="text-[7.5px] font-black opacity-8 w-full text-center bottom-0.5 absolute select-none leading-none pointer-events-none">{detail.name.split(' ')[0]}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* 피드백 알림바 */}
          <div className={`mt-3 p-3 rounded-2xl border text-center transition-all ${
            feedbackType === 'correct' 
              ? 'bg-emerald-950/70 border-emerald-550/40 text-emerald-300' 
              : feedbackType === 'wrong'
                ? 'bg-rose-950/70 border-rose-550/40 text-rose-300 animate-shake'
                : feedbackType === 'cpu_win'
                  ? 'bg-amber-950/70 border-amber-550/40 text-amber-350'
                  : 'bg-slate-900 border-slate-800 text-zinc-300'
          }`}>
            <p className="text-xs md:text-sm font-black leading-relaxed flex items-center justify-center gap-1.5">
              {feedbackType === 'correct' && <Sparkles className="w-5 h-5 text-emerald-400 animate-spin" />}
              <span>{feedback}</span>
            </p>
          </div>
        </div>
      )}

      {/* 3. END STATE (결승전 집계) */}
      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center py-8 px-4 text-center max-w-lg mx-auto">
          
          <div className="w-20 h-20 bg-amber-400/14 border-2 border-amber-400 rounded-3xl flex items-center justify-center mb-5 text-amber-400 animate-pulse">
            <Award className="w-10 h-10" />
          </div>

          <h3 className="text-2xl md:text-3xl font-extrabold mb-1.5 text-yellow-400">도전이 끝났습니다!</h3>
          <p className="text-zinc-400 text-xs md:text-sm font-semibold mb-6">
            모든 라운드를 멋지게 소화해 내셨습니다!
          </p>

          <div className="w-full bg-slate-900 border border-slate-800 rounded-3xl p-6 mb-6 space-y-4 shadow-xl">
            {gameMode === 'computer' ? (
              <div className="flex justify-around items-center">
                <div className="text-center font-bold">
                  <p className="text-slate-400 text-xs mb-1">인간 전사 득점</p>
                  <span className="text-4xl text-emerald-400 font-extrabold font-mono">{playerScore}</span>
                  <span className="text-xs text-emerald-400 font-bold ml-1">점</span>
                </div>
                <div className="h-10 w-0.5 bg-slate-800" />
                <div className="text-center font-bold">
                  <p className="text-slate-400 text-xs mb-1">컴퓨터 AI 득점</p>
                  <span className="text-4xl text-rose-450 font-extrabold font-mono">{cpuScore}</span>
                  <span className="text-xs text-rose-400 font-bold ml-1">점</span>
                </div>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-zinc-400 text-xs mb-1">나홀로 5라운드 최종 완성 시간</p>
                <div className="text-5xl text-amber-400 font-black font-mono my-2">
                  {elapsedTime}초
                </div>
                {bestSoloRecord && elapsedTime <= bestSoloRecord && (
                  <p className="text-xs text-pink-400 font-black animate-pulse">
                    ✨ 대박! 나홀로 챌린지 역대 최고 신기록을 갱신하였습니다! ✨
                  </p>
                )}
              </div>
            )}

            <div className="border-t border-slate-800/80 pt-4">
              <p className="text-sm md:text-base font-extrabold text-zinc-200">
                {gameMode === 'computer' ? (
                  playerScore > cpuScore 
                    ? '🏅 컴퓨터를 완전히 물리치셨습니다! 진정한 두뇌 원칙의 지배자!' 
                    : playerScore < cpuScore 
                      ? '🤖 컴퓨터 AI의 간발의 차 승리! 다음엔 더 서둘러 보세요!' 
                      : '🤝 멋진 무승부 대결이었습니다! 환상적인 성찰력을 발휘하셨네요!'
                ) : (
                  '⏱️ 기록을 단축하기 위해 한 판 더 신나게 도전해 볼까요? 화이팅!'
                )}
              </p>
            </div>
          </div>

          <div className="flex gap-3 w-full">
            <Button
              onClick={() => setGameState('START')}
              variant="secondary"
              className="flex-1 py-3.5 bg-slate-900 border text-white border-slate-800 hover:bg-slate-800 rounded-2xl font-bold"
            >
              대기실로
            </Button>
            <Button
              onClick={startNewGame}
              className="flex-1 py-3.5 bg-teal-500 hover:bg-teal-600 text-slate-950 font-extrabold shadow-lg shadow-teal-500/10 border border-teal-400 rounded-2xl"
            >
              다시 도전
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
