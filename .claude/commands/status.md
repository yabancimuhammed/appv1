---
description: Donne un état des lieux honnête — ce qui est fait, ce qui reste, en langage clair.
---

# /status — où j'en suis

## 0. Constitution
Applique **recette-core**. Honnêteté stricte : jamais un item « en attente » présenté comme déjà acquis
(règle explicitement rappelée dans `.claude/commands/app-store.md` §0bis pour la partie App Store).

## 1. Lire l'état réel
Lis `APP-SPEC.md` (existe-t-il, est-il complet ?) et `PROGRESS.md` (phases cochées, notes, décisions).
S'il n'y a encore rien : dis-le simplement et route vers `/new`.

## 2. Répondre en 3 blocs nets (même logique que `/app-store` §0bis)
1. **✅ Fait** — ce qui est réellement construit et prouvé (phases cochées avec preuve, pas juste tentées).
2. **⏳ À faire** — le reste, classé par ce qui dépend de toi (l'agent) vs de comptes/décisions externes ;
   si une mise en service dépend du compte Apple (ex. abonnements réels), le dire explicitement en attente,
   jamais rangé comme « déjà géré ».
3. **🧑 Ses clics à lui** — ce qui n'attend que lui (compte Apple, décision produit, etc.), s'il y en a.

## 3. Une seule prochaine action
Termine toujours par **une** action concrète suivante à faire, jamais une liste à trier lui-même.
