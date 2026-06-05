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
  const hasNewStrokeRef = useRef(false);

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
    hasNewStrokeRef.current = false;
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
    hasNewStrokeRef.current = true;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    setIsDrawing(false);
  };

  const checkDrawingWithAI = useCallback(async () => {
    if (matchedRef.current) return;
    if (!hasNewStrokeRef.current) return;
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    const pixelBuffer = new Uint32Array(ctx.getImageData(0, 0, canvas.width, canvas.height).data.buffer);
    const hasDrawn = pixelBuffer.some(color => color !== 0);
    if (!hasDrawn) return;

    // Convert transparent canvas drawing to a white background canvas so vision models can see it clearly
    const tempCanvas = document.createElement("canvas");
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext("2d");
    if (!tempCtx) return;

    // Fill white background
    tempCtx.fillStyle = "#ffffff";
    tempCtx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);

    // Draw the drawing canvas on top
    tempCtx.drawImage(canvas, 0, 0);

    const imageData = tempCanvas.toDataURL("image/png").split(",")[1];
    const currentWord = words[roundRef.current];

    hasNewStrokeRef.current = false;
    setAiThinking(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [
            { text: `The user is trying to draw: "${currentWord}" in an interactive 10-second sketching game.
            Evaluate this indigo ink drawing sketched on a solid white background.
            Does it reasonably represent the core features, symbolic shape, or even a rough abstract hint of a "${currentWord}"?
            Since this is a quick 10-second game for elementary/middle school students, be extremely flexible, lenient, and generous.
            If the drawing has even a slight resemblance, a symbolic simplified icon representation, or captures the basic essence of "${currentWord}", consider it a match (set matched: true).
            
            Here is the list of all possible vocabulary words in this game for context: ${WORDS.join(", ")}.` },
            { inlineData: { mimeType: "image/png", data: imageData } }
        ],
        config: {
          systemInstruction: "You are an extremely generous and lenient professional Quick-Draw recognition engine. You specialize in identifying objects from minimal, rough, hand-drawn sketches. Even very abstract, simplified icon-style, or incomplete shapes should be matched (matched: true) if they suggest the target word. Provide guesses in Korean, selecting from or matching the essence of the game's vocabulary.",
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
    hasNewStrokeRef.current = false;
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

        // First check after 3 seconds of drawing to save cost and give user time
        setTimeout(() => {
          if (!matchedRef.current && t > 0) checkDrawingWithAI();
        }, 3000);
        
        apiTimerRef.current = setInterval(() => {
          if (!matchedRef.current && t > 0) checkDrawingWithAI();
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
    <div className="w-full h-full flex flex-col items-center justify-center p-2 md:p-3 overflow-hidden select-none">
      <div className="w-full max-w-xl md:max-w-4xl relative z-10 flex flex-col items-center">
        <AnimatePresence mode="wait">
          {phase === "intro" && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="text-center py-2 flex flex-col items-center"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-indigo-100 text-indigo-600 mb-2 shadow-lg">
                <Pencil size={32} className="animate-bounce" />
              </div>
              <h1 className="text-2xl md:text-4xl font-black text-gray-900 mb-1 tracking-tighter">
                10초 드로잉!
              </h1>
              <p className="text-sm md:text-base text-gray-500 font-bold mb-4 leading-tight">AI가 10초 안에 여러분의 그림을<br/>맞힐 수 있을까요?</p>
              <div className="bg-white border border-indigo-100 rounded-xl px-4 py-1.5 text-xs text-indigo-600 font-black mb-6 shadow-sm">
                {ROUND_COUNT} 라운드 · 각 {DRAW_TIME}초
              </div>
              <Button 
                onClick={() => { setRound(0); roundRef.current = 0; startRound(); }}
                className="w-full py-3.5 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100"
              >
                <Sparkles className="w-4 h-4 mr-2" />
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
              className="text-center py-6 md:py-10 flex flex-col items-center"
            >
              <span className="text-indigo-400 font-black text-xs md:text-sm uppercase tracking-widest mb-2">Round {round + 1} / {ROUND_COUNT}</span>
              <p className="text-sm text-gray-400 font-bold mb-1">이 단어를 그려보세요!</p>
              <h3 className="text-3xl md:text-5xl font-black text-gray-900 mb-6">{currentWord}</h3>
              <div className={cn(
                  "text-6xl md:text-8xl font-black transition-all duration-300",
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
              className="grid grid-cols-1 md:grid-cols-5 gap-3 md:gap-5 w-full items-center"
            >
              {/* Left Canvas Column - takes 3/5 width on md screens */}
              <div className="col-span-1 md:col-span-3 flex flex-col w-full">
                <div className="flex justify-between items-center mb-1.5">
                  <div className="bg-white px-3 py-1 rounded-xl border border-indigo-100 text-indigo-950 font-black shadow-sm text-xs md:text-sm">
                    단어: {currentWord}
                  </div>
                  <div className={cn("text-xl font-black tabular-nums transition-colors duration-300", timerTextColorClass)}>
                    {timeLeft}s
                  </div>
                </div>

                <div className="h-2 w-full bg-gray-200 rounded-full mb-2 overflow-hidden">
                  <div 
                    className={cn("h-full rounded-full transition-all duration-1000 ease-linear", timerColorClass)}
                    style={{ width: `${timerPct}%` }}
                  />
                </div>

                <div className="relative rounded-2xl overflow-hidden shadow-lg border-4 border-white bg-white aspect-[4/3] group">
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
                        <Check className="w-12 h-12 text-green-500" strokeWidth={5} />
                      </div>
                    </motion.div>
                  )}
                </div>
              </div>

              {/* Right Options Column - takes 2/5 width on md screens */}
              <div className="col-span-1 md:col-span-2 flex flex-col items-center justify-center gap-3.5 bg-white/70 backdrop-blur-md p-4 rounded-2xl border border-indigo-100/40 shadow-sm w-full">
                <div className="text-center w-full">
                  <span className="text-[10px] uppercase font-black tracking-widest text-indigo-500 block mb-0.5">AI 실시간 추적 엔진</span>
                  <p className="text-[10px] font-bold text-gray-400 mb-3">그림을 3초 그리면 추측을 시작합니다!</p>
                  
                  <div className="min-h-[64px] flex items-center justify-center w-full">
                    {aiThinking ? (
                      <div className="flex items-center text-gray-400 font-bold text-xs animate-pulse">
                        <div className="w-3.5 h-3.5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
                        분석하는 중...
                      </div>
                    ) : aiGuesses.length > 0 ? (
                      <div className="w-full">
                        <div className="flex flex-wrap gap-1.5 justify-center">
                          {aiGuesses.slice(0, 3).map((guess, idx) => (
                            <span key={idx} className={cn(
                                "px-2.5 py-1 rounded-xl text-[11px] font-black transition-all border",
                                idx === 0 
                                  ? "bg-indigo-600 border-transparent text-white shadow-md scale-105" 
                                  : "bg-white text-gray-600 border-gray-100"
                            )}>
                              {guess}
                            </span>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-[11px] text-gray-400 font-bold py-2 px-3 bg-indigo-50/40 rounded-xl border border-dashed border-indigo-100/60 w-full text-center">
                        기판 위에 마우스나 손가락으로 쓱쓱 그려보세요!
                      </div>
                    )}
                  </div>
                </div>

                <div className="w-full border-t border-indigo-50" />

                <button 
                  onClick={clearCanvas} 
                  disabled={matched}
                  className="flex items-center justify-center w-full py-2 bg-rose-50 hover:bg-rose-100 disabled:bg-gray-50 text-rose-600 disabled:text-gray-300 rounded-xl text-xs font-black transition-all border border-rose-100 disabled:border-gray-100 shadow-sm"
                >
                  <Eraser className="w-3 h-3 mr-2" />
                  다시 그리기 (지우기)
                </button>
              </div>
            </motion.div>
          )}

          {phase === "roundResult" && (
            <motion.div 
              key="roundResult"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="flex flex-col items-center text-center py-2 w-full"
            >
              <div className={cn(
                  "w-16 h-16 rounded-2xl flex items-center justify-center mb-3 shadow-md",
                  roundResults[roundResults.length - 1]?.success ? "bg-green-100 text-green-600" : "bg-rose-100 text-rose-600"
              )}>
                {roundResults[roundResults.length - 1]?.success ? <Check className="w-8 h-8" strokeWidth={4} /> : <X className="w-8 h-8" strokeWidth={4} />}
              </div>
              
              <h2 className={cn("text-2xl md:text-3xl font-black mb-1", roundResults[roundResults.length - 1]?.success ? "text-green-600" : "text-rose-600")}>
                {roundResults[roundResults.length - 1]?.success ? "그림 천재!" : "아까워요!"}
              </h2>
              
              <p className="text-xs md:text-sm text-gray-500 font-bold mb-4">
                {roundResults[roundResults.length - 1]?.success 
                  ? <span>AI가 <span className="text-indigo-600 font-black">"{roundResults[roundResults.length - 1]?.word}"</span>을(를) 맞웠어요!</span> 
                  : <span>정답인 <span className="text-rose-600 font-black font-sans">"{roundResults[roundResults.length - 1]?.word}"</span>에 조금 더 가깝게 그려볼까요?</span>}
              </p>

              {roundResults[roundResults.length - 1]?.image && (
                <div className="relative mb-5 p-1.5 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden w-44 aspect-[4/3]">
                  <img src={roundResults[roundResults.length - 1].image} alt="내 그림" className="w-full h-full object-contain rounded-xl" />
                </div>
              )}

              <Button 
                onClick={nextRound}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg font-black text-sm"
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
              className="flex flex-col items-center py-2 w-full"
            >
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center mb-2 shadow-sm">
                <Brain className="w-6 h-6 text-amber-600" />
              </div>
              <h2 className="text-lg md:text-xl font-black text-gray-900 mb-0.5">보너스 IB 퀴즈!</h2>
              <p className="text-xs text-gray-500 font-bold mb-4 text-center leading-tight">지식도 쑥쑥! 퀴즈를 맞히면 보너스 점수를 얻어요.</p>
              
              <div className="bg-white p-5 rounded-2xl shadow-lg border border-indigo-100 w-full mb-4 max-w-md">
                <p className="text-sm font-black text-gray-900 mb-4 leading-snug">{ibQuiz.question}</p>
                <div className="grid gap-2">
                  {ibQuiz.options.map((option: string, i: number) => (
                    <button
                      key={i}
                      disabled={quizFeedback !== null}
                      onClick={() => handleQuizAnswer(i === ibQuiz.correct)}
                      className={cn(
                        "p-3 rounded-xl border transition-all font-bold text-left text-xs",
                        quizFeedback === null 
                          ? "border-gray-100 hover:border-indigo-400 bg-gray-50 text-gray-700"
                          : i === ibQuiz.correct
                            ? "bg-green-500 border-green-500 text-white shadow-md"
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
              className="w-full flex flex-col items-center py-2"
            >
              <div className="text-center mb-4">
                <div className="inline-flex justify-center items-center w-14 h-14 bg-amber-100 text-amber-600 rounded-2xl mb-1 shadow-md">
                  <Trophy className="w-7 h-7 animate-bounce" />
                </div>
                <h2 className="text-2xl md:text-3xl font-black text-gray-900 mb-0.5 tracking-tight">
                  {score} / {ROUND_COUNT}
                </h2>
                <p className="text-xs md:text-sm text-gray-500 font-bold px-4 leading-tight">
                  {score === ROUND_COUNT ? "그림의 전설이 나타났다! 🎨" : 
                   score >= ROUND_COUNT/2 ? "훌륭한 예술적 감각이에요! 👍" : "조금 더 연습해봐요! 💪"}
                </p>
              </div>

              <div className="w-full grid grid-cols-3 md:grid-cols-6 gap-2 mb-4">
                {roundResults.map((r, i) => (
                  <div key={i} className={cn(
                      "flex flex-col p-1.5 rounded-xl border transition-all",
                      r.success ? "bg-green-50 border-green-100" : "bg-rose-50 border-rose-100"
                  )}>
                    {r.image ? (
                      <div className="w-full aspect-video rounded-lg mb-1 overflow-hidden shadow-sm bg-white border border-gray-100 flex items-center justify-center">
                        <img src={r.image} alt={r.word} className="w-full h-full object-contain" />
                      </div>
                    ) : (
                      <div className="w-full aspect-video bg-gray-100 rounded-lg mb-1 flex items-center justify-center text-[8px] text-gray-450 font-black">CANVAS EMPTY</div>
                    )}
                    <div className="text-center">
                      <div className={cn("font-black text-[10px]", r.success ? "text-green-600" : "text-rose-600")}>
                        {r.word}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <Button 
                onClick={restartGame}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl shadow-md text-xs md:text-sm"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                처음부터 다시 도전!
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
