import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, MailOpen, Heart, Sparkles, X, Check, Bookmark, Send } from 'lucide-react';
import { Button } from './Button';
import { UserProfile, TeacherNote } from '../../types';
import { collection, query, getDocs, onSnapshot, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from '../../firebase';

export const PRE_SEEDED_NOTES: TeacherNote[] = [
  {
    id: "note_sungbin",
    senderName: "김혜진 선생님",
    targetName: "윤성빈",
    targetGrade: "4",
    targetClass: "4",
    content: "윤성빈, 랭킹은 월초에는 오류가 있을 수 있지만 계속 업데이트중! -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_seojun",
    senderName: "김혜진 선생님",
    targetName: "유서준",
    targetGrade: "4",
    targetClass: "4",
    content: "유서준, 오류확인하고 열심히 업데이트중! -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_hayul",
    senderName: "김혜진 선생님",
    targetName: "연하율",
    targetGrade: "4",
    targetClass: "4",
    content: "하율이 선생님이 항상 사랑해! -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_dongkyeong",
    senderName: "김혜진 선생님",
    targetName: "윤동경",
    targetGrade: "4",
    targetClass: "7",
    content: "동경아 사랑해! -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_mina",
    senderName: "김혜진 선생님",
    targetName: "신민아",
    targetGrade: "4",
    targetClass: "7",
    content: "민아야, 빙고를 여럿이 하려면 선생님 돈이 많이 나가요. -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_jiyoon",
    senderName: "김혜진 선생님",
    targetName: "신지윤",
    targetGrade: "4",
    targetClass: "7",
    content: "지윤아, 로블록스 점프맵 만들수 있는데 선생님 돈이 많이 들어가. -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_yoona",
    senderName: "김혜진 선생님",
    targetName: "임윤아",
    targetGrade: "6",
    targetClass: "6",
    content: "윤아야 기특하다. 열심히 해봐! -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_naldeulda_1",
    senderName: "김혜진 선생님",
    targetName: "날들다",
    targetGrade: "4",
    targetClass: "4",
    content: "날들다님! 김혜진 선생님이 보내신 테스트 쪽지입니다. 시스템이 정상 작동하고 있습니다! 🌟 -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_naldeulda_2",
    senderName: "김혜진 선생님",
    targetName: "테스터",
    targetGrade: "4",
    targetClass: "4",
    content: "테스터님! 김혜진 선생님이 보내신 테스트 쪽지입니다. 쪽지 전달 기능이 완벽하게 확인되었습니다! 👍 -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_naldeulda_3",
    senderName: "김혜진 선생님",
    targetName: "naldeulda",
    targetGrade: "4",
    targetClass: "4",
    content: "naldeulda님! 김혜진 선생님이 보내신 테스트 쪽지입니다. 행복한 하루 되세요! ❤️ -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_nalrary_1",
    senderName: "김혜진 선생님",
    targetName: "nalrary",
    targetGrade: "4",
    targetClass: "4",
    content: "nalrary님! 김혜진 선생님이 보내신 테스트 쪽지입니다. 가입/로그인 및 쪽지 수신 테스트가 정상 작동 중입니다! 🎉 -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  {
    id: "note_nalrary_2",
    senderName: "김혜진 선생님",
    targetName: "nalrary@naver.com",
    targetGrade: "4",
    targetClass: "4",
    content: "nalrary@naver.com 이메일 연동 테스트 쪽지입니다. 쪽지 알림과 내용이 완벽히 전송되었습니다! ⭐ -김혜진 선생님이-",
    timestamp: 1783478400000
  },
  // --- NICKNAME WARNINGS FOR MISCHIEVOUS NAMES ---
  {
    id: "warn_jonghyun",
    senderName: "김혜진 선생님",
    targetName: "김페이커 트랄랄레오트랄랄라 봉주루 손흥민 BTS 거북이와 두루미 삼천 갑자 동박상 워리워리 세브리깡에 있는 호날두에 할머니에 삼촌에 대한민국 친구에 아들 이종현",
    targetGrade: "4",
    targetClass: "4",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 이종현)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_daon",
    senderName: "김혜진 선생님",
    targetName: "이상한나라의 솜사탕을 먹고 있는 이가상한 이상한 나라의 앨리스를 보고있는 이상하고 이가 상한 다온이",
    targetGrade: "4",
    targetClass: "4",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 다온)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_jihyeok",
    senderName: "김혜진 선생님",
    targetName: "김페이커 트랄라레로트랄라 봉준호 손흥민 BTS사천갑사 동갑사거북이와 두루미 최지혁",
    targetGrade: "4",
    targetClass: "4",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 최지혁)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_sungjun",
    senderName: "김혜진 선생님",
    targetName: "잘생기고 멋지고 착한 슈퍼 황성준 이걸 본 인간:what???no, no, no!",
    targetGrade: "3",
    targetClass: "5",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 황성준)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_sungbin_mischievous",
    senderName: "김혜진 선생님",
    targetName: "동물원에 간 윤성빈차차와이찬율차차가 원숭이에게 끌려가 윤성빈 이찬율 우끼끼가 됐다",
    targetGrade: "4",
    targetClass: "4",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 윤성빈)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_minhwan_son",
    senderName: "김혜진 선생님",
    targetName: "잘생긴 슈퍼 민환이의 아들은 슈퍼퉁퉁퉁 카피바라 나쵸 치츠맛 스멜",
    targetGrade: "3",
    targetClass: "5",
    content: "안녕하세요! 김혜진 선생님입니다. 현재 사용 중인 닉네임은 너무 길고 장난스러운 표현이 포함되어 있어 다른 친구들과 선생님들에게 혼란을 줍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명(예: 민환)으로 반드시 수정해 주세요! 미변경 시 서비스 이용이 제한되거나 상품 및 시상 대상에서 즉시 제외됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_ivy",
    senderName: "김혜진 선생님",
    targetName: "☠️아이비를 변기에 넣고 내려☠️",
    targetGrade: "5",
    targetClass: "5",
    content: "안녕하세요! 김혜진 선생님입니다. 다른 친구들에게 불쾌감이나 위협을 줄 수 있는 닉네임은 서비스 규정에 정면으로 위배됩니다. 오늘 즉시 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 올바른 실제 본명으로 정정해 주세요! 계속 방치할 경우 계정 이용이 정지 또는 차단되며 시상 및 모든 혜택에서 즉시 탈락됩니다.",
    timestamp: 1783478400000
  },
  {
    id: "warn_yetom",
    senderName: "김혜진 선생님",
    targetName: "우주 최강 예똠이?!",
    targetGrade: "5",
    targetClass: "2",
    content: "안녕하세요! 김혜진 선생님입니다. 사용 중인 닉네임에 들어간 장난스러운 표현은 제거해 주시기 바랍니다. 오늘 중으로 우측 상단의 '내 프로필' 또는 '설정' 메뉴로 이동하여 본인의 정확한 실제 본명으로 수정해 주세요! 미변경 시 시상 대상이나 상품 지급에서 제외될 수 있습니다.",
    timestamp: 1783478400000
  }
];

