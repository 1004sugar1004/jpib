import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft, 
  Gamepad2, 
  Trophy, 
  Grid3X3, 
  Rocket, 
  Apple, 
  ShoppingCart, 
  Lock,
  Pencil,
  Bell,
  Layers,
  Sword,
  Sparkles,
  MessageSquare,
  CheckCircle2
} from 'lucide-react';
import { AnipangGame } from '../games/AnipangGame';
import { GalagaGame } from '../games/GalagaGame';
import { FruitMergeGame } from '../games/FruitMergeGame';
import { StoreSortingGame } from '../games/StoreSortingGame';
import { MarioGame } from '../games/MarioGame';
import { RhythmTrainingGame } from '../games/RhythmTrainingGame';
import { DrawingGame } from '../games/DrawingGame';
import { HalliGalliGame } from '../games/HalliGalliGame';
import { JengaGame } from '../games/JengaGame';
import { NinjaGame } from '../games/NinjaGame';
import { UnoGame } from '../games/UnoGame';
import { DobbleGame } from '../games/DobbleGame';
// @ts-ignore
import dobbleImage from '../../assets/dobble.png';

import { UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';

interface GameCornerViewProps {
  profile: UserProfile | null;
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
  onUseTicket: () => void;
  soundEnabled: boolean;
}

export const GameCornerView = ({ profile, setView, onUseTicket, soundEnabled }: GameCornerViewProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const isTeacher = profile?.role === 'teacher';
  const [showCardWarning, setShowCardWarning] = useState(
    !isTeacher && (profile?.completedStudyItems?.length || 0) === 0 && (profile?.gameTickets || 0) === 0
  );
  const score = profile?.score || 0;
  const tickets = profile?.gameTickets || 0;

  const [showTestVersionModal, setShowTestVersionModal] = useState<boolean>(true);
  const [feedbackText, setFeedbackText] = useState<string>('');
  const [feedbackSubmitting, setFeedbackSubmitting] = useState<boolean>(false);
  const [feedbackSubmitted, setFeedbackSubmitted] = useState<boolean>(false);

  const games = [
    { id: 'anipang', name: 'IB 애니팡', icon: Grid3X3, color: 'bg-pink-500', unlockXp: 0, description: '3개를 맞춰보세요!', bgImage: 'https://i.imgur.com/UMcVNRB.png' },
    { id: 'galaga', name: 'IB 갤러그', icon: Rocket, color: 'bg-blue-600', unlockXp: 0, description: '우주선을 조종하세요!', bgImage: 'https://i.imgur.com/jHXUiJ7.png' },
    { id: 'fruit', name: 'IB 지식 머지', icon: Apple, color: 'bg-orange-500', unlockXp: 0, description: '과일을 합치며 IB 핵심 지식을 쌓아요!', bgImage: 'https://i.imgur.com/DrD9Hmx.png' },
    { id: 'store', name: 'IB 편의점 정리', icon: ShoppingCart, color: 'bg-emerald-500', unlockXp: 0, description: '선반을 정리하세요!', bgImage: 'https://i.imgur.com/QKpwzWZ.png' },
    { id: 'mario', name: 'IB 마리오', icon: Gamepad2, color: 'bg-red-600', unlockXp: 0, description: '장애물을 뛰어넘으세요!', bgImage: 'https://i.imgur.com/xBUw4hj.png' },
    { id: 'rhythm', name: 'IB 리듬 트레이닝', icon: Trophy, color: 'bg-yellow-500', unlockXp: 0, description: '박자에 맞춰 화살표를 눌러보세요!', bgImage: 'https://i.imgur.com/rLktNhW.png' },
    { id: 'drawing', name: '10초 드로잉', icon: Pencil, color: 'bg-indigo-600', unlockXp: 0, description: 'AI가 당신의 그림을 맞힐 수 있을까요?', bgImage: 'https://i.imgur.com/lyCqTY1.png' },
    { id: 'halligalli', name: 'IB 할리갈리', icon: Bell, color: 'bg-emerald-600', unlockXp: 0, description: '과일 개수의 합이 정확히 5개가 될 때 벨을 울리세요!', bgImage: 'https://i.imgur.com/xe54lqW.png' },
    { id: 'jenga', name: 'IB 젠가', icon: Layers, color: 'bg-orange-600', unlockXp: 0, description: '타워가 무너지지 않도록 블록을 조심히 빼내 쌓으세요!', bgImage: 'https://i.imgur.com/0wF00pI.png' },
    { id: 'ninja', name: 'IB 손날 닌자', icon: Sword, color: 'bg-cyan-500', unlockXp: 0, description: '화면으로 솟구치는 네온 과일을 검지 손날 광선검으로 쪼개 자르세요!', bgImage: 'https://i.imgur.com/b2PpuDw.png' },
    { id: 'uno', name: 'IB 우노', icon: Layers, color: 'bg-rose-500', unlockXp: 0, description: '선생님이 전달해 주실 우노 게임 코드 대기 및 테스트 버전입니다!', bgImage: 'https://i.imgur.com/EJAPDgp.png' },
    { id: 'dobble', name: 'IB 도블', icon: Sparkles, color: 'bg-amber-500', unlockXp: 0, description: '선생님이 새로운 우노 등과 함께 도블 게임 코드를 기증하실 준비가 진행 중입니다!', bgImage: dobbleImage },
    { id: 'cuphalligalli', name: 'IB 컵 할리갈리', icon: Bell, color: 'bg-teal-500', unlockXp: 0, description: '반*아 학생이 제안한 컵 쌓기 할리갈리 게임입니다! 코드가 곧 준비될 예정입니다.', bgImage: 'https://i.imgur.com/1KjXT1X.png' },
  ];

  if (selectedGame) {
    const isDrawingGame = selectedGame === 'drawing';
    return (
      <div 
        className={cn(
          "w-full h-full min-h-screen flex flex-col p-2 md:p-4 transition-all duration-500",
          isDrawingGame ? "bg-cover bg-center" : "bg-gray-900/10"
        )}
        style={isDrawingGame ? { backgroundImage: 'url(https://i.imgur.com/pDQDTaf.png)' } : {}}
      >
        <header className={cn(
          "flex items-center justify-between mb-4 px-4 py-2 rounded-2xl shadow-sm border",
          isDrawingGame ? "bg-white/40 backdrop-blur-xl border-white/20" : "bg-white/80 backdrop-blur-md border-white/20"
        )}>
          <Button variant="ghost" onClick={() => setSelectedGame(null)} icon={ArrowLeft} className="text-gray-600">게임 목록</Button>
          <h2 className="text-lg md:text-2xl font-black text-gray-900">{games.find(g => g.id === selectedGame)?.name}</h2>
          <div className="w-20 hidden md:block" />
        </header>
        
        <div className="flex-1 flex items-center justify-center w-full overflow-hidden">
          <div className={cn(
            "w-full overflow-hidden relative border-4 md:border-8 shadow-2xl transition-all",
            selectedGame === 'dobble' 
              ? "max-w-6xl xl:max-w-[1300px] max-h-[92vh] aspect-auto min-h-[580px] md:min-h-[680px] lg:min-h-[720px]" 
              : "max-w-4xl xl:max-w-5xl max-h-[85vh]",
            isDrawingGame 
              ? "bg-transparent border-transparent shadow-none" 
              : "bg-gray-900 border-gray-800 rounded-[1.5rem] md:rounded-[2.5rem]",
            selectedGame === 'dobble'
              ? ""
              : selectedGame === 'rhythm' || selectedGame === 'jenga' || selectedGame === 'halligalli' || selectedGame === 'ninja' 
                ? "aspect-[3/4] md:aspect-square" 
                : "aspect-[3/4] md:aspect-video"
          )}>
            {selectedGame === 'anipang' && <AnipangGame soundEnabled={soundEnabled} />}
            {selectedGame === 'galaga' && <GalagaGame soundEnabled={soundEnabled} />}
            {selectedGame === 'fruit' && <FruitMergeGame soundEnabled={soundEnabled} />}
            {selectedGame === 'store' && <StoreSortingGame soundEnabled={soundEnabled} />}
            {selectedGame === 'mario' && <MarioGame soundEnabled={soundEnabled} />}
            {selectedGame === 'rhythm' && <RhythmTrainingGame soundEnabled={soundEnabled} />}
            {selectedGame === 'drawing' && <DrawingGame soundEnabled={soundEnabled} />}
            {selectedGame === 'halligalli' && <HalliGalliGame soundEnabled={soundEnabled} />}
            {selectedGame === 'jenga' && <JengaGame soundEnabled={soundEnabled} />}
            {selectedGame === 'ninja' && <NinjaGame soundEnabled={soundEnabled} />}
            {selectedGame === 'uno' && <UnoGame soundEnabled={soundEnabled} />}
            {selectedGame === 'dobble' && <DobbleGame soundEnabled={soundEnabled} />}
            {selectedGame === 'cuphalligalli' && (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center text-white bg-slate-950 w-full min-h-[50vh]">
                <motion.div 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ duration: 0.8, repeat: Infinity, repeatType: "reverse" }}
                  className="w-20 h-20 rounded-full bg-teal-500/10 border-2 border-teal-500 flex items-center justify-center mb-6 text-teal-400"
                >
                  <Bell className="w-10 h-10" />
                </motion.div>
                <h3 className="text-xl md:text-2xl font-black mb-2 text-teal-300">IB 컵할리갈리 (준비 중!)</h3>
                <p className="text-zinc-400 text-xs md:text-sm max-w-md font-bold leading-relaxed mb-4 px-4">
                  반*아 학생이 제안하고 기획 중인 컵할리갈리 게임입니다! <br />선생님이 멋지게 게임 코드를 추가해 주시는 대로 연동될 예정이에요! 🥤
                </p>
                <div className="text-teal-400 text-[10px] font-mono bg-teal-950/40 py-1.5 px-4 rounded-full border border-teal-900/30">
                  STATUS: WAITING_FOR_USER_CODE 🛠️
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 py-8 space-y-8">
      <div className="max-w-4xl mx-auto space-y-8">
        <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-10">
          <Gamepad2 className="w-32 h-32" />
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setView('home')} 
          icon={ArrowLeft} 
          className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
        >
          뒤로 가기
        </Button>
        <h2 className="text-3xl font-black text-gray-900">IB 게임 코너</h2>
        <p className="text-gray-500 font-bold">
          {isTeacher ? '선생님은 모든 게임을 자유롭게 체험하실 수 있습니다.' : '퀴즈를 풀고 얻은 티켓으로 게임을 즐겨보세요!'}
        </p>
        
        <div className="mt-6 inline-flex items-center gap-3 px-6 py-3 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Trophy className="w-6 h-6 text-indigo-600" />
          <span className="font-black text-indigo-900">
            {isTeacher ? '무제한 체험 모드' : `보유 티켓: ${tickets}개`}
          </span>
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {games.map((game) => {
          const isLocked = false; // All games unlocked as requested
          const isFreeTestGame = game.id === 'halligalli' || game.id === 'jenga' || game.id === 'ninja' || game.id === 'uno' || game.id === 'dobble' || game.id === 'cuphalligalli';
          
          return (
            <motion.div
              key={game.id}
              whileHover={!isLocked && (isFreeTestGame || tickets > 0 || isTeacher) ? { scale: 1.02 } : {}}
              whileTap={!isLocked && (isFreeTestGame || tickets > 0 || isTeacher) ? { scale: 0.98 } : {}}
              onClick={() => {
                if (isLocked) return;
                if (!isFreeTestGame && tickets <= 0 && !isTeacher) {
                  console.log('게임 티켓이 부족합니다! 퀴즈를 풀어 티켓을 획득하세요.');
                  return;
                }
                if (!isTeacher && !isFreeTestGame) onUseTicket();
                setSelectedGame(game.id);
              }}
              className={cn(
                "cursor-pointer group relative",
                isLocked && "cursor-not-allowed opacity-75"
              )}
            >
              <Card 
                className={cn(
                  "p-8 h-full flex flex-col items-center text-center transition-all border-4 relative overflow-hidden",
                  isLocked ? "bg-gray-50 border-gray-200" : "hover:border-indigo-400 border-transparent"
                )}
                style={!isLocked ? { 
                  backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.6), rgba(255, 255, 255, 0.6)), url("${game.bgImage}")`,
                  backgroundSize: 'cover',
                  backgroundPosition: 'center'
                } : {}}
              >
                {isFreeTestGame && (
                  <div className="absolute top-4 right-4 bg-emerald-500 text-white text-[11px] font-black px-2.5 py-1 rounded-full shadow-md animate-pulse tracking-wider flex items-center gap-1 z-10">
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>테스트 (티켓 무료)</span>
                  </div>
                )}
                
                <div className={cn(
                  "w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg relative",
                  isLocked ? "bg-gray-400" : game.color
                )}>
                  {isLocked ? <Lock className="w-10 h-10" /> : <game.icon className="w-10 h-10" />}
                </div>
                
                <h3 className="text-xl font-black text-gray-900 mb-2">{game.name}</h3>
                <p className="text-gray-500 text-sm mb-4">{game.description}</p>
                
                <div className="mt-auto flex items-center gap-1 text-indigo-600 font-bold text-sm">
                  게임 시작하기 <ArrowLeft className="w-4 h-4 rotate-180" />
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {/* Card Warning Popup */}
      {showCardWarning && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[3rem] p-10 max-w-lg w-full text-center shadow-2xl border-4 border-indigo-400"
          >
            <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
              <Gamepad2 className="w-12 h-12 text-indigo-600" />
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4">잠깐! 탐험가님!</h2>
            <p className="text-xl font-bold text-gray-600 mb-8 leading-relaxed">
              카드가 없는 친구들은 <span className="text-indigo-600">퀴즈 챌린지</span>에 도전하고 카드를 얻으세요!
            </p>
            <div className="flex flex-col gap-3">
              <Button 
                onClick={() => setView('quiz')} 
                className="w-full py-5 text-xl bg-indigo-600 hover:bg-indigo-700 shadow-lg shadow-indigo-100"
              >
                퀴즈 챌린지 도전하기
              </Button>
              <Button 
                variant="ghost" 
                onClick={() => setShowCardWarning(false)} 
                className="w-full py-4 text-gray-400 hover:text-gray-600"
              >
                그냥 둘러볼래요
              </Button>
            </div>
          </motion.div>
        </div>
      )}

      {/* Test Version Info & Feedback Modal */}
      {showTestVersionModal && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md overflow-y-auto">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[2.5rem] p-6 md:p-10 max-w-2xl w-full text-center shadow-2xl border-4 border-indigo-400 relative my-8"
          >
            <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
              <Sparkles className="w-48 h-48 text-indigo-600" />
            </div>

            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mx-auto mb-6 border-2 border-emerald-100">
              <Sparkles className="w-10 h-10 text-emerald-600" />
            </div>

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">🎉 할리갈리 · 젠가 · 손날닌자 · 우노 무료 오픈!</h2>
            <p className="text-indigo-600 font-bold mb-6 text-sm bg-indigo-50 px-4 py-1.5 rounded-full inline-block">
              신규 게임 4종 테스트 버전 출시 🌟
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6 border border-gray-100 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  새로 출시된 <strong className="text-gray-900">IB 할리갈리 🍉, IB 젠가 🧱, IB 손날 닌자 ⚔️, IB 우노 🃏</strong> 게임은 <strong className="text-emerald-600">티켓 없이 무료</strong>로 플레이하실 수 있습니다!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  직접 체험해 보시고 재미있었던 점, 버그, 개선할 점 등 여러분의 <strong className="text-indigo-600">소중한 의견</strong>을 편하게 들려주세요.
                </p>
              </div>
            </div>

            {/* Opinion/Feedback Form */}
            <div className="border-t border-gray-100 pt-6 text-left">
              <h3 className="text-lg font-black text-gray-900 mb-3 flex items-center gap-1.5">
                <MessageSquare className="w-5 h-5 text-indigo-600" />
                <span>테스트 의견 보내기 (과자 당첨 추첨 대상!)</span>
              </h3>

              {feedbackSubmitted ? (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center"
                >
                  <p className="text-emerald-700 font-black text-base flex items-center justify-center gap-1.5">
                    <CheckCircle2 className="w-5 h-5" /> 의견이 잘 제출되었습니다!
                  </p>
                  <p className="text-emerald-600/80 font-semibold text-xs mt-1">소중한 피드백 감사드립니다. 더 멋진 게임으로 보답할게요!</p>
                </motion.div>
              ) : (
                <div className="space-y-3">
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="예: 손날 닌자 검지 손날 추적이 너무 재미있어요! / 할리갈리 벨 울리는 게 중독성 있네요. / 젠가 블록 뺄 때 조금 더 묵직하면 좋겠어요!"
                    className="w-full h-24 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all text-sm font-medium resize-none"
                  />
                  <Button
                    onClick={async () => {
                      if (!feedbackText.trim()) return;
                      setFeedbackSubmitting(true);
                      try {
                        await addDoc(collection(db, 'feedback'), {
                          uid: profile?.uid || 'guest',
                          userName: profile?.name || 'GUEST',
                          grade: profile?.grade || 0,
                          class: profile?.class || 0,
                          content: `[신규게임 무료체험 피드백] ${feedbackText.trim()}`,
                          timestamp: Date.now()
                        });
                        setFeedbackSubmitted(true);
                        setFeedbackText('');
                      } catch (error) {
                        console.error('Feedback submit failed: ', error);
                      } finally {
                        setFeedbackSubmitting(false);
                      }
                    }}
                    disabled={feedbackSubmitting || !feedbackText.trim()}
                    className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-bold text-sm shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {feedbackSubmitting ? (
                      <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      '의견 보내기'
                    )}
                  </Button>
                </div>
              )}
            </div>

            <div className="mt-8 flex justify-end gap-3 border-t border-gray-100 pt-6">
              <Button 
                variant="ghost"
                onClick={() => setShowTestVersionModal(false)}
                className="px-6 py-3 text-gray-500 hover:text-gray-700"
              >
                닫기
              </Button>
              <Button 
                onClick={() => setShowTestVersionModal(false)} 
                className="px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-white shadow-md"
              >
                무료 게임 플레이하기
              </Button>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  </div>
  );
};
