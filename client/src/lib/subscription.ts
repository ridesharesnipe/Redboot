const SUBSCRIPTION_KEY = 'redboot-subscription';
const DEVICE_ID_KEY = 'redboot-device-id';

export interface Subscription {
  status: 'free' | 'trial' | 'active' | 'cancelled';
  freeSessionUsed: boolean;
  stripeCustomerId: string | null;
  subscriptionId: string | null;
  currentPeriodEnd: string | null;
  plan: 'monthly' | 'annual' | null;
}

const DEFAULT_SUBSCRIPTION: Subscription = {
  status: 'free',
  freeSessionUsed: false,
  stripeCustomerId: null,
  subscriptionId: null,
  currentPeriodEnd: null,
  plan: null,
};

function generateUUID(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

export function getDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = generateUUID();
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

export function getSubscription(): Subscription {
  try {
    const raw = localStorage.getItem(SUBSCRIPTION_KEY);
    if (!raw) return { ...DEFAULT_SUBSCRIPTION };
    return { ...DEFAULT_SUBSCRIPTION, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SUBSCRIPTION };
  }
}

export function saveSubscription(sub: Partial<Subscription>): void {
  const current = getSubscription();
  const updated = { ...current, ...sub };
  localStorage.setItem(SUBSCRIPTION_KEY, JSON.stringify(updated));
}

export function setFreeSessionUsed(): void {
  saveSubscription({ freeSessionUsed: true });
}

export function isSubscribed(): boolean {
  const { status } = getSubscription();
  return status === 'trial' || status === 'active';
}

export function canStartPractice(): boolean {
  const { status, freeSessionUsed } = getSubscription();
  if (status === 'trial' || status === 'active') return true;
  return !freeSessionUsed;
}

export function hasUsedFreeSession(): boolean {
  return getSubscription().freeSessionUsed;
}

export async function syncSubscriptionFromServer(): Promise<void> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch(`/api/subscription-status?deviceId=${deviceId}`);
    if (!res.ok) return;
    const data = await res.json();
    if (data && data.status) {
      saveSubscription(data);
    }
  } catch {
    // Offline — use cached localStorage state
  }
}

export async function createCheckoutSession(params: {
  plan: 'monthly' | 'annual';
  trial: boolean;
  offer?: 'standard' | 'abandonment';
  email: string;
}): Promise<{ url: string } | null> {
  try {
    const deviceId = getDeviceId();
    const res = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...params, deviceId }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch {
    return null;
  }
}

export function markCheckoutStarted(): void {
  localStorage.setItem('redboot-checkout-started', 'true');
}

export function markAbandonmentShown(): void {
  localStorage.setItem('redboot-abandonment-shown', 'true');
  localStorage.removeItem('redboot-checkout-started');
}

export function shouldShowAbandonmentOffer(): boolean {
  const started = localStorage.getItem('redboot-checkout-started') === 'true';
  const alreadyShown = localStorage.getItem('redboot-abandonment-shown') === 'true';
  return started && !alreadyShown && !isSubscribed();
}

export function getLastSessionStartPaywallDate(): string | null {
  return localStorage.getItem('redboot-session-paywall-date');
}

export function markSessionStartPaywallShown(): void {
  localStorage.setItem('redboot-session-paywall-date', new Date().toDateString());
}

export function shouldShowSessionStartPaywall(): boolean {
  if (isSubscribed()) return false;
  if (!hasUsedFreeSession()) return false;
  const lastShown = getLastSessionStartPaywallDate();
  return lastShown !== new Date().toDateString();
}
