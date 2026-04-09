'use client';

import { useEffect, useRef } from 'react';
import twikoo from 'twikoo/dist/twikoo.min.js'; // 或使用 'twikoo/dist/twikoo.min.js'

export default function TwikooComment() {
  const commentRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !commentRef.current) return;

    twikoo.init({
      envId: process.env.NEXT_PUBLIC_TWIKOO_ENV_ID!, // 从环境变量读取后端地址
      el: commentRef.current,
      // 可选：如果文章路径不是 location.pathname，可以传 path 参数
      // path: window.location.pathname,
    })
      .then(() => {
        initialized.current = true;
      })
      .catch((err:Error) => {
        console.error('Twikoo 初始化失败:', err);
      });
  }, []);

  return <div ref={commentRef} />;
}