import { useState, useEffect, Component, ReactNode } from "react";
import { Router, Route, Switch, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient, getAuthToken, clearAuthToken } from "@/lib/queryClient";
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
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ForgotPassword from "@/pages/ForgotPassword";
import ResetPassword from "@/pages/ResetPassword";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";
import { ThemeProvider } from "@/contexts/ThemeContext";

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

function AuthRouter({ onLogout }: { onLogout: () => void }) {
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
          onLogout={onLogout}
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
          <Route path="/analytics" component={withErrorBoundary(() => <ParentAnalytics />, "ParentAnalytics")} />
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
        </TooltipProvider>
      </AudioProvider>
    </ThemeProvider>
  );
}

function UnauthRouter({ onLogin }: { onLogin: () => void }) {
  return (
    <Router>
      <TooltipProvider>
        <Toaster />
        <Switch>
          <Route path="/signup">
            <Signup onLogin={onLogin} />
          </Route>
          <Route path="/forgot-password">
            <ForgotPassword />
          </Route>
          <Route path="/reset-password">
            <ResetPassword onLogin={onLogin} />
          </Route>
          <Route>
            <Login onLogin={onLogin} />
          </Route>
        </Switch>
      </TooltipProvider>
    </Router>
  );
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = getAuthToken();
    if (!token) {
      setIsAuthenticated(false);
      return;
    }

    fetch("/api/auth/user", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => {
        if (res.ok) {
          setIsAuthenticated(true);
        } else {
          clearAuthToken();
          setIsAuthenticated(false);
        }
      })
      .catch(() => {
        clearAuthToken();
        setIsAuthenticated(false);
      });
  }, []);

  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
        <div className="text-center">
          <div className="text-4xl mb-4 animate-bounce">🏴‍☠️</div>
          <p className="text-lg text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const handleLogin = () => {
    setIsAuthenticated(true);
    queryClient.clear();
  };

  const handleLogout = () => {
    clearAuthToken();
    setIsAuthenticated(false);
    queryClient.clear();
  };

  return (
    <QueryClientProvider client={queryClient}>
      {isAuthenticated ? (
        <AuthRouter onLogout={handleLogout} />
      ) : (
        <UnauthRouter onLogin={handleLogin} />
      )}
    </QueryClientProvider>
  );
}

export default App;
