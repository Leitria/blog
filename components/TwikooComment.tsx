// components/TwikooComment.tsx
import dynamic from 'next/dynamic';

const TwikooComment = dynamic(
  () => import('./TwikooCommentCore'),  // 注意路径，如果两个文件在同一文件夹下就用 './TwikooCommentCore'
  { ssr: false }
);

export default TwikooComment;