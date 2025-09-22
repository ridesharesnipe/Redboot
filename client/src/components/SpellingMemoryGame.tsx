import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import RedBootCharacter from "./RedBootCharacter";
import { Volume2, Eye, EyeOff, RotateCcw } from "lucide-react";
import { useAudio } from "@/contexts/AudioContext";

export type WordStatus = "new" | "learning" | "mastered" | "review";

export interface WordProgress {
  word: string;
  status: WordStatus;
  correctCount: number;
  incorrectCount: number;
  lastAttempt?: Date;
}

interface SpellingMemoryGameProps {
  words: string[];
  onComplete?: (results: WordProgress[]) => void;
  onExit?: () => void;
}

export default function SpellingMemoryGame({ words, onComplete, onExit }: SpellingMemoryGameProps) {
  // Audio context
  const { playSound, playCharacterVoice, setFocusMode } = useAudio();
  
  // Game state
  const [gamePhase, setGamePhase] = useState<"study" | "recall" | "feedback">("study");
  const [userInput, setUserInput] = useState("");
  const [studyTimeLeft, setStudyTimeLeft] = useState(5);
  const [showWord, setShowWord] = useState(true);
  const [lastResult, setLastResult] = useState<"correct" | "incorrect" | null>(null);
  
  // Progress tracking
  const [wordProgress, setWordProgress] = useState<WordProgress[]>(() =>
    words.map(word => ({
      word,
      status: "new" as WordStatus,
      correctCount: 0,
      incorrectCount: 0,
    }))
  );

  // Remove unused wordsToReview state - we use wordProgress status instead
  const [currentRound, setCurrentRound] = useState(1);
  const [activeIndices, setActiveIndices] = useState<number[]>([]);
  const [currentPos, setCurrentPos] = useState(0);

  const currentWordIndex = activeIndices[currentPos] || 0;
  const currentWord = words[currentWordIndex];
  const totalWords = words.length;
  const masteredWords = wordProgress.filter(w => w.status === "mastered").length;
  
  // Study phase timer
  useEffect(() => {
    if (gamePhase === "study" && studyTimeLeft > 0) {
      const timer = setTimeout(() => {
        setStudyTimeLeft(studyTimeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [gamePhase, studyTimeLeft]);

  // Speak word when starting study phase or changing words
  useEffect(() => {
    if (gamePhase === "study" && currentWord) {
      speakWord(currentWord);
    }
  }, [gamePhase, currentWord]);

  // Enable focus mode during active spelling recall
  useEffect(() => {
    setFocusMode(gamePhase === "recall");
    return () => setFocusMode(false); // Reset on unmount
  }, [gamePhase, setFocusMode]);

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startStudyPhase = () => {
    setGamePhase("study");
    setShowWord(true);
    setStudyTimeLeft(5);
    setUserInput("");
    setLastResult(null);
    // Don't speak immediately - let useEffect handle it to avoid stale state
  };

  const moveToRecallPhase = () => {
    setGamePhase("recall");
    setShowWord(false);
    speakWord(currentWord);
  };

  const checkSpelling = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase();
    setLastResult(isCorrect ? "correct" : "incorrect");
    setGamePhase("feedback");

    // Play appropriate sound effect and character voice
    if (isCorrect) {
      playSound('spell_correct');
      playSound('ship_bell_success', 0.5);
      playCharacterVoice('red_boot_great_job');
    } else {
      playSound('spell_incorrect');
      playCharacterVoice('red_boot_try_again');
    }

    // Update word progress
    setWordProgress(prev => prev.map(wp => {
      if (wp.word === currentWord) {
        const updated = {
          ...wp,
          lastAttempt: new Date(),
        };
        
        if (isCorrect) {
          updated.correctCount++;
          // Mastery rule: 2 correct in a row
          if (updated.correctCount >= 2) {
            if (updated.status === "learning" || updated.status === "new") {
              updated.status = "mastered";
              // Extra celebration for mastery
              setTimeout(() => playSound('treasure_chest_open'), 500);
            } else if (updated.status === "review") {
              updated.status = "mastered"; // Review word successfully completed
              setTimeout(() => playSound('treasure_chest_open'), 500);
            }
          } else if (updated.status === "new") {
            updated.status = "learning";
          }
        } else {
          updated.incorrectCount++;
          updated.correctCount = 0; // Reset streak on mistake
          
          if (updated.status === "mastered") {
            updated.status = "review"; // Mastered word failed, needs review
          } else {
            updated.status = "learning"; // New/learning word still learning
          }
          
          // Status change will be handled by round queue system
        }
        
        return updated;
      }
      return wp;
    }));
  };

  const moveToNextWord = () => {
    if (currentPos < activeIndices.length - 1) {
      // Move to next word in current round
      setCurrentPos(currentPos + 1);
      startStudyPhase();
    } else {
      // End of round - check completion criteria
      const allMastered = wordProgress.every(w => w.status === "mastered");
      
      if (allMastered) {
        // All words truly mastered!
        if (onComplete) {
          onComplete(wordProgress);
        }
      } else {
        // Start new round with non-mastered words
        const nonMasteredIndices = words
          .map((_, index) => index)
          .filter(index => {
            const progress = wordProgress.find(w => w.word === words[index]);
            return progress?.status !== "mastered";
          });
        
        // Prioritize review words first, then learning/new words
        const reviewIndices = nonMasteredIndices.filter(index => {
          const progress = wordProgress.find(w => w.word === words[index]);
          return progress?.status === "review";
        });
        const learningIndices = nonMasteredIndices.filter(index => {
          const progress = wordProgress.find(w => w.word === words[index]);
          return progress?.status === "learning" || progress?.status === "new";
        });
        
        const nextRoundIndices = [...reviewIndices, ...learningIndices];
        
        if (nextRoundIndices.length > 0) {
          setActiveIndices(nextRoundIndices);
          setCurrentPos(0);
          setCurrentRound(currentRound + 1);
          // Review queue handled by status-based round building
          startStudyPhase();
        } else {
          // Shouldn't happen, but safety fallback
          if (onComplete) {
            onComplete(wordProgress);
          }
        }
      }
    }
  };

  const restartWord = () => {
    startStudyPhase();
  };

  // Initialize round with all word indices
  useEffect(() => {
    if (words.length > 0) {
      const initialIndices = Array.from({ length: words.length }, (_, i) => i);
      setActiveIndices(initialIndices);
      setCurrentPos(0);
      startStudyPhase();
    }
  }, [words]);

  if (!currentWord) {
    return (
      <div className="text-center p-8">
        <h2 className="text-2xl font-pirate text-foreground mb-4">
          No words to practice!
        </h2>
        <Button onClick={onExit}>Return to Harbor</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 text-white">
      {/* Header */}
      <div className="p-4 flex items-center justify-between">
        <Button 
          variant="ghost" 
          onClick={onExit}
          className="text-white/80 hover:text-white hover:bg-white/10"
        >
          ← Back to Harbor
        </Button>
        <div className="text-center">
          <h1 className="text-2xl font-pirate">Spelling Memory Adventure</h1>
          <p className="text-blue-100">Round {currentRound} • Word {currentPos + 1} of {activeIndices.length} • Progress {masteredWords}/{totalWords}</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-blue-100">Mastered</div>
          <div className="text-xl font-bold">{masteredWords}/{totalWords}</div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="px-4 mb-6">
        <Progress 
          value={(masteredWords / totalWords) * 100} 
          className="h-3 bg-white/20" 
        />
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-2xl mx-auto">
          {/* Dynamic Red Boot Character based on game phase */}
          <div className="text-center mb-8">
            <RedBootCharacter 
              size="medium" 
              animated 
              expression={
                gamePhase === "study" ? "thinking" :
                gamePhase === "recall" ? "pointing" :
                gamePhase === "feedback" && lastResult === "correct" ? "celebrating" :
                "default"
              } 
            />
          </div>

          {gamePhase === "study" && (
            /* STUDY PHASE */
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-white/20">
              <CardContent className="pt-0">
                <h2 className="text-3xl font-pirate mb-6 text-white">
                  Study This Word
                </h2>
                
                <div className="bg-white/20 rounded-2xl p-8 mb-6">
                  <div className="text-6xl font-bold text-yellow-300 mb-4">
                    {showWord ? currentWord.toUpperCase() : "???"}
                  </div>
                  <Button
                    onClick={() => speakWord(currentWord)}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 mb-4"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Hear Word
                  </Button>
                </div>

                <div className="mb-6">
                  <div className="text-lg text-blue-100 mb-2">
                    Study time remaining:
                  </div>
                  <div className="text-4xl font-bold text-yellow-300">
                    {studyTimeLeft}s
                  </div>
                </div>

                <Button
                  onClick={moveToRecallPhase}
                  disabled={studyTimeLeft > 0}
                  className="bg-treasure-500 text-white hover:bg-treasure-600 px-8 py-4 text-xl"
                >
                  {studyTimeLeft > 0 ? "Keep Studying..." : "Ready to Spell It! 🏴‍☠️"}
                </Button>
              </CardContent>
            </Card>
          )}

          {gamePhase === "recall" && (
            /* RECALL PHASE */
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-white/20">
              <CardContent className="pt-0">
                <h2 className="text-3xl font-pirate mb-6 text-white">
                  Now Spell the Word!
                </h2>
                
                <div className="bg-white/20 rounded-2xl p-8 mb-6">
                  <div className="text-6xl font-bold text-gray-400 mb-6">
                    <EyeOff className="w-16 h-16 mx-auto" />
                  </div>
                  <Button
                    onClick={() => speakWord(currentWord)}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 mb-6"
                  >
                    <Volume2 className="w-5 h-5 mr-2" />
                    Hear Word Again
                  </Button>
                </div>

                <div className="mb-6">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the spelling here..."
                    className="text-2xl text-center py-4 bg-white/20 border-2 border-white/40 text-white placeholder-blue-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userInput.trim()) {
                        checkSpelling();
                      }
                    }}
                    autoFocus
                  />
                </div>

                <div className="flex gap-4 justify-center">
                  <Button
                    onClick={checkSpelling}
                    disabled={!userInput.trim()}
                    className="bg-treasure-500 text-white hover:bg-treasure-600 px-8 py-3"
                  >
                    Check Spelling ✓
                  </Button>
                  <Button
                    onClick={restartWord}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-3"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Study Again
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {gamePhase === "feedback" && (
            /* FEEDBACK PHASE */
            <Card className={`bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 ${
              lastResult === "correct" ? "border-green-400" : "border-red-400"
            }`}>
              <CardContent className="pt-0">
                <div className="text-8xl mb-4">
                  {lastResult === "correct" ? "🏆" : "❌"}
                </div>
                
                <h2 className={`text-3xl font-pirate mb-6 ${
                  lastResult === "correct" ? "text-green-300" : "text-red-300"
                }`}>
                  {lastResult === "correct" ? "Arrr! Excellent!" : "Nice Try, Matey!"}
                </h2>

                {lastResult === "correct" ? (
                  <p className="text-xl text-green-100 mb-6">
                    "Perfect spelling! That treasure is yours!"
                  </p>
                ) : (
                  <div className="mb-6">
                    <p className="text-xl text-red-100 mb-4">
                      The correct spelling is:
                    </p>
                    <div className="text-4xl font-bold text-yellow-300 bg-white/20 rounded-2xl p-4">
                      {currentWord.toUpperCase()}
                    </div>
                  </div>
                )}

                <Button
                  onClick={moveToNextWord}
                  className="bg-treasure-500 text-white hover:bg-treasure-600 px-8 py-4 text-xl"
                >
                  {currentPos < activeIndices.length - 1 ? "Next Word →" : 
                   wordProgress.every(w => w.status === "mastered") ? "Finish Practice!" : "Next Round →"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}