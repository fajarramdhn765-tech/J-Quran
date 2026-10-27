import { Ayat } from '../types';

export interface AudioPlayerState {
  isPlaying: boolean;
  surahNumber: number | null;
  surahName: string | null;
  currentAyatNumber: number | null;
  totalAyat: number | null;
  qariId: string;
  duration: number;
  currentTime: number;
  isLooping: boolean;
  isLoading: boolean;
  error: string | null;
}

type AudioListener = (state: AudioPlayerState) => void;

export class AudioService {
  private static audio: HTMLAudioElement | null = null;
  private static listeners: Set<AudioListener> = new Set();
  private static ayatList: Ayat[] = [];
  private static currentAyatIndex: number = -1;
  private static qariId: string = '05';

  private static state: AudioPlayerState = {
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
  };

  private static initAudio(): HTMLAudioElement {
    if (!this.audio) {
      this.audio = new Audio();
      this.audio.preload = 'auto';

      this.audio.addEventListener('play', () => {
        this.updateState({ isPlaying: true, isLoading: false, error: null });
      });

      this.audio.addEventListener('pause', () => {
        this.updateState({ isPlaying: false });
      });

      this.audio.addEventListener('waiting', () => {
        this.updateState({ isLoading: true });
      });

      this.audio.addEventListener('playing', () => {
        this.updateState({ isLoading: false, isPlaying: true });
      });

      this.audio.addEventListener('timeupdate', () => {
        if (this.audio) {
          this.updateState({
            currentTime: this.audio.currentTime,
            duration: this.audio.duration || 0,
          });
        }
      });

      this.audio.addEventListener('ended', () => {
        this.handleTrackEnded();
      });

      this.audio.addEventListener('error', (e) => {
        console.warn('Audio playback error', e);
        this.updateState({
          isPlaying: false,
          isLoading: false,
          error: 'Gagal memuat audio murottal. Periksa koneksi internet.',
        });
      });
    }
    return this.audio;
  }

  static subscribe(listener: AudioListener): () => void {
    this.listeners.add(listener);
    listener(this.state);
    return () => this.listeners.delete(listener);
  }

  private static updateState(partial: Partial<AudioPlayerState>): void {
    this.state = { ...this.state, ...partial };
    this.listeners.forEach((listener) => listener(this.state));
  }

  static setQari(qariId: string): void {
    this.qariId = qariId;
    this.updateState({ qariId });
    // If currently playing an ayah, restart it with new Qari
    if (this.state.isPlaying && this.currentAyatIndex >= 0 && this.ayatList[this.currentAyatIndex]) {
      const curAyat = this.ayatList[this.currentAyatIndex];
      this.playAyat(
        this.state.surahNumber!,
        this.state.surahName!,
        curAyat,
        this.ayatList,
        this.currentAyatIndex
      );
    }
  }

