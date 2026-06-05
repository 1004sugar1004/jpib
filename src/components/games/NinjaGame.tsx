import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Play, 
  RotateCcw, 
  Sparkles, 
  Award, 
  BookOpen, 
  Volume2, 
  VolumeX, 
  Camera as CameraIcon, 
  MousePointer, 
  AlertCircle,
  HelpCircle,
  Clock
} from 'lucide-react';

interface NinjaGameProps {
  soundEnabled: boolean;
}

interface IBTerm {
  id: number;
  type: 'profile' | 'concept';
  kr: string;
  en: string;
  desc: string;
}

const ibTerms: IBTerm[] = [
  { id: 1, type: "profile", kr: "탐구하는 사람", en: "Inquirers", desc: "호기심을 넓혀 연구 능력을 기르는 탐구자" },
  { id: 2, type: "profile", kr: "지식 있는 사람", en: "Knowledgeable", desc: "학문 전반에 걸쳐 유익한 지식을 탐색하는 지식인" },
  { id: 3, type: "profile", kr: "생각하는 사람", en: "Thinkers", desc: "이성적이고 창의적으로 복잡한 문제를 해결하려 노력" },
  { id: 4, type: "profile", kr: "소통하는 사람", en: "Communicators", desc: "여러 나라 언어와 다양한 방법으로 자신 있게 생각 전파" },
  { id: 5, type: "profile", kr: "원칙을 지키는 사람", en: "Principled", desc: "공정하고 도덕적이며 정직하게 세상을 대하는 시민" },
  { id: 6, type: "profile", kr: "열린 마음을 가진 사람", en: "Open-minded", desc: "타인의 문화와 가치를 포용하고 다름을 이해" },
  { id: 7, type: "profile", kr: "배려하는 사람", en: "Caring", desc: "이웃과 주변 사회에 긍정적인 영향을 끼치는 온정" },
  { id: 8, type: "profile", kr: "도전하는 사람", en: "Risk-takers", desc: "새로운 변화에 맞서 창의적이고 용감하게 탐색" },
  { id: 9, type: "profile", kr: "균형 잡힌 사람", en: "Balanced", desc: "지식, 몸, 마음을 다스려 조화로운 자아를 완성" },
  { id: 10, type: "profile", kr: "성찰하는 사람", en: "Reflective", desc: "학습 내용과 삶의 경험을 바탕으로 되돌아보는 인물" },
  { id: 11, type: "concept", kr: "형태", en: "Form", desc: "사물의 특징이 어떻게 관찰되는지 탐색" },
  { id: 12, type: "concept", kr: "기능", en: "Function", desc: "대상이나 구조가 어떤 원리로 작용하는지 파악" },
  { id: 13, type: "concept", kr: "인과 관계", en: "Causation", desc: "일어난 일들의 원인과 결과를 유추" },
  { id: 14, type: "concept", kr: "변형", en: "Transformation", desc: "시간과 상황에 따른 역동적 변화를 고찰" },
  { id: 15, type: "concept", kr: "관점", en: "Perspective", desc: "다양한 시각과 각도에서 가치를 이해" },
  { id: 16, type: "concept", kr: "책임", en: "Responsibility", desc: "자신이 내린 행동과 결정에 따르는 의무" },
  { id: 17, type: "concept", kr: "연결", en: "Connection", desc: "개별 사건이나 시스템 간의 거미줄 같은 관계" }
];

const fruitTemplates = [
  { name: 'Apple', color: '#ff3344', innerColor: '#ffeaad', type: 'circle' as const },
  { name: 'Orange', color: '#ffaa00', innerColor: '#ffdd77', type: 'circle' as const },
  { name: 'Watermelon', color: '#11dd44', innerColor: '#ff2255', type: 'stripe' as const },
  { name: 'Banana', color: '#ffee00', innerColor: '#fffaaa', type: 'curve' as const },
  { name: 'Strawberry', color: '#ff1177', innerColor: '#ff99bb', type: 'heart' as const }
];

class SoundFX {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  constructor(enabled: boolean) {
    this.enabled = enabled;
  }

  updateEnabled(enabled: boolean) {
    this.enabled = enabled;
  }

  private init() {
    if (!this.ctx && this.enabled) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
  }

  playSlice() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(500, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.12);
      gain.gain.setValueAtTime(0.2, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.12);
    } catch (e) {
      console.error(e);
    }
  }

  playJuice() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(180, this.ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(40, this.ctx.currentTime + 0.22);
      gain.gain.setValueAtTime(0.3, this.ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      osc.stop(this.ctx.currentTime + 0.22);
    } catch (e) {
      console.error(e);
    }
  }

  playCombo() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [587.33, 698.46, 880.00, 1174.66]; // D5, F5, A5, D6
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.1, now + idx * 0.05);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.05 + 0.2);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.05);
        osc.stop(now + idx * 0.05 + 0.2);
      });
    } catch (e) {
      console.error(e);
    }
  }

  playGameOver() {
    this.init();
    if (!this.ctx || !this.enabled) return;
    try {
      const now = this.ctx.currentTime;
      const notes = [659.25, 523.25, 392.00, 261.63];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.12 + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.35);
      });
    } catch (e) {
      console.error(e);
    }
  }
}

// 4분할 파편 셰이더 조각 클래스
class SlicedShard {
  x: number;
  y: number;
  radius: number;
  angle: number;
  spin: number;
  color: string;
  innerColor: string;
  shardIndex: number;
  life: number;
  vx: number;
  vy: number;
  gravity: number;

  constructor(x: number, y: number, radius: number, angle: number, spin: number, color: string, innerColor: string, shardIndex: number, slashVx: number, gravityRatio: number) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.angle = angle;
    this.spin = spin * 1.8 + (Math.random() - 0.5) * 0.12;
    this.color = color;
    this.innerColor = innerColor;
    this.shardIndex = shardIndex; // 0, 1, 2, 3
    this.life = 1.0;

