// context/AudioPlayerContext.tsx
'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

export interface TrackInfo {
  audioSrc: string;
  lyricsSrc?: string;
  lyricsText?: string;
  title?: string;
  artist?: string;
  /** 若为 true，切歌后自动播放 */
  autoplay?: boolean;
  /** 用 createObjectURL 得到的地址，切歌时由播放器统一 revoke */
  managedBlobUrl?: string;
}

export type LocalPlayMode = 'ordered' | 'shuffle' | 'repeat-one';

export interface LocalQueueItem {
  blobUrl: string;
  title: string;
  /** 用于列表展示：含相对路径时更接近资源管理器顺序 */
  label: string;
}

export interface LoadTrackOptions {
  /** 不 revoke 已有 blob（本地队列内切歌） */
  keepManagedBlobs?: boolean;
  /** 不清空本地队列与当前下标（由调用方维护下标） */
  keepLocalQueueState?: boolean;
}

interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  lyrics: { time: number; text: string }[];
  currentLyric: string;
  activeLyricIndex: number;
  track: TrackInfo | null;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  showLyrics: boolean;
  setShowLyrics: (show: boolean) => void;
  loadTrack: (info: TrackInfo, opts?: LoadTrackOptions) => Promise<void>;
  localPlayMode: LocalPlayMode;
  setLocalPlayMode: (mode: LocalPlayMode) => void;
  localQueue: LocalQueueItem[] | null;
  localQueueIndex: number;
  loadLocalFolder: (files: FileList | File[]) => Promise<number>;
  playLocalQueueAt: (index: number) => Promise<void>;
  skipLocalQueue: (delta: -1 | 1) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

function isPlayableMediaFile(f: File): boolean {
  if (/\.(mp3|mp4)$/i.test(f.name)) return true;
  const t = f.type.toLowerCase();
  return t === 'audio/mpeg' || t === 'audio/mp4' || t === 'video/mp4';
}

function sortFolderFiles(files: File[]): File[] {
  return [...files].sort((a, b) => {
    const pa =
      (a as File & { webkitRelativePath?: string }).webkitRelativePath ?? a.name;
    const pb =
      (b as File & { webkitRelativePath?: string }).webkitRelativePath ?? b.name;
    return pa.localeCompare(pb, undefined, { numeric: true, sensitivity: 'base' });
  });
}

type QueueSnap = {
  queue: LocalQueueItem[] | null;
  index: number;
  mode: LocalPlayMode;
};

