export interface IBContent {
  title: string;
  description: string;
  details: string[];
  examples?: string[];
  image?: string;
}

export const ibLearnerProfile: IBContent[] = [
  {
    title: "탐구하는 사람 (Inquirers)",
    description: "호기심을 키워 스스로 탐구하고 연구합니다. 평생 학습에 대한 열의를 잃지 않습니다.",
    image: "https://i.imgur.com/mLsOOQ4.png",
    details: [
      "수업 중 '왜 그럴까?'를 스스로 제기하고 직접 조사한다.",
      "사회 개념을 '우리 반 회의에도 적용할 수 있을까?'라고 생각해본다.",
      "단원이 끝난 뒤에도 새 궁금증이 생겨 혼자 더 찾아본다."
    ]
  },
  {
    title: "지식이 풍부한 사람 (Knowledgeable)",
    description: "개념적 이해를 통해 지식을 넓히고 교과 간 연결을 발견합니다.",
    image: "https://i.imgur.com/58oI1lV.png",
    details: [
      "수학 비율을 경제 성장률 그래프에 연결한다.",
      "환경 오염 문제를 과학·사회·경제 교과와 연결해 설명한다.",
      "교과서 밖 책이나 다큐멘터리를 통해 세계 문제에 관심을 갖는다."
    ]
  },
  {
    title: "사고하는 사람 (Thinkers)",
    description: "비판적·창의적으로 복잡한 문제를 분석하고 합리적·윤리적 의사결정을 주도합니다.",
    image: "https://i.imgur.com/u0f25H3.png",
    details: [
      "'이 정보가 신뢰할 만한가?'를 따져보고 근거를 제시한다.",
      "다수결이 항상 옳지 않을 수 있음을 사례로 설명한다.",
      "같은 문제를 여러 관점에서 바라보고 더 나은 해결책을 제안한다."
    ]
  },
  {
    title: "소통하는 사람 (Communicators)",
    description: "다양한 방법으로 창의적·자신감 있게 자신을 표현하며 경청하고 협력합니다.",
    image: "https://i.imgur.com/piOHQhF.png",
    details: [
      "토의에서 상대 의견을 요약한 뒤 자신의 생각을 덧붙인다.",
      "발표 자료를 글·그림·표·영상 등 다양한 형태로 제작한다.",
      "의견 충돌 시 중재하고 합의를 이끌어낸다."
    ]
  },
  {
    title: "원칙을 지키는 사람 (Principled)",
    description: "정직·성실하게 행동하며 행동과 결과에 책임을 집니다.",
    image: "https://i.imgur.com/tj0lqTY.png",
    details: [
      "보고서에서 출처를 빠짐없이 표기하고 무단 인용을 하지 않는다.",
      "어려운 역할을 맡았을 때도 끝까지 완수한다.",
      "잘못된 상황을 보고 침묵하지 않고 올바른 목소리를 낸다."
    ]
  },
  {
    title: "열린 마음을 가진 사람 (Open-minded)",
    description: "다양한 문화·관점을 비판적으로 수용하고 다양성에서 배웁니다.",
    image: "https://i.imgur.com/LiTuK7r.png",
    details: [
      "역사 사건을 가해자와 피해자 양측 관점 모두에서 분석한다.",
      "다른 나라 제도를 '틀린 것'이 아닌 '다른 것'으로 이해한다.",
      "자신의 견해가 편견일 수 있음을 인식하고 수정한다."
    ]
  },
  {
    title: "배려하는 사람 (Caring)",
    description: "서로 공감하고 존중하며 봉사 정신으로 지역사회에 긍정적 변화를 만듭니다.",
    image: "https://i.imgur.com/Af0AX5G.png",
    details: [
      "어려움을 겪는 친구에게 먼저 다가가 도움을 제안한다.",
      "환경 보호 캠페인을 기획하고 직접 실천한다.",
      "학교 폭력 예방 포스터를 만들어 게시한다."
    ]
  },
  {
    title: "도전하는 사람 (Risk-takers)",
    description: "불확실성에 도전하고 새로운 전략을 모색하며 실패에서 배웁니다.",
    image: "https://i.imgur.com/vGHnUtr.png",
    details: [
      "한 번도 해보지 않은 방식으로 프로젝트를 시도한다.",
      "발표가 두렵지만 용기 내어 나서서 탐구 결과를 공유한다.",
      "틀린 답에서 '왜 틀렸지?'를 분석해 더 나은 방법을 찾는다."
    ]
  },
  {
    title: "균형잡힌 사람 (Balanced)",
    description: "지적·신체·정서적 균형을 유지하며 상호 의존을 인식합니다.",
    image: "https://i.imgur.com/BOugKcR.png",
    details: [
      "학습뿐 아니라 운동·취미·휴식을 균형 있게 관리한다.",
      "혼자 잘하는 것보다 팀 전체의 성장을 위해 협력한다.",
      "정서적으로 힘들 때 적절한 방법으로 해소하고 회복한다."
    ]
  },
  {
    title: "성찰하는 사람 (Reflective)",
    description: "자신의 학습 과정을 깊이 돌아보며 강점·약점을 파악하고 성장합니다.",
    image: "https://i.imgur.com/tjM4pNc.png",
    details: [
      "탐구 후 '무엇을 배웠고, 무엇이 부족했는가?'를 구체적으로 기록한다.",
      "피드백을 방어적으로 받아들이지 않고 개선에 활용한다.",
      "학습 일기를 통해 사고의 변화를 스스로 추적한다."
    ]
  }
];

