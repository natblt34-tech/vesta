import type { Metadata } from "next";
import CreerAcces from "@/components/client/CreerAcces";

export const metadata: Metadata = {
  title: "Créer mes accès",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <CreerAcces />;
}
