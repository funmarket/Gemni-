import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { Coords, anonymizeCoordinates, reverseGeocode } from './geolocation';
import { getCurrentDeviceLocation, isNativePlatform } from '../platform/geo';
import { MapPin, Compass, Search, Navigation, AlertCircle, Check, Loader2 } from 'lucide-react';

export type LocationSource = 'gps-active' | 'permission-blocked' | 'manual-area' | 'last-known' | 'unavailable';

interface GeolocationContextType {
  coords: Coords | null;
  cityName: string | null;
  accuracy: number | null;
  permissionStatus: 'granted' | 'prompt' | 'denied';
  isLoading: boolean;
  refreshLocation: () => Promise<void>;
  locationSource: LocationSource;
  setManualLocation: (cityName: string, coords: Coords) => void;
  clearLocation: () => void;
}

const GeolocationContext = createContext<GeolocationContextType | undefined>(undefined);

// Popular cities mapped with beautiful precise coordinates
const POPULAR_CITIES = [
  { name: 'Tunis, Tunisia', lat: 36.8065, lng: 10.1815 },
  { name: 'New York, NY', lat: 40.7128, lng: -74.0060 },
  { name: 'London, UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris, France', lat: 48.8566, lng: 2.3522 },
  { name: 'Tokyo, Japan', lat: 35.6762, lng: 139.6503 },
  { name: 'Sydney, Australia', lat: -33.8688, lng: 151.2093 }
];

