# Disco-lommelygte — Genvej til iPhone

En hjemmelavet **Genvej** (Shortcuts-app), der får den rigtige LED-blitz på
din iPhone 16 til at blinke i diskotek-mønstre. Kun tryk-og-blink — ingen
appinstallation, intet Xcode.

## Hvorfor en Genvej og ikke en webside?

Safari (og alle andre browsere) på iPhone har **ingen adgang til at styre
blitzen** fra JavaScript — det er en bevidst begrænsning fra Apple, som
ikke kan omgås fra en webside. Skal den fysiske lommelygte blinke, skal
det ske gennem enten Genveje-appen (denne løsning) eller en native app.
Genveje kræver ingen udvikler-konto og virker med det samme.

## ⚠️ Vigtigt om blinkende lys

Hurtigt, gentaget blink (stroboskop) kan udløse anfald hos personer med
fotosensitiv epilepsi. Brug ikke "Strobe (hurtig)"-tilstanden hvis du
eller nogen i nærheden er følsom over for blinkende lys, og hold øje med
publikum hvis genvejen bruges til en fest.

## Sådan bygger du den (ca. 2 minutter)

1. Åbn **Genveje**-appen på din iPhone.
2. Tryk **+** øverst for at oprette en ny genvej.
3. Tryk på navnet øverst og kald den **"Disco-lommelygte"**.
4. Tryk **Tilføj handling** og søg efter **"lommelygte"** (engelsk:
   *flashlight*). Der dukker to handlinger op med samme navn **"Indstil
   lommelygte"** — vælg den med det **blå lommelygte-ikon** (den anden,
   med et sort/ovalt ikon, er en Control Center-kontrol og virker ikke
   på samme måde her). Den blå bruges flere gange nedenfor.
5. Tilføj først handlingen **"Vælg fra menu"** (*Choose from Menu*), og
   rediger menuen så den har disse tre punkter (tryk **Tilføj punkt**
   for hvert nyt):
   - `Strobe (hurtig)`
   - `Puls (rolig)`
   - `Vild fest (tilfældig)`
6. Byg nu indholdet i hvert menupunkt som beskrevet nedenfor. Under hvert
   punkt: tilføj handlingen **"Gentag"** (*Repeat*), sæt antal gentagelser,
   og læg de øvrige handlinger **inde i** gentagelsesblokken (træk dem ind
   under "Gentag", før "Slut gentagelse").

### Menupunkt: Strobe (hurtig)

Gentag **300 gange**, med dette indeni:

1. Indstil lommelygte → **Til**
2. Vent → **0,08** sekunder
3. Indstil lommelygte → **Fra**
4. Vent → **0,08** sekunder

(≈ 6 blink i sekundet, kører i ca. 50 sekunder — stop når som helst ved
at trykke på den kørende genvej i statusbjælken/app-skifteren og vælge
Stop.)

### Menupunkt: Puls (rolig)

Gentag **40 gange**, med dette indeni:

1. Indstil lommelygte → **Til**
2. Vent → **0,6** sekunder
3. Indstil lommelygte → **Fra**
4. Vent → **0,6** sekunder

### Menupunkt: Vild fest (tilfældig)

Gentag **200 gange**, med dette indeni:

1. Tilføj handlingen **"Vilkårligt tal"** (*Random Number*) → mellem
   **0,05** og **0,3**. Dette indsætter et tilfældigt tal som output.
2. Indstil lommelygte → **Til**
3. Vent → sæt feltet til det tilfældige tal fra trin 1 (tryk i feltet og
   vælg variablen "Vilkårligt tal" fra menuen der popper op i stedet for
   at skrive et tal).
4. Tilføj endnu et **"Vilkårligt tal"**, mellem **0,05** og **0,2**.
5. Indstil lommelygte → **Fra**
6. Vent → variablen fra trin 4.

Dette giver et uregelmæssigt, mere "disco-agtigt" blink end den faste
strobe, fordi tempoet varierer fra blink til blink.

### Afslut

7. Tryk **Udført** øverst til højre.

## Brug den

- Åbn Genveje-appen, tryk på **"Disco-lommelygte"**, og vælg en
  tilstand i menuen.
- **Anbefalet:** langtryk på genvejen → **Del** → **Tilføj til
  hjemmeskærm**, så du kan starte disco-blinket med ét tryk uden at åbne
  Genveje-appen først.
- Du kan også sige **"Hej Siri, Disco-lommelygte"**, hvis Siri er
  aktiveret for genvejen (Genvejens indstillinger → "Tilføj til Siri").
- For at stoppe et blink før tid: åbn app-skifteren eller stryg ned fra
  toppen, find den kørende genvej, og tryk **Stop**.

## Videre idéer

- Byt "Gentag X gange" ud med en meget stor værdi (fx 2000) i stedet for
  at vælge tilstand hver gang, hvis du bare vil have "kør til jeg
  stopper den".
- Lommelygte-handlingen understøtter også en **lysstyrke**-parameter
  (0–100 %) på nyere iOS-versioner — brug den til at skifte mellem svagt
  og kraftigt lys i stedet for helt til/fra, for et blødere puls-look.
