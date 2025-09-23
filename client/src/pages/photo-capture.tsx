import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import PhotoCapture from "@/components/PhotoCapture";
import FlashcardGrid from "@/components/FlashcardGrid";
import RedBootCharacter from "@/components/RedBootCharacter";
import { useToast } from "@/hooks/use-toast";
import { Upload, RefreshCw, Save, Play, ArrowLeft, Flag, PartyPopper, Sun, BookOpen, Target, Waves } from "lucide-react";

export default function PhotoCapturePage() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [extractedWords, setExtractedWords] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);


  const handleImageCapture = (imageData: string) => {
    setCapturedImage(imageData);
  };

  const handleWordsExtracted = (words: string[]) => {
    setExtractedWords(words);
    setIsProcessing(false);
    
    // Save words to localStorage for the game to use
    localStorage.setItem('spellingWords', JSON.stringify(words));
  };

  const handleRetake = () => {
    setCapturedImage(null);
    setExtractedWords([]);
  };

  const handleSaveWords = () => {
    // In a real implementation, this would save the words to a word list
    toast({
      title: "Treasure Maps Saved!",
      description: `${extractedWords.length} pirate flashcards have been added to your collection!`,
    });
    setLocation("/dashboard");
  };

  const handleStartPractice = () => {
    // Save words to localStorage and navigate to game
    localStorage.setItem('spellingWords', JSON.stringify(extractedWords));
    
    toast({
      title: "Starting Adventure!", 
      description: "Get ready to practice with your treasure map words!",
    });
    setLocation("/game/1"); // Use a dummy childId for now
  };

  const removeWord = (wordToRemove: string) => {
    setExtractedWords(words => words.filter(word => word !== wordToRemove));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600">
      {/* Header */}
      <div className="p-4 flex items-center justify-between relative">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="text-white/80 hover:text-white hover:bg-white/10 flex items-center gap-2"
          data-testid="button-back"
        >
          <ArrowLeft className="w-5 h-5" />
          Back to Harbor
        </Button>
        <h1 className="text-3xl font-pirate text-white flex items-center gap-3" data-testid="text-page-title">
          <Upload className="w-8 h-8" />
          Treasure Map Creator
        </h1>
        <div className="w-32"></div>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-6xl mx-auto">
          {!capturedImage ? (
            /* Photo Capture Screen */
            <div className="text-center mb-8">
              <RedBootCharacter size="large" animated className="mb-8" />
              <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-white/20 shadow-2xl">
                <CardContent className="pt-0">
                  <div className="mb-6">
                    <Flag className="w-20 h-20 mx-auto text-white" />
                  </div>
                  <h2 className="text-4xl font-pirate mb-6 text-white" data-testid="text-capture-title">
                    Create Your Treasure Maps!
                  </h2>
                  <p className="text-blue-100 mb-8 text-xl leading-relaxed" data-testid="text-capture-instructions">
                    "Ahoy matey! Upload a photo of your spelling homework and I'll turn those words into magical treasure map flashcards!"
                  </p>
                  
                  <Card className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 mb-8">
                    <CardContent className="pt-0">
                      <PhotoCapture onCapture={handleImageCapture} onWordsExtracted={handleWordsExtracted} />
                    </CardContent>
                  </Card>

                  {/* Tips */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-white">
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-2xl">
                      <Sun className="w-8 h-8 mb-2 mx-auto" />
                      <div className="font-bold text-sm">Good Light</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-2xl">
                      <BookOpen className="w-8 h-8 mb-2 mx-auto" />
                      <div className="font-bold text-sm">Clear Text</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-2xl">
                      <Target className="w-8 h-8 mb-2 mx-auto" />
                      <div className="font-bold text-sm">Hold Steady</div>
                    </div>
                    <div className="flex flex-col items-center p-4 bg-white/10 rounded-2xl">
                      <Waves className="w-8 h-8 mb-2 mx-auto" />
                      <div className="font-bold text-sm">No Shadows</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          ) : isProcessing ? (
            /* Processing Screen */
            <div className="text-center">
              <RedBootCharacter size="large" animated className="mb-8" />
              <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-12 text-center border-4 border-white/20 shadow-2xl">
                <CardContent className="pt-0">
                  <div className="text-8xl mb-8">🗺️</div>
                  <h2 className="text-4xl font-pirate mb-8 text-white" data-testid="text-processing-title">
                    Creating Your Treasure Maps...
                  </h2>
                  <div className="flex justify-center mb-8">
                    <RefreshCw className="w-16 h-16 animate-spin text-yellow-300" />
                  </div>
                  <p className="text-blue-100 text-xl leading-relaxed" data-testid="text-processing-message">
                    "Arrr! I'm using me magic compass to find all the treasure words in your photo!"
                  </p>
                </CardContent>
              </Card>
            </div>
          ) : (
            /* Results Screen */
            <div className="space-y-8">
              {/* Success Message */}
              <div className="text-center">
                <RedBootCharacter size="medium" animated className="mb-6" />
                <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 border-4 border-white/20 shadow-2xl">
                  <CardContent className="pt-0">
                    <div className="mb-6">
                      <PartyPopper className="w-16 h-16 mx-auto text-white" />
                    </div>
                    <h2 className="text-3xl font-pirate mb-4 text-white" data-testid="text-success-title">
                      Treasure Maps Created!
                    </h2>
                    <p className="text-blue-100 mb-8 text-xl" data-testid="text-success-message">
                      "Ahoy! I found {extractedWords.length} treasure words in your photo! They're now beautiful treasure map flashcards!"
                    </p>
                    <div className="flex gap-4 justify-center flex-wrap">
                      <Button 
                        onClick={handleRetake}
                        variant="outline"
                        className="border-2 border-white text-white hover:bg-white hover:text-cyan-600 px-6 py-3 rounded-2xl"
                        data-testid="button-retake"
                      >
                        <Upload className="w-5 h-5 mr-2" />
                        Upload Another Photo
                      </Button>
                      <Button 
                        onClick={handleSaveWords}
                        className="bg-emerald-500 text-white hover:bg-emerald-600 px-6 py-3 rounded-2xl"
                        data-testid="button-save-words"
                      >
                        <Save className="w-5 h-5 mr-2" />
                        Save Flashcards
                      </Button>
                      <Button 
                        onClick={handleStartPractice}
                        className="bg-treasure-500 text-white hover:bg-treasure-600 px-6 py-3 rounded-2xl"
                        data-testid="button-start-practice"
                      >
                        <Play className="w-5 h-5 mr-2" />
                        Start Adventure!
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Flashcard Grid */}
              <div className="bg-white/5 backdrop-blur-sm rounded-3xl p-8 border-2 border-white/10">
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
                <Card className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                  <CardHeader>
                    <CardTitle className="text-lg text-center text-white/80" data-testid="text-original-image">
                      <div className="flex items-center gap-2">
                        <Upload className="w-4 h-4" />
                        Uploaded Photo
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-center">
                      <img 
                        src={capturedImage} 
                        alt="Original spelling list photo" 
                        className="max-h-40 rounded-lg shadow-lg opacity-75 hover:opacity-100 transition-opacity border-2 border-white/20"
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