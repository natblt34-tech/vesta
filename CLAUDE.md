# CLAUDE.md — Projet Vesta

Site-expérience scroll-driven pour Vesta, studio vidéo immobilier (Toulouse).
**Lire `DESIGN_PLAN.md` (la DA validée) et `.claude/skills/vesta-brand/SKILL.md` avant toute décision visuelle. Tenir `NOTES.md` à jour.**

## Stack
- Next.js 16 App Router + TypeScript strict, dossier `src/`
- Tailwind v4 — tokens dans `src/app/globals.css` via `@theme`. **Aucune couleur/durée/easing en dur dans les composants.**
- GSAP 3.15 (ScrollTrigger, SplitText — gratuits) via `src/lib/gsap.ts` uniquement
- Lenis pour le smooth scroll (`src/components/chrome/LenisProvider.tsx`)
- Fonts : Anybody + Martian Mono (next/font/google), Switzer variable self-hostée (`src/fonts/`)

## Commandes
```
npm run dev        # dev server (PATH : C:\Program Files\nodejs)
npm run build      # build prod — doit passer avant tout commit
npm run typecheck  # tsc --noEmit
```

## Conventions
- Composants scroll-driven : `"use client"`, animations dans `useGSAP`-style effect avec cleanup (`gsap.context`), triggers scrub liés à la section.
- Seules `transform`, `opacity`, `clip-path`, CSS vars sont animées. Jamais top/left/width/height.
- Rien n'entre par fade-in-up : révélation par masque/clip ou déplacement avec poids (`--ease-poids`).
- La voix mono (labels techniques) est en français métier : `TRAVERSÉE 01 · SALON → CUISINE · 6S`.
- Un seul CTA sur tout le site : « Prendre rendez-vous » → https://cal.com/vesta-studio (placeholder à remplacer).
- Statut scroll : chaque page pilote l'overlay via `useStatus()` (`src/lib/status.tsx`).

## Budgets (non négociables)
- LCP < 2 s · scroll 60 fps · Lighthouse ≥ 90 perf / ≥ 95 a11y
- `prefers-reduced-motion` : chaque séquence a un état final statique soigné, jamais une page vide
- Mention légale sous tout visuel de home staging : « Visuels virtuellement aménagés, non contractuels. »
- Prix jamais affichés. Le site vend le rendez-vous.

## Médias
- `public/media/` — assets IA (bien témoin T3 toulousain). Voir `NOTES.md` pour l'inventaire et les crédits Higgsfield restants.
- Les « avant » de la retouche sont dérivés des « après » par filtres CSS (alignement parfait, zéro crédit).

## Interdits (tells de site généré — brief client)
Crème #F4F1EA + serif + terracotta #D97757 · noir pur + vert acide · cartes radius-12 + ombre douce en grille de 3 · fade-in-up générique · numérotation 01/02/03 décorative · emojis · glassmorphism · gradients arc-en-ciel.
