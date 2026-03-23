import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RedBootCharacter from "@/components/RedBootCharacter";
import SaltyCharacter from "@/components/SaltyCharacter";
import DiegoCharacter from "@/components/DiegoCharacter";
import diegoImage from "@assets/17586535267086549247092506575635_1758653585024.png";
import rayRayImage from "@assets/17585606742753339219605210888153_1774274010930.png";
import oceanBlueImage from "@assets/17585605808844297950721614449099_1758609283325_1774274010940.png";
import diegoBarkSound from "@assets/chihuahua-barks-75088_1759205101905.mp3";
import seagullSound from "@assets/seagull-sound-effect-272695_1759647609171.mp3";
import DemoModal from "@/components/DemoModal";
import { useAudio } from "@/contexts/AudioContext";
import { Users, Compass, Anchor, Star, Check, Crown, Shield } from "lucide-react";
import redBootIcon from "@assets/1758546464581685620984935859986_1758574136389.png";
import redBootCrew from "@assets/1758546464581685620984935859986_1758574287269.png";
import redBootLandingHead from "@assets/17585900152718502939350575537720_1758590021649.png";

interface LandingProps {
  onStart?: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const [selectedCharacter, setSelectedCharacter] = useState<'redboot' | 'diego' | null>(null);
  const { playSound, startBackgroundMusic, playCharacterVoice, playAudioFile } = useAudio();
  const seagullTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isMountedRef = useRef(true);

  // Periodic seagull sounds for atmosphere
  useEffect(() => {
    if (!audioInitialized) return;
    
    isMountedRef.current = true;
    
    const playSeagull = () => {
      if (!isMountedRef.current) return;
      playAudioFile(seagullSound, 0.3);
    };
    
    // Play seagull sound every 15-25 seconds (random interval)
    const scheduleNextSeagull = () => {
      if (!isMountedRef.current) return;
      
      const delay = 15000 + Math.random() * 10000; // 15-25 seconds
      seagullTimerRef.current = setTimeout(() => {
        if (!isMountedRef.current) return; // Guard at callback start
        playSeagull();
        scheduleNextSeagull(); // Schedule the next one
      }, delay);
    };
    
    scheduleNextSeagull(); // Start the scheduling
    
    return () => {
      isMountedRef.current = false;
      if (seagullTimerRef.current) {
        clearTimeout(seagullTimerRef.current);
        seagullTimerRef.current = null;
      }
    };
  }, [audioInitialized, playAudioFile]);

  // Initialize audio on first user interaction (mobile-friendly)
  const initializeAudio = () => {
    if (!audioInitialized) {
      setAudioInitialized(true);
      startBackgroundMusic('ocean_ambient');
      // Play seagull sound for atmosphere
      playAudioFile(seagullSound, 0.4);
      // Welcome message after audio context is unlocked
      setTimeout(() => {
        playCharacterVoice('red_boot_welcome');
      }, 500);
    }
  };

  const handleStartAdventure = () => {
    // Initialize audio without the automatic welcome message
    if (!audioInitialized) {
      setAudioInitialized(true);
      startBackgroundMusic('ocean_ambient');
      // Play seagull sound on start
      playAudioFile(seagullSound, 0.4);
    }
    playSound('anchor_button_click');
    playCharacterVoice('red_boot_ahoy');
    // Go directly to the app
    setTimeout(() => {
      if (onStart) {
        onStart();
      }
    }, 1500);
  };

