import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { ArrowLeft, RefreshCw, Volume2, VolumeX, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Card {
  id: string;
  fruit: '🍓' | '🍌' | '🍋' | '🍇';
  count: number;
}

const FRUITS: ('🍓' | '🍌' | '🍋' | '🍇')[] = ['🍓', '🍌', '🍋', '🍇'];

const generateDeck = (): Card[] => {
  const deck: Card[] = [];
  // For each fruit, generate cards:
  // 5 cards of 1, 3 cards of 2, 3 cards of 3, 2 cards of 4, 1 card of 5
  FRUITS.forEach(fruit => {
    // 5 of count 1
    for (let i = 0; i < 5; i++) deck.push({ id: `${fruit}-1-${i}-${Math.random()}`, fruit, count: 1 });
    // 3 of count 2
    for (let i = 0; i < 3; i++) deck.push({ id: `${fruit}-2-${i}-${Math.random()}`, fruit, count: 2 });
    // 3 of count 3
    for (let i = 0; i < 3; i++) deck.push({ id: `${fruit}-3-${i}-${Math.random()}`, fruit, count: 3 });
    // 2 of count 4
    for (let i = 0; i < 2; i++) deck.push({ id: `${fruit}-4-${i}-${Math.random()}`, fruit, count: 4 });
    // 1 of count 5
    for (let i = 0; i < 1; i++) deck.push({ id: `${fruit}-5-${i}-${Math.random()}`, fruit, count: 5 });
  });

  // Shuffle deck
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
};

export const HalliGalliGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');
  const [userDeck, setUserDeck] = useState<Card[]>([]);
  const [aiDeck, setAiDeck] = useState<Card[]>([]);
  
  // Current face-up cards on the table
  const [userTopCard, setUserTopCard] = useState<Card | null>(null);
  const [aiTopCard, setAiTopCard] = useState<Card | null>(null);
  
  // Accumulated card piles on the table
  const [userTablePile, setUserTablePile] = useState<Card[]>([]);
  const [aiTablePile, setAiTablePile] = useState<Card[]>([]);
  
  const [turn, setTurn] = useState<'USER' | 'AI'>('USER');
  const [message, setMessage] = useState<string>('카드를 뒤집거나 벨을 누르세요!');
  const [aiReactionTime, setAiReactionTime] = useState<number>(1800); // ms
  const [isRinging, setIsRinging] = useState<boolean>(false);
  const [winner, setWinner] = useState<'USER' | 'AI' | null>(null);

  // Auto AI Flip Timer & Bell Check Refs
  const aiActionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const aiBellTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerConfetti = () => {
    confetti({
      particleCount: 80,
      spread: 60,
      origin: { y: 0.7 }
    });
  };

  const playSound = useCallback((type: 'bell' | 'flip' | 'correct' | 'wrong') => {
    if (!soundEnabled) return;
    let soundSrc = ASSETS.sounds.joyful;
    if (type === 'bell') soundSrc = 'https://assets.mixkit.co/active_storage/sfx/1932/1932-500.wav'; // Standard bell
    if (type === 'flip') soundSrc = 'https://assets.mixkit.co/active_storage/sfx/2017/2017-500.wav'; // Card flip
    if (type === 'correct') soundSrc = ASSETS.sounds.correct;
    if (type === 'wrong') soundSrc = ASSETS.sounds.wrong;
    
    const audio = new Audio(soundSrc);
    audio.volume = 0.25;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  const startGame = () => {
    const deck = generateDeck();
    setUserDeck(deck.slice(0, deck.length / 2));
    setAiDeck(deck.slice(deck.length / 2));
    setUserTopCard(null);
    setAiTopCard(null);
    setUserTablePile([]);
    setAiTablePile([]);
    setTurn('USER');
    setMessage('당신의 차례입니다. 카드를 클릭해 뒤집으세요!');
    setGameState('PLAYING');
    setWinner(null);
  };

  // Check if there are EXACTLY 5 of any fruit
  const checkFiveCondition = useCallback((): boolean => {
    const currentFruits: { [key: string]: number } = { '🍓': 0, '🍌': 0, '🍋': 0, '🍇': 0 };
    if (userTopCard) {
      currentFruits[userTopCard.fruit] += userTopCard.count;
    }
    if (aiTopCard) {
      currentFruits[aiTopCard.fruit] += aiTopCard.count;
    }
    
    // Check if any fruit adds up to exactly 5
    return Object.values(currentFruits).some(count => count === 5);
  }, [userTopCard, aiTopCard]);

  // Handle bell ring (by human or AI)
  const ringBell = useCallback((ringer: 'USER' | 'AI') => {
    setIsRinging(true);
    playSound('bell');
    setTimeout(() => setIsRinging(false), 300);

    // Cancel all AI triggers during evaluation
    if (aiActionTimerRef.current) clearTimeout(aiActionTimerRef.current);
    if (aiBellTimerRef.current) clearTimeout(aiBellTimerRef.current);

    const isFive = checkFiveCondition();

    if (isFive) {
      // SUCCESS!
      const totalCardsWon = [...userTablePile, ...aiTablePile, ...(userTopCard ? [userTopCard] : []), ...(aiTopCard ? [aiTopCard] : [])];
      
      if (ringer === 'USER') {
        setUserDeck(prev => [...prev, ...totalCardsWon]);
        setMessage('🎯 벨을 올바르게 누르고 테이블의 모든 카드를 획득했습니다!');
        playSound('correct');
        triggerConfetti();
        setTurn('USER');
      } else {
        setAiDeck(prev => [...prev, ...totalCardsWon]);
        setMessage('🤖 AI가 간발의 차이로 먼저 벨을 눌렀습니다! 카드를 뺏겼습니다.');
        playSound('wrong');
        setTurn('AI');
      }

      // Reset Table Top and Piles
      setUserTopCard(null);
      setAiTopCard(null);
      setUserTablePile([]);
      setAiTablePile([]);
    } else {
      // WRONG PRESS (Penalty: give 1 card to opponent)
      if (ringer === 'USER') {
        if (userDeck.length > 0) {
          const [penaltyCard, ...remaining] = userDeck;
          setUserDeck(remaining);
          setAiDeck(prev => [...prev, penaltyCard]);
          setMessage('❌ 총 과일 개수가 5개가 아닙니다! AI에게 카드 1장을 보냅니다.');
        } else {
          setMessage('❌ 카드가 없어 벌칙을 줄 수 없습니다!');
        }
        playSound('wrong');
      } else {
        if (aiDeck.length > 0) {
          const [penaltyCard, ...remaining] = aiDeck;
          setAiDeck(remaining);
          setUserDeck(prev => [...prev, penaltyCard]);
          setMessage('🤖 AI가 실수로 벨을 눌렀습니다! 당신에게 카드 1장을 줍니다!');
        }
        playSound('correct');
      }
    }

    // Adjust AI reaction time based on round performance
    setAiReactionTime(prev => {
      if (ringer === 'USER') {
        return Math.max(1200, prev - 100); // AI gets faster next time
      } else {
        return Math.min(2500, prev + 150); // AI gets more generous/slower
      }
    });
  }, [checkFiveCondition, userTablePile, aiTablePile, userTopCard, aiTopCard, userDeck, aiDeck, playSound]);

  // AI Card Flip Logic
  const executeAiTurn = useCallback(() => {
    if (gameState !== 'PLAYING') return;
    if (aiDeck.length === 0) {
      setGameState('END');
      setWinner('USER');
      triggerConfetti();
      return;
    }

    playSound('flip');
    const [flipped, ...remainingDeck] = aiDeck;
    setAiDeck(remainingDeck);
    
    // Save old top card to table pile
    if (aiTopCard) {
      setAiTablePile(prev => [...prev, aiTopCard]);
    }
    setAiTopCard(flipped);
    setTurn('USER');
    setMessage('당신의 차례입니다. 카드를 뒤집으세요!');
  }, [aiDeck, aiTopCard, gameState, playSound]);

  // Check Game End Condition every turn
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    if (userDeck.length === 0 && !userTopCard) {
      setGameState('END');
      setWinner('AI');
    } else if (aiDeck.length === 0 && !aiTopCard) {
      setGameState('END');
      setWinner('USER');
      triggerConfetti();
    }
  }, [userDeck, aiDeck, userTopCard, aiTopCard, gameState]);

  // Active Monitoring for Bell / Auto AI reactions
  useEffect(() => {
    if (gameState !== 'PLAYING') return;

    // Is there a 5-fruit match active?
    const standsAtFive = checkFiveCondition();

    if (standsAtFive) {
      // AI rolls a reaction time to press the bell
      const simulatedDelay = aiReactionTime + Math.random() * 400 - 200;
      aiBellTimerRef.current = setTimeout(() => {
        ringBell('AI');
      }, simulatedDelay);
    } else {
      // Opponent might randomly click wrong bell if very fast, but usually stays quiet.
      // If AI's turn, trigger auto-flip after a delay
      if (turn === 'AI') {
        aiActionTimerRef.current = setTimeout(() => {
          executeAiTurn();
        }, 1500);
      }
    }

    return () => {
      if (aiActionTimerRef.current) clearTimeout(aiActionTimerRef.current);
      if (aiBellTimerRef.current) clearTimeout(aiBellTimerRef.current);
    };
  }, [turn, userTopCard, aiTopCard, gameState, checkFiveCondition, ringBell, executeAiTurn, aiReactionTime]);

  const handleUserFlip = () => {
    if (gameState !== 'PLAYING' || turn !== 'USER') return;
    if (userDeck.length === 0) return;

    playSound('flip');
    const [flipped, ...remainingDeck] = userDeck;
    setUserDeck(remainingDeck);

    // Save old top card to pile
    if (userTopCard) {
      setUserTablePile(prev => [...prev, userTopCard]);
    }
    setUserTopCard(flipped);
    setTurn('AI');
    setMessage('🤖 AI 차례입니다. 과일을 지켜보세요...');
  };

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-emerald-950 text-white p-4 font-sans relative select-none">
      <header className="w-full flex items-center justify-between pb-2 border-b border-white/10 z-10">
        <div className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/xe54lqW.png" 
            alt="할리갈리 아이콘" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain bg-white/10 p-1 rounded-xl"
          />
          <div>
            <h1 className="text-sm md:text-base font-black tracking-tight leading-none text-white">IB 할리갈리</h1>
            <p className="text-[10px] text-emerald-400 font-bold mt-0.5">과일 합이 정확히 5개면 벨을 치세요!</p>
          </div>
        </div>
        <div className="text-xs bg-emerald-900 border border-emerald-800 px-3 py-1 rounded-xl font-bold flex gap-4">
          <span className="text-amber-400">내 카드: {userDeck.length + (userTopCard ? 1 : 0)}장</span>
          <span className="text-teal-400">AI 카드: {aiDeck.length + (aiTopCard ? 1 : 0)}장</span>
        </div>
      </header>

      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md">
          <div className="w-24 h-24 bg-white/10 rounded-3xl flex items-center justify-center mb-6 border border-white/20">
            <img 
              src="https://i.imgur.com/xe54lqW.png" 
              alt="할리갈리 아이콘" 
              referrerPolicy="no-referrer" 
              className="w-16 h-16 object-contain"
            />
          </div>
          <h2 className="text-2xl font-black mb-3">신나는 실시간 과일 세기!</h2>
          <p className="text-sm text-emerald-200 font-medium mb-8 leading-relaxed">
            나와 AI가 뒤집어 놓은 카드들 중에서 <br/>
            어느 한 종류의 과일 수가 <span className="text-amber-300 font-black">정확히 5개</span>가 되면 <br/>
            재빨리 가운데에 있는 벨을 두드리세요! 🛎️
          </p>
          <Button 
            onClick={startGame}
            className="px-10 py-5 text-lg font-black bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-2xl w-full border-b-4 border-amber-700 active:transform active:translate-y-1 transition-all"
          >
            게임 시작하기
          </Button>
        </div>
      )}

      {gameState === 'PLAYING' && (
        <div className="flex-1 w-full flex flex-col justify-between py-2 relative">
          
          {/* AI Zone (Opponent) */}
          <div className="flex justify-between items-center px-4 py-2 bg-emerald-900/30 rounded-2xl border border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-indigo-500 rounded-2xl flex items-center justify-center text-lg shadow font-black">🤖</div>
              <div>
                <p className="text-xs font-black text-white">IB AI 타자</p>
                <p className="text-[10px] text-gray-400 font-bold">반응 스피드: {(aiReactionTime/1000).toFixed(1)}초</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              {/* AI Deck back (Unopened) */}
              <div className="w-16 h-24 bg-gradient-to-br from-indigo-600 to-indigo-800 border-2 border-white/30 rounded-xl flex flex-col items-center justify-center shadow-md relative">
                <div className="absolute top-1 right-2 text-[10px] font-black">{aiDeck.length}</div>
                <div className="text-sm">📚</div>
              </div>

              {/* AI Face up card */}
              <div className="w-16 h-24 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center shadow-lg relative">
                {aiTopCard ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-3xl mb-1">{aiTopCard.fruit}</div>
                    <div className="text-sm font-black text-slate-800 bg-slate-100 rounded-full px-2">{aiTopCard.count}개</div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold">빈 자리</div>
                )}
              </div>
            </div>
          </div>

          {/* Table Center (Bell Scene) */}
          <div className="flex flex-row justify-center items-center my-6 relative">
            <div className="w-64 h-64 rounded-full bg-emerald-900/60 border-4 border-emerald-800/80 flex items-center justify-center shadow-inner relative">
              
              {/* Outer decorative halo for card zone */}
              <div className="absolute inset-4 rounded-full border border-emerald-700/50 pointer-events-none" />

              {/* The Central Bell */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => ringBell('USER')}
                className="w-32 h-32 rounded-full cursor-pointer bg-gradient-to-t from-gray-300 via-gray-100 to-white hover:from-white hover:to-gray-100 shadow-[0_15px_30px_rgba(0,0,0,0.5)] border-4 border-slate-400 flex items-center justify-center relative active:border-b-2 z-20"
                animate={isRinging ? { scale: [1, 1.15, 0.95, 1], rotate: [0, -10, 10, 0] } : {}}
                transition={{ duration: 0.2 }}
                title="벨을 누르세요!"
              >
                {/* Brass Core Dome */}
                <div className="w-24 h-24 rounded-full bg-gradient-to-b from-amber-200 via-amber-400 to-amber-600 border border-amber-300 flex items-center justify-center shadow-inner">
                  {/* Push Pin */}
                  <div className="w-8 h-8 rounded-full bg-gradient-to-b from-gray-700 to-gray-900 border border-gray-600 shadow shadow-inner" />
                </div>

                {/* Ring wave indicator */}
                {checkFiveCondition() && (
                  <div className="absolute -inset-2 rounded-full border-4 border-amber-400 animate-ping opacity-60 pointer-events-none" />
                )}
              </motion.button>

              <div className="absolute bottom-3 text-[10px] text-emerald-300 font-black uppercase tracking-widest bg-emerald-950/80 px-2 py-0.5 rounded-full border border-emerald-800">
                BELL 🛎️
              </div>
            </div>
          </div>

          {/* User Zone */}
          <div className="flex justify-between items-center px-4 py-2 bg-emerald-900/30 rounded-2xl border border-white/5">
            <div className="flex gap-4">
              {/* User Face up card */}
              <div className="relative w-16 h-24 bg-white border-2 border-slate-300 rounded-xl flex items-center justify-center shadow-lg transition-transform">
                {userTopCard ? (
                  <div className="flex flex-col items-center justify-center">
                    <div className="text-3xl mb-1">{userTopCard.fruit}</div>
                    <div className="text-sm font-black text-slate-800 bg-slate-100 rounded-full px-2">{userTopCard.count}개</div>
                  </div>
                ) : (
                  <div className="text-[10px] text-slate-400 font-bold">빈 자리</div>
                )}
              </div>

              {/* User Deck back (Click to flip) */}
              <motion.button
                whileHover={turn === 'USER' && userDeck.length > 0 ? { scale: 1.05 } : {}}
                whileTap={turn === 'USER' && userDeck.length > 0 ? { scale: 0.95 } : {}}
                onClick={handleUserFlip}
                disabled={turn !== 'USER' || userDeck.length === 0}
                className={`w-16 h-24 bg-gradient-to-br from-amber-500 to-amber-700 border-2 border-white rounded-xl flex flex-col items-center justify-center shadow-md relative cursor-pointer ${
                  turn !== 'USER' ? 'opacity-40 cursor-not-allowed hover:scale-100' : 'hover:shadow-amber-500/20'
                }`}
              >
                <div className="absolute top-1 left-2 text-[10px] font-black">{userDeck.length}</div>
                <span className="text-sm">📚</span>
                <span className="text-[8px] font-black bg-white/20 px-1 py-0.5 rounded border border-white/10 mt-1">
                  TAP FLIP
                </span>
              </motion.button>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right">
                <p className="text-xs font-black text-white">나 (탐험가)</p>
                <p className="text-[10px] text-amber-300 font-bold">
                  {turn === 'USER' ? '💡 내 차례입니다!' : '기다리세요...'}
                </p>
              </div>
              <div className="w-10 h-10 bg-amber-400 text-slate-900 rounded-2xl flex items-center justify-center text-lg shadow font-black">👨‍🎓</div>
            </div>
          </div>

          {/* Feedback log message */}
          <div className="text-center mt-3 bg-emerald-950/80 border border-emerald-900 py-1.5 px-4 rounded-xl max-w-xs mx-auto flex items-center justify-center gap-1.5 shadow">
            <span className="text-xs text-emerald-100 font-bold">{message}</span>
          </div>

        </div>
      )}

      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center max-w-md w-full">
          <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4">
            {winner === 'USER' ? (
              <span className="text-6xl">🏆</span>
            ) : (
              <span className="text-6xl">👾</span>
            )}
          </div>
          <h2 className="text-3xl font-black mb-2">
            {winner === 'USER' ? '축하합니다! 승리!' : '아쉬운 패배!'}
          </h2>
          <p className="text-emerald-200 text-sm font-semibold mb-8 leading-relaxed">
            {winner === 'USER' 
              ? 'AI의 카드를 전부 가져왔습니다! 순발력이 대단하군요.' 
              : 'AI가 카드를 모두 가져갔습니다. 조금 더 빠르고 알맞게 확인해 보세요!'}
          </p>

          <Button 
            onClick={startGame}
            className="w-full bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-emerald-950 text-base font-black py-4 rounded-2xl shadow-lg border-b-4 border-amber-700"
          >
            다시 시작하기
          </Button>
        </div>
      )}
    </div>
  );
};
