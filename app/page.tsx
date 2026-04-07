"use client";
import Link from 'next/link';
import React, { createContext, useContext, useRef, useState, useEffect } from 'react';
import Typed from 'typed.js';
import TypingEffect from './components/TypingEffect';
import CollapsibleComments from '@/components/CollapsibleComments';

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
  return (
    <div className="relative w-full min-h-screen"> 
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/images/bg.jpg')" }}
      />
      <div className="relative z-10 flex flex-col items-center justify-center w-full min-h-screen">
        <div>
          <h1>Welcome to Next.js!</h1>
          <div className="flex gap-15">
            <Link href="/about">About Us</Link>
            <Link href="/about/FabulousBeasts">Fabulous Beasts</Link>
            <Link href="/about/anatherpages">anatherpages</Link>
            <Link href="/about/music">music</Link>
          </div>
        </div>
        <div
          className='text-3xl'
          style={{
            fontFamily: '楷体，华文楷体',
            textShadow: 'rgba(0, 0, 0, 0.5) 1px 1px 3px'
          }}
        >
          世人万千，再难遇我
        </div>
        <TypingEffect />
      </div>
    </div>
  );
}