import {
  users,
  children,
  wordLists,
  progress,
  trickyWords,
  achievements,
  userAchievements,
  type User,
  type UpsertUser,
  type Child,
  type InsertChild,
  type WordList,
  type InsertWordList,
  type Progress,
  type InsertProgress,
  type TrickyWord,
  type InsertTrickyWord,
  type Achievement,
  type InsertAchievement,
  type UserAchievement,
  type InsertUserAchievement,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (anonymous players with session security)
  getUser(id: string): Promise<User | undefined>;
  getOrCreateUser(id: string, sessionToken: string): Promise<User>;
  validateSession(id: string, sessionToken: string): Promise<boolean>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUser(userId: string, updates: Partial<User>): Promise<User>;
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
  
  // Tricky words operations
  getTrickyWords(userId: string, status?: 'active' | 'mastered'): Promise<TrickyWord[]>;
  addTrickyWord(userId: string, word: string): Promise<TrickyWord>;
  updateTrickyWord(id: string, updates: Partial<TrickyWord>): Promise<TrickyWord>;
  recordTrickyWordAttempt(userId: string, word: string, correct: boolean): Promise<TrickyWord>;
  
  // Achievement operations
  getAchievements(): Promise<Achievement[]>;
  getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]>;
  awardAchievement(userId: string, achievementId: string, metadata?: Record<string, any>): Promise<UserAchievement>;
  hasAchievement(userId: string, achievementId: string): Promise<boolean>;
  seedAchievements(): Promise<void>;
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
    // Retry logic for transient database connection issues - Neon can take 30+ seconds to wake from sleep
    let retries = 5;
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
          // Exponential backoff: 5s, 8s, 12s, 20s - allows up to 45 seconds total for database wake-up
          const waitTime = 5000 + (5 - retries) * 4000;
          console.log(`⏳ Waiting ${waitTime}ms before retry (database may be waking from sleep)...`);
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

  async updateUser(userId: string, updates: Partial<User>): Promise<User> {
    const [user] = await db
      .update(users)
      .set({ 
        ...updates,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
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
    // Also increment practice count for tracking achievements
    const updates: any = { 
      updatedAt: new Date(),
      practiceCount: (currentUser.practiceCount || 0) + 1
    };
    
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

  // Tricky words operations
  async getTrickyWords(userId: string, status?: 'active' | 'mastered'): Promise<TrickyWord[]> {
    if (status) {
      return await db
        .select()
        .from(trickyWords)
        .where(and(eq(trickyWords.userId, userId), eq(trickyWords.status, status)))
        .orderBy(desc(trickyWords.addedAt));
    }
    return await db
      .select()
      .from(trickyWords)
      .where(eq(trickyWords.userId, userId))
      .orderBy(desc(trickyWords.addedAt));
  }

  async addTrickyWord(userId: string, word: string): Promise<TrickyWord> {
    // Check if word already exists for this user
    const [existing] = await db
      .select()
      .from(trickyWords)
      .where(and(eq(trickyWords.userId, userId), eq(trickyWords.word, word.toLowerCase())));
    
    if (existing) {
      // Word exists - increment mistake count and reset to active if mastered
      const [updated] = await db
        .update(trickyWords)
        .set({
          mistakeCount: (existing.mistakeCount || 0) + 1,
          status: 'active',
          correctStreak: 0,
          lastPracticed: new Date(),
        })
        .where(eq(trickyWords.id, existing.id))
        .returning();
      return updated;
    }
    
    // Create new tricky word
    const [newTrickyWord] = await db
      .insert(trickyWords)
      .values({
        userId,
        word: word.toLowerCase(),
        status: 'active',
        mistakeCount: 1,
        correctStreak: 0,
      })
      .returning();
    return newTrickyWord;
  }

  async updateTrickyWord(id: string, updates: Partial<TrickyWord>): Promise<TrickyWord> {
    const [updated] = await db
      .update(trickyWords)
      .set({ ...updates, lastPracticed: new Date() })
      .where(eq(trickyWords.id, id))
      .returning();
    return updated;
  }

  async recordTrickyWordAttempt(userId: string, word: string, correct: boolean): Promise<TrickyWord> {
    // Find the tricky word
    const [existing] = await db
      .select()
      .from(trickyWords)
      .where(and(eq(trickyWords.userId, userId), eq(trickyWords.word, word.toLowerCase())));
    
    if (!existing) {
      // If word doesn't exist and they got it wrong, add it
      if (!correct) {
        return this.addTrickyWord(userId, word);
      }
      // If correct and word doesn't exist, create it as mastered
      const [newWord] = await db
        .insert(trickyWords)
        .values({
          userId,
          word: word.toLowerCase(),
          status: 'mastered',
          mistakeCount: 0,
          correctStreak: 1,
          masteredAt: new Date(),
        })
        .returning();
      return newWord;
    }
    
    if (correct) {
      const newStreak = (existing.correctStreak || 0) + 1;
      // Master word after 3 correct answers in a row
      const isMastered = newStreak >= 3;
      
      const [updated] = await db
        .update(trickyWords)
        .set({
          correctStreak: newStreak,
          status: isMastered ? 'mastered' : 'active',
          masteredAt: isMastered ? new Date() : existing.masteredAt,
          lastPracticed: new Date(),
        })
        .where(eq(trickyWords.id, existing.id))
        .returning();
      return updated;
    } else {
      // Wrong answer - reset streak and increment mistakes
      const [updated] = await db
        .update(trickyWords)
        .set({
          correctStreak: 0,
          mistakeCount: (existing.mistakeCount || 0) + 1,
          status: 'active',
          lastPracticed: new Date(),
        })
        .where(eq(trickyWords.id, existing.id))
        .returning();
      return updated;
    }
  }

  // Achievement operations
  async getAchievements(): Promise<Achievement[]> {
    return await db.select().from(achievements);
  }

  async getUserAchievements(userId: string): Promise<(UserAchievement & { achievement: Achievement })[]> {
    const result = await db
      .select()
      .from(userAchievements)
      .innerJoin(achievements, eq(userAchievements.achievementId, achievements.id))
      .where(eq(userAchievements.userId, userId))
      .orderBy(desc(userAchievements.earnedAt));
    
    return result.map(row => ({
      ...row.user_achievements,
      achievement: row.achievements,
    }));
  }

  async awardAchievement(userId: string, achievementId: string, metadata?: Record<string, any>): Promise<UserAchievement> {
    // Check if already awarded
    const hasIt = await this.hasAchievement(userId, achievementId);
    if (hasIt) {
      const [existing] = await db
        .select()
        .from(userAchievements)
        .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
      return existing;
    }
    
    const [newAchievement] = await db
      .insert(userAchievements)
      .values({
        userId,
        achievementId,
        metadata,
      })
      .returning();
    return newAchievement;
  }

  async hasAchievement(userId: string, achievementId: string): Promise<boolean> {
    const [existing] = await db
      .select()
      .from(userAchievements)
      .where(and(eq(userAchievements.userId, userId), eq(userAchievements.achievementId, achievementId)));
    return !!existing;
  }

  async seedAchievements(): Promise<void> {
    const defaultAchievements: InsertAchievement[] = [
      // Spelling achievements
      { id: 'first_word', title: 'First Mate', description: 'Spell your first word correctly', icon: '⚓', category: 'spelling', threshold: 1, rarity: 'common' },
      { id: 'word_master_10', title: 'Word Hunter', description: 'Master 10 spelling words', icon: '🎯', category: 'spelling', threshold: 10, rarity: 'common' },
      { id: 'word_master_50', title: 'Word Wizard', description: 'Master 50 spelling words', icon: '🧙', category: 'spelling', threshold: 50, rarity: 'rare' },
      { id: 'word_master_100', title: 'Spelling Captain', description: 'Master 100 spelling words', icon: '👑', category: 'spelling', threshold: 100, rarity: 'epic' },
      
      // Progressive perfect run badges (awarded in sequence)
      { id: 'perfect_run_1', title: 'Perfect Voyage', description: '1st perfect practice session!', icon: '⭐', category: 'spelling', threshold: 1, rarity: 'common' },
      { id: 'perfect_run_2', title: 'Gold Compass', description: '2nd perfect practice session!', icon: '🧭', category: 'spelling', threshold: 2, rarity: 'common' },
      { id: 'perfect_run_3', title: 'Diamond Helm', description: '3rd perfect practice session!', icon: '💎', category: 'spelling', threshold: 3, rarity: 'rare' },
      { id: 'perfect_run_4', title: 'Starry Sextant', description: '4th perfect practice session!', icon: '🌟', category: 'spelling', threshold: 4, rarity: 'rare' },
      { id: 'perfect_run_5', title: 'Treasure Master', description: '5th perfect practice session!', icon: '👑', category: 'spelling', threshold: 5, rarity: 'epic' },
      { id: 'perfect_run_6', title: 'Legendary Captain', description: '6th perfect practice session!', icon: '🏴‍☠️', category: 'spelling', threshold: 6, rarity: 'legendary' },
      
      { id: 'perfect_week', title: 'Legendary Week', description: 'Get 100% on your Friday test', icon: '🏆', category: 'spelling', threshold: 1, rarity: 'legendary' },
      
      // Streak achievements
      { id: 'streak_3', title: 'Setting Sail', description: 'Practice 3 days in a row', icon: '⛵', category: 'streak', threshold: 3, rarity: 'common' },
      { id: 'streak_7', title: 'Week Warrior', description: 'Practice 7 days in a row', icon: '🗓️', category: 'streak', threshold: 7, rarity: 'rare' },
      { id: 'streak_30', title: 'Ocean Master', description: 'Practice 30 days in a row', icon: '🌊', category: 'streak', threshold: 30, rarity: 'legendary' },
      
      // Treasure achievements
      { id: 'treasure_50', title: 'Treasure Finder', description: 'Collect 50 treasures', icon: '💎', category: 'treasure', threshold: 50, rarity: 'common' },
      { id: 'treasure_200', title: 'Treasure Hunter', description: 'Collect 200 treasures', icon: '💰', category: 'treasure', threshold: 200, rarity: 'rare' },
      { id: 'treasure_500', title: 'Treasure King', description: 'Collect 500 treasures', icon: '👑', category: 'treasure', threshold: 500, rarity: 'epic' },
      
      // Tricky word achievements
      { id: 'tricky_conquered_5', title: 'Tricky Tackler', description: 'Master 5 tricky words', icon: '💪', category: 'spelling', threshold: 5, rarity: 'common' },
      { id: 'tricky_conquered_20', title: 'Tricky Terminator', description: 'Master 20 tricky words', icon: '🦸', category: 'spelling', threshold: 20, rarity: 'rare' },
      
      // Special achievements
      { id: 'sea_monster_slayer', title: 'Sea Monster Slayer', description: 'Complete 10 practice sessions with Diego', icon: '🐙', category: 'special', threshold: 10, rarity: 'rare' },
      { id: 'treasure_hunter', title: 'Red Boot\'s Treasure Hunter', description: 'Complete 10 practice sessions with Red Boot', icon: '🏴‍☠️', category: 'special', threshold: 10, rarity: 'rare' },
    ];

    // Insert achievements, ignoring conflicts
    for (const achievement of defaultAchievements) {
      try {
        await db
          .insert(achievements)
          .values(achievement)
          .onConflictDoNothing();
      } catch (error) {
        // Ignore duplicate key errors
      }
    }
  }
}

export const storage = new DatabaseStorage();
