import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft, Lock, X } from 'lucide-react';
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

const categoryLabels = {
  spelling: '📚 Spelling',
  streak: '🔥 Streak',
  treasure: '💎 Treasure',
  special: '⭐ Special',
};

const categoryGradients = {
  spelling: 'liquid-glass-gold',
  streak: 'liquid-glass-fire',
  treasure: 'liquid-glass-ocean',
  special: 'liquid-glass-pearl',
};

const rarityLabels = {
  common: 'Common',
  rare: 'Rare',
  epic: 'Epic',
  legendary: 'Legendary',
};

const pirateLore: Record<string, string> = {
  first_word: "Every great captain starts with a single step aboard the ship!",
  spelling_apprentice: "Ye be learnin' the ways of the seven syllables!",
  word_warrior: "Battle-tested and ready for any spelling storm!",
  spelling_master: "The seas bow before yer mighty vocabulary!",
  vocabulary_captain: "Ye command words like a true pirate lord!",
  word_wizard: "Magic flows through yer quill, matey!",
  spelling_legend: "Tales of yer spelling prowess echo across all oceans!",
  first_streak: "The winds of consistency fill yer sails!",
  week_warrior: "Seven suns have blessed yer journey!",
  fortnight_fighter: "Two weeks strong - the crew salutes ye!",
  monthly_master: "A whole moon cycle of dedication!",
  streak_legend: "Yer commitment rivals the eternal tides!",
  first_treasure: "The first of many riches to come!",
  treasure_hunter: "Ye have the nose for gold!",
  treasure_master: "The treasure maps reveal their secrets to ye!",
  treasure_legend: "All the gold in the Caribbean is yers!",
  perfect_score: "Not a single letter out of place - perfection!",
  speed_demon: "Quick as lightning, sharp as a cutlass!",
  comeback_kid: "Knocked down but never out, matey!",
  default: "A true pirate's treasure, hard-earned and well-deserved!",
};

