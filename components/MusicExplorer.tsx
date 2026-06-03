'use client';

import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import React, { useCallback, useRef, useState, useTransition } from 'react';

type SongRow = {
  id: number;
  name: string;
  artists: string;
  pic?: string;
};

function parseCloudSearchSongs(data: unknown): SongRow[] {
  const root = data as { result?: { songs?: unknown[] } };
  const songs = root?.result?.songs;
  if (!Array.isArray(songs)) return [];
  return songs.map((raw) => {
    const x = raw as Record<string, unknown>;
    const ar = (x.ar ?? x.artists) as Array<{ name?: string }> | undefined;
    const artistStr = Array.isArray(ar)
      ? ar
          .map((a) => a?.name)
          .filter(Boolean)
          .join(' / ')
      : '';
    const al = x.al as { picUrl?: string } | undefined;
    return {
      id: Number(x.id),
      name: String(x.name ?? ''),
      artists: artistStr,
      pic: typeof al?.picUrl === 'string' ? al.picUrl : undefined,
    };
  });
}

function parseLyricSearchRows(data: unknown): SongRow[] {
  const root = data as { result?: Record<string, unknown> };
  const result = root?.result;
  if (!result) return [];
  const sl = result.searchLyrics as { lyrics?: unknown[] } | undefined;
  const list = sl?.lyrics;
  if (!Array.isArray(list)) return [];
  return list.map((raw) => {
    const x = raw as Record<string, unknown>;
    const ar = (x.artists ?? x.ar) as Array<{ name?: string }> | undefined;
    const artistStr = Array.isArray(ar)
      ? ar
          .map((a) => a?.name)
          .filter(Boolean)
          .join(' / ')
      : '';
    return {
      id: Number(x.id),
      name: String(x.name ?? ''),
      artists: artistStr,
    };
  });
}

