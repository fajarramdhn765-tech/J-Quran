import { APP_CONFIG, CityLocation } from '../config/appConfig';
import { HijriInfo, PrayerItem, PrayerTimes, UserSettings } from '../types';

export class PrayerTimesService {
  /**
   * Astronomical calculation for prayer times (Solar equations)
   * Formula handles Fajr, Sunrise, Dhuhr, Asr, Sunset, Maghrib, Isha, Imsak
   */
  static calculatePrayerTimes(
    date: Date,
    lat: number,
    lng: number,
    timezoneOffsetHours: number, // e.g. 7 for WIB, 8 for WITA, 9 for WIT
    settings: UserSettings
  ): PrayerTimes {
    const D = this.daysSinceJ2000(date);

    // Mean solar coordinates
    const g = 357.529 + 0.98560028 * D;
    const q = 280.459 + 0.98564736 * D;
    const L = q + 1.915 * Math.sin(this.degToRad(g)) + 0.02 * Math.sin(this.degToRad(2 * g));

    // Sun declination (delta)
    const e = 23.439 - 0.00000036 * D;
    const sinDelta = Math.sin(this.degToRad(e)) * Math.sin(this.degToRad(L));
    const delta = this.radToDeg(Math.asin(sinDelta));

    // Equation of Time (EoT) in minutes
    const RA = this.radToDeg(Math.atan2(Math.cos(this.degToRad(e)) * Math.sin(this.degToRad(L)), Math.cos(this.degToRad(L))));
    let EqT = (q / 15 - RA / 15) * 60;
    while (EqT > 20) EqT -= 60;
    while (EqT < -20) EqT += 60;

    // Solar noon (Dhuhr) transit in hours
    const transit = 12 + timezoneOffsetHours - lng / 15 - EqT / 60;

    // Kemenag RI / chosen angles
    let fajrAngle = 20;
    let ishaAngle = 18;
    const method = APP_CONFIG.prayerMethods.find((m) => m.id === settings.prayerMethod);
    if (method) {
      fajrAngle = method.fajrAngle;
      ishaAngle = method.ishaAngle;
    }

    // Hour angle for an altitude alpha
    const hourAngle = (alpha: number): number => {
      const cosH =
        (Math.sin(this.degToRad(alpha)) -
          Math.sin(this.degToRad(lat)) * Math.sin(this.degToRad(delta))) /
        (Math.cos(this.degToRad(lat)) * Math.cos(this.degToRad(delta)));
      if (cosH > 1 || cosH < -1) return 0;
      return this.radToDeg(Math.acos(cosH)) / 15;
    };

    // Sunrise & Sunset angle accounting for atmospheric refraction (-0.833°)
    const sunAlt = -0.833;
    const hSunrise = hourAngle(sunAlt);

    const sunriseDec = transit - hSunrise;
    const sunsetDec = transit + hSunrise;

    // Fajr (Dawn)
    const hFajr = hourAngle(-fajrAngle);
    const fajrDec = transit - hFajr;

    // Isha (Nightfall)
    const hIsha = hourAngle(-ishaAngle);
    const ishaDec = transit + hIsha;

    // Asr (Shadow length multiplier: Shafi'i=1, Hanafi=2)
    const asrMultiplier = settings.asrJuristic === 'hanafi' ? 2 : 1;
    const asrAngle = this.radToDeg(
      Math.atan(1 / (asrMultiplier + Math.tan(this.degToRad(Math.abs(lat - delta)))))
    );
    const hAsr = hourAngle(asrAngle);
    const asrDec = transit + hAsr;

    // Dhuhr transit + 2 min ihtiyat (safety margin standard in Indonesian rukyah)
    const dhuhrDec = transit + 2 / 60;

    // Maghrib = Sunset + 2 min ihtiyat
    const maghribDec = sunsetDec + 2 / 60;

    // Imsak = Fajr - 10 minutes
    const imsakDec = fajrDec - 10 / 60;

    // Apply manual minute offsets
    const applyOffset = (decHours: number, offsetMinutes: number) => {
      return this.decimalToTime(decHours + offsetMinutes / 60);
    };

    return {
      imsak: applyOffset(imsakDec, settings.manualOffsets.fajr),
      fajr: applyOffset(fajrDec, settings.manualOffsets.fajr),
      sunrise: this.decimalToTime(sunriseDec),
      dhuhr: applyOffset(dhuhrDec, settings.manualOffsets.dhuhr),
      asr: applyOffset(asrDec, settings.manualOffsets.asr),
      sunset: this.decimalToTime(sunsetDec),
      maghrib: applyOffset(maghribDec, settings.manualOffsets.maghrib),
      isha: applyOffset(ishaDec, settings.manualOffsets.isha),
    };
  }

