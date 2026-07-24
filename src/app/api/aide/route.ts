import { NextResponse } from "next/server";
import { appelant } from "@/lib/server/session";
import { envoyerEmail, EMAIL_STUDIO } from "@/lib/server/email";

/* Bulle d'aide : message d'un client vers le studio. */
export async function POST(req: Request) {
  const moi = await appelant();
  if (!moi) return NextResponse.json({ erreur: "Non connecté." }, { status: 401 });
  const { message } = (await req.json()) as { message?: string };
  if (!message?.trim()) return NextResponse.json({ erreur: "Message vide." }, { status: 400 });

  await envoyerEmail(EMAIL_STUDIO, "Demande d'aide espace client", `${moi.email} : ${message.trim()}`);
  return NextResponse.json({ ok: true });
}
