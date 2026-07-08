import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn, formatGradeClass, getLevel } from '../../lib/utils';
import { ArrowLeft, Calendar, Trophy, Medal } from 'lucide-react';

import { UserProfile } from '../../types';

interface RankingViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
  rankings: UserProfile[];
}

// Official, restored final June rankings after resolving data collection bugs
const JUNE_INDIVIDUAL_RANKINGS = [
  { uid: 'june_1', name: '유서준', grade: '4학년', class: '4반', role: 'student', score: 63060, monthlyScore: 63060, photoURL: '' },
  { uid: 'june_2', name: '김태린 🍎', grade: '4학년', class: '1반', role: 'student', score: 60110, monthlyScore: 60110, photoURL: '' },
  { uid: 'june_3', name: '도현우', grade: '4학년', class: '2반', role: 'student', score: 56610, monthlyScore: 56610, photoURL: '' },
  { uid: 'june_4', name: '권지훈🤯😱', grade: '4학년', class: '5반', role: 'student', score: 47006, monthlyScore: 47006, photoURL: '' },
  { uid: 'june_5', name: '최진호', grade: '4학년', class: '1반', role: 'student', score: 37420, monthlyScore: 37420, photoURL: '' },
  { uid: 'june_6', name: '서아♡', grade: '4학년', class: '1반', role: 'student', score: 36230, monthlyScore: 36230, photoURL: '' },
  { uid: 'june_7', name: '김원우', grade: '4학년', class: '1반', role: 'student', score: 33150, monthlyScore: 33150, photoURL: '' },
  { uid: 'june_8', name: '금다온', grade: '3학년', class: '3반', role: 'student', score: 27379, monthlyScore: 27379, photoURL: '' },
  { uid: 'june_9', name: '˚ෆ*₊주현우ʚɞ', grade: '4학년', class: '5반', role: 'student', score: 27000, monthlyScore: 27000, photoURL: '' },
  { uid: 'june_10', name: '박서윤', grade: '3학년', class: '3반', role: 'student', score: 26841, monthlyScore: 26841, photoURL: '' },
  { uid: 'june_11', name: '이서린', grade: '3학년', class: '3반', role: 'student', score: 20700, monthlyScore: 20700, photoURL: '' },
  { uid: 'june_12', name: '김지후', grade: '3학년', class: '3반', role: 'student', score: 20210, monthlyScore: 20210, photoURL: '' },
  { uid: 'june_13', name: '김채아', grade: '3학년', class: '3반', role: 'student', score: 15861, monthlyScore: 15861, photoURL: '' },
  { uid: 'june_14', name: '권아인', grade: '3학년', class: '3반', role: 'student', score: 13340, monthlyScore: 13340, photoURL: '' },
  { uid: 'june_15', name: '김동오🍉', grade: '4학년', class: '1반', role: 'student', score: 12760, monthlyScore: 12760, photoURL: '' },
  { uid: 'june_16', name: '최연서★*☆○', grade: '4학년', class: '5반', role: 'student', score: 11576, monthlyScore: 11576, photoURL: '' },
  { uid: 'june_17', name: '임준수🇰🇷', grade: '4학년', class: '5반', role: 'student', score: 11360, monthlyScore: 11360, photoURL: '' },
  { uid: 'june_18', name: '허선을', grade: '3학년', class: '3반', role: 'student', score: 11330, monthlyScore: 11330, photoURL: '' },
  { uid: 'june_19', name: '이우민🍮', grade: '4학년', class: '5반', role: 'student', score: 11200, monthlyScore: 11200, photoURL: '' },
  { uid: 'june_20', name: '윤하민 행운 🍀 😘 💕', grade: '3학년', class: '3반', role: 'student', score: 9580, monthlyScore: 9580, photoURL: '' }
];

