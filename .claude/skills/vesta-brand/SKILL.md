---
name: vesta-brand
description: Charte Vesta — palette braise/basalte, voix typographiques, grammaire de motion, ton éditorial. À charger avant de créer ou modifier tout composant visuel du site Vesta.
---

# Vesta — charte de marque et de motion

Vesta, déesse romaine du foyer. Double lecture qui structure tout : **feu** (braise, lumière du soir, grain, mouvement) et **foyer** (pierre, géométrie, calme, vide habité). Le site vit dans la tension pierre froide / flamme : fond minéral sombre qui **s'allume par endroits**, jamais l'inverse.

## Palette (tokens Tailwind dans globals.css)
| Token | Valeur | Usage |
|---|---|---|
| `basalte` | #12151A | Fond profond. Jamais de noir pur. |
| `basalte-2` | #1B1F26 | Surfaces, nav, panneaux. |
| `pierre` | #E9E4DA | Typo sur sombre. Jamais #FFF. |
| `pierre-claire` | #E5E0D6 | Fond clair (retouche fin de page). |
| `encre` | #16191E | Typo sur clair. |
| `gris-pierre` | #8F8B82 | Secondaire, métadonnées. |
| `filet` | #3A3E45 | Hairlines 1px. |
| `braise` | #C2551E | UNIQUE accent chaud. Rare = précieux. |
| `braise-vive` | #E8863C | Cœur des lueurs, jamais en aplat. |
| `bronze` | #96794C | Index, compteurs, focus, filets actifs. |

Règle braise : seulement curseur, progression scroll, CTA, flamme du staging, 2–3 mots par page. Jamais un fond de section.

## Trois voix typographiques
1. **Display — Anybody** (classe `voix-display`) : uppercase, wght 800, wdth 125 %, tracking -2 %, interlignage 0.92. Tailles `--text-colossal` / `--text-display`. L'axe wdth s'anime au scroll (geste anamorphique).
2. **Texte — Switzer** : 17px, interlignage 1.6. Jamais en gras au-delà de 600.
3. **Mono — Martian Mono** (classe `voix-mono`) : 11–13px, uppercase, tracking +6 %, chiffres tabulaires. C'est la voix du studio : `TRAVERSÉE 01 · SALON → CUISINE · 6S`. Séparateur : ` · ` (point médian).

## Grammaire de motion
- `--ease-pierre` cubic-bezier(0.65,0,0.15,1) : masques, wipes, transitions de page.
- `--ease-braise` cubic-bezier(0.22,1,0.36,1) : sorties légères.
- `--ease-poids` cubic-bezier(0.34,1.28,0.44,1) : settle avec poids (meubles, arrivées).
- Micro 180–260 ms · révélations 600–900 ms · séquences scroll en scrub sans durée.
- **Interdit : fade-in-up.** Tout entre par révélation (clip-path, masque, trait qui se dessine) ou déplacement avec poids.
- Un seul héros animé par viewport. Reduced-motion : état final statique soigné.
- Animables : transform, opacity, clip-path, CSS vars. Rien d'autre.

## Ton éditorial (français)
Studio, précis, un peu sec. Phrases courtes. Chiffres concrets (« 9 photos. 72 h. 47 s »). L'IA est un outil, le montage humain est la valeur : « Générée par IA. Montée à la main. » Jamais : « solution innovante », adjectifs empilés, emojis, point d'exclamation.

## Dispositifs signature
- Fragments de statue symétriques (home, projets) avec lueur de braise qui rampe au scroll.
- Ligne claire SVG (un trait continu, stroke-dashoffset au scroll) : silhouette → plan de maison → flamme → cadre caméra.
- Braise persistante : curseur, loader, barre de progression.
- Overlay statut mono en haut : `VESTA · <état courant du scroll dans le vocabulaire métier>`.
- Filets hairline pour structurer. Aucune carte, aucun radius, aucune ombre.
