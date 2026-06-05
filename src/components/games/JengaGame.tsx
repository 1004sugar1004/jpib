import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { RefreshCw, Star, Info, AlertTriangle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Level {
  id: number;
  blocks: [boolean, boolean, boolean]; // [Left, Middle, Right]
}

export const JengaGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'CRASHED'>('START');
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('jenga_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });
  const [levels, setLevels] = useState<Level[]>([]);
  const [leanIndex, setLeanIndex] = useState(0); // overall lean angle (-100 to +100)
  const [wobbleOffset, setWobbleOffset] = useState(0); // temporary animation wobble
  const [message, setMessage] = useState('가운데나 좌우 블록을 살짝 탭해 빼내세요!');
  const [movesCount, setMovesCount] = useState(0);

  const initGame = () => {
    // Standard Jenga starts with eg 9 levels, fully active
    const initialLevels: Level[] = [];
    for (let i = 0; i < 9; i++) {
      initialLevels.push({
        id: i,
        blocks: [true, true, true]
      });
    }
    setLevels(initialLevels);
    setScore(0);
    setMovesCount(0);
    setLeanIndex(0);
    setWobbleOffset(0);
    setMessage('행운을 빕니다! 타워가 쓰러지지 않게 블록을 빼내세요.');
    setGameState('PLAYING');
  };

  const playSound = useCallback((type: 'crash' | 'pull' | 'wobble' | 'correct') => {
    if (!soundEnabled) return;
    let sfx = ASSETS.sounds.joyful;
    if (type === 'crash') sfx = 'https://assets.mixkit.co/active_storage/sfx/2004/2004-500.wav'; // collapse
    if (type === 'pull') sfx = 'https://assets.mixkit.co/active_storage/sfx/2422/2422-500.wav'; // pull swipe
    if (type === 'wobble') sfx = 'https://assets.mixkit.co/active_storage/sfx/1110/1110-500.wav'; // wobble spring
    if (type === 'correct') sfx = ASSETS.sounds.correct;

    const audio = new Audio(sfx);
    audio.volume = 0.22;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  // Recalculate stability metric
  const evaluateStability = (currentLevels: Level[]): { lean: number, collapsed: boolean, problemLevel: number | null } => {
    let collapsed = false;
    let totalOffset = 0;
    let problemLevel: number | null = null;

    // Check each level bottom up
    for (let i = 0; i < currentLevels.length; i++) {
      const level = currentLevels[i];
      const [l, m, r] = level.blocks;
      
      const count = [l, m, r].filter(Boolean).length;
      
      // 1. If an entire level is empty -> Collapse!
      if (count === 0) {
        collapsed = true;
        problemLevel = i;
        break;
      }

      // Calculate shift from middle center config
      // [true, true, true] -> offset = 0
      // [true, false, false] -> offsets to Left (-1)
      // [false, false, true] -> offsets to Right (+1)
      // [true, false, true] -> balanced (0), but structurally fragile
      // [false, true, false] -> balanced (0)
      let offset = 0;
      if (l && !m && !r) offset = -1.2;
      else if (!l && !m && r) offset = 1.2;
      else if (l && m && !r) offset = -0.4;
      else if (!l && m && r) offset = 0.4;
      else if (l && !m && r) offset = 0.1; // narrow split

      // Higher levels compound lean loads downward
      totalOffset += offset * (1 + (i * 0.1));
    }

    // Convert total deviation to instability score (-100 to 100)
    const normalizedLean = totalOffset * 10;
    
    // Threshold collapse
    if (Math.abs(normalizedLean) > 95) {
      collapsed = true;
    }

    return {
      lean: Math.max(-100, Math.min(100, normalizedLean)),
      collapsed,
      problemLevel
    };
  };

  const handleBlockPull = (levelId: number, blockIndex: number) => {
    if (gameState !== 'PLAYING') return;

    // Standard Rule constraint: You cannot pull from the topmost level
    if (levelId === levels.length - 1) {
      setMessage('⚠️ 가장 위에 쌓인 최고층 블록은 빼낼 수 없습니다!');
      return;
    }

    const targetLevel = levels.find(l => l.id === levelId);
    if (!targetLevel || !targetLevel.blocks[blockIndex]) return;

    playSound('pull');

    // Create copy for speculative calculations
    const updatedLevels = levels.map(level => {
      if (level.id === levelId) {
        const blocksCopy = [...level.blocks] as [boolean, boolean, boolean];
        blocksCopy[blockIndex] = false;
        return { ...level, blocks: blocksCopy };
      }
      return level;
    });

    // Extract block details and add at the absolute top topmost layer
    let topLevel = updatedLevels[updatedLevels.length - 1];
    const topBlocksCount = topLevel.blocks.filter(Boolean).length;

    if (topBlocksCount < 3) {
      // Find empty spot in top level
      const idx = topLevel.blocks.indexOf(false);
      if (idx !== -1) {
         topLevel.blocks[idx] = true;
      } else {
        // Fall back fill
        for (let j = 0; j < 3; j++) {
          if (!topLevel.blocks[j]) {
            topLevel.blocks[j] = true;
            break;
          }
        }
      }
    } else {
      // Add a fresh brand new level on top
      const newId = updatedLevels.length;
      updatedLevels.push({
        id: newId,
        blocks: [true, false, false] // start with 1 block at new top level
      });
    }

    const stability = evaluateStability(updatedLevels);

    // Apply brief vibration wobble effect depending on stability danger
    setWobbleOffset((Math.random() > 0.5 ? 1 : -1) * (Math.abs(stability.lean) * 0.18 + 4));
    setTimeout(() => setWobbleOffset(0), 450);

    if (stability.collapsed) {
      playSound('crash');
      setLeanIndex(stability.lean);
      setGameState('CRASHED');
      setLevels(updatedLevels);
      setMessage(`💥 와르르! 타워가 균형을 잃고 쓰러졌습니다! (고도: ${updatedLevels.length}층)`);
    } else {
      // Success! Update scores
      const gain = 100 + (updatedLevels.length * 5);
      const newScore = score + gain;
      setScore(newScore);
      setMovesCount(prev => prev + 1);
      setLeanIndex(stability.lean);
      setLevels(updatedLevels);
      setMessage(`🎉 성공! +${gain}점! 타워가 현재 더 길어졌습니다.`);
      playSound('correct');

      if (newScore > highScore) {
        setHighScore(newScore);
        localStorage.setItem('jenga_highscore', newScore.toString());
      }

      // Add a potential lean correction chance or slight atmospheric balance shift
      if (Math.abs(stability.lean) > 55) {
        playSound('wobble');
      }
    }
  };

  useEffect(() => {
    initGame();
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-zinc-950 text-white p-4 font-sans select-none relative overflow-hidden">
      
      {/* Background decoration with wood motif texture */}
      <div 
        className="absolute inset-0 opacity-10 pointer-events-none"
        style={{
          backgroundImage: 'url("https://imgur.com/0wF00pI")',
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          mixBlendMode: 'overlay'
        }}
      />

      <header className="w-full flex items-center justify-between pb-2 border-b border-white/10 z-10 bg-zinc-950/90 py-1">
        <div className="flex items-center gap-2">
          <img 
            src="https://imgur.com/0wF00pI" 
            alt="Jenga Icon" 
            referrerPolicy="no-referrer"
            className="w-10 h-10 object-contain bg-white/5 p-1 rounded-xl"
          />
          <div>
            <h1 className="text-sm md:text-base font-black text-white leading-none">IB 젠가 챌린지</h1>
            <p className="text-[10px] text-zinc-400 font-bold mt-0.5">최대한 튼튼하게 타워를 쌓아보세요!</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-bold flex gap-3 text-amber-400">
            <span>최고 점수: {highScore}</span>
            <span className="text-white">|</span>
            <span>현재 점수: {score}</span>
          </div>
        </div>
      </header>

      {/* Stability Meter Info Bar */}
      {gameState === 'PLAYING' && (
        <div className="w-full max-w-sm mt-3 px-4 py-2 bg-zinc-900/80 rounded-2xl border border-white/5 z-10 text-center">
          <div className="flex items-center justify-between text-[11px] font-black text-zinc-400 mb-1">
            <span className="text-cyan-400 flex items-center gap-1">◀ 왼쪽 기울어짐</span>
            <span className="bg-zinc-800 px-1.5 py-0.5 rounded text-white">
              타워 높이: {levels.length}층 ({movesCount}번 완료)
            </span>
            <span className="text-rose-400 flex items-center gap-1">오른쪽 기울어짐 ▶</span>
          </div>
          
          <div className="w-full h-3.5 bg-zinc-950 border border-zinc-800 rounded-full overflow-hidden relative flex items-center justify-center">
            {/* Center safety marker */}
            <div className="absolute w-1.5 h-full bg-emerald-500 z-10 opacity-60" />
            
            {/* Deviation slider indicator */}
            <motion.div 
              className={`absolute h-full rounded-full ${
                Math.abs(leanIndex) > 75 
                  ? 'bg-rose-500 shadow-lg shadow-rose-500/50' 
                  : Math.abs(leanIndex) > 50 
                    ? 'bg-amber-500' 
                    : 'bg-emerald-400'
              }`}
              style={{
                width: '18px',
                left: `calc(50% - 9px + ${leanIndex / 2}%)`
              }}
              animate={{ x: wobbleOffset * 0.5 }}
              transition={{ type: 'spring', stiffness: 300, damping: 15 }}
            />
          </div>

          {Math.abs(leanIndex) > 60 && (
            <div className="text-[10px] text-rose-400 font-bold mt-1 flex items-center justify-center gap-1 animate-pulse">
              <AlertTriangle className="w-3.5 h-3.5" />
              <span>경고: 타워의 질량중심 밸런스가 한쪽으로 쏠렸습니다!</span>
            </div>
          )}
        </div>
      )}

      {/* Jenga Tower Container Area */}
      <div className="flex-1 w-full max-w-sm flex items-end justify-center relative overflow-y-auto px-4 py-6 custom-scrollbar">
        
        {/* Decorative Desk surface ground line */}
        <div className="absolute bottom-5 left-0 right-0 h-1 bg-amber-800/40 rounded border-t border-amber-900 border-dashed" />

        <motion.div 
          className="flex flex-col-reverse items-center relative z-10 filter drop-shadow-[0_10px_10px_rgba(0,0,0,0.6)]"
          style={{
            transformOrigin: 'bottom center',
            transform: `rotate(${leanIndex * 0.12}deg) translateX(${wobbleOffset}px)`
          }}
          transition={{ type: 'spring', stiffness: 200, damping: 10 }}
        >
          {levels.map((level, lIndex) => {
            const isTopLevel = lIndex === levels.length - 1;
            
            return (
              <motion.div 
                key={level.id}
                layoutId={`level-${level.id}`}
                className="flex justify-center gap-1 h-7 sm:h-8 w-44 sm:w-48 my-[1px] relative"
                style={{
                  // Alternate blocks arrangement view style for realism
                  // Even levels face perpendicular, we represent this with a slight border shade shift
                  zIndex: lIndex
                }}
              >
                {/* Level Tag Index */}
                <div className="absolute -left-7 top-1/2 -translate-y-1/2 text-[9px] font-mono text-zinc-500 font-bold select-none pointer-events-none">
                  F{lIndex + 1}
                </div>

                {level.blocks.map((blockActive, bIndex) => {
                  return (
                    <div 
                      key={bIndex} 
                      className={`h-full ${bIndex === 1 ? 'w-[32%]' : 'w-[31%]'} relative`}
                    >
                      <AnimatePresence>
                        {blockActive ? (
                          <motion.button
                            layoutId={`block-${level.id}-${bIndex}`}
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ 
                              scale: 1.15,
                              opacity: 0, 
                              x: bIndex === 0 ? -120 : bIndex === 2 ? 120 : (Math.random() > 0.5 ? 100 : -100),
                              rotate: bIndex === 0 ? -18 : bIndex === 2 ? 18 : 0
                            }}
                            whileHover={gameState === 'PLAYING' && !isTopLevel ? { scale: 1.05, y: -2 } : {}}
                            disabled={gameState !== 'PLAYING' || isTopLevel}
                            onClick={() => handleBlockPull(level.id, bIndex)}
                            className={`w-full h-full text-[10px] rounded-md font-black border flex items-center justify-center cursor-pointer transition-shadow shadow-[inset_0_2px_4px_rgba(255,255,255,0.15)] ${
                              gameState === 'CRASHED'
                                ? 'bg-zinc-800 border-zinc-700 text-zinc-600'
                                : isTopLevel 
                                  ? 'bg-amber-100 hover:bg-amber-100 border-amber-300 text-amber-900 cursor-default'
                                  : 'bg-orange-200 border-amber-300 hover:border-amber-400 text-amber-900 shadow-md active:bg-orange-300'
                            }`}
                            title={isTopLevel ? "최고층 블록" : "터치하여 아래 블록 빼내기"}
                          >
                            <span className="opacity-15 font-serif">木</span>
                          </motion.button>
                        ) : (
                          // Empty visual gap placeholders
                          <div className="w-full h-full border border-dashed border-zinc-800/20 bg-zinc-950/40 rounded-md pointer-events-none" />
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })}
              </motion.div>
            );
          })}
        </motion.div>
      </div>

      {/* Info status line or Game ending view overlays */}
      <div className="w-full max-w-sm text-center bg-zinc-900/60 p-2.5 rounded-xl border border-white/5 z-10 backdrop-blur-sm shadow flex items-center justify-center gap-1.5 min-h-[36px]">
        {gameState === 'PLAYING' && (
          <span className="text-xs font-bold text-zinc-300 flex items-center gap-1.5 justify-center">
            <Info className="w-4 h-4 text-amber-400 shrink-0" />
            {message}
          </span>
        )}
        {gameState === 'CRASHED' && (
          <div className="flex flex-col gap-2 w-full">
            <span className="text-xs font-bold text-rose-400 flex items-center gap-1 justify-center animate-bounce">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              {message}
            </span>
            <Button 
              onClick={initGame} 
              icon={RefreshCw}
              className="w-full py-2.5 bg-rose-600 text-white hover:bg-rose-700 text-xs font-black shadow-lg shadow-rose-900/20 rounded-xl"
            >
              타워 다시 세우기
            </Button>
          </div>
        )}
      </div>

    </div>
  );
};
