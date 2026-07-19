"use client";

/* Store minimal pour l'overlay de statut — pas de re-render des sections. */

type Listener = () => void;

let current = "";
const listeners = new Set<Listener>();

export function setStatus(next: string) {
  if (next === current) return;
  current = next;
  listeners.forEach((l) => l());
}

export function subscribeStatus(l: Listener) {
  listeners.add(l);
  return () => {
    listeners.delete(l);
  };
}

export function getStatus() {
  return current;
}

export function getServerStatus() {
  return "";
}
