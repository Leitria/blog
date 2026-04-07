'use client';
import { useComments } from '../hooks/useComments';
import CommentForm from './CommentForm';
//前端组件：features/comments/components/CommentsList.tsx
export default function CommentsList({ slug }: { slug: string }) {
  const { comments, addComment, isLoading } = useComments(slug);

  return (
    <div className="mt-8">
      <h2 className="text-xl font-bold">Comments</h2>
      {isLoading && <p>Loading...</p>}
      <div className="space-y-4 mt-4">
        {comments?.map((comment) => (
          <div key={comment.id} className="border p-3 rounded">
            <div className="font-bold">{comment.user?.login || 'Anonymous'}</div>
            <div className="mt-1">{comment.body}</div>
          </div>
        ))}
      </div>
      <CommentForm onSubmit={addComment} />
    </div>
  );
}