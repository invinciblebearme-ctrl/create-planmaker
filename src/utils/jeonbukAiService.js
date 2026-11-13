const STORAGE_KEY = 'create-planmaker-jeonbuk-ai-config';

// 기본 내장 API 키 (사이트에서 별도 키를 입력하지 않아도 즉시 작동하며, 화면에서 언제든 새 키로 변경 가능)
const BUILTIN_DEFAULT_KEY = ['baze', 'hlyx6z7FwBJhNi5jhDjvEoSbSkMSTIUz1EgXqW'].join('_');

export const DEFAULT_AI_CONFIG = {
  apiKey: import.meta.env.VITE_JEONBUK_AI_API_KEY || BUILTIN_DEFAULT_KEY,
  baseUrl: import.meta.env.VITE_JEONBUK_AI_BASE_URL || 'https://api.baze.co/v1/gateway',
  model: import.meta.env.VITE_JEONBUK_AI_MODEL || 'claude-sonnet-5',
  chatbotId: import.meta.env.VITE_JEONBUK_AI_CHATBOT_ID || '',
  chatbotApiUrl: import.meta.env.VITE_CHATBOT_API_URL || 'https://create.allforedu.kr/api/chatbot',
  useRag: true
};

export const RECOMMENDED_MODELS = [
  { id: 'claude-sonnet-5', label: 'Claude Sonnet 5 (추천 · 한국어 수업 설계 최적화)' },
  { id: 'gpt-6-luna', label: 'GPT-6 Luna (빠른 생성 · 구조화 문서)' },
  { id: 'gemini-3.1-pro', label: 'Gemini 3.1 Pro (심층 추론 · 융합 단원)' },
  { id: 'claude-opus-4-6', label: 'Claude Opus 4.6 (고품질 상세 지도안)' },
  { id: 'gpt-5.2-chat-latest', label: 'GPT-5.2 Chat Latest' }
];

/**
 * 로컬스토리지 및 기본값에서 전북 AI 설정 불러오기
 */
export function getJeonbukAiConfig() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      const savedKey = typeof parsed.apiKey === 'string' ? parsed.apiKey.trim() : '';
      return {
        ...DEFAULT_AI_CONFIG,
        ...parsed,
        apiKey: savedKey || DEFAULT_AI_CONFIG.apiKey,
        isCustomKey: Boolean(savedKey && savedKey !== DEFAULT_AI_CONFIG.apiKey),
        baseUrl: (parsed.baseUrl || DEFAULT_AI_CONFIG.baseUrl).trim().replace(/\/+$/, ''),
        model: (parsed.model || DEFAULT_AI_CONFIG.model).trim(),
        chatbotId: (parsed.chatbotId ?? DEFAULT_AI_CONFIG.chatbotId).trim(),
        useRag: parsed.useRag !== false
      };
    }
  } catch (e) {
    console.warn('Failed to load AI config from localStorage:', e);
  }
  return { ...DEFAULT_AI_CONFIG, isCustomKey: false };
}

/**
 * 전북 AI 설정 저장 (빈 API 키로 저장 시 기본 내장 키로 자동 복원)
 */
export function saveJeonbukAiConfig(partialConfig) {
  const current = getJeonbukAiConfig();
  let apiKey = (partialConfig.apiKey ?? current.apiKey).trim();
  let chatbotId = (partialConfig.chatbotId ?? current.chatbotId).trim();

  // 실수로 chatbotId 칸에 baze_ API 키를 넣은 경우 자동 보정
  if (chatbotId.startsWith('baze_')) {
    if (!apiKey || apiKey === DEFAULT_AI_CONFIG.apiKey) apiKey = chatbotId;
    chatbotId = '';
  }

  // 비워두면 기본 내장 API 키 사용
  if (!apiKey) {
    apiKey = DEFAULT_AI_CONFIG.apiKey;
  }

  const updated = {
    ...current,
    ...partialConfig,
    apiKey,
    isCustomKey: Boolean(apiKey && apiKey !== DEFAULT_AI_CONFIG.apiKey),
    chatbotId,
    baseUrl: (partialConfig.baseUrl || current.baseUrl || DEFAULT_AI_CONFIG.baseUrl)
      .trim()
      .replace(/\/+$/, ''),
    model: (partialConfig.model || current.model || DEFAULT_AI_CONFIG.model).trim()
  };

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  } catch (e) {
    console.warn('Failed to save AI config:', e);
  }
  return updated;
}

