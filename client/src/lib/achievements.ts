export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'spelling' | 'streak' | 'treasure' | 'special';
  threshold: number;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
}

export interface UserAchievement {
  id: string;
  achievementId: string;
  earnedAt: string;
  achievement: Achievement;
}

export const ALL_ACHIEVEMENTS: Achievement[] = [
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
  { id: 'comeback_kid', title: 'Comeback Kid', description: 'Improved from under 50% to over 80% across your practice sessions!', icon: '🦋', category: 'special', threshold: 80, rarity: 'rare' },
];

function buildSession(batch: any[]): { completedAt: string; correctWords: string[]; incorrectWords: string[]; correct: number; total: number } {
  const lastAttempt = new Map<string, boolean>();
  batch.forEach((a: any) => lastAttempt.set(String(a.word).toLowerCase().trim(), !!a.correct));
  const correctWords = [...lastAttempt.entries()].filter(([, c]) => c).map(([w]) => w);
  const incorrectWords = [...lastAttempt.entries()].filter(([, c]) => !c).map(([w]) => w);
  return { completedAt: batch[batch.length - 1].date, correctWords, incorrectWords, correct: correctWords.length, total: lastAttempt.size };
}

export function buildSessionsFromHistory(history: any[]): Array<{ completedAt: string; correctWords: string[]; incorrectWords: string[]; correct: number; total: number }> {
  const valid = history
    .filter((a: any) => a && typeof a.date === 'string' && !isNaN(new Date(a.date).getTime()))
    .sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());
  if (valid.length === 0) return [];
  const sessions = [];
  let batch = [valid[0]];
  for (let i = 1; i < valid.length; i++) {
    const gap = new Date(valid[i].date).getTime() - new Date(valid[i - 1].date).getTime();
    if (gap > 10 * 60 * 1000) { sessions.push(buildSession(batch)); batch = [valid[i]]; }
    else batch.push(valid[i]);
  }
  sessions.push(buildSession(batch));
  return sessions;
}

export function buildAchievementsFromLocal(): { earned: UserAchievement[]; all: Achievement[] } {
  try {
    let totalAttempts = 0; let masteredCount = 0; let treasureCount = 0; let currentStreak = 0;
    let history: any[] = [];

    try {
      const r = localStorage.getItem('practiceProgress');
      if (r) { const pp = JSON.parse(r); if (pp && typeof pp === 'object') { history = Array.isArray(pp._practiceHistory) ? pp._practiceHistory : []; totalAttempts = history.length; } }
    } catch { /* empty */ }

    try {
      const r = localStorage.getItem('redboot-spelling-data');
      if (r) {
        const wd = JSON.parse(r);
        if (wd && typeof wd === 'object') {
          treasureCount = wd.treasureCount || 0;
          if (Array.isArray(wd.words) && wd.practiceData) {
            wd.words.forEach((w: string) => {
              const d = wd.practiceData[w.toLowerCase()];
              if (d?.status === 'mastered' || (d?.correctCount >= 3 && d?.totalAttempts > 0 && (d.correctCount / d.totalAttempts) >= 0.8)) masteredCount++;
            });
          }
        }
      }
    } catch { /* empty */ }

    const practiceDates = new Set(
      history.filter((a: any) => a?.date).map((a: any) => {
        const d = new Date(a.date);
        return isNaN(d.getTime()) ? null : d.toLocaleDateString('en-CA');
      }).filter(Boolean)
    );
    const today = new Date();
    const todayStr = today.toLocaleDateString('en-CA');
    const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
    const yesterdayStr = yesterday.toLocaleDateString('en-CA');
    let check = practiceDates.has(todayStr) ? today : (practiceDates.has(yesterdayStr) ? yesterday : null);
    if (check) {
      while (true) {
        const s = check.toLocaleDateString('en-CA');
        if (!practiceDates.has(s)) break;
        currentStreak++;
        check = new Date(check); check.setDate(check.getDate() - 1);
      }
    }

    const sessions = buildSessionsFromHistory(history);
    const hasPerfect = sessions.some(s => s.total > 0 && s.correct === s.total);
    const todaySessions = sessions.filter(s => new Date(s.completedAt).toLocaleDateString('en-CA') === todayStr);

    const hasComeback = (() => {
      if (sessions.length < 3) return false;
      const mid = Math.floor(sessions.length / 2);
      const earlyAcc = sessions.slice(0, mid).reduce((sum, s) => sum + (s.total > 0 ? s.correct / s.total : 0), 0) / mid;
      const lateAcc = sessions.slice(mid).reduce((sum, s) => sum + (s.total > 0 ? s.correct / s.total : 0), 0) / (sessions.length - mid);
      return earlyAcc < 0.5 && lateAcc > 0.8;
    })();

    // Load stored earn timestamps; write new ones for first-time unlocks only
    let storedEarnedAt: Record<string, string> = {};
    try { const r = localStorage.getItem('redboot-earned-achievements'); if (r) storedEarnedAt = JSON.parse(r) || {}; } catch { /* empty */ }
    const now = new Date().toISOString();

    const earned: UserAchievement[] = ALL_ACHIEVEMENTS.filter(a => {
      if (a.category === 'spelling' && ['first_word', 'spelling_apprentice', 'word_warrior'].includes(a.id)) return totalAttempts >= a.threshold;
      if (a.category === 'spelling') return masteredCount >= a.threshold;
      if (a.category === 'streak') return currentStreak >= a.threshold;
      if (a.category === 'treasure') return treasureCount >= a.threshold;
      if (a.id === 'perfect_score') return hasPerfect;
      if (a.id === 'speed_demon') return todaySessions.length >= a.threshold;
      if (a.id === 'comeback_kid') return hasComeback;
      return false;
    }).map(a => {
      if (!storedEarnedAt[a.id]) storedEarnedAt[a.id] = now;
      return { id: a.id, achievementId: a.id, earnedAt: storedEarnedAt[a.id], achievement: a };
    });

    try { localStorage.setItem('redboot-earned-achievements', JSON.stringify(storedEarnedAt)); } catch { /* empty */ }
    return { earned, all: ALL_ACHIEVEMENTS };
  } catch { return { earned: [], all: ALL_ACHIEVEMENTS }; }
}
