import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { CityLocation } from './config/appConfig';
import { HijriInfo, PrayerItem, PrayerTimes, UserSettings, BookmarkItem, LastReadItem, ReadingProgress } from './types';
import { StorageService } from './storage/storageService';
import { PrayerTimesService } from './services/prayerTimesService';
import { NotificationService } from './services/notificationService';
import { AudioService } from './services/audioService';
import { useDigitalClock } from './hooks/useDigitalClock';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { LocationPickerModal } from './components/LocationPickerModal';
import { OfflineIndicator } from './components/OfflineIndicator';

import { HomeView } from './pages/HomeView';
import { QuranView } from './pages/QuranView';
import { PrayerTimesView } from './pages/PrayerTimesView';
import { BookmarksView } from './pages/BookmarksView';
import { SettingsView } from './pages/SettingsView';

export default function App() {
  // 1. Persistent State
  const [settings, setSettings] = useState<UserSettings>(() => StorageService.getSettings());
  const [location, setLocation] = useState<CityLocation>(() => StorageService.getLocation());
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>(() => StorageService.getBookmarks());
  const [lastRead, setLastRead] = useState<LastReadItem | null>(() => StorageService.getLastRead());
  const [readingProgress, setReadingProgress] = useState<ReadingProgress>(() =>
    StorageService.getReadingProgress()
  );

  // 2. Navigation State
  const [activeTab, setActiveTab] = useState<TabType>('home');
  const [locationModalOpen, setLocationModalOpen] = useState(false);
  const [targetSurahNumber, setTargetSurahNumber] = useState<number | undefined>(undefined);
  const [targetAyatNumber, setTargetAyatNumber] = useState<number | undefined>(undefined);

  // 3. Digital Clock hook
  const clock = useDigitalClock(location.timezone);

  // 4. Dark Mode syncing
  const isDark = settings.theme === 'dark';
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleToggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    const updated = { ...settings, theme: nextTheme as 'light' | 'dark' };
    setSettings(updated);
    StorageService.saveSettings(updated);
  };

  // 5. Prayer Times calculation & online sync
  const [prayerData, setPrayerData] = useState<{
    timings: PrayerTimes;
    hijri?: HijriInfo;
  }>(() => {
    const tzHours = PrayerTimesService.getTimezoneOffsetHours(location.timezone);
    const timings = PrayerTimesService.calculatePrayerTimes(
      new Date(),
      location.latitude,
      location.longitude,
      tzHours,
      settings
    );
    const hijri = PrayerTimesService.calculateOfflineHijri(new Date());
    return { timings, hijri };
  });

  // Fetch or calculate timings when location, settings, or day changes
  useEffect(() => {
    let isMounted = true;
    PrayerTimesService.getTimings(clock.rawDate, location, settings)
      .then((res) => {
        if (isMounted) {
          setPrayerData({
            timings: res.timings,
            hijri: res.hijri,
          });
        }
      })
      .catch(() => {
        // quiet fallback
      });

    return () => {
      isMounted = false;
    };
  }, [location, settings.prayerMethod, settings.asrJuristic, clock.dateNumber]);

  // Next prayer and countdown calculation
  const nextPrayerInfo = useMemo(() => {
    return PrayerTimesService.getNextPrayer(prayerData.timings, clock.rawDate, location);
  }, [prayerData.timings, clock.rawDate, location]);

  // Check prayer time hit for adhan notification
  useEffect(() => {
    if (!settings.notificationEnabled) return;

    const currentShort = clock.timeShort; // "HH:MM"
    const matchingPrayer = nextPrayerInfo.prayerList.find(
      (p) => p.time === currentShort && !p.isPast
    );

    if (matchingPrayer && matchingPrayer.id in settings.adhanPerPrayer) {
      const prayerKey = matchingPrayer.id as keyof typeof settings.adhanPerPrayer;
      const allowed = settings.adhanPerPrayer[prayerKey];
      if (allowed) {
        NotificationService.sendNotification(
          `Waktu Salat ${matchingPrayer.name} Tiba`,
          `Panggilan azan untuk kota ${location.name} (${location.tzLabel}). Mari tunaikan salat.`
        );
      }
    }
  }, [clock.timeShort]);

  // Handlers
  const handleSelectLocation = (newLoc: CityLocation) => {
    setLocation(newLoc);
    StorageService.saveLocation(newLoc);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setSettings(newSettings);
    StorageService.saveSettings(newSettings);
  };

  const handleOpenSurah = (surahNumber: number, ayatNumber?: number) => {
    setTargetSurahNumber(surahNumber);
    setTargetAyatNumber(ayatNumber);
    setActiveTab('quran');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleBookmarksChange = (newBookmarks: BookmarkItem[]) => {
    setBookmarks(newBookmarks);
    setLastRead(StorageService.getLastRead());
    setReadingProgress(StorageService.getReadingProgress());
  };

  const handleResetAllData = () => {
    StorageService.clearAllData();
    setSettings(StorageService.getSettings());
    setLocation(StorageService.getLocation());
    setBookmarks([]);
    setLastRead(null);
    setReadingProgress(StorageService.getReadingProgress());
  };

  const handleTestAdhan = useCallback(() => {
    NotificationService.sendTestNotification();
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFDF5] text-[#09251B] dark:bg-[#071912] dark:text-[#EDF7F2] transition-colors selection:bg-[#E9B949]/30">
      {/* Top Header */}
      <Header
        location={location}
        onOpenLocationPicker={() => setLocationModalOpen(true)}
        isDark={isDark}
        onToggleTheme={handleToggleTheme}
        onTestAdhan={handleTestAdhan}
      />

      {/* Main Container */}
      <main className="mx-auto max-w-5xl px-4 py-4 sm:px-6">
        {activeTab === 'home' && (
          <HomeView
            location={location}
            clock={clock}
            hijri={prayerData.hijri}
            nextPrayer={nextPrayerInfo.nextPrayer}
            countdownSeconds={nextPrayerInfo.countdownSeconds}
            prayerList={nextPrayerInfo.prayerList}
            lastRead={lastRead}
            readingProgress={readingProgress}
            onNavigateTab={setActiveTab}
            onOpenSurah={handleOpenSurah}
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />
        )}

        {activeTab === 'quran' && (
          <QuranView
            initialSurahNumber={targetSurahNumber}
            initialAyatNumber={targetAyatNumber}
            bookmarks={bookmarks}
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onBookmarksChange={handleBookmarksChange}
          />
        )}

        {activeTab === 'prayer' && (
          <PrayerTimesView
            location={location}
            clock={clock}
            hijri={prayerData.hijri}
            timings={prayerData.timings}
            nextPrayer={nextPrayerInfo.nextPrayer}
            countdownSeconds={nextPrayerInfo.countdownSeconds}
            prayerList={nextPrayerInfo.prayerList}
            settings={settings}
            onOpenLocationPicker={() => setLocationModalOpen(true)}
            onUpdateSettings={handleUpdateSettings}
          />
        )}

        {activeTab === 'bookmarks' && (
          <BookmarksView
            bookmarks={bookmarks}
            lastRead={lastRead}
            onBookmarksChange={handleBookmarksChange}
            onOpenSurah={handleOpenSurah}
          />
        )}

        {activeTab === 'settings' && (
          <SettingsView
            settings={settings}
            onUpdateSettings={handleUpdateSettings}
            onResetAllData={handleResetAllData}
          />
        )}
      </main>

      {/* Floating Murottal Audio Bar */}
      <AudioPlayerBar />

      {/* Offline Status Badge */}
      <OfflineIndicator />

      {/* Bottom Main Navigation */}
      <BottomNav
        activeTab={activeTab}
        onChangeTab={(tab) => {
          if (tab === 'quran' && activeTab === 'quran') {
            // reset to surah list
            setTargetSurahNumber(undefined);
            setTargetAyatNumber(undefined);
          }
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        bookmarkCount={bookmarks.length}
      />

      {/* Location Picker Modal */}
      <LocationPickerModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
        currentLocation={location}
        onSelectLocation={handleSelectLocation}
      />
    </div>
  );
}
