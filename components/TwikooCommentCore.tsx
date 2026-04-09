// components/TwikooCommentCore.tsx
'use client';

import { useEffect, useRef } from 'react';
declare const twikoo: any;

export default function TwikooCommentCore() {
  const commentRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);
  useEffect(() => {
    // 防止重复初始化
    if (initialized.current || !commentRef.current) return;
    initialized.current = true;

    // 动态加载 twikoo 的 JS 文件（注意路径使用 dist 版本）
    import('twikoo/dist/twikoo.min.js').then((module) => {
      const twikooFn = module.default || module;
      if (twikooFn && typeof twikooFn.init === 'function'){
         twikooFn.init({
          envId: process.env.NEXT_PUBLIC_TWIKOO_ENV_ID, // 你的后端地址
          el: commentRef.current,
        });
      }else {
        console.error("Twikoo 加载失败：未找到init方法");
      }
      })
      .catch((err) => {
        console.error('Twikoo 加载失败:', err);
      });
  }, []);

  return <div ref={commentRef} />;
}