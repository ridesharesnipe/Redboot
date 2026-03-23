import { useState } from "react";

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
const correct = 8;
const total = 10;
const accuracy = Math.round((correct / total) * 100);
const missed = total - correct;

export function AhaMomentV2() {
  const [selectedPlan, setSelectedPlan] = useState<"annual" | "monthly">("annual");
  const [trialOn, setTrialOn] = useState(true);

  const annualPrice = trialOn ? "$39.99" : "$35.99";
  const monthlyPrice = trialOn ? "$6.99" : "$6.29";
  const annualMonthly = trialOn ? "$3.33" : "$3.00";
  const ctaText = trialOn ? "Try free for 7 days ⚓" : "Subscribe now — save 10%";

  return (
    <div style={{ minHeight: "100vh", background: "linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)", fontFamily: "'Plus Jakarta Sans', sans-serif", overflowY: "auto" }}>

      {/* White header — no gradient, no wave divider */}
      <div style={{ background: "white", padding: "28px 20px 24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
        <div style={{
          width: 110, height: 110,
          borderRadius: "50%",
          overflow: "hidden",
          border: "4px solid #1A6BC4",
          boxShadow: "0 4px 18px rgba(26,107,196,0.28)",
          marginBottom: 14,
          flexShrink: 0,
        }}>
          <img
            src="/__mockup/images/redboot-dab.jpg"
            alt="Red Boot"
            style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "center 20%" }}
          />
        </div>
        <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 24, color: "#1A6BC4", margin: 0, lineHeight: 1.25 }}>
          {childName} spelled {correct} out of {total} words correctly!
        </h1>
        <p style={{ color: "#64748B", fontSize: 14, marginTop: 8, marginBottom: 0 }}>
          Unlock unlimited practice to be ready for Friday's test
        </p>
      </div>

      <div style={{ padding: "20px 16px", display: "flex", flexDirection: "column", gap: 16 }}>

        {/* Stats row */}
        <div style={{ display: "flex", gap: 10 }}>
          <div style={clay.statCard("linear-gradient(145deg, #d4f5e9, #e8fbf3)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: "#0d7a52", lineHeight: 1 }}>{accuracy}%</div>
            <div style={{ fontSize: 11, color: "#4a9b75", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>accuracy</div>
          </div>
          <div style={clay.statCard("linear-gradient(145deg, #ede9fe, #f3f0ff)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: "#5b4bd5", lineHeight: 1 }}>{correct}/{total}</div>
            <div style={{ fontSize: 11, color: "#7c6fcd", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>correct</div>
          </div>
          <div style={clay.statCard("linear-gradient(145deg, #fef3c7, #fff8e1)")}>
            <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 32, color: "#d97706", lineHeight: 1 }}>{missed}</div>
            <div style={{ fontSize: 11, color: "#b45309", fontWeight: 600, marginTop: 4, textTransform: "uppercase", letterSpacing: "0.05em" }}>need work</div>
          </div>
        </div>

        <div style={{ height: 1, background: "linear-gradient(90deg, transparent, #cbd5e1, transparent)" }} />

        {/* Zero risk section */}
        <div style={clay.card}>
          <div style={{ padding: "20px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#1D9E75", letterSpacing: "0.1em", textTransform: "uppercase" }}>⚓ ZERO RISK</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1e293b", margin: "6px 0 4px" }}>Try it free. Cancel anytime.</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 18px" }}>Here's exactly what happens when you join the crew:</p>

            <div style={{ position: "relative", paddingLeft: 36 }}>
              <div style={{ position: "absolute", left: 15, top: 20, bottom: 20, width: 2, background: "linear-gradient(to bottom, #93c5fd, #86efac)", borderRadius: 2 }} />
              {[
                { num: "1", color: "#3b82f6", bg: "#dbeafe", title: "Today — Start free", sub: "Full access to all treasure maps. No charge." },
                { num: "2", color: "#f59e0b", bg: "#fef3c7", title: "Day 5 — We'll remind you", sub: "Get a notification before your trial ends. No surprises." },
                { num: "3", color: "#10b981", bg: "#d1fae5", title: "Day 7 — You decide", sub: "Love it? Keep going. Not for you? Cancel with one tap. $0 charged." },
              ].map((step, i) => (
                <div key={i} style={{ display: "flex", gap: 12, alignItems: "flex-start", marginBottom: i < 2 ? 20 : 0 }}>
                  <div style={{ width: 30, height: 30, borderRadius: "50%", background: step.bg, border: `2px solid ${step.color}`, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, zIndex: 1, marginLeft: -15 }}>
                    <span style={{ fontFamily: "'Fredoka One', cursive", fontSize: 15, color: step.color }}>{step.num}</span>
                  </div>
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14, color: "#1e293b" }}>{step.title}</div>
                    <div style={{ fontSize: 12, color: "#64748b", marginTop: 2 }}>{step.sub}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Pricing section */}
        <div style={clay.card}>
          <div style={{ padding: "20px 18px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "#534AB7", letterSpacing: "0.1em", textTransform: "uppercase" }}>💎 CHOOSE YOUR PLAN</div>
            <h2 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1e293b", margin: "6px 0 4px" }}>Start free, pay only if you love it</h2>
            <p style={{ fontSize: 13, color: "#64748b", margin: "0 0 16px" }}>7-day free trial on every plan</p>

            <div onClick={() => setSelectedPlan("annual")} style={{ position: "relative", padding: "14px 16px", borderRadius: 16, border: selectedPlan === "annual" ? "2px solid #378ADD" : "1.5px solid #e2e8f0", background: selectedPlan === "annual" ? "linear-gradient(145deg, #eff8ff, #dbeafe22)" : "white", cursor: "pointer", marginBottom: 10, display: "flex", justifyContent: "space-between", alignItems: "center", boxShadow: selectedPlan === "annual" ? "0 4px 16px rgba(55,138,221,0.2)" : "none" }}>
              <div style={{ position: "absolute", top: -10, right: 12, background: "#378ADD", color: "white", fontSize: 11, fontWeight: 700, padding: "2px 10px", borderRadius: 20 }}>Save 52%</div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Yearly</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{annualMonthly}/month</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1e293b" }}>{annualPrice}</div>
                {!trialOn && <div style={{ fontSize: 11, color: "#94a3b8", textDecoration: "line-through" }}>$39.99</div>}
              </div>
            </div>

            <div onClick={() => setSelectedPlan("monthly")} style={{ padding: "14px 16px", borderRadius: 16, border: selectedPlan === "monthly" ? "2px solid #534AB7" : "1.5px solid #e2e8f0", background: selectedPlan === "monthly" ? "linear-gradient(145deg, #f5f3ff, #ede9fe22)" : "white", cursor: "pointer", marginBottom: 16, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 15, color: "#1e293b" }}>Monthly</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>Flexible, cancel anytime</div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontFamily: "'Fredoka One', cursive", fontSize: 22, color: "#1e293b" }}>{monthlyPrice}</div>
                <div style={{ fontSize: 11, color: "#94a3b8" }}>/month</div>
              </div>
            </div>

            <div style={{ background: "#f8fafc", borderRadius: 14, padding: "12px 14px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16, border: "1px solid #e2e8f0" }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#1e293b" }}>Include 7-day free trial</div>
                <div style={{ fontSize: 11, color: "#64748b", marginTop: 2 }}>{trialOn ? "Recommended — try before you pay" : "Skip trial and save 10% today"}</div>
              </div>
              <div onClick={() => setTrialOn(!trialOn)} style={{ width: 46, height: 26, borderRadius: 13, background: trialOn ? "#1D9E75" : "#cbd5e1", cursor: "pointer", position: "relative", transition: "background 0.2s", flexShrink: 0 }}>
                <div style={{ position: "absolute", top: 3, left: trialOn ? 23 : 3, width: 20, height: 20, borderRadius: "50%", background: "white", boxShadow: "0 2px 4px rgba(0,0,0,0.2)", transition: "left 0.2s" }} />
              </div>
            </div>

            <input placeholder="Enter your email to get started" style={{ width: "100%", padding: "12px 14px", borderRadius: 12, border: "1.5px solid #e2e8f0", fontSize: 14, marginBottom: 12, boxSizing: "border-box", fontFamily: "inherit", outline: "none" }} />

            <button style={{ width: "100%", padding: "14px", borderRadius: 16, background: "linear-gradient(135deg, #534AB7, #6366f1)", color: "white", fontFamily: "'Fredoka One', cursive", fontSize: 18, border: "none", cursor: "pointer", boxShadow: "0 6px 20px rgba(83,74,183,0.4), 0 2px 8px rgba(83,74,183,0.3)", letterSpacing: "0.02em" }}>
              {ctaText}
            </button>

            <div style={{ textAlign: "center", fontSize: 11, color: "#94a3b8", marginTop: 10 }}>
              🔒 Stripe payment · Cancel anytime · No ads ever
            </div>

            <div style={{ textAlign: "center", marginTop: 12 }}>
              <span style={{ fontSize: 13, color: "#94a3b8", textDecoration: "underline", cursor: "pointer" }}>Maybe later</span>
            </div>
          </div>
        </div>

        <div style={{ height: 20 }} />
      </div>
    </div>
  );
}
