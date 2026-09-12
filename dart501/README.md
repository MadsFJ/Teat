# ⚡ NUKE 501 — Dart Arena

En moderne, energisk 501-dartapp i "The Nuke"-stil: dyb lilla/sort
dark mode med gul/orange neon, store krystalklare tal, hurtig
score-indtastning og fed feedback på 180'ere og store checkouts.

Bygget som **ren HTML/CSS/JavaScript uden build-trin** — matcher resten
af dette repo. Åbn den bare, eller host den direkte på GitHub Pages.

## Kom i gang lokalt

Fordi appen bruger ES-moduler (`<script type="module">`), skal filerne
serveres over `http://` — de kan ikke bare dobbeltklikkes som `file://`
i alle browsere. Brug en hvilken som helst simpel statisk server, fx:

```bash
cd dart501
python3 -m http.server 8080
# åbn http://localhost:8080 i browseren
```

eller med Node:

```bash
npx serve dart501
```

Der er **ingen `npm install`, ingen build og ingen dependencies** —
det er bare statiske filer.

## Projektstruktur

```
dart501/
├── index.html            # Al markup — én side, flere "views" der skiftes med JS
├── css/
│   └── styles.css        # Neon dark-mode tema, animationer, responsivt layout
└── js/
    ├── main.js            # Router: kobler navigation og views sammen
    ├── checkout.js         # Algoritme der finder gyldige checkout-ruter (fx "T20 · T20 · DB")
    ├── ai.js               # Simpel CPU-modstander (let/medium/svær)
    ├── game501.js          # Kernen i 501-spillet: bust-regler, legs, statistik
    ├── trainingClock.js    # Træning: Around the Clock
    ├── trainingDouble.js   # Træning: Double Training
    ├── trainingScoring.js  # Træning: Scoring Drill
    ├── statsView.js        # Kamphistorik + personlige trænings-rekorder
    ├── settingsView.js     # Lyd til/fra, ryd gemt data
    ├── sound.js             # Synthesizede lydeffekter (Web Audio API, ingen lydfiler)
    ├── storage.js           # localStorage-wrapper (historik, rekorder, indstillinger)
    └── ui.js                # Genbrugeligt dart-tastatur + "STORT BANNER"-komponent
```

Alt gemmes i browserens `localStorage` — ingen server, ingen konto,
ingen data forlader din browser.

## Funktioner

### 🎯 501-spil
- Klassisk 501 (også valgfrit 301/701) med **Double Out** eller
  **Straight Out**.
- **Intelligent checkout-guide**: så snart en spillers rest er ≤170,
  foreslår appen en gyldig afslutning (fx `T20 · T20 · D20`).
- **Statistik pr. spiller**: gennemsnit pr. 3 pile, gennemsnit for de
  første 9 pile, antal 180'ere og højeste checkout — live under kampen.
- **Modstander**: lokal 2-spiller på samme enhed, eller en simpel
  CPU-bot med tre sværhedsgrader (Let / Medium / Svær), der sigter
  efter fornuftige mål og rammer ved siden af med realistisk
  usikkerhed.
- **Fed atmosfære**: fulde-skærms neon-bannere ved 180'ere, høje
  checkouts (≥100), bust og leg-/kampsejre — "THE NUKE STYLE" 🔥,
  med tilhørende synteserede lydeffekter.

### 🏋️ Træningsmoduler
- **Around the Clock** — ram 1 til 20 og bull i rækkefølge, se hvor
  mange kast du bruger, og slå din personlige rekord.
- **Double Training** — vælg dine egne doubler (standard: D20, D16,
  D10, D8, D4), 5 forsøg pr. double, og se din ramt-procent.
- **Scoring Drill** — 10 omgange á 3 pile, saml så mange point som
  muligt (T20 er vejen frem), med fuld omgang-for-omgang historik.

### 📊 Statistik & indstillinger
- Kamphistorik gemmes automatisk (dato, spilltype, resultat, vinder).
- Personlige rekorder for alle tre træningsmoduler.
- Lyd kan slås til/fra, og al gemt data kan ryddes med ét klik.

## Sådan er den bygget

- **Ingen framework, ingen build-trin.** Alt er vanilla JavaScript
  opdelt i ES-moduler (`import`/`export`), så koden er let at læse og
  udvide uden `npm install`, webpack, Vite eller lignende.
- **Modulær arkitektur**: hvert spil/træningsmodul har sin egen fil
  med state + rendering, og deler et fælles dart-tastatur
  (`ui.js#renderDartKeypad`) og en fælles banner-komponent
  (`ui.js#showBanner`).
- **`checkout.js`** implementerer en lille rekursiv søgealgoritme der
  leder efter en 1-3-pile-rute til nøjagtigt 0, hvor kun den sidste
  pil skal være en double (når Double Out er slået til).
- **`ai.js`** genbruger checkout-algoritmen til at vælge CPU'ens mål,
  og introducerer realistiske "nærmiss" baseret på dartskivens
  faktiske nabo-layout.
- **Dark mode neon-tema** er ren CSS med custom properties
  (`css/styles.css`), Google Fonts (Orbitron til tal/overskrifter,
  Rajdhani til UI-tekst) og CSS-animationer til bannerne — ingen
  animations-bibliotek nødvendigt.
- **Lyd** er syntetiseret i realtid med Web Audio API
  (`sound.js`) — ingen lydfiler at hoste eller licensere.

## Forbind til dit eget GitHub-repository

Da dette allerede ligger i dit `Teat`-repository, skal du bare
committe og pushe som normalt:

```bash
git add dart501
git commit -m "Tilføj NUKE 501 dartapp"
git push
```

### Hvis du vil starte et helt nyt/separat repository i stedet

```bash
# 1. Opret et nyt, tomt repository på GitHub (uden README/licens)
# 2. Fra en mappe med dart501/-indholdet:
git init
git add .
git commit -m "Initial commit: NUKE 501 dartapp"
git branch -M main
git remote add origin https://github.com/<dit-brugernavn>/<dit-repo>.git
git push -u origin main
```

### GitHub Pages

Repoet er allerede indrettet til GitHub Pages (se root-README).
Slå Pages til under **Settings → Pages** og peg på roden af
`main`-branchen — appen er så tilgængelig på
`https://<dit-brugernavn>.github.io/<repo>/dart501/`.

## Roadmap / idéer til videreudvikling

- Sæt-baseret kamp (best of X sæt, hver med Y legs) i stedet for
  kun legs.
- Gem/gennemse enkelte kasts historik pr. leg, ikke kun pr. kamp.
- Flere træningsmoduler (fx "Shanghai" eller "Cricket").
- Delt online multiplayer via en simpel backend eller WebRTC.