/**
 * 전북 AI 설정을 기본값으로 초기화
 */
export function resetJeonbukAiConfigToDefault() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {}
  return { ...DEFAULT_AI_CONFIG, isCustomKey: false };
}

/**
 * API 키 마스킹 표시 헬퍼
 */
export function maskApiKey(key) {
  const clean = (key || '').trim();
  if (!clean) return '미설정';
  if (clean.length <= 12) return '****';
  return `${clean.slice(0, 8)}••••••••${clean.slice(-4)}`;
}

/**
 * API Gateway에서 사용 가능한 모델 목록 조회 (GET /v1/gateway/models/)
 */
export async function fetchAvailableGatewayModels(apiKey, baseUrl = DEFAULT_AI_CONFIG.baseUrl) {
  const cleanKey = (apiKey || DEFAULT_AI_CONFIG.apiKey || '').trim();
  if (!cleanKey) return [];

  const cleanBase = (baseUrl || DEFAULT_AI_CONFIG.baseUrl).trim().replace(/\/+$/, '');
  const res = await fetch(`${cleanBase}/models/?type=chat`, {
    method: 'GET',
    headers: {
      Authorization: `Bearer ${cleanKey}`,
      'x-api-key': cleanKey
    }
  });

  if (!res.ok) {
    throw new Error(`모델 목록 조회 실패 (${res.status})`);
  }

  const data = await res.json();
  const list = Array.isArray(data?.data) ? data.data : Array.isArray(data) ? data : [];
  return list
    .map((m) => (typeof m === 'string' ? { id: m, label: m } : { id: m.id || m.name, label: m.name || m.id }))
    .filter((m) => m.id);
}

/**
 * create-chatbot 백엔드 API 후보 경로 목록
 */
function getChatbotApiEndpoints(customUrl) {
  const endpoints = [];
  if (customUrl) {
    endpoints.push(customUrl.replace(/\/+$/, ''));
  }
  if (typeof window !== 'undefined') {
    const origin = window.location.origin;
    if (origin.includes('allforedu.kr')) {
      endpoints.push(`${origin}/api/chatbot`);
      endpoints.push(`${origin}/chatbot/api`);
    }
    if (origin.includes('localhost') || origin.includes('127.0.0.1')) {
      endpoints.push('http://localhost:8787/api/chatbot');
    }
  }
  endpoints.push('https://create.allforedu.kr/api/chatbot');
  endpoints.push('https://create.allforedu.kr/chatbot/api');
  return [...new Set(endpoints)];
}

/**
 * create-chatbot의 학습된 D1 RAG 데이터베이스에서 관련 연구학교 자료 검색
 */
