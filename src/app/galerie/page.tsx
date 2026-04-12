"use client";

import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";
import type { Id } from "../../../convex/_generated/dataModel";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Immobilier", "Santé / Pharmacie", "Éducation / EdTech", "Transport / Mobilité", "Énergie / Solaire", "Agriculture / Agro-industrie", "Assurance", "E-commerce / Marketplace", "Tech / Startups", "Autre"];
const OCCASIONS = ["Saint-Valentin", "Fête des mères", "Fête des pères", "Fête nationale", "Rentrée scolaire", "Noël", "Lancement produit", "Ramadan", "Korité / Aïd el-Fitr", "Tabaski / Aïd el-Kébir", "Pâques", "Fête du travail", "Journée internationale des droits des femmes", "Journée internationale de la jeunesse", "Black Friday / Cyber Monday", "Journée mondiale de l'environnement", "Anniversaire de marque", "Autre"];
const FORMATS = ["Image statique", "Carrousel", "Vidéo", "Reel", "Story", "Autre"];
const ANNEES = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
const TYPES = ["Publication organique", "Campagne payante", "UGC", "Influenceur", "Activation terrain", "Autre"];

const LIMIT_VISITEUR = 6;

function FilterSelect({
  label, value, options, onChange,
}: {
  label: string; value: string; options: string[]; onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="bg-surface-container text-sm font-body text-on-surface px-3 py-2 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
    >
      <option value="">{label}</option>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
  );
}

function HeartButton({ contenuId, clerkId }: { contenuId: Id<"contenus">; clerkId: string }) {
  const liked = useQuery(api.likes.hasLiked, { clerkId, contenuId });
  const toggleLike = useMutation(api.likes.toggleLike);

  const handleClick = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await toggleLike({ clerkId, contenuId });
  };

  return (
    <button
      onClick={handleClick}
      className="flex items-center gap-1 text-xs font-label font-medium transition-colors"
      aria-label={liked ? "Retirer le like" : "Liker"}
    >
      <span className={liked ? "text-rose-500" : "text-on-surface-variant/60"}>
        {liked ? "♥" : "♡"}
      </span>
    </button>
  );
}

