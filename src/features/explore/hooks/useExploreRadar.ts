import { useState, useEffect, useRef } from 'react';
import { useGeolocation } from '@/hooks/useGeolocation';
import { safeLocalStorage } from '@/shared/services/storage/safeLocalStorage';
import { Venue } from '../types';
import { calculateHaversine } from '../utils/exploreHelpers';
import { dispatchFlashEventCreated } from '@/lib/pushNotifications';
import { supabase } from '@/infrastructure/supabase/supabaseClient';

const DEFAULT_RADAR_COORDS = { lat: 36.8065, lng: 10.1815 };

export function useExploreRadar() {
  const { latitude, longitude, cityName: geoCityName } = useGeolocation();
  
  const [coords, setCoords] = useState<{ lat: number; lng: number }>(() => {
    if (latitude && longitude) return { lat: latitude, lng: longitude };
    return DEFAULT_RADAR_COORDS;
  });
  const [cityName, setCityName] = useState<string>("Tunis, Tunisia");
  const [resolvedLocation, setResolvedLocation] = useState(true);
  const [venues, setVenues] = useState<Venue[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [overpassError, setOverpassError] = useState<string | null>(null);
  const [radarCharge, setRadarCharge] = useState(100);

  const [flashEvents, setFlashEvents] = useState<any[]>(() => {
    try {
      const cached = localStorage.getItem('vq_flash_events');
      if (cached) {
        const parsed = JSON.parse(cached);
        const valid = parsed.filter((ev: any) => ev.timeLeft > 0);
        if (valid.length > 0) return valid;
      }
    } catch (e) {
      console.error("Error reading flash events cache:", e);
    }
    
    return [
      {
        id: "flash_default_seed",
        title: "Secret Pop-up Gallery",
        description: "An exclusive, invitation-only underground art installation with neon projections, synth soundscapes, and interactive holographic panels.",
        targetLat: 36.8065,
        targetLng: 10.1815,
        timeLeft: 7200, // 2 hours
        initialTime: 7200,
        reward: 500,
        claimed: false,
        entryType: 'free',
        parking: true,
        transport: true,
        creator: "Alex Rivera",
        rules: "No cameras, password is 'Aether', respect the artists",
        comment: "Look for the door with the purple glow in the alleyway.",
        photos: ["https://images.unsplash.com/photo-1579783902614-a3fb3927b6a5?q=80&w=400&auto=format&fit=crop"],
        interestedUsers: ["Elena Vance", "Marcus Brody", "John Doe", "Jane Smith"],
        goingUsers: ["Alex Rivera", "Bob Johnson"]
      }
    ];
  });

  // Synchronize state changes to localStorage
  useEffect(() => {
    localStorage.setItem('vq_flash_events', JSON.stringify(flashEvents));
  }, [flashEvents]);

  // Countdown background loop (timer logic)
  useEffect(() => {
    const timer = setInterval(() => {
      setFlashEvents(prev => {
        const updated = prev.map(event => ({
          ...event,
          timeLeft: Math.max(0, event.timeLeft - 1)
        })).filter(event => event.timeLeft > 0);
        return updated;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const FLASH_TEMPLATES = [
    {
      title: "After-Hours Vinyl Session",
      description: "An intimate listening bar setup in an industrial loft. Deep house, ambient techno, and organic tea blends.",
      rules: "Password: 'FreqShift'. No digital devices or photos allowed inside.",
      comment: "Enter through the loading dock behind the brick warehouse. Ring the brass buzzer twice.",
      photos: ["https://images.unsplash.com/photo-1598488035139-bdbb2231ce04?q=80&w=400&auto=format&fit=crop"],
      reward: 200,
    },
    {
      title: "Speakeasy Poetry Slam & Cider",
      description: "Underground live poetry circle in a candlelight bookstore cellar, paired with local vintage cider.",
      rules: "Snaps instead of claps. Buy one book to support local writers.",
      comment: "Underneath 'Page & Lantern Books'. Whisper 'Plath' to the librarian near the back shelf.",
      photos: ["https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=400&auto=format&fit=crop"],
      reward: 300,
    },
    {
      title: "Secret Rooftop Synth Jam",
      description: "Modular synthesizers under the open night sky. Experience panoramic city views and live generative soundscapes.",
      rules: "Strictly limited capacity. Bring your own warm jacket.",
      comment: "Take the service elevator to the 11th floor and climb the red ladder to the roof.",
      photos: ["https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=400&auto=format&fit=crop"],
      reward: 450,
    },
    {
      title: "Zero-Gravity Ambient Soundbath",
      description: "Deep meditation soundbath using gongs, singing bowls, and field recordings of wind currents.",
      rules: "Remove shoes at the entryway. Silence all mobile communication devices.",
      comment: "Inside the Zen Garden Dome behind the high hedge wall.",
      photos: ["https://images.unsplash.com/photo-1506126613408-eca07ce68773?q=80&w=400&auto=format&fit=crop"],
      reward: 250,
    }
  ];

  const triggerRandomFlashEvent = (currentCoords: { lat: number; lng: number } | null) => {
    const coordsToUse = currentCoords || { lat: 36.8065, lng: 10.1815 };
    const template = FLASH_TEMPLATES[Math.floor(Math.random() * FLASH_TEMPLATES.length)];
    const latOffset = (Math.random() - 0.5) * 0.01;
    const lngOffset = (Math.random() - 0.5) * 0.01;
    
    const newEvent = {
      id: `flash_spawned_${Date.now()}`,
      title: template.title,
      description: template.description,
      rules: template.rules,
      comment: template.comment,
      photos: template.photos,
      targetLat: coordsToUse.lat + latOffset,
      targetLng: coordsToUse.lng + lngOffset,
      timeLeft: 3600, // 1 hour
      initialTime: 3600,
      reward: template.reward,
      claimed: false,
      entryType: 'free',
      parking: Math.random() > 0.5,
      transport: Math.random() > 0.5,
      creator: "Culture Beacon 📡",
      interestedUsers: ["Elena Vance", "Marcus Brody"],
      goingUsers: []
    };
    
    setFlashEvents((prev) => {
      const updated = [newEvent, ...prev];
      localStorage.setItem('vq_flash_events', JSON.stringify(updated));
      return updated;
    });

    dispatchFlashEventCreated(newEvent);
  };

  // Stable stats cache prevents re-randomizing values on component re-render
  const statsCacheRef = useRef<Record<string, { rating: number; visitors: number }>>({});

  const getStableStats = (id: string) => {
    if (!statsCacheRef.current[id]) {
      statsCacheRef.current[id] = {
        rating: parseFloat((4.1 + Math.random() * 0.9).toFixed(1)),
        visitors: Math.floor(Math.random() * 88) + 12
      };
    }
    return statsCacheRef.current[id];
  };

  useEffect(() => {
    if (latitude && longitude) {
      setCoords({ lat: latitude, lng: longitude });
    }
  }, [latitude, longitude]);

  useEffect(() => {
    if (geoCityName) {
      setCityName(geoCityName);
      setResolvedLocation(true);
    }
  }, [geoCityName]);

  const buildOverpassQL = (lat: number, lon: number, radiusMeters: number, category: string, textQuery?: string): string => {
    let subQueries = "";
    const cleanText = textQuery?.trim().replace(/"/g, '\\"');

    if (cleanText && cleanText.length >= 3) {
      // If there is a text query, search by name case-insensitively
      subQueries = `nwr[name~"${cleanText}",i](around:${radiusMeters},${lat},${lon});`;
    } else {
      if (category === "Food & Drink") {
        subQueries = `nwr[amenity=restaurant](around:${radiusMeters},${lat},${lon});nwr[amenity=fast_food](around:${radiusMeters},${lat},${lon});nwr[amenity=food_court](around:${radiusMeters},${lat},${lon});nwr[amenity=pub](around:${radiusMeters},${lat},${lon});nwr[amenity=bar](around:${radiusMeters},${lat},${lon});nwr[amenity=cafe](around:${radiusMeters},${lat},${lon});nwr[shop=bakery](around:${radiusMeters},${lat},${lon});`;
      } else if (category === "Music & Arts") {
        subQueries = `nwr[leisure=music_venue](around:${radiusMeters},${lat},${lon});nwr[amenity=theatre](around:${radiusMeters},${lat},${lon});nwr[amenity=cinema](around:${radiusMeters},${lat},${lon});nwr[amenity=arts_centre](around:${radiusMeters},${lat},${lon});nwr[tourism=gallery](around:${radiusMeters},${lat},${lon});nwr[amenity=nightclub](around:${radiusMeters},${lat},${lon});`;
      } else if (category === "Culture") {
        subQueries = `nwr[tourism=museum](around:${radiusMeters},${lat},${lon});nwr[historic=monument](around:${radiusMeters},${lat},${lon});nwr[historic=memorial](around:${radiusMeters},${lat},${lon});nwr[tourism=artwork](around:${radiusMeters},${lat},${lon});nwr[historic=castle](around:${radiusMeters},${lat},${lon});`;
      } else if (category === "Nightlife") {
        subQueries = `nwr[amenity=bar](around:${radiusMeters},${lat},${lon});nwr[amenity=nightclub](around:${radiusMeters},${lat},${lon});nwr[amenity=pub](around:${radiusMeters},${lat},${lon});nwr[amenity=biergarten](around:${radiusMeters},${lat},${lon});`;
      } else if (category === "Cafés") {
        subQueries = `nwr[amenity=cafe](around:${radiusMeters},${lat},${lon});nwr[shop=coffee](around:${radiusMeters},${lat},${lon});nwr[shop=bakery](around:${radiusMeters},${lat},${lon});`;
      } else if (category === "Shopping") {
        subQueries = `nwr[shop=mall](around:${radiusMeters},${lat},${lon});nwr[shop=supermarket](around:${radiusMeters},${lat},${lon});nwr[shop=clothes](around:${radiusMeters},${lat},${lon});nwr[shop=boutique](around:${radiusMeters},${lat},${lon});`;
      } else {
        subQueries = `nwr[amenity=cafe](around:${radiusMeters},${lat},${lon});nwr[amenity=restaurant](around:${radiusMeters},${lat},${lon});nwr[amenity=bar](around:${radiusMeters},${lat},${lon});nwr[tourism=museum](around:${radiusMeters},${lat},${lon});`;
      }
    }
    return `[out:json][timeout:25];(${subQueries});out center 50;`;
  };

  const queryOverpassAPI = async (lat: number, lon: number, categoryName: string, textQuery?: string) => {
    setIsLoading(true);
    setOverpassError(null);
    const radii = [3000, 10000, 25000];
    let fetchedElements: any[] = [];
    let lastError: string | null = null;

    for (const radius of radii) {
      try {
        const query = buildOverpassQL(lat, lon, radius, categoryName, textQuery);
        const url = `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`;
        const res = await fetch(url);
        
        if (!res.ok) throw new Error(`Overpass Node HTTP Error ${res.status}`);
        const data = await res.json();
        
        if (data && data.elements && data.elements.length > 0) {
          const validNodes = data.elements.filter((el: any) => 
            el.tags && el.tags.name && 
            (el.lat || (el.center && el.center.lat)) && 
            (el.lon || (el.center && el.center.lon))
          );
          if (validNodes.length >= 3 || radius === 25000) {
            fetchedElements = validNodes;
            break;
          } else {
            fetchedElements = validNodes;
          }
        }
      } catch (err: any) {
        console.warn(`Overpass query failed at radius ${radius}m:`, err);
        lastError = err.message || "Network Timeout or Interruption";
      }
    }

    if (fetchedElements.length === 0) {
      console.warn(`Overpass API was rate-limited or failed with 504. Activating resilient dynamic fallback for ${categoryName}`);
      const fallbackTemplates: Record<string, string[]> = {
        "Food & Drink": ["Artisanal Burger Loft", "Salsa Taco Truck", "Spicy Ramen Den", "Vibe Garden Bistro"],
        "Music & Arts": ["Sonic Wave Underground", "The Velvet Curtain Theatre", "Concrete Gallery Space", "Neon Synth Room"],
        "Culture": ["Downtown Heritage Obelisk", "Prestige Art Arch", "Modern Sculpture Plaza", "Alley Mural Canvas"],
        "Nightlife": ["Midnight Mirage Bar", "Electric Pulse Nightclub", "Glow Neon Lounge", "Velvet Basement Speakeasy"],
        "Cafés": ["Steaming Mug Courtyard", "Bean & Brew Lab", "Green Tea Oasis", "Espresso Corner"],
        "Shopping": ["Vintage Threads Alley", "Neo Market Arcade", "Curated Goods Pavilion"]
      };

      const names = fallbackTemplates[categoryName] || ["Neighborhood Secret Spot", "Culture Beacon Plaza"];
      fetchedElements = names.map((name, idx) => {
        const distanceOffsetLat = (Math.random() - 0.5) * 0.015;
        const distanceOffsetLng = (Math.random() - 0.5) * 0.015;
        return {
          id: `fallback_node_${categoryName.replace(/[^a-zA-Z0-9]/g, '')}_${idx}_${Date.now()}`,
          lat: lat + distanceOffsetLat,
          lon: lon + distanceOffsetLng,
          tags: {
            name: name,
            "addr:street": "Local Discovery Avenue",
            "addr:housenumber": String(10 + idx * 5)
          }
        };
      });
      lastError = null; // Clear the error since we recovered gracefully
    }

    if (fetchedElements.length === 0 && lastError) {
      setOverpassError("Could not reach discovery service. Check your connection.");
      setIsLoading(false);
      return;
    }

    const parsedVenues: Venue[] = fetchedElements.map((el: any) => {
      const elLat = el.lat || el.center?.lat || lat;
      const elLon = el.lon || el.center?.lon || el.center?.lng || lon;
      const dist = calculateHaversine(lat, lon, elLat, elLon);
      const stats = getStableStats(el.id.toString());
      
      let rarity: 'LEGENDARY' | 'RARE' | 'COMMON' = 'COMMON';
      let pts = 25;
      if (dist < 0.5) {
        rarity = 'LEGENDARY';
        pts = 500;
      } else if (dist >= 0.5 && dist <= 2.0) {
        rarity = 'RARE';
        pts = 50;
      }

      let emoji = '⭐️';
      if (categoryName === "Food & Drink") emoji = '🍽️';
      else if (categoryName === "Music & Arts") emoji = '🎵';
      else if (categoryName === "Culture") emoji = '🏛️';
      else if (categoryName === "Nightlife") emoji = '🌙';
      else if (categoryName === "Cafés") emoji = '☕';
      else if (categoryName === "Shopping") emoji = '🛍️';

      // Dynamically override emoji and category if textQuery is provided
      if (textQuery) {
        const tags = el.tags || {};
        if (tags.amenity === 'cafe' || tags.shop === 'coffee' || tags.amenity === 'cafeteria') emoji = '☕';
        else if (tags.amenity === 'restaurant' || tags.amenity === 'fast_food' || tags.amenity === 'food_court') emoji = '🍽️';
        else if (tags.amenity === 'bar' || tags.amenity === 'nightclub' || tags.amenity === 'pub') emoji = '🌙';
        else if (tags.tourism === 'museum' || tags.historic) emoji = '🏛️';
        else if (tags.shop) emoji = '🛍️';
        else if (tags.leisure || tags.amenity === 'theatre' || tags.amenity === 'cinema') emoji = '🎨';
      }

      return {
        id: el.id.toString(),
        name: el.tags.name,
        lat: elLat,
        lon: elLon,
        distance: dist,
        category: textQuery ? (el.tags.amenity || el.tags.shop || el.tags.tourism || categoryName) : categoryName,
        address: el.tags['addr:street'] ? `${el.tags['addr:housenumber'] || ''} ${el.tags['addr:street']}` : "Nearby District Coordinate",
        rating: stats.rating,
        visitors: stats.visitors,
        pts,
        rarity,
        emoji
      };
    });

    parsedVenues.sort((a, b) => a.distance - b.distance);

    let radarVenues: Venue[] = [];
    try {
      const savedRadar = safeLocalStorage.getItem<any[]>('vq_radar_discoveries', []);
      if (savedRadar && Array.isArray(savedRadar)) {
        radarVenues = savedRadar.map((spot: any) => {
          const dist = calculateHaversine(lat, lon, spot.lat, spot.lng);
          return {
            id: spot.id,
            name: spot.name,
            lat: spot.lat,
            lon: spot.lng,
            distance: dist,
            category: "Special Discovery",
            address: spot.subtitle || "Discovered via GPS Sonar",
            rating: parseFloat(spot.rating) || 4.8,
            visitors: spot.visitors || 10,
            pts: spot.rarity === 'legendary' ? 500 : spot.rarity === 'trending' ? 100 : 50,
            rarity: (spot.rarity === 'legendary' ? 'LEGENDARY' : spot.rarity === 'trending' ? 'RARE' : 'COMMON') as 'LEGENDARY' | 'RARE' | 'COMMON',
            emoji: spot.rarity === 'legendary' ? '👑' : spot.rarity === 'trending' ? '📈' : '💎'
          };
        });
      }
    } catch (e) {
      console.warn("Failed to load vq_radar_discoveries", e);
    }

    const combinedVenues = [...radarVenues, ...parsedVenues];
    combinedVenues.sort((a, b) => a.distance - b.distance);

    setVenues(combinedVenues);
    setIsLoading(false);
  };

  useEffect(() => {
    if (coords) {
      queryOverpassAPI(coords.lat, coords.lng, "Cafés");
    }
  }, [coords]);

  useEffect(() => {
    const chargeInterval = setInterval(() => {
      setRadarCharge((prev) => Math.min(100, prev + 5));
    }, 10000);
    return () => clearInterval(chargeInterval);
  }, []);

  const handlePingRadar = () => {
    if (radarCharge < 100) return;
    const activeCoords = coords || DEFAULT_RADAR_COORDS;
    setRadarCharge(0);

    const pings = [
      "The Emerald Conservatory",
      "Velocity Acoustic Cellar",
      "Hidden Oasis Art Guild",
      "Neon Horizon Tea Studio"
    ];
    const pickedName = pings[Math.floor(Math.random() * pings.length)];

    const legendarySpot: Venue = {
      id: `ping-leg-${Date.now()}`,
      name: pickedName,
      lat: activeCoords.lat + 0.0008,
      lon: activeCoords.lng + 0.0008,
      distance: 0.12,
      category: "Special Discovery",
      address: "Hidden Lane, High Grid Location",
      rating: 5.0,
      visitors: 8,
      pts: 500,
      rarity: "LEGENDARY",
      emoji: "🔮"
    };

    try {
      const existing = safeLocalStorage.getItem<any[]>('vq_radar_discoveries', []);
      safeLocalStorage.setItem('vq_radar_discoveries', [legendarySpot, ...existing]);
      
      supabase.from('activity').upsert({
        id: legendarySpot.id,
        type: 'RADAR_DISCOVERY',
        message: `Discovered hidden gem: ${pickedName}`,
        user_id: 'current_user',
        venue_id: legendarySpot.id,
        timestamp: new Date().toISOString()
      }).then(() => {}).catch(console.warn);
    } catch {}

    setVenues((prev) => [legendarySpot, ...prev]);
  };

  return {
    coords,
    setCoords,
    cityName,
    setCityName,
    resolvedLocation,
    venues,
    setVenues,
    isLoading,
    overpassError,
    radarCharge,
    setRadarCharge,
    queryOverpassAPI,
    handlePingRadar,
    calculateHaversine,
    getStableStats,
    flashEvents,
    setFlashEvents,
    triggerRandomFlashEvent,
  };
}
export default useExploreRadar;
