import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  UploadCloud, 
  ThumbsUp, 
  Check, 
  Trash2, 
  Camera, 
  AlertTriangle, 
  X, 
  ChevronLeft, 
  Download, 
  User,
  Heart,
  Image as ImageIcon,
  Award,
  Pencil
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { db, handleFirestoreError, OperationType } from '../../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../../types';
import { getLevel, formatGradeClass, cn } from '../../lib/utils';

interface CertificateGalleryViewProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isGuest?: boolean;
  onEarnXP: (xp: number, activityType?: any) => void;
  onClose: () => void;
}

interface SharedCertificate {
  id: string;
  userId: string;
  userName: string;
  gradeClass: string;
  avatarSvg?: string; // profile caricature if available
  caricatureSvg?: string; // shared custom caricature
  imageUrl?: string; // uploaded base64 image
  caption: string;
  likes: string[];
  createdAt: number;
}

export const CertificateGalleryView = ({ user, profile, isGuest, onEarnXP, onClose }: CertificateGalleryViewProps) => {
  const [items, setItems] = useState<SharedCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [caption, setCaption] = useState('');
  const [uploadedBase64, setUploadedBase64] = useState<string | null>(null);
  const [useMyCaricature, setUseMyCaricature] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showXPToast, setShowXPToast] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [editingCaption, setEditingCaption] = useState<string>('');

  const handleStartEdit = (id: string, currentCaption: string) => {
    setEditingItemId(id);
    setEditingCaption(currentCaption);
  };

  const handleCancelEdit = () => {
    setEditingItemId(null);
    setEditingCaption('');
  };

  const handleSaveEdit = async (id: string) => {
    if (!editingCaption.trim()) {
      alert('소감을 입력해 주세요!');
      return;
    }
    try {
      const postRef = doc(db, 'sharedCertificates', id);
      await updateDoc(postRef, {
        caption: editingCaption.trim()
      });
      setItems(prev => prev.map(item => item.id === id ? { ...item, caption: editingCaption.trim() } : item));
      setEditingItemId(null);
      setEditingCaption('');
    } catch (err) {
      console.error('Error updating certificate caption:', err);
      alert('수정 중 오류가 발생했습니다.');
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch gallery list
  const fetchGallery = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'sharedCertificates'), orderBy('createdAt', 'desc'), limit(50));
      const querySnapshot = await getDocs(q);
      const galleryData: SharedCertificate[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        galleryData.push({
          id: doc.id,
          userId: data.userId || '',
          userName: data.userName || '무명 학생',
          gradeClass: data.gradeClass || '',
          avatarSvg: data.avatarSvg || '',
          caricatureSvg: data.caricatureSvg || '',
          imageUrl: data.imageUrl || '',
          caption: data.caption || '',
          likes: data.likes || [],
          createdAt: data.createdAt || Date.now(),
        });
      });
      setItems(galleryData);
    } catch (err) {
      console.error('Error fetching gallery, loading fallbacks:', err);
      // Fallback local storage or beautiful mock certificates
      const local = localStorage.getItem('guest_shared_certificates');
      let fallbackData = [];
      if (local) {
        try {
          fallbackData = JSON.parse(local);
        } catch (e) {
          fallbackData = [];
        }
      }
      
      if (!fallbackData || fallbackData.length === 0) {
        const today = Date.now();
        fallbackData = [
          {
            id: 'fb_cert_1',
            userId: 'stud_10',
            userName: '서윤 대원',
            gradeClass: '5학년 1반',
            caption: '드디어 5학년 IB 성찰가 수료증을 획득했습니다! 배움의 10가지 가치를 마음에 새기며 앞으로도 멋진 탐구를 이어갈게요. 🌟',
            likes: ['stud_2', 'stud_5'],
            createdAt: today - 3600000 * 3,
            useMyCaricature: true
          },
          {
            id: 'fb_cert_2',
            userId: 'stud_11',
            userName: '지우 대원',
            gradeClass: '5학년 4반',
            caption: '열심히 성찰 일기를 쓰고 퀴즈를 모두 풀어서 받은 수료증입니다! 탐험 대원 수료증을 보니 정말 보람차네요! 🎓',
            likes: ['stud_1', 'stud_3'],
            createdAt: today - 3600000 * 8,
            useMyCaricature: true
          }
        ];
      }
      setItems(fallbackData);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGallery();
  }, []);

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Helper to resize image before sending to firestore
  const resizeAndConvert = (file: File) => {
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 450;
        const MAX_HEIGHT = 450;
        let width = img.width;
        let height = img.height;

        if (width > height) {
          if (width > MAX_WIDTH) {
            height *= MAX_WIDTH / width;
            width = MAX_WIDTH;
          }
        } else {
          if (height > MAX_HEIGHT) {
            width *= MAX_HEIGHT / height;
            height = MAX_HEIGHT;
          }
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, width, height);
          const compressedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setUploadedBase64(compressedBase64);
          setUseMyCaricature(false);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        resizeAndConvert(file);
      } else {
        setErrorMessage('이미지 파일(png, jpg)만 업로드할 수 있습니다.');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        resizeAndConvert(file);
      } else {
        setErrorMessage('이미지 파일(png, jpg)만 업로드할 수 있습니다.');
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (isGuest) {
      setErrorMessage('게스트 계정은 자랑코너에 공유할 수 없습니다. 로그인해 주세요!');
      return;
    }

    if (!uploadedBase64 && !useMyCaricature) {
      setErrorMessage('자랑할 자격증 이미지를 업로드하거나, 나만의 캐리커쳐를 선택해 주세요!');
      return;
    }

    if (!caption.trim()) {
      setErrorMessage('친구들에게 나눌 소중한 한마디(캡션)를 입력해 주세요!');
      return;
    }

    setIsSubmitting(false);
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      const newDoc = {
        userId: profile.uid,
        userName: profile.name || '탐험가',
        gradeClass: profile.grade && profile.class ? `${profile.grade} ${profile.class}` : '탐험반',
        avatarSvg: profile.caricatureSvg || '',
        caricatureSvg: useMyCaricature ? (profile.caricatureSvg || '') : '',
        imageUrl: useMyCaricature ? '' : (uploadedBase64 || ''),
        caption: caption.trim(),
        likes: [],
        createdAt: Date.now()
      };

      // Add to firestore
      const docRef = await addDoc(collection(db, 'sharedCertificates'), newDoc);

      // Award 50 XP
      onEarnXP(50, 'study');
      setShowXPToast(true);

      // Reset form
      setCaption('');
      setUploadedBase64(null);
      setUseMyCaricature(false);
      setShowUploadModal(false);

      // Re-fetch
      await fetchGallery();

      setTimeout(() => {
        setShowXPToast(false);
      }, 4000);

    } catch (err) {
      console.error('Error sharing certificate:', err);
      setErrorMessage('공유 도중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (itemId: string, currentLikes: string[]) => {
    if (!profile || isGuest) return;
    
    const hasLiked = currentLikes.includes(profile.uid);
    const updatedLikes = hasLiked 
      ? currentLikes.filter(id => id !== profile.uid) 
      : [...currentLikes, profile.uid];

    // Optimistically update UI
    setItems(prev => prev.map(item => item.id === itemId ? { ...item, likes: updatedLikes } : item));

    try {
      const itemRef = doc(db, 'sharedCertificates', itemId);
      await updateDoc(itemRef, {
        likes: hasLiked ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
      });
    } catch (err) {
      console.error('Error liking certificate:', err);
    }
  };

  const handleDelete = async (itemId: string) => {
    if (window.confirm('정말로 이 자랑글을 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'sharedCertificates', itemId));
        setItems(prev => prev.filter(item => item.id !== itemId));
      } catch (err) {
        console.error('Error deleting certificate:', err);
      }
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-purple-50/20 to-slate-100/50 py-12 px-4 sm:px-6 lg:px-8 relative">
      {/* Back button */}
      <div className="max-w-6xl mx-auto mb-8 flex items-center justify-between">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-purple-600 font-bold transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>로비로 돌아가기</span>
        </button>

        <button 
          onClick={() => setShowUploadModal(true)}
          className="flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-100 transition-all cursor-pointer"
        >
          <Sparkles className="w-4 h-4" />
          <span>내 자격증 자랑하기 (+50 XP)</span>
        </button>
      </div>

      {/* Hero Banner Section */}
      <div className="max-w-4xl mx-auto text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-purple-100/80 border border-purple-200 text-purple-700 rounded-full text-xs font-black mb-4 tracking-wider uppercase animate-pulse">
          <Award className="w-4 h-4 text-purple-600" />
          Certificate Showcase Corner
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-tight mb-4">
          🎖️ 자격증 자랑 코너!
        </h1>
        <p className="text-slate-600 text-lg font-medium leading-relaxed max-w-2xl mx-auto">
          나만의 멋진 <span className="text-indigo-600 font-extrabold">IB 학습자 자격증</span> 또는 
          <span className="text-purple-600 font-extrabold"> 캐리커쳐</span> 이미지를 다운로드해서 뽐내보세요!<br />
          자랑글을 게시하면 즉시 <span className="text-pink-600 font-extrabold">보너스 50 XP (50포인트)</span>를 드립니다! ✨
        </p>
      </div>

      {/* Gallery Feed Container */}
      <div className="max-w-6xl mx-auto">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4">
            <div className="w-12 h-12 border-4 border-purple-400 border-t-transparent rounded-full animate-spin" />
            <p className="text-slate-500 font-bold text-sm">멋진 자격증 목록을 불러오고 있어요...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="text-center py-20 bg-white/75 border-2 border-dashed border-purple-200 rounded-[2.5rem] p-8 max-w-2xl mx-auto shadow-md">
            <ImageIcon className="w-16 h-16 text-purple-300 mx-auto mb-4" />
            <h3 className="text-xl font-extrabold text-slate-800 mb-2">아직 올라온 자격증이 없어요!</h3>
            <p className="text-slate-500 font-semibold mb-6">첫 번째로 나만의 멋진 탐험 자격증을 올리고 50 XP를 받아보세요!</p>
            <Button 
              onClick={() => setShowUploadModal(true)}
              className="px-6 py-3 bg-purple-500 hover:bg-purple-600 text-white rounded-xl font-black border-none"
            >
              가장 먼저 자랑하기
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {items.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl overflow-hidden shadow-xl border border-slate-100 hover:shadow-2xl hover:border-purple-200 transition-all flex flex-col h-full"
              >
                {/* Header Info */}
                <div className="p-5 flex items-center gap-3.5 border-b border-slate-50">
                  <div className="w-10 h-10 bg-slate-100 rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-100 shrink-0">
                    {item.avatarSvg ? (
                      <div className="w-full h-full scale-110" dangerouslySetInnerHTML={{ __html: item.avatarSvg }} />
                    ) : (
                      <User className="w-5 h-5 text-slate-400" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-slate-900 truncate leading-tight">
                      {item.userName}
                    </p>
                    <p className="text-xs text-slate-400 font-extrabold mt-0.5">
                      {item.gradeClass}
                    </p>
                  </div>
                  {profile && (profile.uid === item.userId || user?.email === '1004sugar1004@gmail.com') && (
                    <div className="flex items-center gap-1">
                      <button 
                        onClick={() => handleStartEdit(item.id, item.caption)}
                        className="p-2 hover:bg-indigo-50 text-slate-300 hover:text-indigo-500 rounded-xl transition-colors cursor-pointer"
                        title="수정하기"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(item.id)}
                        className="p-2 hover:bg-rose-50 text-slate-300 hover:text-rose-500 rounded-xl transition-colors cursor-pointer"
                        title="삭제하기"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Main Shared Visual Content */}
                <div className="bg-slate-50 relative aspect-[4/3] flex items-center justify-center overflow-hidden border-b border-slate-100 group">
                  {item.caricatureSvg ? (
                    <div className="w-full h-full p-4 flex items-center justify-center bg-gradient-to-br from-indigo-900 to-slate-900">
                      <div className="w-full h-full transform group-hover:scale-105 transition-transform duration-300 shadow-md rounded-xl overflow-hidden" dangerouslySetInnerHTML={{ __html: item.caricatureSvg }} />
                    </div>
                  ) : item.imageUrl ? (
                    <img 
                      src={item.imageUrl} 
                      alt="Shared Certificate" 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="p-4 text-center text-slate-300">
                      <ImageIcon className="w-10 h-10 mx-auto mb-2" />
                      <p className="text-xs font-semibold">이미지 없음</p>
                    </div>
                  )}
                </div>

                {/* Body details & interaction */}
                <div className="p-5 flex-1 flex flex-col justify-between">
                  <div>
                    {editingItemId === item.id ? (
                      <div className="space-y-2">
                        <textarea
                          rows={3}
                          value={editingCaption}
                          onChange={(e) => setEditingCaption(e.target.value)}
                          className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 resize-none font-semibold"
                        />
                        <div className="flex justify-end gap-1.5">
                          <button
                            onClick={handleCancelEdit}
                            className="px-2.5 py-1 text-[10px] font-black text-slate-500 hover:text-slate-700 bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          >
                            취소
                          </button>
                          <button
                            onClick={() => handleSaveEdit(item.id)}
                            className="px-2.5 py-1 text-[10px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Check className="w-3 h-3" /> 저장
                          </button>
                        </div>
                      </div>
                    ) : (
                      <p className="text-slate-700 font-bold text-sm leading-relaxed whitespace-pre-wrap line-clamp-3">
                        {item.caption}
                      </p>
                    )}
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-50 flex items-center justify-between">
                    <button
                      onClick={() => handleLike(item.id, item.likes)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-black transition-all cursor-pointer",
                        profile && item.likes.includes(profile.uid)
                          ? "bg-rose-50 text-rose-600 border border-rose-100"
                          : "bg-slate-50 text-slate-500 hover:bg-slate-100 border border-slate-100"
                      )}
                    >
                      <Heart className={cn("w-4 h-4", profile && item.likes.includes(profile.uid) ? "fill-rose-500 text-rose-500" : "")} />
                      <span>{item.likes.length}</span>
                    </button>

                    <span className="text-[10px] text-slate-400 font-extrabold">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Share Upload Modal */}
      <AnimatePresence>
        {showUploadModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 relative shadow-2xl border border-purple-100"
            >
              <button 
                onClick={() => {
                  setShowUploadModal(false);
                  setUploadedBase64(null);
                  setUseMyCaricature(false);
                }}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <h2 className="text-2xl font-black text-slate-900 mb-1 flex items-center gap-2">
                🏆 내 자격증 뽐내기
              </h2>
              <p className="text-slate-500 text-xs font-bold mb-6">
                발급받은 자격증 이미지 또는 나만의 캐리커쳐를 업로드하여 50 XP를 받으세요!
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-extrabold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Method selector */}
                <div className="grid grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={() => {
                      setUseMyCaricature(false);
                      setUploadedBase64(null);
                    }}
                    className={cn(
                      "py-3.5 px-4 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer",
                      !useMyCaricature
                        ? "border-purple-500 bg-purple-50/50 text-purple-700"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 bg-white"
                    )}
                  >
                    <UploadCloud className="w-5 h-5" />
                    <span>자격증 파일 업로드</span>
                  </button>

                  <button
                    type="button"
                    disabled={!profile?.caricatureSvg}
                    onClick={() => {
                      if (profile?.caricatureSvg) {
                        setUseMyCaricature(true);
                        setUploadedBase64(null);
                      }
                    }}
                    className={cn(
                      "py-3.5 px-4 rounded-2xl text-xs font-black border-2 transition-all flex flex-col items-center gap-1.5 cursor-pointer",
                      !profile?.caricatureSvg && "opacity-40 cursor-not-allowed",
                      useMyCaricature
                        ? "border-purple-500 bg-purple-50/50 text-purple-700"
                        : "border-slate-100 hover:border-slate-200 text-slate-500 bg-white"
                    )}
                    title={!profile?.caricatureSvg ? "아직 발급받은 캐리커쳐가 없습니다." : ""}
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>내 AI 캐리커쳐 선택</span>
                  </button>
                </div>

                {/* Upload Area */}
                {!useMyCaricature ? (
                  <div
                    onDragEnter={handleDrag}
                    onDragOver={handleDrag}
                    onDragLeave={handleDrag}
                    onDrop={handleDrop}
                    onClick={() => fileInputRef.current?.click()}
                    className={cn(
                      "border-2 border-dashed rounded-3xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center min-h-[160px]",
                      dragActive ? "border-purple-500 bg-purple-50/30" : "border-slate-200 hover:border-purple-300 bg-slate-50/50",
                      uploadedBase64 ? "border-emerald-400 bg-emerald-50/10" : ""
                    )}
                  >
                    <input 
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="hidden"
                    />

                    {uploadedBase64 ? (
                      <div className="w-full flex flex-col items-center gap-2">
                        <img 
                          src={uploadedBase64} 
                          alt="Preview" 
                          className="max-h-24 rounded-lg shadow-sm border border-slate-100 object-cover"
                        />
                        <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                          <Check className="w-4 h-4" /> 자격증 이미지 등록 완료
                        </span>
                        <span className="text-[10px] text-slate-400 font-bold">클릭하여 파일 변경</span>
                      </div>
                    ) : (
                      <>
                        <ImageIcon className="w-8 h-8 text-slate-400 mb-2" />
                        <p className="text-xs font-bold text-slate-600 leading-normal">
                          자격증 이미지 파일을 끌어다 놓거나<br />
                          <span className="text-purple-600 underline">이곳을 클릭</span>하여 파일을 선택해 주세요.
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1 font-semibold">
                          다운로드받은 이미지나 스크린샷 캡쳐본이 가능합니다!
                        </p>
                      </>
                    )}
                  </div>
                ) : (
                  <div className="border-2 border-emerald-400 bg-emerald-50/10 rounded-3xl p-6 flex flex-col items-center justify-center min-h-[160px]">
                    <div className="w-20 h-20 scale-110 rounded-xl overflow-hidden border border-emerald-100 mb-2 shadow-sm" dangerouslySetInnerHTML={{ __html: profile?.caricatureSvg || '' }} />
                    <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1">
                      <Check className="w-4 h-4" /> 내 멋진 AI 캐리커쳐 연동 완료
                    </span>
                  </div>
                )}

                {/* Caption Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    💬 자랑하고 싶은 이야기 (소감 한마디)
                  </label>
                  <textarea
                    rows={3}
                    value={caption}
                    onChange={(e) => setCaption(e.target.value)}
                    placeholder="예) 탐구자 자격증을 얻어서 너무 뿌듯해요! 앞으로 더 멋지게 학습하는 탐험가가 되겠습니다!"
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/20 focus:border-purple-500 resize-none"
                  />
                </div>

                {/* Share Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-purple-500 to-indigo-600 hover:from-purple-600 hover:to-indigo-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-purple-100 border-none cursor-pointer"
                >
                  {isSubmitting ? '멋지게 업로드하는 중...' : '자랑 코너에 등록하기 (+50 XP)'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Confetti Points Toast Notification */}
      <AnimatePresence>
        {showXPToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-purple-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-purple-500 text-white rounded-xl flex items-center justify-center font-black text-lg animate-bounce shrink-0">
                ⭐
              </div>
              <div>
                <p className="text-xs text-slate-300 font-bold">축하합니다! 대자랑 성공!</p>
                <p className="text-sm font-black text-purple-300">
                  자격증 자랑 보너스로 <span className="text-pink-400 font-extrabold">+50 XP</span>를 받았습니다! 🎁✨
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
