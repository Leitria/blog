'use client';

import { useAudioPlayer } from '@/context/AudioPlayerContext';
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  PauseIcon,
  PlayIcon,
  SpeakerWaveIcon,
  SpeakerXMarkIcon,
  XMarkIcon,
} from '@heroicons/react/24/solid';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useEffect, useRef } from 'react';

export default function MusicPlayer() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    lyrics,
    activeLyricIndex,
    track,
    togglePlay,
    seekTo,
    setVolume,
    showLyrics,
    setShowLyrics,
    skipLocalQueue,
    localQueue,
  } = useAudioPlayer();

  const lyricScrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showLyrics || activeLyricIndex < 0) return;
    const root = lyricScrollRef.current;
    if (!root) return;
    const line = root.querySelector(`[data-idx="${activeLyricIndex}"]`);
    line?.scrollIntoView({ block: 'center', behavior: 'smooth' });
  }, [activeLyricIndex, showLyrics]);

  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    seekTo(parseFloat(e.target.value));
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setVolume(parseFloat(e.target.value));
  };

  const title = track?.title?.trim() || '正在播放';
  const artist = track?.artist?.trim();
  const showQueueSkip = Boolean(localQueue && localQueue.length > 1);

  return (
    <div className="fixed bottom-4 right-4 z-50 w-[min(22rem,calc(100vw-2rem))] rounded-lg bg-black/75 p-3 text-white shadow-xl backdrop-blur-md will-change-transform">
      <div className="mb-2 truncate text-center text-xs leading-tight">
        <span className="font-medium">{title}</span>
        {artist ? <span className="text-white/70"> · {artist}</span> : null}
      </div>

      <div className="mb-2 flex items-center justify-between gap-1">
        <div className="flex shrink-0 items-center gap-0.5">
          {showQueueSkip ? (
            <button
              type="button"
              onClick={() => skipLocalQueue(-1)}
              className="rounded-full p-1.5 hover:bg-white/20"
              title="上一首"
              aria-label="上一首"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
          ) : null}
          <button type="button" onClick={togglePlay} className="rounded-full p-2 hover:bg-white/20">
            {isPlaying ? <PauseIcon className="h-5 w-5" /> : <PlayIcon className="h-5 w-5" />}
          </button>
          {showQueueSkip ? (
            <button
              type="button"
              onClick={() => skipLocalQueue(1)}
              className="rounded-full p-1.5 hover:bg-white/20"
              title="下一首"
              aria-label="下一首"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          ) : null}
        </div>
        <div className="mx-2 flex-1">
          <input
            type="range"
            min={0}
            max={duration || 0}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full accent-primary"
          />
          <div className="flex justify-between text-[10px] text-white/70">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button
            type="button"
            onClick={() => setShowLyrics(!showLyrics)}
            className="rounded p-1 text-xs hover:bg-white/20"
            title="歌词"
          >
            词
          </button>
          <div className="ml-2 flex items-center">
            <button type="button" onClick={() => setVolume(volume === 0 ? 0.8 : 0)} className="p-1 hover:bg-white/20">
              {volume === 0 ? <SpeakerXMarkIcon className="h-5 w-5" /> : <SpeakerWaveIcon className="h-5 w-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="ml-1 w-14 accent-primary"
            />
          </div>
        </div>
      </div>

      {showLyrics ? (
        <div className="relative mt-1">
          <ScrollArea className="h-36 rounded-md border border-white/10 bg-black/45">
            <div ref={lyricScrollRef} className="space-y-1 px-3 py-2 text-center text-xs leading-relaxed">
              {lyrics.length ? (
                lyrics.map((l, i) => (
                  <p
                    key={`${l.time}-${i}`}
                    data-idx={i}
                    className={cn(
                      'transition-[color,transform] duration-200',
                      i === activeLyricIndex ? 'scale-[1.02] font-medium text-sky-300' : 'text-white/45',
                    )}
                  >
                    {l.text}
                  </p>
                ))
              ) : (
                <p className="text-white/50">暂无时间轴歌词</p>
              )}
            </div>
          </ScrollArea>
          <button
            type="button"
            onClick={() => setShowLyrics(false)}
            className="absolute right-1 top-1 z-10 rounded p-1 hover:bg-white/20"
            aria-label="关闭歌词"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>
      ) : null}
    </div>
  );
}
