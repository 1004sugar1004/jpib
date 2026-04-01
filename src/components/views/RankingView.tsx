import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn, formatGradeClass, getLevel } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

import { UserProfile } from '../../types';

interface RankingViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan') => void;
  rankings: UserProfile[];
}

export const RankingView = ({ setView, rankings }: RankingViewProps) => {
  const [rankingType, setRankingType] = React.useState<'daily' | 'monthly' | 'total'>('daily');

  // Robust extraction: find all numbers in a string
  const extractNumbers = (val: string) => {
    if (!val) return [];
    const matches = val.toString().match(/\d+/g);
    return matches ? matches.map(m => parseInt(m, 10).toString()) : [];
  };

  const sortedRankings = React.useMemo(() => {
    const scoreKey = rankingType === 'total' ? 'score' : (rankingType === 'monthly' ? 'monthlyScore' : 'dailyScore');
    return [...rankings].sort((a, b) => (b[scoreKey] || 0) - (a[scoreKey] || 0));
  }, [rankings, rankingType]);

  const classRankings = React.useMemo(() => {
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
  }, [rankings, rankingType]);

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
        <h2 className="text-3xl font-black text-gray-900">명예의 전당</h2>
        <p className="text-gray-500 font-bold">증평 IB 탐험대의 최고 탐험가들을 소개합니다!</p>
        <div className="mt-4 flex flex-col items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-gray-100 px-4 py-1.5 rounded-full text-[10px] font-black text-gray-500 uppercase tracking-widest">
            총 참여 인원: {rankings.length}명 (학생: {totalStudentCount}명)
          </div>
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
        </div>

        <div className="mt-8 flex justify-center gap-2">
          <button
            onClick={() => setRankingType('daily')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              rankingType === 'daily'
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            오늘 랭킹
          </button>
          <button
            onClick={() => setRankingType('monthly')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              rankingType === 'monthly'
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            월간 랭킹
          </button>
          <button
            onClick={() => setRankingType('total')}
            className={cn(
              "px-6 py-2 rounded-full text-sm font-bold transition-all",
              rankingType === 'total'
                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                : "bg-white text-gray-500 hover:bg-gray-50"
            )}
          >
            누적 랭킹
          </button>
        </div>
      </header>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">
          개인 순위 {rankingType === 'daily' ? '(오늘)' : (rankingType === 'monthly' ? '(월간)' : '(누적)')} TOP 30
        </h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {top30Rankings.map((rank, idx) => {
            const level = getLevel(rank.score);
            const displayScore = rankingType === 'total' ? (rank.score || 0) : (rankingType === 'monthly' ? (rank.monthlyScore || 0) : (rank.dailyScore || 0));
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
                    <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center border border-gray-100 shadow-sm overflow-hidden">
                      <img 
                        src={level.img} 
                        alt={rank.name} 
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
                    <div className="font-bold text-gray-900">{rank.name} {rank.role === 'teacher' ? '선생님' : ''}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="px-2 py-0.5 bg-indigo-50 text-indigo-600 rounded-md text-[10px] font-black border border-indigo-100">
                        {rank.class}반
                      </span>
                      <span className="text-[10px] text-gray-500 font-medium">
                        {formatGradeClass(rank.grade, rank.class, rank.role)}
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

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">
          학급 순위 {rankingType === 'daily' ? '(오늘)' : (rankingType === 'monthly' ? '(월간)' : '(누적)')}
        </h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {classRankings.map((cls, idx) => {
            const avgScore = Math.round(cls.score / cls.count);
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
                    <div className="font-bold text-gray-900">{cls.name}</div>
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
