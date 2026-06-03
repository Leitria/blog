'use client';

import Image from 'next/image';
import { useCarousel } from '@/hooks/useCarousel';
import BackgroundAnimation from '@/components/FabulousBeasts/BackgroundAnimation';
import Carousel from '@/components/FabulousBeasts/Carousel';
import Controls from '@/components/FabulousBeasts/Controls';
import { CommentSection } from '@/components/comment-section';

const images = Array.from({ length: 11 }, (_, i) => ({
  src: `/images/FabulousBeasts/1/${i + 1}.png`,
  alt: `动漫图片${i + 1}`,
}));

export default function FabulousBeastsPage() {
  const {
    currentIndex,
    nextIndex,
    isAnimating,
    isAutoPlaying,
    goToPrev,
    goToNext,
    goToSlide,
    toggleAutoPlay,
  } = useCarousel({ totalSlides: images.length });

  return (
    <div className="relative flex min-h-screen flex-col">
      <BackgroundAnimation
        currentImage={images[currentIndex]}
        nextImage={nextIndex !== null ? images[nextIndex] : null}
        isAnimating={isAnimating}
      />

      <div className="pointer-events-none fixed inset-0 -z-[5] bg-gradient-to-b from-black/40 via-black/55 to-black/80" />

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-10">
        <header className="mb-8 text-center">
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg md:text-5xl">
            我喜欢的动漫图片
          </h1>
          <p className="mt-2 text-sm text-white/70">
            主图与背景同步淡入淡出，切换更顺滑
          </p>
        </header>

        <Carousel images={images} currentIndex={currentIndex}>
          <Controls
            totalSlides={images.length}
            currentIndex={currentIndex}
            onPrev={goToPrev}
            onNext={goToNext}
            onGoTo={goToSlide}
            isAutoPlaying={isAutoPlaying}
            onToggleAutoPlay={toggleAutoPlay}
          />
        </Carousel>

        <p className="mt-6 text-center text-sm text-white/85">
          {currentIndex + 1} / {images.length}
        </p>

        <div className="mt-10 flex max-w-full justify-start gap-2 overflow-x-auto pb-2 pt-1 [scrollbar-width:thin]">
          {images.map((img, i) => (
            <button
              key={img.src}
              type="button"
              onClick={() => goToSlide(i)}
              className={`relative size-14 overflow-hidden rounded-lg ring-2 transition ${
                i === currentIndex
                  ? 'ring-primary ring-offset-2 ring-offset-black/50'
                  : 'ring-white/20 hover:ring-white/50'
              }`}
              aria-label={`第 ${i + 1} 张`}
            >
              <Image src={img.src} alt="" fill className="object-cover" sizes="56px" />
            </button>
          ))}
        </div>
      </main>

      <CommentSection maxWidthClass="max-w-4xl" className="relative z-10 mt-auto" />
    </div>
  );
}
