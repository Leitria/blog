import { NextRequest, NextResponse } from 'next/server';

function upstreamBase(): string | undefined {
  return process.env.NETEASE_CLOUD_MUSIC_API_BASE?.replace(/\/$/, '');
}

/**
 * 转发到自建 NeteaseCloudMusicApi（如 Binaryify/NeteaseCloudMusicApi）。
 * 环境变量 NETEASE_CLOUD_MUSIC_API_BASE 填该服务根地址，例如 http://127.0.0.1:3000
 */
export async function GET(request: NextRequest) {
  const base = upstreamBase();
  if (!base) {
    return NextResponse.json(
      {
        code: 501,
        message:
          '未配置 NETEASE_CLOUD_MUSIC_API_BASE。请部署 NeteaseCloudMusicApi 类服务后，把根 URL 写入环境变量。',
      },
      { status: 501 },
    );
  }

  const sp = request.nextUrl.searchParams;
  const action = sp.get('action');
  let path = '';

  if (action === 'cloudsearch') {
    const keywords = sp.get('keywords')?.trim();
    if (!keywords || keywords.length > 160) {
      return NextResponse.json({ code: 400, message: 'keywords 无效或过长' }, { status: 400 });
    }
    const typ = sp.get('type') ?? '1';
    if (typ !== '1' && typ !== '1000') {
      return NextResponse.json({ code: 400, message: 'type 仅支持 1（单曲）或 1000（歌词）' }, { status: 400 });
    }
    const limit = Math.min(50, Math.max(1, parseInt(sp.get('limit') ?? '30', 10) || 30));
    path = `cloudsearch?keywords=${encodeURIComponent(keywords)}&type=${typ}&limit=${limit}`;
  } else if (action === 'song-url') {
    const id = sp.get('id');
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ code: 400, message: 'id 须为数字' }, { status: 400 });
    }
    const br = sp.get('br') ?? '320000';
    if (!/^\d{5,7}$/.test(br)) {
      return NextResponse.json({ code: 400, message: 'br 无效' }, { status: 400 });
    }
    path = `song/url/v1?id=${id}&br=${br}`;
  } else if (action === 'lyric') {
    const id = sp.get('id');
    if (!id || !/^\d+$/.test(id)) {
      return NextResponse.json({ code: 400, message: 'id 须为数字' }, { status: 400 });
    }
    path = `lyric?id=${id}`;
  } else {
    return NextResponse.json({ code: 400, message: '缺少或非法的 action' }, { status: 400 });
  }

  const url = `${base}/${path}`;
  const upstream = await fetch(url, {
    headers: { 'User-Agent': 'LeitriaMusic/1.0' },
    cache: 'no-store',
  });

  const text = await upstream.text();
  let json: unknown;
  try {
    json = JSON.parse(text);
  } catch {
    return NextResponse.json(
      { code: 502, message: '上游返回非 JSON', snippet: text.slice(0, 180) },
      { status: 502 },
    );
  }

  return NextResponse.json(json);
}
