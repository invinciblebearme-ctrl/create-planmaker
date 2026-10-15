import React, { useState } from 'react';
import { BookOpen, FileText, HelpCircle, Sparkles, ExternalLink, Menu, X, ArrowUpRight } from 'lucide-react';

export function Header({ onOpenGuide, onOpenHelp, onOpenDocs }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <>
      <div className="top-line" aria-hidden="true">✦　✧　✦　✧　✦</div>
      <header className="site-header shell">
        <a href="https://create.allforedu.kr/" className="brand" title="CREATE 모형 연구학교 홈으로">
          <span className="brand-icon">✳</span>
          <div className="brand-text">
            <strong>CREATE</strong>
            <small>수업 설계 도우미</small>
          </div>
        </a>

        <nav className={`nav ${mobileMenuOpen ? 'open' : ''}`} aria-label="주 메뉴">
          <a href="https://create.allforedu.kr/" className="nav-link">
            홈
          </a>
          <a
            href="https://create.allforedu.kr/curriculum/#/read/create-doc-1"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            단원설계 길잡이 <ArrowUpRight size={13} className="inline-icon" />
          </a>
          <a
            href="https://create.allforedu.kr/curriculum/"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            학년별 단원설계안 <ArrowUpRight size={13} className="inline-icon" />
          </a>
          <span className="nav-link active">
            수업 설계 도우미
          </span>
          <a
            href="https://create.allforedu.kr/resources"
            target="_blank"
            rel="noopener noreferrer"
            className="nav-link"
          >
            연구학교 자료실 <ArrowUpRight size={13} className="inline-icon" />
          </a>
          <button
            type="button"
            className="nav-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenGuide();
            }}
          >
            <BookOpen size={15} /> 가이드북
          </button>
          <button
            type="button"
            className="nav-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenHelp();
            }}
          >
            <HelpCircle size={15} /> 사용법
          </button>
          <button
            type="button"
            className="nav-btn docs-btn"
            onClick={() => {
              setMobileMenuOpen(false);
              onOpenDocs();
            }}
          >
            <FileText size={15} /> 구글 문서 변환기
          </button>
        </nav>

        <button
          className="mobile-menu-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label={mobileMenuOpen ? '메뉴 닫기' : '메뉴 열기'}
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </header>
    </>
  );
}
