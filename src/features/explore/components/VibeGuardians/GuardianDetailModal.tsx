import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Camera, MapPin, Shield, Sparkles, CheckCircle2, MessageSquare
} from 'lucide-react';
import { VibeGuardian, PreMadeTour } from './types';
import { getDaysRemaining, hasUserHandshake, recordHandshake } from './services/vibeGuardianStorage';
import { ReservationCalendarModal } from './ReservationCalendarModal';
import { GuardianReviewsSection } from './modal/GuardianReviewsSection';
import { GuardianToursList } from './modal/GuardianToursList';

interface GuardianDetailModalProps {
  guardian: VibeGuardian | null;
  onClose: () => void;
  onMessage: (guardian: VibeGuardian) => void;
  onExploreTrail: (trailTitleOrId: string) => void;
  onReviewsUpdated?: () => void;
  currentUserProfile?: any;
}

export const GuardianDetailModal: React.FC<GuardianDetailModalProps> = ({
  guardian,
  onClose,
  onMessage,
  onReviewsUpdated,
  currentUserProfile,
}) => {
  const [selectedTourForBooking, setSelectedTourForBooking] = useState<PreMadeTour | null>(null);

  if (!guardian) return null;

  const userKey = currentUserProfile?.handle || currentUserProfile?.displayName || 'explorer_guest';
  const hasProofHandshake = hasUserHandshake(guardian.id, userKey);
  const daysRemaining = getDaysRemaining(guardian);

  const handleEstablishHandshake = () => {
    recordHandshake(guardian.id, userKey);
    if (onReviewsUpdated) onReviewsUpdated();
  };

  return (
    <>
      <AnimatePresence>
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 15 }}
            className="bg-[#110F15] border border-white/10 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto text-left shadow-2xl relative flex flex-col"
          >
            {/* Header */}
            <div className="sticky top-0 z-20 bg-[#110F15]/95 backdrop-blur-md border-b border-white/5 px-5 py-3.5 flex items-center justify-between">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-purple-400 font-mono text-xs uppercase font-extrabold tracking-wider">
                  Guardian Profile
                </span>
                {guardian.type === 'pro' ? (
                  <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Shield className="w-2.5 h-2.5 text-amber-400" /> Pro Guide
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 border border-emerald-500/25 text-emerald-300 text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5 text-emerald-400" /> Local Legend
                  </span>
                )}
                {hasProofHandshake && (
                  <span className="bg-black border border-white/30 text-white text-[9px] font-mono font-black px-2 py-0.5 rounded-full">
                    🤝 Handshake Verified
                  </span>
                )}
              </div>

              <button
                type="button"
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Identity Block */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="relative w-24 h-24 rounded-2xl overflow-hidden shrink-0 border-2 border-purple-500/40 bg-zinc-900 shadow-xl">
                  <img
                    src={guardian.selfieUrl}
                    alt={guardian.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-0 inset-x-0 bg-black/85 py-1 text-center flex items-center justify-center gap-1 text-[8.5px] font-mono font-bold text-emerald-400">
                    <Camera className="w-3 h-3" />
                    <span>APP SELFIE</span>
                  </div>
                </div>

                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-xl font-extrabold text-white tracking-tight">{guardian.name}</h3>
                    <span className="text-xs font-mono text-zinc-400">{guardian.handle}</span>
                  </div>

                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-zinc-500" />
                      {guardian.city}, {guardian.stateCountry}
                    </span>
                    {!guardian.hideAge && guardian.age && (
                      <span className="font-mono text-zinc-300">• {guardian.age} yrs old</span>
                    )}
                  </div>

                  <div className="pt-1 flex items-center gap-2">
                    {guardian.type === 'pro' ? (
                      <span className="bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono font-extrabold px-3 py-1 rounded-xl">
                        💰 Rate: {guardian.priceDisplay || `$${guardian.hourlyRate || 35}/hour`}
                      </span>
                    ) : (
                      <span className="bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-extrabold px-3 py-1 rounded-xl">
                        ✨ Free Local Hangout
                      </span>
                    )}

                    {!hasProofHandshake ? (
                      <button
                        type="button"
                        onClick={handleEstablishHandshake}
                        className="bg-black hover:bg-zinc-900 border border-white/20 text-white font-mono text-xs font-black uppercase px-3 py-1 rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                      >
                        <span>🤝 Handshake</span>
                      </button>
                    ) : (
                      <span className="bg-black border border-white/20 text-white font-mono text-[11px] font-black px-2.5 py-1 rounded-xl">
                        🤝 Verified
                      </span>
                    )}
                  </div>

                  <div className="inline-flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono px-2.5 py-1 rounded-lg">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>In-App Selfie Fresh • {daysRemaining} days left</span>
                  </div>
                </div>
              </div>

              {/* Bio */}
              <div className="space-y-1.5">
                <h5 className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider">
                  About the Guardian
                </h5>
                <p className="text-sm text-zinc-200 font-sans leading-relaxed bg-[#17141d] p-3.5 rounded-xl border border-white/5">
                  {guardian.bio}
                </p>
              </div>

              {/* Tours */}
              <GuardianToursList
                tours={guardian.preMadeTours || []}
                onBookTour={(t) => setSelectedTourForBooking(t)}
              />

              {/* Reviews */}
              <GuardianReviewsSection
                guardian={guardian}
                hasProofHandshake={hasProofHandshake}
                userKey={userKey}
                currentUserProfile={currentUserProfile}
                onReviewsUpdated={onReviewsUpdated}
              />
            </div>

            {/* Footer */}
            <div className="p-4 bg-[#0e0d11] border-t border-white/10 flex items-center justify-between gap-3 shrink-0">
              <button
                type="button"
                onClick={() => onMessage(guardian)}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg cursor-pointer transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Message Guardian
              </button>
            </div>
          </motion.div>
        </div>
      </AnimatePresence>

      {selectedTourForBooking && (
        <ReservationCalendarModal
          isOpen={Boolean(selectedTourForBooking)}
          onClose={() => setSelectedTourForBooking(null)}
          tour={selectedTourForBooking}
          guardian={guardian}
          onReserve={() => setSelectedTourForBooking(null)}
        />
      )}
    </>
  );
};
export default GuardianDetailModal;
