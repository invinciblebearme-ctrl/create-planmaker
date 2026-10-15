export const CREATE_STAGES = [
  {
    k: 'C',
    name: '진단',
    label: 'C',
    eng: 'Check & Context',
    color: '#5674df',
    bg: '#eaf0ff',
    border: '#d4e1fb',
    icon: '🔍',
    titleInDoc: '<진단 도구 선정> <학습자 실태 분석>',
    desc: 'AI·디지털 도구로 학생의 흥미·강점·취약점(사전 지식·오개념·태도·디지털 활용 수준)을 파악해 맞춤형 학습의 출발점을 정합니다.',
    example: '가치수직선, 설문, 퀴즈로 사전 인식 조사',
    checkQ: '선수 개념과 사전 인식을 확인할 진단 도구를 정했는가? 지식뿐 아니라 흥미·태도·디지털 도구 활용 수준도 살피는가?'
  },
  {
    k: 'R',
    name: '탐색',
    label: 'R',
    eng: 'Research & Resource',
    color: '#1e9a7e',
    bg: '#e1f7f0',
    border: '#c3eedf',
    icon: '🧭',
    titleInDoc: '<교육과정 수정 여부 결정> <일반화 문장 및 탐구 질문>',
    desc: '진단 결과를 근거로 자료를 고르고 교육과정을 재구성하며, 단원을 꿰뚫는 일반화 문장과 학생들의 탐구 질문을 세웁니다.',
    example: '교육과정 재구성, 일반화 문장 및 핵심 질문 도출',
    checkQ: '자료 선정과 재구성에 진단 결과를 반영했는가? 단원을 마친 학생이 말할 수 있어야 할 일반화 문장은 무엇인가?'
  },
  {
    k: 'E1',
    name: '실행',
    label: 'E',
    eng: 'Experience & Engagement',
    color: '#df6d30',
    bg: '#ffede0',
    border: '#fcdbca',
    icon: '⚡',
    titleInDoc: '<탐구 질문 중심 탐구 활동 전개> <다양한 AI·디지털 도구 및 아날로그 매체 활용>',
    desc: '탐구 질문의 답을 찾는 활동을 중심으로, 다양한 AI·디지털 도구와 아날로그 매체를 목적에 맞게 활용해 협력적으로 문제를 해결합니다.',
    example: '모둠별 탐구·실험, 디지털 샌드박스 분류, 산출물 제작',
    checkQ: '학생이 탐구 질문의 답을 직접 찾아가는 활동인가? 학생의 생각과 산출물을 기록하고 공유할 방법이 있는가?'
  },
  {
    k: 'A',
    name: '분석',
    label: 'A',
    eng: 'Assess & Adjust',
    color: '#8262d9',
    bg: '#f1ecfc',
    border: '#dfd3fa',
    icon: '📊',
    titleInDoc: '<루브릭 활용 평가 및 피드백> <환류: C·R·E로 되돌아가기>',
    desc: '성취기준과 루브릭에 따라 목표 도달도를 진단·평가하고, 평가 결과를 바탕으로 R(탐색)이나 E(실행)로 되돌아가 보충·심화합니다.',
    example: '루브릭 평가, 상호 피드백, 취약점 재학습 환류',
    checkQ: '목표 도달 여부를 판단할 평가 방법과 기준을 정했는가? R·E로 되돌아갈 기준과 그때 할 활동을 정했는가?'
  },
  {
    k: 'T',
    name: '전이',
    label: 'T',
    eng: 'Transfer & Transformation',
    color: '#d94474',
    bg: '#ffe8f0',
    border: '#f9cad9',
    icon: '🚀',
    titleInDoc: '<타 교과 연계 및 실생활 적용> <지역 맥락화>',
    desc: '배운 개념과 일반화 문장을 새로운 맥락(다른 교과, 실생활 문제, 우리 지역의 삶)에 적용해 확장합니다.',
    example: '실생활 문제 해결 프로젝트, 지역 연계 캠페인',
    checkQ: '배운 개념을 새로운 맥락에 적용하는 과제인가? 단순한 꾸미기가 아니라 개념을 활용해야 해결되는 과제인가?'
  },
  {
    k: 'E2',
    name: '성장',
    label: 'E',
    eng: 'Expand & Empower',
    color: '#1892a7',
    bg: '#e1f7fb',
    border: '#bfeaf3',
    icon: '🌱',
    titleInDoc: '<일반화 문장 생성> <배움에 대한 성찰 및 진단과 평가 결과 공유>',
    desc: '단원 전체의 배움을 성찰하며 자기만의 일반화 문장을 완성하고, C(진단) 단계 결과와 비교하여 성장한 모습을 확인하고 나눕니다.',
    example: '나만의 일반화 문장 작성, 배움 나눔회, C진단 대비 성장 확인',
    checkQ: '학생이 일반화 문장을 자기 말로 쓸 수 있는가? C단계 진단 결과와 비교해 학생의 긍정적인 변화를 확인하는가?'
  }
];

