import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Gift, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from './Button';

export const EventPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [dontShowToday, setDontShowToday] = useState(false);
  const [dontShowForWeek, setDontShowForWeek] = useState(false);

  useEffect(() => {
    const lastClosed = localStorage.getItem('event_gift_last_closed');
    const dontShowUntil = localStorage.getItem('event_gift_dont_show_until');
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
      localStorage.setItem('event_gift_dont_show_until', nextWeek.toString());
    } else if (dontShowToday) {
      const today = new Date().toDateString();
      localStorage.setItem('event_gift_last_closed', today);
    }
    setIsOpen(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-md bg-gradient-to-b from-amber-50 to-white rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-amber-200"
          >
            {/* Top Close Button */}
            <button 
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-amber-100 rounded-full transition-colors z-10"
              id="close-event-popup-top-btn"
            >
              <X className="w-5 h-5 text-amber-800" />
            </button>

            <div className="p-6 md:p-8 text-center">
              {/* Header Visual Decoration */}
              <div className="mb-4 relative mx-auto w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center shadow-inner">
                <Gift className="w-10 h-10 text-amber-500 animate-bounce" />
                <Sparkles className="absolute -top-1 -right-1 w-5 h-5 text-yellow-500 animate-pulse" />
              </div>

              <h3 className="text-xl md:text-2xl font-black text-amber-900 mb-1 leading-snug tracking-tight">
                🎉 IB 탐험대 깜짝 이벤트!
              </h3>
              <p className="text-sm font-extrabold text-amber-700 mb-4">
                과자 선물 주인공을 발표합니다! 🎁✨
              </p>

              {/* Main Content Card Scroll Container */}
              <div className="bg-white/95 rounded-2xl border border-amber-200/50 p-4 text-left text-xs text-gray-700 space-y-3.5 max-h-[48vh] overflow-y-auto custom-scrollbar shadow-inner mb-6">
                
                <p className="font-bold text-slate-800 leading-relaxed text-center bg-amber-50/70 p-2.5 rounded-xl border border-amber-200/50 text-[11px]">
                  소중한 의견과 따뜻한 응원을 남겨준 친구들에게 맛있는 과자 선물을 드립니다! 🎁
                </p>

                <h4 className="font-extrabold text-amber-900 flex items-center gap-1.5 text-xs border-b border-amber-100 pb-1 mt-3">
                  🍿 선물 받을 친구들과 한마디
                </h4>

                <div className="space-y-2.5">
                  <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                    <p className="font-black text-amber-950 text-xs">주하성(5-2)</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "지식탐험 일퀘기록 버그 있어요!" <span className="text-[9px] text-[#ca8a04] font-bold bg-[#ca8a04]/10 px-1 py-0.5 rounded ml-1 font-sans not-italic">(오류 제보)</span>
                    </p>
                  </div>

                  <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                    <p className="font-black text-amber-950 text-xs">이준서(4-1)</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "플래시카드 1번 건너뛰기 버그 제보해요!" <span className="text-[9px] text-[#ca8a04] font-bold bg-[#ca8a04]/10 px-1 py-0.5 rounded ml-1 font-sans not-italic">(오류 제보)</span>
                    </p>
                  </div>

                  <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                    <p className="font-black text-amber-950 text-xs">송태인(5-5)</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "10초 드로잉 AI 인식 오류 고쳐주세요! 리듬 노래도 추가해주세요!"
                    </p>
                  </div>

                  <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                    <p className="font-black text-amber-950 text-xs">이태윤(5-5)</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "우노, 할리갈리 같은 IB 보드게임 만들어주세요!"
                    </p>
                  </div>

                  <div className="bg-amber-50/40 p-2.5 rounded-xl border border-amber-200/40">
                    <p className="font-black text-amber-950 text-xs">주현우(4-5)</p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "음악 퀴즈에 우리가 아는 노래가 더 많았으면 좋겠어요!"
                    </p>
                  </div>

                  <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <p className="font-black text-pink-950 text-xs flex items-center gap-1">
                      <span>김한음(4-1)</span>
                      <span className="text-[9px] text-pink-600 font-bold bg-[#fdf2f8]/50 px-1 py-0.5 rounded font-sans leading-none">응원</span>
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "재밌는 IB 탐험대 덕분에 실천을 잘하게 돼요. 항상 존경합니다!"
                    </p>
                  </div>

                  <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <p className="font-black text-pink-950 text-xs flex items-center gap-1">
                      <span>최한결(4-4)</span>
                      <span className="text-[9px] text-pink-600 font-bold bg-[#fdf2f8]/50 px-1 py-0.5 rounded font-sans leading-none">응원</span>
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "너무 재밌어요! 스승의 날 즐겁게 보내세요!"
                    </p>
                  </div>

                  <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <p className="font-black text-pink-950 text-xs flex items-center gap-1">
                      <span>박상민(5-5)</span>
                      <span className="text-[9px] text-pink-600 font-bold bg-[#fdf2f8]/50 px-1 py-0.5 rounded font-sans leading-none">응원</span>
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "너무 재미있고 친구들과 함께 해서 좋아요. 만들어주셔서 감사합니다!"
                    </p>
                  </div>

                  <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <p className="font-black text-pink-950 text-xs flex items-center gap-1">
                      <span>정승훈(3-5)</span>
                      <span className="text-[9px] text-pink-600 font-bold bg-[#fdf2f8]/50 px-1 py-0.5 rounded font-sans leading-none">응원</span>
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "정말 많이 재미있게 플레이했어요!"
                    </p>
                  </div>

                  <div className="bg-pink-50/40 p-2.5 rounded-xl border border-pink-100">
                    <p className="font-black text-pink-950 text-xs flex items-center gap-1">
                      <span>김지윤(4-1)</span>
                      <span className="text-[9px] text-pink-600 font-bold bg-[#fdf2f8]/50 px-1 py-0.5 rounded font-sans leading-none">응원</span>
                    </p>
                    <p className="text-[11px] text-gray-600 mt-0.5 leading-normal italic">
                      "아침마다 하면 기분이 좋아요!"
                    </p>
                  </div>
                </div>

                {/* Guidance / Info Notes */}
                <div className="bg-blue-50/50 p-3.5 rounded-xl border border-blue-100 flex gap-2.5">
                  <AlertCircle className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <h5 className="font-black text-blue-900 text-xs">🔔 안내 사항</h5>
                    <p className="text-[11px] text-blue-800 font-bold leading-normal">
                      • 위 친구들은 교실로 과자를 보낼게요!<br/>
                      • 소중한 의견 고마워요. 버그는 고치고 제안은 꼭 반영할게요! ❤️
                    </p>
                  </div>
                </div>

              </div>

              {/* Action and Dismiss buttons */}
              <div className="flex flex-col gap-3">
                <Button 
                  onClick={handleClose}
                  className="w-full py-3 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-500 hover:to-amber-600 text-slate-900 border-none rounded-2xl font-black text-base shadow-lg shadow-amber-200 active:scale-95 transition-all"
                  id="confirm-event-popup-btn"
                >
                  축하합니다! 🍿
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
                      className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-amber-800 font-bold group-hover:text-amber-900 transition-colors">
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
                      className="w-4 h-4 rounded border-amber-300 text-amber-600 focus:ring-amber-500 cursor-pointer"
                    />
                    <span className="text-[11px] text-amber-800 font-bold group-hover:text-amber-900 transition-colors">
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
