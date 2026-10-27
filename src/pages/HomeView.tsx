import React, { useState } from 'react';
import {
  Clock,
  BookOpen,
  Bookmark,
  Compass,
  Volume2,
  Calendar,
  ChevronRight,
  Sparkles,
  Flame,
  Target,
  ArrowRight,
  Share2,
  Check,
  Search,
} from 'lucide-react';
import { CityLocation } from '../config/appConfig';
import { HijriInfo, LastReadItem, PrayerItem, PrayerTimes, ReadingProgress } from '../types';
import { TabType } from '../components/BottomNav';
import { AudioService } from '../services/audioService';

interface HomeViewProps {
  location: CityLocation;
  clock: {
    timeString: string;
    fullDateString: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  hijri?: HijriInfo;
  nextPrayer: PrayerItem;
  countdownSeconds: number;
  prayerList: PrayerItem[];
  lastRead: LastReadItem | null;
  readingProgress: ReadingProgress;
  onNavigateTab: (tab: TabType) => void;
  onOpenSurah: (surahNumber: number, ayatNumber?: number) => void;
  onOpenLocationModal: () => void;
}

export const HomeView: React.FC<HomeViewProps> = ({
  location,
  clock,
  hijri,
  nextPrayer,
  countdownSeconds,
  prayerList,
  lastRead,
  readingProgress,
  onNavigateTab,
  onOpenSurah,
  onOpenLocationModal,
}) => {
  const [copiedAyah, setCopiedAyah] = useState(false);

  // Format countdown HH:MM:SS
  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Get greeting based on hours
  const hourNum = parseInt(clock.hours, 10);
  let greeting = 'Selamat Pagi';
  if (hourNum >= 11 && hourNum < 15) greeting = 'Selamat Siang';
  else if (hourNum >= 15 && hourNum < 18) greeting = 'Selamat Sore';
  else if (hourNum >= 18 || hourNum < 4) greeting = 'Selamat Malam';
  else if (hourNum >= 4 && hourNum < 11) greeting = 'Selamat Pagi';

  const dailyAyah = {
    surahNumber: 2,
    surahName: 'Al-Baqarah',
    ayatNumber: 286,
    teksArab: 'لَا يُكَلِّفُ اللّٰهُ نَفْسًا اِلَّا وُسْعَهَا',
    arti: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
  };

  const quickSurahs = [
    { number: 18, name: 'Al-Kahf', ayat: 110, tag: "Jum'at" },
    { number: 36, name: 'Yasin', ayat: 83, tag: 'Hati Quran' },
    { number: 67, name: 'Al-Mulk', ayat: 30, tag: 'Pelindung' },
    { number: 55, name: 'Ar-Rahman', ayat: 78, tag: 'Nikmat' },
    { number: 56, name: "Al-Waqi'ah", ayat: 96, tag: 'Rezeki' },
    { number: 1, name: 'Al-Fatihah', ayat: 7, tag: 'Pembuka' },
  ];

  const handleCopyAyah = () => {
    navigator.clipboard.writeText(
      `${dailyAyah.teksArab}\n"${dailyAyah.arti}" (QS. ${dailyAyah.surahName}: ${dailyAyah.ayatNumber})`
    );
    setCopiedAyah(true);
    setTimeout(() => setCopiedAyah(false), 2500);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* 1. Header Greeting & Digital Clock Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064B32] via-[#08784F] to-[#043322] p-6 text-white shadow-xl ring-1 ring-[#E9B949]/30">
        {/* Subtle decorative Islamic arch background */}
        <div className="pointer-events-none absolute -right-10 -bottom-10 h-64 w-64 rounded-full border-[18px] border-white/5 opacity-40" />
        <div className="pointer-events-none absolute -right-4 -top-6 h-40 w-40 rounded-full border-[10px] border-[#E9B949]/10" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-[#E9B949] px-2 py-0.5 text-[11px] font-bold text-[#09251B] tracking-wide uppercase">
                {greeting}
              </span>
              <span className="text-xs text-[#FFF4D6]/80 flex items-center gap-1">
                <span>📍 {location.name}</span>
                <span className="font-bold text-[#E9B949]">({location.tzLabel})</span>
              </span>
            </div>

            <h2 className="mt-2 text-2xl font-black tracking-tight sm:text-3xl text-white">
              Assalamu'alaikum
            </h2>

            <p className="mt-1 text-xs text-[#FFF4D6]/90 sm:text-sm font-medium">
              {clock.fullDateString}
              {hijri && (
                <span className="ml-1.5 text-[#E9B949] font-bold">
                  • {hijri.formatted}
                </span>
              )}
            </p>
          </div>

          {/* Real-time Large Digital Clock */}
          <div className="flex items-center self-start md:self-auto rounded-2xl bg-black/25 px-4 py-2.5 backdrop-blur-md border border-white/10 shadow-inner">
            <Clock className="mr-2.5 h-6 w-6 text-[#E9B949]" />
            <div>
              <div className="font-mono text-2xl font-extrabold tracking-wider sm:text-3xl text-white">
                {clock.timeString}
              </div>
              <div className="text-[10px] font-semibold text-[#E9B949] text-right uppercase tracking-wider">
                Zona {location.tzLabel}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. Next Prayer Countdown Hero Card */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] transition-colors">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-2.5 w-2.5 rounded-full bg-[#E9B949] animate-ping" />
              <span className="text-xs font-bold text-[#064B32] uppercase tracking-wider dark:text-[#34D399]">
                Salat Berikutnya
              </span>
            </div>
            <div className="mt-1 flex items-baseline gap-3">
              <h3 className="text-2xl font-extrabold text-[#09251B] dark:text-white sm:text-3xl">
                {nextPrayer.name}
              </h3>
              <span className="font-arabic text-xl font-bold text-[#064B32] dark:text-[#34D399]">
                {nextPrayer.arabicName}
              </span>
              <span className="text-xl font-black text-[#E9B949] sm:text-2xl">
                {nextPrayer.time}
              </span>
            </div>
            <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
              Menuju azan di kota <strong className="text-[#09251B] dark:text-white">{location.name}</strong>
            </p>
          </div>

          {/* Countdown timer pill */}
          <div className="flex flex-col items-start sm:items-end rounded-xl bg-[#FFF4D6] px-4 py-3 dark:bg-[#1E3A2F] border border-[#E9B949]/30">
            <span className="text-[11px] font-semibold text-[#064B32] dark:text-[#9DB5AA]">
              Hitung Mundur
            </span>
            <span className="font-mono text-2xl font-black tracking-tight text-[#064B32] dark:text-[#FBBF24]">
              -{formatCountdown(countdownSeconds)}
            </span>
          </div>
        </div>

        {/* Quick Prayer Strips */}
        <div className="mt-4 grid grid-cols-4 sm:grid-cols-7 gap-2 pt-3 border-t border-[#DCE5DD] dark:border-[#1F4535]">
          {prayerList.map((p) => {
            const isTarget = nextPrayer.id === p.id && !nextPrayer.name.includes('Besok');
            return (
              <div
                key={p.id}
                className={`flex flex-col items-center justify-center rounded-xl p-2 text-center transition ${
                  isTarget
                    ? 'bg-[#064B32] text-white ring-2 ring-[#E9B949]'
                    : p.isPast
                    ? 'bg-[#F5F7F2]/60 text-gray-400 dark:bg-[#153327]/40 dark:text-gray-500'
                    : 'bg-[#F5F7F2] text-[#09251B] dark:bg-[#153327] dark:text-[#E8F0EC]'
                }`}
              >
                <span className="text-[11px] font-semibold">{p.name}</span>
                <span
                  className={`mt-0.5 text-xs font-bold ${
                    isTarget ? 'text-[#E9B949]' : ''
                  }`}
                >
                  {p.time}
                </span>
              </div>
            );
          })}
        </div>

        <div className="mt-3 flex justify-between items-center text-xs text-[#52665B] dark:text-[#9DB5AA]">
          <button
            onClick={onOpenLocationModal}
            className="hover:text-[#064B32] dark:hover:text-[#34D399] underline underline-offset-2 flex items-center gap-1 font-medium"
          >
            Ganti Kota / Koordinat
          </button>
          <button
            onClick={() => onNavigateTab('prayer')}
            className="text-[#064B32] dark:text-[#34D399] font-bold flex items-center gap-1 hover:underline"
          >
            Lihat Jadwal Sebulan <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </section>

      {/* 3. Last Read & Reading Target Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Lanjutkan Membaca */}
        <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#064B32] uppercase tracking-wider dark:text-[#34D399]">
                <BookOpen className="h-4 w-4 text-[#E9B949]" />
                Lanjutkan Membaca
              </span>
              {lastRead && (
                <span className="text-[10px] text-gray-400">
                  {new Date(lastRead.timestamp).toLocaleDateString('id-ID')}
                </span>
              )}
            </div>

            {lastRead ? (
              <div className="mt-2">
                <h4 className="text-xl font-bold text-[#09251B] dark:text-white">
                  Surat {lastRead.surahName}
                </h4>
                <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
                  Ayat ke-{lastRead.ayatNumber} • Terakhir dibaca
                </p>
              </div>
            ) : (
              <div className="mt-2">
                <h4 className="text-base font-bold text-[#09251B] dark:text-white">
                  Mulai Tilawah Hari Ini
                </h4>
                <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
                  Buka Surah Al-Fatihah dan raih keberkahan membaca Al-Qur'an.
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => {
              if (lastRead) {
                onOpenSurah(lastRead.surahNumber, lastRead.ayatNumber);
              } else {
                onOpenSurah(1, 1);
              }
            }}
            className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl bg-[#064B32] py-2.5 text-xs font-bold text-white shadow-xs hover:bg-[#08784F] transition active:scale-[0.99]"
          >
            <span>{lastRead ? 'Lanjutkan Tilawah' : 'Mulai Membaca'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </section>

        {/* Progres & Ibadah Tracker */}
        <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#064B32] uppercase tracking-wider dark:text-[#34D399]">
                <Target className="h-4 w-4 text-[#E9B949]" />
                Progres Ibadah
              </span>
              <span className="flex items-center gap-1 rounded-full bg-[#FFF4D6] px-2 py-0.5 text-[11px] font-bold text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                <Flame className="h-3 w-3 text-orange-500 fill-orange-500" />
                {readingProgress.streakDays} Hari Rutin
              </span>
            </div>

            <div className="mt-2 flex items-baseline justify-between">
              <div>
                <span className="text-2xl font-black text-[#09251B] dark:text-white">
                  {readingProgress.todayCount}
                </span>
                <span className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
                  {' '}
                  / {readingProgress.dailyGoal} ayat target hari ini
                </span>
              </div>
              <span className="text-xs font-bold text-[#064B32] dark:text-[#34D399]">
                {Math.min(
                  100,
                  Math.round((readingProgress.todayCount / readingProgress.dailyGoal) * 100)
                )}
                %
              </span>
            </div>

            {/* Progress bar */}
            <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-[#F5F7F2] dark:bg-[#153327]">
              <div
                className="h-full rounded-full bg-gradient-to-r from-[#064B32] to-[#E9B949] transition-all duration-300"
                style={{
                  width: `${Math.min(
                    100,
                    (readingProgress.todayCount / readingProgress.dailyGoal) * 100
                  )}%`,
                }}
              />
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-xs text-[#52665B] dark:text-[#9DB5AA] pt-2 border-t border-[#DCE5DD] dark:border-[#1F4535]">
            <span>Total ayat dibaca:</span>
            <span className="font-bold text-[#09251B] dark:text-white">
              {readingProgress.totalAyatRead} Ayat
            </span>
          </div>
        </section>
      </div>

      {/* 4. Surah Pilihan Cepat */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#E9B949]" />
            Surah Pilihan Harian
          </h3>
          <button
            onClick={() => onNavigateTab('quran')}
            className="text-xs font-semibold text-[#064B32] dark:text-[#34D399] hover:underline"
          >
            Lihat Semua 114 Surah →
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
          {quickSurahs.map((s) => (
            <button
              key={s.number}
              onClick={() => onOpenSurah(s.number)}
              className="flex flex-col items-start rounded-xl border border-[#DCE5DD] bg-white p-3 text-left shadow-2xs hover:border-[#064B32] hover:shadow-xs transition dark:border-[#1F4535] dark:bg-[#0E241B] dark:hover:border-[#34D399] group"
            >
              <div className="flex w-full items-center justify-between">
                <span className="flex h-5 w-5 items-center justify-center rounded-md bg-[#FFF4D6] text-[10px] font-bold text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                  {s.number}
                </span>
                <span className="text-[10px] font-medium text-[#52665B] dark:text-[#9DB5AA]">
                  {s.tag}
                </span>
              </div>
              <h4 className="mt-2 text-sm font-bold text-[#09251B] dark:text-white group-hover:text-[#064B32] dark:group-hover:text-[#34D399] transition">
                {s.name}
              </h4>
              <p className="text-[11px] text-[#52665B] dark:text-[#9DB5AA]">{s.ayat} Ayat</p>
            </button>
          ))}
        </div>
      </section>

      {/* 5. Ayat Harian Inspirasi */}
      <section className="rounded-2xl border border-[#E9B949]/30 bg-gradient-to-br from-[#FFFDF5] to-[#FFF4D6] p-5 shadow-xs dark:from-[#0E241B] dark:to-[#153327] dark:border-[#E9B949]/20">
        <div className="flex items-center justify-between pb-3">
          <span className="text-xs font-bold uppercase tracking-wider text-[#064B32] dark:text-[#FBBF24] flex items-center gap-1.5">
            <Sparkles className="h-4 w-4 text-[#E9B949]" />
            Mutiara Al-Qur'an Hari Ini
          </span>

          <button
            onClick={handleCopyAyah}
            className="flex items-center gap-1 rounded-lg bg-white/80 px-2.5 py-1 text-xs font-semibold text-[#064B32] shadow-2xs hover:bg-white dark:bg-[#0E241B] dark:text-[#E8F0EC] transition"
          >
            {copiedAyah ? (
              <>
                <Check className="h-3.5 w-3.5 text-emerald-600" />
                <span>Tersalin!</span>
              </>
            ) : (
              <>
                <Share2 className="h-3.5 w-3.5" />
                <span>Salin Ayat</span>
              </>
            )}
          </button>
        </div>

        <p className="font-arabic text-xl sm:text-2xl text-right leading-loose text-[#064B32] dark:text-[#34D399] my-2">
          {dailyAyah.teksArab}
        </p>

        <p className="mt-2 text-xs sm:text-sm text-[#09251B] dark:text-[#E8F0EC] italic font-medium">
          "{dailyAyah.arti}"
        </p>

        <div className="mt-3 flex items-center justify-between pt-2 border-t border-[#E9B949]/20 text-xs">
          <span className="font-bold text-[#064B32] dark:text-[#FBBF24]">
            QS. {dailyAyah.surahName}: {dailyAyah.ayatNumber}
          </span>
          <button
            onClick={() => onOpenSurah(dailyAyah.surahNumber, dailyAyah.ayatNumber)}
            className="font-semibold text-[#064B32] dark:text-[#34D399] hover:underline flex items-center gap-1"
          >
            Buka Konteks Ayat <ChevronRight className="h-3 w-3" />
          </button>
        </div>
      </section>
    </div>
  );
};
