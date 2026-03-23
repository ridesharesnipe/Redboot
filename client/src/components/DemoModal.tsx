import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Upload, FileText, Gamepad2, Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";
import RedBootCharacter from "@/components/RedBootCharacter";
import { useAudio } from "@/contexts/AudioContext";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LETTER_COLORS = ['#EF4444','#F59E0B','#10B981','#3B82F6','#8B5CF6','#EC4899','#EF4444','#F59E0B','#10B981'];

const CARD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #ffffff 0%, #fefefe 50%, #f8fafc 100%)',
  borderRadius: 22,
  padding: 24,
  position: 'relative',
  overflow: 'hidden',
  boxShadow: 'inset 0 -5px 10px rgba(0,0,0,0.05), inset 0 5px 10px rgba(255,255,255,0.9), 0 10px 24px -6px rgba(0,0,0,0.12)',
};

const SAND_CARD_STYLE: React.CSSProperties = {
  background: 'linear-gradient(145deg, #FFF9EE 0%, #FFF4DC 100%)',
  borderRadius: 22,
  padding: 20,
  border: '1.5px solid rgba(244,164,56,0.3)',
  boxShadow: '0 8px 20px -6px rgba(244,164,56,0.2)',
};

const MOCKUP_WRAPPER = (accent: string): React.CSSProperties => ({
  background: `linear-gradient(145deg, ${accent} 0%, #F0F9FF 100%)`,
  borderRadius: 20,
  padding: 20,
  border: '1.5px solid rgba(26,107,196,0.15)',
  boxShadow: '0 8px 24px -6px rgba(26,107,196,0.12)',
});

