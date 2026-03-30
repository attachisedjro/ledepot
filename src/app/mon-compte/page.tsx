"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];

export default function MonComptePage() {
  const { user } = useUser();

  const userProfile = useQuery(
    api.users.getByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const upsertUser = useMutation(api.users.upsertUser);
  const updateProfile = useMutation(api.users.updateProfile);

  const contenus = useQuery(
    api.contenus.getByUser,
    userProfile ? { userId: userProfile._id } : "skip"
  );

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", pays: "", bio: "", linkedin_url: "" });
  const [saving, setSaving] = useState(false);

  // Crée le profil si inexistant
  useEffect(() => {
    if (user && userProfile === null) {
      upsertUser({
        clerkId: user.id,
        nom: user.lastName ?? "",
        prenom: user.firstName ?? "",
      });
    }
  }, [user, userProfile, upsertUser]);

  // Pré-remplit le formulaire
  useEffect(() => {
    if (userProfile) {
      setForm({
        nom: userProfile.nom,
        prenom: userProfile.prenom,
        pays: userProfile.pays ?? "",
        bio: userProfile.bio ?? "",
        linkedin_url: userProfile.linkedin_url ?? "",
      });
    }
  }, [userProfile]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateProfile({
      clerkId: user.id,
      nom: form.nom,
      prenom: form.prenom,
      pays: form.pays || undefined,
      bio: form.bio || undefined,
      linkedin_url: form.linkedin_url || undefined,
    });
    setSaving(false);
    setEditing(false);
  };

  if (!user || userProfile === undefined) {
    return (
      <div className="min-h-screen bg-surface">
        <Navbar />
        <div className="pt-32 px-6 max-w-4xl mx-auto animate-pulse space-y-4">
          <div className="h-8 bg-surface-container rounded w-1/4" />
          <div className="h-32 bg-surface-container rounded-2xl" />
        </div>
      </div>
    );
  }

  const statuts: Record<string, string> = {
    publie: "Publié",
    masque: "Masqué",
    rejete: "Rejeté",
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="font-headline font-bold text-4xl text-on-surface mb-10">Mon compte</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar profil */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card">
              <div className="w-16 h-16 rounded-2xl bg-surface-container flex items-center justify-center mb-4">
                <span className="font-headline font-bold text-2xl text-primary">
                  {(userProfile?.prenom ?? user.firstName ?? "?").charAt(0)}
                  {(userProfile?.nom ?? user.lastName ?? "").charAt(0)}
                </span>
              </div>

              {editing ? (
                <div className="space-y-3">
                  <input
                    value={form.prenom}
                    onChange={(e) => setForm((f) => ({ ...f, prenom: e.target.value }))}
                    placeholder="Prénom"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={form.nom}
                    onChange={(e) => setForm((f) => ({ ...f, nom: e.target.value }))}
                    placeholder="Nom"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <select
                    value={form.pays}
                    onChange={(e) => setForm((f) => ({ ...f, pays: e.target.value }))}
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none"
                  >
                    <option value="">Pays</option>
                    {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
                  </select>
                  <textarea
                    value={form.bio}
                    onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))}
                    placeholder="Bio courte (250 car. max)"
                    maxLength={250}
                    rows={3}
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                  />
                  <input
                    value={form.linkedin_url}
                    onChange={(e) => setForm((f) => ({ ...f, linkedin_url: e.target.value }))}
                    placeholder="URL LinkedIn (optionnel)"
                    type="url"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="flex-1 btn-gradient text-white text-sm font-label font-medium py-2.5 rounded-xl disabled:opacity-60"
                    >
                      {saving ? "..." : "Sauvegarder"}
                    </button>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-4 bg-surface-container text-on-surface text-sm font-label rounded-xl"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="font-headline font-bold text-xl text-on-surface">
                    {userProfile?.prenom} {userProfile?.nom}
                  </h2>
                  {userProfile?.pays && (
                    <p className="text-xs font-body text-on-surface-variant mt-1">{userProfile.pays}</p>
                  )}
                  {userProfile?.bio && (
                    <p className="text-sm font-body text-on-surface mt-3 leading-relaxed">{userProfile.bio}</p>
                  )}
                  {userProfile?.linkedin_url && (
                    <a href={userProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs font-label text-primary mt-2 block hover:opacity-75">
                      LinkedIn →
                    </a>
                  )}
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 w-full bg-surface-container text-sm font-label font-medium text-on-surface py-2.5 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    Modifier le profil
                  </button>
                  {userProfile && (
                    <Link
                      href={`/profil/${userProfile._id}`}
                      className="mt-2 w-full bg-surface-container text-sm font-label font-medium text-on-surface-variant py-2.5 rounded-xl hover:bg-surface-container-high transition-colors block text-center"
                    >
                      Voir mon profil public
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="bg-surface-container p-4 rounded-2xl text-center">
              <p className="font-headline font-bold text-3xl text-on-surface">{contenus?.filter(c => c.statut === "publie").length ?? 0}</p>
              <p className="text-xs font-label text-on-surface-variant mt-1">campagne{(contenus?.filter(c => c.statut === "publie").length ?? 0) > 1 ? "s" : ""} publiée{(contenus?.filter(c => c.statut === "publie").length ?? 0) > 1 ? "s" : ""}</p>
            </div>

            <Link
              href="/soumettre"
              className="btn-gradient text-white text-sm font-label font-medium py-3 rounded-xl text-center block hover:opacity-90 transition-opacity"
            >
              + Soumettre une campagne
            </Link>
          </div>

          {/* Mes soumissions */}
          <div className="md:col-span-2">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-6">Mes soumissions</h2>

            {!contenus || contenus.length === 0 ? (
              <div className="bg-surface-container rounded-2xl p-12 text-center">
                <p className="font-body text-on-surface-variant text-sm mb-4">
                  Tu n&apos;as pas encore soumis de campagne.
                </p>
                <Link href="/soumettre" className="text-sm font-label font-medium text-primary hover:opacity-75">
                  Soumettre ma première campagne →
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {contenus.map((c) => (
                  <div key={c._id} className="bg-surface-container-lowest rounded-2xl p-4 shadow-card flex gap-4 items-start">
                    <div className="w-16 h-16 rounded-xl bg-surface-container flex-shrink-0 relative overflow-hidden">
                      {c.visuel_url ? (
                        <Image src={c.visuel_url} alt={c.titre} fill className="object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <span className="text-on-surface-variant/30 font-headline">{c.marque.charAt(0)}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <Link href={`/contenu/${c._id}`} className="font-headline font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
                          {c.titre}
                        </Link>
                        <span className={`text-xs font-label font-medium px-2 py-0.5 rounded-full flex-shrink-0 ${
                          c.statut === "publie" ? "bg-green-50 text-green-700" :
                          c.statut === "masque" ? "bg-surface-container text-on-surface-variant" :
                          "bg-error-container text-error"
                        }`}>
                          {statuts[c.statut]}
                        </span>
                      </div>
                      <p className="text-xs font-body text-on-surface-variant mt-1">{c.marque} · {c.pays} · {c.annee}</p>
                      <p className="text-xs font-body text-on-surface-variant mt-1">{c.vues} vue{c.vues > 1 ? "s" : ""}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
