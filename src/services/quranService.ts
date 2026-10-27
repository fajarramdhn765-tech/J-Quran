import { APP_CONFIG } from '../config/appConfig';
import { SurahDetail, SurahSummary, TafsirDetail } from '../types';
import { FALLBACK_SURAH_1, FALLBACK_SURAH_112, FALLBACK_SURAHS, FALLBACK_TAFSIR_1 } from './quranFallbackData';

const CACHE_KEY_SURAHS = 'jayz_quran_cache_surahs_v2';
const CACHE_PREFIX_SURAH = 'jayz_quran_cache_surah_';
const CACHE_PREFIX_TAFSIR = 'jayz_quran_cache_tafsir_';

export class QuranService {
  private static surahsMemoryCache: SurahSummary[] | null = null;
  private static surahDetailMemoryCache = new Map<number, SurahDetail>();
  private static tafsirMemoryCache = new Map<number, TafsirDetail>();

  /**
   * Fetch all 114 Surahs with multi-tier cache (Memory -> Storage -> Network -> Fallback)
   */
  static async getSurahList(): Promise<{ surahs: SurahSummary[]; isFromCache: boolean }> {
    if (this.surahsMemoryCache && this.surahsMemoryCache.length === 114) {
      return { surahs: this.surahsMemoryCache, isFromCache: true };
    }

    // Try localStorage
    try {
      const cached = localStorage.getItem(CACHE_KEY_SURAHS);
      if (cached) {
        const parsed = JSON.parse(cached) as SurahSummary[];
        if (Array.isArray(parsed) && parsed.length === 114) {
          this.surahsMemoryCache = parsed;
          // Refresh asynchronously in background
          this.refreshSurahListBackground();
          return { surahs: parsed, isFromCache: true };
        }
      }
    } catch (e) {
      console.warn('Failed to read surah cache', e);
    }

    // Fetch from Network
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const res = await fetch(`${APP_CONFIG.api.quranBaseUrl}/surat`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      if (json && json.code === 200 && Array.isArray(json.data)) {
        const list = json.data as SurahSummary[];
        this.surahsMemoryCache = list;
        try {
          localStorage.setItem(CACHE_KEY_SURAHS, JSON.stringify(list));
        } catch (e) {
          // ignore quota
        }
        return { surahs: list, isFromCache: false };
      }
    } catch (e) {
      console.warn('Network fetch for surahs failed, using built-in fallback data', e);
    }

    // Fallback built-in data
    this.surahsMemoryCache = FALLBACK_SURAHS as SurahSummary[];
    return { surahs: FALLBACK_SURAHS as SurahSummary[], isFromCache: true };
  }

  private static async refreshSurahListBackground(): Promise<void> {
    try {
      const res = await fetch(`${APP_CONFIG.api.quranBaseUrl}/surat`);
      if (res.ok) {
        const json = await res.json();
        if (json.code === 200 && Array.isArray(json.data)) {
          this.surahsMemoryCache = json.data;
          localStorage.setItem(CACHE_KEY_SURAHS, JSON.stringify(json.data));
        }
      }
    } catch {
      // quiet fail for background refresh
    }
  }

