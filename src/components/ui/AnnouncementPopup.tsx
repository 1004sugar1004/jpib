import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const AnnouncementPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [dontShowForWeek, setDontShowForWeek] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem('announcement_last_closed');
    const dontShowUntil = localStorage.getItem('announcement_dont_show_until');
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
      localStorage.setItem('announcement_dont_show_until', nextWeek.toString());
    } else if (dontShowToday) {
      const today = new Date().toDateString();
      localStorage.setItem('announcement_last_closed', today);
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-sm bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-indigo-100"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-5 h-5 text-gray-400" />
            </button>

            <div className="p-6 text-center">
              <div className="mb-4 relative mx-auto w-32">
                <div className="absolute inset-0 bg-indigo-100 rounded-2xl rotate-3 scale-105" />
                <img 
                  src="https://i.imgur.com/BNpz6dS.png" 
                  alt="Coffee" 
                  className="relative w-32 h-24 object-contain rounded-xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h3 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
                🎉 4월 시상식 & 5월 공지
              </h3>
              
              <div className="space-y-2 text-gray-600 font-medium leading-relaxed max-h-[65vh] overflow-y-auto px-1 custom-scrollbar">
                {/* 1. 우수학생/학급 (GRID) */}
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-amber-50 p-3 rounded-2xl border border-amber-100">
                    <h4 className="text-[10px] font-black text-amber-700 mb-1.5 flex items-center gap-1">🏆 4월 우수 학생</h4>
                    <div className="space-y-0.5 text-[11px] text-gray-700 font-bold">
                      <p className="flex justify-between"><span>🥇 1위</span> <span>최진호(4-1)</span></p>
                      <p className="flex justify-between"><span>🥈 2위</span> <span>김태린(4-1)</span></p>
                      <p className="flex justify-between"><span>🥉 3위</span> <span>윤태서(4-1)</span></p>
                    </div>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-2xl border border-blue-100">
                    <h4 className="text-[10px] font-black text-blue-700 mb-1.5 flex items-center gap-1">🏫 4월 우수 학급</h4>
                    <div className="text-[10px] text-gray-700 font-bold leading-tight">
                      <p>4-1, 5-5, 3-5</p>
                      <p className="text-[8px] text-blue-500 font-medium mt-1 leading-tight">우수학생과 우수학급에게는 과자박스 선물이 있습니다</p>
                    </div>
                  </div>
                </div>

                {/* 2. 랭킹 리셋 & 경험치 상향 */}
                <div className="bg-indigo-50 p-3 rounded-2xl border border-indigo-100 text-left">
                  <div className="flex flex-col gap-1 text-[10px] text-gray-700">
                    <p className="flex gap-1.5">
                      <span className="text-indigo-500">🗓️</span>
                      <span><span className="font-black text-indigo-600">5월 랭킹 시작:</span> 4월 랭킹은 마감 및 초기화되었습니다.</span>
                    </p>
                    <p className="flex gap-1.5">
                      <span className="text-emerald-500">⚡</span>
                      <span><span className="font-black text-emerald-600">XP 상향:</span> 일일 최대 경험치가 <span className="font-black">1,000 XP</span>로 늘어났습니다!</span>
                    </p>
                    <p className="flex gap-1.5">
                      <span className="text-amber-500">✨</span>
                      <span><span className="font-black text-amber-600">업데이트:</span> 5월 중 퀴즈와 게임 속 퀴즈가 업데이트 될 예정입니다!</span>
                    </p>
                  </div>
                </div>

                {/* 3. 당첨자 & 이벤트 안내 */}
                <div className="bg-rose-50 p-3 rounded-2xl border border-rose-100 text-center">
                  <h4 className="text-[10px] font-black text-rose-700 mb-1">🎁 후기 이벤트 당첨: 한음 (4-1) ✨</h4>
                  <p className="text-[9px] text-gray-500 leading-tight">
                    선생님들을 위한 <span className="text-indigo-600 font-bold">커피쿠폰 이벤트</span>는 계속됩니다! ☕
                  </p>
                </div>
              </div>

              <div className="mt-6 flex flex-col gap-3">
                <Button 
                  onClick={handleClose}
                  className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-base shadow-lg shadow-indigo-200"
                >
                  확인했습니다
                </Button>
                
                <div className="flex items-center justify-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={dontShowToday}
                      onChange={(e) => {
                        setDontShowToday(e.target.checked);
                        if (e.target.checked) setDontShowForWeek(false);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                      오늘 하루 보지 않기
                    </span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={dontShowForWeek}
                      onChange={(e) => {
                        setDontShowForWeek(e.target.checked);
                        if (e.target.checked) setDontShowToday(false);
                      }}
                      className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
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
