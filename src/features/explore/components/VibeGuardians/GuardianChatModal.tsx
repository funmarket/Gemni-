import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Send, Shield, Sparkles, MapPin, Camera, Info, CheckCheck } from 'lucide-react';
import { VibeGuardian, GuardianChatMessage } from './types';
import { loadGuardianChat, sendGuardianChatMessage } from './services/vibeGuardianStorage';

interface GuardianChatModalProps {
  guardian: VibeGuardian | null;
  onClose: () => void;
  currentUserProfile?: any;
  initialPrompt?: string;
}

const ICEBREAKERS = [
  "Hey! Are you free this weekend for a city walk?",
  "I loved your trail recommendations, could you guide us?",
  "What are your top hidden spots for views and coffee?",
  "Visiting for 2 days—would love your advice on an itinerary!"
];

export const GuardianChatModal: React.FC<GuardianChatModalProps> = ({
  guardian,
  onClose,
  currentUserProfile,
  initialPrompt = ''
}) => {
  const [messages, setMessages] = useState<GuardianChatMessage[]>([]);
  const [inputText, setInputText] = useState(initialPrompt);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (initialPrompt) {
      setInputText(initialPrompt);
    }
  }, [initialPrompt]);

  useEffect(() => {
    if (!guardian) return;
    const initial = loadGuardianChat(guardian.id);
    
    // Seed initial greeting if empty
    if (initial.length === 0) {
      const greeting: GuardianChatMessage = {
        id: `init-${Date.now()}`,
        guardianId: guardian.id,
        senderHandle: guardian.handle,
        senderName: guardian.name,
        text: `Hey there! Welcome to ${guardian.city}. I'm ${guardian.name.split(' ')[0]}, happy to help you explore, share recommendations, or guide your day trip. What kind of vibe are you looking for?`,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        isFromGuardian: true
      };
      setMessages([greeting]);
    } else {
      setMessages(initial);
    }
  }, [guardian]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  if (!guardian) return null;

  const handleSendMessage = (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text) return;

    const senderName = currentUserProfile?.displayName || 'Fellow Explorer';
    const senderHandle = currentUserProfile?.handle ? `@${currentUserProfile.handle}` : '@explorer_node';

    const updated = sendGuardianChatMessage(guardian.id, {
      guardianId: guardian.id,
      senderHandle,
      senderName,
      text,
      isFromGuardian: false
    });

    setMessages(updated);
    setInputText('');
    setIsTyping(false);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-[#110F15] border border-white/10 rounded-3xl w-full max-w-lg h-[85vh] max-h-[700px] flex flex-col overflow-hidden text-left shadow-2xl relative"
        >
          {/* Header Bar */}
          <div className="bg-[#17141E] border-b border-white/10 p-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3 min-w-0">
              <div className="relative w-11 h-11 rounded-xl overflow-hidden shrink-0 border border-purple-500/40 bg-zinc-900">
                <img
                  src={guardian.selfieUrl}
                  alt={guardian.name}
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border border-black" />
              </div>

              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <h4 className="font-extrabold text-white text-sm truncate">{guardian.name}</h4>
                  {guardian.type === 'pro' ? (
                    <span className="bg-amber-500/15 text-amber-300 text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded">
                      Pro
                    </span>
                  ) : (
                    <span className="bg-emerald-500/15 text-emerald-300 text-[8px] font-mono font-black uppercase px-1.5 py-0.5 rounded">
                      Local
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  {guardian.city}, {guardian.stateCountry} • Active Guide
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

          {/* Context Banner: MANDATORY "This is a Vibe Guardian chat" HEADER */}
          <div className="bg-gradient-to-r from-purple-950/60 via-purple-900/40 to-black/60 border-b border-purple-500/20 px-4 py-2.5 flex items-center gap-2.5 shrink-0 text-left">
            <div className="w-7 h-7 rounded-lg bg-purple-500/20 border border-purple-500/30 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-purple-300" />
            </div>
            <div className="min-w-0 flex-1">
              <h5 className="font-extrabold text-xs text-purple-200 tracking-wide font-mono uppercase">
                This is a Vibe Guardian chat
              </h5>
              <p className="text-[10px] text-zinc-400 truncate">
                Direct inquiry for tour bookings, local advice, and authentic hangouts.
              </p>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex flex-col ${msg.isFromGuardian ? 'items-start' : 'items-end'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-xs leading-relaxed space-y-1 shadow-sm ${
                    msg.isFromGuardian
                      ? 'bg-[#1D1A25] border border-white/5 text-zinc-200 rounded-tl-xs'
                      : 'bg-purple-600 text-white rounded-tr-xs'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{msg.text}</p>
                  <div
                    className={`text-[9px] font-mono flex items-center justify-end gap-1 ${
                      msg.isFromGuardian ? 'text-zinc-500' : 'text-purple-200'
                    }`}
                  >
                    <span>{msg.timestamp}</span>
                    {!msg.isFromGuardian && <CheckCheck className="w-3 h-3 text-purple-200" />}
                  </div>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-1.5 text-zinc-400 text-xs font-mono bg-[#1D1A25] px-3 py-2 rounded-xl w-fit border border-white/5">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-100" />
                <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-pulse delay-200" />
                <span className="text-[10px] ml-1">{guardian.name.split(' ')[0]} is typing...</span>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Quick Icebreakers bar */}
          <div className="px-3 py-2 bg-[#14121A] border-t border-white/5 overflow-x-auto flex gap-1.5 no-scrollbar shrink-0">
            {ICEBREAKERS.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => handleSendMessage(prompt)}
                className="bg-white/5 hover:bg-purple-500/15 border border-white/10 hover:border-purple-500/30 text-zinc-300 hover:text-purple-200 text-[10.5px] px-2.5 py-1 rounded-full whitespace-nowrap shrink-0 transition-colors cursor-pointer"
              >
                {prompt}
              </button>
            ))}
          </div>

          {/* Chat Input form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 bg-[#17141E] border-t border-white/10 flex items-center gap-2 shrink-0"
          >
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Message ${guardian.name.split(' ')[0]}...`}
              className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500 font-sans"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="bg-purple-600 hover:bg-purple-500 disabled:opacity-40 text-white font-mono font-bold text-xs p-2.5 rounded-xl transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
