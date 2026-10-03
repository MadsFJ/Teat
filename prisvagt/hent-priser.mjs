// Prisvagt: henter prisen på et produkt (som udgangspunkt Linie Akvavit) fra
// butikkerne i butikker.json, gemmer prishistorikken i historik.json og slår
// alarm, når prisen falder eller kommer under målprisen.
// Køres af GitHub Actions (.github/workflows/prisvagt.yml).
//
// Brug: node prisvagt/hent-priser.mjs
// Miljøvariabler (valgfrie):
//   ALARM_FIL   – skriv alarmtekst (Markdown) hertil, hvis der er nyheder
//   NTFY_TOPIC  – send også en push-besked via https://ntfy.sh/<emne>
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const TIMEOUT_MS = 20000;
// Priser uden for dette interval er næsten sikkert noget andet end en flaske
// (fragt, pant, gavekort, kasser osv.).
const MIN_PRIS = 40;
const MAX_PRIS = 1500;

// "1.099,95" → 1099.95, "109,-" → 109, "109.00" → 109
export function tilTal(tekst) {
  let s = String(tekst).trim().replace(/[^\d.,]/g, '');
  if (!s) return NaN;
  if (s.includes(',')) s = s.replace(/\./g, '').replace(',', '.');
  else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, '');
  return parseFloat(s);
}

function* gennemgaa(node) {
  if (Array.isArray(node)) { for (const n of node) yield* gennemgaa(n); return; }
  if (!node || typeof node !== 'object') return;
  yield node;
  for (const v of Object.values(node)) if (v && typeof v === 'object') yield* gennemgaa(v);
}

function harType(node, type) {
  const t = node['@type'];
  return Array.isArray(t) ? t.includes(type) : t === type;
}

function prisFraOffers(offers) {
  const ud = [];
  for (const o of gennemgaa(offers)) {
    for (const k of ['price', 'lowPrice']) if (o[k] != null) ud.push(tilTal(o[k]));
  }
  return ud;
}

// 1) schema.org JSON-LD – de fleste webshops bruger det til Google Shopping.
function fraJsonLd(html, noegleord) {
  const ud = [];
  const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
  for (const m of html.matchAll(re)) {
    let data;
    try { data = JSON.parse(m[1].trim()); } catch { continue; }
    for (const node of gennemgaa(data)) {
      if (!harType(node, 'Product') || !node.offers) continue;
      if (noegleord && node.name && !String(node.name).toLowerCase().includes(noegleord)) continue;
      ud.push(...prisFraOffers(node.offers));
    }
  }
  return ud;
}

