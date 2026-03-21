import { useState } from 'react';
import { useLocation } from 'wouter';
import Paywall from './Paywall';

interface SessionStartPaywallProps {
  onDismiss: () => void;
}

function getLastSessionData(): { childName: string; correct: number; total: number } {
  const childName = localStorage.getItem('redboot-child-name') || 'Your child';
  let correct = 0;
  let total = 0;
  try {
    const raw = localStorage.getItem('practiceProgress');
    if (raw) {
      const pp = JSON.parse(raw);
      const history = Array.isArray(pp._practiceHistory) ? pp._practiceHistory : [];
      if (history.length > 0) {
        const correctCount = history.filter((h: any) => h.correct).length;
        correct = correctCount;
        total = history.length;
      }
    }
  } catch { /* empty */ }
  return { childName, correct, total };
}

export default function SessionStartPaywall({ onDismiss }: SessionStartPaywallProps) {
  const [showFullPaywall, setShowFullPaywall] = useState(false);
  const { childName, correct, total } = getLastSessionData();
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const missed = total - correct;
  const [, setLocation] = useLocation();

  if (showFullPaywall) {
    return (
      <Paywall
        correct={correct}
        total={total}
        childName={childName}
        onMaybeLater={onDismiss}
      />
    );
  }

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      background: 'linear-gradient(160deg,#e8f4ff 0%,#fff8f0 50%,#fef3e2 100%)',
      fontFamily: 'system-ui,-apple-system,sans-serif',
      overflowY: 'auto',
    }}>
      <button
        onClick={onDismiss}
        style={{
          position: 'fixed', top: 16, right: 16, zIndex: 10001,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,0.12)', border: 'none',
          fontSize: 18, color: '#64748b', cursor: 'pointer',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}
      >✕</button>

      <div style={{ background: 'linear-gradient(135deg,#1A6BC4 0%,#0E4B8F 100%)', padding: '32px 20px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 40, background: 'linear-gradient(160deg,#e8f4ff 0%,#fff8f0 100%)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
        <div style={{ fontSize: 32, marginBottom: 8 }}>⚓</div>
        <h1 style={{ fontFamily: 'system-ui', fontSize: 22, fontWeight: 700, color: 'white', margin: 0, lineHeight: 1.3 }}>
          {childName} spelled {correct}/{total} words right last time
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 14, marginTop: 8, marginBottom: 0 }}>
          Unlock unlimited practice to be ready for Friday's test
        </p>
      </div>

      <div style={{ padding: '20px 16px', display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          {[
            { bg: 'linear-gradient(145deg,#d4f5e9,#e8fbf3)', value: `${accuracy}%`, label: 'accuracy', color: '#0d7a52' },
            { bg: 'linear-gradient(145deg,#ede9fe,#f3f0ff)', value: `${correct}/${total}`, label: 'correct', color: '#534AB7' },
            { bg: 'linear-gradient(145deg,#fef3c7,#fff8e1)', value: `${missed}`, label: 'need work', color: '#d97706' },
          ].map((s, i) => (
            <div key={i} style={{
              flex: 1, background: s.bg,
              borderRadius: 20, padding: '14px 8px', textAlign: 'center',
              boxShadow: '0 6px 20px rgba(0,0,0,0.07)', border: '2px solid rgba(255,255,255,0.6)',
            }}>
              <div style={{ fontFamily: 'system-ui', fontWeight: 800, fontSize: 26, color: s.color, lineHeight: 1 }}>{s.value}</div>
              <div style={{ fontSize: 10, fontWeight: 700, marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.06em', opacity: 0.7 }}>{s.label}</div>
            </div>
          ))}
        </div>

        <div style={{
          background: 'white', borderRadius: 24,
          boxShadow: '0 8px 32px rgba(0,0,0,0.09)', border: '2px solid rgba(255,255,255,0.7)',
          overflow: 'hidden',
        }}>
          <div style={{ background: 'linear-gradient(135deg,#534AB7 0%,#6366f1 100%)', padding: '18px 18px' }}>
            <h2 style={{ fontFamily: 'system-ui', fontSize: 20, fontWeight: 700, color: 'white', margin: '0 0 4px' }}>
              Ready for Friday's test?
            </h2>
            <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 13, margin: 0 }}>
              Practice every day this week — unlimited sessions, all characters.
            </p>
          </div>
          <div style={{ padding: '18px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 16 }}>
              {[
                'Unlimited practice sessions',
                'Red Boot & Diego the Pup Pup',
                'Friday test simulator',
                'Parent progress reports',
              ].map((f, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, color: '#374151' }}>
                  <div style={{ width: 22, height: 22, borderRadius: '50%', background: '#d1fae5', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <span style={{ fontSize: 11, color: '#059669', fontWeight: 700 }}>✓</span>
                  </div>
                  {f}
                </div>
              ))}
            </div>
            <button
              onClick={() => setShowFullPaywall(true)}
              style={{
                width: '100%', padding: '14px', borderRadius: 16,
                background: 'linear-gradient(135deg,#534AB7,#6366f1)', color: 'white',
                fontFamily: 'system-ui', fontSize: 16, fontWeight: 700,
                border: 'none', cursor: 'pointer',
                boxShadow: '0 6px 20px rgba(83,74,183,0.35)', marginBottom: 10,
              }}
            >
              Unlock unlimited practice — $6.87/mo ⚓
            </button>
            <div style={{ textAlign: 'center', fontSize: 13, color: '#534AB7', fontWeight: 600 }}>
              Or get the yearly plan — just $3.33/mo
            </div>
            <div style={{ textAlign: 'center', marginTop: 12 }}>
              <button onClick={onDismiss} style={{ background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer' }}>
                Continue without practice →
              </button>
            </div>
          </div>
        </div>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8' }}>
          7-day free trial · Cancel anytime · No ads ever
        </div>
        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
