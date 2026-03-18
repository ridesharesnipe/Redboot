import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import '@/styles/liquidGlass.css';
import { ALL_ACHIEVEMENTS, buildAchievementsFromLocal, type Achievement, type UserAchievement } from '@/lib/achievements';

const categoryLabels = {
  spelling: '📚 Spelling',
  streak: '🔥 Streak',
  treasure: '💎 Treasure',
  special: '⭐ Special',
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
    queryKey: ['local-achievements'],
    queryFn: () => Promise.resolve(buildAchievementsFromLocal()),
    refetchInterval: 30000,
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
      <div className="badge-page-bg flex items-center justify-center">
        <div className="text-center">
          <div className="text-5xl md:text-6xl animate-pulse mb-4">🏅</div>
          <p className="text-lg md:text-xl text-white/80">
            Loading your badge collection...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="badge-page-bg p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex flex-wrap gap-3 mb-6">
          <Button
            onClick={() => setLocation('/dashboard')}
            className="bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-white/20 px-5 py-3 flex items-center gap-2"
            data-testid="button-back-to-dashboard"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Dashboard
          </Button>
        </div>

        {/* Title Card */}
        <div className="badge-liquid-glass badge-glass-rare p-6 md:p-8 mb-8 text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 8px rgba(0,0,0,0.3)' }}>
            🏅 Pirate Badge Collection 🏅
          </h1>
          <p className="text-base md:text-lg text-white/80 mb-4">
            Earn badges by completing adventures and mastering spelling words!
          </p>
          
          <div className="flex flex-wrap justify-center gap-6 text-lg">
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{achievementData?.earned?.length || 0}</div>
              <div className="text-sm text-white/60">Earned</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-white/40">{achievements.length - (achievementData?.earned?.length || 0)}</div>
              <div className="text-sm text-white/60">Locked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-cyan-400">{achievements.length}</div>
              <div className="text-sm text-white/60">Total</div>
            </div>
          </div>
        </div>

        {/* Badge Categories */}
        {Object.entries(categorizedAchievements).map(([category, categoryAchievements]) => {
          if (categoryAchievements.length === 0) return null;
          
          return (
            <div key={category} className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold mb-4 text-white" style={{ textShadow: '0 2px 4px rgba(0,0,0,0.3)' }}>
                {categoryLabels[category as keyof typeof categoryLabels]}
              </h2>
              
              <div className="badge-grid">
                {categoryAchievements.map((achievement) => {
                  const isEarned = earnedIds.has(achievement.id);
                  const earnedData = achievementData?.earned?.find(ua => ua.achievementId === achievement.id);
                  
                  const cardClass = isEarned
                    ? `badge-liquid-glass badge-glass-${achievement.rarity}`
                    : 'badge-liquid-glass-locked';

                  return (
                    <div 
                      key={achievement.id}
                      onClick={() => handleBadgeClick(achievement)}
                      className={cardClass}
                      style={{
                        padding: '22px 16px 18px',
                        textAlign: 'center',
                        minHeight: '180px',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      data-testid={`badge-card-${achievement.id}`}
                    >
                      {/* Lock Icon - Locked Only */}
                      {!isEarned && (
                        <div className="badge-lock">🔒</div>
                      )}

                      {/* Icon */}
                      <div className="badge-icon-wrap">
                        <span className="text-4xl">{achievement.icon}</span>
                      </div>

                      {/* Name */}
                      <div className="badge-title">{achievement.title}</div>

                      {/* Description */}
                      <div className="badge-desc">{achievement.description}</div>

                      {/* Rarity */}
                      <span className={`badge-rarity ${achievement.rarity}`}>
                        {achievement.rarity}
                      </span>

                      {/* Earned Date - Unlocked Only */}
                      {isEarned && earnedData && (
                        <div className="badge-earned">
                          Earned {new Date(earnedData.earnedAt).toLocaleDateString()}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}

        {achievements.length === 0 && (
          <div className="badge-liquid-glass badge-glass-common p-6 md:p-8 text-center">
            <div className="text-5xl md:text-6xl mb-4">🏴‍☠️</div>
            <h2 className="text-2xl font-bold mb-2 text-white">
              No badges yet, matey!
            </h2>
            <p className="text-white/70 mb-4">
              Start practicing spelling words to earn your first badge!
            </p>
            <Button
              onClick={() => setLocation('/practice')}
              className="bg-white/20 backdrop-blur-md border border-white/30 text-white hover:bg-white/30 px-6 py-3"
              data-testid="button-start-practice"
            >
              🚀 Start Practice
            </Button>
          </div>
        )}
      </div>

      {/* Badge Detail Modal */}
      {selectedBadge && (
        <>
          {/* Backdrop */}
          <div className="badge-modal-backdrop" onClick={closeModal} />

          {/* Modal */}
          <div className="badge-modal-container">
            <div 
              className={`${
                selectedBadge.isEarned
                  ? `badge-liquid-glass badge-glass-${selectedBadge.achievement.rarity}`
                  : 'badge-liquid-glass-locked'
              } badge-modal-content`}
            >
              {/* Close Button */}
              <button className="badge-modal-close" onClick={closeModal}>
                ✕
              </button>

              {/* Large Icon */}
              <div className="badge-modal-icon">
                <span 
                  className="text-6xl"
                  style={{
                    filter: !selectedBadge.isEarned ? 'grayscale(100%) opacity(0.5)' : 'none',
                  }}
                >
                  {selectedBadge.achievement.icon}
                </span>
              </div>

              {/* Title */}
              <h2 className="badge-modal-title">{selectedBadge.achievement.title}</h2>

              {/* Rarity */}
              <span
                className={`badge-rarity ${selectedBadge.achievement.rarity}`}
                style={{ marginBottom: '18px', display: 'inline-block' }}
              >
                {selectedBadge.achievement.rarity}
              </span>

              {/* Description */}
              <p className="badge-modal-desc">{selectedBadge.achievement.description}</p>

              {/* Status */}
              {selectedBadge.isEarned ? (
                <div className="badge-status-unlocked">
                  <div className="badge-congrats">✨ Ye Earned This Treasure! ✨</div>
                  <div className="badge-date">
                    {new Date(selectedBadge.earnedAt!).toLocaleDateString('en-US', {
                      weekday: 'long',
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
              ) : (
                <div className="badge-status-locked">
                  <div className="badge-locked-text">🔒 Locked - Keep Sailing!</div>
                </div>
              )}

              {/* Flavor Text */}
              <p className="badge-flavor">
                "{pirateLore[selectedBadge.achievement.id] || pirateLore.default}"
              </p>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
