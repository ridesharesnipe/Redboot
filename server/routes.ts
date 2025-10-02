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

  // Auth user endpoint
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
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

  // Treasure Vault API routes
  app.get('/api/treasures', isAuthenticated, async (req, res) => {
    try {
      const user = req.user as any;
      const userId = user?.claims?.sub;
      if (!userId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const userData = await storage.getUser(userId);
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