    const quadrantAngles = [0.25 * Math.PI, 0.75 * Math.PI, 1.25 * Math.PI, 1.75 * Math.PI];
    const radialAngle = quadrantAngles[shardIndex] + angle; 
    const speed = 4.5 + Math.random() * 5.5;

    this.vx = Math.cos(radialAngle) * speed + slashVx * 0.18;
    this.vy = Math.sin(radialAngle) * speed - 2.5;
    this.gravity = gravityRatio;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.angle += this.spin;
    this.life -= 0.024;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);
    ctx.globalAlpha = this.life;

    ctx.shadowBlur = 15;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 3.5;
    ctx.fillStyle = '#0a0a0f';

    const startAngle = (this.shardIndex * 0.5) * Math.PI;
    const endAngle = ((this.shardIndex + 1) * 0.5) * Math.PI;

    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    ctx.fillStyle = this.innerColor;
    ctx.globalAlpha = this.life * 0.65;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.arc(0, 0, this.radius * 0.8, startAngle, endAngle);
    ctx.closePath();
    ctx.fill();

    ctx.restore();
  }
}

// 충격파 고리
class Shockwave {
  x: number;
  y: number;
  color: string;
  radius: number;
  maxRadius: number;
  life: number;
  decay: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 10;
    this.maxRadius = 110;
    this.life = 1.0;
    this.decay = 0.04;
  }

  update() {
    this.radius += (this.maxRadius - this.radius) * 0.16;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur = 20;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }
}

// 네온 분출 파티클
class JuiceParticle {
  x: number;
  y: number;
  color: string;
  radius: number;
  vx: number;
  vy: number;
  gravity: number;
  life: number;
  decay: number;

  constructor(x: number, y: number, color: string) {
    this.x = x;
    this.y = y;
    this.color = color;
    this.radius = 2.5 + Math.random() * 5.5;
    
    const ang = Math.random() * Math.PI * 2;
    const speed = 2 + Math.random() * 11;
    this.vx = Math.cos(ang) * speed;
    this.vy = Math.sin(ang) * speed;

    this.gravity = 0.16;
    this.life = 1.0;
    this.decay = 0.025 + Math.random() * 0.03;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.life -= this.decay;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur = 10;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

// 콤보 팝업 텍스트
class ComboText {
  x: number;
  y: number;
  text: string;
  color: string;
  vy: number;
  life: number;

  constructor(x: number, y: number, text: string, color: string) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.vy = -1.4;
    this.life = 1.0;
  }

  update() {
    this.y += this.vy;
    this.life -= 0.02;
  }

  draw(ctx: CanvasRenderingContext2D) {
    if (this.life <= 0) return;
    ctx.save();
    ctx.globalAlpha = this.life;
    ctx.shadowBlur = 12;
    ctx.shadowColor = this.color;
    ctx.fillStyle = this.color;
    ctx.font = `900 ${20 + (1.0 - this.life) * 8}px 'Orbitron', 'Noto Sans KR'`;
    ctx.textAlign = 'center';
    ctx.fillText(this.text, this.x, this.y);
    ctx.restore();
  }
}

// 과일 물리 객체 class
class FruitObject {
  name: string;
  color: string;
  innerColor: string;
  style: 'circle' | 'stripe' | 'curve' | 'heart';
  radius: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  gravity: number;
  angle: number;
  spin: number;
  term: IBTerm;
  isSliced: boolean;

  constructor(canvasWidth: number, canvasHeight: number) {
    const template = fruitTemplates[Math.floor(Math.random() * fruitTemplates.length)];
    this.name = template.name;
    this.color = template.color;
    this.innerColor = template.innerColor;
    this.style = template.type;

    this.radius = Math.min(canvasWidth, canvasHeight) * 0.054 + Math.random() * 8;
    this.x = canvasWidth * 0.15 + Math.random() * (canvasWidth * 0.7);
    this.y = canvasHeight + this.radius;

    // 포물선 운동
    this.vx = (Math.random() - 0.5) * (canvasWidth * 0.0035);
    this.vy = -canvasHeight * (0.0135 + Math.random() * 0.0035); 
    this.gravity = canvasHeight * 0.00014;

    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.025;

    this.term = ibTerms[Math.floor(Math.random() * ibTerms.length)];
    this.isSliced = false;
  }

