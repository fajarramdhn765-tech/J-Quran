import React, { useEffect, useState } from 'react';
import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  X,
  Volume2,
  Repeat,
  Loader2,
} from 'lucide-react';
import { AudioPlayerState, AudioService } from '../services/audioService';
import { APP_CONFIG } from '../config/appConfig';

export const AudioPlayerBar: React.FC = () => {
  const [playerState, setPlayerState] = useState<AudioPlayerState>({
    isPlaying: false,
    surahNumber: null,
    surahName: null,
    currentAyatNumber: null,
    totalAyat: null,
    qariId: '05',
    duration: 0,
    currentTime: 0,
    isLooping: false,
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    const unsub = AudioService.subscribe((state) => {
      setPlayerState(state);
    });
    return unsub;
  }, []);

  if (!playerState.surahNumber) {
    return null;
  }

  const formatSec = (sec: number) => {
    if (!Number.isFinite(sec) || sec <= 0) return '00:00';
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const currentQari = APP_CONFIG.qaris.find((q) => q.id === playerState.qariId) || APP_CONFIG.qaris[4];
  const progressPercent = playerState.duration > 0 ? (playerState.currentTime / playerState.duration) * 100 : 0;

  return (
    <div className="fixed bottom-14 left-0 right-0 z-30 mx-auto max-w-2xl px-3 pb-2 animate-slide-up">
      <div className="overflow-hidden rounded-2xl border border-[#E9B949]/40 bg-[#064B32] text-white shadow-2xl backdrop-blur-md dark:border-[#E9B949]/30 dark:bg-[#09251B]">
        {/* Progress track at top of bar */}
        <div
          className="relative h-1.5 w-full cursor-pointer bg-white/20"
          onClick={(e) => {
            const rect = e.currentTarget.getBoundingClientRect();
            const clickPos = (e.clientX - rect.left) / rect.width;
            if (playerState.duration > 0) {
              AudioService.seek(clickPos * playerState.duration);
            }
          }}
        >
          <div
            className="h-full bg-[#E9B949] transition-all duration-150"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-2 px-3 py-2">
          {/* Track info */}
          <div className="flex min-w-0 flex-1 items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#E9B949] text-[#09251B] font-bold text-xs shadow-xs">
              {playerState.currentAyatNumber ? `Ayat ${playerState.currentAyatNumber}` : 'Full'}
            </div>
            <div className="min-w-0">
              <h4 className="truncate text-xs font-bold text-white sm:text-sm">
                Surat {playerState.surahName}
              </h4>
              <p className="truncate text-[11px] text-[#FFF4D6]/80 flex items-center gap-1">
                <span>{currentQari.name}</span>
                <span>•</span>
                <span>
                  {formatSec(playerState.currentTime)} / {formatSec(playerState.duration)}
                </span>
              </p>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center gap-1 sm:gap-2">
            {playerState.currentAyatNumber && (
              <button
                onClick={() => AudioService.prevAyat()}
                title="Ayat Sebelumnya"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <SkipBack className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => AudioService.togglePlay()}
              title={playerState.isPlaying ? 'Jeda' : 'Putar'}
              className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E9B949] text-[#09251B] shadow-md hover:scale-105 active:scale-95 transition"
            >
              {playerState.isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin text-[#09251B]" />
              ) : playerState.isPlaying ? (
                <Pause className="h-4 w-4 fill-current" />
              ) : (
                <Play className="h-4 w-4 fill-current ml-0.5" />
              )}
            </button>

            {playerState.currentAyatNumber && (
              <button
                onClick={() => AudioService.nextAyat()}
                title="Ayat Selanjutnya"
                className="rounded-lg p-1.5 text-white/80 hover:bg-white/10 hover:text-white transition"
              >
                <SkipForward className="h-4 w-4" />
              </button>
            )}

            <button
              onClick={() => AudioService.toggleLoop()}
              title={playerState.isLooping ? 'Ulangi Aktif' : 'Ulangi Nonaktif'}
              className={`rounded-lg p-1.5 transition ${
                playerState.isLooping
                  ? 'bg-[#E9B949] text-[#09251B]'
                  : 'text-white/70 hover:bg-white/10 hover:text-white'
              }`}
            >
              <Repeat className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => AudioService.stop()}
              title="Tutup Pemutar"
              className="rounded-lg p-1.5 text-white/70 hover:bg-white/10 hover:text-white transition"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {playerState.error && (
          <div className="bg-red-900/90 px-3 py-1 text-[11px] text-red-100 flex items-center justify-between">
            <span className="truncate">{playerState.error}</span>
            <button
              onClick={() => AudioService.stop()}
              className="underline text-[10px] ml-2 shrink-0"
            >
              Tutup
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
