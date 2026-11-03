/**
 * Domain 27: Payments & Billing Boundary (D27)
 * Governs provider direct/cash payment terms, receipt representations, and
 * non-custodial billing boundaries per Master Plan Delta D27.
 * 
 * Invariant per Product Owner Directive:
 * No app-handled fiat payment custody at launch. Service providers state
 * direct/cash terms; platform does not attest payment merely because a Tour
 * or Hire is accepted.
 */

export interface ProviderPaymentTerms {
  providerId: string;
  acceptedMethods: ('cash' | 'direct_transfer' | 'card_on_site')[];
  currency: 'TND' | 'USD' | 'EUR';
  cancellationHours: number;
  depositRequired: boolean;
  termsNotice: string;
}

export interface DirectPaymentAgreement {
  id: string;
  engagementId: string;
  payerId: string;
  providerId: string;
  agreedAmount: number;
  currency: string;
  paymentMethod: 'cash' | 'direct_transfer' | 'card_on_site';
  settlementStatus: 'pending_provider_confirmation' | 'settled_direct' | 'disputed';
  confirmedAt?: string;
}

const STORAGE_KEY = 'vq_direct_payments_v1';

class PaymentsBillingDomain {
  private agreements: DirectPaymentAgreement[] = [];

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.agreements = raw ? JSON.parse(raw) : [];
    } catch {
      this.agreements = [];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.agreements));
    } catch {}
  }

  public getTermsForProvider(providerId: string): ProviderPaymentTerms {
    return {
      providerId,
      acceptedMethods: ['cash', 'card_on_site'],
      currency: 'TND',
      cancellationHours: 24,
      depositRequired: false,
      termsNotice: 'Direct payment to your Guide or Venue upon arrival. Free cancellation up to 24 hours prior.'
    };
  }

  public recordDirectAgreement(
    engagementId: string,
    payerId: string,
    providerId: string,
    agreedAmount: number,
    currency: string = 'TND'
  ): DirectPaymentAgreement {
    const agreement: DirectPaymentAgreement = {
      id: `agr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      engagementId,
      payerId,
      providerId,
      agreedAmount,
      currency,
      paymentMethod: 'cash',
      settlementStatus: 'pending_provider_confirmation'
    };

    this.agreements.unshift(agreement);
    this.save();
    return agreement;
  }

  public confirmSettlement(agreementId: string): boolean {
    const ag = this.agreements.find(a => a.id === agreementId);
    if (!ag) return false;
    ag.settlementStatus = 'settled_direct';
    ag.confirmedAt = new Date().toISOString();
    this.save();
    return true;
  }
}

export const paymentsBillingDomain = new PaymentsBillingDomain();
