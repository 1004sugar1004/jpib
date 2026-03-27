import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowLeft, Music, Play, CheckCircle2, Trophy, Settings, RotateCcw } from 'lucide-react';
import confetti from 'canvas-confetti';

interface Song {
  id: string;
  name: string;
  emoji: string;
  url: string;
}

interface Question {
  song: keyof typeof SONGS;
  t: number;
  hint: string;
  q: string;
  type: 'short' | 'multi';
  keys?: string[];
  opts?: string[];
  ans: string;
  okMsg: string;
}

const SONGS = {
  learner: { name: '학습자송 — 우리들의 Super Power', emoji: '🌟', url: 'https://ik.imagekit.io/foefnjeua/%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20Super%20Power.mp3?updatedAt=1773797977356' },
  concept: { name: '개념송', emoji: '💡', url: 'https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3' },
  atl: { name: 'ATL 다섯 가지 힘', emoji: '⚡', url: 'https://ik.imagekit.io/foefnjeua/ATL%20%EB%8B%A4%EC%84%AF%20%EA%B0%80%EC%A7%80%20%ED%9E%98.mp3' },
  trans: { name: '6가지 우주 (초학문적 주제송)', emoji: '🌍', url: 'https://ik.imagekit.io/foefnjeua/6%EA%B0%80%EC%A7%80%20%EC%9A%B0%EC%A3%BC.mp3' },
};

const BASE_QUESTIONS: Question[] = [
  { song: 'learner', t: 5, hint: "🎧 '궁금한 건 못 참아, 질문을 던져!' 이 가사가 나오는 부분이에요!", q: "'궁금한 건 못 참아, 질문을 던져!' — 어떤 IB 학습자상인가요?", type: 'short', keys: ['탐구'], ans: '탐구하는 사람', okMsg: "🎉 맞아요! 질문을 던지는 사람 = 탐구하는 사람!" },
  { song: 'learner', t: 45, hint: "🎧 '다름을 인정해, 마음을 활짝!' 이 부분을 잘 들어봐요!", q: "'다름을 인정해, 마음을 활짝!' — 어떤 학습자상일까요?", type: 'multi', opts: ['배려하는 사람', '열린 마음을 가진 사람', '도전하는 사람', '원칙을 지키는 사람'], ans: '열린 마음을 가진 사람', okMsg: "🎉 정답! 다름을 인정하는 마음 = 열린 마음을 가진 사람!" },
  { song: 'concept', t: 1, hint: "🎧 '형태는 모습이야, 그게 뭔지 말해주는 ___' 빈칸을 찾아봐요!", q: "'형태는 모습이야, 그게 뭔지 말해주는 ___' — 빈칸에 들어갈 말은?", type: 'short', keys: ['이름표'], ans: '이름표', okMsg: "🎉 정답! 형태는 이름표처럼 뭔지 알려줘요!" },
  { song: 'concept', t: 48, hint: "🎧 '연결'이 무엇에 비유되는지 잘 들어봐요!", q: "노래에서 '연결'은 무엇에 비유되었나요?", type: 'multi', opts: ['기차', '구름', '다리', '강물'], ans: '다리', okMsg: "🎉 정답! 연결은 이어주는 '다리'예요!" },
  { song: 'atl', t: 0, hint: "🎧 ATL이 몇 가지인지 귀 기울여 들어봐요!", q: "ATL은 모두 몇 가지 기능인가요?", type: 'multi', opts: ['3가지', '5가지', '7가지', '10가지'], ans: '5가지', okMsg: "🎉 정답! 사고·조사·의사소통·대인관계·자기관리 — 5가지!" },
  { song: 'atl', t: 72, hint: "🎧 '오늘 할 일 스스로 적어봐' — 어떤 기능인지 들어봐요!", q: "'오늘 할 일 스스로 적어봐, 실수해도 다시 일어나는 힘' — 어떤 ATL 기능인가요?", type: 'short', keys: ['자기관리'], ans: '자기관리기능', okMsg: "🎉 정답! 스스로 계획·회복 = 자기관리기능!" },
  { song: 'trans', t: 5, hint: "🎧 첫 번째 초학문적 주제를 영어로 말하는 부분이에요!", q: "'우리는 누구인가'를 영어로 쓰면? (Who ___ ___)", type: 'short', keys: ['who we are'], ans: 'Who we are', okMsg: "🎉 정답! 우리는 누구인가 = Who we are!" },
  { song: 'trans', t: 58, hint: "🎧 'Sharing the planet' — 어떤 초학문적 주제인지 들어봐요!", q: "'하나뿐인 Blue dot, 공정한 분배와 책임' — 어떤 초학문적 주제인가요?", type: 'multi', opts: ['우리는 누구인가', '우리 모두의 지구', '세계가 돌아가는 방식', '우리 자신을 표현하는 방법'], ans: '우리 모두의 지구', okMsg: "🎉 정답! Sharing the planet = 우리 모두의 지구!" },
];

