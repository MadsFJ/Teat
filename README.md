# Teat

Samling af små, selvstændige webapps — hver er én HTML-fil uden build-trin,
klar til GitHub Pages.

## `pladelog.html` — Pladelog

Webversion af Android-appen "Pladelog" (nummerplade-scanner). Peg
telefonens/computerens kamera mod en dansk nummerplade, og appen:

- genkender pladen live med tekstgenkendelse i browseren (Tesseract.js),
  og retter typiske OCR-fejl (0/O, 1/I, 5/S, …) som originalappen,
- kræver at samme plade genkendes tre gange i træk, før den slår op —
  for at undgå fejllæsninger,
- gemmer scanningen (bilmærke, model, årgang m.m. samt GPS-position) i
  browserens lokale lagring, så historikken er der igen ved næste besøg,
- kan valgfrit synkronisere historikken til dit eget Firebase Firestore-
  projekt (indstilles under ⚙ Indstillinger).

**Kom i gang:** åbn siden, giv adgang til kamera og lokation, og indtast
din egen [MotorAPI](https://motorapi.dk)-nøgle under ⚙ Indstillinger —
uden den kan appen ikke slå bilfakta op. Nøglen gemmes kun i din egen
browser (`localStorage`) og committes aldrig til dette repo.

Der er også et felt til manuelt at indtaste en plade, hvis kameraet ikke
er tilgængeligt eller pladen er svær at læse.

**Kendte begrænsninger i webversionen:**
- MotorAPI skal tillade kald direkte fra browseren (CORS). Blokerer
  MotorAPI det, vises en tydelig fejlbesked i appen.
- Forsikringsopslag (som i Android-appen hentede navnet fra
  nummerplade.net) kan ikke web-scrapes fra browseren pga. CORS — i
  stedet får du et direkte link til pladens side på nummerplade.net.

## `index.html` — Lyt

Browserbaseret lyd-/musikgenkendelse (uafhængig af Pladelog).
