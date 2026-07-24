import type { Metadata } from "next";
import "./globals.css";
import { anybody, martian, switzer } from "@/lib/fonts";
import { absolu, OG_IMAGE, SITE_URL } from "@/lib/site";
import SiteChrome from "@/components/chrome/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vesta · Studio vidéo immobilier · Toulouse",
    template: "%s · Vesta",
  },
  description:
    "Studio vidéo immobilier à Toulouse. Vos photos deviennent un film cinématique : génération IA, montage humain, livré en 72 h. Le premier film est offert.",
  keywords: [
    "vidéo immobilière",
    "vidéo immobilière Toulouse",
    "film immobilier",
    "vidéaste immobilier Toulouse",
    "studio vidéo immobilier",
    "vidéo pour agence immobilière",
    "vidéo annonce immobilière",
    "visite vidéo immobilier",
    "visite virtuelle immobilier",
    "home staging virtuel",
    "retouche photo immobilier",
    "création vidéo bien immobilier",
    "montage vidéo immobilier",
    "vidéo immobilier Occitanie",
  ],
  alternates: { canonical: `${SITE_URL}/` },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Vesta",
    url: `${SITE_URL}/`,
    title: "Vesta · Studio vidéo immobilier · Toulouse",
    description:
      "Vos photos deviennent un film cinématique, livré en 72 h. Studio vidéo immobilier à Toulouse.",
    images: [{ url: OG_IMAGE, alt: "Un film immobilier signé Vesta" }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Vesta · Studio vidéo immobilier · Toulouse",
    description: "Vos photos deviennent un film cinématique, livré en 72 h.",
    images: [OG_IMAGE],
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": ["LocalBusiness", "ProfessionalService"],
  name: "Vesta",
  description:
    "Studio vidéo immobilier à Toulouse : films cinématiques d'annonces à partir de photos, retouche photo et home staging virtuel, livrés en 16:9 et 9:16.",
  url: SITE_URL,
  logo: absolu("media/vesta-logo.png"),
  image: OG_IMAGE,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Toulouse",
    addressRegion: "Occitanie",
    addressCountry: "FR",
  },
  areaServed: [
    { "@type": "City", name: "Toulouse" },
    { "@type": "AdministrativeArea", name: "Occitanie" },
  ],
  serviceType: "Production de vidéos immobilières",
  knowsAbout: [
    "vidéo immobilière",
    "film immobilier",
    "vidéo pour agence immobilière",
    "home staging virtuel",
    "retouche photo immobilier",
    "montage vidéo",
  ],
  makesOffer: [
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Film immobilier · vidéo d'annonce",
        description:
          "Un film cinématique du bien à partir des photos, livré en 16:9 pour les portails et 9:16 pour les réseaux.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Home staging virtuel",
        description: "Des pièces vides meublées virtuellement, en visuels avant/après non contractuels.",
      },
    },
    {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: "Retouche photo immobilier",
        description: "Retouche et étalonnage des photos de biens immobiliers.",
      },
    },
  ],
  priceRange: "Sur rendez-vous",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${anybody.variable} ${switzer.variable} ${martian.variable}`}>
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }}
        />
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
