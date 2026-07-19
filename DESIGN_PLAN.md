# DESIGN_PLAN.md — VESTA
Site-expérience scroll-driven · 4 pages · Next.js App Router
Statut : **EN ATTENTE DE VALIDATION** — rien n'est codé avant votre accord.

---

## 0. LA THÈSE

Vesta vend le passage d'un lieu froid et vide à un lieu habité. Le site ne le raconte pas : **il le fait subir au visiteur via le scroll**. Chaque page est une démonstration d'un service, pas sa description.

La tension qui structure toute la DA : **pierre froide / flamme**. Le site vit dans le basalte et s'allume par endroits — jamais l'inverse. La braise est rare, donc précieuse.

---

## 1. TOKENS

### 1.1 Couleur — palette « braise sur basalte »

| Token | Hex | Rôle |
|---|---|---|
| `--basalte` | `#12151A` | Fond profond. Gris-bleu minéral, pas noir pur. |
| `--basalte-2` | `#1B1F26` | Surfaces surélevées, panneaux nav, fiches. |
| `--pierre` | `#E9E4DA` | Typo principale sur sombre. Blanc pierre chaud, pas #FFF. |
| `--gris-pierre` | `#8F8B82` | Texte secondaire, métadonnées. |
| `--filet` | `#3A3E45` | Hairlines, bordures, règles. |
| `--braise` | `#C2551E` | L'UNIQUE accent chaud. Braise profonde, pas orange vif. |
| `--bronze` | `#96794C` | Micro-détails : index, filets actifs, compteurs, focus ring. |

Règles :
- La braise n'apparaît **que** sur : le curseur, la progression scroll, le CTA, la flamme finale du home staging, et 2–3 mots choisis par page. Jamais en aplat de section.
- Le bronze est la voix des chiffres et des index — il dit « instrument de précision ».
- **Inversion sur `/retouche`** : la page démarre sur `--basalte` et son fond **glisse vers `#E5E0D6` (pierre claire) au fil du scroll**, typo basculant vers `#16191E`. Justification : c'est la page de la lumière — le fond de page lui-même subit la retouche. La respiration claire du parcours est gagnée par le scroll, pas décrétée.
- Contraste : pierre/basalte = 12.9:1, gris-pierre/basalte = 5.8:1, bronze/basalte = 4.6:1 — AA partout. La braise sur basalte (4.0:1) n'est jamais porteuse de texte < 24 px.

### 1.2 Typographie — trois voix

| Rôle | Fonte | Réglage | Pourquoi |
|---|---|---|---|
| **Display** | **Anybody** (Etcetera Type, variable wght 100–900 · wdth 50–150) | Uppercase, `wdth` 120–130, `wght` 800, tracking -2% | Grosse grotesque très large aux proportions lapidaires. Les contreformes épaisses sont de vraies fenêtres pour la vidéo en masque. **L'axe de largeur variable est animé** : les titres se compressent/dilatent au scroll comme un format anamorphique. Peu vue, gratuite, self-hostable. |
| **Texte** | **Switzer** (Fontshare, variable) | 16–18 px, interlignage 1.6, tracking 0 | Neutre suisse contemporaine, moins usée qu'Inter, excellente en petites masses serrées. |
| **Utility / mono** | **Martian Mono** (variable, condensed) | Uppercase, 11–13 px, `wdth` condensé, tracking +6% | La voix technique du studio : `TRAVERSÉE 01 · SALON → CUISINE · 6S`. Condensée = densité d'instrument de mesure. |

Échelle (desktop → mobile, via clamp) :
- `--type-colossal` : clamp(88px, 16vw, 260px) — un mot par ligne, peut déborder du cadre (réf. roiheads/trucknroll)
- `--type-display` : clamp(48px, 8vw, 120px)
- `--type-titre` : clamp(28px, 4vw, 56px)
- `--type-corps` : 16–18px
- `--type-mono` : 11–13px
Toutes les fontes self-hostées via `next/font`, subsets latin, `font-display: swap` sauf display (block 300ms — elle EST le hero).

### 1.3 Motion — la grammaire

Easings signature (tokens CSS + GSAP) :
- `--ease-pierre` : `cubic-bezier(0.65, 0, 0.15, 1)` — masques, wipes, transitions de page. Sec au départ, posé à l'arrivée.
- `--ease-braise` : `cubic-bezier(0.22, 1, 0.36, 1)` — sorties de texte, éléments légers.
- `--ease-poids` : `cubic-bezier(0.34, 1.28, 0.44, 1)` — le « settle » des meubles : léger dépassement puis contact.

