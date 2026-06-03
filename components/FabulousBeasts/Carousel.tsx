'use client';

import Image from 'next/image';
import { cn } from '@/lib/utils';

interface CarouselProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  children?: React.ReactNode;
}

export default function Carousel({ images, currentIndex, children }: CarouselProps) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-black/45 shadow-2xl shadow-black/50 backdrop-blur-md">
      <div className="relative aspect-[16/10] w-full md:h-[min(70vh,560px)] md:aspect-auto">
        {images.map((img, idx) => (
          <div
            key={img.src}
            className={cn(
              'absolute inset-0 flex items-center justify-center transition-all duration-500 ease-out',
              idx === currentIndex
                ? 'z-[1] opacity-100'
                : 'z-0 opacity-0 scale-[0.97] blur-[1px]',
            )}
            aria-hidden={idx !== currentIndex}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain p-4 drop-shadow-2xl"
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 90vw, 960px"
            />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}
