'use client'

import { useState } from 'react'
import { PenLine } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Textarea } from '@/components/ui/textarea'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useDiaries } from '@/context/diary-context'

export function BlogPageCenter({ children }: { children: React.ReactNode }) {
  const { entries, addEntry } = useDiaries()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState('')

  const submit = () => {
    addEntry(draft)
    setDraft('')
    setOpen(false)
  }

  return (
    <div className="flex min-h-0 min-w-0 flex-1 flex-col border-r border-border/60 bg-gradient-to-b from-background to-muted/20">
      <header className="shrink-0 border-b border-border/60 bg-background/90 px-6 py-5 backdrop-blur-md">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
              Archives
            </p>
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              博文与手记
            </h1>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              左侧为文章列表，下方为本地保存的日记；写日记后右侧日历会标记日期，并以「最近一次」所在日高亮。
            </p>
          </div>
          <Button
            type="button"
            onClick={() => setOpen(true)}
            className="gap-2 shadow-md"
          >
            <PenLine className="size-4" />
            写日记
          </Button>
        </div>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6">
        {children}

        <section className="mt-10 border-t border-border/60 pt-8">
          <div className="mb-4 flex items-center justify-between gap-2">
            <h2 className="text-lg font-semibold text-foreground">日记</h2>
            <span className="text-xs text-muted-foreground">
              共 {entries.length} 条 · 自新到旧
            </span>
          </div>

          {entries.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border/80 bg-muted/30 px-4 py-8 text-center text-sm text-muted-foreground">
              还没有日记，点击右上角「写日记」开始记录。
            </p>
          ) : (
            <ScrollArea className="h-[min(420px,calc(100vh-320px))] pr-3">
              <ul className="space-y-3 pb-2">
                {entries.map((e) => (
                  <li
                    key={e.id}
                    className="rounded-xl border border-border/70 bg-card/90 p-4 shadow-sm"
                  >
                    <time className="text-xs text-muted-foreground">
                      {new Date(e.createdAt).toLocaleString('zh-CN', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                    <p className="mt-2 whitespace-pre-wrap text-sm leading-relaxed text-foreground">
                      {e.content}
                    </p>
                  </li>
                ))}
              </ul>
            </ScrollArea>
          )}
        </section>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>写一篇日记</DialogTitle>
          </DialogHeader>
          <Textarea
            value={draft}
            onChange={(ev) => setDraft(ev.target.value)}
            placeholder="今天的心情、琐事、灵感……"
            rows={8}
            className="resize-y"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              取消
            </Button>
            <Button type="button" onClick={submit} disabled={!draft.trim()}>
              保存
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
