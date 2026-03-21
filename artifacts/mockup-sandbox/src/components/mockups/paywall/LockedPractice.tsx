export function LockedPractice() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #e8f4ff 0%, #fff8f0 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 340, background: "white", borderRadius: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.7)", overflow: "hidden" }}>

        {/* Top ocean strip */}
        <div style={{ background: "linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)", padding: "24px 20px", textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 8 }}>🔒</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "white", margin: "0 0 6px" }}>
            Your free session is done!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.85)", fontSize: 13, margin: 0 }}>
            Join the crew to keep practicing and be ready for Friday's test.
          </p>
        </div>

        <div style={{ padding: "20px" }}>
          {/* What they get */}
          <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 20 }}>
            {[
              { icon: "🗺️", text: "Unlimited practice sessions" },
              { icon: "🐕", text: "Diego's sea monster battles" },
              { icon: "📋", text: "Friday test simulator" },
              { icon: "📊", text: "Parent progress dashboard" },
            ].map((item, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 12, padding: "10px 12px", background: "linear-gradient(145deg, #f8fafc, #f1f5f9)", borderRadius: 14, border: "1px solid #e2e8f0" }}>
                <span style={{ fontSize: 20 }}>{item.icon}</span>
                <span style={{ fontSize: 14, fontWeight: 500, color: "#374151" }}>{item.text}</span>
              </div>
            ))}
          </div>

          {/* Pricing hint */}
          <div style={{ textAlign: "center", marginBottom: 12 }}>
            <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 18, color: "#534AB7" }}>From $1.99/month </span>
            <span style={{ fontSize: 13, color: "#64748b" }}>with 7-day free trial</span>
          </div>

          <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg, #534AB7, #6366f1)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(83,74,183,0.4)", marginBottom: 12 }}>
            Join the crew ⚓
          </button>

          <div style={{ textAlign: "center" }}>
            <span style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>Maybe later</span>
          </div>
        </div>
      </div>
    </div>
  );
}
