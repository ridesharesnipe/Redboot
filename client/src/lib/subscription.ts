const STORAGE_KEY = 'redboot-subscription';

interface Subscription {
  isPremium: boolean;
  freeSessionUsed: boolean;
  plan: 'free' | 'monthly' | 'annual' | null;
  expiresAt: string | null;
  startedAt: string | null;
}

function defaultSubscription(): Subscription {
  return {
    isPremium: false,
    freeSessionUsed: false,
    plan: null,
    expiresAt: null,
    startedAt: null,
  };
}

export function getSubscription(): Subscription {
  // TESTING BYPASS — remove to re-enable paywall
  return { isPremium: true, freeSessionUsed: false, plan: 'annual', expiresAt: null, startedAt: null };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSubscription();
    const parsed = JSON.parse(raw) as Subscription;
    if (parsed.expiresAt) {
      const expired = new Date(parsed.expiresAt) < new Date();
      if (expired) {
        const reset: Subscription = { ...parsed, isPremium: false, plan: null, expiresAt: null };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(reset));
        return reset;
      }
    }
    return parsed;
  } catch {
    return defaultSubscription();
  }
}

export function setSubscription(update: Partial<Subscription>): void {
  try {
    const current = getSubscription();
    const next = { ...current, ...update };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // ignore
  }
}

export function setFreeSessionUsed(): void {
  setSubscription({ freeSessionUsed: true });
}

export function canAccessFeature(_feature: string): boolean {
  // TESTING BYPASS — remove to re-enable paywall
  return true;
  const sub = getSubscription();
  if (sub.isPremium) return true;

  if (_feature === 'practice') {
    return !sub.freeSessionUsed;
  }
  if (_feature === 'analytics' || _feature === 'friday-test') {
    return false;
  }
  return true;
}

export function activatePremium(plan: 'monthly' | 'annual', trialDays = 0): void {
  const now = new Date();
  let expiresAt: Date;
  if (plan === 'annual') {
    expiresAt = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
  } else {
    expiresAt = new Date(now.getFullYear(), now.getMonth() + 1, now.getDate());
  }
  if (trialDays > 0) {
    expiresAt = new Date(now.getTime() + trialDays * 24 * 60 * 60 * 1000);
  }
  setSubscription({
    isPremium: true,
    plan,
    startedAt: now.toISOString(),
    expiresAt: expiresAt.toISOString(),
  });
}