export const TOOL_CATEGORIES = [
  {
    category: '수업 및 학급 플랫폼',
    icon: '💻',
    tools: [
      { name: '웨일북 수업 관리', defaultOn: true },
      { name: '학급 플랫폼(웨일클래스·클래스팅 등)', defaultOn: true },
      { name: '패들렛(보드·샌드박스)', defaultOn: true },
      { name: '캔바', defaultOn: true },
      { name: '구글 클래스룸', defaultOn: false }
    ]
  },
  {
    category: '설문 및 퀴즈·형성평가',
    icon: '🎯',
    tools: [
      { name: '구글 설문', defaultOn: true },
      { name: '띵커벨', defaultOn: true },
      { name: '젭퀴즈', defaultOn: true },
      { name: '퀴즈앤', defaultOn: false },
      { name: '카훗', defaultOn: false },
      { name: '블루킷', defaultOn: false }
    ]
  },
  {
    category: '교육용 AI 도구',
    icon: '✨',
    tools: [
      { name: '교육용 생성형 AI(전북GPT·우리아이AI 등)', defaultOn: true },
      { name: '클리포AI(AI 평가 도구)', defaultOn: false },
      { name: '제미나이 노트북(구 NotebookLM)', defaultOn: false },
      { name: '브리스크 티칭', defaultOn: false },
      { name: 'AI 코스웨어(플랭스쿨 등)', defaultOn: false }
    ]
  },
  {
    category: '소프트웨어 & 디지털 창작',
    icon: '🎨',
    tools: [
      { name: '티처블 머신', defaultOn: false },
      { name: '엔트리', defaultOn: false },
      { name: '오토드로우', defaultOn: false },
      { name: '미리캔버스', defaultOn: false },
      { name: '구글 어스', defaultOn: false },
      { name: '구글 렌즈', defaultOn: false },
      { name: '교사 제작 바이브코딩 앱', defaultOn: false }
    ]
  }
];

export const GRADE_BANDS = [
  { id: 'all', label: '전체 학년군', grades: [1, 2, 3, 4, 5, 6] },
  { id: 2, label: '1~2학년군', grades: [1, 2], badge: '1~2학년' },
  { id: 4, label: '3~4학년군', grades: [3, 4], badge: '3~4학년' },
  { id: 6, label: '5~6학년군', grades: [5, 6], badge: '5~6학년' }
];

export const SUBJECT_ICONS = {
  '국어': '📖',
  '수학': '📐',
  '사회': '🏛️',
  '과학': '🔬',
  '도덕': '🤝',
  '영어': '🔤',
  '음악': '🎵',
  '미술': '🎨',
  '체육': '🏃',
  '실과': '🛠️',
  '바른 생활': '🌱',
  '슬기로운 생활': '💡',
  '즐거운 생활': '🎈'
};

export const SAMPLE_PRESETS = [
  {
    title: '4학년 2학기 과학 생태계 융합 단원 (실증 설계안)',
    description: '생태계 구성 요소와 환경 보전 실천 (군산 금강하구 지역 맥락 연계)',
    grade: 4,
    sem: '2학기',
    cha: '12',
    unit: '모두가 연결된 생태계, 그 속의 우리들',
    tb: '2. 생물과 환경',
    ctx: '다수의 학생이 환경을 인간이 파괴하는 것으로만 단편적으로 인식함. 인간의 이로운 영향과 보전 노력을 균형 있게 다루도록 설계할 필요가 있음.',
    local: '군산 금강하구 및 연안 생태계 보전 활동 연계',
    standards: ['[4과02-01]', '[4과02-02]'],
    tools: ['웨일북 수업 관리', '학급 플랫폼(웨일클래스·클래스팅 등)', '패들렛(보드·샌드박스)', '캔바', '구글 설문', '띵커벨', '교육용 생성형 AI(전북GPT·우리아이AI 등)']
  },
  {
    title: '2학년 2학기 통합(가을) 프로젝트 단원',
    description: '가을의 변화와 우리 마을의 다채로운 모습 탐색',
    grade: 2,
    sem: '2학기',
    cha: '10',
    unit: '가을을 담은 우리 동네 이야기',
    tb: '가을 2. 가을의 풍경',
    ctx: '가을의 자연 현상 관찰 경험은 풍부하나, 모둠별로 생각을 모으고 디지털 도구로 표현하는 기초 기능 지도가 필요함.',
    local: '학교 주변 가을 가로수길과 동네 공원',
    standards: ['[2슬02-01]', '[2즐02-01]'],
    tools: ['웨일북 수업 관리', '패들렛(보드·샌드박스)', '캔바', '띵커벨']
  },
  {
    title: '5학년 1학기 사회 환경과 경제 융합 단원',
    description: '자원 절약과 지속 가능한 생산·소비 생활',
    grade: 5,
    sem: '1학기',
    cha: '10',
    unit: '내일을 생각하는 착한 소비, 지속 가능한 지구',
    tb: '2. 지속 가능한 지구촌',
    ctx: '경제 활동의 기본 개념은 알고 있으나 환경 문제와의 인과 관계를 깊이 있게 분석하고 대안을 제시하는 능력이 요구됨.',
    local: '우리 고장 친환경 로컬푸드 직매장 및 업사이클링 센터',
    standards: ['[6사08-01]', '[6사08-02]'],
    tools: ['웨일북 수업 관리', '패들렛(보드·샌드박스)', '캔바', '구글 설문', '교육용 생성형 AI(전북GPT·우리아이AI 등)', '제미나이 노트북(구 NotebookLM)']
  }
];
