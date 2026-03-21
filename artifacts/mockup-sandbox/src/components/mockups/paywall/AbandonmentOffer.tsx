export function AbandonmentOffer() {
  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px 16px" }}>

      {/* Backdrop */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(15, 40, 80, 0.5)", backdropFilter: "blur(4px)", zIndex: 0 }} />

      {/* Offer card */}
      <div style={{ position: "relative", zIndex: 1, width: "100%", maxWidth: 340, background: "white", borderRadius: 28, boxShadow: "0 24px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.9)", border: "2px solid rgba(255,255,255,0.8)", overflow: "hidden" }}>

        {/* Gift header */}
        <div style={{ background: "linear-gradient(135deg, #0d7a52, #1D9E75)", padding: "24px 20px", textAlign: "center", position: "relative" }}>
          {/* 60% off badge */}
          <div style={{ position: "absolute", top: -1, left: "50%", transform: "translateX(-50%)", background: "#F4A438", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 16, padding: "6px 20px", borderRadius: "0 0 16px 16px", boxShadow: "0 4px 12px rgba(244,164,56,0.4)" }}>
            60% OFF 🎁
          </div>

          <div style={{ fontSize: 48, marginTop: 20, marginBottom: 8 }}>🎁</div>
          <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: "white", margin: "0 0 6px" }}>
            Wait, Captain!
          </h2>
          <p style={{ color: "rgba(255,255,255,0.9)", fontSize: 14, margin: 0 }}>
            A special offer, just for you — next 10 minutes only
          </p>
        </div>

        {/* Offer details */}
        <div style={{ padding: "20px 20px 24px" }}>
          <div style={{ border: "2px solid #1D9E75", borderRadius: 20, padding: "18px", marginBottom: 16, background: "linear-gradient(145deg, #f0fdf4, #dcfce7)", boxShadow: "0 4px 16px rgba(29,158,117,0.15)" }}>
            <div style={{ textAlign: "center" }}>
              <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 40, color: "#0d7a52", lineHeight: 1 }}>$23.88</div>
              <div style={{ fontSize: 13, color: "#0d7a52", fontWeight: 600, marginTop: 4 }}>/year · $1.99 per month</div>
              <div style={{ fontSize: 12, color: "#6b7280", marginTop: 6 }}>
                <span style={{ textDecoration: "line-through" }}>$39.96</span>
                {" "}— less than a juice box a month
              </div>
            </div>
          </div>

          {/* Features */}
          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
            {["Everything unlocked for a full year", "All 4 characters + sea monster battles", "Friday test simulator & analytics", "7-day free trial included"].map((f, i) => (
              <div key={i} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "#374151" }}>
                <span style={{ fontSize: 14 }}>⚓</span>
                {f}
              </div>
            ))}
          </div>

          {/* CTA */}
          <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg, #0d7a52, #1D9E75)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(29,158,117,0.4)" }}>
            Claim this deal ⚓
          </button>
          <div style={{ textAlign: "center", fontSize: 12, color: "#1D9E75", fontWeight: 600, marginTop: 8 }}>
            7-day free trial included
          </div>

          {/* Dismiss */}
          <div style={{ textAlign: "center", marginTop: 12 }}>
            <span style={{ fontSize: 12, color: "#94a3b8", textDecoration: "underline", cursor: "pointer" }}>No thanks, I'll pay full price later</span>
          </div>
        </div>
      </div>
    </div>
  );
}
