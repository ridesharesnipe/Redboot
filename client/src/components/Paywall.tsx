import { useState } from 'react';
import { createCheckoutSession } from '@/lib/subscription';

interface PaywallProps {
  correct: number;
  total: number;
  childName: string;
  onMaybeLater: () => void;
}

export default function Paywall({ correct, total, childName, onMaybeLater }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [trialOn, setTrialOn] = useState(true);
  const [email, setEmail] = useState(localStorage.getItem('redboot-parent-email') || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const missed = total - correct;

  const annualPrice = trialOn ? '$39.96' : '$35.88';
  const annualMonthly = trialOn ? '$3.33' : '$2.99';
  const monthlyPrice = trialOn ? '$6.87' : '$6.18';
  const ctaText = trialOn ? 'Try free for 7 days' : 'Subscribe now — save 10%';

  const handleSubscribe = async () => {
    if (!email.trim()) {
      setError('Please enter your email to get started.');
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email address.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const url = await createCheckoutSession(selectedPlan, trialOn, 'standard', email.trim());
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
      zIndex: 9998,
      background: 'linear-gradient(160deg,#e8f4ff 0%,#fff8f0 50%,#fef3e2 100%)',
      fontFamily: 'system-ui,-apple-system,sans-serif',
      overflowY: 'auto',
    }}>
      {/* Ocean header */}
      <div style={{ background: 'linear-gradient(135deg,#1A6BC4 0%,#0E4B8F 100%)', padding: '28px 20px 44px', position: 'relative' }}>
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 40, background: 'linear-gradient(160deg,#e8f4ff 0%,#fff8f0 100%)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
        <h1 style={{ fontFamily: 'system-ui', fontSize: 22, fontWeight: 700, color: 'white', margin: '0 0 8px', lineHeight: 1.3 }}>
          {childName} spelled {correct} out of {total} words correctly!
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>
          Unlock unlimited free practice to be ready for Friday's test
        </p>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 14 }}>

        {/* Stats */}
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { bg: 'linear-gradient(145deg,#d4f5e9,#e8fbf3)', value: `${accuracy}%`, label: 'accuracy', color: '#0d7a52' },
            { bg: 'linear-gradient(145deg,#ede9fe,#f3f0ff)', value: `${correct}/${total}`, label: 'correct', color: '#534AB7' },
            { bg: 'linear-gradient(145deg,#fef3c7,#fff8e1)', value: `${missed}`, label: 'need work', color: '#d97706' },
          ].map((s, i) => (
            <div key={i} style={{ flex: 1, background: s.bg, borderRadius: 20, padding: '14px 8px', textAlign: 'center', boxShadow: '0 6px 20px rgba(0,0,0,0.07)', border: '2px solid rgba(255,255,255,0.6)' }}>
              <div style={{ fontWeight: 800, fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{ height: 1, background: 'linear-gradient(90deg,transparent,#cbd5e1,transparent)' }} />

        {/* Zero risk timeline */}
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.09)', border: '2px solid rgba(255,255,255,0.7)', padding: '20px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#1D9E75', letterSpacing: '0.1em', textTransform: 'uppercase' }}>ZERO RISK</div>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: '#1e293b', margin: '6px 0 4px' }}>Try it free. Cancel anytime.</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 18px' }}>Here's exactly what happens when you start your free trial</p>

          <div style={{ position: 'relative', paddingLeft: 36 }}>
            <div style={{ position: 'absolute', left: 15, top: 20, bottom: 20, width: 2, background: '#B5D4F4', borderRadius: 2 }} />
            {[
              { num: '1', color: '#378ADD', bg: '#dbeafe', title: 'Today — Start free', sub: 'Full access to everything. No charge.' },
              { num: '2', color: '#d97706', bg: '#fef3c7', title: 'Day 5 — We\'ll remind you', sub: 'A notification before your trial ends. No surprises.' },
              { num: '3', color: '#1D9E75', bg: '#d1fae5', title: 'Day 7 — You decide', sub: 'Love it? Keep going. Not for you? Cancel with one tap. $0 charged.' },
            ].map((step, i) => (
              <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', marginBottom: i < 2 ? 20 : 0 }}>
                <div style={{ width: 30, height: 30, borderRadius: '50%', background: step.bg, border: `2px solid ${step.color}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, zIndex: 1, marginLeft: -15 }}>
                  <span style={{ fontWeight: 800, fontSize: 14, color: step.color }}>{step.num}</span>
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, color: '#1e293b' }}>{step.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b', marginTop: 2, lineHeight: 1.4 }}>{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing */}
        <div style={{ background: 'white', borderRadius: 24, boxShadow: '0 8px 32px rgba(0,0,0,0.09)', border: '2px solid rgba(255,255,255,0.7)', padding: '20px 18px' }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: '#534AB7', letterSpacing: '0.1em', textTransform: 'uppercase' }}>CHOOSE YOUR PLAN</div>
          <h2 style={{ fontWeight: 700, fontSize: 20, color: '#1e293b', margin: '6px 0 4px' }}>Start free, pay only if you love it</h2>
          <p style={{ fontSize: 13, color: '#64748b', margin: '0 0 14px' }}>7-day free trial on every plan</p>

          {/* Annual plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            style={{
              position: 'relative', padding: '14px 16px', borderRadius: 16, cursor: 'pointer', marginBottom: 10,
              border: selectedPlan === 'annual' ? '2px solid #378ADD' : '1.5px solid #e2e8f0',
              background: selectedPlan === 'annual' ? 'linear-gradient(145deg,#eff8ff,#dbeafe22)' : 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
              boxShadow: selectedPlan === 'annual' ? '0 4px 16px rgba(55,138,221,0.18)' : 'none',
            }}
          >
            <div style={{ position: 'absolute', top: -10, right: 12, background: '#378ADD', color: 'white', fontSize: 11, fontWeight: 700, padding: '2px 10px', borderRadius: 20 }}>Save 52%</div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Yearly</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>{annualMonthly}/month</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#1e293b' }}>{annualPrice}/yr</div>
              {!trialOn && <div style={{ fontSize: 11, color: '#94a3b8', textDecoration: 'line-through' }}>$82.44</div>}
            </div>
          </div>

          {/* Monthly plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            style={{
              padding: '14px 16px', borderRadius: 16, cursor: 'pointer', marginBottom: 14,
              border: selectedPlan === 'monthly' ? '2px solid #534AB7' : '1.5px solid #e2e8f0',
              background: selectedPlan === 'monthly' ? 'linear-gradient(145deg,#f5f3ff,#ede9fe22)' : 'white',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}
          >
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: '#1e293b' }}>Monthly</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Flexible, cancel anytime</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontWeight: 800, fontSize: 22, color: '#1e293b' }}>{monthlyPrice}/mo</div>
            </div>
          </div>

          {/* Trial toggle */}
          <div style={{ background: '#f8fafc', borderRadius: 14, padding: '12px 14px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b' }}>Include 7-day free trial</div>
              <div style={{ fontSize: 11, color: '#64748b', marginTop: 2 }}>{trialOn ? 'Recommended — try before you pay' : 'Skip trial and save 10% today'}</div>
            </div>
            <div
              onClick={() => setTrialOn(t => !t)}
              style={{ width: 46, height: 26, borderRadius: 13, background: trialOn ? '#1D9E75' : '#cbd5e1', cursor: 'pointer', position: 'relative', flexShrink: 0, transition: 'background 0.2s' }}
            >
              <div style={{ position: 'absolute', top: 3, left: trialOn ? 23 : 3, width: 20, height: 20, borderRadius: '50%', background: 'white', boxShadow: '0 2px 4px rgba(0,0,0,0.2)', transition: 'left 0.2s' }} />
            </div>
          </div>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email to get started"
            style={{
              width: '100%', padding: '12px 14px', borderRadius: 12,
              border: '1.5px solid #e2e8f0', fontSize: 14, marginBottom: 12,
              boxSizing: 'border-box', fontFamily: 'inherit', outline: 'none',
            }}
          />

          {error && (
            <div style={{ background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 10, padding: '8px 12px', marginBottom: 10, fontSize: 13, color: '#b91c1c', textAlign: 'center' }}>{error}</div>
          )}

          <button
            onClick={handleSubscribe}
            disabled={loading}
            style={{
              width: '100%', padding: 14, borderRadius: 16,
              background: loading ? '#9ca3af' : 'linear-gradient(135deg,#534AB7,#6366f1)',
              color: 'white', fontFamily: 'system-ui', fontSize: 17, fontWeight: 700,
              border: 'none', cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 6px 20px rgba(83,74,183,0.4)',
            }}
          >
            {loading ? 'Opening checkout…' : ctaText}
          </button>

          <div style={{ textAlign: 'center', fontSize: 11, color: '#94a3b8', marginTop: 10 }}>
            🔒 Secure payment · Cancel anytime · No ads ever
          </div>
          <div style={{ textAlign: 'center', marginTop: 10 }}>
            <button
              onClick={onMaybeLater}
              style={{ background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
            >
              Maybe later
            </button>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
