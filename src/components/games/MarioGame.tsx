import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Tone from 'tone';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { quizQuestions, QuizQuestion } from '../../content';
import { cn } from '../../lib/utils';
import { Cloud } from 'lucide-react';
import { Button } from '../ui/Button';

export const MarioGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'QUIZ' | 'GAMEOVER'>('START');
  const [marioY, setMarioY] = useState(0);
  const [worldX, setWorldX] = useState(0);
  const [score, setScore] = useState(0);
  const [life, setLife] = useState(10);
  const [quizCount, setQuizCount] = useState(0);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [gates, setGates] = useState<{ id: number, worldX: number, question: QuizQuestion, options: string[], correctIdx: number, solved: boolean }[]>([]);
  const [gameSpeed, setGameSpeed] = useState(3);
  const [floatingTexts, setFloatingTexts] = useState<{ id: number, x: number, y: number, text: string, color: string }[]>([]);
  const [coins, setCoins] = useState<{ id: number, worldX: number, y: number, vy: number }[]>([]);

  const addFloatingText = (x: number, y: number, text: string, color: string = 'text-yellow-400') => {
    const id = Date.now() + Math.random();
    const newText = { id, x, y, text, color };
    setFloatingTexts(prev => [...prev, newText]);
    setTimeout(() => {
      setFloatingTexts(prev => prev.filter(t => t.id !== id));
    }, 1000);
  };

  // Game state refs for the loop
  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const worldXRef = useRef(0);
  const marioYRef = useRef(0);
  const velocityYRef = useRef(0);
  const isJumpingRef = useRef(false);
  const gatesRef = useRef<{ id: number, worldX: number, question: QuizQuestion, options: string[], correctIdx: number, solved: boolean }[]>([]);
  const scoreRef = useRef(0);
  const lifeRef = useRef(10);
  const quizCountRef = useRef(0);
  const showQuizRef = useRef(false);
  const gameStateRef = useRef<'START' | 'PLAYING' | 'QUIZ' | 'GAMEOVER'>('START');
  const coinsRef = useRef<{ id: number, worldX: number, y: number, vy: number }[]>([]);
  const keysPressed = useRef<Set<string>>(new Set());
  const gameSpeedRef = useRef(3);

  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    gameSpeedRef.current = gameSpeed;
  }, [gameSpeed]);

  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    if (soundEnabled) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    return () => {
      synthRef.current?.dispose();
    };
  }, [soundEnabled]);

  const startGame = async () => {
    await Tone.start();
    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';
    setScore(0);
    scoreRef.current = 0;
    setLife(3);
    lifeRef.current = 3;
    setQuizCount(0);
    quizCountRef.current = 0;
    setQuizWrongCount(0);
    setGates([]);
    gatesRef.current = [];
    worldXRef.current = 0;
    marioYRef.current = 0;
    velocityYRef.current = 0;
    coinsRef.current = [];
    setCoins([]);
    
    // Initial gates
    spawnGate(500);
    spawnGate(1200);
  };

  const playSound = (type: 'jump' | 'correct' | 'wrong' | 'coin') => {
    if (!soundEnabled) return;
    try {
      if (type === 'coin') {
        const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2019/2019-preview.mp3');
        audio.volume = 0.3;
        audio.play().catch(() => {});
        return;
      }
      if (type === 'correct') {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.3;
        audio.play().catch(() => {});
        return;
      }
      if (type === 'wrong') {
        const audio = new Audio(ASSETS.sounds.wrong);
        audio.volume = 0.3;
        audio.play().catch(() => {});
        return;
      }
      if (type === 'jump' && synthRef.current) synthRef.current.triggerAttackRelease("C4", "16n");
    } catch (e) {}
  };

  const spawnGate = (atX?: number) => {
    const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    const options = [...q.options];
    const correctIdx = q.correctAnswer;
    
    // Ensure minimum distance from the last gate
    const lastGateX = gatesRef.current.length > 0 
      ? Math.max(...gatesRef.current.map(g => g.worldX)) 
      : worldXRef.current + 400;
      
    const spawnX = atX || lastGateX + 1200 + Math.random() * 600;
    
    const newGate = { 
      id: Date.now() + Math.random(), 
      worldX: spawnX, 
      question: q, 
      options, 
      correctIdx,
      solved: false,
      hitIdx: -1
    };
    gatesRef.current.push(newGate);
  };

  const animate = (time: number) => {
    if (lastTimeRef.current === null) {
      lastTimeRef.current = time;
    }
    const deltaTime = time - lastTimeRef.current;

    if (deltaTime > 16) {
      if (gameStateRef.current === 'PLAYING' && !showQuizRef.current) {
        // 1. World Movement (Manual Control)
        const moveSpeed = 4 + gameSpeedRef.current;
        if (keysPressed.current.has('ArrowRight') || keysPressed.current.has('KeyD')) {
          worldXRef.current += moveSpeed;
        }
        if (keysPressed.current.has('ArrowLeft') || keysPressed.current.has('KeyA')) {
          worldXRef.current = Math.max(0, worldXRef.current - moveSpeed);
        }
        
        // Optional: slow auto-scroll to keep the game moving forward
        worldXRef.current += (gameSpeedRef.current * 0.5); 

        // 2. Mario Physics (Jump only)
        let nextY = marioYRef.current + velocityYRef.current;
        if (nextY <= 0) {
          nextY = 0;
          velocityYRef.current = 0;
          isJumpingRef.current = false;
        } else {
          velocityYRef.current -= 0.8;
        }
        marioYRef.current = nextY;

        // 3. Collision Detection
        const marioWorldX = worldXRef.current + 150; // Mario's horizontal position in world

        gatesRef.current.forEach(g => {
          // Check if Mario is horizontally within the gate area
          const relativeX = marioWorldX - g.worldX;
          
          // The gate container is centered at g.worldX
          // Bricks are in a flex container. Let's assume they are roughly at:
          // Option 0: -180 to -20
          // Option 1: -80 to 80
          // Option 2: 20 to 180
          // (Adjusted for 3 bricks of w-40 with gap-6)
          
          if (!g.solved && Math.abs(relativeX) < 300 && marioYRef.current > 90 && marioYRef.current < 160 && velocityYRef.current > 0) {
            // Determine which option was hit dynamically
            const numOptions = g.options.length;
            const brickWidth = 160; // w-40
            const gap = 24; // gap-6
            const totalWidth = numOptions * brickWidth + (numOptions - 1) * gap;
            const startX = -totalWidth / 2;
            
            const hitIdx = Math.floor((relativeX - startX) / (brickWidth + gap));

            if (hitIdx >= 0 && hitIdx < numOptions) {
              // Check if actually hit the brick (not the gap)
              const brickRelativeX = (relativeX - startX) % (brickWidth + gap);
              if (brickRelativeX <= brickWidth) {
                g.solved = true;
                g.hitIdx = hitIdx;
                velocityYRef.current = -5; // Bounce back
                
                const isCorrect = hitIdx === g.correctIdx;
                
                if (isCorrect) {
                  scoreRef.current += 500;
                  setScore(scoreRef.current);
                  playSound('coin');
                  playSound('correct');
                  addFloatingText(150, 100 + marioYRef.current, 'CORRECT! +500', 'text-green-400');
                  
                  // Add coin effect - spawn exactly above the hit brick
                  const brickCenterRelX = startX + brickWidth / 2 + hitIdx * (brickWidth + gap);
                  const coinWorldX = g.worldX + brickCenterRelX;
                  
                  const newCoin = {
                    id: Date.now() + Math.random(),
                    worldX: coinWorldX,
                    y: 100 + 160 + 20,
                    vy: 12
                  };
                  coinsRef.current.push(newCoin);
                  setCoins([...coinsRef.current]);

                  // Jump again for joy
                  velocityYRef.current = 15;
                  
                  quizCountRef.current += 1;
                  setQuizCount(quizCountRef.current);
                  
                  // Every 5 correct answers, show a mini quiz challenge
                  if (quizCountRef.current % 5 === 0) {
                    showQuizRef.current = true;
                    setShowQuiz(true);
                  }
                } else {
                  playSound('wrong');
                  addFloatingText(150, 100 + marioYRef.current, 'WRONG!', 'text-red-400');
                  
                  setLife(prev => {
                    const next = Math.max(0, prev - 1);
                    lifeRef.current = next;
                    if (next === 0) {
                      setGameState('GAMEOVER');
                      gameStateRef.current = 'GAMEOVER';
                    }
                    return next;
                  });
                }
              }
            }
          }
        });

        // 5. Cleanup & Spawn & Miss Penalty
        gatesRef.current = gatesRef.current.filter(g => {
          const isOffScreen = g.worldX < worldXRef.current - 200;
          if (isOffScreen && !g.solved) {
            // Missed the gate!
            setLife(prev => {
              const next = Math.max(0, prev - 1);
              lifeRef.current = next;
              if (next === 0) {
                setGameState('GAMEOVER');
                gameStateRef.current = 'GAMEOVER';
              }
              return next;
            });
            addFloatingText(150, 200, 'MISSED! -1 ❤️', 'text-red-500');
            playSound('wrong');
          }
          return !isOffScreen;
        });

        if (gatesRef.current.length < 2) {
          spawnGate();
        }
      }

      // 6. Sync to state (Move outside the !showQuizRef block so updates like 'solved' are visible immediately)
      if (gameStateRef.current === 'PLAYING') {
        setMarioY(marioYRef.current);
        setGates([...gatesRef.current]);
        setWorldX(worldXRef.current);
      }

      // Coin Physics - Outside the quiz-pause block so they keep moving
      if (gameStateRef.current === 'PLAYING') {
        coinsRef.current.forEach(c => {
          c.y += c.vy;
          c.vy -= 0.5;
        });
        const activeCoins = coinsRef.current.filter(c => c.y > -50);
        if (activeCoins.length !== coinsRef.current.length || activeCoins.length > 0) {
          coinsRef.current = activeCoins;
          setCoins([...coinsRef.current]);
        }
      }

      lastTimeRef.current = time;
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressed.current.add(e.code);
      if (gameStateRef.current !== 'PLAYING' || showQuizRef.current) return;
      if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !isJumpingRef.current) {
        velocityYRef.current = 15;
        isJumpingRef.current = true;
        playSound('jump');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressed.current.delete(e.code);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  return (
    <div className="w-full h-full bg-[#5c94fc] relative overflow-hidden flex flex-col items-center min-h-[400px] select-none">
      {/* Parallax Background - Far Clouds */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-30"
        style={{ transform: `translateX(${-(worldX * 0.1) % 100}%)` }}
      >
        <div className="absolute top-20 left-[10%]"><Cloud className="w-16 h-10 text-white" /></div>
        <div className="absolute top-40 left-[110%]"><Cloud className="w-16 h-10 text-white" /></div>
      </div>

      {/* Parallax Background - Near Clouds */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{ transform: `translateX(${-(worldX * 0.3) % 100}%)` }}
      >
        <div className="absolute top-32 left-[40%]"><Cloud className="w-24 h-14 text-white" /></div>
        <div className="absolute top-32 left-[140%]"><Cloud className="w-24 h-14 text-white" /></div>
      </div>

      {gameState === 'START' && (
        <div className="absolute inset-0 z-30 flex flex-col items-center justify-center bg-black/80 backdrop-blur-md p-6 text-center">
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8"
          >
            <div className="relative w-24 h-24 mx-auto mb-4">
               <div className="absolute inset-0 bg-red-500 rounded-full animate-ping opacity-20" />
               <div className="text-7xl relative z-10">🍄</div>
            </div>
            <h2 className="text-5xl font-black text-white tracking-tighter italic">SUPER IB MARIO</h2>
            <p className="text-white/60 font-bold max-w-xs text-lg">
              마리오가 달려갑니다!<br />
              점프해서 퀴즈 블록을 치세요.
            </p>
            <Button 
              onClick={startGame}
              className="w-full py-6 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-black text-2xl shadow-[0_10px_0_rgb(153,27,27)] active:translate-y-1 active:shadow-none transition-all"
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
            showQuizRef.current = false;
            setQuizWrongCount(0); // Reset for next time
            // Correct effect: Mario jumps!
            if (!isJumpingRef.current) {
              velocityYRef.current = 18;
              isJumpingRef.current = true;
              playSound('jump');
            }
            setScore(prev => prev + 500);
            scoreRef.current += 500;
            addFloatingText(150, 100 + marioYRef.current, 'CORRECT! +500', 'text-green-400');
            
            // Add coin effect for quiz success too
            const newCoin = {
              id: Date.now() + Math.random(),
              worldX: worldXRef.current + 150,
              y: 100 + marioYRef.current + 60,
              vy: 14
            };
            coinsRef.current.push(newCoin);
            setCoins([...coinsRef.current]);
            
            playSound('correct');
            playSound('coin');
          }} 
          onWrong={() => {
            setQuizWrongCount(prev => prev + 1);
            // Penalty: Lose one life
            setLife(prev => {
              const next = Math.max(0, prev - 1);
              lifeRef.current = next;
              if (next === 0) {
                setGameState('GAMEOVER');
                gameStateRef.current = 'GAMEOVER';
              }
              return next;
            });
          }}
          onFail={() => {
            setShowQuiz(false);
            showQuizRef.current = false;
            setQuizWrongCount(0); // Reset for next time
            setGameState('GAMEOVER');
            gameStateRef.current = 'GAMEOVER';
          }}
        />
      )}
      
      {/* HUD */}
      <div className="absolute top-4 left-4 z-20 flex gap-4">
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white/20 text-white shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Score</div>
          <div className="text-2xl font-black tabular-nums">{score}</div>
        </div>
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white/20 text-white shadow-xl">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60">Life</div>
          <div className="text-2xl font-black flex gap-1 items-center">
            <span className="text-red-500">❤️</span>
            <span className="ml-1">{life}</span>
          </div>
        </div>
        
        {/* Speed Control */}
        <div className="bg-black/40 backdrop-blur-md px-6 py-3 rounded-2xl border-2 border-white/20 text-white shadow-xl flex flex-col justify-center">
          <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Speed</div>
          <input 
            type="range" 
            min="1" 
            max="10" 
            value={gameSpeed} 
            onChange={(e) => setGameSpeed(parseInt(e.target.value))}
            className="w-24 h-2 bg-white/20 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>
      </div>

      {/* Mario - Improved Sprite */}
      <div 
        className="absolute w-16 h-16 z-20"
        style={{ 
          left: `150px`, 
          bottom: `${100 + marioY}px`,
        }}
      >
        {/* Shadow */}
        <div 
          className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-10 h-2 bg-black/20 rounded-full blur-sm"
          style={{ transform: `translateX(-50%) scale(${1 - marioY/200})` }}
        />
        
        <motion.div 
          animate={isJumpingRef.current ? { scale: [1, 1.1, 1] } : { y: [0, -5, 0] }}
          transition={isJumpingRef.current ? { duration: 0.2 } : { duration: 0.4, repeat: Infinity }}
          className="w-full h-full relative"
        >
          {/* Hair */}
          <div className="absolute top-2 left-2 w-4 h-6 bg-[#8B4513] rounded-full" />
          <div className="absolute top-4 left-1 w-3 h-5 bg-[#8B4513] rounded-full" />
          
          {/* Hat */}
          <div className="absolute top-0 left-3 w-10 h-4 bg-red-600 rounded-t-lg border-b-2 border-black/20">
            <div className="absolute top-0.5 left-3 w-3 h-3 bg-white rounded-full flex items-center justify-center">
              <span className="text-[8px] font-black text-red-600 leading-none">M</span>
            </div>
          </div>
          <div className="absolute top-1 left-10 w-4 h-2 bg-red-600 rounded-r-full" />
          {/* Face */}
          <div className="absolute top-4 left-4 w-9 h-7 bg-[#FFD59F] rounded-md shadow-sm" />
          <div className="absolute top-6 left-10 w-2 h-2 bg-black rounded-full" /> {/* Eye */}
          <div className="absolute top-8 left-11 w-3 h-2 bg-[#FFB07C] rounded-full" /> {/* Nose */}
          <div className="absolute top-8 left-6 w-4 h-1 bg-[#8B4513] rounded-full" /> {/* Mustache */}
          {/* Sideburns */}
          <div className="absolute top-6 left-3 w-2 h-4 bg-[#8B4513] rounded-sm" />
          {/* Body */}
          <div className="absolute top-11 left-4 w-9 h-5 bg-red-600 rounded-sm" />
          <div className="absolute top-11 left-5 w-7 h-5 bg-blue-700 rounded-b-md" />
          {/* Arms */}
          <div className="absolute top-11 left-1 w-4 h-4 bg-red-600 rounded-full" />
          <div className="absolute top-11 left-12 w-4 h-4 bg-red-600 rounded-full" />
          {/* Legs with running animation */}
          <motion.div 
            animate={!isJumpingRef.current ? { rotate: [-10, 10, -10] } : {}}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute bottom-0 left-4 w-4 h-3 bg-blue-800 rounded-sm" 
          />
          <motion.div 
            animate={!isJumpingRef.current ? { rotate: [10, -10, 10] } : {}}
            transition={{ duration: 0.2, repeat: Infinity }}
            className="absolute bottom-0 left-9 w-4 h-3 bg-blue-800 rounded-sm" 
          />
        </motion.div>
      </div>

      {/* World Objects (Gates/Bricks) */}
      {gates.map(g => (
        <div 
          key={g.id}
          className="absolute w-[600px] h-full z-10"
          style={{ left: `${g.worldX - worldX - 300}px` }}
        >
          {/* Question Box */}
          <motion.div 
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="absolute bottom-[360px] left-0 right-0 bg-white/95 backdrop-blur-md p-6 rounded-3xl border-4 border-yellow-500 shadow-2xl"
          >
            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-yellow-500 text-white px-4 py-1.5 rounded-full text-xs font-black shadow-lg">QUIZ</div>
            <p className="text-lg font-black text-gray-800 text-center leading-tight">
              {g.question.question}
            </p>
          </motion.div>

          {/* Bricks */}
          <div className="absolute bottom-[260px] left-0 right-0 flex justify-center gap-6">
            {g.options.map((opt, i) => {
              const isHit = g.solved && g.hitIdx === i;
              const isCorrect = i === g.correctIdx;
              
              return (
                <motion.div 
                  key={i}
                  animate={isHit ? { 
                    y: [0, -20, 0],
                    scale: isCorrect ? [1, 1.1, 1] : [1, 0.9, 1]
                  } : {}}
                  className={cn(
                    "w-40 h-24 flex items-center justify-center text-white font-black text-sm rounded-2xl border-4 border-black/20 shadow-xl transition-all",
                    g.solved 
                      ? (isCorrect ? "bg-yellow-600 scale-105 border-yellow-800" : "bg-gray-400 opacity-50") 
                      : "bg-[#b85c38] hover:scale-105"
                  )}
                >
                  <div className="absolute inset-0 opacity-20" style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 1px)', backgroundSize: '12px 12px' }} />
                  {isHit && isCorrect ? (
                    <div className="text-4xl">?</div>
                  ) : (
                    <span className="relative z-10 text-center px-3 drop-shadow-md">{opt}</span>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      ))}

      {/* Coins */}
      {coins.map(c => (
        <motion.div
          key={c.id}
          className="absolute w-10 h-10 bg-yellow-400 rounded-full border-2 border-yellow-600 flex items-center justify-center z-30 shadow-[0_0_15px_rgba(250,204,21,0.6)]"
          style={{ 
            left: `${c.worldX - worldX}px`, 
            bottom: `${c.y}px`,
            transform: 'translateX(-50%)' 
          }}
          animate={{ 
            rotateY: [0, 180, 360],
            scale: [1, 1.2, 1]
          }}
          transition={{ 
            rotateY: { duration: 0.4, repeat: Infinity, ease: "linear" },
            scale: { duration: 0.2, repeat: Infinity }
          }}
        >
          <div className="w-1.5 h-6 bg-yellow-600 rounded-full" />
        </motion.div>
      ))}

      {/* Floating Texts */}
      <AnimatePresence>
        {floatingTexts.map(t => (
          <motion.div
            key={t.id}
            initial={{ opacity: 1, y: 0 }}
            animate={{ opacity: 0, y: -100 }}
            exit={{ opacity: 0 }}
            className={cn("absolute z-50 font-black text-2xl drop-shadow-lg", t.color)}
            style={{ left: t.x, bottom: t.y }}
          >
            {t.text}
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Ground - Scrolling Texture */}
      <div className="absolute bottom-0 left-0 right-0 h-[100px] bg-[#c84c0c] border-t-8 border-black overflow-hidden">
        <div 
          className="absolute inset-0 flex"
          style={{ transform: `translateX(${-(worldX % 100)}px)` }}
        >
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="min-w-[100px] h-full border-r-4 border-black/20 flex flex-col">
              <div className="h-4 bg-[#00aa00] border-b-4 border-black" />
              <div className="flex-1 opacity-10" style={{ backgroundImage: 'linear-gradient(45deg, #000 25%, transparent 25%, transparent 50%, #000 50%, #000 75%, transparent 75%, transparent)' , backgroundSize: '20px 20px' }} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
