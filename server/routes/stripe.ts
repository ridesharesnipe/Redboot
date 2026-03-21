import type { Express, Request, Response } from 'express';
import Stripe from 'stripe';
import { storage } from '../storage';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-08-27.basil',
});

// In-memory rate limiter: 3 attempts per IP per hour for the restore endpoint
const restoreAttempts = new Map<string, { count: number; resetAt: number }>();
function checkRestoreRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = restoreAttempts.get(ip);
  if (!entry || now > entry.resetAt) {
    restoreAttempts.set(ip, { count: 1, resetAt: now + 60 * 60 * 1000 });
    return true;
  }
  if (entry.count >= 3) return false;
  entry.count++;
  return true;
}
// Purge expired rate-limiter entries every hour to prevent unbounded Map growth
setInterval(() => {
  const now = Date.now();
  for (const [ip, entry] of restoreAttempts) {
    if (now > entry.resetAt) restoreAttempts.delete(ip);
  }
}, 60 * 60 * 1000).unref();

// Pending restores: deviceId → subscription fields + the earliest time they may be applied
interface PendingRestore {
  stripeCustomerId: string;
  subscriptionId: string;
  status: 'active' | 'trial';
  plan: 'annual' | 'monthly';
  currentPeriodEnd: Date;
  applyAt: number; // ms timestamp
}
const pendingRestores = new Map<string, PendingRestore>();

const PRICE_IDS = {
  annual: process.env.STRIPE_PRICE_ANNUAL,
  annual_no_trial: process.env.STRIPE_PRICE_ANNUAL_NO_TRIAL,
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  monthly_no_trial: process.env.STRIPE_PRICE_MONTHLY_NO_TRIAL,
  abandonment: process.env.STRIPE_PRICE_ABANDONMENT,
};

function stripeStatusToLocal(status: Stripe.Subscription.Status): 'trial' | 'active' | 'cancelled' | 'past_due' | 'free' {
  switch (status) {
    case 'trialing': return 'trial';
    case 'active': return 'active';
    case 'canceled': return 'cancelled';
    case 'past_due': return 'past_due';
    case 'unpaid': return 'past_due';
    default: return 'free';
  }
}

async function getSubscriptionTrialStatus(subscriptionId: string): Promise<'trial' | 'active'> {
  try {
    const sub = await stripe.subscriptions.retrieve(subscriptionId);
    return sub.status === 'trialing' ? 'trial' : 'active';
  } catch {
    return 'active';
  }
}

