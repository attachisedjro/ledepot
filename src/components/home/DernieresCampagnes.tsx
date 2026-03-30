"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";
import Image from "next/image";

export default function DernieresCampagnes() {
  const contenus = useQuery(api.contenus.list, {});
  const derniers = contenus?.slice(0, 4);

  if (contenus === undefined) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-surface-container rounded-2xl overflow-hidden animate-pulse">
            <div className="w-full aspect-[4/5] bg-surface-container-high" />
            <div className="p-4 space-y-2">
              <div className="h-3 bg-surface-container-high rounded w-2/3" />
              <div className="h-4 bg-surface-container-high rounded w-full" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!derniers || derniers.length === 0) {
    return (
      <div className="text-center py-12 text-on-surface-variant font-body text-sm">
        Aucune campagne publiée pour l&apos;instant.{" "}
        <Link href="/soumettre" className="text-primary hover:underline">
          Sois le premier à soumettre.
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {derniers.map((c) => (
        <Link key={c._id} href={`/contenu/${c._id}`}>
          <article className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-all hover:-translate-y-0.5 group cursor-pointer">
            <div className="w-full aspect-[4/5] bg-surface-container relative overflow-hidden">
              {c.visuel_url ? (
                <Image
                  src={c.visuel_url}
                  alt={c.titre}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-on-surface-variant/30 font-headline text-4xl">
                    {c.marque.charAt(0)}
                  </span>
                </div>
              )}
              <span className="absolute bottom-3 left-3 text-white text-xs font-label font-medium bg-black/25 px-2 py-1 rounded-full">
                {c.pays}
              </span>
            </div>
            <div className="p-4">
              <p className="text-xs font-label text-on-surface-variant mb-1 truncate">
                {c.marque} · {c.secteur}
              </p>
              <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2">
                {c.titre}
              </h3>
              <p className="text-xs font-body text-on-surface-variant mt-2">
                par {c.cm}
              </p>
            </div>
          </article>
        </Link>
      ))}
    </div>
  );
}
