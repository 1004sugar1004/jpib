import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { quizQuestions } from '../../content';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';

export const MiniQuiz = ({ onCorrect, onWrong, onFail, soundEnabled, wrongCount = 0 }: { 
  onCorrect: () => void, 
  onWrong: () => void,
  onFail: () => void,
  soundEnabled: boolean,
  wrongCount: number
}) => {
  const question = useMemo(() => quizQuestions[Math.floor(Math.random() * quizQuestions.length)], []);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [showAnswer, setShowAnswer] = useState(false);

  const handleAnswer = (idx: number) => {
    if (selected !== null) return;
    setSelected(idx);
    const correct = idx === question.correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      setTimeout(onCorrect, 1000);
    } else {
      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.wrong);
        audio.volume = 0.3;
        audio.play().catch(() => {});
      }
      
      if (wrongCount === 0) {
        // First time: Show the answer and let them continue
        setShowAnswer(true);
        onWrong(); // Notify parent of first mistake
      } else {
        // Second time: Show reset message and then fail
        setIsCorrect(false);
        setTimeout(onFail, 2000);
      }
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md p-4 sm:p-8 bg-white shadow-2xl rounded-[2.5rem] border-4 border-indigo-100">
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-indigo-100 rounded-2xl md:rounded-3xl mb-2 md:mb-4 text-3xl md:text-4xl">
            {question.emoji || '❓'}
          </div>
          <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">{question.question}</h3>
          <p className="text-indigo-600 font-bold text-xs md:text-sm mt-1">정답을 맞히면 계속할 수 있습니다!</p>
        </div>
        
        <div className="space-y-2 md:space-y-3">
          {question.options.map((opt, idx) => (
            <button
              key={idx}
              onClick={() => handleAnswer(idx)}
              className={cn(
                "w-full p-3 md:p-4 rounded-xl md:rounded-2xl font-bold text-left transition-all border-2 text-sm md:text-base",
                selected === idx 
                  ? (idx === question.correctAnswer ? "bg-emerald-50 border-emerald-500 text-emerald-700" : "bg-red-50 border-red-500 text-red-700")
                  : (showAnswer && idx === question.correctAnswer ? "bg-emerald-50 border-emerald-500 text-emerald-700 animate-pulse" : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-white")
              )}
            >
              {opt}
            </button>
          ))}
        </div>

        {showAnswer && isCorrect !== false && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-2xl text-center"
          >
            <p className="text-amber-700 font-bold mb-3">아쉽네요! 정답은 <span className="text-emerald-600 underline">"{question.options[question.correctAnswer]}"</span> 입니다.</p>
            <button 
              onClick={onCorrect}
              className="px-6 py-2 bg-amber-500 hover:bg-amber-600 text-white font-black rounded-xl shadow-md transition-all"
            >
              알겠어요! 계속하기
            </button>
          </motion.div>
        )}

        {isCorrect === false && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            className="mt-6 p-6 bg-red-50 border-4 border-red-200 rounded-[2rem] text-center"
          >
            <p className="text-red-600 font-black text-2xl mb-2 animate-bounce">🚨 두 번 틀렸습니다! 🚨</p>
            <p className="text-red-500 font-bold text-lg">처음으로 돌아갑니다...</p>
          </motion.div>
        )}
      </Card>
    </motion.div>
  );
};
