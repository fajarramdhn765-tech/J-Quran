import React from 'react';
import { MapPin, Moon, Sun, Bell, Volume2, Sparkles } from 'lucide-react';
import { CityLocation } from '../config/appConfig';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  location: CityLocation;
  onOpenLocationPicker: () => void;
  isDark: boolean;
  onToggleTheme: () => void;
  onTestAdhan: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  location,
  onOpenLocationPicker,
  isDark,
  onToggleTheme,
  onTestAdhan,
}) => {
  return (
    <header className="sticky top-0 z-30 border-b border-[#DCE5DD] bg-[#FFFFFF]/90 backdrop-blur-md dark:border-[#1F4535] dark:bg-[#0E241B]/90 transition-colors">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-2.5 sm:px-6">
        {/* Brand identity */}
        <div className="flex items-center gap-2.5">
          <div className="relative flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#064B32] to-[#043322] shadow-sm ring-1 ring-[#E9B949]/40">
            <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                d="M12 3C7.03 3 3 7.03 3 12C3 16.97 7.03 21 12 21C16.97 21 21 16.97 21 12C21 7.03 16.97 3 12 3Z"
                stroke="#E9B949"
                strokeWidth="1.2"
                strokeDasharray="2 2"
              />
              <path
                d="M12 6V18M6 14C8 12.5 10 12.5 12 13.5C14 14.5 16 14.5 18 13"
                stroke="#FFFDF5"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
              <circle cx="12" cy="7" r="1.5" fill="#E9B949" />
            </svg>
            <div className="absolute -top-1 -right-1 h-2.5 w-2.5 rounded-full bg-[#E9B949] ring-2 ring-white dark:ring-[#0E241B]" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <h1 className="text-base font-extrabold tracking-tight text-[#064B32] dark:text-[#E8F0EC] sm:text-lg">
                Jay'z Quran
              </h1>
              <span className="rounded-md bg-[#FFF4D6] px-1.5 py-0.5 text-[10px] font-bold text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#FBBF24]">
                PRO
              </span>
            </div>
            <p className="text-[11px] font-medium text-[#52665B] dark:text-[#9DB5AA] hidden xs:block">
              Temukan Kedamaian dalam Tilawah
            </p>
          </div>
        </div>

        {/* Right action group */}
        <div className="flex items-center gap-2">
          {/* Location button */}
          <button
            onClick={onOpenLocationPicker}
            title="Ubah Kota / Lokasi"
            className="flex items-center gap-1.5 rounded-lg border border-[#DCE5DD] bg-[#F5F7F2] px-2.5 py-1.5 text-xs font-semibold text-[#064B32] transition hover:border-[#064B32] hover:bg-white dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#34D399] dark:hover:border-[#34D399]"
          >
            <MapPin className="h-3.5 w-3.5 text-[#E9B949]" />
            <span className="max-w-[80px] sm:max-w-[120px] truncate">{location.name}</span>
            <span className="text-[10px] font-bold opacity-75">({location.tzLabel})</span>
          </button>

          {/* Adhan quick preview chime */}
          <button
            onClick={onTestAdhan}
            title="Tes Suara Adzan / Pengingat"
            className="rounded-lg p-2 text-[#52665B] hover:bg-[#F5F7F2] hover:text-[#064B32] dark:text-[#9DB5AA] dark:hover:bg-[#153327] dark:hover:text-[#34D399] transition"
          >
            <Volume2 className="h-4 w-4" />
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={onToggleTheme}
            title={isDark ? 'Mode Terang' : 'Mode Gelap'}
            className="rounded-lg p-2 text-[#52665B] hover:bg-[#F5F7F2] hover:text-[#064B32] dark:text-[#9DB5AA] dark:hover:bg-[#153327] dark:hover:text-[#FBBF24] transition"
          >
            {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </button>

          {/* PWA Install Button */}
          <PWAInstallButton compact />
        </div>
      </div>
    </header>
  );
};
