import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  User, 
  HelpCircle, 
  Award, 
  Clock, 
  RefreshCw, 
  CheckCircle, 
  XCircle, 
  Volume2, 
  VolumeX, 
  Compass, 
  Play, 
  Sparkles, 
  AlertTriangle,
  Lightbulb,
  Unlock,
  Smile,
  Frown,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';

// Web Audio API Sound Generator for retro sounds
const playSound = (type: 'success' | 'fail' | 'clue' | 'click' | 'tick', enabled: boolean) => {
  if (!enabled) return;
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    
    osc.connect(gain);
    gain.connect(ctx.destination);

    if (type === 'success') {
      // Ascending triumphant chord
      osc.type = 'sine';
      osc.frequency.setValueAtTime(261.63, ctx.currentTime); // C4
      osc.frequency.setValueAtTime(329.63, ctx.currentTime + 0.1); // E4
      osc.frequency.setValueAtTime(392.00, ctx.currentTime + 0.2); // G4
      osc.frequency.setValueAtTime(523.25, ctx.currentTime + 0.3); // C5
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.6);
      osc.start();
      osc.stop(ctx.currentTime + 0.6);
    } else if (type === 'fail') {
      // Descending buzzer sound
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(150, ctx.currentTime);
      osc.frequency.linearRampToValueAtTime(80, ctx.currentTime + 0.4);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'clue') {
      // Magical chime
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, ctx.currentTime); // A4
      osc.frequency.setValueAtTime(554.37, ctx.currentTime + 0.08); // C#5
      osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.16); // E5
      osc.frequency.setValueAtTime(880, ctx.currentTime + 0.24); // A5
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.5);
      osc.start();
      osc.stop(ctx.currentTime + 0.5);
    } else if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, ctx.currentTime);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    } else if (type === 'tick') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, ctx.currentTime);
      gain.gain.setValueAtTime(0.02, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);
      osc.start();
      osc.stop(ctx.currentTime + 0.06);
    }
  } catch (e) {
    console.error(e);
  }
};

// Types & Definitions
interface Suspect {
  id: string;
  name: string;
  avatarSeed: number; // For styling colors/features
  gender: 'male' | 'female';
  hairColor: '검은색' | '노란색' | '갈색' | '주황색';
  hairStyle: '단발머리' | '긴 생머리' | '곱슬머리' | '짧은 컷';
  clothingColor: '빨간색' | '파란색' | '초록색' | '노란색';
  clothingType: '후드티' | '셔츠' | '맨투맨' | '반팔티';
  accessory: '안경' | '모자' | '리본' | '귀걸이' | '없음';
  favoriteSubject: '수학' | '국어' | '과학' | '미술' | '체육';
  hobby: '독서' | '게임' | '음악감상' | '요리';
  alibi: string;
}

interface Clue {
  id: string;
  text: string;
  unlocked: boolean;
  puzzle: {
    question: string;
    choices: string[];
    answerIdx: number;
    hint: string;
  };
}

interface StoryCase {
  id: string;
  title: string;
  difficulty: '쉬움' | '보통' | '어려움';
  summary: string;
  introText: string;
  suspects: Suspect[];
  culpritId: string;
  clues: Clue[];
}

const CONSTANT_SUBJECTS = ['수학', '국어', '과학', '미술', '체육'] as const;
const CONSTANT_HOBBIES = ['독서', '게임', '음악감상', '요리'] as const;
const CONSTANT_HAIR_COLORS = ['검은색', '노란색', '갈색', '주황색'] as const;
const CONSTANT_HAIR_STYLES = ['단발머리', '긴 생머리', '곱슬머리', '짧은 컷'] as const;
const CONSTANT_CLOTHING_COLORS = ['빨간색', '파란색', '초록색', '노란색'] as const;
const CONSTANT_CLOTHING_TYPES = ['후드티', '셔츠', '맨투맨', '반팔티'] as const;
const CONSTANT_ACCESSORIES = ['안경', '모자', '리본', '귀걸이', '없음'] as const;

