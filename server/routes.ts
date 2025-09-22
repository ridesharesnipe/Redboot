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
  // Auth middleware
  await setupAuth(app);

  // Auth routes
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

  // Children routes
  app.get('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const children = await storage.getChildren(userId);
      res.json(children);
    } catch (error) {
      console.error("Error fetching children:", error);
      res.status(500).json({ message: "Failed to fetch children" });
    }
  });

  app.post('/api/children', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const childData = insertChildSchema.parse({
        ...req.body,
        parentId: userId,
      });
      const child = await storage.createChild(childData);
      res.json(child);
    } catch (error) {
      console.error("Error creating child:", error);
      res.status(500).json({ message: "Failed to create child" });
    }
  });

  app.get('/api/children/:id', isAuthenticated, async (req: any, res) => {
    try {
      const child = await storage.getChild(req.params.id);
      if (!child) {
        return res.status(404).json({ message: "Child not found" });
      }
      res.json(child);
    } catch (error) {
      console.error("Error fetching child:", error);
      res.status(500).json({ message: "Failed to fetch child" });
    }
  });

  // Word lists routes
  app.get('/api/children/:childId/wordlists', isAuthenticated, async (req, res) => {
    try {
      const wordLists = await storage.getWordLists(req.params.childId);
      res.json(wordLists);
    } catch (error) {
      console.error("Error fetching word lists:", error);
      res.status(500).json({ message: "Failed to fetch word lists" });
    }
  });

  app.post('/api/children/:childId/wordlists', isAuthenticated, async (req, res) => {
    try {
      const wordListData = insertWordListSchema.parse({
        ...req.body,
        childId: req.params.childId,
      });
      const wordList = await storage.createWordList(wordListData);
      res.json(wordList);
    } catch (error) {
      console.error("Error creating word list:", error);
      res.status(500).json({ message: "Failed to create word list" });
    }
  });

  // OCR endpoint for photo capture
  app.post('/api/ocr/extract', isAuthenticated, async (req, res) => {
    try {
      // In a real implementation, this would use Tesseract.js or similar OCR service
      // For now, return a mock response
      const { imageData } = req.body;
      
      // Mock OCR extraction - in production, implement actual OCR
      const extractedWords = [
        "adventure", "treasure", "pirate", "sailing", "captain", 
        "island", "ocean", "compass", "anchor", "ship"
      ];
      
      res.json({ words: extractedWords });
    } catch (error) {
      console.error("Error extracting text:", error);
      res.status(500).json({ message: "Failed to extract text from image" });
    }
  });

  // Progress routes
  app.get('/api/children/:childId/progress', isAuthenticated, async (req, res) => {
    try {
      const progress = await storage.getProgress(req.params.childId);
      res.json(progress);
    } catch (error) {
      console.error("Error fetching progress:", error);
      res.status(500).json({ message: "Failed to fetch progress" });
    }
  });

  app.post('/api/children/:childId/progress', isAuthenticated, async (req, res) => {
    try {
      const progressData = insertProgressSchema.parse({
        ...req.body,
        childId: req.params.childId,
      });
      const progress = await storage.createProgress(progressData);
      res.json(progress);
    } catch (error) {
      console.error("Error creating progress:", error);
      res.status(500).json({ message: "Failed to create progress" });
    }
  });

  // Stripe subscription route
  app.post('/api/get-or-create-subscription', isAuthenticated, async (req: any, res) => {
    if (!stripe) {
      return res.status(503).json({ 
        message: "Subscription service unavailable. Please configure Stripe keys." 
      });
    }

    const userId = req.user.claims.sub;
    let user = await storage.getUser(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (user.stripeSubscriptionId) {
      const subscription = await stripe.subscriptions.retrieve(user.stripeSubscriptionId);
      const invoice = await stripe.invoices.retrieve(subscription.latest_invoice as string, {
        expand: ['payment_intent']
      });

      res.send({
        subscriptionId: subscription.id,
        clientSecret: (invoice as any)?.payment_intent?.client_secret || null,
      });
      return;
    }
    
    if (!user.email) {
      throw new Error('No user email on file');
    }

    try {
      const customer = await stripe.customers.create({
        email: user.email,
        name: `${user.firstName} ${user.lastName}`,
      });

      const subscription = await stripe.subscriptions.create({
        customer: customer.id,
        items: [{
          price: process.env.STRIPE_PRICE_ID || 'price_1234567890', // Default price ID
        }],
        payment_behavior: 'default_incomplete',
        expand: ['latest_invoice.payment_intent'],
      });

      await storage.updateUserStripeInfo(userId, customer.id, subscription.id);
  
      res.send({
        subscriptionId: subscription.id,
        clientSecret: (subscription.latest_invoice as any)?.payment_intent?.client_secret,
      });
    } catch (error: any) {
      return res.status(400).send({ error: { message: error.message } });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