  /**
   * Fetch online timings from Aladhan API or fallback to calculation engine
   */
  static async getTimings(
    date: Date,
    location: CityLocation,
    settings: UserSettings
  ): Promise<{ timings: PrayerTimes; isOnline: boolean; hijri?: HijriInfo }> {
    const tzHours = this.getTimezoneOffsetHours(location.timezone);

    // Try online fetch first if network is present
    try {
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      // Method 20 in Aladhan is Kemenag / Islamic Council of Indonesia
      const methodParam = settings.prayerMethod === 'kemenag' ? '20' : '3';
      const url = `${APP_CONFIG.api.aladhanBaseUrl}/timings/${day}-${month}-${year}?latitude=${location.latitude}&longitude=${location.longitude}&method=${methodParam}`;

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timeout);

      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && json.data) {
          const t = json.data.timings;
          const h = json.data.date?.hijri;

          const hijriData: HijriInfo | undefined = h
            ? {
                day: parseInt(h.day, 10),
                monthNumber: h.month?.number || 1,
                monthNameEn: h.month?.en || '',
                monthNameAr: h.month?.ar || '',
                monthNameId: this.getHijriMonthNameId(h.month?.number || 1),
                year: parseInt(h.year, 10),
                formatted: `${h.day} ${this.getHijriMonthNameId(h.month?.number || 1)} ${h.year} H`,
              }
            : undefined;

          // Normalize format HH:MM
          const cleanTime = (str: string) => str.slice(0, 5);

          const timings: PrayerTimes = {
            imsak: cleanTime(t.Imsak || '04:10'),
            fajr: cleanTime(t.Fajr),
            sunrise: cleanTime(t.Sunrise),
            dhuhr: cleanTime(t.Dhuhr),
            asr: cleanTime(t.Asr),
            sunset: cleanTime(t.Sunset),
            maghrib: cleanTime(t.Maghrib),
            isha: cleanTime(t.Isha),
          };

          return { timings, isOnline: true, hijri: hijriData };
        }
      }
    } catch {
      // offline fallback
    }

    // Precise offline mathematical calculation
    const calculated = this.calculatePrayerTimes(
      date,
      location.latitude,
      location.longitude,
      tzHours,
      settings
    );

    const offlineHijri = this.calculateOfflineHijri(date);

    return { timings: calculated, isOnline: false, hijri: offlineHijri };
  }

  /**
   * Determine next prayer, current status, and seconds countdown
   */
  static getNextPrayer(
    timings: PrayerTimes,
    now: Date,
    location: CityLocation
  ): {
    nextPrayer: PrayerItem;
    countdownSeconds: number;
    prayerList: PrayerItem[];
  } {
    // Current time in location timezone
    const nowParts = this.getTimeInTimezone(now, location.timezone);
    const nowMinutes = nowParts.hours * 60 + nowParts.minutes + nowParts.seconds / 60;

    const timeToMinutes = (timeStr: string) => {
      const [h, m] = timeStr.split(':').map(Number);
      return h * 60 + m;
    };

    const prayers: { id: PrayerItem['id']; name: string; arabicName: string; time: string }[] = [
      { id: 'imsak', name: 'Imsak', arabicName: 'الإمساك', time: timings.imsak },
      { id: 'fajr', name: 'Subuh', arabicName: 'الفجر', time: timings.fajr },
      { id: 'sunrise', name: 'Syuruq', arabicName: 'الشروق', time: timings.sunrise },
      { id: 'dhuhr', name: 'Zuhur', arabicName: 'الظهر', time: timings.dhuhr },
      { id: 'asr', name: 'Asar', arabicName: 'العصر', time: timings.asr },
      { id: 'maghrib', name: 'Magrib', arabicName: 'المغرب', time: timings.maghrib },
      { id: 'isha', name: 'Isya', arabicName: 'العشاء', time: timings.isha },
    ];

    let nextItem: PrayerItem | null = null;
    let nextMinutes = 0;

    // Find the next obligatory or sunnah prayer today
    for (const p of prayers) {
      const pMinutes = timeToMinutes(p.time);
      if (pMinutes > nowMinutes) {
        nextItem = {
          ...p,
          isNext: true,
          isPast: false,
        };
        nextMinutes = pMinutes;
        break;
      }
    }

    // If all prayers today passed, next prayer is tomorrow's Fajr / Imsak
    let countdownSeconds = 0;
    if (!nextItem) {
      const tomorrowFajr = prayers.find((p) => p.id === 'fajr') || prayers[1];
      nextItem = {
        ...tomorrowFajr,
        name: 'Subuh (Besok)',
        isNext: true,
        isPast: false,
      };
      const minutesRemainingToday = 24 * 60 - nowMinutes;
      const tomorrowFajrMinutes = timeToMinutes(tomorrowFajr.time);
      countdownSeconds = Math.max(0, Math.round((minutesRemainingToday + tomorrowFajrMinutes) * 60));
    } else {
      countdownSeconds = Math.max(0, Math.round((nextMinutes - nowMinutes) * 60));
    }

    // Mark states for list
    const prayerList: PrayerItem[] = prayers.map((p) => {
      const pMin = timeToMinutes(p.time);
      const isPast = pMin <= nowMinutes;
      const isNext = nextItem?.id === p.id && !nextItem.name.includes('Besok');
      return {
        ...p,
        isNext,
        isPast,
      };
    });

    return {
      nextPrayer: nextItem,
      countdownSeconds,
      prayerList,
    };
  }

  /**
   * Calculate monthly prayer times calendar
   */
  static getMonthlyCalendar(
    year: number,
    month: number, // 0-indexed: 0 = Januari, 11 = Desember
    location: CityLocation,
    settings: UserSettings
  ): { date: Date; day: number; hijriDay: number; times: PrayerTimes }[] {
    const tzHours = this.getTimezoneOffsetHours(location.timezone);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const result = [];

    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day, 12, 0, 0);
      const times = this.calculatePrayerTimes(date, location.latitude, location.longitude, tzHours, settings);
      const hijri = this.calculateOfflineHijri(date);
      result.push({
        date,
        day,
        hijriDay: hijri.day,
        times,
      });
    }

    return result;
  }

  /**
   * Great Circle Bearing calculation to the Holy Kaaba in Makkah
   * Kaaba Coordinates: Lat 21.4225° N, Lng 39.8262° E
   */
  static calculateQiblaDirection(userLat: number, userLng: number): {
    bearingDegrees: number;
    distanceKm: number;
    cardinalDirection: string;
  } {
    const kaabaLat = 21.422487;
    const kaabaLng = 39.826206;

    const φ1 = this.degToRad(userLat);
    const φ2 = this.degToRad(kaabaLat);
    const Δλ = this.degToRad(kaabaLng - userLng);

    const y = Math.sin(Δλ) * Math.cos(φ2);
    const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ);
    let θ = this.radToDeg(Math.atan2(y, x));
    const bearing = (θ + 360) % 360;

    // Haversine distance
    const R = 6371; // Earth radius in km
    const Δφ = this.degToRad(kaabaLat - userLat);
    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distanceKm = Math.round(R * c);

    // Cardinal
    const directions = ['U', 'TL', 'T', 'TG', 'S', 'BD', 'B', 'BL'];
    const idx = Math.round(bearing / 45) % 8;

    return {
      bearingDegrees: Math.round(bearing * 10) / 10,
      distanceKm,
      cardinalDirection: directions[idx],
    };
  }

  /**
   * Offline Umm al-Qura algorithmic Hijri date conversion
   */
  static calculateOfflineHijri(date: Date): HijriInfo {
    // Julian day calculation
    let y = date.getFullYear();
    let m = date.getMonth() + 1;
    const d = date.getDate();

    if (m < 3) {
      y -= 1;
      m += 12;
    }
    const a = Math.floor(y / 100);
    const b = 2 - a + Math.floor(a / 4);
    const jd =
      Math.floor(365.25 * (y + 4716)) +
      Math.floor(30.6001 * (m + 1)) +
      d +
      b -
      1524.5;

    // Convert JD to Hijri
    const l = Math.floor(jd - 1948440 + 10632);
    const n = Math.floor((l - 1) / 10631);
    const l2 = l - 10631 * n + 354;
    const j =
      Math.floor((10985 - l2) / 5316) * Math.floor((50 * l2) / 17719) +
      Math.floor(l2 / 5670) * Math.floor((43 * l2) / 15238);
    const l3 =
      l2 -
      Math.floor((30 - j) / 15) * Math.floor((17719 * j) / 50) -
      Math.floor(j / 16) * Math.floor((15238 * j) / 43) +
      29;
    const mH = Math.floor((24 * l3) / 709);
    const dH = l3 - Math.floor((709 * mH) / 24);
    const yH = 30 * n + j - 30;

    const safeMonth = Math.min(Math.max(1, mH), 12);
    const monthId = this.getHijriMonthNameId(safeMonth);

    return {
      day: dH,
      monthNumber: safeMonth,
      monthNameEn: this.getHijriMonthNameEn(safeMonth),
      monthNameAr: this.getHijriMonthNameAr(safeMonth),
      monthNameId: monthId,
      year: yH,
      formatted: `${dH} ${monthId} ${yH} H`,
    };
  }

  // Helpers
  private static degToRad(deg: number): number {
    return (deg * Math.PI) / 180.0;
  }
  private static radToDeg(rad: number): number {
    return (rad * 180.0) / Math.PI;
  }
  private static daysSinceJ2000(date: Date): number {
    return (date.getTime() - 946727999999) / 86400000;
  }
  private static decimalToTime(dec: number): string {
    let hours = Math.floor(dec);
    let minutes = Math.round((dec - hours) * 60);
    if (minutes >= 60) {
      hours += 1;
      minutes -= 60;
    }
    hours = (hours + 24) % 24;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  }

  public static getTimezoneOffsetHours(tzName: string): number {
    if (tzName.includes('Jayapura') || tzName === 'WIT') return 9;
    if (tzName.includes('Makassar') || tzName === 'WITA') return 8;
    if (tzName.includes('Riyadh')) return 3;
    return 7; // Default WIB Asia/Jakarta
  }

  public static getTimeInTimezone(date: Date, tz: string): { hours: number; minutes: number; seconds: number } {
    try {
      const str = date.toLocaleTimeString('en-US', { timeZone: tz, hour12: false });
      const [h, m, s] = str.split(':').map(Number);
      return { hours: h || 0, minutes: m || 0, seconds: s || 0 };
    } catch {
      return { hours: date.getHours(), minutes: date.getMinutes(), seconds: date.getSeconds() };
    }
  }

  public static getHijriMonthNameId(m: number): string {
    const months = [
      'Muharram',
      'Safar',
      'Rabiul Awwal',
      'Rabiul Akhir',
      'Jumadil Awwal',
      'Jumadil Akhir',
      'Rajab',
      'Sya\'ban',
      'Ramadhan',
      'Syawwal',
      'Dzulqa\'dah',
      'Dzulhijjah',
    ];
    return months[m - 1] || 'Muharram';
  }

  public static getHijriMonthNameEn(m: number): string {
    const months = [
      'Muharram',
      'Safar',
      'Rabi al-Awwal',
      'Rabi al-Thani',
      'Jumada al-Awwal',
      'Jumada al-Thani',
      'Rajab',
      'Sha\'ban',
      'Ramadan',
      'Shawwal',
      'Dhu al-Qi\'dah',
      'Dhu al-Hijjah',
    ];
    return months[m - 1] || 'Muharram';
  }

  public static getHijriMonthNameAr(m: number): string {
    const months = [
      'محرم',
      'صفر',
      'ربيع الأول',
      'ربيع الآخر',
      'جمادى الأولى',
      'جمادى الآخرة',
      'رجب',
      'شعبان',
      'رمضان',
      'شوال',
      'ذو القعدة',
      'ذو الحجة',
    ];
    return months[m - 1] || 'محرم';
  }
}
