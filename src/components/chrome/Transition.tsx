"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  type ComponentProps,
  type ReactNode,
} from "react";
import { gsap, gsapEasePierre } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";

/* Transitions inter-pages.
   - Liens ordinaires (nav, footer) : rideau de basalte au bord embrasé.
   - Depuis une carte projet (galerie 3D) : la carte se détache du champ et
     grandit, recadrée juste, jusqu'à DEVENIR le hero de la fiche. Même image,
     même cadrage final -> le raccord est invisible. Un plan, pas un chargement. */

const TransitionContext = createContext<(href: string) => void>(() => {});

type SourceImage = { top: number; left: number; width: number; height: number; src: string };
const TransitionImageContext = createContext<(href: string, source: SourceImage) => void>(
  () => {},
);

export function useTransitionNavigate() {
  return useContext(TransitionContext);
}

export function useTransitionImage() {
  return useContext(TransitionImageContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const veil = useRef<HTMLDivElement>(null);
  const morph = useRef<HTMLDivElement>(null);
  const morphImg = useRef<HTMLImageElement>(null);
  const morphVoile = useRef<HTMLDivElement>(null);
  const morphEdge = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);
  const mode = useRef<"veil" | "morph">("veil");

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || pending.current) return;
      const el = veil.current;
      if (!el || prefersReducedMotion()) {
        router.push(href);
        return;
      }
      pending.current = href;
      mode.current = "veil";
      /* Filet de sécurité : si le tween du rideau est interrompu
         (onglet caché, charge), la navigation part quand même. */
      let parti = false;
      const partir = () => {
        if (parti) return;
        parti = true;
        window.scrollTo(0, 0);
        router.push(href);
      };
      const secours = window.setTimeout(partir, 900);
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)", display: "block" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.55,
          ease: gsapEasePierre,
          onComplete: () => {
            window.clearTimeout(secours);
            partir();
          },
        },
      );
    },
    [pathname, router],
  );

  /* Transition depuis une carte : morph plein cadre puis fondu sur le hero. */
  const naviguerImage = useCallback(
    (href: string, source: SourceImage) => {
      if (href === pathname || pending.current) return;
      const el = morph.current;
      const img = morphImg.current;
      const voile = morphVoile.current;
      const edge = morphEdge.current;
      if (!el || !img || !voile || !edge || prefersReducedMotion()) {
        window.scrollTo(0, 0);
        router.push(href);
        return;
      }
      pending.current = href;
      mode.current = "morph";

      const vw = window.innerWidth;
      const vh = window.innerHeight;

      img.src = source.src;
      gsap.set(el, {
        display: "block",
        opacity: 1,
        top: source.top,
        left: source.left,
        width: source.width,
        height: source.height,
      });
      /* Départ = l'aspect exact de la carte : image nette, léger sur-cadrage
         qui se pose (push-in cinéma), aucun voile. */
      gsap.set(img, { scale: 1.08 });
      gsap.set(voile, { opacity: 0 });
      gsap.set(edge, { opacity: 0.5 });

      let poussee = false;
      const pousser = () => {
        if (poussee) return;
        poussee = true;
        window.scrollTo(0, 0);
        router.push(href);
      };
      /* Secours : la nav part même si un frame saute. */
      const secours = window.setTimeout(pousser, 1400);

      const tl = gsap.timeline({
        onComplete: () => {
          window.clearTimeout(secours);
          gsap.set(el, { display: "none" });
          pending.current = null;
        },
      });
      /* 1. L'image se détache de la carte et grandit jusqu'au plein cadre,
         recadrée en cover à chaque frame (aucune déformation). */
      tl.to(el, {
        top: 0,
        left: 0,
        width: vw,
        height: vh,
        duration: 0.72,
        ease: gsapEasePierre,
      });
      tl.to(img, { scale: 1, duration: 0.72, ease: gsapEasePierre }, 0);
      /* Colorimétrie : on rejoint EXACTEMENT le voile du hero (basalte 45 %),
         pour que le fondu de raccord soit invisible — pas de saut de teinte. */
      tl.to(voile, { opacity: 0.45, duration: 0.72, ease: "none" }, 0);
      tl.to(edge, { opacity: 0, duration: 0.45, ease: "power2.out" }, 0.12);
      /* 2. Plein cadre, même teinte que le hero : on bascule vers la fiche. */
      tl.call(pousser);
      /* 3. Court palier (le poster de la fiche est déjà en cache), puis fondu. */
      tl.to(el, { opacity: 0, duration: 0.45, ease: "power2.out" }, "+=0.18");
    },
    [pathname, router],
  );

  /* La nouvelle page est montée : le rideau (liens ordinaires) finit sa course.
     Le morph, lui, est piloté de bout en bout par sa timeline. */
  useEffect(() => {
    if (mode.current !== "veil") return;
    const el = veil.current;
    if (!el || !pending.current) return;
    pending.current = null;
    gsap.to(el, {
      clipPath: "inset(0% 0% 100% 0%)",
      duration: 0.6,
      delay: 0.12,
      ease: gsapEasePierre,
      onComplete: () => {
        gsap.set(el, { display: "none" });
      },
    });
  }, [pathname]);

  return (
    <TransitionContext.Provider value={navigate}>
      <TransitionImageContext.Provider value={naviguerImage}>
        {children}

        {/* Rideau de basalte (liens ordinaires). z au-dessus de la plage de
           drei Html (~1.6e7), sinon le logo/cartes 3D passent devant. */}
        <div
          ref={veil}
          aria-hidden="true"
          className="fixed inset-0 hidden"
          style={{
            zIndex: 2147483000,
            background: "var(--color-basalte)",
            clipPath: "inset(100% 0% 0% 0%)",
          }}
        >
          <div
            className="absolute inset-x-0 top-0 h-px"
            style={{
              background:
                "linear-gradient(90deg, transparent, var(--color-braise-vive), transparent)",
            }}
          />
        </div>

        {/* Morph carte -> hero (galerie projets) */}
        <div
          ref={morph}
          aria-hidden="true"
          className="fixed hidden overflow-hidden"
          style={{
            zIndex: 2147483000,
            top: 0,
            left: 0,
            width: 0,
            height: 0,
            willChange: "top, left, width, height, opacity",
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            ref={morphImg}
            alt=""
            className="h-full w-full object-cover"
            style={{ willChange: "transform" }}
          />
          {/* Voile basalte : rampe jusqu'à la teinte du hero (raccord invisible). */}
          <div
            ref={morphVoile}
            className="pointer-events-none absolute inset-0"
            style={{ background: "var(--color-basalte)", opacity: 0 }}
          />
          <div
            ref={morphEdge}
            className="pointer-events-none absolute inset-0"
            style={{ boxShadow: "inset 0 0 0 1px var(--color-braise-vive)" }}
          />
        </div>
      </TransitionImageContext.Provider>
    </TransitionContext.Provider>
  );
}

type TransitionLinkProps = ComponentProps<typeof Link>;

export function TransitionLink({ href, onClick, ...rest }: TransitionLinkProps) {
  const navigate = useTransitionNavigate();
  return (
    <Link
      href={href}
      {...rest}
      onClick={(e) => {
        onClick?.(e);
        if (e.defaultPrevented) return;
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
        e.preventDefault();
        navigate(typeof href === "string" ? href : String(href));
      }}
    />
  );
}
