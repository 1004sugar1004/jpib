import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../assets';
import { 
  ArrowLeft, 
  Sparkles, 
  Star, 
  UserCircle, 
  Globe, 
  Compass, 
  Zap, 
  Trophy,
  Brain
} from 'lucide-react';
import { ibLearnerProfile, ibThemes, ibKeyConcepts, ibATL } from '../../content';
import confetti from 'canvas-confetti';

interface FlashcardViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games' | 'memory') => void;
  onEarnXP: (xp: number) => void;
  soundEnabled: boolean;
}

export const FlashcardView = ({ setView, onEarnXP, soundEnabled }: FlashcardViewProps) => {
  const categories = [
    { id: 'learner', name: '학습자상', data: ibLearnerProfile, icon: UserCircle, color: 'bg-indigo-500' },
    { id: 'themes', name: '초학문적 주제', data: ibThemes, icon: Globe, color: 'bg-emerald-500' },
    { id: 'concepts', name: '핵심 개념', data: ibKeyConcepts, icon: Compass, color: 'bg-amber-500' },
    { id: 'atl', name: 'ATL 기술', data: ibATL, icon: Zap, color: 'bg-rose-500' },
  ];

  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [hasFlipped, setHasFlipped] = useState(false);
  const [learnedCount, setLearnedCount] = useState(0);
  const [showCompletion, setShowCompletion] = useState(false);

  const currentData = categories.find(c => c.id === selectedCategory)?.data || [];
  const currentCard = currentData[currentIndex];

  const handleFlip = () => {
    const nextFlipped = !isFlipped;
    setIsFlipped(nextFlipped);
    if (nextFlipped) setHasFlipped(true);
  };

  const handleNext = () => {
    if (showCompletion) return;
    if (!hasFlipped) return;

    if (currentIndex < currentData.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setIsFlipped(false);
      setHasFlipped(false);
      setLearnedCount(prev => prev + 1);
      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
    } else {
      setShowCompletion(true);
      onEarnXP(150); // Reward for completing a set
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });
    }
  };

  const handleBack = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setIsFlipped(false);
      setHasFlipped(true); // Already seen if going back
    }
  };

  if (!selectedCategory) {
    return (
      <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
        <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
          <div className="absolute -top-10 -right-10 opacity-5">
            <Sparkles className="w-40 h-40" />
          </div>
          <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
          <h2 className="text-3xl font-black text-gray-900">플래시카드 탐험</h2>
          <p className="text-gray-500 font-bold mb-4">카드를 뒤집으며 IB 이론을 마스터해보세요!</p>
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-50 rounded-full border border-indigo-100">
            <Star className="w-4 h-4 text-indigo-600 fill-indigo-600" />
            <span className="text-sm font-black text-indigo-900">한 세트 완료 시 150 XP 획득!</span>
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {categories.map((cat) => (
            <motion.div
              key={cat.id}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                setSelectedCategory(cat.id);
                setCurrentIndex(0);
                setIsFlipped(false);
                setLearnedCount(0);
                setShowCompletion(false);
              }}
              className="cursor-pointer group"
            >
              <Card className="p-8 h-full flex flex-col items-center text-center group-hover:border-indigo-200 transition-all relative overflow-hidden">
                <div className="absolute top-4 right-4">
                  <div className="flex items-center gap-1 px-2 py-1 bg-indigo-50 rounded-lg text-[10px] font-black text-indigo-600 border border-indigo-100">
                    <Star className="w-3 h-3 fill-indigo-600" />
                    150 XP
                  </div>
                </div>
                <div className={cn("w-20 h-20 rounded-3xl flex items-center justify-center mb-6 text-white shadow-lg", cat.color)}>
                  <cat.icon className="w-10 h-10" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">{cat.name}</h3>
                <p className="text-gray-500 text-sm">{cat.data.length}개의 카드</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 py-8 space-y-8 min-h-[80vh] flex flex-col">
      <header className="flex items-center justify-between">
        <Button variant="ghost" onClick={() => setSelectedCategory(null)} icon={ArrowLeft}>목록으로</Button>
        <div className="px-4 py-2 bg-white/80 backdrop-blur-md rounded-full border border-white/20 shadow-sm font-black text-indigo-600">
          {currentIndex + 1} / {currentData.length}
        </div>
      </header>

      {showCompletion ? (
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex-1 flex flex-col items-center justify-center text-center space-y-6"
        >
          <div className="w-32 h-32 bg-yellow-100 rounded-[2.5rem] flex items-center justify-center shadow-xl shadow-yellow-100/50">
            <Trophy className="w-16 h-16 text-yellow-600" />
          </div>
          <h2 className="text-3xl font-black text-gray-900">탐험 완료!</h2>
          <p className="text-gray-600 font-bold">
            {categories.find(c => c.id === selectedCategory)?.name} 마스터!<br />
            <span className="text-indigo-600">+150 XP를 획득했습니다.</span>
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full max-w-md">
            <Button 
              onClick={() => setView('memory')} 
              className="flex-1 py-4 text-lg bg-indigo-600 hover:bg-indigo-700"
              icon={Brain}
            >
              기억력 게임으로 복습
            </Button>
            <Button 
              variant="outline"
              onClick={() => setSelectedCategory(null)} 
              className="flex-1 py-4 text-lg"
            >
              다른 주제 탐험
            </Button>
          </div>
        </motion.div>
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center space-y-12">
          <div 
            className="relative w-full aspect-[3/4] max-w-sm perspective-1000 cursor-pointer group"
            onClick={handleFlip}
          >
            <motion.div
              animate={{ rotateY: isFlipped ? 180 : 0 }}
              transition={{ type: "spring", stiffness: 260, damping: 20 }}
              className="w-full h-full relative preserve-3d"
            >
              {/* Front */}
              <div className="absolute inset-0 backface-hidden">
                <Card className="w-full h-full p-12 flex flex-col items-center justify-center text-center space-y-8 border-4 border-indigo-50 overflow-visible">
                  {currentCard.image && (
                    <div className="w-40 h-40 bg-gray-50 rounded-3xl p-4 shadow-inner">
                      <img src={currentCard.image} alt={currentCard.title} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <h3 className="text-3xl font-black text-gray-900 leading-tight">{currentCard.title}</h3>
                  <div className="flex flex-col items-center gap-2">
                    <p className="text-gray-400 font-bold animate-pulse">카드를 터치해서 확인하세요</p>
                    <div className="w-12 h-1 bg-indigo-100 rounded-full" />
                  </div>
                </Card>
              </div>

              {/* Back */}
              <div className="absolute inset-0 backface-hidden rotate-y-180">
                <Card className="w-full h-full p-10 flex flex-col items-center justify-center text-center space-y-6 bg-indigo-600 text-white border-4 border-white/20 overflow-visible">
                  {/* Pair: Image + Description */}
                  {currentCard.image && (
                    <div className="w-24 h-24 bg-white/10 rounded-2xl p-3 border border-white/20">
                      <img src={currentCard.image} alt={currentCard.title} className="w-full h-full object-contain brightness-0 invert" referrerPolicy="no-referrer" />
                    </div>
                  )}
                  <div className="space-y-2">
                    <h4 className="text-sm font-black opacity-60 uppercase tracking-widest">설명</h4>
                    <p className="text-2xl font-bold leading-relaxed">{currentCard.description}</p>
                  </div>
                  {currentCard.details && currentCard.details.length > 0 && (
                    <div className="pt-6 border-t border-white/20 w-full">
                      <p className="text-xs font-black opacity-60 mb-2 uppercase tracking-widest">실천 예시</p>
                      <p className="text-sm opacity-90 italic font-medium">"{currentCard.details[0]}"</p>
                    </div>
                  )}
                </Card>
              </div>
            </motion.div>
          </div>

          <div className="flex flex-col items-center gap-4 w-full max-w-sm">
            {!hasFlipped && (
              <motion.p 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-indigo-600 font-black text-sm bg-indigo-50 px-4 py-2 rounded-full border border-indigo-100"
              >
                💡 카드를 뒤집어서 내용을 확인해주세요!
              </motion.p>
            )}
            <div className="flex items-center gap-6 w-full">
              <Button 
                variant="outline" 
                onClick={() => handleBack()} 
                disabled={currentIndex === 0}
                className="flex-1 py-4"
              >
                이전
              </Button>
              <Button 
                onClick={() => handleNext()} 
                disabled={!hasFlipped}
                className={cn(
                  "flex-[2] py-4 text-lg transition-all",
                  !hasFlipped ? "opacity-50 grayscale" : "shadow-lg shadow-indigo-200"
                )}
              >
                {currentIndex === currentData.length - 1 ? '완료하기' : '다음 카드'}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
