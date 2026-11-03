import { safeLocalStorage } from '@/shared/services/storage/safeLocalStorage';
import { venueCheckInStore } from '@/services/venueCheckInStore';
import { Venue } from '../types';

export const calculateHaversine = (lat1: number, lon1: number, lat2: number, lon2: number): number => {
  const R = 6371; // Earth radius in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(2));
};

export const getVenuePhoto = (name: string, category: string): string => {
  const lowercaseName = name.toLowerCase();
  
  if (lowercaseName.includes("sidi bou said") || lowercaseName.includes("nattes") || lowercaseName.includes("cliffside")) {
    return "https://images.unsplash.com/photo-1549488344-1f9b8d2bd1f3?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("medina") || lowercaseName.includes("tunis") || lowercaseName.includes("old quarter")) {
    return "https://images.unsplash.com/photo-1588668214407-6eb9527132b6?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("carthage") || lowercaseName.includes("monument") || lowercaseName.includes("historic")) {
    return "https://images.unsplash.com/photo-1541432901042-2d8bd64b4a9b?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("sightglass")) {
    return "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("blue note") || lowercaseName.includes("jazz") || lowercaseName.includes("music")) {
    return "https://images.unsplash.com/photo-1486591978090-58e619d37fe7?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("clarion") || lowercaseName.includes("mural") || lowercaseName.includes("graffiti")) {
    return "https://images.unsplash.com/photo-1561214115-f2f134cc4912?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("grand lake") || lowercaseName.includes("theater") || lowercaseName.includes("cinema")) {
    return "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("temescal") || lowercaseName.includes("park") || lowercaseName.includes("lake")) {
    return "https://images.unsplash.com/photo-1502082553048-f009c37129b9?auto=format&fit=crop&w=500&h=350&q=80";
  }
  if (lowercaseName.includes("red bay") || lowercaseName.includes("roastery")) {
    return "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&h=350&q=80";
  }

  if (category.toLowerCase().includes("cafe") || category.toLowerCase().includes("café")) {
    const cafeList = [
      "https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=500&h=350&q=80",
      "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=500&h=350&q=80",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=500&h=350&q=80"
    ];
    return cafeList[name.length % cafeList.length];
  }

  if (category.toLowerCase().includes("food") || category.toLowerCase().includes("restaurant") || category.toLowerCase().includes("dining")) {
    const diningList = [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=500&h=350&q=80",
      "https://images.unsplash.com/photo-1552566626-52f8b828add9?auto=format&fit=crop&w=500&h=350&q=80",
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&h=350&q=80"
    ];
    return diningList[name.length % diningList.length];
  }

  if (category.toLowerCase().includes("night") || category.toLowerCase().includes("bar") || category.toLowerCase().includes("club")) {
    return "https://images.unsplash.com/photo-1543007630-9710e4a00a20?auto=format&fit=crop&w=500&h=350&q=80";
  }

  if (category.toLowerCase().includes("culture") || category.toLowerCase().includes("museum") || category.toLowerCase().includes("historic")) {
    return "https://images.unsplash.com/photo-1566121318599-23efdef25e1a?auto=format&fit=crop&w=500&h=350&q=80";
  }

  if (category.toLowerCase().includes("shop") || category.toLowerCase().includes("store") || category.toLowerCase().includes("boutique")) {
    return "https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&h=350&q=80";
  }

  return "https://images.unsplash.com/photo-1498804103079-a6351b050096?auto=format&fit=crop&w=500&h=350&q=80";
};

export const getRawConfirmations = (v: Venue): number => {
  const saved = safeLocalStorage.getItem<string | null>(`vq_confidence_${v.id}`, null);
  const baseConfirmations = Math.max(3, Math.round((v.visitors || 12) / 4));
  if (saved !== null) {
    const diff = parseInt(saved) - Math.round(v.rating * 20);
    if (diff > 0) return baseConfirmations + Math.round(diff / 5);
    if (diff < 0) return Math.max(1, baseConfirmations - Math.round(Math.abs(diff) / 10));
  }
  return baseConfirmations;
};

export const getVenueConfidence = (v: Venue): number => {
  const saved = safeLocalStorage.getItem<string | null>(`vq_confidence_${v.id}`, null);
  if (saved !== null) {
    return parseInt(saved);
  }
  const baseConf = Math.round(v.rating * 20);
  return Math.min(100, Math.max(10, baseConf));
};

export const updateVenueConfidence = (v: Venue, change: number) => {
  const current = getVenueConfidence(v);
  const updated = Math.min(100, Math.max(10, current + change));
  safeLocalStorage.setItem(`vq_confidence_${v.id}`, updated.toString());
};

export const getVenueVibe = (v: Venue): string => {
  const c = (v.category || '').toLowerCase();
  if (c.includes('café') || v.category?.includes('coffee') || c.includes('tea')) return 'Cozy';
  if (c.includes('food') || c.includes('restaurant') || c.includes('dining')) return 'Chilled';
  if (c.includes('night') || c.includes('bar') || c.includes('club')) return 'Hype';
  if (c.includes('culture') || c.includes('museum') || c.includes('history')) return 'Quiet';
  if (c.includes('art') || c.includes('gallery') || c.includes('creative')) return 'Inspiring';
  if (c.includes('shopping') || c.includes('store') || c.includes('boutique')) return 'Trendy';
  return 'Cozy';
};

