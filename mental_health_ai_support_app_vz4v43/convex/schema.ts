import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";
import { authTables } from "@convex-dev/auth/server";

const applicationTables = {
  conversations: defineTable({
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    sentiment: v.object({
      score: v.number(), // -1 to 1, negative = negative sentiment
      label: v.string(), // "positive", "negative", "neutral"
      confidence: v.number(), // 0 to 1
    }),
    audioTranscript: v.optional(v.string()),
    sessionId: v.string(),
  }).index("by_user", ["userId"])
    .index("by_session", ["sessionId"]),

  moodEntries: defineTable({
    userId: v.id("users"),
    mood: v.string(), // "happy", "sad", "anxious", "calm", etc.
    intensity: v.number(), // 1-10 scale
    notes: v.optional(v.string()),
    triggers: v.optional(v.array(v.string())),
  }).index("by_user", ["userId"]),

  userProfiles: defineTable({
    userId: v.id("users"),
    preferences: v.object({
      notifications: v.boolean(),
      reminderFrequency: v.string(), // "daily", "weekly", "never"
      preferredTherapyStyle: v.string(), // "cognitive", "mindfulness", "supportive"
    }),
    emergencyContacts: v.optional(v.array(v.object({
      name: v.string(),
      phone: v.string(),
      relationship: v.string(),
    }))),
  }).index("by_user", ["userId"]),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
