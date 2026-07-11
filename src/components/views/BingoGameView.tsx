import React, { useState, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { 
  ArrowLeft, Bot, User, Award, RefreshCw, Play, Trophy, 
  Volume2, VolumeX, Sparkles, HelpCircle, Users, QrCode, 
  Copy, Check, Share2, LogOut, CheckCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { db } from '../../firebase';
import { 
  doc, setDoc, updateDoc, onSnapshot, getDoc, deleteDoc, arrayUnion 
} from 'firebase/firestore';
import { UserProfile } from '../../types';

// Sound synthesis helper using Web Audio API to prevent external file issues
const playSynthSound = (type: 'select' | 'bingo' | 'win' | 'lose') => {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    
    if (type === 'select') {
      // Short blip sound
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.1); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.12);
      osc.start();
      osc.stop(ctx.currentTime + 0.12);
    } else if (type === 'bingo') {
      // Golden double sound
      [440, 554.37, 659.25].forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.08);
        gain.gain.setValueAtTime(0.08, ctx.currentTime + idx * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.005, ctx.currentTime + idx * 0.08 + 0.2);
        osc.start(ctx.currentTime + idx * 0.08);
        osc.stop(ctx.currentTime + idx * 0.08 + 0.2);
      });
    } else if (type === 'win') {
      // Arpeggio leading to high chord
      const chords = [523.25, 659.25, 783.99, 1046.50]; // C major
      chords.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + idx * 0.1);
        gain.gain.setValueAtTime(0.1, ctx.currentTime + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + idx * 0.1 + 0.4);
        osc.start(ctx.currentTime + idx * 0.1);
        osc.stop(ctx.currentTime + idx * 0.1 + 0.45);
      });
    } else if (type === 'lose') {
      // descending sad buzzer
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(220, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(110, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    }
  } catch (e) {
    console.warn("Web Audio API not supported or blocked by browser policies.");
  }
};

// IB standard content definitions for thematic Bingo Mode
const BINGO_CATEGORIES = [
  {
    title: "🌟 IB 학습자 프로필",
    color: "bg-blue-500/10 border-blue-500/30 text-blue-300",
    hoverBg: "hover:bg-blue-500/20 hover:text-white",
    words: ["탐구하는 사람", "지식이 풍부한 사람", "사고하는 사람", "소통하는 사람", "원칙을 지키는 사람", "열린 마음을 가진 사람", "배려하는 사람", "도전하는 사람", "균형잡힌 사람", "성찰하는 사람"]
  },
  {
    title: "🔍 IB 핵심 개념",
    color: "bg-indigo-500/10 border-indigo-500/30 text-indigo-300",
    hoverBg: "hover:bg-indigo-500/20 hover:text-white",
    words: ["형태", "기능", "원인", "변화", "연결", "관점", "책임"]
  },
  {
    title: "⚙️ 학습 접근 기능 (ATL)",
    color: "bg-violet-500/10 border-violet-500/30 text-violet-300",
    hoverBg: "hover:bg-violet-500/20 hover:text-white",
    words: ["사고 기능", "조사 기능", "의사소통 기능", "대인관계 기능", "자기관리 기능"]
  },
  {
    title: "🚀 실천과 행동",
    color: "bg-emerald-500/10 border-emerald-500/30 text-emerald-300",
    hoverBg: "hover:bg-emerald-500/20 hover:text-white",
    words: ["배우기", "행동하기", "성장하기", "협력하기", "존중하기", "공감", "창의성", "글로벌 마인드"]
  }
];

const ALL_WORDS = BINGO_CATEGORIES.flatMap(cat => cat.words);

interface Cell {
  value: string;
  marked: boolean;
}

// Calculate completed bingo lines (returns array of winning line indices: rows 0-4, cols 5-9, diag 10, diag 11)
const calculateCompletedLines = (board: Cell[]): number[] => {
  if (!board || board.length !== 25) return [];
  const lines: number[] = [];

  // Rows
  for (let r = 0; r < 5; r++) {
    if (board.slice(r * 5, r * 5 + 5).every(cell => cell.marked)) {
      lines.push(r); // rows index 0-4
    }
  }

  // Columns
  for (let c = 0; c < 5; c++) {
    let isColComplete = true;
    for (let r = 0; r < 5; r++) {
      if (!board[r * 5 + c].marked) {
        isColComplete = false;
        break;
      }
    }
    if (isColComplete) {
      lines.push(5 + c); // cols index 5-9
    }
  }

  // Diagonal top-left to bottom-right
  let diag1 = true;
  for (let i = 0; i < 5; i++) {
    if (!board[i * 5 + i].marked) {
      diag1 = false;
      break;
    }
  }
  if (diag1) lines.push(10);

  // Diagonal top-right to bottom-left
  let diag2 = true;
  for (let i = 0; i < 5; i++) {
    if (!board[i * 5 + (4 - i)].marked) {
      diag2 = false;
      break;
    }
  }
  if (diag2) lines.push(11);

  return lines;
};

interface BingoGameViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'bingo') => void;
  onEarnXP: (xp: number, activityType?: string) => void;
  soundEnabled: boolean;
  profile?: UserProfile | null;
}