interface MusicQuizViewProps {
  onFinish: (score: number, maxStreak: number, correctCount: number, totalCount: number, duration: number) => void;
  onClose: () => void;
  soundEnabled: boolean;
}

export const MusicQuizView = ({ onFinish, onClose, soundEnabled }: MusicQuizViewProps) => {
  const [screen, setScreen] = useState<'intro' | 'listening' | 'questioning' | 'feedback' | 'final'>('intro');
  const [qi, setQi] = useState(0);
  const [score, setScore] = useState(0);
  const [isOk, setIsOk] = useState(false);
  const [lastQ, setLastQ] = useState<Question | null>(null);
  const [busy, setBusy] = useState(false);
  const [timeLeft, setTimeLeft] = useState(10);
  const [customTimes, setCustomTimes] = useState<number[]>(() => {
    const saved = localStorage.getItem('ib_times');
    return saved ? Object.values(JSON.parse(saved)) as number[] : BASE_QUESTIONS.map(q => q.t);
  });
  const [shortAnswer, setShortAnswer] = useState('');
  const [playStatus, setPlayStatus] = useState('▶️ 버튼을 눌러 재생하세요');
  const [isLoading, setIsLoading] = useState(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = useRef(Date.now());

  const stopAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = '';
      audioRef.current = null;
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const getQ = (index: number) => ({
    ...BASE_QUESTIONS[index],
    ...SONGS[BASE_QUESTIONS[index].song as keyof typeof SONGS],
    t: customTimes[index]
  });

  const playAudio = useCallback((url: string, sec: number, onEnd: () => void, statusId?: string, btnId?: string) => {
    stopAudio();
    setIsLoading(true);
    setPlayStatus('⏳ 불러오는 중...');
    
    const audio = new Audio();
    audioRef.current = audio;
    
    audio.addEventListener('canplay', () => {
      setIsLoading(false);
      setPlayStatus('🎵 재생 중...');
      audio.currentTime = Math.max(0, sec);
      setTimeLeft(10);
      
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.then(() => {
          timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
              if (prev <= 1) {
                clearInterval(timerRef.current!);
                timerRef.current = null;
                stopAudio();
                onEnd();
                return 0;
              }
              return prev - 1;
            });
          }, 1000);
        }).catch(() => {
          setPlayStatus('▶️ 버튼을 눌러 재생하세요');
          setIsLoading(false);
        });
      }
    }, { once: true });

    audio.addEventListener('ended', () => {
      if (timerRef.current) clearInterval(timerRef.current);
      onEnd();
    }, { once: true });

    audio.src = url;
    audio.load();
  }, [stopAudio]);

  const handleStart = () => {
    setQi(0);
    setScore(0);
    setBusy(false);
    goListen(0);
  };

  const goListen = (index: number) => {
    setScreen('listening');
    const q = getQ(index);
    playAudio(q.url, q.t, () => {
      setScreen('questioning');
      setShortAnswer('');
    });
  };

  const doSubmit = (ok: boolean) => {
    setIsOk(ok);
    setLastQ(getQ(qi));
    if (ok) setScore(prev => prev + 10); // 10 points per correct answer
    setScreen('feedback');
    setBusy(false);
  };

  const checkShort = (val: string, q: Question) => {
    return q.keys?.some(k => val.trim().toLowerCase().includes(k.toLowerCase())) || false;
  };

  const submitShort = () => {
    if (busy || !shortAnswer.trim()) return;
    setBusy(true);
    doSubmit(checkShort(shortAnswer, getQ(qi)));
  };

  const handleNext = () => {
    if (qi + 1 >= BASE_QUESTIONS.length) {
      setScreen('final');
      const duration = Math.floor((Date.now() - startTimeRef.current) / 1000);
      onFinish(score, 0, score / 10, BASE_QUESTIONS.length, duration);
      if (score >= 60) {
        confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 } });
      }
    } else {
      setQi(prev => prev + 1);
      goListen(qi + 1);
    }
  };

  useEffect(() => {
    return () => stopAudio();
  }, [stopAudio]);

  return (
    <div className="min-h-screen bg-[#07051a] text-white flex items-center justify-center p-4 font-sans relative overflow-hidden">
      {/* Stars Background */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        {[...Array(50)].map((_, i) => (
          <div 
            key={i}
            className="absolute bg-white rounded-full"
            style={{
              width: Math.random() * 3 + 'px',
              height: Math.random() * 3 + 'px',
              top: Math.random() * 100 + '%',
              left: Math.random() * 100 + '%',
              animation: `pulse ${Math.random() * 3 + 2}s infinite`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-lg z-10">
        <AnimatePresence mode="wait">
          {screen === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 text-center"
            >
              <div className="text-6xl animate-bounce">🎵</div>
              <h1 className="text-5xl font-black bg-gradient-to-r from-yellow-300 to-pink-500 bg-clip-text text-transparent">IB 음악 퀴즈!</h1>
              <p className="text-cyan-400 font-bold">🌟 노래를 듣고 IB를 맞춰봐요 — 총 {BASE_QUESTIONS.length}문제</p>
              <div className="bg-white/5 border border-white/10 p-6 rounded-3xl space-y-4 text-sm leading-relaxed">
                <p>🎧 노래의 <strong className="text-yellow-300">10초</strong>를 들어요</p>
                <p>✏️ 주관식과 객관식이 섞여 있어요</p>
                <p>🧠 학습자상 · 개념 · ATL · 초학문적 주제!</p>
                <p>⭐ 몇 개나 맞출 수 있을까요?</p>
              </div>
              <div className="space-y-3">
                <Button onClick={handleStart} className="w-full py-6 text-xl bg-gradient-to-r from-pink-500 to-cyan-500 hover:scale-105 transition-transform shadow-lg shadow-pink-500/20">
                  🚀 시작하기!
                </Button>
                <Button variant="secondary" onClick={onClose} className="w-full bg-white/10 text-white border-white/10">
                  기지로 돌아가기
                </Button>
              </div>
            </motion.div>
          )}

          {screen === 'listening' && (
            <motion.div 
              key="listening"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                <span>문제 {qi + 1} / {BASE_QUESTIONS.length}</span>
                <span className="text-yellow-300">⭐ {score}점</span>
              </div>
              <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full bg-gradient-to-r from-pink-500 to-cyan-500 transition-all duration-500" style={{ width: `${((qi) / BASE_QUESTIONS.length) * 100}%` }} />
              </div>

              <Card className="bg-white/5 border-white/10 p-8 text-center space-y-6">
                <div className="text-xs font-black text-cyan-400 tracking-widest uppercase">지금 재생 중</div>
                <h2 className="text-2xl font-black text-yellow-300">{getQ(qi).emoji} {getQ(qi).name}</h2>
                <div className="bg-cyan-500/10 border-l-4 border-cyan-500 p-4 text-sm text-cyan-200 text-left">
                  {getQ(qi).hint}
                </div>

                {/* Wave Animation */}
                <div className="flex items-end justify-center gap-1 h-12">
                  {[...Array(14)].map((_, i) => (
                    <motion.div
                      key={i}
                      animate={{ height: [10, Math.random() * 40 + 10, 10] }}
                      transition={{ repeat: Infinity, duration: 0.5 + Math.random() }}
                      className="w-1.5 bg-gradient-to-t from-pink-500 to-cyan-500 rounded-full"
                    />
                  ))}
                </div>

                <div className="flex flex-col items-center gap-4">
                  <button 
                    disabled={isLoading}
                    onClick={() => goListen(qi)}
                    className={cn(
                      "w-20 h-20 rounded-full bg-gradient-to-r from-pink-500 to-cyan-500 flex items-center justify-center text-3xl shadow-2xl shadow-pink-500/50 hover:scale-110 transition-transform",
                      isLoading && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isLoading ? "⏳" : <Play className="fill-current" />}
                  </button>
                  <p className="text-sm font-bold text-cyan-400">{playStatus}</p>
                </div>

                <div className="relative w-24 h-24 mx-auto">
                  <svg className="w-full h-full -rotate-90">
                    <circle cx="48" cy="48" r="40" className="fill-none stroke-white/10 stroke-8" />
                    <motion.circle 
                      cx="48" cy="48" r="40" 
                      className="fill-none stroke-pink-500 stroke-8"
                      strokeDasharray={251}
                      animate={{ strokeDashoffset: 251 - (251 * timeLeft / 10) }}
                      transition={{ duration: 1, ease: "linear" }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center text-3xl font-black text-yellow-300">
                    {timeLeft}
                  </div>
                </div>
                <p className="text-xs text-gray-500 font-bold">초 후 문제 등장! 🎧</p>
              </Card>
            </motion.div>
          )}

          {screen === 'questioning' && (
            <motion.div 
              key="questioning"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-center text-sm font-bold text-gray-400">
                <span>문제 {qi + 1} / {BASE_QUESTIONS.length}</span>
                <span className="text-yellow-300">⭐ {score}점</span>
              </div>

              <Card className="bg-white/5 border-white/10 p-8 space-y-6">
                <div className="text-xs font-black text-gray-500 uppercase">{getQ(qi).type === 'short' ? '✏️ 주관식' : '📝 객관식'}</div>
                <h2 className="text-xl font-black leading-relaxed">{getQ(qi).q}</h2>
                
                {getQ(qi).type === 'multi' ? (
                  <div className="grid grid-cols-1 gap-3">
                    {getQ(qi).opts?.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => doSubmit(opt === getQ(qi).ans)}
                        className="p-4 bg-white/5 border-2 border-white/10 rounded-2xl text-left font-bold hover:bg-pink-500/10 hover:border-pink-500 transition-all"
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <input 
                      autoFocus
                      value={shortAnswer}
                      onChange={e => setShortAnswer(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && submitShort()}
                      placeholder="답을 입력하세요..."
                      className="flex-1 bg-white/5 border-2 border-white/10 rounded-2xl p-4 outline-none focus:border-cyan-500 transition-all font-bold"
                    />
                    <Button onClick={submitShort} className="bg-yellow-400 text-black hover:bg-yellow-500 px-6">
                      확인!
                    </Button>
                  </div>
                )}
              </Card>
            </motion.div>
          )}

          {screen === 'feedback' && (
            <motion.div 
              key="feedback"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center space-y-8"
            >
              <div className={cn(
                "p-10 rounded-[3rem] border-4 space-y-4",
                isOk ? "bg-green-500/10 border-green-500 text-green-400" : "bg-red-500/10 border-red-500 text-red-400"
              )}>
                <div className="text-6xl">{isOk ? '🎉' : '😅'}</div>
                <h2 className="text-2xl font-black">{isOk ? '정답입니다!' : '아쉬워요!'}</h2>
                <p className="text-lg font-bold text-white">
                  {isOk ? lastQ?.okMsg : <>정답은 <span className="text-yellow-300">【{lastQ?.ans}】</span> 이에요!</>}
                </p>
              </div>
              <Button onClick={handleNext} className="w-full py-6 text-xl bg-white text-black hover:bg-gray-100">
                {qi + 1 >= BASE_QUESTIONS.length ? '🏁 결과 보기!' : '다음 문제 →'}
              </Button>
            </motion.div>
          )}

          {screen === 'final' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center space-y-6"
            >
              <div className="text-8xl mb-4">{score >= 70 ? '🏆' : '🎉'}</div>
              <h2 className="text-4xl font-black text-yellow-300">퀴즈 완료!</h2>
              <div className="text-7xl font-black bg-gradient-to-r from-pink-500 to-cyan-500 bg-clip-text text-transparent py-4">
                {score}
              </div>
              <p className="text-gray-400 font-bold">/ {BASE_QUESTIONS.length * 10}점 만점 🎯</p>
              <div className="bg-white/5 p-6 rounded-3xl text-sm font-bold leading-relaxed">
                {score === 80 ? '완벽해요! 진짜 IB 슈퍼히어로! 🦸' :
                 score >= 60 ? '정말 잘했어요! 거의 다 맞췄어요! 💪' :
                 score >= 40 ? '절반 이상 맞췄어요! 노래를 더 들으면 더 잘할 수 있어요! 🎵' :
                 '괜찮아요! IB 노래를 더 들으며 다시 도전해봐요! 화이팅! 🎧'}
              </div>
              <div className="flex flex-col gap-3">
                <Button onClick={handleStart} className="w-full py-4 bg-pink-600 hover:bg-pink-700" icon={RotateCcw}>
                  다시 도전!
                </Button>
                <Button variant="ghost" onClick={onClose} className="text-gray-500">
                  홈으로 돌아가기
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
