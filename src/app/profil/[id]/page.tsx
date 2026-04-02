"use client";

import { useQuery } from "convex/react";
import { api } from "../../../../convex/_generated/api";
import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import type { Id } from "../../../../convex/_generated/dataModel";
import { useState } from "react";

export default function ProfilPage() {
  const params = useParams();
  const userId = params.id as Id<"users">;

  const [filterSecteur, setFilterSecteur] = useState("");
  const [filterPays, setFilterPays] = useState("");
  const [filterOccasion, setFilterOccasion] = useState("");
  const [filterAnnee, setFilterAnnee] = useState("");

  const user = useQuery(api.users.getById, { id: userId });
  const contenus = useQuery(api.contenus.getByUser, { userId });

  if (user === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-6xl mx-auto animate-pulse flex gap-8">
          <div className="w-72 flex-shrink-0 space-y-4">
            <div className="h-80 bg-surface-container rounded-2xl" />
            <div className="h-48 bg-surface-container rounded-2xl" />
          </div>
          <div className="flex-1 space-y-4">
            <div className="h-12 bg-surface-container rounded w-1/3" />
            <div className="grid grid-cols-2 gap-4">
              <div className="h-64 bg-surface-container rounded-2xl" />
              <div className="h-64 bg-surface-container rounded-2xl" />
            </div>
          </div>
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

  const allPublies = contenus?.filter((c) => c.statut === "publie" && !c.anonyme) ?? [];

  let filtered = allPublies;
  if (filterSecteur) filtered = filtered.filter((c) => c.secteur === filterSecteur);
  if (filterPays) filtered = filtered.filter((c) => c.pays === filterPays);
  if (filterOccasion) filtered = filtered.filter((c) => c.occasion === filterOccasion);
  if (filterAnnee) filtered = filtered.filter((c) => c.annee === filterAnnee);

  const secteurs = Array.from(new Set(allPublies.map((c) => c.secteur)));
  const pays = Array.from(new Set(allPublies.map((c) => c.pays)));
  const occasions = Array.from(new Set(allPublies.map((c) => c.occasion)));
  const annees = Array.from(new Set(allPublies.map((c) => c.annee))).sort().reverse();

  const hasFilters = filterSecteur || filterPays || filterOccasion || filterAnnee;
  const anneeInscription = new Date(user._creationTime).getFullYear();
  const initiales = `${user.prenom.charAt(0)}${user.nom.charAt(0)}`;

  const hasSocial = user.linkedin_url || user.facebook_url || user.x_url || user.instagram_url;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-20 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex gap-8 items-start">

          {/* ── SIDEBAR GAUCHE ── */}
          <div className="w-64 flex-shrink-0 sticky top-24 space-y-4">

            {/* Carte profil */}
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card text-center">
              {/* Avatar */}
              <div className="w-20 h-20 rounded-2xl mx-auto mb-4 relative overflow-hidden bg-surface-container flex items-center justify-center">
                {user.avatar_url ? (
                  <Image src={user.avatar_url} alt={initiales} fill className="object-cover" />
                ) : (
                  <span className="font-headline font-bold text-3xl text-primary">{initiales}</span>
                )}
              </div>

              <h1 className="font-headline font-bold text-xl text-on-surface">
                {user.prenom} {user.nom}
              </h1>
              <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-1">
                {user.poste ?? "Contributeur"}
              </p>

              {user.bio && (
                <p className="font-body text-xs text-on-surface-variant mt-3 leading-relaxed">
                  {user.bio}
                </p>
              )}

              {/* Stats */}
              <div className="mt-5 space-y-2.5 text-left border-t border-outline-variant/20 pt-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Projets</span>
                  <span className="text-sm font-label font-medium text-primary">
                    {allPublies.length} Campagne{allPublies.length > 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Ancienneté</span>
                  <span className="text-sm font-label font-medium text-primary">Depuis {anneeInscription}</span>
                </div>
                {user.pays && (
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-label uppercase tracking-wider text-on-surface-variant">Localisation</span>
                    <span className="text-sm font-body text-on-surface">{user.pays}</span>
                  </div>
                )}
              </div>

              {/* Réseaux sociaux */}
              {hasSocial && (
                <div className="flex justify-center gap-2 mt-4 pt-4 border-t border-outline-variant/20">
                  {user.linkedin_url && (
                    <a href={user.linkedin_url} target="_blank" rel="noopener noreferrer" title="LinkedIn"
                      className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
                    </a>
                  )}
                  {user.facebook_url && (
                    <a href={user.facebook_url} target="_blank" rel="noopener noreferrer" title="Facebook"
                      className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
                    </a>
                  )}
                  {user.x_url && (
                    <a href={user.x_url} target="_blank" rel="noopener noreferrer" title="X"
                      className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.744l7.737-8.835L1.255 2.25H8.08l4.253 5.622L18.244 2.25zm-1.161 17.52h1.833L7.084 4.126H5.117L17.083 19.77z"/></svg>
                    </a>
                  )}
                  {user.instagram_url && (
                    <a href={user.instagram_url} target="_blank" rel="noopener noreferrer" title="Instagram"
                      className="w-8 h-8 bg-surface-container rounded-lg flex items-center justify-center hover:bg-primary/10 transition-colors">
                      <svg className="w-4 h-4 text-on-surface-variant" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
                    </a>
                  )}
                </div>
              )}
            </div>

            {/* Filtres */}
            {allPublies.length > 1 && (secteurs.length > 1 || pays.length > 1 || occasions.length > 1 || annees.length > 1) && (
              <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
                <p className="text-xs font-label font-bold uppercase tracking-wider text-on-surface-variant">Filtres</p>
                <p className="text-xs font-body text-on-surface-variant mb-4 mt-0.5">Affiner la vue</p>

                <div className="space-y-1">
                  {secteurs.length > 1 && (
                    <FilterRow label="Secteur" value={filterSecteur} options={secteurs} onChange={setFilterSecteur} active={!!filterSecteur} />
                  )}
                  {pays.length > 1 && (
                    <FilterRow label="Pays" value={filterPays} options={pays} onChange={setFilterPays} active={!!filterPays} />
                  )}
                  {occasions.length > 1 && (
                    <FilterRow label="Occasion" value={filterOccasion} options={occasions} onChange={setFilterOccasion} active={!!filterOccasion} />
                  )}
                  {annees.length > 1 && (
                    <FilterRow label="Année" value={filterAnnee} options={annees} onChange={setFilterAnnee} active={!!filterAnnee} />
                  )}
                </div>

                {hasFilters && (
                  <button
                    onClick={() => { setFilterSecteur(""); setFilterPays(""); setFilterOccasion(""); setFilterAnnee(""); }}
                    className="text-xs font-label text-on-surface-variant hover:text-on-surface mt-4 transition-colors"
                  >
                    Effacer tout
                  </button>
                )}
              </div>
            )}
          </div>

          {/* ── ZONE PORTFOLIO ── */}
          <div className="flex-1 min-w-0">
            <div className="mb-8">
              <h2 className="font-headline font-bold text-4xl text-on-surface">Portfolio</h2>
              <p className="text-sm font-body text-on-surface-variant mt-1">
                {hasFilters ? `${filtered.length} campagne${filtered.length > 1 ? "s" : ""} filtrée${filtered.length > 1 ? "s" : ""}` : "Sélection de campagnes"}
              </p>
            </div>

            {allPublies.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-12 text-center">
                <p className="font-body text-on-surface-variant text-sm">
                  Aucune campagne publiée pour l&apos;instant.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-12 text-center">
                <p className="font-body text-on-surface-variant text-sm mb-3">Aucune campagne pour ces filtres.</p>
                <button onClick={() => { setFilterSecteur(""); setFilterPays(""); setFilterOccasion(""); setFilterAnnee(""); }} className="text-xs font-label text-primary hover:opacity-75">
                  Effacer les filtres
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {filtered.map((c) => (
                  <Link key={c._id} href={`/contenu/${c._id}`}>
                    <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-all hover:-translate-y-0.5 group cursor-pointer">
                      {/* Visuel */}
                      <div className="w-full aspect-video bg-surface-container relative overflow-hidden">
                        {c.visuel_url ? (
                          <Image
                            src={c.visuel_url}
                            alt={c.titre}
                            fill
                            className="object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="text-on-surface-variant/20 font-headline text-5xl">{c.marque.charAt(0)}</span>
                          </div>
                        )}
                      </div>

                      {/* Infos */}
                      <div className="p-5">
                        <div className="flex items-center gap-2 mb-3">
                          <span className="text-xs font-label font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase tracking-wide">
                            {c.secteur}
                          </span>
                          <span className="text-xs font-body text-on-surface-variant">{c.annee}</span>
                        </div>
                        <h3 className="font-headline font-bold text-xl text-on-surface group-hover:text-primary transition-colors mb-2 leading-tight">
                          {c.titre}
                        </h3>
                        <p className="text-sm font-body text-on-surface-variant line-clamp-2 leading-relaxed">
                          {c.intention_creative}
                        </p>
                        <p className="text-sm font-label font-medium text-primary mt-4">
                          Voir la campagne →
                        </p>
                      </div>
                    </article>
                  </Link>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>

      <Footer />
    </div>
  );
}

function FilterRow({
  label, value, options, onChange, active,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void; active: boolean;
}) {
  return (
    <button
      onClick={() => onChange(active ? "" : options[0])}
      className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-sm transition-colors ${active ? "bg-primary/10 text-primary font-label font-medium" : "text-on-surface-variant hover:bg-surface-container"}`}
    >
      <span className="font-label uppercase tracking-wider text-xs">{label}</span>
      {active && (
        <select
          value={value}
          onClick={(e) => e.stopPropagation()}
          onChange={(e) => onChange(e.target.value)}
          className="bg-transparent text-xs font-label text-primary focus:outline-none cursor-pointer"
        >
          {options.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      )}
    </button>
  );
}
