import React, { useState } from 'react';
import {
  Bookmark,
  Trash2,
  FileEdit,
  ArrowRight,
  BookOpen,
  Search,
  Sparkles,
} from 'lucide-react';
import { BookmarkItem, LastReadItem } from '../types';
import { NoteModal } from '../components/NoteModal';
import { StorageService } from '../storage/storageService';

interface BookmarksViewProps {
  bookmarks: BookmarkItem[];
  lastRead: LastReadItem | null;
  onBookmarksChange: (bookmarks: BookmarkItem[]) => void;
  onOpenSurah: (surahNumber: number, ayatNumber?: number) => void;
}

export const BookmarksView: React.FC<BookmarksViewProps> = ({
  bookmarks,
  lastRead,
  onBookmarksChange,
  onOpenSurah,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'notes'>('all');
  const [search, setSearch] = useState('');
  const [editingNote, setEditingNote] = useState<{
    id: string;
    title: string;
    initialNote: string;
  } | null>(null);

  const filteredBookmarks = bookmarks.filter((b) => {
    if (activeTab === 'notes' && !b.note) return false;
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      b.surahName.toLowerCase().includes(q) ||
      b.translationText.toLowerCase().includes(q) ||
      (b.note && b.note.toLowerCase().includes(q))
    );
  });

  const handleDelete = (id: string) => {
    const updated = bookmarks.filter((b) => b.id !== id);
    StorageService.saveBookmarks(updated);
    onBookmarksChange(updated);
  };

  return (
    <div className="space-y-5 pb-24 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-black text-[#064B32] dark:text-[#E8F0EC] sm:text-2xl">
            Bookmark & Catatan Tilawah
          </h2>
          <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">
            Tersimpan aman di memori perangkat lokal Anda ({bookmarks.length} ayat ditandai)
          </p>
        </div>

        {/* Tab Filter */}
        <div className="flex rounded-xl bg-[#F5F7F2] p-1 dark:bg-[#153327] self-start sm:self-auto border border-[#DCE5DD] dark:border-[#1F4535]">
          <button
            onClick={() => setActiveTab('all')}
            className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition ${
              activeTab === 'all'
                ? 'bg-white text-[#064B32] shadow-2xs dark:bg-[#0E241B] dark:text-[#34D399]'
                : 'text-[#52665B] hover:text-[#064B32] dark:text-[#9DB5AA]'
            }`}
          >
            Semua ({bookmarks.length})
          </button>
          <button
            onClick={() => setActiveTab('notes')}
            className={`rounded-lg px-3.5 py-1 text-xs font-semibold transition ${
              activeTab === 'notes'
                ? 'bg-white text-[#064B32] shadow-2xs dark:bg-[#0E241B] dark:text-[#34D399]'
                : 'text-[#52665B] hover:text-[#064B32] dark:text-[#9DB5AA]'
            }`}
          >
            Dengan Catatan ({bookmarks.filter((b) => !!b.note).length})
          </button>
        </div>
      </div>

      {/* Last Read Banner */}
      {lastRead && (
        <div className="flex items-center justify-between rounded-2xl border border-[#E9B949]/40 bg-gradient-to-r from-[#FFFDF5] to-[#FFF4D6] p-4 dark:from-[#0E241B] dark:to-[#153327] shadow-xs">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E9B949] text-[#09251B] font-bold">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#064B32] dark:text-[#34D399]">
                Terakhir Dibaca
              </span>
              <h4 className="text-sm font-bold text-[#09251B] dark:text-white">
                Surat {lastRead.surahName} : Ayat {lastRead.ayatNumber}
              </h4>
            </div>
          </div>

          <button
            onClick={() => onOpenSurah(lastRead.surahNumber, lastRead.ayatNumber)}
            className="flex items-center gap-1 rounded-xl bg-[#064B32] px-3.5 py-2 text-xs font-bold text-white hover:bg-[#08784F] transition shadow-xs"
          >
            <span>Lanjutkan</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      )}

      {/* Search Input */}
      {bookmarks.length > 0 && (
        <div className="relative">
          <Search className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari dalam bookmark dan catatan Anda..."
            className="w-full rounded-2xl border border-[#DCE5DD] bg-white py-2.5 pl-10 pr-4 text-sm text-[#09251B] outline-none shadow-2xs transition focus:border-[#064B32] dark:border-[#1F4535] dark:bg-[#0E241B] dark:text-white"
          />
        </div>
      )}

      {/* Bookmarks List */}
      {filteredBookmarks.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-[#DCE5DD] p-12 text-center dark:border-[#1F4535]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#FFF4D6] text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
            <Bookmark className="h-7 w-7" />
          </div>
          <h3 className="mt-4 text-base font-bold text-[#09251B] dark:text-white">
            {search ? 'Tidak ada bookmark yang cocok' : 'Belum Ada Ayat Ditandai'}
          </h3>
          <p className="mt-1 text-xs text-[#52665B] dark:text-[#9DB5AA] max-w-sm mx-auto">
            {search
              ? 'Coba gunakan kata kunci pencarian yang berbeda.'
              : 'Saat membaca Al-Qur\'an, ketuk ikon bookmark pada ayat mana saja untuk menyimpannya di sini.'}
          </p>
          <button
            onClick={() => onOpenSurah(1, 1)}
            className="mt-4 inline-flex items-center gap-2 rounded-xl bg-[#064B32] px-4 py-2 text-xs font-bold text-white hover:bg-[#08784F] transition shadow-xs"
          >
            <span>Mulai Membaca Surat</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredBookmarks.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-[#DCE5DD] bg-white p-4 shadow-2xs transition hover:border-[#064B32] dark:border-[#1F4535] dark:bg-[#0E241B]"
            >
              <div className="flex items-center justify-between pb-2 border-b border-[#DCE5DD]/60 dark:border-[#1F4535]/60">
                <div className="flex items-center gap-2">
                  <span className="rounded-md bg-[#FFF4D6] px-2 py-0.5 text-xs font-bold text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                    QS. {item.surahName}: {item.ayatNumber}
                  </span>
                  <span className="text-[10px] text-gray-400">
                    {new Date(item.createdAt).toLocaleDateString('id-ID')}
                  </span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      setEditingNote({
                        id: item.id,
                        title: `QS. ${item.surahName}: ${item.ayatNumber}`,
                        initialNote: item.note || '',
                      })
                    }
                    title="Tambah / Ubah Catatan"
                    className="rounded-lg p-1.5 text-[#52665B] hover:bg-[#F5F7F2] hover:text-[#064B32] dark:text-[#9DB5AA] dark:hover:bg-[#153327]"
                  >
                    <FileEdit className="h-4 w-4" />
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    title="Hapus Bookmark"
                    className="rounded-lg p-1.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-950/40"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Arabic text snippet */}
              <p className="font-arabic text-xl text-right leading-loose text-[#064B32] dark:text-[#34D399] my-2">
                {item.arabText}
              </p>

              {/* Translation */}
              <p className="text-xs text-[#09251B] dark:text-[#C5D8CF] line-clamp-2">
                "{item.translationText}"
              </p>

              {/* Personal Note */}
              {item.note && (
                <div className="mt-3 rounded-xl bg-[#FFF4D6] p-2.5 text-xs text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24] border border-[#E9B949]/30">
                  <span className="font-bold">📝 Catatan: </span>
                  <span>{item.note}</span>
                </div>
              )}

              {/* Open in reader button */}
              <div className="mt-3 flex justify-end pt-2 border-t border-[#DCE5DD]/40 dark:border-[#1F4535]/40">
                <button
                  onClick={() => onOpenSurah(item.surahNumber, item.ayatNumber)}
                  className="flex items-center gap-1 text-xs font-bold text-[#064B32] dark:text-[#34D399] hover:underline"
                >
                  <span>Buka di Tilawah</span>
                  <ArrowRight className="h-3 w-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Note modal */}
      {editingNote && (
        <NoteModal
          isOpen={true}
          onClose={() => setEditingNote(null)}
          id={editingNote.id}
          title={editingNote.title}
          initialNote={editingNote.initialNote}
          onSaveNote={(id, note) => {
            const updated = StorageService.updateBookmarkNote(id, note);
            onBookmarksChange(updated);
            setEditingNote(null);
          }}
        />
      )}
    </div>
  );
};
