import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, ArrowRight, Compass, HelpCircle, Lightbulb, RefreshCw, Layers, Link, Eye, ShieldAlert, X } from 'lucide-react';
import { Button } from '../ui/Button';
import { Hyperspeed } from '../ui/Hyperspeed';

const hyperspeedOptions = {
  distortion: 'turbulentDistortion',
  length: 400,
  roadWidth: 9,
  islandWidth: 2,
  lanesPerRoad: 3,
  fov: 90,
  fovSpeedUp: 120,
  speedUp: 1.5,
  carLightsFade: 0.5,
  totalSideLightSticks: 15,
  lightPairsPerRoadWay: 30,
  shoulderLinesWidthPercentage: 0.05,
  brokenLinesWidthPercentage: 0.1,
  brokenLinesLengthPercentage: 0.5,
  lightStickWidth: [0.1, 0.4],
  lightStickHeight: [1.2, 1.6],
  movingAwaySpeed: [50, 70],
  movingCloserSpeed: [-100, -140],
  carLightsLength: [12, 80],
  carLightsRadius: [0.05, 0.12],
  carWidthPercentage: [0.3, 0.5],
  carShiftX: [-0.8, 0.8],
  carFloorSeparation: [0, 3],
  colors: {
    roadColor: 0x030206,
    islandColor: 0x05040a,
    background: 0x020205,
    shoulderLines: 0x130e25,
    brokenLines: 0x130e25,
    leftCars: [0x6366f1, 0xa855f7, 0xec4899], // Indigo, Purple, Pink
    rightCars: [0x3b82f6, 0x06b6d4, 0x14b8a6], // Blue, Cyan, Teal
    sticks: 0x6366f1
  }
};

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
  const [showNotice, setShowNotice] = useState(false);

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
      className="min-h-screen w-full bg-slate-950 text-white overflow-y-auto overflow-x-hidden relative flex flex-col items-center p-4 py-8 sm:py-6 select-none"
    >
      {/* Immersive 3D Hyperspeed Background */}
      <div className="absolute inset-0 pointer-events-none z-0 opacity-60">
        <Hyperspeed effectOptions={hyperspeedOptions} />
      </div>

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
        const windowWidth = typeof window !== 'undefined' ? window.innerWidth : 1000;
        const windowHeight = typeof window !== 'undefined' ? window.innerHeight : 800;
        
        const isSmallScreen = windowWidth < 640 || windowHeight < 640;
        const radiusX = isSmallScreen ? 130 : 280;
        const radiusY = isSmallScreen ? 100 : 200;
        const orbitRadius = isSmallScreen ? 80 : 160;

        const angleRad = ((index / CONCEPTS.length) * 2 * Math.PI) + (orbitAngle * Math.PI / 180);

        const targetX = isTracking
          ? mousePos.x + Math.cos(angleRad) * orbitRadius
          : (windowWidth / 2) + Math.cos((index / CONCEPTS.length) * 2 * Math.PI + (orbitAngle * 0.1 * Math.PI / 180)) * radiusX;

        const targetY = isTracking
          ? mousePos.y + Math.sin(angleRad) * orbitRadius
          : (windowHeight / 2) + Math.sin((index / CONCEPTS.length) * 2 * Math.PI + (orbitAngle * 0.1 * Math.PI / 180)) * radiusY;

        const cardWidth = isSmallScreen ? 144 : 192; // 36 or 48 in tailwind
        const cardHeight = isSmallScreen ? 64 : 90;

        return (
          <motion.div
            key={concept.id}
            animate={{
              x: targetX - cardWidth / 2,
              y: targetY - cardHeight / 2,
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
            className="w-36 sm:w-48 p-2 sm:p-3 rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md shadow-2xl flex items-center gap-2 sm:gap-2.5 cursor-grab active:cursor-grabbing hover:bg-white/10 hover:border-white/20 hover:shadow-indigo-500/10 transition-colors z-20"
          >
            <div className={`w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl bg-gradient-to-br ${concept.color} flex items-center justify-center text-sm sm:text-lg shrink-0 shadow-md shadow-black/20`}>
              {concept.emoji}
            </div>
            <div className="min-w-0">
              <h3 className="text-[10px] sm:text-xs font-extrabold text-white truncate">{concept.name}</h3>
              <p className="text-[8px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5">{concept.desc}</p>
            </div>
          </motion.div>
        );
      })}

      {/* Center Welcome Hub */}
      <div className="relative z-30 flex flex-col items-center justify-center max-w-xl text-center px-4 sm:px-6 my-auto">
        
        {/* Double Concentric Spinning Text Path */}
        <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-72 md:h-72 flex items-center justify-center mb-4 sm:mb-6 md:mb-8 pointer-events-none select-none">
          
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
            className="absolute w-36 h-36 sm:w-48 sm:h-48 md:w-56 md:h-56"
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
            onClick={() => setShowNotice(true)}
            whileHover={{ scale: 1.1, boxShadow: "0 0 60px rgba(99,102,241,0.5)" }}
            whileTap={{ scale: 0.95 }}
            className="w-20 h-20 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full bg-gradient-to-tr from-indigo-600/40 via-purple-600/30 to-blue-600/50 border border-white/30 shadow-[0_0_50px_rgba(99,102,241,0.3)] flex items-center justify-center p-1 backdrop-blur-sm z-30 pointer-events-auto cursor-pointer transition-shadow"
          >
            <div className="w-full h-full rounded-full bg-slate-950 flex flex-col items-center justify-center text-center hover:bg-slate-900 transition-colors">
              <span className="text-xl sm:text-2xl md:text-3xl animate-bounce">🚀</span>
              <span className="text-[8px] sm:text-[10px] font-black tracking-widest text-indigo-300 uppercase mt-0.5 sm:mt-1">IB TOUR</span>
            </div>
          </motion.div>
        </div>

        {/* Text Title with Staggered Entrance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6 }}
          className="space-y-2 sm:space-y-3"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-3.5 sm:py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] sm:text-xs font-extrabold text-indigo-300 shadow-sm">
            <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-indigo-400 animate-pulse" />
            <span>생각을 키우는 IB 탐험 스페이스</span>
          </div>
          
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-black tracking-tight leading-none bg-clip-text text-transparent bg-gradient-to-r from-white via-indigo-100 to-indigo-300">
            증평 IB 탐험대
          </h1>
          
          <p className="text-slate-400 font-medium text-xs sm:text-sm md:text-base max-w-md mx-auto leading-relaxed">
            마우스나 손가락을 대면 핵심 개념 카드들이 춤추며 반응해요! <br />
            재미있는 게임과 퀴즈로 가득한 IB 탐구 여행을 시작해보세요.
          </p>
        </motion.div>

        {/* Enter CTA Button */}
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.6 }}
          className="mt-4 sm:mt-6 md:mt-8 relative z-40"
        >
          <Button
            onClick={() => setShowNotice(true)}
            className="px-6 py-4 sm:px-8 sm:py-5 text-sm sm:text-lg font-black rounded-xl sm:rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.25)] hover:shadow-[0_0_40px_rgba(99,102,241,0.45)] transition-all transform hover:scale-[1.03] active:scale-[0.98] border border-indigo-400/20 flex items-center gap-2 group cursor-pointer"
          >
            <span>탐험 시작하기</span>
            <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 group-hover:translate-x-1 transition-transform" />
          </Button>
          
          <span className="text-[8px] sm:text-[10px] text-slate-500 font-extrabold block mt-2 sm:mt-3 uppercase tracking-wider">
            ★ click to enter the quantum knowledge map ★
          </span>
        </motion.div>

      </div>

      {/* Floating Notice Button in Top Right */}
      <div className="absolute top-4 right-4 z-40">
        <button
          onClick={() => setShowNotice(true)}
          className="px-4 py-2.5 rounded-full bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/30 text-xs sm:text-sm font-black text-indigo-300 shadow-lg hover:shadow-indigo-500/20 transition-all flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
        >
          <span className="animate-pulse text-sm">📢</span>
          <span>6월 최종 랭킹 복구 공지</span>
        </button>
      </div>

      {/* GALACTIC NOTICE POPUP MODAL */}
      <AnimatePresence>
        {showNotice && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-slate-900 border-2 border-indigo-500/40 p-6 sm:p-8 rounded-[2.5rem] max-w-xl w-full relative shadow-[0_0_50px_rgba(99,102,241,0.3)] overflow-hidden text-left"
            >
              {/* Star dust effect in modal */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,#ffffff03,transparent)] pointer-events-none" />
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

              {/* Close Button */}
              <button
                onClick={() => setShowNotice(false)}
                className="absolute top-5 right-5 w-10 h-10 rounded-full bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white flex items-center justify-center transition-colors border border-white/10 cursor-pointer z-10"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="flex items-start gap-3.5 mb-6">
                <div className="w-12 h-12 rounded-xl bg-indigo-500/10 border border-indigo-400/30 flex items-center justify-center text-2xl shrink-0">
                  🏆
                </div>
                <div>
                  <span className="text-[10px] font-black tracking-widest text-indigo-400 uppercase">System Notice & Bug Fix</span>
                  <h3 className="text-lg sm:text-xl font-black text-white tracking-tight leading-snug">
                    6월 최종 학급 랭킹 집계 오류 정상 복구 및 패치 안내
                  </h3>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-slate-300 leading-relaxed mb-6 max-h-[50vh] overflow-y-auto pr-2">
                <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-slate-300">
                  <p className="font-bold text-white mb-2 text-sm flex items-center gap-1.5">
                    <span>📢</span>
                    <span>4학년 1반 6월 순위 정상 복구 완료!</span>
                  </p>
                  <p className="mb-2">
                    6월 30일 밤까지 당당히 1위를 달리고 있던 <strong className="text-indigo-300 font-extrabold">4학년 1반</strong>이, 7월 1일 월말 데이터 전환 시스템 오류로 인해 점수 합산에서 누락되며 순위가 일시적으로 어긋났던 문제를 완벽하게 수정하였습니다!
                  </p>
                  <p className="text-xs text-slate-400">
                    7월 첫 로그인 시 이전 달의 데이터가 갱신되는 과정에서 누락을 방지하는 알고리즘을 완벽하게 패치하여, 6월의 진정한 챔피언 자리를 정상 복원하였습니다.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-white/5 border border-white/10">
                  <h4 className="font-extrabold text-white text-xs mb-2.5 flex items-center gap-1.5">
                    <span>🥇</span>
                    <span>2026년 6월 최종 학급 랭킹 (완벽 복원 결과)</span>
                  </h4>
                  <div className="space-y-1.5 font-bold text-slate-300 text-xs">
                    <div className="flex items-center justify-between p-2 rounded bg-indigo-500/20 border border-indigo-500/30 text-indigo-200">
                      <span>👑 1위: 4학년 1반</span>
                      <span>200,988점 (최종 1등 확정!)</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-white/5">
                      <span>🥈 2위: 3학년 3반</span>
                      <span>142,997점</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-800 border border-white/5">
                      <span>🥉 3위: 4학년 5반</span>
                      <span>90,038점</span>
                    </div>
                    <div className="flex items-center justify-between p-2 rounded bg-slate-850/50 text-slate-400 text-[10px] mt-1">
                      <span>• 4위: 4학년 6반 (71,230점)</span>
                      <span>• 5위: 4학년 7반 (63,220점)</span>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-emerald-500/5 border border-emerald-500/15 text-slate-400 text-xs">
                  <p className="font-extrabold text-emerald-400 mb-1">🛠️ 기타 추가 버그 패치 안내</p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] leading-relaxed">
                    <li>김*린 학생의 초성 퀴즈 오작동/멈춤 현상 조치 완료</li>
                    <li>이*민 학생 기획의 편의점 정리 게임 3스테이지 진행 렉 수정</li>
                    <li>전*원 학생의 할리갈리 게임 전반적인 로딩 렉 최적화</li>
                    <li>반*아 학생의 컵할리갈리 게임 정식 탑재 및 출시 완료!</li>
                  </ul>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  onClick={() => {
                    setShowNotice(false);
                    onEnter();
                  }}
                  className="w-full py-4 text-sm sm:text-base font-black rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 flex items-center justify-center gap-2 cursor-pointer border border-indigo-400/20"
                >
                  <span>수정 사항 확인 완료 & 탐험 계속하기 🚀</span>
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

