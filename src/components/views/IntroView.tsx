import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Compass, HelpCircle, Lightbulb, RefreshCw, Layers, Link, Eye, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';

interface IntroViewProps {
  onEnter: () => void;
}

const CONCEPTS = [
  { id: 1, name: '형태 (Form)', icon: Layers, desc: '어떤 모습인가요?', color: 'from-pink-400 to-rose-500', emoji: '📐' },
  { id: 2, name: '기능 (Function)', icon: Compass, desc: '어떻게 작동하나요?', color: 'from-amber-400 to-orange-500', emoji: '⚙️' },
  { id: 3, name: '인과 관계 (Causation)', icon: Link, desc: '왜 그런가요?', color: 'from-sky-400 to-blue-500', emoji: '🔗' },
  { id: 4, name: '변화 (Change)', icon: RefreshCw, desc: '어떻게 바뀌나요?', color: 'from-emerald-400 to-green-500', emoji: '🔄' },
  { id: 5, name: '연결 (Connection)', icon: Sparkles, desc: '어떻게 얽혀있나요?', color: 'from-indigo-400 to-purple-500', emoji: '🌐' },
  { id: 6, name: '관점 (Perspective)', icon: Eye, desc: '어떤 다른 생각이 있나요?', color: 'from-purple-400 to-fuchsia-500', emoji: '👁️' },
  { id: 7, name: '책임 (Responsibility)', icon: ShieldAlert, desc: '우리의 할 일은 무엇인가요?', color: 'from-teal-400 to-emerald-500', emoji: '⚖️' },
  { id: 8, name: '성찰 (Reflection)', icon: Lightbulb, desc: '어떻게 깊이 이해했나요?', color: 'from-violet-400 to-indigo-600', emoji: '🪞' },
];

