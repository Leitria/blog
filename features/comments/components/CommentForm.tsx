'use client';

import { useState } from 'react';

interface CommentFormProps {
  onSubmit: (author: string, content: string) => Promise<void>;
}

export default function CommentForm({ onSubmit }: CommentFormProps) {
  const [author, setAuthor] = useState('');
  const [content, setContent] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!author.trim() || !content.trim()) {
      setError('请填写昵称和评论内容');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onSubmit(author.trim(), content.trim());
      // 清空表单（保留昵称可选，这里清空内容和昵称，也可以只清空内容）
      setContent('');
      // 如果想保留昵称，可以把下面这行注释掉
      setAuthor('');
    } catch (err) {
      setError('提交失败，请稍后重试');
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mt-6 border-t pt-4">
      <h3 className="text-lg font-semibold mb-3">发表评论</h3>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div>
          <label htmlFor="author" className="block text-sm font-medium text-gray-700 mb-1">
            昵称 *
          </label>
          <input
            type="text"
            id="author"
            value={author}
            onChange={(e) => setAuthor(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="如何称呼您？"
            disabled={isSubmitting}
            required
          />
        </div>
        <div>
          <label htmlFor="content" className="block text-sm font-medium text-gray-700 mb-1">
            评论内容 *
          </label>
          <textarea
            id="content"
            rows={3}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="写下您的想法..."
            disabled={isSubmitting}
            required
          />
        </div>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          disabled={isSubmitting}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? '提交中...' : '提交评论'}
        </button>
      </form>
    </div>
  );
}