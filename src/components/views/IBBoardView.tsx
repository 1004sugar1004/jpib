import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Sparkles, 
  Plus, 
  Heart, 
  Trash2, 
  ChevronLeft, 
  MessageSquare, 
  Pin, 
  Award,
  Search,
  Filter,
  AlertTriangle,
  Smile,
  Info,
  X,
  User,
  Pencil,
  Check
} from 'lucide-react';
import { Card } from '../ui/Card';
import { Button } from '../ui/Button';
import { db } from '../../firebase';
import { collection, doc, getDocs, addDoc, updateDoc, deleteDoc, query, orderBy, limit, arrayUnion, arrayRemove } from 'firebase/firestore';
import { User as FirebaseUser } from 'firebase/auth';
import { UserProfile } from '../../types';
import { cn } from '../../lib/utils';

interface IBBoardViewProps {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  isGuest?: boolean;
  onEarnXP: (xp: number, activityType?: any) => void;
  onClose: () => void;
}

interface BoardPost {
  id: string;
  topicId: 1 | 2; // 1: 좋아하는 학습자상, 2: 탐구하고 싶은 주제
  userId: string;
  userName: string;
  gradeClass: string;
  avatarSvg?: string;
  content: string;
  bgColor: string; // post-it bg color
  likes: string[];
  createdAt: number;
}

const POST_COLORS = [
  { name: 'yellow', bg: 'bg-amber-100 hover:bg-amber-150', text: 'text-amber-900', border: 'border-amber-200', tag: 'bg-amber-200/50 text-amber-800' },
  { name: 'pink', bg: 'bg-pink-100 hover:bg-pink-150', text: 'text-pink-900', border: 'border-pink-200', tag: 'bg-pink-200/50 text-pink-800' },
  { name: 'blue', bg: 'bg-sky-100 hover:bg-sky-150', text: 'text-sky-900', border: 'border-sky-200', tag: 'bg-sky-200/50 text-sky-800' },
  { name: 'green', bg: 'bg-emerald-100 hover:bg-emerald-150', text: 'text-emerald-900', border: 'border-emerald-200', tag: 'bg-emerald-200/50 text-emerald-800' },
  { name: 'purple', bg: 'bg-purple-100 hover:bg-purple-150', text: 'text-purple-900', border: 'border-purple-200', tag: 'bg-purple-200/50 text-purple-800' },
];

