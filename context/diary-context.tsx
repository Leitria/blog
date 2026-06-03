'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import type { DiaryEntry } from '@/lib/diary-storage'
import { loadDiaries, saveDiaries, startOfLocalDay } from '@/lib/diary-storage'

export type DiaryContextValue = {
  entries: DiaryEntry[]
  addEntry: (content: string) => void
  /** 有日记的日期（本地日初） */
  daysWithEntries: Date[]
  /** 最近一次写日记所在日，用于日历唯一高亮 */
  latestEntryDay: Date | undefined
}

const DiaryContext = createContext<DiaryContextValue | null>(null)

export function DiaryProvider({ children }: { children: React.ReactNode }) {
  const [entries, setEntries] = useState<DiaryEntry[]>([])
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    setEntries(loadDiaries())
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated) return
    saveDiaries(entries)
  }, [entries, hydrated])

  const addEntry = useCallback((content: string) => {
    const trimmed = content.trim()
    if (!trimmed) return
    const id =
      typeof crypto !== 'undefined' && 'randomUUID' in crypto
        ? crypto.randomUUID()
        : `${Date.now()}-${Math.random().toString(36).slice(2)}`
    const row: DiaryEntry = {
      id,
      content: trimmed,
      createdAt: new Date().toISOString(),
    }
    setEntries((prev) => [row, ...prev])
  }, [])

  const { daysWithEntries, latestEntryDay } = useMemo(() => {
    if (!entries.length) {
      return { daysWithEntries: [] as Date[], latestEntryDay: undefined }
    }
    const sorted = [...entries].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    )
    const latestEntryDay = startOfLocalDay(new Date(sorted[0].createdAt))

    const seen = new Set<string>()
    const daysWithEntries: Date[] = []
    for (const entry of entries) {
      const d = startOfLocalDay(new Date(entry.createdAt))
      const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`
      if (!seen.has(key)) {
        seen.add(key)
        daysWithEntries.push(d)
      }
    }
    return { daysWithEntries, latestEntryDay }
  }, [entries])

  const value = useMemo(
    () => ({ entries, addEntry, daysWithEntries, latestEntryDay }),
    [entries, addEntry, daysWithEntries, latestEntryDay],
  )

  return (
    <DiaryContext.Provider value={value}>{children}</DiaryContext.Provider>
  )
}

export function useDiaries() {
  const ctx = useContext(DiaryContext)
  if (!ctx) throw new Error('useDiaries must be used within DiaryProvider')
  return ctx
}
