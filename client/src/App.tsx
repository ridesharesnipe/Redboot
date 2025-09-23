import { useState, useEffect } from "react";
import { Router, Route, Switch, useLocation } from "wouter";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import Landing from "@/pages/landing";
import PhotoCapturePage from "@/pages/photo-capture";
import ParentDashboard from "@/components/ParentDashboard";
import SimplePractice from "@/components/SimplePractice";
import FridayTest from "@/components/FridayTest";
import ParentGuide from "@/components/ParentGuide";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";
import { spellingStorage } from "@/lib/localStorage";

function App() {
  const [showSplash, setShowSplash] = useState(true);

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

  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  // Show splash screen for first-time visitors
  if (showSplash) {
    return (
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <SplashScreen onComplete={handleSplashComplete} />
        </TooltipProvider>
      </AudioProvider>
    );
  }

  // Route components with navigation handling
  const LandingRoute = () => {
    const [, setLocation] = useLocation();
    return <Landing onStart={() => setLocation('/dashboard')} />;
  };
  
  const DashboardRoute = () => {
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
  };
  
  const PracticeRoute = () => {
    const [, setLocation] = useLocation();
    return (
      <div className="container mx-auto p-4">
        <SimplePractice
          onComplete={() => setLocation('/dashboard')}
          onCancel={() => setLocation('/dashboard')}
        />
      </div>
    );
  };
  
  const TestRoute = () => {
    const [, setLocation] = useLocation();
    return (
      <div className="container mx-auto p-4">
        <FridayTest
          onComplete={() => setLocation('/dashboard')}
          onCancel={() => setLocation('/dashboard')}
        />
      </div>
    );
  };
  
  const GuideRoute = () => {
    const [, setLocation] = useLocation();
    return (
      <div className="container mx-auto p-4">
        <ParentGuide onBack={() => setLocation('/dashboard')} />
      </div>
    );
  };

  return (
    <AudioProvider>
      <TooltipProvider>
        <Toaster />
        <Router>
          <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
            <Switch>
              <Route path="/" component={LandingRoute} />
              <Route path="/photo-capture" component={PhotoCapturePage} />
              <Route path="/dashboard" component={DashboardRoute} />
              <Route path="/practice" component={PracticeRoute} />
              <Route path="/test" component={TestRoute} />
              <Route path="/guide" component={GuideRoute} />
            </Switch>
          </div>
        </Router>
      </TooltipProvider>
    </AudioProvider>
  );
}

export default App;
