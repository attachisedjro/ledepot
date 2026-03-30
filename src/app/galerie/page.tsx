"use client";

import { useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { useState } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Image from "next/image";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Autre"];
const OCCASIONS = ["Saint-Valentin", "Fête des mères", "Fête des pères", "Fête nationale", "Rentrée", "Noël", "Lancement produit", "Ramadan", "Pâques", "Autre"];
const FORMATS = ["Image statique", "Carrousel", "Vidéo", "Reel", "Story", "Autre"];
const ANNEES = ["2022", "2023", "2024", "2025", "2026"];
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

export default function GaleriePage() {
  const { isSignedIn } = useUser();
  const [filtres, setFiltres] = useState({
    pays: "", secteur: "", occasion: "", format: "", annee: "", type_contenu: "",
  });

  const contenus = useQuery(api.contenus.list, {
    pays: filtres.pays || undefined,
    secteur: filtres.secteur || undefined,
    occasion: filtres.occasion || undefined,
    format: filtres.format || undefined,
    annee: filtres.annee || undefined,
    type_contenu: filtres.type_contenu || undefined,
  });

  const setFiltre = (key: keyof typeof filtres) => (val: string) =>
    setFiltres((f) => ({ ...f, [key]: val }));

  const hasFilters = Object.values(filtres).some(Boolean);

  // Les visiteurs voient seulement les 6 premiers
  const visibleContenus = contenus
    ? isSignedIn ? contenus : contenus.slice(0, LIMIT_VISITEUR)
    : undefined;

  const totalContenus = contenus?.length ?? 0;
  const contenusCaches = !isSignedIn && totalContenus > LIMIT_VISITEUR
    ? totalContenus - LIMIT_VISITEUR
    : 0;

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

        {/* Filtres */}
        <div className="flex flex-wrap gap-3 mb-10">
          <FilterSelect label="Pays" value={filtres.pays} options={PAYS} onChange={setFiltre("pays")} />
          <FilterSelect label="Secteur" value={filtres.secteur} options={SECTEURS} onChange={setFiltre("secteur")} />
          <FilterSelect label="Occasion" value={filtres.occasion} options={OCCASIONS} onChange={setFiltre("occasion")} />
          <FilterSelect label="Format" value={filtres.format} options={FORMATS} onChange={setFiltre("format")} />
          <FilterSelect label="Année" value={filtres.annee} options={ANNEES} onChange={setFiltre("annee")} />
          <FilterSelect label="Type" value={filtres.type_contenu} options={TYPES} onChange={setFiltre("type_contenu")} />
          {hasFilters && (
            <button
              onClick={() => setFiltres({ pays: "", secteur: "", occasion: "", format: "", annee: "", type_contenu: "" })}
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
