import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import PirateFlashcard from "./PirateFlashcard";
import { Play, BookOpen } from "lucide-react";

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
  // Simplified - no shuffling, resetting, or flipping functionality

  if (words.length === 0) {
    return (
      <Card className="p-4 sm:p-6 md:p-8 text-center bg-gradient-to-br from-amber-50 to-yellow-100 border-4 border-amber-200">
        <CardContent className="pt-4 sm:pt-6">
          <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🗺️</div>
          <h3 className="text-lg sm:text-xl font-pirate text-amber-900 mb-2">
            No Treasure Maps Yet!
          </h3>
          <p className="text-sm sm:text-base text-amber-700">
            Capture a photo of your spelling homework to create your first treasure map flashcards!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <Card className="glass-card glass-floating">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-3xl font-pirate text-white glass-text-glow flex items-center gap-2">
              <span className="text-4xl">🏴‍☠️</span>
              {title}
            </CardTitle>
            <div className="text-white/80 font-bold text-lg">
              {words.length} treasure word{words.length !== 1 ? 's' : ''}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center">
            {onStartPractice && (
              <Button
                onClick={onStartPractice}
                className="glass-button-primary text-white font-bold glass-text-glow px-8 py-4 text-lg"
                data-testid="button-start-practice"
              >
                <Play className="w-5 h-5 mr-3" />
                ⚓ Start Spelling Adventure! ⚓
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Flashcard Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 p-4">
        {words.map((word, index) => (
          <div key={`${word}-${index}`} className="flex justify-center">
            <PirateFlashcard
              word={word}
              definition={`Practice spelling "${word}" - a treasure word from your list!`}
              onRemove={() => onRemoveWord?.(word)}
              showRemoveButton={showRemoveButtons}
              animated={true}
              className="glass-card glass-floating"
            />
          </div>
        ))}
      </div>

      {/* Practice Tip */}
      <Card className="glass-card glass-floating">
        <CardContent className="p-6">
          <div className="flex items-center gap-4">
            <span className="text-3xl">💡</span>
            <div>
              <h4 className="font-bold text-white glass-text-glow mb-2 text-lg" style={{ fontFamily: 'var(--font-pirate)' }}>Pirate's Practice Tip</h4>
              <p className="text-white/80">
                Study each treasure word carefully! Use the audio button 🔊 to hear each word pronounced like a true pirate captain! 🏴‍☠️
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}