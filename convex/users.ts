import { v } from "convex/values";
import { mutation, query } from "./_generated/server";
import type { Id } from "./_generated/dataModel";
import { generateSlug } from "./contenus";

// Crée ou met à jour le profil lors de la connexion via Clerk
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    nom: v.string(),
    prenom: v.string(),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      // Met à jour l'email si pas encore renseigné
      if (args.email && !existing.email) {
        await ctx.db.patch(existing._id, { email: args.email });
      }
      return existing._id;
    }

    // Assigner un numéro de membre séquentiel
    const allUsers = await ctx.db.query("users").collect();
    const memberNumber = allUsers.length + 1;
    const prenom = args.prenom || "membre";
    const nom = args.nom || "";
    const base = nom ? `${prenom}-${nom}-${memberNumber}` : `${prenom}-${memberNumber}`;
    const slug = generateSlug(base);

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      email: args.email,
      nom: args.nom,
      prenom: args.prenom,
      slug,
      memberNumber,
    });
  },
});

// Récupère un profil par clerkId
export const getByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

// Récupère un profil public par id
export const getById = query({
  args: { id: v.id("users") },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.id);
  },
});

// Récupère un profil par slug ou id Convex (rétrocompat)
export const getByIdOrSlug = query({
  args: { idOrSlug: v.string() },
  handler: async (ctx, args) => {
    // Toujours essayer le slug en premier
    const bySlug = await ctx.db
      .query("users")
      .withIndex("by_slug", (q) => q.eq("slug", args.idOrSlug))
      .first();
    if (bySlug) return bySlug;
    // Fallback : ID Convex (pas de tiret = probablement un ID)
    if (!args.idOrSlug.includes("-")) {
      try {
        return await ctx.db.get(args.idOrSlug as Id<"users">);
      } catch {
        return null;
      }
    }
    return null;
  },
});

// Admin — liste tous les utilisateurs
export const listAll = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db.query("users").collect();
  },
});

// Met à jour le profil
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    nom: v.string(),
    prenom: v.string(),
    poste: v.optional(v.string()),
    pays: v.optional(v.string()),
    bio: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    x_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),
    avatar_storage_id: v.optional(v.id("_storage")),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .first();

    if (!user) throw new Error("Profil introuvable. Déconnecte-toi et reconnecte-toi pour recréer ton profil.");

    let avatar_url = user.avatar_url;
    if (args.avatar_storage_id) {
      avatar_url = (await ctx.storage.getUrl(args.avatar_storage_id)) ?? undefined;
    }

    // Mettre à jour le slug si c'est un slug par défaut (numérique, "membre-X", vide)
    // ou si le prénom/nom a réellement changé par rapport à ce qui est dans le slug actuel
    let slugUpdate: { slug?: string } = {};
    const prenomChanged = args.prenom && args.prenom !== user.prenom;
    const nomChanged = args.nom !== user.nom;
    const isDefaultSlug =
      !user.slug ||
      /^\d+$/.test(user.slug) ||
      user.slug.startsWith("membre-");

    if (args.prenom && args.prenom.trim() && (isDefaultSlug || prenomChanged || nomChanged)) {
      const baseSlug = generateSlug(
        args.nom?.trim()
          ? `${args.prenom.trim()}-${args.nom.trim()}`
          : args.prenom.trim()
      );

      // Chercher un slug unique : essayer d'abord avec memberNumber, sinon incrémenter
      let memberSuffix = user.memberNumber;
      if (!memberSuffix) {
        // Assigner un memberNumber si absent : compter tous les users
        const allUsers = await ctx.db.query("users").collect();
        memberSuffix = allUsers.length;
        await ctx.db.patch(user._id, { memberNumber: memberSuffix });
      }

      let candidate = `${baseSlug}-${memberSuffix}`;
      // Vérifier l'unicité (au cas où deux users auraient le même nom + numéro)
      let attempts = 0;
      while (attempts < 10) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_slug", (q) => q.eq("slug", candidate))
          .first();
        if (!conflict || conflict._id === user._id) break;
        attempts++;
        candidate = `${baseSlug}-${memberSuffix}-${attempts}`;
      }
      slugUpdate = { slug: candidate };
    }

    await ctx.db.patch(user._id, {
      nom: args.nom,
      prenom: args.prenom,
      poste: args.poste,
      pays: args.pays,
      bio: args.bio,
      linkedin_url: args.linkedin_url,
      facebook_url: args.facebook_url,
      x_url: args.x_url,
      instagram_url: args.instagram_url,
      avatar_storage_id: args.avatar_storage_id ?? user.avatar_storage_id,
      avatar_url,
      ...slugUpdate,
    });
  },
});

// Admin — backfill slugs et numéros de membre pour les utilisateurs existants
export const backfillUserSlugs = mutation({
  args: {},
  handler: async (ctx) => {
    const users = await ctx.db.query("users").order("asc").collect();
    let count = 0;
    for (let i = 0; i < users.length; i++) {
      const u = users[i];
      const memberNumber = u.memberNumber ?? (i + 1);
      const prenom = u.prenom?.trim() || "membre";
      const nom = u.nom?.trim() || "";
      const base = nom
        ? generateSlug(`${prenom}-${nom}-${memberNumber}`)
        : generateSlug(`${prenom}-${memberNumber}`);

      // S'assurer que le slug est unique
      let candidate = base || `membre-${memberNumber}`;
      let attempts = 0;
      while (attempts < 10) {
        const conflict = await ctx.db
          .query("users")
          .withIndex("by_slug", (q) => q.eq("slug", candidate))
          .first();
        if (!conflict || conflict._id === u._id) break;
        attempts++;
        candidate = `${base}-${attempts}`;
      }

      if (!u.memberNumber || !u.slug || /^\d+$/.test(u.slug) || u.slug.startsWith("membre-")) {
        await ctx.db.patch(u._id, { slug: candidate, memberNumber });
        count++;
      }
    }
    return { updated: count };
  },
});

// Génère une URL d'upload pour l'avatar
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
