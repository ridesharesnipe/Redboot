import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Anchor, Sparkles } from "lucide-react";
import redBootImage from "@assets/1765213908924_1765214014077.jpg";

interface ChildSetupProps {
  onComplete: () => void;
}

export default function ChildSetup({ onComplete }: ChildSetupProps) {
  const [childName, setChildName] = useState("");
  const [gradeLevel, setGradeLevel] = useState("");

  const handleGradeSelection = (selectedGrade: string) => {
    setGradeLevel(selectedGrade);
    
    localStorage.setItem('redboot-onboarding-complete', 'true');
    if (childName.trim()) {
      localStorage.setItem('redboot-child-name', childName.trim());
    }
    localStorage.setItem('redboot-grade-level', selectedGrade);
    
    onComplete();
  };

  const handleContinue = () => {
    if (!gradeLevel) return;
    handleGradeSelection(gradeLevel);
  };

  return (
    <div className="fixed inset-0 bg-white flex items-center justify-center p-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 text-6xl opacity-20 animate-bounce">⚓</div>
        <div className="absolute top-20 right-20 text-5xl opacity-20 animate-pulse">🏴‍☠️</div>
        <div className="absolute bottom-20 left-20 text-4xl opacity-20 animate-bounce" style={{ animationDelay: '0.5s' }}>💎</div>
        <div className="absolute bottom-10 right-10 text-5xl opacity-20 animate-pulse" style={{ animationDelay: '0.3s' }}>🗺️</div>
      </div>

      <Card className="w-full max-w-md bg-white shadow-2xl border-4 border-amber-400 relative z-10">
        <CardContent className="p-6 sm:p-8">
          <div className="text-center mb-6">
            <div className="w-24 h-24 sm:w-32 sm:h-32 mx-auto mb-4 rounded-full overflow-hidden border-4 border-amber-400 shadow-lg bg-white">
              <img 
                src={redBootImage} 
                alt="Red Boot" 
                className="w-full h-full object-cover"
              />
            </div>
            <h1 
              className="text-2xl sm:text-3xl font-bold text-amber-600 mb-2"
              style={{ fontFamily: "'Pirata One', cursive" }}
            >
              Ahoy, New Pirate!
            </h1>
            <p className="text-gray-600 text-sm sm:text-base">
              Tell me about the young pirate who'll be sailing with us!
            </p>
          </div>

          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="child-name" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                Pirate's Name
              </Label>
              <Input
                id="child-name"
                type="text"
                placeholder="What's your name, matey?"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                className="text-lg border-2 border-amber-200 focus:border-amber-400 bg-white text-gray-900 placeholder:text-gray-400"
                data-testid="input-child-name"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="grade-level" className="text-base font-semibold text-gray-700 flex items-center gap-2">
                <Anchor className="w-4 h-4 text-blue-500" />
                Grade Level
              </Label>
              <Select value={gradeLevel} onValueChange={setGradeLevel}>
                <SelectTrigger 
                  id="grade-level" 
                  className="text-lg border-2 border-blue-200 focus:border-blue-400 bg-white text-gray-900"
                  data-testid="select-grade-level"
                >
                  <SelectValue placeholder="Pick your grade" />
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
            </div>

            <Button
              onClick={handleContinue}
              disabled={!gradeLevel}
              size="lg"
              className="w-full font-bold text-lg bg-gradient-to-r from-orange-400 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white shadow-lg"
              style={{ boxShadow: '0 4px 14px rgba(251, 146, 60, 0.5)' }}
              data-testid="button-set-sail"
            >
              <Anchor className="w-5 h-5 mr-2" />
              Set Sail!
            </Button>

            <p className="text-center text-xs text-gray-500">
              Don't worry, you can change these later!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
