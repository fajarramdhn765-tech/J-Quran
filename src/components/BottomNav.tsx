import React from 'react';
import { Home, BookOpen, Clock, Bookmark, Settings } from 'lucide-react';

export type TabType = 'home' | 'quran' | 'prayer' | 'bookmarks' | 'settings';

interface BottomNavProps {
  activeTab: TabType;
  onChangeTab: (tab: TabType) => void;
  bookmarkCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  activeTab,
  onChangeTab,
  bookmarkCount = 0,
}) => {
  const tabs = [
    { id: 'home' as TabType, label: 'Beranda', icon: Home },
    { id: 'quran' as TabType, label: "Al-Qur'an", icon: BookOpen },
    { id: 'prayer' as TabType, label: 'Jadwal Salat', icon: Clock },
    { id: 'bookmarks' as TabType, label: 'Bookmark', icon: Bookmark, badge: bookmarkCount },
    { id: 'settings' as TabType, label: 'Pengaturan', icon: Settings },
  ];

  return (
    <nav
      aria-label="Navigasi Utama"
      className="fixed bottom-0 left-0 right-0 z-30 border-t border-[#DCE5DD] bg-white/95 backdrop-blur-md dark:border-[#1F4535] dark:bg-[#0E241B]/95 transition-colors"
    >
      <div className="mx-auto flex max-w-lg items-center justify-around px-2 py-1.5">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => onChangeTab(tab.id)}
              className={`relative flex flex-1 flex-col items-center justify-center py-1 transition-all duration-200 ${
                isActive
                  ? 'text-[#064B32] font-bold dark:text-[#34D399]'
                  : 'text-[#52665B] font-medium hover:text-[#064B32] dark:text-[#9DB5AA] dark:hover:text-[#E8F0EC]'
              }`}
            >
              {/* Active top indicator pill */}
              {isActive && (
                <span className="absolute -top-1.5 h-1 w-8 rounded-full bg-[#E9B949]" />
              )}

              <div className="relative">
                <Icon
                  className={`h-5 w-5 transition-transform ${
                    isActive ? 'scale-110 stroke-[2.4]' : 'stroke-[1.8]'
                  }`}
                />
                {tab.badge && tab.badge > 0 ? (
                  <span className="absolute -top-1.5 -right-2.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#E9B949] px-1 text-[10px] font-bold text-[#09251B] leading-none">
                    {tab.badge > 99 ? '99+' : tab.badge}
                  </span>
                ) : null}
              </div>

              <span className="mt-1 text-[11px] leading-tight tracking-tight">
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
