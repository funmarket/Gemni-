import { useState, useEffect } from 'react';
import { Venue } from '../types';

export function useVenueSearch(
  venues: Venue[],
  initialSearch: string,
  initialCategory: string,
  coords: { lat: number; lng: number } | null,
  queryOverpassAPI: (lat: number, lon: number, category: string, textQuery?: string) => Promise<void>
) {
  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const [activeTab, setActiveTab] = useState<'All' | 'Food' | 'cafés' | 'Culture' | 'Art' | 'Venues' | 'Hidden'>(
    initialCategory === 'art' ? 'Art' :
    initialCategory === 'music' ? 'Venues' :
    initialCategory === 'Cafe / Roastery' ? 'cafés' : 'All'
  );
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  useEffect(() => {
    if (initialSearch) {
      setActiveTab('All');
      setSearchQuery(initialSearch === 'radar_all' ? '' : initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialCategory) {
      const tabVal = initialCategory === 'art' ? 'Art' :
                     initialCategory === 'music' ? 'Venues' :
                     initialCategory === 'Cafe / Roastery' ? 'cafés' : 'All';
      setActiveTab(tabVal);
    }
  }, [initialCategory]);

  // Dynamic debounced Overpass API querying when searchQuery changes
  useEffect(() => {
    if (!coords) return;
    const cleanQuery = searchQuery.trim();
    if (cleanQuery.length >= 3) {
      const handler = setTimeout(() => {
        let cat = "Cafés";
        if (activeTab === "Food") cat = "Food & Drink";
        else if (activeTab === "cafés") cat = "Cafés";
        else if (activeTab === "Culture") cat = "Culture";
        else if (activeTab === "Art") cat = "Music & Arts";
        else if (activeTab === "Venues") cat = "Shopping";
        else if (activeTab === "Hidden") cat = "Nightlife";
        queryOverpassAPI(coords.lat, coords.lng, cat, cleanQuery);
      }, 500);
      return () => clearTimeout(handler);
    } else if (cleanQuery.length === 0) {
      // Re-trigger category-based search when search is cleared
      const handler = setTimeout(() => {
        let cat = "Cafés";
        if (activeTab === "Food") cat = "Food & Drink";
        else if (activeTab === "cafés") cat = "Cafés";
        else if (activeTab === "Culture") cat = "Culture";
        else if (activeTab === "Art") cat = "Music & Arts";
        else if (activeTab === "Venues") cat = "Shopping";
        else if (activeTab === "Hidden") cat = "Nightlife";
        queryOverpassAPI(coords.lat, coords.lng, cat);
      }, 300);
      return () => clearTimeout(handler);
    }
  }, [searchQuery, coords, activeTab]);

  const handleTabSelect = (tabId: string) => {
    setActiveTab(tabId as any);
    if (!coords) return;

    if (tabId === 'Food') {
      setSelectedCategory("Food & Drink");
      queryOverpassAPI(coords.lat, coords.lng, "Food & Drink", searchQuery.trim() || undefined);
    } else if (tabId === 'cafés') {
      setSelectedCategory("Cafés");
      queryOverpassAPI(coords.lat, coords.lng, "Cafés", searchQuery.trim() || undefined);
    } else if (tabId === 'Culture') {
      setSelectedCategory("Culture");
      queryOverpassAPI(coords.lat, coords.lng, "Culture", searchQuery.trim() || undefined);
    } else if (tabId === 'Art') {
      setSelectedCategory("Music & Arts");
      queryOverpassAPI(coords.lat, coords.lng, "Music & Arts", searchQuery.trim() || undefined);
    } else if (tabId === 'Venues') {
      setSelectedCategory("Shopping");
      queryOverpassAPI(coords.lat, coords.lng, "Shopping", searchQuery.trim() || undefined);
    } else if (tabId === 'Hidden') {
      setSelectedCategory("Nightlife");
      queryOverpassAPI(coords.lat, coords.lng, "Nightlife", searchQuery.trim() || undefined);
    } else {
      setSelectedCategory(null);
      queryOverpassAPI(coords.lat, coords.lng, "Cafés", searchQuery.trim() || undefined);
    }
  };

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    if (coords) {
      queryOverpassAPI(coords.lat, coords.lng, categoryName, searchQuery.trim() || undefined);
    }
  };

  const filteredVenues = venues.filter((v) => {
    const cleanQuery = searchQuery.trim().toLowerCase();
    const queryMatch = !cleanQuery || 
                       v.name.toLowerCase().includes(cleanQuery) || 
                       v.category.toLowerCase().includes(cleanQuery) ||
                       v.address.toLowerCase().includes(cleanQuery);

    let tabMatch = true;
    if (cleanQuery.length === 0) {
      if (activeTab === 'Food') {
        tabMatch = v.category === 'Food & Drink' || v.category.toLowerCase().includes('food') || v.category.toLowerCase().includes('restaurant') || v.emoji === '🍽️';
      } else if (activeTab === 'cafés') {
        tabMatch = v.category === 'Cafés' || v.category.toLowerCase().includes('cafe') || v.category.toLowerCase().includes('coffee') || v.emoji === '☕';
      } else if (activeTab === 'Culture') {
        tabMatch = v.category === 'Culture' || v.category.toLowerCase().includes('culture') || v.emoji === '🏛️';
      } else if (activeTab === 'Art') {
        tabMatch = v.category === 'Music & Arts' || v.category.toLowerCase().includes('art') || v.category.toLowerCase().includes('music') || v.emoji === '🎵' || v.emoji === '🎨';
      } else if (activeTab === 'Venues') {
        tabMatch = v.category === 'Shopping' || v.category.toLowerCase().includes('shop') || v.category.toLowerCase().includes('mall') || v.emoji === '🛍️' || v.category.toLowerCase().includes('venue');
      } else if (activeTab === 'Hidden') {
        tabMatch = v.rarity === 'LEGENDARY' || v.rarity === 'RARE' || v.name.toLowerCase().includes('emerald') || v.name.toLowerCase().includes('hidden') || v.emoji === '🔮';
      }
    }

    return queryMatch && tabMatch;
  });

  return {
    searchQuery,
    setSearchQuery,
    activeTab,
    setActiveTab,
    selectedCategory,
    setSelectedCategory,
    handleTabSelect,
    handleCategorySelect,
    filteredVenues
  };
}
export default useVenueSearch;
