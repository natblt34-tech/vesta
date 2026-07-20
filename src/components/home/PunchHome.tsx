"use client";

import Punch from "@/components/Punch";
import { setPlan } from "./homeStatus";

export default function PunchHome() {
  return (
    <Punch
      lignes={["CETTE VIDÉO,", "VOUS VENEZ DE", "LA SCROLLER."]}
      plan="DERNIÈRE IMAGE"
      onEnter={() => setPlan("DERNIÈRE IMAGE")}
      sous={
        <p>
          Générée à partir de 4 photos. Montée à la main. Livrée en 72 h.
        </p>
      }
    />
  );
}
