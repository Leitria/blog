"use client"
import { useCarousel } from '@/hooks/useCarousel';
import BackgroundAnimation from '@/components/FabulousBeasts/BackgroundAnimation';
import CommentsList from '@/features/comments/components/CommentsList';
import LikeButton from '@/features/likes/components/LikeButton';
import VisitCounter from '@/features/visits/components/VisitCounter';
import CollapsibleComments from '@/components/CollapsibleComments';
// 图片列表（实际路径需确保存在）
const images = Array.from({ length: 11 }, (_, i) => ({
  src: `/images/FabulousBeasts/1/${i + 1}.png`,
  alt: `动漫图片${i + 1}`,
}));
const pageId = 'main-page'; // 唯一标识
export default function AboutPage() {
   const {
    currentIndex,
    nextIndex,
    isAnimating,
  } = useCarousel({ totalSlides: images.length });
  return (
    <>
    <h1>About Us,leitria</h1>;
      {/* 背景动画 */}
      <BackgroundAnimation
        currentImage={images[currentIndex]}
        nextImage={nextIndex !== null ? images[nextIndex] : null}
        isAnimating={isAnimating}
      />
      <div className="max-w-3xl mx-auto px-4 py-8">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-3xl font-bold">Your content</h1>
              <LikeButton slug={pageId} />
            </div>
            {/* 文章内容 */}
            <article>{/* ... */}</article>
            <CollapsibleComments slug={pageId} />
            <VisitCounter slug={pageId} /> {/* 不占用视觉空间 */}
          </div>
    </> 
    
  );
}