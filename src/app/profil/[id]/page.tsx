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
          <div className="w-24 h-24 rounded-2xl bg-surface-container flex items-center justify-center flex-shrink-0 relative overflow-hidden">
            {user.avatar_url ? (
              <Image
                src={user.avatar_url}
                alt={`${user.prenom} ${user.nom}`}
                fill
                className="object-cover"
              />
            ) : (
              <span className="font-headline font-bold text-3xl text-primary">
                {user.prenom.charAt(0)}{user.nom.charAt(0)}
              </span>
            )}
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
              <div className="flex items-center gap-3">
                {user.linkedin_url && (
                  <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn" className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                  </a>
                )}
                {user.facebook_url && (
                  <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook" className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                  </a>
                )}
                {user.x_url && (
                  <a href={user.x_url} target="_blank" rel="noopener noreferrer" title="X" className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.255 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                  </a>
                )}
                {user.instagram_url && (
                  <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram" className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                    <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                  </a>
                )}
              </div>
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
