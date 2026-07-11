import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { 
  Volume2, 
  VolumeX, 
  Sparkles, 
  HelpCircle, 
  Trophy, 
  Gamepad2, 
  User, 
  Computer, 
  Users, 
  Sparkle
} from 'lucide-react';
import confetti from 'canvas-confetti';

interface Term {
  id: string;
  ko: string;
  en: string;
  category: 'concept' | 'profile' | 'atl';
  pokemonId: number;
  pokemon: string;
  sprite: string;
}

const BASE_TERMS: Omit<Term, 'pokemonId' | 'pokemon' | 'sprite'>[] = [
  { id: "form", ko: "형태", en: "Form", category: "concept" },
  { id: "function", ko: "기능", en: "Function", category: "concept" },
  { id: "causation", ko: "원인", en: "Causation", category: "concept" },
  { id: "change", ko: "변화", en: "Change", category: "concept" },
  { id: "connection", ko: "연결", en: "Connection", category: "concept" },
  { id: "perspective", ko: "관점", en: "Perspective", category: "concept" },
  { id: "responsibility", ko: "책임", en: "Responsibility", category: "concept" },
  { id: "reflection", ko: "성찰", en: "Reflection", category: "concept" },
  { id: "inquirers", ko: "탐구하는 사람", en: "Inquirers", category: "profile" },
  { id: "knowledgeable", ko: "지식이 풍부한 사람", en: "Knowledgeable", category: "profile" },
  { id: "thinkers", ko: "사고하는 사람", en: "Thinkers", category: "profile" },
  { id: "communicators", ko: "소통하는 사람", en: "Communicators", category: "profile" },
  { id: "principled", ko: "원칙을 지키는 사람", en: "Principled", category: "profile" },
  { id: "open-minded", ko: "열린 마음을 가진 사람", en: "Open-minded", category: "profile" },
  { id: "caring", ko: "배려하는 사람", en: "Caring", category: "profile" },
  { id: "risk-takers", ko: "도전하는 사람", en: "Risk-takers", category: "profile" },
  { id: "balanced", ko: "균형 잡힌 사람", en: "Balanced", category: "profile" },
  { id: "reflective", ko: "성찰하는 사람", en: "Reflective", category: "profile" },
  { id: "thinking-skills", ko: "사고 기능", en: "Thinking Skills", category: "atl" },
  { id: "communication-skills", ko: "의사소통 기능", en: "Communication Skills", category: "atl" },
  { id: "social-skills", ko: "사회적 기능", en: "Social Skills", category: "atl" },
  { id: "self-management-skills", ko: "자기 관리 기능", en: "Self-management Skills", category: "atl" },
  { id: "research-skills", ko: "조사 기능", en: "Research Skills", category: "atl" }
];

const fallbackPokemon = [
  "bulbasaur", "ivysaur", "venusaur", "charmander", "charmeleon", "charizard",
  "squirtle", "wartortle", "blastoise", "caterpie", "metapod", "butterfree",
  "weedle", "kakuna", "beedrill", "pidgey", "pidgeotto", "pidgeot",
  "rattata", "raticate", "spearow", "fearow", "ekans"
];

// 1개의 중앙 배치와 5개의 대칭적 외곽 배치를 결합하여 서로 간의 중첩이 발생하지 않고 공간을 가장 효율적으로 사용하는 6방향 스마트 레이아웃
const positions = [
  { x: 50, y: 50, r: 0, w: "38%", mw: "39%" },   // 1. 중앙 대표 배치
  { x: 50, y: 18, r: -5, w: "38%", mw: "39%" },  // 2. 12시 방향 (상단)
  { x: 80, y: 39, r: 8, w: "38%", mw: "39%" },   // 3. 2시 방향
  { x: 68, y: 78, r: -8, w: "38%", mw: "39%" },  // 4. 5시 방향
  { x: 32, y: 78, r: 12, w: "38%", mw: "39%" },  // 5. 7시 방향
  { x: 20, y: 39, r: -10, w: "38%", mw: "39%" }  // 6. 10시 방향
];

// 단어 길이에 맞춰 글자 크기를 세밀하게 조정하여 긴 단어도 말줄임이나 잘림 없이 100% 한눈에 보이게 비례 스케일링하는 든든한 헬퍼
const getEnFontSizeClass = (text: string) => {
  if (text.length > 18) {
    return "text-[5.5px] xs:text-[6px] sm:text-[7px] md:text-[7.5px] lg:text-[8px] xl:text-[9.5px]";
  }
  if (text.length > 13) {
    return "text-[6px] xs:text-[6.5px] sm:text-[7.5px] md:text-[8px] lg:text-[8.5px] xl:text-[10px]";
  }
  if (text.length > 9) {
    return "text-[6.5px] xs:text-[7px] sm:text-[8px] md:text-[8.5px] lg:text-[9.5px] xl:text-[10.5px]";
  }
  return "text-[7.5px] xs:text-[8px] sm:text-[9.5px] md:text-[10px] lg:text-[10.5px] xl:text-[11.5px]";
};

