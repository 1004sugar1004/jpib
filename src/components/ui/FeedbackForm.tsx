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
    <section className="relative z-10 max-w-4xl mx-auto px-4 mb-12">
      <div className="bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 md:p-12 border-4 border-white shadow-2xl shadow-indigo-100/50">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="flex-1 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-indigo-100 text-indigo-700 px-4 py-1.5 rounded-full text-sm font-black mb-4">
              <MessageSquare className="w-4 h-4" />
              <span>의견 보내기</span>
            </div>
            <h2 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
              여러분의 소중한 의견을 기다립니다!
            </h2>
            <p className="text-gray-500 font-medium leading-relaxed">
              사이트 개선이나 새로운 게임 아이디어 등 어떤 의견이라도 좋습니다.<br />
              좋은 의견을 주신 <span className="text-indigo-600 font-bold">선생님께는 기프티콘</span>을,<br />
              <span className="text-rose-600 font-bold">학생들에게는 추첨을 통해 과자</span>를 선물로 드려요!
            </p>
          </div>

          <div className="w-full md:w-[400px]">
            {isSubmitted ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="flex flex-col items-center justify-center py-12 text-center"
              >
                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                </div>
                <h3 className="text-xl font-black text-gray-900 mb-2">제출 완료!</h3>
                <p className="text-gray-500 font-bold">소중한 의견 감사합니다.</p>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                  <textarea
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder="여기에 의견을 자유롭게 적어주세요..."
                    className="w-full h-32 p-6 bg-gray-50 border-2 border-gray-100 rounded-3xl focus:ring-4 focus:ring-indigo-100 focus:border-indigo-300 outline-none transition-all font-medium resize-none"
                    required
                  />
                </div>
                <Button
                  type="submit"
                  disabled={isSubmitting || !content.trim()}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl font-black text-lg shadow-lg shadow-indigo-200 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <div className="w-6 h-6 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    <>
                      <Send className="w-5 h-5" />
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
