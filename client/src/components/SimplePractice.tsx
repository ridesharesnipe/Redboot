import { useState, useEffect, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { useAudio } from '@/contexts/AudioContext';
import { Volume2, SkipForward, CheckCircle, XCircle, X, HelpCircle, Package, Compass, Lock } from 'lucide-react';
import { getFeedback, resetMessageHistory } from '@/utils/feedbackMessages';
import { apiRequest } from '@/lib/queryClient';
import sparkleSound from '@assets/sparkle-355937_1765236810252.mp3';
import redBootImage from '@assets/17586438224363330781733458024019_1758643831046.png';

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

  // Check and award achievements
  const checkAndAwardAchievements = async (results: { correct: number; total: number; treasureEarned: number }, totalTreasures: number): Promise<{ id: string; title: string; icon: string; rarity: string } | null> => {
    const hadAnyMistake = hadMistakeRef.current;
    const isPerfectScore = results.total > 0 && !hadAnyMistake;
    
    try {
      const response = await apiRequest('POST', '/api/achievements/check-all', {
        isPerfect: isPerfectScore,
        wordsCorrect: results.correct,
        treasureTotal: totalTreasures
      });
      const result = await response.json();
      
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
    } catch (error) {
      console.error('Failed to check achievements:', error);
      setEarnedBadge(null);
    }
    
    return null;
  };

  // Save treasures and complete practice
  const saveTreasuresAndComplete = async (results: { correct: number; total: number; treasureEarned: number }) => {
    let badgeWasEarned = false;
    
    try {
      const response = await apiRequest('POST', '/api/treasures/add', {
        character: selectedCharacter,
        amount: results.treasureEarned
      });
      const data = await response.json();
      const totalTreasures = data.totalTreasures || data.newTotal || 0;
      
      const badge = await checkAndAwardAchievements(results, totalTreasures);
      badgeWasEarned = badge !== null;
      
      if (wordListId) {
        const sessionDuration = Math.round((Date.now() - sessionStartTime) / 1000);
        await apiRequest('POST', '/api/progress', {
          wordListId: wordListId,
          characterUsed: selectedCharacter === 'redboot' ? 'red-boot' : 'diego',
          correctWords: correctWordsArray,
          incorrectWords: incorrectWordsArray,
          timeSpent: sessionDuration,
          score: Math.round((results.correct / results.total) * 100)
        });
      }
      
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
      console.error('Failed to save treasures:', error);
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
    const savedName = localStorage.getItem('childName');
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
          setWordListId(listId);
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

  const handleSubmit = () => {
    if (!userInput.trim() || currentWordIndex >= getTotalWords()) return;
    
    const currentWord = getCurrentWord();
    const userAnswer = userInput.trim().toLowerCase();
    const correct = userAnswer === currentWord.toLowerCase();
    
    setIsCorrect(correct);
    setShowFeedback(true);
    
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
        userInput: userInput
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
      
      apiRequest('POST', '/api/tricky-words/attempt', { word: currentWord, correct: true }).catch(() => {});
      
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
          apiRequest('POST', '/api/tricky-words', { word: currentWord }).catch(() => {});
        }
      }
      
      apiRequest('POST', '/api/tricky-words/attempt', { word: currentWord, correct: false }).catch(() => {});
      
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
    
    const totalWordsForSession = getTotalWords();
    if (currentWordIndex >= totalWordsForSession - 1) {
      if (showBonusRound) {
        setIsComplete(true);
        const finalCorrect = correctCount + (isCorrect ? 1 : 0);
        const results = {
          correct: finalCorrect,
          total: practiceWords.length,
          treasureEarned
        };
        setSessionResults(results);
        
        playAudioFile(sparkleSound, 0.8);
        playCharacterVoice('red_boot_adventure_complete');
        setTimeout(() => {
          saveTreasuresAndComplete(results);
        }, 2000);
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
          setIsComplete(true);
          playAudioFile(sparkleSound, 0.8);
          playCharacterVoice('red_boot_adventure_complete');
          setTimeout(() => {
            saveTreasuresAndComplete(results);
          }, 2000);
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
      apiRequest('POST', '/api/tricky-words', { word: currentWord }).catch(() => {});
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

      <main className="relative z-10 flex flex-col h-full w-full max-w-7xl mx-auto p-4 md:p-6 gap-4 md:gap-6">
        {/* HEADER BAR */}
        <header className="w-full flex justify-between items-center bg-white/75 backdrop-blur-xl rounded-[2rem] p-4 shadow-lg border-4 border-white/40 relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-pink-400 via-yellow-400 to-cyan-400"></div>
          
          <div className="flex items-center gap-6 w-full">
            <div className="flex-1 flex flex-col gap-2">
              <div className="flex justify-between items-center text-sm font-black uppercase tracking-wider text-slate-600">
                <div className="flex items-center gap-2">
                  <span className="text-emerald-500 animate-wiggle">🐾</span>
                  <span>Adventure Progress</span>
                </div>
                <span className="bg-white/50 px-3 py-1 rounded-full text-indigo-600">
                  Word {currentWordIndex + 1} of {getTotalWords()}
                  {showBonusRound && <span className="ml-2 text-yellow-500">⚡ Bonus</span>}
                </span>
              </div>
              <div className="h-5 w-full bg-white/60 rounded-full overflow-hidden p-1 shadow-inner">
                <div 
                  className="h-full bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full shadow-[0_0_15px_rgba(245,158,11,0.6)] relative overflow-hidden transition-all duration-500"
                  style={{ width: `${progress}%` }}
                >
                  <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                </div>
              </div>
            </div>
            
            <button 
              onClick={onCancel}
              className="ml-4 p-3 pr-5 rounded-full bg-white/80 hover:bg-white transition-all text-slate-600 flex items-center gap-3 group shadow-lg hover:shadow-xl border-2 border-transparent hover:border-red-400"
            >
              <div className="bg-red-100 p-2 rounded-full group-hover:bg-red-200 transition-colors">
                <X className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
              </div>
              <span className="text-base font-extrabold hidden md:block group-hover:text-red-500 transition-colors">Stop Playing</span>
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
                  
                  <Button 
                    onClick={nextWord} 
                    disabled={isAutoAdvancing}
                    className="w-full py-5 rounded-2xl bg-gradient-to-b from-blue-500 to-blue-600 text-white font-black text-xl shadow-lg hover:from-blue-600 hover:to-blue-700"
                  >
                    {isAutoAdvancing ? '✨ Celebrating...' : (currentWordIndex >= getTotalWords() - 1 ? '🎉 Finish' : '➡️ Next Word')}
                  </Button>
                </div>
              ) : (
                /* INPUT SCREEN */
                <>
                  <button className="relative z-10 mb-4 h-14 w-14 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform border-4 border-white/30">
                    <HelpCircle className="w-8 h-8" />
                  </button>
                  
                  <h2 className="relative z-10 text-indigo-500 font-black text-base uppercase tracking-widest mb-2 bg-indigo-100 px-4 py-1 rounded-full">
                    Listen &amp; Spell
                  </h2>
                  
                  <p className="relative z-10 text-slate-700 text-xl mb-6 font-bold leading-relaxed">
                    Captain Red Boot barks: <br/>
                    <span className="text-2xl text-amber-500 drop-shadow-sm">
                      {isWordSpoken ? '"Type the magic word!"' : '"Listen carefully..."'}
                    </span>
                  </p>
                  
                  {/* COLORFUL INPUT */}
                  <div className="relative z-10 w-full mb-6 transform hover:scale-105 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 rounded-[2rem] blur-md opacity-40 group-hover:opacity-60 transition-opacity duration-500 animate-pulse"></div>
                    <div className="relative bg-white rounded-[2rem] border-4 border-indigo-200 p-2 shadow-inner flex justify-center items-center h-28 overflow-hidden">
                      <Input
                        value={userInput}
                        onChange={(e) => setUserInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && handleSubmit()}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-text z-20"
                        disabled={!isWordSpoken}
                        autoFocus={isWordSpoken}
                        data-testid="input-spelling"
                      />
                      <div className="text-5xl font-black tracking-widest uppercase flex gap-1 select-none cursor-text">
                        {userInput ? (
                          userInput.toUpperCase().split('').map((letter, index) => {
                            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899'];
                            return (
                              <span 
                                key={index} 
                                className="animate-bounce-letter"
                                style={{ 
                                  color: colors[index % colors.length],
                                  animationDelay: `${index * 0.1}s`
                                }}
                              >
                                {letter}
                              </span>
                            );
                          })
                        ) : (
                          ['T', 'Y', 'P', 'E'].map((letter, index) => {
                            const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6'];
                            return (
                              <span 
                                key={index}
                                className="animate-bounce-letter opacity-40"
                                style={{ 
                                  color: colors[index],
                                  animationDelay: `${index * 0.1}s`
                                }}
                              >
                                {letter}
                              </span>
                            );
                          })
                        )}
                      </div>
                    </div>
                  </div>
                  
                  {/* ACTION BUTTONS */}
                  <div className="relative z-10 flex flex-wrap justify-center gap-4 w-full mb-6">
                    <button 
                      onClick={repeatWord}
                      disabled={!isWordSpoken}
                      className="flex-1 min-w-[120px] py-4 px-4 rounded-2xl bg-white text-slate-700 font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-slate-100 disabled:opacity-50 disabled:cursor-not-allowed group/btn"
                    >
                      <Volume2 className="w-7 h-7 text-blue-500 group-hover/btn:scale-110 transition-transform" />
                      <span className="text-lg">Hear It</span>
                    </button>
                    <button 
                      onClick={skipWord}
                      className="flex-1 min-w-[120px] py-4 px-4 rounded-2xl bg-white text-slate-700 font-bold shadow-lg hover:-translate-y-1 transition-all flex items-center justify-center gap-2 border-2 border-slate-100 group/btn"
                    >
                      <SkipForward className="w-7 h-7 text-amber-500 group-hover/btn:rotate-180 transition-transform duration-500" />
                      <span className="text-lg">Skip</span>
                    </button>
                  </div>
                  
                  {/* SUBMIT BUTTON */}
                  <button 
                    onClick={handleSubmit}
                    disabled={!userInput.trim() || !isWordSpoken}
                    className="relative z-10 w-full py-5 rounded-2xl bg-gradient-to-b from-amber-400 to-orange-500 text-white font-black text-2xl shadow-[0_6px_0_rgb(180,83,9)] hover:shadow-[0_4px_0_rgb(180,83,9)] hover:translate-y-[2px] active:translate-y-[6px] active:shadow-none transition-all flex items-center justify-center gap-3 border-t-2 border-yellow-300 relative overflow-hidden group/submit disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <span className="absolute inset-0 bg-white/20 translate-y-full group-hover/submit:translate-y-0 transition-transform duration-300 rounded-2xl"></span>
                    <CheckCircle className="w-8 h-8 animate-bounce" />
                    CHECK SPELLING
                  </button>
                </>
              )}
            </div>
          </section>

          {/* RIGHT PANEL - ISLAND MAP */}
          <section className="flex-1 relative rounded-[3rem] overflow-hidden shadow-2xl border-8 border-white bg-cyan-400 group isolate min-h-[300px] lg:min-h-0">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-teal-500 transition-transform duration-[20s] ease-linear group-hover:scale-110"></div>
            <div className="absolute inset-0 opacity-30 animate-pulse" style={{ backgroundImage: "url('data:image/svg+xml,%3Csvg width=\"60\" height=\"60\" viewBox=\"0 0 60 60\" xmlns=\"http://www.w3.org/2000/svg\"%3E%3Cg fill=\"none\" fill-rule=\"evenodd\"%3E%3Cg fill=\"%23ffffff\" fill-opacity=\"0.1\"%3E%3Cpath d=\"M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z\"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')" }}></div>
            
            {/* Island */}
            <div className="absolute bottom-[-10%] right-[-10%] w-[80%] h-[70%] bg-emerald-400 rounded-[100%_40%_60%_20%/60%_40%_80%_40%] shadow-[inset_0_20px_40px_rgba(0,0,0,0.1)] transform rotate-[-10deg]"></div>
            
            {/* MY LOOT BOX */}
            <div className="absolute top-4 md:top-8 right-4 md:right-8 z-20">
              <div className="bg-white/90 backdrop-blur-xl py-3 px-5 rounded-2xl shadow-xl border-4 border-yellow-400 flex flex-col items-center gap-1 animate-float transform rotate-2">
                <span className="text-xs font-black uppercase text-slate-500 tracking-wider">My Loot</span>
                <div className="flex items-center gap-4">
                  <div className="relative group/chest">
                    <Package className="w-10 h-10 text-yellow-500 group-hover/chest:scale-125 transition-transform cursor-pointer" />
                    <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center border-2 border-white">
                      {treasureEarned}
                    </span>
                  </div>
                  <div className="h-8 w-1 bg-slate-200 rounded-full"></div>
                  <Compass className="w-10 h-10 text-blue-400 hover:rotate-180 transition-transform duration-700 cursor-help" />
                </div>
              </div>
            </div>
            
            {/* Treasure Markers */}
            {practiceWords.slice(0, 3).map((_, index) => {
              const positions = [
                { x: 33, y: 25 },
                { x: 75, y: 67 },
                { x: 60, y: 33 }
              ];
              const isUnlocked = index < correctCount;
              const pos = positions[index];
              
              return (
                <div 
                  key={index}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group/marker"
                  style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
                >
                  <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center">
                    {isUnlocked ? (
                      <>
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-60 animate-pulse"></div>
                        <span className="text-5xl md:text-6xl drop-shadow-lg transform group-hover/marker:scale-125 transition-all duration-300">⭐</span>
                      </>
                    ) : (
                      <>
                        <div className="absolute inset-0 bg-yellow-400 rounded-full blur-xl opacity-40 animate-pulse" style={{ animationDelay: `${index * 0.5}s` }}></div>
                        <Lock className={`w-10 h-10 md:w-12 md:h-12 text-yellow-600 drop-shadow-lg transform group-hover/marker:scale-125 transition-transform duration-300 ${index > correctCount ? 'opacity-50 grayscale' : ''}`} />
                      </>
                    )}
                  </div>
                </div>
              );
            })}
            
            {/* Red Boot Character */}
            <div className="absolute bottom-4 md:bottom-8 left-4 md:left-8 z-30 flex items-end gap-4">
              <div className="relative group/dog cursor-pointer">
                {/* Speech Bubble */}
                <div className="absolute -top-20 md:-top-24 left-12 md:left-16 bg-white p-3 md:p-4 rounded-3xl rounded-bl-none shadow-xl w-44 md:w-56 animate-float transform origin-bottom-left transition-transform hover:scale-110 z-20 border-2 border-slate-100">
                  <p className="text-xs md:text-sm font-black text-slate-700">
                    {currentTreasure 
                      ? `🎉 Ye found ${currentTreasure}!`
                      : '"Arrr! Find the treasure by spelling correctly, matey!"'
                    }
                  </p>
                </div>
                
                {/* Character Avatar */}
                <div className="w-24 h-24 md:w-32 md:h-32 rounded-full border-8 border-white shadow-[0_10px_30px_rgba(0,0,0,0.4)] overflow-hidden bg-sky-300 relative transform transition-transform duration-300 hover:scale-105 hover:rotate-3 ring-4 ring-offset-2 ring-blue-400">
                  <img 
                    alt="Red Boot the Pirate Dog" 
                    className="w-full h-full object-cover transform scale-110 translate-y-2 contrast-125 saturate-150" 
                    src={redBootImage}
                  />
                  <div className="absolute top-0 right-0 w-2/3 h-full bg-gradient-to-l from-white/30 to-transparent pointer-events-none skew-x-12"></div>
                </div>
                
                {/* Level Badge */}
                <div className="absolute -bottom-2 -right-2 bg-red-500 text-white text-xs md:text-sm font-black px-3 py-1 rounded-full border-4 border-white shadow-lg transform rotate-[-5deg]">
                  Lvl {Math.floor(correctCount / 2) + 1}
                </div>
              </div>
            </div>
            
            {/* Compass */}
            <div className="absolute bottom-4 md:bottom-8 right-4 md:right-8 opacity-80 hover:opacity-100 transition-opacity" style={{ animation: 'spin 20s linear infinite' }}>
              <div className="relative w-16 h-16 md:w-24 md:h-24 bg-white/20 backdrop-blur-md rounded-full border-2 border-white/50 flex items-center justify-center shadow-lg">
                <Compass className="w-10 h-10 md:w-16 md:h-16 text-white drop-shadow-lg transform rotate-45" />
                <div className="absolute top-0 text-white text-[8px] md:text-[10px] font-bold mt-1">N</div>
              </div>
            </div>
          </section>
        </div>
      </main>
      
      {/* Bonus round indicator */}
      {trickyWords.length > 0 && !showBonusRound && (
        <div className="fixed bottom-4 right-4 animate-pulse z-50">
          <div className="bg-yellow-500/20 rounded-full p-3 shadow-lg">
            <span className="text-2xl">⚡</span>
          </div>
        </div>
      )}
    </div>
  );
}
