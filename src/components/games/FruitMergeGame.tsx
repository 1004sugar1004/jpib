import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Matter from 'matter-js';
import * as Tone from 'tone';
import { Button } from '../ui/Button';
import { Trophy, Apple, Grid3X3, Rocket, ShoppingCart, Gamepad2, Lock, ArrowLeft, Star, Zap, BookOpen, Sparkles, Timer, Target, XCircle, CheckCircle2 } from 'lucide-react';
import { quizQuestions } from '../../content';
import confetti from 'canvas-confetti';
import { cn } from '../../lib/utils';

const FRUITS_DATA = [
  { level: 0, name: '체리', score: 1, emoji: '🍒', description: '작고 귀여운 체리예요.' },
  { level: 1, name: '딸기', score: 3, emoji: '🍓', description: '새콤달콤 맛있는 딸기!' },
  { level: 2, name: '포도', score: 6, emoji: '🍇', description: '송이송이 탐스러운 포도!' },
  { level: 3, name: '오렌지', score: 10, emoji: '🍊', description: '상큼한 비타민 가득 오렌지!' },
  { level: 4, name: '사과', score: 15, emoji: '🍎', description: '아삭아삭 매일 먹고 싶은 사과!' },
  { level: 5, name: '복숭아', score: 21, emoji: '🍑', description: '달콤한 과즙이 가득한 복숭아!' },
  { level: 6, name: '파인애플', score: 28, emoji: '🍍', description: '열대 과일의 왕, 파인애플!' },
  { level: 7, name: '수박', score: 36, emoji: '🍉', description: '여름을 대표하는 시원한 수박!' },
  { level: 8, name: '멜론', score: 45, emoji: '🍈', description: '부드럽고 달콤한 멜론!' },
  { level: 9, name: '망고', score: 55, emoji: '🥭', description: '진한 향기가 매력적인 망고!' },
  { level: 10, name: '코코넛', score: 100, emoji: '🥥', description: '단단한 껍질 속 특별한 맛, 코코넛!'}
];

const MAX_LEVEL = 10;
const MAX_SPAWN_LEVEL = 4;