export const getGradeClassNum = (val: string | undefined): string => {
  if (!val) return '';
  const matches = val.toString().match(/\d+/g);
  return matches ? parseInt(matches[0], 10).toString() : val.trim().replace(/학년|반/g, '');
};

export const matchesProfile = (note: TeacherNote, profile: UserProfile) => {
  const noteGradeNum = getGradeClassNum(note.targetGrade);
  const noteClassNum = getGradeClassNum(note.targetClass);
  const profileGradeNum = getGradeClassNum(profile.grade);
  const profileClassNum = getGradeClassNum(profile.class);
  
  const noteName = (note.targetName || '').trim().toLowerCase();
  const profileName = (profile.name || '').trim().toLowerCase();
  const profileEmail = (profile.email || '').trim().toLowerCase();

  // 1. If it's a test name/email, match immediately by name or email
  const isTestUser = ['날들다', 'naldeulda', '테스터', 'nalrary'].some(t => 
    profileName.includes(t) || 
    noteName.includes(t) ||
    profileEmail.includes(t)
  );

  if (isTestUser) {
    if (
      noteName === profileName || 
      noteName === profileEmail || 
      (profileEmail === 'nalrary@naver.com' && (noteName.includes('nalrary') || noteName.includes('날들다') || noteName.includes('테스터'))) ||
      (profileName.includes('nalrary') && noteName.includes('nalrary'))
    ) {
      return true;
    }
  }
  
  // 2. Otherwise, match by grade, class, and name/email
  return (
    noteGradeNum === profileGradeNum &&
    noteClassNum === profileClassNum &&
    (noteName === profileName || noteName === profileEmail)
  );
};

