/**
 * Repository: Message Repository (Domain 14 Messaging)
 * Canonical direct messaging and chat persistence.
 */

export interface DirectMessage {
  id: string;
  fromUser: string;
  toUser: string;
  content: string;
  createdAt: string;
  userId?: string;
}

const STORAGE_KEY = 'vq_direct_messages_v2';

const SEED_DMS: DirectMessage[] = [
  {
    id: 'seed_dm_001',
    fromUser: 'yassine_medina',
    toUser: 'hannibal',
    content: 'Salam Voyager! Looking forward to showing you the secret rooftop terraces in the Medina.',
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    userId: 'user_yassine',
  },
  {
    id: 'seed_dm_002',
    fromUser: 'sarah_carthage',
    toUser: 'hannibal',
    content: 'The sunset over the Antonine thermal baths is spectacular today. Bring your camera!',
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    userId: 'user_sarah',
  }
];

export const messageRepository = {
  async getDirectMessages(myHandle: string = 'hannibal'): Promise<DirectMessage[]> {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const all: DirectMessage[] = JSON.parse(raw);
        const norm = myHandle.toLowerCase().trim();
        return all
          .filter((m) => m.toUser.toLowerCase() === norm || m.fromUser.toLowerCase() === norm)
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch {}

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SEED_DMS));
    } catch {}
    return [...SEED_DMS];
  },

  async sendDirectMessage(params: {
    fromUser: string;
    toUser: string;
    content: string;
    userId?: string;
  }): Promise<DirectMessage> {
    const raw = localStorage.getItem(STORAGE_KEY);
    const all: DirectMessage[] = raw ? JSON.parse(raw) : [...SEED_DMS];

    const newDm: DirectMessage = {
      id: `dm_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      fromUser: params.fromUser,
      toUser: params.toUser,
      content: params.content,
      createdAt: new Date().toISOString(),
      userId: params.userId,
    };

    all.unshift(newDm);
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(all));
    } catch {}

    window.dispatchEvent(new CustomEvent('vq:dms_updated'));
    return newDm;
  },

  subscribeToDirectMessages(onUpdate: () => void): () => void {
    const handleUpdate = () => onUpdate();
    window.addEventListener('vq:dms_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('vq:dms_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  },
};
