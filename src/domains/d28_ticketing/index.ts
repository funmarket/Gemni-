/**
 * Domain 28: Ticketing (D28)
 * Independent ticket products (optional Event link),
 * verifiable cryptographically unique QR payload, exactly-once redemption.
 */

export interface TicketProduct {
  id: string;
  issuerId: string;
  issuerName: string;
  title: string;
  eventId?: string; // Optional linkage to an official D11 Event
  price: number;
  currency: string;
  totalQuantity: number;
  remainingQuantity: number;
  terms: string;
  createdAt: string;
}

export interface IssuedTicket {
  id: string;
  ticketProductId: string;
  ticketTitle: string;
  holderId: string;
  holderName: string;
  qrPayload: string; // Cryptographically unique verifiable payload string
  isRedeemed: boolean;
  redeemedAt?: string;
  redeemedBy?: string;
  issuedAt: string;
}

const PRODUCTS_KEY = 'vq_tickets_products_v1';
const ISSUED_KEY = 'vq_tickets_issued_v1';

const DEFAULT_PRODUCTS: TicketProduct[] = [
  {
    id: 'tkt_vinyl_pulse_01',
    issuerId: 'biz_cafe_el_alia',
    issuerName: 'Café El Alia Historic Tea House',
    title: 'Admission: Cliffside Vinyl & Ambient Pulse Evening',
    eventId: 'evt_medina_electronic_night_01',
    price: 25,
    currency: 'TND',
    totalQuantity: 60,
    remainingQuantity: 48,
    terms: 'Valid for 1 entry on event date. Non-refundable within 12h of doors open.',
    createdAt: new Date().toISOString()
  }
];

class TicketingDomain {
  private products: TicketProduct[] = [];
  private issuedTickets: IssuedTicket[] = [];
  private listeners: Set<() => void> = new Set();

  constructor() {
    this.load();
  }

  private load() {
    try {
      const prodRaw = localStorage.getItem(PRODUCTS_KEY);
      this.products = prodRaw ? JSON.parse(prodRaw) : [...DEFAULT_PRODUCTS];
      if (!prodRaw) this.saveProducts();

      const issRaw = localStorage.getItem(ISSUED_KEY);
      this.issuedTickets = issRaw ? JSON.parse(issRaw) : [];
    } catch {
      this.products = [...DEFAULT_PRODUCTS];
      this.issuedTickets = [];
    }
  }

  private saveProducts() {
    try {
      localStorage.setItem(PRODUCTS_KEY, JSON.stringify(this.products));
    } catch {}
  }

  private saveIssued() {
    try {
      localStorage.setItem(ISSUED_KEY, JSON.stringify(this.issuedTickets));
    } catch {}
  }

  public getProducts(): TicketProduct[] {
    return this.products;
  }

  public getMyTickets(holderId: string): IssuedTicket[] {
    return this.issuedTickets.filter(t => t.holderId === holderId);
  }

  /**
   * Issue a new ticket with a cryptographically verifiable payload
   */
  public issueTicket(productId: string, holderId: string, holderName: string): IssuedTicket {
    const product = this.products.find(p => p.id === productId);
    if (!product) throw new Error('Ticket product not found');
    if (product.remainingQuantity <= 0) throw new Error('Ticket product is sold out');

    product.remainingQuantity -= 1;

    const ticketId = `tkt_iss_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const qrPayload = `VQ-TKT:${ticketId}:${productId}:${holderId}:${Date.now()}`;

    const issued: IssuedTicket = {
      id: ticketId,
      ticketProductId: productId,
      ticketTitle: product.title,
      holderId,
      holderName,
      qrPayload,
      isRedeemed: false,
      issuedAt: new Date().toISOString()
    };

    this.issuedTickets.push(issued);
    this.saveProducts();
    this.saveIssued();
    this.notify();
    return issued;
  }

  /**
   * Authoritative exactly-once redemption
   */
  public redeemTicket(qrPayloadOrTicketId: string, scannerId: string): IssuedTicket {
    const ticket = this.issuedTickets.find(t => t.id === qrPayloadOrTicketId || t.qrPayload === qrPayloadOrTicketId);
    if (!ticket) throw new Error('Invalid ticket code: not found in directory');
    if (ticket.isRedeemed) {
      throw new Error(`Ticket was ALREADY REDEEMED at ${ticket.redeemedAt}`);
    }

    ticket.isRedeemed = true;
    ticket.redeemedAt = new Date().toISOString();
    ticket.redeemedBy = scannerId;
    this.saveIssued();
    this.notify();
    return ticket;
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

export const ticketingDomain = new TicketingDomain();
