import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PirateFlashcard from "./PirateFlashcard";
import { Shuffle, RotateCcw, Play, BookOpen } from "lucide-react";

interface FlashcardGridProps {
  words: string[];
  onRemoveWord?: (word: string) => void;
  onStartPractice?: () => void;
  showRemoveButtons?: boolean;
  title?: string;
}

export default function FlashcardGrid({
  words,
  onRemoveWord,
  onStartPractice,
  showRemoveButtons = false,
  title = "Your Treasure Map Words"
}: FlashcardGridProps) {
  const [shuffledWords, setShuffledWords] = useState([...words]);
  const [revealedCards, setRevealedCards] = useState<Set<string>>(new Set());

  const shuffleCards = () => {
    const shuffled = [...shuffledWords].sort(() => Math.random() - 0.5);
    setShuffledWords(shuffled);
  };

  const resetCards = () => {
    setRevealedCards(new Set());
    setShuffledWords([...words]);
  };

  const revealAll = () => {
    setRevealedCards(new Set(shuffledWords));
  };

  const handleCardClick = (word: string) => {
    setRevealedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(word)) {
        newSet.delete(word);
      } else {
        newSet.add(word);
      }
      return newSet;
    });
  };

  if (words.length === 0) {
    return (
      <Card className="p-8 text-center bg-gradient-to-br from-amber-50 to-yellow-100 border-4 border-amber-200">
        <CardContent className="pt-6">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-pirate text-amber-900 mb-2">
            No Treasure Maps Yet!
          </h3>
          <p className="text-amber-700">
            Capture a photo of your spelling homework to create your first treasure map flashcards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="bg-gradient-to-r from-amber-100 to-yellow-100 border-4 border-amber-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-pirate text-amber-900 flex items-center gap-2">
              <span className="text-3xl">🏴‍☠️</span>
              {title}
            </CardTitle>
            <div className="text-amber-700 font-bold">
              {words.length} word{words.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3 justify-center">
            <Button
              onClick={shuffleCards}
              variant="outline"
              className="bg-amber-600 text-white hover:bg-amber-700 border-amber-700"
              data-testid="button-shuffle-cards"
            >
              <Shuffle className="w-4 h-4 mr-2" />
              Shuffle Maps
            </Button>
            
            <Button
              onClick={resetCards}
              variant="outline"
              className="bg-emerald-600 text-white hover:bg-emerald-700 border-emerald-700"
              data-testid="button-reset-cards"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset Cards
            </Button>
            
            <Button
              onClick={revealAll}
              variant="outline"
              className="bg-blue-600 text-white hover:bg-blue-700 border-blue-700"
              data-testid="button-reveal-all"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Reveal All
            </Button>

            {onStartPractice && (
              <Button
                onClick={onStartPractice}
                className="bg-treasure-500 text-white hover:bg-treasure-600"
                data-testid="button-start-practice"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Adventure!
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {shuffledWords.map((word, index) => (
          <div key={`${word}-${index}`} className="flex justify-center">
            <PirateFlashcard
              word={word}
              definition={`Practice spelling "${word}" - a treasure word from your list!`}
              isRevealed={revealedCards.has(word)}
              onClick={() => handleCardClick(word)}
              onRemove={() => onRemoveWord?.(word)}
              showRemoveButton={showRemoveButtons}
              animated={true}
              className="transform transition-all duration-300 hover:rotate-1"
            />
          </div>
        ))}
      </div>

      {/* Practice Tip */}
      <Card className="bg-gradient-to-r from-blue-100 to-cyan-100 border-4 border-blue-300">
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">💡</span>
            <div>
              <h4 className="font-bold text-blue-900 mb-1">Pirate's Practice Tip</h4>
              <p className="text-blue-700 text-sm">
                Click each treasure map to reveal the word, then test yourself by flipping them back! 
                Use the audio button to hear each word pronounced like a true pirate captain! 🏴‍☠️
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}