export const ibThemes: IBContent[] = [
  {
    title: "우리는 누구인가 (Who We Are)",
    description: "자아 정체성, 신체·정서·사회적 건강, 관계, 소속감, 권리와 책임",
    image: "https://i.imgur.com/s0XUyG1.png",
    details: [
      "4학년: 우리는 어떤 정체성을 가지고 있는가?",
      "5학년: 소셜미디어는 우리의 자아 인식에 어떤 영향을 줄까?",
      "6학년: 청소년의 권리와 책임은 어떻게 균형을 이뤄야 할까?"
    ]
  },
  {
    title: "우리가 속한 공간과 시간 (Where We Are in Place and Time)",
    description: "역사, 장소, 탐험, 이주, 문화유산, 개인과 문명의 상호 연결",
    image: "https://i.imgur.com/GNgL1sh.png",
    details: [
      "4학년: 우리 고장의 역사가 현재 삶에 어떤 영향을 주는가?",
      "5학년: 사람들은 왜 이주하고 문화를 어떻게 변화시키는가?",
      "6학년: 역사적 사건은 다양한 관점에서 어떻게 해석될 수 있는가?"
    ]
  },
  {
    title: "우리 자신을 표현하는 방법 (How We Express Ourselves)",
    description: "창의성, 예술, 상상력, 가치관 표현, 문화적 소통",
    image: "https://i.imgur.com/mwWfSIY.png",
    details: [
      "4학년: 예술은 사회적 메시지를 어떻게 전달하는가?",
      "5학년: 나의 정체성을 다양한 방법으로 어떻게 표현할 수 있는가?",
      "6학년: 광고와 미디어는 우리의 생각에 어떤 영향을 미치는가?"
    ]
  },
  {
    title: "세계가 돌아가는 방식 (How the World Works)",
    description: "자연 현상, 과학·기술, 패턴, 발견, 혁신, 인간과 자연의 상호작용",
    image: "https://i.imgur.com/1K1P8UU.png",
    details: [
      "4학년: 에너지는 어떻게 변환되고 우리 생활에 어떻게 쓰이는가?",
      "5학년: 기후 변화는 어떤 원인으로 일어나고 어떤 결과를 가져오는가?",
      "6학년: 과학 기술의 발전은 사회에 어떤 영향을 주는가?"
    ]
  },
  {
    title: "우리 자신을 조직하는 방식 (How We Organize Ourselves)",
    description: "사회 시스템, 의사결정, 경제 활동, 조직의 구조와 기능",
    image: "https://i.imgur.com/piXBjl5.png",
    details: [
      "4학년: 민주주의에서 시민은 어떻게 의사결정에 참여하는가?",
      "5학년: 기업과 시장은 어떻게 작동하며 소비자는 어떤 역할을 하는가?",
      "6학년: 지방 자치제도는 어떻게 운영되고 우리 삶에 어떤 영향을 주는가?"
    ]
  },
  {
    title: "우리 모두의 지구 (Sharing the Planet)",
    description: "환경, 자원 공유, 생태 공존, 지속가능성, 평화와 갈등 해결",
    image: "https://i.imgur.com/8sVP7pq.png",
    details: [
      "4학년: 생물 다양성이 중요한 이유는 무엇인가?",
      "5학년: 개인의 소비 습관이 지구 환경에 어떤 영향을 주는가?",
      "6학년: 지속가능한 발전이란 무엇이고 우리는 무엇을 실천할 수 있는가?"
    ]
  }
];

