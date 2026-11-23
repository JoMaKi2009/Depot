# Depot-Rechner als Handy-App

Die App muss einmal auf einer https-Adresse liegen, damit das Handy sie installieren kann.
Danach läuft sie komplett offline. Deine Werte bleiben nur auf dem Handy.

## 1. Online stellen (einmalig, kostenlos, GitHub Pages)
1. Auf github.com ein Konto anlegen bzw. anmelden.
2. Neues Repository anlegen, z. B. `depot`.
3. "Add file" → "Upload files" → alle Dateien aus diesem Ordner hineinziehen → "Commit".
4. Settings → Pages → Source "Deploy from a branch", Branch `main`, Ordner `/ (root)` → Save.
5. Nach ca. 1 Minute ist die App unter `https://<dein-name>.github.io/depot/` erreichbar.

In der App sind keine Depotwerte gespeichert. Die Adresse ist aber öffentlich, gib sie also nicht weiter.

## 2. Aufs Handy holen
- iPhone: Adresse in Safari öffnen → Teilen → "Zum Home-Bildschirm".
- Android: Adresse in Chrome öffnen → ⋮ → "App installieren" bzw. "Zum Startbildschirm hinzufügen".
- Danach die App einmal vom Startbildschirm aus öffnen. Ab dann funktioniert sie auch ohne Internet.

## 3. Werte vom PC übernehmen
1. Am PC im bisherigen Rechner auf "Export (JSON)" tippen.
2. Die Datei aufs Handy bringen (Mail, Cloud, Dateien-App).
3. In der Handy-App auf "Import (JSON)" tippen und die Datei wählen.

## Gut zu wissen
- Export, CSV und PDF öffnen auf dem Handy das Teilen-Menü. Dort "In Dateien sichern" wählen oder die Datei verschicken.
- Exportiere regelmäßig als JSON. Wenn du die App löschst, sind die Werte sonst weg.
- Nach einer neuen Version: Dateien bei GitHub ersetzen und in `sw.js` die VERSION hochzählen.
  Die App zeigt dann "Neue Version verfügbar".
