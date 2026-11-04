import React, { useState } from 'react';
import { Compass, Shield, Plus } from 'lucide-react';
import { VibeTrail } from '../types';
import { cn } from '@/lib/utils';
import { RegularTrailCard } from './trails/RegularTrailCard';
import { VibeTourCard } from './trails/VibeTourCard';
import { ProTourOnlyModal } from './trails/ProTourOnlyModal';
import { CreateTrailModal } from './CreateTrailModal';
import { HireGuardianForTrailModal } from './VibeGuardians/HireGuardianForTrailModal';
import { ReservationCalendarModal } from './VibeGuardians/ReservationCalendarModal';
import { PreMadeTour, VibeGuardian } from './VibeGuardians/types';
import { loadGuardians, isUserProGuardian } from './VibeGuardians/services/vibeGuardianStorage';

interface VibeTrailsSectionProps {
  trails: VibeTrail[];
  userId?: string;
  authorName?: string;
  currentUserProfile?: any;
  onSelectTrail: (trail: VibeTrail) => void;
  onToggleSave: (id: string) => void;
  onCreateTrail: (trailData: any) => Promise<any>;
  onAdoptTrail?: (trail: VibeTrail) => void;
  onHireGuardian?: (guardian: any, trail: VibeTrail) => void;
  onRequestCreateTrail?: (isTour?: boolean) => void;
  userCoords: { lat: number; lng: number } | null;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const VibeTrailsSection: React.FC<VibeTrailsSectionProps> = ({
  trails,
  userId,
  authorName,
  currentUserProfile,
  onSelectTrail,
  onToggleSave,
  onCreateTrail,
  onAdoptTrail,
  onHireGuardian,
  onRequestCreateTrail,
  userCoords,
  fireHaptic,
}) => {
  const [activeMenuTab, setActiveMenuTab] = useState<'trails' | 'tours'>('trails');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [createIsTour, setCreateIsTour] = useState(false);
  const [hireModalTrail, setHireModalTrail] = useState<VibeTrail | null>(null);
  const [reservationTrail, setReservationTrail] = useState<VibeTrail | null>(null);
  const [reservationGuardian, setReservationGuardian] = useState<VibeGuardian | null>(null);
  const [showProTourOnlyNotice, setShowProTourOnlyNotice] = useState(false);

  const isUserPro = Boolean(
    isUserProGuardian(userId, authorName) ||
      currentUserProfile?.isProGuardian ||
      currentUserProfile?.guardianshipType === 'pro' ||
      currentUserProfile?.account_type === 'pro' ||
      currentUserProfile?.accountType === 'pro'
  );

  const regularTrails = trails.filter((t) => !t.isTour);
  const vibeTours = trails.filter((t) => Boolean(t.isTour));

  const handleOpenCreateFlow = (forTour: boolean) => {
    fireHaptic('medium');
    if (!userId) return;

    if (forTour && !isUserPro) {
      setShowProTourOnlyNotice(true);
      return;
    }

    setCreateIsTour(forTour);
    if (onRequestCreateTrail) {
      onRequestCreateTrail(forTour);
    } else {
      setShowCreateModal(true);
    }
  };

  const handleOpenReservation = (trail: VibeTrail) => {
    fireHaptic('medium');
    const allGuardians = loadGuardians();
    const assignedGuide =
      (trail.tourDetails?.guideGuardianId
        ? allGuardians.find((g) => g.id === trail.tourDetails?.guideGuardianId)
        : allGuardians.find((g) => g.type === 'pro' && g.hasActiveProSubscription)) ||
      allGuardians[0];

    setReservationGuardian(assignedGuide);
    setReservationTrail(trail);
  };

  const synthesizedTour: PreMadeTour | null = reservationTrail
    ? {
        id: reservationTrail.id,
        title: reservationTrail.tourDetails?.tourTitle || reservationTrail.name,
        description: reservationTrail.tourDetails?.about || reservationTrail.story,
        duration: reservationTrail.tourDetails?.duration || '6 hours',
        whatsIncluded: reservationTrail.tourDetails?.whatsIncluded || ['Private transport', 'Licensed Guide'],
        meetingPoint: reservationTrail.tourDetails?.meetingPoint || 'Complimentary hotel pickup',
        pricingType: 'flat',
        price: `$${reservationTrail.tourDetails?.price || 85} flat tour`,
        photos: reservationTrail.imageUrl ? [reservationTrail.imageUrl] : [],
        availableSlots: reservationTrail.tourDetails?.availableDates || ['Tomorrow 9:00 AM', 'Saturday 9:00 AM'],
      }
    : null;

  return (
    <div className="space-y-4 w-full text-left select-none">
      {/* Menu Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-black text-emerald-400 tracking-widest uppercase block mb-1">
            {activeMenuTab === 'trails'
              ? 'Community Curations · Local Knowledge'
              : 'TripAdvisor-Style Guided Experiences · Bookable'}
          </span>

          <div className="flex items-center bg-zinc-950 border border-white/10 rounded-2xl p-1 gap-1">
            <button
              type="button"
              onClick={() => {
                fireHaptic('light');
                setActiveMenuTab('trails');
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                activeMenuTab === 'trails'
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Vibe Trails</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-white/5 text-zinc-300">
                {regularTrails.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => {
                fireHaptic('light');
                setActiveMenuTab('tours');
              }}
              className={cn(
                'px-3.5 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer flex items-center gap-1.5',
                activeMenuTab === 'tours'
                  ? 'bg-purple-600/30 text-purple-200 border border-purple-500/40'
                  : 'text-zinc-400 hover:text-white'
              )}
            >
              <Shield className="w-3.5 h-3.5 text-amber-400" />
              <span>Vibe Tours</span>
              <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300">
                {vibeTours.length}
              </span>
            </button>
          </div>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2">
          {activeMenuTab === 'trails' ? (
            <button
              type="button"
              onClick={() => handleOpenCreateFlow(false)}
              className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30 px-3.5 py-2 rounded-full text-xs font-black flex items-center gap-1 transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[2.5]" />
              Curate Trail
            </button>
          ) : (
            <button
              type="button"
              onClick={() => handleOpenCreateFlow(true)}
              className="bg-gradient-to-r from-purple-600 to-amber-500 hover:opacity-90 text-white border border-purple-500/30 px-4 py-2 rounded-full text-xs font-black flex items-center gap-1 transition-all cursor-pointer shadow-lg"
            >
              <Shield className="w-4 h-4 text-amber-300" />
              <span>Create Tour</span>
              <span className="text-[9px] bg-black/40 px-1.5 py-0.5 rounded-full font-mono text-amber-300">
                PRO
              </span>
            </button>
          )}
        </div>
      </div>

      {/* Trail/Tour Cards Row */}
      <div
        className="flex gap-4 overflow-x-auto pb-3 pt-1 w-full select-none"
        style={{ scrollbarWidth: 'none', WebkitOverflowScrolling: 'touch' }}
      >
        {activeMenuTab === 'trails' &&
          regularTrails.map((trail) => (
            <RegularTrailCard
              key={trail.id}
              trail={trail}
              userId={userId}
              onSelectTrail={onSelectTrail}
              onToggleSave={onToggleSave}
              onHireGuardianForTrail={(t) => setHireModalTrail(t)}
              fireHaptic={fireHaptic}
            />
          ))}

        {activeMenuTab === 'tours' &&
          vibeTours.map((tour) => (
            <VibeTourCard
              key={tour.id}
              tour={tour}
              onSelectTour={onSelectTrail}
              onOpenReservation={handleOpenReservation}
              fireHaptic={fireHaptic}
            />
          ))}
      </div>

      {/* Modals */}
      <ProTourOnlyModal
        isOpen={showProTourOnlyNotice}
        onClose={() => setShowProTourOnlyNotice(false)}
        onCurateFreeTrail={() => {
          setShowProTourOnlyNotice(false);
          setActiveMenuTab('trails');
          handleOpenCreateFlow(false);
        }}
      />

      {showCreateModal && (
        <CreateTrailModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onCreate={onCreateTrail}
          userCoords={userCoords}
          userId={userId}
          authorName={authorName}
          isTour={createIsTour}
        />
      )}

      {hireModalTrail && (
        <HireGuardianForTrailModal
          isOpen={Boolean(hireModalTrail)}
          onClose={() => setHireModalTrail(null)}
          trail={hireModalTrail}
          onHire={(g) => {
            if (onHireGuardian && hireModalTrail) {
              onHireGuardian(g, hireModalTrail);
            }
            setHireModalTrail(null);
          }}
        />
      )}

      {reservationTrail && synthesizedTour && reservationGuardian && (
        <ReservationCalendarModal
          isOpen={Boolean(reservationTrail)}
          onClose={() => setReservationTrail(null)}
          tour={synthesizedTour}
          guardian={reservationGuardian}
          onReserve={() => setReservationTrail(null)}
        />
      )}
    </div>
  );
};
export default VibeTrailsSection;
