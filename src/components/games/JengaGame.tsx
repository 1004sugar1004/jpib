import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as THREE from 'three';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { RefreshCw, Star, Info, AlertTriangle, Play, HelpCircle } from 'lucide-react';
import confetti from 'canvas-confetti';

interface JengaTerm {
  term: string;
  cat: string; // "IB 개념", "학습자상", "ATL"
  desc: string;
}

const TERMS: JengaTerm[] = [
  // IB 핵심 개념 (Key Concepts)
  { term: "Form (형태)",           cat: "IB 개념",  desc: "사물의 형태, 특징 및 구조적 특성을 탐구하는 개념입니다." },
  { term: "Function (기능)",       cat: "IB 개념",  desc: "사물이나 제도가 어떻게 작동하고 어떤 역할을 하는지 탐구하는 개념입니다." },
  { term: "Causation (인과관계)",    cat: "IB 개념",  desc: "사건이나 현상이 왜 일어났는지 원인과 결과의 관계를 탐구하는 개념입니다." },
  { term: "Change (변화)",         cat: "IB 개념",  desc: "시간의 흐름에 따라 대상이 어떻게 달라지고 발전하는지 탐구하는 개념입니다." },
  { term: "Connection (연결)",     cat: "IB 개념",  desc: "서로 다른 요소나 아이디어가 어떻게 관계를 맺고 영향을 주는지 탐구하는 개념입니다." },
  { term: "Perspective (관점)",    cat: "IB 개념",  desc: "동일한 현상이나 대상을 바라보는 다양한 시각과 입장, 해석을 탐구하는 개념입니다." },
  { term: "Responsibility (책임)", cat: "IB 개념",  desc: "우리의 생각과 행동이 타인과 환경에 미치는 영향과 윤리적 실천을 탐구하는 개념입니다." },
  { term: "Reflection (성찰)",     cat: "IB 개념",  desc: "자신의 배움과 행동 과정을 비판적으로 되돌아보며 더 나은 성장을 도모하는 개념입니다." },

  // IB 학습자상 (Learner Profile)
  { term: "Inquirer (탐구하는 사람)",       cat: "학습자상", desc: "호기심을 가지고 스스로 배움을 계획하며, 세상에 대해 활발히 질문하고 지식을 넓혀가는 사람입니다." },
  { term: "Knowledgeable (지식을 갖춘 사람)",  cat: "학습자상", desc: "중요한 개념과 지식을 깊이 있게 탐구하여, 지역사회와 전 세계의 다양한 문제에 대해 잘 아는 사람입니다." },
  { term: "Thinker (생각하는 사람)",        cat: "학습자상", desc: "복잡한 문제를 해결하기 위해 비판적이고 창의적으로 생각하며, 합리적이고 윤리적인 결정을 내리는 사람입니다." },
  { term: "Communicator (소통하는 사람)",   cat: "학습자상", desc: "둘 이상의 언어와 다양한 매체를 활용하여 상대방을 존중하며 자기를 명확하고 창의적으로 표현하는 사람입니다." },
  { term: "Principled (원칙을 지키는 사람)",     cat: "학습자상", desc: "정직함과 공정함을 바탕으로 행동하며, 자신의 행동 책임과 타인의 권리를 존중하는 법을 아는 사람입니다." },
  { term: "Open-minded (열린 마음을 가진 사람)",    cat: "학습자상", desc: "자신의 문화와 역사를 소중히 여기면서도, 타인의 다양한 관점과 문화적 가치를 열린 마음으로 받아들이는 사람입니다." },
  { term: "Caring (배려하는 사람)",         cat: "학습자상", desc: "다른 사람의 감정을 이해하고 공감하며, 더 나은 변화를 만들기 위해 적극적으로 돕고 헌신하는 사람입니다." },
  { term: "Risk-taker (도전하는 사람)",     cat: "학습자상", desc: "불확실한 상황에서도 두려움 없이 새로운 역할이나 방식을 시도하며, 신념을 가지고 용기 있게 행동하는 사람입니다." },
  { term: "Balanced (균형 잡힌 사람)",       cat: "학습자상", desc: "지적, 신체적, 감성적 균형을 이루며, 자신과 주변 사람들의 행복을 조화롭게 이끌어가는 사람입니다." },
  { term: "Reflective (성찰하는 사람)",     cat: "학습자상", desc: "자신의 생각과 경험의 강점과 한계를 사려 깊게 분석하며, 성장의 기회로 삼는 사람입니다." },

  // IB 학습 접근방법 (ATL)
  { term: "Research Skills (탐구/조사 기능)",       cat: "ATL",     desc: "다양한 자료에서 신뢰할 수 있는 정보를 수집, 비교, 분석하고 체계적으로 정리하는 능력입니다." },
  { term: "Thinking Skills (사고 기능)",       cat: "ATL",     desc: "개념과 이론을 비판적으로 평가하고, 아이디어를 창의적으로 융합하며 해결책을 설계하는 능력입니다." },
  { term: "Social Skills (사회적/협동 기능)",         cat: "ATL",     desc: "친구들과 협동하고 서로 배려하며, 공동의 목표를 달성하기 위해 긍정적으로 기여하는 상호작용 능력입니다." },
  { term: "Self-management (자기 관리 기능)",      cat: "ATL",     desc: "시간을 계획대로 활용해 목표를 달성하며, 자신의 마음과 태도를 건강하게 조절·관리하는 능력입니다." },
  { term: "Communication Skills (의사소통 기능)",  cat: "ATL",     desc: "정보와 생각을 읽기, 쓰기, 말하기, 듣기 등 다양한 방법으로 안전하고 효과적으로 주고받는 능력입니다." }
];

const WC = [0xDEB887, 0xD2A679, 0xC8956C, 0xE8C99A, 0xCFA869, 0xBA8955, 0xD4A56A, 0xE0BB88];

function shuffled<T>(array: T[]): T[] {
  const r = [...array];
  for (let i = r.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [r[i], r[j]] = [r[j], r[i]];
  }
  return r;
}

