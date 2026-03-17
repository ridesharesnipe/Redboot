import { useState, useEffect } from "react";
import charFullBody from "@assets/1049_1773786648286.jpg";
import charBadge from "@assets/17586521525263241886792965623303_1758652161458_1773786814934.png";

const KEYFRAMES = `
@keyframes slideInRight {
  from { transform: translateX(120%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
}
@keyframes slideInLeft {
  from { transform: translateX(-110%); opacity: 0; }
  to   { transform: translateX(0);     opacity: 1; }
}
@keyframes fadeSlideUp {
  from { transform: translateY(40px); opacity: 0; }
  to   { transform: translateY(0);    opacity: 1; }
}
@keyframes moveCenter {
  from { transform: translateX(0); }
  to   { transform: translateX(-10%); }
}
@keyframes spinCompass {
  from { transform: rotate(0deg); }
  to   { transform: rotate(1080deg); }
}
@keyframes wave1 {
  0%   { d: path("M0,60 C200,10 400,100 600,50 C800,0 900,80 1080,40 L1080,200 L0,200 Z"); }
  50%  { d: path("M0,80 C150,30 350,110 600,60 C800,20 950,90 1080,55 L1080,200 L0,200 Z"); }
  100% { d: path("M0,60 C200,10 400,100 600,50 C800,0 900,80 1080,40 L1080,200 L0,200 Z"); }
}
@keyframes wave2 {
  0%   { d: path("M0,80 C250,40 450,110 650,70 C820,30 950,90 1080,60 L1080,200 L0,200 Z"); }
  50%  { d: path("M0,55 C180,20 380,100 620,55 C810,10 940,75 1080,45 L1080,200 L0,200 Z"); }
  100% { d: path("M0,80 C250,40 450,110 650,70 C820,30 950,90 1080,60 L1080,200 L0,200 Z"); }
}
@keyframes wave3 {
  0%   { d: path("M0,100 C300,60 500,130 700,90 C860,50 970,110 1080,80 L1080,200 L0,200 Z"); }
  50%  { d: path("M0,75 C220,40 420,115 680,75 C840,40 960,100 1080,65 L1080,200 L0,200 Z"); }
  100% { d: path("M0,100 C300,60 500,130 700,90 C860,50 970,110 1080,80 L1080,200 L0,200 Z"); }
}
@keyframes twinkle {
  0%, 100% { opacity: 0.3; transform: scale(1); }
  50%       { opacity: 1;   transform: scale(1.4); }
}
@keyframes bobChar {
  0%, 100% { transform: translateY(0px); }
  50%       { transform: translateY(-12px); }
}
`;

const VOICEOVER_SCRIPT = `"Ahoy! I'm Red Boot — and I turn spelling homework into a pirate adventure! Kids hunt treasure, build streaks, and actually want to practice. Spelling scores go up. Homework battles go down. Arrr!"`;

const BENEFITS = [
  { emoji: "🗺️", text: "Word lists become treasure hunts" },
  { emoji: "⭐", text: "Kids actually want to practice daily" },
  { emoji: "📈", text: "Spelling scores go up — guaranteed" },
];

