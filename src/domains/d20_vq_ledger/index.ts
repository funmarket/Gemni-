/**
 * Domain 20: VQ Ledger (Double-Entry Ledger & Balance Authority)
 * Enforces authoritative ledger accounting, balance rules, and qualifying credits.
 * Governing specification: VQ-001, VQ-002, ADM-VQ-001–007.
 */

export interface VQRule {
  id: string;
  key: 'DAILY_STREAK' | 'PLACE_CHECKIN' | 'TRAIL_COMPLETION' | 'HANDSHAKE_APPROVED' | 'VIBECHECK_PASSED';
  name: string;
  description: string;
  creditAmount: number;
  frequencyCap: string; // e.g., 'once_per_day', 'max_3_per_day', 'max_2_per_day', 'once_per_engagement'
  maxPerDay: number;
  isActive: boolean;
  version: number;
}

export interface VQLedgerEntry {
  id: string;
  userId: string;
  accountType: 'user_wallet' | 'platform_reserve' | 'community_pool';
  direction: 'credit' | 'debit';
  amount: number;
  balanceAfter: number;
  reasonCode: 
    | 'DAILY_STREAK'
    | 'PLACE_CHECKIN'
    | 'HANDSHAKE_APPROVED'
    | 'VIBECHECK_COMPLETED'
    | 'TRAIL_COMPLETED'
    | 'P2P_TRANSFER'
    | 'P2P_RECEIVE'
    | 'CREATOR_TIP'
    | 'ADMIN_GRANT'
    | 'INITIAL_GRANT';
  referenceId?: string;
  notes?: string;
  createdAt: string;
}

export interface VQBalanceSummary {
  userId: string;
  currentBalance: number;
  totalEarned: number;
  totalSpent: number;
  transactionCount: number;
}

const STORAGE_KEY = 'vq_ledger_entries_v3';
const RULES_KEY = 'vq_ledger_rules_v3';

// Authoritative starting rules per Requirements.md VQ-002
export const INITIAL_RULES: VQRule[] = [
  {
    id: 'rule_streak_01',
    key: 'DAILY_STREAK',
    name: 'Daily Qualifying Streak',
    description: 'Awarded once per day when verifying presence on Home screen.',
    creditAmount: 25,
    frequencyCap: 'once_per_day',
    maxPerDay: 1,
    isActive: true,
    version: 1
  },
  {
    id: 'rule_checkin_02',
    key: 'PLACE_CHECKIN',
    name: 'Verified Venue Check-in',
    description: 'Awarded when verifying physical presence with device accuracy < 50m.',
    creditAmount: 50,
    frequencyCap: 'max_3_per_day',
    maxPerDay: 3,
    isActive: true,
    version: 1
  },
  {
    id: 'rule_trail_03',
    key: 'TRAIL_COMPLETION',
    name: 'Verified Trail Completion',
    description: 'Awarded upon qualified completion of an authored or adopted trail itinerary.',
    creditAmount: 100,
    frequencyCap: 'max_2_per_day',
    maxPerDay: 2,
    isActive: true,
    version: 1
  },
  {
    id: 'rule_handshake_04',
    key: 'HANDSHAKE_APPROVED',
    name: 'Accepted In-App Handshake',
    description: 'Awarded to BOTH participants (+75 VQ each) upon Provider acceptance of Hire or Tour.',
    creditAmount: 75,
    frequencyCap: 'once_per_engagement',
    maxPerDay: 99,
    isActive: true,
    version: 1
  },
  {
    id: 'rule_vibecheck_05',
    key: 'VIBECHECK_PASSED',
    name: 'Passed VibeCheck Response',
    description: 'Awarded on qualifying genuine camera response within 180s server window.',
    creditAmount: 30,
    frequencyCap: 'per_eligible_completed_challenge',
    maxPerDay: 5,
    isActive: true,
    version: 1
  }
];

