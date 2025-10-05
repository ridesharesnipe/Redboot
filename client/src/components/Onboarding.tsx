import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Anchor, CheckCircle2, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState<0 | 1 | 2>(0); // Start at 0 for loading screen
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isWarmingUp, setIsWarmingUp] = useState(true);
  const { toast } = useToast();

  // Pre-warm database on mount and auto-advance to screen 1 when ready
  useEffect(() => {
    const warmUpDatabase = async () => {
      try {
        // Call /api/auth/user to wake up database and establish session
        await fetch('/api/auth/user', {
          headers: {
            'X-Player-Id': localStorage.getItem('redboot-player-id') || '',
            'X-Session-Token': localStorage.getItem('redboot-session-token') || '',
          },
        });
        setIsWarmingUp(false);
        // Auto-advance to screen 1 once database is ready
        setScreen(1);
      } catch (error) {
        console.error('Database warm-up error:', error);
        // Still allow user to proceed even if warm-up fails
        setIsWarmingUp(false);
        setScreen(1);
      }
    };
    
    warmUpDatabase();
  }, []);

  const handleGradeSelection = async (selectedGrade: string) => {
    setGradeLevel(selectedGrade);
    setIsSaving(true);
    
    try {
      // Save to database via API
      await apiRequest('POST', '/api/onboarding', {
        childName: childName.trim() || undefined,
        gradeLevel: selectedGrade,
        skip: !childName.trim()
      });
      
      // Save to localStorage
      localStorage.setItem('redboot-onboarding-complete', 'true');
      if (childName.trim()) {
        localStorage.setItem('redboot-child-name', childName.trim());
      }
      localStorage.setItem('redboot-grade-level', selectedGrade);
      
      onComplete();
    } catch (error: any) {
      console.error('Onboarding save error:', error);
      const errorMessage = error?.message || "Failed to save onboarding data. Please try again.";
      toast({
        title: "Save Error",
        description: errorMessage,
        variant: "destructive",
      });
      setIsSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-400 via-sky-500 to-purple-500 overflow-hidden flex items-center justify-center p-4"
      style={{
        background: `
          radial-gradient(circle at 30% 20%, #87CEEB 0%, #4682B4 25%),
          radial-gradient(circle at 70% 80%, #FFD700 0%, #FFA500 30%),
          linear-gradient(135deg, #87CEEB 0%, #4169E1 50%, #191970 100%)
        `,
      }}
    >
      {/* Ocean waves at bottom */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-blue-600 via-blue-500 to-transparent opacity-60">
        <div className="wave wave1"></div>
        <div className="wave wave2"></div>
        <div className="wave wave3"></div>
      </div>

      {/* Floating clouds */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="cloud cloud-1"></div>
        <div className="cloud cloud-2"></div>
        <div className="cloud cloud-3"></div>
      </div>

      {/* Main Content */}
      <div className="relative z-10 w-full max-w-2xl mx-auto">
        <Card className="bg-white/95 backdrop-blur-sm shadow-2xl border-4 border-yellow-400">
          <CardContent className="p-8">
            {/* Progress dots - only show for screens 1 and 2 */}
            {screen !== 0 && (
              <div className="flex justify-center gap-2 mb-6">
                <div 
                  className={`w-3 h-3 rounded-full transition-all ${
                    screen === 1 ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                  data-testid="progress-dot-1"
                />
                <div 
                  className={`w-3 h-3 rounded-full transition-all ${
                    screen === 2 ? 'bg-blue-600 w-8' : 'bg-gray-300'
                  }`}
                  data-testid="progress-dot-2"
                />
              </div>
            )}

            {/* Screen 0: Loading the Ship */}
            {screen === 0 && (
              <div className="space-y-8 text-center py-12" data-testid="onboarding-screen-loading">
                <div>
                  <h1 
                    className="text-5xl sm:text-6xl font-bold text-blue-700 mb-6 drop-shadow-lg"
                    style={{ fontFamily: "'Pirata One', cursive" }}
                  >
                    Loading the Ship...
                  </h1>
                  <div className="text-7xl mb-6 animate-bounce">⛵</div>
                </div>

                <div className="flex flex-col items-center gap-4">
                  <Loader2 className="w-12 h-12 text-blue-600 animate-spin" />
                  <p className="text-xl text-gray-600 font-semibold">
                    Preparing for your adventure...
                  </p>
                  <p className="text-sm text-gray-500">
                    (Waking up the database)
                  </p>
                </div>
              </div>
            )}

            {/* Screen 1: Welcome + Science */}
            {screen === 1 && (
              <div className="space-y-6" data-testid="onboarding-screen-1">
                <div className="text-center">
                  <h1 
                    className="text-4xl sm:text-5xl font-bold text-blue-700 mb-4 drop-shadow-lg"
                    style={{ fontFamily: "'Pirata One', cursive" }}
                  >
                    Welcome to Red Boot's Spelling Adventure!
                  </h1>
                  <div className="text-6xl mb-4 animate-bounce">⚓</div>
                </div>

                <div className="space-y-4 text-gray-700">
                  <p className="text-lg leading-relaxed">
                    Transform spelling homework into an adventure backed by <strong>140+ years of research</strong>:
                  </p>

                  <div className="space-y-3 pl-4">
                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-blue-700">SPACED REPETITION</strong> - UCLA's Dr. Robert Bjork proved spacing out practice beats cramming
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-blue-700">RETRIEVAL PRACTICE</strong> - Washington University's Drs. Roediger & Karpicke showed testing beats restudying by 50%
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CheckCircle2 className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
                      <div>
                        <strong className="text-blue-700">IMMEDIATE FEEDBACK</strong> - Kids stay motivated while building long-term memory
                      </div>
                    </div>
                  </div>

                  <div className="bg-yellow-50 border-2 border-yellow-400 rounded-lg p-4 mt-4">
                    <p className="text-lg font-bold text-yellow-900">
                      Result: Better test scores + kids who actually enjoy practicing.
                    </p>
                  </div>
                </div>

                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setScreen(2)}
                    size="lg"
                    className="font-bold text-lg"
                    data-testid="button-next-screen"
                  >
                    Next
                    <ChevronRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* Screen 2: Quick Setup */}
            {screen === 2 && (
              <div className="space-y-6" data-testid="onboarding-screen-2">
                <div className="text-center">
                  <h1 
                    className="text-4xl sm:text-5xl font-bold text-blue-700 mb-4 drop-shadow-lg"
                    style={{ fontFamily: "'Pirata One', cursive" }}
                  >
                    Quick Setup
                  </h1>
                  <div className="text-6xl mb-4">🗺️</div>
                </div>

                <div className="space-y-5">
                  {/* Child's Name (optional) */}
                  <div className="space-y-2">
                    <Label htmlFor="child-name" className="text-base font-semibold text-gray-700">
                      Child's Name <span className="text-gray-500 text-sm font-normal">(optional)</span>
                    </Label>
                    <Input
                      id="child-name"
                      type="text"
                      placeholder="e.g., Emma"
                      value={childName}
                      onChange={(e) => setChildName(e.target.value)}
                      className="text-lg"
                      data-testid="input-child-name"
                    />
                  </div>

                  {/* Grade Level (required) */}
                  <div className="space-y-2">
                    <Label htmlFor="grade-level" className="text-base font-semibold text-gray-700">
                      Grade Level <span className="text-red-600">* Required</span>
                    </Label>
                    <Select value={gradeLevel} onValueChange={handleGradeSelection} disabled={isSaving}>
                      <SelectTrigger 
                        id="grade-level" 
                        className="text-lg border-2 border-red-200"
                        data-testid="select-grade-level"
                      >
                        <SelectValue placeholder={isSaving ? "Saving..." : "Select grade level *"} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="K">Kindergarten</SelectItem>
                        <SelectItem value="1st">1st Grade</SelectItem>
                        <SelectItem value="2nd">2nd Grade</SelectItem>
                        <SelectItem value="3rd">3rd Grade</SelectItem>
                        <SelectItem value="4th">4th Grade</SelectItem>
                        <SelectItem value="5th">5th Grade</SelectItem>
                      </SelectContent>
                    </Select>
                    <p className="text-sm text-blue-600 font-semibold">
                      ✨ Selecting a grade will automatically start your adventure!
                    </p>
                  </div>
                </div>

                {/* Back Button */}
                <div className="flex justify-center pt-4">
                  <Button
                    onClick={() => setScreen(1)}
                    variant="outline"
                    size="lg"
                    disabled={isSaving}
                    data-testid="button-back"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
