"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export default function TendancesPage() {
  const [tri, setTri] = useState<"vues" | "likes">("vues");
  const [semaine, setSemaine] = useState(false);

  const contenus = useQuery(api.contenus.list, {});

  const SEPT_JOURS = 7 * 24 * 60 * 60 * 1000;

  let liste = contenus ?? [];
  if (semaine) {
    const cutoff = Date.now() - SEPT_JOURS;
    liste = liste.filter(c => c._creationTime >= cutoff);
  }
  liste = [...liste].sort((a, b) =>
    tri === "vues" ? b.vues - a.vues : (b.likes ?? 0) - (a.likes ?? 0)
  ).slice(0, 20);

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />
      <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <h1 className="font-headline font-bold text-4xl text-on-surface mb-1">Tendances</h1>
            <p className="font-body text-sm text-on-surface-variant">Les campagnes qui font le buzz</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSemaine(v => !v)}
              className={`text-xs font-label font-medium px-3 py-1.5 rounded-xl transition-colors ${semaine ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
            >
              Cette semaine
            </button>
            <div className="flex gap-1 bg-surface-container rounded-xl p-1">
              {(["vues", "likes"] as const).map(t => (
                <button
                  key={t}
                  onClick={() => setTri(t)}
                  className={`text-xs font-label font-medium px-3 py-1.5 rounded-lg transition-colors ${tri === t ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
                >
                  {t === "vues" ? "👁 Vues" : "♥ Likes"}
                </button>
              ))}
            </div>
          </div>
        </div>

        {contenus === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-surface-container-high" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-surface-container-high rounded w-2/3" />
                  <div className="h-4 bg-surface-container-high rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : liste.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-headline font-bold text-2xl text-on-surface mb-2">Aucune campagne cette semaine</p>
            <p className="font-body text-sm text-on-surface-variant">
              <button onClick={() => setSemaine(false)} className="text-primary hover:underline">Voir toutes les tendances</button>
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {liste.map((c, i) => (
              <Link key={c._id} href={`/contenu/${c._id}`}>
                <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-all hover:-translate-y-0.5 group cursor-pointer relative">
                  {i < 3 && (
                    <div className="absolute top-3 right-3 z-10 w-7 h-7 bg-primary text-on-primary font-headline font-bold text-sm rounded-full flex items-center justify-center shadow">
                      {i + 1}
                    </div>
                  )}
                  <div className="w-full aspect-[4/5] bg-surface-container relative overflow-hidden">
                    {c.visuel_url ? (
                      <Image src={c.visuel_url} alt={c.titre} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="text-on-surface-variant/30 font-headline text-4xl">{c.marque.charAt(0)}</span>
                      </div>
                    )}
                    <span className="absolute bottom-3 left-3 text-white text-xs font-label font-medium bg-black/25 px-2 py-1 rounded-full">{c.pays}</span>
                  </div>
                  <div className="p-4">
                    <p className="text-xs font-label text-on-surface-variant mb-1 truncate">{c.marque} · {c.secteur}</p>
                    <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2">{c.titre}</h3>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="text-xs font-body text-on-surface-variant">👁 {c.vues.toLocaleString("fr")}</span>
                      {(c.likes ?? 0) > 0 && <span className="text-xs font-body text-rose-400">♥ {c.likes}</span>}
                    </div>
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
