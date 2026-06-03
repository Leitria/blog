'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface BackgroundAnimationProps {
  currentImage: { src: string; alt: string } | null;
  nextImage: { src: string; alt: string } | null;
  isAnimating: boolean;
}

/** 全幅背景：旧图淡出 + 新图淡入，避免切块滑动带来的割裂感。 */
export default function BackgroundAnimation({
  currentImage,
  nextImage,
  isAnimating,
}: BackgroundAnimationProps) {
  return (
    <div className="fixed inset-0 -z-10 overflow-hidden bg-neutral-950">
      {currentImage && (
        <div
          key={currentImage.src}
          className={cn(
            'absolute inset-0 transition-[opacity,transform] duration-500 ease-out',
            isAnimating && nextImage ? 'opacity-0 scale-105' : 'opacity-100 scale-100',
          )}
        >
          <Image
            src={currentImage.src}
            alt={currentImage.alt}
            fill
            priority
            className="object-cover blur-[2px]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>
      )}

      {nextImage && isAnimating && (
        <div
          key={nextImage.src}
          className="absolute inset-0 animate-in fade-in zoom-in duration-500 ease-out"
        >
          <Image
            src={nextImage.src}
            alt={nextImage.alt}
            fill
            priority
            className="object-cover blur-[2px]"
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />
        </div>
      )}
    </div>
  );
}
