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
        "relative flex items-center justify-center",
        animated && "float-animation",
        className
      )}
      data-testid="character-red-boot"
    >
      {/* Red Boot's Face */}
      <div className="relative">
        {/* Green Pirate Hat */}
        <div className={cn(
          "absolute -top-2 left-1/2 transform -translate-x-1/2 bg-green-600 rounded-t-full border-2 border-green-700",
          size === "small" && "w-14 h-8",
          size === "medium" && "w-24 h-12", 
          size === "large" && "w-40 h-20"
        )}>
          {/* Hat feather */}
          <div className={cn(
            "absolute top-0 right-2 bg-red-500 rounded-full",
            size === "small" && "w-1 h-4",
            size === "medium" && "w-2 h-6",
            size === "large" && "w-3 h-10"
          )}></div>
          {/* Hat skull and crossbones */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className={cn(
              "text-white font-bold",
              size === "small" && "text-xs",
              size === "medium" && "text-sm",
              size === "large" && "text-lg"
            )}>☠</div>
          </div>
        </div>

        {/* Face */}
        <div className={cn(
          "bg-orange-200 rounded-full border-4 border-orange-300 shadow-2xl relative",
          sizeClasses[size]
        )}>
          {/* Eyes */}
          <div className="absolute top-1/4 left-1/2 transform -translate-x-1/2 flex space-x-2">
            {/* Left eye (winking) */}
            <div className={cn(
              "bg-black rounded-full flex items-center justify-center",
              size === "small" && "w-2 h-2",
              size === "medium" && "w-3 h-3",
              size === "large" && "w-4 h-4"
            )}>
              <div className="w-1 h-1 bg-white rounded-full"></div>
            </div>
            {/* Right eye (wink - horizontal line) */}
            <div className={cn(
              "bg-black rounded-full",
              size === "small" && "w-2 h-0.5",
              size === "medium" && "w-3 h-1",
              size === "large" && "w-4 h-1"
            )}></div>
          </div>

          {/* Nose */}
          <div className={cn(
            "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-orange-300 rounded-full",
            size === "small" && "w-1 h-1",
            size === "medium" && "w-2 h-2",
            size === "large" && "w-3 h-3"
          )}></div>

          {/* Mouth with gold tooth */}
          <div className="absolute bottom-1/4 left-1/2 transform -translate-x-1/2">
            <div className={cn(
              "bg-black rounded-full flex items-center justify-center",
              size === "small" && "w-4 h-2",
              size === "medium" && "w-6 h-3",
              size === "large" && "w-8 h-4"
            )}>
              {/* Gold tooth */}
              <div className={cn(
                "bg-yellow-400 rounded-sm border border-yellow-500",
                size === "small" && "w-0.5 h-1",
                size === "medium" && "w-1 h-1.5",
                size === "large" && "w-1.5 h-2"
              )}></div>
            </div>
          </div>
        </div>

        {/* Red Boots (positioned at the bottom) */}
        {size !== "small" && (
          <div className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 flex space-x-1">
            <div className={cn(
              "bg-red-600 rounded-lg border-2 border-red-700",
              size === "medium" && "w-3 h-4",
              size === "large" && "w-4 h-6"
            )}></div>
            <div className={cn(
              "bg-red-600 rounded-lg border-2 border-red-700",
              size === "medium" && "w-3 h-4",
              size === "large" && "w-4 h-6"
            )}></div>
          </div>
        )}
      </div>

      {/* Character name label */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-fun text-white text-2xl drop-shadow-lg">Red Boot</div>
          <div className="text-sm text-blue-100 drop-shadow-md">The Pirate Captain</div>
        </div>
      )}
    </div>
  );
}
