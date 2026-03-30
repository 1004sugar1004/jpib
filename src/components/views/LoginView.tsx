import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { ASSETS } from '../../assets';
import { UserCircle, Shield, X } from 'lucide-react';

interface LoginViewProps {
  onLogin: () => void;
}

export const LoginView = ({ onLogin }: LoginViewProps) => {
  const [showPrivacy, setShowPrivacy] = useState(false);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-b from-indigo-50 to-white">
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
        <Button onClick={onLogin} className="w-full py-4 text-lg mb-4" icon={UserCircle}>
          구글 계정으로 시작하기
        </Button>
        
        <button 
          onClick={() => setShowPrivacy(true)}
          className="text-xs text-gray-400 hover:text-indigo-600 flex items-center justify-center gap-1 mx-auto transition-colors"
        >
          <Shield className="w-3 h-3" />
          개인정보처리방침 확인하기
        </button>
      </motion.div>

      <AnimatePresence>
        {showPrivacy && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-[2rem] shadow-2xl max-w-lg w-full max-h-[80vh] overflow-hidden flex flex-col"
            >
              <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-indigo-50/50">
                <h2 className="text-xl font-black text-gray-900 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-indigo-600" />
                  개인정보처리방침
                </h2>
                <button 
                  onClick={() => setShowPrivacy(false)}
                  className="p-2 hover:bg-white rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-400" />
                </button>
              </div>
              
              <div className="p-8 overflow-y-auto text-sm text-gray-600 leading-relaxed space-y-6 text-left">
                <p className="text-xs text-gray-400 mb-4">증평 IB 탐험대(이하 ‘본 서비스’)은(는) 개인정보 보호법 제30조에 따라 정보주체의 개인정보를 보호하고 이와 관련한 고충을 신속하고 원활하게 처리할 수 있도록 하기 위하여 다음과 같이 개인정보 처리방침을 수립·공개합니다.</p>

                <div>
                  <h3 className="font-black text-gray-900 mb-2">제1조 (개인정보의 처리 목적)</h3>
                  <p>본 서비스는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 개인정보 보호법 제18조에 따라 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
                  <ul className="list-disc ml-4 mt-2 space-y-1">
                    <li>학생 회원 관리: 학급 구성원 식별, 실시간 랭킹 시스템 운영</li>
                    <li>서비스 제공: 학습 콘텐츠 제공, 학습 이력 및 XP 기록 저장</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 mb-2">제2조 (개인정보의 처리 및 보유기간)</h3>
                  <p>① 본 서비스는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
                  <p className="mt-2">② 각각의 개인정보 처리 및 보유 기간은 다음과 같습니다.</p>
                  <ul className="list-disc ml-4 mt-1">
                    <li>보유 기간: <strong>해당 학년도 종료 시(익년 2월 말)</strong> 또는 학생의 전학/졸업 시까지</li>
                    <li>파기 시점: 보유 기간 종료 후 지체 없이 파기</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 mb-2">제3조 (처리하는 개인정보 항목)</h3>
                  <p>본 서비스는 학습 지원을 위해 필요한 최소한의 개인정보만을 수집합니다.</p>
                  <ul className="list-disc ml-4 mt-2">
                    <li>수집 항목: 이름, 학년, 반, 구글 계정 정보(이메일), 학습 점수(XP)</li>
                    <li>수집하지 않는 항목: 주민등록번호, 주소, 전화번호 등 민감 정보</li>
                  </ul>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 mb-2">제4조 (만 14세 미만 아동의 개인정보 처리)</h3>
                  <p>① 본 서비스는 만 14세 미만 아동의 개인정보를 처리하기 위하여 학교 가정통신문 또는 가입 단계에서 법정대리인의 동의를 확인합니다.</p>
                  <p>② 법정대리인이 동의하지 않는 경우, 서비스 이용이 제한될 수 있습니다.</p>
                </div>

                <div>
                  <h3 className="font-black text-gray-900 mb-2">제5조 (개인정보의 안전성 확보조치)</h3>
                  <p>본 서비스는 보안 인증을 획득한 전문 클라우드 플랫폼(Google Firebase)을 기반으로 운영되며, 전 구간 보안 통신(HTTPS)을 사용하여 데이터를 암호화하여 전송합니다.</p>
                </div>

                <div className="pt-4 border-t border-gray-100">
                  <h3 className="font-black text-gray-900 mb-2">제6조 (개인정보 보호책임자)</h3>
                  <p>본 서비스는 개인정보 처리에 관한 업무를 총괄해서 책임지는 보호책임자를 다음과 같이 지정하고 있습니다.</p>
                  <div className="mt-2 p-3 bg-gray-50 rounded-xl space-y-1 text-xs">
                    <p><strong>성명:</strong> 김혜진 (개발자)</p>
                    <p><strong>소속:</strong> 증평초등학교</p>
                    <p><strong>직위:</strong> 교사</p>
                    <p><strong>연락처:</strong> 1004sugar1004@gmail.com</p>
                  </div>
                </div>

                <p className="text-[10px] text-gray-400 pt-4">이 개인정보 처리방침은 2026년 3월 27일부터 적용됩니다.</p>
              </div>

              <div className="p-6 bg-gray-50 border-t border-gray-100">
                <Button onClick={() => setShowPrivacy(false)} className="w-full">
                  확인했습니다
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
