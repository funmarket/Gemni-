export interface Offer {
  id: string;
  offerType: 'buy' | 'sell';
  cryptoType: string;
  amount: string;
  price: string;
  currency: string;
  paymentMethod: string;
  location: string;
  userId: string;
  trustRating?: string;
  status?: 'active' | 'completed';
}

export interface Message {
  sender: 'me' | 'partner';
  text: string;
  timestamp: string;
}

export interface SolanaAudit {
  id: string;
  ledger_id: string;
  solana_signature: string;
  block_height: number;
  verification_status: 'VERIFIED' | 'FAILED' | 'PENDING';
  audited_at: string;
}

export interface Transaction {
  id: string;
  type: string;
  amount: string;
  sender: string;
  date: string;
}
