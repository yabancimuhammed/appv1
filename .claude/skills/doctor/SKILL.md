---
name: doctor
description: >
  Base de pannes de La Recette : erreurs courantes rencontrées en production (Expo/EAS, Supabase,
  RevenueCat, Vercel) et leur correction directe, en une phrase humaine + une action. Chargée par
  app-builder quand un check échoue de façon répétée, et par /doctor pour un diagnostic à la demande.
---

# doctor — base de pannes

Avant de laisser un problème remonter à l'utilisateur, vérifie s'il correspond à un cas connu ci-dessous.
Toujours dans l'ordre de la constitution (`recette-core`) : rassure, explique en une phrase, corrige toi-même
si le cas est listé.

## Expo / EAS

| Symptôme | Cause probable | Action |
|---|---|---|
| « Unable to resolve module » après ajout d'un package | cache Metro périmé | `npx expo start -c` |
| Expo Go plante sur un écran précis, marche en dev build | module natif non supporté par Expo Go | basculer en dev client (`expo-dev-client`), voir skill `expo-ios-app` |
| `eas build` bloque sur un prompt Apple/2FA | pas de credentials non-interactifs posés | poser App Store Connect API Key + app-specific password, voir skill `app-store-launch` |
| `eas submit` échoue « missing ascAppId » | fiche app pas encore créée dans App Store Connect | créer la fiche (ou laisser EAS la générer), renseigner `ascAppId` dans `eas.json` |
| Build EAS échoue « SDK version mismatch » | `package.json` désynchronisé du SDK Expo installé | `npx expo install --fix` |

## Supabase

| Symptôme | Cause probable | Action |
|---|---|---|
| Requête renvoie vide alors que la donnée existe | RLS bloque (policy manquante/mal écrite) | relire la policy, tester avec `auth.uid()` correct |
| « JWT expired » en boucle | session non rafraîchie côté client | vérifier la config `autoRefreshToken: true` du client Supabase |
| Migration refuse de s'appliquer | conflit avec une migration déjà appliquée en prod | `supabase migration list` pour comparer local/distant avant de forcer quoi que ce soit |

## RevenueCat / IAP

| Symptôme | Cause probable | Action |
|---|---|---|
| Achat sandbox ne déclenche pas le webhook | webhook mal configuré côté dashboard RevenueCat | vérifier l'URL de l'edge function enregistrée |
| `is_premium` ne se met pas à jour après achat | client lit un état local au lieu de relire la base | toujours relire depuis Supabase après un événement d'achat |

## Vercel / landing

| Symptôme | Cause probable | Action |
|---|---|---|
| Déploiement échoue « Module not found » | dépendance non installée / lockfile désynchronisé | réinstaller proprement, commit le lockfile à jour |
| Page légale renvoie 404 en prod | route pas incluse dans le build (export statique mal configuré) | vérifier la génération de route dans `next.config` |

## Si le cas n'est pas listé

1. Une passe de correction basée sur le message d'erreur réel (pas de supposition).
2. Si ça persiste après quelques tentatives : **stop propre** — explique en une phrase, donne la seule
   prochaine action (souvent : une info que seul le client peut fournir), n'insiste jamais en boucle.
3. Ajoute le nouveau cas ici une fois résolu, pour que la prochaine fois soit plus rapide.
