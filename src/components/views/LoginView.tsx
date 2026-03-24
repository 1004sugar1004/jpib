import React from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { UserCircle } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView = ({ onLogin }: LoginViewProps) => (
  <div className="min-h-screen flex items-center justify-center p-4">
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white/90 backdrop-blur-md p-8 rounded-[3rem] shadow-2xl max-w-md w-full text-center relative overflow-hidden border border-white/20"
    >
      <div className="absolute -top-10 -right-10 opacity-10">
        <img src={ASSETS.quiz.decoration} alt="Decoration" className="w-40 h-40" referrerPolicy="no-referrer" />
      </div>
      <div className="w-24 h-24 bg-indigo-100 rounded-3xl flex items-center justify-center mx-auto mb-6 overflow-hidden">
        <img src={ASSETS.quiz.logo} alt="Logo" className="w-20 h-20 object-contain" referrerPolicy="no-referrer" />
      </div>
      <h1 className="text-3xl font-black text-gray-900 mb-2">증평 IB 탐험대</h1>
      <p className="text-gray-600 mb-8">IB 이론을 배우고 퀴즈를 풀며 탐험을 시작해볼까요?</p>
      <Button onClick={onLogin} className="w-full py-4 text-lg" icon={UserCircle}>
        구글 계정으로 시작하기
      </Button>
    </motion.div>
  </div>
);
