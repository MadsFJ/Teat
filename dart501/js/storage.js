// storage.js
// Tynd wrapper omkring localStorage, så resten af appen aldrig
// rører JSON.parse/stringify eller try/catch direkte.

const KEYS = {
  MATCH_HISTORY: 'nuke501.matchHistory',
  TRAINING_BESTS: 'nuke501.trainingBests',
  SETTINGS: 'nuke501.settings',
};

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch (err) {
    console.warn('Kunne ikke læse', key, err);
    return fallback;
  }
}

function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch (err) {
    console.warn('Kunne ikke gemme', key, err);
  }
}

export function getSettings() {
  return loadJSON(KEYS.SETTINGS, { soundEnabled: true });
}

export function saveSettings(settings) {
  saveJSON(KEYS.SETTINGS, settings);
}

export function getMatchHistory() {
  return loadJSON(KEYS.MATCH_HISTORY, []);
}

export function addMatchToHistory(entry) {
  const history = getMatchHistory();
  history.unshift(entry);
  saveJSON(KEYS.MATCH_HISTORY, history.slice(0, 100));
}

export function clearMatchHistory() {
  saveJSON(KEYS.MATCH_HISTORY, []);
}

export function getTrainingBests() {
  return loadJSON(KEYS.TRAINING_BESTS, {});
}

/** Gemmer `value` for `key` hvis den er bedre end den eksisterende (via compareFn(a,b) -> true hvis a er bedre end b). */
export function saveTrainingBestIfBetter(key, value, compareFn) {
  const bests = getTrainingBests();
  const current = bests[key];
  if (current === undefined || compareFn(value, current)) {
    bests[key] = value;
    saveJSON(KEYS.TRAINING_BESTS, bests);
    return true;
  }
  return false;
}

export function clearAllData() {
  Object.values(KEYS).forEach((k) => localStorage.removeItem(k));
}
