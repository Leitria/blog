import { useState, useEffect, useRef } from 'react';

interface UseCarouselProps {
  totalSlides: number;
  autoPlayInterval?: number;
  animationDuration?: number;
}

export function useCarousel({ totalSlides, autoPlayInterval = 3000, animationDuration = 600 }: UseCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [nextIndex, setNextIndex] = useState<number | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerTransition = (nextIdx: number) => {
    if (isAnimating) return;
    setNextIndex(nextIdx);
    setIsAnimating(true);

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setCurrentIndex(nextIdx);
      setNextIndex(null);
      setIsAnimating(false);
    }, animationDuration);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    const prev = currentIndex === 0 ? totalSlides - 1 : currentIndex - 1;
    triggerTransition(prev);
  };

  const goToNext = () => {
    if (isAnimating) return;
    const next = (currentIndex + 1) % totalSlides;
    triggerTransition(next);
  };

  const goToSlide = (idx: number) => {
    if (isAnimating || idx === currentIndex) return;
    triggerTransition(idx);
  };

  const toggleAutoPlay = () => setIsAutoPlaying(prev => !prev);

  // 自动播放
  useEffect(() => {
    if (!isAutoPlaying || isAnimating) return;
    const interval = setInterval(() => {
      const next = (currentIndex + 1) % totalSlides;
      triggerTransition(next);
    }, autoPlayInterval);
    return () => clearInterval(interval);
  }, [isAutoPlaying, isAnimating, currentIndex, totalSlides, autoPlayInterval]);

  // 清理定时器
  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  return {
    currentIndex,
    nextIndex,
    isAnimating,
    isAutoPlaying,
    goToPrev,
    goToNext,
    goToSlide,
    toggleAutoPlay,
  };
}