"use client";

import { useUser } from "@clerk/nextjs";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import Image from "next/image";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { useState, useEffect } from "react";
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
  const [section, setSection] = useState<"overview" | "moderation" | "membres" | "retargeting">("overview");
  const [showExport, setShowExport] = useState(false);
  const [clerkEmails, setClerkEmails] = useState<Record<string, string>>({});
  const [rtSelectedTemplate, setRtSelectedTemplate] = useState("relance");
  const [rtCibleFiltre, setRtCibleFiltre] = useState<"sans_campagne" | "relancer" | "inactif" | "debut" | "actif" | "expert" | "tous">("sans_campagne");
  const [rtSujet, setRtSujet] = useState("");
  const [rtCorps, setRtCorps] = useState("");
  const [rtTemplateLoaded, setRtTemplateLoaded] = useState("");
  const [rtSelectedUsers, setRtSelectedUsers] = useState<Set<string>>(new Set());
  const [rtSending, setRtSending] = useState(false);
  const [rtResult, setRtResult] = useState<{ sent: number; failed: number } | null>(null);

  useEffect(() => {
    if (section === "membres" || section === "retargeting") {
      fetch("/api/admin/users")
        .then((r) => r.json())
        .then((data: { clerkId: string; email: string | null }[]) => {
          const map: Record<string, string> = {};
          for (const u of data) {
            if (u.email) map[u.clerkId] = u.email;
          }
          setClerkEmails(map);
        })
        .catch(() => {});
    }
  }, [section]);

  const tousLesContenus = useQuery(api.contenus.listAll, {});
  const tousLesUsers = useQuery(api.users.listAll, {});
  const masquer = useMutation(api.contenus.masquer);
  const republier = useMutation(api.contenus.republier);
  const supprimer = useMutation(api.contenus.supprimer);
  const backfillSlugs = useMutation(api.contenus.backfillSlugs);
  const backfillUserSlugs = useMutation(api.users.backfillUserSlugs);
  const marquerContactes = useMutation(api.users.marquerContactes);
  const setCampagneDuJour = useMutation(api.contenus.setCampagneDuJour);
  const setCoupDeCoeur = useMutation(api.contenus.setCoupDeCoeur);
  const [backfillMsg, setBackfillMsg] = useState("");

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
              <button
                onClick={() => setSection("retargeting")}
                className={`text-sm font-label font-medium px-4 py-2 rounded-lg transition-colors ${section === "retargeting" ? "bg-surface text-on-surface shadow-sm" : "text-on-surface-variant hover:text-on-surface"}`}
              >
                ✉ Retargeting
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

            {/* Outils maintenance */}
            <div className="bg-surface-container-lowest rounded-2xl p-5 shadow-card">
              <h2 className="font-headline font-bold text-lg text-on-surface mb-1">Maintenance — Slugs URL</h2>
              <p className="text-xs font-body text-on-surface-variant mb-4">À lancer une seule fois pour générer les URLs lisibles des campagnes et profils existants.</p>
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={async () => {
                    const res = await backfillSlugs({});
                    setBackfillMsg(`✓ ${res.updated} campagne(s) mise(s) à jour`);
                  }}
                  className="text-sm font-label font-medium bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  Générer slugs campagnes
                </button>
                <button
                  onClick={async () => {
                    const res = await backfillUserSlugs({});
                    setBackfillMsg(`✓ ${res.updated} profil(s) mis à jour`);
                  }}
                  className="text-sm font-label font-medium bg-primary/10 text-primary px-4 py-2 rounded-xl hover:bg-primary/20 transition-colors"
                >
                  Générer slugs profils
                </button>
              </div>
              {backfillMsg && <p className="text-xs font-body text-green-700 mt-3">{backfillMsg}</p>}
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
          const now = Date.now();
          const CINQ_JOURS = 5 * 24 * 60 * 60 * 1000;

          const campagnesParUser = new Map<string, number>();
          for (const c of contenus) {
            campagnesParUser.set(c.userId, (campagnesParUser.get(c.userId) ?? 0) + 1);
          }

          const getStatut = (u: { _creationTime: number; _id: string }) => {
            const nb = campagnesParUser.get(u._id) ?? 0;
            if (nb > 0) return "actif";
            if (now - u._creationTime <= CINQ_JOURS) return "relancer";
            return "inactif";
          };

          const nbRelancer = users.filter((u) => getStatut(u) === "relancer").length;
          const nbInactif = users.filter((u) => getStatut(u) === "inactif").length;

          const statutBadge: Record<string, string> = {
            actif: "bg-green-50 text-green-700",
            relancer: "bg-amber-100 text-amber-700",
            inactif: "bg-surface-container text-on-surface-variant",
          };
          const statutLabel: Record<string, string> = {
            actif: "Actif",
            relancer: "À relancer",
            inactif: "Inactif",
          };

          return (
            <>
              {(nbRelancer > 0 || nbInactif > 0) && (
                <div className="bg-amber-50 border border-amber-200 rounded-2xl px-5 py-3 mb-6 flex items-center gap-3">
                  <span className="text-amber-600 text-lg">!</span>
                  <p className="text-sm font-body text-amber-800">
                    {nbRelancer > 0 && <><span className="font-medium">{nbRelancer} nouveau{nbRelancer > 1 ? "x" : ""}</span> à relancer · </>}
                    {nbInactif > 0 && <><span className="font-medium">{nbInactif}</span> inactif{nbInactif > 1 ? "s" : ""} (plus de 5 jours sans campagne)</>}
                  </p>
                </div>
              )}
              <div className="bg-surface-container-lowest rounded-2xl shadow-card overflow-x-auto">
                <table className="w-full min-w-[700px]">
                  <thead>
                    <tr className="border-b border-outline-variant/20">
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Nom & Prénom</th>
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Email</th>
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Pays</th>
                      <th className="text-left text-xs font-label text-on-surface-variant px-4 py-3">Inscription</th>
                      <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Campagnes</th>
                      <th className="text-right text-xs font-label text-on-surface-variant px-4 py-3">Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users
                      .slice()
                      .sort((a, b) => b._creationTime - a._creationTime)
                      .map((u) => {
                        const nb = campagnesParUser.get(u._id) ?? 0;
                        const statut = getStatut(u);
                        const nomComplet = [u.prenom, u.nom].filter(Boolean).join(" ") || "—";
                        return (
                          <tr key={u._id} className="border-b border-outline-variant/10 last:border-0 hover:bg-surface-container/30 transition-colors">
                            <td className="px-4 py-3">
                              <Link href={`/profil/${u._id}`} className="font-body font-medium text-sm text-on-surface hover:text-primary transition-colors">
                                {nomComplet}
                              </Link>
                            </td>
                            <td className="px-4 py-3 text-xs font-body text-on-surface-variant">{clerkEmails[u.clerkId] ?? u.email ?? "—"}</td>
                            <td className="px-4 py-3 text-xs font-body text-on-surface-variant">{u.pays ?? "—"}</td>
                            <td className="px-4 py-3 text-xs font-body text-on-surface-variant whitespace-nowrap">
                              {new Date(u._creationTime).toLocaleDateString("fr", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="px-4 py-3 text-right text-sm font-label font-bold text-on-surface">{nb}</td>
                            <td className="px-4 py-3 text-right">
                              <span className={`text-xs font-label font-medium px-2 py-0.5 rounded-full ${statutBadge[statut]}`}>
                                {statutLabel[statut]}
                              </span>
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

        {section === "retargeting" && (() => {
          const TEMPLATES = [
            {
              id: "relance",
              label: "Relance douce",
              segment: "sans_campagne",
              sujet: "Tu as rejoint Le Dépôt — ta première campagne nous manque !",
              corps: `Bonjour {prenom},

Tu t'es inscrit(e) sur Le Dépôt il y a quelques jours, mais on n'a pas encore vu ta première campagne. 😊

Le Dépôt, c'est la bibliothèque collaborative du contenu digital africain. Chaque campagne soumise inspire des CMs sur tout le continent.

👉 Soumettre ma première campagne : https://ledepot.createevesafrica.com/soumettre

C'est gratuit, rapide, et ta contribution compte vraiment.

À bientôt sur Le Dépôt,
L'équipe Createeves Africa`,
            },
            {
              id: "inactif",
              label: "Réactivation",
              segment: "sans_campagne",
              sujet: "On pense à toi — Le Dépôt s'agrandit",
              corps: `Bonjour {prenom},

Cela fait un moment qu'on ne t'a pas vu(e) sur Le Dépôt. La bibliothèque s'est bien étoffée depuis ton inscription !

De nouvelles campagnes de Côte d'Ivoire, du Bénin, du Sénégal et d'ailleurs ont été ajoutées.

👉 Explorer la galerie : https://ledepot.createevesafrica.com/galerie
👉 Partager une campagne : https://ledepot.createevesafrica.com/soumettre

Ton retour ferait la différence.

L'équipe Createeves Africa`,
            },
            {
              id: "lance_toi",
              label: "Lance-toi",
              segment: "debut",
              sujet: "Ta première campagne a été vue — et si tu en soumettais une deuxième ?",
              corps: `Bonjour {prenom},

Ta première campagne sur Le Dépôt a déjà été consultée par des CMs sur tout le continent. Merci pour ta contribution !

Une petite info : le badge ⭐⭐ Contributeur est à seulement 2 campagnes publiées. Tu y es presque.

👉 Soumettre une nouvelle campagne : https://ledepot.createevesafrica.com/soumettre

Chaque campagne que tu partages élève le niveau de tout le continent.

À bientôt,
L'équipe Createeves Africa`,
            },
            {
              id: "continue",
              label: "Continue sur ta lancée",
              segment: "actif",
              sujet: "Tu fais partie des meilleurs contributeurs du Dépôt 💪",
              corps: `Bonjour {prenom},

Tes campagnes sur Le Dépôt font une vraie différence. Des CMs de tout le continent s'en inspirent au quotidien.

Le badge ⭐⭐⭐ Expert est à 10 campagnes publiées. Tu es sur la bonne voie.

👉 Continuer à contribuer : https://ledepot.createevesafrica.com/soumettre

Et si tu as des collègues qui créent du bon contenu, invite-les — la bibliothèque grandit grâce à des gens comme toi.

À bientôt,
L'équipe Createeves Africa`,
            },
            {
              id: "expert",
              label: "Merci Expert",
              segment: "expert",
              sujet: "Tu es l'un des piliers du Dépôt — merci 🙏",
              corps: `Bonjour {prenom},

10 campagnes ou plus sur Le Dépôt. Tu fais partie des contributeurs les plus engagés de la plateforme, et ça se voit dans les chiffres.

Ton travail inspire des CMs à Dakar, Abidjan, Cotonou, Douala et au-delà.

Une faveur : est-ce que tu pourrais parler du Dépôt à 2 ou 3 collègues community managers ? Une simple recommandation de ta part pèse bien plus qu'une pub.

👉 Le Dépôt : https://ledepot.createevesafrica.com

Merci d'être là depuis le début.

L'équipe Createeves Africa`,
            },
            {
              id: "profil",
              label: "Complète ton profil",
              segment: "tous",
              sujet: "Ton profil sur Le Dépôt est presque complet 👤",
              corps: `Bonjour {prenom},

On a remarqué que ton profil sur Le Dépôt n'est pas encore complet. Un profil avec une photo, une bio et tes réseaux sociaux te rend beaucoup plus visible auprès des autres CMs.

👉 Compléter mon profil : https://ledepot.createevesafrica.com/mon-compte

Ça prend 2 minutes et ça fait toute la différence.

À bientôt,
L'équipe Createeves Africa`,
            },
            {
              id: "ambassadeur",
              label: "Invite tes collègues",
              segment: "tous",
              sujet: "Tu connais des CMs qui méritent d'être sur Le Dépôt ?",
              corps: `Bonjour {prenom},

Le Dépôt grandit chaque semaine, mais on sait qu'il y a encore beaucoup de talent sur le continent qui n'est pas encore référencé.

Est-ce que tu as des collègues community managers dont tu admires le travail ? Dis-leur que Le Dépôt existe.

👉 Partager Le Dépôt : https://ledepot.createevesafrica.com

Chaque nouvelle voix enrichit la bibliothèque pour tous.

Merci,
L'équipe Createeves Africa`,
            },
            {
              id: "nouveaute",
              label: "Annonce nouveauté",
              segment: "tous",
              sujet: "Nouveauté sur Le Dépôt 🎉",
              corps: `Bonjour {prenom},

Le Dépôt vient d'être mis à jour avec de nouvelles fonctionnalités !

Tu peux désormais :
• Ajouter plusieurs images à tes campagnes
• Modifier ou supprimer tes soumissions
• Et bien plus encore

👉 Découvrir les nouveautés : https://ledepot.createevesafrica.com

Merci d'être avec nous,
L'équipe Createeves Africa`,
            },
          ];

          const users = tousLesUsers ?? [];
          const now = Date.now();
          const CINQ_JOURS = 5 * 24 * 60 * 60 * 1000;
          const campagnesParUser = new Map<string, number>();
          for (const c of publiés) campagnesParUser.set(c.userId, (campagnesParUser.get(c.userId) ?? 0) + 1);

          const usersARelancer = users.filter((u) => {
            const nb = campagnesParUser.get(u._id) ?? 0;
            return nb === 0 && now - u._creationTime <= CINQ_JOURS;
          });
          const usersInactifs = users.filter((u) => {
            const nb = campagnesParUser.get(u._id) ?? 0;
            return nb === 0 && now - u._creationTime > CINQ_JOURS;
          });
          const allSansContenu = [...usersARelancer, ...usersInactifs];
          const usersDebut = users.filter((u) => (campagnesParUser.get(u._id) ?? 0) === 1);
          const usersActifs = users.filter((u) => { const nb = campagnesParUser.get(u._id) ?? 0; return nb >= 2 && nb <= 10; });
          const usersExperts = users.filter((u) => (campagnesParUser.get(u._id) ?? 0) > 10);

          const SEGMENTS = [
            { id: "sans_campagne" as const, label: `Sans campagne (${allSansContenu.length})`, users: allSansContenu },
            { id: "relancer" as const, label: `À relancer (${usersARelancer.length})`, users: usersARelancer },
            { id: "inactif" as const, label: `Inactifs (${usersInactifs.length})`, users: usersInactifs },
            { id: "debut" as const, label: `1 campagne (${usersDebut.length})`, users: usersDebut },
            { id: "actif" as const, label: `2–10 campagnes (${usersActifs.length})`, users: usersActifs },
            { id: "expert" as const, label: `10+ campagnes (${usersExperts.length})`, users: usersExperts },
            { id: "tous" as const, label: `Tous les membres (${users.length})`, users },
          ];

          const cibleUsers = SEGMENTS.find((s) => s.id === rtCibleFiltre)?.users ?? allSansContenu;

          // Charger template dans l'éditeur quand on change de template
          const loadedTemplate = TEMPLATES.find((t) => t.id === rtSelectedTemplate) ?? TEMPLATES[0];
          if (rtTemplateLoaded !== rtSelectedTemplate) {
            setTimeout(() => {
              setRtSujet(loadedTemplate.sujet);
              setRtCorps(loadedTemplate.corps);
              setRtTemplateLoaded(rtSelectedTemplate);
              setRtSelectedUsers(new Set(cibleUsers.map((u) => u.clerkId)));
            }, 0);
          }

          const toggleUser = (clerkId: string) => {
            setRtSelectedUsers((prev) => {
              const next = new Set(prev);
              if (next.has(clerkId)) next.delete(clerkId);
              else next.add(clerkId);
              return next;
            });
          };

          const selectAll = () => setRtSelectedUsers(new Set(cibleUsers.map((u) => u.clerkId)));
          const deselectAll = () => setRtSelectedUsers(new Set());

          const selectedList = cibleUsers.filter((u) => rtSelectedUsers.has(u.clerkId));

          const personalizePreview = (prenom: string) => {
            const greeting = prenom.trim() ? `Bonjour ${prenom.trim()},` : "Bonjour,";
            return rtCorps.replace(/Bonjour \{prenom\},/g, greeting).replace(/\{prenom\}/g, prenom.trim());
          };

          const handleSend = async () => {
            if (!selectedList.length || !rtSujet || !rtCorps) return;
            setRtSending(true);
            setRtResult(null);
            try {
              const recipients = selectedList
                .map((u) => ({
                  email: clerkEmails[u.clerkId] ?? (u as { email?: string }).email ?? "",
                  prenom: (u as { prenom?: string }).prenom ?? "",
                }))
                .filter((r) => r.email);

              const res = await fetch("/api/admin/send-retargeting", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ recipients, sujet: rtSujet, corps: rtCorps }),
              });
              const data = await res.json();
              if (res.ok) {
                setRtResult({ sent: data.sent, failed: data.failed });
                await marquerContactes({ clerkIds: selectedList.map((u) => u.clerkId) });
              } else {
                setRtResult({ sent: 0, failed: -1 });
              }
            } finally {
              setRtSending(false);
            }
          };

          return (
            <div className="space-y-6">
              {/* KPIs */}
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-amber-700">{usersARelancer.length}</p>
                  <p className="text-xs font-label text-amber-600 mt-0.5">À relancer</p>
                </div>
                <div className="bg-surface-container rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-on-surface">{usersInactifs.length}</p>
                  <p className="text-xs font-label text-on-surface-variant mt-0.5">Inactifs</p>
                </div>
                <div className="bg-primary/5 rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-primary">{usersDebut.length}</p>
                  <p className="text-xs font-label text-on-surface-variant mt-0.5">1 campagne</p>
                </div>
                <div className="bg-green-50 rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-green-700">{usersActifs.length}</p>
                  <p className="text-xs font-label text-green-600 mt-0.5">2–10 campagnes</p>
                </div>
                <div className="bg-surface-container-lowest border border-amber-200 rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-amber-600">{usersExperts.length}</p>
                  <p className="text-xs font-label text-amber-500 mt-0.5">Experts 10+</p>
                </div>
                <div className="bg-surface-container rounded-2xl p-3 text-center">
                  <p className="font-headline font-bold text-xl text-on-surface">{users.length}</p>
                  <p className="text-xs font-label text-on-surface-variant mt-0.5">Total membres</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6 items-start">
                {/* Colonne gauche : éditeur */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-5">
                  <h2 className="font-headline font-bold text-xl text-on-surface">Composer le message</h2>

                  {/* Templates */}
                  <div>
                    <p className="text-xs font-label text-on-surface-variant mb-2">Partir d&apos;un template</p>
                    <div className="flex flex-wrap gap-2">
                      {TEMPLATES.map((t) => (
                        <button
                          key={t.id}
                          onClick={() => { setRtSelectedTemplate(t.id); setRtTemplateLoaded(""); }}
                          className={`text-xs font-label font-medium px-3 py-1.5 rounded-xl transition-colors ${rtSelectedTemplate === t.id && rtTemplateLoaded === t.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                    {rtTemplateLoaded && (
                      <p className="text-xs font-label text-on-surface-variant/60 mt-1.5">
                        Suggéré pour : <span className="text-primary">{SEGMENTS.find((s) => s.id === TEMPLATES.find((t) => t.id === rtSelectedTemplate)?.segment)?.label ?? "Tous"}</span>
                      </p>
                    )}
                  </div>

                  {/* Objet */}
                  <div>
                    <p className="text-xs font-label text-on-surface-variant mb-1.5">Objet</p>
                    <input
                      value={rtSujet}
                      onChange={(e) => setRtSujet(e.target.value)}
                      className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30"
                      placeholder="Objet de l'email..."
                    />
                  </div>

                  {/* Corps */}
                  <div>
                    <div className="flex items-center justify-between mb-1.5">
                      <p className="text-xs font-label text-on-surface-variant">Corps</p>
                      <span className="text-xs font-label text-primary/70 bg-primary/5 px-2 py-0.5 rounded-lg">{"{prenom}"} → prénom auto</span>
                    </div>
                    <textarea
                      value={rtCorps}
                      onChange={(e) => setRtCorps(e.target.value)}
                      rows={12}
                      className="w-full bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
                    />
                  </div>

                  {/* Aperçu personnalisé */}
                  <div className="bg-primary/5 rounded-xl p-3">
                    <p className="text-xs font-label text-primary mb-1.5">Aperçu — tel que reçu par &quot;Kouamé&quot;</p>
                    <pre className="text-xs font-body text-on-surface-variant whitespace-pre-wrap leading-relaxed">{personalizePreview("Kouamé")}</pre>
                  </div>
                </div>

                {/* Colonne droite : destinataires */}
                <div className="bg-surface-container-lowest rounded-2xl p-6 shadow-card space-y-4">
                  <h2 className="font-headline font-bold text-xl text-on-surface">Destinataires</h2>

                  {/* Filtre segments */}
                  <div className="flex flex-wrap gap-1.5">
                    {SEGMENTS.map((s) => (
                      <button
                        key={s.id}
                        onClick={() => { setRtCibleFiltre(s.id); setRtSelectedUsers(new Set()); }}
                        className={`text-xs font-label font-medium px-3 py-1.5 rounded-xl transition-colors ${rtCibleFiltre === s.id ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>

                  {/* Sélection rapide */}
                  <div className="flex gap-2 text-xs font-label text-primary">
                    <button onClick={selectAll} className="hover:opacity-75">Tout sélectionner</button>
                    <span className="text-outline-variant">·</span>
                    <button onClick={deselectAll} className="hover:opacity-75">Désélectionner</button>
                    <span className="ml-auto text-on-surface-variant font-medium">{rtSelectedUsers.size} sélectionné{rtSelectedUsers.size > 1 ? "s" : ""}</span>
                  </div>

                  {/* Liste utilisateurs */}
                  <div className="space-y-1 max-h-[340px] overflow-y-auto pr-1">
                    {cibleUsers.length === 0 ? (
                      <p className="text-sm font-body text-on-surface-variant py-4 text-center">Aucun utilisateur dans cette catégorie.</p>
                    ) : cibleUsers.map((u) => {
                      const email = clerkEmails[u.clerkId] ?? (u as { email?: string }).email ?? "";
                      const prenom = (u as { prenom?: string }).prenom ?? "";
                      const nom = (u as { nom?: string }).nom ?? "";
                      const nomComplet = [prenom, nom].filter(Boolean).join(" ") || "Sans nom";
                      const dernierContact = (u as { dernier_contact_retargeting?: number }).dernier_contact_retargeting;
                      const isSelected = rtSelectedUsers.has(u.clerkId);
                      return (
                        <div
                          key={u._id}
                          onClick={() => toggleUser(u.clerkId)}
                          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl cursor-pointer transition-colors ${isSelected ? "bg-primary/10" : "hover:bg-surface-container"}`}
                        >
                          <div className={`w-4 h-4 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${isSelected ? "bg-primary border-primary" : "border-outline-variant"}`}>
                            {isSelected && <span className="text-white text-xs leading-none">✓</span>}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-body font-medium text-on-surface truncate">{nomComplet}</p>
                            <p className="text-xs font-body text-on-surface-variant truncate">{email || "Pas d'email"}</p>
                          </div>
                          {dernierContact && (
                            <span className="text-xs font-label text-on-surface-variant/60 flex-shrink-0" title="Dernier contact">
                              ✉ {new Date(dernierContact).toLocaleDateString("fr", { day: "numeric", month: "short" })}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Résultat envoi */}
                  {rtResult && (
                    <div className={`rounded-xl px-4 py-3 text-sm font-body ${rtResult.failed === -1 ? "bg-error-container text-error" : "bg-green-50 text-green-800"}`}>
                      {rtResult.failed === -1
                        ? "Erreur — vérifie que RESEND_API_KEY est configurée sur Vercel."
                        : `✓ ${rtResult.sent} envoyé${rtResult.sent > 1 ? "s" : ""}${rtResult.failed > 0 ? ` · ${rtResult.failed} échoué${rtResult.failed > 1 ? "s" : ""}` : ""}`}
                    </div>
                  )}

                  {/* Bouton envoyer */}
                  <button
                    onClick={handleSend}
                    disabled={rtSending || rtSelectedUsers.size === 0 || !rtSujet || !rtCorps}
                    className="w-full btn-gradient text-white font-label font-medium py-3 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-40"
                  >
                    {rtSending ? "Envoi en cours..." : `Envoyer à ${rtSelectedUsers.size} personne${rtSelectedUsers.size > 1 ? "s" : ""}`}
                  </button>
                  <p className="text-xs font-body text-on-surface-variant">
                    Chaque email est envoyé individuellement avec le prénom personnalisé. Nécessite RESEND_API_KEY sur Vercel.
                  </p>
                </div>
              </div>
            </div>
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
                        onClick={() => setCampagneDuJour({ id: (c as { campagne_du_jour?: boolean }).campagne_du_jour ? undefined : c._id as Id<"contenus"> })}
                        className={`text-xs font-label font-medium px-3 py-1.5 rounded-xl transition-colors ${(c as { campagne_du_jour?: boolean }).campagne_du_jour ? "bg-primary text-on-primary" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                      >
                        {(c as { campagne_du_jour?: boolean }).campagne_du_jour ? "★ Du jour" : "Jour"}
                      </button>
                      <button
                        onClick={() => setCoupDeCoeur({ id: c._id as Id<"contenus"> })}
                        className={`text-xs font-label font-medium px-3 py-1.5 rounded-xl transition-colors ${(c as { coup_de_coeur?: boolean }).coup_de_coeur ? "bg-amber-500 text-white" : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"}`}
                      >
                        {(c as { coup_de_coeur?: boolean }).coup_de_coeur ? "✦ Cœur" : "Cœur"}
                      </button>
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