export const IntroView = ({ onEnter }: IntroViewProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [isTracking, setIsTracking] = useState(false);
  const [orbitAngle, setOrbitAngle] = useState(0);

  // Smoothly rotate the cards orbit over time
  useEffect(() => {
    let animationFrameId: number;
    const animate = () => {
      setOrbitAngle((prev) => (prev + 0.5) % 360);
      animationFrameId = requestAnimationFrame(animate);
    };
    animationFrameId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  // Set initial mouse/touch pos to center on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setMousePos({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
    }
  }, []);

  // Mouse Move Event
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    setMousePos({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
    });
    setIsTracking(true);
  };

  // Touch Move Event
  const handleTouchMove = (e: React.TouchEvent) => {
    if (!containerRef.current || e.touches.length === 0) return;
    const rect = containerRef.current.getBoundingClientRect();
    const touch = e.touches[0];
    setMousePos({
      x: touch.clientX - rect.left,
      y: touch.clientY - rect.top,
    });
    setIsTracking(true);
  };

  const handleMouseLeave = () => {
    setIsTracking(false);
  };

  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleMouseLeave}
      className="min-h-screen w-full bg-slate-950 text-white overflow-hidden relative flex flex-col items-center justify-center p-4 select-none"
    >
      {/* Immersive Glowing Orbs in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-purple-600/10 rounded-full blur-[150px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-blue-600/5 rounded-full blur-[180px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff03_1px,transparent_1px),linear-gradient(to_bottom,#ffffff03_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

      {/* Interactive Concept Cards trailing the cursor */}
      {CONCEPTS.map((concept, index) => {
        // Decide placement:
        // If tracking: they orbit the mouse cursor
        // If not tracking: they float in random but stable positions on screen
        const angleRad = ((index / CONCEPTS.length) * 2 * Math.PI) + (orbitAngle * Math.PI / 180);
        const radius = 160; // radius of orbit around mouse

        const targetX = isTracking
          ? mousePos.x + Math.cos(angleRad) * radius
          : (typeof window !== 'undefined' ? window.innerWidth / 2 : 500) + Math.cos((index / CONCEPTS.length) * 2 * Math.PI + (orbitAngle * 0.1 * Math.PI / 180)) * 280;

        const targetY = isTracking
          ? mousePos.y + Math.sin(angleRad) * radius
          : (typeof window !== 'undefined' ? window.innerHeight / 2 : 400) + Math.sin((index / CONCEPTS.length) * 2 * Math.PI + (orbitAngle * 0.1 * Math.PI / 180)) * 200;

        return (
          <motion.div
            key={concept.id}
            animate={{
              x: targetX - 100, // half of width (200px)
              y: targetY - 45,  // half of height (90px)
            }}
            transition={{
              type: "spring",
              stiffness: isTracking ? 80 - index * 5 : 40,
              damping: 15,
              mass: 0.8,
            }}
            style={{
              position: 'absolute',
              left: 0,
              top: 0,
            }}
            className="w-48 p-3 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2.5 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/20 hover:shadow-indigo-500/10 transition-colors z-20"
          >
            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${concept.color} flex items-center justify-center text-lg shrink-0 shadow-md shadow-black/20`}>
              {concept.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-xs font-extrabold text-white truncate">{concept.name}</h3>
              <p className="text-[10px] text-slate-400 font-medium truncate mt-0.5">{concept.desc}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Center Welcome Hub */}
      <div className="relative z-30 flex flex-col items-center justify-center max-w-xl text-center px-6">
        
        {/* Double Concentric Spinning Text Path */}
        <div className="relative w-72 h-72 flex items-center justify-center mb-8 pointer-events-none select-none">
          
          {/* Outer ring: Spinning clockwise */}
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ ease: "linear", duration: 25, repeat: Infinity }}
            className="absolute inset-0"
          >
            <svg viewBox="0 0 300 300" className="w-full h-full">
              <path
                id="outerCirclePath"
                d="M 150, 150 m -115, 0 a 115,115 0 1,1 230,0 a 115,115 0 1,1 -230,0"
                fill="none"
              />
              <text className="fill-indigo-400/80 font-black text-[10.5px] uppercase tracking-[0.25em]">
                <textPath href="#outerCirclePath" startOffset="0%">
                  ★ IB LEARNERS EXPEDITION ★ 증평 IB 탐험대 ★ THINKER ★ INQUIRER ★
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Inner ring: Spinning counter-clockwise */}
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ ease: "linear", duration: 18, repeat: Infinity }}
            className="absolute w-56 h-56"
          >
            <svg viewBox="0 0 240 240" className="w-full h-full">
              <path
                id="innerCirclePath"
                d="M 120, 120 m -85, 0 a 85,85 0 1,1 170,0 a 85,85 0 1,1 -170,0"
                fill="none"
              />
              <text className="fill-purple-400/80 font-black text-[9px] uppercase tracking-[0.2em]">
                <textPath href="#innerCirclePath" startOffset="0%">
                  ● 형태 ● 기능 ● 인과 관계 ● 변화 ● 연결 ● 관점 ● 책임 ● 성찰 ●
                </textPath>
              </text>
            </svg>
          </motion.div>

          {/* Central Logo Orb */}
          <motion.div 
            animate={{ scale: [1, 1.05, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            className="w-32 h-32 rounded-full bg-gradient-to-tr from-indigo-600/30 via-purple-600/20 to-blue-600/40 border border-white/20 shadow-[0_0_50px_rgba(99,102,241,0.25)] flex items-center justify-center p-1 backdrop-blur-sm z-30"
          >
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center">
              <span className="text-3xl">🚀</span>
              <span className="text-[10px] font-black tracking-widest text-indigo-300 uppercase mt-1">IB TOUR</span>
            </div>
          </motion.div>
        </div>

        {/* Text Title with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-xs font-extrabold text-indigo-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>생각을 키우는 IB 탐험 스페이스</span>
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
            증평 IB 탐험대
          </h1>
          
          <p className="text-slate-400 font-medium text-sm md:text-base max-w-md mx-auto leading-relaxed">
            마우스나 손가락을 대면 핵심 개념 카드들이 춤추며 반응해요! <br />
            재미있는 게임과 퀴즈로 가득한 IB 탐구 여행을 시작해보세요.
          </p>
        </motion.div>

        {/* Enter CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-8 relative z-40"
        >
          <Button
            onClick={onEnter}
            className="px-8 py-5 text-lg font-black rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_30px_rgba(99,102,241,0.3)] hover:shadow-[0_0_45px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/20 flex items-center gap-2 group cursor-pointer"
          >
            <span>탐험 시작하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <span className="text-[10px] text-slate-500 font-extrabold block mt-3 uppercase tracking-wider">
            ★ click to enter the quantum knowledge map ★
          </span>
        </motion.div>

      </div>
    </div>
  );
};
