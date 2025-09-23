import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  ArrowLeft, 
  Upload, 
  Compass, 
  Crown, 
  MapPin, 
  Skull,
  Ship,
  Calendar,
  CheckCircle,
  AlertCircle,
  Clock,
  Star,
  BookOpen,
  Scroll
} from 'lucide-react';

interface ParentGuideProps {
  onBack: () => void;
}

export default function ParentGuide({ onBack }: ParentGuideProps) {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <Card className="bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 border-2 border-amber-400 shadow-2xl">
        <CardHeader className="relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-blue-400 via-blue-600 to-blue-800"></div>
          <div className="absolute inset-0 opacity-60">
            <svg className="w-full h-full" viewBox="0 0 1200 120" preserveAspectRatio="none">
              <path d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z" opacity=".25" fill="#ffffff"></path>
              <path d="M0,0V15.81C13,36.92,27.64,56.86,47.69,72.05,99.41,111.27,165,111,224.58,91.58c31.15-10.15,60.09-26.07,89.67-39.8,40.92-19,84.73-46,130.83-49.67,36.26-2.85,70.9,9.42,98.6,31.56,31.77,25.39,62.32,62,103.63,73,40.44,10.79,81.35-6.69,119.13-24.28s75.16-39,116.92-43.05c59.73-5.85,113.28,22.88,168.9,38.84,30.2,8.66,59,6.17,87.09-7.5,22.43-10.89,48-26.93,60.65-49.24V0Z" opacity=".5" fill="#ffffff"></path>
              <path d="M0,0V5.63C149.93,59,314.09,71.32,475.83,42.57c43-7.64,84.23-20.12,127.61-26.46,59-8.63,112.48,12.24,165.56,35.4C827.93,77.22,886,95.24,951.2,90c86.53-7,172.46-45.71,248.8-84.81V0Z" fill="#ffffff"></path>
            </svg>
          </div>
          <div className="relative flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-amber-500 rounded-full flex items-center justify-center border-4 border-amber-300 shadow-lg">
                <BookOpen className="w-8 h-8 text-amber-900" />
              </div>
              <div>
                <CardTitle className="text-3xl text-amber-100 font-bold tracking-wide" style={{ fontFamily: 'var(--font-pirate)' }}>
                  🏴‍☠️ Parent's Guide to Red Boot's Adventure 🏴‍☠️
                </CardTitle>
                <p className="text-amber-200 mt-1 text-lg">
                  ⚓ Complete instructions for a successful spelling voyage ⚓
                </p>
              </div>
            </div>
            <Button 
              onClick={onBack} 
              variant="outline" 
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-blue-900 font-bold"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Quick Overview */}
      <Card className="border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-indigo-100">
          <CardTitle className="text-blue-900 font-bold text-xl">
            🚀 Quick Overview: Your Weekly Spelling Adventure
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mb-2">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-blue-800">Monday</div>
              <div className="text-sm text-blue-600">Upload spelling list</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center mb-2">
                <Compass className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-amber-800">Tue-Thu</div>
              <div className="text-sm text-amber-600">Daily practice sessions</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mb-2">
                <Star className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-green-800">Progress</div>
              <div className="text-sm text-green-600">Words become mastered</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mb-2">
                <Crown className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-red-800">Friday</div>
              <div className="text-sm text-red-600">Take the treasure test</div>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center mb-2">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div className="font-bold text-purple-800">Weekend</div>
              <div className="text-sm text-purple-600">Celebrate success!</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 1: Getting Started */}
      <Card className="border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-100 to-blue-200">
          <CardTitle className="text-blue-900 font-bold text-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">1</div>
            📸 Step 1: Upload Your Child's Spelling List (Monday)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Upload className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-bold text-blue-800">Take a Photo</h4>
                <p className="text-gray-700">Click "📸 Chart New Waters" on your dashboard. Use your phone or computer camera to take a clear photo of your child's weekly spelling list.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Scroll className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-bold text-blue-800">Automatic Word Extraction</h4>
                <p className="text-gray-700">Red Boot's OCR technology will automatically read the words from the photo. This usually takes 10-15 seconds.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <CheckCircle className="w-6 h-6 text-blue-600 mt-1" />
              <div>
                <h4 className="font-bold text-blue-800">Verify & Save</h4>
                <p className="text-gray-700">Review the extracted words to make sure they're correct. You can edit any words that weren't recognized properly, then save the list.</p>
              </div>
            </div>
            <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-blue-800">Pro Tip:</h5>
                  <p className="text-blue-700">For best results, take the photo in good lighting with the spelling list flat and clearly visible. The app works with handwritten or printed lists!</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Daily Practice */}
      <Card className="border-2 border-amber-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-amber-100 to-amber-200">
          <CardTitle className="text-amber-900 font-bold text-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-amber-600 rounded-full flex items-center justify-center text-white font-bold">2</div>
            ⚓ Step 2: Daily Practice Sessions (Tuesday-Thursday)
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Compass className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800">Start Daily Adventure</h4>
                <p className="text-gray-700">Click "⚓ Daily Adventure" on your dashboard. Your child will practice words based on their learning progress.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Ship className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800">How Practice Works</h4>
                <p className="text-gray-700">Red Boot will speak each word aloud. Your child types the spelling. They get immediate feedback with encouraging sounds and messages!</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-amber-600 mt-1" />
              <div>
                <h4 className="font-bold text-amber-800">Smart Learning System</h4>
                <p className="text-gray-700">The app uses proven spaced repetition - words that need more practice appear more often, while mastered words appear less frequently.</p>
              </div>
            </div>
            <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <Clock className="w-5 h-5 text-amber-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-amber-800">Practice Sessions:</h5>
                  <p className="text-amber-700">Each session is about 10-15 minutes. Your child can practice multiple times per day if they want more treasure coins!</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Understanding Word Status */}
      <Card className="border-2 border-emerald-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-emerald-100 to-emerald-200">
          <CardTitle className="text-emerald-900 font-bold text-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold">3</div>
            🗺️ Understanding Your Child's Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-slate-500 rounded-full flex items-center justify-center border-2 border-slate-600">
                  <MapPin className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-slate-700">Uncharted Waters</h4>
                  <p className="text-gray-600">Words your child hasn't practiced yet. These will appear in daily practice sessions.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center border-2 border-amber-600">
                  <Compass className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-amber-700">Setting Sail</h4>
                  <p className="text-gray-600">Words your child is learning. They're getting some right, but need more practice.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-emerald-600">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-emerald-700">Treasure Found</h4>
                  <p className="text-gray-600">Words your child has mastered! They consistently spell these correctly.</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center border-2 border-red-600">
                  <Skull className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-red-700">Stormy Seas</h4>
                  <p className="text-gray-600">Words that need extra help. These will appear more often in practice sessions.</p>
                </div>
              </div>
            </div>
            <div className="bg-emerald-50 border-l-4 border-emerald-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-5 h-5 text-emerald-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-emerald-800">Progress Tracking:</h5>
                  <p className="text-emerald-700">Check your dashboard daily to see how words move from "Uncharted Waters" through "Setting Sail" to "Treasure Found"!</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 4: Friday Test */}
      <Card className="border-2 border-red-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-red-100 to-red-200">
          <CardTitle className="text-red-900 font-bold text-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-red-600 rounded-full flex items-center justify-center text-white font-bold">4</div>
            👑 Step 4: Friday Treasure Test
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <Crown className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-bold text-red-800">When to Take the Test</h4>
                <p className="text-gray-700">The "👑 Final Treasure Hunt" button will be enabled when your child has practiced enough. This usually happens by Thursday after 2-3 practice sessions.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-bold text-red-800">How the Test Works</h4>
                <p className="text-gray-700">
                  1. Click "👑 Final Treasure Hunt" from your dashboard<br/>
                  2. Red Boot will speak each word clearly<br/>
                  3. Your child types the spelling in the text box<br/>
                  4. They press Enter or click Next to move to the next word<br/>
                  5. No going back - just like a real school test!
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Star className="w-6 h-6 text-red-600 mt-1" />
              <div>
                <h4 className="font-bold text-red-800">After the Test</h4>
                <p className="text-gray-700">You'll see a detailed treasure map showing: overall score percentage, which words were correct/incorrect, time spent, and a celebration message. Results are automatically saved to track your child's weekly progress!</p>
              </div>
            </div>
            <div className="bg-red-50 border-l-4 border-red-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-red-800">Important:</h5>
                  <p className="text-red-700">Make sure your child is in a quiet space for the test. They should complete it in one sitting, just like at school.</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Troubleshooting */}
      <Card className="border-2 border-purple-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-purple-100 to-purple-200">
          <CardTitle className="text-purple-900 font-bold text-xl flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">?</div>
            🛠️ Troubleshooting & Tips
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-4">
            <div>
              <h4 className="font-bold text-purple-800 mb-2">Having Upload Issues?</h4>
              <p className="text-gray-700">Make sure your browser has camera permissions enabled. If your device doesn't have a camera, look for the "Upload Image" button to select a photo from your device files instead.</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-800 mb-2">Words Not Extracted Correctly?</h4>
              <p className="text-gray-700">You can manually edit any words after the OCR scan. Take photos in good lighting for best results.</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-800 mb-2">My Child Is Struggling?</h4>
              <p className="text-gray-700">The app automatically adjusts - struggling words will appear more often. Encourage daily practice even if it's just 5-10 minutes.</p>
            </div>
            <div>
              <h4 className="font-bold text-purple-800 mb-2">Starting a New Week?</h4>
              <p className="text-gray-700">Every Monday, the app automatically resets for a new spelling list. Your child's previous progress is saved in their treasure collection!</p>
            </div>
            <div className="bg-purple-50 border-l-4 border-purple-400 p-4 rounded">
              <div className="flex items-start gap-2">
                <Star className="w-5 h-5 text-purple-600 mt-0.5" />
                <div>
                  <h5 className="font-bold text-purple-800">Success Tips:</h5>
                  <ul className="text-purple-700 list-disc list-inside space-y-1">
                    <li>Practice a little bit every day rather than cramming</li>
                    <li>Celebrate progress - watch words move to "Treasure Found"!</li>
                    <li>Use the practice sessions as bonding time</li>
                    <li>Let your child collect treasure coins for motivation</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Weekly Schedule */}
      <Card className="border-2 border-gray-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-gray-100 to-gray-200">
          <CardTitle className="text-gray-900 font-bold text-xl">
            📅 Recommended Weekly Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-3">
            <div className="flex items-center gap-4 p-3 bg-blue-50 rounded-lg">
              <div className="w-20 text-center font-bold text-blue-800">Monday</div>
              <div className="text-gray-700">Upload spelling list photo (5 minutes)</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-amber-50 rounded-lg">
              <div className="w-20 text-center font-bold text-amber-800">Tuesday</div>
              <div className="text-gray-700">First practice session - all words are new (10-15 minutes)</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
              <div className="w-20 text-center font-bold text-emerald-800">Wednesday</div>
              <div className="text-gray-700">Focus on learning words, some become mastered (10-15 minutes)</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
              <div className="w-20 text-center font-bold text-orange-800">Thursday</div>
              <div className="text-gray-700">Final practice - review trouble words (10-15 minutes)</div>
            </div>
            <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
              <div className="w-20 text-center font-bold text-red-800">Friday</div>
              <div className="text-gray-700">Take the treasure test when ready (10-20 minutes)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Back Button */}
      <div className="text-center">
        <Button 
          onClick={onBack}
          className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold px-8 py-3 text-lg"
          data-testid="button-back-to-dashboard-bottom"
        >
          <ArrowLeft className="w-5 h-5 mr-3" />
          Return to Captain's Dashboard
        </Button>
      </div>
    </div>
  );
}