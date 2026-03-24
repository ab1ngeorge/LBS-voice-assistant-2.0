// ─── Streaming Audio Playback Utility ─────────────────────────────────────
// Plays MP3 audio from a streaming Response using MediaSource API.
// Falls back to collecting chunks + Blob URL when MediaSource is unavailable.
// ─────────────────────────────────────────────────────────────────────────────

export interface StreamingAudioHandle {
  /** Resolves when playback finishes or is stopped */
  done: Promise<void>;
  /** Stop playback immediately */
  stop: () => void;
  /** The underlying Audio element (for external reference) */
  audio: HTMLAudioElement;
}

/**
 * Play audio streamed from a fetch Response body in real-time.
 * Uses MediaSource API if supported, otherwise falls back to Blob URL.
 */
export function playStreamingAudio(response: Response): StreamingAudioHandle {
  const audio = new Audio();
  let stopped = false;

  const stop = () => {
    stopped = true;
    audio.pause();
    audio.removeAttribute('src');
    audio.load(); // Release resources
  };

  const done = (async () => {
    if (!response.body) {
      throw new Error('No response body to stream');
    }

    const supportsMediaSource =
      'MediaSource' in window &&
      MediaSource.isTypeSupported('audio/mpeg');

    if (supportsMediaSource) {
      await playWithMediaSource(audio, response.body, () => stopped);
    } else {
      await playWithBlobFallback(audio, response.body, () => stopped);
    }
  })();

  return { done, stop, audio };
}

// ── MediaSource API (real-time playback) ──────────────────────────────────

async function playWithMediaSource(
  audio: HTMLAudioElement,
  body: ReadableStream<Uint8Array>,
  isStopped: () => boolean,
): Promise<void> {
  return new Promise<void>((resolve, reject) => {
    const mediaSource = new MediaSource();
    audio.src = URL.createObjectURL(mediaSource);

    mediaSource.addEventListener('sourceopen', async () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      const reader = body.getReader();

      try {
        while (true) {
          if (isStopped()) {
            reader.cancel();
            break;
          }

          const { done, value } = await reader.read();
          if (done) {
            // Wait for any pending append to finish before ending
            if (sourceBuffer.updating) {
              await waitForUpdateEnd(sourceBuffer);
            }
            if (mediaSource.readyState === 'open') {
              mediaSource.endOfStream();
            }
            break;
          }

          // Wait for previous append to complete
          if (sourceBuffer.updating) {
            await waitForUpdateEnd(sourceBuffer);
          }

          sourceBuffer.appendBuffer(new Uint8Array(value) as unknown as ArrayBuffer);
        }

        // Start playback as soon as we have initial data
        if (audio.paused && !isStopped()) {
          try { await audio.play(); } catch { /* user interaction required */ }
        }

        // Wait for playback to finish
        await new Promise<void>((res) => {
          if (audio.ended || isStopped()) return res();
          audio.addEventListener('ended', () => res(), { once: true });
          audio.addEventListener('error', () => res(), { once: true });
        });

        resolve();
      } catch (err) {
        if (!isStopped()) reject(err);
        else resolve();
      }
    });

    // Start playback early — MediaSource will buffer data
    audio.play().catch(() => {
      // Autoplay may be blocked — playback will start after user interaction
    });
  });
}

function waitForUpdateEnd(sourceBuffer: SourceBuffer): Promise<void> {
  return new Promise((resolve) => {
    if (!sourceBuffer.updating) return resolve();
    sourceBuffer.addEventListener('updateend', () => resolve(), { once: true });
  });
}

// ── Blob fallback (collect all chunks, then play) ─────────────────────────

async function playWithBlobFallback(
  audio: HTMLAudioElement,
  body: ReadableStream<Uint8Array>,
  isStopped: () => boolean,
): Promise<void> {
  const chunks: Uint8Array[] = [];
  const reader = body.getReader();

  while (true) {
    if (isStopped()) {
      reader.cancel();
      return;
    }
    const { done, value } = await reader.read();
    if (done) break;
    chunks.push(value);
  }

  if (isStopped()) return;

  const blob = new Blob(chunks.map(c => new Uint8Array(c) as unknown as BlobPart), { type: 'audio/mpeg' });
  const url = URL.createObjectURL(blob);
  audio.src = url;

  await audio.play();

  // Wait for playback to finish
  await new Promise<void>((resolve) => {
    audio.addEventListener('ended', () => {
      URL.revokeObjectURL(url);
      resolve();
    }, { once: true });
    audio.addEventListener('error', () => {
      URL.revokeObjectURL(url);
      resolve();
    }, { once: true });
  });
}
