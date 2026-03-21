export function LockedFridayTest() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #fef3e2 0%, #fff8f0 50%, #e8f4ff 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>
      <div style={{ width: "100%", maxWidth: 340 }}>

        {/* Main card */}
        <div style={{ background: "white", borderRadius: 28, boxShadow: "0 12px 40px rgba(0,0,0,0.12), 0 4px 12px rgba(0,0,0,0.08), inset 0 1px 0 rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.7)", overflow: "hidden" }}>

          {/* Gold header */}
          <div style={{ background: "linear-gradient(135deg, #d97706, #F4A438)", padding: "24px 20px", textAlign: "center" }}>
            <div style={{ fontSize: 48, marginBottom: 8 }}>📋</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "white", margin: "0 0 6px", textShadow: "0 2px 4px rgba(0,0,0,0.15)" }}>
              Friday Test Simulator
            </h2>
            <div style={{ display: "inline-block", background: "rgba(255,255,255,0.25)", borderRadius: 20, padding: "4px 14px", fontSize: 12, color: "white", fontWeight: 600, marginTop: 4 }}>
              ⭐ Premium Feature
            </div>
          </div>

          <div style={{ padding: "20px" }}>
            <p style={{ fontSize: 14, color: "#374151", lineHeight: 1.6, marginBottom: 18, textAlign: "center" }}>
              Simulate Friday's real test with timed questions, parent voice playback, and a full score report — just like the classroom.
            </p>

            {/* Feature highlights */}
            <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 20 }}>
              {[
                { icon: "⏱️", text: "Timed test mode — just like class" },
                { icon: "🎙️", text: "Parent voice word playback" },
                { icon: "📊", text: "Full score report with missed words" },
                { icon: "🔁", text: "Retake as many times as needed" },
              ].map((item, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 12px", background: "linear-gradient(145deg, #fffbeb, #fef3c7)", borderRadius: 12, border: "1px solid #fde68a" }}>
                  <span style={{ fontSize: 18 }}>{item.icon}</span>
                  <span style={{ fontSize: 13, color: "#374151" }}>{item.text}</span>
                </div>
              ))}
            </div>

            {/* Pricing note */}
            <div style={{ textAlign: "center", background: "linear-gradient(145deg, #f5f3ff, #ede9fe)", borderRadius: 14, padding: "12px", marginBottom: 14, border: "1px solid #ddd6fe" }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 17, color: "#534AB7" }}>7-day free trial included</div>
              <div style={{ fontSize: 12, color: "#7c6fcd", marginTop: 2 }}>Then from $1.99/month — cancel anytime</div>
            </div>

            <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg, #534AB7, #6366f1)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(83,74,183,0.4)", marginBottom: 10 }}>
              Unlock Friday Test ⚓
            </button>

            <div style={{ textAlign: "center" }}>
              <span style={{ fontSize: 13, color: "#94a3b8", cursor: "pointer" }}>Maybe later</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
