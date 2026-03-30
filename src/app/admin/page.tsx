"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useState } from "react";
import type { Id } from "../../../convex/_generated/dataModel";

const ADMIN_CLERK_IDS = ["user_3BdwM1zj0AouooF7nd79x3HWeoX"];

type Statut = "tous" | "publie" | "masque";
type Tri = "recent" | "vues" | "likes";

export default function AdminPage() {
  const { user } = useUser();
  const isAdmin = user && ADMIN_CLERK_IDS.includes(user.id);

  const [filtreStatut, setFiltreStatut] = useState<Statut>("tous");
  const [tri, setTri] = useState<Tri>("recent");

  const tousLesContenus = useQuery(api.contenus.listAll, {});
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

  const total = tousLesContenus?.length ?? 0;
  const nbPublies = tousLesContenus?.filter((c) => c.statut === "publie").length ?? 0;
  const nbMasques = tousLesContenus?.filter((c) => c.statut === "masque").length ?? 0;
  const totalVues = tousLesContenus?.reduce((sum, c) => sum + c.vues, 0) ?? 0;
  const totalLikes = tousLesContenus?.reduce((sum, c) => sum + (c.likes ?? 0), 0) ?? 0;

  let contenus = tousLesContenus ?? [];
  if (filtreStatut !== "tous") contenus = contenus.filter((c) => c.statut === filtreStatut);
  if (tri === "vues") contenus = [...contenus].sort((a, b) => b.vues - a.vues);
  if (tri === "likes") contenus = [...contenus].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));

  const statutLabel: Record<string, { label: string; style: string }> = {
    publie: { label: "Publié", style: "bg-green-50 text-green-700" },
    masque: { label: "Masqué", style: "bg-surface-container text-on-surface-variant" },
    rejete: { label: "Rejeté", style: "bg-error-container text-error" },
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-1">Administration</h1>
          <p className="font-body text-sm text-on-surface-variant">Vue d&apos;ensemble et modération</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-10">
          {[
            { label: "Total", value: total },
            { label: "Publiés", value: nbPublies },
            { label: "Masqués", value: nbMasques },
            { label: "Vues totales", value: totalVues.toLocaleString("fr") },
          ].map((s) => (
            <div key={s.label} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card text-center">
              <p className="font-headline font-bold text-2xl text-on-surface">{s.value}</p>
              <p className="text-xs font-label text-on-surface-variant mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Likes total */}
        <div className="bg-rose-50 rounded-2xl px-5 py-3 mb-8 flex items-center justify-between">
          <p className="text-sm font-body text-on-surface-variant">Likes totaux sur toutes les campagnes</p>
          <p className="font-headline font-bold text-xl text-rose-500">♥ {totalLikes}</p>
        </div>

        {/* Filtres + tri */}
        <div className="flex flex-wrap items-center gap-3 mb-6">
          {/* Filtre statut */}
          <div className="flex gap-1 bg-surface-container rounded-xl p-1">
            {(["tous", "publie", "masque"] as Statut[]).map((s) => (
              <button
                key={s}
                onClick={() => setFiltreStatut(s)}
                className={`text-xs font-label font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  filtreStatut === s
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {s === "tous" ? "Tous" : s === "publie" ? `Publiés (${nbPublies})` : `Masqués (${nbMasques})`}
              </button>
            ))}
          </div>

          {/* Tri */}
          <div className="flex gap-1 bg-surface-container rounded-xl p-1 ml-auto">
            {([
              { key: "recent", label: "Récents" },
              { key: "vues", label: "Vues" },
              { key: "likes", label: "♥ Likes" },
            ] as { key: Tri; label: string }[]).map((t) => (
              <button
                key={t.key}
                onClick={() => setTri(t.key)}
                className={`text-xs font-label font-medium px-3 py-1.5 rounded-lg transition-colors ${
                  tri === t.key
                    ? "bg-surface text-on-surface shadow-sm"
                    : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>
        </div>

        {/* Liste */}
        {contenus.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body text-on-surface-variant text-sm">Aucun contenu dans cette catégorie.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contenus.map((c) => (
              <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card flex gap-4 items-start">
                {/* Visuel */}
                <div className="w-16 h-16 rounded-xl bg-surface-container flex-shrink-0 relative overflow-hidden">
                  {c.visuel_url ? (
                    <Image src={c.visuel_url} alt={c.titre} fill className="object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="text-on-surface-variant/30 font-headline">{c.marque.charAt(0)}</span>
                    </div>
                  )}
                </div>

                {/* Infos */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <Link href={`/contenu/${c._id}`} className="font-headline font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
                      {c.titre}
                    </Link>
                    <span className={`text-xs font-label font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${statutLabel[c.statut]?.style}`}>
                      {statutLabel[c.statut]?.label}
                    </span>
                  </div>
                  <p className="text-xs font-body text-on-surface-variant">
                    {c.marque} · {c.pays} · {c.secteur} · {c.annee}
                  </p>
                  <p className="text-xs font-body text-on-surface-variant mt-0.5">
                    par {c.cm} · {c.vues} vue{c.vues > 1 ? "s" : ""} · ♥ {c.likes ?? 0}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {c.statut === "publie" ? (
                    <button
                      onClick={() => masquer({ id: c._id as Id<"contenus"> })}
                      className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
                    >
                      Masquer
                    </button>
                  ) : (
                    <button
                      onClick={() => republier({ id: c._id as Id<"contenus"> })}
                      className="text-xs font-label font-medium bg-green-50 text-green-700 px-3 py-1.5 rounded-xl hover:bg-green-100 transition-colors"
                    >
                      Republier
                    </button>
                  )}
                  <button
                    onClick={() => {
                      if (confirm(`Supprimer "${c.titre}" définitivement ?`)) {
                        supprimer({ id: c._id as Id<"contenus"> });
                      }
                    }}
                    className="text-xs font-label font-medium bg-error-container text-error px-3 py-1.5 rounded-xl hover:opacity-80 transition-opacity"
                  >
                    Supprimer
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
