import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X } from 'lucide-react';
import { Button } from './Button';

export const AnnouncementPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem('announcement_last_closed');
    const today = new Date().toDateString();
    
    if (lastClosed !== today) {
      setIsOpen(true);
    }
  }, []);

  const handleClose = () => {
    if (dontShowToday) {
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
                ☕ 카페라떼 기프티콘 이벤트!
              </h3>
              
              <div className="space-y-4 text-gray-600 font-medium leading-relaxed">
                <p>
                  사이트 개선과 게임에 대한 업그레이드 방향 등<br />
                  <span className="text-indigo-600 font-bold">좋은 의견을 주신 선생님들께</span><br />
                  카페라떼 기프티콘을 드려요!
                </p>
                <p className="text-sm bg-indigo-50 py-2 rounded-xl border border-indigo-100">
                  의견 제출은 <span className="font-bold text-indigo-700">홈페이지 하단</span>에서 하실 수 있습니다.
                </p>
              </div>

              <div className="mt-8 flex flex-col gap-4">
                <Button 
                  onClick={handleClose}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200"
                >
                  확인했습니다
                </Button>
                
                <label className="flex items-center justify-center gap-2 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={dontShowToday}
                    onChange={(e) => setDontShowToday(e.target.checked)}
                    className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-sm text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                    오늘 하루 보지 않기
                  </span>
                </label>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
