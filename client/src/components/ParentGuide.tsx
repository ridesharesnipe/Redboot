import { ArrowLeft, Upload, Compass, Crown, Skull, MapPin, Clock, Star, CheckCircle, AlertCircle } from 'lucide-react';

interface ParentGuideProps {
  onBack: () => void;
}

export default function ParentGuide({ onBack }: ParentGuideProps) {
  return (
    <div className="max-w-2xl mx-auto space-y-4 pb-8">

      {/* Header */}
      <div className="clay-card overflow-hidden p-0">
        <div style={{ background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)', padding: '24px 20px' }}>
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="text-3xl mb-2">🏴‍☠️</div>
              <h1 className="text-white font-black text-2xl leading-tight" style={{ fontFamily: 'var(--font-pirate)' }}>
                Parent's Guide
              </h1>
              <p className="text-white/80 text-sm mt-1">Everything you need for a successful spelling voyage</p>
            </div>
            <button
              onClick={onBack}
              className="clay-button flex items-center gap-2 text-sm px-4 py-2 bg-white/20 text-white border-white/30 flex-shrink-0"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4" />
              Back
            </button>
          </div>
        </div>
      </div>

      {/* Weekly overview */}
      <div className="clay-card p-5">
        <h2 className="font-black text-slate-800 text-lg mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
          🗓️ Your Weekly Routine
        </h2>
        <div className="grid grid-cols-5 gap-2 text-center">
          {[
            { day: 'Mon', icon: <Upload className="w-5 h-5" />, label: 'Upload list', color: '#1A6BC4', bg: '#dbeafe' },
            { day: 'Tue', icon: <Compass className="w-5 h-5" />, label: 'Practice', color: '#d97706', bg: '#fef3c7' },
            { day: 'Wed', icon: <Compass className="w-5 h-5" />, label: 'Practice', color: '#d97706', bg: '#fef3c7' },
            { day: 'Thu', icon: <Star className="w-5 h-5" />, label: 'Practice', color: '#7c3aed', bg: '#ede9fe' },
            { day: 'Fri', icon: <Crown className="w-5 h-5" />, label: 'Take test', color: '#dc2626', bg: '#fee2e2' },
          ].map((item, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: item.bg, color: item.color }}>
                {item.icon}
              </div>
              <div className="font-bold text-xs text-slate-700">{item.day}</div>
              <div className="text-xs text-slate-500 leading-tight">{item.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 1 — Upload */}
      <div className="clay-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: '#1A6BC4' }}>1</div>
          <h2 className="font-black text-slate-800 text-base" style={{ fontFamily: 'var(--font-pirate)' }}>📸 Upload your child's spelling list</h2>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <Upload className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">Tap "Chart New Waters" on the dashboard</div>
              <div className="text-sm text-slate-600 mt-0.5">Use your phone camera to take a clear photo of the weekly spelling list.</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <CheckCircle className="w-5 h-5 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">Review and save</div>
              <div className="text-sm text-slate-600 mt-0.5">The app reads the words from the photo automatically. Check them, edit any that weren't recognised, then save.</div>
            </div>
          </div>
          <div className="rounded-2xl p-3 flex gap-3" style={{ background: '#eff8ff', border: '1px solid #bfdbfe' }}>
            <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">Good lighting and a flat list give the best results. Works with both printed and handwritten lists.</p>
          </div>
        </div>
      </div>

      {/* Step 2 — Practice */}
      <div className="clay-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: '#d97706' }}>2</div>
          <h2 className="font-black text-slate-800 text-base" style={{ fontFamily: 'var(--font-pirate)' }}>⚓ Daily practice sessions</h2>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <Compass className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">Tap "Daily Adventure" on the dashboard</div>
              <div className="text-sm text-slate-600 mt-0.5">The app speaks each word aloud. Your child types the spelling and gets instant feedback with sounds and encouragement.</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Star className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">Tricky words come back</div>
              <div className="text-sm text-slate-600 mt-0.5">Any word missed during a session is automatically brought back at the start of the next session for extra practice.</div>
            </div>
          </div>
          <div className="rounded-2xl p-3 flex gap-3" style={{ background: '#fffbeb', border: '1px solid #fde68a' }}>
            <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-amber-700">Each session takes about 10–15 minutes. Your child can practice as many times as they like each day.</p>
          </div>
        </div>
      </div>

      {/* Word status legend */}
      <div className="clay-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: '#059669' }}>3</div>
          <h2 className="font-black text-slate-800 text-base" style={{ fontFamily: 'var(--font-pirate)' }}>🗺️ Understanding progress</h2>
        </div>
        <div className="grid grid-cols-1 gap-3">
          {[
            { icon: <MapPin className="w-5 h-5 text-white" />, bg: '#64748b', title: 'Uncharted Waters', desc: 'Words that haven\'t been practised yet.' },
            { icon: <Compass className="w-5 h-5 text-white" />, bg: '#d97706', title: 'Setting Sail', desc: 'Words in progress — getting some right but needs more practice.' },
            { icon: <Crown className="w-5 h-5 text-white" />, bg: '#059669', title: 'Treasure Found', desc: 'Words your child spells correctly every time.' },
            { icon: <Skull className="w-5 h-5 text-white" />, bg: '#dc2626', title: 'Stormy Seas', desc: 'Words that were missed — these come back in the next session.' },
          ].map((item, i) => (
            <div key={i} className="flex gap-3 items-start">
              <div className="w-9 h-9 rounded-2xl flex items-center justify-center flex-shrink-0" style={{ background: item.bg }}>
                {item.icon}
              </div>
              <div>
                <div className="font-bold text-sm text-slate-800">{item.title}</div>
                <div className="text-sm text-slate-500 mt-0.5">{item.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Step 4 — Friday test */}
      <div className="clay-card p-5">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-8 h-8 rounded-full flex items-center justify-center text-white font-black text-sm flex-shrink-0" style={{ background: '#dc2626' }}>4</div>
          <h2 className="font-black text-slate-800 text-base" style={{ fontFamily: 'var(--font-pirate)' }}>👑 Friday treasure test</h2>
        </div>
        <div className="space-y-3">
          <div className="flex gap-3 items-start">
            <Crown className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">Tap "Final Treasure Hunt" when ready</div>
              <div className="text-sm text-slate-600 mt-0.5">The test speaks each word aloud. Your child types it and moves on — no going back, just like a real school test.</div>
            </div>
          </div>
          <div className="flex gap-3 items-start">
            <Star className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div>
              <div className="font-bold text-sm text-slate-800">After the test</div>
              <div className="text-sm text-slate-600 mt-0.5">You'll see the score, which words were correct, and which ones need more work next week.</div>
            </div>
          </div>
          <div className="rounded-2xl p-3 flex gap-3" style={{ background: '#fff1f2', border: '1px solid #fecdd3' }}>
            <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-red-700">Make sure your child is in a quiet spot with no distractions — treat it like the real thing.</p>
          </div>
        </div>
      </div>

      {/* Troubleshooting */}
      <div className="clay-card p-5">
        <h2 className="font-black text-slate-800 text-base mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>🛠️ Troubleshooting</h2>
        <div className="space-y-4">
          <div>
            <div className="font-bold text-sm text-slate-800 mb-1">Camera not working?</div>
            <div className="text-sm text-slate-600">Make sure your browser has camera permission enabled. You can also use the "Upload Image" button to pick a photo from your camera roll instead.</div>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <div className="font-bold text-sm text-slate-800 mb-1">Words extracted incorrectly?</div>
            <div className="text-sm text-slate-600">You can edit any word on the review screen before saving. Better lighting and a flatter list improve accuracy.</div>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <div className="font-bold text-sm text-slate-800 mb-1">Child is struggling with certain words?</div>
            <div className="text-sm text-slate-600">Missed words automatically appear again at the next session — no extra setup needed. More daily practice is the best remedy.</div>
          </div>
          <div className="h-px bg-slate-100" />
          <div>
            <div className="font-bold text-sm text-slate-800 mb-1">Ready to start a new week?</div>
            <div className="text-sm text-slate-600">When a new week begins, your dashboard will prompt you to upload a fresh spelling list. Previous treasure coins and badges are kept.</div>
          </div>
        </div>
      </div>

      {/* Back button */}
      <div className="text-center pt-2">
        <button
          onClick={onBack}
          className="clay-button clay-button-primary px-8 py-3 flex items-center gap-2 mx-auto"
          data-testid="button-back-to-dashboard-bottom"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to dashboard
        </button>
      </div>

    </div>
  );
}
