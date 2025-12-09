import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import TreasureRoad from '@/components/TreasureRoad';
import SeaMonsterBattle from '@/components/SeaMonsterBattle';
import { Coins, SkipForward, CheckCircle, XCircle, X } from 'lucide-react';
import { getFeedback, resetMessageHistory } from '@/utils/feedbackMessages';
import { apiRequest } from '@/lib/queryClient';
import sparkleSound from '@assets/sparkle-355937_1765236810252.mp3';

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
  const [currentTreasure, setCurrentTreasure] = useState<string | null>(null);
  const [selectedCharacter, setSelectedCharacter] = useState<'redboot' | 'diego'>('redboot');
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false); // Prevents double-advance on treasure milestones
  
  // ADD these new state variables for Tricky Treasures
  const [trickyWords, setTrickyWords] = useState<string[]>([]);
  const [wordAttempts, setWordAttempts] = useState<{[word: string]: number}>({});
  const [showBonusRound, setShowBonusRound] = useState(false);
  const [bonusRoundWords, setBonusRoundWords] = useState<string[]>([]);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const retryStartedRef = useRef(false); // Ref to prevent multiple retry triggers
  const hadMistakeRef = useRef(false); // Track if ANY mistake was ever made during session (for badge eligibility)
  
  // Track wordListId and correct/incorrect words for analytics
  const [wordListId, setWordListId] = useState<string | null>(null);
  const [correctWordsArray, setCorrectWordsArray] = useState<string[]>([]);
  const [incorrectWordsArray, setIncorrectWordsArray] = useState<string[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  
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
  const { playSound, playCharacterVoice, speakFeedback, playAudioFile } = useAudio();

  // Escalating treasure reward system
  const getTreasureAmount = (correctCount: number): number => {
    if (correctCount < 3) return 5;   // First 3 words → 5 treasures each
    if (correctCount < 6) return 10;  // Next 3 words → 10 treasures each
    if (correctCount < 9) return 15;  // Next 3 words → 15 treasures each
    return 25;                        // Final words → 25 treasures each
  };

  // State to track newly earned badge for prominent display
  const [earnedBadge, setEarnedBadge] = useState<{ id: string; title: string; icon: string; rarity: string } | null>(null);
  
  // State for full-screen badge celebration overlay
  const [showBadgeOverlay, setShowBadgeOverlay] = useState(false);
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);
  
  // Cache jewel positions to prevent jitter during fade-out
  const celebrationJewelsRef = useRef<Array<{ treasure: string; delay: number; duration: number; left: number; size: number }>>([]);
  if (celebrationJewelsRef.current.length === 0) {
    const treasures = ['💎', '✨', '⭐', '🌟', '💫', '🪙', '👑', '💰', '🏆'];
    celebrationJewelsRef.current = Array.from({ length: 30 }).map((_, i) => ({
      treasure: treasures[i % treasures.length],
      delay: Math.random() * 2,
      duration: 2.5 + Math.random() * 2,
      left: Math.random() * 100,
      size: 2 + Math.random() * 2,
    }));
  }

  // Check and award next perfect run badge in sequence - ONLY on perfect score
  const checkAndAwardAchievements = async (results: { correct: number; total: number; treasureEarned: number }): Promise<{ id: string; title: string; icon: string; rarity: string } | null> => {
    // Only award badge on TRUE PERFECT score - no mistakes EVER during the session
    // Use ref instead of state to avoid stale closure issues
    const hadAnyMistake = hadMistakeRef.current;
    const isPerfectScore = results.total > 0 && !hadAnyMistake;
    
    if (!isPerfectScore) {
      return null; // No badge for imperfect sessions
    }
    
    try {
      // Call the new progressive badge endpoint
      const response = await apiRequest('/api/achievements/perfect-run', 'POST', {
        wordsTotal: results.total
      });
      const result = await response.json();
      
      // If a new badge was awarded, use the badge info from the server
      if (result.awarded && result.badge) {
        const badge = {
          id: result.badge.id,
          title: result.badge.title,
          icon: result.badge.icon,
          rarity: result.badge.rarity
        };
        setEarnedBadge(badge);
        return badge;
      }
      
      // User has all 6 badges - still perfect but no new badge to award
      if (result.allBadgesEarned) {
        console.log('All badges earned! Perfect run count:', result.perfectRunCount);
      }
    } catch (error) {
      console.error('Failed to award perfect run achievement:', error);
      // Ensure no stale badge celebration on error
      setEarnedBadge(null);
    }
    
    return null;
  };

  // Save treasures to database and complete practice
  const saveTreasuresAndComplete = async (results: { correct: number; total: number; treasureEarned: number }) => {
    try {
      // Save treasures to database - server handles achievement checking
      const response = await apiRequest('/api/treasures/add', 'POST', {
        character: selectedCharacter,
        amount: results.treasureEarned
      });
      const data = await response.json();
      
      // Check for perfect session badge (client-side triggers) - ONLY on perfect score
      await checkAndAwardAchievements(results);
      
      // SAVE PROGRESS FOR ANALYTICS - only if we have a valid wordListId
      if (wordListId) {
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        await apiRequest('/api/progress', 'POST', {
          wordListId: wordListId,
          characterUsed: selectedCharacter === 'redboot' ? 'red-boot' : 'diego',
          correctWords: correctWordsArray,
          incorrectWords: incorrectWordsArray,
          timeSpent: sessionDuration,
          score: Math.round((results.correct / results.total) * 100)
        });
      }
      
      // SAVE TRICKY WORDS FOR NEXT-DAY PRACTICE
      if (incorrectWordsArray.length > 0) {
        const trickyWordsData = {
          words: incorrectWordsArray,
          savedAt: new Date().toISOString(),
          character: selectedCharacter
        };
        localStorage.setItem('trickyWordsForPractice', JSON.stringify(trickyWordsData));
      } else {
        // Clear tricky words if perfect score
        localStorage.removeItem('trickyWordsForPractice');
      }
    } catch (error) {
      console.error('Failed to save treasures:', error);
      // Continue even if save fails - don't block completion
    }
    onComplete(results);
  };

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
  // Use bonusRoundWords as the frozen snapshot during retry round
  const getCurrentWord = () => {
    if (showBonusRound && bonusRoundWords.length > 0) {
      return bonusRoundWords[currentWordIndex] || bonusRoundWords[0];
    }
    return practiceWords[currentWordIndex];
  };
  
  const getTotalWords = () => {
    if (showBonusRound && bonusRoundWords.length > 0) {
      return bonusRoundWords.length;
    }
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

  // Load selected character
  useEffect(() => {
    const character = localStorage.getItem('selectedCharacter') as 'redboot' | 'diego';
    if (character) {
      setSelectedCharacter(character);
    }
  }, []);

  // Initialize practice session
  useEffect(() => {
    // Reset message history for fresh feedback variety
    resetMessageHistory();
    
    // FIX 2: Read from simple localStorage instead of complex spellingStorage
    const savedWords = localStorage.getItem('currentSpellingWords');
    console.log('🎮 Game checking localStorage for words...');
    
    if (savedWords) {
      try {
        const data = JSON.parse(savedWords);
        let words = data.words || [];
        const listId = data.wordListId || null;
        
        // AUTO-INCLUDE saved tricky words from last session at the START
        const savedTrickyData = localStorage.getItem('trickyWordsForPractice');
        if (savedTrickyData) {
          try {
            const trickyData = JSON.parse(savedTrickyData);
            const savedDate = new Date(trickyData.savedAt);
            const daysSince = Math.floor((Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            // Include tricky words if saved within last 7 days
            if (daysSince < 7 && trickyData.words && trickyData.words.length > 0) {
              // Prepend tricky words to the beginning (they practice these first!)
              const trickyWordsToAdd = trickyData.words.filter((w: string) => !words.includes(w));
              if (trickyWordsToAdd.length > 0) {
                words = [...trickyWordsToAdd, ...words];
                console.log('🔄 Added saved tricky words to practice:', trickyWordsToAdd);
              }
            }
            // Clear saved tricky words - they're now in this session
            localStorage.removeItem('trickyWordsForPractice');
          } catch (e) {
            console.error('Failed to parse saved tricky words:', e);
          }
        }
        
        console.log('🎮 Game loaded words:', words, 'wordListId:', listId);
        
        if (words.length > 0) {
          // Reset session state for fresh practice
          hadMistakeRef.current = false;
          retryStartedRef.current = false;
          setEarnedBadge(null); // Clear any previous badge celebration
          setPracticeWords(words);
          setWordListId(listId);
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

  // Speak current word when it changes (works for both main and bonus rounds)
  useEffect(() => {
    const totalWords = getTotalWords();
    if (totalWords > 0 && currentWordIndex < totalWords && !showFeedback) {
      setIsWordSpoken(false);
      // Small delay to let Red Boot's greeting finish
      setTimeout(() => {
        speakCurrentWord();
      }, currentWordIndex === 0 ? 3000 : 1000);
    }
  }, [currentWordIndex, practiceWords, bonusRoundWords, showBonusRound, showFeedback]);

  const speakCurrentWord = () => {
    const totalWords = getTotalWords();
    if (totalWords > 0 && currentWordIndex < totalWords) {
      const word = getCurrentWord();
      
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

  // Speak a specific word (used to repeat after submission)
  const speakWordAgain = (word: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.volume = 0.9;
      
      const voices = speechSynthesis.getVoices();
      const goodVoice = voices.find(voice => 
        voice.lang.startsWith('en') && !voice.name.includes('Google')
      ) || voices[0];
      
      if (goodVoice) utterance.voice = goodVoice;
      
      try {
        speechSynthesis.speak(utterance);
      } catch (error) {
        console.error('Speech synthesis failed:', error);
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
    
    // Get grade level from localStorage for age-appropriate feedback
    const gradeLevel = localStorage.getItem('redboot-grade-level');
    
    if (correct) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      const treasureAmount = getTreasureAmount(correctCount);
      setTreasureEarned(prev => prev + treasureAmount);
      playSound('spell_correct');
      
      // Track correct word for analytics (only during main round)
      if (!showBonusRound && !correctWordsArray.includes(currentWord)) {
        setCorrectWordsArray(prev => [...prev, currentWord]);
      }
      
      // Record correct attempt for tricky word tracking (helps master tricky words)
      apiRequest('/api/tricky-words/attempt', 'POST', { word: currentWord, correct: true }).catch(err => {
        console.error('Failed to record correct attempt:', err);
      });
      
      // First repeat the word, then give feedback
      speakWordAgain(currentWord);
      setTimeout(() => {
        // Speak grade-appropriate correct feedback after word is repeated
        const feedbackMessage = getFeedback(gradeLevel, true, false);
        speakFeedback(feedbackMessage);
      }, 1200); // Delay to let word finish speaking
      
      // Check if we hit a treasure milestone
      const treasureShown = checkForTreasure(newCorrectCount);
      
      if (treasureShown) {
        // Treasure milestone! Auto-advance after celebration completes (3.5 seconds)
        setIsAutoAdvancing(true);
        setTimeout(() => {
          nextWord();
          setIsAutoAdvancing(false);
        }, 3500);
      }
      // For non-treasure words, user clicks "Next Word" button manually
    } else {
      // Calculate new attempt count FIRST (fixes async state timing bug)
      const newAttemptCount = (wordAttempts[currentWord] || 0) + 1;
      
      // Update state with calculated value
      setWordAttempts(prev => ({
        ...prev,
        [currentWord]: newAttemptCount
      }));
      
      // Track incorrect word for analytics (only during main round)
      if (!showBonusRound && !incorrectWordsArray.includes(currentWord)) {
        setIncorrectWordsArray(prev => [...prev, currentWord]);
      }
      
      // Mark that a mistake was made (persists through session for badge eligibility)
      hadMistakeRef.current = true;
      
      // Add to tricky words on FIRST wrong attempt (not second)
      // This ensures retry round always has words to practice
      if (!showBonusRound && newAttemptCount === 1) {
        if (!trickyWords.includes(currentWord)) {
          setTrickyWords(prev => [...prev, currentWord]);
          // Persist tricky word to database
          apiRequest('/api/tricky-words', 'POST', { word: currentWord }).catch(err => {
            console.error('Failed to save tricky word:', err);
          });
        }
      }
      
      // Record attempt for tricky word tracking
      apiRequest('/api/tricky-words/attempt', 'POST', { word: currentWord, correct: false }).catch(err => {
        console.error('Failed to record tricky word attempt:', err);
      });
      
      playSound('spell_incorrect');
      
      // First repeat the word, then give feedback
      speakWordAgain(currentWord);
      setTimeout(() => {
        // Speak grade-appropriate wrong feedback after word is repeated
        // showBonusRound tells us if this is a retry attempt
        const isRetry = showBonusRound;
        const feedbackMessage = getFeedback(gradeLevel, false, isRetry);
        speakFeedback(feedbackMessage);
      }, 1200); // Delay to let word finish speaking
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
        
        playAudioFile(sparkleSound, 0.8); // Magical sparkle for completion
        playCharacterVoice('red_boot_adventure_complete');
        setTimeout(() => {
          saveTreasuresAndComplete(results);
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
          playAudioFile(sparkleSound, 0.8); // Magical sparkle for completion
          playCharacterVoice('red_boot_adventure_complete');
          setTimeout(() => {
            saveTreasuresAndComplete(results);
          }, 2000);
        } else {
          // AUTOMATIC retry round - no opt-out (research-aligned: desirable difficulties)
          // Use ref to prevent multiple triggers (ref updates synchronously, no race condition)
          if (retryStartedRef.current) return;
          retryStartedRef.current = true;
          
          // Freeze tricky words synchronously into local variable
          const wordsToRetry = [...trickyWords];
          
          // Update all state in a single batch - React will batch these
          setBonusRoundWords(wordsToRetry);
          setTrickyWords([]);
          setShowBonusRound(true);
          setCurrentWordIndex(0);
          setPracticeComplete(false);
          setUserInput('');
          setShowFeedback(false);
          setIsWordSpoken(false);
          playCharacterVoice('red_boot_retry');
        }
      }
    } else {
      setCurrentWordIndex(prev => prev + 1);
    }
  };

  const skipWord = () => {
    const currentWord = getCurrentWord();
    
    // Mark that a mistake was made (skipping counts as not perfect)
    hadMistakeRef.current = true;
    
    // Add skipped word to tricky words queue for bonus round
    if (!trickyWords.includes(currentWord)) {
      setTrickyWords(prev => [...prev, currentWord]);
      // Persist skipped word as tricky to database
      apiRequest('/api/tricky-words', 'POST', { word: currentWord }).catch(err => {
        console.error('Failed to save skipped word as tricky:', err);
      });
    }
    
    // Red Boot says it's okay, we'll try again later
    playCharacterVoice('red_boot_skip');
    
    // Move to next word after brief delay
    setTimeout(() => {
      nextWord();
    }, 2000); // Give voice time to speak
  };

  const repeatWord = () => {
    speakCurrentWord();
  };

  // Show full-screen badge overlay and play sparkle sound when badge is earned
  useEffect(() => {
    if (isComplete && !hadMistakeRef.current && earnedBadge) {
      // Show full-screen overlay
      setShowBadgeOverlay(true);
      playAudioFile(sparkleSound, 0.8);
      
      // After 4 seconds, start fade out
      const fadeTimer = setTimeout(() => {
        setOverlayFadingOut(true);
      }, 4000);
      
      // After 5 seconds (fade complete), hide overlay
      const hideTimer = setTimeout(() => {
        setShowBadgeOverlay(false);
        setOverlayFadingOut(false);
      }, 5000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isComplete, earnedBadge, playAudioFile]);

  if (isComplete) {
    // Determine which words were mastered vs need practice
    const masteredWords = correctWordsArray.filter(w => !incorrectWordsArray.includes(w));
    const needsPracticeWords = incorrectWordsArray;
    // Use the immutable ref to determine true perfect score (no mistakes EVER)
    const isPerfectScore = !hadMistakeRef.current;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-400 via-cyan-500 to-teal-600 p-4 relative overflow-hidden">
        {/* FULL-SCREEN BADGE CELEBRATION OVERLAY */}
        {showBadgeOverlay && earnedBadge && (
          <div className={`badge-celebration-overlay ${overlayFadingOut ? 'fade-out' : ''}`}>
            {/* Shimmering Jewels Animation - Full screen (using cached positions to prevent jitter) */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
              {celebrationJewelsRef.current.map((jewel, i) => (
                <div
                  key={i}
                  className="absolute"
                  style={{
                    left: `${jewel.left}%`,
                    top: '-60px',
                    fontSize: `${jewel.size}rem`,
                    animation: `fall ${jewel.duration}s ease-in ${jewel.delay}s infinite`,
                    opacity: 0.95,
                  }}
                >
                  {jewel.treasure}
                </div>
              ))}
            </div>
            
            {/* Badge Content - Centered */}
            <div className="badge-celebration-content text-center px-4 z-10">
              {/* Large Badge Icon */}
              <div className="badge-celebration-icon mx-auto mb-6 badge-sparkle">
                <span className="text-7xl sm:text-8xl">{earnedBadge.icon}</span>
              </div>
              
              {/* Badge Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-yellow-300 mb-4 drop-shadow-lg" style={{ fontFamily: 'var(--font-pirate)' }}>
                🏅 Badge Earned! 🏅
              </h1>
              
              <div className="bg-gradient-to-r from-yellow-400/20 to-amber-400/20 backdrop-blur-sm border-2 border-yellow-400 rounded-2xl p-6 max-w-md mx-auto">
                <h2 className="text-3xl sm:text-4xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-pirate)' }}>
                  {earnedBadge.title}
                </h2>
                <p className="text-xl text-yellow-200">Ye spelled every word perfectly!</p>
              </div>
            </div>
          </div>
        )}
        
        {/* Original Shimmering Jewels Animation - Only for perfect score with badge (inside completion card) */}
        {isPerfectScore && earnedBadge && !showBadgeOverlay && (
          <div className="absolute inset-0 pointer-events-none">
            {/* Falling jewels/treasures */}
            {Array.from({ length: 20 }).map((_, i) => {
              const treasures = ['💎', '✨', '⭐', '🌟', '💫', '🪙', '👑'];
              const treasure = treasures[i % treasures.length];
              const delay = Math.random() * 3;
              const duration = 3 + Math.random() * 2;
              const left = Math.random() * 100;
              const size = 1.5 + Math.random() * 1.5;
              
              return (
                <div
                  key={i}
                  className="absolute animate-bounce"
                  style={{
                    left: `${left}%`,
                    top: '-50px',
                    fontSize: `${size}rem`,
                    animation: `fall ${duration}s ease-in ${delay}s infinite`,
                    opacity: 0.9,
                  }}
                >
                  {treasure}
                </div>
              );
            })}
          </div>
        )}
        
        <Card className="max-w-2xl mx-auto relative z-10">
          <CardContent className="p-6 text-center">
            {/* Badge Celebration - Prominent display for perfect score */}
            {isPerfectScore && earnedBadge ? (
              <div className="mb-6">
                {/* Large Badge Display with glow */}
                <div className="relative inline-block">
                  <div 
                    className="w-32 h-32 rounded-full mx-auto mb-4 flex items-center justify-center badge-sparkle badge-particles"
                    style={{
                      background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%)',
                      boxShadow: '0 0 40px rgba(255, 215, 0, 0.6), 0 0 80px rgba(255, 165, 0, 0.4)',
                      animation: 'pulse 2s ease-in-out infinite',
                    }}
                  >
                    <span className="text-6xl treasure-sparkle">{earnedBadge.icon}</span>
                  </div>
                  {/* Sparkle ring around badge */}
                  <div 
                    className="absolute inset-0 rounded-full"
                    style={{
                      border: '3px solid rgba(255, 215, 0, 0.5)',
                      animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                    }}
                  />
                </div>
                
                <h2 className="text-3xl font-bold mb-2 text-yellow-600" style={{ fontFamily: 'var(--font-pirate)' }}>
                  🏅 Badge Earned! 🏅
                </h2>
                <div className="bg-gradient-to-r from-yellow-100 to-amber-100 border-2 border-yellow-400 rounded-xl p-4 mb-4">
                  <h3 className="text-2xl font-bold text-amber-700" style={{ fontFamily: 'var(--font-pirate)' }}>
                    {earnedBadge.title}
                  </h3>
                  <p className="text-amber-600 mt-1">Ye spelled every word perfectly!</p>
                </div>
              </div>
            ) : (
              /* Regular completion header for non-perfect scores */
              <>
                <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <Coins className="w-12 h-12 text-yellow-800" />
                </div>
                
                <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'var(--font-pirate)' }}>
                  Adventure Complete!
                </h2>
                
                <p className="text-lg text-muted-foreground mb-4">
                  {isPerfectScore 
                    ? "Shiver me timbers! Ye got them ALL right!" 
                    : "Ye did great, me hearty! Let's see how ye did!"}
                </p>
              </>
            )}
            
            {/* Stats Summary */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
              <div className="flex justify-center items-center gap-8 text-lg">
                <div className="text-center">
                  <div className="font-bold text-green-600 text-2xl">{sessionResults?.correct || 0}</div>
                  <div className="text-sm text-muted-foreground">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-blue-600 text-2xl">{practiceWords.length}</div>
                  <div className="text-sm text-muted-foreground">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-bold text-yellow-600 text-2xl">{treasureEarned}</div>
                  <div className="text-sm text-muted-foreground">Treasure</div>
                </div>
              </div>
            </div>
            
            {/* Words Mastered Section */}
            {masteredWords.length > 0 && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">⭐</span>
                  <h3 className="font-bold text-green-700 text-lg">Words Ye Mastered!</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {masteredWords.map((word, index) => (
                    <span 
                      key={index}
                      className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {word} ✓
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Words to Practice Section */}
            {needsPracticeWords.length > 0 && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-4 text-left">
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-2xl">🏴‍☠️</span>
                  <h3 className="font-bold text-amber-700 text-lg">Tricky Words to Practice!</h3>
                </div>
                <p className="text-sm text-amber-600 mb-3">
                  These sneaky words tried to escape, but ye'll catch them next time!
                </p>
                <div className="flex flex-wrap gap-2">
                  {needsPracticeWords.map((word, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 rounded-full text-sm font-bold"
                      style={{ 
                        backgroundColor: '#FFF3E0',
                        color: '#E65100',
                        border: '2px solid #FF9800'
                      }}
                    >
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {/* Encouragement Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <p className="text-blue-700 font-medium">
                {isPerfectScore 
                  ? "🎉 Perfect score! Ye be a true spelling champion!" 
                  : `💪 Great effort! Practice these ${needsPracticeWords.length} tricky word${needsPracticeWords.length > 1 ? 's' : ''} and ye'll master them in no time!`}
              </p>
            </div>
            
            {/* Action Button */}
            <Button 
              onClick={onCancel}
              className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-bold px-8 py-3 text-lg rounded-xl shadow-lg"
              data-testid="button-finish-adventure"
            >
              🏠 Back to Ship
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Retry round now starts automatically in nextWord() - no modal needed

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
      {/* Exit Button - Top right corner */}
      <div className="absolute top-4 right-4 z-50">
        <Button
          onClick={onCancel}
          variant="outline"
          className="bg-white/90 hover:bg-white text-gray-700 hover:text-gray-900 font-semibold px-6 py-3 shadow-lg"
          data-testid="button-back-to-dashboard"
        >
          <X className="w-5 h-5 mr-2" />
          Exit Practice
        </Button>
      </div>
      
      <div className="max-w-4xl mx-auto pt-2">
        {/* Progress Header - Raised higher in Blue Area */}
        <div className="text-center mb-3">
          <div className="text-base text-white font-bold mb-3">
            Word {currentWordIndex + 1} of {getTotalWords()}
            {showBonusRound && <span className="ml-2 text-yellow-300">⚡ Bonus Round</span>}
          </div>
          <Progress value={progress} className="w-full max-w-md mx-auto" />
        </div>

        {/* Main Practice Card - Moved up close to progress bar */}
    <Card className="max-w-2xl mx-auto mt-2 bg-white border-amber-200">
      <CardContent className="p-6">
        {/* Treasure Collection Display - At very top of white card */}
        {treasureEarned > 0 && (
          <div className="mb-4">
            <div className="text-center mb-3">
              <div className="flex items-center justify-center gap-2 mb-2">
                <Coins className="w-6 h-6 text-yellow-500" />
                <span className="font-bold text-lg">Treasures Collected: {treasureEarned}</span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center gap-2 sm:gap-3 p-2 sm:p-4">
              {Array.from({ length: Math.min(treasureEarned, 12) }).map((_, index) => {
                // Cycle through different treasure types
                const treasureTypes = ['💎', '🪙', '👑', '💰', '⭐', '🏆'];
                const treasure = treasureTypes[index % treasureTypes.length];
                
                return (
                  <div
                    key={index}
                    className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-xl sm:text-2xl md:text-3xl"
                    style={{
                      animation: 'spin 8s linear infinite',
                      filter: 'drop-shadow(0 0 10px rgba(255, 215, 0, 0.8)) drop-shadow(0 0 20px rgba(255, 215, 0, 0.4))',
                    }}
                  >
                    {treasure}
                  </div>
                );
              })}
              {treasureEarned > 12 && (
                <div className="w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 flex items-center justify-center text-sm sm:text-base font-bold text-yellow-600">
                  +{treasureEarned - 12}
                </div>
              )}
            </div>
          </div>
        )}

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
                <p 
                  className="text-3xl font-bold"
                  style={{ 
                    fontFamily: 'var(--font-fun)',
                    color: '#FF3131',
                    textShadow: '0 0 10px rgba(255, 49, 49, 0.6), 0 0 20px rgba(255, 49, 49, 0.4), 0 0 30px rgba(255, 49, 49, 0.2)'
                  }}
                >
                  {currentWord}
                </p>
              </div>
            )}
            
            <div className="mt-4">
              <Button 
                onClick={nextWord} 
                className="bg-blue-600 hover:bg-blue-700 px-8"
                data-testid="button-next-word"
                disabled={isAutoAdvancing}
              >
                {isAutoAdvancing ? 'Celebrating...' : (currentWordIndex >= getTotalWords() - 1 ? 'Finish' : 'Next Word')}
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
                className="opacity-0 absolute inset-0 z-10 text-2xl sm:text-3xl md:text-5xl"
                style={{
                  letterSpacing: 'clamp(4px, 1.5vw, 8px)',
                  padding: 'clamp(12px, 3vw, 20px) clamp(15px, 4vw, 30px)',
                  width: '90%',
                  maxWidth: '700px',
                  height: 'clamp(60px, 12vw, 90px)',
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
                className="relative mx-auto flex items-center justify-center text-2xl sm:text-3xl md:text-5xl"
                style={{
                  letterSpacing: 'clamp(4px, 1.5vw, 8px)',
                  padding: 'clamp(12px, 3vw, 20px) clamp(15px, 4vw, 30px)',
                  width: '90%',
                  maxWidth: '700px',
                  height: 'clamp(60px, 12vw, 90px)',
                  textAlign: 'center',
                  fontWeight: '600',
                  fontFamily: '"Fredoka One", cursive',
                  textTransform: 'uppercase',
                  border: 'clamp(3px, 0.8vw, 5px) solid #FFD700',
                  borderRadius: 'clamp(12px, 3vw, 20px)',
                  backgroundColor: '#FFFFFF',
                  boxShadow: '0 6px 20px rgba(0,0,0,0.15)',
                  pointerEvents: 'none'
                }}
              >
                {userInput ? (
                  <div className="flex" style={{ letterSpacing: 'clamp(4px, 1.5vw, 8px)' }}>
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
                  <div className="flex items-center gap-1" style={{ letterSpacing: 'clamp(1px, 0.5vw, 2px)' }}>
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
            
            {/* Action buttons - 2025 modern styling with proper mobile layout */}
            <div className="flex flex-wrap gap-2 sm:gap-3 justify-center items-center">
              <Button
                onClick={repeatWord}
                variant="outline"
                disabled={!isWordSpoken}
                className="rounded-xl min-h-[44px] px-4 py-2.5 text-sm sm:text-base border-2 border-blue-300 bg-blue-50 text-blue-700 hover:border-blue-400 hover:bg-blue-100 transition-colors duration-200 motion-safe:hover:scale-[1.02] shadow-sm"
                data-testid="button-repeat-word"
              >
                🔊 Repeat
              </Button>
              
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim() || !isWordSpoken}
                className="rounded-xl min-h-[44px] px-5 sm:px-6 py-2.5 text-sm sm:text-base bg-gradient-to-r from-orange-400 to-amber-500 hover:from-orange-500 hover:to-amber-600 text-white font-bold shadow-lg transition-colors duration-200 motion-safe:hover:scale-[1.02] disabled:opacity-50"
                data-testid="button-submit-spelling"
              >
                ⚓ Submit
              </Button>
              
              <Button
                onClick={skipWord}
                variant="outline"
                className="rounded-xl min-h-[44px] px-4 py-2.5 text-sm sm:text-base border-2 border-amber-300 bg-amber-50 text-amber-700 hover:border-amber-400 hover:bg-amber-100 transition-colors duration-200 motion-safe:hover:scale-[1.02] shadow-sm"
                data-testid="button-skip-word"
              >
                <SkipForward className="w-4 h-4 mr-1" />
                Skip
              </Button>
            </div>
            
            {/* Cancel button centered below with proper spacing */}
            <div className="flex justify-center mt-5">
              <Button 
                onClick={onCancel} 
                variant="outline"
                className="rounded-xl min-h-[40px] px-5 py-2 text-sm border border-gray-300 text-gray-600 hover:text-gray-800 hover:bg-gray-100 hover:border-gray-400 transition-colors duration-200"
                data-testid="button-cancel-practice"
              >
                Cancel
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
    
    {/* Adventure Mode - Red Boot's Treasure Hunt OR Diego's Sea Monster Battle */}
    <div className="w-full">
      {selectedCharacter === 'redboot' ? (
        <TreasureRoad
          totalWords={practiceWords.length}
          masteredWords={correctCount}
          treasureJustUnlocked={currentTreasure || undefined}
        />
      ) : (
        <SeaMonsterBattle
          totalWords={practiceWords.length}
          masteredWords={correctCount}
          treasureJustUnlocked={!!currentTreasure}
        />
      )}
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