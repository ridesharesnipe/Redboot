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
  // User operations (anonymous players with session security)
  getUser(id: string): Promise<User | undefined>;
  getOrCreateUser(id: string, sessionToken: string): Promise<User>;
  validateSession(id: string, sessionToken: string): Promise<boolean>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserStripeInfo(userId: string, stripeCustomerId: string, stripeSubscriptionId: string): Promise<User>;
  updateUserOnboarding(userId: string, childName: string | undefined, gradeLevel: string | undefined, onboardingComplete: boolean): Promise<User>;
  
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
    // Retry logic for transient database connection issues
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const [user] = await db.select().from(users).where(eq(users.id, id));
        return user;
      } catch (error: any) {
        lastError = error;
        console.error(`Database connection attempt failed (${4 - retries}/3):`, error?.message);
        retries--;
        if (retries > 0) {
          await new Promise(resolve => setTimeout(resolve, 1000)); // Wait 1 second before retry
        }
      }
    }
    
    console.error('All database connection attempts failed:', lastError);
    throw lastError;
  }

  async getOrCreateUser(id: string, sessionToken: string): Promise<User> {
    // Retry logic for transient database connection issues - increased for mobile devices
    let retries = 5; // Increased from 3 to 5 for better mobile reliability
    let lastError;
    
    while (retries > 0) {
      try {
        // Try to get existing user (without throwing on connection errors)
        const [user] = await db.select().from(users).where(eq(users.id, id));
        
        if (user) {
          console.log('✅ User found:', user.id.substring(0, 8) + '...');
          return user;
        }
        
        // User doesn't exist, create new one
        console.log('📝 Creating new anonymous user...');
        const [newUser] = await db
          .insert(users)
          .values({
            id,
            sessionToken,
            onboardingComplete: false,
          })
          .returning();
        console.log('✅ User created successfully');
        return newUser;
      } catch (error: any) {
        lastError = error;
        console.error(`❌ Database error in getOrCreateUser (attempt ${6 - retries}/5):`, error);
        console.error(`❌ Error details:`, JSON.stringify(error, Object.getOwnPropertyNames(error)));
        retries--;
        if (retries > 0) {
          const waitTime = retries > 2 ? 1500 : 3000; // Wait 1.5s for first retries, 3s for final retries
          console.log(`⏳ Waiting ${waitTime}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, waitTime));
        }
      }
    }
    
    console.error('❌ All retry attempts failed in getOrCreateUser');
    throw new Error(`Failed to create user after 5 attempts: ${lastError?.message || String(lastError)}`);
  }

  async validateSession(id: string, sessionToken: string): Promise<boolean> {
    try {
      const user = await this.getUser(id);
      if (!user) return false;
      
      // If user has no session token yet (old data), set it
      if (!user.sessionToken) {
        await db
          .update(users)
          .set({ sessionToken, updatedAt: new Date() })
          .where(eq(users.id, id));
        return true;
      }
      
      // Validate session token matches
      return user.sessionToken === sessionToken;
    } catch (error) {
      console.error('Database error in validateSession:', error);
      // On database error, return false to trigger user creation
      return false;
    }
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

  async updateUserOnboarding(userId: string, childName: string | undefined, gradeLevel: string | undefined, onboardingComplete: boolean): Promise<User> {
    // Retry logic for transient database connection issues (e.g., waking from sleep)
    let retries = 3;
    let lastError;
    
    while (retries > 0) {
      try {
        const [user] = await db
          .update(users)
          .set({ 
            childName: childName || null,
            gradeLevel: gradeLevel || null,
            onboardingComplete,
            updatedAt: new Date(),
          })
          .where(eq(users.id, userId))
          .returning();
        return user;
      } catch (error: any) {
        lastError = error;
        retries--;
        if (retries > 0) {
          // Wait before retrying (exponential backoff)
          await new Promise(resolve => setTimeout(resolve, 1000 * (4 - retries)));
        }
      }
    }
    
    throw new Error(`Failed to update user onboarding after 3 retries: ${lastError?.message || 'Unknown error'}`);
  }

  async addTreasures(userId: string, character: 'redboot' | 'diego', totalAmount: number): Promise<User> {
    // Distribute treasures evenly across all 6 types
    const amountPerType = Math.floor(totalAmount / 6);
    const remainder = totalAmount % 6;
    
    // Get current user data
    const currentUser = await this.getUser(userId);
    if (!currentUser) {
      throw new Error('User not found');
    }

    // Calculate new treasure amounts based on character
    const updates: any = { updatedAt: new Date() };
    
    if (character === 'redboot') {
      updates.treasureDiamonds = (currentUser.treasureDiamonds || 0) + amountPerType + (remainder > 0 ? 1 : 0);
      updates.treasureCoins = (currentUser.treasureCoins || 0) + amountPerType + (remainder > 1 ? 1 : 0);
      updates.treasureCrowns = (currentUser.treasureCrowns || 0) + amountPerType + (remainder > 2 ? 1 : 0);
      updates.treasureBags = (currentUser.treasureBags || 0) + amountPerType + (remainder > 3 ? 1 : 0);
      updates.treasureStars = (currentUser.treasureStars || 0) + amountPerType + (remainder > 4 ? 1 : 0);
      updates.treasureTrophies = (currentUser.treasureTrophies || 0) + amountPerType;
    } else {
      updates.diegoTreasureDiamonds = (currentUser.diegoTreasureDiamonds || 0) + amountPerType + (remainder > 0 ? 1 : 0);
      updates.diegoTreasureCoins = (currentUser.diegoTreasureCoins || 0) + amountPerType + (remainder > 1 ? 1 : 0);
      updates.diegoTreasureCrowns = (currentUser.diegoTreasureCrowns || 0) + amountPerType + (remainder > 2 ? 1 : 0);
      updates.diegoTreasureBags = (currentUser.diegoTreasureBags || 0) + amountPerType + (remainder > 3 ? 1 : 0);
      updates.diegoTreasureStars = (currentUser.diegoTreasureStars || 0) + amountPerType + (remainder > 4 ? 1 : 0);
      updates.diegoTreasureTrophies = (currentUser.diegoTreasureTrophies || 0) + amountPerType;
    }

    const [user] = await db
      .update(users)
      .set(updates)
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
    const [newChild] = await db.insert(children).values(child as any).returning();
    return newChild;
  }

  async updateChild(id: string, updates: Partial<InsertChild>): Promise<Child> {
    const [child] = await db
      .update(children)
      .set({ ...updates, updatedAt: new Date() } as any)
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
    const [wordList] = await db.insert(wordLists).values(wordListData as any).returning();
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
    const [newProgress] = await db.insert(progress).values(progressData as any).returning();
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
