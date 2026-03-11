import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, Moon, Sun, TrendingUp, TrendingDown, Clock, Zap, Star, Rocket, AlertCircle, ChevronDown, ChevronUp, Check, X as XIcon, HelpCircle } from 'lucide-react';

interface WordDetail {
  word: string;
  attempts: number;
  correct: number;
  incorrect: number;
  accuracy: number;
  status: 'mastered' | 'practicing' | 'learning';
  lastPracticed: string;
}

interface SessionDetail {
  id: string;
  date: string;
  correctWords: string[];
  incorrectWords: string[];
  score: number;
  character: string;
  timeSpent: number;
}

interface AnalyticsData {
  childName: string;
  gradeLevel: string;
  stats: {
    totalWordsInList: number;
    totalWordsPracticed: number;
    totalPracticeSessions: number;
    overallAccuracy: number;
    totalMinutes: number;
    avgSessionMinutes: number;
    currentStreak: number;
    longestStreak: number;
    totalTreasures: number;
    achievementsEarned: number;
    totalAchievements: number;
    trickyWordsActive: number;
    trickyWordsMastered: number;
  };
  dailyProgress: { date: string; words: number; accuracy: number }[];
  wordMastery: { mastered: number; learning: number; total: number };
  wordBreakdown: WordDetail[];
  strugglingWords: WordDetail[];
  starWords: WordDetail[];
  sessionHistory: SessionDetail[];
  recentActivity: { id: string; date: string; correct: number; incorrect: number; score: number; character: string }[];
  trickyWords: { word: string; mistakeCount: number; correctStreak: number }[];
  currentWeek: { words: string[]; practiceCount: number; bestScore: number };
}

