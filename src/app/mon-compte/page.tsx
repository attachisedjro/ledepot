"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import Navbar from "@/components/layout/Navbar";

import type { Id } from "../../../convex/_generated/dataModel";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS_LIST = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Immobilier", "Santé / Pharmacie", "Éducation / EdTech", "Transport / Mobilité", "Énergie / Solaire", "Agriculture / Agro-industrie", "Assurance", "E-commerce / Marketplace", "Tech / Startups", "Autre"];
const OCCASIONS_LIST = ["Saint-Valentin", "Fête des mères", "Fête des pères", "Fête nationale", "Rentrée scolaire", "Noël", "Lancement produit", "Ramadan", "Korité / Aïd el-Fitr", "Tabaski / Aïd el-Kébir", "Pâques", "Fête du travail", "Journée internationale des droits des femmes", "Journée internationale de la jeunesse", "Black Friday / Cyber Monday", "Journée mondiale de l'environnement", "Anniversaire de marque", "Autre"];
const FORMATS_LIST = ["Image statique", "Carrousel", "Vidéo", "Reel", "Story", "Autre"];

function getBadge(nb: number): { label: string; style: string } | null {
  if (nb >= 10) return { label: "Expert", style: "bg-amber-100 text-amber-800" };
  if (nb >= 3) return { label: "Contributeur", style: "bg-primary/10 text-primary" };
  if (nb >= 1) return { label: "Débutant", style: "bg-surface-container text-on-surface-variant" };
  return null;
}

