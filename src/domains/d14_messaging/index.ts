/**
 * Domain 14: Messaging (D14)
 * Canonical conversations and messages.
 * Enforces Vibe-gating: Ordinary 1:1 personal DMs require a confirmed D17 Vibe.
 * Separately supports Guardian consultations, Community rooms, Marketplace deals, and Event chats.
 */

import { matchingDomain } from '../d17_matching';
import { notificationsDomain } from '../d23_notifications';

export type ConversationType = 'PERSONAL_DM' | 'GUARDIAN_CONSULTATION' | 'COMMUNITY_ROOM' | 'MARKETPLACE_DEAL' | 'EVENT_DISCUSSION';

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderHandle: string;
  senderName: string;
  text: string;
  mediaUrl?: string;
  voiceNoteUrl?: string;
  status: 'SENT' | 'DELIVERED' | 'READ';
  createdAt: string;
}

export interface ConversationContext {
  id: string;
  type: ConversationType;
  participantIds: string[];
  referenceId?: string; // Guardian offer ID, Community ID, Marketplace listing ID, or Event ID
  title?: string;
  advisoryNote?: string; // Displayed on Guardian consultation or Marketplace deal threads
  createdAt: string;
  lastMessageAt: string;
}

const CONV_KEY = 'vq_messaging_conversations_v1';
const MSG_KEY = 'vq_messaging_messages_v1';

class MessagingDomain {
  private conversations: ConversationContext[] = [];
  private messages: ChatMessage[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const convRaw = localStorage.getItem(CONV_KEY);
      this.conversations = convRaw ? JSON.parse(convRaw) : [];

      const msgRaw = localStorage.getItem(MSG_KEY);
      this.messages = msgRaw ? JSON.parse(msgRaw) : [];
    } catch {
      this.conversations = [];
      this.messages = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(CONV_KEY, JSON.stringify(this.conversations));
      localStorage.setItem(MSG_KEY, JSON.stringify(this.messages));
    } catch {}
  }

  public getConversationsForUser(userId: string): ConversationContext[] {
    return this.conversations.filter(c => c.participantIds.includes(userId));
  }

  public getMessages(conversationId: string): ChatMessage[] {
    return this.messages.filter(m => m.conversationId === conversationId);
  }

  /**
   * Start or get an existing 1:1 personal DM.
   * STRICT INVARIANT: Requires confirmed D17 Vibe!
   */
  public startPersonalDM(userA: string, userB: string): ConversationContext {
    // Check confirmed Vibe in matchingDomain
    const confirmedVibes = matchingDomain.getConfirmedVibes();
    const hasVibe = confirmedVibes.some(v => 
      (v.initiatorId === userA && v.matchedUserId === userB) ||
      (v.initiatorId === userB && v.matchedUserId === userA)
    );

    if (!hasVibe) {
      throw new Error('Ordinary personal DMs require a confirmed Vibe (mutually accepted connection). Send a Pull or complete a reciprocal VibeCheck first.');
    }

    const existing = this.conversations.find(c => 
      c.type === 'PERSONAL_DM' && 
      c.participantIds.includes(userA) && 
      c.participantIds.includes(userB)
    );
    if (existing) return existing;

    const newConv: ConversationContext = {
      id: `conv_dm_${Date.now()}`,
      type: 'PERSONAL_DM',
      participantIds: [userA, userB],
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };

    this.conversations.unshift(newConv);
    this.save();
    this.notify();
    return newConv;
  }

  /**
   * Start Guardian Consultation chat (advisory banner included)
   */
  public startGuardianConsultation(clientId: string, guardianId: string, guardianName: string, rateNote: string): ConversationContext {
    const existing = this.conversations.find(c => 
      c.type === 'GUARDIAN_CONSULTATION' && 
      c.participantIds.includes(clientId) && 
      c.participantIds.includes(guardianId)
    );
    if (existing) return existing;

    const newConv: ConversationContext = {
      id: `conv_guardian_${Date.now()}`,
      type: 'GUARDIAN_CONSULTATION',
      participantIds: [clientId, guardianId],
      title: `Consultation with ${guardianName}`,
      advisoryNote: `Official Guardian Consultation: ${rateNote}. Inquiries here do not create a booking until accepted.`,
      createdAt: new Date().toISOString(),
      lastMessageAt: new Date().toISOString()
    };

    this.conversations.unshift(newConv);
    this.save();
    this.notify();
    return newConv;
  }

  public sendMessage(
    conversationId: string,
    senderId: string,
    senderHandle: string,
    senderName: string,
    text: string,
    mediaUrl?: string
  ): ChatMessage {
    const conv = this.conversations.find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    if (!conv.participantIds.includes(senderId)) throw new Error('Not authorized in conversation');

    const message: ChatMessage = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId,
      senderHandle,
      senderName,
      text,
      mediaUrl,
      status: 'SENT',
      createdAt: new Date().toISOString()
    };

    this.messages.push(message);
    conv.lastMessageAt = message.createdAt;
    this.save();

    // Notify other participants
    conv.participantIds
      .filter(id => id !== senderId)
      .forEach(recipientId => {
        notificationsDomain.notify({
          userId: recipientId,
          title: `New message from ${senderName}`,
          message: text.substring(0, 80),
          type: 'DIRECT_MESSAGE'
        });
      });

    this.notify();
    return message;
  }

  public subscribe(cb: () => void): () => void {
    this.listeners.add(cb);
    cb();
    return () => this.listeners.delete(cb);
  }

  private notify() {
    this.listeners.forEach(cb => cb());
  }
}

export const messagingDomain = new MessagingDomain();
