import React, { useState, useMemo } from 'react';
import { Search, X, Check, ChevronDown, ChevronUp, BookOpen, Layers, CheckCircle2 } from 'lucide-react';
import { GRADE_BANDS, SUBJECT_ICONS } from '../constants/createConfig';

export function StandardBrowser({
  allStandards = [],
  pickedCodes = [],
  onToggleCode,
  onClearPicked,
  targetGrade = 4
}) {
  const [selectedBand, setSelectedBand] = useState('auto'); // 'auto', 2, 4, 6, 'all'
  const [selectedSubject, setSelectedSubject] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCodes, setExpandedCodes] = useState({});

  // targetGrade가 바뀌면 band 자동 계산
  const effectiveBand = useMemo(() => {
    if (selectedBand !== 'auto') return selectedBand;
    if (targetGrade <= 2) return 2;
    if (targetGrade <= 4) return 4;
    return 6;
  }, [selectedBand, targetGrade]);

  // 성취기준 필터링
  const filteredStandards = useMemo(() => {
    return allStandards.filter((item) => {
      // 학년군 필터
      if (effectiveBand !== 'all' && item.b !== effectiveBand) {
        return false;
      }
      // 교과 필터
      if (selectedSubject !== 'all' && item.s !== selectedSubject) {
        return false;
      }
      // 검색어 필터
      if (searchQuery.trim()) {
        const q = searchQuery.trim().toLowerCase();
        const fullText = `${item.c} ${item.s} ${item.t} ${item.a || ''} ${item.act || ''}`.toLowerCase();
        if (!fullText.includes(q)) return false;
      }
      return true;
    });
  }, [allStandards, effectiveBand, selectedSubject, searchQuery]);

  // 현재 필터된 과목별 개수 집계
  const subjectCounts = useMemo(() => {
    const counts = {};
    allStandards.forEach((item) => {
      if (effectiveBand === 'all' || item.b === effectiveBand) {
        counts[item.s] = (counts[item.s] || 0) + 1;
      }
    });
    return counts;
  }, [allStandards, effectiveBand]);

  const uniqueSubjects = useMemo(() => {
    const list = Object.keys(subjectCounts);
    return list.sort();
  }, [subjectCounts]);

  // 선택된 성취기준 객체 목록
  const pickedList = useMemo(() => {
    const set = new Set(pickedCodes);
    return allStandards.filter((item) => set.has(item.c));
  }, [allStandards, pickedCodes]);

  const toggleExpand = (code) => {
    setExpandedCodes((prev) => ({
      ...prev,
      [code]: !prev[code]
    }));
  };

  return (
    <div className="standard-browser-card">
      <div className="browser-header">
        <div className="header-title-row">
          <div className="browser-step-badge">
            <span className="step-num">STEP 1</span>
            <h3>2022 개정 성취기준 선택</h3>
          </div>
          <span className="count-pill">
            {pickedCodes.length}개 선택됨
          </span>
        </div>
        <p className="browser-subtitle">
          단원에 적용할 성취기준을 검색하고 선택하세요. 다른 교과의 기준을 함께 골라 융합 단원을 구성할 수 있습니다.
        </p>
      </div>

      {/* 선택된 성취기준 바구니 */}
      <div className="picked-tray">
        <div className="tray-header">
          <span className="tray-title">
            <CheckCircle2 size={16} className="text-primary" />
            선택한 성취기준 ({pickedList.length})
          </span>
          {pickedList.length > 0 && (
            <button type="button" className="clear-tray-btn" onClick={onClearPicked}>
              전체 비우기
            </button>
          )}
        </div>
        {pickedList.length === 0 ? (
          <div className="empty-tray-notice">
            아래 목록이나 검색창에서 수업에 반영할 성취기준을 클릭하여 추가해 주세요.
          </div>
        ) : (
          <div className="picked-chips-grid">
            {pickedList.map((item) => (
              <div key={item.c} className="picked-chip">
                <span className="chip-subject">{item.s}</span>
                <strong className="chip-code">{item.c}</strong>
                <span className="chip-text" title={item.t}>{item.t}</span>
                <button
                  type="button"
                  className="chip-remove-btn"
                  onClick={() => onToggleCode(item.c)}
                  aria-label={`${item.c} 선택 해제`}
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 필터 컨트롤: 학년군 탭 */}
      <div className="browser-filter-controls">
        <div className="grade-band-tabs">
          <button
            type="button"
            className={`band-tab-btn ${effectiveBand === 2 ? 'active' : ''}`}
            onClick={() => setSelectedBand(2)}
          >
            1~2학년군
          </button>
          <button
            type="button"
            className={`band-tab-btn ${effectiveBand === 4 ? 'active' : ''}`}
            onClick={() => setSelectedBand(4)}
          >
            3~4학년군
          </button>
          <button
            type="button"
            className={`band-tab-btn ${effectiveBand === 6 ? 'active' : ''}`}
            onClick={() => setSelectedBand(6)}
          >
            5~6학년군
          </button>
          <button
            type="button"
            className={`band-tab-btn ${effectiveBand === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedBand('all')}
          >
            전체 학년군
          </button>
        </div>

        {/* 검색창 */}
        <div className="search-bar-wrap">
          <Search size={17} className="search-icon" />
          <input
            type="text"
            className="search-input"
            placeholder="성취기준 코드([4과02-01]), 교과, 영역, 핵심 키워드로 검색..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              type="button"
              className="search-clear-btn"
              onClick={() => setSearchQuery('')}
              aria-label="검색어 지우기"
            >
              <X size={15} />
            </button>
          )}
        </div>

        {/* 과목 필터 칩 */}
        <div className="subject-filter-chips">
          <button
            type="button"
            className={`subj-chip-btn ${selectedSubject === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedSubject('all')}
          >
            전체 교과 <small>({filteredStandards.length})</small>
          </button>
          {uniqueSubjects.map((sub) => (
            <button
              key={sub}
              type="button"
              className={`subj-chip-btn ${selectedSubject === sub ? 'active' : ''}`}
              onClick={() => setSelectedSubject(sub)}
            >
              <span>{SUBJECT_ICONS[sub] || '📚'} {sub}</span>
              <small>({subjectCounts[sub] || 0})</small>
            </button>
          ))}
        </div>
      </div>

      {/* 성취기준 결과 리스트 */}
      <div className="standards-list-container">
        {filteredStandards.length === 0 ? (
          <div className="empty-results">
            <span>🔎</span>
            <h4>검색된 성취기준이 없습니다</h4>
            <p>검색어를 변경하거나 교과·학년군 필터를 확인해 주세요.</p>
            <button
              type="button"
              className="secondary-action-btn"
              onClick={() => {
                setSearchQuery('');
                setSelectedSubject('all');
                setSelectedBand('all');
              }}
            >
              필터 초기화
            </button>
          </div>
        ) : (
          filteredStandards.map((item) => {
            const isPicked = pickedCodes.includes(item.c);
            const isExpanded = !!expandedCodes[item.c];

            return (
              <div
                key={item.c}
                className={`standard-item-card ${isPicked ? 'picked' : ''}`}
              >
                <div
                  className="item-main-row"
                  onClick={() => onToggleCode(item.c)}
                >
                  <label className="checkbox-wrap" onClick={(e) => e.stopPropagation()}>
                    <input
                      type="checkbox"
                      checked={isPicked}
                      onChange={() => onToggleCode(item.c)}
                    />
                    <span className="custom-check" />
                  </label>

                  <div className="item-meta-badges">
                    <span className="code-badge">{item.c}</span>
                    <span className="subject-badge">{item.s}</span>
                    {item.a && <span className="area-badge">{item.a}</span>}
                  </div>

                  <p className="item-standard-text">{item.t}</p>

                  <button
                    type="button"
                    className="expand-toggle-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleExpand(item.c);
                    }}
                    title="성취수준 A·B·C 및 탐구활동 보기"
                  >
                    {isExpanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                </div>

                {isExpanded && (
                  <div className="item-detail-drawer">
                    {item.act && (
                      <div className="drawer-section">
                        <strong>🌱 교육과정 탐구 활동 예시:</strong>
                        <p>{item.act}</p>
                      </div>
                    )}
                    <div className="drawer-levels-grid">
                      <div className="level-box level-a">
                        <span className="level-badge">수준 A</span>
                        <p>{item.A || '해당 없음'}</p>
                      </div>
                      <div className="level-box level-b">
                        <span className="level-badge">수준 B</span>
                        <p>{item.B || '해당 없음'}</p>
                      </div>
                      <div className="level-box level-c">
                        <span className="level-badge">수준 C</span>
                        <p>{item.C || '해당 없음'}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
