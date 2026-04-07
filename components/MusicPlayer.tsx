// components/MusicPlayer.tsx
'use client';

import { useAudioPlayer } from '@/context/AudioPlayerContext';
import { PlayIcon, PauseIcon, XMarkIcon, SpeakerWaveIcon, SpeakerXMarkIcon } from '@heroicons/react/24/solid'; // 需要安装 heroicons

export default function MusicPlayer() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    currentLyric,
    togglePlay,
    seekTo,
    setVolume,
    showLyrics,
    setShowLyrics,
  } = useAudioPlayer();

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

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-black/70 backdrop-blur-md rounded-lg p-3 shadow-xl text-white w-80">
      <div className="flex items-center justify-between mb-2">
        <button onClick={togglePlay} className="p-2 rounded-full hover:bg-white/20">
          {isPlaying ? <PauseIcon className="w-5 h-5" /> : <PlayIcon className="w-5 h-5" />}
        </button>
        <div className="flex-1 mx-2">
          <input
            type="range"
            min={0}
            max={duration || 0}
            value={currentTime}
            onChange={handleSeek}
            className="w-full"
          />
          <div className="flex justify-between text-xs">
            <span>{formatTime(currentTime)}</span>
            <span>{formatTime(duration)}</span>
          </div>
        </div>
        <div className="flex items-center">
          <button onClick={() => setShowLyrics(!showLyrics)} className="p-1 hover:bg-white/20 rounded">
            {showLyrics ? '📜' : '🔊'}
          </button>
          <div className="flex items-center ml-2">
            <button onClick={() => setVolume(volume === 0 ? 0.8 : 0)}>
              {volume === 0 ? <SpeakerXMarkIcon className="w-5 h-5" /> : <SpeakerWaveIcon className="w-5 h-5" />}
            </button>
            <input
              type="range"
              min={0}
              max={1}
              step={0.01}
              value={volume}
              onChange={handleVolumeChange}
              className="w-16 ml-1"
            />
          </div>
        </div>
      </div>

      {/* 歌词显示 */}
      {showLyrics && (
        <div className="relative mt-2 p-2 bg-black/50 rounded text-center text-sm">
          {currentLyric || '🎵 暂无歌词 🎵'}
          <button
            onClick={() => setShowLyrics(false)}
            className="absolute top-1 right-1 p-1 hover:bg-white/20 rounded"
          >
            <XMarkIcon className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}