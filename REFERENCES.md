# REFERENCES.md — Inspection des 7 références
Date : 2026-07-19 · Méthode : navigation + inspection DOM/JS (détection libs, fonts, couleurs, structure).
Note : la capture d'écran du navigateur intégré était indisponible pendant cette session ; les observations visuelles fines (easings exacts, timings frame par frame) seront re-vérifiées pendant le build, où la boucle screenshot fonctionne sur le dev server local.

## 1. dock.cool — ATTENTION, LE SITE A CHANGÉ
Le site actuel est une landing produit pour « Cooldock », un second dock macOS. Fond clair, grille marketing classique. **Le site spatial sombre aux rochers symétriques décrit dans le brief n'existe plus à cette URL.**
→ Décision : on garde le *dispositif* décrit dans le brief (objets latéraux symétriques flottants, espace négatif, calme spatial) comme spécification, sans pouvoir le ré-inspecter. Le brief reste la source de vérité pour cette référence.

## 2. 333southwabash.com — « THE RED »
- Moteur 100 % custom : un seul `<canvas>` plein écran, deux fichiers JS minifiés (`c.js`, `a.js`), **pas de GSAP** — tout est rendu dans le canvas.
- Fond rouge brique `rgb(195,45,48)`, une seule fonte custom (`mg`).
- Copy : « This is THE RED. Built to be bold. » — l'intro typographique est le produit d'appel du site.
- Leçon : l'intro n'est pas un loader décoré, c'est une **scène** ; la phrase d'accroche EST l'identité. Le contenu SEO reste dans le DOM sous le canvas.
- Pour nous : on n'ira pas jusqu'au moteur canvas intégral (risque/perf/SEO) ; on obtient le même effet avec des masques DOM/SVG + une couche WebGL ciblée.

## 3. edit.church — le modèle de /projets
- Kirby CMS + Tachyons CSS. Fond blanc, filets hairline `black-20`.
- **Une seule fonte pour tout le site** : Superstudio LL Bold (grotesque monospace-ish, LineTo) — l'identité tient à ce choix radical.
- L'index Work : des lignes `<a class="work-item">` avec `data-video` ; **un seul élément `<video>` partagé** dont le `src` est permuté au survol de chaque ligne. Économe et instantané.
- Filtres par Client / Project / Editor en haut de liste, purement typographiques.
- Leçon : la densité typographique + un seul média réutilisé > une grille de vignettes. Métadonnées sèches en capitales.

## 4. analogueagency.com
- Construit sur **Framer**. Fond gris clair `rgb(237,237,237)`.
- Duo typographique signifiant : **Graphik** (corps, neutre) + **LCDDot TR** (fonte à matrice de points LCD) pour la voix « machine » : labels, statuts, overlay.
- L'overlay dynamique haut de page tire sa personnalité de cette fonte-écran : le statut scroll est affiché comme sur un appareil.
- Leçon : la « voix technique » doit avoir sa propre fonte et son propre registre. Notre équivalent : la mono en capitales avec vocabulaire de tournage (`TRAVERSÉE 01 · SALON → CUISINE`).

## 5. roiheads.com + trucknroll.com — l'échelle typographique
- roiheads : **GSAP + ScrollTrigger + Lenis confirmés dans le window**. Fond quasi-noir `rgb(13,12,15)`. H1 à **240 px** (fonte Alfredino). Notre stack exacte, en production, au niveau visé.
- trucknroll : H1 à **200 px**, National 2 Condensed, retours à la ligne forcés mot à mot (« FULL / TOURS, / NO / EXCUSES. »).
- Leçon : l'échelle display commence à ~200 px sur desktop ; le mot seul sur sa ligne est un dispositif de mise en page, pas un accident. Le type peut déborder du viewport.

## 6. lemansclassic.richardmille.com — le standard de qualité
- Fond jaune `rgb(255,229,0)`, fontes **DieGroteskC + Arges Condensed**.
- Structure : récit photographique par **chapitres** — `(01) MATINÉE`, labels utilitaires entre parenthèses `(À PROPOS)`, `(CHAPITRES)`.
- **Son : opt-in explicite**, état affiché en permanence : `(SOUND: OFF)`. C'est un label d'état, pas une icône.
- Copy française littéraire, précise, matérielle (« deux boitiers Canon, quatre objectifs, flash cobra »). La précision du réel fait le luxe.
- Leçons : (a) la page est un film chapitré, le scroll est la timeline ; (b) chaque état du site est nommé en toutes lettres ; (c) le détail concret > l'adjectif.

## 7. thepatchsystem.com/ai
- **Lenis confirmé**, 2 canvas WebGL, fond `#040404`.
- Duo **Archivo** (utilitaire) + **PP Right** (display serré). Nav en liste capitale sèche (HOME / WHAT WE DO / PROCESS...).
- Leçon : Lenis + canvas ciblés sur un site marketing classique — le smooth scroll porte à lui seul une grande part de la qualité perçue.

## Synthèse — le vocabulaire qu'on retient
1. **Lenis est non négociable** (confirmé sur les 2 sites les plus proches de notre stack).
2. L'identité tient à **peu de fontes très assumées** (edit.church : une seule) et à une **voix technique séparée** (LCDDot, mono).
3. Display ≥ 200 px desktop, le mot comme unité de layout.
4. **Tout état est nommé en toutes lettres** (`(SOUND: OFF)`, chapitres numérotés quand c'est réellement une séquence — ici le scroll EST une séquence, les index sont donc légitimes).
5. Un seul `<video>` permuté pour l'index projets.
6. L'intro est une scène qui pose l'identité, le DOM garde le contenu SEO.
7. La précision matérielle de la copy (chiffres, matériel, durées) est un signal de luxe.
