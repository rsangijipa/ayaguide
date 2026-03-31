'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';

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
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    setIsMobile(isMobileProp ?? window.innerWidth < 1024);
  }, [isMobileProp]);

  const [isSidebarExpanded, setIsSidebarExpanded] = useState(false);
  const [viewportSize, setViewportSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      const height = window.innerHeight;
      setIsMobile(width < 1024);
      setViewportSize({ width, height });
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Calculate Mandala Safe Size - More conservative for perfect fit
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
        // Global variables for children to use
        // @ts-ignore
        '--mandala-size': `${mandalaSize}px`,
        '--base-scale': isMobile ? '0.8' : '1',
      } as any}
    >
      {/* 1. Sidebar Slot (as Desktop Sidebar or Mobile Bottom Sheet) */}
      <AnimatePresence mode="wait">
        {!isFullScreen && (
          <motion.div
            initial={isMobile ? { y: '100%', x: '-50%' } : { x: -400 }}
            animate={isMobile 
              ? { x: '-50%', y: isSidebarExpanded ? 0 : 'calc(100% - 100px)' } 
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
                className="w-full h-12 flex items-center justify-center cursor-pointer active:bg-white/5 transition-colors"
                onClick={() => setIsSidebarExpanded(!isSidebarExpanded)}
              >
                <div className="w-12 h-1.5 rounded-full bg-white/20" />
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
        
        {/* Header Slot */}
        <AnimatePresence>
          {!isFullScreen && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
              className={`shrink-0 mb-4 md:mb-6 ${isMobile ? 'h-16' : 'h-20'}`}
            >
              {header}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content (Mandala) Slot - Flll space */}
        <div className="flex-1 min-h-0 flex items-center justify-center relative w-full h-full overflow-hidden">
          <div 
            className="flex flex-col items-center justify-center transition-all duration-500 w-full h-full relative"
          >
            {content}
          </div>
        </div>

        {footer && (
          <div className="shrink-0 mt-4 h-auto">
            {footer}
          </div>
        )}
      </div>

      {/* Custom Styles to enforce no scroll and fit */}
      <style jsx global>{`
        body { overflow: hidden !important; height: 100vh !important; width: 100vw !important; }
        .min-w-0 { min-width: 0; }
        .min-h-0 { min-height: 0; }
      `}</style>
    </div>
  );
}
