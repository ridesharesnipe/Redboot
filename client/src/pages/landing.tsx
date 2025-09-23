import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RedBootCharacter from "@/components/RedBootCharacter";
import OceanBlueCharacter from "@/components/OceanBlueCharacter";
import SaltyCharacter from "@/components/SaltyCharacter";
import RayRayCharacter from "@/components/RayRayCharacter";
import DemoModal from "@/components/DemoModal";
import { useAudio } from "@/contexts/AudioContext";
import { Users, Compass, Anchor, Play, Star, Check, Crown, Shield } from "lucide-react";
import redBootIcon from "@assets/1758546464581685620984935859986_1758574136389.png";
import redBootCrew from "@assets/1758546464581685620984935859986_1758574287269.png";
import redBootLandingHead from "@assets/17585900152718502939350575537720_1758590021649.png";

interface LandingProps {
  onStart?: () => void;
}

export default function Landing({ onStart }: LandingProps) {
  const [isDemoOpen, setIsDemoOpen] = useState(false);
  const [audioInitialized, setAudioInitialized] = useState(false);
  const { playSound, startBackgroundMusic, playCharacterVoice } = useAudio();

  // Initialize audio on first user interaction (mobile-friendly)
  const initializeAudio = () => {
    if (!audioInitialized) {
      setAudioInitialized(true);
      startBackgroundMusic('ocean_ambient');
      // Welcome message after audio context is unlocked
      setTimeout(() => {
        playCharacterVoice('red_boot_welcome');
      }, 500);
    }
  };

  const handleLogin = () => {
    initializeAudio();
    playSound('anchor_button_click');
    playCharacterVoice('red_boot_ahoy');
    setTimeout(() => {
      onStart?.();
    }, 500);
  };

  const handleDemo = () => {
    initializeAudio();
    playSound('compass_navigation');
    setIsDemoOpen(true);
  };

  return (
    <div className="min-h-[100svh] bg-background overflow-x-hidden">
      {/* Hero Section with Ocean Background */}
      <section className="ocean-hero text-white py-10 md:py-20 px-4 relative min-h-[100svh] overflow-x-hidden safe-area-bottom">
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
          <div className="mb-16 flex justify-center">
            <div className="relative flex items-center justify-center float-animation landscape-reduce">
              <div className="character-container relative overflow-hidden rounded-full bg-white border-4 md:border-8 border-white shadow-2xl mx-auto">
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
          <h1 className="fluid-heading-xl mb-6 sm:mb-8 md:mb-12 font-bold drop-shadow-2xl text-sky-300" data-testid="text-hero-title" style={{ fontFamily: "'Pirata One', cursive" }}>
            Ahoy, Matey!
          </h1>
          <div className="mb-6 sm:mb-8 md:mb-10 flex justify-center">
            <i className="lni lni-compass text-8xl text-yellow-400 drop-shadow-lg" style={{ 
              fontFamily: 'LineIcons', 
              fontStyle: 'normal',
              backgroundColor: 'rgba(255,255,255,0.1)',
              padding: '12px',
              borderRadius: '50%'
            }}>🧭</i>
          </div>
          <div className="relative">
            <div className="absolute -top-2 left-1/2 transform -translate-x-1/2 -z-10 animate-pulse">
              <i className="lni lni-island text-green-400 drop-shadow-2xl" style={{ 
                fontSize: '16rem',
                backgroundColor: 'rgba(34,197,94,0.15)',
                padding: '24px',
                borderRadius: '50%',
                border: '4px solid rgba(34,197,94,0.2)'
              }}>🏝️</i>
            </div>
            <p className="fluid-text-lg mb-8 sm:mb-12 text-white font-semibold drop-shadow-lg max-reading-width mx-auto px-4 relative z-10" data-testid="text-hero-subtitle">
              Join Red Boot on a treasure hunt where spelling practice becomes the greatest adventure!
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center px-4 safe-area-x">
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white fluid-button rounded-2xl font-bold hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl border-4 border-white/30 w-full sm:w-auto touch-target desktop-hover"
              size="lg"
              data-testid="button-start-adventure"
            >
              <Compass className="w-5 h-5 mr-2" />
              Start Adventure
            </Button>
            <Button 
              onClick={handleDemo}
              variant="outline" 
              className="border-4 border-white bg-white/10 backdrop-blur-sm text-white fluid-button rounded-2xl font-bold hover:bg-white hover:text-blue-600 transition-all shadow-xl w-full sm:w-auto touch-target desktop-hover"
              size="lg"
              data-testid="button-watch-demo"
            >
              <Play className="w-5 h-5 mr-2" />
              Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Character Crew Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-blue-100 to-purple-100">
        <div className="max-w-6xl mx-auto text-center">
          <h2 className="text-4xl font-fun text-foreground mb-6" data-testid="text-crew-title">
            Meet Your Pirate Crew!
          </h2>
          <p className="text-xl text-gray-600 mb-12">Join Red Boot and his friends on the greatest spelling adventure!</p>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-40 h-40 relative overflow-hidden rounded-3xl bg-transparent">
                  <img 
                    src={redBootCrew} 
                    alt="Red Boot the Brave Captain" 
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
              <h3 className="font-bold text-lg text-green-700 mb-2">Red Boot</h3>
              <p className="text-sm text-gray-600">The Brave Captain</p>
              <div className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">FREE</div>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-40 h-40 relative overflow-hidden rounded-3xl bg-transparent">
                  <OceanBlueCharacter size="medium" animated />
                </div>
              </div>
              <h3 className="font-bold text-lg text-purple-700 mb-2">Ocean Blue</h3>
              <p className="text-sm text-gray-600">Smart Explorer</p>
              <div className="bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">PREMIUM</div>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-40 h-40 relative overflow-hidden rounded-3xl bg-transparent">
                  <SaltyCharacter size="medium" animated />
                </div>
              </div>
              <h3 className="font-bold text-lg text-amber-700 mb-2">Salty</h3>
              <p className="text-sm text-gray-600">Loyal Companion</p>
              <div className="bg-amber-100 text-amber-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">PREMIUM</div>
            </div>
            
            <div className="text-center">
              <div className="mb-4 flex justify-center">
                <div className="w-40 h-40 relative overflow-hidden rounded-3xl bg-transparent">
                  <RayRayCharacter size="medium" animated />
                </div>
              </div>
              <h3 className="font-bold text-lg text-cyan-700 mb-2">Ray Ray</h3>
              <p className="text-sm text-gray-600">Ocean Guide</p>
              <div className="bg-cyan-100 text-cyan-800 text-xs px-2 py-1 rounded-full mt-2 inline-block">PREMIUM</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-gradient-to-b from-white to-green-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-fun text-center text-foreground mb-16" data-testid="text-features-title">
            Amazing Pirate Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-4 border-green-300 bg-gradient-to-br from-green-100 via-emerald-50 to-white relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-green-500 to-green-600 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-green-200">
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

            <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-4 border-purple-300 bg-gradient-to-br from-purple-100 via-pink-50 to-white relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-purple-200">
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
                  Battle spelling monsters with Ocean Blue and discover hidden treasures across magical islands!
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-4 border-cyan-300 bg-gradient-to-br from-cyan-100 via-blue-50 to-white relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-cyan-200">
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
                  Follow Ray Ray through underwater adventures and track your spelling progress on magical treasure maps!
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-fun text-foreground mb-12" data-testid="text-pricing-title">
            Choose Your Adventure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-8 border-4 border-blue-200 bg-gradient-to-b from-blue-50 to-white hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2">
              <CardContent className="pt-6">
                <h3 className="text-2xl font-bold mb-4 text-blue-700" data-testid="text-plan-free-title">Free Adventure</h3>
                <div className="text-4xl font-bold text-blue-600 mb-6" data-testid="text-plan-free-price">$0</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-3 ring-2 ring-white shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-700">Red Boot character</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-3 ring-2 ring-white shadow-md">
                      <Check className="w-3 h-3" />
                    </div>
                    <span className="text-gray-700">1 word list per week</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  variant="outline" 
                  className="w-full py-3 text-lg font-bold border-2 border-blue-400 text-blue-600 hover:bg-blue-50 rounded-xl"
                  data-testid="button-free-plan"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            <Card className="p-8 bg-gradient-to-br from-yellow-400 via-orange-400 to-red-500 text-white border-4 border-yellow-300 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 relative overflow-hidden">
              <div className="absolute top-2 right-2 bg-white text-orange-500 px-3 py-1 rounded-full text-sm font-bold animate-pulse">
                <Star className="w-4 h-4 inline mr-1" />POPULAR
              </div>
              <CardContent className="pt-6 relative z-10">
                <h3 className="text-2xl font-bold mb-4" data-testid="text-plan-premium-title">Premium Adventure</h3>
                <div className="text-4xl font-bold mb-6" data-testid="text-plan-premium-price">$2.99/mo</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>All 4 characters</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>Unlimited word lists</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <Check className="w-3 h-3 text-orange-600" />
                    </div>
                    <span>Advanced analytics</span>
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  className="w-full py-3 text-lg font-bold bg-white text-orange-600 hover:bg-yellow-50 rounded-xl shadow-lg border-2 border-white"
                  data-testid="button-premium-plan"
                >
                  Start 7-Day Free Trial
                </Button>
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
