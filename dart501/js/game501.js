// game501.js
// Kernen i 501-spillet: matchtilstand, bust-regler, statistik,
// AI-tur-simulering og rendering af selve spil-skærmen.

import { findCheckout, describeCheckout } from './checkout.js';
import { aiThrowDart, AI_DIFFICULTIES } from './ai.js';
import { renderDartKeypad, showBanner, fmtAvg } from './ui.js';
import { SFX } from './sound.js';
import { addMatchToHistory } from './storage.js';

function newPlayer(name, isAI) {
  return {
    name,
    isAI,
    score: 501,
    turnStartScore: 501,
    legsWon: 0,
    turnDarts: [],
    turnsThisLeg: 0,
    totalDartsThrown: 0,
    totalPointsScored: 0,
    first9Darts: 0,
    first9Points: 0,
    oneEighties: 0,
    highestCheckout: 0,
  };
}

/** @type {any} */
let match = null;
let keypad = null;
let aiRunning = false;

export function createMatch({ p1Name, p2Name, vsAI, aiDifficulty, doubleOut, legsToWin, startScore }) {
  match = {
    startScore,
    doubleOut,
    legsToWin,
    players: [newPlayer(p1Name || 'Spiller 1', false), newPlayer(p2Name || (vsAI ? 'CPU' : 'Spiller 2'), vsAI)],
    aiDifficulty,
    currentPlayerIndex: 0,
    legNumber: 1,
    legStarterIndex: 0,
    finished: false,
  };
  match.players.forEach((p) => {
    p.score = startScore;
    p.turnStartScore = startScore;
  });
  return match;
}

function currentPlayer() {
  return match.players[match.currentPlayerIndex];
}

function otherIndex() {
  return (match.currentPlayerIndex + 1) % 2;
}

function average(p) {
  return p.totalDartsThrown ? (p.totalPointsScored / p.totalDartsThrown) * 3 : 0;
}

function first9Average(p) {
  return p.first9Darts ? (p.first9Points / p.first9Darts) * 3 : 0;
}

function resetForNextLeg() {
  match.legNumber += 1;
  match.legStarterIndex = (match.legStarterIndex + 1) % 2;
  match.currentPlayerIndex = match.legStarterIndex;
  match.players.forEach((p) => {
    p.score = match.startScore;
    p.turnStartScore = match.startScore;
    p.turnDarts = [];
    p.turnsThisLeg = 0;
    p.first9Darts = 0;
    p.first9Points = 0;
  });
}

function finalizeMatch() {
  match.finished = true;
  const [a, b] = match.players;
  const winner = a.legsWon > b.legsWon ? a : b;
  addMatchToHistory({
    date: new Date().toISOString(),
    startScore: match.startScore,
    doubleOut: match.doubleOut,
    players: match.players.map((p) => ({
      name: p.name,
      isAI: p.isAI,
      legsWon: p.legsWon,
      average: average(p),
      first9Average: first9Average(p),
      oneEighties: p.oneEighties,
      highestCheckout: p.highestCheckout,
    })),
    winnerName: winner.name,
  });
  SFX.matchWin();
  showBanner('KAMP VUNDET!', `${winner.name} tager sejren — THE NUKE STYLE 🔥`, 'gold');
}

function endTurn(bust) {
  const p = currentPlayer();
  const turnPoints = p.turnDarts.reduce((sum, d) => sum + d.value, 0);
  const dartsThrown = p.turnDarts.length;

  p.totalDartsThrown += dartsThrown;
  if (!bust) p.totalPointsScored += turnPoints;

  if (p.turnsThisLeg < 3) {
    p.first9Darts += dartsThrown;
    if (!bust) p.first9Points += turnPoints;
  }
  p.turnsThisLeg += 1;

  if (!bust && turnPoints === 180) {
    p.oneEighties += 1;
    SFX.oneEighty();
    showBanner('180!', `${p.name} — ONE HUNDRED AND EIGHTYYY!`, 'gold');
  }

  p.turnDarts = [];
  match.currentPlayerIndex = otherIndex();
  currentPlayer().turnStartScore = currentPlayer().score;
}

/**
 * Behandler ét indtastet/simuleret kast for den aktive spiller.
 * @param {{label:string,value:number,ring:string}} dart
 */
