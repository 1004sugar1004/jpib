import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ASSETS } from '../../assets';
import { 
  ArrowLeft, 
  Trophy, 
  AlertCircle, 
  Star,
  CheckCircle2,
  Flame,
  Timer,
  Target,
  ChevronRight,
  Sparkles,
  XCircle,
  Play,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { quizQuestions, QuizQuestion } from '../../content';
import confetti from 'canvas-confetti';

import { UserProfile } from '../../types';

interface QuizViewProps {
  profile: UserProfile | null;
  questions: QuizQuestion[];
  title: string;
  onFinish: (score: number, maxStreak: number, correctCount: number, totalCount: number, duration: number) => Promise<void>;
  onClose: () => void;
  soundEnabled: boolean;
}

export const QuizView = ({ profile, questions, title, onFinish, onClose, soundEnabled }: QuizViewProps) => {
  const shuffledQuestions = useMemo(() => {
    return [...questions].sort(() => Math.random() - 0.5).slice(0, 10);
  }, [questions]);

  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [quizScore, setQuizScore] = useState(0);
  const [correctCount, setCorrectCount] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);
  const [selectedOption, setSelectedOption] = useState<number | string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(15);
  const [streak, setStreak] = useState(0);
  const [maxStreak, setMaxStreak] = useState(0);
  const [xpPopups, setXpPopups] = useState<{ id: number; x: number; y: number; amount: number }[]>([]);
  const [subjectiveInput, setSubjectiveInput] = useState('');
  const [isAudioPlaying, setIsAudioPlaying] = useState(false);
  const [volume, setVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const audioTimerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  const currentQuestion = shuffledQuestions[currentQuestionIdx];

  const stopAudio = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      setIsAudioPlaying(false);
    }
    if (audioTimerRef.current) {
      clearTimeout(audioTimerRef.current);
      audioTimerRef.current = null;
    }
  };

  const playAudio = () => {
    if (currentQuestion.audioUrl && !selectedOption && !quizFinished) {
      stopAudio();
      
      const audio = new Audio(currentQuestion.audioUrl);
      audio.currentTime = currentQuestion.startTime || 0;
      audio.volume = volume;
      audioRef.current = audio;
      
      setIsAudioPlaying(true);
      audio.play().catch(e => {
        console.log('Audio play error:', e);
        setIsAudioPlaying(false);
      });

      // Stop after 10 seconds
      audioTimerRef.current = setTimeout(() => {
        stopAudio();
      }, 10000);

      audio.onended = () => setIsAudioPlaying(false);
      audio.onpause = () => setIsAudioPlaying(false);
    }
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  // Audio Snippet Effect
  useEffect(() => {
    playAudio();
    return () => {
      stopAudio();
    };
  }, [currentQuestionIdx, quizFinished, selectedOption]);

  // Timer Effect
  useEffect(() => {
    if (!quizFinished && selectedOption === null && timeLeft > 0) {
      const timer = setInterval(() => setTimeLeft(prev => prev - 1), 1000);
      return () => clearInterval(timer);
    } else if (timeLeft === 0 && selectedOption === null) {
      handleAnswer(-1); // Time out
    }
  }, [quizFinished, selectedOption, timeLeft]);

  const handleAnswer = (answer: number | string) => {
    if (selectedOption !== null) return;
    setSelectedOption(answer);

    if (audioRef.current) {
      audioRef.current.pause();
    }

    let correct = false;
    if (typeof answer === 'number') {
      correct = answer === currentQuestion.correctAnswer;
    } else {
      // Subjective check (case insensitive, trim)
      const normalizedInput = String(answer).trim().toLowerCase();
      const normalizedCorrect = String(currentQuestion.correctAnswer).trim().toLowerCase();
      correct = normalizedInput === normalizedCorrect;
    }

    setIsCorrect(correct);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      if (soundEnabled) {
        const audio = new Audio(ASSETS.sounds.correct);
        audio.volume = 0.5;
        audio.play().catch(e => console.log('Sound play error:', e));
      }
      const newStreak = streak + 1;
      setStreak(newStreak);
      setMaxStreak(prev => Math.max(prev, newStreak));
      
      // Bonus points for streak and speed
      const timeBonus = Math.floor(timeLeft / 2);
      const streakBonus = Math.floor(newStreak * 5);
      const points = 50 + timeBonus + streakBonus;
      setQuizScore(prev => prev + points);

      // XP Popup
      const id = Date.now();
      setXpPopups(prev => [...prev, { id, x: Math.random() * 100 - 50, y: -50, amount: points }]);
      setTimeout(() => setXpPopups(prev => prev.filter(p => p.id !== id)), 1000);
      
      if (newStreak >= 3) {
        confetti({
          particleCount: 50,
          spread: 60,
          origin: { y: 0.7 },
          colors: ['#10b981', '#3b82f6', '#f59e0b']
        });
      }
    } else {
      setStreak(0);
    }
  };

  const nextQuestion = () => {
    if (currentQuestionIdx < shuffledQuestions.length - 1) {
      setCurrentQuestionIdx(prev => prev + 1);
      setSelectedOption(null);
      setIsCorrect(null);
      setTimeLeft(15);
      setSubjectiveInput('');
    } else {
      finishQuiz();
    }
  };

  const finishQuiz = async () => {
    if (quizFinished) return;
    setQuizFinished(true);
    const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
    confetti({
      particleCount: 150,
      spread: 70,
      origin: { y: 0.6 }
    });
    
    await onFinish(quizScore, maxStreak, correctCount, shuffledQuestions.length, duration);
  };

  const mascotImg = isCorrect === true 
    ? "https://i.imgur.com/v7KIyBI.png" // Happy
    : isCorrect === false 
    ? "https://i.imgur.com/8pKDYvD.png" // Thinking/Sad
    : "https://i.imgur.com/8pKDYvD.png"; // Normal

  if (quizFinished) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <motion.div 
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="bg-white/90 backdrop-blur-md p-12 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden border border-white/20"
        >
          <div className="absolute -top-10 -left-10 w-40 h-40 bg-yellow-100/50 rounded-full blur-3xl" />
          <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-indigo-100/50 rounded-full blur-3xl" />
          
          <div className="relative z-10">
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="mb-6"
            >
              <img src="https://i.imgur.com/sEqw0FL.png" alt="Success" className="w-40 h-40 mx-auto drop-shadow-2xl animate-bounce" referrerPolicy="no-referrer" />
            </motion.div>
            
            <h2 className="text-4xl font-black mb-2 text-gray-900">탐험 성공!</h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest">MISSION COMPLETE</p>
            
            <div className="grid grid-cols-3 gap-4 mb-8">
              <div className="bg-indigo-50 p-4 rounded-3xl border border-indigo-100 shadow-sm">
                <p className="text-[10px] font-bold text-indigo-400 mb-1 uppercase tracking-tighter">획득 XP</p>
                <p className="text-2xl font-black text-indigo-600">+{quizScore}</p>
              </div>
              <div className="bg-orange-50 p-4 rounded-3xl border border-orange-100 shadow-sm">
                <p className="text-[10px] font-bold text-orange-400 mb-1 uppercase tracking-tighter">최대 콤보</p>
                <p className="text-2xl font-black text-orange-600">{maxStreak}</p>
              </div>
              <div className="bg-pink-50 p-4 rounded-3xl border border-pink-100 shadow-sm">
                <p className="text-[10px] font-bold text-pink-400 mb-1 uppercase tracking-tighter">게임 티켓</p>
                <p className="text-2xl font-black text-pink-600">+{Math.floor((correctCount / 10) * 3)}</p>
              </div>
            </div>
            
            <Button onClick={onClose} className="w-full py-5 text-xl shadow-indigo-200" icon={ArrowLeft}>
              기지로 돌아가기
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 py-12 relative">
      {/* Decorative Background Elements */}
      <motion.img 
        src="https://i.imgur.com/B5lPhZj.png" 
        className="fixed top-20 left-10 w-32 h-32 opacity-10 -z-10"
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 30, ease: "linear" }}
        referrerPolicy="no-referrer"
      />
      <motion.img 
        src="https://i.imgur.com/LsNAIca.png" 
        className="fixed bottom-20 right-10 w-24 h-24 opacity-10 -z-10"
        animate={{ y: [0, -20, 0] }}
        transition={{ repeat: Infinity, duration: 5 }}
        referrerPolicy="no-referrer"
      />

      <header className="mb-10 bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-50/50 rounded-full blur-2xl -mr-10 -mt-10" />
        
        <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={onClose} icon={ArrowLeft} className="px-3 py-1.5 text-sm h-10 hover:bg-red-50 hover:text-red-500">
              그만두기
            </Button>
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-indigo-600 text-white rounded-2xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-200">
                {currentQuestionIdx + 1}
              </div>
            <div className="hidden sm:block">
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{title}</p>
              <p className="text-lg font-bold text-gray-900">탐구 질문 {currentQuestionIdx + 1} / {shuffledQuestions.length}</p>
            </div>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <AnimatePresence mode="wait">
              {streak >= 2 && (
                <motion.div 
                  key="streak"
                  initial={{ scale: 0, rotate: -20 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0 }}
                  className="flex items-center gap-2 bg-gradient-to-r from-orange-500 to-red-500 text-white px-4 py-2 rounded-2xl font-black text-sm shadow-lg shadow-orange-200"
                >
                  <Flame className="w-5 h-5 fill-current animate-pulse" />
                  {streak} COMBO!
                </motion.div>
              )}
            </AnimatePresence>
            
            <div className={cn(
              "flex items-center gap-2 px-5 py-2.5 rounded-2xl font-black transition-all shadow-sm",
              timeLeft <= 5 ? "bg-red-500 text-white shadow-red-200" : "bg-gray-100 text-gray-600"
            )}>
              <Timer className={cn("w-5 h-5", timeLeft <= 5 && "animate-bounce")} />
              <span className="tabular-nums text-lg">{timeLeft}s</span>
            </div>
          </div>
        </div>
        
        <div className="mt-6 h-4 bg-gray-100 rounded-full overflow-hidden border border-gray-50 p-1">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full relative"
            initial={{ width: 0 }}
            animate={{ width: `${((currentQuestionIdx + 1) / shuffledQuestions.length) * 100}%` }}
          >
            <div className="absolute right-0 top-1/2 -translate-y-1/2 w-2 h-2 bg-white rounded-full shadow-sm" />
          </motion.div>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        {/* Mascot Area */}
        <div className="hidden lg:flex flex-col items-center gap-4 sticky top-12">
          <motion.div
            key={mascotImg}
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-48 h-48 bg-white/50 backdrop-blur-sm rounded-[3rem] p-6 border border-white/20 shadow-xl flex items-center justify-center"
          >
            <img src={mascotImg} alt="Mascot" className="w-full h-full object-contain drop-shadow-lg" referrerPolicy="no-referrer" />
          </motion.div>
          <div className="bg-indigo-600 text-white px-6 py-3 rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 text-center">
            {isCorrect === true ? "대단해요! 정답이에요!" : isCorrect === false ? "음... 다시 생각해볼까요?" : "문제를 잘 읽어보세요!"}
          </div>
        </div>

        <div className="lg:col-span-3 min-h-[650px] relative">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestionIdx}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="p-10 mb-8 border-b-8 border-b-indigo-100 shadow-2xl relative overflow-hidden bg-white min-h-[420px] flex flex-col justify-center">
                <div className="absolute top-0 right-0 p-4 opacity-5">
                  <Target className="w-48 h-48" />
                </div>
                <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-indigo-50 rounded-full opacity-50 blur-3xl" />
                
                <div className="relative z-10">
                  <div className="flex items-center gap-4 mb-8">
                    <span className="text-5xl animate-pulse">{currentQuestion.emoji}</span>
                    <span className="px-3 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-black uppercase tracking-widest">IB KNOWLEDGE QUEST</span>
                  </div>
                  <h3 className="text-3xl font-black text-gray-900 mb-6 leading-tight">
                    {currentQuestion.question}
                  </h3>
                  
                  {currentQuestion.audioUrl && (
                    <div className="mb-8 p-6 bg-indigo-50/50 rounded-3xl border border-indigo-100/50 flex flex-col gap-4">
                      <div className="flex items-center gap-4">
                        <Button 
                          onClick={() => isAudioPlaying ? stopAudio() : playAudio()} 
                          disabled={selectedOption !== null}
                          variant="primary"
                          className={cn(
                            "rounded-2xl px-6 py-3 flex items-center gap-2 transition-all",
                            isAudioPlaying ? "bg-red-500 hover:bg-red-600" : "bg-indigo-600 hover:bg-indigo-700"
                          )}
                        >
                          {isAudioPlaying ? (
                            <>
                              <Pause className="w-5 h-5 fill-current" />
                              <span className="font-black text-sm">멈춤</span>
                            </>
                          ) : (
                            <>
                              <Play className="w-5 h-5 fill-current" />
                              <span className="font-black text-sm">다시 듣기</span>
                            </>
                          )}
                          
                          {isAudioPlaying && (
                            <div className="flex gap-1 items-end h-4 ml-2">
                              {[1, 2, 3, 4].map((i) => (
                                <motion.div
                                  key={i}
                                  className="w-1 bg-white rounded-full"
                                  animate={{ height: [4, 12, 4] }}
                                  transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                                />
                              ))}
                            </div>
                          )}
                        </Button>

                        <div className="flex-1 flex items-center gap-3 bg-white/50 p-3 rounded-2xl border border-indigo-100/30">
                          {volume === 0 ? <VolumeX className="w-5 h-5 text-indigo-400" /> : <Volume2 className="w-5 h-5 text-indigo-600" />}
                          <input 
                            type="range" 
                            min="0" 
                            max="1" 
                            step="0.01" 
                            value={volume} 
                            onChange={handleVolumeChange}
                            className="flex-1 h-2 bg-indigo-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                          />
                          <span className="text-[10px] font-black text-indigo-600 w-8">{Math.round(volume * 100)}%</span>
                        </div>
                      </div>
                      
                      {isAudioPlaying && (
                        <div className="text-[10px] font-bold text-indigo-400 animate-pulse flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          가사를 잘 들어보세요! (최대 10초 재생)
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 gap-4">
                    {currentQuestion.type === 'subjective' ? (
                      <div className="space-y-4">
                        <input
                          type="text"
                          value={subjectiveInput}
                          onChange={(e) => setSubjectiveInput(e.target.value)}
                          disabled={selectedOption !== null}
                          placeholder="정답을 입력하세요..."
                          className={cn(
                            "w-full p-6 rounded-[2rem] font-bold transition-all border-4 text-xl outline-none",
                            selectedOption === null ? "border-gray-100 bg-white focus:border-indigo-400" :
                            isCorrect ? "border-emerald-500 bg-emerald-50 text-emerald-700" :
                            "border-red-500 bg-red-50 text-red-700"
                          )}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' && selectedOption === null) {
                              handleAnswer(subjectiveInput);
                            }
                          }}
                        />
                        {selectedOption === null && (
                          <Button 
                            onClick={() => handleAnswer(subjectiveInput)}
                            className="w-full py-4 text-lg bg-indigo-600"
                            disabled={subjectiveInput.trim() === ''}
                          >
                            정답 확인
                          </Button>
                        )}
                      </div>
                    ) : (
                      currentQuestion.options?.map((option, idx) => (
                        <motion.button
                          key={idx}
                          whileHover={selectedOption === null ? { scale: 1.02, x: 10 } : {}}
                          whileTap={selectedOption === null ? { scale: 0.98 } : {}}
                          onClick={() => handleAnswer(idx)}
                          disabled={selectedOption !== null}
                          className={cn(
                            "w-full p-6 rounded-[2rem] text-left font-bold transition-all border-2 text-lg flex items-center justify-between group relative shadow-sm",
                            selectedOption === null ? "border-gray-100 bg-white hover:border-indigo-400 hover:shadow-2xl hover:shadow-indigo-50" : 
                            idx === currentQuestion.correctAnswer ? "border-emerald-500 bg-emerald-50 text-emerald-700 shadow-lg shadow-emerald-50" :
                            selectedOption === idx ? "border-red-500 bg-red-50 text-red-700" : "border-gray-100 opacity-50"
                          )}
                        >
                          <div className="flex items-center gap-5">
                            <div className={cn(
                              "w-10 h-10 rounded-2xl flex items-center justify-center text-lg font-black transition-all",
                              selectedOption === null ? "bg-gray-100 text-gray-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:rotate-12" :
                              idx === currentQuestion.correctAnswer ? "bg-emerald-500 text-white rotate-12" :
                              selectedOption === idx ? "bg-red-500 text-white" : "bg-gray-100 text-gray-400"
                            )}>
                              {String.fromCharCode(65 + idx)}
                            </div>
                            <span className="text-xl">{option}</span>
                          </div>
                          
                          {/* XP Popups */}
                          <AnimatePresence>
                            {selectedOption === idx && isCorrect && xpPopups.map(popup => (
                              <motion.div
                                key={popup.id}
                                initial={{ opacity: 0, y: 0 }}
                                animate={{ opacity: 1, y: -80 }}
                                exit={{ opacity: 0 }}
                                className="absolute right-12 top-0 text-3xl font-black text-emerald-500 pointer-events-none drop-shadow-sm"
                              >
                                +{popup.amount} XP
                              </motion.div>
                            ))}
                          </AnimatePresence>

                          {selectedOption !== null && idx === currentQuestion.correctAnswer && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                              <CheckCircle2 className="w-8 h-8 text-emerald-500" />
                            </motion.div>
                          )}
                          {selectedOption === idx && idx !== currentQuestion.correctAnswer && (
                            <motion.div initial={{ scale: 0 }} animate={{ scale: 1.2 }}>
                              <XCircle className="w-8 h-8 text-red-500" />
                            </motion.div>
                          )}
                        </motion.button>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          </AnimatePresence>

          <div className="min-h-[220px]">
            <AnimatePresence mode="wait">
              {selectedOption !== null && (
                <motion.div 
                  key="feedback"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  <div className={cn(
                    "p-8 rounded-[2.5rem] border-2 shadow-2xl bg-white relative overflow-hidden",
                    isCorrect ? "border-emerald-100 text-emerald-900" : "border-red-100 text-red-900"
                  )}>
                    <div className={cn("absolute top-0 left-0 w-2 h-full", isCorrect ? "bg-emerald-500" : "bg-red-500")} />
                    <div className="flex items-center gap-4 mb-4">
                      <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg", isCorrect ? "bg-emerald-100 text-emerald-600" : "bg-red-100 text-red-600")}>
                        {isCorrect ? <Sparkles className="w-7 h-7" /> : <AlertCircle className="w-7 h-7" />}
                      </div>
                      <div>
                        <p className="font-black text-2xl">{isCorrect ? "완벽해요! 정답입니다!" : "아쉬워요! 정답을 확인해보세요."}</p>
                        <p className="text-sm font-bold opacity-60 uppercase tracking-widest">EXPLORER FEEDBACK</p>
                      </div>
                    </div>
                    <p className="font-bold text-lg leading-relaxed bg-gray-50/50 p-6 rounded-3xl border border-gray-100">
                      {currentQuestion.explanation}
                    </p>
                    {!isCorrect && currentQuestion.type === 'subjective' && (
                      <div className="mt-4 p-4 bg-emerald-50 rounded-2xl border border-emerald-100">
                        <p className="text-emerald-800 font-black text-center">
                          정답: <span className="text-2xl">{currentQuestion.correctAnswer}</span>
                        </p>
                      </div>
                    )}
                  </div>
                  
                  <Button onClick={nextQuestion} className="w-full py-6 text-2xl shadow-2xl bg-indigo-600 hover:bg-indigo-700" variant="primary" icon={ChevronRight}>
                    {currentQuestionIdx === shuffledQuestions.length - 1 ? "최종 결과 확인" : "다음 스테이지로"}
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
};
