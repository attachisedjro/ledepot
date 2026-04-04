import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";

export function generateSlug(text: string): string {
  return text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// Liste tous les contenus publiés avec filtres optionnels
export const list = query({
  args: {
    pays: v.optional(v.string()),
    secteur: v.optional(v.string()),
    occasion: v.optional(v.string()),
    format: v.optional(v.string()),
    annee: v.optional(v.string()),
    type_contenu: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let contenus = await ctx.db
      .query("contenus")
      .withIndex("by_statut", (q) => q.eq("statut", "publie"))
      .order("desc")
      .collect();

    if (args.pays) contenus = contenus.filter((c) => c.pays === args.pays);
    if (args.secteur) contenus = contenus.filter((c) => c.secteur === args.secteur);
    if (args.occasion) contenus = contenus.filter((c) => c.occasion === args.occasion);
    if (args.format) contenus = contenus.filter((c) => c.format === args.format);
    if (args.annee) contenus = contenus.filter((c) => c.annee === args.annee);
    if (args.type_contenu) contenus = contenus.filter((c) => c.type_contenu === args.type_contenu);

    // Enrichir avec les infos du contributeur
    return await Promise.all(
      contenus.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return { ...c, cm: (c.anonyme || !user) ? "Anonyme" : `${user.prenom} ${user.nom}` };
      })
    );
  },
});

// Campagne du jour (épinglée par l'admin)
export const getCampagneDuJour = query({
  args: {},
  handler: async (ctx) => {
    const c = await ctx.db
      .query("contenus")
      .withIndex("by_campagne_du_jour", (q) => q.eq("campagne_du_jour", true))
      .first();
    if (!c) return null;
    const user = await ctx.db.get(c.userId);
    return { ...c, user };
  },
});

// Coups de cœur de la semaine (jusqu'à 3, épinglés par l'admin)
export const getCoupDeCoeur = query({
  args: {},
  handler: async (ctx) => {
    const liste = await ctx.db
      .query("contenus")
      .withIndex("by_coup_de_coeur", (q) => q.eq("coup_de_coeur", true))
      .collect();
    return await Promise.all(
      liste.slice(0, 3).map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return { ...c, user };
      })
    );
  },
});

// Admin — définit la campagne du jour (une seule à la fois)
export const setCampagneDuJour = mutation({
  args: { id: v.optional(v.id("contenus")) },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("contenus")
      .withIndex("by_campagne_du_jour", (q) => q.eq("campagne_du_jour", true))
      .collect();
    for (const c of existing) {
      await ctx.db.patch(c._id, { campagne_du_jour: false });
    }
    if (args.id) await ctx.db.patch(args.id, { campagne_du_jour: true });
  },
});

// Admin — toggle coup de cœur (max 3 simultanément)
export const setCoupDeCoeur = mutation({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    const contenu = await ctx.db.get(args.id);
    if (!contenu) return;
    if (contenu.coup_de_coeur) {
      // Désépingler
      await ctx.db.patch(args.id, { coup_de_coeur: false });
    } else {
      // Vérifier qu'on n'a pas déjà 3 coups de cœur
      const existing = await ctx.db
        .query("contenus")
        .withIndex("by_coup_de_coeur", (q) => q.eq("coup_de_coeur", true))
        .collect();
      if (existing.length >= 3) {
        // Retirer le plus ancien pour laisser la place
        await ctx.db.patch(existing[0]._id, { coup_de_coeur: false });
      }
      await ctx.db.patch(args.id, { coup_de_coeur: true });
    }
  },
});

// Récupère un contenu par id (avec infos CM)
export const getById = query({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    const contenu = await ctx.db.get(args.id);
    if (!contenu) return null;
    const user = await ctx.db.get(contenu.userId);
    return { ...contenu, user };
  },
});

// Récupère un contenu par slug ou id Convex (rétrocompat)
export const getByIdOrSlug = query({
  args: { idOrSlug: v.string() },
  handler: async (ctx, args) => {
    // Les slugs contiennent toujours un tiret, les IDs Convex jamais
    if (args.idOrSlug.includes("-")) {
      const contenu = await ctx.db
        .query("contenus")
        .withIndex("by_slug", (q) => q.eq("slug", args.idOrSlug))
        .first();
      if (!contenu) return null;
      const user = await ctx.db.get(contenu.userId);
      return { ...contenu, user };
    } else {
      const contenu = await ctx.db.get(args.idOrSlug as Id<"contenus">);
      if (!contenu) return null;
      const user = await ctx.db.get(contenu.userId);
      return { ...contenu, user };
    }
  },
});

// Contenus d'un utilisateur spécifique
export const getByUser = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("contenus")
      .withIndex("by_user", (q) => q.eq("userId", args.userId))
      .order("desc")
      .collect();
  },
});

