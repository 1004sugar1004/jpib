import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/Button';
import { Card } from '../ui/Card';
import { 
  Trophy, 
  Download, 
  ArrowLeft, 
  Award, 
  Star, 
  Loader2, 
  Camera, 
  Upload, 
  RotateCcw, 
  Sparkles, 
  Check, 
  AlertCircle,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserProfile } from '../../types';
import { getLevel, formatGradeClass, cn } from '../../lib/utils';
import { toPng } from 'html-to-image';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

interface CertificateViewProps {
  profile: UserProfile | null;
  isGuest?: boolean;
  onUpdateProfile?: (updated: UserProfile) => void;
  onClose: () => void;
}

// 7 Standard IB Learner Profiles for student selection
const LEARNER_PROFILES = [
  { id: '탐구하는 사람', label: '탐구하는 사람 (Inquirer)', color: 'from-amber-400 to-orange-500', desc: '새로운 것에 호기심을 갖고 질문하며 탐구해요.' },
  { id: '생각하는 사람', label: '생각하는 사람 (Thinker)', color: 'from-sky-400 to-indigo-500', desc: '깊이 생각하고 창의적으로 문제를 해결해요.' },
  { id: '소통하는 사람', label: '소통하는 사람 (Communicator)', color: 'from-emerald-400 to-teal-500', desc: '생각을 자신 있게 표현하고 다른 사람과 잘 대화해요.' },
  { id: '행동하는 사람', label: '행동하는 사람 (Risk-taker)', color: 'from-rose-400 to-red-500', desc: '두려움 없이 새로운 도전에 용기 있게 행동해요.' },
  { id: '지식 있는 사람', label: '지식 있는 사람 (Knowledgeable)', color: 'from-purple-400 to-violet-500', desc: '풍부한 지식을 쌓고 다방면으로 배움을 깊게 해요.' },
  { id: '성찰하는 사람', label: '성찰하는 사람 (Reflective)', color: 'from-blue-400 to-indigo-600', desc: '나의 배움과 행동을 스스로 되돌아보고 발전해요.' },
  { id: '배려하는 사람', label: '배려하는 사람 (Caring)', color: 'from-pink-400 to-rose-500', desc: '친구를 돕고 따뜻한 마음으로 주변을 아껴요.' },
];

