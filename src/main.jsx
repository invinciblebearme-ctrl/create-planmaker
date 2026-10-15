import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { StandardBrowser } from './components/StandardBrowser';
import { LessonConfigForm } from './components/LessonConfigForm';
import { PromptModal } from './components/PromptModal';
import { GoogleDocsModal } from './components/GoogleDocsModal';
import { GuidebookModal } from './components/GuidebookModal';
import { HelpModal } from './components/HelpModal';
import { generateCreatePrompt } from './utils/promptGenerator';
import { SAMPLE_PRESETS } from './constants/createConfig';
import './style.css';

const DEFAULT_CONFIG = {
  grade: 4,
  sem: '1학기',
  cha: '12',
  unit: '',
  tb: '',
  ctx: '',
  local: '',
  stages: { C: true, R: true, E1: true, A: true, T: true, E2: true },
  tools: [
    '웨일북 수업 관리',
    '학급 플랫폼(웨일클래스·클래스팅 등)',
    '패들렛(보드·샌드박스)',
    '캔바',
    '구글 설문',
    '띵커벨',
    '교육용 생성형 AI(전북GPT·우리아이AI 등)'
  ],
  options: {
    includeImg: true,
    includeCheck: true
  }
};

function App() {
  const [allStandards, setAllStandards] = useState([]);
  const [loadingStandards, setLoadingStandards] = useState(true);
  const [pickedCodes, setPickedCodes] = useState(['[4과02-01]', '[4과02-02]']);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  // 모달 상태
  const [promptModalOpen, setPromptModalOpen] = useState(false);
  const [docsModalOpen, setDocsModalOpen] = useState(false);
  const [guideModalOpen, setGuideModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [generatedPrompt, setGeneratedPrompt] = useState('');

  // 토스트 알림
  const [toastMessage, setToastMessage] = useState('');

  const showToast = (msg) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage('');
    }, 3500);
  };

  // standards.json 불러오기
  useEffect(() => {
    fetch('./standards.json')
      .then((res) => {
        if (!res.ok) throw new Error('Failed to load standards.json');
        return res.json();
      })
      .then((data) => {
        setAllStandards(data);
        setLoadingStandards(false);
      })
      .catch((err) => {
        console.warn('Fallback loading standards:', err);
        // public 폴더 기준 재시도
        fetch('/standards.json')
          .then((res) => res.json())
          .then((data) => {
            setAllStandards(data);
            setLoadingStandards(false);
          })
          .catch((e) => {
            console.error('Final standards load error:', e);
            setLoadingStandards(false);
          });
      });
  }, []);

  // 로컬스토리지 불러오기
  useEffect(() => {
    try {
      const savedPicked = localStorage.getItem('create-planmaker-picked');
      if (savedPicked) {
        const parsed = JSON.parse(savedPicked);
        if (Array.isArray(parsed) && parsed.length) {
          setPickedCodes(parsed);
        }
      }
      const savedConfig = localStorage.getItem('create-planmaker-config');
      if (savedConfig) {
        const parsed = JSON.parse(savedConfig);
        setConfig((prev) => ({ ...prev, ...parsed }));
      }
    } catch (e) {}
  }, []);

  // 로컬스토리지 자동 저장
  useEffect(() => {
    try {
      localStorage.setItem('create-planmaker-picked', JSON.stringify(pickedCodes));
    } catch (e) {}
  }, [pickedCodes]);

  useEffect(() => {
    try {
      localStorage.setItem('create-planmaker-config', JSON.stringify(config));
    } catch (e) {}
  }, [config]);

  // 성취기준 토글
  const handleToggleCode = (code) => {
    setPickedCodes((prev) => {
      const exists = prev.includes(code);
      if (exists) {
        showToast(`${code} 성취기준을 해제했습니다.`);
        return prev.filter((c) => c !== code);
      } else {
        showToast(`${code} 성취기준을 추가했습니다 ✨`);
        return [...prev, code];
      }
    });
  };

  const handleClearPicked = () => {
    setPickedCodes([]);
    showToast('선택한 성취기준을 모두 비웠습니다.');
  };

  // 프리셋 불러오기
  const handleLoadPreset = (preset) => {
    setPickedCodes(preset.standards || []);
    setConfig((prev) => ({
      ...prev,
      grade: preset.grade || prev.grade,
      sem: preset.sem || prev.sem,
      cha: preset.cha || prev.cha,
      unit: preset.unit || '',
      tb: preset.tb || '',
      ctx: preset.ctx || '',
      local: preset.local || '',
      tools: preset.tools || prev.tools
    }));
    showToast(`「${preset.title}」 예시 단원을 불러왔습니다 💡`);
  };

  // 초기화
  const handleReset = () => {
    if (window.confirm('모든 입력값과 선택한 성취기준을 초기화하시겠습니까?')) {
      setConfig(DEFAULT_CONFIG);
      setPickedCodes([]);
      showToast('설정을 초기화했습니다.');
    }
  };

  // 프롬프트 생성
  const handleGeneratePrompt = () => {
    const stds = allStandards.filter((item) => pickedCodes.includes(item.c));
    const prompt = generateCreatePrompt({
      stds,
      grade: config.grade,
      sem: config.sem,
      cha: config.cha,
      unit: config.unit,
      tb: config.tb,
      ctx: config.ctx,
      local: config.local,
      tools: config.tools,
      stages: config.stages,
      options: config.options
    });

    setGeneratedPrompt(prompt);
    setPromptModalOpen(true);
    showToast('CREATE 맞춤형 수업 설계 프롬프트가 생성되었습니다! ✨');
  };

  return (
    <div className="app-root">
      {/* 사이트 공통 헤더 */}
      <Header
        onOpenGuide={() => setGuideModalOpen(true)}
        onOpenHelp={() => setHelpModalOpen(true)}
        onOpenDocs={() => setDocsModalOpen(true)}
      />

      <main className="shell">
        {/* 히어로 소개 영역 */}
        <section className="hero-section">
          <div className="hero-pill-badge">
            <span>✨</span> 2022 개정 교육과정 전 학년·전 교과 성취기준 탑재
          </div>
          <h1 className="hero-title">
            CREATE 모형 <span className="highlight">수업 설계 도우미</span>
          </h1>
          <p className="hero-subtitle">
            성취기준만 고르면 <strong>단원 설계안·차시 지도안·루브릭 평가지</strong>까지!
            <br />
            전라북도교육청 연구학교 CREATE 6단계 모형 기반의 완성도 높은 생성형 AI 프롬프트와 구글 문서를 즉시 만듭니다.
          </p>

          <div className="hero-feature-chips">
            <span className="feature-chip">🎯 2022 개정 611개 성취기준</span>
            <span className="feature-chip">⚡ 1초 프롬프트 생성</span>
            <span className="feature-chip">📋 Google Docs 표·서식 원클릭 변환</span>
            <span className="feature-chip">🔒 브라우저 로컬 저장 (서버 전송 없음)</span>
          </div>
        </section>

        {/* 메인 2단 작업 인터페이스 */}
        <div className="app-grid-layout">
          {/* 좌측: 성취기준 탐색 및 선택 (STEP 1) */}
          <StandardBrowser
            allStandards={allStandards}
            pickedCodes={pickedCodes}
            onToggleCode={handleToggleCode}
            onClearPicked={handleClearPicked}
            targetGrade={config.grade}
          />

          {/* 우측: 단원 조건 및 CREATE 모형 커스텀 (STEP 2 & 3) */}
          <LessonConfigForm
            config={config}
            onChangeConfig={(newValues) => setConfig((prev) => ({ ...prev, ...newValues }))}
            onGeneratePrompt={handleGeneratePrompt}
            onLoadPreset={handleLoadPreset}
            onReset={handleReset}
          />
        </div>
      </main>

      {/* 사이트 푸터 */}
      <Footer />

      {/* 프롬프트 결과 모달 */}
      <PromptModal
        isOpen={promptModalOpen}
        promptText={generatedPrompt}
        onClose={() => setPromptModalOpen(false)}
        onOpenDocs={() => setDocsModalOpen(true)}
        onToast={showToast}
      />

      {/* 구글 문서 변환 모달 */}
      <GoogleDocsModal
        isOpen={docsModalOpen}
        onClose={() => setDocsModalOpen(false)}
        onToast={showToast}
      />

      {/* CREATE 가이드북 모달 */}
      <GuidebookModal
        isOpen={guideModalOpen}
        onClose={() => setGuideModalOpen(false)}
      />

      {/* 사용법 및 도움말 모달 */}
      <HelpModal
        isOpen={helpModalOpen}
        onClose={() => setHelpModalOpen(false)}
      />

      {/* 토스트 팝업 */}
      {toastMessage && (
        <div className="toast-pill" role="status" aria-live="polite">
          {toastMessage}
        </div>
      )}
    </div>
  );
}

const rootElement = document.getElementById('root');
if (rootElement) {
  createRoot(rootElement).render(<App />);
}
