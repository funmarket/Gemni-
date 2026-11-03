/**
 * Domain 26: Marketplace (D26)
 * Peer-to-peer listings, negotiations, and deal agreements.
 * Platform charges ZERO commission (non-custodial seller direct payment).
 * Mutual in-app agreement creates a qualifying deal Handshake under MKT-002.
 */

import { handshakeDomain } from '../d22_handshake';
import { vqLedger } from '../d20_vq_ledger';

export interface MarketplaceListing {
  id: string;
  sellerId: string;
  sellerHandle: string;
  sellerName: string;
  type: 'SELL' | 'BUY';
  category: 'Gear & Tech' | 'Art & Craft' | 'Passes & Tickets' | 'Books & Guides' | 'Apparel';
  title: string;
  description: string;
  price: number;
  currency: 'VQ' | 'TND' | 'USD';
  status: 'ACTIVE' | 'IN_DEAL' | 'COMPLETED' | 'CANCELLED';
  imageUrl?: string;
  district: string;
  sellerTerms: string;
  createdAt: string;
}

export interface MarketplaceDeal {
  id: string;
  listingId: string;
  listingTitle: string;
  buyerId: string;
  buyerHandle: string;
  buyerName: string;
  sellerId: string;
  sellerHandle: string;
  sellerName: string;
  agreedPrice: number;
  currency: 'VQ' | 'TND' | 'USD';
  proposedMeetingPlace: string;
  status: 'PROPOSED' | 'MUTUAL_AGREED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
  handshakeId?: string; // MKT-002: created on mutual in-app agreement
  createdAt: string;
  agreedAt?: string;
  completedAt?: string;
}

const LISTINGS_KEY = 'vq_marketplace_listings_v1';
const DEALS_KEY = 'vq_marketplace_deals_v1';

const DEFAULT_LISTINGS: MarketplaceListing[] = [
  {
    id: 'mkt_list_01',
    sellerId: 'usr_hannibal_1337',
    sellerHandle: 'hannibal',
    sellerName: 'Hannibal',
    type: 'SELL',
    category: 'Gear & Tech',
    title: 'Vintage Olympus OM-1 35mm Film Camera (Refurbished)',
    description: 'Mechanical manual focus camera perfect for Medina and street photography trails. Light seals replaced, clean viewfinder.',
    price: 150,
    currency: 'VQ',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=80',
    district: 'Bab Bhar / Medina',
    sellerTerms: 'Meet in daylight at public café. Inspect gear in person before Handshake.',
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'mkt_list_02',
    sellerId: 'usr_sarah_carthage',
    sellerHandle: 'sarah_carthage',
    sellerName: 'Sarah K.',
    type: 'SELL',
    category: 'Art & Craft',
    title: 'Handmade Carthage Sea-Glass Pendant & Leather Cord',
    description: 'Pendant created from smoothed sea glass gathered along Carthage coast and wrapped in artisan copper wire.',
    price: 35,
    currency: 'TND',
    status: 'ACTIVE',
    imageUrl: 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?auto=format&fit=crop&w=600&q=80',
    district: 'Sidi Bou Said',
    sellerTerms: 'Direct cash on meeting. No platform commission or markup.',
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString()
  }
];

class MarketplaceDomain {
  private listings: MarketplaceListing[] = [];
  private deals: MarketplaceDeal[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const listRaw = localStorage.getItem(LISTINGS_KEY);
      this.listings = listRaw ? JSON.parse(listRaw) : [...DEFAULT_LISTINGS];
      if (!listRaw) this.saveListings();

      const dealRaw = localStorage.getItem(DEALS_KEY);
      this.deals = dealRaw ? JSON.parse(dealRaw) : [];
    } catch {
      this.listings = [...DEFAULT_LISTINGS];
      this.deals = [];
    }
  }

  private saveListings() {
    try {
      localStorage.setItem(LISTINGS_KEY, JSON.stringify(this.listings));
    } catch {}
  }

  private saveDeals() {
    try {
      localStorage.setItem(DEALS_KEY, JSON.stringify(this.deals));
    } catch {}
  }

  public getListings(): MarketplaceListing[] {
    return this.listings;
  }

  public getListingById(id: string): MarketplaceListing | null {
    return this.listings.find(l => l.id === id) || null;
  }

  public createListing(data: Omit<MarketplaceListing, 'id' | 'status' | 'createdAt'>): MarketplaceListing {
    const listing: MarketplaceListing = {
      ...data,
      id: `mkt_${Date.now()}`,
      status: 'ACTIVE',
      createdAt: new Date().toISOString()
    };
    this.listings.unshift(listing);
    this.saveListings();
    this.notify();
    return listing;
  }

  public initiateDeal(
    listingId: string,
    buyerId: string,
    buyerHandle: string,
    buyerName: string,
    proposedMeetingPlace: string
  ): MarketplaceDeal {
    const listing = this.getListingById(listingId);
    if (!listing) throw new Error('Listing not found');

    const deal: MarketplaceDeal = {
      id: `deal_${Date.now()}`,
      listingId,
      listingTitle: listing.title,
      buyerId,
      buyerHandle,
      buyerName,
      sellerId: listing.sellerId,
      sellerHandle: listing.sellerHandle,
      sellerName: listing.sellerName,
      agreedPrice: listing.price,
      currency: listing.currency,
      proposedMeetingPlace,
      status: 'PROPOSED',
      createdAt: new Date().toISOString()
    };

    listing.status = 'IN_DEAL';
    this.deals.unshift(deal);
    this.saveListings();
    this.saveDeals();
    this.notify();
    return deal;
  }

  /**
   * MKT-002: Mutual in-app agreement creates a deal Handshake
   * (does not inherit default service +75 VQ rule).
   */
  public agreeToDeal(dealId: string): MarketplaceDeal {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    deal.status = 'MUTUAL_AGREED';
    deal.agreedAt = new Date().toISOString();

    // Create D22 Handshake under MKT-002 agreement
    const handshake = handshakeDomain.recordHandshake(
      deal.buyerId,
      deal.buyerHandle,
      deal.buyerName,
      deal.sellerId,
      deal.sellerHandle,
      deal.sellerName,
      'local',
      `Marketplace Deal: ${deal.listingTitle}`,
      `Agreed meetup at ${deal.proposedMeetingPlace}`
    );

    deal.handshakeId = handshake.id;
    this.saveDeals();
    this.notify();
    return deal;
  }

  /**
   * Complete deal: optionally transfers VQ if currency is VQ.
   */
  public completeDeal(dealId: string): MarketplaceDeal {
    const deal = this.deals.find(d => d.id === dealId);
    if (!deal) throw new Error('Deal not found');

    deal.status = 'COMPLETED';
    deal.completedAt = new Date().toISOString();

    // If agreed in VQ, execute double-entry ledger transfer from buyer to seller
    if (deal.currency === 'VQ' && deal.agreedPrice > 0) {
      vqLedger.transferP2P(
        deal.buyerId,
        deal.sellerId,
        deal.agreedPrice,
        `Marketplace settlement: ${deal.listingTitle}`
      );
    }

    const listing = this.getListingById(deal.listingId);
    if (listing) {
      listing.status = 'COMPLETED';
      this.saveListings();
    }

    this.saveDeals();
    this.notify();
    return deal;
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

export const marketplaceDomain = new MarketplaceDomain();