  update() {
    this.x += this.vx;
    this.y += this.vy;
    this.vy += this.gravity;
    this.angle += this.spin;
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    ctx.shadowBlur = 18;
    ctx.shadowColor = this.color;
    ctx.strokeStyle = this.color;
    ctx.lineWidth = 4;
    ctx.fillStyle = '#0f0f15';

    if (this.style === 'circle') {
      ctx.beginPath();
      ctx.arc(0, 0, this.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, -this.radius, this.radius * 0.2, 0, Math.PI);
      ctx.stroke();
    } else if (this.style === 'stripe') {
      ctx.beginPath();
      ctx.ellipse(0, 0, this.radius * 1.1, this.radius, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = '#005511';
      ctx.lineWidth = 2;
      for (let i = -1; i <= 1; i += 0.8) {
        ctx.beginPath();
        ctx.ellipse(0, 0, Math.max(0.1, Math.abs(this.radius * 0.4 * i)), this.radius * 0.9, 0, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (this.style === 'curve') {
      ctx.beginPath();
      ctx.arc(-this.radius * 0.3, 0, this.radius * 0.9, -Math.PI * 0.5, Math.PI * 0.5);
      ctx.arc(-this.radius * 0.5, 0, this.radius, Math.PI * 0.5, -Math.PI * 0.5, true);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    } else if (this.style === 'heart') {
      ctx.beginPath();
      ctx.moveTo(0, this.radius);
      ctx.bezierCurveTo(-this.radius * 1.1, -this.radius * 0.3, -this.radius * 0.6, -this.radius, 0, -this.radius * 0.6);
      ctx.bezierCurveTo(this.radius * 0.6, -this.radius, this.radius * 1.1, -this.radius * 0.3, 0, this.radius);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    }

    ctx.restore();

    // 텍스트는 흔들리지 않게 보존
    ctx.save();
    ctx.shadowBlur = 8;
    ctx.shadowColor = '#000000';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    ctx.font = `bold ${this.radius * 0.31}px 'Noto Sans KR'`;
    ctx.fillText(this.term.kr, this.x, this.y - 4);

    ctx.fillStyle = '#cccccc';
    ctx.font = `italic 500 ${this.radius * 0.21}px 'Noto Sans KR'`;
    ctx.fillText(`(${this.term.en})`, this.x, this.y + this.radius * 0.32);

    ctx.fillStyle = this.term.type === 'profile' ? '#00e1ff' : '#ffea00';
    ctx.font = `900 ${this.radius * 0.16}px 'Orbitron'`;
    ctx.fillText(this.term.type === 'profile' ? 'PROFILE' : 'CONCEPT', this.x, this.y - this.radius * 0.46);

    ctx.restore();
  }
}

export const NinjaGame = ({ soundEnabled }: NinjaGameProps) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);

  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const [score, setScore] = useState<number>(0);
  const [combo, setCombo] = useState<number>(0);
  const [maxCombo, setMaxCombo] = useState<number>(0);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [fps, setFps] = useState<number>(0);
  const [slicedTerms, setSlicedTerms] = useState<IBTerm[]>([]);

  // 미디어파이프 상태
  const [isMediaPipeLoading, setIsMediaPipeLoading] = useState<boolean>(true);
  const [cameraActive, setCameraActive] = useState<boolean>(false);
  const cameraActiveRef = useRef<boolean>(false);
  const [cameraError, setCameraError] = useState<boolean>(false);

  // 사운드 FX 관리
  const soundFXRef = useRef<SoundFX | null>(null);
  const soundEnabledRef = useRef<boolean>(soundEnabled);

  // 애니메이션 루프 필드들
  const fruitsRef = useRef<FruitObject[]>([]);
  const shardsRef = useRef<SlicedShard[]>([]);
  const shockwavesRef = useRef<Shockwave[]>([]);
  const particlesRef = useRef<JuiceParticle[]>([]);
  const comboTextsRef = useRef<ComboText[]>([]);
  const handTrailsRef = useRef<Array<Array<{ x: number; y: number }>>>(Array.from({ length: 8 }, () => []));

  // 마우스 트래킹 데이터
  const isMouseDownRef = useRef<boolean>(false);
  const mouseTrailRef = useRef<Array<{ x: number; y: number }>>([]);

  const gameStateRef = useRef<'START' | 'PLAYING' | 'GAMEOVER'>('START');
  const scoreRef = useRef<number>(0);
  const comboRef = useRef<number>(0);
  const maxComboRef = useRef<number>(0);
  const slicedTermsSetRef = useRef<Set<IBTerm>>(new Set());

  // 미디어파이프 가상 인스턴스 소유
  const mediaPipeHandsInstanceRef = useRef<any>(null);
  const mediaPipeCameraInstanceRef = useRef<any>(null);

  // 실시간 손가락 랜드마크 데이터 자취 보조
  const latestHandResultsRef = useRef<any>(null);
  const lastHandDetectionTimeRef = useRef<number>(0);

  // 사운드 갱신 동기화
  useEffect(() => {
    soundEnabledRef.current = soundEnabled;
    if (soundFXRef.current) {
      soundFXRef.current.updateEnabled(soundEnabled);
    }
  }, [soundEnabled]);

  // 첫 컴포넌트 마운트 시 사운드 클래스 인스턴스화
  useEffect(() => {
    soundFXRef.current = new SoundFX(soundEnabledRef.current);
    gameStateRef.current = gameState;
  }, []);

  // 미디어파이프 스크립트 동적 로딩 및 바인딩
  useEffect(() => {
    let active = true;

    const loadScripts = async () => {
      try {
        if (!(window as any).Hands) {
          await injectScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
          await injectScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");
        }

        if (!active) return;
        initializeMediaPipe();
      } catch (err) {
        console.error("MediaPipe script injection failed:", err);
        if (active) {
          setIsMediaPipeLoading(false);
          setCameraError(true);
        }
      }
    };

    loadScripts();

    return () => {
      active = false;
      // 인스턴스 정리
      if (mediaPipeCameraInstanceRef.current) {
        try {
          mediaPipeCameraInstanceRef.current.stop();
        } catch (e) {
          console.error(e);
        }
      }
    };
  }, []);

  const injectScript = (src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = src;
      script.crossOrigin = "anonymous";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Failed to load script: ${src}`));
      document.body.appendChild(script);
    });
  };

  const getDistanceToSegment = (
    p: { x: number; y: number }, 
    a: { x: number; y: number }, 
    b: { x: number; y: number }
  ): number => {
    const { x, y } = p;
    const { x: x1, y: y1 } = a;
    const { x: x2, y: y2 } = b;
    
    const A = x - x1;
    const B = y - y1;
    const C = x2 - x1;
    const D = y2 - y1;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;
    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;
    if (param < 0) {
      xx = x1;
      yy = y1;
    } else if (param > 1) {
      xx = x2;
      yy = y2;
    } else {
      xx = x1 + param * C;
      yy = y1 + param * D;
    }

    const dx = x - xx;
    const dy = y - yy;
    return Math.sqrt(dx * dx + dy * dy);
  };

  const checkSlicing = (
    prevPt: { x: number; y: number } | null, 
    currPt: { x: number; y: number } | null, 
    currentWristPt: { x: number; y: number } | null, 
    currentIndexPt: { x: number; y: number } | null
  ) => {
    if (gameStateRef.current !== 'PLAYING') return;

    fruitsRef.current.forEach((fruit) => {
      if (fruit.isSliced) return;

      const hitRadius = fruit.radius * 1.7; // 터치감 넉넉하게 1.7배 가이드
      let isHit = false;
      let slashVx = 0;

      // 1. 가이드라인(손목 -> 검지끝) 레이저선 접촉 검출
      if (currentWristPt && currentIndexPt) {
        const distToHandBlade = getDistanceToSegment({ x: fruit.x, y: fruit.y }, currentWristPt, currentIndexPt);
        if (distToHandBlade < hitRadius) {
          isHit = true;
          slashVx = currentIndexPt.x - currentWristPt.x;
        }
      }

      // 2. 고속 이동 시 선두 프레임과 현재 프레임 거리
      if (!isHit && prevPt && currPt) {
        const distToMovementPath = getDistanceToSegment({ x: fruit.x, y: fruit.y }, prevPt, currPt);
        if (distToMovementPath < hitRadius) {
          isHit = true;
          slashVx = currPt.x - prevPt.x;
        }
      }

      // 3. 마우스 드래그 직접 조각 터치
      if (!isHit && currPt) {
        const dx = fruit.x - currPt.x;
        const dy = fruit.y - currPt.y;
        const distDirect = Math.sqrt(dx * dx + dy * dy);
        if (distDirect < hitRadius) {
          isHit = true;
          slashVx = (Math.random() - 0.5) * 10;
        }
      }

      if (isHit) {
        fruit.isSliced = true;

        // 콤보 및 스코어 계산
        const nextCombo = comboRef.current + 1;
        comboRef.current = nextCombo;
        setCombo(nextCombo);

        if (nextCombo > maxComboRef.current) {
          maxComboRef.current = nextCombo;
          setMaxCombo(nextCombo);
        }

        const addedScore = 100 + (nextCombo - 1) * 20;
        const nextScore = scoreRef.current + addedScore;
        scoreRef.current = nextScore;
        setScore(nextScore);

        slicedTermsSetRef.current.add(fruit.term);

        // 물리 시각 요소 추가
        const canvas = canvasRef.current;
        const gravityRatio = canvas ? canvas.height * 0.0003 : 0.2;

        for (let i = 0; i < 4; i++) {
          shardsRef.current.push(new SlicedShard(
            fruit.x, fruit.y, fruit.radius, fruit.angle, fruit.spin, fruit.color, fruit.innerColor, i, slashVx, gravityRatio
          ));
        }

        // 충격파
        shockwavesRef.current.push(new Shockwave(fruit.x, fruit.y, fruit.color));

        // 파티클
        for (let i = 0; i < 28; i++) {
          particlesRef.current.push(new JuiceParticle(fruit.x, fruit.y, fruit.color));
        }

        // 콤보 팝업 지문 데코레이터
        if (nextCombo >= 2) {
          comboTextsRef.current.push(new ComboText(fruit.x, fruit.y - 32, `${nextCombo} COMBO!`, '#ff007f'));
          if (soundFXRef.current) soundFXRef.current.playCombo();
        } else {
          if (soundFXRef.current) soundFXRef.current.playSlice();
        }
        if (soundFXRef.current) soundFXRef.current.playJuice();
      }
    });
  };

  const initializeMediaPipe = () => {
    const HandsClass = (window as any).Hands;
    const CameraClass = (window as any).Camera;

    if (!HandsClass || !CameraClass) {
      setIsMediaPipeLoading(false);
      setCameraError(true);
      return;
    }

    try {
      const hands = new HandsClass({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`
      });

      hands.setOptions({
        maxNumHands: 2,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5
      });

      hands.onResults((results: any) => {
        onMediaPipeResults(results);
      });

      mediaPipeHandsInstanceRef.current = hands;

      if (videoRef.current) {
        const camera = new CameraClass(videoRef.current, {
          onFrame: async () => {
            if (mediaPipeHandsInstanceRef.current && videoRef.current) {
              await mediaPipeHandsInstanceRef.current.send({ image: videoRef.current });
            }
          },
          width: 640,
          height: 480
        });

        camera.start()
          .then(() => {
            setCameraActive(true);
            cameraActiveRef.current = true;
            setIsMediaPipeLoading(false);
          })
          .catch((e: any) => {
            console.error("Camera access error:", e);
            setCameraError(true);
            setIsMediaPipeLoading(false);
          });

        mediaPipeCameraInstanceRef.current = camera;
      }
    } catch (ex) {
      console.error("MediaPipe initialization error:", ex);
      setCameraError(true);
      setIsMediaPipeLoading(false);
    }
  };

