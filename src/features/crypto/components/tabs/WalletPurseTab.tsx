import React, { useState } from 'react';
import { Send, ArrowDownLeft, ArrowUpRight, Copy, Check, CheckCircle2 } from 'lucide-react';
import { VQLedgerEntry, vqLedger } from '@/domains/d20_vq_ledger';
import { ModalWrapper } from '@/components/layout/ModalWrapper';

interface WalletPurseTabProps {
  vqBalance: number;
  ledgerEntries: VQLedgerEntry[];
  userHandle: string;
}

export const WalletPurseTab: React.FC<WalletPurseTabProps> = ({
  vqBalance,
  ledgerEntries,
  userHandle,
}) => {
  const [showSendModal, setShowSendModal] = useState(false);
  const [showReceiveModal, setShowReceiveModal] = useState(false);
  const [recipient, setRecipient] = useState('');
  const [sendAmount, setSendAmount] = useState('');
  const [txSuccess, setTxSuccess] = useState('');
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(userHandle);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    const amountVal = parseInt(sendAmount);
    if (isNaN(amountVal) || amountVal <= 0 || amountVal > vqBalance) return;

    const target = recipient.startsWith('@') ? recipient : `@${recipient}`;
    vqLedger.debit('current_user', amountVal, 'P2P_TRANSFER', `Direct transfer to ${target}`);
    setTxSuccess(`Sent ${amountVal} VQ to ${target}!`);
    setRecipient('');
    setSendAmount('');
    setTimeout(() => {
      setTxSuccess('');
      setShowSendModal(false);
    }, 1800);
  };

  return (
    <div className="space-y-6">
      {/* Vibe Purse Balance Card */}
      <div className="relative overflow-hidden rounded-3xl p-6 bg-gradient-to-br from-[#1C1826] via-[#15121D] to-[#0D0B12] border border-amber-500/30 shadow-2xl">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wider">
              Vibe Purse (D20 Balanced Ledger)
            </span>
          </div>
          <span className="text-[11px] font-mono text-zinc-400">{userHandle}</span>
        </div>

        <div className="space-y-1 mb-6">
          <span className="text-4xl sm:text-5xl font-black text-white font-mono tracking-tight">
            {vqBalance.toLocaleString()}
          </span>
          <span className="text-amber-400 font-mono font-bold ml-2 text-lg">VQ</span>
          <p className="text-xs text-zinc-400">Balanced double-entry reputation token</p>
        </div>

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => setShowSendModal(true)}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 shadow-lg cursor-pointer"
          >
            <Send className="w-3.5 h-3.5" /> Send VQ
          </button>
          <button
            type="button"
            onClick={() => setShowReceiveModal(true)}
            className="flex-1 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 border border-white/10 cursor-pointer"
          >
            <ArrowDownLeft className="w-3.5 h-3.5" /> Receive
          </button>
        </div>
      </div>

      {/* Ledger Journal */}
      <div className="space-y-3 text-left">
        <h4 className="text-xs font-mono font-bold text-zinc-400 uppercase tracking-wider">
          Double-Entry Journal History
        </h4>
        {ledgerEntries.length === 0 ? (
          <div className="p-8 text-center text-xs text-zinc-500 bg-zinc-950 rounded-2xl border border-white/5">
            No ledger transactions yet.
          </div>
        ) : (
          <div className="space-y-2">
            {ledgerEntries.slice(0, 10).map((entry) => {
              const isCredit = entry.direction === 'credit' || (entry as any).entryType === 'CREDIT';
              const categoryLabel = (entry.reasonCode || (entry as any).category || 'TRANSACTION').replace(/_/g, ' ');
              return (
                <div
                  key={entry.id}
                  className="p-3.5 bg-[#141219] rounded-2xl border border-white/5 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-xl flex items-center justify-center ${
                        isCredit
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-rose-500/20 text-rose-300'
                      }`}
                    >
                      {isCredit ? (
                        <ArrowDownLeft className="w-4 h-4" />
                      ) : (
                        <ArrowUpRight className="w-4 h-4" />
                      )}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-white capitalize">{categoryLabel}</h5>
                      <span className="text-[10px] text-zinc-500 font-mono">{entry.notes || 'Ledger event'}</span>
                    </div>
                  </div>
                  <span
                    className={`font-mono text-sm font-black ${
                      isCredit ? 'text-emerald-400' : 'text-rose-400'
                    }`}
                  >
                    {isCredit ? '+' : '-'}
                    {entry.amount} VQ
                  </span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Send Modal */}
      <ModalWrapper isOpen={showSendModal} onClose={() => setShowSendModal(false)} title="Send VQ Tokens">
        <form onSubmit={handleSend} className="space-y-4">
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400">Recipient Handle</label>
            <input
              type="text"
              required
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="@username"
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-mono text-zinc-400">Amount (VQ)</label>
            <input
              type="number"
              min={1}
              max={vqBalance}
              required
              value={sendAmount}
              onChange={(e) => setSendAmount(e.target.value)}
              className="w-full bg-zinc-900 border border-white/10 rounded-xl px-3 py-2 text-xs text-white font-mono font-bold"
            />
          </div>
          {txSuccess && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/30 rounded-xl text-emerald-300 text-xs font-mono flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> {txSuccess}
            </div>
          )}
          <button
            type="submit"
            className="w-full py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-black font-black text-xs uppercase tracking-wider cursor-pointer"
          >
            Confirm Transfer
          </button>
        </form>
      </ModalWrapper>

      {/* Receive Modal */}
      <ModalWrapper isOpen={showReceiveModal} onClose={() => setShowReceiveModal(false)} title="Receive VQ Tokens">
        <div className="space-y-4 text-center">
          <p className="text-xs text-zinc-400">Share your Vibe Handle to receive VQ directly into your purse:</p>
          <div className="p-4 bg-zinc-900 rounded-2xl border border-white/10 font-mono text-sm text-amber-300 font-bold flex items-center justify-between">
            <span>{userHandle}</span>
            <button
              type="button"
              onClick={handleCopy}
              className="px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white text-xs flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
        </div>
      </ModalWrapper>
    </div>
  );
};