const STORY_CASES: StoryCase[] = [
  {
    id: 'case_1',
    title: '사건 #1: 사라진 보물 상자의 골든티켓',
    difficulty: '쉬움',
    summary: '보물 상자 안에 보관 중이던 최고급 골든티켓이 사라졌습니다! 단서를 풀어 범인을 찾으세요.',
    introText: '교실 보물 상자 안에 소중히 들어있던 "무제한 골든티켓"이 점심시간 사이에 깜쪽같이 사라졌습니다. 현장에 남겨진 3개의 잠금 장치를 풀고 진짜 범인을 검거해 보세요!',
    culpritId: 'sus_jihoon',
    suspects: [
      {
        id: 'sus_minsu',
        name: '김민수 (반장)',
        avatarSeed: 1,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '짧은 컷',
        clothingColor: '파란색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '수학',
        hobby: '독서',
        alibi: '저는 아까 점심시간 이후 계속 수학 기출문제를 푸느라 교실 구석에 앉아 있었어요.'
      },
      {
        id: 'sus_sujin',
        name: '이수진 (미술부장)',
        avatarSeed: 2,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '단발머리',
        clothingColor: '빨간색',
        clothingType: '셔츠',
        accessory: '리본',
        favoriteSubject: '미술',
        hobby: '요리',
        alibi: '미술실에서 다음 주 전시회에 낼 도자기 정물화를 그리고 있었어요. 리본도 새로 달고 있었답니다.'
      },
      {
        id: 'sus_jihoon',
        name: '박지훈 (게임광)',
        avatarSeed: 3,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '곱슬머리',
        clothingColor: '초록색',
        clothingType: '맨투맨',
        accessory: '모자',
        favoriteSubject: '과학',
        hobby: '게임',
        alibi: '체육관에서 농구를 열심히 하고 너무 지쳐서 혼자 벤치에서 모바일 게임을 하고 있었어요.'
      },
      {
        id: 'sus_yerin',
        name: '최예린 (피아노단)',
        avatarSeed: 4,
        gender: 'female',
        hairColor: '주황색',
        hairStyle: '긴 생머리',
        clothingColor: '노란색',
        clothingType: '반팔티',
        accessory: '귀걸이',
        favoriteSubject: '국어',
        hobby: '음악감상',
        alibi: '강당 피아노 앞에서 조용히 이어폰을 꽂은 채 밤새 연주곡 연습을 마친 후 교실에 왔어요.'
      }
    ],
    clues: [
      {
        id: 'clue1_1',
        text: '범인은 안경을 쓰고 있지 않습니다.',
        unlocked: false,
        puzzle: {
          question: '어려운 일이나 처음 해보는 일에도 무서워하지 않고 씩씩하게 도전하는 모습을 나타내는 IB 학습자상은 무엇일까요?',
          choices: ['도전하는 사람 (Risk-takers)', '성찰하는 사람 (Reflective)', '열린 마음 (Open-minded)', '균형 잡힌 사람 (Balanced)'],
          answerIdx: 0,
          hint: '용기 있게 새로운 도전을 즐기는 사람을 가리키는 멋진 말이에요.'
        }
      },
      {
        id: 'clue1_2',
        text: '범인은 머리가 검은색이 아닙니다.',
        unlocked: false,
        puzzle: {
          question: '궁금한 호기심이 생겼을 때 스스로 질문을 던지고, 답을 알아가기 위해 열심히 공부하고 질문하는 우리들의 올바른 모습은?',
          choices: ['탐구하는 사람 (Inquirers)', '지식이 많은 사람 (Knowledgeable)', '원칙을 지키는 사람 (Principled)', '소통하는 사람 (Communicators)'],
          answerIdx: 0,
          hint: '호기심 가득한 눈으로 스스로 답을 찾아 떠나는 탐험가를 떠올려 보세요.'
        }
      },
      {
        id: 'clue1_3',
        text: '범인은 머리가 구불구불한 곱슬머리 스타일을 하고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '친구가 넘어졌을 때 아프지 않은지 먼저 물어보고 도와주며, 늘 따뜻하게 챙겨주는 이쁜 마음을 뜻하는 IB 학습자상은?',
          choices: ['배려하는 사람 (Caring)', '열린 마음 (Open-minded)', '생각하는 사람 (Thinkers)', '균형 잡힌 사람 (Balanced)'],
          answerIdx: 0,
          hint: '남을 진심으로 위하고 돕고 사랑하는 따뜻한 태도입니다.'
        }
      }
    ]
  },
  {
    id: 'case_2',
    title: '사건 #2: 과학실의 거대 수박 실종 사건',
    difficulty: '쉬움',
    summary: '과학 탐구 과제로 가져다 둔 초대형 수박이 파먹혔습니다! 범인을 체포하세요.',
    introText: '여름 과학 관찰 실험을 위해 준비해 둔 아주 달콤하고 커다란 수박이 반쯤 맛있게 파먹힌 채 껍질만 덩그러니 과학실 구석에 남아 있었습니다. 범인의 특징을 분석하고 용의자들을 신문해 범인을 가려내세요!',
    culpritId: 'sus_jiwoo_2',
    suspects: [
      {
        id: 'sus_woojin_2',
        name: '정우진 (수학부장)',
        avatarSeed: 5,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '곱슬머리',
        clothingColor: '파란색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '수학',
        hobby: '독서',
        alibi: '저는 어제 도서관에서 친구와 함께 수학 기하학 도형 패턴을 분석하고 공부하고 있었답니다.'
      },
      {
        id: 'sus_jiwoo_2',
        name: '한지우 (과학부장)',
        avatarSeed: 6,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '짧은 컷',
        clothingColor: '파란색',
        clothingType: '맨투맨',
        accessory: '없음',
        favoriteSubject: '과학',
        hobby: '게임',
        alibi: '어제 과학실에서 돋보기와 현미경 청소를 하긴 했어요. 하지만 수박은 너무 무거워서 제가 들지도 못했을 거예요!'
      },
      {
        id: 'sus_ayoon_2',
        name: '신아윤 (미술부장)',
        avatarSeed: 7,
        gender: 'female',
        hairColor: '주황색',
        hairStyle: '단발머리',
        clothingColor: '초록색',
        clothingType: '셔츠',
        accessory: '모자',
        favoriteSubject: '과학',
        hobby: '요리',
        alibi: '운동장 뒤뜰 텃밭에서 맛있는 상추가 얼마나 잘 자라났는지 직접 관찰하고 사진을 정성껏 찍고 있었어요.'
      },
      {
        id: 'sus_haeun_2',
        name: '이하은 (체육부장)',
        avatarSeed: 8,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '긴 생머리',
        clothingColor: '노란색',
        clothingType: '반팔티',
        accessory: '리본',
        favoriteSubject: '체육',
        hobby: '음악감상',
        alibi: '강당 뒤편 음악실에서 신나는 댄스 스포츠 노래를 들으면서 즐겁게 안무 연습을 이어가던 중이었습니다.'
      }
    ],
    clues: [
      {
        id: 'clue2_1',
        text: '범인은 파란색 계열의 옷을 입었습니다.',
        unlocked: false,
        puzzle: {
          question: '나와 생각이 다른 친구의 이야기나 다른 나라의 새로운 문화도 "틀린 게 아니라 다른 거야"라며 넓은 마음으로 존중해주는 IB 태도는?',
          choices: ['열린 마음 (Open-minded)', '도전하는 사람 (Risk-takers)', '성찰하는 사람 (Reflective)', '지식이 많은 사람 (Knowledgeable)'],
          answerIdx: 0,
          hint: '마음을 활짝 열고 다양한 의견을 존중해주는 넓고 선량한 마음입니다.'
        }
      },
      {
        id: 'clue2_2',
        text: '범인은 리본이나 모자 같은 머리 장식을 일체 하지 않았습니다.',
        unlocked: false,
        puzzle: {
          question: '오늘 있었던 나의 말과 행동, 배운 공부 내용을 거울을 보듯 깊이 되짚어 보고 스스로를 성장시키려는 태도는?',
          choices: ['성찰하는 사람 (Reflective)', '배려하는 사람 (Caring)', '원칙을 지키는 사람 (Principled)', '탐구하는 사람 (Inquirers)'],
          answerIdx: 0,
          hint: '자신을 조용히 돌아보고 더 멋진 나로 성장해나가는 태도입니다.'
        }
      },
      {
        id: 'clue2_3',
        text: '범인이 가장 좋아하는 과목은 과학입니다.',
        unlocked: false,
        puzzle: {
          question: '내가 배운 지식이나 생각하고 느낀 것을 말과 글, 몸짓 등으로 다른 사람들에게 명확하고 친절하게 표현하여 이야기 나누는 역량은?',
          choices: ['소통하는 사람 (Communicators)', '생각하는 사람 (Thinkers)', '균형 잡힌 사람 (Balanced)', '지식이 많은 사람 (Knowledgeable)'],
          answerIdx: 0,
          hint: '서로 생각을 원활하게 주고받으며 함께 성장하도록 대화하는 멋진 모습입니다.'
        }
      }
    ]
  },
  {
    id: 'case_3',
    title: '사건 #3: 체육창고의 피구공 분실 사건',
    difficulty: '쉬움',
    summary: '체육 시간에 쓸 새 피구공들이 갑자기 창고에서 보이지 않습니다. 피구공의 행방을 쫓아보세요.',
    introText: '오후 체육 시간이 다 되었는데, 창고에 가지런히 보관되어 있던 번쩍번쩍 빛나는 새 피구공들이 몽땅 사라졌습니다! 창고 앞 모래밭에 떨어진 가방 단서들과 범인의 발자국을 뒤쫓아 범인을 찾아보세요.',
    culpritId: 'sus_sujung_3',
    suspects: [
      {
        id: 'sus_sujung_3',
        name: '최수정 (수영부)',
        avatarSeed: 9,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '긴 생머리',
        clothingColor: '노란색',
        clothingType: '반팔티',
        accessory: '귀걸이',
        favoriteSubject: '체육',
        hobby: '요리',
        alibi: '저는 아까 점심을 너무 많이 먹어서 운동장 트랙을 세 바퀴 크게 뛰며 개인 체력 단련을 하고 있었어요!'
      },
      {
        id: 'sus_hayoon_3',
        name: '유하윤 (배드민턴부)',
        avatarSeed: 10,
        gender: 'female',
        hairColor: '검은색',
        hairStyle: '단발머리',
        clothingColor: '빨간색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '국어',
        hobby: '음악감상',
        alibi: '배드민턴 라켓을 수리하기 위해 수사대 교무실 문을 두드려 양해를 구하고 수리 가위를 빌리러 다녀왔습니다.'
      },
      {
        id: 'sus_seojun_3',
        name: '강서준 (야구단)',
        avatarSeed: 11,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '짧은 컷',
        clothingColor: '노란색',
        clothingType: '셔츠',
        accessory: '없음',
        favoriteSubject: '체육',
        hobby: '게임',
        alibi: '안경 수리점에 다녀왔느라 수영장 안쪽 로비 구경만 하다가 수업 시작 소리를 듣고 급히 뛰어왔어요.'
      },
      {
        id: 'sus_eunwoo_3',
        name: '박은우 (축구부)',
        avatarSeed: 12,
        gender: 'male',
        hairColor: '주황색',
        hairStyle: '곱슬머리',
        clothingColor: '파란색',
        clothingType: '맨투맨',
        accessory: '귀걸이',
        favoriteSubject: '과학',
        hobby: '독서',
        alibi: '학교 도서관 한구석 빈 교실에서 조용히 자리를 잡고 과학 잡지를 한 권 뽑아서 끝까지 정독하고 있었어요.'
      }
    ],
    clues: [
      {
        id: 'clue3_1',
        text: '범인의 헤어스타일은 어깨 아래로 부드럽게 흐르는 긴 생머리입니다.',
        unlocked: false,
        puzzle: {
          question: '거짓말을 전혀 하지 않고 정직하며, 스스로 약속한 교실의 규칙들을 성실하게 잘 지키며 실천해나가는 이쁜 태도는?',
          choices: ['원칙을 지키는 사람 (Principled)', '배려하는 사람 (Caring)', '성찰하는 사람 (Reflective)', '도전하는 사람 (Risk-takers)'],
          answerIdx: 0,
          hint: '솔직하고 규칙을 소중히 잘 따르는 아름답고 올바른 모습을 가리킵니다.'
        }
      },
      {
        id: 'clue3_2',
        text: '범인은 노란색 계열의 옷을 입고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '탐구(Inquiry) 활동에서 사물을 탐험할 때 가장 가치 있고 먼저 해야 하는 태도는?',
          choices: ['궁금한 점에 대해 "왜 그럴까?" 질문하며 탐구하기', '어려운 질문은 피하고 쉬운 정답만 단순 암기하기', '친구의 학습지 내용을 그대로 베껴 적기', '스스로 생각하지 않고 검색으로만 해결하기'],
          answerIdx: 0,
          hint: '새로운 사실을 알아가는 지적 호기심의 출발점은 늘 "질문 던지기"입니다.'
        }
      },
      {
        id: 'clue3_3',
        text: '범인은 반짝이는 귀걸이를 착용하고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '아픈 친구에게 달려가 밴드를 붙여주고 보듬어주는, 세상을 더 따뜻한 곳으로 가꾸는 고운 IB 마음은?',
          choices: ['배려하는 사람 (Caring)', '열린 마음 (Open-minded)', '균형 잡힌 사람 (Balanced)', '원칙을 지키는 사람 (Principled)'],
          answerIdx: 0,
          hint: '타인의 고통에 공감하고 도움의 손길을 흔쾌히 내밀어 줄 수 있는 진정한 마음입니다.'
        }
      }
    ]
  },
  {
    id: 'case_4',
    title: '사건 #4: 도서관 비밀 열쇠 소동',
    difficulty: '보통',
    summary: '사서 선생님의 아주 소중한 비밀 서고 열쇠가 사라졌습니다. 단서를 분석해보세요.',
    introText: '도서관 깊숙한 곳, 귀중한 고대 역사 그림책들이 가득 들어있는 비밀 서고의 열쇠가 홀연히 자취를 감추었습니다. 책꽂이 틈새에서 떨어진 노란색 머리카락과 대출 확인 노트를 바탕으로 진짜 범인을 가려내세요!',
    culpritId: 'sus_minjae_4',
    suspects: [
      {
        id: 'sus_minjae_4',
        name: '임민재 (독서왕)',
        avatarSeed: 13,
        gender: 'male',
        hairColor: '노란색',
        hairStyle: '짧은 컷',
        clothingColor: '파란색',
        clothingType: '셔츠',
        accessory: '안경',
        favoriteSubject: '국어',
        hobby: '독서',
        alibi: '저는 사서실 바로 앞 창가 자리에서 무인 항공기 원리 책을 반납하고 새 소설책을 차분히 즐기고 있었어요.'
      },
      {
        id: 'sus_doyun_4',
        name: '윤도윤 (오락실짱)',
        avatarSeed: 14,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '곱슬머리',
        clothingColor: '빨간색',
        clothingType: '후드티',
        accessory: '모자',
        favoriteSubject: '체육',
        hobby: '게임',
        alibi: '체육 창고 구석에서 미니 스마트폰으로 동전 쌓기 게임을 하며 최고 점수를 갱신하고 자랑하던 참이었습니다.'
      },
      {
        id: 'sus_jia_4',
        name: '서지아 (베이킹짱)',
        avatarSeed: 15,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '긴 생머리',
        clothingColor: '노란색',
        clothingType: '반팔티',
        accessory: '리본',
        favoriteSubject: '미술',
        hobby: '요리',
        alibi: '가정실습실 오븐기 앞에서 고소한 쿠키를 어떻게 맛있게 구울지 미술 과제 일지에 꼼꼼히 기록하고 있었죠.'
      },
      {
        id: 'sus_eunwoo_4',
        name: '고은우 (피아니스트)',
        avatarSeed: 16,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '단발머리',
        clothingColor: '초록색',
        clothingType: '셔츠',
        accessory: '안경',
        favoriteSubject: '과학',
        hobby: '음악감상',
        alibi: '피아노 건반 음계를 맑게 튜닝하는 클래식 영상을 무선 이어폰으로 유용하게 시청하고 있었어요.'
      },
      {
        id: 'sus_haeun_4',
        name: '최하은 (수학교실)',
        avatarSeed: 17,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '곱슬머리',
        clothingColor: '노란색',
        clothingType: '셔츠',
        accessory: '안경',
        favoriteSubject: '수학',
        hobby: '게임',
        alibi: '컴퓨터실에서 수학 기하학 도형 패턴을 그리는 미니 웹 게임을 직접 혼자서 열정적으로 실행해 보고 있었습니다.'
      }
    ],
    clues: [
      {
        id: 'clue4_1',
        text: '범인은 노란색 머리카락을 가졌습니다.',
        unlocked: false,
        puzzle: {
          question: '실패하는 것을 한 번도 무서워하지 않고 씩씩하고 밝은 얼굴로 새로운 배움을 시작해 나가는 IB 학습자상의 멋진 모습은?',
          choices: ['도전하는 사람 (Risk-takers)', '생각하는 사람 (Thinkers)', '지식이 많은 사람 (Knowledgeable)', '성찰하는 사람 (Reflective)'],
          answerIdx: 0,
          hint: '실패는 배움의 과정이라며 넘어져도 다시 오뚝이처럼 씩씩하게 일어나는 용감한 어린이입니다.'
        }
      },
      {
        id: 'clue4_2',
        text: '범인은 안경을 세련되게 착용하고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '내가 한 말과 나의 행동 결과가 교실 친구들과 선생님에게 어떤 배움을 남겼을지 꼼꼼하게 다시 생각해보는 생각 깊은 습관은?',
          choices: ['성찰하는 사람 (Reflective)', '원칙을 지키는 사람 (Principled)', '배려하는 사람 (Caring)', '열린 마음 (Open-minded)'],
          answerIdx: 0,
          hint: '공부나 생각 후에 거울을 보듯 마음과 행동을 돌이켜 성장을 기하는 고운 습관입니다.'
        }
      },
      {
        id: 'clue4_3',
        text: '범인은 품이 넓은 단정한 셔츠를 입고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '나의 따뜻한 생각과 마음의 이야기들을 귀에 쏙쏙 잘 들리게 몸짓이나 글, 말로 친구들에게 예의 바르게 전해주는 모습은?',
          choices: ['소통하는 사람 (Communicators)', '탐구하는 사람 (Inquirers)', '지식이 많은 사람 (Knowledgeable)', '생각하는 사람 (Thinkers)'],
          answerIdx: 0,
          hint: '생각을 정직하게 소통하며 남을 도울 줄 아는 예의 바르고 훌륭한 마음입니다.'
        }
      },
      {
        id: 'clue4_4',
        text: '범인의 진짜 취미는 재미있는 독서입니다.',
        unlocked: false,
        puzzle: {
          question: '내가 제일 좋아하는 장난감 놀이 방법만 우기지 않고 다른 친구들이 알려준 다양하고 새로운 놀이 방법에도 귀를 쫑긋 기울여주는 예쁜 태도는?',
          choices: ['열린 마음 (Open-minded)', '도전하는 사람 (Risk-takers)', '균형 잡힌 사람 (Balanced)', '성찰하는 사람 (Reflective)'],
          answerIdx: 0,
          hint: '편견 없이 마음을 넓게 활짝 열고 새로운 생각을 적극적으로 수용하는 포용력입니다.'
        }
      }
    ]
  },
  {
    id: 'case_5',
    title: '사건 #5: 미술실의 거대 무지개 붓 사건',
    difficulty: '보통',
    summary: '미술 전시용 왕관을 칠할 무지개 색연필 붓이 사라졌습니다! 범인의 알리바이를 분석해 보세요.',
    introText: '미술 수채화 실습 시간에 커다란 전시 도화지 왕관을 화려하게 칠할 예정이던 알록달록한 보물 "거대 무지개 붓"이 순식간에 보이지 않게 되었습니다. 수채화 물감이 가볍게 묻은 흔적을 추적하여 숨어 있는 범인을 고르세요!',
    culpritId: 'sus_jia_5',
    suspects: [
      {
        id: 'sus_jia_5',
        name: '정지아 (미술공주)',
        avatarSeed: 18,
        gender: 'female',
        hairColor: '주황색',
        hairStyle: '단발머리',
        clothingColor: '빨간색',
        clothingType: '맨투맨',
        accessory: '없음',
        favoriteSubject: '미술',
        hobby: '요리',
        alibi: '저는 아침부터 요리실에서 달콤한 딸기 타르트를 오븐에 구워 보려고 조리법 책을 보고 있었습니다.'
      },
      {
        id: 'sus_hajun_5',
        name: '손하준 (달리기왕)',
        avatarSeed: 19,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '짧은 컷',
        clothingColor: '빨간색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '체육',
        hobby: '독서',
        alibi: '운동장 구석 벤치 그늘진 자리에 조용히 앉아서 주니어 공룡 백과사전을 정독하며 시간 가는 줄 모르고 있었어요.'
      },
      {
        id: 'sus_yeseo_5',
        name: '박이서 (수학왕)',
        avatarSeed: 20,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '곱슬머리',
        clothingColor: '빨간색',
        clothingType: '반팔티',
        accessory: '모자',
        favoriteSubject: '수학',
        hobby: '요리',
        alibi: '저는 요리 레시피에 들어갈 식재료들의 덧셈뺄셈 무게를 정밀 저울로 신기하게 재고 계산해보는 놀이를 하고 있었답니다.'
      },
      {
        id: 'sus_seoyun_5',
        name: '강서윤 (음악공주)',
        avatarSeed: 21,
        gender: 'female',
        hairColor: '주황색',
        hairStyle: '긴 생머리',
        clothingColor: '초록색',
        clothingType: '셔츠',
        accessory: '없음',
        favoriteSubject: '미술',
        hobby: '음악감상',
        alibi: '강당 옆 조용한 피아노 교실에 앉아서 은은하게 들려오는 클래식 선율을 에어팟 헤드폰으로 혼자 흥겹게 감상하는 중이었어요.'
      },
      {
        id: 'sus_jiwoo_5',
        name: '윤지우 (동화공주)',
        avatarSeed: 22,
        gender: 'female',
        hairColor: '검은색',
        hairStyle: '단발머리',
        clothingColor: '노란색',
        clothingType: '후드티',
        accessory: '리본',
        favoriteSubject: '국어',
        hobby: '게임',
        alibi: '수학 컴퓨터 전용 놀이 실습실에서 친구들이 알려준 블록 맞추기 한글 교육용 퍼즐 게임에 흠뻑 빠져 있었어요.'
      }
    ],
    clues: [
      {
        id: 'clue5_1',
        text: '범인은 화사한 빨간색 상의를 입고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '내가 세상을 위해 어떤 약속과 규칙을 바르게 지켜야 하는지 정직한 마음으로 생각하고 지키려는 멋진 모습은?',
          choices: ['원칙을 지키는 사람 (Principled)', '배려하는 사람 (Caring)', '성찰하는 사람 (Reflective)', '생각하는 사람 (Thinkers)'],
          answerIdx: 0,
          hint: '교실의 바른 약속과 행동 원칙을 소중하게 아주 솔직히 지켜나가는 바른 어린이를 떠올리세요.'
        }
      },
      {
        id: 'clue5_2',
        text: '범인의 헤어스타일은 세련되고 단정한 단발머리입니다.',
        unlocked: false,
        puzzle: {
          question: '어려운 일이나 지혜로운 정답이 필요할 때 머리를 모아 슬기로운 아이디어를 짜내 멋진 생각을 실천해보는 모습은?',
          choices: ['생각하는 사람 (Thinkers)', '지식이 많은 사람 (Knowledgeable)', '소통하는 사람 (Communicators)', '탐구하는 사람 (Inquirers)'],
          answerIdx: 0,
          hint: '머리를 슬기롭게 사용해 지혜롭고 멋진 해결책을 도출해내는 사람입니다.'
        }
      },
      {
        id: 'clue5_3',
        text: '범인은 안경이나 모자를 쓰지 않은 수수한 얼굴 상태입니다.',
        unlocked: false,
        puzzle: {
          question: '울고 있는 친구에게 따뜻하게 다가가 등을 토닥이며 달콤한 사탕 하나를 쥐어주는, 참으로 아름다운 친구의 태도는?',
          choices: ['배려하는 사람 (Caring)', '균형 잡힌 사람 (Balanced)', '열린 마음 (Open-minded)', '원칙을 지키는 사람 (Principled)'],
          answerIdx: 0,
          hint: '나보다 아프거나 힘든 사람을 온 힘을 다해 이타적으로 품어주는 배려의 마음입니다.'
        }
      },
      {
        id: 'clue5_4',
        text: '범인의 신나는 취미 생활은 요리입니다.',
        unlocked: false,
        puzzle: {
          question: '새로운 이야기책을 볼 때 왜 그렇게 소중하고 신기한 일들이 가득 일어날지 호기심 넘치는 반짝이는 눈으로 탐구하는 태도는?',
          choices: ['탐구하는 사람 (Inquirers)', '지식이 많은 사람 (Knowledgeable)', '성찰하는 사람 (Reflective)', '도전하는 사람 (Risk-takers)'],
          answerIdx: 0,
          hint: '눈을 반짝이며 "어째서 그럴까?"를 끊임없이 파헤치며 발견해나가는 참된 학습자의 모습입니다.'
        }
      }
    ]
  },
  {
    id: 'case_6',
    title: '사건 #6: 컴퓨터실의 황금 무선 마우스 사건',
    difficulty: '어려움',
    summary: '코딩 실습용으로 특별 제작된 황금 무선 마우스가 사라졌습니다! 용의자를 추리해 봅시다.',
    introText: '아이들이 엄청나게 좋아하는 로봇 코딩 제어용 최고급 번쩍이는 "황금 무선 마우스"가 홀연히 컴퓨터실 금고에서 온데간데없이 사라졌습니다. 센서 모니터 로그 기록에 표시된 인물들의 단서를 완벽하게 조합해 진짜 범인을 찾아 검거해내세요!',
    culpritId: 'sus_siwoo_6',
    suspects: [
      {
        id: 'sus_siwoo_6',
        name: '조시우 (코딩대장)',
        avatarSeed: 23,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '곱슬머리',
        clothingColor: '파란색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '과학',
        hobby: '게임',
        alibi: '저는 어젯밤에 컴퓨터실 앞자리에서 인공지능 자율 비행 로봇 제어 소스코드를 신기하게 테스트하고 있었어요!'
      },
      {
        id: 'sus_eunwoo_6',
        name: '임은우 (논리대장)',
        avatarSeed: 24,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '짧은 컷',
        clothingColor: '파란색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '수학',
        hobby: '독서',
        alibi: '저는 아까 수학 올림피아드 기출 도형 기하학 수수께끼 문제지 분석을 하느라 머리를 싸매며 도서실 구석에 박혀있었어요.'
      },
      {
        id: 'sus_jiho_6',
        name: '김지호 (요리대장)',
        avatarSeed: 25,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '짧은 컷',
        clothingColor: '빨간색',
        clothingType: '셔츠',
        accessory: '안경',
        favoriteSubject: '국어',
        hobby: '요리',
        alibi: '가정실습실 오븐 조리대 기기를 반장과 교대로 물걸레를 이용해 반짝반짝하고 말끔하게 윤이 나도록 세척하고 있던 중이었습니다.'
      },
      {
        id: 'sus_seoa_6',
        name: '박서아 (그림공주)',
        avatarSeed: 26,
        gender: 'female',
        hairColor: '검은색',
        hairStyle: '긴 생머리',
        clothingColor: '파란색',
        clothingType: '후드티',
        accessory: '안경',
        favoriteSubject: '미술',
        hobby: '음악감상',
        alibi: '미술 실기 가을 맞이 꽃밭 정물화 캔버스에 칠할 수채화 주홍색 물감을 교사 도구함에서 빌려와 붓으로 고이 칠하고 있었습니다.'
      },
      {
        id: 'sus_haeun_6',
        name: '최하은 (음악천사)',
        avatarSeed: 27,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '단발머리',
        clothingColor: '초록색',
        clothingType: '맨투맨',
        accessory: '모자',
        favoriteSubject: '수학',
        hobby: '독서',
        alibi: '컴퓨터 기기실 앞 대출 카운터 테이블 위에 공책을 펼쳐 두고, 수학 도형 패턴 계산 공식을 독서 일지에 가득 적고 있었답니다.'
      },
      {
        id: 'sus_siwoo_alt_6',
        name: '강시우 (운동대장)',
        avatarSeed: 28,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '짧은 컷',
        clothingColor: '노란색',
        clothingType: '후드티',
        accessory: '없음',
        favoriteSubject: '체육',
        hobby: '요리',
        alibi: '체육 창고 앞 농구 코트의 골대에 친구들과 농구 슛 골대 맞추기 미션을 10번이나 성공해보느라 온몸이 땀으로 다 젖어 있었어요.'
      }
    ],
    clues: [
      {
        id: 'clue6_1',
        text: '범인은 검은색 머리카락을 가졌습니다.',
        unlocked: false,
        puzzle: {
          question: '책도 즐겁고 유익하게 열심히 많이 읽고, 학교나 여러 교실에서 풍부하게 배워서 아는 것이 아주 똑똑하게 많은 사람을 가리키는 말은?',
          choices: ['지식이 많은 사람 (Knowledgeable)', '생각하는 사람 (Thinkers)', '탐구하는 사람 (Inquirers)', '성찰하는 사람 (Reflective)'],
          answerIdx: 0,
          hint: '다양한 지식과 유익한 생각들을 마음에 가득 정성껏 담아 깊은 지혜를 가진 사람입니다.'
        }
      },
      {
        id: 'clue6_2',
        text: '범인의 옷 종류는 뒤집어쓸 수 있는 모자가 달린 후드티입니다.',
        unlocked: false,
        puzzle: {
          question: '책공부뿐만 아니라 맛있는 밥과 건강 반찬도 편식하지 않고 골고루 튼튼하게 먹고, 운동도 신나게 하며 몸과 마음을 건강하게 조화롭게 키우는 사람은?',
          choices: ['균형 잡힌 사람 (Balanced)', '배려하는 사람 (Caring)', '원칙을 지키는 사람 (Principled)', '도전하는 사람 (Risk-takers)'],
          answerIdx: 0,
          hint: '어느 한쪽으로만 아예 치우치지 않고 매사 골고루 조화를 이루며 가꿔나가는 태도를 지칭합니다.'
        }
      },
      {
        id: 'clue6_3',
        text: '범인의 성별은 씩씩한 남학생(남성)입니다.',
        unlocked: false,
        puzzle: {
          question: '나와 얼굴 모습이 다른 세계의 많은 지구촌 어린이 친구들도 다 똑같이 소중한 우리들의 진정한 지구촌 이웃이라며 환한 미소로 안아주는 태도는?',
          choices: ['열린 마음 (Open-minded)', '소통하는 사람 (Communicators)', '배려하는 사람 (Caring)', '지식이 많은 사람 (Knowledgeable)'],
          answerIdx: 0,
          hint: '마음의 문을 활짝 힘차게 열고, 편견 없이 세상 모든 사람과 넓게 마주하며 경청하고 존중하는 모습입니다.'
        }
      },
      {
        id: 'clue6_4',
        text: '범인은 얼굴에 똑똑해 보이는 안경을 착용하고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '하루 일과나 미션 해결을 끝낸 후 내가 오늘 무엇을 깊이 있게 잘해냈고 더 멋진 행동을 할 수 있었을까 반성하는 깊고 사려 깊은 습관은?',
          choices: ['성찰하는 사람 (Reflective)', '원칙을 지키는 사람 (Principled)', '생각하는 사람 (Thinkers)', '탐구하는 사람 (Inquirers)'],
          answerIdx: 0,
          hint: '활동을 성실하게 되짚어보며 반성하고 성장의 원천으로 삼는 진실성 있는 반조 습관입니다.'
        }
      }
    ]
  },
  {
    id: 'case_7',
    title: '사건 #7: 음악실의 전설의 은빛 지휘봉 실종 사건',
    difficulty: '어려움',
    summary: '음악실 유리함에 안전히 모셔져 있던 전설의 은빛 지휘봉이 갑자기 사라졌습니다. 단서를 맞춰보세요.',
    introText: '학기 말 오케스트라 대합주 발표 공연 때 요긴하게 사용할 소중한 은빛 지휘봉이 음악실 보물 상자 유리 장식함에서 조용히 사라졌습니다. 현장의 보안 전자기기 기록과 용의자 신원 카드 분석 단서를 완벽하게 풀어 범인을 가려내세요!',
    culpritId: 'sus_eunwoo_7',
    suspects: [
      {
        id: 'sus_eunwoo_7',
        name: '강은우 (오케스트라단)',
        avatarSeed: 29,
        gender: 'male',
        hairColor: '주황색',
        hairStyle: '짧은 컷',
        clothingColor: '초록색',
        clothingType: '맨투맨',
        accessory: '모자',
        favoriteSubject: '미술',
        hobby: '독서',
        alibi: '저는 아까 독서 카드를 사서 대여실 데스크 수납함 서랍에 반납하고 역사 서적을 빌려 재미있게 정독하고 있었어요.'
      },
      {
        id: 'sus_doyun_7',
        name: '김도윤 (타악기전공)',
        avatarSeed: 30,
        gender: 'male',
        hairColor: '검은색',
        hairStyle: '곱슬머리',
        clothingColor: '초록색',
        clothingType: '후드티',
        accessory: '모자',
        favoriteSubject: '체육',
        hobby: '게임',
        alibi: '컴퓨터실 안쪽 전용 로비 테이블 벤치 구석에 홀로 앉아 무인 제어 로봇 구동 비행 시뮬레이터 미니 게임 모바일 체험을 하고 있었습니다.'
      },
      {
        id: 'sus_siwoo_7',
        name: '이시우 (지휘전공)',
        avatarSeed: 31,
        gender: 'male',
        hairColor: '노란색',
        hairStyle: '짧은 컷',
        clothingColor: '파란색',
        clothingType: '셔츠',
        accessory: '모자',
        favoriteSubject: '미술',
        hobby: '요리',
        alibi: '요리실 대형 오븐 전자레인지 조리법 기판을 선생님의 허락 하에 전원 콘센트 연결 상태 체크 수리를 가볍게 도와주고 왔어요.'
      },
      {
        id: 'sus_hayoon_7',
        name: '정하윤 (첼로전공)',
        avatarSeed: 32,
        gender: 'male',
        hairColor: '갈색',
        hairStyle: '짧은 컷',
        clothingColor: '초록색',
        clothingType: '맨투맨',
        accessory: '안경',
        favoriteSubject: '수학',
        hobby: '음악감상',
        alibi: '첼로 줄 음정 상태를 조용하게 조율하기 위해 튜닝 악기 상자 키트를 친구와 같이 찾아다니느라 바빴던 기억뿐입니다.'
      },
      {
        id: 'sus_yeseo_7',
        name: '박이서 (바이올린선수)',
        avatarSeed: 33,
        gender: 'female',
        hairColor: '주황색',
        hairStyle: '긴 생머리',
        clothingColor: '초록색',
        clothingType: '반팔티',
        accessory: '모자',
        favoriteSubject: '국어',
        hobby: '독서',
        alibi: '국어 교과서 책방 도서 분류 노트 더미에서 역사 주니어 인문학 소설 가을 맞이 한 권을 골라 자리에 앉아 쉼 없이 읽었습니다.'
      },
      {
        id: 'sus_chaewon_7',
        name: '윤채원 (플루트요정)',
        avatarSeed: 34,
        gender: 'female',
        hairColor: '노란색',
        hairStyle: '단발머리',
        clothingColor: '초록색',
        clothingType: '후드티',
        accessory: '리본',
        favoriteSubject: '미술',
        hobby: '요리',
        alibi: '도넛 레시피 공책에 적힌 무게 계산 수수께끼 수식을 미술 일기장 뒷면에 화사하고 알록달록하게 펜으로 스케치하고 있었습니다.'
      }
    ],
    clues: [
      {
        id: 'clue7_1',
        text: '범인은 눈이 시원한 초록색 상의 옷을 즐겨 입고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '내가 가지고 있는 좋은 정보나 아름다운 생각들을 말과 글, 행동으로 교실 친구들에게 성실하게 잘 설명해주는 모습은?',
          choices: ['소통하는 사람 (Communicators)', '생각하는 사람 (Thinkers)', '열린 마음 (Open-minded)', '배려하는 사람 (Caring)'],
          answerIdx: 0,
          hint: '생각과 마음을 따뜻하고 바르게 표현하여 멋진 친구 관계를 넓혀나가는 능력입니다.'
        }
      },
      {
        id: 'clue7_2',
        text: '범인의 헤어스타일은 정돈이 수월하고 세련된 짧은 컷입니다.',
        unlocked: false,
        puzzle: {
          question: '어려운 퀴즈나 탐구 과제가 가로막아도 포기하지 않고 지혜로운 생각과 상상력 있는 아이디어를 발휘해 멋지게 해결하는 모습은?',
          choices: ['생각하는 사람 (Thinkers)', '지식이 많은 사람 (Knowledgeable)', '도전하는 사람 (Risk-takers)', '성찰하는 사람 (Reflective)'],
          answerIdx: 0,
          hint: '머리를 똑 부러지게 지혜롭게 굴려 기발하고 성숙한 해결방법을 강구하는 자세입니다.'
        }
      },
      {
        id: 'clue7_3',
        text: '범인은 머리 정수리에 멋진 빨간 모자를 착용하고 있습니다.',
        unlocked: false,
        puzzle: {
          question: '자연 속에 신비로운 곤충이나 우주 행성을 볼 때 왜 그럴까 궁금한 질문을 연신 품으며 직접 알아가려 노력하는 훌륭한 탐구 자질은?',
          choices: ['탐구하는 사람 (Inquirers)', '지식이 많은 사람 (Knowledgeable)', '성찰하는 사람 (Reflective)', '소통하는 사람 (Communicators)'],
          answerIdx: 0,
          hint: '호기심 가득한 별빛 같은 눈동자로 왜 그럴까 스스로 끈기 있게 이유를 찾아나서는 주도적 태도입니다.'
        }
      },
      {
        id: 'clue7_4',
        text: '범인은 성별이 늠름한 남학생(남성)입니다.',
        unlocked: false,
        puzzle: {
          question: '어려운 퀴즈나 과제가 다가와도 한 번 시도해 보겠다며 씩씩하고 환하게 용기 내어 나아가는 빛나는 도전 정신은?',
          choices: ['도전하는 사람 (Risk-takers)', '균형 잡힌 사람 (Balanced)', '원칙을 지키는 사람 (Principled)', '배려하는 사람 (Caring)'],
          answerIdx: 0,
          hint: '실패가 있어도 배움의 발판으로 가치 있게 여겨 용감무쌍하게 웃으며 도전해 나가는 사람입니다.'
        }
      }
    ]
  }
];


