import type { Metadata } from "next";
import Studio from "@/components/client/Studio";

export const metadata: Metadata = {
  title: "Studio Lares",
  robots: { index: false, follow: false },
};

export default function Page() {
  return <Studio />;
}
