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
    title: `${projet.titre} · projet`,
    description: `${projet.titre} : ${projet.photos} photos fournies, un film cinématique de ${projet.duree} s livré en 16:9 et 9:16 par Vesta, studio vidéo immobilier à Toulouse.`,
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projet = getProjet(slug);
  if (!projet) notFound();
  return <FicheProjet projet={projet} />;
}
