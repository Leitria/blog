'use client';

import Image from 'next/image';

interface BackgroundAnimationProps {
  currentImage: { src: string; alt: string } | null;
  nextImage: { src: string; alt: string } | null;
  isAnimating: boolean;
}

export default function BackgroundAnimation({ currentImage, nextImage, isAnimating }: BackgroundAnimationProps) {
  // 根据列索引计算图片的 object-position，使每列显示图片的不同部分
  const getObjectPosition = (col: number) => {
    // 将图片横向切分为 4 等份，每份居中显示对应区域
    const percent = (col / 3) * 100; // col=0 → 0%, col=1 → 33.33%, col=2 → 66.66%, col=3 → 100%
    return `${percent}% center`;
  };

  return (
    <div className="fixed inset-0 -z-10 overflow-hidden">
      {/* 当前背景层（动画中部分列会移出） */}
      {currentImage && (
        <div className="absolute inset-0 grid grid-cols-4">
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className={`h-full w-full relative ${
                isAnimating && nextImage
                  ? col === 0 || col === 2
                    ? 'animate-slideUpOut'
                    : 'animate-slideDownOut'
                  : ''
              }`}
            >
              <Image
                src={currentImage.src}
                alt={currentImage.alt}
                fill
                priority
                style={{
                  objectFit: 'cover',
                  objectPosition: getObjectPosition(col),
                }}
              />
            </div>
          ))}
        </div>
      )}

      {/* 下一张背景层（动画中移入） */}
      {nextImage && isAnimating && (
        <div className="absolute inset-0 grid grid-cols-4">
          {[0, 1, 2, 3].map((col) => (
            <div
              key={col}
              className={`h-full w-full relative ${
                col === 0 || col === 2 ? 'animate-slideUpIn' : 'animate-slideDownIn'
              }`}
            >
              <Image
                src={nextImage.src}
                alt={nextImage.alt}
                fill
                priority
                style={{
                  objectFit: 'cover',
                  objectPosition: getObjectPosition(col),
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}