// 2) Meta-tags / microdata på produktsider.
function fraMeta(html) {
  const ud = [];
  const re = /<meta[^>]+(?:property|itemprop|name)=["'](?:product:price:amount|og:price:amount|price)["'][^>]*>/gi;
  for (const m of html.matchAll(re)) {
    const c = m[0].match(/content=["']([^"']+)["']/i);
    if (c) ud.push(tilTal(c[1]));
  }
  return ud;
}

// 3) Nødløsning: beløb med "kr" kort efter nøgleordet i sidens tekst.
function fraTekst(html, noegleord) {
  if (!noegleord) return [];
  const tekst = html
    .replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;|&#160;/g, ' ')
    .replace(/\s+/g, ' ')
    .toLowerCase();
  const ud = [];
  let i = tekst.indexOf(noegleord);
  while (i !== -1) {
    const bid = tekst.slice(i, i + 300);
    for (const m of bid.matchAll(/(\d{1,3}(?:\.\d{3})*(?:,\d{1,2})?)\s*(?:,-\s*)?(?:kr\.?|dkk)/g)) ud.push(tilTal(m[1]));
    i = tekst.indexOf(noegleord, i + noegleord.length);
  }
  return ud;
}

export function findPris(html, butik) {
  const noegleord = (butik.noegleord || '').toLowerCase();
  const gyldig = p => Number.isFinite(p) && p >= MIN_PRIS && p <= MAX_PRIS;
  let kandidater;
  if (butik.regex) {
    kandidater = [...html.matchAll(new RegExp(butik.regex, 'g'))].map(m => tilTal(m[1]));
    return { pris: Math.min(...kandidater.filter(gyldig)), metode: 'regex' };
  }
  for (const [metode, fn] of [['json-ld', fraJsonLd], ['meta', fraMeta], ['tekst', fraTekst]]) {
    kandidater = fn(html, noegleord).filter(gyldig);
    if (kandidater.length) return { pris: Math.min(...kandidater), metode };
  }
  return { pris: NaN, metode: null };
}

async function hent(url) {
  const res = await fetch(url, {
    signal: AbortSignal.timeout(TIMEOUT_MS),
    headers: {
      // En almindelig browser-UA – mange webshops afviser ukendte klienter.
      'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0 Safari/537.36',
      'Accept': 'text/html,application/xhtml+xml',
      'Accept-Language': 'da-DK,da;q=0.9,en;q=0.5'
    }
  });
  if (!res.ok) throw new Error('HTTP ' + res.status);
  return res.text();
}

const kr = p => p.toLocaleString('da-DK', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' kr';

async function main() {
  const config = JSON.parse(await readFile(path.join(here, 'butikker.json'), 'utf8'));
  const historikFil = path.join(here, 'historik.json');
  let historik;
  try { historik = JSON.parse(await readFile(historikFil, 'utf8')); } catch { historik = { butikker: {} }; }
  historik.produkt = config.produkt;
  historik.maalpris = config.maalpris ?? null;

  const nu = new Date().toISOString();
  const alarmer = [];

  for (const butik of config.butikker) {
    const post = historik.butikker[butik.url] ??= { navn: butik.navn, priser: [] };
    post.navn = butik.navn;
    post.sidstTjekket = nu;
    try {
      const { pris, metode } = findPris(await hent(butik.url), butik);
      if (!Number.isFinite(pris)) throw new Error('Kunne ikke finde en pris på siden');
      post.fejl = null;
      post.metode = metode;
      const forrige = post.priser.at(-1)?.pris;
      if (forrige !== pris) post.priser.push({ tid: nu, pris });
      console.log('OK  ', butik.navn, kr(pris), `(${metode})`);

      if (forrige != null && pris < forrige) {
        alarmer.push(`- 📉 **${butik.navn}**: ${kr(forrige)} → **${kr(pris)}** ([se tilbud](${butik.url}))`);
      }
      const maal = config.maalpris;
      if (maal != null && pris <= maal && (forrige == null || forrige > maal)) {
        alarmer.push(`- 🎯 **${butik.navn}**: ${kr(pris)} er under målprisen på ${kr(maal)} ([se tilbud](${butik.url}))`);
      }
    } catch (e) {
      post.fejl = e.name === 'TimeoutError' ? 'Timeout' : e.message;
      console.log('FEJL', butik.navn, post.fejl);
    }
  }

  // Fjern butikker, der ikke længere står i butikker.json.
  const aktive = new Set(config.butikker.map(b => b.url));
  for (const url of Object.keys(historik.butikker)) if (!aktive.has(url)) delete historik.butikker[url];

  historik.opdateret = nu;
  await writeFile(historikFil, JSON.stringify(historik, null, 2) + '\n');

  if (alarmer.length) {
    const tekst = `Nye priser på ${config.produkt}:\n\n${alarmer.join('\n')}\n`;
    console.log('\n' + tekst);
    if (process.env.ALARM_FIL) await writeFile(process.env.ALARM_FIL, tekst);
    if (process.env.NTFY_TOPIC) {
      try {
        await fetch('https://ntfy.sh/' + encodeURIComponent(process.env.NTFY_TOPIC), {
          method: 'POST',
          headers: { 'Title': `Prisfald: ${config.produkt}`, 'Tags': 'moneybag', 'Markdown': 'yes' },
          body: alarmer.join('\n'),
          signal: AbortSignal.timeout(TIMEOUT_MS)
        });
      } catch (e) { console.log('Kunne ikke sende ntfy-besked:', e.message); }
    }
  }
}

if (process.argv[1] === fileURLToPath(import.meta.url)) await main();
