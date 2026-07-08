import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { ArrowLeft, Trees, Sparkles, HelpCircle, RefreshCw, Trophy, ZoomIn, ZoomOut, RotateCcw, RotateCw, Compass } from 'lucide-react';
import confetti from 'canvas-confetti';

interface ConceptForestViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'bingo' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'concept-forest') => void;
  onEarnXP: (xp: number, activityType: 'study' | 'quiz' | 'flashcards' | 'memory', accuracy: number, duration: number) => void;
  soundEnabled: boolean;
}

interface ForestQuiz {
  id: string;
  host: string;
  concept: string;
  icon: string;
  title: string;
  answers: string[];
  correct: number;
  x: number;
  y: number;
  color: string;
}

const CHARACTERS = [
  { id: "jun", name: "숲지기 준", skin: "#d99b72", hair: "#34251f", shirt: "#2f7a4c", pants: "#8e9a9a" },
  { id: "min", name: "탐험가 민", skin: "#ffd3a0", hair: "#50382e", shirt: "#3f87e8", pants: "#f2b84b" },
  { id: "sol", name: "발명가 솔", skin: "#f3bd8f", hair: "#2f3d4a", shirt: "#4f9c68", pants: "#6cb7c9" },
  { id: "yul", name: "별빛 율", skin: "#f7caa8", hair: "#6a4fb3", shirt: "#d96f6f", pants: "#f5d66d" },
];

const CHARACTER_DETAILS: Record<string, { specialty: string; desc: string; speed: number; wisdom: number; luck: number; quote: string; emoji: string }> = {
  jun: {
    specialty: "자연 조율사",
    desc: "개념의 숲을 보살피는 따뜻한 마음의 파수꾼입니다. 식물들의 소리를 듣고 소통합니다.",
    quote: "🌱 '자연의 순리 속에 모든 IB 개념의 힌트가 들어있어.'",
    speed: 3,
    wisdom: 5,
    luck: 3,
    emoji: "🌲"
  },
  min: {
    specialty: "바람의 탐험가",
    desc: "세상의 숨겨진 미스터리를 추적하는 열정적인 모험가입니다. 발걸음이 가벼워 속도가 아주 빠릅니다.",
    quote: "🧭 '저 너머에 우리가 아직 발견하지 못한 지혜가 기다려!'",
    speed: 5,
    wisdom: 3,
    luck: 4,
    emoji: "🧭"
  },
  sol: {
    specialty: "차원 설계자",
    desc: "기능과 형태를 기하학적으로 분석하길 좋아하는 비범한 발명가입니다. 창의력이 뛰어납니다.",
    quote: "🔧 '원인과 결과를 설계도로 그리면 답이 보이곤 하지.'",
    speed: 4,
    wisdom: 4,
    luck: 3,
    emoji: "⚙️"
  },
  yul: {
    specialty: "성운의 수수께끼",
    desc: "별무리와 대화하며 깨달음을 얻는 신비로운 영성 탐험가입니다. 영감과 행운이 풍부합니다.",
    quote: "✨ '별들의 관점은 지상을 넘어서 영원을 비추고 있어.'",
    speed: 3,
    wisdom: 4,
    luck: 5,
    emoji: "🌌"
  }
};


const QUIZZES_SET1: ForestQuiz[] = [
  {
    id: "form",
    host: "형태 코너",
    concept: "Form",
    icon: "모양",
    title: "IB 개념 '형태'는 어떤 질문과 가장 가까울까요?",
    answers: ["무엇처럼 생겼을까?", "왜 변했을까?", "누구의 생각일까?", "어떻게 도울까?"],
    correct: 0,
    x: 2,
    y: 3,
    color: "#e8875f",
  },
  {
    id: "function",
    host: "기능 코너",
    concept: "Function",
    icon: "기능",
    title: "'기능' 개념으로 탐구할 때 알맞은 질문은?",
    answers: ["어떻게 작동할까?", "어떤 색일까?", "어디에서 왔을까?", "누가 책임질까?"],
    correct: 0,
    x: 7,
    y: 2,
    color: "#55a967",
  },
  {
    id: "causation",
    host: "원인 코너",
    concept: "Causation",
    icon: "원인",
    title: "친구가 식물을 물 없는 곳에 두었더니 시들었어요. 어떤 개념과 관련이 클까요?",
    answers: ["형태", "원인", "관점", "책임"],
    correct: 1,
    x: 12,
    y: 4,
    color: "#6a78d1",
  },
  {
    id: "change",
    host: "변화 코너",
    concept: "Change",
    icon: "변화",
    title: "씨앗이 싹이 되고 나무가 되는 과정을 볼 때 중요한 개념은?",
    answers: ["변화", "형태", "기능", "관점"],
    correct: 0,
    x: 11,
    y: 9,
    color: "#f2b84b",
  },
  {
    id: "connection",
    host: "연결 코너",
    concept: "Connection",
    icon: "연결",
    title: "꿀벌, 꽃, 사람의 먹거리가 서로 이어져 있음을 탐구하는 개념은?",
    answers: ["책임", "연결", "형태", "기능"],
    correct: 1,
    x: 7,
    y: 12,
    color: "#6cb7c9",
  },
  {
    id: "perspective",
    host: "관점 코너",
    concept: "Perspective",
    icon: "관점",
    title: "같은 문제를 친구마다 다르게 생각할 수 있음을 살피는 개념은?",
    answers: ["원인", "관점", "변화", "연결"],
    correct: 1,
    x: 2,
    y: 11,
    color: "#d96f6f",
  },
  {
    id: "responsibility",
    host: "책임 코너",
    concept: "Responsibility",
    icon: "책임",
    title: "학교 정원을 건강하게 지키기 위해 우리가 할 수 있는 일을 묻는 개념은?",
    answers: ["책임", "형태", "원인", "관점"],
    correct: 0,
    x: 4,
    y: 7,
    color: "#347c54",
  },
];

const QUIZZES_SET2: ForestQuiz[] = [
  {
    id: "form",
    host: "형태 코너",
    concept: "Form",
    icon: "모양",
    title: "나무의 형태를 탐구할 때 가장 중요한 질문은?",
    answers: ["나뭇가지는 어떻게 배열되어 있나?", "나무는 언제 자라나?", "누가 나무를 심었나?", "나무가 누구를 도울까?"],
    correct: 0,
    x: 2,
    y: 3,
    color: "#e8875f",
  },
  {
    id: "function",
    host: "기능 코너",
    concept: "Function",
    icon: "기능",
    title: "식물의 기능을 탐구하는 과정에서 해야 할 질문은?",
    answers: ["잎은 무엇을 만드는가?", "잎의 색은 무엇인가?", "잎은 어디서 나왔는가?", "누가 잎을 만들어야 하는가?"],
    correct: 0,
    x: 7,
    y: 2,
    color: "#55a967",
  },
  {
    id: "causation",
    host: "원인 코너",
    concept: "Causation",
    icon: "원인",
    title: "봄이 되면 꽃이 피는 이유를 설명하는 개념은?",
    answers: ["색깔", "원인", "비용", "영향력"],
    correct: 1,
    x: 12,
    y: 4,
    color: "#6a78d1",
  },
  {
    id: "change",
    host: "변화 코너",
    concept: "Change",
    icon: "변화",
    title: "계절마다 숲의 모습이 달라지는 현상을 나타내는 개념은?",
    answers: ["변화", "기능", "연결", "역할"],
    correct: 0,
    x: 11,
    y: 9,
    color: "#f2b84b",
  },
  {
    id: "connection",
    host: "연결 코너",
    concept: "Connection",
    icon: "연결",
    title: "빗물→흙→식물→동물이 모두 연결되어 있음을 보는 개념은?",
    answers: ["고립", "연결", "무리", "단계"],
    correct: 1,
    x: 7,
    y: 12,
    color: "#6cb7c9",
  },
  {
    id: "perspective",
    host: "관점 코너",
    concept: "Perspective",
    icon: "관점",
    title: "농부와 곤충학자가 같은 해충을 다르게 본다는 것을 이해하는 개념은?",
    answers: ["거리", "관점", "문화", "시간"],
    correct: 1,
    x: 2,
    y: 11,
    color: "#d96f6f",
  },
  {
    id: "responsibility",
    host: "책임 코너",
    concept: "Responsibility",
    icon: "책임",
    title: "멸종 위기종을 보호하기 위해 우리가 해야 할 일을 묻는 개념은?",
    answers: ["책임", "흥미", "현실", "이야기"],
    correct: 0,
    x: 4,
    y: 7,
    color: "#347c54",
  },
];

