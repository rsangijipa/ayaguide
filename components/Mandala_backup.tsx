import { useEffect, useRef, useCallback } from 'react';
import { getAudioEngine } from '@/lib/audio';

interface ChakraConfig {
  speedModifier: number;
  radiusModifier: number;
  petalWidth: number;
  petalHeight: number;
  numPetals: number;
  ringCount: number;
  rotationDir: number;
  shapeType: 'standard' | 'fluid' | 'spike' | 'lotus' | 'star';
  glowIntensity: number;
  particleCount: number;
}

const CHAKRA_CONFIGS: Record<string, ChakraConfig> = {
  root: {
    speedModifier: 25000,
    radiusModifier: 40,
    petalWidth: 25,
    petalHeight: 15,
    numPetals: 4,
    ringCount: 4,
    rotationDir: 1,
    shapeType: 'spike',
    glowIntensity: 0.8,
    particleCount: 20,
  },
  sacral: {
    speedModifier: 7000,
    radiusModifier: 70,
    petalWidth: 10,
    petalHeight: 30,
    numPetals: 6,
    ringCount: 5,
    rotationDir: -1,
    shapeType: 'fluid',
    glowIntensity: 1.0,
    particleCount: 30,
  },
  solar: {
    speedModifier: 12000,
    radiusModifier: 55,
    petalWidth: 18,
    petalHeight: 22,
    numPetals: 10,
    ringCount: 5,
    rotationDir: 1,
    shapeType: 'lotus',
    glowIntensity: 0.9,
    particleCount: 25,
  },
  heart: {
    speedModifier: 15000,
    radiusModifier: 60,
    petalWidth: 20,
    petalHeight: 25,
    numPetals: 8,
    ringCount: 6,
    rotationDir: -1,
    shapeType: 'lotus',
    glowIntensity: 1.2,
    particleCount: 35,
  },
  throat: {
    speedModifier: 5000,
    radiusModifier: 65,
    petalWidth: 12,
    petalHeight: 28,
    numPetals: 12,
    ringCount: 5,
    rotationDir: 1,
    shapeType: 'fluid',
    glowIntensity: 1.0,
    particleCount: 40,
  },
  thirdEye: {
    speedModifier: 8000,
    radiusModifier: 50,
    petalWidth: 15,
    petalHeight: 20,
    numPetals: 14,
    ringCount: 6,
    rotationDir: -1,
    shapeType: 'star',
    glowIntensity: 1.5,
    particleCount: 50,
  },
  crown: {
    speedModifier: 20000,
    radiusModifier: 45,
    petalWidth: 8,
    petalHeight: 18,
    numPetals: 16,
    ringCount: 7,
    rotationDir: 1,
    shapeType: 'star',
    glowIntensity: 2.0,
    particleCount: 60,
  },
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
}