const getKoFontSizeClass = (text: string) => {
  if (text.length > 9) {
    return "text-[9px] xs:text-[10px] sm:text-[11.5px] md:text-[12px] lg:text-[13px] xl:text-[14px]";
  }
  if (text.length > 6) {
    return "text-[10px] xs:text-[11px] sm:text-[12.5px] md:text-[13px] lg:text-[14px] xl:text-[15px]";
  }
  if (text.length > 4) {
    return "text-[12px] xs:text-[13px] sm:text-[15px] md:text-[15.5px] lg:text-[16.5px] xl:text-[18px]";
  }
  return "text-[13px] xs:text-[14px] sm:text-[16.5px] md:text-[17.5px] lg:text-[18.5px] xl:text-[21px]";
};

const classicColors = {
  concept: { color: "#2563eb", bg: "#eff6ff", borderClass: "border-blue-500", textClass: "text-blue-600", bgClass: "bg-blue-50" },
  profile: { color: "#059669", bg: "#ecfdf5", borderClass: "border-emerald-500", textClass: "text-emerald-600", bgClass: "bg-emerald-50" },
  atl: { color: "#d97706", bg: "#fffbeb", borderClass: "border-amber-500", textClass: "text-amber-600", bgClass: "bg-amber-50" }
};

let dobbleAudioContext: AudioContext | null = null;

