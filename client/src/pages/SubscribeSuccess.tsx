import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';

export default function SubscribeSuccess() {
  const [, setLocation] = useLocation();
  const { refresh, deviceId } = useSubscription();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sessionId = params.get('session_id');
    const urlDeviceId = params.get('deviceId') || deviceId;

    if (!sessionId) {
      setStatus('error');
      return;
    }

    (async () => {
      try {
        const res = await fetch('/api/stripe/verify-session', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, deviceId: urlDeviceId }),
        });
        const data = await res.json();
        if (data.success) {
          await refresh();
          setStatus('success');
          setTimeout(() => setLocation('/dashboard'), 3000);
        } else {
          setStatus('error');
        }
      } catch {
        setStatus('error');
      }
    })();
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Plus Jakarta Sans', sans-serif", padding: 20 }}>
      <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '2px solid rgba(255,255,255,0.7)', padding: '40px 28px', textAlign: 'center', maxWidth: 360, width: '100%' }}>

        {status === 'verifying' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>⚓</div>
            <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 24, color: '#534AB7', marginBottom: 8 }}>Setting sail...</div>
            <div style={{ fontSize: 14, color: '#64748b' }}>Confirming your subscription</div>
            <div style={{ marginTop: 20, display: 'flex', justifyContent: 'center' }}>
              <div style={{ width: 32, height: 32, borderRadius: '50%', border: '3px solid #534AB7', borderTopColor: 'transparent', animation: 'spin 0.8s linear infinite' }} />
            </div>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🏆</div>
            <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 26, color: '#534AB7', marginBottom: 8 }}>Welcome aboard!</div>
            <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
              Reggie's premium adventure has begun! All characters, unlimited lists, and full analytics are now unlocked.
            </div>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              {['🐉 Diego', '📊 Analytics', '⏰ Test Prep', '🏆 All Badges'].map(t => (
                <span key={t} style={{ background: 'linear-gradient(135deg, #f0edff, #e8e4ff)', borderRadius: 12, padding: '6px 12px', fontSize: 13, color: '#534AB7', fontWeight: 600 }}>{t}</span>
              ))}
            </div>
            <p style={{ fontSize: 12, color: '#94a3b8', marginTop: 16 }}>Taking you back to the adventure...</p>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 56, marginBottom: 16 }}>🗺️</div>
            <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 24, color: '#534AB7', marginBottom: 8 }}>Almost there!</div>
            <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
              Your payment went through but we couldn't confirm yet. Try refreshing — it usually takes a moment.
            </div>
            <button
              onClick={() => setLocation('/dashboard')}
              style={{ width: '100%', padding: '14px', borderRadius: 18, background: 'linear-gradient(135deg, #534AB7, #6366f1)', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
            >
              Back to dashboard ⚓
            </button>
          </>
        )}
      </div>

      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}
