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

const SYNONYMS: Record<string, string[]> = {
  "사과": ["사과", "apple", "red apple", "green apple", "fruit", "사과그림"],
  "고양이": ["고양이", "야옹이", "cat", "kitty", "neko", "고양이머리"],
  "강아지": ["강아지", "개", "댕댕이", "dog", "puppy", "개얼굴"],
  "집": ["집", "가옥", "건물", "house", "home", "building", "루프"],
  "나무": ["나무", "식물", "tree", "plant", "wood"],
  "자동차": ["자동차", "차", "승용차", "car", "auto", "vehicle"],
  "꽃": ["꽃", "화초", "flower", "rose", "tulip", "blossom"],
  "물고기": ["물고기", "생선", "물고기그림", "fish", "shark"],
  "새": ["새", "참새", "독수리", "bird", "wing", "flying bird"],
  "달": ["달", "초승달", "보름달", "moon", "crescent"],
  "해": ["해", "태양", "햇님", "sun", "sunshine"],
  "별": ["별", "반짝이", "star", "twinkle"],
  "책": ["책", "도서", "교과서", "book", "notebook", "open book"],
  "안경": ["안경", "썬글라스", "glasses", "spectacles", "eyeglasses"],
  "모자": ["모자", "캡", "hat", "cap", "beanie"],
  "피자": ["피자", "피자한조각", "pizza"],
  "케이크": ["케이크", "케익", "촛불케이크", "cake", "cupcake"],
  "아이스크림": ["아이스크림", "콘", "ice cream", "icecream", "popsicle"],
  "로켓": ["로켓", "우주선", "rocket", "spaceship"],
  "비행기": ["비행기", "전투기", "airplane", "plane", "jet"],
  "배": ["배", "보트", "배낚시", "과일배", "boat", "ship", "pear", "vessel"],
  "자전거": ["자전거", "bicycle", "bike", "cycle"],
  "컵": ["컵", "잔", "머그컵", "cup", "mug", "glass", "tumbler"],
  "전화기": ["전화기", "스마트폰", "휴대폰", "phone", "telephone", "smartphone", "cellphone"],
  "하트": ["하트", "심장", "사랑", "heart", "love"],
  "손": ["손", "손가락", "손바닥", "hand", "palm", "finger", "fist"],
  "눈": ["눈", "눈사람", "눈동자", "eye", "eyes", "snowman", "snow", "snowflake"],
  "발": ["발", "발바닥", "foot", "feet", "toe"],
  "코": ["코", "콧구멍", "nose", "snout"],
  "귀": ["귀", "귓바퀴", "ear", "ears"],
  "공": ["공", "축구공", "야구공", "농구공", "ball", "sphere", "soccer", "basketball"],
  "우산": ["우산", "양산", "umbrella"],
  "시계": ["시계", "손목시계", "탁상시계", "clock", "watch", "timer"],
  "신발": ["신발", "구두", "운동화", "shoe", "shoes", "boot", "sneaker", "slipper"],
  "가방": ["가방", "배낭", "backpack", "bag", "handbag", "purse"],
  "나비": ["나비", "호랑나비", "butterfly", "moth"],
  "개구리": ["개구리", "올챙이", "frog", "toad"],
  "토끼": ["토끼", "rabbit", "bunny", "hare"],
  "곰": ["곰", "아기곰", "bear", "teddy bear"],
  "코끼리": ["코끼리", "elephant", "trunk"]
};

const matchSynonym = (targetWord: string, guesses: string[]) => {
  const synonyms = SYNONYMS[targetWord] || [targetWord];
  const cleanGuesses = guesses.map(g => g.toLowerCase().trim().replace(/[\s_\-]/g, ""));
  
  return synonyms.some(syn => {
    const cleanSyn = syn.toLowerCase().trim().replace(/[\s_\-]/g, "");
    return cleanGuesses.some(guess => {
      return guess === cleanSyn || guess.includes(cleanSyn) || cleanSyn.includes(guess);
    });
  });
};

const ROUND_COUNT = 6;
const API_INTERVAL = 2000;

