import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Clock, Target, Trophy, Sparkles, AlertCircle, Flame, Award, ChevronDown, ChevronUp, Check, X as XIcon } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

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

type SortKey = 'word' | 'attempts' | 'accuracy' | 'lastPracticed';
type SortOrder = 'asc' | 'desc';

export default function ParentAnalytics() {
  const [, setLocation] = useLocation();
  const [expandedSession, setExpandedSession] = useState<string | null>(null);
  const [wordSortKey, setWordSortKey] = useState<SortKey>('accuracy');
  const [wordSortOrder, setWordSortOrder] = useState<SortOrder>('asc');
  const [showAllWords, setShowAllWords] = useState(false);
  
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000,
  });

  const handleWordSort = (key: SortKey) => {
    if (wordSortKey === key) {
      setWordSortOrder(wordSortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setWordSortKey(key);
      setWordSortOrder(key === 'accuracy' ? 'asc' : 'desc');
    }
  };

  const sortedWords = analytics?.wordBreakdown?.slice().sort((a, b) => {
    const order = wordSortOrder === 'asc' ? 1 : -1;
    switch (wordSortKey) {
      case 'word':
        return a.word.localeCompare(b.word) * order;
      case 'attempts':
        return (a.attempts - b.attempts) * order;
      case 'accuracy':
        return (a.accuracy - b.accuracy) * order;
      case 'lastPracticed':
        return (new Date(a.lastPracticed).getTime() - new Date(b.lastPracticed).getTime()) * order;
      default:
        return 0;
    }
  }) || [];

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-500 text-sm">Loading insights...</p>
        </div>
      </div>
    );
  }

  if (error || !analytics) {
    return (
      <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-4">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Unable to load analytics</p>
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
  const strugglingWords = analytics.strugglingWords || [];
  const starWords = analytics.starWords || [];
  
  const accuracyColor = stats.overallAccuracy >= 80 ? '#22c55e' : stats.overallAccuracy >= 60 ? '#f59e0b' : '#ef4444';
  
  const masteryPercentage = wordMastery.total > 0 
    ? Math.round((wordMastery.mastered / wordMastery.total) * 100) 
    : 0;

  const formatTime = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`;
    const hrs = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hrs}h ${mins}m` : `${hrs}h`;
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        
        <button 
          onClick={() => setLocation('/dashboard')}
          className="flex items-center gap-2 text-gray-500 hover:text-gray-900 transition-colors mb-6 group"
          data-testid="button-back"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <header className="mb-8">
          <h1 className="text-2xl sm:text-3xl font-semibold text-gray-900 tracking-tight">
            {analytics.childName}'s Progress
          </h1>
          <p className="text-gray-500 mt-1 text-sm">
            {analytics.gradeLevel ? `Grade ${analytics.gradeLevel}` : 'Spelling Adventure'} · Updated just now
          </p>
        </header>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-4">
          <StatCard 
            label="Accuracy" 
            value={`${stats.overallAccuracy}%`}
            icon={<Target className="w-4 h-4" />}
            color={accuracyColor}
          />
          <StatCard 
            label="Words Practiced" 
            value={stats.totalWordsPracticed.toString()}
            icon={<TrendingUp className="w-4 h-4" />}
            color="#3b82f6"
          />
          <StatCard 
            label="Total Time" 
            value={formatTime(stats.totalMinutes)}
            icon={<Clock className="w-4 h-4" />}
            color="#8b5cf6"
          />
          <StatCard 
            label="Treasures" 
            value={stats.totalTreasures.toString()}
            icon={<Sparkles className="w-4 h-4" />}
            color="#f59e0b"
          />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard 
            label="Current Streak" 
            value={`${stats.currentStreak} day${stats.currentStreak !== 1 ? 's' : ''}`}
            icon={<Flame className="w-4 h-4" />}
            color="#ef4444"
          />
          <StatCard 
            label="Best Streak" 
            value={`${stats.longestStreak} day${stats.longestStreak !== 1 ? 's' : ''}`}
            icon={<Trophy className="w-4 h-4" />}
            color="#eab308"
          />
          <StatCard 
            label="Sessions" 
            value={stats.totalPracticeSessions.toString()}
            icon={<TrendingUp className="w-4 h-4" />}
            color="#06b6d4"
          />
          <StatCard 
            label="Badges" 
            value={`${stats.achievementsEarned}/${stats.totalAchievements}`}
            icon={<Award className="w-4 h-4" />}
            color="#a855f7"
          />
        </div>

        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-semibold text-gray-900">Weekly Activity</h2>
            <span className="text-xs text-gray-400">Last 7 days</span>
          </div>
          
          {dailyProgress.some(d => d.words > 0) ? (
            <div className="h-40 sm:h-48">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyProgress} margin={{ top: 5, right: 5, bottom: 5, left: -20 }}>
                  <defs>
                    <linearGradient id="colorWords" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <XAxis 
                    dataKey="date" 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false}
                    tick={{ fontSize: 11, fill: '#9ca3af' }}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      background: '#fff', 
                      border: 'none', 
                      borderRadius: '12px',
                      boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#374151', fontWeight: 600 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="words" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    fill="url(#colorWords)"
                    name="Words Practiced"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="h-40 flex items-center justify-center text-gray-400 text-sm">
              No activity this week yet
            </div>
          )}
        </section>

        <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Word Mastery</h2>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="relative w-20 h-20">
                <svg className="w-20 h-20 transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#f3f4f6"
                    strokeWidth="6"
                    fill="none"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="36"
                    stroke="#22c55e"
                    strokeWidth="6"
                    fill="none"
                    strokeDasharray={`${masteryPercentage * 2.26} 226`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-lg font-semibold text-gray-900">{masteryPercentage}%</span>
                </div>
              </div>
              
              <div className="flex-1 space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Mastered</span>
                  <span className="font-medium text-green-600">{wordMastery.mastered}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Learning</span>
                  <span className="font-medium text-amber-600">{wordMastery.learning}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Total</span>
                  <span className="font-medium text-gray-900">{wordMastery.total}</span>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Tricky Words</h2>
              <span className="text-xs px-2 py-1 bg-amber-50 text-amber-700 rounded-full font-medium">
                {stats.trickyWordsActive} active
              </span>
            </div>
            
            {trickyWords.length > 0 ? (
              <div className="space-y-2">
                {trickyWords.map((word, i) => (
                  <div 
                    key={i}
                    className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                  >
                    <span className="font-medium text-gray-900">{word.word}</span>
                    <div className="flex items-center gap-2">
                      {word.correctStreak > 0 && (
                        <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          {word.correctStreak} streak
                        </span>
                      )}
                      <span className="text-xs text-gray-400">
                        {word.mistakeCount} miss{word.mistakeCount !== 1 ? 'es' : ''}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-400 text-sm">
                <Trophy className="w-8 h-8 mx-auto mb-2 text-gray-200" />
                No tricky words yet!
              </div>
            )}
          </section>
        </div>

        {(strugglingWords.length > 0 || starWords.length > 0) && (
          <div className="grid sm:grid-cols-2 gap-4 sm:gap-6 mb-6">
            {strugglingWords.length > 0 && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Needs Practice</h2>
                <div className="space-y-2">
                  {strugglingWords.map((word, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-900">{word.word}</span>
                      <span className="text-sm text-red-500 font-medium">{word.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
            
            {starWords.length > 0 && (
              <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
                <h2 className="text-base font-semibold text-gray-900 mb-4">Star Performers ⭐</h2>
                <div className="space-y-2">
                  {starWords.map((word, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                      <span className="font-medium text-gray-900">{word.word}</span>
                      <span className="text-sm text-green-600 font-medium">{word.accuracy}%</span>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        )}

        {sortedWords.length > 0 && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base font-semibold text-gray-900">Word Breakdown</h2>
              <button 
                onClick={() => setShowAllWords(!showAllWords)}
                className="text-xs text-blue-600 hover:text-blue-700 font-medium"
              >
                {showAllWords ? 'Show Less' : `Show All (${sortedWords.length})`}
              </button>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-100">
                    <th 
                      className="text-left py-2 px-2 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                      onClick={() => handleWordSort('word')}
                    >
                      Word {wordSortKey === 'word' && (wordSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th 
                      className="text-center py-2 px-2 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                      onClick={() => handleWordSort('attempts')}
                    >
                      Tries {wordSortKey === 'attempts' && (wordSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">✓</th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">✗</th>
                    <th 
                      className="text-center py-2 px-2 text-gray-500 font-medium cursor-pointer hover:text-gray-900"
                      onClick={() => handleWordSort('accuracy')}
                    >
                      Accuracy {wordSortKey === 'accuracy' && (wordSortOrder === 'asc' ? '↑' : '↓')}
                    </th>
                    <th className="text-center py-2 px-2 text-gray-500 font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(showAllWords ? sortedWords : sortedWords.slice(0, 8)).map((word, i) => (
                    <tr key={i} className="border-b border-gray-50 last:border-0">
                      <td className="py-2 px-2 font-medium text-gray-900">{word.word}</td>
                      <td className="py-2 px-2 text-center text-gray-600">{word.attempts}</td>
                      <td className="py-2 px-2 text-center text-green-600">{word.correct}</td>
                      <td className="py-2 px-2 text-center text-red-500">{word.incorrect}</td>
                      <td className="py-2 px-2 text-center">
                        <span className={`font-medium ${
                          word.accuracy >= 80 ? 'text-green-600' : 
                          word.accuracy >= 50 ? 'text-amber-600' : 'text-red-500'
                        }`}>
                          {word.accuracy}%
                        </span>
                      </td>
                      <td className="py-2 px-2 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          word.status === 'mastered' ? 'bg-green-50 text-green-700' :
                          word.status === 'practicing' ? 'bg-amber-50 text-amber-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {word.status === 'mastered' ? 'Mastered' : word.status === 'practicing' ? 'Practicing' : 'Learning'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100 mb-6">
          <h2 className="text-base font-semibold text-gray-900 mb-4">This Week's Words</h2>
          
          {currentWeek.words.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {currentWeek.words.map((word, i) => (
                <span 
                  key={i}
                  className="px-3 py-1.5 bg-gray-50 text-gray-700 rounded-full text-sm font-medium border border-gray-100"
                >
                  {word}
                </span>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-gray-400 text-sm">
              No words added yet. Take a photo of the spelling list!
            </div>
          )}
          
          {currentWeek.words.length > 0 && (
            <div className="flex items-center gap-4 mt-4 pt-4 border-t border-gray-50 text-sm text-gray-500">
              <span>Practiced <strong className="text-gray-900">{currentWeek.practiceCount}x</strong></span>
              <span>Best Score <strong className="text-gray-900">{currentWeek.bestScore}%</strong></span>
            </div>
          )}
        </section>

        {sessionHistory.length > 0 && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Session History</h2>
            
            <div className="space-y-3">
              {sessionHistory.map((session) => {
                const isExpanded = expandedSession === session.id;
                const totalWords = session.correctWords.length + session.incorrectWords.length;
                
                return (
                  <div 
                    key={session.id}
                    className="border border-gray-100 rounded-xl overflow-hidden"
                  >
                    <button
                      onClick={() => setExpandedSession(isExpanded ? null : session.id)}
                      className="w-full flex items-center justify-between p-4 hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center text-lg">
                          {session.character === 'diego' ? '🐕' : '🏴‍☠️'}
                        </div>
                        <div className="text-left">
                          <p className="text-sm font-medium text-gray-900">
                            {session.correctWords.length} correct, {session.incorrectWords.length} missed
                          </p>
                          <p className="text-xs text-gray-400">
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
                        <span className={`text-sm font-semibold ${
                          session.score >= 80 ? 'text-green-600' : 
                          session.score >= 60 ? 'text-amber-600' : 'text-gray-600'
                        }`}>
                          {session.score}%
                        </span>
                        {isExpanded ? (
                          <ChevronUp className="w-4 h-4 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </button>
                    
                    {isExpanded && totalWords > 0 && (
                      <div className="px-4 pb-4 border-t border-gray-50">
                        <div className="pt-3 space-y-1">
                          {session.correctWords.map((word, i) => (
                            <div key={`correct-${i}`} className="flex items-center gap-2 text-sm">
                              <Check className="w-4 h-4 text-green-500" />
                              <span className="text-gray-700">{word}</span>
                            </div>
                          ))}
                          {session.incorrectWords.map((word, i) => (
                            <div key={`incorrect-${i}`} className="flex items-center gap-2 text-sm">
                              <XIcon className="w-4 h-4 text-red-400" />
                              <span className="text-gray-700">{word}</span>
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

        <footer className="mt-8 pb-8 text-center">
          <p className="text-xs text-gray-400">
            Data refreshes automatically every 30 seconds
          </p>
        </footer>
      </div>
    </div>
  );
}

function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: string; 
  icon: JSX.Element;
  color: string;
}) {
  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 transition-all hover:shadow-md">
      <div 
        className="w-8 h-8 rounded-lg flex items-center justify-center mb-3"
        style={{ backgroundColor: `${color}15`, color }}
      >
        {icon}
      </div>
      <p className="text-xl sm:text-2xl font-semibold text-gray-900 tracking-tight">{value}</p>
      <p className="text-xs text-gray-500 mt-0.5">{label}</p>
    </div>
  );
}
