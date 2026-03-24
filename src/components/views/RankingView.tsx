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

export const RankingView = ({ setView, rankings }: RankingViewProps) => (
  <div className="max-w-2xl mx-auto p-4 py-8 space-y-8">
    <header className="bg-white/80 backdrop-blur-md p-8 rounded-[2.5rem] shadow-xl border border-white/20 text-center">
      <Button variant="ghost" onClick={() => setView('home')} icon={ArrowLeft} className="mb-4">뒤로 가기</Button>
      <div className="w-24 h-24 bg-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-4 overflow-hidden shadow-lg shadow-yellow-100">
        <img src="https://i.imgur.com/EhA2HQZ.png" alt="Ranking" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
      <h2 className="text-3xl font-black text-gray-900">명예의 전당</h2>
      <p className="text-gray-500 font-bold">증평 IB 탐험대의 최고 탐험가들을 소개합니다!</p>
    </header>

    <Card className="divide-y divide-gray-100 bg-white/80 backdrop-blur-md rounded-[2.5rem] border-white/20 shadow-xl overflow-hidden">
      {rankings.map((rank, idx) => (
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
              <div className="text-xs text-gray-500">{rank.role === 'teacher' ? '교사' : `${rank.grade} ${rank.class}`}</div>
            </div>
          </div>
          <div className="text-xl font-black text-indigo-600">{rank.score}점</div>
        </div>
      ))}
      {rankings.length === 0 && (
        <div className="p-12 text-center text-gray-500">아직 등록된 탐험가가 없습니다.</div>
      )}
    </Card>
  </div>
);
