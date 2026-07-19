"use client";

import { useEffect } from "react";
import { ScrollTrigger } from "@/lib/gsap";
import { setProgression } from "./homeStatus";

/* La barre de scroll est la timeline : la progression de page devient un timecode. */
export default function HomeTimecode() {
  useEffect(() => {
    const st = ScrollTrigger.create({
      start: 0,
      end: () => document.documentElement.scrollHeight - window.innerHeight,
      onUpdate: (self) => setProgression(self.progress),
    });
    setProgression(0);
    return () => st.kill();
  }, []);

  return null;
}
