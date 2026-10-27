import React, { useState, useEffect } from 'react';
import {
  Clock,
  MapPin,
  Calendar,
  Compass,
  Volume2,
  Bell,
  ChevronLeft,
  ChevronRight,
  Info,
  CheckCircle,
  Printer,
  Sparkles,
} from 'lucide-react';
import { CityLocation } from '../config/appConfig';
import { HijriInfo, PrayerItem, PrayerTimes, UserSettings } from '../types';
import { PrayerTimesService } from '../services/prayerTimesService';
import { NotificationService } from '../services/notificationService';
import { AudioService } from '../services/audioService';

interface PrayerTimesViewProps {
  location: CityLocation;
  clock: {
    timeString: string;
    fullDateString: string;
    hours: string;
    minutes: string;
    seconds: string;
  };
  hijri?: HijriInfo;
  timings: PrayerTimes;
  nextPrayer: PrayerItem;
  countdownSeconds: number;
  prayerList: PrayerItem[];
  settings: UserSettings;
  onOpenLocationPicker: () => void;
  onUpdateSettings: (settings: UserSettings) => void;
}

export const PrayerTimesView: React.FC<PrayerTimesViewProps> = ({
  location,
  clock,
  hijri,
  timings,
  nextPrayer,
  countdownSeconds,
  prayerList,
  settings,
  onOpenLocationPicker,
  onUpdateSettings,
}) => {
  // Monthly calendar state
  const [calendarYear, setCalendarYear] = useState(() => new Date().getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(() => new Date().getMonth()); // 0-indexed
  const [monthlySchedule, setMonthlySchedule] = useState<
    { date: Date; day: number; hijriDay: number; times: PrayerTimes }[]
  >([]);

  // Qibla Direction calculation
  const qibla = PrayerTimesService.calculateQiblaDirection(
    location.latitude,
    location.longitude
  );

  // Load monthly calendar whenever month/year/location changes
  useEffect(() => {
    const list = PrayerTimesService.getMonthlyCalendar(
      calendarYear,
      calendarMonth,
      location,
      settings
    );
    setMonthlySchedule(list);
  }, [calendarYear, calendarMonth, location, settings]);

  const monthNames = [
    'Januari',
    'Februari',
    'Maret',
    'April',
    'Mei',
    'Juni',
    'Juli',
    'Agustus',
    'September',
    'Oktober',
    'November',
    'Desember',
  ];

  const handlePrevMonth = () => {
    if (calendarMonth === 0) {
      setCalendarMonth(11);
      setCalendarYear((y) => y - 1);
    } else {
      setCalendarMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (calendarMonth === 11) {
      setCalendarMonth(0);
      setCalendarYear((y) => y + 1);
    } else {
      setCalendarMonth((m) => m + 1);
    }
  };

  const formatCountdown = (totalSec: number) => {
    const h = Math.floor(totalSec / 3600);
    const m = Math.floor((totalSec % 3600) / 60);
    const s = totalSec % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleTestAdhan = () => {
    NotificationService.sendTestNotification();
  };

  const handleToggleNotification = async () => {
    if (!settings.notificationEnabled) {
      const granted = await NotificationService.requestPermission();
      onUpdateSettings({ ...settings, notificationEnabled: granted });
      if (granted) {
        NotificationService.sendNotification(
          "Jay'z Quran",
          'Pengingat waktu salat berhasil diaktifkan!'
        );
      }
    } else {
      onUpdateSettings({ ...settings, notificationEnabled: false });
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-fade-in">
      {/* 1. Location and Timezone Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B]">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FFF4D6] text-[#064B32] ring-1 ring-[#E9B949]/30 dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
            <MapPin className="h-6 w-6 text-[#E9B949]" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-bold text-[#09251B] dark:text-white">
                {location.name}
              </h2>
              <span className="rounded-md bg-[#064B32] px-2 py-0.5 text-[10px] font-bold text-white dark:bg-[#10B981]">
                Zona {location.tzLabel}
              </span>
            </div>
            <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
              {location.province} • Lat {location.latitude.toFixed(2)}°, Lng{' '}
              {location.longitude.toFixed(2)}°
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenLocationPicker}
            className="rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] px-3.5 py-2 text-xs font-bold text-[#064B32] hover:bg-white hover:border-[#064B32] dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#34D399] transition"
          >
            Ganti Kota / GPS
          </button>
          <button
            onClick={handleTestAdhan}
            title="Tes Audio Adzan"
            className="flex items-center gap-1.5 rounded-xl bg-[#FFF4D6] px-3.5 py-2 text-xs font-bold text-[#064B32] hover:bg-[#ffeec0] dark:bg-[#1E3A2F] dark:text-[#FBBF24] transition"
          >
            <Volume2 className="h-3.5 w-3.5 text-[#E9B949]" />
            <span>Tes Adzan</span>
          </button>
        </div>
      </div>

      {/* 2. Hero Next Prayer Countdown Card */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064B32] via-[#08784F] to-[#043322] p-6 text-white shadow-xl ring-1 ring-[#E9B949]/30">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-5">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-[#E9B949] px-3 py-1 text-xs font-bold text-[#09251B] tracking-wider uppercase">
              <Clock className="h-3.5 w-3.5" />
              Waktu Salat Berikutnya
            </span>

            <div className="mt-3 flex items-baseline gap-4">
              <h3 className="text-3xl font-black sm:text-4xl">{nextPrayer.name}</h3>
              <span className="font-arabic text-2xl sm:text-3xl font-bold text-[#E9B949]">
                {nextPrayer.arabicName}
              </span>
              <span className="text-2xl font-black text-white sm:text-3xl">
                {nextPrayer.time}
              </span>
            </div>

            <p className="mt-2 text-xs text-[#FFF4D6]/90">
              {clock.fullDateString}
              {hijri && <span className="font-bold text-[#E9B949]"> • {hijri.formatted}</span>}
            </p>
          </div>

          <div className="flex flex-col items-start md:items-end rounded-2xl bg-black/25 p-4 border border-white/10 backdrop-blur-md">
            <span className="text-xs font-semibold text-[#FFF4D6]/80">Hitung Mundur Adzan</span>
            <span className="font-mono text-3xl font-black tracking-tight text-[#E9B949]">
              -{formatCountdown(countdownSeconds)}
            </span>
            <span className="text-[10px] text-white/70 mt-0.5">
              Standar Kemenag RI (+2m Ihtiyat)
            </span>
          </div>
        </div>
      </div>

      {/* 3. Today's Full Prayer Times Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399]">
            Jadwal 5 Waktu & Sunnah Hari Ini
          </h3>
          <span className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
            Zona Waktu: <strong>{location.tzLabel}</strong> (GMT+
            {PrayerTimesService.getTimezoneOffsetHours(location.timezone)})
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
          {prayerList.map((p) => {
            const isTarget = nextPrayer.id === p.id && !nextPrayer.name.includes('Besok');
            let statusText = 'Akan Datang';
            if (isTarget) statusText = 'Berikutnya';
            else if (p.isPast) statusText = 'Sudah Lewat';

            return (
              <div
                key={p.id}
                className={`relative overflow-hidden rounded-2xl border p-4 text-center transition-all ${
                  isTarget
                    ? 'border-[#E9B949] bg-[#064B32] text-white shadow-lg ring-2 ring-[#E9B949]/50'
                    : p.isPast
                    ? 'border-[#DCE5DD]/60 bg-gray-50/70 text-gray-400 dark:border-[#1F4535]/50 dark:bg-[#153327]/30 dark:text-gray-500'
                    : 'border-[#DCE5DD] bg-white text-[#09251B] dark:border-[#1F4535] dark:bg-[#0E241B] dark:text-white'
                }`}
              >
                {/* Status badge */}
                <span
                  className={`inline-block rounded-md px-2 py-0.5 text-[9px] font-extrabold uppercase tracking-wide mb-1.5 ${
                    isTarget
                      ? 'bg-[#E9B949] text-[#09251B]'
                      : p.isPast
                      ? 'bg-gray-200 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                      : 'bg-[#F5F7F2] text-[#064B32] dark:bg-[#153327] dark:text-[#34D399]'
                  }`}
                >
                  {statusText}
                </span>

                <h4 className="text-base font-bold">{p.name}</h4>
                <p
                  className={`font-arabic text-sm ${
                    isTarget ? 'text-[#E9B949]' : 'text-gray-400 dark:text-gray-500'
                  }`}
                >
                  {p.arabicName}
                </p>

                <div
                  className={`mt-2 font-mono text-xl font-black ${
                    isTarget ? 'text-[#E9B949]' : 'text-[#064B32] dark:text-[#34D399]'
                  }`}
                >
                  {p.time}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Qibla Direction & Calculation Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Qibla Direction Compass Card */}
        <div className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B]">
          <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
            <span className="flex items-center gap-1.5 text-xs font-bold text-[#064B32] uppercase tracking-wider dark:text-[#34D399]">
              <Compass className="h-4 w-4 text-[#E9B949]" />
              Arah Kiblat dari {location.name}
            </span>
            <span className="text-xs font-bold text-[#064B32] dark:text-[#E9B949]">
              {qibla.bearingDegrees}° {qibla.cardinalDirection}
            </span>
          </div>

          <div className="mt-4 flex flex-col sm:flex-row items-center justify-around gap-4">
            {/* Visual Compass dial */}
            <div className="relative flex h-32 w-32 items-center justify-center rounded-full border-4 border-[#064B32]/20 bg-[#FFFDF5] dark:bg-[#153327] dark:border-[#10B981]/20 shadow-inner">
              <span className="absolute top-1 text-[10px] font-bold text-[#064B32] dark:text-white">
                U (0°)
              </span>
              <span className="absolute right-1 text-[10px] font-bold text-gray-400">T</span>
              <span className="absolute bottom-1 text-[10px] font-bold text-gray-400">S</span>
              <span className="absolute left-1 text-[10px] font-bold text-gray-400">B</span>

              {/* Kaaba Direction Needle */}
              <div
                className="absolute flex flex-col items-center justify-center transition-transform duration-700 ease-out"
                style={{ transform: `rotate(${qibla.bearingDegrees}deg)` }}
              >
                <div className="h-10 w-1.5 rounded-full bg-gradient-to-t from-[#064B32] to-[#E9B949] shadow-md" />
                <div className="h-3 w-3 -mt-1.5 rounded-full bg-[#E9B949] ring-2 ring-white" />
              </div>

              <div className="z-10 text-[10px] font-black text-[#064B32] dark:text-white bg-white/80 dark:bg-black/80 px-1.5 py-0.5 rounded">
                🕋 Ka'bah
              </div>
            </div>

            <div className="space-y-2 text-xs text-[#52665B] dark:text-[#9DB5AA]">
              <p>
                <strong>Derajat Kompas:</strong>{' '}
                <span className="text-[#09251B] dark:text-white font-bold">
                  {qibla.bearingDegrees}°
                </span>{' '}
                dari Utara ke Barat
              </p>
              <p>
                <strong>Jarak ke Ka'bah:</strong>{' '}
                <span className="text-[#09251B] dark:text-white font-bold">
                  {qibla.distanceKm.toLocaleString('id-ID')} km
                </span>
              </p>
              <p>
                <strong>Koordinat Ka'bah:</strong> 21.42° N, 39.82° E (Mekkah Al-Mukarramah)
              </p>
            </div>
          </div>
        </div>

        {/* Calculation & Notification Settings Card */}
        <div className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
              <span className="flex items-center gap-1.5 text-xs font-bold text-[#064B32] uppercase tracking-wider dark:text-[#34D399]">
                <Bell className="h-4 w-4 text-[#E9B949]" />
                Pengingat & Metode Hisab
              </span>
              <span className="text-xs font-medium text-gray-500">Kemenag RI</span>
            </div>

            <div className="mt-3 space-y-2.5 text-xs text-[#52665B] dark:text-[#9DB5AA]">
              <div className="flex justify-between items-center">
                <span>Metode Perhitungan:</span>
                <span className="font-bold text-[#09251B] dark:text-white">
                  Kemenag RI (Subuh 20°, Isya 18°)
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Pengaman Waktu (Ihtiyat):</span>
                <span className="font-bold text-[#09251B] dark:text-white">+2 Menit (Standar RI)</span>
              </div>
              <div className="flex justify-between items-center">
                <span>Madzhab Waktu Ashar:</span>
                <span className="font-bold text-[#09251B] dark:text-white">
                  {settings.asrJuristic === 'hanafi' ? 'Hanafi (Bayangan 2x)' : "Syafi'i (Standar 1x)"}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span>Notifikasi Browser:</span>
                <span
                  className={`font-bold ${
                    settings.notificationEnabled ? 'text-emerald-600' : 'text-gray-400'
                  }`}
                >
                  {settings.notificationEnabled ? 'Aktif' : 'Nonaktif'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-[#DCE5DD] dark:border-[#1F4535] flex gap-2">
            <button
              onClick={handleToggleNotification}
              className={`flex-1 rounded-xl py-2 px-3 text-xs font-semibold transition flex items-center justify-center gap-1.5 ${
                settings.notificationEnabled
                  ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                  : 'bg-[#064B32] text-white hover:bg-[#08784F]'
              }`}
            >
              <Bell className="h-3.5 w-3.5" />
              <span>
                {settings.notificationEnabled ? 'Matikan Notifikasi' : 'Aktifkan Pengingat Salat'}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Monthly Prayer Times Calendar */}
      <div className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B]">
        {/* Calendar Month Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-4 border-b border-[#DCE5DD] dark:border-[#1F4535]">
          <div>
            <h3 className="text-base font-bold text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#E9B949]" />
              Jadwal Salat Bulanan — {monthNames[calendarMonth]} {calendarYear}
            </h3>
            <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
              Jadwal lengkap kota {location.name} ({location.tzLabel})
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrevMonth}
              title="Bulan Sebelumnya"
              className="rounded-xl border border-[#DCE5DD] p-2 hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-bold text-[#09251B] dark:text-white px-2">
              {monthNames[calendarMonth]} {calendarYear}
            </span>
            <button
              onClick={handleNextMonth}
              title="Bulan Selanjutnya"
              className="rounded-xl border border-[#DCE5DD] p-2 hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]"
            >
              <ChevronRight className="h-4 w-4" />
            </button>

            <button
              onClick={() => window.print()}
              title="Cetak Jadwal Salat"
              className="ml-2 flex items-center gap-1 rounded-xl bg-[#F5F7F2] px-3 py-2 text-xs font-semibold text-[#064B32] hover:bg-white dark:bg-[#153327] dark:text-[#34D399]"
            >
              <Printer className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Cetak</span>
            </button>
          </div>
        </div>

        {/* Table of the Month */}
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-[#DCE5DD] bg-[#F5F7F2] text-[#064B32] dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#34D399]">
                <th className="p-2.5 font-bold">Tgl</th>
                <th className="p-2.5 font-bold">Hijriah</th>
                <th className="p-2.5 font-bold">Imsak</th>
                <th className="p-2.5 font-bold">Subuh</th>
                <th className="p-2.5 font-bold">Syuruq</th>
                <th className="p-2.5 font-bold">Zuhur</th>
                <th className="p-2.5 font-bold">Asar</th>
                <th className="p-2.5 font-bold">Magrib</th>
                <th className="p-2.5 font-bold">Isya</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCE5DD]/60 dark:divide-[#1F4535]/60 text-[#09251B] dark:text-[#E8F0EC]">
              {monthlySchedule.map((row) => {
                const isToday =
                  row.day === new Date().getDate() &&
                  calendarMonth === new Date().getMonth() &&
                  calendarYear === new Date().getFullYear();

                return (
                  <tr
                    key={row.day}
                    className={`transition ${
                      isToday
                        ? 'bg-[#FFF4D6] font-extrabold text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]'
                        : 'hover:bg-[#F5F7F2]/50 dark:hover:bg-[#153327]/50'
                    }`}
                  >
                    <td className="p-2.5 font-mono">
                      {row.day.toString().padStart(2, '0')}
                      {isToday && (
                        <span className="ml-1 text-[10px] text-emerald-600 font-bold">
                          (Hari Ini)
                        </span>
                      )}
                    </td>
                    <td className="p-2.5 text-gray-500 dark:text-gray-400">
                      {row.hijriDay}
                    </td>
                    <td className="p-2.5 font-mono">{row.times.imsak}</td>
                    <td className="p-2.5 font-mono">{row.times.fajr}</td>
                    <td className="p-2.5 font-mono">{row.times.sunrise}</td>
                    <td className="p-2.5 font-mono">{row.times.dhuhr}</td>
                    <td className="p-2.5 font-mono">{row.times.asr}</td>
                    <td className="p-2.5 font-mono">{row.times.maghrib}</td>
                    <td className="p-2.5 font-mono">{row.times.isha}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
