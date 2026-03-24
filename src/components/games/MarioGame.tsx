import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'motion/react';
import * as Tone from 'tone';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { quizQuestions, QuizQuestion } from '../../content';
import { cn } from '../../lib/utils';
import { Cloud } from 'lucide-react';

export const MarioGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [marioX, setMarioX] = useState(10);
  const [marioY, setMarioY] = useState(0);
  const [velocityY, setVelocityY] = useState(0);
  const [isJumping, setIsJumping] = useState(false);
  const [score, setScore] = useState(0);
  const [life, setLife] = useState(10);
  const [quizCount, setQuizCount] = useState(0);
  const [showQuiz, setShowQuiz] = useState(false);
  const [gates, setGates] = useState<{ id: number, x: number, question: QuizQuestion, options: string[], correctIdx: number, solved: boolean }[]>([]);
  const [isMovingLeft, setIsMovingLeft] = useState(false);
  const [isMovingRight, setIsMovingRight] = useState(false);
  const [gameSpeed, setGameSpeed] = useState(4);
  const requestRef = useRef<number>(null);
  const lastTimeRef = useRef<number>(0);

  const synthRef = useRef<Tone.PolySynth | null>(null);

  useEffect(() => {
    if (soundEnabled) {
      synthRef.current = new Tone.PolySynth(Tone.Synth).toDestination();
    }
    return () => {
      synthRef.current?.dispose();
    };
  }, [soundEnabled]);

  const playSound = (type: 'jump' | 'correct' | 'wrong') => {
    if (!soundEnabled || !synthRef.current) return;
    if (type === 'jump') synthRef.current.triggerAttackRelease("C4", "16n");
    if (type === 'correct') synthRef.current.triggerAttackRelease(["E4", "G4", "C5"], "8n");
    if (type === 'wrong') synthRef.current.triggerAttackRelease("G2", "4n");
  };

  const spawnGate = () => {
    const q = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    const options = [...q.options];
    const correctIdx = q.correctAnswer;
    setGates(prev => [...prev, { 
      id: Date.now(), 
      x: 110, 
      question: q, 
      options, 
      correctIdx,
      solved: false 
    }]);
  };

  const animate = (time: number) => {
    if (lastTimeRef.current !== undefined) {
      const deltaTime = time - lastTimeRef.current;
      if (deltaTime > 16) {
        setMarioY(prevY => {
          let nextY = prevY + velocityY;
          if (nextY <= 0) {
            nextY = 0;
            setVelocityY(0);
            setIsJumping(false);
          } else {
            setVelocityY(v => v - 0.8);
          }
          return nextY;
        });

        setMarioX(prevX => {
          let nextX = prevX;
          if (isMovingLeft) nextX -= 0.8;
          if (isMovingRight) nextX += 0.8;
          return Math.max(5, Math.min(95, nextX));
        });

        setGates(prev => {
          const next = prev.map(g => ({ ...g, x: g.x - (gameSpeed / 10) })).filter(g => g.x > -50);
          
          next.forEach(g => {
            if (!g.solved && Math.abs(g.x - marioX) < 15 && marioY > 80 && marioY < 150 && velocityY > 0) {
              const hitIdx = marioX < g.x ? 0 : 1;
              g.solved = true;
              setVelocityY(-2);
              if (hitIdx === g.correctIdx) {
                setScore(s => s + 100);
                playSound('correct');
              } else {
                setLife(l => Math.max(0, l - 1));
                playSound('wrong');
              }
              setQuizCount(c => c + 1);
              if ((quizCount + 1) % 5 === 0) setShowQuiz(true);
            }
          });

          return next;
        });

        if (Math.random() > 0.99 && gates.length < 2) {
          spawnGate();
        }

        lastTimeRef.current = time;
      }
    }
    requestRef.current = requestAnimationFrame(animate);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, [marioX, marioY, velocityY, isMovingLeft, isMovingRight, gates, quizCount, gameSpeed]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') setIsMovingLeft(true);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') setIsMovingRight(true);
      if ((e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') && !isJumping) {
        setVelocityY(14);
        setIsJumping(true);
        playSound('jump');
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'ArrowLeft' || e.code === 'KeyA') setIsMovingLeft(false);
      if (e.code === 'ArrowRight' || e.code === 'KeyD') setIsMovingRight(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [isJumping]);

  return (
    <div className="w-full h-full bg-[#5c94fc] relative overflow-hidden flex flex-col items-center">
      {showQuiz && <MiniQuiz soundEnabled={soundEnabled} onCorrect={() => { setShowQuiz(false); }} />}
      
      <div className="absolute top-4 left-4 z-20 flex flex-col gap-1">
        <div className="bg-black/50 text-white px-4 py-2 rounded-xl border-2 border-white/20 backdrop-blur-sm">
          <p className="font-black text-xl">점수: {score}</p>
          <p className="text-sm font-bold opacity-80">생명: {life} | 단계: {quizCount}</p>
        </div>
      </div>

      <div className="absolute top-4 right-4 z-20 flex flex-col items-end gap-2">
        <div className="bg-white/20 backdrop-blur-md p-2 rounded-2xl border border-white/30 flex flex-col items-center">
          <label className="text-[10px] font-black text-white uppercase tracking-widest mb-1">Speed</label>
          <input 
            type="range" 
            min="2" 
            max="10" 
            value={gameSpeed} 
            onChange={(e) => setGameSpeed(Number(e.target.value))}
            className="w-24 accent-white"
          />
        </div>
      </div>

      {/* Clouds */}
      <div className="absolute top-20 left-[10%] opacity-50"><Cloud className="w-16 h-10 text-white" /></div>
      <div className="absolute top-32 left-[60%] opacity-30"><Cloud className="w-24 h-14 text-white" /></div>

      {/* Mario */}
      <div 
        className="absolute w-12 h-12 z-10 transition-transform duration-100"
        style={{ 
          left: `${marioX}%`, 
          bottom: `${75 + marioY}px`,
          transform: `translateX(-50%) scaleX(${isMovingLeft ? -1 : 1})`
        }}
      >
        <div className="w-full h-full relative">
          <div className="absolute inset-0 bg-red-600 rounded-lg shadow-[4px_4px_0_rgba(0,0,0,0.2)]" />
          <div className="absolute top-1 left-2 w-8 h-4 bg-[#FFD59F] rounded-sm" />
          <div className="absolute bottom-0 left-1 w-10 h-6 bg-blue-700 rounded-b-lg" />
        </div>
      </div>

      {/* Gates (Bricks) */}
      {gates.map(g => (
        <div 
          key={g.id}
          className="absolute w-48 sm:w-64 h-full z-5"
          style={{ left: `${g.x}%` }}
        >
          <div className="absolute top-16 sm:top-24 left-0 right-0 bg-black/80 text-white p-2 sm:p-3 rounded-xl border-2 border-white text-[10px] sm:text-xs font-bold text-center shadow-xl">
            {g.question.question}
          </div>
          <div className="absolute top-36 sm:top-48 left-0 flex flex-col sm:flex-row gap-2 sm:gap-4">
            {g.options.map((opt, i) => (
              <div 
                key={i}
                className={cn(
                  "w-24 sm:w-28 h-10 sm:h-14 flex items-center justify-center text-white font-black text-[10px] sm:text-sm rounded-xl border-2 sm:border-4 border-black shadow-[2px_2px_0_rgba(0,0,0,0.3)] sm:shadow-[4px_4px_0_rgba(0,0,0,0.3)] transition-transform",
                  g.solved ? (i === g.correctIdx ? "bg-green-500" : "bg-gray-500") : "bg-[#b85c38]"
                )}
              >
                {opt}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Ground */}
      <div className="absolute bottom-0 left-0 right-0 h-[75px] bg-[#c84c0c] border-t-4 border-black">
        <div className="absolute top-0 left-0 right-0 h-4 bg-[#00aa00] border-b-4 border-black" />
      </div>
    </div>
  );
};
