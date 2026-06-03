import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AudioPlayerProvider } from '@/context/AudioPlayerContext';
import MusicPlayer from '@/components/MusicPlayer';
import { Analytics } from '@vercel/analytics/next'

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: '第三夏尔 | Third Shire',
  description: '认真生活，积极摸鱼',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const audioSrc = '/music/song.mp3';
  const lyricsSrc = '/music/song.lrc';

  return (
    <html lang="zh-CN" className="bg-background">
      <body className="font-sans antialiased">
        <AudioPlayerProvider audioSrc={audioSrc} lyricsSrc={lyricsSrc}>
          {children}
          {process.env.NODE_ENV === 'production' && <Analytics />}
          <MusicPlayer />
        </AudioPlayerProvider>
      </body>
    </html>
  );
}