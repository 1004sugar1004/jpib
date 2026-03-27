import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { 
  Activity, 
  ArrowLeft, 
  Search, 
  Filter, 
  Calendar,
  User,
  Clock,
  Zap,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';
import { collection, query, orderBy, limit, onSnapshot, Timestamp } from 'firebase/firestore';
import { db } from '../../firebase';
import { ActivityLog } from '../../types';
import { cn } from '../../lib/utils';

interface TeacherDashboardViewProps {
  setView: (view: 'home' | 'study' | 'quiz' | 'music-quiz' | 'ranking' | 'flashcards' | 'games' | 'memory' | 'certificate' | 'plan' | 'dashboard') => void;
}

export const TeacherDashboardView = ({ setView }: TeacherDashboardViewProps) => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');

  useEffect(() => {
    const q = query(
      collection(db, 'activityLogs'),
      orderBy('timestamp', 'desc'),
      limit(100)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const newLogs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as ActivityLog[];
      setLogs(newLogs);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const filteredLogs = logs.filter(log => {
    const matchesSearch = log.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         log.activityType.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || log.activityType === filterType;
    return matchesSearch && matchesFilter;
  });

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp instanceof Timestamp ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString('ko-KR', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isSuspicious = (log: ActivityLog) => {
    // Flag if accuracy is high but duration is very short
    if (log.activityType === 'quiz' && log.duration < 10 && log.accuracy >= 0.8) return true;
    if (log.activityType === 'flashcards' && log.duration < 5) return true;
    return false;
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8 space-y-8">
      <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            onClick={() => setView('home')}
            icon={ArrowLeft}
            className="w-10 h-10 p-0 rounded-full"
          >
            {""}
          </Button>
          <div>
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <Activity className="w-8 h-8 text-rose-600" />
              학습 활동 대시보드
            </h2>
            <p className="text-gray-500 font-bold">학생들의 학습 데이터와 이상 징후를 모니터링합니다.</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="학생 이름 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20 w-48"
            />
          </div>
          <select 
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-rose-500/20"
          >
            <option value="all">모든 활동</option>
            <option value="quiz">퀴즈</option>
            <option value="flashcards">플래시카드</option>
            <option value="memory">메모리 게임</option>
            <option value="music-quiz">음악 퀴즈</option>
          </select>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Summary Stats */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6 bg-rose-50 border-rose-100">
            <h4 className="text-sm font-black text-rose-900 uppercase tracking-widest mb-4">오늘의 요약</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">총 활동 수</span>
                <span className="text-lg font-black text-rose-900">{logs.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-rose-700">의심 활동</span>
                <span className="text-lg font-black text-amber-600">{logs.filter(isSuspicious).length}</span>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-white border-gray-100">
            <h4 className="text-sm font-black text-gray-900 uppercase tracking-widest mb-4">활동 가이드</h4>
            <ul className="space-y-3 text-xs text-gray-500 font-medium">
              <li className="flex gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span>너무 짧은 시간 내에 높은 정답률로 완료된 활동은 노란색으로 표시됩니다.</span>
              </li>
              <li className="flex gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>정상적인 학습 활동은 학생의 성장을 돕습니다.</span>
              </li>
            </ul>
          </Card>
        </div>

        {/* Activity Table */}
        <div className="lg:col-span-3">
          <Card className="overflow-hidden border-gray-100 shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">시간</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">학생</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">활동</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">정답률</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">소요시간</th>
                    <th className="p-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-center">상태</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {loading ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">데이터를 불러오는 중...</td>
                    </tr>
                  ) : filteredLogs.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="p-12 text-center text-gray-400 font-bold">검색 결과가 없습니다.</td>
                    </tr>
                  ) : (
                    filteredLogs.map((log) => {
                      const suspicious = isSuspicious(log);
                      return (
                        <motion.tr 
                          key={log.id}
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          className={cn(
                            "group transition-colors",
                            suspicious ? "bg-amber-50/30 hover:bg-amber-50/50" : "hover:bg-gray-50/50"
                          )}
                        >
                          <td className="p-4 text-xs font-bold text-gray-400 whitespace-nowrap">
                            <div className="flex items-center gap-2">
                              <Clock className="w-3 h-3" />
                              {formatDate(log.timestamp)}
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-gray-100 overflow-hidden border border-gray-200">
                                <img 
                                  src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${log.userId}`} 
                                  alt={log.userName}
                                  className="w-full h-full object-cover"
                                  referrerPolicy="no-referrer"
                                />
                              </div>
                              <span className="text-sm font-black text-gray-900">{log.userName}</span>
                            </div>
                          </td>
                          <td className="p-4">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter",
                                log.activityType === 'quiz' ? "bg-purple-100 text-purple-700" :
                                log.activityType === 'flashcards' ? "bg-amber-100 text-amber-700" :
                                log.activityType === 'memory' ? "bg-indigo-100 text-indigo-700" :
                                "bg-rose-100 text-rose-700"
                              )}>
                                {log.activityType}
                              </span>
                            </div>
                          </td>
                          <td className="p-4 text-center">
                            <span className={cn(
                              "text-sm font-black",
                              log.accuracy >= 0.8 ? "text-emerald-600" : "text-amber-600"
                            )}>
                              {Math.round(log.accuracy * 100)}%
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <span className="text-xs font-bold text-gray-500">
                              {log.duration}초
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            {suspicious ? (
                              <div className="flex items-center justify-center gap-1 text-amber-600">
                                <AlertTriangle className="w-4 h-4" />
                                <span className="text-[10px] font-black">의심</span>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center gap-1 text-emerald-600">
                                <CheckCircle2 className="w-4 h-4" />
                                <span className="text-[10px] font-black">정상</span>
                              </div>
                            )}
                          </td>
                        </motion.tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
