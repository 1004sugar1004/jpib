import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../assets';
import { Button } from './ui/Button';
import { cn } from '../lib/utils';
import { UserProfile } from '../types';

const getLevel = (score: number) => {
  if (score < 100) return { name: '초보 탐험가', color: 'text-gray-500', bg: 'bg-gray-100', img: ASSETS.characters.explorer_lv1 };
  if (score < 300) return { name: '견습 탐험가', color: 'text-emerald-500', bg: 'bg-emerald-100', img: ASSETS.characters.explorer_lv2 };
  if (score < 600) return { name: '숙련 탐험가', color: 'text-blue-500', bg: 'bg-blue-100', img: ASSETS.characters.explorer_lv3 };
  if (score < 1000) return { name: '베테랑 탐험가', color: 'text-purple-500', bg: 'bg-purple-100', img: ASSETS.characters.explorer_lv4 };
  return { name: '전설의 탐험가', color: 'text-yellow-500', bg: 'bg-yellow-100', img: ASSETS.characters.explorer_lv10 };
};

interface LevelUpModalProps {
  show: boolean;
  onClose: () => void;
  profile: UserProfile | null;
}

export const LevelUpModal = ({ show, onClose, profile }: LevelUpModalProps) => {
  const level = getLevel(profile?.score || 0);
  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.5, y: 100 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.5, y: 100 }}
            className="bg-white rounded-[3rem] p-12 max-w-sm w-full text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-b from-yellow-50 to-white -z-10" />
            <motion.div
              animate={{ rotate: [0, 10, -10, 10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="mb-6"
            >
              <img src={ASSETS.characters.level_up} alt="Level Up" className="w-32 h-32 mx-auto drop-shadow-xl" referrerPolicy="no-referrer" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">LEVEL UP!</h2>
            <p className="text-gray-500 font-bold mb-8 uppercase tracking-widest">새로운 칭호를 획득했습니다</p>
            
            <div className={cn("p-6 rounded-3xl mb-8 border-2 border-dashed flex flex-col items-center", level.bg, level.color.replace('text', 'border'))}>
              <img src={level.img} alt={level.name} className="w-16 h-16 mb-3 object-contain" referrerPolicy="no-referrer" />
              <p className="text-2xl font-black">{level.name}</p>
            </div>
            
            <Button onClick={onClose} className="w-full py-4 text-xl">
              계속 탐험하기
            </Button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
