import React, { useState } from 'react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { cn } from '../../lib/utils';
import { School, User } from 'lucide-react';

interface ProfileSetupViewProps {
  onCreateProfile: (e: React.FormEvent<HTMLFormElement>) => void;
}

export const ProfileSetupView = ({ onCreateProfile }: ProfileSetupViewProps) => {
  const [role, setRole] = useState<'student' | 'teacher'>('student');

  console.log('Current role selection:', role);

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <Card className="max-w-md w-full p-10 bg-white/90 backdrop-blur-md rounded-[3rem] border-white/20 shadow-2xl">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 text-center">프로필 설정</h2>
        
        <div className="flex gap-2 mb-6 p-1 bg-gray-100 rounded-2xl">
          <button
            type="button"
            onClick={() => {
              console.log('Setting role to student');
              setRole('student');
            }}
            className={cn(
              "flex-1 py-2 rounded-xl font-bold transition-all",
              role === 'student' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            학생(Student)
          </button>
          <button
            type="button"
            onClick={() => {
              console.log('Setting role to teacher');
              setRole('teacher');
            }}
            className={cn(
              "flex-1 py-2 rounded-xl font-bold transition-all",
              role === 'teacher' ? "bg-white text-indigo-600 shadow-sm" : "text-gray-500 hover:text-gray-700"
            )}
          >
            교사(Teacher)
          </button>
        </div>

        <form onSubmit={onCreateProfile} className="space-y-4">
          <input type="hidden" name="role" value={role} />
          
          {role === 'student' ? (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">학년</label>
                <div className="relative">
                  <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select name="grade" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none font-bold">
                    {[1, 2, 3, 4, 5, 6].map(g => (
                      <option key={g} value={`${g}학년`}>{g}학년</option>
                    ))}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">반</label>
                <div className="relative">
                  <School className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
                  <select name="class" required className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none bg-white appearance-none font-bold">
                    {Array.from({ length: 15 }, (_, i) => i + 1).map(c => (
                      <option key={c} value={`${c}반`}>{c}반</option>
                    ))}
                  </select>
                </div>
              </div>
            </>
          ) : (
            <div className="p-4 bg-indigo-50 rounded-2xl border border-indigo-100 mb-4">
              <p className="text-indigo-700 text-sm font-medium text-center">
                선생님으로 가입하여 학생들과 함께 탐험에 참여합니다!
              </p>
              <input type="hidden" name="grade" value="교사" />
              <input type="hidden" name="class" value="교사" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">이름</label>
            <div className="relative">
              <User className="absolute left-3 top-3 w-5 h-5 text-gray-400" />
              <input name="name" required placeholder="이름을 입력하세요" className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-indigo-500 outline-none" />
            </div>
          </div>
          <Button type="submit" className="w-full mt-4">탐험 시작하기</Button>
        </form>
      </Card>
    </div>
  );
};