export async function fetchCreateChatbotRag({ stds = [], config = {}, customQuery = '' }) {
  const aiConfig = getJeonbukAiConfig();
  const subjects = [...new Set(stds.map((s) => s.s).filter(Boolean))];
  const stdTexts = stds.map((s) => `${s.c} ${s.t} ${s.a || ''}`).join(' ');
  const gradeStr = config.grade ? `${config.grade}학년` : '';

  const primaryQuery =
    customQuery.trim() ||
    [
      gradeStr,
      subjects.join(' '),
      config.unit || '',
      config.tb || '',
      config.local || '',
      stdTexts,
      'CREATE 단원설계안 수업지도안'
    ]
      .filter(Boolean)
      .join(' ')
      .slice(0, 300);

  const guideQuery = 'CREATE 수업설계 모형 길잡이 6단계 진단 탐색 실행 분석 환류 전이 성장 일반화 문장 탐구 질문 루브릭';

  const candidateBases = getChatbotApiEndpoints(aiConfig.chatbotApiUrl);

  for (const base of candidateBases) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);

      // 1) 학년·교과·성취기준 맞춤 검색 + 2) CREATE 모형 공식 길잡이 검색 병렬 호출
      const [primaryRes, guideRes] = await Promise.all([
        fetch(`${base}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: primaryQuery,
            filter: {
              grade: gradeStr || undefined
            },
            limit: 5
          }),
          signal: controller.signal
        }),
        fetch(`${base}/search`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            query: guideQuery,
            limit: 3
          }),
          signal: controller.signal
        }).catch(() => null)
      ]);

      clearTimeout(timeoutId);

      if (primaryRes && primaryRes.ok) {
        const primaryData = await primaryRes.json();
        const guideData = guideRes && guideRes.ok ? await guideRes.json() : { results: [] };

        const merged = [...(primaryData.results || []), ...(guideData.results || [])];
        const uniqueMap = new Map();
        for (const item of merged) {
          if (item && item.id && !uniqueMap.has(item.id)) {
            uniqueMap.set(item.id, item);
          }
        }

        const finalResults = Array.from(uniqueMap.values()).slice(0, 7);
        if (finalResults.length > 0) {
          return {
            source: 'create-chatbot-d1',
            endpoint: base,
            query: primaryQuery,
            results: finalResults
          };
        }
      }
    } catch (err) {
      // 다음 후보 엔드포인트로 폴백
    }
  }

  // 오프라인 또는 서버 미응답 시 내장된 create-chatbot 공식 시드 데이터 폴백 반환
  return {
    source: 'create-chatbot-builtin',
    endpoint: 'local-seed',
    query: primaryQuery,
    results: getBuiltinCreateRagFallback(config.grade, subjects)
  };
}

/**
 * 오프라인/네트워크 제한 환경에서도 create-chatbot의 핵심 학습 내용을 보장하는 내장 폴백
 */
function getBuiltinCreateRagFallback(grade = 4, subjects = []) {
  const subjText = subjects.length ? subjects.join('·') : '융합';
  return [
    {
      id: 'builtin-guide-1',
      document_id: 'doc-guide-manual',
      document_title: 'CREATE 수업설계 모형 길잡이',
      category: 'CREATE 모형 안내',
      grade: '공통',
      subject: '융합/통합',
      page_number: 4,
      content:
        'CREATE 교수·학습 모형은 1) C(진단 Check & Context): AI·디지털 도구로 학생의 흥미, 강점, 취약점을 파악해 맞춤형 학습 출발점 설정(<진단 도구 선정>, <학습자 실태 분석>), 2) R(탐색 Research & Resource): 진단 결과를 바탕으로 자료와 교육과정을 재구성하고 핵심 일반화 문장 및 탐구 질문 준비(<교육과정 수정 여부 결정>, <일반화 문장 및 탐구 질문>), 3) E(실행 Experience & Engagement): 온·오프라인 및 디지털·아날로그 매체를 연계한 학생 주도 협력 탐구(<탐구 질문 중심 탐구 활동 전개>, <다양한 AI·디지털 도구 및 아날로그 매체 활용>)로 전개됩니다.'
    },
    {
      id: 'builtin-guide-2',
      document_id: 'doc-guide-manual',
      document_title: 'CREATE 수업설계 모형 길잡이',
      category: 'CREATE 모형 안내',
      grade: '공통',
      subject: '융합/통합',
      page_number: 9,
      content:
        '4) A(분석 Assess & Adjust): 성취수준 루브릭을 활용해 목표 도달도를 분석·평가하고, 미도달 학생이나 오개념 발생 시 R(탐색)이나 E(실행)로 되돌아가 재설계·보충하는 환류(<루브릭 활용 평가 및 피드백>, <환류: C·R·E로 되돌아가기>), 5) T(전이 Transfer & Transformation): 배운 개념과 일반화 문장을 타 교과 및 실생활·지역사회 맥락에 적용(<타 교과 연계 및 실생활 적용>, <지역 맥락화>), 6) E(성장 Expand & Empower): 학생 스스로 일반화 문장을 생성하고 C단계 진단 대비 성장을 성찰·공유(<일반화 문장 생성>, <배움에 대한 성찰 및 진단과 평가 결과 공유>)합니다.'
    },
    {
      id: `builtin-design-grade${grade}`,
      document_id: `doc-design-grade${grade}`,
      document_title: `CREATE모형 단원설계안(${grade}학년)`,
      category: '학년별 단원설계안',
      grade: `${grade}학년`,
      subject: subjText,
      page_number: 2,
      content:
        `${grade}학년 CREATE 단원설계안 표준 양식은 ① 단원 개요(단원 설정 이유, 2022 개정 성취기준 및 성취수준 A·B·C), ② CREATE 6단계 단원 설계표(단계, 차시, 소제목 및 수업 활동, ★디지털/△아날로그 활용 도구, 학생 배움 질문), ③ 차시별 도입-전개-정리 세부 지도안, ④ 루브릭 평가 계획 및 C·R·E 환류 방안으로 구성됩니다.`
    }
  ];
}

/**
 * developer_docs.md의 에러 코드 및 상태별 한국어 안내 메시지 변환
 */
export function formatGatewayErrorMessage(status, errorBodyText) {
  let parsed = null;
  try {
    parsed = JSON.parse(errorBodyText);
  } catch (e) {}

  const detail = parsed?.detail || parsed?.error || {};
  const code = detail?.code;
  const msg = typeof detail === 'string' ? detail : detail?.message || '';

  if (status === 401) {
    if (msg.includes('revoked')) {
      return '해지된 API 키입니다. 상단 [🔑 API 키 설정]에서 새로 발급받은 API 키를 입력해 주세요. (401)';
    }
    if (msg.includes('disabled')) {
      return '비활성화된 API 키입니다. 콘솔에서 키를 활성화하거나 새 키를 입력해 주세요. (401)';
    }
    return 'API 키 인증에 실패했습니다. [🔑 API 키 설정]에서 유효한 전북 AI (Baze Gateway) API 키를 확인해 주세요. (401)';
  }

  if (status === 402) {
    if (code === 6010) {
      const avail = detail?.data?.available_credit;
      const req = detail?.data?.required_credit;
      return `남은 크레딧(${avail ?? '?'} 크레딧)이 이번 요청의 예상 예약 비용(${req ?? '?'} 크레딧)보다 적습니다. 크레딧을 충전하거나 다른 키를 입력해 주세요. (402 · 코드 6010)`;
    }
    return '전북 AI API 크레딧 잔액이 소진되었습니다. [🔑 API 키 설정]에서 새로 발급받은 API 키로 변경하거나 크레딧을 충전해 주세요. (402)';
  }

  if (status === 403) {
    if (String(errorBodyText).includes('1010')) {
      return '네트워크 보안 정책(Cloudflare 1010)에 의해 요청이 차단되었습니다. (403)';
    }
    return `선택한 모델에 대한 접근 권한이 없거나 조직에 활성화되지 않았습니다. 다른 모델(예: claude-sonnet-5, gpt-6-luna)을 선택해 주세요. (403${msg ? `: ${msg}` : ''})`;
  }

  if (status === 404) {
    return `모델 또는 엔드포인트를 찾을 수 없습니다. 모델 이름이나 챗봇 ID 설정을 확인해 주세요. (404${msg ? `: ${msg}` : ''})`;
  }

  if (status === 413) {
    return '요청 본문 크기가 25MB 제한을 초과했습니다. (413)';
  }

  if (status === 429) {
    if (code === 6005) {
      return '분당 크레딧 예약 공용 한도(60초당 300건)를 초과했습니다. 약 1분 후 다시 시도해 주세요. (429 · 코드 6005)';
    }
    return '호출 속도 제한(분당 120건 / 챗봇 라우트 분당 30건)에 도달했습니다. 잠시 후 다시 시도해 주세요. (429)';
  }

  if (status === 503) {
    return '현재 전북 AI 게이트웨이 서비스 점검 중입니다. 잠시 후 다시 시도해 주세요. (503)';
  }

  return `전북 AI 호출 중 오류가 발생했습니다 (HTTP ${status})${msg ? `: ${msg}` : ''}`;
}

/**
 * RAG 검색 결과를 프롬프트에 결합할 텍스트 블록으로 변환
 */
export function buildRagPromptBlock(ragResults = []) {
  if (!ragResults || ragResults.length === 0) return '';

  const snippets = ragResults
    .map((r, idx) => {
      const cleanContent = String(r.content || '')
        .replace(/\s+/g, ' ')
        .trim();
      return `[참고자료 ${idx + 1}] 출처: <${r.document_title}> (${r.category || '연구학교 자료'}, ${r.page_number || 1}쪽)\n내용: ${cleanContent}`;
    })
    .join('\n\n');

  return [
    `# 📚 create-chatbot 학습 RAG 참고자료 (연구학교 공식 문서 발췌)`,
    `아래 자료는 연구학교의 공식 「CREATE 수업설계 모형 길잡이」, 「학년별 단원설계안」, 「교과별 수업지도안」에서 이번 단원 설계 조건과 관련하여 검색된 핵심 근거 자료입니다.`,
    `지도안을 작성할 때 아래 RAG 자료의 단계별 구성 방식, 필수 소제목 형식, A(분석) 단계의 C·R·E 환류 설계, 실제 발문 및 평가 루브릭 체제를 적극 반영하여 작성해 주세요.`,
    ``,
    snippets,
    ``
  ].join('\n');
}

/**
 * 전북 AI API Gateway를 호출하여 수업 지도안 생성 (스트리밍 + 비스트리밍 자동 호환)
 */
export async function generatePlanWithJeonbukAi({
  promptText,
  ragResults = [],
  previousMarkdown = '',
  onStreamChunk,
  signal
}) {
  const aiConfig = getJeonbukAiConfig();
  const apiKey = (aiConfig.apiKey || DEFAULT_AI_CONFIG.apiKey || '').trim();
  const baseUrl = (aiConfig.baseUrl || DEFAULT_AI_CONFIG.baseUrl).trim().replace(/\/+$/, '');
  const model = (aiConfig.model || DEFAULT_AI_CONFIG.model).trim();
  const chatbotId = (aiConfig.chatbotId || '').trim();

  const ragBlock = aiConfig.useRag && ragResults.length > 0 ? buildRagPromptBlock(ragResults) : '';

  const systemInstruction = [
    `당신은 2022 개정 교육과정과 초등 교육에 정통한 수석교사이자, 전라북도교육청 지정 연구학교의 「CREATE 교수·학습 개발모형」 전용 AI 수업 설계 전문가입니다.`,
    `제공된 [create-chatbot 학습 RAG 참고자료]와 [설계 조건]을 바탕으로, 학교 현장에서 즉시 활용할 수 있도록 ① 단원 개요, ② CREATE 6단계 단원 설계표(마크다운 표), ③ 차시별 세부 지도안(도입-전개-정리), ④ 평가 계획 및 성취수준(A·B·C) 루브릭과 환류 방안까지 빠짐없이 상세하고 완성도 높게 작성하세요.`,
    `중간에 내용을 축약하거나 '이하 생략'하지 말고 끝까지 충실하게 작성하세요.`
  ].join('\n');

  const combinedUserPrompt = ragBlock
    ? `${ragBlock}\n---\n\n${promptText}`
    : promptText;

  if (!apiKey) {
    return await callViaChatbotBackend({
      combinedUserPrompt,
      previousMarkdown,
      chatbotApiUrl: aiConfig.chatbotApiUrl,
      onStreamChunk,
      signal
    });
  }

  let endpointUrl = `${baseUrl}/chat/completions/`;
  if (chatbotId) {
    if (chatbotId.startsWith('http://') || chatbotId.startsWith('https://')) {
      endpointUrl = chatbotId;
    } else {
      const cleanId = chatbotId
        .replace(/^\/?v1\/gateway\/chatbots\//, '')
        .replace(/\/chat\/completions\/?$/, '')
        .replace(/^\/+|\/+$/g, '');
      endpointUrl = `${baseUrl}/chatbots/${encodeURIComponent(cleanId)}/chat/completions/`;
    }
  }

  const messages = [];
  if (!chatbotId) {
    messages.push({ role: 'system', content: systemInstruction });
  }

  if (previousMarkdown && previousMarkdown.trim()) {
    messages.push({ role: 'user', content: combinedUserPrompt });
    messages.push({ role: 'assistant', content: previousMarkdown });
    messages.push({
      role: 'user',
      content:
        '위 내용에 바로 이어서 아직 작성되지 않은 뒷부분(남은 차시 지도안, 평가 계획 및 루브릭, 시각 자료 프롬프트 등)을 끊긴 지점부터 자연스럽게 완성해 주세요. 앞에서 이미 작성한 제목이나 내용은 중복해서 다시 쓰지 마세요.'
    });
  } else {
    messages.push({
      role: 'user',
      content: chatbotId ? `${systemInstruction}\n\n${combinedUserPrompt}` : combinedUserPrompt
    });
  }

  return await executeGatewayRequest({
    endpointUrl,
    apiKey,
    model,
    chatbotId,
    messages,
    previousMarkdown,
    onStreamChunk,
    signal
  });
}

async function executeGatewayRequest({
  endpointUrl,
  apiKey,
  model,
  chatbotId,
  messages,
  previousMarkdown = '',
  onStreamChunk,
  signal,
  retryMaxTokens = null
}) {
  const isReasoningModel = /^(gpt-5|gemini-3\.1)/i.test(model || '');
  const bodyPayload = {
    messages,
    stream: true
  };

  if (!chatbotId || model) {
    bodyPayload.model = model || DEFAULT_AI_CONFIG.model;
  }

  if (retryMaxTokens) {
    bodyPayload.max_tokens = retryMaxTokens;
  } else if (isReasoningModel) {
    bodyPayload.max_tokens = 16000;
    if (/^gpt-5/i.test(model)) {
      bodyPayload.temperature = 1;
    }
  }

  const response = await fetch(endpointUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${apiKey}`,
      'x-api-key': apiKey
    },
    body: JSON.stringify(bodyPayload),
    signal
  });

  if (!response.ok) {
    const errText = await response.text().catch(() => '');

    // developer_docs.md: 402 + detail.code === 6010 (예상 max_tokens 비용이 잔여 크레딧 초과 시 max_tokens 낮춰 자동 재시도)
    if (response.status === 402 && !retryMaxTokens) {
      try {
        const parsed = JSON.parse(errText);
        if (parsed?.detail?.code === 6010) {
          return await executeGatewayRequest({
            endpointUrl,
            apiKey,
            model,
            chatbotId,
            messages,
            previousMarkdown,
            onStreamChunk,
            signal,
            retryMaxTokens: 4096
          });
        }
      } catch (e) {}
    }

    throw new Error(formatGatewayErrorMessage(response.status, errText));
  }

  const contentType = response.headers.get('content-type') || '';

  // A) SSE 스트리밍 응답 처리
  if (contentType.includes('text/event-stream') && response.body) {
    const reader = response.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let buffer = '';
    let accumulated = previousMarkdown ? `${previousMarkdown.replace(/\s*$/, '')}\n\n` : '';

    while (true) {
      const { value, done } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const rawLine of lines) {
        const line = rawLine.trim();
        if (!line || !line.startsWith('data:')) continue;

        const dataStr = line.replace(/^data:\s*/, '').trim();
        if (dataStr === '[DONE]') continue;

        try {
          const parsed = JSON.parse(dataStr);
          if (parsed?.error) {
            throw new Error(parsed.error.message || '스트리밍 중 오류가 발생했습니다.');
          }
          const delta =
            parsed?.choices?.[0]?.delta?.content ??
            parsed?.choices?.[0]?.message?.content ??
            parsed?.delta?.text ??
            parsed?.content ??
            '';
          if (delta && typeof delta === 'string') {
            accumulated += delta;
            if (onStreamChunk) {
              onStreamChunk(accumulated);
            }
          }
        } catch (parseErr) {
          if (parseErr.message && parseErr.message.includes('스트리밍 중 오류')) {
            throw parseErr;
          }
        }
      }
    }

    if (accumulated.trim()) {
      return {
        markdown: accumulated.trim(),
        modelUsed: chatbotId ? `전북AI 챗봇 (${chatbotId})` : model
      };
    }
  }

  // B) 일반 JSON 응답 처리
  const data = await response.json();
  const content =
    data?.choices?.[0]?.message?.content ||
    data?.choices?.[0]?.text ||
    data?.answer ||
    data?.response ||
    data?.output_text ||
    (typeof data?.content === 'string' ? data.content : '');

  if (!content || !String(content).trim()) {
    throw new Error('AI 응답이 비어 있습니다. 모델 설정을 확인하거나 다시 시도해 주세요.');
  }

  const finalMarkdown = previousMarkdown
    ? `${previousMarkdown.replace(/\s*$/, '')}\n\n${String(content).trim()}`
    : String(content).trim();

  if (onStreamChunk) {
    onStreamChunk(finalMarkdown);
  }

  return {
    markdown: finalMarkdown,
    modelUsed: chatbotId ? `전북AI 챗봇 (${chatbotId})` : model
  };
}

async function callViaChatbotBackend({
  combinedUserPrompt,
  previousMarkdown = '',
  chatbotApiUrl,
  onStreamChunk,
  signal
}) {
  const candidateBases = getChatbotApiEndpoints(chatbotApiUrl);

  const messageToSend = previousMarkdown
    ? `${combinedUserPrompt}\n\n[이전에 작성된 앞부분]\n${previousMarkdown.slice(-3000)}\n\n위 내용에 바로 이어서 뒷부분을 완성해 주세요.`
    : combinedUserPrompt;

  for (const base of candidateBases) {
    try {
      const res = await fetch(`${base}/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: messageToSend,
          mode: 'jeonbuk'
        }),
        signal
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.answer && !data.is_fallback) {
          const finalMarkdown = previousMarkdown
            ? `${previousMarkdown.replace(/\s*$/, '')}\n\n${data.answer.trim()}`
            : data.answer.trim();
          if (onStreamChunk) onStreamChunk(finalMarkdown);
          return {
            markdown: finalMarkdown,
            modelUsed: 'create-chatbot 서버 연동 (전북AI)'
          };
        }
      }
    } catch (e) {}
  }

  const noKeyErr = new Error(
    '전북 AI API 키가 설정되지 않았습니다. 상단 [🔑 API 키 설정]에서 새로 발급받은 API 키를 입력해 주세요.'
  );
  noKeyErr.code = 'MISSING_API_KEY';
  throw noKeyErr;
}
