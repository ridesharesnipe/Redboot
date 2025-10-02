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

export async function registerRoutes(app: Express): Promise<Server> {
  // Simple API routes for basic functionality
  app.get('/api/status', async (req, res) => {
    res.json({ status: 'ready', message: 'Red Boot\'s Spelling Adventure is ready!' });
  });

  // Onboarding endpoint
  app.post('/api/onboarding', async (req, res) => {
    try {
      const user = req.user as any;
      if (!req.isAuthenticated() || !user?.id) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const { childName, gradeLevel, skip } = req.body;
      
      // If skipping, just set onboardingComplete to true
      if (skip) {
        const updatedUser = await storage.updateUserOnboarding(user.id, undefined, undefined, true);
        return res.json({ user: updatedUser });
      }

      // Otherwise save the data
      const updatedUser = await storage.updateUserOnboarding(user.id, childName, gradeLevel, true);
      res.json({ user: updatedUser });
    } catch (error) {
      console.error("Error saving onboarding data:", error);
      res.status(500).json({ message: "Failed to save onboarding data" });
    }
  });

  // Photos now stored in browser IndexedDB - no server routes needed!

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