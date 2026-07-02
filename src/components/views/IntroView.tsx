import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Compass, HelpCircle, Lightbulb, RefreshCw, Layers, Link, Eye, ShieldAlert } from 'lucide-react';
import { Button } from '../ui/Button';
import Prism from './Prism';
import GhostCursor from './GhostCursor';

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

  return (
    <div
      ref={containerRef}
      className="min-h-screen w-full bg-slate-950 text-white overflow-y-auto overflow-x-hidden relative flex flex-col items-center justify-between p-4 py-8 md:py-12 select-none"
    >
      {/* Cinematic Ambient Interactive Trail */}
      <GhostCursor
        color="#818cf8"
        brightness={1.1}
        edgeIntensity={0.15}
        trailLength={40}
        inertia={0.55}
        grainIntensity={0.03}
        bloomStrength={0.2}
        bloomRadius={1.2}
        bloomThreshold={0.01}
        zIndex={5}
      />

      {/* Immersive Glowing Orbs in Background */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-indigo-600/5 rounded-full blur-[140px] animate-pulse" />
        <div className="absolute bottom-1/3 right-1/4 w-[28rem] h-[28rem] bg-purple-600/5 rounded-full blur-[160px] animate-pulse delay-700" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[36rem] h-[36rem] bg-blue-600/5 rounded-full blur-[180px]" />
      </div>

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff02_1px,transparent_1px),linear-gradient(to_bottom,#ffffff02_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none" />

      {/* Header Branding */}
      <div className="relative z-30 w-full max-w-7xl px-4 flex justify-between items-center opacity-70 mb-4">
        <span className="text-[10px] font-mono tracking-[0.25em] text-indigo-400 uppercase font-bold">
          ★ JP-IB SPACE EXPEDITION
        </span>
        <span className="text-[10px] font-mono tracking-[0.15em] text-slate-500 font-semibold">
          SYS_STATUS: READY
        </span>
      </div>

      {/* Center Welcome Hub */}
      <div className="relative z-30 flex flex-col items-center justify-center max-w-4xl text-center px-4 w-full my-auto space-y-6 sm:space-y-8">
        
        {/* Prism Neon Refraction Core */}
        <div style={{ width: '100%', height: '380px', position: 'relative' }} className="flex items-center justify-center max-w-lg mx-auto pointer-events-none select-none">
          <div className="absolute inset-0 pointer-events-auto rounded-3xl overflow-hidden border border-white/[0.03] bg-slate-950/20 backdrop-blur-[2px]">
            <Prism
              animationType="rotate"
              timeScale={0.4}
              height={3.4}
              baseWidth={5.4}
              scale={3.2}
              hueShift={0}
              colorFrequency={1}
              noise={0}
              glow={1}
            />
          </div>

          {/* Central Logo Orb superimposed in front of the Prism center */}
          <motion.div 
            onClick={onEnter}
            whileHover={{ scale: 1.08, boxShadow: "0 0 65px rgba(99,102,241,0.6)" }}
            whileTap={{ scale: 0.96 }}
            className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-indigo-600/60 via-purple-600/55 to-blue-600/60 border border-white/40 shadow-[0_0_50px_rgba(99,102,241,0.35)] flex items-center justify-center p-1.5 backdrop-blur-md z-30 pointer-events-auto cursor-pointer transition-shadow"
          >
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
              <span className="text-2xl sm:text-3xl animate-bounce">🚀</span>
              <span className="text-[9px] sm:text-[10px] font-black tracking-widest text-indigo-300 uppercase mt-1">IB TOUR</span>
            </div>
          </motion.div>
        </div>

        {/* Text Title with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="space-y-3 sm:space-y-4"
        >
          <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] sm:text-xs font-extrabold text-indigo-300 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>생각을 키우는 IB 탐험 스페이스</span>
          </div>
          
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300 pb-1">
            증평 IB 탐험대
          </h1>
          
          <p className="text-slate-400 font-medium text-xs sm:text-sm max-w-lg mx-auto leading-relaxed">
            핵심 개념들과 함께하는 흥미로운 가상 탐험 공간입니다. <br className="hidden sm:block" />
            재미있는 게임과 인터랙티브 퀴즈를 통해 나만의 탐구력을 높여보세요!
          </p>
        </motion.div>

        {/* Enter CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.5 }}
          className="relative z-40"
        >
          <Button
            onClick={onEnter}
            className="px-8 py-5 text-base sm:text-lg font-black rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_25px_rgba(99,102,241,0.3)] hover:shadow-[0_0_50px_rgba(99,102,241,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] border border-indigo-400/20 flex items-center gap-2.5 group cursor-pointer mx-auto"
          >
            <span>탐험 시작하기</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1.5 transition-transform" />
          </Button>
        </motion.div>
      </div>

      {/* Symmetrical Bento Grid for 8 IB Concepts (At the very bottom, clean and organized) */}
      <div className="relative z-30 w-full max-w-7xl px-4 mt-12 md:mt-16">
        <div className="text-center mb-4 opacity-60">
          <span className="text-[10px] font-mono tracking-[0.2em] text-slate-400 uppercase font-bold">
            탐험할 8대 IB 핵심 개념 (Core Concepts)
          </span>
        </div>
        
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {CONCEPTS.map((concept, idx) => (
            <motion.div
              key={concept.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 + idx * 0.04, duration: 0.4 }}
              whileHover={{ 
                y: -4, 
                backgroundColor: "rgba(255, 255, 255, 0.06)",
                borderColor: "rgba(255, 255, 255, 0.18)",
                boxShadow: "0 10px 25px -5px rgba(99, 102, 241, 0.1)"
              }}
              className="p-3 rounded-xl bg-white/[0.02] border border-white/[0.06] backdrop-blur-sm flex flex-col items-center text-center transition-all duration-300 group cursor-default"
            >
              <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${concept.color} flex items-center justify-center text-lg shadow-md shadow-black/20 mb-2 group-hover:scale-110 transition-transform duration-300`}>
                {concept.emoji}
              </div>
              <h3 className="text-[11px] sm:text-xs font-black text-white group-hover:text-indigo-200 transition-colors">
                {concept.name.split(' ')[0]}
              </h3>
              <p className="text-[9px] text-slate-500 font-semibold mt-0.5 truncate w-full">
                {concept.name.split(' ')[1] || ''}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};
