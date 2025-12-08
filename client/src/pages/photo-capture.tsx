import { useState, useRef, useEffect } from "react";
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
import { useAudio } from "@/contexts/AudioContext";
import { ArrowLeft, Save, Play, Upload, RefreshCw, PartyPopper, Flag, Sun, BookOpen, Target, Waves, Loader } from "lucide-react";
import harborWavesSound from "@assets/amb_harbor_waves-24587_1759648211592.mp3";

// Calculate week number of the year (1-52)
function getWeekNumber(date: Date): number {
  const firstDayOfYear = new Date(date.getFullYear(), 0, 1);
  const pastDaysOfYear = (date.getTime() - firstDayOfYear.getTime()) / 86400000;
  return Math.ceil((pastDaysOfYear + firstDayOfYear.getDay() + 1) / 7);
}

export default function PhotoCapturePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const { playAudioFile } = useAudio();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [savedWordListId, setSavedWordListId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  // Use refs for save state tracking (prevents stale closure issues)
  const currentSavePromiseRef = useRef<Promise<any> | null>(null);
  const currentSaveTokenRef = useRef<string>(''); // Token for current save attempt
  const lastSavedTokenRef = useRef<string>(''); // Token of last SUCCESSFUL save
  const lastSavedWordListIdRef = useRef<string | null>(null);

  // Play harbor waves ambient sound when page loads
  useEffect(() => {
    playAudioFile(harborWavesSound, 0.3);
  }, [playAudioFile]);

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
    
    // Recheck after await using lastSavedTokenRef (tracks successful saves only)
    const saveToken = JSON.stringify(wordsToSave);
    if (lastSavedWordListIdRef.current && lastSavedTokenRef.current === saveToken) {
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
        lastSavedTokenRef.current = saveToken; // Mark these words as successfully saved
        
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
    // Don't set capturedImage yet - let PhotoCapture stay mounted to show progress
    // It will be set when words are extracted
    setIsProcessing(true);
  };

  const handleWordsExtracted = async (words: string[], imageData: string, shouldSaveToDb: boolean = false) => {
    setExtractedWords(words);
    setIsProcessing(false);
    // Set the captured image now that processing is complete
    if (imageData && !capturedImage) {
      setCapturedImage(imageData);
    }
    
    // Only reset saved state if this is a new extraction (not a save confirmation)
    if (!shouldSaveToDb) {
      setSavedWordListId(null);
      lastSavedWordListIdRef.current = null; // Reset ref too
      lastSavedTokenRef.current = ''; // Reset successful save tracker
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
    lastSavedTokenRef.current = ''; // Reset successful save tracker
  };

  const handleSaveWords = async () => {
    // Check if words need saving (compare against last SUCCESSFUL save)
    const currentToken = JSON.stringify(extractedWords);
    const needsSave = extractedWords.length > 0 && 
      (!savedWordListId || lastSavedTokenRef.current !== currentToken);
    
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

  const handleStartPractice = () => {
    if (extractedWords.length === 0) {
      toast({
        title: "No Words Found",
        description: "Please upload a photo with spelling words first.",
        variant: "destructive",
      });
      return;
    }

    // Skip database save - proceed directly to practice
    toast({
      title: "Starting Adventure!", 
      description: "Get ready to practice with your treasure map words!",
    });
    setTimeout(() => {
      setLocation("/practice");
    }, 500);
  };

  const removeWord = (wordToRemove: string) => {
    setExtractedWords(words => words.filter(word => word !== wordToRemove));
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <div className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => setLocation("/")}
            className="text-gray-600 hover:text-gray-900 flex items-center gap-2"
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </Button>
          <h1 className="text-lg sm:text-xl font-semibold text-gray-800" data-testid="text-page-title">
            Add Spelling Words
          </h1>
          <div className="w-16"></div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-8">
        {!capturedImage ? (
          /* Photo Capture Screen */
          <div>
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 rounded-full flex items-center justify-center">
                <BookOpen className="w-8 h-8 text-blue-600" />
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2" data-testid="text-capture-title">
                Capture Your Spelling List
              </h2>
              <p className="text-gray-500" data-testid="text-capture-instructions">
                Take a photo or upload an image of your homework
              </p>
            </div>
            
            <PhotoCapture onCapture={handleImageCapture} onWordsExtracted={handleWordsExtracted} />
          </div>
        ) : isProcessing ? (
            /* Processing Screen */
            <div className="text-center py-8">
              <div className="w-20 h-20 mx-auto mb-6 bg-blue-100 rounded-full flex items-center justify-center">
                <Loader className="w-10 h-10 text-blue-600 animate-spin" />
              </div>
              <h2 className="text-xl font-bold text-gray-800 mb-2" data-testid="text-processing-title">
                Extracting Words...
              </h2>
              <p className="text-gray-500 mb-6" data-testid="text-processing-message">
                Analyzing your spelling list
              </p>
              <div className="bg-blue-50 rounded-xl p-4 max-w-sm mx-auto">
                <p className="text-blue-700 text-sm">
                  This may take a few seconds
                </p>
              </div>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-6">
              {/* Success Card */}
              <Card className="bg-white border-0 shadow-lg rounded-2xl">
                <CardContent className="p-6 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
                    <RefreshCw className="w-8 h-8 text-green-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-800 mb-2" data-testid="text-success-title">
                    Words Extracted!
                  </h2>
                  <p className="text-gray-500 mb-6" data-testid="text-success-message">
                    Found {extractedWords.length} spelling words
                  </p>
                  <div className="flex gap-3 justify-center">
                    <Button 
                      onClick={handleRetake}
                      variant="outline"
                      className="border-gray-300"
                      data-testid="button-retake"
                    >
                      <Upload className="w-4 h-4 mr-2" />
                      Retake
                    </Button>
                    <Button 
                      onClick={handleStartPractice}
                      disabled={isSaving}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                      data-testid="button-start-practice"
                    >
                      {isSaving ? (
                        <>
                          <Loader className="w-4 h-4 mr-2 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        <>
                          <Play className="w-4 h-4 mr-2" />
                          Start Practice
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Words List */}
              <Card className="bg-white border-0 shadow-lg rounded-2xl">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg font-semibold text-gray-800">
                    Your Words
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {extractedWords.map((word, index) => (
                      <span 
                        key={index}
                        className="px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-sm font-medium"
                      >
                        {word}
                      </span>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Original Photo (Small) */}
              {capturedImage && (
                <Card className="bg-white border-0 shadow-lg rounded-2xl">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-gray-500" data-testid="text-original-image">
                      Original Photo
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <img 
                      src={capturedImage} 
                      alt="Original spelling list photo" 
                      className="w-full max-h-32 object-contain rounded-lg bg-gray-50"
                      data-testid="image-captured"
                    />
                  </CardContent>
                </Card>
              )}
            </div>
          )}
      </div>
    </div>
  );
}