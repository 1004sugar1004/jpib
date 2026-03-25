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
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bullets, setBullets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(10);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);

  // Game state refs for the loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const shipPosRef = useRef(50);
  const enemiesRef = useRef<{ id: number; x: number; y: number }[]>([]);
  const bulletsRef = useRef<{ id: number; x: number; y: number }[]>([]);
  const shotsLeftRef = useRef(10);
  const scoreRef = useRef(0);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'QUIZ' | 'GAMEOVER'>('START');

  useEffect(() => {
    console.log('GalagaGame mounted');
    return () => console.log('GalagaGame unmounted');
  }, []);

  // Sync state to refs
  useEffect(() => {
    gameStateRef.current = gameState;
    shotsLeftRef.current = shotsLeft;
  }, [gameState, shotsLeft]);

  const startGame = () => {
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    setScore(0);
    scoreRef.current = 0;
    setQuizWrongCount(0);
    setShotsLeft(10);
    shotsLeftRef.current = 10;
    setEnemies([]);
    enemiesRef.current = [];
    setBullets([]);
    bulletsRef.current = [];
    shipPosRef.current = 50;
    setShipPos(50);
  };

  const shoot = useCallback(() => {
    if (gameStateRef.current !== 'PLAYING' || shotsLeftRef.current <= 0) return;

    const newBullet = { id: Date.now() + Math.random(), x: shipPosRef.current, y: 82 };
    bulletsRef.current.push(newBullet);
    
    shotsLeftRef.current -= 1;
    setShotsLeft(shotsLeftRef.current);
    
    if (shotsLeftRef.current === 0) {
      setGameState('QUIZ');
      gameStateRef.current = 'QUIZ';
      setShowQuiz(true);
    }
  }, []);

  // Game Loop
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;

      if (deltaTime > 16) {
        if (gameStateRef.current === 'PLAYING') {
          // 1. Move Enemies
          enemiesRef.current = enemiesRef.current
            .map(e => ({ ...e, y: e.y + 0.5 + (scoreRef.current / 5000), x: e.x + Math.sin(e.y / 15) * 1.2 }))
            .filter(e => e.y < 105);

          // 2. Spawn Enemies
          if (Math.random() > 0.96) {
            enemiesRef.current.push({ 
              id: Date.now() + Math.random(), 
              x: Math.random() * 80 + 10, 
              y: -5 
            });
          }

          // 3. Move Bullets
          bulletsRef.current = bulletsRef.current
            .map(b => ({ ...b, y: b.y - 4 }))
            .filter(b => b.y > -5);

          // 4. Collision Detection
          const hitEnemyIds = new Set<number>();
          const hitBulletIds = new Set<number>();

          bulletsRef.current.forEach(bullet => {
            enemiesRef.current.forEach(enemy => {
              if (Math.abs(bullet.x - enemy.x) < 5 && Math.abs(bullet.y - enemy.y) < 6) {
                hitEnemyIds.add(enemy.id);
                hitBulletIds.add(bullet.id);
              }
            });
          });

          // Check if enemy hit player
          enemiesRef.current.forEach(enemy => {
            if (enemy.y > 80 && Math.abs(enemy.x - shipPosRef.current) < 8) {
              setGameState('GAMEOVER');
              gameStateRef.current = 'GAMEOVER';
            }
          });

          if (hitEnemyIds.size > 0) {
            enemiesRef.current = enemiesRef.current.filter(e => !hitEnemyIds.has(e.id));
            bulletsRef.current = bulletsRef.current.filter(b => !hitBulletIds.has(b.id));
            
            scoreRef.current += hitEnemyIds.size * 100;
            setScore(scoreRef.current);

            if (soundEnabled) {
              try {
                const audio = new Audio(ASSETS.sounds.correct);
                audio.volume = 0.1;
                audio.play().catch(() => {});
              } catch (e) {}
            }
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
              에너지가 떨어지면 퀴즈를 풀어야 합니다.
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
            setShotsLeft(10);
            shotsLeftRef.current = 10;
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
      <div className="absolute top-4 left-4 text-white font-black text-xl z-20 flex items-center gap-4">
        <span>점수: {score}</span>
        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-white/60">에너지:</span>
          <div className="flex gap-1">
            {Array(10).fill(0).map((_, i) => (
              <div 
                key={i} 
                className={cn(
                  "w-2 h-4 rounded-sm transition-colors",
                  i < shotsLeft ? "bg-yellow-400" : "bg-white/10"
                )}
              />
            ))}
          </div>
        </div>
      </div>
      
      <div className="absolute top-4 right-4 text-white/40 text-[10px] z-20 text-right leading-tight">
        에너지가 떨어지면<br />퀴즈로 충전하세요!
      </div>

      {/* 우주선 */}
      <motion.div
        animate={{ left: `${shipPos}%` }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="absolute bottom-24 -translate-x-1/2 text-5xl z-10 select-none"
      >
        🚀
      </motion.div>

      {/* 총알 */}
      {bullets.map(b => (
        <div
          key={b.id}
          className="absolute w-1 h-4 bg-yellow-300 rounded-full shadow-[0_0_8px_rgba(253,224,71,0.8)] z-10"
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
          👾
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
