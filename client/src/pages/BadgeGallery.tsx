import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ArrowLeft, Star, Award, Zap, Lock } from 'lucide-react';
import { useLocation } from 'wouter';

interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'spelling' | 'streak' | 'treasure' | 'special';
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

interface UserAchievement {
  id: string;
  achievementId: string;
  earnedAt: string;
  achievement: Achievement;
}

const rarityColors = {
  common: 'from-gray-300 to-gray-400',
  rare: 'from-blue-400 to-blue-600',
  epic: 'from-purple-400 to-purple-600',
  legendary: 'from-yellow-400 to-amber-500',
};

const rarityBorders = {
  common: 'border-gray-400',
  rare: 'border-blue-500',
  epic: 'border-purple-500',
  legendary: 'border-yellow-500',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const categoryLabels = {
  spelling: '📚 Spelling',
  streak: '🔥 Streak',
  treasure: '💎 Treasure',
  special: '⭐ Special',
};

export default function BadgeGallery() {
  const [, setLocation] = useLocation();
  
  const { data: achievementData, isLoading } = useQuery<{ earned: UserAchievement[]; all: Achievement[] }>({
    queryKey: ['/api/achievements/user'],
  });

  const earnedIds = new Set(achievementData?.earned?.map(ua => ua.achievementId) || []);
  const achievements = achievementData?.all || [];
  
  const categorizedAchievements = {
    spelling: achievements.filter(a => a.category === 'spelling'),
    streak: achievements.filter(a => a.category === 'streak'),
    treasure: achievements.filter(a => a.category === 'treasure'),
    special: achievements.filter(a => a.category === 'special'),
  };

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl animate-pulse mb-4">🏅</div>
          <p className="text-xl text-blue-800" style={{ fontFamily: 'var(--font-pirate)' }}>
            Loading your badge collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen aurora-bg p-4 md:p-6">
      <div className="aurora-content">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-wrap gap-3 mb-6">
            <Button
              onClick={() => setLocation('/dashboard')}
              className="clay-button clay-button-primary px-5 py-3 flex items-center gap-2 micro-bounce"
              data-testid="button-back-to-dashboard"
            >
              <ArrowLeft className="w-5 h-5" />
              Back to Dashboard
            </Button>
          </div>

          <div className="clay-card p-6 md:p-8 mb-8 text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
              🏅 Pirate Badge Collection 🏅
            </h1>
            <p className="text-lg text-gray-600 mb-4">
              Earn badges by completing adventures and mastering spelling words!
            </p>
            
            <div className="flex flex-wrap justify-center gap-6 text-lg">
              <div className="text-center">
                <div className="text-3xl font-bold text-green-600">{achievementData?.earned?.length || 0}</div>
                <div className="text-sm text-gray-500">Earned</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-gray-400">{achievements.length - (achievementData?.earned?.length || 0)}</div>
                <div className="text-sm text-gray-500">Locked</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600">{achievements.length}</div>
                <div className="text-sm text-gray-500">Total</div>
              </div>
            </div>
          </div>

          {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => {
            if (categoryAchievements.length === 0) return null;
            
            return (
              <div key={category} className="mb-8">
                <h2 className="text-2xl md:text-3xl font-bold mb-4 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
                  {categoryLabels[category as keyof typeof categoryLabels]}
                </h2>
                
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {categoryAchievements.map((achievement) => {
                    const isEarned = earnedIds.has(achievement.id);
                    const earnedData = achievementData?.earned?.find(ua => ua.achievementId === achievement.id);
                    
                    return (
                      <Card 
                        key={achievement.id}
                        className={`clay-card transition-all duration-300 ${
                          isEarned 
                            ? `bg-gradient-to-br ${rarityColors[achievement.rarity]} border-2 ${rarityBorders[achievement.rarity]} hover:scale-105` 
                            : 'bg-gray-100 opacity-60 grayscale hover:opacity-80 hover:grayscale-0'
                        }`}
                        data-testid={`badge-card-${achievement.id}`}
                      >
                        <CardContent className="p-4 text-center">
                          <div className="relative">
                            <div className={`text-5xl md:text-6xl mb-2 ${isEarned ? 'animate-bounce' : ''}`} style={{ animationDuration: '2s' }}>
                              {achievement.icon}
                            </div>
                            {!isEarned && (
                              <div className="absolute top-0 right-0 text-gray-500">
                                <Lock className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`font-bold text-sm md:text-base mb-1 ${isEarned ? 'text-white' : 'text-gray-700'}`}>
                            {achievement.title}
                          </h3>
                          
                          <p className={`text-xs md:text-sm ${isEarned ? 'text-white/80' : 'text-gray-500'}`}>
                            {achievement.description}
                          </p>
                          
                          <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                            isEarned 
                              ? 'bg-white/30 text-white' 
                              : 'bg-gray-200 text-gray-600'
                          }`}>
                            {rarityLabels[achievement.rarity]}
                          </div>
                          
                          {isEarned && earnedData && (
                            <div className="mt-2 text-xs text-white/70">
                              ✨ Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                            </div>
                          )}
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {achievements.length === 0 && (
            <div className="clay-card p-8 text-center">
              <div className="text-6xl mb-4">🏴‍☠️</div>
              <h2 className="text-2xl font-bold mb-2 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
                No badges yet, matey!
              </h2>
              <p className="text-gray-600 mb-4">
                Start practicing spelling words to earn your first badge!
              </p>
              <Button
                onClick={() => setLocation('/practice')}
                className="clay-button px-6 py-3"
                data-testid="button-start-practice"
              >
                🚀 Start Practice
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
