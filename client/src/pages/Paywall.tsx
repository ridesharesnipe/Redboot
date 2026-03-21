import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSubscription } from '@/hooks/useSubscription';

const PRICES = {
  annual: {
    trial: { id: import.meta.env.VITE_STRIPE_PRICE_ANNUAL || 'price_1TDD7kIKeiiO81plM6B0Qr6E', label: '$39.96/year', monthly: '$3.33/mo', badge: 'Save 52%' },
    noTrial: { id: import.meta.env.VITE_STRIPE_PRICE_ANNUAL_NO_TRIAL || 'price_1TDDfqIKeiiO81plo93fQrL5', label: '$35.88/year', monthly: '$2.99/mo', badge: 'Save 57%' },
  },
  monthly: {
    trial: { id: import.meta.env.VITE_STRIPE_PRICE_MONTHLY || 'price_1TDD7kIKeiiO81pl2nj2Idxz', label: '$6.87/month', monthly: '$6.87/mo', badge: '' },
    noTrial: { id: import.meta.env.VITE_STRIPE_PRICE_MONTHLY_NO_TRIAL || 'price_1TDDfpIKeiiO81plUjII3xIF', label: '$6.18/month', monthly: '$6.18/mo', badge: 'Save 10%' },
  },
};

const FEATURES = [
  { icon: '🐉', text: 'All characters — Diego, Red Boot & more' },
  { icon: '📸', text: 'Photo word list capture from any paper' },
  { icon: '📅', text: 'Unlimited word lists — as many as you need' },
  { icon: '📊', text: 'Parent analytics dashboard' },
  { icon: '⏰', text: 'Friday test simulator with voice' },
  { icon: '🏆', text: 'Full badge & treasure vault' },
];

const clay = {
  card: {
    background: 'white',
    borderRadius: '24px',
    boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)',
    border: '2px solid rgba(255,255,255,0.7)',
  } as React.CSSProperties,
};

