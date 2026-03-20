export function LockedAnalytics() {
  return (
    <div style={{ minHeight: "100vh", background: "#f8fafc", fontFamily: "'Plus Jakarta Sans', sans-serif", position: "relative", overflow: "hidden" }}>

      {/* Blurred analytics content behind */}
      <div style={{ filter: "blur(6px)", pointerEvents: "none", userSelect: "none", padding: "16px" }}>
        {/* Fake header */}
        <div style={{ background: "linear-gradient(135deg, #1A6BC4, #0E4B8F)", borderRadius: 20, padding: "16px", marginBottom: 12, color: "white" }}>
          <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18 }}>📊 Reggie's Progress</div>
          <div style={{ fontSize: 12, opacity: 0.8, marginTop: 4 }}>Last 4 weeks</div>
        </div>
        {/* Fake stat cards */}
        <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
          {["87%", "142", "🔥 5"].map((v, i) => (
            <div key={i} style={{ flex: 1, background: "white", borderRadius: 16, padding: "14px 10px", textAlign: "center", boxShadow: "0 4px 12px rgba(0,0,0,0.08)" }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1A6BC4" }}>{v}</div>
              <div style={{ fontSize: 10, color: "#94a3b8", marginTop: 4 }}>stat</div>
            </div>
          ))}
        </div>
        {/* Fake chart bars */}
        <div style={{ background: "white", borderRadius: 20, padding: "16px", marginBottom: 12 }}>
          <div style={{ height: 12, background: "#e2e8f0", borderRadius: 6, marginBottom: 10 }} />
          <div style={{ display: "flex", gap: 6, alignItems: "flex-end", height: 80 }}>
            {[60, 80, 45, 90, 70, 85, 55].map((h, i) => (
              <div key={i} style={{ flex: 1, background: `linear-gradient(to top, #1A6BC4, #60a5fa)`, height: `${h}%`, borderRadius: "6px 6px 0 0" }} />
            ))}
          </div>
        </div>
        {/* Fake word list */}
        <div style={{ background: "white", borderRadius: 20, padding: "16px" }}>
          {["because", "friend", "together", "beautiful"].map((w, i) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: i < 3 ? "1px solid #f1f5f9" : "none" }}>
              <span style={{ fontSize: 14 }}>{w}</span>
              <span style={{ fontSize: 12, color: i < 2 ? "#10b981" : "#f59e0b" }}>{i < 2 ? "✓ mastered" : "⚠ needs work"}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Lock overlay */}
      <div style={{ position: "absolute", inset: 0, background: "rgba(255,255,255,0.3)", backdropFilter: "blur(2px)", display: "flex", alignItems: "center", justifyContent: "center", padding: "16px" }}>
        <div style={{ width: "100%", maxWidth: 320, background: "white", borderRadius: 24, boxShadow: "0 16px 48px rgba(0,0,0,0.20), 0 4px 16px rgba(0,0,0,0.10), inset 0 1px 0 rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.8)", padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 44, marginBottom: 12 }}>📊</div>
          <h3 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 20, color: "#1e293b", margin: "0 0 8px" }}>
            Subscribe to see Reggie's detailed progress
          </h3>
          <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px", lineHeight: 1.5 }}>
            Track accuracy, tricky words, weekly streaks, and Friday test readiness — all in one place.
          </p>
          <button style={{ width: "100%", padding: "13px", borderRadius: 14, background: "linear-gradient(135deg, #534AB7, #6366f1)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 17, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(83,74,183,0.4)", marginBottom: 10 }}>
            Unlock reports ⚓
          </button>
          <div style={{ fontSize: 12, color: "#94a3b8" }}>7-day free trial · Cancel anytime</div>
        </div>
      </div>
    </div>
  );
}
