import type { Metadata } from "next";
import { fetchQuery } from "convex/nextjs";
import { api } from "../../../../convex/_generated/api";
import ContenuClient from "./ContenuClient";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  try {
    const contenu = await fetchQuery(api.contenus.getByIdOrSlug, { idOrSlug: params.id });

    if (!contenu) {
      return { title: "Campagne - Le Dépôt" };
    }

    const title = `${contenu.titre} - Le Dépôt`;
    const description = contenu.intention_creative.slice(0, 200);
    const images = contenu.visuel_url ? [{ url: contenu.visuel_url }] : [{ url: "/og-image.png" }];

    return {
      title,
      description,
      openGraph: { title, description, images, type: "article" },
      twitter: {
        card: contenu.visuel_url ? "summary_large_image" : "summary",
        title,
        description,
        images: contenu.visuel_url ? [contenu.visuel_url] : ["/og-image.png"],
      },
    };
  } catch {
    return { title: "Campagne - Le Dépôt" };
  }
}

export default function ContenuPage() {
  return <ContenuClient />;
}
