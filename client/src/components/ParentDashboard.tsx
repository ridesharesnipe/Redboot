import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { photoStorage, type Photo } from '@/lib/photoStorage';
import { Upload, Compass, Ship, Crown, Skull, Clock, Scroll, Anchor, MapPin, Star, HelpCircle, Image, Trash2, RefreshCw, ArrowLeft, Gem } from 'lucide-react';
import redBootImage from "@assets/unnamed (2)_1758652426094.png";
import { useLocation } from "wouter";

interface ParentDashboardProps {
  onTakePhoto: () => void;
  onViewPractice: () => void;
  onStartTest: () => void;
  onViewGuide: () => void;
}

export default function ParentDashboard({ onTakePhoto, onViewPractice, onStartTest, onViewGuide }: ParentDashboardProps) {
  const [, setLocation] = useLocation();
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

  // Check if new week detection is needed
  const checkIfNewWeek = () => {
    const saved = localStorage.getItem('currentSpellingWords');
    if (!saved) return true;
    
    try {
      const { savedDate } = JSON.parse(saved);
      if (!savedDate) return true;
      
      const lastDate = new Date(savedDate);
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return daysSince >= 7; // New week if 7+ days
    } catch (e) {
      return true;
    }
  };

  // Calculate today's actual practice data
  const getTodaysPracticeData = () => {
    const practiceProgress = localStorage.getItem('practiceProgress');
    if (!practiceProgress) return { wordsToday: 0, correctToday: 0, treasuresEarned: 0 };
    
    try {
      const progressData = JSON.parse(practiceProgress);
      const practiceHistory = progressData._practiceHistory || [];
      
      // Get today's date (start of day)
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      // Filter sessions to today only
      const todaysSessions = practiceHistory.filter((session: any) => {
        if (!session.date) return false;
        const sessionDate = new Date(session.date);
        return sessionDate >= today && sessionDate < tomorrow;
      });
      
      let wordsToday = 0;
      let correctToday = 0;
      let treasuresEarned = 0;
      
      // Count today's practice
      todaysSessions.forEach((session: any) => {
        if (session.wordsPracticed) {
          wordsToday += session.wordsPracticed.length;
          session.wordsPracticed.forEach((result: any) => {
            if (result.correct) {
              correctToday++;
              treasuresEarned++; // 1 treasure per correct word today
            }
          });
        }
      });
      
      return { wordsToday, correctToday, treasuresEarned };
    } catch (e) {
      console.error('Failed to calculate today practice data:', e);
      return { wordsToday: 0, correctToday: 0, treasuresEarned: 0 };
    }
  };

  const checkWeekStatus = () => {
    if (checkIfNewWeek()) {
      setShowNewWeekPrompt(true);
    } else {
      // Try database first for word lists
      let words: string[] | undefined;
      let savedDate: string | undefined;
      
      if (wordLists && Array.isArray(wordLists) && wordLists.length > 0) {
        const mostRecentList = wordLists[0];
        words = mostRecentList.words;
        savedDate = mostRecentList.createdDate || new Date().toISOString();
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem('currentSpellingWords');
        if (saved) {
          try {
            const data = JSON.parse(saved);
            words = data.words;
            savedDate = data.savedDate;
          } catch (e) {
            // Ignore parse errors
          }
        }
      }
      
      if (words && words.length > 0) {
        // Calculate real progress from practice sessions
        const practiceProgress = localStorage.getItem('practiceProgress');
        let realStats = {
          totalWords: words.length,
          newWords: 0,
          learningWords: 0, 
          masteredWords: 0,
          troubleWords: 0,
          daysThisWeek: [false, false, false, false, false],
          readyForTest: false,
          treasureCount: 0
        };
        
        if (practiceProgress) {
          try {
            const progressData = JSON.parse(practiceProgress);
              
              // Calculate word status based on practice data
              words.forEach((word: string) => {
                const wordProgress = progressData[word.toLowerCase()];
                if (wordProgress) {
                  const { correctCount = 0, totalAttempts = 0 } = wordProgress;
                  const accuracy = totalAttempts > 0 ? correctCount / totalAttempts : 0;
                  
                  if (totalAttempts === 0) {
                    realStats.newWords++;
                  } else if (accuracy >= 0.8 && correctCount >= 3) {
                    realStats.masteredWords++;
                    realStats.treasureCount += 3; // 3 treasure per mastered word
                  } else if (accuracy >= 0.5 && totalAttempts >= 2) {
                    realStats.learningWords++;
                    realStats.treasureCount += 1; // 1 treasure per learning word
                  } else {
                    realStats.troubleWords++;
                  }
                } else {
                  realStats.newWords++;
                }
              });
              
              // Calculate days practiced this week
              const practiceHistory = progressData._practiceHistory || [];
              const oneWeekAgo = new Date();
              oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
              
              const thisWeekDays = [false, false, false, false, false]; // Mon-Fri
              practiceHistory.forEach((session: any) => {
                if (session.date) {
                  const sessionDate = new Date(session.date);
                  if (sessionDate >= oneWeekAgo) {
                    const dayOfWeek = sessionDate.getDay(); // 0=Sunday, 1=Monday
                    if (dayOfWeek >= 1 && dayOfWeek <= 5) { // Monday to Friday
                      thisWeekDays[dayOfWeek - 1] = true;
                    }
                  }
                }
              });
              realStats.daysThisWeek = thisWeekDays;
              
              // Determine readiness for test
              const masteryRate = realStats.totalWords > 0 ? realStats.masteredWords / realStats.totalWords : 0;
              realStats.readyForTest = masteryRate >= 0.7;
              
          } catch (e) {
            console.error('Failed to parse practice progress:', e);
          }
        }
        
        setStats(realStats);
        
        // Set weekData to prevent null reference errors
        setWeekData({
          words: words || [],
          practiceData: {},
          weekStart: new Date(savedDate || Date.now()),
          practiceHistory: []
        });
      }
    }
  };

  // Load stats and photos on component mount
  useEffect(() => {
    try {
      checkWeekStatus();
      loadPhotos();
      loadStorageSize();
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

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
        
        console.log('Photo replaced successfully with', words.length, 'words');
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
      <div className="text-center px-4">
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
                      const newStats = {
                        totalWords: words?.length || 0,
                        newWords: 0,
                        learningWords: 0, 
                        masteredWords: 0,
                        troubleWords: 0,
                        daysThisWeek: [false, false, false, false, false],
                        readyForTest: false,
                        treasureCount: 0
                      };
                      const newWeekData = {
                        words: words || [],
                        practiceData: {},
                        weekStart: new Date(savedDate || Date.now()),
                        practiceHistory: []
                      };
                      
                      // Set both states, then dismiss prompt
                      setStats(newStats);
                      setWeekData(newWeekData);
                      setShowNewWeekPrompt(false);
                    } catch (e) {
                      // Set safe defaults if parse fails
                      const defaultStats = {
                        totalWords: 0,
                        newWords: 0,
                        learningWords: 0, 
                        masteredWords: 0,
                        troubleWords: 0,
                        daysThisWeek: [false, false, false, false, false],
                        readyForTest: false,
                        treasureCount: 0
                      };
                      const defaultWeekData = {
                        words: [],
                        practiceData: {},
                        weekStart: new Date(),
                        practiceHistory: []
                      };
                      
                      setStats(defaultStats);
                      setWeekData(defaultWeekData);
                      setShowNewWeekPrompt(false);
                    }
                  } else {
                    // No saved data - set empty defaults and dismiss prompt
                    const defaultStats = {
                      totalWords: 0,
                      newWords: 0,
                      learningWords: 0, 
                      masteredWords: 0,
                      troubleWords: 0,
                      daysThisWeek: [false, false, false, false, false],
                      readyForTest: false,
                      treasureCount: 0
                    };
                    const defaultWeekData = {
                      words: [],
                      practiceData: {},
                      weekStart: new Date(),
                      practiceHistory: []
                    };
                    
                    setStats(defaultStats);
                    setWeekData(defaultWeekData);
                    setShowNewWeekPrompt(false);
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
            className="w-96 h-96 object-contain drop-shadow-xl"
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

  return (
    <div className="min-h-screen glass-gradient-bg p-6">
      {/* Prominent Back Button */}
      <div className="max-w-4xl mx-auto mb-4">
        <Button
          onClick={() => window.location.href = '/'}
          variant="outline"
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
          data-testid="button-back-to-home"
        >
          <ArrowLeft className="w-5 h-5 mr-2" />
          Back to Home
        </Button>
      </div>
      
      <div className="max-w-4xl mx-auto space-y-8">
      {/* TOP SECTION - Week Status */}
      <Card className="glass-card glass-floating">
        <CardContent className="p-8 text-center">
          <h1 className="text-5xl font-bold mb-6 text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
            ⚓ Week of {weekData?.weekStart?.toLocaleDateString() || 'Current Week'} ⚓
          </h1>
          
          {stats?.totalWords ? (
            <div className="mb-6">
              <div className="text-3xl mb-3 text-white glass-text-glow">✅ {stats.totalWords} words uploaded!</div>
              <p className="text-white/80 text-xl">Ready for spelling practice!</p>
            </div>
          ) : (
            <div className="mb-6">
              <div className="text-3xl mb-3 text-white glass-text-glow">📸 Time for new words!</div>
              <p className="text-white/80 text-xl">Upload this week's spelling list to start your adventure!</p>
            </div>
          )}

          <div className="space-y-4">
            {stats?.totalWords ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  onClick={onViewPractice}
                  className="glass-button-primary glass-button-xl text-white font-bold glass-text-glow w-full sm:w-auto"
                  data-testid="button-practice-now"
                >
                  🚀 Practice Now!
                </Button>
                <Button 
                  onClick={() => setLocation('/vault')}
                  variant="secondary"
                  className="font-bold w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 border-2 border-yellow-600 text-lg px-6 py-6"
                  data-testid="button-treasure-vault"
                >
                  <Gem className="w-5 h-5 mr-2" />
                  Treasure Vault
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Button 
                  onClick={onTakePhoto}
                  className="glass-button-primary glass-button-xl text-white font-bold glass-text-glow w-full sm:w-auto"
                  data-testid="button-upload-words"
                >
                  📸 Upload This Week's Words
                </Button>
                <Button 
                  onClick={() => setLocation('/vault')}
                  variant="secondary"
                  className="font-bold w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 border-2 border-yellow-600 text-lg px-6 py-6"
                  data-testid="button-treasure-vault"
                >
                  <Gem className="w-5 h-5 mr-2" />
                  Treasure Vault
                </Button>
              </div>
            )}
            
            {stats?.totalWords && (
              <div>
                <Button 
                  onClick={() => {
                    if (window.confirm('Are you sure you want to clear all words and start fresh? This will delete all progress for this week.')) {
                      // Clear all stored data
                      localStorage.removeItem('currentSpellingWords');
                      localStorage.removeItem('spellingProgress');
                      localStorage.removeItem('weeklyStats');
                      // Refresh the page to reset
                      window.location.reload();
                    }
                  }}
                  variant="outline"
                  className="bg-red-500/20 hover:bg-red-500/30 text-white border-red-400 hover:border-red-300"
                  data-testid="button-clear-words"
                >
                  <Trash2 className="w-4 h-4 mr-2" />
                  Clear All Words & Start Fresh
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* MIDDLE SECTION - Today's Progress (BIG and VISUAL) */}
      {stats?.totalWords ? (
        <Card className="glass-card glass-floating">
          <CardContent className="p-8 text-center">
            {(() => {
              const todayData = getTodaysPracticeData();
              return (
                <>
                  <div className="mb-6">
                    {todayData.wordsToday > 0 ? (
                      <>
                        <h2 className="text-5xl font-bold mb-4 text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
                          You spelled {todayData.correctToday} out of {todayData.wordsToday} words today!
                        </h2>
                        <p className="text-2xl text-white/80">
                          {todayData.correctToday === todayData.wordsToday 
                            ? "Perfect spelling today! 🌟" 
                            : todayData.correctToday > todayData.wordsToday / 2
                            ? "Great job practicing! 🚀"
                            : "Keep practicing - you're getting better! 💪"
                          }
                        </p>
                      </>
                    ) : (
                      <>
                        <h2 className="text-5xl font-bold mb-4 text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
                          Ready to practice today?
                        </h2>
                        <p className="text-2xl text-white/80">
                          {stats.totalWords} spelling words are waiting for you! 📚✨
                        </p>
                      </>
                    )}
                  </div>
                  
                  {/* Visual Progress Bar - Daily Progress */}
                  <div className="mb-8">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-xl font-bold">🏴‍☠️</span>
                      <span className="text-xl font-bold">🏝️</span>
                    </div>
                    <div className="relative">
                      {todayData.wordsToday > 0 ? (
                        <>
                          <Progress 
                            value={Math.round((todayData.correctToday / Math.max(todayData.wordsToday, 1)) * 100)} 
                            className="h-8 bg-blue-200"
                          />
                          <div 
                            className="absolute top-0 text-3xl transform -translate-y-1"
                            style={{ 
                              left: `${Math.min(Math.max((todayData.correctToday / Math.max(todayData.wordsToday, 1)) * 100, 5), 95)}%`,
                              transform: 'translateX(-50%) translateY(-10px)'
                            }}
                          >
                            ⛵
                          </div>
                          <p className="text-lg mt-4 text-blue-100">
                            {Math.round((todayData.correctToday / Math.max(todayData.wordsToday, 1)) * 100)}% correct today!
                          </p>
                        </>
                      ) : (
                        <>
                          <Progress value={0} className="h-8 bg-blue-200" />
                          <div className="absolute top-0 left-2 text-3xl transform -translate-y-1">⛵</div>
                          <p className="text-lg mt-4 text-blue-100">Start practicing to begin your journey!</p>
                        </>
                      )}
                    </div>
                  </div>
                  
                  {/* Treasures Collected Today */}
                  <div>
                    <h3 className="text-2xl font-bold mb-4">Treasures Earned Today:</h3>
                    <div className="flex justify-center gap-4 text-4xl">
                      {todayData.treasuresEarned > 0 ? (
                        Array.from({ length: Math.min(todayData.treasuresEarned, 8) }).map((_, i) => (
                          <span key={i} className="animate-bounce" style={{ animationDelay: `${i * 0.1}s` }}>
                            {['🪙', '💚', '❤️', '💎', '⭐', '👑', '🏆', '✨'][i % 8]}
                          </span>
                        ))
                      ) : (
                        <span className="text-2xl text-blue-100">Practice spelling to earn treasures! 🏴‍☠️✨</span>
                      )}
                    </div>
                    {todayData.treasuresEarned > 8 && (
                      <p className="text-xl text-yellow-200 mt-2">
                        +{todayData.treasuresEarned - 8} more treasures! 🎉
                      </p>
                    )}
                  </div>
                </>
              );
            })()}
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-r from-orange-400 to-red-400 text-white shadow-xl">
          <CardContent className="p-8 text-center">
            <h2 className="text-4xl font-bold mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
              Ready to start your spelling adventure?
            </h2>
            <p className="text-2xl text-orange-100 mb-6">
              Upload your spelling words to begin collecting treasures! 📸✨
            </p>
            <div className="text-6xl mb-4">🏴‍☠️</div>
            <p className="text-xl text-orange-100">
              Red Boot is waiting for you to start the adventure!
            </p>
          </CardContent>
        </Card>
      )}


      {/* BOTTOM SECTION - Week Overview (SIMPLE) */}
      {stats?.totalWords ? (
        <Card className="glass-card glass-floating">
          <CardHeader>
            <CardTitle className="text-4xl font-bold text-center text-white glass-text-glow" style={{ fontFamily: 'var(--font-pirate)' }}>
              🏴‍☠️ This Week's Practice 🏴‍☠️
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((day, index) => {
                const practiced = stats?.daysThisWeek?.[index] || false;
                const isToday = new Date().getDay() === (index + 1); // Monday is 1
                const isFriday = index === 4;
                const isFuture = new Date().getDay() < (index + 1);
                
                return (
                  <div 
                    key={day} 
                    className={`flex items-center justify-between p-6 rounded-xl border-2 transition-all ${
                      practiced 
                        ? 'bg-green-100 border-green-400 text-green-800' 
                        : isToday 
                        ? 'bg-yellow-100 border-yellow-400 text-yellow-800 animate-pulse'
                        : isFuture 
                        ? 'bg-gray-100 border-gray-300 text-gray-500'
                        : isFriday
                        ? 'bg-red-100 border-red-400 text-red-800'
                        : 'bg-blue-100 border-blue-300 text-blue-800'
                    }`}
                  >
                    <div className="flex items-center gap-4">
                      <div className={`text-4xl ${
                        practiced 
                          ? '✅'
                          : isToday 
                          ? '👆'
                          : isFriday 
                          ? '👑'
                          : isFuture 
                          ? '⏳'
                          : '📚'
                      }`}>
                        {practiced ? '✅' : isToday ? '👆' : isFriday ? '👑' : isFuture ? '⏳' : '📚'}
                      </div>
                      <div>
                        <div className="text-2xl font-bold">{day}:</div>
                        <div className="text-xl">
                          {practiced 
                            ? `✓ Practiced! (Great job!)` 
                            : isToday 
                            ? 'Practice now!'
                            : isFriday 
                            ? 'Test Day!'
                            : isFuture 
                            ? '[Coming up]'
                            : 'Ready to practice'
                          }
                        </div>
                      </div>
                    </div>
                    
                    {practiced && (
                      <div className="text-lg font-bold text-green-700">
                        {Math.max(1, Math.floor((stats?.masteredWords || 0) / 5))} words learned! 🌟
                      </div>
                    )}
                    
                    {isToday && !practiced && (
                      <Button 
                        onClick={onViewPractice}
                        size="lg"
                        className="text-xl px-8 py-4 bg-yellow-500 hover:bg-yellow-600 text-black font-bold"
                      >
                        Start Today! 🚀
                      </Button>
                    )}
                    
                    {isFriday && stats?.readyForTest && (
                      <Button 
                        onClick={onStartTest}
                        size="lg"
                        className="text-xl px-8 py-4 bg-red-500 hover:bg-red-600 text-white font-bold"
                      >
                        Take Test! 👑
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      ) : null}



      {/* Simple Help Button */}
      <div className="text-center">
        <Button 
          onClick={onViewGuide}
          className="glass-button glass-button-large text-white font-bold glass-text-glow"
          data-testid="button-view-guide-simple"
        >
          <HelpCircle className="w-6 h-6 mr-3" />
          ❓ Need Help? Click Here! ❓
        </Button>
      </div>
    </div>
    </div>
  );
}