import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ArrowLeft, Globe, Award, Sparkles, Coins, CheckCircle, Trophy, RefreshCw, Star } from 'lucide-react';
import { UserProfile, Landmark } from '../../types';
import { LandmarkMap } from './LandmarkMap';
import { QuizModal } from './QuizModal';

// High-quality static backup list of landmarks in case fetch is delayed or public directory is not fully resolved yet.
const DEFAULT_LANDMARKS: Landmark[] = [
  {
    id: "gyeongbokgung",
    name: "경복궁",
    country: "대한민국",
    continent: "아시아",
    image: "https://images.unsplash.com/photo-1541747157478-27f3c6e5f3f0?auto=format&fit=crop&w=600&q=80",
    question: "조선 시대의 대표 궁궐이자, 서울에 위치하여 '큰 복을 누리라'는 뜻이 담겨 있는 법궁은 무엇일까요?",
    choices: ["경복궁", "창덕궁", "덕수궁", "경희궁"],
    answerIdx: 0,
    x: 81.0,
    y: 39.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "greatwall_30",
    name: "만리장성",
    country: "중국",
    continent: "아시아",
    image: "https://images.unsplash.com/photo-1508804185872-d7badad00f7d?auto=format&fit=crop&w=600&q=80",
    question: "중국의 북쪽 국경을 보호하기 위해 지어진 세계적으로 유명한 매우 긴 성벽은 무엇일까요?",
    choices: ["만리장성", "병마용갱", "자금성", "천안문"],
    answerIdx: 0,
    x: 77.0,
    y: 38.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "tajmahal_30",
    name: "타지마할",
    country: "인도",
    continent: "아시아",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    question: "흰 대리석 건축물로 유명하며, 무굴 제국의 황제 샤 자한이 사랑하는 왕비를 기리기 위해 세운 인도의 대표 랜드마크는 무엇일까요?",
    choices: ["타지마할", "앙코르와트", "자금성", "콜로세움"],
    answerIdx: 0,
    x: 68.0,
    y: 48.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "fuji_30",
    name: "후지산",
    country: "일본",
    continent: "아시아",
    image: "https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?auto=format&fit=crop&w=600&q=80",
    question: "눈 덮인 대칭적인 원뿔 모양으로 유명하며, 예술 작품에도 자주 등장하는 일본을 대표하는 가장 높은 활화산은 무엇일까요?",
    choices: ["후지산", "아소산", "에베레스트산", "킬리만자로"],
    answerIdx: 0,
    x: 83.0,
    y: 40.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "angkorwat_30",
    name: "앙코르와트",
    country: "캄보디아",
    continent: "아시아",
    image: "https://images.unsplash.com/photo-1608958416744-8df6f8818ec6?auto=format&fit=crop&w=600&q=80",
    question: "캄보디아 국기에도 그려져 있으며, 고대 크메르 제국의 찬란한 문명을 보여주는 세계적인 거대 사원 유적은 어디일까요?",
    choices: ["앙코르와트", "타지마할", "보로부두르 사원", "자금성"],
    answerIdx: 0,
    x: 76.5,
    y: 53.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "eiffel_30",
    name: "에펠탑",
    country: "프랑스",
    continent: "유럽",
    image: "https://images.unsplash.com/photo-1502602898657-3e91760cbb34?auto=format&fit=crop&w=600&q=80",
    question: "1889년 파리 만국박람회를 위해 세워졌으며, 오늘날 프랑스와 파리를 상징하는 대표적인 철탑은 무엇일까요?",
    choices: ["에펠탑", "피사의 사탑", "빅벤", "런던 탑"],
    answerIdx: 0,
    x: 48.0,
    y: 34.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "colosseum_30",
    name: "콜로세움",
    country: "이탈리아",
    continent: "유럽",
    image: "https://images.unsplash.com/photo-1552832230-c0197dd311b5?auto=format&fit=crop&w=600&q=80",
    question: "고대 로마 제국 시대에 지어진 대표적인 원형 경기장으로, 검투사들의 격투와 경기 등이 열렸던 역사적 유적지는 어디일까요?",
    choices: ["콜로세움", "판테온", "포로 로마노", "피사의 사탑"],
    answerIdx: 0,
    x: 52.0,
    y: 39.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "bigben_30",
    name: "빅벤",
    country: "영국",
    continent: "유럽",
    image: "https://images.unsplash.com/photo-1513635269975-59663e0ca1ad?auto=format&fit=crop&w=600&q=80",
    question: "영국 런던 국회의사당의 북쪽 끝에 위치한 세계적으로 유명한 대형 시계탑 종의 별명이자 대표 랜드마크는 무엇일까요?",
    choices: ["빅벤", "에펠탑", "피사의 사탑", "브란덴부르크 문"],
    answerIdx: 0,
    x: 47.0,
    y: 32.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "sagrada_30",
    name: "사그라다 파밀리아",
    country: "스페인",
    continent: "유럽",
    image: "https://images.unsplash.com/photo-1583779457094-abdfbf843b0c?auto=format&fit=crop&w=600&q=80",
    question: "스페인 바르셀로나에 위치하며, 천재 건축가 안토니 가우디가 설계한 후 아직까지도 건설이 진행 중인 독특한 성당의 이름은 무엇일까요?",
    choices: ["사그라다 파밀리아", "노트르담 성당", "성 베드로 대성당", "웨스트민스터 사원"],
    answerIdx: 0,
    x: 47.5,
    y: 37.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "santorini_30",
    name: "산토리니",
    country: "그리스",
    continent: "유럽",
    image: "https://images.unsplash.com/photo-1533105079780-92b9be482077?auto=format&fit=crop&w=600&q=80",
    question: "에게해에 위치해 있으며, 아름다운 절벽을 따라 늘어선 하얀 집과 파란 돔 지붕의 풍경이 유명한 그리스의 섬은 어디일까요?",
    choices: ["산토리니", "발리", "몰디브", "마요르카"],
    answerIdx: 0,
    x: 54.0,
    y: 41.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "statue_30",
    name: "자유의 여신상",
    country: "미국",
    continent: "북아메리카",
    image: "https://images.unsplash.com/photo-1524413840807-0c3cb6fa808d?auto=format&fit=crop&w=600&q=80",
    question: "프랑스가 미국의 독립 100주년을 기념하여 선물하였으며, 뉴욕 항구에서 횃불을 들고 서 있는 상징적인 동상의 이름은 무엇일까요?",
    choices: ["자유의 여신상", "모아이 석상", "스핑크스", "거대 예수상"],
    answerIdx: 0,
    x: 28.0,
    y: 38.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "grandcanyon_30",
    name: "그랜드캐니언",
    country: "미국",
    continent: "북아메리카",
    image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=600&q=80",
    question: "오랜 세월 동안 콜로라도 강물에 의해 깎여서 형성된 미국 애리조나주의 경이롭고 거대한 협곡은 무엇일까요?",
    choices: ["그랜드캐니언", "이과수 폭포", "킬리만자로", "옐로스톤"],
    answerIdx: 0,
    x: 20.0,
    y: 41.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "chichen_30",
    name: "치첸이트사",
    country: "멕시코",
    continent: "북아메리카",
    image: "https://images.unsplash.com/photo-1512813583145-ac554ac82e54?auto=format&fit=crop&w=600&q=80",
    question: "멕시코 유카탄 반도에 위치하며, 마야 문명의 천문 지식과 독특한 계단식 쿠쿨칸 피라미드로 명성이 높은 유적지는 어디일까요?",
    choices: ["치첸이트사", "마추픽추", "앙코르와트", "기자의 피라미드"],
    answerIdx: 0,
    x: 23.5,
    y: 49.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "cntower_30",
    name: "CN타워",
    country: "캐나다",
    continent: "북아메리카",
    image: "https://images.unsplash.com/photo-1507608869274-d3177c8bb4c7?auto=format&fit=crop&w=600&q=80",
    question: "캐나다 토론토 스카이라인을 대표하며, 과거 세계에서 가장 높았던 초고층 송신/전망 탑의 명칭은 무엇일까요?",
    choices: ["CN타워", "도쿄타워", "타이베이 101", "에펠탑"],
    answerIdx: 0,
    x: 27.5,
    y: 36.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "niagara_30",
    name: "나이아가라 폭포",
    country: "캐나다·미국",
    continent: "북아메리카",
    image: "https://images.unsplash.com/photo-1461988310357-74631215c8c9?auto=format&fit=crop&w=600&q=80",
    question: "미국 and 캐나다 국경 지대에 걸쳐 있으며, 어마어마한 낙차와 엄청난 수량으로 세계 삼대 폭포 중 하나로 손꼽히는 폭포는 무엇일까요?",
    choices: ["나이아가라 폭포", "빅토리아 폭포", "이과수 폭포", "천지연 폭포"],
    answerIdx: 0,
    x: 27.0,
    y: 36.5,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "christ_30",
    name: "예수상",
    country: "브라질",
    continent: "남아메리카",
    image: "https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=600&q=80",
    question: "브라질 리우데자네이루의 코르코바두 산 정상에 우뚝 서서 도시를 내려다보고 있는 거대한 팔 벌린 조각상은 무엇일까요?",
    choices: ["예수상", "자유의 여신상", "모아이 석상", "스핑크스"],
    answerIdx: 0,
    x: 38.0,
    y: 69.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "machu_30",
    name: "마추픽추",
    country: "페루",
    continent: "남아메리카",
    image: "https://images.unsplash.com/photo-1509024644558-2f56ce76c490?auto=format&fit=crop&w=600&q=80",
    question: "페루 안데스 산맥 높은 고지대에 꼭꼭 숨겨져 있어 '공중 도시'라고 불리는 신비로운 잉카 제국의 유적지는 어디일까요?",
    choices: ["마추픽추", "치첸이트사", "콜로세움", "앙코르와트"],
    answerIdx: 0,
    x: 31.0,
    y: 64.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "iguazu_30",
    name: "이과수 폭포",
    country: "브라질·아르헨티나",
    continent: "남아메리카",
    image: "https://images.unsplash.com/photo-1582967788606-a171c1080cb0?auto=format&fit=crop&w=600&q=80",
    question: "브라질과 아르헨티나 경계에 위치하며, '악마의 목구멍'이라 불리는 가장 큰 물줄기를 품고 있는 세계 최대 규모의 폭포 지대는 무엇일까요?",
    choices: ["이과수 폭포", "나이아가라 폭포", "빅토리아 폭포", "안헬 폭포"],
    answerIdx: 0,
    x: 35.5,
    y: 71.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "galapagos_30",
    name: "갈라파고스",
    country: "에콰도르",
    continent: "남아메리카",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80",
    question: "찰스 다윈의 진화론 영감을 준 곳으로, 코끼리거북, 바다이구아나 등 희귀하고 다양한 독특한 동물들이 보존되어 있는 화산 제도는 어디일까요?",
    choices: ["갈라파고스", "산토리니", "보라보라섬", "이스터섬"],
    answerIdx: 0,
    x: 25.0,
    y: 58.0,
    xpGained: 150,
    coinGained: 30
  },
  {
    id: "moai_30",
    name: "모아이 석상",
    country: "칠레",
    continent: "남아메리카",
    image: "https://images.unsplash.com/photo-1510011579267-478dbb419994?auto=format&fit=crop&w=600&q=80",
    question: "칠레 영토이자 남태평양 외딴 섬인 이스터 섬에 세워져 있는 미스터리한 거대 인간 얼굴 모양의 석상들은 무엇일까요?",
    choices: ["모아이 석상", "스핑크스", "거대 예수상", "아부심벨"],
    answerIdx: 0,
    x: 21.0,
    y: 73.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "pyramid_30",
    name: "기자 피라미드",
    country: "이집트",
    continent: "아프리카",
    image: "https://images.unsplash.com/photo-1503177119275-0aa32b3a9368?auto=format&fit=crop&w=600&q=80",
    question: "고대 이집트 파라오의 무덤이자 세계 7대 불가사의 중 하나로 손꼽히는 거대한 삼각 사각뿔 형태의 이집트 유적은 무엇일까요?",
    choices: ["기자 피라미드", "스핑크스", "치첸이트사", "마추픽추"],
    answerIdx: 0,
    x: 55.0,
    y: 46.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "sphinx_30",
    name: "스핑크스",
    country: "이집트",
    continent: "아프리카",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80",
    question: "사람의 머리와 사자의 몸을 하고 있으며, 고대 피라미드의 수호신으로 든든하게 기자 사막을 지키고 서 있는 유명한 석상은 무엇일까요?",
    choices: ["스핑크스", "모아이 석상", "자유의 여신상", "그리핀"],
    answerIdx: 0,
    x: 55.2,
    y: 46.2,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "kilimanjaro_30",
    name: "킬리만자로",
    country: "탄자니아",
    continent: "아프리카",
    image: "https://images.unsplash.com/photo-1518156677180-95a2893f3e9f?auto=format&fit=crop&w=600&q=80",
    question: "적도 인근에 위치함에도 불구하고 정상 부근에 만년설이 존재하며, 아프리카 대륙에서 가장 높은 영산은 무엇일까요?",
    choices: ["킬리만자로", "후지산", "에베레스트산", "백두산"],
    answerIdx: 0,
    x: 58.0,
    y: 58.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "victoria_30",
    name: "빅토리아 폭포",
    country: "잠비아·짐바브웨",
    continent: "아프리카",
    image: "https://images.unsplash.com/photo-1461988310357-74631215c8c9?auto=format&fit=crop&w=600&q=80",
    question: "잠비아와 짐바브웨 국경에 걸쳐 있으며, 원주민들이 '천둥치는 연기'라고 불렀던 장대하고 격렬한 낙차의 아프리카 폭포는 무엇일까요?",
    choices: ["빅토리아 폭포", "나이아가라 폭포", "이과수 폭포", "엔젤 폭포"],
    answerIdx: 0,
    x: 54.5,
    y: 67.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "hassan_30",
    name: "하산 2세 모스크",
    country: "모로코",
    continent: "아프리카",
    image: "https://images.unsplash.com/photo-1539650116574-8efeb43e2750?auto=format&fit=crop&w=600&q=80",
    question: "대서양이 훤히 바라보이는 모로코 카사블랑카 해안가에 건축된 모스크로, 웅장하고 아름다운 이슬람 사원은 무엇일까요?",
    choices: ["하산 2세 모스크", "블루 모스크", "타지마할", "성소피아 성당"],
    answerIdx: 0,
    x: 44.5,
    y: 40.0,
    xpGained: 150,
    coinGained: 30
  },
  {
    id: "opera_30",
    name: "시드니 오페라하우스",
    country: "호주",
    continent: "오세아니아",
    image: "https://images.unsplash.com/photo-1523482596112-99d81b109407?auto=format&fit=crop&w=600&q=80",
    question: "조개껍데기나 선박의 하얀 돛을 연상시키는 조형미 넘치는 디자인으로 유명한 오스트레일리아 시드니의 상징적인 공연 예술 시설은 무엇일까요?",
    choices: ["시드니 오페라하우스", "콜로세움", "빅벤", "CN타워"],
    answerIdx: 0,
    x: 88.0,
    y: 78.0,
    xpGained: 100,
    coinGained: 20
  },
  {
    id: "uluru_30",
    name: "울루루",
    country: "호주",
    continent: "오세아니아",
    image: "https://images.unsplash.com/photo-1529108190281-9a4f620bc2d8?auto=format&fit=crop&w=600&q=80",
    question: "오스트레일리아 대륙 한가운데 있는 세상에서 가장 거대한 단일 붉은 사암 바위이자, 원주민 아난구 족의 성스러운 성지는 무엇일까요?",
    choices: ["울루루", "그랜드캐니언", "후지산", "킬리만자로"],
    answerIdx: 0,
    x: 84.0,
    y: 75.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "milford_30",
    name: "밀포드사운드",
    country: "뉴질랜드",
    continent: "오세아니아",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=600&q=80",
    question: "뉴질랜드 남섬 피오르랜드 국립공원에 위치하여, 신비로운 피오르드 협곡과 깊은 폭포 절경으로 가득한 이곳은 어디일까요?",
    choices: ["밀포드사운드", "산토리니", "갈라파고스", "보라보라섬"],
    answerIdx: 0,
    x: 92.5,
    y: 84.0,
    xpGained: 120,
    coinGained: 25
  },
  {
    id: "samoa_30",
    name: "모아나누이 해변",
    country: "사모아",
    continent: "오세아니아",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    question: "남태평양 폴리네시아 중심부에 위치한 아름다운 섬나라 사모아의 대표적인 에메랄드빛 해안 명소는 어느 대륙 권역에 속할까요?",
    choices: ["오세아니아", "아시아", "남아메리카", "아프리카"],
    answerIdx: 0,
    x: 97.0,
    y: 72.0,
    xpGained: 150,
    coinGained: 30
  },
  {
    id: "borabora_30",
    name: "보라보라섬",
    country: "프랑스령 폴리네시아",
    continent: "오세아니아",
    image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=600&q=80",
    question: "에메랄드 빛깔의 얕은 라군과 멋진 산호초, 그리고 바다 위에 세워진 수상 방갈로로 널리 알려진 세계 최고의 휴양 섬은 어디일까요?",
    choices: ["보라보라섬", "산토리니", "발리", "이스터섬"],
    answerIdx: 0,
    x: 98.5,
    y: 71.0,
    xpGained: 150,
    coinGained: 30
  }
];

