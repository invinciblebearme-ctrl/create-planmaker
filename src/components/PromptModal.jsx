import React, { useState } from 'react';
import { X, Copy, ExternalLink, Sparkles, Check, FileText, ArrowRight } from 'lucide-react';

export function PromptModal({ isOpen, promptText, onClose, onOpenDocs, onToast }) {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

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
        try { win.opener = null; } catch (e) {}
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
        try { win.opener = null; } catch (e) {}
        onToast('프롬프트 복사 완료! ChatGPT 대화창에 Ctrl+V로 붙여넣으세요 🤖');
      } else {
        onToast('프롬프트가 복사되었습니다. ChatGPT를 열어 붙여넣으세요.');
      }
    } catch (e) {
      onToast('프롬프트 복사 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">✨</span>
            <div>
              <h2>생성된 CREATE 수업 설계 프롬프트</h2>
              <p>선택하신 성취기준과 수업 조건을 바탕으로 최적화된 AI 프롬프트가 완성되었습니다</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="prompt-action-strip">
            <button type="button" className="gemini-primary-btn" onClick={handleOpenGemini}>
              <Sparkles size={18} /> 프롬프트 복사하고 제미나이(Gemini) 열기
            </button>
            <button type="button" className="chatgpt-secondary-btn" onClick={handleOpenChatGPT}>
              🤖 ChatGPT 열기
            </button>
            <button type="button" className="secondary-action-btn" onClick={handleCopyOnly}>
              {copied ? <Check size={16} /> : <Copy size={16} />} 클립보드 복사
            </button>
          </div>

          <div className="prompt-tips-row">
            <div className="tip-bubble">
              💡 <strong>작성 꿀팁:</strong> 제미나이에서 생성이 중간에 멈추면 <strong>"계속"</strong> 또는 <strong>"이어서 작성해 줘"</strong>라고 입력하세요.
            </div>
            <button
              type="button"
              className="next-step-btn"
              onClick={() => {
                onClose();
                onOpenDocs();
              }}
            >
              <FileText size={15} /> AI 답변 복사 후 구글 문서로 변환하기 <ArrowRight size={14} />
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
        </div>

        <div className="modal-footer">
          <span className="footer-hint">
            텍스트 영역을 클릭하면 전체 선택됩니다.
          </span>
          <button className="secondary-action-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
