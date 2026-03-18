import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { useLocation } from 'wouter';
import '@/styles/liquidGlass.css';

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

const ALL_ACHIEVEMENTS: Achievement[] = [
  { id: 'first_word', title: 'First Word', description: 'Practiced your first spelling word!', icon: '📝', category: 'spelling', threshold: 1, rarity: 'common' },
  { id: 'spelling_apprentice', title: 'Spelling Apprentice', description: 'Practiced 25 words!', icon: '✏️', category: 'spelling', threshold: 25, rarity: 'common' },
  { id: 'word_warrior', title: 'Word Warrior', description: 'Practiced 50 words!', icon: '⚔️', category: 'spelling', threshold: 50, rarity: 'rare' },
  { id: 'spelling_master', title: 'Spelling Master', description: 'Mastered 10 words!', icon: '📚', category: 'spelling', threshold: 10, rarity: 'rare' },
  { id: 'vocabulary_captain', title: 'Vocabulary Captain', description: 'Mastered 25 words!', icon: '🎖️', category: 'spelling', threshold: 25, rarity: 'epic' },
  { id: 'word_wizard', title: 'Word Wizard', description: 'Mastered 50 words!', icon: '🧙', category: 'spelling', threshold: 50, rarity: 'epic' },
  { id: 'spelling_legend', title: 'Spelling Legend', description: 'Mastered 100 words!', icon: '👑', category: 'spelling', threshold: 100, rarity: 'legendary' },
  { id: 'first_streak', title: 'First Streak', description: 'Practiced 2 days in a row!', icon: '🔥', category: 'streak', threshold: 2, rarity: 'common' },
  { id: 'week_warrior', title: 'Week Warrior', description: 'Practiced 7 days in a row!', icon: '📅', category: 'streak', threshold: 7, rarity: 'rare' },
  { id: 'fortnight_fighter', title: 'Fortnight Fighter', description: 'Practiced 14 days in a row!', icon: '💪', category: 'streak', threshold: 14, rarity: 'epic' },
  { id: 'monthly_master', title: 'Monthly Master', description: 'Practiced 30 days in a row!', icon: '🏆', category: 'streak', threshold: 30, rarity: 'epic' },
  { id: 'streak_legend', title: 'Streak Legend', description: 'Practiced 50 days in a row!', icon: '⭐', category: 'streak', threshold: 50, rarity: 'legendary' },
  { id: 'first_treasure', title: 'First Treasure', description: 'Earned your first treasure!', icon: '💰', category: 'treasure', threshold: 1, rarity: 'common' },
  { id: 'treasure_hunter', title: 'Treasure Hunter', description: 'Collected 50 treasures!', icon: '🗺️', category: 'treasure', threshold: 50, rarity: 'rare' },
  { id: 'treasure_master', title: 'Treasure Master', description: 'Collected 200 treasures!', icon: '💎', category: 'treasure', threshold: 200, rarity: 'epic' },
  { id: 'treasure_legend', title: 'Treasure Legend', description: 'Collected 500 treasures!', icon: '🏴‍☠️', category: 'treasure', threshold: 500, rarity: 'legendary' },
  { id: 'perfect_score', title: 'Perfect Score', description: 'Got 100% in a practice session!', icon: '🌟', category: 'special', threshold: 100, rarity: 'rare' },
  { id: 'speed_demon', title: 'Speed Demon', description: 'Completed 5 sessions in one day!', icon: '⚡', category: 'special', threshold: 5, rarity: 'epic' },
  { id: 'comeback_kid', title: 'Comeback Kid', description: 'Improved accuracy to over 80%!', icon: '🦋', category: 'special', threshold: 80, rarity: 'rare' },
];

function buildAchievementsFromLocal(): { earned: UserAchievement[]; all: Achievement[] } {
  try {
    let totalAttempts = 0; let masteredCount = 0; let treasureCount = 0; let currentStreak = 0;
    let history: any[] = [];
    try {
      const r = localStorage.getItem('practiceProgress');
      if (r) { const pp = JSON.parse(r); if (pp && typeof pp === 'object') { history = Array.isArray(pp._practiceHistory) ? pp._practiceHistory : []; totalAttempts = history.length; } }
    } catch { /* empty */ }
    try {
      const r = localStorage.getItem('redboot-spelling-data');
      if (r) { const wd = JSON.parse(r); if (wd && typeof wd === 'object') { treasureCount = wd.treasureCount || 0; if (Array.isArray(wd.words) && wd.practiceData) { wd.words.forEach((w: string) => { const d = wd.practiceData[w.toLowerCase()]; if (d?.status === 'mastered' || (d?.correctCount >= 3 && d?.totalAttempts > 0 && (d.correctCount / d.totalAttempts) >= 0.8)) masteredCount++; }); } } }
    } catch { /* empty */ }
    const practiceDates = new Set(history.filter((a: any) => a?.date).map((a: any) => new Date(a.date).toISOString().split('T')[0]));
    const today = new Date(); today.setHours(0, 0, 0, 0);
    let check = new Date(today); if (!practiceDates.has(check.toISOString().split('T')[0])) check.setDate(check.getDate() - 1);
    while (practiceDates.has(check.toISOString().split('T')[0])) { currentStreak++; check.setDate(check.getDate() - 1); }

    const validDates = history.filter((a: any) => a?.date && !isNaN(new Date(a.date).getTime())).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
    const sessions: { completedAt: string; correct: number; total: number }[] = [];
    if (validDates.length > 0) {
      let batch = [validDates[0]];
      for (let i = 1; i < validDates.length; i++) {
        const gap = new Date(validDates[i].date).getTime() - new Date(validDates[i - 1].date).getTime();
        if (gap > 10 * 60 * 1000) { sessions.push({ completedAt: batch[batch.length - 1].date, correct: batch.filter((a: any) => a.correct).length, total: batch.length }); batch = [validDates[i]]; }
        else batch.push(validDates[i]);
      }
      sessions.push({ completedAt: batch[batch.length - 1].date, correct: batch.filter((a: any) => a.correct).length, total: batch.length });
    }
    const hasPerfect = sessions.some(s => s.total > 0 && s.correct === s.total);
    const todayStr = today.toISOString().split('T')[0];
    const todaySessions = sessions.filter(s => new Date(s.completedAt).toISOString().split('T')[0] === todayStr);

    const earned: UserAchievement[] = ALL_ACHIEVEMENTS.filter(a => {
      if (a.category === 'spelling' && ['first_word', 'spelling_apprentice', 'word_warrior'].includes(a.id)) return totalAttempts >= a.threshold;
      if (a.category === 'spelling') return masteredCount >= a.threshold;
      if (a.category === 'streak') return currentStreak >= a.threshold;
      if (a.category === 'treasure') return treasureCount >= a.threshold;
      if (a.id === 'perfect_score') return hasPerfect;
      if (a.id === 'speed_demon') return todaySessions.length >= a.threshold;
      return false;
    }).map(a => ({ id: a.id, achievementId: a.id, earnedAt: new Date().toISOString(), achievement: a }));

    return { earned, all: ALL_ACHIEVEMENTS };
  } catch { return { earned: [], all: ALL_ACHIEVEMENTS }; }
}

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
