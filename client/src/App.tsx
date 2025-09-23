import { useState, useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import SplashScreen from "@/components/SplashScreen";
import ParentDashboard from "@/components/ParentDashboard";
import PhotoCapture from "@/components/PhotoCapture";
import SimplePractice from "@/components/SimplePractice";
import FridayTest from "@/components/FridayTest";
import { AudioProvider, AudioControls } from "@/contexts/AudioContext";
import { spellingStorage } from "@/lib/localStorage";

type AppView = 'splash' | 'dashboard' | 'photo' | 'practice' | 'test';

function App() {
  const [currentView, setCurrentView] = useState<AppView>('splash');
  const [showSplash, setShowSplash] = useState(true);

  // Show splash screen only on first load
  useEffect(() => {
    const splashShown = sessionStorage.getItem('redboot-splash-shown');
    if (!splashShown) {
      setShowSplash(true);
      sessionStorage.setItem('redboot-splash-shown', 'true');
    } else {
      setShowSplash(false);
      setCurrentView('dashboard');
    }
  }, []);

  const handleSplashComplete = () => {
    setShowSplash(false);
    setCurrentView('dashboard');
  };

  const handleTakePhoto = () => {
    setCurrentView('photo');
  };

  const handleViewPractice = () => {
    setCurrentView('practice');
  };

  const handleStartTest = () => {
    setCurrentView('test');
  };

  const handleBackToDashboard = () => {
    setCurrentView('dashboard');
  };

  const handleWordsExtracted = (words: string[]) => {
    // Words are already saved to localStorage by PhotoCapture component
    setCurrentView('dashboard');
  };

  const handlePracticeComplete = (score: { correct: number; total: number; treasureEarned: number }) => {
    // Show completion message and return to dashboard
    setCurrentView('dashboard');
  };

  const handleTestComplete = (results: { 
    score: number; 
    total: number; 
    percentage: number; 
    results: any[];
    timeSpent: number;
  }) => {
    // Show test results and return to dashboard
    setCurrentView('dashboard');
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

  const renderCurrentView = () => {
    switch (currentView) {
      case 'dashboard':
        return (
          <ParentDashboard
            onTakePhoto={handleTakePhoto}
            onViewPractice={handleViewPractice}
            onStartTest={handleStartTest}
          />
        );
      
      case 'photo':
        return (
          <div className="container mx-auto p-4">
            <PhotoCapture
              onCapture={(imageData) => {
                // Image captured and processed
                console.log('Image captured:', imageData.length, 'characters');
              }}
              onWordsExtracted={handleWordsExtracted}
              onCancel={handleBackToDashboard}
            />
          </div>
        );
      
      case 'practice':
        return (
          <div className="container mx-auto p-4">
            <SimplePractice
              onComplete={handlePracticeComplete}
              onCancel={handleBackToDashboard}
            />
          </div>
        );
      
      case 'test':
        return (
          <div className="container mx-auto p-4">
            <FridayTest
              onComplete={handleTestComplete}
              onCancel={handleBackToDashboard}
            />
          </div>
        );
      
      default:
        return (
          <ParentDashboard
            onTakePhoto={handleTakePhoto}
            onViewPractice={handleViewPractice}
            onStartTest={handleStartTest}
          />
        );
    }
  };

  return (
    <AudioProvider>
      <TooltipProvider>
        <Toaster />
        <AudioControls />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-indigo-950">
          <div className="container mx-auto p-4">
            {renderCurrentView()}
          </div>
        </div>
      </TooltipProvider>
    </AudioProvider>
  );
}

export default App;
