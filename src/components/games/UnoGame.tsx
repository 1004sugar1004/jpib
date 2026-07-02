import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HelpCircle, Info, BookOpen, Heart, X, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface UnoGameProps {
  soundEnabled: boolean;
}

// ==========================================
// 1. IB 테마 고정 데이터 세팅
// ==========================================
const COLORS = ['Red', 'Blue', 'Yellow', 'Green'];
const LEARNER_PROFILES = [
  '탐구하는 사람', '지식이 풍부한 사람', '사고하는 사람', '소통하는 사람', '원칙을 지키는 사람',
  '열린 마음을 가진 사람', '배려하는 사람', '도전하는 사람', '균형 잡힌 사람', '성찰하는 사람'
];

const IB_EXPLANATIONS: Record<string, string> = {
  '관점': "👀 [관점 - 스킵]: 서로 다른 관점을 경청하기 위해 다음 사람은 쉽니다!",
  '변화': "🌱 [변화 - 리버스]: 상황이 완전히 반대로 변화합니다!",
  '인과관계': "💥 [인과관계 - 드로우2]: 나의 행동(원인)으로 인해 상대가 2장을 받습니다(결과).",
  '형태': "🎨 [형태 - 와일드]: 사물의 모양을 관찰하며 원하는 색으로 바꿉니다.",
  '관계': "🔗 [관계 - 와일드]: 카드 간의 새로운 연결 고리를 만들어 색을 변경합니다.",
  '기능': "⚙️ [기능 - 와일드4]: 장치의 강력한 기능 작동! 색을 바꾸고 상대에게 4장을 먹입니다.",
  '책임': "🌍 [책임 - 와일드4]: 선택에는 책임이 따릅니다. 상대에게 4장 드로우의 책임을 넘깁니다."
};

const COLOR_MAP: Record<string, string> = {
  Red: 'from-red-500 to-rose-600 border-red-400 text-white shadow-red-500/30',
  Blue: 'from-blue-500 to-indigo-600 border-blue-400 text-white shadow-blue-500/30',
  Yellow: 'from-amber-400 to-yellow-500 border-amber-300 text-slate-900 shadow-yellow-500/20',
  Green: 'from-emerald-500 to-green-600 border-emerald-400 text-white shadow-emerald-500/30',
  Wild: 'from-slate-800 to-zinc-900 border-zinc-700 text-white shadow-black/40'
};

const BG_COLOR_MAP: Record<string, string> = { 
  Red: 'bg-red-600', 
  Blue: 'bg-blue-600', 
  Yellow: 'bg-amber-500 text-slate-900', 
  Green: 'bg-emerald-600' 
};

interface UnoCard {
  id: string;
  color: string;
  type: string;
  value: string | number;
  label: string;
}

// 108장 셔플 덱 생성기
const buildDeck = (): UnoCard[] => {
  const tempDeck: UnoCard[] = [];
  let id = 0;
  COLORS.forEach(color => {
    LEARNER_PROFILES.forEach((profile, idx) => {
      const count = idx === 0 ? 1 : 2;
      for (let i = 0; i < count; i++) {
        tempDeck.push({ id: `c_${id++}`, color, type: 'number', value: idx, label: profile });
      }
    });
    const specActions = [{ v: 'Skip', l: '관점' }, { v: 'Reverse', l: '변화' }, { v: 'DrawTwo', l: '인과관계' }];
    specActions.forEach(act => {
      for (let i = 0; i < 2; i++) {
        tempDeck.push({ id: `c_${id++}`, color, type: 'action', value: act.v, label: act.l });
      }
    });
  });
  for (let i = 0; i < 2; i++) {
    tempDeck.push({ id: `c_${id++}`, color: 'Wild', type: 'wild', value: 'Wild', label: '형태' });
    tempDeck.push({ id: `c_${id++}`, color: 'Wild', type: 'wild', value: 'Wild', label: '관계' });
    tempDeck.push({ id: `c_${id++}`, color: 'Wild', type: 'wild_four', value: 'WildDrawFour', label: '기능' });
    tempDeck.push({ id: `c_${id++}`, color: 'Wild', type: 'wild_four', value: 'WildDrawFour', label: '책임' });
  }
  return tempDeck.sort(() => Math.random() - 0.5);
};

