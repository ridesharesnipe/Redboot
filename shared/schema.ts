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

// User storage table (now for anonymous players - no auth required)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sessionToken: varchar("session_token"), // Secret token for anonymous session security
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  stripeCustomerId: varchar("stripe_customer_id"),
  stripeSubscriptionId: varchar("stripe_subscription_id"),
  isPremium: boolean("is_premium").default(false),
  onboardingComplete: boolean("onboarding_complete").default(false),
  childName: varchar("child_name"),
  gradeLevel: varchar("grade_level"),
  // Red Boot's Treasure Vault
  treasureDiamonds: integer("treasure_diamonds").default(0),
  treasureCoins: integer("treasure_coins").default(0),
  treasureCrowns: integer("treasure_crowns").default(0),
  treasureBags: integer("treasure_bags").default(0),
  treasureStars: integer("treasure_stars").default(0),
  treasureTrophies: integer("treasure_trophies").default(0),
  // Diego's Treasure Vault
  diegoTreasureDiamonds: integer("diego_treasure_diamonds").default(0),
  diegoTreasureCoins: integer("diego_treasure_coins").default(0),
  diegoTreasureCrowns: integer("diego_treasure_crowns").default(0),
  diegoTreasureBags: integer("diego_treasure_bags").default(0),
  diegoTreasureStars: integer("diego_treasure_stars").default(0),
  diegoTreasureTrophies: integer("diego_treasure_trophies").default(0),
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
}, (table) => [
  index("idx_children_parent_id").on(table.parentId),
]);

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
}, (table) => [
  index("idx_word_lists_child_id").on(table.childId),
  index("idx_word_lists_week_number").on(table.weekNumber),
]);

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
}, (table) => [
  index("idx_progress_child_id").on(table.childId),
  index("idx_progress_word_list_id").on(table.wordListId),
]);

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

// Treasure Map Types (frontend game state)
export enum TreasureType {
  GOLD_RING = 'gold_ring',
  DIAMOND = 'diamond',
  RUBY = 'ruby',
  GOLD_BAR = 'gold_bar',
  CROWN = 'crown',
  GEM = 'gem',
  PEARL = 'pearl',
  CRYSTAL = 'crystal',
  COIN = 'coin',
  TROPHY = 'trophy',
  STAR = 'star',
  MEDAL = 'medal'
}

export interface TreasureNode {
  id: string;
  x: number; // Position on map (percentage 0-100)
  y: number; // Position on map (percentage 0-100)
  treasureType: TreasureType;
  wordIndex: number; // Which word in the list unlocks this treasure
  isUnlocked: boolean;
  isDigging: boolean;
  isRevealed: boolean;
}

export interface TreasureMapState {
  currentNodeIndex: number;
  redBootPosition: { x: number; y: number };
  unlockedTreasures: TreasureType[];
  totalCorrectAnswers: number;
}

// Default treasure map layout (12 piles scattered across the map - all treasure varieties!)
export const DEFAULT_TREASURE_NODES: Omit<TreasureNode, 'isUnlocked' | 'isDigging' | 'isRevealed'>[] = [
  { id: 'node-1', x: 15, y: 75, treasureType: TreasureType.CROWN, wordIndex: 0 },
  { id: 'node-2', x: 35, y: 45, treasureType: TreasureType.DIAMOND, wordIndex: 1 },
  { id: 'node-3', x: 60, y: 80, treasureType: TreasureType.GEM, wordIndex: 2 },
  { id: 'node-4', x: 25, y: 20, treasureType: TreasureType.TROPHY, wordIndex: 3 },
  { id: 'node-5', x: 75, y: 35, treasureType: TreasureType.PEARL, wordIndex: 4 },
  { id: 'node-6', x: 45, y: 65, treasureType: TreasureType.CRYSTAL, wordIndex: 5 },
  { id: 'node-7', x: 85, y: 60, treasureType: TreasureType.STAR, wordIndex: 6 },
  { id: 'node-8', x: 70, y: 15, treasureType: TreasureType.MEDAL, wordIndex: 7 },
  { id: 'node-9', x: 50, y: 30, treasureType: TreasureType.GOLD_RING, wordIndex: 8 },
  { id: 'node-10', x: 20, y: 50, treasureType: TreasureType.GOLD_BAR, wordIndex: 9 },
  { id: 'node-11', x: 80, y: 25, treasureType: TreasureType.COIN, wordIndex: 10 },
  { id: 'node-12', x: 55, y: 55, treasureType: TreasureType.RUBY, wordIndex: 11 },
];
