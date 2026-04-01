import type { Metadata, Viewport } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AyaGuide | Portal de Meditacao Sonora',
  description: 'Uma experiencia imersiva de meditacao com frequencias dos chakras, sons da natureza e mandalas dinamicas.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'AyaGuide',
  },
  icons: {
    icon: '/icon.png',
    apple: '/icon.png',
  },
};

export const viewport: Viewport = {
  themeColor: '#020202',
  initialScale: 1,
  width: 'device-width',
};

import { MediaSessionController } from '@/components/MediaSessionController';
import { PWAInstaller } from '@/components/PWAInstaller';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-sans bg-[#020202] text-white selection:bg-white/20 dark overflow-hidden w-screen h-screen`}>
        <MediaSessionController />
        <PWAInstaller />
        {children}
      </body>
    </html>
  );
}
