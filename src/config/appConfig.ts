export interface CityLocation {
  name: string;
  province: string;
  latitude: number;
  longitude: number;
  timezone: string; // e.g. 'Asia/Jakarta', 'Asia/Makassar', 'Asia/Jayapura'
  tzLabel: string; // 'WIB', 'WITA', 'WIT'
}

export interface QariInfo {
  id: string;
  name: string;
  arabicName: string;
}

export interface PrayerMethodConfig {
  id: string;
  name: string;
  description: string;
  fajrAngle: number;
  ishaAngle: number;
}

export const APP_CONFIG = {
  name: "Jay'z Quran",
  tagline: "Temukan Kedamaian dalam Tilawah",
  version: "2.0.0",
  description: "Platform Al-Qur'an Digital Premium, Jadwal Salat, Kalender Hijriah & Murottal",
  api: {
    quranBaseUrl: "https://equran.id/api/v2",
    aladhanBaseUrl: "https://api.aladhan.com/v1",
  },
  theme: {
    emerald: "#064B32",
    emeraldLight: "#08784F",
    forestDark: "#09251B",
    royalGold: "#E9B949",
    warmIvory: "#FFF4D6",
    appBg: "#FFFDF5",
    surface: "#FFFFFF",
    surfaceMuted: "#F5F7F2",
    border: "#DCE5DD",
  },
  defaultLocation: {
    name: "Jakarta",
    province: "DKI Jakarta",
    latitude: -6.2088,
    longitude: 106.8456,
    timezone: "Asia/Jakarta",
    tzLabel: "WIB",
  } as CityLocation,
  defaultQari: "05", // Misyari Rasyid Al-Afasi
  qaris: [
    { id: "01", name: "Abdullah Al-Juhany", arabicName: "عبدالله الجهني" },
    { id: "02", name: "Abdul-Muhsin Al-Qasim", arabicName: "عبد المحسن القاسم" },
    { id: "03", name: "Abdurrahman as-Sudais", arabicName: "عبد الرحمن السديس" },
    { id: "04", name: "Ibrahim Al-Dossari", arabicName: "إبراهيم الدوسري" },
    { id: "05", name: "Misyari Rasyid Al-Afasi", arabicName: "مشاري راشد العفاسي" },
    { id: "06", name: "Yasser Al-Dosari", arabicName: "ياسر الدوسري" },
  ] as QariInfo[],
  prayerMethods: [
    {
      id: "kemenag",
      name: "Kementerian Agama RI (Standar Indonesia)",
      description: "Sudut Subuh 20°, Sudut Isya 18°, Ihtiyat 2 menit",
      fajrAngle: 20,
      ishaAngle: 18,
    },
    {
      id: "mwl",
      name: "Muslim World League (Liga Muslim Dunia)",
      description: "Sudut Subuh 18°, Sudut Isya 17°",
      fajrAngle: 18,
      ishaAngle: 17,
    },
    {
      id: "egypt",
      name: "Egyptian General Authority of Survey",
      description: "Sudut Subuh 19.5°, Sudut Isya 17.5°",
      fajrAngle: 19.5,
      ishaAngle: 17.5,
    },
    {
      id: "makkah",
      name: "Umm Al-Qura, Makkah",
      description: "Sudut Subuh 18.5°, Isya 90 menit setelah Maghrib",
      fajrAngle: 18.5,
      ishaAngle: 19,
    },
  ] as PrayerMethodConfig[],
  cities: [
    { name: "Jakarta", province: "DKI Jakarta", latitude: -6.2088, longitude: 106.8456, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Surabaya", province: "Jawa Timur", latitude: -7.2575, longitude: 112.7521, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Bandung", province: "Jawa Barat", latitude: -6.9175, longitude: 107.6191, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Medan", province: "Sumatera Utara", latitude: 3.5952, longitude: 98.6722, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Semarang", province: "Jawa Tengah", latitude: -6.9667, longitude: 110.4167, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Makassar", province: "Sulawesi Selatan", latitude: -5.1477, longitude: 119.4327, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Palembang", province: "Sumatera Selatan", latitude: -2.9909, longitude: 104.7565, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Tangerang", province: "Banten", latitude: -6.1783, longitude: 106.6319, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Depok", province: "Jawa Barat", latitude: -6.4025, longitude: 106.7942, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Bekasi", province: "Jawa Barat", latitude: -6.2383, longitude: 106.9756, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Bogor", province: "Jawa Barat", latitude: -6.5971, longitude: 106.8060, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Denpasar", province: "Bali", latitude: -8.6705, longitude: 115.2126, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Yogyakarta", province: "DI Yogyakarta", latitude: -7.7956, longitude: 110.3695, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Surakarta (Solo)", province: "Jawa Tengah", latitude: -7.5755, longitude: 110.8243, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Malang", province: "Jawa Timur", latitude: -7.9666, longitude: 112.6326, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Banda Aceh", province: "Aceh", latitude: 5.5483, longitude: 95.3238, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Padang", province: "Sumatera Barat", latitude: -0.9471, longitude: 100.4172, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Pekanbaru", province: "Riau", latitude: 0.5071, longitude: 101.4478, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Batam", province: "Kepulauan Riau", latitude: 1.1294, longitude: 104.0530, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Jambi", province: "Jambi", latitude: -1.6101, longitude: 103.6131, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Bengkulu", province: "Bengkulu", latitude: -3.7928, longitude: 102.2608, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Bandar Lampung", province: "Lampung", latitude: -5.4500, longitude: 105.2667, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Pangkal Pinang", province: "Kep. Bangka Belitung", latitude: -2.1316, longitude: 106.1169, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Pontianak", province: "Kalimantan Barat", latitude: -0.0263, longitude: 109.3425, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Banjarmasin", province: "Kalimantan Selatan", latitude: -3.3194, longitude: 114.5908, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Samarinda", province: "Kalimantan Timur", latitude: -0.5022, longitude: 117.1537, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Balikpapan", province: "Kalimantan Timur", latitude: -1.2379, longitude: 116.8289, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Palangkaraya", province: "Kalimantan Tengah", latitude: -2.2161, longitude: 113.9140, timezone: "Asia/Jakarta", tzLabel: "WIB" },
    { name: "Tarakan", province: "Kalimantan Utara", latitude: 3.3270, longitude: 117.5786, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Manado", province: "Sulawesi Utara", latitude: 1.4748, longitude: 124.8421, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Palu", province: "Sulawesi Tengah", latitude: -0.9003, longitude: 119.8780, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Kendari", province: "Sulawesi Tenggara", latitude: -3.9985, longitude: 122.5126, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Gorontalo", province: "Gorontalo", latitude: 0.5435, longitude: 123.0568, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Mamuju", province: "Sulawesi Barat", latitude: -2.6738, longitude: 118.8885, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Mataram", province: "Nusa Tenggara Barat", latitude: -8.5833, longitude: 116.1167, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Kupang", province: "Nusa Tenggara Timur", latitude: -10.1772, longitude: 123.6070, timezone: "Asia/Makassar", tzLabel: "WITA" },
    { name: "Ambon", province: "Maluku", latitude: -3.6547, longitude: 128.1906, timezone: "Asia/Jayapura", tzLabel: "WIT" },
    { name: "Ternate", province: "Maluku Utara", latitude: 0.7905, longitude: 127.3800, timezone: "Asia/Jayapura", tzLabel: "WIT" },
    { name: "Jayapura", province: "Papua", latitude: -2.5916, longitude: 140.6690, timezone: "Asia/Jayapura", tzLabel: "WIT" },
    { name: "Manokwari", province: "Papua Barat", latitude: -0.8615, longitude: 134.0620, timezone: "Asia/Jayapura", tzLabel: "WIT" },
    { name: "Sorong", province: "Papua Barat Daya", latitude: -0.8762, longitude: 131.2558, timezone: "Asia/Jayapura", tzLabel: "WIT" },
    { name: "Mekkah", province: "Arab Saudi", latitude: 21.4225, longitude: 39.8262, timezone: "Asia/Riyadh", tzLabel: "AST" },
    { name: "Madinah", province: "Arab Saudi", latitude: 24.4672, longitude: 39.6111, timezone: "Asia/Riyadh", tzLabel: "AST" },
  ] as CityLocation[],
};