export default function ParentAnalytics() {
  const [, setLocation] = useLocation();
  const [isDark, setIsDark] = useState(false);
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [showHelpModal, setShowHelpModal] = useState(false);
  
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000,
  });

  const toggleDarkMode = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
  };

  if (isLoading) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center transition-colors duration-300`}>
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'} text-sm font-medium`}>Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className={`min-h-screen ${isDark ? 'bg-slate-900' : 'bg-slate-50'} flex items-center justify-center p-4 transition-colors duration-300`}>
        <div className="text-center">
          <AlertCircle className={`w-12 h-12 ${isDark ? 'text-slate-600' : 'text-slate-300'} mx-auto mb-4`} />
          <p className={`${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Unable to load analytics</p>
        </div>
      </div>
    );
  }

  // Defensive defaults for all analytics fields
  const stats = analytics.stats || {
    totalWordsInList: 0,
    totalWordsPracticed: 0,
    totalPracticeSessions: 0,
    overallAccuracy: 0,
    totalMinutes: 0,
    avgSessionMinutes: 0,
    currentStreak: 0,
    longestStreak: 0,
    totalTreasures: 0,
    achievementsEarned: 0,
    totalAchievements: 24,
    trickyWordsActive: 0,
    trickyWordsMastered: 0
  };
  const dailyProgress = analytics.dailyProgress || [];
  const wordMastery = analytics.wordMastery || { mastered: 0, learning: 0, total: 0 };
  const sessionHistory = analytics.sessionHistory || [];
  const trickyWords = analytics.trickyWords || [];
  const currentWeek = analytics.currentWeek || { words: [], practiceCount: 0, bestScore: 0 };
  
  const masteryPercentage = wordMastery.total > 0 
    ? Math.round((wordMastery.mastered / wordMastery.total) * 100) 
    : 0;

  // Calculate week-over-week comparison from real data
  const getWeekStats = (weeksAgo: number) => {
    const now = new Date();
    const weekStart = new Date(now);
    weekStart.setDate(now.getDate() - now.getDay() - (weeksAgo * 7));
    weekStart.setHours(0, 0, 0, 0);
    
    const weekEnd = new Date(weekStart);
    weekEnd.setDate(weekStart.getDate() + 7);

    // Filter daily progress for this week
    const weekProgress = dailyProgress.filter(day => {
      const dayDate = new Date(day.date);
      return dayDate >= weekStart && dayDate < weekEnd;
    });

    // Filter sessions for this week
    const weekSessions = sessionHistory.filter(session => {
      const sessionDate = new Date(session.date);
      return sessionDate >= weekStart && sessionDate < weekEnd;
    });

    const totalWords = weekProgress.reduce((sum, day) => sum + day.words, 0);
    
    // Calculate weighted accuracy: total correct / total attempted
    // Use session data for accurate calculation
    const totalCorrect = weekSessions.reduce((sum, s) => sum + s.correctWords.length, 0);
    const totalAttempted = weekSessions.reduce((sum, s) => sum + s.correctWords.length + s.incorrectWords.length, 0);
    const weightedAccuracy = totalAttempted > 0 ? Math.round((totalCorrect / totalAttempted) * 100) : 0;
    
    const totalMinutes = weekSessions.reduce((sum, s) => sum + Math.round((s.timeSpent || 0) / 60), 0);

    return {
      sessions: weekSessions.length,
      accuracy: weightedAccuracy,
      words: totalWords,
      minutes: totalMinutes
    };
  };

  const thisWeekStats = getWeekStats(0);
  const lastWeekStats = getWeekStats(1);
  const accuracyDiff = thisWeekStats.accuracy - lastWeekStats.accuracy;
  const sessionsDiff = thisWeekStats.sessions - lastWeekStats.sessions;

  // Get struggling words from API data (words with <50% accuracy)
  const strugglingWords = analytics.strugglingWords || [];
  const allNeedsHelpWords = strugglingWords.filter(word => word.accuracy < 50);
  const needsHelpWords = allNeedsHelpWords.slice(0, 3);

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  // Calculate max for bar chart scaling
  const maxWords = Math.max(...dailyProgress.map(d => d.words), 1);

  // Get day abbreviations
  const getDayAbbr = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);
  };

  const today = new Date().toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase().slice(0, 3);

  return (
    <div className={`min-h-screen ${isDark ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'} transition-colors duration-300`}>
      {/* Glass Header */}
      <header className={`sticky top-0 z-30 w-full px-4 sm:px-6 py-3 sm:py-4 border-b backdrop-blur-xl ${
        isDark 
          ? 'bg-slate-800/50 border-slate-700/50' 
          : 'bg-white/70 border-slate-200'
      }`}>
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <button 
            onClick={() => setLocation('/dashboard')}
            className={`flex items-center gap-2 ${isDark ? 'text-slate-400 hover:text-indigo-400' : 'text-slate-500 hover:text-indigo-600'} transition-colors group`}
            data-testid="button-back"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
            <span className="font-semibold text-sm">Back to Dashboard</span>
          </button>
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setShowHelpModal(true)}
              className="relative p-2.5 rounded-full bg-gradient-to-br from-cyan-400/20 to-blue-500/20 hover:from-cyan-400/30 hover:to-blue-500/30 border border-cyan-400/30 backdrop-blur-sm transition-all group"
              data-testid="help-button"
            >
              <HelpCircle className="w-5 h-5 text-cyan-400 group-hover:text-cyan-300 transition-colors" />
              <div className="absolute inset-0 rounded-full bg-cyan-400/10 blur-md opacity-0 group-hover:opacity-100 transition-opacity" />
            </button>
            
            <button 
              onClick={toggleDarkMode}
              className={`p-2 rounded-full ${isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'} transition-colors`}
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-yellow-400" />
              ) : (
                <Moon className="w-5 h-5 text-slate-600" />
              )}
            </button>
            
            <div className={`flex items-center gap-3 pl-4 border-l ${isDark ? 'border-slate-700' : 'border-slate-200'}`}>
              <div className="w-10 h-10 rounded-full bg-indigo-500 flex items-center justify-center text-white font-bold">
                {analytics.childName?.charAt(0) || 'A'}
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6 sm:space-y-8">
        {/* Title Section */}
        <section className="space-y-2">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            Parent Analytics
          </h1>
          <div className={`flex items-center gap-2 ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>
            <span className="text-sm">📊</span>
            <span className="text-sm font-medium">{analytics.childName}'s spelling progress · Updated just now</span>
          </div>
        </section>

        {/* Stat Cards */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            icon="🎯"
            iconBg={isDark ? 'bg-red-900/20' : 'bg-red-50'}
            iconColor="text-red-500"
            value={`${stats.overallAccuracy}%`}
            label="Accuracy"
            trend={accuracyDiff !== 0 && lastWeekStats.accuracy > 0 ? `${accuracyDiff >= 0 ? '+' : ''}${accuracyDiff}% vs last week` : undefined}
            trendUp={accuracyDiff > 0 ? true : accuracyDiff < 0 ? false : null}
            isDark={isDark}
          />
          <StatCard
            icon="⚡"
            iconBg={isDark ? 'bg-blue-900/20' : 'bg-blue-50'}
            iconColor="text-blue-500"
            value={stats.totalPracticeSessions.toString()}
            label="Sessions"
            trend={thisWeekStats.sessions >= 5 ? 'Weekly goal met' : undefined}
            trendUp={thisWeekStats.sessions >= 5 ? true : null}
            goalProgress={{ current: thisWeekStats.sessions, goal: 5 }}
            isDark={isDark}
          />
          <StatCard
            icon="⏱️"
            iconBg={isDark ? 'bg-indigo-900/20' : 'bg-indigo-50'}
            iconColor="text-indigo-500"
            value={formatTime(stats.totalMinutes)}
            label="Time Spent"
            trend={`${stats.avgSessionMinutes}m avg / session`}
            trendUp={null}
            isDark={isDark}
          />
          <StatCard
            icon="⭐"
            iconBg={isDark ? 'bg-yellow-900/20' : 'bg-yellow-50'}
            iconColor="text-yellow-500"
            value={stats.totalTreasures.toLocaleString()}
            label="Points Earned"
            subExplain="From spelling practice"
            trend={stats.achievementsEarned > 0 ? 'New badge unlocked' : null}
            trendUp={null}
            badge={true}
            isDark={isDark}
          />
        </section>

        {/* Needs Extra Help Callout - uses strugglingWords from API (words with <50% accuracy) */}
        {allNeedsHelpWords.length > 0 && (
          <section className={`p-5 rounded-2xl border ${
            isDark 
              ? 'bg-amber-900/20 border-amber-700/50' 
              : 'bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200'
          }`}>
            <div className="flex items-center gap-3 mb-4">
              <span className="text-xl">⚠️</span>
              <h3 className={`font-bold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                Needs Extra Help ({allNeedsHelpWords.length} word{allNeedsHelpWords.length !== 1 ? 's' : ''})
              </h3>
            </div>
            <ul className="space-y-2 mb-4">
              {needsHelpWords.map((word, i) => (
                <li key={i} className="flex items-center justify-between">
                  <span className={`font-semibold ${isDark ? 'text-amber-200' : 'text-amber-900'}`}>
                    "{word.word}"
                  </span>
                  <span className={`text-sm ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>
                    {word.accuracy}% accuracy ({word.correct}/{word.attempts} correct)
                  </span>
                </li>
              ))}
            </ul>
            <div className={`text-sm p-3 rounded-xl ${isDark ? 'bg-amber-900/30' : 'bg-white/60'}`}>
              <span className={isDark ? 'text-amber-300' : 'text-amber-700'}>
                💡 <strong>Tip:</strong> Practice these words together at home!
              </span>
            </div>
          </section>
        )}

        {/* Progress Comparison - This Week vs Last Week (calculated from real session data) */}
        <section className={`p-6 rounded-2xl border ${
          isDark 
            ? 'bg-slate-800/30 border-slate-700/50' 
            : 'bg-slate-50 border-slate-200'
        }`}>
          <h3 className={`font-bold mb-4 ${isDark ? 'text-slate-200' : 'text-slate-700'}`}>
            📈 This Week vs Last Week
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Accuracy</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {thisWeekStats.accuracy}%
                </span>
                {accuracyDiff !== 0 && lastWeekStats.accuracy > 0 && (
                  <span className={`text-xs font-semibold ${accuracyDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {accuracyDiff >= 0 ? '↑' : '↓'} {Math.abs(accuracyDiff)}%
                  </span>
                )}
              </div>
              {lastWeekStats.accuracy > 0 && (
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  vs {lastWeekStats.accuracy}% last week
                </p>
              )}
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Sessions</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {thisWeekStats.sessions}
                </span>
                {sessionsDiff !== 0 && lastWeekStats.sessions > 0 && (
                  <span className={`text-xs font-semibold ${sessionsDiff >= 0 ? 'text-emerald-500' : 'text-red-500'}`}>
                    {sessionsDiff >= 0 ? '↑' : '↓'} {Math.abs(sessionsDiff)}
                  </span>
                )}
              </div>
              {lastWeekStats.sessions > 0 && (
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  vs {lastWeekStats.sessions} last week
                </p>
              )}
            </div>
            <div>
              <p className={`text-xs font-medium mb-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Practice Time</p>
              <div className="flex items-baseline gap-2">
                <span className={`text-xl font-bold ${isDark ? 'text-slate-100' : 'text-slate-800'}`}>
                  {thisWeekStats.minutes}m
                </span>
              </div>
              {lastWeekStats.minutes > 0 && (
                <p className={`text-xs mt-1 ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
                  vs {lastWeekStats.minutes}m last week
                </p>
              )}
            </div>
          </div>
          {accuracyDiff > 0 && (
            <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-emerald-900/20' : 'bg-emerald-50'}`}>
              <span className="text-sm text-emerald-600 font-medium">
                🎉 Great improvement! Keep up the amazing work!
              </span>
            </div>
          )}
          {accuracyDiff < -10 && lastWeekStats.accuracy > 0 && (
            <div className={`mt-4 p-3 rounded-xl ${isDark ? 'bg-amber-900/20' : 'bg-amber-50'}`}>
              <span className="text-sm text-amber-600 font-medium">
                💪 Let's get back on track this week!
              </span>
            </div>
          )}
        </section>

        {/* Practice This Week Chart */}
        <section className={`p-8 rounded-3xl shadow-sm border ${
          isDark 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-100'
        }`}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Practice This Week</h2>
              <p className={`text-sm ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>Daily words practiced</p>
            </div>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                <span className={isDark ? 'text-slate-400' : 'text-slate-500'}>Practice</span>
              </div>
              <select className={`text-xs rounded-lg py-1 px-3 border-none ${
                isDark ? 'bg-slate-700 text-slate-300' : 'bg-slate-50 text-slate-600'
              } focus:ring-indigo-500`}>
                <option>Last 7 Days</option>
                <option>This Month</option>
              </select>
            </div>
          </div>
          
          <div className={`h-64 flex items-end justify-between gap-2 sm:gap-4 px-2 sm:px-4 border-b overflow-x-auto ${
            isDark ? 'border-slate-700' : 'border-slate-100'
          }`}>
            {dailyProgress.map((day, i) => {
              const height = maxWords > 0 ? (day.words / maxWords) * 100 : 0;
              const dayAbbr = getDayAbbr(day.date);
              const isToday = dayAbbr === today;
              
              return (
                <div key={i} className="flex-1 min-w-[2rem] flex flex-col items-center gap-2 group">
                  <div 
                    className={`w-full rounded-t-lg transition-all duration-300 cursor-pointer ${
                      isToday 
                        ? `${isDark ? 'bg-indigo-500/20 border-t-2 border-indigo-500' : 'bg-indigo-100 border-t-2 border-indigo-500'} group-hover:bg-indigo-500`
                        : `${isDark ? 'bg-slate-700' : 'bg-slate-100'} group-hover:bg-indigo-500`
                    }`}
                    style={{ height: `${Math.max(height, 5)}%` }}
                    title={`${day.words} words · ${day.accuracy}% accuracy`}
                  />
                  <span className={`text-xs font-medium uppercase ${
                    isToday 
                      ? 'text-indigo-500 font-bold' 
                      : isDark ? 'text-slate-500' : 'text-slate-400'
                  }`}>
                    {dayAbbr}
                  </span>
                </div>
              );
            })}
            {dailyProgress.length === 0 && (
              <div className={`w-full h-full flex items-center justify-center ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                No activity data yet
              </div>
            )}
          </div>
        </section>

        {/* Word Mastery & Tricky Words */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Word Mastery */}
          <section className={`p-8 rounded-3xl shadow-sm border ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700/50' 
              : 'bg-white border-slate-100'
          }`}>
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Word Mastery</h2>
            
            <div className="flex flex-col md:flex-row items-center gap-10">
              {/* Radial Progress */}
              <div className="relative w-40 h-40">
                <svg className="w-40 h-40 transform -rotate-90">
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke={isDark ? '#334155' : '#f1f5f9'}
                    strokeWidth="12"
                    fill="none"
                  />
                  <circle
                    cx="80"
                    cy="80"
                    r="68"
                    stroke="#10b981"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${masteryPercentage * 4.27} 427`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{masteryPercentage}%</span>
                  <p className={`text-[10px] font-bold tracking-widest uppercase ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Mastered</p>
                </div>
              </div>
              
              {/* Stats List */}
              <div className="flex-1 w-full space-y-4">
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    <span className="text-sm font-semibold">Mastered</span>
                  </div>
                  <span className="text-sm font-bold">{wordMastery.mastered}</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                  <div className="flex items-center gap-3">
                    <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                    <span className="text-sm font-semibold">Still Practicing</span>
                  </div>
                  <span className="text-sm font-bold">{wordMastery.learning}</span>
                </div>
                <div className={`flex items-center justify-between p-3 rounded-xl border ${isDark ? 'border-slate-700' : 'border-slate-100'}`}>
                  <div className="flex items-center gap-3">
                    <span className={`w-2 h-2 rounded-full ${isDark ? 'bg-slate-500' : 'bg-slate-300'}`}></span>
                    <span className="text-sm font-semibold">Total Words</span>
                  </div>
                  <span className="text-sm font-bold">{wordMastery.total}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Challenge Words */}
          <section className={`p-8 rounded-3xl shadow-sm border ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700/50' 
              : 'bg-white border-slate-100'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Challenge Words</h2>
              <span className={`text-[10px] font-bold px-2 py-1 rounded-md tracking-wider uppercase ${
                isDark ? 'bg-red-900/30 text-red-400' : 'bg-red-100 text-red-600'
              }`}>
                {stats.trickyWordsActive} to Practice
              </span>
            </div>
            
            <div className="space-y-3">
              {trickyWords.slice(0, 4).map((word, i) => (
                <div key={i}>
                  <div className="flex items-center justify-between group cursor-default">
                    <span className={`font-bold ${isDark ? 'text-slate-200 group-hover:text-indigo-400' : 'text-slate-700 group-hover:text-indigo-600'} transition-colors`}>
                      {word.word}
                    </span>
                    <div className="flex items-center gap-3">
                      {word.correctStreak >= 2 && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full border ${
                          isDark 
                            ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/50' 
                            : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                        }`}>
                          {word.correctStreak} in a row ✓
                        </span>
                      )}
                      {word.correctStreak === 1 && (
                        <span className={`text-[10px] font-bold px-2 py-1 rounded-full ${
                          isDark ? 'bg-slate-700 text-slate-400' : 'bg-slate-50 text-slate-500'
                        }`}>
                          1 in a row
                        </span>
                      )}
                      <span className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                        {word.mistakeCount} miss{word.mistakeCount !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                  {i < Math.min(trickyWords.length, 4) - 1 && (
                    <div className={`h-px w-full mt-3 ${isDark ? 'bg-slate-700' : 'bg-slate-50'}`}></div>
                  )}
                </div>
              ))}
              {trickyWords.length === 0 && (
                <div className={`text-center py-6 ${isDark ? 'text-slate-500' : 'text-slate-400'} text-sm`}>
                  No tricky words yet! Great job!
                </div>
              )}
            </div>
            
            {trickyWords.length > 4 && (
              <button className={`mt-6 w-full py-2 text-sm font-bold rounded-xl transition-all ${
                isDark ? 'text-indigo-400 hover:bg-indigo-500/10' : 'text-indigo-600 hover:bg-indigo-50'
              }`}>
                See All Challenge Words
              </button>
            )}
          </section>
        </div>

        {/* This Week's Words */}
        <section className={`p-8 rounded-3xl shadow-sm border ${
          isDark 
            ? 'bg-slate-800/50 border-slate-700/50' 
            : 'bg-white border-slate-100'
        }`}>
          <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>This Week's Words</h2>
          
          {currentWeek.words.length > 0 ? (
            <>
              <div className="flex flex-wrap gap-2">
                {currentWeek.words.map((word, i) => (
                  <span 
                    key={i}
                    className={`px-4 py-2 rounded-full text-sm font-semibold cursor-pointer transition-all ${
                      isDark 
                        ? 'bg-slate-700 text-slate-300 hover:bg-indigo-500 hover:text-white' 
                        : 'bg-slate-50 text-slate-600 hover:bg-indigo-500 hover:text-white'
                    }`}
                  >
                    {word}
                  </span>
                ))}
              </div>
              
              <div className={`mt-8 flex items-center gap-6 border-t pt-6 ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Practiced</span>
                  <p className="text-sm font-bold">{currentWeek.practiceCount}x this week</p>
                </div>
                <div className={`w-px h-8 ${isDark ? 'bg-slate-700' : 'bg-slate-100'}`}></div>
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wide ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>Best Score</span>
                  <p className="text-sm font-bold text-emerald-500">{currentWeek.bestScore}%</p>
                </div>
              </div>
            </>
          ) : (
            <div className={`text-center py-8 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
              No words added yet. Take a photo of the spelling list to get started!
            </div>
          )}
        </section>

        {/* Session History */}
        {sessionHistory.length > 0 && (
          <section className={`p-8 rounded-3xl shadow-sm border ${
            isDark 
              ? 'bg-slate-800/50 border-slate-700/50' 
              : 'bg-white border-slate-100'
          }`}>
            <h2 className="text-xl font-bold mb-6" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>Recent Sessions</h2>
            
            <div className="space-y-3">
              {sessionHistory.slice(0, 5).map((session) => {
                const isExpanded = expandedSession === session.id;
                
                return (
                  <div 
                    key={session.id}
                    className={`border rounded-xl overflow-hidden ${isDark ? 'border-slate-700' : 'border-slate-100'}`}
                  >
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className={`w-full flex items-center justify-between p-4 transition-colors ${
                        isDark ? 'hover:bg-slate-700/50' : 'hover:bg-slate-50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-lg ${
                          isDark ? 'bg-slate-700' : 'bg-indigo-50'
                        }`}>
                          {session.character === 'diego' ? '🐕' : '🏴‍☠️'}
                        </div>
                        <div className="text-left">
                          <p className={`text-sm font-medium ${isDark ? 'text-slate-200' : 'text-slate-900'}`}>
                            {session.correctWords.length} correct, {session.incorrectWords.length} missed
                          </p>
                          <p className={`text-xs ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
                            {session.date ? new Date(session.date).toLocaleDateString('en-US', {
                              weekday: 'short',
                              month: 'short',
                              day: 'numeric',
                              hour: 'numeric',
                              minute: '2-digit'
                            }) : 'Recently'}
                            {session.timeSpent > 0 && ` · ${Math.round(session.timeSpent / 60)}m`}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`font-bold ${session.score >= 80 ? 'text-emerald-500' : session.score >= 60 ? 'text-amber-500' : 'text-red-500'}`}>
                          {session.score}%
                        </span>
                        {isExpanded ? (
                          <ChevronUp className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        ) : (
                          <ChevronDown className={`w-4 h-4 ${isDark ? 'text-slate-500' : 'text-slate-400'}`} />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && (
                      <div className={`px-4 pb-4 border-t ${isDark ? 'border-slate-700' : 'border-slate-50'}`}>
                        <div className="pt-3 space-y-1">
                          {session.correctWords.map((word, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-emerald-500" />
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{word}</span>
                            </div>
                          ))}
                          {session.incorrectWords.map((word, i) => (
                            <div key={i} className="flex items-center gap-2 text-sm">
                              <XIcon className="w-4 h-4 text-red-500" />
                              <span className={isDark ? 'text-slate-300' : 'text-slate-700'}>{word}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="text-center py-10">
          <p className={`text-xs font-medium ${isDark ? 'text-slate-600' : 'text-slate-400'}`}>
            Data refreshes automatically every 30 seconds
          </p>
        </footer>
      </main>

      {/* Floating Action Button */}
      <button 
        onClick={() => setLocation('/practice')}
        className="fixed bottom-8 right-8 w-14 h-14 bg-indigo-500 text-white rounded-full shadow-lg shadow-indigo-500/40 flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-50"
        data-testid="fab-practice"
      >
        <Rocket className="w-6 h-6" />
      </button>

      {/* Help Modal */}
      {showHelpModal && (
        <div 
          className="fixed inset-0 z-[60] flex items-center justify-center p-4"
          onClick={() => setShowHelpModal(false)}
        >
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          
          <div 
            className={`relative w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl shadow-2xl ${
              isDark ? 'bg-slate-800 border border-slate-700' : 'bg-white'
            }`}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className={`sticky top-0 px-6 py-5 border-b backdrop-blur-xl ${
              isDark ? 'bg-slate-800/90 border-slate-700' : 'bg-white/90 border-slate-100'
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center">
                    <HelpCircle className="w-5 h-5 text-white" />
                  </div>
                  <h2 className="text-xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                    How Analytics Work
                  </h2>
                </div>
                <button 
                  onClick={() => setShowHelpModal(false)}
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isDark ? 'hover:bg-slate-700' : 'hover:bg-slate-100'
                  } transition-colors`}
                >
                  <XIcon className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Content */}
            <div className="px-6 py-6 space-y-6">
              {/* Accuracy */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-red-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🎯</span>
                  <h3 className="font-bold">Accuracy</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  The percentage of words spelled correctly across all practice sessions. Higher accuracy means your child is mastering their spelling words!
                </p>
              </div>

              {/* Sessions */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-blue-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⚡</span>
                  <h3 className="font-bold">Sessions</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Total number of practice sessions completed. Each time your child practices their spelling words counts as one session. Regular practice builds strong spelling habits!
                </p>
              </div>

              {/* Time Spent */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-indigo-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⏱️</span>
                  <h3 className="font-bold">Time Spent</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Total time spent practicing spelling. Research shows that consistent, short practice sessions (10-15 minutes) are more effective than long, infrequent ones.
                </p>
              </div>

              {/* Points Earned */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-yellow-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">⭐</span>
                  <h3 className="font-bold">Points Earned</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Points earned from spelling practice. The more words practiced correctly, the more points collected! These rewards motivate continued learning.
                </p>
              </div>

              {/* Practice This Week */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-slate-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📊</span>
                  <h3 className="font-bold">Practice This Week</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Shows daily practice over the past 7 days. Taller bars mean more words practiced that day. Today's bar is highlighted in purple. Hover over bars to see word count and accuracy.
                </p>
              </div>

              {/* Word Mastery */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-emerald-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">📚</span>
                  <h3 className="font-bold">Word Mastery</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  <strong>Mastered:</strong> Words spelled correctly 3+ times in a row — ready for the Friday test!<br/>
                  <strong>Still Practicing:</strong> Words still being practiced. These need more repetition to stick in memory.
                </p>
              </div>

              {/* Challenge Words */}
              <div className={`p-4 rounded-2xl ${isDark ? 'bg-slate-700/50' : 'bg-orange-50'}`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🔥</span>
                  <h3 className="font-bold">Challenge Words</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  Words that have been misspelled. The app automatically adds extra practice for these words. The "in a row" badge shows how many times in a row they've gotten it right since missing it.
                </p>
              </div>

              {/* Science Section */}
              <div className={`p-4 rounded-2xl border-2 border-dashed ${
                isDark ? 'border-cyan-800 bg-cyan-900/20' : 'border-cyan-200 bg-cyan-50'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <span className="text-2xl">🧠</span>
                  <h3 className="font-bold text-cyan-600">The Science</h3>
                </div>
                <p className={`text-sm ${isDark ? 'text-slate-300' : 'text-slate-600'}`}>
                  This app uses research-backed techniques including <strong>spaced repetition</strong> (Dr. Robert Bjork) and the <strong>testing effect</strong> (Roediger & Karpicke). Words are repeated at optimal intervals to move them from short-term to long-term memory.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  icon: string;
  iconBg: string;
  iconColor: string;
  value: string;
  label: string;
  trend?: string | null;
  trendUp?: boolean | null;
  badge?: boolean;
  isDark: boolean;
  subExplain?: string;
  goalProgress?: { current: number; goal: number };
}

function StatCard({ icon, iconBg, iconColor, value, label, trend, trendUp, badge, isDark, subExplain, goalProgress }: StatCardProps) {
  const goalMet = goalProgress ? goalProgress.current >= goalProgress.goal : false;
  
  return (
    <div className={`p-6 rounded-2xl shadow-sm border group transition-all duration-300 ${
      isDark 
        ? 'bg-slate-800/50 border-slate-700/50 hover:border-indigo-500/50' 
        : 'bg-white border-slate-100 hover:border-indigo-200'
    }`}>
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center ${iconColor} mb-4 text-xl`}>
        {icon}
      </div>
      <p className="text-3xl font-bold" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>{value}</p>
      <p className={`text-sm font-medium ${isDark ? 'text-slate-400' : 'text-slate-500'}`}>{label}</p>
      
      {subExplain && (
        <p className={`text-xs mt-1 ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>{subExplain}</p>
      )}
      
      {goalProgress && (
        <div className="mt-3 flex items-center gap-2">
          <span className={`text-xs font-medium ${isDark ? 'text-slate-500' : 'text-slate-400'}`}>
            {goalProgress.current} / {goalProgress.goal}
          </span>
          {goalMet && (
            <span className="text-xs font-semibold text-emerald-500">✓ Goal met!</span>
          )}
        </div>
      )}
      
      {trend && !goalProgress && (
        <div className={`mt-4 flex items-center gap-1 text-xs font-semibold ${
          trendUp === true 
            ? 'text-emerald-500' 
            : trendUp === false
              ? 'text-red-500'
              : badge 
                ? 'text-amber-500' 
                : isDark ? 'text-slate-500' : 'text-slate-400'
        }`}>
          {trendUp === true && <TrendingUp className="w-3 h-3" />}
          {trendUp === false && <TrendingDown className="w-3 h-3" />}
          {badge && <Star className="w-3 h-3" />}
          {trendUp === null && !badge && <Clock className="w-3 h-3" />}
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}
