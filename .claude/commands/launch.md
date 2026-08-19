---
description: La commande "une ligne" — enchaîne idée → comptes → build → audit → App Store en autonomie maximale, sans s'arrêter entre les étapes automatisables.
argument-hint: "\"description de l'idée\" (le seul argument nécessaire)"
---

# /launch — d'une idée à l'App Store, en un minimum d'allers-retours

C'est la commande « monstre » : celle qui enchaîne **tout** ce qui est automatisable sans redemander la
main entre chaque étape, et qui ne s'arrête que sur les points que **seul Apple ou l'utilisateur** peuvent
débloquer. Elle ne remplace aucune commande existante — elle les enchaîne.

## 0. Constitution + honnêteté immédiate

Applique **recette-core**. Avant de lancer quoi que ce soit, dis en **une fois**, simplement, les
points de passage obligés qui existent quel que soit le niveau d'automatisation (jamais présentés en
cours de route comme une surprise) :

1. **Les comptes gratuits** (`/setup`) — chacun exige de coller un token que lui seul peut générer. **Une
   seule fois par personne**, pas par app : si `.recette/secrets.env` est déjà rempli, cette étape est
   sautée automatiquement.
2. **Le compte Apple Developer (99 $/an)** — c'est un paiement, personne ne peut le faire à sa place.
3. **Un code de connexion Apple (2FA)** ou une clé d'API Apple à générer une fois — voir skill
   `app-store-launch`.
4. **Le clic final `Submit for Review`** — irréversible, toujours confirmé avec lui avant.

Tout le reste — le code, l'infra, le contenu, les tests, les captures d'écran, le remplissage de la fiche
App Store — **tu le fais toi-même, sans qu'il ait à repasser derrière toi entre les étapes**.

## 1. Comprendre l'idée vite (déroulé condensé de `/new`)

Charge le skill **app-core-patterns**. Pose le **strict minimum** de questions pour verrouiller
`APP-SPEC.md` (voir `/new`) — si l'utilisateur a déjà donné assez de détails dans sa phrase de départ,
ne repose pas une question dont tu peux raisonnablement déduire la réponse (fais un choix par défaut
sensé, dis-le en une ligne, laisse-le corriger s'il n'est pas d'accord plutôt que de bloquer dessus).
Préviens immédiatement si l'idée touche un risque Apple connu (voir `/new` §3). GATE 1 s'applique : pas de
code tant que `APP-SPEC.md` n'a plus de `TODO` sur ses sections clés.

## 2. Comptes — automatique si déjà faits, guidé sinon

Vérifie `.recette/secrets.env` (via `scripts/verify-secrets.mjs`). Si tout le noyau requis par
`APP-SPEC.md` est déjà présent et valide : **passe directement à l'étape 3, sans rien redemander**. Sinon,
exécute `/setup` pour le strict nécessaire à cette app (pas plus), puis enchaîne automatiquement.

## 3. Build complet jusqu'à GATE 2a — sans pause entre les phases

Exécute `/build` en entier : les 7 phases (infra → scaffold → backend → features → paywall → landing →
assets) s'enchaînent automatiquement, chacune avec sa self-vérification (voir `app-builder`), **sans
redemander confirmation entre elles** — `/launch` est déjà la confirmation du lancement complet. Seule
exception : un point réellement irréversible/coûteux rencontré en route (règle recette-core §5) est
confirmé sur le moment, pour ce point précis seulement, puis la boucle reprend seule.

**Auto-correction** : si une phase échoue un check, laisse `app-builder` corriger (une passe), consulte le
skill `doctor` si besoin, retente. Ce n'est qu'après plusieurs tentatives vraiment infructueuses que tu
t'arrêtes proprement avec **une seule question précise** — jamais une boucle qui tourne dans le vide, jamais
un blocage silencieux.

Une fois les 7 phases vertes : lance l'agent **`auditor`** sur le périmètre GATE 2a. S'il remonte des ⛔,
reviens corriger les phases concernées (pas de redémarrage complet) et re-audite, jusqu'à zéro ⛔.

## 4. Montrer que ça marche

Lance `/preview` toi-même une fois pour vérifier que le QR code et le parcours principal fonctionnent, puis
propose-le à l'utilisateur en une phrase (« Ton app est prête à voir, scanne ce QR code — pendant ce temps
je prépare la suite »). Continue en parallèle logique vers l'étape 5 sans attendre sa réponse si elle
n'est pas bloquante.

## 5. Route vers l'App Store — jusqu'au dernier point réellement humain

Enchaîne `/app-store` depuis le début : GATE 2a déjà vérifiée (étape 3), donc go direct sur GATE 2b —
`eas.json`, credentials non-interactifs (skill `app-store-launch`), build EAS, TestFlight, remplissage de
la fiche (texte, catégorie, App Privacy, export compliance — tout ce qui s'automatise, rempli sans lui
redemander), captures d'écran (skill `assets`, à partir de `/preview` ou TestFlight).

Dès qu'un point de passage listé en §0 est atteint (compte Apple à créer, 2FA, contrats à signer) :
**arrête-toi net sur ce point précis**, donne l'instruction exacte (URL, clics), et **reprends
automatiquement la suite dès qu'il confirme que c'est fait** — jamais besoin de retaper `/launch` ou
`/app-store`, la boucle continue d'elle-même.

## 6. Le clic final

Une fois GATE 2b entièrement verte (voir `definition-of-done`), confirme avec lui une dernière fois avant
`Submit for Review` (règle recette-core §5 — c'est irréversible), puis accompagne le clic exact.

## 7. Rapporter

Une fois soumise : explique les statuts à venir (*Waiting for Review* → *In Review* → *Approved*/
*Rejected*), le délai typique (souvent 24-48 h), et que tu restes disponible — un rejet éventuel se gère
avec `/rejected`, automatiquement aussi.

## Ce que `/launch` ne prétend jamais

Ne présente jamais la publication comme instantanée ou garantie : le délai de review Apple, la possibilité
d'un rejet, et les 4 points de passage humains du §0 restent réels et sont dits **une fois, au début**,
jamais cachés pour paraître plus impressionnant.
