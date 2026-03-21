interface SessionStartPaywallProps {
  onDismiss: () => void;
}

export default function SessionStartPaywall({ onDismiss }: SessionStartPaywallProps) {
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

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', fontFamily: 'inherit' }}>

      {/* Ocean wave header */}
      <div style={{ background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)', padding: '32px 20px 52px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 40, background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 100%)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
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
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: 'linear-gradient(145deg, #d4f5e9, #e8fbf3)', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-green-700 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{accuracy}%</div>
            <div className="text-xs font-bold text-green-600 mt-1 uppercase tracking-wide">accuracy</div>
          </div>
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: 'linear-gradient(145deg, #ede9fe, #f3f0ff)', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-purple-700 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{correct}/{total}</div>
            <div className="text-xs font-bold text-purple-500 mt-1 uppercase tracking-wide">correct</div>
          </div>
          <div className="flex-1 text-center py-4 px-2 rounded-[20px]" style={{ background: 'linear-gradient(145deg, #fef3c7, #fff8e1)', boxShadow: '0 6px 20px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.8)', border: '2px solid rgba(255,255,255,0.6)' }}>
            <div className="font-black text-3xl text-amber-600 leading-none" style={{ fontFamily: "'Fredoka One', cursive" }}>{missed}</div>
            <div className="text-xs font-bold text-amber-500 mt-1 uppercase tracking-wide">need work</div>
          </div>
        </div>

        {/* Main CTA card */}
        <div className="rounded-3xl overflow-hidden" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div style={{ background: 'linear-gradient(135deg, #534AB7 0%, #6366f1 100%)', padding: '20px 18px' }}>
            <div className="text-4xl mb-2">🏴‍☠️</div>
            <h2 className="text-white font-black text-xl mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Ready for Friday's test?
            </h2>
            <p className="text-white/85 text-sm">
              Practice every day this week with the full crew — unlimited sessions, all characters.
            </p>
          </div>

          <div className="bg-white p-5">
            <div className="flex flex-col gap-3 mb-5">
              {[
                'Unlimited practice sessions',
                'All 4 pirate characters',
                'Friday test simulator',
                'Parent progress reports',
              ].map((feature, i) => (
                <div key={i} className="flex items-center gap-3 text-sm text-slate-700">
                  <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0 text-xs">✓</div>
                  {feature}
                </div>
              ))}
            </div>

            <button
              className="w-full py-4 rounded-2xl text-white font-black text-lg mb-3 transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
            >
              Unlock unlimited practice — $6.99/mo ⚓
            </button>

            <div className="text-center">
              <button onClick={onDismiss} className="text-sm text-slate-400">
                Continue without practice →
              </button>
            </div>
          </div>
        </div>

        {/* Trust note */}
        <p className="text-center text-xs text-slate-400">7-day free trial · Cancel anytime · No ads ever</p>

        <div className="h-4" />
      </div>
    </div>
  );
}
