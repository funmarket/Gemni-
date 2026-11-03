// High-fidelity programmatic audio and sound synthesis utility module for Paltalk Chatrooms

// Programmatic Web Audio synthesizer: offline fallback when direct MP3s fail or network is slow
export const synthesizeSoundFallback = (ctx: AudioContext, type: string) => {
  try {
    if (ctx.state === 'suspended') {
      ctx.resume();
    }
    const now = ctx.currentTime;
    const resolvedKey = type.toLowerCase().trim();

    if (resolvedKey === 'welcome') {
      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(523.25, now);
      osc1.frequency.exponentialRampToValueAtTime(1046.5, now + 0.35);

      osc2.type = 'triangle';
      osc2.frequency.setValueAtTime(659.25, now);
      osc2.frequency.exponentialRampToValueAtTime(1318.51, now + 0.35);

      gain.gain.setValueAtTime(0.15, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.4);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } else if (resolvedKey === 'clap' || resolvedKey === 'applause') {
      for (let i = 0; i < 12; i++) {
        const delay = i * 0.08 + Math.random() * 0.03;
        const duration = 0.06 + Math.random() * 0.04;
        const bufferSize = ctx.sampleRate * duration;
        const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        const noise = ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(1100 + (Math.random() - 0.5) * 350, now + delay);
        filter.Q.setValueAtTime(3.5, now + delay);

        const gainNode = ctx.createGain();
        gainNode.gain.setValueAtTime(0.001, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.25, now + delay + 0.004);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + duration);

        noise.connect(filter);
        filter.connect(gainNode);
        gainNode.connect(ctx.destination);

        noise.start(now + delay);
        noise.stop(now + delay + duration);
      }
    } else if (resolvedKey === 'laugh' || resolvedKey === 'laughter') {
      for (let i = 0; i < 6; i++) {
        const delay = i * 0.16;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gainNode = ctx.createGain();
        const baseFreq = 220 + (i * 22) + Math.sin(i) * 12;

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(baseFreq, now + delay);
        osc1.frequency.linearRampToValueAtTime(baseFreq * 1.5, now + delay + 0.12);

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(baseFreq * 1.05, now + delay);
        osc2.frequency.linearRampToValueAtTime(baseFreq * 1.45, now + delay + 0.12);

        gainNode.gain.setValueAtTime(0.001, now + delay);
        gainNode.gain.linearRampToValueAtTime(0.12, now + delay + 0.03);
        gainNode.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.15);

        osc1.connect(gainNode);
        osc2.connect(gainNode);
        gainNode.connect(ctx.destination);

        osc1.start(now + delay);
        osc1.stop(now + delay + 0.16);
        osc2.start(now + delay);
        osc2.stop(now + delay + 0.16);
      }
    } else if (resolvedKey === 'wow' || resolvedKey === 'surprise') {
      const duration = 0.55;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(330, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.25);
      osc.frequency.linearRampToValueAtTime(587.33, now + duration);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.06);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } else if (resolvedKey === 'airhorn') {
      const frequencies = [220, 247, 330, 392];
      const duration = 0.65;

      frequencies.forEach((f) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(f, now);

        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now);
        osc.stop(now + duration);
      });
    } else if (resolvedKey === 'fart') {
      const duration = 0.35;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(80, now);
      osc.frequency.linearRampToValueAtTime(45, now + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(180, now);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.35, now + 0.02);
      gainNode.gain.setValueAtTime(0.35, now + duration - 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } else if (resolvedKey === 'crickets') {
      for (let chirp = 0; chirp < 3; chirp++) {
        const chirpDelay = chirp * 1.1;
        for (let pulse = 0; pulse < 4; pulse++) {
          const delay = chirpDelay + pulse * 0.07;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(4100, now + delay);

          gain.gain.setValueAtTime(0.001, now + delay);
          gain.gain.linearRampToValueAtTime(0.04, now + delay + 0.015);
          gain.gain.exponentialRampToValueAtTime(0.001, now + delay + 0.045);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(now + delay);
          osc.stop(now + delay + 0.05);
        }
      }
    } else if (resolvedKey === 'scream') {
      const duration = 0.85;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gainNode = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(420, now);

      const fmg = ctx.createGain();
      const fmo = ctx.createOscillator();
      fmo.frequency.setValueAtTime(55, now);
      fmg.gain.setValueAtTime(250, now);

      fmo.connect(fmg);
      fmg.connect(osc.frequency);

      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1800, now);
      filter.frequency.exponentialRampToValueAtTime(800, now + duration);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.18, now + 0.04);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      fmo.start(now);
      osc.start(now);
      fmo.stop(now + duration);
      osc.stop(now + duration);
    } else if (resolvedKey === 'wiou') {
      const duration = 0.5;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(350, now);
      osc.frequency.exponentialRampToValueAtTime(880, now + 0.15);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.35);
      osc.frequency.linearRampToValueAtTime(500, now + 0.48);

      gainNode.gain.setValueAtTime(0.001, now);
      gainNode.gain.linearRampToValueAtTime(0.2, now + 0.05);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + duration);
    } else {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(880, now);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.25);
    }
  } catch (e) {
    console.warn('Synthesis fallback exception:', e);
  }
};

// Helper to generate dynamic retro sci-fi space frequencies playable WAV blob
export const generateSimulatedWavBlob = (durationSeconds: number): Blob => {
  const sampleRate = 8000;
  const numSamples = sampleRate * durationSeconds;
  const buffer = new ArrayBuffer(44 + numSamples);
  const view = new DataView(buffer);

  const writeString = (v: DataView, offset: number, str: string) => {
    for (let i = 0; i < str.length; i++) {
      v.setUint8(offset + i, str.charCodeAt(i));
    }
  };

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + numSamples, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw PCM) */
  view.setUint16(20, 1, true);
  /* channel count (mono) */
  view.setUint16(22, 1, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, 1, true);
  /* bits per sample */
  view.setUint16(34, 8, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, numSamples, true);

  // Generate nice retro science-fiction modular beep frequencies
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const freq = 420 + 130 * Math.sin(2 * Math.PI * 1.5 * t) + 60 * Math.cos(2 * Math.PI * 0.5 * t);
    const sample = Math.sin(2 * Math.PI * freq * t) * 0.75;
    const byteVal = Math.floor((sample + 1.0) * 127.5);
    view.setUint8(44 + i, byteVal);
  }

  return new Blob([buffer], { type: 'audio/wav' });
};

// Play synthetic vocal melody live on clicks
export const playLiveSyntheticMelody = (ctx: AudioContext, id: string) => {
  try {
    if (ctx.state === 'suspended') ctx.resume();

    const parser = id.split('_');
    const seedVal = parseInt(parser[3] || '25', 10);
    const notes = [
      349.23, // F4
      392.00, // G4
      440.00, // A4
      523.25, // C5
      587.33, // D5
      659.25, // E5
      698.46, // F5
      783.99, // G5
      840.00  // A5
    ];

    const now = ctx.currentTime;
    let noteDelay = 0;

    for (let i = 0; i < 5; i++) {
      const noteIndex = (seedVal + i * 3) % notes.length;
      const freq = notes[noteIndex];

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = i % 2 === 0 ? 'sine' : 'triangle';
      osc.frequency.setValueAtTime(freq, now + noteDelay);
      gain.gain.setValueAtTime(0.12, now + noteDelay);
      gain.gain.exponentialRampToValueAtTime(0.001, now + noteDelay + 0.25);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + noteDelay);
      osc.stop(now + noteDelay + 0.35);

      noteDelay += 0.18;
    }
  } catch (e) {
    console.warn('Synth scale playback error:', e);
  }
};
