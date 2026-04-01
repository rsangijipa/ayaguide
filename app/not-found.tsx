'use client';

import Link from 'next/link';
import { motion } from 'motion/react';
import { Compass } from 'lucide-react';
import { AuroraBackground } from '@/components/AuroraBackground';

export default function NotFound() {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[#020202] text-white overflow-hidden">
      <AuroraBackground 
        activeChakraHue={270} // Soft violet
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
          <div className="p-6 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl">
            <Compass className="w-12 h-12 text-purple-300/40" />
          </div>
        </motion.div>

        <motion.h2 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.8 }}
          className="text-4xl md:text-5xl font-extralight tracking-widest mb-4"
        >
          404 | O CAMINHO SE PERDEU
        </motion.h2>

        <motion.p 
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.8 }}
          className="text-white/40 text-sm tracking-[0.3em] font-light uppercase mb-12"
        >
          Mas toda jornada tem um ponto de retorno.
        </motion.p>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.7, duration: 0.8 }}
        >
          <Link 
            href="/"
            className="px-10 py-4 rounded-full bg-white/5 border border-white/10 text-xs tracking-[0.4em] uppercase font-light hover:bg-white/10 transition-all duration-500"
          >
            Voltar ao Portal
          </Link>
        </motion.div>
      </div>

      {/* Decorative stars/particles */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
         {Array.from({ length: 20 }).map((_, i) => (
           <div 
             key={i}
             className="absolute w-px h-px bg-white rounded-full landing-particle"
             style={{
               left: `${(i * 17) % 100}%`,
               top: `${(i * 23) % 100}%`,
               animationDelay: `${i * 0.5}s`,
               animationDuration: `${5 + (i % 5)}s`
             }}
           />
         ))}
      </div>
    </div>
  );
}
