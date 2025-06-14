import { v } from "convex/values";
import { query, mutation } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getMoodHistory = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    return await ctx.db
      .query("moodEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);
  },
});

export const logMood = mutation({
  args: {
    mood: v.string(),
    intensity: v.number(),
    notes: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    await ctx.db.insert("moodEntries", {
      userId,
      ...args,
    });
  },
});

export const getMoodStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;

    const entries = await ctx.db
      .query("moodEntries")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(30);

    if (entries.length === 0) return null;

    const avgIntensity = entries.reduce((sum, entry) => sum + entry.intensity, 0) / entries.length;
    const moodCounts = entries.reduce((acc, entry) => {
      acc[entry.mood] = (acc[entry.mood] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    return {
      avgIntensity: Math.round(avgIntensity * 10) / 10,
      mostCommonMood,
      totalEntries: entries.length,
      recentTrend: entries.slice(0, 7).reduce((sum, entry) => sum + entry.intensity, 0) / Math.min(7, entries.length),
    };
  },
});
