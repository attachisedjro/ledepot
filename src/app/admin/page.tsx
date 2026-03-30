"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

const ADMIN_CLERK_IDS = ["user_3BfUEKIgwgcZ97tshB4NIVjEtag"];

type Statut = "tous" | "publie" | "masque";
type Tri = "recent" | "vues" | "likes";

function KpiCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
      <p className="text-xs font-label text-on-surface-variant mb-1">{label}</p>
      <p className="font-headline font-bold text-2xl text-on-surface">{value}</p>
      {sub && <p className="text-xs font-body text-on-surface-variant mt-0.5">{sub}</p>}
    </div>
  );
}

export default function AdminPage() {
  const { user } = useUser();
  const isAdmin = user && ADMIN_CLERK_IDS.includes(user.id);

  const [filtreStatut, setFiltreStatut] = useState<Statut>("tous");
  const [tri, setTri] = useState<Tri>("recent");
  const [section, setSection] = useState<"overview" | "moderation">("overview");

  const tousLesContenus = useQuery(api.contenus.listAll, {});
  const tousLesUsers = useQuery(api.users.listAll, {});
  const masquer = useMutation(api.contenus.masquer);
  const republier = useMutation(api.contenus.republier);
  const supprimer = useMutation(api.contenus.supprimer);

  if (!user) return null;

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-surface flex items-center justify-center">
        <Navbar />
        <div className="text-center">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">Accès refusé</h1>
          <p className="font-body text-sm text-on-surface-variant">Cette page est réservée aux administrateurs.</p>
          <p className="text-xs font-label text-on-surface-variant mt-4 bg-surface-container px-4 py-2 rounded-xl inline-block">
            Ton Clerk ID : <span className="font-medium text-primary">{user.id}</span>
          </p>
        </div>
      </div>
    );
  }

  // ── Stats globales ──
  const contenus = tousLesContenus ?? [];
  const publiés = contenus.filter((c) => c.statut === "publie");
  const masqués = contenus.filter((c) => c.statut === "masque");
  const totalVues = contenus.reduce((s, c) => s + c.vues, 0);
  const totalLikes = contenus.reduce((s, c) => s + (c.likes ?? 0), 0);
  const nbCMs = tousLesUsers?.length ?? 0;

  // ── Récents (5 derniers) ──
  const recents = contenus.slice(0, 5);

  // ── Top campagnes ──
  const topVues = [...publiés].sort((a, b) => b.vues - a.vues).slice(0, 5);
  const topLikes = [...publiés].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0)).slice(0, 5);

  // ── Top contributeurs ──
  const contribMap = new Map<string, { cm: string; userId: string; campagnes: number; vues: number; likes: number }>();
  for (const c of publiés) {
    const key = c.userId;
    const existing = contribMap.get(key);
    if (existing) {
      existing.campagnes++;
      existing.vues += c.vues;
      existing.likes += c.likes ?? 0;
    } else {
      contribMap.set(key, {
        cm: c.cm,
        userId: c.userId,
        campagnes: 1,
        vues: c.vues,
        likes: c.likes ?? 0,
      });
    }
  }
  const topContribs = Array.from(contribMap.values())
    .sort((a, b) => b.campagnes - a.campagnes || b.vues - a.vues)
    .slice(0, 8);

  // ── Modération ──
  let modContenus = contenus;
  if (filtreStatut !== "tous") modContenus = modContenus.filter((c) => c.statut === filtreStatut);
  if (tri === "vues") modContenus = [...modContenus].sort((a, b) => b.vues - a.vues);
  if (tri === "likes") modContenus = [...modContenus].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  const statutStyle: Record<string, string> = {
    publie: "bg-green-50 text-green-700",
    masque: "bg-surface-container text-on-surface-variant",
    rejete: "bg-error-container text-error",
  };
  const statutLabel: Record<string, string> = {
    publie: "Publié", masque: "Masqué", rejete: "Rejeté",
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-headline font-bold text-4xl text-on-surface mb-1">Dashboard</h1>
            <p className="font-body text-sm text-on-surface-variant">Vue d&apos;ensemble · Le Dépôt</p>
          </div>
          <div className="flex gap-1 bg-surface-container rounded-xl p-1">
            <button
              onClick={() => setSection("overview")}
              className={`text-sm font-label font-medium px-4 py-2 rounded-lg transition-colors ${section === "overview" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Vue générale
            </button>
            <button
              onClick={() => setSection("moderation")}
              className={`text-sm font-label font-medium px-4 py-2 rounded-lg transition-colors ${section === "moderation" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
            >
              Modération {masqués.length > 0 && <span className="ml-1 bg-error text-white text-xs px-1.5 py-0.5 rounded-full">{masqués.length}</span>}
            </button>
          </div>
        </div>

        {section === "overview" && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              <KpiCard label="Campagnes totales" value={contenus.length} />
              <KpiCard label="Publiées" value={publiés.length} />
              <KpiCard label="Masquées" value={masqués.length} />
              <KpiCard label="CMs inscrits" value={nbCMs} />
              <KpiCard label="Vues totales" value={totalVues.toLocaleString("fr")} />
              <KpiCard label="Likes totaux" value={`♥ ${totalLikes}`} />
            </div>

            {/* Activité récente */}
            <div className="mb-10">
              <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Dernières soumissions</h2>
              <div className="space-y-2">
                {recents.length === 0 ? (
                  <p className="text-sm font-body text-on-surface-variant">Aucune campagne.</p>
                ) : recents.map((c) => (
                  <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-3 shadow-card flex gap-3 items-center">
                    <div className="w-10 h-10 rounded-xl bg-surface-container flex-shrink-0 relative overflow-hidden">
                      {c.visuel_url ? (
                        <Image src={c.visuel_url} alt={c.titre} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-on-surface-variant/30 font-headline text-sm">{c.marque.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <Link href={`/contenu/${c._id}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
                        {c.titre}
                      </Link>
                      <p className="text-xs text-on-surface-variant">{c.marque} · {c.pays} · par {c.cm}</p>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <span className="text-xs text-on-surface-variant">{c.vues} vues</span>
                      <span className={`text-xs font-label font-medium px-2 py-0.5 rounded-full ${statutStyle[c.statut]}`}>
                        {statutLabel[c.statut]}
                      </span>
                      {c.statut === "publie" ? (
                        <button onClick={() => masquer({ id: c._id as Id<"contenus"> })} className="text-xs font-label text-on-surface-variant bg-surface-container px-2 py-1 rounded-lg hover:bg-surface-container-high transition-colors">
                          Masquer
                        </button>
                      ) : (
                        <button onClick={() => republier({ id: c._id as Id<"contenus"> })} className="text-xs font-label text-green-700 bg-green-50 px-2 py-1 rounded-lg hover:bg-green-100 transition-colors">
                          Republier
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Top campagnes */}
            <div className="grid md:grid-cols-2 gap-6 mb-10">
              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Top 5 · Vues</h2>
                <div className="space-y-2">
                  {topVues.length === 0 ? <p className="text-sm text-on-surface-variant">Aucune donnée.</p> : topVues.map((c, i) => (
                    <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-3 shadow-card flex gap-3 items-center">
                      <span className="text-xs font-label font-bold text-on-surface-variant w-5 text-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/contenu/${c._id}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
                          {c.titre}
                        </Link>
                        <p className="text-xs text-on-surface-variant">{c.marque} · {c.pays}</p>
                      </div>
                      <span className="text-sm font-label font-bold text-primary flex-shrink-0">{c.vues.toLocaleString("fr")}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Top 5 · Likes</h2>
                <div className="space-y-2">
                  {topLikes.length === 0 ? <p className="text-sm text-on-surface-variant">Aucune donnée.</p> : topLikes.map((c, i) => (
                    <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-3 shadow-card flex gap-3 items-center">
                      <span className="text-xs font-label font-bold text-on-surface-variant w-5 text-center flex-shrink-0">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <Link href={`/contenu/${c._id}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
                          {c.titre}
                        </Link>
                        <p className="text-xs text-on-surface-variant">{c.marque} · {c.pays}</p>
                      </div>
                      <span className="text-sm font-label font-bold text-rose-500 flex-shrink-0">♥ {c.likes ?? 0}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Top contributeurs */}
            <div>
              <h2 className="font-headline font-bold text-xl text-on-surface mb-4">Top contributeurs</h2>
              {topContribs.length === 0 ? (
                <p className="text-sm text-on-surface-variant">Aucun contributeur.</p>
              ) : (
                <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-outline-variant/20">
                        <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">#</th>
                        <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Community Manager</th>
                        <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Campagnes</th>
                        <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Vues</th>
                        <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Likes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topContribs.map((c, i) => (
                        <tr key={c.userId} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/50 transition-colors">
                          <td className="text-xs font-label text-on-surface-variant px-4 py-3">{i + 1}</td>
                          <td className="px-4 py-3">
                            <Link href={`/profil/${c.userId}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors">
                              {c.cm}
                            </Link>
                          </td>
                          <td className="text-right text-sm font-label font-bold text-on-surface px-4 py-3">{c.campagnes}</td>
                          <td className="text-right text-sm font-body text-on-surface-variant px-4 py-3">{c.vues.toLocaleString("fr")}</td>
                          <td className="text-right text-sm font-body text-rose-500 px-4 py-3">♥ {c.likes}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}

        {section === "moderation" && (
          <>
            {/* Filtres + tri */}
            <div className="flex flex-wrap items-center gap-3 mb-6">
              <div className="flex gap-1 bg-surface-container rounded-xl p-1">
                {(["tous", "publie", "masque"] as Statut[]).map((s) => (
                  <button
                    key={s}
                    onClick={() => setFiltreStatut(s)}
                    className={`text-xs font-label font-medium px-3 py-1.5 rounded-lg transition-colors ${filtreStatut === s ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    {s === "tous" ? `Tous (${contenus.length})` : s === "publie" ? `Publiés (${publiés.length})` : `Masqués (${masqués.length})`}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 bg-surface-container rounded-xl p-1 ml-auto">
                {([{ key: "recent", label: "Récents" }, { key: "vues", label: "Vues" }, { key: "likes", label: "♥ Likes" }] as { key: Tri; label: string }[]).map((t) => (
                  <button
                    key={t.key}
                    onClick={() => setTri(t.key)}
                    className={`text-xs font-label font-medium px-3 py-1.5 rounded-lg transition-colors ${tri === t.key ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
            </div>

            {modContenus.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-12 text-center">
                <p className="font-body text-on-surface-variant text-sm">Aucun contenu dans cette catégorie.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {modContenus.map((c) => (
                  <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card flex gap-4 items-start">
                    <div className="w-14 h-14 rounded-xl bg-surface-container flex-shrink-0 relative overflow-hidden">
                      {c.visuel_url ? (
                        <Image src={c.visuel_url} alt={c.titre} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-on-surface-variant/30 font-headline">{c.marque.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                        <Link href={`/contenu/${c._id}`} className="font-headline font-bold text-sm text-on-surface hover:text-primary transition-colors line-clamp-1">
                          {c.titre}
                        </Link>
                        <span className={`text-xs font-label font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statutStyle[c.statut]}`}>
                          {statutLabel[c.statut]}
                        </span>
                      </div>
                      <p className="text-xs font-body text-on-surface-variant">{c.marque} · {c.pays} · {c.secteur} · {c.annee}</p>
                      <p className="text-xs font-body text-on-surface-variant mt-0.5">par {c.cm} · {c.vues} vue{c.vues > 1 ? "s" : ""} · ♥ {c.likes ?? 0}</p>
                    </div>
                    <div className="flex flex-col gap-2 flex-shrink-0">
                      {c.statut === "publie" ? (
                        <button onClick={() => masquer({ id: c._id as Id<"contenus"> })} className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-colors">
                          Masquer
                        </button>
                      ) : (
                        <button onClick={() => republier({ id: c._id as Id<"contenus"> })} className="text-xs font-label font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors">
                          Republier
                        </button>
                      )}
                      <button
                        onClick={() => { if (confirm(`Supprimer "${c.titre}" définitivement ?`)) supprimer({ id: c._id as Id<"contenus"> }); }}
                        className="text-xs font-label font-medium bg-error-container text-error px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
                      >
                        Supprimer
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
