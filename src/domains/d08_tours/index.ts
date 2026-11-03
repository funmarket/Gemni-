/**
 * Domain 08: Tours & Reservations (D08)
 * Commercial guided Tour offers, availability slots, reservations,
 * acceptance/decline, and capacity reservation.
 */

import { handshakeDomain } from '../d22_handshake';
import { notificationsDomain } from '../d23_notifications';

export interface TourSlot {
  id: string;
  date: string; // YYYY-MM-DD
  startTime: string; // HH:mm
  endTime: string;
  maxPartySize: number;
  bookedPartyCount: number;
}

export interface CommercialTour {
  id: string;
  guardianId: string;
  guardianName: string;
  title: string;
  description: string;
  city: string;
  durationHours: number;
  pricePerPerson: number;
  currency: string;
  inclusions: string[];
  languages: string[];
  meetingPoint: string;
  linkedTrailId?: string;
  slots: TourSlot[];
  sellerPolicy: {
    cancellationNoticeHours: number;
    refundTerms: string;
  };
  createdAt: string;
}

export interface TourReservation {
  id: string;
  tourId: string;
  tourTitle: string;
  guardianId: string;
  clientId: string;
  clientName: string;
  clientHandle: string;
  date: string;
  partySize: number;
  totalPrice: number;
  currency: string;
  status: 'PENDING' | 'ACCEPTED' | 'DECLINED' | 'CANCELLED';
  handshakeId?: string;
  createdAt: string;
}

const TOURS_KEY = 'vq_tours_catalog_v1';
const RESERVATIONS_KEY = 'vq_tours_reservations_v1';

const DEFAULT_TOURS: CommercialTour[] = [
  {
    id: 'tour_medina_architectural_01',
    guardianId: 'guardian_yassine_01',
    guardianName: 'Yassine B.',
    title: 'Medina Palaces & Private Courtyards Masterclass',
    description: 'An exclusive guided tour into historical 17th-century private residences and rooftop lookout towers closed to general tourists.',
    city: 'Tunis',
    durationHours: 3,
    pricePerPerson: 75,
    currency: 'TND',
    inclusions: ['Access to 2 private palaces', 'Rooftop artisanal tea', 'Architectural guidebook'],
    languages: ['Arabic', 'French', 'English'],
    meetingPoint: 'Bab El Bhar Gateway arch',
    linkedTrailId: 'trail_tunis_medina_01',
    slots: [
      { id: 'slot_1', date: '2026-11-02', startTime: '10:00', endTime: '13:00', maxPartySize: 6, bookedPartyCount: 2 },
      { id: 'slot_2', date: '2026-11-03', startTime: '15:00', endTime: '18:00', maxPartySize: 6, bookedPartyCount: 0 }
    ],
    sellerPolicy: {
      cancellationNoticeHours: 24,
      refundTerms: 'Full direct refund with 24h cancellation notice.'
    },
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString()
  }
];

class ToursDomain {
  private tours: CommercialTour[] = [];
  private reservations: TourReservation[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const toursRaw = localStorage.getItem(TOURS_KEY);
      this.tours = toursRaw ? JSON.parse(toursRaw) : [...DEFAULT_TOURS];
      if (!toursRaw) this.saveTours();

      const resRaw = localStorage.getItem(RESERVATIONS_KEY);
      this.reservations = resRaw ? JSON.parse(resRaw) : [];
    } catch {
      this.tours = [...DEFAULT_TOURS];
      this.reservations = [];
    }
  }

  private saveTours() {
    try {
      localStorage.setItem(TOURS_KEY, JSON.stringify(this.tours));
    } catch {}
  }

  private saveReservations() {
    try {
      localStorage.setItem(RESERVATIONS_KEY, JSON.stringify(this.reservations));
    } catch {}
  }

  public getTours(): CommercialTour[] {
    return this.tours;
  }

  public getTourById(id: string): CommercialTour | null {
    return this.tours.find(t => t.id === id) || null;
  }

  public requestReservation(
    tourId: string,
    clientId: string,
    clientName: string,
    clientHandle: string,
    date: string,
    partySize: number
  ): TourReservation {
    const tour = this.getTourById(tourId);
    if (!tour) throw new Error('Tour not found');

    const reservation: TourReservation = {
      id: `res_${Date.now()}`,
      tourId,
      tourTitle: tour.title,
      guardianId: tour.guardianId,
      clientId,
      clientName,
      clientHandle,
      date,
      partySize,
      totalPrice: tour.pricePerPerson * partySize,
      currency: tour.currency,
      status: 'PENDING',
      createdAt: new Date().toISOString()
    };

    this.reservations.push(reservation);
    this.saveReservations();

    notificationsDomain.notify({
      userId: tour.guardianId,
      title: 'New Tour Reservation Request',
      message: `${clientName} (@${clientHandle}) requested a reservation for "${tour.title}" on ${date}.`,
      type: 'TOUR_BOOKING'
    });

    this.notify();
    return reservation;
  }

  /**
   * Guardian accepts reservation -> creates D22 Handshake (+75 VQ to each)
   */
  public acceptReservation(reservationId: string): TourReservation {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');
    if (res.status !== 'PENDING') throw new Error(`Cannot accept reservation in status: ${res.status}`);

    res.status = 'ACCEPTED';

    // Issue D22 Handshake
    const handshake = handshakeDomain.recordHandshake(
      res.clientId,
      res.clientHandle,
      res.clientName,
      res.guardianId,
      'guardian_pro',
      'Pro Guardian',
      'pro',
      `Guided Tour: ${res.tourTitle}`,
      `Tour confirmed for ${res.date} (${res.partySize} guests)`
    );

    res.handshakeId = handshake.id;
    this.saveReservations();

    notificationsDomain.notify({
      userId: res.clientId,
      title: 'Tour Reservation Accepted! 🤝',
      message: `Your reservation for "${res.tourTitle}" has been accepted. A Handshake was established! (+75 VQ)`,
      type: 'HANDSHAKE_ESTABLISHED'
    });

    this.notify();
    return res;
  }

  public declineReservation(reservationId: string): TourReservation {
    const res = this.reservations.find(r => r.id === reservationId);
    if (!res) throw new Error('Reservation not found');
    res.status = 'DECLINED';
    this.saveReservations();
    this.notify();
    return res;
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

export const toursDomain = new ToursDomain();
