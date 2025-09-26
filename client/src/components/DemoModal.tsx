import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Upload, FileText, GamepadIcon, Trophy, ChevronLeft, ChevronRight, X } from "lucide-react";
import RedBootCharacter from "@/components/RedBootCharacter";
import { useAudio } from "@/contexts/AudioContext";

interface DemoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const demoSteps = [
  {
    id: 1,
    title: "📤 Upload Your Homework",
    subtitle: "Upload a photo of your spelling list",
    description: "Upload a photo or screenshot of your weekly spelling homework and Red Boot's magic text recognition will extract all the words automatically!",
    icon: <Upload className="w-12 h-12 text-blue-600" />,
    mockup: "photo-capture",
    features: ["Smart text recognition", "Multiple word detection", "Instant processing"]
  },
  {
    id: 2,
    title: "🎯 Words Extracted",
    subtitle: "AI automatically finds your spelling words",
    description: "Our intelligent system scans your homework photo and extracts each spelling word. You can review and edit the list before starting practice.",
    icon: <FileText className="w-12 h-12 text-green-600" />,
    mockup: "word-extraction",
    features: ["Accurate OCR technology", "Editable word lists", "Smart word detection"]
  },
  {
    id: 3,
    title: "🎮 Practice with Red Boot",
    subtitle: "Memory-based spelling adventures",
    description: "Practice each word with Red Boot's proven memorization system. Study the word, then spell it from memory with helpful feedback and encouragement!",
    icon: <GamepadIcon className="w-12 h-12 text-purple-600" />,
    mockup: "spelling-practice",
    features: ["Spaced repetition learning", "Audio pronunciation", "Character expressions"]
  },
  {
    id: 4,
    title: "🏆 Friday Test Ready",
    subtitle: "Simulate your classroom spelling test",
    description: "Take a practice test just like the real thing! Red Boot will read each word aloud while you write the spelling, preparing you for Friday's test.",
    icon: <Trophy className="w-12 h-12 text-orange-600" />,
    mockup: "friday-test",
    features: ["Realistic test simulation", "Confidence building", "Performance tracking"]
  }
];