export default function Paywall() {
  const [, setLocation] = useLocation();
  const { deviceId } = useSubscription();
  const [plan, setPlan] = useState<'annual' | 'monthly'>('annual');
  const [trialOn, setTrialOn] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const searchParams = new URLSearchParams(window.location.search);
  const from = searchParams.get('from') || 'dashboard';
  const abandoned = searchParams.get('abandoned') === '1';

  const priceObj = PRICES[plan][trialOn ? 'trial' : 'noTrial'];

  const handleSubscribe = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await fetch('/api/stripe/create-checkout-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ deviceId, priceId: priceObj.id, trialEnabled: trialOn }),
      });
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        setError('Could not start checkout. Try again.');
      }
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleDismiss = () => {
    const dest = from === 'practice' ? '/practice' : from === 'test' ? '/test' : from === 'analytics' ? '/analytics' : '/dashboard';
    setLocation(dest);
  };

  return (
    <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', fontFamily: "'Plus Jakarta Sans', sans-serif", overflowY: 'auto', paddingBottom: 40 }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
        <button onClick={handleDismiss} style={{ background: 'none', border: 'none', fontSize: 24, cursor: 'pointer', color: '#94a3b8' }}>✕</button>
        <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 20, color: '#534AB7', letterSpacing: 1 }}>Captain's Upgrade ⚓</div>
        <div style={{ width: 40 }} />
      </div>

      {/* Abandoned offer banner */}
      {abandoned && (
        <div style={{ margin: '0 16px 12px', padding: '12px 16px', background: 'linear-gradient(135deg, #fef08a, #fde68a)', borderRadius: 16, border: '2px solid #f59e0b', textAlign: 'center', fontWeight: 700, fontSize: 14, color: '#92400e' }}>
          🎁 Special offer — get 7 days free before you decide!
        </div>
      )}

      {/* Hero stats row */}
      <div style={{ display: 'flex', gap: 10, padding: '0 16px 16px' }}>
        {[
          { num: '7', label: 'day free\ntrial', bg: 'linear-gradient(145deg, #dbeafe, #bfdbfe)' },
          { num: '52%', label: 'savings\nvs monthly', bg: 'linear-gradient(145deg, #dcfce7, #bbf7d0)' },
          { num: '∞', label: 'word lists\nfor Reggie', bg: 'linear-gradient(145deg, #fef9c3, #fef08a)' },
        ].map((s, i) => (
          <div key={i} style={{ flex: 1, background: s.bg, borderRadius: 18, padding: '14px 8px', textAlign: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.8)', border: '1.5px solid rgba(255,255,255,0.6)' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 28, lineHeight: 1, color: '#1e293b' }}>{s.num}</div>
            <div style={{ fontSize: 11, color: '#475569', marginTop: 4, whiteSpace: 'pre-line', lineHeight: 1.3 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Trial toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 12, padding: '0 16px' }}>
        <span style={{ fontSize: 13, color: '#64748b', fontWeight: 600 }}>Include 7-day free trial</span>
        <button
          onClick={() => setTrialOn(!trialOn)}
          style={{ width: 48, height: 26, borderRadius: 13, border: 'none', cursor: 'pointer', background: trialOn ? '#534AB7' : '#e2e8f0', position: 'relative', transition: 'background 0.2s' }}
        >
          <div style={{ position: 'absolute', top: 3, left: trialOn ? 25 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
        </button>
      </div>

      {/* Plan selector */}
      <div style={{ padding: '0 16px 12px', display: 'flex', flexDirection: 'column', gap: 10 }}>

        {/* Annual plan */}
        <button
          onClick={() => setPlan('annual')}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 20, border: `2.5px solid ${plan === 'annual' ? '#534AB7' : 'rgba(255,255,255,0.5)'}`, background: plan === 'annual' ? 'linear-gradient(145deg, #f0edff, #e8e4ff)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: plan === 'annual' ? '0 6px 20px rgba(83,74,183,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' : '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2.5px solid ${plan === 'annual' ? '#534AB7' : '#cbd5e1'}`, background: plan === 'annual' ? '#534AB7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {plan === 'annual' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Yearly</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{PRICES.annual[trialOn ? 'trial' : 'noTrial'].monthly}/month</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: '#1e293b' }}>{PRICES.annual[trialOn ? 'trial' : 'noTrial'].label}</div>
            <div style={{ fontSize: 11, background: 'linear-gradient(135deg, #f59e0b, #ef4444)', color: 'white', borderRadius: 8, padding: '2px 8px', fontWeight: 700, display: 'inline-block' }}>
              {trialOn ? 'Save 52%' : 'Save 57%'} 🔥
            </div>
          </div>
        </button>

        {/* Monthly plan */}
        <button
          onClick={() => setPlan('monthly')}
          style={{ width: '100%', padding: '14px 16px', borderRadius: 20, border: `2.5px solid ${plan === 'monthly' ? '#534AB7' : 'rgba(255,255,255,0.5)'}`, background: plan === 'monthly' ? 'linear-gradient(145deg, #f0edff, #e8e4ff)' : 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: plan === 'monthly' ? '0 6px 20px rgba(83,74,183,0.2), inset 0 1px 0 rgba(255,255,255,0.9)' : '0 4px 12px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', transition: 'all 0.2s' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2.5px solid ${plan === 'monthly' ? '#534AB7' : '#cbd5e1'}`, background: plan === 'monthly' ? '#534AB7' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {plan === 'monthly' && <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'white' }} />}
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Monthly</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Flexible, cancel anytime</div>
            </div>
          </div>
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: '#1e293b' }}>{PRICES.monthly[trialOn ? 'trial' : 'noTrial'].label}</div>
          </div>
        </button>
      </div>

      {/* Features */}
      <div style={{ ...clay.card, margin: '0 16px 14px', padding: '16px' }}>
        <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 16, color: '#534AB7', marginBottom: 10 }}>What's included ⚓</div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {FEATURES.map((f, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 18, flexShrink: 0 }}>{f.icon}</span>
              <span style={{ fontSize: 13, color: '#374151', fontWeight: 500 }}>{f.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div style={{ padding: '0 16px' }}>
        {error && <div style={{ color: '#ef4444', fontSize: 13, textAlign: 'center', marginBottom: 8 }}>{error}</div>}
        <button
          onClick={handleSubscribe}
          disabled={loading}
          style={{ width: '100%', padding: '16px', borderRadius: 20, background: loading ? '#94a3b8' : 'linear-gradient(135deg, #534AB7, #6366f1)', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 20, border: 'none', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 8px 24px rgba(83,74,183,0.45)', transform: loading ? 'none' : 'translateY(0)', transition: 'all 0.2s', letterSpacing: 0.5 }}
        >
          {loading ? '⚓ Setting sail...' : trialOn ? 'Try free for 7 days ⚓' : `Start for ${priceObj.monthly} ⚓`}
        </button>
        <p style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginTop: 10, lineHeight: 1.5 }}>
          {trialOn ? 'No charge until your trial ends. ' : ''}
          No treasure lost — cancel anytime. 🏴‍☠️
        </p>
        <button onClick={handleDismiss} style={{ width: '100%', background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', padding: '8px 0', textDecoration: 'underline' }}>
          Maybe later, stay free
        </button>
      </div>
    </div>
  );
}
