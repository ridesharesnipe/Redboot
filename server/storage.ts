import {
  users,
  children,
  wordLists,
  progress,
  type User,
  type UpsertUser,
  type Child,
  type InsertChild,
  type WordList,
  type InsertWordList,
  type Progress,
  type InsertProgress,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  
  // Children operations
  getChildren(parentId: string): Promise<Child[]>;
  getChild(id: string): Promise<Child | undefined>;
  createChild(child: InsertChild): Promise<Child>;
  updateChild(id: string, updates: Partial<InsertChild>): Promise<Child>;
  
  // Word lists operations
  getWordLists(childId: string): Promise<WordList[]>;
  getWordList(id: string): Promise<WordList | undefined>;
  createWordList(wordList: InsertWordList): Promise<WordList>;
  
  // Progress operations
  getProgress(childId: string): Promise<Progress[]>;
  createProgress(progressData: InsertProgress): Promise<Progress>;
  getWeeklyProgress(childId: string, weekNumber: number): Promise<Progress[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  async updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        stripeCustomerId, 
        stripeSubscriptionId,
        isPremium: true,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();
    return user;
  }

  // Children operations
  async getChildren(parentId: string): Promise<Child[]> {
    return await db.select().from(children).where(eq(children.parentId, parentId));
  }

  async getChild(id: string): Promise<Child | undefined> {
    const [child] = await db.select().from(children).where(eq(children.id, id));
    return child;
  }

  async createChild(child: InsertChild): Promise<Child> {
    const [newChild] = await db.insert(children).values(child).returning();
    return newChild;
  }

  async updateChild(id: string, updates: Partial<InsertChild>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(children.id, id))
      .returning();
    return child;
  }

  // Word lists operations
  async getWordLists(childId: string): Promise<WordList[]> {
    return await db
      .select()
      .from(wordLists)
      .where(eq(wordLists.childId, childId))
      .orderBy(desc(wordLists.weekNumber));
  }

  async getWordList(id: string): Promise<WordList | undefined> {
    const [wordList] = await db.select().from(wordLists).where(eq(wordLists.id, id));
    return wordList;
  }

  async createWordList(wordListData: InsertWordList): Promise<WordList> {
    const [wordList] = await db.insert(wordLists).values(wordListData).returning();
    return wordList;
  }

  // Progress operations
  async getProgress(childId: string): Promise<Progress[]> {
    return await db
      .select()
      .from(progress)
      .where(eq(progress.childId, childId))
      .orderBy(desc(progress.completedAt));
  }

  async createProgress(progressData: InsertProgress): Promise<Progress> {
    const [newProgress] = await db.insert(progress).values(progressData).returning();
    return newProgress;
  }

  async getWeeklyProgress(childId: string, weekNumber: number): Promise<Progress[]> {
    const result = await db
      .select()
      .from(progress)
      .innerJoin(wordLists, eq(progress.wordListId, wordLists.id))
      .where(
        and(
          eq(progress.childId, childId),
          eq(wordLists.weekNumber, weekNumber)
        )
      );
    return result.map(row => row.progress);
  }
}

export const storage = new DatabaseStorage();
