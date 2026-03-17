import { useState, useEffect, useCallback } from "react";
import characterFull from "@assets/1049_1773779278256.jpg";
import characterFinal from "@assets/17586521525263241886792965623303_1758652161458_1773779337159.png";

const ANIMATION_DURATION = 8000;

export default function TikTokAd() {
  const [key, setKey] = useState(0);
  const [animating, setAnimating] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setAnimating(false), ANIMATION_DURATION + 200);
    return () => clearTimeout(timer);
  }, [key]);

  const handleReplay = useCallback(() => {
    setAnimating(true);
    setKey((k) => k + 1);
  }, []);

  return (
    <>
      <style>{`
        @keyframes wave {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }

        @keyframes slideInRight {
          0% { transform: translateX(120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes slideInLeft {
          0% { transform: translateX(-120%); opacity: 0; }
          100% { transform: translateX(0); opacity: 1; }
        }

        @keyframes fadeSlideUp {
          0% { opacity: 0; transform: translateY(24px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes spinCompass {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        @keyframes charSlideCenter {
          0% { transform: translateX(0) scale(1); }
          100% { transform: translateX(0) scale(1.05); }
        }

        @keyframes fadeIn {
          0% { opacity: 0; }
          100% { opacity: 1; }
        }

        .anim-char-initial {
          animation: slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both;
        }

        .anim-char-final {
          animation: fadeIn 0.8s ease 6s both;
        }

        .anim-hook {
          animation: slideInLeft 0.6s cubic-bezier(0.22, 1, 0.36, 1) 1s both;
        }

        .anim-benefit-1 {
          animation: fadeSlideUp 0.6s ease 2s both;
        }

        .anim-benefit-2 {
          animation: fadeSlideUp 0.6s ease 3.5s both;
        }

        .anim-benefit-3 {
          animation: fadeSlideUp 0.6s ease 5s both;
        }

        .anim-compass {
          animation: spinCompass 2s linear 6s 3, fadeIn 0.5s ease 6s both;
          opacity: 0;
          animation-fill-mode: both;
        }

        .anim-compass-wrapper {
          animation: fadeIn 0.5s ease 6s both;
        }

        .anim-wave {
          animation: wave 6s linear infinite;
        }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          backgroundColor: "#0a1628",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "16px",
          fontFamily: "'Segoe UI', system-ui, sans-serif",
        }}
      >
        {/* Canvas */}
        <div
          key={key}
          style={{
            width: "min(400px, 100vw - 32px)",
            aspectRatio: "1080 / 1920",
            position: "relative",
            overflow: "hidden",
            background: "linear-gradient(180deg, #0077b6 0%, #023e8a 40%, #03045e 100%)",
            borderRadius: "16px",
            boxShadow: "0 24px 64px rgba(0,0,0,0.6)",
          }}
        >
          {/* Wave SVG at bottom */}
          <div
            style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              height: "22%",
              overflow: "hidden",
              zIndex: 1,
            }}
          >
            <svg
              className="anim-wave"
              viewBox="0 0 1440 200"
              xmlns="http://www.w3.org/2000/svg"
              style={{ width: "200%", height: "100%", display: "block" }}
              preserveAspectRatio="none"
            >
              <path
                d="M0,80 C180,140 360,20 540,80 C720,140 900,20 1080,80 C1260,140 1350,60 1440,80 L1440,200 L0,200 Z"
                fill="rgba(0,180,216,0.5)"
              />
              <path
                d="M0,110 C200,60 400,160 600,110 C800,60 1000,160 1200,110 C1320,80 1380,130 1440,110 L1440,200 L0,200 Z"
                fill="rgba(0,119,182,0.6)"
              />
              <path
                d="M0,140 C240,100 480,180 720,140 C960,100 1200,170 1440,140 L1440,200 L0,200 Z"
                fill="rgba(3,4,94,0.8)"
              />
            </svg>
          </div>

          {/* Stars / bubbles background */}
          {[...Array(18)].map((_, i) => (
            <div
              key={i}
              style={{
                position: "absolute",
                width: i % 3 === 0 ? "6px" : "4px",
                height: i % 3 === 0 ? "6px" : "4px",
                borderRadius: "50%",
                background: "rgba(255,255,255,0.5)",
                top: `${5 + (i * 17) % 55}%`,
                left: `${(i * 13 + 7) % 90}%`,
                zIndex: 0,
              }}
            />
          ))}

          {/* Hook text — slides in from left at ~1s */}
          <div
            className="anim-hook"
            style={{
              position: "absolute",
              top: "6%",
              left: 0,
              right: 0,
              padding: "0 20px",
              zIndex: 10,
              textAlign: "center",
            }}
          >
            <div
              style={{
                background: "rgba(255,200,0,0.92)",
                borderRadius: "12px",
                padding: "12px 16px",
                display: "inline-block",
                maxWidth: "90%",
              }}
            >
              <span
                style={{
                  fontSize: "clamp(14px, 4.5vw, 22px)",
                  fontWeight: 900,
                  color: "#03045e",
                  lineHeight: 1.25,
                  display: "block",
                  textTransform: "uppercase",
                  letterSpacing: "0.02em",
                  textShadow: "0 1px 2px rgba(255,255,255,0.3)",
                }}
              >
                Your kid's spelling homework just got way more fun
              </span>
            </div>
          </div>

          {/* Full-body character — slides in from right at ~0.5s, hidden at 6s */}
          <div
            className="anim-char-initial"
            style={{
              position: "absolute",
              bottom: "18%",
              right: 0,
              left: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 5,
              animation: animating
                ? undefined
                : "none",
            }}
          >
            <img
              src={characterFull}
              alt="Red Boot character celebrating"
              style={{
                width: "65%",
                maxWidth: "260px",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 24px rgba(0,0,0,0.4))",
                animation: `slideInRight 0.7s cubic-bezier(0.22, 1, 0.36, 1) 0.5s both, fadeOut 0.4s ease 5.8s forwards`,
              }}
            />
          </div>

          {/* Final centered character — fades in at ~6s */}
          <div
            className="anim-char-final"
            style={{
              position: "absolute",
              bottom: "18%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 6,
              pointerEvents: "none",
            }}
          >
            <img
              src={characterFinal}
              alt="Red Boot character pointing"
              style={{
                width: "62%",
                maxWidth: "250px",
                objectFit: "contain",
                filter: "drop-shadow(0 8px 32px rgba(0,0,0,0.5))",
              }}
            />
          </div>

          {/* Benefits text */}
          <div
            style={{
              position: "absolute",
              bottom: "12%",
              left: 0,
              right: 0,
              zIndex: 12,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: "6px",
              padding: "0 16px",
            }}
          >
            <BenefitBadge className="anim-benefit-1" icon="🏴‍☠️">
              Turn weekly word lists into pirate adventures
            </BenefitBadge>
            <BenefitBadge className="anim-benefit-2" icon="⭐">
              Kids build real spelling confidence — word by word
            </BenefitBadge>
            <BenefitBadge className="anim-benefit-3" icon="🧭">
              Red Boot adapts to your child's pace, every week
            </BenefitBadge>
          </div>

          {/* Compass spinner at ~6s */}
          <div
            className="anim-compass-wrapper"
            style={{
              position: "absolute",
              bottom: "4%",
              left: 0,
              right: 0,
              display: "flex",
              justifyContent: "center",
              zIndex: 13,
            }}
          >
            <span
              className="anim-compass"
              style={{
                fontSize: "clamp(24px, 7vw, 40px)",
                display: "inline-block",
              }}
            >
              🧭
            </span>
          </div>

          {/* Fade-out overlay for first character */}
          <style>{`
            @keyframes fadeOut {
              0% { opacity: 1; }
              100% { opacity: 0; }
            }
          `}</style>
        </div>

        {/* Replay button below canvas */}
        <button
          onClick={handleReplay}
          style={{
            marginTop: "24px",
            padding: "12px 36px",
            background: "linear-gradient(135deg, #0077b6, #023e8a)",
            color: "#fff",
            border: "none",
            borderRadius: "50px",
            fontSize: "16px",
            fontWeight: 700,
            cursor: "pointer",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 20px rgba(0,119,182,0.5)",
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          onMouseOver={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1.05)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 6px 28px rgba(0,119,182,0.7)";
          }}
          onMouseOut={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = "scale(1)";
            (e.currentTarget as HTMLButtonElement).style.boxShadow = "0 4px 20px rgba(0,119,182,0.5)";
          }}
        >
          ↺ Replay
        </button>
      </div>
    </>
  );
}

function BenefitBadge({
  children,
  icon,
  className,
}: {
  children: string;
  icon: string;
  className?: string;
}) {
  return (
    <div
      className={className}
      style={{
        background: "rgba(255,255,255,0.15)",
        backdropFilter: "blur(8px)",
        border: "1px solid rgba(255,255,255,0.25)",
        borderRadius: "10px",
        padding: "7px 12px",
        display: "flex",
        alignItems: "center",
        gap: "8px",
        maxWidth: "90%",
        width: "100%",
      }}
    >
      <span style={{ fontSize: "clamp(14px, 4vw, 20px)", flexShrink: 0 }}>{icon}</span>
      <span
        style={{
          color: "#fff",
          fontSize: "clamp(10px, 3vw, 15px)",
          fontWeight: 600,
          lineHeight: 1.3,
          textShadow: "0 1px 4px rgba(0,0,0,0.4)",
        }}
      >
        {children}
      </span>
    </div>
  );
}
