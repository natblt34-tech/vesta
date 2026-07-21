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
  image: string;
  posPlate: string;
  brief: string;
  resultat: string;
  /* Film réel livré (public/media). La fiche passe alors en hero scroll-expansion. */
  video?: string;
  poster?: string;
  /* Photos réelles du brief (public/media). À défaut, tuiles recadrées de l'image. */
  briefPhotos?: { src: string; alt: string }[];
  /* Services démontrés sur la fiche, dans l'ordre. Chaque projet ne montre
     que ce qu'il a réellement reçu. */
  retouche?: {
    src: string;
    piece: string;
    reglages: string;
  };
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
    slug: "maison-cote-pavee",
    titre: "T3 haussmannien",
    type: "T3",
    surface: 112,
    quartier: "CÔTE PAVÉE",
    photos: 4,
    traversees: [
      { nom: "SALON → CUISINE", duree: 6 },
      { nom: "ENTRÉE → SÉJOUR", duree: 5 },
    ],
    duree: 47,
    image: "salon-apres",
    posPlate: "center 40%",
    video: "visite.mp4",
    poster: "visite-poster.jpg",
    briefPhotos: [
      { src: "brief-salon.webp", alt: "Salon : cheminée en marbre, miroir ancien, parquet chevron" },
      { src: "brief-chambre.webp", alt: "Chambre : tête de lit beige, lumière dorée de fin de journée" },
      { src: "brief-cuisine.webp", alt: "Cuisine sauge et laiton, vue sur les toits de Toulouse" },
      { src: "brief-entree.webp", alt: "Entrée : console en noyer, enfilade vers le séjour" },
    ],
    brief:
      "Quatre photos fournies : le salon, la chambre, la cuisine, l'entrée. Un bel haussmannien dont les enfilades et la lumière de fin de journée ne tenaient pas dans des images fixes.",
    resultat:
      "Un film de 47 secondes, deux traversées, la lumière du soir traversant tout l'appartement. L'annonce est passée en tête de sa recherche dès la première semaine.",
    /* Ni retouche photo ni home staging sur ce projet. */
    traversee: {
      depart: "brief-entree.webp",
      arrivee: "brief-salon.webp",
      depuis: "ENTRÉE",
      vers: "SALON",
      duree: 5,
      origine: "42% 50%",
    },
  },
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
  {
    slug: "t3-saint-aubin",
    titre: "T3 Saint-Aubin",
    type: "T3",
    surface: 78,
    quartier: "SAINT-AUBIN",
    photos: 11,
    traversees: [
      { nom: "COULOIR → CUISINE", duree: 6 },
      { nom: "CUISINE → SÉJOUR", duree: 5 },
      { nom: "SÉJOUR → BALCON", duree: 4 },
    ],
    duree: 52,
    image: "cuisine-porte",
    posPlate: "center 55%",
    brief:
      "Onze photos, un appartement traversant dont les enfilades ne se lisaient pas du tout en photo fixe. C'est le cas d'usage exact des traversées.",
    resultat:
      "Trois traversées bout à bout : le film fait ce que la visite fait, il enchaîne les pièces. 52 secondes, livré en 72 h.",
    traversee: {
      depart: "salon-apres.webp",
      arrivee: "cuisine-porte.webp",
      depuis: "SÉJOUR",
      vers: "CUISINE",
      duree: 6,
      origine: "50% 55%",
    },
  },
  {
    slug: "appartement-carmes",
    titre: "Appartement Carmes",
    type: "T2",
    surface: 64,
    quartier: "CARMES",
    photos: 8,
    traversees: [{ nom: "SÉJOUR → CHAMBRE", duree: 5 }],
    duree: 38,
    image: "salon-meuble",
    posPlate: "center 60%",
    brief:
      "Huit photos d'un bien vendu meublé. L'agence voulait l'heure dorée sans attendre le bon créneau météo.",
    resultat:
      "Étalonnage chaud sur tout le film, lampes allumées, 38 secondes. Le bien s'est vendu sur la deuxième visite.",
    retouche: {
      src: "salon-meuble.webp",
      piece: "SÉJOUR",
      reglages: "+0.9 EV · CIEL 18H40 · LAMPES ALLUMÉES · GRAIN 10%",
    },
  },
];

export function getProjet(slug: string) {
  return PROJETS.find((p) => p.slug === slug);
}
