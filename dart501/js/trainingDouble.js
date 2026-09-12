// trainingDouble.js
// Double Training — fokusér på at ramme udvalgte doubler,
// fx D20, D16, D10, i et fast antal forsøg pr. double.

import { renderDartKeypad, showBanner } from './ui.js';
import { SFX } from './sound.js';
import { saveTrainingBestIfBetter, getTrainingBests } from './storage.js';

const DEFAULT_TARGETS = [20, 16, 10, 8, 4];
const ATTEMPTS_PER_TARGET = 5;

let state = null;
let els = null;
let keypad = null;

export function initTrainingDoubleView(section) {
  els = {
    section,
    targetsInput: section.querySelector('#double-targets-input'),
    startBtn: section.querySelector('#double-start'),
    playArea: section.querySelector('#double-play-area'),
    currentTarget: section.querySelector('#double-current-target'),
    attemptsLeft: section.querySelector('#double-attempts-left'),
    resultsTable: section.querySelector('#double-results'),
    best: section.querySelector('#double-best'),
    keypadContainer: section.querySelector('#double-keypad'),
  };
  keypad = renderDartKeypad(els.keypadContainer, onDart);
  els.startBtn.addEventListener('click', startSession);
  renderBest();
}

function parseTargets() {
  const raw = els.targetsInput.value.trim();
  if (!raw) return DEFAULT_TARGETS;
  const nums = raw
    .split(',')
    .map((s) => parseInt(s.trim(), 10))
    .filter((n) => n >= 1 && n <= 20);
  return nums.length ? nums : DEFAULT_TARGETS;
}

function startSession() {
  const targets = parseTargets();
  state = {
    targets,
    targetIndex: 0,
    attemptsLeft: ATTEMPTS_PER_TARGET,
    results: targets.map((t) => ({ target: t, hits: 0, attempts: 0 })),
    finished: false,
  };
  els.playArea.hidden = false;
  render();
}

function onDart(dart) {
  if (!state || state.finished) return;
  const targetNum = state.targets[state.targetIndex];
  const result = state.results[state.targetIndex];
  result.attempts += 1;
  state.attemptsLeft -= 1;

  const hit = dart.ring === 'D' && dart.number === targetNum;
  if (hit) {
    result.hits += 1;
    SFX.success();
    showBanner('DOBBELT RAMT!', `D${targetNum}`, 'purple');
    nextTarget();
  } else {
    SFX.fail();
    if (state.attemptsLeft <= 0) nextTarget();
  }
  render();
}

function nextTarget() {
  state.targetIndex += 1;
  state.attemptsLeft = ATTEMPTS_PER_TARGET;
  if (state.targetIndex >= state.targets.length) {
    state.finished = true;
    const totalHits = state.results.reduce((s, r) => s + r.hits, 0);
    const totalAttempts = state.results.reduce((s, r) => s + r.attempts, 0);
    const pct = totalAttempts ? Math.round((totalHits / totalAttempts) * 100) : 0;
    const isNewBest = saveTrainingBestIfBetter('doubleTraining', pct, (a, b) => a > b);
    SFX.legWin();
    showBanner('DOUBLE TRAINING KLARET!', `${pct}% ramt${isNewBest ? ' — ny rekord! 🏆' : ''}`, 'gold');
  }
}

function renderBest() {
  const best = getTrainingBests().doubleTraining;
  els.best.textContent = best !== undefined ? `Personlig rekord: ${best}% ramt` : 'Ingen rekord endnu';
}

function render() {
  if (!state || !els) return;
  renderBest();

  if (state.finished) {
    els.currentTarget.textContent = '🎉 Session færdig!';
    els.attemptsLeft.textContent = '';
  } else {
    const t = state.targets[state.targetIndex];
    els.currentTarget.textContent = `Sigt efter: D${t}`;
    els.attemptsLeft.textContent = `Forsøg tilbage: ${state.attemptsLeft}`;
  }

  els.resultsTable.innerHTML = state.results
    .map((r) => {
      const pct = r.attempts ? Math.round((r.hits / r.attempts) * 100) : 0;
      return `<tr><td>D${r.target}</td><td>${r.hits}/${r.attempts}</td><td>${r.attempts ? pct + '%' : '–'}</td></tr>`;
    })
    .join('');

  keypad?.setEnabled(!state.finished);
}
