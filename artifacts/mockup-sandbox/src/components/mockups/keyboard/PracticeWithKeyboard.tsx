import { useState } from "react";

const QWERTY_ROWS = [
  ["Q","W","E","R","T","Y","U","I","O","P"],
  ["A","S","D","F","G","H","J","K","L"],
  ["Z","X","C","V","B","N","M"],
];

const LETTER_COLORS = ["#EF4444","#F59E0B","#10B981","#3B82F6","#8B5CF6","#EC4899"];

export function PracticeWithKeyboard() {
  const [typed, setTyped] = useState("CA");

  function handleKey(k: string) {
    if (k === "BACKSPACE") setTyped(t => t.slice(0, -1));
    else if (k !== "SUBMIT") setTyped(t => (t + k).slice(0, 12));
  }

  return (
    <div style={{
      width: 375,
      height: 812,
      margin: "0 auto",
      background: "linear-gradient(160deg, #dbeafe 0%, #e0f2fe 40%, #fef9ee 100%)",
      fontFamily: "'Plus Jakarta Sans', sans-serif",
      position: "relative",
      overflow: "hidden",
      display: "flex",
      flexDirection: "column",
      borderRadius: 0,
    }}>

      {/* ── HEADER ── */}
      <div style={{
        background: "linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)",
        padding: "14px 16px 12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            width: 38, height: 38, borderRadius: "50%",
            background: "rgba(255,255,255,0.15)",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 20,
          }}>⚓</div>
          <div>
            <div style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 16, lineHeight: 1 }}>
              Red Boot's Quest
            </div>
            <div style={{ color: "rgba(255,255,255,0.7)", fontSize: 11 }}>Word 3 of 10</div>
          </div>
        </div>
        {/* Progress dots */}
        <div style={{ display: "flex", gap: 4 }}>
          {[1,2,3,4,5,6,7,8,9,10].map(i => (
            <div key={i} style={{
              width: 8, height: 8, borderRadius: "50%",
              background: i <= 2 ? "#F4A438" : "rgba(255,255,255,0.25)",
            }}/>
          ))}
        </div>
      </div>

      {/* ── MAIN SCROLL AREA ── */}
      <div style={{ flex: 1, display: "flex", flexDirection: "column", padding: "12px 16px 0", gap: 10, overflow: "hidden" }}>

        {/* Character + speech bubble */}
        <div style={{ display: "flex", alignItems: "flex-end", gap: 10, flexShrink: 0 }}>
          <div style={{
            width: 64, height: 64, borderRadius: "50%",
            background: "linear-gradient(145deg, #fff, #e0f2fe)",
            border: "3px solid #7EC8E3",
            display: "flex", alignItems: "center", justifyContent: "center",
            fontSize: 36,
            boxShadow: "0 4px 16px rgba(126,200,227,0.3)",
            flexShrink: 0,
          }}>🏴‍☠️</div>
          <div style={{
            background: "white",
            borderRadius: "18px 18px 18px 4px",
            padding: "10px 14px",
            boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
            border: "1.5px solid rgba(126,200,227,0.3)",
            flex: 1,
          }}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 13, color: "#1A6BC4", marginBottom: 2 }}>
              Captain Red Boot says:
            </div>
            <div style={{ fontSize: 14, color: "#F4A438", fontWeight: 700 }}>
              "Type the magic word!"
            </div>
          </div>
        </div>

        {/* LISTEN & SPELL badge */}
        <div style={{
          background: "linear-gradient(135deg, #1A6BC4, #7EC8E3)",
          borderRadius: 50,
          padding: "7px 20px",
          textAlign: "center",
          alignSelf: "center",
          flexShrink: 0,
          boxShadow: "0 4px 14px rgba(26,107,196,0.3)",
        }}>
          <span style={{ fontFamily: "'Fredoka One', cursive", color: "white", fontSize: 14, letterSpacing: 1 }}>
            🎧 LISTEN &amp; SPELL
          </span>
        </div>

        {/* Colorful letter display */}
        <div style={{
          background: "white",
          borderRadius: 22,
          padding: "18px 16px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: 80,
          boxShadow: "0 6px 24px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)",
          border: "2px solid rgba(126,200,227,0.25)",
          flexShrink: 0,
          position: "relative",
        }}>
          {typed ? (
            <div style={{ display: "flex", gap: 4 }}>
              {typed.split("").map((ch, i) => (
                <span key={i} style={{
                  fontSize: 42,
                  fontWeight: 900,
                  color: LETTER_COLORS[i % LETTER_COLORS.length],
                  letterSpacing: 2,
                  textShadow: `0 3px 0 ${LETTER_COLORS[i % LETTER_COLORS.length]}55`,
                  fontFamily: "'Fredoka One', cursive",
                }}>{ch}</span>
              ))}
              {/* Blinking cursor */}
              <span style={{
                fontSize: 42, fontWeight: 900, color: "#94a3b8",
                fontFamily: "'Fredoka One', cursive",
                animation: "blink 1s step-end infinite",
              }}>_</span>
            </div>
          ) : (
            <span style={{ color: "#94a3b8", fontSize: 16, fontStyle: "italic" }}>
              Tap a letter to begin…
            </span>
          )}
        </div>

        {/* Hint text */}
        <div style={{ textAlign: "center", color: "#64748b", fontSize: 12, flexShrink: 0 }}>
          💡 Tap the 🔊 button to hear the word again
        </div>

        {/* Re-listen button */}
        <div style={{ display: "flex", justifyContent: "center", flexShrink: 0 }}>
          <button style={{
            background: "linear-gradient(135deg, #F4A438, #f59e0b)",
            borderRadius: 50,
            padding: "10px 28px",
            border: "none",
            color: "white",
            fontFamily: "'Fredoka One', cursive",
            fontSize: 15,
            boxShadow: "0 4px 16px rgba(244,164,56,0.4), 0 2px 0 rgba(0,0,0,0.15)",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 8,
          }}>
            🔊 Hear it again
          </button>
        </div>
      </div>

      {/* ── VIRTUAL KEYBOARD — slides up from bottom ── */}
      <div style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        background: "linear-gradient(180deg, rgba(224,242,254,0.95) 0%, rgba(186,230,255,0.98) 100%)",
        backdropFilter: "blur(16px)",
        borderTop: "1.5px solid rgba(126,200,227,0.5)",
        borderRadius: "22px 22px 0 0",
        padding: "14px 10px 18px",
        boxShadow: "0 -8px 32px rgba(26,107,196,0.15)",
        transform: "translateY(0)",
        transition: "transform 300ms ease-out",
      }}>

        {/* Drag handle */}
        <div style={{
          width: 36, height: 4, borderRadius: 2,
          background: "rgba(26,107,196,0.25)",
          margin: "0 auto 12px",
        }}/>

        {/* QWERTY rows — uniform fixed-size bubble keys, centered */}
        {QWERTY_ROWS.map((row, ri) => (
          <div key={ri} style={{
            display: "flex",
            justifyContent: "center",
            gap: 0,
            marginBottom: 0,
          }}>
            {row.map((key) => (
              <button
                key={key}
                onClick={() => handleKey(key)}
                style={{
                  width: 37,
                  height: 54,
                  borderRadius: 14,
                  background: "#8DD4FF",
                  border: "none",
                  color: "white",
                  fontWeight: 800,
                  fontSize: 20,
                  fontFamily: "'Fredoka One', cursive",
                  cursor: "pointer",
                  /* Puffy bubble effect: top-gloss highlight + raised shadow below */
                  boxShadow: "0 5px 0 #4AADDF, inset 0 2px 0 rgba(255,255,255,0.55), inset 0 -1px 0 rgba(0,0,0,0.08)",
                  transition: "transform 80ms, box-shadow 80ms",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  flexShrink: 0,
                }}
              >
                {key}
              </button>
            ))}
          </div>
        ))}

      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0} }
        button:active { transform: scale(0.93) !important; box-shadow: none !important; }
      `}</style>
    </div>
  );
}
