import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import RedBootCharacter from "@/components/RedBootCharacter";
import VirtualKeyboard from "@/components/VirtualKeyboard";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Child, WordList } from "@shared/schema";

export default function Game() {
  const { childId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [gameStarted, setGameStarted] = useState(false);
  const [correctWords, setCorrectWords] = useState<string[]>([]);
  const [incorrectWords, setIncorrectWords] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState("");
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [timeSpent, setTimeSpent] = useState(0);

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children", childId],
    retry: false,
  });

  const { data: wordLists } = useQuery<WordList[]>({
    queryKey: ["/api/children", childId, "wordlists"],
    retry: false,
  });

  const saveProgressMutation = useMutation({
    mutationFn: async (progressData: any) => {
      await apiRequest("POST", `/api/children/${childId}/progress`, progressData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/children", childId, "progress"] });
      toast({
        title: "Progress Saved!",
        description: "Your treasure hunt progress has been recorded.",
      });
      setTimeout(() => setLocation("/"), 2000);
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to save progress. Please try again.",
        variant: "destructive",
      });
    },
  });

  const currentWordList = wordLists?.[0];
  const words = currentWordList?.words || [];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (gameStarted && !gameCompleted) {
      interval = setInterval(() => {
        setTimeSpent(prev => prev + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [gameStarted, gameCompleted]);

  const startGame = () => {
    if (words.length === 0) {
      toast({
        title: "No Words Available",
        description: "Please add a word list first.",
        variant: "destructive",
      });
      return;
    }
    setGameStarted(true);
    setCurrentWord(words[0]);
    speakWord(words[0]);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1.2;
      speechSynthesis.speak(utterance);
    }
  };

  const handleKeyPress = (key: string) => {
    if (key === 'BACKSPACE') {
      setUserInput(prev => prev.slice(0, -1));
    } else if (key === 'SUBMIT') {
      handleSubmit();
    } else if (key === 'HINT') {
      // Show first letter as hint
      if (currentWord && userInput.length === 0) {
        setUserInput(currentWord[0].toUpperCase());
      }
    } else {
      setUserInput(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim()) return;

    const isWordCorrect = userInput.toLowerCase() === currentWord.toLowerCase();
    setIsCorrect(isWordCorrect);
    setShowFeedback(true);

    if (isWordCorrect) {
      setCorrectWords(prev => [...prev, currentWord]);
    } else {
      setIncorrectWords(prev => [...prev, currentWord]);
    }

    setTimeout(() => {
      setShowFeedback(false);
      setUserInput("");
      
      if (currentWordIndex < words.length - 1) {
        const nextIndex = currentWordIndex + 1;
        setCurrentWordIndex(nextIndex);
        setCurrentWord(words[nextIndex]);
        speakWord(words[nextIndex]);
      } else {
        // Game completed
        setGameCompleted(true);
        const score = Math.round((correctWords.length + (isWordCorrect ? 1 : 0)) / words.length * 100);
        saveProgressMutation.mutate({
          wordListId: currentWordList?.id,
          characterUsed: 'red-boot',
          correctWords: isWordCorrect ? [...correctWords, currentWord] : correctWords,
          incorrectWords: !isWordCorrect ? [...incorrectWords, currentWord] : incorrectWords,
          timeSpent,
          score,
        });
      }
    }, 2000);
  };

  const progressPercentage = words.length > 0 ? ((currentWordIndex + 1) / words.length) * 100 : 0;

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (gameCompleted) {
    const finalScore = Math.round(correctWords.length / words.length * 100);
    return (
      <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-600 text-white flex items-center justify-center">
        <Card className="bg-white/10 backdrop-blur text-white p-8 text-center max-w-md mx-4">
          <CardContent className="pt-6">
            <RedBootCharacter size="medium" animated />
            <h2 className="text-3xl font-fun mb-4" data-testid="text-game-complete-title">
              Treasure Found!
            </h2>
            <div className="text-6xl font-bold mb-4 text-treasure-400" data-testid="text-final-score">
              {finalScore}%
            </div>
            <p className="text-lg mb-6" data-testid="text-final-message">
              "Arrr! Well done, matey! You've earned {correctWords.length} treasure coins!"
            </p>
            <div className="space-y-2 mb-6">
              <div className="flex justify-between">
                <span>Correct Words:</span>
                <span className="font-bold" data-testid="text-correct-count">{correctWords.length}</span>
              </div>
              <div className="flex justify-between">
                <span>Time Spent:</span>
                <span className="font-bold" data-testid="text-time-spent">{Math.floor(timeSpent / 60)}:{(timeSpent % 60).toString().padStart(2, '0')}</span>
              </div>
            </div>
            <Button 
              onClick={() => setLocation("/")}
              className="bg-treasure-500 text-treasure-50 hover:bg-treasure-600"
              data-testid="button-return-dashboard"
            >
              Return to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-ocean-400 via-ocean-500 to-ocean-600 text-white">
      {/* Game Header */}
      <div className="p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={() => setLocation("/")}
          className="text-white/80 hover:text-white hover:bg-white/10"
          data-testid="button-back-dashboard"
        >
          <i className="fas fa-arrow-left text-xl"></i>
        </Button>
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <i className="fas fa-coins text-treasure-400"></i>
            <span className="font-bold" data-testid="text-treasure-coins">{correctWords.length * 10}</span>
          </div>
          <div className="flex items-center space-x-2">
            <i className="fas fa-fire text-red-400"></i>
            <span className="font-bold" data-testid="text-streak">{correctWords.length}</span>
          </div>
        </div>
      </div>

      {!gameStarted ? (
        /* Game Start Screen */
        <div className="flex flex-col items-center justify-center min-h-[80vh] px-4">
          <RedBootCharacter size="large" animated />
          <Card className="bg-white/20 backdrop-blur rounded-xl p-6 max-w-md mx-auto text-center mt-8">
            <CardContent className="pt-0">
              <h2 className="text-2xl font-fun mb-4" data-testid="text-welcome-message">
                Welcome aboard, {child.name}!
              </h2>
              <p className="text-blue-100 mb-6" data-testid="text-game-instructions">
                Ready to hunt for treasure? Listen carefully and spell the words I speak!
              </p>
              <div className="text-sm text-blue-200 mb-6" data-testid="text-word-count">
                {words.length} words to practice
              </div>
              <Button 
                onClick={startGame}
                className="bg-treasure-500 text-treasure-50 hover:bg-treasure-600 px-8 py-3 text-lg font-bold"
                data-testid="button-start-game"
              >
                <i className="fas fa-play mr-2"></i>Start Adventure!
              </Button>
            </CardContent>
          </Card>
        </div>
      ) : (
        /* Game Play Screen */
        <div className="px-4 pb-8">
          <div className="max-w-2xl mx-auto">
            {/* Red Boot Character */}
            <div className="text-center py-8">
              <RedBootCharacter size="medium" animated />
              <Card className="bg-white/20 backdrop-blur rounded-xl p-4 max-w-xs mx-auto mt-4">
                <CardContent className="pt-0">
                  <p className="font-bold text-lg" data-testid="text-character-message">
                    {showFeedback 
                      ? isCorrect 
                        ? "Arrr! Excellent work, matey!" 
                        : `Nice try! The word was "${currentWord}"`
                      : "Listen carefully and spell the word!"
                    }
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Current Word Challenge */}
            <Card className="bg-white/10 backdrop-blur rounded-xl p-6 mb-6 text-center">
              <CardContent className="pt-0">
                <h3 className="text-xl font-bold mb-4" data-testid="text-instruction">
                  Spell the word you hear:
                </h3>
                <Button 
                  onClick={() => speakWord(currentWord)}
                  className="bg-treasure-500 text-treasure-50 w-16 h-16 rounded-full mb-4 hover:bg-treasure-600 transition-colors"
                  data-testid="button-repeat-word"
                >
                  <i className="fas fa-volume-up text-2xl"></i>
                </Button>
                <div className="text-sm text-blue-100 mb-4" data-testid="text-progress-counter">
                  Word {currentWordIndex + 1} of {words.length}
                </div>
                <Progress value={progressPercentage} className="h-2 bg-white/20" />
              </CardContent>
            </Card>

            {/* Letter Input Display */}
            <Card className="bg-white rounded-xl p-6 mb-6">
              <CardContent className="pt-0">
                <div className="flex justify-center mb-6 min-h-[60px] items-center">
                  <div className="text-3xl font-bold text-foreground border-b-2 border-accent min-w-[200px] text-center pb-2">
                    {userInput || ""}
                    <span className="animate-pulse">|</span>
                  </div>
                </div>
                <VirtualKeyboard onKeyPress={handleKeyPress} />
              </CardContent>
            </Card>

            {/* Treasure Progress */}
            <div className="flex justify-center space-x-4">
              {Array.from({ length: Math.min(words.length, 5) }).map((_, index) => (
                <div 
                  key={index}
                  className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                    index < correctWords.length
                      ? 'bg-treasure-500 treasure-shimmer'
                      : 'bg-muted opacity-50'
                  }`}
                >
                  <i className={`fas fa-gem text-2xl ${
                    index < correctWords.length ? 'text-treasure-50' : 'text-muted-foreground'
                  }`}></i>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