export const ibKeyConcepts: IBContent[] = [
  {
    title: "형태 (Form)",
    description: "어떤 특성과 구조를 가지고 있는가? (What is it like?)",
    image: "https://i.imgur.com/zWZEE98.png",
    details: ["민주주의 제도는 어떤 구조로 이루어져 있는가?", "생태계를 구성하는 요소에는 어떤 것들이 있는가?"]
  },
  {
    title: "기능 (Function)",
    description: "어떤 역할을 하며 어떻게 작동하는가? (How does it work?)",
    image: "https://i.imgur.com/SdFL1BL.png",
    details: ["시장 경제는 어떻게 작동하는가?", "면역 체계는 우리 몸을 어떻게 보호하는가?"]
  },
  {
    title: "인과관계 (Causation)",
    description: "원인은 무엇이며 어떤 결과를 가져오는가? (Why is it the way it is?)",
    image: "https://i.imgur.com/MZU0yIP.png",
    details: ["환경 오염의 원인과 결과는 무엇인가?", "역사적 전쟁은 왜 일어나고 어떤 영향을 남겼는가?"]
  },
  {
    title: "변화 (Change)",
    description: "어떻게 변화해 왔으며 앞으로 어떻게 달라질까? (How is it changing?)",
    image: "https://i.imgur.com/rKnLvxn.png",
    details: ["기술 발전은 사람들의 생활을 어떻게 바꾸었는가?", "우리나라 인구 구조는 어떻게 변해왔는가?"]
  },
  {
    title: "연결성 (Connection)",
    description: "모든 대상은 서로 어떻게 연결되어 있는가? (How is it connected?)",
    image: "https://i.imgur.com/bXfZJzT.png",
    details: ["경제 활동과 환경 문제는 어떻게 연결되는가?", "개인의 선택이 공동체 변화와 어떻게 연결되는가?"]
  },
  {
    title: "관점 (Perspective)",
    description: "대상을 바라보는 다양한 관점은 무엇인가? (What are the points of view?)",
    image: "https://i.imgur.com/vHzlpfK.png",
    details: ["핵발전소 건설에 대한 찬반 입장은 어떻게 다른가?", "역사적 사건을 여러 집단은 어떻게 기억하는가?"]
  },
  {
    title: "책임 (Responsibility)",
    description: "스스로 탐구한 결과를 실제로 어떻게 실천할 것인가? (What are our obligations?)",
    image: "https://i.imgur.com/LgOZPcE.png",
    details: ["기후 변화 해결을 위해 우리는 무엇을 해야 하는가?", "디지털 시대 정보 이용자로서 우리의 책임은 무엇인가?"]
  }
];

export const ibInquiryCycle: IBContent[] = [
  {
    title: "1단계: 관계 맺기 (Engage)",
    description: "탐구 주제와 연결되며 사전 지식을 활성화합니다.",
    image: "https://i.imgur.com/QZ7BTfL.png",
    details: []
  },
  {
    title: "2단계: 집중하기 (Focus)",
    description: "핵심 개념을 중심으로 탐구 방향을 설정합니다.",
    image: "https://i.imgur.com/M3rh5AX.png",
    details: []
  },
  {
    title: "3단계: 조사하기 (Investigate)",
    description: "다양한 자원을 활용해 정보를 수집하고 분석합니다.",
    image: "https://i.imgur.com/dFAhG3n.png",
    details: []
  },
  {
    title: "4단계: 조직·정리하기 (Organize)",
    description: "수집한 정보를 연결하고 패턴을 발견합니다.",
    image: "https://i.imgur.com/x1zHHUW.png",
    details: []
  },
  {
    title: "5단계: 일반화하기 (Generalize)",
    description: "발견한 패턴에서 개념적 이해(일반화 문장)를 형성합니다.",
    image: "https://i.imgur.com/WEHoIZr.png",
    details: []
  },
  {
    title: "6단계: 전이 & 성찰하기 (Transfer & Reflect)",
    description: "이해한 내용을 새로운 맥락에 적용하고 과정을 돌아봅니다.",
    image: "https://i.imgur.com/6ADv2ix.png",
    details: []
  }
];

export const ibATL: IBContent[] = [
  {
    title: "사고 기능 (Thinking Skills)",
    description: "비판적, 창의적 사고를 통해 문제를 해결합니다.",
    image: "https://i.imgur.com/n2kqXSo.png",
    details: [
      "새로운 아이디어를 제안할 수 있는가?",
      "정보의 신뢰성을 판단할 수 있는가?",
      "배운 내용을 다른 상황에 적용할 수 있는가?"
    ]
  },
  {
    title: "의사소통 기능 (Communication Skills)",
    description: "자신의 생각을 효과적으로 표현하고 타인의 의견을 경청합니다.",
    image: "https://i.imgur.com/eS1UYdr.png",
    details: [
      "자신의 생각을 글이나 그림으로 잘 표현하는가?",
      "다른 사람의 의견을 끝까지 잘 듣는가?",
      "다양한 매체를 활용해 정보를 전달할 수 있는가?"
    ]
  },
  {
    title: "사회적 기능 (Social Skills)",
    description: "타인과 협력하고 긍정적인 관계를 유지합니다.",
    image: "https://i.imgur.com/frP5IN3.png",
    details: [
      "모둠 활동에서 자신의 역할을 다하는가?",
      "친구의 감정을 이해하고 공감하는가?",
      "갈등이 생겼을 때 평화롭게 해결하려 노력하는가?"
    ]
  },
  {
    title: "조사 기능 (Research Skills)",
    description: "필요한 정보를 찾고 분석하며 출처를 밝힙니다.",
    image: "https://i.imgur.com/i0x7cpN.png",
    details: [
      "탐구 질문에 맞는 정보를 스스로 찾는가?",
      "찾은 정보가 주제와 관련 있는지 판단하는가?",
      "정보의 출처를 정확히 기록하는가?"
    ]
  },
  {
    title: "자기 관리 기능 (Self-management Skills)",
    description: "자신의 학습과 감정을 조절하고 계획을 세웁니다.",
    image: "https://i.imgur.com/8aAYlDU.png",
    details: [
      "학습 계획을 세우고 시간을 잘 관리하는가?",
      "어려운 상황에서도 포기하지 않고 도전하는가?",
      "자신의 강점과 약점을 알고 개선하려 하는가?"
    ]
  }
];