  const handleDemo = () => {
    initializeAudio();
    playSound('compass_navigation');
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-[100svh] bg-background overflow-x-hidden">
      {/* Hero Section with Ocean Background */}
      <section className="ocean-hero text-white py-8 px-4 relative min-h-[100svh] overflow-x-hidden safe-area-bottom">
        {/* Ocean elements */}
        
        {/* Floating Navigation - Puffy Title */}
        <nav className="absolute top-4 left-4 right-4 z-20 safe-area-x">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <div className="puffy-title-badge">
              <h1 className="fluid-heading-lg font-black text-center relative z-10" style={{ 
                fontFamily: "'Pirata One', cursive", 
                fontWeight: '900',
                color: '#7c2d12',
                textShadow: '0 2px 4px rgba(255, 255, 255, 0.3)'
              }}>Red Boot's Adventure</h1>
            </div>
          </div>
        </nav>
        <div className="max-w-7xl mx-auto text-center relative z-10 pt-8">
          <div className="mb-6 flex justify-center">
            <div className="relative flex flex-col items-center justify-center float-animation landscape-reduce character-idle-breathe">
              <div className="character-container relative overflow-hidden rounded-full bg-gradient-to-br from-amber-400 to-red-500 border-4 md:border-8 border-amber-400 shadow-2xl mx-auto character-idle-sway" style={{
                boxShadow: '0 0 40px rgba(245, 158, 11, 0.5), 0 15px 40px rgba(0,0,0,0.4)'
              }}>
                <img 
                  src={redBootLandingHead}
                  alt="Red Boot the Pirate Captain"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 15px 25px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
              {/* Red Boot name and title - positioned below image */}
              <div className="mt-4 text-center">
                <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-2 text-red-500 drop-shadow-lg" style={{ 
                  fontFamily: "'Pirata One', cursive"
                }} data-testid="text-hero-title">Red Boot</h1>
                <p className="text-xl sm:text-2xl md:text-3xl font-semibold text-sky-200 drop-shadow-md" style={{ 
                  fontFamily: "'Pirata One', cursive"
                }}>Speller of the Seven Seas</p>
              </div>
            </div>
          </div>
          <div className="mb-4 flex justify-center">
            <span className="text-5xl sm:text-6xl md:text-7xl drop-shadow-lg" style={{ 
              filter: 'drop-shadow(0 0 20px rgba(255, 215, 0, 0.5))'
            }}>🧭</span>
          </div>
          <div className="relative">
            <div className="absolute -top-8 sm:-top-12 md:-top-16 right-2 sm:right-4 -z-10 animate-pulse hidden sm:block">
              <i className="lni lni-island text-green-400 drop-shadow-2xl text-6xl sm:text-8xl md:text-[12rem] lg:text-[16rem]" style={{ 
                backgroundColor: 'rgba(34,197,94,0.15)',
                padding: '12px',
                borderRadius: '50%',
                border: '2px solid rgba(34,197,94,0.2)'
              }}>🏝️</i>
            </div>
            <p className="fluid-text-lg mb-6 text-white font-semibold drop-shadow-lg max-reading-width mx-auto px-4 relative z-10" data-testid="text-hero-subtitle">
              Join Red Boot on a treasure hunt where spelling practice becomes the greatest adventure!
            </p>
          </div>
          {/* Puffy Action Buttons */}
          <div className="flex flex-col items-center gap-4 px-4 safe-area-x">
            <button 
              onClick={handleDemo}
              className="btn-puffy-demo"
              data-testid="button-watch-demo"
            >
              <Compass className="w-5 h-5 relative z-10" />
              <span className="relative z-10">How to Play</span>
            </button>

            <button 
              onClick={handleStartAdventure}
              className="btn-puffy-start"
              data-testid="button-start-adventure"
            >
              <Compass className="w-5 h-5 relative z-10" />
              <span className="relative z-10">Start Adventure</span>
            </button>
          </div>
        </div>
      </section>

      {/* Character Selection - Puffy Cards */}
      <section className="py-16 px-4 bg-gradient-to-b from-sky-100 via-cyan-50 to-sky-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-crew-title">
              Choose Your Hero
            </h2>
            <p className="text-sky-600 text-sm">Select a character to begin your spelling adventure</p>
          </div>
          
          {/* Side-by-side character grid - Puffy */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* Red Boot Card - Puffy */}
            <div 
              className={`puffy-character-card ${selectedCharacter === 'redboot' ? 'selected-redboot' : ''}`}
              onClick={() => {
                playSound('anchor_button_click');
                playCharacterVoice('red_boot_ahoy');
                setSelectedCharacter('redboot');
                localStorage.setItem('selectedCharacter', 'redboot');
                if (onStart) onStart();
              }}
              data-testid="character-select-redboot"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="puffy-avatar w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-amber-200 to-orange-300">
                  <img 
                    src={redBootCrew} 
                    alt="Red Boot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Red Boot</h3>
                    <span className="puffy-tag puffy-tag-green">Free</span>
                  </div>
                  <p className="text-amber-600 text-sm font-medium mb-1">⚓ Treasure Hunt</p>
                  <p className="text-slate-500 text-xs">Dig up buried treasures on mysterious islands</p>
                </div>
              </div>
            </div>
            
            {/* Diego Card - Puffy */}
            <div 
              className={`puffy-character-card ${selectedCharacter === 'diego' ? 'selected-diego' : ''}`}
              onClick={() => {
                playSound('anchor_button_click');
                playAudioFile(diegoBarkSound, 1, true);
                setSelectedCharacter('diego');
                localStorage.setItem('selectedCharacter', 'diego');
                if (onStart) onStart();
              }}
              data-testid="character-select-diego"
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="puffy-avatar w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-cyan-200 to-blue-300">
                  <img 
                    src={diegoImage} 
                    alt="Diego the Pup Pup" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Diego</h3>
                    <span className="puffy-tag puffy-tag-green">Free</span>
                  </div>
                  <p className="text-cyan-600 text-sm font-medium mb-1">🌊 Sea Monster Battle</p>
                  <p className="text-slate-500 text-xs">Battle sea monsters and claim their treasures</p>
                </div>
              </div>
            </div>

            {/* Ray Ray Card - Coming Soon */}
            <div
              className="puffy-character-card"
              style={{ filter: 'grayscale(1)', opacity: 0.65, cursor: 'not-allowed' }}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="puffy-avatar w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300">
                  <img
                    src={rayRayImage}
                    alt="Ray Ray"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Ray Ray</h3>
                    <span className="puffy-tag puffy-tag-gray">Coming Soon</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">🐠 Coral Reef Explorer</p>
                  <p className="text-slate-400 text-xs">Explore the coral reef — coming soon!</p>
                </div>
              </div>
            </div>

            {/* Ocean Blue Card - Coming Soon */}
            <div
              className="puffy-character-card"
              style={{ filter: 'grayscale(1)', opacity: 0.65, cursor: 'not-allowed' }}
            >
              <div className="flex items-center gap-4 relative z-10">
                <div className="puffy-avatar w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gradient-to-br from-slate-200 to-slate-300">
                  <img
                    src={oceanBlueImage}
                    alt="Ocean Blue"
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Ocean Blue</h3>
                    <span className="puffy-tag puffy-tag-gray">Coming Soon</span>
                  </div>
                  <p className="text-slate-500 text-sm font-medium mb-1">🔭 Star Map Navigator</p>
                  <p className="text-slate-400 text-xs">Navigate by the stars — coming soon!</p>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* Features Section - Puffy Cards */}
      <section className="py-16 px-4 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-features-title">
              How It Works
            </h2>
            <p className="text-sky-600 text-sm">Three simple steps to spelling success</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            {/* Snap & Upload - Puffy */}
            <div className="puffy-feature-card">
              <div className="puffy-icon-emerald w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Compass className="w-7 h-7 text-white relative z-10" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2 relative z-10" data-testid="text-feature-photo-title">
                Snap & Upload
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed relative z-10" data-testid="text-feature-photo-desc">
                Take a photo of your spelling list and words appear instantly
              </p>
            </div>

            {/* Play & Learn - Puffy */}
            <div className="puffy-feature-card">
              <div className="puffy-icon-purple w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-7 h-7 text-white relative z-10" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2 relative z-10" data-testid="text-feature-game-title">
                Play & Learn
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed relative z-10" data-testid="text-feature-game-desc">
                Battle monsters and hunt treasure while mastering spelling
              </p>
            </div>

            {/* Track Progress - Puffy */}
            <div className="puffy-feature-card">
              <div className="puffy-icon-amber w-14 h-14 mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-7 h-7 text-white relative z-10" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2 relative z-10" data-testid="text-feature-progress-title">
                Track Progress
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed relative z-10" data-testid="text-feature-progress-desc">
                Watch your treasure grow as you master each word
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
