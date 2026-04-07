'use client';

import { useState, useEffect } from 'react';

interface LikeButtonProps {
  slug: string; // 文章的唯一标识符（如文件名、slug）
}

export default function LikeButton({ slug }: LikeButtonProps) {
  const [count, setCount] = useState<number | null>(null);
  const [hasLiked, setHasLiked] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // 加载点赞数和本地状态
  useEffect(() => {
    // 获取当前点赞数
    fetch(`/api/likes/${slug}`)
      .then((res) => res.json())
      .then((data) => setCount(data.count))
      .catch(() => setError('获取点赞数失败'));

    // 检查本地存储是否已点赞
    const likedPosts = JSON.parse(localStorage.getItem('liked-posts') || '[]');
    setHasLiked(likedPosts.includes(slug));
  }, [slug]);

  const handleLike = async () => {
    if (isLoading) return;
    if (hasLiked) {
      // 这里可以决定是否允许取消点赞，如果不允许则直接返回
      setError('你已经点过赞啦！');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/likes/${slug}`, { method: 'POST' });
      const data = await res.json();
      setCount(data.count);
      setHasLiked(true);

      // 存储到 localStorage
      const likedPosts = JSON.parse(localStorage.getItem('liked-posts') || '[]');
      localStorage.setItem('liked-posts', JSON.stringify([...likedPosts, slug]));
    } catch {
      setError('点赞失败，请稍后重试');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={handleLike}
        disabled={isLoading}
        className={`flex items-center gap-1 px-3 py-1.5 rounded-full border transition-all
          ${hasLiked 
            ? 'bg-red-50 text-red-600 border-red-200' 
            : 'bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100'
          } disabled:opacity-50 disabled:cursor-not-allowed`}
      >
        <span className="text-lg">{hasLiked ? '❤️' : '🤍'}</span>
        <span className="font-medium">
          {isLoading ? '...' : (count !== null ? count : '加载中')}
        </span>
      </button>
      {error && <span className="text-xs text-red-500">{error}</span>}
    </div>
  );
}