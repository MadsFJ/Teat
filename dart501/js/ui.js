// ui.js
// Genbrugelige UI-byggeklodser: dart-tastatur og "STORT BANNER"-effekter
// (180'ere, checkouts, leg-sejre osv.), samt simpel view-router.

/**
 * Bygger et dart-indtastnings-tastatur (Single/Double/Triple + tal-grid)
 * inde i `container`.
 * @param {HTMLElement} container
 * @param {(dart:{label:string,value:number,number:number,ring:string})=>void} onDart
 * @param {()=>void} [onUndo]
 */
export function renderDartKeypad(container, onDart, onUndo) {
  container.innerHTML = '';
  container.classList.add('dart-keypad');

  let mult = 'S';

  const multRow = document.createElement('div');
  multRow.className = 'mult-row';
  const mults = [
    ['S', 'SINGLE', 1],
    ['D', 'DOUBLE', 2],
    ['T', 'TRIPLE', 3],
  ];
  const multButtons = {};
  mults.forEach(([key, text]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = `mult-btn mult-${key}`;
    btn.textContent = text;
    if (key === 'S') btn.classList.add('active');
    btn.addEventListener('click', () => {
      mult = key;
      Object.values(multButtons).forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      bullBtn.disabled = key === 'T';
      bullBtn.classList.toggle('disabled', key === 'T');
    });
    multButtons[key] = btn;
    multRow.appendChild(btn);
  });
  container.appendChild(multRow);

  const grid = document.createElement('div');
  grid.className = 'number-grid';
  for (let n = 1; n <= 20; n++) {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'num-btn';
    btn.textContent = String(n);
    btn.addEventListener('click', () => {
      const value = n * (mult === 'S' ? 1 : mult === 'D' ? 2 : 3);
      onDart({ label: `${mult}${n}`, value, number: n, ring: mult });
    });
    grid.appendChild(btn);
  }
  container.appendChild(grid);

  const specialRow = document.createElement('div');
  specialRow.className = 'special-row';

  const bullBtn = document.createElement('button');
  bullBtn.type = 'button';
  bullBtn.className = 'special-btn bull-btn';
  bullBtn.textContent = 'BULL';
  bullBtn.addEventListener('click', () => {
    if (mult === 'T') return;
    const value = mult === 'D' ? 50 : 25;
    onDart({ label: mult === 'D' ? 'DB' : 'SB', value, number: 25, ring: mult === 'D' ? 'D' : 'S' });
  });
  specialRow.appendChild(bullBtn);

  const missBtn = document.createElement('button');
  missBtn.type = 'button';
  missBtn.className = 'special-btn miss-btn';
  missBtn.textContent = 'MISS';
  missBtn.addEventListener('click', () => onDart({ label: 'MISS', value: 0, number: 0, ring: 'S' }));
  specialRow.appendChild(missBtn);

  if (onUndo) {
    const undoBtn = document.createElement('button');
    undoBtn.type = 'button';
    undoBtn.className = 'special-btn undo-btn';
    undoBtn.textContent = '↩ FORTRYD';
    undoBtn.addEventListener('click', onUndo);
    specialRow.appendChild(undoBtn);
  }

  container.appendChild(specialRow);

  return {
    setEnabled(enabled) {
      container.querySelectorAll('button').forEach((b) => (b.disabled = !enabled));
    },
  };
}

let bannerTimeout = null;

/**
 * Viser et stort neon-banner midt på skærmen i et par sekunder.
 * @param {string} title
 * @param {string} [subtitle]
 * @param {'gold'|'purple'|'red'} [tone]
 */
export function showBanner(title, subtitle = '', tone = 'gold') {
  const el = document.getElementById('big-banner');
  if (!el) return;
  clearTimeout(bannerTimeout);
  el.className = `big-banner tone-${tone} show`;
  el.innerHTML = `<div class="banner-title">${title}</div>${
    subtitle ? `<div class="banner-subtitle">${subtitle}</div>` : ''
  }`;
  bannerTimeout = setTimeout(() => {
    el.classList.remove('show');
  }, 2600);
}

const VIEWS = new Map();

export function registerView(id, section) {
  VIEWS.set(id, section);
}

export function showView(id) {
  VIEWS.forEach((section, key) => {
    section.hidden = key !== id;
  });
  document.querySelectorAll('.nav-btn').forEach((btn) => {
    btn.classList.toggle('active', btn.dataset.view === id);
  });
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

export function fmtAvg(n) {
  if (!isFinite(n) || isNaN(n)) return '0.00';
  return n.toFixed(2);
}
