/* Les films livrés. Trois projets exemplaires plutôt que douze moyens. */

export type Projet = {
  slug: string;
  titre: string;
  type: string;
  surface: number;
  quartier: string;
  photos: number;
  traversees: { nom: string; duree: number }[];
  duree: number;
  /* Libellé mono court (carte + hero). À défaut : « {photos} PHOTOS ».
     Sert aux cas hors service photos-vers-film (ex. drone d'un terrain). */
  accroche?: string;
  image: string;
  posPlate: string;
  brief: string;
  resultat: string;
  /* Film réel livré (public/media). La fiche passe alors en hero scroll-expansion. */
  video?: string;
  poster?: string;
  /* Version verticale 9:16 réelle, jouée dans le téléphone de la section Formats. */
  video916?: string;
  /* Vidéo de home staging (ex. les meubles qui se posent). */
  stagingVideo?: string;
  /* Photos réelles du brief (public/media). À défaut, tuiles recadrées de l'image.
     `apres` : version retouchée révélée au survol. */
  briefPhotos?: { src: string; alt: string; apres?: string }[];
  /* Services démontrés sur la fiche, dans l'ordre. Chaque projet ne montre
     que ce qu'il a réellement reçu. */
  retouche?: {
    src: string;
    piece: string;
    reglages: string;
    /* Avant/après réels (cadrages éventuellement différents -> fondu croisé). */
    avant?: string;
    apres?: string;
  };
  /* Comparateurs avant/après à curseur (plusieurs pièces). */
  retouches?: { piece: string; avant: string; apres: string; reglages: string }[];
  staging?: {
    vide: string;
    meuble: string;
    piece: string;
  };
  traversee?: {
    depart: string;
    arrivee: string;
    depuis: string;
    vers: string;
    duree: number;
    origine: string;
  };
};

export const PROJETS: Projet[] = [
  {
    slug: "t2-avignon",
    titre: "T2 Avignon",
    type: "T2",
    surface: 45,
    quartier: "AVIGNON",
    photos: 12,
    traversees: [
      { nom: "ENTRÉE → SÉJOUR", duree: 5 },
      { nom: "SÉJOUR → CUISINE", duree: 4 },
      { nom: "SÉJOUR → BALCON", duree: 4 },
    ],
    duree: 24,
    image: "avignon-poster",
    posPlate: "center 50%",
    video: "avignon.mp4",
    poster: "avignon-poster.jpg",
    video916: "avignon-9-16.mp4",
    stagingVideo: "avignon-staging.mp4",
    briefPhotos: [
      { src: "avignon-brief-sejour.webp", alt: "Séjour au parquet rouge, cuisine ouverte au fond", apres: "avignon-sejour-apres.webp" },
      { src: "avignon-brief-cuisine.webp", alt: "Cuisine noire et blanche, verrière", apres: "avignon-cuisine-apres.webp" },
      { src: "avignon-brief-chambre.webp", alt: "Chambre avant home staging", apres: "avignon-brief-chambre-apres.webp" },
      { src: "avignon-brief-balcon.webp", alt: "Balcon avec vue dégagée sur les arbres", apres: "avignon-balcon-apres.webp" },
      { src: "avignon-brief-entree.webp", alt: "Entrée du T2", apres: "avignon-brief-entree-apres.webp" },
      { src: "avignon-brief-couloir.webp", alt: "Couloir vers les pièces de nuit", apres: "avignon-brief-couloir-apres.webp" },
    ],
    brief:
      "Douze photos d'un T2 vide à Avignon : parquet rouge daté, murs ternes, une lumière plate. Un bien correct que les photos brutes ne mettaient pas en valeur.",
    resultat:
      "Le film complet du bien, la retouche photo sur chaque pièce, le home staging de la chambre, livrés en 16:9 pour les portails et en 9:16 pour les réseaux.",
  },
  /* Projets fictifs retirés (T3 haussmannien, T3 Saint-Aubin, Appartement
     Carmes) : seuls les projets réellement livrés restent en ligne. */
  {
    slug: "maison-architecte",
    titre: "Maison d'architecte",
    type: "T6",
    surface: 190,
    quartier: "TOULOUSE",
    photos: 7,
    traversees: [
      { nom: "SÉJOUR → CUISINE", duree: 6 },
      { nom: "COULOIR → CHAMBRES", duree: 5 },
      { nom: "SÉJOUR → TERRASSE", duree: 5 },
    ],
    duree: 32,
    image: "archi-salon",
    posPlate: "center 50%",
    video: "maison-architecte.mp4",
    poster: "maison-architecte-poster.jpg",
    briefPhotos: [
      { src: "archi-salon.webp", alt: "Séjour : canapé rouge, baies vitrées, mur noir graphique" },
      { src: "archi-cuisine.webp", alt: "Cuisine ouverte, îlot blanc, éclairage linéaire au plafond" },
      { src: "archi-couloir.webp", alt: "Circulation : portes bois, parquet clair, spots encastrés" },
      { src: "archi-escalier.webp", alt: "Claustra bois et cube suspendu sur le mur noir" },
      { src: "archi-espaceenfants.webp", alt: "Espace enfants : coussins colorés, bibliothèque" },
      { src: "archi-bureau.webp", alt: "Bureau et salle de jeux, volumes blancs" },
    ],
    brief:
      "Sept photos d'une maison d'architecte : le séjour noir et blanc, la cuisine ouverte, les circulations, les espaces des enfants. Des volumes forts, une lumière difficile à tenir en photo fixe.",
    resultat:
      "Un film de 32 secondes qui traverse la maison, du séjour à la terrasse, en gardant la ligne graphique. Livré en 16:9 pour les portails et en 9:16 pour les réseaux.",
  },
  /* Cas à part : pas le service photos-vers-film, mais un terrain à vendre
     filmé au drone, dont le film fait naître le bâti en projection. */
  {
    slug: "terrain-st-remy",
    titre: "Terrain à Saint-Rémy",
    type: "TERRAIN",
    surface: 0,
    quartier: "SAINT-RÉMY-DE-PROVENCE",
    photos: 0,
    traversees: [],
    duree: 10,
    accroche: "TERRAIN À BÂTIR",
    image: "st-remy-terrain",
    posPlate: "center 50%",
    video: "st-remy-terrain.mp4",
    poster: "st-remy-terrain-poster.jpg",
    brief:
      "Un terrain à bâtir à vendre à Saint-Rémy-de-Provence : une parcelle nue, dégagée, en bord de route. Difficile de faire rêver un acheteur devant un rectangle de terre.",
    resultat:
      "Le film part de la parcelle filmée au drone, puis fait naître en projection la maison qui pourrait s'y construire. On ne vend plus un terrain, on vend un projet. Livré en 16:9 pour les portails et en 9:16 pour les réseaux.",
  },
];

export function getProjet(slug: string) {
  return PROJETS.find((p) => p.slug === slug);
}
