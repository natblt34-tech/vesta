"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { gsap, gsapEasePierre } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useTransitionNavigate } from "./Transition";
import { CAL_URL } from "@/lib/site";

const ENTREES = [
  { href: "/", label: "Le film", voix: "LE SCROLL EST LE FILM" },
  { href: "/retouche", label: "La retouche", voix: "AVANT / APRÈS" },
  { href: "/home-staging", label: "Le home staging", voix: "LA PIÈCE SE MEUBLE" },
  { href: "/projets", label: "Les projets", voix: "FILMS LIVRÉS" },
];

export default function Nav() {
  const [open, setOpen] = useState(false);
  const panel = useRef<HTMLDivElement>(null);
  const firstLink = useRef<HTMLAnchorElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const navigate = useTransitionNavigate();
  const pathname = usePathname();

  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    const el = panel.current;
    if (!el) return;
    const reduced = prefersReducedMotion();

    if (open) {
      document.documentElement.style.overflow = "hidden";
      if (reduced) {
        gsap.set(el, { display: "flex", clipPath: "inset(0% 0% 0% 0%)" });
        gsap.set(el.querySelectorAll("[data-nav-item]"), { clipPath: "inset(0% 0% 0% 0%)", y: 0 });
      } else {
        gsap.set(el, { display: "flex" });
        const tl = gsap.timeline();
        tl.fromTo(
          el,
          { clipPath: "inset(0% 0% 100% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 0.5, ease: gsapEasePierre },
        ).fromTo(
          el.querySelectorAll("[data-nav-item]"),
          { clipPath: "inset(0% 0% 100% 0%)", y: 24 },
          {
            clipPath: "inset(0% 0% -10% 0%)",
            y: 0,
            duration: 0.55,
            stagger: 0.06,
            ease: "power4.out",
          },
          "-=0.15",
        );
      }
      firstLink.current?.focus();
    } else {
      document.documentElement.style.overflow = "";
      if (reduced) {
        gsap.set(el, { display: "none" });
      } else {
        gsap.to(el, {
          clipPath: "inset(0% 0% 100% 0%)",
          duration: 0.4,
          ease: gsapEasePierre,
          onComplete: () => gsap.set(el, { display: "none" }),
        });
      }
      trigger.current?.focus({ preventScroll: true });
    }
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close]);

  return (
    <>
      <button
        ref={trigger}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-controls="nav-overlay"
        className="voix-mono fixed right-0 top-0 z-98 flex items-center gap-2 py-3 pr-[var(--spacing-marge)]"
        style={{ color: "var(--page-fg)" }}
      >
        <span className="braise-point" aria-hidden="true" />
        {open ? "Fermer" : "Menu"}
      </button>

      <div
        ref={panel}
        id="nav-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Navigation"
        className="fixed inset-0 z-97 hidden flex-col justify-between"
        style={{
          background: "var(--color-basalte-2)",
          clipPath: "inset(0% 0% 100% 0%)",
          paddingTop: "18vh",
          paddingBottom: "6vh",
        }}
      >
        <nav className="marge flex flex-col gap-1">
          {ENTREES.map((e, i) => (
            <div key={e.href} data-nav-item className="overflow-hidden">
              <a
                ref={i === 0 ? firstLink : undefined}
                href={e.href}
                aria-current={pathname === e.href ? "page" : undefined}
                onClick={(ev) => {
                  ev.preventDefault();
                  close();
                  if (pathname !== e.href) navigate(e.href);
                }}
                className="voix-display group flex items-baseline gap-6"
                style={{
                  fontSize: "clamp(2rem, 6.5vw, 4.75rem)",
                  color: pathname === e.href ? "var(--color-gris-pierre)" : "var(--color-pierre)",
                }}
              >
                <span className="transition-colors duration-200 group-hover:text-(--color-braise-vive)">
                  {e.label}
                </span>
                <span
                  className="voix-mono hidden sm:inline"
                  style={{ color: "var(--color-bronze)" }}
                >
                  {e.voix}
                </span>
              </a>
            </div>
          ))}
        </nav>

        <div data-nav-item className="marge">
          <a
            href={CAL_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="voix-mono inline-flex items-center gap-3 border px-6 py-4"
            style={{ borderColor: "var(--color-braise)", color: "var(--color-pierre)" }}
          >
            <span className="braise-point" aria-hidden="true" />
            Prendre rendez-vous — le premier film est offert
          </a>
        </div>
      </div>
    </>
  );
}
