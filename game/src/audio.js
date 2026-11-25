let ctx = null;

export function ensureAudio() {
  try {
    const AudioCtx = globalThis.AudioContext || globalThis.webkitAudioContext;
    if (!AudioCtx) return null;
    if (!ctx) ctx = new AudioCtx();
    if (ctx.state === 'suspended') {
      const res = ctx.resume();
      if (res && typeof res.catch === 'function') res.catch(() => {});
    }
    return ctx;
  } catch {
    return null;
  }
}

function tone(freq, seconds, type = 'sine', gain = 0.12, when = 0) {
  try {
    const audio = ensureAudio();
    if (!audio) return;
    const start = audio.currentTime + when;
    const osc = audio.createOscillator();
    const amp = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, start);
    amp.gain.setValueAtTime(0.0001, start);
    amp.gain.exponentialRampToValueAtTime(Math.max(0.0002, gain), start + 0.01);
    amp.gain.exponentialRampToValueAtTime(0.0001, start + seconds);
    osc.connect(amp);
    amp.connect(audio.destination);
    osc.start(start);
    osc.stop(start + seconds + 0.01);
  } catch {
    // Ignore WebAudio failures in restricted/headless contexts.
  }
}

export function playSound(name, muted = false) {
  if (muted) return;
  try {
    switch (name) {
      case 'place':
        tone(520, 0.07, 'triangle', 0.12, 0);
        break;
      case 'ready':
        tone(660, 0.11, 'sine', 0.12, 0);
        tone(880, 0.15, 'sine', 0.12, 0.09);
        break;
      case 'perfect':
        tone(784, 0.11, 'sine', 0.13, 0);
        tone(1046, 0.2, 'sine', 0.14, 0.09);
        break;
      case 'serve':
        tone(523, 0.1, 'sine', 0.12, 0);
        tone(659, 0.1, 'sine', 0.12, 0.08);
        tone(784, 0.18, 'sine', 0.14, 0.16);
        break;
      case 'burnt':
        tone(140, 0.28, 'sawtooth', 0.13, 0);
        break;
      case 'expire':
        tone(220, 0.14, 'square', 0.09, 0);
        tone(180, 0.22, 'square', 0.09, 0.13);
        break;
      case 'rush':
        tone(440, 0.11, 'square', 0.09, 0);
        tone(440, 0.11, 'square', 0.09, 0.16);
        break;
      case 'click':
        tone(700, 0.05, 'sine', 0.08, 0);
        break;
      default:
        break;
    }
  } catch {
    // Ignore audio errors.
  }
}
