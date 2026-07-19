"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { gsap } from "@/lib/gsap";
import { prefersReducedMotion } from "@/lib/useReducedMotion";
import { useFitText } from "@/lib/useFitText";

/* Le moment de conversion : silence, respiration, puis frappe.
   Tout le décor s'efface, la phrase entre par lignes masquées. */
export default function Punch({
  lignes,
  sous,
  plan,
  onEnter,
}: {
  lignes: string[];
  sous?: ReactNode;
  plan?: string;
  onEnter?: () => void;
}) {
  const section = useRef<HTMLElement>(null);
  useFitText(section);

  useEffect(() => {
    const sec = section.current;
    if (!sec) return;
    if (prefersReducedMotion()) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        sec.querySelectorAll("[data-ligne]"),
        { yPercent: 105 },
        {
          yPercent: 0,
          stagger: 0.12,
          ease: "none",
          scrollTrigger: {
            trigger: sec,
            start: "top 70%",
            end: "top 20%",
            scrub: 0.5,
            onEnter,
            onEnterBack: onEnter,
          },
        },
      );
      if (sec.querySelector("[data-sous]")) {
        gsap.fromTo(
          sec.querySelector("[data-sous]"),
          { opacity: 0 },
          {
            opacity: 1,
            scrollTrigger: {
              trigger: sec,
              start: "top 25%",
              end: "top 5%",
              scrub: 0.5,
            },
          },
        );
      }
    }, sec);

    return () => ctx.revert();
  }, [onEnter]);

  return (
    <section
      ref={section}
      className="marge flex min-h-svh flex-col items-start justify-center gap-10 py-(--spacing-section)"
    >
      {plan ? (
        <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
          {plan}
        </p>
      ) : null}
      <h2
        className="voix-display w-full max-w-full"
        style={{ fontSize: "var(--text-colossal)", color: "var(--page-fg)" }}
      >
        {lignes.map((l, i) => (
          <span key={i} className="block overflow-hidden pt-[0.12em]">
            <span data-ligne data-fit className="block w-fit whitespace-nowrap will-change-transform">
              {l}
            </span>
          </span>
        ))}
      </h2>
      {sous ? (
        <div data-sous className="voix-mono" style={{ color: "var(--page-fg-2)" }}>
          {sous}
        </div>
      ) : null}
    </section>
  );
}
