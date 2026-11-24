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
| `sw.js` | Service Worker: Cache-first, Liste `FILES`, Konstante `VERSION` |
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
1. **Risikoreich** (`#tab-vorsorge`, Speicherschlüssel `depot-rechner-v1`) – *generisch überarbeitet, fertig*
2. **Risikoarm** (`#tab-safe`) – Tagesgeld/Konten und Anleihen-ETFs – *als Nächstes dran*
3. **Übersicht Altersvorsorge** (`#tab-av`) – Verhältnis risikoreich/risikoarm, optionales Rebalancing der Gesamtrate
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
  (eine Gewichtung wurde bewusst verworfen – zu unübersichtlich).

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

## UI-Konventionen
- Bearbeiten-Muster: Ansicht mit ✎ → Felder → ✓ oder Enter bestätigt.
- Hinweis-Farben einheitlich: grün ✅ = in Ordnung, orange ⚠️ = Handlungsbedarf, blau ℹ️ = Info
  (Klassen `.card.st-ok/.st-warn/.st-info`, `.stbox.ok/.warn/.info`).
- Mobil zuerst: Eingabefelder ≥ 16 px (kein iOS-Zoom), `inputmode="decimal"`, Reiterleiste sticky.
- Export auf dem Handy über das Teilen-Menü (`deliver()`), sonst Download.

## Arbeitsweise mit der Nutzerin / dem Nutzer
- Erst **Vorschläge** machen (was ist fest eingebaut, wie generischer), dann nach Freigabe
  **Schritt für Schritt** umsetzen.
- Nach jedem Schritt: kurze Rückmeldung mit Screenshot (Handy-Viewport) und Ankündigung des nächsten Schritts.
- Vor dem Pushen Bescheid geben; nach dem Push daran erinnern, in der App „Aktualisieren“ zu tippen.

## Nächster Schritt
Reiter 2 „Risikoarm“ analysieren: Was ist fest eingebaut (z. B. genau zwei Arten Tagesgeld/Anleihen-ETF,
Vorbelegung „Tagesgeld / DKB“, Bezeichnungen „Altersvorsorge“) – Vorschläge machen, dann schrittweise umsetzen.
