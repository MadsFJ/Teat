// trainingClock.js
// "Around the Clock" — ram 1 til 20 og til sidst bull, i rækkefølge.

import { renderDartKeypad, showBanner } from './ui.js';
import { SFX } from './sound.js';
import { saveTrainingBestIfBetter, getTrainingBests } from './storage.js';

const SEQUENCE = [...Array(20)].map((_, i) => i + 1).concat(['BULL']);

let state = null;
let els = null;
let keypad = null;

export function initTrainingClockView(section) {
  els = {
    section,
    progress: section.querySelector('#clock-progress'),
    target: section.querySelector('#clock-target'),
    darts: section.querySelector('#clock-darts'),
    best: section.querySelector('#clock-best'),
    keypadContainer: section.querySelector('#clock-keypad'),
    restartBtn: section.querySelector('#clock-restart'),
  };
  keypad = renderDartKeypad(els.keypadContainer, onDart);
  els.restartBtn.addEventListener('click', startClock);
  startClock();
}

function startClock() {
  state = { index: 0, dartsThrown: 0, finished: false };
  render();
}

function onDart(dart) {
  if (!state || state.finished) return;
  state.dartsThrown += 1;
  const target = SEQUENCE[state.index];
  const hit = target === 'BULL' ? dart.number === 25 : dart.number === target;

  if (hit) {
    SFX.success();
    state.index += 1;
    if (state.index >= SEQUENCE.length) {
      state.finished = true;
      SFX.legWin();
      const isNewBest = saveTrainingBestIfBetter('aroundTheClock', state.dartsThrown, (a, b) => a < b);
      showBanner(
        'RUNDT OM URET KLARET!',
        `${state.dartsThrown} kast${isNewBest ? ' — ny personlig rekord! 🏆' : ''}`,
        'gold'
      );
    }
  } else {
    SFX.fail();
  }
  render();
}

function render() {
  if (!state || !els) return;
  const best = getTrainingBests().aroundTheClock;
  els.best.textContent = best ? `Personlig rekord: ${best} kast` : 'Ingen rekord endnu';
  els.darts.textContent = `Kast: ${state.dartsThrown}`;

  if (state.finished) {
    els.target.textContent = '🎉 Færdig!';
  } else {
    const target = SEQUENCE[state.index];
    els.target.textContent = target === 'BULL' ? 'Mål: BULL' : `Mål: ${target}`;
  }

  els.progress.innerHTML = SEQUENCE.map((t, i) => {
    const cls = i < state.index ? 'done' : i === state.index && !state.finished ? 'current' : '';
    return `<span class="clock-pip ${cls}">${t === 'BULL' ? '🎯' : t}</span>`;
  }).join('');

  keypad?.setEnabled(!state.finished);
}
