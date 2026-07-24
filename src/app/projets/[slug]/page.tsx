import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getProjet, PROJETS } from "@/lib/projets";
import { absolu, SITE_URL } from "@/lib/site";
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
  const description = `${projet.titre} : ${projet.photos} photos fournies, un film cinématique de ${projet.duree} s livré en 16:9 et 9:16 par Vesta, studio vidéo immobilier à Toulouse.`;
  const image = absolu(`media/${projet.poster ?? `${projet.image}.webp`}`);
  const url = `${SITE_URL}/projets/${projet.slug}/`;
  return {
    title: `${projet.titre} · projet`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: `${projet.titre} · Vesta`,
      description,
      images: [{ url: image, alt: `Le film ${projet.titre} par Vesta` }],
    },
    twitter: { card: "summary_large_image", images: [image] },
  };
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const projet = getProjet(slug);
  if (!projet) notFound();
  return <FicheProjet projet={projet} />;
}
