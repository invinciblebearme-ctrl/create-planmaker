import React, { useState } from 'react';
import {
  Sparkles,
  Layers,
  Wrench,
  Settings,
  HelpCircle,
  Plus,
  X,
  RotateCcw,
  BookOpen,
  Calendar,
  Clock,
  Compass,
  Check
} from 'lucide-react';
import { CREATE_STAGES, TOOL_CATEGORIES, SAMPLE_PRESETS } from '../constants/createConfig';

export function LessonConfigForm({
  config,
  onChangeConfig,
  onGeneratePrompt,
  onLoadPreset,
  onReset
}) {
  const [customToolInput, setCustomToolInput] = useState('');

  const handleGradeChange = (g) => {
    onChangeConfig({ grade: g });
  };

  const handleStageToggle = (stageKey) => {
    const updated = {
      ...config.stages,
      [stageKey]: !config.stages[stageKey]
    };
    onChangeConfig({ stages: updated });
  };

  const handleToolToggle = (toolName) => {
    const exists = config.tools.includes(toolName);
    const updated = exists
      ? config.tools.filter((t) => t !== toolName)
      : [...config.tools, toolName];
    onChangeConfig({ tools: updated });
  };

  const handleAddCustomTool = (e) => {
    e.preventDefault();
    if (!customToolInput.trim()) return;
    const trimmed = customToolInput.trim();
    if (!config.tools.includes(trimmed)) {
      onChangeConfig({ tools: [...config.tools, trimmed] });
    }
    setCustomToolInput('');
  };

  const handleAddContextChip = (text) => {
    const current = config.ctx.trim();
    const updated = current ? `${current}\n∙ ${text}` : `∙ ${text}`;
    onChangeConfig({ ctx: updated });
  };

  return (
    <div className="lesson-config-card">
      <div className="config-header">
        <div className="header-title-row">
          <div className="browser-step-badge">
            <span className="step-num">STEP 2 & 3</span>
            <h3>단원 조건 및 CREATE 모형 설정</h3>
          </div>
          <button type="button" className="reset-btn" onClick={onReset} title="초기값으로 리셋">
            <RotateCcw size={14} /> 초기화
          </button>
        </div>
        <p className="browser-subtitle">
          단원명, 학급 실태, 적용할 CREATE 단계와 디지털 도구를 지정하면 맞춤형 지도안 프롬프트가 완성됩니다.
        </p>
      </div>

      {/* 실증 예시 단원 불러오기 프리셋 */}
      <div className="presets-bar">
        <span className="presets-label">💡 추천 단원 예시:</span>
        <div className="presets-chips">
          {SAMPLE_PRESETS.map((preset, i) => (
            <button
              key={i}
              type="button"
              className="preset-chip-btn"
              onClick={() => onLoadPreset(preset)}
              title={preset.description}
            >
              <span>{preset.title}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="form-sections">
        {/* 기본 학년 및 학기 */}
        <div className="form-group-row">
          <div className="form-field flex-1">
            <label className="field-label">
              <Calendar size={15} /> 대상 학년
            </label>
            <div className="radio-pills-row">
              {[1, 2, 3, 4, 5, 6].map((g) => (
                <button
                  key={g}
                  type="button"
                  className={`pill-choice-btn ${config.grade === g ? 'active' : ''}`}
                  onClick={() => handleGradeChange(g)}
                >
                  {g}학년
                </button>
              ))}
            </div>
          </div>

          <div className="form-field flex-auto">
            <label className="field-label">
              <Clock size={15} /> 학기
            </label>
            <div className="radio-pills-row">
              {['1학기', '2학기'].map((s) => (
                <button
                  key={s}
                  type="button"
                  className={`pill-choice-btn ${config.sem === s ? 'active' : ''}`}
                  onClick={() => onChangeConfig({ sem: s })}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 단원명 및 교과서 단원, 총 차시 */}
        <div className="form-group-row">
          <div className="form-field flex-2">
            <label className="field-label" htmlFor="unit-input">
              단원명 (주제명)
            </label>
            <input
              id="unit-input"
              type="text"
              className="text-input"
              placeholder="예: 모두가 연결된 생태계, 그 속의 우리들 (미입력 시 AI가 매력적인 주제 자동 생성)"
              value={config.unit}
              onChange={(e) => onChangeConfig({ unit: e.target.value })}
            />
          </div>

          <div className="form-field flex-1">
            <label className="field-label" htmlFor="tb-input">
              교과서 단원 (선택)
            </label>
            <input
              id="tb-input"
              type="text"
              className="text-input"
              placeholder="예: 2. 생물과 환경"
              value={config.tb}
              onChange={(e) => onChangeConfig({ tb: e.target.value })}
            />
          </div>

          <div className="form-field flex-small">
            <label className="field-label" htmlFor="cha-input">
              총 차시
            </label>
            <input
              id="cha-input"
              type="text"
              className="text-input text-center"
              placeholder="예: 12"
              value={config.cha}
              onChange={(e) => onChangeConfig({ cha: e.target.value })}
            />
          </div>
        </div>

        {/* 학급 실태 및 사전 진단 */}
        <div className="form-field">
          <div className="field-label-between">
            <label className="field-label" htmlFor="ctx-input">
              학급 실태 및 사전 진단 결과 (C 진단 단계 연계)
            </label>
            <span className="field-hint">선택 사항</span>
          </div>
          <textarea
            id="ctx-input"
            className="textarea-input"
            rows={3}
            placeholder="예: 다수의 학생이 인간을 환경을 파괴하는 존재로만 단편적으로 인식함. 지식 습득뿐 아니라 샌드박스 등 디지털 도구를 활용한 모둠별 협력 분류 활동에 대한 개별 지도가 필요함."
            value={config.ctx}
            onChange={(e) => onChangeConfig({ ctx: e.target.value })}
          />
          <div className="quick-chip-suggestions">
            <span className="suggestions-label">추천 문구 추가:</span>
            <button
              type="button"
              className="text-suggestion-chip"
              onClick={() => handleAddContextChip('선수 개념은 이해하고 있으나 실생활 문제 해결 적용에 개인차가 큼')}
            >
              + 선수 개념 개인차
            </button>
            <button
              type="button"
              className="text-suggestion-chip"
              onClick={() => handleAddContextChip('디지털 기기 조작 능력에 편차가 있어 협력 학습 및 또래 튜터링 필요')}
            >
              + 디지털 조작 편차
            </button>
            <button
              type="button"
              className="text-suggestion-chip"
              onClick={() => handleAddContextChip('사전 인식을 패들렛 가치수직선으로 진단하여 맞춤형 출발점 설정 필요')}
            >
              + 패들렛 사전 진단
            </button>
          </div>
        </div>

        {/* 지역 및 학교 맥락 */}
        <div className="form-field">
          <label className="field-label" htmlFor="local-input">
            지역 및 학교 맥락화 (T 전이 단계 연계)
          </label>
          <input
            id="local-input"
            type="text"
            className="text-input"
            placeholder="예: 군산 금강하구 철새도래지 및 연안 생태계 연계, 학교 텃밭 생태 관찰장 활용"
            value={config.local}
            onChange={(e) => onChangeConfig({ local: e.target.value })}
          />
        </div>

        {/* CREATE 모형 단계 선택 토글 */}
        <div className="form-field">
          <div className="field-label-between">
            <label className="field-label">
              <Compass size={15} /> 적용할 CREATE 단계 (클릭하여 생략/적용 토글)
            </label>
            <span className="field-hint">단원 특성에 맞게 조정 가능</span>
          </div>
          <div className="create-stages-toggle-grid">
            {CREATE_STAGES.map((s) => {
              const isOn = !!config.stages[s.k];
              return (
                <button
                  key={s.k}
                  type="button"
                  className={`stage-toggle-card ${isOn ? 'on' : 'off'}`}
                  style={{
                    '--stage-color': s.color,
                    '--stage-bg': s.bg,
                    '--stage-border': s.border
                  }}
                  onClick={() => handleStageToggle(s.k)}
                >
                  <div className="toggle-top">
                    <span className="stage-symbol-pill">{s.label || s.k}</span>
                    <strong>{s.name}</strong>
                    <span className="toggle-state-badge">{isOn ? '적용' : '생략'}</span>
                  </div>
                  <small className="stage-subname">{s.eng}</small>
                </button>
              );
            })}
          </div>
        </div>

        {/* 활용 가능한 AI 및 디지털 도구 */}
        <div className="form-field">
          <div className="field-label-between">
            <label className="field-label">
              <Wrench size={15} /> 활용할 AI·디지털 도구 선택 ({config.tools.length}개 선택됨)
            </label>
            <span className="field-hint">목록 외 도구도 직접 추가 가능</span>
          </div>

          <div className="tools-palette-accordion">
            {TOOL_CATEGORIES.map((cat, idx) => (
              <div key={idx} className="tools-category-group">
                <span className="tools-group-title">
                  {cat.icon} {cat.category}
                </span>
                <div className="tools-chip-wrap">
                  {cat.tools.map((tool) => {
                    const isSelected = config.tools.includes(tool.name);
                    return (
                      <button
                        key={tool.name}
                        type="button"
                        className={`tool-pill-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => handleToolToggle(tool.name)}
                      >
                        {isSelected && <Check size={13} className="check-icon" />}
                        <span>{tool.name}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* 사용자 직접 도구 추가 */}
          <form className="add-tool-form" onSubmit={handleAddCustomTool}>
            <input
              type="text"
              className="text-input tool-add-input"
              placeholder="목록에 없는 에듀테크나 앱 이름을 직접 입력해 추가..."
              value={customToolInput}
              onChange={(e) => setCustomToolInput(e.target.value)}
            />
            <button type="submit" className="secondary-action-btn add-tool-submit-btn">
              <Plus size={15} />
              <span>도구 추가</span>
            </button>
          </form>
        </div>

        {/* 추가 옵션 체크박스 */}
        <div className="options-checkbox-row">
          <label className="option-check-wrap">
            <input
              type="checkbox"
              checked={config.options.includeImg}
              onChange={(e) =>
                onChangeConfig({
                  options: { ...config.options, includeImg: e.target.checked }
                })
              }
            />
            <span className="custom-check" />
            <span className="option-label-text">
              🎨 시각 자료 및 그림 생성 프롬프트(제미나이 16:9 생성용) 포함
            </span>
          </label>

          <label className="option-check-wrap">
            <input
              type="checkbox"
              checked={config.options.includeCheck}
              onChange={(e) =>
                onChangeConfig({
                  options: { ...config.options, includeCheck: e.target.checked }
                })
              }
            />
            <span className="custom-check" />
            <span className="option-label-text">
              💡 CREATE 6단계 교사 자체 점검 질문 포함
            </span>
          </label>
        </div>

        {/* 메인 생성 버튼 */}
        <div className="generate-action-box">
          <button
            type="button"
            className="main-generate-btn"
            onClick={onGeneratePrompt}
          >
            <Sparkles size={20} className="sparkle-anim" />
            <span>CREATE 모형 맞춤형 수업 설계 프롬프트 생성하기</span>
          </button>
          <small className="generate-subtext">
            성취기준과 수업 조건을 분석하여 완성도 높은 2022 개정 맞춤 프롬프트를 즉시 생성합니다.
          </small>
        </div>
      </div>
    </div>
  );
}
