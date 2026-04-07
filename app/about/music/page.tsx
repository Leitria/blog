// app/music/page.tsx (示例页面)
'use client';

import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { useEffect } from 'react';
import CommentsList from '@/features/comments/components/CommentsList';
import LikeButton from '@/features/likes/components/LikeButton';
import VisitCounter from '@/features/visits/components/VisitCounter';
import CollapsibleComments from '@/components/CollapsibleComments';

export default function MusicPage() {
  const { togglePlay, isPlaying } = useAudioPlayer();
  const pageId = 'music'; // 唯一标识
  useEffect(() => {
    // 页面加载时尝试播放
    if (!isPlaying) {
      togglePlay();
    }
  }, []);

  return (
    <>
    <div className="p-8">
      <h1 className="text-2xl">音乐欣赏</h1>
      <p>正在播放...</p>
    </div>
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Your content</h1>
        <LikeButton slug={pageId} />
      </div>
      {/* 文章内容 */}
      <article>{/* ... */}</article>
      <CollapsibleComments slug={pageId} />
      <VisitCounter slug={pageId} /> {/* 不占用视觉空间 */}
    </div>
    </>
    
);
}