const DECORATIONS = [
  { type: "tree", x: 1, y: 2 }, { type: "tree", x: 4, y: 2 }, { type: "tree", x: 9, y: 1 },
  { type: "tree", x: 13, y: 5 }, { type: "tree", x: 10, y: 12 }, { type: "tree", x: 1, y: 13 },
  { type: "rock", x: 5, y: 5 }, { type: "rock", x: 9, y: 8 }, { type: "flower", x: 4, y: 9 },
  { type: "flower", x: 13, y: 10 }, { type: "pond", x: 8, y: 6 }, { type: "stump", x: 3, y: 13 },
  { type: "sign", x: 6, y: 6 }, { type: "bush", x: 2, y: 5 }, { type: "bush", x: 11, y: 3 },
  { type: "lantern", x: 7, y: 7 }, { type: "mushroom", x: 5, y: 11 }, { type: "mushroom", x: 12, y: 9 },
  { type: "bush", x: 3, y: 10 }, { type: "tree", x: 12, y: 2 },
];

const TILE_W = 86;
const TILE_H = 44;
const WORLD_W = 15;
const WORLD_H = 15;

export const ConceptForestView = ({ setView, onEarnXP, soundEnabled }: ConceptForestViewProps) => {
  const [selectedCharacter, setSelectedCharacter] = useState(CHARACTERS[0]);
  const [solvedSet, setSolvedSet] = useState<Set<string>>(new Set());
  const [quizzes, setQuizzes] = useState<ForestQuiz[]>([]);
  const [activeQuiz, setActiveQuiz] = useState<ForestQuiz | null>(null);
  const [quizSelectedOption, setQuizSelectedOption] = useState<number | null>(null);
  const [quizFeedback, setQuizFeedback] = useState<string>("");
  const [quizStatus, setQuizStatus] = useState<"none" | "correct" | "wrong">("none");
  const [isCleared, setIsCleared] = useState(false);
  const [startTime] = useState(Date.now());
  const [dashActive, setDashActive] = useState(false);

  // Isometric engine states
  const [zoom, setZoom] = useState(1);
  const [cameraAngle, setCameraAngle] = useState(0);

  // Refs for loop
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  
  const playerPosRef = useRef({ x: 7.5, y: 7.5 });
  const cameraPosRef = useRef({ x: 7.5, y: 7.5 });
  const petPosRef = useRef({ x: 7.2, y: 7.2 });
  const playerDirectionRef = useRef<"front" | "back" | "left" | "right">("front");
  const playerStateRef = useRef<"idle" | "thinking" | "success">("idle");
  const keysPressedRef = useRef<Set<string>>(new Set());
  const timeRef = useRef(0);
  const particlesRef = useRef<any[]>([]);
  const sparklesRef = useRef<any[]>([]);
  const leavesRef = useRef<any[]>([]);

  // Sound synthesis
  const playSound = (type: 'correct' | 'wrong' | 'win' | 'click' | 'step') => {
    if (!soundEnabled) return;
    try {
      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      
      osc.connect(gain);
      gain.connect(audioCtx.destination);
      
      if (type === 'correct') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.15); // E5
        gain.gain.setValueAtTime(0.08, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.4);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.4);
      } else if (type === 'wrong') {
        osc.frequency.setValueAtTime(220, audioCtx.currentTime); // A3
        osc.frequency.setValueAtTime(196, audioCtx.currentTime + 0.1); // G3
        gain.gain.setValueAtTime(0.1, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.35);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.35);
      } else if (type === 'win') {
        osc.frequency.setValueAtTime(523.25, audioCtx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, audioCtx.currentTime + 0.1); // E5
        osc.frequency.setValueAtTime(783.99, audioCtx.currentTime + 0.2); // G5
        osc.frequency.setValueAtTime(1046.50, audioCtx.currentTime + 0.3); // C6
        gain.gain.setValueAtTime(0.12, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.7);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.7);
      } else if (type === 'click') {
        osc.frequency.setValueAtTime(440, audioCtx.currentTime); // A4
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.08);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.08);
      } else if (type === 'step') {
        osc.frequency.setValueAtTime(120, audioCtx.currentTime); 
        gain.gain.setValueAtTime(0.03, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.05);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.05);
      }
    } catch (e) {
      // Audio fallback
    }
  };

  // Helper functions for particle burst
  const spawnConfettiBurst = (px: number, py: number) => {
    const colors = ["#f2b84b", "#55c97a", "#6cb7c9", "#d96f6f", "#a78bfa", "#fb923c"];
    for (let i = 0; i < 28; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1.5 + Math.random() * 3.5;
      particlesRef.current.push({
        x: px, y: py,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        decay: 0.016 + Math.random() * 0.012,
        size: 4 + Math.random() * 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        rot: Math.random() * Math.PI * 2,
        rotV: (Math.random() - 0.5) * 0.18,
      });
    }
  };

  const spawnStarBurst = (px: number, py: number) => {
    for (let i = 0; i < 12; i++) {
      const angle = (Math.PI * 2 * i) / 12;
      sparklesRef.current.push({
        x: px + (Math.random() - 0.5) * 30,
        y: py + (Math.random() - 0.5) * 20,
        vx: Math.cos(angle) * (1 + Math.random() * 2),
        vy: Math.sin(angle) * (1 + Math.random() * 2),
        life: 1,
        decay: 0.02 + Math.random() * 0.01,
        size: 3 + Math.random() * 5,
      });
    }
  };

  // Initialize quizzes from both sets randomly
  useEffect(() => {
    const initialQuizzes = QUIZZES_SET1.map((q, i) => {
      return Math.random() > 0.5 ? { ...q } : { ...QUIZZES_SET2[i] };
    });
    setQuizzes(initialQuizzes);

    // Spawn ambient sparkles
    for (let i = 0; i < 22; i++) {
      sparklesRef.current.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        vx: 0, vy: 0,
        life: Math.random(),
        decay: 0,
        size: 1.2 + Math.random() * 2.2,
        ambient: true,
        phase: Math.random() * Math.PI * 2,
      });
    }

    // Spawn ambient wind-blown forest leaves
    for (let i = 0; i < 18; i++) {
      leavesRef.current.push({
        x: Math.random() * 800,
        y: Math.random() * 600,
        angle: Math.random() * Math.PI * 2,
        speedX: 0.3 + Math.random() * 0.7,
        speedY: 0.5 + Math.random() * 1.0,
        swingRange: 1.2 + Math.random() * 1.8,
        swingSpeed: 0.015 + Math.random() * 0.025,
        swingPhase: Math.random() * Math.PI * 2,
        size: 5 + Math.random() * 5,
        color: ["#10b981", "#34d399", "#059669", "#f59e0b", "#fbbf24"][Math.floor(Math.random() * 5)]
      });
    }
  }, []);

  // Set Resize Handler using ResizeObserver
  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (let entry of entries) {
        const width = entry.contentRect.width;
        const height = entry.contentRect.height;
        const scale = window.devicePixelRatio || 1;
        
        canvas.width = Math.max(640, Math.floor(width * scale));
        canvas.height = Math.max(420, Math.floor(height * scale));
        const ctx = canvas.getContext('2d');
        if (ctx) ctx.setTransform(scale, 0, 0, scale, 0, 0);
      }
    });

    resizeObserver.observe(container);
    return () => resizeObserver.disconnect();
  }, []);

  // Coordinate projection utils
  const getScreenCenter = () => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 400, y: 300 };
    return {
      x: canvas.clientWidth / 2,
      y: canvas.clientHeight / 2 - 28,
    };
  };

  const isoProject = (x: number, y: number, z: number = 0) => {
    const center = getScreenCenter();
    const worldX = x - cameraPosRef.current.x;
    const worldY = y - cameraPosRef.current.y;
    
    const ca = Math.cos(cameraAngle);
    const sa = Math.sin(cameraAngle);
    
    const rotX = worldX * ca - worldY * sa;
    const rotY = worldX * sa + worldY * ca;
    
    const float = Math.sin(timeRef.current * 0.0008) * 5;
    return {
      x: center.x + (rotX - rotY) * (TILE_W / 2),
      y: center.y + (rotX + rotY) * (TILE_H / 2) - z + float,
    };
  };

  const isoDepth = (wx: number, wy: number) => {
    const ca = Math.cos(cameraAngle);
    const sa = Math.sin(cameraAngle);
    const dx = wx - cameraPosRef.current.x;
    const dy = wy - cameraPosRef.current.y;
    return dx * sa + dy * ca + dx * ca - dy * sa;
  };

  const rotateInput = (dx: number, dy: number) => {
    const ca = Math.cos(cameraAngle);
    const sa = Math.sin(cameraAngle);
    return { x: dx * ca + dy * sa, y: -dx * sa + dy * ca };
  };

  const shadeHex = (hex: string, amount: number) => {
    const value = hex.replace("#", "");
    const number = parseInt(value, 16);
    const r = Math.max(0, Math.min(255, (number >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((number >> 8) & 255) + amount));
    const b = Math.max(0, Math.min(255, (number & 255) + amount));
    return `rgb(${r}, ${g}, ${b})`;
  };

  // Keyboard and movement hooks
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      // Prevent browser default scroll for game keys inside iframes
      if (["arrowup", "arrowdown", "arrowleft", "arrowright", "w", "a", "s", "d", " "].includes(key)) {
        e.preventDefault();
      }

      keysPressedRef.current.add(key);

      if (key === "arrowup" || key === "w") playerDirectionRef.current = "back";
      else if (key === "arrowdown" || key === "s") playerDirectionRef.current = "front";
      else if (key === "arrowleft" || key === "a") playerDirectionRef.current = "left";
      else if (key === "arrowright" || key === "d") playerDirectionRef.current = "right";

      if ((key === "enter" || key === " ") && !activeQuiz) {
        tryOpenNearbyQuiz();
      }
      if (key === "q") {
        setCameraAngle(prev => prev - Math.PI / 2);
      }
      if (key === "e") {
        setCameraAngle(prev => prev + Math.PI / 2);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current.delete(e.key.toLowerCase());
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [quizzes, activeQuiz, solvedSet]);

  const nearestQuiz = () => {
    if (quizzes.length === 0) return null;
    return quizzes
      .map((quiz) => ({
        quiz,
        dist: Math.hypot(playerPosRef.current.x - (quiz.x + 0.5), playerPosRef.current.y - (quiz.y + 0.5)),
      }))
      .sort((a, b) => a.dist - b.dist)[0];
  };

  const tryOpenNearbyQuiz = () => {
    const nearest = nearestQuiz();
    if (nearest && nearest.dist < 1.15) {
      if (solvedSet.has(nearest.quiz.id)) return;
      playSound('click');
      playerStateRef.current = "thinking";
      setActiveQuiz(nearest.quiz);
      setQuizSelectedOption(null);
      setQuizFeedback("");
      setQuizStatus("none");
    }
  };

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let animFrameId: number;

    const render = () => {
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      // Update timing and physics
      timeRef.current += 16;

      const isDashing = keysPressedRef.current.has("shift") || dashActive;
      const speed = isDashing ? 0.09 : 0.05;
      let dx = 0;
      let dy = 0;
      if (keysPressedRef.current.has("arrowup") || keysPressedRef.current.has("w")) dy -= 1;
      if (keysPressedRef.current.has("arrowdown") || keysPressedRef.current.has("s")) dy += 1;
      if (keysPressedRef.current.has("arrowleft") || keysPressedRef.current.has("a")) dx -= 1;
      if (keysPressedRef.current.has("arrowright") || keysPressedRef.current.has("d")) dx += 1;

      if (dx !== 0 || dy !== 0) {
        const len = Math.hypot(dx, dy);
        const rd = rotateInput(dx / len, dy / len);
        playerPosRef.current.x = Math.min(WORLD_W - 0.8, Math.max(0.8, playerPosRef.current.x + rd.x * speed));
        playerPosRef.current.y = Math.min(WORLD_H - 0.8, Math.max(0.8, playerPosRef.current.y + rd.y * speed));
        
        // Spawn trailing running particles
        if (Math.random() < (isDashing ? 0.6 : 0.25)) {
          const pScreen = isoProject(playerPosRef.current.x, playerPosRef.current.y);
          sparklesRef.current.push({
            x: pScreen.x + (Math.random() - 0.5) * 16,
            y: pScreen.y + 36 + (Math.random() - 0.5) * 8,
            vx: -rd.x * 2 + (Math.random() - 0.5) * 0.5,
            vy: -rd.y * 1 + (Math.random() - 0.5) * 0.5 - 0.6,
            life: 0.7,
            decay: 0.04 + Math.random() * 0.03,
            size: isDashing ? 3 + Math.random() * 3 : 1.5 + Math.random() * 1.5,
            color: isDashing ? "#38bdf8" : "#94a3b8"
          });
        }

        // Play soft step sound occasionally
        if (timeRef.current % 320 === 0) {
          playSound('step');
        }
      }

      // Spirit companion follow movement
      const targetPetX = playerPosRef.current.x - 0.45;
      const targetPetY = playerPosRef.current.y - 0.45;
      petPosRef.current.x += (targetPetX - petPosRef.current.x) * 0.05;
      petPosRef.current.y += (targetPetY - petPosRef.current.y) * 0.05;


      // Smooth camera follow
      cameraPosRef.current.x += (playerPosRef.current.x - cameraPosRef.current.x) * 0.08;
      cameraPosRef.current.y += (playerPosRef.current.y - cameraPosRef.current.y) * 0.08;

      // Clear Screen
      ctx.clearRect(0, 0, canvas.clientWidth, canvas.clientHeight);

      // Render World Under Camera scale
      const center = getScreenCenter();
      ctx.save();
      ctx.translate(center.x, center.y);
      ctx.scale(zoom, zoom);
      ctx.translate(-center.x, -center.y);

      // 1. Draw Diamond Grid Tiles
      const tiles = [];
      for (let ty = 0; ty < WORLD_H; ty++) {
        for (let tx = 0; tx < WORLD_W; tx++) {
          tiles.push({ x: tx, y: ty, depth: isoDepth(tx + 0.5, ty + 0.5) });
        }
      }
      tiles.sort((a, b) => a.depth - b.depth);
      tiles.forEach(({ x, y }) => {
        const path = x === 7 || y === 7 || (x > 1 && x < 13 && y === 11) || (y > 1 && y < 13 && x === 3);
        const checker = (x + y) % 2 === 0;
        
        // Draw Isometric diamond tile
        const p = isoProject(x, y);
        const left = { x: p.x - TILE_W / 2, y: p.y + TILE_H / 2 };
        const right = { x: p.x + TILE_W / 2, y: p.y + TILE_H / 2 };
        const bottom = { x: p.x, y: p.y + TILE_H };
        const depth = 12;

        ctx.fillStyle = "rgba(10, 30, 20, 0.22)";
        ctx.beginPath();
        ctx.moveTo(left.x, left.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(bottom.x, bottom.y + depth);
        ctx.lineTo(left.x, left.y + depth);
        ctx.closePath();
        ctx.fill();

        ctx.beginPath();
        ctx.moveTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(bottom.x, bottom.y + depth);
        ctx.lineTo(right.x, right.y + depth);
        ctx.closePath();
        ctx.fill();

        // Tile upper color
        const fill = path ? "#e8cf9f" : checker ? "#8fd174" : "#7fc66b";
        const gradient = ctx.createLinearGradient(p.x, p.y - 2, p.x, bottom.y + 2);
        gradient.addColorStop(0, fill.startsWith("#") ? shadeHex(fill, 8) : fill);
        gradient.addColorStop(0.5, fill);
        gradient.addColorStop(1, fill.startsWith("#") ? shadeHex(fill, -16) : fill);

        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(right.x, right.y);
        ctx.lineTo(bottom.x, bottom.y);
        ctx.lineTo(left.x, left.y);
        ctx.closePath();
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = "rgba(40, 80, 50, 0.12)";
        ctx.lineWidth = 1;
        ctx.stroke();

        // Grass details
        if (!path) {
          const detailP = isoProject(x + 0.15, y + 0.15, 0.05);
          const detailCount = ((x * 7 + y * 11) % 3) + 2;
          ctx.strokeStyle = "rgba(84, 108, 61, 0.22)";
          ctx.lineWidth = 1;
          for (let i = 0; i < detailCount; i += 1) {
            const offsetX = (i - detailCount / 2) * 6;
            ctx.beginPath();
            ctx.moveTo(detailP.x + offsetX, detailP.y + 4);
            ctx.quadraticCurveTo(detailP.x + offsetX + 4, detailP.y + 2, detailP.x + offsetX + 8, detailP.y + 6);
            ctx.stroke();
          }
        }
      });

      // 2. Prepare Drawables sorted by depth
      const drawables: any[] = [];

      // Decorations (Trees, rocks, ponds, etc.)
      DECORATIONS.forEach((dec) => {
        drawables.push({
          depth: isoDepth(dec.x + 0.5, dec.y + 0.5) + 0.4,
          draw: () => {
            const p = isoProject(dec.x + 0.5, dec.y + 0.5);
            
            if (dec.type === "tree") {
              // Fade trees out if the player walks behind them
              const dx = playerPosRef.current.x - (dec.x + 0.5);
              const dy = playerPosRef.current.y - (dec.y + 0.5);
              const isBehind = dy > 0 && Math.abs(dx) < 1.4 && Math.abs(dy) < 2.4;
              ctx.globalAlpha = isBehind ? 0.45 : 1.0;

              // Shadow
              ctx.fillStyle = "rgba(0,0,0,0.22)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 20, 28, 11, 0, 0, Math.PI * 2);
              ctx.fill();

              // Tree trunk
              ctx.fillStyle = "#6d4a2d";
              ctx.fillRect(p.x - 7, p.y - 8, 14, 32);
              ctx.fillStyle = "#8a613e";
              ctx.fillRect(p.x - 6, p.y - 6, 12, 30);

              // Branch layer 1
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - 72);
              ctx.lineTo(p.x + 34, p.y - 12);
              ctx.lineTo(p.x - 34, p.y - 12);
              ctx.closePath();
              ctx.fillStyle = "#3d8a52";
              ctx.fill();
              ctx.strokeStyle = "rgba(0,0,0,0.12)";
              ctx.stroke();

              // Branch layer 2
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - 98);
              ctx.lineTo(p.x + 27, p.y - 45);
              ctx.lineTo(p.x - 27, p.y - 45);
              ctx.closePath();
              ctx.fillStyle = "#5ba969";
              ctx.fill();
              ctx.strokeStyle = "rgba(0,0,0,0.12)";
              ctx.stroke();

              ctx.globalAlpha = 1.0;
            } else if (dec.type === "pond") {
              ctx.fillStyle = "rgba(0,0,0,0.18)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 22, 46, 19, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#75c4d8";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 12, 42, 18, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "rgba(255,255,255,0.38)";
              ctx.beginPath();
              ctx.ellipse(p.x - 12, p.y + 6, 14, 5, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (dec.type === "rock") {
              ctx.fillStyle = "rgba(0,0,0,0.22)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 20, 24, 9, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#7a8b8b";
              ctx.beginPath();
              ctx.roundRect(p.x - 18, p.y - 8, 36, 28, 8);
              ctx.fill();
            } else if (dec.type === "flower") {
              ctx.fillStyle = "rgba(0,0,0,0.15)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 16, 20, 8, 0, 0, Math.PI * 2);
              ctx.fill();

              for (let i = 0; i < 6; i += 1) {
                const a = (Math.PI * 2 * i) / 6;
                ctx.fillStyle = "#ef7c8e";
                ctx.beginPath();
                ctx.ellipse(p.x + Math.cos(a) * 9, p.y + Math.sin(a) * 5, 6, 4, 0, 0, Math.PI * 2);
                ctx.fill();
              }
              ctx.fillStyle = "#ffd75f";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y, 5, 4, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (dec.type === "stump") {
              ctx.fillStyle = "rgba(0,0,0,0.2)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 20, 22, 8, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#8a5f3d";
              ctx.fillRect(p.x - 15, p.y - 8, 30, 24);

              ctx.fillStyle = "#aa7a50";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y - 8, 16, 7, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (dec.type === "sign") {
              ctx.fillStyle = "rgba(0,0,0,0.2)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 24, 30, 10, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#6d4a2d";
              ctx.fillRect(p.x - 4, p.y - 8, 8, 36);

              ctx.beginPath();
              ctx.roundRect(p.x - 38, p.y - 42, 76, 34, 8);
              ctx.fillStyle = "#f2d091";
              ctx.fill();

              ctx.fillStyle = "#1e293b";
              ctx.font = "900 12px 'Inter', sans-serif";
              ctx.textAlign = "center";
              ctx.fillText("개념 광장", p.x, p.y - 21);
            } else if (dec.type === "bush") {
              ctx.fillStyle = "rgba(0,0,0,0.18)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 16, 20, 9, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#5fa05a";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y, 22, 14, 0, 0, Math.PI * 2);
              ctx.fill();
            } else if (dec.type === "lantern") {
              ctx.fillStyle = "rgba(0,0,0,0.2)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 20, 16, 6, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#5c4620";
              ctx.fillRect(p.x - 2, p.y - 2, 4, 22);

              ctx.beginPath();
              ctx.roundRect(p.x - 10, p.y - 18, 20, 16, 5);
              ctx.fillStyle = "#ffd75f";
              ctx.fill();

              ctx.strokeStyle = "#c18930";
              ctx.lineWidth = 1.5;
              ctx.stroke();
            } else if (dec.type === "mushroom") {
              ctx.fillStyle = "rgba(0,0,0,0.18)";
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 14, 18, 6, 0, 0, Math.PI * 2);
              ctx.fill();

              ctx.fillStyle = "#b84856";
              ctx.beginPath();
              ctx.arc(p.x, p.y + 2, 10, Math.PI, 0, false);
              ctx.fill();

              ctx.fillStyle = "#c4885f";
              ctx.fillRect(p.x - 2, p.y + 2, 4, 12);
            }
          }
        });
      });

      // Stations / Quiz Shrines (Upgraded visually)
      quizzes.forEach((quiz) => {
        drawables.push({
          depth: isoDepth(quiz.x + 0.5, quiz.y + 0.5) + 0.7,
          draw: () => {
            const p = isoProject(quiz.x + 0.5, quiz.y + 0.5);
            const done = solvedSet.has(quiz.id);
            const pulse = Math.sin(timeRef.current * 0.0025 + quiz.x + quiz.y) * 0.5 + 0.5;
            const bobY = Math.sin(timeRef.current * 0.0018 + quiz.x * 1.3) * 4.5;

            // Base ground glow
            if (done) {
              ctx.shadowColor = `rgba(245, 158, 11, ${0.4 + pulse * 0.25})`;
              ctx.shadowBlur = 18 + pulse * 12;
            } else {
              ctx.shadowColor = `${quiz.color}55`;
              ctx.shadowBlur = 10 + pulse * 8;
            }

            // Pedestal Shadow
            ctx.fillStyle = "rgba(10, 24, 15, 0.26)";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y + 20, 26, 11, 0, 0, Math.PI * 2);
            ctx.fill();

            ctx.shadowColor = "transparent";
            ctx.shadowBlur = 0;

            // 1. Draw solid stone pedestal base (ancient fantasy feel)
            ctx.fillStyle = "#334155"; // Deep slate
            ctx.beginPath();
            ctx.roundRect(p.x - 14, p.y - 2, 28, 20, 4);
            ctx.fill();
            
            // Stone details / highlight
            ctx.fillStyle = "#475569";
            ctx.beginPath();
            ctx.roundRect(p.x - 12, p.y + 1, 24, 16, 3);
            ctx.fill();

            // Pedestal crown plate
            ctx.fillStyle = "#64748b";
            ctx.beginPath();
            ctx.ellipse(p.x, p.y - 1, 14, 5, 0, 0, Math.PI * 2);
            ctx.fill();

            // 2. Draw Floating magical 3D faceted crystal
            const crystalY = p.y - 34 + bobY;
            const crystalH = 24;
            const crystalW = 10;
            const crystalColor = done ? "#facc15" : quiz.color;

            ctx.save();
            ctx.shadowColor = crystalColor;
            ctx.shadowBlur = done ? 16 + pulse * 10 : 10 + pulse * 6;

            // Crystal Left facet
            ctx.fillStyle = crystalColor;
            ctx.beginPath();
            ctx.moveTo(p.x, crystalY - crystalH / 2);
            ctx.lineTo(p.x - crystalW, crystalY);
            ctx.lineTo(p.x, crystalY + crystalH / 2);
            ctx.closePath();
            ctx.fill();

            // Crystal Right facet (lighter highlight for 3D depth)
            ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
            ctx.beginPath();
            ctx.moveTo(p.x, crystalY - crystalH / 2);
            ctx.lineTo(p.x + crystalW, crystalY);
            ctx.lineTo(p.x, crystalY + crystalH / 2);
            ctx.closePath();
            ctx.fill();

            ctx.restore();

            // 3. Draw expanding light energy ring around uncompleted Shrines
            if (!done) {
              const ringRadius = 14 + pulse * 14;
              ctx.strokeStyle = quiz.color;
              ctx.lineWidth = 1.5;
              ctx.globalAlpha = 1.0 - pulse;
              ctx.beginPath();
              ctx.ellipse(p.x, p.y + 10, ringRadius, ringRadius * 0.45, 0, 0, Math.PI * 2);
              ctx.stroke();
              ctx.globalAlpha = 1.0;
            }

            // 4. Draw continuous rising golden stardust trail for Completed Shrines
            if (done && Math.random() < 0.16) {
              sparklesRef.current.push({
                x: p.x + (Math.random() - 0.5) * 16,
                y: p.y - 10 - Math.random() * 45,
                vx: (Math.random() - 0.5) * 0.4,
                vy: -1.0 - Math.random() * 1.2,
                life: 0.9,
                decay: 0.02 + Math.random() * 0.02,
                size: 2 + Math.random() * 2.5,
                color: "#facc15"
              });
            }

            // Hovering Text label above crystal
            ctx.fillStyle = done ? "#fbbf24" : "#ffffff";
            ctx.font = "900 12px 'Inter', sans-serif";
            ctx.textAlign = "center";
            ctx.fillText(done ? "★" : quiz.icon, p.x, crystalY - 18);

            // Host label below Pedestal
            ctx.fillStyle = "#f8fafc";
            ctx.font = "800 10px 'Inter', sans-serif";
            ctx.fillText(quiz.host, p.x, p.y + 30);
          }
        });
      });

      // Companion Spirit/Firefly Guardian (Bobbing and floating)
      drawables.push({
        depth: isoDepth(petPosRef.current.x, petPosRef.current.y) + 0.94,
        draw: () => {
          const petFloatY = Math.sin(timeRef.current * 0.0035) * 5;
          const p = isoProject(petPosRef.current.x, petPosRef.current.y, 42); // floats higher
          const pulse = Math.sin(timeRef.current * 0.015) * 0.25 + 0.75;

          ctx.save();
          ctx.shadowColor = "#38bdf8";
          ctx.shadowBlur = 14 + pulse * 10;
          ctx.fillStyle = `rgba(186, 230, 253, ${0.85 + pulse * 0.15})`;
          ctx.beginPath();
          ctx.arc(p.x, p.y + petFloatY, 4.5, 0, Math.PI * 2);
          ctx.fill();

          // Small companion magical trail
          if (Math.random() < 0.25) {
            sparklesRef.current.push({
              x: p.x + (Math.random() - 0.5) * 6,
              y: p.y + petFloatY + (Math.random() - 0.5) * 6,
              vx: (Math.random() - 0.5) * 0.4,
              vy: 0.1 + Math.random() * 0.4,
              life: 0.7,
              decay: 0.05,
              size: 1.2 + Math.random() * 1.5,
              color: "#60a5fa"
            });
          }
          ctx.restore();
        }
      });

      // Player Drawable
      drawables.push({
        depth: isoDepth(playerPosRef.current.x, playerPosRef.current.y) + 0.9,
        draw: () => {
          const bob = Math.sin(timeRef.current * 0.012) * 2;
          const p = isoProject(playerPosRef.current.x, playerPosRef.current.y, 18 + bob);
          
          // Draw Shadow
          ctx.fillStyle = "rgba(0,0,0,0.22)";
          ctx.beginPath();
          ctx.ellipse(p.x, p.y + 54, 26, 10, 0, 0, Math.PI * 2);

          ctx.fill();

          // Procedural high DPI character drawing
          ctx.save();
          ctx.translate(p.x, p.y + 36);

          const characterBob = playerStateRef.current === 'idle' ? Math.sin(timeRef.current * 0.005) * 1.5 : Math.sin(timeRef.current * 0.01) * 3;
          ctx.translate(0, characterBob);

          // 1. Draw backpack
          ctx.fillStyle = "#8d583d";
          ctx.beginPath();
          ctx.roundRect(-13, -18, 26, 20, 6);
          ctx.fill();
          ctx.fillStyle = "#5c3a27";
          ctx.fillRect(-13, -8, 26, 3);

          // 2. Body (Shirt)
          ctx.fillStyle = selectedCharacter.shirt;
          ctx.beginPath();
          ctx.roundRect(-10, -12, 20, 22, 5);
          ctx.fill();

          // 3. Pants/Legs
          ctx.fillStyle = selectedCharacter.pants;
          ctx.fillRect(-8, 10, 16, 8);

          // Little shoes
          ctx.fillStyle = "#222222";
          ctx.beginPath();
          ctx.roundRect(-9, 18, 7, 5, 2);
          ctx.roundRect(2, 18, 7, 5, 2);
          ctx.fill();

          // 4. Head/Skin
          ctx.fillStyle = selectedCharacter.skin;
          ctx.beginPath();
          ctx.arc(0, -22, 11, 0, Math.PI * 2);
          ctx.fill();

          // Cute blushing cheeks
          ctx.fillStyle = "rgba(251, 113, 133, 0.5)";
          ctx.beginPath();
          ctx.arc(-7, -20, 2, 0, Math.PI * 2);
          ctx.arc(7, -20, 2, 0, Math.PI * 2);
          ctx.fill();

          // 5. Hair
          ctx.fillStyle = selectedCharacter.hair;
          ctx.beginPath();
          ctx.arc(0, -25, 11, Math.PI, 0); // Hair cap
          ctx.fill();
          
          if (playerDirectionRef.current !== "back") {
            ctx.beginPath();
            ctx.arc(-7, -23, 4, 0, Math.PI * 2);
            ctx.arc(7, -23, 4, 0, Math.PI * 2);
            ctx.fill();
          }

          // Eyes and mouth
          if (playerDirectionRef.current !== "back") {
            ctx.fillStyle = "#1e293b";
            if (playerStateRef.current === 'thinking') {
              ctx.lineWidth = 1.5;
              ctx.strokeStyle = "#1e293b";
              ctx.beginPath();
              ctx.moveTo(-6, -21); ctx.lineTo(-3, -21);
              ctx.moveTo(3, -21); ctx.lineTo(6, -21);
              ctx.stroke();
            } else {
              ctx.beginPath();
              ctx.arc(-4, -22, 1.8, 0, Math.PI * 2);
              ctx.arc(4, -22, 1.8, 0, Math.PI * 2);
              ctx.fill();
            }

            // Smiling mouth
            ctx.strokeStyle = "#334155";
            ctx.lineWidth = 1.5;
            ctx.beginPath();
            if (playerStateRef.current === 'success') {
              ctx.fillStyle = "#f43f5e";
              ctx.beginPath();
              ctx.arc(0, -17, 3, 0, Math.PI);
              ctx.fill();
            } else {
              ctx.arc(0, -18, 2.5, 0.1 * Math.PI, 0.9 * Math.PI);
              ctx.stroke();
            }
          }

          // Cute explorer hat
          ctx.fillStyle = "#475569";
          ctx.beginPath();
          ctx.ellipse(0, -28, 13, 3, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.beginPath();
          ctx.roundRect(-8, -35, 16, 8, [4, 4, 0, 0]);
          ctx.fill();
          ctx.fillStyle = "#facc15"; // gold band
          ctx.fillRect(-8, -29, 16, 2.5);

          ctx.restore();
        }
      });

      // Sort and Draw everything in isometric projection space
      drawables.sort((a, b) => a.depth - b.depth);
      drawables.forEach((item) => item.draw());

      ctx.restore();

      // Render Screen space particles
      // 1. Confetti pieces
      particlesRef.current = particlesRef.current.filter((p) => p.life > 0);
      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.12;
        p.vx *= 0.97;
        p.life -= p.decay;
        p.rot += p.rotV;

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.roundRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6, 2);
        ctx.fill();
        ctx.restore();
      });

      // 2. Stars and Sparkles
      const w = canvas.clientWidth;
      const h = canvas.clientHeight;
      sparklesRef.current = sparklesRef.current.filter((s) => s.ambient || s.life > 0);
      sparklesRef.current.forEach((s) => {
        if (s.ambient) {
          s.phase += 0.022;
          const alpha = (Math.sin(s.phase) * 0.5 + 0.5) * 0.65;
          ctx.globalAlpha = alpha;
          ctx.fillStyle = "#fde047";
          ctx.beginPath();
          const sz = Math.max(0.01, s.size * (0.6 + Math.sin(s.phase * 1.3) * 0.4));
          ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
          ctx.fill();
          if (s.phase > Math.PI * 20 && Math.random() < 0.003) {
            s.x = Math.random() * w;
            s.y = Math.random() * h;
            s.phase = 0;
          }
        } else {
          s.x += s.vx;
          s.y += s.vy;
          s.life -= s.decay;
          ctx.globalAlpha = Math.max(0, s.life);
          ctx.fillStyle = s.color || "#fde047";
          const sz = Math.max(0.01, s.size * s.life);
          ctx.beginPath();
          ctx.arc(s.x, s.y, sz, 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.globalAlpha = 1.0;
      });

      // 3. Falling Forest Leaves (Wind-blown drift animation)
      leavesRef.current.forEach((leaf) => {
        leaf.swingPhase += leaf.swingSpeed;
        leaf.x += leaf.speedX + Math.sin(leaf.swingPhase) * leaf.swingRange * 0.2;
        leaf.y += leaf.speedY;
        leaf.angle += 0.008;

        // Reset off-screen leaf
        if (leaf.y > h + 15) {
          leaf.y = -15;
          leaf.x = Math.random() * w;
        }
        if (leaf.x > w + 15) {
          leaf.x = -15;
        }

        ctx.save();
        ctx.translate(leaf.x, leaf.y);
        ctx.rotate(leaf.angle);
        ctx.fillStyle = leaf.color;
        ctx.globalAlpha = 0.65;
        
        // Render beautiful soft organic leaf shape
        ctx.beginPath();
        ctx.ellipse(0, 0, leaf.size, leaf.size * 0.48, 0, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = "rgba(255, 255, 255, 0.2)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-leaf.size, 0);
        ctx.lineTo(leaf.size, 0);
        ctx.stroke();
        
        ctx.restore();
      });
      ctx.globalAlpha = 1.0;

      // 4. Volumetric God Rays (Forest canopy light rays)
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      for (let i = 0; i < 3; i++) {
        const rayTime = timeRef.current * 0.00035 + i * 2.1;
        const width = 75 + Math.sin(rayTime) * 25;
        const startX = -120 + i * 260 + Math.sin(rayTime * 0.45) * 70;
        
        const grad = ctx.createLinearGradient(startX, -40, startX + 380, h + 40);
        grad.addColorStop(0, "rgba(255, 253, 215, 0.15)");
        grad.addColorStop(0.5, "rgba(255, 251, 195, 0.055)");
        grad.addColorStop(1, "rgba(255, 251, 195, 0)");
        
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(startX - width / 2, -40);
        ctx.lineTo(startX + width / 2, -40);
        ctx.lineTo(startX + width / 2 + 350, h + 40);
        ctx.lineTo(startX - width / 2 + 350, h + 40);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();

      // 5. Cinematic Vignette (Locks the composition together)
      const vignetteGrad = ctx.createRadialGradient(
        w / 2, h / 2, w / 3,
        w / 2, h / 2, Math.hypot(w, h) / 2
      );
      vignetteGrad.addColorStop(0, "rgba(0,0,0,0)");
      vignetteGrad.addColorStop(1, "rgba(9, 23, 15, 0.32)");
      ctx.fillStyle = vignetteGrad;
      ctx.fillRect(0, 0, w, h);


      animFrameId = requestAnimationFrame(render);
    };

    render();

    return () => cancelAnimationFrame(animFrameId);
  }, [quizzes, solvedSet, zoom, cameraAngle, selectedCharacter]);

  // Click on isometric canvas triggers near quiz
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    tryOpenNearbyQuiz();
  };

  // D-Pad movement triggers
  const handleDpadStart = (dir: string) => {
    keysPressedRef.current.add(dir);
    if (dir === "arrowup") playerDirectionRef.current = "back";
    else if (dir === "arrowdown") playerDirectionRef.current = "front";
    else if (dir === "arrowleft") playerDirectionRef.current = "left";
    else if (dir === "arrowright") playerDirectionRef.current = "right";
  };

  const handleDpadEnd = (dir: string) => {
    keysPressedRef.current.delete(dir);
  };

  // Answering quiz
  const handleAnswerClick = (index: number) => {
    if (!activeQuiz || quizStatus !== "none") return;
    
    setQuizSelectedOption(index);
    const isCorrect = index === activeQuiz.correct;

    if (isCorrect) {
      playSound('correct');
      setQuizStatus("correct");
      setQuizFeedback("🌟 완벽합니다! IB 핵심 개념 질문에 성공적으로 답하셨습니다!");
      playerStateRef.current = "success";
      
      const newSolvedSet = new Set(solvedSet);
      newSolvedSet.add(activeQuiz.id);
      setSolvedSet(newSolvedSet);

      // Trigger standard confetti
      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      // Canvas burst
      const center = getScreenCenter();
      spawnConfettiBurst(center.x, center.y);
      spawnStarBurst(center.x, center.y);

      // Verify all 7 concepts cleared!
      if (newSolvedSet.size === 7) {
        setTimeout(() => {
          setIsCleared(true);
          playSound('win');
          const duration = Math.floor((Date.now() - startTime) / 1000);
          onEarnXP(50, 'study', 1.0, duration);
          
          confetti({
            particleCount: 150,
            spread: 90,
            origin: { y: 0.5 },
            colors: ['#10b981', '#34d399', '#6ee7b7', '#fbbf24', '#ffffff']
          });
        }, 1200);
      }

      setTimeout(() => {
        setActiveQuiz(null);
        playerStateRef.current = "idle";
      }, 1500);

    } else {
      playSound('wrong');
      setQuizStatus("wrong");
      setQuizFeedback(`아쉽습니다! 정답은 [ ${activeQuiz.answers[activeQuiz.correct]} ] 입니다.`);
      playerStateRef.current = "thinking";

      setTimeout(() => {
        setActiveQuiz(null);
        playerStateRef.current = "idle";
      }, 2000);
    }
  };

  const handleResetGame = () => {
    playSound('click');
    setSolvedSet(new Set());
    playerPosRef.current = { x: 7.5, y: 7.5 };
    cameraPosRef.current = { x: 7.5, y: 7.5 };
    playerDirectionRef.current = "front";
    playerStateRef.current = "idle";
    setIsCleared(false);
    
    // Re-shuffle quizzes
    const initialQuizzes = QUIZZES_SET1.map((q, i) => {
      return Math.random() > 0.5 ? { ...q } : { ...QUIZZES_SET2[i] };
    });
    setQuizzes(initialQuizzes);
  };

  const handleCenterSquare = () => {
    playSound('click');
    playerPosRef.current = { x: 7.5, y: 7.5 };
    cameraPosRef.current = { x: 7.5, y: 7.5 };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#111e17] via-[#0b1c12] to-[#122218] text-white flex flex-col p-4 sm:p-6 pb-24 md:pb-6 font-sans">
      
      {/* Top Header */}
      <div className="max-w-6xl w-full mx-auto flex items-center justify-between mb-4 z-10">
        <Button 
          variant="outline" 
          onClick={() => setView('home')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-emerald-500/30 text-emerald-100 hover:bg-emerald-800/40 text-xs font-black cursor-pointer bg-emerald-950/40"
        >
          <ArrowLeft className="w-4 h-4" />
          홈으로 돌아가기
        </Button>
        <div className="flex items-center gap-2 bg-emerald-800/30 px-4 py-2 rounded-full border border-emerald-500/30 text-xs font-black text-emerald-200">
          <Trees className="w-4 h-4 text-emerald-400 animate-pulse" />
          <span>개념의 숲 탐험</span>
        </div>
      </div>

      {/* Main Grid: Game Stage & Sidebar */}
      <div className="max-w-6xl w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch flex-1 z-10">
        
        {/* Left Canvas Panel: Isometric Stage */}
        <div ref={containerRef} className="lg:col-span-8 relative rounded-3xl overflow-hidden border border-emerald-500/20 bg-gradient-to-b from-[#7dd3fc] via-[#a7f3d0] to-[#fde047] shadow-2xl h-[460px] lg:h-[580px] flex flex-col">
          <canvas 
            ref={canvasRef} 
            onClick={handleCanvasClick}
            className="w-full h-full block cursor-pointer"
          />

          {/* Quick HUD guide pill */}
          <div className="absolute left-4 bottom-4 bg-emerald-950/90 border border-emerald-500/30 rounded-full px-4 py-2 text-[11px] font-bold text-emerald-200 shadow-xl backdrop-blur-md max-w-[85%] pointer-events-none">
            {nearestQuiz() && nearestQuiz()!.dist < 1.15 ? (
              <span className="text-amber-300 animate-pulse font-black">
                💡 [Space] 또는 [클릭]으로 {nearestQuiz()!.quiz.host} 탐구 시작!
              </span>
            ) : (
              <span>키보드 WASD / 방향키로 이동 • 마우스 휠로 지도 조절</span>
            )}
          </div>

          {/* Dash Mode Toggle Button (Mobile & Desktop friendly) */}
          <div className="absolute right-4 top-4">
            <button
              onClick={() => {
                playSound('click');
                setDashActive(!dashActive);
              }}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black border transition-all flex items-center gap-1.5 cursor-pointer shadow-xl backdrop-blur-md ${
                dashActive 
                  ? "bg-sky-500/90 text-white border-sky-400 animate-pulse shadow-sky-500/25" 
                  : "bg-emerald-950/80 text-emerald-300 border-emerald-500/20 hover:bg-emerald-900/60"
              }`}
            >
              <span>🏃</span>
              <span>숲 질주 {dashActive ? "ON" : "OFF"}</span>
            </button>
          </div>


          {/* Isometric Controls Toolbar */}
          <div className="absolute left-4 top-4 flex flex-col gap-2">
            
            {/* Zoom Widget */}
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/20 px-2 py-1.5 rounded-2xl shadow-xl backdrop-blur-md">
              <button 
                onClick={() => setZoom(z => Math.max(0.65, z - 0.15))}
                className="p-1.5 bg-emerald-800/50 hover:bg-emerald-700/60 rounded-xl text-white cursor-pointer transition-transform active:scale-90"
                title="지도 축소"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <span className="text-[10px] font-black w-8 text-center text-emerald-200 tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <button 
                onClick={() => setZoom(z => Math.min(1.75, z + 0.15))}
                className="p-1.5 bg-emerald-800/50 hover:bg-emerald-700/60 rounded-xl text-white cursor-pointer transition-transform active:scale-90"
                title="지도 확대"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Rotation Widget */}
            <div className="flex items-center gap-1.5 bg-emerald-950/80 border border-emerald-500/20 px-2 py-1.5 rounded-2xl shadow-xl backdrop-blur-md self-start">
              <button 
                onClick={() => setCameraAngle(a => a - Math.PI / 2)}
                className="p-1.5 bg-indigo-900/50 hover:bg-indigo-800/60 rounded-xl text-white cursor-pointer transition-transform active:scale-90"
                title="왼쪽 90도 회전"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <span className="text-[9px] font-black text-indigo-300 px-1 uppercase tracking-widest">
                Q / E
              </span>
              <button 
                onClick={() => setCameraAngle(a => a + Math.PI / 2)}
                className="p-1.5 bg-indigo-900/50 hover:bg-indigo-800/60 rounded-xl text-white cursor-pointer transition-transform active:scale-90"
                title="오른쪽 90도 회전"
              >
                <RotateCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Touch D-Pad for Mobile users (Bottom Right) */}
          <div className="absolute right-4 bottom-4 grid grid-cols-3 gap-1 p-1 bg-white/10 backdrop-blur-md rounded-2xl border border-white/20 shadow-2xl">
            <div />
            <button
              onMouseDown={() => handleDpadStart('arrowup')}
              onMouseUp={() => handleDpadEnd('arrowup')}
              onMouseLeave={() => handleDpadEnd('arrowup')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadStart('arrowup'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadEnd('arrowup'); }}
              className="w-10 h-10 bg-emerald-950/85 hover:bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-xs cursor-pointer select-none active:scale-90 transition-transform"
            >
              ▲
            </button>
            <div />
            
            <button
              onMouseDown={() => handleDpadStart('arrowleft')}
              onMouseUp={() => handleDpadEnd('arrowleft')}
              onMouseLeave={() => handleDpadEnd('arrowleft')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadStart('arrowleft'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadEnd('arrowleft'); }}
              className="w-10 h-10 bg-emerald-950/85 hover:bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-xs cursor-pointer select-none active:scale-90 transition-transform"
            >
              ◀
            </button>
            <button
              onMouseDown={() => handleDpadStart('arrowdown')}
              onMouseUp={() => handleDpadEnd('arrowdown')}
              onMouseLeave={() => handleDpadEnd('arrowdown')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadStart('arrowdown'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadEnd('arrowdown'); }}
              className="w-10 h-10 bg-emerald-950/85 hover:bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-xs cursor-pointer select-none active:scale-90 transition-transform"
            >
              ▼
            </button>
            <button
              onMouseDown={() => handleDpadStart('arrowright')}
              onMouseUp={() => handleDpadEnd('arrowright')}
              onMouseLeave={() => handleDpadEnd('arrowright')}
              onTouchStart={(e) => { e.preventDefault(); handleDpadStart('arrowright'); }}
              onTouchEnd={(e) => { e.preventDefault(); handleDpadEnd('arrowright'); }}
              className="w-10 h-10 bg-emerald-950/85 hover:bg-emerald-900 rounded-xl flex items-center justify-center text-white font-black text-xs cursor-pointer select-none active:scale-90 transition-transform"
            >
              ▶
            </button>
          </div>
        </div>

        {/* Right Sidebar: Character & Concept Tracker */}
        <div className="lg:col-span-4 flex flex-col justify-between gap-4 h-full">
          
          {/* Active Player RPG Card */}
          <div className="p-5 bg-gradient-to-b from-[#112a1b] to-[#0c1f13] rounded-3xl border border-emerald-500/20 shadow-xl flex flex-col gap-4 relative overflow-hidden">
            {/* Ambient subtle glow */}
            <div className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl opacity-20" style={{ backgroundColor: selectedCharacter.shirt }} />
            
            <div className="flex gap-4">
              {/* Animated Avatar Box */}
              <div 
                className="w-16 h-16 rounded-2xl border-2 shadow-lg flex flex-col items-center justify-center relative overflow-hidden shrink-0"
                style={{ 
                  borderColor: selectedCharacter.shirt,
                  boxShadow: `0 8px 16px ${selectedCharacter.shirt}25`,
                  background: `linear-gradient(135deg, #102a1b, ${selectedCharacter.shirt}40)`
                }}
              >
                <span className="text-3xl select-none">{CHARACTER_DETAILS[selectedCharacter.id]?.emoji || "🎒"}</span>
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-[8px] font-extrabold text-center text-white/95 py-0.5 uppercase tracking-widest leading-none">
                  LV.1
                </span>
              </div>

              {/* Character Identity & RPG Stats */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <h3 className="text-sm font-black text-white">{selectedCharacter.name}</h3>
                  <span className="text-[8px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 uppercase tracking-wide">
                    {CHARACTER_DETAILS[selectedCharacter.id]?.specialty}
                  </span>
                </div>
                <p className="text-[10px] text-emerald-400 font-medium mt-1 leading-relaxed line-clamp-2">
                  {CHARACTER_DETAILS[selectedCharacter.id]?.desc}
                </p>
              </div>
            </div>

            {/* Character Selection Grid */}
            <div className="grid grid-cols-4 gap-1.5 bg-[#07130b] p-1 rounded-2xl border border-emerald-950">
              {CHARACTERS.map((char) => (
                <button
                  key={char.id}
                  onClick={() => {
                    playSound('click');
                    setSelectedCharacter(char);
                  }}
                  className={`py-1.5 rounded-xl text-[10px] font-black transition-all cursor-pointer flex flex-col items-center gap-0.5 ${
                    selectedCharacter.id === char.id 
                      ? "bg-gradient-to-b from-emerald-400 to-emerald-500 text-emerald-950 font-black shadow-md shadow-emerald-500/20 scale-105" 
                      : "text-emerald-400 hover:text-white hover:bg-emerald-950/40"
                  }`}
                >
                  <span className="text-xs">{CHARACTER_DETAILS[char.id]?.emoji}</span>
                  <span className="text-[9px]">{char.name.split(" ")[1]}</span>
                </button>
              ))}
            </div>

            {/* RPG Character Attributes */}
            <div className="space-y-1.5 bg-[#07130b]/60 p-3 rounded-2xl border border-emerald-950/50 text-[10px] font-bold text-emerald-300">
              <div className="flex items-center justify-between">
                <span>🏃 탐험 속도:</span>
                <span className="text-amber-400">
                  {"✦".repeat(CHARACTER_DETAILS[selectedCharacter.id]?.speed || 3)}
                  {"✧".repeat(5 - (CHARACTER_DETAILS[selectedCharacter.id]?.speed || 3))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>🧠 개념 직관:</span>
                <span className="text-teal-400">
                  {"✦".repeat(CHARACTER_DETAILS[selectedCharacter.id]?.wisdom || 4)}
                  {"✧".repeat(5 - (CHARACTER_DETAILS[selectedCharacter.id]?.wisdom || 4))}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span>🍀 탐구 행운:</span>
                <span className="text-indigo-400">
                  {"✦".repeat(CHARACTER_DETAILS[selectedCharacter.id]?.luck || 3)}
                  {"✧".repeat(5 - (CHARACTER_DETAILS[selectedCharacter.id]?.luck || 3))}
                </span>
              </div>
              <div className="text-[9px] text-gray-400 italic text-center mt-2 pt-2 border-t border-emerald-950/50">
                {CHARACTER_DETAILS[selectedCharacter.id]?.quote}
              </div>
            </div>
          </div>

          {/* Dynamic 7 Concepts progress list */}
          <div className="flex-1 bg-[#102a1b]/40 border border-emerald-500/10 rounded-3xl p-4 flex flex-col gap-2 shadow-inner min-h-[220px]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] font-black text-emerald-400 uppercase tracking-widest">탐구 완성도</span>
              <span className="text-[11px] font-black text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded-md">
                ★ {solvedSet.size} / 7
              </span>
            </div>

            <div className="flex-1 flex flex-col gap-1.5 overflow-y-auto">
              {quizzes.map((quiz) => {
                const isDone = solvedSet.has(quiz.id);
                return (
                  <div 
                    key={quiz.id}
                    className={`flex items-center justify-between p-2 rounded-2xl border transition-all ${
                      isDone 
                        ? "bg-emerald-500/10 border-emerald-500/30" 
                        : "bg-emerald-950/20 border-emerald-950/40 opacity-70"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <div 
                        className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black shadow-sm animate-fade-in"
                        style={{ 
                          background: isDone ? '#fbbf24' : quiz.color,
                          color: isDone ? '#1e293b' : '#ffffff'
                        }}
                      >
                        {isDone ? '★' : quiz.icon}
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-emerald-100">{quiz.host}</h4>
                        <span className="text-[9px] font-bold text-emerald-400">{quiz.concept}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-full bg-emerald-900/60 text-emerald-300">
                        {isDone ? '탐색 완료' : '미방문'}
                      </span>
                      <div 
                        className={`w-2.5 h-2.5 rounded-full ${
                          isDone ? 'bg-amber-400 shadow-md shadow-amber-400/40 animate-pulse' : 'bg-emerald-900'
                        }`} 
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Common Utility Controls */}
          <div className="grid grid-cols-2 gap-3 mt-1.5">
            <button 
              onClick={handleResetGame}
              className="py-3 bg-emerald-950/50 hover:bg-emerald-900/60 border border-emerald-500/20 rounded-2xl text-xs font-black text-emerald-200 cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-lg"
            >
              <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
              처음부터 다시
            </button>
            <button 
              onClick={handleCenterSquare}
              className="py-3 bg-emerald-800 hover:bg-emerald-700 rounded-2xl text-xs font-black text-white cursor-pointer flex items-center justify-center gap-1.5 transition-transform active:scale-95 shadow-lg border-b-4 border-emerald-950"
            >
              <Compass className="w-3.5 h-3.5" />
              중앙 광장으로
            </button>
          </div>
        </div>

      </div>

      {/* QUIZ DIALOG / MODAL */}
      <AnimatePresence>
        {activeQuiz && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-[#0a110d]/80 backdrop-blur-md z-50 flex items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: 20 }}
              className="max-w-lg w-full bg-gradient-to-b from-[#112419] to-[#0a160f] border border-emerald-500/20 rounded-3xl p-6 relative overflow-hidden shadow-2xl"
            >
              {/* Decorative radial glows */}
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />

              {/* Close Button */}
              <button 
                onClick={() => {
                  playSound('click');
                  setActiveQuiz(null);
                  playerStateRef.current = "idle";
                }}
                className="absolute top-4 right-4 text-emerald-400 hover:text-white font-black text-lg p-1 hover:bg-emerald-900/40 rounded-full w-8 h-8 flex items-center justify-center cursor-pointer transition-colors border border-emerald-800/20"
              >
                ×
              </button>

              <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase">
                {activeQuiz.host} • {activeQuiz.concept}
              </span>
              <h3 className="text-base sm:text-lg font-black text-white leading-relaxed mt-1.5 mb-6">
                {activeQuiz.title}
              </h3>

              {/* Answer options list */}
              <div className="flex flex-col gap-2.5">
                {activeQuiz.answers.map((answer, index) => {
                  let btnStyle = "bg-emerald-950/40 border-emerald-900 hover:bg-emerald-900/30 text-emerald-100 hover:border-emerald-700";

                  if (quizSelectedOption === index) {
                    if (quizStatus === "correct") {
                      btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-200 ring-2 ring-emerald-400/50 shadow-md";
                    } else if (quizStatus === "wrong") {
                      btnStyle = "bg-rose-500/20 border-rose-400 text-rose-200 ring-2 ring-rose-400/50 shadow-md";
                    }
                  } else if (quizStatus !== "none") {
                    if (index === activeQuiz.correct) {
                      // Show actual correct answer even if the user got it wrong
                      btnStyle = "bg-emerald-500/20 border-emerald-400 text-emerald-200";
                    } else {
                      btnStyle = "opacity-20 pointer-events-none border-transparent text-white/30";
                    }
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleAnswerClick(index)}
                      disabled={quizStatus !== "none"}
                      className={`w-full p-4 rounded-2xl border text-left text-xs sm:text-sm font-black transition-all duration-200 cursor-pointer flex items-center justify-between ${btnStyle}`}
                    >
                      <span>{index + 1}. {answer}</span>
                      {quizStatus !== "none" && index === activeQuiz.correct && (
                        <span className="text-[10px] bg-emerald-500 text-emerald-950 font-black px-2 py-0.5 rounded-full">
                          정답
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Feedback messages */}
              <AnimatePresence>
                {quizFeedback && (
                  <motion.div 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className={`mt-5 p-3.5 rounded-2xl border text-xs font-black text-center shadow-inner ${
                      quizStatus === "correct" 
                        ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-300" 
                        : "bg-rose-500/10 border-rose-500/20 text-rose-300"
                    }`}
                  >
                    {quizStatus === "correct" ? "🌟" : "💡"} {quizFeedback}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* STAGE CLEARED OVERLAY */}
      <AnimatePresence>
        {isCleared && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="fixed inset-0 bg-[#070e0a]/90 backdrop-blur-lg z-50 flex flex-col items-center justify-center p-4"
          >
            <motion.div 
              initial={{ scale: 0.8, rotate: -3 }}
              animate={{ scale: 1, rotate: 0 }}
              className="max-w-md w-full bg-gradient-to-b from-emerald-950/80 to-emerald-900/40 border border-emerald-500/30 rounded-3xl p-8 flex flex-col items-center text-center shadow-2xl relative"
            >
              <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-yellow-500 rounded-2xl flex items-center justify-center mb-5 shadow-xl animate-bounce">
                <Trophy className="w-9 h-9 text-emerald-950" />
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-amber-200 tracking-tight">
                개념의 숲 탐험 완료!
              </h2>
              <p className="text-xs sm:text-sm text-emerald-200 font-bold max-w-sm mt-3 leading-relaxed">
                멋져요! 7가지 IB 핵심 개념을 모두 배우고 개념 나무 아래 지혜의 열매를 수확하셨습니다!
              </p>

              <div className="mt-5 px-4 py-2 bg-emerald-500/15 border border-emerald-400/40 rounded-full font-black text-emerald-300 text-xs sm:text-sm flex items-center gap-1.5 shadow-md">
                <Sparkles className="w-4 h-4 text-emerald-400 animate-spin" />
                <span>탐험 완주 보상: +50 XP 획득!</span>
              </div>

              <div className="flex gap-3 w-full mt-8">
                <Button
                  onClick={handleResetGame}
                  variant="outline"
                  className="flex-1 py-3.5 text-xs font-black border border-emerald-500/30 text-emerald-200 hover:bg-emerald-900/50 bg-emerald-950/20 cursor-pointer rounded-2xl"
                >
                  <RefreshCw className="w-3.5 h-3.5 mr-1" />
                  다시 탐험하기
                </Button>
                <Button
                  onClick={() => setView('home')}
                  className="flex-1 py-3.5 text-xs font-black bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 border-b-4 border-emerald-800 cursor-pointer text-white rounded-2xl"
                >
                  홈으로 돌아가기
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};
