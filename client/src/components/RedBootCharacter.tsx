import { cn } from "@/lib/utils";
import redBootImage from "@assets/image_97d8476a-d83e-4730-a81f-03eea7de271d_1758568917281.jpg";
import redBootPointingImg from "@/assets/characters/red-boot-pointing.jpg";
import redBootThinkingImg from "@/assets/characters/red-boot-thinking.jpg";
import redBootCelebratingImg from "@/assets/characters/red-boot-celebrating.jpg";

interface RedBootCharacterProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
  expression?: "pointing" | "thinking" | "celebrating" | "default";
}

export default function RedBootCharacter({ 
  size = "medium", 
  animated = false, 
  className,
  expression = "default"
}: RedBootCharacterProps) {
  const sizeClasses = {
    small: "w-20 h-20",
    medium: "w-40 h-40", 
    large: "w-80 h-80"
  };

  // Get the appropriate character image based on expression
  const getCharacterImage = () => {
    switch (expression) {
      case "pointing":
        return redBootPointingImg;
      case "thinking":
        return redBootThinkingImg;
      case "celebrating":
        return redBootCelebratingImg;
      default:
        return redBootImage;
    }
  };

  const characterImage = getCharacterImage();

  return (
    <div 
      className={cn(
        "relative flex items-center justify-center",
        animated && "float-animation",
        expression === "celebrating" && "animate-pulse",
        className
      )}
      data-testid={`character-red-boot-${expression}`}
    >
      <div 
        className={cn(
          sizeClasses[size],
          "relative overflow-hidden",
          expression === "default" ? "rounded-full" : "rounded-lg"
        )}
        style={{
          background: 'transparent'
        }}
      >
        <img 
          src={characterImage}
          alt={`Red Boot the Pirate Captain - ${expression}`}
          className="w-full h-full object-contain"
          style={{
            filter: expression === "default" 
              ? 'contrast(1.2) saturate(1.1) drop-shadow(0 10px 15px rgba(0,0,0,0.3))'
              : 'drop-shadow(0 8px 12px rgba(0,0,0,0.4))',
            background: 'transparent'
          }}
        />
      </div>
      
      {/* Character name label for large size */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-pirate text-red-500 text-4xl drop-shadow-lg">Red Boot</div>
          <div className="font-pirate text-blue-100 text-xl drop-shadow-md">Speller of the Seven Seas</div>
        </div>
      )}
    </div>
  );
}
