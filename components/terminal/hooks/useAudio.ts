import { useState, useCallback } from 'react';

type ToneModule = typeof import('tone');
let toneModule: ToneModule | null = null;
const loadTone = async (): Promise<ToneModule> => {
  if (!toneModule) {
    toneModule = await import('tone');
  }
  return toneModule;
};

export function useAudio() {
  const [toneStarted, setToneStarted] = useState(false);

  const initTone = useCallback(async () => {
    if (toneStarted) return;
    const Tone = await loadTone();
    await Tone.start();
    setToneStarted(true);
  }, [toneStarted]);

  const playChime = useCallback(async () => {
    if (!toneStarted) return;
    const Tone = await loadTone();
    const synth = new Tone.Synth({
      oscillator: { type: 'sine' },
      envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
      volume: -18,
    }).toDestination();
    const now = Tone.now();
    synth.triggerAttackRelease('C5', '16n', now);
    setTimeout(async () => {
      const Tone = await loadTone();
      const synth2 = new Tone.Synth({
        oscillator: { type: 'sine' },
        envelope: { attack: 0.005, decay: 0.15, sustain: 0, release: 0.1 },
        volume: -18,
      }).toDestination();
      synth2.triggerAttackRelease('E5', '16n');
    }, 100);
  }, [toneStarted]);

  return { initTone, playChime };
}
