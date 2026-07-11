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
  CheckCircle2,
  ShieldAlert
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
import { CupHalliGalliGame } from '../games/CupHalliGalliGame';
// @ts-ignore
import dobbleImage from '../../assets/dobble.png';

import { UserProfile } from '../../types';
import { db } from '../../firebase';
import { collection, addDoc, getDocs, query, where } from 'firebase/firestore';

interface GameCornerViewProps {
  profile: UserProfile | null;
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
  onUseTicket: () => void;
  soundEnabled: boolean;
}

export const GameCornerView = ({ profile, setView, onUseTicket, soundEnabled }: GameCornerViewProps) => {
  const [selectedGame, setSelectedGame] = useState<string | null>(null);
  const [activeFilter, setActiveFilter] = useState<'all' | 'student' | 'free' | 'classic'>('all');
  const isTeacher = profile?.role === 'teacher';
  const [showCardWarning, setShowCardWarning] = useState(
    !isTeacher && (profile?.completedStudyItems?.length || 0) === 0 && (profile?.gameTickets || 0) === 0
  );
  const score = profile?.score || 0;
  const tickets = profile?.gameTickets || 0;

  const [showRankingModal, setShowRankingModal] = useState<boolean>(false);
  const [currentRankings, setCurrentRankings] = useState<any[]>([]);
  const [lastSavedScore, setLastSavedScore] = useState<number | null>(null);
  const [rankingLoading, setRankingLoading] = useState<boolean>(false);

  const handleGameFinish = async (gameId: string, finalScore: number) => {
    if (!profile) return;
    setRankingLoading(true);
    setLastSavedScore(finalScore);
    setShowRankingModal(true);

    try {
      // 1. Save score to Firestore
      await addDoc(collection(db, 'gameScores'), {
        gameId,
        uid: profile.uid,
        userName: profile.name,
        grade: profile.grade,
        class: profile.class,
        score: finalScore,
        timestamp: Date.now()
      });

      // 2. Fetch scores for this game
      const q = query(
        collection(db, 'gameScores'),
        where('gameId', '==', gameId)
      );
      const querySnapshot = await getDocs(q);
      const scoresList: any[] = [];
      querySnapshot.forEach(doc => {
        const data = doc.data();
        scoresList.push({ id: doc.id, ...data });
      });

      // 3. Sort client-side to find top 3 unique users
      const sorted = scoresList.sort((a, b) => {
        if (b.score !== a.score) {
          return b.score - a.score;
        }
        return a.timestamp - b.timestamp;
      });

      const uniquePlayers: any[] = [];
      const seenUids = new Set<string>();
      for (const item of sorted) {
        if (!seenUids.has(item.uid)) {
          seenUids.add(item.uid);
          uniquePlayers.push(item);
        }
        if (uniquePlayers.length >= 3) break;
      }

      setCurrentRankings(uniquePlayers);
    } catch (err) {
      console.error("Error saving/fetching game score: ", err);
    } finally {
      setRankingLoading(false);
    }
  };

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
    { id: 'jenga', name: 'IB 젠가 (1P/2P)', icon: Layers, color: 'bg-orange-600', unlockXp: 0, description: '타워가 무너지지 않게 블록을 조심히 빼내 쌓으세요! (1인 및 한 패드 2인 대결 완벽 지원)', bgImage: 'https://i.imgur.com/0wF00pI.png' },
    { id: 'ninja', name: 'IB 손날 닌자', icon: Sword, color: 'bg-cyan-500', unlockXp: 0, description: '화면으로 솟구치는 네온 과일을 검지 손날 광선검으로 쪼개 자르세요!', bgImage: 'https://i.imgur.com/b2PpuDw.png' },
    { id: 'uno', name: 'IB 우노', icon: Layers, color: 'bg-rose-500', unlockXp: 0, description: '탑재 완료! 우리들만의 즐거운 신비 탐험 카드 게임!', bgImage: 'https://i.imgur.com/EJAPDgp.png' },
    { id: 'dobble', name: 'IB 도블', icon: Sparkles, color: 'bg-amber-500', unlockXp: 0, description: '권*훈 학생 기획! 눈보다 손이 활발해야 하는 스릴만점 카드 매칭!', bgImage: dobbleImage },
    { id: 'cuphalligalli', name: 'IB 컵 할리갈리', icon: Bell, color: 'bg-teal-500', unlockXp: 0, description: '반*아 학생 기획! 최고 인기를 달리는 정렬 조립 식기 대결!', bgImage: 'https://i.imgur.com/1KjXT1X.png' },
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
            selectedGame === 'dobble' || selectedGame === 'cuphalligalli' || selectedGame === 'uno'
              ? "max-w-6xl xl:max-w-[1300px] max-h-[92vh] aspect-auto min-h-[580px] md:min-h-[680px] lg:min-h-[720px]" 
              : "max-w-4xl xl:max-w-5xl max-h-[85vh]",
            isDrawingGame 
              ? "bg-transparent border-transparent shadow-none" 
              : "bg-gray-900 border-gray-800 rounded-[1.5rem] md:rounded-[2.5rem]",
            selectedGame === 'dobble' || selectedGame === 'cuphalligalli' || selectedGame === 'uno'
              ? ""
              : selectedGame === 'rhythm' || selectedGame === 'jenga' || selectedGame === 'halligalli' || selectedGame === 'ninja' 
                ? "aspect-[3/4] md:aspect-square" 
                : "aspect-[3/4] md:aspect-video"
          )}>
            {selectedGame === 'anipang' && <AnipangGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('anipang', score)} />}
            {selectedGame === 'galaga' && <GalagaGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('galaga', score)} />}
            {selectedGame === 'fruit' && <FruitMergeGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('fruit', score)} />}
            {selectedGame === 'store' && <StoreSortingGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('store', score)} />}
            {selectedGame === 'mario' && <MarioGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('mario', score)} />}
            {selectedGame === 'rhythm' && <RhythmTrainingGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('rhythm', score)} />}
            {selectedGame === 'drawing' && <DrawingGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('drawing', score)} />}
            {selectedGame === 'halligalli' && <HalliGalliGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('halligalli', score)} />}
            {selectedGame === 'jenga' && <JengaGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('jenga', score)} />}
            {selectedGame === 'ninja' && <NinjaGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('ninja', score)} />}
            {selectedGame === 'uno' && <UnoGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('uno', score)} />}
            {selectedGame === 'dobble' && <DobbleGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('dobble', score)} />}
            {selectedGame === 'cuphalligalli' && <CupHalliGalliGame soundEnabled={soundEnabled} onGameFinish={(score) => handleGameFinish('cuphalligalli', score)} />}

            {/* Ranking Modal Overlay inside the active game container */}
            {showRankingModal && (
              <div className="absolute inset-0 z-[100] bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4">
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-[2rem] p-6 max-w-sm w-full shadow-2xl border-4 border-indigo-400 relative flex flex-col items-center text-center font-sans"
                >
                  <div className="absolute -top-12 bg-amber-400 border-4 border-white p-3 rounded-full shadow-lg">
                    <Trophy className="w-8 h-8 text-white animate-bounce" />
                  </div>
                  
                  <h3 className="text-xl font-black text-slate-800 mt-6 mb-1">🏆 실시간 명예의 전당</h3>
                  <p className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full mb-4">
                    {games.find(g => g.id === selectedGame)?.name}
                  </p>

                  <div className="bg-slate-50 border border-slate-100 rounded-2xl p-3.5 w-full mb-5">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-0.5">방금 획득한 나의 점수</span>
                    <span className="text-2xl font-black text-indigo-600 font-mono">{lastSavedScore !== null ? lastSavedScore.toLocaleString() : 0}점</span>
                  </div>

                  <h4 className="text-xs font-black text-slate-400 text-left w-full mb-2 uppercase tracking-wider">Top 3 랭킹</h4>

                  {rankingLoading ? (
                    <div className="flex flex-col items-center justify-center py-6 gap-2 w-full">
                      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold text-slate-500">점수 기록 및 랭킹 갱신 중...</span>
                    </div>
                  ) : (
                    <div className="w-full space-y-2 mb-6">
                      {currentRankings.length === 0 ? (
                        <p className="text-xs font-semibold text-slate-400 py-4">아직 기록된 점수가 없습니다. 첫 번째 주인공이 되어보세요!</p>
                      ) : (
                        currentRankings.map((item, index) => {
                          const medalColors = [
                            'bg-amber-400 border-amber-300 text-white', // Gold
                            'bg-slate-300 border-slate-200 text-white', // Silver
                            'bg-amber-600 border-amber-500 text-white', // Bronze
                          ];
                          return (
                            <div 
                              key={item.id} 
                              className={cn(
                                "flex items-center justify-between p-2.5 rounded-xl border-2 transition-all",
                                item.uid === profile?.uid 
                                  ? "bg-indigo-50/50 border-indigo-200 shadow-sm" 
                                  : "bg-slate-50/50 border-slate-100"
                              )}
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <span className={cn(
                                  "w-6 h-6 rounded-full border-2 flex items-center justify-center text-xs font-black shrink-0 font-mono",
                                  medalColors[index] || "bg-slate-100 border-slate-200 text-slate-500"
                                )}>
                                  {index + 1}
                                </span>
                                <div className="text-left min-w-0">
                                  <span className="text-xs font-black text-slate-800 block truncate leading-tight">
                                    {item.userName}
                                  </span>
                                  <span className="text-[10px] font-bold text-slate-400 block leading-none mt-0.5">
                                    {item.grade}학년 {item.class}반
                                  </span>
                                </div>
                              </div>
                              <span className="text-xs font-black text-slate-700 font-mono">
                                {item.score.toLocaleString()}점
                              </span>
                            </div>
                          );
                        })
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 w-full mt-auto">
                    <Button 
                      variant="ghost" 
                      onClick={() => {
                        setShowRankingModal(false);
                        setSelectedGame(null);
                      }}
                      className="flex-1 py-2.5 border-2 border-slate-200 text-slate-600 hover:bg-slate-50 font-bold text-xs"
                    >
                      게임 목록
                    </Button>
                    <Button 
                      onClick={() => {
                        setShowRankingModal(false);
                        // To trigger hot reload/restart of the selected game, we can briefly clear and set it
                        const gameId = selectedGame;
                        setSelectedGame(null);
                        setTimeout(() => setSelectedGame(gameId), 50);
                      }}
                      className="flex-1 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md shadow-indigo-100"
                    >
                      다시 도전하기
                    </Button>
                  </div>
                </motion.div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen w-full p-4 py-8 space-y-8 bg-[#fbf9f6]">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="bg-white/95 backdrop-blur-md p-6 md:p-8 rounded-[2.5rem] shadow-xl border border-gray-100 text-center relative overflow-hidden">
        <div className="absolute top-0 right-0 p-4 opacity-5">
          <Gamepad2 className="w-32 h-32 text-indigo-600" />
        </div>
        <Button 
          variant="secondary" 
          onClick={() => setView('home')} 
          icon={ArrowLeft} 
          className="mb-4 bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
        >
          뒤로 가기
        </Button>
        <h2 className="text-3xl font-black text-gray-900 tracking-tight">IB 게임 코너</h2>
        <p className="text-gray-500 font-bold mt-1 text-sm">
          {isTeacher ? '선생님은 모든 게임을 자유롭게 체험하실 수 있습니다.' : '퀴즈를 풀고 얻은 티켓으로 게임을 즐겨보세요!'}
        </p>
        
        <div className="mt-4 inline-flex items-center gap-2.5 px-5 py-2.5 bg-indigo-50 rounded-2xl border border-indigo-100">
          <Trophy className="w-5 h-5 text-indigo-600" />
          <span className="font-black text-indigo-900 text-sm">
            {isTeacher ? '무제한 체험 모드' : `보유 티켓: ${tickets}개`}
          </span>
        </div>

        {/* 🎮 NEW GAME CATEGORY FILTER TABS */}
        <div className="flex flex-wrap justify-center gap-2 mt-6 pt-6 border-t border-gray-100">
          <button 
            onClick={() => setActiveFilter('all')}
            className={cn(
              "px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer",
              activeFilter === 'all' 
                ? "bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-100" 
                : "bg-white border-gray-200 text-gray-600 hover:border-indigo-300 hover:bg-gray-50"
            )}
          >
            전체 게임 ({games.length})
          </button>
          <button 
            onClick={() => setActiveFilter('student')}
            className={cn(
              "px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer",
              activeFilter === 'student' 
                ? "bg-amber-500 border-amber-500 text-white shadow-md shadow-amber-100" 
                : "bg-white border-gray-200 text-gray-600 hover:border-amber-300 hover:bg-gray-50"
            )}
          >
            ⭐️ 학생 기획 우수작
          </button>
          <button 
            onClick={() => setActiveFilter('free')}
            className={cn(
              "px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer",
              activeFilter === 'free' 
                ? "bg-emerald-500 border-emerald-500 text-white shadow-md shadow-emerald-100" 
                : "bg-white border-gray-200 text-gray-600 hover:border-emerald-300 hover:bg-gray-50"
            )}
          >
            🎁 티켓 프리패스 (무료)
          </button>
          <button 
            onClick={() => setActiveFilter('classic')}
            className={cn(
              "px-4 py-2 text-xs font-black rounded-full transition-all border cursor-pointer",
              activeFilter === 'classic' 
                ? "bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-100" 
                : "bg-white border-gray-200 text-gray-600 hover:border-blue-300 hover:bg-gray-50"
            )}
          >
            🕹️ 클래식 명작 코너
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {games
          .filter(game => {
            if (activeFilter === 'all') return true;
            if (activeFilter === 'student') {
              return game.id === 'dobble' || game.id === 'cuphalligalli' || game.id === 'jenga';
            }
            if (activeFilter === 'free') {
              return game.id === 'halligalli' || game.id === 'jenga' || game.id === 'ninja' || game.id === 'uno' || game.id === 'dobble' || game.id === 'cuphalligalli';
            }
            if (activeFilter === 'classic') {
              return ['anipang', 'galaga', 'fruit', 'store', 'mario', 'rhythm', 'drawing'].includes(game.id);
            }
            return true;
          })
          .map((game) => {
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
                  "cursor-pointer group relative h-[240px]",
                  isLocked && "cursor-not-allowed opacity-75"
                )}
              >
                <Card 
                  className={cn(
                    "p-5 h-full flex flex-col items-center justify-between text-center transition-all border-2 relative overflow-hidden bg-white",
                    isLocked ? "bg-gray-50 border-gray-200" : "hover:border-indigo-400 border-gray-100 shadow-sm hover:shadow-md"
                  )}
                  style={!isLocked ? { 
                    backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.75), rgba(255, 255, 255, 0.75)), url("${game.bgImage}")`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center'
                  } : {}}
                >
                  {isFreeTestGame && (
                    <div className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-sm animate-pulse tracking-wider flex items-center gap-0.5 z-10">
                      <Sparkles className="w-3 h-3" />
                      <span>무료</span>
                    </div>
                  )}
                  
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center mb-3 text-white shadow-md relative",
                    isLocked ? "bg-gray-400" : game.color
                  )}>
                    {isLocked ? <Lock className="w-7 h-7" /> : <game.icon className="w-7 h-7" />}
                  </div>
                  
                  <div className="flex-1 flex flex-col justify-center min-w-0 px-1">
                    <h3 className="text-sm font-black text-gray-900 mb-1 truncate">{game.name}</h3>
                    <p className="text-gray-400 text-[10px] font-bold line-clamp-2 leading-normal">{game.description}</p>
                  </div>
                  
                  <div className="mt-3 flex items-center gap-1 text-indigo-600 font-extrabold text-xs">
                    플레이하기 <ArrowLeft className="w-3.5 h-3.5 rotate-180" />
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

            <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">🎉 우노 · 도블 · 컵할리갈리 대공개 및 가동 완료!</h2>
            <p className="text-indigo-600 font-bold mb-6 text-sm bg-indigo-50 px-4 py-1.5 rounded-full inline-block">
              우리가 힘을 합쳐 개발한 고품격 보드게임 대개장 🌟
            </p>

            <div className="bg-gray-50 rounded-2xl p-4 md:p-6 mb-6 border border-gray-100 text-left space-y-3">
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  선생님과 학생들이 기획하고 완성한 <strong className="text-gray-900">IB 우노 🃏, IB 도블 🎨, IB 컵할리갈리 🥤</strong> 게임이 모두 성공적으로 탑재 및 연동 완료되었습니다! <strong className="text-emerald-600">티켓 제한 없이</strong> 신나게 플레이해 보세요!
                </p>
              </div>
              <div className="flex items-start gap-2.5">
                <span className="bg-emerald-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs font-black shrink-0 mt-0.5">✓</span>
                <p className="text-gray-700 font-medium text-sm leading-relaxed">
                  인공지능 대결과 카드 매칭을 마음껏 체험하면서 재미있는 복습과 소통의 장을 누리시고 <strong className="text-indigo-600">여러분의 소중한 의견</strong>도 언제든지 편하게 들려주세요.
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
