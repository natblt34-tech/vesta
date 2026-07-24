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
    "film immobilier",
    "studio vidéo immobilier Toulouse",
    "visite virtuelle immobilier",
    "home staging virtuel",
    "vidéo pour agence immobilière",
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
  areaServed: { "@type": "City", name: "Toulouse" },
  serviceType: "Production de vidéos immobilières",
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
