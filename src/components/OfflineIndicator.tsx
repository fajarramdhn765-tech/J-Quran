import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/useOnlineStatus';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="fixed bottom-20 left-1/2 -translate-x-1/2 z-40 flex items-center gap-2 rounded-full bg-[#09251B]/95 text-[#FFF4D6] px-4 py-1.5 text-xs font-medium shadow-xl border border-[#E9B949]/30 backdrop-blur-md animate-fade-in">
      <WifiOff className="w-3.5 h-3.5 text-[#E9B949] animate-pulse" />
      <span>Mode Offline — Menggunakan data lokal Al-Qur'an & hisab jadwal</span>
    </div>
  );
};
