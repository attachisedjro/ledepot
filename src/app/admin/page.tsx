"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import type { Id } from "../../../convex/_generated/dataModel";

// Liste des clerkId admins — à remplacer par ton vrai ID Clerk
const ADMIN_CLERK_IDS = ["user_3BdwM1zj0AouooF7nd79x3HWeoX"];

export default function AdminPage() {
  const { user } = useUser();
  const isAdmin = user && ADMIN_CLERK_IDS.includes(user.id);

  const tousLesContenus = useQuery(api.contenus.list, {});
  const masquer = useMutation(api.contenus.masquer);
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

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-5xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-2">Administration</h1>
          <p className="font-body text-sm text-on-surface-variant">
            {tousLesContenus?.length ?? "..."} contenu{(tousLesContenus?.length ?? 0) > 1 ? "s" : ""} publiés
          </p>
        </div>

        {!tousLesContenus || tousLesContenus.length === 0 ? (
          <div className="bg-surface-container rounded-2xl p-12 text-center">
            <p className="font-body text-on-surface-variant text-sm">Aucun contenu publié pour l&apos;instant.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tousLesContenus.map((c) => (
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
                  <Link href={`/contenu/${c._id}`} className="font-headline font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
                    {c.titre}
                  </Link>
                  <p className="text-xs font-body text-on-surface-variant mt-0.5">
                    {c.marque} · {c.pays} · {c.secteur} · {c.annee}
                  </p>
                  <p className="text-xs font-body text-on-surface-variant mt-0.5">
                    par {c.cm} · {c.vues} vue{c.vues > 1 ? "s" : ""}
                  </p>
                </div>

                {/* Actions */}
                <div className="flex gap-2 flex-shrink-0">
                  <button
                    onClick={() => masquer({ id: c._id as Id<"contenus"> })}
                    className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    Masquer
                  </button>
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
