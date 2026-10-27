import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  Play,
  Pause,
  Bookmark,
  Share2,
  FileText,
  Sliders,
  ChevronLeft,
  ChevronRight,
  Check,
  Volume2,
  ArrowUp,
  X,
  Loader2,
  AlertCircle,
  Sparkles,
} from 'lucide-react';
import { Ayat, BookmarkItem, SurahDetail, SurahSummary, UserSettings } from '../types';
import { QuranService } from '../services/quranService';
import { AudioService } from '../services/audioService';
import { APP_CONFIG } from '../config/appConfig';
import { StorageService } from '../storage/storageService';
import { TafsirModal } from '../components/TafsirModal';
import { NoteModal } from '../components/NoteModal';

interface QuranViewProps {
  initialSurahNumber?: number;
  initialAyatNumber?: number;
  bookmarks: BookmarkItem[];
  settings: UserSettings;
  onUpdateSettings: (settings: UserSettings) => void;
  onBookmarksChange: (bookmarks: BookmarkItem[]) => void;
}

export const QuranView: React.FC<QuranViewProps> = ({
  initialSurahNumber,
  initialAyatNumber,
  bookmarks,
  settings,
  onUpdateSettings,
  onBookmarksChange,
}) => {
  // Navigation state
  const [selectedSurahNumber, setSelectedSurahNumber] = useState<number | null>(
    initialSurahNumber || null
  );

  // Surahs index state
  const [surahList, setSurahList] = useState<SurahSummary[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [placeFilter, setPlaceFilter] = useState<'all' | 'Mekah' | 'Madinah'>('all');
  const [loadingList, setLoadingList] = useState(true);

  // Reader state
  const [surahDetail, setSurahDetail] = useState<SurahDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [errorDetail, setErrorDetail] = useState<string | null>(null);
  const [activeAyatAudio, setActiveAyatAudio] = useState<number | null>(null);
  const [copiedAyatId, setCopiedAyatId] = useState<number | null>(null);

  // Modals & Panels
  const [showReaderSettings, setShowReaderSettings] = useState(false);
  const [tafsirModalData, setTafsirModalData] = useState<{
    isOpen: boolean;
    ayatNumber: number;
    arabText: string;
    translationText: string;
  }>({
    isOpen: false,
    ayatNumber: 1,
    arabText: '',
    translationText: '',
  });

  const [noteModalData, setNoteModalData] = useState<{
    isOpen: boolean;
    id: string;
    title: string;
    initialNote: string;
  }>({
    isOpen: false,
    id: '',
    title: '',
    initialNote: '',
  });

  // Auto-scroll state
  const [isAutoScrolling, setIsAutoScrolling] = useState(false);
  const autoScrollTimerRef = useRef<number | null>(null);

  // Audio subscription to highlight active playing ayah
  useEffect(() => {
    const unsub = AudioService.subscribe((state) => {
      if (state.surahNumber === selectedSurahNumber && state.isPlaying) {
        setActiveAyatAudio(state.currentAyatNumber);
      } else {
        setActiveAyatAudio(null);
      }
    });
    return unsub;
  }, [selectedSurahNumber]);

  // Load 114 Surahs on mount
  useEffect(() => {
    let isMounted = true;
    setLoadingList(true);
    QuranService.getSurahList()
      .then((res) => {
        if (isMounted) {
          setSurahList(res.surahs);
          setLoadingList(false);
        }
      })
      .catch((err) => {
        if (isMounted) setLoadingList(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  // Load Surah Detail when selectedSurahNumber changes
  useEffect(() => {
    if (!selectedSurahNumber) {
      setSurahDetail(null);
      return;
    }

    let isMounted = true;
    setLoadingDetail(true);
    setErrorDetail(null);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    QuranService.getSurahDetail(selectedSurahNumber)
      .then((res) => {
        if (isMounted) {
          setSurahDetail(res.data);
          setLoadingDetail(false);

          // Save last read
          StorageService.saveLastRead(
            res.data.nomor,
            res.data.namaLatin,
            initialAyatNumber || 1
          );

          // Scroll to initial ayah if specified
          if (initialAyatNumber && initialAyatNumber > 1) {
            setTimeout(() => {
              const el = document.getElementById(`ayat-${initialAyatNumber}`);
              if (el) {
                el.scrollIntoView({ behavior: 'smooth', block: 'center' });
              }
            }, 300);
          }
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorDetail(err.message || 'Gagal memuat surat');
          setLoadingDetail(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [selectedSurahNumber, initialAyatNumber]);

  // Auto-scroll effect
  useEffect(() => {
    if (isAutoScrolling) {
      const step = () => {
        window.scrollBy({ top: settings.autoScrollSpeed, behavior: 'instant' });
        autoScrollTimerRef.current = window.requestAnimationFrame(step);
      };
      autoScrollTimerRef.current = window.requestAnimationFrame(step);
    } else {
      if (autoScrollTimerRef.current) {
        cancelAnimationFrame(autoScrollTimerRef.current);
        autoScrollTimerRef.current = null;
      }
    }
    return () => {
      if (autoScrollTimerRef.current) cancelAnimationFrame(autoScrollTimerRef.current);
    };
  }, [isAutoScrolling, settings.autoScrollSpeed]);

  // Filtered surah list
  const filteredSurahs = QuranService.filterSurahs(surahList, searchQuery).filter((s) => {
    if (placeFilter === 'all') return true;
    return s.tempatTurun.toLowerCase() === placeFilter.toLowerCase();
  });

  const handleCopyAyat = (ayat: Ayat, surahName: string) => {
    const text = `${ayat.teksArab}\n\n"${ayat.teksIndonesia}" (QS. ${surahName}: ${ayat.nomorAyat})`;
    navigator.clipboard.writeText(text);
    setCopiedAyatId(ayat.nomorAyat);
    setTimeout(() => setCopiedAyatId(null), 2000);
  };

  const handleToggleBookmark = (ayat: Ayat, surah: SurahDetail) => {
    const { bookmarks: updated } = StorageService.toggleBookmark(
      surah.nomor,
      surah.namaLatin,
      ayat.nomorAyat,
      ayat.teksArab,
      ayat.teksIndonesia
    );
    onBookmarksChange(updated);
  };

  const isAyatBookmarked = (surahNum: number, ayatNum: number) => {
    return bookmarks.some((b) => b.id === `${surahNum}:${ayatNum}`);
  };

  const getAyatNote = (surahNum: number, ayatNum: number) => {
    return bookmarks.find((b) => b.id === `${surahNum}:${ayatNum}`)?.note;
  };

  // -------------------------------------------------------------
  // VIEW: SURAH READER
  // -------------------------------------------------------------
  if (selectedSurahNumber && surahDetail) {
    const showBismillahBanner = surahDetail.nomor !== 1 && surahDetail.nomor !== 9;

    return (
      <div className="pb-32 animate-fade-in">
        {/* Sticky Sub-Header for Reader */}
        <div className="sticky top-14 z-20 -mx-4 mb-4 flex items-center justify-between border-b border-[#DCE5DD] bg-white/95 px-4 py-2.5 backdrop-blur-md dark:border-[#1F4535] dark:bg-[#0E241B]/95 sm:-mx-6 sm:px-6">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setSelectedSurahNumber(null)}
              className="flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-[#064B32] hover:bg-[#F5F7F2] dark:text-[#34D399] dark:hover:bg-[#153327]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Daftar Surat</span>
            </button>
            <div className="h-4 w-px bg-gray-300 dark:bg-gray-700" />
            <h2 className="text-sm font-bold text-[#09251B] dark:text-white truncate max-w-[140px] sm:max-w-[200px]">
              {surahDetail.nomor}. {surahDetail.namaLatin}
            </h2>
          </div>

          <div className="flex items-center gap-1.5">
            {/* Auto scroll toggle */}
            <button
              onClick={() => setIsAutoScrolling(!isAutoScrolling)}
              title="Gulir Otomatis"
              className={`rounded-lg px-2.5 py-1 text-xs font-semibold transition flex items-center gap-1 ${
                isAutoScrolling
                  ? 'bg-[#E9B949] text-[#09251B]'
                  : 'bg-[#F5F7F2] text-[#064B32] dark:bg-[#153327] dark:text-[#34D399]'
              }`}
            >
              <span>{isAutoScrolling ? 'Jeda' : 'Auto Scroll'}</span>
            </button>

            {/* Play full surah */}
            <button
              onClick={() => {
                AudioService.playFullSurah(
                  surahDetail.nomor,
                  surahDetail.namaLatin,
                  surahDetail.audioFull,
                  surahDetail.jumlahAyat
                );
              }}
              title="Putar Murottal Full Surat"
              className="flex items-center gap-1 rounded-lg bg-[#064B32] px-2.5 py-1 text-xs font-semibold text-white shadow-2xs hover:bg-[#08784F] transition"
            >
              <Play className="h-3 w-3 fill-current" />
              <span className="hidden sm:inline">Murottal</span>
            </button>

            {/* Settings button */}
            <button
              onClick={() => setShowReaderSettings(!showReaderSettings)}
              title="Pengaturan Tilawah"
              className="rounded-lg p-1.5 text-[#52665B] hover:bg-[#F5F7F2] hover:text-[#064B32] dark:text-[#9DB5AA] dark:hover:bg-[#153327] dark:hover:text-white"
            >
              <Sliders className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Reader Settings Drawer */}
        {showReaderSettings && (
          <div className="mb-4 rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-md dark:border-[#1F4535] dark:bg-[#0E241B] animate-slide-down space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#DCE5DD] dark:border-[#1F4535]">
              <span className="text-xs font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399]">
                Pengaturan Tampilan Tilawah
              </span>
              <button
                onClick={() => setShowReaderSettings(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              {/* Arabic Font Size Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Ukuran Teks Arab:</span>
                  <span className="text-[#064B32] dark:text-[#34D399] font-bold">
                    {settings.arabicFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="22"
                  max="44"
                  step="2"
                  value={settings.arabicFontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateSettings({ ...settings, arabicFontSize: val });
                  }}
                  className="w-full accent-[#064B32]"
                />
              </div>

              {/* Translation Font Size Slider */}
              <div>
                <div className="flex justify-between font-semibold mb-1">
                  <span>Ukuran Terjemahan:</span>
                  <span className="text-[#064B32] dark:text-[#34D399] font-bold">
                    {settings.translationFontSize}px
                  </span>
                </div>
                <input
                  type="range"
                  min="13"
                  max="22"
                  step="1"
                  value={settings.translationFontSize}
                  onChange={(e) => {
                    const val = parseInt(e.target.value, 10);
                    onUpdateSettings({ ...settings, translationFontSize: val });
                  }}
                  className="w-full accent-[#064B32]"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center justify-between py-1">
                <span className="font-medium">Tampilkan Terjemahan</span>
                <input
                  type="checkbox"
                  checked={settings.showTranslation}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, showTranslation: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#064B32]"
                />
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="font-medium">Tampilkan Transliterasi (Latin)</span>
                <input
                  type="checkbox"
                  checked={settings.showLatin}
                  onChange={(e) =>
                    onUpdateSettings({ ...settings, showLatin: e.target.checked })
                  }
                  className="h-4 w-4 accent-[#064B32]"
                />
              </div>

              {/* Qari selector */}
              <div className="sm:col-span-2 flex flex-col gap-1">
                <span className="font-semibold">Pilihan Qari Audio:</span>
                <select
                  value={settings.selectedQari}
                  onChange={(e) => {
                    onUpdateSettings({ ...settings, selectedQari: e.target.value });
                    AudioService.setQari(e.target.value);
                  }}
                  className="rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-2 text-xs font-semibold text-[#09251B] outline-none dark:border-[#1F4535] dark:bg-[#153327] dark:text-white"
                >
                  {APP_CONFIG.qaris.map((q) => (
                    <option key={q.id} value={q.id}>
                      {q.name} ({q.arabicName})
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Surah Header Card */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#064B32] via-[#08784F] to-[#043322] p-6 text-center text-white shadow-xl ring-1 ring-[#E9B949]/30 mb-6">
          <div className="pointer-events-none absolute inset-0 opacity-10 bg-islamic-pattern" />

          <span className="inline-block rounded-full bg-[#E9B949] px-3 py-0.5 text-xs font-bold text-[#09251B]">
            Surat ke-{surahDetail.nomor} • {surahDetail.tempatTurun}
          </span>

          <h2 className="mt-3 text-3xl font-extrabold sm:text-4xl">{surahDetail.namaLatin}</h2>
          <p className="font-arabic text-3xl sm:text-4xl text-[#E9B949] my-2">
            {surahDetail.nama}
          </p>
          <p className="text-xs sm:text-sm text-[#FFF4D6]/90 font-medium max-w-lg mx-auto">
            Artinya: "{surahDetail.arti}" • {surahDetail.jumlahAyat} Ayat
          </p>
        </div>

        {/* Decorative Bismillah Banner (for Surah 2-8, 10-114) */}
        {showBismillahBanner && (
          <div className="my-6 text-center rounded-2xl border border-[#E9B949]/30 bg-[#FFFDF5] p-5 dark:bg-[#0E241B] dark:border-[#1F4535] shadow-2xs">
            <p className="font-arabic text-3xl sm:text-4xl text-[#064B32] dark:text-[#34D399]">
              بِسْمِ اللّٰهِ الرَّحْمٰنِ الرَّحِيْمِ
            </p>
            <p className="mt-2 text-xs text-[#52665B] dark:text-[#9DB5AA] italic">
              Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang
            </p>
          </div>
        )}

        {/* Ayat List */}
        <div className="space-y-4">
          {surahDetail.ayat.map((ayat) => {
            const isBookmarked = isAyatBookmarked(surahDetail.nomor, ayat.nomorAyat);
            const userNote = getAyatNote(surahDetail.nomor, ayat.nomorAyat);
            const isPlayingThis = activeAyatAudio === ayat.nomorAyat;

            return (
              <div
                key={ayat.nomorAyat}
                id={`ayat-${ayat.nomorAyat}`}
                className={`rounded-2xl border p-4 sm:p-5 transition-all duration-200 ${
                  isPlayingThis
                    ? 'border-[#E9B949] bg-[#FFF4D6]/40 dark:bg-[#1E3A2F]/60 ring-2 ring-[#E9B949]/50 shadow-md'
                    : 'border-[#DCE5DD] bg-white hover:border-[#064B32]/40 dark:border-[#1F4535] dark:bg-[#0E241B]'
                }`}
              >
                {/* Action Toolbar Header for each Ayah */}
                <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD]/60 dark:border-[#1F4535]/60">
                  {/* Ayah Medal Number */}
                  <div className="flex items-center gap-2">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-[#FFF4D6] font-bold text-xs text-[#064B32] ring-1 ring-[#E9B949]/40 dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                      {ayat.nomorAyat}
                    </div>
                    <span className="text-[11px] font-semibold text-[#52665B] dark:text-[#9DB5AA]">
                      QS. {surahDetail.namaLatin}: {ayat.nomorAyat}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 text-[#52665B] dark:text-[#9DB5AA]">
                    {/* Play Ayah Audio */}
                    <button
                      onClick={() => {
                        AudioService.playAyat(
                          surahDetail.nomor,
                          surahDetail.namaLatin,
                          ayat,
                          surahDetail.ayat,
                          ayat.nomorAyat - 1
                        );
                      }}
                      title="Dengarkan Ayat Ini"
                      className={`rounded-lg p-1.5 transition ${
                        isPlayingThis
                          ? 'bg-[#064B32] text-white dark:bg-[#10B981]'
                          : 'hover:bg-[#F5F7F2] hover:text-[#064B32] dark:hover:bg-[#153327]'
                      }`}
                    >
                      <Volume2 className="h-4 w-4" />
                    </button>

                    {/* Bookmark Toggle */}
                    <button
                      onClick={() => handleToggleBookmark(ayat, surahDetail)}
                      title={isBookmarked ? 'Hapus Bookmark' : 'Simpan Bookmark'}
                      className={`rounded-lg p-1.5 transition ${
                        isBookmarked
                          ? 'text-[#E9B949]'
                          : 'hover:bg-[#F5F7F2] hover:text-[#064B32] dark:hover:bg-[#153327]'
                      }`}
                    >
                      <Bookmark
                        className={`h-4 w-4 ${isBookmarked ? 'fill-[#E9B949]' : ''}`}
                      />
                    </button>

                    {/* Tafsir */}
                    <button
                      onClick={() => {
                        setTafsirModalData({
                          isOpen: true,
                          ayatNumber: ayat.nomorAyat,
                          arabText: ayat.teksArab,
                          translationText: ayat.teksIndonesia,
                        });
                      }}
                      title="Baca Tafsir Kemenag"
                      className="rounded-lg p-1.5 hover:bg-[#F5F7F2] hover:text-[#064B32] dark:hover:bg-[#153327] transition"
                    >
                      <FileText className="h-4 w-4" />
                    </button>

                    {/* Copy */}
                    <button
                      onClick={() => handleCopyAyat(ayat, surahDetail.namaLatin)}
                      title="Salin Ayat & Terjemahan"
                      className="rounded-lg p-1.5 hover:bg-[#F5F7F2] hover:text-[#064B32] dark:hover:bg-[#153327] transition"
                    >
                      {copiedAyatId === ayat.nomorAyat ? (
                        <Check className="h-4 w-4 text-emerald-600" />
                      ) : (
                        <Share2 className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Arabic Text */}
                <div className="py-4">
                  <p
                    className={`${
                      settings.arabicFontFamily === 'scheherazade'
                        ? 'font-arabic-scheherazade'
                        : 'font-arabic'
                    } text-[#064B32] dark:text-[#E8F0EC]`}
                    style={{ fontSize: `${settings.arabicFontSize}px` }}
                  >
                    {ayat.teksArab}
                  </p>
                </div>

                {/* Transliteration (Latin) */}
                {settings.showLatin && (
                  <p className="text-xs sm:text-sm font-semibold text-[#08784F] dark:text-[#34D399] mb-2 leading-relaxed">
                    {ayat.teksLatin}
                  </p>
                )}

                {/* Indonesian Translation */}
                {settings.showTranslation && (
                  <p
                    className="text-[#09251B] dark:text-[#C5D8CF] leading-relaxed text-justify"
                    style={{ fontSize: `${settings.translationFontSize}px` }}
                  >
                    {ayat.teksIndonesia}
                  </p>
                )}

                {/* Note badge if user has note on this bookmarked ayah */}
                {userNote && (
                  <div className="mt-3 rounded-xl bg-[#FFF4D6] p-2.5 text-xs text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24] border border-[#E9B949]/30">
                    <span className="font-bold">📝 Catatan Anda: </span>
                    <span>{userNote}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Prev & Next Surah Navigator */}
        <div className="mt-8 flex items-center justify-between gap-3 pt-4 border-t border-[#DCE5DD] dark:border-[#1F4535]">
          {Boolean(surahDetail.suratSebelumnya) && typeof surahDetail.suratSebelumnya === 'object' ? (
            <button
              onClick={() => {
                if (typeof surahDetail.suratSebelumnya === 'object') {
                  setSelectedSurahNumber(surahDetail.suratSebelumnya.nomor);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl border border-[#DCE5DD] bg-white px-4 py-2.5 text-xs font-bold text-[#064B32] hover:bg-[#F5F7F2] dark:border-[#1F4535] dark:bg-[#0E241B] dark:text-[#34D399]"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>
                Surat Sebelumnya: {(surahDetail.suratSebelumnya as { namaLatin: string }).namaLatin}
              </span>
            </button>
          ) : (
            <div />
          )}

          {Boolean(surahDetail.suratSelanjutnya) && typeof surahDetail.suratSelanjutnya === 'object' ? (
            <button
              onClick={() => {
                if (typeof surahDetail.suratSelanjutnya === 'object') {
                  setSelectedSurahNumber(surahDetail.suratSelanjutnya.nomor);
                }
              }}
              className="flex items-center gap-1.5 rounded-xl bg-[#064B32] px-4 py-2.5 text-xs font-bold text-white hover:bg-[#08784F] shadow-xs"
            >
              <span>
                Surat Selanjutnya: {(surahDetail.suratSelanjutnya as { namaLatin: string }).namaLatin}
              </span>
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <div />
          )}
        </div>

        {/* Tafsir Modal */}
        <TafsirModal
          isOpen={tafsirModalData.isOpen}
          onClose={() => setTafsirModalData({ ...tafsirModalData, isOpen: false })}
          surahNumber={surahDetail.nomor}
          surahName={surahDetail.namaLatin}
          ayatNumber={tafsirModalData.ayatNumber}
          arabText={tafsirModalData.arabText}
          translationText={tafsirModalData.translationText}
        />

        {/* Note Modal */}
        <NoteModal
          isOpen={noteModalData.isOpen}
          onClose={() => setNoteModalData({ ...noteModalData, isOpen: false })}
          id={noteModalData.id}
          title={noteModalData.title}
          initialNote={noteModalData.initialNote}
          onSaveNote={(id, note) => {
            const updated = StorageService.updateBookmarkNote(id, note);
            onBookmarksChange(updated);
          }}
        />
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: LOADING DETAIL
  // -------------------------------------------------------------
  if (selectedSurahNumber && loadingDetail) {
    return (
      <div className="flex flex-col items-center justify-center py-24 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-[#064B32] dark:text-[#34D399]" />
        <p className="text-sm font-semibold text-[#52665B] dark:text-[#9DB5AA]">
          Memuat naskah Surat Al-Qur'an...
        </p>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: ERROR DETAIL
  // -------------------------------------------------------------
  if (selectedSurahNumber && errorDetail) {
    return (
      <div className="py-16 text-center">
        <div className="mx-auto max-w-md rounded-2xl border border-red-200 bg-red-50 p-6 dark:border-red-900 dark:bg-red-950/40">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500 mb-2" />
          <h3 className="text-base font-bold text-red-700 dark:text-red-300">
            Gagal Memuat Surat
          </h3>
          <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errorDetail}</p>
          <div className="mt-4 flex justify-center gap-3">
            <button
              onClick={() => setSelectedSurahNumber(null)}
              className="rounded-xl border border-gray-300 bg-white px-4 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50"
            >
              Kembali ke Daftar
            </button>
            <button
              onClick={() => {
                setLoadingDetail(true);
                setErrorDetail(null);
                QuranService.getSurahDetail(selectedSurahNumber).then((r) => {
                  setSurahDetail(r.data);
                  setLoadingDetail(false);
                });
              }}
              className="rounded-xl bg-[#064B32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#08784F]"
            >
              Coba Lagi
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // VIEW: 114 SURAH LIST
  // -------------------------------------------------------------
  return (
    <div className="space-y-4 pb-24 animate-fade-in">
      {/* Title & Search bar */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
          <div>
            <h2 className="text-xl font-black text-[#064B32] dark:text-[#E8F0EC] sm:text-2xl">
              Al-Qur'an Digital
            </h2>
            <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
              114 Surah lengkap dengan teks mushaf terverifikasi, transliterasi & terjemahan
            </p>
          </div>

          {/* Place filter tabs */}
          <div className="flex rounded-xl bg-[#F5F7F2] p-1 dark:bg-[#153327] self-start sm:self-auto border border-[#DCE5DD] dark:border-[#1F4535]">
            <button
              onClick={() => setPlaceFilter('all')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                placeFilter === 'all'
                  ? 'bg-white text-[#064B32] shadow-2xs dark:bg-[#0E241B] dark:text-[#34D399]'
                  : 'text-[#52665B] hover:text-[#064B32] dark:text-[#9DB5AA]'
              }`}
            >
              Semua (114)
            </button>
            <button
              onClick={() => setPlaceFilter('Mekah')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                placeFilter === 'Mekah'
                  ? 'bg-white text-[#064B32] shadow-2xs dark:bg-[#0E241B] dark:text-[#34D399]'
                  : 'text-[#52665B] hover:text-[#064B32] dark:text-[#9DB5AA]'
              }`}
            >
              Makkiyah
            </button>
            <button
              onClick={() => setPlaceFilter('Madinah')}
              className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${
                placeFilter === 'Madinah'
                  ? 'bg-white text-[#064B32] shadow-2xs dark:bg-[#0E241B] dark:text-[#34D399]'
                  : 'text-[#52665B] hover:text-[#064B32] dark:text-[#9DB5AA]'
              }`}
            >
              Madaniyah
            </button>
          </div>
        </div>

        {/* Search input */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari nama surat (cth: Al-Baqarah, 36, Yasin, Pembukaan)..."
            className="w-full rounded-2xl border border-[#DCE5DD] bg-white py-2.5 pl-10 pr-4 text-sm text-[#09251B] outline-none shadow-2xs transition focus:border-[#064B32] focus:ring-2 focus:ring-[#064B32]/10 dark:border-[#1F4535] dark:bg-[#0E241B] dark:text-white"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Surahs Grid */}
      {loadingList ? (
        <div className="flex flex-col items-center justify-center py-20 gap-3">
          <Loader2 className="h-8 w-8 animate-spin text-[#064B32] dark:text-[#34D399]" />
          <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">Memuat daftar 114 surah...</p>
        </div>
      ) : filteredSurahs.length === 0 ? (
        <div className="py-16 text-center text-xs text-gray-500">
          Surat tidak ditemukan untuk "{searchQuery}".
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {filteredSurahs.map((surah) => (
            <button
              key={surah.nomor}
              onClick={() => setSelectedSurahNumber(surah.nomor)}
              className="flex items-center justify-between rounded-2xl border border-[#DCE5DD] bg-white p-3.5 text-left shadow-2xs transition hover:border-[#064B32] hover:shadow-xs active:scale-[0.99] dark:border-[#1F4535] dark:bg-[#0E241B] dark:hover:border-[#34D399] group"
            >
              <div className="flex items-center gap-3 min-w-0">
                {/* Number badge */}
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FFF4D6] font-extrabold text-xs text-[#064B32] ring-1 ring-[#E9B949]/30 dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                  {surah.nomor}
                </div>

                <div className="min-w-0">
                  <h4 className="truncate text-sm font-bold text-[#09251B] dark:text-white group-hover:text-[#064B32] dark:group-hover:text-[#34D399] transition">
                    {surah.namaLatin}
                  </h4>
                  <p className="truncate text-xs text-[#52665B] dark:text-[#9DB5AA]">
                    {surah.arti} • {surah.jumlahAyat} Ayat
                  </p>
                </div>
              </div>

              {/* Arabic name & revelation place */}
              <div className="text-right shrink-0 pl-2">
                <span className="font-arabic text-xl font-bold text-[#064B32] dark:text-[#34D399] block leading-tight">
                  {surah.nama}
                </span>
                <span className="text-[10px] font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                  {surah.tempatTurun}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
