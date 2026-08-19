---
name: assets
description: >
  Génère icône, splash screen, et compose les captures d'écran App Store aux tailles Apple exactes,
  localisées. Si aucun device n'est disponible pour de vraies captures, bascule honnêtement en capture
  guidée — jamais un faux mockup présenté comme réel. Chargé en phase Assets du build et par /app-store.
---

# assets — icône, splash, screenshots

## Icône + splash (phase Build)

Génère à partir de l'identité de l'app (nom, couleur dominante du thème, éventuellement un symbole simple
lié au domaine — pas de texte illisible en petit format). Utilise `scripts/generate-assets.mjs` qui produit
toutes les tailles requises par `app.json` (icon 1024×1024, adaptive-icon Android si besoin, splash).

Vérifie visuellement le rendu à petite taille (l'icône doit rester reconnaissable en 60×60).

## Screenshots App Store (phase `/app-store`, GATE 2b)

Guideline 2.3 : les screenshots doivent être **fidèles à la vraie app** — jamais un mockup qui montre des
features inexistantes ou un design différent du build réel.

1. **Prends de vraies captures** du build réel (TestFlight) ou d'Expo Go sur l'iPhone du client pendant
   `/preview`.
2. `scripts/generate-assets.mjs --screenshots` encadre et compose ces captures aux tailles Apple exactes
   par appareil (ex. 1290×2796 pour iPhone 6.7"), par langue (FR/EN).
3. Place les fichiers générés dans le dossier attendu par App Store Connect et guide le client pour
   l'upload (ou upload via API si les credentials le permettent).

**Si le device manque** (client sans iPhone à portée au moment de builder les screenshots) : ne fabrique
jamais un faux mockup présenté comme une vraie capture. Bascule en **capture guidée** — explique
précisément quel écran ouvrir et quand faire la capture native (bouton latéral + volume haut), puis
reprends la composition avec les vrais fichiers reçus.

## Self-vérification

- Icône présente à toutes les tailles requises, pas de flou/pixelisation.
- Screenshots : bonnes dimensions exactes par appareil ciblé, FR et EN, fidèles à l'app réelle.
- Aucun mockup généré présenté comme une capture réelle.
