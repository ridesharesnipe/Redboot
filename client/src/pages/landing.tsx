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
          <div className="mb-4 flex justify-center">
            <div className="relative flex items-center justify-center float-animation landscape-reduce character-idle-breathe">
              <div className="character-container relative overflow-hidden rounded-full bg-white border-4 md:border-8 border-white shadow-2xl mx-auto character-idle-sway">
                <img 
                  src={redBootLandingHead}
                  alt="Red Boot the Pirate Captain"
                  className="w-full h-full object-cover"
                  style={{
                    filter: 'contrast(1.2) saturate(1.1) drop-shadow(0 15px 25px rgba(0,0,0,0.4))',
                  }}
                />
              </div>
              <div className="absolute -bottom-16 md:-bottom-20 left-1/2 transform -translate-x-1/2 text-center">
                <div className="fluid-heading-md drop-shadow-lg text-red-500" style={{ fontFamily: "'Pirata One', cursive" }}>Red Boot</div>
                <div className="fluid-heading-sm drop-shadow-md text-sky-200" style={{ fontFamily: "'Pirata One', cursive" }}>Speller of the Seven Seas</div>
              </div>
            </div>
          </div>
          <h1 className="fluid-heading-xl mb-4 font-bold drop-shadow-2xl text-sky-300" data-testid="text-hero-title" style={{ fontFamily: "'Pirata One', cursive" }}>
            Ahoy, Matey!
          </h1>
          <div className="mb-4 flex justify-center">
            <i className="lni lni-compass text-5xl sm:text-6xl md:text-8xl text-yellow-400 drop-shadow-lg" style={{ 
              fontFamily: 'LineIcons', 
              fontStyle: 'normal',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '12px',
              borderRadius: '50%'
            }}>🧭</i>
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
          <div className="flex flex-col sm:flex-row gap-3 justify-center items-center px-4 safe-area-x">
            <Button 
              onClick={handleStartAdventure}
              variant="default" className="font-bold w-full sm:w-auto"
              size="lg"
              data-testid="button-start-adventure"
            >
              <Compass className="w-5 h-5 mr-2" />
              Start Adventure
            </Button>
            <Button 
              onClick={() => {
                initializeAudio();
                playSound('treasure_chest_open');
                setLocation('/vault');
              }}
              variant="secondary" 
              className="font-bold w-full sm:w-auto bg-gradient-to-r from-yellow-500 to-amber-600 text-white hover:from-yellow-600 hover:to-amber-700 border-2 border-yellow-600"
              size="lg"
              data-testid="button-treasure-vault"
            >
              <Gem className="w-5 h-5 mr-2" />
              Treasure Vault
            </Button>
            <Button 
              onClick={handleDemo}
              variant="secondary" 
              className="font-bold w-full sm:w-auto bg-white text-blue-600 hover:bg-gray-50 border-2 border-blue-600"
              size="lg"
              data-testid="button-watch-demo"
            >
              <Play className="w-5 h-5 mr-2 text-blue-600" />
              Start Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Character Crew Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-fun text-foreground mb-4" data-testid="text-crew-title">
            Choose Your Adventure!
          </h2>
          <p className="text-xl text-gray-600 mb-6">Select your hero to begin your spelling journey!</p>
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            {/* Red Boot - Treasure Hunt */}
            <div 
              className={`text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedCharacter === 'redboot' ? 'ring-8 ring-yellow-400 rounded-3xl shadow-2xl' : 'hover:shadow-xl'
              }`}
              onClick={() => {
                playSound('anchor_button_click');
                playCharacterVoice('red_boot_ahoy');
                localStorage.setItem('selectedCharacter', 'redboot');
                if (onStart) onStart();
              }}
              data-testid="character-select-redboot"
            >
              <div className="mb-4 flex justify-center relative character-idle-breathe">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 relative overflow-hidden rounded-3xl bg-gradient-to-br from-red-100 to-orange-100 p-2 transition-all character-idle-sway ${
                  selectedCharacter === 'redboot' ? 'animate-pulse' : ''
                }`}>
                  <img 
                    src={redBootCrew} 
                    alt="Red Boot the Brave Captain" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {selectedCharacter === 'redboot' && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-yellow-400 rounded-full flex items-center justify-center animate-bounce">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-2xl text-red-700 mb-2">Red Boot</h3>
              <p className="text-lg text-gray-700 font-semibold mb-2">⚓ Treasure Hunt Adventure</p>
              <p className="text-sm text-gray-600 mb-3">Dig up buried treasures on mysterious islands!</p>
              <div className="bg-green-100 text-green-800 text-sm px-4 py-2 rounded-full mb-4 inline-block font-bold">FREE</div>
            </div>
            
            {/* Diego - Sea Monster Battle */}
            <div 
              className={`text-center cursor-pointer transition-all duration-300 transform hover:scale-105 ${
                selectedCharacter === 'diego' ? 'ring-8 ring-blue-400 rounded-3xl shadow-2xl' : 'hover:shadow-xl'
              }`}
              onClick={() => {
                playSound('anchor_button_click');
                playAudioFile(diegoBarkSound, 1, true); // Play from middle
                localStorage.setItem('selectedCharacter', 'diego');
                if (onStart) onStart();
              }}
              data-testid="character-select-diego"
            >
              <div className="mb-4 flex justify-center relative character-idle-breathe">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 md:w-56 md:h-56 relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-100 to-cyan-100 p-2 transition-all character-idle-sway ${
                  selectedCharacter === 'diego' ? 'animate-pulse' : ''
                }`}>
                  <img 
                    src={diegoImage} 
                    alt="Diego the Pup Pup" 
                    className="w-full h-full object-cover rounded-2xl"
                  />
                </div>
                {selectedCharacter === 'diego' && (
                  <div className="absolute -top-2 -right-2 w-12 h-12 bg-blue-400 rounded-full flex items-center justify-center animate-bounce">
                    <Check className="w-8 h-8 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-2xl text-blue-700 mb-2">Diego the Pup Pup</h3>
              <p className="text-lg text-gray-700 font-semibold mb-2">🌊 Sea Monster Battle</p>
              <p className="text-sm text-gray-600 mb-3">Battle fearsome sea monsters and claim their treasures!</p>
              <div className="bg-orange-100 text-orange-800 text-sm px-4 py-2 rounded-full mb-4 inline-block font-bold">FREE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-fun text-center text-foreground mb-4" data-testid="text-features-title">
            Amazing Pirate Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg ring-4 ring-green-200">
                  <i className="lni lni-cloud-upload text-yellow-400 text-5xl drop-shadow-lg" style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '8px',
                    borderRadius: '50%'
                  }}></i>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-green-800" data-testid="text-feature-photo-title">
                  Photo Upload
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-photo-desc">
                  Take photos of homework with your phone, then upload them to Red Boot's magic system and watch spelling words appear like treasure!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg ring-4 ring-purple-200">
                  <i className="lni lni-game text-orange-400 text-5xl drop-shadow-lg" style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '8px',
                    borderRadius: '50%'
                  }}>⚔️</i>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-purple-800" data-testid="text-feature-game-title">
                  Epic Adventures
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-game-desc">
                  Battle spelling monsters with Red Boot and Diego and discover hidden treasures across magical islands!
                </p>
              </CardContent>
            </Card>

            <Card className="text-center hover:shadow-lg transition-shadow">
              <CardContent className="p-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mx-auto mb-4 flex items-center justify-center shadow-lg ring-4 ring-cyan-200">
                  <i className="lni lni-world text-red-400 text-5xl drop-shadow-lg" style={{ 
                    backgroundColor: 'rgba(255,255,255,0.2)',
                    padding: '8px',
                    borderRadius: '50%'
                  }}>🗺️</i>
                </div>
                <h3 className="font-bold text-2xl mb-4 text-cyan-800" data-testid="text-feature-progress-title">
                  Treasure Maps
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-progress-desc">
                  Follow Diego the Pup Pup through pirate adventures and track your spelling progress on magical treasure maps!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Demo Modal */}
      <DemoModal isOpen={isDemoOpen} onClose={() => setIsDemoOpen(false)} />
    </div>
  );
}
