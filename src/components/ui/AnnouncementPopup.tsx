import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Trophy, Trees, Calendar, ChevronRight, Sparkles, Pin, Globe, 
  CheckCircle2, Inbox, AlertCircle, Medal, Tag, Star, ArrowLeft, Heart, Award
} from 'lucide-react';
import { Button } from './Button';

interface Notice {
  id: string;
  title: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
  badge: string;
  badgeColor: string;
  summary: string;
  icon: any;
}

export const AnnouncementPopup = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string>('nickname_regulation');
  const [mobileView, setMobileView] = useState<'list' | 'detail'>('detail');
  const [dontShowToday, setDontShowToday] = useState(false);
  const [dontShowForWeek, setDontShowForWeek] = useState(false);
  
  // Track read history in localStorage
  const [readHistory, setReadHistory] = useState<Record<string, boolean>>({});

  const notices: Notice[] = [
    {
      id: 'nickname_regulation',
      title: '🚨 올바른 닉네임 사용 및 변경 권고 안내 (필독)',
      date: '2026.07.09',
      priority: 'high',
      category: '이용 규정',
      badge: '중요공지',
      badgeColor: 'bg-red-500 text-white border-red-600',
      summary: '자신의 실명이 들어가지 않거나 길고 장난스러운 닉네임은 변경이 필요합니다. 미변경 시 이용 제한 및 시상 제외될 수 있습니다.',
      icon: AlertCircle
    },
    {
      id: 'june_ranking_recovery',
      title: '🏆 6월 최종 개인 및 학급 랭킹 완벽 복구 공지',
      date: '2026.07.08',
      priority: 'high',
      category: '랭킹 복구',
      badge: '긴급복원',
      badgeColor: 'bg-rose-500 text-white border-rose-600',
      summary: '6월 30일 자정 기준 최종 개인 및 학급 순위 산정 오류를 완벽히 해결하고 정상 복구 결과를 안내합니다.',
      icon: Trophy
    },
    {
      id: 'user_feedback_patches',
      title: '📢 소중한 의견 반영 & 주요 버그 수정 패치 내역',
      date: '2026.07.05',
      priority: 'medium',
      category: '패치 정보',
      badge: '기능개선',
      badgeColor: 'bg-indigo-500 text-white border-indigo-600',
      summary: '학생 탐험가분들의 제보에 감사드립니다! 초성퀴즈, 편의점 정리, 할리갈리 게임 렉 등을 완벽하게 수정했습니다.',
      icon: Sparkles
    },
    {
      id: 'july_reset_content',
      title: '🗓️ 7월 새출발 및 신규 탐구 콘텐츠 오픈 안내',
      date: '2026.07.01',
      priority: 'medium',
      category: '업데이트',
      badge: '신규오픈',
      badgeColor: 'bg-emerald-500 text-white border-emerald-600',
      summary: '7월 1일 자로 모든 랭킹이 0 XP로 새출발합니다! 개념의 숲, AI 캐리커쳐, 소통 패들렛 보드가 오픈되었습니다.',
      icon: Calendar
    }
  ];

  // Auto show and read history initialization
  useEffect(() => {
    // 1. Read history initialization
    try {
      const savedHistory = localStorage.getItem('announcement_read_history_v2');
      if (savedHistory) {
        setReadHistory(JSON.parse(savedHistory));
      } else {
        // Mark first one as read by default upon initial popup load
        const initial = { june_ranking_recovery: true };
        localStorage.setItem('announcement_read_history_v2', JSON.stringify(initial));
        setReadHistory(initial);
      }
    } catch (e) {
      console.error(e);
    }

    // 2. Auto-show check
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

  // Listen to window custom event for manual triggers from other views
  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ tab?: string }>;
      if (customEvent.detail && customEvent.detail.tab) {
        const tab = customEvent.detail.tab;
        if (notices.some(n => n.id === tab)) {
          setSelectedId(tab);
          setMobileView('detail');
        } else if (tab === 'history') {
          setMobileView('list');
        }
      }
      setIsOpen(true);
    };

    window.addEventListener('open-announcement', handleOpenEvent);
    return () => {
      window.removeEventListener('open-announcement', handleOpenEvent);
    };
  }, []);

  // Handle reading a notice
  const handleSelectNotice = (id: string) => {
    setSelectedId(id);
    setMobileView('detail');
    
    // Mark as read
    const updated = { ...readHistory, [id]: true };
    setReadHistory(updated);
    try {
      localStorage.setItem('announcement_read_history_v2', JSON.stringify(updated));
    } catch (e) {}
  };

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

  // Helper metrics
  const unreadCount = notices.filter(n => !readHistory[n.id]).length;

  // Render the selected announcement's body content
  const renderContent = () => {
    switch (selectedId) {
      case 'nickname_regulation':
        return (
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-700 animate-fade-in">
            {/* Critical Warning Banner */}
            <div className="p-4 bg-gradient-to-r from-red-50 to-orange-50 rounded-2xl border-2 border-red-200">
              <h4 className="font-extrabold text-red-800 flex items-center gap-1.5 text-xs sm:text-sm mb-1.5">
                ⚠️ 올바른 이름(실명) 사용 및 닉네임 규정 강화 안내
              </h4>
              <p className="text-gray-800 font-bold text-[11px] sm:text-xs">
                최근 일부 학생들이 자신의 실명을 넣지 않거나, 지나치게 길고 장난스러운 닉네임(ID)을 만들어 사용하여 다른 친구들과 선생님들의 이용에 혼란을 주고 있습니다.
              </p>
              <p className="text-red-700 font-extrabold text-[11px] sm:text-xs mt-2 bg-red-100/50 p-2.5 rounded-xl border border-red-200">
                📢 규정 미준수 시 불이익 및 제한 조치 안내:<br />
                1. 서비스 이용 제한: 규정에 어긋나는 닉네임은 사전 예고 없이 서비스 이용이 정지 또는 제한될 수 있습니다.<br />
                2. 포상 및 시상 제외: 매월 지급되는 기프티콘 상품 및 명예의 전당 학기별 최종 시상 대상에서 즉시 제외됩니다.
              </p>
            </div>

            {/* Do's and Don'ts */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Allowed Cases */}
              <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-100">
                <h5 className="font-black text-emerald-950 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                  <span className="text-emerald-600">🟢</span> 올바른 예시 (권장)
                </h5>
                <ul className="space-y-1.5 text-[11px] sm:text-xs text-gray-600 font-semibold">
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-500">✓</span> 자신의 본명(실명)이 명확히 들어간 형태
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-500">✓</span> <code className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">홍길동</code> 또는 <code className="bg-emerald-100 text-emerald-800 px-1 py-0.2 rounded font-mono">홍길동 😊</code> 등 깔끔한 표현
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-emerald-500">✓</span> 본인 확인과 학급 확인이 직관적으로 가능한 형태
                  </li>
                </ul>
              </div>

              {/* Forbidden Cases */}
              <div className="p-4 rounded-2xl bg-rose-50/60 border border-rose-100">
                <h5 className="font-black text-rose-950 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                  <span className="text-rose-600">🔴</span> 잘못된 예시 (금지)
                </h5>
                <ul className="space-y-1.5 text-[11px] sm:text-xs text-gray-600 font-semibold">
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500">✗</span> 실명이 들어가지 않은 닉네임
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500">✗</span> 한 눈에 읽기 어려울 정도로 지나치게 긴 닉네임 (10자 이상)
                  </li>
                  <li className="flex items-start gap-1">
                    <span className="text-rose-500">✗</span> 타인 비방, 비속어, 장난스러운 문장이나 유머용 닉네임
                  </li>
                </ul>
              </div>
            </div>

            {/* List of Detected Playful IDs */}
            <div className="p-4 rounded-2xl bg-amber-50/50 border border-amber-200">
              <h5 className="font-black text-amber-950 text-xs sm:text-sm mb-2 flex items-center gap-1.5">
                🔍 주요 정정 대상 닉네임 유형 (실제 장난스런 생성 사례)
              </h5>
              <p className="text-gray-500 text-[10px] sm:text-[11px] font-medium mb-2.5">
                현재 등록된 계정 중 아래와 같이 본명이 아니거나 과도하게 긴 닉네임들은 <strong className="text-red-600">즉시 정상적인 실명으로 변경</strong>해야 이용 제한 및 시상 제외를 피할 수 있습니다.
              </p>
              
              <div className="space-y-1.5 max-h-[160px] overflow-y-auto pr-1">
                <div className="p-2 rounded-xl bg-white border border-amber-100 text-[10.5px] font-semibold text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 shrink-0">🚨 초장문형:</span>
                  <span>"김페이커 트랄랄레오트랄랄라 봉주루 손흥민 BTS 거북이와 두루미 ... 이종현" (닉네임 길이 초과)</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-100 text-[10.5px] font-semibold text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 shrink-0">🚨 스토리 장난형:</span>
                  <span>"동물원에 간 윤성빈차차와이찬율차차가 원숭이에게 끌려가 우끼끼가 됐다"</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-100 text-[10.5px] font-semibold text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 shrink-0">🚨 비실명 표현:</span>
                  <span>"아이비를 변기에 넣고 내려", "듀오링고한테 고문 당한 ...", "잘생긴 슈퍼 민환이의 아들은 ..."</span>
                </div>
                <div className="p-2 rounded-xl bg-white border border-amber-100 text-[10.5px] font-semibold text-gray-700 flex items-start gap-2">
                  <span className="text-red-500 shrink-0">🚨 투명 문자형:</span>
                  <span>"ㅤㅤ최진호" (이름 앞에 보이지 않는 투명 문자를 넣어 비정상 정렬을 시도하는 경우)</span>
                </div>
              </div>
            </div>

            {/* How to Change */}
            <div className="p-3.5 bg-indigo-50/50 rounded-2xl border border-indigo-100">
              <h5 className="font-black text-indigo-950 text-xs mb-1">🛠️ 닉네임 변경하는 방법:</h5>
              <p className="text-gray-600 text-[11px] font-semibold">
                화면 우측 상단의 <strong className="text-indigo-600">내 프로필(또는 마이페이지)</strong> 또는 <strong className="text-indigo-600">설정</strong> 메뉴로 이동하여 실명으로 수정 후 저장하시면 실시간으로 반영됩니다! 
              </p>
            </div>
          </div>
        );

      case 'june_ranking_recovery':
        return (
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-700 animate-fade-in">
            {/* Urgent Alert Banner */}
            <div className="p-4 bg-gradient-to-r from-rose-50 to-amber-50 rounded-2xl border-2 border-amber-200">
              <h4 className="font-extrabold text-rose-800 flex items-center gap-1.5 text-xs sm:text-sm mb-1">
                🚨 6월 개인 및 학급 최종 랭킹 복원 소식!
              </h4>
              <p className="text-gray-700 font-bold text-[11px] sm:text-xs">
                7월 1일 자정 월말 데이터 초기화 및 업데이트 과정에서, 6월 점수 연산 시스템의 기술적인 버그로 인해 일부 학생 및 학급의 6월 점수 집계가 누락되어 명예의 전당 순위가 잘못 표시되는 문제가 있었습니다.
              </p>
              <p className="text-gray-600 font-medium text-[10px] sm:text-[11px] mt-1.5 leading-normal">
                본부 개발팀에서 모든 탐험가들의 실시간 DB 누적 데이터를 철저히 분석 및 역추적 연산하여, 누락되었던 6월 최종 점수와 실시간 명예의 전당 랭킹을 정상 복구 완료하였습니다!
              </p>
            </div>

            {/* Individual Rankings (Top 10) */}
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100">
              <h4 className="font-black text-amber-900 text-xs sm:text-sm mb-3 flex items-center gap-1.5">
                👑 6월 개인 랭킹 최종 명예의 전당 (복원 완료 결과)
              </h4>
              
              <div className="space-y-1.5">
                {/* 1st Place - Gold Card */}
                <div className="p-3 rounded-xl bg-gradient-to-r from-yellow-100/80 via-amber-100/40 to-yellow-50 border border-yellow-300 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl animate-bounce">🥇</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-black text-amber-950 text-xs sm:text-sm">유서준 (4학년 4반)</span>
                        <span className="bg-yellow-500 text-white text-[8px] px-1 py-0.2 rounded font-extrabold">최종 1위 🏆</span>
                      </div>
                      <p className="text-[10px] text-amber-800 font-bold">친구 도현우와 함께 대망의 1등 등극 완료!</p>
                    </div>
                  </div>
                  <span className="font-black text-amber-700 text-xs sm:text-sm">63,060 XP</span>
                </div>

                {/* 2nd Place - Silver Card */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-gray-100 to-slate-50 border border-gray-300 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🥈</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-gray-900 text-xs sm:text-sm">김태린 🍎 (4학년 1반)</span>
                        <span className="bg-gray-400 text-white text-[8px] px-1 py-0.2 rounded font-extrabold">최종 2위</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-gray-600 text-xs sm:text-sm">60,110 XP</span>
                </div>

                {/* 3rd Place - Bronze Card */}
                <div className="p-2.5 rounded-xl bg-gradient-to-r from-amber-100/40 to-orange-50 border border-amber-200/80 shadow-sm flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">🥉</span>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-amber-950 text-xs sm:text-sm">도현우 (4학년 2반)</span>
                        <span className="bg-amber-600 text-white text-[8px] px-1 py-0.2 rounded font-extrabold">최종 3위</span>
                      </div>
                    </div>
                  </div>
                  <span className="font-black text-amber-800 text-xs sm:text-sm">56,610 XP</span>
                </div>

                {/* 4th-10th List */}
                <div className="mt-3 bg-white/95 rounded-xl border border-gray-100 p-2 text-xs divide-y divide-gray-100">
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-600">
                    <span>• 4위: 권지훈🤯😱 (4학년 5반)</span>
                    <span className="font-bold text-gray-800">47,006 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-600">
                    <span>• 5위: 최진호 (4학년 1반)</span>
                    <span className="font-bold text-gray-800">37,420 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-600">
                    <span>• 6위: 서아♡ (4학년 1반)</span>
                    <span className="font-bold text-gray-800">36,230 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-600">
                    <span>• 7위: 김원우 (4학년 1반)</span>
                    <span className="font-bold text-gray-800">33,150 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-500">
                    <span>• 8위: 금다온 (3학년 3반)</span>
                    <span className="font-bold text-gray-700">27,379 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-500">
                    <span>• 9위: ˚ෆ*₊주현우ʚɞ (4학년 5반)</span>
                    <span className="font-bold text-gray-700">27,000 XP</span>
                  </div>
                  <div className="flex justify-between py-1.5 px-1 font-semibold text-gray-500">
                    <span>• 10위: 박서윤 (3학년 3반)</span>
                    <span className="font-bold text-gray-700">26,841 XP</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Class Rankings Restored (Top 5) */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 border border-indigo-100">
              <h4 className="font-black text-indigo-900 text-xs sm:text-sm mb-2.5 flex items-center gap-1.5">
                🏫 6월 학급 랭킹 최종 복원 결과
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-bold text-gray-700">
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-indigo-200">
                  <span className="text-indigo-600">🥇 1위: 4학년 1반 👑</span>
                  <span className="text-indigo-500">438,623 XP</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-150">
                  <span>🥈 2위: 3학년 5반</span>
                  <span className="text-gray-600">270,887 XP</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-150">
                  <span>🥉 3위: 5학년 5반</span>
                  <span className="text-gray-600">229,368 XP</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-150">
                  <span>• 4위: 3학년 3반</span>
                  <span className="text-gray-500">217,104 XP</span>
                </div>
                <div className="flex justify-between items-center bg-white p-2.5 rounded-xl border border-gray-150 sm:col-span-2">
                  <span className="text-emerald-700">• 5위: 4학년 4반 (유서준 학급!)</span>
                  <span className="text-emerald-600">193,957 XP</span>
                </div>
              </div>
            </div>

            {/* Explanatory Footnote */}
            <p className="text-[10px] text-gray-400 font-semibold leading-normal bg-gray-50 p-2.5 rounded-xl border border-gray-100">
              💡 <strong>집계 및 데이터 산정 원리:</strong> 7월 1일에 새 학기로 데이터가 전환되면서, 누적 총합 점수에서 7월 점수(monthlyScore)를 뺀 결과가 최종 6월의 June 챔피언 점수가 됩니다. 시스템 복원 패치 덕분에 누락 없이 명명백백하고 완벽하게 복구되었습니다!
            </p>
          </div>
        );
      
      case 'user_feedback_patches':
        return (
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-700 animate-fade-in">
            <div className="p-3.5 rounded-2xl bg-indigo-50 border border-indigo-100">
              <p className="font-extrabold text-indigo-950 mb-1">
                탐험대원들의 의견 반영 및 패치 노트 🛠️
              </p>
              <p className="text-indigo-900 font-bold text-[11.5px]">
                학생 탐험가들이 제보해 주신 의견들을 꼼꼼하게 검토하여 아래 시스템 오류를 긴급 수정하고 재미있는 신규 제안 콘텐츠들을 정식 출시했습니다!
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {/* Item 1 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                <span className="text-lg">🧩</span>
                <div>
                  <h5 className="font-black text-gray-900 text-xs sm:text-sm">김*린 학생: 초성퀴즈 버그 완전 해결!</h5>
                  <p className="text-gray-500 text-[11px] font-semibold mt-0.5">초성퀴즈 플레이 도중 화면이 정지되거나 오답 처리되는 현상을 완벽하게 해결했습니다.</p>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                <span className="text-lg">🏪</span>
                <div>
                  <h5 className="font-black text-gray-900 text-xs sm:text-sm">이*민 학생: 편의점 정리 버그 수정!</h5>
                  <p className="text-gray-500 text-[11px] font-semibold mt-0.5">편의점 정리 3스테이지 클리어 시 다음 화면으로 넘어가지 않고 렉이 걸리는 오류를 패치 완료했습니다.</p>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                <span className="text-lg">🃏</span>
                <div>
                  <h5 className="font-black text-gray-900 text-xs sm:text-sm">권*훈 학생 기획: '도블 카드 게임' 정식 탑재!</h5>
                  <p className="text-gray-500 text-[11px] font-semibold mt-0.5">권*훈 학생이 제안하고 설계해 준 흥미진진한 도블 매칭 게임이 고품격 UI와 함께 정식 런칭되었습니다.</p>
                </div>
              </div>

              {/* Item 4 */}
              <div className="p-3 bg-white rounded-xl border border-gray-100 flex items-start gap-3 shadow-sm">
                <span className="text-lg">🥤</span>
                <div>
                  <h5 className="font-black text-gray-900 text-xs sm:text-sm">반*아 학생 기획: '할리갈리 컵 쌓기' 정식 탑재!</h5>
                  <p className="text-gray-500 text-[11px] font-semibold mt-0.5">반*아 학생의 컵할리갈리 기획이 고난이도 패턴의 실시간 조작 컵 쌓기 게임으로 완성되어 정식 탑재되었습니다.</p>
                </div>
              </div>
            </div>

            {/* Gift event */}
            <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-2 border-dashed border-amber-300 rounded-2xl text-center">
              <span className="text-xl">🎁</span>
              <h5 className="font-black text-amber-950 text-xs mt-1">소중한 의견 감사 선물 추첨 이벤트!</h5>
              <p className="text-gray-600 text-[10.5px] font-semibold mt-1">
                버그 제보와 새로운 아이디어를 제안해 준 탐험가 중 추첨을 통해 월말에 정성스런 기프티콘 선물을 발송해 드릴 예정입니다! 앞으로도 많은 의견 부탁드립니다! ❤️
              </p>
            </div>
          </div>
        );
      
      case 'july_reset_content':
        return (
          <div className="space-y-4 text-xs sm:text-sm leading-relaxed text-gray-700 animate-fade-in">
            <div className="p-3 bg-emerald-50 rounded-2xl border border-emerald-100">
              <p className="font-extrabold text-emerald-950 flex items-center gap-1.5">
                🌳 7월, 새로운 도전과 콘텐츠로 가득 채우다!
              </p>
              <p className="text-emerald-900 font-bold text-[11.5px] mt-0.5">
                6월 랭킹 레이스가 성황리에 마감되었으며, 7월 1일부터는 모두 동등하게 0 XP부터 새로운 명예의 주인공을 향해 달려갑니다!
              </p>
            </div>

            <div className="space-y-3">
              {/* Concept Forest */}
              <div className="p-3 bg-white rounded-xl border border-gray-150 text-left">
                <h5 className="font-black text-emerald-800 text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                  🌳 개념의 숲 코너 오픈!
                </h5>
                <p className="text-gray-600 text-[11px] font-medium leading-relaxed">
                  3D 스타일의 숲속을 탐험하면서 7가지 IB 핵심 개념 퀴즈를 풀고 나만의 나무를 성장시키는 새로운 개념 탐색 코너입니다. 나무를 성장시키고 풍성한 보너스 XP를 획득해 보세요!
                </p>
              </div>

              {/* AI Caricature */}
              <div className="p-3 bg-white rounded-xl border border-gray-150 text-left">
                <h5 className="font-black text-indigo-800 text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                  📸 AI 캐리커쳐 & 자격증 자랑 코너!
                </h5>
                <p className="text-gray-600 text-[11px] font-medium leading-relaxed">
                  자신의 프로필 사진을 찍어 올리면 AI가 세상에 단 하나뿐인 IB 학습자상 자격증 캐리커쳐를 그려줍니다! 발급된 자격증을 자랑 게시판에 자랑하면 <strong>즉시 +50 XP</strong>를 드립니다! (일일 사용량 제한 적용)
                </p>
              </div>

              {/* Padlet Board */}
              <div className="p-3 bg-white rounded-xl border border-gray-150 text-left">
                <h5 className="font-black text-orange-800 text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                  📌 실시간 소통 패들렛 보드!
                </h5>
                <p className="text-gray-600 text-[11px] font-medium leading-relaxed">
                  친구들과 실시간으로 소통하며 생각을 남기는 패들렛 보드가 활성화되었습니다! 오늘의 탐구 주제에 생각을 남겨 즉시 <strong>+30 XP</strong> 보너스를 수령하세요!
                </p>
              </div>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-2 sm:p-4 bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-4xl bg-white rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden border-4 border-amber-100 flex flex-col md:flex-row h-[90vh] md:h-[650px]"
        >
          {/* Main Close Button */}
          <button 
            onClick={() => setIsOpen(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100 rounded-full transition-colors z-20 cursor-pointer text-gray-400 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT SIDEBAR: Notice List & History (Hidden on mobile detail view) */}
          <div className={cn(
            "flex flex-col w-full md:w-[280px] bg-slate-50 border-r border-gray-100 shrink-0 justify-between h-full",
            mobileView === 'detail' ? "hidden md:flex" : "flex"
          )}>
            {/* Header / Metrics */}
            <div className="p-5 border-b border-gray-100 bg-white">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="p-1.5 bg-indigo-50 rounded-lg text-indigo-600">
                  <Inbox className="w-5 h-5" />
                </span>
                <span className="text-[10px] font-black tracking-widest text-indigo-600 uppercase">Notice Center</span>
              </div>
              <h3 className="text-sm font-black text-gray-900">증평 IB 탐험대 공지보드</h3>
              
              <div className="mt-3 flex items-center gap-1.5 text-[11px] font-extrabold text-gray-500 bg-indigo-50/40 p-2 rounded-xl">
                <CheckCircle2 className="w-3.5 h-3.5 text-indigo-500" />
                <span>중요 공지: {unreadCount > 0 ? `${unreadCount}개 안 읽음` : '전부 읽음 ✓'}</span>
              </div>
            </div>

            {/* List View of Announcements */}
            <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
              {notices.map((n) => {
                const IconComponent = n.icon;
                const isSelected = selectedId === n.id;
                const isRead = readHistory[n.id];

                return (
                  <button
                    key={n.id}
                    onClick={() => handleSelectNotice(n.id)}
                    className={cn(
                      "w-full text-left p-3 rounded-2xl border transition-all relative flex gap-2.5 items-start group cursor-pointer",
                      isSelected 
                        ? "bg-white border-indigo-200 shadow-md ring-2 ring-indigo-100/50" 
                        : "bg-white/70 border-gray-150 hover:bg-white hover:border-gray-200"
                    )}
                  >
                    {/* Unread Indicator Dot */}
                    {!isRead && (
                      <span className="absolute top-3.5 right-3 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                    )}

                    {/* Left Icon Badge */}
                    <div className={cn(
                      "p-2 rounded-xl shrink-0 transition-colors",
                      isSelected ? "bg-indigo-50 text-indigo-600" : "bg-gray-100 text-gray-500 group-hover:bg-indigo-50 group-hover:text-indigo-600"
                    )}>
                      <IconComponent className="w-4 h-4" />
                    </div>

                    {/* Text Details */}
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1 flex-wrap">
                        <span className={cn(
                          "text-[8.5px] px-1.5 py-0.2 rounded-md font-black uppercase tracking-wider border",
                          n.id === 'june_ranking_recovery' ? "bg-rose-50 text-rose-600 border-rose-100 animate-pulse" : "bg-gray-50 text-gray-600 border-gray-100"
                        )}>
                          {n.badge}
                        </span>
                        <span className="text-[9.5px] font-black text-gray-400">{n.date}</span>
                      </div>
                      <h4 className={cn(
                        "text-[11.5px] font-bold tracking-tight leading-snug mt-1 truncate",
                        isSelected ? "text-indigo-950 font-black" : "text-gray-700 group-hover:text-gray-950"
                      )}>
                        {n.title.replace(/^[^\s]+\s+/, '') /* strip emoji prefix */}
                      </h4>
                      <p className="text-[10px] text-gray-400 font-semibold truncate mt-0.5">{n.summary}</p>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Footer containing quick shortcut tips */}
            <div className="p-4 bg-white border-t border-gray-100 text-[10px] text-gray-400 font-semibold text-center">
              주소창 입력: <span className="text-indigo-600 font-bold underline">증평아이비.qaa.kr</span>
            </div>
          </div>

          {/* RIGHT PANEL: Notice Detailed View (Hidden on mobile list view) */}
          <div className={cn(
            "flex-1 flex flex-col bg-white min-w-0 h-full",
            mobileView === 'list' ? "hidden md:flex" : "flex"
          )}>
            
            {/* Header Bar with back button (on mobile) and notice meta info */}
            <div className="p-4 sm:p-5 border-b border-gray-100 bg-white shrink-0 flex items-center justify-between">
              <div className="flex items-center gap-3 min-w-0">
                {/* Back button on mobile */}
                <button
                  onClick={() => setMobileView('list')}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full transition-colors cursor-pointer text-gray-500 mr-1 flex items-center gap-1 font-bold text-xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span>목록</span>
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="bg-indigo-50 text-indigo-600 text-[9px] px-2 py-0.5 rounded-full font-black border border-indigo-100">
                      {notices.find(n => n.id === selectedId)?.category}
                    </span>
                    <span className="text-[10px] text-gray-400 font-bold">
                      게시일: {notices.find(n => n.id === selectedId)?.date}
                    </span>
                  </div>
                  <h3 className="text-sm sm:text-base font-black text-gray-900 tracking-tight leading-tight truncate">
                    {notices.find(n => n.id === selectedId)?.title}
                  </h3>
                </div>
              </div>
            </div>

            {/* Scrollable Notice Content Area */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 custom-scrollbar bg-slate-50/20">
              {renderContent()}
            </div>

            {/* Read / Dismiss controls at the bottom */}
            <div className="p-4 sm:p-5 border-t border-gray-100 bg-white shrink-0 flex flex-col sm:flex-row items-center justify-between gap-3">
              {/* Checkboxes */}
              <div className="flex items-center justify-center gap-4">
                <label className="flex items-center gap-1.5 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={dontShowToday}
                    onChange={(e) => {
                      setDontShowToday(e.target.checked);
                      if (e.target.checked) setDontShowForWeek(false);
                    }}
                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10.5px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
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
                    className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10.5px] text-gray-400 font-bold group-hover:text-gray-600 transition-colors">
                    일주일 동안 보지 않기
                  </span>
                </label>
              </div>

              {/* Close / Action Button */}
              <Button 
                onClick={handleClose}
                className="w-full sm:w-auto px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-black text-xs sm:text-sm shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-1 cursor-pointer border border-indigo-400/20"
              >
                <span>확인했습니다 ! 탐험 계속하기 🚀</span>
              </Button>
            </div>

          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

// Simple utility function for class names
function cn(...classes: any[]) {
  return classes.filter(Boolean).join(' ');
}