interface TeacherNotePopupProps {
  profile: UserProfile | null;
  onClose?: () => void;
  forceOpenList?: boolean; // if true, opens the letterbox list
}

export const TeacherNotePopup = ({ profile, onClose, forceOpenList = false }: TeacherNotePopupProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dbNotes, setDbNotes] = useState<TeacherNote[]>([]);
  const [activeNotes, setActiveNotes] = useState<TeacherNote[]>([]);
  const [currentNoteIdx, setCurrentNoteIdx] = useState(0);
  const [isOpenedEnvelope, setIsOpenedEnvelope] = useState(false);
  const [readNoteIds, setReadNoteIds] = useState<string[]>(() => {
    try {
      const savedRead = localStorage.getItem('teacher_notes_read_v1');
      return savedRead ? JSON.parse(savedRead) : [];
    } catch (e) {
      console.error('Error parsing teacher_notes_read_v1', e);
      return [];
    }
  });
  const [viewingAll, setViewingAll] = useState(forceOpenList);
  const shownNoteIdsRef = useRef<Set<string>>(new Set());

  // Sync forceOpenList prop with viewingAll state
  useEffect(() => {
    setViewingAll(forceOpenList);
  }, [forceOpenList]);

  // 1. Load custom teacher notes from Firestore and merge with pre-seeded
  useEffect(() => {
    const q = query(collection(db, 'teacherNotes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const notesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as TeacherNote[];
      setDbNotes(notesList);
    }, (error) => {
      console.error("onSnapshot teacherNotes in popup error:", error);
      setDbNotes([]); // Fallback to no Firestore notes on error, pre-seeded will still render
    });

    return () => unsubscribe();
  }, []);

  // 2. Filter notes for the current user
  useEffect(() => {
    if (!profile || profile.uid === 'guest') {
      setActiveNotes([]);
      return;
    }

    const allNotes = [...PRE_SEEDED_NOTES, ...dbNotes];
    
    // De-duplicate by ID if any dbNote overrides a pre-seeded one
    const uniqueNotesMap = new Map<string, TeacherNote>();
    allNotes.forEach(note => {
      uniqueNotesMap.set(note.id || `${note.targetGrade}_${note.targetClass}_${note.targetName}`, note);
    });

    const userNotes = Array.from(uniqueNotesMap.values()).filter(note => matchesProfile(note, profile));
    setActiveNotes(userNotes);

    // If there are unread notes and we aren't forcing the list, trigger the automatic popup
    const unread = userNotes.filter(n => n.id && !readNoteIds.includes(n.id));
    if (unread.length > 0 && !forceOpenList) {
      // Find the index of the first unread note
      const firstUnreadIdx = userNotes.findIndex(n => n.id && !readNoteIds.includes(n.id));
      const firstUnreadNote = userNotes[firstUnreadIdx];
      
      if (firstUnreadNote && firstUnreadNote.id && !shownNoteIdsRef.current.has(firstUnreadNote.id)) {
        shownNoteIdsRef.current.add(firstUnreadNote.id);
        setCurrentNoteIdx(firstUnreadIdx >= 0 ? firstUnreadIdx : 0);
        setIsOpen(true);
        setIsOpenedEnvelope(false);
      }
    }
  }, [profile, dbNotes, readNoteIds, forceOpenList]);

  // Handle marking a note as read
  const handleMarkAsRead = async (noteId: string) => {
    if (!noteId) return;

    const newReadIds = [...readNoteIds, noteId];
    setReadNoteIds(newReadIds);
    localStorage.setItem('teacher_notes_read_v1', JSON.stringify(newReadIds));

    // Also update Firestore readBy list if it's a Firestore-stored note
    if (!noteId.startsWith('note_')) {
      try {
        const noteRef = doc(db, 'teacherNotes', noteId);
        if (profile?.uid) {
          await updateDoc(noteRef, {
            readBy: arrayUnion(profile.uid)
          });
        }
      } catch (e) {
        console.error("Failed to update read status in Firestore", e);
      }
    }

    // Go to the next unread, or close if none left
    const remainingUnreadIdx = activeNotes.findIndex((n, idx) => n.id && !newReadIds.includes(n.id) && idx !== currentNoteIdx);
    if (remainingUnreadIdx >= 0) {
      setCurrentNoteIdx(remainingUnreadIdx);
      setIsOpenedEnvelope(false);
    } else {
      setIsOpen(false);
      if (onClose) onClose();
    }
  };

  const currentNote = activeNotes[currentNoteIdx];

  if (activeNotes.length === 0 && !viewingAll) return null;

  // Render the "View All Notes" list screen
  if (viewingAll) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-[2.5rem] p-8 max-w-lg w-full border-4 border-rose-100 shadow-2xl relative max-h-[85vh] overflow-y-auto flex flex-col"
        >
          <button 
            onClick={() => {
              setViewingAll(false);
              if (onClose) onClose();
            }}
            className="absolute top-6 right-6 p-2 rounded-full hover:bg-gray-100 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="text-center mb-6 shrink-0">
            <div className="w-16 h-16 bg-rose-50 rounded-2xl flex items-center justify-center mx-auto mb-3 shadow-md border border-rose-100">
              <MailOpen className="w-8 h-8 text-rose-500" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">선생님의 소중한 편지함</h3>
            <p className="text-xs text-gray-500 font-bold mt-1">
              {profile?.name} 학생에게 김혜진 선생님이 보낸 따뜻한 편지 목록입니다.
            </p>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-1">
            {activeNotes.length === 0 ? (
              <div className="text-center py-12 text-gray-400 font-bold text-sm bg-rose-50/20 rounded-3xl border border-dashed border-rose-100 p-6">
                아직 선생님께 받은 편지가 없어요. 💌<br />
                열심히 활동해서 멋진 편지를 받아보세요!
              </div>
            ) : (
              activeNotes.map((note, idx) => {
                const isRead = note.id ? readNoteIds.includes(note.id) : false;
                return (
                  <div 
                    key={note.id || idx}
                    className={`p-5 rounded-3xl border transition-all ${
                      isRead 
                        ? 'bg-gray-50/80 border-gray-150 text-gray-600' 
                        : 'bg-rose-50/50 border-rose-100 text-gray-900 shadow-md shadow-rose-50'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="flex items-center gap-1.5 text-xs font-black text-rose-600">
                        <Heart className="w-3.5 h-3.5 fill-rose-500 text-rose-500" />
                        {note.senderName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-bold">
                        {isRead ? (
                          <span className="text-emerald-600 flex items-center gap-1">
                            <Check className="w-3 h-3" /> 읽음 확인
                          </span>
                        ) : (
                          <span className="bg-rose-500 text-white px-2 py-0.5 rounded-full text-[9px] animate-pulse">새 편지!</span>
                        )}
                      </span>
                    </div>
                    <div className="bg-yellow-50/40 p-4 rounded-2xl border border-yellow-100/50 font-medium text-sm leading-relaxed whitespace-pre-wrap font-sans text-gray-800">
                      {note.content}
                    </div>
                    {!isRead && note.id && (
                      <div className="mt-3 flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleMarkAsRead(note.id!)}
                          className="bg-rose-500 hover:bg-rose-600 text-white font-black text-xs px-4 py-2 rounded-xl flex items-center gap-1 shadow-sm"
                        >
                          <Check className="w-3.5 h-3.5" /> 확인했어요!
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>

          <div className="mt-6 text-center shrink-0">
            <Button
              variant="outline"
              onClick={() => {
                setViewingAll(false);
                if (onClose) onClose();
              }}
              className="px-6 py-2 border-gray-200 text-gray-600 rounded-xl font-bold"
            >
              닫기
            </Button>
          </div>
        </motion.div>
      </div>
    );
  }

  // Automatic unread popup render
  return (
    <AnimatePresence>
      {isOpen && currentNote && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
          {!isOpenedEnvelope ? (
            /* 1. Envelope View (Before Opening) */
            <motion.div
              key="envelope"
              initial={{ opacity: 0, scale: 0.8, y: 50 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.8, y: -50 }}
              className="bg-rose-500 rounded-[2.5rem] p-8 max-w-md w-full border-4 border-white shadow-2xl relative overflow-hidden text-white flex flex-col items-center"
            >
              {/* Back Pattern */}
              <div className="absolute inset-0 bg-[radial-gradient(#ff85a2_1px,transparent_1px)] [background-size:16px_16px] opacity-20" />
              
              {/* Close Button */}
              <button 
                onClick={() => {
                  setIsOpen(false);
                  if (onClose) onClose();
                }}
                className="absolute top-6 right-6 p-2 rounded-full hover:bg-white/10 text-white/80 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="my-8 text-center space-y-4 z-10">
                <motion.div 
                  animate={{ 
                    scale: [1, 1.1, 1],
                    rotate: [0, -5, 5, 0]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: 2.5,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto shadow-lg border-4 border-rose-300 relative cursor-pointer"
                  onClick={() => setIsOpenedEnvelope(true)}
                >
                  <Mail className="w-12 h-12 text-rose-500" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-4 w-4 bg-yellow-500"></span>
                  </span>
                </motion.div>
                
                <div className="space-y-1">
                  <span className="bg-yellow-400 text-rose-800 text-[10px] px-3 py-1 rounded-full font-black uppercase tracking-widest shadow-sm">
                    💌 선생님의 편지가 도착했어요!
                  </span>
                  <h3 className="text-3xl font-black mt-2">김혜진 선생님의 편지</h3>
                  <p className="text-rose-100 font-bold text-xs mt-1">
                    {profile?.name} 학생을 위한 선생님의 소중한 한마디를 읽어보세요.
                  </p>
                </div>
              </div>

              {/* Open Button Seal */}
              <button
                onClick={() => setIsOpenedEnvelope(true)}
                className="w-full py-4 bg-white hover:bg-rose-50 text-rose-600 rounded-2xl font-black text-md shadow-lg shadow-rose-900/30 transition-all flex items-center justify-center gap-2 cursor-pointer z-10 group"
              >
                <Heart className="w-5 h-5 fill-rose-500 text-rose-500 group-hover:scale-125 transition-transform" />
                <span>편지 열어보기</span>
              </button>
            </motion.div>
          ) : (
            /* 2. Opened Letter View */
            <motion.div
              key="letter"
              initial={{ opacity: 0, scale: 0.9, y: 30 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: -30 }}
              transition={{ type: "spring", stiffness: 100 }}
              className="bg-white rounded-[2.5rem] p-8 max-w-md w-full border-4 border-rose-200 shadow-2xl relative overflow-hidden flex flex-col"
            >
              {/* Confetti decoration on the side */}
              <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-rose-400 via-pink-400 to-yellow-300" />
              
              <div className="flex items-center justify-between mb-6 border-b border-rose-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 bg-rose-50 rounded-xl flex items-center justify-center border border-rose-100">
                    <Heart className="w-5 h-5 fill-rose-500 text-rose-500 animate-pulse" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-400 font-bold">보낸 사람</span>
                    <h4 className="text-sm font-black text-gray-800 flex items-center gap-1">
                      {currentNote.senderName}
                      <Sparkles className="w-3.5 h-3.5 text-yellow-500 fill-yellow-500" />
                    </h4>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-400 font-bold block">받는 사람</span>
                  <span className="bg-indigo-50 text-indigo-700 text-xs px-2.5 py-1 rounded-lg font-black border border-indigo-100">
                    {profile?.grade} {profile?.class} {profile?.name}
                  </span>
                </div>
              </div>

              {/* Letter Content (Styled like a handwritten notepad card) */}
              <div className="flex-1 bg-amber-50/70 rounded-3xl p-6 border border-amber-100 relative shadow-inner mb-6 flex flex-col min-h-[160px] justify-center">
                {/* Horizontal lines simulation */}
                <div className="absolute inset-0 bg-[linear-gradient(rgba(244,142,50,0.07)_1px,transparent_1px)] [background-size:100%_2rem] opacity-50 pointer-events-none rounded-3xl" />
                
                <p className="text-base text-gray-800 font-bold leading-loose whitespace-pre-wrap relative z-10 text-center font-sans">
                  {currentNote.content}
                </p>
              </div>

              {/* Confirmation Action Button */}
              <Button
                onClick={() => handleMarkAsRead(currentNote.id!)}
                className="w-full py-4 bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white rounded-2xl font-black text-md shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Check className="w-5 h-5 shrink-0" />
                <span>선생님 편지 확인했어요!</span>
              </Button>
            </motion.div>
          )}
        </div>
      )}
    </AnimatePresence>
  );
};
