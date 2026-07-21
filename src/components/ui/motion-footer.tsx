"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { cn } from "@/lib/utils";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { CAL_URL } from "@/lib/site";
import { TransitionLink } from "@/components/chrome/Transition";

/* Footer cinématique adapté à Vesta (base : motion-footer).
   Rideau de révélation, texte géant, boutons magnétiques, retour haut.
   Couleurs et typos de la charte, contenu Vesta. */

const STYLES = `
@keyframes footer-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.footer-marquee { animation: footer-marquee 38s linear infinite; }

.footer-aurora {
  background: radial-gradient(
    circle at 50% 50%,
    color-mix(in srgb, var(--color-braise) 16%, transparent) 0%,
    color-mix(in srgb, var(--color-braise) 5%, transparent) 40%,
    transparent 70%
  );
}
.footer-grid {
  background-size: 64px 64px;
  background-image:
    linear-gradient(to right, color-mix(in srgb, var(--color-pierre) 4%, transparent) 1px, transparent 1px),
    linear-gradient(to bottom, color-mix(in srgb, var(--color-pierre) 4%, transparent) 1px, transparent 1px);
  -webkit-mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
  mask-image: linear-gradient(to bottom, transparent, black 30%, black 70%, transparent);
}
.footer-giant {
  font-size: 27vw;
  line-height: 0.72;
  letter-spacing: -0.05em;
  color: transparent;
  -webkit-text-stroke: 1px color-mix(in srgb, var(--color-pierre) 8%, transparent);
  background: linear-gradient(180deg, color-mix(in srgb, var(--color-pierre) 9%, transparent) 0%, transparent 62%);
  -webkit-background-clip: text;
  background-clip: text;
}
.footer-pill {
  border: 1px solid var(--color-filet);
  background: color-mix(in srgb, var(--color-basalte-2) 70%, transparent);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  transition: border-color 0.35s, color 0.35s, background 0.35s;
}
.footer-pill:hover {
  border-color: var(--color-braise-vive);
  color: var(--color-pierre);
}
`;

type MagneticProps = {
  as?: React.ElementType;
  className?: string;
  children?: React.ReactNode;
  [key: string]: unknown;
};

const MagneticButton = React.forwardRef<HTMLElement, MagneticProps>(
  ({ className, children, as: Component = "button", ...props }, forwardedRef) => {
    const localRef = useRef<HTMLElement>(null);

    useEffect(() => {
      const el = localRef.current;
      if (!el || prefersReducedMotion()) return;
      if (!window.matchMedia("(pointer: fine)").matches) return;

      const ctx = gsap.context(() => {
        const move = (e: MouseEvent) => {
          const r = el.getBoundingClientRect();
          const x = e.clientX - r.left - r.width / 2;
          const y = e.clientY - r.top - r.height / 2;
          gsap.to(el, { x: x * 0.35, y: y * 0.35, scale: 1.04, ease: "power2.out", duration: 0.4 });
        };
        const leave = () => {
          gsap.to(el, { x: 0, y: 0, scale: 1, ease: "elastic.out(1, 0.4)", duration: 1.1 });
        };
        el.addEventListener("mousemove", move);
        el.addEventListener("mouseleave", leave);
        return () => {
          el.removeEventListener("mousemove", move);
          el.removeEventListener("mouseleave", leave);
        };
      }, el);

      return () => ctx.revert();
    }, []);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const Comp = Component as any;
    return (
      <Comp
        ref={(node: HTMLElement) => {
          (localRef as React.MutableRefObject<HTMLElement | null>).current = node;
          if (typeof forwardedRef === "function") forwardedRef(node);
          else if (forwardedRef)
            (forwardedRef as React.MutableRefObject<HTMLElement | null>).current = node;
        }}
        className={cn("inline-flex items-center justify-center", className as string)}
        {...(props as Record<string, unknown>)}
      >
        {children}
      </Comp>
    );
  },
);
MagneticButton.displayName = "MagneticButton";

const SERVICES = [
  "RETOUCHE PHOTO",
  "HOME STAGING VIRTUEL",
  "FILM CINÉMATIQUE",
  "TRAVERSÉES",
  "MONTAGE HUMAIN",
  "LIVRÉ EN 72 H",
];

function Bande() {
  return (
    <div className="voix-mono flex items-center gap-10 px-5" style={{ color: "var(--color-gris-pierre)" }}>
      {SERVICES.map((s, i) => (
        <span key={i} className="flex items-center gap-10">
          {s}
          <span style={{ color: "var(--color-braise-vive)" }}>✦</span>
        </span>
      ))}
    </div>
  );
}