export function Mandala({ hue, isPlaying, chakraId }: { hue: number, isPlaying: boolean, chakraId: string }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<Particle[]>([]);
  const timeRef = useRef(0);
  const configRef = useRef<ChakraConfig>(CHAKRA_CONFIGS[cakraId] || CHAKRA_CONFIGS.solar);

  const initParticles = useCallback((centerX: number, centerY: number, count: number) => {
    const particles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = Math.random() * 100 + 50;
      particles.push({
        x: centerX + Math.cos(angle) * dist,
        y: centerY + Math.sin(angle) * dist,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        life: Math.random(),
        maxLife: 1,
        size: Math.random() * 3 + 1,
      });
    }
    return particles;
  }, []);

  useEffect(() => {
    configRef.current = CHAKRA_CONFIGS[cakraId] || CHAKRA_CONFIGS.solar;
  }, [chakraId]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    const dataArray = new Uint8Array(128);
    const config = configRef.current;

    if (particlesRef.current.length === 0) {
      particlesRef.current = initParticles(canvas.width / 2, canvas.height / 2, config.particleCount);
    }

    const draw = () => {
      animationId = requestAnimationFrame(draw);
      timeRef.current += 0.016;
      
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const config = configRef.current;

      ctx.globalCompositeOperation = 'source-over';
      ctx.fillStyle = 'rgba(5, 5, 5, 0.15)';
      ctx.fillRect(0, 0, width, height);

      if (isPlaying) {
        const engine = getAudioEngine();
        if (engine) engine.getFrequencyData(dataArray);
      } else {
        for (let i = 0; i < dataArray.length; i++) {
          dataArray[i] = Math.max(0, dataArray[i] - 3);
        }
      }

      const bassFreq = dataArray.slice(0, 4).reduce((a, b) => a + b, 0) / 4;
      const midFreq = dataArray.slice(4, 20).reduce((a, b) => a + b, 0) / 16;
      const highFreq = dataArray.slice(20, 64).reduce((a, b) => a + b, 0) / 44;

      ctx.globalCompositeOperation = 'lighter';
      
      const centerGlowSize = 40 + (bassFreq / 255) * 80 * config.glowIntensity;
      const centerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, centerGlowSize);
      centerGlow.addColorStop(0, `hsla(${hue}, 100%, 90%, ${0.8 + (bassFreq / 255) * 0.2})`);
      centerGlow.addColorStop(0.3, `hsla(${hue}, 100%, 70%, ${0.4 + (bassFreq / 255) * 0.3})`);
      centerGlow.addColorStop(0.6, `hsla(${hue}, 80%, 50%, ${0.2 + (bassFreq / 255) * 0.2})`);
      centerGlow.addColorStop(1, `hsla(${hue}, 60%, 30%, 0)`);
      ctx.fillStyle = centerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerGlowSize, 0, Math.PI * 2);
      ctx.fill();

      const innerGlow = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 20 + (midFreq / 255) * 30);
      innerGlow.addColorStop(0, `hsla(${hue}, 100%, 95%, 1)`);
      innerGlow.addColorStop(1, `hsla(${hue}, 100%, 80%, 0)`);
      ctx.fillStyle = innerGlow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 20 + (midFreq / 255) * 30, 0, Math.PI * 2);
      ctx.fill();

      const numPetals = config.numPetals;
      for (let ring = 1; ring <= config.ringCount; ring++) {
        const freqIndex = Math.min(ring * 6 + Math.floor(highFreq / 40), 60);
        const freq = dataArray[freqIndex] || 0;
        const ringFreq = dataArray[Math.max(0, ring * 4 - 1)] || 0;
        
        const baseRadius = ring * 45;
        const radius = baseRadius + (freq / 255) * config.radiusModifier + (midFreq / 255) * 15;
        
        const rotationSpeed = config.speedModifier * (1 + (midFreq / 255) * 0.5);
        const rotation = (Date.now() / rotationSpeed) * config.rotationDir * (ring % 2 === 0 ? 1 : -0.5);
        const pulsePhase = Math.sin(timeRef.current * 2 + ring * 0.5);

        for (let i = 0; i < numPetals; i++) {
          const angle = (i * Math.PI * 2) / numPetals + rotation;
          const x = centerX + Math.cos(angle) * radius;
          const y = centerY + Math.sin(angle) * radius;

          ctx.save();
          ctx.translate(x, y);
          ctx.rotate(angle + Math.PI / 2);
          
          const freqMod = freq / 255;
          const heightMod = config.petalHeight * (1 + freqMod * 0.5 + pulsePhase * 0.1);
          const widthMod = config.petalWidth * (1 + freqMod * 0.3);

          ctx.beginPath();
          
          switch (config.shapeType) {
            case 'fluid':
              ctx.moveTo(0, -heightMod - freqMod * 25);
              ctx.bezierCurveTo(widthMod * 2.5, -10, widthMod * 2.5, 10, 0, heightMod + freqMod * 25);
              ctx.bezierCurveTo(-widthMod * 2.5, 10, -widthMod * 2.5, -10, 0, -heightMod - freqMod * 25);
              break;
            case 'spike':
              ctx.moveTo(0, -heightMod);
              ctx.lineTo(widthMod * 0.5, -heightMod * 0.3);
              ctx.lineTo(widthMod, 0);
              ctx.lineTo(widthMod * 0.5, heightMod * 0.3);
              ctx.lineTo(0, heightMod);
              ctx.lineTo(-widthMod * 0.5, heightMod * 0.3);
              ctx.lineTo(-widthMod, 0);
              ctx.lineTo(-widthMod * 0.5, -heightMod * 0.3);
              ctx.closePath();
              break;
            case 'lotus':
              ctx.moveTo(0, -heightMod);
              for (let j = 0; j < 3; j++) {
                const t = j / 2;
                ctx.quadraticCurveTo(widthMod * (1 + t), -heightMod * (0.5 - t * 0.2), widthMod * 0.3, heightMod * 0.3);
    
