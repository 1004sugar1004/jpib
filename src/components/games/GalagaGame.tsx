import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'motion/react';
import { MiniQuiz } from './MiniQuiz';
import { ASSETS } from '../../assets';
import { Button } from '../ui/Button';
import { ArrowLeft, ChevronRight } from 'lucide-react';

export const GalagaGame = ({ soundEnabled }: { soundEnabled: boolean }) => {
  const [shipPos, setShipPos] = useState(50);
  const [enemies, setEnemies] = useState<{ id: number; x: number; y: number }[]>([]);
  const [bullets, setBullets] = useState<{ id: number; x: number; y: number }[]>([]);
  const [score, setScore] = useState(0);
  const [shotsLeft, setShotsLeft] = useState(10);
  const [showQuiz, setShowQuiz] = useState(false);

  const requestRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);

  // refs로 최신 상태를 항상 참조할 수 있도록
  const shipPosRef = useRef(shipPos);
  const shotsLeftRef = useRef(shotsLeft);
  const showQuizRef = useRef(showQuiz);

  useEffect(() => { shipPosRef.current = shipPos; }, [shipPos]);
  useEffect(() => { shotsLeftRef.current = shotsLeft; }, [shotsLeft]);
  useEffect(() => { showQuizRef.current = showQuiz; }, [showQuiz]);

  // 게임 루프
  useEffect(() => {
    const animate = (time: number) => {
      if (lastTimeRef.current === null) {
        lastTimeRef.current = time;
      }
      const deltaTime = time - lastTimeRef.current;

      if (deltaTime > 50) {
        // 적 이동
        setEnemies(prev => {
          const next = prev
            .map(e => ({ ...e, y: e.y + 3, x: e.x + Math.sin(e.y / 10) * 2 }))
            .filter(e => e.y < 100);
          if (Math.random() > 0.92) {
            next.push({ id: Date.now(), x: Math.random() * 80 + 10, y: 0 });
          }
          return next;
        });

        // 총알 이동
        setBullets(prev =>
          prev.map(b => ({ ...b, y: b.y - 12 })).filter(b => b.y > 0)
        );

        lastTimeRef.current = time;
      }

      requestRef.current = requestAnimationFrame(animate);
    };

    requestRef.current = requestAnimationFrame(animate);
    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []); // 게임 루프는 마운트/언마운트 시에만

  // 충돌 감지
  useEffect(() => {
    setBullets(prevBullets => {
      let hitBulletIds = new Set<number>();

      setEnemies(prevEnemies => {
        const nextEnemies = prevEnemies.filter(e => {
          const bulletHit = prevBullets.find(
            b => Math.abs(b.x - e.x) < 10 && Math.abs(b.y - e.y) < 10
          );
          if (bulletHit) {
            hitBulletIds.add(bulletHit.id);
            setScore(s => s + 100);
            if (soundEnabled) {
              const audio = new Audio(ASSETS.sounds.correct);
              audio.volume = 0.1;
              audio.play().catch(() => {});
            }
            return false;
          }
          return true;
        });
        return nextEnemies;
      });

      // 충돌한 총알도 제거
      return hitBulletIds.size > 0
        ? prevBullets.filter(b => !hitBulletIds.has(b.id))
        : prevBullets;
    });
  }, [bullets.length]); // 총알 개수 변할 때만 체크

  // 발사 함수
  const shoot = useCallback(() => {
    if (showQuizRef.current) return;
    if (shotsLeftRef.current <= 0) return;

    setBullets(prev => [
      ...prev,
      { id: Date.now(), x: shipPosRef.current, y: 82 },
    ]);

    setShotsLeft(prev => {
      const next = prev - 1;
      if (next === 0) setShowQuiz(true);
      return next;
    });

    if (soundEnabled) {
      // 짧은 발사음 (있다면)
    }
  }, [soundEnabled]);

  // 키보드 지원
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.key === ' ') {
        e.preventDefault();
        shoot();
      }
      if (e.code === 'ArrowLeft') {
        setShipPos(p => Math.max(5, p - 10));
      }
      if (e.code === 'ArrowRight') {
        setShipPos(p => Math.min(95, p + 10));
      }
    };
    window.addEventListener('keydown', handleKey);
    return () => window.removeEventListener('keydown', handleKey);
  }, [shoot]);

  return (
    <div className="w-full h-full bg-black relative overflow-hidden flex flex-col items-center">
      {/* 별 배경 */}
      {Array(20)
        .fill(0)
        .map((_, i) => (
          <motion.div
            key={i}
            initial={{ top: -10, left: `${Math.random() * 100}%` }}
            animate={{ top: '110%' }}
            transition={{
              duration: Math.random() * 2 + 1,
              repeat: Infinity,
              ease: 'linear',
              delay: Math.random() * 2,
            }}
            className="absolute w-0.5 h-0.5 bg-white/30 rounded-full"
          />
        ))}

      {showQuiz && (
        <MiniQuiz
          soundEnabled={soundEnabled}
          onCorrect={() => {
            setShowQuiz(false);
            setShotsLeft(10);
          }}
        />
      )}

      {/* 상단 HUD */}
      <div className="absolute top-4 left-4 text-white font-black text-xl z-20 flex items-center gap-4">
        <span>점수: {score}</span>
        <span className="text-sm bg-white/20 px-3 py-1 rounded-full border border-white/10">
          에너지: {shotsLeft}
        </span>
      </div>
      <div className="absolute top-4 right-4 text-white/40 text-xs z-20 text-right">
        10발 쏘면 퀴즈로<br />에너지 충전!
      </div>

      {/* 우주선 */}
      <motion.div
        animate={{ left: `${shipPos}%` }}
        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
        className="absolute bottom-[90px] -translate-x-1/2 text-4xl z-10"
        style={{ transform: 'translateX(-50%)' }}
      >
        🚀
      </motion.div>

      {/* 총알 */}
      {bullets.map(b => (
        <div
          key={b.id}
          className="absolute w-1.5 h-5 bg-yellow-300 rounded-full shadow-[0_0_6px_2px_rgba(253,224,71,0.8)] z-10"
          style={{ left: `${b.x}%`, top: `${b.y}%`, transform: 'translateX(-50%)' }}
        />
      ))}

      {/* 적 */}
      {enemies.map(e => (
        <div
          key={e.id}
          className="absolute text-3xl z-10"
          style={{ left: `${e.x}%`, top: `${e.y}%`, transform: 'translateX(-50%)' }}
        >
          👾
        </div>
      ))}

      {/* 하단 컨트롤 */}
      <div className="absolute bottom-4 left-0 right-0 px-6 flex justify-between items-center z-20">
        {/* 왼쪽 이동 */}
        <Button
          onClick={e => {
            e.stopPropagation();
            setShipPos(p => Math.max(5, p - 10));
          }}
          icon={ArrowLeft}
          className="bg-white/20 hover:bg-white/40 border-none w-16 h-16 rounded-full text-white"
        >
          {""}
        </Button>

        {/* 발사 버튼 — 가운데 크게 */}
        <button
          onClick={e => {
            e.stopPropagation();
            shoot();
          }}
          className="w-20 h-20 rounded-full bg-red-500 hover:bg-red-400 active:scale-95 border-4 border-red-300 shadow-[0_0_20px_rgba(239,68,68,0.7)] flex flex-col items-center justify-center transition-all"
        >
          <span className="text-2xl">🔥</span>
          <span className="text-white text-[10px] font-black mt-0.5">발사!</span>
        </button>

        {/* 오른쪽 이동 */}
        <Button
          onClick={e => {
            e.stopPropagation();
            setShipPos(p => Math.min(95, p + 10));
          }}
          icon={ChevronRight}
          className="bg-white/20 hover:bg-white/40 border-none w-16 h-16 rounded-full text-white"
        >
          {""}
        </Button>
      </div>
    </div>
  );
};
