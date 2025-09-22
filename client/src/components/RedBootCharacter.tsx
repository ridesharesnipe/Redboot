import { cn } from "@/lib/utils";
import redBootImage from "@assets/image_97d8476a-d83e-4730-a81f-03eea7de271d_1758568917281.jpg";

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

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        animated && "float-animation",
        className
      )}
      data-testid="character-red-boot"
    >
      <img 
        src={redBootImage}
        alt="Red Boot the Pirate Captain"
        className={cn(
          sizeClasses[size],
          "object-contain drop-shadow-xl"
        )}
      />
      
      {/* Character name label for large size */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-fun text-white text-2xl drop-shadow-lg">Red Boot</div>
          <div className="text-sm text-blue-100 drop-shadow-md">The Pirate Captain</div>
        </div>
      )}
    </div>
  );
}
