import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Send, AlertTriangle } from 'lucide-react';
import { messagingDomain } from '../../domains/d14_messaging';
import { notificationsDomain } from '../../domains/d23_notifications';

interface Message {
  id: string;
  from: 'me' | 'match';
  text?: string;
  imageUri?: string;
  time: number;
  hasError?: boolean;
}

interface VibeChatThreadProps {
  matchId: string;
  username: string;
  avatar: string;
  vibeScore: number;
  onBack: () => void;
}

export const VibeChatThread: React.FC<VibeChatThreadProps> = ({
  matchId,
  username,
  avatar,
  vibeScore,
  onBack,
}) => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'm-1', from: 'match', text: "Hey! saw your vibe post 👀", time: Date.now() - 300000 },
    { id: 'm-2', from: 'me', text: "haha yeah that spot was 🔥", time: Date.now() - 240000 },
    { id: 'm-3', from: 'match', text: "we should link up fr", time: Date.now() - 60000 },
  ]);

  const [inputValue, setInputValue] = useState<string>('');
  const [selectedPhoto, setSelectedPhoto] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Color interpolation for vibe rating
  const getScoreColor = (score: number) => {
    if (score < 30) return '#8E8E93';
    if (score < 70) return '#BF5AF2';
    return '#30D158';
  };

  const handleSend = async () => {
    const textToSend = inputValue.trim();
    if (!textToSend) return;

    // Build optimistic message representation
    const tempId = `optimistic-${Date.now()}`;
    const optimisticMsg: Message = {
      id: tempId,
      from: 'me',
      text: textToSend,
      time: Date.now(),
    };

    setMessages((prev) => [...prev, optimisticMsg]);
    setInputValue('');

    try {
      // Direct call to write in canonical D14 messaging domain
      try {
        messagingDomain.sendMessage(
          `conv_${matchId}`,
          'current_user',
          'hannibal',
          'Hannibal',
          textToSend
        );
      } catch {
        // Fallback or conversation creation
      }

      // Dispatch real in-app update event
      window.dispatchEvent(new CustomEvent('vq_new_direct_message', {
        detail: {
          fromUser: username,
          content: textToSend
        }
      }));
    } catch (err) {
      console.error('Failed to parse connection message on cloud:', err);
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === tempId ? { ...msg, hasError: true } : msg
        )
      );
    }
  };

  const formatMessageTime = (ms: number) => {
    const d = new Date(ms);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex flex-col h-full bg-[#000000] text-white select-none relative font-sans">
      
      {/* HEADER SECTION (STICKY) */}
      <div className="sticky top-0 bg-[#000000] border-b border-[#1C1C1E] px-4 py-3 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="p-1 -ml-1 text-[#3478F6] hover:text-[#3478F6]/85 transition-all active:scale-95 cursor-pointer"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          
          <div className="relative w-9 h-9 bg-[#1C1C1E] rounded-full flex items-center justify-center text-lg">
            {avatar || '🦁'}
          </div>

          <div className="text-left">
            <span className="block font-bold text-[15px] leading-tight text-white">
              @{username}
            </span>
            <span className="block text-[11px] text-[#8E8E93]">
              Active Connection
            </span>
          </div>
        </div>

        {/* Dynamic Vibe Rating chip */}
        <div className="text-right">
          <span 
            className="text-[12px] font-semibold"
            style={{ color: getScoreColor(vibeScore) }}
          >
            {vibeScore}% Vibe
          </span>
        </div>
      </div>

      {/* MESSAGE STREAM (SCROLLBAR HIDDEN) */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[300px]">
        {messages.map((msg) => {
          const isMe = msg.from === 'me';
          return (
            <div
              key={msg.id}
              className={`flex flex-col ${isMe ? 'items-end' : 'items-start'} space-y-1`}
            >
              <div className="flex items-center gap-2">
                {/* ⚠️ Warning indicator if error */}
                {isMe && msg.hasError && (
                  <AlertTriangle className="w-4 h-4 text-[#FF375F] shrink-0" />
                )}

                {/* Msg Bubble styled according to sender */}
                <div
                  className="px-3.5 py-2.5 max-w-[75%] text-[14px] leading-snug font-regular transition-all"
                  style={{
                    backgroundColor: isMe ? '#3478F6' : '#1C1C1E',
                    color: isMe ? '#FFFFFF' : '#EBEBF5',
                    borderRadius: isMe 
                      ? '18px 18px 4px 18px' 
                      : '18px 18px 18px 4px',
                  }}
                >
                  {msg.text && <p className="whitespace-pre-wrap">{msg.text}</p>}
                  
                  {msg.imageUri && (
                    <div className="relative rounded-lg overflow-hidden cursor-pointer">
                      <img
                        src={msg.imageUri}
                        alt="Shared Spot"
                        className="max-w-[200px] h-auto rounded-[12px]"
                        onClick={() => setSelectedPhoto(msg.imageUri || null)}
                        referrerPolicy="no-referrer"
                      />
                      <span className="block text-[10px] text-[#8E8E93] mt-1.5 font-normal">
                        Live Vibe 📸
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Timestamp layout */}
              <span className="text-[10px] text-[#636366] px-1">
                {formatMessageTime(msg.time)}
              </span>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* FOOTER INPUT CHANNEL */}
      <div className="sticky bottom-0 bg-[#000000] border-t border-[#1C1C1E] p-4 flex items-center gap-2 z-10 justify-between">
        <input
          type="text"
          placeholder="Say something..."
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') handleSend();
          }}
          className="flex-1 bg-[#1C1C1E] border-[1.5px] border-[#2C2C2E] rounded-[22px] px-4 py-2.5 text-[14px] text-white placeholder-[#636366] outline-none focus:border-[#3478F6] focus:ring-1 focus:ring-[#3478F6]/30 transition-all font-normal"
        />

        {/* Responsive Pill/Circle Action Send button */}
        <button
          type="button"
          onClick={handleSend}
          className={`h-10 shrink-0 bg-[#3478F6] text-white flex items-center justify-center select-none transition-all active:scale-95 ${
            inputValue.trim() ? 'px-4 rounded-[22px] font-bold text-xs' : 'w-10 rounded-full'
          }`}
          style={{
            opacity: inputValue.trim() ? 1 : 0.4,
          }}
        >
          {inputValue.trim() ? (
            <span className="uppercase tracking-wider flex items-center gap-1">
              Send <Send className="w-3.5 h-3.5" />
            </span>
          ) : (
            <Send className="w-4 h-4 text-white" />
          )}
        </button>
      </div>

      {/* FULL SCREEN LIGHTBOX FOR CAPTURED ATTACHMENTS */}
      {selectedPhoto && (
        <div 
          className="fixed inset-0 z-50 bg-[#000000]/95 flex items-center justify-center p-4 cursor-pointer"
          onClick={() => setSelectedPhoto(null)}
        >
          <img
            src={selectedPhoto}
            alt="View snapshot full zoom"
            className="max-w-full max-h-full object-contain rounded-xl"
            referrerPolicy="no-referrer"
          />
        </div>
      )}

    </div>
  );
};
