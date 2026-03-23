import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import { Headphones, ArrowRightCircle, Sparkles, CheckCircle, XCircle, X, HelpCircle } from 'lucide-react';
import { getFeedback, resetMessageHistory } from '@/utils/feedbackMessages';
import { spellingStorage } from '@/lib/localStorage';
import { buildAchievementsFromLocal } from '@/lib/achievements';
import sparkleSound from '@assets/sparkle-355937_1765236810252.mp3';
import TreasureRoad from './TreasureRoad';
import SeaMonsterBattle from './SeaMonsterBattle';
import VirtualKeyboard from './VirtualKeyboard';
import Paywall from './Paywall';
import { getSubscription, setFreeSessionUsed } from '@/lib/subscription';

const IS_TOUCH_DEVICE =
  typeof window !== 'undefined' &&
  window.matchMedia?.('(pointer: coarse)').matches === true;

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
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [isKeyboardOpen, setIsKeyboardOpen] = useState(false);

  // Paywall state
  const [showPaywall, setShowPaywall] = useState(false);
  const [paywallResults, setPaywallResults] = useState<{ correct: number; total: number; treasureEarned: number } | null>(null);
  const sessionSavedRef = useRef(false);
  
  // Tricky Treasures state
  const [trickyWords, setTrickyWords] = useState<string[]>([]);
  const [wordAttempts, setWordAttempts] = useState<{[word: string]: number}>({});
  const [showBonusRound, setShowBonusRound] = useState(false);
  const [bonusRoundWords, setBonusRoundWords] = useState<string[]>([]);
  const [practiceComplete, setPracticeComplete] = useState(false);
  const retryStartedRef = useRef(false);
  const hadMistakeRef = useRef(false);
  
  // Analytics tracking
  const [wordListId, setWordListId] = useState<string | null>(null);
  const [correctWordsArray, setCorrectWordsArray] = useState<string[]>([]);
  const [incorrectWordsArray, setIncorrectWordsArray] = useState<string[]>([]);
  const [sessionStartTime] = useState<number>(Date.now());
  
  const getTreasureMilestones = () => {
    const total = practiceWords.length;
    if (total === 0) return [];
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
    if (correctCount < 3) return 5;
    if (correctCount < 6) return 10;
    if (correctCount < 9) return 15;
    return 25;
  };

  // Badge state
  const [earnedBadge, setEarnedBadge] = useState<{ id: string; title: string; icon: string; rarity: string } | null>(null);
  const [childName, setChildName] = useState<string | undefined>(undefined);
  const [showBadgeOverlay, setShowBadgeOverlay] = useState(false);
  const [overlayFadingOut, setOverlayFadingOut] = useState(false);
  
  const celebrationJewelsRef = useRef<Array<{ treasure: string; delay: number; duration: number; left: number; size: number }>>([]);
  if (celebrationJewelsRef.current.length === 0) {
    const treasures = ['💎', '✨', '⭐', '🌟', '💫', '🪙', '👑', '💰', '🏆'];
    celebrationJewelsRef.current = Array.from({ length: 40 }).map((_, i) => ({
      treasure: treasures[i % treasures.length],
      delay: Math.random() * 1,
      duration: 3 + Math.random() * 2,
      left: Math.random() * 100,
      size: 2.5 + Math.random() * 2.5,
    }));
  }

  // Check which achievements are newly unlocked after a local data change
  const checkNewAchievements = (beforeEarnedIds: Set<string>): { id: string; title: string; icon: string; rarity: string } | null => {
    try {
      const { earned } = buildAchievementsFromLocal();
      const newlyEarned = earned.filter(ua => !beforeEarnedIds.has(ua.achievementId));
      if (newlyEarned.length > 0) {
        const badge = newlyEarned[0];
        return {
          id: badge.achievementId,
          title: badge.achievement.title,
          icon: badge.achievement.icon,
          rarity: badge.achievement.rarity
        };
      }
    } catch (error) {
      console.error('Failed to check achievements locally:', error);
    }
    return null;
  };

  // Save treasures and complete practice — fully local, no server calls
  const saveTreasuresAndComplete = (results: { correct: number; total: number; treasureEarned: number }) => {
    if (sessionSavedRef.current) return;
    sessionSavedRef.current = true;

    let badgeWasEarned = false;

    try {
      // Snapshot currently earned achievements before updating data
      let beforeEarnedIds = new Set<string>();
      try {
        const { earned } = buildAchievementsFromLocal();
        beforeEarnedIds = new Set(earned.map(ua => ua.achievementId));
      } catch { /* empty */ }

      // Add earned treasures to local storage
      spellingStorage.addTreasures(results.treasureEarned);

      // Check for any newly unlocked achievements
      const badge = checkNewAchievements(beforeEarnedIds);
      if (badge) {
        setEarnedBadge(badge);
        badgeWasEarned = true;
      }

      // Persist incorrect words for future tricky-words practice
      if (incorrectWordsArray.length > 0) {
        const trickyWordsData = {
          words: incorrectWordsArray,
          savedAt: new Date().toISOString(),
          character: selectedCharacter
        };
        localStorage.setItem('trickyWordsForPractice', JSON.stringify(trickyWordsData));
      } else {
        localStorage.removeItem('trickyWordsForPractice');
      }
    } catch (error) {
      console.error('Failed to save session locally:', error);
    }

    // PAYWALL: Show paywall after first free session instead of completing
    const sub = getSubscription();
    if (!sub.freeSessionUsed) {
      setFreeSessionUsed();
      setPaywallResults(results);
      setShowPaywall(true);
      return; // Do NOT call onComplete — paywall handles it
    }

    if (badgeWasEarned) {
      setTimeout(() => {
        onComplete(results);
      }, 21000);
    } else {
      onComplete(results);
    }
  };

  // Pirate celebration phrases
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

  // Helper functions for bonus round
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

  // Speech functions
  const speakTreasurePhrase = (phrase: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(phrase);
      utterance.rate = 0.75;
      utterance.volume = 1.0;
      utterance.pitch = 1.0;
      
      const voices = speechSynthesis.getVoices();
      const pirateVoice = voices.find(voice => 
        voice.lang.startsWith('en') && (voice.name.includes('Male') || !voice.name.includes('Google'))
      ) || voices[0];
      
      if (pirateVoice) utterance.voice = pirateVoice;
      speechSynthesis.speak(utterance);
    }
  };

  // Check for treasure milestone
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
    
    if (milestones.includes(correctCount)) {
      const treasure = treasureMap[correctCount];
      if (treasure) {
        setCurrentTreasure(treasure.name);
        playSound('cannon_achievement');
        
        const randomPhrase = treasurePhrases[Math.floor(Math.random() * treasurePhrases.length)];
        setTimeout(() => {
          speakTreasurePhrase(randomPhrase);
        }, 1000);
        
        setTimeout(() => {
          setCurrentTreasure(null);
        }, 3000);
        
        return true;
      }
    }
    return false;
  };

  // Load character on mount
  useEffect(() => {
    const character = localStorage.getItem('selectedCharacter') as 'redboot' | 'diego';
    if (character) {
      setSelectedCharacter(character);
    }
    const savedName = localStorage.getItem('redboot-child-name');
    if (savedName) {
      setChildName(savedName);
    }
  }, []);

  // Initialize practice session
  useEffect(() => {
    resetMessageHistory();
    
    const savedWords = localStorage.getItem('currentSpellingWords');
    
    if (savedWords) {
      try {
        const data = JSON.parse(savedWords);
        let words = data.words || [];
        const listId = data.wordListId || null;
        
        const savedTrickyData = localStorage.getItem('trickyWordsForPractice');
        if (savedTrickyData) {
          try {
            const trickyData = JSON.parse(savedTrickyData);
            const savedDate = new Date(trickyData.savedAt);
            const daysSince = Math.floor((Date.now() - savedDate.getTime()) / (1000 * 60 * 60 * 24));
            
            if (daysSince < 7 && trickyData.words && trickyData.words.length > 0) {
              const trickyWordsToAdd = trickyData.words.filter((w: string) => !words.includes(w));
              if (trickyWordsToAdd.length > 0) {
                words = [...trickyWordsToAdd, ...words];
              }
            }
            localStorage.removeItem('trickyWordsForPractice');
          } catch (e) {
            console.error('Failed to parse saved tricky words:', e);
          }
        }
        
        if (words.length > 0) {
          hadMistakeRef.current = false;
          retryStartedRef.current = false;
          setEarnedBadge(null);
          setPracticeWords(words);
          if (listId) {
            setWordListId(listId);
          }
          playCharacterVoice('red_boot_ahoy');
          return;
        }
      } catch (e) {
        console.error('Failed to parse saved words:', e);
      }
    }
    
    toast({
      title: "No Words to Practice",
      description: "Add some spelling words first by taking a photo of your list!",
      variant: "destructive",
    });
    onCancel();
  }, [onCancel, playCharacterVoice, toast]);

  // Speak word when it changes
  useEffect(() => {
    const totalWords = getTotalWords();
    if (totalWords > 0 && currentWordIndex < totalWords && !showFeedback) {
      setIsWordSpoken(false);
      setTimeout(() => {
        speakCurrentWord();
      }, currentWordIndex === 0 ? 3000 : 1000);
    }
  }, [currentWordIndex, practiceWords, bonusRoundWords, showBonusRound, showFeedback]);

  const speakCurrentWord = useCallback(() => {
    const totalWords = getTotalWords();
    if (totalWords > 0 && currentWordIndex < totalWords) {
      const word = getCurrentWord();
      
      if ('speechSynthesis' in window) {
        const speakWithVoice = () => {
          const utterance = new SpeechSynthesisUtterance(word);
          utterance.rate = 0.8;
          utterance.volume = 1.0;
          utterance.pitch = 1.0;
          
          const fallbackTimer = setTimeout(() => {
            setIsWordSpoken(true);
          }, 4000);
          
          utterance.onend = () => {
            clearTimeout(fallbackTimer);
            setIsWordSpoken(true);
          };
          utterance.onerror = () => {
            clearTimeout(fallbackTimer);
            setIsWordSpoken(true);
          };
          
          const voices = speechSynthesis.getVoices();
          const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
          const goodVoice = englishVoices.find(voice => 
            voice.name.includes('Samantha') || 
            voice.name.includes('Karen') ||
            voice.name.includes('Daniel') ||
            voice.name.includes('Alex') ||
            (!voice.name.includes('Google') && voice.localService)
          ) || englishVoices[0] || voices[0];
          
          if (goodVoice) utterance.voice = goodVoice;
          
          try {
            speechSynthesis.speak(utterance);
          } catch {
            clearTimeout(fallbackTimer);
            setIsWordSpoken(true);
          }
        };
        
        const voices = speechSynthesis.getVoices();
        if (voices.length > 0) {
          speakWithVoice();
        } else {
          let hasSpoken = false;
          const handleVoicesLoaded = () => {
            if (!hasSpoken) {
              hasSpoken = true;
              speechSynthesis.onvoiceschanged = null;
              speakWithVoice();
            }
          };
          speechSynthesis.onvoiceschanged = handleVoicesLoaded;
          setTimeout(() => {
            if (!hasSpoken) {
              hasSpoken = true;
              speechSynthesis.onvoiceschanged = null;
              speakWithVoice();
            }
          }, 500);
        }
      } else {
        setIsWordSpoken(true);
      }
    }
  }, [currentWordIndex, practiceWords, bonusRoundWords, showBonusRound]);

  const speakWordAgain = useCallback((word: string) => {
    if ('speechSynthesis' in window) {
      const speakWithVoice = () => {
        const utterance = new SpeechSynthesisUtterance(word);
        utterance.rate = 0.8;
        utterance.volume = 1.0;
        utterance.pitch = 1.0;
        
        const voices = speechSynthesis.getVoices();
        const englishVoices = voices.filter(voice => voice.lang.startsWith('en'));
        const goodVoice = englishVoices.find(voice => 
          voice.name.includes('Samantha') || 
          voice.name.includes('Karen') ||
          voice.name.includes('Daniel') ||
          voice.name.includes('Alex') ||
          (!voice.name.includes('Google') && voice.localService)
        ) || englishVoices[0] || voices[0];
        
        if (goodVoice) utterance.voice = goodVoice;
        
        try {
          speechSynthesis.speak(utterance);
        } catch (error) {
          console.error('Speech synthesis failed:', error);
        }
      };
      
      const voices = speechSynthesis.getVoices();
      if (voices.length > 0) {
        speakWithVoice();
      } else {
        let hasSpoken = false;
        speechSynthesis.onvoiceschanged = () => {
          if (!hasSpoken) {
            hasSpoken = true;
            speechSynthesis.onvoiceschanged = null;
            speakWithVoice();
          }
        };
        setTimeout(() => {
          if (!hasSpoken) {
            hasSpoken = true;
            speechSynthesis.onvoiceschanged = null;
            speakWithVoice();
          }
        }, 300);
      }
    }
  }, []);

  const handleVirtualKeyPress = (key: string) => {
    if (!isWordSpoken) return;
    if (key === 'BACKSPACE') {
      setUserInput(prev => prev.slice(0, -1));
    } else {
      setUserInput(prev => prev + key);
    }
  };

  const handleSubmit = () => {
    const submittedInput = userInput.trim();
    if (!submittedInput || currentWordIndex >= getTotalWords()) return;
    
    const currentWord = getCurrentWord();
    const userAnswer = submittedInput.toLowerCase();
    const correct = userAnswer === currentWord.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    setUserInput('');
    setIsKeyboardOpen(false);
    
    // Save progress to localStorage
    if (currentWord) {
      const savedProgress = localStorage.getItem('practiceProgress');
      let progressData: any = {};
      
      try {
        progressData = savedProgress ? JSON.parse(savedProgress) : {};
      } catch {
        progressData = {};
      }
      
      const wordKey = currentWord.toLowerCase();
      if (!progressData[wordKey]) {
        progressData[wordKey] = { correctCount: 0, totalAttempts: 0 };
      }
      
      progressData[wordKey].totalAttempts++;
      if (correct) {
        progressData[wordKey].correctCount++;
      }
      
      if (!progressData._practiceHistory) {
        progressData._practiceHistory = [];
      }
      progressData._practiceHistory.push({
        date: new Date().toISOString(),
        word: currentWord,
        correct: correct,
        userInput: submittedInput
      });
      
      localStorage.setItem('practiceProgress', JSON.stringify(progressData));
    }
    
    const gradeLevel = localStorage.getItem('redboot-grade-level');
    
    if (correct) {
      const newCorrectCount = correctCount + 1;
      setCorrectCount(newCorrectCount);
      const treasureAmount = getTreasureAmount(correctCount);
      setTreasureEarned(prev => prev + treasureAmount);
      playSound('spell_correct');
      
      if (!showBonusRound && !correctWordsArray.includes(currentWord)) {
        setCorrectWordsArray(prev => [...prev, currentWord]);
      }
      
      speakWordAgain(currentWord);
      setTimeout(() => {
        const feedbackMessage = getFeedback(gradeLevel, true, false);
        speakFeedback(feedbackMessage);
      }, 1200);
      
      const treasureShown = checkForTreasure(newCorrectCount);
      
      if (treasureShown) {
        setIsAutoAdvancing(true);
        setTimeout(() => {
          nextWord();
          setIsAutoAdvancing(false);
        }, 3500);
      }
    } else {
      const newAttemptCount = (wordAttempts[currentWord] || 0) + 1;
      
      setWordAttempts(prev => ({
        ...prev,
        [currentWord]: newAttemptCount
      }));
      
      if (!showBonusRound && !incorrectWordsArray.includes(currentWord)) {
        setIncorrectWordsArray(prev => [...prev, currentWord]);
      }
      
      hadMistakeRef.current = true;
      
      if (!showBonusRound && newAttemptCount === 1) {
        if (!trickyWords.includes(currentWord)) {
          setTrickyWords(prev => [...prev, currentWord]);
        }
      }
      
      playSound('spell_incorrect');
      
      speakWordAgain(currentWord);
      setTimeout(() => {
        const isRetry = showBonusRound;
        const feedbackMessage = getFeedback(gradeLevel, false, isRetry);
        speakFeedback(feedbackMessage);
      }, 1200);
    }
  };

  const nextWord = () => {
    setUserInput('');
    setShowFeedback(false);
    setIsWordSpoken(false);
    setIsKeyboardOpen(false);
    
    const totalWordsForSession = getTotalWords();
    if (currentWordIndex >= totalWordsForSession - 1) {
      if (showBonusRound) {
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const results = {
          correct: finalCorrect,
          total: practiceWords.length,
          treasureEarned
        };
        setSessionResults(results);
        
        // If first free session, show paywall immediately — don't set isComplete
        const sub = getSubscription();
        if (!sub.freeSessionUsed) {
          playAudioFile(sparkleSound, 0.8);
          saveTreasuresAndComplete(results);
        } else {
          setIsComplete(true);
          playAudioFile(sparkleSound, 0.8);
          playCharacterVoice('red_boot_adventure_complete');
          setTimeout(() => {
            saveTreasuresAndComplete(results);
          }, 2000);
        }
      } else {
        setPracticeComplete(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const results = {
          correct: finalCorrect,
          total: practiceWords.length,
          treasureEarned
        };
        setSessionResults(results);
        
        if (trickyWords.length === 0) {
          // If first free session, show paywall immediately — don't set isComplete
          const sub = getSubscription();
          if (!sub.freeSessionUsed) {
            playAudioFile(sparkleSound, 0.8);
            saveTreasuresAndComplete(results);
          } else {
            setIsComplete(true);
            playAudioFile(sparkleSound, 0.8);
            playCharacterVoice('red_boot_adventure_complete');
            setTimeout(() => {
              saveTreasuresAndComplete(results);
            }, 2000);
          }
        } else {
          if (retryStartedRef.current) return;
          retryStartedRef.current = true;
          
          const wordsToRetry = [...trickyWords];
          
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
    
    hadMistakeRef.current = true;
    
    if (!trickyWords.includes(currentWord)) {
      setTrickyWords(prev => [...prev, currentWord]);
    }
    
    playCharacterVoice('red_boot_skip');
    
    setTimeout(() => {
      nextWord();
    }, 2000);
  };

  const repeatWord = () => {
    speakCurrentWord();
  };

  // Badge celebration effect
  useEffect(() => {
    if (isComplete && earnedBadge) {
      setShowBadgeOverlay(true);
      playAudioFile(sparkleSound, 0.8);
      
      const badgeAnnouncement = getBadgeAnnouncement(earnedBadge.title, earnedBadge.rarity, childName);
      setTimeout(() => {
        speakFeedback(badgeAnnouncement);
      }, 1000);
      
      const fadeTimer = setTimeout(() => {
        setOverlayFadingOut(true);
      }, 19000);
      
      const hideTimer = setTimeout(() => {
        setShowBadgeOverlay(false);
        setOverlayFadingOut(false);
      }, 20000);
      
      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(hideTimer);
      };
    }
  }, [isComplete, earnedBadge, playAudioFile, speakFeedback, childName]);
  
  const getBadgeAnnouncement = (badgeTitle: string, rarity: string, name?: string): string => {
    const namePrefix = name ? `${name}, ` : '';
    
    const phrases: Record<string, string[]> = {
      legendary: [
        `${namePrefix}Shiver me timbers! Ye've earned the legendary ${badgeTitle} badge!`,
        `${namePrefix}Blow me down! The ${badgeTitle} badge is yours! Ye be a true legend!`,
      ],
      epic: [
        `${namePrefix}Arrr! Ye've earned the epic ${badgeTitle} badge!`,
        `${namePrefix}Hoist the colors! The ${badgeTitle} badge is yours!`,
      ],
      rare: [
        `${namePrefix}Avast! Ye've found the rare ${badgeTitle} badge!`,
        `${namePrefix}Yo ho ho! The ${badgeTitle} badge is yours!`,
      ],
      common: [
        `${namePrefix}Ahoy! Ye've earned the ${badgeTitle} badge!`,
        `${namePrefix}Well done, me hearty! The ${badgeTitle} badge is yours!`,
      ]
    };
    
    const selected = phrases[rarity] || phrases.common;
    return selected[Math.floor(Math.random() * selected.length)];
  };

  // PAYWALL — show after first free session completes
  if (showPaywall && paywallResults) {
    const paywallChildName = localStorage.getItem('redboot-child-name') || 'Your child';
    return (
      <Paywall
        correct={paywallResults.correct}
        total={paywallResults.total}
        childName={paywallChildName}
        onMaybeLater={() => {
          setShowPaywall(false);
          const r = paywallResults;
          if (r) onComplete(r);
        }}
      />
    );
  }

  // COMPLETION SCREEN
  if (isComplete) {
    const masteredWords = correctWordsArray.filter(w => !incorrectWordsArray.includes(w));
    const needsPracticeWords = incorrectWordsArray;
    const isPerfectScore = !hadMistakeRef.current;
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-200 to-teal-200 p-4 relative overflow-hidden">
        {/* Badge Celebration Overlay */}
        {showBadgeOverlay && earnedBadge && (
          <div className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm transition-opacity duration-1000 ${overlayFadingOut ? 'opacity-0' : 'opacity-100'}`}>
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
            
            <div className="text-center px-4 z-10">
              <div 
                className="w-48 h-48 rounded-full mx-auto mb-8 flex items-center justify-center border-4"
                style={{
                  background: earnedBadge.rarity === 'legendary' 
                    ? 'linear-gradient(135deg, #FFD700, #FFA500)'
                    : earnedBadge.rarity === 'epic'
                    ? 'linear-gradient(135deg, #9333EA, #A855F7)'
                    : 'linear-gradient(135deg, #2563EB, #3B82F6)',
                  borderColor: '#FFD700',
                  boxShadow: '0 0 60px rgba(255, 215, 0, 0.9)',
                }}
              >
                <span className="text-8xl">{earnedBadge.icon}</span>
              </div>
              <h1 className="text-5xl font-bold text-yellow-300 mb-4">🏅 NEW BADGE! 🏅</h1>
              <h2 className="text-4xl font-bold text-white mb-2">{earnedBadge.title}</h2>
              <div className="inline-block px-4 py-2 rounded-full text-xl font-bold bg-yellow-500 text-black">
                {earnedBadge.rarity.toUpperCase()}
              </div>
            </div>
          </div>
        )}
        
        {/* Completion Card */}
        <div className="max-w-2xl mx-auto bg-white/90 backdrop-blur-xl rounded-[3rem] p-8 shadow-2xl border-4 border-white/50">
          <div className="text-center">
            <div className="w-24 h-24 bg-yellow-400 rounded-full mx-auto mb-4 flex items-center justify-center text-5xl">
              🎉
            </div>
            
            <h2 className="text-3xl font-black mb-2 text-slate-800">
              Adventure Complete!
            </h2>
            
            <p className="text-lg text-slate-600 mb-6">
              {isPerfectScore 
                ? "Shiver me timbers! Ye got them ALL right!" 
                : "Ye did great, me hearty!"}
            </p>
            
            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-4 mb-6">
              <div className="flex justify-center items-center gap-8 text-lg">
                <div className="text-center">
                  <div className="font-black text-green-600 text-3xl">{sessionResults?.correct || 0}</div>
                  <div className="text-sm text-slate-500">Correct</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-blue-600 text-3xl">{practiceWords.length}</div>
                  <div className="text-sm text-slate-500">Total</div>
                </div>
                <div className="text-center">
                  <div className="font-black text-yellow-600 text-3xl">{treasureEarned}</div>
                  <div className="text-sm text-slate-500">Treasure</div>
                </div>
              </div>
            </div>
            
            {masteredWords.length > 0 && (
              <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-4 mb-4 text-left">
                <h3 className="font-bold text-green-700 mb-2">⭐ Words Mastered!</h3>
                <div className="flex flex-wrap gap-2">
                  {masteredWords.map((word, i) => (
                    <span key={i} className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                      {word} ✓
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            {needsPracticeWords.length > 0 && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 mb-4 text-left">
                <h3 className="font-bold text-amber-700 mb-2">🏴‍☠️ Tricky Words!</h3>
                <div className="flex flex-wrap gap-2">
                  {needsPracticeWords.map((word, i) => (
                    <span key={i} className="bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium border-2 border-amber-300">
                      {word}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <Button 
              onClick={onCancel}
              className="w-full py-6 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-xl shadow-lg hover:from-amber-500 hover:to-orange-600"
            >
              🏠 Back to Ship
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // LOADING STATE
  if (practiceWords.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-200 to-teal-200 flex items-center justify-center">
        <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-8 text-center">
          <p className="text-lg text-slate-600">Loading your practice words...</p>
        </div>
      </div>
    );
  }

  const currentWord = getCurrentWord();
  const progress = ((currentWordIndex + 1) / getTotalWords()) * 100;

  // MAIN GAME UI - NEW 2026 DESIGN
  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-300 via-cyan-200 to-teal-200 flex flex-col relative overflow-hidden transition-colors duration-300">
      {/* Floating clouds background */}
      <div className="absolute top-10 left-10 opacity-40 animate-float text-white text-9xl blur-sm" style={{ animationDuration: '8s' }}>☁️</div>
      <div className="absolute top-20 right-20 opacity-30 animate-float text-white text-[10rem] blur-md" style={{ animationDuration: '12s', animationDelay: '2s' }}>☁️</div>

      <main
        className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto p-4 md:p-6 gap-4 md:gap-6"
        style={{ paddingBottom: IS_TOUCH_DEVICE && isKeyboardOpen ? '280px' : '0' }}
      >
        {/* HEADER BAR */}
        <header className="clay-header w-full relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400"></div>
          
          <div className="flex items-center gap-6 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-black uppercase tracking-wider text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-2xl animate-wiggle" style={{ textShadow: '2px 2px 4px rgba(0,0,0,0.3)' }}>⛵</span>
                  <span>Adventure Progress</span>
                </div>
                <span className="bg-white/50 px-3 py-1 rounded-full text-indigo-600">
                  Word {currentWordIndex + 1} of {getTotalWords()}
                  {showBonusRound && <span className="ml-2 text-yellow-500">⚡ Bonus</span>}
                </span>
              </div>
              <div className="clay-progress-container">
                <div 
                  className="clay-progress-fill"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="btn-stop ml-4"
            >
              <X className="w-5 h-5" />
              <span className="hidden md:block">Stop Playing</span>
            </button>
          </div>
        </header>

        {/* MAIN CONTENT */}
        <div className="flex-1 flex flex-col lg:flex-row gap-4 md:gap-6 overflow-hidden pb-4">
          {/* LEFT PANEL - INPUT */}
          <section className="lg:w-1/3 w-full flex flex-col justify-center">
            <div className="bg-white/75 backdrop-blur-2xl rounded-[3rem] p-6 md:p-8 shadow-2xl border-4 border-white/50 flex flex-col items-center text-center relative overflow-hidden group hover:scale-[1.01] transition-all duration-500">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-blue-400/20 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-20 -right-20 w-64 h-64 bg-yellow-400/20 rounded-full blur-3xl"></div>
              
              {showFeedback ? (
                /* FEEDBACK SCREEN */
                <div className="relative z-10 w-full">
                  <div className={`w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center ${isCorrect ? 'bg-green-100' : 'bg-red-100'}`}>
                    {isCorrect ? (
                      <CheckCircle className="w-12 h-12 text-green-600" />
                    ) : (
                      <XCircle className="w-12 h-12 text-red-600" />
                    )}
                  </div>
                  
                  <h3 className={`text-2xl font-black mb-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                    {isCorrect ? 'Correct!' : 'Not quite!'}
                  </h3>
                  
                  {!isCorrect && (
                    <div className="mb-4">
                      <p className="text-slate-500 mb-2">The correct spelling is:</p>
                      <p className="text-4xl font-black text-red-500" style={{ textShadow: '0 0 20px rgba(255, 49, 49, 0.4)' }}>
                        {currentWord}
                      </p>
                    </div>
                  )}
                  
                  <button 
                    onClick={nextWord} 
                    disabled={isAutoAdvancing}
                    className="btn-next-word flex items-center justify-center gap-2"
                  >
                    {isAutoAdvancing ? '✨ Celebrating...' : (currentWordIndex >= getTotalWords() - 1 ? '🎉 Finish' : '➡️ Next Word')}
                  </button>
                </div>
              ) : (
                /* INPUT SCREEN */
                <>
                  <button className="clay-help-icon relative z-10">
                    <HelpCircle className="w-7 h-7" />
                  </button>
                  
                  <h2 className="clay-listen-badge relative z-10">
                    LISTEN & SPELL
                  </h2>
                  
                  <p className="relative z-10 text-slate-700 text-xl mb-6 font-bold leading-relaxed">
                    Captain Red Boot says: <br/>
                    <span className="text-2xl text-amber-500 drop-shadow-sm">
                      {isWordSpoken ? '"Type the magic word!"' : '"Listen carefully..."'}
                    </span>
                  </p>
                  
                  {/* COLORFUL INPUT */}
                  <div className="relative z-10 w-full mb-6">
                    <div
                      className="clay-input-container"
                      onClick={() => { if (IS_TOUCH_DEVICE && isWordSpoken && !showFeedback) setIsKeyboardOpen(true); }}
                    >
                      <div className="relative bg-white rounded-[14px] flex justify-center items-center h-36 overflow-hidden px-3">
                        <Input
                          value={userInput}
                          readOnly={IS_TOUCH_DEVICE}
                          inputMode={IS_TOUCH_DEVICE ? 'none' : undefined}
                          onChange={IS_TOUCH_DEVICE ? undefined : (e) => { if (isWordSpoken && !showFeedback) setUserInput(e.target.value); }}
                          autoComplete="off"
                          autoCorrect="off"
                          autoCapitalize="off"
                          spellCheck={false}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                          disabled={!isWordSpoken}
                          data-testid="input-spelling"
                        />
                        <div className="flex gap-2 select-none cursor-text flex-wrap justify-center items-center">
                          {userInput ? (
                            <>
                              {userInput.toUpperCase().split('').map((letter, index) => {
                                const CLAY_COLORS = [
                                  { light: '#FF7B7B', dark: '#EF4444' },
                                  { light: '#FCD34D', dark: '#F59E0B' },
                                  { light: '#4ADE80', dark: '#10B981' },
                                  { light: '#60A5FA', dark: '#3B82F6' },
                                  { light: '#C084FC', dark: '#8B5CF6' },
                                  { light: '#F472B6', dark: '#EC4899' },
                                ];
                                const c = CLAY_COLORS[index % CLAY_COLORS.length];
                                return (
                                  <div
                                    key={index}
                                    style={{
                                      width: 50,
                                      height: 60,
                                      borderRadius: 13,
                                      background: `linear-gradient(150deg, ${c.light} 0%, ${c.dark} 100%)`,
                                      boxShadow: `inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.08)`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      fontFamily: "'Fredoka One', cursive",
                                      fontSize: 30,
                                      color: 'white',
                                      textShadow: '0 1px 3px rgba(0,0,0,0.2)',
                                      flexShrink: 0,
                                    }}
                                  >
                                    {letter}
                                  </div>
                                );
                              })}
                              {(() => {
                                const CLAY_COLORS = [
                                  { light: '#FF7B7B', dark: '#EF4444' },
                                  { light: '#FCD34D', dark: '#F59E0B' },
                                  { light: '#4ADE80', dark: '#10B981' },
                                  { light: '#60A5FA', dark: '#3B82F6' },
                                  { light: '#C084FC', dark: '#8B5CF6' },
                                  { light: '#F472B6', dark: '#EC4899' },
                                ];
                                const cur = CLAY_COLORS[userInput.length % CLAY_COLORS.length];
                                return (
                                  <div style={{
                                    width: 5,
                                    height: 60,
                                    borderRadius: 4,
                                    background: `linear-gradient(150deg, ${cur.light} 0%, ${cur.dark} 100%)`,
                                    boxShadow: `inset 0 2px 0 rgba(255,255,255,0.45), inset 0 -2px 0 rgba(0,0,0,0.08)`,
                                    animation: 'blink-cursor 0.9s ease-in-out infinite',
                                    flexShrink: 0,
                                  }} />
                                );
                              })()}
                            </>
                          ) : (
                            ['T', 'Y', 'P', 'E'].map((letter, index) => {
                              const PLACEHOLDER_COLORS = [
                                { light: '#FCA5A5', dark: '#F87171' },
                                { light: '#FDE68A', dark: '#FBBF24' },
                                { light: '#6EE7B7', dark: '#34D399' },
                                { light: '#93C5FD', dark: '#60A5FA' },
                              ];
                              const p = PLACEHOLDER_COLORS[index];
                              return (
                                <div
                                  key={index}
                                  style={{
                                    width: 50,
                                    height: 60,
                                    borderRadius: 13,
                                    background: `linear-gradient(150deg, ${p.light} 0%, ${p.dark} 100%)`,
                                    boxShadow: `inset 0 2px 0 rgba(255,255,255,0.35), inset 0 -2px 0 rgba(0,0,0,0.06)`,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontFamily: "'Fredoka One', cursive",
                                    fontSize: 30,
                                    color: 'white',
                                    textShadow: '0 1px 2px rgba(0,0,0,0.15)',
                                    opacity: 0.38,
                                    flexShrink: 0,
                                  }}
                                >
                                  {letter}
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* ACTION BUTTONS */}
                  <div className="relative z-10 flex flex-wrap justify-center gap-4 w-full mb-6">
                    <button 
                      onClick={repeatWord}
                      disabled={!isWordSpoken}
                      className="btn-hear-it min-w-[120px]"
                    >
                      <Headphones className="w-6 h-6" />
                      <span>Hear It</span>
                    </button>
                    <button 
                      onClick={skipWord}
                      className="btn-skip min-w-[120px]"
                    >
                      <ArrowRightCircle className="w-6 h-6" />
                      <span>Skip</span>
                    </button>
                  </div>
                  
                  {/* SUBMIT BUTTON */}
                  <button 
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || !isWordSpoken}
                    className="btn-check-spelling relative z-10 flex items-center justify-center gap-3"
                  >
                    <Sparkles className="w-7 h-7" />
                    CHECK SPELLING
                  </button>
                </>
              )}
            </div>
          </section>

          {/* RIGHT PANEL - TREASURE MAP (Red Boot) or SEA MONSTER BATTLE (Diego) */}
          <section className="flex-1 min-h-[300px] lg:min-h-0">
            {selectedCharacter === 'diego' ? (
              <SeaMonsterBattle
                totalWords={getTotalWords()}
                masteredWords={correctCount}
                treasureJustUnlocked={currentTreasure ? true : undefined}
              />
            ) : (
              <TreasureRoad 
                totalWords={getTotalWords()} 
                masteredWords={correctCount} 
                treasureJustUnlocked={currentTreasure || undefined}
              />
            )}
          </section>
        </div>
      </main>
      
      {/* Bonus round indicator */}
      {trickyWords.length > 0 && !showBonusRound && !isWordSpoken && (
        <div className="fixed bottom-4 right-4 animate-pulse z-40">
          <div className="bg-yellow-500/20 rounded-full p-3 shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      )}

      {/* Virtual Keyboard — touch devices only */}
      {IS_TOUCH_DEVICE && (
        <VirtualKeyboard
          isVisible={isKeyboardOpen}
          onKeyPress={handleVirtualKeyPress}
          playSound={() => playSound('anchor_button_click', 0.18)}
          onDismiss={() => setIsKeyboardOpen(false)}
        />
      )}
    </div>
  );
}
