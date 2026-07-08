import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, MessageSquare, CheckCircle2 } from 'lucide-react';
import { db } from '../../firebase';
import { collection, addDoc } from 'firebase/firestore';
import { UserProfile } from '../../types';
import { Button } from './Button';

interface FeedbackFormProps {
  profile: UserProfile | null;
}

export const FeedbackForm = ({ profile }: FeedbackFormProps) => {
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || !profile) return;

    setIsSubmitting(true);
    try {
      await addDoc(collection(db, 'feedback'), {
        uid: profile.uid,
        userName: profile.name,
        grade: profile.grade,
        class: profile.class,
        content: content.trim(),
        timestamp: Date.now()
      });
      setIsSubmitted(true);
      setContent('');
      setTimeout(() => setIsSubmitted(false), 5000);
    } catch (error) {
      console.error("Failed to submit feedback", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!profile) return null;

  return (
    <section className="relative z-10 max-w-2xl mx-auto px-4 mb-8">
      <div className="bg-white/95 backdrop-blur-xl rounded-[2rem] p-6 md:p-8 border-2 border-indigo-100 shadow-xl shadow-indigo-100/30">
        <div className="flex flex-col gap-5">
          <div className="text-center">
            <div className="inline-flex items-center gap-1.5 bg-indigo-50 text-indigo-700 px-3 py-1 rounded-full text-xs font-black mb-2">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>의견 보내기</span>
            </div>
            <h2 className="text-xl font-black text-gray-900 mb-2 tracking-tight">
              소중한 의견을 기다립니다!
            </h2>
            <p className="text-xs text-gray-500 font-semibold leading-relaxed">
              사이트 개선이나 새로운 게임 등 어떤 의견이라도 좋습니다.<br />
              좋은 의견을 주신 <span className="text-indigo-600 font-bold">선생님께는 기프티콘</span>을, <span className="text-rose-600 font-bold">학생들에겐 과자 추첨선물</span>을 드려요!
            </p>
          </div>

          <div className="w-full">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-6 text-center"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-600" />
                </div>
                <h3 className="text-base font-black text-gray-900 mb-1">제출 완료!</h3>
                <p className="text-xs text-gray-500 font-bold">소중한 의견 감사합니다.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="여기에 의견을 자유롭게 적어주세요..."
                    className="w-full h-24 p-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all text-xs font-medium resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-black text-sm shadow-md flex items-center justify-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      <span>의견 제출하기</span>
                    </>
                  )}
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};
