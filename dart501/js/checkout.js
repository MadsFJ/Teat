// checkout.js
// Alle mulige dart-felter samt en algoritme der finder en gyldig
// nedtælling ("checkout") fra en given rest-score til nøjagtigt 0
// på maks. 3 pile — valgfrit med krav om at sidste pil er en double.

/** @typedef {{label:string, value:number, number:number, ring:'S'|'D'|'T'}} Segment */

/** @type {Segment[]} */
export const ALL_SEGMENTS = [];

for (let n = 1; n <= 20; n++) {
  ALL_SEGMENTS.push({ label: `S${n}`, value: n, number: n, ring: 'S' });
  ALL_SEGMENTS.push({ label: `D${n}`, value: n * 2, number: n, ring: 'D' });
  ALL_SEGMENTS.push({ label: `T${n}`, value: n * 3, number: n, ring: 'T' });
}
ALL_SEGMENTS.push({ label: 'SB', value: 25, number: 25, ring: 'S' }); // single bull
ALL_SEGMENTS.push({ label: 'DB', value: 50, number: 25, ring: 'D' }); // double bull

const BY_LABEL = new Map(ALL_SEGMENTS.map((s) => [s.label, s]));

// Sorteret faldende efter værdi — bruges til at "gætte" store,
// realistiske scoringskast før man leder efter den afsluttende double.
const SORTED_DESC = [...ALL_SEGMENTS].sort((a, b) => b.value - a.value);

export function isDouble(segment) {
  return !!segment && segment.ring === 'D';
}

export function isTriple(segment) {
  return !!segment && segment.ring === 'T';
}

/**
 * Finder ét segment der rammer `value` præcis.
 * @param {number} value
 * @param {boolean} requireDouble
 * @returns {Segment|null}
 */
function findExactSegment(value, requireDouble) {
  if (value <= 0) return null;
  if (requireDouble) {
    if (value === 50) return BY_LABEL.get('DB');
    if (value % 2 === 0 && value / 2 <= 20) return BY_LABEL.get(`D${value / 2}`);
    return null;
  }
  if (value <= 20) return BY_LABEL.get(`S${value}`);
  if (value === 25) return BY_LABEL.get('SB');
  if (value === 50) return BY_LABEL.get('DB');
  if (value % 2 === 0 && value / 2 <= 20) return BY_LABEL.get(`D${value / 2}`);
  if (value % 3 === 0 && value / 3 <= 20) return BY_LABEL.get(`T${value / 3}`);
  return null;
}

/**
 * Rekursivt forsøg på at finde en pil-for-pil rute på præcis `dartsCount`
 * pile der lander på nøjagtigt 0. Kun den sidste pil skal opfylde
 * doubleOut-kravet.
 * @param {number} remaining
 * @param {number} dartsCount
 * @param {boolean} doubleOut
 * @returns {Segment[]|null}
 */
function tryExactRoute(remaining, dartsCount, doubleOut) {
  if (dartsCount === 1) {
    const seg = findExactSegment(remaining, doubleOut);
    return seg ? [seg] : null;
  }
  for (const seg of SORTED_DESC) {
    if (seg.value >= remaining) continue; // skal levne noget til resten
    const rest = tryExactRoute(remaining - seg.value, dartsCount - 1, doubleOut);
    if (rest) return [seg, ...rest];
  }
  return null;
}

/**
 * Find en foreslået checkout-rute.
 * @param {number} remaining Point tilbage
 * @param {number} dartsLeft Pile tilbage i den aktuelle omgang (1-3)
 * @param {boolean} doubleOut Kræver double for at lukke
 * @returns {Segment[]|null} liste af segmenter, eller null hvis umuligt
 */
export function findCheckout(remaining, dartsLeft, doubleOut) {
  if (remaining <= 0 || remaining > 170) return null;
  if (doubleOut && remaining === 1) return null; // klassisk "bogey"-rest
  const maxDarts = Math.max(0, Math.min(3, dartsLeft));
  for (let n = 1; n <= maxDarts; n++) {
    const route = tryExactRoute(remaining, n, doubleOut);
    if (route) return route;
  }
  return null;
}

/** Formatér en rute til visning, fx "T20 · T20 · D20". */
export function describeCheckout(route) {
  if (!route || !route.length) return null;
  return route.map((s) => s.label).join(' · ');
}

export function segmentByLabel(label) {
  return BY_LABEL.get(label) || null;
}
