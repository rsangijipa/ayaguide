'use client';

import React from 'react';
import { useShallow } from 'zustand/react/shallow';
import { showToast } from '@/components/Toast';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMediaSession } from '@/hooks/useMediaSession';
import { useJourneyTimer } from '@/hooks/useJourneyTimer';
import { getAudioMixer } from '@/lib/audioMixer';
import { useSessionStore } from '@/lib/store';

interface SessionRuntimeProps {
  isPlaying: boolean;
  timeLeft: number;
  sessionDuration: number;
  isChakraOn: boolean;
  activeChakraId: string;
  chakraVolume: number;
  binauralState: string;
  binauralVolume: number;
  masterVolume: number;
  isFullScreen: boolean;
  togglePlay: () => void;
  setFullscreen: (isFullscreen: boolean) => void;
}

export function SessionRuntime({
  isPlaying,
  timeLeft,
  sessionDuration,
  isChakraOn,
  activeChakraId,
  chakraVolume,
  binauralState,
  binauralVolume,
  masterVolume,
  isFullScreen,
  togglePlay,
  setFullscreen,
}: SessionRuntimeProps) {
  useMediaSession();
  useJourneyTimer();

  const tick = useSessionStore((s) => s.tick);
  const {
    toggleFullscreen,
    toggleMute,
    setMasterVolume,
    isMuted,
    isSidebarExpanded,
    setSidebarExpanded,
    toggleBreathingGuide,
  } = useSessionStore(
    useShallow((s) => ({
      toggleFullscreen: s.toggleFullscreen,
      toggleMute: s.toggleMute,
      setMasterVolume: s.setMasterVolume,
      isMuted: s.isMuted,
      isSidebarExpanded: s.isSidebarExpanded,
      setSidebarExpanded: s.setSidebarExpanded,
      toggleBreathingGuide: s.toggleBreathingGuide,
    }))
  );

  const timerRef = React.useRef<NodeJS.Timeout | null>(null);
  const startTimeRef = React.useRef<number | null>(null);
  const initialTimeLeftRef = React.useRef<number | null>(null);
  const bellAudioRef = React.useRef<HTMLAudioElement | null>(null);
  const lastChimeRef = React.useRef(0);
  const previousVolumeRef = React.useRef(masterVolume || 0.7);

  useKeyboardShortcuts(true, {
    onTogglePlay: togglePlay,
    onToggleFullscreen: toggleFullscreen,
    onToggleMute: () => {
      if (!isMuted && masterVolume > 0) {
        previousVolumeRef.current = masterVolume;
        setMasterVolume(0);
        toggleMute();
        return;
      }

      setMasterVolume(previousVolumeRef.current || 0.7);
      toggleMute();
    },
    onToggleBreathing: toggleBreathingGuide,
    onToggleSidebar: () => setSidebarExpanded(!isSidebarExpanded),
  });

  React.useEffect(() => {
    if (!isPlaying && initialTimeLeftRef.current !== null && Math.abs(initialTimeLeftRef.current - timeLeft) > 2) {
      startTimeRef.current = null;
      initialTimeLeftRef.current = null;
    }

    if (isPlaying && timeLeft > 0) {
      if (startTimeRef.current === null) {
        startTimeRef.current = Date.now();
        initialTimeLeftRef.current = timeLeft;
      }

      timerRef.current = setInterval(() => {
        if (startTimeRef.current !== null && initialTimeLeftRef.current !== null) {
          const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
          const newTimeLeft = Math.max(0, initialTimeLeftRef.current - elapsed);

          if (newTimeLeft !== timeLeft) {
            tick(newTimeLeft);
          }
        }
      }, 500);
    } else {
      startTimeRef.current = null;
      initialTimeLeftRef.current = null;
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isPlaying, timeLeft, tick]);

  React.useEffect(() => {
    if (!isPlaying) return;

    const mixer = getAudioMixer();
    if (mixer) {
      mixer.resume();
    }

    const elapsed = sessionDuration * 60 - timeLeft;

    if (elapsed > 0 && elapsed % 900 === 0 && elapsed !== lastChimeRef.current && bellAudioRef.current) {
      lastChimeRef.current = elapsed;
      bellAudioRef.current.currentTime = 0;
      bellAudioRef.current.volume = 0.6;
      bellAudioRef.current.play().catch(console.error);
    }

    if (timeLeft <= 0 && isPlaying) {
      togglePlay();
      showToast('Sessao concluida. Namaste.', '\u{1F514}');
      if (bellAudioRef.current) {
        bellAudioRef.current.currentTime = 0;
        bellAudioRef.current.volume = 0.8;
        bellAudioRef.current.play().catch(console.error);
      }
    }
  }, [timeLeft, isPlaying, sessionDuration, togglePlay]);

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (!mixer) return;

    if (isChakraOn && isPlaying) {
      mixer.resume();
      mixer.playChakra(activeChakraId);
      mixer.setChakraVolume(chakraVolume);
    } else {
      mixer.stopChakra();
    }
  }, [isChakraOn, activeChakraId, chakraVolume, isPlaying]);

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (!mixer) return;

    if (binauralState === 'off') {
      mixer.stopBinaural();
    } else if (isPlaying) {
      mixer.resume();
      mixer.playBinaural(binauralState, binauralVolume);
    } else {
      mixer.stopBinaural();
    }
  }, [binauralState, binauralVolume, isPlaying]);

  React.useEffect(() => {
    const mixer = getAudioMixer();
    if (mixer) {
      mixer.setMasterVolume(masterVolume);
    }
  }, [masterVolume]);

  React.useEffect(() => {
    const handleFullscreenChange = () => {
      const isBrowserFullscreen = Boolean(document.fullscreenElement);
      if (useSessionStore.getState().isFullScreen !== isBrowserFullscreen) {
        setFullscreen(isBrowserFullscreen);
      }
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
    };
  }, [setFullscreen]);

  React.useEffect(() => {
    const syncFullscreen = async () => {
      const fullscreenTarget = document.documentElement;
      const isBrowserFullscreen = Boolean(document.fullscreenElement);

      if (isFullScreen === isBrowserFullscreen) {
        return;
      }

      try {
        if (isFullScreen) {
          if (fullscreenTarget.requestFullscreen) {
            await fullscreenTarget.requestFullscreen();
          } else {
            setFullscreen(false);
          }
        } else if (document.fullscreenElement && document.exitFullscreen) {
          await document.exitFullscreen();
        }
      } catch {
        setFullscreen(Boolean(document.fullscreenElement));
        showToast('Nao foi possivel alternar a tela cheia neste navegador.', '\u{26A0}\u{FE0F}');
      }
    };

    syncFullscreen();
  }, [isFullScreen, setFullscreen]);

  return (
    <audio
      ref={bellAudioRef}
      src="/sounds/mystical/singing_bowl.mp3"
      crossOrigin="anonymous"
      preload="auto"
    />
  );
}
