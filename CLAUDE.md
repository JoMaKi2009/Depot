# Depot-Rechner – Projektkontext für Claude

Offline-fähige Web-App (PWA) für Sparraten-Rebalancing ETF-Depot. Gehostet über GitHub Pages
aus diesem Repository (Branch `main`, Ordner `/`), auf dem Handy (Google Pixel 7 Pro, Chrome) als App installiert.
Sprache der App und der Kommunikation: **Deutsch**.

## Wichtig: Datenschutz
- Das Repository ist **öffentlich**. Niemals echte Depotwerte, Kontostände, Sparraten oder
  persönliche Daten in Code, Vorbelegungen, Tests oder Commit-Nachrichten schreiben.
- Alle Nutzerdaten liegen nur im `localStorage` des jeweiligen Geräts. Übertragung zwischen
  Geräten nur über Export/Import (JSON). Kein Server, keine externen Requests.

## Dateien
| Datei | Zweck |
|---|---|
| `index.html` | Die komplette App: HTML, CSS und JavaScript in einer Datei |
| `html2pdf.bundle.min.js` | html2pdf.js 0.10.1 (MIT), lokal für PDF-Export offline – nicht ändern |
| `sw.js` | Service Worker: Cache-first, Liste `FILES`, Konstante `VERSION`; lädt beim Installieren mit `cache: "reload"` (nie aus dem HTTP-Cache) |
| `manifest.webmanifest` | PWA-Manifest (Name, Icons, Farben) |
| `icon-v2-*.png` | App-Icons (Pfeil-Diagramm in Mint auf Grün→Nachtblau-Verlauf) |
| `ANLEITUNG.md` | Anleitung für Nutzer (Hosting, Installation, Datenübernahme) |

## Bei jeder Änderung an der App
1. `VERSION` in `sw.js` hochzählen (Schema `depot-JJJJ-MM-TT-n`), sonst bekommen installierte Apps das Update nicht.
   Die App zeigt dann „Neue Version verfügbar“ → „Aktualisieren“.
2. Neue Dateien in `FILES` in `sw.js` aufnehmen. Geänderte Icons bekommen **neue Dateinamen**,
   damit Chrome/Android das Icon aktualisiert.
3. Gespeicherte Daten bestehender Nutzer müssen weiter funktionieren: Datenstruktur nur mit
   Migration beim Laden ändern (siehe `loadCore()` und die Migrationen direkt danach).
4. Vor dem Commit im Handy-Viewport testen (z. B. Playwright mit `devices["Pixel 7"]`):
   Laden, Offline-Neuladen, alle Reiter durchklicken, PDF-Export, keine `pageerror`.

## Reiter (Tabs)
0. **Info** (`#tab-daten`) – Infokasten, Sicherung (Export/Import, letzte Sicherung), CSV/PDF, „Alle Daten zurücksetzen“
1. **Risikoreich** (`#tab-vorsorge`, Speicherschlüssel `depot-rechner-v1`) – Name frei wählbar – *generisch überarbeitet, fertig*
2. **Risikoarm** (`#tab-safe`) – Konten und ETFs/Fonds – Name frei wählbar – *generisch überarbeitet, fertig*
3. **Übersicht Altersvorsorge** (`#tab-av`) – Verhältnis Reiter 1 / Reiter 2, optionales Rebalancing der Gesamtrate – Name frei wählbar – *generisch überarbeitet, fertig*
4. **Spielgeld ETFs** (`#tab-etfs`) – nur Erfassung, Broker-Spalten, Obergrenze
5. **Spielgeld Aktien** (`#tab-spiel`) – nur Erfassung, Einstand, Obergrenze
6. **Übersicht Gesamt** (`#tab-gesamt`)

Reiter 2–6 speichern unter `depot-rechner-extra-v1` (Objekt `X`).

## Fachliche Regeln (nicht ändern ohne Rückfrage)
- Rebalancing **nur über die Sparrate**, niemals Verkauf.
- Toleranzband in Prozentpunkten; innerhalb des Bands Standardaufteilung nach Ziel,
  optional „Feinausgleich“. Außerhalb: Lücken zum Ziel auffüllen (`corrected()`).
