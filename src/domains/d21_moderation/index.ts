/**
 * Domain 21: Moderation & Trust (D21)
 * User, Place, and content reports, sanctions, and auditable Control Room actions.
 */

export interface ModerationReport {
  id: string;
  reporterId: string;
  targetType: 'user' | 'place' | 'post' | 'message' | 'marketplace_deal';
  targetId: string;
  reason: string;
  details?: string;
  status: 'PENDING' | 'RESOLVED' | 'DISMISSED';
  actionTaken?: 'WARNING' | 'CONTENT_REMOVED' | 'ACCOUNT_SUSPENDED' | 'DISMISSED';
  reviewedBy?: string;
  createdAt: string;
  resolvedAt?: string;
}

const STORAGE_KEY = 'vq_moderation_reports_v1';

class ModerationDomain {
  private reports: ModerationReport[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.reports = raw ? JSON.parse(raw) : [];
    } catch {
      this.reports = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.reports));
    } catch {}
  }

  public submitReport(
    reporterId: string,
    targetType: ModerationReport['targetType'],
    targetId: string,
    reason: string,
    details?: string
  ): ModerationReport {
    const report: ModerationReport = {
      id: `rep_${Date.now()}`,
      reporterId,
      targetType,
      targetId,
      reason,
      details,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.reports.unshift(report);
    this.save();
    this.notify();
    return report;
  }

  public getReports(): ModerationReport[] {
    return this.reports;
  }

  public resolveReport(reportId: string, action: ModerationReport['actionTaken'], adminId: string): ModerationReport {
    const rep = this.reports.find(r => r.id === reportId);
    if (!rep) throw new Error('Report not found');
    rep.status = 'RESOLVED';
    rep.actionTaken = action;
    rep.reviewedBy = adminId;
    rep.resolvedAt = new Date().toISOString();
    this.save();
    this.notify();
    return rep;
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

export const moderationDomain = new ModerationDomain();
