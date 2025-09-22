import { cn } from "@/lib/utils";
import rayRayImage from "@assets/17585606742753339219605210888153_1758568182849.png";

interface RayRayCharacterProps {
  size?: "small" | "medium" | "large";
  animated?: boolean;
  className?: string;
}

export default function RayRayCharacter({ 
  size = "medium", 
  animated = false, 
  className 
}: RayRayCharacterProps) {
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
      data-testid="character-ray-ray"
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
          src={rayRayImage}
          alt="Ray Ray the Gentle Guide"
          className="w-full h-full object-cover"
          style={{
            filter: 'contrast(1.1) saturate(1.2) drop-shadow(0 8px 12px rgba(0,0,0,0.2))',
            background: 'transparent'
          }}
        />
      </div>
      
      {/* Character name label for large size */}
      {size === "large" && (
        <div className="absolute -bottom-16 left-1/2 transform -translate-x-1/2 text-center">
          <div className="font-fun text-white text-2xl drop-shadow-lg">Ray Ray</div>
          <div className="text-sm text-blue-100 drop-shadow-md">Gentle Guide</div>
        </div>
      )}
    </div>
  );
}