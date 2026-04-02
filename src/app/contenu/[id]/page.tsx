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

export default function ContenuPage() {
  const params = useParams();
  const idOrSlug = params.id as string;
  const { isSignedIn, user } = useUser();

  const contenu = useQuery(api.contenus.getByIdOrSlug, { idOrSlug });
  const similaires = useQuery(
    api.contenus.list,
    contenu ? { secteur: contenu.secteur } : "skip"
  );
  const incrementerVues = useMutation(api.contenus.incrementerVues);
  const toggleLike = useMutation(api.likes.toggleLike);
  const liked = useQuery(
    api.likes.hasLiked,
    isSignedIn && user && contenu ? { clerkId: user.id, contenuId: contenu._id } : "skip"
  );

  useEffect(() => {
    if (contenu) incrementerVues({ id: contenu._id });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contenu?._id]);

  const handleLike = async () => {
    if (!isSignedIn || !user || !contenu) return;
    await toggleLike({ clerkId: user.id, contenuId: contenu._id });
  };

  if (contenu === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-5xl mx-auto animate-pulse">
          <div className="h-4 bg-surface-container rounded w-1/4 mb-8" />
          <div className="grid md:grid-cols-2 gap-10">
            <div className="aspect-[4/5] bg-surface-container rounded-2xl" />
            <div className="space-y-4">
              <div className="h-6 bg-surface-container rounded w-1/3" />
              <div className="h-10 bg-surface-container rounded w-2/3" />
              <div className="h-32 bg-surface-container rounded" />
            </div>
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
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">Campagne introuvable</h1>
          <Link href="/galerie" className="text-primary text-sm hover:underline">Retour à la galerie</Link>
        </div>
      </div>
    );
  }

  const contributeurNom = contenu.user ? `${contenu.user.prenom} ${contenu.user.nom}` : "Anonyme";

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

        {/* Layout desktop : 2 colonnes | mobile : empilé */}
        <div className="grid md:grid-cols-2 gap-10 items-start">

          {/* ── Colonne gauche : visuel ── */}
          <div className="bg-surface-container rounded-2xl overflow-hidden flex items-center justify-center">
            {contenu.visuel_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={contenu.visuel_url}
                alt={contenu.titre}
                className="w-full h-auto max-h-[80vh] object-contain"
              />
            ) : (
              <div className="w-full aspect-[4/5] flex items-center justify-center">
                <span className="text-on-surface-variant/20 font-headline text-8xl">{contenu.marque.charAt(0)}</span>
              </div>
            )}
          </div>

          {/* ── Colonne droite : toutes les infos ── */}
          <div className="space-y-6">

            {/* Tags */}
            <div className="flex flex-wrap gap-2">
              {[contenu.pays, contenu.secteur, contenu.format, contenu.annee].map((tag) => (
                <span key={tag} className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>

            {/* Titre */}
            <div>
              <p className="text-sm font-label text-on-surface-variant mb-1">{contenu.marque}</p>
              <h1 className="font-headline font-bold text-3xl text-on-surface leading-tight">{contenu.titre}</h1>
            </div>

            {/* Contributeur */}
            <div className="bg-surface-container rounded-2xl p-4">
              <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant mb-2">Contributeur</p>
              {contenu.anonyme ? (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex items-center justify-center flex-shrink-0">
                    <span className="text-on-surface-variant/40 font-headline font-bold text-sm">?</span>
                  </div>
                  <p className="font-body font-medium text-sm text-on-surface-variant">Anonyme</p>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-surface-container-high flex-shrink-0 relative overflow-hidden">
                    {contenu.user?.avatar_url ? (
                      <Image src={contenu.user.avatar_url} alt={contributeurNom} fill className="object-cover" />
                    ) : (
                      <span className="absolute inset-0 flex items-center justify-center font-headline font-bold text-sm text-primary">
                        {contenu.user ? `${contenu.user.prenom.charAt(0)}${contenu.user.nom.charAt(0)}` : "?"}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <Link href={`/profil/${contenu.user?.slug ?? contenu.userId}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors">
                      {contributeurNom}
                    </Link>
                    {contenu.user?.poste && (
                      <p className="text-xs font-label text-on-surface-variant truncate">{contenu.user.poste}</p>
                    )}
                  </div>
                  <Link href={`/profil/${contenu.user?.slug ?? contenu.userId}`} className="text-xs font-label text-primary hover:opacity-75 flex-shrink-0">
                    Portfolio →
                  </Link>
                </div>
              )}
            </div>

            {/* Intention créative */}
            <div>
              <h2 className="font-headline font-bold text-lg text-on-surface mb-2">Intention créative</h2>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">{contenu.intention_creative}</p>
            </div>

            {/* Méta (occasion / type / agence) */}
            {(contenu.occasion || contenu.type_contenu || contenu.agence_creative) && (
              <div className="flex flex-wrap gap-x-6 gap-y-3">
                {contenu.occasion && (
                  <div>
                    <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Occasion</p>
                    <p className="text-sm font-body text-on-surface mt-0.5">{contenu.occasion}</p>
                  </div>
                )}
                {contenu.type_contenu && (
                  <div>
                    <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Type</p>
                    <p className="text-sm font-body text-on-surface mt-0.5">{contenu.type_contenu}</p>
                  </div>
                )}
                {contenu.agence_creative && (
                  <div>
                    <p className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Agence</p>
                    <p className="text-sm font-body text-on-surface mt-0.5">{contenu.agence_creative}</p>
                  </div>
                )}
              </div>
            )}

            {/* Vues + Likes */}
            <div className="flex items-center gap-4">
              <p className="text-xs font-body text-on-surface-variant">{contenu.vues} vue{contenu.vues > 1 ? "s" : ""}</p>
              {isSignedIn ? (
                <button
                  onClick={handleLike}
                  className={`flex items-center gap-1.5 text-sm font-label font-medium transition-colors ${liked ? "text-rose-500" : "text-on-surface-variant hover:text-rose-400"}`}
                >
                  <span className="text-base">{liked ? "♥" : "♡"}</span>
                  <span>{contenu.likes ?? 0} like{(contenu.likes ?? 0) > 1 ? "s" : ""}</span>
                </button>
              ) : (
                <Link href="/sign-up" className="flex items-center gap-1.5 text-sm font-label text-on-surface-variant/50 hover:text-rose-400 transition-colors">
                  <span className="text-base">♡</span>
                  <span>{contenu.likes ?? 0} like{(contenu.likes ?? 0) > 1 ? "s" : ""}</span>
                </Link>
              )}
            </div>

            {/* CTA */}
            <a
              href={contenu.lien_publication}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-gradient text-white font-label font-medium px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity inline-flex items-center gap-2 w-full justify-center"
            >
              Voir la publication originale
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </a>
          </div>
        </div>

        {/* Campagnes similaires */}
        {similaires && similaires.filter(c => c._id !== contenu._id).length > 0 && (
          <div className="mt-16 pt-12 border-t border-outline-variant/20">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-6">Dans le même secteur</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {similaires
                .filter(c => c._id !== contenu._id)
                .slice(0, 3)
                .map(c => (
                  <Link key={c._id} href={`/contenu/${c.slug ?? c._id}`}>
                    <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-all hover:-translate-y-0.5 group cursor-pointer">
                      <div className="w-full aspect-[4/5] bg-surface-container relative overflow-hidden">
                        {c.visuel_url ? (
                          <Image src={c.visuel_url} alt={c.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-on-surface-variant/20 font-headline text-4xl">{c.marque.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div className="p-4">
                        <p className="text-xs font-label text-on-surface-variant mb-1 truncate">{c.marque} · {c.pays}</p>
                        <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2">{c.titre}</h3>
                      </div>
                    </article>
                  </Link>
                ))}
            </div>
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
