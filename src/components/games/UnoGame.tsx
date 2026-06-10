import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import confetti from 'canvas-confetti';

interface UnoGameProps {
  soundEnabled: boolean;
}

// ==========================================
// 1. IB 테마 고정 데이터 세팅
// ==========================================
const COLORS = ['Red', 'Blue', 'Yellow', 'Green'];
const LEARNER_PROFILES = [
  '탐구하는 사람', '지식이 많은 사람', '생각하는 사람', '소통하는 사람', '원칙을 지키는 사람',
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
  const [isClockwise, setIsClockwise] = useState(true);
  const [gameMessage, setGameMessage] = useState('세팅 후 게임 시작 버튼을 눌러주세요.');
  const [activeExplanation, setActiveExplanation] = useState('');
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [pendingWild, setPendingWild] = useState<any>(null);
  const [attackEffect, setAttackEffect] = useState(''); // 스크린 공격 이펙트 알림용

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
    if (card.color === activeColor) return true;
    if (topCard && card.type === topCard.type && card.value === topCard.value) return true;
    return false;
  };

  const handlePlayerDraw = () => {
    if (currentTurn !== 0 || deck.length === 0) return;
    const nextDeck = [...deck];
    const drawn = nextDeck.shift();
    const nextHands = [...hands];
    if (drawn) {
      nextHands[0].push(drawn);
      setDeck(nextDeck);
      setHands(nextHands);
      setGameMessage('카드를 1장 뽑았습니다. 다음 차례로 넘어갑니다.');
      passTurn(nextHands);
    }
  };

  const playCard = (cardId: string, playerIdx: number) => {
    if (currentTurn !== playerIdx) return;
    const nextHands = [...hands];
    const card = nextHands[playerIdx].find(c => c.id === cardId);
    if (!card || !canPlayCard(card)) return;

    nextHands[playerIdx] = nextHands[playerIdx].filter(c => c.id !== cardId);
    setDiscardPile(prev => [...prev, card]);
    setHands(nextHands);

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
      if (playerCount === 2) skipNext = true;
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
    let nextDeck = [...deck];
    let nextHands = [...currentHands];
    let step = skipNext ? 2 : 1;
    let nextTurn = currentTurn;

    if (drawCount > 0) {
      let targetIdx = isClockwise ? (currentTurn + 1) % playerCount : (currentTurn - 1 + playerCount) % playerCount;
      const drawn = nextDeck.splice(0, drawCount);
      nextHands[targetIdx] = [...nextHands[targetIdx], ...drawn];
      setDeck(nextDeck);
      setHands(nextHands);
    }

    if (isClockwise) {
      nextTurn = (currentTurn + step) % playerCount;
    } else {
      nextTurn = (currentTurn - step + playerCount) % playerCount;
    }

    setCurrentTurn(nextTurn);
  };

  const passTurn = (currHands: UnoCard[][]) => {
    let nextTurn = isClockwise ? (currentTurn + 1) % playerCount : (currentTurn - 1 + playerCount) % playerCount;
    setCurrentTurn(nextTurn);
  };

  // 컴퓨터 인공지능 핸들러
  useEffect(() => {
    if (currentTurn === 0 || currentTurn === -1) return;

    const timer = setTimeout(() => {
      const aiHand = hands[currentTurn];
      if (!aiHand) return;
      const playable = aiHand.filter(c => canPlayCard(c));

      if (playable.length > 0) {
        let chosen = playable[0];
        // 상급 모드 지능 고도화 (저격 시스템)
        if (difficulty === 'hard' && hands[0].length <= 3) {
          chosen = playable.find(c => c.value === 'WildDrawFour' || c.value === 'DrawTwo') || playable[0];
        } else if (difficulty === 'normal') {
          chosen = playable.find(c => c.type === 'number') || playable[0];
        }
        playCard(chosen.id, currentTurn);
      } else {
        if (deck.length > 0) {
          const nextDeck = [...deck];
          const drawn = nextDeck.shift();
          const nextHands = [...hands];
          if (drawn) {
            nextHands[currentTurn].push(drawn);
            setDeck(nextDeck);
            setHands(nextHands);
            setGameMessage(`컴퓨터 ${currentTurn}번이 카드가 없어 1장 획득했습니다.`);
          }
        }
        passTurn(hands);
      }
    }, 1600);

    return () => clearTimeout(timer);
  }, [currentTurn]);

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
    </div>
  );
};
