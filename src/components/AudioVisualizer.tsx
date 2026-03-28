// ─── AudioVisualizer ──────────────────────────────────────────────────────
// Canvas-based glowing orb that reacts to real-time audio frequency data.
// Renders concentric rings for bass/mid/treble + a central glow bloom.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useEffect, memo } from 'react';
import type { FrequencyBands } from '@/hooks/useAudioAnalyser';

interface AudioVisualizerProps {
  frequencyBands: FrequencyBands;
  isActive: boolean;
  /** Canvas size in CSS pixels */
  size?: number;
}

// Kerala-inspired ring colors (HSL → RGB for canvas)
const RING_COLORS = {
  bass: { r: 234, g: 160, b: 30 },    // hsl(32, 95%, 55%) — golden
  mid: { r: 26, g: 185, b: 160 },      // hsl(168, 76%, 42%) — teal
  treble: { r: 30, g: 130, b: 90 },    // hsl(158, 64%, 32%) — deep green
  glow: { r: 45, g: 200, b: 155 },     // bright center glow — vibrant green-teal
};

const AudioVisualizer = memo(({ frequencyBands, isActive, size = 220 }: AudioVisualizerProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const fadeRef = useRef(0); // 0 = hidden, 1 = fully visible
  const timeRef = useRef(0); // for idle breathing animation

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Handle high-DPI displays
    const dpr = window.devicePixelRatio || 1;
    canvas.width = size * dpr;
    canvas.height = size * dpr;
    ctx.scale(dpr, dpr);

    const centerX = size / 2;
    const centerY = size / 2;

    const render = () => {
      // ── Fade in/out ──────────────────────────────────────────────
      const targetFade = isActive ? 1 : 0;
      fadeRef.current += (targetFade - fadeRef.current) * 0.08;

      // Skip rendering when fully faded out
      if (fadeRef.current < 0.005 && !isActive) {
        fadeRef.current = 0;
        ctx.clearRect(0, 0, size, size);
        rafRef.current = requestAnimationFrame(render);
        return;
      }

      timeRef.current += 0.02;
      const fade = fadeRef.current;

      ctx.clearRect(0, 0, size, size);

      const { bass, mid, treble, overall } = frequencyBands;

      // ── Idle breathing (when active but no audio data) ───────────
      const idleBreath = Math.sin(timeRef.current * 1.5) * 0.1 + 0.15;
      const effectiveBass = isActive ? Math.max(bass, idleBreath * 0.3) : idleBreath * 0.2;
      const effectiveMid = isActive ? Math.max(mid, idleBreath * 0.25) : idleBreath * 0.15;
      const effectiveTreble = isActive ? Math.max(treble, idleBreath * 0.2) : idleBreath * 0.1;
      const effectiveOverall = isActive ? Math.max(overall, idleBreath * 0.2) : idleBreath * 0.15;

      // ── Ring 1: Bass (outer) — golden glow ───────────────────────
      drawRing(ctx, centerX, centerY, {
        baseRadius: 60,
        maxExpansion: 35,
        amplitude: effectiveBass,
        color: RING_COLORS.bass,
        baseOpacity: 0.08,
        maxOpacity: 0.35,
        blurRadius: 30,
        fade,
      });

      // ── Ring 2: Mid (middle) — teal ──────────────────────────────
      drawRing(ctx, centerX, centerY, {
        baseRadius: 48,
        maxExpansion: 25,
        amplitude: effectiveMid,
        color: RING_COLORS.mid,
        baseOpacity: 0.1,
        maxOpacity: 0.4,
        blurRadius: 20,
        fade,
      });

      // ── Ring 3: Treble (inner) — deep green ──────────────────────
      drawRing(ctx, centerX, centerY, {
        baseRadius: 36,
        maxExpansion: 15,
        amplitude: effectiveTreble,
        color: RING_COLORS.treble,
        baseOpacity: 0.12,
        maxOpacity: 0.45,
        blurRadius: 12,
        fade,
      });

      // ── Center glow bloom ────────────────────────────────────────
      const glowRadius = 25 + effectiveOverall * 20;
      const glowOpacity = (0.15 + effectiveOverall * 0.5) * fade;

      const glowGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, glowRadius,
      );
      glowGradient.addColorStop(0, `rgba(${RING_COLORS.glow.r}, ${RING_COLORS.glow.g}, ${RING_COLORS.glow.b}, ${glowOpacity * 0.8})`);
      glowGradient.addColorStop(0.4, `rgba(${RING_COLORS.glow.r}, ${RING_COLORS.glow.g}, ${RING_COLORS.glow.b}, ${glowOpacity * 0.4})`);
      glowGradient.addColorStop(1, `rgba(${RING_COLORS.glow.r}, ${RING_COLORS.glow.g}, ${RING_COLORS.glow.b}, 0)`);

      ctx.beginPath();
      ctx.arc(centerX, centerY, glowRadius, 0, Math.PI * 2);
      ctx.fillStyle = glowGradient;
      ctx.fill();

      // ── Sparkle particles (subtle) ───────────────────────────────
      if (effectiveOverall > 0.15) {
        const particleCount = Math.floor(effectiveOverall * 8);
        for (let i = 0; i < particleCount; i++) {
          const angle = (timeRef.current * 0.5 + (i * Math.PI * 2) / particleCount) % (Math.PI * 2);
          const dist = 40 + effectiveOverall * 30 + Math.sin(timeRef.current * 2 + i) * 10;
          const px = centerX + Math.cos(angle) * dist;
          const py = centerY + Math.sin(angle) * dist;
          const pSize = 1 + effectiveOverall * 2;
          const pOpacity = (0.3 + effectiveOverall * 0.5) * fade;

          ctx.beginPath();
          ctx.arc(px, py, pSize, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 255, 255, ${pOpacity})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = 0;
      }
    };
  }, [frequencyBands, isActive, size]);

  return (
    <canvas
      ref={canvasRef}
      className="audio-visualizer-canvas"
      style={{
        width: size,
        height: size,
      }}
      aria-hidden="true"
    />
  );
});

AudioVisualizer.displayName = 'AudioVisualizer';

// ── Helper: Draw a single frequency ring ──────────────────────────────────

interface RingParams {
  baseRadius: number;
  maxExpansion: number;
  amplitude: number;
  color: { r: number; g: number; b: number };
  baseOpacity: number;
  maxOpacity: number;
  blurRadius: number;
  fade: number;
}

function drawRing(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  params: RingParams,
) {
  const { baseRadius, maxExpansion, amplitude, color, baseOpacity, maxOpacity, blurRadius, fade } = params;

  const radius = baseRadius + amplitude * maxExpansion;
  const opacity = (baseOpacity + amplitude * (maxOpacity - baseOpacity)) * fade;

  // Outer glow
  const gradient = ctx.createRadialGradient(cx, cy, radius * 0.6, cx, cy, radius + blurRadius);
  gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.6})`);
  gradient.addColorStop(0.5, `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.3})`);
  gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

  ctx.beginPath();
  ctx.arc(cx, cy, radius + blurRadius, 0, Math.PI * 2);
  ctx.fillStyle = gradient;
  ctx.fill();

  // Ring stroke
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.strokeStyle = `rgba(${color.r}, ${color.g}, ${color.b}, ${opacity * 0.8})`;
  ctx.lineWidth = 1.5 + amplitude * 2;
  ctx.stroke();
}

export { AudioVisualizer };
