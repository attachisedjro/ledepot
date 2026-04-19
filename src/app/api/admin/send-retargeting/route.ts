import { NextResponse } from "next/server";
import { currentUser } from "@clerk/nextjs/server";
import { Resend } from "resend";

const ADMIN_CLERK_IDS = ["user_3BfUEKIgwgcZ97tshB4NIVjEtag"];

type Recipient = {
  email: string;
  prenom?: string;
};

export async function POST(req: Request) {
  const user = await currentUser();
  if (!user || !ADMIN_CLERK_IDS.includes(user.id)) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
  }

  const { recipients, sujet, corps } = (await req.json()) as {
    recipients: Recipient[];
    sujet: string;
    corps: string;
  };

  if (!recipients?.length || !sujet || !corps) {
    return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = "Le Depot <noreply@createevesafrica.com>";

  if (!apiKey || apiKey === "re_REMPLACE_PAR_TA_CLE") {
    return NextResponse.json({ error: "RESEND_API_KEY non configurée" }, { status: 503 });
  }

  const resend = new Resend(apiKey);

  const results: { email: string; ok: boolean; error?: string }[] = [];

  for (const recipient of recipients) {
    const greeting = recipient.prenom?.trim()
      ? `Bonjour ${recipient.prenom.trim()},`
      : "Bonjour,";

    const finalBody = corps
      .replace(/Bonjour \{prenom\},/g, greeting)
      .replace(/\{prenom\}/g, recipient.prenom?.trim() ?? "");

    try {
      await resend.emails.send({
        from,
        to: recipient.email,
        subject: sujet,
        text: finalBody,
      });
      results.push({ email: recipient.email, ok: true });
    } catch (err) {
      results.push({ email: recipient.email, ok: false, error: err instanceof Error ? err.message : "Erreur" });
    }

    // Respecter la limite de 5 req/sec de Resend
    await new Promise((r) => setTimeout(r, 220));
  }

  const sent = results.filter((r) => r.ok).length;
  const failed = results.filter((r) => !r.ok).length;

  return NextResponse.json({ sent, failed, results });
}
