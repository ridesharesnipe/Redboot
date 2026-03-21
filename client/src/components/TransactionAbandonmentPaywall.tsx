import { useState, useEffect } from 'react';
import { createCheckoutSession } from '@/lib/subscription';

interface TransactionAbandonmentPaywallProps {
  onDismiss: () => void;
}

const EXPIRES_MINUTES = 10;

export default function TransactionAbandonmentPaywall({ onDismiss }: TransactionAbandonmentPaywallProps) {
  const [secondsLeft, setSecondsLeft] = useState(EXPIRES_MINUTES * 60);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const email = localStorage.getItem('redboot-parent-email') || '';

  useEffect(() => {
    if (secondsLeft <= 0) {
      onDismiss();
      return;
    }
    const t = setTimeout(() => setSecondsLeft(s => s - 1), 1000);
    return () => clearTimeout(t);
  }, [secondsLeft, onDismiss]);

  const mins = Math.floor(secondsLeft / 60).toString().padStart(2, '0');
  const secs = (secondsLeft % 60).toString().padStart(2, '0');

  const handleClaim = async () => {
    setLoading(true);
    setError('');
    try {
      const url = await createCheckoutSession('annual', false, 'abandonment', email);
      localStorage.setItem('redboot-checkout-abandoned', 'false');
      window.location.href = url;
    } catch (e: any) {
      setError(e.message || 'Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15,40,80,0.55)',
      backdropFilter: 'blur(4px)',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 340,
        background: 'white',
        borderRadius: 28,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
        border: '2px solid rgba(255,255,255,0.8)',
        overflow: 'hidden',
      }}>
        <div style={{ background: 'linear-gradient(135deg,#0d7a52,#1D9E75)', padding: '24px 20px', textAlign: 'center', position: 'relative' }}>
          <div style={{
            position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)',
            background: '#F4A438', color: 'white', fontWeight: 700, fontSize: 15,
            padding: '5px 18px', borderRadius: '0 0 14px 14px',
            boxShadow: '0 4px 12px rgba(244,164,56,0.4)',
          }}>60% OFF 🎁</div>
          <div style={{ fontSize: 44, marginTop: 18, marginBottom: 8 }}>🎁</div>
          <h2 style={{ fontFamily: 'system-ui,-apple-system,sans-serif', fontSize: 23, fontWeight: 700, color: 'white', margin: '0 0 6px' }}>
            Wait, Captain!
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>A one-time deal, just for you</p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ border: '2px solid #1D9E75', borderRadius: 20, padding: '16px', marginBottom: 14, background: 'linear-gradient(145deg,#f0fdf4,#dcfce7)', textAlign: 'center' }}>
            <div style={{ fontFamily: 'system-ui', fontSize: 38, fontWeight: 800, color: '#0d7a52', lineHeight: 1 }}>$23.88</div>
            <div style={{ fontSize: 13, color: '#0d7a52', fontWeight: 600, marginTop: 4 }}>/year · just $1.99 per month</div>
            <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4 }}>
              <span style={{ textDecoration: 'line-through' }}>$39.96</span> — less than a juice box a month
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              'Full year of unlimited practice',
              'Red Boot & Diego the Pup Pup',
              'Friday test simulator & analytics',
              'Access starts immediately today',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: '#374151' }}>
                <span style={{ fontSize: 14 }}>⚓</span>{f}
              </div>
            ))}
          </div>

          <div style={{ background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '9px 14px', marginBottom: 12, textAlign: 'center' }}>
            <span style={{ fontSize: 13, color: '#c2410c', fontWeight: 700 }}>⏱ This offer expires in {mins}:{secs}</span>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>{error}</div>
          )}

          <button
            onClick={handleClaim}
            disabled={loading}
            style={{
              width: '100%', padding: '14px', borderRadius: 16,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg,#0d7a52,#1D9E75)',
              color: 'white', fontFamily: 'system-ui', fontSize: 17, fontWeight: 700,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(29,158,117,0.35)', marginBottom: 8,
            }}
          >
            {loading ? 'Opening checkout…' : 'Claim this deal — start today ⚓'}
          </button>
          <div style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginBottom: 10 }}>
            No trial needed — pay once, access everything now
          </div>

          <div style={{ textAlign: 'center' }}>
            <button onClick={onDismiss} style={{ background: 'none', border: 'none', fontSize: 12, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}>
              No thanks, I'll pay full price later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
