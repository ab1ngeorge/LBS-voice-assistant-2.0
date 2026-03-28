// ─── useAudioAnalyser ─────────────────────────────────────────────────────
// Manages Web Audio API AnalyserNode to extract real-time frequency data
// from TTS audio elements and microphone streams.
// ─────────────────────────────────────────────────────────────────────────────

import { useRef, useState, useCallback, useEffect } from 'react';

export interface FrequencyBands {
  /** Low frequencies (0–300 Hz) — drives outer ring */
  bass: number;
  /** Mid frequencies (300–2000 Hz) — drives middle ring */
  mid: number;
  /** High frequencies (2000–8000 Hz) — drives inner ring */
  treble: number;
  /** Overall average amplitude 0–1 */
  overall: number;
}

const EMPTY_BANDS: FrequencyBands = { bass: 0, mid: 0, treble: 0, overall: 0 };

// Singleton AudioContext — reused across the app lifecycle
let sharedAudioContext: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
    sharedAudioContext = new AudioContext();
  }
  return sharedAudioContext;
}

// Track which audio elements have already been connected (can only call
// createMediaElementSource once per element — calling twice throws).
const connectedElements = new WeakSet<HTMLAudioElement>();

export function useAudioAnalyser() {
  const [frequencyBands, setFrequencyBands] = useState<FrequencyBands>(EMPTY_BANDS);
  const [isActive, setIsActive] = useState(false);

  const analyserRef = useRef<AnalyserNode | null>(null);
  const sourceRef = useRef<MediaElementAudioSourceNode | MediaStreamAudioSourceNode | null>(null);
  const rafRef = useRef<number>(0);
  const dataArrayRef = useRef<Uint8Array<ArrayBuffer> | null>(null);

  // Smoothed values for exponential decay
  const smoothedRef = useRef<FrequencyBands>({ ...EMPTY_BANDS });

  // ── Animation loop ─────────────────────────────────────────────────────

  const startAnalysisLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!analyser) return;

    const bufferLength = analyser.frequencyBinCount;
    if (!dataArrayRef.current || dataArrayRef.current.length !== bufferLength) {
      dataArrayRef.current = new Uint8Array(new ArrayBuffer(bufferLength));
    }

    const sampleRate = getAudioContext().sampleRate;
    const binWidth = sampleRate / (bufferLength * 2); // Hz per bin

    // Calculate bin ranges for frequency bands
    const bassBinEnd = Math.min(Math.floor(300 / binWidth), bufferLength);
    const midBinEnd = Math.min(Math.floor(2000 / binWidth), bufferLength);
    const trebleBinEnd = Math.min(Math.floor(8000 / binWidth), bufferLength);

    const smoothingFactor = 0.15; // Lower = smoother
    const decayFactor = 0.85;

    const loop = () => {
      if (!analyserRef.current) return;

      analyser.getByteFrequencyData(dataArrayRef.current!);
      const data = dataArrayRef.current!;

      // Calculate average amplitude for each band (0–255 → 0–1)
      let bassSum = 0, midSum = 0, trebleSum = 0;
      let bassCount = 0, midCount = 0, trebleCount = 0;

      for (let i = 0; i < trebleBinEnd; i++) {
        const val = data[i];
        if (i < bassBinEnd) { bassSum += val; bassCount++; }
        else if (i < midBinEnd) { midSum += val; midCount++; }
        else { trebleSum += val; trebleCount++; }
      }

      const rawBass = bassCount > 0 ? bassSum / (bassCount * 255) : 0;
      const rawMid = midCount > 0 ? midSum / (midCount * 255) : 0;
      const rawTreble = trebleCount > 0 ? trebleSum / (trebleCount * 255) : 0;
      const rawOverall = (rawBass + rawMid + rawTreble) / 3;

      // Apply exponential smoothing
      const s = smoothedRef.current;
      s.bass = s.bass * decayFactor + rawBass * smoothingFactor;
      s.mid = s.mid * decayFactor + rawMid * smoothingFactor;
      s.treble = s.treble * decayFactor + rawTreble * smoothingFactor;
      s.overall = s.overall * decayFactor + rawOverall * smoothingFactor;

      setFrequencyBands({
        bass: s.bass,
        mid: s.mid,
        treble: s.treble,
        overall: s.overall,
      });

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }, []);

  const stopAnalysisLoop = useCallback(() => {
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
    }
  }, []);

  // ── Connect TTS Audio Element ──────────────────────────────────────────

  const connectAudioElement = useCallback((audio: HTMLAudioElement) => {
    try {
      const ctx = getAudioContext();

      // Resume context if suspended (browser autoplay policy)
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      // Disconnect any previous source
      disconnectInternal();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      // createMediaElementSource can only be called once per element
      let source: MediaElementAudioSourceNode;
      if (connectedElements.has(audio)) {
        // Element already connected — we can't reconnect it.
        // This shouldn't happen in normal flow, but handle gracefully.
        console.warn('[AudioAnalyser] Audio element already connected, skipping');
        return;
      }

      source = ctx.createMediaElementSource(audio);
      connectedElements.add(audio);

      // Wire: source → analyser → destination (so user still hears audio)
      source.connect(analyser);
      analyser.connect(ctx.destination);

      analyserRef.current = analyser;
      sourceRef.current = source;
      smoothedRef.current = { ...EMPTY_BANDS };

      setIsActive(true);
      startAnalysisLoop();

      console.log('[AudioAnalyser] Connected to audio element');
    } catch (err) {
      console.error('[AudioAnalyser] Failed to connect audio element:', err);
    }
  }, [startAnalysisLoop]);

  // ── Connect Microphone Stream ──────────────────────────────────────────

  const connectMediaStream = useCallback((stream: MediaStream) => {
    try {
      const ctx = getAudioContext();

      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      disconnectInternal();

      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;

      const source = ctx.createMediaStreamSource(stream);
      // Mic → analyser only (don't connect to destination — avoids feedback)
      source.connect(analyser);

      analyserRef.current = analyser;
      sourceRef.current = source;
      smoothedRef.current = { ...EMPTY_BANDS };

      setIsActive(true);
      startAnalysisLoop();

      console.log('[AudioAnalyser] Connected to microphone stream');
    } catch (err) {
      console.error('[AudioAnalyser] Failed to connect microphone:', err);
    }
  }, [startAnalysisLoop]);

  // ── Disconnect ─────────────────────────────────────────────────────────

  const disconnectInternal = useCallback(() => {
    stopAnalysisLoop();

    if (sourceRef.current) {
      try { sourceRef.current.disconnect(); } catch { /* already disconnected */ }
      sourceRef.current = null;
    }
    if (analyserRef.current) {
      try { analyserRef.current.disconnect(); } catch { /* already disconnected */ }
      analyserRef.current = null;
    }
  }, [stopAnalysisLoop]);

  const disconnect = useCallback(() => {
    disconnectInternal();
    smoothedRef.current = { ...EMPTY_BANDS };
    setFrequencyBands(EMPTY_BANDS);
    setIsActive(false);
    console.log('[AudioAnalyser] Disconnected');
  }, [disconnectInternal]);

  // ── Cleanup on unmount ─────────────────────────────────────────────────

  useEffect(() => {
    return () => {
      stopAnalysisLoop();
      disconnectInternal();
    };
  }, [stopAnalysisLoop, disconnectInternal]);

  return {
    frequencyBands,
    isActive,
    connectAudioElement,
    connectMediaStream,
    disconnect,
  };
}