export default function MusicExplorer() {
  const {
    loadTrack,
    localPlayMode,
    setLocalPlayMode,
    localQueue,
    localQueueIndex,
    loadLocalFolder,
    playLocalQueueAt,
  } = useAudioPlayer();
  const [keyword, setKeyword] = useState('');
  const [searchType, setSearchType] = useState<'1' | '1000'>('1');
  const [rows, setRows] = useState<SongRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [hint, setHint] = useState<string | null>(null);
  const [qqQuery, setQqQuery] = useState('');
  const [isPending, startTransition] = useTransition();
  const audioFileRef = useRef<HTMLInputElement>(null);
  const folderRef = useRef<HTMLInputElement>(null);
  const lrcFileRef = useRef<HTMLInputElement>(null);

  const searchNetease = useCallback(async () => {
    const q = keyword.trim();
    if (!q) {
      setHint('请输入关键词');
      return;
    }
    setBusy(true);
    setHint(null);
    try {
      const params = new URLSearchParams({
        action: 'cloudsearch',
        keywords: q,
        type: searchType,
        limit: '30',
      });
      const res = await fetch(`/api/music/netease?${params}`);
      const data = await res.json();
      if (!res.ok) {
        setHint((data as { message?: string }).message ?? `请求失败 ${res.status}`);
        startTransition(() => setRows([]));
        return;
      }
      const next =
        searchType === '1' ? parseCloudSearchSongs(data) : parseLyricSearchRows(data);
      startTransition(() => setRows(next));
      if (!next.length) setHint('没有结果。若未配置 API，请先设置环境变量 NETEASE_CLOUD_MUSIC_API_BASE。');
    } catch {
      setHint('网络错误');
      startTransition(() => setRows([]));
    } finally {
      setBusy(false);
    }
  }, [keyword, searchType]);

  const playRow = useCallback(
    async (row: SongRow) => {
      setBusy(true);
      setHint(null);
      try {
        const [urlRes, lyricRes] = await Promise.all([
          fetch(`/api/music/netease?action=song-url&id=${row.id}&br=320000`),
          fetch(`/api/music/netease?action=lyric&id=${row.id}`),
        ]);
        const urlJson = (await urlRes.json()) as {
          data?: Array<{ url?: string | null }>;
          message?: string;
        };
        const lyricJson = (await lyricRes.json()) as { lrc?: { lyric?: string } };

        if (!urlRes.ok) {
          setHint(urlJson.message ?? '获取播放地址失败');
          return;
        }
        const url = urlJson.data?.[0]?.url;
        if (!url) {
          setHint('当前曲目无可用流媒体地址（版权或地区限制）。可尝试在 QQ 音乐打开。');
          return;
        }
        const lrcText = lyricJson.lrc?.lyric ?? '';
        await loadTrack({
          audioSrc: url,
          lyricsText: lrcText || undefined,
          title: row.name,
          artist: row.artists,
          autoplay: true,
        });
      } catch {
        setHint('播放失败');
      } finally {
        setBusy(false);
      }
    },
    [loadTrack],
  );

  const downloadRow = useCallback(async (row: SongRow) => {
    setBusy(true);
    setHint(null);
    try {
      const urlRes = await fetch(`/api/music/netease?action=song-url&id=${row.id}&br=320000`);
      const urlJson = (await urlRes.json()) as { data?: Array<{ url?: string | null }> };
      const url = urlJson.data?.[0]?.url;
      if (!url) {
        setHint('无法下载：无音频地址');
        return;
      }
      const name = `${row.name} - ${row.artists}.mp3`.replace(/[\\/:*?"<>|]+/g, '_');
      const dl = `/api/music/fetch-file?url=${encodeURIComponent(url)}&filename=${encodeURIComponent(name)}`;
      const a = document.createElement('a');
      a.href = dl;
      a.rel = 'noopener';
      a.click();
    } catch {
      setHint('下载失败');
    } finally {
      setBusy(false);
    }
  }, []);

  const onPickLocalAudio = useCallback(async () => {
    const input = audioFileRef.current;
    const file = input?.files?.[0];
    if (!file) return;
    const blobUrl = URL.createObjectURL(file);
    let lyricsText: string | undefined;
    const lrcInput = lrcFileRef.current;
    const lrcFile = lrcInput?.files?.[0];
    if (lrcFile) {
      lyricsText = await lrcFile.text();
    }
    await loadTrack({
      audioSrc: blobUrl,
      lyricsText,
      title: file.name.replace(/\.[^.]+$/, ''),
      artist: '本地文件',
      managedBlobUrl: blobUrl,
      autoplay: true,
    });
    if (input) input.value = '';
    if (lrcInput) lrcInput.value = '';
  }, [loadTrack]);

  const openQqSearch = useCallback(() => {
    const q = qqQuery.trim() || keyword.trim();
    if (!q) {
      setHint('请输入要搜索的内容');
      return;
    }
    window.open(
      `https://y.qq.com/n/ryqq/search?w=${encodeURIComponent(q)}`,
      '_blank',
      'noopener,noreferrer',
    );
  }, [qqQuery, keyword]);

  const onFolderChange = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const fl = e.target.files;
      setHint(null);
      if (!fl?.length) return;
      const count = await loadLocalFolder(fl);
      if (!count) setHint('所选文件夹中没有可用的 MP3 / MP4 文件。');
      e.target.value = '';
    },
    [loadLocalFolder],
  );

  return (
    <Card className="mx-auto max-w-3xl border-border/80 shadow-md">
      <CardHeader>
        <CardTitle>音乐</CardTitle>
        <CardDescription>
          网易云：通过自建 API 搜索并在线播放（需配置 NETEASE_CLOUD_MUSIC_API_BASE）。QQ
          音乐：跳转官网搜索与播放。本地：单文件或整夹 MP3/MP4（浏览器内解码，不上传服务器），支持顺序 / 随机 / 单曲循环。
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {hint ? (
          <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-900 dark:text-amber-100">
            {hint}
          </p>
        ) : null}

        <Tabs defaultValue="netease">
          <TabsList>
            <TabsTrigger value="netease">网易云</TabsTrigger>
            <TabsTrigger value="qq">QQ 音乐</TabsTrigger>
            <TabsTrigger value="local">本机文件</TabsTrigger>
          </TabsList>

          <TabsContent value="netease" className="space-y-3 pt-3">
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="歌名、歌手或歌词片段…"
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && void searchNetease()}
                className="min-w-[200px] flex-1"
              />
              <select
                className="border-input bg-background h-9 rounded-md border px-2 text-sm shadow-xs"
                value={searchType}
                onChange={(e) => setSearchType(e.target.value as '1' | '1000')}
              >
                <option value="1">搜单曲</option>
                <option value="1000">搜歌词</option>
              </select>
              <Button type="button" disabled={busy} onClick={() => void searchNetease()}>
                {busy ? '…' : '搜索'}
              </Button>
            </div>

            <ul className="max-h-[420px] space-y-2 overflow-y-auto pr-1">
              {isPending ? (
                <li className="text-muted-foreground text-sm">更新列表…</li>
              ) : null}
              {rows.map((row) => (
                <li
                  key={row.id}
                  className="flex flex-wrap items-center gap-2 rounded-lg border border-border/60 bg-muted/30 px-3 py-2 text-sm"
                >
                  <div className="min-w-0 flex-1">
                    <div className="truncate font-medium">{row.name}</div>
                    <div className="text-muted-foreground truncate text-xs">{row.artists}</div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="default" disabled={busy} onClick={() => void playRow(row)}>
                      播放
                    </Button>
                    <Button size="sm" variant="outline" disabled={busy} onClick={() => void downloadRow(row)}>
                      下载
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="qq" className="space-y-3 pt-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              QQ 音乐未提供面向个人站点的公开流媒体接口。下面在浏览器新标签打开官方搜索页，可完整收听与使用客户端功能。
            </p>
            <div className="flex flex-wrap gap-2">
              <Input
                placeholder="歌名或歌词…"
                value={qqQuery}
                onChange={(e) => setQqQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && openQqSearch()}
                className="min-w-[200px] flex-1"
              />
              <Button type="button" onClick={openQqSearch}>
                在 QQ 音乐搜索
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="local" className="space-y-3 pt-3">
            <p className="text-muted-foreground text-sm leading-relaxed">
              单文件可搭配可选 .lrc。选择文件夹将导入其中所有 MP3 / MP4（含子文件夹），按资源管理器式路径排序播放；仅在本机内存中生成临时地址，不上传服务器。
            </p>

            <div className="flex flex-wrap gap-2">
              <input
                ref={folderRef}
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => void onFolderChange(e)}
                {...({ webkitdirectory: '', directory: '' } as React.InputHTMLAttributes<HTMLInputElement>)}
              />
              <Button type="button" variant="secondary" onClick={() => folderRef.current?.click()}>
                选择文件夹
              </Button>
            </div>

            {localQueue && localQueue.length > 0 ? (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <span className="text-muted-foreground self-center text-xs">播放模式</span>
                  <Button
                    type="button"
                    size="sm"
                    variant={localPlayMode === 'ordered' ? 'default' : 'outline'}
                    onClick={() => setLocalPlayMode('ordered')}
                  >
                    顺序
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={localPlayMode === 'shuffle' ? 'default' : 'outline'}
                    onClick={() => setLocalPlayMode('shuffle')}
                  >
                    随机
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant={localPlayMode === 'repeat-one' ? 'default' : 'outline'}
                    onClick={() => setLocalPlayMode('repeat-one')}
                  >
                    单曲循环
                  </Button>
                </div>
                <p className="text-muted-foreground text-xs">
                  共 {localQueue.length} 首；顺序播放到最后一首后停止；随机在切歌时随机下一首；单曲循环为当前首重复。
                </p>
                <ul className="max-h-52 space-y-1 overflow-y-auto rounded-md border border-border/60 p-2 text-sm">
                  {localQueue.map((item, i) => (
                    <li key={`${item.blobUrl}-${i}`}>
                      <button
                        type="button"
                        className={
                          i === localQueueIndex
                            ? 'bg-primary/15 w-full rounded px-2 py-1.5 text-left font-medium'
                            : 'hover:bg-muted/80 w-full rounded px-2 py-1.5 text-left'
                        }
                        onClick={() => void playLocalQueueAt(i)}
                      >
                        <span className="text-muted-foreground mr-2 tabular-nums">{i + 1}.</span>
                        <span className="break-all">{item.label}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="border-border/60 border-t pt-3">
              <p className="text-muted-foreground mb-2 text-xs">单首 + 可选歌词</p>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
              <div className="flex-1 space-y-1">
                <label className="text-muted-foreground text-xs">音频</label>
                <input
                  ref={audioFileRef}
                  type="file"
                  accept="audio/*,.mp3,.mp4,.flac,.wav,.m4a,.ogg,video/mp4"
                  className="border-input bg-background file:text-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs"
                />
              </div>
              <div className="flex-1 space-y-1">
                <label className="text-muted-foreground text-xs">歌词（可选）</label>
                <input
                  ref={lrcFileRef}
                  type="file"
                  accept=".lrc,text/plain"
                  className="border-input bg-background file:text-foreground flex h-9 w-full min-w-0 rounded-md border px-3 py-1 text-sm shadow-xs"
                />
              </div>
              <Button type="button" onClick={() => void onPickLocalAudio()}>
                播放所选
              </Button>
            </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
