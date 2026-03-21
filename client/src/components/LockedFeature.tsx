interface LockedFeatureProps {
  heading: string;
  subtext: string;
  features: string[];
  ctaText: string;
  onCta: () => void;
  onMaybeLater?: () => void;
  accentColor?: string;
}

export default function LockedFeature({
  heading,
  subtext,
  features,
  ctaText,
  onCta,
  onMaybeLater,
  accentColor = '#534AB7',
}: LockedFeatureProps) {
  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'rgba(15,40,80,0.55)',
      backdropFilter: 'blur(4px)',
      padding: '24px 16px',
    }}>
      <div style={{
        width: '100%',
        maxWidth: 360,
        background: 'white',
        borderRadius: 28,
        boxShadow: '0 24px 64px rgba(0,0,0,0.25), 0 8px 24px rgba(0,0,0,0.15)',
        border: '2px solid rgba(255,255,255,0.8)',
        overflow: 'hidden',
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${accentColor}, ${accentColor}cc)`,
          padding: '24px 20px',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 48, marginBottom: 10 }}>🔒</div>
          <h2 style={{
            fontFamily: 'system-ui, -apple-system, sans-serif',
            fontSize: 22,
            fontWeight: 700,
            color: 'white',
            margin: '0 0 6px',
            lineHeight: 1.3,
          }}>{heading}</h2>
          <p style={{ color: 'rgba(255,255,255,0.88)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>{subtext}</p>
        </div>

        <div style={{ padding: '20px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
            {features.map((f, i) => (
              <div key={i} style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                padding: '10px 14px',
                background: 'linear-gradient(145deg,#f8fafc,#f1f5f9)',
                borderRadius: 14,
                border: '1px solid #e2e8f0',
              }}>
                <span style={{ fontSize: 16, color: '#1D9E75', fontWeight: 700 }}>✓</span>
                <span style={{ fontSize: 14, color: '#374151', fontWeight: 500 }}>{f}</span>
              </div>
            ))}
          </div>

          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <span style={{ fontFamily: 'system-ui', fontSize: 14, color: '#534AB7', fontWeight: 600 }}>From $3.33/month</span>
            <span style={{ fontSize: 13, color: '#64748b' }}> · 7-day free trial</span>
          </div>

          <button
            onClick={onCta}
            style={{
              width: '100%',
              padding: '14px',
              borderRadius: 16,
              background: `linear-gradient(135deg, ${accentColor}, ${accentColor}dd)`,
              color: 'white',
              fontFamily: 'system-ui, -apple-system, sans-serif',
              fontSize: 17,
              fontWeight: 700,
              border: 'none',
              cursor: 'pointer',
              boxShadow: `0 6px 20px ${accentColor}55`,
              marginBottom: 12,
            }}
          >
            {ctaText}
          </button>

          {onMaybeLater && (
            <div style={{ textAlign: 'center' }}>
              <button
                onClick={onMaybeLater}
                style={{ background: 'none', border: 'none', fontSize: 13, color: '#94a3b8', cursor: 'pointer', textDecoration: 'underline' }}
              >
                Maybe later
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
