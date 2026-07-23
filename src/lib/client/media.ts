"use client";

/* Import photo : redimensionne côté navigateur (max 1200 px, JPEG 0.78) —
   assez pour juger les pièces à l'écran, léger pour le stockage de démo
   (IndexedDB). En prod, l'adaptateur enverra le fichier d'origine au
   storage et renverra une URL signée. */
export function importerPhoto(file: File): Promise<{ url: string; nomFichier: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide."));
      img.onload = () => {
        const max = 1200;
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible."));
        ctx.drawImage(img, 0, 0, w, h);
        resolve({ url: canvas.toDataURL("image/jpeg", 0.78), nomFichier: file.name });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* Plan (image ou PDF) : data URL en mock, storage signé en prod. */
export function importerFichier(file: File): Promise<{ url: string; nomFichier: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.onload = () => resolve({ url: reader.result as string, nomFichier: file.name });
    reader.readAsDataURL(file);
  });
}

/* Vidéo livrée (dépôt admin) : trop lourde pour le stockage local. En démo,
   URL de session (perdue au rechargement) + nom du fichier.
   En prod : le pipeline uploade vers le storage -> URL persistante. */
export function importerVideoSession(file: File): { url: string; nom: string } {
  return { url: URL.createObjectURL(file), nom: file.name };
}
