"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Id } from "../../../../convex/_generated/dataModel";

export default function ProfilPage() {
  const params = useParams();
  const userId = params.id as Id<"users">;

  const user = useQuery(api.users.getById, { id: userId });
  const contenus = useQuery(api.contenus.getByUser, { userId });

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-24 w-24 bg-surface-container rounded-full" />
          <div className="h-8 bg-surface-container rounded w-1/3" />
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Navbar />
        <p className="font-body text-on-surface-variant">Profil introuvable.</p>
      </div>
    );
  }

  const publies = contenus?.filter((c) => c.statut === "publie") ?? [];

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        {/* Profil header */}
        <div className="flex flex-col md:flex-row gap-8 items-start mb-14">
          {/* Avatar */}
          <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0">
            <span className="font-headline font-bold text-3xl text-primary">
              {user.prenom.charAt(0)}{user.nom.charAt(0)}
            </span>
          </div>

          {/* Infos */}
          <div className="flex-1">
            <h1 className="font-headline font-bold text-3xl text-on-surface mb-1">
              {user.prenom} {user.nom}
            </h1>
            {user.pays && (
              <p className="text-sm font-body text-on-surface-variant mb-3">
                {user.pays}
              </p>
            )}
            {user.bio && (
              <p className="font-body text-sm text-on-surface leading-relaxed max-w-lg mb-4">
                {user.bio}
              </p>
            )}
            <div className="flex items-center gap-6 flex-wrap">
              <div className="bg-surface-container px-4 py-2 rounded-xl">
                <p className="text-xs font-label text-on-surface-variant">Campagnes</p>
                <p className="font-headline font-bold text-xl text-on-surface">{publies.length}</p>
              </div>
              {user.linkedin_url && (
                <a
                  href={user.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm font-label font-medium text-primary hover:opacity-75 transition-opacity"
                >
                  LinkedIn →
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Campagnes */}
        <h2 className="font-headline font-bold text-2xl text-on-surface mb-6">
          Campagnes
        </h2>

        {publies.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body text-on-surface-variant text-sm">
              Aucune campagne publiée pour l&apos;instant.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {publies.map((c) => (
              <Link key={c._id} href={`/contenu/${c._id}`}>
                <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-all hover:-translate-y-0.5 group cursor-pointer">
                  <div className="w-full aspect-[4/5] bg-surface-container relative overflow-hidden">
                    {c.visuel_url ? (
                      <Image src={c.visuel_url} alt={c.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-on-surface-variant/20 font-headline text-4xl">{c.marque.charAt(0)}</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 text-white text-xs font-label font-medium bg-black/25 px-2 py-1 rounded-full">{c.pays}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-label text-on-surface-variant mb-1 truncate">{c.marque} · {c.secteur}</p>
                    <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">{c.titre}</h3>
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </div>

      <Footer />
    </div>
  );
}