export const ibReflectionQuestions = [
  "이번 탐구에서 가장 흥미로웠던 점은 무엇인가요?",
  "탐구 과정에서 새롭게 알게 된 사실은 무엇인가요?",
  "어떤 학습자상의 모습을 가장 잘 보여주었나요?",
  "탐구 중 가장 어려웠던 점과 그것을 어떻게 극복했나요?",
  "이 탐구 결과가 나의 삶이나 주변에 어떤 변화를 줄 수 있을까요?"
];

export interface QuizQuestion {
  id: number;
  question: string;
  options?: string[];
  correctAnswer: number | string;
  explanation: string;
  emoji?: string;
  audioUrl?: string;
  startTime?: number;
  type?: 'multiple' | 'subjective';
}

export const songQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "개념송 가사 중 빈칸에 들어갈 말은? '형태는 (      )이야. 그게 뭔지 말해 주는 이름표'",
    correctAnswer: "모습",
    explanation: "개념송의 첫 부분! '형태는 모습이야'라고 노래해요.",
    emoji: "🎹",
    audioUrl: "https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3",
    startTime: 5,
    type: 'subjective'
  },
  {
    id: 2,
    question: "ATL 송에서 '궁금한 건 크게 물어봐'라고 하는 기능은 무엇일까요?",
    options: ["사고기능", "조사기능", "의사소통기능", "자기관리기능"],
    correctAnswer: 0,
    explanation: "사고기능은 궁금한 것을 크게 물어보고 새로운 생각을 반짝이는 힘이에요!",
    emoji: "💡",
    audioUrl: "https://ik.imagekit.io/foefnjeua/ATL%20%EB%8B%A4%EC%84%AF%20%EA%B0%80%EC%A7%80%20%ED%9E%98.mp3",
    startTime: 8,
    type: 'multiple'
  },
  {
    id: 3,
    question: "초학문적 주제송에서 '내 신념과 가치'를 탐구하는 주제는?",
    options: ["우리가 사는 시간과 공간", "우리는 누구인가", "우리 자신을 표현하는 방법", "우리 모두의 지구"],
    correctAnswer: 1,
    explanation: "'우리는 누구인가(Who we are)'는 내 신념과 가치, 정체성을 탐구하는 주제예요.",
    emoji: "🌍",
    audioUrl: "https://ik.imagekit.io/foefnjeua/6%EA%B0%80%EC%A7%80%20%EC%9A%B0%EC%A3%BC.mp3",
    startTime: 6,
    type: 'multiple'
  },
  {
    id: 4,
    question: "학습자송 가사 중 빈칸은? '약속은 꼭꼭 지켜, (      )이 최고!'",
    correctAnswer: "정직",
    explanation: "원칙을 지키는 사람의 핵심 가치! '정직이 최고'라고 노래해요.",
    emoji: "🦸",
    audioUrl: "https://ik.imagekit.io/foefnjeua/%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20Super%20Power.mp3?updatedAt=1773797977356",
    startTime: 48,
    type: 'subjective'
  },
  {
    id: 5,
    question: "개념송에서 '왜 그런지 궁금해서 묻는 말'은 어떤 개념일까요?",
    correctAnswer: "인과관계",
    explanation: "인과관계는 이유를 찾는 질문이에요. '왜 그런지' 궁금해하는 것이 시작이죠!",
    emoji: "❓",
    audioUrl: "https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3",
    startTime: 25,
    type: 'subjective'
  },
  {
    id: 6,
    question: "ATL 송에서 '친구 말은 끝까지 들어 줘'라고 강조하는 기능은?",
    options: ["사고기능", "의사소통기능", "대인관계기능", "자기관리기능"],
    correctAnswer: 2,
    explanation: "대인관계기능은 친구의 말을 경청하고 서로를 존중하며 협업하는 힘이에요.",
    emoji: "🤝",
    audioUrl: "https://ik.imagekit.io/foefnjeua/ATL%20%EB%8B%A4%EC%84%AF%20%EA%B0%80%EC%A7%80%20%ED%9E%98.mp3",
    startTime: 60,
    type: 'multiple'
  },
  {
    id: 7,
    question: "초학문적 주제송에서 '에너지와 디지털'을 다루는 주제는?",
    options: ["세계가 돌아가는 방식", "우리 자신을 조직하는 방식", "우리 모두의 지구", "우리 자신을 표현하는 방법"],
    correctAnswer: 0,
    explanation: "'세계가 돌아가는 방식(How the world works)'은 에너지, 디지털, 질서와 시스템을 탐구해요.",
    emoji: "⚙️",
    audioUrl: "https://ik.imagekit.io/foefnjeua/6%EA%B0%80%EC%A7%80%20%EC%9A%B0%EC%A3%BC.mp3",
    startTime: 45,
    type: 'multiple'
  },
  {
    id: 8,
    question: "학습자송에서 '공부도 운동도, 골고루 튼튼하게' 하는 모습은?",
    options: ["배려하는 사람", "도전하는 사람", "균형 잡힌 사람", "성찰하는 사람"],
    correctAnswer: 2,
    explanation: "균형 잡힌 사람은 몸과 마음을 골고루 튼튼하게 가꾸는 사람이에요.",
    emoji: "⚖️",
    audioUrl: "https://ik.imagekit.io/foefnjeua/%EC%9A%B0%EB%A6%AC%EB%93%A4%EC%9D%98%20Super%20Power.mp3?updatedAt=1773797977356",
    startTime: 85,
    type: 'multiple'
  },
  {
    id: 9,
    question: "개념송에서 '내가 해야 할 몫'을 뜻하는 핵심개념은?",
    correctAnswer: "책임",
    explanation: "책임은 내가 할 수 있는 일을 그냥 지나치지 않고 실천하는 것이에요.",
    emoji: "✅",
    audioUrl: "https://ik.imagekit.io/foefnjeua/%EA%B0%9C%EB%85%90%EC%86%A1%20(Remastered).mp3",
    startTime: 100,
    type: 'subjective'
  },
  {
    id: 10,
    question: "ATL 송에서 '실수해도 다시 일어나는 힘'을 무엇이라고 하나요?",
    correctAnswer: "회복탄력성",
    explanation: "자기관리기능의 중요한 부분인 회복탄력성은 실수해도 다시 일어나는 마음의 힘이에요.",
    emoji: "🛡️",
    audioUrl: "https://ik.imagekit.io/foefnjeua/ATL%20%EB%8B%A4%EC%84%AF%20%EA%B0%80%EC%A7%80%20%ED%9E%98.mp3",
    startTime: 110,
    type: 'subjective'
  }
];

