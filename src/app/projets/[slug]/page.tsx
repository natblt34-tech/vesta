import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjet, PROJETS } from "@/lib/projets";
import FicheProjet from "@/components/projets/FicheProjet";

export function generateStaticParams() {
  return PROJETS.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const projet = getProjet(slug);
  if (!projet) return {};
  return {
    title: `${projet.titre} — projet`,
    description: `${projet.titre} (${projet.type}, ${projet.surface} m², ${projet.quartier}) : ${projet.photos} photos fournies, ${projet.traversees.length} traversée(s), un film de ${projet.duree} s.`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projet = getProjet(slug);
  if (!projet) notFound();
  return <FicheProjet projet={projet} />;
}
