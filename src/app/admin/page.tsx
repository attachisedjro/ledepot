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

function exportCSV(filename: string, rows: (string | number)[][], headers: string[]) {
  const escape = (val: string | number) => {
    const s = String(val ?? "").replace(/"/g, '""');
    return s.includes(",") || s.includes("\n") || s.includes('"') ? `"${s}"` : s;
  };
  const lines = [headers.map(escape).join(","), ...rows.map((r) => r.map(escape).join(","))];
  const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

const PAYS_OPTIONS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS_OPTIONS = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Immobilier", "Santé / Pharmacie", "Éducation / EdTech", "Transport / Mobilité", "Énergie / Solaire", "Agriculture / Agro-industrie", "Assurance", "E-commerce / Marketplace", "Tech / Startups", "Autre"];

type ExportFilters = {
  dateDebut: string;
  dateFin: string;
  pays: string;
  secteur: string;
  statut: "tous" | "publie" | "masque";
  type: "campagnes" | "contributeurs";
};

type ContenuWithCm = {
  _id: Id<"contenus">;
  _creationTime: number;
  titre: string;
  marque: string;
  pays: string;
  secteur: string;
  occasion: string;
  format: string;
  annee: string;
  type_contenu?: string;
  lien_publication: string;
  intention_creative: string;
  statut: string;
  vues: number;
  likes?: number;
  cm: string;
  userId: Id<"users">;
  visuel_url?: string;
  visuel_storage_id?: Id<"_storage">;
};

function ExportModal({
  contenus,
  onClose,
}: {
  contenus: ContenuWithCm[];
  onClose: () => void;
}) {
  const [filters, setFilters] = useState<ExportFilters>({
    dateDebut: "",
    dateFin: "",
    pays: "",
    secteur: "",
    statut: "tous",
    type: "campagnes",
  });

  const set = (key: keyof ExportFilters) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => setFilters((f) => ({ ...f, [key]: e.target.value }));

  const filtered = contenus.filter((c) => {
    if (filters.statut !== "tous" && c.statut !== filters.statut) return false;
    if (filters.pays && c.pays !== filters.pays) return false;
    if (filters.secteur && c.secteur !== filters.secteur) return false;
    if (filters.dateDebut) {
      const debut = new Date(filters.dateDebut).getTime();
      if (c._creationTime < debut) return false;
    }
    if (filters.dateFin) {
      const fin = new Date(filters.dateFin).getTime() + 86400000;
      if (c._creationTime > fin) return false;
    }
    return true;
  });

  const handleExport = () => {
    if (filters.type === "campagnes") {
      const headers = ["Date soumission", "Titre", "Marque", "Pays", "Secteur", "Occasion", "Format", "Année", "Type", "CM", "Vues", "Likes", "Statut"];
      const rows = filtered.map((c) => [
        new Date(c._creationTime).toLocaleDateString("fr"),
        c.titre, c.marque, c.pays, c.secteur, c.occasion, c.format, c.annee,
        c.type_contenu ?? "", c.cm, c.vues, c.likes ?? 0,
        c.statut === "publie" ? "Publié" : c.statut === "masque" ? "Masqué" : "Rejeté",
      ]);
      exportCSV(`ledepot-campagnes-${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
    } else {
      const contribMap = new Map<string, { cm: string; campagnes: number; vues: number; likes: number }>();
      for (const c of filtered) {
        const key = c.userId;
        const ex = contribMap.get(key);
        if (ex) { ex.campagnes++; ex.vues += c.vues; ex.likes += c.likes ?? 0; }
        else contribMap.set(key, { cm: c.cm, campagnes: 1, vues: c.vues, likes: c.likes ?? 0 });
      }
      const headers = ["Contributeur", "Campagnes publiées", "Vues totales", "Likes totaux"];
      const rows = Array.from(contribMap.values())
        .sort((a, b) => b.campagnes - a.campagnes)
        .map((c) => [c.cm, c.campagnes, c.vues, c.likes]);
      exportCSV(`ledepot-contributeurs-${new Date().toISOString().slice(0, 10)}.csv`, rows, headers);
    }
    onClose();
  };

  const fieldClass = "w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative bg-surface rounded-2xl shadow-ambient w-full max-w-md p-6 space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-headline font-bold text-xl text-on-surface">Exporter les données</h2>
          <button onClick={onClose} className="text-on-surface-variant hover:text-on-surface text-xl leading-none">×</button>
        </div>

        {/* Type d'export */}
        <div>
          <p className="text-xs font-label text-on-surface-variant mb-2">Type d&apos;export</p>
          <div className="flex gap-2">
            {([["campagnes", "Campagnes"], ["contributeurs", "Contributeurs"]] as [ExportFilters["type"], string][]).map(([val, label]) => (
              <button
                key={val}
                onClick={() => setFilters((f) => ({ ...f, type: val }))}
                className={`flex-1 text-sm font-label font-medium py-2 rounded-xl transition-colors ${filters.type === val ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Période */}
        <div>
          <p className="text-xs font-label text-on-surface-variant mb-2">Période de soumission</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Du</p>
              <input type="date" value={filters.dateDebut} onChange={set("dateDebut")} className={fieldClass} />
            </div>
            <div>
              <p className="text-xs text-on-surface-variant mb-1">Au</p>
              <input type="date" value={filters.dateFin} onChange={set("dateFin")} className={fieldClass} />
            </div>
          </div>
        </div>

        {/* Filtres */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs font-label text-on-surface-variant mb-1">Pays</p>
            <select value={filters.pays} onChange={set("pays")} className={fieldClass}>
              <option value="">Tous</option>
              {PAYS_OPTIONS.map((p) => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <p className="text-xs font-label text-on-surface-variant mb-1">Secteur</p>
            <select value={filters.secteur} onChange={set("secteur")} className={fieldClass}>
              <option value="">Tous</option>
              {SECTEURS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        </div>

        <div>
          <p className="text-xs font-label text-on-surface-variant mb-1">Statut</p>
          <select value={filters.statut} onChange={set("statut")} className={fieldClass}>
            <option value="tous">Tous</option>
            <option value="publie">Publiés uniquement</option>
            <option value="masque">Masqués uniquement</option>
          </select>
        </div>

        {/* Aperçu */}
        <div className="bg-primary/10 rounded-xl px-4 py-3 flex items-center justify-between">
          <p className="text-sm font-body text-on-surface">
            {filters.type === "campagnes"
              ? `${filtered.length} campagne${filtered.length > 1 ? "s" : ""} à exporter`
              : `${filtered.length} campagne${filtered.length > 1 ? "s" : ""} → données contributeurs`}
          </p>
          <span className="font-headline font-bold text-xl text-primary">{filtered.length}</span>
        </div>

        {/* Boutons */}
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 bg-surface-container text-on-surface text-sm font-label font-medium py-3 rounded-xl hover:bg-surface-container-high transition-colors">
            Annuler
          </button>
          <button
            onClick={handleExport}
            disabled={filtered.length === 0}
            className="flex-1 btn-gradient text-on-primary text-sm font-label font-medium py-3 rounded-xl hover:opacity-90 transition-opacity disabled:opacity-40"
          >
            ↓ Télécharger CSV
          </button>
        </div>
      </div>
    </div>
  );
}

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
  const [section, setSection] = useState<"overview" | "moderation" | "membres">("overview");
  const [showExport, setShowExport] = useState(false);

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

      {showExport && (
        <ExportModal
          contenus={contenus as ContenuWithCm[]}
          onClose={() => setShowExport(false)}
        />
      )}

      <div className="pt-24 pb-16 px-6 max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-end justify-between mb-8">
          <div>
            <h1 className="font-headline font-bold text-4xl text-on-surface mb-1">Dashboard</h1>
            <p className="font-body text-sm text-on-surface-variant">Vue d&apos;ensemble · Le Dépôt</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowExport(true)}
              className="flex items-center gap-1.5 text-sm font-label font-medium bg-surface-container text-on-surface-variant px-4 py-2 rounded-xl hover:bg-surface-container-high transition-colors"
            >
              ↓ Exporter
            </button>
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
              <button
                onClick={() => setSection("membres")}
                className={`text-sm font-label font-medium px-4 py-2 rounded-lg transition-colors ${section === "membres" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                Membres ({nbCMs})
              </button>
            </div>
          </div>
        </div>

        {section === "overview" && (
          <>
            {/* KPIs */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-10">
              <KpiCard label="Campagnes totales" value={contenus.length} />
              <KpiCard label="Publiées" value={publiés.length} />
              <KpiCard label="Masquées" value={masqués.length} />
              <KpiCard label="Membres inscrits" value={nbCMs} />
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
                        <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Contributeur</th>
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

        {section === "membres" && (() => {
          const users = tousLesUsers ?? [];
          // Campagne count per userId
          const campagnesParUser = new Map<string, number>();
          for (const c of contenus) {
            campagnesParUser.set(c.userId, (campagnesParUser.get(c.userId) ?? 0) + 1);
          }
          const sansCompagne = users.filter((u) => (campagnesParUser.get(u._id) ?? 0) === 0);
          return (
            <>
              {sansCompagne.length > 0 && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
                  <span className="text-amber-600 text-lg">!</span>
                  <p className="text-sm font-body text-amber-800">
                    <span className="font-medium">{sansCompagne.length} membre{sansCompagne.length > 1 ? "s" : ""}</span> inscrit{sansCompagne.length > 1 ? "s" : ""} sans campagne — à relancer.
                  </p>
                </div>
              )}
              <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Membre</th>
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Pays</th>
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Inscription</th>
                      <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Campagnes</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .slice()
                      .sort((a, b) => b._creationTime - a._creationTime)
                      .map((u) => {
                        const nbCampagnes = campagnesParUser.get(u._id) ?? 0;
                        return (
                          <tr key={u._id} className={`border-b border-outline-variant/10 last:border-0 transition-colors ${nbCampagnes === 0 ? "bg-amber-50/50" : "hover:bg-surface-container/50"}`}>
                            <td className="px-4 py-3">
                              <Link href={`/profil/${u._id}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors">
                                {u.prenom} {u.nom}
                              </Link>
                              {nbCampagnes === 0 && (
                                <span className="ml-2 text-xs font-label text-amber-600 bg-amber-100 px-1.5 py-0.5 rounded-full">à relancer</span>
                              )}
                            </td>
                            <td className="px-4 py-3 text-xs font-body text-on-surface-variant">{u.pays ?? "—"}</td>
                            <td className="px-4 py-3 text-xs font-body text-on-surface-variant">
                              {new Date(u._creationTime).toLocaleDateString("fr", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className={`px-4 py-3 text-right text-sm font-label font-bold ${nbCampagnes === 0 ? "text-on-surface-variant" : "text-on-surface"}`}>
                              {nbCampagnes}
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
                {users.length === 0 && (
                  <p className="text-sm font-body text-on-surface-variant text-center py-12">Aucun membre inscrit.</p>
                )}
              </div>
            </>
          );
        })()}

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
