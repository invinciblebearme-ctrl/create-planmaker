import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  Sparkles,
  Check,
  FileText,
  ArrowRight,
  Bot,
  Download,
  Printer,
  RefreshCw,
  BookOpen,
  AlertCircle,
  Loader2,
  PlusCircle,
  Lock,
  Unlock,
  Eye,
  Code
} from 'lucide-react';
import {
  getJeonbukAiConfig,
  saveJeonbukAiConfig,
  resetJeonbukAiConfigToDefault,
  RECOMMENDED_MODELS,
  fetchAvailableGatewayModels,
  fetchCreateChatbotRag,
  generatePlanWithJeonbukAi
} from '../utils/jeonbukAiService';
import {
  mdToDocsHtml,
  copyDocsToClipboard,
  downloadAsDoc,
  downloadAsHtml,
  downloadAsMarkdown,
  printAsPdf
} from '../utils/googleDocsConverter';

const ADMIN_PIN = '7703';
const ADMIN_SESSION_KEY = 'create_planmaker_admin_unlocked';

export function PromptModal({
  isOpen,
  promptText,
  stds = [],
  config = {},
  autoStartJeonbuk = false,
  onClearAutoStart,
  onClose,
  onOpenDocs,
  onToast
}) {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState('prompt'); // 'prompt' | 'ai-result'
  const [resultViewMode, setResultViewMode] = useState('preview'); // 'preview' | 'markdown'

  // 관리자 잠금 및 전북 AI 설정 상태
  const [showSettings, setShowSettings] = useState(false);
  const [isAdminUnlocked, setIsAdminUnlocked] = useState(
    () => sessionStorage.getItem(ADMIN_SESSION_KEY) === 'true'
  );
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState('');
  const [customKeyInput, setCustomKeyInput] = useState('');
  const [aiConfig, setAiConfig] = useState(() => getJeonbukAiConfig());
  const [gatewayModels, setGatewayModels] = useState(RECOMMENDED_MODELS);
  const [loadingModels, setLoadingModels] = useState(false);

  // RAG 및 AI 생성 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStep, setGenerationStep] = useState('');
  const [ragInfo, setRagInfo] = useState({ source: '', results: [] });
  const [aiMarkdown, setAiMarkdown] = useState('');
  const [aiError, setAiError] = useState('');
  const [modelUsedLabel, setModelUsedLabel] = useState('');
  const [docsCopySuccess, setDocsCopySuccess] = useState(false);

  const abortControllerRef = useRef(null);
  const previewScrollRef = useRef(null);

  // 모달 열릴 때 최신 설정 동기화
  useEffect(() => {
    if (isOpen) {
      const loaded = getJeonbukAiConfig();
      setAiConfig(loaded);
      setCustomKeyInput(loaded.isCustomKey ? loaded.apiKey : '');
      setAiError('');
      setPinInput('');
      setPinError('');
    } else {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      setIsGenerating(false);
      setShowSettings(false);
      setPinInput('');
      setPinError('');
    }
  }, [isOpen]);

  // 메인 화면에서 [전북 AI로 바로 만들기]로 진입한 경우 자동 실행
  useEffect(() => {
    if (isOpen && autoStartJeonbuk && promptText) {
      if (onClearAutoStart) onClearAutoStart();
      handleRunJeonbukAi(false);
    }
  }, [isOpen, autoStartJeonbuk, promptText]);

  // AI 생성 결과가 업데이트될 때 구글 문서 변환기 로컬스토리지에도 자동 동기화
  const convertedResult = mdToDocsHtml(aiMarkdown);

  useEffect(() => {
    if (aiMarkdown && aiMarkdown.trim()) {
      try {
        localStorage.setItem('create-planmaker-docs-md', aiMarkdown);
      } catch (e) {}
    }
  }, [aiMarkdown]);

  if (!isOpen) return null;

  const docTitle = `${config.grade || 4}학년_${
    stds.length ? [...new Set(stds.map((s) => s.s))].join('·') : '교과'
  }_CREATE_교수학습지도안${config.unit ? '_' + config.unit : ''}`;

  const handleCopyOnly = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      onToast('프롬프트가 클립보드에 복사되었습니다 📋');
    } catch (e) {
      onToast('클립보드 복사에 실패했습니다.');
    }
  };

  const handleOpenGemini = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      const win = window.open('https://gemini.google.com/app', '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch (e) {}
        onToast('프롬프트 복사 완료! 제미나이 대화창에 Ctrl+V로 붙여넣으세요 ✨');
      } else {
        onToast('프롬프트가 복사되었습니다. 제미나이를 열어 붙여넣으세요.');
      }
    } catch (e) {
      onToast('프롬프트 복사 중 오류가 발생했습니다.');
    }
  };

  const handleOpenChatGPT = async () => {
    try {
      await navigator.clipboard.writeText(promptText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      const win = window.open('https://chatgpt.com/', '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch (e) {}
        onToast('프롬프트 복사 완료! ChatGPT 대화창에 Ctrl+V로 붙여넣으세요 🤖');
      } else {
        onToast('프롬프트가 복사되었습니다. ChatGPT를 열어 붙여넣으세요.');
      }
    } catch (e) {
      onToast('프롬프트 복사 중 오류가 발생했습니다.');
    }
  };

  // 관리자 PIN 확인
  const handleUnlockPin = (e) => {
    e.preventDefault();
    if (pinInput.trim() === ADMIN_PIN) {
      setIsAdminUnlocked(true);
      sessionStorage.setItem(ADMIN_SESSION_KEY, 'true');
      setPinInput('');
      setPinError('');
      onToast('관리자 설정 잠금이 해제되었습니다 🔓');
    } else {
      setPinError('관리자 비밀번호가 올바르지 않습니다.');
    }
  };

  const handleLockAdmin = () => {
    setIsAdminUnlocked(false);
    sessionStorage.removeItem(ADMIN_SESSION_KEY);
    setShowSettings(false);
    setPinInput('');
    setPinError('');
    onToast('관리자 설정을 다시 잠갔습니다 🔒');
  };

  // API 키 및 설정 저장
  const handleSaveSettings = (e) => {
    if (e) e.preventDefault();
    const payload = {
      ...aiConfig,
      apiKey: customKeyInput.trim() // 비어 있으면 기본 내장 키로 자동 설정됨
    };
    const saved = saveJeonbukAiConfig(payload);
    setAiConfig(saved);
    setCustomKeyInput(saved.isCustomKey ? saved.apiKey : '');
    setShowSettings(false);
    onToast('전북 AI 설정이 저장되었습니다 ✨');
  };

  // 기본 내장 API 키로 복원
  const handleResetDefaultConfig = () => {
    const def = resetJeonbukAiConfigToDefault();
    setAiConfig(def);
    setCustomKeyInput('');
    onToast('기본 내장 전북 AI API 키 및 설정으로 복원되었습니다 🔄');
  };

  // 게이트웨이 지원 모델 목록 불러오기
  const handleFetchModels = async () => {
    setLoadingModels(true);
    try {
      const keyToUse = customKeyInput.trim() || aiConfig.apiKey;
      const list = await fetchAvailableGatewayModels(keyToUse, aiConfig.baseUrl);
      if (list.length > 0) {
        setGatewayModels(list);
        onToast(`전북 AI 게이트웨이에서 ${list.length}개 모델 목록을 불러왔습니다.`);
      } else {
        onToast('기본 추천 모델 목록을 유지합니다.');
      }
    } catch (err) {
      onToast(err.message || '모델 목록 조회에 실패했습니다.');
    } finally {
      setLoadingModels(false);
    }
  };

  // 전북 AI로 지도안 생성 실행 (create-chatbot RAG 연동)
  const handleRunJeonbukAi = async (isContinue = false) => {
    const latestConfig = getJeonbukAiConfig();
    setAiConfig(latestConfig);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    const controller = new AbortController();
    abortControllerRef.current = controller;

    setActiveTab('ai-result');
    setResultViewMode('preview');
    setIsGenerating(true);
    setAiError('');

    if (!isContinue) {
      setAiMarkdown('');
    }

    try {
      // 1단계: create-chatbot의 학습된 RAG 자료 검색
      let currentRagResults = ragInfo.results || [];
      if (latestConfig.useRag && (!isContinue || currentRagResults.length === 0)) {
        setGenerationStep('🔍 create-chatbot의 학습된 연구학교 RAG 자료(길잡이·단원설계안·지도안)를 검색하고 있습니다...');
        const ragData = await fetchCreateChatbotRag({ stds, config });
        currentRagResults = ragData.results || [];
        setRagInfo(ragData);
      }

      // 2단계: 전북 AI API Gateway 호출 (스트리밍)
      setGenerationStep('✍️ 전북 AI가 create-chatbot RAG 자료와 성취기준을 바탕으로 지도안을 작성하고 있습니다...');
      const res = await generatePlanWithJeonbukAi({
        promptText,
        ragResults: latestConfig.useRag ? currentRagResults : [],
        previousMarkdown: isContinue ? aiMarkdown : '',
        onStreamChunk: (partialMd) => {
          setAiMarkdown(partialMd);
        },
        signal: controller.signal
      });

      setAiMarkdown(res.markdown);
      setModelUsedLabel(res.modelUsed || latestConfig.model);
      onToast('전북 AI가 CREATE 맞춤형 수업 지도안 생성을 완료했습니다! 🎉');
    } catch (err) {
      if (err.name === 'AbortError') {
        onToast('지도안 생성을 중지했습니다.');
      } else {
        setAiError(err.message || '전북 AI 호출 중 오류가 발생했습니다.');
      }
    } finally {
      setIsGenerating(false);
      setGenerationStep('');
    }
  };

  const handleStopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    setIsGenerating(false);
    setGenerationStep('');
  };

  // 문서 다운로드 핸들러들
  const handleDownloadDoc = () => {
    if (!convertedResult.html) return;
    downloadAsDoc(convertedResult.html, docTitle);
    onToast('Word/한글 호환 문서(.doc) 다운로드를 시작합니다 📥');
  };

  const handleDownloadHtml = () => {
    if (!convertedResult.html) return;
    downloadAsHtml(convertedResult.html, docTitle);
    onToast('웹 문서(.html) 다운로드를 시작합니다 📥');
  };

  const handleDownloadMd = () => {
    if (!aiMarkdown.trim()) return;
    downloadAsMarkdown(aiMarkdown, docTitle);
    onToast('마크다운(.md) 문서 다운로드를 시작합니다 📥');
  };

  const handlePrintPdf = () => {
    if (!convertedResult.html) return;
    const ok = printAsPdf(convertedResult.html, docTitle.replace(/_/g, ' '));
    if (!ok) {
      onToast('팝업 차단을 해제한 뒤 다시 인쇄/PDF 저장을 눌러 주세요.');
    }
  };

  const handleCopyAndOpenGoogleDocs = async () => {
    if (!convertedResult.html) return;
    const ok = await copyDocsToClipboard(convertedResult.html, convertedResult.textPlain);
    if (ok) {
      setDocsCopySuccess(true);
      setTimeout(() => setDocsCopySuccess(false), 3000);
      const win = window.open('https://docs.new', '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch (e) {}
        onToast('서식 복사 완료! 새로 열린 구글 문서에서 Ctrl+V (⌘+V)를 누르세요 ✨');
      } else {
        onToast('서식 복사 완료! 구글 문서를 열고 Ctrl+V를 누르세요.');
      }
    } else {
      onToast('클립보드 복사에 실패했습니다.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">✨</span>
            <div>
              <h2>CREATE 수업 설계 프롬프트 & 전북 AI 지도안 생성</h2>
              <p>
                제미나이·ChatGPT로 열거나, <strong>create-chatbot의 학습된 RAG</strong>를 참고해{' '}
                <strong>전북 AI</strong>로 즉시 지도안을 만들고 문서로 다운로드하세요
              </p>
            </div>
          </div>

          <div className="modal-header-actions">
            <div className="tabs-pill">
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === 'prompt' ? 'active' : ''}`}
                onClick={() => setActiveTab('prompt')}
              >
                📋 생성된 프롬프트
              </button>
              <button
                type="button"
                className={`tab-pill-btn ${activeTab === 'ai-result' ? 'active' : ''}`}
                onClick={() => setActiveTab('ai-result')}
              >
                🏫 전북 AI 지도안 결과 {aiMarkdown ? '✓' : ''}
              </button>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {/* 상단 주요 AI 실행 버튼 바 (제미나이 열기 / ChatGPT 열기 / 전북 AI로 만들기) */}
          <div className="prompt-action-strip">
            <button type="button" className="gemini-primary-btn" onClick={handleOpenGemini}>
              <Sparkles size={17} /> 프롬프트 복사하고 제미나이(Gemini) 열기
            </button>

            <button type="button" className="chatgpt-secondary-btn" onClick={handleOpenChatGPT}>
              🤖 ChatGPT 열기
            </button>

            <button
              type="button"
              className="jeonbuk-ai-btn"
              onClick={() => handleRunJeonbukAi(false)}
              disabled={isGenerating}
            >
              {isGenerating ? (
                <>
                  <Loader2 size={17} className="spin-icon" /> 전북 AI 생성 중...
                </>
              ) : (
                <>
                  <Bot size={17} /> 🏫 전북 AI로 만들기 (RAG 연동)
                </>
              )}
            </button>

            <button type="button" className="secondary-action-btn" onClick={handleCopyOnly}>
              {copied ? <Check size={15} /> : <Copy size={15} />} 프롬프트 복사
            </button>

            <button
              type="button"
              className={`admin-lock-icon-btn ${showSettings ? 'active' : ''}`}
              onClick={() => {
                setShowSettings((prev) => !prev);
                setPinError('');
              }}
              title="관리자 전용 설정"
              aria-label="관리자 전용 설정"
            >
              {isAdminUnlocked ? <Unlock size={15} /> : <Lock size={15} />}
            </button>
          </div>

          {/* 관리자 전용 잠금 화면 또는 전북 AI 설정 패널 */}
          {showSettings && !isAdminUnlocked && (
            <form className="admin-pin-gate" onSubmit={handleUnlockPin}>
              <div className="pin-gate-left">
                <Lock size={18} className="pin-lock-icon" />
                <div>
                  <strong>🔒 관리자 전용 설정 (비밀번호 보호됨)</strong>
                  <p>전북 AI API 키 및 모델 설정은 관리자만 열람·변경할 수 있습니다.</p>
                </div>
              </div>
              <div className="pin-gate-right">
                <input
                  type="password"
                  className="text-input pin-input-box"
                  placeholder="관리자 PIN 입력"
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError('');
                  }}
                  maxLength={12}
                  autoFocus
                />
                <button type="submit" className="primary-action-btn">
                  확인
                </button>
                <button
                  type="button"
                  className="secondary-action-btn"
                  onClick={() => setShowSettings(false)}
                >
                  닫기
                </button>
              </div>
              {pinError && <p className="pin-error-msg">{pinError}</p>}
            </form>
          )}

          {showSettings && isAdminUnlocked && (
            <form className="jeonbuk-settings-panel" onSubmit={handleSaveSettings}>
              <div className="settings-panel-header">
                <div>
                  <strong>⚙️ [관리자 전용] 전북 AI (API Gateway) 및 create-chatbot RAG 설정</strong>
                  <p>
                    현재 <strong>{aiConfig.isCustomKey ? '사용자 지정 API 키' : '기본 내장 API 키(암호화 보호됨)'}</strong>가 적용되어 있습니다. 새 키를 입력해 변경하거나 기본값으로 복원할 수 있습니다.
                  </p>
                </div>
                <div className="settings-header-btns">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={handleLockAdmin}
                    title="관리자 설정 다시 잠그기"
                  >
                    <Lock size={13} /> 잠금
                  </button>
                  <button
                    type="button"
                    className="text-close-btn"
                    onClick={() => setShowSettings(false)}
                  >
                    닫기
                  </button>
                </div>
              </div>

              <div className="settings-grid">
                <div className="settings-field span-2">
                  <label>
                    🔑 새 전북 AI API Key 변경 ({aiConfig.isCustomKey ? '현재: 사용자 지정 키 적용 중' : '현재: 기본 내장 키 자동 사용 중'})
                  </label>
                  <input
                    type="password"
                    className="text-input"
                    placeholder="변경할 새 API 키 입력 (비워두면 기본 내장 키가 사용됩니다)"
                    value={customKeyInput}
                    onChange={(e) => setCustomKeyInput(e.target.value)}
                    autoComplete="new-password"
                  />
                </div>

                <div className="settings-field">
                  <label className="label-with-action">
                    <span>🤖 생성 모델 (Model)</span>
                    <button
                      type="button"
                      className="mini-link-btn"
                      onClick={handleFetchModels}
                      disabled={loadingModels}
                    >
                      <RefreshCw size={11} className={loadingModels ? 'spin-icon' : ''} /> 모델 목록 조회
                    </button>
                  </label>
                  <select
                    className="text-input"
                    value={aiConfig.model}
                    onChange={(e) => setAiConfig({ ...aiConfig, model: e.target.value })}
                  >
                    {gatewayModels.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="settings-field">
                  <label>💬 스튜디오 챗봇 ID (선택사항)</label>
                  <input
                    type="text"
                    className="text-input"
                    placeholder="비워두면 기본 Chat Completions 호출"
                    value={aiConfig.chatbotId}
                    onChange={(e) => setAiConfig({ ...aiConfig, chatbotId: e.target.value })}
                  />
                </div>

                <div className="settings-field">
                  <label>🌐 Gateway Base URL</label>
                  <input
                    type="text"
                    className="text-input"
                    value={aiConfig.baseUrl}
                    onChange={(e) => setAiConfig({ ...aiConfig, baseUrl: e.target.value })}
                  />
                </div>

                <div className="settings-field settings-checkbox-col">
                  <label className="option-check-wrap">
                    <input
                      type="checkbox"
                      checked={aiConfig.useRag}
                      onChange={(e) => setAiConfig({ ...aiConfig, useRag: e.target.checked })}
                    />
                    <span className="custom-check" />
                    <span className="option-label-text">
                      📚 <strong>create-chatbot의 학습된 RAG 자료</strong>(길잡이·단원설계안·지도안) 자동 검색 및 참고
                    </span>
                  </label>
                </div>
              </div>

              <div className="settings-panel-footer">
                <span className="settings-hint">
                  💡 기본 내장 API 키는 외부에 평문으로 노출되지 않도록 보호됩니다.
                </span>
                <div className="settings-btn-group">
                  <button
                    type="button"
                    className="secondary-action-btn"
                    onClick={handleResetDefaultConfig}
                    title="내장된 기본 API 키와 모델 설정으로 되돌립니다"
                  >
                    기본값으로 복원
                  </button>
                  <button type="submit" className="primary-action-btn">
                    <Check size={15} /> 설정 저장
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* 탭 1: 생성된 프롬프트 보기 */}
          {activeTab === 'prompt' && (
            <>
              <div className="prompt-tips-row">
                <div className="tip-bubble">
                  💡 <strong>작성 꿀팁:</strong> 상단의 <strong>[🏫 전북 AI로 만들기]</strong>를 누르면{' '}
                  <code>create-chatbot</code>의 연구학교 RAG 자료를 참고해 이 화면에서 바로 지도안을 완성하고 문서로 다운로드할 수 있습니다!
                </div>
                <button
                  type="button"
                  className="next-step-btn"
                  onClick={() => {
                    onClose();
                    onOpenDocs();
                  }}
                >
                  <FileText size={15} /> 구글 문서 변환기 열기 <ArrowRight size={14} />
                </button>
              </div>

              <div className="prompt-text-container">
                <textarea
                  className="prompt-textarea"
                  readOnly
                  value={promptText}
                  onClick={(e) => e.target.select()}
                />
              </div>
            </>
          )}

          {/* 탭 2: 전북 AI 지도안 생성 결과 및 문서 다운로드 */}
          {activeTab === 'ai-result' && (
            <div className="jeonbuk-result-section">
              {/* 참고한 create-chatbot RAG 자료 배지 바 */}
              {aiConfig.useRag && ragInfo.results && ragInfo.results.length > 0 && (
                <div className="rag-citations-banner">
                  <div className="rag-banner-title">
                    <BookOpen size={15} />
                    <strong>create-chatbot 학습 RAG 참고 자료 ({ragInfo.results.length}건 반영됨):</strong>
                  </div>
                  <div className="rag-chips-list">
                    {ragInfo.results.map((item, idx) => (
                      <span
                        key={item.id || idx}
                        className="rag-doc-chip"
                        title={item.content}
                      >
                        📄 {item.document_title} <small>({item.page_number || 1}쪽)</small>
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {/* 진행 상태 표시 */}
              {isGenerating && (
                <div className="ai-generating-banner">
                  <Loader2 size={20} className="spin-icon" />
                  <div className="generating-text">
                    <strong>{generationStep || '전북 AI가 수업 지도안을 작성하고 있습니다...'}</strong>
                    <span>실시간으로 아래에 지도안이 출력됩니다. 잠시만 기다려 주세요.</span>
                  </div>
                  <button
                    type="button"
                    className="danger-text-btn"
                    onClick={handleStopGeneration}
                  >
                    생성 중지
                  </button>
                </div>
              )}

              {/* 에러 안내 */}
              {aiError && (
                <div className="ai-error-banner">
                  <AlertCircle size={20} />
                  <div className="error-text-col">
                    <strong>전북 AI 지도안 생성 안내</strong>
                    <p>{aiError}</p>
                  </div>
                  <div className="error-actions">
                    <button
                      type="button"
                      className="primary-action-btn"
                      onClick={() => handleRunJeonbukAi(false)}
                    >
                      <RefreshCw size={14} /> 다시 시도
                    </button>
                  </div>
                </div>
              )}

              {/* 문서 다운로드 & 내보내기 툴바 */}
              <div className="ai-result-toolbar">
                <div className="download-buttons-group">
                  <button
                    type="button"
                    className="primary-action-btn"
                    disabled={!aiMarkdown.trim()}
                    onClick={handleDownloadDoc}
                    title="MS Word, 한컴오피스 한글, 구글 문서에서 표와 서식이 그대로 열리는 문서 파일(.doc)로 다운로드합니다"
                  >
                    <Download size={16} /> 문서(.doc) 다운로드
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled={!aiMarkdown.trim()}
                    onClick={handlePrintPdf}
                    title="A4 규격으로 인쇄하거나 PDF 파일로 저장합니다"
                  >
                    <Printer size={15} /> PDF 저장 / 인쇄
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled={!aiMarkdown.trim()}
                    onClick={handleDownloadHtml}
                  >
                    <Download size={15} /> HTML 다운로드
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled={!aiMarkdown.trim()}
                    onClick={handleDownloadMd}
                  >
                    <Download size={15} /> 마크다운(.md)
                  </button>

                  <button
                    type="button"
                    className="secondary-action-btn"
                    disabled={!aiMarkdown.trim()}
                    onClick={handleCopyAndOpenGoogleDocs}
                  >
                    {docsCopySuccess ? <Check size={15} /> : <Copy size={15} />}
                    서식 복사 + 구글 문서(docs.new)
                  </button>
                </div>

                <div className="result-view-controls">
                  {aiMarkdown.trim() && !isGenerating && (
                    <button
                      type="button"
                      className="continue-gen-btn"
                      onClick={() => handleRunJeonbukAi(true)}
                      title="내용이 중간에 끊겼다면 이어서 뒷부분을 작성합니다"
                    >
                      <PlusCircle size={14} /> 이어서 작성하기
                    </button>
                  )}

                  <div className="tabs-pill">
                    <button
                      type="button"
                      className={`tab-pill-btn ${resultViewMode === 'preview' ? 'active' : ''}`}
                      onClick={() => setResultViewMode('preview')}
                    >
                      <Eye size={13} /> 문서 서식 보기
                    </button>
                    <button
                      type="button"
                      className={`tab-pill-btn ${resultViewMode === 'markdown' ? 'active' : ''}`}
                      onClick={() => setResultViewMode('markdown')}
                    >
                      <Code size={13} /> 마크다운 원문/편집
                    </button>
                  </div>
                </div>
              </div>

              {/* 결과 출력 영역 */}
              {resultViewMode === 'preview' ? (
                <div
                  ref={previewScrollRef}
                  className="docs-html-preview ai-live-preview"
                  dangerouslySetInnerHTML={{
                    __html:
                      convertedResult.html ||
                      `<div class="empty-preview-prompt">
                        <span>🏫</span>
                        <p>${
                          isGenerating
                            ? '전북 AI가 create-chatbot의 학습된 RAG를 참고하여 지도안을 작성 중입니다...'
                            : '상단의 [🏫 전북 AI로 만들기] 버튼을 누르면 이곳에 완성된 수업 지도안이 출력됩니다.'
                        }</p>
                      </div>`
                  }}
                />
              ) : (
                <textarea
                  className="docs-textarea ai-live-textarea"
                  value={aiMarkdown}
                  onChange={(e) => setAiMarkdown(e.target.value)}
                  placeholder="전북 AI가 생성한 마크다운 원문이 여기에 표시됩니다. 직접 내용을 수정하면 문서 미리보기와 다운로드 파일에 즉시 반영됩니다."
                />
              )}
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-hint">
            {activeTab === 'ai-result' && modelUsedLabel
              ? `⚡ 생성 모델: ${modelUsedLabel} · 생성된 지도안은 [문서(.doc) 다운로드] 또는 [구글 문서 변환기]에서 바로 저장할 수 있습니다.`
              : '💡 [🏫 전북 AI로 만들기]를 클릭하면 create-chatbot의 학습된 RAG를 참고하여 즉시 지도안을 생성합니다.'}
          </span>
          <div className="modal-footer-btns">
            {aiMarkdown.trim() && (
              <button
                type="button"
                className="primary-action-btn"
                onClick={handleDownloadDoc}
              >
                <Download size={15} /> 문서(.doc) 다운로드
              </button>
            )}
            <button className="secondary-action-btn" onClick={onClose}>
              닫기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