  /**
   * Play a specific ayah in a surah with auto-advance sequence
   */
  static playAyat(
    surahNumber: number,
    surahName: string,
    ayat: Ayat,
    allAyat: Ayat[],
    index: number
  ): void {
    const audioEl = this.initAudio();
    this.ayatList = allAyat;
    this.currentAyatIndex = index;

    const audioUrl = ayat.audio[this.qariId] || Object.values(ayat.audio)[0];
    if (!audioUrl) {
      this.updateState({ error: 'URL audio ayat tidak ditemukan' });
      return;
    }

    this.updateState({
      surahNumber,
      surahName,
      currentAyatNumber: ayat.nomorAyat,
      totalAyat: allAyat.length,
      isLoading: true,
      error: null,
    });

    audioEl.src = audioUrl;
    audioEl.play().catch((err) => {
      console.warn('Audio play was prevented or failed', err);
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Interaksi pengguna dibutuhkan untuk memulai audio.',
      });
    });
  }

  /**
   * Play full surah audio stream
   */
  static playFullSurah(
    surahNumber: number,
    surahName: string,
    audioFull: Record<string, string>,
    totalAyat: number
  ): void {
    const audioEl = this.initAudio();
    this.ayatList = [];
    this.currentAyatIndex = -1;

    const audioUrl = audioFull[this.qariId] || Object.values(audioFull)[0];
    if (!audioUrl) {
      this.updateState({ error: 'Audio surah lengkap tidak ditemukan' });
      return;
    }

    this.updateState({
      surahNumber,
      surahName,
      currentAyatNumber: null,
      totalAyat,
      isLoading: true,
      error: null,
    });

    audioEl.src = audioUrl;
    audioEl.play().catch((err) => {
      this.updateState({
        isPlaying: false,
        isLoading: false,
        error: 'Pemutaran audio ditolak oleh browser.',
      });
    });
  }

  static togglePlay(): void {
    if (!this.audio || !this.audio.src) return;
    if (this.state.isPlaying) {
      this.audio.pause();
    } else {
      this.audio.play().catch(() => {});
    }
  }

  static stop(): void {
    if (this.audio) {
      this.audio.pause();
      this.audio.currentTime = 0;
    }
    this.updateState({
      isPlaying: false,
      surahNumber: null,
      currentAyatNumber: null,
      currentTime: 0,
      duration: 0,
      error: null,
    });
  }

  static nextAyat(): void {
    if (this.currentAyatIndex >= 0 && this.currentAyatIndex < this.ayatList.length - 1) {
      const nextIdx = this.currentAyatIndex + 1;
      const nextA = this.ayatList[nextIdx];
      this.playAyat(
        this.state.surahNumber!,
        this.state.surahName!,
        nextA,
        this.ayatList,
        nextIdx
      );
    }
  }

  static prevAyat(): void {
    if (this.currentAyatIndex > 0) {
      const prevIdx = this.currentAyatIndex - 1;
      const prevA = this.ayatList[prevIdx];
      this.playAyat(
        this.state.surahNumber!,
        this.state.surahName!,
        prevA,
        this.ayatList,
        prevIdx
      );
    }
  }

  static seek(seconds: number): void {
    if (this.audio && Number.isFinite(seconds)) {
      this.audio.currentTime = seconds;
    }
  }

  static toggleLoop(): void {
    this.updateState({ isLooping: !this.state.isLooping });
  }

  private static handleTrackEnded(): void {
    if (this.state.isLooping) {
      if (this.audio) {
        this.audio.currentTime = 0;
        this.audio.play().catch(() => {});
      }
      return;
    }

    // Auto advance to next ayah
    if (this.currentAyatIndex >= 0 && this.currentAyatIndex < this.ayatList.length - 1) {
      this.nextAyat();
    } else {
      this.updateState({ isPlaying: false, currentTime: 0 });
    }
  }

  /**
   * Synthesize harmonious Adhan / Takbir melody using Web Audio API
   * Guaranteed 100% offline availability without needing external MP3 asset!
   */
  static playAdhanChime(): void {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();

      // Islamic chime frequency chords (Maqam Rast / Bayati inspired tones)
      const notes = [
        { freq: 440.0, time: 0.0, dur: 0.6 }, // A4
        { freq: 493.88, time: 0.5, dur: 0.7 }, // B4
        { freq: 554.37, time: 1.1, dur: 0.9 }, // C#5
        { freq: 659.25, time: 1.9, dur: 1.2 }, // E5
        { freq: 554.37, time: 3.0, dur: 1.0 }, // C#5
        { freq: 440.0, time: 3.9, dur: 1.5 }, // A4
      ];

      notes.forEach(({ freq, time, dur }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, ctx.currentTime + time);

        // Soft bell envelope
        gain.gain.setValueAtTime(0, ctx.currentTime + time);
        gain.gain.linearRampToValueAtTime(0.2, ctx.currentTime + time + 0.05);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + time + dur);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + time);
        osc.stop(ctx.currentTime + time + dur);
      });
    } catch (e) {
      console.warn('Web Audio playback failed', e);
    }
  }
}
