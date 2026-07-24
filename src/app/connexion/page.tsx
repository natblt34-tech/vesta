import type { Metadata } from "next";
import Connexion from "@/components/client/Connexion";

export const metadata: Metadata = {
  title: "Espace client",
  description: "Connexion à l'espace client Lares.",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Connexion />;
}
