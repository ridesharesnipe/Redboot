import type { Express } from "express";
import { createServer, type Server } from "http";
import Stripe from "stripe";
import { storage } from "./storage";
import { ObjectStorageService } from "./objectStorage";
// No authentication imports needed for streamlined experience
import { insertChildSchema, insertWordListSchema, insertProgressSchema, insertPhotoSchema, photos } from "@shared/schema";
import { z } from "zod";
import { db } from "./db";

let stripe: Stripe | null = null;
if (process.env.STRIPE_SECRET_KEY) {
  stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: "2025-08-27.basil",
  });
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Streamlined experience - no authentication required

  // Simple API routes for basic functionality
  app.get('/api/status', async (req, res) => {
    res.json({ status: 'ready', message: 'Red Boot\'s Spelling Adventure is ready!' });
  });

  // Photo storage routes
  const objectStorageService = new ObjectStorageService();
  
  // Get upload URL for a new photo
  app.post('/api/photos/upload-url', async (req, res) => {
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  // Save photo metadata after upload
  app.post('/api/photos', async (req, res) => {
    try {
      const photoData = insertPhotoSchema.parse(req.body);
      const [photo] = await db.insert(photos).values(photoData).returning();
      res.json(photo);
    } catch (error) {
      console.error("Error saving photo:", error);
      res.status(500).json({ error: "Failed to save photo" });
    }
  });

  // Get photo history
  app.get('/api/photos', async (req, res) => {
    try {
      const photoHistory = await db.select().from(photos).orderBy(photos.capturedAt);
      res.json(photoHistory);
    } catch (error) {
      console.error("Error fetching photos:", error);
      res.status(500).json({ error: "Failed to fetch photos" });
    }
  });

  // Serve photos from object storage
  app.get("/objects/:objectPath(*)", async (req, res) => {
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error accessing photo:", error);
      res.sendStatus(404);
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