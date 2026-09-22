// Henter statussider/feeds for alle services i services.json og skriver status.json.
// Køres af GitHub Actions (.github/workflows/driftsradar.yml), så siden kan vise
// status uden at browseren bliver blokeret af CORS.
//
// Brug: node driftsradar/hent-status.mjs [output-fil]
import { readFile, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const here = path.dirname(fileURLToPath(import.meta.url));
const outFile = process.argv[2] || path.join(here, 'status.json');
const TIMEOUT_MS = 20000;
const MAX_BYTES = 2_000_000;

// Samme URL'er som siden selv beder om (se fetchStatuspage/fetchFeed i index.html).
function urlFor(svc) {
  if (svc.statusType === 'statuspage') {
    try { return new URL(svc.statusUrl).origin + '/api/v2/summary.json'; } catch { return null; }
  }
  if (svc.statusType === 'rss') return svc.feedUrl || svc.statusUrl || null;
  return null;
}

async function fetchOne(url) {
  const fetched = new Date().toISOString();
  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: {
        'User-Agent': 'Driftsradar/1.0 (+https://github.com/MadsFJ/Teat)',
        'Accept': 'application/json, application/rss+xml, application/atom+xml, application/xml, text/xml, */*'
      }
    });
    if (!res.ok) return { ok: false, error: 'HTTP ' + res.status, fetched };
    const body = await res.text();
    if (body.length > MAX_BYTES) return { ok: false, error: 'Svaret er for stort', fetched };
    return { ok: true, body, fetched };
  } catch (e) {
    return { ok: false, error: e.name === 'TimeoutError' ? 'Timeout' : e.message, fetched };
  }
}

const data = JSON.parse(await readFile(path.join(here, 'services.json'), 'utf8'));
const services = Array.isArray(data) ? data : data.services;
const urls = [...new Set(services.map(urlFor).filter(Boolean))];

const results = {};
await Promise.all(urls.map(async url => { results[url] = await fetchOne(url); }));

await writeFile(outFile, JSON.stringify({ generated: new Date().toISOString(), results }));
for (const url of urls) console.log(results[url].ok ? 'OK  ' : 'FEJL', url, results[url].error || '');
