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
    // Log the error to our centralized logger
    logger.error('Runtime error in AyaGuide portal:', error);
  }, [error]);

  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020202] text-white overflow-hidden">
      <AuroraBackground 
        activeChakraHue={0} // Deep Red for critical errors (carefully balanced)
        ambientVolumes={{}} 
        isPlaying={false} 
      />
      
      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.8 }}
          className="mb-8 flex justify-center"
        >
          <div className="p-6 rounded-full bg-red-500/5 border border-red-500/20 backdrop-blur-xl">
            <AlertTriangle className="w-12 h-12 text-red-400/60" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-5xl font-extralight tracking-widest mb-4 uppercase"
        >
          Equilíbrio Interrompido
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white/40 text-sm tracking-[0.2em] font-light mb-12 max-w-md mx-auto leading-relaxed"
        >
          Houve um desalinhamento inesperado no portal. Tente recarregar a experiência para reestabelecer o fluxo.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
          className="flex flex-col items-center gap-4"
        >
          <button 
            onClick={() => reset()}
            className="group flex items-center gap-3 px-10 py-4 rounded-full bg-white/10 border border-white/20 text-xs tracking-[0.4em] uppercase font-light hover:bg-white text-black transition-all duration-500"
          >
            <RefreshCcw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-700" />
            Tentar Novamente
          </button>
          
          {error.digest && (
             <span className="text-[10px] text-white/10 font-mono tracking-widest uppercase">ID: {error.digest}</span>
          )}
        </motion.div>
      </div>
    </div>
  );
}
