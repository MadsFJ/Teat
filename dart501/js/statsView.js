// statsView.js
// Viser kamphistorik og personlige trænings-rekorder.

import { getMatchHistory, getTrainingBests, clearMatchHistory } from './storage.js';
import { fmtAvg } from './ui.js';

let els = null;

export function initStatsView(section) {
  els = {
    section,
    matchTable: section.querySelector('#stats-match-table'),
    trainingList: section.querySelector('#stats-training-list'),
    clearBtn: section.querySelector('#stats-clear'),
    empty: section.querySelector('#stats-empty'),
  };
  els.clearBtn.addEventListener('click', () => {
    if (confirm('Slet al kamphistorik? Dette kan ikke fortrydes.')) {
      clearMatchHistory();
      render();
    }
  });
}

export function render() {
  if (!els) return;
  const history = getMatchHistory();

  els.empty.hidden = history.length > 0;
  els.matchTable.innerHTML = history
    .map((m) => {
      const date = new Date(m.date).toLocaleString('da-DK');
      const rows = m.players
        .map(
          (p) =>
            `${p.name}${p.isAI ? ' 🤖' : ''}: ${p.legsWon} legs, snit ${fmtAvg(p.average)}, bedste checkout ${
              p.highestCheckout
            }, ${p.oneEighties}×180`
        )
        .join(' vs. ');
      return `<tr>
        <td>${date}</td>
        <td>${m.startScore} (${m.doubleOut ? 'Double Out' : 'Straight Out'})</td>
        <td>${rows}</td>
        <td><strong>${m.winnerName}</strong></td>
      </tr>`;
    })
    .join('');

  const bests = getTrainingBests();
  const items = [
    ['Around the Clock', bests.aroundTheClock !== undefined ? `${bests.aroundTheClock} kast` : '–'],
    ['Double Training', bests.doubleTraining !== undefined ? `${bests.doubleTraining}% ramt` : '–'],
    ['Scoring Drill', bests.scoringDrill !== undefined ? `${bests.scoringDrill} point` : '–'],
  ];
  els.trainingList.innerHTML = items
    .map(([name, val]) => `<div class="best-card"><span>${name}</span><strong>${val}</strong></div>`)
    .join('');
}
