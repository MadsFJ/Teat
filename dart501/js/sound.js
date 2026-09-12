// sound.js
// Små syntetiske lydeffekter via Web Audio API — ingen lydfiler,
// ingen build-trin, virker offline.

import { getSettings } from './storage.js';

let ctx = null;

function getCtx() {
  if (!ctx) {
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    if (!AudioCtx) return null;
    ctx = new AudioCtx();
  }
  return ctx;
}

function isEnabled() {
  return getSettings().soundEnabled !== false;
}

/**
 * Spiller en enkelt tone.
 * @param {number} freq Hz
 * @param {number} startAt sekunder fra nu
 * @param {number} duration sekunder
 * @param {OscillatorType} type
 */
function tone(freq, startAt, duration, type = 'sine', gain = 0.18) {
  const audio = getCtx();
  if (!audio) return;
  const osc = audio.createOscillator();
  const g = audio.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = audio.currentTime + startAt;
  g.gain.setValueAtTime(0, t0);
  g.gain.linearRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
  osc.connect(g).connect(audio.destination);
  osc.start(t0);
  osc.stop(t0 + duration + 0.05);
}

function playSequence(notes) {
  if (!isEnabled()) return;
  const audio = getCtx();
  if (!audio) return;
  if (audio.state === 'suspended') audio.resume();
  notes.forEach(([freq, startAt, duration, type, gain]) => tone(freq, startAt, duration, type, gain));
}

export const SFX = {
  dartHit: () => playSequence([[520, 0, 0.08, 'square', 0.08]]),
  bust: () => playSequence([[200, 0, 0.18, 'sawtooth', 0.16], [140, 0.12, 0.25, 'sawtooth', 0.16]]),
  oneEighty: () =>
    playSequence([
      [660, 0, 0.14, 'square'],
      [880, 0.12, 0.14, 'square'],
      [1175, 0.24, 0.3, 'square'],
    ]),
  highCheckout: () =>
    playSequence([
      [523, 0, 0.12, 'triangle'],
      [659, 0.1, 0.12, 'triangle'],
      [784, 0.2, 0.3, 'triangle'],
    ]),
  legWin: () =>
    playSequence([
      [392, 0, 0.14, 'square'],
      [523, 0.12, 0.14, 'square'],
      [659, 0.24, 0.14, 'square'],
      [784, 0.36, 0.4, 'square'],
    ]),
  matchWin: () =>
    playSequence([
      [523, 0, 0.15, 'square'],
      [659, 0.14, 0.15, 'square'],
      [784, 0.28, 0.15, 'square'],
      [1046, 0.42, 0.5, 'square'],
    ]),
  success: () => playSequence([[700, 0, 0.1, 'triangle'], [1000, 0.08, 0.15, 'triangle']]),
  fail: () => playSequence([[220, 0, 0.2, 'sawtooth', 0.12]]),
};
