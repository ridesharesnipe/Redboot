import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { spellingStorage } from '@/lib/localStorage';
import { Camera, Calendar, TrendingUp, Award, Clock, BookOpen } from 'lucide-react';

interface ParentDashboardProps {
  onTakePhoto: () => void;
  onViewPractice: () => void;
  onStartTest: () => void;
}

export default function ParentDashboard({ onTakePhoto, onViewPractice, onStartTest }: ParentDashboardProps) {
  const [stats, setStats] = useState<{
    totalWords: number;
    newWords: number;
    learningWords: number;
    masteredWords: number;
    troubleWords: number;
    daysThisWeek: boolean[];
    readyForTest: boolean;
    treasureCount: number;
  } | null>(null);

  const [weekData, setWeekData] = useState<{
    words: string[];
    practiceData: { [word: string]: any };
    weekStart: Date;
    practiceHistory: any[];
  } | null>(null);

  // Load stats on component mount
  useEffect(() => {
    try {
      const currentStats = spellingStorage.getPracticeStats();
      const currentWeek = spellingStorage.getCurrentWeek();
      setStats(currentStats);
      setWeekData(currentWeek);
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  }, []);

  // Refresh stats (useful for parent to check progress)
  const refreshStats = () => {
    try {
      const currentStats = spellingStorage.getPracticeStats();
      const currentWeek = spellingStorage.getCurrentWeek();
      setStats(currentStats);
      setWeekData(currentWeek);
    } catch (error) {
      console.error('Error refreshing stats:', error);
    }
  };

  const getWordStatusColor = (status: string): string => {
    switch (status) {
      case 'new': return 'bg-gray-400';
      case 'learning': return 'bg-yellow-400';
      case 'mastered': return 'bg-green-400';
      case 'trouble': return 'bg-red-400';
      default: return 'bg-gray-400';
    }
  };

  const getWordStatusText = (status: string): string => {
    switch (status) {
      case 'new': return 'New';
      case 'learning': return 'Learning';
      case 'mastered': return 'Mastered';
      case 'trouble': return 'Needs Help';
      default: return 'Unknown';
    }
  };

  const getDayName = (index: number): string => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    return days[index] || '';
  };

  const getWeekProgress = (): number => {
    if (!stats) return 0;
    const completedWords = stats.learningWords + stats.masteredWords;
    return stats.totalWords > 0 ? (completedWords / stats.totalWords) * 100 : 0;
  };

  const getReadinessMessage = (): { message: string; color: string } => {
    if (!stats) return { message: 'Loading...', color: 'text-gray-500' };
    
    const weekProgress = getWeekProgress();
    const today = new Date().getDay(); // 0 = Sunday, 5 = Friday
    
    if (stats.totalWords === 0) {
      return { 
        message: 'Add spelling words to get started!', 
        color: 'text-blue-600' 
      };
    }
    
    if (today === 5) { // Friday
      return stats.readyForTest 
        ? { message: 'Ready for Friday test!', color: 'text-green-600' }
        : { message: 'More practice needed before test', color: 'text-yellow-600' };
    }
    
    if (weekProgress >= 80) {
      return { message: 'Excellent progress this week!', color: 'text-green-600' };
    } else if (weekProgress >= 60) {
      return { message: 'Good progress, keep practicing!', color: 'text-blue-600' };
    } else if (weekProgress >= 40) {
      return { message: 'Making progress, practice more!', color: 'text-yellow-600' };
    } else {
      return { message: 'Just getting started this week', color: 'text-orange-600' };
    }
  };

  if (!stats || !weekData) {
    return (
      <Card className="max-w-4xl mx-auto">
        <CardContent className="p-8 text-center">
          <p className="text-lg text-muted-foreground">Loading dashboard...</p>
        </CardContent>
      </Card>
    );
  }

  const readinessInfo = getReadinessMessage();
  const weekProgress = getWeekProgress();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-2xl" style={{ fontFamily: 'var(--font-pirate)' }}>
                Red Boot's Progress Dashboard
              </CardTitle>
              <p className="text-muted-foreground mt-1">
                Week of {weekData.weekStart.toLocaleDateString()}
              </p>
            </div>
            <Button onClick={refreshStats} variant="outline" data-testid="button-refresh-stats">
              🔄 Refresh
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Weekly Overview */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <BookOpen className="w-8 h-8 text-blue-600" />
              <div>
                <div className="text-2xl font-bold">{stats.totalWords}</div>
                <div className="text-sm text-muted-foreground">Total Words</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <TrendingUp className="w-8 h-8 text-green-600" />
              <div>
                <div className="text-2xl font-bold">{Math.round(weekProgress)}%</div>
                <div className="text-sm text-muted-foreground">Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Award className="w-8 h-8 text-yellow-600" />
              <div>
                <div className="text-2xl font-bold">{stats.treasureCount}</div>
                <div className="text-sm text-muted-foreground">Treasure Coins</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-purple-600" />
              <div>
                <div className="text-2xl font-bold">
                  {stats.daysThisWeek.filter(Boolean).length}/5
                </div>
                <div className="text-sm text-muted-foreground">Days Practiced</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Word Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Word Learning Status</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gray-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                {stats.newWords}
              </div>
              <div className="text-sm font-medium">New Words</div>
              <div className="text-xs text-muted-foreground">Not practiced yet</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-yellow-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                {stats.learningWords}
              </div>
              <div className="text-sm font-medium">Learning</div>
              <div className="text-xs text-muted-foreground">Getting better</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                {stats.masteredWords}
              </div>
              <div className="text-sm font-medium">Mastered</div>
              <div className="text-xs text-muted-foreground">Knows well</div>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-red-400 rounded-full mx-auto mb-2 flex items-center justify-center text-white font-bold">
                {stats.troubleWords}
              </div>
              <div className="text-sm font-medium">Needs Help</div>
              <div className="text-xs text-muted-foreground">Extra practice needed</div>
            </div>
          </div>

          <div className="mb-4">
            <div className="flex justify-between text-sm mb-2">
              <span>Overall Progress</span>
              <span>{Math.round(weekProgress)}%</span>
            </div>
            <Progress value={weekProgress} className="w-full" />
          </div>

          <div className={`text-center p-3 rounded-lg ${readinessInfo.color}`}>
            <p className="font-medium">{readinessInfo.message}</p>
          </div>
        </CardContent>
      </Card>

      {/* Daily Practice Tracker */}
      <Card>
        <CardHeader>
          <CardTitle>This Week's Practice</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center gap-4">
            {stats.daysThisWeek.map((practiced, index) => (
              <div key={index} className="text-center">
                <div className={`w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center ${
                  practiced ? 'bg-green-400 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                  {practiced ? '✓' : getDayName(index)}
                </div>
                <div className="text-xs text-muted-foreground">{getDayName(index)}</div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Word Progress */}
      {weekData.words.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Word Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {weekData.words.map((word, index) => {
                const wordData = weekData.practiceData[word.toLowerCase()];
                const status = wordData?.status || 'new';
                const accuracy = wordData?.totalAttempts > 0 
                  ? Math.round((wordData.correctCount / wordData.totalAttempts) * 100)
                  : 0;
                
                return (
                  <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${getWordStatusColor(status)}`} />
                      <span className="font-medium capitalize">{word}</span>
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{getWordStatusText(status)}</span>
                      {wordData?.totalAttempts > 0 && (
                        <span>{accuracy}% accurate</span>
                      )}
                      <span>{wordData?.correctCount || 0}/{wordData?.totalAttempts || 0}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <Card>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-3 gap-4">
            <Button 
              onClick={onTakePhoto}
              className="h-16 bg-blue-600 hover:bg-blue-700"
              data-testid="button-take-photo-dashboard"
            >
              <Camera className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Add New Words</div>
                <div className="text-xs opacity-90">Take photo of spelling list</div>
              </div>
            </Button>

            <Button 
              onClick={onViewPractice}
              variant="outline"
              className="h-16"
              disabled={stats.totalWords === 0}
              data-testid="button-start-practice-dashboard"
            >
              <BookOpen className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Daily Practice</div>
                <div className="text-xs opacity-70">
                  {spellingStorage.getTodaysPracticeWords().length} words today
                </div>
              </div>
            </Button>

            <Button 
              onClick={onStartTest}
              variant="outline"
              className="h-16"
              disabled={!stats.readyForTest || stats.totalWords === 0}
              data-testid="button-friday-test-dashboard"
            >
              <Clock className="w-6 h-6 mr-3" />
              <div className="text-left">
                <div className="font-medium">Friday Test</div>
                <div className="text-xs opacity-70">
                  {stats.readyForTest ? 'Ready to take test!' : 'Practice more first'}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}