import { useState, useEffect } from 'react';
import { Community } from '../types/shareGoodVibesTypes';
import { communityService } from '../services/communityService';
import { triggerHaptic } from '@/shared/services/device/haptics';

export const useCommunityCreationFlow = (
  user: any,
  profile: any,
  communities: Community[],
  setCommunities: React.Dispatch<React.SetStateAction<Community[]>>,
  setJoinedCommunityIds: React.Dispatch<React.SetStateAction<string[]>>,
  updateProfilePoints: (pts: number) => Promise<void>,
  onSuccess: () => void
) => {
  const [newCommName, setNewCommName] = useState('');
  const [newCommHandle, setNewCommHandle] = useState('');
  const [newCommEmoji, setNewCommEmoji] = useState('💫');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommTag, setNewCommTag] = useState<'love' | 'kindness' | 'help'>('love');
  const [newCommCat, setNewCommCat] = useState('Vibe Matching');
  const [customCategory, setCustomCategory] = useState('');
  const [newCommPrivate, setNewCommPrivate] = useState(false);

  // Position defaults derived from active manual/last known storage (or null)
  const [commLat, setCommLat] = useState<number | null>(() => {
    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
    if (manualRaw) {
      try { return JSON.parse(manualRaw).coords.lat; } catch (e) {}
    }
    if (lastKnownRaw) {
      try { return JSON.parse(lastKnownRaw).coords.lat; } catch (e) {}
    }
    return null;
  });
  const [commLng, setCommLng] = useState<number | null>(() => {
    const manualRaw = localStorage.getItem('vibe_quest_manual_location');
    const lastKnownRaw = localStorage.getItem('vibe_quest_last_known_location');
    if (manualRaw) {
      try { return JSON.parse(manualRaw).coords.lng; } catch (e) {}
    }
    if (lastKnownRaw) {
      try { return JSON.parse(lastKnownRaw).coords.lng; } catch (e) {}
    }
    return null;
  });
  const [commAddress, setCommAddress] = useState('Current Area');

  const [commHandleStatus, setCommHandleStatus] = useState<'idle' | 'checking' | 'valid' | 'invalid'>('idle');

  // Handle unique handle validation check
  useEffect(() => {
    if (!newCommHandle || newCommHandle.trim().length < 1) {
      setCommHandleStatus('idle');
      return;
    }
    setCommHandleStatus('checking');
    const validateTimer = setTimeout(() => {
      const cleaned = newCommHandle.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
      const isTaken = communities.some((c) => c.handle === cleaned);
      setCommHandleStatus(isTaken ? 'invalid' : 'valid');
    }, 450);

    return () => clearTimeout(validateTimer);
  }, [newCommHandle, communities]);

  const handleDeployCommunity = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!newCommName.trim() || commHandleStatus !== 'valid') {
      alert("Please enter a valid community name and non-taken unique handle!");
      return;
    }

    triggerHaptic('heavy');
    const handleValue = newCommHandle.trim().replace(/[^a-zA-Z0-9_]/g, '').toLowerCase();
    const finalCategory = newCommCat === 'Other' ? customCategory.trim() : newCommCat;

    const newDocObj = {
      name: newCommName,
      handle: handleValue,
      emoji: newCommEmoji,
      description: newCommDesc,
      tag: newCommTag,
      category: finalCategory || 'Other',
      creator: `@${profile?.handle || 'cyber_voyager'}`,
      members: 1,
      isPrivate: newCommPrivate,
      latitude: commLat,
      longitude: commLng,
      createdAt: new Date().toISOString()
    };

    try {
      const added = await communityService.createCommunity(newDocObj);
      setCommunities((prev) => [added, ...prev]);

      // Creator automatically joins the community
      await communityService.joinCommunity(user?.uid || 'guest_node_1337', added.id);
      setJoinedCommunityIds((prev) => [...prev, added.id]);

      await updateProfilePoints(25);
      alert(`🛰️ Community Node deployed! Gained +25 VQ Coordinates for initializing local vibe alignment.`);

      // Reset Form State
      setNewCommName('');
      setNewCommHandle('');
      setNewCommEmoji('💫');
      setNewCommDesc('');
      setNewCommTag('love');
      setNewCommCat('Vibe Matching');
      setCustomCategory('');
      setNewCommPrivate(false);
      onSuccess();
    } catch (err) {
      console.error('Error deploying community:', err);
    }
  };

  const handleQuickCreateFromCard = (categoryName: string, prefillDetails: string) => {
    triggerHaptic('medium');
    setNewCommCat(categoryName);
    setNewCommDesc(prefillDetails);
    
    // Auto populate reasonable visual starting templates
    if (categoryName === 'Spontaneous Gatherings') {
      setNewCommName('Dolores Active Spontaneous Group');
      setNewCommEmoji('🎸');
      setNewCommHandle('dolores_jam_' + Math.floor(Math.random() * 900 + 100));
      setNewCommTag('love');
    } else if (categoryName === 'Daily Journeys') {
      setNewCommName('Mission Morning Walker Meetup');
      setNewCommEmoji('🚶');
      setNewCommHandle('mission_walks_' + Math.floor(Math.random() * 900 + 100));
      setNewCommTag('kindness');
    } else {
      setNewCommName('Mission Support Network');
      setNewCommEmoji('🤝');
      setNewCommHandle('mission_co-op_' + Math.floor(Math.random() * 900 + 100));
      setNewCommTag('help');
    }
  };

  return {
    newCommName,
    setNewCommName,
    newCommHandle,
    setNewCommHandle,
    newCommEmoji,
    setNewCommEmoji,
    newCommDesc,
    setNewCommDesc,
    newCommTag,
    setNewCommTag,
    newCommCat,
    setNewCommCat,
    customCategory,
    setCustomCategory,
    newCommPrivate,
    setNewCommPrivate,
    commLat,
    setCommLat,
    commLng,
    setCommLng,
    commAddress,
    setCommAddress,
    commHandleStatus,
    handleDeployCommunity,
    handleQuickCreateFromCard
  };
};
