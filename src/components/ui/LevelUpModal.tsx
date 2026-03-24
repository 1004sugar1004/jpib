import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ASSETS } from '../../assets';

import { UserProfile } from '../../types';
import { getLevel } from '../../lib/utils';

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
              <img src={level.img} alt="Level Up" className="w-40 h-40 mx-auto drop-shadow-xl" referrerPolicy="no-referrer" />
            </motion.div>
            <h2 className="text-4xl font-black text-gray-900 mb-2">레벨 업!</h2>
            <p className="text-gray-500 font-bold mb-6">새로운 칭호를 획득했습니다!</p>
            <div className={`inline-block px-8 py-4 rounded-3xl font-black text-2xl ${level.bg} ${level.color} shadow-lg shadow-yellow-100 mb-8`}>
              {level.name}
            </div>
            <button 
              onClick={onClose}
              className="w-full py-5 bg-gray-900 text-white rounded-3xl font-black text-xl hover:bg-gray-800 transition-colors"
            >
              확인
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
