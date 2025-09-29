import type { MouseEvent } from "react";
import { cn } from "@/lib/utils";
import { Card } from "@/components/ui/card";
import { Anchor, Coins, Map, Flag, Compass, Swords, Gem, TreePine } from "lucide-react";

interface PirateFlashcardProps {
  word: string;
  definition?: string;
  isRevealed?: boolean;
  onClick?: () => void;
  onRemove?: () => void;
  className?: string;
  showRemoveButton?: boolean;
  animated?: boolean;
}

export default function PirateFlashcard({
  word,
  definition = "Click to hear the word!",
  isRevealed = false,
  onClick,
  onRemove,
  className,
  showRemoveButton = false,
  animated = true
}: PirateFlashcardProps) {
  const handleCardClick = () => {
    if (onClick) onClick();
  };

  const handleRemove = (e: MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  const speakWord = (e: MouseEvent) => {
    e.stopPropagation();
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(word);
      utterance.rate = 0.8;
      utterance.pitch = 1.1;
      speechSynthesis.speak(utterance);
    }
  };

  return (
    <Card 
      className={cn(
        "relative w-48 h-32 transition-all duration-500 cursor-pointer",
        animated && "hover:scale-105 hover:shadow-2xl",
        className
      )}
      onClick={handleCardClick}
      data-testid={`flashcard-${word.toLowerCase()}`}
    >
      {/* Remove Button */}
      {showRemoveButton && (
        <button
          onClick={handleRemove}
          className="absolute -top-2 -right-2 z-20 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600 transition-colors flex items-center justify-center"
          data-testid={`remove-flashcard-${word.toLowerCase()}`}
        >
          ×
        </button>
      )}

      {/* Word Display */}
      <div className={cn(
        "absolute inset-0 w-full h-full",
        "treasure-map-card border-4 border-amber-800",
        "bg-gradient-to-br from-yellow-100 via-amber-50 to-yellow-200",
        "shadow-lg"
      )}>
        {/* Treasure Map Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 text-amber-800 text-xs">
            <Anchor className="w-3 h-3" />
          </div>
          <div className="absolute top-2 right-2 text-amber-800 text-xs">
            <Compass className="w-3 h-3" />
          </div>
          <div className="absolute bottom-2 left-2 text-amber-800 text-xs">
            <Swords className="w-3 h-3" />
          </div>
          <div className="absolute bottom-2 right-2 text-amber-800 text-xs">
            <Coins className="w-3 h-3" />
          </div>
        </div>

        {/* Aged Paper Effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-100 to-transparent opacity-30"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-amber-200 via-transparent to-amber-300 opacity-20"></div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-3">
          <div className="text-center mb-2">
            <div className="text-xl font-bold text-amber-900 mb-1 font-pirate drop-shadow-md">
              {word.toUpperCase()}
            </div>
            <div className="text-xs text-emerald-800 leading-tight px-1 mb-2">
              {definition}
            </div>
          </div>

          {/* Audio Button */}
          <button
            onClick={speakWord}
            className="w-8 h-8 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center text-xs shadow-lg mb-1"
            data-testid={`speak-word-${word.toLowerCase()}`}
          >
            🔊
          </button>

          {/* Compass Rose in Corner */}
          <div className="absolute top-1 left-1 w-6 h-6 text-amber-800 opacity-30">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
            </svg>
          </div>
        </div>
      </div>

    </Card>
  );
}