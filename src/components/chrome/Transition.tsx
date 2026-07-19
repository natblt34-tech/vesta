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

/* Transition inter-pages : un rideau de basalte au bord embrasé.
   Un cut monté, pas un chargement. */

const TransitionContext = createContext<(href: string) => void>(() => {});

export function useTransitionNavigate() {
  return useContext(TransitionContext);
}

export function TransitionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const veil = useRef<HTMLDivElement>(null);
  const pending = useRef<string | null>(null);

  const navigate = useCallback(
    (href: string) => {
      if (href === pathname || pending.current) return;
      const el = veil.current;
      if (!el || prefersReducedMotion()) {
        router.push(href);
        return;
      }
      pending.current = href;
      gsap.fromTo(
        el,
        { clipPath: "inset(100% 0% 0% 0%)", display: "block" },
        {
          clipPath: "inset(0% 0% 0% 0%)",
          duration: 0.55,
          ease: gsapEasePierre,
          onComplete: () => {
            window.scrollTo(0, 0);
            router.push(href);
          },
        },
      );
    },
    [pathname, router],
  );

  /* La nouvelle page est montée : le rideau continue vers le haut. */
  useEffect(() => {
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
      {children}
      <div
        ref={veil}
        aria-hidden="true"
        className="fixed inset-0 z-96 hidden"
        style={{
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
