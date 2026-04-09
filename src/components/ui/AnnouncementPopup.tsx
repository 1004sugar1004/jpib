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
            className="relative w-full max-w-md bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-indigo-100"
          >
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-10"
            >
              <X className="w-6 h-6 text-gray-400" />
            </button>

            <div className="p-8 text-center">
              <div className="mb-6 relative">
                <div className="absolute inset-0 bg-indigo-100 rounded-3xl rotate-3 scale-105" />
                <img 
                  src="https://i.imgur.com/BNpz6dS.png" 
                  alt="Coffee" 
                  className="relative w-full h-48 object-contain rounded-2xl"
                  referrerPolicy="no-referrer"
                />
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-4 tracking-tight">
                🚀 IB Explorer 정식 오픈!
              </h3>
              
              <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                <p className="text-sm">
                  IB Explorer가 드디어 <span className="text-indigo-600 font-bold">정식 오픈</span>했습니다!<br />
                  오픈 기념으로 <span className="font-bold">4월 8일 랭킹이 초기화</span>되었습니다.
                </p>
                <div className="bg-indigo-50 p-4 rounded-2xl border border-indigo-100 space-y-2 text-xs">
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span><span className="font-black">4월 30일:</span> 이달의 우수 탐험가 시상</span>
                  </p>
                  <p className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-indigo-600 rounded-full" />
                    <span><span className="font-black">5월부터:</span> 매달 1일 랭킹 자동 초기화</span>
                  </p>
                  <p className="flex items-center gap-2 text-rose-600 font-black">
                    <span className="w-1.5 h-1.5 bg-rose-600 rounded-full" />
                    <span>🎁 우수학생 & 우수학급 과자박스 배달!</span>
                  </p>
                </div>
                <p className="text-[11px] text-gray-400">
                  새로운 마음으로 다시 한번 정상을 향해 도전해보세요!
                </p>

                <div className="pt-2 border-t border-gray-100">
                  <p className="text-xs font-bold text-gray-700 mb-1">💡 의견을 들려주세요!</p>
                  <p className="text-[10px] text-gray-500 leading-tight">
                    좋은 의견을 주신 <span className="text-indigo-600 font-bold">선생님께는 기프티콘</span>을,<br />
                    <span className="text-rose-600 font-bold">학생들에게는 추첨을 통해 과자</span>를 드립니다!
                  </p>
                </div>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <Button 
                  onClick={handleClose}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200"
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