export const GeolocationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [coords, setCoords] = useState<Coords | null>(null);
  const [cityName, setCityName] = useState<string | null>(null);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<'granted' | 'prompt' | 'denied'>('prompt');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [locationSource, setLocationSource] = useState<LocationSource>('unavailable');

  // Manual search UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState('');

  const isRefreshingRef = useRef<boolean>(false);

  // Initialize and check current status
  const initializeLocation = async () => {
    setIsLoading(true);
    
    // 1. Check if GPS permission is already active or check standard device GPS first
    try {
      const result = await getCurrentDeviceLocation({
        enableHighAccuracy: true,
        timeout: 4000,
        maximumAge: 10 * 1000
      });

      if (result.status === 'success' && result.coords) {
        setCoords(result.coords);
        setCityName(result.cityName);
        setAccuracy(result.accuracy || null);
        setPermissionStatus('granted');
        setLocationSource('gps-active');
        setIsLoading(false);
        return;
      }
    } catch (e) {
      console.warn('Initial GPS query skipped/failed:', e);
    }

    // 2. Check storage for last known from GPS
    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
    if (lastKnownRaw) {
      try {
        const parsed = JSON.parse(lastKnownRaw);
        if (parsed && parsed.coords) {
          setCoords(parsed.coords);
          setCityName(typeof parsed.cityName === 'string' ? parsed.cityName : 'Last Known Area');
          setPermissionStatus('denied');
          setLocationSource('last-known');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to load last known position:', e);
      }
    }

    // 3. Check storage for manual area
    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
    if (manualRaw) {
      try {
        const parsed = JSON.parse(manualRaw);
        if (parsed && parsed.coords) {
          setCoords(parsed.coords);
          setCityName(typeof parsed.cityName === 'string' ? parsed.cityName : 'Manual Area');
          setPermissionStatus('denied');
          setLocationSource('manual-area');
          setIsLoading(false);
          return;
        }
      } catch (e) {
        console.warn('Failed to load manual area:', e);
      }
    }

    // 4. Default to blocked/no-location state
    setCoords(null);
    setCityName(null);
    setPermissionStatus('denied');
    setLocationSource('permission-blocked');
    setIsLoading(false);
  };

  useEffect(() => {
    initializeLocation();
  }, []);

  const refreshLocation = async () => {
    if (isRefreshingRef.current) return;
    isRefreshingRef.current = true;
    setIsLoading(true);

    try {
      const result = await getCurrentDeviceLocation({
        enableHighAccuracy: true,
        timeout: 7000,
        maximumAge: 5000
      });

      if (result.status === 'success' && result.coords) {
        setCoords(result.coords);
        setCityName(result.cityName);
        setAccuracy(result.accuracy || null);
        setPermissionStatus('granted');
        setLocationSource('gps-active');
      } else {
        // Fall back to stored locations
        const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
        const manualRaw = localStorage.getItem('vibe_quest_manual_location');

        if (lastKnownRaw) {
          const parsed = JSON.parse(lastKnownRaw);
          setCoords(parsed.coords);
          setCityName(typeof parsed.cityName === 'string' ? parsed.cityName : 'Last Known Area');
          setLocationSource('last-known');
        } else if (manualRaw) {
          const parsed = JSON.parse(manualRaw);
          setCoords(parsed.coords);
          setCityName(typeof parsed.cityName === 'string' ? parsed.cityName : 'Manual Area');
          setLocationSource('manual-area');
        } else {
          setCoords(null);
          setCityName(null);
          setLocationSource('permission-blocked');
        }
        setPermissionStatus('denied');
      }
    } catch (err) {
      console.warn('Error refreshing shared location:', err);
      setPermissionStatus('denied');
    } finally {
      setIsLoading(false);
      isRefreshingRef.current = false;
    }
  };

  const setManualLocation = (name: string, coordinates: Coords) => {
    const anonymized = anonymizeCoordinates(coordinates.lat, coordinates.lng);
    localStorage.setItem('vibe_quest_manual_location', JSON.stringify({
      coords: anonymized,
      cityName: name
    }));
    setCoords(anonymized);
    setCityName(name);
    setPermissionStatus('denied');
    setLocationSource('manual-area');
  };

  const clearLocation = () => {
    localStorage.removeItem('vibe_quest_last_known_location');
    localStorage.removeItem('vibe_quest_manual_location');
    setCoords(null);
    setCityName(null);
    setLocationSource('permission-blocked');
  };

  // Perform a real OpenStreetMap Nominatim search for manual city selection
  const handleSearchCity = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError('');
    setSearchResults([]);

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=5`,
        {
          headers: {
            'User-Agent': 'VibeQuest/2.0.0 (CitySearch; funmarketmn@gmail.com)'
          }
        }
      );

      if (!response.ok) {
        throw new Error('Search failed. Please try again.');
      }

      const data = await response.json();
      if (data && data.length > 0) {
        const results = data.map((item: any) => ({
          name: item.display_name,
          lat: parseFloat(item.lat),
          lng: parseFloat(item.lon)
        }));
        setSearchResults(results);
      } else {
        setSearchError('No matching cities found.');
      }
    } catch (err) {
      console.warn(err);
      setSearchError('Failed to search area. Please check connection.');
    } finally {
      setIsSearching(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] flex flex-col items-center justify-center text-white space-y-4">
        <Loader2 className="w-10 h-10 text-rose-500 animate-spin" />
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-zinc-500">
          Syncing nearby places...
        </p>
      </div>
    );
  }

  // Render a beautifully polished manual selection screen if no location source is set
  if (!coords) {
    return (
      <div className="min-h-screen bg-[#0B0A0D] text-zinc-100 flex flex-col justify-center items-center px-4 py-8 select-none">
        <div className="w-full max-w-md bg-[#131117] border border-white/5 rounded-3xl p-6 md:p-8 space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-rose-500/5 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-amber-500/5 blur-3xl pointer-events-none" />

          {/* Icon Header */}
          <div className="text-center space-y-3">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-rose-500/10 border border-rose-500/20 text-rose-400">
              <MapPin className="w-6 h-6" />
            </div>
            <h2 className="text-xl md:text-2xl font-black uppercase tracking-wide text-white">
              Discover Nearby Vibes
            </h2>
            <p className="text-xs text-zinc-400 max-w-sm mx-auto leading-relaxed">
              VibeQuest connects you with real-time activities and meetups in your area. Allow location access or choose a neighborhood manually to begin.
            </p>
          </div>

          {/* Action 1: Use GPS */}
          <button
            onClick={refreshLocation}
            className="w-full h-12 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-rose-950/20 active:scale-[0.98]"
          >
            <Navigation className="w-4 h-4 fill-current" />
            Enable Device Location
          </button>

          {/* Divider */}
          <div className="flex items-center gap-3">
            <div className="h-px bg-white/5 flex-1" />
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-650">Or choose manual area</span>
            <div className="h-px bg-white/5 flex-1" />
          </div>

          {/* Search Bar */}
          <form onSubmit={handleSearchCity} className="space-y-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search neighborhood or city..."
                className="w-full h-11 bg-zinc-900 border border-white/5 hover:border-white/10 focus:border-rose-500/40 rounded-2xl px-4 pl-10 text-xs text-zinc-100 placeholder-zinc-500 outline-none transition-all"
              />
              <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-3.5" />
              <button
                type="submit"
                disabled={isSearching}
                className="absolute right-2 top-1.5 h-8 px-4 bg-zinc-800 hover:bg-zinc-750 text-xs text-zinc-300 font-bold uppercase rounded-xl transition-all border border-white/5"
              >
                {isSearching ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Find'}
              </button>
            </div>

            {searchError && (
              <div className="flex items-center gap-1.5 text-rose-400 text-[10px] pl-1">
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{searchError}</span>
              </div>
            )}

            {/* Live Search Results */}
            {searchResults.length > 0 && (
              <div className="bg-zinc-900 border border-white/5 rounded-2xl p-1.5 space-y-1 max-h-40 overflow-y-auto">
                {searchResults.map((result, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setManualLocation(result.name, { lat: result.lat, lng: result.lng })}
                    className="w-full px-3.5 py-2.5 rounded-xl hover:bg-white/5 text-left text-[11px] text-zinc-300 hover:text-white flex items-center justify-between transition-colors"
                  >
                    <span className="truncate pr-4">{result.name}</span>
                    <Check className="w-3.5 h-3.5 text-emerald-400 opacity-0 group-hover:opacity-100" />
                  </button>
                ))}
              </div>
            )}
          </form>

          {/* Grid of Popular Cities */}
          <div className="space-y-2.5">
            <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-650 block pl-1">Popular Places</span>
            <div className="grid grid-cols-2 gap-2">
              {POPULAR_CITIES.map((city) => (
                <button
                  key={city.name}
                  onClick={() => setManualLocation(city.name, { lat: city.lat, lng: city.lng })}
                  className="px-3 py-2.5 bg-zinc-900/50 hover:bg-zinc-850 border border-white/5 hover:border-white/10 rounded-xl text-left text-[11px] text-zinc-300 transition-all flex items-center gap-1.5 truncate cursor-pointer active:scale-[0.98]"
                >
                  <Compass className="w-3.5 h-3.5 text-zinc-500 shrink-0" />
                  <span className="truncate">{city.name.split(',')[0]}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <GeolocationContext.Provider
      value={{
        coords,
        cityName,
        accuracy,
        permissionStatus,
        isLoading,
        refreshLocation,
        locationSource,
        setManualLocation,
        clearLocation
      }}
    >
      {children}
    </GeolocationContext.Provider>
  );
};

export const useSharedGeolocation = () => {
  const context = useContext(GeolocationContext);
  if (!context) {
    throw new Error('useSharedGeolocation must be nested within a GeolocationProvider');
  }
  return context;
};
