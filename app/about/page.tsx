"use client";

import { useCarousel } from "@/hooks/useCarousel";
import BackgroundAnimation from "@/components/FabulousBeasts/BackgroundAnimation";
import { CommentSection } from "@/components/comment-section";

const images = Array.from({ length: 11 }, (_, i) => ({
  src: `/images/FabulousBeasts/1/${i + 1}.png`,
  alt: `动漫图片${i + 1}`,
}));

export default function AboutPage() {
  const { currentIndex, nextIndex, isAnimating } = useCarousel({
    totalSlides: images.length,
    autoPlayInterval: 5000,
    defaultAutoPlay: false,
  });

  return (
    <div className="relative flex min-h-screen flex-col text-foreground">
      <BackgroundAnimation
        currentImage={images[currentIndex]}
        nextImage={nextIndex !== null ? images[nextIndex] : null}
        isAnimating={isAnimating}
      />
      <div className="pointer-events-none fixed inset-0 -z-[5] bg-black/55" />

      <main className="relative z-10 mx-auto w-full max-w-4xl flex-1 px-4 py-14">
        <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-md md:text-5xl">
          About Us · leitria
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-white/90">
          欢迎来访。这里是关于页：背景会随轮播图柔和切换，底部为与其他子站一致的评论区。
        </p>
      </main>

      <CommentSection maxWidthClass="max-w-4xl" className="relative z-10 mt-auto" />
    </div>
  );
}
