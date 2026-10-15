import React from 'react';

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <div className="footer-brand">
            <strong>✳ CREATE 모형 연구학교</strong>
            <span className="footer-tag">수업 설계 도우미</span>
          </div>
          <p>
            수업의 성장과 배움의 나눔을 위한 성과 공유 공간 · 2022 개정 교육과정 기반 AI 맞춤형 수업 설계
          </p>
        </div>
        <div className="footer-right">
          <div className="footer-links">
            <a href="https://create.allforedu.kr/">메인 홈</a>
            <span>·</span>
            <a href="https://create.allforedu.kr/curriculum/#/read/create-doc-1">단원설계 길잡이</a>
            <span>·</span>
            <a href="https://create.allforedu.kr/curriculum/">학년별 단원설계안</a>
            <span>·</span>
            <a href="https://create.allforedu.kr/resources">연구학교 자료실</a>
          </div>
          <span className="copyright">© CREATE Research School. All rights reserved.</span>
        </div>
      </div>
    </footer>
  );
}