export const musicQuizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "높은음자리표에서 '솔' 자리는 어디일까요?",
    options: ["첫 번째 줄", "두 번째 줄", "세 번째 줄", "네 번째 줄"],
    correctAnswer: 1,
    explanation: "높은음자리표의 시작점인 두 번째 줄이 바로 '솔' 자리예요!",
    emoji: "🎼"
  },
  {
    id: 2,
    question: "4분음표는 몇 박자일까요?",
    options: ["반 박자", "한 박자", "두 박자", "네 박자"],
    correctAnswer: 1,
    explanation: "4분음표는 사과 한 개처럼 '한 박자'를 나타내요.",
    emoji: "🎵"
  },
  {
    id: 3,
    question: "피아노 건반에서 검은 건반이 2개 있는 곳 바로 왼쪽 아래에 있는 음은?",
    options: ["도", "레", "미", "파"],
    correctAnswer: 0,
    explanation: "검은 건반 2개 묶음의 왼쪽 아래는 항상 '도' 자리랍니다!",
    emoji: "🎹"
  },
  {
    id: 4,
    question: "매우 여리게 연주하라는 뜻의 음악 기호는?",
    options: ["p (피아노)", "pp (피아니시모)", "f (포르테)", "ff (포르티시모)"],
    correctAnswer: 1,
    explanation: "pp는 '피아니시모'라고 읽고 아주 작은 소리로 연주하라는 뜻이에요.",
    emoji: "🤫"
  },
  {
    id: 5,
    question: "리코더를 불 때 가장 낮은 '도' 음을 내려면 구멍을 몇 개 막아야 할까요?",
    options: ["0개", "4개", "7개", "모두 다"],
    correctAnswer: 3,
    explanation: "리코더의 모든 구멍을 정성껏 막으면 가장 낮은 '도' 소리가 나요.",
    emoji: "🎺"
  },
  {
    id: 6,
    question: "음악의 3요소가 아닌 것은 무엇일까요?",
    options: ["리듬", "가사", "선율(멜로디)", "화성(하모니)"],
    correctAnswer: 1,
    explanation: "음악의 3요소는 리듬, 선율, 화성이에요. 가사는 노래의 요소랍니다!",
    emoji: "🎶"
  },
  {
    id: 7,
    question: "점4분음표는 몇 박자일까요?",
    options: ["1박자", "1박자 반", "2박자", "3박자"],
    correctAnswer: 1,
    explanation: "점은 원래 박자의 절반을 더해줘요. 1 + 0.5 = 1.5박자가 됩니다!",
    emoji: "📝"
  },
  {
    id: 8,
    question: "오케스트라에서 악기들의 음을 맞춰주는 기준이 되는 악기는?",
    options: ["피아노", "바이올린", "오보에", "플루트"],
    correctAnswer: 2,
    explanation: "오보에의 맑고 곧은 소리를 듣고 다른 악기들이 음을 맞춘답니다.",
    emoji: "🎻"
  },
  {
    id: 9,
    question: "빠르기말 중 '보통 빠르기로'라는 뜻을 가진 말은?",
    options: ["안단테", "모데라토", "알레그로", "프레스토"],
    correctAnswer: 1,
    explanation: "모데라토(Moderato)는 걷는 속도보다 조금 더 활기찬 보통 빠르기예요.",
    emoji: "🚶"
  },
  {
    id: 10,
    question: "현악기 중에서 가장 크고 낮은 소리를 내는 악기는?",
    options: ["바이올린", "비올라", "첼로", "더블베이스(콘트라베이스)"],
    correctAnswer: 3,
    explanation: "더블베이스는 사람 키만큼 크고 아주 웅장하고 낮은 소리를 내요.",
    emoji: "🎸"
  }
];

