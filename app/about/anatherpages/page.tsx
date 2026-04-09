"use client"
import { useCarousel } from '@/hooks/useCarousel';
import Carousel from '@/components/FabulousBeasts/Carousel';
import CommentsList from '@/features/comments/components/CommentsList';
import LikeButton from '@/features/likes/components/LikeButton';
import VisitCounter from '@/features/visits/components/VisitCounter';
import CollapsibleComments from '@/components/CollapsibleComments'; // 上面的折叠组件
import TwikooComment from '@/components/TwikooComment';
// 图片列表（实际路径需确保存在）
const images = Array.from({ length: 11 }, (_, i) => ({
  src: `/images/FabulousBeasts/1/${i + 1}.png`,
  alt: `动漫图片${i + 1}`,
}));
const pageId = 'anatherpages'; // 唯一标识
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
  return(
    <>
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