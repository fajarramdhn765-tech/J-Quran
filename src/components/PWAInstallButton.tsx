import React, { useState } from 'react';
import { Download, Share2, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../hooks/usePWAInstall';

export const PWAInstallButton: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already installed and running standalone, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        title="Pasang Aplikasi Jay'z Quran (PWA)"
        className={`flex items-center gap-1.5 rounded-lg bg-[#E9B949] text-[#09251B] font-semibold transition hover:bg-[#d8a83a] shadow-xs active:scale-95 ${
          compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
        }`}
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          title="Pasang di iPhone / iPad"
          className={`flex items-center gap-1.5 rounded-lg border border-[#E9B949]/50 bg-[#FFF4D6] text-[#064B32] font-medium transition hover:bg-[#ffeec0] dark:bg-[#1E3A2F] dark:text-[#FBBF24] dark:border-[#FBBF24]/40 ${
            compact ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-xs'
          }`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install iOS</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl dark:bg-[#0E241B] border border-[#DCE5DD] dark:border-[#1F4535]">
              <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
                <h3 className="font-bold text-[#064B32] dark:text-[#10B981] flex items-center gap-2">
                  <Smartphone className="w-5 h-5 text-[#E9B949]" />
                  Pasang di iPhone / iPad
                </h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-sm text-[#52665B] dark:text-[#9DB5AA]">
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9B949] font-bold text-xs text-[#09251B]">
                    1
                  </div>
                  <p>
                    Ketuk tombol <strong className="text-[#09251B] dark:text-white">Share</strong>{' '}
                    <Share2 className="inline w-3.5 h-3.5 text-[#064B32] dark:text-[#10B981]" /> di bar bawah Safari.
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9B949] font-bold text-xs text-[#09251B]">
                    2
                  </div>
                  <p>
                    Gulir ke bawah dan pilih opsi{' '}
                    <strong className="text-[#09251B] dark:text-white">"Add to Home Screen"</strong> (Tambah ke Layar Utama).
                  </p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#E9B949] font-bold text-xs text-[#09251B]">
                    3
                  </div>
                  <p>
                    Ketuk <strong className="text-[#09251B] dark:text-white">"Add"</strong> di pojok kanan atas untuk menyelesaikan instalasi.
                  </p>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-6 w-full rounded-xl bg-[#064B32] py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-[#08784F] transition"
              >
                Mengerti
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
