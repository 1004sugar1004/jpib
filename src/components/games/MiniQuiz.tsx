import React, { useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { quizQuestions } from '../../content';
import { ASSETS } from '../../assets';
import { cn } from '../../lib/utils';

export const MiniQuiz = ({ onCorrect, soundEnabled }: { onCorrect: () => void, soundEnabled: boolean }) => {
  const question = useMemo(() => quizQuestions[Math.floor(Math.random() * quizQuestions.length)], []);
  const [selected, setSelected] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

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
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/60 backdrop-blur-sm"
    >
      <Card className="w-full max-w-md p-4 sm:p-8 bg-white shadow-2xl rounded-[2rem] md:rounded-[2.5rem] border-4 border-indigo-100">
        <div className="text-center mb-4 md:mb-6">
          <div className="inline-flex items-center justify-center w-12 h-12 md:w-16 md:h-16 bg-indigo-100 rounded-2xl md:rounded-3xl mb-2 md:mb-4 text-3xl md:text-4xl">
            {question.emoji || '❓'}
          </div>
          <h3 className="text-lg md:text-xl font-black text-gray-900 leading-tight">{question.question}</h3>
          <p className="text-indigo-600 font-bold text-xs md:text-sm mt-1 md:text-2xl">정답을 맞히면 턴이 충전됩니다!</p>
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
                  : "bg-gray-50 border-gray-100 hover:border-indigo-300 hover:bg-white"
              )}
            >
              {opt}
            </button>
          ))}
        </div>
        {isCorrect === false && (
          <p className="text-red-500 text-center font-bold mt-4 animate-bounce">다시 생각해보세요! 🤔</p>
        )}
      </Card>
    </motion.div>
  );
};
