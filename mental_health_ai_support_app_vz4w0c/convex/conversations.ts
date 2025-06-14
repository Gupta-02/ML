import { v } from "convex/values";
import { query, mutation, internalQuery, internalMutation, internalAction } from "./_generated/server";
import { getAuthUserId } from "@convex-dev/auth/server";
import { internal } from "./_generated/api";

export const getConversations = query({
  args: { sessionId: v.optional(v.string()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];

    if (args.sessionId) {
      return await ctx.db
        .query("conversations")
        .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId!))
        .order("desc")
        .take(50);
    }

    return await ctx.db
      .query("conversations")
      .withIndex("by_user", (q) => q.eq("userId", userId))
      .order("desc")
      .take(50);
  },
});

export const sendMessage = mutation({
  args: { 
    message: v.string(), 
    sessionId: v.string(),
    audioTranscript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error("Not authenticated");

    // Schedule AI response generation
    await ctx.scheduler.runAfter(0, internal.conversations.generateAIResponse, {
      userId,
      message: args.message,
      sessionId: args.sessionId,
      audioTranscript: args.audioTranscript,
    });

    return { success: true };
  },
});

export const generateAIResponse = internalAction({
  args: {
    userId: v.id("users"),
    message: v.string(),
    sessionId: v.string(),
    audioTranscript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    // Analyze sentiment
    const sentiment = await analyzeSentiment(args.message);
    
    // Get conversation history for context
    const recentConversations = await ctx.runQuery(internal.conversations.getRecentConversations, {
      userId: args.userId,
      sessionId: args.sessionId,
    });

    // Generate AI response
    const aiResponse = await generateTherapeuticResponse(args.message, sentiment, recentConversations);

    // Save conversation
    await ctx.runMutation(internal.conversations.saveConversation, {
      userId: args.userId,
      message: args.message,
      response: aiResponse,
      sentiment,
      sessionId: args.sessionId,
      audioTranscript: args.audioTranscript,
    });

    return aiResponse;
  },
});

export const getRecentConversations = internalQuery({
  args: { userId: v.id("users"), sessionId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("conversations")
      .withIndex("by_session", (q) => q.eq("sessionId", args.sessionId))
      .order("desc")
      .take(10);
  },
});

export const saveConversation = internalMutation({
  args: {
    userId: v.id("users"),
    message: v.string(),
    response: v.string(),
    sentiment: v.object({
      score: v.number(),
      label: v.string(),
      confidence: v.number(),
    }),
    sessionId: v.string(),
    audioTranscript: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await ctx.db.insert("conversations", args);
  },
});

async function analyzeSentiment(text: string) {
  // Simple sentiment analysis - in production, you'd use a proper NLP service
  const positiveWords = ['happy', 'good', 'great', 'wonderful', 'amazing', 'love', 'joy', 'excited', 'grateful', 'peaceful'];
  const negativeWords = ['sad', 'bad', 'terrible', 'awful', 'hate', 'angry', 'depressed', 'anxious', 'worried', 'stressed'];
  
  const words = text.toLowerCase().split(/\s+/);
  let positiveCount = 0;
  let negativeCount = 0;
  
  words.forEach(word => {
    if (positiveWords.some(pw => word.includes(pw))) positiveCount++;
    if (negativeWords.some(nw => word.includes(nw))) negativeCount++;
  });
  
  const totalSentimentWords = positiveCount + negativeCount;
  if (totalSentimentWords === 0) {
    return { score: 0, label: "neutral", confidence: 0.5 };
  }
  
  const score = (positiveCount - negativeCount) / totalSentimentWords;
  const label = score > 0.1 ? "positive" : score < -0.1 ? "negative" : "neutral";
  const confidence = Math.abs(score);
  
  return { score, label, confidence };
}

async function generateTherapeuticResponse(message: string, sentiment: any, history: any[]) {
  const openai = await import("openai");
  const client = new openai.default({
    baseURL: process.env.CONVEX_OPENAI_BASE_URL,
    apiKey: process.env.CONVEX_OPENAI_API_KEY,
  });

  const contextMessages = history.slice(0, 5).reverse().map(conv => [
    { role: "user" as const, content: conv.message },
    { role: "assistant" as const, content: conv.response }
  ]).flat();

  const systemPrompt = `You are a compassionate AI mental health support assistant. Your role is to:
- Provide empathetic, non-judgmental support
- Use active listening techniques
- Offer coping strategies and mindfulness exercises
- Encourage professional help when appropriate
- Never diagnose or provide medical advice
- Be warm, understanding, and supportive

Current user sentiment: ${sentiment.label} (confidence: ${Math.round(sentiment.confidence * 100)}%)

Respond with empathy and provide helpful, therapeutic guidance.`;

  try {
    const response = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        ...contextMessages,
        { role: "user", content: message }
      ],
      max_tokens: 300,
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content || "I'm here to listen and support you. Could you tell me more about how you're feeling?";
  } catch (error) {
    console.error("AI response generation failed:", error);
    return "I'm here to support you. Sometimes I have trouble finding the right words, but I want you to know that your feelings are valid and you're not alone.";
  }
}
