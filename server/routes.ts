import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { storage } from "./storage";
import { insertChildSchema, insertWordListSchema, insertProgressSchema, signupSchema, loginSchema, forgotPasswordSchema, resetPasswordSchema } from "@shared/schema";
import { z } from "zod";

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable must be set");
}
const JWT_SECRET: string = process.env.JWT_SECRET;

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

let genAI: GoogleGenerativeAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
}

function signToken(userId: string): string {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: "30d" });
}

async function requireAuth(req: any, res: any, next: any) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { userId: string };
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API routes for basic functionality
  app.get('/api/status', async (req, res) => {
    res.json({ status: 'ready', message: 'Red Boot\'s Spelling Adventure is ready!' });
  });

  // Auth endpoints
  app.post('/api/auth/signup', async (req, res) => {
    try {
      const { email, password, childName } = signupSchema.parse(req.body);
      
      const existing = await storage.getUserByEmail(email);
      if (existing) {
        return res.status(400).json({ message: "An account with this email already exists" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      const user = await storage.createUser(email, passwordHash, childName);
      const token = signToken(user.id);
      
      res.json({ token, user: { id: user.id, email: user.email, childName: user.childName } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Signup error:", error);
      res.status(500).json({ message: "Failed to create account" });
    }
  });

  app.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const valid = await bcrypt.compare(password, user.passwordHash);
      if (!valid) {
        return res.status(401).json({ message: "Invalid email or password" });
      }
      
      const token = signToken(user.id);
      res.json({ token, user: { id: user.id, email: user.email, childName: user.childName } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to log in" });
    }
  });

  app.post('/api/auth/logout', (_req, res) => {
    res.json({ success: true });
  });

  app.post('/api/auth/forgot-password', async (req, res) => {
    try {
      const { email } = forgotPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.json({ message: "If an account exists with that email, a reset link has been sent." });
      }
      
      const resetToken = crypto.randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000);
      await storage.setResetToken(user.id, resetToken, expiry);
      
      if (process.env.SENDGRID_API_KEY) {
        try {
          const sgMail = await import("@sendgrid/mail");
          sgMail.default.setApiKey(process.env.SENDGRID_API_KEY);
          
          const host = req.headers.host || req.hostname;
          const protocol = req.protocol;
          const resetUrl = `${protocol}://${host}/reset-password?token=${resetToken}`;
          
          await sgMail.default.send({
            to: email,
            from: process.env.SENDGRID_FROM_EMAIL || "noreply@redboot.app",
            subject: "Reset Your Password - Red Boot's Spelling Adventure",
            html: `<p>You requested a password reset. Click the link below to set a new password:</p><p><a href="${resetUrl}">Reset Password</a></p><p>This link expires in 1 hour.</p><p>If you didn't request this, you can safely ignore this email.</p>`,
          });
        } catch (emailError) {
          console.error("Failed to send reset email:", emailError);
        }
      } else {
        console.log(`Password reset requested for ${email} (SendGrid not configured, email not sent)`);
      }
      
      res.json({ message: "If an account exists with that email, a reset link has been sent." });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Forgot password error:", error);
      res.status(500).json({ message: "Failed to process request" });
    }
  });

  app.post('/api/auth/reset-password', async (req, res) => {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      const user = await storage.getUserByResetToken(token);
      if (!user || !user.resetTokenExpiry || new Date() > user.resetTokenExpiry) {
        return res.status(400).json({ message: "Invalid or expired reset token" });
      }
      
      const passwordHash = await bcrypt.hash(password, 10);
      await storage.updateUser(user.id, { passwordHash });
      await storage.clearResetToken(user.id);
      
      const jwtToken = signToken(user.id);
      res.json({ token: jwtToken, user: { id: user.id, email: user.email, childName: user.childName } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: error.errors[0]?.message || "Invalid input" });
      }
      console.error("Reset password error:", error);
      res.status(500).json({ message: "Failed to reset password" });
    }
  });

  app.post('/api/auth/migrate', requireAuth, async (req: any, res) => {
    try {
      const { oldPlayerId } = req.body;
      if (!oldPlayerId) {
        return res.status(400).json({ message: "Old player ID is required" });
      }
      
      await storage.migrateAnonymousData(oldPlayerId, req.userId);
      res.json({ success: true });
    } catch (error) {
      console.error("Migration error:", error);
      res.status(500).json({ message: "Failed to migrate data" });
    }
  });

  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      const user = await storage.getUser(playerId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ id: user.id, email: user.email, childName: user.childName, onboardingComplete: user.onboardingComplete });
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding endpoint (uses anonymous player ID with session validation)
  app.post('/api/onboarding', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

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
  app.get('/api/word-lists', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

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

  app.post('/api/word-lists', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  app.get('/api/word-lists/:id', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

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
  app.get('/api/progress', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

      const children = await storage.getChildren(playerId);
      if (children.length === 0) {
        return res.json([]);
      }
      
      const allProgress: any[] = [];
      for (const child of children) {
        const childProgress = await storage.getProgress(child.id);
        allProgress.push(...childProgress);
      }
      res.json(allProgress);
    } catch (error) {
      console.error('Error fetching progress:', error);
      res.status(500).json({ message: 'Failed to fetch progress' });
    }
  });

  app.post('/api/progress', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

      const validatedData = insertProgressSchema.parse(req.body);

      const children = await storage.getChildren(playerId);
      if (children.length === 0) {
        return res.status(400).json({ message: 'No child profile found' });
      }
      
      let childId = children[0].id;

      if (validatedData.wordListId) {
        const wordList = await storage.getWordList(validatedData.wordListId);
        if (wordList) {
          const ownerChild = children.find(c => c.id === wordList.childId);
          if (ownerChild) {
            childId = ownerChild.id;
          } else {
            return res.status(403).json({ message: 'Word list does not belong to your children' });
          }
        }
      }
      
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
  app.get('/api/treasures', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  app.post('/api/treasures/add', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;

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
  app.get('/api/tricky-words', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      const status = req.query.status as 'active' | 'mastered' | undefined;
      
      const trickyWords = await storage.getTrickyWords(playerId, status);
      res.json(trickyWords);
    } catch (error) {
      console.error('Error fetching tricky words:', error);
      res.status(500).json({ message: 'Failed to fetch tricky words' });
    }
  });

  app.post('/api/tricky-words', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  app.post('/api/tricky-words/attempt', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  app.post('/api/tricky-words/bulk', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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
  app.get('/api/achievements', requireAuth, async (req: any, res) => {
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

  app.get('/api/achievements/user', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      
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

  app.post('/api/achievements/award', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  // Award next perfect run badge in sequence
  app.post('/api/achievements/perfect-run', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      const { wordsTotal } = req.body;
      
      // Get user's current perfect run count
      const user = await storage.getUser(playerId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      const currentCount = user.perfectRunCount || 0;
      const newCount = currentCount + 1;
      
      // Progressive badges: perfect_run_1 through perfect_run_6
      const badgeNumber = Math.min(newCount, 6);
      const achievementId = `perfect_run_${badgeNumber}`;
      
      // Badge metadata for display
      const badgeInfo: { [key: string]: { title: string; icon: string; rarity: string } } = {
        'perfect_run_1': { title: 'Perfect Voyage', icon: '⭐', rarity: 'common' },
        'perfect_run_2': { title: 'Gold Compass', icon: '🧭', rarity: 'common' },
        'perfect_run_3': { title: 'Diamond Helm', icon: '💎', rarity: 'rare' },
        'perfect_run_4': { title: 'Starry Sextant', icon: '🌟', rarity: 'rare' },
        'perfect_run_5': { title: 'Treasure Master', icon: '👑', rarity: 'epic' },
        'perfect_run_6': { title: 'Legendary Captain', icon: '🏴‍☠️', rarity: 'legendary' },
      };
      
      // Check if user already has this specific badge
      const hasIt = await storage.hasAchievement(playerId, achievementId);
      
      if (hasIt) {
        // User already has all 6 badges, still a perfect run but no new badge
        // Increment the count to track total perfect runs
        await storage.updateUser(playerId, { perfectRunCount: newCount });
        return res.json({ 
          awarded: false, 
          message: 'All badges earned! Still a perfect run!',
          perfectRunCount: newCount,
          allBadgesEarned: true
        });
      }
      
      // Award the new badge
      await storage.awardAchievement(playerId, achievementId, { wordsTotal, perfectRunNumber: newCount });
      
      // Increment perfect run count
      await storage.updateUser(playerId, { perfectRunCount: newCount });
      
      const badge = badgeInfo[achievementId];
      
      res.json({ 
        awarded: true, 
        badge: {
          id: achievementId,
          ...badge
        },
        perfectRunCount: newCount
      });
    } catch (error) {
      console.error('Error awarding perfect run achievement:', error);
      res.status(500).json({ message: 'Failed to award perfect run achievement' });
    }
  });

  app.post('/api/achievements/check', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
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

  // Comprehensive badge check - awards ALL relevant badges after practice
  app.post('/api/achievements/check-all', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      const { isPerfect, wordsCorrect, treasureTotal } = req.body;
      
      // All badge definitions with thresholds
      const allBadges: { [key: string]: { title: string; icon: string; rarity: string; threshold?: number } } = {
        // Perfect run badges (awarded sequentially)
        'perfect_run_1': { title: 'Perfect Voyage', icon: '⭐', rarity: 'common' },
        'perfect_run_2': { title: 'Gold Compass', icon: '🧭', rarity: 'common' },
        'perfect_run_3': { title: 'Diamond Helm', icon: '💎', rarity: 'rare' },
        'perfect_run_4': { title: 'Starry Sextant', icon: '🌟', rarity: 'rare' },
        'perfect_run_5': { title: 'Treasure Master', icon: '👑', rarity: 'epic' },
        'perfect_run_6': { title: 'Legendary Captain', icon: '🏴‍☠️', rarity: 'legendary' },
        // Word master badges
        'first_word': { title: 'First Mate', icon: '⚓', rarity: 'common', threshold: 1 },
        'word_master_10': { title: 'Word Hunter', icon: '🎯', rarity: 'common', threshold: 10 },
        'word_master_50': { title: 'Word Wizard', icon: '🧙', rarity: 'rare', threshold: 50 },
        'word_master_100': { title: 'Spelling Captain', icon: '👑', rarity: 'epic', threshold: 100 },
        // Treasure badges
        'treasure_50': { title: 'Treasure Finder', icon: '💎', rarity: 'common', threshold: 50 },
        'treasure_200': { title: 'Treasure Hunter', icon: '💰', rarity: 'rare', threshold: 200 },
        'treasure_500': { title: 'Treasure King', icon: '👑', rarity: 'epic', threshold: 500 },
      };
      
      const user = await storage.getUser(playerId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
      
      // Collect ALL newly earned badges, but only show ONE in celebration
      const allNewBadges: { id: string; title: string; icon: string; rarity: string }[] = [];
      
      // Get historical data PLUS current session for accurate totals
      const progressRecords = await storage.getProgressByUser(playerId);
      const historicalWordsCorrect = progressRecords.reduce((sum: number, p: any) => sum + (p.correctWords?.length || 0), 0);
      // Include current session's words in the total
      const totalWordsCorrect = historicalWordsCorrect + (wordsCorrect || 0);
      const totalTreasures = treasureTotal || 0;
      
      // Helper to award a badge and track it
      const tryAwardBadge = async (achievementId: string) => {
        const hasIt = await storage.hasAchievement(playerId, achievementId);
        if (!hasIt && allBadges[achievementId]) {
          await storage.awardAchievement(playerId, achievementId, { 
            totalWordsCorrect, 
            totalTreasures,
            awardedAt: new Date().toISOString()
          });
          allNewBadges.push({ id: achievementId, ...allBadges[achievementId] });
          return true;
        }
        return false;
      };
      
      // 1. Check perfect run badges (if this was a perfect session)
      if (isPerfect) {
        const currentCount = user.perfectRunCount || 0;
        const newCount = currentCount + 1;
        const badgeNumber = Math.min(newCount, 6);
        const achievementId = `perfect_run_${badgeNumber}`;
        
        await tryAwardBadge(achievementId);
        // Always increment perfect run count
        await storage.updateUser(playerId, { perfectRunCount: newCount });
      }
      
      // 2. Check word master badges (using total INCLUDING current session)
      if (totalWordsCorrect >= 1) await tryAwardBadge('first_word');
      if (totalWordsCorrect >= 10) await tryAwardBadge('word_master_10');
      if (totalWordsCorrect >= 50) await tryAwardBadge('word_master_50');
      if (totalWordsCorrect >= 100) await tryAwardBadge('word_master_100');
      
      // 3. Check treasure badges
      if (totalTreasures >= 50) await tryAwardBadge('treasure_50');
      if (totalTreasures >= 200) await tryAwardBadge('treasure_200');
      if (totalTreasures >= 500) await tryAwardBadge('treasure_500');
      
      // Prioritize showing highest rarity badge in celebration
      const rarityOrder = ['legendary', 'epic', 'rare', 'common'];
      let badgeToShow: { id: string; title: string; icon: string; rarity: string } | null = null;
      
      for (const rarity of rarityOrder) {
        const matchingBadge = allNewBadges.find(b => b.rarity === rarity);
        if (matchingBadge) {
          badgeToShow = matchingBadge;
          break;
        }
      }
      
      res.json({
        awarded: badgeToShow !== null,
        badge: badgeToShow,
        allNewBadges: allNewBadges.length > 0 ? allNewBadges : undefined
      });
    } catch (error) {
      console.error('Error checking all achievements:', error);
      res.status(500).json({ message: 'Failed to check achievements' });
    }
  });

  // Analytics API - Real-time dashboard data with comprehensive word-level breakdown
  app.get('/api/analytics', requireAuth, async (req: any, res) => {
    try {
      const playerId = req.userId;
      
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
      const totalWordsInList = currentWordList?.words?.length || 0;
      const totalPracticeSessions = progressData.length;
      
      const sortedProgress = [...progressData].sort((a: any, b: any) => {
        const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
        const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
        return dateA - dateB;
      });

      const wordStats: Record<string, { attempts: number; correct: number; incorrect: number; streak: number; wasMastered: boolean; lastPracticed: string }> = {};
      
      sortedProgress.forEach((p: any) => {
        const correctWords = p.correctWords || [];
        const incorrectWords = p.incorrectWords || [];
        const practiceDate = p.completedAt || new Date().toISOString();
        
        correctWords.forEach((word: string) => {
          const w = word.toLowerCase();
          if (!wordStats[w]) {
            wordStats[w] = { attempts: 0, correct: 0, incorrect: 0, streak: 0, wasMastered: false, lastPracticed: practiceDate };
          }
          wordStats[w].attempts++;
          wordStats[w].correct++;
          wordStats[w].streak++;
          if (wordStats[w].streak >= 2) wordStats[w].wasMastered = true;
          wordStats[w].lastPracticed = practiceDate;
        });
        
        incorrectWords.forEach((word: string) => {
          const w = word.toLowerCase();
          if (!wordStats[w]) {
            wordStats[w] = { attempts: 0, correct: 0, incorrect: 0, streak: 0, wasMastered: false, lastPracticed: practiceDate };
          }
          wordStats[w].attempts++;
          wordStats[w].incorrect++;
          wordStats[w].streak = 0;
          wordStats[w].lastPracticed = practiceDate;
        });
      });
      
      const wordBreakdown = Object.entries(wordStats).map(([word, stats]) => {
        const accuracy = stats.attempts > 0 ? Math.round((stats.correct / stats.attempts) * 100) : 0;
        let status: 'mastered' | 'practicing' | 'learning' = 'learning';
        if (stats.streak >= 2) {
          status = 'mastered';
        } else if (stats.wasMastered && stats.streak < 2) {
          status = 'practicing';
        } else if (stats.attempts >= 1) {
          status = 'learning';
        }
        return {
          word,
          attempts: stats.attempts,
          correct: stats.correct,
          incorrect: stats.incorrect,
          accuracy,
          status,
          lastPracticed: stats.lastPracticed
        };
      }).sort((a, b) => a.accuracy - b.accuracy);
      
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
      const avgSessionMinutes = totalPracticeSessions > 0 ? Math.round((totalTimeSpent / 60) / totalPracticeSessions) : 0;
      
      // Calculate streak (consecutive days with practice)
      const uniqueDays = new Set<string>();
      progressData.forEach((p: any) => {
        if (p.completedAt) {
          uniqueDays.add(new Date(p.completedAt).toISOString().split('T')[0]);
        }
      });
      const sortedDays = Array.from(uniqueDays).sort().reverse();
      
      let currentStreak = 0;
      let longestStreak = 0;
      let tempStreak = 0;
      const today = new Date().toISOString().split('T')[0];
      const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
      
      if (sortedDays.length > 0) {
        const firstDay = sortedDays[0];
        if (firstDay === today || firstDay === yesterday) {
          currentStreak = 1;
          for (let i = 1; i < sortedDays.length; i++) {
            const prevDate = new Date(sortedDays[i - 1]);
            const currDate = new Date(sortedDays[i]);
            const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
            if (Math.round(diff) === 1) {
              currentStreak++;
            } else {
              break;
            }
          }
        }
        
        // Calculate longest streak
        tempStreak = 1;
        for (let i = 1; i < sortedDays.length; i++) {
          const prevDate = new Date(sortedDays[i - 1]);
          const currDate = new Date(sortedDays[i]);
          const diff = (prevDate.getTime() - currDate.getTime()) / 86400000;
          if (Math.round(diff) === 1) {
            tempStreak++;
          } else {
            longestStreak = Math.max(longestStreak, tempStreak);
            tempStreak = 1;
          }
        }
        longestStreak = Math.max(longestStreak, tempStreak, currentStreak);
      }
      
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
      
      // Word mastery breakdown - from actual word stats
      const masteredCount = wordBreakdown.filter(w => w.status === 'mastered').length;
      const learningCount = wordBreakdown.filter(w => w.status === 'learning').length;
      const practicingCount = wordBreakdown.filter(w => w.status === 'practicing').length;
      
      const wordMastery = {
        mastered: masteredCount,
        learning: learningCount + practicingCount,
        total: wordBreakdown.length
      };
      
      // Session history with word-by-word breakdown (last 10 sessions)
      const sessionHistory = progressData.slice(0, 10).map((p: any) => ({
        id: p.id,
        date: p.completedAt,
        correctWords: p.correctWords || [],
        incorrectWords: p.incorrectWords || [],
        score: p.score || 0,
        character: p.characterUsed || 'red-boot',
        timeSpent: p.timeSpent || 0,
        wordListId: p.wordListId
      }));
      
      // Recent activity (last 5 sessions) - simplified view
      const recentActivity = progressData.slice(0, 5).map((p: any) => ({
        id: p.id,
        date: p.completedAt,
        correct: p.correctWords?.length || 0,
        incorrect: p.incorrectWords?.length || 0,
        score: p.score || 0,
        character: p.characterUsed || 'red-boot'
      }));
      
      // Struggling words (accuracy < 50%)
      const strugglingWords = wordBreakdown.filter(w => w.accuracy < 50 && w.attempts >= 2);
      
      // Star performers (accuracy >= 90%)
      const starWords = wordBreakdown.filter(w => w.accuracy >= 90 && w.attempts >= 2);
      
      res.json({
        childName: userData.childName || 'Adventurer',
        gradeLevel: userData.gradeLevel,
        stats: {
          totalWordsInList,
          totalWordsPracticed: totalAttempted,
          totalPracticeSessions,
          overallAccuracy,
          totalMinutes,
          avgSessionMinutes,
          currentStreak,
          longestStreak,
          totalTreasures,
          achievementsEarned: userAchievements.length,
          totalAchievements: 24,
          trickyWordsActive: activeTrickyWords.length,
          trickyWordsMastered: masteredTrickyWords.length
        },
        dailyProgress,
        wordMastery,
        wordBreakdown,
        strugglingWords: strugglingWords.slice(0, 5),
        starWords: starWords.slice(0, 5),
        sessionHistory,
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

    // Gemini Vision OCR — extract spelling words from a photo
    app.post('/api/ocr/extract-words', async (req, res) => {
      try {
        const { image } = req.body;
        if (!image || typeof image !== 'string') {
          return res.status(400).json({ words: [], success: false });
        }
        if (!genAI) {
          return res.status(503).json({ words: [], success: false, message: 'Gemini not configured' });
        }

        const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
        const base64Data = image.replace(/^data:image\/\w+;base64,/, '');
        const mimeType = (image.match(/^data:(image\/\w+);base64,/)?.[1] || 'image/jpeg') as string;

        const prompt = `You are reading a photo of a child's weekly spelling word list from school. Extract every spelling word from the image. Rules:
- Return ONLY a JSON array of lowercase strings, nothing else
- Ignore headers like 'Spelling Words', 'Week of', dates, teacher names
- Ignore numbers (1., 2., etc.) — just extract the words
- If words are numbered, preserve the order
- Fix obvious OCR issues (partial letters, smudges)
- Only include real English words, skip garbage/noise
- Maximum 25 words
- Example output: ["jail","spray","mail","play","paint"]`;

        const result = await model.generateContent([
          { text: prompt },
          { inlineData: { data: base64Data, mimeType } },
        ]);

        const text = result.response.text();
        const cleaned = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (!Array.isArray(parsed)) {
          return res.json({ words: [], success: false });
        }

        const words = parsed.filter((w: any) => typeof w === 'string');
        return res.json({ words, success: true });
      } catch (error) {
        console.error('Gemini OCR error:', error);
        return res.status(500).json({ words: [], success: false });
      }
    });

    // Create a Stripe Checkout Session and return the hosted URL
    // Accepts { plan: 'annual'|'monthly'|'abandonment', includeTrial: boolean, customerEmail?: string }
    app.post('/api/stripe/create-checkout-session', async (req, res) => {
      try {
        const { plan, customerEmail, includeTrial } = req.body;

        const priceMap: Record<string, string | undefined> = {
          annual_trial:     process.env.STRIPE_PRICE_ANNUAL,
          annual_notrial:   process.env.STRIPE_PRICE_ANNUAL_NO_TRIAL,
          monthly_trial:    process.env.STRIPE_PRICE_MONTHLY,
          monthly_notrial:  process.env.STRIPE_PRICE_MONTHLY_NO_TRIAL,
          abandonment_notrial: process.env.STRIPE_PRICE_ABANDONMENT,
        };

        const trialKey = includeTrial ? 'trial' : 'notrial';
        const priceId = priceMap[`${plan}_${trialKey}`];

        if (!priceId) {
          return res.status(400).json({ message: `No price configured for plan: ${plan}, trial: ${includeTrial}` });
        }

        const origin = `${req.protocol}://${req.get('host')}`;

        const sessionParams: Stripe.Checkout.SessionCreateParams = {
          mode: 'subscription',
          line_items: [{ price: priceId, quantity: 1 }],
          success_url: `${origin}/dashboard?payment=success&session_id={CHECKOUT_SESSION_ID}`,
          cancel_url: `${origin}/dashboard?payment=canceled`,
          allow_promotion_codes: true,
        };

        if (customerEmail) {
          sessionParams.customer_email = customerEmail;
        }

        if (includeTrial && plan !== 'abandonment') {
          sessionParams.subscription_data = { trial_period_days: 7 };
        }

        const session = await stripe!.checkout.sessions.create(sessionParams);
        res.json({ url: session.url });
      } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ message: 'Failed to create checkout session' });
      }
    });

    // Verify a completed checkout session and return subscription status
    app.get('/api/stripe/subscription-status', async (req, res) => {
      try {
        const { sessionId } = req.query;
        if (!sessionId || typeof sessionId !== 'string') {
          return res.status(400).json({ message: 'sessionId is required' });
        }

        const session = await stripe!.checkout.sessions.retrieve(sessionId, {
          expand: ['subscription'],
        });

        if (session.payment_status === 'paid' || session.status === 'complete') {
          const sub = session.subscription as Stripe.Subscription | null;
          const plan = sub?.items?.data?.[0]?.price?.recurring?.interval === 'year' ? 'annual' : 'monthly';
          return res.json({ active: true, plan });
        }

        return res.json({ active: false });
      } catch (error) {
        console.error('Error retrieving subscription status:', error);
        res.status(500).json({ message: 'Failed to retrieve subscription status' });
      }
    });

    // Stripe webhook — handles subscription lifecycle events
    app.post('/api/stripe/webhook', async (req, res) => {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      let event: Stripe.Event;

      try {
        if (webhookSecret && sig && Buffer.isBuffer(req.body)) {
          event = stripe!.webhooks.constructEvent(req.body, sig, webhookSecret);
        } else {
          // No webhook secret configured — parse body directly (dev/testing only)
          const body = Buffer.isBuffer(req.body) ? JSON.parse(req.body.toString()) : req.body;
          event = body as Stripe.Event;
        }
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook error: ${err.message}` });
      }

      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`Checkout completed for session: ${session.id}`);
          break;
        }
        case 'customer.subscription.updated': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Subscription updated: ${subscription.id}, status: ${subscription.status}`);
          break;
        }
        case 'customer.subscription.deleted': {
          const subscription = event.data.object as Stripe.Subscription;
          console.log(`Subscription cancelled: ${subscription.id}`);
          break;
        }
        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          console.log(`Payment failed for invoice: ${invoice.id}`);
          break;
        }
        default:
          break;
      }

      res.json({ received: true });
    });
  }

  const server = createServer(app);
  return server;
}