- Jeder Baustein bekommt mindestens die Mindestrate (n Bausteine × Mindestrate ≤ Sparrate).
- Mehrere besparte ETFs in einem Baustein: Betrag wird **gleichmäßig** aufgeteilt
  (eine Gewichtung wurde bewusst verworfen – zu unübersichtlich). Gilt ebenso für mehrere
  besparte Positionen einer Art in Reiter 2.
- Reiter 3 (Verhältnis Reiter 1 / Reiter 2): ebenfalls Ziel ± Toleranzband, optional Feinausgleich.
- Baustein ohne besparten ETF (Reiter 1) bzw. ohne besparte Position (Reiter 2) wird **pausiert**: 0 €, keine
  Mindestrate; die übrigen Bausteine teilen die Sparrate im Verhältnis ihrer Ziele (z. B. 20/30 → 40/60), Band/Feinausgleich
  unter ihnen. ⚠️-Hinweis im Fazit (`pauseNote()`). Zählt in der Ist-Verteilung weiter mit. Nichts bespart → Hinweis ohne Rechnung.

## Stand Reiter 1 „Risikoreich“ (abgeschlossen)
- Beliebig viele Bausteine (max. 8), Farben aus `PALETTE` rotierend.
- ETF-Felder: **Depot** (Bank) und **Anbieter** (ETF-Anbieter), WKN, Typ (optional: –/Ausschütter/Thesaurierer), Wert, „wird bespart“.
  Altes Feld `anbieter` (war die Bank) wird beim Laden nach `depot` migriert.
- Festgelegtes Ziel `CS.zielRef` (je Baustein-Key) statt fester 50/20/30; Warnung bei Abweichung
  mit „Als neues Ziel festlegen“ / „Auf festgelegtes Ziel zurücksetzen“.
- Neue Nutzer (kein gespeicherter Stand): Vorlagenauswahl (1 ETF / 70-30 / 50-20-30 / Leer),
  neutrale Startwerte (Sparrate leer, Mindestrate 25 €, Band 5).
- Reitername (`CS.tab.t1` Oberzeile, `CS.tab.t2` Name) über ✎ in der Kopfzeile des Reiters;
  wirkt auf Reiterleiste, Fazit, Gesamtübersicht, PDF, CSV.
- **Zielverteilung** (`#coreZiel`, Karte unter der Einleitung, über der Warnkarte) mit ✎/✓ wie Reiter 2
  (`buildCoreZiel()`/`renderCoreZiel()`): Ziel % je Baustein nur dort, vom festgelegten Ziel abweichende Felder orange,
  Bestätigen nur bei 100 %. Warnkarte „Als neues Ziel festlegen / zurücksetzen“ bleibt. Baustein-Karten ohne Ziel.
  **Bausteine werden dort angelegt:** je Zeile Name + Ziel % + ×, „+ Baustein hinzufügen“ (`#czAdd`, max. 8);
  Bestätigen nur mit Namen für alle. Karten „Aktuelle Werte“ übernehmen den Namen (kein Namensfeld, kein ×,
  kein „+ Baustein“ mehr unten) – dort nur noch ETFs. Vorlage „Leer“ öffnet die Zielverteilung.
- `CS.zielRef` wird in `loadCore()` aus dem Speicher übernommen (fehlte früher – Ziel ging beim Neuladen verloren).

## Stand Reiter 2 „Risikoarm“ (abgeschlossen)
- Reitername `X.safeTab` (t1/t2) über ✎ wie Reiter 1. Bestehende Daten: „Altersvorsorge / Risikoarm“,
  neue Nutzer: „Sparplan / Sicherheitsbaustein“.
- **Bausteine** `X.sg` (max. 8) mit Name und Ziel %, Bearbeiten-Muster ✎/✓ wie Reiter 1.
  Kein festgelegtes Ziel (`zielRef`) – vorerst bewusst weggelassen.
