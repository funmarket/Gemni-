/**
 * Repository: Ledger Repository
 * Authoritative integration with Domain 20 VQ Ledger & Firestore.
 */

import { vqLedger } from '@/domains/d20_vq_ledger';

export interface LedgerTransaction {
  id: string;
  type: 'tip' | 'reward' | 'checkin' | 'claim' | 'trade_buy' | 'trade_sell' | 'escrow_lock' | 'escrow_release';
  amount: number;
  currency: string;
  sender: string;
  recipient: string;
  timestamp: string;
  venueName?: string;
  status: 'completed' | 'pending' | 'escrowed';
}

const LOCAL_LEDGER_KEY = 'vq_ledger_activities';

export const ledgerRepository = {
  async dispatchTip(senderId: string, recipientId: string, amount: number): Promise<void> {
    vqLedger.debit(
      senderId,
      amount,
      'P2P_TRANSFER',
      `Tip dispatched to @${recipientId}`
    );

    this.addTransaction({
      type: 'tip',
      amount,
      currency: 'VQ',
      sender: senderId,
      recipient: recipientId,
      status: 'completed',
    });
  },

  getTransactions(): LedgerTransaction[] {
    try {
      const stored = localStorage.getItem(LOCAL_LEDGER_KEY);
      if (stored) return JSON.parse(stored);
    } catch {
      // fallback
    }

    // Mirror D20 VQ Ledger entries
    const d20Entries = vqLedger.getEntries('current_user');
    return d20Entries.map((e) => ({
      id: e.id,
      type: e.direction === 'credit' ? 'reward' : 'tip',
      amount: e.amount,
      currency: 'VQ',
      sender: e.direction === 'credit' ? 'VibeQuest' : 'current_user',
      recipient: e.direction === 'credit' ? 'current_user' : (e.notes || 'recipient'),
      timestamp: e.createdAt,
      status: 'completed',
    }));
  },

  saveTransactions(transactions: LedgerTransaction[]): void {
    try {
      localStorage.setItem(LOCAL_LEDGER_KEY, JSON.stringify(transactions));
    } catch (_) {}
  },

  addTransaction(tx: Omit<LedgerTransaction, 'id' | 'timestamp'> & { id?: string; timestamp?: string }): LedgerTransaction {
    const newTx: LedgerTransaction = {
      id: tx.id || `tx_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: tx.timestamp || new Date().toISOString(),
      ...tx,
    };

    const current = this.getTransactions();
    const updated = [newTx, ...current.filter((t) => t.id !== newTx.id)];
    this.saveTransactions(updated);
    return newTx;
  },
};
