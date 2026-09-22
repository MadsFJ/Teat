# Teat

Samling af små, selvstændige webapps — hver er én HTML-fil (eller en lille
mappe med HTML/CSS/JS) uden build-trin, klar til GitHub Pages.

## `driftsradar/` — Driftsradar

Dashboard til at holde styr på de eksterne services, vores hjemmeside og
drift afhænger af (fx Puzzel, Splashtop, Microsoft 365 og Azure).

- viser den vigtigste status fra hver services offentlige statusside:
  samlet status, aktive hændelser, berørte komponenter og planlagt
  vedligeholdelse (Atlassian Statuspage-API), eller de seneste
  meddelelser fra et RSS/Atom-feed,
- opsummering øverst (OK / advarsler / nedbrud / vedligehold /
  fornyelser inden for 60 dage), services med problemer sorteres først,
- tilføj, redigér og slet services — med "🔍 Find automatisk", der selv
  finder ud af om statussiden har et API eller feed,
- egne felter pr. service: admin-link, ansvarlig, support-kontakt,
  kundenummer, fornyelsesdato (markeres når den nærmer sig), pris og noter,
- søgning og filtrering på kategori/status, automatisk opdatering.

**Status hentes af en server — ingen CORS-problemer.** De fleste
statussider tillader ikke kald direkte fra en browser (CORS). Derfor
henter GitHub Actions (`.github/workflows/driftsradar.yml`) status for
alle services i den fælles liste `driftsradar/services.json` hvert 10.
minut med `driftsradar/hent-status.mjs`, og udgiver resultatet som
`driftsradar/status.json` sammen med siden på GitHub Pages. Siden bruger
den kopi først og prøver kun direkte (eller via en valgfri CORS-proxy)
for services, der ikke står i den fælles liste.

**Opsætning (én gang):** Settings → Pages → Source: **GitHub Actions**.
Siden ligger derefter på `https://<bruger>.github.io/<repo>/driftsradar/`.

**Tilføj en service for alle:** tilføj den på siden, klik ⚙ Indstillinger
→ ⬇ Eksportér JSON, og erstat `driftsradar/services.json` i repo'et med
filen (eller redigér filen direkte på GitHub). Services, der kun
tilføjes på siden, gemmes i den enkelte browsers `localStorage`.

**Kendte begrænsninger:** GitHubs planlagte kørsler kan blive forsinket
nogle minutter i travle perioder. Microsoft 365's detaljerede
servicesundhed for vores egen tenant kræver admin-login og kan derfor
ikke hentes; kortet linker i stedet til status.cloud.microsoft og admin
centeret.

## `dart501/` — NUKE 501 Dart Arena

Moderne, neon dark-mode 501-dartapp inspireret af den energiske
"Nuke"-stil fra topmoderne dart-shows. Indeholder:

- klassisk 501 (Double Out / Straight Out) med intelligent
  checkout-guide, live statistik og en lokal 2-spiller- eller
  CPU-modstander (tre sværhedsgrader),
- fulde-skærms neon-bannere og lydeffekter ved 180'ere, høje
  checkouts og leg-/kampsejre,
- tre træningsmoduler: Around the Clock, Double Training og
  Scoring Drill,
- kamphistorik og personlige trænings-rekorder gemt i browserens
  `localStorage`.

Se [`dart501/README.md`](dart501/README.md) for detaljer om
projektstruktur og hvordan den er bygget. Kør den lokalt med fx
`python3 -m http.server 8080` fra `dart501/`-mappen (kræver en
http-server pga. ES-moduler — kan ikke åbnes direkte som `file://`).

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

## `tegn-og-gaet.html` — Tegn og gæt

Mobilvenlig "Tegn og gæt" (Charades)-app, perfekt til at sende telefonen
rundt i stuen. Indeholder:

- seks kategorier (Blandet, Dyr, Film & TV, Mad & Drikke, Sjove ting og
  Svære ord) med store, indbyggede ordlister uden eksterne opslag,
- ord trækkes tilfældigt fra den valgte kategori uden gentagelser i
  samme runde, indtil alle ord er brugt — så kan man starte en ny runde,
- en nedtælling (30/60/90 sek.) med start/pause-knap samt et rødt
  flash og en lyd/vibration, når tiden løber ud,
- stort UI med store knapper og læsbar skrift, designet til at blive
  sendt rundt mellem spillere,
- kan valgfrit forbindes til dit eget Firebase Firestore-projekt
  (indstilles under ⚙ Firebase-opsætning), så en anden enhed kan åbne
  "👀 Live-visning" og se det ord der bliver trukket lige nu, i realtid.
  Kræver login med Firebase Authentication (email/adgangskode) —
  kombineret med Firestore-regler der kun tillader din egen konto,
  er det kun dig der kan læse eller skrive data. Konfigurationen
  gemmes kun i din egen browser og committes aldrig til dette repo —
  uden den fungerer spillet helt normalt, bare uden live-visning.

## `index.html` — Lyt

Browserbaseret lyd-/musikgenkendelse (uafhængig af Pladelog).

## `disco-lommelygte.md` — Disco-lommelygte

Guide til at bygge en Apple Genvej, der får den rigtige LED-blitz på
iPhone til at blinke i diskotek-mønstre. Ikke en webapp — iOS tillader
ikke browsere at styre lommelygten, så løsningen er en Genvej i stedet.
