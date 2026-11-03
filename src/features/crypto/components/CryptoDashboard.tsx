import React, { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth';
import { vqLedger, VQLedgerEntry } from '@/domains/d20_vq_ledger';
import { handshakeDomain, HandshakeAgreement } from '@/domains/d22_handshake';
import { marketplaceDomain, MarketplaceListing } from '@/domains/d26_marketplace';
import { WalletPurseTab } from './tabs/WalletPurseTab';
import { MarketplaceP2PTab } from './tabs/MarketplaceP2PTab';
import { HandshakesTab } from './tabs/HandshakesTab';

export const CryptoDashboard: React.FC = () => {
  const { profile } = useAuth();
  const [activeTab, setActiveTab] = useState<'wallet' | 'p2p' | 'handshakes'>('wallet');

  // Domains state subscriptions
  const [vqBalance, setVqBalance] = useState<number>(() => vqLedger.getBalance('current_user'));
  const [ledgerEntries, setLedgerEntries] = useState<VQLedgerEntry[]>(() =>
    vqLedger.getEntries('current_user')
  );
  const [handshakes, setHandshakes] = useState<HandshakeAgreement[]>(() =>
    handshakeDomain.getAll()
  );
  const [listings, setListings] = useState<MarketplaceListing[]>(() =>
    marketplaceDomain.getListings()
  );

  useEffect(() => {
    const unsubLedger = vqLedger.subscribe((summary) => {
      setVqBalance(summary.currentBalance);
      setLedgerEntries(vqLedger.getEntries('current_user'));
    });

    const unsubHandshake = handshakeDomain.subscribe((hsList) => {
      setHandshakes([...hsList]);
    });

    const unsubMarketplace = marketplaceDomain.subscribe(() => {
      setListings(marketplaceDomain.getListings());
    });

    return () => {
      unsubLedger();
      unsubHandshake();
      unsubMarketplace();
    };
  }, []);

  const userHandle = profile?.handle ? `@${profile.handle}` : '@hannibal';

  return (
    <div className="flex-1 bg-[#09080C] text-white p-4 sm:p-6 max-w-4xl mx-auto space-y-6 pb-20 select-none font-sans">
      {/* Tab Switcher Header */}
      <div className="flex items-center justify-between border-b border-white/10 pb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight text-white">Vibe Purse & P2P</h2>
          <p className="text-xs text-zinc-400">Reputation ledger, peer marketplace, and handshakes</p>
        </div>

        <div className="flex gap-1 bg-zinc-950 p-1 rounded-2xl border border-white/5">
          <button
            type="button"
            onClick={() => setActiveTab('wallet')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'wallet'
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Purse
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('p2p')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'p2p'
                ? 'bg-purple-600/20 text-purple-200 border border-purple-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Marketplace
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('handshakes')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'handshakes'
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Handshakes
          </button>
        </div>
      </div>

      {/* Active Tab View */}
      {activeTab === 'wallet' && (
        <WalletPurseTab
          vqBalance={vqBalance}
          ledgerEntries={ledgerEntries}
          userHandle={userHandle}
        />
      )}

      {activeTab === 'p2p' && <MarketplaceP2PTab listings={listings} />}

      {activeTab === 'handshakes' && <HandshakesTab handshakes={handshakes} />}
    </div>
  );
};
export default CryptoDashboard;
