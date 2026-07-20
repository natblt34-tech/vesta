import type { Metadata } from "next";
import "./globals.css";
import { anybody, martian, switzer } from "@/lib/fonts";
import { SITE_URL } from "@/lib/site";
import SiteChrome from "@/components/chrome/SiteChrome";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Vesta · Studio vidéo immobilier · Toulouse",
    template: "%s · Vesta",
  },
  description:
    "Studio vidéo immobilier à Toulouse. Vos photos deviennent un film cinématique : génération IA, montage humain, livré en 72 h. Le premier film est offert.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "Vesta",
  },
};

const JSON_LD = {
  "@context": "https://schema.org",
  "@type": "LocalBusiness",
  name: "Vesta",
  description:
    "Studio vidéo immobilier : films cinématiques à partir de photos, retouche photo, home staging virtuel.",
  url: SITE_URL,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Toulouse",
    addressCountry: "FR",
  },
  areaServed: "Toulouse",
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
