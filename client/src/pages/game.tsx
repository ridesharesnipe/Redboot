import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import WeeklySpellingManager from "@/components/WeeklySpellingManager";
import SpellingMemoryGame from "@/components/SpellingMemoryGame";
import FridayTestSimulator from "@/components/FridayTestSimulator";
import type { WordProgress } from "@/components/SpellingMemoryGame";
import RedBootCharacter from "@/components/RedBootCharacter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { isUnauthorizedError } from "@/lib/authUtils";
import type { Child, WordList } from "@shared/schema";

export default function Game() {
  const { childId } = useParams();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Game mode state
  const [gameMode, setGameMode] = useState<"manager" | "practice" | "test">("manager");
  const [wordProgress, setWordProgress] = useState<WordProgress[]>([]);

  // Try to get words from localStorage (from photo capture) or database
  const [currentWords, setCurrentWords] = useState<string[]>([]);

  const { data: child } = useQuery<Child>({
    queryKey: ["/api/children", childId],
    retry: false,
  });

  const { data: wordLists } = useQuery<WordList[]>({
    queryKey: ["/api/children", childId, "wordlists"],
    retry: false,
  });

  // Initialize words - prioritize localStorage from photo capture
  useEffect(() => {
    const photoWords = localStorage.getItem('spellingWords');
    if (photoWords) {
      try {
        const parsedWords = JSON.parse(photoWords);
        if (Array.isArray(parsedWords) && parsedWords.length > 0) {
          setCurrentWords(parsedWords);
          return;
        }
      } catch (e) {
        console.error('Failed to parse localStorage words:', e);
      }
    }
    
    // Fallback to database words
    const currentWordList = wordLists?.[0];
    if (currentWordList?.words && currentWordList.words.length > 0) {
      setCurrentWords(currentWordList.words);
    } else {
      // Use default practice words if no homework photo yet
      setCurrentWords(["adventure", "treasure", "pirate", "sailing", "captain", "island", "ocean", "compass", "anchor", "ship"]);
    }
  }, [wordLists]);

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
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized", 
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/";
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

  const handleStartPractice = () => {
    setGameMode("practice");
  };

  const handleStartTest = () => {
    setGameMode("test");
  };

  const handlePracticeComplete = (results: WordProgress[]) => {
    setWordProgress(results);
    setGameMode("manager");
    
    // Save progress to database
    const correctWords = results.filter(w => w.status === "mastered").map(w => w.word);
    const incorrectWords = results.filter(w => w.status === "learning").map(w => w.word);
    const score = Math.round((correctWords.length / results.length) * 100);
    
    saveProgressMutation.mutate({
      wordListId: wordLists?.[0]?.id,
      characterUsed: 'red-boot',
      correctWords,
      incorrectWords,
      timeSpent: 0, // TODO: track actual time
      score,
    });
  };

  const handleTestComplete = (results: any[]) => {
    setGameMode("manager");
    
    const correctAnswers = results.filter(r => r.correct);
    const score = Math.round((correctAnswers.length / results.length) * 100);
    
    toast({
      title: "Test Complete!",
      description: `You scored ${score}%! ${correctAnswers.length} out of ${results.length} words correct.`,
    });
  };

  const handleExit = () => {
    setGameMode("manager");
  };

  if (!child) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  // Check if we have words from photo capture
  const isFromPhotoCapture = localStorage.getItem('spellingWords');
  const hasHomeworkWords = currentWords.length > 0 && currentWords[0] !== "adventure";

  if (gameMode === "practice") {
    return (
      <SpellingMemoryGame
        words={currentWords}
        onComplete={handlePracticeComplete}
        onExit={handleExit}
      />
    );
  }

  if (gameMode === "test") {
    return (
      <FridayTestSimulator
        words={currentWords}
        onComplete={handleTestComplete}
        onExit={handleExit}
      />
    );
  }

  return (
    <WeeklySpellingManager
      words={currentWords}
      wordProgress={wordProgress}
      onStartPractice={handleStartPractice}
      onStartTest={handleStartTest}
    />
  );
}
