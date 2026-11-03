/**
 * Repository: Admin Repository
 * Gathers operational metrics and audit telemetry across canonical domains.
 */

import { profileRepository } from './profileRepository';
import { vqLedger } from '@/domains/d20_vq_ledger';
import { handshakeDomain } from '@/domains/d22_handshake';
import { placesDomain } from '@/domains/d05_places';

export interface AdminMetrics {
  usersQty: number;
  commQty: number;
  listingsQty: number;
  messagesQty: number;
  profilesList: any[];
  listingsList: any[];
}

export const adminRepository = {
  async fetchAdminMetrics(): Promise<AdminMetrics> {
    const profiles = await profileRepository.listAll();
    const places = placesDomain.getAllPlaces();
    const handshakes = handshakeDomain.getAll();
    const ledger = vqLedger.getEntries('current_user');

    return {
      usersQty: profiles.length + 1,
      commQty: 4,
      listingsQty: places.length,
      messagesQty: ledger.length + handshakes.length,
      profilesList: profiles,
      listingsList: places.map((p) => ({
        id: p.id,
        title: p.name,
        price: '50 VQ',
        category: p.category,
      })),
    };
  },
};
