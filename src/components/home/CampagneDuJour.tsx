"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Link from "next/link";

export default function CampagneDuJour() {
  const campagne = useQuery(api.contenus.getCampagneDuJour);

  if (!campagne) return null;

  return (
    <Link href={`/contenu/${campagne.slug ?? campagne._id}`} className="block group">
      <div className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-ambient hover:shadow-card transition-all hover:-translate-y-0.5">
        {campagne.visuel_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={campagne.visuel_url}
            alt={campagne.titre}
            className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-500"
          />
        )}
        <div className="p-4">
          <p className="text-xs font-label font-bold text-primary uppercase tracking-wider mb-1">
            Campagne du jour
          </p>
          <p className="text-xs font-body text-on-surface-variant mb-1">
            {campagne.marque} · {campagne.pays}
          </p>
          <h3 className="font-headline font-bold text-lg text-on-surface group-hover:text-primary transition-colors leading-tight line-clamp-2">
            {campagne.titre}
          </h3>
          <p className="text-xs font-body text-on-surface-variant mt-2 line-clamp-2 leading-relaxed">
            {campagne.intention_creative}
          </p>
          <p className="text-xs font-label font-medium text-primary mt-3">
            Voir la campagne →
          </p>
        </div>
      </div>
    </Link>
  );
}
