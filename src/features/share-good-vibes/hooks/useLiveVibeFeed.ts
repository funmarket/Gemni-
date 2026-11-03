import { useState, useEffect } from 'react';
import { triggerHaptic } from '@/shared/services/device/haptics';
import { vibeStreamService } from '../services/vibeStreamService';
import { socialContentDomain } from '@/domains/d12_social_content';

export const useLiveVibeFeed = (profile: any, updateProfilePoints: (pts: number) => Promise<void>) => {
  const [liveActivities, setLiveActivities] = useState<any[]>([]);
  const [nearbyVibesOnly, setNearbyVibesOnly] = useState(false);

  // Load custom user vibes and combine with default mock activities
  useEffect(() => {
    try {
      const saved = vibeStreamService.getCustomPosts();
      
      const zoneToTag: Record<string, string> = {
        'CHILLED': 'Chill',
        'CREATIVE': 'Creative',
        'AMBER': 'Energetic',
        'COZY': 'Reflective',
        'WARM': 'Playful'
      };

      const tagColors: Record<string, string> = {
        Chill: "bg-rose-950/40 border-rose-500/20 text-rose-300",
        Creative: "bg-amber-950/40 border-amber-500/20 text-amber-300",
        Energetic: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300",
        Reflective: "bg-blue-950/40 border-blue-500/20 text-blue-300",
        Playful: "bg-purple-950/40 border-purple-500/20 text-purple-300"
      };

      const customMapped = saved.map((post: any) => {
        const tag = zoneToTag[post.zone] || 'Chill';
        return {
          id: post.id,
          text: post.text,
          sub: "0.1km away • Verified Location",
          icon: post.avatar || "✨",
          expiresIn: "Active",
          vibeTag: tag,
          user: post.author || `@${profile?.handle || 'self_node'}`,
          compatibility: "100%",
          color: tagColors[tag] || "bg-rose-950/40 border-rose-500/20 text-rose-300",
          backPhoto: post.image,
          timestamp: post.timestamp,
          isMyVibe: true
        };
      });

      const defaults = [
        { 
          id: 'vibe-1', 
          text: "Dolores sunset drum circle vibe check", 
          sub: "Energizing beat • 0.3km away • DualCam captured", 
          icon: "🥁", 
          expiresIn: "4m left", 
          vibeTag: "Energetic",
          user: "@tribesman", 
          compatibility: "96%",
          color: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300",
          latitude: 37.7596,
          longitude: -122.4269
        },
        { 
          id: 'vibe-2', 
          text: "Quiet coffee corner journaling", 
          sub: "Rainy-day focus • 0.5km away • DualCam captured", 
          icon: "☕", 
          expiresIn: "11m left", 
          vibeTag: "Chill",
          user: "@luna_scribe", 
          compatibility: "91%",
          color: "bg-rose-950/40 border-rose-500/20 text-rose-300",
          latitude: 37.7608,
          longitude: -122.4251
        },
        { 
          id: 'vibe-3', 
          text: "Mural spray-painting on 24th Street", 
          sub: "Creative collective flow • 0.8km away", 
          icon: "🎨", 
          expiresIn: "6m left", 
          vibeTag: "Creative",
          user: "@aero_sole", 
          compatibility: "88%",
          color: "bg-amber-950/40 border-amber-500/20 text-amber-300",
          latitude: 37.7523,
          longitude: -122.4184
        }
      ];

      setLiveActivities([...customMapped, ...defaults]);
    } catch (err) {
      console.warn("Failed to load custom activities:", err);
    }
  }, [profile?.handle]);

  // Live community activity ticker simulation loop with ephemerality and timers
  useEffect(() => {
    const actPool = [
      { text: "Sarah joined a quiet reading nook", sub: "Sunset vibes • 0.3km away", icon: "📖", vibeTag: "Reflective", color: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300", user: "@sarah_read", compatibility: "94%", latitude: 37.7580, longitude: -122.4275 },
      { text: "Alex posted dual view of Presidio sunset", sub: "Fog & golden sky • 1.2km away • DualCam", icon: "🌉", vibeTag: "Reflective", color: "bg-blue-950/40 border-blue-500/20 text-blue-300", user: "@alex_gold", compatibility: "97%", latitude: 37.7985, longitude: -122.4661 },
      { text: "Mike sharing ambient synths at Dolores", sub: "Cosmic loops • 0.5km away", icon: "🎹", vibeTag: "Creative", color: "bg-amber-950/40 border-amber-500/20 text-amber-300", user: "@mike_ambient", compatibility: "89%", latitude: 37.7591, longitude: -122.4259 },
      { text: "Aria started spontaneous sidewalk chess", sub: "Friendly speed games • 0.2km away", icon: "♟️", vibeTag: "Playful", color: "bg-pink-950/40 border-pink-500/20 text-pink-300", user: "@aria_knight", compatibility: "92%", latitude: 37.7612, longitude: -122.4210 },
      { text: "Zack checked-in at Twin Peaks view", sub: "Insane mist rolling in • 1.8km away • DualCam", icon: "⛰️", vibeTag: "Energetic", color: "bg-purple-950/40 border-purple-500/20 text-purple-300", user: "@zack_peaks", compatibility: "85%", latitude: 37.7544, longitude: -122.4478 },
      { text: "Lily sharing watercolor session in the park", sub: "Bring your sketchbook • 0.4km away", icon: "🎨", vibeTag: "Creative", color: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300", user: "@lily_canvas", compatibility: "99%", latitude: 37.7590, longitude: -122.4280 },
    ];

    const tickerInterval = setInterval(() => {
      const randomItem = actPool[Math.floor(Math.random() * actPool.length)];
      const randomizedExp = `${Math.floor(Math.random() * 12) + 2}m left`;
      
      const newActivity = {
        id: `vibe-${Date.now()}`,
        text: randomItem.text,
        sub: `${randomItem.sub} • DualCam captured`,
        icon: randomItem.icon,
        expiresIn: randomizedExp,
        vibeTag: randomItem.vibeTag,
        user: randomItem.user,
        compatibility: randomItem.compatibility,
        color: randomItem.color,
        latitude: randomItem.latitude,
        longitude: randomItem.longitude
      };

      setLiveActivities(prev => {
        // Keep user-published posts at the top and don't pop them off via the ticker logic
        const userPosts = prev.filter(v => v.isMyVibe);
        const systemPosts = prev.filter(v => !v.isMyVibe).slice(0, 2);
        return [...userPosts, newActivity, ...systemPosts];
      });
    }, 11000);

    return () => clearInterval(tickerInterval);
  }, []);

  const handleJoinVibeStream = (activityId: string, text: string) => {
    triggerHaptic('heavy');
    updateProfilePoints(10);
    alert(`⚡ Connected to "${text}"! Transmitted proximity alignment payload. Gained +10 VQ points.`);
  };

  const handleDeleteVibe = async (id: string) => {
    triggerHaptic('medium');
    setLiveActivities(prev => prev.filter(v => v.id !== id));
    
    // Delete from localStorage
    try {
      vibeStreamService.deleteCustomPost(id);
    } catch (err) {
      console.warn("Failed to delete from localStorage:", err);
    }
  };

  const handleEditVibe = async (id: string, newText: string) => {
    if (!newText.trim()) return;
    triggerHaptic('medium');
    setLiveActivities(prev => prev.map(v => v.id === id ? { ...v, text: newText } : v));
    
    // Update in localStorage
    try {
      vibeStreamService.editCustomPost(id, newText);
    } catch (err) {
      console.warn("Failed to update in localStorage:", err);
    }
  };

  const handlePublishVibe = async (
    note: string,
    tag: string,
    loc: string,
    emoji: string,
    capturedImage: string | null,
    frontCapturedImage: string | null,
    capturedTimestamp: number | null,
    isVideo: boolean,
    captureLat: number | null,
    captureLng: number | null,
    onSuccess: () => void
  ) => {
    if (!note.trim()) {
      alert('Write a soft note first describing what the vibe is like!');
      return;
    }

    if (capturedImage) {
      const ageMs = Date.now() - (capturedTimestamp || 0);
      if (ageMs >= 300000) {
        alert('❌ PROOF EXPIRED: Your live presence photo is older than 5 minutes. Live proof must be submitted instantly to deter gallery uploads or cheating. Please retake.');
        return;
      }
    }

    triggerHaptic('heavy');
    const newId = `vibe-${Date.now()}`;
    const tagColors: Record<string, string> = {
      Chill: "bg-rose-950/40 border-rose-500/20 text-rose-300",
      Creative: "bg-amber-950/40 border-amber-500/20 text-amber-300",
      Energetic: "bg-emerald-950/40 border-emerald-500/20 text-emerald-300",
      Reflective: "bg-blue-950/40 border-blue-500/20 text-blue-300",
      Playful: "bg-purple-950/40 border-purple-500/20 text-purple-300"
    };

    const newActivity = {
      id: newId,
      text: note,
      sub: `${loc} • 0.1km away${captureLat ? ` • GPS: ${captureLat.toFixed(4)}, ${captureLng?.toFixed(4)}` : ""}`,
      icon: emoji,
      expiresIn: "Active",
      vibeTag: tag,
      user: `@${profile?.handle || 'self_node'}`,
      compatibility: "100%",
      color: tagColors[tag] || "bg-rose-950/40 border-rose-500/20 text-rose-300",
      backPhoto: capturedImage,
      frontPhoto: frontCapturedImage,
      timestamp: capturedTimestamp,
      isVideo: isVideo,
      isMyVibe: true
    };

    setLiveActivities(prev => [newActivity, ...prev]);
    updateProfilePoints(20);

    try {
      const zoneTags: Record<string, string> = {
        Chill: 'CHILLED',
        Creative: 'CREATIVE',
        Energetic: 'AMBER',
        Reflective: 'COZY',
        Playful: 'WARM'
      };
      
      const hfPost = {
        id: newId,
        author: `@${profile?.handle || 'self_node'}`,
        avatar: emoji,
        avatarUrl: null,
        text: note,
        votes: 1,
        time: 'Just now',
        image: capturedImage,
        zone: zoneTags[tag] || 'COZY',
        timestamp: Date.now()
      };
      
      vibeStreamService.saveCustomPost(hfPost);
    } catch (err) {
      console.warn("Could not sync published post to homepage:", err);
    }

    try {
      await socialContentDomain.createPost({
        text: note,
        feeling: note,
        imageUri: capturedImage || null,
        venueName: loc || "Dolores Park Node",
        emoji: emoji || "✨",
        username: profile?.handle || 'self_node',
        avatar: emoji || '🦊',
        isOnline: true,
      });
    } catch (err) {
      console.warn("Could not sync published post to socialContentDomain:", err);
    }
    
    onSuccess();
    alert(`📸 Vibe captured and published to Near Vibes successfully! +20 VQ coordinates recorded.`);
  };

  return {
    liveActivities,
    nearbyVibesOnly,
    setNearbyVibesOnly,
    handleJoinVibeStream,
    handlePublishVibe,
    handleDeleteVibe,
    handleEditVibe
  };
};
