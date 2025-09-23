// localStorage service for Red Boot's Spelling Adventure
// Based on proven memory research with spaced repetition

export interface WordPracticeData {
  word: string;
  correctCount: number;
  totalAttempts: number;
  lastPracticed: Date | null;
  consecutiveCorrect: number;
  status: 'new' | 'learning' | 'mastered' | 'trouble';
}

export interface WeekData {
  words: string[];
  practiceData: { [word: string]: WordPracticeData };
  weekStart: Date;
  practiceHistory: { date: Date; wordsCompleted: number; accuracy: number }[];
  treasureCount: number;
}

export class SpellingStorage {
  private readonly STORAGE_KEY = 'redboot-spelling-data';

  // Get current week data or initialize new week
  getCurrentWeek(): WeekData {
    const data = this.getRawData();
    
    // Check if it's a new week (Monday reset)
    if (this.shouldResetWeek(data?.weekStart)) {
      return this.initializeNewWeek();
    }
    
    return data || this.initializeNewWeek();
  }

  // Save word list (usually from photo OCR)
  saveWordList(words: string[]): void {
    const weekData = this.getCurrentWeek();
    
    // Initialize practice data for new words
    const practiceData: { [word: string]: WordPracticeData } = {};
    words.forEach(word => {
      practiceData[word.toLowerCase()] = {
        word: word.toLowerCase(),
        correctCount: 0,
        totalAttempts: 0,
        lastPracticed: null,
        consecutiveCorrect: 0,
        status: 'new'
      };
    });

    const updatedData: WeekData = {
      ...weekData,
      words,
      practiceData
    };

    this.saveData(updatedData);
  }

  // Get words for today's practice using spaced repetition algorithm
  getTodaysPracticeWords(): string[] {
    const weekData = this.getCurrentWeek();
    const today = new Date();
    const practiceWords: string[] = [];

    Object.values(weekData.practiceData).forEach(wordData => {
      if (this.shouldPracticeToday(wordData, today)) {
        practiceWords.push(wordData.word);
      }
    });

    // Limit to 10 words maximum for focused practice
    return practiceWords.slice(0, 10);
  }

  // Update word practice results
  updateWordPractice(word: string, wasCorrect: boolean): void {
    const weekData = this.getCurrentWeek();
    const wordKey = word.toLowerCase();
    
    if (!weekData.practiceData[wordKey]) {
      // Initialize if word doesn't exist
      weekData.practiceData[wordKey] = {
        word: wordKey,
        correctCount: 0,
        totalAttempts: 0,
        lastPracticed: null,
        consecutiveCorrect: 0,
        status: 'new'
      };
    }

    const wordData = weekData.practiceData[wordKey];
    wordData.totalAttempts++;
    wordData.lastPracticed = new Date();

    if (wasCorrect) {
      wordData.correctCount++;
      wordData.consecutiveCorrect++;
      
      // Update treasure count
      weekData.treasureCount = (weekData.treasureCount || 0) + 1;
    } else {
      wordData.consecutiveCorrect = 0;
    }

    // Update status based on performance
    wordData.status = this.calculateWordStatus(wordData);

    this.saveData(weekData);
  }

  // Record daily practice session
  recordPracticeSession(wordsCompleted: number, correctCount: number): void {
    const weekData = this.getCurrentWeek();
    const accuracy = wordsCompleted > 0 ? (correctCount / wordsCompleted) * 100 : 0;
    
    weekData.practiceHistory.push({
      date: new Date(),
      wordsCompleted,
      accuracy
    });

    this.saveData(weekData);
  }

  // Get Friday test words (all words for the week)
  getFridayTestWords(): string[] {
    const weekData = this.getCurrentWeek();
    return weekData.words;
  }

  // Get treasure road progress for celebrations
  getTreasureProgress(): {
    totalWords: number;
    masteredWords: number;
    newlyMastered: number;
  } {
    const weekData = this.getCurrentWeek();
    const masteredWords = Object.values(weekData.practiceData).filter(
      word => word.status === 'mastered'
    ).length;
    
    // For simplicity, we'll calculate newly mastered based on recent progress
    // In a more sophisticated version, we could track this per session
    const newlyMastered = Math.max(0, masteredWords - (this.getLastSessionMasteredCount() || 0));
    
    return {
      totalWords: weekData.words.length,
      masteredWords,
      newlyMastered
    };
  }

  // Track mastered words from last session (simplified for now)
  private getLastSessionMasteredCount(): number {
    // This is a simplified version - in practice you'd want more sophisticated tracking
    const weekData = this.getCurrentWeek();
    return Object.values(weekData.practiceData).filter(
      word => word.status === 'mastered' && word.correctCount >= 3
    ).length - 1; // Assume 1 less than current for demo purposes
  }

