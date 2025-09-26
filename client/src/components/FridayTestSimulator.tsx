import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import RedBootCharacter from "./RedBootCharacter";
import { Volume2, Trophy, Target, RotateCcw, Home } from "lucide-react";

interface TestResult {
  word: string;
  userAnswer: string;
  correct: boolean;
}

interface FridayTestSimulatorProps {
  words: string[];
  onComplete?: (results: TestResult[]) => void;
  onExit?: () => void;
}

export default function FridayTestSimulator({ words, onComplete, onExit }: FridayTestSimulatorProps) {
  const [testPhase, setTestPhase] = useState<"intro" | "testing" | "results">("intro");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState("");
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [shuffledWords, setShuffledWords] = useState<string[]>([]);
  const [timeStarted, setTimeStarted] = useState<Date | null>(null);
  const [timeCompleted, setTimeCompleted] = useState<Date | null>(null);

  // Shuffle words for random order (like real tests)
  useEffect(() => {
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  }, [words]);

  const currentWord = shuffledWords[currentWordIndex];
  const totalWords = shuffledWords.length;
  const currentProgress = ((currentWordIndex) / totalWords) * 100;

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      utterance.volume = 0.8;
      speechSynthesis.speak(utterance);
    }
  };

  const startTest = () => {
    setTestPhase("testing");
    setTimeStarted(new Date());
    if (shuffledWords.length > 0) {
      speakWord(shuffledWords[0]);
    }
  };

  const submitAnswer = () => {
    const isCorrect = userInput.trim().toLowerCase() === currentWord.toLowerCase();
    
    const result: TestResult = {
      word: currentWord,
      userAnswer: userInput.trim(),
      correct: isCorrect,
    };

    setTestResults(prev => [...prev, result]);
    setUserInput("");

    if (currentWordIndex < shuffledWords.length - 1) {
      // Move to next word
      setCurrentWordIndex(currentWordIndex + 1);
      setTimeout(() => {
        speakWord(shuffledWords[currentWordIndex + 1]);
      }, 500);
    } else {
      // Test complete
      setTestPhase("results");
      setTimeCompleted(new Date());
      if (onComplete) {
        onComplete([...testResults, result]);
      }
    }
  };

  const restartTest = () => {
    setTestPhase("intro");
    setCurrentWordIndex(0);
    setUserInput("");
    setTestResults([]);
    setTimeStarted(null);
    setTimeCompleted(null);
    // Re-shuffle words
    const shuffled = [...words].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  };

  // Calculate results
  const correctAnswers = testResults.filter(r => r.correct).length;
  const incorrectAnswers = testResults.filter(r => r.correct === false);
  const accuracy = testResults.length > 0 ? (correctAnswers / testResults.length) * 100 : 0;
  
  const testDuration = timeStarted && timeCompleted 
    ? Math.round((timeCompleted.getTime() - timeStarted.getTime()) / 1000)
    : 0;

  const getGradeMessage = () => {
    if (accuracy === 100) {
      return "🏆 PERFECT SCORE! Master Pirate Speller!";
    } else if (accuracy >= 90) {
      return "⭐ Excellent! Outstanding spelling skills!";
    } else if (accuracy >= 80) {
      return "👍 Great job! You're well prepared!";
    } else if (accuracy >= 70) {
      return "📚 Good effort! A bit more practice needed.";
    } else if (accuracy >= 60) {
      return "🏴‍☠️ Fair attempt! Focus on these missed words.";
    } else {
      return "🌊 Keep practicing! You'll get there, matey!";
    }
  };

  if (testPhase === "intro") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 text-white">
        <div className="p-6 text-center">
          <Button 
            variant="ghost" 
            onClick={onExit}
            className="absolute top-6 left-6"
          >
            ← Back to Harbor
          </Button>
          
          <h1 className="text-4xl font-pirate mb-2">The Great Treasure Hunt!</h1>
          <p className="text-orange-100 text-lg">Friday Spelling Test Practice</p>
        </div>

        <div className="px-6 pb-6">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border-4 border-white/20">
              <CardContent className="pt-0">
                <RedBootCharacter size="large" animated expression="pointing" className="mb-6" />
                
                <h2 className="text-3xl font-pirate mb-6 text-white">
                  Ready for the Final Challenge?
                </h2>
                
                <div className="bg-white/20 rounded-2xl p-6 mb-6">
                  <h3 className="text-xl font-bold text-yellow-300 mb-4">Test Rules:</h3>
                  <ul className="text-left space-y-3 text-orange-100">
                    <li>• {totalWords} words in random order</li>
                    <li>• I'll say each word once</li>
                    <li>• Type the spelling from memory</li>
                    <li>• No hints or help - just like the real test!</li>
                    <li>• Press Enter or click Submit for each word</li>
                  </ul>
                </div>

                <div className="bg-white/20 rounded-2xl p-6 mb-6">
                  <div className="text-lg text-yellow-300">
                    Words to spell: <span className="font-bold">{totalWords}</span>
                  </div>
                </div>

                <Button
                  onClick={startTest}
                  variant="default"
                  size="lg"
                  className="text-2xl font-bold px-12 py-6"
                >
                  🏴‍☠️ Start the Great Hunt!
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (testPhase === "testing") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 text-white">
        {/* Header */}
        <div className="p-6 text-center">
          <h1 className="text-2xl font-pirate">The Great Treasure Hunt</h1>
          <p className="text-orange-100">Word {currentWordIndex + 1} of {totalWords}</p>
        </div>

        {/* Progress Bar */}
        <div className="px-6 mb-6">
          <Progress 
            value={currentProgress} 
            className="h-4 bg-white/20" 
          />
        </div>

        <div className="px-6 pb-6">
          <div className="max-w-2xl mx-auto">
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border-4 border-white/20">
              <CardContent className="pt-0">
                <RedBootCharacter size="medium" animated expression="thinking" className="mb-6" data-testid="red-boot-testing-thinking" />
                
                <h2 className="text-3xl font-pirate mb-6 text-white">
                  Spell This Word:
                </h2>
                
                <div className="bg-white/20 rounded-2xl p-6 mb-6">
                  <Button
                    onClick={() => speakWord(currentWord)}
                    variant="secondary"
                    size="lg"
                    className="text-2xl px-8 py-6 mb-6"
                  >
                    <Volume2 className="w-8 h-8 mr-3" />
                    Hear Word
                  </Button>
                  
                  <div className="text-lg text-orange-100 mb-4">
                    (Click the button to hear the word)
                  </div>
                </div>

                <div className="mb-8">
                  <Input
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder="Type the spelling here..."
                    className="text-3xl text-center py-6 bg-white/20 border-2 border-white/40 text-white placeholder-orange-200"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && userInput.trim()) {
                        submitAnswer();
                      }
                    }}
                    autoFocus
                  />
                </div>

                <Button
                  onClick={submitAnswer}
                  disabled={!userInput.trim()}
                  variant="default"
                  size="lg"
                  className="text-xl px-12 py-4"
                >
                  Submit Answer →
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  if (testPhase === "results") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-400 via-orange-400 to-yellow-400 text-white">
        <div className="p-6 text-center">
          <h1 className="text-4xl font-pirate mb-2">Test Complete!</h1>
          <p className="text-orange-100 text-lg">Here are your results, brave pirate!</p>
        </div>

        <div className="px-6 pb-6">
          <div className="max-w-4xl mx-auto space-y-6">
            {/* Overall Results */}
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 text-center border-4 border-white/20">
              <CardContent className="pt-0">
                <RedBootCharacter size="medium" animated expression="celebrating" className="mb-6" data-testid="red-boot-results-celebrating" />
                
                <h2 className="text-3xl font-pirate mb-6 text-white">
                  {getGradeMessage()}
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="text-4xl font-bold text-green-300">{correctAnswers}</div>
                    <div className="text-lg text-white">Correct</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="text-4xl font-bold text-red-300">{incorrectAnswers.length}</div>
                    <div className="text-lg text-white">Incorrect</div>
                  </div>
                  <div className="bg-white/20 rounded-2xl p-6">
                    <div className="text-4xl font-bold text-yellow-300">{Math.round(accuracy)}%</div>
                    <div className="text-lg text-white">Accuracy</div>
                  </div>
                </div>

                <div className="flex gap-4 justify-center flex-wrap">
                  <Button
                    onClick={restartTest}
                    variant="default"
                    className="px-8 py-3"
                  >
                    <RotateCcw className="w-5 h-5 mr-2" />
                    Take Test Again
                  </Button>
                  <Button
                    onClick={onExit}
                    variant="outline"
                    className="px-8 py-3"
                  >
                    <Home className="w-5 h-5 mr-2" />
                    Back to Harbor
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Incorrect Words */}
            {incorrectAnswers.length > 0 && (
              <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-4 border-red-400">
                <CardHeader>
                  <CardTitle className="text-2xl font-pirate text-red-300 text-center">
                    Words to Practice More
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {incorrectAnswers.map((result, index) => (
                      <div 
                        key={index}
                        className="bg-white/20 rounded-xl p-6 flex justify-between items-center"
                      >
                        <div>
                          <div className="text-lg font-bold text-white">{result.word}</div>
                          <div className="text-red-300">You wrote: "{result.userAnswer}"</div>
                        </div>
                        <Button
                          onClick={() => speakWord(result.word)}
                          variant="outline"
                          size="sm"
                        >
                          <Volume2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                  <p className="text-center text-red-200 mt-6">
                    Practice these {incorrectAnswers.length} words more before your real test!
                  </p>
                </CardContent>
              </Card>
            )}

            {/* Perfect Score Celebration */}
            {accuracy === 100 && (
              <Card className="bg-gradient-to-r from-yellow-400 to-orange-400 rounded-3xl p-6 text-center border-4 border-yellow-300">
                <CardContent className="pt-0">
                  <div className="text-8xl mb-4">🏆</div>
                  <h3 className="text-3xl font-pirate text-white mb-4">
                    PERFECT TREASURE HUNTER!
                  </h3>
                  <p className="text-xl text-white">
                    You've mastered all {totalWords} spelling words! 
                    You're ready to ace that Friday test, Captain!
                  </p>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}