function shuffleArray<T>(arr: T[]): T[] {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
     const j = Math.floor(Math.random() * (i + 1));
     [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function pickOne<T>(items: T[]): T {
  return items[Math.floor(Math.random() * items.length)];
}

export const DobbleGame = ({ soundEnabled, onGameFinish }: { soundEnabled: boolean; onGameFinish?: (score: number) => void }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'END'>('START');

  useEffect(() => {
    if (gameState === 'END') {
      onGameFinish?.(playerScore);
    }
  }, [gameState]);
  const [selectedDeckSize, setSelectedDeckSize] = useState<number>(12);
  const [selectedMode, setSelectedMode] = useState<'computer' | 'two'>('computer');
  const [gameMode, setGameMode] = useState<'computer' | 'two'>('computer');
  const [gameEdition, setGameEdition] = useState<'pokemon' | 'classic'>('pokemon');
  
  const [cardsLeft, setCardsLeft] = useState<number>(12);
  const [playerScore, setPlayerScore] = useState<number>(0);
  const [rivalScore, setRivalScore] = useState<number>(0);
  
  const [termsList, setTermsList] = useState<Term[]>([]);
  const [centerCards, setCenterCards] = useState<Term[]>([]);
  const [leftCards, setLeftCards] = useState<Term[]>([]);
  const [rightCards, setRightCards] = useState<Term[]>([]);
  
  const [leftAnswer, setLeftAnswer] = useState<string>('');
  const [rightAnswer, setRightAnswer] = useState<string>('');
  
  const [feedback, setFeedback] = useState<string>('같은 용어를 찾아 클릭하세요.');
  const [feedbackType, setFeedbackType] = useState<'normal' | 'correct' | 'wrong'>('normal');
  const [acceptingClicks, setAcceptingClicks] = useState<boolean>(true);
  
  const [leftCorrectId, setLeftCorrectId] = useState<string | null>(null);
  const [rightCorrectId, setRightCorrectId] = useState<string | null>(null);
  const [wrongId, setWrongId] = useState<string | null>(null);
  const [wrongSide, setWrongSide] = useState<'left' | 'right' | null>(null);

  const [leftWrongCount, setLeftWrongCount] = useState<number>(0);
  const [rightWrongCount, setRightWrongCount] = useState<number>(0);
  
  const [isMuted, setIsMuted] = useState<boolean>(!soundEnabled);
  const [showHelp, setShowHelp] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const computerTimerRef = useRef<NodeJS.Timeout | null>(null);
  const acceptingClicksRef = useRef<boolean>(true);

  const playSound = useCallback((type: 'correct' | 'wrong' | 'win' | 'start' | 'computer_win') => {
    if (isMuted) return;
    try {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;
      if (!dobbleAudioContext) {
        dobbleAudioContext = new AudioContextClass();
      }
      const ctx = dobbleAudioContext;
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      if (type === 'correct') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime);
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.08);
        osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.16);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      } else if (type === 'wrong') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, ctx.currentTime);
        osc.frequency.linearRampToValueAtTime(90, ctx.currentTime + 0.2);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.25);
        osc.stop(ctx.currentTime + 0.25);
      } else if (type === 'win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.setValueAtTime(880, ctx.currentTime + 0.12);
        osc.frequency.setValueAtTime(1174.66, ctx.currentTime + 0.24);
        gain.gain.setValueAtTime(0.15, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
        osc.stop(ctx.currentTime + 0.5);
      } else if (type === 'start') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(392, ctx.currentTime);
        osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.2);
        osc.stop(ctx.currentTime + 0.2);
      } else if (type === 'computer_win') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(380, ctx.currentTime);
        osc.frequency.setValueAtTime(300, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.08, ctx.currentTime);
        osc.start();
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.stop(ctx.currentTime + 0.35);
      }
    } catch (e) {
      console.log('Synth play error', e);
    }
  }, [isMuted]);

  useEffect(() => {
    const initializeTerms = async () => {
      setIsLoading(true);
      const initialTerms: Term[] = BASE_TERMS.map((item, index) => {
        const pokemonId = index + 1;
        return {
          ...item,
          pokemonId,
          pokemon: fallbackPokemon[index % fallbackPokemon.length],
          sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${pokemonId}.png`
        };
      });

      try {
        const res = await fetch("https://pokeapi.co/api/v2/pokemon?limit=151");
        if (res.ok) {
          const data = await res.json();
          const loadedTerms = initialTerms.map((term, index) => {
            const pokemonData = data.results[index % data.results.length];
            const actualId = index + 1;
            return {
              ...term,
              pokemonId: actualId,
              pokemon: pokemonData.name,
              sprite: `https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/${actualId}.png`
            };
          });
          setTermsList(loadedTerms);
        } else {
          setTermsList(initialTerms);
        }
      } catch (err) {
        setTermsList(initialTerms);
      } finally {
        setIsLoading(false);
      }
    };

    initializeTerms();
  }, []);

  const startRound = useCallback((currentLeftCards: number, currentMode: 'computer' | 'two') => {
    if (computerTimerRef.current) {
      clearTimeout(computerTimerRef.current);
    }

    if (currentLeftCards <= 0) {
      setGameState('END');
      playSound('win');
      confetti({
        particleCount: 80,
        spread: 80,
        origin: { y: 0.6 }
      });
      return;
    }

    setAcceptingClicks(true);
    acceptingClicksRef.current = true;
    setLeftCorrectId(null);
    setRightCorrectId(null);
    setWrongId(null);
    setWrongSide(null);
    setLeftWrongCount(0);
    setRightWrongCount(0);

    const shuffledTerms = shuffleArray<Term>(termsList);
    const center = shuffledTerms.slice(0, 6);
    
    const leftAns = pickOne<Term>(center);
    const centerRemaining = center.filter(t => (t as Term).id !== (leftAns as Term).id);
    const rightAns = pickOne<Term>(centerRemaining);

    setLeftAnswer((leftAns as Term).id);
    setRightAnswer((rightAns as Term).id);

    const blockedIds = new Set(center.map(t => (t as Term).id));
    const fillers = shuffleArray<Term>(termsList.filter(t => !blockedIds.has((t as Term).id)));

    const left = [leftAns, ...fillers.slice(0, 5)];
    const right = [rightAns, ...fillers.slice(5, 10)];

    setCenterCards(shuffleArray<Term>(center));
    setLeftCards(shuffleArray<Term>(left));
    setRightCards(shuffleArray<Term>(right));

    if (currentMode === 'computer') {
      const delay = 3500 + Math.random() * 3200; // 3.5초 ~ 6.7초 (컴퓨터 대치 상태)
      computerTimerRef.current = setTimeout(() => {
        if (!acceptingClicksRef.current) return;
        handleComputerWin(rightAns as Term);
      }, delay);
    }
  }, [termsList, playSound]);

  const startGame = () => {
    if (computerTimerRef.current) {
      clearTimeout(computerTimerRef.current);
    }
    setGameMode(selectedMode);
    playSound('start');
    setPlayerScore(0);
    setRivalScore(0);
    setCardsLeft(selectedDeckSize);
    setGameState('PLAYING');
    setFeedback(selectedMode === 'computer' ? '나의 카드와 가운데 더미에서 똑같은 아이콘 단 1개만 찾으세요!' : '각자 카드와 가운데 공용 더미가 겹치는 아이콘을 먼저 찾으세요!');
    setFeedbackType('normal');
    
    setTimeout(() => {
      startRound(selectedDeckSize, selectedMode);
    }, 100);
  };

  const handleComputerWin = (term: Term) => {
    setAcceptingClicks(false);
    acceptingClicksRef.current = false;
    setRivalScore(prev => prev + 1);
    setCardsLeft(prev => {
      const nextCount = prev - 1;
      setRightCorrectId(term.id);
      setFeedback(`컴퓨터가 어울리는 카드를 가져갔어요: ${term.ko}`);
      setFeedbackType('wrong');
      playSound('computer_win');
      
      setTimeout(() => {
        startRound(nextCount, 'computer');
      }, 1600);
      return nextCount;
    });
  };

  const handleGuess = (term: Term, side: 'left' | 'right') => {
    if (!acceptingClicks || !acceptingClicksRef.current) return;
    if (gameMode === 'computer' && side === 'right') return;

    if (side === 'left' && leftWrongCount >= 3) return;
    if (side === 'right' && rightWrongCount >= 3) return;

    const answer = side === 'left' ? leftAnswer : rightAnswer;

    if (term.id === answer) {
      setAcceptingClicks(false);
      acceptingClicksRef.current = false;
      clearTimeout(computerTimerRef.current!);

      if (side === 'left') {
        setPlayerScore(prev => prev + 1);
        setLeftCorrectId(term.id);
        setFeedback(`${gameMode === 'computer' ? '내가' : '1번 플레이어가'} 더미 카드를 가져갑니다: ${term.ko}`);
      } else {
        setRivalScore(prev => prev + 1);
        setRightCorrectId(term.id);
        setFeedback(`2번 플레이어가 더미 카드를 가져갑니다: ${term.ko}`);
      }

      setFeedbackType('correct');
      playSound('correct');

      setCardsLeft(prev => {
        const nextCount = prev - 1;
        setTimeout(() => {
          startRound(nextCount, gameMode);
        }, 1600);
        return nextCount;
      });
    } else {
      setWrongId(term.id);
      setWrongSide(side);
      playSound('wrong');

      if (side === 'left') {
        const nextLeftWrong = leftWrongCount + 1;
        setLeftWrongCount(nextLeftWrong);
        
        if (nextLeftWrong >= 3) {
          if (gameMode === 'computer') {
            // In computer mode, if player fails 3 times, computer takes the card!
            setAcceptingClicks(false);
            acceptingClicksRef.current = false;
            clearTimeout(computerTimerRef.current!);
            
            const correctTermInCenter = centerCards.find(c => c.id === leftAnswer);
            
            setRivalScore(prev => prev + 1);
            setFeedback(`❌ 3회 오답 초과! 컴퓨터가 카드를 가져갑니다: ${correctTermInCenter?.ko || ''}`);
            setFeedbackType('wrong');
            
            setCardsLeft(prev => {
              const nextCount = prev - 1;
              setTimeout(() => {
                startRound(nextCount, 'computer');
              }, 2000);
              return nextCount;
            });
            return;
          } else {
            // 2-player mode, player 1 is locked. Check if player 2 is also locked.
            if (rightWrongCount >= 3) {
              // Both locked! Discard the card.
              setAcceptingClicks(false);
              acceptingClicksRef.current = false;
              setFeedback(`❌ 두 플레이어 모두 3회 오답 초과! 이번 카드는 버려집니다.`);
              setFeedbackType('wrong');
              
              setCardsLeft(prev => {
                const nextCount = prev - 1;
                setTimeout(() => {
                  startRound(nextCount, 'two');
                }, 2000);
                return nextCount;
              });
              return;
            } else {
              setFeedback(`❌ 1번 플레이어 3회 오답 초과로 잠금! 이제 2번 플레이어만 맞힐 수 있습니다.`);
              setFeedbackType('wrong');
            }
          }
        } else {
          setFeedback(`틀렸습니다! 😢 (1번 플레이어 기회 ${3 - nextLeftWrong}번 남음)`);
          setFeedbackType('wrong');
        }
      } else {
        // side === 'right' (Player 2 in 2-player mode)
        const nextRightWrong = rightWrongCount + 1;
        setRightWrongCount(nextRightWrong);
        
        if (nextRightWrong >= 3) {
          if (leftWrongCount >= 3) {
            // Both locked! Discard the card.
            setAcceptingClicks(false);
            acceptingClicksRef.current = false;
            setFeedback(`❌ 두 플레이어 모두 3회 오답 초과! 이번 카드는 버려집니다.`);
            setFeedbackType('wrong');
            
            setCardsLeft(prev => {
              const nextCount = prev - 1;
              setTimeout(() => {
                startRound(nextCount, 'two');
              }, 2000);
              return nextCount;
            });
            return;
          } else {
            setFeedback(`❌ 2번 플레이어 3회 오답 초과로 잠금! 이제 1번 플레이어만 맞힐 수 있습니다.`);
            setFeedbackType('wrong');
          }
        } else {
          setFeedback(`틀렸습니다! 😢 (2번 플레이어 기회 ${3 - nextRightWrong}번 남음)`);
          setFeedbackType('wrong');
        }
      }

      setTimeout(() => {
        if (acceptingClicksRef.current) {
          setWrongId(null);
          setWrongSide(null);
          setFeedback("다시 같은 용어를 눈으로 쫒아봅시다!");
          setFeedbackType('normal');
        }
      }, 1200);
    }
  };

  const quitGame = () => {
    clearTimeout(computerTimerRef.current!);
    setGameState('START');
  };

  const renderCard = (cardTerms: Term[], side: 'left' | 'center' | 'right', offsetIndex: number) => {
    const isClassic = gameEdition === 'classic';
    const wrapperBg = isClassic ? 'bg-[#fffdf8]' : 'bg-[#fffdf8]';
    const borderStyle = side === 'center' ? 'border-amber-400' : 'border-zinc-300';

    // Calculate stack size to show physical card pile/stack effect underneath
    let stackSize = 1;
    if (side === 'left') {
      stackSize = Math.max(1, Math.min(5, playerScore + 1));
    } else if (side === 'right') {
      stackSize = Math.max(1, Math.min(5, rivalScore + 1));
    } else {
      stackSize = Math.max(1, Math.min(5, Math.ceil(cardsLeft / 2.5)));
    }

    return (
      <div className="relative select-none shrink-0">
        {/* Render stacked cards decoration in background to show dynamic deck stack */}
        {Array.from({ length: stackSize - 1 }).map((_, i) => {
          const offset = (i + 1) * 3.5;
          return (
            <div 
              key={`stackDecor-${side}-${i}`}
              style={{
                transform: `translate(${offset}px, ${offset}px)`,
                zIndex: -1 - i
              }}
              className={`absolute top-0 left-0 w-[185px] h-[185px] xs:w-[205px] xs:h-[205px] sm:w-[235px] sm:h-[235px] md:w-[255px] md:h-[255px] lg:w-[275px] lg:h-[275px] xl:w-[325px] xl:h-[325px] rounded-full border-[6px] ${borderStyle} ${wrapperBg} opacity-40 shadow-md pointer-events-none`}
            />
          );
        })}

        <div className={`relative w-[185px] h-[185px] xs:w-[205px] xs:h-[205px] sm:w-[235px] sm:h-[235px] md:w-[255px] md:h-[255px] lg:w-[275px] lg:h-[275px] xl:w-[325px] xl:h-[325px] rounded-full border-[6px] ${borderStyle} ${wrapperBg} shadow-2xl overflow-hidden flex items-center justify-center select-none shrink-0`}>
          
          {/* Subtle decorative background design */}
          <div className="absolute inset-[6%] border border-neutral-200/40 rounded-full pointer-events-none" />
          <div className="absolute inset-[15%] border border-[#cbd5e1]/30 border-dashed rounded-full pointer-events-none" />

          {cardTerms.map((term, idx) => {
            const pos = positions[(idx + offsetIndex) % positions.length];
            const isCorrect = side === 'left' ? leftCorrectId === term.id : rightCorrectId === term.id;
            const isWrong = wrongSide === side && wrongId === term.id;
            const palette = classicColors[term.category];

            if (isClassic) {
              // CLASSIC MODE (no pokemon, nice text buttons inside the card)
              let chipStyle = `${palette.textClass} ${palette.bgClass} ${palette.borderClass}`;
              if (isCorrect) chipStyle = 'bg-emerald-600 text-white border-emerald-500';
              else if (isWrong) chipStyle = 'bg-rose-600 text-white border-rose-500';

              return (
                <button
                  key={`${side}-${term.id}-${idx}`}
                  type="button"
                  disabled={side === 'center' || !acceptingClicks}
                  onClick={() => handleGuess(term, side as 'left' | 'right')}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${pos.r}deg)`,
                    width: pos.mw
                  }}
                  className={`
                    flex flex-col items-center justify-center py-1.5 sm:py-2.5 px-1 rounded-lg sm:rounded-xl border sm:border-2 text-center leading-tight shadow-sm transition-all duration-150 outline-none
                    ${side !== 'center' ? 'cursor-pointer hover:scale-105 active:scale-95' : 'cursor-default'}
                    ${isCorrect ? 'scale-110 shadow-lg z-20' : ''}
                    ${isWrong ? 'scale-90 animate-shake z-20' : ''}
                    ${chipStyle}
                  `}
                >
                  <span className={`${getKoFontSizeClass(term.ko)} font-black break-keep leading-tight text-center px-1`}>
                    {term.ko}
                  </span>
                </button>
              );
            } else {
              // POKEMON MODE
              let categoryBg = 'bg-sky-100 border-sky-400 text-sky-950';
              if (term.category === 'concept') categoryBg = 'bg-blue-100 border-blue-400 text-blue-950';
              else if (term.category === 'profile') categoryBg = 'bg-emerald-100 border-emerald-400 text-emerald-950';
              else categoryBg = 'bg-amber-100 border-amber-400 text-amber-950';

              if (isCorrect) categoryBg = 'bg-emerald-500 border-emerald-400 text-white';
              else if (isWrong) categoryBg = 'bg-rose-500 border-rose-400 text-white';

              return (
                <button
                  key={`${side}-${term.id}-${idx}`}
                  type="button"
                  disabled={side === 'center' || !acceptingClicks}
                  onClick={() => handleGuess(term, side as 'left' | 'right')}
                  style={{
                    position: 'absolute',
                    left: `${pos.x}%`,
                    top: `${pos.y}%`,
                    transform: `translate(-50%, -50%) rotate(${pos.r}deg)`,
                    width: pos.mw
                  }}
                  className={`
                    flex items-center gap-1 p-1 md:p-1.5 rounded-xl sm:rounded-2xl border sm:border-2 shadow transition-all duration-150 outline-none
                    ${side !== 'center' ? 'cursor-pointer hover:scale-110 active:scale-95' : 'cursor-default'}
                    ${isCorrect ? 'scale-115 shadow-xl z-20 text-white' : ''}
                    ${isWrong ? 'scale-90 animate-shake z-20 text-white' : ''}
                    ${categoryBg}
                  `}
                >
                  <div className="w-5 h-5 xs:w-6 xs:h-6 sm:w-8 sm:h-8 md:w-9 md:h-9 rounded-full bg-white flex items-center justify-center border border-slate-200 overflow-hidden shrink-0">
                    <img 
                      src={term.sprite} 
                      alt={term.pokemon} 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain scale-110 image-render-pixelated"
                    />
                  </div>
                  <div className="flex flex-col text-left leading-tight overflow-hidden pr-1 min-w-0 flex-1 justify-center">
                    <span className={`${getKoFontSizeClass(term.ko)} font-black break-keep leading-tight ${isCorrect || isWrong ? 'text-white' : 'text-slate-800'}`}>
                      {term.ko}
                    </span>
                  </div>
                </button>
              );
            }
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full min-h-[50vh] bg-slate-950 text-white flex flex-col justify-between select-none relative font-sans overflow-hidden py-4 rounded-3xl">
      
      {/* Dynamic theme background textures */}
      <div className="absolute inset-0 bg-radial-at-c from-slate-900 to-slate-950 opacity-100 pointer-events-none z-0" />

      {/* TOP HEADER */}
      <header className="px-5 py-2 bg-black/40 border-b border-white/5 flex items-center justify-between z-10 w-full rounded-t-3xl">
        <div className="flex items-center gap-2">
          <span className="text-xl">🔥</span>
          <div>
            <h1 className="text-sm font-black tracking-tight text-amber-400">
              {gameEdition === 'pokemon' ? 'IB 포켓몬 도블' : 'IB 클래식 텍스트 도블'}
            </h1>
            <p className="text-[10px] text-zinc-400 font-bold">같은 IB 용어가 겹치는 카드 1개만 골라내세요!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => setShowHelp(prev => !prev)}
            className="p-1 px-2.5 bg-slate-800 hover:bg-slate-700 text-amber-200 border border-slate-700 text-[10px] font-black rounded-lg flex items-center gap-1 transition-all"
          >
            <HelpCircle className="w-3.5 h-3.5" />
            <span>게임방법</span>
          </button>
          <button 
            type="button"
            onClick={() => setIsMuted(prev => !prev)}
            className="p-1.5 bg-slate-800 hover:bg-slate-700 text-zinc-300 border border-slate-700 rounded-lg transition-all"
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5" /> : <Volume2 className="w-3.5 h-3.5 text-amber-300" />}
          </button>
        </div>
      </header>

      {/* help overlay */}
      <AnimatePresence>
        {showHelp && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setShowHelp(false)}
            className="absolute inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 rounded-3xl"
          >
            <motion.div 
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border-2 border-amber-500 rounded-3xl p-6 max-w-sm w-full relative"
            >
              <h2 className="text-md font-black text-amber-400 mb-3 flex items-center gap-1.5">
                <Sparkle className="w-5 h-5 text-amber-500 animate-spin" />
                <span>도블 게임 설명서</span>
              </h2>
              <div className="text-xs text-slate-300 font-bold space-y-3 leading-relaxed">
                <p>
                  1. <b>기본 법칙</b>: 앞면에 있는 전체 카드들은 다른 모든 카드들과 한 라운드당 <strong className="text-amber-300">정확히 단 1개만의 IB 성찰/개념과 캐릭터</strong>를 공유합니다.
                </p>
                <p>
                  2. <b>매치 찾기</b>: 본인 카드 슬롯에 인쇄된 아이콘 6종 중, <strong className="text-yellow-300">가운데 더미 카드 6종</strong>과 일치하는 용어 하나를 가장 신속하게 찾아 누르시면 승리합니다.
                </p>
                <p>
                  3. <b>두가지 전용 테마</b>:
                  <br />- <strong className="text-rose-400">포켓몬 에디션</strong>: 귀여운 포켓몬 짝궁 이미지들과 함께 흥미롭게 학습합니다.
                  <br />- <strong className="text-sky-400">클래식 에디션</strong>: 그림 없이 오직 풍부한 단선 디자인 칩으로 텍스트 위주 학습에 집중합니다.
                </p>
              </div>
              <Button onClick={() => setShowHelp(false)} className="w-full mt-6 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-xl">
                확인했습니다
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* START SCREEN */}
      {gameState === 'START' && (
        <div className="flex-1 flex flex-col items-center justify-center p-4 max-w-sm mx-auto text-center z-10 gap-3 overflow-y-auto w-full">
          <div className="space-y-1">
            <span className="text-[9px] font-black tracking-widest text-[#f59e0b] bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/30 uppercase">
              IB Card Battle Matcher
            </span>
            <h2 className="text-2xl font-black text-slate-100">IB 도블 카드 게임</h2>
            <p className="text-xs text-slate-400 font-bold">카드를 매칭하며 IB 성찰과 ATL을 재미있게 마스터해요!</p>
          </div>

          <div className="w-full bg-slate-950/50 border border-slate-800/60 p-4 rounded-2xl space-y-4">
            
            {/* 1. THEME SELECT */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block">1. 게임 에디션 선택</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setGameEdition('pokemon')}
                  className={`py-3 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                    gameEdition === 'pokemon' 
                      ? 'bg-amber-500/20 border-amber-500 text-amber-300' 
                      : 'bg-slate-900 border-slate-800 text-zinc-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">⚡</span>
                  <span>포켓몬 에디션</span>
                </button>
                <button
                  type="button"
                  onClick={() => setGameEdition('classic')}
                  className={`py-3 px-2 rounded-xl text-xs font-black border transition-all flex flex-col items-center gap-1 ${
                    gameEdition === 'classic' 
                      ? 'bg-sky-500/20 border-sky-400 text-sky-300' 
                      : 'bg-slate-900 border-slate-800 text-zinc-400 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-lg">📝</span>
                  <span>클래식 에디션 (텍스트)</span>
                </button>
              </div>
            </div>

            {/* 2. CARD COUNT */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block font-bold">2. 도전할 더미크기 선택</label>
              <div className="grid grid-cols-3 gap-1.5">
                {[12, 18, 24].map((count) => (
                  <button
                    key={count}
                    type="button"
                    onClick={() => setSelectedDeckSize(count)}
                    className={`py-2 px-3 rounded-xl text-xs font-black border transition-all ${
                      selectedDeckSize === count 
                        ? 'bg-white text-slate-950 border-white font-black' 
                        : 'bg-slate-900 border-slate-800 text-zinc-400 hover:bg-slate-800'
                    }`}
                  >
                    {count}장
                  </button>
                ))}
              </div>
            </div>

            {/* 3. MODE */}
            <div className="space-y-1.5 text-left">
              <label className="text-[10px] font-black text-zinc-400 uppercase tracking-wider block font-bold">3. 도전 대결 방식</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedMode('computer')}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                    selectedMode === 'computer' 
                      ? 'bg-white text-slate-950 border-white' 
                      : 'bg-slate-900 border-slate-800 text-zinc-400 hover:bg-slate-800'
                  }`}
                >
                  <Computer className="w-3.5 h-3.5" />
                  <span>컴퓨터 대결</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode('two')}
                  className={`py-2 px-3 rounded-xl text-xs font-black border transition-all flex items-center justify-center gap-1.5 ${
                    selectedMode === 'two' 
                      ? 'bg-white text-slate-950 border-white' 
                      : 'bg-slate-900 border-slate-800 text-zinc-400 hover:bg-slate-800'
                  }`}
                >
                  <Users className="w-3.5 h-3.5" />
                  <span>한패드 2인용</span>
                </button>
              </div>
            </div>
          </div>

          {isLoading ? (
            <div className="w-full py-4 text-zinc-500 text-xs font-bold leading-normal">
              포켓몬 도감을 신속하게 동기화 중입니다... 🔋
            </div>
          ) : (
            <Button
              onClick={startGame}
              className="w-full py-4.5 text-sm bg-indigo-600 hover:bg-indigo-700 text-white font-black shadow-lg rounded-xl flex items-center justify-center gap-1.5"
            >
              <Gamepad2 className="w-4 h-4" />
              <span>도블 배틀 시작하기</span>
            </Button>
          )}
        </div>
      )}

      {/* GAME FIELD SCREEN */}
      {gameState === 'PLAYING' && (
        <div className="flex-1 flex flex-col justify-around w-full p-2 z-10 gap-4 overflow-y-auto">
          {/* DASHBOARD STATUS - 세련되고 높은 명조 대비를 갖춘 고반사 일체형 스코어보드 */}
          <div className="grid grid-cols-3 gap-3 px-4 py-3 bg-slate-900/90 border-2 border-slate-700/50 rounded-2xl max-w-2xl mx-auto w-full shadow-xl">
            <div className="flex flex-col items-center justify-center border-r border-slate-800">
              <span className="text-[10px] sm:text-[11px] text-amber-400 font-black tracking-wider uppercase">남은 전체 더미</span>
              <span className="text-xl sm:text-2xl font-black font-mono text-amber-400 drop-shadow">{cardsLeft}<span className="text-xs font-bold ml-0.5">장</span></span>
            </div>

            <div className="flex flex-col items-center justify-center bg-emerald-950/30 border border-emerald-500/20 py-1.5 px-2 rounded-xl">
              <span className="text-[10px] sm:text-[11px] text-emerald-400 font-black tracking-wider uppercase">
                {gameMode === 'computer' ? '나의 득점' : 'P1 (초록) 득점'}
              </span>
              <span className="text-xl sm:text-2xl text-emerald-400 font-black font-mono drop-shadow">{playerScore}<span className="text-xs font-bold ml-0.5">장</span></span>
            </div>

            <div className="flex flex-col items-center justify-center bg-rose-950/30 border border-rose-500/20 py-1.5 px-2 rounded-xl">
              <span className="text-[10px] sm:text-[11px] text-rose-400 font-black tracking-wider uppercase">
                {gameMode === 'computer' ? '컴퓨터 득점' : 'P2 (빨강) 득점'}
              </span>
              <span className="text-xl sm:text-2xl text-rose-400 font-black font-mono drop-shadow">{rivalScore}<span className="text-xs font-bold ml-0.5">장</span></span>
            </div>
          </div>

          {/* DYNAMIC TURN STATEMENT */}
          <div className="min-h-[40px] flex items-center justify-center text-center px-4">
            <span className={`text-[12px] sm:text-xs font-bold tracking-wide ${
              feedbackType === 'correct' ? 'text-emerald-400' :
              feedbackType === 'wrong' ? 'text-rose-400' : 'text-slate-300'
            }`}>
              {feedback}
            </span>
          </div>

          {/* 3 CARDS ALIGNED AS GRID - 태블릿 화면 최적화: 가로 스택으로 감싸 세로 잘림 완벽 차단 */}
          <div className="w-full max-w-[1360px] mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 md:gap-8 lg:gap-14 py-2">
            
            {/* L SIDE: P1 CARDS */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col items-center gap-0.5 bg-emerald-950/60 border-2 border-emerald-500/40 p-1.5 sm:p-2 rounded-xl w-[150px] xs:w-[170px] sm:w-[200px] md:w-[225px] text-center shadow-lg">
                <span className="text-[10px] sm:text-xs font-black text-emerald-400 flex items-center justify-center gap-1">
                  <User className="w-3.5 h-3.5" />
                  <span>{gameMode === 'computer' ? '나의 카드' : '1번 플레이어'}</span>
                </span>
                <span className="text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-emerald-600 to-emerald-500 border border-emerald-400 rounded-lg px-2 py-0.5 mt-0.5 shadow-md w-full text-center">
                  획득: {playerScore}장
                </span>
                <div className="flex gap-1 items-center justify-center mt-1 text-[10px] font-black text-white">
                  <span>기회:</span>
                  <div className="flex gap-0.5">
                    {Array.from({ length: 3 }).map((_, i) => (
                      <span key={`p1-life-${i}`} className="text-xs">
                        {i < (3 - leftWrongCount) ? '❤️' : '🖤'}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              {renderCard(leftCards, 'left', 2)}
            </div>

            {/* CENTER: DECK CARDS */}
            <div className="flex flex-col items-center gap-1.5 scale-100 sm:scale-105">
              <div className="flex flex-col items-center gap-0.5 bg-amber-950/60 border-2 border-amber-500/40 p-1.5 sm:p-2 rounded-xl w-[150px] xs:w-[170px] sm:w-[200px] md:w-[225px] text-center shadow-lg">
                <span className="text-[10px] sm:text-xs font-black text-amber-400 flex items-center justify-center gap-1 animate-pulse">
                  <Sparkle className="w-3.5 h-3.5 text-amber-400" />
                  <span>가운데 공용 더미</span>
                </span>
                <span className="text-[11px] sm:text-xs font-black text-slate-950 bg-amber-400 border border-amber-300 rounded-lg px-2 py-0.5 mt-0.5 shadow-md w-full text-center font-black">
                  남음: {cardsLeft}장
                </span>
              </div>
              {renderCard(centerCards, 'center', 0)}
            </div>

            {/* R SIDE: P2 CARDS */}
            <div className="flex flex-col items-center gap-1.5">
              <div className="flex flex-col items-center gap-0.5 bg-rose-950/60 border-2 border-rose-500/40 p-1.5 sm:p-2 rounded-xl w-[150px] xs:w-[170px] sm:w-[200px] md:w-[225px] text-center shadow-lg">
                <span className="text-[10px] sm:text-xs font-black text-rose-400 flex items-center justify-center gap-1">
                  {gameMode === 'computer' ? (
                    <>
                      <Computer className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
                      <span>컴퓨터 경쟁자</span>
                    </>
                  ) : (
                    <>
                      <User className="w-3.5 h-3.5 text-rose-400" />
                      <span>2번 플레이어</span>
                    </>
                  )}
                </span>
                <span className="text-[11px] sm:text-xs font-black text-white bg-gradient-to-r from-rose-600 to-rose-500 border border-rose-400 rounded-lg px-2 py-0.5 mt-0.5 shadow-md w-full text-center">
                  획득: {rivalScore}장
                </span>
                {gameMode !== 'computer' && (
                  <div className="flex gap-1 items-center justify-center mt-1 text-[10px] font-black text-white">
                    <span>기회:</span>
                    <div className="flex gap-0.5">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <span key={`p2-life-${i}`} className="text-xs">
                          {i < (3 - rightWrongCount) ? '❤️' : '🖤'}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              <div className={gameMode === 'computer' ? 'opacity-70 pointer-events-none filter saturate-50' : ''}>
                {renderCard(rightCards, 'right', 4)}
              </div>
            </div>

          </div>

          {/* BOTTOM QUICK DESK ACTIONS */}
          <div className="flex gap-3 justify-center mt-3">
            <button
              onClick={quitGame}
              className="px-5 py-2 bg-slate-850 hover:bg-slate-800 text-zinc-400 border border-slate-800 font-extrabold text-[11px] rounded-lg transition"
            >
              그만하기
            </button>
            <button
              onClick={startGame}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold text-[11px] rounded-lg transition"
            >
              재설정 및 다시시작
            </button>
          </div>
        </div>
      )}

      {/* END RESULTS SCREEN */}
      {gameState === 'END' && (
        <div className="flex-1 flex flex-col items-center justify-center p-6 text-center z-10 max-w-sm mx-auto gap-4 overflow-y-auto w-full">
          <div className="w-20 h-20 bg-amber-500/10 border-2 border-amber-500 rounded-full flex items-center justify-center">
            <Trophy className="w-10 h-10 text-amber-400 animate-bounce" />
          </div>

          <div className="space-y-1">
            <p className="text-[10px] font-black text-amber-400 uppercase tracking-widest bg-amber-950/40 px-3 py-1 rounded-full border border-amber-900/40 inline-block">
              DECK COMPLETED
            </p>
            <h2 className="text-xl font-black text-slate-100">최종 스코어 결과</h2>
          </div>

          <div className="w-full bg-slate-950/50 border border-slate-800/65 p-5 rounded-2xl space-y-4">
            <div className="flex justify-around items-center">
              <div className="text-center font-bold">
                <p className="text-slate-400 text-xs mb-1">
                  {gameMode === 'computer' ? '나의 득점' : '플레이어 1'}
                </p>
                <span className="text-3xl text-[#22c55e] font-black">{playerScore}</span>
              </div>
              <div className="text-slate-600 text-2xl font-black">:</div>
              <div className="text-center font-bold">
                <p className="text-slate-400 text-xs mb-1">
                  {gameMode === 'computer' ? '컴퓨터' : '플레이어 2'}
                </p>
                <span className="text-3xl text-rose-400 font-black">{rivalScore}</span>
              </div>
            </div>

            <div className="bg-slate-900/80 py-3 px-3 rounded-xl border border-white/5 text-[11px] text-zinc-300 font-bold leading-relaxed">
              {playerScore > rivalScore ? (
                <span className="text-emerald-400 font-black">
                  🎉 완벽한 신속성입니다! 승리를 기록하였습니다.
                </span>
              ) : playerScore < rivalScore ? (
                <span className="text-rose-400 font-black">
                  💥 이번 파트는 아쉽네요! 다시 눈에 힘을 기르고 도전해 보실래요?
                </span>
              ) : (
                <span className="text-amber-400 font-black">
                  🤝 놀랍게도 가져간 더미 수가 동일합니다! 환상의 매칭이군요.
                </span>
              )}
            </div>
          </div>

          <div className="flex gap-2 w-full">
            <Button
              onClick={() => setGameState('START')}
              variant="outline"
              className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-zinc-200 border-none text-xs font-black rounded-lg"
            >
              처음 화면으로
            </Button>
            <Button
              onClick={startGame}
              className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-black rounded-lg"
            >
              다시 도전하기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};
