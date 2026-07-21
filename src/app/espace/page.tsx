import type { Metadata } from "next";
import Espace from "@/components/client/Espace";

export const metadata: Metadata = {
  title: "Mon espace",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Espace />;
}
