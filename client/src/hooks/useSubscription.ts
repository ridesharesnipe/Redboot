import { useState, useEffect, useCallback } from 'react';

export interface SubscriptionState {
  isPremium: boolean;
  status: 'none' | 'trialing' | 'active' | 'canceled' | 'past_due';
  currentPeriodEnd: string | null;
  cancelAtPeriodEnd: boolean;
  isLoading: boolean;
  deviceId: string;
}

const CACHE_KEY = 'redboot-subscription-cache';
const DEVICE_ID_KEY = 'redboot-device-id';
const CACHE_TTL_MS = 5 * 60 * 1000; // 5 minutes

function getOrCreateDeviceId(): string {
  let id = localStorage.getItem(DEVICE_ID_KEY);
  if (!id) {
    id = 'rb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 9);
    localStorage.setItem(DEVICE_ID_KEY, id);
  }
  return id;
}

function readCache(): (SubscriptionState & { cachedAt: number }) | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - parsed.cachedAt > CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
}

function writeCache(state: SubscriptionState) {
  try {
    localStorage.setItem(CACHE_KEY, JSON.stringify({ ...state, cachedAt: Date.now() }));
  } catch {}
}

export function useSubscription() {
  const deviceId = getOrCreateDeviceId();

  const cached = readCache();
  const [state, setState] = useState<SubscriptionState>(
    cached ?? {
      isPremium: false,
      status: 'none',
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
      isLoading: true,
      deviceId,
    }
  );

  const refresh = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true }));
    try {
      const res = await fetch(`/api/stripe/subscription-status?deviceId=${encodeURIComponent(deviceId)}`);
      if (!res.ok) throw new Error('Failed to fetch');
      const data = await res.json();
      const newState: SubscriptionState = {
        isPremium: data.isPremium ?? false,
        status: data.status ?? 'none',
        currentPeriodEnd: data.currentPeriodEnd ?? null,
        cancelAtPeriodEnd: data.cancelAtPeriodEnd ?? false,
        isLoading: false,
        deviceId,
      };
      setState(newState);
      writeCache(newState);
    } catch {
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, [deviceId]);

  useEffect(() => {
    if (!cached) {
      refresh();
    } else {
      setState({ ...cached, isLoading: false, deviceId });
    }
  }, []);

  const openPortal = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
    } catch (err) {
      console.error('Failed to open portal:', err);
    }
  }, [deviceId]);

  return { ...state, refresh, openPortal };
}
