import React, { useRef, useState } from 'react';
import { motion } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { Trophy, Download, ArrowLeft, Award, Star, ShieldCheck, Loader2 } from 'lucide-react';
import { UserProfile } from '../../types';
import { getLevel, formatGradeClass, cn } from '../../lib/utils';
import { toPng } from 'html-to-image';

interface CertificateViewProps {
  profile: UserProfile | null;
  onClose: () => void;
}

export const CertificateView = ({ profile, onClose }: CertificateViewProps) => {
  const level = getLevel(profile?.score || 0);
  const certificateRef = useRef<HTMLDivElement>(null);
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      // Small delay to ensure everything is rendered
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2, // Higher quality
        backgroundColor: '#fdfcf0',
      });
      
      const link = document.createElement('a');
      link.download = `IB_Explorer_Certificate_${profile?.name || 'Explorer'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download certificate:', err);
      alert('자격증 이미지를 저장하는 중 오류가 발생했습니다.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4 py-8 space-y-8">
      <div className="flex items-center justify-between mb-8">
        <Button 
          variant="outline" 
          onClick={onClose} 
          icon={ArrowLeft}
          className="bg-white shadow-sm"
        >
          돌아가기
        </Button>
        <h2 className="text-2xl font-black text-gray-900 flex items-center gap-2">
          <Award className="w-6 h-6 text-indigo-600" />
          탐험가 자격증 발급
        </h2>
        <div className="w-24" /> {/* Spacer */}
      </div>

      <div className="flex flex-col lg:flex-row gap-8 items-start">
        {/* Certificate Preview */}
        <div className="flex-1 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative"
          >
            {/* The Certificate Card */}
            <div 
              ref={certificateRef}
              className="aspect-[1/1.2] w-full bg-[#fdfcf0] rounded-sm shadow-2xl border-[20px] border-[#d4af37] p-12 relative overflow-hidden flex flex-col items-center text-center font-serif"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fdfcf0 100%)',
                boxShadow: '0 0 0 5px #fdfcf0 inset, 0 0 0 6px #d4af37 inset, 0 20px 50px rgba(0,0,0,0.3)'
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-16 h-16 border-t-2 border-l-2 border-[#d4af37]" />
              <div className="absolute top-2 right-2 w-16 h-16 border-t-2 border-r-2 border-[#d4af37]" />
              <div className="absolute bottom-2 left-2 w-16 h-16 border-b-2 border-l-2 border-[#d4af37]" />
              <div className="absolute bottom-2 right-2 w-16 h-16 border-b-2 border-r-2 border-[#d4af37]" />

              {/* Header Text */}
              <div className="mt-4 space-y-1">
                <p className="text-[#b8860b] text-sm tracking-[0.3em] font-medium uppercase">Certificate of Achievement</p>
                <p className="text-gray-800 text-lg font-bold">증평초등학교</p>
              </div>

              {/* Decorative Divider */}
              <div className="w-48 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-6" />
              <div className="flex gap-2 mb-4">
                <div className="w-2 h-2 rotate-45 bg-[#d4af37]" />
                <div className="w-3 h-3 rotate-45 bg-[#d4af37]" />
                <div className="w-2 h-2 rotate-45 bg-[#d4af37]" />
              </div>

              {/* Main Title */}
              <div className="mb-6">
                <h1 className="text-6xl font-black text-[#1a237e] tracking-tight mb-2">IB 탐험가</h1>
                <p className="text-[#b8860b] text-xs tracking-[0.4em] font-bold uppercase">International Baccalaureate · Explorer</p>
              </div>

              {/* Central Seal */}
              <div className="mb-8">
                <div className="w-28 h-28 rounded-full bg-[#1a237e] border-4 border-[#d4af37] flex flex-col items-center justify-center shadow-lg">
                  <span className="text-[#d4af37] text-2xl font-black leading-none">IB</span>
                  <div className="w-12 h-px bg-[#d4af37] my-1" />
                  <span className="text-[#d4af37] text-[8px] font-bold tracking-widest uppercase">PYP · Explorer</span>
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-4 mb-8">
                <p className="text-gray-600 text-lg font-bold leading-relaxed max-w-lg mx-auto">
                  우리 주변의 변화와 연결을 깊이 탐구하고 행동하는 진정한 IB 탐험가임을 인증합니다.
                </p>
                <h2 className="text-6xl font-black text-gray-900 tracking-wider">
                  {profile?.name || '탐험가'}
                </h2>
                <p className="text-2xl font-bold text-gray-700">
                  {formatGradeClass(profile?.grade, profile?.class, profile?.role)}
                </p>
              </div>

              {/* Achievement Box (Simplified to avoid overlap) */}
              <div className="w-full max-w-xl bg-[#f9f7e8] border border-[#d4af37]/30 rounded-lg p-4 mb-8 relative">
                <p className="text-[#b8860b] text-[10px] font-black tracking-[0.3em] uppercase mb-1">Achievement</p>
                <p className="text-gray-800 text-lg font-bold">
                  위 학생은 IB 교육 과정을 성실히 이수하였습니다.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-3 mb-10">
                {['탐구하는 사람', '생각하는 사람', '소통하는 사람', '행동하는 사람'].map((tag) => (
                  <div key={tag} className="px-4 py-1.5 bg-[#1a237e] rounded-full border border-[#d4af37]/50 shadow-sm">
                    <span className="text-[#fdfcf0] text-xs font-bold">{tag}</span>
                  </div>
                ))}
              </div>

              {/* Stats & Rank (Moved to top right with better spacing) */}
              <div className="absolute top-24 right-12 text-right opacity-40">
                <p className="text-[10px] font-black text-[#b8860b] uppercase tracking-widest">Explorer Stats</p>
                <p className="text-sm font-bold text-gray-900">{level.name}</p>
                <p className="text-sm font-bold text-gray-900">{profile?.score} XP</p>
              </div>

              {/* Bottom Section */}
              <div className="mt-auto w-full flex justify-between items-end px-4">
                <div className="w-32" /> {/* Empty space where teacher was */}
                
                <div className="relative">
                  {/* Gold Star Seal */}
                  <div className="w-20 h-20 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                    <div className="w-16 h-16 border border-[#d4af37] rounded-full border-dashed flex items-center justify-center">
                      <Star className="w-8 h-8 text-[#d4af37] fill-[#d4af37]" />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-1">Date of Issue</p>
                  <p className="text-lg font-bold text-gray-900">
                    {(() => {
                      const d = new Date();
                      return `${d.getFullYear()}. ${d.getMonth() + 1}. ${d.getDate()}.`;
                    })()}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        </div>

        {/* Sidebar Controls */}
        <div className="w-full lg:w-72 space-y-6">
          <Card className="p-6 bg-white/80 backdrop-blur-sm border-white/20">
            <h3 className="text-lg font-black text-gray-900 mb-4">자격증 관리</h3>
            <div className="space-y-3">
              <Button 
                className="w-full justify-start gap-3 bg-indigo-600 hover:bg-indigo-700 text-white" 
                icon={isDownloading ? (props: any) => <Loader2 {...props} className={cn(props.className, "animate-spin")} /> : Download}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? '이미지 생성 중...' : '이미지로 저장하기'}
              </Button>
            </div>
          </Card>

          <Card className="p-6 bg-indigo-50 border-indigo-100">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-black text-indigo-900">탐험가 등급</h4>
            </div>
            <p className="text-sm text-indigo-700 font-medium leading-relaxed">
              현재 <span className="font-black">{profile?.name}</span>님은 <span className="font-black text-indigo-900">{level.name}</span> 등급입니다. 더 많은 XP를 모아 더 높은 등급의 자격증을 획득해 보세요!
            </p>
          </Card>

          <div className="flex justify-center">
            <img 
              src="https://i.imgur.com/ToOjCxD.png" 
              alt="Emoticon" 
              className="w-32 h-32 object-contain animate-bounce"
              referrerPolicy="no-referrer"
              onError={(e) => {
                // Fallback if the direct link doesn't work
                (e.target as HTMLImageElement).src = "https://picsum.photos/seed/award/200/200";
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
