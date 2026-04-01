import type { Metadata } from 'next';
import { Outfit } from 'next/font/google';
import './globals.css';

const outfit = Outfit({ 
  subsets: ['latin'],
  variable: '--font-outfit',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'AyaGuide | Portal de Meditação Sonora',
  description: 'Uma experiência imersiva de meditação combinando frequências dos chakras, 16 sons da natureza e mandalas dinâmicas.',
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