export const IBBoardView = ({ user, profile, isGuest, onEarnXP, onClose }: IBBoardViewProps) => {
  const [posts, setPosts] = useState<BoardPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [activeTopicForNewPost, setActiveTopicForNewPost] = useState<1 | 2>(1);
  const [content, setContent] = useState('');
  const [selectedColor, setSelectedColor] = useState('yellow');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [showXPToast, setShowXPToast] = useState(false);

  // Fetch Board Posts
  const fetchPosts = async () => {
    setIsLoading(true);
    try {
      const q = query(collection(db, 'ibBoardPosts'), orderBy('createdAt', 'desc'), limit(100));
      const querySnapshot = await getDocs(q);
      const postsData: BoardPost[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        postsData.push({
          id: doc.id,
          topicId: data.topicId || 1,
          userId: data.userId || '',
          userName: data.userName || '무명 학생',
          gradeClass: data.gradeClass || '',
          avatarSvg: data.avatarSvg || '',
          content: data.content || '',
          bgColor: data.bgColor || 'yellow',
          likes: data.likes || [],
          createdAt: data.createdAt || Date.now(),
        });
      });
      setPosts(postsData);
    } catch (err) {
      console.error('Error fetching IB board posts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const openNewPostModal = (topicId: 1 | 2) => {
    if (isGuest) {
      alert('게스트 계정은 IB 보드에 글을 작성할 수 없습니다. 로그인해 주세요!');
      return;
    }
    setActiveTopicForNewPost(topicId);
    setContent('');
    setSelectedColor(POST_COLORS[Math.floor(Math.random() * POST_COLORS.length)].name);
    setErrorMessage(null);
    setShowAddModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;
    if (!content.trim()) {
      setErrorMessage('내용을 입력해 주세요!');
      return;
    }
    if (content.trim().length < 10) {
      setErrorMessage('정성스러운 소감 작성을 위해 최소 10자 이상 입력해 주세요!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const newPost = {
        topicId: activeTopicForNewPost,
        userId: profile.uid,
        userName: profile.name || '탐험가',
        gradeClass: profile.grade && profile.class ? `${profile.grade}학년 ${profile.class}반` : '탐험가반',
        avatarSvg: profile.caricatureSvg || '',
        content: content.trim(),
        bgColor: selectedColor,
        likes: [],
        createdAt: Date.now()
      };

      await addDoc(collection(db, 'ibBoardPosts'), newPost);
      
      // Award 30 XP for writing
      onEarnXP(30, 'study');
      setShowXPToast(true);

      setShowAddModal(false);
      setContent('');
      await fetchPosts();

      setTimeout(() => {
        setShowXPToast(false);
      }, 4000);
    } catch (err) {
      console.error('Error adding post:', err);
      setErrorMessage('등록 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (postId: string, currentLikes: string[]) => {
    if (!profile || isGuest) return;
    const hasLiked = currentLikes.includes(profile.uid);
    const updatedLikes = hasLiked
      ? currentLikes.filter(id => id !== profile.uid)
      : [...currentLikes, profile.uid];

    setPosts(prev => prev.map(p => p.id === postId ? { ...p, likes: updatedLikes } : p));

    try {
      const postRef = doc(db, 'ibBoardPosts', postId);
      await updateDoc(postRef, {
        likes: hasLiked ? arrayRemove(profile.uid) : arrayUnion(profile.uid)
      });
    } catch (err) {
      console.error('Error liking post:', err);
    }
  };

  const handleDelete = async (postId: string) => {
    if (window.confirm('이 메모를 삭제하시겠습니까?')) {
      try {
        await deleteDoc(doc(db, 'ibBoardPosts', postId));
        setPosts(prev => prev.filter(p => p.id !== postId));
      } catch (err) {
        console.error('Error deleting post:', err);
      }
    }
  };

  const handleEdit = async (postId: string, newContent: string, newColor: string) => {
    try {
      const postRef = doc(db, 'ibBoardPosts', postId);
      await updateDoc(postRef, {
        content: newContent,
        bgColor: newColor
      });
      setPosts(prev => prev.map(p => p.id === postId ? { ...p, content: newContent, bgColor: newColor } : p));
    } catch (err) {
      console.error('Error editing post:', err);
      throw err;
    }
  };

  const filteredPosts = posts.filter(post => {
    const term = searchQuery.toLowerCase();
    return (
      post.content.toLowerCase().includes(term) ||
      post.userName.toLowerCase().includes(term) ||
      post.gradeClass.toLowerCase().includes(term)
    );
  });

  const topic1Posts = filteredPosts.filter(p => p.topicId === 1);
  const topic2Posts = filteredPosts.filter(p => p.topicId === 2);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50/40 via-orange-50/10 to-indigo-50/40 py-12 px-4 sm:px-6 lg:px-8 relative overflow-x-hidden">
      
      {/* Decorative background grids */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Header Controls */}
      <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 relative z-10">
        <button 
          onClick={onClose}
          className="flex items-center gap-2 text-gray-500 hover:text-indigo-600 font-bold transition-colors cursor-pointer self-start"
        >
          <ChevronLeft className="w-5 h-5" />
          <span>로비로 돌아가기</span>
        </button>

        {/* Search input */}
        <div className="relative max-w-md w-full">
          <Search className="w-5 h-5 text-gray-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="친구 이름, 내용, 학년반 검색하기..."
            className="w-full pl-11 pr-4 py-3.5 bg-white border border-slate-200/80 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/15 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Hero Header Section */}
      <div className="max-w-4xl mx-auto text-center mb-10 relative z-10">
        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-orange-100/80 border border-orange-200 text-orange-700 rounded-full text-xs font-black mb-4 animate-pulse">
          <Pin className="w-4 h-4 text-orange-600 fill-orange-600" />
          💡 IB Padlet Collaborative Board
        </div>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-4">
          📌 IB 보드 코너
        </h1>
        <p className="text-slate-600 text-base md:text-lg font-medium max-w-2xl mx-auto leading-relaxed">
          우리 학급 친구들과 소통하는 실시간 패들렛 보드입니다! 생각을 나누어 보세요.<br />
          🎁 <span className="text-orange-600 font-black">정성을 담아 작성한 우수 글을 선정하여 푸짐한 선물</span>을 드립니다! 🎁✨
        </p>

        <div className="mt-4 p-3 bg-indigo-50/70 border border-indigo-100 rounded-2xl max-w-xl mx-auto flex items-center gap-2.5 text-left">
          <Info className="w-5 h-5 text-indigo-600 shrink-0" />
          <p className="text-xs text-indigo-950 font-semibold leading-normal">
            메모를 남기면 즉시 <span className="text-indigo-600 font-extrabold">+30 XP</span>가 적립됩니다! 다른 친구들의 멋진 생각에는 <span className="text-rose-500">❤️ 하트</span>를 눌러 응원해 주세요!
          </p>
        </div>
      </div>

      {/* Corkboard Layout (Two Column Shelf Style) */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8 relative z-10">
        
        {/* Column 1: Topic 1 */}
        <div className="bg-slate-200/50 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-300/40 shadow-inner flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-300/50">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-orange-500 text-white font-black text-sm">1</span>
              <div>
                <h2 className="text-base font-black text-slate-900">가장 좋아하는 학습자상과 이유</h2>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">내가 닮고 싶은 IB 학습자상은 무엇인가요?</p>
              </div>
            </div>
            <button
              onClick={() => openNewPostModal(1)}
              className="p-2 bg-white hover:bg-orange-50 text-orange-600 border border-orange-200 rounded-xl transition-all shadow-sm cursor-pointer"
              title="메모지 붙이기"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[650px] pr-2">
            {topic1Posts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                <Smile className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs font-bold">첫 번째 포스트잇을 붙여보세요!</p>
              </div>
            ) : (
              topic1Posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  profile={profile} 
                  user={user}
                  onLike={handleLike} 
                  onDelete={handleDelete} 
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </div>

        {/* Column 2: Topic 2 */}
        <div className="bg-slate-200/50 backdrop-blur-sm rounded-[2rem] p-6 border border-slate-300/40 shadow-inner flex flex-col min-h-[500px]">
          <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-300/50">
            <div className="flex items-center gap-2.5">
              <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-500 text-white font-black text-sm">2</span>
              <div>
                <h2 className="text-base font-black text-slate-900">내가 깊이 탐구하고 싶은 주제와 이유</h2>
                <p className="text-[10px] text-slate-500 font-bold mt-0.5">더 많이 조사하고 알아내고 싶은 것은?</p>
              </div>
            </div>
            <button
              onClick={() => openNewPostModal(2)}
              className="p-2 bg-white hover:bg-indigo-50 text-indigo-600 border border-indigo-200 rounded-xl transition-all shadow-sm cursor-pointer"
              title="메모지 붙이기"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 space-y-4 overflow-y-auto max-h-[650px] pr-2">
            {topic2Posts.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center py-20 text-slate-400">
                <Smile className="w-10 h-10 mb-2 opacity-50" />
                <p className="text-xs font-bold">첫 번째 포스트잇을 붙여보세요!</p>
              </div>
            ) : (
              topic2Posts.map((post) => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  profile={profile} 
                  user={user}
                  onLike={handleLike} 
                  onDelete={handleDelete} 
                  onEdit={handleEdit}
                />
              ))
            )}
          </div>
        </div>

      </div>

      {/* Add Post Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-[2.5rem] w-full max-w-lg p-6 md:p-8 relative shadow-2xl border border-slate-100"
            >
              <button 
                onClick={() => setShowAddModal(false)}
                className="absolute top-6 right-6 p-2 hover:bg-slate-100 rounded-full transition-colors cursor-pointer"
              >
                <X className="w-5 h-5 text-slate-400" />
              </button>

              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">📌</span>
                <h2 className="text-xl font-black text-slate-900">
                  {activeTopicForNewPost === 1 ? '좋아하는 학습자상 글쓰기' : '탐구하고 싶은 주제 글쓰기'}
                </h2>
              </div>
              <p className="text-xs text-slate-500 font-bold mb-6">
                친구들과 나누고 싶은 나의 멋진 생각을 작성해 주세요! (+30 XP)
              </p>

              {errorMessage && (
                <div className="mb-4 p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-600 text-xs font-extrabold flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Custom Color Selector */}
                <div>
                  <label className="text-xs font-black text-slate-700 block mb-2">
                    🎨 포스트잇 색상 선택
                  </label>
                  <div className="flex gap-3">
                    {POST_COLORS.map((c) => (
                      <button
                        key={c.name}
                        type="button"
                        onClick={() => setSelectedColor(c.name)}
                        className={cn(
                          "w-10 h-10 rounded-xl border-2 transition-transform cursor-pointer relative",
                          c.bg,
                          selectedColor === c.name ? "border-slate-900 scale-110" : "border-transparent"
                        )}
                      >
                        {selectedColor === c.name && (
                          <span className="absolute inset-0 flex items-center justify-center text-[10px] text-slate-900">
                            ✓
                          </span>
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Content Input */}
                <div className="space-y-1.5">
                  <label className="text-xs font-black text-slate-700 block">
                    💬 생각 쓰기 (최소 10자 이상)
                  </label>
                  <textarea
                    rows={5}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    placeholder={
                      activeTopicForNewPost === 1
                        ? "예) 제가 가장 좋아하는 학습자상은 '탐구하는 사람'입니다. 왜냐하면 새로운 호기심을 가지고 지식을 스스로 찾아가는 과정이 신나고 재미있기 때문입니다!"
                        : "예) 저는 앞으로 '우주 과학과 블랙홀의 비밀'에 대해 탐구하고 싶습니다. 왜냐하면 보이지 않는 우주의 신비로운 힘이 어떻게 생겨났는지 궁금하기 때문입니다."
                    }
                    className="w-full px-4 py-3 border border-slate-200 rounded-2xl text-sm font-semibold text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 resize-none"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 font-bold px-1">
                    <span>작성자: {profile?.name} ({profile?.grade ? `${profile.grade}학년 ${profile.class}반` : '학급 등록 필요'})</span>
                    <span>{content.length} 자</span>
                  </div>
                </div>

                {/* Submit button */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-4 bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl font-black text-sm shadow-lg shadow-indigo-100 border-none cursor-pointer animate-none"
                >
                  {isSubmitting ? '게시판에 붙이는 중...' : '포스트잇 등록하기 (+30 XP)'}
                </Button>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* XP Toast */}
      <AnimatePresence>
        {showXPToast && (
          <div className="fixed bottom-10 left-1/2 transform -translate-x-1/2 z-50">
            <motion.div
              initial={{ y: 50, opacity: 0, scale: 0.9 }}
              animate={{ y: 0, opacity: 1, scale: 1 }}
              exit={{ y: -20, opacity: 0, scale: 0.9 }}
              className="bg-slate-900 border border-indigo-500/30 text-white px-6 py-4 rounded-2xl shadow-2xl flex items-center gap-3"
            >
              <div className="w-10 h-10 bg-indigo-500 text-white rounded-xl flex items-center justify-center font-black text-lg animate-bounce shrink-0">
                ✏️
              </div>
              <div>
                <p className="text-xs text-slate-300 font-bold">생각을 나누어 주셔서 감사합니다!</p>
                <p className="text-sm font-black text-indigo-300">
                  IB 보드 포스팅 적립금 <span className="text-amber-400 font-extrabold">+30 XP</span>가 지급되었습니다! 🎁
                </p>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};

// PostCard subcomponent
interface PostCardProps {
  key?: any;
  post: BoardPost;
  profile: UserProfile | null;
  user: FirebaseUser | null;
  onLike: (postId: string, currentLikes: string[]) => void;
  onDelete: (postId: string) => void;
  onEdit: (postId: string, newContent: string, newColor: string) => Promise<void>;
}

const PostCard = ({ post, profile, user, onLike, onDelete, onEdit }: PostCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [editColor, setEditColor] = useState(post.bgColor);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const matchedColor = POST_COLORS.find(c => c.name === editColor) || POST_COLORS[0];
  const hasLiked = profile ? post.likes.includes(profile.uid) : false;

  const handleSave = async () => {
    if (!editContent.trim()) {
      alert('내용을 입력해 주세요!');
      return;
    }
    if (editContent.trim().length < 10) {
      alert('정성스러운 소감 작성을 위해 최소 10자 이상 작성해 주세요!');
      return;
    }
    setIsSubmitting(true);
    try {
      await onEdit(post.id, editContent.trim(), editColor);
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      alert('수정 중 오류가 발생했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ scale: 0.95, opacity: 0, y: 10 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      whileHover={{ y: isEditing ? 0 : -4, rotate: isEditing ? 0 : (post.createdAt % 2 === 0 ? 0.5 : -0.5) }}
      className={cn(
        "p-5 rounded-2xl shadow-md border transition-all flex flex-col justify-between relative overflow-hidden group",
        matchedColor.bg,
        matchedColor.border
      )}
    >
      {/* Decorative PIN */}
      <div className="absolute top-2.5 left-1/2 -translate-x-1/2 w-2.5 h-2.5 bg-rose-500/80 rounded-full border border-rose-600 shadow-sm z-10">
        <div className="w-1 h-1 bg-white rounded-full absolute top-0.5 left-0.5" />
      </div>

      <div>
        {/* Author / Date */}
        <div className="flex items-center gap-2 mb-3.5 mt-1">
          <div className="w-7 h-7 bg-white/70 rounded-full flex items-center justify-center overflow-hidden border border-slate-200/50 shrink-0">
            {post.avatarSvg ? (
              <div className="w-full h-full scale-110" dangerouslySetInnerHTML={{ __html: post.avatarSvg }} />
            ) : (
              <User className="w-4 h-4 text-slate-400" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-extrabold text-slate-800 leading-none truncate">
              {post.userName}
            </p>
            <span className="text-[9px] font-bold text-slate-500 block mt-0.5">
              {post.gradeClass}
            </span>
          </div>

          {profile && (profile.uid === post.userId || user?.email === '1004sugar1004@gmail.com') && (
            <div className="flex items-center gap-1">
              {!isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="p-1.5 bg-white/40 hover:bg-indigo-50 text-slate-400 hover:text-indigo-600 rounded-lg transition-colors cursor-pointer"
                  title="수정"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              )}
              <button
                onClick={() => onDelete(post.id)}
                className="p-1.5 bg-white/40 hover:bg-rose-50 text-slate-400 hover:text-rose-600 rounded-lg transition-colors cursor-pointer"
                title="삭제"
              >
                <Trash2 className="w-3 h-3" />
              </button>
            </div>
          )}
        </div>

        {/* Content body */}
        {isEditing ? (
          <div className="space-y-3">
            <div className="flex gap-1.5">
              {POST_COLORS.map((c) => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setEditColor(c.name)}
                  className={cn(
                    "w-5 h-5 rounded-md border transition-transform cursor-pointer",
                    c.bg,
                    editColor === c.name ? "border-slate-800 scale-110" : "border-transparent"
                  )}
                />
              ))}
            </div>

            <textarea
              rows={4}
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full p-2 text-xs border border-slate-300/60 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 bg-white/80 resize-none font-semibold leading-normal"
            />

            <div className="flex justify-end gap-1.5">
              <button
                onClick={() => {
                  setIsEditing(false);
                  setEditContent(post.content);
                  setEditColor(post.bgColor);
                }}
                className="px-2 py-1 text-[9px] font-black text-slate-500 hover:text-slate-700 bg-white/60 hover:bg-white rounded-lg transition-colors cursor-pointer"
              >
                취소
              </button>
              <button
                onClick={handleSave}
                disabled={isSubmitting}
                className="px-2 py-1 text-[9px] font-black text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
              >
                <Check className="w-3 h-3" /> 저장
              </button>
            </div>
          </div>
        ) : (
          <p className="text-slate-800 text-xs font-bold leading-relaxed whitespace-pre-wrap tracking-wide">
            {post.content}
          </p>
        )}
      </div>

      {/* Interactions */}
      {!isEditing && (
        <div className="mt-4 pt-3 border-t border-slate-900/5 flex items-center justify-between">
          <button
            onClick={() => onLike(post.id, post.likes)}
            className={cn(
              "flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-black transition-colors cursor-pointer",
              hasLiked 
                ? "bg-rose-500 text-white" 
                : "bg-white/60 hover:bg-white text-slate-600 border border-slate-200/30"
            )}
          >
            <Heart className={cn("w-3 h-3", hasLiked ? "fill-white text-white" : "")} />
            <span>{post.likes.length}</span>
          </button>

          <span className="text-[8px] text-slate-400 font-semibold">
            {new Date(post.createdAt).toLocaleDateString()}
          </span>
        </div>
      )}
    </motion.div>
  );
};
