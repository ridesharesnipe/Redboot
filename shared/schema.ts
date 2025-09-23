import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  integer,
  boolean,
  text,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Children table for parent-child relationships
export const children = pgTable("children", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  parentId: varchar("parent_id").references(() => users.id, { onDelete: 'cascade' }).notNull(),
  name: varchar("name").notNull(),
  age: integer("age"),
  grade: varchar("grade"),
  unlockedCharacters: jsonb("unlocked_characters").$type<string[]>().default(['red-boot']),
  totalPoints: integer("total_points").default(0),
  weeklyStreak: integer("weekly_streak").default(0),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Word lists table
export const wordLists = pgTable("word_lists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id, { onDelete: 'cascade' }).notNull(),
  weekNumber: integer("week_number").notNull(),
  words: jsonb("words").$type<string[]>().notNull(),
  createdDate: timestamp("created_date").defaultNow(),
  testDate: timestamp("test_date"),
  practiceCount: integer("practice_count").default(0),
  bestScore: integer("best_score").default(0),
});

// Progress tracking table
export const progress = pgTable("progress", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  childId: varchar("child_id").references(() => children.id, { onDelete: 'cascade' }).notNull(),
  wordListId: varchar("word_list_id").references(() => wordLists.id, { onDelete: 'cascade' }).notNull(),
  characterUsed: varchar("character_used").notNull().default('red-boot'),
  correctWords: jsonb("correct_words").$type<string[]>().default([]),
  incorrectWords: jsonb("incorrect_words").$type<string[]>().default([]),
  timeSpent: integer("time_spent").default(0), // in seconds
  score: integer("score").default(0),
  completedAt: timestamp("completed_at").defaultNow(),
});

// Photos table for storing spelling list photos
export const photos = pgTable("photos", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  objectPath: varchar("object_path").notNull(), // Path to the photo in object storage
  wordsCount: integer("words_count").default(0), // Number of words extracted
  extractedWords: text("extracted_words").array().default([]), // Words found in photo
  capturedAt: timestamp("captured_at").defaultNow(),
  weekStart: timestamp("week_start").notNull(), // Week the photo belongs to
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  children: many(children),
}));

export const childrenRelations = relations(children, ({ one, many }) => ({
  parent: one(users, {
    fields: [children.parentId],
    references: [users.id],
  }),
  wordLists: many(wordLists),
  progress: many(progress),
}));

export const wordListsRelations = relations(wordLists, ({ one, many }) => ({
  child: one(children, {
    fields: [wordLists.childId],
    references: [children.id],
  }),
  progress: many(progress),
}));

export const progressRelations = relations(progress, ({ one }) => ({
  child: one(children, {
    fields: [progress.childId],
    references: [children.id],
  }),
  wordList: one(wordLists, {
    fields: [progress.wordListId],
    references: [wordLists.id],
  }),
}));

// Zod schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChildSchema = createInsertSchema(children).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertWordListSchema = createInsertSchema(wordLists).omit({
  id: true,
  createdDate: true,
});

export const insertProgressSchema = createInsertSchema(progress).omit({
  id: true,
  completedAt: true,
});

export const insertPhotoSchema = createInsertSchema(photos).omit({
  id: true,
  capturedAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertChild = z.infer<typeof insertChildSchema>;
export type Child = typeof children.$inferSelect;
export type InsertWordList = z.infer<typeof insertWordListSchema>;
export type WordList = typeof wordLists.$inferSelect;
export type InsertProgress = z.infer<typeof insertProgressSchema>;
export type Progress = typeof progress.$inferSelect;
export type InsertPhoto = z.infer<typeof insertPhotoSchema>;
export type Photo = typeof photos.$inferSelect;
