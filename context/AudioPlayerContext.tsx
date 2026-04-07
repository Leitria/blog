// context/AudioPlayerContext.tsx
'use client';

import React, { createContext, useContext, useRef, useState, useEffect } from 'react';

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

export function AudioPlayerProvider({ children, audioSrc, lyricsSrc }: { children: React.ReactNode; audioSrc: string; lyricsSrc?: string }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(0.8);
  const [lyrics, setLyrics] = useState<{ time: number; text: string }[]>([]);
  const [currentLyric, setCurrentLyric] = useState('');
  const [showLyrics, setShowLyrics] = useState(true);

  // 加载歌词（如果提供了）
  useEffect(() => {
    if (lyricsSrc) {
      fetch(lyricsSrc)
        .then(res => res.text())
        .then(lrcText => {
          const parsed = parseLRC(lrcText);
          setLyrics(parsed);
        })
        .catch(console.error);
    }
  }, [lyricsSrc]);

  // 音频事件监听
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

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

    audio.addEventListener('timeupdate', onTimeUpdate);
    audio.addEventListener('loadedmetadata', onLoadedMetadata);
    audio.addEventListener('ended', onEnded);

    return () => {
      audio.removeEventListener('timeupdate', onTimeUpdate);
      audio.removeEventListener('loadedmetadata', onLoadedMetadata);
      audio.removeEventListener('ended', onEnded);
    };
  }, [lyrics]);

  // 音量同步
  useEffect(() => {
    if (audioRef.current) audioRef.current.volume = volume;
  }, [volume]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
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
      <audio ref={audioRef} src={audioSrc} preload="auto" />
      {children}
    </AudioPlayerContext.Provider>
  );
}

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

export function useAudioPlayer() {
  const context = useContext(AudioPlayerContext);
  if (!context) throw new Error('useAudioPlayer must be used within AudioPlayerProvider');
  return context;
}