# NOTES.md — journal de bord Vesta

## 2026-07-19 — session de production initiale

### Environnement
- Machine Windows ARM64 vierge : installé Node 24.18 LTS + GitHub CLI 2.96 via winget. Python absent (base ui-ux-pro-max non interrogeable — recommandations issues du plan + skill frontend-design).
- gh non authentifié — auth à faire au moment du push.
- Screenshot du navigateur intégré en panne (timeouts) pendant la phase recherche ; inspection DOM/JS utilisée à la place. À retester sur localhost.

### Décisions et pivots
- **dock.cool a changé** : c'est devenu une landing d'app macOS. Le dispositif « objets latéraux symétriques » est repris du brief, pas ré-observé.
- **Crédits Higgsfield quasi épuisés (1,0)** : soul_2 = 0,12/image, nano_banana_pro (édition avec référence) = 2 crédits → **pas d'édition d'images possible**.
  - Conséquence 1 : les « avant » de la retouche sont dérivés des « après » par filtres CSS (bonus : alignement pixel-perfect du wipe).
  - Conséquence 2 : le home staging passe de « calques alignés sur une même pièce » à des **plans montés** (cuts entre cadrages empty/meublé + compteur) — défendable : c'est du montage, cœur du positionnement Vesta.
  - Conséquence 3 : statue générée sur fond noir pur + blend CSS (lighten) au lieu de remove_background.
- Budget médias : ~7 images soul_2 max. Priorité : salon après ✅, cuisine (traversée), salon vide, salon meublé chaud, statue, chambre. Le reste en ligne claire SVG (direction A du plan — cohérent).
- Son : écarté v1 (plan §5). Emplacement `(SON : OFF)` réservé dans l'overlay.

### Essayé / rejeté
- create-next-app : refusé (dossier non vide, prompts interactifs) → scaffold manuel, versions épinglées par npm.
- nano_banana_pro pour décliner le bien témoin : rejeté (coût 2 crédits > solde).
- View Transitions API : écartée v1 au profit d'un masque GSAP contrôlable (cf. DESIGN_PLAN §5).

