import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useProfileSettings } from '@/features/profile/hooks/useProfileSettings';
import { useAuth } from '@/lib/auth';
import { supabase } from '@/infrastructure/supabase/supabaseClient';
import { messagingDomain } from '@/domains/d14_messaging';
import { 
  MessageSquare, Settings, Reply, Send, Check, Clock, AlertCircle, X 
} from 'lucide-react';
import { MessageSettingsTab } from './components/MessageSettingsTab';
import { MessageThreadView, DirectMessage } from './components/MessageThreadView';

interface MessageModalProps {
  onClose?: () => void;
}

interface ProfileLight {
  handle: string;
  photoUrl: string;
  displayName: string;
}

const FALLBACK_DMS_KEY = 'vq_fallback_direct_messages';
function getFallbackDMs(): DirectMessage[] {
  try {
    const raw = localStorage.getItem(FALLBACK_DMS_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveFallbackDMs(dms: DirectMessage[]) {
  try {
    localStorage.setItem(FALLBACK_DMS_KEY, JSON.stringify(dms));
  } catch (_) {}
}

export const MessageModal: React.FC<MessageModalProps> = ({ onClose }) => {
  const { t } = useProfileSettings();
  const { profile } = useAuth();
  
  const [activeTab, setActiveTab] = useState<'messages' | 'settings'>('messages');
  const [messages, setMessages] = useState<DirectMessage[]>([]);
  const [profiles, setProfiles] = useState<Record<string, ProfileLight>>({});
  const [loading, setLoading] = useState(true);
  
  const [replyingTo, setReplyingTo] = useState<DirectMessage | null>(null);
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [replyText, setReplyText] = useState('');
  const [sendSuccess, setSendSuccess] = useState(false);
  const [sending, setSending] = useState(false);

  const [onlyFromFollowing, setOnlyFromFollowing] = useState(() => {
    return localStorage.getItem(`vq_privacy_only_from_following_${profile?.handle}`) === 'true';
  });
  const [minVibeScore, setMinVibeScore] = useState(() => {
    return parseInt(localStorage.getItem(`vq_privacy_min_vibe_score_${profile?.handle}`) || '40', 10);
  });
  const [settingsSaved, setSettingsSaved] = useState(false);

  const handleSaveSettings = async () => {
    localStorage.setItem(`vq_privacy_only_from_following_${profile?.handle}`, String(onlyFromFollowing));
    localStorage.setItem(`vq_privacy_min_vibe_score_${profile?.handle}`, String(minVibeScore));
    setSettingsSaved(true);
    setTimeout(() => setSettingsSaved(false), 1500);

    if (profile && profile.id && profile.handle !== 'hannibal') {
      try {
        await supabase.from('profiles').update({
          custom_status: `Privacy: Score ${minVibeScore}+ | Following: ${onlyFromFollowing ? 'yes' : 'no'}`
        }).eq('id', profile.id);
      } catch (err) {
        console.warn("Could not sync privacy settings to database, keeping local:", err);
      }
    }
  };

  useEffect(() => {
    if (!profile?.handle) return;

    const loadProfilesAndDMs = async () => {
      try {
        const { data: list } = await supabase.from('profiles').select('*');
        const map: Record<string, ProfileLight> = {
          hack_nord: { handle: 'hack_nord', displayName: 'HACK NORD', photoUrl: 'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?auto=format&fit=crop&w=120&q=80' },
          shibuya_voyager: { handle: 'shibuya_voyager', displayName: 'SHIBUYA VOYAGE', photoUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=120&q=80' },
        };
        (list || []).forEach((p: any) => {
          if (p.handle) {
            map[p.handle.toLowerCase()] = {
              handle: p.handle,
              displayName: p.display_name || p.displayName || p.handle.toUpperCase(),
              photoUrl: p.photo_url || p.photoUrl || ''
            };
          }
        });
        setProfiles(map);

        const dms = getFallbackDMs();
        setMessages(dms);
      } catch (e) {
        console.warn("Could not fetch messages:", e);
      } finally {
        setLoading(false);
      }
    };

    loadProfilesAndDMs();
    const handleStorage = () => setMessages(getFallbackDMs());
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [profile?.handle]);

  const handleSend = async (destinationUser: string) => {
    if (!profile?.handle || !replyText.trim()) return;
    setSending(true);

    try {
      try {
        messagingDomain.sendMessage(
          `conv_dm_${destinationUser}`,
          profile.id || 'current_user',
          profile.handle,
          profile.displayName || profile.handle,
          replyText.trim()
        );
      } catch {}

      const newMsg: DirectMessage = {
        id: `msg_${Date.now()}`,
        fromUser: profile.handle,
        toUser: destinationUser,
        content: replyText.trim(),
        createdAt: new Date().toISOString(),
        userId: profile.id || 'current_user'
      };

      const dms = [newMsg, ...getFallbackDMs()];
      saveFallbackDMs(dms);
      setMessages(dms);

      setSendSuccess(true);
      setReplyText('');
      setSending(false);
      setTimeout(() => {
        setSendSuccess(false);
        setReplyingTo(null);
      }, 800);
    } catch (err) {
      console.error("Failed to post message:", err);
      setSending(false);
    }
  };

  const myHandleVal = (profile?.handle || 'hannibal').toLowerCase().trim();
  const contactMsgs = selectedContact ? messages.filter(m => {
    const fromLower = m.fromUser.toLowerCase().trim();
    const toLower = m.toUser.toLowerCase().trim();
    return (fromLower === selectedContact.toLowerCase().trim() && toLower === myHandleVal) ||
           (fromLower === myHandleVal && toLower === selectedContact.toLowerCase().trim());
  }).sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()) : [];

  return (
    <div className="bg-zinc-950 border border-white/20 rounded-3xl p-5 w-full max-w-md mx-auto text-white select-none space-y-4">
      <div className="flex items-center justify-between pb-3 border-b border-white/10 shrink-0">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl border border-purple-500/30 bg-purple-500/5 flex items-center justify-center">
            <MessageSquare className="w-4 h-4 text-purple-400" />
          </div>
          <div>
            <h3 className="font-extrabold text-[15px] uppercase tracking-wider italic">{t('messages.title')}</h3>
            <p className="text-[10px] text-zinc-500 font-mono tracking-tight">{t('messages.subtitle')}</p>
          </div>
        </div>
        {onClose && (
          <button onClick={onClose} className="w-8 h-8 rounded-xl bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <div className="flex bg-zinc-900/40 p-1 rounded-2xl border border-white/5">
        <button
          onClick={() => setActiveTab('messages')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'messages' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <MessageSquare className="w-3.5 h-3.5" /> Direct Feed
        </button>
        <button
          onClick={() => setActiveTab('settings')}
          className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 ${
            activeTab === 'settings' ? 'bg-purple-600 text-white shadow-lg' : 'text-zinc-500 hover:text-white'
          }`}
        >
          <Settings className="w-3.5 h-3.5" /> Privacy Rules
        </button>
      </div>

      <div className="min-h-[280px] max-h-[380px] overflow-y-auto pr-1">
        {activeTab === 'messages' && (
          <div className="space-y-3.5">
            <AnimatePresence mode="wait">
              {selectedContact ? (
                <MessageThreadView
                  selectedContact={selectedContact}
                  onBack={() => { setSelectedContact(null); setReplyText(''); }}
                  contactMsgs={contactMsgs}
                  myHandleVal={myHandleVal}
                  replyText={replyText}
                  setReplyText={setReplyText}
                  sending={sending}
                  sendSuccess={sendSuccess}
                  onSubmit={(e) => { e.preventDefault(); handleSend(selectedContact); }}
                />
              ) : (
                <div className="space-y-2">
                  {loading ? (
                    <div className="text-center py-10">
                      <div className="w-6 h-6 rounded-full border-2 border-purple-500/20 border-t-purple-500 animate-spin mx-auto" />
                    </div>
                  ) : messages.length === 0 ? (
                    <div className="text-center py-12 text-zinc-500 font-mono space-y-1 bg-zinc-900/25 rounded-2xl border border-white/5 p-4 text-xs">
                      <AlertCircle className="w-5 h-5 text-zinc-600 mx-auto" />
                      <p className="uppercase font-bold">No Active Direct Signals</p>
                      <p className="text-[9px] text-zinc-600 font-sans">Connect with travelers on Radar or Drift to start messaging</p>
                    </div>
                  ) : (
                    messages.map((m) => (
                      <div
                        key={m.id}
                        onClick={() => setSelectedContact(m.fromUser === myHandleVal ? m.toUser : m.fromUser)}
                        className="bg-zinc-900/30 border border-purple-500/10 p-3.5 rounded-2xl flex items-start gap-3 hover:border-purple-500/30 transition-all cursor-pointer"
                      >
                        <div className="w-10 h-10 rounded-full bg-zinc-900 border border-white/10 flex items-center justify-center text-zinc-300 font-bold font-mono text-xs">
                          {(m.fromUser === myHandleVal ? m.toUser : m.fromUser).substring(0, 2).toUpperCase()}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-white uppercase">@{m.fromUser === myHandleVal ? m.toUser : m.fromUser}</span>
                            <span className="text-[8px] font-mono text-zinc-500">{new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          </div>
                          <p className="text-[11px] text-zinc-300 truncate mt-1">{m.content}</p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </AnimatePresence>
          </div>
        )}

        {activeTab === 'settings' && (
          <MessageSettingsTab
            onlyFromFollowing={onlyFromFollowing}
            setOnlyFromFollowing={setOnlyFromFollowing}
            minVibeScore={minVibeScore}
            setMinVibeScore={setMinVibeScore}
            settingsSaved={settingsSaved}
            onSave={handleSaveSettings}
          />
        )}
      </div>
    </div>
  );
};
