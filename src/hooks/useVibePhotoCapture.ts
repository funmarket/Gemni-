import { useState, useCallback } from 'react';
import { MOOD_FILTERS, MoodFilter } from '../components/share/VibePhotoCapture';

export interface VibePhotoState {
  photoFiltered: string | null;
  photoRaw: string | null;
  cameraActive: boolean;
  activeFilterId: string;
  intensity: number;
}

export function useVibePhotoCapture() {
  const [cameraActive, setCameraActive] = useState(false);
  const [photoFiltered, setPhotoFiltered] = useState<string | null>(null);
  const [photoRaw, setPhotoRaw] = useState<string | null>(null);
  const [activeFilterId, setActiveFilterId] = useState<string>('none');
  const [intensity, setIntensity] = useState<number>(0.6);

  const openCamera = useCallback(() => {
    setCameraActive(true);
  }, []);

  const closeCamera = useCallback(() => {
    setCameraActive(false);
  }, []);

  const handleCapture = useCallback((filteredUri: string, rawUri?: string) => {
    setPhotoFiltered(filteredUri);
    if (rawUri) {
      setPhotoRaw(rawUri);
    }
    setCameraActive(false);
  }, []);

  const clearPhotos = useCallback(() => {
    setPhotoFiltered(null);
    setPhotoRaw(null);
  }, []);

  const selectFilter = useCallback((filterId: string) => {
    setActiveFilterId(filterId);
    const filter = MOOD_FILTERS.find(f => f.id === filterId);
    if (filter) {
      setIntensity(filter.defaultIntensity);
    }
  }, []);

  const updateIntensity = useCallback((value: number) => {
    setIntensity(value);
  }, []);

  return {
    cameraActive,
    photoFiltered,
    photoRaw,
    activeFilterId,
    intensity,
    openCamera,
    closeCamera,
    handleCapture,
    clearPhotos,
    selectFilter,
    updateIntensity,
    MOOD_FILTERS
  };
}
