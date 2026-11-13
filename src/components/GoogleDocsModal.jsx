import React, { useState, useEffect, useRef } from 'react';
import {
  X,
  Copy,
  ExternalLink,
  Trash2,
  AlertCircle,
  Sparkles,
  Check,
  Image as ImageIcon,
  Download,
  Printer
} from 'lucide-react';
import {
  mdToDocsHtml,
  copyDocsToClipboard,
  downloadAsDoc,
  downloadAsHtml,
  downloadAsMarkdown,
  printAsPdf
} from '../utils/googleDocsConverter';

export function GoogleDocsModal({ isOpen, onClose, onToast }) {
  const [markdown, setMarkdown] = useState('');
  const [result, setResult] = useState({ html: '', textPlain: '', imagePrompts: [], isPrompt: false });
  const [copySuccess, setCopySuccess] = useState(false);
  const previewRef = useRef(null);

  // 모달이 열릴 때마다 로컬스토리지에서 최신 입력값(또는 전북 AI 생성 결과) 불러오기
  useEffect(() => {
    if (!isOpen) return;
    try {
      const saved = localStorage.getItem('create-planmaker-docs-md');
      if (saved) {
        setMarkdown(saved);
      }
    } catch (e) {}
  }, [isOpen]);

  // 마크다운 변경 시 변환 처리
  useEffect(() => {
    const res = mdToDocsHtml(markdown);
    setResult(res);
    try {
      if (markdown) {
        localStorage.setItem('create-planmaker-docs-md', markdown);
      }
    } catch (e) {}
  }, [markdown]);

  if (!isOpen) return null;

  // 연속 붙여넣기 시 기존 내용 뒤에 자연스럽게 개행 추가 후 이어붙임
  const handlePaste = (e) => {
    const text = (e.clipboardData || window.clipboardData).getData('text/plain');
    const ta = e.target;
    if (!text || !ta.value.trim() || ta.selectionStart !== ta.value.length) return;

    e.preventDefault();
    const updated = ta.value.replace(/\s*$/, '') + '\n\n' + text;
    setMarkdown(updated);
    onToast('앞 응답 뒤에 새 답변을 이어 붙였습니다 📝');
  };

  const handleCopyToDocs = async () => {
    if (!result.html || result.isPrompt) return;
    const ok = await copyDocsToClipboard(result.html, result.textPlain);
    if (ok) {
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 3000);
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
      onToast('클립보드 복사에 실패했습니다. 미리보기를 드래그해 복사해 주세요.');
    }
  };

  const handleDownloadDoc = () => {
    if (!result.html || result.isPrompt) return;
    downloadAsDoc(result.html, 'CREATE_모형_교수학습_지도안');
    onToast('Word/한글 호환 문서(.doc) 다운로드를 시작합니다 📥');
  };

  const handleDownloadHtml = () => {
    if (!result.html || result.isPrompt) return;
    downloadAsHtml(result.html, 'CREATE_모형_교수학습_지도안');
    onToast('웹 문서(.html) 다운로드를 시작합니다 📥');
  };

  const handleDownloadMd = () => {
    if (!markdown.trim() || result.isPrompt) return;
    downloadAsMarkdown(markdown, 'CREATE_모형_교수학습_지도안');
    onToast('마크다운(.md) 문서 다운로드를 시작합니다 📥');
  };

  const handlePrintPdf = () => {
    if (!result.html || result.isPrompt) return;
    const ok = printAsPdf(result.html, 'CREATE 모형 교수학습 지도안');
    if (!ok) {
      onToast('팝업 차단을 해제한 뒤 다시 인쇄/PDF 저장을 눌러 주세요.');
    }
  };

  const handleCopyImagePrompt = async (imgPrompt) => {
    const text = `다음 설명대로 초등학교 수업 자료 그림을 그려 줘. 그림 안에 글자나 숫자는 넣지 말고, 가로 16:9 비율로.\n\n[${imgPrompt.name}] ${imgPrompt.desc}`;
    try {
      await navigator.clipboard.writeText(text);
      const win = window.open('https://gemini.google.com/app', '_blank');
      if (win) {
        try {
          win.opener = null;
        } catch (e) {}
      }
      onToast(`그림 ${imgPrompt.n} 설명이 복사되었습니다. 제미나이에 붙여넣으세요 🎨`);
    } catch (e) {
      onToast('그림 프롬프트 복사 중 오류가 발생했습니다.');
    }
  };

  const handleClear = () => {
    if (!markdown.trim() || window.confirm('입력한 내용을 모두 비우시겠습니까?')) {
      setMarkdown('');
      localStorage.removeItem('create-planmaker-docs-md');
      onToast('입력창을 비웠습니다.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container extra-large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">📄</span>
            <div>
              <h2>AI 결과를 문서로 다운로드 & 구글 문서 변환기</h2>
              <p>전북 AI·제미나이·ChatGPT의 마크다운 결과를 표와 서식이 살아있는 문서(.doc / PDF / Google Docs)로 저장합니다</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body docs-modal-body">
          <div className="docs-flow-banner">
            <div className="flow-badge-item">
              <span className="badge-step">① AI 지도안 생성 또는 복사</span>
              <p>전북 AI로 생성 시 자동 입력되며, 제미나이/ChatGPT 답변은 복사해 오세요.</p>
            </div>
            <div className="flow-badge-item">
              <span className="badge-step">② 왼쪽 칸에 붙여넣기</span>
              <p>답변이 여러 개로 나뉘었으면 차례대로 붙여넣으세요. 자동으로 이어집니다.</p>
            </div>
            <div className="flow-badge-item">
              <span className="badge-step">③ 문서 다운로드 및 구글 문서</span>
              <p>
                <strong>[문서(.doc) 다운로드]</strong>를 누르면 파일로 즉시 저장되며, <strong>docs.new</strong> 붙여넣기도 지원합니다.
              </p>
            </div>
          </div>

          {result.isPrompt && (
            <div className="prompt-warning-box">
              <AlertCircle size={20} />
              <div>
                <strong>⚠️ 붙여 넣으신 내용은 AI에게 줄 [프롬프트]입니다.</strong>
                <p>
                  이 프롬프트를 먼저 전북 AI, 제미나이, 또는 ChatGPT에 넣어 지도안을 생성하신 후,
                  AI가 만들어 준 <strong>답변(결과)</strong>을 여기에 붙여 넣어 주세요.
                </p>
              </div>
              <a
                href="https://gemini.google.com/app"
                target="_blank"
                rel="noopener noreferrer"
                className="gemini-quick-link"
              >
                제미나이 열기 <ExternalLink size={14} />
              </a>
            </div>
          )}

          <div className="docs-actions-bar">
            <button
              type="button"
              className="primary-action-btn big"
              disabled={!markdown.trim() || result.isPrompt}
              onClick={handleDownloadDoc}
            >
              <Download size={18} />
              문서(.doc) 다운로드
            </button>

            <button
              type="button"
              className="primary-action-btn big"
              disabled={!markdown.trim() || result.isPrompt}
              onClick={handleCopyToDocs}
            >
              {copySuccess ? <Check size={18} /> : <Copy size={18} />}
              서식 복사하고 새 구글 문서 열기
            </button>

            <button
              type="button"
              className="secondary-action-btn"
              disabled={!markdown.trim() || result.isPrompt}
              onClick={handlePrintPdf}
            >
              <Printer size={15} /> PDF 저장 / 인쇄
            </button>

            <button
              type="button"
              className="secondary-action-btn"
              disabled={!markdown.trim() || result.isPrompt}
              onClick={handleDownloadHtml}
            >
              <Download size={15} /> HTML 다운로드
            </button>

            <button
              type="button"
              className="secondary-action-btn"
              disabled={!markdown.trim() || result.isPrompt}
              onClick={handleDownloadMd}
            >
              <Download size={15} /> 마크다운(.md)
            </button>

            <a
              href="https://docs.new"
              target="_blank"
              rel="noopener noreferrer"
              className="secondary-action-btn"
            >
              구글 문서 열기 (docs.new) <ExternalLink size={15} />
            </a>

            <button type="button" className="danger-text-btn" onClick={handleClear}>
              <Trash2 size={16} /> 비우기
            </button>

            <div className="docs-meta-stats">
              {markdown.trim() && <span>{markdown.length.toLocaleString()}자</span>}
              {result.imagePrompts.length > 0 && (
                <span className="image-count-tag">
                  <ImageIcon size={14} /> 그림 자리 {result.imagePrompts.length}개 발견
                </span>
              )}
            </div>
          </div>

          {result.imagePrompts.length > 0 && (
            <div className="image-prompts-bar">
              <span className="bar-title">🎨 발견된 시각 자료 생성 프롬프트:</span>
              <div className="image-chips">
                {result.imagePrompts.map((img) => (
                  <button
                    key={img.n}
                    type="button"
                    className="image-chip-btn"
                    onClick={() => handleCopyImagePrompt(img)}
                    title={img.desc}
                  >
                    <span>
                      그림 {img.n} ({img.name})
                    </span>
                    <Sparkles size={13} />
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="docs-grid-split">
            <div className="docs-editor-col">
              <div className="col-header">
                <span className="col-title">📥 AI 결과 붙여넣기 (마크다운)</span>
                <small>Ctrl+V 로 붙여넣으면 여러 번이라도 자동 연결</small>
              </div>
              <textarea
                className="docs-textarea"
                placeholder="여기에는 프롬프트가 아니라, 전북 AI·제미나이·ChatGPT가 만들어 준 단원 설계안·지도안 결과를 붙여 넣으세요. (# 제목, | 표 | 기호가 보여도 서식으로 자동 변환됩니다)"
                value={markdown}
                onChange={(e) => setMarkdown(e.target.value)}
                onPaste={handlePaste}
              />
            </div>

            <div className="docs-preview-col">
              <div className="col-header">
                <span className="col-title">📄 문서 모양 실시간 미리보기</span>
                <small>다운로드 및 구글 문서에 들어갈 실제 모양입니다</small>
              </div>
              <div
                ref={previewRef}
                className="docs-html-preview"
                dangerouslySetInnerHTML={{
                  __html:
                    result.html ||
                    `<div class="empty-preview-prompt">
                      <span>📑</span>
                      <p>${
                        result.isPrompt
                          ? '프롬프트는 문서로 만들 수 없습니다. AI가 생성한 지도안 결과를 넣어 주세요.'
                          : '왼쪽 칸에 AI 결과를 붙여 넣으면 여기에 문서 양식으로 즉시 미리보기가 표시됩니다.'
                      }</p>
                    </div>`
                }}
              />
            </div>
          </div>
        </div>

        <div className="modal-footer">
          <span className="footer-hint">
            💡 <strong>[문서(.doc) 다운로드]</strong>로 받은 파일은 MS Word, 한컴오피스 한글, 구글 문서에서 표 서식이 그대로 열립니다.
          </span>
          <button className="secondary-action-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