- **Positionen** `pos` je Baustein: Name, Anbieter / WKN, Wert, Zins (leer = kein Zins), „wird bespart“.
  **Keine „Art“** (Konto/ETF) mehr; verzinst wird jede Position mit Zins > 0 (Ø-Zins, Steuer, 12-Monats-Vorschau).
- Rebalancing je Baustein (`gRebal`/`gStd`/`gMonths`, n-stellig), Toleranzband, Feinausgleich,
  Mindestrate **je Baustein**; Betrag eines Bausteins gleichmäßig auf seine besparten Positionen.
  Warnungen: Zielsumme ≠ 100 %, Baustein ohne besparte Position, Sparrate < n × Mindestrate.
- Neue Nutzer (keine Bausteine): Vorlagenauswahl (Nur Konto / Konto + Anleihen-ETF /
  Tagesgeld + Festgeld + Anleihen-ETF / Leer). Noch keine Werte: Aufteilung nach Ziel mit ℹ️-Hinweis.
- Migrationen (vor dem ersten Zeichnen der Karten): alte flache Liste `X.safe` + Ziel „Konto %“
  → Bausteine „Konto“ und „ETF / Fonds“ (auch beim Import alter Sicherungen); Feld `art` wird
  entfernt, ehemalige ETF-Positionen ohne Zins.
- **Zielverteilung** (`#safeZiel`, Karte vor „Bausteine & Positionen“) mit ✎/✓: Ziel % je Baustein **nur dort**
  (`buildSafeZiel()`/`renderSafeZiel()`), Summe live, Bestätigen nur bei 100 %; Hinweis bei Summe ≠ 100 % und bei
  Bausteinen mit 0 %. Baustein-Karten zeigen kein Ziel mehr. In der Vorlagenauswahl ausgeblendet.
  **Bausteine werden dort angelegt** wie Reiter 1: Name + Ziel % + ×, „+ Baustein hinzufügen“ (`#szAdd`);
  Karten „Bausteine & Positionen“ ohne Namensfeld/×/„+ Baustein“ – dort nur Positionen. Vorlage „Leer“ öffnet die Zielverteilung.
- Steuer auf Zinsen fest 26,375 % (nur Info, kein Eingabefeld); Freibetrag `X.safeFrei` (leer = 0).

## Info-Reiter und Zurücksetzen
- Keine Werkzeugleiste mehr; Kopfzeile nur „Depot-Rechner“ + Stand. „Letzte Datenänderung“ im Infokasten.
- Zeitpunkt der letzten Sicherung unter `depot-rechner-lastexport` (Hinweis, wenn nie oder > 30 Tage).
- „Alle Daten zurücksetzen“: Dialog mit „Erst sichern“, dann „LÖSCHEN“ eintippen; löscht alle
  `localStorage`-Schlüssel, die mit `depot-rechner` beginnen.
- Reiter 1, 2, 4, 5: Link „„Name“ zurücksetzen …“ am Ende (nur dieser Reiter, mit Rückfrage);
  ausgeblendet, wenn leer bzw. Vorlagenauswahl, sowie im PDF/Druck. Texte ohne das Wort „Reiter“.
- Reiter Info erscheint nicht im PDF/Druck.

## UI-Konventionen
- Bearbeiten-Muster: Ansicht mit ✎ → Felder → ✓ oder Enter bestätigt.
- Hinweis-Farben einheitlich: grün ✅ = in Ordnung, orange ⚠️ = Handlungsbedarf, blau ℹ️ = Info
  (Klassen `.card.st-ok/.st-warn/.st-info`, `.stbox.ok/.warn/.info`).
- Mobil zuerst: Eingabefelder ≥ 16 px (kein iOS-Zoom), `inputmode="decimal"`, Reiterleiste sticky.
- Export auf dem Handy über das Teilen-Menü (`deliver()`), sonst Download.

## Arbeitsweise mit der Nutzerin / dem Nutzer
- Erst **Vorschläge** machen (was ist fest eingebaut, wie generischer), dann nach Freigabe
  **Schritt für Schritt** umsetzen.
