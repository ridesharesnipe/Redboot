import { cn } from "@/lib/utils";

interface RedBootCharacterProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}

export default function RedBootCharacter({ 
  size = "medium", 
  animated = false, 
  className 
}: RedBootCharacterProps) {
  const sizeClasses = {
    small: "w-16 h-16",
    medium: "w-32 h-32",
    large: "w-64 h-64"
  };

  const hatSizes = {
    small: "w-8 h-8",
    medium: "w-16 h-16", 
    large: "w-24 h-24"
  };

  const iconSizes = {
    small: "text-lg",
    medium: "text-2xl",
    large: "text-4xl"
  };

  const textSizes = {
    small: "text-xs",
    medium: "text-sm",
    large: "text-2xl"
  };

  return (
    <div 
      className={cn(
        sizeClasses[size], 
        "bg-pirate-400 rounded-full flex items-center justify-center border-4 border-white shadow-2xl",
        animated && "float-animation",
        className
      )}
      data-testid="character-red-boot"
    >
      <div className="text-center">
        <div className={cn(
          hatSizes[size],
          "bg-treasure-400 rounded-full mx-auto mb-2 flex items-center justify-center"
        )}>
          <i className={cn("fas fa-hat-cowboy text-treasure-900", iconSizes[size])}></i>
        </div>
        <div className={cn("font-fun text-white", textSizes[size])}>
          Red Boot
        </div>
        {size === "large" && (
          <div className="text-sm text-blue-100">The Pirate Captain</div>
        )}
      </div>
    </div>
  );
}
