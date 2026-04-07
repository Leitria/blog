'use client';

import { useCarousel } from '@/hooks/useCarousel';

interface ControlsProps {
  totalSlides: number;
  currentIndex: number;
  onPrev: () => void;
  onNext: () => void;
  onGoTo: (idx: number) => void;
  isAutoPlaying: boolean;
  onToggleAutoPlay: () => void;
}

export default function Controls({
  totalSlides,
  currentIndex,
  onPrev,
  onNext,
  onGoTo,
  isAutoPlaying,
  onToggleAutoPlay,
}: ControlsProps) {
  return (
    <>
      {/* 左右按钮 */}
      <button
        onClick={onPrev}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition z-20"
        aria-label="上一张"
      >
        ❮
      </button>
      <button
        onClick={onNext}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition z-20"
        aria-label="下一张"
      >
        ❯
      </button>

      {/* 指示点 */}
      <div className="absolute bottom-4 left-0 right-0 flex justify-center items-center gap-2 z-20">
        {Array.from({ length: totalSlides }).map((_, idx) => (
          <button
            key={idx}
            onClick={() => onGoTo(idx)}
            className={`w-3 h-3 rounded-full transition ${
              idx === currentIndex ? 'bg-white scale-125' : 'bg-gray-400'
            }`}
            aria-label={`跳转到第${idx + 1}张`}
          />
        ))}
      </div>

      {/* 自动播放开关 */}
      <button
        onClick={onToggleAutoPlay}
        className="absolute bottom-4 right-4 bg-black/50 hover:bg-black/75 text-white px-3 py-1 rounded-full text-sm transition z-20"
      >
        {isAutoPlaying ? '暂停' : '播放'}
      </button>
    </>
  );
}