import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Progress } from "@/components/ui/progress";
import { ArrowLeft, Play, Volume2, SkipBack, SkipForward, Clock } from "lucide-react";
import type { Child, WordList } from "@shared/schema";

export default function TestSimulator() {
  const { childId } = useParams();
  const [, setLocation] = useLocation();
  
  const [testConfig, setTestConfig] = useState({
    pauseDuration: 10,
    testMode: "friday-test",
    hasParentVoice: false,
  });
  
  const [testStarted, setTestStarted] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<string[]>([]);
  const [currentAnswer, setCurrentAnswer] = useState("");
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [testCompleted, setTestCompleted] = useState(false);
  const [isRecording, setIsRecording] = useState(false);

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children", childId],
    retry: false,
  });

  const { data: wordLists } = useQuery<WordList[]>({
    queryKey: ["/api/children", childId, "wordlists"],
    retry: false,
  });

  const currentWordList = wordLists?.[0];
  const words = currentWordList?.words || [];

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (testStarted && !testCompleted && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            handleNextWord();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [testStarted, testCompleted, timeRemaining]);

  const startTest = () => {
    if (words.length === 0) {
      return;
    }
    setTestStarted(true);
    setUserAnswers(new Array(words.length).fill(""));
    setTimeRemaining(testConfig.pauseDuration);
    speakWord(words[0]);
  };

  const speakWord = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.7;
      utterance.pitch = 1.0;
      speechSynthesis.speak(utterance);
    }
  };

  const handleNextWord = () => {
    const newAnswers = [...userAnswers];
    newAnswers[currentWordIndex] = currentAnswer;
    setUserAnswers(newAnswers);
    setCurrentAnswer("");

    if (currentWordIndex < words.length - 1) {
      const nextIndex = currentWordIndex + 1;
      setCurrentWordIndex(nextIndex);
      setTimeRemaining(testConfig.pauseDuration);
      speakWord(words[nextIndex]);
    } else {
      setTestCompleted(true);
    }
  };

  const handlePreviousWord = () => {
    if (currentWordIndex > 0) {
      const newAnswers = [...userAnswers];
      newAnswers[currentWordIndex] = currentAnswer;
      setUserAnswers(newAnswers);
      
      const prevIndex = currentWordIndex - 1;
      setCurrentWordIndex(prevIndex);
      setCurrentAnswer(userAnswers[prevIndex] || "");
      setTimeRemaining(testConfig.pauseDuration);
    }
  };

  const calculateResults = () => {
    let correct = 0;
    const results = words.map((word, index) => {
      const isCorrect = userAnswers[index]?.toLowerCase() === word.toLowerCase();
      if (isCorrect) correct++;
      return {
        word,
        userAnswer: userAnswers[index] || "",
        isCorrect,
      };
    });
    return { results, score: Math.round((correct / words.length) * 100) };
  };

  const startRecording = () => {
    setIsRecording(true);
    // In a real implementation, this would start voice recording
    setTimeout(() => {
      setIsRecording(false);
      setTestConfig(prev => ({ ...prev, hasParentVoice: true }));
    }, 3000);
  };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (testCompleted) {
    const { results, score } = calculateResults();
    return (
      <div className="min-h-screen bg-background">
        <div className="bg-card border-b border-border px-4 py-3">
          <div className="max-w-6xl mx-auto flex items-center justify-between">
            <Button 
              variant="ghost"
              onClick={() => setLocation("/dashboard")}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            <h1 className="text-xl font-bold" data-testid="text-page-title">
              Test Results
            </h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto p-6">
          <Card className="text-center mb-6">
            <CardHeader>
              <CardTitle className="text-2xl font-fun" data-testid="text-test-complete-title">
                Test Complete!
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl sm:text-5xl md:text-6xl font-bold mb-3 sm:mb-4 text-accent" data-testid="text-final-test-score">
                {score}%
              </div>
              <p className="text-base sm:text-lg text-muted-foreground mb-3 sm:mb-4" data-testid="text-score-message">
                {score >= 90 ? "Excellent work!" : score >= 70 ? "Good job!" : "Keep practicing!"}
              </p>
              <div className="flex justify-center space-x-6 text-sm text-muted-foreground">
                <div>
                  <span className="font-bold text-secondary">{results.filter(r => r.isCorrect).length}</span> Correct
                </div>
                <div>
                  <span className="font-bold text-destructive">{results.filter(r => !r.isCorrect).length}</span> Incorrect
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle data-testid="text-detailed-results-title">Detailed Results</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {results.map((result, index) => (
                  <div 
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg ${
                      result.isCorrect ? 'bg-secondary/10' : 'bg-destructive/10'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                        result.isCorrect ? 'bg-secondary text-secondary-foreground' : 'bg-destructive text-destructive-foreground'
                      }`}>
                        <i className={`fas ${result.isCorrect ? 'fa-check' : 'fa-times'} text-sm`}></i>
                      </div>
                      <div>
                        <div className="font-medium" data-testid={`text-result-word-${index}`}>
                          {result.word}
                        </div>
                        {!result.isCorrect && (
                          <div className="text-sm text-muted-foreground" data-testid={`text-result-answer-${index}`}>
                            Your answer: {result.userAnswer || "(no answer)"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="bg-card border-b border-border px-4 py-3">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost"
            onClick={() => setLocation("/dashboard")}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>
          <h1 className="text-xl font-bold" data-testid="text-page-title">
            Friday Test Simulator
          </h1>
        </div>
      </div>

      <div className="max-w-2xl mx-auto p-6">
        {!testStarted ? (
          /* Test Setup */
          <div className="space-y-6">
            <div className="text-center mb-6">
              <h2 className="text-3xl font-fun text-foreground mb-4" data-testid="text-simulator-title">
                Friday Test Simulator
              </h2>
              <p className="text-muted-foreground" data-testid="text-simulator-subtitle">
                Practice like it's test day with realistic timing and conditions
              </p>
            </div>

            <Card>
              <CardHeader>
                <CardTitle data-testid="text-config-title">Test Configuration</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="parent-voice" data-testid="label-parent-voice">
                    Parent Voice Recording
                  </Label>
                  <Button 
                    onClick={startRecording}
                    disabled={isRecording}
                    className={`${testConfig.hasParentVoice ? 'bg-secondary' : 'bg-red-500'} text-white hover:opacity-90`}
                    data-testid="button-record-voice"
                  >
                    <i className={`fas ${isRecording ? 'fa-circle' : 'fa-microphone'} mr-2`}></i>
                    {isRecording ? "Recording..." : testConfig.hasParentVoice ? "Recorded" : "Record"}
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="pause-duration" data-testid="label-pause-duration">
                    Word Pause Duration
                  </Label>
                  <Select 
                    value={testConfig.pauseDuration.toString()} 
                    onValueChange={(value) => setTestConfig(prev => ({ ...prev, pauseDuration: parseInt(value) }))}
                  >
                    <SelectTrigger className="w-32" data-testid="select-pause-duration">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="10">10 seconds</SelectItem>
                      <SelectItem value="15">15 seconds</SelectItem>
                      <SelectItem value="20">20 seconds</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between">
                  <Label htmlFor="test-mode" data-testid="label-test-mode">Test Mode</Label>
                  <Select 
                    value={testConfig.testMode} 
                    onValueChange={(value) => setTestConfig(prev => ({ ...prev, testMode: value }))}
                  >
                    <SelectTrigger className="w-48" data-testid="select-test-mode">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friday-test">Friday Test Practice</SelectItem>
                      <SelectItem value="quick-review">Quick Review</SelectItem>
                      <SelectItem value="timed-challenge">Timed Challenge</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-6">
                <div className="text-center">
                  <div className="text-lg font-bold mb-2" data-testid="text-words-to-test">
                    {words.length} words to test
                  </div>
                  <p className="text-muted-foreground mb-6" data-testid="text-test-description">
                    Listen carefully to each word and type your answer. You'll have {testConfig.pauseDuration} seconds per word.
                  </p>
                  <Button 
                    onClick={startTest}
                    disabled={words.length === 0}
                    variant="default"
                    data-testid="button-start-test"
                  >
                    <Play className="w-4 h-4 mr-2" />
                    Start Test
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Test Interface */
          <div className="space-y-6">
            <Card>
              <CardContent className="pt-6">
                <div className="text-center mb-6">
                  <h4 className="text-xl font-bold text-foreground mb-4" data-testid="text-question-counter">
                    Question {currentWordIndex + 1} of {words.length}
                  </h4>
                  <div className="w-24 h-24 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center cursor-pointer"
                       onClick={() => speakWord(words[currentWordIndex])}>
                    <Volume2 className="w-6 h-6 text-primary-foreground" />
                  </div>
                  <p className="text-muted-foreground" data-testid="text-listen-instruction">
                    Listen carefully and write the word
                  </p>
                </div>

                <div className="mb-6">
                  <Input 
                    type="text"
                    placeholder="Type your answer here..."
                    className="text-center text-xl font-medium h-16"
                    value={currentAnswer}
                    onChange={(e) => setCurrentAnswer(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleNextWord()}
                    data-testid="input-test-answer"
                  />
                </div>

                <div className="flex space-x-3 mb-6">
                  <Button 
                    variant="outline"
                    onClick={handlePreviousWord}
                    disabled={currentWordIndex === 0}
                    className="flex-1"
                    data-testid="button-previous-word"
                  >
                    <SkipBack className="w-4 h-4 mr-2" />Previous
                  </Button>
                  <Button 
                    variant="outline"
                    onClick={() => speakWord(words[currentWordIndex])}
                    className="flex-1"
                    data-testid="button-replay-audio"
                  >
                    Replay Audio
                  </Button>
                  <Button 
                    onClick={handleNextWord}
                    variant="default" className="flex-1"
                    data-testid="button-next-word"
                  >
                    {currentWordIndex === words.length - 1 ? "Finish" : "Next"}
                    <SkipForward className="w-4 h-4 ml-2" />
                  </Button>
                </div>

                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-muted rounded-full px-4 py-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <span className="font-bold text-foreground" data-testid="text-timer">
                      0:{timeRemaining.toString().padStart(2, '0')}
                    </span>
                  </div>
                </div>

                <div className="mt-4">
                  <Progress 
                    value={((currentWordIndex + 1) / words.length) * 100} 
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