const DIFF_SETTINGS = {
  easy: {
    name: "하 (쉬움)",
    time: 30,
    leniency: "EXPIRED_LENIENCY: Be extremely lenient, generous, and warm. Any simple outline, very rough scribble, or minimal simple shape that represents the concept even slightly must be accepted. Give the benefit of the doubt completely to ensure user success.",
    desc: "여유로운 30초 제한시간과 아주 너그러운 보너스 판정!"
  },
  medium: {
    name: "중 (보통)",
    time: 20,
    leniency: "STANDARD_LENIENCY: Be highly friendly, generous, and encouraging. Accept basic outlines, rough symbolic representations, simple child-like sketches, and hand doodles. Only reject completely empty canvases or pure chaotic random dots.",
    desc: "오리지널 10초 드로잉의 스릴과 표준 균형 판정!"
  },
  hard: {
    name: "상 (어려움)",
    time: 12,
    leniency: "RELAXED_STRICT_LENIENCY: Be very encouraging and fair. Accept clear basic structures and recognized designs of the object. Do not punish raw sketch quality; as long as the core concept is visible, mark as matched.",
    desc: "짜릿한 12초 탈출과 깐깐하고 정확한 정밀 판정!"
  }
};

function pickWords() {
  const shuffled = [...WORDS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, ROUND_COUNT);
}

