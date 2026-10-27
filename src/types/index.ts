import { CityLocation } from '../config/appConfig';

export interface SurahSummary {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: 'Mekah' | 'Madinah' | string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
}

export interface Ayat {
  nomorAyat: number;
  teksArab: string;
  teksLatin: string;
  teksIndonesia: string;
  audio: Record<string, string>;
}

export interface SurahDetail extends SurahSummary {
  ayat: Ayat[];
  suratSebelumnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
  suratSelanjutnya?: {
    nomor: number;
    nama: string;
    namaLatin: string;
    jumlahAyat: number;
  } | false;
}

export interface TafsirAyat {
  ayat: number;
  teks: string;
}

export interface TafsirDetail {
  nomor: number;
  nama: string;
  namaLatin: string;
  jumlahAyat: number;
  tempatTurun: string;
  arti: string;
  deskripsi: string;
  audioFull: Record<string, string>;
  tafsir: TafsirAyat[];
}

export interface PrayerTimes {
  imsak: string;
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  sunset: string;
  maghrib: string;
  isha: string;
}

export interface PrayerItem {
  id: 'imsak' | 'fajr' | 'sunrise' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';
  name: string;
  arabicName: string;
  time: string;
  isNext: boolean;
  isPast: boolean;
  isOngoing?: boolean;
  dateObj?: Date;
}

export interface HijriInfo {
  day: number;
  monthNumber: number;
  monthNameEn: string;
  monthNameAr: string;
  monthNameId: string;
  year: number;
  formatted: string;
}

export interface BookmarkItem {
  id: string; // `${surahNumber}:${ayatNumber}`
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  arabText: string;
  translationText: string;
  note?: string;
  createdAt: number;
}

export interface LastReadItem {
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  timestamp: number;
}

export interface ReadingProgress {
  totalAyatRead: number;
  completedSurahs: number[];
  lastRead?: LastReadItem;
  dailyGoal: number; // target ayat per hari
  todayCount: number;
  lastActiveDate: string; // YYYY-MM-DD
  streakDays: number;
}

export interface UserSettings {
  arabicFontSize: number; // 24 to 44
  translationFontSize: number; // 14 to 22
  arabicFontFamily: 'amiri' | 'scheherazade';
  showTranslation: boolean;
  showLatin: boolean;
  selectedQari: string; // '01' to '06'
  prayerMethod: string; // 'kemenag' | 'mwl' | 'egypt' | 'makkah'
  asrJuristic: 'standard' | 'hanafi';
  manualOffsets: {
    fajr: number;
    dhuhr: number;
    asr: number;
    maghrib: number;
    isha: number;
  };
  notificationEnabled: boolean;
  adhanPerPrayer: {
    imsak: boolean;
    fajr: boolean;
    dhuhr: boolean;
    asr: boolean;
    maghrib: boolean;
    isha: boolean;
  };
  adhanSound: 'adhan' | 'tone' | 'silent';
  theme: 'light' | 'dark';
  autoScrollSpeed: number; // 1 to 5
}
