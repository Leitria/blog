"use client";
import Link from 'next/link';
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import Typed from 'typed.js';
import TypingEffect from './components/TypingEffect';

// ---------- 音频播放器 Context 定义 ----------
interface AudioPlayerContextType {
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  lyrics: { time: number; text: string }[];
  currentLyric: string;
  togglePlay: () => void;
  seekTo: (time: number) => void;
  setVolume: (vol: number) => void;
  showLyrics: boolean;
  setShowLyrics: (show: boolean) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

// 解析 LRC 歌词的辅助函数
function parseLRC(lrcText: string): { time: number; text: string }[] {
  const lines = lrcText.split('\n');
  const result: { time: number; text: string }[] = [];
  const timeRegex = /\[(\d{2}):(\d{2})\.(\d{2})\]/;
  for (const line of lines) {
    const match = timeRegex.exec(line);
    if (match) {
      const minutes = parseInt(match[1]);
      const seconds = parseInt(match[2]);
      const milliseconds = parseInt(match[3]);
      const time = minutes * 60 + seconds + milliseconds / 100;
      const text = line.replace(timeRegex, '').trim();
      if (text) result.push({ time, text });
    }
  }
  return result.sort((a, b) => a.time - b.time);
}

// 播放器 Provider 组件
export function AudioPlayerProvider({ children, audioSrc, lyricsSrc }: { children: React.ReactNode; audioSrc: string; lyricsSrc?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const [showLyrics, setShowLyrics] = useState(true);

  // 音频初始化
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioSrc;
    audio.load();
    audio.volume = volume;

    const onTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      // 更新当前歌词
      if (lyrics.length) {
        const current = [...lyrics].reverse().find(l => l.time <= audio.currentTime);
        setCurrentLyric(current?.text || '');
      }
    };
    const onLoadedMetadata = () => setDuration(audio.duration);
    const onEnded = () => setIsPlaying(false);
    const onError = (e: Event) => console.error('Audio error:', e);
    const onCanPlayThrough = () => console.log('Audio ready');

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);
    audio.addEventListener('error', onError);
    audio.addEventListener('canplaythrough', onCanPlayThrough);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
      audio.removeEventListener('error', onError);
      audio.removeEventListener('canplaythrough', onCanPlayThrough);
      audio.pause();
      audio.src = '';
    };
  }, [audioSrc, volume, lyrics]); // 注意依赖 lyrics，以便歌词更新时重新绑定

  // 音量同步
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  // 加载歌词
  useEffect(() => {
    if (lyricsSrc) {
      fetch(lyricsSrc)
        .then(res => res.text())
        .then(lrcText => setLyrics(parseLRC(lrcText)))
        .catch(console.error);
    }
  }, [lyricsSrc]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play().catch(e => console.error('Play failed:', e));
      }
      setIsPlaying(!isPlaying);
    }
  };

  const seekTo = (time: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = time;
      setCurrentTime(time);
    }
  };

  return (
    <AudioPlayerContext.Provider
      value={{
        isPlaying,
        currentTime,
        duration,
        volume,
        lyrics,
        currentLyric,
        togglePlay,
        seekTo,
        setVolume,
        showLyrics,
        setShowLyrics,
      }}
    >
      <audio ref={audioRef} preload="auto" />
      {children}
    </AudioPlayerContext.Provider>
  );
}

// 自定义 hook，方便组件中使用播放器状态
export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
}

// ---------- 主页组件 ----------
export default function Home() {
  const links = [
    { href: "/about", label: "About", hint: "关于" },
    { href: "/about/FabulousBeasts", label: "Fabulous Beasts", hint: "图集" },
    { href: "/about/anatherpages", label: "anatherpages", hint: "杂页" },
    { href: "/about/music", label: "music", hint: "音乐" },
    { href: "/about/pages", label: "page", hint: "博文与日记" },
    { href: "/about/trick", label: "trick", hint: "wechat trick" },
  ];

  return (
    <div className="relative min-h-screen w-full overflow-hidden">
      <div
        className="absolute inset-0 scale-105 bg-cover bg-center motion-safe:animate-[slowPan_40s_ease-in-out_infinite_alternate]"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-background/85 via-background/55 to-[#1a1825]/90" />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/15 via-transparent to-transparent" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-3xl flex-col items-center justify-center px-6 py-16 text-center">
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.35em] text-primary/90">
          Third Shire
        </p>
        <h1 className="bg-gradient-to-r from-foreground via-foreground to-primary bg-clip-text text-4xl font-bold tracking-tight text-transparent drop-shadow-sm md:text-5xl">
          Welcome
        </h1>
        <p className="mt-3 max-w-md text-sm text-muted-foreground">
          个人站点入口 · 选一个方向继续浏览
        </p>

        <nav className="mt-10 flex flex-wrap items-center justify-center gap-3">
          {links.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group rounded-2xl border border-border/60 bg-card/40 px-5 py-3 text-sm font-medium text-foreground shadow-sm backdrop-blur-md transition hover:border-primary/50 hover:bg-card/70 hover:shadow-md"
            >
              <span className="block">{item.label}</span>
              <span className="mt-0.5 block text-xs font-normal text-muted-foreground group-hover:text-foreground/80">
                {item.hint}
              </span>
            </Link>
          ))}
        </nav>

        <p
          className="mt-14 max-w-lg text-2xl leading-relaxed text-foreground/95 md:text-3xl"
          style={{
            fontFamily: "KaiTi, STKaiti, serif",
            textShadow: "0 2px 24px rgba(0,0,0,0.45)",
          }}
        >
          世人万千，再难遇我
        </p>
        <div className="mt-6 w-full max-w-xl">
          <TypingEffect />
        </div>
      </div>

      <style jsx>{`
        @keyframes slowPan {
          0% {
            transform: scale(1.08) translate(0, 0);
          }
          100% {
            transform: scale(1.12) translate(-1.5%, -1%);
          }
        }
      `}</style>
    </div>
  );
}