interface LandmarkExplorerProps {
  profile: UserProfile | null;
  onEarnXP: (
    xp: number, 
    activityType?: any, 
    accuracy?: number, 
    duration?: number, 
    questAmount?: number,
    extraData?: Partial<UserProfile>
  ) => Promise<void>;
  soundEnabled: boolean;
  setView: (view: any) => void;
}

export default function LandmarkExplorer({
  profile,
  onEarnXP,
  soundEnabled,
  setView
}: LandmarkExplorerProps) {
  const [landmarks, setLandmarks] = useState<Landmark[]>(DEFAULT_LANDMARKS);
  const [selectedLandmark, setSelectedLandmark] = useState<Landmark | null>(null);
  const [showBadgeCeremony, setShowBadgeCeremony] = useState<boolean>(false);
  const [isResetting, setIsResetting] = useState<boolean>(false);

  // Attempt to fetch fresh landmarks.json if it's customized/overwritten on server
  useEffect(() => {
    fetch('/landmarks.json')
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error('Not found or invalid JSON');
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setLandmarks(data);
        }
      })
      .catch((err) => {
        console.log('Using default pre-seeded landmarks list.', err);
      });
  }, []);

  const completedIds = profile?.completedLandmarks || [];
  const currentCoins = profile?.coins || 0;
  const currentXP = profile?.score || 0;
  const earnedBadges = profile?.earnedBadges || [];

  const handleSelectLandmark = (id: string) => {
    let found = landmarks.find(lm => lm.id === id);
    
    // Fallback: If id is numeric (e.g., from custom SVG), find by sequential index
    if (!found && /^\d+$/.test(id)) {
      const idx = parseInt(id, 10) - 1;
      if (idx >= 0 && idx < landmarks.length) {
        found = landmarks[idx];
      }
    }

    // Fallback: Find by name
    if (!found) {
      found = landmarks.find(lm => lm.name === id);
    }

    if (found) {
      setSelectedLandmark(found);
    }
  };

  const handleQuizSuccess = async (xpGained: number, coinGained: number) => {
    if (!profile || !selectedLandmark) return;

    const landmarkId = selectedLandmark.id;
    if (completedIds.includes(landmarkId)) return; // Already rewarded

    const newCompletedLandmarks = [...completedIds, landmarkId];
    const newCoins = currentCoins + coinGained;

    // Check if player has completed ALL landmarks in the current loaded list
    let finalEarnedBadges = [...earnedBadges];
    let isMasterCompleted = false;

    if (newCompletedLandmarks.length === landmarks.length && !earnedBadges.includes('world_explorer_master')) {
      finalEarnedBadges.push('world_explorer_master');
      isMasterCompleted = true;
    }

    // Call atomically updated onEarnXP to update Firestore & State
    const updatePayload: Partial<UserProfile> = {
      coins: newCoins,
      completedLandmarks: newCompletedLandmarks,
      earnedBadges: finalEarnedBadges
    };

    await onEarnXP(
      xpGained, 
      'study', // Activity type 
      1, // Accuracy
      30, // Duration
      1, // Quest amount
      updatePayload
    );

    // If master completion badge was earned, trigger ceremony!
    if (isMasterCompleted) {
      setTimeout(() => {
        setShowBadgeCeremony(true);
        // Play badge reward sound
        try {
          const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContext && soundEnabled) {
            const ctx = new AudioContext();
            const osc = ctx.createOscillator();
            const gain = ctx.createGain();
            osc.connect(gain);
            gain.connect(ctx.destination);
            osc.type = 'sawtooth';
            // Arpeggio sound
            osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
            osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.15); // E5
            osc.frequency.setValueAtTime(783.99, ctx.currentTime + 0.3); // G5
            osc.frequency.setValueAtTime(1046.50, ctx.currentTime + 0.45); // C6
            gain.gain.setValueAtTime(0.1, ctx.currentTime);
            gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.8);
            osc.start();
            osc.stop(ctx.currentTime + 0.8);
          }
        } catch (e) {
          console.warn(e);
        }
      }, 800);
    }
  };

  // Reset Exploration function
  const handleResetExploration = async () => {
    if (!profile) return;
    if (!window.confirm('랜드마크 탐험 내역을 초기화하시겠습니까? (XP와 코인은 그대로 유지됩니다)')) return;

    setIsResetting(true);
    
    // Remove completedLandmarks but keep XP and Coins
    const finalEarnedBadges = earnedBadges.filter(b => b !== 'world_explorer_master');
    const updatePayload: Partial<UserProfile> = {
      completedLandmarks: [],
      earnedBadges: finalEarnedBadges
    };

    await onEarnXP(
      0, // 0 XP gain
      'study',
      1,
      10,
      0,
      updatePayload
    );

    setIsResetting(false);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 md:px-8 pb-24" id="landmark-explorer-container">
      {/* Upper Navigation Row */}
      <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <button
          onClick={() => setView('home')}
          className="flex items-center gap-2 px-5 py-2.5 bg-white hover:bg-slate-100 rounded-2xl shadow-sm border border-slate-200 text-slate-700 hover:text-slate-950 transition-all font-black text-sm group cursor-pointer"
          id="btn-back-to-home"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>메인 화면으로</span>
        </button>

        {/* Stats Row */}
        <div className="flex flex-wrap items-center gap-4 bg-white px-6 py-4 rounded-[2rem] border border-slate-100 shadow-sm">
          {/* XP */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-indigo-50 rounded-xl flex items-center justify-center text-indigo-600">
              <Star className="w-5 h-5 fill-indigo-500 text-indigo-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">현재 XP</p>
              <p className="text-sm font-black text-slate-900">{currentXP.toLocaleString()} XP</p>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-100" />

          {/* COINS */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-amber-50 rounded-xl flex items-center justify-center text-amber-500">
              <Coins className="w-5 h-5 fill-amber-500 text-amber-500" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">탐험 코인</p>
              <p className="text-sm font-black text-slate-900">{currentCoins.toLocaleString()} <span className="text-[10px] text-slate-400">코인</span></p>
            </div>
          </div>

          <div className="w-px h-8 bg-slate-100" />

          {/* COMPLETED */}
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600">
              <CheckCircle className="w-5 h-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">탐험 완료</p>
              <p className="text-sm font-black text-slate-900">
                {completedIds.length} <span className="text-[10px] text-slate-400">/ {landmarks.length} 개</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Main Container Area */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Left column sidebar information */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="bg-gradient-to-br from-indigo-900 via-slate-900 to-slate-950 text-white rounded-[2rem] p-6 shadow-xl border border-indigo-950 relative overflow-hidden">
            {/* Ambient Background decoration */}
            <div className="absolute -top-12 -right-12 w-32 h-32 bg-indigo-500/20 rounded-full blur-2xl" />
            <div className="absolute -bottom-12 -left-12 w-32 h-32 bg-sky-500/20 rounded-full blur-2xl" />

            <div className="relative z-10 flex flex-col gap-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 flex items-center justify-center border border-indigo-500/30">
                <Globe className="w-6 h-6 text-sky-300 animate-spin-slow" />
              </div>

              <div>
                <h2 className="text-xl font-black text-white tracking-tight">랜드마크 세계탐험대</h2>
                <p className="text-xs text-indigo-200 font-bold mt-1.5 leading-relaxed">
                  세계의 위대한 역사적 랜드마크를 방문하여 퀴즈 미션을 해결하고 탐험 지식을 늘려보세요!
                </p>
              </div>

              <div className="mt-4 pt-4 border-t border-indigo-950/60 flex flex-col gap-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200">기본 미션 보상</span>
                  <span className="font-bold text-amber-400">+50 XP / +10 코인</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                  <span className="text-indigo-200">탐험 완주 기념 뱃지</span>
                  <span className="font-bold text-emerald-400 flex items-center gap-1">
                    <Trophy className="w-3.5 h-3.5" /> 세계 탐험대 마스터
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Exploration Badges Card */}
          <div className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm">
            <h3 className="text-sm font-black text-slate-900 mb-4 flex items-center gap-2">
              <Award className="w-4 h-4 text-indigo-600" />
              <span>획득한 탐험 뱃지</span>
            </h3>

            <div className="flex flex-col gap-3">
              {earnedBadges.includes('world_explorer_master') ? (
                <div className="flex items-center gap-3 p-3 bg-gradient-to-r from-amber-50 to-amber-100/30 border border-amber-200 rounded-2xl">
                  <div className="w-10 h-10 rounded-xl bg-amber-500 flex items-center justify-center text-white text-lg font-bold shadow-md shadow-amber-200">
                    🏆
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-amber-950">세계 탐험대 마스터</h4>
                    <p className="text-[10px] text-amber-800 font-bold mt-0.5">10개 랜드마크 정복 완료!</p>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-2xl opacity-60">
                  <div className="w-10 h-10 rounded-xl bg-slate-200 flex items-center justify-center text-slate-400 text-lg font-bold">
                    🔒
                  </div>
                  <div>
                    <h4 className="text-xs font-black text-slate-500">세계 탐험대 마스터</h4>
                    <p className="text-[10px] text-slate-400 mt-0.5">모든 랜드마크 탐험 시 해제</p>
                  </div>
                </div>
              )}
            </div>

            {/* Reset button at bottom of badges */}
            {completedIds.length > 0 && (
              <button
                disabled={isResetting}
                onClick={handleResetExploration}
                className="mt-6 w-full py-2.5 bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 border border-slate-200 hover:border-red-200 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span>탐험 내역 초기화</span>
              </button>
            )}
          </div>
        </div>

        {/* Map area (Full remaining grid) */}
        <div className="lg:col-span-3 bg-white rounded-[2rem] p-6 border border-slate-200 shadow-sm flex flex-col gap-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <Globe className="w-5 h-5 text-indigo-600" />
              <span>세계 지도 탐험 코너</span>
            </h3>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-full font-bold">
              완료: {completedIds.length} / {landmarks.length}
            </span>
          </div>

          {/* Interactive World Map */}
          <LandmarkMap
            landmarks={landmarks}
            completedIds={completedIds}
            onSelectLandmark={handleSelectLandmark}
          />
        </div>
      </div>

      {/* Quiz Modal */}
      {selectedLandmark && (
        <QuizModal
          landmark={selectedLandmark}
          isOpen={selectedLandmark !== null}
          onClose={() => setSelectedLandmark(null)}
          onSuccess={handleQuizSuccess}
          isCompleted={completedIds.includes(selectedLandmark.id)}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Badge Ceremony Ceremony Dialog */}
      <AnimatePresence>
        {showBadgeCeremony && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ type: 'spring', damping: 15 }}
              className="relative w-full max-w-md bg-gradient-to-b from-indigo-950 to-slate-950 border border-indigo-500/30 rounded-[2.5rem] p-8 text-center text-white shadow-2xl overflow-hidden flex flex-col items-center gap-6"
            >
              {/* Confetti Particles Background */}
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(99,102,241,0.15),transparent_60%)]" />

              <div className="relative w-24 h-24 rounded-full bg-gradient-to-r from-amber-400 via-yellow-300 to-amber-500 p-1 animate-bounce shadow-xl shadow-amber-500/20">
                <div className="w-full h-full rounded-full bg-slate-950 flex items-center justify-center text-4xl">
                  🏆
                </div>
              </div>

              <div className="flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-center gap-1.5 text-amber-400 text-xs font-black uppercase tracking-widest">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>NEW ACHIEVEMENT UNLOCKED</span>
                  <Sparkles className="w-4 h-4 animate-pulse" />
                </div>
                <h3 className="text-2xl font-black text-white tracking-tight">세계 탐험대 마스터!</h3>
                <p className="text-slate-300 text-xs font-medium leading-relaxed max-w-xs mx-auto mt-2">
                  지구상 가장 위대한 10대 랜드마크의 수수께끼를 모두 풀어 역사와 지리 탐험 미션을 정복한 탐험대원에게 이 명예로운 마스터 뱃지를 드립니다!
                </p>
              </div>

              {/* Reward Icon Card */}
              <div className="w-full p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center gap-3 relative z-10">
                <div className="text-amber-400 text-xl font-bold">🥇</div>
                <div className="text-left">
                  <p className="text-[10px] text-indigo-300 font-bold">훈장 자격 획득</p>
                  <p className="text-xs font-black text-white">세계 탐험 훈장이 프로필에 영구 등록되었습니다!</p>
                </div>
              </div>

              <button
                onClick={() => setShowBadgeCeremony(false)}
                className="relative z-10 w-full py-4 bg-gradient-to-r from-indigo-500 to-sky-500 hover:from-indigo-600 hover:to-sky-600 text-white font-black rounded-2xl shadow-xl transition-all hover:scale-105 cursor-pointer text-sm"
              >
                영광을 받겠습니다
              </button>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
