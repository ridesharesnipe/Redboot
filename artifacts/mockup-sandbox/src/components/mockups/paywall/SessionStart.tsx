const clay = {
  card: {
    background: "white",
    borderRadius: "24px",
    boxShadow: "0 8px 32px rgba(0,0,0,0.10), 0 2px 8px rgba(0,0,0,0.06), inset 0 1px 0 rgba(255,255,255,0.9)",
    border: "2px solid rgba(255,255,255,0.7)",
  } as React.CSSProperties,
  statCard: (bg: string) => ({
    background: bg,
    borderRadius: "20px",
    boxShadow: "0 6px 20px rgba(0,0,0,0.08), 0 2px 6px rgba(0,0,0,0.05), inset 0 1px 0 rgba(255,255,255,0.8)",
    border: "2px solid rgba(255,255,255,0.6)",
    padding: "16px 12px",
    flex: 1,
    textAlign: "center" as const,
  }),
};

const childName = "Reggie";
const lastCorrect = 7;
const lastTotal = 10;
const lastAccuracy = Math.round((lastCorrect / lastTotal) * 100);
const lastMissed = lastTotal - lastCorrect;

export function SessionStart() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", padding: "0 0 24px" }}>

      {/* Header */}
      <div style={{ background: "linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)", padding: "32px 20px 48px", position: "relative", overflow: "hidden" }}>
        <div style={{ position: "absolute", bottom: -20, left: 0, right: 0, height: 40, background: "linear-gradient(160deg, #e8f4ff 0%, #fff8f0 100%)", borderRadius: "50% 50% 0 0 / 100% 100% 0 0" }} />
        
        {/* Wave decoration */}
        <div style={{ fontSize: 36, marginBottom: 8 }}>⚓</div>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "white", margin: 0, lineHeight: 1.3 }}>
          {childName} spelled {lastCorrect}/{lastTotal} words right last time
        </h1>
        <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 14, marginTop: 8, marginBottom: 0 }}>
          Unlock unlimited practice to be ready for Friday's test
        </p>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Last session stats */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={clay.statCard("linear-gradient(145deg, #d4f5e9, #e8fbf3)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: "#0d7a52", lineHeight: 1 }}>{lastAccuracy}%</div>
            <div style={{ fontSize: 11, color: "#4a9b75", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>accuracy</div>
          </div>
          <div style={clay.statCard("linear-gradient(145deg, #ede9fe, #f3f0ff)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: "#5b4bd5", lineHeight: 1 }}>{lastCorrect}/{lastTotal}</div>
            <div style={{ fontSize: 11, color: "#7c6fcd", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>correct</div>
          </div>
          <div style={clay.statCard("linear-gradient(145deg, #fef3c7, #fff8e1)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 30, color: "#d97706", lineHeight: 1 }}>{lastMissed}</div>
            <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>need work</div>
          </div>
        </div>

        {/* Main CTA card */}
        <div style={{ ...clay.card, overflow: "hidden" }}>
          <div style={{ background: "linear-gradient(135deg, #534AB7 0%, #6366f1 100%)", padding: "20px 18px" }}>
            <div style={{ fontSize: 28, marginBottom: 8 }}>🏴‍☠️</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "white", margin: "0 0 6px" }}>
              Ready for Friday's test?
            </h2>
            <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>
              Practice every day this week with the full crew — unlimited sessions, all characters.
            </p>
          </div>
          
          <div style={{ padding: "18px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 16 }}>
              {["Unlimited practice sessions", "All 4 pirate characters", "Friday test simulator", "Parent progress reports"].map((feature, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 14, color: "#374151" }}>
                  <div style={{ width: 22, height: 22, borderRadius: "50%", background: "#d1fae5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <span style={{ fontSize: 12 }}>✓</span>
                  </div>
                  {feature}
                </div>
              ))}
            </div>

            <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg, #534AB7, #6366f1)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 17, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(83,74,183,0.4)" }}>
              Unlock unlimited practice — $6.99/mo ⚓
            </button>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>
                Continue without practice →
              </span>
            </div>
          </div>
        </div>

        {/* Small trust note */}
        <div style={{ textAlign: "center", fontSize: 12, color: "#94a3b8" }}>
          7-day free trial · Cancel anytime · No ads ever
        </div>
      </div>
    </div>
  );
}
