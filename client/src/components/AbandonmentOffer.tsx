import { useState, useEffect } from 'react';

interface AbandonmentOfferProps {
  onDismiss: () => void;
}

export default function AbandonmentOffer({ onDismiss }: AbandonmentOfferProps) {
  const [timeLeft, setTimeLeft] = useState(10 * 60); // 10 minutes in seconds
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) {
      localStorage.removeItem('redboot-stripe-abandoned');
      onDismiss();
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          localStorage.removeItem('redboot-stripe-abandoned');
          onDismiss();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const minutes = String(Math.floor(timeLeft / 60)).padStart(2, '0');
  const seconds = String(timeLeft % 60).padStart(2, '0');

  const handleClaim = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'abandonment', includeTrial: false }),
      });
      const data = await response.json();
      if (data.url) {
        localStorage.removeItem('redboot-stripe-abandoned');
        window.location.href = data.url;
      } else {
        setIsLoading(false);
      }
    } catch {
      setIsLoading(false);
    }
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '24px 16px', background: 'rgba(15,40,80,0.55)', backdropFilter: 'blur(6px)' }}>
      <div style={{ width: '100%', maxWidth: 340, background: 'white', borderRadius: 28, boxShadow: '0 24px 64px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.8)', overflow: 'hidden' }}>

        {/* Header */}
        <div style={{ background: 'linear-gradient(135deg, #0d7a52, #1D9E75)', padding: '28px 20px 24px', textAlign: 'center', position: 'relative' }}>
          <div style={{ position: 'absolute', top: -1, left: '50%', transform: 'translateX(-50%)', background: '#F4A438', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 15, padding: '6px 20px', borderRadius: '0 0 16px 16px', boxShadow: '0 4px 12px rgba(244,164,56,0.4)' }}>
            ONE-TIME DEAL 🎁
          </div>
          <div style={{ fontSize: 44, marginTop: 18, marginBottom: 8 }}>🏴‍☠️</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 26, color: 'white', margin: '0 0 6px' }}>Wait, Captain!</h2>
          <p style={{ color: 'rgba(255,255,255,0.9)', fontSize: 14, margin: 0 }}>A one-time deal, just for you</p>
        </div>

        <div style={{ padding: '20px 20px 24px' }}>

          {/* Price block */}
          <div style={{ border: '2px solid #1D9E75', borderRadius: 20, padding: '16px', marginBottom: 16, background: 'linear-gradient(145deg, #f0fdf4, #dcfce7)', textAlign: 'center' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 44, color: '#0d7a52', lineHeight: 1 }}>$23.88</div>
            <div style={{ fontSize: 14, color: '#0d7a52', fontWeight: 600, marginTop: 4 }}>/year · $1.99 per month</div>
          </div>

          {/* Feature checkmarks */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 18 }}>
            {[
              'Full year unlimited practice',
              'All characters + sea monster battles',
              'Friday test simulator & analytics',
              'Access starts immediately today',
            ].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#16a34a', fontWeight: 700, fontSize: 12 }}>✓</div>
                {f}
              </div>
            ))}
          </div>

          {/* Countdown */}
          <div style={{ textAlign: 'center', marginBottom: 16, padding: '10px', background: '#fef3c7', borderRadius: 14, border: '1px solid #fde68a' }}>
            <div style={{ fontSize: 12, color: '#92400e', marginBottom: 4 }}>This offer expires in</div>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, color: '#b45309', letterSpacing: 2 }}>{minutes}:{seconds}</div>
          </div>

          {/* CTA */}
          <button
            onClick={handleClaim}
            disabled={isLoading}
            style={{ width: '100%', padding: '16px', borderRadius: 18, border: 'none', background: 'linear-gradient(135deg, #0d7a52, #1D9E75)', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18, cursor: 'pointer', boxShadow: '0 6px 20px rgba(29,158,117,0.4)', marginBottom: 8, opacity: isLoading ? 0.7 : 1 }}
          >
            {isLoading ? 'Redirecting...' : 'Claim this deal — start today'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#6b7280', marginBottom: 12 }}>
            No trial needed — pay once, access everything now
          </p>

          <div style={{ textAlign: 'center' }}>
            <button
              onClick={() => {
                localStorage.removeItem('redboot-stripe-abandoned');
                onDismiss();
              }}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#9ca3af', textDecoration: 'underline', cursor: 'pointer' }}
            >
              No thanks, I'll pay full price later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