export const UnoGame: React.FC<UnoGameProps> = ({ soundEnabled }) => {
  const [difficulty, setDifficulty] = useState('normal');
  const [playerCount, setPlayerCount] = useState(2);
  const [deck, setDeck] = useState<UnoCard[]>([]);
  const [discardPile, setDiscardPile] = useState<UnoCard[]>([]);
  const [hands, setHands] = useState<UnoCard[][]>([]);
  const [activeColor, setActiveColor] = useState('');
  const [currentTurn, setCurrentTurn] = useState<number>(-1); // -1 is game not started yet
  const [turnTrigger, setTurnTrigger] = useState(0);
  const [isClockwise, setIsClockwise] = useState(true);
  const [gameMessage, setGameMessage] = useState('세팅 후 게임 시작 버튼을 눌러주세요.');
  const [activeExplanation, setActiveExplanation] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWild, setPendingWild] = useState<any>(null);
  const [attackEffect, setAttackEffect] = useState(''); // 스크린 공격 이펙트 알림용
  const [showGuide, setShowGuide] = useState(false); // 가이드 모달용

  // Synchronously assigned refs on every render to guarantee absolute freshness and eliminate timing race conditions
  const handsRef = useRef<UnoCard[][]>([]);
  const deckRef = useRef<UnoCard[]>([]);
  const activeColorRef = useRef<string>('');
  const discardPileRef = useRef<UnoCard[]>([]);
  const isClockwiseRef = useRef<boolean>(true);
  const playerCountRef = useRef<number>(2);
  const difficultyRef = useRef<string>('normal');

  handsRef.current = hands;
  deckRef.current = deck;
  activeColorRef.current = activeColor;
  discardPileRef.current = discardPile;
  isClockwiseRef.current = isClockwise;
  playerCountRef.current = playerCount;
  difficultyRef.current = difficulty;

  // Shuffled discard pile replication when draw deck runs out
  const drawCards = (
    count: number,
    currentDeck: UnoCard[],
    currentDiscard: UnoCard[]
  ): { drawn: UnoCard[]; newDeck: UnoCard[]; newDiscard: UnoCard[] } => {
    let tempDeck = [...currentDeck];
    let tempDiscard = [...currentDiscard];
    const drawnCards: UnoCard[] = [];

    for (let i = 0; i < count; i++) {
      if (tempDeck.length === 0) {
        if (tempDiscard.length > 1) {
          const top = tempDiscard.pop()!; // Save current top card
          const rest = tempDiscard;
          const shuffled = rest.sort(() => Math.random() - 0.5);
          tempDeck = shuffled;
          tempDiscard = [top];
        } else {
          break; // No cards left to shuffle
        }
      }
      const card = tempDeck.shift();
      if (card) {
        drawnCards.push(card);
      }
    }

    return { drawn: drawnCards, newDeck: tempDeck, newDiscard: tempDiscard };
  };

  const startGame = () => {
    const freshDeck = buildDeck();
    const initHands: UnoCard[][] = [];
    for (let i = 0; i < playerCount; i++) {
      initHands.push(freshDeck.splice(0, 7));
    }
    let startCard = freshDeck.shift();
    while (startCard && startCard.color === 'Wild') {
      freshDeck.push(startCard);
      startCard = freshDeck.shift();
    }
    if (startCard) {
      setDeck(freshDeck);
      setHands(initHands);
      setDiscardPile([startCard]);
      setActiveColor(startCard.color);
      setCurrentTurn(0);
      setIsClockwise(true);
      setActiveExplanation('');
      setGameMessage('당신의 차례입니다! 어울리는 카드를 배치하세요.');
    }
  };

  const topCard = discardPile[discardPile.length - 1];

  const canPlayCard = (card: UnoCard) => {
    if (card.color === 'Wild') return true;
    if (card.color === activeColorRef.current) return true;
    const top = discardPileRef.current[discardPileRef.current.length - 1];
    if (top && card.type === top.type && card.value === top.value) return true;
    return false;
  };

  const handlePlayerDraw = () => {
    if (currentTurn !== 0) return;
    const { drawn, newDeck, newDiscard } = drawCards(1, deckRef.current, discardPileRef.current);
    if (drawn.length > 0) {
      const nextHands = [...handsRef.current];
      nextHands[0].push(drawn[0]);
      
      // Update refs immediately to avoid microtask lag
      handsRef.current = nextHands;
      deckRef.current = newDeck;

      setDeck(newDeck);
      setDiscardPile(newDiscard);
      setHands(nextHands);
      setGameMessage('카드를 1장 뽑았습니다. 다음 차례로 넘어갑니다.');
      passTurn(nextHands);
    } else {
      setGameMessage('더 이상 가져올 카드가 없습니다. 차례를 넘깁니다.');
      passTurn(handsRef.current);
    }
  };

  const playCard = (cardId: string, playerIdx: number) => {
    if (currentTurn !== playerIdx) return;
    const nextHands = [...handsRef.current];
    const card = nextHands[playerIdx].find(c => c.id === cardId);
    if (!card || !canPlayCard(card)) return;

    nextHands[playerIdx] = nextHands[playerIdx].filter(c => c.id !== cardId);
    setDiscardPile(prev => [...prev, card]);
    setHands(nextHands);
    
    // Update ref synchronously to bypass React rendering cycle gaps
    handsRef.current = nextHands;

    // 승리조건 체크
    if (nextHands[playerIdx].length === 0) {
      if (playerIdx === 0) {
        setGameMessage('🎉 완벽한 대승리입니다!!');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      } else {
        setGameMessage(`🤖 컴퓨터 ${playerIdx}번이 최종 승리했습니다.`);
      }
      setCurrentTurn(-1);
      return;
    }

    // 설명 노출
    if (IB_EXPLANATIONS[card.label]) {
      setActiveExplanation(IB_EXPLANATIONS[card.label]);
    }

    // 규칙 효과 발동 계산
    handleRuleLogic(card, playerIdx, nextHands);
  };

  const handleRuleLogic = (card: UnoCard, playerIdx: number, currentHands: UnoCard[][]) => {
    let skipNext = false;
    let drawCount = 0;
    let isWild = false;

    if (card.value === 'Skip') {
      skipNext = true;
    } else if (card.value === 'Reverse') {
      if (playerCountRef.current === 2) skipNext = true;
      else setIsClockwise(prev => !prev);
    } else if (card.value === 'DrawTwo') {
      drawCount = 2;
      skipNext = true;
      setAttackEffect('+2 ATTACK!');
    } else if (card.color === 'Wild') {
      isWild = true;
      if (card.value === 'WildDrawFour') {
        drawCount = 4;
        skipNext = true;
        setAttackEffect('+4 ULTIMATE ATTACK!');
      }
      if (playerIdx === 0) {
        setPendingWild({ card, skipNext, drawCount, currentHands });
        setShowColorPicker(true);
        return; // 유저 선택 대기
      } else {
        // AI 자동 컬러 선택
        const aiColor = COLORS[Math.floor(Math.random() * COLORS.length)];
        setActiveColor(aiColor);
        setGameMessage(`컴퓨터 ${playerIdx}번이 [${card.label}] 카드로 색상을 [${aiColor}]로 변경했습니다.`);
      }
    }

    if (!isWild) setActiveColor(card.color);
    setTimeout(() => setAttackEffect(''), 1000);
    applyTurnCalculations(skipNext, drawCount, currentHands);
  };

  const selectWildColor = (color: string) => {
    if (!pendingWild) return;
    const { skipNext, drawCount, currentHands } = pendingWild;
    setActiveColor(color);
    setShowColorPicker(false);
    setPendingWild(null);
    setTimeout(() => setAttackEffect(''), 1000);
    applyTurnCalculations(skipNext, drawCount, currentHands);
  };

  const applyTurnCalculations = (skipNext: boolean, drawCount: number, currentHands: UnoCard[][]) => {
    let nextDeck = [...deckRef.current];
    let nextHands = [...currentHands];
    let step = skipNext ? 2 : 1;
    let nextTurn = currentTurn;

    if (drawCount > 0) {
      let targetIdx = isClockwiseRef.current
        ? (currentTurn + 1) % playerCountRef.current
        : (currentTurn - 1 + playerCountRef.current) % playerCountRef.current;
      
      const { drawn, newDeck, newDiscard } = drawCards(drawCount, nextDeck, discardPileRef.current);
      nextHands[targetIdx] = [...nextHands[targetIdx], ...drawn];
      nextDeck = newDeck;

      setDeck(newDeck);
      setDiscardPile(newDiscard);
      setHands(nextHands);
    }

    if (isClockwiseRef.current) {
      nextTurn = (currentTurn + step) % playerCountRef.current;
    } else {
      nextTurn = (currentTurn - step + playerCountRef.current) % playerCountRef.current;
    }

    // Synchronize latest structural state elements inside the ref immediately
    handsRef.current = nextHands;
    deckRef.current = nextDeck;

    setCurrentTurn(nextTurn);
    setTurnTrigger(prev => prev + 1);
  };

  const passTurn = (currHands: UnoCard[][]) => {
    let nextTurn = isClockwiseRef.current
      ? (currentTurn + 1) % playerCountRef.current
      : (currentTurn - 1 + playerCountRef.current) % playerCountRef.current;
    
    handsRef.current = currHands;
    setCurrentTurn(nextTurn);
    setTurnTrigger(prev => prev + 1);
  };

  // 컴퓨터 인공지능 핸들러
  useEffect(() => {
    if (currentTurn === 0 || currentTurn === -1) return;

    const timer = setTimeout(() => {
      const currentHands = handsRef.current;
      const currentDeck = deckRef.current;
      const aiHand = currentHands[currentTurn];
      if (!aiHand) return;
      const playable = aiHand.filter(c => canPlayCard(c));

      if (playable.length > 0) {
        let chosen = playable[0];
        // 상급 모드 지능 고도화 (저격 시스템)
        const userHand = currentHands[0];
        if (difficultyRef.current === 'hard' && userHand && userHand.length <= 3) {
          chosen =
            playable.find(c => c.value === 'WildDrawFour' || c.value === 'DrawTwo') || playable[0];
        } else if (difficultyRef.current === 'normal') {
          chosen = playable.find(c => c.type === 'number') || playable[0];
        }
        playCard(chosen.id, currentTurn);
      } else {
        const nextHands = [...currentHands];
        const { drawn, newDeck, newDiscard } = drawCards(
          1,
          currentDeck,
          discardPileRef.current
        );
        if (drawn.length > 0) {
          nextHands[currentTurn] = [...nextHands[currentTurn], drawn[0]];
          setDeck(newDeck);
          setDiscardPile(newDiscard);
          setHands(nextHands);
          setGameMessage(`컴퓨터 ${currentTurn}번이 놓을 카드가 없어 1장을 뽑았습니다.`);
        } else {
          setGameMessage(`컴퓨터 ${currentTurn}번이 뽑을 카드가 없어 차례를 넘겼습니다.`);
        }
        passTurn(nextHands);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [currentTurn, turnTrigger]);

  return (
    <div className="w-full h-full absolute inset-0 bg-gradient-to-b from-slate-950 to-slate-900 text-white p-2.5 md:p-4 flex flex-col justify-between items-center overflow-y-auto overflow-x-hidden font-sans select-none scrollbar-thin">
      
      {/* 💥 전체화면 특수카드 타격 연출 스크린 */}
      <AnimatePresence>
        {attackEffect && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.5 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-red-600/20 backdrop-blur-sm pointer-events-none"
          >
            <h1 className="text-3xl md:text-5xl font-black text-yellow-400 drop-shadow-[0_4px_10px_rgba(0,0,0,0.5)] tracking-tighter animate-bounce">
              {attackEffect}
            </h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 상단 컨트롤 바 */}
      <header className="w-full max-w-4xl bg-slate-900/80 backdrop-blur border border-slate-800 p-2 md:p-3 rounded-xl shadow-lg flex flex-col sm:flex-row justify-between items-center gap-2 text-center sm:text-left shrink-0">
        <div>
          <h1 className="text-base md:text-lg font-black bg-gradient-to-r from-yellow-400 to-amber-500 bg-clip-text text-transparent">IB UNO LUXURY DX</h1>
          <p className="text-[10px] text-slate-400 font-medium mt-0.5">{gameMessage}</p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-1.5 sm:gap-2 text-slate-900">
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)} className="bg-slate-800 text-white px-2 py-1 md:py-1.5 rounded-lg font-bold text-[10px] border border-slate-700 outline-none">
            <option value="easy">초급 AI</option>
            <option value="normal">중급 AI</option>
            <option value="hard">상급 AI</option>
          </select>
          <select value={playerCount} onChange={(e) => setPlayerCount(parseInt(e.target.value))} className="bg-slate-800 text-white px-2 py-1 md:py-1.5 rounded-lg font-bold text-[10px] border border-slate-700 outline-none">
            <option value="2">2인용</option>
            <option value="3">3인용</option>
            <option value="4">4인용</option>
          </select>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={() => setShowGuide(true)} className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-2.5 py-1 md:py-1.5 rounded-lg text-[10px] cursor-pointer shadow-md flex items-center gap-1">
            <HelpCircle className="w-3.5 h-3.5" />
            초보 가이드
          </motion.button>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={startGame} className="bg-gradient-to-r from-yellow-500 to-amber-500 text-slate-950 font-black px-3.5 py-1 md:py-1.5 rounded-lg text-[10px] cursor-pointer shadow-md shadow-yellow-500/10">
            GAME START
          </motion.button>
        </div>
      </header>

      {/* 💡 상단 교육 안내 연출판 */}
      <AnimatePresence>
        {activeExplanation && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full max-w-4xl bg-indigo-950/30 border border-indigo-500/20 p-2 rounded-lg mt-1 flex items-center gap-2 shadow-md shrink-0 mb-1"
          >
            <span className="text-sm animate-pulse">💡</span>
            <p className="text-[10px] md:text-xs text-slate-200 font-medium tracking-tight leading-tight">{activeExplanation}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 컴퓨터(상대방) 부스 파트 (가로 슬럽형 전용 디자인으로 높이 예산 최소화) */}
      <div className="w-full max-w-4xl flex flex-wrap justify-center gap-2 mt-1 shrink-0">
        {Array.from({ length: playerCount - 1 }).map((_, idx) => {
          const botId = idx + 1;
          const isTurn = currentTurn === botId;
          return (
            <div key={botId} className={`relative px-3 py-1.5 rounded-xl border transition-all duration-300 flex flex-row items-center gap-3 shrink-0 ${isTurn ? 'bg-indigo-950/50 border-yellow-400 shadow-md shadow-yellow-500/5' : 'bg-slate-900/40 border-slate-800'}`}>
              {isTurn && <span className="absolute -top-2 left-2 bg-yellow-400 text-slate-900 text-[8px] px-1.5 py-0.2 rounded-full font-black animate-pulse">THINK...</span>}
              <div className="flex flex-col items-start leading-none">
                <div className="text-[8px] font-black text-slate-500 uppercase tracking-widest">COM 0{botId}</div>
                <div className="text-xs font-black text-white mt-0.5">{hands[botId] ? hands[botId].length : 0} <span className="text-[9px] font-normal text-slate-400">Cards</span></div>
              </div>
              <div className="flex gap-0.5 overflow-x-auto max-w-[80px] md:max-w-[120px] py-0.5 scrollbar-none">
                {hands[botId]?.slice(0, 5).map((c, i) => (
                  <div key={i} className="w-4 h-6 bg-gradient-to-b from-indigo-900 to-slate-900 border border-indigo-500/30 rounded shrink-0 flex items-center justify-center text-[6px] font-black text-indigo-400 shadow-sm">IB</div>
                ))}
                {hands[botId] && hands[botId].length > 5 && (
                  <div className="text-[8px] text-slate-400 font-extrabold self-center ml-1">+{hands[botId].length - 5}</div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* 중앙 배틀 그라운드 (드로우 덱 & 제출 카드 테이블) */}
      <section className="flex flex-row items-center justify-center gap-4 md:gap-8 my-2 py-1.5 w-full max-w-4xl relative shrink-0">
        
        {/* 흐름 회전 방향계 구동 */}
        <div className="text-center flex flex-col items-center justify-center">
          <motion.div 
            animate={{ rotate: isClockwise ? 360 : -360 }}
            transition={{ repeat: Infinity, duration: 15, ease: 'linear' }}
            className="w-10 h-10 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-sm text-slate-400 shadow-inner"
          >
            🔄
          </motion.div>
          <span className="text-[8px] uppercase font-black tracking-widest text-slate-500 mt-1">{isClockwise ? '시계방향' : '역방향'}</span>
        </div>

        {/* 1. 드로우 무덤 더미 */}
        <motion.div 
          whileHover={currentTurn === 0 ? { scale: 1.05 } : {}}
          whileTap={currentTurn === 0 ? { scale: 0.95 } : {}}
          onClick={handlePlayerDraw} 
          className={`w-16 sm:w-20 md:w-24 h-24 sm:h-28 md:h-34 rounded-xl border-2 bg-gradient-to-br from-slate-800 to-slate-900 border-slate-700 flex flex-col items-center justify-center cursor-pointer shadow-md transition-all ${currentTurn === 0 ? 'ring-2 ring-yellow-400/50 shadow-yellow-500/10' : 'opacity-40 cursor-not-allowed'}`}
        >
          <span className="text-[8px] md:text-[9.5px] font-black text-slate-400 tracking-wider text-center leading-tight">
            DRAW DECK<br/>
            <span className="text-sm md:text-base text-white font-black">{deck.length}</span>
          </span>
        </motion.div>

        {/* 2. 제출된 바닥 전용 창 */}
        <div className="relative">
          <AnimatePresence mode="popLayout">
            {topCard && (
              <motion.div 
                key={topCard.id}
                initial={{ scale: 0.3, rotate: -45, y: -20, opacity: 0 }}
                animate={{ scale: 1, rotate: 0, y: 0, opacity: 1 }}
                transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                className={`w-16 sm:w-20 md:w-24 h-24 sm:h-28 md:h-34 rounded-xl border-2 p-1.5 md:p-2.5 flex flex-col justify-between items-center shadow-lg bg-gradient-to-br font-black leading-none ${COLOR_MAP[topCard.color]}`}
              >
                <div className="self-start text-[8px] md:text-[10px]">{topCard.type === 'number' ? topCard.value : '★'}</div>
                <div className="text-center text-[7.5px] sm:text-[8px] md:text-[10px] tracking-tight whitespace-pre-line leading-tight px-0.5">{topCard.label}</div>
                <div className="self-end text-[8px] md:text-[10px] rotate-180">{topCard.type === 'number' ? topCard.value : '★'}</div>
              </motion.div>
            )}
          </AnimatePresence>
          {topCard && (
            <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 w-max text-[8px] md:text-[9px] font-bold text-slate-400 bg-slate-950/80 px-1 py-0.5 rounded">
              지정 색: <span className={`ml-1 px-1.5 py-0.2 rounded text-white text-[8px] ${BG_COLOR_MAP[activeColor]}`}>{activeColor}</span>
            </div>
          )}
        </div>
      </section>

      {/* 하단 유저 본인 전용 보관고 대부스 */}
      <footer className="w-full max-w-4xl bg-slate-900/40 border border-slate-800/60 p-2 md:p-3 rounded-2xl shadow-inner backdrop-blur mt-auto shrink-0">
        <div className="text-[10px] text-yellow-400 mb-1 font-black tracking-widest text-center sm:text-left">YOUR HAND ({hands[0]?.length || 0}장)</div>
        <div className="flex gap-2.5 overflow-x-auto py-1.5 justify-start items-center min-h-[7rem] md:min-h-[8.5rem] custom-scroll px-1 scrollbar-thin">
          {hands[0]?.length === 0 && currentTurn === -1 ? (
            <div className="w-full text-center text-slate-500 font-bold py-4 text-xs">GAME START 버튼을 눌러 게임을 시작하세요!</div>
          ) : null}
          <AnimatePresence>
            {hands[0]?.map(card => {
              const selectable = currentTurn === 0 && canPlayCard(card);
              return (
                <motion.div
                  key={card.id}
                  layout
                  whileHover={selectable ? { y: -12, scale: 1.05, zIndex: 10 } : {}}
                  whileTap={selectable ? { scale: 0.95 } : {}}
                  onClick={() => selectable && playCard(card.id, 0)}
                  className={`relative w-14 sm:w-16 md:w-20 h-20 sm:h-22 md:h-28 rounded-xl border-2 p-1 md:p-2.5 flex flex-col justify-between items-center bg-gradient-to-br font-black select-none shadow-md shrink-0 transition-all leading-none ${COLOR_MAP[card.color]} ${selectable ? 'cursor-pointer ring-2 ring-yellow-400/30 drop-shadow-[0_0_8px_rgba(234,179,8,0.25)]' : 'opacity-25 pointer-events-none'}`}
                >
                  <div className="self-start text-[8px] md:text-[10px]">{card.type === 'number' ? card.value : '★'}</div>
                  <div className="text-center text-[7.5px] sm:text-[8px] md:text-[9.5px] tracking-tight whitespace-pre-line leading-tight px-0.5">{card.label}</div>
                  <div className="self-end text-[8px] md:text-[10px] rotate-180">{card.type === 'number' ? card.value : '★'}</div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      </footer>

      {/* 와일드 조커 픽커 특수 모달 레이어 */}
      <AnimatePresence>
        {showColorPicker && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 pointer-events-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 15 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 15 }}
              className="bg-slate-900 border border-slate-800 p-4 md:p-6 rounded-2xl text-center max-w-xs w-[90%] shadow-2xl"
            >
              <h3 className="text-sm font-black text-yellow-400 tracking-wide">핵심 개념 확장</h3>
              <p className="text-[10px] text-slate-400 mt-0.5 mb-4">판도를 장악할 타겟 매칭 컬러를 선언하세요.</p>
              <div className="grid grid-cols-2 gap-2">
                {COLORS.map(color => (
                  <button
                    key={color}
                    onClick={() => selectWildColor(color)}
                    className={`p-2.5 rounded-lg font-black text-xs active:scale-95 transition-transform cursor-pointer border shadow-sm ${COLOR_MAP[color]}`}
                  >
                    {color}
                  </button>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 📖 초보자용 가이드북 모달 */}
      <AnimatePresence>
        {showGuide && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-50 p-4 pointer-events-auto overflow-y-auto"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 30 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 30 }}
              className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col my-auto max-h-[90vh]"
            >
              <div className="bg-gradient-to-r from-indigo-900 to-slate-900 p-4 border-b border-slate-800 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-yellow-400 animate-pulse" />
                  <div>
                    <h3 className="text-sm font-black text-white tracking-wide">IB 우노(UNO) 초보자 가이드북</h3>
                    <p className="text-[10px] text-slate-300 font-medium">처음이어도 1분 만에 배워서 바로 시작할 수 있어요!</p>
                  </div>
                </div>
                <button 
                  onClick={() => setShowGuide(false)}
                  className="bg-slate-800 hover:bg-slate-700 p-1.5 rounded-lg text-slate-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* 가이드북 바디 스크롤 영역 */}
              <div className="p-4 md:p-5 overflow-y-auto space-y-5 text-left text-xs leading-relaxed max-h-[60vh] scrollbar-thin">
                
                {/* 1. 기본 승리 조건 및 규칙 */}
                <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <h4 className="font-black text-yellow-400 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5 text-yellow-400" />
                    1. 게임의 목표와 기본 규칙
                  </h4>
                  <ul className="list-disc pl-4 text-slate-300 space-y-1 mt-1.5 text-[11px]">
                    <li>자신의 카드를 <strong className="text-yellow-400">가장 먼저 모두 내려놓는 플레이어</strong>가 승리합니다.</li>
                    <li>바닥에 놓인 카드와 <strong className="text-white">같은 색깔</strong>이거나, <strong className="text-white">동일한 값/기능</strong>의 카드를 번갈아가며 낼 수 있습니다.</li>
                    <li>낼 수 있는 카드는 내 화면 하단에서 <strong className="text-yellow-400 border border-yellow-500/50 bg-yellow-500/10 px-1.5 rounded">노란색 테두리</strong>로 환하게 빛나니 초보자도 헷갈릴 염려가 없어요!</li>
                    <li>낼 카드가 전혀 없을 때는 중앙의 <strong className="text-white">DRAW DECK(카드 더미)</strong>을 터치해서 1장 가져오고 차례를 넘깁니다.</li>
                  </ul>
                </div>

                {/* 2. 특수 카드 백과사전 */}
                <div>
                  <h4 className="font-black text-indigo-400 flex items-center gap-1.5 text-xs">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    2. 특수 카드 소개 (초중요 장치)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">바닥에 이 카드가 놓여지면 즉시 특별한 효과가 발동됩니다!</p>
                  
                  <div className="mt-2.5 space-y-2">
                    {/* Skip */}
                    <div className="flex gap-2.5 items-start p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                      <div className="px-2 py-1 h-fit text-[10px] font-black rounded bg-red-600 text-white min-w-[54px] text-center">관점 (Skip)</div>
                      <p className="text-[11px] text-slate-300 leading-tight"><strong>상대방 건너뛰기:</strong> 서로 다른 관점을 충분히 경청하고 배려하기 위해 다음 플레이어는 차례를 1회 쉬어갑니다.</p>
                    </div>

                    {/* Reverse */}
                    <div className="flex gap-2.5 items-start p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                      <div className="px-2 py-1 h-fit text-[10px] font-black rounded bg-blue-600 text-white min-w-[54px] text-center">변화 (Reverse)</div>
                      <p className="text-[11px] text-slate-300 leading-tight"><strong>진행 방향 반전:</strong> 상황이 완전히 정반대로 변화합니다. 카드 흐름의 방향(시계 ↔ 반시계)을 뒤바꿉니다.</p>
                    </div>

                    {/* DrawTwo */}
                    <div className="flex gap-2.5 items-start p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                      <div className="px-2 py-1 h-fit text-[10px] font-black rounded bg-yellow-500 text-slate-950 min-w-[54px] text-center">인과관계 (+2)</div>
                      <p className="text-[11px] text-slate-300 leading-tight"><strong>두 장 주기:</strong> 행동과 실천의 인과관계! 나의 행동(원인)으로 인해 다음 상대방은 무덤에서 무조건 2장의 카드를 뽑고 차례를 강제 패스합니다.</p>
                    </div>

                    {/* Wild */}
                    <div className="flex gap-2.5 items-start p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                      <div className="px-2 py-1 h-fit text-[10px] font-black rounded bg-gradient-to-r from-teal-500 to-green-600 text-white min-w-[54px] text-center">형태·관계 (Wild)</div>
                      <p className="text-[11px] text-slate-300 leading-tight"><strong>원하는 색상 선언:</strong> 모양과 형태를 관찰하며 자신이 놓길 원하는 테마 색상(빨강, 파랑, 노랑, 초록 중 하나)을 자유롭게 지정할 수 있는 만능 조커 카드입니다.</p>
                    </div>

                    {/* WildDrawFour */}
                    <div className="flex gap-2.5 items-start p-2 bg-slate-950/40 rounded-lg border border-slate-800/40">
                      <div className="px-2 py-1 h-fit text-[10px] font-black rounded bg-gradient-to-r from-purple-600 to-pink-600 text-white min-w-[54px] text-center">기능·책임 (+4)</div>
                      <p className="text-[11px] text-slate-300 leading-tight"><strong>색상 선언 + 네 장 권고:</strong> 최고의 전술적 카드! 내가 원하는 색상으로 게임판의 컬러를 변경하고, 동시에 상대방에게 4장의 드로우 책임을 지워 다음 사람을 방해하는 최강의 카드입니다.</p>
                    </div>
                  </div>
                </div>

                {/* 3. IB 학습자상 소개 카드 */}
                <div className="bg-slate-950/30 p-3 rounded-xl border border-slate-800/50">
                  <h4 className="font-black text-emerald-400 flex items-center gap-1.5 text-xs">
                    <Heart className="w-3.5 h-3.5 text-emerald-400" />
                    3. 숫자에 매칭된 IB 학습자상 (0~9)
                  </h4>
                  <p className="text-[10px] text-slate-400 mt-0.5">숫자 카드들에는 글로벌 미래 인재로 성장하는 데 필요한 10가지 가치가 매칭되어 있어요:</p>
                  <div className="grid grid-cols-2 gap-1 px-1 mt-2 text-[10.5px] text-slate-300">
                    <div><strong>0:</strong> 탐구하는 사람</div>
                    <div><strong>1:</strong> 지식이 풍부한 사람</div>
                    <div><strong>2:</strong> 사고하는 사람</div>
                    <div><strong>3:</strong> 소통하는 사람</div>
                    <div><strong>4:</strong> 원칙을 지키는 사람</div>
                    <div><strong>5:</strong> 열린 마음을 가진 사람</div>
                    <div><strong>6:</strong> 배려하는 사람</div>
                    <div><strong>7:</strong> 도전하는 사람</div>
                    <div><strong>8:</strong> 균형 잡힌 사람</div>
                    <div><strong>9:</strong> 성찰하는 사람</div>
                  </div>
                </div>

              </div>

              {/* 닫기 버튼 */}
              <div className="p-3 bg-slate-950 border-t border-slate-800/50 flex justify-end">
                <button
                  onClick={() => setShowGuide(false)}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-4 py-1.5 rounded-lg text-xs active:scale-95 transition-transform cursor-pointer"
                >
                  확인 완료! 게임하기
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
