'use client';
import { useState } from 'react';
import CommentsList from '@/features/comments/components/CommentsList';

interface CollapsibleCommentsProps {
  slug: string;
}

export default function CollapsibleComments({ slug }: CollapsibleCommentsProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="mt-6 border-t pt-4">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-1 text-blue-600 hover:underline"
      >
        {isOpen ? '▼ 隐藏评论' : '▶ 查看评论'}
      </button>
      {isOpen && <CommentsList slug={slug} />}
    </div>
  );
}