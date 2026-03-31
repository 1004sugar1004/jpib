import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Save, User, GraduationCap, School } from 'lucide-react';
import { Button } from './Button';
import { Card } from './Card';
import { UserProfile } from '../../types';

interface ProfileEditModalProps {
  show: boolean;
  onClose: () => void;
  profile: UserProfile | null;
  onUpdate: (data: Partial<UserProfile>) => Promise<void>;
}

export const ProfileEditModal = ({ show, onClose, profile, onUpdate }: ProfileEditModalProps) => {
  const extractNumber = (val: string | undefined) => {
    if (!val) return '';
    const matches = val.toString().match(/\d+/);
    return matches ? matches[0] : '';
  };

  const [name, setName] = useState(profile?.name || '');
  const [grade, setGrade] = useState(extractNumber(profile?.grade) || '1');
  const [className, setClassName] = useState(extractNumber(profile?.class) || '1');
  const [isSaving, setIsSaving] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await onUpdate({
        name,
        grade: `${grade}학년`,
        class: `${className}반`,
      });
      onClose();
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('정보 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-full max-w-md"
          >
            <Card className="p-8 relative overflow-hidden bg-white border-none shadow-2xl">
              <button
                onClick={onClose}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6" />
              </button>

              <div className="flex items-center gap-4 mb-8">
                <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-2xl font-black text-gray-900">정보 수정</h3>
                  <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest">EDIT PROFILE</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">이름</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold"
                      placeholder="이름을 입력하세요"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">학년</label>
                    <div className="relative">
                      <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={grade}
                        onChange={(e) => setGrade(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold appearance-none"
                      >
                        {[1, 2, 3, 4, 5, 6].map((g) => (
                          <option key={g} value={g.toString()}>{g}학년</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-black text-gray-400 uppercase tracking-widest ml-1">반</label>
                    <div className="relative">
                      <School className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <select
                        value={className}
                        onChange={(e) => setClassName(e.target.value)}
                        required
                        className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:border-indigo-500 focus:bg-white outline-none transition-all font-bold appearance-none"
                      >
                        {Array.from({ length: 15 }, (_, i) => i + 1).map((c) => (
                          <option key={c} value={c.toString()}>{c}반</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                <Button
                  type="submit"
                  disabled={isSaving}
                  className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-lg shadow-indigo-100 font-black text-lg flex items-center justify-center gap-2"
                >
                  {isSaving ? (
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                      className="w-6 h-6 border-2 border-white border-t-transparent rounded-full"
                    />
                  ) : (
                    <>
                      <Save className="w-5 h-5" />
                      저장하기
                    </>
                  )}
                </Button>
              </form>
            </Card>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
