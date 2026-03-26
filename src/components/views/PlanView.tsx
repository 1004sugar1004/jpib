import React from 'react';
import { motion } from 'motion/react';
import { 
  ChevronLeft, 
  BookOpen, 
  Gamepad2, 
  Trophy, 
  Target, 
  GraduationCap,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface PlanViewProps {
  onClose: () => void;
}

const gradePlans = [
  {
    grade: '3학년',
    title: '흥미 유발 및 기초 다지기',
    color: 'from-pink-500 to-rose-500',
    icon: <Sparkles className="w-6 h-6" />,
    items: [
      {
        name: '게임 코너 (마리오, 갤러그)',
        desc: '퀴즈에 대한 거부감을 줄이고 놀이 중심의 학습 참여 유도',
        usage: '창의적 체험활동 및 수업 도입부 동기유발 단계에서 활용'
      },
      {
        name: '기초 단어 플래시카드',
        desc: '그림과 소리를 활용한 기초 어휘 반복 학습',
        usage: '아침 활동 시간이나 쉬는 시간을 활용한 자율 학습'
      },
      {
        name: '캐릭터 성장 시스템',
        desc: '레벨업을 통한 시각적 보상으로 성취감 부여',
        usage: '학습 포인트 적립을 통한 긍정적 강화 기제로 활용'
      }
    ]
  },
  {
    grade: '4학년',
    title: '자기주도 학습 습관 형성',
    color: 'from-orange-500 to-amber-500',
    icon: <Target className="w-6 h-6" />,
    items: [
      {
        name: '데일리 퀴즈 (IB QUIZ)',
        desc: '매일 정해진 분량의 학습 퀴즈 풀이',
        usage: '수업 후 형성평가 또는 가정 연계 과제로 활용'
      },
      {
        name: '메모리 게임',
        desc: '단어와 의미를 연결하는 집중력 및 인지 능력 향상',
        usage: '어휘 학습의 마무리 단계에서 게임형 복습으로 활용'
      },
      {
        name: '티켓 보상 시스템',
        desc: '학습 참여도에 따른 게임 티켓 지급',
        usage: '학습과 놀이의 균형을 맞춘 자기조절 능력 배양'
      }
    ]
  },
  {
    grade: '5학년',
    title: '협력 학습 및 동기 부여',
    color: 'from-emerald-500 to-teal-500',
    icon: <Trophy className="w-6 h-6" />,
    items: [
      {
        name: '실시간 랭킹 시스템',
        desc: '친구들과의 선의의 경쟁을 통한 학습 의욕 고취',
        usage: '학급 내 주간/월간 학습 왕 선발 이벤트로 활용'
      },
      {
        name: 'IB 핵심 개념 퀴즈',
        desc: '7가지 핵심 개념을 퀴즈로 재미있게 학습',
        usage: '수업 중 핵심 개념 이해도를 확인하는 도구로 활용'
      },
      {
        name: '음악 퀴즈 (Music Quiz)',
        desc: '청각적 자극을 활용한 즐거운 학습 경험 제공',
        usage: '교실 분위기 전환이나 특별 활동 시간에 활용'
      }
    ]
  },
  {
    grade: '6학년',
    title: '심화 학습 및 자기 성찰',
    color: 'from-indigo-500 to-purple-500',
    icon: <GraduationCap className="w-6 h-6" />,
    items: [
      {
        name: '자기 성찰 (Reflection)',
        desc: '학습 후 자신의 배움을 되돌아보는 성찰 일지 작성',
        usage: 'IB 교육과정의 핵심인 성찰적 태도 함양 교육에 활용'
      },
      {
        name: 'ATL 체크리스트',
        desc: '자신의 학습 접근 방법(ATL)을 스스로 진단 및 개선',
        usage: '자기주도적 학습 역량 강화 및 상담 자료로 활용'
      },
      {
        name: '디지털 수료증 발급',
        desc: '최종 목표 달성 시 발급되는 성취 인증서',
        usage: '한 학기 또는 학년 마무리 시 포트폴리오 자료로 활용'
      }
    ]
  }
];

export const PlanView: React.FC<PlanViewProps> = ({ onClose }) => {
  return (
    <div className="min-h-screen bg-white/80 backdrop-blur-xl p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-12">
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <ChevronLeft className="w-6 h-6 text-gray-600" />
          </button>
          <div className="text-center">
            <h1 className="text-3xl font-black text-gray-900 tracking-tighter mb-2">
              IB EXPLORER 활용계획서
            </h1>
            <p className="text-sm font-medium text-gray-500 uppercase tracking-widest">
              Educational Utilization Plan for Grades 3-6
            </p>
          </div>
          <div className="w-10" /> {/* Spacer */}
        </div>

        {/* Intro */}
        <div className="bg-indigo-600 rounded-3xl p-8 mb-12 text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="relative z-10 max-w-2xl">
            <h2 className="text-2xl font-bold mb-4">학습자 중심의 디지털 교육 혁신</h2>
            <p className="text-indigo-100 leading-relaxed">
              IB Explorer는 초등학생들의 발달 단계에 맞춘 체계적인 학습 경험을 제공합니다. 
              단순한 지식 습득을 넘어, 게임화(Gamification) 요소와 자기 성찰 도구를 결합하여 
              즐겁고 깊이 있는 배움을 실현합니다.
            </p>
          </div>
          <motion.div 
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"
          />
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {gradePlans.map((plan, idx) => (
            <motion.div
              key={plan.grade}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-gray-100/50 overflow-hidden flex flex-col"
            >
              <div className={`p-6 bg-gradient-to-br ${plan.color} text-white flex items-center justify-between`}>
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
                    {plan.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black uppercase tracking-widest opacity-80">{plan.grade}</span>
                    <h3 className="text-xl font-bold">{plan.title}</h3>
                  </div>
                </div>
              </div>

              <div className="p-8 flex-1 flex flex-col gap-6">
                {plan.items.map((item, i) => (
                  <div key={i} className="group">
                    <div className="flex items-start gap-4">
                      <div className="w-8 h-8 rounded-full bg-gray-50 flex items-center justify-center text-xs font-bold text-gray-400 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                        {i + 1}
                      </div>
                      <div className="flex-1">
                        <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                          {item.name}
                          <ArrowRight className="w-3 h-3 opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all" />
                        </h4>
                        <p className="text-sm text-gray-500 mb-2">{item.desc}</p>
                        <div className="bg-gray-50 rounded-xl p-3 border border-gray-100">
                          <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-wider mb-1">활용 방법</p>
                          <p className="text-xs text-gray-600 leading-relaxed">{item.usage}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-16 text-center pb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 rounded-full text-xs font-bold text-gray-500">
            <BookOpen className="w-4 h-4" />
            본 계획서는 학교 현장의 상황에 맞춰 유연하게 수정하여 활용할 수 있습니다.
          </div>
        </div>
      </div>
    </div>
  );
};