const demoSteps = [
  {
    id: 1,
    title: "📤 Upload Your Homework",
    subtitle: "Upload a photo of your spelling list",
    description: "Upload a photo or screenshot of your weekly spelling homework and Red Boot's magic text recognition will extract all the words automatically!",
    icon: <Upload className="w-8 h-8 text-white" />,
    iconBg: 'linear-gradient(145deg, #38bdf8 0%, #1A6BC4 100%)',
    mockup: "photo-capture",
    features: ["Smart text recognition", "Multiple word detection", "Instant processing"],
    whyItWorks: [
      "No manual typing — just snap and go!",
      "Works with any homework format",
      "Saves time every single week",
    ],
    quote: "Arrr! Use me magic camera to capture yer homework, matey!",
  },
  {
    id: 2,
    title: "🎯 Words Extracted",
    subtitle: "AI automatically finds your spelling words",
    description: "Our intelligent system scans your homework photo and extracts each spelling word. You can review and edit the list before starting practice.",
    icon: <FileText className="w-8 h-8 text-white" />,
    iconBg: 'linear-gradient(145deg, #34d399 0%, #1D9E75 100%)',
    mockup: "word-extraction",
    features: ["Accurate OCR technology", "Editable word lists", "Smart word detection"],
    whyItWorks: [
      "High-accuracy word detection powered by AI",
      "Handles handwriting and printed text",
      "Edit words if needed",
    ],
    quote: "Shiver me timbers! I can read every word on that there page!",
  },
  {
    id: 3,
    title: "🎮 Practice with Your Hero",
    subtitle: "Memory-based spelling adventures for all",
    description: "Practice each word with Red Boot or Diego's proven memorization system. Study the word, then spell it from memory with helpful feedback and encouragement from your chosen captain!",
    icon: <Gamepad2 className="w-8 h-8 text-white" />,
    iconBg: 'linear-gradient(145deg, #a78bfa 0%, #7c3aed 100%)',
    mockup: "spelling-practice",
    features: ["Spaced repetition learning", "Audio pronunciation", "Red Boot & Diego characters"],
    whyItWorks: [
      "Proven memorization techniques",
      "Focuses on difficult words",
      "Two fun characters keep kids engaged",
    ],
    quote: "Practice makes perfect, ye scallywag! Let's master these words!",
  },
  {
    id: 4,
    title: "🏆 Friday Test Ready",
    subtitle: "Simulate your classroom spelling test",
    description: "Take a practice test just like the real thing! Red Boot will read each word aloud while you write the spelling, preparing you for Friday's test.",
    icon: <Trophy className="w-8 h-8 text-white" />,
    iconBg: 'linear-gradient(145deg, #fbbf24 0%, #d97706 100%)',
    mockup: "friday-test",
    features: ["Realistic test simulation", "Confidence building", "Performance tracking"],
    whyItWorks: [
      "Builds test-taking confidence",
      "Realistic classroom simulation",
      "Parents see progress reports",
    ],
    quote: "Aye! Ye be ready for the Friday test now, brave sailor!",
  },
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { playSound, playCharacterVoice } = useAudio();

  const nextStep = () => {
    playSound('compass_navigation');
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      playSound('ship_bell_success');
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = demoSteps[currentStep];

  const renderMockup = (mockupType: string) => {
    switch (mockupType) {
      case "photo-capture":
        return (
          <div style={MOCKUP_WRAPPER('#EFF9FF')}>
            <div style={{ ...CARD_STYLE, padding: 16, marginBottom: 12 }}>
              <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                height: 160, background: 'linear-gradient(135deg, #E0F2FE, #BAE6FD)',
                borderRadius: 14, border: '2px dashed rgba(26,107,196,0.3)',
              }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 40, marginBottom: 8 }}>📸</div>
                  <p style={{ color: '#1A6BC4', fontWeight: 600, fontFamily: "'Fredoka One', cursive", fontSize: 15 }}>
                    Tap to snap homework photo
                  </p>
                </div>
              </div>
            </div>
            <button
              data-testid="button-demo-upload"
              style={{
                width: '100%', padding: '12px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg, #38bdf8 0%, #1A6BC4 100%)',
                color: 'white', fontWeight: 700, fontSize: 15,
                fontFamily: "'Fredoka One', cursive",
                boxShadow: 'inset 0 -4px 8px rgba(0,0,80,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(26,107,196,0.4)',
              }}
            >
              📤 Upload Spelling List
            </button>
          </div>
        );

      case "word-extraction":
        return (
          <div style={MOCKUP_WRAPPER('#EFFFF9')}>
            <div style={{ ...CARD_STYLE, padding: 16, marginBottom: 12 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: '#1D9E75', fontFamily: "'Fredoka One', cursive", marginBottom: 10 }}>
                ✅ Words Found:
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                {["adventure", "treasure", "captain", "island", "compass"].map((word) => (
                  <div key={word} style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '7px 12px', background: 'linear-gradient(135deg, #ECFDF5, #D1FAE5)',
                    borderRadius: 10, border: '1px solid rgba(29,158,117,0.2)',
                  }}>
                    <span style={{ fontWeight: 600, color: '#065F46', textTransform: 'capitalize' }}>{word}</span>
                    <span style={{
                      fontSize: 11, fontWeight: 700, color: '#1D9E75',
                      background: 'rgba(29,158,117,0.12)', padding: '2px 8px', borderRadius: 20,
                    }}>Detected ✓</span>
                  </div>
                ))}
              </div>
            </div>
            <button
              data-testid="button-demo-practice"
              style={{
                width: '100%', padding: '12px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg, #34d399 0%, #1D9E75 100%)',
                color: 'white', fontWeight: 700, fontSize: 15,
                fontFamily: "'Fredoka One', cursive",
                boxShadow: 'inset 0 -4px 8px rgba(0,60,40,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(29,158,117,0.4)',
              }}
            >
              🎯 Start Practice
            </button>
          </div>
        );

      case "spelling-practice":
        return (
          <div style={MOCKUP_WRAPPER('#F5F0FF')}>
            <div style={{ ...CARD_STYLE, padding: 16, marginBottom: 12 }}>
              <div style={{
                background: 'linear-gradient(135deg, #EDE9FE, #DDD6FE)',
                borderRadius: 14, padding: 16, marginBottom: 12,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 52, height: 52, flexShrink: 0 }}>
                    <RedBootCharacter size="small" expression="thinking" />
                  </div>
                  <div style={{ flex: 1 }}>
                    <p style={{ fontFamily: "'Fredoka One', cursive", color: '#5B21B6', fontSize: 13, margin: 0, marginBottom: 2 }}>
                      Study this word:
                    </p>
                    <p style={{ fontFamily: "'Fredoka One', cursive", color: '#4C1D95', fontSize: 22, fontWeight: 900, margin: 0 }}>
                      TREASURE
                    </p>
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 8, alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 18 }}>🏴‍☠️</span>
                    <span style={{ fontSize: 11, color: '#5B21B6', fontWeight: 600 }}>Red Boot</span>
                  </div>
                  <span style={{ color: '#C4B5FD', fontSize: 12 }}>•</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    <span style={{ fontSize: 18 }}>🐕</span>
                    <span style={{ fontSize: 11, color: '#5B21B6', fontWeight: 600 }}>Diego</span>
                  </div>
                </div>
              </div>
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8 }}>
                {[3, 2, 1].map((n, i) => (
                  <div key={n} style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: i === 0 ? '#1A6BC4' : i === 1 ? '#60A5FA' : '#BFDBFE',
                    color: i === 2 ? '#1E3A8A' : 'white',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontWeight: 800, fontSize: 14,
                  }}>{n}</div>
                ))}
              </div>
            </div>
            <button
              data-testid="button-demo-spell"
              style={{
                width: '100%', padding: '12px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg, #a78bfa 0%, #7c3aed 100%)',
                color: 'white', fontWeight: 700, fontSize: 15,
                fontFamily: "'Fredoka One', cursive",
                boxShadow: 'inset 0 -4px 8px rgba(50,0,100,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(124,58,237,0.4)',
              }}
            >
              ✏️ Now Spell It!
            </button>
          </div>
        );

      case "friday-test":
        return (
          <div style={MOCKUP_WRAPPER('#FFFBEF')}>
            <div style={{ ...CARD_STYLE, padding: 16, marginBottom: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <div style={{ width: 48, height: 48, flexShrink: 0 }}>
                  <RedBootCharacter size="small" expression="celebrating" />
                </div>
                <div>
                  <p style={{ fontFamily: "'Fredoka One', cursive", color: '#92400E', fontSize: 14, fontWeight: 700, margin: 0 }}>
                    Friday Test Simulation
                  </p>
                  <p style={{ color: '#B45309', fontSize: 12, margin: 0 }}>Listen and spell each word</p>
                </div>
              </div>
              <div style={{
                background: 'linear-gradient(135deg, #FEF3C7, #FDE68A)',
                borderRadius: 14, padding: 14, textAlign: 'center',
              }}>
                <p style={{ color: '#92400E', fontWeight: 700, fontSize: 14, marginBottom: 10 }}>
                  🔊 "Spell the word: CAPTAIN"
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 3 }}>
                  {['C','A','P','T','A','I','N'].map((letter, i) => (
                    <span key={i} style={{
                      color: LETTER_COLORS[i % LETTER_COLORS.length],
                      fontSize: 28, fontWeight: 900,
                      fontFamily: "'Fredoka One', cursive",
                      textShadow: '0 2px 4px rgba(0,0,0,0.1)',
                      display: 'inline-block',
                      animation: `demo-letter-bounce 0.6s ease-in-out ${i * 0.07}s infinite alternate`,
                    }}>
                      {letter}
                    </span>
                  ))}
                </div>
              </div>
            </div>
            <button
              data-testid="button-demo-submit"
              style={{
                width: '100%', padding: '12px 0', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg, #fbbf24 0%, #d97706 100%)',
                color: 'white', fontWeight: 700, fontSize: 15,
                fontFamily: "'Fredoka One', cursive",
                boxShadow: 'inset 0 -4px 8px rgba(120,60,0,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(217,119,6,0.4)',
              }}
            >
              🏆 Submit Test
            </button>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <>
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent
        className="max-w-4xl max-h-[90vh] overflow-y-auto p-0"
        style={{ background: 'linear-gradient(180deg, #E0F2FE 0%, #F0F9FF 55%, #FFF8EC 100%)', border: 'none' }}
      >
        {/* Sticky Header */}
        <div style={{
          position: 'sticky', top: 0, zIndex: 10,
          background: 'linear-gradient(180deg, rgba(224,242,254,0.98) 0%, rgba(186,230,255,0.96) 100%)',
          borderBottom: '1.5px solid rgba(26,107,196,0.15)',
          padding: '20px 24px 16px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
            <div>
              <h2
                data-testid="text-demo-title"
                style={{
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 22, fontWeight: 900, color: '#1A6BC4', margin: 0, marginBottom: 2,
                }}
              >
                🧭 How to Play
              </h2>
              <p style={{ color: '#5B8DB8', fontSize: 13, margin: 0 }}>
                Step {currentStep + 1} of {demoSteps.length}: {step.subtitle}
              </p>
            </div>
            <button
              type="button"
              onClick={() => { playSound('anchor_button_click'); onClose(); }}
              data-testid="button-demo-close"
              style={{
                width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                background: 'rgba(26,107,196,0.1)', color: '#1A6BC4', display: 'flex',
                alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Progress Bar */}
          <div style={{ display: 'flex', gap: 6, marginTop: 12 }}>
            {demoSteps.map((_, index) => (
              <div
                key={index}
                style={{
                  flex: 1, height: 6, borderRadius: 3,
                  background: index <= currentStep
                    ? 'linear-gradient(90deg, #38bdf8, #1A6BC4)'
                    : 'rgba(26,107,196,0.12)',
                  transition: 'background 0.3s ease',
                  boxShadow: index <= currentStep ? '0 2px 4px rgba(26,107,196,0.3)' : 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding: '24px 24px 16px' }}>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* LEFT — Info */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>

              {/* Step card */}
              <div style={CARD_STYLE}>
                {/* Icon + title */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: 16, flexShrink: 0,
                    background: step.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.15), inset 0 4px 8px rgba(255,255,255,0.3), 0 6px 12px -4px rgba(0,0,0,0.2)',
                  }}>
                    {step.icon}
                  </div>
                  <div>
                    <h3
                      data-testid="text-demo-step-title"
                      style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: '#1A6BC4', margin: 0, marginBottom: 2 }}
                    >
                      {step.title}
                    </h3>
                    <p style={{ color: '#5B8DB8', fontSize: 13, margin: 0 }}>{step.subtitle}</p>
                  </div>
                </div>

                <p
                  data-testid="text-demo-description"
                  style={{ color: '#374151', fontSize: 15, lineHeight: 1.6, marginBottom: 16 }}
                >
                  {step.description}
                </p>

                <div>
                  <p style={{ fontFamily: "'Fredoka One', cursive", color: '#1A6BC4', fontSize: 14, marginBottom: 8 }}>
                    Key Features:
                  </p>
                  {step.features.map((feature, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                      <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A6BC4', flexShrink: 0 }} />
                      <span style={{ color: '#374151', fontSize: 14 }}>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Red Boot Says */}
              <div style={SAND_CARD_STYLE}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 52, height: 52, flexShrink: 0 }}>
                    <RedBootCharacter size="small" expression="pointing" />
                  </div>
                  <div>
                    <p style={{ fontFamily: "'Fredoka One', cursive", color: '#B45309', fontSize: 14, margin: 0, marginBottom: 4 }}>
                      ⚓ Red Boot Says:
                    </p>
                    <p style={{ color: '#78350F', fontSize: 14, fontStyle: 'italic', margin: 0 }}>
                      "{step.quote}"
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT — Mockup + Why it works */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <p
                  data-testid="text-demo-mockup-title"
                  style={{ fontFamily: "'Fredoka One', cursive", color: '#1A6BC4', fontSize: 15, marginBottom: 10 }}
                >
                  🗺️ Preview:
                </p>
                {renderMockup(step.mockup)}
              </div>

              {/* Why This Works */}
              <div style={SAND_CARD_STYLE}>
                <p style={{ fontFamily: "'Fredoka One', cursive", color: '#B45309', fontSize: 14, marginBottom: 10 }}>
                  💡 Why This Works:
                </p>
                {step.whyItWorks.map((reason, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8, marginBottom: 6 }}>
                    <span style={{ color: '#F4A438', fontSize: 14, flexShrink: 0, marginTop: 1 }}>•</span>
                    <span style={{ color: '#78350F', fontSize: 13 }}>{reason}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Sticky Footer */}
        <div style={{
          position: 'sticky', bottom: 0,
          background: 'linear-gradient(0deg, rgba(224,242,254,0.98) 0%, rgba(186,230,255,0.94) 100%)',
          borderTop: '1.5px solid rgba(26,107,196,0.15)',
          padding: '16px 24px',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>

            {/* Previous */}
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 0}
              data-testid="button-demo-prev"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 50,
                border: '1.5px solid rgba(26,107,196,0.3)',
                background: currentStep === 0 ? 'rgba(26,107,196,0.05)' : 'rgba(255,255,255,0.8)',
                color: currentStep === 0 ? 'rgba(26,107,196,0.35)' : '#1A6BC4',
                fontWeight: 700, fontSize: 14, cursor: currentStep === 0 ? 'not-allowed' : 'pointer',
                fontFamily: "'Fredoka One', cursive",
                boxShadow: currentStep === 0 ? 'none' : '0 4px 12px -4px rgba(26,107,196,0.2)',
              }}
            >
              <ChevronLeft className="w-4 h-4" />
              Previous
            </button>

            {/* CTA */}
            <div style={{ textAlign: 'center' }}>
              <p style={{ fontSize: 12, color: '#5B8DB8', marginBottom: 6 }}>Ready for your adventure?</p>
              <button
                type="button"
                onClick={() => {
                  playSound('cannon_achievement');
                  playCharacterVoice('red_boot_adventure_complete');
                  setTimeout(() => {
                    onClose();
                    window.location.href = "/dashboard";
                  }, 600);
                }}
                data-testid="button-demo-signup"
                className="btn-puffy-start"
                style={{ fontSize: 14, padding: '12px 24px' }}
              >
                🏴‍☠️ Start Free Adventure
              </button>
            </div>

            {/* Next */}
            <button
              type="button"
              onClick={nextStep}
              data-testid="button-demo-next"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '10px 20px', borderRadius: 50, border: 'none', cursor: 'pointer',
                background: 'linear-gradient(145deg, #38bdf8 0%, #1A6BC4 100%)',
                color: 'white', fontWeight: 700, fontSize: 14,
                fontFamily: "'Fredoka One', cursive",
                boxShadow: 'inset 0 -4px 8px rgba(0,0,80,0.2), inset 0 4px 8px rgba(255,255,255,0.3), 0 8px 16px -4px rgba(26,107,196,0.4)',
              }}
            >
              {currentStep === demoSteps.length - 1 ? "Back to Home" : "Next"}
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>

    <style>{`
      @keyframes demo-letter-bounce {
        from { transform: translateY(0px); }
        to   { transform: translateY(-6px); }
      }
    `}</style>
    </>
  );
}