export function AudioPlayerProvider({
  children,
  audioSrc: initialAudioSrc,
  lyricsSrc: initialLyricsSrc,
}: {
  children: React.ReactNode;
  audioSrc: string;
  lyricsSrc?: string;
}) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const objectUrlsRef = useRef<Set<string>>(new Set());
  const localQueueRef = useRef<LocalQueueItem[] | null>(null);
  const localQueueIndexRef = useRef(0);
  const queueSnapRef = useRef<QueueSnap>({ queue: null, index: 0, mode: 'ordered' });
  const playLocalQueueAtRef = useRef<(index: number) => Promise<void>>(async () => {});

  const [audioSrc, setAudioSrc] = useState(initialAudioSrc);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const [activeLyricIndex, setActiveLyricIndex] = useState(-1);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [showLyrics, setShowLyrics] = useState(true);
  const [track, setTrack] = useState<TrackInfo | null>({
    audioSrc: initialAudioSrc,
    lyricsSrc: initialLyricsSrc,
    title: undefined,
    artist: undefined,
  });

  const [localQueue, setLocalQueue] = useState<LocalQueueItem[] | null>(null);
  const [localQueueIndex, setLocalQueueIndex] = useState(0);
  const [localPlayMode, setLocalPlayModeState] = useState<LocalPlayMode>('ordered');

  const lyricsRef = useRef<{ time: number; text: string }[]>([]);
  useEffect(() => {
    lyricsRef.current = lyrics;
  }, [lyrics]);

  useEffect(() => {
    localQueueRef.current = localQueue;
  }, [localQueue]);

  useEffect(() => {
    localQueueIndexRef.current = localQueueIndex;
  }, [localQueueIndex]);

  useEffect(() => {
    queueSnapRef.current = {
      queue: localQueue,
      index: localQueueIndex,
      mode: localPlayMode,
    };
  }, [localQueue, localQueueIndex, localPlayMode]);

  const setLocalPlayMode = useCallback((mode: LocalPlayMode) => {
    setLocalPlayModeState(mode);
    queueSnapRef.current = { ...queueSnapRef.current, mode };
  }, []);

  const revokeManagedUrls = useCallback(() => {
    objectUrlsRef.current.forEach((u) => URL.revokeObjectURL(u));
    objectUrlsRef.current.clear();
  }, []);

  const applyLyrics = useCallback((text: string) => {
    setLyrics(parseLRC(text));
  }, []);

  const applyMedia = useCallback(
    async (info: TrackInfo) => {
      const audio = audioRef.current;
      if (!audio) return;

      setTrack(info);
      setAudioSrc(info.audioSrc);
      setCurrentTime(0);
      setDuration(0);
      setCurrentLyric('');
      setActiveLyricIndex(-1);

      if (info.lyricsText) {
        applyLyrics(info.lyricsText);
      } else if (info.lyricsSrc) {
        try {
          const res = await fetch(info.lyricsSrc);
          const t = await res.text();
          applyLyrics(t);
        } catch {
          setLyrics([]);
        }
      } else {
        setLyrics([]);
      }

      audio.src = info.audioSrc;
      audio.load();

      if (info.autoplay !== false) {
        try {
          await audio.play();
        } catch {
          setIsPlaying(false);
        }
      } else {
        setIsPlaying(false);
      }
    },
    [applyLyrics],
  );

  const loadTrack = useCallback(
    async (info: TrackInfo, opts?: LoadTrackOptions) => {
      const keep = Boolean(opts?.keepManagedBlobs && opts?.keepLocalQueueState);

      if (!keep) {
        revokeManagedUrls();
        setLocalQueue(null);
        setLocalQueueIndex(0);
        localQueueRef.current = null;
        localQueueIndexRef.current = 0;
        queueSnapRef.current = { queue: null, index: 0, mode: queueSnapRef.current.mode };
        if (info.managedBlobUrl) objectUrlsRef.current.add(info.managedBlobUrl);
      } else if (info.managedBlobUrl && !objectUrlsRef.current.has(info.managedBlobUrl)) {
        objectUrlsRef.current.add(info.managedBlobUrl);
      }

      await applyMedia(info);
    },
    [applyMedia, revokeManagedUrls],
  );

  const playLocalQueueAt = useCallback(
    async (index: number) => {
      const q = localQueueRef.current;
      if (!q || index < 0 || index >= q.length) return;
      const item = q[index];
      setLocalQueueIndex(index);
      localQueueIndexRef.current = index;
      queueSnapRef.current = {
        queue: q,
        index,
        mode: queueSnapRef.current.mode,
      };
      await loadTrack(
        {
          audioSrc: item.blobUrl,
          title: item.title,
          artist: '本地文件夹',
          managedBlobUrl: item.blobUrl,
          autoplay: true,
        },
        { keepManagedBlobs: true, keepLocalQueueState: true },
      );
    },
    [loadTrack],
  );

  useEffect(() => {
    playLocalQueueAtRef.current = playLocalQueueAt;
  }, [playLocalQueueAt]);

  const loadLocalFolder = useCallback(
    async (files: FileList | File[]): Promise<number> => {
      const list = sortFolderFiles(Array.from(files)).filter(isPlayableMediaFile);
      if (!list.length) return 0;

      revokeManagedUrls();
      const items: LocalQueueItem[] = list.map((f) => {
        const blobUrl = URL.createObjectURL(f);
        objectUrlsRef.current.add(blobUrl);
        const rel = (f as File & { webkitRelativePath?: string }).webkitRelativePath;
        return {
          blobUrl,
          title: f.name.replace(/\.[^.]+$/i, ''),
          label: rel && rel.length ? rel : f.name,
        };
      });

      localQueueRef.current = items;
      setLocalQueue(items);
      queueSnapRef.current = {
        queue: items,
        index: 0,
        mode: queueSnapRef.current.mode,
      };

      await playLocalQueueAt(0);
      return items.length;
    },
    [playLocalQueueAt, revokeManagedUrls],
  );

  const skipLocalQueue = useCallback(
    (delta: -1 | 1) => {
      const q = localQueueRef.current;
      if (!q?.length) return;
      const n = q.length;
      const idx = (localQueueIndexRef.current + delta + n) % n;
      void playLocalQueueAt(idx);
    },
    [playLocalQueueAt],
  );

  /** 从布局传入的默认曲目仅在首次挂载时同步 */
  const didInit = useRef(false);
  useEffect(() => {
    if (didInit.current) return;
    didInit.current = true;
    void loadTrack({
      audioSrc: initialAudioSrc,
      lyricsSrc: initialLyricsSrc,
      autoplay: false,
    });
  }, [initialAudioSrc, initialLyricsSrc, loadTrack]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      const prev = lyricsRef.current;
      if (!prev.length) {
        setCurrentLyric('');
        setActiveLyricIndex(-1);
        return;
      }
      let idx = -1;
      for (let i = prev.length - 1; i >= 0; i--) {
        if (prev[i].time <= audio.currentTime) {
          idx = i;
          break;
        }
      }
      setActiveLyricIndex(idx);
      setCurrentLyric(idx >= 0 ? prev[idx].text : '');
    };

    const onLoadedMetadata = () =>
      setDuration(Number.isFinite(audio.duration) ? audio.duration : 0);

    const onEnded = () => {
      setIsPlaying(false);
      const snap = queueSnapRef.current;
      const { queue, index, mode } = snap;
      if (!queue?.length) return;

      if (mode === 'repeat-one') {
        audio.currentTime = 0;
        void audio.play();
        return;
      }

      let nextIndex: number;
      if (mode === 'shuffle') {
        if (queue.length === 1) {
          nextIndex = 0;
        } else {
          do {
            nextIndex = Math.floor(Math.random() * queue.length);
          } while (nextIndex === index);
        }
      } else {
        nextIndex = index + 1;
        if (nextIndex >= queue.length) return;
      }

      void playLocalQueueAtRef.current(nextIndex);
    };

    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('play', onPlay);
    audio.addEventListener('pause', onPause);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('play', onPlay);
      audio.removeEventListener('pause', onPause);
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audioSrc) return;
    if (audio.paused) {
      void audio.play().catch(() => setIsPlaying(false));
    } else {
      audio.pause();
    }
  }, [audioSrc]);

  const seekTo = useCallback((time: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = time;
    setCurrentTime(time);
  }, []);

  const ctx: AudioPlayerContextType = {
    isPlaying,
    currentTime,
    duration,
    volume,
    lyrics,
    currentLyric,
    activeLyricIndex,
    track,
    togglePlay,
    seekTo,
    setVolume,
    showLyrics,
    setShowLyrics,
    loadTrack,
    localPlayMode,
    setLocalPlayMode,
    localQueue,
    localQueueIndex,
    loadLocalFolder,
    playLocalQueueAt,
    skipLocalQueue,
  };

  return (
    <AudioPlayerContext.Provider value={ctx}>
      <audio ref={audioRef} src={audioSrc} preload="metadata" />
      {children}
    </AudioPlayerContext.Provider>
  );
}

export function parseLRC(lrcText: string): { time: number; text: string }[] {
  const lines = lrcText.split(/\n/);
  const result: { time: number; text: string }[] = [];
  const timeTag = /\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g;

  for (const line of lines) {
    const times: number[] = [];
    let m: RegExpExecArray | null;
    const re = new RegExp(timeTag.source, 'g');
    while ((m = re.exec(line)) !== null) {
      const minutes = parseInt(m[1], 10);
      const seconds = parseInt(m[2], 10);
      const frac =
        m[3].length === 3 ? parseInt(m[3], 10) / 1000 : parseInt(m[3], 10) / 100;
      times.push(minutes * 60 + seconds + frac);
    }
    if (!times.length) continue;
    const text = line.replace(/\[(\d{2}):(\d{2})[.:](\d{2,3})\]/g, '').trim();
    if (!text) continue;
    for (const t of times) result.push({ time: t, text });
  }
  return result.sort((a, b) => a.time - b.time);
}

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
}