export const FruitMergeGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const gameContainerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);
  const gameOverCheckTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const bodiesToRemoveRef = useRef<Set<Matter.Body>>(new Set());
  const bodiesToAddRef = useRef<{ x: number, y: number, level: number }[]>([]);
  
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(() => Number(localStorage.getItem('fruit-merge-highscore') || 0));
  const [discoveredFruits, setDiscoveredFruits] = useState<number[]>(() => JSON.parse(localStorage.getItem('discoveredFruits') || '[0]'));
  const [isGameOver, setIsGameOver] = useState(false);
  const [currentFruit, setCurrentFruit] = useState<Matter.Body | null>(null);
  const [nextFruitLevel, setNextFruitLevel] = useState(0);
  const [gameState, setGameState] = useState<'BOOTING' | 'IDLE' | 'QUIZ' | 'AIMING' | 'DROPPING' | 'POPUP' | 'GAMEOVER'>('BOOTING');
  const [discoveryFruit, setDiscoveryFruit] = useState<number | null>(null);
  const [showGameComplete, setShowGameComplete] = useState(false);
  const [quizWrongCount, setQuizWrongCount] = useState(0);
  
  // Quiz State
  const [currentQuiz, setCurrentQuiz] = useState<any>(null);
  const [quizFeedback, setQuizFeedback] = useState<{ text: string, color: string } | null>(null);
  const [quizAnswerable, setQuizAnswerable] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);

  const fruits = useMemo(() => {
    if (!gameContainerRef.current) return FRUITS_DATA.map(f => ({ ...f, radius: 20 }));
    const width = gameContainerRef.current.clientWidth;
    return FRUITS_DATA.map(f => ({
      ...f,
      radius: width * (0.045 + f.level * 0.02) // Dynamic radius based on level
    }));
  }, [gameContainerRef.current]);

  const playSound = useCallback((type: string, level?: number) => {
    if (!soundEnabled) return;
    const synth = new Tone.PolySynth(Tone.Synth).toDestination();
    synth.volume.value = -10;
    
    if (type === 'drop') synth.triggerAttackRelease("C5", "16n");
    if (type === 'merge') synth.triggerAttackRelease(Tone.Frequency("C4").transpose(level || 0).toNote(), "8n");
    if (type === 'discovery') {
      const now = Tone.now();
      synth.triggerAttackRelease("C5", "8n", now);
      synth.triggerAttackRelease("E5", "8n", now + 0.1);
      synth.triggerAttackRelease("G5", "8n", now + 0.2);
    }
    if (type === 'complete') {
      const now = Tone.now();
      synth.triggerAttackRelease("C5", "8n", now);
      synth.triggerAttackRelease("G5", "8n", now + 0.2);
      synth.triggerAttackRelease("C6", "8n", now + 0.4);
    }
    if (type === 'gameOver') {
      const now = Tone.now();
      synth.triggerAttackRelease("C4", "8n", now);
      synth.triggerAttackRelease("G3", "8n", now + 0.2);
      synth.triggerAttackRelease("E3", "8n", now + 0.4);
    }
    if (type === 'correct') synth.triggerAttackRelease("C6", "16n");
    if (type === 'wrong') synth.triggerAttackRelease("C3", "16n");
  }, [soundEnabled]);

  const createFruit = (x: number, y: number, level: number) => {
    if (level > MAX_LEVEL) return null;
    const fruitInfo = fruits[level];
    const fruit = Matter.Bodies.circle(x, y, fruitInfo.radius, {
      label: `fruit_${level}`,
      restitution: 0.3,
      friction: 0.5,
      render: { fillStyle: 'transparent' }
    });

    if (!discoveredFruits.includes(level)) {
      setDiscoveredFruits(prev => {
        const next = [...prev, level];
        localStorage.setItem('discoveredFruits', JSON.stringify(next));
        return next;
      });
      setDiscoveryFruit(level);
    }
    
    return fruit;
  };

  const addFruitToWorld = (x: number, y: number, level: number) => {
    const fruit = createFruit(x, y, level);
    if (fruit && engineRef.current) {
      Matter.World.add(engineRef.current.world, fruit);
      return fruit;
    }
    return null;
  };

  const handleCollision = (event: Matter.IEventCollision<Matter.Engine>) => {
    if (isGameOver) return;
    const pairs = event.pairs;
    for (const pair of pairs) {
      const { bodyA, bodyB } = pair;
      if (!bodyA.label || !bodyB.label || bodiesToRemoveRef.current.has(bodyA) || bodiesToRemoveRef.current.has(bodyB)) continue;

      if (bodyA.label === bodyB.label && bodyA.label.startsWith('fruit_')) {
        const level = parseInt(bodyA.label.split('_')[1]);
        if (level >= MAX_LEVEL) continue;

        bodiesToRemoveRef.current.add(bodyA);
        bodiesToRemoveRef.current.add(bodyB);

        bodiesToAddRef.current.push({
          x: (bodyA.position.x + bodyB.position.x) / 2,
          y: (bodyA.position.y + bodyB.position.y) / 2,
          level: level + 1
        });

        setScore(s => s + fruits[level].score);
        playSound('merge', level + 1);
      }
    }
  };

  const processDeferredActions = () => {
    if (isGameOver || !engineRef.current) return;

    if (bodiesToRemoveRef.current.size > 0) {
      bodiesToRemoveRef.current.forEach(body => {
        if (Matter.Composite.get(engineRef.current!.world, body.id, 'body')) {
          Matter.World.remove(engineRef.current!.world, body);
        }
      });
      bodiesToRemoveRef.current.clear();
    }

    if (bodiesToAddRef.current.length > 0) {
      const itemsToAdd = [...bodiesToAddRef.current];
      bodiesToAddRef.current = [];
      itemsToAdd.forEach(data => {
        addFruitToWorld(data.x, data.y, data.level);
      });
    }

    if (discoveryFruit !== null) {
      setGameState('POPUP');
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (discoveryFruit === MAX_LEVEL) {
        setShowGameComplete(true);
        playSound('complete');
      } else {
        playSound('discovery');
      }
    }
  };

  const init = () => {
    if (!gameContainerRef.current) return;
    
    const width = gameContainerRef.current.clientWidth;
    const height = gameContainerRef.current.clientHeight;

    // Cleanup
    if (engineRef.current) Matter.World.clear(engineRef.current.world, false);
    if (renderRef.current) Matter.Render.stop(renderRef.current);
    if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
    if (renderRef.current?.canvas) renderRef.current.canvas.remove();

    const engine = Matter.Engine.create({ enableSleeping: true });
    engine.world.gravity.y = 1;

    const render = Matter.Render.create({
      element: gameContainerRef.current,
      engine: engine,
      options: {
        width,
        height,
        wireframes: false,
        background: 'transparent'
      }
    });

    const runner = Matter.Runner.create();
    Matter.Render.run(render);
    Matter.Runner.run(runner, engine);

    engineRef.current = engine;
    renderRef.current = render;
    runnerRef.current = runner;

    // Boundaries
    const wallOptions = { isStatic: true, render: { fillStyle: '#a3e635' } };
    Matter.World.add(engine.world, [
      Matter.Bodies.rectangle(width / 2, height, width, 50, wallOptions),
      Matter.Bodies.rectangle(10, height / 2, 20, height, wallOptions),
      Matter.Bodies.rectangle(width - 10, height / 2, 20, height, wallOptions)
    ]);

    // Events
    Matter.Events.on(engine, 'collisionStart', handleCollision);
    Matter.Events.on(engine, 'afterUpdate', processDeferredActions);
    
    Matter.Events.on(render, 'afterRender', () => {
      const bodies = Matter.Composite.allBodies(engine.world);
      const context = render.context;
      let isAboveLine = false;

      bodies.forEach(body => {
        if (body.label && body.label.startsWith('fruit_')) {
          const level = parseInt(body.label.split('_')[1]);
          const fruitInfo = fruits[level];
          context.font = `${fruitInfo.radius * 1.6}px Jua`;
          context.textAlign = "center";
          context.textBaseline = "middle";
          context.fillStyle = '#000000';
          context.fillText(fruitInfo.emoji, body.position.x, body.position.y);

          if (!body.isStatic && body.position.y - body.circleRadius < 100 && body.speed < 0.1) {
            isAboveLine = true;
          }
        }
      });

      // Deadline
      context.beginPath();
      context.moveTo(0, 100);
      context.lineTo(width, 100);
      context.strokeStyle = 'rgba(255, 0, 0, 0.5)';
      context.lineWidth = 2;
      context.setLineDash([5, 5]);
      context.stroke();
      context.setLineDash([]);

      if (isAboveLine && !isGameOver) {
        if (!gameOverCheckTimeoutRef.current) {
          gameOverCheckTimeoutRef.current = setTimeout(() => {
            const bodiesNow = Matter.Composite.allBodies(engine.world);
            let stillAbove = bodiesNow.some(body =>
              body.label?.startsWith('fruit_') && !body.isStatic && body.position.y - body.circleRadius < 100 && body.speed < 0.1
            );
            if (stillAbove) {
              setIsGameOver(true);
              setGameState('GAMEOVER');
              if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
              playSound('gameOver');
            }
            gameOverCheckTimeoutRef.current = null;
          }, 1500);
        }
      } else if (!isAboveLine && gameOverCheckTimeoutRef.current) {
        clearTimeout(gameOverCheckTimeoutRef.current);
        gameOverCheckTimeoutRef.current = null;
      }
    });

    setScore(0);
    setQuizWrongCount(0);
    setIsGameOver(false);
    setCurrentFruit(null);
    setDiscoveryFruit(null);
    setShowGameComplete(false);
    setGameState('IDLE');
    prepareNextFruit();
  };

  const prepareNextFruit = () => {
    let spawnableLevels = discoveredFruits.filter(level => level <= MAX_SPAWN_LEVEL);
    if (spawnableLevels.length === 0) spawnableLevels = [0];
    const randomLevel = spawnableLevels[Math.floor(Math.random() * spawnableLevels.length)];
    setNextFruitLevel(randomLevel);
  };

  const showQuiz = () => {
    if (isGameOver) return;
    setGameState('QUIZ');
    const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setCurrentQuiz(q);
    setQuizFeedback(null);
    setQuizAnswerable(true);
    setShowAnswer(false);
  };

  const checkAnswer = (selectedIdx: number) => {
    if (gameState !== 'QUIZ' || !quizAnswerable) return;

    const correct = selectedIdx === currentQuiz.correctAnswer;
    if (correct) {
      setQuizAnswerable(false);
      setQuizFeedback({ text: "정답! 과일을 놓으세요.", color: 'text-green-600' });
      playSound('correct');
      setTimeout(spawnAndActivateFruit, 1000);
    } else {
      setQuizAnswerable(false);
      playSound('wrong');
      
      if (quizWrongCount === 0) {
        setQuizWrongCount(1);
        setShowAnswer(true);
        setQuizFeedback({ text: "틀렸습니다! 정답을 확인하세요.", color: 'text-amber-600' });
      } else {
        setQuizFeedback({ text: "두 번 틀렸습니다! 게임이 초기화됩니다.", color: 'text-red-600' });
        setTimeout(init, 2000);
      }
    }
  };

  const spawnAndActivateFruit = () => {
    if (!gameContainerRef.current || !engineRef.current) return;
    const width = gameContainerRef.current.clientWidth;
    const fruit = createFruit(width / 2, 50, nextFruitLevel);
    if (!fruit) {
      showQuiz();
      return;
    }

    Matter.Body.setStatic(fruit, true);
    Matter.World.add(engineRef.current.world, fruit);
    setCurrentFruit(fruit);
    prepareNextFruit();
    setGameState('AIMING');
  };

  const dropFruit = () => {
    if (gameState !== 'AIMING' || !currentFruit) return;
    setGameState('DROPPING');
    Matter.Body.setStatic(currentFruit, false);
    Matter.Sleeping.set(currentFruit, false);
    playSound('drop');
    setCurrentFruit(null);

    setTimeout(() => {
      if (!isGameOver) {
        showQuiz();
      }
    }, 800);
  };

  const handleMouseMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState !== 'AIMING' || !currentFruit || !gameContainerRef.current) return;
    const rect = gameContainerRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const x = clientX - rect.left;
    const level = parseInt(currentFruit.label.split('_')[1]);
    const radius = fruits[level].radius;
    const clampedX = Math.max(radius + 10, Math.min(rect.width - radius - 10, x));
    Matter.Body.setPosition(currentFruit, { x: clampedX, y: currentFruit.position.y });
  };

  useEffect(() => {
    init();
    return () => {
      if (renderRef.current) Matter.Render.stop(renderRef.current);
      if (runnerRef.current) Matter.Runner.stop(runnerRef.current);
      if (engineRef.current) Matter.World.clear(engineRef.current.world, false);
      if (gameOverCheckTimeoutRef.current) clearTimeout(gameOverCheckTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (score > highScore) {
      setHighScore(score);
      localStorage.setItem('fruit-merge-highscore', score.toString());
    }
  }, [score]);

  return (
    <div className="w-full h-full bg-green-50 flex flex-col md:flex-row p-2 sm:p-4 gap-4 font-jua">
      {/* Quiz Panel */}
      <div className="w-full md:w-1/3 h-1/2 md:h-full bg-white rounded-3xl shadow-xl flex flex-col p-4 border-4 border-green-100">
        <h2 className="text-xl md:text-2xl font-bold text-slate-800 mb-4 text-center flex items-center justify-center gap-2">
          ✨ IB 핵심 지식 퀴즈 ✨
        </h2>
        
        <div className="flex-grow flex flex-col justify-center">
          <p className="text-slate-500 mb-2 text-xs md:text-sm text-center uppercase tracking-widest font-black">IB KNOWLEDGE QUEST</p>
          
          <div className="bg-green-50 rounded-2xl p-4 md:p-6 my-2 md:my-4 min-h-[6rem] md:min-h-[10rem] flex items-center justify-center border-2 border-green-100 shadow-inner">
            <p className="text-slate-800 text-lg md:text-2xl font-bold text-center leading-tight">
              {currentQuiz ? currentQuiz.question : '준비됐나요?'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {currentQuiz && currentQuiz.options.map((opt: string, idx: number) => (
              <motion.button
                key={idx}
                whileHover={quizAnswerable ? { scale: 1.05 } : {}}
                whileTap={quizAnswerable ? { scale: 0.95 } : {}}
                onClick={() => checkAnswer(idx)}
                disabled={!quizAnswerable && !showAnswer}
                className={cn(
                  "w-full py-3 px-4 rounded-xl font-bold text-sm md:text-lg transition-all shadow-md",
                  showAnswer && idx === currentQuiz.correctAnswer 
                    ? "bg-emerald-500 text-white animate-pulse border-4 border-white" 
                    : (!quizAnswerable ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-sky-400 hover:bg-sky-500 text-white")
                )}
              >
                {opt}
              </motion.button>
            ))}
            {!currentQuiz && (
              <Button 
                onClick={async () => {
                  await Tone.start();
                  showQuiz();
                }}
                className="col-span-2 w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl text-xl shadow-lg"
              >
                퀴즈 시작!
              </Button>
            )}
          </div>

          <p className={cn("mt-4 font-bold h-6 text-center text-lg", quizFeedback?.color)}>
            {quizFeedback?.text}
          </p>

          {showAnswer && (
            <Button 
              onClick={spawnAndActivateFruit}
              className="mt-4 w-full bg-amber-500 hover:bg-amber-600 text-white py-3 rounded-xl font-black shadow-lg"
            >
              알겠어요! 계속하기
            </Button>
          )}
        </div>
      </div>

      {/* Game Panel */}
      <div className="w-full md:w-2/3 h-1/2 md:h-full bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col border-4 border-green-100">
        <header className="p-3 md:p-4 bg-green-500 text-white text-center flex-shrink-0">
          <h1 className="text-xl md:text-3xl font-bold">IB 지식 머지</h1>
          <div className="flex justify-between items-center mt-1 text-xs md:text-lg font-black uppercase tracking-tighter">
            <div>최고점수: {highScore}</div>
            <div>현재점수: {score}</div>
          </div>
        </header>

        <div className="bg-yellow-50 p-2 flex items-center justify-center gap-4 flex-shrink-0 border-b border-yellow-100">
          <span className="text-slate-600 font-bold">다음 과일:</span>
          <div className="w-10 h-10 md:w-14 md:h-14 flex items-center justify-center bg-white rounded-2xl shadow-inner border-2 border-yellow-100 text-2xl md:text-4xl">
            {fruits[nextFruitLevel].emoji}
          </div>
        </div>

        <div 
          ref={gameContainerRef}
          className="relative flex-grow min-h-0 cursor-crosshair bg-gradient-to-b from-yellow-50/30 to-white"
          onMouseDown={dropFruit}
          onTouchEnd={dropFruit}
          onMouseMove={handleMouseMove}
          onTouchMove={handleMouseMove}
        >
          <canvas className="w-full h-full" />
          
          <AnimatePresence>
            {gameState !== 'AIMING' && gameState !== 'DROPPING' && (
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 flex items-center justify-center z-30 bg-black/40 backdrop-blur-[2px]"
              >
                <div className="text-center p-6 rounded-2xl bg-white/10 backdrop-blur-md border border-white/20">
                  <p className="text-white text-xl md:text-3xl font-bold drop-shadow-lg">
                    {gameState === 'IDLE' ? '퀴즈 시작 버튼을 눌러주세요!' : 
                     gameState === 'QUIZ' ? '왼쪽 퀴즈를 먼저 풀어주세요!' : ''}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Modals */}
      <AnimatePresence>
        {isGameOver && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/80 flex flex-col items-center justify-center text-center p-8 z-50 backdrop-blur-md"
          >
            <Trophy className="w-24 h-24 text-yellow-400 mb-6 animate-bounce" />
            <h2 className="text-5xl font-bold text-white mb-2">게임 종료!</h2>
            <p className="text-2xl text-white/60 mb-2">최종 점수</p>
            <p className="text-7xl font-black text-yellow-400 mb-10">{score}</p>
            <Button 
              onClick={init} 
              className="bg-yellow-400 hover:bg-yellow-500 text-slate-900 font-black py-4 px-12 rounded-full text-2xl shadow-2xl transform hover:scale-110 transition-all"
            >
              다시 하기
            </Button>
          </motion.div>
        )}

        {discoveryFruit !== null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-yellow-100 to-orange-200 rounded-[3rem] p-8 text-center shadow-2xl max-w-sm w-full border-8 border-white"
            >
              <h2 className="text-2xl font-black text-orange-800 mb-2 uppercase tracking-widest">✨ 새로운 과일! ✨</h2>
              <div className="text-8xl my-6 animate-bounce drop-shadow-xl">{fruits[discoveryFruit].emoji}</div>
              <h3 className="text-4xl font-black text-slate-800 mb-2">{fruits[discoveryFruit].name}</h3>
              <p className="text-slate-600 mb-8 font-bold">{fruits[discoveryFruit].description}</p>
              <Button 
                onClick={() => {
                  setDiscoveryFruit(null);
                  if (showGameComplete) {
                    // Stay in popup state for complete
                  } else {
                    setGameState('QUIZ');
                    if (runnerRef.current && engineRef.current) Matter.Runner.run(runnerRef.current, engineRef.current);
                  }
                }} 
                className="bg-orange-500 hover:bg-orange-600 text-white font-black py-4 px-10 rounded-full text-xl shadow-xl"
              >
                계속하기
              </Button>
            </motion.div>
          </motion.div>
        )}

        {showGameComplete && discoveryFruit === null && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-[100] backdrop-blur-sm"
          >
            <motion.div 
              initial={{ scale: 0.5, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              className="bg-gradient-to-br from-lime-200 to-green-300 rounded-[3rem] p-8 text-center shadow-2xl max-w-sm w-full border-8 border-white"
            >
              <h2 className="text-3xl font-black text-white mb-2 drop-shadow-md">🎉 과일 도감 완성! 🎉</h2>
              <div className="text-8xl my-6 animate-bounce drop-shadow-xl">🧺</div>
              <h3 className="text-3xl font-black text-white mb-2">모든 과일을 모았어요!</h3>
              <p className="text-white/90 mb-8 font-bold">당신은 최고의 과일 농부입니다!</p>
              <Button 
                onClick={() => {
                  setShowGameComplete(false);
                  setGameState('QUIZ');
                  if (runnerRef.current && engineRef.current) Matter.Runner.run(runnerRef.current, engineRef.current);
                }} 
                className="bg-green-500 hover:bg-green-600 text-white font-black py-4 px-10 rounded-full text-xl shadow-xl"
              >
                계속 도전하기
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