### Inventaire médias (public/media/)
4 visuels générés (soul_2, 2048×1152) avant que la **limite quotidienne de génération** ne tombe :
- salon-apres (.png source + .webp servi, 163 Ko) — hero home, retouche (l'« avant » = même image + filtres CSS), planche 9 photos.
- cuisine-porte (183 Ko) — la traversée (plan de porte en perspective centrale, parfait), série retouche.
- salon-vide (110 Ko) — base du staging, section fenêtre (ciel gris).
- salon-meuble (142 Ko) — climax staging « foyer allumé », plein écran home, fiche Carmes.
La statue (direction B) n'a pas pu être générée → **la ligne claire (direction A) est devenue l'unique élément signature**, partout. Cohérent avec le plan (A était déjà le fil conducteur et le fallback). À regénérer si crédits rechargés : fragments statue fond noir pur ×3.

### Vérification navigateur (session)
- Le pane intégré tourne en `document.hidden=true`, 0 frame rAF → screenshots et animations non observables ici (défaut d'environnement, pas du site : rAF gelé en onglet caché est le comportement normal, GSAP reprend à la visibilité).
- Vérifié par DOM sur les 5 routes : rendu SSR complet, fonts chargées (Anybody/Switzer/Martian), 4 images OK, Lenis actif, histogramme SVG présent, 6 meubles ligne claire, mention légale staging présente, traversées de fiche OK. Build prod : 9 pages statiques.

### Passe de retrait (§9 du brief)
- Manifeste : suppression de la micro-rotation des glyphes (décorative, ne disait rien). La dérive verticale suffit.
- Son : déjà écarté. WebGL grain : déjà écarté au profit du grain SVG fixe.

### Retours client (2e passe)
- Copy du site nettoyée : aucun nom d'outil de génération n'apparaît (« générée par IA » suffit — le montage humain est l'argument).
- Overlay statut recentré : la zone droite appartient au bouton MENU (il y avait chevauchement).
- **Dispositif dock.cool implémenté** (`FragmentVesta`) : fragments symétriques de part et d'autre du hero (home) et de l'en-tête projets ; au repos le trait bronze se dessine au scroll ; **au survol, un halo suivant le curseur révèle la version embrasée** (trait braise + lueur), qui s'éteint au départ — équivalent Vesta du rocher fleuri de la réf. Le composant est prévu pour recevoir les visuels statue photoréalistes (mêmes couches, même masque) quand le quota de génération sera libéré.
- Statut /projets rendu dynamique au scroll (INDEX n%).

### Restructuration (site à page unique + fiches)
- La landing devient l'environnement 3D (galerie des projets). Pages `/`, `/retouche`, `/home-staging`, `/projets` (index) supprimées ; composants home démontables retirés (Hero, Manifeste, Traversee, PleinEcran, NeufPhotos, Punch, RetoucheExperience, homeStatus…).
- Chaque fiche `/projets/[slug]` EST la démonstration par l'exemple : hero film scroll-expansion, puis services réellement rendus sur CE bien, déclarés dans `projets.ts` (`retouche`, `staging`, `traversee`) → sections numérotées 01/02/03 (vraies séquences, numérotation légitime), puis brief/résultat, offres, RDV.
- Démos scopées réutilisables : `DemoRetouche` (wipe avant/après sur une vraie photo, avant = CSS), `DemoTraversee` (portail), `StagingScene` paramétré (vide/meuble/pièce). Côte Pavée montre les 3 ; Saint-Aubin seulement l'animation ; Carmes retouche + film.
- Offres découplées de la home → `components/chrome/Offres.tsx`. Nav refaite : accueil + liste des projets.
- Après suppression de pages : `Remove-Item .next` obligatoire (types générés périmés référençaient les routes disparues).

### Portail client (2026-07-21) — conçu, non encore branché
Tout le portail est construit et fonctionne en démo locale (persistance navigateur), architecturé pour brancher un vrai backend sans réécrire les pages.

Point de branchement unique : `src/lib/client/backend.ts`. Toutes les pages parlent à l'interface `VestaBackend` ; aujourd'hui `mockBackend` (localStorage). Le jour de la mise en ligne :
1. Écrire `supabaseBackend` (ou Firebase) qui implémente `VestaBackend` : `connexion`/`creerAcces` → Supabase Auth (liens d'invitation) ; `mesMandats`/`creerMandat`/`tousLesMandats`/`deposerProduction` → table + storage ; `demanderAide` → notification.
2. Changer la dernière ligne `export const backend = mockBackend` → `supabaseBackend`.
3. Emails : `src/lib/client/notify.ts` — remplacer le journal localStorage par `fetch('/api/notify')` → route serveur qui appelle Resend. Deux déclencheurs déjà câblés : `nouveau-mandat` (→ studio) et `production-livree` (→ client).
4. Photos/vidéos : `src/lib/client/media.ts` — `importerPhoto` (redim navigateur, data URL en démo) et `importerVideoSession` (objectURL de session) → remplacer par upload storage renvoyant une URL persistante.

Routes : `/connexion`, `/creer-acces?invite=TOKEN`, `/espace` (client), `/vesta-studio` (admin). Comptes démo : agence@demo/demo (client), studio@vesta/vesta (studio). Garde d'auth côté client (redirection). Export statique OK (tout client-side).

Hébergement : le site restera un temps sur GitHub Pages (statique) ; le portail dynamique nécessitera un vrai hébergeur (Vercel + Supabase/Resend) le moment venu — décision reportée par le client.

### TypeScript
- npm avait installé TypeScript 7 (préversion native) → build Next 16 cassé (« The "id" argument must be of type string ») → épinglé typescript@5.9.

### Espace client v2 (2026-07-23) — aligné sur le contrat pipeline
Refonte selon `brief-espace-client.md` : l'espace client est l'interface entre les
agences et le pipeline de production (`vesta-pipeline`). Le contrat REST complet est
documenté dans **PIPELINE.md** (endpoints, token, schéma job, curl).

- `types.ts` réécrit sur le schéma exact du job pipeline (`status` en 6 valeurs,
  `deliverables` kind `film_16x9`/`film_9x16`/`staging_avant_apres`, `photos[].room`).
  L'ancien modèle « mandats + connexions entre photos » est supprimé (remplacé par la
  description d'agencement du brief). Clés localStorage renouvelées (`vesta-jobs`,
  `vesta-users-v2`) — l'ancienne démo est orpheline, sans migration (mock).
- Formulaire « Nouvelle demande » : nom du bien + ville ; photos (max 20, jpg/png)
  nommées par pièce (suggestions cliquables, suffixe numérique auto, normalisation
  sans accents — `pieces.ts`) ; agencement (message d'incitation du brief + plan
  image/PDF optionnel) ; options formats 16:9/9:16 (les deux par défaut), staging par
  pièce + style (3 choix), pièces à exclure ; récapitulatif.
- Suivi : 6 statuts affichés ; `attention_requise` → message du studio + réponse
  client (texte + photos) qui repasse le job en `analyse` ; `livre` → lecteurs 16:9
  et 9:16 + Télécharger + galerie staging avant/après (mention légale).
- Admin `/vesta-studio` : onglets Demandes (dossier complet, changement de statut,
  dépôt des livrables, renvoi de l'email de livraison) et Comptes clients (création
  avec formule nom + quota films/mois — jamais de montant — → lien d'invitation).
- Quota affiché côté client : « FORMULE X · N FILMS RESTANTS CE MOIS-CI »
  (jobs du mois calendaire vs quota). Non bloquant en v1.
- Emails simulés (notify.ts) : nouvelle-demande → studio ; livraison et
  complement-demande → client ; complement-reponse et aide → studio.

### Workspaces agence (2026-07-23, même journée)
- L'agence devient le workspace : demandes, formule et quota lui appartiennent
  (`job.client.id` = id d'agence). Vesta invite un fondateur (email + formule) ;
  il NOMME SON AGENCE à la création de ses accès (création du workspace), puis
  invite ses collègues depuis l'onglet Agence (lien à usage unique, rattachement
  automatique). `/creer-acces` a deux modes selon le jeton (fondateur/membre).
- Interface refondue en coquille SaaS : sidebar desktop + barre d'onglets basse
  mobile, vue d'ensemble à tuiles, chronologie de production, demandes avec
  recherche/filtres et détail 2 colonnes, assistant de demande en 5 étapes.
- Projets fictifs retirés du site vitrine (T3 haussmannien, T3 Saint-Aubin,
  Appartement Carmes) : seuls T2 Avignon et Maison d'architecte restent.
  Assets et champs de type (traversee, retouche CSS) conservés, dormants.
- StatusOverlay masqué sur les routes du portail (double logo sinon).
- Formules : catalogue unique `FORMULES` dans types.ts, aligné sur la plaquette
  (PPT Présentation.pdf) : Étincelle 3 films sans staging, Flamme 5 films +
  staging 10 photos/mois, Brasier 10 films + staging illimité + montage inclus.
  Montants JAMAIS affichés dans l'espace client. L'admin choisit au menu
  déroulant, les restrictions s'appliquent seules : quota films BLOQUANT
  (barrière assistant + refus creerJob), staging masqué (Étincelle) ou plafonné
  au compteur mensuel (Flamme : cases limitées au reste du mois, refus backend).
  Anciennes formules stockées normalisées vers le catalogue (essentiel→
  etincelle, studio→flamme, signature→brasier).
- Stockage des jobs du mock migré vers IndexedDB (base « vesta-demo », store
  kv) : une vraie demande de 12 photos en data URL (~7 Mo) explosait le quota
  localStorage (« Failed to execute setItem... exceeded the quota », vu par le
  client). Migration automatique des anciens jobs localStorage au premier
  chargement. Photos importées compressées à 1200 px / JPEG 0.78.
- Cartes 3D de la home : seuil extérieur minimal RAYON_MIN_CARTES = 14.5
  (au-delà de la sphère bronze rayon 12) pour ne pas empiéter sur le logo.
