import { useState, useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { Flag } from "lucide-react";
import redBootSplash from "@assets/17585900152718502939350575537720_1758590021649.png";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [timeLeft, setTimeLeft] = useState(23);
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
        {/* Title with mobile-optimized sizing */}
        <div className="mb-4 sm:mb-8 transform animate-bounce-gentle">
          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-[10rem] font-bold text-white mb-2 sm:mb-4 drop-shadow-2xl tracking-wide font-sans" 
              style={{ 
                textShadow: '6px 6px 0px #2c5aa0, 12px 12px 0px rgba(0,0,0,0.3)'
              }}>
            Red Boot's
          </h1>
          <h2 className="text-3xl sm:text-5xl md:text-6xl lg:text-8xl font-bold text-yellow-300 drop-shadow-xl tracking-wide font-sans"
              style={{ 
                textShadow: '4px 4px 0px #cc8400, 8px 8px 0px rgba(0,0,0,0.2)'
              }}>
            Spelling Adventure!
          </h2>
        </div>

        {/* Red Boot character - mobile optimized */}
        <div className="mb-4 sm:mb-8 flex justify-center">
          <div className="relative transform animate-float">
            <div className="w-[12rem] h-[12rem] sm:w-[16rem] sm:h-[16rem] md:w-[20rem] md:h-[20rem] lg:w-[24rem] lg:h-[24rem] relative overflow-hidden rounded-full bg-white border-4 md:border-6 border-white shadow-2xl">
              <img 
                src={redBootSplash} 
                alt="Red Boot the Pirate" 
                className="w-full h-full object-cover scale-110"
                style={{
                  filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 15px 20px rgba(0,0,0,0.4))',
                  transform: 'scale(1.1)'
                }}
              />
            </div>
            {/* Speech bubble - mobile optimized */}
            <div className="absolute -top-6 sm:-top-10 -right-6 sm:-right-10 bg-white rounded-2xl px-3 sm:px-6 py-2 sm:py-4 border-3 sm:border-4 border-gray-800 transform rotate-12 animate-pulse">
              <p className="text-lg sm:text-2xl md:text-3xl font-bold text-sky-600" style={{ fontFamily: "'Pirata One', cursive" }}>
                Ahoy Matey!
              </p>
              <div className="absolute bottom-0 left-6 sm:left-8 w-0 h-0 border-l-3 border-r-3 border-t-6 sm:border-l-4 sm:border-r-4 sm:border-t-8 border-transparent border-t-white transform translate-y-2"></div>
            </div>
          </div>
        </div>

        {/* Unique app messaging - mobile compact */}
        <div className="mb-4 sm:mb-6 px-2">
          <div className="text-sm sm:text-lg md:text-xl text-yellow-200 font-bold drop-shadow-lg mb-2" style={{ fontFamily: "'Pirata One', cursive" }}>
            The Ultimate Pirate Spelling Adventure App!
          </div>
          <div className="text-xs sm:text-base md:text-lg text-white font-bold drop-shadow-lg mb-1" style={{ fontFamily: "'Pirata One', cursive" }}>
            Breaking New Ground - No Other App Does This!
          </div>
          <div className="text-xs sm:text-sm md:text-base text-sky-200 font-bold drop-shadow-lg" style={{ fontFamily: "'Pirata One', cursive" }}>
            Revolutionary Pirate Learning Adventure
          </div>
        </div>

        {/* Pirate-themed loading text - mobile compact */}
        <div className="mb-3 sm:mb-4">
          <div className="text-lg sm:text-xl md:text-2xl text-white font-bold drop-shadow-lg font-sans">
            <div className="flex items-center justify-center gap-2">
              <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
              <span className="text-center">Preparing the ship for adventure...</span>
              <Flag className="w-4 h-4 sm:w-5 sm:h-5" />
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