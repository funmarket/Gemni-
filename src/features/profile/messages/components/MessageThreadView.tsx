import React from 'react';
import { motion } from 'motion/react';
import { ArrowLeft, Send, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface DirectMessage {
  id: string;
  fromUser: string;
  toUser: string;
  content: string;
  createdAt: string;
  userId?: string;
}

interface MessageThreadViewProps {
  selectedContact: string;
  onBack: () => void;
  contactMsgs: DirectMessage[];
  myHandleVal: string;
  replyText: string;
  setReplyText: (val: string) => void;
  sending: boolean;
  sendSuccess: boolean;
  onSubmit: (e: React.FormEvent) => void;
}

export const MessageThreadView: React.FC<MessageThreadViewProps> = ({
  selectedContact,
  onBack,
  contactMsgs,
  myHandleVal,
  replyText,
  setReplyText,
  sending,
  sendSuccess,
  onSubmit,
}) => {
  return (
    <motion.div 
      key="thread-detail"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {/* Thread Header */}
      <div className="flex justify-between items-center pb-2 border-b border-white/5">
        <button 
          type="button"
          onClick={onBack}
          className="text-[10px] font-mono text-purple-400 hover:text-purple-300 uppercase font-black flex items-center gap-1 cursor-pointer bg-purple-500/5 px-2 py-1 rounded-lg border border-purple-500/15"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back
        </button>
        <span className="text-[10px] font-mono tracking-wider text-zinc-400 uppercase font-black">
          @{selectedContact}
        </span>
      </div>

      {/* Chronological Chat bubbles */}
      <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-1">
        {contactMsgs.map((m) => {
          const isMe = m.fromUser.toLowerCase().trim() === myHandleVal;
          return (
            <div 
              key={m.id}
              className={cn(
                "flex flex-col max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed font-sans",
                isMe 
                  ? "ml-auto bg-purple-600 text-white rounded-br-none border border-purple-500/20" 
                  : "mr-auto bg-zinc-900 border border-white/5 text-zinc-100 rounded-bl-none"
              )}
            >
              <p className="break-words">{m.content}</p>
              <span className="text-[8px] font-mono text-zinc-400 mt-1.5 self-end block">
                {new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
          );
        })}
      </div>

      {/* Chat Composer */}
      <form onSubmit={onSubmit} className="space-y-2 pt-2 border-t border-white/5">
        <div className="flex gap-2">
          <input
            type="text"
            placeholder={`Transmit to @${selectedContact}...`}
            value={replyText}
            onChange={(e) => setReplyText(e.target.value)}
            required
            className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-purple-500 font-sans"
          />
          <button
            type="submit"
            disabled={sending || !replyText.trim() || sendSuccess}
            className="bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-850 disabled:text-zinc-600 px-4 rounded-xl text-xs font-bold uppercase transition-colors flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" />
            {sending ? "..." : "Send"}
          </button>
        </div>
        {sendSuccess && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-2 rounded-xl text-[10px] text-emerald-400 flex items-center gap-1.5 animate-pulse">
            <Check className="w-3.5 h-3.5 shrink-0" />
            <span>Signal transmitted</span>
          </div>
        )}
      </form>
    </motion.div>
  );
};
