import { useState, useEffect, Component, ReactNode } from "react";
import { Router, Route, Switch, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import OnboardingCards from "@/components/OnboardingCards";
import ChildSetup from "@/components/ChildSetup";
import SplashScreen from "@/components/SplashScreen";
import Landing from "@/pages/landing";
import PhotoCapturePage from "@/pages/photo-capture";
import ParentDashboard from "@/components/ParentDashboard";
import SimplePractice from "@/components/SimplePractice";
import FridayTest from "@/components/FridayTest";
import ParentGuide from "@/components/ParentGuide";
import TreasureVault from "@/pages/TreasureVault";
import BadgeGallery from "@/pages/BadgeGallery";
import ParentAnalytics from "@/pages/ParentAnalytics";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { getSubscription, activatePremium } from "@/lib/subscription";
import Paywall from "@/components/Paywall";
import AbandonmentOffer from "@/components/AbandonmentOffer";

class ErrorBoundary extends Component<{children: ReactNode, componentName: string}, {hasError: boolean}> {
  constructor(props: {children: ReactNode, componentName: string}) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error(`${this.props.componentName} error:`, error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="container mx-auto p-8 text-center">
          <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md mx-auto">
            <div className="text-red-600 text-xl mb-2">Something went wrong</div>
            <p className="text-red-700 mb-4">
              Error loading {this.props.componentName.toLowerCase()}. Don't worry, your progress is saved!
            </p>
            <button
              onClick={() => window.location.reload()}
              className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

const withErrorBoundary = (Component: () => JSX.Element, componentName: string) => {
  return () => (
    <ErrorBoundary componentName={componentName}>
      <Component />
    </ErrorBoundary>
  );
};

function getLastSessionData() {
  const childName = localStorage.getItem('redboot-child-name') || 'Your child';
  try {
    const raw = localStorage.getItem('practiceProgress');
    if (raw) {
      const data = JSON.parse(raw);
      const history: Array<{ correct: boolean }> = data._practiceHistory || [];
      const recent = history.slice(-10);
      if (recent.length > 0) {
        const correct = recent.filter((h) => h.correct).length;
        return { correct, total: recent.length, childName };
      }
    }
  } catch {}
  return { correct: 7, total: 10, childName };
}

function PracticeRouteInner() {
  const [, setLocation] = useLocation();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAbandonment, setShowAbandonment] = useState(() => localStorage.getItem('redboot-stripe-abandoned') === '1');
  const sub = getSubscription();
  const isLocked = sub.freeSessionUsed && !sub.isPremium;

  if (isLocked) {
    if (showAbandonment) {
      return <AbandonmentOffer onDismiss={() => setShowAbandonment(false)} />;
    }
    if (showPaywall) {
      const { correct, total, childName } = getLastSessionData();
      return (
        <Paywall
          correct={correct}
          total={total}
          childName={childName}
          onMaybeLater={() => setLocation('/dashboard')}
        />
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)' }}>
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div className="text-5xl mb-4">⚓</div>
          <h2 className="font-black text-2xl text-slate-800 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>Your free session is done!</h2>
          <p className="text-slate-500 text-sm mb-5">Join the crew for unlimited practice and more</p>
          <div className="flex flex-col gap-2 mb-6 text-left">
            {["Unlimited practice sessions", "Diego's sea monster battles", "Friday test simulator"].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-600 font-bold flex-shrink-0">✓</div>
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full py-4 rounded-2xl text-white font-black text-lg mb-3 transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
          >
            Subscribe to keep practicing
          </button>
          <button onClick={() => setLocation('/dashboard')} className="text-sm text-slate-400 underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <SimplePractice
        onComplete={() => setLocation('/dashboard')}
        onCancel={() => setLocation('/dashboard')}
      />
    </div>
  );
}

function TestRouteInner() {
  const [, setLocation] = useLocation();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAbandonment, setShowAbandonment] = useState(() => localStorage.getItem('redboot-stripe-abandoned') === '1');
  const sub = getSubscription();
  const isLocked = sub.freeSessionUsed && !sub.isPremium;

  if (isLocked) {
    if (showAbandonment) {
      return <AbandonmentOffer onDismiss={() => setShowAbandonment(false)} />;
    }
    if (showPaywall) {
      const { correct, total, childName } = getLastSessionData();
      return (
        <Paywall
          correct={correct}
          total={total}
          childName={childName}
          onMaybeLater={() => setLocation('/dashboard')}
        />
      );
    }
    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)' }}>
        <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.12)', border: '2px solid rgba(255,255,255,0.7)' }}>
          <div className="text-5xl mb-4">📋</div>
          <h2 className="font-black text-2xl text-slate-800 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>Friday Test Simulator</h2>
          <p className="text-slate-500 text-sm mb-5">Simulate Friday's test with timed questions, random order, and a full score report</p>
          <div className="flex flex-col gap-2 mb-6 text-left">
            {["Timed test mode", "Random word order", "Full score report", "Retake unlimited"].map((f, i) => (
              <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                <div className="w-5 h-5 rounded-full bg-emerald-100 flex items-center justify-center text-xs text-emerald-600 font-bold flex-shrink-0">✓</div>
                {f}
              </div>
            ))}
          </div>
          <button
            onClick={() => setShowPaywall(true)}
            className="w-full py-4 rounded-2xl text-white font-black text-lg mb-2 transition-transform active:scale-95"
            style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
          >
            Unlock Friday Test
          </button>
          <p className="text-xs text-slate-400 mb-3">7-day free trial included</p>
          <button onClick={() => setLocation('/dashboard')} className="text-sm text-slate-400 underline">
            Back to dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <FridayTest
        onComplete={() => setLocation('/dashboard')}
        onCancel={() => setLocation('/dashboard')}
      />
    </div>
  );
}

function AnalyticsRouteInner() {
  const [, setLocation] = useLocation();
  const [showPaywall, setShowPaywall] = useState(false);
  const [showAbandonment, setShowAbandonment] = useState(() => localStorage.getItem('redboot-stripe-abandoned') === '1');
  const sub = getSubscription();
  const isLocked = sub.freeSessionUsed && !sub.isPremium;
  const childName = localStorage.getItem('redboot-child-name') || 'Your child';

  if (isLocked) {
    if (showAbandonment) {
      return <AbandonmentOffer onDismiss={() => setShowAbandonment(false)} />;
    }
    if (showPaywall) {
      const { correct, total } = getLastSessionData();
      return (
        <Paywall
          correct={correct}
          total={total}
          childName={childName}
          onMaybeLater={() => setShowPaywall(false)}
        />
      );
    }
    return (
      <div style={{ position: 'relative', minHeight: '100vh' }}>
        <div style={{ filter: 'blur(8px)', pointerEvents: 'none', userSelect: 'none' }}>
          <ParentAnalytics />
        </div>
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(15,30,60,0.45)', padding: 24 }}>
          <div className="bg-white rounded-3xl p-6 max-w-sm w-full text-center" style={{ boxShadow: '0 8px 32px rgba(0,0,0,0.18)', border: '2px solid rgba(255,255,255,0.7)' }}>
            <div className="text-5xl mb-3">📊</div>
            <h2 className="font-black text-xl text-slate-800 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }}>
              Subscribe to see {childName}'s detailed progress
            </h2>
            <p className="text-slate-500 text-sm mb-5">Accuracy charts, word mastery, session history and more</p>
            <button
              onClick={() => setShowPaywall(true)}
              className="w-full py-4 rounded-2xl text-white font-black text-lg mb-3 transition-transform active:scale-95"
              style={{ background: 'linear-gradient(135deg, #534AB7, #6366f1)', fontFamily: "'Fredoka One', cursive", boxShadow: '0 6px 20px rgba(83,74,183,0.4)' }}
            >
              Subscribe to unlock
            </button>
            <button onClick={() => setLocation('/dashboard')} className="text-sm text-slate-400 underline">
              Back to dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <ParentAnalytics />;
}

function AppRouter() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChildSetup, setShowChildSetup] = useState(false);
  const [showSplash, setShowSplash] = useState(false);
  const [showWelcomeScreen, setShowWelcomeScreen] = useState(false);

  useEffect(() => {
    const hasSeenOnboarding = localStorage.getItem('hasSeenOnboarding');
    const onboardingComplete = localStorage.getItem('redboot-onboarding-complete');
    const splashShown = sessionStorage.getItem('redboot-splash-shown');

    if (!hasSeenOnboarding) {
      setShowOnboarding(true);
    } else if (!onboardingComplete) {
      setShowChildSetup(true);
    } else if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('redboot-splash-shown', 'true');
    }
  }, []);

  // Handle Stripe payment redirect params
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const payment = params.get('payment');
    const sessionId = params.get('session_id');

    if (payment === 'success' && sessionId) {
      window.history.replaceState({}, '', window.location.pathname);
      fetch(`/api/stripe/subscription-status?sessionId=${encodeURIComponent(sessionId)}`)
        .then(r => r.json())
        .then(data => {
          if (data.active) {
            activatePremium(data.plan as 'monthly' | 'annual');
            setShowWelcomeScreen(true);
            setTimeout(() => setShowWelcomeScreen(false), 3500);
          }
        })
        .catch(err => console.error('Error verifying payment:', err));
    } else if (payment === 'canceled') {
      window.history.replaceState({}, '', window.location.pathname);
      localStorage.setItem('redboot-stripe-abandoned', '1');
    }
  }, []);

  const handleOnboardingComplete = () => {
    localStorage.setItem('hasSeenOnboarding', 'true');
    setShowOnboarding(false);
    setShowChildSetup(true);
  };

  const handleChildSetupComplete = () => {
    sessionStorage.setItem('redboot-splash-shown', 'true');
    setShowChildSetup(false);
    setShowSplash(true);
  };

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  if (showOnboarding) {
    return (
      <ThemeProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <OnboardingCards onComplete={handleOnboardingComplete} />
          </TooltipProvider>
        </AudioProvider>
      </ThemeProvider>
    );
  }

  if (showChildSetup) {
    return (
      <ThemeProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <ChildSetup onComplete={handleChildSetupComplete} />
          </TooltipProvider>
        </AudioProvider>
      </ThemeProvider>
    );
  }

  if (showSplash) {
    return (
      <ThemeProvider>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <SplashScreen onComplete={handleSplashComplete} />
          </TooltipProvider>
        </AudioProvider>
      </ThemeProvider>
    );
  }

  const LandingRoute = withErrorBoundary(() => {
    const [, setLocation] = useLocation();
    return <Landing onStart={() => setLocation('/dashboard')} />;
  }, "Landing");

  const DashboardRoute = withErrorBoundary(() => {
    const [, setLocation] = useLocation();
    const sub = getSubscription();
    const isLocked = sub.freeSessionUsed && !sub.isPremium;

    return (
      <div className="container mx-auto p-4" style={{ position: 'relative' }}>
        <ParentDashboard
          onTakePhoto={() => !isLocked && setLocation('/photo-capture')}
          onViewPractice={() => !isLocked && setLocation('/practice')}
          onStartTest={() => !isLocked && setLocation('/test')}
          onViewGuide={() => !isLocked && setLocation('/guide')}
        />
        {isLocked && (
          <>
            {/* Full-screen click blocker */}
            <div
              style={{
                position: 'fixed',
                inset: 0,
                zIndex: 40,
                cursor: 'default',
              }}
              onClick={e => e.stopPropagation()}
              onPointerDown={e => e.stopPropagation()}
            />
            {/* Frosted subscribe banner pinned to bottom */}
            <div
              style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                right: 0,
                zIndex: 50,
                background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)',
                padding: '16px 20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: 12,
                boxShadow: '0 -4px 24px rgba(0,0,0,0.18)',
              }}
            >
              <div>
                <div style={{ color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 16, lineHeight: 1.2 }}>
                  Subscribe to keep practicing ⚓
                </div>
                <div style={{ color: 'rgba(255,255,255,0.8)', fontSize: 12, marginTop: 2 }}>
                  Free trial included — cancel anytime
                </div>
              </div>
              <button
                onClick={() => setLocation('/practice')}
                style={{
                  background: 'linear-gradient(135deg, #F4A438, #e08c20)',
                  color: 'white',
                  fontFamily: "'Fredoka One', cursive",
                  fontSize: 15,
                  padding: '10px 18px',
                  borderRadius: 14,
                  border: 'none',
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  boxShadow: '0 4px 12px rgba(244,164,56,0.4)',
                  flexShrink: 0,
                }}
              >
                Join the crew →
              </button>
            </div>
          </>
        )}
      </div>
    );
  }, "Dashboard");

  const PracticeRoute = withErrorBoundary(PracticeRouteInner, "Practice");
  const TestRoute = withErrorBoundary(TestRouteInner, "Test");
  const AnalyticsRoute = withErrorBoundary(AnalyticsRouteInner, "Analytics");

  const GuideRoute = withErrorBoundary(() => {
    const [, setLocation] = useLocation();
    return (
      <div className="container mx-auto p-4">
        <ParentGuide onBack={() => setLocation('/dashboard')} />
      </div>
    );
  }, "Guide");

  const PageTransitionWrapper = () => {
    const [location] = useLocation();
    return (
      <div key={location} className="page-enter">
        <Switch>
          <Route path="/" component={LandingRoute} />
          <Route path="/photo-capture" component={withErrorBoundary(() => <PhotoCapturePage />, "PhotoCapture")} />
          <Route path="/dashboard" component={DashboardRoute} />
          <Route path="/practice" component={PracticeRoute} />
          <Route path="/test" component={TestRoute} />
          <Route path="/guide" component={GuideRoute} />
          <Route path="/vault" component={withErrorBoundary(() => <TreasureVault />, "TreasureVault")} />
          <Route path="/badges" component={withErrorBoundary(() => <BadgeGallery />, "BadgeGallery")} />
          <Route path="/analytics" component={AnalyticsRoute} />
          <Route path="/privacy" component={withErrorBoundary(() => <PrivacyPolicy />, "PrivacyPolicy")} />
          <Route>
            <Redirect to="/" />
          </Route>
        </Switch>
      </div>
    );
  };

  return (
    <ThemeProvider>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
              <PageTransitionWrapper />
            </div>
          </Router>
          {/* Welcome aboard screen — shown for 3.5s after successful payment */}
          {showWelcomeScreen && (
            <div style={{ position: 'fixed', inset: 0, zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #1A6BC4 0%, #0E4B8F 100%)' }}>
              <div style={{ textAlign: 'center', padding: 32 }}>
                <div style={{ fontSize: 72, marginBottom: 16, animation: 'bounce 0.6s ease infinite alternate' }}>🏴‍☠️</div>
                <h1 style={{ fontFamily: "'Fredoka One', cursive", fontSize: 36, color: 'white', marginBottom: 12 }}>
                  Welcome aboard, Captain!
                </h1>
                <p style={{ color: 'rgba(255,255,255,0.85)', fontSize: 18, marginBottom: 24 }}>
                  All features are now unlocked — let the adventure begin!
                </p>
                <div style={{ display: 'flex', justifyContent: 'center', gap: 16, flexWrap: 'wrap' }}>
                  {['Unlimited practice ✅', 'Friday Test ✅', 'All characters ✅', 'Analytics ✅'].map((f, i) => (
                    <div key={i} style={{ background: 'rgba(255,255,255,0.15)', borderRadius: 12, padding: '8px 16px', color: 'white', fontSize: 14, fontWeight: 600 }}>{f}</div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </TooltipProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppRouter />
    </QueryClientProvider>
  );
}

export default App;
