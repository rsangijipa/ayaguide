'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useSessionStore } from '@/lib/store';
import { ChevronDown } from 'lucide-react';

interface SessionLayoutProps {
  sidebar: ReactNode;
  header: ReactNode;
  content: ReactNode;
  footer?: ReactNode;
  isFullScreen: boolean;
  isMobileProp?: boolean;
}

export function SessionLayout({
  sidebar,
  header,
  content,
  footer,
  isFullScreen,
  isMobileProp
}: SessionLayoutProps) {
  const isMobileHook = useIsMobile();
  const isMobile = isMobileProp ?? isMobileHook;
  const { isSidebarExpanded, setSidebarExpanded } = useSessionStore();

  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      setViewportSize({ width: window.innerWidth, height: window.innerHeight });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Mandala Safe Size
  const mandalaSize = isMobile
    ? Math.min(viewportSize.width - 48, viewportSize.height - 240)
    : Math.min(viewportSize.width - 480, viewportSize.height - 180);

  return (
    <div 
      className={`relative w-full h-screen overflow-hidden flex transition-all duration-700 ${
        isMobile && !isFullScreen ? 'flex-col p-4 md:p-6 gap-4' : 
        !isFullScreen ? 'flex-row p-6 gap-6' : 'p-0 w-full h-full'
      }`}
      style={{
        '--mandala-size': `${mandalaSize}px`,
        '--base-scale': isMobile ? '0.8' : '1',
      } as any}
    >
      {/* 1. Sidebar Slot */}
      <AnimatePresence mode="wait">
        {!isFullScreen && (
          <motion.div
            initial={isMobile ? { y: '100%', x: '-50%' } : { x: -400 }}
            animate={isMobile 
              ? { x: '-50%', y: isSidebarExpanded ? 0 : 'calc(100% - 64px)' } 
              : { x: 0 }
            }
            exit={isMobile ? { y: '100%', x: '-50%' } : { x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`shrink-0 z-[100] ${
              isMobile 
                ? 'fixed bottom-4 left-1/2 w-[calc(100%-32px)] max-w-[600px] h-[75vh] glass rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5)] border border-white/10' 
                : 'w-[384px] h-full overflow-hidden'
            }`}
          >
            {isMobile && (
              <div 
                className="w-full h-16 flex flex-col items-center justify-center cursor-pointer active:bg-white/5 transition-all group"
                onClick={() => setSidebarExpanded(!isSidebarExpanded)}
                role="button"
                aria-label={isSidebarExpanded ? "Recolher Biblioteca" : "Expandir Biblioteca"}
              >
                <div className="flex flex-col items-center gap-1.5 transition-transform duration-500 group-hover:-translate-y-0.5">
                  <motion.div 
                    animate={{ 
                      y: isSidebarExpanded ? 4 : [0, -2, 0],
                      rotate: isSidebarExpanded ? 180 : 0
                    }}
                    transition={{ 
                      y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                      rotate: { duration: 0.5, ease: [0.16, 1, 0.3, 1] }
                    }}
                    className="flex flex-col items-center"
                  >
                    <ChevronDown className="w-5 h-5 text-white/30 group-hover:text-white/60" />
                  </motion.div>
                  {!isSidebarExpanded && (
                    <motion.span 
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] uppercase tracking-[0.4em] font-bold text-white/20 group-hover:text-white/50 transition-colors"
                    >
                      Recursos & Biblioteca
                    </motion.span>
                  )}
                </div>
              </div>
            )}
            <div className={isMobile ? 'h-full overflow-y-auto px-4 pb-12' : 'h-full'}>
              {sidebar}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Main Area (Header + Content) */}
      <div className="flex-1 flex flex-col min-w-0 min-h-0 relative z-10 transition-all duration-700">
        
        {/* Header Slot - Persistent and Floating in Fullscreen */}
        <AnimatePresence>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{ 
              y: 0, 
              opacity: 1,
              scale: isFullScreen ? 0.9 : 1,
              marginTop: isFullScreen ? '1rem' : '0'
            }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`shrink-0 z-[110] transition-all duration-700 ${
              isFullScreen 
                ? 'absolute top-0 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-5xl pointer-events-auto' 
                : (isMobile ? 'h-16 mb-4' : 'h-20 mb-6')
            }`}
          >
            {header}
          </motion.div>
        </AnimatePresence>

        {/* Content (Mandala) Slot */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative w-full h-full overflow-hidden">
          <div className="flex flex-col items-center justify-center transition-all duration-500 w-full h-full relative">
            {content}
          </div>
        </div>

        {footer && (
          <div className="shrink-0 mt-4 h-auto">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}
