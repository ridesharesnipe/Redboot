import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { spellingStorage } from '@/lib/localStorage';
import { Camera, Compass, Ship, Crown, Skull, Clock, Scroll, Anchor, MapPin, Star } from 'lucide-react';

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
      case 'new': return 'bg-slate-500 border-slate-600';
      case 'learning': return 'bg-amber-500 border-amber-600';
      case 'mastered': return 'bg-emerald-500 border-emerald-600';
      case 'trouble': return 'bg-red-500 border-red-600';
      default: return 'bg-slate-500 border-slate-600';
    }
  };

  const getWordStatusIcon = (status: string) => {
    switch (status) {
      case 'new': return <MapPin className="w-6 h-6 text-white" />;
      case 'learning': return <Compass className="w-6 h-6 text-white" />;
      case 'mastered': return <Crown className="w-6 h-6 text-white" />;
      case 'trouble': return <Skull className="w-6 h-6 text-white" />;
      default: return <MapPin className="w-6 h-6 text-white" />;
    }
  };

  const getWordStatusText = (status: string): string => {
    switch (status) {
      case 'new': return 'Uncharted Waters';
      case 'learning': return 'Setting Sail';
      case 'mastered': return 'Treasure Found';
      case 'trouble': return 'Stormy Seas';
      default: return 'Unknown';
    }
  };

  const getWordStatusDescription = (status: string): string => {
    switch (status) {
      case 'new': return 'Words awaiting first adventure';
      case 'learning': return 'On the learning voyage';
      case 'mastered': return 'Conquered like a true pirate';
      case 'trouble': return 'Needs more practice, matey';
      default: return 'Unknown waters';
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

  const getReadinessMessage = (): { message: string; color: string; icon: any } => {
    if (!stats) return { message: 'Loading the ship\'s log...', color: 'text-gray-500', icon: Ship };
    
    const weekProgress = getWeekProgress();
    const today = new Date().getDay(); // 0 = Sunday, 5 = Friday
    
    if (stats.totalWords === 0) {
      return { 
        message: 'Chart your course! Add spelling treasures to begin the adventure!', 
        color: 'text-blue-600',
        icon: MapPin
      };
    }
    
    if (today === 5) { // Friday
      return stats.readyForTest 
        ? { message: 'Ahoy! Ready to plunder the Friday treasure test!', color: 'text-green-600', icon: Crown }
        : { message: 'Batten down the hatches! More practice needed, sailor!', color: 'text-yellow-600', icon: Compass };
    }
    
    if (weekProgress >= 80) {
      return { message: 'Shiver me timbers! Ye be sailing like a true pirate captain!', color: 'text-green-600', icon: Crown };
    } else if (weekProgress >= 60) {
      return { message: 'Steady as she goes! Keep charting that course, matey!', color: 'text-blue-600', icon: Ship };
    } else if (weekProgress >= 40) {
      return { message: 'All hands on deck! More adventure awaits!', color: 'text-yellow-600', icon: Compass };
    } else {
      return { message: 'Welcome aboard, young sailor! The adventure begins!', color: 'text-orange-600', icon: Anchor };
    }
  };

  if (!stats || !weekData) {
    return (
      <Card className="max-w-4xl mx-auto bg-gradient-to-br from-blue-900 to-indigo-800 border-2 border-amber-400">
        <CardContent className="p-8 text-center">
          <Ship className="w-16 h-16 text-amber-400 mx-auto mb-4 animate-pulse" />
          <p className="text-lg text-amber-100" style={{ fontFamily: 'var(--font-pirate)' }}>Loading Red Boot's ship log...</p>
        </CardContent>
      </Card>
    );
  }

  const readinessInfo = getReadinessMessage();
  const weekProgress = getWeekProgress();

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Pirate Header */}
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
                <Ship className="w-8 h-8 text-amber-900" />
              </div>
              <div>
                <CardTitle className="text-3xl text-amber-100 font-bold tracking-wide" style={{ fontFamily: 'var(--font-pirate)' }}>
                  🏴‍☠️ Captain's Adventure Log 🏴‍☠️
                </CardTitle>
                <p className="text-amber-200 mt-1 text-lg">
                  ⚓ Week of {weekData.weekStart.toLocaleDateString()} ⚓
                </p>
              </div>
            </div>
            <Button 
              onClick={refreshStats} 
              variant="outline" 
              className="border-amber-400 text-amber-400 hover:bg-amber-400 hover:text-blue-900 font-bold"
              data-testid="button-refresh-stats"
            >
              <Compass className="w-4 h-4 mr-2" />
              Update Log
            </Button>
          </div>
        </CardHeader>
      </Card>

      {/* Treasure Stats */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-slate-700 to-slate-800 border-slate-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-slate-600 rounded-full flex items-center justify-center border-2 border-slate-400">
                <Scroll className="w-6 h-6 text-slate-200" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-100">{stats?.totalWords || 0}</div>
                <div className="text-sm text-slate-300">Treasure Words</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-700 to-blue-800 border-blue-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center border-2 border-blue-400">
                <Ship className="w-6 h-6 text-blue-200" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-100">{Math.round(weekProgress)}%</div>
                <div className="text-sm text-blue-200">Voyage Progress</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-amber-600 to-amber-700 border-amber-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-500 rounded-full flex items-center justify-center border-2 border-amber-300">
                <Star className="w-6 h-6 text-amber-100" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-100">{stats?.treasureCount || 0}</div>
                <div className="text-sm text-amber-200">Gold Doubloons</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-700 to-purple-800 border-purple-500 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center border-2 border-purple-400">
                <Anchor className="w-6 h-6 text-purple-200" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-100">
                  {stats?.daysThisWeek.filter(Boolean).length || 0}/5
                </div>
                <div className="text-sm text-purple-200">Days at Sea</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Treasure Map Status */}
      <Card className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-300 shadow-xl">
        <CardHeader className="bg-gradient-to-r from-amber-200 to-orange-200 border-b border-amber-300">
          <CardTitle className="text-amber-900 font-bold text-xl" style={{ fontFamily: 'var(--font-pirate)' }}>
            🗺️ Treasure Map & Word Status 🗺️
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-lg ${getWordStatusColor('new')} relative`}>
                {getWordStatusIcon('new')}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-slate-700 border">
                  {stats?.newWords || 0}
                </div>
              </div>
              <div className="text-sm font-bold text-slate-700">{getWordStatusText('new')}</div>
              <div className="text-xs text-slate-600 mt-1">{getWordStatusDescription('new')}</div>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-lg ${getWordStatusColor('learning')} relative`}>
                {getWordStatusIcon('learning')}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-amber-700 border">
                  {stats?.learningWords || 0}
                </div>
              </div>
              <div className="text-sm font-bold text-amber-700">{getWordStatusText('learning')}</div>
              <div className="text-xs text-amber-600 mt-1">{getWordStatusDescription('learning')}</div>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-lg ${getWordStatusColor('mastered')} relative`}>
                {getWordStatusIcon('mastered')}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-emerald-700 border">
                  {stats?.masteredWords || 0}
                </div>
              </div>
              <div className="text-sm font-bold text-emerald-700">{getWordStatusText('mastered')}</div>
              <div className="text-xs text-emerald-600 mt-1">{getWordStatusDescription('mastered')}</div>
            </div>
            
            <div className="text-center">
              <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-lg ${getWordStatusColor('trouble')} relative`}>
                {getWordStatusIcon('trouble')}
                <div className="absolute -bottom-1 -right-1 bg-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold text-red-700 border">
                  {stats?.troubleWords || 0}
                </div>
              </div>
              <div className="text-sm font-bold text-red-700">{getWordStatusText('trouble')}</div>
              <div className="text-xs text-red-600 mt-1">{getWordStatusDescription('trouble')}</div>
            </div>
          </div>

          <div className="mb-6">
            <div className="flex justify-between text-sm mb-2 font-semibold text-amber-800">
              <span>⚓ Voyage Progress ⚓</span>
              <span>{Math.round(weekProgress)}% Complete</span>
            </div>
            <Progress value={weekProgress} className="w-full h-3 bg-amber-200" />
          </div>

          <div className={`text-center p-4 rounded-lg border-2 border-amber-300 bg-gradient-to-r from-amber-100 to-orange-100 ${readinessInfo.color}`}>
            <div className="flex items-center justify-center gap-3 mb-2">
              <readinessInfo.icon className="w-6 h-6" />
              <p className="font-bold text-lg" style={{ fontFamily: 'var(--font-pirate)' }}>{readinessInfo.message}</p>
              <readinessInfo.icon className="w-6 h-6" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Daily Voyage Tracker */}
      <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-200 to-indigo-200 border-b border-blue-300">
          <CardTitle className="text-blue-900 font-bold text-xl" style={{ fontFamily: 'var(--font-pirate)' }}>
            ⛵ This Week's Voyages ⛵
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex justify-center gap-6">
            {(stats?.daysThisWeek || []).map((practiced, index) => (
              <div key={index} className="text-center">
                <div className={`w-16 h-16 rounded-full mx-auto mb-3 flex items-center justify-center border-2 shadow-lg transition-all ${
                  practiced 
                    ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400 text-white transform scale-110' 
                    : 'bg-gray-200 border-gray-300 text-gray-500'
                }`}>
                  {practiced ? <Ship className="w-6 h-6" /> : <Anchor className="w-5 h-5" />}
                </div>
                <div className={`text-sm font-bold ${practiced ? 'text-emerald-700' : 'text-gray-500'}`}>
                  {getDayName(index)}
                </div>
                <div className="text-xs text-gray-600 mt-1">
                  {practiced ? 'Sailed!' : 'Anchored'}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Individual Word Progress */}
      {(weekData?.words.length || 0) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Individual Word Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2 max-h-64 overflow-y-auto">
              {(weekData?.words || []).map((word, index) => {
                const wordData = weekData?.practiceData[word.toLowerCase()];
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

      {/* Pirate Action Buttons */}
      <Card className="bg-gradient-to-br from-gray-800 to-gray-900 border-2 border-amber-400 shadow-2xl">
        <CardContent className="p-8">
          <div className="grid md:grid-cols-3 gap-6">
            <Button 
              onClick={onTakePhoto}
              className="h-20 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 border-2 border-blue-400 shadow-xl text-white transform hover:scale-105 transition-all"
              data-testid="button-take-photo-dashboard"
            >
              <Camera className="w-8 h-8 mr-4" />
              <div className="text-left">
                <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-pirate)' }}>📸 Chart New Waters</div>
                <div className="text-sm opacity-90">Capture yer treasure map</div>
              </div>
            </Button>

            <Button 
              onClick={onViewPractice}
              variant="outline"
              className="h-20 border-2 border-amber-400 bg-gradient-to-br from-amber-50 to-amber-100 hover:from-amber-100 hover:to-amber-200 text-amber-900 font-bold shadow-xl transform hover:scale-105 transition-all"
              disabled={(stats?.totalWords || 0) === 0}
              data-testid="button-start-practice-dashboard"
            >
              <Compass className="w-8 h-8 mr-4 text-amber-600" />
              <div className="text-left">
                <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-pirate)' }}>⚓ Daily Adventure</div>
                <div className="text-sm opacity-80">
                  {spellingStorage.getTodaysPracticeWords().length} treasures await
                </div>
              </div>
            </Button>

            <Button 
              onClick={onStartTest}
              variant="outline"
              className="h-20 border-2 border-red-400 bg-gradient-to-br from-red-50 to-red-100 hover:from-red-100 hover:to-red-200 text-red-900 font-bold shadow-xl transform hover:scale-105 transition-all disabled:opacity-50 disabled:transform-none"
              disabled={!stats?.readyForTest || (stats?.totalWords || 0) === 0}
              data-testid="button-friday-test-dashboard"
            >
              <Crown className="w-8 h-8 mr-4 text-red-600" />
              <div className="text-left">
                <div className="font-bold text-lg" style={{ fontFamily: 'var(--font-pirate)' }}>👑 Final Treasure Hunt</div>
                <div className="text-sm opacity-80">
                  {stats?.readyForTest ? 'Ready for battle!' : 'Train more, matey!'}
                </div>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}