export default function BadgeGallery() {
  const [, setLocation] = useLocation();
  const [selectedBadge, setSelectedBadge] = useState<{
    achievement: Achievement;
    isEarned: boolean;
    earnedAt?: string;
  } | null>(null);
  
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

  const handleBadgeClick = (achievement: Achievement) => {
    const isEarned = earnedIds.has(achievement.id);
    const earnedData = achievementData?.earned?.find(ua => ua.achievementId === achievement.id);
    setSelectedBadge({
      achievement,
      isEarned,
      earnedAt: earnedData?.earnedAt,
    });
  };

  const closeModal = () => setSelectedBadge(null);

  if (isLoading) {
    return (
      <div className="min-h-screen aurora-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl sm:text-5xl md:text-6xl animate-pulse mb-3 sm:mb-4">🏅</div>
          <p className="text-base sm:text-lg md:text-xl text-blue-800" style={{ fontFamily: 'var(--font-pirate)' }}>
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

          <div className="liquid-glass-panel p-4 sm:p-6 md:p-8 mb-6 sm:mb-8 text-center">
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-3 sm:mb-4 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
              🏅 Pirate Badge Collection 🏅
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-gray-600 mb-3 sm:mb-4">
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
                    const gradientClass = categoryGradients[category as keyof typeof categoryGradients];
                    
                    return (
                      <div 
                        key={achievement.id}
                        onClick={() => handleBadgeClick(achievement)}
                        className={`liquid-glass-badge cursor-pointer transition-all duration-300 hover:scale-105 ${
                          isEarned 
                            ? `${gradientClass} liquid-glass-badge-earned` 
                            : 'liquid-glass-badge-locked'
                        } ${achievement.rarity === 'legendary' && isEarned ? 'liquid-glass-legendary' : ''}`}
                        data-testid={`badge-card-${achievement.id}`}
                      >
                        <div className="p-4 text-center relative">
                          <div className="relative">
                            <div className={`text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 ${
                              isEarned ? 'badge-icon-glow' : 'opacity-40 grayscale'
                            }`}>
                              {achievement.icon}
                            </div>
                            {!isEarned && (
                              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                <Lock className="w-6 h-6 text-gray-400 opacity-60" />
                              </div>
                            )}
                          </div>
                          
                          <h3 className={`font-bold text-sm md:text-base mb-1 ${
                            isEarned ? 'text-white text-shadow-glow' : 'text-gray-500'
                          }`}>
                            {achievement.title}
                          </h3>
                          
                          <p className={`text-xs md:text-sm ${
                            isEarned ? 'text-white/80' : 'text-gray-400'
                          }`}>
                            {achievement.description}
                          </p>
                          
                          <div className={`mt-2 text-xs px-2 py-1 rounded-full inline-block ${
                            isEarned 
                              ? 'bg-white/20 text-white backdrop-blur-sm border border-white/30' 
                              : 'bg-gray-200/50 text-gray-500'
                          }`}>
                            {rarityLabels[achievement.rarity]}
                          </div>
                          
                          {isEarned && earnedData && (
                            <div className="mt-2 text-xs text-white/70">
                              ✨ Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}

          {achievements.length === 0 && (
            <div className="liquid-glass-panel p-4 sm:p-6 md:p-8 text-center">
              <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">🏴‍☠️</div>
              <h2 className="text-xl sm:text-2xl font-bold mb-2 text-blue-900" style={{ fontFamily: 'var(--font-pirate)' }}>
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

      {selectedBadge && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-modal-backdrop"
          onClick={closeModal}
        >
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
          
          <div 
            className="relative liquid-glass-modal animate-modal-enter max-w-md w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10 border border-white/30"
              data-testid="modal-close-button"
            >
              <X className="w-5 h-5" />
            </button>

            <div className={`p-6 sm:p-8 rounded-3xl ${
              selectedBadge.isEarned 
                ? categoryGradients[selectedBadge.achievement.category]
                : 'liquid-glass-badge-locked'
            }`}>
              <div className="text-center">
                <div className={`text-6xl sm:text-7xl md:text-8xl mb-4 ${
                  selectedBadge.isEarned ? 'badge-icon-glow animate-float' : 'opacity-40 grayscale'
                }`}>
                  {selectedBadge.achievement.icon}
                </div>
                
                <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${
                  selectedBadge.isEarned ? 'text-white text-shadow-glow' : 'text-gray-600'
                }`} style={{ fontFamily: 'var(--font-pirate)' }}>
                  {selectedBadge.achievement.title}
                </h2>
                
                <p className={`text-base sm:text-lg mb-4 ${
                  selectedBadge.isEarned ? 'text-white/90' : 'text-gray-500'
                }`}>
                  {selectedBadge.achievement.description}
                </p>
                
                <div className={`inline-block px-4 py-1.5 rounded-full text-sm font-medium mb-4 ${
                  selectedBadge.isEarned 
                    ? 'bg-white/20 text-white border border-white/30 backdrop-blur-sm'
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {rarityLabels[selectedBadge.achievement.rarity]}
                </div>
                
                {selectedBadge.isEarned ? (
                  <div className="space-y-3">
                    <div className="bg-white/20 backdrop-blur-md rounded-2xl p-4 border border-white/30">
                      <div className="text-xl text-white mb-1">✨ Ye earned this treasure! ✨</div>
                      <div className="text-white/80 text-sm">
                        {new Date(selectedBadge.earnedAt!).toLocaleDateString('en-US', {
                          weekday: 'long',
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </div>
                    </div>
                    
                    <div className="text-white/70 text-sm italic px-4">
                      "{pirateLore[selectedBadge.achievement.id] || pirateLore.default}"
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="bg-gray-100/80 backdrop-blur-md rounded-2xl p-4">
                      <div className="text-gray-600 mb-2">🔒 Badge Locked</div>
                      <div className="text-gray-500 text-sm">
                        Complete the requirement to unlock this treasure!
                      </div>
                    </div>
                    
                    <div className="text-gray-400 text-sm italic px-4">
                      "Keep sailin' forward, matey - this treasure awaits!"
                    </div>
                  </div>
                )}
              </div>
            </div>
            
            <div className="mt-4 text-center">
              <Button
                onClick={closeModal}
                className="liquid-glass-button px-6 py-3"
                data-testid="modal-back-button"
              >
                Back to Treasure Chest
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