export const JengaGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [gameState, setGameState] = useState<'START' | 'PLAYING' | 'CRASHED'>('START');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const difficultyRef = useRef<'easy' | 'normal' | 'hard'>('normal');
  const [score, setScore] = useState(0);
  const [level, setLevel] = useState(1);
  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('jenga_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const [leanIndex, setLeanIndex] = useState(0);
  const [wobbleOffset, setWobbleOffset] = useState(0);
  const [message, setMessage] = useState('가운데나 좌우 블록을 살짝 탭해 빼내세요!');
  const [showHelp, setShowHelp] = useState(false);
  
  // Selection / Hover states for React overlay
  const [selectedBlockInfo, setSelectedBlockInfo] = useState<JengaTerm | null>(null);
  const [hoveredBlockInfo, setHoveredBlockInfo] = useState<JengaTerm | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });

  // New States and Refs for interactive top placement mechanics
  const [pendingPlaceBlock, setPendingPlaceBlock] = useState<THREE.Mesh | null>(null);
  const pendingPlaceBlockRef = useRef<THREE.Mesh | null>(null);
  const confirmPlaceTopRef = useRef<((col: number) => void) | null>(null);

  // Helper function to find empty column slots at the top tier of the tower
  const getPlaceableOptions = useCallback(() => {
    let topRow = 15; // default to starting max row index (16 rows total => 15)
    blocksRef.current.forEach(b => {
      if (!b.userData.removed && b.userData.row > topRow) {
        topRow = b.userData.row;
      }
    });

    const blocksInTop = blocksRef.current.filter(
      b => b.userData.row === topRow && !b.userData.removed
    );

    // If the top layer is not yet full (less than 3 blocks)
    if (blocksInTop.length < 3) {
      const occupiedCols = blocksInTop.map(b => b.userData.col);
      const freeCols = [0, 1, 2].filter(c => !occupiedCols.includes(c));
      return {
        row: topRow,
        freeCols
      };
    } else {
      // If the top layer is fully completed, start a new higher layer
      return {
        row: topRow + 1,
        freeCols: [0, 1, 2]
      };
    }
  }, []);

  // Helper function to dynamically map visual Left, Center, Right columns to physical 0, 1, 2 indices based on camera view
  const getTopPlaceableMapping = useCallback(() => {
    if (!cameraRef.current) {
      return { visualToPhysical: [0, 1, 2], physicalToVisual: [0, 1, 2] };
    }
    const opt = getPlaceableOptions();
    const nr = opt.row;
    const rot = (nr % 2 === 1);
    
    // Axis of placement: along X if rot is true, along Z if rot is false
    const topAxis = rot ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
    
    // Camera's local right vector projected to world space
    const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
    
    const dot = topAxis.dot(cameraRight);
    
    // If dot >= 0, physical column 0 (-index) aligns with visual Left, and col 2 (+index) with visual Right.
    // If dot < 0, physical column 0 matches visual Right, and col 2 matches visual Left (so we swap them).
    if (dot >= 0) {
      return {
        visualToPhysical: [0, 1, 2],
        physicalToVisual: [0, 1, 2]
      };
    } else {
      return {
        visualToPhysical: [2, 1, 0],
        physicalToVisual: [2, 1, 0]
      };
    }
  }, [getPlaceableOptions]);

  // Refs for WebGL coordination
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
  const blocksRef = useRef<THREE.Mesh[]>([]);
  const selRef = useRef<THREE.Mesh | null>(null);
  const indicatorLeftRef = useRef<THREE.Mesh | null>(null);
  const indicatorRightRef = useRef<THREE.Mesh | null>(null);
  const placementIndicatorLeftRef = useRef<THREE.Mesh | null>(null);
  const placementIndicatorCenterRef = useRef<THREE.Mesh | null>(null);
  const placementIndicatorRightRef = useRef<THREE.Mesh | null>(null);
  const cameraRef = useRef<THREE.PerspectiveCamera | null>(null);

  // Fast animation states in mutable refs to avoid React closure lag
  const pullingRef = useRef<boolean>(false);
  const pDirRef = useRef<number>(0);
  const pProgRef = useRef<number>(0);
  const overRef = useRef<boolean>(false);
  const scoreRef = useRef<number>(0);
  const levelRef = useRef<number>(1);
  const poolRef = useRef<JengaTerm[]>([]);
  const gameStateRef = useRef(gameState);

  // Constants
  const BW = 1.5;
  const BH = 0.6;
  const BD = 0.5;
  const ROWS = 16;
  const SP = BD + 0.05; // Spacing

  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const playSound = useCallback((type: 'crash' | 'pull' | 'wobble' | 'correct' | 'wrong') => {
    if (!soundEnabled) return;
    let sfx = ASSETS.sounds.joyful;
    if (type === 'crash') sfx = 'https://assets.mixkit.co/active_storage/sfx/2004/2004-500.wav';
    if (type === 'pull') sfx = 'https://assets.mixkit.co/active_storage/sfx/2422/2422-500.wav';
    if (type === 'wobble') sfx = 'https://assets.mixkit.co/active_storage/sfx/1110/1110-500.wav';
    if (type === 'wrong') sfx = ASSETS.sounds.wrong;
    if (type === 'correct') sfx = ASSETS.sounds.correct;

    const audio = new Audio(sfx);
    audio.volume = 0.22;
    audio.play().catch(() => {});
  }, [soundEnabled]);

  // Sync state refs
  useEffect(() => {
    gameStateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // Handle external actions
  const startPullBlock = (visualDir: 'left' | 'right') => {
    const b = selRef.current;
    if (!b || pullingRef.current || overRef.current) return;

    let dir = visualDir === 'left' ? -1 : 1;
    if (cameraRef.current) {
      const pullAxis = b.userData.rot ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
      const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(cameraRef.current.quaternion);
      const dot = pullAxis.dot(cameraRight);
      
      if (visualDir === 'left') {
        dir = dot >= 0 ? -1 : 1;
      } else {
        dir = dot >= 0 ? 1 : -1;
      }
    }

    setMessage(`🪵 선택한 "${b.userData.data.term}" 블록을 빼내는 중입니다... 균형을 주목하세요!`);
    playSound('pull');
    pullingRef.current = true;
    pDirRef.current = dir;
    pProgRef.current = 0;
  };

  const handleResetClick = () => {
    if (sceneRef.current) {
      setUpTowerScene();
    }
  };

  const initGamePlay = () => {
    setGameState('PLAYING');
    if (sceneRef.current) {
      setUpTowerScene();
    }
  };

  // Helper inside renderer scope
  const setUpTowerScene = () => {
    const scene = sceneRef.current;
    if (!scene) return;

    // Clear old blocks
    blocksRef.current.forEach(b => scene.remove(b));
    blocksRef.current = [];

    selRef.current = null;
    pullingRef.current = false;
    overRef.current = false;
    pProgRef.current = 0;

    setSelectedBlockInfo(null);
    setHoveredBlockInfo(null);
    pendingPlaceBlockRef.current = null;
    setPendingPlaceBlock(null);
    setScore(0);
    setLevel(1);
    scoreRef.current = 0;
    levelRef.current = 1;

    setLeanIndex(0);
    setWobbleOffset(0);
    setMessage('행운을 빕니다! 타워가 쓰러지지 않게 블록을 빼내세요.');

    poolRef.current = shuffled(TERMS);
    const getNextTerm = () => {
      if (poolRef.current.length === 0) {
        poolRef.current = shuffled(TERMS);
      }
      return poolRef.current.pop() || TERMS[0];
    };

    // Bulid physical cube groups
    for (let row = 0; row < ROWS; row++) {
      const y = 0.3 + row * (BH + 0.02);
      const rot = (row % 2 === 1);
      const pos = rot
        ? [[-SP, y, 0], [0, y, 0], [SP, y, 0]]
        : [[0, y, -SP], [0, y, 0], [0, y, SP]];

      for (let i = 0; i < 3; i++) {
        const [bx, by, bz] = pos[i];
        const clr = WC[Math.floor(Math.random() * WC.length)];
        const mat = new THREE.MeshStandardMaterial({
          color: clr,
          roughness: 0.85,
          metalness: 0.04
        });
        const mesh = new THREE.Mesh(new THREE.BoxGeometry(BW, BH, BD), mat);
        mesh.castShadow = true;
        mesh.receiveShadow = true;
        if (rot) {
          mesh.rotation.y = Math.PI / 2;
        }
        mesh.position.set(bx, by, bz);
        mesh.userData = {
          rot,
          ox: bx,
          oz: bz,
          removed: false,
          data: getNextTerm(),
          row,
          col: i,
          dropping: false,
          dropTarget: y,
          gravityActive: false,
          velocity: { x: 0, y: 0, z: 0 },
          angularVelocity: { x: 0, y: 0, z: 0 }
        };
        scene.add(mesh);
        blocksRef.current.push(mesh);
      }
    }
  };

  // Three.js Loader and Render Trigger Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let W = canvas.clientWidth || 400;
    let H = canvas.clientHeight || 400;

    const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
    rendererRef.current = renderer;
    renderer.setSize(W, H);
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x130d08);
    scene.fog = new THREE.Fog(0x130d08, 20, 60);
    sceneRef.current = scene;

    const camera = new THREE.PerspectiveCamera(42, W / H, 0.1, 100);
    cameraRef.current = camera;

    // Warm elegant classroom lights
    scene.add(new THREE.AmbientLight(0xfff4e2, 0.6));
    
    const dl = new THREE.DirectionalLight(0xffeedd, 1.25);
    dl.position.set(10, 24, 12);
    dl.castShadow = true;
    dl.shadow.mapSize.set(1024, 1024);
    dl.shadow.camera.near = 0.1;
    dl.shadow.camera.far = 60;
    dl.shadow.camera.left = -15;
    dl.shadow.camera.right = 15;
    dl.shadow.camera.top = 25;
    dl.shadow.camera.bottom = -5;
    scene.add(dl);

    const pl = new THREE.PointLight(0xff9944, 0.5, 45);
    pl.position.set(-8, 6, -8);
    scene.add(pl);

    // Elegant wooden master workspace desk
    const tableGeom = new THREE.CylinderGeometry(7.5, 7.5, 0.3, 32);
    const tableMat = new THREE.MeshStandardMaterial({ 
      color: 0x221308, 
      roughness: 0.88, 
      metalness: 0.1 
    });
    const table = new THREE.Mesh(tableGeom, tableMat);
    table.position.y = -0.15;
    table.receiveShadow = true;
    scene.add(table);

    // Setup initial showcase tower
    setUpTowerScene();

    // Create visual pulling direction indicator helpers (glowing spheres)
    const indLeftGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const indLeftMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b, depthTest: false, transparent: true, opacity: 0.95 });
    const indLeft = new THREE.Mesh(indLeftGeom, indLeftMat);
    indLeft.renderOrder = 999; // Render on top of everything
    indLeft.visible = false;
    scene.add(indLeft);
    indicatorLeftRef.current = indLeft;

    const indRightGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const indRightMat = new THREE.MeshBasicMaterial({ color: 0x00b4d8, depthTest: false, transparent: true, opacity: 0.95 });
    const indRight = new THREE.Mesh(indRightGeom, indRightMat);
    indRight.renderOrder = 999;
    indRight.visible = false;
    scene.add(indRight);
    indicatorRightRef.current = indRight;

    // Create visual placement destination indicators (glowing spheres)
    const placeLeftGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const placeLeftMat = new THREE.MeshBasicMaterial({ color: 0x10b981, depthTest: false, transparent: true, opacity: 0.95 });
    const placeLeft = new THREE.Mesh(placeLeftGeom, placeLeftMat);
    placeLeft.renderOrder = 999;
    placeLeft.visible = false;
    scene.add(placeLeft);
    placementIndicatorLeftRef.current = placeLeft;

    const placeCenterGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const placeCenterMat = new THREE.MeshBasicMaterial({ color: 0xffffff, depthTest: false, transparent: true, opacity: 0.95 });
    const placeCenter = new THREE.Mesh(placeCenterGeom, placeCenterMat);
    placeCenter.renderOrder = 999;
    placeCenter.visible = false;
    scene.add(placeCenter);
    placementIndicatorCenterRef.current = placeCenter;

    const placeRightGeom = new THREE.SphereGeometry(0.18, 16, 16);
    const placeRightMat = new THREE.MeshBasicMaterial({ color: 0xd946ef, depthTest: false, transparent: true, opacity: 0.95 });
    const placeRight = new THREE.Mesh(placeRightGeom, placeRightMat);
    placeRight.renderOrder = 999;
    placeRight.visible = false;
    scene.add(placeRight);
    placementIndicatorRightRef.current = placeRight;

    // Camera viewpoints Setup (Spherical coordinates)
    let th = 0.5;
    let ph = 0.55;
    let rad = 20;
    const tgt = new THREE.Vector3(0, 5, 0);

    const updateCam = () => {
      camera.position.set(
        tgt.x + rad * Math.sin(ph) * Math.sin(th),
        tgt.y + rad * Math.cos(ph),
        tgt.z + rad * Math.sin(ph) * Math.cos(th)
      );
      camera.lookAt(tgt);
    };
    updateCam();

    const raycaster = new THREE.Raycaster();
    const mouse = new THREE.Vector2();

    // Interaction Helpers
    let lastHovered: THREE.Mesh | null = null;
    let isOrbiting = false;
    let drag = false;
    let startX = 0;
    let startY = 0;

    const setMeshEmissive = (mesh: THREE.Mesh, hex: number, intensity: number) => {
      const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
      materials.forEach((mat: any) => {
        if (mat.emissive) {
          mat.emissive.setHex(hex);
          mat.emissiveIntensity = intensity;
        }
      });
    };

    const getTopRowLocal = () => {
      let maxRow = -1;
      blocksRef.current.forEach(b => {
        if (!b.userData.removed && b.userData.row > maxRow) {
          maxRow = b.userData.row;
        }
      });
      return maxRow;
    };

    const isSafeToPull = (b: THREE.Mesh) => {
      if (b.userData.row === getTopRowLocal()) return false;
      const matchingRow = blocksRef.current.filter(
        x => x.userData.row === b.userData.row && !x.userData.removed
      );
      return matchingRow.length > 1;
    };

    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      const cx = e.clientX - rect.left;
      const cy = e.clientY - rect.top;

      if (!isOrbiting) {
        mouse.x = (cx / rect.width) * 2 - 1;
        mouse.y = -(cy / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(
          blocksRef.current.filter(b => !b.userData.removed)
        );

        if (hits.length > 0) {
          const b = hits[0].object as THREE.Mesh;
          if (b !== lastHovered) {
            if (lastHovered && lastHovered !== selRef.current) {
              setMeshEmissive(lastHovered, 0, 0);
            }
            lastHovered = b;
            if (b !== selRef.current) {
              setMeshEmissive(b, 0xffdd88, 0.35);
            }
          }
          setHoveredBlockInfo(b.userData.data);
          setTooltipPos({ x: e.clientX, y: e.clientY });
          canvas.style.cursor = 'pointer';
        } else {
          if (lastHovered && lastHovered !== selRef.current) {
            setMeshEmissive(lastHovered, 0, 0);
          }
          lastHovered = null;
          setHoveredBlockInfo(null);
          canvas.style.cursor = 'grab';
        }
      } else {
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;
        if (Math.abs(dx) > 3 || Math.abs(dy) > 3) {
          drag = true;
        }
        if (drag) {
          th -= dx * 0.008;
          ph = Math.max(0.15, Math.min(1.35, ph + dy * 0.0055));
          startX = e.clientX;
          startY = e.clientY;
          updateCam();
        }
      }
    };

    const onMouseDown = (e: MouseEvent) => {
      startX = e.clientX;
      startY = e.clientY;
      isOrbiting = true;
      drag = false;
    };

    const onMouseUp = (e: MouseEvent) => {
      isOrbiting = false;
      if (e.target !== canvas) {
        return;
      }
      if (pendingPlaceBlockRef.current) {
        return;
      }
      if (!drag) {
        const rect = canvas.getBoundingClientRect();
        const cx = e.clientX - rect.left;
        const cy = e.clientY - rect.top;

        mouse.x = (cx / rect.width) * 2 - 1;
        mouse.y = -(cy / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(
          blocksRef.current.filter(b => !b.userData.removed)
        );

        if (hits.length > 0) {
          const clicked = hits[0].object as THREE.Mesh;
          
          if (!isSafeToPull(clicked)) {
            setMeshEmissive(clicked, 0xff2200, 0.7);
            playSound('wobble');
            setTimeout(() => {
              if (clicked !== selRef.current) {
                setMeshEmissive(clicked, 0 ,0);
              }
            }, 300);
            setMessage('⚠️ 가장 위나 해당 층의 마지막 지탱 블록은 선택할 수 없습니다!');
            return;
          }

          if (selRef.current && selRef.current !== clicked) {
            setMeshEmissive(selRef.current, 0, 0);
          }
          selRef.current = clicked;
          setMeshEmissive(clicked, 0xffa500, 0.6);
          setSelectedBlockInfo(clicked.userData.data);
          setMessage(`🎯 선택한 개념: "${clicked.userData.data.term}". 제거 방향을 선택하세요!`);
          playSound('correct');
        } else {
          deselectCurrent();
        }
      }
      drag = false;
    };

    const deselectCurrent = () => {
      if (selRef.current) {
        setMeshEmissive(selRef.current, 0, 0);
        selRef.current = null;
      }
      setSelectedBlockInfo(null);
    };

    const onWheel = (e: WheelEvent) => {
      rad = Math.max(9, Math.min(32, rad + e.deltaY * 0.035));
      updateCam();
    };

    // Mobile touch controls support
    let touchX0 = 0;
    let touchY0 = 0;
    let touchMoved = false;
    let maxTouchNum = 1;
    let initialTouchDist = 0;
    let initialRad = 0;

    const getTouchDistLocal = (t1: Touch, t2: Touch) => {
      const dx = t1.clientX - t2.clientX;
      const dy = t1.clientY - t2.clientY;
      return Math.sqrt(dx * dx + dy * dy);
    };

    const onTouchStart = (e: TouchEvent) => {
      maxTouchNum = Math.max(maxTouchNum, e.touches.length);
      if (e.touches.length === 1) {
        touchX0 = e.touches[0].clientX;
        touchY0 = e.touches[0].clientY;
        touchMoved = false;
      } else if (e.touches.length === 2) {
        initialTouchDist = getTouchDistLocal(e.touches[0], e.touches[1]);
        initialRad = rad;
        touchMoved = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      maxTouchNum = Math.max(maxTouchNum, e.touches.length);
      if (e.touches.length === 1) {
        const dx = e.touches[0].clientX - touchX0;
        const dy = e.touches[0].clientY - touchY0;
        if (Math.abs(dx) > 8 || Math.abs(dy) > 8) {
          touchMoved = true;
        }
        th -= dx * 0.008;
        ph = Math.max(0.15, Math.min(1.35, ph + dy * 0.0055));
        touchX0 = e.touches[0].clientX;
        touchY0 = e.touches[0].clientY;
        updateCam();
      } else if (e.touches.length === 2 && initialTouchDist > 0) {
        const currentDist = getTouchDistLocal(e.touches[0], e.touches[1]);
        if (currentDist > 5) {
          const ratio = initialTouchDist / currentDist;
          rad = Math.max(9, Math.min(32, initialRad * ratio));
          updateCam();
        }
      }
      e.preventDefault();
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.target !== canvas) {
        return;
      }
      if (pendingPlaceBlockRef.current) {
        return;
      }
      if (!touchMoved && maxTouchNum === 1 && e.changedTouches.length === 1) {
        const t = e.changedTouches[0];
        const rect = canvas.getBoundingClientRect();
        const cx = t.clientX - rect.left;
        const cy = t.clientY - rect.top;

        mouse.x = (cx / rect.width) * 2 - 1;
        mouse.y = -(cy / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        const hits = raycaster.intersectObjects(
          blocksRef.current.filter(b => !b.userData.removed)
        );

        if (hits.length > 0) {
          const clicked = hits[0].object as THREE.Mesh;
          if (!isSafeToPull(clicked)) {
            setMeshEmissive(clicked, 0xff2200, 0.7);
            playSound('wobble');
            setTimeout(() => {
              if (clicked !== selRef.current) {
                setMeshEmissive(clicked, 0, 0);
              }
            }, 300);
            setMessage('⚠️ 가장 위나 해당 층의 마지막 지탱 블록은 선택할 수 없습니다!');
            return;
          }
          if (selRef.current && selRef.current !== clicked) {
            setMeshEmissive(selRef.current, 0, 0);
          }
          selRef.current = clicked;
          setMeshEmissive(clicked, 0xffa500, 0.6);
          setSelectedBlockInfo(clicked.userData.data);
          setMessage(`🎯 선택한 개념: "${clicked.userData.data.term}". 제거 방향을 선택하세요!`);
          playSound('correct');
        } else {
          deselectCurrent();
        }
      }

      if (e.touches.length === 0) {
        maxTouchNum = 1;
      }
    };

    // Keyboard support
    const handleKeyDownGlobal = (ev: KeyboardEvent) => {
      if (pendingPlaceBlockRef.current) return;
      if (ev.key === 'ArrowLeft') startPullBlock('left');
      if (ev.key === 'ArrowRight') startPullBlock('right');
      if (ev.key === 'Escape') deselectCurrent();
    };

    // Attach listeners
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    canvas.addEventListener('wheel', onWheel, { passive: true });
    canvas.addEventListener('touchstart', onTouchStart, { passive: true });
    canvas.addEventListener('touchmove', onTouchMove, { passive: false });
    canvas.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', handleKeyDownGlobal);

    // Responsive camera aspect ratio listener
    const resizeRenderer = () => {
      const rect = canvas.getBoundingClientRect();
      camera.aspect = rect.width / rect.height;
      camera.updateProjectionMatrix();
      renderer.setSize(rect.width, rect.height, false);
    };

    const resizeObserver = new ResizeObserver(() => {
      resizeRenderer();
    });
    if (canvas.parentElement) {
      resizeObserver.observe(canvas.parentElement);
    }

    // Assign interactive coordinate place function to ref bridge
    confirmPlaceTopRef.current = (col: number) => {
      const rb = pendingPlaceBlockRef.current;
      if (!rb) return;

      const opt = getPlaceableOptions();
      const nr = opt.row;
      const y = 0.3 + nr * (BH + 0.02);
      const rot = (nr % 2 === 1);

      const bx = rot ? (col - 1) * SP : 0;
      const bz = rot ? 0 : (col - 1) * SP;

      rb.material = new THREE.MeshStandardMaterial({
        color: WC[Math.floor(Math.random() * WC.length)],
        roughness: 0.85,
        metalness: 0.04
      });

      if (poolRef.current.length === 0) {
        poolRef.current = shuffled(TERMS);
      }
      const freshTerm = poolRef.current.pop() || TERMS[0];

      rb.userData = {
        rot,
        ox: bx,
        oz: bz,
        removed: false,
        data: freshTerm,
        row: nr,
        col,
        dropping: true,
        dropTarget: y,
        gravityActive: false,
        velocity: { x: 0, y: 0, z: 0 },
        angularVelocity: { x: 0, y: 0, z: 0 }
      };

      rb.rotation.y = rot ? Math.PI / 2 : 0;
      rb.position.set(bx, y + 7, bz);
      scene.add(rb);
      blocksRef.current.push(rb);

      evalStabilityLocal();

      // Reset selection state
      pendingPlaceBlockRef.current = null;
      setPendingPlaceBlock(null);
      setMessage(`🪜 블록을 꼭대기 층의 ${col === 0 ? '왼쪽' : col === 1 ? '가운데' : '오른쪽'}에 완벽히 세웠습니다!`);

      if (nr >= ROWS + 12) {
        overRef.current = true;
        setGameState('CRASHED');
        setMessage(`🏆 완벽한 신기록 달성! 타워를 무려 ${nr}층까지 완벽하게 쌓아올렸습니다!`);
        playSound('correct');
        triggerConfetti();
      }
    };

    // Trigger stability evaluation
    const evalStabilityLocal = () => {
      let totalOffset = 0;
      const topRValue = getTopRowLocal();

      for (let i = 0; i <= topRValue; i++) {
        const matchingTier = blocksRef.current.filter(x => x.userData.row === i && !x.userData.removed);
        if (matchingTier.length === 0) {
          // Collapse!
          triggerCollapseLocal();
          return;
        }

        const l = matchingTier.some(x => x.userData.col === 0);
        const m = matchingTier.some(x => x.userData.col === 1);
        const r = matchingTier.some(x => x.userData.col === 2);

        let offset = 0;
        if (l && !m && !r) offset = -1.2;
        else if (!l && !m && r) offset = 1.2;
        else if (l && m && !r) offset = -0.4;
        else if (!l && m && r) offset = 0.4;
        else if (l && !m && r) offset = 0.1;

        totalOffset += offset * (1 + (i * 0.12));
      }

      const diff = difficultyRef.current;
      let multiplier = 8.0; // default normal
      if (diff === 'easy') {
        multiplier = 3.2; // low sensitivity
      } else if (diff === 'hard') {
        multiplier = 14.5; // high sensitivity
      }

      const calculatedLean = Math.max(-100, Math.min(100, totalOffset * multiplier));
      setLeanIndex(calculatedLean);

      if (Math.abs(calculatedLean) > 95) {
        triggerCollapseLocal();
      } else if (Math.abs(calculatedLean) > 55) {
        playSound('wobble');
      }
    };

    const triggerCollapseLocal = () => {
      overRef.current = true;
      setGameState('CRASHED');
      playSound('crash');
      setMessage(`💥 아하! 타워가 버티지 못하고 무너졌습니다! (기록 : ${scoreRef.current}개)`);

      // Scatter wood blocks physically in 3D scene!
      blocksRef.current.forEach(b => {
        if (!b.userData.removed) {
          b.userData.velocity = {
            x: (Math.random() - 0.5) * 7,
            y: (Math.random() * 6) + 3,
            z: (Math.random() - 0.5) * 7
          };
          b.userData.angularVelocity = {
            x: (Math.random() - 0.5) * 5,
            y: (Math.random() - 0.5) * 5,
            z: (Math.random() - 0.5) * 5
          };
          b.userData.gravityActive = true;
        }
      });
    };

    // Engine Core Animation Loop Frame
    let requestFrameId = 0;
    let lastTime = performance.now();

    const animateLoop = () => {
      requestFrameId = requestAnimationFrame(animateLoop);
      const now = performance.now();
      const dt = Math.min((now - lastTime) / 1000, 0.05);
      lastTime = now;

      // Slow slow dramatic rotating showcase on start menu
      if (gameStateRef.current === 'START') {
        th += dt * 0.12;
        updateCam();
      }

      // Handle continuous pull animations
      if (pullingRef.current && selRef.current) {
        pProgRef.current += dt * 2.45;
        const b = selRef.current;
        const distance = pProgRef.current * (BW + 0.1) * pDirRef.current;
        
        if (b.userData.rot) {
          // Rotated block's long side is along Z-axis: pull along Z
          b.position.z = b.userData.oz + distance;
          b.position.x = b.userData.ox;
        } else {
          // Unrotated block's long side is along X-axis: pull along X
          b.position.x = b.userData.ox + distance;
          b.position.z = b.userData.oz;
        }

        if (pProgRef.current >= 1.0) {
          // Pulling finished! Remove and put to top
          b.userData.removed = true;
          scene.remove(b);
          pullingRef.current = false;
          selRef.current = null;
          setSelectedBlockInfo(null);

          // Update Score
          scoreRef.current += 1;
          const currentNewScore = scoreRef.current;
          setScore(currentNewScore);

          const currentNewLevel = Math.floor(currentNewScore / 4) + 1;
          levelRef.current = currentNewLevel;
          setLevel(currentNewLevel);

          if (currentNewScore > highScore) {
            setHighScore(currentNewScore);
            localStorage.setItem('jenga_highscore', currentNewScore.toString());
          }

          // Trigger interactive choice selection to place at the top level
          pendingPlaceBlockRef.current = b;
          setPendingPlaceBlock(b);
          setMessage("🎉 블록 빼기에 성공했습니다! 꼭대기에 쌓을 위치(왼쪽, 가운데, 오른쪽)를 아래 버튼에서 선택해 주세요.");
        }
      }

      // Continuous block drops and physics crashes
      blocksRef.current.forEach(b => {
        if (b.userData.dropping) {
          b.position.y -= dt * 12;
          if (b.position.y <= b.userData.dropTarget) {
            b.position.y = b.userData.dropTarget;
            b.userData.dropping = false;
            // Wobble desktop slightly on landing
            setWobbleOffset((Math.random() > 0.5 ? 1 : -1) * 3);
            setTimeout(() => setWobbleOffset(0), 180);
            playSound('correct');
          }
        }

        // Drop scattering blocks for visual drama!
        if (b.userData.gravityActive) {
          b.position.x += b.userData.velocity.x * dt;
          b.position.y += b.userData.velocity.y * dt;
          b.position.z += b.userData.velocity.z * dt;

          b.userData.velocity.y -= 14 * dt; // Gravity speed

          b.rotation.x += b.userData.angularVelocity.x * dt;
          b.rotation.y += b.userData.angularVelocity.y * dt;
          b.rotation.z += b.userData.angularVelocity.z * dt;

          if (b.position.y < -4.5) {
            b.userData.gravityActive = false;
            b.position.y = -4.5;
          }
        }
      });

      // Update interactive 3D indicators on the selected block
      if (selRef.current && !pullingRef.current && !overRef.current) {
        const b = selRef.current;
        const pullAxis = b.userData.rot ? new THREE.Vector3(0, 0, 1) : new THREE.Vector3(1, 0, 0);
        
        let leftDir = -1;
        let rightDir = 1;
        if (camera) {
          const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const dot = pullAxis.dot(cameraRight);
          if (dot >= 0) {
            leftDir = -1;
            rightDir = 1;
          } else {
            leftDir = 1;
            rightDir = -1;
          }
        }

        // Project positions: block width is 1.5, let's put helper spheres just beyond the visual left/right ends (e.g. 1.5 * 0.5 + 0.1 = 0.85)
        const posL = b.position.clone().addScaledVector(pullAxis, 0.85 * leftDir);
        const posR = b.position.clone().addScaledVector(pullAxis, 0.85 * rightDir);

        if (indicatorLeftRef.current) {
          indicatorLeftRef.current.position.copy(posL);
          indicatorLeftRef.current.visible = true;
        }
        if (indicatorRightRef.current) {
          indicatorRightRef.current.position.copy(posR);
          indicatorRightRef.current.visible = true;
        }
      } else {
        if (indicatorLeftRef.current) indicatorLeftRef.current.visible = false;
        if (indicatorRightRef.current) indicatorRightRef.current.visible = false;
      }

      // Update placement destination indicators at top layer
      const pb = pendingPlaceBlockRef.current;
      if (pb) {
        const opt = getPlaceableOptions();
        const nr = opt.row;
        const y = 0.3 + nr * (BH + 0.02);
        const rot = (nr % 2 === 1);

        let visualToPhysical = [0, 1, 2];
        if (camera) {
          const topAxis = rot ? new THREE.Vector3(1, 0, 0) : new THREE.Vector3(0, 0, 1);
          const cameraRight = new THREE.Vector3(1, 0, 0).applyQuaternion(camera.quaternion);
          const dot = topAxis.dot(cameraRight);
          if (dot < 0) {
            visualToPhysical = [2, 1, 0];
          }
        }

        const getPosForColLocal = (colIdx: number) => {
          const bx = rot ? (colIdx - 1) * SP : 0;
          const bz = rot ? 0 : (colIdx - 1) * SP;
          return new THREE.Vector3(bx, y + 0.35, bz);
        };

        const physL = visualToPhysical[0];
        const physC = visualToPhysical[1];
        const physR = visualToPhysical[2];

        if (placementIndicatorLeftRef.current) {
          placementIndicatorLeftRef.current.position.copy(getPosForColLocal(physL));
          placementIndicatorLeftRef.current.visible = opt.freeCols.includes(physL);
        }
        if (placementIndicatorCenterRef.current) {
          placementIndicatorCenterRef.current.position.copy(getPosForColLocal(physC));
          placementIndicatorCenterRef.current.visible = opt.freeCols.includes(physC);
        }
        if (placementIndicatorRightRef.current) {
          placementIndicatorRightRef.current.position.copy(getPosForColLocal(physR));
          placementIndicatorRightRef.current.visible = opt.freeCols.includes(physR);
        }
      } else {
        if (placementIndicatorLeftRef.current) placementIndicatorLeftRef.current.visible = false;
        if (placementIndicatorCenterRef.current) placementIndicatorCenterRef.current.visible = false;
        if (placementIndicatorRightRef.current) placementIndicatorRightRef.current.visible = false;
      }

      renderer.render(scene, camera);
    };

    // Run animation index
    requestFrameId = requestAnimationFrame(animateLoop);

    return () => {
      cancelAnimationFrame(requestFrameId);
      resizeObserver.disconnect();
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      canvas.removeEventListener('wheel', onWheel);
      canvas.removeEventListener('touchstart', onTouchStart);
      canvas.removeEventListener('touchmove', onTouchMove);
      canvas.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', handleKeyDownGlobal);
      renderer.dispose();
    };
  }, []);

  return (
    <div className="w-full h-full flex flex-col items-center justify-between bg-[#110c08] text-white p-3 font-sans relative select-none overflow-hidden rounded-2xl border border-amber-900/20">
      
      {/* Decorative desktop wooden grid asset overlay */}
      <div 
        className="absolute inset-0 opacity-15 pointer-events-none mix-blend-color-burn"
        style={{
          backgroundImage: 'radial-gradient(ellipse at center, rgba(120,60,10,0.4) 0%, rgba(0,0,0,0.9) 80%)'
        }}
      />

      <header className="w-full flex items-center justify-between pb-2 border-b border-white/5 z-20 bg-[#110c08]/85 py-1">
        <div className="flex items-center gap-2">
          <img 
            src="https://i.imgur.com/0wF00pI.png" 
            alt="Jenga Graphic" 
            referrerPolicy="no-referrer"
            className="w-9 h-9 object-contain bg-white/5 p-1 rounded-xl"
          />
          <div>
            <h1 className="text-sm md:text-base font-black text-amber-100 leading-none">IB 3D 젠가 챌린지</h1>
            <p className="text-[10px] text-zinc-400 font-bold mt-0.5">드래그로 회전하고 두 손가락으로 화면을 넓혀 확대해 보세요!</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 md:gap-2">
          <button 
            onClick={() => setShowHelp(prev => !prev)}
            className="text-[11px] flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 font-bold transition-all cursor-pointer"
          >
            <HelpCircle className="w-3.5 h-3.5 shrink-0" />
            <span>조작법</span>
          </button>
          <div className="text-xs bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-xl font-bold flex gap-3 text-amber-400">
            <span>최고 점수: <span className="text-white font-extrabold">{highScore}</span>개</span>
            <span className="text-white/20">|</span>
            <span>현재 점수: <span className="text-amber-300 font-extrabold">{score}</span>개</span>
          </div>
        </div>
      </header>

      {/* Immersive 3D WebGL Jenga Canvas Scene with strictly bounded height-0 flex-1 */}
      <div className="flex-1 w-full h-0 flex items-center justify-center relative select-none mt-1">
        <canvas 
          ref={canvasRef} 
          className="absolute inset-0 w-full h-full block cursor-grab active:cursor-grabbing outline-none rounded-xl"
        />

        {/* Hover Definition Tooltip Card over Blocks */}
        {hoveredBlockInfo && (
          <div 
            id="tip"
            className="absolute bg-[#0f0700]/95 border border-[#a0724a] rounded-xl p-3 text-[#f5deb3] text-xs shadow-2xl pointer-events-none z-30 flex flex-col min-w-[200px] max-w-[250px] animate-fade-in"
            style={{
              left: `${tooltipPos.x - 30}px`,
              top: `${tooltipPos.y - 120}px`
            }}
          >
            <div className="text-[9px] text-[#a0724a] font-bold uppercase tracking-wider mb-0.5">
              {hoveredBlockInfo.cat}
            </div>
            <div className="text-sm font-black text-white mb-1.5">
              {hoveredBlockInfo.term}
            </div>
            <p className="text-[11px] leading-relaxed opacity-85">
              {hoveredBlockInfo.desc}
            </p>
          </div>
        )}

        {/* Stability Balance Slider Overlay - absolutely overlaid inside canvas area! */}
        {gameState === 'PLAYING' && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm px-4 py-1.5 bg-zinc-950/85 rounded-xl border border-amber-900/10 z-20 text-center animate-fade-in shadow-xl backdrop-blur-sm">
            <div className="flex items-center justify-between text-[10px] font-black text-zinc-400 mb-1">
              <span className="text-cyan-400 flex items-center gap-1">◀ 좌측 기욺</span>
              <span className="bg-amber-950/40 border border-amber-900/30 px-2 py-0.5 rounded text-amber-300 font-black">
                {difficulty === 'easy' ? '하 (초보)' : difficulty === 'normal' ? '중 (보통)' : '상 (프로)'} | {level}단계
              </span>
              <span className="text-rose-400 flex items-center gap-1">우측 기욺 ▶</span>
            </div>
            
            <div className="w-full h-3 bg-[#0a0705] border border-amber-900/20 rounded-full overflow-hidden relative flex items-center justify-center">
              {/* Center gravity safety point */}
              <div className="absolute w-1.5 h-full bg-emerald-500 z-10 opacity-70 shadow" />
              
              {/* Tilt index indicator dot */}
              <motion.div 
                className={`absolute h-full rounded-full ${
                  Math.abs(leanIndex) > 75 
                    ? 'bg-rose-500 shadow-lg shadow-rose-500/40' 
                    : Math.abs(leanIndex) > 50 
                      ? 'bg-amber-500 shadow-sm' 
                      : 'bg-emerald-400'
                }`}
                style={{
                  width: '18px',
                  left: `calc(50% - 9px + ${leanIndex / 2}%)`
                }}
                animate={{ x: wobbleOffset * 0.45 }}
                transition={{ type: 'spring', stiffness: 220, damping: 12 }}
              />
            </div>

            {Math.abs(leanIndex) > 60 && (
              <div className="text-[9px] text-rose-400 font-bold mt-1.5 flex items-center justify-center gap-1 animate-pulse">
                <AlertTriangle className="w-3.5 h-3.5" />
                <span>경고: 탑의 질량중심이 한쪽으로 극도로 치우쳤습니다!</span>
              </div>
            )}
          </div>
        )}

        {/* Dynamic Start Overlays */}
        {gameState === 'START' && (
          <div className="absolute inset-0 bg-black/75 flex flex-col items-center justify-center p-4 text-center z-10 backdrop-blur-sm rounded-xl overflow-y-auto">
            <div className="w-14 h-14 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-3 shrink-0">
              <img 
                src="https://i.imgur.com/0wF00pI.png" 
                alt="3D Jenga Cover" 
                referrerPolicy="no-referrer"
                className="w-10 h-10 object-contain"
              />
            </div>
            <h2 className="text-xl font-black mb-1.5 text-amber-100 shrink-0">IB 탐구 3D 젠가 챌린지</h2>
            
            <p className="text-[11px] text-zinc-300 font-semibold mb-3 max-w-sm leading-relaxed shrink-0">
              3D 탑을 마음껏 회전/확대하며 시야를 확보하고, <span className="text-amber-400 font-bold">IB 개념·학습자상·ATL 블록</span>을 빼내어 꼭대기 층에 안전하게 쌓으세요!
            </p>

            <div className="grid grid-cols-2 gap-3 max-w-sm w-full mb-4 text-left text-[10px] bg-zinc-950/70 p-3 rounded-xl border border-amber-900/20 shrink-0">
              <div>
                <h4 className="font-extrabold text-amber-300 mb-1 flex items-center gap-1">📱 태블릿/터치 조작</h4>
                <ul className="space-y-0.5 text-zinc-300 leading-tight">
                  <li>• <b>화면 회전</b>: 한 손가락으로 드래그</li>
                  <li>• <b>확대/축소</b>: 두 손가락 줌인/아웃 (Pinch)</li>
                  <li>• <b>블록 선택</b>: 블록을 가볍게 터치</li>
                  <li>• <b>블록 빼기</b>: 하단 좌/우 빼기 버튼</li>
                </ul>
              </div>
              <div className="border-l border-zinc-800 pl-3">
                <h4 className="font-extrabold text-[#d97706] mb-1 flex items-center gap-1">💻 PC/마우스 조작</h4>
                <ul className="space-y-0.5 text-zinc-300 leading-tight">
                  <li>• <b>화면 회전</b>: 마우스 클릭 후 드래그</li>
                  <li>• <b>확대/축소</b>: 마우스 휠 스크롤</li>
                  <li>• <b>블록 선택</b>: 마우스 왼쪽 클릭</li>
                  <li>• <b>블록 빼기</b>: 하단 좌/우 빼기 버튼</li>
                </ul>
              </div>
            </div>

            {/* 난이도 선택 */}
            <div className="w-full max-w-sm mb-4 shrink-0">
              <span className="text-[10px] font-black text-amber-300 block mb-1.5 text-center">🧱 젠가 흔들림 난이도 선택 (하/중/상)</span>
              <div className="grid grid-cols-3 gap-1.5 bg-zinc-950/80 p-1.5 rounded-xl border border-amber-900/30">
                <button
                  type="button"
                  onClick={() => setDifficulty('easy')}
                  className={`py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    difficulty === 'easy'
                      ? 'bg-emerald-500 text-white shadow-md'
                      : 'text-emerald-400 hover:bg-emerald-950/40'
                  }`}
                >
                  하 (초보)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('normal')}
                  className={`py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    difficulty === 'normal'
                      ? 'bg-amber-400 text-slate-950 shadow-md'
                      : 'text-amber-300 hover:bg-amber-950/40'
                  }`}
                >
                  중 (보통)
                </button>
                <button
                  type="button"
                  onClick={() => setDifficulty('hard')}
                  className={`py-1.5 rounded-lg text-[11px] font-black transition-all cursor-pointer ${
                    difficulty === 'hard'
                      ? 'bg-rose-600 text-white shadow-md'
                      : 'text-rose-400 hover:bg-rose-950/40'
                  }`}
                >
                  상 (프로)
                </button>
              </div>
            </div>

            <Button 
              onClick={initGamePlay}
              icon={Play}
              className="px-8 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-900 rounded-xl shadow-lg border-b-4 border-amber-800 shrink-0"
            >
              도전 탐구 시작하기
            </Button>
          </div>
        )}

        {/* Controller Drawer Panel overlay absolutely overlaid at the bottom of the canvas! */}
        {gameState === 'PLAYING' && (
          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-[calc(100%-24px)] max-w-sm z-30 flex flex-col gap-1.5">
            {/* Concept summary banner */}
            <div className="bg-zinc-950/95 border border-amber-900/15 rounded-xl p-2.5 shadow-2xl backdrop-blur-sm min-h-[76px] flex flex-col justify-center">
              <AnimatePresence mode="wait">
                {selectedBlockInfo ? (
                  <motion.div 
                    key="selected"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="flex flex-col animate-fade-in"
                  >
                    <div className="flex items-start justify-between gap-1">
                      <div>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-700/20 text-amber-300 font-bold border border-amber-800/30">
                          {selectedBlockInfo.cat}
                        </span>
                        <h3 className="text-xs font-black text-white mt-1 leading-none">{selectedBlockInfo.term}</h3>
                      </div>
                      <p className="text-[10px] text-zinc-400 max-w-[190px] text-right font-medium leading-tight">
                        {selectedBlockInfo.desc}
                      </p>
                    </div>
                  </motion.div>
                ) : (
                  <motion.div 
                    key="unselected"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-1.5 px-4 flex flex-col items-center justify-center gap-1"
                  >
                    <HelpCircle className="w-4 h-4 text-amber-400 animate-pulse shrink-0" />
                    <span className="text-xs text-amber-100 font-bold leading-none">{message}</span>
                    <span className="text-[9px] text-zinc-400 font-medium">타워의 블록을 자유롭게 클릭하여 선택해 보세요!</span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Interactive Control Buttons - Toggle between Pulling and Placing */}
            {pendingPlaceBlock ? (
              <div className="flex flex-col gap-1.5 w-full animate-fade-in">
                <span className="text-[10px] text-amber-300 font-extrabold text-center block bg-amber-950/40 py-1 rounded border border-amber-900/30">
                  🧱 어디에 완벽히 쌓을지 균형 게이지와 3D 표식(초록,하양,보라)을 보며 선택하세요!
                </span>
                <div className="flex gap-1.5 w-full">
                  {(() => {
                    const { visualToPhysical } = getTopPlaceableMapping();
                    return [0, 1, 2].map((visualIndex) => {
                      const colIndex = visualToPhysical[visualIndex];
                      const options = getPlaceableOptions();
                      const isAvailable = options.freeCols.includes(colIndex);
                      
                      let btnStyle = '';
                      let label = '';
                      
                      if (visualIndex === 0) {
                        label = '🟢 ◀ 왼쪽';
                        btnStyle = isAvailable
                          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-white border-emerald-800 active:translate-y-0.5 active:border-b-2 cursor-pointer'
                          : 'bg-emerald-950/20 text-emerald-800 border-emerald-950/30 cursor-not-allowed opacity-30';
                      } else if (visualIndex === 1) {
                        label = '⚪ ■ 가운데';
                        btnStyle = isAvailable
                          ? 'bg-gradient-to-r from-zinc-200 to-zinc-300 hover:from-zinc-100 hover:to-zinc-200 text-zinc-950 border-zinc-400 active:translate-y-0.5 active:border-b-2 cursor-pointer'
                          : 'bg-zinc-900/40 text-zinc-700 border-zinc-950/30 cursor-not-allowed opacity-30';
                      } else {
                        label = '🟣 오른쪽 ▶';
                        btnStyle = isAvailable
                          ? 'bg-gradient-to-r from-fuchsia-500 to-pink-600 hover:from-fuchsia-400 hover:to-pink-500 text-white border-fuchsia-800 active:translate-y-0.5 active:border-b-2 cursor-pointer'
                          : 'bg-fuchsia-950/20 text-fuchsia-800 border-fuchsia-950/30 cursor-not-allowed opacity-30';
                      }

                      return (
                        <button
                          key={visualIndex}
                          onClick={() => confirmPlaceTopRef.current?.(colIndex)}
                          disabled={!isAvailable}
                          className={`flex-grow flex-1 py-1.5 block text-xs font-black rounded-lg border-b-4 transition-all flex flex-col items-center justify-center select-none ${btnStyle}`}
                        >
                          <span className="font-extrabold text-[11px]">
                            {label}
                          </span>
                          <span className="text-[8px] opacity-75 mt-0.5">
                            {isAvailable ? '비어있음' : '꽉 참'}
                          </span>
                        </button>
                      );
                    });
                  })()}
                </div>
              </div>
            ) : (
              <div className="flex gap-2 text-center items-center justify-between w-full">
                <button 
                  onClick={() => startPullBlock('left')}
                  disabled={!selectedBlockInfo}
                  className={`flex-grow flex-1 py-2 border-b-4 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 select-none ${
                    selectedBlockInfo 
                      ? 'bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 border-amber-700 active:translate-y-0.5 active:border-b-2 cursor-pointer' 
                      : 'bg-zinc-800/40 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-40'
                  }`}
                >
                  ← 🟡 왼쪽으로 빼기
                </button>
                <button 
                  onClick={() => startPullBlock('right')}
                  disabled={!selectedBlockInfo}
                  className={`flex-grow flex-1 py-2 border-b-4 text-xs font-black rounded-lg transition-all flex items-center justify-center gap-1 select-none ${
                    selectedBlockInfo 
                      ? 'bg-gradient-to-r from-cyan-500 to-cyan-600 hover:from-cyan-400 hover:to-cyan-500 text-white border-cyan-800 active:translate-y-0.5 active:border-b-2 cursor-pointer' 
                      : 'bg-zinc-800/40 text-zinc-600 border-zinc-900 cursor-not-allowed opacity-40'
                  }`}
                >
                  오른쪽으로 빼기 🔵 →
                </button>
              </div>
            )}
          </div>
        )}

        {/* Game crash and complete over modes */}
        {gameState === 'CRASHED' && (
          <div className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-6 text-center z-30 backdrop-blur-sm animate-fade-in rounded-xl">
            <span className="text-5xl mb-3">💥</span>
            <h2 className="text-2xl font-black text-rose-100 mb-1">앗! 타워가 쓰러졌습니다!</h2>
            <p className="text-xs text-zinc-400 mb-6 max-w-xs leading-relaxed font-semibold">
              {score > 0 
                ? `훌륭한 탐구정신으로 총 ${score}개의 블록을 무사히 빼내어 쌓아 올렸습니다!` 
                : '균형 감각을 발휘하여 첫 블록 조각 추출을 성찰해보세요.'}
            </p>

            <Button 
              onClick={handleResetClick} 
              icon={RefreshCw}
              className="px-10 py-3.5 bg-rose-600 hover:bg-rose-700 text-white text-xs font-black border-b-4 border-rose-800 active:translate-y-1 shadow-lg transition-all rounded-xl"
            >
              다시 새로운 타워 세우기
            </Button>
          </div>
        )}

        {/* Toggleable Detailed Controls Help Overlay */}
        <AnimatePresence>
          {showHelp && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/85 flex flex-col items-center justify-center p-5 text-center z-50 backdrop-blur-md rounded-xl"
            >
              <div className="bg-[#18110b] border border-amber-900/35 p-5 rounded-2xl max-w-sm w-full text-left relative shadow-2xl">
                <button 
                  onClick={() => setShowHelp(false)}
                  className="absolute top-3 right-3 text-zinc-400 hover:text-white p-1 rounded-lg bg-zinc-900 cursor-pointer text-xs font-bold"
                >
                  ✕ 닫기
                </button>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/20 text-amber-300">
                    <Info className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-amber-100">3D 젠가 조작 방법 안내</h3>
                    <p className="text-[10px] text-zinc-400 font-bold">터치 태블릿과 PC 마우스를 완벽 지원합니다.</p>
                  </div>
                </div>

                <div className="space-y-4 text-xs">
                  {/* Rotate section */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <h4 className="font-extrabold text-amber-400 mb-1 flex items-center gap-1.5">
                      🔄 화면 회전하기 (전체 시야 확인)
                    </h4>
                    <p className="text-[11px] text-zinc-300 pl-1 leading-normal">
                      • <b>태블릿 (터치)</b>: 화면 아무 곳이나 <b>한 손가락으로 가볍게 밀어서</b> 탑을 360도 회전하세요.<br/>
                      • <b>컴퓨터 (마우스)</b>: 마우스 왼쪽 버튼을 클릭한 상태로 움직이세요.
                    </p>
                  </div>

                  {/* Zoom section */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <h4 className="font-extrabold text-amber-400 mb-1 flex items-center gap-1.5">
                      🔍 화면 확대/축소 (자세히 탐색)
                    </h4>
                    <p className="text-[11px] text-zinc-300 pl-1 leading-normal">
                      • <b>태블릿 (터치)</b>: 화면에 <b>두 손가락을 대고 피치 아웃(벌리기) / 피치 인(모으기)</b> 하세요.<br/>
                      • <b>컴퓨터 (마우스)</b>: 마우스의 휠 스크롤을 위/아래로 굴리세요.
                    </p>
                  </div>

                  {/* Block execution section */}
                  <div className="p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800">
                    <h4 className="font-extrabold text-amber-400 mb-1 flex items-center gap-1.5">
                      🪵 블록 선택 & 안전하게 빼내기
                    </h4>
                    <p className="text-[11px] text-zinc-300 pl-1 leading-normal">
                      • <b>선택</b>: 타워의 블록을 터치/클릭하면 주황색으로 선택되며 하단에 의미 설명이 나옵니다.<br/>
                      • <b>빼기</b>: 하단의 <b>[← 왼쪽으로 빼기]</b> 또는 <b>[오른쪽으로 빼기 →]</b> 버튼을 누르면 서서히 밀려 나옵니다.
                    </p>
                  </div>
                </div>

                <button 
                  onClick={() => setShowHelp(false)}
                  className="w-full mt-4 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-slate-950 font-black text-xs rounded-xl shadow-lg cursor-pointer"
                >
                  확인했습니다 (게임으로 복귀)
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

      </div>

      <div className="absolute bottom-1 right-2 pointer-events-none text-[8px] font-mono text-zinc-600 opacity-60 z-20">
        Three.js Powered
      </div>
    </div>
  );
};
