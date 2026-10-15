import React, { useState } from 'react';
import { X, CheckCircle, ChevronDown, ChevronUp, Sparkles, FileText, Bot } from 'lucide-react';

const FAQS = [
  {
    q: '제미나이(Gemini) 외에 ChatGPT 등 다른 생성형 AI도 사용할 수 있나요?',
    a: '네, 물론입니다! 생성된 프롬프트를 복사하여 ChatGPT, Claude 등 원하시는 모든 AI 모델에 붙여넣어 수업 설계안을 생성하실 수 있습니다. 생성된 결과를 본 사이트의 [구글 문서 변환기]에 붙여넣으시면 표와 서식이 유지된 채 구글 문서로 깔끔하게 변환됩니다.'
  },
  {
    q: 'AI가 작성하다가 내용이 중간에 끊겼어요.',
    a: '지도안 분량이 많아 AI 응답 길이 제한에 도달했을 때 발생합니다. 대화창에 "계속" 또는 "이어서 작성해 줘"라고 입력하시면 됩니다. 끊어진 응답들을 차례대로 복사해 [구글 문서 변환기]에 붙여넣으시면 자동으로 하나의 완성된 문서로 이어집니다.'
  },
  {
    q: '구글 문서에 바로 붙여넣으면 표가 깨지거나 마크다운 기호(#, |)가 보여요.',
    a: 'AI가 출력하는 결과는 텍스트 마크다운 형식이기 때문입니다. 바로 구글 문서에 붙이지 마시고, 상단의 [AI 결과 → 구글 문서 변환기]를 통해 변환 후 [서식 복사하고 새 구글 문서 열기] 버튼을 누르시면 예쁜 제목 배너와 격자 표, 이미지 상자가 적용된 완벽한 문서로 들어갑니다.'
  },
  {
    q: '지도안의 시각 자료(그림 1, 그림 2)는 어떻게 만드나요?',
    a: '지도안 본문에 「그림 1 자리」, 「그림 2 자리」 점선 상자가 표시됩니다. 변환기에서 [🎨 그림 N 설명 복사 + 제미나이 열기]를 클릭하거나, 제미나이 대화창에 "그림 1 그려 줘"라고 말하면 AI가 무료로 가로 16:9 비율의 수업용 이미지를 생성해 줍니다.'
  },
  {
    q: 'AI가 만든 지도안을 그대로 사용해도 되나요?',
    a: '본 도우미가 생성하는 지도안은 2022 개정 성취기준과 CREATE 모형 규칙을 철저히 준수한 "전문 초안"입니다. 교과서의 세부 쪽수, 학교 및 학급 학생들의 실제 배움 속도에 맞추어 선생님께서 검토 및 수정하시어 활용해 주세요.'
  },
  {
    q: '입력한 교육과정 내용과 개인정보는 안전한가요?',
    a: '본 사이트는 입력하신 모든 데이터를 외부 서버로 전송하지 않으며, 선생님의 컴퓨터 브라우저 로컬 저장소(LocalStorage)에만 안전하게 보관합니다. 안심하고 편리하게 사용하실 수 있습니다.'
  }
];

export function HelpModal({ isOpen, onClose }) {
  const [openFaq, setOpenFaq] = useState(null);

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container medium" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">💡</span>
            <div>
              <h2>도움말 & 사용 안내</h2>
              <p>CREATE 모형 수업 설계 도우미 100% 활용 가이드</p>
            </div>
          </div>
          <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <section className="help-steps-section">
            <h3 className="help-section-title">✨ 4단계로 끝내는 수업 설계 워크플로우</h3>
            <div className="help-flow-cards">
              <div className="help-flow-card">
                <span className="help-step-num">1</span>
                <strong>성취기준 선택</strong>
                <p>2022 개정 초등 전 교과(611개) 중 단원에 포함할 성취기준을 검색하고 선택합니다. (융합 단원 지원)</p>
              </div>
              <div className="help-flow-card">
                <span className="help-step-num">2</span>
                <strong>수업 조건 설정</strong>
                <p>단원명, 학년·학기, 차시, 학급 실태 진단 및 활용할 AI·디지털 도구를 가볍게 체크합니다.</p>
              </div>
              <div className="help-flow-card">
                <span className="help-step-num">3</span>
                <strong>프롬프트 생성 & AI 실행</strong>
                <p>[프롬프트 복사 & 제미나이 열기] 버튼을 누르면 클립보드에 복사되고 AI 대화창이 바로 열립니다.</p>
              </div>
              <div className="help-flow-card">
                <span className="help-step-num">4</span>
                <strong>구글 문서로 원클릭 변환</strong>
                <p>AI 답변을 [구글 문서 변환기]에 넣고 [서식 복사]를 누르면 표와 서식이 살아있는 문서로 완성됩니다.</p>
              </div>
            </div>
          </section>

          <section className="help-faq-section">
            <h3 className="help-section-title">❓ 자주 묻는 질문 (FAQ)</h3>
            <div className="faq-accordion-list">
              {FAQS.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div key={i} className={`faq-accordion-item ${isOpen ? 'open' : ''}`}>
                    <button
                      className="faq-question-btn"
                      onClick={() => setOpenFaq(isOpen ? null : i)}
                    >
                      <span>Q. {faq.q}</span>
                      {isOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                    </button>
                    {isOpen && (
                      <div className="faq-answer-box">
                        <p>{faq.a}</p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        </div>

        <div className="modal-footer">
          <span className="footer-hint">언제든 궁금한 사항은 FAQ를 확인하세요.</span>
          <button className="primary-action-btn" onClick={onClose}>
            확인했습니다
          </button>
        </div>
      </div>
    </div>
  );
}
