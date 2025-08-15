import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const chatSessions = pgTable("chat_sessions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id"),
  mode: text("mode").notNull(), // 'guide', 'socrates', 'hard'
  messages: json("messages").$type<ChatMessage[]>().default([]),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const voiceInteractions = pgTable("voice_interactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionId: varchar("session_id").notNull(),
  audioUrl: text("audio_url"),
  transcription: text("transcription"),
  language: text("language").default("ja"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).pick({
  mode: true,
  messages: true,
});

export const insertVoiceInteractionSchema = createInsertSchema(voiceInteractions).pick({
  sessionId: true,
  audioUrl: true,
  transcription: true,
  language: true,
});

export const chatMessageSchema = z.object({
  id: z.string(),
  role: z.enum(["user", "assistant"]),
  content: z.string(),
  timestamp: z.string(),
  isVoice: z.boolean().optional(),
  audioUrl: z.string().optional(),
  transcription: z.string().optional(), // Original voice transcription for user messages
  sections: z.array(z.object({
    type: z.enum(["active_listening", "step_a", "step_b", "step_c", "feedback"]),
    content: z.string(),
    audioUrl: z.string().optional(),
  })).optional(),
});

export const consultantModeSchema = z.enum(["guide", "socrates", "hard"]);

export const voiceRequestSchema = z.object({
  sessionId: z.string(),
  audioData: z.string(), // base64 encoded audio
  language: z.string().default("ja"),
});

export const chatRequestSchema = z.object({
  sessionId: z.string().optional(),
  message: z.string(),
  mode: consultantModeSchema,
  isVoice: z.boolean().optional(),
});

export const voicePlaybackRequestSchema = z.object({
  text: z.string(),
  language: z.string().default("ja"),
  voice: z.string().default("alloy"),
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type ChatSession = typeof chatSessions.$inferSelect;
export type VoiceInteraction = typeof voiceInteractions.$inferSelect;
export type ChatMessage = z.infer<typeof chatMessageSchema>;
export type ConsultantMode = z.infer<typeof consultantModeSchema>;
export type VoiceRequest = z.infer<typeof voiceRequestSchema>;
export type ChatRequest = z.infer<typeof chatRequestSchema>;
export type VoicePlaybackRequest = z.infer<typeof voicePlaybackRequestSchema>;
