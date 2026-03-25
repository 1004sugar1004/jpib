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
