import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  X, MapPin, Bell, Shield, Plus, Trash2, RefreshCw, 
  Settings, Users, Info, Sparkles, Navigation, Check, AlertCircle
} from 'lucide-react';
import { useFindHub } from '../hooks/useFindHub';
import { HubContact } from '../types/findHubTypes';
import { getDistanceMeters } from '../services/findHubService';
import { useGeolocation } from '@/hooks/useGeolocation';

interface FindHubModalProps {
  isOpen: boolean;
  onClose: () => void;
  triggerAlert: (title: string, msg: string) => void;
  triggerHaptic: (style: string) => void;
}

export const FindHubModal: React.FC<FindHubModalProps> = ({
  isOpen,
  onClose,
  triggerAlert,
  triggerHaptic,
}) => {
  const { latitude: userLat, longitude: userLng } = useGeolocation();
  const refLat = userLat || 37.7749;
  const refLng = userLng || -122.4194;

  const {
    contacts,
    alerts,
    toggleLockOn,
    toggleGeofence,
    addGeofence,
    deleteGeofence,
    clearAlertLogs,
    simulateMovement,
    markAlertsRead,
  } = useFindHub(triggerAlert, triggerHaptic);

  const [activeTab, setActiveTab] = useState<'people' | 'alerts'>('people');
  const [expandedContactId, setExpandedContactId] = useState<string | null>(null);

  // New Geofence form states
  const [newGfLabel, setNewGfLabel] = useState('');
  const [newGfRadius, setNewGfRadius] = useState(200);
  const [useCurrentGfLoc, setUseCurrentGfLoc] = useState(true);
  const [customLat, setCustomLat] = useState(refLat.toFixed(4));
  const [customLng, setCustomLng] = useState(refLng.toFixed(4));

  if (!isOpen) return null;

  const handleAddGeofenceSubmit = (contactId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newGfLabel.trim()) return;

    let targetLat = refLat;
    let targetLng = refLng;

    if (!useCurrentGfLoc) {
      targetLat = parseFloat(customLat) || refLat;
      targetLng = parseFloat(customLng) || refLng;
    } else {
      // Slightly offset current user position to create an interesting geofence nearby
      const offsetLat = (Math.random() - 0.5) * 0.005;
      const offsetLng = (Math.random() - 0.5) * 0.005;
      targetLat += offsetLat;
      targetLng += offsetLng;
    }

    addGeofence(contactId, newGfLabel, targetLat, targetLng, newGfRadius);
    setNewGfLabel('');
    triggerAlert('Geofence Created', `New boundary "${newGfLabel}" added successfully.`);
  };

  const handlePingRadar = () => {
    simulateMovement();
    triggerHaptic('heavy');
  };

  const unreadAlertsCount = alerts.filter(a => !a.isRead).length;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-300 select-none">
      <motion.div
        initial={{ scale: 0.95, y: 15, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.95, y: 15, opacity: 0 }}
        className="relative bg-[#0d0c10] border border-zinc-800 text-zinc-100 max-w-lg w-full rounded-3xl shadow-2xl overflow-hidden flex flex-col h-[85vh] max-h-[750px] font-sans"
      >
        {/* UPPER GLOW */}
        <div className="absolute top-0 inset-x-0 h-40 bg-gradient-to-b from-[#3DDC6C]/10 to-transparent pointer-events-none" />

        {/* HEADER BAR */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-800/80 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10 rounded-2xl bg-[#3DDC6C]/10 border border-[#3DDC6C]/30 overflow-hidden">
              <Navigation className="w-5 h-5 text-[#3DDC6C]" />
              <div className="absolute inset-0 bg-[#3DDC6C]/5 animate-ping rounded-full" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-md font-extrabold tracking-tight font-display text-white">Find Hub</h2>
                <span className="bg-[#3DDC6C]/20 text-[#3DDC6C] text-[9px] px-1.5 py-0.5 rounded-full font-mono font-bold tracking-wider uppercase">SOCIAL RADAR</span>
              </div>
              <p className="text-xs text-zinc-400">Real-time meetups & proximity alerts</p>
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={handlePingRadar}
              title="Ping active contacts and update proximity radar"
              className="px-2.5 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-[#3DDC6C] hover:text-[#3DDC6C]/90 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1.5 transition-all outline-none"
            >
              <RefreshCw className="w-3 h-3 animate-spin" /> Ping Radar
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl bg-zinc-900 border border-zinc-850 text-zinc-400 hover:text-white hover:bg-zinc-800 active:scale-95 transition-all outline-none"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* TABS SELECTOR */}
        <div className="px-6 py-2 bg-zinc-950/60 border-b border-zinc-900/60 flex items-center justify-between relative z-10 shrink-0">
          <div className="flex gap-1.5 w-full">
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('people');
              }}
              className={`flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all ${
                activeTab === 'people'
                  ? 'bg-zinc-800/80 text-white border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Users className="w-3.5 h-3.5" />
                Social Circle
              </span>
            </button>
            <button
              onClick={() => {
                triggerHaptic('light');
                setActiveTab('alerts');
                markAlertsRead();
              }}
              className={`flex-1 py-2 text-xs font-bold font-mono uppercase tracking-wider rounded-xl transition-all relative ${
                activeTab === 'alerts'
                  ? 'bg-zinc-800/80 text-white border border-zinc-700/50'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                <Bell className="w-3.5 h-3.5" />
                Meetup Alerts
                {unreadAlertsCount > 0 && (
                  <span className="w-2 h-2 bg-[#3DDC6C] rounded-full animate-bounce shrink-0" />
                )}
              </span>
            </button>
          </div>
        </div>

        {/* SCROLLABLE LIST CONTAINER */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4 relative z-10 scrollbar-none">
          {activeTab === 'people' ? (
            <div className="space-y-3.5">
              {contacts.length === 0 ? (
                <div className="text-center py-10 space-y-2">
                  <div className="text-3xl text-zinc-600">👤</div>
                  <p className="text-sm font-semibold text-zinc-400">No contacts synced yet.</p>
                </div>
              ) : (
                contacts.map(contact => {
                  const isExpanded = expandedContactId === contact.id;
                  const currentDistance = getDistanceMeters(contact.latitude, contact.longitude, refLat, refLng);
                  const isLockOn = contact.lockOnEnabled;

                  return (
                    <div
                      key={contact.id}
                      className={`rounded-2xl border transition-all ${
                        isExpanded
                          ? 'bg-zinc-900/60 border-zinc-700/60 shadow-xl'
                          : 'bg-[#121116] border-zinc-900 hover:border-zinc-800/80'
                      }`}
                    >
                      {/* COLLAPSED HEADER */}
                      <div
                        onClick={() => {
                          triggerHaptic('light');
                          setExpandedContactId(isExpanded ? null : contact.id);
                        }}
                        className="p-4 flex items-center justify-between cursor-pointer"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="text-2xl bg-zinc-900/80 border border-zinc-800 p-2 rounded-xl shrink-0">
                            {contact.avatar}
                          </span>
                          <div className="min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-white truncate">{contact.username}</span>
                              <span className="bg-zinc-800 text-zinc-400 text-[10px] px-2 py-0.5 rounded-md font-medium shrink-0">
                                {contact.relationship}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-0.5">
                              <MapPin className="w-3.5 h-3.5 text-[#3DDC6C]" />
                              <span>{(currentDistance / 1000).toFixed(1)} km away</span>
                              <span className="text-zinc-600">•</span>
                              {isLockOn ? (
                                <span className="text-[#3DDC6C] flex items-center gap-1 font-mono text-[10px]">
                                  <span className="w-1.5 h-1.5 bg-[#3DDC6C] rounded-full animate-pulse" />
                                  Lock-on Active
                                </span>
                              ) : (
                                <span className="text-zinc-500 font-mono text-[10px]">Tap to setup</span>
                              )}
                            </div>
                          </div>
                        </div>

                        {/* Lock-On Toggle Switch */}
                        <div className="flex items-center gap-3">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleLockOn(contact.id);
                            }}
                            className={`px-3 py-1.5 rounded-xl font-mono text-[10px] font-bold uppercase tracking-wider transition-all border shrink-0 ${
                              isLockOn
                                ? 'bg-[#3DDC6C]/10 text-[#3DDC6C] border-[#3DDC6C]/40 hover:bg-[#3DDC6C]/20'
                                : 'bg-zinc-900 text-zinc-400 border-zinc-800 hover:text-zinc-200'
                            }`}
                          >
                            {isLockOn ? 'Locked-On' : 'Lock-On'}
                          </button>
                        </div>
                      </div>

                      {/* EXPANDED DETAILED PANELS */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: 'auto', opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            className="overflow-hidden border-t border-zinc-800/60 bg-zinc-950/40"
                          >
                            <div className="p-4 space-y-4 text-xs">
                              {/* Coordinates display */}
                              <div className="grid grid-cols-2 gap-2 bg-zinc-900/50 p-2.5 rounded-xl border border-zinc-850/60">
                                <div>
                                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-mono">GPS Latitude</span>
                                  <span className="font-bold font-mono text-zinc-300">{contact.latitude.toFixed(6)}</span>
                                </div>
                                <div>
                                  <span className="text-zinc-500 block text-[9px] uppercase tracking-wider font-mono">GPS Longitude</span>
                                  <span className="font-bold font-mono text-zinc-300">{contact.longitude.toFixed(6)}</span>
                                </div>
                              </div>

                              {/* Geofence Boundaries list */}
                              <div className="space-y-2">
                                <span className="font-bold text-zinc-300 flex items-center gap-1">
                                  <Shield className="w-3.5 h-3.5 text-[#3DDC6C]" />
                                  Geofence Alert Boundaries
                                </span>

                                {contact.geofences.length === 0 ? (
                                  <p className="text-zinc-500 italic py-2">No boundaries set for this contact.</p>
                                ) : (
                                  <div className="space-y-1.5">
                                    {contact.geofences.map(gf => {
                                      const distanceToBoundary = getDistanceMeters(contact.latitude, contact.longitude, gf.latitude, gf.longitude);
                                      const isNearNow = distanceToBoundary <= gf.radiusMeters;

                                      return (
                                        <div
                                          key={gf.id}
                                          className="p-2.5 rounded-xl bg-[#121116] border border-zinc-850 flex items-center justify-between"
                                        >
                                          <div>
                                            <div className="flex items-center gap-1.5">
                                              <span className="font-semibold text-white">{gf.label}</span>
                                              <span className="text-[10px] text-zinc-500">({gf.radiusMeters}m radius)</span>
                                            </div>
                                            <div className="text-[10px] text-zinc-400 mt-0.5 flex items-center gap-1">
                                              <span>Current position status:</span>
                                              {isNearNow ? (
                                                <span className="text-[#3DDC6C] font-semibold">Inside boundary</span>
                                              ) : (
                                                <span className="text-zinc-500">Outside range ({Math.round(distanceToBoundary)}m)</span>
                                              )}
                                            </div>
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {/* Enable toggle button */}
                                            <button
                                              type="button"
                                              onClick={() => toggleGeofence(contact.id, gf.id)}
                                              className={`px-2.5 py-1 rounded-lg text-[9px] font-mono font-bold uppercase transition-all ${
                                                gf.isEnabled
                                                  ? 'bg-[#3DDC6C]/10 text-[#3DDC6C] border border-[#3DDC6C]/30'
                                                  : 'bg-zinc-900 text-zinc-500 border border-zinc-800'
                                              }`}
                                            >
                                              {gf.isEnabled ? 'Enabled' : 'Disabled'}
                                            </button>
                                            {/* Delete boundary */}
                                            <button
                                              type="button"
                                              onClick={() => deleteGeofence(contact.id, gf.id)}
                                              className="p-1.5 text-zinc-500 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                                            >
                                              <Trash2 className="w-3.5 h-3.5" />
                                            </button>
                                          </div>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>

                              {/* Form to Add New Geofence */}
                              <form
                                onSubmit={(e) => handleAddGeofenceSubmit(contact.id, e)}
                                className="bg-[#121116]/80 p-3 rounded-2xl border border-zinc-850 space-y-3"
                              >
                                <span className="font-extrabold text-[10px] text-zinc-400 uppercase tracking-wider block">Add Custom Boundary</span>
                                
                                <div className="grid grid-cols-2 gap-2">
                                  <input
                                    type="text"
                                    placeholder="e.g. Home, School, Mall"
                                    value={newGfLabel}
                                    onChange={(e) => setNewGfLabel(e.target.value)}
                                    className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none focus:border-[#3DDC6C]/50 text-white placeholder-zinc-500 text-xs w-full"
                                  />
                                  <select
                                    value={newGfRadius}
                                    onChange={(e) => setNewGfRadius(parseInt(e.target.value))}
                                    className="px-2 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 focus:outline-none text-white text-xs w-full cursor-pointer"
                                  >
                                    <option value={150}>150m (Precise)</option>
                                    <option value={250}>250m (Medium)</option>
                                    <option value={500}>500m (Broad)</option>
                                  </select>
                                </div>

                                <div className="flex items-center gap-3 py-1 text-[10px] text-zinc-400">
                                  <span className="font-semibold">Boundary Target Location:</span>
                                  <div className="flex gap-2">
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={useCurrentGfLoc}
                                        onChange={() => setUseCurrentGfLoc(true)}
                                        className="accent-[#3DDC6C]"
                                      />
                                      Current Map Area
                                    </label>
                                    <label className="flex items-center gap-1.5 cursor-pointer">
                                      <input
                                        type="radio"
                                        checked={!useCurrentGfLoc}
                                        onChange={() => setUseCurrentGfLoc(false)}
                                        className="accent-[#3DDC6C]"
                                      />
                                      Custom Coordinates
                                    </label>
                                  </div>
                                </div>

                                {!useCurrentGfLoc && (
                                  <div className="grid grid-cols-2 gap-2">
                                    <input
                                      type="text"
                                      placeholder="Latitude"
                                      value={customLat}
                                      onChange={(e) => setCustomLat(e.target.value)}
                                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                                    />
                                    <input
                                      type="text"
                                      placeholder="Longitude"
                                      value={customLng}
                                      onChange={(e) => setCustomLng(e.target.value)}
                                      className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[10px] font-mono text-zinc-300"
                                    />
                                  </div>
                                )}

                                <button
                                  type="submit"
                                  className="w-full h-8 bg-zinc-800 hover:bg-[#3DDC6C] hover:text-black font-semibold text-[10px] uppercase tracking-wider rounded-xl transition-all flex items-center justify-center gap-1 cursor-pointer outline-none border-none"
                                >
                                  <Plus className="w-3.5 h-3.5" /> Save Geofence Rule
                                </button>
                              </form>

                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* ACTIVE ALERTS TAB */
            <div className="space-y-3.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-zinc-400 font-medium">Triggered Alert History</span>
                {alerts.length > 0 && (
                  <button
                    onClick={clearAlertLogs}
                    className="text-xs text-rose-400 hover:underline flex items-center gap-1 border-none bg-transparent cursor-pointer font-bold"
                  >
                    <Trash2 className="w-3.5 h-3.5" /> Clear Logs
                  </button>
                )}
              </div>

              {alerts.length === 0 ? (
                <div className="text-center py-12 bg-[#121116] rounded-2xl border border-zinc-900/60 p-6">
                  <div className="w-10 h-10 rounded-full bg-zinc-900/60 flex items-center justify-center mx-auto mb-2 text-zinc-500">
                    <Bell className="w-5 h-5 text-zinc-600" />
                  </div>
                  <p className="text-sm font-semibold text-zinc-400">No active alerts recorded yet</p>
                  <p className="text-xs text-zinc-500 mt-1">Configure Meetup Rules above and tap 'Sim Move' in the header to test active arrivals!</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {alerts.map(alert => (
                    <div
                      key={alert.id}
                      className="p-3 bg-[#121116] border border-zinc-900 rounded-xl flex items-start gap-3 relative overflow-hidden"
                    >
                      {/* Alert type background glow */}
                      <div className={`absolute left-0 inset-y-0 w-1 ${alert.eventType === 'arrive' ? 'bg-[#3DDC6C]' : 'bg-amber-500'}`} />
                      
                      <span className="text-xl shrink-0 mt-0.5">{alert.avatar}</span>
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-[11px] text-white">{alert.username}</span>
                          <span className={`text-[8.5px] px-1.5 py-0.2 rounded-md uppercase font-mono font-black ${
                            alert.eventType === 'arrive' ? 'bg-[#3DDC6C]/10 text-[#3DDC6C]' : 'bg-amber-500/10 text-amber-500'
                          }`}>
                            {alert.eventType}
                          </span>
                        </div>
                        <p className="text-xs text-zinc-300 leading-normal">{alert.message}</p>
                        <span className="text-[10px] font-mono text-zinc-500 block">
                          {new Date(alert.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

      </motion.div>
    </div>
  );
};