export const CertificateView = ({ profile, isGuest, onUpdateProfile, onClose }: CertificateViewProps) => {
  const level = getLevel(profile?.score || 0);
  const certificateRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Layout States
  const [isDownloading, setIsDownloading] = useState(false);
  const [showCaricature, setShowCaricature] = useState(!!profile?.caricatureSvg);
  
  // AI Caricature States
  const [selectedProfile, setSelectedProfile] = useState(LEARNER_PROFILES[0].id);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  
  // Quota States
  const [userRemainingToday, setUserRemainingToday] = useState<number | null>(null);
  const [isCheckingQuota, setIsCheckingQuota] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Get current local date string (YYYY-MM-DD)
  const getTodayString = () => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  };

  // Fetch remaining shoots for the user on mount
  useEffect(() => {
    const fetchUserQuota = async () => {
      if (!profile?.uid) return;
      
      const today = getTodayString();
      if (isGuest) {
        const storedCount = localStorage.getItem(`guest_caricature_count_${today}`);
        const count = storedCount ? parseInt(storedCount, 10) || 0 : 0;
        setUserRemainingToday(Math.max(0, 3 - count));
        return;
      }

      try {
        const userUsageRef = doc(db, 'caricatureUsage', `${profile.uid}_${today}`);
        let userDoc;
        try {
          userDoc = await getDoc(userUsageRef);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.GET, `caricatureUsage/${profile.uid}_${today}`);
          return;
        }
        const count = userDoc && userDoc.exists() ? userDoc.data().count || 0 : 0;
        setUserRemainingToday(Math.max(0, 3 - count));
      } catch (err) {
        console.error('Error fetching user quota:', err);
      }
    };
    fetchUserQuota();
  }, [profile?.uid, isGuest]);

  // Cleanup camera streams on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  // Certificate Download
  const handleDownload = async () => {
    if (!certificateRef.current) return;
    
    setIsDownloading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 150));
      
      const dataUrl = await toPng(certificateRef.current, {
        cacheBust: true,
        pixelRatio: 2, // High resolution
        backgroundColor: '#fdfcf0',
      });
      
      const link = document.createElement('a');
      link.download = `IB_Explorer_Certificate_${profile?.name || 'Explorer'}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to download certificate:', err);
    } finally {
      setIsDownloading(false);
    }
  };

  // Start HTML5 Camera Stream
  const handleStartCamera = async () => {
    setErrorMessage(null);
    setCapturedImage(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 320, height: 320, facingMode: 'user' },
        audio: false
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setCameraStream(stream);
      setIsCameraActive(true);
    } catch (err) {
      console.error('Camera access error:', err);
      setErrorMessage('카메라 접근 권한이 없거나 지원하지 않는 브라우저입니다.');
    }
  };

  // Stop Camera Stream
  const handleStopCamera = () => {
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => track.stop());
      setCameraStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture Frame from Video Stream
  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 320);
        const dataUrl = canvas.toDataURL('image/png');
        setCapturedImage(dataUrl);
        handleStopCamera();
      }
    }
  };

  // File Upload Helper
  const processFile = (file: File) => {
    setErrorMessage(null);
    if (!file.type.startsWith('image/')) {
      setErrorMessage('이미지 파일만 업로드할 수 있습니다.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      if (e.target?.result) {
        setCapturedImage(e.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  // Drag & Drop Handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  // Call Server-Side Gemini API to generate the Caricature
  const generateCaricature = async () => {
    if (!profile?.uid) {
      setErrorMessage('로그인이 필요합니다.');
      return;
    }
    if (!capturedImage) {
      setErrorMessage('사진 촬영이나 업로드가 필요합니다.');
      return;
    }

    setErrorMessage(null);
    setIsCheckingQuota(true);

    try {
      const today = getTodayString();
      let userCount = 0;
      let globalCount = 0;
      let userDoc: any = null;
      let globalDoc: any = null;

      if (isGuest) {
        const storedCount = localStorage.getItem(`guest_caricature_count_${today}`);
        userCount = storedCount ? parseInt(storedCount, 10) || 0 : 0;
        if (userCount >= 3) {
          setErrorMessage('오늘의 개인 생성 횟수(3회)를 초과했습니다. 내일 다시 시도해 주세요!');
          setIsCheckingQuota(false);
          return;
        }
      } else {
        // 1. Validate User Local Limit
        const userUsageRef = doc(db, 'caricatureUsage', `${profile.uid}_${today}`);
        try {
          userDoc = await getDoc(userUsageRef);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.GET, `caricatureUsage/${profile.uid}_${today}`);
          return;
        }
        userCount = userDoc && userDoc.exists() ? userDoc.data().count || 0 : 0;
        
        if (userCount >= 3) {
          setErrorMessage('오늘의 개인 생성 횟수(3회)를 초과했습니다. 내일 다시 시도해 주세요!');
          setIsCheckingQuota(false);
          return;
        }

        // 2. Validate Global Daily Limit
        const globalUsageRef = doc(db, 'caricatureUsage', `global_${today}`);
        try {
          globalDoc = await getDoc(globalUsageRef);
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.GET, `caricatureUsage/global_${today}`);
          return;
        }
        globalCount = globalDoc && globalDoc.exists() ? globalDoc.data().count || 0 : 0;

        if (globalCount >= 50) {
          setErrorMessage('오늘 시스템 전체 발급 한도(50회)가 조기 마감되었습니다. 내일 다시 시도해 주세요!');
          setIsCheckingQuota(false);
          return;
        }
      }

      setIsCheckingQuota(false);
      setIsGenerating(true);

      // 3. Make server-side API call
      const response = await fetch('/api/caricature', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: capturedImage,
          learnerProfile: selectedProfile
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || '캐리커쳐 생성 요청에 실패했습니다.');
      }

      const data = await response.json();
      if (!data.svg) {
        throw new Error('올바른 캐릭터 그래픽이 반환되지 않았습니다.');
      }

      const generatedSvg = data.svg;

      if (isGuest) {
        localStorage.setItem(`guest_caricature_count_${today}`, String(userCount + 1));
      } else {
        // 4. Update quotas in Firestore
        const userUsageRef = doc(db, 'caricatureUsage', `${profile.uid}_${today}`);
        try {
          if (userDoc && userDoc.exists()) {
            await updateDoc(userUsageRef, { count: userCount + 1 });
          } else {
            await setDoc(userUsageRef, { count: 1, userId: profile.uid, date: today });
          }
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `caricatureUsage/${profile.uid}_${today}`);
          return;
        }

        const globalUsageRef = doc(db, 'caricatureUsage', `global_${today}`);
        try {
          if (globalDoc && globalDoc.exists()) {
            await updateDoc(globalUsageRef, { count: globalCount + 1 });
          } else {
            await setDoc(globalUsageRef, { count: 1, date: today });
          }
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `caricatureUsage/global_${today}`);
          return;
        }

        // 5. Update user profile with caricatureSvg in Firestore
        const userRef = doc(db, 'users', profile.uid);
        const publicRef = doc(db, 'publicProfiles', profile.uid);
        
        try {
          await updateDoc(userRef, { caricatureSvg: generatedSvg });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `users/${profile.uid}`);
          return;
        }

        try {
          await updateDoc(publicRef, { caricatureSvg: generatedSvg });
        } catch (dbErr) {
          handleFirestoreError(dbErr, OperationType.WRITE, `publicProfiles/${profile.uid}`);
          return;
        }
      }

      // Update remaining quota locally
      setUserRemainingToday(Math.max(0, 3 - (userCount + 1)));

      // Trigger profile state update on parent
      const updatedProfile: UserProfile = {
        ...profile,
        caricatureSvg: generatedSvg
      };
      if (onUpdateProfile) {
        onUpdateProfile(updatedProfile);
      }

      setShowCaricature(true);
      setCapturedImage(null);
    } catch (err: any) {
      console.error('Caricature generation failure:', err);
      setErrorMessage(err.message || '네트워크 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsGenerating(false);
      setIsCheckingQuota(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4 py-8 space-y-8" id="certificate-corner">
      {/* Header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <Button 
          variant="outline" 
          onClick={onClose} 
          icon={ArrowLeft}
          className="bg-white shadow-sm self-start"
        >
          돌아가기
        </Button>
        <h2 className="text-3xl font-black text-gray-900 flex items-center gap-2">
          <Award className="w-8 h-8 text-indigo-600 animate-pulse" />
          IB 탐험가 자격증 발급
        </h2>
        <div className="w-24 hidden md:block" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* LEFT COLUMN: Certificate Preview Card (8 cols) */}
        <div className="lg:col-span-7 xl:col-span-8 w-full">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="relative"
          >
            {/* The Certificate Card container */}
            <div 
              ref={certificateRef}
              className="aspect-[1/1.25] w-full bg-[#fdfcf0] rounded-xl shadow-2xl border-[16px] md:border-[22px] border-[#d4af37] p-6 md:p-10 relative overflow-hidden flex flex-col items-center text-center font-serif"
              style={{
                backgroundImage: 'radial-gradient(circle at center, #ffffff 0%, #fdfcf0 100%)',
                boxShadow: '0 0 0 5px #fdfcf0 inset, 0 0 0 6px #d4af37 inset, 0 15px 40px rgba(0,0,0,0.15)'
              }}
            >
              {/* Corner Ornaments */}
              <div className="absolute top-2 left-2 w-12 h-12 border-t-2 border-l-2 border-[#d4af37]" />
              <div className="absolute top-2 right-2 w-12 h-12 border-t-2 border-r-2 border-[#d4af37]" />
              <div className="absolute bottom-2 left-2 w-12 h-12 border-b-2 border-l-2 border-[#d4af37]" />
              <div className="absolute bottom-2 right-2 w-12 h-12 border-b-2 border-r-2 border-[#d4af37]" />

              {/* Header Text */}
              <div className="mt-2 space-y-0.5">
                <p className="text-[#b8860b] text-[10px] md:text-xs tracking-[0.25em] font-medium uppercase">Certificate of Achievement</p>
                <p className="text-gray-800 text-sm md:text-base font-bold">증평초등학교</p>
              </div>

              {/* Decorative Divider */}
              <div className="w-36 md:w-48 h-px bg-gradient-to-r from-transparent via-[#d4af37] to-transparent my-3 md:my-4" />
              <div className="flex gap-1.5 mb-3">
                <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
                <div className="w-2.5 h-2.5 rotate-45 bg-[#d4af37]" />
                <div className="w-1.5 h-1.5 rotate-45 bg-[#d4af37]" />
              </div>

              {/* Main Title */}
              <div className="mb-3">
                <h1 className="text-4xl md:text-5xl font-black text-[#1a237e] tracking-tight mb-1">IB 탐험가</h1>
                <p className="text-[#b8860b] text-[9px] md:text-[10px] tracking-[0.3em] font-bold uppercase">International Baccalaureate · Explorer</p>
              </div>

              {/* Central Level Image or generated Caricature SVG */}
              <div className="mb-4 md:mb-6 relative flex flex-col items-center justify-center">
                <div className="w-32 h-32 md:w-36 md:h-36 rounded-2xl bg-white border-4 border-[#d4af37] flex items-center justify-center shadow-xl overflow-hidden p-1.5">
                  {showCaricature && profile?.caricatureSvg ? (
                    <div 
                      dangerouslySetInnerHTML={{ __html: profile.caricatureSvg }} 
                      className="w-full h-full flex items-center justify-center [&>svg]:w-full [&>svg]:h-full [&>svg]:object-contain"
                    />
                  ) : (
                    <img 
                      src={level.img} 
                      alt={level.name} 
                      className="w-24 h-24 md:w-28 md:h-28 object-contain" 
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>
                <div className={cn(
                  "absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-[9px] md:text-[10px] font-black shadow-md border border-white whitespace-nowrap",
                  showCaricature && profile?.caricatureSvg ? 'bg-indigo-600 text-white' : `${level.bg} ${level.color}`
                )}>
                  {showCaricature && profile?.caricatureSvg ? '나만의 AI 캐리커쳐' : level.name}
                </div>
              </div>

              {/* Student Info */}
              <div className="space-y-2 mb-4 md:mb-6">
                <p className="text-gray-600 text-sm md:text-base font-bold leading-relaxed max-w-sm md:max-w-md mx-auto">
                  우리 주변의 변화와 연결을 깊이 탐구하고 행동하는 진정한 IB 탐험가임을 인증합니다.
                </p>
                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-wider">
                  {profile?.name || '탐험가'}
                </h2>
                <p className="text-lg md:text-xl font-bold text-gray-700">
                  {formatGradeClass(profile?.grade, profile?.class, profile?.role)}
                </p>
              </div>

              {/* Achievement Box */}
              <div className="w-full max-w-md bg-[#f9f7e8] border border-[#d4af37]/30 rounded-lg p-2.5 md:p-3 mb-4 md:mb-6">
                <p className="text-[#b8860b] text-[8px] md:text-[10px] font-black tracking-[0.2em] uppercase mb-0.5">Achievement</p>
                <p className="text-gray-800 text-sm md:text-base font-bold">
                  위 학생은 IB 교육 과정을 성실히 이수하였습니다.
                </p>
              </div>

              {/* Badges */}
              <div className="flex flex-wrap justify-center gap-2 mb-6 md:mb-8">
                {['탐구하는 사람', '생각하는 사람', '소통하는 사람', '행동하는 사람'].map((tag) => (
                  <div key={tag} className="px-3 py-1 bg-[#1a237e] rounded-full border border-[#d4af37]/40 shadow-sm">
                    <span className="text-[#fdfcf0] text-[10px] md:text-xs font-bold">{tag}</span>
                  </div>
                ))}
              </div>

              {/* Stats Overlay (right section) */}
              <div className="absolute top-20 md:top-24 right-6 md:right-10 text-right opacity-45">
                <p className="text-[8px] md:text-[9px] font-black text-[#b8860b] uppercase tracking-widest">Explorer Stats</p>
                <p className="text-xs font-bold text-gray-900">{level.name}</p>
                <p className="text-xs font-bold text-gray-900">{(profile?.score || 0).toLocaleString()} XP</p>
              </div>

              {/* Bottom Stamp & Date */}
              <div className="mt-auto w-full flex justify-between items-end px-2">
                <div className="w-24" /> {/* Spacer */}
                
                <div className="relative">
                  {/* Gold Star Seal */}
                  <div className="w-14 h-14 md:w-18 md:h-18 border-2 border-[#d4af37] rounded-full flex items-center justify-center">
                    <div className="w-11 h-11 md:w-14 md:h-14 border border-[#d4af37] rounded-full border-dashed flex items-center justify-center">
                      <Star className="w-5 h-5 md:w-6 md:h-6 text-[#d4af37] fill-[#d4af37]" />
                    </div>
                  </div>
                </div>

                <div className="text-right">
                  <p className="text-[8px] md:text-[9px] font-black text-gray-500 uppercase tracking-widest mb-0.5">Date of Issue</p>
                  <p className="text-sm md:text-base font-bold text-gray-900">
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

        {/* RIGHT COLUMN: Controls & Caricature Studio (4/5 cols) */}
        <div className="lg:col-span-5 xl:col-span-4 space-y-6">
          
          {/* Action Card 1: Certificate Management */}
          <Card className="p-5 bg-white shadow-md border border-gray-100 rounded-2xl">
            <h3 className="text-lg font-black text-gray-900 mb-3">자격증 관리</h3>
            
            <div className="space-y-3">
              {/* Display toggle button if caricature is available */}
              {profile?.caricatureSvg && (
                <Button
                  variant="outline"
                  className="w-full justify-start gap-3 border-gray-200"
                  icon={showCaricature ? EyeOff : Eye}
                  onClick={() => setShowCaricature(!showCaricature)}
                >
                  {showCaricature ? '기본 등급 이미지로 전환' : '자격증에 캐리커쳐 표시'}
                </Button>
              )}

              <Button 
                className="w-full justify-start gap-3 bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-100" 
                icon={isDownloading ? (props: any) => <Loader2 {...props} className={cn(props.className, "animate-spin")} /> : Download}
                onClick={handleDownload}
                disabled={isDownloading}
              >
                {isDownloading ? '자격증 이미지 생성 중...' : '자격증 이미지 다운로드'}
              </Button>
            </div>
          </Card>

          {/* Action Card 2: AI Caricature Maker Studio */}
          <Card className="p-5 bg-white shadow-md border border-indigo-100 rounded-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 bg-indigo-50/50 rounded-bl-2xl">
              <Sparkles className="w-5 h-5 text-indigo-500 animate-spin" style={{ animationDuration: '6s' }} />
            </div>

            <h3 className="text-lg font-black text-gray-900 mb-1 flex items-center gap-1.5">
              🎨 AI 캐리커쳐 스튜디오
            </h3>
            <p className="text-xs text-gray-500 font-bold mb-4">
              나의 실제 얼굴 사진을 분석하여 멋진 IB 학습자상 맞춤형 캐릭터로 드로잉해 줍니다.
            </p>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs font-bold flex items-start gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Stage A: Selection & Input controls */}
            {!isGenerating && (
              <div className="space-y-4">
                
                {/* 1. Select Learner Profile Atmosphere */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">
                    1단계: 표현하고 싶은 IB 학습자상 선택
                  </label>
                  <select
                    value={selectedProfile}
                    onChange={(e) => setSelectedProfile(e.target.value)}
                    className="w-full p-2.5 text-xs font-bold border border-gray-200 rounded-xl bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                  >
                    {LEARNER_PROFILES.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                  <p className="text-[10px] text-indigo-600 font-extrabold mt-1">
                    ✨ {LEARNER_PROFILES.find(p => p.id === selectedProfile)?.desc}
                  </p>
                </div>

                {/* 2. Photo Shooting or Upload area */}
                <div>
                  <label className="block text-xs font-black text-gray-700 mb-1.5">
                    2단계: 얼굴 사진 촬영 또는 업로드
                  </label>

                  {/* Camera active view */}
                  {isCameraActive ? (
                    <div className="relative aspect-square w-full max-w-[240px] mx-auto bg-black rounded-2xl overflow-hidden border-2 border-indigo-500">
                      <video 
                        ref={videoRef} 
                        className="w-full h-full object-cover scale-x-[-1]" 
                        playsInline 
                        muted 
                      />
                      {/* Oval mask helper */}
                      <div className="absolute inset-0 border-[16px] border-black/40 rounded-full pointer-events-none" />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
                        <Button 
                          size="sm" 
                          onClick={handleCapture}
                          className="bg-indigo-600 hover:bg-indigo-700 text-white text-[11px] font-black h-8 px-3 rounded-full cursor-pointer"
                        >
                          찰칵! 촬영
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={handleStopCamera}
                          className="bg-white/90 hover:bg-white text-gray-800 text-[11px] font-black h-8 px-3 rounded-full cursor-pointer"
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : capturedImage ? (
                    /* Captured/Uploaded Preview */
                    <div className="relative aspect-square w-full max-w-[180px] mx-auto rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center group">
                      <img 
                        src={capturedImage} 
                        alt="Captured Face" 
                        className="w-full h-full object-cover" 
                      />
                      <button 
                        onClick={() => setCapturedImage(null)}
                        className="absolute top-2 right-2 p-1.5 bg-black/60 hover:bg-black text-white rounded-full transition-colors cursor-pointer"
                        title="다시 찍기"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    /* Inactive Dropzone / Choice section */
                    <div 
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                      onClick={() => fileInputRef.current?.click()}
                      className={cn(
                        "p-4 border-2 border-dashed border-gray-200 hover:border-indigo-400 bg-gray-50/50 rounded-xl text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 min-h-[140px]",
                        isDragging && "border-indigo-500 bg-indigo-50/20"
                      )}
                    >
                      <Camera className="w-6 h-6 text-indigo-500 animate-pulse" />
                      <span className="text-[11px] text-gray-700 font-black">
                        여기를 눌러 카메라를 켜거나
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        사진 파일을 끌어서 놓으세요 (Drop)
                      </span>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        onChange={handleFileChange} 
                        accept="image/*" 
                        className="hidden" 
                      />
                    </div>
                  )}
                  
                  {/* Standalone Button to start camera */}
                  {!isCameraActive && !capturedImage && (
                    <div className="mt-2.5 flex justify-center">
                      <Button
                        onClick={handleStartCamera}
                        variant="outline"
                        size="sm"
                        icon={Camera}
                        className="text-xs py-1.5 border-indigo-200 text-indigo-700 hover:bg-indigo-50 cursor-pointer font-bold"
                      >
                        실시간 카메라 켜기
                      </Button>
                    </div>
                  )}
                </div>

                {/* 3. Action Trigger button with quota stats */}
                <div className="pt-2 border-t border-gray-100">
                  <div className="flex justify-between items-center text-[11px] font-bold text-gray-500 mb-2">
                    <span>💳 하루 포토샷 할당량 (개인)</span>
                    <span className="text-indigo-600 font-extrabold">
                      {userRemainingToday !== null ? `남은 횟수: ${userRemainingToday}회 / 3회` : '3회 제한'}
                    </span>
                  </div>

                  <Button
                    onClick={generateCaricature}
                    disabled={isCheckingQuota || !capturedImage || (userRemainingToday !== null && userRemainingToday <= 0)}
                    className={cn(
                      "w-full py-3 text-sm font-black text-white rounded-xl shadow-md flex items-center justify-center gap-2",
                      capturedImage && (userRemainingToday === null || userRemainingToday > 0)
                        ? "bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:from-indigo-600 hover:via-purple-600 hover:to-pink-600"
                        : "bg-gray-300 border-none shadow-none cursor-not-allowed"
                    )}
                  >
                    <Sparkles className="w-4 h-4 animate-bounce" />
                    AI 캐리커쳐 그리기 시작! 🪄
                  </Button>
                </div>

              </div>
            )}

            {/* Stage B: Generator Loading screen with custom reassuring messages */}
            {isGenerating && (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
                <Loader2 className="w-12 h-12 text-indigo-600 animate-spin" />
                <div className="space-y-1.5">
                  <h4 className="text-sm font-black text-gray-800">
                    얼굴 특징을 스케치하는 중... ✏️
                  </h4>
                  <p className="text-[11px] text-gray-500 font-bold max-w-xs leading-relaxed animate-pulse">
                    AI가 사진에서 얼굴 라인, 헤어스타일, 분위기를 포착하여 <span className="text-indigo-600">‘{selectedProfile}’</span> 테마의 맞춤형 카툰 벡터 그래픽으로 드로잉하고 있습니다. 잠시만 기다려 주세요! 🎨✨
                  </p>
                </div>
              </div>
            )}

          </Card>

          {/* Action Card 3: Grade Info */}
          <Card className="p-5 bg-indigo-50 border border-indigo-100 rounded-2xl">
            <div className="flex items-center gap-3 mb-2.5">
              <div className="w-9 h-9 bg-indigo-100 rounded-xl flex items-center justify-center">
                <Star className="w-5 h-5 text-indigo-600" />
              </div>
              <h4 className="font-black text-indigo-900 text-sm">탐험가 등급 캐릭터</h4>
            </div>
            <p className="text-xs text-indigo-700 font-bold leading-relaxed">
              현재 <span className="font-extrabold text-indigo-950">{profile?.name || '탐험가'}</span>님은 <span className="font-extrabold text-indigo-950">{level.name}</span> 등급입니다. 더 많은 탐색 미션을 클리어하여 더 높은 랭크 자격증을 쟁취해보세요! 🚀
            </p>
          </Card>

        </div>
      </div>

      {/* Hidden elements for Canvas manipulation */}
      <canvas ref={canvasRef} width="320" height="320" className="hidden" />
    </div>
  );
};
