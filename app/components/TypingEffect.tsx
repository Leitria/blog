'use client'; // 因为使用了 useEffect，需要标记为客户端组件

import React, { useRef, useEffect } from 'react';
import Typed from 'typed.js';

const TypingEffect = () => {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const typed = new Typed(el.current, {
      strings: [
        '年少时，春风得意马蹄疾，不信人间有别离。',
        '收余恨、免娇嗔、且自新、改性情、休恋逝水、苦海回身、早悟兰因。'
      ],
      typeSpeed: 60,
      backSpeed: 40,
      loop: true,
      loopCount: Infinity,
      backDelay: 2000,
      showCursor: false,
    });

    return () => typed.destroy();
  }, []);

  return <div ref={el} className="block box-border w-35 h-18 text-white text-xl font-bold text-center antialiased leading-[26px]"
      style={{
        fontFamily: '楷体, 华文楷体',
        textShadow: 'rgba(0, 0, 0, 0.5) 1px 1px 3px',
      }}></div>;
};

export default TypingEffect;
