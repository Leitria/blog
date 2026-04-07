'use client';

import Image from 'next/image';

interface CarouselProps {
  images: { src: string; alt: string }[];
  currentIndex: number;
  children?: React.ReactNode;
}

export default function Carousel({ images, currentIndex, children }: CarouselProps) {
  return (
    <div className="relative bg-black/40 backdrop-blur-sm rounded-lg overflow-hidden shadow-xl">
      <div className="relative h-[500px] w-full">
        {images.map((img, idx) => (
          <div
            key={idx}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              idx === currentIndex ? 'opacity-100' : 'opacity-0'
            }`}
          >
            <Image
              src={img.src}
              alt={img.alt}
              fill
              className="object-contain"
              priority={idx === 0}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px"
            />
          </div>
        ))}
      </div>
      {children}
    </div>
  );
}