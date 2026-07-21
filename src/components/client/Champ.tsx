"use client";

import type { InputHTMLAttributes } from "react";

/* Champ de formulaire à la charte : label mono, input filet. */
export default function Champ({
  label,
  ...props
}: { label: string } & InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="flex flex-col gap-2">
      <span className="voix-mono" style={{ color: "var(--color-gris-pierre)" }}>
        {label}
      </span>
      <input
        {...props}
        className="w-full bg-transparent px-3 py-3 outline-none focus-visible:border-(--color-bronze)"
        style={{ border: "1px solid var(--color-filet)", color: "var(--color-pierre)" }}
      />
    </label>
  );
}
