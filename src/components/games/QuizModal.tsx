import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Sparkles, CheckCircle2, AlertCircle, Coins, Award, HelpCircle, Eye } from 'lucide-react';
import { Landmark } from '../../types';

interface QuizModalProps {
  landmark: Landmark;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (xp: number, coins: number) => void;
  isCompleted: boolean;
  soundEnabled: boolean;
}

// Portable sound player
const playQuizSound = (type: 'success' | 'fail' | 'click', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Triumphant chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'fail') {
      // Sad descending sound
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220.00, ctx.currentTime); // A3
      osc.frequency.linearRampToValueAtTime(110.00, ctx.currentTime + 0.4); // A2
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
      osc.start();
      osc.stop(ctx.currentTime + 0.4);
    } else if (type === 'click') {
      // Short tactile click
      osc.type = 'sine';
      osc.frequency.setValueAtTime(400, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.05);
    }
  } catch (e) {
    console.error('Audio play error:', e);
  }
};

export const QuizModal = ({
  landmark,
  isOpen,
  onClose,
  onSuccess,
  isCompleted,
  soundEnabled
}: QuizModalProps) => {
  const [selectedIdx, setSelectedIdx] = useState<number | null>(null);
  const [wrongAnswers, setWrongAnswers] = useState<number[]>([]);
  const [isSolved, setIsSolved] = useState<boolean>(isCompleted);
  const [showCountryHint, setShowCountryHint] = useState<boolean>(false);

  useEffect(() => {
    setSelectedIdx(null);
    setWrongAnswers([]);
    setIsSolved(isCompleted);
    setShowCountryHint(false);
  }, [landmark.id, isCompleted, isOpen]);

  if (!isOpen) return null;

  const handleChoiceClick = (idx: number) => {
    if (isSolved || wrongAnswers.includes(idx)) return;

    setSelectedIdx(idx);

    if (idx === landmark.answerIdx) {
      // Correct!
      playQuizSound('success', soundEnabled);
      setIsSolved(true);
      
      // Trigger confetti if library exists
      try {
        const confetti = (window as any).confetti;
        if (typeof confetti === 'function') {
          confetti({
            particleCount: 80,
            spread: 60,
            origin: { y: 0.7 }
          });
        }
      } catch (err) {
        console.warn('Confetti fail', err);
      }
    } else {
      // Wrong!
      playQuizSound('fail', soundEnabled);
      setWrongAnswers(prev => [...prev, idx]);
      setSelectedIdx(null);
    }
  };

  const handleConfirmCompletion = () => {
    playQuizSound('click', soundEnabled);
    if (!isCompleted) {
      // Award rewards!
      onSuccess(landmark.xpGained || 50, landmark.coinGained || 10);
    }
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
        {/* Modal Backdrop click */}
        <div className="absolute inset-0" onClick={onClose} />

        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', duration: 0.5 }}
          className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden z-10 flex flex-col max-h-[92vh] text-slate-800 animate-in fade-in zoom-in-95 duration-200"
        >
          {/* Top Banner Theme Accent */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-sky-500 via-indigo-500 to-purple-500" />

          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-3.5 right-3.5 p-2 rounded-full bg-slate-100/80 hover:bg-slate-200 text-slate-600 hover:text-slate-950 transition-all z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Content Wrapper */}
          <div className="overflow-y-auto p-5 md:p-6 flex flex-col gap-4">
            {/* Header badges */}
            <div className="flex flex-wrap items-center gap-1.5 mt-1">
              <span className="text-[10px] font-black bg-indigo-50 text-indigo-700 px-2.5 py-0.5 rounded-full border border-indigo-100">
                {landmark.continent}
              </span>
              {isSolved || showCountryHint ? (
                <span className="text-[10px] font-black bg-sky-50 text-sky-700 px-2.5 py-0.5 rounded-full border border-sky-100 flex items-center gap-1">
                  📍 {landmark.country} · {landmark.city}
                </span>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowCountryHint(true)}
                  className="text-[10px] font-black bg-amber-50 text-amber-700 px-2.5 py-0.5 rounded-full border border-amber-200 hover:bg-amber-100 transition-all cursor-pointer flex items-center gap-1 shadow-sm active:scale-95 group"
                >
                  <HelpCircle className="w-3 h-3 text-amber-500 group-hover:rotate-12 transition-transform" />
                  <span>📍 국가 힌트 보기</span>
                </button>
              )}
              {isSolved && (
                <span className="text-[10px] font-black bg-emerald-500 text-white px-2.5 py-0.5 rounded-full flex items-center gap-0.5 shadow-sm">
                  <CheckCircle2 className="w-3 h-3" /> 탐험 완료!
                </span>
              )}
            </div>

            {/* Landmark Title */}
            <div>
              <h3 className="text-xl md:text-2xl font-black text-slate-950 flex items-center gap-1.5 flex-wrap">
                {isSolved ? (
                  <motion.span 
                    initial={{ opacity: 0, y: -5 }} 
                    animate={{ opacity: 1, y: 0 }}
                    className="text-emerald-600 flex items-center gap-1.5"
                  >
                    🎉 {landmark.name}
                  </motion.span>
                ) : (
                  <span className="text-slate-800 flex items-center gap-1.5">
                    ❓ 어떤 랜드마크일까요?
                  </span>
                )}
                <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">세계 랜드마크</span>
              </h3>
            </div>

            {/* Stacked detail (Image & Question) - Highly Compact */}
            <div className="flex flex-col gap-4">
              {/* Image Container */}
              <div className="relative aspect-[16/8] md:aspect-[16/7] rounded-2xl overflow-hidden border border-slate-100 bg-slate-100 shadow-sm max-h-40">
                <img
                  src={landmark.image}
                  alt={isSolved ? landmark.name : "미스터리 랜드마크"}
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    // Fallback to stylized vector image placeholder if image fails to load
                    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1488646953014-85cb44e25828?auto=format&fit=crop&w=600&q=80';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Quiz Text Area */}
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-1 text-[10px] text-indigo-600 font-bold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5 text-indigo-500" />
                  <span>세계 탐험가 미션 퀴즈</span>
                </div>
                <div className="bg-slate-50/80 border border-slate-100 rounded-xl p-3 md:p-4">
                  <p className="text-sm font-black text-slate-900 leading-relaxed">
                    {landmark.question}
                  </p>
                </div>

                {/* Reward Preview */}
                {!isCompleted && (
                  <div className="flex items-center gap-3 px-2.5 py-1 bg-amber-50 border border-amber-100 rounded-lg w-fit">
                    <span className="text-[10px] text-amber-800 font-bold flex items-center gap-0.5">
                      <Sparkles className="w-3 h-3 text-amber-500 animate-pulse" />
                      +{landmark.xpGained || 50} XP
                    </span>
                    <span className="text-[10px] text-amber-800 font-bold flex items-center gap-0.5">
                      <Coins className="w-3 h-3 text-amber-500" />
                      +{landmark.coinGained || 10} 코인
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* Choices Grid */}
            <div className="flex flex-col gap-2.5">
              <h4 className="text-xs text-slate-400 font-black tracking-wider uppercase">정답을 선택하세요</h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {landmark.choices.map((choice, idx) => {
                  const isWrong = wrongAnswers.includes(idx);
                  const isCurrentCorrect = isSolved && idx === landmark.answerIdx;
                  
                  let btnStyle = 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200 hover:border-slate-300';
                  
                  if (isCurrentCorrect) {
                    btnStyle = 'bg-emerald-500 text-white border-emerald-400 font-black shadow-lg shadow-emerald-500/20';
                  } else if (isWrong) {
                    btnStyle = 'bg-red-50 text-red-400 border-red-200 cursor-not-allowed opacity-60';
                  }

                  return (
                    <button
                      key={idx}
                      disabled={isSolved || isWrong}
                      onClick={() => handleChoiceClick(idx)}
                      className={`w-full text-left p-4 rounded-2xl border text-sm md:text-base font-black transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                    >
                      <span className="flex items-center gap-3">
                        <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black border ${
                          isCurrentCorrect 
                            ? 'bg-white text-emerald-600 border-white' 
                            : isWrong 
                              ? 'bg-red-100 text-red-500 border-red-200' 
                              : 'bg-white text-slate-500 border-slate-200'
                        }`}>
                          {idx + 1}
                        </span>
                        <span>{choice}</span>
                      </span>

                      {/* Status indicator icon */}
                      {isCurrentCorrect && <CheckCircle2 className="w-5 h-5 text-white animate-bounce" />}
                      {isWrong && <AlertCircle className="w-5 h-5 text-red-500" />}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Success Reward Banner / Action */}
            {isSolved && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-2 p-5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200/60 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-500 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-emerald-200 animate-pulse">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-base font-black text-slate-900">축하합니다! 미션을 성공했습니다!</h4>
                    <p className="text-xs font-medium text-slate-500 mt-0.5">
                      {isCompleted 
                        ? '이미 탐험을 마친 곳입니다! 멋진 탐험을 계속하세요.' 
                        : `보상이 지급되었습니다: +${landmark.xpGained || 50} XP / +${landmark.coinGained || 10} 코인`}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleConfirmCompletion}
                  className="w-full md:w-auto px-6 py-3 bg-slate-950 hover:bg-slate-800 text-white font-black text-sm rounded-2xl transition-all shadow-md shadow-slate-950/10 flex items-center justify-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
                  <span>탐험 완료</span>
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
