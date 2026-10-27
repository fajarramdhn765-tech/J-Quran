import React, { useState, useEffect } from 'react';
import { Bookmark, X, Save } from 'lucide-react';

interface NoteModalProps {
  isOpen: boolean;
  onClose: () => void;
  id: string; // surah:ayat
  title: string;
  initialNote?: string;
  onSaveNote: (id: string, note: string) => void;
}

export const NoteModal: React.FC<NoteModalProps> = ({
  isOpen,
  onClose,
  id,
  title,
  initialNote = '',
  onSaveNote,
}) => {
  const [note, setNote] = useState(initialNote);

  useEffect(() => {
    setNote(initialNote);
  }, [initialNote, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveNote(id, note.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#0E241B] border border-[#DCE5DD] dark:border-[#1F4535]">
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
          <div className="flex items-center gap-2">
            <Bookmark className="h-5 w-5 text-[#E9B949]" />
            <h3 className="font-bold text-[#064B32] dark:text-[#E8F0EC]">Catatan Pribadi</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="py-4 space-y-3">
          <p className="text-xs font-semibold text-[#52665B] dark:text-[#9DB5AA]">{title}</p>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="Tuliskan refleksi, doa, atau tadabbur dari ayat ini..."
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] p-3 text-sm text-[#09251B] outline-none transition focus:border-[#064B32] focus:bg-white dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#E8F0EC]"
          />
        </div>

        <div className="flex justify-end gap-2 pt-2 border-t border-[#DCE5DD] dark:border-[#1F4535]">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-medium text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Batal
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-1.5 rounded-xl bg-[#064B32] px-4 py-2 text-xs font-semibold text-white hover:bg-[#08784F] transition"
          >
            <Save className="h-3.5 w-3.5" />
            Simpan Catatan
          </button>
        </div>
      </div>
    </div>
  );
};
