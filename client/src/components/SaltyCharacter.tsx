import { cn } from "@/lib/utils";
import saltyImage from "@assets/17585606361191640107410841949987_1758568182864.png";

interface SaltyCharacterProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}

export default function SaltyCharacter({ 
  size = "medium", 
  animated = false, 
  className 
}: SaltyCharacterProps) {
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
      data-testid="character-salty"
    >
      <div 
        className={cn(
          sizeClasses[size],
          "relative overflow-hidden rounded-3xl"
        )}
        style={{
          background: 'transparent'
        }}
      >
        <img 
          src={saltyImage}
          alt="Salty the Puppy Friend"
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.1) saturate(1.1) drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
            background: 'transparent',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
      
      {/* Character name label for large size */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-fun text-white text-2xl drop-shadow-lg">Salty</div>
          <div className="text-sm text-blue-100 drop-shadow-md">Puppy Friend</div>
        </div>
      )}
    </div>
  );
}