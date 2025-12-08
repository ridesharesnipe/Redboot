import { useState, useEffect } from "react";
import { useAudio } from "@/contexts/AudioContext";
import { Anchor } from "lucide-react";
import { Button } from "@/components/ui/button";
import redBootSplash from "@assets/17585900152718502939350575537720_1758590021649.png";
import seagullSound from "@assets/seagull-sound-effect-272695_1759647609171.mp3";

interface SplashScreenProps {
  onComplete: () => void;
}

export default function SplashScreen({ onComplete }: SplashScreenProps) {
  const [isVisible, setIsVisible] = useState(true);
  const [audioStarted, setAudioStarted] = useState(false);
  const { startBackgroundMusic, playCharacterVoice, playAudioFile } = useAudio();

  const handleStartAdventure = () => {
    // Start audio on user interaction (browser autoplay compliance)
    if (!audioStarted) {
      setAudioStarted(true);
      startBackgroundMusic('pirate_adventure');
      playAudioFile(seagullSound, 0.4);
      setTimeout(() => {
        playCharacterVoice('red_boot_ahoy');
      }, 500);
    }
    
    // Fade out and transition
    setIsVisible(false);
    setTimeout(onComplete, 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-1000 ease-out ${
        isVisible ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
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

      {/* Main content - better viewport fit */}
      <div className="relative z-10 text-center px-4 max-w-6xl mx-auto flex flex-col justify-center min-h-screen py-8">
        {/* Hero section with split title */}
        <div className="mb-3 sm:mb-6 flex items-center justify-center gap-4 sm:gap-8 px-2">
          {/* "Red" on the left */}
          <div className="transform animate-bounce-gentle">
            <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-bold text-red-500 drop-shadow-2xl tracking-wide" 
                style={{ 
                  fontFamily: "'Pirata One', cursive",
                  textShadow: '6px 6px 0px #2c5aa0, 12px 12px 0px rgba(0,0,0,0.3)'
                }}>
              Red
            </h1>
          </div>

          {/* Red Boot character in the center - smaller and lowered */}
          <div className="flex justify-center flex-shrink-0 mt-4 sm:mt-6">
            <div className="relative transform animate-float">
              <div className="w-[8rem] h-[8rem] sm:w-[10rem] sm:h-[10rem] md:w-[12rem] md:h-[12rem] lg:w-[14rem] lg:h-[14rem] relative overflow-hidden rounded-full bg-white border-3 border-white shadow-2xl">
                <img 
                  src={redBootSplash} 
                  alt="Red Boot the Pirate" 
                  className="w-full h-full object-cover scale-105"
                  style={{
                    filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 10px 15px rgba(0,0,0,0.4))',
                    transform: 'scale(1.05)'
                  }}
                />
              </div>
              {/* Speech bubble - smaller and adjusted */}
              <div className="absolute -top-2 sm:-top-3 -right-3 sm:-right-4 bg-white rounded-xl px-2 sm:px-3 py-1 sm:py-1.5 border-2 border-gray-800 transform rotate-12 animate-pulse">
                <p className="text-sm sm:text-lg md:text-xl font-bold text-sky-600" style={{ fontFamily: "'Pirata One', cursive" }}>
                  Ahoy!
                </p>
                <div className="absolute bottom-0 left-3 sm:left-4 w-0 h-0 border-l-2 border-r-2 border-t-3 sm:border-l-2 sm:border-r-2 sm:border-t-4 border-transparent border-t-white transform translate-y-1"></div>
              </div>
            </div>
          </div>

          {/* "Boot" on the right */}
          <div className="transform animate-bounce-gentle">
            <h1 className="text-5xl sm:text-7xl md:text-9xl lg:text-[12rem] font-bold text-red-500 drop-shadow-2xl tracking-wide" 
                style={{ 
                  fontFamily: "'Pirata One', cursive",
                  textShadow: '6px 6px 0px #2c5aa0, 12px 12px 0px rgba(0,0,0,0.3)'
                }}>
              Boot
            </h1>
          </div>
        </div>

        {/* Subtitle centered below */}
        <div className="mb-3 sm:mb-6">
          <h2 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-yellow-300 drop-shadow-xl tracking-wide font-sans"
              style={{ 
                textShadow: '4px 4px 0px #cc8400, 8px 8px 0px rgba(0,0,0,0.2)'
              }}>
            Spelling Adventure!
          </h2>
        </div>

        {/* Unique app messaging - MUCH BIGGER AND MORE PROMINENT */}
        <div className="mb-4 sm:mb-6 px-2">
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl text-yellow-200 font-bold drop-shadow-2xl mb-3 leading-tight" style={{ fontFamily: "'Pirata One', cursive", textShadow: '3px 3px 0px #cc8400, 6px 6px 0px rgba(0,0,0,0.4)' }}>
            Breaking New Ground
          </div>
          <div className="text-xl sm:text-2xl md:text-3xl lg:text-4xl text-white font-bold drop-shadow-2xl mb-2 leading-tight" style={{ fontFamily: "'Pirata One', cursive", textShadow: '2px 2px 0px #2c5aa0, 4px 4px 0px rgba(0,0,0,0.4)' }}>
            Revolutionary Flashcard App
          </div>
          <div className="text-lg sm:text-xl md:text-2xl lg:text-3xl text-sky-200 font-bold drop-shadow-xl leading-tight" style={{ fontFamily: "'Pirata One', cursive", textShadow: '2px 2px 0px #1e40af, 4px 4px 0px rgba(0,0,0,0.3)' }}>
            Pirate Learning Adventure
          </div>
        </div>

        {/* Start Adventure Button */}
        <div className="mb-4 sm:mb-6">
          <Button
            onClick={handleStartAdventure}
            size="lg"
            className="bg-gradient-to-br from-green-400 to-green-600 hover:from-green-500 hover:to-green-700 text-white font-bold py-6 px-10 rounded-full text-2xl sm:text-3xl shadow-2xl transform hover:scale-105 transition-all duration-200 border-4 border-green-300"
            style={{ fontFamily: "'Pirata One', cursive" }}
            data-testid="button-start-adventure"
          >
            <Anchor className="w-6 h-6 sm:w-8 sm:h-8 mr-3" />
            Start Adventure!
            <Anchor className="w-6 h-6 sm:w-8 sm:h-8 ml-3" />
          </Button>
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