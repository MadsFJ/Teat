// trainingScoring.js
// Scoring Drill — 10 omgange á 3 pile, saml så mange point som muligt
// (fokus på T20).

import { renderDartKeypad, showBanner } from './ui.js';
import { SFX } from './sound.js';
import { saveTrainingBestIfBetter, getTrainingBests } from './storage.js';

const ROUNDS = 10;

let state = null;
let els = null;
let keypad = null;

export function initTrainingScoringView(section) {
  els = {
    section,
    round: section.querySelector('#scoring-round'),
    total: section.querySelector('#scoring-total'),
    turnDarts: section.querySelector('#scoring-turn-darts'),
    history: section.querySelector('#scoring-history'),
    best: section.querySelector('#scoring-best'),
    keypadContainer: section.querySelector('#scoring-keypad'),
    restartBtn: section.querySelector('#scoring-restart'),
  };
  keypad = renderDartKeypad(els.keypadContainer, onDart);
  els.restartBtn.addEventListener('click', startDrill);
  startDrill();
}

function startDrill() {
  state = { round: 0, total: 0, turnDarts: [], rounds: [], finished: false };
  render();
}

function onDart(dart) {
  if (!state || state.finished) return;
  state.turnDarts.push(dart);
  if (dart.label === 'T20') SFX.oneEighty();
  else SFX.dartHit();

  if (state.turnDarts.length === 3) {
    const roundPoints = state.turnDarts.reduce((s, d) => s + d.value, 0);
    state.rounds.push({ darts: state.turnDarts, points: roundPoints });
    state.total += roundPoints;
    if (roundPoints === 180) showBanner('180!', 'Maks score i omgangen — THE NUKE STYLE 🔥', 'gold');
    state.turnDarts = [];
    state.round += 1;

    if (state.round >= ROUNDS) {
      state.finished = true;
      const isNewBest = saveTrainingBestIfBetter('scoringDrill', state.total, (a, b) => a > b);
      SFX.legWin();
      showBanner(
        'SCORING DRILL FÆRDIG!',
        `${state.total} point i alt${isNewBest ? ' — ny personlig rekord! 🏆' : ''}`,
        'gold'
      );
    }
  }
  render();
}

function render() {
  if (!state || !els) return;
  const best = getTrainingBests().scoringDrill;
  els.best.textContent = best !== undefined ? `Personlig rekord: ${best} point` : 'Ingen rekord endnu';
  els.round.textContent = state.finished ? 'Færdig!' : `Omgang ${state.round + 1} / ${ROUNDS}`;
  els.total.textContent = `Total: ${state.total}`;
  els.turnDarts.innerHTML = state.turnDarts.map((d) => `<span class="dart-chip">${d.label}</span>`).join('');

  els.history.innerHTML = state.rounds
    .map(
      (r, i) =>
        `<tr><td>${i + 1}</td><td>${r.darts.map((d) => d.label).join(', ')}</td><td>${r.points}</td></tr>`
    )
    .join('');

  keypad?.setEnabled(!state.finished);
}
