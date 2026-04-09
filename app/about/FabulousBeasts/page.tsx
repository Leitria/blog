'use client';
import Image from 'next/image';
import { useCarousel } from '@/hooks/useCarousel';
import BackgroundAnimation from '@/components/FabulousBeasts/BackgroundAnimation';
import Carousel from '@/components/FabulousBeasts/Carousel';
import Controls from '@/components/FabulousBeasts/Controls';
import CommentsList from '@/features/comments/components/CommentsList';
import LikeButton from '@/features/likes/components/LikeButton';
import VisitCounter from '@/features/visits/components/VisitCounter';
import CollapsibleComments from '@/components/CollapsibleComments';
import TwikooComment from '@/components/TwikooComment';

// 图片列表，不再需要 width/height
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
  const pageId = 'fabulous-beasts'; // 唯一标识

  return (
    <>
      <BackgroundAnimation
        currentImage={images[currentIndex]}
        nextImage={nextIndex !== null ? images[nextIndex] : null}
        isAnimating={isAnimating}
      />

      <div className="fixed inset-0 -z-5 bg-black/50" />

      <div className="min-h-screen py-8 px-4 relative z-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold text-center mb-8 text-white drop-shadow-lg">
            我喜欢的动漫图片
          </h1>

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

          <p className="text-center mt-4 text-white">
            {currentIndex + 1} / {images.length}
          </p>
        </div>
      </div>

      {/* 动画样式保持不变 */}
      <style jsx global>{`
        @keyframes slideUpOut {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(-100%); opacity: 0; }
        }
        @keyframes slideDownOut {
          0% { transform: translateY(0); opacity: 1; }
          100% { transform: translateY(100%); opacity: 0; }
        }
        @keyframes slideUpIn {
          0% { transform: translateY(100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        @keyframes slideDownIn {
          0% { transform: translateY(-100%); opacity: 0; }
          100% { transform: translateY(0); opacity: 1; }
        }
        .animate-slideUpOut { animation: slideUpOut 0.6s ease forwards; }
        .animate-slideDownOut { animation: slideDownOut 0.6s ease forwards; }
        .animate-slideUpIn { animation: slideUpIn 0.6s ease forwards; }
        .animate-slideDownIn { animation: slideDownIn 0.6s ease forwards; }
      `}</style>
      <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your content</h1>
              <LikeButton slug={pageId} />
            </div>
            {/* 文章内容 */}
            <article>
              {/* ... */}
              <TwikooComment />
              </article>
            <CollapsibleComments slug={pageId} />
            <VisitCounter slug={pageId} /> {/* 不占用视觉空间 */}
          </div>
    </>

  );
}