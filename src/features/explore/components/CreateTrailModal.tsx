import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check } from 'lucide-react';
import { TimeOfDay, CreateTrailInput } from '../types';
import { trailsDomain } from '@/domains/d06_trails';
import { toursDomain } from '@/domains/d08_tours';
import { guardiansDomain } from '@/domains/d07_guardians';

import { TrailOverviewTab, PRESET_COVERS } from './trail-creation/TrailOverviewTab';
import { TrailStopsBuilderTab } from './trail-creation/TrailStopsBuilderTab';
import { TrailTourPricingPanel } from './trail-creation/TrailTourPricingPanel';
import { StopDraft } from './trail-creation/TrailStopCard';

export interface InitialTrailAdoptData {
  forkedFromTrailId?: string;
  forkedFromAuthorName?: string;
  name?: string;
  city?: string;
  story?: string;
  category?: string;
  vibeTags?: string[];
  imageUrl?: string;
  stops?: any[];
}

interface CreateTrailModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  authorName?: string;
  userCoords: { lat: number; lng: number } | null;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  initialTrailData?: InitialTrailAdoptData | null;
  onSubmitTrail: (trailData: CreateTrailInput) => Promise<any>;
  isProGuardian?: boolean;
  initialIsTour?: boolean;
}

export const CreateTrailModal: React.FC<CreateTrailModalProps> = ({
  isOpen,
  onClose,
  userId,
  authorName,
  userCoords,
  fireHaptic,
  initialTrailData,
  onSubmitTrail,
  isProGuardian,
  initialIsTour = false
}) => {
  const isUserPro = Boolean(
    isProGuardian || 
    (userId && guardiansDomain.getGuardianById(userId)?.type === 'pro')
  );

  const [trailTitle, setTrailTitle] = useState('');
  const [city, setCity] = useState('');
  const [narrativeStory, setNarrativeStory] = useState('');
  const [category, setCategory] = useState('Full Day Circuit');
  const [tagsInput, setTagsInput] = useState('culture, scenic, foodie');
  const [selectedCover, setSelectedCover] = useState(PRESET_COVERS[0].url);

  // Pro Tour state
  const [isLabeledAsTour, setIsLabeledAsTour] = useState(Boolean(initialIsTour));
  const [tourPrice, setTourPrice] = useState<number>(85);
  const [tourDuration, setTourDuration] = useState('4h');
  const [meetingPoint, setMeetingPoint] = useState('Complimentary hotel pickup or meet at city center gate');
  const [whatsIncludedInput, setWhatsIncludedInput] = useState('Skip-the-line admissions, Artisan tea, Guided walkthrough');
  const [languagesInput, setLanguagesInput] = useState('Arabic, French, English');
  const [cancellationPolicy, setCancellationPolicy] = useState('Free cancellation up to 24 hours before tour starts');

  // Multi-Stop state
  const [stops, setStops] = useState<StopDraft[]>([
    {
      id: 'stop_1',
      placeName: '',
      address: '',
      lat: userCoords ? userCoords.lat : 36.8797,
      lng: userCoords ? userCoords.lng : 10.3256,
      timeOfDay: 'morning',
      suggestedDurationMin: 45,
      proTip: '',
      category: 'Café',
    },
    {
      id: 'stop_2',
      placeName: '',
      address: '',
      lat: userCoords ? userCoords.lat + 0.005 : 36.8703,
      lng: userCoords ? userCoords.lng + 0.005 : 10.3421,
      timeOfDay: 'sunset',
      suggestedDurationMin: 60,
      proTip: '',
      category: 'Viewpoint',
    }
  ]);

  const [activeTab, setActiveTab] = useState<'info' | 'stops' | 'tour'>(initialIsTour ? 'tour' : 'info');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState(false);

  useEffect(() => {
    if (!isOpen) return;
    if (initialTrailData) {
      const isRemix = Boolean(initialTrailData.forkedFromAuthorName);
      setTrailTitle(
        initialTrailData.name 
          ? (isRemix ? `${initialTrailData.name} (Remix)` : initialTrailData.name)
          : ''
      );
      setCity(initialTrailData.city || 'Tunis');
      setNarrativeStory(initialTrailData.story || '');
      setCategory(initialTrailData.category || 'Culture');
      if (initialTrailData.vibeTags) setTagsInput(initialTrailData.vibeTags.join(', '));
      if (initialTrailData.imageUrl) setSelectedCover(initialTrailData.imageUrl);
      if (initialTrailData.stops && initialTrailData.stops.length > 0) {
        setStops(initialTrailData.stops.map((s, idx) => ({
          id: `stop_${idx + 1}`,
          placeName: s.name || s.placeName || '',
          address: s.address || '',
          lat: s.lat || (userCoords ? userCoords.lat : 36.87),
          lng: s.lng || (userCoords ? userCoords.lng : 10.32),
          timeOfDay: (s.timeOfDay as TimeOfDay) || 'morning',
          suggestedDurationMin: s.suggestedDurationMin || 45,
          proTip: s.vibeNote || s.proTip || '',
          category: s.category || 'Culture'
        })));
      }
    }
  }, [isOpen, initialTrailData]);

  if (!isOpen) return null;

  const handleUpdateStop = (id: string, updates: Partial<StopDraft>) => {
    setStops(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  };

  const handleRemoveStop = (id: string) => {
    if (stops.length <= 1) return;
    setStops(prev => prev.filter(s => s.id !== id));
  };

  const handleMoveStop = (index: number, direction: 'up' | 'down') => {
    const nextIdx = direction === 'up' ? index - 1 : index + 1;
    if (nextIdx < 0 || nextIdx >= stops.length) return;
    const copy = [...stops];
    const temp = copy[index];
    copy[index] = copy[nextIdx];
    copy[nextIdx] = temp;
    setStops(copy);
  };

  const handleAddStop = () => {
    const newStop: StopDraft = {
      id: `stop_${Date.now()}`,
      placeName: '',
      address: '',
      lat: userCoords ? userCoords.lat : 36.87,
      lng: userCoords ? userCoords.lng : 10.32,
      timeOfDay: 'afternoon',
      suggestedDurationMin: 45,
      proTip: '',
      category: 'Sightseeing'
    };
    setStops(prev => [...prev, newStop]);
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!trailTitle.trim() || !city.trim()) {
      alert('Please fill in the trail title and city.');
      return;
    }
    const emptyPlace = stops.find(s => !s.placeName.trim());
    if (emptyPlace) {
      alert('All stops must have a valid place name.');
      return;
    }

    setIsSubmitting(true);
    fireHaptic('heavy');

    try {
      // 1. Authoritative D06 Trails persistence
      const createdTrail = trailsDomain.createTrail({
        name: trailTitle.trim(),
        authorId: userId || 'current_user',
        authorName: authorName || 'hannibal',
        city: city.trim(),
        story: narrativeStory.trim(),
        category,
        vibeTags: tagsInput.split(',').map(t => t.trim()).filter(Boolean),
        imageUrl: selectedCover,
        latitude: stops[0]?.lat || 36.87,
        longitude: stops[0]?.lng || 10.32,
        stops: stops.map(s => ({
          id: s.id,
          name: s.placeName,
          address: s.address,
          vibeNote: s.proTip,
          timeOfDay: s.timeOfDay === 'morning' ? 'Morning' : s.timeOfDay === 'afternoon' ? 'Afternoon' : s.timeOfDay === 'sunset' ? 'Sunset' : s.timeOfDay === 'night' ? 'Night' : 'Flexible',
          durationMinutes: s.suggestedDurationMin
        })),
        isTour: isLabeledAsTour && isUserPro,
        forkedFromTrailId: initialTrailData?.forkedFromTrailId,
        forkedFromAuthorName: initialTrailData?.forkedFromAuthorName
      });

      // 2. Parent callback sync
      await onSubmitTrail({
        name: createdTrail.name,
        city: createdTrail.city,
        story: createdTrail.story,
        category: createdTrail.category,
        vibeTags: createdTrail.vibeTags,
        imageUrl: createdTrail.imageUrl,
        stops: stops.map(s => ({
          id: s.id,
          name: s.placeName,
          address: s.address,
          vibeNote: s.proTip,
          lat: s.lat,
          lng: s.lng,
          category: s.category,
          timeOfDay: s.timeOfDay,
          suggestedDurationMin: s.suggestedDurationMin
        })),
        isTour: isLabeledAsTour && isUserPro
      });

      setSuccessMsg(true);
      setTimeout(() => {
        onClose();
        setSuccessMsg(false);
      }, 1000);
    } catch (err: any) {
      alert(err.message || 'Failed to publish trail.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm select-none">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.96 }}
          className="bg-[#121115] border border-white/10 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex justify-between items-center text-left">
            <div>
              <h3 className="text-base font-bold text-white">
                {initialTrailData?.forkedFromAuthorName ? 'Adopt & Remix Trail' : 'Curate Vibe Trail'}
              </h3>
              <p className="text-[11px] text-zinc-400">
                Authoritative D06 Trail Studio with ordered stops
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex border-b border-white/5 bg-black/20 p-1">
            <button
              type="button"
              onClick={() => setActiveTab('info')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'info' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              1. Overview
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('stops')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'stops' ? 'bg-white/10 text-white' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              2. Stops ({stops.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('tour')}
              className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all ${
                activeTab === 'tour' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30' : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              3. Commercial Tour {isLabeledAsTour && '⭐'}
            </button>
          </div>

          {/* Form Content */}
          <form onSubmit={handlePublish} className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeTab === 'info' && (
              <TrailOverviewTab
                trailTitle={trailTitle}
                setTrailTitle={setTrailTitle}
                city={city}
                setCity={setCity}
                narrativeStory={narrativeStory}
                setNarrativeStory={setNarrativeStory}
                category={category}
                setCategory={setCategory}
                tagsInput={tagsInput}
                setTagsInput={setTagsInput}
                selectedCover={selectedCover}
                setSelectedCover={setSelectedCover}
              />
            )}

            {activeTab === 'stops' && (
              <TrailStopsBuilderTab
                stops={stops}
                userCoords={userCoords}
                onUpdateStop={handleUpdateStop}
                onRemoveStop={handleRemoveStop}
                onMoveStop={handleMoveStop}
                onAddStop={handleAddStop}
              />
            )}

            {activeTab === 'tour' && (
              <TrailTourPricingPanel
                isUserPro={isUserPro}
                isLabeledAsTour={isLabeledAsTour}
                setIsLabeledAsTour={setIsLabeledAsTour}
                tourPrice={tourPrice}
                setTourPrice={setTourPrice}
                tourDuration={tourDuration}
                setTourDuration={setTourDuration}
                meetingPoint={meetingPoint}
                setMeetingPoint={setMeetingPoint}
                whatsIncludedInput={whatsIncludedInput}
                setWhatsIncludedInput={setWhatsIncludedInput}
                languagesInput={languagesInput}
                setLanguagesInput={setLanguagesInput}
                cancellationPolicy={cancellationPolicy}
                setCancellationPolicy={setCancellationPolicy}
              />
            )}

            {/* Footer Buttons */}
            <div className="pt-4 border-t border-white/5 flex gap-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-3 rounded-full border border-white/10 text-white font-bold text-xs uppercase hover:bg-white/5 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 cursor-pointer"
              >
                {successMsg ? (
                  <>
                    <Check className="w-4 h-4" /> Published!
                  </>
                ) : isSubmitting ? (
                  'Publishing...'
                ) : (
                  'Publish Trail Circuit'
                )}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default CreateTrailModal;
