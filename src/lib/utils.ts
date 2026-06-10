import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ASSETS } from '../assets/index';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLevel = (score: number) => {
  if (score >= 225000) return {
    name: '궁극의 IB 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-yellow-500 via-pink-500 to-indigo-600',
    color: 'text-white font-extrabold',
    description: 'IB 세상의 모든 핵심 개념과 원리를 통달한 전설적인 구도자입니다.'
  };
  if (score >= 210000) return {
    name: '창조의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-red-600 to-rose-700',
    color: 'text-white',
    description: '스스로의 탐구를 창의적 아이디어로 발현하는 탐구자입니다.'
  };
  if (score >= 190000) return {
    name: '근원의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-emerald-600 to-teal-700',
    color: 'text-white',
    description: '모든 지식의 근원적인 원리를 꿰뚫어보는 눈을 가졌습니다.'
  };
  if (score >= 170000) return {
    name: '초월의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-cyan-600 to-blue-700',
    color: 'text-white',
    description: '개념과 개념의 연계를 뛰어넘어 초월적 지식을 형성합니다.'
  };
  if (score >= 150000) return {
    name: '천상의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-sky-500 to-indigo-600',
    color: 'text-white',
    description: '푸른 천상처럼 높고 넓은 시야로 세상을 바라봅니다.'
  };
  if (score >= 130000) return {
    name: '무한의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-purple-700 to-indigo-900',
    color: 'text-white',
    description: '끝없는 호기심으로 무한한 배움의 가치를 실현합니다.'
  };
  if (score >= 110000) return {
    name: '우주의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900',
    color: 'text-yellow-400 font-extrabold',
    description: '무한히 뻗어 나가는 우주처럼 광대한 탐구 열정을 가졌습니다.'
  };
  if (score >= 90000) return {
    name: '은하의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-indigo-950',
    color: 'text-white',
    description: '밤하늘 가득 메운 은하수처럼 수많은 세상을 포용합니다.'
  };
  if (score >= 70000) return {
    name: '영원의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-violet-900',
    color: 'text-white',
    description: '학습에 대한 열정이 시간이 흘러도 변치 않고 영원합니다.'
  };
  if (score >= 50000) return {
    name: '신화의 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-pink-600',
    color: 'text-white',
    description: '탐험가들의 입에서 입으로 흐르는 장엄한 신화의 주역입니다.'
  };
  if (score >= 35000) return {
    name: '전설의 마스터 탐험가',
    img: ASSETS.characters.explorer_lv10,
    bg: 'bg-indigo-600',
    color: 'text-white',
    description: '모든 지식을 섭렵한 최고의 탐험가입니다.'
  };
  if (score >= 20000) return {
    name: '그랜드 마스터 탐험가',
    img: ASSETS.characters.explorer_lv9,
    bg: 'bg-purple-600',
    color: 'text-white',
    description: '탐험의 진리를 깨달은 마스터입니다.'
  };
  if (score >= 10000) return {
    name: '다이아몬드 탐험가',
    img: ASSETS.characters.explorer_lv8,
    bg: 'bg-blue-600',
    color: 'text-white',
    description: '보석처럼 빛나는 지혜를 가졌습니다.'
  };
  if (score >= 5000) return {
    name: '플래티넘 탐험가',
    img: ASSETS.characters.explorer_lv7,
    bg: 'bg-slate-600',
    color: 'text-white',
    description: '수많은 역경을 이겨낸 베테랑입니다.'
  };
  if (score >= 3000) return {
    name: '골드 탐험가',
    img: ASSETS.characters.explorer_lv6,
    bg: 'bg-yellow-500',
    color: 'text-white',
    description: '황금빛 미래를 향해 나아가는 탐험가입니다.'
  };
  if (score >= 2000) return {
    name: '실버 탐험가',
    img: ASSETS.characters.explorer_lv5,
    bg: 'bg-slate-300',
    color: 'text-slate-800',
    description: '안정적인 실력을 갖춘 탐험가입니다.'
  };
  if (score >= 1200) return {
    name: '브론즈 탐험가',
    img: ASSETS.characters.explorer_lv4,
    bg: 'bg-orange-300',
    color: 'text-orange-900',
    description: '기초를 탄탄히 다진 탐험가입니다.'
  };
  if (score >= 600) return {
    name: '숙련된 탐험가',
    img: ASSETS.characters.explorer_lv3,
    bg: 'bg-emerald-100',
    color: 'text-emerald-700',
    description: '탐험의 재미를 알아가는 중입니다.'
  };
  if (score >= 200) return {
    name: '견습 탐험가',
    img: ASSETS.characters.explorer_lv2,
    bg: 'bg-blue-100',
    color: 'text-blue-700',
    description: '본격적인 탐험을 시작했습니다.'
  };
  return { 
    name: '초보 탐험가', 
    img: ASSETS.characters.explorer_lv1, 
    bg: 'bg-gray-100', 
    color: 'text-gray-600',
    description: '이제 막 탐험을 시작한 새싹입니다.'
  };
};

export function formatGradeClass(grade: string | undefined, className: string | undefined, role?: string) {
  if (role === 'teacher' || grade === '교사') return '교사';
  if (!grade && !className) return '정보 없음';

  const extractNumbers = (val: string) => {
    if (!val) return [];
    const matches = val.toString().match(/\d+/g);
    return matches ? matches.map(m => parseInt(m, 10).toString()) : [];
  };

  const gradeNums = extractNumbers(grade || '');
  const classNums = extractNumbers(className || '');

  if (gradeNums.length > 0 && classNums.length > 0) {
    return `${gradeNums[0]}학년 ${classNums[0]}반`;
  }

  // Fallback: just clean up the strings if no numbers found
  const cleanGrade = (grade || '').replace(/학년/g, '').trim();
  const cleanClass = (className || '').replace(/반/g, '').trim();

  if (!cleanGrade && !cleanClass) return '정보 없음';
  
  return `${cleanGrade}${cleanGrade ? '학년' : ''} ${cleanClass}${cleanClass ? '반' : ''}`.trim();
}
