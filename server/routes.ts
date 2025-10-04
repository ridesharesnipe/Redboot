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
  } catch (error) {
    console.error('❌ Session validation error:', error);
    return res.status(500).json({ message: 'Session validation failed', error: String(error) });
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
      
      // If skipping, just set onboardingComplete to true
      if (skip) {
        const updatedUser = await storage.updateUserOnboarding(playerId, undefined, undefined, true);
        return res.json({ user: updatedUser });
      }

      // Otherwise save the data
      const updatedUser = await storage.updateUserOnboarding(playerId, childName, gradeLevel, true);
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

      // Validate request body
      const validatedData = insertWordListSchema.parse(req.body);

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
      
      if (!userData) {
        return res.status(404).json({ message: 'User not found' });
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
      res.json({ success: true });
    } catch (error) {
      console.error('Error adding treasures:', error);
      res.status(500).json({ message: 'Failed to add treasures' });
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