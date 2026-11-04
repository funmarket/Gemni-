import { useState, useEffect } from 'react';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { VibeTrail, CreateTrailInput } from '../types';

export function useVibeTrails(userId?: string, authorName?: string) {
  const [trails, setTrails] = useState<VibeTrail[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTrails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [{ data, error: sbError }, { data: profilesData }] = await Promise.all([
        supabase.from('vibe_trails').select('*').order('created_at', { ascending: false }),
        supabase.from('profiles').select('id, handle, display_name, photo_url')
      ]);

      if (sbError) {
        throw sbError;
      }

      const profileMap = new Map<string, any>();
      if (profilesData) {
        profilesData.forEach((p: any) => {
          if (p.id) profileMap.set(p.id, p);
          if (p.handle) profileMap.set(p.handle, p);
          const rawId = p.id?.replace(/^usr_/, '');
          if (rawId) profileMap.set(rawId, p);
        });
      }

      if (data && data.length > 0) {
        const fetched: VibeTrail[] = data.map((d: any) => {
          const aId = d.author_id || d.authorId || '';
          const profile = profileMap.get(aId) || profileMap.get(aId.replace(/^usr_/, ''));
          const resolvedName = profile?.display_name || d.author_name || d.authorName || 'Local Explorer';

          return {
            id: d.id,
            name: d.name || '',
            story: d.story || '',
            address: d.address || '',
            category: d.category || 'General',
            vibeTags: d.vibe_tags || d.vibeTags || [],
            imageUrl: d.image_url || d.imageUrl || '',
            latitude: d.latitude || 36.8093,
            longitude: d.longitude || 10.1343,
            authorId: profile?.id || aId,
            authorName: resolvedName,
            createdAt: d.created_at || d.createdAt || new Date().toISOString(),
            savesCount: d.saves_count || d.savesCount || 0,
            savedBy: d.saved_by || d.savedBy || [],
            photos: d.photos || [],
            city: d.city || '',
            stops: d.stops || [],
            totalStops: d.total_stops || d.totalStops || (d.stops ? d.stops.length : 1),
            totalEstimatedMinutes: d.total_estimated_minutes || d.totalEstimatedMinutes || 120,
            forkedFromTrailId: d.forked_from_trail_id || d.forkedFromTrailId || undefined,
            forkedFromAuthorName: d.forked_from_author_name || d.forkedFromAuthorName || undefined,
            adoptionsCount: d.adoptions_count || d.adoptionsCount || 0,
            isTour: Boolean(d.is_tour || d.isTour),
            tourDetails: d.tour_details || d.tourDetails || undefined,
          };
        });
        setTrails(fetched);
      } else {
        setTrails([]);
      }
    } catch (err: any) {
      console.warn('Notice fetching Vibe Trails from Supabase:', err);
      setError(err?.message || 'Could not load trails');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrails();
  }, []);

  const createTrail = async (trailData: CreateTrailInput) => {
    if (!userId) {
      throw new Error('You must be signed in to curate a Vibe Trail.');
    }

    try {
      const stopsCount = trailData.stops && trailData.stops.length > 0 ? trailData.stops.length : 1;
      const computedDuration = trailData.totalEstimatedMinutes || 
        (trailData.stops?.reduce((acc, s) => acc + (s.suggestedDurationMin || 60), 0) || 120);

      const firstStop = trailData.stops?.[0];
      const initialLat = firstStop?.lat || trailData.latitude || 36.8093 + (Math.random() - 0.5) * 0.05;
      const initialLng = firstStop?.lng || trailData.longitude || 10.1343 + (Math.random() - 0.5) * 0.05;
      const trailId = `trail_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

      const newTrail: VibeTrail = {
        id: trailId,
        name: trailData.name,
        story: trailData.story,
        address: trailData.address || firstStop?.address || 'Local Curated Route',
        category: trailData.category,
        vibeTags: trailData.vibeTags,
        imageUrl: trailData.imageUrl || '',
        latitude: initialLat,
        longitude: initialLng,
        authorId: userId,
        authorName: authorName || 'Local Explorer',
        createdAt: new Date().toISOString(),
        savesCount: 0,
        savedBy: [],
        photos: trailData.photos || [],
        city: trailData.city || '',
        stops: trailData.stops || [],
        totalStops: stopsCount,
        totalEstimatedMinutes: computedDuration,
        forkedFromTrailId: trailData.forkedFromTrailId || undefined,
        forkedFromAuthorName: trailData.forkedFromAuthorName || undefined,
        adoptionsCount: 0,
        isTour: Boolean(trailData.isTour),
        tourDetails: trailData.tourDetails || undefined,
      };

      // Persist authoritatively to Supabase
      const { error: insertErr } = await supabase.from('vibe_trails').upsert({
        id: trailId,
        name: newTrail.name,
        story: newTrail.story,
        address: newTrail.address,
        category: newTrail.category,
        vibe_tags: newTrail.vibeTags,
        image_url: newTrail.imageUrl,
        latitude: newTrail.latitude,
        longitude: newTrail.longitude,
        author_id: newTrail.authorId,
        author_name: newTrail.authorName,
        created_at: newTrail.createdAt,
        saves_count: 0,
        saved_by: [],
        city: newTrail.city,
        stops: newTrail.stops,
        total_stops: newTrail.totalStops,
        total_estimated_minutes: newTrail.totalEstimatedMinutes,
        is_tour: newTrail.isTour,
        tour_details: newTrail.tourDetails,
      });

      if (insertErr) {
        console.warn('Supabase vibe_trails write error:', insertErr);
      }

      setTrails((prev) => [newTrail, ...prev]);
      return newTrail;
    } catch (err: any) {
      console.error('Error creating Vibe Trail:', err);
      throw new Error(err?.message || 'Failed to submit Vibe Trail');
    }
  };

  const toggleSaveTrail = async (trailId: string) => {
    if (!userId) {
      throw new Error('Sign in to save spots to your Cultural Passport.');
    }

    const trail = trails.find((t) => t.id === trailId);
    if (!trail) return;

    const isSaved = Array.isArray(trail.savedBy) ? trail.savedBy.includes(userId) : false;
    const nextSavedBy = isSaved 
      ? (trail.savedBy || []).filter((uid) => uid !== userId)
      : [...(trail.savedBy || []), userId];
    const nextSavesCount = isSaved ? Math.max(0, trail.savesCount - 1) : trail.savesCount + 1;

    try {
      await supabase.from('vibe_trails').update({
        saved_by: nextSavedBy,
        saves_count: nextSavesCount,
      }).eq('id', trailId);
    } catch (err) {
      console.warn('Supabase save trail update notice:', err);
    }

    setTrails((prev) =>
      prev.map((t) =>
        t.id === trailId
          ? { ...t, savedBy: nextSavedBy, savesCount: nextSavesCount }
          : t
      )
    );
  };

  return {
    trails,
    isLoading,
    error,
    fetchTrails,
    createTrail,
    toggleSaveTrail,
  };
}
