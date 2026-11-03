import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, Calendar, Clock, Users, Shield, CheckCircle2, AlertCircle, 
  MapPin, Sparkles, Send, Check
} from 'lucide-react';
import { PreMadeTour, VibeGuardian } from './types';
import { requestTourReservation } from './services/vibeGuardianStorage';

interface ReservationCalendarModalProps {
  tour: PreMadeTour | null;
  guardian: VibeGuardian | null;
  onClose: () => void;
  currentUserProfile?: any;
  onReservationConfirmed: () => void;
}

export const ReservationCalendarModal: React.FC<ReservationCalendarModalProps> = ({
  tour,
  guardian,
  onClose,
  currentUserProfile,
  onReservationConfirmed
}) => {
  const [selectedSlot, setSelectedSlot] = useState<string>(
    tour?.availableSlots?.[0] || 'Tomorrow 10:00 AM'
  );
  const [partySize, setPartySize] = useState<number>(2);
  const [note, setNote] = useState<string>('');
  const [confirmed, setConfirmed] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  if (!tour || !guardian) return null;

  const handleRequestBooking = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const userHandle = currentUserProfile?.handle || currentUserProfile?.displayName || 'explorer_guest';

    requestTourReservation({
      tourId: tour.id,
      tourTitle: tour.title,
      guardianId: guardian.id,
      userId: userHandle,
      userName: currentUserProfile?.displayName || 'Explorer Traveler',
      date: selectedSlot.split(' ')[0] || 'Selected Date',
      timeSlot: selectedSlot,
      partySize,
      note
    });

    setIsSubmitting(false);
    setConfirmed(true);
    onReservationConfirmed();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-md overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#110F15] border border-white/10 rounded-3xl w-full max-w-lg overflow-hidden text-left shadow-2xl relative flex flex-col"
        >
          {/* Header */}
          <div className="bg-[#17141E] border-b border-white/10 p-4.5 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white">
                  Check Dates & Reserve Tour
                </h4>
                <p className="text-[10px] text-zinc-400 font-mono">
                  With Pro Guardian {guardian.name}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {!confirmed ? (
            <form onSubmit={handleRequestBooking} className="p-6 space-y-4">
              {/* Tour Summary Card */}
              <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-3.5 space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <h5 className="font-extrabold text-sm text-white">{tour.title}</h5>
                  <span className="bg-emerald-500/15 text-emerald-300 font-mono text-[10.5px] font-black px-2.5 py-0.5 rounded-full border border-emerald-500/20 shrink-0">
                    {tour.price}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 leading-relaxed font-sans">{tour.description}</p>
                <div className="flex items-center gap-3 text-[10.5px] text-zinc-400 font-mono pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-purple-400" />
                    {tour.duration}
                  </span>
                  <span className="flex items-center gap-1 truncate">
                    <MapPin className="w-3 h-3 text-emerald-400" />
                    {tour.meetingPoint}
                  </span>
                </div>
              </div>

              {/* Available Slots Calendar Selection */}
              <div className="space-y-2">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-wider flex items-center justify-between">
                  <span>Select Date & Time Slot</span>
                  <span className="text-emerald-400">● Live Schedule</span>
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(tour.availableSlots || [
                    'Today 2:00 PM',
                    'Tomorrow 10:00 AM',
                    'Saturday 11:30 AM',
                    'Sunday 3:00 PM'
                  ]).map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`p-3 rounded-xl border text-xs font-mono font-bold text-left transition-all cursor-pointer flex items-center justify-between ${
                        selectedSlot === slot
                          ? 'bg-emerald-500/15 border-emerald-500 text-emerald-300 shadow-sm'
                          : 'bg-[#181520] border-white/5 text-zinc-400 hover:text-zinc-200 hover:border-white/10'
                      }`}
                    >
                      <span>{slot}</span>
                      {selectedSlot === slot && <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Party Size */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Party Size</label>
                  <select
                    value={partySize}
                    onChange={(e) => setPartySize(parseInt(e.target.value, 10))}
                    className="w-full bg-[#181520] border border-white/10 text-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:border-purple-500 outline-none"
                  >
                    <option value={1}>1 Explorer (Solo)</option>
                    <option value={2}>2 Explorers</option>
                    <option value={3}>3 Explorers</option>
                    <option value={4}>4 Explorers (Group)</option>
                    <option value={5}>5+ Explorers</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Proof Mechanism</label>
                  <div className="bg-[#181520] border border-white/10 rounded-xl px-3 py-2 text-[10.5px] font-mono text-zinc-300 flex items-center gap-1.5">
                    <span className="text-base">🤝</span>
                    <span className="truncate text-amber-300 font-bold">Auto-Handshake</span>
                  </div>
                </div>
              </div>

              {/* Special Note */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono font-bold text-zinc-400 uppercase">Note for Guardian (Optional)</label>
                <input
                  type="text"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  placeholder="e.g. We love film photography and specialty espresso..."
                  className="w-full bg-[#181520] border border-white/10 text-zinc-200 rounded-xl px-3.5 py-2 text-xs placeholder-zinc-500 focus:border-purple-500 outline-none"
                />
              </div>

              {/* Notice */}
              <div className="bg-white/5 border border-white/10 rounded-xl p-3 text-[10.5px] text-zinc-400 leading-relaxed font-mono flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                <span>
                  Booking establishes an official <strong>🤝 Handshake</strong> between you and {guardian.name}. Once confirmed, you will be verified to leave notes and rate your experience.
                </span>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl border border-white/10 text-zinc-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="bg-emerald-500 hover:bg-emerald-400 text-black font-mono font-black text-xs uppercase px-5 py-2.5 rounded-xl transition-all shadow-md active:scale-95 cursor-pointer flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSubmitting ? 'Sending Request...' : 'Request Reservation'}</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="p-8 text-center space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/15 border-2 border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto text-2xl">
                🤝
              </div>
              <div className="space-y-1">
                <h4 className="text-lg font-black text-white font-display">
                  Reservation Accepted!
                </h4>
                <p className="text-xs text-zinc-300 font-sans max-w-sm mx-auto leading-relaxed">
                  Your reservation for <strong>{tour.title}</strong> on <strong>{selectedSlot}</strong> has been confirmed by {guardian.name}.
                </p>
              </div>

              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-2xl p-3.5 text-xs text-emerald-300 font-mono space-y-1 max-w-sm mx-auto text-left">
                <div className="flex items-center gap-1.5 font-bold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Handshake Proof Verified</span>
                </div>
                <p className="text-[11px] text-zinc-300 font-sans">
                  The official black handshake badge is now active on your connection with {guardian.name}. You are verified to leave reviews.
                </p>
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-bold text-xs uppercase px-6 py-2.5 rounded-xl cursor-pointer"
                >
                  Back to Guardian Profile
                </button>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
