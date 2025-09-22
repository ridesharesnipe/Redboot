import { Switch, Route } from "wouter";
import { useState, useEffect } from "react";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Game from "@/pages/game";
import Progress from "@/pages/progress";
import PhotoCapture from "@/pages/photo-capture";
import TestSimulator from "@/pages/test-simulator";
import Subscribe from "@/pages/subscribe";
import NotFound from "@/pages/not-found";
import SplashScreen from "@/components/SplashScreen";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen only on first load to landing page
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      // Show splash for non-authenticated users (landing page)
      const splashShown = sessionStorage.getItem('splashShown');
      if (!splashShown) {
        setShowSplash(true);
        sessionStorage.setItem('splashShown', 'true');
      } else {
        setShowSplash(false);
      }
    } else {
      // Skip splash for authenticated users
      setShowSplash(false);
    }
  }, [isLoading, isAuthenticated]);

  // Show splash screen for first-time visitors
  if (showSplash && !isLoading && !isAuthenticated) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/game/:childId" component={Game} />
          <Route path="/progress/:childId" component={Progress} />
          <Route path="/photo-capture" component={PhotoCapture} />
          <Route path="/test/:childId" component={TestSimulator} />
          <Route path="/subscribe" component={Subscribe} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AudioProvider>
        <TooltipProvider>
          <Toaster />
          <AudioControls />
          <Router />
        </TooltipProvider>
      </AudioProvider>
    </QueryClientProvider>
  );
}

export default App;
