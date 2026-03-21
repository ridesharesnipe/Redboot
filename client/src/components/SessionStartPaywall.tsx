import { useState, useEffect } from 'react';

interface SessionStartPaywallProps {
  onDismiss: () => void;
  onSubscribe?: () => void;
}

export default function SessionStartPaywall({ onDismiss, onSubscribe }: SessionStartPaywallProps) {
  const [ready, setReady] = useState(false);

  const childName = localStorage.getItem('redboot-child-name') || 'Your child';

  const savedProgress = (() => {
    try {
      const raw = localStorage.getItem('practiceProgress');
      if (!raw) return null;
      const data = JSON.parse(raw);
      const history: Array<{ correct: boolean }> = data._practiceHistory || [];
      if (history.length === 0) return null;
      const recent = history.slice(-10);
      const correct = recent.filter(h => h.correct).length;
      return { correct, total: recent.length };
    } catch {
      return null;
    }
  })();

  const correct = savedProgress?.correct ?? 7;
  const total = savedProgress?.total ?? 10;
  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 70;
  const missed = total - correct;

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const lastShown = localStorage.getItem('redboot-paywall-last-shown');
    if (lastShown === today) {
      onDismiss();
      return;
    }
    localStorage.setItem('redboot-paywall-last-shown', today);
    setReady(true);
  }, []);

  if (!ready) return null;

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', fontFamily: 'inherit' }}>

      {/* Ocean wave header */}
      <div style={{ background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)', padding: '32px 20px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 40, background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 100%)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />

        {/* X dismiss button */}
        <button
          onClick={onDismiss}
          style={{ position: 'absolute', top: 16, right: 16, color: 'rgba(255,255,255,0.7)', background: 'rgba(255,255,255,0.15)', border: 'none', borderRadius: '50%', width: 32, height: 32, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
          aria-label="Dismiss"
        >
          ×
        </button>

        <div className="text-4xl mb-2">⚓</div>
        <h1 className="text-white font-black text-xl leading-tight mb-2" style={{ fontFamily: "'Fredoka One', 'Nunito', cursive" }}>
          {childName} spelled {correct}/{total} words right last time
        </h1>
        <p className="text-white/85 text-sm">
          Unlock unlimited practice to be ready for Friday's test
        </p>
      </div>

      <div className="p-4 flex flex-col gap-4">

        {/* Stats row */}
        <div className="flex gap-3">
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: '#E1F5EE', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-green-700 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{accuracy}%</div>
            <div className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">accuracy</div>
          </div>
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: '#EEEDFE', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-purple-700 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{correct}/{total}</div>
            <div className="text-xs font-bold text-purple-500 mt-1 uppercase tracking-wide">correct</div>
          </div>
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: '#FEF3C7', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-amber-600 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{missed}</div>
            <div className="text-xs font-bold text-amber-500 mt-1 uppercase tracking-wide">need work</div>
          </div>
        </div>

        {/* Feature list + CTA card */}
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div className="flex flex-col gap-3 mb-5">
            {[
              'Unlimited practice sessions',
              'All pirate characters',
              'Friday test simulator',
              'Parent progress reports',
            ].map((feature, i) => (
              <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs text-emerald-600 font-bold">✓</div>
                {feature}
              </div>
            ))}
          </div>

          <button
            onClick={onSubscribe}
            className="w-full py-4 rounded-2xl text-white font-black text-lg mb-3 transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
          >
            Unlock unlimited practice — $6.87/mo ⚓
          </button>

          <div className="text-center mb-1">
            <button
              onClick={onSubscribe}
              className="text-sm font-semibold"
              style={{ color: '#534AB7' }}
            >
              Or get the yearly plan — just $3.33/mo
            </button>
          </div>
        </div>

        <p className="text-center text-xs text-slate-400">7-day free trial · Cancel anytime · No ads ever</p>

        <div className="h-4" />
      </div>
    </div>
  );
}
