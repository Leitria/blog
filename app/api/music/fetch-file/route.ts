import { NextRequest, NextResponse } from 'next/server';

function isAllowedAudioHost(hostname: string): boolean {
  const h = hostname.toLowerCase();
  return (
    h.endsWith('.126.net') ||
    h.endsWith('.127.net') ||
    h.endsWith('music.126.net') ||
    h.endsWith('163.com') ||
    h.endsWith('qqmusic.com') ||
    h.endsWith('gtimg.com') ||
    h.endsWith('tencentmusic.com')
  );
}

/**
 * 服务端拉取音频文件并回传，便于浏览器下载（规避部分 CDN 对 fetch 的 CORS 限制）。
 * 仅允许常见音乐 CDN 域名，降低 SSRF 风险。
 */
export async function GET(request: NextRequest) {
  const raw = request.nextUrl.searchParams.get('url');
  if (!raw) {
    return NextResponse.json({ message: '缺少 url' }, { status: 400 });
  }

  let target: URL;
  try {
    target = new URL(raw);
  } catch {
    return NextResponse.json({ message: '非法 url' }, { status: 400 });
  }

  if (target.protocol !== 'http:' && target.protocol !== 'https:') {
    return NextResponse.json({ message: '仅支持 http(s)' }, { status: 400 });
  }

  if (!isAllowedAudioHost(target.hostname)) {
    return NextResponse.json({ message: '该域名不在允许列表内' }, { status: 403 });
  }

  const upstream = await fetch(target.toString(), {
    headers: { 'User-Agent': 'LeitriaMusic/1.0' },
    redirect: 'follow',
    cache: 'no-store',
  });

  if (!upstream.ok) {
    return NextResponse.json(
      { message: `上游错误 ${upstream.status}` },
      { status: 502 },
    );
  }

  const filename =
    request.nextUrl.searchParams.get('filename')?.replace(/[^\w\u4e00-\u9fa5\-_. ()\[\]]+/g, '_').slice(0, 120) ||
    'audio.mp3';

  const ct = upstream.headers.get('content-type') || 'application/octet-stream';

  return new NextResponse(upstream.body, {
    status: 200,
    headers: {
      'Content-Type': ct,
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(filename)}`,
    },
  });
}
