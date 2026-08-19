---
name: definition-of-done
description: >
  Le référentiel unique de « c'est prêt » pour une app La Recette, scindé en deux portes (GATE 2a et
  GATE 2b) et 4 parties (A. complétude technique, B. guidelines Apple 1-5, C. prêt pour soumission,
  D. niveau production). Chargé par l'agent `auditor` (audit adversarial) et par `/app-store` (pour savoir
  quelle porte il ferme). Ne valide rien lui-même — c'est la checklist que d'autres appliquent.
---

# definition-of-done — le référentiel « c'est prêt »

Une app n'est jamais « prête » sur impression. Elle l'est quand **chaque item ci-dessous est prouvé**
(fichier, commande qui passe, page en ligne testée) — jamais sur un « ça a l'air bon ».

## Les deux portes

- **GATE 2a — Code-complet.** Tout ce qui se vérifie **sans compte Apple**, en quelques heures : le code
  tourne, rien ne fuit, rien n'est cassé ou factice. Fermée par `/build` (via l'agent `app-builder`, phase
  par phase) et confirmée par l'agent `auditor` en fin de build.
- **GATE 2b — Validé pour soumission.** Tout ce qui **exige** un vrai build EAS, TestFlight, et un compte
  Apple Developer actif — prend des jours, pas des heures. Fermée par `/app-store`, item par item.

On n'ouvre jamais GATE 2b tant que GATE 2a a un ⛔.

---

## PARTIE A — Complétude technique (GATE 2a)

- [ ] `tsc --noEmit` passe (aucune erreur de type).
- [ ] `expo export --platform ios` passe (le bundle se construit).
- [ ] Tous les écrans déclarés dans la navigation sont **atteignables** — aucune route morte, aucun
      `onPress` vide.
- [ ] Chaque écran avec des données gère les 4 états : **chargement, vide, erreur, rempli**.
- [ ] **Hors-ligne** géré proprement (pas de crash, message clair) sur les écrans qui dépendent du réseau.
- [ ] **Zéro secret dans le bundle** : `grep -rn "EXPO_PUBLIC_"` ne renvoie que des valeurs publiques
      (URL, clé anon Supabase, clé publique RevenueCat) — aucune clé serveur, aucun `sk-`/`sbp_`/
      `service_role` en dur nulle part dans le code client.
- [ ] Aucun `TODO`/`FIXME`/`lorem`/texte placeholder visible dans l'UI livrée.
- [ ] i18n complet : toutes les chaînes visibles passent par les clés FR **et** EN, aucune chaîne en dur.

## PARTIE B — Balayage guidelines Apple 1 → 5 (GATE 2a puis re-vérifié GATE 2b)

Croise toujours avec la version **live** des guidelines (`https://developer.apple.com/app-store/review/guidelines/`)
avant de conclure sur un point sensible — elles bougent.

- **1. Safety**
  - [ ] (si UGC) modération du contenu généré par les utilisateurs présente.
  - [ ] (si domaine sensible — santé, finance, mineurs) disclaimers et garde-fous adaptés.
  - [ ] URL de support valide et vivante (1.5).
- **2. Performance**
  - [ ] App **complète** à la soumission, pas de placeholder (2.1) ; **compte démo** fourni et testé si
        auth requise.
  - [ ] Métadonnées (nom, description, screenshots) **exactes**, reflètent la vraie app (2.3).
  - [ ] Privacy manifests présents si des SDK tiers en ont besoin (2.5.2).
- **3. Business**
  - [ ] (si IAP) bouton **Restaurer les achats** présent et fonctionnel (3.1.1).
  - [ ] (si IAP) écran paywall affiche **prix + durée + renouvellement automatique** + liens **Conditions**
        et **Confidentialité** (3.1.2).
- **4. Design**
  - [ ] L'app n'est pas un simple wrapper de site web (4.2) — logique/UI natives réelles.
  - [ ] (si login tiers proposé) **Sign in with Apple** offert en option équivalente (4.8).
- **5. Legal**
  - [ ] Politique de confidentialité en **HTTPS**, en ligne, **nommant les tiers** (Supabase, RevenueCat,
        OpenAI…) utilisés (5.1.1).
  - [ ] (si compte utilisateur) **suppression de compte possible dans l'app**, pas seulement « contactez-nous »
        (5.1.1v).
  - [ ] (si IA) écran de **consentement nommant le prestataire IA**, cohérent avec les pages légales (5.1.2).

## PARTIE C — Prêt pour la soumission (GATE 2b)

- [ ] Icône + splash générés, cohérents avec l'identité de l'app.
- [ ] Screenshots App Store aux **bonnes tailles**, **localisés** (FR/EN), fidèles à la vraie app (pas de
      mockup trompeur).
- [ ] App Privacy label exact vs ce que l'app collecte réellement.
- [ ] Export compliance répondu (chiffrement standard iOS = exempté, cas courant).
- [ ] Âge / classification de contenu réglé.
- [ ] **Compte démo** testé de bout en bout par un tiers (le reviewer doit pouvoir se connecter et
      atteindre le paywall).
- [ ] Contrats App Store Connect (*Agreements, Tax and Banking*) signés.

## PARTIE D — Niveau « production » (GATE 2b, dernier passage avant Submit)

- [ ] L'app ne ressemble pas à un prototype généré à la va-vite : micro-soin (espacements, transitions,
      messages d'erreur humains).
- [ ] Perf testée sur un **vrai build** (pas seulement en dev/Expo Go).
- [ ] Testée sur **TestFlight** avant `Add for Review` (pas seulement en local).

---

## Comment ce référentiel est utilisé

- L'agent **`auditor`** balaie les 4 parties en mode adversarial et rend une todo scorée ✅/⚠️/⛔ (voir
  `.claude/agents/auditor.md`).
- `/build` (via `app-builder`) vise GATE 2a phase par phase.
- `/app-store` vise GATE 2b section par section, et ne laisse cliquer `Submit for Review` que quand
  **tout** est vert.
