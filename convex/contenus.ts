import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

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

    // Enrichir avec les infos du CM
    return await Promise.all(
      contenus.map(async (c) => {
        const user = await ctx.db.get(c.userId);
        return { ...c, cm: user ? `${user.prenom} ${user.nom}` : "Anonyme" };
      })
    );
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
    intention_creative: v.string(),
    type_contenu: v.optional(v.string()),
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
      intention_creative: args.intention_creative,
      type_contenu: args.type_contenu,
      statut: "publie",
      vues: 0,
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