export function registerDeviceStripeRoutes(app: Express): void {
  // POST /api/create-checkout-session
  app.post('/api/create-checkout-session', async (req: Request, res: Response) => {
    try {
      if (!process.env.STRIPE_SECRET_KEY) {
        return res.status(500).json({ message: 'Stripe not configured' });
      }

      const { plan, trial, offer, email, deviceId } = req.body;

      if (!deviceId) {
        return res.status(400).json({ message: 'deviceId is required' });
      }

      let priceId: string | undefined;
      let trialDays: number | undefined;

      if (offer === 'abandonment') {
        priceId = PRICE_IDS.abandonment;
      } else if (plan === 'annual') {
        priceId = trial ? PRICE_IDS.annual : PRICE_IDS.annual_no_trial;
        trialDays = trial ? 7 : undefined;
      } else {
        priceId = trial ? PRICE_IDS.monthly : PRICE_IDS.monthly_no_trial;
        trialDays = trial ? 7 : undefined;
      }

      if (!priceId) {
        return res.status(400).json({ message: 'Invalid plan configuration' });
      }

      const proto = req.headers['x-forwarded-proto'] || req.protocol;
      const host = req.headers.host;
      const baseUrl = `${proto}://${host}`;
      const encodedDeviceId = encodeURIComponent(deviceId);

      const sessionParams: Stripe.Checkout.SessionCreateParams = {
        mode: 'subscription',
        payment_method_types: ['card'],
        line_items: [{ price: priceId, quantity: 1 }],
        success_url: `${baseUrl}/dashboard?success=true&deviceId=${encodedDeviceId}`,
        cancel_url: `${baseUrl}/dashboard?canceled=true&deviceId=${encodedDeviceId}`,
        metadata: {
          deviceId,
          plan: offer === 'abandonment' ? 'annual' : (plan || 'annual'),
          offer: offer || 'standard',
        },
      };

      if (email) {
        sessionParams.customer_email = email;
      }

      if (trialDays) {
        sessionParams.subscription_data = {
          trial_period_days: trialDays,
          metadata: { deviceId },
        };
      } else {
        sessionParams.subscription_data = { metadata: { deviceId } };
      }

      const session = await stripe.checkout.sessions.create(sessionParams);
      res.json({ url: session.url });
    } catch (error: any) {
      console.error('Error creating checkout session:', error);
      res.status(500).json({ message: error.message || 'Failed to create checkout session' });
    }
  });

  // GET /api/subscription-status?deviceId=xxx
  app.get('/api/subscription-status', async (req: Request, res: Response) => {
    try {
      const { deviceId } = req.query;
      if (!deviceId || typeof deviceId !== 'string') {
        return res.status(400).json({ message: 'deviceId is required' });
      }

      // Apply any pending restore whose 15-minute delay has elapsed
      const pending = pendingRestores.get(deviceId);
      if (pending && Date.now() >= pending.applyAt) {
        pendingRestores.delete(deviceId);
        await storage.upsertDeviceSubscription(deviceId, {
          status: pending.status,
          stripeCustomerId: pending.stripeCustomerId,
          subscriptionId: pending.subscriptionId,
          currentPeriodEnd: pending.currentPeriodEnd,
          plan: pending.plan,
        });
      }

      const sub = await storage.getDeviceSubscription(deviceId);
      if (!sub) {
        return res.json({ status: 'free' });
      }

      res.json({
        status: sub.status,
        stripeCustomerId: sub.stripeCustomerId,
        subscriptionId: sub.subscriptionId,
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
        plan: sub.plan,
      });
    } catch (error: any) {
      console.error('Error fetching subscription status:', error);
      res.status(500).json({ message: error.message || 'Failed to fetch subscription status' });
    }
  });

  // POST /api/restore-purchase — look up active subscription by email, remap to current device
  app.post('/api/restore-purchase', async (req: Request, res: Response) => {
    try {
      const ip = (req.headers['x-forwarded-for'] as string)?.split(',')[0]?.trim() || req.socket.remoteAddress || 'unknown';
      if (!checkRestoreRateLimit(ip)) {
        return res.status(429).json({ message: 'Too many attempts. Please try again later.' });
      }

      const { email, deviceId } = req.body;
      if (!email || !deviceId) {
        return res.status(400).json({ message: 'email and deviceId are required' });
      }

      // Generic response sent whether or not a match is found (prevents email enumeration)
      const genericOk = { queued: true, message: 'If a subscription exists for that email, access will be restored on this device.' };

      // Find Stripe customers with this email
      const customers = await stripe.customers.list({ email: email.toLowerCase(), limit: 5 });
      if (!customers.data.length) {
        return res.json(genericOk);
      }

      // Check each customer for an active or trialing subscription
      for (const customer of customers.data) {
        const subs = await stripe.subscriptions.list({
          customer: customer.id,
          status: 'all',
          limit: 5,
        });

        // Pick the most recently created active or trialing subscription
        const activeSub = subs.data
          .filter(s => s.status === 'active' || s.status === 'trialing')
          .sort((a, b) => b.created - a.created)[0];
        if (!activeSub) continue;

        const status = activeSub.status === 'trialing' ? 'trial' : 'active';
        const interval = activeSub.items.data[0]?.price.recurring?.interval;
        const plan = interval === 'year' ? 'annual' : 'monthly';
        const currentPeriodEnd = new Date(activeSub.current_period_end * 1000);

        // Queue the restore — applied only after 15 min to prevent status-oracle enumeration
        pendingRestores.set(deviceId, {
          stripeCustomerId: customer.id,
          subscriptionId: activeSub.id,
          status,
          plan,
          currentPeriodEnd,
          applyAt: Date.now() + 15 * 60 * 1000,
        });

        // Always return the generic message — do not reveal restored: true/false
        return res.json(genericOk);
      }

      // No active subscription found — still return the generic message
      res.json(genericOk);
    } catch (error: any) {
      console.error('Error restoring purchase:', error);
      res.status(500).json({ message: 'Something went wrong. Please try again.' });
    }
  });
}

