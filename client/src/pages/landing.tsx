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
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 safe-area-x">
            {/* Start Adventure - Primary Glass Button */}
            <button 
              onClick={handleStartAdventure}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #16a34a 0%, #15803d 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(22, 163, 74, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 40px rgba(34, 197, 94, 0.3)'
              }}
              data-testid="button-start-adventure"
            >
              <span className="flex items-center justify-center gap-2 drop-shadow-md">
                <Compass className="w-5 h-5" />
                Start Adventure
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </button>
            
            {/* Treasure Vault - Gold Glass Button */}
            <button 
              onClick={() => {
                initializeAudio();
                playSound('treasure_chest_open');
                setLocation('/vault');
              }}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, #d97706 0%, #b45309 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                boxShadow: '0 8px 32px rgba(217, 119, 6, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 40px rgba(245, 158, 11, 0.3)'
              }}
              data-testid="button-treasure-vault"
            >
              <span className="flex items-center justify-center gap-2 drop-shadow-md">
                <Gem className="w-5 h-5" />
                Treasure Vault
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </button>
            
            {/* Start Demo - Deep Blue Glass Button */}
            <button 
              onClick={handleDemo}
              className="group relative w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-lg text-white transition-all duration-300 hover:scale-105 hover:-translate-y-1"
              style={{
                background: 'linear-gradient(135deg, rgba(30, 58, 138, 0.9) 0%, rgba(29, 78, 216, 0.85) 100%)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.35)',
                boxShadow: '0 8px 32px rgba(29, 78, 216, 0.4), inset 0 1px 0 rgba(255, 255, 255, 0.3), 0 0 40px rgba(59, 130, 246, 0.2)'
              }}
              data-testid="button-watch-demo"
            >
              <span className="flex items-center justify-center gap-2 drop-shadow-md">
                <Play className="w-5 h-5" />
                Start Demo
              </span>
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.15) 0%, transparent 50%)',
                pointerEvents: 'none'
              }} />
            </button>
          </div>
        </div>
      </section>

      {/* Character Crew Section - Ocean to Shore Transition */}
      <section className="py-16 px-4 relative overflow-hidden" style={{
        background: 'linear-gradient(180deg, #0c4a6e 0%, #0e7490 30%, #22d3ee 60%, #a5f3fc 85%, #ecfeff 100%)'
      }}>
        {/* Subtle wave overlay */}
        <div className="absolute inset-0 opacity-20" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 1440 320'%3E%3Cpath fill='%23ffffff' fill-opacity='0.3' d='M0,160L48,176C96,192,192,224,288,213.3C384,203,480,149,576,138.7C672,128,768,160,864,186.7C960,213,1056,235,1152,224C1248,213,1344,171,1392,149.3L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z'%3E%3C/path%3E%3C/svg%3E")`,
          backgroundSize: 'cover',
          backgroundPosition: 'bottom'
        }} />
        
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl md:text-5xl mb-3 text-white drop-shadow-lg" style={{ fontFamily: "'Pirata One', cursive" }} data-testid="text-crew-title">
            Choose Your Adventure!
          </h2>
          <p className="text-lg sm:text-xl text-cyan-100 mb-8 font-medium drop-shadow">Select your hero to begin your spelling journey!</p>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-8 max-w-4xl mx-auto">
            {/* Red Boot - Treasure Hunt */}
            <div 
              className={`group text-center cursor-pointer p-6 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                selectedCharacter === 'redboot' ? 'ring-4 ring-yellow-400 scale-105' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.6) 0%, rgba(6, 95, 120, 0.7) 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 15px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(239, 68, 68, 0.15)'
              }}
              onClick={() => {
                playSound('anchor_button_click');
                playCharacterVoice('red_boot_ahoy');
                localStorage.setItem('selectedCharacter', 'redboot');
                if (onStart) onStart();
              }}
              data-testid="character-select-redboot"
            >
              <div className="mb-4 flex justify-center relative character-idle-breathe">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 relative overflow-hidden rounded-2xl p-1 transition-all character-idle-sway ${
                  selectedCharacter === 'redboot' ? 'animate-pulse' : ''
                }`} style={{
                  background: 'linear-gradient(135deg, rgba(251, 191, 36, 0.3) 0%, rgba(239, 68, 68, 0.3) 100%)',
                  boxShadow: '0 8px 30px rgba(239, 68, 68, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                  <img 
                    src={redBootCrew} 
                    alt="Red Boot the Brave Captain" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {selectedCharacter === 'redboot' && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-yellow-400 to-amber-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-2xl text-white mb-2 drop-shadow-lg" style={{ fontFamily: "'Fredoka One', cursive" }}>Red Boot</h3>
              <p className="text-base text-amber-300 font-semibold mb-2 drop-shadow">⚓ Treasure Hunt Adventure</p>
              <p className="text-sm text-cyan-100 mb-3 drop-shadow">Dig up buried treasures on mysterious islands!</p>
              <div className="bg-gradient-to-r from-green-400 to-emerald-500 text-white text-sm px-4 py-2 rounded-full inline-block font-bold shadow-lg" style={{
                boxShadow: '0 4px 15px rgba(34, 197, 94, 0.4)'
              }}>FREE</div>
            </div>
            
            {/* Diego - Sea Monster Battle */}
            <div 
              className={`group text-center cursor-pointer p-6 rounded-3xl transition-all duration-300 hover:scale-105 hover:-translate-y-2 ${
                selectedCharacter === 'diego' ? 'ring-4 ring-cyan-300 scale-105' : ''
              }`}
              style={{
                background: 'linear-gradient(135deg, rgba(14, 116, 144, 0.6) 0%, rgba(6, 95, 120, 0.7) 100%)',
                backdropFilter: 'blur(16px)',
                border: '1px solid rgba(255, 255, 255, 0.25)',
                boxShadow: '0 15px 50px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,0.2), 0 0 60px rgba(6, 182, 212, 0.15)'
              }}
              onClick={() => {
                playSound('anchor_button_click');
                playAudioFile(diegoBarkSound, 1, true);
                localStorage.setItem('selectedCharacter', 'diego');
                if (onStart) onStart();
              }}
              data-testid="character-select-diego"
            >
              <div className="mb-4 flex justify-center relative character-idle-breathe">
                <div className={`w-36 h-36 sm:w-44 sm:h-44 md:w-52 md:h-52 relative overflow-hidden rounded-2xl p-1 transition-all character-idle-sway ${
                  selectedCharacter === 'diego' ? 'animate-pulse' : ''
                }`} style={{
                  background: 'linear-gradient(135deg, rgba(34, 211, 238, 0.3) 0%, rgba(59, 130, 246, 0.3) 100%)',
                  boxShadow: '0 8px 30px rgba(6, 182, 212, 0.3), inset 0 1px 0 rgba(255,255,255,0.3)'
                }}>
                  <img 
                    src={diegoImage} 
                    alt="Diego the Pup Pup" 
                    className="w-full h-full object-cover rounded-xl"
                  />
                </div>
                {selectedCharacter === 'diego' && (
                  <div className="absolute -top-2 -right-2 w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-500 rounded-full flex items-center justify-center animate-bounce shadow-lg">
                    <Check className="w-6 h-6 text-white" />
                  </div>
                )}
              </div>
              <h3 className="font-bold text-2xl text-white mb-2 drop-shadow-lg" style={{ fontFamily: "'Fredoka One', cursive" }}>Diego the Pup Pup</h3>
              <p className="text-base text-cyan-300 font-semibold mb-2 drop-shadow">🌊 Sea Monster Battle</p>
              <p className="text-sm text-cyan-100 mb-3 drop-shadow">Battle fearsome sea monsters and claim their treasures!</p>
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 text-white text-sm px-4 py-2 rounded-full inline-block font-bold shadow-lg" style={{
                boxShadow: '0 4px 15px rgba(6, 182, 212, 0.4)'
              }}>FREE</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section - Sandy Beach Arrival */}
      <section className="py-12 px-4 relative" style={{
        background: 'linear-gradient(180deg, #ecfeff 0%, #fef3c7 30%, #fef9c3 60%, #fffbeb 100%)'
      }}>
        {/* Beach sand texture overlay */}
        <div className="absolute inset-0 opacity-30" style={{
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(251, 191, 36, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(245, 158, 11, 0.08) 0%, transparent 50%)'
        }} />
        
        <div className="max-w-6xl mx-auto relative z-10">
          <div className="text-center mb-10">
            <h2 className="text-3xl sm:text-4xl md:text-5xl text-amber-700 mb-3 drop-shadow-sm" style={{ fontFamily: "'Pirata One', cursive" }} data-testid="text-features-title">
              Amazing Pirate Features
            </h2>
            <p className="text-lg text-amber-600/80 font-medium">Everything ye need for a grand spelling adventure!</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Photo Upload Card */}
            <div className="clay-card bento-hover-float bento-hover-green rounded-3xl p-6 bg-white/90 backdrop-blur-sm text-center" style={{
              boxShadow: '0 8px 32px rgba(34, 197, 94, 0.15), 0 0 0 1px rgba(34, 197, 94, 0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-green-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg" style={{
                boxShadow: '0 8px 20px rgba(34, 197, 94, 0.35)'
              }}>
                <span className="text-4xl">📸</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-emerald-800" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-feature-photo-title">
                Photo Upload
              </h3>
              <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-photo-desc">
                Snap a photo of your spelling list and watch the magic happen! Words appear ready for adventure.
              </p>
            </div>

            {/* Epic Adventures Card */}
            <div className="clay-card bento-hover-float bento-hover-purple rounded-3xl p-6 bg-white/90 backdrop-blur-sm text-center" style={{
              boxShadow: '0 8px 32px rgba(147, 51, 234, 0.15), 0 0 0 1px rgba(147, 51, 234, 0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <div className="w-20 h-20 bg-gradient-to-br from-purple-400 to-pink-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg" style={{
                boxShadow: '0 8px 20px rgba(147, 51, 234, 0.35)'
              }}>
                <span className="text-4xl">⚔️</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-purple-800" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-feature-game-title">
                Epic Adventures
              </h3>
              <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-game-desc">
                Battle sea monsters, dig for treasure, and become the greatest spelling pirate of all!
              </p>
            </div>

            {/* Treasure Maps Card */}
            <div className="clay-card bento-hover-float bento-hover-gold rounded-3xl p-6 bg-white/90 backdrop-blur-sm text-center" style={{
              boxShadow: '0 8px 32px rgba(245, 158, 11, 0.15), 0 0 0 1px rgba(245, 158, 11, 0.1), inset 0 2px 4px rgba(255,255,255,0.9)'
            }}>
              <div className="w-20 h-20 bg-gradient-to-br from-amber-400 to-orange-500 rounded-2xl mx-auto mb-5 flex items-center justify-center shadow-lg" style={{
                boxShadow: '0 8px 20px rgba(245, 158, 11, 0.35)'
              }}>
                <span className="text-4xl">🗺️</span>
              </div>
              <h3 className="font-bold text-xl mb-3 text-amber-800" style={{ fontFamily: "'Fredoka One', cursive" }} data-testid="text-feature-progress-title">
                Treasure Maps
              </h3>
              <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-progress-desc">
                Track your progress on magical maps and watch your treasure collection grow!
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
