// components/TwikooCommentCore.tsx
'use client';

import { useEffect, useRef } from 'react';
declare const twikoo: any;

export default function TwikooCommentCore() {
  const commentRef = useRef<HTMLDivElement>(null);
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current || !commentRef.current) return;
    initialized.current = true;

    const script = document.createElement('script');
    script.src = 'https://unpkg.com/twikoo@1.6.39/dist/twikoo.all.min.js';
    script.async = true;

    script.onload = () => {
      if (window.twikoo) {
        window.twikoo.init({
          envId: process.env.NEXT_PUBLIC_TWIKOO_ENV_ID!,
          el: commentRef.current,
        });
      } else {
        console.error('Twikoo CDN 加载成功但 window.twikoo 不存在');
      }
    };

    script.onerror = (err) => {
      console.error('Twikoo CDN 脚本加载失败:', err);
    };

    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return (
    <div
      ref={commentRef}
      className="min-h-[220px] w-full rounded-lg border border-border/60 bg-muted/10 px-1 py-2"
    />
  );
}

  