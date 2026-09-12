// main.js
// Appens indgangspunkt: kobler navigation, views og de enkelte
// spil-/træningsmoduler sammen.

import { registerView, showView } from './ui.js';
import * as Game501 from './game501.js';
import { initTrainingClockView } from './trainingClock.js';
import { initTrainingDoubleView } from './trainingDouble.js';
import { initTrainingScoringView } from './trainingScoring.js';
import * as StatsView from './statsView.js';
import { initSettingsView } from './settingsView.js';

function $(sel) {
  return document.querySelector(sel);
}

function registerAllViews() {
  document.querySelectorAll('.view').forEach((section) => {
    registerView(section.id.replace('view-', ''), section);
  });
}

function wireNav() {
  document.querySelectorAll('[data-view]').forEach((btn) => {
    btn.addEventListener('click', () => showView(btn.dataset.view));
  });
}

function wireSetup501() {
  const form = $('#setup501-form');
  const vsAiCheckbox = $('#setup-vs-ai');
  const p2NameField = $('#setup-p2-name-field');
  const aiDifficultyField = $('#setup-ai-difficulty-field');

  vsAiCheckbox.addEventListener('change', () => {
    p2NameField.hidden = vsAiCheckbox.checked;
    aiDifficultyField.hidden = !vsAiCheckbox.checked;
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const vsAI = vsAiCheckbox.checked;
    Game501.createMatch({
      p1Name: $('#setup-p1-name').value.trim() || 'Spiller 1',
      p2Name: vsAI ? 'CPU' : $('#setup-p2-name').value.trim() || 'Spiller 2',
      vsAI,
      aiDifficulty: $('#setup-ai-difficulty').value,
      doubleOut: $('#setup-double-out').checked,
      legsToWin: parseInt($('#setup-legs-to-win').value, 10) || 3,
      startScore: parseInt($('#setup-start-score').value, 10) || 501,
    });
    Game501.renderGame501();
    showView('game501');
  });
}

function wireGame501Quit() {
  const section = document.getElementById('view-game501');
  section.addEventListener('quit-match', () => showView('home'));
}

function wireHomeShortcuts() {
  document.querySelectorAll('[data-nav]').forEach((btn) => {
    btn.addEventListener('click', () => showView(btn.dataset.nav));
  });
}

function wireStatsRefreshOnShow() {
  // Re-render statistik hver gang man klikker sig ind på den, så tal er friske.
  document.querySelectorAll('[data-view="stats"], [data-nav="stats"]').forEach((btn) => {
    btn.addEventListener('click', () => StatsView.render());
  });
}

function init() {
  registerAllViews();
  wireNav();
  wireHomeShortcuts();
  wireSetup501();
  wireGame501Quit();

  Game501.initGame501View(document.getElementById('view-game501'));
  initTrainingClockView(document.getElementById('view-training-clock'));
  initTrainingDoubleView(document.getElementById('view-training-double'));
  initTrainingScoringView(document.getElementById('view-training-scoring'));
  StatsView.initStatsView(document.getElementById('view-stats'));
  initSettingsView(document.getElementById('view-settings'));

  wireStatsRefreshOnShow();
  StatsView.render();

  showView('home');
}

document.addEventListener('DOMContentLoaded', init);
