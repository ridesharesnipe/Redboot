import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RedBootCharacter from "@/components/RedBootCharacter";
import SaltyCharacter from "@/components/SaltyCharacter";
import DiegoCharacter from "@/components/DiegoCharacter";
import diegoImage from "@assets/17586535267086549247092506575635_1758653585024.png";
import diegoBarkSound from "@assets/chihuahua-barks-75088_1759205101905.mp3";
import seagullSound from "@assets/seagull-sound-effect-272695_1759647609171.mp3";
import DemoModal from "@/components/DemoModal";
import { useAudio } from "@/contexts/AudioContext";
import { Users, Compass, Anchor, Play, Star, Check, Crown, Shield, Gem } from "lucide-react";
import { useLocation } from "wouter";
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
  const [, setLocation] = useLocation();
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
        
        {/* Floating Navigation */}
        <nav className="absolute top-4 left-4 right-4 z-20 safe-area-x">
          <div className="max-w-7xl mx-auto flex items-center justify-center">
            <h1 className="fluid-heading-lg font-black text-center" style={{ 
              fontFamily: "'Pirata One', cursive", 
              fontWeight: '900',
              color: '#FFD700',
              textShadow: '0 0 20px rgba(255, 215, 0, 0.8), 0 0 40px rgba(255, 191, 0, 0.6), 0 0 60px rgba(166, 124, 0, 0.4), 2px 2px 4px rgba(0, 0, 0, 0.5)'
            }}>Red Boot's Adventure</h1>
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
          {/* Modern 2025 Pill Buttons */}
          <div className="flex flex-wrap justify-center gap-3 px-4 safe-area-x">
            <button 
              onClick={handleStartAdventure}
              className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-emerald-500 hover:bg-emerald-600 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: '0 2px 8px rgba(16, 185, 129, 0.25)' }}
              data-testid="button-start-adventure"
            >
              <span className="flex items-center gap-2">
                <Compass className="w-4 h-4" />
                Start Adventure
              </span>
            </button>
            
            <button 
              onClick={() => {
                initializeAudio();
                playSound('treasure_chest_open');
                setLocation('/vault');
              }}
              className="px-6 py-3 rounded-full font-semibold text-sm text-white bg-amber-500 hover:bg-amber-600 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98]"
              style={{ boxShadow: '0 2px 8px rgba(245, 158, 11, 0.25)' }}
              data-testid="button-treasure-vault"
            >
              <span className="flex items-center gap-2">
                <Gem className="w-4 h-4" />
                Treasure Vault
              </span>
            </button>
            
            <button 
              onClick={handleDemo}
              className="px-6 py-3 rounded-full font-semibold text-sm text-white/90 bg-white/10 hover:bg-white/20 border border-white/30 transition-all duration-150 ease-out hover:scale-[1.02] active:scale-[0.98] backdrop-blur-sm"
              data-testid="button-watch-demo"
            >
              <span className="flex items-center gap-2">
                <Play className="w-4 h-4" />
                Watch Demo
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Character Selection - Light Ocean Theme */}
      <section className="py-16 px-4 bg-gradient-to-b from-sky-100 via-cyan-50 to-sky-100">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-crew-title">
              Choose Your Hero
            </h2>
            <p className="text-sky-600 text-sm">Select a character to begin your spelling adventure</p>
          </div>
          
          {/* Side-by-side character grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl mx-auto">
            {/* Red Boot Card */}
            <div 
              className={`group cursor-pointer rounded-2xl p-5 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg ${
                selectedCharacter === 'redboot' 
                  ? 'bg-amber-50 ring-2 ring-amber-400 shadow-lg' 
                  : 'bg-white/80 hover:bg-white'
              }`}
              style={{ border: '1px solid rgba(14, 165, 233, 0.15)' }}
              onClick={() => {
                playSound('anchor_button_click');
                playCharacterVoice('red_boot_ahoy');
                setSelectedCharacter('redboot');
                localStorage.setItem('selectedCharacter', 'redboot');
                if (onStart) onStart();
              }}
              data-testid="character-select-redboot"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-amber-100 to-orange-100 shadow-sm">
                  <img 
                    src={redBootCrew} 
                    alt="Red Boot" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Red Boot</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Free</span>
                  </div>
                  <p className="text-amber-600 text-sm font-medium mb-1">⚓ Treasure Hunt</p>
                  <p className="text-slate-500 text-xs">Dig up buried treasures on mysterious islands</p>
                </div>
              </div>
            </div>
            
            {/* Diego Card */}
            <div 
              className={`group cursor-pointer rounded-2xl p-5 transition-all duration-150 ease-out hover:scale-[1.02] hover:shadow-lg ${
                selectedCharacter === 'diego' 
                  ? 'bg-cyan-50 ring-2 ring-cyan-400 shadow-lg' 
                  : 'bg-white/80 hover:bg-white'
              }`}
              style={{ border: '1px solid rgba(14, 165, 233, 0.15)' }}
              onClick={() => {
                playSound('anchor_button_click');
                playAudioFile(diegoBarkSound, 1, true);
                setSelectedCharacter('diego');
                localStorage.setItem('selectedCharacter', 'diego');
                if (onStart) onStart();
              }}
              data-testid="character-select-diego"
            >
              <div className="flex items-center gap-4">
                <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-xl overflow-hidden flex-shrink-0 bg-gradient-to-br from-cyan-100 to-blue-100 shadow-sm">
                  <img 
                    src={diegoImage} 
                    alt="Diego the Pup Pup" 
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="font-bold text-lg text-slate-800">Diego</h3>
                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">Free</span>
                  </div>
                  <p className="text-cyan-600 text-sm font-medium mb-1">🌊 Sea Monster Battle</p>
                  <p className="text-slate-500 text-xs">Battle sea monsters and claim their treasures</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Light Ocean Theme */}
      <section className="py-16 px-4 bg-gradient-to-b from-sky-50 to-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-sky-900 mb-2" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-features-title">
              How It Works
            </h2>
            <p className="text-sky-600 text-sm">Three simple steps to spelling success</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Snap & Upload */}
            <div className="rounded-xl p-5 bg-white border border-sky-100 text-center transition-all duration-150 hover:shadow-md hover:border-sky-200">
              <div className="w-12 h-12 rounded-lg bg-emerald-100 mx-auto mb-4 flex items-center justify-center">
                <Compass className="w-6 h-6 text-emerald-600" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2" data-testid="text-feature-photo-title">
                Snap & Upload
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed" data-testid="text-feature-photo-desc">
                Take a photo of your spelling list and words appear instantly
              </p>
            </div>

            {/* Play & Learn */}
            <div className="rounded-xl p-5 bg-white border border-sky-100 text-center transition-all duration-150 hover:shadow-md hover:border-sky-200">
              <div className="w-12 h-12 rounded-lg bg-purple-100 mx-auto mb-4 flex items-center justify-center">
                <Star className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2" data-testid="text-feature-game-title">
                Play & Learn
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed" data-testid="text-feature-game-desc">
                Battle monsters and hunt treasure while mastering spelling
              </p>
            </div>

            {/* Track Progress */}
            <div className="rounded-xl p-5 bg-white border border-sky-100 text-center transition-all duration-150 hover:shadow-md hover:border-sky-200">
              <div className="w-12 h-12 rounded-lg bg-amber-100 mx-auto mb-4 flex items-center justify-center">
                <Crown className="w-6 h-6 text-amber-600" />
              </div>
              <h3 className="font-semibold text-base text-slate-800 mb-2" data-testid="text-feature-progress-title">
                Track Progress
              </h3>
              <p className="text-slate-500 text-xs leading-relaxed" data-testid="text-feature-progress-desc">
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
