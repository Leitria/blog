"use client"

import { useMemo, useState } from "react"
import { Search, Grid2x2, MapPin, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Calendar } from "@/components/ui/calendar"
import { cn } from "@/lib/utils"
import { useDiaries } from "@/context/diary-context"

const categories = [
  { name: "生活日常", count: 46, color: "bg-pink-400/20 border-l-pink-400" },
  { name: "干货分享", count: 11, color: "bg-purple-400/20 border-l-purple-400" },
  { name: "技术工具", count: 11, color: "bg-amber-400/20 border-l-amber-400" },
  { name: "想法碎片", count: 8, color: "bg-cyan-400/20 border-l-cyan-400" },
]

const tags = [
  { name: "日常小结", count: 42 },
  { name: "博客建站", count: 14 },
]

export function RightSidebar() {
  const { daysWithEntries, latestEntryDay } = useDiaries()
  const [month, setMonth] = useState(() => new Date())

  const modifiers = useMemo(() => {
    const m: Record<string, Date[]> = {
      hasDiary: daysWithEntries,
    }
    if (latestEntryDay) {
      m.latestUpdate = [latestEntryDay]
    }
    return m
  }, [daysWithEntries, latestEntryDay])

  const modifiersClassNames = useMemo(
    () => ({
      hasDiary:
        "relative after:absolute after:bottom-1 after:left-1/2 after:h-1 after:w-1 after:-translate-x-1/2 after:rounded-full after:bg-primary/90 after:content-['']",
      latestUpdate:
        "z-[1] bg-primary/20 font-semibold text-foreground ring-2 ring-primary ring-offset-2 ring-offset-background data-[today=true]:bg-primary/25",
    }),
    [],
  )

  return (
    <aside
      className={cn(
        "w-[min(100%,20rem)] shrink-0 overflow-y-auto border-l border-border/60",
        "bg-gradient-to-b from-muted/30 via-background to-background p-6",
      )}
    >
      <div className="mb-8">
        <label className="mb-2 block text-xs font-medium uppercase tracking-wide text-muted-foreground">
          搜索
        </label>
        <div className="relative">
          <Input
            placeholder="输入关键词…"
            className="border-border/80 bg-card/90 pr-10 shadow-sm"
          />
          <Search className="absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        </div>
      </div>

      <div className="mb-8 rounded-2xl border border-border/70 bg-card/70 p-4 shadow-sm backdrop-blur-sm">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="size-4 text-primary" />
          <h3 className="text-sm font-semibold text-foreground">日历与更新</h3>
        </div>
        <p className="mb-3 text-xs leading-relaxed text-muted-foreground">
          有小圆点的日期写过日记；<span className="text-foreground">描边高亮</span>
          仅表示「最近一次保存日记」的那一天，新写一篇后会移到新日期。
        </p>
        <div className="flex justify-center overflow-x-auto">
          <Calendar
            month={month}
            onMonthChange={setMonth}
            showOutsideDays
            className="rounded-xl border border-border/50 bg-background/80 p-2 shadow-inner [--cell-size:2.25rem]"
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
          />
        </div>
      </div>

      <div className="mb-8">
        <div className="mb-4 flex items-center gap-2">
          <Grid2x2 className="size-5 text-foreground" />
          <h3 className="font-medium text-foreground">分类</h3>
        </div>

        <div className="grid grid-cols-2 gap-2">
          {categories.map((cat) => (
            <button
              key={cat.name}
              type="button"
              className={cn(
                "rounded-lg border-l-4 px-3 py-2.5 text-left text-sm transition hover:opacity-90",
                cat.color,
              )}
            >
              <span className="text-foreground">{cat.name}</span>
              <span className="ml-1 text-muted-foreground">{cat.count}</span>
            </button>
          ))}
        </div>
      </div>

      <div>
        <div className="mb-4 flex items-center gap-2">
          <MapPin className="size-5 text-foreground" />
          <h3 className="font-medium text-foreground">标签云</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {tags.map((tag) => (
            <button
              key={tag.name}
              type="button"
              className="rounded-full bg-muted/60 px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-muted"
            >
              {tag.name}{" "}
              <span className="text-muted-foreground">{tag.count}</span>
            </button>
          ))}
        </div>
      </div>
    </aside>
  )
}