Durées : micro-interactions 180–260 ms · révélations de section 600–900 ms · tout ce qui est piloté au scroll est en `scrub` (pas de durée propre).

Règles absolues :
1. **Rien n'entre par fade-in-up.** Tout entre par **révélation** (clip-path, masque, ligne qui se dessine) ou par **déplacement avec poids**.
2. Un seul élément « héros » animé par viewport à la fois ; le reste est décor stable.
3. `prefers-reduced-motion` : chaque séquence a un état final statique soigné (la pièce meublée, la photo retouchée, la frame la plus belle du film) — jamais une page vide.
4. Seules `transform`, `opacity`, `clip-path` sont animées. Jamais width/height/top/left.

### 1.4 Layout
- Grille 12 colonnes, marges `4vw` (min 20 px), gouttières 24 px.
- Rythme vertical généreux : sections 160–240 px de padding desktop, 96 px mobile.
- Les filets hairline (`--filet`, 1px) structurent les listes et les métadonnées (réf. edit.church) — **aucune carte, aucun border-radius, aucune ombre portée.**

---

## 2. L'ÉLÉMENT SIGNATURE — DÉCISION A/B

**Décision : B et A ensemble, hiérarchisés — B là où l'on impressionne, A là où l'on prouve.**

- **B — fragments de statue (home + /projets).** 3 fragments photoréalistes générés puis détourés : un profil de visage voilé, une main tenant une flamme, un pli de drapé. Disposés en **symétrie latérale** (dispositif dock.cool), parallaxe lente à 3 profondeurs. La **lumière de braise rampe sur la pierre au scroll** : implémentation légère — chaque fragment existe en 2 expositions (froide / embrasée par la droite), superposées, le crossfade + un léger déplacement de masque radial étant pilotés par ScrollTrigger. Effet « la flamme approche » sans WebGL obligatoire ; une passe de grain WebGL (ogl) par-dessus si le budget perf le permet.
- **A — la ligne claire (fil conducteur partout).** Un seul trait SVG continu qui se dessine au scroll (`stroke-dashoffset`) et **se métamorphose entre sections** : silhouette de Vesta → plan de maison → flamme → cadre de caméra. Présent sur /retouche et /home-staging en marge, dans le loader, et en fallback reduced-motion/mobile bas de gamme des fragments B.
- **La braise persistante** : le curseur (point braise avec halo), la barre de progression scroll (un filet qui s'embrase), le loader (une braise qui respire). Sur les 4 pages.

Justification : B porte le premier regard et le luxe (home, projets = pages d'entrée commerciales) ; A est quasi gratuit en octets, tient le mobile et reduced-motion, et relie les 4 pages par un même geste graphique. Les deux partagent la même silhouette source — une seule identité.

---

## 3. L'INTRO (~2,2 s, skippable, 1× par session)

Accroche retenue : **« LE FEU AVANT LA VISITE »** — elle vend l'effet produit (l'émotion arrive avant la visite physique) et contient le métier en 4 mots.
Deux alternatives proposées, au cas où :
1. **« NEUF PHOTOS SUFFISENT »** — la promesse produit brute, chiffrée ; répond à la ligne finale « Générée à partir de 9 photos ».
2. **« PERSONNE N'ACHÈTE DES MURS »** — la thèse foyer/feu en négatif, plus provocante.

Storyboard (fond `--basalte`) :
| t | Beat |
|---|---|
| 0.0 s | Noir minéral. Une **braise** unique s'allume au centre (le point du curseur naît ici). |
| 0.3 s | « LE FEU » entre par **masques verticaux** — les lettres sont des volets qui se rejoignent, pas un fade. |
| 0.9 s | « AVANT LA VISITE » complète la phrase, `wdth` de la fonte se dilate de 100 → 125 (l'anamorphique s'ouvre). |
| 1.5 s | La contreforme du **O de FOYER... du E final** se remplit de vidéo — première apparition du principe fondateur. |
| 1.9 s | Le masque s'ouvre depuis cette lettre en **cercle** (le temple rond) et révèle le hero. La braise de l'intro **devient le curseur**. Continuité totale, zéro coupe. |

Règles : `sessionStorage` (1× par session) · bypass `prefers-reduced-motion` · hero complet dans le DOM dès le SSR (SEO) · skip au clavier (Échap / Entrée) annoncé aux lecteurs d'écran.

---

## 4. LES 4 PAGES — WIREFRAMES + STORYBOARDS SCROLL

### 4.1 `/` — LA VIDÉO PROMO · « le scroll est le film »

```
┌────────────────────────────────────────────┐
│ VESTA · 00:00/00:47 · OUVERTURE      [mono]│ ← overlay statut
│  ◤frag.                          frag.◥    │ ← fragments B symétriques
│      V E S T A                             │
│      ██████████  ← video dans contreformes │
│      LE FEU AVANT LA VISITE       [display]│
│                              (RDV) ●braise │
├────────────────────────────────────────────┤
│  LE SCROLL          [lettres éclatées,     │
│  EST LE FILM         chaque glyphe = une   │
│                      fenêtre sur la frame] │
├────────────────────────────────────────────┤
│ ▶ TRAVERSÉE 01 · SALON → CUISINE · 6S      │
│  [pinned : la caméra franchit la porte,    │
│   masque circulaire au passage]            │
├────────────────────────────────────────────┤
│  [PLEIN ÉCRAN — unique moment full-bleed,  │
│   scrub frame par frame]                   │
├────────────────────────────────────────────┤
│  9 PHOTOS ————→ UN FILM                    │
│  [planche contact 9 photos → convergence]  │
│  Montage humain. Image par image.          │
├────────────────────────────────────────────┤
│  ÉTINCELLE ─────────────── 1er film offert │
│  FLAMME    ─────────────── 1er film offert │
│  BRASIER   ─────────────── 1er film offert │  ← lignes typographiques, pas de cartes, pas de prix
├────────────────────────────────────────────┤
│  CETTE VIDÉO, VOUS VENEZ                   │
│  DE LA SCROLLER.              [colossal]   │
│  Générée à partir de 9 photos.      [mono] │
│  Montée à la main. Livrée en 72 h.         │
│         [ PRENDRE RENDEZ-VOUS ]            │
└────────────────────────────────────────────┘
```

Storyboard scroll :
1. **HERO** — « VESTA » colossal, la vidéo vit dans les contreformes (`background-clip: text` + fallback masque SVG). Fragments B en parallaxe latérale. Statut : `00:00 / 00:47`.
2. **MANIFESTE** — « LE SCROLL EST LE FILM » : SplitText, les glyphes dérivent et se recomposent, chacun cadrant une portion différente de la même frame (une seule `<canvas>`/vidéo source, N masques — économe).
3. **TRAVERSÉE 01** — section pinnée. Le film franchit la porte salon → cuisine, scrubé. Label mono qui suit la progression. Au moment du franchissement : masque circulaire (le temple). **C'est le différenciateur produit : il est nommé, montré, chronométré.**
4. **PLEIN ÉCRAN** — le seul moment full-bleed rectangulaire du site. Contraste maximal parce que tout le reste est masqué.
5. **9 PHOTOS → UN FILM** — la planche contact des 9 photos sources converge et s'empile dans le cadre film. Copy : le montage humain, image par image. Métadonnées bronze.
6. **OFFRES** — trois lignes typographiques (Étincelle · Flamme · Brasier), filets hairline, contenu au survol/déplié, `1ER FILM OFFERT` en mono bronze. Aucun prix, aucun bouton par offre — la ligne entière mène au RDV.
7. **PUNCH** — « Cette vidéo, vous venez de la scroller. » Full screen, silence (tout le décor s'éteint, fragments compris), respiration de 100vh… puis la ligne mono, puis le CTA seul. Monté comme une fin de film.

### 4.2 `/retouche` — « le scroll est le curseur avant/après »

```
┌────────────────────────────────────────────┐
│ VESTA · CALAGE BLANCS · 0/7          [mono]│
│  [photo brute plein écran, sous-ex,        │
│   verticales tombantes]                    │
│  IMG_4032.HEIC · 1/60 · ISO 800  [mono]    │
├────────────────────────────────────────────┤
│  [WIPE 1 : un rai de lumière traverse      │
│   l'image en diagonale = frontière av/ap]  │
│  +1.3 EV · VERTICALES · GRAIN 12%          │
├────────────────────────────────────────────┤
│  [LA COURBE — l'histogramme est le         │
│   graphisme, il se redresse au scroll]     │
├────────────────────────────────────────────┤
│  [LA FENÊTRE — ciel gris → heure dorée     │
│   pendant le scroll ; le FOND DE PAGE      │
│   commence à s'éclaircir ici]              │
├────────────────────────────────────────────┤  ← page devenue claire
│  [SÉRIE — 5 avant/après rapides,           │
│   verticales qui se redressent]            │
├────────────────────────────────────────────┤
│  VOUS N'AVEZ PAS REGARDÉ LA PHOTO.         │
│  VOUS L'AVEZ RETOUCHÉE.        [colossal]  │
│         [ PRENDRE RENDEZ-VOUS ]            │
└────────────────────────────────────────────┘
```

Le geste propre à cette page : **le fond de page subit lui-même la retouche** — basalte → pierre claire, piloté par le scroll entre les sections 3 et 4. La page entière est l'avant/après. Fil conducteur A (ligne claire) en marge, qui trace la courbe de correction.

### 4.3 `/home-staging` — « le scroll meuble la pièce »

```
┌────────────────────────────────────────────┐
│ VESTA · SALON · 0 ÉLÉMENT POSÉ       [mono]│
│  [pièce vide plein écran — frame 0]        │
├────────────────────────────────────────────┤
│  [SCRUB ~120 frames pré-rendues :          │
│   canapé → table → luminaire → tapis       │
│   → plantes → cadres                       │
│   caméra MONTÉE : travelling, changement   │
│   d'axe, temps morts — pas un zoom]        │
│   · compteur mono s'incrémente             │
│   · chaque pose = settle avec poids        │
├────────────────────────────────────────────┤
│  [LA FLAMME — la lampe s'allume,           │
│   colorimétrie bascule chaud. Climax.]     │
│  VESTA · SALON · FOYER ALLUMÉ        [mono]│
├────────────────────────────────────────────┤
│  LA PIÈCE ÉTAIT VIDE                       │
│  IL Y A TRENTE SECONDES.       [colossal]  │
│  Visuels virtuellement aménagés,           │
│  non contractuels.                  [mono] │
│         [ PRENDRE RENDEZ-VOUS ]            │
└────────────────────────────────────────────┘
```

**Implémentation retenue : (a) séquence d'images pré-rendues scrubée** — ~120 frames WebP/AVIF sur `<canvas>`, préchargement progressif par tranches, placeholder = frame 0 en AVIF prioritaire.
Pourquoi (a) : rendu cinéma garanti (la caméra « montée » est fabriquée dans les assets, pas simulée en runtime), fiabilité iOS totale, réversibilité gratuite (rescroller dévêtit la pièce — preuve que ce n'est pas une vidéo), et c'est littéralement le procédé Vesta (keyframes + interpolation vidéo) appliqué au site.
Écarté : (b) Three.js — 3 semaines de risque pour un intérieur crédible ; (c) vidéo scrubée — seek imprécis sur Safari iOS, réversibilité saccadée.
**Prototype d'abord sur une seule pièce, avec Stop de validation, avant d'industrialiser.**
Mobile : séquence dédiée ~60 frames, cadrage vertical recomposé (pas un crop).

### 4.4 `/projets` — modèle edit.church

```
┌────────────────────────────────────────────┐
│ VESTA · 3 FILMS LIVRÉS               [mono]│
│  INDEX                                     │
│ ───────────────────────────────────────────│
│  MAISON CÔTE PAVÉE      T4 · 112 M² ·      │
│                         9 PHOTOS · 2 TRAV. │
│ ───────────────────────────────────────────│  ← survol : la ligne s'ouvre,
│  T3 SAINT-AUBIN         T3 · 78 M² ·       │     extrait vidéo dans la marge
│                         11 PHOTOS · 3 TRAV.│     (un seul <video>, src permuté)
│ ───────────────────────────────────────────│
│  LOFT CARMES            T2 · 64 M² ·       │
│                         8 PHOTOS · 1 TRAV. │
│ ───────────────────────────────────────────│
│         [ PRENDRE RENDEZ-VOUS ]            │
└────────────────────────────────────────────┘
Fiche projet : l'extrait s'agrandit → hero (GSAP Flip).
  film en grand → LE BRIEF : les 9 photos brutes,
  petites, ternes → LES TRAVERSÉES identifiées
  (mono, chronométrées) → punch : avant/après.
```

3 projets exemplaires, pas 12 moyens. Le nombre de photos fournies est affiché partout — c'est l'argument (« 9 photos suffisent »). Fragments B présents en marge de l'index.

---

## 5. ARCHITECTURE TRANSVERSE

- **Overlay statut** (haut, fixe, mono 11px) : `VESTA · 00:12/00:47 · TRAVERSÉE 02` (home) · `VESTA · CALAGE BLANCS · 3/7` (retouche) · `VESTA · SALON · 4 ÉLÉMENTS POSÉS` (staging) · `VESTA · 3 FILMS LIVRÉS` (projets). Piloté par les mêmes ScrollTriggers que les séquences.
- **Nav** : un seul bouton (`MENU` mono + point braise) → overlay plein écran `--basalte-2`, 4 entrées en display colossal + CTA. Ouverture par volets verticaux (`--ease-pierre`).
- **Transitions inter-pages** : masque GSAP (rideau basalte au bord embrasé) sur navigation client-side — comme un cut monté. View Transitions API écartée v1 (contrôle insuffisant du timing avec pin/scrub).
- **Curseur** : point braise + halo, `mix-blend-mode: screen`, grossit sur interactif, disparaît au tactile. Curseur natif jamais supprimé pour les utilisateurs clavier.
- **Son** : **écarté en v1.** Au niveau Richard Mille ou rien ; le budget qualité va aux séquences scroll. L'emplacement `(SON : OFF)` est prévu dans l'overlay pour une v2.
- **CTA unique** : `PRENDRE RENDEZ-VOUS` → `cal.com/vesta-studio` (placeholder, à remplacer). Fin de chaque page + nav. Aucun autre bouton sur le site.
- **Copy** : française, sèche, chiffrée. On dit « Générée par IA. Montée à la main. » — l'IA est l'outil, l'humain est la signature.

## 6. STACK & BUDGETS

Next.js App Router + TypeScript · Tailwind v4 (`@theme` = les tokens ci-dessus, aucune valeur en dur) · GSAP 3.13+ (ScrollTrigger, Flip, SplitText — tous gratuits depuis 2025) · Lenis · ogl uniquement si la passe de grain tient le budget · Vercel en fin de parcours.

Budgets tenus par design : LCP < 2 s (hero = typo + première frame AVIF, fragments lazy) · 60 fps (transform/opacity/clip-path only, canvas pour les séquences) · Lighthouse ≥ 90 perf / ≥ 95 a11y · responsive 375 px (séquences repensées, pas rétrécies) · reduced-motion = états finaux statiques · schema.org LocalBusiness Toulouse + OG images par page.

## 7. PLAN MÉDIAS (assets IA, remplaçables par les vrais livrables Vesta)

Un seul **bien témoin** cohérent (T3 toulousain, brique + lumière du soir) décliné partout :
1. **9 photos sources** du bien (générées, cohérence par image-edit successifs sur la même base).
2. **Film + traversées** : clips image-to-video à double ancre (première/dernière frame) — le procédé réel de Vesta — puis extraction de frames (ffmpeg, à installer).
3. **Avant/après retouche** : 5 paires (l'« avant » = dégradation contrôlée de l'« après » : sous-ex, ciel gris, verticales).
4. **Séquence staging** : keyframes par ajout progressif de meubles sur la même pièce vide, interpolation vidéo entre keyframes, ~120 frames extraites + version mobile 60.
5. **Fragments statue** ×3, double exposition (froide/embrasée), détourés (`remove_background`).
6. 2 biens secondaires légers pour `/projets`.
Mention légale sous tout visuel staging : « Visuels virtuellement aménagés, non contractuels. »

## 8. ORDRE DE MARCHE (Stops = votre validation)

1. ✅ Recherche → `REFERENCES.md`
2. **→ CE DOCUMENT. STOP — VALIDATION.**
3. Setup projet + `CLAUDE.md` + skill `vesta-brand` + génération du socle médias (bien témoin, statue).
4. Intro + hero home. **STOP — screenshots 3 breakpoints.**
5. Prototype staging (option a, une pièce). **STOP — validation avant industrialisation.**
6. Home complète → Retouche → Home staging → Projets (boucle visuelle à chaque section).
7. Transitions inter-pages, overlay, curseur.
8. Passe perf + a11y + mobile (profils mesurés).
9. **Passe de retrait** : sur chaque page, l'effet le plus faible est supprimé. `NOTES.md` tenu tout du long.

## 9. AUTO-CRITIQUE DU PLAN (avant votre lecture)

- *Risque « site généré »* : aucun des interdits du brief n'est présent (pas de crème+terracotta, pas de cartes radius+ombre, pas de fade-in-up, pas de 01/02/03 décoratifs — nos index numérotés ne marquent que de vraies séquences chronologiques : traversées, étapes de calage).
- *Où est le risque assumé ?* Le fond de page qui se retouche lui-même sur `/retouche`. Si une seule idée doit rester, c'est elle.
- *Ce que j'ai déjà retiré* : le son (pas au niveau en v1), le WebGL systématique (une passe de grain optionnelle seulement), la 3D temps réel du staging (les frames pré-rendues sont plus cinéma).
- *Point de vigilance honnête* : la cohérence photo du bien témoin entre 9 photos, un film et une séquence staging est le vrai défi de production — d'où le Stop prototype avant industrialisation.
