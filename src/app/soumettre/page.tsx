"use client";

import { useState, useRef, useMemo } from "react";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";

const PAYS = ["Bénin", "Côte d'Ivoire", "Sénégal", "Cameroun", "Togo", "Mali", "Burkina Faso", "Congo", "Autre"];
const SECTEURS = ["Télécom", "Banque / Finance", "FMCG", "Mode / Beauté", "Restauration", "Médias", "ONG / Institutionnel", "iGaming", "Immobilier", "Santé / Pharmacie", "Éducation / EdTech", "Transport / Mobilité", "Énergie / Solaire", "Agriculture / Agro-industrie", "Assurance", "E-commerce / Marketplace", "Tech / Startups", "Autre"];
const OCCASIONS = ["Saint-Valentin", "Fête des mères", "Fête des pères", "Fête nationale", "Rentrée scolaire", "Noël", "Lancement produit", "Ramadan", "Korité / Aïd el-Fitr", "Tabaski / Aïd el-Kébir", "Pâques", "Fête du travail", "Journée internationale des droits des femmes", "Journée internationale de la jeunesse", "Black Friday / Cyber Monday", "Journée mondiale de l'environnement", "Anniversaire de marque", "Autre"];
const FORMATS = ["Image statique", "Carrousel", "Vidéo", "Reel", "Story", "Autre"];
const ANNEES = ["2018", "2019", "2020", "2021", "2022", "2023", "2024", "2025", "2026"];
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
  const imagesSuppRef = useRef<HTMLInputElement>(null);

  const generateUploadUrl = useMutation(api.contenus.generateUploadUrl);
  const submit = useMutation(api.contenus.submit);
  const allUsers = useQuery(api.users.listAll, {});

  const [form, setForm] = useState({
    titre: "",
    marque: "",
    agence_creative: "",
    pays: "",
    secteur: "",
    occasion: "",
    format: "",
    annee: "",
    lien_publication: "",
    intention_creative: "",
    type_contenu: "",
  });
  const [occasionLibre, setOccasionLibre] = useState("");
  const [anonyme, setAnonyme] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imagesSupp, setImagesSupp] = useState<File[]>([]);
  const [imagesSuppPreviews, setImagesSuppPreviews] = useState<string[]>([]);
  const [coContribs, setCoContribs] = useState<string[]>([]);
  const [coSearch, setCoSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const coSearchResults = useMemo(() => {
    if (!coSearch.trim() || !allUsers) return [];
    const q = coSearch.toLowerCase();
    return allUsers
      .filter((u) =>
        u.clerkId !== user?.id &&
        !coContribs.includes(u.clerkId) &&
        (`${u.prenom} ${u.nom}`.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [coSearch, allUsers, user?.id, coContribs]);

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
    if (form.occasion === "Autre" && !occasionLibre.trim()) {
      setError("Merci de préciser l'occasion.");
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

      const suppIds: string[] = [];
      for (const f of imagesSupp) {
        const suppUploadUrl = await generateUploadUrl();
        const suppRes = await fetch(suppUploadUrl, { method: "POST", headers: { "Content-Type": f.type }, body: f });
        const { storageId: suppStorageId } = await suppRes.json();
        suppIds.push(suppStorageId);
      }

      const id = await submit({
        clerkId: user.id,
        prenom: user.firstName ?? "",
        nom: user.lastName ?? "",
        ...form,
        occasion: form.occasion === "Autre" ? occasionLibre.trim() : form.occasion,
        visuel_storage_id: storageId,
        images_supplementaires_storage_ids: suppIds.length ? suppIds as Parameters<typeof submit>[0]["images_supplementaires_storage_ids"] : undefined,
        agence_creative: form.agence_creative || undefined,
        type_contenu: form.type_contenu || undefined,
        anonyme,
        co_contributeurs_clerk_ids: coContribs.length ? coContribs : undefined,
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
            <Label required>Annonceur / Marque</Label>
            <Input placeholder="Ex : SAFTIKING" value={form.marque} onChange={set("marque")} />
          </div>

          {/* Agence créative */}
          <div>
            <Label>Agence créative</Label>
            <Input placeholder="Ex : DDB Africa (optionnel)" value={form.agence_creative} onChange={set("agence_creative")} />
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
              {form.occasion === "Autre" && (
                <div className="mt-2">
                  <Input
                    placeholder="Précise l'occasion..."
                    value={occasionLibre}
                    onChange={(e) => setOccasionLibre(e.target.value)}
                    maxLength={80}
                  />
                </div>
              )}
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

          {/* Images supplémentaires */}
          <div>
            <Label>Images supplémentaires <span className="text-on-surface-variant/60 font-normal">(optionnel, max 5)</span></Label>
            <div className="flex flex-wrap gap-2">
              {imagesSuppPreviews.map((url, idx) => (
                <div key={idx} className="relative w-20 h-20 rounded-xl overflow-hidden group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={url} alt="" className="w-full h-full object-cover" />
                  <button
                    type="button"
                    onClick={() => {
                      setImagesSupp(prev => prev.filter((_, i) => i !== idx));
                      setImagesSuppPreviews(prev => prev.filter((_, i) => i !== idx));
                    }}
                    className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-2xl"
                  >×</button>
                </div>
              ))}
              {imagesSupp.length < 5 && (
                <div
                  onClick={() => imagesSuppRef.current?.click()}
                  className="w-20 h-20 rounded-xl bg-surface-container border-2 border-dashed border-outline-variant flex flex-col items-center justify-center cursor-pointer hover:bg-surface-container-high transition-colors gap-1"
                >
                  <span className="text-on-surface-variant text-xl leading-none">+</span>
                  <span className="text-xs font-label text-on-surface-variant">Ajouter</span>
                </div>
              )}
            </div>
            <input ref={imagesSuppRef} type="file" accept="image/jpeg,image/png" multiple className="hidden" onChange={(e) => {
              const files = Array.from(e.target.files ?? []).filter(f => f.size <= 5 * 1024 * 1024).slice(0, 5 - imagesSupp.length);
              setImagesSupp(prev => [...prev, ...files]);
              setImagesSuppPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
            }} />
          </div>

          {/* Intention créative */}
          <div>
            <Label required>Intention créative</Label>
            <Textarea
              rows={4}
              maxLength={700}
              placeholder="Décris le contexte, les objectifs et les choix créatifs de cette campagne..."
              value={form.intention_creative}
              onChange={set("intention_creative")}
            />
            <p className="text-xs font-body text-on-surface-variant mt-1 text-right">
              {form.intention_creative.length}/700
            </p>
          </div>

          {/* Co-contributeurs */}
          <div>
            <Label>Co-contributeurs <span className="text-on-surface-variant/60 font-normal">(optionnel)</span></Label>
            {coContribs.length > 0 && (
              <div className="flex flex-wrap gap-1.5 mb-2">
                {coContribs.map((clerkId) => {
                  const u = allUsers?.find((x) => x.clerkId === clerkId);
                  return (
                    <span key={clerkId} className="flex items-center gap-1 bg-primary/10 text-primary text-xs font-label px-2 py-1 rounded-full">
                      {u ? `${u.prenom} ${u.nom}` : clerkId}
                      <button type="button" onClick={() => setCoContribs(prev => prev.filter(id => id !== clerkId))} className="hover:opacity-60 ml-0.5">×</button>
                    </span>
                  );
                })}
              </div>
            )}
            <div className="relative">
              <Input
                value={coSearch}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCoSearch(e.target.value)}
                placeholder="Chercher un membre de la communauté..."
              />
              {coSearchResults.length > 0 && (
                <div className="absolute z-10 top-full mt-1 left-0 right-0 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/20 overflow-hidden">
                  {coSearchResults.map((u) => (
                    <button
                      key={u._id}
                      type="button"
                      onClick={() => { setCoContribs(prev => [...prev, u.clerkId]); setCoSearch(""); }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-left hover:bg-surface-container transition-colors"
                    >
                      <div className="w-7 h-7 rounded-lg bg-surface-container flex-shrink-0 relative overflow-hidden">
                        {u.avatar_url ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={u.avatar_url} alt="" className="w-full h-full object-cover" />
                        ) : (
                          <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-primary">{u.prenom.charAt(0)}</span>
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-body text-on-surface">{u.prenom} {u.nom}</p>
                        {u.poste && <p className="text-xs font-label text-on-surface-variant">{u.poste}</p>}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contribution anonyme */}
          <div
            className="flex items-start gap-3 bg-surface-container rounded-2xl px-4 py-4 cursor-pointer"
            onClick={() => setAnonyme((v) => !v)}
          >
            <div className={`mt-0.5 w-5 h-5 rounded flex-shrink-0 border-2 flex items-center justify-center transition-colors ${anonyme ? "bg-primary border-primary" : "border-outline-variant"}`}>
              {anonyme && <span className="text-white text-xs font-bold">✓</span>}
            </div>
            <div>
              <p className="text-sm font-label font-medium text-on-surface">Soumettre de façon anonyme</p>
              <p className="text-xs font-body text-on-surface-variant mt-0.5">Ton nom n&apos;apparaîtra pas sur cette campagne dans la galerie.</p>
            </div>
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
