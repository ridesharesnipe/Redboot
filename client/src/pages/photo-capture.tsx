import { useState, useRef } from "react";
import { useLocation } from "wouter";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PhotoCapture from "@/components/PhotoCapture";
import FlashcardGrid from "@/components/FlashcardGrid";
import RedBootCharacter from "@/components/RedBootCharacter";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ArrowLeft, Save, Play, Upload, RefreshCw, PartyPopper, Flag, Sun, BookOpen, Target, Waves } from "lucide-react";

// Calculate week number of the year (1-52)
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default function PhotoCapturePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedWordListId, setSavedWordListId] = useState<string | null>(null);
  
  // Use refs for save state tracking (prevents stale closure issues)
  const currentSavePromiseRef = useRef<Promise<any> | null>(null);
  const currentSaveTokenRef = useRef<string>('');
  const lastSavedWordListIdRef = useRef<string | null>(null);

  // Centralized save function with promise queuing to prevent race conditions
  const saveWords = async (wordsToSave: string[]) => {
    // Wait for any in-flight save to complete before starting new one
    if (currentSavePromiseRef.current) {
      try {
        await currentSavePromiseRef.current;
      } catch (error) {
        // Ignore errors from previous save, proceed with current save
      }
    }
    
    // Recheck after await using refs (fresh state, not stale closure)
    const saveToken = JSON.stringify(wordsToSave);
    if (lastSavedWordListIdRef.current && currentSaveTokenRef.current === saveToken) {
      return; // Already saved these exact words, no-op
    }
    
    // Update token for this save attempt
    currentSaveTokenRef.current = saveToken;
    
    // Create and store the save promise
    const savePromise = (async () => {
      const weekNumber = getWeekNumber(new Date());
      const response = await apiRequest('POST', '/api/word-lists', {
        weekNumber,
        words: wordsToSave,
        practiceCount: 0,
        bestScore: 0,
      });
      const data = await response.json();
      
      // Only update if this save is still current (not superseded by retake)
      if (currentSaveTokenRef.current === saveToken) {
        setSavedWordListId(data.id);
        lastSavedWordListIdRef.current = data.id; // Track in ref for fresh reads
        
        // Also save to localStorage for backward compatibility
        const dataToSave = { 
          words: wordsToSave, 
          savedDate: new Date().toISOString(),
          wordListId: data.id 
        };
        localStorage.setItem('currentSpellingWords', JSON.stringify(dataToSave));
      }
      
      return data;
    })();
    
    currentSavePromiseRef.current = savePromise;
    
    try {
      return await savePromise;
    } finally {
      // Clear promise ref when done
      if (currentSavePromiseRef.current === savePromise) {
        currentSavePromiseRef.current = null;
      }
    }
  };


  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleWordsExtracted = async (words: string[], shouldSaveToDb: boolean = false) => {
    setExtractedWords(words);
    setIsProcessing(false);
    
    // Only reset saved state if this is a new extraction (not a save confirmation)
    if (!shouldSaveToDb) {
      setSavedWordListId(null);
      lastSavedWordListIdRef.current = null; // Reset ref too
      currentSaveTokenRef.current = ''; // Invalidate previous save token
    }
    
    // Save to database when user confirms (shouldSaveToDb = true)
    if (shouldSaveToDb) {
      try {
        await saveWords(words);
        toast({
          title: "Words Saved!",
          description: `${words.length} spelling words saved successfully.`,
        });
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save words. Please try again.",
          variant: "destructive",
        });
      }
    }
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedWords([]);
    setSavedWordListId(null); // Reset saved state for fresh upload
    lastSavedWordListIdRef.current = null; // Reset ref too
  };

  const handleSaveWords = async () => {
    // Check if words need saving (either not saved yet, or words changed since last save)
    const currentToken = JSON.stringify(extractedWords);
    const needsSave = extractedWords.length > 0 && 
      (!savedWordListId || currentSaveTokenRef.current !== currentToken);
    
    if (needsSave) {
      try {
        await saveWords(extractedWords);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save words. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    toast({
      title: "Treasure Maps Saved!",
      description: `${extractedWords.length} pirate flashcards have been added to your collection!`,
    });
    setLocation("/dashboard");
  };

  const handleStartPractice = async () => {
    // Check if words need saving (either not saved yet, or words changed since last save)
    const currentToken = JSON.stringify(extractedWords);
    const needsSave = extractedWords.length > 0 && 
      (!savedWordListId || currentSaveTokenRef.current !== currentToken);
    
    if (needsSave) {
      try {
        await saveWords(extractedWords);
      } catch (error) {
        toast({
          title: "Error",
          description: "Failed to save words. Please try again.",
          variant: "destructive",
        });
        return;
      }
    }
    toast({
      title: "Starting Adventure!", 
      description: "Get ready to practice with your treasure map words!",
    });
    setLocation("/practice");
  };

  const removeWord = (wordToRemove: string) => {
    setExtractedWords(words => words.filter(word => word !== wordToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-400 via-blue-500 to-blue-600">
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Harbor
        </Button>
        <h1 className="text-5xl font-pirate text-white flex items-center gap-3" data-testid="text-page-title">
          <i className="lni lni-scroll" style={{ fontSize: '3rem' }}></i>
          Treasure Map Creator
        </h1>
        <div className="w-32"></div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {!capturedImage ? (
            /* Photo Capture Screen */
            <div className="text-center mb-6">
              {/* Red Boot in White Circle */}
              <div className="mb-6 flex justify-center">
                <div className="bg-white rounded-full p-6 shadow-2xl border-4 border-white/30">
                  <RedBootCharacter size="large" animated />
                </div>
              </div>
              <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-white/20 shadow-2xl">
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <i className="lni lni-flag" style={{ fontSize: '5rem', color: '#000' }}></i>
                  </div>
                  <h2 className="text-6xl font-pirate mb-4 text-white" data-testid="text-capture-title">
                    Create Your Treasure Maps!
                  </h2>
                  <p className="text-blue-100 mb-6 text-3xl leading-relaxed" data-testid="text-capture-instructions">
                    "Ahoy matey! Upload a photo of your spelling homework and I'll turn those words into magical treasure map flashcards!"
                  </p>
                  
                  <Card className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-6">
                    <CardContent className="pt-0">
                      <PhotoCapture onCapture={handleImageCapture} onWordsExtracted={handleWordsExtracted} />
                    </CardContent>
                  </Card>

                </CardContent>
              </Card>
            </div>
          ) : isProcessing ? (
            /* Processing Screen */
            <div className="text-center">
              <RedBootCharacter size="large" animated className="mb-6" />
              <Card className="bg-white/90 backdrop-blur-sm rounded-3xl p-12 text-center border-4 border-blue-200 shadow-2xl">
                <CardContent className="pt-0">
                  <div className="text-8xl mb-6">🗺️</div>
                  <h2 className="text-4xl font-fun mb-6 text-blue-900" data-testid="text-processing-title">
                    Creating Your Treasure Maps...
                  </h2>
                  <div className="flex justify-center mb-6">
                    <div className="animate-spin w-8 h-8 border-4 border-yellow-600 border-t-transparent rounded-full"></div>
                  </div>
                  <p className="text-blue-700 text-xl leading-relaxed" data-testid="text-processing-message">
                    "Arrr! I'm using me magic compass to find all the treasure words in your photo!"
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6">
              {/* Success Message */}
              <div className="text-center">
                <RedBootCharacter size="medium" animated className="mb-4" />
                <Card className="bg-white/90 backdrop-blur-sm rounded-3xl p-8 border-4 border-blue-200 shadow-2xl">
                  <CardContent className="pt-0">
                    <div className="mb-4">
                      <i className="lni lni-celebration text-green-600 drop-shadow-lg" style={{
                        fontSize: '4rem',
                        backgroundColor: 'rgba(34,197,94,0.1)',
                        padding: '12px',
                        borderRadius: '50%'
                      }}></i>
                    </div>
                    <h2 className="text-3xl font-fun mb-4 text-blue-900" data-testid="text-success-title">
                      Treasure Maps Created!
                    </h2>
                    <p className="text-blue-700 mb-6 text-xl" data-testid="text-success-message">
                      "Ahoy! I found {extractedWords.length} treasure words in your photo! They're now beautiful treasure map flashcards!"
                    </p>
                    <div className="flex gap-3 justify-center flex-wrap">
                      <Button 
                        onClick={handleRetake}
                        variant="outline"
                        className="border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white px-6 py-3 rounded-2xl font-bold"
                        data-testid="button-retake"
                      >
                        <i className="lni lni-upload mr-2" style={{ fontSize: '1.25rem' }}></i>
                        Upload Another Photo
                      </Button>
                      <Button 
                        onClick={handleSaveWords}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-2xl font-bold"
                        data-testid="button-save-words"
                      >
                        <i className="lni lni-save mr-2" style={{ fontSize: '1.25rem' }}></i>
                        Save Flashcards
                      </Button>
                      <Button 
                        onClick={handleStartPractice}
                        className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white hover:from-yellow-500 hover:to-orange-600 px-6 py-3 rounded-2xl font-bold"
                        data-testid="button-start-practice"
                      >
                        <i className="lni lni-play mr-2" style={{ fontSize: '1.25rem' }}></i>
                        Start Adventure!
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Flashcard Grid */}
              <div className="bg-white/80 backdrop-blur-sm rounded-3xl p-8 border-2 border-blue-200">
                <FlashcardGrid
                  words={extractedWords}
                  onRemoveWord={removeWord}
                  onStartPractice={handleStartPractice}
                  showRemoveButtons={true}
                  title="Your Pirate Treasure Maps"
                />
              </div>

              {/* Original Photo (Small) */}
              {capturedImage && (
                <Card className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border-2 border-blue-200">
                  <CardHeader>
                    <CardTitle className="text-lg text-center text-blue-800" data-testid="text-original-image">
                      <div className="flex items-center gap-2 justify-center">
                        <i className="lni lni-image" style={{ fontSize: '1.25rem' }}></i>
                        Uploaded Photo
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img 
                        src={capturedImage} 
                        alt="Original spelling list photo" 
                        className="max-h-40 rounded-lg shadow-lg opacity-75 hover:opacity-100 transition-opacity border-2 border-blue-300"
                        data-testid="image-captured"
                      />
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}