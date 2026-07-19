import { Anybody, Martian_Mono } from "next/font/google";
import localFont from "next/font/local";

/* Display — Anybody variable (wght + wdth). L'axe wdth est animé au scroll. */
export const anybody = Anybody({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-anybody",
  display: "block",
});

/* Utility — Martian Mono, la voix technique du studio. */
export const martian = Martian_Mono({
  subsets: ["latin"],
  axes: ["wdth"],
  variable: "--font-martian",
  display: "swap",
});

/* Texte — Switzer variable, self-hostée (Fontshare, licence ITF gratuite). */
export const switzer = localFont({
  src: "../fonts/Switzer-Variable.woff2",
  weight: "100 900",
  variable: "--font-switzer",
  display: "swap",
});
