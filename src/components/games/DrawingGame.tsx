import React, { useState, useRef, useEffect, useCallback } from "react";
import { Pencil, RotateCcw, Trophy, Check, X, Eraser, Sparkles, Brain } from "lucide-react";
import { Button } from "../ui/Button";
import { quizQuestions } from "../../content";
import { cn } from "../../lib/utils";
import { motion, AnimatePresence } from "motion/react";
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

const WORDS = [
  "사과","고양이","강아지","집","나무","자동차","꽃","물고기","새","달","해","별","책","안경","모자",
  "피자","케이크","아이스크림","로켓","비행기","배","자전거","컵","전화기","하트","손","눈","발","코","귀",
  "공","우산","시계","신발","가방","나비","개구리","토끼","곰","코끼리"
];

const ROUND_COUNT = 6;
const DRAW_TIME = 10;
const API_INTERVAL = 3000;

function pickWords() {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUND_COUNT);
}

export const DrawingGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [phase, setPhase] = useState<"intro" | "countdown" | "drawing" | "roundResult" | "ibQuiz" | "final">("intro");
  const [words, setWords] = useState(pickWords());
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(DRAW_TIME);
  const [countdown, setCountdown] = useState(3);
  const [aiGuesses, setAiGuesses] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  const [ibQuiz, setIbQuiz] = useState<any>(null);
  const [quizFeedback, setQuizFeedback] = useState<"correct" | "wrong" | null>(null);

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawingRef = useRef(false);
  const lastPos = useRef<{ x: number, y: number } | null>(null);
  const timerRef = useRef<any>(null);
  const apiTimerRef = useRef<any>(null);
  const matchedRef = useRef(false);
  const roundRef = useRef(0);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(apiTimerRef.current);
    };
  }, []);

  const getPos = (e: any, canvas: HTMLCanvasElement) => {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const src = e.touches ? e.touches[0] : e;
    return {
      x: (src.clientX - rect.left) * scaleX,
      y: (src.clientY - rect.top) * scaleY,
    };
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
  };

  const startDrawing = (e: any) => {
    e.preventDefault();
    drawingRef.current = true;
    if (canvasRef.current) {
        lastPos.current = getPos(e, canvasRef.current);
    }
    setIsDrawing(true);
  };

  const draw = (e: any) => {
    e.preventDefault();
    if (!drawingRef.current || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const pos = getPos(e, canvas);
    ctx.beginPath();
    if (lastPos.current) {
        ctx.moveTo(lastPos.current.x, lastPos.current.y);
    }
    ctx.lineTo(pos.x, pos.y);
    ctx.strokeStyle = "#4f46e5";
    ctx.lineWidth = 6;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    setIsDrawing(false);
  };

  const checkDrawingWithAI = useCallback(async () => {
    if (matchedRef.current) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    const hasDrawn = pixelBuffer.some(color => color !== 0);
    if (!hasDrawn) return;

    const imageData = canvas.toDataURL("image/png").split(",")[1];
    const currentWord = words[roundRef.current];

    setAiThinking(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            { text: `Target word: "${currentWord}". Does this sketch represent "${currentWord}"? Be generous, it's a quick sketch.` },
            { inlineData: { mimeType: "image/png", data: imageData } }
        ],
        config: {
          systemInstruction: "You are a playful drawing recognition AI for a quick sketch guessing game. Analyze the human's hand-drawn sketch.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              guesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Top 3 things this drawing looks like, in Korean."
              },
              matched: {
                type: Type.BOOLEAN,
                description: "True if the drawing is a reasonable representation of the target word."
              }
            },
            required: ["guesses", "matched"]
          }
        }
      });

      const text = response.text;
      
      if (text) {
        const parsed = JSON.parse(text);
        setAiGuesses(parsed.guesses || []);
        
        if (parsed.matched && !matchedRef.current) {
          matchedRef.current = true;
          setMatched(true);
          clearInterval(timerRef.current);
          clearInterval(apiTimerRef.current);
          if (soundEnabled) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
              audio.volume = 0.2;
              audio.play().catch(() => {});
          }
          setTimeout(() => finishRound(true, parsed.guesses), 1500);
        }
      }
    } catch (err) {
      console.error("AI check failed:", err);
    } finally {
      setAiThinking(false);
    }
  }, [words, soundEnabled]);

  const finishRound = useCallback((success: boolean, guesses: string[]) => {
    clearInterval(timerRef.current);
    clearInterval(apiTimerRef.current);
    
    const canvas = canvasRef.current;
    const imgData = canvas ? canvas.toDataURL("image/png") : null;
    
    setRoundResults(prev => [...prev, {
      word: words[roundRef.current],
      success,
      image: imgData,
      guesses: guesses || [],
    }]);
    setPhase("roundResult");
  }, [words]);

  const startRound = useCallback(() => {
    setAiGuesses([]);
    setMatched(false);
    matchedRef.current = false;
    setAiThinking(false);
    setCountdown(3);
    setPhase("countdown");

    let c = 3;
    const cdInterval = setInterval(() => {
      c--;
      setCountdown(c);
      if (c <= 0) {
        clearInterval(cdInterval);
        setPhase("drawing");
        setTimeLeft(DRAW_TIME);
        
        setTimeout(clearCanvas, 50);

        let t = DRAW_TIME;
        timerRef.current = setInterval(() => {
          t--;
          setTimeLeft(t);
          if (t <= 0) {
            if (!matchedRef.current) finishRound(false, []);
          }
        }, 1000);

        setTimeout(() => {
          if (!matchedRef.current) checkDrawingWithAI();
        }, 1500);
        
        apiTimerRef.current = setInterval(() => {
          if (!matchedRef.current) checkDrawingWithAI();
        }, API_INTERVAL);
      }
    }, 1000);
  }, [checkDrawingWithAI, finishRound]);

  const handleIBQuiz = () => {
    const randomQuestion = quizQuestions[Math.floor(Math.random() * quizQuestions.length)];
    setIbQuiz(randomQuestion);
    setQuizFeedback(null);
    setPhase("ibQuiz");
  };

  const handleQuizAnswer = (isCorrect: boolean) => {
    setQuizFeedback(isCorrect ? "correct" : "wrong");
    if (soundEnabled) {
      const audio = new Audio(isCorrect ? 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3' : 'https://assets.mixkit.co/active_storage/sfx/2003/2003-preview.mp3');
      audio.volume = 0.2;
      audio.play().catch(() => {});
    }
    setTimeout(() => {
      nextRound();
    }, 1500);
  };

  const nextRound = () => {
    const nextIdx = round + 1;
    const isSpecialRound = nextIdx % 2 === 0 && nextIdx < ROUND_COUNT && phase !== 'ibQuiz';

    if (isSpecialRound) {
        handleIBQuiz();
        return;
    }

    if (nextIdx >= ROUND_COUNT) {
      setPhase("final");
    } else {
      setRound(nextIdx);
      roundRef.current = nextIdx;
      startRound();
    }
  };

  const restartGame = () => {
    setWords(pickWords());
    setRound(0);
    roundRef.current = 0;
    setRoundResults([]);
    setPhase("intro");
  };

  const score = roundResults.filter(r => r.success).length;
  const currentWord = words[round];
  const timerPct = (timeLeft / DRAW_TIME) * 100;
  
  let timerColorClass = "bg-emerald-500";
  let timerTextColorClass = "text-emerald-500";
  if (timeLeft <= 3) {
    timerColorClass = "bg-rose-500";
    timerTextColorClass = "text-rose-500";
  } else if (timeLeft <= 6) {
    timerColorClass = "bg-amber-500";
    timerTextColorClass = "text-amber-500";
  }

  return (
    <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-4 overflow-hidden select-none">
      <div className="w-full max-w-lg relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-4 flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-indigo-100 text-indigo-600 mb-4 shadow-xl">
                <Pencil size={40} className="animate-bounce" />
              </div>
              <h1 className="text-3xl md:text-5xl font-black text-gray-900 mb-2 tracking-tighter">
                10초 드로잉!
              </h1>
              <p className="text-base md:text-lg text-gray-500 font-bold mb-6 leading-tight">AI가 10초 안에 여러분의 그림을<br/>맞힐 수 있을까요?</p>
              <div className="bg-white border-2 border-indigo-100 rounded-2xl px-6 py-2 text-xs md:text-sm text-indigo-600 font-black mb-8 shadow-sm">
                {ROUND_COUNT} 라운드 · 각 {DRAW_TIME}초
              </div>
              <Button 
                onClick={() => { setRound(0); roundRef.current = 0; startRound(); }}
                className="w-full py-4 text-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-200"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                게임 시작하기
              </Button>
            </motion.div>
          )}

          {phase === "countdown" && (
            <motion.div 
              key="countdown"
              initial={{ opacity: 0, scale: 1.2 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="text-center py-20 flex flex-col items-center"
            >
              <span className="text-indigo-400 font-black text-sm uppercase tracking-widest mb-4">Round {round + 1} / {ROUND_COUNT}</span>
              <p className="text-xl text-gray-400 font-bold mb-2">이 단어를 그려보세요!</p>
              <h3 className="text-5xl font-black text-gray-900 mb-12">{currentWord}</h3>
              <div className={cn(
                  "text-8xl font-black transition-all duration-300",
                  countdown === 1 ? "text-rose-500 scale-125" : "text-indigo-600"
              )}>
                {countdown === 0 ? "시작!" : countdown}
              </div>
            </motion.div>
          )}

          {phase === "drawing" && (
            <motion.div 
              key="drawing"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col w-full max-h-full"
            >
              <div className="flex justify-between items-center mb-2">
                <div className="bg-white px-3 py-1 rounded-xl border-2 border-indigo-100 text-indigo-900 font-black shadow-sm text-sm">
                  단어: {currentWord}
                </div>
                <div className={cn("text-2xl font-black tabular-nums transition-colors duration-300", timerTextColorClass)}>
                  {timeLeft}s
                </div>
              </div>

              <div className="h-2 w-full bg-gray-200 rounded-full mb-3 overflow-hidden">
                <div 
                  className={cn("h-full rounded-full transition-all duration-1000 ease-linear", timerColorClass)}
                  style={{ width: `${timerPct}%` }}
                />
              </div>

              <div className="relative rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-xl border-4 md:border-8 border-white bg-white aspect-[4/3] group">
                <canvas
                  ref={canvasRef}
                  width={480} 
                  height={360}
                  className="w-full h-full touch-none cursor-crosshair block bg-blue-50/10 bg-[url('https://www.transparenttextures.com/patterns/paper-fibers.png')]"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                  onTouchStart={startDrawing}
                  onTouchMove={draw}
                  onTouchEnd={stopDrawing}
                />
                
                {matched && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="absolute inset-0 bg-green-500/20 backdrop-blur-[2px] flex items-center justify-center z-10"
                  >
                    <div className="bg-white rounded-full p-4 shadow-2xl animate-bounce">
                      <Check className="w-16 h-16 text-green-500" strokeWidth={5} />
                    </div>
                  </motion.div>
                )}
              </div>

              <div className="mt-4 flex flex-col items-center gap-3">
                {aiThinking ? (
                  <div className="flex items-center text-gray-400 font-bold text-xs animate-pulse">
                    <div className="w-3 h-3 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                    분석 중...
                  </div>
                ) : aiGuesses.length > 0 ? (
                  <div className="w-full text-center">
                    <div className="flex flex-wrap gap-1.5 justify-center">
                      {aiGuesses.map((guess, idx) => (
                        <span key={idx} className={cn(
                            "px-3 py-1 rounded-lg text-xs font-black transition-all border-2",
                            idx === 0 
                              ? "bg-indigo-600 border-transparent text-white shadow-md scale-105" 
                              : "bg-white/80 text-gray-600 border-gray-100"
                        )}>
                          {guess}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-[10px] font-bold text-gray-400 text-center">그림을 그리면 AI가 실시간으로 분석합니다!</div>
                )}

                <button 
                  onClick={clearCanvas} 
                  disabled={matched}
                  className="flex items-center px-4 py-2 bg-white/80 hover:bg-white text-gray-500 rounded-xl text-xs font-black transition-all disabled:opacity-30 border border-gray-100 shadow-sm"
                >
                  <Eraser className="w-3 h-3 mr-2" />
                  지우기
                </button>
              </div>
            </motion.div>
          )}

          {phase === "roundResult" && (
            <motion.div 
              key="roundResult"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center py-8 w-full"
            >
              <div className={cn(
                  "w-24 h-24 rounded-3xl flex items-center justify-center mb-6 shadow-2xl",
                  roundResults[roundResults.length - 1]?.success ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-600"
              )}>
                {roundResults[roundResults.length - 1]?.success ? <Check className="w-12 h-12" strokeWidth={4} /> : <X className="w-12 h-12" strokeWidth={4} />}
              </div>
              
              <h2 className={cn("text-4xl font-black mb-3", roundResults[roundResults.length - 1]?.success ? "text-green-600" : "text-rose-600")}>
                {roundResults[roundResults.length - 1]?.success ? "그림 천재!" : "아까워요!"}
              </h2>
              
              <p className="text-lg text-gray-500 font-bold mb-8">
                {roundResults[roundResults.length - 1]?.success 
                  ? <span>AI가 <span className="text-indigo-600">"{roundResults[roundResults.length - 1]?.word}"</span>을(를) 완벽히 맞혔어요!</span> 
                  : <span>정답인 <span className="text-rose-600">"{roundResults[roundResults.length - 1]?.word}"</span>에 조금 더 가까워져 봐요!</span>}
              </p>

              {roundResults[roundResults.length - 1]?.image && (
                <div className="relative mb-10 p-2 bg-white rounded-3xl shadow-xl border-4 border-gray-100 overflow-hidden w-64 aspect-[4/3]">
                  <img src={roundResults[roundResults.length - 1].image} alt="내 그림" className="w-full h-full object-contain rounded-2xl" />
                </div>
              )}

              <Button 
                onClick={nextRound}
                className="w-full py-5 text-xl bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100"
              >
                {round + 1 >= ROUND_COUNT ? "마지막 결과 보기" : "다음 단계로"}
              </Button>
            </motion.div>
          )}

          {phase === "ibQuiz" && ibQuiz && (
            <motion.div 
              key="ibQuiz"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.2 }}
              className="flex flex-col items-center py-8 w-full"
            >
              <div className="w-20 h-20 bg-amber-100 rounded-3xl flex items-center justify-center mb-6 shadow-xl shadow-amber-100">
                <Brain className="w-10 h-10 text-amber-600" />
              </div>
              <h2 className="text-2xl font-black text-gray-900 mb-2 truncate max-w-full">보너스 IB 퀴즈!</h2>
              <p className="text-gray-500 font-bold mb-8 text-center leading-tight">그림을 그리는 사이 지식도 쑥쑥!<br/>퀴즈를 맞히면 다음 그림으로 넘어가요.</p>
              
              <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl border-4 border-indigo-100 w-full mb-8">
                <p className="text-lg font-black text-gray-900 mb-8 leading-snug">{ibQuiz.question}</p>
                <div className="grid gap-3">
                  {ibQuiz.options.map((option: string, i: number) => (
                    <button
                      key={i}
                      disabled={quizFeedback !== null}
                      onClick={() => handleQuizAnswer(i === ibQuiz.correct)}
                      className={cn(
                        "p-5 rounded-2xl border-2 transition-all font-bold text-left text-sm",
                        quizFeedback === null 
                          ? "border-gray-100 hover:border-indigo-400 bg-gray-50"
                          : i === ibQuiz.correct
                            ? "bg-green-500 border-green-500 text-white shadow-lg"
                            : (quizFeedback === "wrong" && "bg-gray-100 border-gray-100 text-gray-400 opacity-50")
                      )}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {phase === "final" && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full flex flex-col items-center py-8"
            >
              <div className="text-center mb-10">
                <div className="inline-flex justify-center items-center w-24 h-24 bg-amber-100 text-amber-600 rounded-[2rem] mb-6 shadow-xl shadow-amber-100">
                  <Trophy className="w-12 h-12 animate-bounce" />
                </div>
                <h2 className="text-5xl font-black text-gray-900 mb-3 tracking-tight">
                  {score} / {ROUND_COUNT}
                </h2>
                <p className="text-lg text-gray-500 font-bold px-8 leading-tight">
                  {score === ROUND_COUNT ? "그림의 전설이 나타났다! 🎨" : 
                   score >= ROUND_COUNT/2 ? "훌륭한 예술적 감각이에요! 👍" : "조금 더 연습하면 AI도 반할 거예요! 💪"}
                </p>
              </div>

              <div className="w-full grid grid-cols-2 gap-4 mb-10">
                {roundResults.map((r, i) => (
                  <div key={i} className={cn(
                      "flex flex-col p-3 rounded-2xl border-2 transition-all",
                      r.success ? "bg-green-50 border-green-100" : "bg-rose-50 border-rose-100"
                  )}>
                    {r.image ? (
                      <div className="w-full aspect-video rounded-xl mb-3 overflow-hidden shadow-sm bg-white border border-gray-100">
                        <img src={r.image} alt={r.word} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-xl mb-3 flex items-center justify-center text-xs text-gray-400 font-black">CANVAS EMPTY</div>
                    )}
                    <div className="text-center">
                      <div className={cn("font-black text-sm", r.success ? "text-green-600" : "text-rose-600")}>
                        {r.word}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={restartGame}
                className="w-full py-5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-2xl shadow-xl shadow-indigo-100"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                처음부터 다시 도전!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
