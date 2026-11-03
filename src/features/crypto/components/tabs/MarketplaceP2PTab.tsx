import React, { useState } from 'react';
import { Plus, Users, Shield, CheckCircle2 } from 'lucide-react';
import { MarketplaceListing, MarketplaceDeal, marketplaceDomain } from '@/domains/d26_marketplace';
import { ModalWrapper } from '@/components/layout/ModalWrapper';

interface MarketplaceP2PTabProps {
  listings: MarketplaceListing[];
}

export const MarketplaceP2PTab: React.FC<MarketplaceP2PTabProps> = ({ listings }) => {
  const [p2pFilter, setP2pFilter] = useState<'all' | 'buy' | 'sell'>('all');
  const [showNewOfferModal, setShowNewOfferModal] = useState(false);
  const [newOfferType, setNewOfferType] = useState<'SELL' | 'BUY'>('SELL');
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<MarketplaceListing['category']>('Gear & Tech');
  const [newAmount, setNewAmount] = useState('');
  const [newLocation, setNewLocation] = useState('');
  const [newSellerTerms, setNewSellerTerms] = useState('');

  // Active Deal
  const [activeDealListing, setActiveDealListing] = useState<MarketplaceListing | null>(null);
  const [proposedMeetingPlace, setProposedMeetingPlace] = useState('');
  const [dealSuccess, setDealSuccess] = useState(false);

  const filteredListings = listings.filter((item) => {
    if (p2pFilter === 'buy') return item.listingType === 'BUY';
    if (p2pFilter === 'sell') return item.listingType === 'SELL';
    return true;
  });

  const handleCreateListing = (e: React.FormEvent) => {
    e.preventDefault();
    const priceVal = parseFloat(newAmount);
    if (!newTitle.trim() || isNaN(priceVal)) return;

    marketplaceDomain.createListing({
      ownerId: 'current_user',
      ownerHandle: 'current_user',
      listingType: newOfferType,
      title: newTitle.trim(),
      description: newSellerTerms.trim() || 'Direct local swap/sale',
      category: newCategory,
      priceFiat: priceVal,
      currency: 'USD',
      preferredMeetingDistrict: newLocation.trim() || 'Central',
      sellerPolicyNote: newSellerTerms.trim() || 'Cash on meetup',
    });

    setNewTitle('');
    setNewAmount('');
    setNewLocation('');
    setNewSellerTerms('');
    setShowNewOfferModal(false);
  };

  const handleInitiateDeal = (listing: MarketplaceListing) => {
    setActiveDealListing(listing);
    setProposedMeetingPlace(listing.preferredMeetingDistrict);
  };

  const handleConfirmDeal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeDealListing) return;

    marketplaceDomain.proposeDeal(
      activeDealListing.id,
      'current_user',
      activeDealListing.priceFiat,
      proposedMeetingPlace || 'Agreed public cafe'
    );

    setDealSuccess(true);
    setTimeout(() => {
      setDealSuccess(false);
      setActiveDealListing(null);
    }, 2000);
  };

  return (
    <div className="space-y-4 text-left">
      {/* Policy Banner */}
      <div className="bg-amber-950/20 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-300 flex items-center justify-center font-bold text-base">
            🤝
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-amber-300 tracking-wider">
              MKT-002 Non-Custodial Marketplace (D26)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Direct peer deals. Zero platform fiat custody or commission. Mutual agreement establishes Handshake.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowNewOfferModal(true)}
          className="px-3.5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider flex items-center gap-1 cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" /> Post Listing
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2">
        {(['all', 'buy', 'sell'] as const).map((filter) => (
          <button
            key={filter}
            type="button"
            onClick={() => setP2pFilter(filter)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold uppercase transition-all cursor-pointer ${
              p2pFilter === filter
                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                : 'bg-zinc-900 text-zinc-400 border border-white/5'
            }`}
          >
            {filter}
          </button>
        ))}
      </div>

      {/* Listings Grid */}
      <div className="space-y-3">
        {filteredListings.map((listing) => (
          <div
            key={listing.id}
            className="p-4 bg-[#15131a] rounded-2xl border border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  className={`text-[9px] font-mono font-black uppercase px-2 py-0.5 rounded-full ${
                    listing.listingType === 'SELL'
                      ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20'
                      : 'bg-blue-500/10 text-blue-300 border border-blue-500/20'
                  }`}
                >
                  {listing.listingType}
                </span>
                <span className="text-xs text-zinc-400 font-mono">@{listing.ownerHandle}</span>
                <span className="text-[10px] text-zinc-500">• {listing.category}</span>
              </div>
              <h4 className="text-sm font-extrabold text-white">{listing.title}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{listing.description}</p>
              <div className="text-[10px] text-zinc-500 font-mono mt-1">
                📍 {listing.preferredMeetingDistrict}
              </div>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-center">
              <span className="text-base font-black text-amber-300 font-mono">
                ${listing.priceFiat} {listing.currency}
              </span>
              <button
                type="button"
                onClick={() => handleInitiateDeal(listing)}
                className="px-3.5 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-xs uppercase cursor-pointer"
              >
                Deal
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Deal Initiation Modal */}
      {activeDealListing && (
        <ModalWrapper
          isOpen={Boolean(activeDealListing)}
          onClose={() => setActiveDealListing(null)}
          title={`Propose Deal: ${activeDealListing.title}`}
        >
          <form onSubmit={handleConfirmDeal} className="space-y-4 text-left">
            <p className="text-xs text-zinc-300">
              Proposing a direct peer deal with <strong>@{activeDealListing.ownerHandle}</strong> for{' '}
              <strong>${activeDealListing.priceFiat}</strong>.
            </p>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Meeting Location</label>
              <input
                type="text"
                required
                value={proposedMeetingPlace}
                onChange={(e) => setProposedMeetingPlace(e.target.value)}
                placeholder="e.g. Cafe des Nattes"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
            {dealSuccess && (
              <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4" /> Deal proposal transmitted! Handshake established.
              </div>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
            >
              Confirm Deal Proposal
            </button>
          </form>
        </ModalWrapper>
      )}

      {/* New Listing Modal */}
      <ModalWrapper
        isOpen={showNewOfferModal}
        onClose={() => setShowNewOfferModal(false)}
        title="Create Marketplace Listing"
      >
        <form onSubmit={handleCreateListing} className="space-y-4 text-left">
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setNewOfferType('SELL')}
              className={`py-2 rounded-xl text-xs font-bold ${
                newOfferType === 'SELL' ? 'bg-emerald-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              For Sale
            </button>
            <button
              type="button"
              onClick={() => setNewOfferType('BUY')}
              className={`py-2 rounded-xl text-xs font-bold ${
                newOfferType === 'BUY' ? 'bg-blue-500 text-black' : 'bg-zinc-800 text-zinc-400'
              }`}
            >
              Wanted (Buy)
            </button>
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400">Title</label>
            <input
              type="text"
              required
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. Vintage Minolta 35mm Camera"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Price (USD)</label>
              <input
                type="number"
                min={1}
                required
                value={newAmount}
                onChange={(e) => setNewAmount(e.target.value)}
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[11px] font-mono text-zinc-400">Location District</label>
              <input
                type="text"
                required
                value={newLocation}
                onChange={(e) => setNewLocation(e.target.value)}
                placeholder="e.g. Medina / Marsa"
                className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white"
              />
            </div>
          </div>
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Publish Listing
          </button>
        </form>
      </ModalWrapper>
    </div>
  );
};