export default function GaleriePage() {
  const { isSignedIn, user } = useUser();
  const [filtres, setFiltres] = useState({
    pays: "", secteur: "", occasion: "", format: "", annee: "", type_contenu: "",
  });
  const [triLikes, setTriLikes] = useState(false);
  const [recherche, setRecherche] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 12;

  const coupDeCoeur = useQuery(api.contenus.getCoupDeCoeur);
  const contenus = useQuery(api.contenus.list, {
    pays: filtres.pays || undefined,
    secteur: filtres.secteur || undefined,
    occasion: filtres.occasion || undefined,
    format: filtres.format || undefined,
    annee: filtres.annee || undefined,
    type_contenu: filtres.type_contenu || undefined,
  });

  const setFiltre = (key: keyof typeof filtres) => (val: string) => {
    setFiltres((f) => ({ ...f, [key]: val }));
    setCurrentPage(1);
  };

  const hasFilters = Object.values(filtres).some(Boolean) || triLikes || !!recherche.trim();

  let sortedContenus = contenus;
  if (contenus && triLikes) {
    sortedContenus = [...contenus].sort((a, b) => (b.likes ?? 0) - (a.likes ?? 0));
  }

  let filteredContenus = sortedContenus;
  if (sortedContenus && recherche.trim()) {
    const q = recherche.toLowerCase();
    filteredContenus = sortedContenus.filter(c =>
      c.titre.toLowerCase().includes(q) ||
      c.marque.toLowerCase().includes(q) ||
      c.intention_creative.toLowerCase().includes(q)
    );
  }

  const totalContenus = contenus?.length ?? 0;
  const filteredTotal = filteredContenus?.length ?? 0;

  // Les visiteurs voient seulement les 6 premiers (sans pagination)
  // Les connectés ont la pagination par 10
  const contenusCaches = !isSignedIn && filteredTotal > LIMIT_VISITEUR
    ? filteredTotal - LIMIT_VISITEUR
    : 0;

  const totalPages = isSignedIn && filteredContenus
    ? Math.ceil(filteredContenus.length / ITEMS_PER_PAGE)
    : 1;

  const visibleContenus = filteredContenus
    ? isSignedIn
      ? filteredContenus.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE)
      : filteredContenus.slice(0, LIMIT_VISITEUR)
    : undefined;

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-12 px-6 max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-2">
            Bibliothèque
          </h1>
          <p className="font-body text-on-surface-variant">
            {totalContenus} campagne{totalContenus > 1 ? "s" : ""} publiée{totalContenus > 1 ? "s" : ""}
          </p>
        </div>

        {/* Coups de cœur de la semaine */}
        {coupDeCoeur && coupDeCoeur.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex items-center gap-1.5 text-xs font-label font-bold text-amber-700 bg-amber-100 px-2.5 py-1 rounded-full">
                ✦ Coups de cœur de la semaine
              </span>
            </div>
            <div className={`grid gap-4 ${coupDeCoeur.length === 1 ? "grid-cols-1" : coupDeCoeur.length === 2 ? "sm:grid-cols-2" : "sm:grid-cols-3"}`}>
              {coupDeCoeur.map((c) => (
                <Link key={c._id} href={`/contenu/${c.slug ?? c._id}`} className="block group">
                  <div className="rounded-2xl overflow-hidden bg-surface-container-lowest shadow-ambient hover:shadow-card transition-all hover:-translate-y-0.5">
                    {c.visuel_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.visuel_url} alt={c.titre} className="w-full aspect-[4/5] object-cover group-hover:scale-105 transition-transform duration-500" />
                    )}
                    <div className="p-4">
                      <p className="text-xs font-body text-on-surface-variant mb-1 truncate">{c.marque} · {c.pays}</p>
                      <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors line-clamp-2 leading-tight">
                        {c.titre}
                      </h3>
                      <p className="text-xs font-label font-medium text-primary mt-2">Voir →</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Recherche */}
        <div className="relative mb-6">
          <input
            type="text"
            value={recherche}
            onChange={(e) => { setRecherche(e.target.value); setCurrentPage(1); }}
            placeholder="Rechercher une campagne, une marque..."
            className="w-full bg-surface-container text-sm font-body text-on-surface px-4 py-3 pl-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50"
          />
          <svg className="absolute left-3 top-3.5 w-4 h-4 text-on-surface-variant/50" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          {recherche && (
            <button onClick={() => setRecherche("")} className="absolute right-3 top-3.5 text-on-surface-variant/50 hover:text-on-surface">×</button>
          )}
        </div>

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-10">
          <FilterSelect label="Pays" value={filtres.pays} options={PAYS} onChange={setFiltre("pays")} />
          <FilterSelect label="Secteur" value={filtres.secteur} options={SECTEURS} onChange={setFiltre("secteur")} />
          <FilterSelect label="Occasion" value={filtres.occasion} options={OCCASIONS} onChange={setFiltre("occasion")} />
          <FilterSelect label="Format" value={filtres.format} options={FORMATS} onChange={setFiltre("format")} />
          <FilterSelect label="Année" value={filtres.annee} options={ANNEES} onChange={setFiltre("annee")} />
          <FilterSelect label="Type" value={filtres.type_contenu} options={TYPES} onChange={setFiltre("type_contenu")} />

          <button
            onClick={() => setTriLikes((v) => !v)}
            className={`flex items-center gap-1.5 text-sm font-label font-medium px-3 py-2 rounded-xl transition-colors ${
              triLikes
                ? "bg-rose-500/10 text-rose-500"
                : "bg-surface-container text-on-surface-variant hover:text-on-surface"
            }`}
          >
            <span>♥</span> Les plus likées
          </button>

          {hasFilters && (
            <button
              onClick={() => {
                setFiltres({ pays: "", secteur: "", occasion: "", format: "", annee: "", type_contenu: "" });
                setTriLikes(false);
                setRecherche("");
                setCurrentPage(1);
              }}
              className="text-sm font-label font-medium text-primary hover:opacity-75 transition-opacity px-3 py-2"
            >
              Effacer
            </button>
          )}
        </div>

        {/* Grid */}
        {visibleContenus === undefined ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-surface-container rounded-2xl overflow-hidden animate-pulse">
                <div className="w-full aspect-[4/5] bg-surface-container-high" />
                <div className="p-4 space-y-2">
                  <div className="h-3 bg-surface-container-high rounded w-2/3" />
                  <div className="h-4 bg-surface-container-high rounded w-full" />
                </div>
              </div>
            ))}
          </div>
        ) : visibleContenus.length === 0 ? (
          <div className="text-center py-24">
            <p className="font-headline font-bold text-2xl text-on-surface mb-2">
              Aucune campagne trouvée
            </p>
            <p className="font-body text-on-surface-variant text-sm">
              Essaie d&apos;autres filtres ou{" "}
              <Link href="/soumettre" className="text-primary underline-offset-2 hover:underline">
                soumets la première
              </Link>.
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {visibleContenus.map((c) => (
                <Link key={c._id} href={`/contenu/${c.slug ?? c._id}`}>
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
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs font-body text-on-surface-variant">
                          par {c.cm}
                        </p>
                        <div className="flex items-center gap-1 text-xs text-on-surface-variant/60">
                          {isSignedIn && user ? (
                            <HeartButton contenuId={c._id} clerkId={user.id} />
                          ) : (
                            <Link
                              href="/sign-up"
                              onClick={(e) => e.stopPropagation()}
                              className="text-on-surface-variant/40 hover:text-rose-400 transition-colors"
                            >
                              ♡
                            </Link>
                          )}
                          {(c.likes ?? 0) > 0 && (
                            <span>{c.likes}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </article>
                </Link>
              ))}
            </div>

            {/* Pagination pour les connectés */}
            {isSignedIn && totalPages > 1 && (
              <div className="mt-10 flex items-center justify-center gap-3">
                <button
                  onClick={() => { setCurrentPage((p) => Math.max(1, p - 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === 1}
                  className="px-4 py-2 text-sm font-label font-medium bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  ← Précédent
                </button>

                <div className="flex items-center gap-1">
                  {(() => {
                    const pages: (number | "...")[] = [];
                    if (totalPages <= 7) {
                      for (let i = 1; i <= totalPages; i++) pages.push(i);
                    } else {
                      pages.push(1);
                      if (currentPage > 3) pages.push("...");
                      for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) pages.push(i);
                      if (currentPage < totalPages - 2) pages.push("...");
                      pages.push(totalPages);
                    }
                    return pages.map((page, idx) =>
                      page === "..." ? (
                        <span key={`ellipsis-${idx}`} className="w-9 h-9 flex items-center justify-center text-sm text-on-surface-variant/50">…</span>
                      ) : (
                        <button
                          key={page}
                          onClick={() => { setCurrentPage(page as number); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                          className={`w-9 h-9 text-sm font-label font-medium rounded-xl transition-colors ${
                            page === currentPage
                              ? "btn-gradient text-white"
                              : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
                          }`}
                        >
                          {page}
                        </button>
                      )
                    );
                  })()}
                </div>

                <button
                  onClick={() => { setCurrentPage((p) => Math.min(totalPages, p + 1)); window.scrollTo({ top: 0, behavior: "smooth" }); }}
                  disabled={currentPage === totalPages}
                  className="px-4 py-2 text-sm font-label font-medium bg-surface-container text-on-surface rounded-xl hover:bg-surface-container-high transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  Suivant →
                </button>
              </div>
            )}

            {isSignedIn && filteredTotal > 0 && (
              <p className="mt-4 text-center text-xs font-body text-on-surface-variant">
                Page {currentPage} sur {totalPages} · {filteredTotal} campagne{filteredTotal > 1 ? "s" : ""}
              </p>
            )}

            {/* Paywall doux pour les visiteurs */}
            {contenusCaches > 0 && (
              <div className="mt-12 relative">
                {/* Gradient de fondu sur les cartes du dessus */}
                <div className="absolute -top-24 left-0 right-0 h-24 bg-gradient-to-b from-transparent to-surface pointer-events-none" />

                <div className="bg-surface-container rounded-2xl p-10 text-center">
                  <h3 className="font-headline font-bold text-2xl text-on-surface mb-2">
                    {contenusCaches} campagne{contenusCaches > 1 ? "s" : ""} de plus t&apos;attendent
                  </h3>
                  <p className="font-body text-sm text-on-surface-variant mb-6 max-w-sm mx-auto">
                    Crée un compte pour accéder à toute la bibliothèque, filtrer et t&apos;inspirer sans limite.
                  </p>
                  <div className="flex flex-wrap gap-3 justify-center">
                    <Link
                      href="/sign-up"
                      className="btn-gradient text-white font-label font-medium px-7 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
                    >
                      Créer un compte
                    </Link>
                    <Link
                      href="/sign-in"
                      className="bg-surface-container-high text-on-surface font-label font-medium px-7 py-3 rounded-xl text-sm hover:bg-surface-container-highest transition-colors"
                    >
                      Se connecter
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <Footer />
    </div>
  );
}
