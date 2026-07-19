"use client";

import { useRef, type CSSProperties, type ReactNode } from "react";
import { useFitText } from "@/lib/useFitText";

/* Une ligne display qui ne déborde jamais : nowrap + ajustement à la largeur. */
export default function Ajuste({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  useFitText(ref);
  return (
    <span ref={ref} data-fit className={`block w-fit whitespace-nowrap ${className}`} style={style}>
      {children}
    </span>
  );
}