- **Vor jeder Änderung fragen**: nichts umsetzen oder committen ohne ausdrückliche Freigabe.
- **„commit“ heißt: committen und pushen** – auf den Arbeitszweig und nach `main` (damit die App das Update bekommt).
- Nach jedem Schritt: kurze Rückmeldung mit Screenshot (Handy-Viewport) und Ankündigung des nächsten Schritts.
- Nach dem Push daran erinnern, in der App „Aktualisieren“ zu tippen.

## Stand Reiter 3 „Übersicht“ (abgeschlossen)
- **A (fertig):** Alle Texte nutzen die aktuellen Namen aus Reiter 1/2 (`coreShort()`/`safeShort()`) statt
  „risikoreich/risikoarm“; Einleitung nennt die eingestellten Zielwerte statt fest 60/40 – 70/30.
- **B (fertig):** Reitername `X.avTab` (t1/t2) über ✎ (`avName()`/`avShort()`/`avLink()`). Bestehende Daten
  (`X.mixZiel` gespeichert): „Übersicht / Altersvorsorge“, neue Nutzer: „Übersicht / Sparpläne“.
  Wirkt auf Reiterleiste, PDF, Kennzahl, Fazit, Links in Reiter 1/2 und „Anteil …“ in Reiter 6.
- **C (fertig):** Ziel ± Toleranzband wie Reiter 1/2: `X.mixZiel` (% für Reiter 1, Rest Reiter 2; `null` = noch
  nicht festgelegt → ℹ️-Hinweis, kein Vorschlag), `X.mixBand` (± pp, Standard 5), `X.mixFine` (Feinausgleich).
  Im Band Aufteilung nach Ziel (`gStd`), außerhalb oder mit Feinausgleich Lücken zum Ziel füllen (`gRebal`).
  Migration: altes `mixZiel`/`mixMax` → Mitte ± halbe Breite (60/70 → 65 ± 5), `mixMax` wird gelöscht.
  Neue Nutzer: Ziel leer, Band 5. (Früher: Korridor nur vom Ziel nach oben – mit Nutzerin/Nutzer geändert.)
- **Feinschliff (fertig):** Kein Statuskasten mehr unter „Ist-Verteilung“ – Aussage zum Vermögen steht im Fazit unten
  (wie Reiter 1/2). Feld „Mindestrate risikoarm“ (`X.avMinArm`) entfernt und beim Laden gelöscht; es gelten die
  Mindestraten aus Reiter 1/2. Text unter „Sparrate – Aufteilung“ wie Reiter 1/2 (Standardaufteilung / Zurück im
  Band nach … / Auf Ziel nach …). Begriff einheitlich „Band“ statt „Korridor“.
  Ist-Verteilung mit Spalte „Status“ (✅ im Band / ⚠️ außerhalb) wie Reiter 1/2; Feinausgleich-Checkbox immer sichtbar.
- **Zielverteilung + Mindestrate (fertig):** Karte „Zielverteilung“ (`#avZiel`, unter den Kennzahlen) mit ✎/✓:
  Balken + Toleranzband-Text; Bearbeiten nur Anteil Reiter 1 (`mixZiel`), Rest automatisch. Ohne Ziel sofort offen.
  Sparplan: Sparrate gesamt, **Mindestrate je Baustein** `X.avMin` (Start 0 €; zählt **nur für den Vorschlag**,
  Mindestraten aus Reiter 1/2 werden hier nicht berücksichtigt), Toleranzband, Feinausgleich.
- **D (fertig):** Noch keine Werte und Sparraten in Reiter 1/2 → Klasse `#tab-av.leer` blendet Kennzahlen,
  Ist-Verteilung und Sparrate-Aufteilung (`.av-hide`) aus; Fazit zeigt ℹ️-Hinweis mit Links zu Reiter 1/2.

## Nächster Schritt
Reiter 4 „Spielgeld ETFs“ analysieren (feste Broker-Spalten comdirect/Scalable,
„Spielgeld ETFs (Scalable)“ in Reiter 6). Offen (klein): „-0,00“ / „-0 €“ bei exakt 0 Abweichung.
