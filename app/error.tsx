'use client';

import { useEffect } from 'react';
import { motion } from 'motion/react';
import { AlertTriangle, RefreshCcw } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';
import { logger } from '@/lib/logger';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    logger.error('Runtime error in AyaGuide portal:', error);
  }, [error]);

  return (
    <div className="relative flex min-h-screen w-full items-center justify-center overflow-hidden bg-[#020202] text-white">
      <AuroraBackground
        activeChakraHue={0}
        ambientVolumes={{}}
        isPlaying={false}
      />

      <div className="relative z-10 px-6 text-center">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="rounded-full border border-red-500/20 bg-red-500/5 p-6 backdrop-blur-xl">
            <AlertTriangle className="h-12 w-12 text-red-400/60" />
          </div>
        </motion.div>

        <motion.h2
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="mb-4 text-4xl font-extralight uppercase tracking-widest md:text-5xl"
        >
          Equilibrio Interrompido
        </motion.h2>

        <motion.p
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="mx-auto mb-12 max-w-md text-sm font-light leading-relaxed tracking-[0.2em] text-white/40"
        >
          Houve um desalinhamento inesperado no portal. Tente recarregar a experiencia para restabelecer o fluxo.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <button
            onClick={() => reset()}
            className="group flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-10 py-4 text-xs font-light uppercase tracking-[0.4em] text-black transition-all duration-500 hover:bg-white"
          >
            <RefreshCcw className="h-4 w-4 transition-transform duration-700 group-hover:rotate-180" />
            Tentar Novamente
          </button>

          {error.digest && (
            <span className="text-[10px] font-mono uppercase tracking-widest text-white/10">ID: {error.digest}</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
