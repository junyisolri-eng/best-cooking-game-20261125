// Tiny synthesized sounds: no audio files, everything is an oscillator blip.
export function createSound() {
  let ctx = null;
  function ensure() {
    if (ctx) return ctx;
    try {
      const AC = window.AudioContext || window.webkitAudioContext;
      ctx = AC ? new AC() : null;
    } catch {
      ctx = null;
    }
    return ctx;
  }
  function blip(freq, dur, type = 'sine', gain = 0.08, slide = 0) {
    const ac = ensure();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const g = ac.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ac.currentTime);
      if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), ac.currentTime + dur);
      g.gain.setValueAtTime(gain, ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      osc.connect(g).connect(ac.destination);
      osc.start();
      osc.stop(ac.currentTime + dur);
    } catch {
      // Sound is garnish: never let it break the game.
    }
  }
  return {
    chop: () => blip(220, 0.07, 'square', 0.05, -80),
    sizzle: () => blip(520, 0.12, 'sawtooth', 0.04, 180),
    ding: () => { blip(880, 0.18, 'sine', 0.09); setTimeout(() => blip(1320, 0.22, 'sine', 0.07), 90); },
    buzz: () => blip(140, 0.25, 'sawtooth', 0.08, -40),
    tick: () => blip(1000, 0.04, 'sine', 0.04),
  };
}