export const BingoGameView = ({ setView, onEarnXP, soundEnabled, profile }: BingoGameViewProps) => {
  // Game Mode Selection: 'none' | 'single' | 'multi'
  const [gameMode, setGameMode] = useState<'none' | 'single' | 'multi'>('none');

  // ==========================================
  // COMMON STATES
  // ==========================================
  const [playerBoard, setPlayerBoard] = useState<Cell[]>([]);
  const [markedValues, setMarkedValues] = useState<Set<string>>(new Set());
  const [isMusicEnabled, setIsMusicEnabled] = useState(soundEnabled);
  const [lastSelectedValue, setLastSelectedValue] = useState<string | null>(null);
  const BINGO_TARGET = 3;

  // ==========================================
  // SINGLE PLAYER MODE STATES & LOGIC
  // ==========================================
  const [gameState, setGameState] = useState<'intro' | 'setup' | 'playing' | 'ended'>('intro');
  const [computerBoard, setComputerBoard] = useState<Cell[]>([]);
  const playerBingos = useMemo(() => calculateCompletedLines(playerBoard).length, [playerBoard]);
  const computerBingos = useMemo(() => calculateCompletedLines(computerBoard).length, [computerBoard]);
  const [turn, setTurn] = useState<'player' | 'computer'>('player');
  const [winner, setWinner] = useState<'player' | 'computer' | null>(null);
  const [shuffling, setShuffling] = useState(false);
  const [statusMessage, setStatusMessage] = useState('원하는 단어를 선택하세요!');
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const difficultyRef = useRef<'easy' | 'normal' | 'hard'>('normal');

  useEffect(() => {
    difficultyRef.current = difficulty;
  }, [difficulty]);

  // ==========================================
  // MULTIPLAYER MODE STATES & LOGIC
  // ==========================================
  const [multiGameState, setMultiGameState] = useState<'lobby' | 'room-waiting' | 'setup' | 'playing' | 'ended'>('lobby');
  const [currentRoomId, setCurrentRoomId] = useState<string>('');
  const [roomData, setRoomData] = useState<any>(null);
  const [joinCodeInput, setJoinCodeInput] = useState<string>('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLobbyLoading, setIsLobbyLoading] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Auto detect Room Join Parameter in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const roomParam = params.get('room');
    if (roomParam) {
      setGameMode('multi');
      setJoinCodeInput(roomParam);
      if (profile) {
        handleJoinRoom(roomParam);
      }
    }
  }, [profile]);

  // Real-Time Firestore Room Listener
  useEffect(() => {
    if (!currentRoomId || gameMode !== 'multi') return;

    const roomRef = doc(db, 'bingoRooms', currentRoomId);
    const unsubscribe = onSnapshot(roomRef, (snapshot) => {
      if (!snapshot.exists()) {
        setErrorMessage('대결방이 없거나 이미 폭파되었습니다.');
        setGameMode('none');
        setCurrentRoomId('');
        setRoomData(null);
        return;
      }

      const data = snapshot.data();
      setRoomData(data);

      // Sync local game state status
      if (data.status === 'waiting') {
        setMultiGameState('room-waiting');
      } else if (data.status === 'setup') {
        setMultiGameState('setup');
      } else if (data.status === 'playing') {
        setMultiGameState('playing');
      } else if (data.status === 'ended') {
        setMultiGameState('ended');
      }
    }, (error) => {
      console.error("Firestore room listening error:", error);
    });

    return () => unsubscribe();
  }, [currentRoomId, gameMode]);

  // Sync multiplayer board based on calledWords
  useEffect(() => {
    if (gameMode !== 'multi' || !roomData?.calledWords) return;

    const calledSet = new Set<string>(roomData.calledWords);
    
    // Sync local markings
    setPlayerBoard(prevBoard => {
      let updatedCount = 0;
      const updated = prevBoard.map(cell => {
        if (cell.value && calledSet.has(cell.value) && !cell.marked) {
          updatedCount++;
          return { ...cell, marked: true };
        }
        return cell;
      });

      if (updatedCount > 0) {
        const prevL = calculateCompletedLines(prevBoard).length;
        const newL = calculateCompletedLines(updated).length;
        if (newL > prevL && isMusicEnabled) {
          setTimeout(() => playSynthSound('bingo'), 50);
        }
      }
      return updated;
    });

    if (roomData.calledWords.length > 0) {
      setLastSelectedValue(roomData.calledWords[roomData.calledWords.length - 1]);
    }
  }, [roomData?.calledWords, gameMode]);

  // Report local player's calculated bingoCount to Firestore
  const multiBingoLines = useMemo(() => {
    return calculateCompletedLines(playerBoard).length;
  }, [playerBoard]);

  useEffect(() => {
    if (gameMode !== 'multi' || !currentRoomId || !profile || !roomData) return;

    const myDbData = roomData.players?.[profile.uid];
    if (myDbData && myDbData.bingoCount !== multiBingoLines) {
      const roomRef = doc(db, 'bingoRooms', currentRoomId);
      updateDoc(roomRef, {
        [`players.${profile.uid}.bingoCount`]: multiBingoLines
      }).catch(err => console.warn("Failed to update bingoCount in firestore", err));
    }
  }, [multiBingoLines, gameMode, currentRoomId, profile, roomData]);

  // Host Automatically transitions to Play mode when all participants are ready
  useEffect(() => {
    if (gameMode !== 'multi' || !currentRoomId || !roomData || !profile) return;
    if (roomData.status !== 'setup' || roomData.hostId !== profile.uid) return;

    const playersArr = Object.values(roomData.players || {});
    if (playersArr.length >= 2) {
      const allReady = playersArr.every((p: any) => p.status === 'ready');
      if (allReady) {
        const roomRef = doc(db, 'bingoRooms', currentRoomId);
        updateDoc(roomRef, { status: 'playing' })
          .catch(err => console.warn("Failed to set room playing status", err));
      }
    }
  }, [roomData, gameMode, currentRoomId, profile]);

  // Play win sounds for multiplayer end
  useEffect(() => {
    if (gameMode !== 'multi' || !roomData || roomData.status !== 'ended') return;
    if (roomData.winnerId === profile?.uid) {
      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 }
      });
      if (isMusicEnabled) playSynthSound('win');
    } else {
      if (isMusicEnabled) playSynthSound('lose');
    }
  }, [roomData?.status, gameMode]);

  // ==========================================
  // SINGLE PLAYER ACTIONS
  // ==========================================
  const initializeSetupBoard = () => {
    setPlayerBoard(Array.from({ length: 25 }, () => ({ value: '', marked: false })));
  };

  const shuffle = (array: string[]) => {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  const handleSelectWordFromPool = (word: string) => {
    const alreadySelected = playerBoard.some(cell => cell.value === word);
    if (alreadySelected) return;

    const emptyIndex = playerBoard.findIndex(cell => cell.value === '');
    if (emptyIndex === -1) return;

    const newBoard = [...playerBoard];
    newBoard[emptyIndex] = { value: word, marked: false };
    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  const handleRemoveWordFromBoard = (index: number) => {
    const newBoard = [...playerBoard];
    newBoard[index] = { value: '', marked: false };
    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  const handleRandomFill = () => {
    const selectedWords = playerBoard.map(c => c.value).filter(v => v !== '');
    const remainingWords = ALL_WORDS.filter(w => !selectedWords.includes(w));
    const shuffledRemaining = shuffle(remainingWords);

    const newBoard = playerBoard.map(cell => {
      if (cell.value !== '') return cell;
      const nextWord = shuffledRemaining.shift();
      return { value: nextWord || '', marked: false };
    });

    setPlayerBoard(newBoard);
    if (isMusicEnabled) playSynthSound('select');
  };

  const handleClearBoard = () => {
    initializeSetupBoard();
  };

  const handleStartMatch = () => {
    const selectedWords = playerBoard.map(c => c.value);
    const isValid = selectedWords.every(w => w !== '');
    if (!isValid) return;

    setShuffling(true);
    const computerWords = shuffle(selectedWords);

    setComputerBoard(computerWords.map(w => ({ value: w, marked: false })));
    setMarkedValues(new Set());
    setLastSelectedValue(null);
    setWinner(null);
    setTurn('player');
    setStatusMessage('첫 번째 뒤집을 단어를 내 판에서 골라 터치하세요! 🎯');
    setGameState('playing');

    setTimeout(() => setShuffling(false), 450);
  };

  const handleMarkSingle = (value: string) => {
    if (markedValues.has(value) || winner) return;

    const newMarked = new Set(markedValues);
    newMarked.add(value);
    setMarkedValues(newMarked);
    setLastSelectedValue(value);

    if (isMusicEnabled) playSynthSound('select');

    setPlayerBoard(prevBoard => {
      const updated = prevBoard.map(cell => 
        cell.value === value ? { ...cell, marked: true } : cell
      );
      const prevL = calculateCompletedLines(prevBoard).length;
      const newL = calculateCompletedLines(updated).length;
      if (newL > prevL && isMusicEnabled) setTimeout(() => playSynthSound('bingo'), 80);
      return updated;
    });

    setComputerBoard(prevBoard => {
      const updated = prevBoard.map(cell => 
        cell.value === value ? { ...cell, marked: true } : cell
      );
      return updated;
    });
  };

  // Winner check for Single Player
  useEffect(() => {
    if (gameMode !== 'single' || gameState !== 'playing' || winner) return;

    if (playerBingos >= BINGO_TARGET && computerBingos >= BINGO_TARGET) {
      if (playerBingos > computerBingos) {
        setWinner('player');
        setGameState('ended');
        if (isMusicEnabled) playSynthSound('win');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        onEarnXP(50, 'quiz');
      } else if (computerBingos > playerBingos) {
        setWinner('computer');
        setGameState('ended');
        if (isMusicEnabled) playSynthSound('lose');
      } else {
        setWinner('player');
        setGameState('ended');
        if (isMusicEnabled) playSynthSound('win');
        confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
        onEarnXP(50, 'quiz');
      }
    } else if (playerBingos >= BINGO_TARGET) {
      setWinner('player');
      setGameState('ended');
      if (isMusicEnabled) playSynthSound('win');
      confetti({ particleCount: 150, spread: 80, origin: { y: 0.6 } });
      onEarnXP(50, 'quiz');
    } else if (computerBingos >= BINGO_TARGET) {
      setWinner('computer');
      setGameState('ended');
      if (isMusicEnabled) playSynthSound('lose');
    }
  }, [playerBingos, computerBingos, gameState, gameMode]);

  const handlePlayerCellClick = (value: string) => {
    if (gameState !== 'playing' || turn !== 'player' || winner) return;
    if (markedValues.has(value)) return;

    handleMarkSingle(value);
    setTurn('computer');
    setStatusMessage('🤖 컴퓨터가 고민하고 있어요...');
  };

  // Computer AI turn logic
  useEffect(() => {
    if (gameMode !== 'single' || gameState !== 'playing' || turn !== 'computer' || winner) return;

    let delay = 1200;
    const currentDiff = difficultyRef.current;
    if (currentDiff === 'easy') delay = 1800;
    else if (currentDiff === 'hard') delay = 800;

    const timer = setTimeout(() => {
      const unselectedCells = computerBoard.filter(c => !c.marked);
      if (unselectedCells.length === 0) return;

      let choice: string | null = null;

      if (currentDiff === 'easy' && Math.random() < 0.75) {
        const randCell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];
        choice = randCell.value;
      }

      if (!choice) {
        let bestScore = -1;
        let bestCell = unselectedCells[Math.floor(Math.random() * unselectedCells.length)];

        unselectedCells.forEach(cell => {
          let cellScore = 0;
          const cIndex = computerBoard.findIndex(c => c.value === cell.value);
          if (cIndex !== -1) {
            const r = Math.floor(cIndex / 5);
            const c = cIndex % 5;

            const rowCells = computerBoard.slice(r * 5, r * 5 + 5);
            const rowMarkedCount = rowCells.filter(cell => cell.marked).length;
            const ownRowWeight = currentDiff === 'hard' ? 3.5 : currentDiff === 'normal' ? 2.2 : 1.5;
            cellScore += rowMarkedCount * ownRowWeight;

            let colMarkedCount = 0;
            for (let i = 0; i < 5; i++) {
              if (computerBoard[i * 5 + c].marked) colMarkedCount++;
            }
            const ownColWeight = currentDiff === 'hard' ? 3.5 : currentDiff === 'normal' ? 2.2 : 1.5;
            cellScore += colMarkedCount * ownColWeight;

            if (r === c) {
              let d1Marked = 0;
              for (let i = 0; i < 5; i++) {
                if (computerBoard[i * 5 + i].marked) d1Marked++;
              }
              const ownDiagWeight = currentDiff === 'hard' ? 2.8 : currentDiff === 'normal' ? 1.8 : 1.2;
              cellScore += d1Marked * ownDiagWeight;
            }

            if (r + c === 4) {
              let d2Marked = 0;
              for (let i = 0; i < 5; i++) {
                if (computerBoard[i * 5 + (4 - i)].marked) d2Marked++;
              }
              const ownDiagWeight = currentDiff === 'hard' ? 2.8 : currentDiff === 'normal' ? 1.8 : 1.2;
              cellScore += d2Marked * ownDiagWeight;
            }
          }

          const pIndex = playerBoard.findIndex(p => p.value === cell.value);
          if (pIndex !== -1) {
            const pr = Math.floor(pIndex / 5);
            const pc = pIndex % 5;

            const pRowCells = playerBoard.slice(pr * 5, pr * 5 + 5);
            const pRowMarked = pRowCells.filter(cell => cell.marked).length;
            if (pRowMarked >= 3) {
              const defWeight = currentDiff === 'hard' ? 5.5 : currentDiff === 'normal' ? 3.2 : 2.0;
              cellScore += pRowMarked * defWeight;
            }

            let pColMarked = 0;
            for (let i = 0; i < 5; i++) {
              if (playerBoard[i * 5 + pc].marked) pColMarked++;
            }
            if (pColMarked >= 3) {
              const defWeight = currentDiff === 'hard' ? 5.5 : currentDiff === 'normal' ? 3.2 : 2.0;
              cellScore += pColMarked * defWeight;
            }
          }

          const noiseLevel = currentDiff === 'hard' ? 0.01 : currentDiff === 'normal' ? 0.25 : 0.6;
          cellScore += Math.random() * noiseLevel;

          if (cellScore > bestScore) {
            bestScore = cellScore;
            bestCell = cell;
          }
        });

        choice = bestCell.value;
      }

      handleMarkSingle(choice);
      setTurn('player');
      setStatusMessage(`🤖 컴퓨터가 "${choice}"을(를) 불렀습니다! 내 차례입니다.`);
    }, delay);

    return () => clearTimeout(timer);
  }, [gameState, turn, computerBoard, playerBoard, winner, gameMode]);


  // ==========================================
  // MULTIPLAYER ACTIONS
  // ==========================================
  const handleCreateRoom = async () => {
    setIsLobbyLoading(true);
    setErrorMessage(null);
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    const uid = profile?.uid || 'anonymous-host';
    const name = profile?.name || '방장 학생';

    const initialRoom = {
      roomId: code,
      status: 'waiting',
      hostId: uid,
      hostName: name,
      players: {
        [uid]: {
          uid: uid,
          name: name,
          grade: profile?.grade || '3학년',
          class: profile?.class || '탐험반',
          status: 'joining',
          board: [],
          marked: [],
          bingoCount: 0
        }
      },
      calledWords: [],
      currentTurn: uid,
      turnOrder: [uid],
      winnerId: null,
      winnerName: null,
      createdAt: Date.now()
    };

    try {
      await setDoc(doc(db, 'bingoRooms', code), initialRoom);
      setCurrentRoomId(code);
      setMultiGameState('room-waiting');
      initializeSetupBoard();
    } catch (e: any) {
      setErrorMessage('대결방 생성에 실패했습니다: ' + e.message);
    } finally {
      setIsLobbyLoading(false);
    }
  };

  const handleJoinRoom = async (codeOverride?: string) => {
    const code = codeOverride || joinCodeInput.trim();
    if (!code) {
      setErrorMessage('대결방의 4자리 코드를 입력해주세요.');
      return;
    }

    setIsLobbyLoading(true);
    setErrorMessage(null);

    try {
      const roomRef = doc(db, 'bingoRooms', code);
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        setErrorMessage('해당 코드를 가진 대결방을 찾을 수 없습니다.');
        setIsLobbyLoading(false);
        return;
      }

      const data = roomSnap.data();
      if (data.status !== 'waiting') {
        setErrorMessage('이미 시작되었거나 참여가 마감된 방입니다.');
        setIsLobbyLoading(false);
        return;
      }

      const uid = profile?.uid || 'anonymous-joiner-' + Math.random().toString(36).substr(2, 5);
      const name = profile?.name || '참여자 학생';

      const playerObj = {
        uid: uid,
        name: name,
        grade: profile?.grade || '3학년',
        class: profile?.class || '우정반',
        status: 'joining',
        board: [],
        marked: [],
        bingoCount: 0
      };

      const updatedPlayers = { ...data.players, [uid]: playerObj };
      const updatedTurnOrder = Array.from(new Set([...(data.turnOrder || []), uid]));

      await updateDoc(roomRef, {
        players: updatedPlayers,
        turnOrder: updatedTurnOrder
      });

      setCurrentRoomId(code);
      setMultiGameState('room-waiting');
      initializeSetupBoard();
    } catch (e: any) {
      setErrorMessage('대결방 참여에 실패했습니다: ' + e.message);
    } finally {
      setIsLobbyLoading(false);
    }
  };

  const handleStartSetupPhase = async () => {
    if (!currentRoomId) return;
    const roomRef = doc(db, 'bingoRooms', currentRoomId);
    await updateDoc(roomRef, { status: 'setup' });
  };

  const handleMultiplayerReady = async () => {
    const selectedWords = playerBoard.map(c => c.value);
    const isValid = selectedWords.every(w => w !== '');
    if (!isValid) {
      setErrorMessage('보드를 25칸 모두 채운 뒤에 준비완료가 가능합니다.');
      return;
    }

    if (!profile || !currentRoomId) return;

    try {
      const roomRef = doc(db, 'bingoRooms', currentRoomId);
      await updateDoc(roomRef, {
        [`players.${profile.uid}.board`]: selectedWords,
        [`players.${profile.uid}.status`]: 'ready'
      });
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage('준비완료 상태 전송 실패: ' + e.message);
    }
  };

  const handleMultiplayerCellClick = async (value: string) => {
    if (multiGameState !== 'playing' || !roomData) return;
    if (roomData.currentTurn !== profile?.uid) return;
    if (roomData.calledWords?.includes(value)) return;

    try {
      const roomRef = doc(db, 'bingoRooms', currentRoomId);
      const updatedCalled = [...(roomData.calledWords || []), value];

      // Rotate turn
      const myIndex = roomData.turnOrder.indexOf(profile.uid);
      const nextIndex = (myIndex + 1) % roomData.turnOrder.length;
      const nextTurnUid = roomData.turnOrder[nextIndex];

      await updateDoc(roomRef, {
        calledWords: updatedCalled,
        currentTurn: nextTurnUid
      });

      if (isMusicEnabled) playSynthSound('select');
    } catch (err: any) {
      console.error("Error choosing word:", err);
    }
  };

  const handleMultiplayerBingoClaim = async () => {
    if (multiBingoLines < BINGO_TARGET || !profile || !currentRoomId) return;

    try {
      const roomRef = doc(db, 'bingoRooms', currentRoomId);
      await updateDoc(roomRef, {
        status: 'ended',
        winnerId: profile.uid,
        winnerName: profile.name
      });

      onEarnXP(50, 'quiz');
    } catch (err: any) {
      console.error("Error claiming Bingo:", err);
    }
  };

  const handleLeaveRoom = async () => {
    if (!currentRoomId || !profile) {
      setGameMode('none');
      setRoomData(null);
      setCurrentRoomId('');
      setMultiGameState('lobby');
      return;
    }

    const roomRef = doc(db, 'bingoRooms', currentRoomId);
    try {
      if (roomData?.hostId === profile.uid) {
        await deleteDoc(roomRef);
      } else {
        const updatedPlayers = { ...roomData.players };
        delete updatedPlayers[profile.uid];
        const updatedTurnOrder = (roomData.turnOrder || []).filter((uid: string) => uid !== profile.uid);

        await updateDoc(roomRef, {
          players: updatedPlayers,
          turnOrder: updatedTurnOrder
        });
      }
    } catch (e) {
      console.warn("Cleanup warning during leave room:", e);
    }

    setGameMode('none');
    setRoomData(null);
    setCurrentRoomId('');
    setMultiGameState('lobby');
    initializeSetupBoard();
  };

  const handleCopyCode = () => {
    try {
      navigator.clipboard.writeText(currentRoomId);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback method for iframe security
      const textArea = document.createElement("textarea");
      textArea.value = currentRoomId;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Setup QR Join URL
  const qrJoinUrl = `${window.location.origin}/?view=bingo&room=${currentRoomId}`;

  // Calculated draft board filled slots count
  const filledCount = playerBoard.filter(c => c.value !== '').length;

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center p-3 relative overflow-x-hidden font-sans">
      
      {/* Background Radial Accent */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(99,102,241,0.15),rgba(255,255,255,0))]" />

      {/* Main Header */}
      <header className="relative w-full max-w-5xl flex items-center justify-between py-2 mb-3 border-b border-white/10 z-10 font-sans">
        <button 
          onClick={() => {
            if (gameMode !== 'none') {
              if (gameMode === 'multi') {
                handleLeaveRoom();
              } else {
                setGameMode('none');
                setGameState('intro');
              }
            } else {
              setView('home');
            }
          }}
          className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors cursor-pointer"
          id="bingo-header-back-btn"
        >
          <ArrowLeft className="w-4 h-4" />
          {gameMode !== 'none' ? '빙고 메뉴로 가기' : '마을로 돌아가기'}
        </button>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setIsMusicEnabled(!isMusicEnabled)}
            className="p-1.5 bg-white/5 hover:bg-white/10 rounded-full text-white/80 hover:text-white transition-all border border-white/5 cursor-pointer"
            id="bingo-music-toggle-btn"
          >
            {isMusicEnabled ? <Volume2 className="w-3.5 h-3.5 text-indigo-400" /> : <VolumeX className="w-3.5 h-3.5 text-gray-500" />}
          </button>
          
          <div className="bg-indigo-950/60 border border-indigo-500/30 rounded-lg px-2.5 py-1 text-xs text-indigo-200 font-extrabold flex items-center gap-1 shadow-inner">
            <Trophy className="w-3.5 h-3.5 text-amber-400" />
            <span>승리보상 +50 XP</span>
          </div>
        </div>
      </header>

      {/* ==========================================
          SCENE 1: MODE SELECTION (HOME)
          ========================================== */}
      {gameMode === 'none' && (
        <div className="flex-1 flex flex-col items-center justify-center max-w-2xl w-full text-center relative z-10 px-4 py-8">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="space-y-8 w-full"
          >
            <div className="space-y-3">
              <div className="w-16 h-16 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-indigo-500/20">
                <Award className="w-9 h-9 text-white animate-bounce" />
              </div>
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-white">
                IB 핵심 지식 빙고 대결!
              </h1>
              <p className="text-gray-400 font-medium text-xs md:text-sm max-w-lg mx-auto leading-relaxed">
                내가 학습한 핵심 IB 어휘들로 직접 판을 설계해보세요!<br/>
                인공지능 컴퓨터와의 연습 혹은 친구들과 실시간 멀티플레이어를 선택하세요.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 max-w-xl mx-auto">
              
              {/* Single Player Card */}
              <button
                onClick={() => {
                  setGameMode('single');
                  setGameState('intro');
                }}
                className="group p-6 bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-indigo-500/50 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-52 shadow-xl hover:shadow-indigo-500/5 cursor-pointer text-white"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 group-hover:scale-110 duration-200">
                    <Bot className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-indigo-300 transition-colors">🤖 싱글 플레이어</h3>
                  <p className="text-xs text-gray-400 leading-normal">
                    전술적인 AI 컴퓨터와 대결합니다. 세 가지 난이도(하/중/상) 중 선택하여 3빙고 승리에 도전하세요!
                  </p>
                </div>
                <div className="text-[11px] font-bold text-indigo-400 flex items-center gap-1">
                  AI 연습 게임 시작 <Play className="w-3.5 h-3.5" />
                </div>
              </button>

              {/* Real-time Multiplayer Card */}
              <button
                onClick={() => {
                  setGameMode('multi');
                  setMultiGameState('lobby');
                  initializeSetupBoard();
                }}
                className="group p-6 bg-slate-900/80 hover:bg-slate-900 border border-white/10 hover:border-emerald-500/50 rounded-2xl text-left transition-all duration-300 flex flex-col justify-between h-52 shadow-xl hover:shadow-emerald-500/5 cursor-pointer text-white"
              >
                <div className="space-y-2">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-110 duration-200">
                    <Users className="w-5 h-5" />
                  </div>
                  <h3 className="text-lg font-black group-hover:text-emerald-300 transition-colors">👥 실시간 멀티플레이어</h3>
                  <p className="text-xs text-gray-400 leading-normal">
                    친구와 같은 대결방에 입장하여 실시간으로 경쟁합니다. 입장 코드 및 스마트 QR 코드로 2명 이상 참여 가능!
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                  실시간 대결방 접속 <Play className="w-3.5 h-3.5" />
                </div>
              </button>

            </div>
          </motion.div>
        </div>
      )}

      {/* ==========================================
          SCENE 2: SINGLE PLAYER AI GAME FLOW
          ========================================== */}
      {gameMode === 'single' && (
        <div className="flex-1 w-full max-w-5xl flex flex-col items-center">
          
          {/* AI Intro */}
          {gameState === 'intro' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full text-center relative z-10 px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 bg-slate-900/90 rounded-[2rem] border-2 border-indigo-500/20 shadow-2xl space-y-6 w-full"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg">
                  <Bot className="w-8 h-8 text-white" />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                    싱글 AI 탐험 빙고
                  </h2>
                  <p className="text-gray-400 font-medium text-xs md:text-sm leading-snug">
                    컴퓨터 인공지능과 실력을 겨루며 IB 개념을 복습합니다.<br/>
                    내가 설계한 빙고판과 컴퓨터의 무작위 비밀 빙고판 중 3줄을 먼저 맞추는 승자가 되어보세요!
                  </p>
                </div>

                <div className="bg-slate-950/60 p-4 rounded-xl border border-white/5 text-left text-xs leading-relaxed space-y-1.5 text-gray-300">
                  <p className="font-extrabold text-indigo-300">🎮 AI 대결 규칙</p>
                  <p>• 예시 단어를 터치하여 25칸을 모두 채워 판을 설계합니다.</p>
                  <p>• 내가 한 단어를 고르면 컴퓨터도 스마트 지능으로 한 단어를 부릅니다.</p>
                  <p>• 가로, 세로, 대각선 중 완성 3줄에 도달하면 승리하고 50 XP를 받습니다!</p>
                </div>

                <Button 
                  onClick={() => {
                    initializeSetupBoard();
                    setGameState('setup');
                  }}
                  className="w-full py-3.5 text-sm md:text-base font-black bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg border-none"
                  id="start-bingo-quiz-game-btn"
                >
                  내 빙고판 만들러 가기 <Sparkles className="w-4 h-4 inline ml-1.5" />
                </Button>
              </motion.div>
            </div>
          )}

          {/* AI Setup */}
          {gameState === 'setup' && (
            <div className="flex-1 flex flex-col w-full max-w-5xl justify-between relative z-10">
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div>
                  <h3 className="text-lg font-black text-indigo-300">나만의 IB 탐험 빙고판 만들기</h3>
                  <p className="text-xs text-gray-400 mt-1">예시 단어 리스트에서 하나씩 터치하여 25칸을 채우거나, 랜덤 채우기를 이용해 즉시 시작할 수 있습니다.</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomFill}
                    className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 rounded-xl text-xs font-black text-indigo-200 transition-all flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    🎲 랜덤 채우기
                  </button>
                  <button
                    onClick={handleClearBoard}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-xl text-xs font-black text-gray-400 transition-all flex items-center gap-1 shadow-inner cursor-pointer"
                  >
                    🔄 전체 초기화
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start justify-center flex-1">
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-indigo-500/10">
                      <span className="text-xs font-black text-gray-300">내 설계 보드 (Draft)</span>
                      <div className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 flex items-center gap-1.5">
                        채워진 칸: 
                        <span className="text-white text-xs font-black">{filledCount} / 25</span>
                      </div>
                    </div>

                    <div className="w-full bg-slate-950 rounded-full h-2 mb-4 overflow-hidden border border-white/5">
                      <div 
                        className="bg-indigo-500 h-full transition-all duration-300"
                        style={{ width: `${(filledCount / 25) * 100}%` }}
                      />
                    </div>

                    <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                      {playerBoard.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemoveWordFromBoard(idx)}
                          className={cn(
                            "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all uppercase select-none overflow-hidden outline-none break-all text-white",
                            cell.value !== ''
                              ? "bg-indigo-950/80 border-indigo-500 text-indigo-200 hover:border-rose-500 hover:text-rose-300 font-extrabold focus:outline-none animate-fade-in"
                              : "bg-slate-950 border-white/5 border-dashed text-gray-500 hover:bg-slate-900/50"
                          )}
                        >
                          {cell.value ? (
                            <span className="text-[9px] md:text-[10px] font-black leading-tight tracking-tight whitespace-pre-wrap">
                              {cell.value}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-700">+</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Card>

                  <div className="w-full bg-slate-900/50 p-2.5 rounded-2xl border border-indigo-500/10 text-center">
                    <span className="text-[10px] font-black text-amber-300 block mb-1.5">🔥 AI 컴퓨터 지능 난이도 선택</span>
                    <div className="grid grid-cols-3 gap-1.5 bg-slate-950/80 p-1.5 rounded-xl border border-white/5">
                      <button
                        type="button"
                        onClick={() => setDifficulty('easy')}
                        className={cn(
                          "py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer",
                          difficulty === 'easy'
                            ? "bg-emerald-500 text-white shadow-md font-extrabold"
                            : "text-emerald-400 hover:bg-slate-900/50"
                        )}
                      >
                        하 (초보)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('normal')}
                        className={cn(
                          "py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer",
                          difficulty === 'normal'
                            ? "bg-indigo-600 text-white shadow-md font-extrabold"
                            : "text-indigo-400 hover:bg-slate-900/50"
                        )}
                      >
                        중 (보통)
                      </button>
                      <button
                        type="button"
                        onClick={() => setDifficulty('hard')}
                        className={cn(
                          "py-2 rounded-lg text-[10px] font-black transition-all cursor-pointer",
                          difficulty === 'hard'
                            ? "bg-rose-600 text-white shadow-md font-extrabold"
                            : "text-rose-400 hover:bg-slate-900/50"
                        )}
                      >
                        상 (프로)
                      </button>
                    </div>
                  </div>

                  {filledCount === 25 ? (
                    <motion.button
                      initial={{ scale: 0.98 }}
                      animate={{ scale: [0.98, 1.02, 0.98] }}
                      transition={{ repeat: Infinity, duration: 2 }}
                      onClick={handleStartMatch}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-2 border-none cursor-pointer"
                    >
                      <Bot className="w-5 h-5" />
                      AI 컴퓨터와 대결 시작하기! ⚡ 
                    </motion.button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-slate-900 border border-white/5 text-gray-500 font-black text-sm md:text-base rounded-2xl cursor-not-allowed text-center"
                    >
                      단어 {25 - filledCount}칸을 더 채우면 활성화됩니다 🧩
                    </button>
                  )}
                </div>

                <div className="lg:col-span-7 flex flex-col gap-4">
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20 max-h-[64vh] overflow-y-auto custom-scrollbar space-y-5">
                    <div className="pb-2 border-b border-white/10 flex items-center justify-between">
                      <span className="text-xs font-black text-indigo-300 tracking-wider">📋 단어 수집기 (카테고리별 예시)</span>
                      <span className="text-[10px] text-gray-400">터치하여 빈 칸에 쏙 넣으세요!</span>
                    </div>

                    <div className="space-y-4">
                      {BINGO_CATEGORIES.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-2">
                          <h4 className="text-[11px] font-extrabold text-slate-300 border-l-2 border-indigo-500 pl-1.5">
                            {cat.title}
                          </h4>
                          <div className="flex flex-wrap gap-1.5">
                            {cat.words.map((word, wIdx) => {
                              const isUsed = playerBoard.some(c => c.value === word);
                              return (
                                <button
                                  key={wIdx}
                                  onClick={() => handleSelectWordFromPool(word)}
                                  disabled={isUsed || filledCount >= 25}
                                  className={cn(
                                    "text-[10px] md:text-xs px-2.5 py-1.5 rounded-xl border font-bold transition-all flex items-center gap-1 hover:scale-105 active:scale-95 cursor-pointer select-none outline-none text-white",
                                    isUsed
                                      ? "bg-indigo-900/40 border-indigo-500/20 text-indigo-400/40 opacity-40 cursor-not-allowed"
                                      : "bg-slate-950 border-white/5 text-slate-300 hover:border-indigo-500/60"
                                  )}
                                >
                                  {word}
                                  {isUsed && <span className="text-[9px] text-emerald-400 ml-1">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {/* AI Playing */}
          {gameState === 'playing' && (
            <div className="flex-1 flex flex-col w-full max-w-5xl justify-between relative z-10 font-sans">
              
              <div className="bg-slate-950 border border-white/10 rounded-2xl p-2.5 mb-3 flex items-center justify-between shadow-lg gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2 h-2 rounded-full",
                    turn === 'player' ? "bg-emerald-500 animate-ping" : "bg-amber-400"
                  )} />
                  <p className="text-[11px] md:text-xs font-extrabold text-slate-200">
                    {statusMessage}
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-white/5 py-1 px-2.5 rounded-lg text-gray-400">
                    <span className="font-extrabold text-[10px] text-indigo-400 uppercase">모드</span>
                    <span className="text-[10px] font-black text-white">IB 핵심 지식 AI 매칭</span>
                  </div>
                  <button 
                    onClick={() => {
                      setGameState('setup');
                      initializeSetupBoard();
                    }}
                    disabled={shuffling}
                    className="p-1 px-2 text-[10px] font-black hover:bg-slate-800 disabled:opacity-50 text-indigo-400 hover:text-indigo-300 rounded border border-indigo-500/20 flex items-center gap-1 transition-colors cursor-pointer"
                    id="bingo-board-reshuffle"
                  >
                    <RefreshCw className={cn("w-3 h-3", shuffling && "animate-spin")} />
                    재설계하기
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-stretch justify-center flex-1 min-h-[45vh]">
                
                {/* Student Board */}
                <Card className="p-3 md:p-4 bg-slate-900/60 border-indigo-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-500/10">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-black">내 탐험 보드 (Player)</span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400">
                        완성 빙고: <span className="text-white text-xs ml-1">{playerBingos} / {BINGO_TARGET}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                        {playerBoard.map((cell, idx) => {
                          const r = Math.floor(idx / 5);
                          const c = idx % 5;
                          
                          const isWinningCell = calculateCompletedLines(playerBoard).some(lineIdx => {
                            if (lineIdx < 5) return lineIdx === r;
                            if (lineIdx < 10) return (lineIdx - 5) === c;
                            if (lineIdx === 10) return r === c;
                            if (lineIdx === 11) return r + c === 4;
                            return false;
                          });

                          return (
                            <button
                              key={idx}
                              id={`p-cell-${idx}`}
                              onClick={() => handlePlayerCellClick(cell.value)}
                              disabled={cell.marked || turn !== 'player' || winner !== null}
                              className={cn(
                                "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-all uppercase select-none outline-none overflow-hidden text-white",
                                cell.marked 
                                  ? isWinningCell
                                    ? "bg-amber-500 border-amber-300 text-slate-900 font-extrabold shadow-md scale-95 duration-200"
                                    : "bg-indigo-600 border-indigo-400 text-white font-extrabold shadow-inner scale-95"
                                  : "bg-slate-950 border-white/5 text-gray-300 hover:bg-slate-800 hover:border-indigo-500/50"
                              )}
                            >
                              {lastSelectedValue === cell.value && cell.marked && (
                                <span className="absolute inset-0 bg-white/25 animate-ping rounded-xl pointer-events-none" />
                              )}
                              <span className="font-black tracking-tight break-all leading-tight text-center text-[9px] md:text-[10px] whitespace-pre-wrap">
                                {cell.value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[10px] text-gray-400">
                    <span>🎯 {BINGO_TARGET}개 한 줄 빙고 채우기</span>
                    <span>나머지 칠 칸: {25 - markedValues.size} 칸</span>
                  </div>
                </Card>

                {/* AI Board */}
                <Card className="p-3 md:p-4 bg-slate-900/60 border-purple-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-purple-500/10">
                      <div className="flex items-center gap-1.5 text-purple-400">
                        <Bot className="w-4 h-4" />
                        <span className="text-xs font-black flex items-center gap-1">
                          AI 컴퓨터의 보드
                          <span className={cn(
                            "text-[9px] px-1.5 py-0.5 rounded font-black border uppercase ml-1",
                            difficulty === 'easy' && "bg-emerald-500/15 text-emerald-400 border-emerald-500/30",
                            difficulty === 'normal' && "bg-indigo-500/15 text-indigo-400 border-indigo-500/30",
                            difficulty === 'hard' && "bg-rose-500/15 text-rose-400 border-rose-500/30"
                          )}>
                            {difficulty === 'easy' ? '하' : difficulty === 'normal' ? '중' : '상'}
                          </span>
                        </span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full bg-purple-500/10 border border-purple-500/20 text-[10px] font-black text-purple-400">
                        완성 빙고: <span className="text-white text-xs ml-1">{computerBingos} / {BINGO_TARGET}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                        {computerBoard.map((cell, idx) => {
                          const r = Math.floor(idx / 5);
                          const c = idx % 5;
                          
                          const isWinningCell = calculateCompletedLines(computerBoard).some(lineIdx => {
                            if (lineIdx < 5) return lineIdx === r;
                            if (lineIdx < 10) return (lineIdx - 5) === c;
                            if (lineIdx === 10) return r === c;
                            if (lineIdx === 11) return r + c === 4;
                            return false;
                          });

                          return (
                            <div
                              key={idx}
                              id={`c-cell-${idx}`}
                              className={cn(
                                "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center p-1 transition-all select-none overflow-hidden text-center",
                                cell.marked 
                                  ? isWinningCell
                                    ? "bg-amber-500 border-amber-300 text-slate-900 font-extrabold shadow-md scale-95 duration-200"
                                    : "bg-purple-900 border-purple-400 text-white font-extrabold shadow-inner scale-95"
                                  : "bg-slate-950 border-white/5 text-gray-550 bg-gradient-to-tr from-slate-950 to-indigo-950/20"
                              )}
                            >
                              {cell.marked ? (
                                <span className="font-extrabold text-[9px] md:text-[10px] leading-tight text-white tracking-tight break-all whitespace-pre-wrap">
                                  {cell.value}
                                </span>
                              ) : (
                                <div className="flex flex-col items-center justify-center text-indigo-500/40">
                                  <Bot className="w-4 h-4 animate-pulse" />
                                  <span className="text-[9px] text-indigo-500/40 font-bold tracking-widest mt-1">?</span>
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[10px] text-gray-400">
                    <span>🤖 가상 지능 강화 모듈 가동 중</span>
                    <span>마지막 터치된 단어: <span className="text-amber-300 font-black">{lastSelectedValue || '-'}</span></span>
                  </div>
                </Card>

              </div>
            </div>
          )}

          {/* AI Ended Popup */}
          {gameState === 'ended' && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 max-w-sm w-full bg-slate-900 border-2 border-indigo-500/30 rounded-[2rem] text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>

                <div>
                  <h3 className={cn(
                    "text-2xl font-black",
                    winner === 'player' ? "text-emerald-400" : "text-rose-400"
                  )}>
                    {winner === 'player' ? "빙고 대승리! 🎉" : "컴퓨터의 빙고 달성! 🤖"}
                  </h3>
                  <p className="text-gray-400 font-bold text-xs mt-1.5 leading-relaxed">
                    {winner === 'player' 
                      ? "훌륭한 지식 전략가로 임무를 완료했습니다! 축하금 50 XP가 탐험 기록에 추가되었어요."
                      : "컴퓨터가 먼저 3 빙고라인을 완성했어요. 다시 단어를 조합하여 도전장 보낼까요?"}
                  </p>
                </div>

                <div className="bg-slate-950/80 p-3 rounded-xl border border-white/5 space-y-1.5 text-xs">
                  <div className="flex justify-between text-gray-400">
                    <span>내 최종 완성선</span>
                    <span className="text-white font-extrabold">{playerBingos} 줄</span>
                  </div>
                  <div className="flex justify-between text-gray-400">
                    <span>컴퓨터 완성선</span>
                    <span className="text-white font-extrabold">{computerBingos} 줄</span>
                  </div>
                  {winner === 'player' && (
                    <div className="border-t border-white/5 pt-1.5 flex justify-between font-black text-indigo-400 text-[11px]">
                      <span>보상 획득</span>
                      <span className="text-emerald-400">+50 XP</span>
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5">
                  <Button 
                    onClick={() => {
                      initializeSetupBoard();
                      setGameState('setup');
                    }}
                    className="w-1/2 py-3 bg-slate-950 border border-white/10 hover:bg-slate-900 text-gray-300 font-extrabold rounded-xl text-xs cursor-pointer"
                    id="retry-bingo-quiz-game-btn"
                  >
                    다시 설계하기
                  </Button>
                  <Button 
                    onClick={() => {
                      setGameMode('none');
                    }}
                    className="w-1/2 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-black rounded-xl text-xs cursor-pointer"
                    id="back-home-bingo-btn"
                  >
                    모드 선택 메뉴
                  </Button>
                </div>
              </motion.div>
            </div>
          )}

        </div>
      )}


      {/* ==========================================
          SCENE 3: REAL-TIME MULTIPLAYER GAME FLOW
          ========================================== */}
      {gameMode === 'multi' && (
        <div className="flex-1 w-full max-w-5xl flex flex-col items-center relative z-10">

          {/* Error Message Panel */}
          {errorMessage && (
            <div className="w-full max-w-md bg-rose-950/80 border border-rose-500/30 rounded-xl p-3 mb-4 text-xs flex justify-between items-center text-rose-200">
              <span>⚠️ {errorMessage}</span>
              <button 
                onClick={() => setErrorMessage(null)}
                className="text-rose-400 hover:text-white font-bold ml-2 cursor-pointer"
              >
                닫기
              </button>
            </div>
          )}

          {/* MULTI: Lobby Entry / Join Selection */}
          {multiGameState === 'lobby' && (
            <div className="flex-1 flex flex-col items-center justify-center max-w-md w-full px-4">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-6 bg-slate-900/90 rounded-[2rem] border-2 border-emerald-500/20 shadow-2xl space-y-6 w-full text-center"
              >
                <div className="w-14 h-14 bg-gradient-to-tr from-emerald-500 to-teal-500 rounded-2xl flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/25">
                  <Users className="w-8 h-8 text-white animate-pulse" />
                </div>

                <div>
                  <h2 className="text-2xl font-black tracking-tight text-white mb-2">
                    실시간 지식 대결방
                  </h2>
                  <p className="text-gray-400 font-medium text-xs md:text-sm">
                    방을 직접 생성하여 코드를 알려주거나,<br/>
                    친구가 만들어둔 대결방 코드를 입력하여 바로 입장하세요!
                  </p>
                </div>

                <div className="space-y-3.5 pt-2">
                  <button
                    onClick={handleCreateRoom}
                    disabled={isLobbyLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 border-none cursor-pointer"
                  >
                    {isLobbyLoading ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Sparkles className="w-4 h-4" />
                    )}
                    새로운 대결방 만들기 (Host)
                  </button>

                  <div className="flex items-center gap-2 py-1 text-slate-500 text-xs font-black">
                    <div className="flex-1 border-t border-white/5" />
                    <span>또는</span>
                    <div className="flex-1 border-t border-white/5" />
                  </div>

                  <div className="space-y-2 text-left">
                    <label className="text-[11px] font-extrabold text-slate-400 ml-1">
                      참여할 4자리 대결방 코드
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        maxLength={4}
                        placeholder="예: 4291"
                        value={joinCodeInput}
                        onChange={(e) => setJoinCodeInput(e.target.value.replace(/\D/g, ''))}
                        className="flex-1 px-4 py-3 bg-slate-950 border border-white/10 rounded-xl text-center font-mono font-black text-lg focus:border-emerald-500/50 outline-none text-white tracking-[0.25em]"
                      />
                      <button
                        onClick={() => handleJoinRoom()}
                        disabled={isLobbyLoading || joinCodeInput.length !== 4}
                        className="px-6 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-emerald-400 disabled:text-gray-500 border border-emerald-500/30 disabled:border-white/5 rounded-xl text-xs font-black transition-all cursor-pointer"
                      >
                        참여
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          )}

          {/* MULTI: Room Waiting (Lobby Waiting Room) */}
          {multiGameState === 'room-waiting' && roomData && (
            <div className="flex-1 flex flex-col md:flex-row gap-5 items-stretch w-full">
              
              {/* Left Side: Room details & QR Code */}
              <div className="flex-1 flex flex-col gap-4">
                <Card className="p-6 bg-slate-900/80 border-emerald-500/20 flex flex-col items-center justify-center text-center space-y-5">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400">대결 대기실</span>
                    <h3 className="text-xl font-black">대결 입장 코드를 친구에게 공유하세요!</h3>
                  </div>

                  {/* Giant Room Code Display */}
                  <div className="flex items-center gap-3 bg-slate-950 border border-white/10 p-4 rounded-2xl w-full max-w-xs justify-center shadow-inner relative group">
                    <span className="font-mono text-3xl font-black tracking-widest text-emerald-400 pl-2">
                      {currentRoomId}
                    </span>
                    <button
                      onClick={handleCopyCode}
                      className="p-1.5 bg-white/5 hover:bg-white/10 rounded-lg text-gray-400 hover:text-white transition-all cursor-pointer"
                      title="코드 복사"
                    >
                      {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>

                  {/* Smart QR Invitation Code */}
                  <div className="bg-white p-3 rounded-2xl shadow-xl w-44 h-44 flex items-center justify-center border-4 border-emerald-500/20 animate-fade-in">
                    <img 
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=160x160&data=${encodeURIComponent(qrJoinUrl)}`} 
                      alt="QR Code" 
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] text-slate-400 max-w-xs leading-relaxed">
                    📱 친구가 카메라 앱으로 QR 코드를 촬영하면<br/>
                    자동으로 이 빙고 대결 대기실에 즉시 입장할 수 있습니다!
                  </p>
                </Card>
              </div>

              {/* Right Side: Participant Lobby List */}
              <div className="w-full md:w-96 flex flex-col gap-4">
                <Card className="p-5 bg-slate-900/80 border-indigo-500/20 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex justify-between items-center pb-2 border-b border-white/10">
                      <span className="text-xs font-black text-indigo-300">참여자 목록</span>
                      <span className="text-[10px] font-bold text-gray-400">
                        {Object.keys(roomData.players || {}).length}명 입장 중
                      </span>
                    </div>

                    <div className="space-y-2">
                      {Object.values(roomData.players || {}).map((p: any) => {
                        const isHost = p.uid === roomData.hostId;
                        return (
                          <div 
                            key={p.uid} 
                            className="flex items-center justify-between p-3 bg-slate-950 border border-white/5 rounded-xl"
                          >
                            <div className="flex items-center gap-2.5">
                              <div className={cn(
                                "w-2 h-2 rounded-full",
                                isHost ? "bg-amber-400 animate-pulse" : "bg-emerald-400"
                              )} />
                              <div>
                                <span className="text-xs font-black text-white">{p.name}</span>
                                <span className="text-[9px] text-gray-500 ml-1.5">{p.grade} {p.class}</span>
                              </div>
                            </div>
                            <span className={cn(
                              "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                              isHost 
                                ? "bg-amber-400/10 border-amber-400/30 text-amber-400"
                                : "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                            )}>
                              {isHost ? '방장' : '방원'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Actions based on host vs guest */}
                  <div className="pt-5 border-t border-white/5">
                    {roomData.hostId === profile?.uid ? (
                      Object.keys(roomData.players || {}).length >= 2 ? (
                        <button
                          onClick={handleStartSetupPhase}
                          className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs rounded-xl shadow-lg shadow-emerald-500/10 flex items-center justify-center gap-1 cursor-pointer"
                        >
                          대결 보드 설계 시작하기! 🚀
                        </button>
                      ) : (
                        <button
                          disabled
                          className="w-full py-3 bg-slate-950 border border-white/5 text-gray-500 font-extrabold text-xs rounded-xl cursor-not-allowed text-center"
                        >
                          대결하려면 친구가 1명 이상 입장해야 합니다 ⏳
                        </button>
                      )
                    ) : (
                      <div className="w-full py-3 bg-slate-950 border border-white/5 text-slate-400 text-center text-xs font-extrabold rounded-xl flex items-center justify-center gap-2">
                        <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                        방장이 보드 설계를 누를 때까지 대기 중...
                      </div>
                    )}
                  </div>
                </Card>
              </div>

            </div>
          )}

          {/* MULTI: Setup Boards Phase */}
          {multiGameState === 'setup' && roomData && (
            <div className="flex-1 flex flex-col w-full max-w-5xl justify-between">
              
              {/* Setup Board Info banner */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-4 mb-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-lg">
                <div>
                  <h3 className="text-lg font-black text-indigo-300">나만의 실시간 탐험 빙고판 설계</h3>
                  <p className="text-xs text-gray-400 mt-1">
                    단어를 터치해 25칸을 채우거나, 랜덤 채우기를 한 후 <strong>준비 완료</strong>를 눌러주세요.
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={handleRandomFill}
                    className="px-3.5 py-1.5 bg-indigo-950/80 hover:bg-indigo-900 border border-indigo-500/30 rounded-xl text-xs font-black text-indigo-200 transition-all flex items-center gap-1 shadow-md cursor-pointer"
                  >
                    🎲 랜덤 채우기
                  </button>
                  <button
                    onClick={handleClearBoard}
                    className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-900 border border-white/10 rounded-xl text-xs font-black text-gray-400 transition-all flex items-center gap-1 shadow-inner cursor-pointer"
                  >
                    🔄 전체 초기화
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start justify-center flex-1">
                
                {/* Board Column */}
                <div className="lg:col-span-5 flex flex-col gap-3">
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
                    <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-indigo-500/10">
                      <span className="text-xs font-black text-gray-300">내 실시간 설계 (Draft)</span>
                      <div className="px-3 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-[10px] font-black text-indigo-400 flex items-center gap-1.5">
                        채워진 칸: 
                        <span className="text-white text-xs font-black">{filledCount} / 25</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                      {playerBoard.map((cell, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleRemoveWordFromBoard(idx)}
                          className={cn(
                            "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center p-1 text-center cursor-pointer transition-all uppercase select-none overflow-hidden outline-none break-all text-white",
                            cell.value !== ''
                              ? "bg-indigo-950/80 border-indigo-500 text-indigo-200 hover:border-rose-500 hover:text-rose-300 font-extrabold"
                              : "bg-slate-950 border-white/5 border-dashed text-gray-500 hover:bg-slate-900/50"
                          )}
                        >
                          {cell.value ? (
                            <span className="text-[9px] md:text-[10px] font-black leading-tight tracking-tight whitespace-pre-wrap">
                              {cell.value}
                            </span>
                          ) : (
                            <span className="text-xs font-bold text-gray-700">+</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </Card>

                  {/* Ready Action trigger */}
                  {roomData.players?.[profile?.uid || '']?.status === 'ready' ? (
                    <div className="w-full py-4 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 font-black text-sm rounded-2xl flex items-center justify-center gap-2">
                      <CheckCircle className="w-5 h-5" />
                      준비 완료했습니다. 친구들의 설계를 기다리는 중...
                    </div>
                  ) : filledCount === 25 ? (
                    <button
                      onClick={handleMultiplayerReady}
                      className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-black text-sm md:text-base rounded-2xl shadow-xl shadow-emerald-500/15 flex items-center justify-center gap-1 cursor-pointer"
                    >
                      설계 끝! 대결 준비 완료! ✅
                    </button>
                  ) : (
                    <button
                      disabled
                      className="w-full py-4 bg-slate-900 border border-white/5 text-gray-500 font-black text-sm md:text-base rounded-2xl cursor-not-allowed text-center"
                    >
                      단어 {25 - filledCount}칸을 더 채우면 준비 완료할 수 있습니다
                    </button>
                  )}
                </div>

                {/* Categories & Player Status Sidebar */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {/* Participant board design status */}
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
                    <h4 className="text-xs font-black text-indigo-300 mb-3 border-b border-indigo-500/10 pb-2">
                      친구들의 설계 진행 현황
                    </h4>
                    <div className="grid grid-cols-2 gap-2">
                      {Object.values(roomData.players || {}).map((p: any) => {
                        const isReady = p.status === 'ready';
                        return (
                          <div 
                            key={p.uid}
                            className="flex items-center justify-between p-2.5 bg-slate-950 border border-white/5 rounded-xl"
                          >
                            <span className="text-xs font-black text-white">{p.name}</span>
                            <span className={cn(
                              "text-[9px] font-black px-1.5 py-0.5 rounded border uppercase",
                              isReady
                                ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
                                : "bg-amber-500/15 border-amber-500/30 text-amber-400"
                            )}>
                              {isReady ? '준비 완료' : '설계 중...'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* Pool of Words */}
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20 max-h-[40vh] overflow-y-auto custom-scrollbar space-y-4">
                    <div className="pb-1.5 border-b border-white/10 flex items-center justify-between">
                      <span className="text-[11px] font-black text-indigo-300 tracking-wider">📋 단어 리스트</span>
                      <span className="text-[9px] text-gray-400">터치하여 내 설계보드로 추가합니다.</span>
                    </div>

                    <div className="space-y-3">
                      {BINGO_CATEGORIES.map((cat, catIdx) => (
                        <div key={catIdx} className="space-y-1.5">
                          <h4 className="text-[10px] font-extrabold text-slate-400 border-l border-indigo-500 pl-1.5">
                            {cat.title}
                          </h4>
                          <div className="flex flex-wrap gap-1">
                            {cat.words.map((word, wIdx) => {
                              const isUsed = playerBoard.some(c => c.value === word);
                              return (
                                <button
                                  key={wIdx}
                                  onClick={() => handleSelectWordFromPool(word)}
                                  disabled={isUsed || filledCount >= 25 || roomData.players?.[profile?.uid || '']?.status === 'ready'}
                                  className={cn(
                                    "text-[9px] md:text-xs px-2 py-1 rounded-lg border font-bold transition-all flex items-center gap-1 hover:scale-105 cursor-pointer text-white",
                                    isUsed
                                      ? "bg-indigo-900/40 border-indigo-500/20 text-indigo-400/40 opacity-40 cursor-not-allowed"
                                      : "bg-slate-950 border-white/5 text-slate-300 hover:border-indigo-500/60"
                                  )}
                                >
                                  {word}
                                  {isUsed && <span className="text-[8px] text-emerald-400 ml-0.5">✓</span>}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>

              </div>

            </div>
          )}

          {/* MULTI: Active Sync Gameplay Phase */}
          {multiGameState === 'playing' && roomData && (
            <div className="flex-1 flex flex-col w-full max-w-5xl justify-between">
              
              {/* Gameplay Turn Status Header */}
              <div className="bg-slate-950 border border-white/10 rounded-2xl p-2.5 mb-3 flex items-center justify-between shadow-lg gap-2">
                <div className="flex items-center gap-2">
                  <span className={cn(
                    "w-2.5 h-2.5 rounded-full animate-pulse",
                    roomData.currentTurn === profile?.uid ? "bg-emerald-500 animate-ping" : "bg-amber-400"
                  )} />
                  <p className="text-[11px] md:text-xs font-extrabold text-slate-200">
                    {roomData.currentTurn === profile?.uid ? (
                      <span className="text-emerald-400 font-black">내 차례입니다! 뒤집을 단어를 판에서 터치하세요! 🍀</span>
                    ) : (
                      <span>
                        <strong className="text-amber-300">{(roomData.players?.[roomData.currentTurn]?.name) || '상대방'}</strong>님의 차례입니다. 신중하게 듣고 채우세요!
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="flex items-center gap-1.5 text-xs bg-slate-900 border border-white/5 py-1 px-2.5 rounded-lg text-gray-450">
                    <span className="font-extrabold text-[10px] text-indigo-400 uppercase">방 코드</span>
                    <span className="text-[10px] font-black text-white">{currentRoomId}</span>
                  </div>
                </div>
              </div>

              {/* Board and Side Leaderboard */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch justify-center flex-1 min-h-[45vh]">
                
                {/* Player Active Bingo Grid (Left) */}
                <Card className="md:col-span-8 p-3 md:p-4 bg-slate-900/60 border-indigo-500/20 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between pb-2 mb-2.5 border-b border-indigo-500/10">
                      <div className="flex items-center gap-1.5 text-emerald-400">
                        <User className="w-4 h-4" />
                        <span className="text-xs font-black">내 실시간 대결 보드 (Player)</span>
                      </div>
                      <div className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black text-emerald-400 animate-pulse">
                        완성 빙고: <span className="text-white text-xs ml-1">{multiBingoLines} / {BINGO_TARGET}</span>
                      </div>
                    </div>

                    <div className="relative">
                      <div className="grid grid-cols-5 gap-1 md:gap-1.5 aspect-square">
                        {playerBoard.map((cell, idx) => {
                          const r = Math.floor(idx / 5);
                          const c = idx % 5;
                          
                          const isWinningCell = calculateCompletedLines(playerBoard).some(lineIdx => {
                            if (lineIdx < 5) return lineIdx === r;
                            if (lineIdx < 10) return (lineIdx - 5) === c;
                            if (lineIdx === 10) return r === c;
                            if (lineIdx === 11) return r + c === 4;
                            return false;
                          });

                          return (
                            <button
                              key={idx}
                              id={`p-cell-${idx}`}
                              onClick={() => handleMultiplayerCellClick(cell.value)}
                              disabled={cell.marked || roomData.currentTurn !== profile?.uid || roomData.status === 'ended'}
                              className={cn(
                                "relative aspect-square w-full rounded-lg md:rounded-xl border flex flex-col items-center justify-center text-center p-1 cursor-pointer transition-all uppercase select-none outline-none overflow-hidden text-white",
                                cell.marked 
                                  ? isWinningCell
                                    ? "bg-amber-500 border-amber-300 text-slate-900 font-extrabold shadow-md scale-95 duration-200"
                                    : "bg-emerald-600 border-emerald-400 text-white font-extrabold shadow-inner scale-95"
                                  : roomData.currentTurn === profile?.uid
                                    ? "bg-slate-950 border-emerald-500/30 hover:bg-slate-800 hover:border-emerald-500"
                                    : "bg-slate-950 border-white/5 text-gray-400 cursor-not-allowed opacity-80"
                              )}
                            >
                              {lastSelectedValue === cell.value && cell.marked && (
                                <span className="absolute inset-0 bg-white/25 animate-ping rounded-xl pointer-events-none" />
                              )}
                              <span className="font-black tracking-tight break-all leading-tight text-center text-[9px] md:text-[10px] whitespace-pre-wrap">
                                {cell.value}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 bg-slate-950/40 p-2 rounded-xl border border-white/5 flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">마지막 선택된 단어: <strong className="text-amber-400 ml-1">{lastSelectedValue || '-'}</strong></span>
                    {multiBingoLines >= BINGO_TARGET ? (
                      <motion.button
                        initial={{ scale: 0.95 }}
                        animate={{ scale: [0.95, 1.05, 0.95] }}
                        transition={{ repeat: Infinity, duration: 1.2 }}
                        onClick={handleMultiplayerBingoClaim}
                        className="py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black rounded-lg cursor-pointer flex items-center gap-1 shadow-lg shadow-amber-500/20 text-[10px]"
                      >
                        🎉 빙고 외치기! (클릭)
                      </motion.button>
                    ) : (
                      <span className="text-slate-500">3줄 완성하면 빙고버튼 활성화!</span>
                    )}
                  </div>
                </Card>

                {/* Scoreboard and Called words list (Right) */}
                <div className="md:col-span-4 flex flex-col gap-3">
                  
                  {/* Real-Time Live Scoreboard */}
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20">
                    <h4 className="text-xs font-black text-indigo-300 mb-2 border-b border-indigo-500/10 pb-2">
                      실시간 대결 전광판
                    </h4>
                    <div className="space-y-2 max-h-[22vh] overflow-y-auto custom-scrollbar">
                      {Object.values(roomData.players || {}).map((p: any) => {
                        const isHisTurn = roomData.currentTurn === p.uid;
                        return (
                          <div 
                            key={p.uid}
                            className={cn(
                              "flex items-center justify-between p-2.5 rounded-xl border transition-all",
                              isHisTurn 
                                ? "bg-indigo-950/40 border-indigo-500/40 shadow-inner" 
                                : "bg-slate-950 border-white/5"
                            )}
                          >
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "w-2 h-2 rounded-full",
                                isHisTurn ? "bg-indigo-400 animate-ping" : "bg-slate-500"
                              )} />
                              <div>
                                <div className="text-xs font-black text-white flex items-center gap-1.5">
                                  {p.name}
                                  {isHisTurn && <span className="text-[8px] px-1 py-0.2 bg-indigo-600 text-indigo-200 rounded">Turn</span>}
                                </div>
                                <span className="text-[9px] text-gray-500">{p.grade} {p.class}</span>
                              </div>
                            </div>
                            <div className="text-xs font-black text-emerald-400">
                              {p.bingoCount || 0} / {BINGO_TARGET} 줄
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </Card>

                  {/* History of called words */}
                  <Card className="p-4 bg-slate-900/60 border-indigo-500/20 flex-1 flex flex-col justify-between max-h-[28vh]">
                    <div>
                      <h4 className="text-xs font-black text-indigo-300 mb-2 border-b border-indigo-500/10 pb-2 flex justify-between">
                        <span>뒤집힌 어휘 로그</span>
                        <span className="text-[9px] text-gray-500">총 {roomData.calledWords?.length || 0}개</span>
                      </h4>
                      <div className="flex flex-wrap gap-1 max-h-[14vh] overflow-y-auto custom-scrollbar">
                        {roomData.calledWords && roomData.calledWords.length > 0 ? (
                          roomData.calledWords.map((word: string, idx: number) => (
                            <span 
                              key={idx}
                              className="text-[9px] px-2 py-1 bg-slate-950 border border-white/5 rounded text-indigo-300 font-bold"
                            >
                              {word}
                            </span>
                          ))
                        ) : (
                          <span className="text-[10px] text-gray-500 italic p-1">아직 뒤집힌 단어가 없습니다.</span>
                        )}
                      </div>
                    </div>

                    <button
                      onClick={handleLeaveRoom}
                      className="w-full mt-3 py-2 bg-slate-950 border border-rose-500/20 hover:border-rose-500 hover:text-rose-400 text-slate-500 text-[10px] font-black rounded-lg transition-all flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      대결 포기하고 방 나가기
                    </button>
                  </Card>

                </div>

              </div>
            </div>
          )}

          {/* MULTI: Game ended view */}
          {multiGameState === 'ended' && roomData && (
            <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 z-50 font-sans">
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="p-8 max-w-sm w-full bg-slate-900 border-2 border-emerald-500/30 rounded-[2rem] text-center space-y-6"
              >
                <div className="mx-auto w-16 h-16 bg-amber-500/10 border border-amber-500/20 rounded-full flex items-center justify-center">
                  <Trophy className="w-8 h-8 text-amber-400 animate-bounce" />
                </div>

                <div>
                  <h3 className="text-2xl font-black text-amber-400">
                    대결 종료! 🎉
                  </h3>
                  <p className="text-emerald-400 font-black text-sm mt-1.5">
                    👑 우승자: {roomData.winnerName || '익명'}
                  </p>
                  <p className="text-gray-400 font-bold text-xs mt-1 leading-relaxed">
                    {roomData.winnerId === profile?.uid 
                      ? "빛나는 최고의 IB 탐험가가 되었습니다! 승리보상 50 XP가 누적됩니다!"
                      : "친구의 승리를 축하해주세요! 함께 학습하며 더욱 똑똑해진 지식을 체험했습니다."}
                  </p>
                </div>

                {/* Scorecard table of all players */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-white/5 text-xs text-left space-y-2">
                  <span className="font-black text-indigo-300 block border-b border-white/5 pb-1 text-[11px]">
                    최종 대결 성적표
                  </span>
                  <div className="space-y-1.5 max-h-[15vh] overflow-y-auto custom-scrollbar">
                    {Object.values(roomData.players || {}).map((p: any) => (
                      <div key={p.uid} className="flex justify-between text-gray-300">
                        <span>{p.name} {p.uid === roomData.winnerId && '👑'}</span>
                        <span className="text-white font-extrabold">{p.bingoCount || 0} 줄</span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button 
                  onClick={handleLeaveRoom}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black rounded-xl text-xs cursor-pointer"
                  id="multiplayer-leave-back-home"
                >
                  대결방 퇴장하여 메뉴로 가기 <ArrowLeft className="w-3.5 h-3.5 inline ml-1" />
                </Button>
              </motion.div>
            </div>
          )}

        </div>
      )}

    </div>
  );
};
