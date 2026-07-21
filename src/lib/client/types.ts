/* Types du portail client. Indépendants du backend : la même forme sera
   servie par l'adaptateur Supabase (ou autre) le jour de la mise en ligne. */

export type Role = "client" | "vesta";

export type User = {
  id: string;
  email: string;
  role: Role;
  agence?: string;
};

export type PhotoRef = {
  id: string;
  /* En mock : data URL. En prod : URL de stockage signée. */
  url: string;
  nom: string;
};

export type Connexion = {
  id: string;
  photoA: string; // PhotoRef.id
  photoB: string; // PhotoRef.id
  description: string;
};

export type Production = {
  /* La vidéo livrée par Vesta, déposée depuis l'interface studio. */
  url: string;
  nom: string;
  deposeeLe: number;
};

export type StatutMandat = "recu" | "en-production" | "livre";

export type Mandat = {
  id: string;
  clientId: string;
  clientEmail: string;
  nom: string;
  description: string;
  photos: PhotoRef[];
  connexions: Connexion[];
  production: Production | null;
  statut: StatutMandat;
  creeLe: number;
};

export type NouveauMandat = {
  nom: string;
  description: string;
  photos: PhotoRef[];
  connexions: Connexion[];
};
