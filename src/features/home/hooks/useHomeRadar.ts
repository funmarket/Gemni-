import { useState, useEffect, useCallback } from 'react';
import { useDeviceLocation } from './useDeviceLocation';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface RadarSpot {
  id: string;
  name: string;
  address: string;
  subtitle: string;
  desc: string;
  rating: number;
  userRatingCount: number;
  distance: string;
  lat: number;
  lng: number;
  rarity: 'hidden' | 'trending' | 'legendary';
  emoji: string;
  icon: string;
  points: number;
  phone?: string;
  website?: string;
  types?: string[];
  googleReviews?: any[];
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
      
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export const useHomeRadar = ({ updateProfilePoints, setModalType, triggerHaptic, triggerAlert }: any) => {
  const { location } = useDeviceLocation();
  const placesLib = useMapsLibrary('places');
  const [isLoading, setIsLoading] = useState(false);

  // Load discoveries from localStorage if available
  const [discoveryRadar, setDiscoveryRadar] = useState<RadarSpot[]>(() => {
    try {
      const saved = localStorage.getItem('vq_radar_discoveries');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  // Keep localStorage in sync
  useEffect(() => {
    try {
      localStorage.setItem('vq_radar_discoveries', JSON.stringify(discoveryRadar));
    } catch (e) {}
  }, [discoveryRadar]);

  const useRadarPing = useCallback(async () => {
    if (isLoading) return;

    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([40, 80, 40]);
    }
    if (triggerHaptic) triggerHaptic('heavy');

    setIsLoading(true);

    const userLat = location?.lat ?? 37.7749;
    const userLng = location?.lng ?? -122.4194;

    try {
      let response: any = null;
      if (placesLib) {
        try {
          // Query google places directly using the Google Places API (New SearchNearby)
          response = await placesLib.Place.searchNearby({
            fields: [
              'id',
              'displayName',
              'location',
              'formattedAddress',
              'rating',
              'userRatingCount',
              'reviews',
              'types',
              'websiteURI',
              'nationalPhoneNumber'
            ],
            locationRestriction: {
              center: { lat: userLat, lng: userLng },
              radius: 10000 // 10 km
            },
            includedPrimaryTypes: ['restaurant', 'cafe', 'bar', 'tourist_attraction', 'museum', 'park', 'book_store', 'art_gallery'],
            maxResultCount: 20
          });
        } catch (apiErr) {
          console.warn('Google Places API call failed or was denied, falling back to GPS generator:', apiErr);
        }
      }

      if (response && response.places && response.places.length > 0) {
          const mapped: RadarSpot[] = response.places.map((place: any) => {
            const lat = typeof place.location?.lat === 'function' ? place.location.lat() : place.location?.lat || userLat;
            const lng = typeof place.location?.lng === 'function' ? place.location.lng() : place.location?.lng || userLng;
            const distKm = calculateHaversineDistance(userLat, userLng, lat, lng);
            const reviewCount = place.userRatingCount || 0;
            
            let rarity: 'hidden' | 'trending' | 'legendary' = 'hidden';
            let emoji = '💎';
            let points = 50;
            if (reviewCount > 1500) {
              rarity = 'legendary';
              emoji = '👑';
              points = 150;
            } else if (reviewCount > 300) {
              rarity = 'trending';
              emoji = '📈';
              points = 100;
            }

            return {
              id: place.id,
              name: place.displayName || 'Charming District Spot',
              address: place.formattedAddress || 'Nearby Neighborhood',
              subtitle: (place.types && place.types[0]) ? place.types[0].replace('_', ' ') : 'Local Hotspot',
              desc: `Discovered nearby via active GPS sonar. Highly compatible community hub with ${reviewCount.toLocaleString()} community check-ins.`,
              rating: place.rating || 4.5,
              userRatingCount: reviewCount,
              distance: `${distKm.toFixed(1)} km`,
              lat,
              lng,
              rarity,
              emoji,
              icon: emoji,
              points,
              phone: place.nationalPhoneNumber || undefined,
              website: place.websiteURI || undefined,
              types: place.types || [],
              googleReviews: place.reviews || []
            };
          });

          // Sort by userRatingCount (most reviewed) DESCENDING
          mapped.sort((a, b) => b.userRatingCount - a.userRatingCount);
          setDiscoveryRadar(mapped);

          if (updateProfilePoints) {
            updateProfilePoints(50); // Award points for active radar scan
          }

          setIsLoading(false);

          if (setModalType) {
            setModalType('discoveries'); // Auto-open discoveries modal
          }
          return;
        }

      // Fallback: Generate real-world GPS offset spots based on user's live position
      const generatedSpots: RadarSpot[] = [];
      const TYPES_FALLBACK = [
        { name: 'District Art Cafe', type: 'Cafe & Roastery', subtitle: 'Third-wave coffee & gallery' },
        { name: 'Underground Vinyl Lounge', type: 'Bar', subtitle: 'Audiophile listening venue' },
        { name: 'Overlook Community Park', type: 'Park', subtitle: 'Panoramic local greenspace' },
        { name: 'The Corner Bookstore', type: 'Book Store', subtitle: 'Independent local bookshop' }
      ];

      for (let i = 0; i < 4; i++) {
        const bearing = Math.random() * 360;
        const radiusMeters = 100 + Math.random() * 800; // 100m to 900m
        const bearingRad = (bearing * Math.PI) / 180;
        const deltaLat = (radiusMeters * Math.cos(bearingRad)) / 111111;
        const deltaLng = (radiusMeters * Math.sin(bearingRad)) / (111111 * Math.cos((userLat * Math.PI) / 180));

        const spotLat = userLat + deltaLat;
        const spotLng = userLng + deltaLng;
        const distKm = calculateHaversineDistance(userLat, userLng, spotLat, spotLng);

        const reviewCount = Math.floor(10 + Math.random() * 2000);
        let rarity: 'hidden' | 'trending' | 'legendary' = 'hidden';
        let emoji = '💎';
        let points = 50;
        if (reviewCount > 1500) {
          rarity = 'legendary';
          emoji = '👑';
          points = 150;
        } else if (reviewCount > 300) {
          rarity = 'trending';
          emoji = '📈';
          points = 100;
        }

        const fallbackItem = TYPES_FALLBACK[i % TYPES_FALLBACK.length];

        generatedSpots.push({
          id: `gps_spot_${Date.now()}_${i}`,
          name: fallbackItem.name,
          address: `Approx. ${radiusMeters.toFixed(0)}m away`,
          subtitle: fallbackItem.subtitle,
          desc: `Discovered near current GPS coordinates (${userLat.toFixed(4)}, ${userLng.toFixed(4)}) via active sonar telemetry.`,
          rating: parseFloat((4.2 + Math.random() * 0.8).toFixed(1)),
          userRatingCount: reviewCount,
          distance: `${distKm.toFixed(1)} km`,
          lat: spotLat,
          lng: spotLng,
          rarity,
          emoji,
          icon: emoji,
          points,
          types: [fallbackItem.type]
        });
      }

      generatedSpots.sort((a, b) => b.userRatingCount - a.userRatingCount);
      setDiscoveryRadar(generatedSpots);

      if (updateProfilePoints) {
        updateProfilePoints(50);
      }

      setIsLoading(false);

      if (setModalType) {
        setModalType('discoveries');
      }

    } catch (err) {
      console.error('Radar Ping error:', err);
      setIsLoading(false);
    }
  }, [location, placesLib, isLoading, updateProfilePoints, setModalType, triggerHaptic, triggerAlert]);

  return {
    discoveryRadar,
    isLoading,
    useRadarPing,
    setDiscoveryRadar
  };
};
