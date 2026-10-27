import React, { useState } from 'react';
import { MapPin, Navigation, Search, X, Check, Loader2 } from 'lucide-react';
import { APP_CONFIG, CityLocation } from '../config/appConfig';

interface LocationPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentLocation: CityLocation;
  onSelectLocation: (loc: CityLocation) => void;
}

export const LocationPickerModal: React.FC<LocationPickerModalProps> = ({
  isOpen,
  onClose,
  currentLocation,
  onSelectLocation,
}) => {
  const [search, setSearch] = useState('');
  const [gpsLoading, setGpsLoading] = useState(false);
  const [gpsError, setGpsError] = useState<string | null>(null);

  if (!isOpen) return null;

  const filteredCities = APP_CONFIG.cities.filter(
    (c) =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.province.toLowerCase().includes(search.toLowerCase()) ||
      c.tzLabel.toLowerCase().includes(search.toLowerCase())
  );

  const handleUseGPS = () => {
    if (!navigator.geolocation) {
      setGpsError('Perangkat Anda tidak mendukung fitur Geolocation.');
      return;
    }

    setGpsLoading(true);
    setGpsError(null);

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGpsLoading(false);
        const { latitude, longitude } = pos.coords;

        // Determine Indonesian timezone based on longitude approximate bounds
        // WIB: < 114.5, WITA: 114.5 - 125.0, WIT: > 125.0
        let tz = 'Asia/Jakarta';
        let tzLabel = 'WIB';
        if (longitude >= 114.5 && longitude < 125.0) {
          tz = 'Asia/Makassar';
          tzLabel = 'WITA';
        } else if (longitude >= 125.0) {
          tz = 'Asia/Jayapura';
          tzLabel = 'WIT';
        }

        const customLoc: CityLocation = {
          name: 'Lokasi Saya (GPS)',
          province: `${latitude.toFixed(3)}°, ${longitude.toFixed(3)}°`,
          latitude,
          longitude,
          timezone: tz,
          tzLabel,
        };

        onSelectLocation(customLoc);
        onClose();
      },
      (err) => {
        setGpsLoading(false);
        if (err.code === err.PERMISSION_DENIED) {
          setGpsError('Izin akses lokasi ditolak oleh browser. Silakan pilih kota manual.');
        } else {
          setGpsError('Gagal mendeteksi lokasi GPS. Silakan pilih kota dari daftar.');
        }
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs animate-fade-in">
      <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#0E241B] border border-[#DCE5DD] dark:border-[#1F4535] max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-[#DCE5DD] dark:border-[#1F4535]">
          <div className="flex items-center gap-2">
            <MapPin className="h-5 w-5 text-[#E9B949]" />
            <h3 className="font-bold text-[#064B32] dark:text-[#E8F0EC]">Pilih Kota / Lokasi</h3>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* GPS Button */}
        <div className="py-3">
          <button
            onClick={handleUseGPS}
            disabled={gpsLoading}
            className="w-full flex items-center justify-center gap-2 rounded-xl bg-[#064B32] py-2.5 px-4 text-sm font-semibold text-white shadow-xs transition hover:bg-[#08784F] active:scale-[0.98] disabled:opacity-50"
          >
            {gpsLoading ? (
              <Loader2 className="h-4 w-4 animate-spin text-[#E9B949]" />
            ) : (
              <Navigation className="h-4 w-4 text-[#E9B949]" />
            )}
            <span>{gpsLoading ? 'Mendeteksi Koordinat...' : 'Gunakan Lokasi Saya (GPS)'}</span>
          </button>

          {gpsError && (
            <p className="mt-2 text-xs text-red-500 text-center font-medium">{gpsError}</p>
          )}
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari kota, kabupaten, atau provinsi..."
            className="w-full rounded-xl border border-[#DCE5DD] bg-[#F5F7F2] py-2 pl-9 pr-3 text-sm text-[#09251B] outline-none transition focus:border-[#064B32] focus:bg-white dark:border-[#1F4535] dark:bg-[#153327] dark:text-[#E8F0EC]"
          />
        </div>

        {/* City list */}
        <div className="overflow-y-auto flex-1 space-y-1.5 pr-1 divide-y divide-[#DCE5DD]/40 dark:divide-[#1F4535]/40">
          {filteredCities.map((city) => {
            const isSelected = currentLocation.name === city.name;
            return (
              <button
                key={`${city.name}-${city.province}`}
                onClick={() => {
                  onSelectLocation(city);
                  onClose();
                }}
                className={`w-full flex items-center justify-between p-2.5 rounded-xl text-left transition ${
                  isSelected
                    ? 'bg-[#FFF4D6] text-[#064B32] dark:bg-[#1E3A2F] dark:text-[#34D399] font-bold'
                    : 'hover:bg-[#F5F7F2] text-[#09251B] dark:text-[#E8F0EC] dark:hover:bg-[#153327]'
                }`}
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold">{city.name}</span>
                    <span className="rounded bg-[#E9B949]/20 px-1.5 py-0.2 text-[10px] font-bold text-[#064B32] dark:text-[#FBBF24]">
                      {city.tzLabel}
                    </span>
                  </div>
                  <p className="text-xs text-[#52665B] dark:text-[#9DB5AA]">{city.province}</p>
                </div>
                {isSelected && <Check className="h-4 w-4 text-[#064B32] dark:text-[#34D399]" />}
              </button>
            );
          })}
          {filteredCities.length === 0 && (
            <p className="py-6 text-center text-xs text-gray-500">Kota tidak ditemukan</p>
          )}
        </div>
      </div>
    </div>
  );
};
