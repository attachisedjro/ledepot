import { v } from "convex/values";
import { mutation, query } from "./_generated/server";

// Toggle like (add or remove)
export const toggleLike = mutation({
  args: {
    clerkId: v.string(),
    contenuId: v.id("contenus"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_contenu_clerk", (q) =>
        q.eq("contenuId", args.contenuId).eq("clerkId", args.clerkId)
      )
      .unique();

    if (existing) {
      await ctx.db.delete(existing._id);
      const contenu = await ctx.db.get(args.contenuId);
      if (contenu) {
        await ctx.db.patch(args.contenuId, {
          likes: Math.max(0, (contenu.likes ?? 0) - 1),
        });
      }
      return false; // unliked
    } else {
      await ctx.db.insert("likes", {
        clerkId: args.clerkId,
        contenuId: args.contenuId,
      });
      const contenu = await ctx.db.get(args.contenuId);
      if (contenu) {
        await ctx.db.patch(args.contenuId, {
          likes: (contenu.likes ?? 0) + 1,
        });
      }
      return true; // liked
    }
  },
});

// Check if a user has liked a specific contenu
export const hasLiked = query({
  args: {
    clerkId: v.string(),
    contenuId: v.id("contenus"),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("likes")
      .withIndex("by_contenu_clerk", (q) =>
        q.eq("contenuId", args.contenuId).eq("clerkId", args.clerkId)
      )
      .unique();
    return !!existing;
  },
});
