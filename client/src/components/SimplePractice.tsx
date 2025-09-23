import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import { spellingStorage } from '@/lib/localStorage';
import { Coins, SkipForward, CheckCircle, XCircle } from 'lucide-react';

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
  
  const { toast } = useToast();
  const { playSound, playCharacterVoice } = useAudio();

  // Initialize practice session
  useEffect(() => {
    const todaysWords = spellingStorage.getTodaysPracticeWords();
    if (todaysWords.length === 0) {
      toast({
        title: "No Words to Practice",
        description: "Add some spelling words first by taking a photo of your list!",
        variant: "destructive",
      });
      onCancel();
      return;
    }
    
    setPracticeWords(todaysWords);
    playCharacterVoice('red_boot_ahoy');
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

  const handleSubmit = () => {
    if (!userInput.trim() || currentWordIndex >= practiceWords.length) return;
    
    const currentWord = practiceWords[currentWordIndex];
    const userAnswer = userInput.trim().toLowerCase();
    const correct = userAnswer === currentWord.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
    // Update storage with practice result
    spellingStorage.updateWordPractice(currentWord, correct);
    
    if (correct) {
      setCorrectCount(prev => prev + 1);
      setTreasureEarned(prev => prev + 1);
      playSound('spell_correct');
      playCharacterVoice('red_boot_great_job');
    } else {
      playSound('spell_incorrect');
      playCharacterVoice('red_boot_try_again');
    }
  };

  const nextWord = () => {
    setUserInput('');
    setShowFeedback(false);
    setIsWordSpoken(false);
    
    if (currentWordIndex >= practiceWords.length - 1) {
      // Practice complete
      setIsComplete(true);
      spellingStorage.recordPracticeSession(practiceWords.length, correctCount + (isCorrect ? 1 : 0));
      playSound('cannon_achievement');
      playCharacterVoice('red_boot_adventure_complete');
      
      setTimeout(() => {
        onComplete({
          correct: correctCount + (isCorrect ? 1 : 0),
          total: practiceWords.length,
          treasureEarned
        });
      }, 2000);
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const skipWord = () => {
    // Mark as incorrect when skipped
    const currentWord = practiceWords[currentWordIndex];
    spellingStorage.updateWordPractice(currentWord, false);
    
    playSound('anchor_button_click');
    nextWord();
  };

  const repeatWord = () => {
    playSound('anchor_button_click');
    speakCurrentWord();
  };

  if (isComplete) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
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
                <div className="font-bold text-green-600">{correctCount + (isCorrect ? 1 : 0)}</div>
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
    );
  }

  if (practiceWords.length === 0) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Loading your practice words...</p>
        </CardContent>
      </Card>
    );
  }

  const currentWord = practiceWords[currentWordIndex];
  const progress = ((currentWordIndex + 1) / practiceWords.length) * 100;

  return (
    <Card className="max-w-2xl mx-auto">
      <CardContent className="p-8">
        {/* Header with progress and treasure */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-2">
            <Coins className="w-5 h-5 text-yellow-500" />
            <span className="font-bold">{treasureEarned}</span>
          </div>
          
          <div className="text-center flex-1 mx-4">
            <div className="text-sm text-muted-foreground mb-1">
              Word {currentWordIndex + 1} of {practiceWords.length}
            </div>
            <Progress value={progress} className="w-full" />
          </div>
          
          <Button 
            onClick={onCancel} 
            variant="outline" 
            size="sm"
            data-testid="button-cancel-practice"
          >
            Cancel
          </Button>
        </div>

        {showFeedback ? (
          // Feedback screen
          <div className="text-center">
            <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${
              isCorrect ? 'bg-green-100' : 'bg-red-100'
            }`}>
              {isCorrect ? (
                <CheckCircle className="w-10 h-10 text-green-600" />
              ) : (
                <XCircle className="w-10 h-10 text-red-600" />
              )}
            </div>
            
            <h3 className={`text-2xl font-bold mb-2 ${
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
            
            <div className="mt-6">
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
            <div className="w-20 h-20 bg-blue-100 rounded-full mx-auto mb-6 flex items-center justify-center">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center">
                <span className="text-white font-bold">?</span>
              </div>
            </div>
            
            <h3 className="text-xl mb-2" style={{ fontFamily: 'var(--font-pirate)' }}>
              Listen carefully and spell the word!
            </h3>
            
            <p className="text-muted-foreground mb-6">
              {isWordSpoken ? 'Type what you heard:' : 'Red Boot is saying the word...'}
            </p>
            
            {/* Spelling input */}
            <div className="mb-6">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder={isWordSpoken ? "Type the spelling here..." : "Wait for the word..."}
                className="text-center text-xl py-4 max-w-md mx-auto"
                disabled={!isWordSpoken}
                autoFocus={isWordSpoken}
                data-testid="input-spelling"
              />
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
      </CardContent>
    </Card>
  );
}