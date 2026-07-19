# Vesta — le feu avant la visite

Site-expérience scroll-driven pour **Vesta**, studio vidéo immobilier à Toulouse.
Le principe : **le scroll est la démonstration**. La home est le film, la page retouche est le curseur avant/après, la page home staging meuble la pièce sous le pouce du visiteur.

## Stack
Next.js 16 (App Router) · TypeScript · Tailwind v4 (tokens dans `src/app/globals.css`) · GSAP + ScrollTrigger · Lenis · fonts Anybody / Switzer / Martian Mono (self-hostées).

## Commandes
```bash
npm install
npm run dev        # http://localhost:3000
npm run build      # build de production (9 pages statiques)
```

## Documents de production
- `DESIGN_PLAN.md` — la direction artistique validée (tokens, storyboards, arbitrages)
- `REFERENCES.md` — l'analyse des 7 sites de référence
- `NOTES.md` — le journal de bord (décisions, pivots, inventaire médias)
- `CLAUDE.md` + `.claude/skills/vesta-brand/` — conventions et charte pour les sessions futures

## Déploiement

**GitHub Pages (actif)** : https://natblt34-tech.github.io/vesta/
Le site est un export statique poussé sur la branche `gh-pages`. Après toute modification :
```bash
npm run deploy
```
(builde avec `NEXT_PUBLIC_BASE_PATH=/vesta` et republie `out/` sur `gh-pages` ; le push de `main` seul ne redéploie pas).
Pour automatiser via GitHub Actions, il faudrait le scope `workflow` : `gh auth refresh -s workflow`, puis recréer le workflow build + deploy-pages.

**Vercel (recommandé à terme)** : importer le repo, ne pas définir `NEXT_PUBLIC_BASE_PATH` — le site se sert à la racine.

## À brancher avant mise en ligne
- Remplacer `CAL_URL` dans `src/lib/site.ts` par la vraie URL de réservation
- Remplacer les médias IA de `public/media/` par les vrais films Vesta (mêmes noms de fichiers)
- Déploiement cible : Vercel

Les visuels de home staging portent la mention : *« Visuels virtuellement aménagés, non contractuels. »*
