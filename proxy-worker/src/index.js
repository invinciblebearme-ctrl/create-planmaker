export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // 1. /designer 접속 시 끝에 슬래시(/) 자동 리다이렉트
    if (url.pathname === '/designer') {
      return Response.redirect(`${url.origin}/designer/`, 301);
    }

    // 2. /designer/ 하위 요청을 create-planmaker.pages.dev로 전달
    if (url.pathname.startsWith('/designer/')) {
      const targetUrl = new URL(request.url);
      targetUrl.hostname = 'create-planmaker.pages.dev';

      let subPath = url.pathname.replace(/^\/designer\/?/, '/');
      if (!subPath.startsWith('/')) {
        subPath = '/' + subPath;
      }
      targetUrl.pathname = subPath;

      const modifiedRequest = new Request(targetUrl.toString(), {
        method: request.method,
        headers: request.headers,
        body: request.body,
        redirect: 'follow',
      });

      const response = await fetch(modifiedRequest);

      // 3. HTML 응답 시 <base href="/designer/"> 주입하여 상대 경로 에셋 보장
      const contentType = response.headers.get('content-type') || '';
      if (contentType.includes('text/html')) {
        let html = await response.text();
        if (!html.includes('<base href=')) {
          html = html.replace('<head>', '<head><base href="/designer/">');
        }
        return new Response(html, {
          status: response.status,
          headers: response.headers,
        });
      }

      return response;
    }

    return fetch(request);
  }
};
