import { useState, useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { Flag } from "lucide-react";
import redBootSplash from "@assets/17585900152718502939350575537720_1758590021649.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [timeLeft, setTimeLeft] = useState(8);
  const [isVisible, setIsVisible] = useState(true);
  const { startBackgroundMusic, playCharacterVoice } = useAudio();

  useEffect(() => {
    // Start pirate adventure music immediately
    startBackgroundMusic('pirate_adventure');
    
    // Red Boot welcome after a short delay
    const voiceTimer = setTimeout(() => {
      playCharacterVoice('red_boot_ahoy');
    }, 1500);

    // Countdown timer
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          // Fade out effect before completing
          setIsVisible(false);
          setTimeout(onComplete, 500);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(timer);
      clearTimeout(voiceTimer);
    };
  }, [startBackgroundMusic, playCharacterVoice, onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-opacity duration-500 ${
        isVisible ? 'opacity-100' : 'opacity-0'
      }`}
      style={{
        background: `
          radial-gradient(circle at 30% 20%, #87CEEB 0%, #4682B4 25%),
          radial-gradient(circle at 70% 80%, #FFD700 0%, #FFA500 30%),
          linear-gradient(135deg, #87CEEB 0%, #4169E1 50%, #191970 100%)
        `,
      }}
      data-testid="splash-screen"
    >
      {/* Floating clouds */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Ocean waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600 via-blue-500 to-transparent opacity-60">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto">
        {/* Title with simple children's book styling */}
        <div className="mb-12 transform animate-bounce-gentle">
          <h1 className="text-7xl md:text-9xl lg:text-[10rem] font-bold text-white mb-6 drop-shadow-2xl tracking-wide font-sans" 
              style={{ 
                textShadow: '6px 6px 0px #2c5aa0, 12px 12px 0px rgba(0,0,0,0.3)'
              }}>
            Red Boot's
          </h1>
          <h2 className="text-5xl md:text-7xl lg:text-8xl font-bold text-yellow-300 drop-shadow-xl tracking-wide font-sans"
              style={{ 
                textShadow: '4px 4px 0px #cc8400, 8px 8px 0px rgba(0,0,0,0.2)'
              }}>
            Spelling Adventure!
          </h2>
        </div>

        {/* Red Boot character - centered and large */}
        <div className="mb-12 flex justify-center">
          <div className="relative transform animate-float">
            <div className="w-[32rem] h-[32rem] md:w-[42rem] md:h-[42rem] lg:w-[48rem] lg:h-[48rem] relative overflow-hidden rounded-full bg-white border-8 border-white shadow-2xl">
              <img 
                src={redBootSplash} 
                alt="Red Boot the Pirate" 
                className="w-full h-full object-cover"
                style={{
                  filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 20px 30px rgba(0,0,0,0.4))',
                }}
              />
            </div>
            {/* Speech bubble */}
            <div className="absolute -top-12 -right-12 bg-white rounded-3xl px-8 py-6 border-6 border-gray-800 transform rotate-12 animate-pulse">
              <p className="text-3xl md:text-4xl font-bold text-gray-800 font-sans">
                Ahoy Matey!
              </p>
              <div className="absolute bottom-0 left-10 w-0 h-0 border-l-6 border-r-6 border-t-12 border-transparent border-t-white transform translate-y-3"></div>
            </div>
          </div>
        </div>

        {/* Pirate-themed loading text */}
        <div className="mb-6">
          <div className="text-2xl md:text-3xl text-white font-bold drop-shadow-lg font-sans">
            <div className="flex items-center gap-2">
              <Flag className="w-5 h-5" />
              Preparing the ship for adventure...
              <Flag className="w-5 h-5" />
            </div>
          </div>
        </div>

        {/* Countdown with treasure chest style */}
        <div className="flex justify-center items-center">
          <div className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full w-20 h-20 flex items-center justify-center border-4 border-yellow-600 shadow-xl transform animate-bounce">
            <span className="text-3xl font-bold text-white drop-shadow-lg">
              {timeLeft}
            </span>
          </div>
        </div>

        {/* Magical sparkles */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="sparkle sparkle-1">✨</div>
          <div className="sparkle sparkle-2">⭐</div>
          <div className="sparkle sparkle-3">💫</div>
          <div className="sparkle sparkle-4">🌟</div>
          <div className="sparkle sparkle-5">✨</div>
          <div className="sparkle sparkle-6">⭐</div>
        </div>
      </div>

    </div>
  );
}