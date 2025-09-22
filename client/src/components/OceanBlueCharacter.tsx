import { cn } from "@/lib/utils";
import oceanBlueImage from "@assets/17585605808844297950721614449099_1758568182883.png";

interface OceanBlueCharacterProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}

export default function OceanBlueCharacter({ 
  size = "medium", 
  animated = false, 
  className 
}: OceanBlueCharacterProps) {
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
      data-testid="character-ocean-blue"
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
          src={oceanBlueImage}
          alt="Ocean Blue the Smart Explorer"
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.1) saturate(1.2) drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
            background: 'transparent',
            mixBlendMode: 'multiply'
          }}
        />
      </div>
      
      {/* Character name label for large size */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-fun text-white text-2xl drop-shadow-lg">Ocean Blue</div>
          <div className="text-sm text-blue-100 drop-shadow-md">Smart Explorer</div>
        </div>
      )}
    </div>
  );
}