export function FooterVesta() {
  const wrap = useRef<HTMLDivElement>(null);
  const geant = useRef<HTMLDivElement>(null);
  const contenu = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = wrap.current;
    if (!el) return;
    if (prefersReducedMotion()) return;

    gsap.set([geant.current, contenu.current], { autoAlpha: 0 });

    let joue = false;
    const jouer = () => {
      if (joue) return;
      joue = true;
      const tl = gsap.timeline();
      tl.fromTo(
        geant.current,
        { y: 60, autoAlpha: 0, scale: 0.9 },
        { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: "power2.out" },
      ).fromTo(
        contenu.current?.children ? Array.from(contenu.current.children) : [],
        { y: 40, autoAlpha: 0 },
        { y: 0, autoAlpha: 1, stagger: 0.12, duration: 0.8, ease: "power3.out" },
        "-=0.7",
      );
      gsap.set(contenu.current, { autoAlpha: 1 });
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          jouer();
        }
      },
      { threshold: 0.15 },
    );
    io.observe(el);

    /* Filet de sécurité : le CTA ne doit jamais rester masqué. */
    const secours = window.setTimeout(() => {
      io.disconnect();
      gsap.set([geant.current, contenu.current], { autoAlpha: 1, y: 0, scale: 1 });
      joue = true;
    }, 4000);

    return () => {
      io.disconnect();
      window.clearTimeout(secours);
    };
  }, []);

  const haut = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: STYLES }} />
      <div
        ref={wrap}
        className="relative h-screen w-full"
        style={{ clipPath: "polygon(0 0, 100% 0, 100% 100%, 0 100%)" }}
      >
        <footer
          className="fixed bottom-0 left-0 flex h-screen w-full flex-col justify-between overflow-hidden"
          style={{ background: "var(--color-basalte)", color: "var(--color-pierre)" }}
        >
          <div className="footer-aurora pointer-events-none absolute left-1/2 top-1/2 z-0 h-[60vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 blur-[80px]" />
          <div className="footer-grid pointer-events-none absolute inset-0 z-0" />

          <div
            ref={geant}
            className="footer-giant voix-display pointer-events-none absolute -bottom-[4vh] left-1/2 z-0 -translate-x-1/2 select-none whitespace-nowrap"
          >
            VESTA
          </div>

          {/* Bande défilante */}
          <div
            className="absolute top-14 left-0 z-10 w-full -rotate-2 scale-110 overflow-hidden py-3"
            style={{
              borderBlock: "1px solid var(--color-filet)",
              background: "color-mix(in srgb, var(--color-basalte) 60%, transparent)",
            }}
          >
            <div className="footer-marquee flex w-max">
              <Bande />
              <Bande />
            </div>
          </div>

          {/* Contenu central */}
          <div
            ref={contenu}
            className="relative z-10 mx-auto mt-20 flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-6 text-center"
          >
            <p className="voix-mono mb-6" style={{ color: "var(--color-bronze)" }}>
              LE PREMIER FILM EST OFFERT
            </p>
            <h2
              className="voix-display mb-12"
              style={{ fontSize: "clamp(2.5rem, 7vw, 6rem)", color: "var(--color-pierre)", lineHeight: 0.95 }}
            >
              Prêt à voir votre bien
              <br />
              en film ?
            </h2>

            <div className="flex flex-col items-center gap-5">
              <MagneticButton
                as="a"
                href={CAL_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="footer-pill voix-mono gap-3 rounded-full px-10 py-5"
                style={{ color: "var(--color-pierre)" }}
              >
                <span className="braise-point" aria-hidden="true" />
                Prendre rendez-vous
              </MagneticButton>

              <TransitionLink
                href="/"
                className="footer-pill voix-mono rounded-full px-6 py-3"
                style={{ color: "var(--color-gris-pierre)" }}
              >
                Voir tous les projets
              </TransitionLink>
            </div>
          </div>

          {/* Barre du bas */}
          <div className="relative z-20 flex w-full flex-col items-center justify-between gap-4 px-6 pb-8 md:flex-row md:px-12">
            <div className="voix-mono order-2 md:order-1" style={{ color: "var(--color-gris-pierre)" }}>
              © 2026 VESTA · STUDIO VIDÉO IMMOBILIER · TOULOUSE
            </div>
            <div
              className="footer-pill voix-mono order-1 flex items-center gap-2 rounded-full px-6 py-3 md:order-2"
              style={{ color: "var(--color-gris-pierre)" }}
            >
              ÉTINCELLE
              <span style={{ color: "var(--color-braise-vive)" }}>·</span>
              FLAMME
              <span style={{ color: "var(--color-braise-vive)" }}>·</span>
              BRASIER
            </div>
            <MagneticButton
              as="button"
              onClick={haut}
              aria-label="Revenir en haut"
              className="footer-pill group order-3 h-12 w-12 rounded-full"
              style={{ color: "var(--color-gris-pierre)" }}
            >
              <svg
                className="h-5 w-5 transition-transform duration-300 group-hover:-translate-y-1"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.6" d="M5 10l7-7m0 0l7 7m-7-7v18" />
              </svg>
            </MagneticButton>
          </div>
        </footer>
      </div>
    </>
  );
}
