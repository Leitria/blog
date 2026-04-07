'use client';
import { useEffect } from 'react';

export default function VisitCounter({ slug }: { slug: string }) {
  useEffect(() => {
    fetch(`/api/visits/${slug}`, { method: 'POST' }).catch(console.error);
  }, [slug]);
  return null; // 不显示任何内容，仅用于记录
}