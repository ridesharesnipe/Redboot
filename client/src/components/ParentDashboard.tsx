import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { photoStorage, type Photo } from '@/lib/photoStorage';
import { Upload, Compass, Ship, Crown, Skull, Clock, Scroll, Anchor, MapPin, Star, HelpCircle, Image, Trash2, RefreshCw, ArrowLeft, Gem, Sun, Moon, Shield } from 'lucide-react';
import redBootImage from "@assets/unnamed (2)_1758652426094.png";
import { useLocation } from "wouter";
import { useTheme } from "@/contexts/ThemeContext";

interface ParentDashboardProps {
  onTakePhoto: () => void;
  onViewPractice: () => void;
  onStartTest: () => void;
  onViewGuide: () => void;
}

export default function ParentDashboard({ onTakePhoto, onViewPractice, onStartTest, onViewGuide }: ParentDashboardProps) {
  const [, setLocation] = useLocation();
  const { theme, toggleTheme } = useTheme();
  const [stats, setStats] = useState<{
    totalWords: number;
    newWords: number;
    learningWords: number;
    masteredWords: number;
    troubleWords: number;
    daysThisWeek: boolean[];
    readyForTest: boolean;
    treasureCount: number;
  } | null>(null);

  // Week detection state
  const [showNewWeekPrompt, setShowNewWeekPrompt] = useState(false);

  const [weekData, setWeekData] = useState<{
    words: string[];
    practiceData: { [word: string]: any };
    weekStart: Date;
    practiceHistory: any[];
  } | null>(null);

  const [photos, setPhotos] = useState<Photo[]>([]);
  const [showPhotoHistory, setShowPhotoHistory] = useState(false);
  const [storageSize, setStorageSize] = useState<string>('');
  const [replacingPhotoId, setReplacingPhotoId] = useState<string | null>(null);
  
  // Fetch word lists and progress from database
  const { data: wordLists } = useQuery({
    queryKey: ['/api/word-lists'],
  });
  
  const { data: progressRecords } = useQuery({
    queryKey: ['/api/progress'],
  });
  
  // Fetch tricky words for treasure adventure tracking
  const { data: trickyWords } = useQuery<any[]>({
    queryKey: ['/api/tricky-words'],
  });
  
  // Fetch user achievements
  const { data: achievementData } = useQuery<{ earned: any[]; all: any[] }>({
    queryKey: ['/api/achievements/user'],
  });

  const checkIfNewWeek = () => {
    let savedDate: string | undefined;

    const saved = localStorage.getItem('currentSpellingWords');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        savedDate = data.savedDate;
      } catch (e) {}
    }

    if (!savedDate && wordLists && Array.isArray(wordLists) && wordLists.length > 0) {
      savedDate = wordLists[0].createdDate;
    }

    if (!savedDate) return true;
    
    const lastDate = new Date(savedDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
    
    return daysSince >= 7;
  };

  const getTodaysPracticeData = () => {
    if (!progressRecords || !Array.isArray(progressRecords)) {
      return { wordsToday: 0, correctToday: 0, treasuresEarned: 0 };
    }

    const activeChildId = wordLists && Array.isArray(wordLists) && wordLists.length > 0
      ? wordLists[0].childId
      : null;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const todaysSessions = progressRecords.filter((p: any) => {
      if (!p.completedAt) return false;
      if (activeChildId && p.childId !== activeChildId) return false;
      const sessionDate = new Date(p.completedAt);
      return sessionDate >= today && sessionDate < tomorrow;
    });

    let wordsToday = 0;
    let correctToday = 0;
    let treasuresEarned = 0;

    todaysSessions.forEach((session: any) => {
      const correct = session.correctWords?.length || 0;
      const incorrect = session.incorrectWords?.length || 0;
      wordsToday += correct + incorrect;
      correctToday += correct;
      treasuresEarned += correct;
    });

    return { wordsToday, correctToday, treasuresEarned };
  };

  const checkWeekStatus = () => {
    if (checkIfNewWeek()) {
      setShowNewWeekPrompt(true);
    } else {
      let words: string[] | undefined;
      let savedDate: string | undefined;
      
      if (wordLists && Array.isArray(wordLists) && wordLists.length > 0) {
        const mostRecentList = wordLists[0];
        words = mostRecentList.words;
        savedDate = mostRecentList.createdDate || new Date().toISOString();
      } else {
        const saved = localStorage.getItem('currentSpellingWords');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            words = data.words;
            savedDate = data.savedDate;
          } catch (e) {}
        }
      }
      
      if (words && words.length > 0) {
        let realStats = {
          totalWords: words.length,
          newWords: 0,
          learningWords: 0, 
          masteredWords: 0,
          troubleWords: 0,
          daysThisWeek: [false, false, false, false, false] as boolean[],
          readyForTest: false,
          treasureCount: 0
        };
        
        const allRecords = Array.isArray(progressRecords) ? progressRecords : [];
        const activeChildId = wordLists && Array.isArray(wordLists) && wordLists.length > 0
          ? wordLists[0].childId
          : null;
        const records = activeChildId
          ? allRecords.filter((p: any) => p.childId === activeChildId)
          : allRecords;

        const sortedRecords = [...records].sort((a: any, b: any) => {
          const dateA = a.completedAt ? new Date(a.completedAt).getTime() : 0;
          const dateB = b.completedAt ? new Date(b.completedAt).getTime() : 0;
          return dateA - dateB;
        });

        const wordStreaks: Record<string, { streak: number; wasMastered: boolean; total: number }> = {};
        sortedRecords.forEach((p: any) => {
          (p.correctWords || []).forEach((w: string) => {
            const key = w.toLowerCase();
            if (!wordStreaks[key]) wordStreaks[key] = { streak: 0, wasMastered: false, total: 0 };
            wordStreaks[key].streak++;
            wordStreaks[key].total++;
            if (wordStreaks[key].streak >= 2) {
              wordStreaks[key].wasMastered = true;
            }
          });
          (p.incorrectWords || []).forEach((w: string) => {
            const key = w.toLowerCase();
            if (!wordStreaks[key]) wordStreaks[key] = { streak: 0, wasMastered: false, total: 0 };
            wordStreaks[key].streak = 0;
            wordStreaks[key].total++;
          });
        });

        words.forEach((word: string) => {
          const ws = wordStreaks[word.toLowerCase()];
          if (!ws || ws.total === 0) {
            realStats.newWords++;
          } else if (ws.streak >= 2) {
            realStats.masteredWords++;
            realStats.treasureCount += 3;
          } else if (ws.wasMastered && ws.streak < 2) {
            realStats.troubleWords++;
          } else if (ws.total >= 1) {
            realStats.learningWords++;
            realStats.treasureCount += 1;
          } else {
            realStats.troubleWords++;
          }
        });

        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        const thisWeekDays = [false, false, false, false, false];
        records.forEach((p: any) => {
          if (p.completedAt) {
            const sessionDate = new Date(p.completedAt);
            if (sessionDate >= oneWeekAgo) {
              const dayOfWeek = sessionDate.getDay();
              if (dayOfWeek >= 1 && dayOfWeek <= 5) {
                thisWeekDays[dayOfWeek - 1] = true;
              }
            }
          }
        });
        realStats.daysThisWeek = thisWeekDays;

        const masteryRate = realStats.totalWords > 0 ? realStats.masteredWords / realStats.totalWords : 0;
        realStats.readyForTest = masteryRate >= 0.7;
        
        setStats(realStats);
        
        setWeekData({
          words: words || [],
          practiceData: {},
          weekStart: new Date(savedDate || Date.now()),
          practiceHistory: []
        });
      }
    }
  };

  useEffect(() => {
    try {
      checkWeekStatus();
      loadPhotos();
      loadStorageSize();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, [wordLists, progressRecords]);

  const loadPhotos = async () => {
    try {
      const allPhotos = await photoStorage.getAllPhotos();
      setPhotos(allPhotos);
    } catch (error) {
      console.error('Error loading photos:', error);
    }
  };

  const loadStorageSize = async () => {
    try {
      const size = await photoStorage.getStorageSizeFormatted();
      setStorageSize(size);
    } catch (error) {
      console.error('Error loading storage size:', error);
    }
  };

  const deletePhoto = async (photoId: string) => {
    try {
      await photoStorage.deletePhoto(photoId);
      await loadPhotos();
      await loadStorageSize();
    } catch (error) {
      console.error('Error deleting photo:', error);
    }
  };

  const replacePhoto = (photoId: string) => {
    setReplacingPhotoId(photoId);
    // Create a hidden file input and trigger it
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = handlePhotoReplacement;
    input.click();
  };

  const handlePhotoReplacement = async (event: Event) => {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file || !replacingPhotoId) return;

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onload = async (e) => {
        const imageData = e.target?.result as string;
        
        // Process the new image with OCR
        const { default: Tesseract } = await import('tesseract.js');
        
        const { data: { text } } = await Tesseract.recognize(imageData, 'eng', {
          logger: m => console.log(m)
        });

        // Extract words from OCR text
        const words = text
          .split(/[\n\r\s,]+/)
          .map(word => word.replace(/[^\w]/g, '').toLowerCase())
          .filter(word => word.length > 1 && word.length < 20)
          .filter((word, index, arr) => arr.indexOf(word) === index); // Remove duplicates

        // Get the current week start
        const getWeekStart = (date: Date = new Date()): Date => {
          const d = new Date(date);
          const day = d.getDay();
          const diff = d.getDate() - day;
          return new Date(d.setDate(diff));
        };

        // Delete old photo and save new one
        await photoStorage.deletePhoto(replacingPhotoId);
        await photoStorage.savePhoto({
          imageData,
          extractedWords: words,
          wordsCount: words.length,
          capturedAt: new Date(),
          weekStart: getWeekStart()
        });

        // Refresh photos and reset state
        await loadPhotos();
        await loadStorageSize();
        setReplacingPhotoId(null);
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Error replacing photo:', error);
      setReplacingPhotoId(null);
    }
  };

  // Refresh stats (useful for parent to check progress)
  const refreshStats = () => {
    try {
      checkWeekStatus();
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const getWordStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-slate-500 border-slate-600';
      case 'learning': return 'bg-amber-500 border-amber-600';
      case 'mastered': return 'bg-emerald-500 border-emerald-600';
      case 'trouble': return 'bg-red-500 border-red-600';
      default: return 'bg-slate-500 border-slate-600';
    }
  };

  const getWordStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <MapPin className="w-6 h-6 text-white" />;
      case 'learning': return <Compass className="w-6 h-6 text-white" />;
      case 'mastered': return <Crown className="w-6 h-6 text-white" />;
      case 'trouble': return <Skull className="w-6 h-6 text-white" />;
      default: return <MapPin className="w-6 h-6 text-white" />;
    }
  };

  const getWordStatusText = (status: string): string => {
    switch (status) {
      case 'new': return 'New Words';
      case 'learning': return 'Learning';
      case 'mastered': return 'Great Job!';
      case 'trouble': return 'Keep Practicing';
      default: return 'Unknown';
    }
  };

  const getWordStatusDescription = (status: string): string => {
    switch (status) {
      case 'new': return 'Ready to learn!';
      case 'learning': return 'Getting better!';
      case 'mastered': return 'You got it!';
      case 'trouble': return 'Try again!';
      default: return 'Unknown';
    }
  };

  const getDayName = (index: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days[index] || '';
  };

  const getWeekProgress = (): number => {
    if (!stats) return 0;
    const completedWords = stats.learningWords + stats.masteredWords;
    return stats.totalWords > 0 ? (completedWords / stats.totalWords) * 100 : 0;
  };

  const getReadinessMessage = (): { message: string; color: string; icon: any } => {
    if (!stats) return { message: 'Loading the ship\'s log...', color: 'text-gray-500', icon: Ship };
    
    const weekProgress = getWeekProgress();
    const today = new Date().getDay(); // 0 = Sunday, 5 = Friday
    
    if (stats.totalWords === 0) {
      return { 
        message: 'Chart your course! Add spelling treasures to begin the adventure!', 
        color: 'text-blue-600',
        icon: MapPin
      };
    }
    
    if (today === 5) { // Friday
      return stats.readyForTest 
        ? { message: 'Ahoy! Ready to plunder the Friday treasure test!', color: 'text-green-600', icon: Crown }
        : { message: 'Batten down the hatches! More practice needed, sailor!', color: 'text-yellow-600', icon: Compass };
    }
    
    if (weekProgress >= 80) {
      return { message: 'Shiver me timbers! Ye be sailing like a true pirate captain!', color: 'text-green-600', icon: Crown };
    } else if (weekProgress >= 60) {
      return { message: 'Steady as she goes! Keep charting that course, matey!', color: 'text-blue-600', icon: Ship };
    } else if (weekProgress >= 40) {
      return { message: 'All hands on deck! More adventure awaits!', color: 'text-yellow-600', icon: Compass };
    } else {
      return { message: 'Welcome aboard, young sailor! The adventure begins!', color: 'text-orange-600', icon: Anchor };
    }
  };

  // Show new week prompt if needed
  if (showNewWeekPrompt) {
    return (
      <div className="min-h-screen bg-white text-center px-4 py-8">
        <Card className="max-w-2xl mx-auto bg-gradient-to-br from-amber-100 to-yellow-100 border-4 border-amber-300">
          <CardContent className="p-8">
            <div className="text-6xl mb-4">🗓️</div>
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
              Ahoy! New Week Ahead!
            </h2>
            <p className="text-lg text-amber-800 mb-6">
              Time to chart new waters, matey! Upload this week's spelling treasure map to continue your adventure.
            </p>
            <div className="flex flex-col gap-3 items-center mt-6">
              <Button 
                onClick={() => {
                  onTakePhoto();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 w-full max-w-md"
                data-testid="button-upload-new-week"
              >
                📤 Upload New Week's Words
              </Button>
              <Button 
                onClick={() => {
                  // Populate default data FIRST, then dismiss prompt to avoid race condition
                  const saved = localStorage.getItem('currentSpellingWords');
                  if (saved) {
                    try {
                      const { words, savedDate } = JSON.parse(saved);
                      
                      // If words exist, load them and go to dashboard
                      if (words && words.length > 0) {
                        const newStats = {
                          totalWords: words.length,
                          newWords: words.length,
                          learningWords: 0, 
                          masteredWords: 0,
                          troubleWords: 0,
                          daysThisWeek: [false, false, false, false, false],
                          readyForTest: false,
                          treasureCount: 0
                        };
                        const newWeekData = {
                          words: words,
                          practiceData: {},
                          weekStart: new Date(savedDate || Date.now()),
                          practiceHistory: []
                        };
                        
                        // Set both states, then dismiss prompt
                        setStats(newStats);
                        setWeekData(newWeekData);
                        setShowNewWeekPrompt(false);
                      } else {
                        // No words in saved data - go to upload page instead
                        onTakePhoto();
                      }
                    } catch (e) {
                      // Parse failed - go to upload page
                      onTakePhoto();
                    }
                  } else {
                    // No saved data - go to upload page
                    onTakePhoto();
                  }
                }}
                variant="outline"
                className="w-full max-w-md"
                data-testid="button-continue-current-week"
              >
                Continue Current Week
              </Button>
            </div>
          </CardContent>
        </Card>
        
        {/* Red Boot Character Image - Outside the yellow box */}
        <div className="flex justify-center mt-6">
          <img 
            src={redBootImage} 
            alt="Red Boot the Pirate"
            className="w-56 h-56 sm:w-72 sm:h-72 md:w-96 md:h-96 lg:w-[28rem] lg:h-[28rem] object-contain drop-shadow-xl"
          />
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900 to-indigo-800 border-2 border-amber-400">
        <CardContent className="p-8 text-center">
          <Ship className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-amber-100" style={{ fontFamily: 'var(--font-pirate)' }}>Loading Red Boot's ship log...</p>
        </CardContent>
      </Card>
    );
  }

  const readinessInfo = getReadinessMessage();
  const weekProgress = getWeekProgress();
  const todayData = getTodaysPracticeData();

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-6">
      <div className="aurora-content">
        {/* Header with navigation */}
        <div className="max-w-6xl mx-auto mb-6 flex flex-wrap gap-3 items-center">
          <Button
            onClick={() => window.location.href = '/'}
            className="clay-button clay-button-primary px-5 py-3 flex items-center gap-2 micro-bounce"
            data-testid="button-back-to-home"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Home
          </Button>
          <Button
            onClick={() => {
              localStorage.removeItem('redboot-onboarding-complete');
              window.location.href = '/';
            }}
            className="clay-button clay-button-accent px-5 py-3 flex items-center gap-2 micro-bounce"
            data-testid="button-update-child-info"
          >
            <Scroll className="w-5 h-5" />
            Update Child Info
          </Button>
          
          <div className="ml-auto flex items-center gap-2">
            <Button
              onClick={toggleTheme}
              className="clay-button px-4 py-3 flex items-center gap-2 micro-bounce bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
              data-testid="button-toggle-theme"
              title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
              <span className="hidden sm:inline">{theme === 'light' ? 'Dark' : 'Light'}</span>
            </Button>
          </div>
        </div>
        
        {/* Main Bento Grid Layout */}
        <div className="max-w-6xl mx-auto">
          <div className="bento-grid">
            
            {/* Hero Card - Week Status (spans 4 columns) */}
            <div className="bento-span-4 clay-card slide-up-enter stagger-1 p-6 md:p-8 bento-hover-float">
              <div className="text-center">
                <h1 className="text-3xl md:text-5xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
                  ⚓ Week of {weekData?.weekStart?.toLocaleDateString() || 'Current Week'} ⚓
                </h1>
                
                {stats?.totalWords ? (
                  <div className="mb-6">
                    <div className="text-xl sm:text-2xl md:text-3xl mb-2 text-green-700 font-bold">✅ {stats.totalWords} words uploaded!</div>
                    <p className="text-gray-600 text-base sm:text-lg">Ready for spelling practice!</p>
                  </div>
                ) : (
                  <div className="mb-6">
                    <div className="text-xl sm:text-2xl md:text-3xl mb-2 text-amber-600 font-bold">📸 Time for new words!</div>
                    <p className="text-gray-600 text-base sm:text-lg px-2">Upload this week's spelling list to start your adventure!</p>
                  </div>
                )}

                <div className="flex flex-wrap gap-3 sm:gap-4 justify-center px-2">
                  {stats?.totalWords ? (
                    <>
                      <Button 
                        onClick={onViewPractice}
                        className="clay-button px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl sparkle-hover pulse-glow-success"
                        data-testid="button-practice-now"
                      >
                        🚀 Practice Now!
                      </Button>
                      <Button 
                        onClick={() => setLocation('/vault')}
                        className="clay-button clay-button-accent px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl sparkle-hover pulse-glow-gold"
                        data-testid="button-treasure-vault"
                      >
                        <Gem className="w-5 h-5 sm:w-6 sm:h-6 inline mr-1 sm:mr-2" />
                        Treasure Vault
                      </Button>
                      {stats?.readyForTest && new Date().getDay() === 5 && (
                        <Button 
                          onClick={onStartTest}
                          className="clay-button px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl sparkle-hover pulse-glow bg-gradient-to-r from-purple-500 to-pink-500"
                          data-testid="button-take-test"
                        >
                          👑 Take Test!
                        </Button>
                      )}
                    </>
                  ) : (
                    <>
                      <Button 
                        onClick={onTakePhoto}
                        className="clay-button clay-button-primary px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl sparkle-hover pulse-glow"
                        data-testid="button-upload-words"
                      >
                        📸 Upload Words
                      </Button>
                      <Button 
                        onClick={() => setLocation('/vault')}
                        className="clay-button clay-button-accent px-4 sm:px-8 py-3 sm:py-4 text-base sm:text-xl sparkle-hover"
                        data-testid="button-treasure-vault"
                      >
                        <Gem className="w-5 h-5 sm:w-6 sm:h-6 inline mr-1 sm:mr-2" />
                        Treasure Vault
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Today's Progress Card (spans 2 columns) */}
            {stats?.totalWords ? (
              <div className="bento-span-2 bento-row-2 clay-card slide-up-enter stagger-2 p-6 bento-hover-float bento-hover-green">
                <div className="text-center h-full flex flex-col justify-between">
                  <div>
                    <div className="text-4xl mb-3 icon-bounce inline-block">⛵</div>
                    <h2 className="text-xl md:text-2xl font-bold mb-2 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
                      Today's Journey
                    </h2>
                    {todayData.wordsToday > 0 ? (
                      <>
                        <p className="text-3xl md:text-4xl font-bold text-green-600 mb-2">
                          {todayData.correctToday}/{todayData.wordsToday}
                        </p>
                        <p className="text-gray-600">
                          {todayData.correctToday === todayData.wordsToday 
                            ? "Perfect spelling today! 🌟" 
                            : todayData.correctToday > todayData.wordsToday / 2
                            ? "Great job practicing! 🚀"
                            : "Keep practicing! 💪"
                          }
                        </p>
                      </>
                    ) : (
                      <p className="text-lg text-gray-500">Start practicing to begin your journey!</p>
                    )}
                  </div>
                  
                  <div className="mt-4">
                    <div className="relative h-4 bg-blue-100 rounded-full overflow-hidden">
                      <div 
                        className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-400 to-green-500 rounded-full transition-all duration-500"
                        style={{ width: `${todayData.wordsToday > 0 ? Math.round((todayData.correctToday / Math.max(todayData.wordsToday, 1)) * 100) : 0}%` }}
                      />
                    </div>
                    <p className="text-sm text-gray-500 mt-2">
                      {todayData.wordsToday > 0 ? `${Math.round((todayData.correctToday / Math.max(todayData.wordsToday, 1)) * 100)}% correct` : 'No practice yet'}
                    </p>
                  </div>
                </div>
              </div>
            ) : null}

            {/* Treasures Card (spans 2 columns) */}
            <div className="bento-span-2 bento-row-2 clay-card slide-up-enter stagger-3 p-6 bg-gradient-to-br from-amber-50 to-yellow-100 bento-hover-float bento-hover-gold">
              <div className="text-center h-full flex flex-col justify-between">
                <div>
                  <div className="text-4xl mb-3 icon-bounce inline-block">💎</div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 text-amber-800" style={{ fontFamily: 'var(--font-pirate)' }}>
                    Treasures Today
                  </h2>
                </div>
                
                <div className="flex flex-wrap justify-center gap-2 my-4">
                  {todayData.treasuresEarned > 0 ? (
                    Array.from({ length: Math.min(todayData.treasuresEarned, 8) }).map((_, i) => (
                      <span key={i} className="text-3xl treasure-sparkle treasure-glow animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                        {['🪙', '💚', '❤️', '💎', '⭐', '👑', '🏆', '✨'][i % 8]}
                      </span>
                    ))
                  ) : (
                    <p className="text-gray-500">Spell words correctly to earn treasures!</p>
                  )}
                </div>
                
                {todayData.treasuresEarned > 8 && (
                  <p className="text-amber-700 font-bold">
                    +{todayData.treasuresEarned - 8} more! 🎉
                  </p>
                )}
                
                <Button 
                  onClick={() => setLocation('/vault')}
                  className="clay-button clay-button-accent px-6 py-3 text-lg mt-2 micro-bounce"
                  data-testid="button-view-vault"
                >
                  View Vault 💰
                </Button>
              </div>
            </div>

            {/* Tricky Treasures Card - Words that need extra practice */}
            {trickyWords && trickyWords.length > 0 && (
              <div className="bento-span-2 clay-card slide-up-enter stagger-4 p-6 bg-gradient-to-br from-purple-50 to-pink-100 bento-hover-float bento-hover-purple">
                <div className="text-center h-full flex flex-col">
                  <div className="text-4xl mb-3">⚡</div>
                  <h2 className="text-xl md:text-2xl font-bold mb-2 text-purple-800" style={{ fontFamily: 'var(--font-pirate)' }}>
                    Tricky Treasures
                  </h2>
                  <p className="text-sm text-purple-600 mb-3">
                    {trickyWords.filter((w: any) => w.status === 'active').length} words need extra practice!
                  </p>
                  
                  <div className="flex flex-wrap justify-center gap-1 my-2 max-h-20 overflow-hidden">
                    {trickyWords.filter((w: any) => w.status === 'active').slice(0, 5).map((word: any, i: number) => (
                      <span 
                        key={word.id} 
                        className="px-2 py-1 bg-purple-200 text-purple-800 rounded-full text-sm font-medium"
                        data-testid={`tricky-word-${i}`}
                      >
                        {word.word}
                      </span>
                    ))}
                    {trickyWords.filter((w: any) => w.status === 'active').length > 5 && (
                      <span className="px-2 py-1 bg-purple-300 text-purple-800 rounded-full text-sm font-bold">
                        +{trickyWords.filter((w: any) => w.status === 'active').length - 5}
                      </span>
                    )}
                  </div>
                  
                  {trickyWords.filter((w: any) => w.status === 'mastered').length > 0 && (
                    <div className="mt-2 text-sm text-green-600">
                      ✨ {trickyWords.filter((w: any) => w.status === 'mastered').length} mastered!
                    </div>
                  )}
                  
                  <Button 
                    onClick={onViewPractice}
                    className="clay-button clay-button-primary px-4 py-2 text-sm mt-auto micro-bounce"
                    data-testid="button-practice-tricky"
                  >
                    ⚡ Practice Now
                  </Button>
                </div>
              </div>
            )}

            {/* Achievement Badges Card */}
            <div className="bento-span-2 clay-card slide-up-enter stagger-5 p-6 bg-gradient-to-br from-indigo-50 to-blue-100 bento-hover-float">
              <div className="text-center h-full flex flex-col">
                <div className="text-4xl mb-3">🏅</div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-indigo-800" style={{ fontFamily: 'var(--font-pirate)' }}>
                  Pirate Badges
                </h2>
                
                {achievementData?.earned && achievementData.earned.length > 0 ? (
                  <>
                    <p className="text-sm text-indigo-600 mb-3">
                      {achievementData.earned.length} of {achievementData.all?.length || 0} badges earned!
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 my-2">
                      {achievementData.earned.slice(0, 4).map((ua: any, i: number) => (
                        <div 
                          key={ua.id} 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-yellow-300 to-amber-400 flex items-center justify-center shadow-lg"
                          title={ua.achievement?.title || 'Badge'}
                          data-testid={`badge-${i}`}
                        >
                          <span className="text-2xl">{ua.achievement?.icon || '🏅'}</span>
                        </div>
                      ))}
                      {achievementData.earned.length > 4 && (
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-300 to-gray-400 flex items-center justify-center shadow-lg">
                          <span className="text-sm font-bold text-gray-700">+{achievementData.earned.length - 4}</span>
                        </div>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      Latest: {achievementData.earned[0]?.achievement?.title || 'Badge'}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-sm text-indigo-600 mb-3">
                      Complete adventures to earn badges!
                    </p>
                    
                    <div className="flex flex-wrap justify-center gap-2 my-2">
                      {achievementData?.all?.slice(0, 4).map((a: any, i: number) => (
                        <div 
                          key={a.id} 
                          className="w-12 h-12 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center shadow-lg opacity-50"
                          title={`${a.title} - ${a.description}`}
                          data-testid={`badge-locked-${i}`}
                        >
                          <span className="text-2xl grayscale">{a.icon || '🏅'}</span>
                        </div>
                      ))}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-2">
                      {achievementData?.all?.length || 0} badges to discover!
                    </p>
                  </>
                )}
                
                <Button 
                  onClick={() => setLocation('/badges')}
                  className="clay-button clay-button-primary px-4 py-2 text-sm mt-auto micro-bounce"
                  data-testid="button-view-badges"
                >
                  🏅 View All Badges
                </Button>
              </div>
            </div>

            {/* Parent Insights Card */}
            <div className="bento-span-2 clay-card slide-up-enter stagger-6 p-6 bg-gradient-to-br from-slate-50 to-gray-100 bento-hover-float">
              <div className="text-center h-full flex flex-col">
                <div className="text-4xl mb-3">📊</div>
                <h2 className="text-xl md:text-2xl font-bold mb-2 text-gray-800" style={{ fontFamily: 'var(--font-pirate)' }}>
                  Parent Insights
                </h2>
                
                <p className="text-sm text-gray-600 mb-3">
                  View detailed progress analytics, charts, and learning trends
                </p>
                
                <div className="flex items-center justify-center gap-4 my-3 text-sm text-gray-500">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-green-400 rounded-full"></span>
                    <span>Accuracy</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-400 rounded-full"></span>
                    <span>Progress</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                    <span>Activity</span>
                  </div>
                </div>
                
                <Button 
                  onClick={() => setLocation('/analytics')}
                  className="clay-button px-6 py-3 text-sm mt-auto bg-gray-900 text-white hover:bg-gray-800 micro-bounce"
                  data-testid="button-view-analytics"
                >
                  📊 View Insights
                </Button>
              </div>
            </div>

            {/* Weekly Schedule Cards */}
            {stats?.totalWords ? (
              <>
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, index) => {
                  const practiced = stats?.daysThisWeek?.[index] || false;
                  const isToday = new Date().getDay() === (index + 1);
                  const isFriday = index === 4;
                  const isFuture = new Date().getDay() < (index + 1);
                  
                  let cardStyle = "clay-card slide-up-enter p-4 text-center";
                  let bgStyle = "";
                  let textColor = "text-gray-800";
                  
                  if (practiced) {
                    bgStyle = "bg-gradient-to-br from-green-100 to-emerald-100";
                    textColor = "text-green-800";
                  } else if (isToday) {
                    bgStyle = "bg-gradient-to-br from-yellow-100 to-amber-100";
                    textColor = "text-amber-800";
                  } else if (isFuture) {
                    bgStyle = "bg-gradient-to-br from-gray-50 to-gray-100";
                    textColor = "text-gray-400";
                  } else if (isFriday) {
                    bgStyle = "bg-gradient-to-br from-purple-100 to-pink-100";
                    textColor = "text-purple-800";
                  } else {
                    bgStyle = "bg-gradient-to-br from-blue-50 to-blue-100";
                    textColor = "text-blue-800";
                  }
                  
                  return (
                    <div 
                      key={day} 
                      className={`${cardStyle} stagger-${index + 1} ${bgStyle} ${isToday ? 'pulse-glow-gold' : ''}`}
                    >
                      <div className={`text-2xl mb-2 ${practiced ? 'icon-bounce' : ''}`}>
                        {practiced ? '✅' : isToday ? '👆' : isFriday ? '👑' : isFuture ? '⏳' : '📚'}
                      </div>
                      <div className={`text-lg font-bold ${textColor}`}>{day}</div>
                      <div className={`text-sm ${textColor} opacity-80`}>
                        {practiced 
                          ? 'Done!' 
                          : isToday 
                          ? 'Today!'
                          : isFriday 
                          ? 'Test'
                          : isFuture 
                          ? 'Soon'
                          : 'Ready'
                        }
                      </div>
                      {isToday && !practiced && (
                        <Button 
                          onClick={onViewPractice}
                          className="clay-button px-3 py-1 text-sm mt-2 micro-bounce"
                          data-testid={`button-start-${day.toLowerCase()}`}
                        >
                          Start! 🚀
                        </Button>
                      )}
                      {isFriday && stats?.readyForTest && (
                        <Button 
                          onClick={onStartTest}
                          className="clay-button px-3 py-1 text-sm mt-2 micro-bounce bg-gradient-to-r from-purple-400 to-pink-400"
                          data-testid={`button-test-${day.toLowerCase()}`}
                        >
                          Test! 👑
                        </Button>
                      )}
                    </div>
                  );
                })}
              </>
            ) : null}

            {/* Help & Settings Card */}
            <div className="bento-span-4 clay-card slide-up-enter stagger-6 p-4">
              <div className="flex flex-wrap gap-3 justify-center items-center">
                <Button 
                  onClick={onViewGuide}
                  className="clay-button clay-button-primary px-6 py-3 flex items-center gap-2 micro-bounce"
                  data-testid="button-view-guide"
                >
                  <HelpCircle className="w-5 h-5" />
                  Need Help?
                </Button>
                
                {stats?.totalWords && (
                  <Button 
                    onClick={() => {
                      if (window.confirm('Are you sure you want to clear all words and start fresh? This will delete all progress for this week.')) {
                        localStorage.removeItem('currentSpellingWords');
                        localStorage.removeItem('spellingProgress');
                        localStorage.removeItem('weeklyStats');
                        window.location.reload();
                      }
                    }}
                    variant="outline"
                    className="px-6 py-3 rounded-xl bg-red-100 text-red-700 hover:bg-red-200 transition-colors flex items-center gap-2"
                    data-testid="button-clear-words"
                  >
                    <Trash2 className="w-5 h-5" />
                    Clear Words
                  </Button>
                )}

                <Button
                  onClick={() => setLocation("/privacy")}
                  variant="outline"
                  className="px-6 py-3 rounded-xl bg-gray-50 text-gray-600 hover:bg-gray-100 dark:bg-gray-700 dark:text-gray-300 dark:hover:bg-gray-600 transition-colors flex items-center gap-2"
                  data-testid="button-privacy-policy"
                >
                  <Shield className="w-5 h-5" />
                  Privacy Policy
                </Button>
              </div>
            </div>

          </div>
        </div>

        {/* No words state - show prompt to upload */}
        {!stats?.totalWords && (
          <div className="max-w-6xl mx-auto mt-8">
            <div className="clay-card p-8 text-center slide-up-enter">
              <h2 className="text-3xl font-bold mb-4 text-amber-700" style={{ fontFamily: 'var(--font-pirate)' }}>
                Ready to start your spelling adventure?
              </h2>
              <p className="text-xl text-gray-600 mb-6">
                Upload your spelling words to begin collecting treasures! 📸✨
              </p>
              <div className="text-6xl mb-4">🏴‍☠️</div>
              <p className="text-lg text-gray-500">
                Red Boot is waiting for you to start the adventure!
              </p>
            </div>
          </div>
        )}


      </div>
    </div>
  );
}