export function processDart(dart) {
  if (!match || match.finished) return;
  const p = currentPlayer();
  if (p.turnDarts.length >= 3) return;

  const newScore = p.score - dart.value;
  const isLastDartOfTurn = p.turnDarts.length === 2;
  const isDoubleDart = dart.ring === 'D';

  const busts =
    newScore < 0 ||
    (match.doubleOut && newScore === 1) ||
    (newScore === 0 && match.doubleOut && !isDoubleDart);

  if (busts) {
    p.turnDarts.push({ ...dart, bust: true });
    p.score = p.turnStartScore;
    SFX.bust();
    showBanner('BUST!', `${p.name} — omgangen tæller ikke`, 'red');
    endTurn(true);
    afterDartRender();
    maybeRunAiTurn();
    return;
  }

  p.turnDarts.push(dart);
  p.score = newScore;
  SFX.dartHit();

  if (newScore === 0) {
    const checkoutValue = p.turnStartScore;
    p.highestCheckout = Math.max(p.highestCheckout, checkoutValue);
    endTurn(false);
    p.legsWon += 1;

    if (checkoutValue >= 100) SFX.highCheckout();
    else SFX.legWin();

    const legBanner =
      checkoutValue >= 100
        ? `${p.name} lukker på ${checkoutValue}! Vildt checkout — THE NUKE STYLE 🚀`
        : `${p.name} vinder legen!`;
    showBanner('GAME SHOT!', legBanner, checkoutValue >= 100 ? 'gold' : 'purple');

    if (p.legsWon >= match.legsToWin) {
      afterDartRender();
      finalizeMatch();
      return;
    }
    resetForNextLeg();
    afterDartRender();
    maybeRunAiTurn();
    return;
  }

  if (isLastDartOfTurn) {
    endTurn(false);
  }
  afterDartRender();
  maybeRunAiTurn();
}

function maybeRunAiTurn() {
  if (!match || match.finished || aiRunning) return;
  const p = currentPlayer();
  if (!p.isAI) return;
  aiRunning = true;
  keypad?.setEnabled(false);
  const throwNext = () => {
    if (!match || match.finished) {
      aiRunning = false;
      return;
    }
    const p2 = currentPlayer();
    if (!p2.isAI) {
      aiRunning = false;
      keypad?.setEnabled(true);
      return;
    }
    const dartsLeft = 3 - p2.turnDarts.length;
    const dart = aiThrowDart(p2.score, dartsLeft, match.doubleOut, match.aiDifficulty);
    processDart(dart);
    if (match && !match.finished && currentPlayer().isAI) {
      setTimeout(throwNext, 700);
    } else {
      aiRunning = false;
      keypad?.setEnabled(true);
    }
  };
  setTimeout(throwNext, 700);
}

function undoLastDart() {
  const p = currentPlayer();
  if (!p.turnDarts.length) return;
  const last = p.turnDarts.pop();
  if (!last.bust) p.score += last.value;
  afterDartRender();
}

// ---- Rendering ----

let els = null;

export function initGame501View(section) {
  els = {
    section,
    playerCards: section.querySelector('#p501-players'),
    legInfo: section.querySelector('#p501-leg-info'),
    checkoutBox: section.querySelector('#p501-checkout'),
    turnLog: section.querySelector('#p501-turn-log'),
    keypadContainer: section.querySelector('#p501-keypad'),
    quitBtn: section.querySelector('#p501-quit'),
  };
  keypad = renderDartKeypad(els.keypadContainer, processDart, undoLastDart);
  els.quitBtn.addEventListener('click', () => {
    if (confirm('Afslut kampen og gå til forsiden?')) {
      match = null;
      section.dispatchEvent(new CustomEvent('quit-match'));
    }
  });
}

function afterDartRender() {
  renderGame501();
}

export function renderGame501() {
  if (!match || !els) return;

  els.legInfo.textContent = match.finished
    ? `Kampen er slut`
    : `Leg ${match.legNumber} · Først til ${match.legsToWin} legs · ${
        match.doubleOut ? 'Double Out' : 'Straight Out'
      }`;

  els.playerCards.innerHTML = '';
  match.players.forEach((p, idx) => {
    const isActive = idx === match.currentPlayerIndex && !match.finished;
    const card = document.createElement('div');
    card.className = `player-card${isActive ? ' active' : ''}`;
    card.innerHTML = `
      <div class="player-name">${p.name}${p.isAI ? ' 🤖' : ''}</div>
      <div class="player-score">${p.score}</div>
      <div class="player-legs">Legs: ${p.legsWon}</div>
      <div class="player-stats">
        <span>Snit: ${fmtAvg(average(p))}</span>
        <span>Første 9: ${fmtAvg(first9Average(p))}</span>
        <span>180'ere: ${p.oneEighties}</span>
        <span>Bedste checkout: ${p.highestCheckout}</span>
      </div>
      <div class="turn-darts">${p.turnDarts
        .map((d) => `<span class="dart-chip${d.bust ? ' bust' : ''}">${d.label}</span>`)
        .join('') || (isActive ? '<span class="dart-chip placeholder">Kast!</span>' : '')}</div>
    `;
    els.playerCards.appendChild(card);
  });

  const active = currentPlayer();
  if (!match.finished && active.score <= 170) {
    const dartsLeft = 3 - active.turnDarts.length;
    const route = findCheckout(active.score, dartsLeft, match.doubleOut);
    els.checkoutBox.hidden = false;
    els.checkoutBox.innerHTML = route
      ? `<span class="checkout-label">Foreslået afslutning:</span> <span class="checkout-route">${describeCheckout(
          route
        )}</span>`
      : `<span class="checkout-label">Ingen oplagt afslutning fra ${active.score}</span>`;
  } else {
    els.checkoutBox.hidden = true;
  }

  keypad?.setEnabled(!match.finished && !active.isAI);
}

export function getMatch() {
  return match;
}
