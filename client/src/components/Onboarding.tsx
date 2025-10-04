import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ChevronRight, ChevronLeft, Anchor, CheckCircle2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface OnboardingProps {
  onComplete: () => void;
}

export default function Onboarding({ onComplete }: OnboardingProps) {
  const [screen, setScreen] = useState<1 | 2>(1);
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");
  const { toast } = useToast();

  const handleSkip = () => {
    // Grade level is required even when skipping
    if (!gradeLevel) {
      toast({
        title: "Grade level required",
        description: "Please select your child's grade level before continuing. The child's name is optional.",
        variant: "destructive",
      });
      return;
    }
    
    // Save grade level (child name is optional)
    localStorage.setItem('redboot-onboarding-complete', 'true');
    localStorage.setItem('redboot-grade-level', gradeLevel);
    
    onComplete();
  };

  const handleStartAdventure = () => {
    if (!gradeLevel) {
      toast({
        title: "Grade level required",
        description: "Please select your child's grade level to continue.",
        variant: "destructive",
      });
      return;
    }
    
    // Save to localStorage
    localStorage.setItem('redboot-onboarding-complete', 'true');
    if (childName.trim()) {
      localStorage.setItem('redboot-child-name', childName.trim());
    }
    localStorage.setItem('redboot-grade-level', gradeLevel);
    
    onComplete();
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
            {/* Progress dots */}
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
                    <Select value={gradeLevel} onValueChange={setGradeLevel}>
                      <SelectTrigger 
                        id="grade-level" 
                        className="text-lg border-2 border-red-200"
                        data-testid="select-grade-level"
                      >
                        <SelectValue placeholder="Select grade level *" />
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
                    <p className="text-sm text-red-600 font-semibold">
                      ⚠️ Grade level is required for practice and testing
                    </p>
                  </div>
                </div>

                {/* Buttons */}
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button
                    onClick={() => setScreen(1)}
                    variant="outline"
                    size="lg"
                    className="flex-1"
                    data-testid="button-back"
                  >
                    <ChevronLeft className="w-5 h-5 mr-2" />
                    Back
                  </Button>
                  <Button
                    onClick={handleSkip}
                    variant="ghost"
                    size="lg"
                    className="flex-1"
                    data-testid="button-skip"
                  >
                    Skip for Now
                  </Button>
                  <Button
                    onClick={handleStartAdventure}
                    size="lg"
                    className="flex-1 font-bold text-lg"
                    data-testid="button-start-adventure"
                  >
                    <Anchor className="w-5 h-5 mr-2" />
                    Start Adventure!
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
