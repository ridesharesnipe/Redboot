import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { insertChildSchema, insertWordListSchema, insertProgressSchema } from "@shared/schema";
import { z } from "zod";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

// Middleware to validate anonymous session
async function validateSession(req: any, res: any, next: any) {
  try {
    const playerId = req.headers['x-player-id'] as string;
    const sessionToken = req.headers['x-session-token'] as string;

    if (!playerId || !sessionToken) {
      console.error('❌ Missing credentials - playerId:', playerId, 'sessionToken:', !!sessionToken);
      return res.status(401).json({ message: 'Unauthorized: Missing credentials' });
    }

    console.log('🔐 Validating session for player:', playerId.substring(0, 8) + '...');

    // Validate session or create new user
    const isValid = await storage.validateSession(playerId, sessionToken);
    if (!isValid) {
      console.log('✨ Creating new user for player:', playerId.substring(0, 8) + '...');
      await storage.getOrCreateUser(playerId, sessionToken);
    }

    next();
  } catch (error: any) {
    console.error('❌ Session validation error:', error);
    console.error('❌ Error stack:', error?.stack);
    console.error('❌ Error message:', error?.message);
    return res.status(500).json({ 
      message: 'Session validation failed', 
      error: error?.message || String(error),
      stack: error?.stack
    });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API routes for basic functionality
  app.get('/api/status', async (req, res) => {
    res.json({ status: 'ready', message: 'Red Boot\'s Spelling Adventure is ready!' });
  });

  // Auth user endpoint - now returns player data from anonymous ID
  app.get('/api/auth/user', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const user = await storage.getUser(playerId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding endpoint (uses anonymous player ID with session validation)
  app.post('/api/onboarding', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      const { childName, gradeLevel, skip } = req.body;
      
      // If skipping, save gradeLevel but use default child name
      if (skip) {
        const defaultChildName = "My Child";
        const updatedUser = await storage.updateUserOnboarding(playerId, defaultChildName, gradeLevel, true);
        return res.json({ user: updatedUser });
      }

      // Otherwise save the data (childName optional, gradeLevel required)
      const finalChildName = childName && childName.trim() ? childName.trim() : "My Child";
      const updatedUser = await storage.updateUserOnboarding(playerId, finalChildName, gradeLevel, true);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });

  // Photos now stored in browser IndexedDB - no server routes needed!

  // Word Lists API routes (uses anonymous player ID with session validation)
  app.get('/api/word-lists', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      // For now, use the user's childName as the default child
      // Later can expand to support multiple children
      const children = await storage.getChildren(playerId);
      
      // If no children exist, create a default one from user's childName
      let childId: string;
      if (children.length === 0) {
        const userData = await storage.getUser(playerId);
        if (!userData || !userData.childName) {
          return res.json([]);
        }
        const newChild = await storage.createChild({
          parentId: playerId,
          name: userData.childName,
          grade: userData.gradeLevel || undefined,
        });
        childId = newChild.id;
      } else {
        childId = children[0].id;
      }

      const wordLists = await storage.getWordLists(childId);
      res.json(wordLists);
    } catch (error) {
      console.error('Error fetching word lists:', error);
      res.status(500).json({ message: 'Failed to fetch word lists' });
    }
  });

  app.post('/api/word-lists', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      console.log('📝 Creating word list for player:', playerId.substring(0, 8) + '...', 'Words:', req.body.words?.length);

      // Validate request body (without childId - we'll add it below)
      const requestSchema = z.object({
        weekNumber: z.number(),
        words: z.array(z.string()),
        practiceCount: z.number().optional().default(0),
        bestScore: z.number().optional().default(0),
      });
      const validatedData = requestSchema.parse(req.body);

      // Get or create child for this user
      const children = await storage.getChildren(playerId);
      let childId: string;
      
      if (children.length === 0) {
        console.log('👶 No child found, creating one...');
        const userData = await storage.getUser(playerId);
        console.log('👤 User data:', { childName: userData?.childName, gradeLevel: userData?.gradeLevel });
        
        // Use child name from user data, or default to "My Child" if not set
        const childName = userData?.childName || "My Child";
        const newChild = await storage.createChild({
          parentId: playerId,
          name: childName,
          grade: userData?.gradeLevel || undefined,
        });
        console.log('✅ Created child:', newChild.id);
        childId = newChild.id;
      } else {
        childId = children[0].id;
        console.log('✅ Using existing child:', childId);
      }

      // Create word list
      console.log('📋 Creating word list with childId:', childId);
      const wordList = await storage.createWordList({
        ...validatedData,
        childId,
      });
      console.log('✅ Word list created:', wordList.id);
      
      res.json(wordList);
    } catch (error) {
      console.error('❌ Error creating word list:', error);
      if (error instanceof z.ZodError) {
        console.error('❌ Validation error:', error.errors);
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create word list', error: String(error) });
    }
  });

  app.get('/api/word-lists/:id', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      const wordList = await storage.getWordList(req.params.id);
      if (!wordList) {
        return res.status(404).json({ message: 'Word list not found' });
      }

      // Verify ownership: Check that the word list's child belongs to this parent
      const child = await storage.getChild(wordList.childId);
      if (!child || child.parentId !== playerId) {
        return res.status(403).json({ message: 'Access denied: You do not own this word list' });
      }

      res.json(wordList);
    } catch (error) {
      console.error('Error fetching word list:', error);
      res.status(500).json({ message: 'Failed to fetch word list' });
    }
  });

  // Progress API routes (uses anonymous player ID with session validation)
  app.get('/api/progress', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      // Get child
      const children = await storage.getChildren(playerId);
      if (children.length === 0) {
        return res.json([]);
      }
      
      const childId = children[0].id;
      const progressData = await storage.getProgress(childId);
      res.json(progressData);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  });

  app.post('/api/progress', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      // Validate request body
      const validatedData = insertProgressSchema.parse(req.body);

      // Get child
      const children = await storage.getChildren(playerId);
      if (children.length === 0) {
        return res.status(400).json({ message: 'No child profile found' });
      }
      
      const childId = children[0].id;
      
      // Create progress record
      const progressRecord = await storage.createProgress({
        ...validatedData,
        childId,
      });
      
      res.json(progressRecord);
    } catch (error) {
      console.error('Error saving progress:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to save progress' });
    }
  });

  // Treasure Vault API routes (uses anonymous player ID with session validation)
  app.get('/api/treasures', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const userData = await storage.getUser(playerId);
      
      // If user doesn't exist yet, return empty treasure vault (all zeros)
      if (!userData) {
        return res.json({
          redboot: {
            diamonds: 0,
            coins: 0,
            crowns: 0,
            bags: 0,
            stars: 0,
            trophies: 0,
          },
          diego: {
            diamonds: 0,
            coins: 0,
            crowns: 0,
            bags: 0,
            stars: 0,
            trophies: 0,
          },
        });
      }

      res.json({
        redboot: {
          diamonds: userData.treasureDiamonds || 0,
          coins: userData.treasureCoins || 0,
          crowns: userData.treasureCrowns || 0,
          bags: userData.treasureBags || 0,
          stars: userData.treasureStars || 0,
          trophies: userData.treasureTrophies || 0,
        },
        diego: {
          diamonds: userData.diegoTreasureDiamonds || 0,
          coins: userData.diegoTreasureCoins || 0,
          crowns: userData.diegoTreasureCrowns || 0,
          bags: userData.diegoTreasureBags || 0,
          stars: userData.diegoTreasureStars || 0,
          trophies: userData.diegoTreasureTrophies || 0,
        },
      });
    } catch (error) {
      console.error('Error fetching treasures:', error);
      res.status(500).json({ message: 'Failed to fetch treasures' });
    }
  });

  app.post('/api/treasures/add', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;

      const { character, amount } = req.body;
      if (!character || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      await storage.addTreasures(playerId, character, amount);
      
      // Check for treasure-based achievements after adding treasures
      const newlyAwarded: string[] = [];
      const user = await storage.getUser(playerId);
      if (user) {
        // Calculate total treasures for this character
        const totalTreasures = character === 'redboot' 
          ? (user.treasureDiamonds || 0) + (user.treasureCoins || 0) + (user.treasureCrowns || 0) + 
            (user.treasureBags || 0) + (user.treasureStars || 0) + (user.treasureTrophies || 0)
          : (user.diegoTreasureDiamonds || 0) + (user.diegoTreasureCoins || 0) + (user.diegoTreasureCrowns || 0) + 
            (user.diegoTreasureBags || 0) + (user.diegoTreasureStars || 0) + (user.diegoTreasureTrophies || 0);
        
        // Check treasure milestones
        const treasureAchievements = [
          { id: 'treasure_50', threshold: 50 },
          { id: 'treasure_200', threshold: 200 },
          { id: 'treasure_500', threshold: 500 },
        ];
        
        for (const achievement of treasureAchievements) {
          if (totalTreasures >= achievement.threshold) {
            const hasIt = await storage.hasAchievement(playerId, achievement.id);
            if (!hasIt) {
              await storage.awardAchievement(playerId, achievement.id, { totalTreasures, character });
              newlyAwarded.push(achievement.id);
            }
          }
        }
        
        // Check character-specific achievements (10 practice sessions)
        const characterAchievement = character === 'redboot' ? 'treasure_hunter' : 'sea_monster_slayer';
        const practiceSessions = (user.practiceCount || 0) + 1;
        if (practiceSessions >= 10) {
          const hasIt = await storage.hasAchievement(playerId, characterAchievement);
          if (!hasIt) {
            await storage.awardAchievement(playerId, characterAchievement, { practiceSessions, character });
            newlyAwarded.push(characterAchievement);
          }
        }
      }
      
      res.json({ success: true, newlyAwarded });
    } catch (error) {
      console.error('Error adding treasures:', error);
      res.status(500).json({ message: 'Failed to add treasures' });
    }
  });

  // Tricky Words API routes
  app.get('/api/tricky-words', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const status = req.query.status as 'active' | 'mastered' | undefined;
      
      const trickyWords = await storage.getTrickyWords(playerId, status);
      res.json(trickyWords);
    } catch (error) {
      console.error('Error fetching tricky words:', error);
      res.status(500).json({ message: 'Failed to fetch tricky words' });
    }
  });

  app.post('/api/tricky-words', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const { word } = req.body;
      
      if (!word || typeof word !== 'string') {
        return res.status(400).json({ message: 'Word is required' });
      }
      
      const trickyWord = await storage.addTrickyWord(playerId, word);
      res.json(trickyWord);
    } catch (error) {
      console.error('Error adding tricky word:', error);
      res.status(500).json({ message: 'Failed to add tricky word' });
    }
  });

  app.post('/api/tricky-words/attempt', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const { word, correct } = req.body;
      
      if (!word || typeof word !== 'string' || typeof correct !== 'boolean') {
        return res.status(400).json({ message: 'Word and correct status are required' });
      }
      
      const trickyWord = await storage.recordTrickyWordAttempt(playerId, word, correct);
      res.json(trickyWord);
    } catch (error) {
      console.error('Error recording tricky word attempt:', error);
      res.status(500).json({ message: 'Failed to record attempt' });
    }
  });

  app.post('/api/tricky-words/bulk', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const { words } = req.body;
      
      if (!Array.isArray(words)) {
        return res.status(400).json({ message: 'Words array is required' });
      }
      
      // Add all tricky words
      const results = await Promise.all(
        words.map((word: string) => storage.addTrickyWord(playerId, word))
      );
      
      res.json(results);
    } catch (error) {
      console.error('Error adding tricky words in bulk:', error);
      res.status(500).json({ message: 'Failed to add tricky words' });
    }
  });

  // Achievement API routes
  app.get('/api/achievements', validateSession, async (req: any, res) => {
    try {
      // Seed achievements if they don't exist
      await storage.seedAchievements();
      
      const allAchievements = await storage.getAchievements();
      res.json(allAchievements);
    } catch (error) {
      console.error('Error fetching achievements:', error);
      res.status(500).json({ message: 'Failed to fetch achievements' });
    }
  });

  app.get('/api/achievements/user', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      
      // Seed achievements if they don't exist
      await storage.seedAchievements();
      
      const userAchievements = await storage.getUserAchievements(playerId);
      const allAchievements = await storage.getAchievements();
      
      res.json({
        earned: userAchievements,
        all: allAchievements,
      });
    } catch (error) {
      console.error('Error fetching user achievements:', error);
      res.status(500).json({ message: 'Failed to fetch user achievements' });
    }
  });

  app.post('/api/achievements/award', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const { achievementId, metadata } = req.body;
      
      if (!achievementId) {
        return res.status(400).json({ message: 'Achievement ID is required' });
      }
      
      // Check if user already has this achievement
      const hasIt = await storage.hasAchievement(playerId, achievementId);
      if (hasIt) {
        return res.json({ awarded: false, message: 'Achievement already earned' });
      }
      
      const userAchievement = await storage.awardAchievement(playerId, achievementId, metadata);
      res.json({ awarded: true, achievement: userAchievement });
    } catch (error) {
      console.error('Error awarding achievement:', error);
      res.status(500).json({ message: 'Failed to award achievement' });
    }
  });

  app.post('/api/achievements/check', validateSession, async (req, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      const { achievementId } = req.body;
      
      if (!achievementId) {
        return res.status(400).json({ message: 'Achievement ID is required' });
      }
      
      const hasAchievement = await storage.hasAchievement(playerId, achievementId);
      res.json({ hasAchievement });
    } catch (error) {
      console.error('Error checking achievement:', error);
      res.status(500).json({ message: 'Failed to check achievement' });
    }
  });

  // Analytics API - Real-time dashboard data
  app.get('/api/analytics', validateSession, async (req: any, res) => {
    try {
      const playerId = req.headers['x-player-id'] as string;
      
      // Get user data
      const userData = await storage.getUser(playerId);
      if (!userData) {
        return res.json({ error: 'User not found' });
      }
      
      // Get children
      const childrenData = await storage.getChildren(playerId);
      const child = childrenData[0];
      
      // Get word lists
      const wordListsData = child ? await storage.getWordLists(child.id) : [];
      const currentWordList = wordListsData[0];
      
      // Get progress records
      const progressData = child ? await storage.getProgress(child.id) : [];
      
      // Get tricky words
      const trickyWordsData = await storage.getTrickyWords(playerId);
      const activeTrickyWords = trickyWordsData.filter(w => w.status === 'active');
      const masteredTrickyWords = trickyWordsData.filter(w => w.status === 'mastered');
      
      // Get achievements
      const userAchievements = await storage.getUserAchievements(playerId);
      
      // Calculate statistics
      const totalWords = currentWordList?.words?.length || 0;
      const totalPracticeSessions = progressData.length;
      
      // Calculate accuracy from progress records
      let totalCorrect = 0;
      let totalAttempted = 0;
      progressData.forEach((p: any) => {
        const correct = p.correctWords?.length || 0;
        const incorrect = p.incorrectWords?.length || 0;
        totalCorrect += correct;
        totalAttempted += correct + incorrect;
      });
      const overallAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
      
      // Calculate total time spent (in minutes)
      const totalTimeSpent = progressData.reduce((sum: number, p: any) => sum + (p.timeSpent || 0), 0);
      const totalMinutes = Math.round(totalTimeSpent / 60);
      
      // Calculate treasures
      const totalTreasures = (userData.treasureDiamonds || 0) + (userData.treasureCoins || 0) + 
        (userData.treasureCrowns || 0) + (userData.treasureBags || 0) + 
        (userData.treasureStars || 0) + (userData.treasureTrophies || 0) +
        (userData.diegoTreasureDiamonds || 0) + (userData.diegoTreasureCoins || 0) +
        (userData.diegoTreasureCrowns || 0) + (userData.diegoTreasureBags || 0) +
        (userData.diegoTreasureStars || 0) + (userData.diegoTreasureTrophies || 0);
      
      // Get daily progress for the last 7 days
      const now = new Date();
      const dailyProgress: { date: string; words: number; accuracy: number }[] = [];
      
      for (let i = 6; i >= 0; i--) {
        const date = new Date(now);
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
        
        // Filter progress for this day
        const dayProgress = progressData.filter((p: any) => {
          if (!p.completedAt) return false;
          const pDate = new Date(p.completedAt).toISOString().split('T')[0];
          return pDate === dateStr;
        });
        
        let dayCorrect = 0;
        let dayTotal = 0;
        dayProgress.forEach((p: any) => {
          const correct = p.correctWords?.length || 0;
          const incorrect = p.incorrectWords?.length || 0;
          dayCorrect += correct;
          dayTotal += correct + incorrect;
        });
        
        dailyProgress.push({
          date: dayName,
          words: dayTotal,
          accuracy: dayTotal > 0 ? Math.round((dayCorrect / dayTotal) * 100) : 0
        });
      }
      
      // Word mastery breakdown
      const wordMastery = {
        mastered: masteredTrickyWords.length,
        learning: activeTrickyWords.length,
        total: totalWords
      };
      
      // Recent activity (last 5 sessions)
      const recentActivity = progressData.slice(0, 5).map((p: any) => ({
        id: p.id,
        date: p.completedAt,
        correct: p.correctWords?.length || 0,
        incorrect: p.incorrectWords?.length || 0,
        score: p.score || 0,
        character: p.characterUsed || 'red-boot'
      }));
      
      res.json({
        childName: userData.childName || 'Adventurer',
        gradeLevel: userData.gradeLevel,
        stats: {
          totalWords,
          totalPracticeSessions,
          overallAccuracy,
          totalMinutes,
          totalTreasures,
          achievementsEarned: userAchievements.length,
          trickyWordsActive: activeTrickyWords.length,
          trickyWordsMastered: masteredTrickyWords.length
        },
        dailyProgress,
        wordMastery,
        recentActivity,
        trickyWords: activeTrickyWords.slice(0, 5).map((w: any) => ({
          word: w.word,
          mistakeCount: w.mistakeCount,
          correctStreak: w.correctStreak
        })),
        currentWeek: {
          words: currentWordList?.words || [],
          practiceCount: currentWordList?.practiceCount || 0,
          bestScore: currentWordList?.bestScore || 0
        }
      });
    } catch (error) {
      console.error('Error fetching analytics:', error);
      res.status(500).json({ message: 'Failed to fetch analytics' });
    }
  });

  // Stripe routes (if Stripe is configured)
  if (stripe) {
    app.post('/api/create-payment-intent', async (req, res) => {
      try {
        const { amount } = req.body;
        const paymentIntent = await stripe!.paymentIntents.create({
          amount,
          currency: 'usd',
        });
        res.json({ clientSecret: paymentIntent.client_secret });
      } catch (error) {
        console.error("Error creating payment intent:", error);
        res.status(500).json({ message: "Failed to create payment intent" });
      }
    });
  }

  const server = createServer(app);
  return server;
}