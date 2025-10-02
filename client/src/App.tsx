import { useState, useEffect, Component, ReactNode } from "react";
import { Router, Route, Switch, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import Onboarding from "@/components/Onboarding";
import Landing from "@/pages/landing";
import PhotoCapturePage from "@/pages/photo-capture";
import ParentDashboard from "@/components/ParentDashboard";
import SimplePractice from "@/components/SimplePractice";
import FridayTest from "@/components/FridayTest";
import ParentGuide from "@/components/ParentGuide";
import TreasureVault from "@/pages/TreasureVault";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";

// Proper React Error Boundary component - moved to module scope for stability
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
            <div className="text-red-600 text-xl mb-2">⚠️ Something went wrong</div>
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

// Error boundary wrapper for routes
const withErrorBoundary = (Component: () => JSX.Element, componentName: string) => {
  return () => (
    <ErrorBoundary componentName={componentName}>
      <Component />
    </ErrorBoundary>
  );
};

function App() {
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  // Show splash screen only on first load
  useEffect(() => {
    const splashShown = sessionStorage.getItem('redboot-splash-shown');
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('redboot-splash-shown', 'true');
    } else {
      setShowSplash(false);
    }
  }, []);

  // Check onboarding status after splash completes
  useEffect(() => {
    if (!showSplash) {
      // Check if onboarding has been completed
      const onboardingComplete = localStorage.getItem('redboot-onboarding-complete');
      if (!onboardingComplete) {
        setShowOnboarding(true);
      }
    }
  }, [showSplash]);

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
  };

  // Show splash screen for first-time visitors
  if (showSplash) {
    return (
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <SplashScreen onComplete={handleSplashComplete} />
          </TooltipProvider>
        </AudioProvider>
      </QueryClientProvider>
    );
  }

  // Show onboarding after splash if needed
  if (showOnboarding) {
    return (
      <QueryClientProvider client={queryClient}>
        <AudioProvider>
          <TooltipProvider>
            <Toaster />
            <Onboarding onComplete={handleOnboardingComplete} />
          </TooltipProvider>
        </AudioProvider>
      </QueryClientProvider>
    );
  }


  // Route components with navigation handling and error boundaries
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

  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <Router>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
              <Switch>
                <Route path="/" component={LandingRoute} />
                <Route path="/photo-capture" component={withErrorBoundary(() => <PhotoCapturePage />, "PhotoCapture")} />
                <Route path="/dashboard" component={DashboardRoute} />
                <Route path="/practice" component={PracticeRoute} />
                <Route path="/test" component={TestRoute} />
                <Route path="/guide" component={GuideRoute} />
                <Route path="/vault" component={withErrorBoundary(() => <TreasureVault />, "TreasureVault")} />
              </Switch>
            </div>
          </Router>
        </TooltipProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;
