'use client'

import { cn } from '@/lib/utils'
import TwikooComment from '@/components/TwikooComment'

type CommentSectionProps = {
  className?: string
  /** 外层容器最大宽度，与各 about 子页内容区对齐 */
  maxWidthClass?: string
}

/** 评论区统一放在页面底部，样式参考 `/about/music` 与博文页。 */
export function CommentSection({
  className,
  maxWidthClass = 'max-w-4xl',
}: CommentSectionProps) {
  return (
    <section
      className={cn(
        'mx-auto w-full px-4 pb-12 pt-10',
        maxWidthClass,
        className,
      )}
    >
      <div className="rounded-xl border border-border/80 bg-card/80 p-6 shadow-sm backdrop-blur-sm">
        <h2 className="mb-4 text-lg font-semibold tracking-tight text-foreground">
          评论
        </h2>
        <TwikooComment />
      </div>
    </section>
  )
}
