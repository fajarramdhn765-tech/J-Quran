import React, { useEffect, useState } from 'react';
import { BookOpen, X, Loader2, AlertCircle } from 'lucide-react';
import { QuranService } from '../services/quranService';
import { TafsirDetail } from '../types';

interface TafsirModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahNumber: number;
  surahName: string;
  ayatNumber: number;
  arabText?: string;
  translationText?: string;
}

export const TafsirModal: React.FC<TafsirModalProps> = ({
  isOpen,
  onClose,
  surahNumber,
  surahName,
  ayatNumber,
  arabText,
  translationText,
}) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tafsirData, setTafsirData] = useState<TafsirDetail | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let isMounted = true;
    setLoading(true);
    setError(null);

    QuranService.getTafsir(surahNumber)
      .then((res) => {
        if (isMounted) {
          setTafsirData(res.data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setError(err.message || 'Gagal memuat tafsir');
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [isOpen, surahNumber]);

  if (!isOpen) return null;

  const currentAyatTafsir = tafsirData?.tafsir?.find((t) => t.ayat === ayatNumber);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-2xl rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#0E241B] border border-[#DCE5DD] dark:border-[#1F4535] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
          <div className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-[#E9B949]" />
            <div>
              <h3 className="font-bold text-[#064B32] dark:text-[#34D399]">
                Tafsir Kemenag RI — Surat {surahName} : Ayat {ayatNumber}
              </h3>
              <p className="text-[11px] text-[#52665B] dark:text-[#9DB5AA]">
                Sumber: Kementerian Agama Republik Indonesia
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto flex-1 py-4 space-y-4 pr-1 text-sm text-[#09251B] dark:text-[#E8F0EC]">
          {/* Ayat Box */}
          {arabText && (
            <div className="rounded-xl bg-[#FFFDF5] p-4 border border-[#DCE5DD] dark:bg-[#153327] dark:border-[#1F4535]">
              <p className="font-arabic text-2xl text-right leading-loose text-[#064B32] dark:text-[#34D399]">
                {arabText}
              </p>
              {translationText && (
                <p className="mt-2 text-xs italic text-[#52665B] dark:text-[#9DB5AA]">
                  "{translationText}"
                </p>
              )}
            </div>
          )}

          {/* Tafsir Body */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-12 gap-3">
              <Loader2 className="h-7 w-7 animate-spin text-[#064B32] dark:text-[#34D399]" />
              <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">Memuat teks tafsir resmi...</p>
            </div>
          ) : error ? (
            <div className="rounded-xl bg-red-50 p-4 border border-red-200 text-center dark:bg-red-950/40 dark:border-red-900">
              <AlertCircle className="mx-auto h-6 w-6 text-red-500 mb-1" />
              <p className="text-xs text-red-600 dark:text-red-300 font-medium">{error}</p>
              <button
                onClick={() => {
                  setLoading(true);
                  setError(null);
                  QuranService.getTafsir(surahNumber).then((r) => {
                    setTafsirData(r.data);
                    setLoading(false);
                  });
                }}
                className="mt-3 rounded-lg bg-red-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-red-700"
              >
                Coba Lagi
              </button>
            </div>
          ) : currentAyatTafsir ? (
            <div className="space-y-3 leading-relaxed text-justify text-[13.5px]">
              {currentAyatTafsir.teks.split('\n\n').map((paragraph, idx) => (
                <p key={idx} className="text-[#09251B] dark:text-[#E8F0EC]">
                  {paragraph}
                </p>
              ))}
            </div>
          ) : (
            <p className="text-center py-8 text-xs text-gray-500">
              Tafsir untuk ayat ini belum tersedia secara digital.
            </p>
          )}
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-[#DCE5DD] dark:border-[#1F4535] flex justify-end">
          <button
            onClick={onClose}
            className="rounded-xl bg-[#064B32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#08784F] transition"
          >
            Tutup Tafsir
          </button>
        </div>
      </div>
    </div>
  );
};