export const quizQuestions: QuizQuestion[] = [
  {
    id: 1,
    question: "다른 나라 친구의 문화를 존중하고, '나와는 다르지만 틀린 게 아니야'라고 생각하는 멋진 학습자상은?",
    options: ["탐구하는 사람", "열린 마음을 가진 사람", "원칙을 지키는 사람", "배려하는 사람"],
    correctAnswer: 1,
    explanation: "열린 마음을 가진 사람(Open-minded)은 다른 사람의 생각과 문화를 소중히 여기고 배우는 사람이에요!",
    emoji: "🌏"
  },
  {
    id: 2,
    question: "숙제를 할 때 다른 사람의 글을 몰래 베끼지 않고, 정직하게 내 힘으로 하는 친구는 어떤 모습인가요?",
    options: ["지식이 풍부한 사람", "원칙을 지키는 사람", "사고하는 사람", "성찰하는 사람"],
    correctAnswer: 1,
    explanation: "원칙을 지키는 사람(Principled)은 정직하고 성실하게 행동하며 규칙을 잘 지키는 사람이에요.",
    emoji: "⚖️"
  },
  {
    id: 3,
    question: "초학문적 주제 중 '나는 누구일까? 내 몸과 마음은 건강할까?'를 공부하는 주제는 무엇인가요?",
    options: ["우리가 속한 공간과 시간", "우리는 누구인가", "세계가 돌아가는 방식", "우리 모두의 지구"],
    correctAnswer: 1,
    explanation: "'우리는 누구인가(Who We Are)'는 나 자신과 우리 몸, 마음, 관계에 대해 배우는 시간이에요.",
    emoji: "👤"
  },
  {
    id: 4,
    question: "핵심 개념 중 '왜 이런 일이 일어났을까? 원인과 결과는 무엇일까?'를 궁금해하는 렌즈는?",
    options: ["형태", "기능", "인과관계", "변화"],
    correctAnswer: 2,
    explanation: "인과관계(Causation)는 '왜?'라는 질문을 통해 어떤 일의 원인과 결과를 찾아보는 렌즈예요.",
    emoji: "🔍"
  },
  {
    id: 5,
    question: "탐구의 첫 단계! 주제를 처음 만났을 때 '무엇이 보이고, 어떤 생각이 들고, 무엇이 궁금한지(STW: 보고, 생각하고, 궁금해하기)' 해보는 단계는?",
    options: ["성찰하기", "조사하기", "일반화하기", "관계 맺기 (시작하기)"],
    correctAnswer: 3,
    explanation: "관계 맺기(Engage)는 탐구를 시작하며 내 생각과 궁금증을 깨우는 아주 재미있는 첫 단계예요!",
    emoji: "👁️"
  },
  {
    id: 6,
    question: "발표가 조금 떨리지만 용기 있게 도전하고, 새로운 방법으로 프로젝트를 해보는 멋진 모습은?",
    options: ["소통하는 사람", "균형잡힌 사람", "도전하는 사람", "탐구하는 사람"],
    correctAnswer: 2,
    explanation: "도전하는 사람(Risk-takers)은 겁내지 않고 새로운 일을 시도하며 실패해도 다시 일어나는 사람이에요.",
    emoji: "🚀"
  },
  {
    id: 7,
    question: "핵심 개념 중 '이 물건을 엄마는 어떻게 보실까? 내 친구는 어떻게 생각할까?'처럼 여러 생각을 알아보는 렌즈는?",
    options: ["연결성", "형태", "책임", "관점"],
    correctAnswer: 3,
    explanation: "관점(Perspective)은 하나의 일을 여러 사람의 눈으로 바라보고 이해하는 렌즈예요.",
    emoji: "👓"
  },
  {
    id: 8,
    question: "탐구를 다 마치고 나서 '내가 무엇을 배웠지? 다음엔 어떻게 더 잘할까?'라고 생각해보는 단계는?",
    options: ["조사하기", "조직·정리하기", "일반화하기", "전이 & 성찰하기 (마무리)"],
    correctAnswer: 3,
    explanation: "전이 & 성찰하기(Reflect)는 탐구 과정을 돌아보며 내가 얼마나 성장했는지 확인하는 마지막 단계예요.",
    emoji: "💭"
  },
  {
    id: 9,
    question: "공부도 열심히 하지만, 운동도 하고 잠도 푹 자며 내 몸과 마음을 골고루 돌보는 학습자상은?",
    options: ["배려하는 사람", "지식이 풍부한 사람", "균형잡힌 사람", "사고하는 사람"],
    correctAnswer: 2,
    explanation: "균형잡힌 사람(Balanced)은 몸과 마음, 공부와 휴식을 모두 소중히 여기는 사람이에요.",
    emoji: "🧘"
  },
  {
    id: 10,
    question: "오늘 공부한 내용을 일기에 적으며 '내 생각이 이렇게 바뀌었어!'라고 스스로 돌아보는 모습은?",
    options: ["원칙을 지키는 사람", "소통하는 사람", "탐구하는 사람", "성찰하는 사람"],
    correctAnswer: 3,
    explanation: "성찰하는 사람(Reflective)은 자신의 경험을 되돌아보며 더 멋지게 성장하려고 노력하는 사람이에요.",
    emoji: "📝"
  },
  {
    id: 11,
    question: "궁금한 것이 생기면 스스로 질문을 던지고, 답을 찾기 위해 열심히 조사하는 학습자상은?",
    options: ["사고하는 사람", "지식이 풍부한 사람", "탐구하는 사람", "소통하는 사람"],
    correctAnswer: 2,
    explanation: "탐구하는 사람(Inquirers)은 호기심을 가지고 스스로 배우는 즐거움을 아는 사람이에요.",
    emoji: "🕵️"
  },
  {
    id: 12,
    question: "학교에서 배운 내용뿐만 아니라 세상의 다양한 문제에 관심을 가지고 깊이 있게 아는 모습은?",
    options: ["배려하는 사람", "원칙을 지키는 사람", "도전하는 사람", "지식이 풍부한 사람"],
    correctAnswer: 3,
    explanation: "지식이 풍부한 사람(Knowledgeable)은 여러 가지 지식을 넓고 깊게 탐구하는 사람이에요.",
    emoji: "📚"
  },
  {
    id: 13,
    question: "어려운 문제에 부딪혔을 때 비판적이고 창의적으로 생각해서 해결책을 찾아내는 학습자상은?",
    options: ["성찰하는 사람", "탐구하는 사람", "사고하는 사람", "균형잡힌 사람"],
    correctAnswer: 2,
    explanation: "사고하는 사람(Thinkers)은 논리적이고 창의적인 생각으로 문제를 해결하는 사람이에요.",
    emoji: "💡"
  },
  {
    id: 14,
    question: "자신의 생각을 글, 그림, 말 등으로 자신 있게 표현하고 다른 사람의 말도 잘 들어주는 모습은?",
    options: ["도전하는 사람", "열린 마음을 가진 사람", "배려하는 사람", "소통하는 사람"],
    correctAnswer: 3,
    explanation: "소통하는 사람(Communicators)은 서로의 생각을 잘 주고받으며 협력하는 사람이에요.",
    emoji: "🗣️"
  },
  {
    id: 15,
    question: "주변 친구들이나 환경을 소중히 여기고, 도움이 필요한 곳에 먼저 손을 내미는 따뜻한 모습은?",
    options: ["원칙을 지키는 사람", "탐구하는 사람", "배려하는 사람", "지식이 풍부한 사람"],
    correctAnswer: 2,
    explanation: "배려하는 사람(Caring)은 다른 사람의 마음을 공감하고 세상을 더 좋게 만들려 노력하는 사람이에요.",
    emoji: "❤️"
  },
  {
    id: 16,
    question: "초학문적 주제 중 '옛날 사람들은 어떻게 살았을까? 역사는 우리에게 어떤 영향을 줄까?'를 배우는 주제는?",
    options: ["우리는 누구인가", "우리 모두의 지구", "우리 자신을 표현하는 방법", "우리가 속한 공간과 시간"],
    correctAnswer: 3,
    explanation: "'우리가 속한 공간과 시간(Where We Are in Place and Time)'은 역사와 장소, 탐험에 대해 배우는 주제예요.",
    emoji: "⏳"
  },
  {
    id: 17,
    question: "예술, 음악, 춤 등을 통해 나의 생각과 가치관을 창의적으로 나타내는 방법을 배우는 주제는?",
    options: ["우리 자신을 조직하는 방식", "세계가 돌아가는 방식", "우리 자신을 표현하는 방법", "우리 모두의 지구"],
    correctAnswer: 2,
    explanation: "'우리 자신을 표현하는 방법(How We Express Ourselves)'은 창의성과 예술을 통해 소통하는 법을 배워요.",
    emoji: "🎨"
  },
  {
    id: 18,
    question: "자연 현상, 과학 기술, 그리고 인간이 세상을 어떻게 발견하고 혁신하는지 탐구하는 주제는?",
    options: ["세계가 돌아가는 방식", "우리는 누구인가", "우리 자신을 조직하는 방식", "우리 모두의 지구"],
    correctAnswer: 0,
    explanation: "'세계가 돌아가는 방식(How the World Works)'은 자연과 과학 기술의 원리를 탐구하는 주제예요.",
    emoji: "⚙️"
  },
  {
    id: 19,
    question: "사람들이 모여서 만든 사회 시스템, 경제 활동, 공동체의 의사결정 방식을 배우는 주제는?",
    options: ["우리 자신을 조직하는 방식", "우리가 속한 공간과 시간", "우리 모두의 지구", "우리는 누구인가"],
    correctAnswer: 0,
    explanation: "'우리 자신을 조직하는 방식(How We Organize Ourselves)'은 사회 조직과 시스템을 배우는 주제예요.",
    emoji: "🏢"
  },
  {
    id: 20,
    question: "환경 보호, 자원 나누기, 평화로운 갈등 해결 등 지구를 함께 지키는 법을 배우는 주제는?",
    options: ["우리 모두의 지구", "세계가 돌아가는 방식", "우리 자신을 표현하는 방법", "우리는 누구인가"],
    correctAnswer: 0,
    explanation: "'우리 모두의 지구(Sharing the Planet)'는 지속 가능한 미래와 공존을 위해 탐구하는 주제예요.",
    emoji: "🌍"
  },
  {
    id: 21,
    question: "핵심 개념 중 '이것은 어떤 특징과 구조를 가지고 있을까?'를 알아보는 질문 렌즈는?",
    options: ["형태", "기능", "변화", "연결성"],
    correctAnswer: 0,
    explanation: "형태(Form)는 대상의 겉모습이나 구조적 특징, 즉 모양이나 색깔처럼 '눈에 보이는 모습'에 집중하여 관찰하는 렌즈예요.",
    emoji: "💎"
  },
  {
    id: 22,
    question: "핵심 개념 중 '이것은 어떤 역할을 하며 어떻게 작동하고 있을까?'를 알아보는 질문 렌즈는?",
    options: ["기능", "인과관계", "관점", "책임"],
    correctAnswer: 0,
    explanation: "기능(Function)은 대상이 어떤 역할을 하며 어떻게 작동하는지, 즉 '어떻게 써요?', '어떻게 움직여요?'와 같은 사용법에 집중하는 렌즈예요.",
    emoji: "🛠️"
  },
  {
    id: 23,
    question: "핵심 개념 중 '이것은 시간이 흐르면서 어떻게 달라졌고, 앞으로 어떻게 변할까?'를 묻는 렌즈는?",
    options: ["변화", "형태", "연결성", "관점"],
    correctAnswer: 0,
    explanation: "변화(Change)는 과거에서 현재, 미래로 이어지는 흐름과 변형을 탐구하는 렌즈예요.",
    emoji: "🔄"
  },
  {
    id: 24,
    question: "핵심 개념 중 '이것은 다른 것들과 어떤 관계가 있고 어떻게 이어져 있을까?'를 묻는 렌즈는?",
    options: ["연결성", "인과관계", "책임", "기능"],
    correctAnswer: 0,
    explanation: "연결성(Connection)은 대상들 사이의 상호작용과 관계를 찾아보는 렌즈예요.",
    emoji: "🔗"
  },
  {
    id: 25,
    question: "핵심 개념 중 '내가 알게 된 내용을 바탕으로 나는 어떤 행동을 해야 할까?'를 묻는 렌즈는?",
    options: ["책임", "관점", "형태", "변화"],
    correctAnswer: 0,
    explanation: "책임(Responsibility)은 탐구한 내용을 실천으로 옮기는 우리의 의무를 생각하는 렌즈예요.",
    emoji: "✅"
  },
  {
    id: 26,
    question: "탐구 사이클 단계 중 핵심 개념을 정하고 '무엇을 더 깊이 알아볼까?' 방향을 잡는 단계는?",
    options: ["관계 맺기", "집중하기", "조사하기", "조직·정리하기"],
    correctAnswer: 1,
    explanation: "집중하기(Focus)는 탐구의 목적을 분명히 하고 질문을 구체화하는 단계예요.",
    emoji: "🎯"
  },
  {
    id: 27,
    question: "탐구 사이클 단계 중 책, 인터넷, 인터뷰 등 다양한 방법으로 정보를 모으는 단계는?",
    options: ["일반화하기", "조사하기", "성찰하기", "관계 맺기"],
    correctAnswer: 1,
    explanation: "조사하기(Investigate)는 궁금증을 해결하기 위해 필요한 자료를 수집하는 단계예요.",
    emoji: "🔎"
  },
  {
    id: 28,
    question: "탐구 사이클 단계 중 모은 정보를 분류하고, 비슷한 점이나 차이점 같은 패턴을 찾는 단계는?",
    options: ["관계 맺기", "조직·정리하기", "집중하기", "일반화하기"],
    correctAnswer: 1,
    explanation: "조직·정리하기(Organize)는 복잡한 정보를 체계적으로 정리하여 의미를 찾는 단계예요.",
    emoji: "📂"
  },
  {
    id: 29,
    question: "탐구 사이클 단계 중 발견한 사실들을 묶어서 '아! 세상은 이렇구나!'라고 한 문장으로 정리하는 단계는?",
    options: ["조사하기", "일반화하기", "성찰하기", "집중하기"],
    correctAnswer: 1,
    explanation: "일반화하기(Generalize)는 탐구 결과를 바탕으로 큰 깨달음(개념적 이해)을 얻는 단계예요.",
    emoji: "✍️"
  },
  {
    id: 30,
    question: "IB 탐험가가 되기 위해 필요한 5가지 기술(사고, 소통, 사회, 조사, 자기관리)을 무엇이라 부를까요?",
    options: ["핵심 개념", "ATL 기술", "학습자상", "탐구 사이클"],
    correctAnswer: 1,
    explanation: "ATL(Approaches to Learning) 기술은 우리가 스스로 학습하는 방법을 익히기 위해 필요한 도구들이에요.",
    emoji: "🧰"
  }
];

