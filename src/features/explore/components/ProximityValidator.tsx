import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, Compass } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Venue } from '../types';
import { 
  getVenueConfidence, 
  getRawConfirmations, 
  updateVenueConfidence, 
  getVenueVibe 
} from '../utils/exploreHelpers';
import { checkInRepository } from '@/infrastructure/repositories/checkInRepository';
import { getCheckInStreak } from '@/features/share-good-vibes/utils/gamification';
import { venueCheckInStore } from '@/services/venueCheckInStore';
import { vqLedger } from '@/domains/d20_vq_ledger';
import { notificationsDomain } from '@/domains/d23_notifications';

interface ProximityValidatorProps {
  validatingVenue: Venue | null;
  onClose: () => void;
  validationStatus: 'IDLE' | 'SUCCESS_YES' | 'SUCCESS_NO' | 'SUCCESS_NOT_HERE';
  setValidationStatus: React.Dispatch<React.SetStateAction<'IDLE' | 'SUCCESS_YES' | 'SUCCESS_NO' | 'SUCCESS_NOT_HERE'>>;
  canValidateVenue: (v: Venue) => boolean;
  profile: any;
  updateProfilePoints?: (pts: number) => Promise<any>;
  setScannedVenues: React.Dispatch<React.SetStateAction<Record<string, boolean>>>;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
  setGuardianPointsEarned: React.Dispatch<React.SetStateAction<number>>;
  guardianPointsEarned: number;
}

