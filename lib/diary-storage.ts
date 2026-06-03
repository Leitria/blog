/** 日记统一存储在 localStorage，键名固定，便于迁移或备份。 */
export const DIARY_STORAGE_KEY = 'leitria-diaries-v1'

export type DiaryEntry = {
  id: string
  content: string
  createdAt: string
}

export function loadDiaries(): DiaryEntry[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = localStorage.getItem(DIARY_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as DiaryEntry[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveDiaries(entries: DiaryEntry[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(DIARY_STORAGE_KEY, JSON.stringify(entries))
}

export function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}
