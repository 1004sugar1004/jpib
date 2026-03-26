import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { Button } from '../ui/Button';
import { ArrowLeft, ChevronRight } from 'lucide-react';
import { cn } from '../../lib/utils';

export const GalagaGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'QUIZ' | 'GAMEOVER'>('START');
  const [shipPos, setShipPos] = useState(50);
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number; type: number }[]>([]);
  const [bullets, setBullets] = useState<{ id: number; x: number; y: number; type?: 'normal' | 'power' }[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [powerUp, setPowerUp] = useState<'NONE' | 'TRIPLE' | 'RAPID' | 'SHIELD'>('NONE');
  const [powerUpTime, setPowerUpTime] = useState(0);
  const [explosions, setExplosions] = useState<{ id: number; x: number; y: number }[]>([]);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  // Game state refs for the loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const shipPosRef = useRef(50);
  const enemiesRef = useRef<{ id: number; x: number; y: number; type: number }[]>([]);
  const bulletsRef = useRef<{ id: number; x: number; y: number; type?: 'normal' | 'power' }[]>([]);
  const lastShotTimeRef = useRef(0);
  const scoreRef = useRef(0);
  const comboRef = useRef(0);
  const powerUpRef = useRef<'NONE' | 'TRIPLE' | 'RAPID' | 'SHIELD'>('NONE');
  const powerUpTimeRef = useRef(0);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'QUIZ' | 'GAMEOVER'>('START');

  useEffect(() => {
    console.log('GalagaGame mounted');
    return () => console.log('GalagaGame unmounted');
  }, []);

  // Sync state to refs
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  const startGame = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    setScore(0);
    scoreRef.current = 0;
    setCombo(0);
    comboRef.current = 0;
    setPowerUp('NONE');
    powerUpRef.current = 'NONE';
    setPowerUpTime(0);
    powerUpTimeRef.current = 0;
    setQuizWrongCount(0);
    setEnemies([]);
    enemiesRef.current = [];
    setBullets([]);
    bulletsRef.current = [];
    setExplosions([]);
    shipPosRef.current = 50;
    setShipPos(50);
  };

  const shoot = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING') return;

    const now = Date.now();
    const cooldown = powerUpRef.current === 'RAPID' ? 80 : 250;
    if (now - lastShotTimeRef.current < cooldown) return;
    lastShotTimeRef.current = now;

    const x = shipPosRef.current;
    const y = 82;

    if (powerUpRef.current === 'TRIPLE') {
      bulletsRef.current.push(
        { id: Date.now() + Math.random(), x: x - 4, y, type: 'power' },
        { id: Date.now() + Math.random(), x: x, y, type: 'power' },
        { id: Date.now() + Math.random(), x: x + 4, y, type: 'power' }
      );
    } else {
      bulletsRef.current.push({ id: Date.now() + Math.random(), x, y });
    }

    if (soundEnabled) {
      try {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1667/1667-preview.mp3');
        audio.volume = 0.05;
        audio.play().catch(() => {});
      } catch (e) {}
    }
  }, [soundEnabled]);

  // Game Loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;

      if (deltaTime > 16) {
        if (gameStateRef.current === 'PLAYING') {
          // 0. Update Power-up
          if (powerUpTimeRef.current > 0) {
            powerUpTimeRef.current -= 16;
            if (powerUpTimeRef.current <= 0) {
              powerUpTimeRef.current = 0;
              powerUpRef.current = 'NONE';
              setPowerUp('NONE');
            }
            setPowerUpTime(powerUpTimeRef.current);
          }

          // 1. Move Enemies
          enemiesRef.current = enemiesRef.current
            .map(e => ({ ...e, y: e.y + 0.6 + (scoreRef.current / 10000), x: e.x + Math.sin(e.y / 15) * 1.5 }))
            .filter(e => e.y < 105);

          // 2. Spawn Enemies
          const spawnRate = 0.94 - (scoreRef.current / 50000);
          if (Math.random() > Math.max(0.85, spawnRate)) {
            enemiesRef.current.push({ 
              id: Date.now() + Math.random(), 
              x: Math.random() * 80 + 10, 
              y: -5,
              type: Math.floor(Math.random() * 4)
            });
          }

          // 3. Move Bullets
          bulletsRef.current = bulletsRef.current
            .map(b => ({ ...b, y: b.y - 5 }))
            .filter(b => b.y > -5);

          // 4. Collision Detection
          const hitEnemyIds = new Set<number>();
          const hitBulletIds = new Set<number>();

          bulletsRef.current.forEach(bullet => {
            enemiesRef.current.forEach(enemy => {
              if (Math.abs(bullet.x - enemy.x) < 6 && Math.abs(bullet.y - enemy.y) < 7) {
                hitEnemyIds.add(enemy.id);
                hitBulletIds.add(bullet.id);
              }
            });
          });

          // Check if enemy hit player
          enemiesRef.current.forEach(enemy => {
            if (enemy.y > 80 && Math.abs(enemy.x - shipPosRef.current) < 8) {
              if (powerUpRef.current === 'SHIELD') {
                powerUpRef.current = 'NONE';
                setPowerUp('NONE');
                powerUpTimeRef.current = 0;
                hitEnemyIds.add(enemy.id); // Destroy enemy that hit shield
              } else {
                setGameState('QUIZ');
                gameStateRef.current = 'QUIZ';
                setShowQuiz(true);
              }
            }
          });

          if (hitEnemyIds.size > 0) {
            const newExplosions: { id: number; x: number; y: number }[] = [];
            enemiesRef.current.forEach(e => {
              if (hitEnemyIds.has(e.id)) {
                newExplosions.push({ id: Date.now() + Math.random(), x: e.x, y: e.y });
                
                // Random Power-up Drop
                if (Math.random() > 0.9) {
                  const types: ('TRIPLE' | 'RAPID' | 'SHIELD')[] = ['TRIPLE', 'RAPID', 'SHIELD'];
                  const type = types[Math.floor(Math.random() * types.length)];
                  powerUpRef.current = type;
                  setPowerUp(type);
                  powerUpTimeRef.current = 8000; // 8 seconds
                }
              }
            });
            setExplosions(prev => [...prev, ...newExplosions].slice(-10));
            setTimeout(() => setExplosions(prev => prev.filter(ex => !newExplosions.find(ne => ne.id === ex.id))), 500);

            enemiesRef.current = enemiesRef.current.filter(e => !hitEnemyIds.has(e.id));
            bulletsRef.current = bulletsRef.current.filter(b => !hitBulletIds.has(b.id));
            
            comboRef.current += hitEnemyIds.size;
            setCombo(comboRef.current);
            
            scoreRef.current += hitEnemyIds.size * 100 * (1 + Math.floor(comboRef.current / 10));
            setScore(scoreRef.current);

            if (soundEnabled) {
              try {
                const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/1667/1667-preview.mp3');
                audio.volume = 0.1;
                audio.play().catch(() => {});
              } catch (e) {}
            }
          } else if (enemiesRef.current.some(e => e.y > 100)) {
            comboRef.current = 0;
            setCombo(0);
          }

          // 5. Sync to state for rendering
          setEnemies([...enemiesRef.current]);
          setBullets([...bulletsRef.current]);
        }
        lastTimeRef.current = time;
      }
      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [soundEnabled]);

  // Input Handling
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (gameStateRef.current !== 'PLAYING') return;

      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        shoot();
      }
      if (e.code === 'ArrowLeft') {
        shipPosRef.current = Math.max(5, shipPosRef.current - 5);
        setShipPos(shipPosRef.current);
      }
      if (e.code === 'ArrowRight') {
        shipPosRef.current = Math.min(95, shipPosRef.current + 5);
        setShipPos(shipPosRef.current);
      }
    };

    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shoot]);

  return (
    <div className="w-full h-full bg-[#050505] relative overflow-hidden flex flex-col items-center min-h-[400px]">
      {/* 별 배경 */}
      {Array(15)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ top: -10, left: `${Math.random() * 100}%` }}
            animate={{ top: '110%' }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 5,
            }}
            className="absolute w-0.5 h-0.5 bg-white/20 rounded-full"
          />
        ))}

      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8"
          >
            <div className="text-7xl mb-4">🚀</div>
            <h2 className="text-4xl font-black text-white tracking-tighter">IB 갤러그</h2>
            <p className="text-white/60 font-bold max-w-xs">
              우주선을 조종하여 적을 물리치세요!<br />
              콤보를 쌓아 더 높은 점수를 획득하세요!
            </p>
            <Button 
              onClick={startGame}
              className="w-full py-6 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xl shadow-[0_0_30px_rgba(37,99,235,0.4)]"
            >
              게임 시작하기
            </Button>
          </motion.div>
        </div>
      )}

      {gameState === 'GAMEOVER' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/90 backdrop-blur-xl p-6 text-center">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="space-y-6"
          >
            <h2 className="text-6xl font-black text-white tracking-tighter">GAME OVER</h2>
            <p className="text-2xl font-bold text-white/60">최종 점수: {score}</p>
            <Button 
              onClick={startGame}
              className="py-4 px-12 bg-white text-black hover:bg-gray-200 rounded-2xl font-black text-xl"
            >
              다시 도전하기
            </Button>
          </motion.div>
        </div>
      )}

      {showQuiz && (
        <MiniQuiz
          soundEnabled={soundEnabled}
          wrongCount={quizWrongCount}
          onCorrect={() => {
            setShowQuiz(false);
            setGameState('PLAYING');
            gameStateRef.current = 'PLAYING';
            // Bonus for correct quiz
            powerUpRef.current = 'TRIPLE';
            setPowerUp('TRIPLE');
            powerUpTimeRef.current = 10000;
          }}
          onWrong={() => {
            setQuizWrongCount(prev => prev + 1);
          }}
          onFail={() => {
            setShowQuiz(false);
            startGame(); // Reset game
          }}
        />
      )}

      {/* 상단 HUD */}
      <div className="absolute top-4 left-4 text-white font-black z-20 flex flex-col gap-1">
        <div className="flex items-center gap-4">
          <span className="text-2xl tracking-tighter italic">SCORE: {score.toLocaleString()}</span>
          {combo > 1 && (
            <motion.span 
              key={combo}
              initial={{ scale: 1.5, color: '#facc15' }}
              animate={{ scale: 1, color: '#ffffff' }}
              className="text-xl text-yellow-400"
            >
              {combo} COMBO!
            </motion.span>
          )}
        </div>
        
        {powerUp !== 'NONE' && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-blue-400 font-bold uppercase tracking-widest">
              {powerUp} ACTIVE
            </span>
            <div className="w-32 h-1 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                className="h-full bg-blue-500"
                style={{ width: `${(powerUpTime / 8000) * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>
      
      <div className="absolute top-4 right-4 text-white/40 text-[10px] z-20 text-right leading-tight">
        화살표 키로 이동<br />스페이스바로 공격
      </div>

      {/* 우주선 */}
      <motion.div
        animate={{ left: `${shipPos}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute bottom-24 -translate-x-1/2 text-5xl z-10 select-none"
      >
        <div className="relative">
          🚀
          {powerUp === 'SHIELD' && (
            <motion.div 
              animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="absolute inset-0 -m-2 border-4 border-blue-400 rounded-full bg-blue-400/20 blur-sm"
            />
          )}
        </div>
      </motion.div>

      {/* 폭발 효과 */}
      {explosions.map(ex => (
        <motion.div
          key={ex.id}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          className="absolute text-2xl z-20 pointer-events-none"
          style={{ left: `${ex.x}%`, top: `${ex.y}%`, transform: 'translate(-50%, -50%)' }}
        >
          💥
        </motion.div>
      ))}

      {/* 총알 */}
      {bullets.map(b => (
        <div
          key={b.id}
          className={cn(
            "absolute w-1 h-4 rounded-full z-10",
            b.type === 'power' 
              ? "bg-blue-400 w-1.5 h-6 shadow-[0_0_12px_rgba(96,165,250,0.8)]" 
              : "bg-yellow-300 shadow-[0_0_8px_rgba(253,224,71,0.8)]"
          )}
          style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translateX(-50%)' }}
        />
      ))}

      {/* 적 */}
      {enemies.map(e => (
        <div
          key={e.id}
          className="absolute text-3xl z-10 select-none"
          style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }}
        >
          {['👾', '👽', '🛸', '🐙'][e.type || 0]}
        </div>
      ))}

      {/* 하단 컨트롤 */}
      <div className="absolute bottom-8 left-0 right-0 px-8 flex justify-between items-center z-20">
        <div className="flex gap-4">
          <button
            onPointerDown={() => {
              const move = () => {
                shipPosRef.current = Math.max(5, shipPosRef.current - 3);
                setShipPos(shipPosRef.current);
              };
              move();
            }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ArrowLeft className="text-white w-8 h-8" />
          </button>
          <button
            onPointerDown={() => {
              shipPosRef.current = Math.min(95, shipPosRef.current + 3);
              setShipPos(shipPosRef.current);
            }}
            className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center active:scale-90 transition-transform"
          >
            <ChevronRight className="text-white w-8 h-8" />
          </button>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            shoot();
          }}
          className="w-24 h-24 rounded-full bg-red-600 border-4 border-red-400 shadow-[0_0_30px_rgba(220,38,38,0.5)] flex flex-col items-center justify-center active:scale-95 transition-all group"
        >
          <span className="text-3xl group-active:scale-125 transition-transform">🔥</span>
          <span className="text-white text-[10px] font-black mt-1">FIRE</span>
        </button>
      </div>
    </div>
  );
};
