import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Trophy, Trees, Flame, Calendar, ChevronRight, Medal } from 'lucide-react';
import { Button } from './Button';

export const AnnouncementPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [dontShowForWeek, setDontShowForWeek] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem('announcement_july_reset_last_closed');
    const dontShowUntil = localStorage.getItem('announcement_july_reset_dont_show_until');
    const now = Date.now();
    const today = new Date().toDateString();
    
    if (dontShowUntil && parseInt(dontShowUntil) > now) {
      setIsOpen(false);
      return;
    }

    if (lastClosed !== today) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowForWeek) {
      const nextWeek = Date.now() + 7 * 24 * 60 * 60 * 1000;
      localStorage.setItem('announcement_july_reset_dont_show_until', nextWeek.toString());
    } else if (dontShowToday) {
      const today = new Date().toDateString();
      localStorage.setItem('announcement_july_reset_last_closed', today);
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-amber-100"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10 cursor-pointer"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-6 text-center">
              {/* Hero Icon Badges */}
              <div className="mb-4 flex justify-center gap-3 relative">
                <div className="p-3.5 bg-amber-50 rounded-2xl border border-amber-100 text-amber-600 shadow-md relative">
                  <Trophy className="w-7 h-7 animate-bounce" />
                </div>
                <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-100 text-emerald-600 shadow-md relative">
                  <Trees className="w-7 h-7 animate-pulse" />
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-3 tracking-tight leading-tight">
                🏆 6월 명예의 전당 &<br />7월 새출발 안내
              </h3>
              
              <div className="space-y-3 text-gray-600 font-medium leading-relaxed max-h-[52vh] overflow-y-auto px-1 custom-scrollbar">
                
                {/* 1. 개인 랭킹 TOP 3 */}
                <div className="bg-amber-50/70 p-3 rounded-2xl border border-amber-100/60 text-left">
                  <h4 className="text-[11px] font-black text-amber-800 mb-1.5 flex items-center gap-1">
                    👑 6월 개인 랭킹 TOP 3
                  </h4>
                  <div className="space-y-1 text-xs text-gray-700 font-bold">
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥇 <span className="text-amber-700 font-extrabold">1위</span> 권지훈 (4-5)</span>
                      <span className="text-amber-600">29,296 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥈 <span className="text-gray-600 font-extrabold">2위</span> 금다온 (3-3)</span>
                      <span className="text-gray-500">21,399 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥉 <span className="text-amber-800 font-extrabold">3위</span> 이서린 (3-3)</span>
                      <span className="text-amber-700">20,700 XP</span>
                    </div>
                  </div>
                </div>

                {/* 2. 학급 랭킹 TOP 3 */}
                <div className="bg-indigo-50/70 p-3 rounded-2xl border border-indigo-100/60 text-left">
                  <h4 className="text-[11px] font-black text-indigo-800 mb-1.5 flex items-center gap-1">
                    🏫 6월 학급 랭킹 TOP 3
                  </h4>
                  <div className="space-y-1 text-xs text-gray-700 font-bold">
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥇 <span className="text-indigo-700 font-extrabold">1위</span> 3학년 3반</span>
                      <span className="text-indigo-600">142,997 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥈 <span className="text-indigo-600 font-extrabold">2위</span> 4학년 5반</span>
                      <span className="text-indigo-500">119,075 XP</span>
                    </div>
                    <div className="flex justify-between items-center bg-white/65 px-2 py-1 rounded-lg">
                      <span className="flex items-center gap-1">🥉 <span className="text-indigo-800 font-extrabold">3위</span> 4학년 1반</span>
                      <span className="text-indigo-600">100,832 XP</span>
                    </div>
                  </div>
                </div>

                {/* 3. 7월 랭킹 초기화 안내 */}
                <div className="bg-rose-50/70 p-3 rounded-2xl border border-rose-100/60 text-left">
                  <div className="flex items-start gap-2">
                    <Calendar className="w-4 h-4 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-black text-rose-800 mb-0.5">🗓️ 7월 새 랭킹 시작! (초기화 완료)</h4>
                      <p className="text-[10px] text-rose-950 font-bold leading-normal">
                        6월 랭킹 레이스가 성황리에 마감되었으며, <span className="text-red-600">7월 1일부터 새로운 랭킹 경쟁이 시작</span>되었습니다!
                      </p>
                      <p className="text-[9px] text-rose-700 font-semibold mt-0.5">
                        모두 동등하게 0 XP부터 새 출발합니다! 7월 명예의 주인공에 도전하세요! 🚀
                      </p>
                    </div>
                  </div>
                </div>

                {/* 4. '개념의 숲' 코너 오픈 */}
                <div className="bg-emerald-50/70 p-3 rounded-2xl border border-emerald-100/60 text-left">
                  <div className="flex items-start gap-2">
                    <Trees className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-[11px] font-black text-emerald-800 mb-0.5">🌳 '개념의 숲' 코너 전격 오픈!</h4>
                      <p className="text-[10px] text-emerald-950 font-bold leading-normal">
                        입체적인 3D 스타일의 숲속에서 7가지 IB 핵심 개념을 깊게 탐구하는 <span className="text-emerald-700">‘개념의 숲’</span>이 열려있습니다!
                      </p>
                      <p className="text-[9px] text-emerald-700 font-semibold mt-0.5">
                        재미있는 개념 퀴즈를 맞추며 나무를 키우고 보너스 XP도 대량 획득하세요! 개념탐구 열심히 해봅시다! 🌱
                      </p>
                    </div>
                  </div>
                </div>

              </div>

              <div className="mt-4 flex flex-col gap-3">
                <Button 
                  onClick={handleClose}
                  className="w-full py-3 bg-gradient-to-r from-amber-500 to-emerald-600 hover:from-amber-600 hover:to-emerald-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-amber-100 cursor-pointer flex items-center justify-center gap-1 border-none"
                >
                  새로운 모험 출발하기! <ChevronRight className="w-4 h-4" />
                </Button>
                
                <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={dontShowToday}
                      onChange={(e) => {
                        setDontShowToday(e.target.checked);
                        if (e.target.checked) setDontShowForWeek(false);
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                      오늘 하루 보지 않기
                    </span>
                  </label>
                  <label className="flex items-center gap-1.5 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={dontShowForWeek}
                      onChange={(e) => {
                        setDontShowForWeek(e.target.checked);
                        if (e.target.checked) setDontShowToday(false);
                      }}
                      className="w-3.5 h-3.5 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500 cursor-pointer"
                    />
                    <span className="text-[10px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                      일주일 동안 보지 않기
                    </span>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
