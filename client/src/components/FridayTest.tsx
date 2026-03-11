import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import { spellingStorage } from '@/lib/localStorage';
import { apiRequest, queryClient } from '@/lib/queryClient';
import { CheckCircle, XCircle, Award, Clock, FileText, X } from 'lucide-react';

interface TestResult {
  word: string;
  userAnswer: string;
  isCorrect: boolean;
  timeTaken: number; // seconds
}

interface FridayTestProps {
  onComplete: (results: { 
    score: number; 
    total: number; 
    percentage: number; 
    results: TestResult[];
    timeSpent: number;
  }) => void;
  onCancel: () => void;
}

export default function FridayTest({ onComplete, onCancel }: FridayTestProps) {
  const [testWords, setTestWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isTestComplete, setIsTestComplete] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [wordStartTime, setWordStartTime] = useState<Date | null>(null);
  const [testStartTime, setTestStartTime] = useState<Date | null>(null);
  const [timeRemaining, setTimeRemaining] = useState(900); // 15 minutes total
  const [isWordSpoken, setIsWordSpoken] = useState(false);
  const [showPreTest, setShowPreTest] = useState(true);
  
  const { toast } = useToast();
  const { playSound, playCharacterVoice, setFocusMode } = useAudio();

  // Initialize test
  useEffect(() => {
    const fridayWords = spellingStorage.getFridayTestWords();
    if (fridayWords.length === 0) {
      toast({
        title: "No Test Available",
        description: "Add some spelling words first by taking a photo of your list!",
        variant: "destructive",
      });
      onCancel();
      return;
    }
    
    setTestWords(fridayWords);
  }, [onCancel, toast]);

  // Test timer
  useEffect(() => {
    if (testStartTime && !isTestComplete && timeRemaining > 0) {
      const timer = setTimeout(() => {
        setTimeRemaining(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeRemaining === 0 && !isTestComplete) {
      // Time's up!
      finishTest();
    }
  }, [testStartTime, isTestComplete, timeRemaining]);

  // Speak current word when it changes
  useEffect(() => {
    if (testStartTime && currentWordIndex < testWords.length && !isTestComplete) {
      setIsWordSpoken(false);
      setWordStartTime(new Date());
      
      // Small delay before speaking
      setTimeout(() => {
        speakCurrentWord();
      }, 500);
    }
  }, [currentWordIndex, testWords, testStartTime, isTestComplete]);

  // Enable focus mode during test
  useEffect(() => {
    if (testStartTime && !isTestComplete) {
      setFocusMode(true);
    }
    return () => setFocusMode(false);
  }, [testStartTime, isTestComplete, setFocusMode]);

  const speakCurrentWord = () => {
    if (testWords.length > 0 && currentWordIndex < testWords.length) {
      const word = testWords[currentWordIndex];
      
      // Use speech synthesis to speak the word clearly
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.7; // Slower for test conditions
        utterance.volume = 0.9;
        utterance.onend = () => setIsWordSpoken(true);
        
        // Try to get a good voice
        const voices = speechSynthesis.getVoices();
        const goodVoice = voices.find(voice => 
          voice.lang.startsWith('en') && !voice.name.includes('Google')
        ) || voices[0];
        
        if (goodVoice) utterance.voice = goodVoice;
        
        speechSynthesis.speak(utterance);
      } else {
        setIsWordSpoken(true);
      }
    }
  };

  const startTest = () => {
    setShowPreTest(false);
    setTestStartTime(new Date());
    playCharacterVoice('red_boot_welcome');
    playSound('ship_bell_success');
  };

  const submitAnswer = () => {
    if (!userInput.trim() || !wordStartTime) return;
    
    const currentWord = testWords[currentWordIndex];
    const userAnswer = userInput.trim();
    const isCorrect = userAnswer.toLowerCase() === currentWord.toLowerCase();
    const timeTaken = Math.round((Date.now() - wordStartTime.getTime()) / 1000);
    
    const result: TestResult = {
      word: currentWord,
      userAnswer,
      isCorrect,
      timeTaken
    };
    
    const updatedResults = [...testResults, result];
    setTestResults(updatedResults);
    setUserInput('');
    setIsWordSpoken(false);
    
    if (isCorrect) {
      playSound('spell_correct', 0.3);
    } else {
      playSound('spell_incorrect', 0.3);
    }
    
    if (currentWordIndex >= testWords.length - 1) {
      finishTest(updatedResults);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const finishTest = (finalResults?: TestResult[]) => {
    const allResults = finalResults || testResults;
    setIsTestComplete(true);
    setFocusMode(false);
    
    const totalTimeSpent = testStartTime ? 
      Math.round((Date.now() - testStartTime.getTime()) / 1000) : 0;
    
    const correctAnswers = allResults.filter(r => r.isCorrect).length;
    const totalQuestions = testWords.length;
    const percentage = Math.round((correctAnswers / totalQuestions) * 100);
    
    setTimeout(() => {
      setShowResults(true);
      playCharacterVoice('red_boot_adventure_complete');
      
      if (percentage >= 80) {
        playSound('cannon_achievement');
      } else if (percentage >= 60) {
        playSound('treasure_chest_open');
      }
    }, 1000);
    
    const correctWords = allResults.filter(r => r.isCorrect).map(r => r.word);
    const incorrectWords = allResults.filter(r => !r.isCorrect).map(r => r.word);

    (async () => {
      try {
        let wordListId: string | null = null;
        const savedWords = localStorage.getItem('currentSpellingWords');
        if (savedWords) {
          try {
            const parsed = JSON.parse(savedWords);
            wordListId = parsed.wordListId || null;
          } catch (e) {}
        }

        if (!wordListId) {
          try {
            const res = await fetch('/api/word-lists', { credentials: 'include' });
            if (res.ok) {
              const lists = await res.json();
              if (Array.isArray(lists) && lists.length > 0) {
                wordListId = lists[0].id;
              }
            }
          } catch (e) {}
        }

        if (wordListId) {
          await apiRequest('POST', '/api/progress', {
            wordListId,
            characterUsed: 'red-boot',
            correctWords,
            incorrectWords,
            timeSpent: totalTimeSpent,
            score: percentage
          });
        }

        if (incorrectWords.length > 0) {
          await apiRequest('POST', '/api/tricky-words/bulk', { words: incorrectWords });
        }

        queryClient.invalidateQueries({ queryKey: ['/api/progress'] });
        queryClient.invalidateQueries({ queryKey: ['/api/analytics'] });
        queryClient.invalidateQueries({ queryKey: ['/api/tricky-words'] });
        queryClient.invalidateQueries({ queryKey: ['/api/achievements/user'] });
      } catch (error) {
        console.error('Failed to save test progress:', error);
      }
    })();

    setTimeout(() => {
      onComplete({
        score: correctAnswers,
        total: totalQuestions,
        percentage,
        results: allResults,
        timeSpent: totalTimeSpent
      });
    }, 3000);
  };

  const repeatWord = () => {
    speakCurrentWord();
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getGradeColor = (percentage: number): string => {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-blue-600';
    if (percentage >= 70) return 'text-yellow-600';
    if (percentage >= 60) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeLetter = (percentage: number): string => {
    if (percentage >= 90) return 'A';
    if (percentage >= 80) return 'B';
    if (percentage >= 70) return 'C';
    if (percentage >= 60) return 'D';
    return 'F';
  };

  // Pre-test instructions
  if (showPreTest) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4">
        <div className="max-w-2xl mx-auto mb-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
            data-testid="button-back-from-test"
          >
            <X className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8 text-center">
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <FileText className="w-10 h-10 text-blue-600" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
              Friday Spelling Test
            </h2>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6 text-left">
              <h3 className="font-bold mb-3 text-center">Test Instructions</h3>
              <ul className="space-y-2 text-sm">
                <li>• You have <strong>15 minutes</strong> to complete {testWords.length} words</li>
                <li>• Listen carefully to each word being spoken</li>
                <li>• Type your spelling and press Enter or click Submit</li>
                <li>• You can ask to repeat a word if needed</li>
                <li>• Take your time and do your best!</li>
              </ul>
            </div>
            
            <div className="flex gap-3 justify-center mt-6">
              <Button 
                onClick={startTest}
                className="bg-green-600 hover:bg-green-700 px-8"
                data-testid="button-start-test"
              >
                Start Test
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Test results screen
  if (showResults) {
    const correctAnswers = testResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctAnswers / testWords.length) * 100);
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4">
        <div className="max-w-4xl mx-auto mb-4">
          <Button
            onClick={onCancel}
            variant="outline"
            className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
            data-testid="button-back-from-results"
          >
            <X className="w-5 h-5 mr-2" />
            Back to Dashboard
          </Button>
        </div>
        <Card className="max-w-4xl mx-auto">
          <CardContent className="p-8">
          <div className="text-center mb-6 sm:mb-8">
            <div className="w-16 h-16 sm:w-20 sm:h-20 bg-yellow-100 rounded-full mx-auto mb-3 sm:mb-4 flex items-center justify-center">
              <Award className="w-8 h-8 sm:w-10 sm:h-10 text-yellow-600" />
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-pirate)' }}>
              Test Complete!
            </h2>
            
            <div className={`text-4xl sm:text-5xl md:text-6xl font-bold mb-2 ${getGradeColor(percentage)}`}>
              {getGradeLetter(percentage)}
            </div>
            
            <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
              {correctAnswers} out of {testWords.length} correct ({percentage}%)
            </p>
          </div>
          
          {/* Detailed Results */}
          <div className="bg-gray-50 rounded-lg p-6 mb-6">
            <h3 className="font-bold mb-4 text-center">Detailed Results</h3>
            
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {testResults.map((result, index) => (
                <div 
                  key={index}
                  className={`flex items-center justify-between p-3 rounded ${
                    result.isCorrect ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {result.isCorrect ? (
                      <CheckCircle className="w-5 h-5 text-green-600" />
                    ) : (
                      <XCircle className="w-5 h-5 text-red-600" />
                    )}
                    <div>
                      <div className="font-medium">{result.word}</div>
                      {!result.isCorrect && (
                        <div className="text-sm text-red-600">
                          You wrote: {result.userAnswer}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {result.timeTaken}s
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Performance feedback */}
          <div className="text-center">
            {percentage >= 90 && (
              <p className="text-green-600 font-medium mb-4">
                Outstanding! You're ready for more challenging words!
              </p>
            )}
            {percentage >= 80 && percentage < 90 && (
              <p className="text-blue-600 font-medium mb-4">
                Great job! Keep practicing those tricky words!
              </p>
            )}
            {percentage >= 60 && percentage < 80 && (
              <p className="text-yellow-600 font-medium mb-4">
                Good effort! Practice more this week to improve!
              </p>
            )}
            {percentage < 60 && (
              <p className="text-red-600 font-medium mb-4">
                Keep practicing! Ask your parents for extra help this week!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
      </div>
    );
  }

  // Main test interface
  if (testWords.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Loading test words...</p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = testWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / testWords.length) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4">
      {/* Prominent Back Button at top */}
      <div className="max-w-2xl mx-auto mb-4">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
          data-testid="button-exit-test"
        >
          <X className="w-5 h-5 mr-2" />
          Exit Test
        </Button>
      </div>
      
      <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        {/* Test header with timer and progress */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2 text-sm">
            <Clock className="w-4 h-4" />
            <span className={timeRemaining < 300 ? 'text-red-600 font-bold' : ''}>
              {formatTime(timeRemaining)}
            </span>
          </div>
          
          <div className="text-center flex-1 mx-4">
            <div className="text-sm text-muted-foreground mb-1">
              Question {currentWordIndex + 1} of {testWords.length}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <div className="w-24"></div>
        </div>

        {/* Test interface */}
        <div className="text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
            <span className="text-2xl font-bold text-blue-600">
              {currentWordIndex + 1}
            </span>
          </div>
          
          <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-pirate)' }}>
            Spell the word you hear
          </h3>
          
          <p className="text-muted-foreground mb-6">
            {isWordSpoken ? 'Type your answer below:' : 'Listen carefully...'}
          </p>
          
          {/* Answer input */}
          <div className="mb-6">
            <Input
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && submitAnswer()}
              placeholder={isWordSpoken ? "Type your spelling here..." : "Wait for the word..."}
              className="text-center text-xl py-4 max-w-md mx-auto"
              disabled={!isWordSpoken}
              autoFocus={isWordSpoken}
              data-testid="input-test-spelling"
            />
          </div>
          
          {/* Action buttons */}
          <div className="flex gap-3 justify-center">
            <Button
              onClick={repeatWord}
              variant="outline"
              disabled={!isWordSpoken}
              data-testid="button-repeat-test-word"
            >
              🔊 Repeat
            </Button>
            
            <Button
              onClick={submitAnswer}
              disabled={!userInput.trim() || !isWordSpoken}
              className="bg-blue-600 hover:bg-blue-700 px-8"
              data-testid="button-submit-test-answer"
            >
              Submit Answer
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
    </div>
  );
}