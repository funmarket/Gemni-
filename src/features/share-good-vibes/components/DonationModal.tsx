import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Wallet, X, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { donationService } from '../services/donationService';

interface DonateModalProps {
  onClose: () => void;
  updatePoints: (pts: number) => Promise<void>;
  triggerHaptic: (type: 'light' | 'medium' | 'heavy') => void;
}

export const DonationModal: React.FC<DonateModalProps> = ({ onClose, updatePoints, triggerHaptic }) => {
  const [donateAmount, setDonateAmount] = useState('0.1');
  const [donateCurrency, setDonateCurrency] = useState<'SOL' | 'USDC'>('SOL');
  const [state, setState] = useState<'form' | 'transacting' | 'completed'>('form');

  const predefinedAmounts = {
    SOL: ['0.05', '0.1', '0.5', '1.0'],
    USDC: ['5', '10', '25', '100']
  };

  const handleExecuteDonation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (parseFloat(donateAmount) <= 0 || isNaN(parseFloat(donateAmount))) {
      alert("Please specify a valid amount.");
      return;
    }

    triggerHaptic('heavy');
    setState('transacting');

    try {
      await donationService.executeDonation(parseFloat(donateAmount), donateCurrency);

      setTimeout(async () => {
        await updatePoints(50);
        setState('completed');
        triggerHaptic('heavy');
      }, 1400);
    } catch (e) {
      alert("Could not process coin backing.");
      setState('form');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-[#032012]/95 border border-emerald-500/30 backdrop-blur-xl rounded-2xl p-6 w-full max-w-sm text-left space-y-4 shadow-xl"
      >
        <div className="flex justify-between items-center pb-1">
          <h3 className="font-montserrat font-bold text-[15px] text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
            <Wallet className="w-5 h-5 text-emerald-400" /> Support the Pulse
          </h3>
          <button 
            type="button"
            onClick={() => {
              triggerHaptic('light');
              onClose();
            }}
            className="p-1 text-emerald-500/60 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {state === 'form' && (
          <form onSubmit={handleExecuteDonation} className="space-y-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Select Currency Token</label>
              <div className="grid grid-cols-2 gap-2 bg-[#02180e] p-1 rounded-xl border border-emerald-900/60">
                {(['SOL', 'USDC'] as const).map((curr) => (
                  <button
                    key={curr}
                    type="button"
                    onClick={() => {
                      triggerHaptic('light');
                      setDonateCurrency(curr);
                      setDonateAmount(curr === 'SOL' ? '0.1' : '10');
                    }}
                    className={cn(
                      "py-2 rounded-lg text-xs font-bold uppercase text-center transition-all cursor-pointer",
                      donateCurrency === curr
                        ? "bg-[#043319] text-white border border-emerald-500/30 shadow-sm"
                        : "text-zinc-500 hover:text-zinc-300"
                    )}
                  >
                    {curr === 'SOL' ? 'Solana (SOL)' : 'USDC Shard'}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold uppercase tracking-wider text-emerald-400/80">Support Amount</label>
              <div className="relative">
                <input 
                  type="number" 
                  step="any"
                  required
                  value={donateAmount}
                  onChange={(e) => setDonateAmount(e.target.value)}
                  className="w-full bg-[#02180f] border border-[#04331a] rounded-xl py-3 px-4 pr-16 text-center text-xl font-bold font-mono text-white focus:outline-none focus:border-emerald-500/50"
                />
                <span className="absolute right-4 top-3 text-xs font-bold text-emerald-400 font-mono">
                  {donateCurrency}
                </span>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {predefinedAmounts[donateCurrency].map((val) => (
                <button
                  key={val}
                  type="button"
                  onClick={() => {
                    triggerHaptic('light');
                    setDonateAmount(val);
                  }}
                  className={cn(
                    "py-1.5 rounded-lg text-xs font-bold font-mono border transition-all cursor-pointer",
                    donateAmount === val
                      ? "bg-emerald-500/10 border-emerald-400 text-emerald-300"
                      : "bg-[#02180f]/60 border-zinc-900 text-[#029541] hover:border-emerald-900"
                  )}
                >
                  {val}
                </button>
              ))}
            </div>

            <div className="p-3.5 bg-[#02180f] rounded-xl border border-emerald-900/30 text-[11px] leading-relaxed text-zinc-300">
              Cooperative ledger micro-tips keep active discovery node servers live and un-compromised. You will earn <strong>+50 VQ points</strong>.
            </div>

            <button 
              type="submit"
              className="bg-gradient-to-r from-emerald-500 to-teal-500 text-white font-montserrat font-extrabold text-[11px] h-12 uppercase tracking-widest rounded-xl w-full hover:brightness-110 active:scale-95 transition-all outline-none border-0 cursor-pointer"
            >
              Confirm Node Backing
            </button>
          </form>
        )}

        {state === 'transacting' && (
          <div className="py-12 text-center space-y-4">
            <div className="w-10 h-10 rounded-full border-2 border-emerald-400 border-t-transparent animate-spin mx-auto" />
            <div className="space-y-1">
              <h4 className="font-montserrat text-sm font-bold text-zinc-200">Writing ledger coordinates...</h4>
              <p className="text-[9px] text-emerald-450/80 font-mono uppercase tracking-widest animate-pulse">Relaying tokens with Solana</p>
            </div>
          </div>
        )}

        {state === 'completed' && (
          <div className="py-8 text-center space-y-4">
            <div className="w-12 h-12 bg-emerald-500/15 rounded-full flex items-center justify-center text-emerald-400 mx-auto border border-emerald-500/20">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="space-y-1.5 px-1">
              <h4 className="font-montserrat text-[16px] font-extrabold text-emerald-450">Vibe Circle Supported!</h4>
              <p className="text-xs text-zinc-350 leading-relaxed">
                Thank you for supporting our collective community. Gained <strong>+50 VQ points</strong> on your local passport.
              </p>
            </div>
            <button 
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-[#022c15] hover:bg-emerald-900 text-white text-[10px] font-bold uppercase tracking-wider rounded-lg transition-all border border-emerald-500/20 cursor-pointer"
            >
              Close
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
};
