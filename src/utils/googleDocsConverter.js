import { marked } from 'marked';
import DOMPurify from 'dompurify';

const CELL_STYLE = 'border:1px solid #7a8fa6;padding:6px 8px;vertical-align:top;font-size:10pt;';

export function mdToDocsHtml(md) {
  if (!md || !md.trim()) {
    return { html: '', textPlain: '', imagePrompts: [], isPrompt: false };
  }

  // AI 프롬프트인지 감지 (사용자가 결과 대신 프롬프트를 잘못 붙여넣었을 때 경고)
  const isPrompt =
    /#\s*CREATE 모형 규칙/.test(md) &&
    /#\s*설계 조건/.test(md) &&
    /이제 위 (?:설계 )?조건으로 지도안을 작성해 주세요/.test(md);

  if (isPrompt) {
    return { html: '', textPlain: '', imagePrompts: [], isPrompt: true };
  }

  // 코드 블록 및 불필요한 마크다운 클린업
  const src = md
    .replace(/^\s*```[a-z]*\s*$/gim, '')
    .replace(/^\s*"?📄 구글 문서로 저장하기[^\n]*$/gm, '')
    .replace(/^\s*"?🎨 그림 만들기[^\n]*$/gm, '')
    .replace(/~/g, '\\~'); // 7~8차시 물결표 취소선 방지

  const raw = marked.parse(src, { gfm: true, breaks: false });
  const box = document.createElement('div');
  box.innerHTML = DOMPurify.sanitize(raw, {
    ALLOWED_ATTR: ['colspan', 'rowspan', 'align', 'class', 'style']
  });

  // 스타일 매핑
  const H_STYLES = {
    H1: 'text-align:center;font-size:20pt;font-weight:bold;color:#1d3c78;margin:12pt 0 6pt;',
    H2: 'font-size:13.5pt;font-weight:bold;color:#ffffff;background:#2f6fde;padding:5pt 10pt;border-radius:3pt;margin:16pt 0 6pt;',
    H3: 'font-size:12pt;font-weight:bold;color:#1d3c78;border-bottom:1.5pt solid #2f6fde;padding-bottom:3pt;margin:12pt 0 4pt;',
    H4: 'font-size:11pt;font-weight:bold;color:#2f6fde;margin:8pt 0 3pt;'
  };

  box.querySelectorAll('h1,h2,h3,h4').forEach((h) => {
    h.setAttribute('style', H_STYLES[h.tagName] || '');
  });

  const h1 = box.querySelector('h1');
  if (h1) {
    h1.insertAdjacentHTML(
      'afterend',
      `<p style="text-align:center;color:#5b6476;font-size:9pt;margin:0 0 12pt;">CREATE 모형(진단–탐색–실행–분석–전이–성장) 단원 설계안 · AI 맞춤형 수업안</p>`
    );
  }

  box.querySelectorAll('p,li').forEach((e) => {
    if (!e.getAttribute('style')) {
      e.setAttribute('style', 'line-height:1.6;margin:3pt 0;font-size:10.5pt;color:#222;');
    }
  });

  box.querySelectorAll('table').forEach((t) => {
    t.setAttribute('style', 'border-collapse:collapse;width:100%;margin:10pt 0;');
  });

  box.querySelectorAll('th').forEach((c) => {
    c.setAttribute('style', `${CELL_STYLE}background:#dfe8fb;font-weight:bold;text-align:center;color:#183266;`);
  });

  box.querySelectorAll('tr').forEach((r) => {
    const f = r.querySelector('td');
    if (f && r.children.length > 1 && f.textContent.trim().length <= 12) {
      f.setAttribute('style', `${CELL_STYLE}background:#f4f7fc;font-weight:bold;text-align:center;white-space:nowrap;`);
    }
  });

  box.querySelectorAll('td').forEach((c) => {
    if (!c.getAttribute('style')) c.setAttribute('style', CELL_STYLE);
  });

  // 그림 슬롯 파싱 (> 🖼 ...)
  const imagePrompts = [];
  box.querySelectorAll('blockquote').forEach((q) => {
    const parts = [...q.querySelectorAll('p')]
      .map((p) => p.textContent.trim())
      .filter((t) => t.startsWith('🖼') || t.startsWith('그림'));

    if (!parts.length) {
      q.setAttribute('style', 'margin:8pt 0;padding:6pt 12pt;border-left:3.5pt solid #2f6fde;background:#f3f6fd;color:#334466;font-size:10pt;');
      return;
    }

    const slots = parts
      .flatMap((t) => t.split(/\n(?=\s*(?:🖼|그림))/))
      .map((t) => {
        const body = t.replace(/^(?:🖼|그림)\s*/, '');
        const m = body.match(/^(?:그림\s*(\d+)|이미지 생성 프롬프트)?\s*[—–-]?\s*\(?([^:：]*?)\)?\s*[:：]\s*([\s\S]+)$/);
        const n = imagePrompts.length + 1;
        const name = (m && m[2].trim()) || `수업 시각 자료 ${n}`;
        const desc = (m ? m[3] : body).trim();
        imagePrompts.push({ n, name, desc });

        return (
          `<table class="imgslot" data-n="${n}" style="border-collapse:collapse;width:100%;margin:12pt 0;">` +
          `<tr><td style="border:1.5pt dashed #2f6fde;background:#f5f8ff;padding:14pt 12pt;text-align:center;border-radius:6pt;">` +
          `<p style="margin:0 0 4pt;font-weight:bold;color:#1d3c78;font-size:11.5pt;">🖼 그림 ${n} 자리 — ${escapeHtml(name)}</p>` +
          `<p style="margin:0 0 6pt;color:#5b6476;font-size:9pt;">여기에 생성한 그림을 넣으세요 · 제미나이에 "그림 ${n} 그려 줘"</p>` +
          `<p style="margin:0;color:#6b768a;font-size:8.5pt;text-align:left;background:#ffffff;padding:6pt 8pt;border-radius:4pt;border:1px solid #d8e2f3;"><strong>그림 설명(프롬프트):</strong> ${escapeHtml(desc)}</p>` +
          `</td></tr></table>`
        );
      });

    q.outerHTML = slots.join('');
  });

  const html = box.innerHTML;
  const textPlain = box.innerText;

  return { html, textPlain, imagePrompts, isPrompt: false };
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export async function copyDocsToClipboard(bodyHtml, rawText) {
  const fullHtml = `<html><head><meta charset="utf-8"></head><body><div style="font-family:'맑은 고딕','Malgun Gothic','Noto Sans KR',sans-serif;font-size:10.5pt;color:#222;">${bodyHtml}</div></body></html>`;

  try {
    if (navigator.clipboard && window.ClipboardItem) {
      await navigator.clipboard.write([
        new ClipboardItem({
          'text/html': new Blob([fullHtml], { type: 'text/html' }),
          'text/plain': new Blob([rawText], { type: 'text/plain' })
        })
      ]);
      return true;
    }
  } catch (err) {
    console.warn('Clipboard API error, fallback to execCommand:', err);
  }

  // Fallback
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = fullHtml;
  tempDiv.style.position = 'fixed';
  tempDiv.style.left = '-9999px';
  document.body.appendChild(tempDiv);

  const range = document.createRange();
  range.selectNodeContents(tempDiv);
  const selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);

  let success = false;
  try {
    success = document.execCommand('copy');
  } catch (e) {
    success = false;
  }

  selection.removeAllRanges();
  document.body.removeChild(tempDiv);
  return success;
}
