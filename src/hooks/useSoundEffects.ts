import { useCallback, useRef, useEffect } from 'react';

export function useSoundEffects() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    gainNodeRef.current = audioContextRef.current.createGain();
    gainNodeRef.current.connect(audioContextRef.current.destination);
    gainNodeRef.current.gain.value = 0.3;

    return () => {
      audioContextRef.current?.close();
    };
  }, []);

  const playTone = useCallback((frequency: number, duration: number, type: OscillatorType = 'square') => {
    const ctx = audioContextRef.current;
    const gain = gainNodeRef.current;
    if (!ctx || !gain) return;

    if (ctx.state === 'suspended') {
      ctx.resume();
    }

    const oscillator = ctx.createOscillator();
    const noteGain = ctx.createGain();
    
    oscillator.type = type;
    oscillator.frequency.setValueAtTime(frequency, ctx.currentTime);
    
    noteGain.gain.setValueAtTime(0.3, ctx.currentTime);
    noteGain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
    
    oscillator.connect(noteGain);
    noteGain.connect(gain);
    
    oscillator.start(ctx.currentTime);
    oscillator.stop(ctx.currentTime + duration);
  }, []);

  const playHit = useCallback(() => {
    playTone(440, 0.1, 'square');
    setTimeout(() => playTone(880, 0.05, 'square'), 30);
  }, [playTone]);

  const playKill = useCallback(() => {
    playTone(523, 0.08, 'square');
    setTimeout(() => playTone(659, 0.08, 'square'), 50);
    setTimeout(() => playTone(784, 0.1, 'square'), 100);
  }, [playTone]);

  const playDamage = useCallback(() => {
    playTone(150, 0.2, 'sawtooth');
    setTimeout(() => playTone(100, 0.15, 'sawtooth'), 50);
  }, [playTone]);

  const playLevelUp = useCallback(() => {
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.15, 'square'), i * 100);
    });
  }, [playTone]);

  const playBossSpawn = useCallback(() => {
    playTone(100, 0.5, 'sawtooth');
    setTimeout(() => playTone(80, 0.5, 'sawtooth'), 200);
    setTimeout(() => playTone(60, 0.8, 'sawtooth'), 400);
  }, [playTone]);

  const playBossKill = useCallback(() => {
    const notes = [392, 494, 587, 784, 988, 1175];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.2, 'square'), i * 80);
    });
  }, [playTone]);

  const playTyping = useCallback(() => {
    playTone(800 + Math.random() * 400, 0.03, 'square');
  }, [playTone]);

  const playArtifact = useCallback(() => {
    const notes = [440, 554, 659, 880];
    notes.forEach((freq, i) => {
      setTimeout(() => playTone(freq, 0.12, 'sine'), i * 120);
    });
  }, [playTone]);

  return {
    playHit,
    playKill,
    playDamage,
    playLevelUp,
    playBossSpawn,
    playBossKill,
    playTyping,
    playArtifact
  };
}
