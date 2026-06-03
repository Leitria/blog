// components/TwikooComment.tsx
import dynamic from 'next/dynamic';
import React from 'react';

const TwikooComment = dynamic(
  () => import('./TwikooCommentCore').catch(err =>{
    console.error('动态导入TwikooCommentCore 失败：',err);
    return () => <div>评论组件加载失败</div>;
  }),  // 注意路径，如果两个文件在同一文件夹下就用 './TwikooCommentCore'
  { ssr: false, loading:() => <div>加载评论中...</div> }
);

export default TwikooComment;