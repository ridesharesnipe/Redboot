const STORAGE_KEY = 'redboot-subscription';
const DEVICE_KEY = 'redboot-device-id';

export interface SubscriptionState {
  status: 'free' | 'trial' | 'active' | 'cancelled' | 'past_due';
  freeSessionUsed: boolean;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
  plan: 'monthly' | 'annual' | null;
}

const DEFAULT: SubscriptionState = {
  status: 'free',
  freeSessionUsed: false,
  stripeCustomerId: null,
  subscriptionId: null,
  currentPeriodEnd: null,
  plan: null,
};

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_KEY);
  if (!id) {
    id = crypto.randomUUID ? crypto.randomUUID() : Math.random().toString(36).slice(2) + Date.now().toString(36);
    localStorage.setItem(DEVICE_KEY, id);
  }
  return id;
}

export function getSubscription(): SubscriptionState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { ...DEFAULT };
    return { ...DEFAULT, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT };
  }
}

export function setSubscription(updates: Partial<SubscriptionState>): void {
  const current = getSubscription();
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...current, ...updates }));
}

export function isSubscribed(): boolean {
  const { status } = getSubscription();
  return status === 'trial' || status === 'active';
}

export function setFreeSessionUsed(): void {
  setSubscription({ freeSessionUsed: true });
}

export function canAccessFeature(feature: 'practice' | 'fridayTest' | 'analytics' | 'characters'): boolean {
  if (isSubscribed()) return true;
  const sub = getSubscription();
  if (feature === 'practice' && !sub.freeSessionUsed) return true;
  return false;
}

export async function createCheckoutSession(
  plan: 'monthly' | 'annual',
  trial: boolean,
  offer: 'standard' | 'abandonment',
  email: string
): Promise<string> {
  const deviceId = getDeviceId();
  localStorage.setItem('redboot-parent-email', email);
  const res = await fetch('/api/create-checkout-session', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ plan, trial, offer, email, deviceId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to create checkout session');
  return data.url;
}

export async function syncSubscriptionStatus(): Promise<void> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(`/api/subscription-status?deviceId=${encodeURIComponent(deviceId)}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.status) {
      setSubscription({
        status: data.status,
        stripeCustomerId: data.stripeCustomerId ?? null,
        subscriptionId: data.subscriptionId ?? null,
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        plan: data.plan ?? null,
      });
    }
  } catch {
    // offline — use cached localStorage value
  }
}

// Restore a previous purchase on a new device by looking up the email in Stripe.
export async function restorePurchase(email: string): Promise<{ restored: boolean; status?: string }> {
  const deviceId = getDeviceId();
  const res = await fetch('/api/restore-purchase', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: email.trim().toLowerCase(), deviceId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || 'Failed to restore purchase');
  if (data.restored) {
    setSubscription({
      status: data.status,
      stripeCustomerId: data.stripeCustomerId ?? null,
      subscriptionId: data.subscriptionId ?? null,
      currentPeriodEnd: data.currentPeriodEnd ?? null,
      plan: data.plan ?? null,
    });
  }
  return { restored: data.restored, status: data.status };
}

// After a successful Stripe checkout, the webhook may not have arrived yet.
// Poll a few times with increasing delays until the status upgrades from 'free'.
export async function pollSubscriptionStatus(
  maxAttempts = 5,
  delayMs = 3000
): Promise<void> {
  for (let i = 0; i < maxAttempts; i++) {
    await syncSubscriptionStatus();
    if (isSubscribed()) return;
    if (i < maxAttempts - 1) {
      await new Promise(r => setTimeout(r, delayMs));
    }
  }
}
