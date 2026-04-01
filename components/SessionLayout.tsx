'use client';

import React, { ReactNode, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown } from 'lucide-react';
import { useIsMobile } from '@/hooks/useMediaQuery';
import { useSessionStore } from '@/lib/store';

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
  isMobileProp,
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

  const topInset = 'env(safe-area-inset-top, 0px)';
  const rightInset = 'env(safe-area-inset-right, 0px)';
  const bottomInset = 'env(safe-area-inset-bottom, 0px)';
  const leftInset = 'env(safe-area-inset-left, 0px)';

  const mandalaSize = isMobile
    ? Math.min(viewportSize.width - 48, viewportSize.height - 260)
    : Math.min(viewportSize.width - 480, viewportSize.height - 180);

  return (
    <div
      className={`relative flex h-screen w-full overflow-hidden transition-all duration-700 ${
        isMobile && !isFullScreen ? 'flex-col gap-4' : !isFullScreen ? 'flex-row gap-6' : 'p-0'
      }`}
      style={{
        '--mandala-size': `${mandalaSize}px`,
        '--base-scale': isMobile ? '0.8' : '1',
        paddingTop: isFullScreen ? '0' : isMobile ? `calc(1rem + ${topInset})` : '1.5rem',
        paddingRight: isFullScreen ? '0' : isMobile ? `calc(1rem + ${rightInset})` : '1.5rem',
        paddingBottom: isFullScreen ? '0' : isMobile ? `calc(1rem + ${bottomInset})` : '1.5rem',
        paddingLeft: isFullScreen ? '0' : isMobile ? `calc(1rem + ${leftInset})` : '1.5rem',
      } as React.CSSProperties}
    >
      <AnimatePresence mode="wait">
        {!isFullScreen && (
          <motion.div
            initial={isMobile ? { y: '100%', x: '-50%' } : { x: -400 }}
            animate={isMobile ? { x: '-50%', y: isSidebarExpanded ? 0 : 'calc(100% - 64px)' } : { x: 0 }}
            exit={isMobile ? { y: '100%', x: '-50%' } : { x: -400 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className={`z-[100] shrink-0 ${
              isMobile
                ? 'fixed left-1/2 h-[min(75vh,42rem)] w-[calc(100%-32px)] max-w-[600px] rounded-[32px] border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] glass'
                : 'h-full w-[384px] overflow-hidden'
            }`}
            style={isMobile ? { bottom: `calc(1rem + ${bottomInset})` } : undefined}
          >
            {isMobile && (
              <div
                className="group flex h-16 w-full cursor-pointer flex-col items-center justify-center transition-all active:bg-white/5"
                onClick={() => setSidebarExpanded(!isSidebarExpanded)}
                role="button"
                aria-label={isSidebarExpanded ? 'Recolher biblioteca' : 'Expandir biblioteca'}
              >
                <div className="flex flex-col items-center gap-1.5 transition-transform duration-500 group-hover:-translate-y-0.5">
                  <motion.div
                    animate={{
                      y: isSidebarExpanded ? 4 : [0, -2, 0],
                      rotate: isSidebarExpanded ? 180 : 0,
                    }}
                    transition={{
                      y: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
                      rotate: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
                    }}
                    className="flex flex-col items-center"
                  >
                    <ChevronDown className="h-5 w-5 text-white/30 group-hover:text-white/60" />
                  </motion.div>
                  {!isSidebarExpanded && (
                    <motion.span
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="text-[10px] font-bold uppercase tracking-[0.4em] text-white/20 transition-colors group-hover:text-white/50"
                    >
                      Recursos & Biblioteca
                    </motion.span>
                  )}
                </div>
              </div>
            )}
            <div className={isMobile ? 'h-full overflow-y-auto px-4 pb-12' : 'h-full'}>{sidebar}</div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative z-10 flex min-h-0 min-w-0 flex-1 flex-col transition-all duration-700">
        <AnimatePresence>
          <motion.div
            initial={{ y: -100, opacity: 0 }}
            animate={{
              y: 0,
              opacity: 1,
              scale: isFullScreen ? 0.9 : 1,
              marginTop: isFullScreen ? `calc(1rem + ${topInset})` : '0',
            }}
            exit={{ y: -100, opacity: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
            className={`z-[110] shrink-0 transition-all duration-700 ${
              isFullScreen
                ? 'pointer-events-auto absolute left-1/2 top-0 w-[calc(100%-2rem)] max-w-5xl -translate-x-1/2'
                : isMobile
                  ? 'mb-4 h-16'
                  : 'mb-6 h-20'
            }`}
            style={isFullScreen ? { paddingLeft: leftInset, paddingRight: rightInset } : undefined}
          >
            {header}
          </motion.div>
        </AnimatePresence>

        <div className="relative flex h-full w-full flex-1 items-center justify-center overflow-hidden">
          <div className="relative flex h-full w-full flex-col items-center justify-center transition-all duration-500">
            {content}
          </div>
        </div>

        {footer && <div className="mt-4 h-auto shrink-0">{footer}</div>}
      </div>
    </div>
  );
}
