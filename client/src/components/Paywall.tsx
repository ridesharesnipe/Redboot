import { useState } from 'react';

interface PaywallProps {
  correct: number;
  total: number;
  childName: string;
  onMaybeLater: () => void;
}

export default function Paywall({ correct, total, childName, onMaybeLater }: PaywallProps) {
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'monthly'>('annual');
  const [trialOn, setTrialOn] = useState(true);
  const [email, setEmail] = useState('');

  const accuracy = total > 0 ? Math.round((correct / total) * 100) : 0;
  const missed = total - correct;

  const annualPrice = trialOn ? '$39.99' : '$35.99';
  const monthlyPrice = trialOn ? '$6.99' : '$6.29';
  const annualMonthly = trialOn ? '$3.33' : '$3.00';
  const ctaText = trialOn ? 'Try free for 7 days ⚓' : 'Subscribe now — save 10%';

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', fontFamily: 'inherit' }}>

      {/* Ocean wave header */}
      <div style={{ background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)', padding: '28px 20px 48px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', bottom: -20, left: 0, right: 0, height: 40, background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 100%)', borderRadius: '50% 50% 0 0 / 100% 100% 0 0' }} />
        <div className="text-4xl mb-2">🏴‍☠️</div>
        <h1 className="text-white font-black text-2xl leading-tight mb-2" style={{ fontFamily: "'Fredoka One', 'Nunito', cursive" }}>
          {childName} spelled {correct} out of {total} words correctly!
        </h1>
        <p className="text-white/85 text-sm mt-2">
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

        <div className="h-px" style={{ background: 'linear-gradient(90deg, transparent, #cbd5e1, transparent)' }} />

        {/* Zero risk card */}
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div className="text-xs font-bold text-emerald-600 tracking-widest uppercase mb-1">⚓ ZERO RISK</div>
          <h2 className="font-black text-slate-800 text-xl mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>Try it free. Cancel anytime.</h2>
          <p className="text-slate-500 text-sm mb-5">Here's exactly what happens when you join the crew:</p>

          <div className="relative pl-9">
            <div className="absolute left-4 top-5 bottom-5 w-0.5 rounded" style={{ background: 'linear-gradient(to bottom, #93c5fd, #86efac)' }} />
            {[
              { num: '1', color: '#3b82f6', bg: '#dbeafe', title: 'Today — Start free', sub: 'Full access to all treasure maps. No charge.' },
              { num: '2', color: '#f59e0b', bg: '#fef3c7', title: 'Day 5 — We\'ll remind you', sub: 'Get a notification before your trial ends. No surprises.' },
              { num: '3', color: '#10b981', bg: '#d1fae5', title: 'Day 7 — You decide', sub: 'Love it? Keep going. Not for you? Cancel with one tap. $0 charged.' },
            ].map((step, i) => (
              <div key={i} className={`flex gap-3 items-start ${i < 2 ? 'mb-5' : ''}`}>
                <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 z-10 -ml-4" style={{ background: step.bg, border: `2px solid ${step.color}` }}>
                  <span className="font-black text-sm" style={{ color: step.color, fontFamily: "'Fredoka One', cursive" }}>{step.num}</span>
                </div>
                <div>
                  <div className="font-bold text-sm text-slate-800">{step.title}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{step.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Pricing card */}
        <div className="bg-white rounded-3xl p-5" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div className="text-xs font-bold text-indigo-600 tracking-widest uppercase mb-1">💎 CHOOSE YOUR PLAN</div>
          <h2 className="font-black text-slate-800 text-xl mb-1" style={{ fontFamily: "'Fredoka One', cursive" }}>Start free, pay only if you love it</h2>
          <p className="text-slate-500 text-sm mb-4">7-day free trial on every plan</p>

          {/* Annual plan */}
          <div
            onClick={() => setSelectedPlan('annual')}
            className="relative p-4 rounded-2xl cursor-pointer mb-3 flex justify-between items-center transition-all"
            style={{
              border: selectedPlan === 'annual' ? '2px solid #378ADD' : '1.5px solid #e2e8f0',
              background: selectedPlan === 'annual' ? 'linear-gradient(145deg, #eff8ff, #dbeafe22)' : 'white',
              boxShadow: selectedPlan === 'annual' ? '0 4px 16px rgba(55,138,221,0.2)' : 'none',
            }}
          >
            <div className="absolute -top-2.5 right-3 bg-blue-500 text-white text-xs font-bold px-3 py-0.5 rounded-full">Save 52%</div>
            <div>
              <div className="font-bold text-slate-800">Yearly</div>
              <div className="text-xs text-slate-500">{annualMonthly}/month</div>
            </div>
            <div className="text-right">
              <div className="font-black text-xl text-slate-800" style={{ fontFamily: "'Fredoka One', cursive" }}>{annualPrice}</div>
              {!trialOn && <div className="text-xs text-slate-400 line-through">$39.99</div>}
            </div>
          </div>

          {/* Monthly plan */}
          <div
            onClick={() => setSelectedPlan('monthly')}
            className="p-4 rounded-2xl cursor-pointer mb-4 flex justify-between items-center transition-all"
            style={{
              border: selectedPlan === 'monthly' ? '2px solid #534AB7' : '1.5px solid #e2e8f0',
              background: selectedPlan === 'monthly' ? 'linear-gradient(145deg, #f5f3ff, #ede9fe22)' : 'white',
            }}
          >
            <div>
              <div className="font-bold text-slate-800">Monthly</div>
              <div className="text-xs text-slate-500">Flexible, cancel anytime</div>
            </div>
            <div className="text-right">
              <div className="font-black text-xl text-slate-800" style={{ fontFamily: "'Fredoka One', cursive" }}>{monthlyPrice}</div>
              <div className="text-xs text-slate-400">/month</div>
            </div>
          </div>

          {/* Trial toggle */}
          <div className="flex justify-between items-center p-3 rounded-2xl mb-4" style={{ background: '#f8fafc', border: '1px solid #e2e8f0' }}>
            <div>
              <div className="font-semibold text-sm text-slate-800">Include 7-day free trial</div>
              <div className="text-xs text-slate-500 mt-0.5">
                {trialOn ? 'Recommended — try before you pay' : 'Skip trial and save 10% today'}
              </div>
            </div>
            <div
              onClick={() => setTrialOn(!trialOn)}
              className="cursor-pointer flex-shrink-0 w-12 h-6 rounded-full relative transition-colors"
              style={{ background: trialOn ? '#1D9E75' : '#cbd5e1' }}
            >
              <div className="absolute top-0.5 w-5 h-5 rounded-full bg-white transition-all" style={{ left: trialOn ? '26px' : '2px', boxShadow: '0 2px 4px rgba(0,0,0,0.2)' }} />
            </div>
          </div>

          {/* Email */}
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            placeholder="Enter your email to get started"
            className="w-full px-4 py-3 rounded-xl text-sm mb-3 outline-none"
            style={{ border: '1.5px solid #e2e8f0', fontFamily: 'inherit' }}
          />

          {/* CTA */}
          <button
            className="w-full py-4 rounded-2xl text-white font-black text-lg mb-2 transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
          >
            {ctaText}
          </button>

          <p className="text-center text-xs text-slate-400 mb-3">🔒 Secure payment · Cancel anytime · No ads ever</p>

          <div className="text-center">
            <button onClick={onMaybeLater} className="text-sm text-slate-400 underline">
              Maybe later
            </button>
          </div>
        </div>

        <div className="h-6" />
      </div>
    </div>
  );
}
