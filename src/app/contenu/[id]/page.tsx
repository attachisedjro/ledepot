"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { useUser } from "@clerk/nextjs";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ContenuPage() {
  const params = useParams();
  const id = params.id as Id<"contenus">;
  const { isSignedIn, user } = useUser();

  const contenu = useQuery(api.contenus.getById, { id });
  const incrementerVues = useMutation(api.contenus.incrementerVues);
  const toggleLike = useMutation(api.likes.toggleLike);
  const liked = useQuery(
    api.likes.hasLiked,
    isSignedIn && user ? { clerkId: user.id, contenuId: id } : "skip"
  );

  useEffect(() => {
    if (contenu) incrementerVues({ id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenu?._id]);

  const handleLike = async () => {
    if (!isSignedIn || !user) return;
    await toggleLike({ clerkId: user.id, contenuId: id });
  };

  if (contenu === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-5xl mx-auto animate-pulse space-y-6">
          <div className="h-4 bg-surface-container rounded w-1/4" />
          <div className="h-80 bg-surface-container rounded-2xl" />
          <div className="grid md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <div className="h-8 bg-surface-container rounded w-1/2" />
              <div className="h-32 bg-surface-container rounded" />
            </div>
            <div className="h-64 bg-surface-container rounded-2xl" />
          </div>
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

  const contributeurNom = contenu.user
    ? `${contenu.user.prenom} ${contenu.user.nom}`
    : "Anonyme";

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-label text-on-surface-variant mb-8">
          <Link href="/galerie" className="hover:text-on-surface transition-colors">Galerie</Link>
          <span>/</span>
          <span className="text-on-surface">{contenu.titre}</span>
        </nav>

        {/* Visuel principal — ratio libre, centré */}
        <div className="w-full flex justify-center mb-12">
          <div className="rounded-2xl overflow-hidden bg-surface-container max-h-[70vh] max-w-2xl w-full relative">
            {contenu.visuel_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contenu.visuel_url}
                alt={contenu.titre}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
            ) : (
              <div className="w-full aspect-video flex items-center justify-center">
                <span className="text-on-surface-variant/20 font-headline text-8xl">
                  {contenu.marque.charAt(0)}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-6">
          {[contenu.pays, contenu.secteur, contenu.format, contenu.annee].map((tag) => (
            <span key={tag} className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1 rounded-full">
              {tag}
            </span>
          ))}
        </div>

        {/* Titre + Marque */}
        <div className="mb-10">
          <p className="text-sm font-label text-on-surface-variant mb-1">{contenu.marque}</p>
          <h1 className="font-headline font-bold text-4xl text-on-surface leading-tight">
            {contenu.titre}
          </h1>
        </div>

        {/* Layout 2 colonnes */}
        <div className="grid md:grid-cols-3 gap-10 items-start">

          {/* ── Colonne gauche (intention + CTA) ── */}
          <div className="md:col-span-2 space-y-8">

            {/* Intention créative */}
            <div>
              <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">
                Intention créative
              </h2>
              <p className="font-body text-base text-on-surface leading-relaxed">
                {contenu.intention_creative}
              </p>
            </div>

            {/* Occasion + Type */}
            <div className="flex flex-wrap gap-6">
              {contenu.occasion && (
                <div>
                  <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Occasion</p>
                  <p className="text-sm font-body text-on-surface">{contenu.occasion}</p>
                </div>
              )}
              {contenu.type_contenu && (
                <div>
                  <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Type</p>
                  <p className="text-sm font-body text-on-surface">{contenu.type_contenu}</p>
                </div>
              )}
              {contenu.agence_creative && (
                <div>
                  <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Agence</p>
                  <p className="text-sm font-body text-on-surface">{contenu.agence_creative}</p>
                </div>
              )}
            </div>

            {/* Vues + Likes */}
            <div className="flex items-center gap-6 pt-2">
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Vues</p>
                <p className="font-headline font-bold text-2xl text-on-surface">{contenu.vues.toLocaleString("fr")}</p>
              </div>
              <div>
                <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-1">Likes</p>
                {isSignedIn ? (
                  <button
                    onClick={handleLike}
                    className={`flex items-center gap-1.5 font-headline font-bold text-2xl transition-colors ${liked ? "text-rose-500" : "text-on-surface hover:text-rose-400"}`}
                  >
                    <span>{liked ? "♥" : "♡"}</span>
                    <span>{contenu.likes ?? 0}</span>
                  </button>
                ) : (
                  <Link href="/sign-up" className="flex items-center gap-1.5 font-headline font-bold text-2xl text-on-surface/40 hover:text-rose-400 transition-colors">
                    <span>♡</span>
                    <span>{contenu.likes ?? 0}</span>
                  </Link>
                )}
              </div>
            </div>

            {/* CTA */}
            <a
              href={contenu.lien_publication}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient text-white font-label font-medium px-6 py-4 rounded-xl text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 w-full justify-center"
            >
              Voir la publication originale
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>

          {/* ── Colonne droite (contributeur + méta) ── */}
          <div className="space-y-4">

            {/* Carte contributeur */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
              <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-3">Contributeur</p>

              {contenu.anonyme ? (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center flex-shrink-0">
                    <span className="text-on-surface-variant/40 font-headline font-bold">?</span>
                  </div>
                  <p className="font-body font-medium text-on-surface-variant">Anonyme</p>
                </div>
              ) : (
                <>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex-shrink-0 relative overflow-hidden">
                      {contenu.user?.avatar_url ? (
                        <Image src={contenu.user.avatar_url} alt={contributeurNom} fill className="object-cover" />
                      ) : (
                        <span className="absolute inset-0 flex items-center justify-center font-headline font-bold text-sm text-primary">
                          {contenu.user ? `${contenu.user.prenom.charAt(0)}${contenu.user.nom.charAt(0)}` : "?"}
                        </span>
                      )}
                    </div>
                    <div>
                      <p className="font-body font-medium text-sm text-on-surface">{contributeurNom}</p>
                      {contenu.user?.poste && (
                        <p className="text-xs font-label text-on-surface-variant">{contenu.user.poste}</p>
                      )}
                    </div>
                  </div>
                  {contenu.user?.bio && (
                    <p className="text-xs font-body text-on-surface-variant leading-relaxed mb-3 line-clamp-3">
                      {contenu.user.bio}
                    </p>
                  )}
                  <Link
                    href={`/profil/${contenu.userId}`}
                    className="text-xs font-label font-medium text-primary hover:opacity-75 transition-opacity"
                  >
                    Voir le portfolio →
                  </Link>
                </>
              )}
            </div>

            {/* Méta infos */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card space-y-4">
              {[
                { label: "Année", value: contenu.annee },
                { label: "Pays", value: contenu.pays },
                { label: "Secteur", value: contenu.secteur },
                { label: "Format", value: contenu.format },
                contenu.occasion ? { label: "Occasion", value: contenu.occasion } : null,
                contenu.type_contenu ? { label: "Type", value: contenu.type_contenu } : null,
                contenu.agence_creative ? { label: "Agence", value: contenu.agence_creative } : null,
              ].filter(Boolean).map((item) => (
                <div key={item!.label} className="flex items-center justify-between">
                  <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">{item!.label}</span>
                  <span className="text-sm font-body text-on-surface text-right">{item!.value}</span>
                </div>
              ))}
            </div>

          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
