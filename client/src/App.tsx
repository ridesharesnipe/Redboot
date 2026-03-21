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
import Paywall from "@/pages/Paywall";
import SubscribeSuccess from "@/pages/SubscribeSuccess";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { useSubscription } from "@/hooks/useSubscription";

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

// ── Stable module-scope route components (defined outside AppRouter so they
//    never get redefined on parent re-renders, which would cause unmount/remount)

const LandingRoute = withErrorBoundary(() => {
  const [, setLocation] = useLocation();
  return <Landing onStart={() => setLocation('/dashboard')} />;
}, "Landing");

const DashboardRoute = withErrorBoundary(() => {
  const [, setLocation] = useLocation();
  return (
    <div className="container mx-auto p-4">
      <ParentDashboard
        onTakePhoto={() => setLocation('/photo-capture')}
        onViewPractice={() => setLocation('/practice')}
        onStartTest={() => setLocation('/test')}
        onViewGuide={() => setLocation('/guide')}
      />
    </div>
  );
}, "Dashboard");

const PracticeRoute = withErrorBoundary(() => {
  const [, setLocation] = useLocation();
  return (
    <div className="container mx-auto p-4">
      <SimplePractice
        onComplete={() => setLocation('/dashboard')}
        onCancel={() => setLocation('/dashboard')}
      />
    </div>
  );
}, "Practice");

const TestRoute = withErrorBoundary(() => {
  const [, setLocation] = useLocation();
  return (
    <div className="container mx-auto p-4">
      <FridayTest
        onComplete={() => setLocation('/dashboard')}
        onCancel={() => setLocation('/dashboard')}
      />
    </div>
  );
}, "Test");

const GuideRoute = withErrorBoundary(() => {
  const [, setLocation] = useLocation();
  return (
    <div className="container mx-auto p-4">
      <ParentGuide onBack={() => setLocation('/dashboard')} />
    </div>
  );
}, "Guide");

const PhotoCaptureRoute = withErrorBoundary(() => <PhotoCapturePage />, "PhotoCapture");
const VaultRoute = withErrorBoundary(() => <TreasureVault />, "TreasureVault");
const BadgesRoute = withErrorBoundary(() => <BadgeGallery />, "BadgeGallery");
const AnalyticsRoute = withErrorBoundary(() => <ParentAnalytics />, "ParentAnalytics");
const PrivacyRoute = withErrorBoundary(() => <PrivacyPolicy />, "PrivacyPolicy");
const PaywallRoute = withErrorBoundary(() => <Paywall />, "Paywall");
const SuccessRoute = withErrorBoundary(() => <SubscribeSuccess />, "SubscribeSuccess");

function AppRouter() {
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [showChildSetup, setShowChildSetup] = useState(false);
  const [showSplash, setShowSplash] = useState(false);

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
    return (
      <div className="container mx-auto p-4">
        <ParentDashboard
          onTakePhoto={() => setLocation('/photo-capture')}
          onViewPractice={() => setLocation('/practice')}
          onStartTest={() => setLocation('/test')}
          onViewGuide={() => setLocation('/guide')}
        />
      </div>
    );
  }, "Dashboard");

  const PracticeRoute = withErrorBoundary(() => {
    const [, setLocation] = useLocation();
    return (
      <div className="container mx-auto p-4">
        <SimplePractice
          onComplete={() => setLocation('/dashboard')}
          onCancel={() => setLocation('/dashboard')}
        />
      </div>
    );
  }, "Practice");

  const TestRoute = withErrorBoundary(() => {
    const [, setLocation] = useLocation();
    const { isPremium, isLoading: subLoading } = useSubscription();
    if (subLoading) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#534AB7', animation: 'spin 0.8s linear infinite' }} />
        </div>
      );
    }
    if (!isPremium) {
      return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '2px solid rgba(255,255,255,0.7)', padding: '32px 24px', maxWidth: 340, width: '100%', textAlign: 'center' }}>
            <div style={{ fontSize: 56, marginBottom: 12 }}>⏰</div>
            <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 22, color: '#534AB7', marginBottom: 8 }}>Friday Test Prep</div>
            <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
              The Friday test simulator is a premium feature — get voice playback, realistic timing, and full test prep with a free trial!
            </div>
            <button onClick={() => setLocation('/paywall?from=test')} style={{ width: '100%', padding: '14px', borderRadius: 18, background: 'linear-gradient(135deg, #534AB7, #6366f1)', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(83,74,183,0.4)', marginBottom: 10 }}>
              Try free for 7 days ⚓
            </button>
            <button onClick={() => setLocation('/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Back to dashboard</button>
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
  }, "Test");

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
          <Route path="/analytics" component={withErrorBoundary(() => {
            const [, goTo] = useLocation();
            const { isPremium, isLoading: subLoading } = useSubscription();
            if (subLoading) {
              return (
                <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div style={{ width: 40, height: 40, borderRadius: '50%', border: '4px solid #e2e8f0', borderTopColor: '#534AB7', animation: 'spin 0.8s linear infinite' }} />
                </div>
              );
            }
            if (!isPremium) {
              return (
                <div style={{ minHeight: '100vh', background: 'linear-gradient(160deg, #e8f4ff 0%, #fff8f0 50%, #fef3e2 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
                  <div style={{ background: 'white', borderRadius: 28, boxShadow: '0 8px 32px rgba(0,0,0,0.10)', border: '2px solid rgba(255,255,255,0.7)', padding: '32px 24px', maxWidth: 340, width: '100%', textAlign: 'center' }}>
                    <div style={{ fontSize: 56, marginBottom: 12 }}>📊</div>
                    <div style={{ fontFamily: "'Pirata One', cursive", fontSize: 22, color: '#534AB7', marginBottom: 8 }}>Progress Analytics</div>
                    <div style={{ fontSize: 15, color: '#374151', lineHeight: 1.6, marginBottom: 20 }}>
                      Unlock detailed word-by-word analytics, streak tracking, and Reggie's full progress history with premium.
                    </div>
                    <button onClick={() => goTo('/paywall?from=analytics')} style={{ width: '100%', padding: '14px', borderRadius: 18, background: 'linear-gradient(135deg, #534AB7, #6366f1)', color: 'white', fontFamily: "'Fredoka One', cursive", fontSize: 18, border: 'none', cursor: 'pointer', boxShadow: '0 6px 20px rgba(83,74,183,0.4)', marginBottom: 10 }}>
                      Try free for 7 days ⚓
                    </button>
                    <button onClick={() => goTo('/dashboard')} style={{ background: 'none', border: 'none', color: '#94a3b8', fontSize: 13, cursor: 'pointer', textDecoration: 'underline' }}>Back to dashboard</button>
                  </div>
                </div>
              );
            }
            return <ParentAnalytics />;
          }, "ParentAnalytics")} />
          <Route path="/privacy" component={withErrorBoundary(() => <PrivacyPolicy />, "PrivacyPolicy")} />
          <Route path="/paywall" component={withErrorBoundary(() => <Paywall />, "Paywall")} />
          <Route path="/subscribe/success" component={withErrorBoundary(() => <SubscribeSuccess />, "SubscribeSuccess")} />
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
