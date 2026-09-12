// ai.js
// Meget simpel "bot"-modstander: sigter efter et fornuftigt mål
// (checkout-rute eller T20) og rammer ved siden af med en vis
// sandsynlighed, afhængig af sværhedsgrad.

import { ALL_SEGMENTS, findCheckout, segmentByLabel } from './checkout.js';

export const AI_DIFFICULTIES = {
  easy: { label: 'Let', accuracy: 0.32 },
  medium: { label: 'Medium', accuracy: 0.52 },
  hard: { label: 'Svær', accuracy: 0.76 },
};

// Standard dartskive-rækkefølge (med uret), bruges til at finde
// "naboer" så en fejlramt pil ser realistisk ud.
const BOARD_ORDER = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

function neighboursOf(number) {
  const idx = BOARD_ORDER.indexOf(number);
  if (idx === -1) return [];
  const prev = BOARD_ORDER[(idx - 1 + BOARD_ORDER.length) % BOARD_ORDER.length];
  const next = BOARD_ORDER[(idx + 1) % BOARD_ORDER.length];
  return [prev, next];
}

function pickTarget(remaining, dartsLeft, doubleOut) {
  const route = findCheckout(remaining, dartsLeft, doubleOut);
  if (route && route.length) return route[0];
  // Ingen oplagt afslutning endnu — sats på stor scoring.
  return segmentByLabel('T20');
}

function nearbyMisses(target) {
  const pool = [];
  if (target.number <= 20) {
    neighboursOf(target.number).forEach((n) => {
      const s = segmentByLabel(`S${n}`);
      if (s) pool.push(s);
    });
  }
  if (target.ring === 'T') {
    const single = segmentByLabel(`S${target.number}`);
    const double = segmentByLabel(`D${target.number}`);
    if (single) pool.push(single);
    if (double) pool.push(double);
  } else if (target.ring === 'D') {
    const single = segmentByLabel(`S${target.number}`);
    if (single) pool.push(single);
  }
  return pool;
}

/**
 * Simulerer ét kast fra AI'en.
 * @returns {{label:string, value:number, number:number, ring:string}}
 */
export function aiThrowDart(remaining, dartsLeft, doubleOut, difficulty) {
  const target = pickTarget(remaining, dartsLeft, doubleOut);
  const accuracy = AI_DIFFICULTIES[difficulty]?.accuracy ?? 0.5;
  if (!target) return { label: 'MISS', value: 0, number: 0, ring: 'S' };
  if (Math.random() < accuracy) return target;

  const misses = nearbyMisses(target);
  if (misses.length && Math.random() < 0.85) {
    return misses[Math.floor(Math.random() * misses.length)];
  }
  return { label: 'MISS', value: 0, number: 0, ring: 'S' };
}

export function randomSegmentPool() {
  return ALL_SEGMENTS;
}
