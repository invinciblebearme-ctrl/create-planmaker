import React, { useState } from 'react';
import { X, BookOpen, ExternalLink, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CREATE_STAGES } from '../constants/createConfig';

export function GuidebookModal({ isOpen, onClose }) {
  const [activeTab, setActiveTab] = useState('overview');

  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose} role="dialog" aria-modal="true">
      <div className="modal-container large" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <div className="modal-title-group">
            <span className="modal-badge-icon">📘</span>
            <div>
              <h2>CREATE 모형 가이드북</h2>
              <p>2022 개정 교육과정 기반 6단계 교수·학습 개발모형</p>
            </div>
          </div>
          <div className="modal-header-actions">
            <div className="tabs-pill">
              <button
                className={`tab-pill-btn ${activeTab === 'overview' ? 'active' : ''}`}
                onClick={() => setActiveTab('overview')}
              >
                한눈에 보기
              </button>
              <button
                className={`tab-pill-btn ${activeTab === 'stages' ? 'active' : ''}`}
                onClick={() => setActiveTab('stages')}
              >
                6단계 상세
              </button>
              <button
                className={`tab-pill-btn ${activeTab === 'pdf' ? 'active' : ''}`}
                onClick={() => setActiveTab('pdf')}
              >
                전자책 열람
              </button>
            </div>
            <button className="modal-close-btn" onClick={onClose} aria-label="닫기">
              <X size={20} />
            </button>
          </div>
        </div>

        <div className="modal-body">
          {activeTab === 'overview' && (
            <div className="guidebook-content">
              <div className="guide-hero-banner">
                <span className="sparkle-tag">✨ 연구학교 핵심 모형</span>
                <h3>CREATE는 단원 전체를 설계하는 6단계 교수·학습 모형입니다</h3>
                <p>
                  한 차시의 짧은 수업이 아니라, 단원(주제) 전체를 <strong>진단(C)</strong>에서 시작해
                  평가 결과에 따라 <strong>되돌아가며(Adjust)</strong>, 배운 것을 <strong>삶으로 전이(T)</strong>하고
                  <strong>성장(E)</strong>하는 유기적인 배움의 여정입니다.
                </p>
              </div>

              <div className="create-flow-diagram">
                {CREATE_STAGES.map((s, idx) => (
                  <React.Fragment key={s.k}>
                    <div className="flow-step" style={{ borderColor: s.color }}>
                      <span className="flow-step-icon" style={{ background: s.bg, color: s.color }}>
                        {s.icon}
                      </span>
                      <strong style={{ color: s.color }}>{s.label || s.k} {s.name}</strong>
                      <small>{s.eng}</small>
                    </div>
                    {idx < CREATE_STAGES.length - 1 && (
                      <span className="flow-arrow">
                        <ArrowRight size={16} />
                      </span>
                    )}
                  </React.Fragment>
                ))}
              </div>

              <div className="guide-grid-cards">
                {CREATE_STAGES.map((s) => (
                  <div key={s.k} className="guide-stage-card" style={{ borderTopColor: s.color }}>
                    <div className="card-stage-top">
                      <span className="stage-symbol" style={{ background: s.bg, color: s.color }}>
                        {s.label || s.k}
                      </span>
                      <div>
                        <h4 style={{ color: s.color }}>{s.name} <small>({s.eng})</small></h4>
                      </div>
                    </div>
                    <p className="stage-desc">{s.desc}</p>
                    <div className="stage-example">
                      <strong>💡 수업 실천 예시:</strong>
                      <span>{s.example}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'stages' && (
            <div className="guidebook-stages-detail">
              <p className="section-subtext">
                각 단계별 핵심 목표, 교사의 역할 및 지도안 작성 시 포함되어야 할 소제목 안내입니다.
              </p>
              <div className="stages-detail-list">
                {CREATE_STAGES.map((s) => (
                  <div key={s.k} className="stage-detail-item" style={{ borderLeftColor: s.color }}>
                    <div className="stage-detail-header">
                      <span className="stage-pill-badge" style={{ background: s.bg, color: s.color, borderColor: s.border }}>
                        {s.label || s.k}단계: {s.name} ({s.eng})
                      </span>
                      <span className="stage-doc-title">필수 소제목: {s.titleInDoc}</span>
                    </div>
                    <p className="stage-detail-desc">{s.desc}</p>
                    <div className="stage-detail-box">
                      <div className="box-col">
                        <strong>📌 주요 수업 활동 & 도구</strong>
                        <p>{s.example}</p>
                      </div>
                      <div className="box-col">
                        <strong>🎯 교사 자체 점검 질문</strong>
                        <p>{s.checkQ}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'pdf' && (
            <div className="guidebook-pdf-view">
              <div className="pdf-info-card">
                <BookOpen size={48} className="pdf-icon" />
                <h3>CREATE 모형 단원설계 길잡이 전자책</h3>
                <p>
                  연구학교에서 제작한 공식 가이드북 전문을 전자책 뷰어로 열람하실 수 있습니다.
                  모형의 이론적 배경부터 실증 수업 사례까지 자세한 내용이 수록되어 있습니다.
                </p>
                <div className="pdf-btn-row">
                  <a
                    href="https://create.allforedu.kr/curriculum/#/read/create-doc-1"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="primary-action-btn"
                  >
                    길잡이 전자책 바로 열기 <ExternalLink size={16} />
                  </a>
                  <a
                    href="https://create.allforedu.kr/curriculum/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="secondary-action-btn"
                  >
                    학년별 단원설계안 서재 가기 <ExternalLink size={16} />
                  </a>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="modal-footer">
          <span className="footer-hint">✳ CREATE 모형 연구학교 교육과정 혁신 자료</span>
          <button className="secondary-action-btn" onClick={onClose}>
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