const DEFAULT_INITIAL_ENTRIES: VQLedgerEntry[] = [
  {
    id: 'tx_init_001',
    userId: 'current_user',
    accountType: 'user_wallet',
    direction: 'credit',
    amount: 500,
    balanceAfter: 500,
    reasonCode: 'INITIAL_GRANT',
    notes: 'Welcome Voyager bootstrap grant',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'tx_init_002',
    userId: 'current_user',
    accountType: 'user_wallet',
    direction: 'credit',
    amount: 50,
    balanceAfter: 550,
    reasonCode: 'PLACE_CHECKIN',
    referenceId: 'place_medina_tunis',
    notes: 'Check-in: Medina of Tunis Rooftop',
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'tx_init_003',
    userId: 'current_user',
    accountType: 'user_wallet',
    direction: 'credit',
    amount: 75,
    balanceAfter: 625,
    reasonCode: 'HANDSHAKE_APPROVED',
    referenceId: 'hs_init_001',
    notes: 'In-app Handshake with Pro Guardian Yassine',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'tx_init_004',
    userId: 'current_user',
    accountType: 'user_wallet',
    direction: 'credit',
    amount: 25,
    balanceAfter: 650,
    reasonCode: 'DAILY_STREAK',
    notes: 'Daily streak check-in (Day 5)',
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

import { supabase } from '@/infrastructure/supabase/supabaseClient';

class VQLedgerDomain {
  private entries: VQLedgerEntry[] = [];
  private rules: VQRule[] = [];
  private listeners: Set<(summary: VQBalanceSummary) => void> = new Set();

  constructor() {
    this.load();
    this.syncFromSupabase();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.entries = raw ? JSON.parse(raw) : [...DEFAULT_INITIAL_ENTRIES];
      if (!raw) this.save();

      const rulesRaw = localStorage.getItem(RULES_KEY);
      this.rules = rulesRaw ? JSON.parse(rulesRaw) : [...INITIAL_RULES];
      if (!rulesRaw) this.saveRules();
    } catch {
      this.entries = [...DEFAULT_INITIAL_ENTRIES];
      this.rules = [...INITIAL_RULES];
    }
  }

  private async syncFromSupabase() {
    try {
      const { data } = await supabase.from('vq_ledger').select('*').limit(100);
      if (data && data.length > 0) {
        const remoteEntries = data.map((d: any) => ({
          id: d.id,
          userId: d.user_id || d.userId || 'current_user',
          accountType: d.account_type || d.accountType || 'user_wallet',
          direction: d.direction,
          amount: Number(d.amount),
          balanceAfter: Number(d.balance_after || d.balanceAfter),
          reasonCode: d.reason_code || d.reasonCode,
          notes: d.notes,
          referenceId: d.reference_id || d.referenceId,
          createdAt: d.created_at || d.createdAt,
        } as VQLedgerEntry));
        const existingIds = new Set(this.entries.map(e => e.id));
        const newOnes = remoteEntries.filter(e => !existingIds.has(e.id));
        if (newOnes.length > 0) {
          this.entries.push(...newOnes);
          this.save();
        }
      }
    } catch (e) {
      console.warn('Supabase ledger sync notice:', e);
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.entries));
    } catch (e) {
      console.warn('Failed to persist VQ ledger to localStorage:', e);
    }
    const summary = this.getBalanceSummary('current_user');
    this.listeners.forEach((cb) => cb(summary));
  }

  private async persistEntryToSupabase(entry: VQLedgerEntry) {
    try {
      await supabase.from('vq_ledger').upsert({
        id: entry.id,
        user_id: entry.userId,
        account_type: entry.accountType,
        direction: entry.direction,
        amount: entry.amount,
        balance_after: entry.balanceAfter,
        reason_code: entry.reasonCode,
        notes: entry.notes,
        reference_id: entry.referenceId,
        created_at: entry.createdAt,
      });
    } catch (e) {
      console.warn('Could not persist entry to Supabase vq_ledger:', e);
    }
  }

  private saveRules() {
    try {
      localStorage.setItem(RULES_KEY, JSON.stringify(this.rules));
    } catch {}
  }

  public getRules(): VQRule[] {
    return this.rules;
  }

  public updateRule(ruleId: string, updates: Partial<Pick<VQRule, 'creditAmount' | 'maxPerDay' | 'isActive'>>): VQRule {
    const rule = this.rules.find(r => r.id === ruleId);
    if (!rule) throw new Error('Rule not found');
    Object.assign(rule, updates, { version: rule.version + 1 });
    this.saveRules();
    return rule;
  }

  public subscribe(listener: (summary: VQBalanceSummary) => void): () => void {
    this.listeners.add(listener);
    listener(this.getBalanceSummary('current_user'));
    return () => this.listeners.delete(listener);
  }

  public getBalance(userId: string = 'current_user'): number {
    const userEntries = this.entries.filter((e) => e.userId === userId);
    return userEntries.reduce((acc, curr) => {
      return curr.direction === 'credit' ? acc + curr.amount : acc - curr.amount;
    }, 0);
  }

  public getBalanceSummary(userId: string = 'current_user'): VQBalanceSummary {
    const userEntries = this.entries.filter((e) => e.userId === userId);
    let totalEarned = 0;
    let totalSpent = 0;

    userEntries.forEach((e) => {
      if (e.direction === 'credit') totalEarned += e.amount;
      if (e.direction === 'debit') totalSpent += e.amount;
    });

    return {
      userId,
      currentBalance: totalEarned - totalSpent,
      totalEarned,
      totalSpent,
      transactionCount: userEntries.length,
    };
  }

  public getEntries(userId: string = 'current_user'): VQLedgerEntry[] {
    return this.entries
      .filter((e) => e.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  /**
   * Balanced double-entry credit
   */
  public credit(
    userId: string,
    amount: number,
    reasonCode: VQLedgerEntry['reasonCode'],
    notes?: string,
    referenceId?: string
  ): VQLedgerEntry {
    if (amount <= 0) throw new Error('Credit amount must be positive');
    const currentBalance = this.getBalance(userId);
    const newBalance = currentBalance + amount;

    const entry: VQLedgerEntry = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      accountType: 'user_wallet',
      direction: 'credit',
      amount,
      balanceAfter: newBalance,
      reasonCode,
      notes,
      referenceId,
      createdAt: new Date().toISOString(),
    };

    this.entries.push(entry);
    this.save();
    this.persistEntryToSupabase(entry);
    return entry;
  }

  /**
   * Balanced double-entry debit
   */
  public debit(
    userId: string,
    amount: number,
    reasonCode: VQLedgerEntry['reasonCode'],
    notes?: string,
    referenceId?: string
  ): VQLedgerEntry {
    if (amount <= 0) throw new Error('Debit amount must be positive');
    const currentBalance = this.getBalance(userId);
    if (currentBalance < amount) {
      throw new Error(`Insufficient VQ Balance: has ${currentBalance}, needs ${amount}`);
    }
    const newBalance = currentBalance - amount;

    const entry: VQLedgerEntry = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId,
      accountType: 'user_wallet',
      direction: 'debit',
      amount,
      balanceAfter: newBalance,
      reasonCode,
      notes,
      referenceId,
      createdAt: new Date().toISOString(),
    };

    this.entries.push(entry);
    this.save();
    this.persistEntryToSupabase(entry);
    return entry;
  }

  /**
   * Peer-to-peer balanced transfer
   */
  public transferP2P(fromUserId: string, toUserId: string, amount: number, note?: string): void {
    if (amount <= 0) throw new Error('Transfer amount must be positive');
    const refId = `p2p_${Date.now()}`;
    this.debit(fromUserId, amount, 'P2P_TRANSFER', note || `Transfer to ${toUserId}`, refId);
    this.credit(toUserId, amount, 'P2P_RECEIVE', note || `Received from ${fromUserId}`, refId);
  }

  /**
   * Tipping presets: 10 / 20 / 50 VQ transfers balance from tipper to recipient
   */
  public tipCreator(tipperId: string, creatorId: string, amount: 10 | 20 | 50, postRef: string): void {
    const note = `Creator Tip: ${amount} VQ for moment #${postRef}`;
    this.debit(tipperId, amount, 'CREATOR_TIP', note, postRef);
    this.credit(creatorId, amount, 'CREATOR_TIP', note, postRef);
  }

  /**
   * Check daily cap for an activity
   */
  private getTodayCount(userId: string, reasonCode: VQLedgerEntry['reasonCode']): number {
    const today = new Date().toISOString().slice(0, 10);
    return this.entries.filter(e => 
      e.userId === userId && 
      e.reasonCode === reasonCode && 
      e.direction === 'credit' &&
      e.createdAt.startsWith(today)
    ).length;
  }

  public recordDailyStreak(userId: string): VQLedgerEntry {
    const count = this.getTodayCount(userId, 'DAILY_STREAK');
    if (count >= 1) throw new Error('Daily streak quest already claimed today.');
    const rule = this.rules.find(r => r.key === 'DAILY_STREAK') || INITIAL_RULES[0];
    return this.credit(userId, rule.creditAmount, 'DAILY_STREAK', 'Daily streak presence check');
  }

  public recordPlaceCheckin(userId: string, placeId: string, placeName: string): VQLedgerEntry {
    const count = this.getTodayCount(userId, 'PLACE_CHECKIN');
    const rule = this.rules.find(r => r.key === 'PLACE_CHECKIN') || INITIAL_RULES[1];
    if (count >= rule.maxPerDay) {
      throw new Error(`Daily place check-in award cap reached (${rule.maxPerDay} awards max per day).`);
    }
    return this.credit(userId, rule.creditAmount, 'PLACE_CHECKIN', `Check-in: ${placeName}`, placeId);
  }

  public recordTrailCompletion(userId: string, trailId: string, trailName: string): VQLedgerEntry {
    const count = this.getTodayCount(userId, 'TRAIL_COMPLETED');
    const rule = this.rules.find(r => r.key === 'TRAIL_COMPLETED') || INITIAL_RULES[2];
    if (count >= rule.maxPerDay) {
      throw new Error(`Daily trail completion award cap reached (${rule.maxPerDay} awards max per day).`);
    }
    return this.credit(userId, rule.creditAmount, 'TRAIL_COMPLETED', `Completed Trail: ${trailName}`, trailId);
  }

  public recordHandshake(userId: string, handshakeId: string, peerHandle: string): VQLedgerEntry {
    const rule = this.rules.find(r => r.key === 'HANDSHAKE_APPROVED') || INITIAL_RULES[3];
    return this.credit(userId, rule.creditAmount, 'HANDSHAKE_APPROVED', `Handshake with @${peerHandle}`, handshakeId);
  }

  public recordVibeCheck(userId: string, challengeId: string): VQLedgerEntry {
    const rule = this.rules.find(r => r.key === 'VIBECHECK_PASSED') || INITIAL_RULES[4];
    return this.credit(userId, rule.creditAmount, 'VIBECHECK_COMPLETED', 'Passed reciprocal VibeCheck 180s', challengeId);
  }

  /**
   * ADM-VQ-003: Privileged Admin manual grant with individual/group/broad attribution
   */
  public adminManualGrant(recipientIds: string[], amount: number, label: string): number {
    if (amount <= 0) throw new Error('Grant amount must be positive');
    recipientIds.forEach(id => {
      this.credit(id, amount, 'ADMIN_GRANT', `Admin Grant: ${label}`);
    });
    return recipientIds.length * amount;
  }
}

export const vqLedger = new VQLedgerDomain();