export const ProximityValidator: React.FC<ProximityValidatorProps> = ({
  validatingVenue,
  onClose,
  validationStatus,
  setValidationStatus,
  canValidateVenue,
  profile,
  updateProfilePoints,
  setScannedVenues,
  fireHaptic,
  setGuardianPointsEarned,
  guardianPointsEarned,
}) => {
  if (!validatingVenue) return null;

  const confidence = getVenueConfidence(validatingVenue);
  const confirmations = getRawConfirmations(validatingVenue);
  const isEligible = canValidateVenue(validatingVenue);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/75 backdrop-blur-[6px] p-4">
      {/* Click outside to close */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={onClose} 
      />

      <motion.div
        initial={{ y: "100%", opacity: 0.5 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: "100%", opacity: 0.5 }}
        transition={{ type: "spring", damping: 30, stiffness: 350 }}
        className="bg-[#13111C] border border-purple-500/30 w-full max-w-md rounded-[32px] p-6 space-y-6 relative shadow-[0_-8px_40px_rgba(167,139,250,0.15)] overflow-hidden animate-in fade-in slide-in-from-bottom duration-300"
        style={{ paddingBottom: 'env(safe-area-inset-bottom, 24px)' }}
      >
        {/* Sleek top drag handle line */}
        <div className="w-12 h-1 bg-zinc-700/80 rounded-full mx-auto" />

        {/* Close Button at top right */}
        <button
          type="button"
          onClick={() => {
            fireHaptic('light');
            onClose();
          }}
          className="absolute top-4 right-5 p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer border-none outline-none bg-transparent"
        >
          <X className="w-5 h-5" />
        </button>

        {validationStatus === 'IDLE' ? (
          <>
            {/* Top info section: Map pin inside purple square box */}
            <div className="flex items-center gap-4 text-left">
              <div className="w-14 h-14 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 shrink-0 shadow-lg">
                <MapPin className="w-6 h-6" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="w-8 h-1 bg-zinc-600 rounded mb-1.5" />
                <h3 className="font-extrabold text-lg text-white truncate leading-tight">
                  {validatingVenue.name}
                </h3>
                <p className="text-xs text-zinc-400 mt-1 flex items-center gap-1 font-semibold font-sans">
                  <Compass className="w-3.5 h-3.5 text-purple-400" />
                  {validatingVenue.distance ? `${validatingVenue.distance} km away` : 'Distance unknown'}
                </p>
              </div>
            </div>

            {/* Confidence Row */}
            <div className="space-y-2.5">
              <div className="flex justify-between items-center text-xs font-black tracking-wider text-zinc-400">
                <span>CONFIDENCE</span>
                <span className={cn(
                  confidence >= 80 ? "text-emerald-400" : confidence >= 50 ? "text-amber-400" : "text-rose-400",
                  "font-extrabold font-mono"
                )}>
                  {confidence}% ({confirmations} confirmations)
                </span>
              </div>
              <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden border border-white/5">
                <div 
                  className="h-full bg-gradient-to-r from-purple-500 to-indigo-500 transition-all duration-500 rounded-full" 
                  style={{ width: `${confidence}%` }}
                />
              </div>
            </div>

            {isEligible ? (
              <>
                {/* Purple Banner Container Box */}
                <div className="bg-[#24133B]/40 border border-purple-500/20 rounded-2xl p-4 flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center shrink-0 border border-purple-500/20">
                    <span className="text-purple-300">🛡️</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-purple-300 tracking-wider uppercase block">
                      ARE YOU HERE RIGHT NOW?
                    </span>
                    <p className="text-xs sm:text-[13px] text-zinc-300 font-medium leading-relaxed">
                      Is this spot still matching the vibe described above?
                    </p>
                  </div>
                </div>

                {/* Bottom validation button grid */}
                <div className="grid grid-cols-3 gap-3 pt-2 select-none">
                  <button
                    type="button"
                    onClick={() => {
                      fireHaptic('heavy');
                      
                      const currentUserId = profile?.id || 'current_user';
                      const previousCheckIns = venueCheckInStore.getCheckInsForUser(currentUserId);
                      const rawStreak = getCheckInStreak(previousCheckIns);
                      const activeStreak = rawStreak === 0 ? 1 : rawStreak;
                      const multiplier = activeStreak > 1 ? Math.min(2.0, 1.0 + (activeStreak * 0.1)) : 1.0;
                      const multipliedPoints = Math.round(15 * multiplier);

                      updateVenueConfidence(validatingVenue, 15);
                      
                      // Authoritative credit to D20 VQ Ledger
                      vqLedger.credit(
                        currentUserId,
                        multipliedPoints,
                        'PLACE_CHECKIN',
                        `Validated active vibe at ${validatingVenue.name}`,
                        validatingVenue.id
                      );

                      notificationsDomain.addNotification({
                        title: 'Vibe Validated! 🛡️',
                        body: `You verified ${validatingVenue.name}! +${multipliedPoints} VQ credited to your Purse.`,
                        category: 'reward',
                        actionUrl: 'crypto'
                      });

                      if (updateProfilePoints) {
                        updateProfilePoints(multipliedPoints);
                      }
                      setGuardianPointsEarned(multipliedPoints);
                      setValidationStatus('SUCCESS_YES');

                      // Sync to checkInRepository
                      checkInRepository.logCheckIn(
                        currentUserId,
                        validatingVenue.id,
                        validatingVenue.name,
                        `${getVenueVibe(validatingVenue)} (Verified)`,
                        validatingVenue.rating || 4.8
                      );

                      setScannedVenues(prev => ({ ...prev, [validatingVenue.id]: true }));
                    }}
                    className="bg-[#d5ead6]/20 hover:bg-[#d5ead6]/35 text-[#d5ead6] border border-[#d5ead6]/30 active:scale-95 font-black py-4 px-2 rounded-2xl text-[12px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer outline-none shadow-md"
                  >
                    <span className="text-lg">👍</span>
                    <span>Yes, matching!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fireHaptic('medium');
                      const currentUserId = profile?.id || 'current_user';
                      updateVenueConfidence(validatingVenue, -25);
                      
                      vqLedger.credit(
                        currentUserId,
                        10,
                        'PLACE_CHECKIN',
                        `Reported vibe change at ${validatingVenue.name}`,
                        validatingVenue.id
                      );

                      if (updateProfilePoints) {
                        updateProfilePoints(10);
                      }
                      setGuardianPointsEarned(10);
                      setValidationStatus('SUCCESS_NO');
                    }}
                    className="bg-[#f59e0b] hover:bg-[#d97706] active:scale-95 text-white font-extrabold py-4 px-2 rounded-2xl text-[12px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border-none outline-none shadow-md"
                  >
                    <span className="text-lg">👎</span>
                    <span>No, changed!</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      fireHaptic('light');
                      setValidationStatus('SUCCESS_NOT_HERE');
                      setTimeout(() => {
                        onClose();
                      }, 1200);
                    }}
                    className="bg-zinc-800 hover:bg-zinc-700 active:scale-95 text-white font-bold py-4 px-2 rounded-2xl text-[12px] transition-all flex flex-col items-center justify-center gap-1.5 cursor-pointer border border-white/5 outline-none shadow-md"
                  >
                    <span className="text-lg">✕</span>
                    <span>Not here</span>
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Red/Amber Warning Box */}
                <div className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-4 flex gap-3 text-left">
                  <div className="w-8 h-8 rounded-lg bg-rose-500/15 flex items-center justify-center shrink-0 border border-rose-500/30">
                    <span className="text-rose-400">🔒</span>
                  </div>
                  <div className="space-y-1">
                    <span className="text-[10px] font-black text-rose-300 tracking-wider uppercase block">
                      VERIFICATION LOCKED
                    </span>
                    <p className="text-xs sm:text-[13px] text-zinc-300 font-semibold leading-relaxed">
                      To protect venue reputations and prevent spam, Vibe Validation requires either a previous check-in or physical proximity within 200 meters of the spot.
                    </p>
                  </div>
                </div>

                {/* Locked placeholder actions */}
                <div className="pt-2 select-none space-y-3.5">
                  <button
                    type="button"
                    disabled
                    className="w-full bg-zinc-850 text-zinc-500 border border-zinc-700/30 py-4 px-2 rounded-2xl text-[13px] font-black cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    <span>🔒 Confirmations Locked</span>
                  </button>
                  <p className="text-[10.5px] text-zinc-500 text-center font-bold">
                    Your distance: {validatingVenue.distance} km • Required distance: ≤ 0.20 km (200m)
                  </p>
                </div>
              </>
            )}
          </>
        ) : (
          /* Success and thank you state */
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-8 text-center space-y-4"
          >
            <div className="w-16 h-16 rounded-full bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mx-auto text-3xl shadow-lg animate-bounce">
              🛡️
            </div>
            
            {validationStatus === 'SUCCESS_YES' && (
              <div className="space-y-2 text-center animate-in fade-in zoom-in-50 duration-300">
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  VALIDATION FILED!
                </h3>
                <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                  Excellent work, Citizen. You have confirmed this spot's active cultural state. <strong>+{guardianPointsEarned} PTS</strong> added to your profile.
                </p>
              </div>
            )}

            {validationStatus === 'SUCCESS_NO' && (
              <div className="space-y-2 text-center animate-in fade-in zoom-in-50 duration-300">
                <h3 className="font-extrabold text-xl text-white tracking-tight">
                  REPORT REGISTERED!
                </h3>
                <p className="text-xs text-zinc-300 max-w-xs mx-auto leading-relaxed">
                  Flag report lodged successfully. Your alert has been synchronized with municipal grids. <strong>+10 PTS</strong> awarded for municipal contribution.
                </p>
              </div>
            )}

            {validationStatus === 'SUCCESS_NOT_HERE' && (
              <div className="space-y-2 text-center animate-in fade-in zoom-in-50 duration-300">
                <h3 className="font-extrabold text-xl text-white tracking-tight text-zinc-400">
                  CLOSING CONSOLE
                </h3>
                <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                  Closing security interface node...
                </p>
              </div>
            )}

            <div className="pt-3">
              <button
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  onClose();
                }}
                className="bg-purple-600 hover:bg-purple-500 text-white font-extrabold text-xs py-3.5 px-8 rounded-xl transition-all active:scale-95 cursor-pointer border-none outline-none shadow-md"
              >
                DISMISS
              </button>
            </div>
          </motion.div>
        )}
      </motion.div>
    </div>
  );
};

export default ProximityValidator;