export default function TikTokAd() {
  const [key, setKey] = useState(0);
  const [showScript, setShowScript] = useState(false);

  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = KEYFRAMES;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const animBase = {
    animationFillMode: "both" as const,
    animationTimingFunction: "cubic-bezier(0.34,1.56,0.64,1)",
  };

  return (
    <div style={{
      minHeight: "100vh",
      background: "#0a0a1a",
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      padding: "20px",
      fontFamily: "sans-serif",
    }}>
      <div style={{ display: "flex", gap: 12, marginBottom: 16 }}>
        <button
          onClick={() => setKey(k => k + 1)}
          style={{
            background: "#f59e0b",
            color: "#1a1a1a",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          ▶ Replay Animation
        </button>
        <button
          onClick={() => setShowScript(s => !s)}
          style={{
            background: "#3b82f6",
            color: "#fff",
            border: "none",
            borderRadius: 8,
            padding: "10px 24px",
            fontSize: 15,
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          {showScript ? "Hide" : "Show"} Voiceover Script
        </button>
      </div>

      {showScript && (
        <div style={{
          background: "#1e293b",
          color: "#f8fafc",
          borderRadius: 12,
          padding: "16px 24px",
          marginBottom: 16,
          maxWidth: 420,
          fontSize: 14,
          lineHeight: 1.6,
          border: "1px solid #334155",
        }}>
          <div style={{ fontWeight: 700, color: "#f59e0b", marginBottom: 8 }}>🎙️ ElevenLabs Voiceover Script (8 seconds)</div>
          {VOICEOVER_SCRIPT}
        </div>
      )}

      {/* The 1080×1920 canvas */}
      <div
        key={key}
        style={{
          width: "min(420px, 95vw)",
          aspectRatio: "9 / 16",
          position: "relative",
          overflow: "hidden",
          borderRadius: 24,
          background: "linear-gradient(160deg, #0c4a8c 0%, #1e6fcc 30%, #0e9fd8 60%, #0fc9e8 100%)",
          boxShadow: "0 30px 80px rgba(0,0,0,0.6)",
        }}
      >
        {/* Twinkling stars */}
        {[
          { top: "6%",  left: "12%", delay: "0s",    size: 6  },
          { top: "10%", left: "75%", delay: "0.6s",  size: 8  },
          { top: "3%",  left: "45%", delay: "1.1s",  size: 5  },
          { top: "18%", left: "88%", delay: "0.3s",  size: 7  },
          { top: "22%", left: "5%",  delay: "0.9s",  size: 5  },
          { top: "14%", left: "60%", delay: "1.5s",  size: 9  },
        ].map((s, i) => (
          <div key={i} style={{
            position: "absolute",
            top: s.top,
            left: s.left,
            width: s.size,
            height: s.size,
            borderRadius: "50%",
            background: "#fff",
            animation: `twinkle ${1.4 + i * 0.3}s ease-in-out infinite`,
            animationDelay: s.delay,
          }} />
        ))}

        {/* Decorative circle bubbles */}
        {[
          { top: "5%", right: "8%", size: 60, opacity: 0.08 },
          { top: "30%", left: "3%", size: 40, opacity: 0.06 },
        ].map((b, i) => (
          <div key={i} style={{
            position: "absolute",
            top: b.top,
            ...(b.right ? { right: b.right } : { left: b.left }),
            width: b.size,
            height: b.size,
            borderRadius: "50%",
            background: "rgba(255,255,255," + b.opacity + ")",
            border: "2px solid rgba(255,255,255,0.15)",
          }} />
        ))}

        {/* Hook text — slides in from left at 1s */}
        <div style={{
          position: "absolute",
          top: "6%",
          left: "5%",
          right: "5%",
          zIndex: 10,
          ...animBase,
          animation: "slideInLeft 0.7s cubic-bezier(0.34,1.56,0.64,1) 1s both",
        }}>
          <div style={{
            background: "rgba(255,255,255,0.18)",
            backdropFilter: "blur(8px)",
            borderRadius: 16,
            padding: "14px 18px",
            border: "1.5px solid rgba(255,255,255,0.35)",
          }}>
            <div style={{
              color: "#fff",
              fontSize: "min(5.2vw, 21px)",
              fontWeight: 900,
              lineHeight: 1.25,
              textShadow: "0 2px 12px rgba(0,0,0,0.4)",
              letterSpacing: "-0.3px",
            }}>
              Your kid's spelling homework just got <span style={{ color: "#fbbf24" }}>way more fun</span> 🏴‍☠️
            </div>
          </div>
        </div>

        {/* Full body character — slides in from right at 0.5s, bobs gently */}
        <div style={{
          position: "absolute",
          bottom: "22%",
          right: "2%",
          width: "54%",
          zIndex: 8,
          ...animBase,
          animation: "slideInRight 0.8s cubic-bezier(0.34,1.56,0.64,1) 0.5s both",
        }}>
          <img
            src={charFullBody}
            alt="Red Boot"
            style={{
              width: "100%",
              display: "block",
              filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
              animation: "bobChar 2.8s ease-in-out 1.3s infinite",
            }}
            draggable={false}
          />
        </div>

        {/* Benefit lines — left side, staggered */}
        <div style={{
          position: "absolute",
          bottom: "38%",
          left: "4%",
          width: "50%",
          zIndex: 10,
          display: "flex",
          flexDirection: "column",
          gap: 10,
        }}>
          {BENEFITS.map((b, i) => (
            <div key={i} style={{
              ...animBase,
              animation: `fadeSlideUp 0.5s ease-out ${2 + i * 1.5}s both`,
            }}>
              <div style={{
                background: "rgba(255,255,255,0.92)",
                borderRadius: 50,
                padding: "7px 14px",
                display: "flex",
                alignItems: "center",
                gap: 7,
                boxShadow: "0 4px 16px rgba(0,0,0,0.2)",
              }}>
                <span style={{ fontSize: "min(4vw, 16px)" }}>{b.emoji}</span>
                <span style={{
                  fontSize: "min(3.2vw, 12.5px)",
                  fontWeight: 700,
                  color: "#0c4a8c",
                  lineHeight: 1.2,
                }}>
                  {b.text}
                </span>
              </div>
            </div>
          ))}
        </div>

        {/* Centered badge character + compass — appear at 6.5s */}
        <div style={{
          position: "absolute",
          bottom: "3%",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 12,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: 6,
          ...animBase,
          animation: "fadeSlideUp 0.6s ease-out 6.2s both",
        }}>
          <img
            src={charBadge}
            alt="Red Boot"
            style={{
              width: "min(30vw, 126px)",
              display: "block",
              filter: "drop-shadow(0 6px 18px rgba(0,0,0,0.45))",
            }}
            draggable={false}
          />
          {/* Spinning compass */}
          <div style={{
            fontSize: "min(9vw, 38px)",
            lineHeight: 1,
            ...animBase,
            animation: "spinCompass 1.5s linear 6.8s 2 both",
          }}>
            🧭
          </div>
          <div style={{
            color: "#fff",
            fontSize: "min(3.5vw, 14px)",
            fontWeight: 800,
            letterSpacing: 1,
            textShadow: "0 2px 8px rgba(0,0,0,0.5)",
            textTransform: "uppercase",
            ...animBase,
            animation: "fadeSlideUp 0.5s ease-out 7s both",
          }}>
            Red Boot's Spelling Adventure
          </div>
        </div>

        {/* SVG Wave at bottom */}
        <div style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: "22%",
          zIndex: 5,
        }}>
          <svg
            viewBox="0 0 1080 200"
            preserveAspectRatio="none"
            style={{ width: "100%", height: "100%" }}
          >
            <path
              d="M0,100 C300,60 500,130 700,90 C860,50 970,110 1080,80 L1080,200 L0,200 Z"
              fill="rgba(14,159,216,0.3)"
              style={{ animation: "wave3 4s ease-in-out infinite" }}
            />
            <path
              d="M0,80 C250,40 450,110 650,70 C820,30 950,90 1080,60 L1080,200 L0,200 Z"
              fill="rgba(30,111,204,0.4)"
              style={{ animation: "wave2 3.2s ease-in-out 0.4s infinite" }}
            />
            <path
              d="M0,60 C200,10 400,100 600,50 C800,0 900,80 1080,40 L1080,200 L0,200 Z"
              fill="rgba(12,74,140,0.55)"
              style={{ animation: "wave1 2.6s ease-in-out 0.8s infinite" }}
            />
          </svg>
        </div>

        {/* App name watermark */}
        <div style={{
          position: "absolute",
          top: "2%",
          right: "4%",
          color: "rgba(255,255,255,0.55)",
          fontSize: "min(2.5vw, 10px)",
          fontWeight: 600,
          letterSpacing: 0.5,
          textTransform: "uppercase",
          zIndex: 11,
        }}>
          @redbootspelling
        </div>
      </div>

      <div style={{
        color: "rgba(255,255,255,0.45)",
        fontSize: 12,
        marginTop: 14,
        textAlign: "center",
        maxWidth: 360,
      }}>
        Screen record this page to capture the animation. Add your ElevenLabs voiceover after.
      </div>
    </div>
  );
}
