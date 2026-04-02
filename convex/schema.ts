import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({
  users: defineTable({
    clerkId: v.string(),
    email: v.optional(v.string()),
    nom: v.string(),
    prenom: v.string(),
    pays: v.optional(v.string()),
    bio: v.optional(v.string()),
    poste: v.optional(v.string()),
    linkedin_url: v.optional(v.string()),
    facebook_url: v.optional(v.string()),
    x_url: v.optional(v.string()),
    instagram_url: v.optional(v.string()),
    avatar_url: v.optional(v.string()),
    avatar_storage_id: v.optional(v.id("_storage")),
  }).index("by_clerk_id", ["clerkId"]),

  contenus: defineTable({
    userId: v.id("users"),
    titre: v.string(),
    marque: v.string(),
    pays: v.string(),
    secteur: v.string(),
    occasion: v.string(),
    format: v.string(),
    annee: v.string(),
    lien_publication: v.string(),
    visuel_url: v.optional(v.string()),
    visuel_storage_id: v.optional(v.id("_storage")),
    agence_creative: v.optional(v.string()),
    intention_creative: v.string(),
    type_contenu: v.optional(v.string()),
    anonyme: v.optional(v.boolean()),
    statut: v.union(
      v.literal("publie"),
      v.literal("rejete"),
      v.literal("masque")
    ),
    vues: v.number(),
    likes: v.optional(v.number()),
  })
    .index("by_user", ["userId"])
    .index("by_statut", ["statut"])
    .index("by_pays", ["pays"])
    .index("by_secteur", ["secteur"]),

  likes: defineTable({
    clerkId: v.string(),
    contenuId: v.id("contenus"),
  }).index("by_contenu_clerk", ["contenuId", "clerkId"]),
});
