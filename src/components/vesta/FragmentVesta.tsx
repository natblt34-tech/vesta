"use client";

import { useRef, useState, type CSSProperties } from "react";
import LigneClaire from "./LigneClaire";

/* Le dispositif des flancs (réf. dock.cool) : un fragment de Vesta de chaque
   côté du contenu. Au repos, pierre froide — le trait bronze se dessine au
   scroll. Sous le curseur, la braise : le trait s'embrase dans un halo qui
   suit la main et s'éteint dès qu'elle part.
   Le composant accepte des visuels photoréalistes (statue) en remplacement
   de la ligne claire quand ils seront disponibles : mêmes couches, même masque. */

type Props = {
  variant: "vesta" | "flamme" | "maison" | "cadre";
  miroir?: boolean;
  className?: string;
};

export default function FragmentVesta({ variant, miroir = false, className = "" }: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [chaud, setChaud] = useState(false);

  const suivre = (e: React.PointerEvent) => {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const x = e.clientX - r.left;
    /* Le conteneur miroité inverse le rendu : on compense pour que
       le halo suive réellement le curseur des deux côtés. */
    el.style.setProperty("--mx", `${miroir ? r.width - x : x}px`);
    el.style.setProperty("--my", `${e.clientY - r.top}px`);
    setChaud(true);
  };

  const masque: CSSProperties = {
    opacity: chaud ? 1 : 0,
    transition: "opacity 0.25s var(--ease-braise)",
    filter: "drop-shadow(0 0 6px color-mix(in srgb, var(--color-braise-vive) 55%, transparent))",
    WebkitMaskImage:
      "radial-gradient(circle 9rem at var(--mx, 50%) var(--my, 50%), black 30%, transparent 72%)",
    maskImage:
      "radial-gradient(circle 9rem at var(--mx, 50%) var(--my, 50%), black 30%, transparent 72%)",
  };

  return (
    <div
      ref={ref}
      onPointerMove={suivre}
      onPointerLeave={() => setChaud(false)}
      className={`pointer-events-auto relative ${miroir ? "scale-x-[-1]" : ""} ${className}`}
      aria-hidden="true"
    >
      {/* Pierre froide : le trait se dessine au scroll. */}
      <LigneClaire variant={variant} ton="bronze" />

      {/* La braise, révélée par le halo du curseur. Pas d'aura de fond :
         elle se ferait couper aux bords du fragment. Seul le trait
         s'embrase, avec sa lueur portée. */}
      <div className="absolute inset-0" style={masque}>
        <LigneClaire
          variant={variant}
          ton="braise"
          dessine={false}
          className="absolute inset-0 h-full w-full"
        />
      </div>
    </div>
  );
}
