import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Crée ou met à jour le profil lors de la connexion via Clerk
export const upsertUser = mutation({
  args: {
    clerkId: v.string(),
    nom: v.string(),
    prenom: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerk_id", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) return existing._id;

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      nom: args.nom,
      prenom: args.prenom,
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

// Met à jour le profil
export const updateProfile = mutation({
  args: {
    clerkId: v.string(),
    nom: v.string(),
    prenom: v.string(),
    pays: v.optional(v.string()),
    bio: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
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
      pays: args.pays,
      bio: args.bio,
      linkedin_url: args.linkedin_url,
      avatar_storage_id: args.avatar_storage_id ?? user.avatar_storage_id,
      avatar_url,
    });
  },
});

// Génère une URL d'upload pour l'avatar
export const generateAvatarUploadUrl = mutation({
  args: {},
  handler: async (ctx) => {
    return await ctx.storage.generateUploadUrl();
  },
});
