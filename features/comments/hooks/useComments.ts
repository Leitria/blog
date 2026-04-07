import { useState, useEffect,useCallback } from 'react';
//自定义 Hook：features/comments/hooks/useComments.ts
interface Comment {
  id: string;
  user?: { login: string };
  body: string;
  created_at?: string;
}

export function useComments(slug: string) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/comments/${slug}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `HTTP ${res.status}`);
      setComments(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err.message);
      setComments([]);
    } finally {
      setIsLoading(false);
    }
  }, [slug]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  const addComment = async (author: string, content: string) => {
    try {
      const res = await fetch(`/api/comments/${slug}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ author, content }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '提交失败');
      // 重新拉取评论
      await fetchComments();
    } catch (err: any) {
      console.error(err);
      throw err;
    }
  };

  return { comments, isLoading, error, addComment };
}