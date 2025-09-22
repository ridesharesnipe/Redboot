import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import RedBootCharacter from "./RedBootCharacter";
import { Calendar, Trophy, Target, BookOpen, Play } from "lucide-react";
import type { WordProgress, WordStatus } from "./SpellingMemoryGame";

interface WeeklySpellingManagerProps {
  words: string[];
  onStartPractice: () => void;
  onStartTest: () => void;
  wordProgress?: WordProgress[];
}

export default function WeeklySpellingManager({
  words,
  onStartPractice,
  onStartTest,
  wordProgress = []
}: WeeklySpellingManagerProps) {
  const [currentProgress, setCurrentProgress] = useState<WordProgress[]>(() =>
    words.map(word => {
      const existing = wordProgress.find(wp => wp.word === word);
      return existing || {
        word,
        status: "new" as WordStatus,
        correctCount: 0,
        incorrectCount: 0,
      };
    })
  );

  // Calculate progress statistics
  const totalWords = words.length;
  const newWords = currentProgress.filter(w => w.status === "new").length;
  const learningWords = currentProgress.filter(w => w.status === "learning").length;
  const masteredWords = currentProgress.filter(w => w.status === "mastered").length;
  const reviewWords = currentProgress.filter(w => w.status === "review").length;
  
  const overallProgress = totalWords > 0 ? (masteredWords / totalWords) * 100 : 0;
  const testReadiness = overallProgress;

  // Get words that need practice (learning + new)
  const wordsNeedingPractice = currentProgress
    .filter(w => w.status === "learning" || w.status === "new")
    .map(w => w.word);

  const getStatusColor = (status: WordStatus) => {
    switch (status) {
      case "new": return "bg-gray-500";
      case "learning": return "bg-amber-500";
      case "mastered": return "bg-green-500";
      case "review": return "bg-blue-500";
      default: return "bg-gray-500";
    }
  };

  const getStatusIcon = (status: WordStatus) => {
    switch (status) {
      case "new": return "📦";
      case "learning": return "🥉";
      case "mastered": return "🏆";
      case "review": return "🔄";
      default: return "📦";
    }
  };

  const getReadinessMessage = () => {
    if (testReadiness === 100) {
      return "🎉 Ready for Friday test! All words mastered!";
    } else if (testReadiness >= 80) {
      return "⚡ Almost ready! Just a few more words to practice.";
    } else if (testReadiness >= 60) {
      return "📚 Good progress! Keep practicing this week.";
    } else if (testReadiness >= 40) {
      return "🏴‍☠️ Getting there! More treasure hunting needed.";
    } else {
      return "🌊 Just starting the adventure! Lots of practice ahead.";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-400 to-red-400 text-white">
      {/* Header */}
      <div className="p-6 text-center">
        <h1 className="text-4xl font-pirate mb-2">This Week's Treasure Hunt</h1>
        <p className="text-purple-100 text-lg">Master your spelling words for Friday's test!</p>
      </div>

      <div className="px-4 pb-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Red Boot Character & Overall Progress */}
          <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-8 text-center border-4 border-white/20">
            <CardContent className="pt-0">
              <RedBootCharacter size="medium" animated expression="pointing" className="mb-6" />
              
              <h2 className="text-2xl font-pirate mb-4 text-white">
                Week Progress Report
              </h2>
              
              <div className="bg-white/20 rounded-2xl p-6 mb-6">
                <div className="text-4xl font-bold text-yellow-300 mb-2">
                  {Math.round(testReadiness)}%
                </div>
                <div className="text-lg text-white mb-4">Ready for Friday Test</div>
                <Progress 
                  value={testReadiness} 
                  className="h-4 bg-white/20 mb-4" 
                />
                <p className="text-blue-100">{getReadinessMessage()}</p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📦</div>
                  <div className="text-2xl font-bold">{newWords}</div>
                  <div className="text-sm text-blue-100">New Words</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">🥉</div>
                  <div className="text-2xl font-bold">{learningWords}</div>
                  <div className="text-sm text-blue-100">Learning</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">🏆</div>
                  <div className="text-2xl font-bold">{masteredWords}</div>
                  <div className="text-sm text-blue-100">Mastered</div>
                </div>
                <div className="bg-white/20 rounded-xl p-4">
                  <div className="text-2xl mb-2">📝</div>
                  <div className="text-2xl font-bold">{totalWords}</div>
                  <div className="text-sm text-blue-100">Total Words</div>
                </div>
              </div>

              <div className="flex gap-4 justify-center flex-wrap">
                <Button
                  onClick={onStartPractice}
                  className="bg-treasure-500 text-white hover:bg-treasure-600 px-8 py-3 text-lg"
                  disabled={wordsNeedingPractice.length === 0}
                >
                  <BookOpen className="w-5 h-5 mr-2" />
                  Practice Words ({wordsNeedingPractice.length})
                </Button>
                
                <Button
                  onClick={onStartTest}
                  variant="outline"
                  className="border-2 border-white text-white hover:bg-white hover:text-purple-600 px-8 py-3 text-lg"
                >
                  <Play className="w-5 h-5 mr-2" />
                  Friday Test Practice
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Individual Word Status */}
          <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-4 border-white/20">
            <CardHeader>
              <CardTitle className="text-2xl font-pirate text-white text-center">
                🗺️ Individual Word Progress
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                {currentProgress.map((wordProg, index) => (
                  <Card 
                    key={index} 
                    className="bg-white/20 border-2 border-white/30 hover:bg-white/30 transition-all"
                  >
                    <CardContent className="p-4 text-center">
                      <div className="text-3xl mb-2">
                        {getStatusIcon(wordProg.status)}
                      </div>
                      <div className="text-lg font-bold text-white mb-2">
                        {wordProg.word}
                      </div>
                      <Badge 
                        className={`${getStatusColor(wordProg.status)} text-white text-xs px-2 py-1`}
                      >
                        {wordProg.status.charAt(0).toUpperCase() + wordProg.status.slice(1)}
                      </Badge>
                      <div className="text-xs text-blue-100 mt-2">
                        ✓{wordProg.correctCount} ✗{wordProg.incorrectCount}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Words Needing Practice */}
          {wordsNeedingPractice.length > 0 && (
            <Card className="bg-white/10 backdrop-blur-sm rounded-3xl p-6 border-4 border-amber-400">
              <CardHeader>
                <CardTitle className="text-xl font-pirate text-amber-300 text-center">
                  ⚡ Words Needing Practice
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 justify-center mb-4">
                  {wordsNeedingPractice.map((word, index) => (
                    <Badge 
                      key={index}
                      className="bg-amber-500 text-white px-3 py-2 text-base"
                    >
                      {word}
                    </Badge>
                  ))}
                </div>
                <p className="text-center text-amber-100">
                  Focus your practice time on these {wordsNeedingPractice.length} words to improve your Friday test score!
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}