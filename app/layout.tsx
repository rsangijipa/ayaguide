import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AyaGuide | Portal de Meditação Sonora & Visual',
  description: 'Uma experiência imersiva de meditação vibracional que combina as frequências dos 7 chakras, sons da natureza e geometria sagrada dinâmica.',
  keywords: ['meditação', 'chakras', 'terapia sonora', 'sons da natureza', 'ayahuasca', 'mantra', 'espiritualidade', 'relaxamento'],
  authors: [{ name: 'AyaGuide Team' }],
  openGraph: {
    title: 'AyaGuide | Portal de Meditação Sonora',
    description: 'Explore frequências vibracionais e sons da natureza em um ambiente imersivo de geometria sagrada.',
    url: 'https://ayaguide.vercel.app',
    siteName: 'AyaGuide',
    locale: 'pt_BR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AyaGuide | Portal de Meditação Sonora',
    description: 'Transforme sua vibração com meditação sonora imersiva.',
  },
  manifest: '/manifest.json',
  themeColor: '#020202',
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0',
  icons: {
    icon: '/favicon.svg',
    apple: '/favicon.svg',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className={`${outfit.variable} font-sans bg-[#020202] text-white selection:bg-white/20 dark overflow-hidden w-screen h-screen`}>
        {children}
      </body>
    </html>
  );
}
