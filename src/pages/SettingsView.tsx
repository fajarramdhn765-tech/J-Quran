import React, { useState, useRef } from 'react';
import {
  Settings,
  BookOpen,
  Volume2,
  Clock,
  Bell,
  Moon,
  Sun,
  Download,
  Upload,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  ExternalLink,
  Check,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { APP_CONFIG } from '../config/appConfig';
import { UserSettings } from '../types';
import { StorageService, DEFAULT_SETTINGS } from '../storage/storageService';
import { NotificationService } from '../services/notificationService';
import { AudioService } from '../services/audioService';
import { PWAInstallButton } from '../components/PWAInstallButton';

interface SettingsViewProps {
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onResetAllData: () => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  onUpdateSettings,
  onResetAllData,
}) => {
  const [exportSuccess, setExportSuccess] = useState(false);
  const [importStatus, setImportStatus] = useState<'success' | 'error' | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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
          'Pengingat waktu salat aktif!'
        );
      }
    } else {
      onUpdateSettings({ ...settings, notificationEnabled: false });
    }
  };

  const handleExportData = () => {
    const jsonStr = StorageService.exportBackup();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jayz-quran-backup-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportSuccess(true);
    setTimeout(() => setExportSuccess(false), 3000);
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      const success = StorageService.importBackup(content);
      if (success) {
        setImportStatus('success');
        onUpdateSettings(StorageService.getSettings());
      } else {
        setImportStatus('error');
      }
      setTimeout(() => setImportStatus(null), 3500);
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="space-y-6 pb-28 animate-fade-in max-w-3xl mx-auto">
      {/* Title */}
      <div>
        <h2 className="text-xl font-black text-[#064B32] dark:text-[#E8F0EC] sm:text-2xl">
          Pengaturan Aplikasi
        </h2>
        <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
          Kustomisasi tilawah, suara murottal, jadwal salat, dan data aplikasi
        </p>
      </div>

      {/* 1. Tilawah Preferences */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-[#E9B949]" />
          Preferensi Tampilan Tilawah
        </h3>

        <div className="space-y-4 text-xs">
          {/* Arabic Font Family */}
          <div>
            <label className="font-semibold block mb-1">Jenis Font Arab (Mushaf):</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, arabicFontFamily: 'amiri' })}
                className={`p-3 rounded-xl border text-center transition ${
                  settings.arabicFontFamily === 'amiri'
                    ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-bold dark:bg-[#1E3A2F] dark:border-[#34D399] dark:text-[#34D399]'
                    : 'border-[#DCE5DD] hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]'
                }`}
              >
                <span className="font-arabic text-xl block mb-1">القرآن الكريم</span>
                <span>Amiri (Standar Mushaf)</span>
              </button>
              <button
                onClick={() =>
                  onUpdateSettings({ ...settings, arabicFontFamily: 'scheherazade' })
                }
                className={`p-3 rounded-xl border text-center transition ${
                  settings.arabicFontFamily === 'scheherazade'
                    ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-bold dark:bg-[#1E3A2F] dark:border-[#34D399] dark:text-[#34D399]'
                    : 'border-[#DCE5DD] hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]'
                }`}
              >
                <span className="font-arabic-scheherazade text-xl block mb-1">القرآن الكريم</span>
                <span>Scheherazade New</span>
              </button>
            </div>
          </div>

          {/* Sliders */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Ukuran Huruf Arab:</span>
                <span className="text-[#064B32] dark:text-[#34D399] font-bold">
                  {settings.arabicFontSize} px
                </span>
              </div>
              <input
                type="range"
                min="22"
                max="44"
                step="2"
                value={settings.arabicFontSize}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, arabicFontSize: parseInt(e.target.value, 10) })
                }
                className="w-full accent-[#064B32]"
              />
            </div>

            <div>
              <div className="flex justify-between font-semibold mb-1">
                <span>Ukuran Terjemahan:</span>
                <span className="text-[#064B32] dark:text-[#34D399] font-bold">
                  {settings.translationFontSize} px
                </span>
              </div>
              <input
                type="range"
                min="13"
                max="22"
                step="1"
                value={settings.translationFontSize}
                onChange={(e) =>
                  onUpdateSettings({
                    ...settings,
                    translationFontSize: parseInt(e.target.value, 10),
                  })
                }
                className="w-full accent-[#064B32]"
              />
            </div>
          </div>

          {/* Visibility Toggles */}
          <div className="pt-2 border-t border-[#DCE5DD] dark:border-[#1F4535] space-y-2">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[#09251B] dark:text-white">
                Tampilkan Terjemahan Bahasa Indonesia
              </span>
              <input
                type="checkbox"
                checked={settings.showTranslation}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showTranslation: e.target.checked })
                }
                className="h-4 w-4 accent-[#064B32]"
              />
            </label>

            <label className="flex items-center justify-between cursor-pointer">
              <span className="font-medium text-[#09251B] dark:text-white">
                Tampilkan Transliterasi Latin
              </span>
              <input
                type="checkbox"
                checked={settings.showLatin}
                onChange={(e) =>
                  onUpdateSettings({ ...settings, showLatin: e.target.checked })
                }
                className="h-4 w-4 accent-[#064B32]"
              />
            </label>
          </div>
        </div>
      </section>

      {/* 2. Audio Murottal Qari */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <Volume2 className="h-4 w-4 text-[#E9B949]" />
          Pilihan Qari Murottal
        </h3>

        <div className="space-y-2 text-xs">
          <label className="font-semibold block mb-1">Pilih Qari Utama:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {APP_CONFIG.qaris.map((q) => {
              const isSelected = settings.selectedQari === q.id;
              return (
                <button
                  key={q.id}
                  onClick={() => {
                    onUpdateSettings({ ...settings, selectedQari: q.id });
                    AudioService.setQari(q.id);
                  }}
                  className={`p-3 rounded-xl border text-left flex items-center justify-between transition ${
                    isSelected
                      ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-bold dark:bg-[#1E3A2F] dark:border-[#34D399] dark:text-[#34D399]'
                      : 'border-[#DCE5DD] hover:bg-[#F5F7F2] text-[#09251B] dark:border-[#1F4535] dark:bg-[#0E241B] dark:text-white dark:hover:bg-[#153327]'
                  }`}
                >
                  <div>
                    <p className="font-semibold">{q.name}</p>
                    <p className="font-arabic text-sm text-[#52665B] dark:text-[#9DB5AA]">
                      {q.arabicName}
                    </p>
                  </div>
                  {isSelected && <Check className="h-4 w-4 text-[#064B32] dark:text-[#34D399]" />}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* 3. Prayer Calculation Method */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <Clock className="h-4 w-4 text-[#E9B949]" />
          Metode Hisab & Jadwal Salat
        </h3>

        <div className="space-y-3 text-xs">
          <div>
            <label className="font-semibold block mb-1">Metode Perhitungan:</label>
            <select
              value={settings.prayerMethod}
              onChange={(e) =>
                onUpdateSettings({ ...settings, prayerMethod: e.target.value })
              }
              className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-2.5 font-semibold text-[#09251B] outline-none dark:border-[#1F4535] dark:bg-[#153327] dark:text-white"
            >
              {APP_CONFIG.prayerMethods.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="font-semibold block mb-1">Madzhab Waktu Asar:</label>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => onUpdateSettings({ ...settings, asrJuristic: 'standard' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  settings.asrJuristic === 'standard'
                    ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-bold dark:bg-[#1E3A2F] dark:border-[#34D399] dark:text-[#34D399]'
                    : 'border-[#DCE5DD] hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]'
                }`}
              >
                <span>Standar / Syafi'i (1x)</span>
              </button>
              <button
                onClick={() => onUpdateSettings({ ...settings, asrJuristic: 'hanafi' })}
                className={`p-2.5 rounded-xl border text-center transition ${
                  settings.asrJuristic === 'hanafi'
                    ? 'border-[#064B32] bg-[#FFF4D6] text-[#064B32] font-bold dark:bg-[#1E3A2F] dark:border-[#34D399] dark:text-[#34D399]'
                    : 'border-[#DCE5DD] hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:hover:bg-[#153327]'
                }`}
              >
                <span>Hanafi (2x Panjang Bayangan)</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Notification & Adhan Settings */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <Bell className="h-4 w-4 text-[#E9B949]" />
          Pengingat Waktu Salat
        </h3>

        <div className="space-y-3 text-xs">
          <div className="flex items-center justify-between p-3 rounded-xl bg-[#F5F7F2] dark:bg-[#153327]">
            <div>
              <p className="font-bold text-[#09251B] dark:text-white">
                Notifikasi Pengingat Adzan
              </p>
              <p className="text-[11px] text-[#52665B] dark:text-[#9DB5AA]">
                Bunyikan lonceng dan tampilkan notifikasi saat azan tiba
              </p>
            </div>
            <button
              onClick={handleToggleNotification}
              className={`rounded-xl px-3.5 py-1.5 font-bold transition ${
                settings.notificationEnabled
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-200 text-gray-700 dark:bg-gray-700 dark:text-gray-200'
              }`}
            >
              {settings.notificationEnabled ? 'Aktif' : 'Nonaktif'}
            </button>
          </div>

          <div className="flex items-center justify-between pt-2">
            <span className="font-semibold">Uji Suara Panggilan Salat:</span>
            <button
              onClick={handleTestAdhan}
              className="flex items-center gap-1.5 rounded-xl bg-[#064B32] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#08784F]"
            >
              <Volume2 className="h-3.5 w-3.5" />
              <span>Tes Audio</span>
            </button>
          </div>
        </div>
      </section>

      {/* 5. PWA & Android Deployment Information */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-3">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <Smartphone className="h-4 w-4 text-[#E9B949]" />
          PWA & Android App
        </h3>

        <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
          Jay'z Quran mendukung pemasangan langsung sebagai Progressive Web App (PWA) di
          Android, iOS, dan Desktop, serta siap dikompilasi menjadi APK melalui Capacitor.
        </p>

        <div className="flex flex-wrap gap-2 pt-1">
          <PWAInstallButton />
        </div>

        <div className="rounded-xl bg-[#FFF4D6] p-3 text-[11px] text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24] border border-[#E9B949]/30">
          <p className="font-bold">Panduan Build APK Android:</p>
          <p className="mt-0.5">
            1. Jalankan <code className="font-mono bg-white/70 px-1 rounded">npm run build</code><br />
            2. Inisialisasi Capacitor: <code className="font-mono bg-white/70 px-1 rounded">npx cap init "Jay'z Quran" "com.jayz.quran"</code><br />
            3. Tambahkan Android: <code className="font-mono bg-white/70 px-1 rounded">npx cap add android && npx cap sync</code><br />
            4. Buka di Android Studio: <code className="font-mono bg-white/70 px-1 rounded">npx cap open android</code> lalu Build APK.
          </p>
        </div>
      </section>

      {/* 6. Data Backup & Reset */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-white p-5 shadow-xs dark:border-[#1F4535] dark:bg-[#0E241B] space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399] flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-[#E9B949]" />
          Penyimpanan & Cadangan Data
        </h3>

        <div className="space-y-3 text-xs">
          <p className="text-[#52665B] dark:text-[#9DB5AA]">
            Seluruh bookmark, catatan, lokasi, dan preferensi Anda disimpan lokal di peramban
            ini tanpa mengirim data pribadi ke server eksternal.
          </p>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={handleExportData}
              className="flex items-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] px-3.5 py-2 font-semibold text-[#064B32] hover:bg-white dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#34D399]"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Ekspor Cadangan (JSON)</span>
            </button>

            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] px-3.5 py-2 font-semibold text-[#064B32] hover:bg-white dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#34D399]"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Impor Cadangan</span>
            </button>
            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleImportFile}
              className="hidden"
            />

            <button
              onClick={() => setShowResetConfirm(true)}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3.5 py-2 font-semibold text-red-600 hover:bg-red-100 dark:border-red-900 dark:bg-red-950/40 dark:text-red-400"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span>Reset Data</span>
            </button>
          </div>

          {exportSuccess && (
            <p className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="h-4 w-4" /> File cadangan JSON berhasil diunduh.
            </p>
          )}

          {importStatus === 'success' && (
            <p className="text-emerald-600 font-semibold flex items-center gap-1">
              <Check className="h-4 w-4" /> Data cadangan berhasil dipulihkan!
            </p>
          )}

          {importStatus === 'error' && (
            <p className="text-red-500 font-semibold flex items-center gap-1">
              <AlertCircle className="h-4 w-4" /> Format file JSON tidak valid.
            </p>
          )}
        </div>
      </section>

      {/* 7. About Application */}
      <section className="rounded-2xl border border-[#DCE5DD] bg-[#F5F7F2] p-5 text-center dark:border-[#1F4535] dark:bg-[#153327] space-y-2">
        <h4 className="text-base font-extrabold text-[#064B32] dark:text-white">
          {APP_CONFIG.name} — Versi {APP_CONFIG.version}
        </h4>
        <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
          {APP_CONFIG.tagline}
        </p>
        <p className="text-[11px] text-[#52665B] dark:text-[#9DB5AA] max-w-md mx-auto">
          Sumber Data Teks Al-Qur'an & Tafsir: Kementerian Agama Republik Indonesia (equran.id API v2).
          Jadwal Salat: Formula hisab astronomis standar Kemenag RI & Aladhan API.
        </p>
      </section>

      {/* Reset Confirmation Dialog */}
      {showResetConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#0E241B] border border-red-200">
            <h4 className="text-base font-bold text-red-600">Konfirmasi Reset Data</h4>
            <p className="mt-2 text-xs text-[#52665B] dark:text-[#9DB5AA]">
              Semua bookmark, catatan pribadi, dan riwayat bacaan akan dihapus dari penyimpanan
              lokal perangkat ini. Tindakan ini tidak dapat dibatalkan.
            </p>
            <div className="mt-4 flex justify-end gap-2">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="rounded-xl px-4 py-2 text-xs font-semibold text-gray-600 hover:bg-gray-100 dark:text-gray-300"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  onResetAllData();
                  setShowResetConfirm(false);
                }}
                className="rounded-xl bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700"
              >
                Ya, Reset Semua
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