export function registerDeviceStripeWebhook(app: Express): void {
  app.post(
    '/api/webhook',
    (req: Request, _res: Response, next: any) => {
      if ((req as any).rawBody) return next();
      let data = Buffer.alloc(0);
      req.on('data', (chunk: Buffer) => { data = Buffer.concat([data, chunk]); });
      req.on('end', () => { (req as any).rawBody = data; next(); });
    },
    async (req: Request, res: Response) => {
      const sig = req.headers['stripe-signature'];
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!sig || !webhookSecret) {
        console.warn('Webhook missing signature or secret');
        return res.status(400).json({ message: 'Missing stripe-signature or STRIPE_WEBHOOK_SECRET' });
      }

      let event: Stripe.Event;
      try {
        event = stripe.webhooks.constructEvent((req as any).rawBody, sig, webhookSecret);
      } catch (err: any) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).json({ message: `Webhook Error: ${err.message}` });
      }

      try {
        switch (event.type) {
          case 'checkout.session.completed': {
            const session = event.data.object as Stripe.Checkout.Session;
            const deviceId = session.metadata?.deviceId;
            if (!deviceId) break;

            const subscriptionId = session.subscription as string | null;
            const status = subscriptionId
              ? await getSubscriptionTrialStatus(subscriptionId)
              : 'active';

            await storage.upsertDeviceSubscription(deviceId, {
              status,
              stripeCustomerId: session.customer as string,
              subscriptionId: subscriptionId ?? undefined,
              plan: session.metadata?.plan ?? null,
            });
            break;
          }

          case 'customer.subscription.updated': {
            const sub = event.data.object as Stripe.Subscription;
            const deviceId = sub.metadata?.deviceId;
            if (!deviceId) break;

            const status = stripeStatusToLocal(sub.status);
            const periodEnd = new Date(sub.current_period_end * 1000);
            const interval = sub.items.data[0]?.price.recurring?.interval;
            const plan = interval === 'year' ? 'annual' : 'monthly';

            await storage.upsertDeviceSubscription(deviceId, {
              status,
              subscriptionId: sub.id,
              currentPeriodEnd: periodEnd,
              plan,
            });
            break;
          }

          case 'customer.subscription.deleted': {
            const sub = event.data.object as Stripe.Subscription;
            const deviceId = sub.metadata?.deviceId;
            if (!deviceId) break;

            await storage.upsertDeviceSubscription(deviceId, { status: 'cancelled' });
            break;
          }

          case 'invoice.payment_failed': {
            const invoice = event.data.object as Stripe.Invoice;
            const subscriptionId = (invoice as any).subscription as string | null;
            if (!subscriptionId) break;

            const sub = await stripe.subscriptions.retrieve(subscriptionId);
            const deviceId = sub?.metadata?.deviceId;
            if (!deviceId) break;

            await storage.upsertDeviceSubscription(deviceId, { status: 'past_due' });
            break;
          }
        }

        res.json({ received: true });
      } catch (error: any) {
        console.error('Webhook handler error:', error);
        res.status(500).json({ message: 'Webhook handler failed' });
      }
    }
  );
}
