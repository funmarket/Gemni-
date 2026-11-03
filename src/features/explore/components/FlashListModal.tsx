import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Users, Clock, ArrowUpRight, Bell, Shield, Volume2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { dispatchFlashEventCreated } from '@/lib/pushNotifications';

interface FlashListModalProps {
  showFlashListModal: boolean;
  setShowFlashListModal: React.Dispatch<React.SetStateAction<boolean>>;
  flashEvents: any[];
  setActiveFlashModal: React.Dispatch<React.SetStateAction<any | null>>;
  isListExpanded: boolean;
  setIsListExpanded: React.Dispatch<React.SetStateAction<boolean>>;
  permissionStatus: string;
  requestBrowserPermission: () => void;
  notifSettings: any;
  updateNotifSettings: (settings: any) => void;
  coords: { lat: number; lng: number } | null;
  fireHaptic: (style: 'light' | 'medium' | 'heavy') => void;
}

export const FlashListModal: React.FC<FlashListModalProps> = ({
  showFlashListModal,
  setShowFlashListModal,
  flashEvents,
  setActiveFlashModal,
  isListExpanded,
  setIsListExpanded,
  permissionStatus,
  requestBrowserPermission,
  notifSettings,
  updateNotifSettings,
  coords,
  fireHaptic,
}) => {
  if (!showFlashListModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-[6px] p-4 overflow-y-auto">
      {/* Backdrop Dismiss */}
      <div 
        className="absolute inset-0 -z-10 cursor-pointer" 
        onClick={() => {
          fireHaptic('light');
          setShowFlashListModal(false);
        }} 
      />

      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 15 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.94, opacity: 0, y: 15 }}
        className="bg-[#0f1320] border border-red-500/20 rounded-[28px] p-6 max-w-md w-full relative shadow-[0_12px_45px_rgba(0,0,0,0.75)] select-none text-left max-h-[90vh] overflow-y-auto custom-scrollbar space-y-5"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-zinc-800/60 pb-4">
          <div className="flex items-center gap-2">
            <div className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ff4e5e] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#ff4e5e]"></span>
            </div>
            <h3 className="font-extrabold text-xl text-white tracking-tight flex items-center gap-1.5">
              Live Secrets Board <span className="text-xs text-[#ff5f6e] font-mono bg-[#ff4e5e]/10 px-2 py-0.5 rounded-full">ACTIVE</span>
            </h3>
          </div>
          <button
            type="button"
            onClick={() => {
              fireHaptic('light');
              setShowFlashListModal(false);
            }}
            className="p-1.5 rounded-full hover:bg-white/5 text-zinc-400 hover:text-white transition-all cursor-pointer bg-transparent border-none"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-zinc-400 leading-relaxed">
          Secret gatherings, warehouse sessions, and pop-up events within your district. Tap an alert to get coordinates, rules, and claim point bounties.
        </p>

        {/* Active list */}
        <div className="space-y-3">
          {flashEvents.length === 0 ? (
            <div className="bg-[#121624] border border-zinc-800 rounded-2xl p-6 text-center space-y-2">
              <p className="text-sm text-zinc-400 font-semibold">No Active Secrets Board Alerts</p>
              <p className="text-xs text-zinc-600">Be the first to report an after-hours vibe!</p>
            </div>
          ) : (
            <>
              {(() => {
                const displayedEvents = isListExpanded ? flashEvents : flashEvents.slice(0, 5);
                return displayedEvents.map((event) => {
                  const goingCount = Array.isArray(event.goingUsers) ? event.goingUsers.length : 0;
                  const interestedCount = Array.isArray(event.interestedUsers) ? event.interestedUsers.length : 0;
                  
                  return (
                    <div 
                      key={event.id}
                      onClick={() => {
                        fireHaptic('medium');
                        setActiveFlashModal(event);
                        setShowFlashListModal(false);
                      }}
                      className="bg-[#161b2b] hover:bg-[#1d2338] border border-zinc-800/80 hover:border-red-500/20 rounded-2xl p-4 transition-all cursor-pointer group space-y-3 relative text-left"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="space-y-0.5">
                          <h4 className="font-bold text-sm text-white group-hover:text-[#ff5f6e] transition-colors leading-snug">
                            {event.title}
                          </h4>
                          <p className="text-xs text-zinc-400 line-clamp-1">
                            {event.description}
                          </p>
                        </div>
                        
                        <span className="shrink-0 bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-amber-500/20 text-amber-400 text-[10px] font-black uppercase px-2 py-1 rounded-lg">
                          +{event.reward} VQ
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center justify-between gap-2 border-t border-zinc-800/40 pt-2 text-[11px] text-zinc-400">
                        <div className="flex items-center gap-1.5 font-medium text-zinc-300">
                          <Users className="w-3.5 h-3.5 text-[#ff4e5e]" />
                          <span>{goingCount} Going • {interestedCount} Interested</span>
                        </div>

                        <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                          <Clock className="w-3 h-3 text-red-500/80 shrink-0 animate-pulse" />
                          <span>{Math.floor(event.timeLeft / 60)}m left</span>
                        </div>
                      </div>

                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all text-[#ff5f6e] text-xs font-bold flex items-center gap-0.5 translate-x-1 group-hover:translate-x-0">
                        Hunt <ArrowUpRight className="w-3.5 h-3.5" />
                      </div>
                    </div>
                  );
                });
              })()}

              {flashEvents.length > 5 && (
                <button
                  type="button"
                  onClick={() => {
                    fireHaptic('light');
                    setIsListExpanded(!isListExpanded);
                  }}
                  className="w-full bg-[#161b2b]/60 hover:bg-[#161b2b] text-[#ff5f6e] hover:text-white text-xs font-extrabold py-2.5 rounded-xl border border-dashed border-red-500/20 transition-all cursor-pointer text-center"
                >
                  {isListExpanded ? "▲ Show Fewer Alerts" : `▼ Show All Alerts (${flashEvents.length})`}
                </button>
              )}
            </>
          )}
        </div>

        {/* Push Proximity Settings Panel */}
        <div className="border-t border-zinc-800/80 pt-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black uppercase tracking-wider text-[#ff5f6e] flex items-center gap-1">
              <Bell className="w-3.5 h-3.5 text-[#ff4e5e]" /> Push & Proximity Settings
            </span>
            {permissionStatus !== 'granted' && (
              <button
                type="button"
                onClick={requestBrowserPermission}
                className="text-[10px] font-bold text-red-400 hover:text-white bg-red-500/10 hover:bg-red-500/25 border border-red-500/30 px-2 py-0.5 rounded-md cursor-pointer transition-all border-none"
              >
                Enable Browser Alerts
              </button>
            )}
          </div>

          <div className="bg-[#121624]/60 border border-zinc-800/80 rounded-2xl p-3.5 space-y-3 text-xs">
            <div className="flex items-center justify-between">
              <span className="text-zinc-300 font-bold flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-green-500/80" /> Alert System Status
              </span>
              <button
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  updateNotifSettings({ enabled: !notifSettings.enabled });
                }}
                className={`font-black text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  notifSettings.enabled
                    ? 'bg-green-500/10 border-green-500/30 text-green-400'
                    : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-500'
                }`}
              >
                {notifSettings.enabled ? 'ACTIVE' : 'MUTED'}
              </button>
            </div>

            <div className="space-y-1.5 pt-1">
              <div className="flex justify-between items-center text-[11px]">
                <span className="text-zinc-400 font-medium">Alert Proximity Limit:</span>
                <span className="text-[#ff5f6e] font-mono font-black bg-[#ff4e5e]/10 px-2 py-0.5 rounded-full font-bold">
                  {notifSettings.radiusKm} km
                </span>
              </div>
              <input
                type="range"
                min="0.5"
                max="10"
                step="0.5"
                value={notifSettings.radiusKm}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  updateNotifSettings({ radiusKm: val });
                }}
                className="w-full accent-[#ff4e5e] h-1.5 bg-zinc-800 rounded-lg cursor-pointer appearance-none"
              />
              <div className="flex justify-between text-[9px] text-zinc-600 font-mono font-bold">
                <span>0.5 km</span>
                <span>2.0 km (Default)</span>
                <span>5.0 km</span>
                <span>10.0 km</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
              <span className="text-zinc-400 font-bold flex items-center gap-1.5">
                <Volume2 className="w-3.5 h-3.5 text-zinc-500" /> Play Sound Chime
              </span>
              <button
                type="button"
                onClick={() => {
                  fireHaptic('light');
                  updateNotifSettings({ soundEnabled: !notifSettings.soundEnabled });
                }}
                className={`font-black text-[10px] px-2.5 py-1 rounded-full border transition-all cursor-pointer ${
                  notifSettings.soundEnabled
                    ? 'bg-blue-500/10 border-blue-500/30 text-blue-400'
                    : 'bg-zinc-800/40 border-zinc-700/50 text-zinc-500'
                }`}
              >
                {notifSettings.soundEnabled ? 'ON' : 'OFF'}
              </button>
            </div>

            <div className="pt-2 border-t border-zinc-800/40 space-y-2 text-left">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider block">
                🧪 Alert Proximity Test Hub
              </span>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    fireHaptic('medium');
                    const userLat = coords?.lat ?? 36.8065;
                    const userLng = coords?.lng ?? 10.1815;
                    const testEvent = {
                      id: `test_near_${Date.now()}`,
                      title: "🚨 Underground Warehouse Session",
                      description: "Vibe check passed. Subterranean techno inside industrial space. Password required.",
                      targetLat: userLat + 0.007, 
                      targetLng: userLng + 0.009,
                      timeLeft: 7200,
                      initialTime: 7200,
                      reward: 650,
                      claimed: false
                    };
                    dispatchFlashEventCreated(testEvent);
                  }}
                  className="bg-green-500/10 hover:bg-green-500/20 border border-green-500/25 hover:border-green-500/40 text-green-400 font-extrabold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center bg-transparent"
                >
                  Near Event (1.2km)
                </button>

                <button
                  type="button"
                  onClick={() => {
                    fireHaptic('medium');
                    const userLat = coords?.lat ?? 36.8065;
                    const userLng = coords?.lng ?? 10.1815;
                    const testEvent = {
                      id: `test_far_${Date.now()}`,
                      title: "📡 Silent Sunset Rave",
                      description: "Muted ambient sunrise gathering atop Signal Peak coordinates. Wear warm layer.",
                      targetLat: userLat + 0.035, 
                      targetLng: userLng + 0.025,
                      timeLeft: 7200,
                      initialTime: 7200,
                      reward: 800,
                      claimed: false
                    };
                    dispatchFlashEventCreated(testEvent);
                  }}
                  className="bg-yellow-500/10 hover:bg-yellow-500/20 border border-yellow-500/25 hover:border-yellow-500/40 text-yellow-400 font-extrabold text-[10px] py-2 rounded-xl transition-all cursor-pointer text-center bg-transparent"
                >
                  Far Event (4.5km)
                </button>
              </div>
              <span className="text-[9px] text-zinc-500 leading-snug block text-center font-medium">
                Events will only pop up on screen if they fall inside your {notifSettings.radiusKm}km boundary!
              </span>
            </div>
          </div>
        </div>

        <div className="pt-2 flex gap-3">
          <button
            type="button"
            onClick={() => {
              fireHaptic('light');
              setShowFlashListModal(false);
            }}
            className="w-full bg-[#161b2b] hover:bg-[#20273d] text-zinc-300 font-bold text-xs py-3 rounded-xl border border-zinc-800 transition-all cursor-pointer text-center outline-none"
          >
            Close Board
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default FlashListModal;
