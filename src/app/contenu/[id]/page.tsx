"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ContenuPage() {
  const params = useParams();
  const id = params.id as Id<"contenus">;

  const contenu = useQuery(api.contenus.getById, { id });
  const incrementerVues = useMutation(api.contenus.incrementerVues);

  useEffect(() => {
    if (contenu) incrementerVues({ id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenu?._id]);

  if (contenu === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-surface-container rounded w-1/3" />
          <div className="h-96 bg-surface-container rounded-2xl" />
        </div>
      </div>
    );
  }

  if (!contenu) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Campagne introuvable
          </h1>
          <Link href="/galerie" className="text-primary text-sm hover:underline">
            Retour à la galerie
          </Link>
        </div>
      </div>
    );
  }

  const cm = contenu.user
    ? `${contenu.user.prenom} ${contenu.user.nom}`
    : "Anonyme";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-5xl mx-auto">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-label text-on-surface-variant mb-8">
          <Link href="/galerie" className="hover:text-on-surface transition-colors">
            Galerie
          </Link>
          <span>/</span>
          <span className="text-on-surface">{contenu.titre}</span>
        </nav>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Visuel */}
          <div className="bg-surface-container rounded-2xl overflow-hidden aspect-[4/5] relative">
            {contenu.visuel_url ? (
              <Image
                src={contenu.visuel_url}
                alt={contenu.titre}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-on-surface-variant/20 font-headline text-6xl">
                  {contenu.marque.charAt(0)}
                </span>
              </div>
            )}
          </div>

          {/* Infos */}
          <div className="space-y-6">
            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[contenu.pays, contenu.secteur, contenu.format, contenu.annee].map((tag) => (
                <span
                  key={tag}
                  className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>

            {/* Titre */}
            <div>
              <p className="text-sm font-label text-on-surface-variant mb-1">
                {contenu.marque}
              </p>
              <h1 className="font-headline font-bold text-3xl text-on-surface">
                {contenu.titre}
              </h1>
            </div>

            {/* CM */}
            <div className="bg-surface-container p-4 rounded-2xl">
              <p className="text-xs font-label text-on-surface-variant mb-1">
                Community Manager
              </p>
              <Link
                href={`/profil/${contenu.userId}`}
                className="font-body font-medium text-on-surface hover:text-primary transition-colors"
              >
                {cm} →
              </Link>
            </div>

            {/* Intention créative */}
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface mb-3">
                Intention créative
              </h2>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {contenu.intention_creative}
              </p>
            </div>

            {/* Occasion */}
            {contenu.occasion && (
              <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
                <span className="font-medium">Occasion :</span>
                <span>{contenu.occasion}</span>
              </div>
            )}

            {/* Type */}
            {contenu.type_contenu && (
              <div className="flex items-center gap-2 text-sm font-body text-on-surface-variant">
                <span className="font-medium">Type :</span>
                <span>{contenu.type_contenu}</span>
              </div>
            )}

            {/* Vues */}
            <p className="text-xs font-body text-on-surface-variant">
              {contenu.vues} vue{contenu.vues > 1 ? "s" : ""}
            </p>

            {/* CTA lien */}
            <a
              href={contenu.lien_publication}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient text-white font-label font-medium px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity inline-block"
            >
              Voir la publication originale →
            </a>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