const JUNE_CLASS_RANKINGS = [
  { name: '4학년 1반', score: 438623, count: 22 },
  { name: '3학년 5반', score: 270887, count: 24 },
  { name: '5학년 5반', score: 229368, count: 23 },
  { name: '3학년 3반', score: 217104, count: 19 },
  { name: '4학년 4반', score: 193957, count: 21 },
  { name: '4학년 5반', score: 119075, count: 19 },
  { name: '4학년 6반', score: 45628, count: 23 },
  { name: '6학년 3반', score: 24043, count: 19 },
  { name: '3학년 4반', score: 21704, count: 14 },
  { name: '3학년 1반', score: 19680, count: 9 }
];

export const RankingView = ({ setView, rankings }: RankingViewProps) => {
  const [selectedMonth, setSelectedMonth] = React.useState<'july' | 'june'>('july');
  const [rankingType, setRankingType] = React.useState<'daily' | 'monthly' | 'total'>('monthly');

  // Robust extraction: find all numbers in a string
  const extractNumbers = (val: string) => {
    if (!val) return [];
    const matches = val.toString().match(/\d+/g);
    return matches ? matches.map(m => parseInt(m, 10).toString()) : [];
  };

  const currentMonth = new Date().getMonth() + 1; // 7

  const sortedRankings = React.useMemo(() => {
    if (selectedMonth === 'june') {
      return JUNE_INDIVIDUAL_RANKINGS;
    }
    const scoreKey = rankingType === 'total' ? 'score' : (rankingType === 'monthly' ? 'monthlyScore' : 'dailyScore');
    return [...rankings].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0));
  }, [rankings, rankingType, selectedMonth]);

  const classRankings = React.useMemo(() => {
    if (selectedMonth === 'june') {
      return JUNE_CLASS_RANKINGS;
    }
    const classMap: { [key: string]: { name: string; score: number; count: number } } = {};
    const scoreKey = rankingType === 'total' ? 'score' : (rankingType === 'monthly' ? 'monthlyScore' : 'dailyScore');
    
    rankings.forEach(user => {
      let groupKey = '';
      let groupName = '';
      
      if (user.role === 'teacher') {
        groupKey = 'teacher';
        groupName = '선생님';
      } else {
        // 학년과 반 필드에서 모든 숫자를 순서대로 추출하여 합침
        const allNums = [
          ...extractNumbers(user.grade || ''),
          ...extractNumbers(user.class || '')
        ];
        
        if (allNums.length >= 2) {
          const nGrade = allNums[0];
          const nClass = allNums[1];
          groupKey = `${nGrade}-${nClass}`;
          groupName = `${nGrade}학년 ${nClass}반`;
        } else {
          groupKey = '기타';
          groupName = '기타 (정보 부족)';
        }
      }
      
      if (!classMap[groupKey]) {
        classMap[groupKey] = { 
          name: groupName, 
          score: 0, 
          count: 0 
        };
      }
      classMap[groupKey].score += (user[scoreKey] || 0);
      classMap[groupKey].count += 1;
    });
    
    // 점수 순으로 정렬하되 '기타'는 항상 마지막에 배치
    return Object.values(classMap).sort((a, b) => {
      if (a.name.includes('기타')) return 1;
      if (b.name.includes('기타')) return -1;
      return b.score - a.score;
    });
  }, [rankings, rankingType, selectedMonth]);

  const totalStudentCount = React.useMemo(() => {
    return rankings.filter(u => u.role !== 'teacher').length;
  }, [rankings]);

  const top30Rankings = React.useMemo(() => sortedRankings.slice(0, 30), [sortedRankings]);

  return (
    <div className="max-w-2xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
        <div className="flex justify-start mb-6">
          <Button 
            variant="secondary" 
            onClick={() => setView('home')} 
            icon={ArrowLeft} 
            className="bg-indigo-50 text-indigo-600 border-indigo-100 hover:bg-indigo-100 shadow-sm"
          >
            뒤로 가기
          </Button>
        </div>
        <div className="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg shadow-yellow-100">
          <img src="https://i.imgur.com/EhA2HQZ.png" alt="Ranking" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">
          명예의 전당 {selectedMonth === 'june' ? '🏆' : ''}
        </h2>
        <p className="text-gray-500 font-bold mt-1">
          {selectedMonth === 'june' 
            ? "6월 한 달 동안 최고의 활약을 보인 증평 IB 탐험대 명예의 주인공들입니다!" 
            : `${currentMonth}월 증평 IB 탐험대의 최고 탐험가들을 소개합니다!`}
        </p>

        {/* Month Selector Switcher */}
        <div className="mt-6 inline-flex p-1 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
          <button
            onClick={() => {
              setSelectedMonth('july');
              setRankingType('monthly');
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
              selectedMonth === 'july'
                ? "bg-white text-indigo-600 shadow-md"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            <Calendar className="w-3.5 h-3.5" />
            📅 7월 도전 (현재 진행 중)
          </button>
          <button
            onClick={() => {
              setSelectedMonth('june');
              setRankingType('monthly'); // Static June data only supports Monthly
            }}
            className={cn(
              "px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5",
              selectedMonth === 'june'
                ? "bg-white text-amber-600 shadow-md"
                : "text-gray-500 hover:text-gray-800"
            )}
          >
            <Trophy className="w-3.5 h-3.5 text-amber-500" />
            👑 6월 최종 (명예의 전당)
          </button>
        </div>

        <div className="mt-6 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-gray-150 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest shadow-sm">
            {selectedMonth === 'june'
              ? "6월 공식 최종 결과 (오류 완벽 정밀 복구 완료)"
              : `7월 총 참여 인원: ${rankings.length}명 (학생: ${totalStudentCount}명)`}
          </div>
          
          {selectedMonth === 'june' ? (
            <p className="text-[10px] text-amber-600 font-bold bg-amber-50 px-3 py-1 rounded-lg border border-amber-100 mt-1">
              🎉 6월 30일 자정 최종 점수 연산 기술 오류가 완벽히 복구되어 정상 결과가 패치되었습니다!
            </p>
          ) : (
            <>
              {rankingType === 'monthly' && (
                <p className="text-[10px] text-indigo-500 font-bold">
                  * 월간 랭킹은 매달 1일에 자동으로 초기화됩니다.
                </p>
              )}
              {rankingType === 'daily' && (
                <p className="text-[10px] text-indigo-500 font-bold">
                  * 오늘 랭킹은 매일 자정에 자동으로 초기화됩니다.
                </p>
              )}
            </>
          )}
        </div>

        {/* Show Sub-ranking types ONLY for July */}
        {selectedMonth === 'july' && (
          <div className="mt-8 flex justify-center gap-2">
            <button
              onClick={() => setRankingType('daily')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer",
                rankingType === 'daily'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              )}
            >
              오늘 랭킹
            </button>
            <button
              onClick={() => setRankingType('monthly')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer",
                rankingType === 'monthly'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              )}
            >
              7월 랭킹
            </button>
            <button
              onClick={() => setRankingType('total')}
              className={cn(
                "px-6 py-2 rounded-full text-sm font-bold transition-all cursor-pointer",
                rankingType === 'total'
                  ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                  : "bg-white text-gray-500 hover:bg-gray-50 border border-gray-100"
              )}
            >
              누적 랭킹
            </button>
          </div>
        )}
      </header>

      {/* Individual Rankings */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">
          개인 순위 {selectedMonth === 'june' ? '(6월 최종)' : (rankingType === 'daily' ? '(오늘)' : (rankingType === 'monthly' ? `(${currentMonth}월)` : '(누적)'))} TOP 30
        </h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {top30Rankings.map((rank, idx) => {
            const level = getLevel(rank.score);
            const displayScore = selectedMonth === 'june' 
              ? rank.score 
              : (rankingType === 'total' ? (rank.score || 0) : (rankingType === 'monthly' ? (rank.monthlyScore || 0) : (rank.dailyScore || 0)));
            
            return (
              <div key={rank.uid} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                    idx === 0 ? "bg-yellow-100 text-yellow-700" :
                    idx === 1 ? "bg-gray-100 text-gray-700" :
                    idx === 2 ? "bg-orange-100 text-orange-700" : "text-gray-400"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden p-1">
                      {rank.photoURL === 'caricature' && (rank as any).caricatureSvg ? (
                        <div 
                          dangerouslySetInnerHTML={{ __html: (rank as any).caricatureSvg }} 
                          className="w-10 h-10 flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                        />
                      ) : (
                        <img 
                          src={level.img} 
                          alt={rank.name} 
                          className="w-10 h-10 object-contain" 
                          referrerPolicy="no-referrer"
                        />
                      )}
                    </div>
                    <div className={cn(
                      "absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[7px] font-black shadow-sm border border-white whitespace-nowrap z-10",
                      level.bg,
                      level.color
                    )}>
                      {level.name.split(' ')[0]}
                    </div>
                  </div>
 
                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{rank.name}</span>
                      {rank.role === 'teacher' && (
                        <span className="bg-slate-100 text-slate-600 text-[8px] px-1 py-0.2 rounded font-extrabold">선생님</span>
                      )}
                      {selectedMonth === 'june' && idx === 0 && (
                        <span className="bg-yellow-500 text-white text-[8px] px-1 py-0.2 rounded font-extrabold">챔피언 🏆</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black border border-indigo-100">
                        {rank.class}
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {formatGradeClass(rank.grade, rank.class, rank.role as any)}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="text-xl font-black text-indigo-600">
                  {displayScore.toLocaleString()}점
                </div>
              </div>
            );
          })}
          {top30Rankings.length === 0 && (
            <div className="p-12 text-center text-gray-500">아직 등록된 탐험가가 없습니다.</div>
          )}
        </Card>
      </div>

      {/* Class Rankings */}
      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">
          학급 순위 {selectedMonth === 'june' ? '(6월 최종)' : (rankingType === 'daily' ? '(오늘)' : (rankingType === 'monthly' ? `(${currentMonth}월)` : '(누적)'))}
        </h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {classRankings.map((cls, idx) => {
            const avgScore = Math.round(cls.score / (cls.count || 1));
            const level = getLevel(avgScore);
            return (
              <div key={cls.name} className="p-6 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg",
                    idx === 0 ? "bg-yellow-100 text-yellow-700" :
                    idx === 1 ? "bg-gray-100 text-gray-700" :
                    idx === 2 ? "bg-orange-100 text-orange-700" : "text-gray-400"
                  )}>
                    {idx + 1}
                  </div>
                  
                  <div className="relative shrink-0">
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                      <img 
                        src={level.img} 
                        alt={cls.name} 
                        className="w-10 h-10 object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    </div>
                    <div className={cn(
                      "absolute -bottom-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full text-[7px] font-black shadow-sm border border-white whitespace-nowrap z-10",
                      level.bg,
                      level.color
                    )}>
                      {level.name.split(' ')[0]}
                    </div>
                  </div>

                  <div>
                    <div className="font-bold text-gray-900 flex items-center gap-1.5">
                      <span>{cls.name}</span>
                      {selectedMonth === 'june' && idx === 0 && (
                        <span className="bg-yellow-500 text-white text-[8px] px-1 py-0.2 rounded font-extrabold">우승 학급 👑</span>
                      )}
                    </div>
                    <div className="text-xs text-gray-500">참여 학생: {cls.count}명 (평균: {avgScore.toLocaleString()}점)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-xl font-black text-indigo-600">{cls.score.toLocaleString()}점</div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase">총 점수</div>
                </div>
              </div>
            );
          })}
          {classRankings.length === 0 && (
            <div className="p-12 text-center text-gray-500">아직 등록된 학급이 없습니다.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
