import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import TreasureRoad from '@/components/TreasureRoad';
import { Coins, SkipForward, CheckCircle, XCircle, X } from 'lucide-react';

interface SimplePracticeProps {
  onComplete: (score: { correct: number; total: number; treasureEarned: number }) => void;
  onCancel: () => void;
}

export default function SimplePractice({ onComplete, onCancel }: SimplePracticeProps) {
  const [practiceWords, setPracticeWords] = useState<string[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [treasureEarned, setTreasureEarned] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [isWordSpoken, setIsWordSpoken] = useState(false);
  const [showTreasureRoad, setShowTreasureRoad] = useState(false);
  const [currentTreasure, setCurrentTreasure] = useState<string | null>(null);
  
  // ADD these new state variables for Tricky Treasures
  const [trickyWords, setTrickyWords] = useState<string[]>([]);
  const [wordAttempts, setWordAttempts] = useState<{[word: string]: number}>({});
  const [showBonusRound, setShowBonusRound] = useState(false);
  const [bonusRoundWords, setBonusRoundWords] = useState<string[]>([]);
  const [practiceComplete, setPracticeComplete] = useState(false);
  
  // Calculate milestones dynamically based on actual word count
  const getTreasureMilestones = () => {
    const total = practiceWords.length;
    if (total === 0) return []; // No milestones if no words
    if (total <= 12) {
      return [2, 4, 6, 8, 10, 12].filter(m => m <= total);
    } else {
      return [3, 5, 7, 10, 13, total];
    }
  };
  const [sessionResults, setSessionResults] = useState<{ correct: number; total: number; treasureEarned: number } | null>(null);
  
  const { toast } = useToast();
  const { playSound, playCharacterVoice } = useAudio();

  // Red Boot's milestone celebration phrases
  const treasurePhrases = [
    "Well done, matey! A true sea dog's triumph!",
    "Blimey! A booty well-earned, arrr!",
    "Heave ho! You've navigated that perfectly!",
    "By the kraken's beard, a grand victory!",
    "A toast to ye, for a legendary haul!",
    "You've found the treasure map to success!",
    "Blow me down! That's a master stroke!",
    "Fair winds and following seas, you legend!",
    "Ahoy! You've captured the day's glory!",
    "A fine catch! The Jolly Roger salutes you!"
  ];

  // ADD bonus round logic helper functions
  const getCurrentWord = () => {
    if (showBonusRound && bonusRoundWords.length > 0) {
      return bonusRoundWords[currentWordIndex];
    }
    return practiceWords[currentWordIndex];
  };
  
  const getTotalWords = () => {
    if (showBonusRound) return bonusRoundWords.length;
    return practiceWords.length;
  };

  // Function to make Red Boot speak a phrase clearly
  const speakTreasurePhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.75; // Slower, regular speed for clear delivery
      utterance.volume = 1.0;
      utterance.pitch = 1.0; // Normal pitch for clarity
      
      // Try to get a good voice for Red Boot
      const voices = speechSynthesis.getVoices();
      const pirateVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Male') || !voice.name.includes('Google'))
      ) || voices[0];
      
      if (pirateVoice) utterance.voice = pirateVoice;
      
      speechSynthesis.speak(utterance);
    }
  };

  // Add treasure checking function
  const checkForTreasure = (correctCount: number) => {
    const treasureMap: Record<number, { name: string; icon: string }> = {
      2: { name: 'Silver Coins', icon: 'lni-coin' },
      3: { name: 'Silver Coins', icon: 'lni-coin' },
      4: { name: 'Emeralds', icon: 'lni-diamond' },
      5: { name: 'Emeralds', icon: 'lni-diamond' },
      6: { name: 'Rubies', icon: 'lni-heart' },
      7: { name: 'Rubies', icon: 'lni-heart' },
      8: { name: 'Diamonds', icon: 'lni-diamond' },
      10: { name: 'Diamonds', icon: 'lni-diamond' },
      13: { name: 'Gold Coins', icon: 'lni-coin' },
      [practiceWords.length]: { name: 'Ultimate Treasure', icon: 'lni-crown' }
    };
    
    const milestones = getTreasureMilestones();
    console.log('🏴‍☠️ Checking treasure milestone:', correctCount, 'against milestones:', milestones);
    
    if (milestones.includes(correctCount)) {
      const treasure = treasureMap[correctCount];
      if (treasure) {
        setCurrentTreasure(treasure.name);
        playSound('cannon_achievement');
        
        // Red Boot celebrates with a random pirate phrase!
        const randomPhrase = treasurePhrases[Math.floor(Math.random() * treasurePhrases.length)];
        setTimeout(() => {
          speakTreasurePhrase(randomPhrase);
        }, 1000); // Slight delay after sound effect
        
        // Clear celebration after 3 seconds but don't interrupt practice flow
        setTimeout(() => {
          setCurrentTreasure(null);
        }, 3000);
        
        return true; // Treasure celebration triggered
      }
    }
    return false; // No treasure this time
  };

  // Initialize practice session
  useEffect(() => {
    // FIX 2: Read from simple localStorage instead of complex spellingStorage
    const savedWords = localStorage.getItem('currentSpellingWords');
    console.log('🎮 Game checking localStorage for words...');
    
    if (savedWords) {
      try {
        const data = JSON.parse(savedWords);
        const words = data.words || [];
        console.log('🎮 Game loaded words:', words);
        
        if (words.length > 0) {
          setPracticeWords(words);
          playCharacterVoice('red_boot_ahoy');
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved words:', e);
      }
    }
    
    console.log('❌ No words found in localStorage');
    toast({
      title: "No Words to Practice",
      description: "Add some spelling words first by taking a photo of your list!",
      variant: "destructive",
    });
    onCancel();
  }, [onCancel, playCharacterVoice, toast]);

  // Speak current word when it changes
  useEffect(() => {
    if (practiceWords.length > 0 && currentWordIndex < practiceWords.length && !showFeedback) {
      setIsWordSpoken(false);
      // Small delay to let Red Boot's greeting finish
      setTimeout(() => {
        speakCurrentWord();
      }, currentWordIndex === 0 ? 3000 : 1000);
    }
  }, [currentWordIndex, practiceWords, showFeedback]);

  const speakCurrentWord = () => {
    if (practiceWords.length > 0 && currentWordIndex < practiceWords.length) {
      const word = practiceWords[currentWordIndex];
      
      // Use speech synthesis to speak the word clearly
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8; // Slower for clarity
        utterance.volume = 0.9;
        
        // Fallback timeout in case speech synthesis fails silently
        const fallbackTimer = setTimeout(() => {
          console.log('Speech synthesis fallback timeout, enabling input');
          setIsWordSpoken(true);
        }, 3000);
        
        // Set up event handlers
        utterance.onend = () => {
          clearTimeout(fallbackTimer);
          setIsWordSpoken(true);
        };
        utterance.onerror = () => {
          console.log('Speech synthesis error, enabling input anyway');
          clearTimeout(fallbackTimer);
          setIsWordSpoken(true);
        };
        
        // Try to get a good voice
        const voices = speechSynthesis.getVoices();
        const goodVoice = voices.find(voice => 
          voice.lang.startsWith('en') && !voice.name.includes('Google')
        ) || voices[0];
        
        if (goodVoice) utterance.voice = goodVoice;
        
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Speech synthesis failed:', error);
          clearTimeout(fallbackTimer);
          setIsWordSpoken(true);
        }
      } else {
        setIsWordSpoken(true);
      }
    }
  };

  const handleSubmit = () => {
    if (!userInput.trim() || currentWordIndex >= getTotalWords()) return;
    
    const currentWord = getCurrentWord();
    const userAnswer = userInput.trim().toLowerCase();
    const correct = userAnswer === currentWord.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Save practice progress to localStorage for Captain's Log tracking
    if (currentWord) {
      const savedProgress = localStorage.getItem('practiceProgress');
      let progressData: any = {};
      
      try {
        progressData = savedProgress ? JSON.parse(savedProgress) : {};
      } catch (e) {
        progressData = {};
      }
      
      // Initialize word progress if not exists
      const wordKey = currentWord.toLowerCase();
      if (!progressData[wordKey]) {
        progressData[wordKey] = { correctCount: 0, totalAttempts: 0 };
      }
      
      // Update word progress
      progressData[wordKey].totalAttempts++;
      if (correct) {
        progressData[wordKey].correctCount++;
      }
      
      // Add practice session to history
      if (!progressData._practiceHistory) {
        progressData._practiceHistory = [];
      }
      progressData._practiceHistory.push({
        date: new Date().toISOString(),
        word: currentWord,
        correct: correct,
        userInput: userInput
      });
      
      // Save back to localStorage
      localStorage.setItem('practiceProgress', JSON.stringify(progressData));
      console.log('📊 Progress saved:', { word: currentWord, correct, progressData });
    }
    
    if (correct) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      setTreasureEarned(prev => prev + 1);
      playSound('spell_correct');
      playCharacterVoice('red_boot_great_job');
      
      // Check if we hit a treasure milestone
      const treasureShown = checkForTreasure(newCorrectCount);
      
      if (!treasureShown) {
        // Normal flow - move to next word after brief delay (only in feedback view)
        // The nextWord function will handle this transition
      }
    } else {
      // ADD this new tracking for wrong answers:
      setWordAttempts(prev => ({
        ...prev,
        [currentWord]: (prev[currentWord] || 0) + 1
      }));
      
      // If wrong twice, mark as tricky
      if ((wordAttempts[currentWord] || 0) >= 1) {
        if (!trickyWords.includes(currentWord)) {
          setTrickyWords(prev => [...prev, currentWord]);
        }
      }
      
      playSound('spell_incorrect');
      playCharacterVoice('red_boot_retry');
    }
  };

  const nextWord = () => {
    setUserInput('');
    setShowFeedback(false);
    setIsWordSpoken(false);
    
    const totalWordsForSession = getTotalWords();
    if (currentWordIndex >= totalWordsForSession - 1) {
      // Check if this is end of bonus round
      if (showBonusRound) {
        // Bonus round complete - finish immediately
        setIsComplete(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const results = {
          correct: finalCorrect,
          total: practiceWords.length, // Always use original word count for results
          treasureEarned
        };
        setSessionResults(results);
        
        playSound('cannon_achievement');
        playCharacterVoice('red_boot_adventure_complete');
        setTimeout(() => {
          onComplete(results);
        }, 2000);
      } else {
        // Main practice complete - check for bonus round
        setPracticeComplete(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const results = {
          correct: finalCorrect,
          total: practiceWords.length,
          treasureEarned
        };
        setSessionResults(results);
        
        // If no tricky words, complete immediately
        if (trickyWords.length === 0) {
          setIsComplete(true);
          playSound('cannon_achievement');
          playCharacterVoice('red_boot_adventure_complete');
          setTimeout(() => {
            onComplete(results);
          }, 2000);
        } else {
          // Show bonus round option - will be handled by modal
          playCharacterVoice('red_boot_bonus');
        }
      }
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const skipWord = () => {
    // Mark as incorrect when skipped (handled locally)
    
    playSound('anchor_button_click');
    nextWord();
  };

  const repeatWord = () => {
    playSound('anchor_button_click');
    speakCurrentWord();
  };

  // Handle treasure road close (not needed with new system)
  const handleTreasureRoadClose = () => {
    setShowTreasureRoad(false);
    if (sessionResults) {
      setTimeout(() => {
        onComplete(sessionResults);
      }, 500);
    }
  };

  if (isComplete) {
    return (
      <>
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6 text-center">
            <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
              <Coins className="w-12 h-12 text-yellow-800" />
            </div>
            
            <h2 className="text-3xl font-bold mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
              Adventure Complete!
            </h2>
            
            <p className="text-lg text-muted-foreground mb-6">
              Ye did magnificently, me hearty! 
            </p>
            
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex justify-center items-center gap-8 text-lg">
                <div className="text-center">
                  <div className="font-bold text-green-600">{sessionResults?.correct || 0}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600">{practiceWords.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-600">{treasureEarned}</div>
                  <div className="text-sm text-muted-foreground">Treasure</div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Treasure road now shows during practice at milestones, not at completion */}
      </>
    );
  }

  // ADD Step 4: End-of-session bonus screen
  if (practiceComplete && trickyWords.length > 0 && !showBonusRound && !isComplete) {
    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white/95 rounded-3xl p-8 max-w-lg w-full shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-4">⚡</div>
            <h3 className="text-2xl font-bold text-yellow-600 mb-4" style={{ fontFamily: 'var(--font-pirate)' }}>
              Captain! {trickyWords.length} treasures were buried extra deep!
            </h3>
            <p className="text-lg mb-6">
              Practice them again for bonus gold coins?
            </p>
            
            <div className="flex gap-4 justify-center">
              <button
                onClick={() => {
                  setBonusRoundWords(trickyWords);
                  setShowBonusRound(true);
                  setCurrentWordIndex(0);
                  setPracticeComplete(false);
                  setUserInput('');
                  setShowFeedback(false);
                  setIsWordSpoken(false);
                  // Play pirate voice
                  playCharacterVoice('red_boot_bonus');
                }}
                className="bg-yellow-500 hover:bg-yellow-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-colors"
                data-testid="button-bonus-round"
              >
                ⚡ Quick Practice ({trickyWords.length} words)
              </button>
              
              <button
                onClick={() => {
                  // Just close and finish
                  setIsComplete(true);
                  if (sessionResults) {
                    setTimeout(() => {
                      onComplete(sessionResults);
                    }, 1000);
                  }
                }}
                className="bg-gray-500 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg transition-colors"
                data-testid="button-skip-bonus"
              >
                Maybe Later
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (practiceWords.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-6 text-center">
          <p className="text-lg text-muted-foreground">Loading your practice words...</p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = getCurrentWord();
  const progress = ((currentWordIndex + 1) / getTotalWords()) * 100;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4">
      <div className="max-w-4xl mx-auto space-y-4">
        {/* Main Practice Card */}
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-6">
        {/* Header with back button, progress and treasure */}
        <div className="flex justify-between items-center mb-3">
          {/* Back button */}
          <Button
            variant="ghost"
            onClick={onCancel}
            className="text-blue-700 hover:text-blue-900 hover:bg-blue-50"
            data-testid="button-back-practice"
          >
            ← Back
          </Button>
          
          {/* Treasure counter */}
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{treasureEarned}</span>
          </div>
          
          {/* Progress */}
          <div className="text-center flex-1 max-w-md mx-4">
            <div className="text-sm text-muted-foreground mb-1">
              Word {currentWordIndex + 1} of {practiceWords.length}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          {/* Spacer for symmetry */}
          <div className="w-16"></div>
        </div>

        {showFeedback ? (
          // Feedback screen
          <div className="text-center">
            <div className={`w-16 h-16 rounded-full mx-auto mb-2 flex items-center justify-center ${
              isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCorrect ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h3 className={`text-xl font-bold mb-1 ${
              isCorrect ? 'text-green-600' : 'text-red-600'
            }`}>
              {isCorrect ? 'Correct!' : 'Not quite!'}
            </h3>
            
            {!isCorrect && (
              <div className="mb-4">
                <p className="text-muted-foreground mb-2">The correct spelling is:</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'var(--font-fun)' }}>
                  {currentWord}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={nextWord} 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                data-testid="button-next-word"
              >
                {currentWordIndex >= practiceWords.length - 1 ? 'Finish' : 'Next Word'}
              </Button>
            </div>
          </div>
        ) : (
          // Practice screen
          <div className="text-center">
            <div className="w-16 h-16 bg-blue-100 rounded-full mx-auto mb-3 flex items-center justify-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">?</span>
              </div>
            </div>
            
            <h3 className="text-lg mb-1" style={{ fontFamily: 'var(--font-pirate)' }}>
              Listen carefully and spell the word!
            </h3>
            
            <p className="text-muted-foreground mb-3">
              {isWordSpoken ? 'Type what you heard:' : 'Red Boot is saying the word...'}
            </p>
            
            {/* Spelling input with colorful letters */}
            <div className="mb-3 relative">
              {/* Hidden input for actual typing */}
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                className="opacity-0 absolute inset-0 z-10"
                style={{
                  fontSize: '48px',
                  letterSpacing: '8px',
                  padding: '20px 30px',
                  width: '85%',
                  maxWidth: '700px',
                  height: '90px',
                  margin: '0 auto',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontFamily: '"Fredoka One", cursive',
                  textTransform: 'uppercase',
                }}
                disabled={!isWordSpoken}
                autoFocus={isWordSpoken}
                data-testid="input-spelling"
              />
              
              {/* Visual display with colored letters */}
              <div 
                className="relative mx-auto flex items-center justify-center"
                style={{
                  fontSize: '48px',
                  letterSpacing: '8px',
                  padding: '20px 30px',
                  width: '85%',
                  maxWidth: '700px',
                  height: '90px',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontFamily: '"Fredoka One", cursive',
                  textTransform: 'uppercase',
                  border: '5px solid #FFD700',
                  borderRadius: '20px',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  pointerEvents: 'none'
                }}
              >
                {userInput ? (
                  <div className="flex" style={{ letterSpacing: '8px' }}>
                    {userInput.toUpperCase().split('').map((letter, index) => {
                      const blueShades = [
                        '#87CEEB', // Sky blue
                        '#4A90E2', // Medium blue
                        '#1E3A8A', // Dark blue
                        '#60A5FA', // Light blue
                        '#2563EB', // Royal blue
                        '#1D4ED8', // Strong blue
                      ];
                      return (
                        <span 
                          key={index} 
                          style={{ color: blueShades[index % blueShades.length] }}
                        >
                          {letter}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <div className="flex items-center gap-1" style={{ letterSpacing: '2px' }}>
                    <span style={{ 
                      background: 'linear-gradient(to right, #FF0000, #FF7F00, #FFFF00, #00FF00, #0000FF, #4B0082, #9400D3)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      backgroundClip: 'text',
                      fontWeight: '700'
                    }}>
                      type
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            {/* Action buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={repeatWord}
                variant="outline"
                disabled={!isWordSpoken}
                data-testid="button-repeat-word"
              >
                🔊 Repeat Word
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim() || !isWordSpoken}
                className="bg-green-600 hover:bg-green-700"
                data-testid="button-submit-spelling"
              >
                Submit
              </Button>
              
              <Button
                onClick={skipWord}
                variant="outline"
                className="text-yellow-600 hover:text-yellow-700"
                data-testid="button-skip-word"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip
              </Button>
            </div>
          </div>
        )}
        
        {/* Action buttons at bottom */}
        <div className="flex gap-3 justify-between mt-6">
          <Button 
            onClick={onCancel} 
            variant="outline"
            className="text-blue-700 hover:text-blue-900"
            data-testid="button-back-practice-bottom"
          >
            ← Back to Dashboard
          </Button>
          <div className="w-20">{/* Spacer for alignment */}</div>
        </div>
      </CardContent>
    </Card>
    
    {/* Always Visible Treasure Road - Large and Prominent */}
    <div className="w-full">
      <TreasureRoad
        totalWords={practiceWords.length}
        masteredWords={correctCount}
        treasureJustUnlocked={currentTreasure || undefined}
      />
    </div>
    
    {/* ADD Step 5: Visual indicator for bonus practice availability */}
    {trickyWords.length > 0 && !showBonusRound && (
      <div className="fixed bottom-4 right-4 animate-pulse" data-testid="bonus-indicator">
        <div className="bg-yellow-500/20 rounded-full p-3 shadow-lg">
          <span className="text-2xl">⚡</span>
        </div>
      </div>
    )}
    
    </div>
  </div>
  );
}