export const DetectiveGame = ({ 
  soundEnabled, 
  onEarnXP, 
  onClose 
}: { 
  soundEnabled: boolean; 
  onEarnXP?: (amount: number) => void; 
  onClose?: () => void; 
}) => {
  const [gameState, setGameState] = useState<'lobby' | 'intro' | 'play' | 'success' | 'fail'>('lobby');
  const [gameMode, setGameMode] = useState<'story' | 'infinite'>('story');
  
  // Game States
  const [currentLevel, setCurrentLevel] = useState<number>(1);
  const [selectedCase, setSelectedCase] = useState<StoryCase | null>(null);
  const [activeClueIndex, setActiveClueIndex] = useState<number | null>(null);
  const [puzzleAnswerResult, setPuzzleAnswerResult] = useState<'correct' | 'wrong' | null>(null);
  const [selectedSuspectId, setSelectedSuspectId] = useState<string | null>(null);
  const [investigatedSuspects, setInvestigatedSuspects] = useState<string[]>([]); // Suspect IDs player checked
  const [clues, setClues] = useState<Clue[]>([]);
  const [solvedCases, setSolvedCases] = useState<string[]>([]);

  // Load solved cases from localStorage on mount
  useEffect(() => {
    try {
      const stored = localStorage.getItem('detective_solved_cases');
      if (stored) {
        setSolvedCases(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Error parsing solved cases:", e);
    }
  }, []);
  
  // Score / Score states
  const [score, setScore] = useState<number>(0);
  const [detectiveRank, setDetectiveRank] = useState<string>('인턴 수습 탐정 🔍');
  const [timer, setTimer] = useState<number>(90);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // Sound Mute Toggle local
  const [muteSound, setMuteSound] = useState<boolean>(!soundEnabled);

  // Update Detective Rank based on Score
  useEffect(() => {
    if (score >= 400) setDetectiveRank('전설의 명탐정 셜록 👑');
    else if (score >= 250) setDetectiveRank('수석 형사 기동대장 👮');
    else if (score >= 120) setDetectiveRank('공인 1급 베테랑 탐정 🌟');
    else if (score >= 50) setDetectiveRank('정식 공인 탐정 🕵️');
    else setDetectiveRank('인턴 수습 탐정 🔍');
  }, [score]);

  // Game timer for infinite mode
  useEffect(() => {
    if (gameState === 'play' && gameMode === 'infinite') {
      setTimer(Math.max(120 - currentLevel * 10, 50)); // decreasing time for higher levels
      timerIntervalRef.current = setInterval(() => {
        setTimer((prev) => {
          if (prev <= 1) {
            clearInterval(timerIntervalRef.current!);
            playSound('fail', !muteSound);
            setGameState('fail');
            return 0;
          }
          if (prev <= 10) {
            playSound('tick', !muteSound);
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [gameState, gameMode, currentLevel]);

  // Handle game start
  const startStoryCase = (story: StoryCase) => {
    playSound('click', !muteSound);
    setSelectedCase(story);
    setClues(story.clues.map(c => ({ ...c, unlocked: false })));
    setInvestigatedSuspects([]);
    setSelectedSuspectId(null);
    setActiveClueIndex(null);
    setGameState('intro');
  };

  const handleClueClick = (index: number) => {
    if (clues[index].unlocked) return; // already unlocked
    playSound('click', !muteSound);
    setActiveClueIndex(index);
    setPuzzleAnswerResult(null);
  };

  const handleAnswerSubmit = (choiceIdx: number) => {
    if (activeClueIndex === null || !selectedCase) return;
    const clue = clues[activeClueIndex];
    if (choiceIdx === clue.puzzle.answerIdx) {
      // Correct!
      playSound('clue', !muteSound);
      setPuzzleAnswerResult('correct');
      
      const updatedClues = [...clues];
      updatedClues[activeClueIndex].unlocked = true;
      setClues(updatedClues);

      // Award dynamic points
      setScore(prev => prev + 15);

      setTimeout(() => {
        setActiveClueIndex(null);
        setPuzzleAnswerResult(null);
      }, 1500);
    } else {
      // Wrong
      playSound('fail', !muteSound);
      setPuzzleAnswerResult('wrong');
      // small deduction or just lock out momentarily
      setTimeout(() => {
        setPuzzleAnswerResult(null);
      }, 1500);
    }
  };

  // Inspect / Interrogate suspect
  const handleInvestigateSuspect = (susId: string) => {
    playSound('click', !muteSound);
    if (!investigatedSuspects.includes(susId)) {
      setInvestigatedSuspects(prev => [...prev, susId]);
    }
    setSelectedSuspectId(susId);
  };

  // Arrest Accusation
  const handleArrestAccusation = (susId: string) => {
    if (!selectedCase) return;
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);

    if (susId === selectedCase.culpritId) {
      playSound('success', !muteSound);
      setGameState('success');
      // Save solved case
      if (!solvedCases.includes(selectedCase.id)) {
        const nextSolved = [...solvedCases, selectedCase.id];
        setSolvedCases(nextSolved);
        try {
          localStorage.setItem('detective_solved_cases', JSON.stringify(nextSolved));
        } catch (e) {
          console.error("Error saving solved cases:", e);
        }
      }
      // Major points
      const basePoints = selectedCase.difficulty === '어려움' ? 100 : selectedCase.difficulty === '보통' ? 70 : 50;
      const timeBonus = gameMode === 'infinite' ? Math.floor(timer / 2) : 20;
      const totalEarned = basePoints + timeBonus;
      setScore(prev => prev + totalEarned);
      if (onEarnXP) {
        onEarnXP(totalEarned);
      }
    } else {
      playSound('fail', !muteSound);
      setGameState('fail');
    }
  };

  const handleNextLevel = () => {
    playSound('click', !muteSound);
    // Go back to story lobby
    setGameState('lobby');
  };

  const resetCurrentCase = () => {
    if (!selectedCase) return;
    playSound('click', !muteSound);
    setClues(selectedCase.clues.map(c => ({ ...c, unlocked: false })));
    setInvestigatedSuspects([]);
    setSelectedSuspectId(null);
    setActiveClueIndex(null);
    setGameState('play');
  };

  // Renders a stylized vector avatar for a suspect based on their parameters
  const renderSuspectAvatar = (suspect: Suspect) => {
    const isCulpritStyle = selectedSuspectId === suspect.id;
    // Base themes derived from seed
    const bgColors = ['bg-amber-100', 'bg-blue-100', 'bg-emerald-100', 'bg-rose-100', 'bg-violet-100', 'bg-orange-100'];
    const selectedBg = bgColors[suspect.avatarSeed % bgColors.length];

    const hairColorsMap = {
      '검은색': 'bg-gray-900',
      '노란색': 'bg-amber-400',
      '갈색': 'bg-amber-800',
      '주황색': 'bg-orange-500'
    };
    const hairColorClass = hairColorsMap[suspect.hairColor];

    const clothingColorsMap = {
      '빨간색': 'bg-rose-500',
      '파란색': 'bg-sky-500',
      '초록색': 'bg-emerald-500',
      '노란색': 'bg-yellow-400'
    };
    const clothingColorClass = clothingColorsMap[suspect.clothingColor];

    return (
      <div className={`w-32 h-32 rounded-full ${selectedBg} relative overflow-hidden mx-auto flex items-center justify-center border-4 ${isCulpritStyle ? 'border-rose-500 scale-105' : 'border-gray-300'} transition-all shadow-inner`}>
        {/* 1. Hair Back (deep layer) */}
        {suspect.hairStyle === '긴 생머리' && (
          <div className={`w-24 h-26 ${hairColorClass} absolute top-6 rounded-b-3xl z-0`} />
        )}

        {/* 2. Head Shape */}
        <div className="w-16 h-16 bg-peach-200 rounded-full absolute top-7 bg-[#ffd2b3] z-10" />

        {/* 3. Hair Front / Layering (z-20) */}
        {suspect.hairStyle === '단발머리' && (
          <>
            {/* Top dome */}
            <div className={`w-20 h-10 ${hairColorClass} absolute top-4 rounded-t-full z-20`} />
            {/* Side bob bangs covering the cheeks */}
            <div className={`w-4 h-11 ${hairColorClass} absolute top-8 left-[22px] rounded-b-md z-20`} />
            <div className={`w-4 h-11 ${hairColorClass} absolute top-8 right-[22px] rounded-b-md z-20`} />
          </>
        )}
        {suspect.hairStyle === '짧은 컷' && (
          <>
            <div className={`w-18 h-7 ${hairColorClass} absolute top-5 rounded-t-lg z-20`} />
            {/* Sporty spikes on top */}
            <div className={`w-4 h-4 rotate-45 ${hairColorClass} absolute top-4 left-[38px] z-20`} />
            <div className={`w-4 h-4 rotate-45 ${hairColorClass} absolute top-4 left-[56px] z-20`} />
            <div className={`w-4 h-4 rotate-45 ${hairColorClass} absolute top-4 left-[74px] z-20`} />
          </>
        )}
        {suspect.hairStyle === '곱슬머리' && (
          <>
            {/* A large fluffy puffy curly mass made of overlapping spheres */}
            <div className={`w-22 h-14 ${hairColorClass} absolute top-3 rounded-full z-20 opacity-95`} />
            <div className={`w-6 h-6 rounded-full ${hairColorClass} absolute top-4 left-[20px] z-20`} />
            <div className={`w-6 h-6 rounded-full ${hairColorClass} absolute top-4 right-[20px] z-20`} />
            <div className={`w-7 h-7 rounded-full ${hairColorClass} absolute top-2 left-[36px] z-20`} />
            <div className={`w-7 h-7 rounded-full ${hairColorClass} absolute top-2 right-[36px] z-20`} />
            <div className={`w-5 h-5 rounded-full ${hairColorClass} absolute top-7 left-[18px] z-20`} />
            <div className={`w-5 h-5 rounded-full ${hairColorClass} absolute top-7 right-[18px] z-20`} />
          </>
        )}
        {suspect.hairStyle === '긴 생머리' && (
          <>
            {/* Front bangs and long side drapes going past shoulders */}
            <div className={`w-18 h-6 ${hairColorClass} absolute top-5 rounded-t-full z-20`} />
            <div className={`w-4.5 h-18 ${hairColorClass} absolute top-8 left-[21px] rounded-b-xl z-20`} />
            <div className={`w-4.5 h-18 ${hairColorClass} absolute top-8 right-[21px] rounded-b-xl z-20`} />
          </>
        )}

        {/* 4. Clothing (z-25) */}
        <div className={`w-24 h-16 ${clothingColorClass} absolute bottom-0 rounded-t-3xl flex justify-center pt-2 z-25`}>
          {suspect.clothingType === '셔츠' && (
            <div className="w-0 h-0 border-l-[8px] border-l-transparent border-r-[8px] border-r-transparent border-t-[8px] border-t-white" />
          )}
          {suspect.clothingType === '후드티' && (
            <div className="w-6 h-4 rounded-full bg-black/10 absolute -top-1" />
          )}
        </div>

        {/* 5. Eyes & Smile - Top-most facial detail (z-30) */}
        <div className="flex gap-4 absolute top-12 z-30">
          <div className="w-2.5 h-2.5 bg-gray-950 rounded-full" />
          <div className="w-2.5 h-2.5 bg-gray-950 rounded-full" />
        </div>
        <div className="w-6 h-3 border-b-2 border-gray-950 rounded-b-full absolute top-16 z-30 bg-transparent" />

        {/* 6. Glasses Accessory (z-40) */}
        {suspect.accessory === '안경' && (
          <div className="absolute top-10 flex gap-2 z-40">
            <div className="w-6 h-6 border-2 border-black rounded-full bg-black/5" />
            <div className="w-6 h-6 border-2 border-black rounded-full bg-black/5" />
          </div>
        )}

        {/* 7. Headwear Accessories (z-40) */}
        {suspect.accessory === '모자' && (
          <div className="w-16 h-6 bg-rose-600 absolute top-3 rounded-t-full border-b-2 border-rose-800 z-40">
            <div className="w-6 h-2 bg-rose-700 absolute -right-2 top-2 rounded-r-full" />
          </div>
        )}
        {suspect.accessory === '리본' && (
          <div className="w-6 h-4 bg-pink-500 rounded-full absolute top-4 -right-1 z-40 rotate-12 flex items-center justify-center">
            <div className="w-2 h-2 bg-pink-600 rounded-full" />
          </div>
        )}
        {suspect.accessory === '귀걸이' && (
          <div className="w-2 h-2 bg-yellow-400 rounded-full absolute top-12 left-5 z-40" />
        )}
      </div>
    );
  };

  return (
    <div className="w-full min-h-[600px] bg-[#1a171e] text-gray-100 font-sans relative select-none p-4 md:p-6 flex flex-col justify-between overflow-y-auto">
      
      {/* HEADER SECTION */}
      <header className="flex items-center justify-between border-b border-gray-800 pb-3 mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-950/40 border border-rose-800/60 rounded-xl text-rose-400">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tight text-white flex items-center gap-1.5">
              명탐정 코너: <span className="text-rose-400">범인 찾기 수사팀</span>
            </h1>
            <p className="text-[11px] text-gray-400 font-extrabold">{detectiveRank} (수사 성과: {score} XP)</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setMuteSound(!muteSound)}
            className="p-2 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white transition-all cursor-pointer"
            title={muteSound ? '소리 켜기' : '음소거'}
          >
            {muteSound ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>
          
          {gameState !== 'lobby' && (
            <button 
              onClick={() => {
                if(confirm('진행 중인 사건 수사를 중단하고 로비로 나갈까요?')) {
                  setGameState('lobby');
                }
              }}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-rose-900/40 hover:text-rose-300 border border-transparent hover:border-rose-900/60 text-xs font-bold transition-all cursor-pointer"
            >
              사건 종료
            </button>
          )}

          {onClose && (
            <button 
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg bg-gray-800 hover:bg-gray-700 text-gray-400 hover:text-white border border-gray-700 text-xs font-bold transition-all cursor-pointer"
            >
              나가기
            </button>
          )}
        </div>
      </header>

      {/* LOBBY / CASE BOARD */}
      {gameState === 'lobby' && (
        <div className="flex-1 flex flex-col justify-center py-4 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/30 rounded-3xl flex items-center justify-center mx-auto text-rose-400 shadow-xl shadow-rose-950/20 mb-2">
              <Search className="w-10 h-10 animate-pulse" />
            </div>
            <h2 className="text-2xl font-black text-white">사건 파일을 선택하십시오</h2>
            <p className="text-xs text-gray-400 leading-relaxed font-semibold">
              교실과 연구실에서 기이한 소동이 벌어졌습니다! <br />
              지식 퀴즈가 걸린 단서들을 지능적으로 해독해 진짜 범인을 체포하고 멋진 명탐정이 되어보세요.
            </p>
          </div>

          <div className="max-w-2xl mx-auto w-full">
            {/* Story Mode Block */}
            <div className="bg-gray-900/60 border border-gray-800 rounded-3xl p-6 flex flex-col space-y-4">
              <div>
                <span className="px-2.5 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-full text-[10px] font-black uppercase tracking-wider">
                  스토리 추리 모드
                </span>
                <h3 className="text-lg font-black text-white mt-2">📖 클래스 사건 수사 일지</h3>
                <p className="text-[11px] text-gray-400 mt-1 font-semibold">
                  교내 여러 소동 사건을 해결하고 수사 포인트를 모아보세요!
                </p>
              </div>

              <div className="space-y-2.5">
                {STORY_CASES.map((scase) => {
                  const isSolved = solvedCases.includes(scase.id);
                  return (
                    <button
                      key={scase.id}
                      onClick={() => startStoryCase(scase)}
                      className={`w-full text-left p-4 rounded-2xl transition-all group flex items-center justify-between cursor-pointer ${
                        isSolved 
                          ? "bg-emerald-950/20 hover:bg-emerald-900/30 border border-emerald-800/60 hover:border-emerald-600/60 shadow-[0_0_15px_-3px_rgba(16,185,129,0.1)]" 
                          : "bg-gray-950/80 hover:bg-gray-800/80 border border-gray-800 hover:border-rose-800/40"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-sm font-black text-white transition-colors ${
                            isSolved ? 'group-hover:text-emerald-400' : 'group-hover:text-rose-400'
                          }`}>
                            {scase.title}
                          </span>
                          <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${
                            scase.difficulty === '쉬움' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {scase.difficulty}
                          </span>
                          {isSolved && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-emerald-500 text-white flex items-center gap-0.5 shadow-sm">
                              <CheckCircle className="w-2.5 h-2.5" /> 해결 완료!
                            </span>
                          )}
                        </div>
                        <p className="text-[10px] text-gray-500 mt-1 font-medium leading-relaxed">{scase.summary}</p>
                      </div>
                      {isSolved ? (
                        <CheckCircle className="w-5 h-5 text-emerald-400 group-hover:scale-110 transition-all flex-shrink-0 ml-4" />
                      ) : (
                        <Play className="w-5 h-5 text-gray-500 group-hover:text-rose-400 group-hover:translate-x-1 transition-all flex-shrink-0 ml-4" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* STORY INTRO DIALOG */}
      {gameState === 'intro' && selectedCase && (
        <div className="flex-1 flex flex-col justify-center max-w-2xl mx-auto w-full py-4 space-y-6">
          <div className="bg-gray-900/80 border border-gray-800 rounded-[2.5rem] p-6 md:p-8 space-y-6 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-6 text-gray-800/20">
              <Compass className="w-36 h-36" />
            </div>

            <div className="space-y-2">
              <span className="px-3 py-1 bg-rose-500/10 text-rose-400 border border-rose-500/25 rounded-full text-xs font-black">
                사건 브리핑
              </span>
              <h2 className="text-2xl font-black text-white mt-2">{selectedCase.title}</h2>
              <div className="h-0.5 bg-gray-800 my-2" />
            </div>

            <div className="bg-gray-950/80 p-5 rounded-2xl border border-gray-800/60 leading-relaxed text-sm text-gray-300 font-semibold shadow-inner">
              "{selectedCase.introText}"
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <div className="flex items-center gap-2 text-xs text-gray-400 font-extrabold">
                <User className="w-4 h-4 text-rose-500" />
                수사 대상: 용의자 {selectedCase.suspects.length}명
                <span className="mx-1">•</span>
                잠금 단서: {selectedCase.clues.length}개
              </div>

              <button
                onClick={() => {
                  playSound('click', !muteSound);
                  setGameState('play');
                }}
                className="w-full sm:w-auto px-6 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-sm rounded-xl transition-all shadow-md shadow-rose-900/20 flex items-center justify-center gap-2 cursor-pointer"
              >
                현장 투입 및 수사 개시
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CORE ACTIVE INVESTIGATION VIEW */}
      {gameState === 'play' && selectedCase && (
        <div className="flex-1 flex flex-col lg:flex-row gap-5">
          
          {/* LEFT: CRIME SCENE BOARD (Suspect Grid) */}
          <div className="flex-1 bg-gray-950/40 border border-gray-800 rounded-3xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex justify-between items-center mb-3">
                <span className="text-xs font-black text-gray-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 bg-rose-500 rounded-full animate-ping" />
                  용의자 분석 게시판 (아래에서 신문 및 지목 가능)
                </span>
                
                {gameMode === 'infinite' && (
                  <div className="flex items-center gap-2 text-yellow-500 bg-yellow-950/20 px-2.5 py-1 border border-yellow-900/40 rounded-lg text-xs font-black">
                    <Clock className="w-3.5 h-3.5 animate-spin" />
                    제한 시간: {timer}초
                  </div>
                )}
              </div>

              {/* Suspect Polaroid Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {selectedCase.suspects.map((suspect) => {
                  const isChecked = investigatedSuspects.includes(suspect.id);
                  const isSelected = selectedSuspectId === suspect.id;
                  
                  return (
                    <motion.div
                      key={suspect.id}
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInvestigateSuspect(suspect.id)}
                      className={`relative cursor-pointer bg-white p-2.5 pb-4 rounded-lg shadow-lg flex flex-col justify-between space-y-2 border-4 transition-all ${
                        isSelected 
                          ? 'border-rose-500 bg-rose-50/10' 
                          : isChecked 
                            ? 'border-gray-200 opacity-90' 
                            : 'border-white'
                      }`}
                    >
                      {/* Avatar Wrapper */}
                      <div className="w-full aspect-square rounded-md overflow-hidden bg-gray-50 flex items-center justify-center relative">
                        {renderSuspectAvatar(suspect)}
                        
                        {/* Checked Tag */}
                        {isChecked && (
                          <span className="absolute top-1 right-1 bg-indigo-600 text-white text-[8px] font-black px-1.5 py-0.5 rounded shadow-sm">
                            분석 완료
                          </span>
                        )}
                      </div>

                      {/* Info bottom */}
                      <div className="text-center">
                        <span className="text-[11px] font-black text-gray-900 block truncate">{suspect.name}</span>
                        <span className="text-[9px] font-bold text-gray-400 block mt-0.5 truncate">{suspect.favoriteSubject} 전공</span>
                        
                        {/* Hairstyle & Haircolor labels for absolute clarity */}
                        <div className="flex flex-wrap gap-1 justify-center mt-1">
                          <span className="text-[8px] font-black bg-rose-50 text-rose-700 px-1 py-0.5 rounded border border-rose-100/60">
                            {suspect.hairStyle}
                          </span>
                          <span className="text-[8px] font-black bg-slate-100 text-slate-800 px-1 py-0.5 rounded">
                            {suspect.hairColor}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>

            {/* Suspect Detail & Alibi Investigation section */}
            <div className="mt-4 bg-gray-900/60 border border-gray-800 rounded-2xl p-4 min-h-[140px] flex flex-col justify-between">
              {selectedSuspectId ? (
                (() => {
                  const s = selectedCase.suspects.find(sus => sus.id === selectedSuspectId)!;
                  return (
                    <div className="h-full flex flex-col justify-between space-y-3">
                      <div>
                        <div className="flex items-center justify-between">
                          <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                            <span className="w-2.5 h-2.5 bg-rose-500 rounded-full" />
                            {s.name} 용의자 상세 심문록
                          </h4>
                          <span className="text-[10px] font-black text-rose-400 bg-rose-950/40 px-2 py-0.5 rounded border border-rose-900/40">
                            {s.gender === 'male' ? '남학생' : '여학생'}
                          </span>
                        </div>
                        
                        {/* Profile Grid */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-[10px] text-gray-300 mt-2.5 border-t border-b border-gray-800 py-2">
                          <div>• 머리: <span className="text-white font-bold">{s.hairColor} / {s.hairStyle}</span></div>
                          <div>• 액세서리: <span className="text-white font-bold">{s.accessory}</span></div>
                          <div>• 의상: <span className="text-white font-bold">{s.clothingColor} {s.clothingType}</span></div>
                          <div>• 취미: <span className="text-white font-bold">{s.hobby}</span></div>
                        </div>

                        {/* Alibi Text */}
                        <div className="mt-2 text-xs text-gray-400 italic bg-gray-950/60 p-2 rounded border border-gray-800/80 font-medium">
                          " {s.alibi} "
                        </div>
                      </div>

                      {/* Action Accusation */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleArrestAccusation(s.id)}
                          className="flex-1 py-2 bg-gradient-to-r from-rose-600 to-red-600 hover:from-rose-500 hover:to-red-500 text-white font-black text-xs rounded-xl shadow-lg shadow-rose-950/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <ShieldAlert className="w-4 h-4" />
                          이 용의자를 범인으로 지목하여 체포하기
                        </button>
                      </div>
                    </div>
                  );
                })()
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center text-gray-500 py-6">
                  <User className="w-8 h-8 text-gray-700 mb-1" />
                  <p className="text-xs font-bold">인물 폴라로이드 카드를 클릭하시면</p>
                  <p className="text-[10px] text-gray-600 font-semibold mt-0.5">상세 프로필 정보 수사 및 범인 체포가 활성화됩니다.</p>
                </div>
              )}
            </div>
          </div>

          {/* RIGHT: DECRYPTION / LOCK CLUES BOARD */}
          <div className="w-full lg:w-80 bg-gray-900/60 border border-gray-800 rounded-3xl p-4 flex flex-col justify-between space-y-4">
            <div className="space-y-3">
              <h3 className="text-sm font-black text-white flex items-center gap-1.5 border-b border-gray-800 pb-2">
                <Lightbulb className="w-4 h-4 text-rose-400" />
                수사 분석실 (단서 잠금 해제)
              </h3>
              
              <div className="space-y-2.5">
                {clues.map((clue, idx) => (
                  <div
                    key={clue.id}
                    onClick={() => handleClueClick(idx)}
                    className={`p-3 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      clue.unlocked 
                        ? 'bg-emerald-950/20 border-emerald-800/50 text-emerald-300' 
                        : activeClueIndex === idx
                          ? 'bg-rose-950/40 border-rose-500/80 text-rose-200 shadow-md'
                          : 'bg-gray-950/80 border-gray-800 text-gray-400 hover:border-gray-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-wider flex items-center gap-1">
                        {clue.unlocked ? <CheckCircle className="w-3.5 h-3.5 text-emerald-400" /> : <Unlock className="w-3 h-3 text-rose-400 animate-pulse" />}
                        단서 {idx + 1}
                      </span>
                      <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-gray-800 text-gray-400">
                        {clue.unlocked ? '분석 해제' : '암호 잠김'}
                      </span>
                    </div>

                    <p className={`text-xs font-black leading-relaxed ${clue.unlocked ? 'text-white' : 'text-gray-500 font-medium'}`}>
                      {clue.unlocked ? clue.text : '⚠️ IB 분석 미션을 풀어 단서를 해금하세요.'}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Active Riddle Overlay */}
            <AnimatePresence>
              {activeClueIndex !== null && (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="bg-gray-950 p-4 rounded-2xl border border-rose-500/30 space-y-3.5 shadow-xl"
                >
                  <div className="flex justify-between items-center border-b border-gray-800 pb-1.5">
                    <span className="text-[10px] font-black text-rose-400">단서 {activeClueIndex + 1} 해금 분석 미션</span>
                    <button 
                      onClick={() => setActiveClueIndex(null)}
                      className="text-xs font-black text-gray-500 hover:text-white"
                    >
                      취소
                    </button>
                  </div>

                  <p className="text-[11px] font-bold text-gray-200 leading-relaxed bg-gray-900 p-2.5 rounded-lg">
                    {clues[activeClueIndex].puzzle.question}
                  </p>

                  <div className="space-y-1.5">
                    {clues[activeClueIndex].puzzle.choices.map((choice, cIdx) => (
                      <button
                        key={cIdx}
                        onClick={() => handleAnswerSubmit(cIdx)}
                        disabled={puzzleAnswerResult !== null}
                        className="w-full text-left p-2 bg-gray-900 hover:bg-gray-800 border border-gray-800 rounded-xl text-[10px] font-bold text-gray-300 hover:text-white transition-all cursor-pointer flex items-center justify-between"
                      >
                        <span>{cIdx + 1}. {choice}</span>
                      </button>
                    ))}
                  </div>

                  {puzzleAnswerResult === 'correct' && (
                    <div className="bg-emerald-950/40 text-emerald-400 text-xs font-black p-2 rounded-xl text-center flex items-center justify-center gap-1.5 border border-emerald-800/40">
                      <Smile className="w-4 h-4 animate-bounce" /> 정답! 단서가 해독되었습니다!
                    </div>
                  )}

                  {puzzleAnswerResult === 'wrong' && (
                    <div className="bg-rose-950/40 text-rose-400 text-xs font-black p-2 rounded-xl text-center flex items-center justify-center gap-1.5 border border-rose-800/40">
                      <Frown className="w-4 h-4 animate-shake" /> 앗! 오답입니다. 다시 추론해보세요!
                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      )}

      {/* GAME SUCCESS SCREEN */}
      {gameState === 'success' && selectedCase && (
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full py-4 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border-4 border-emerald-500 rounded-[2.5rem] p-8 space-y-6 shadow-2xl relative overflow-hidden"
          >
            <div className="w-24 h-24 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mx-auto text-emerald-400">
              <Award className="w-12 h-12" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-emerald-400 bg-emerald-950/40 px-3 py-1 rounded-full border border-emerald-900/30 uppercase tracking-widest">
                Mission Complete
              </span>
              <h2 className="text-2xl font-black text-white mt-2">사건 해결! 진짜 범인을 검거했습니다!</h2>
              <p className="text-[11px] text-gray-400 leading-relaxed font-semibold">
                진범: <span className="text-white font-extrabold">{selectedCase.suspects.find(s => s.id === selectedCase.culpritId)?.name}</span> 용의자
              </p>
            </div>

            <div className="bg-gray-950/80 p-4 rounded-2xl border border-gray-800 text-left space-y-2">
              <p className="text-xs text-gray-300 font-bold leading-relaxed">
                🔍 <span className="text-emerald-400 font-black">수사 기록:</span> 현장에 남은 알리바이 모순과 단서가 정확히 검거된 범인의 신상 명세와 일치합니다! 명석한 두뇌와 고도의 추론 실력으로 범죄 없는 클린 클래스를 수호하셨습니다.
              </p>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  playSound('click', !muteSound);
                  setGameState('lobby');
                }}
                className="flex-1 py-3 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                사건첩 목록으로
              </button>
              
              <button
                onClick={handleNextLevel}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-lg shadow-rose-950/20 flex items-center justify-center gap-1 cursor-pointer"
              >
                {gameMode === 'infinite' ? `레벨 ${currentLevel + 1} 도전` : '다음 사건 수사하기'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* GAME FAILURE SCREEN */}
      {gameState === 'fail' && selectedCase && (
        <div className="flex-1 flex flex-col justify-center max-w-lg mx-auto w-full py-4 text-center space-y-6">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-gray-900 border-4 border-rose-600 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
          >
            <div className="w-20 h-20 bg-rose-500/10 border border-rose-500/25 rounded-full flex items-center justify-center mx-auto text-rose-500">
              <AlertTriangle className="w-10 h-10" />
            </div>

            <div className="space-y-2">
              <span className="text-xs font-black text-rose-400 bg-rose-950/40 px-3 py-1 rounded-full border border-rose-900/30">
                수사 실패
              </span>
              <h2 className="text-xl font-black text-white mt-2">무고한 용의자를 지목하거나 시간이 초과되었습니다!</h2>
              <p className="text-xs text-gray-400 leading-relaxed font-semibold">
                진범은 다른 용의자였습니다. 범인은 증거를 인멸하고 교실 밖으로 빠져나갔습니다!
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => {
                  playSound('click', !muteSound);
                  setGameState('lobby');
                }}
                className="flex-1 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-black text-xs rounded-xl transition-all cursor-pointer"
              >
                수사 포기 및 목록으로
              </button>
              
              <button
                onClick={resetCurrentCase}
                className="flex-1 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs rounded-xl transition-all shadow-md shadow-rose-950/25 flex items-center justify-center gap-1 cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                이 사건 다시 수사하기
              </button>
            </div>
          </motion.div>
        </div>
      )}

      {/* FOOTER SECTION */}
      <footer className="text-center text-[10px] text-gray-600 font-extrabold border-t border-gray-800/60 pt-2.5 mt-4">
        🔍 IB 명탐정 범인찾기 • 데이터 및 단서 분석을 통한 융합형 사고력 퀴즈 게임
      </footer>
    </div>
  );
};
