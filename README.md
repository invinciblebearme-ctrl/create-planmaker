# CREATE 모형 수업 설계 도우미 (Planmaker)

**[create.allforedu.kr](https://create.allforedu.kr/) 공식 사이트 스타일 및 테마와 100% 통일된 2022 개정 교육과정 기반 수업 설계 도우미 웹앱**입니다.

초등 교사가 성취기준을 검색·선택하면, 연구학교의 **CREATE 6단계(진단–탐색–실행–분석–전이–성장) 교수·학습 개발모형**을 엄격히 준수한 단원 설계안·차시 지도안·루브릭 평가지 AI 프롬프트와 구글 문서(Google Docs)를 즉시 생성합니다.

---

## ✨ 핵심 기능 및 보완 개선 사항

1. **2022 개정 초등 전 교과 성취기준(611개) 완벽 탑재**
   - 1~2학년군, 3~4학년군, 5~6학년군 및 전 교과(국어, 수학, 사회, 과학, 도덕, 영어, 음악, 미술, 체육, 실과, 바른 생활, 슬기로운 생활, 즐거운 생활) 지원
   - 실시간 코드(`[4과02-01]`), 교과, 영역, 핵심 키워드 통합 검색
   - 교과 간 복수 선택을 통한 **융합 단원** 설계 지원
   - 각 성취기준별 **성취수준 A·B·C 및 교육과정 탐구 활동 예시** 아코디언 열람

2. **CREATE 6단계 교수·학습 개발모형 커스텀**
   - **C 진단 (Check & Context)**: 사전 지식, 흥미, 오개념, 디지털 리터러시 진단
   - **R 탐색 (Research & Resource)**: 교육과정 재구성, 일반화 문장 및 탐구 질문
   - **E 실행 (Experience & Engagement)**: 학생 주도적 협력 탐구, 디지털 및 아날로그 매체 결합
   - **A 분석 (Assess & Adjust)**: 루브릭 평가 및 C/R/E 단계로의 피드백 환류
   - **T 전이 (Transfer & Transformation)**: 타 교과 융합 및 실생활·지역 사회 맥락 적용
   - **E 성장 (Expand & Empower)**: 나만의 일반화 문장 완성, C진단 대비 성장도 공유
   - 단원 특성에 따라 단계별 적용/생략 원클릭 토글

3. **초등 맞춤형 에듀테크 & AI 도구 팔레트**
   - 웨일북, 패들렛(보드/샌드박스), 캔바, 구글 설문, 띵커벨, 젭퀴즈, 전북GPT, 우리아이AI, 제미나이 노트북(NotebookLM) 등 기본 탑재
   - 학교 현장에서 쓰는 맞춤형 도구 즉시 추가 기능

4. **원클릭 AI 연동 및 구글 문서(Google Docs) 변환기**
   - **✨ 제미나이(Gemini) 열기**: 프롬프트 복사 후 즉시 대화창 새 탭 이동
   - **🤖 ChatGPT 열기**: 프롬프트 복사 후 ChatGPT 대화창 이동
   - **📄 AI 결과 → 구글 문서 변환기**:
     - 마크다운 결과를 붙여넣으면 표 서식, 제목 배너, 이미지 박스가 살아있는 HTML로 실시간 렌더링
     - 여러 번의 AI 응답을 이어 붙여 하나의 문서로 자동 결합
     - **[서식 복사하고 새 구글 문서 열기]** 클릭 후 `docs.new`에서 `Ctrl+V`만 하면 완성
     - 생성된 시각 자료(그림 1, 그림 2)에 대해 **[🎨 그림 N 설명 복사 + 제미나이 열기]** 원클릭 지원

5. **`create.allforedu.kr` 테마와 완벽한 통일성**
   - 파스텔 블루/라벤더 배경 그라데이션, `Nunito` & `Noto Sans KR` 폰트
   - `✦ ✧ ✦ ✧ ✦` 상단 라인 및 `✳ CREATE` 브랜드 아이덴티티
   - `create.allforedu.kr` 메인 홈, 단원설계 길잡이, 학년별 설계안, 연구학교 자료실과의 매끄러운 내비게이션 링크

6. **브라우저 로컬 저장소(LocalStorage) 자동 보존**
   - 작업 중인 성취기준, 단원 설정, 변환 중인 지도안 결과가 브라우저에 안전하게 보존되어 새로고침해도 유지 (외부 서버 전송 없음)
   - 실증 수업(4학년 과학 생태계 융합 단원 등) 예시 1초 프리셋 제공

---

## 🚀 로컬 실행 방법

```bash
# 1. 패키지 설치
npm install

# 2. 로컬 개발 서버 실행
npm run dev

# 3. 배포용 빌드
npm run build

# 4. 빌드 결과 미리보기
npm run preview
```

---

## 📁 프로젝트 구조

```
planmaker/
├── public/
│   └── standards.json            # 2022 개정 초등 611개 성취기준 및 A·B·C 수준
├── src/
│   ├── components/
│   │   ├── Header.jsx            # 사이트 공통 헤더 및 내비게이션
│   │   ├── Footer.jsx            # 사이트 공통 푸터
│   │   ├── StandardBrowser.jsx   # 성취기준 탐색·선택기 (STEP 1)
│   │   ├── LessonConfigForm.jsx  # 단원 조건 및 CREATE 설정 폼 (STEP 2 & 3)
│   │   ├── PromptModal.jsx       # 프롬프트 결과 및 제미나이/ChatGPT 연동 모달
│   │   ├── GoogleDocsModal.jsx   # 마크다운 → 구글 문서 서식 변환기 모달
│   │   ├── GuidebookModal.jsx    # CREATE 6단계 모형 가이드북 모달
│   │   └── HelpModal.jsx         # 4단계 워크플로우 및 자주 묻는 질문(FAQ)
│   ├── constants/
│   │   └── createConfig.js       # CREATE 단계, 도구 목록, 프리셋 상수
│   ├── utils/
│   │   ├── promptGenerator.js    # 2022 개정 CREATE 맞춤 프롬프트 생성 알고리즘
│   │   └── googleDocsConverter.js# 마크다운 → Google Docs rich HTML 변환 및 클립보드 처리
│   ├── main.jsx                  # React 진입점 및 전역 상태 관리
│   └── style.css                 # create.allforedu.kr 통일 디자인 시스템
├── index.html
├── package.json
└── vite.config.js
```