export const getVenueMatchInfo = (
  v: Venue,
  profile: any,
  joinedCommunityIds: string[]
): { score: number; breakdown: { label: string; value: number }[] } => {
  const userInterests = (profile?.interests || ['coffee', 'music', 'art', 'culture', 'cozy nooks']).map((i: string) => i.toLowerCase());
  const userActivities = (profile?.activities || ['exploring', 'drinking coffee', 'listening to loops', 'urban walking']).map((a: string) => a.toLowerCase());
  const userHandle = profile?.handle || 'me';

  const category = (v.category || '').toLowerCase();
  const name = (v.name || '').toLowerCase();

  let score = 55;
  const breakdown: { label: string; value: number }[] = [];

  // 1. Interests Alignment
  let interestBoost = 0;
  if (category.includes('café') || category.includes('coffee') || category.includes('tea') || name.includes('brew') || name.includes('roast')) {
    if (userInterests.some(i => i.includes('coffee') || i.includes('cafe') || i.includes('cozy') || i.includes('tea'))) {
      interestBoost = 15;
    }
  } else if (category.includes('food') || category.includes('restaurant') || category.includes('dining') || name.includes('kitchen') || name.includes('bistro')) {
    if (userInterests.some(i => i.includes('food') || i.includes('dining') || i.includes('restaurant') || i.includes('bistro'))) {
      interestBoost = 12;
    }
  } else if (category.includes('culture') || category.includes('museum') || category.includes('art') || category.includes('history') || name.includes('monument') || name.includes('historic')) {
    if (userInterests.some(i => i.includes('art') || i.includes('culture') || i.includes('museum') || i.includes('history') || i.includes('monument'))) {
      interestBoost = 15;
    }
  } else if (category.includes('shopping') || category.includes('store') || category.includes('shop') || name.includes('market') || name.includes('boutique')) {
    if (userInterests.some(i => i.includes('shop') || i.includes('fashion') || i.includes('market') || i.includes('boutique'))) {
      interestBoost = 10;
    }
  }

  if (interestBoost > 0) {
    score += interestBoost;
    breakdown.push({ label: 'Interest Alignment', value: interestBoost });
  }

  // 2. Check-In History Matching
  const checkIns = venueCheckInStore.getCheckIns();
  const userCheckIns = checkIns.filter(ci => ci.userId === profile?.id || ci.userId === 'current_user' || ci.userName?.includes(userHandle));
  const hasCheckedInHere = userCheckIns.some(ci => ci.venueId === v.id);

  let checkInBoost = 0;
  if (hasCheckedInHere) {
    checkInBoost = 18;
    breakdown.push({ label: 'Checked-in Before', value: 18 });
  } else {
    const catCheckIns = userCheckIns.filter(ci => {
      const vibe = (ci.vibe || '').toLowerCase();
      return (vibe.includes('cozy') && category.includes('café')) ||
             (vibe.includes('chilled') && category.includes('food')) ||
             (vibe.includes('hype') && category.includes('night')) ||
             (vibe.includes('quiet') && category.includes('culture')) ||
             (vibe.includes('inspiring') && category.includes('art'));
    });
    if (catCheckIns.length > 0) {
      checkInBoost = Math.min(15, catCheckIns.length * 5);
      breakdown.push({ label: 'Frequent Category Vibe', value: checkInBoost });
    }
  }
  score += checkInBoost;

  // 3. Likes and Favorites (High resonance checking)
  let favoriteBoost = 0;
  const isFavorited = safeLocalStorage.getItem<boolean>(`vq_favorite_venue_${v.id}`, false);
  if (isFavorited) {
    favoriteBoost = 15;
    breakdown.push({ label: 'Favorited Spot', value: 15 });
  } else {
    const activityMatches = userActivities.filter(act => category.includes(act) || name.includes(act));
    if (activityMatches.length > 0) {
      favoriteBoost = Math.min(10, activityMatches.length * 4);
      breakdown.push({ label: 'Lifestyle Sync', value: favoriteBoost });
    }
  }
  score += favoriteBoost;

  // 4. Communities and Circles Alignment
  let communityBoost = 0;
  if (joinedCommunityIds && joinedCommunityIds.length > 0) {
    const matchCircle = joinedCommunityIds.some(cid => {
      const cidLower = cid.toLowerCase();
      return (cidLower.includes('coffee') && category.includes('café')) ||
             (cidLower.includes('art') && category.includes('art')) ||
             (cidLower.includes('music') && category.includes('music')) ||
             (cidLower.includes('monument') && category.includes('culture'));
    });
    if (matchCircle) {
      communityBoost = 12;
      breakdown.push({ label: 'Community Vibe Circle', value: 12 });
    } else {
      communityBoost = 4;
      breakdown.push({ label: 'Citizen Network Sync', value: 4 });
    }
  }
  score += communityBoost;

  // 5. Stable Temporal Hour Synergy
  const hour = new Date().getHours();
  let timeBoost = 3;
  if ((category.includes('café') || category.includes('coffee')) && (hour >= 7 && hour <= 12)) {
    timeBoost = 8;
    breakdown.push({ label: 'Morning Coffee Hour', value: 8 });
  } else if (category.includes('food') && ((hour >= 12 && hour <= 14) || (hour >= 18 && hour <= 21))) {
    timeBoost = 8;
    breakdown.push({ label: 'Peak Dining Synergy', value: 8 });
  } else {
    breakdown.push({ label: 'Stable Base Signal', value: 3 });
  }
  score += timeBoost;

  return {
    score: Math.min(99, Math.max(38, score)),
    breakdown
  };
};
