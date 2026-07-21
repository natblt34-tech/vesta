"use client";

import type { PhotoRef } from "./types";

/* Import photo : redimensionne côté navigateur (max 1400 px, JPEG 0.82)
   pour tenir dans le stockage local en démo. En prod, l'adaptateur
   enverra le fichier d'origine au storage et renverra une URL signée. */
export function importerPhoto(file: File): Promise<PhotoRef> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Lecture impossible."));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error("Image invalide."));
      img.onload = () => {
        const max = 1400;
        const ratio = Math.min(1, max / Math.max(img.width, img.height));
        const w = Math.round(img.width * ratio);
        const h = Math.round(img.height * ratio);
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext("2d");
        if (!ctx) return reject(new Error("Canvas indisponible."));
        ctx.drawImage(img, 0, 0, w, h);
        resolve({
          id: Math.random().toString(36).slice(2, 10),
          url: canvas.toDataURL("image/jpeg", 0.82),
          nom: file.name,
        });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

/* Vidéo studio : trop lourde pour le stockage local. En démo, on garde
   une URL de session (perdue au rechargement) + le nom du fichier.
   En prod : upload storage -> URL persistante. */
export function importerVideoSession(file: File): { url: string; nom: string } {
  return { url: URL.createObjectURL(file), nom: file.name };
}
