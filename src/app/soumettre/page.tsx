"use client";

import { useState, useRef } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Immobilier", "Santé / Pharmacie", "Éducation / EdTech", "Transport / Mobilité", "Énergie / Solaire", "Agriculture / Agro-industrie", "Assurance", "E-commerce / Marketplace", "Tech / Startups", "Autre"];
const OCCASIONS = ["Saint-Valentin", "Fête des mères", "Fête des pères", "Fête nationale", "Rentrée scolaire", "Noël", "Lancement produit", "Ramadan", "Korité / Aïd el-Fitr", "Tabaski / Aïd el-Kébir", "Pâques", "Fête du travail", "Journée internationale des droits des femmes", "Journée internationale de la jeunesse", "Black Friday / Cyber Monday", "Journée mondiale de l'environnement", "Anniversaire de marque", "Autre"];
const FORMATS = ["Image statique", "Carrousel", "Vidéo", "Reel", "Story", "Autre"];
const ANNEES = ["2022", "2023", "2024", "2025", "2026"];
const TYPES = ["Publication organique", "Campagne payante", "UGC", "Influenceur", "Activation terrain", "Autre"];

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="block text-sm font-label font-medium text-on-surface-variant mb-1.5">
      {children} {required && <span className="text-error">*</span>}
    </label>
  );
}

function Input({ ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className="w-full bg-surface-container text-sm font-body text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50"
    />
  );
}

function Select({ children, ...props }: React.SelectHTMLAttributes<HTMLSelectElement>) {
  return (
    <select
      {...props}
      className="w-full bg-surface-container text-sm font-body text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 appearance-none cursor-pointer"
    >
      {children}
    </select>
  );
}

function Textarea({ ...props }: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className="w-full bg-surface-container text-sm font-body text-on-surface px-4 py-3 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary/30 placeholder:text-on-surface-variant/50 resize-none"
    />
  );
}

export default function SoumettreePage() {
  const { user } = useUser();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.contenus.generateUploadUrl);
  const submit = useMutation(api.contenus.submit);

  const [form, setForm] = useState({
    titre: "",
    marque: "",
    pays: "",
    secteur: "",
    occasion: "",
    format: "",
    annee: "",
    lien_publication: "",
    intention_creative: "",
    type_contenu: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const set = (key: keyof typeof form) => (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => setForm((f) => ({ ...f, [key]: e.target.value }));

  const handleFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > 5 * 1024 * 1024) {
      setError("Le fichier dépasse 5MB.");
      return;
    }
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!form.titre || !form.marque || !form.pays || !form.secteur || !form.occasion || !form.format || !form.annee || !form.lien_publication || !form.intention_creative) {
      setError("Merci de remplir tous les champs obligatoires.");
      return;
    }
    if (!file) {
      setError("Un visuel est obligatoire.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const uploadUrl = await generateUploadUrl();
      const res = await fetch(uploadUrl, {
        method: "POST",
        headers: { "Content-Type": file.type },
        body: file,
      });
      const { storageId } = await res.json();

      const id = await submit({
        clerkId: user.id,
        prenom: user.firstName ?? "",
        nom: user.lastName ?? "",
        ...form,
        visuel_storage_id: storageId,
        type_contenu: form.type_contenu || undefined,
      });

      router.push(`/contenu/${id}`);
    } catch {
      setError("Une erreur est survenue. Réessaie.");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-2xl mx-auto">
        <div className="mb-10">
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-2">
            Soumettre une campagne
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Elle sera publiée immédiatement dans la galerie.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre */}
          <div>
            <Label required>Titre de la campagne</Label>
            <Input placeholder="Ex : Renaissance Sahélienne" value={form.titre} onChange={set("titre")} />
          </div>

          {/* Marque */}
          <div>
            <Label required>Marque / Organisation</Label>
            <Input placeholder="Ex : SAFTIKING" value={form.marque} onChange={set("marque")} />
          </div>

          {/* Grid 2 colonnes */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Pays</Label>
              <Select value={form.pays} onChange={set("pays")}>
                <option value="">Sélectionner</option>
                {PAYS.map((p) => <option key={p} value={p}>{p}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Secteur</Label>
              <Select value={form.secteur} onChange={set("secteur")}>
                <option value="">Sélectionner</option>
                {SECTEURS.map((s) => <option key={s} value={s}>{s}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Occasion / Thème</Label>
              <Select value={form.occasion} onChange={set("occasion")}>
                <option value="">Sélectionner</option>
                {OCCASIONS.map((o) => <option key={o} value={o}>{o}</option>)}
              </Select>
            </div>
            <div>
              <Label required>Format</Label>
              <Select value={form.format} onChange={set("format")}>
                <option value="">Sélectionner</option>
                {FORMATS.map((f) => <option key={f} value={f}>{f}</option>)}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label required>Année</Label>
              <Select value={form.annee} onChange={set("annee")}>
                <option value="">Sélectionner</option>
                {ANNEES.map((a) => <option key={a} value={a}>{a}</option>)}
              </Select>
            </div>
            <div>
              <Label>Type de contenu</Label>
              <Select value={form.type_contenu} onChange={set("type_contenu")}>
                <option value="">Optionnel</option>
                {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
              </Select>
            </div>
          </div>

          {/* Lien */}
          <div>
            <Label required>Lien associé</Label>
            <Input type="url" placeholder="https://..." value={form.lien_publication} onChange={set("lien_publication")} />
          </div>

          {/* Upload visuel */}
          <div>
            <Label required>Visuel / Miniature (JPG ou PNG, max 5MB)</Label>
            <div
              onClick={() => fileInputRef.current?.click()}
              className="bg-surface-container rounded-2xl p-8 text-center cursor-pointer hover:bg-surface-container-high transition-colors"
            >
              {preview ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={preview} alt="preview" className="max-h-48 mx-auto rounded-xl object-cover" />
              ) : (
                <div className="text-on-surface-variant">
                  <p className="text-sm font-label font-medium mb-1">Clique pour uploader</p>
                  <p className="text-xs">JPG, PNG — max 5MB</p>
                </div>
              )}
            </div>
            <input ref={fileInputRef} type="file" accept="image/jpeg,image/png" className="hidden" onChange={handleFile} />
          </div>

          {/* Intention créative */}
          <div>
            <Label required>Intention créative</Label>
            <Textarea
              rows={4}
              maxLength={500}
              placeholder="Décris le contexte, les objectifs et les choix créatifs de cette campagne..."
              value={form.intention_creative}
              onChange={set("intention_creative")}
            />
            <p className="text-xs font-body text-on-surface-variant mt-1 text-right">
              {form.intention_creative.length}/500
            </p>
          </div>

          {/* Erreur */}
          {error && (
            <p className="text-sm font-body text-error bg-error-container/20 px-4 py-3 rounded-xl">
              {error}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full btn-gradient text-white font-label font-medium py-4 rounded-xl text-sm hover:opacity-90 transition-opacity disabled:opacity-60"
          >
            {loading ? "Publication en cours..." : "Publier dans la galerie"}
          </button>
        </form>
      </div>
    </div>
  );
}
