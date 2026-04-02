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
    const slug = generateSlug(`${args.prenom}-${args.nom}-${memberNumber}`);

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
    if (args.idOrSlug.includes("-")) {
      return await ctx.db
        .query("users")
        .withIndex("by_slug", (q) => q.eq("slug", args.idOrSlug))
        .first();
    } else {
      return await ctx.db.get(args.idOrSlug as Id<"users">);
    }
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
      .unique();

    if (!user) throw new Error("Utilisateur introuvable");

    let avatar_url = user.avatar_url;
    if (args.avatar_storage_id) {
      avatar_url = (await ctx.storage.getUrl(args.avatar_storage_id)) ?? undefined;
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
      if (!u.slug || !u.memberNumber) {
        const memberNumber = i + 1;
        const slug = generateSlug(`${u.prenom}-${u.nom}-${memberNumber}`);
        await ctx.db.patch(u._id, { slug, memberNumber });
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