  const onMediaPipeResults = (results: any) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (results && results.multiHandLandmarks) {
      latestHandResultsRef.current = results;
      lastHandDetectionTimeRef.current = Date.now();

      results.multiHandLandmarks.forEach((landmarks: any[], handIndex: number) => {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];

        const currentWristPt = {
          x: (1 - wrist.x) * canvas.width,
          y: wrist.y * canvas.height
        };
        const currentIndexPt = {
          x: (1 - indexTip.x) * canvas.width,
          y: indexTip.y * canvas.height
        };

        const bladeCenter = {
          x: (currentWristPt.x + currentIndexPt.x) / 2,
          y: (currentWristPt.y + currentIndexPt.y) / 2
        };

        const listTrails = handTrailsRef.current;
        const trail = listTrails[handIndex % 8];
        const lastPt = trail.length > 0 ? trail[trail.length - 1] : null;

        checkSlicing(lastPt, bladeCenter, currentWristPt, currentIndexPt);

        trail.push(bladeCenter);
        if (trail.length > 12) { 
          trail.shift();
        }
      });
    }
  };

  // 렌더링 프레임 루프
  useEffect(() => {
    let animationFrameId: number;
    let lastTime = performance.now();
    let frameCount = 0;
    let fpsInterval = lastTime;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const gameLoop = (timestamp: number) => {
      // FPS 계산
      frameCount++;
      if (timestamp - fpsInterval >= 1000) {
        setFps(Math.round((frameCount * 1000) / (timestamp - fpsInterval)));
        frameCount = 0;
        fpsInterval = timestamp;
      }

      // 게임 로직 업데이트 및 그리기
      updateGamePhysics();
      drawGameFrame(ctx);

      animationFrameId = requestAnimationFrame(gameLoop);
    };

    animationFrameId = requestAnimationFrame(gameLoop);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const updateGamePhysics = () => {
    if (gameStateRef.current !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    // 과일 리젠 속도 조절
    if (Math.random() < 0.038) {
      fruitsRef.current.push(new FruitObject(canvas.width, canvas.height));
    }

    // 과일 물리 연산
    fruitsRef.current.forEach((fruit, idx) => {
      fruit.update();
      
      // 화면 밖으로 이탈
      if (fruit.y > canvas.height + fruit.radius * 2) {
        if (!fruit.isSliced) {
          // 과일을 놓치면 콤보 리셋
          setCombo(0);
          comboRef.current = 0;
        }
        fruitsRef.current.splice(idx, 1);
      }
    });

    // 파편 물리 연산
    shardsRef.current.forEach((shard, idx) => {
      shard.update();
      if (shard.life <= 0 || shard.y > canvas.height + shard.radius * 2) {
        shardsRef.current.splice(idx, 1);
      }
    });

    // 충격파 연산
    shockwavesRef.current.forEach((wave, idx) => {
      wave.update();
      if (wave.life <= 0) {
        shockwavesRef.current.splice(idx, 1);
      }
    });

    // 주스 물방울 연산
    particlesRef.current.forEach((p, idx) => {
      p.update();
      if (p.life <= 0) {
        particlesRef.current.splice(idx, 1);
      }
    });

    // 콤보 팝업 텍스트 연산
    comboTextsRef.current.forEach((t, idx) => {
      t.update();
      if (t.life <= 0) {
        comboTextsRef.current.splice(idx, 1);
      }
    });

    // Hand trail 천천히 축소
    const trails = handTrailsRef.current;
    for (let i = 0; i < trails.length; i++) {
      if (trails[i].length > 0) {
        trails[i].shift();
      }
    }
  };

  const drawGameFrame = (ctx: CanvasRenderingContext2D) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 미러링 비디오 렌더링
    if (cameraActiveRef.current && videoRef.current) {
      ctx.save();
      ctx.translate(canvas.width, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      ctx.restore();

      // 어두운 아케이드 터치 필터 오버레이 (사용자가 배경에 뚜렷이 보이도록 불투명도를 적절히 조절)
      ctx.fillStyle = 'rgba(3, 3, 5, 0.35)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    } else {
      ctx.fillStyle = '#030305';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }

    // 네온 배경 디비전 가이드 라인
    ctx.save();
    ctx.shadowBlur = 15;
    ctx.shadowColor = 'rgba(0, 240, 255, 0.15)';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.08)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, canvas.height * 0.1);
    ctx.lineTo(canvas.width, canvas.height * 0.1);
    ctx.stroke();
    ctx.restore();

    // 1. 진행 중인 게임 플레이 오브젝트 (오직 PLAYING 시에만 렌더링)
    if (gameStateRef.current === 'PLAYING') {
      fruitsRef.current.forEach(f => f.draw(ctx));
      shardsRef.current.forEach(s => s.draw(ctx));
      shockwavesRef.current.forEach(w => w.draw(ctx));
      particlesRef.current.forEach(p => p.draw(ctx));
      comboTextsRef.current.forEach(t => t.draw(ctx));
    }

    // 2. 마우스 드래그 궤적 그리기 (언제나 활성)
    const mouseTrail = mouseTrailRef.current;
    if (mouseTrail.length > 1) {
      ctx.save();
      ctx.shadowBlur = 20;
      ctx.shadowColor = '#00f0ff';
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 8;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.beginPath();
      ctx.moveTo(mouseTrail[0].x, mouseTrail[0].y);
      for (let i = 1; i < mouseTrail.length; i++) {
        ctx.lineTo(mouseTrail[i].x, mouseTrail[i].y);
      }
      ctx.stroke();
      ctx.restore();
    }

    // 3. 카메라 핸드 궤적 칼날 렌더링 (언제나 활성)
    const trails = handTrailsRef.current;
    trails.forEach((trail) => {
      if (trail.length > 1) {
        ctx.save();
        ctx.shadowBlur = 25;
        ctx.shadowColor = '#00f0ff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 12;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(trail[0].x, trail[0].y);
        for (let i = 1; i < trail.length; i++) {
          ctx.lineTo(trail[i].x, trail[i].y);
        }
        ctx.stroke();
        ctx.restore();
      }
    });

    // 4. 손맛을 극대화하는 실시간 광선검(손목->검지끝) 레이저 및 네온 코어 광선 그리기 (언제나 활성)
    const results = latestHandResultsRef.current;
    const isDetectionFresh = Date.now() - lastHandDetectionTimeRef.current < 500;
    if (results && results.multiHandLandmarks && isDetectionFresh) {
      results.multiHandLandmarks.forEach((landmarks: any[]) => {
        const wrist = landmarks[0];
        const indexTip = landmarks[8];

        const currentWristPt = {
          x: (1 - wrist.x) * canvas.width,
          y: wrist.y * canvas.height
        };
        const currentIndexPt = {
          x: (1 - indexTip.x) * canvas.width,
          y: indexTip.y * canvas.height
        };

        // 1. 네온 빛 아우라 (두껍고 밝은 사이언 주위광)
        ctx.save();
        ctx.shadowBlur = 20;
        ctx.shadowColor = '#00ffff';
        ctx.strokeStyle = 'rgba(0, 255, 255, 0.85)';
        ctx.lineWidth = 8;
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(currentWristPt.x, currentWristPt.y);
        ctx.lineTo(currentIndexPt.x, currentIndexPt.y);
        ctx.stroke();

        // 2. 초광택 하얀색 검정 코어광 (실제 Lightsaber처럼 가운데가 극광으로 빛나는 효과)
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.moveTo(currentWristPt.x, currentWristPt.y);
        ctx.lineTo(currentIndexPt.x, currentIndexPt.y);
        ctx.stroke();

        // 3. 광선검 양끝 충전 구슬 가이드 (노란색 아우라)
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#ffea00';
        ctx.fillStyle = '#ffea00';
        
        ctx.beginPath();
        ctx.arc(currentIndexPt.x, currentIndexPt.y, 10, 0, Math.PI * 2);
        ctx.arc(currentWristPt.x, currentWristPt.y, 10, 0, Math.PI * 2);
        ctx.fill();

        // 4. 충전 구슬 중심의 초고밀도 흰색 코어
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(currentIndexPt.x, currentIndexPt.y, 5, 0, Math.PI * 2);
        ctx.arc(currentWristPt.x, currentWristPt.y, 5, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      });
    }
  };

  // 마우스 클릭 및 드래그 이벤트 통합
  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'PLAYING') return;
    
    if (soundFXRef.current) soundFXRef.current.playSlice();

    isMouseDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseTrailRef.current = [{ x, y }];
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current || gameStateRef.current !== 'PLAYING') return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const currentPoint = { x, y };
    const trail = mouseTrailRef.current;

    if (trail.length > 0) {
      const lastPoint = trail[trail.length - 1];
      checkSlicing(lastPoint, currentPoint, null, null);
    }

    trail.push(currentPoint);
    if (trail.length > 15) {
      trail.shift();
    }
  };

  const handleMouseUp = () => {
    isMouseDownRef.current = false;
    mouseTrailRef.current = [];
  };

  // 터치 이벤트 지원 (모바일 고려)
  const handleTouchStart = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (gameStateRef.current !== 'PLAYING' || e.touches.length === 0) return;
    
    if (soundFXRef.current) soundFXRef.current.playSlice();

    isMouseDownRef.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    mouseTrailRef.current = [{ x, y }];
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLCanvasElement>) => {
    if (!isMouseDownRef.current || gameStateRef.current !== 'PLAYING' || e.touches.length === 0) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    const currentPoint = { x, y };
    const trail = mouseTrailRef.current;

    if (trail.length > 0) {
      const lastPoint = trail[trail.length - 1];
      checkSlicing(lastPoint, currentPoint, null, null);
    }

    trail.push(currentPoint);
    if (trail.length > 15) {
      trail.shift();
    }
  };

  // 타이머 작동
  useEffect(() => {
    let timerInterval: NodeJS.Timeout;
    if (gameState === 'PLAYING') {
      timerInterval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            endGame();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, [gameState]);

  // 창 크기 맞춤 피팅 리사이저
  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current;
      if (!canvas || !canvas.parentElement) return;
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    window.addEventListener('resize', handleResize);
    // 지연시켜 부모 렌더 안정화 후 설정
    const delayTimer = setTimeout(handleResize, 150);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(delayTimer);
    };
  }, [gameState]);

  const startGame = () => {
    if (soundFXRef.current) {
      soundFXRef.current.playCombo();
    }

    setGameState('PLAYING');
    gameStateRef.current = 'PLAYING';

    setScore(0);
    scoreRef.current = 0;

    setCombo(0);
    comboRef.current = 0;

    setMaxCombo(0);
    maxComboRef.current = 0;

    setTimeLeft(60);
    setSlicedTerms([]);
    slicedTermsSetRef.current.clear();

    fruitsRef.current = [];
    shardsRef.current = [];
    shockwavesRef.current = [];
    particlesRef.current = [];
    comboTextsRef.current = [];
    
    // 강제 리사이징 유도
    const canvas = canvasRef.current;
    if (canvas && canvas.parentElement) {
      const rect = canvas.parentElement.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    }
  };

  const endGame = () => {
    setGameState('GAMEOVER');
    gameStateRef.current = 'GAMEOVER';

    if (soundFXRef.current) {
      soundFXRef.current.playGameOver();
    }

    // 자른 단어 기록 전사
    setSlicedTerms(Array.from(slicedTermsSetRef.current));
  };

  return (
    <div className="w-full h-full flex flex-col justify-between items-center relative select-none bg-[#030305] text-white">
      {/* 백그라운드 우주 네온 그라데이션 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-indigo-950/20 via-black to-black -z-10" />

      {/* 대기 화면 (시작 전) */}
      <AnimatePresence>
        {gameState === 'START' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-center items-center z-40 bg-zinc-950/60 backdrop-blur-md px-4 overflow-y-auto"
          >
            <div className="max-w-3xl w-full flex flex-col items-center py-6 text-center">
              <div className="text-[10px] md:text-xs font-semibold uppercase tracking-widest text-yellow-400 mb-2 border border-yellow-500/30 px-4 py-1 rounded-full bg-yellow-950/10">
                IB SINGLEPLAYER MOTION ARCADE
              </div>
              <h1 className="text-3xl md:text-5xl font-black mb-3 tracking-tight">
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-500 to-yellow-400 uppercase">IB 손날 닌자</span>
              </h1>
              <p className="text-gray-400 text-sm md:text-base mb-6 max-w-xl font-light leading-relaxed">
                화면에 천천히 날아오르는 네온 과일을 <span className="text-cyan-400 font-extrabold">손날 광선검</span>으로 조각내세요!<br />
                과일이 베이며 사방으로 파편이 터지고 <span className="text-pink-500 font-bold">IB 핵심 용어</span>들이 흥미롭게 터집니다.
              </p>

              {/* 기능 소개 */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full mb-6 max-w-2xl text-left">
                <div className="bg-gray-900/40 p-4 rounded-xl border border-cyan-500/20">
                  <div className="text-cyan-400 font-black mb-1 flex items-center gap-2 text-sm">
                    <Sparkles className="w-4 h-4" /> 4분할 시각 효과
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    과일이 베이는 각도와 슬래시 속도에 반응해 4개 사분면 파편들과 고화질 광선 파티클 충격파가 터집니다.
                  </p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-xl border border-pink-500/20">
                  <div className="text-pink-400 font-black mb-1 flex items-center gap-2 text-sm">
                    <CameraIcon className="w-4 h-4" /> AI 손날 광선검
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    웹캠을 통해 손목부터 손가락 끝 단면까지의 실시간 가이드선을 칼빛 레이저로 이어 짜릿하게 타격합니다.
                  </p>
                </div>
                <div className="bg-gray-900/40 p-4 rounded-xl border border-yellow-500/20">
                  <div className="text-yellow-400 font-black mb-1 flex items-center gap-2 text-sm">
                    <MousePointer className="w-4 h-4" /> 마우스 터치 완벽지원
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed">
                    카메라가 없거나 어두운 방에서도 마우스 드래그 혹은 모바일 스와이프 터치로 가볍게 연습하고 점수를 겨룰 수 있습니다.
                  </p>
                </div>
              </div>

              {/* 시작 제어 및 로딩 표시 */}
              <div className="flex flex-col items-center gap-3 w-full">
                {isMediaPipeLoading ? (
                  <div className="text-cyan-400 flex items-center gap-2 text-sm font-medium animate-pulse">
                    <HelpCircle className="w-4 h-4 animate-spin" />
                    <span>AI 웹캠 모션 추적 장치 로드 중...</span>
                  </div>
                ) : cameraError ? (
                  <div className="text-amber-300 flex flex-col gap-2 text-xs font-semibold bg-amber-950/40 border border-amber-500/40 p-4 rounded-xl max-w-lg text-center shadow-lg backdrop-blur-sm">
                    <div className="flex items-center justify-center gap-2 text-sm font-bold text-amber-400">
                      <AlertCircle className="w-5 h-5 shrink-0" />
                      <span>웹캠 연결이 거부되었거나 탐색 불가</span>
                    </div>
                    <p className="text-gray-300 leading-relaxed font-normal">
                      현재 웹브라우저의 보안 정책상 모션 추적을 위해서는 <strong className="text-yellow-300">카메라 권한 허용</strong>이 꼭 필요합니다!
                    </p>
                    <div className="text-left text-[11px] bg-black/40 p-2.5 rounded border border-amber-500/20 text-gray-400 space-y-1 mt-1 font-sans">
                      <p className="font-semibold text-amber-400">💡 정상적으로 실행하는 방법:</p>
                      <p>1️⃣ 우측 상단의 <strong className="text-white">"새 창에서 열기" (Open in new window)</strong> 아이콘을 눌러 새 탭에서 열어주세요.</p>
                      <p>2️⃣ 주소창 좌측의 카메라/안전 열쇠(🔒) 아이콘을 눌러 <strong className="text-white">카메라 권한을 "허용"</strong>해 주세요.</p>
                      <p>3️⃣ 다른 회의 프로그램(Zoom, Teams 등)이 카메라를 사용 중인지 확인해 주세요.</p>
                    </div>
                    <p className="text-shadow-sm text-[11px] text-amber-400 font-semibold mt-1">
                      ※ 카메라 없이도 마우스 드래그나 모바일 화면 터치(스와이프)로 게임을 신나게 즐길 수 있습니다!
                    </p>
                  </div>
                ) : (
                  <div className="text-emerald-400 flex items-center gap-1.5 text-sm font-semibold">
                    <Sparkles className="w-4 h-4 animate-bounce" />
                    <span>AI 손날 카메라 준비 완벽!</span>
                  </div>
                )}

                <button 
                  onClick={startGame}
                  className="px-10 py-4 bg-gradient-to-r from-cyan-500 via-pink-600 to-yellow-500 hover:from-cyan-400 hover:to-yellow-400 text-white font-black text-xl rounded-2xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 flex items-center gap-2"
                >
                  <Play className="w-5 h-5 fill-current" /> 아케이드 시작
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 대결 종료 스테이지클리어 리포트 모달 */}
      <AnimatePresence>
        {gameState === 'GAMEOVER' && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-center items-center z-40 bg-zinc-950/65 backdrop-blur-md px-4 overflow-y-auto"
          >
            <div className="max-w-2xl w-full text-center py-6">
              <h2 className="text-4xl md:text-6xl font-black tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-pink-500 to-cyan-400 mb-1">
                STAGE CLEAR
              </h2>
              <p className="text-gray-500 text-xs md:text-sm uppercase tracking-widest mb-6">게임 성적표 및 획득한 IB 학습 사전</p>

              {/* 스코어 리포트 */}
              <div className="bg-gray-950/60 border border-cyan-500/30 p-6 rounded-2xl max-w-md w-full mx-auto mb-6 relative">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-cyan-500 text-black font-black text-[10px] rounded-full">
                  PERFORMANCE STATS
                </div>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex flex-col items-center border-r border-gray-800">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">최종 획득 점수</span>
                    <span className="text-3xl font-black text-cyan-400 mt-1 font-mono">{score}</span>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-[10px] text-gray-500 font-bold uppercase">최고 연속 콤보</span>
                    <span className="text-3xl font-black text-yellow-400 mt-1 font-mono">{maxCombo}</span>
                  </div>
                </div>
              </div>

              {/* 터진 학업 용어 백팩 모듈 */}
              <div className="bg-gray-950/80 border border-gray-800 p-4 rounded-xl max-w-xl mx-auto mb-6 text-left">
                <h3 className="text-yellow-400 font-extrabold mb-3 text-center flex items-center justify-center gap-1.5 text-xs md:text-sm">
                  <Award className="w-4 h-4 text-yellow-400 animate-bounce" /> 오늘 슬라이싱한 IB 핵심 학업 사전북
                </h3>
                <div className="flex flex-wrap gap-2 justify-center max-h-40 overflow-y-auto p-1 text-gray-400">
                  {slicedTerms.length === 0 ? (
                    <span className="text-gray-500 italic text-xs py-4">베어버린 IB 단어가 없습니다. 다음 번에는 손놀림을 빠르게 해보세요!</span>
                  ) : (
                    slicedTerms.map((term, index) => (
                      <div 
                        key={index} 
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
                          term.type === 'profile' 
                            ? 'bg-cyan-950/40 border-cyan-500/20 text-cyan-200' 
                            : 'bg-yellow-950/40 border-yellow-500/20 text-yellow-200'
                        }`}
                      >
                        <div className="text-[8px] uppercase tracking-wider opacity-60">
                          {term.type === 'profile' ? '학습자 프로필' : '핵심 개념'}
                        </div>
                        <div className="font-extrabold text-sm">{term.kr} <span className="text-xs font-normal opacity-70">({term.en})</span></div>
                        <div className="text-[9px] font-normal leading-normal mt-1 pt-1 opacity-80 border-t border-white/5">{term.desc}</div>
                      </div>
                    ))
                  )}
                </div>
              </div>

              <button 
                onClick={startGame}
                className="px-8 py-3.5 bg-gradient-to-r from-yellow-500 via-orange-500 to-pink-600 hover:from-yellow-400 hover:to-pink-500 text-white font-black text-lg rounded-2xl transition-all shadow-md transform hover:scale-105 flex items-center gap-1.5 mx-auto"
              >
                <RotateCcw className="w-5 h-5" /> 다시 도전하기
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 게임 헤더 바 */}
      <header className="w-full px-4 py-3 flex justify-between items-center z-10 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-2">
          <span className="font-black text-xl md:text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-pink-400 to-yellow-300">
            IB 손날 닌자
          </span>
          <span className="text-[8px] text-yellow-400 font-extrabold border border-yellow-400/30 px-2 py-0.5 rounded-full bg-yellow-950/10 hidden sm:inline">
            NEON SLICER
          </span>
        </div>

        {/* 타이머 */}
        <div className="flex items-center bg-gray-950/85 border border-cyan-500/30 px-4 py-1.5 rounded-xl">
          <div className="flex flex-col items-center">
            <span className="text-[8px] text-gray-500 font-bold tracking-widest flex items-center gap-0.5"><Clock className="w-2.5 h-2.5 text-cyan-400" /> TIME</span>
            <span className={`text-xl font-black font-mono tracking-wider transition-colors duration-300 ${timeLeft <= 10 ? 'text-rose-500 animate-pulse' : 'text-cyan-400'}`}>
              {timeLeft}s
            </span>
          </div>
        </div>

        <div className="text-[10px] font-mono text-zinc-600">
          FPS: {fps}
        </div>
      </header>

      {/* 플레이 빌드 극적 무대 영역 (통합 캔버스) */}
      <main className="w-full flex-1 max-w-5xl px-3 flex items-center justify-center relative my-2 overflow-hidden">
        <div className="w-full h-full relative aspect-video bg-[#000002] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center">
          {/* 안보이는 비디오 프레임 추출기 (브라우저 정책 우회를 위해 오프스크린 배치) */}
          <video 
            ref={videoRef} 
            style={{ position: 'absolute', width: '640px', height: '480px', opacity: 0, pointerEvents: 'none', left: '-9999px', top: '-9999px' }}
            autoPlay 
            playsInline 
            muted 
            width={640} 
            height={480}
          />

          {/* 메인 고화질 캔버스 */}
          <canvas 
            ref={canvasRef} 
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleMouseUp}
            className="w-full h-full object-cover block cursor-crosshair z-10"
          />

          {/* 카메라 준비중 오버레이 */}
          {gameState === 'PLAYING' && isMediaPipeLoading && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center text-center pointer-events-none z-20">
              <p className="text-sm font-semibold text-cyan-400 pulse-glow flex items-center gap-2">
                <Sparkles className="w-4 h-4 animate-spin" />
                카메라 렌즈 조도를 스캔하는 중...
              </p>
            </div>
          )}

          {/* 조작 설명 워크스루 말뭉치 */}
          {gameState === 'PLAYING' && (
            <div className="absolute bottom-3 left-4 bg-black/70 border border-zinc-800 px-3 py-1.5 rounded-xl z-20 pointer-events-none max-w-xs text-[10px] text-zinc-400 flex items-center gap-2">
              <MousePointer className="w-3.5 h-3.5 text-yellow-400 shrink-0" />
              <span>웹캠이 비활성화라면 화면을 마우스나 손가락으로 드래그해 자를 수 있습니다!</span>
            </div>
          )}
        </div>
      </main>

      {/* 대시보드 */}
      <footer className="w-full p-3 bg-black/30 border-t border-white/5 flex gap-3 h-20 items-stretch font-sans md:px-6">
        <div className="flex-1 bg-zinc-900/40 border border-cyan-500/10 px-4 py-2 rounded-xl flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] text-cyan-400 font-bold uppercase tracking-widest leading-none">MY SCORE</span>
            <span className="text-2xl font-black text-white font-mono leading-none mt-1">{score}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[9px] text-zinc-500 leading-none">MAX COMBO</span>
            <span className="text-sm font-bold text-yellow-400 font-mono mt-1">{maxCombo}</span>
          </div>
        </div>

        <div className="flex-1 bg-zinc-900/40 border border-pink-500/10 px-4 py-2 rounded-xl flex items-center justify-between">
          <div className="flex flex-col justify-center">
            <span className="text-[10px] text-pink-400 font-bold uppercase tracking-widest leading-none">COMBO BOOST</span>
            <span className="text-[9px] text-zinc-500 mt-1 leading-none">놓치면 초기화!</span>
          </div>
          <span className={`px-4 py-1.5 rounded-lg text-xs font-black tracking-widest transition-all uppercase duration-300 ${
            combo >= 2 
              ? 'bg-gradient-to-r from-pink-500 to-yellow-500 text-white shadow-lg shadow-pink-500/10 scale-105' 
              : 'bg-zinc-800/50 text-zinc-500'
          }`}>
            {combo} COMBO
          </span>
        </div>
      </footer>
    </div>
  );
};
