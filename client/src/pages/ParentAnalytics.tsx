import { useQuery } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { ArrowLeft, TrendingUp, Clock, Target, Trophy, Sparkles, AlertCircle } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, AreaChart, Area } from 'recharts';

interface AnalyticsData {
  childName: string;
  gradeLevel: string;
  stats: {
    totalWords: number;
    totalPracticeSessions: number;
    overallAccuracy: number;
    totalMinutes: number;
    totalTreasures: number;
    achievementsEarned: number;
    trickyWordsActive: number;
    trickyWordsMastered: number;
  };
  dailyProgress: { date: string; words: number; accuracy: number }[];
  wordMastery: { mastered: number; learning: number; total: number };
  recentActivity: { id: string; date: string; correct: number; incorrect: number; score: number; character: string }[];
  trickyWords: { word: string; mistakeCount: number; correctStreak: number }[];
  currentWeek: { words: string[]; practiceCount: number; bestScore: number };
}

export default function ParentAnalytics() {
  const [, setLocation] = useLocation();
  
  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ['/api/analytics'],
    refetchInterval: 30000,
  });

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

  const { stats, dailyProgress, wordMastery, recentActivity, trickyWords, currentWeek } = analytics;
  
  const accuracyColor = stats.overallAccuracy >= 80 ? '#22c55e' : stats.overallAccuracy >= 60 ? '#f59e0b' : '#ef4444';
  
  const masteryPercentage = wordMastery.total > 0 
    ? Math.round(((wordMastery.total - wordMastery.learning) / wordMastery.total) * 100) 
    : 0;

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

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mb-8">
          <StatCard 
            label="Accuracy" 
            value={`${stats.overallAccuracy}%`}
            icon={<Target className="w-4 h-4" />}
            color={accuracyColor}
          />
          <StatCard 
            label="Sessions" 
            value={stats.totalPracticeSessions.toString()}
            icon={<TrendingUp className="w-4 h-4" />}
            color="#3b82f6"
          />
          <StatCard 
            label="Time" 
            value={`${stats.totalMinutes}m`}
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
                  <span className="text-gray-500">Ready</span>
                  <span className="font-medium text-gray-900">{wordMastery.total - wordMastery.learning}</span>
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

        {recentActivity.length > 0 && (
          <section className="bg-white rounded-2xl p-5 sm:p-6 shadow-sm border border-gray-100">
            <h2 className="text-base font-semibold text-gray-900 mb-4">Recent Sessions</h2>
            
            <div className="space-y-3">
              {recentActivity.map((session) => (
                <div 
                  key={session.id}
                  className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-sm">
                      {session.character === 'diego' ? '🐕' : '🏴‍☠️'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {session.correct} correct, {session.incorrect} missed
                      </p>
                      <p className="text-xs text-gray-400">
                        {session.date ? new Date(session.date).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit'
                        }) : 'Recently'}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className={`text-sm font-semibold ${
                      session.score >= 80 ? 'text-green-600' : 
                      session.score >= 60 ? 'text-amber-600' : 'text-gray-600'
                    }`}>
                      {session.score}%
                    </span>
                  </div>
                </div>
              ))}
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
