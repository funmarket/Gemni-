import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  X, Clock, Heart, GitFork, ArrowDownToLine, Check, Shield, Navigation, ExternalLink, Calendar
} from 'lucide-react';
import { VibeTrail, TrailStop } from '../types';
import { cn } from '@/lib/utils';
import { TrailRemixTree } from './TrailRemixTree';
import { trailCacheService } from '../services/trailCache';
import { TrailStopAccordion } from './trail-details/TrailStopAccordion';
import { TrailTourSpecsCard } from './trail-details/TrailTourSpecsCard';
import { ReservationCalendarModal } from './VibeGuardians/ReservationCalendarModal';
import { loadGuardians } from './VibeGuardians/services/vibeGuardianStorage';
import { PreMadeTour, VibeGuardian } from './VibeGuardians/types';

interface TrailDetailModalProps {
  trail: VibeTrail | null;
  onClose: () => void;
  userId?: string;
  currentUserProfile?: any;
  onToggleSave: (id: string) => void;
  onCenterRadar: (coords: { lat: number; lng: number }, label: string) => void;
  onAdoptTrail?: (trail: VibeTrail) => void;
  onHireGuardian?: (guardian: any, trail: VibeTrail) => void;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const TrailDetailModal: React.FC<TrailDetailModalProps> = ({
  trail,
  onClose,
  userId,
  onToggleSave,
  onCenterRadar,
  onAdoptTrail,
  fireHaptic,
}) => {
  const [isCached, setIsCached] = useState(() => (trail ? trailCacheService.isTrailCached(trail.id) : false));
  const [showReservationModal, setShowReservationModal] = useState(false);

  if (!trail) return null;

  const isTour = Boolean(trail.isTour);
  const tour = trail.tourDetails;
  const isSaved = userId && Array.isArray(trail.savedBy) ? trail.savedBy.includes(userId) : false;

  const stops: TrailStop[] = trail.stops && trail.stops.length > 0
    ? trail.stops
    : [
        {
          id: 'single_stop',
          order: 1,
          placeName: trail.name,
          address: trail.address,
          lat: trail.latitude,
          lng: trail.longitude,
          timeOfDay: 'anytime',
          proTip: trail.story,
          category: trail.category,
        },
      ];

  const totalMinutes = trail.totalEstimatedMinutes || stops.reduce((acc, s) => acc + (s.suggestedDurationMin || 60), 0);
  const hours = Math.floor(totalMinutes / 60);
  const remainingMins = totalMinutes % 60;
  const formattedDuration = isTour && tour?.duration ? tour.duration : hours > 0 ? `${hours}h ${remainingMins > 0 ? `${remainingMins}m` : ''}` : `${totalMinutes}m`;

  const handleToggleOfflineCache = () => {
    fireHaptic('medium');
    if (isCached) {
      trailCacheService.uncacheTrail(trail.id);
      setIsCached(false);
    } else {
      trailCacheService.cacheTrail(trail);
      setIsCached(true);
    }
  };

  const getFullDayRouteUrl = () => {
    if (stops.length === 0) return '#';
    const origin = encodeURIComponent(stops[0].address || stops[0].placeName);
    const destination = encodeURIComponent(stops[stops.length - 1].address || stops[stops.length - 1].placeName);
    return `https://www.google.com/maps/dir/?api=1&origin=${origin}&destination=${destination}&travelmode=walking`;
  };

  const allGuardians = loadGuardians();
  const assignedGuide: VibeGuardian = (tour?.guideGuardianId 
    ? allGuardians.find(g => g.id === tour.guideGuardianId)
    : allGuardians.find(g => g.type === 'pro' && g.hasActiveProSubscription)) || allGuardians[0];

  const synthesizedTour: PreMadeTour = {
    id: trail.id,
    title: tour?.tourTitle || trail.name,
    description: tour?.about || trail.story,
    duration: tour?.duration || '6 hours',
    whatsIncluded: tour?.whatsIncluded || ['Private guide', 'Curated route'],
    meetingPoint: tour?.meetingPoint || 'Central meeting checkpoint',
    pricingType: 'flat',
    price: `$${tour?.price || 85} flat rate`,
    photos: trail.imageUrl ? [trail.imageUrl] : [],
    availableSlots: tour?.availableDates || ['Tomorrow 9:00 AM', 'Saturday 10:00 AM'],
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
        className="absolute inset-0 bg-black/85 backdrop-blur-md"
      />

      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="bg-[#121115] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden relative z-10 shadow-2xl flex flex-col max-h-[92vh] text-left"
      >
        {/* Hero Cover */}
        <div 
          className="h-44 sm:h-52 w-full relative bg-cover bg-center shrink-0"
          style={{ backgroundImage: `url(${trail.imageUrl || stops[0]?.photoUrl || 'https://images.unsplash.com/photo-1548013146-72479768bada?q=80&w=600&auto=format&fit=crop'})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-[#121115] via-[#121115]/50 to-transparent" />
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/60 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-black/80 transition-colors z-20 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between z-10">
            <span className="bg-emerald-500/20 backdrop-blur-md border border-emerald-500/30 text-emerald-300 font-extrabold text-[10px] tracking-wider px-2.5 py-1 rounded-full uppercase">
              📍 {trail.category}
            </span>
            <span className="bg-black/60 backdrop-blur-md border border-white/10 text-amber-300 font-mono text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Clock className="w-3 h-3" /> {formattedDuration} • {stops.length} Stops
            </span>
          </div>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-5 flex-1">
          <div className="space-y-2">
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
              {trail.name}
            </h2>

            <div className="flex items-center justify-between text-xs text-zinc-400">
              <span className="text-white font-bold">{trail.authorName}</span>
              <div className="flex items-center gap-2">
                {onAdoptTrail && !isTour && (
                  <button
                    type="button"
                    onClick={() => {
                      fireHaptic('heavy');
                      onAdoptTrail(trail);
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all cursor-pointer"
                  >
                    <GitFork className="w-3.5 h-3.5" />
                    <span>Adopt</span>
                  </button>
                )}

                <button
                  type="button"
                  onClick={handleToggleOfflineCache}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    isCached ? "bg-teal-500/15 text-teal-300 border-teal-500/30" : "bg-zinc-900 border-white/10 text-zinc-400"
                  )}
                >
                  {isCached ? <Check className="w-3.5 h-3.5 text-teal-400" /> : <ArrowDownToLine className="w-3.5 h-3.5" />}
                  <span>{isCached ? "Offline" : "Cache"}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fireHaptic('medium');
                    onToggleSave(trail.id);
                  }}
                  className={cn(
                    "inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-all cursor-pointer",
                    isSaved ? "bg-red-500/10 text-red-400 border-red-500/20" : "bg-zinc-900 border-white/10 text-zinc-300"
                  )}
                >
                  <Heart className={cn("w-3.5 h-3.5", isSaved && "fill-red-500")} />
                  <span>{trail.savesCount || 0}</span>
                </button>
              </div>
            </div>
          </div>

          <p className="text-xs text-zinc-300 leading-relaxed font-sans">{trail.story}</p>

          {isTour && <TrailTourSpecsCard tour={tour} formattedDuration={formattedDuration} />}

          <TrailStopAccordion stops={stops} onCenterRadar={onCenterRadar} fireHaptic={fireHaptic} />

          <TrailRemixTree trail={trail} onAdoptTrail={onAdoptTrail} fireHaptic={fireHaptic} />
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-[#0e0d11] border-t border-white/10 flex items-center justify-between gap-3">
          {isTour ? (
            <button
              type="button"
              onClick={() => setShowReservationModal(true)}
              className="w-full py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer"
            >
              <Calendar className="w-4 h-4" /> Reserve Pro Guided Tour
            </button>
          ) : (
            <a
              href={getFullDayRouteUrl()}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg"
            >
              <Navigation className="w-4 h-4" /> Full Trail Walking Route
            </a>
          )}
        </div>
      </motion.div>

      {showReservationModal && (
        <ReservationCalendarModal
          isOpen={showReservationModal}
          onClose={() => setShowReservationModal(false)}
          tour={synthesizedTour}
          guardian={assignedGuide}
          onReserve={() => setShowReservationModal(false)}
        />
      )}
    </div>
  );
};
export default TrailDetailModal;