export default function DemoModal({ isOpen, onClose }: DemoModalProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const { playSound, playCharacterVoice, startBackgroundMusic, stopBackgroundMusic } = useAudio();

  const nextStep = () => {
    playSound('compass_navigation');
    if (currentStep < demoSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // On the last step, close modal and return to landing page
      playSound('ship_bell_success');
      onClose();
    }
  };

  const prevStep = () => {
    playSound('anchor_button_click');
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = demoSteps[currentStep];

  const renderMockup = (mockupType: string) => {
    switch (mockupType) {
      case "photo-capture":
        return (
          <div className="bg-gradient-to-br from-blue-50 to-indigo-100 p-6 rounded-lg border-2 border-blue-200">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <div className="flex items-center justify-center h-48 bg-gray-100 rounded border-2 border-dashed border-gray-300">
                <div className="text-center">
                  <Upload className="w-16 h-16 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500 font-medium">Tap to upload homework photo</p>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="default" data-testid="button-demo-upload">
              📤 Upload Spelling List
            </Button>
          </div>
        );
      
      case "word-extraction":
        return (
          <div className="bg-gradient-to-br from-green-50 to-emerald-100 p-6 rounded-lg border-2 border-green-200">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <h3 className="font-bold text-lg mb-3 text-gray-800">Words Found:</h3>
              <div className="space-y-2">
                {["adventure", "treasure", "captain", "island", "compass"].map((word, index) => (
                  <div key={word} className="flex items-center justify-between p-2 bg-green-50 rounded border">
                    <span className="font-medium text-green-800">{word}</span>
                    <span className="text-xs text-green-600 bg-green-200 px-2 py-1 rounded-full">Detected ✓</span>
                  </div>
                ))}
              </div>
            </div>
            <Button className="w-full" variant="default" data-testid="button-demo-practice">
              🎯 Start Practice
            </Button>
          </div>
        );
      
      case "spelling-practice":
        return (
          <div className="bg-gradient-to-br from-purple-50 to-pink-100 p-6 rounded-lg border-2 border-purple-200">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <div className="text-center mb-4">
                <div className="bg-purple-100 p-4 rounded-lg mb-4">
                  <div className="flex items-center justify-center gap-4 mb-4">
                    <div className="w-16 h-16 flex-shrink-0">
                      <RedBootCharacter size="small" expression="thinking" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-purple-800 mb-2">ADVENTURE</h3>
                      <p className="text-purple-600">Study this word carefully!</p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-center gap-2 mb-3">
                  <div className="w-8 h-8 bg-purple-600 text-white rounded-full flex items-center justify-center font-bold">3</div>
                  <div className="w-8 h-8 bg-purple-400 text-white rounded-full flex items-center justify-center font-bold">2</div>
                  <div className="w-8 h-8 bg-purple-200 text-purple-800 rounded-full flex items-center justify-center font-bold">1</div>
                </div>
              </div>
            </div>
            <Button className="w-full" variant="default" data-testid="button-demo-spell">
              ✏️ Now Spell It!
            </Button>
          </div>
        );
      
      case "friday-test":
        return (
          <div className="bg-gradient-to-br from-orange-50 to-red-100 p-6 rounded-lg border-2 border-orange-200">
            <div className="bg-white p-4 rounded-lg shadow-lg mb-4">
              <div className="text-center mb-4">
                <div className="flex items-center justify-center gap-4 mb-4">
                  <div className="w-16 h-16 flex-shrink-0">
                    <RedBootCharacter size="small" expression="celebrating" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-orange-800 mb-2">Friday Test Simulation</h3>
                    <p className="text-orange-600">Listen and spell each word</p>
                  </div>
                </div>
                <div className="bg-orange-100 p-4 rounded-lg">
                  <p className="text-orange-800 font-medium">🔊 "Spell the word: ADVENTURE"</p>
                  <input 
                    type="text" 
                    className="w-full mt-3 p-3 border-2 border-orange-300 rounded-lg font-mono text-lg text-center"
                    placeholder="Type your spelling here..."
                    data-testid="input-demo-test"
                  />
                </div>
              </div>
            </div>
            <Button className="w-full" variant="default" data-testid="button-demo-submit">
              🏆 Submit Test
            </Button>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto p-0">
        <div className="sticky top-0 bg-white border-b p-6 z-10">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <div>
                <DialogTitle className="text-2xl font-bold text-gray-900" data-testid="text-demo-title">
                  Red Boot's Spelling Adventure Demo
                </DialogTitle>
                <p className="text-gray-600 mt-1">
                  Step {currentStep + 1} of {demoSteps.length}: Complete workflow walkthrough
                </p>
              </div>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => {
                  playSound('anchor_button_click');
                  onClose();
                }}
                className="h-8 w-8 p-0"
                data-testid="button-demo-close"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="flex space-x-2">
              {demoSteps.map((_, index) => (
                <div
                  key={index}
                  className={`flex-1 h-2 rounded-full ${
                    index <= currentStep ? 'bg-blue-600' : 'bg-gray-200'
                  }`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Left Side - Information */}
            <div className="space-y-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {step.icon}
                    <div className="ml-4">
                      <h2 className="text-2xl font-bold text-gray-900" data-testid="text-demo-step-title">
                        {step.title}
                      </h2>
                      <p className="text-gray-600 font-medium">{step.subtitle}</p>
                    </div>
                  </div>
                  
                  <p className="text-gray-700 text-lg leading-relaxed mb-6" data-testid="text-demo-description">
                    {step.description}
                  </p>
                  
                  <div className="space-y-3">
                    <h4 className="font-semibold text-gray-900">Key Features:</h4>
                    {step.features.map((feature, index) => (
                      <div key={index} className="flex items-center">
                        <div className="w-2 h-2 bg-blue-600 rounded-full mr-3"></div>
                        <span className="text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* Character Guide */}
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="w-16 h-16 mr-4">
                      <RedBootCharacter size="small" expression="pointing" />
                    </div>
                    <div>
                      <h4 className="font-bold text-green-800 mb-1">Red Boot Says:</h4>
                      <p className="text-green-700 italic">
                        {currentStep === 0 && "Arrr! Use me magic camera to capture yer homework, matey!"}
                        {currentStep === 1 && "Shiver me timbers! I can read every word on that there page!"}
                        {currentStep === 2 && "Practice makes perfect, ye scallywag! Let's master these words!"}
                        {currentStep === 3 && "Aye! Ye be ready for the Friday test now, brave sailor!"}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Side - Interactive Mockup */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4" data-testid="text-demo-mockup-title">
                  Live Preview:
                </h3>
                {renderMockup(step.mockup)}
              </div>

              {/* Benefits */}
              <Card>
                <CardContent className="p-6">
                  <h4 className="font-semibold text-purple-800 mb-3">Why This Works:</h4>
                  <div className="space-y-2 text-sm">
                    {currentStep === 0 && (
                      <>
                        <p className="text-purple-700">• No manual typing - just snap and go!</p>
                        <p className="text-purple-700">• Works with any homework format</p>
                        <p className="text-purple-700">• Saves time every single week</p>
                      </>
                    )}
                    {currentStep === 1 && (
                      <>
                        <p className="text-purple-700">• 99% accuracy in word detection</p>
                        <p className="text-purple-700">• Handles handwriting and printed text</p>
                        <p className="text-purple-700">• Edit words if needed</p>
                      </>
                    )}
                    {currentStep === 2 && (
                      <>
                        <p className="text-purple-700">• Proven memorization techniques</p>
                        <p className="text-purple-700">• Focuses on difficult words</p>
                        <p className="text-purple-700">• Fun pirate theme keeps kids engaged</p>
                      </>
                    )}
                    {currentStep === 3 && (
                      <>
                        <p className="text-purple-700">• Builds test-taking confidence</p>
                        <p className="text-purple-700">• Realistic classroom simulation</p>
                        <p className="text-purple-700">• Parents see progress reports</p>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>

        {/* Navigation Footer */}
        <div className="sticky bottom-0 bg-white border-t p-6">
          <div className="flex justify-between items-center">
            <Button
              variant="outline"
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center px-6 py-3"
              data-testid="button-demo-prev"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Previous
            </Button>

            <div className="text-center">
              <p className="text-sm text-gray-600 mb-2">Ready to start your adventure?</p>
              <Button
                onClick={() => {
                  playSound('cannon_achievement');
                  playCharacterVoice('red_boot_adventure_complete');
                  setTimeout(() => {
                    onClose();
                    // Navigate to dashboard to start the real adventure
                    window.location.href = "/dashboard";
                  }, 600);
                }}
                variant="default" className="px-8 font-bold"
                data-testid="button-demo-signup"
              >
                🏴‍☠️ Start Free Adventure
              </Button>
            </div>

            <Button
              onClick={nextStep}
              variant="default" className="flex items-center px-6"
              data-testid="button-demo-next"
            >
              {currentStep === demoSteps.length - 1 ? "Back to Home" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}