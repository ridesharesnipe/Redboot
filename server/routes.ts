import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertChildSchema, insertWordListSchema, insertProgressSchema } from "@shared/schema";
import { z } from "zod";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Setup authentication middleware
  await setupAuth(app);

  // Simple API routes for basic functionality
  app.get('/api/status', async (req, res) => {
    res.json({ status: 'ready', message: 'Red Boot\'s Spelling Adventure is ready!' });
  });

  // Auth user endpoint - returns null if not authenticated instead of 401
  app.get('/api/auth/user', async (req: any, res) => {
    try {
      if (!req.isAuthenticated()) {
        return res.json(null);
      }
      
      const userId = req.user?.claims?.sub;
      if (!userId) {
        return res.json(null);
      }
      
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Onboarding endpoint
  app.post('/api/onboarding', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { childName, gradeLevel, skip } = req.body;
      
      // If skipping, just set onboardingComplete to true
      if (skip) {
        const updatedUser = await storage.updateUserOnboarding(userId, undefined, undefined, true);
        return res.json({ user: updatedUser });
      }

      // Otherwise save the data
      const updatedUser = await storage.updateUserOnboarding(userId, childName, gradeLevel, true);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });

  // Photos now stored in browser IndexedDB - no server routes needed!

  // Word Lists API routes
  app.get('/api/word-lists', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // For now, use the user's childName as the default child
      // Later can expand to support multiple children
      const children = await storage.getChildren(userId);
      
      // If no children exist, create a default one from user's childName
      let childId: string;
      if (children.length === 0) {
        const userData = await storage.getUser(userId);
        if (!userData || !userData.childName) {
          return res.json([]);
        }
        const newChild = await storage.createChild({
          parentId: userId,
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

  app.post('/api/word-lists', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate request body
      const validatedData = insertWordListSchema.parse(req.body);

      // Get or create child for this user
      const children = await storage.getChildren(userId);
      let childId: string;
      
      if (children.length === 0) {
        const userData = await storage.getUser(userId);
        // Use child name from user data, or default to "My Child" if not set
        const childName = userData?.childName || "My Child";
        const newChild = await storage.createChild({
          parentId: userId,
          name: childName,
          grade: userData?.gradeLevel || undefined,
        });
        childId = newChild.id;
      } else {
        childId = children[0].id;
      }

      // Create word list
      const wordList = await storage.createWordList({
        ...validatedData,
        childId,
      });
      
      res.json(wordList);
    } catch (error) {
      console.error('Error creating word list:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: 'Invalid request data', errors: error.errors });
      }
      res.status(500).json({ message: 'Failed to create word list' });
    }
  });

  app.get('/api/word-lists/:id', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const wordList = await storage.getWordList(req.params.id);
      if (!wordList) {
        return res.status(404).json({ message: 'Word list not found' });
      }

      // Verify ownership: Check that the word list's child belongs to this parent
      const child = await storage.getChild(wordList.childId);
      if (!child || child.parentId !== userId) {
        return res.status(403).json({ message: 'Access denied: You do not own this word list' });
      }

      res.json(wordList);
    } catch (error) {
      console.error('Error fetching word list:', error);
      res.status(500).json({ message: 'Failed to fetch word list' });
    }
  });

  // Progress API routes
  app.get('/api/progress', isAuthenticated, async (req: any, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Get child
      const children = await storage.getChildren(userId);
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

  app.post('/api/progress', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      // Validate request body
      const validatedData = insertProgressSchema.parse(req.body);

      // Get child
      const children = await storage.getChildren(userId);
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

  // Treasure Vault API routes - accessible without authentication
  app.get('/api/treasures', async (req: any, res) => {
    try {
      // If not authenticated, return empty treasures
      if (!req.isAuthenticated()) {
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

      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
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

      const userData = await storage.getUser(userId);
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

  app.post('/api/treasures/add', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { character, amount } = req.body;
      if (!character || !amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid request' });
      }

      await storage.addTreasures(userId, character, amount);
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