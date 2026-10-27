import { APP_CONFIG, CityLocation } from '../config/appConfig';
import { BookmarkItem, LastReadItem, ReadingProgress, UserSettings } from '../types';

const STORAGE_KEYS = {
  VERSION: 'jayz_quran_version',
  SETTINGS: 'jayz_quran_settings',
  LOCATION: 'jayz_quran_location',
  BOOKMARKS: 'jayz_quran_bookmarks',
  LAST_READ: 'jayz_quran_last_read',
  PROGRESS: 'jayz_quran_progress',
  CACHE_PREFIX: 'jayz_quran_cache_',
};

const CURRENT_VERSION = '2.0.0';

export const DEFAULT_SETTINGS: UserSettings = {
  arabicFontSize: 28,
  translationFontSize: 15,
  arabicFontFamily: 'amiri',
  showTranslation: true,
  showLatin: true,
  selectedQari: APP_CONFIG.defaultQari,
  prayerMethod: 'kemenag',
  asrJuristic: 'standard',
  manualOffsets: {
    fajr: 0,
    dhuhr: 0,
    asr: 0,
    maghrib: 0,
    isha: 0,
  },
  notificationEnabled: false,
  adhanPerPrayer: {
    imsak: false,
    fajr: true,
    dhuhr: true,
    asr: true,
    maghrib: true,
    isha: true,
  },
  adhanSound: 'adhan',
  theme: 'light',
  autoScrollSpeed: 2,
};

export class StorageService {
  static getSettings(): UserSettings {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      if (!data) return DEFAULT_SETTINGS;
      const parsed = JSON.parse(data);
      return { ...DEFAULT_SETTINGS, ...parsed };
    } catch (e) {
      console.warn('Failed to load settings from storage, using defaults', e);
      return DEFAULT_SETTINGS;
    }
  }

  static saveSettings(settings: UserSettings): void {
    try {
      localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
    } catch (e) {
      console.error('Failed to save settings', e);
    }
  }

  static getLocation(): CityLocation {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LOCATION);
      if (!data) return APP_CONFIG.defaultLocation;
      return JSON.parse(data);
    } catch (e) {
      return APP_CONFIG.defaultLocation;
    }
  }

  static saveLocation(location: CityLocation): void {
    try {
      localStorage.setItem(STORAGE_KEYS.LOCATION, JSON.stringify(location));
    } catch (e) {
      console.error('Failed to save location', e);
    }
  }

  static getBookmarks(): BookmarkItem[] {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.BOOKMARKS);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  }

  static saveBookmarks(bookmarks: BookmarkItem[]): void {
    try {
      localStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(bookmarks));
    } catch (e) {
      console.error('Failed to save bookmarks', e);
    }
  }

  static toggleBookmark(
    surahNumber: number,
    surahName: string,
    ayatNumber: number,
    arabText: string,
    translationText: string,
    note?: string
  ): { isBookmarked: boolean; bookmarks: BookmarkItem[] } {
    const list = this.getBookmarks();
    const id = `${surahNumber}:${ayatNumber}`;
    const index = list.findIndex((b) => b.id === id);

    let updated: BookmarkItem[];
    let isBookmarked: boolean;

    if (index >= 0) {
      updated = list.filter((b) => b.id !== id);
      isBookmarked = false;
    } else {
      const newItem: BookmarkItem = {
        id,
        surahNumber,
        surahName,
        ayatNumber,
        arabText,
        translationText,
        note,
        createdAt: Date.now(),
      };
      updated = [newItem, ...list];
      isBookmarked = true;
    }

    this.saveBookmarks(updated);
    return { isBookmarked, bookmarks: updated };
  }

  static updateBookmarkNote(id: string, note: string): BookmarkItem[] {
    const list = this.getBookmarks();
    const updated = list.map((b) => (b.id === id ? { ...b, note } : b));
    this.saveBookmarks(updated);
    return updated;
  }

  static getLastRead(): LastReadItem | null {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.LAST_READ);
      return data ? JSON.parse(data) : null;
    } catch (e) {
      return null;
    }
  }

  static saveLastRead(surahNumber: number, surahName: string, ayatNumber: number): void {
    const item: LastReadItem = {
      surahNumber,
      surahName,
      ayatNumber,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(item));
      this.recordAyatRead(surahNumber);
    } catch (e) {
      console.error('Failed to save last read', e);
    }
  }

  static getReadingProgress(): ReadingProgress {
    try {
      const data = localStorage.getItem(STORAGE_KEYS.PROGRESS);
      const todayStr = new Date().toISOString().split('T')[0];
      if (!data) {
        return {
          totalAyatRead: 0,
          completedSurahs: [],
          dailyGoal: 10,
          todayCount: 0,
          lastActiveDate: todayStr,
          streakDays: 1,
        };
      }
      const progress: ReadingProgress = JSON.parse(data);
      if (progress.lastActiveDate !== todayStr) {
        // New day: check streak
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yestStr = yesterday.toISOString().split('T')[0];

        const streak = progress.lastActiveDate === yestStr ? progress.streakDays : 1;
        progress.todayCount = 0;
        progress.lastActiveDate = todayStr;
        progress.streakDays = streak;
      }
      return progress;
    } catch (e) {
      return {
        totalAyatRead: 0,
        completedSurahs: [],
        dailyGoal: 10,
        todayCount: 0,
        lastActiveDate: new Date().toISOString().split('T')[0],
        streakDays: 1,
      };
    }
  }

  static recordAyatRead(surahNumber: number): void {
    const progress = this.getReadingProgress();
    progress.totalAyatRead += 1;
    progress.todayCount += 1;
    try {
      localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(progress));
    } catch (e) {
      console.error('Failed to record reading progress', e);
    }
  }

  // Backup & Restore
  static exportBackup(): string {
    const backup = {
      app: APP_CONFIG.name,
      version: CURRENT_VERSION,
      exportDate: new Date().toISOString(),
      settings: this.getSettings(),
      location: this.getLocation(),
      bookmarks: this.getBookmarks(),
      lastRead: this.getLastRead(),
      progress: this.getReadingProgress(),
    };
    return JSON.stringify(backup, null, 2);
  }

  static importBackup(jsonString: string): boolean {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) this.saveSettings(parsed.settings);
      if (parsed.location) this.saveLocation(parsed.location);
      if (parsed.bookmarks) this.saveBookmarks(parsed.bookmarks);
      if (parsed.lastRead) {
        localStorage.setItem(STORAGE_KEYS.LAST_READ, JSON.stringify(parsed.lastRead));
      }
      if (parsed.progress) {
        localStorage.setItem(STORAGE_KEYS.PROGRESS, JSON.stringify(parsed.progress));
      }
      return true;
    } catch (e) {
      console.error('Invalid backup format', e);
      return false;
    }
  }

  static clearAllData(): void {
    try {
      localStorage.removeItem(STORAGE_KEYS.SETTINGS);
      localStorage.removeItem(STORAGE_KEYS.LOCATION);
      localStorage.removeItem(STORAGE_KEYS.BOOKMARKS);
      localStorage.removeItem(STORAGE_KEYS.LAST_READ);
      localStorage.removeItem(STORAGE_KEYS.PROGRESS);
    } catch (e) {
      console.error('Failed to clear data', e);
    }
  }
}
