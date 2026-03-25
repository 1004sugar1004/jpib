import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { ASSETS } from '../assets/index';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const getLevel = (score: number) => {
  if (score < 300) return { name: '초보 탐험가', color: 'text-gray-500', bg: 'bg-gray-100', img: ASSETS.characters.explorer_beginner };
  if (score < 1000) return { name: '견습 탐험가', color: 'text-emerald-500', bg: 'bg-emerald-100', img: ASSETS.characters.explorer_apprentice };
  if (score < 2500) return { name: '숙련 탐험가', color: 'text-blue-500', bg: 'bg-blue-100', img: ASSETS.characters.explorer_skilled };
  if (score < 5000) return { name: '베테랑 탐험가', color: 'text-purple-500', bg: 'bg-purple-100', img: ASSETS.characters.explorer_veteran };
  return { name: '전설의 탐험가', color: 'text-yellow-500', bg: 'bg-yellow-100', img: ASSETS.characters.explorer_legend };
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
