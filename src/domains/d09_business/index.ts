/**
 * Domain 09: Businesses & Organizations (D09)
 * One Business profile per business user, automated certification badge,
 * multiple physical branch addresses, and operator permissions.
 */

export interface BusinessBranch {
  id: string;
  name: string;
  address: string;
  city: string;
  latitude: number;
  longitude: number;
  phone?: string;
  isPrimary: boolean;
  canonicalPlaceId?: string; // Optional link to a verified D05 Place
}

export interface BusinessProfile {
  id: string;
  ownerMemberId: string; // Exactly one Business profile per Business user
  businessName: string;
  category: 'Restaurant' | 'Café' | 'Hotel' | 'Retail' | 'Cultural Venue' | 'Tour Agency';
  description: string;
  certifiedBadge: boolean; // Automatically granted on eligible onboarding
  logoUrl?: string;
  coverUrl?: string;
  branches: BusinessBranch[];
  operatorMemberIds: string[]; // Delegated authority to staff
  createdAt: string;
}

const STORAGE_KEY = 'vq_business_profiles_v1';

const DEFAULT_BUSINESSES: BusinessProfile[] = [
  {
    id: 'biz_prof_el_alia_01',
    ownerMemberId: 'biz_cafe_el_alia',
    businessName: 'Café El Alia Historic Tea House',
    category: 'Café',
    description: 'Iconic panoramic cliffside establishment in Sidi Bou Said serving pine-nut tea since 1888.',
    certifiedBadge: true,
    logoUrl: 'https://images.unsplash.com/photo-1554118811-1e0d58224f24?auto=format&fit=crop&w=300&q=80',
    branches: [
      {
        id: 'branch_el_alia_main',
        name: 'Café El Alia - Village Summit',
        address: 'Rue Habib Thameur, Sidi Bou Said',
        city: 'Tunis',
        latitude: 36.8711,
        longitude: 10.3421,
        phone: '+216 71 740 000',
        isPrimary: true,
        canonicalPlaceId: 'place_sidi_bou_said_rooftop'
      }
    ],
    operatorMemberIds: ['biz_cafe_el_alia'],
    createdAt: new Date(Date.now() - 86400000 * 45).toISOString()
  }
];

class BusinessDomain {
  private businesses: BusinessProfile[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      this.businesses = raw ? JSON.parse(raw) : [...DEFAULT_BUSINESSES];
      if (!raw) this.save();
    } catch {
      this.businesses = [...DEFAULT_BUSINESSES];
    }
  }

  private save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.businesses));
    } catch {}
  }

  public getBusinessByOwner(ownerMemberId: string): BusinessProfile | null {
    return this.businesses.find(b => b.ownerMemberId === ownerMemberId) || null;
  }

  public getBusinessById(id: string): BusinessProfile | null {
    return this.businesses.find(b => b.id === id) || null;
  }

  /**
   * Onboard business: automatic certification badge, enforces 1 business profile per owner
   */
  public onboardBusiness(
    ownerMemberId: string,
    businessName: string,
    category: BusinessProfile['category'],
    description: string,
    primaryBranch: Omit<BusinessBranch, 'id' | 'isPrimary'>
  ): BusinessProfile {
    const existing = this.getBusinessByOwner(ownerMemberId);
    if (existing) {
      throw new Error('A Business profile is already registered for this user.');
    }

    const newBiz: BusinessProfile = {
      id: `biz_${Date.now()}`,
      ownerMemberId,
      businessName,
      category,
      description,
      certifiedBadge: true, // Automatic badge on onboarding
      branches: [
        {
          ...primaryBranch,
          id: `branch_${Date.now()}`,
          isPrimary: true
        }
      ],
      operatorMemberIds: [ownerMemberId],
      createdAt: new Date().toISOString()
    };

    this.businesses.push(newBiz);
    this.save();
    this.notify();
    return newBiz;
  }

  public addBranch(businessId: string, branch: Omit<BusinessBranch, 'id' | 'isPrimary'>): BusinessBranch {
    const biz = this.getBusinessById(businessId);
    if (!biz) throw new Error('Business not found');

    const newBranch: BusinessBranch = {
      ...branch,
      id: `branch_${Date.now()}`,
      isPrimary: false
    };

    biz.branches.push(newBranch);
    this.save();
    this.notify();
    return newBranch;
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

export const businessDomain = new BusinessDomain();