  /**
   * Fetch detail of a single surah with all ayat and audio
   */
  static async getSurahDetail(nomor: number): Promise<{ data: SurahDetail; isFromCache: boolean }> {
    // 1. Memory Cache
    if (this.surahDetailMemoryCache.has(nomor)) {
      return { data: this.surahDetailMemoryCache.get(nomor)!, isFromCache: true };
    }

    // 2. LocalStorage Cache
    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX_SURAH}${nomor}`);
      if (cached) {
        const parsed = JSON.parse(cached) as SurahDetail;
        if (parsed && parsed.nomor === nomor && parsed.ayat?.length) {
          this.surahDetailMemoryCache.set(nomor, parsed);
          return { data: parsed, isFromCache: true };
        }
      }
    } catch (e) {
      console.warn(`Failed reading cache for surah ${nomor}`, e);
    }

    // 3. Network Fetch
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(`${APP_CONFIG.api.quranBaseUrl}/surat/${nomor}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}: ${res.statusText}`);

      const json = await res.json();
      if (json && json.code === 200 && json.data) {
        const detail = json.data as SurahDetail;
        this.surahDetailMemoryCache.set(nomor, detail);
        try {
          localStorage.setItem(`${CACHE_PREFIX_SURAH}${nomor}`, JSON.stringify(detail));
        } catch (e) {
          // ignore quota
        }
        return { data: detail, isFromCache: false };
      }
    } catch (e) {
      console.warn(`Network fetch failed for surah ${nomor}`, e);
    }

    // 4. Built-in Fallbacks for offline demo
    if (nomor === 1) {
      return { data: FALLBACK_SURAH_1 as unknown as SurahDetail, isFromCache: true };
    }
    if (nomor === 112) {
      return { data: FALLBACK_SURAH_112 as unknown as SurahDetail, isFromCache: true };
    }

    throw new Error(`Tidak dapat memuat Surat nomor ${nomor}. Periksa koneksi internet Anda.`);
  }

  /**
   * Fetch tafsir for a surah
   */
  static async getTafsir(nomor: number): Promise<{ data: TafsirDetail; isFromCache: boolean }> {
    if (this.tafsirMemoryCache.has(nomor)) {
      return { data: this.tafsirMemoryCache.get(nomor)!, isFromCache: true };
    }

    try {
      const cached = localStorage.getItem(`${CACHE_PREFIX_TAFSIR}${nomor}`);
      if (cached) {
        const parsed = JSON.parse(cached) as TafsirDetail;
        if (parsed && parsed.nomor === nomor) {
          this.tafsirMemoryCache.set(nomor, parsed);
          return { data: parsed, isFromCache: true };
        }
      }
    } catch {}

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 9000);

      const res = await fetch(`${APP_CONFIG.api.quranBaseUrl}/tafsir/${nomor}`, {
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (!res.ok) throw new Error(`HTTP ${res.status}`);

      const json = await res.json();
      if (json && json.code === 200 && json.data) {
        const tafsir = json.data as TafsirDetail;
        this.tafsirMemoryCache.set(nomor, tafsir);
        try {
          localStorage.setItem(`${CACHE_PREFIX_TAFSIR}${nomor}`, JSON.stringify(tafsir));
        } catch {}
        return { data: tafsir, isFromCache: false };
      }
    } catch (e) {
      console.warn(`Failed fetching tafsir for surah ${nomor}`, e);
    }

    if (nomor === 1) {
      return { data: FALLBACK_TAFSIR_1 as unknown as TafsirDetail, isFromCache: true };
    }

    throw new Error(`Tafsir Surat ${nomor} sedang tidak tersedia offline.`);
  }

  /**
   * Filter surahs by search query
   */
  static filterSurahs(surahs: SurahSummary[], query: string): SurahSummary[] {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;

    return surahs.filter((s) => {
      const matchesNum = s.nomor.toString() === q;
      const matchesLatin = s.namaLatin.toLowerCase().includes(q);
      const matchesArab = s.nama.includes(q);
      const matchesArti = s.arti.toLowerCase().includes(q);
      return matchesNum || matchesLatin || matchesArab || matchesArti;
    });
  }

  /**
   * Curated Ayat of the Day
   */
  static getDailyAyah(): {
    surahNumber: number;
    surahName: string;
    ayatNumber: number;
    arab: string;
    translation: string;
  } {
    const dailyList = [
      {
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        ayatNumber: 286,
        arab: 'لَا يُكَلِّفُ اللّٰهُ نَفْسًا اِلَّا وُسْعَهَا',
        translation: 'Allah tidak membebani seseorang melainkan sesuai dengan kesanggupannya.',
      },
      {
        surahNumber: 94,
        surahName: 'Al-Insyirah',
        ayatNumber: 6,
        arab: 'اِنَّ مَعَ الْعُسْرِ يُسْرًا',
        translation: 'Sesungguhnya bersama kesulitan ada kemudahan.',
      },
      {
        surahNumber: 13,
        surahName: 'Ar-Ra’d',
        ayatNumber: 28,
        arab: 'اَلَا بِذِكْرِ اللّٰهِ تَطْمَىِٕنُّ الْقُلُوْبُ',
        translation: 'Ingatlah, hanya dengan mengingat Allah hati menjadi tenteram.',
      },
      {
        surahNumber: 65,
        surahName: 'At-Talaq',
        ayatNumber: 3,
        arab: 'وَّيَرْزُقْهُ مِنْ حَيْثُ لَا يَحْتَسِبُ',
        translation: 'Dan Dia memberinya rezeki dari arah yang tidak disangka-sangkanya.',
      },
      {
        surahNumber: 2,
        surahName: 'Al-Baqarah',
        ayatNumber: 152,
        arab: 'فَاذْكُرُوْنِيْٓ اَذْكُرْكُمْ وَاشْكُرُوْا لِيْ وَلَا تَكْفُرُوْنِ',
        translation: 'Maka ingatlah kepada-Ku, Aku pun akan ingat kepadamu. Bersyukurlah kepada-Ku, dan janganlah kamu ingkar kepada-Ku.',
      },
    ];

    const dayOfYear = Math.floor(
      (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24)
    );
    return dailyList[dayOfYear % dailyList.length];
  }
}
