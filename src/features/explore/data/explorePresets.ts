export interface AutocompleteSuggestion {
  id: string;
  name: string;
  address: string;
  provider: 'Google' | 'Mapbox';
  lat: number;
  lng: number;
}

export const AUTOCOMPLETE_SUGGESTIONS: AutocompleteSuggestion[] = [
  { id: 'g_tunis_medina', name: 'Medina of Tunis', address: 'Tunis, Tunisia', provider: 'Google', lat: 36.7992, lng: 10.1695 },
  { id: 'g_tunis_sidi', name: 'Sidi Bou Said Promenade', address: 'Tunis, Tunisia', provider: 'Google', lat: 36.8703, lng: 10.3421 },
  { id: 'm_tunis_carthage', name: 'Carthage Ruins', address: 'Carthage, Tunisia', provider: 'Mapbox', lat: 36.8530, lng: 10.3235 },
  { id: 'm_tunis_marsa', name: 'La Marsa Beach', address: 'Tunis, Tunisia', provider: 'Mapbox', lat: 36.8797, lng: 10.3256 },
  { id: 'g_sf_dolores', name: 'Dolores Park', address: 'San Francisco, CA', provider: 'Google', lat: 37.7596, lng: -122.4269 },
  { id: 'm_sf_mission', name: 'Mission District', address: 'San Francisco, CA', provider: 'Mapbox', lat: 37.7599, lng: -122.4148 },
  { id: 'g_sf_ggpark', name: 'Golden Gate Park', address: 'San Francisco, CA', provider: 'Google', lat: 37.7694, lng: -122.4862 },
];

export const getTabActiveClass = (tabId: string): string => {
  switch (tabId) {
    case 'All':
      return "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]/30 font-black dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 shadow-sm";
    case 'Food':
      return "bg-[#FEEFC3] text-[#B06000] border-[#B06000]/30 font-black dark:bg-amber-500/20 dark:text-[#fbbf24] dark:border-amber-500/30 shadow-sm";
    case 'cafés':
      return "bg-[#E6F4EA] text-[#137333] border-[#137333]/30 font-black dark:bg-[#d5ead6]/20 dark:text-[#d5ead6] dark:border-[#d5ead6]/30 shadow-sm";
    case 'Culture':
      return "bg-[#F3E8FF] text-[#7E22CE] border-[#7E22CE]/30 font-black dark:bg-purple-500/20 dark:text-purple-300 dark:border-purple-500/30 shadow-sm";
    case 'Art':
      return "bg-[#FCE8E6] text-[#C5221F] border-[#C5221F]/30 font-black dark:bg-pink-500/20 dark:text-pink-300 dark:border-pink-500/30 shadow-sm";
    case 'Venues':
      return "bg-[#E4F7FB] text-[#007B83] border-[#007B83]/30 font-black dark:bg-teal-500/20 dark:text-teal-300 dark:border-teal-500/30 shadow-sm";
    case 'Hidden':
      return "bg-[#E8EAF6] text-[#283593] border-[#283593]/30 font-black dark:bg-indigo-500/20 dark:text-indigo-300 dark:border-indigo-500/30 shadow-sm";
    default:
      return "bg-[#E8F0FE] text-[#1A73E8] border-[#1A73E8]/30 font-black dark:bg-blue-500/20 dark:text-blue-300 dark:border-blue-500/30 shadow-sm";
  }
};