  // Get practice statistics for parent dashboard
  getPracticeStats(): {
    totalWords: number;
    newWords: number;
    learningWords: number;
    masteredWords: number;
    troubleWords: number;
    daysThisWeek: boolean[];
    readyForTest: boolean;
    treasureCount: number;
  } {
    const weekData = this.getCurrentWeek();
    const stats = {
      totalWords: weekData.words.length,
      newWords: 0,
      learningWords: 0,
      masteredWords: 0,
      troubleWords: 0,
      daysThisWeek: this.getDaysPracticedThisWeek(weekData),
      readyForTest: false,
      treasureCount: weekData.treasureCount || 0
    };

    Object.values(weekData.practiceData).forEach(wordData => {
      switch (wordData.status) {
        case 'new': stats.newWords++; break;
        case 'learning': stats.learningWords++; break;
        case 'mastered': stats.masteredWords++; break;
        case 'trouble': stats.troubleWords++; break;
      }
    });

    // Ready for test if at least 80% of words are learned or mastered
    const learnedWords = stats.learningWords + stats.masteredWords;
    stats.readyForTest = (learnedWords / stats.totalWords) >= 0.8;

    return stats;
  }

  // Private helper methods
  private getRawData(): WeekData | null {
    try {
      const data = localStorage.getItem(this.STORAGE_KEY);
      if (!data) return null;
      
      const parsed = JSON.parse(data);
      // Convert date strings back to Date objects
      if (parsed.weekStart) parsed.weekStart = new Date(parsed.weekStart);
      if (parsed.practiceHistory) {
        parsed.practiceHistory = parsed.practiceHistory.map((session: any) => ({
          ...session,
          date: new Date(session.date)
        }));
      }
      
      // Convert lastPracticed dates
      Object.values(parsed.practiceData || {}).forEach((wordData: any) => {
        if (wordData.lastPracticed) {
          wordData.lastPracticed = new Date(wordData.lastPracticed);
        }
      });
      
      return parsed;
    } catch (error) {
      console.error('Error reading spelling data:', error);
      return null;
    }
  }

  private saveData(data: WeekData): void {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving spelling data:', error);
    }
  }

  private shouldResetWeek(weekStart?: Date): boolean {
    if (!weekStart) return true;
    
    const today = new Date();
    const lastMonday = this.getLastMonday();
    const dataMonday = new Date(weekStart);
    
    // Reset if current Monday is after the data's Monday
    return lastMonday.getTime() > dataMonday.getTime();
  }

  private getLastMonday(): Date {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Monday
    const monday = new Date(today.setDate(diff));
    monday.setHours(0, 0, 0, 0);
    return monday;
  }

  private initializeNewWeek(): WeekData {
    return {
      words: [],
      practiceData: {},
      weekStart: this.getLastMonday(),
      practiceHistory: [],
      treasureCount: 0
    };
  }

  // Spaced repetition algorithm - research-proven method
  private shouldPracticeToday(wordData: WordPracticeData, today: Date): boolean {
    const lastPracticed = wordData.lastPracticed;
    
    // New words: practice daily
    if (wordData.status === 'new') return true;
    
    // Trouble words (wrong yesterday): practice today
    if (wordData.status === 'trouble') return true;
    
    if (!lastPracticed) return true;
    
    const daysSinceLastPractice = Math.floor(
      (today.getTime() - lastPracticed.getTime()) / (1000 * 60 * 60 * 24)
    );
    
    switch (wordData.status) {
      case 'learning': // Correct 1-2 times: every 2 days
        return daysSinceLastPractice >= 2;
      case 'mastered': // Correct 3+ times: once before Friday
        const friday = this.getFridayOfWeek(today);
        return today.getDay() >= 4 && daysSinceLastPractice >= 3; // Thursday or Friday
      default:
        return true;
    }
  }

  private calculateWordStatus(wordData: WordPracticeData): 'new' | 'learning' | 'mastered' | 'trouble' {
    // Trouble word: wrong in the last attempt or low success rate
    if (wordData.consecutiveCorrect === 0 && wordData.totalAttempts > 0) {
      return 'trouble';
    }
    
    // Success rate calculation
    const successRate = wordData.totalAttempts > 0 ? wordData.correctCount / wordData.totalAttempts : 0;
    
    if (wordData.correctCount >= 3 && successRate >= 0.8) {
      return 'mastered';
    } else if (wordData.correctCount >= 1 && wordData.correctCount <= 2) {
      return 'learning';
    } else {
      return 'new';
    }
  }

  private getFridayOfWeek(date: Date): Date {
    const friday = new Date(date);
    const day = friday.getDay();
    const diff = friday.getDate() - day + 5; // Friday is day 5
    friday.setDate(diff);
    return friday;
  }

  private getDaysPracticedThisWeek(weekData: WeekData): boolean[] {
    const days = [false, false, false, false, false]; // Mon-Fri
    const weekStart = new Date(weekData.weekStart);
    
    weekData.practiceHistory.forEach(session => {
      const sessionDate = new Date(session.date);
      const dayIndex = sessionDate.getDay() - 1; // Convert to 0-4 (Mon-Fri)
      if (dayIndex >= 0 && dayIndex <= 4) {
        days[dayIndex] = true;
      }
    });
    
    return days;
  }
}

// Singleton instance
export const spellingStorage = new SpellingStorage();