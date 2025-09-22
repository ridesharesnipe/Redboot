import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import RedBootCharacter from "@/components/RedBootCharacter";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="bg-card border-b border-border px-4 py-3 shadow-sm">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-secondary rounded-full flex items-center justify-center">
              <i className="fas fa-anchor text-secondary-foreground text-lg"></i>
            </div>
            <h1 className="font-pirate text-xl text-primary">Red Boot's Adventure</h1>
          </div>
          <Button 
            onClick={handleLogin}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            data-testid="button-login"
          >
            <i className="fas fa-crown mr-2"></i>Start Adventure
          </Button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="wave-background text-white py-20 px-4 relative">
        <div className="max-w-6xl mx-auto text-center relative z-10">
          <div className="mb-16 flex justify-center">
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
              className="bg-treasure-500 text-treasure-50 px-8 py-4 rounded-xl font-bold text-lg hover:bg-treasure-600 transition-all transform hover:scale-105 shadow-lg"
              size="lg"
              data-testid="button-start-adventure"
            >
              <i className="fas fa-ship mr-2"></i>Start Adventure
            </Button>
            <Button 
              variant="outline" 
              className="border-2 border-white bg-white/10 backdrop-blur-sm text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white hover:text-blue-600 transition-all shadow-lg"
              size="lg"
              data-testid="button-watch-demo"
            >
              <i className="fas fa-play mr-2"></i>Watch Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-muted">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl font-fun text-center text-foreground mb-12" data-testid="text-features-title">
            Treasure Hunt Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-accent rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-camera text-accent-foreground text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2" data-testid="text-feature-photo-title">
                  Photo Capture
                </h3>
                <p className="text-muted-foreground" data-testid="text-feature-photo-desc">
                  Take photos of spelling homework and automatically extract word lists
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-secondary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-gamepad text-secondary-foreground text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2" data-testid="text-feature-game-title">
                  Pirate Adventure
                </h3>
                <p className="text-muted-foreground" data-testid="text-feature-game-desc">
                  Practice spelling with Red Boot in exciting treasure hunt adventures
                </p>
              </CardContent>
            </Card>

            <Card className="p-6 text-center hover:shadow-lg transition-shadow">
              <CardContent className="pt-6">
                <div className="w-16 h-16 bg-primary rounded-full mx-auto mb-4 flex items-center justify-center">
                  <i className="fas fa-chart-line text-primary-foreground text-2xl"></i>
                </div>
                <h3 className="font-bold text-lg mb-2" data-testid="text-feature-progress-title">
                  Progress Tracking
                </h3>
                <p className="text-muted-foreground" data-testid="text-feature-progress-desc">
                  Watch progress on interactive treasure maps with achievements
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Preview */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-fun text-foreground mb-8" data-testid="text-pricing-title">
            Choose Your Adventure
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="p-6 border-2 border-border">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2" data-testid="text-plan-free-title">Free Adventure</h3>
                <div className="text-3xl font-bold text-foreground mb-4" data-testid="text-plan-free-price">$0</div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check text-secondary mr-2"></i>
                    Red Boot character
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-secondary mr-2"></i>
                    1 word list per week
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  variant="outline" 
                  className="w-full"
                  data-testid="button-free-plan"
                >
                  Start Free
                </Button>
              </CardContent>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-treasure-400 to-treasure-600 text-treasure-50">
              <CardContent className="pt-6">
                <h3 className="text-xl font-bold mb-2" data-testid="text-plan-premium-title">Premium Adventure</h3>
                <div className="text-3xl font-bold mb-4" data-testid="text-plan-premium-price">$2.99/mo</div>
                <ul className="text-left space-y-2 mb-6">
                  <li className="flex items-center">
                    <i className="fas fa-check text-white mr-2"></i>
                    All 4 characters
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white mr-2"></i>
                    Unlimited word lists
                  </li>
                  <li className="flex items-center">
                    <i className="fas fa-check text-white mr-2"></i>
                    Advanced analytics
                  </li>
                </ul>
                <Button 
                  onClick={handleLogin}
                  className="w-full bg-white text-treasure-600 hover:bg-treasure-50"
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