// Soumet un nouveau contenu (publié directement)
export const submit = mutation({
  args: {
    clerkId: v.string(),
    prenom: v.optional(v.string()),
    nom: v.optional(v.string()),
    titre: v.string(),
    marque: v.string(),
    pays: v.string(),
    secteur: v.string(),
    occasion: v.string(),
    format: v.string(),
    annee: v.string(),
    lien_publication: v.string(),
    visuel_storage_id: v.optional(v.id("_storage")),
    agence_creative: v.optional(v.string()),
    intention_creative: v.string(),
    type_contenu: v.optional(v.string()),
    anonyme: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    let user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (!user) {
      const userId = await ctx.db.insert("users", {
        clerkId: args.clerkId,
        prenom: args.prenom ?? "",
        nom: args.nom ?? "",
      });
      user = await ctx.db.get(userId);
    }

    if (!user) throw new Error("Impossible de créer l'utilisateur");

    let visuel_url: string | undefined;
    if (args.visuel_storage_id) {
      visuel_url = (await ctx.storage.getUrl(args.visuel_storage_id)) ?? undefined;
    }

    // Générer un slug unique
    const baseSlug = generateSlug(`${args.marque}-${args.titre}`);
    let slug = baseSlug;
    let counter = 2;
    while (true) {
      const existing = await ctx.db
        .query("contenus")
        .withIndex("by_slug", (q) => q.eq("slug", slug))
        .first();
      if (!existing) break;
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    return await ctx.db.insert("contenus", {
      userId: user._id,
      titre: args.titre,
      marque: args.marque,
      pays: args.pays,
      secteur: args.secteur,
      occasion: args.occasion,
      format: args.format,
      annee: args.annee,
      lien_publication: args.lien_publication,
      visuel_storage_id: args.visuel_storage_id,
      visuel_url,
      agence_creative: args.agence_creative,
      intention_creative: args.intention_creative,
      type_contenu: args.type_contenu,
      anonyme: args.anonyme ?? false,
      statut: "publie",
      vues: 0,
      slug,
    });
  },
});

// Génère une URL d'upload pour le visuel
export const generateUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});

// Met à jour un contenu (par son propriétaire)
export const updateContenu = mutation({
  args: {
    id: v.id("contenus"),
    clerkId: v.string(),
    titre: v.string(),
    marque: v.string(),
    agence_creative: v.optional(v.string()),
    pays: v.string(),
    secteur: v.string(),
    occasion: v.string(),
    format: v.string(),
    annee: v.string(),
    lien_publication: v.string(),
    intention_creative: v.string(),
    type_contenu: v.optional(v.string()),
    anonyme: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const contenu = await ctx.db.get(args.id);
    if (!contenu) throw new Error("Contenu introuvable");
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
    if (!user || contenu.userId !== user._id) throw new Error("Non autorisé");
    await ctx.db.patch(args.id, {
      titre: args.titre,
      marque: args.marque,
      agence_creative: args.agence_creative,
      pays: args.pays,
      secteur: args.secteur,
      occasion: args.occasion,
      format: args.format,
      annee: args.annee,
      lien_publication: args.lien_publication,
      intention_creative: args.intention_creative,
      type_contenu: args.type_contenu,
      anonyme: args.anonyme ?? false,
    });
  },
});

// Admin — liste tous les contenus sans filtre de statut
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    const contenus = await ctx.db.query("contenus").order("desc").collect();
    return await Promise.all(
      contenus.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return { ...c, cm: user ? `${user.prenom} ${user.nom}` : "Anonyme" };
      })
    );
  },
});

// Admin — remet un contenu en statut publié
export const republier = mutation({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { statut: "publie" });
  },
});

// Admin — masque un contenu
export const masquer = mutation({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    await ctx.db.patch(args.id, { statut: "masque" });
  },
});

// Admin — supprime un contenu
export const supprimer = mutation({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.id);
  },
});

// Admin — backfill slugs pour les contenus existants
export const backfillSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const contenus = await ctx.db.query("contenus").collect();
    let count = 0;
    for (const c of contenus) {
      if (!c.slug) {
        const baseSlug = generateSlug(`${c.marque}-${c.titre}`);
        let slug = baseSlug;
        let counter = 2;
        while (true) {
          const existing = await ctx.db
            .query("contenus")
            .withIndex("by_slug", (q) => q.eq("slug", slug))
            .first();
          if (!existing || existing._id === c._id) break;
          slug = `${baseSlug}-${counter}`;
          counter++;
        }
        await ctx.db.patch(c._id, { slug });
        count++;
      }
    }
    return { updated: count };
  },
});

// Incrémente les vues
export const incrementerVues = mutation({
  args: { id: v.id("contenus") },
  handler: async (ctx, args) => {
    const contenu = await ctx.db.get(args.id);
    if (contenu) {
      await ctx.db.patch(args.id, { vues: contenu.vues + 1 });
    }
  },
});
