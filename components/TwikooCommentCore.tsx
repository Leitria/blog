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
     // 显式指定使用精简版本
  import('twikoo/dist/twikoo.min.js')
    .then((twikooModule) => {
      const twikoo = twikooModule.default || twikooModule;
      if (twikoo && typeof twikoo.init === 'function') {
        twikoo.init({
          envId: process.env.NEXT_PUBLIC_TWIKOO_ENV_ID!,
          el: commentRef.current,
        });
      } else {
        console.error('Twikoo 模块加载失败或未找到 init 方法', twikoo);
      }
    })
    .catch((err) => {
      console.error('Twikoo 模块导入错误:', err);
    });
  }, []);

  return <div ref={commentRef} />;
}