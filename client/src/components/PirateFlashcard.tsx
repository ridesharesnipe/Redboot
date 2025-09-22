import { useState } from "react";
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
  const [isFlipped, setIsFlipped] = useState(isRevealed);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
    if (onClick) onClick();
  };

  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (onRemove) onRemove();
  };

  const speakWord = (e: React.MouseEvent) => {
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
        "relative w-48 h-32 cursor-pointer transition-all duration-500 transform-style-preserve-3d",
        animated && "hover:scale-105 hover:shadow-2xl",
        isFlipped && "rotate-y-180",
        className
      )}
      onClick={handleFlip}
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

      {/* Front Side - Word */}
      <div className={cn(
        "absolute inset-0 w-full h-full backface-hidden",
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
        <div className="relative h-full flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-900 mb-2 font-pirate drop-shadow-md">
              {word.toUpperCase()}
            </div>
            <div className="text-xs text-amber-700 opacity-75">
              Click to flip
            </div>
          </div>

          {/* Compass Rose in Corner */}
          <div className="absolute top-1 left-1 w-6 h-6 text-amber-800 opacity-30">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Back Side - Definition */}
      <div className={cn(
        "absolute inset-0 w-full h-full backface-hidden rotate-y-180",
        "treasure-map-card border-4 border-emerald-800", 
        "bg-gradient-to-br from-green-100 via-emerald-50 to-green-200",
        "shadow-lg"
      )}>
        {/* Treasure Map Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-2 left-2 text-emerald-800 text-xs">
            <Map className="w-3 h-3" />
          </div>
          <div className="absolute top-2 right-2 text-emerald-800 text-xs">
            <Flag className="w-3 h-3" />
          </div>
          <div className="absolute bottom-2 left-2 text-emerald-800 text-xs">
            <Gem className="w-3 h-3" />
          </div>
          <div className="absolute bottom-2 right-2 text-emerald-800 text-xs">
            <TreePine className="w-3 h-3" />
          </div>
        </div>

        {/* Content */}
        <div className="relative h-full flex flex-col items-center justify-center p-3">
          <div className="text-center mb-3">
            <div className="text-lg font-bold text-emerald-900 mb-2 font-pirate">
              {word}
            </div>
            <div className="text-xs text-emerald-700 leading-relaxed">
              {definition}
            </div>
          </div>

          {/* Audio Button */}
          <button
            onClick={speakWord}
            className="w-8 h-8 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-colors flex items-center justify-center text-xs"
            data-testid={`speak-word-${word.toLowerCase()}`}
          >
            🔊
          </button>

          {/* X Marks the Spot */}
          <div className="absolute bottom-1 right-1 text-emerald-800 opacity-30 text-lg font-bold">
            ✗
          </div>
        </div>
      </div>
    </Card>
  );
}