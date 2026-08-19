# Objectif Corps (nom provisoire — à confirmer/changer avec le client)

## Idée
Une app iPhone qui aide les personnes en surpoids à progresser vers leur objectif corporel, au quotidien :
elles prennent en photo leurs repas, l'app les aide à comprendre ce qu'elles mangent, propose des conseils
et des alternatives plus adaptées à leur objectif — sans jugement, sans chiffres culpabilisants.

## Moment magique (le cœur métier)
**Scanner un repas → obtenir une analyse utile en quelques secondes** : photo du repas → l'IA identifie les
aliments et estime les macros/calories → l'utilisateur voit tout de suite si ça colle avec son objectif du
jour, et reçoit (si pertinent) 1-2 suggestions concrètes de remplacement plus adapté (ex. « remplace le
riz blanc par du riz complet pour plus de satiété »).

## Fonctionnalités MVP
1. **Scanner un repas** (photo → analyse IA : aliments détectés, calories/macros estimés) — le moment magique.
2. **Journal quotidien** des repas scannés + un indicateur de régularité (ex. série de jours suivis).
3. **Conseils personnalisés** générés à partir des repas du jour et de l'objectif de l'utilisateur.
4. **Suggestions de remplacement d'aliments** (alternatives plus adaptées, jamais culpabilisantes).
5. **Suivi de progression** (poids/mesures dans le temps, simple graphique).

## Modèle économique
Freemium : le journal de base (log manuel, suivi de progression) est **gratuit**. Le **scan photo par IA**,
les **conseils personnalisés** et les **suggestions de remplacement** sont réservés aux abonnés (mensuel +
annuel, via RevenueCat). *(Répartition à valider avec le client à la prochaine étape produit — c'est un
choix par défaut raisonnable, pas gravé dans le marbre.)*

## Données collectées
Email (auth), poids/mesures, objectif personnel, photos de repas, historique alimentaire. **Domaine
sensible (santé/nutrition)** — voir section Risques ci-dessous : privacy policy renforcée, aucune revente
à des tiers, suppression de compte in-app obligatoire.

## Écrans principaux
- **Accueil / Journal** : repas du jour, indicateur de régularité, résumé rapide vs objectif.
- **Scanner un repas** : caméra → analyse IA → résultat éditable (l'utilisateur peut corriger avant de
  valider — l'IA n'est jamais présentée comme infaillible).
- **Détail d'un repas** : macros estimés, conseil du jour, suggestions de remplacement.
- **Progression** : graphique poids/mesures dans le temps.
- **Réglages** : objectif, compte, **suppression de compte** (obligatoire, guideline Apple 5.1.1v).

## Style / identité visuelle
Ton bienveillant, jamais culpabilisant (pas de rouge alarmant sur un excès, pas de chiffres qui "punissent").
Palette apaisante par défaut (verts/teals) — ajustable ensuite via `/ui`.

## Archétype(s) retenu(s)
Composition de deux archétypes (voir skill `app-core-patterns`) :
- **`content-library`** pour chaque repas scanné (élément enrichi par IA, horodaté, avec ses macros).
- **`tracker-streak`** pour la régularité du journal et la progression vers l'objectif.

## ⚠️ Risque Apple identifié (à traiter, pas à ignorer)
Domaine **santé/nutrition** → guideline **1.4.1** (pas de comportement dangereux/encouragement à des
restrictions extrêmes) et **5.1.1** (données de santé = catégorie sensible, à déclarer précisément dans
l'App Privacy label). Mitigations prévues dès le build :
- Disclaimer visible : « Cette app ne remplace pas un avis médical ou un(e) diététicien(ne). »
- Aucune "prescription" médicale, uniquement des suggestions génériques et raisonnables.
- Aucune restriction calorique extrême encouragée par les conseils générés (bornes de sécurité côté prompt IA).
- Ton et wording toujours bienveillants, jamais stigmatisants ("surpoids" reste un terme interne/produit —
  le wording utilisateur final sera positif, ex. "ton objectif", jamais un jugement).
