import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import ProfilClient from "./ProfilClient";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const user = await fetchQuery(api.users.getByIdOrSlug, { idOrSlug: params.id });

    if (!user) {
      return { title: "Profil - Le Dépôt" };
    }

    const nom = `${user.prenom} ${user.nom}`;
    const description = user.bio
      ? user.bio.slice(0, 200)
      : `Jette un coup d'œil au profil de ${nom} sur Le Dépôt - la bibliothèque du contenu digital africain.`;

    return {
      title: `${nom} | Le Dépôt`,
      description,
      openGraph: {
        title: `${nom} sur Le Dépôt`,
        description,
        images: [{ url: "/og-image.png" }],
        type: "profile",
      },
      twitter: {
        card: "summary",
        title: `${nom} sur Le Dépôt`,
        description,
        images: ["/og-image.png"],
      },
    };
  } catch {
    return { title: "Profil - Le Dépôt" };
  }
}

export default function ProfilPage() {
  return <ProfilClient />;
}