export const DrawingGame = ({ soundEnabled, onGameFinish }: { soundEnabled: boolean; onGameFinish?: (score: number) => void }) => {
  const [phase, setPhase] = useState<"intro" | "countdown" | "drawing" | "roundResult" | "ibQuiz" | "final">("intro");

  useEffect(() => {
    if (phase === 'final') {
      onGameFinish?.(roundResults.filter(r => r.success).length);
    }
  }, [phase]);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("easy");
  const [words, setWords] = useState(pickWords());
  const [round, setRound] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [countdown, setCountdown] = useState(3);
  const [aiGuesses, setAiGuesses] = useState<string[]>([]);
  const [matched, setMatched] = useState(false);
  const [roundResults, setRoundResults] = useState<any[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [aiThinking, setAiThinking] = useState(false);
  
  const [brushColor, setBrushColor] = useState<string>('#18181b');
  const [brushWidth, setBrushWidth] = useState<number>(12);
  
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
  const apiCheckingRef = useRef(false);
  const pendingCheckRef = useRef(false);

  useEffect(() => { roundRef.current = round; }, [round]);
  useEffect(() => { matchedRef.current = matched; }, [matched]);

  useEffect(() => {
    return () => {
      clearInterval(timerRef.current);
      clearInterval(apiTimerRef.current);
    };
  }, []);

  const drawTime = DIFF_SETTINGS[difficulty].time;

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
    ctx.strokeStyle = brushColor;
    ctx.lineWidth = brushWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.stroke();
    lastPos.current = pos;
    hasNewStrokeRef.current = true;
  };

  const stopDrawing = () => {
    drawingRef.current = false;
    setIsDrawing(false);
    // Instantly evaluate when the user lifts their finger/mouse, making it feel highly responsive!
    if (hasNewStrokeRef.current && !matchedRef.current) {
      checkDrawingWithAI();
    }
  };

  const checkDrawingWithAI = useCallback(async () => {
    if (matchedRef.current) return;
    if (!hasNewStrokeRef.current) return;
    
    if (apiCheckingRef.current) {
      pendingCheckRef.current = true;
      return;
    }
    
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Robust checks of alpha-channel on canvas pixels to ensure there are strokes
    const imgDataObj = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const imgData = imgDataObj.data;
    let hasDrawn = false;
    for (let i = 3; i < imgData.length; i += 4) {
      if (imgData[i] > 10) {
        hasDrawn = true;
        break;
      }
    }
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
    pendingCheckRef.current = false;
    apiCheckingRef.current = true;
    setAiThinking(true);
    try {
      const response = await ai.models.generateContent({
        model: "gemini-3.5-flash",
        contents: [
            { text: `The user is trying to draw: "${currentWord}" in an interactive sketch-guessing game with a ${drawTime}-second time limit, with difficulty level ${difficulty.toUpperCase()}. (Grading policy: ${DIFF_SETTINGS[difficulty].leniency})
            Evaluate this sketch drawn in black or colored lines on a solid white background.
            Does it reasonably represent the core features, symbolic shape, or even a rough abstract hint/doodle of a "${currentWord}"?
            
            Be EXTREMELY generous, friendly, and warm. Students only have a few seconds to draw, and it's on a mouse/touchpad interface. Expect messy, bumpy, lopsided, shaky, and highly simplified curves. Even a rudimentary symbol or minimalist line outline should count as a match. If there is even a remote visual trace or symbolic effort that hints at "${currentWord}", you MUST mark "matched": true and put "${currentWord}" in the "guesses".
            
            Evaluation Guidelines:
            - Be EXTREMELY friendly, extremely lenient, and generous towards simple, rushed, child-like sketches, basic skeleton outlines, or standard symbolic representations of "${currentWord}".
            - Remember: Students only have a few seconds to draw, and it's on a mouse/touchpad interface. Expect messy, bumpy, lopsided, shaky, and highly simplified curves.
            - Only reject if the drawing consists of completely unrelated random scribbles (such as a simple straight line, meaningless stray scratch, or an empty canvas), or is a drawing of something entirely different. If it shows ANY reasonable attempt or basic shape resembling "${currentWord}", you MUST set "matched": true and guarantee "${currentWord}" is in the "guesses" list.
            
            Here are keyword-specific leniency guidelines to help you:
            - 사과 (Apple): circle with a small stem or leaf on top.
            - 고양이 (Cat): head with pointy ears, whiskers, facial outline, or feline shape.
            - 강아지 (Dog): oval head with floppy/pointy ears, nose, tail, dog face ('개' is equivalent).
            - 집 (House): rectangle/square with a triangular roof.
            - 나무 (Tree): a trunk line with a cloud-like outline top or branching lines.
            - 자동차 (Car): dome or brick shape with two circular wheels ('차' is equivalent).
            - 꽃 (Flower): center circle with petals around it, or stem with leaf hooks.
            - 물고기 (Fish): leaf shape body, triangular tail fin, or gill curve.
            - 새 (Bird): wing shapes, peak beak, soaring V lines, or avian stance.
            - 달 (Moon): crescent curve or circular coin.
            - 해 (Sun): circle with outstanding ray spokes around it.
            - 별 (Star): standard five-point star or crossed twinkling lines.
            - 책 (Book): flat butterfly-like open page double-loop, or rect contour.
            - 안경 (Glasses): two circles/lenses linked by a nose bridge line.
            - 모자 (Hat): cap structure, top hat cylindrical shape, or generic hemisphere with brim.
            - 피자 (Pizza): triangular food wedge with round pepperoni dots, or full circle split in lines.
            - 케이크 (Cake): cylindrical drum with thin lit candle line stalks, or a plate slice.
            - 아이스크림 (Ice Cream): triangular cone with circles, cup with spoon, or a popsicle stick.
            - 로켓 (Rocket): tall vertical pointed cylinder with triangular side booster fins.
            - 비행기 (Airplane): cross shape with wings on sides and a tail fin.
            - 배 (Ship/Boat/Pear): pear-like fruit shape, OR flat/curved hull boat with a sail triangle or stack. Accept both meanings!
            - 자전거 (Bicycle): two wheels connected by bar frame meshes.
            - 컵 (Cup): curved cup contour (U-shape), mug loop.
            - 전화기 (Phone): rectangle slate screen (smartphone), or telephone handset bone.
            - 하트 (Heart): classic curved romantic heart contour or two adjacent lobes merging at a bottom point. Be ABSOLUTELY, EXTRAORDINARILY generous and friendly with heart drawings. Even if it is asymmetrical, lopsided, single-stroke outline, flat on top, bumpy, overlapping, or slightly incomplete, as long as it has a generic heart vibe, you MUST mark "matched": true and put "하트" in the guesses.
            - 손 (Hand): outline of wrist with finger stalks, glove line.
            - 눈 (Eye/Snowman): eyeball almond shape with pupil center, OR snowman stacked circles. Accept both meanings!
            - 발 (Foot): kidney shape sole outline with small bubble toe tips.
            - 코 (Nose): L-shape profile crease, or triangle.
            - 귀 (Ear): C-shape outer outline with inner creases.
            - 공 (Ball): raw circle, soccer stitch meshes, baseball seams, or basketball stripes.
            - 우산 (Umbrella): canopy arch dome with a hook wire rod underneath.
            - 시계 (Clock): round watch circle with hands/dial or wrist band.
            - 신발 (Shoe): boot, foot socket, or sneaker pattern.
            - 가방 (Bag): rectangle backpack with shoulder curves, or a purse with hand strap.
            - 나비 (Butterfly): centerline body with twin ornate flutter wings.
            - 개구리 (Frog): head with big bug eyes or flat wide webbed feet.
            - 토끼 (Rabbit): vertical long ears protruding from head.
            - 곰 (Bear): bear mask outline with small round ears.
            - 코끼리 (Elephant): big ear contours and a long dangling nose tube trunk.
 
            If the drawing captures any distinctive shape, iconic features, or essence of "${currentWord}", set "matched": true, and include "${currentWord}" in the "guesses".
            If the drawing is just an unrelated doodle, simple scribble, or does not resemble "${currentWord}", set "matched": false and do NOT include "${currentWord}" in the "guesses".
            
            Here is the list of all possible vocabulary words in this game for context: ${WORDS.join(", ")}.` },
            { inlineData: { mimeType: "image/png", data: imageData } }
        ],
        config: {
          systemInstruction: "You are an extremely friendly, helpful, warm, and highly lenient Quick-Draw sketch recognition AI. Your goal is to identify if the student's doodle is a reasonable drawing of the target word. Since users draw under a strict 10-second timer using trackpads or touchscreens, accept very simplified, messy, asymmetrical, child-like, or incomplete sketches. Give them the benefit of the doubt as much as humanly possible! Never be strict. Keep it fun. Provide 3 guesses in Korean of what the drawing actually looks like, always including the target word if matched is true.",
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              guesses: {
                type: Type.ARRAY,
                items: { type: Type.STRING },
                description: "Top 3 things this drawing looks like, in Korean. If matched is true, make sure the target word is one of the guesses."
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
        const guessesList = parsed.guesses || [];
        setAiGuesses(guessesList);
        
        const isMatchedByAI = !!parsed.matched;
        const isMatchedBySynonym = matchSynonym(currentWord, guessesList);
        const finalMatched = isMatchedByAI || isMatchedBySynonym;

        if (finalMatched && !matchedRef.current) {
          matchedRef.current = true;
          setMatched(true);
          clearInterval(timerRef.current);
          clearInterval(apiTimerRef.current);
          if (soundEnabled) {
              const audio = new Audio('https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3');
              audio.volume = 0.2;
              audio.play().catch(() => {});
          }
          setTimeout(() => finishRound(true, guessesList), 1500);
        }
      }
    } catch (err) {
      console.error("AI check failed:", err);
    } finally {
      apiCheckingRef.current = false;
      setAiThinking(false);
      // Process any pending evaluation that arrived while the current API call was in-flight
      if (pendingCheckRef.current && !matchedRef.current) {
        pendingCheckRef.current = false;
        setTimeout(() => {
          checkDrawingWithAI();
        }, 80);
      }
    }
  }, [words, soundEnabled, difficulty, drawTime]);

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
    apiCheckingRef.current = false;
    pendingCheckRef.current = false;
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
        setTimeLeft(drawTime);
        
        setTimeout(clearCanvas, 50);

        let t = drawTime;
        timerRef.current = setInterval(() => {
          t--;
          setTimeLeft(t);
          if (t <= 0) {
            if (!matchedRef.current) finishRound(false, []);
          }
        }, 1000);

        // First check after 1.5 seconds of drawing to be responsive
        setTimeout(() => {
          if (!matchedRef.current && t > 0) checkDrawingWithAI();
        }, 1500);
        
        apiTimerRef.current = setInterval(() => {
          if (!matchedRef.current && t > 0) checkDrawingWithAI();
        }, API_INTERVAL);
      }
    }, 1000);
  }, [checkDrawingWithAI, finishRound, drawTime]);

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
  const timerPct = (timeLeft / drawTime) * 100;
  
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
              <p className="text-sm md:text-base text-gray-500 font-bold mb-4 leading-tight">AI가 제한시간 안에 여러분의 그림을<br/>맞힐 수 있을까요?</p>
              {/* 난이도 선택 섹션 */}
              <div className="w-[18rem] md:w-[22rem] bg-gray-50/80 p-2.5 rounded-2xl border border-gray-150 flex flex-col gap-2 mb-6 shadow-inner">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest text-center">원하는 난이도를 선택해 보세요!</span>
                <div className="grid grid-cols-3 gap-1.5">
                  {(["easy", "medium", "hard"] as const).map((diff) => (
                    <button
                      key={diff}
                      type="button"
                      onClick={() => {
                        setDifficulty(diff);
                        setTimeLeft(DIFF_SETTINGS[diff].time);
                      }}
                      className={cn(
                        "py-2 px-1 rounded-xl font-bold text-xs transition-all flex flex-col items-center justify-center gap-0.5 pointer-events-auto border",
                        difficulty === diff
                          ? diff === "easy"
                            ? "bg-emerald-500 text-white border-transparent shadow-[0_4px_12px_rgba(16,185,129,0.2)]"
                            : diff === "medium"
                            ? "bg-indigo-600 text-white border-transparent shadow-[0_4px_12px_rgba(79,70,229,0.2)]"
                            : "bg-rose-500 text-white border-transparent shadow-[0_4px_12px_rgba(239,68,68,0.2)]"
                          : "bg-white hover:bg-gray-100 text-gray-650 border-gray-200"
                      )}
                    >
                      <span className="text-xs font-black">
                        {diff === "easy" ? "하 ⭐" : diff === "medium" ? "중 ⭐⭐" : "상 ⭐⭐⭐"}
                      </span>
                      <span className="text-[9px] opacity-90 font-bold">
                        {DIFF_SETTINGS[diff].time}초
                      </span>
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-indigo-600 font-extrabold text-center mt-1 bg-white py-1.5 px-2 rounded-lg border border-indigo-50 leading-relaxed shadow-sm">
                  {DIFF_SETTINGS[difficulty].desc}
                </p>
              </div>

              <Button 
                onClick={() => { setRound(0); roundRef.current = 0; startRound(); }}
                className="w-full py-4 text-base bg-indigo-600 hover:bg-indigo-700 text-white shadow-xl shadow-indigo-100 font-black rounded-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Sparkles className="w-5 h-5 mr-2" />
                선택한 난이도로 시작하기
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

                {/* 🎨 색상 및 두께 선택 툴바 */}
                <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-indigo-100 mb-2.5 shadow-sm gap-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-black text-indigo-950">🎨 색상:</span>
                    <div className="flex gap-1.5">
                      {[
                        { name: "검정", hex: "#18181b", bg: "bg-[#18181b]" },
                        { name: "빨강", hex: "#ef4444", bg: "bg-red-500" },
                        { name: "파랑", hex: "#3b82f6", bg: "bg-blue-500" },
                        { name: "초록", hex: "#10b981", bg: "bg-emerald-500" },
                        { name: "주황", hex: "#f97316", bg: "bg-orange-500" },
                        { name: "보라", hex: "#8b5cf6", bg: "bg-violet-500" },
                        { name: "핑크", hex: "#ec4899", bg: "bg-pink-500" },
                      ].map((c) => (
                        <button
                          key={c.hex}
                          type="button"
                          onClick={() => setBrushColor(c.hex)}
                          className={cn(
                            "w-6 h-6 rounded-full cursor-pointer transition-all hover:scale-110 active:scale-95 border-2",
                            c.bg,
                            brushColor === c.hex ? "border-indigo-600 ring-2 ring-indigo-300 scale-110" : "border-white shadow-sm"
                          )}
                          title={c.name}
                        />
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px] font-black text-gray-500">두께:</span>
                    <div className="flex gap-1">
                      {[
                        { size: 6, label: "얇게" },
                        { size: 12, label: "보통" },
                        { size: 18, label: "굵게" },
                      ].map((t) => (
                        <button
                          key={t.size}
                          type="button"
                          onClick={() => setBrushWidth(t.size)}
                          className={cn(
                            "px-2 py-0.5 rounded-lg text-[10px] font-black border transition-all cursor-pointer",
                            brushWidth === t.size
                              ? "bg-indigo-600 text-white border-transparent shadow-sm"
                              : "bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
                          )}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  </div>
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
