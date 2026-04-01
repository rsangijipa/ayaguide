'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { WifiOff } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function OfflinePage() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020202] text-white overflow-hidden px-6">
      <AuroraBackground activeChakraHue={210} ambientVolumes={{}} isPlaying={false} />

      <div className="relative z-10 max-w-xl text-center">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.7 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <WifiOff className="w-12 h-12 text-sky-300/60" />
          </div>
        </motion.div>

        <motion.h1
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.15, duration: 0.7 }}
          className="text-3xl md:text-5xl font-extralight tracking-widest uppercase mb-4"
        >
          Modo Offline
        </motion.h1>

        <motion.p
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-white/50 text-sm md:text-base leading-relaxed mb-10"
        >
          A conexao caiu, mas a jornada nao precisa parar. Quando a rede voltar, voce pode retornar ao portal principal.
        </motion.p>

        <motion.div
          initial={{ y: 16, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.45, duration: 0.7 }}
          className="flex items-center justify-center gap-3"
        >
          <Link
            href="/"
            className="px-8 py-3 rounded-full bg-white/10 border border-white/15 text-xs tracking-[0.35em] uppercase font-light hover:bg-white/15 transition-all"
          >
            Tentar Novamente
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
