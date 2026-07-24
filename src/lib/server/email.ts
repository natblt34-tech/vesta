import "server-only";
import { Resend } from "resend";

/* Envoi d'emails via Resend. Best-effort : un échec (domaine pas encore
   vérifié, quota) n'interrompt jamais l'opération métier. L'adresse
   d'expédition et le destinataire studio viennent de l'environnement. */

const FROM = process.env.EMAIL_FROM ?? "Vesta <contact@vesta-re.com>";
export const EMAIL_STUDIO = process.env.ADMIN_EMAIL ?? "contact@vesta-re.com";

export async function envoyerEmail(
  to: string,
  sujet: string,
  corps: string,
  replyTo?: string,
): Promise<void> {
  const cle = process.env.RESEND_API_KEY;
  if (!cle) {
    console.warn("[email] RESEND_API_KEY absente, envoi ignoré.");
    return;
  }
  try {
    const resend = new Resend(cle);
    /* contact@vesta-re.com n'est pas une boîte : les réponses partent
       vers une adresse réelle (studio par défaut, ou le client). */
    const { error } = await resend.emails.send({
      from: FROM,
      to,
      subject: sujet,
      text: corps,
      replyTo: replyTo || EMAIL_STUDIO,
    });
    if (error) console.error(`[email] échec -> ${to} : ${error.message}`);
  } catch (e) {
    console.error("[email] exception :", e instanceof Error ? e.message : e);
  }
}

export function lienEspace(): string {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "https://vesta-re.com";
  return `${base}/espace`;
}
