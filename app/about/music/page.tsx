'use client';

import MusicExplorer from '@/components/MusicExplorer';
import { CommentSection } from '@/components/comment-section';

export default function MusicPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background text-foreground">
      <div className="mx-auto w-full max-w-3xl flex-1 space-y-8 px-4 py-10">
        <header className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight">音乐欣赏</h1>
          <p className="text-muted-foreground text-sm leading-relaxed">
            全局播放器固定在右下角，切换页面不会中断播放。网易云需自建 API 服务；QQ
            音乐通过官网收听；本机文件仅在本地解码播放。
          </p>
        </header>

        <MusicExplorer />
      </div>
      <CommentSection maxWidthClass="max-w-3xl" className="mt-auto" />
    </div>
  );
}
