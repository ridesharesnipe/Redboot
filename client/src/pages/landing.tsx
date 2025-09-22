import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RedBootCharacter from "@/components/RedBootCharacter";
import OceanBlueCharacter from "@/components/OceanBlueCharacter";
import SaltyCharacter from "@/components/SaltyCharacter";
import RayRayCharacter from "@/components/RayRayCharacter";
import { Camera, Swords, Map, Users } from "lucide-react";
import redBootIcon from "@assets/1758546464581685620984935859986_1758574136389.png";
import redBootCrew from "@assets/1758546464581685620984935859986_1758574287269.png";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section with Ocean Background */}
      <section className="ocean-hero text-white py-20 px-4 relative">
        {/* Ocean elements */}
        <div className="ocean-island"></div>
        
        {/* Floating Navigation */}
        <nav className="absolute top-4 left-4 right-4 z-20">
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center space-x-4 bg-white/20 backdrop-blur-sm rounded-2xl px-4 py-2">
              <div className="flex-shrink-0">
                <img 
                  src={redBootIcon} 
                  alt="Red Boot Icon" 
                  className="w-10 h-10 object-contain rounded-lg"
                />
              </div>
              <h1 className="font-fun text-lg text-white drop-shadow-lg whitespace-nowrap">Red Boot's Adventure</h1>
            </div>
            <Button 
              onClick={handleLogin}
              className="bg-white/20 backdrop-blur-sm text-white px-6 py-2 rounded-2xl font-bold hover:bg-white/30 transition-all shadow-lg border border-white/30"
              data-testid="button-login"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M12 2l3 7h7l-6 5 2 7-6-5-6 5 2-7-6-5h7z" fill="currentColor"/>
              </svg>
              Start Adventure
            </Button>
          </div>
        </nav>
        <div className="max-w-6xl mx-auto text-center relative z-10 pt-16">
          <div className="mb-20 flex justify-center">
            <RedBootCharacter size="large" animated />
          </div>
          <h1 className="text-5xl md:text-6xl font-fun mb-6 text-white font-bold drop-shadow-2xl" data-testid="text-hero-title">
            Ahoy, Matey!
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-white font-semibold drop-shadow-lg" data-testid="text-hero-subtitle">
            Join Red Boot on a treasure hunt where spelling practice becomes the greatest adventure!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button 
              onClick={handleLogin}
              className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-8 py-4 rounded-2xl font-bold text-lg hover:from-yellow-500 hover:to-orange-600 transition-all transform hover:scale-105 shadow-xl border-4 border-white/30"
              size="lg"
              data-testid="button-start-adventure"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2">
                <path d="M3 18h18l-9-15z" fill="currentColor" opacity="0.8"/>
                <path d="M12 8v6M8 12h8" stroke="white" strokeWidth="2"/>
              </svg>
              Start Adventure
            </Button>
            <Button 
              variant="outline" 
              className="border-4 border-white bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-2xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all shadow-xl"
              size="lg"
              data-testid="button-watch-demo"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" className="mr-2">
                <circle cx="12" cy="12" r="10" fill="currentColor" opacity="0.8"/>
                <path d="M10 8l6 4-6 4z" fill="white"/>
              </svg>
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
                  <Camera className="text-white w-12 h-12" strokeWidth={2.5} />
                </div>
                <h3 className="font-bold text-2xl mb-4 text-green-800" data-testid="text-feature-photo-title">
                  Photo Capture
                </h3>
                <p className="text-gray-700 text-base leading-relaxed" data-testid="text-feature-photo-desc">
                  Snap photos of homework with Red Boot's magic camera and watch spelling words appear like treasure!
                </p>
              </CardContent>
            </Card>

            <Card className="p-8 text-center hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-3 border-4 border-purple-300 bg-gradient-to-br from-purple-100 via-pink-50 to-white relative overflow-hidden">
              <CardContent className="pt-6">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-pink-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg ring-4 ring-purple-200">
                  <Swords className="text-white w-12 h-12" strokeWidth={2.5} />
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
                  <Map className="text-white w-12 h-12" strokeWidth={2.5} />
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
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span className="text-gray-700">Red Boot character</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-green-400 to-green-500 flex items-center justify-center mr-3 ring-2 ring-white shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
                ⭐ POPULAR
              </div>
              <CardContent className="pt-6 relative z-10">
                <h3 className="text-2xl font-bold mb-4" data-testid="text-plan-premium-title">Premium Adventure</h3>
                <div className="text-4xl font-bold mb-6" data-testid="text-plan-premium-price">$2.99/mo</div>
                <ul className="text-left space-y-3 mb-8">
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="orange" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>All 4 characters</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="orange" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                    <span>Unlimited word lists</span>
                  </li>
                  <li className="flex items-center">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-white to-yellow-100 flex items-center justify-center mr-3 ring-2 ring-white/50 shadow-md">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none">
                        <path d="M9 12l2 2 4-4" stroke="orange" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
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
    </div>
  );
}