export default function MonComptePage() {
  const { user } = useUser();
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const userProfile = useQuery(
    api.users.getByClerkId,
    user ? { clerkId: user.id } : "skip"
  );

  const upsertUser = useMutation(api.users.upsertUser);
  const updateProfile = useMutation(api.users.updateProfile);
  const generateAvatarUploadUrl = useMutation(api.users.generateAvatarUploadUrl);
  const updateContenu = useMutation(api.contenus.updateContenu);

  const contenus = useQuery(
    api.contenus.getByUser,
    userProfile ? { userId: userProfile._id } : "skip"
  );

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({ nom: "", prenom: "", poste: "", pays: "", bio: "", linkedin_url: "", facebook_url: "", x_url: "", instagram_url: "" });
  const [saving, setSaving] = useState(false);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [editingId, setEditingId] = useState<Id<"contenus"> | null>(null);
  const [editForm, setEditForm] = useState({ titre: "", marque: "", agence_creative: "", pays: "", secteur: "", occasion: "", format: "", annee: "", lien_publication: "", intention_creative: "", type_contenu: "", anonyme: false });
  const [editSaving, setEditSaving] = useState(false);

  // Crée le profil si inexistant, ou met à jour l'email si manquant
  useEffect(() => {
    if (!user || userProfile === undefined) return;
    if (userProfile === null) {
      upsertUser({
        clerkId: user.id,
        nom: user.lastName ?? "",
        prenom: user.firstName ?? "",
        email: user.primaryEmailAddress?.emailAddress,
      });
    } else if (!userProfile.email && user.primaryEmailAddress?.emailAddress) {
      upsertUser({
        clerkId: user.id,
        nom: userProfile.nom,
        prenom: userProfile.prenom,
        email: user.primaryEmailAddress.emailAddress,
      });
    }
  }, [user, userProfile, upsertUser]);

  // Pré-remplit le formulaire
  useEffect(() => {
    if (userProfile) {
      setForm({
        nom: userProfile.nom,
        prenom: userProfile.prenom,
        poste: userProfile.poste ?? "",
        pays: userProfile.pays ?? "",
        bio: userProfile.bio ?? "",
        linkedin_url: userProfile.linkedin_url ?? "",
        facebook_url: userProfile.facebook_url ?? "",
        x_url: userProfile.x_url ?? "",
        instagram_url: userProfile.instagram_url ?? "",
      });
    }
  }, [userProfile]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;
    if (file.size > 3 * 1024 * 1024) return; // 3MB max

    setAvatarUploading(true);
    try {
      const uploadUrl = await generateAvatarUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();

      await updateProfile({
        clerkId: user.id,
        nom: userProfile?.nom ?? user.lastName ?? "",
        prenom: userProfile?.prenom ?? user.firstName ?? "",
        pays: userProfile?.pays,
        bio: userProfile?.bio,
        linkedin_url: userProfile?.linkedin_url,
        facebook_url: userProfile?.facebook_url,
        x_url: userProfile?.x_url,
        instagram_url: userProfile?.instagram_url,
        avatar_storage_id: storageId,
      });
    } finally {
      setAvatarUploading(false);
    }
  };

  const startEditing = useCallback((c: { _id: Id<"contenus">; titre: string; marque: string; agence_creative?: string; pays: string; secteur: string; occasion: string; format: string; annee: string; lien_publication: string; intention_creative: string; type_contenu?: string; anonyme?: boolean }) => {
    setEditingId(c._id);
    setEditForm({
      titre: c.titre,
      marque: c.marque,
      agence_creative: c.agence_creative ?? "",
      pays: c.pays,
      secteur: c.secteur,
      occasion: c.occasion,
      format: c.format,
      annee: c.annee,
      lien_publication: c.lien_publication,
      intention_creative: c.intention_creative,
      type_contenu: c.type_contenu ?? "",
      anonyme: c.anonyme ?? false,
    });
  }, []);

  const handleEditSave = async () => {
    if (!user || !editingId) return;
    setEditSaving(true);
    await updateContenu({
      id: editingId,
      clerkId: user.id,
      titre: editForm.titre,
      marque: editForm.marque,
      agence_creative: editForm.agence_creative || undefined,
      pays: editForm.pays,
      secteur: editForm.secteur,
      occasion: editForm.occasion,
      format: editForm.format,
      annee: editForm.annee,
      lien_publication: editForm.lien_publication,
      intention_creative: editForm.intention_creative,
      type_contenu: editForm.type_contenu || undefined,
      anonyme: editForm.anonyme,
    });
    setEditSaving(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    await updateProfile({
      clerkId: user.id,
      nom: form.nom,
      prenom: form.prenom,
      pays: form.pays || undefined,
      bio: form.bio || undefined,
      poste: form.poste || undefined,
      linkedin_url: form.linkedin_url || undefined,
      facebook_url: form.facebook_url || undefined,
      x_url: form.x_url || undefined,
      instagram_url: form.instagram_url || undefined,
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

  const initiales = `${(userProfile?.prenom ?? user.firstName ?? "?").charAt(0)}${(userProfile?.nom ?? user.lastName ?? "").charAt(0)}`;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-4xl mx-auto">
        <h1 className="font-headline font-bold text-4xl text-on-surface mb-10">Mon compte</h1>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar profil */}
          <div className="md:col-span-1 space-y-4">
            <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card">
              {/* Avatar cliquable */}
              <div className="relative w-16 h-16 mb-4 group">
                <button
                  type="button"
                  onClick={() => avatarInputRef.current?.click()}
                  className="w-16 h-16 rounded-2xl overflow-hidden bg-surface-container flex items-center justify-center relative"
                  title="Changer la photo"
                >
                  {userProfile?.avatar_url ? (
                    <Image
                      src={userProfile.avatar_url}
                      alt={initiales}
                      fill
                      className="object-cover"
                    />
                  ) : (
                    <span className="font-headline font-bold text-2xl text-primary">
                      {initiales}
                    </span>
                  )}
                  {/* Overlay au hover */}
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center rounded-2xl">
                    <span className="text-white text-xs font-label">Photo</span>
                  </div>
                  {avatarUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center rounded-2xl">
                      <span className="text-white text-xs">...</span>
                    </div>
                  )}
                </button>
                <input
                  ref={avatarInputRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
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
                  <input
                    value={form.poste}
                    onChange={(e) => setForm((f) => ({ ...f, poste: e.target.value }))}
                    placeholder="Poste actuel (ex: Responsable communication)"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
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
                  <input
                    value={form.facebook_url}
                    onChange={(e) => setForm((f) => ({ ...f, facebook_url: e.target.value }))}
                    placeholder="URL Facebook (optionnel)"
                    type="url"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={form.x_url}
                    onChange={(e) => setForm((f) => ({ ...f, x_url: e.target.value }))}
                    placeholder="URL X / Twitter (optionnel)"
                    type="url"
                    className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  <input
                    value={form.instagram_url}
                    onChange={(e) => setForm((f) => ({ ...f, instagram_url: e.target.value }))}
                    placeholder="URL Instagram (optionnel)"
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
                  {userProfile?.poste && (
                    <p className="text-xs font-label uppercase tracking-widest text-on-surface-variant mt-0.5">{userProfile.poste}</p>
                  )}
                  {userProfile?.pays && (
                    <p className="text-xs font-body text-on-surface-variant mt-1">{userProfile.pays}</p>
                  )}
                  {(() => {
                    const publishedCount = contenus?.filter(c => c.statut === "publie").length ?? 0;
                    const badge = getBadge(publishedCount);
                    return badge ? (
                      <div className="mt-2">
                        <span className={`text-xs font-label font-medium px-3 py-1 rounded-full ${badge.style}`}>
                          {badge.label}
                        </span>
                      </div>
                    ) : null;
                  })()}
                  {userProfile?.bio && (
                    <p className="text-sm font-body text-on-surface mt-3 leading-relaxed">{userProfile.bio}</p>
                  )}
                  <div className="flex flex-wrap gap-2 mt-2">
                    {userProfile?.linkedin_url && (
                      <a href={userProfile.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-xs font-label text-primary hover:opacity-75">LinkedIn</a>
                    )}
                    {userProfile?.facebook_url && (
                      <a href={userProfile.facebook_url} target="_blank" rel="noopener noreferrer" className="text-xs font-label text-primary hover:opacity-75">Facebook</a>
                    )}
                    {userProfile?.x_url && (
                      <a href={userProfile.x_url} target="_blank" rel="noopener noreferrer" className="text-xs font-label text-primary hover:opacity-75">X</a>
                    )}
                    {userProfile?.instagram_url && (
                      <a href={userProfile.instagram_url} target="_blank" rel="noopener noreferrer" className="text-xs font-label text-primary hover:opacity-75">Instagram</a>
                    )}
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="mt-4 w-full bg-surface-container text-sm font-label font-medium text-on-surface py-2.5 rounded-xl hover:bg-surface-container-high transition-colors"
                  >
                    Modifier le profil
                  </button>
                  {userProfile && (
                    <Link
                      href={`/profil/${userProfile.slug ?? userProfile._id}`}
                      className="mt-2 w-full bg-surface-container text-sm font-label font-medium text-on-surface-variant py-2.5 rounded-xl hover:bg-surface-container-high transition-colors block text-center"
                    >
                      Voir mon profil public
                    </Link>
                  )}
                </>
              )}
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2">
              <div className="bg-surface-container p-3 rounded-2xl text-center">
                <p className="font-headline font-bold text-2xl text-on-surface">{contenus?.filter(c => c.statut === "publie").length ?? 0}</p>
                <p className="text-xs font-label text-on-surface-variant mt-1">publiée{(contenus?.filter(c => c.statut === "publie").length ?? 0) > 1 ? "s" : ""}</p>
              </div>
              <div className="bg-surface-container p-3 rounded-2xl text-center">
                <p className="font-headline font-bold text-2xl text-on-surface">{contenus?.reduce((s, c) => s + c.vues, 0).toLocaleString("fr") ?? 0}</p>
                <p className="text-xs font-label text-on-surface-variant mt-1">vues</p>
              </div>
              <div className="bg-surface-container p-3 rounded-2xl text-center">
                <p className="font-headline font-bold text-2xl text-rose-500">♥ {contenus?.reduce((s, c) => s + (c.likes ?? 0), 0) ?? 0}</p>
                <p className="text-xs font-label text-on-surface-variant mt-1">likes</p>
              </div>
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
                  <div key={c._id} className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
                    <div className="p-4 flex gap-4 items-start">
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
                          <Link href={`/contenu/${c.slug ?? c._id}`} className="font-headline font-bold text-base text-on-surface hover:text-primary transition-colors line-clamp-1">
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
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-xs font-body text-on-surface-variant">👁 {c.vues.toLocaleString("fr")}</span>
                          {(c.likes ?? 0) > 0 && <span className="text-xs font-body text-rose-400">♥ {c.likes}</span>}
                          {c.anonyme && <span className="text-xs font-label text-on-surface-variant/60 bg-surface-container px-2 py-0.5 rounded-full">Anonyme</span>}
                        </div>
                      </div>
                      <button
                        onClick={() => editingId === c._id ? setEditingId(null) : startEditing(c)}
                        className="text-xs font-label font-medium bg-surface-container text-on-surface-variant px-3 py-1.5 rounded-xl hover:bg-surface-container-high transition-colors flex-shrink-0"
                      >
                        {editingId === c._id ? "Fermer" : "Modifier"}
                      </button>
                    </div>

                    {/* Formulaire d'édition inline */}
                    {editingId === c._id && (
                      <div className="border-t border-outline-variant/20 px-4 pb-4 pt-4 space-y-3">
                        <p className="text-xs font-label font-bold text-on-surface-variant uppercase tracking-wider mb-3">Modifier la soumission</p>
                        <input value={editForm.titre} onChange={(e) => setEditForm(f => ({ ...f, titre: e.target.value }))} placeholder="Titre" className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <div className="grid grid-cols-2 gap-3">
                          <input value={editForm.marque} onChange={(e) => setEditForm(f => ({ ...f, marque: e.target.value }))} placeholder="Annonceur / Marque" className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                          <input value={editForm.agence_creative} onChange={(e) => setEditForm(f => ({ ...f, agence_creative: e.target.value }))} placeholder="Agence créative (optionnel)" className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <select value={editForm.secteur} onChange={(e) => setEditForm(f => ({ ...f, secteur: e.target.value }))} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                            {SECTEURS_LIST.map(s => <option key={s} value={s}>{s}</option>)}
                          </select>
                          <select value={editForm.pays} onChange={(e) => setEditForm(f => ({ ...f, pays: e.target.value }))} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                            {PAYS.map(p => <option key={p} value={p}>{p}</option>)}
                          </select>
                        </div>
                        <div className="grid grid-cols-3 gap-3">
                          <select value={editForm.format} onChange={(e) => setEditForm(f => ({ ...f, format: e.target.value }))} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                            {FORMATS_LIST.map(fmt => <option key={fmt} value={fmt}>{fmt}</option>)}
                          </select>
                          <select value={editForm.annee} onChange={(e) => setEditForm(f => ({ ...f, annee: e.target.value }))} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                            {["2022","2023","2024","2025","2026"].map(a => <option key={a} value={a}>{a}</option>)}
                          </select>
                          <select value={editForm.occasion} onChange={(e) => setEditForm(f => ({ ...f, occasion: e.target.value }))} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none">
                            {OCCASIONS_LIST.map(o => <option key={o} value={o}>{o}</option>)}
                          </select>
                        </div>
                        <input value={editForm.lien_publication} onChange={(e) => setEditForm(f => ({ ...f, lien_publication: e.target.value }))} placeholder="Lien de publication" type="url" className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30" />
                        <textarea value={editForm.intention_creative} onChange={(e) => setEditForm(f => ({ ...f, intention_creative: e.target.value }))} placeholder="Intention créative" rows={3} maxLength={700} className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
                        <div className="flex items-center gap-2 cursor-pointer" onClick={() => setEditForm(f => ({ ...f, anonyme: !f.anonyme }))}>
                          <div className={`w-4 h-4 rounded border-2 flex items-center justify-center flex-shrink-0 ${editForm.anonyme ? "bg-primary border-primary" : "border-outline-variant"}`}>
                            {editForm.anonyme && <span className="text-white text-xs">✓</span>}
                          </div>
                          <span className="text-xs font-body text-on-surface-variant">Contribution anonyme</span>
                        </div>
                        <div className="flex gap-2 pt-1">
                          <button onClick={handleEditSave} disabled={editSaving} className="flex-1 btn-gradient text-white text-sm font-label font-medium py-2.5 rounded-xl disabled:opacity-60">
                            {editSaving ? "..." : "Enregistrer"}
                          </button>
                          <button onClick={() => setEditingId(null)} className="px-4 bg-surface-container text-on-surface text-sm font-label rounded-xl">
                            Annuler
                          </button>
                        </div>
                      </div>
                    )}
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
