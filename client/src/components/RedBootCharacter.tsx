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
    small: "w-20 h-20",
    medium: "w-40 h-40", 
    large: "w-80 h-80"
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
      <div 
        className={cn(
          sizeClasses[size],
          "relative overflow-hidden rounded-full"
        )}
        style={{
          background: 'transparent'
        }}
      >
        <img 
          src={redBootImage}
          alt="Red Boot the Pirate Captain"
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 10px 15px rgba(0,0,0,0.3))',
            mixBlendMode: 'multiply',
            background: 'transparent'
          }}
        />
      </div>
      
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
