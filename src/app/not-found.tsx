import { TransitionLink } from "@/components/chrome/Transition";
import Ajuste from "@/components/Ajuste";

export default function NotFound() {
  return (
    <main className="marge flex min-h-svh flex-col items-start justify-center gap-8">
      <p className="voix-mono" style={{ color: "var(--color-bronze)" }}>
        PLAN INTROUVABLE
      </p>
      <h1 className="voix-display" style={{ fontSize: "var(--text-display)", color: "var(--color-pierre)" }}>
        <Ajuste>Cette pièce</Ajuste>
        <Ajuste>n&apos;existe pas.</Ajuste>
      </h1>
      <TransitionLink
        href="/"
        className="voix-mono underline underline-offset-4"
        style={{ color: "var(--color-pierre)" }}
      >
        Revenir au film
      </TransitionLink>
    </main>
  );
}
