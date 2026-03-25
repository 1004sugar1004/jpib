import React from 'react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { cn } from '../../lib/utils';
import { ArrowLeft } from 'lucide-react';

import { UserProfile } from '../../types';

interface RankingViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'ranking' | 'flashcards' | 'games') => void;
  rankings: UserProfile[];
}

export const RankingView = ({ setView, rankings }: RankingViewProps) => {
  // Normalize: extract numbers only for stable numeric keys (e.g., "6학년" -> "6", "6" -> "6")
  const normalize = (val: string) => {
    if (!val) return '';
    const num = val.toString().replace(/[^0-9]/g, '');
    return num || val.toString().trim();
  };

  const classRankings = React.useMemo(() => {
    const classMap: { [key: string]: { name: string; score: number; count: number } } = {};
    rankings.forEach(user => {
      if (user.role === 'student' && user.grade && user.class) {
        const nGrade = normalize(user.grade);
        const nClass = normalize(user.class);
        const classKey = `${nGrade}-${nClass}`;
        
        if (!classMap[classKey]) {
          classMap[classKey] = { 
            name: `${nGrade}학년 ${nClass}반`, 
            score: 0, 
            count: 0 
          };
        }
        classMap[classKey].score += user.score;
        classMap[classKey].count += 1;
      }
    });
    return Object.values(classMap).sort((a, b) => b.score - a.score);
  }, [rankings]);

  // Only show top 30 in individual rankings
  const top30Rankings = React.useMemo(() => rankings.slice(0, 30), [rankings]);

  return (
    <div className="max-w-2xl mx-auto p-4 py-8 space-y-8">
      <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center">
        <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
        <div className="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg shadow-yellow-100">
          <img src="https://i.imgur.com/EhA2HQZ.png" alt="Ranking" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-3xl font-black text-gray-900">명예의 전당</h2>
        <p className="text-gray-500 font-bold">증평 IB 탐험대의 최고 탐험가들을 소개합니다!</p>
      </header>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">개인 순위 (TOP 30)</h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {top30Rankings.map((rank, idx) => (
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
                <div>
                  <div className="font-bold text-gray-900">{rank.name} {rank.role === 'teacher' ? '선생님' : ''}</div>
                  <div className="text-xs text-gray-500">
                    {rank.role === 'teacher' ? '교사' : (
                      `${normalize(rank.grade)}학년 ${normalize(rank.class)}반`
                    )}
                  </div>
                </div>
              </div>
              <div className="text-xl font-black text-indigo-600">{rank.score.toLocaleString()}점</div>
            </div>
          ))}
          {top30Rankings.length === 0 && (
            <div className="p-12 text-center text-gray-500">아직 등록된 탐험가가 없습니다.</div>
          )}
        </Card>
      </div>

      <div className="space-y-4">
        <h3 className="text-xl font-black text-gray-900 px-4">학급 순위</h3>
        <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
          {classRankings.map((cls, idx) => (
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
                <div>
                  <div className="font-bold text-gray-900">{cls.name}</div>
                  <div className="text-xs text-gray-500">총 참여 학생: {cls.count}명</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-black text-indigo-600">{cls.score}점</div>
                <div className="text-[10px] font-bold text-gray-400 uppercase">총 점수</div>
              </div>
            </div>
          ))}
          {classRankings.length === 0 && (
            <div className="p-12 text-center text-gray-500">아직 등록된 학급이 없습니다.</div>
          )}
        </Card>
      </div>
    </div>
  );
};
