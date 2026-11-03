import React from 'react';
import { Shield, Camera, AlertCircle } from 'lucide-react';

interface GuardiansHeroBannerProps {
  onOpenSelfieModal: () => void;
  expiredCount: number;
  showExpirationInspector: boolean;
  onToggleExpirationInspector: () => void;
}

export const GuardiansHeroBanner: React.FC<GuardiansHeroBannerProps> = ({
  onOpenSelfieModal,
  expiredCount,
  showExpirationInspector,
  onToggleExpirationInspector,
}) => {
  return (
    <div className="relative rounded-3xl overflow-hidden border border-purple-500/20 shadow-2xl bg-[#120F18]">
      <div className="h-44 sm:h-48 relative overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1526778548025-fa2f459cd5c1?auto=format&fit=crop&w=1200&q=80"
          alt="Local Guides & Travelers"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover brightness-[0.45] contrast-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#120F18] via-[#120F18]/60 to-transparent" />

        <div className="absolute top-4 right-4 flex items-center -space-x-2">
          {[
            'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80',
            'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80',
            'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80',
          ].map((img, i) => (
            <div
              key={i}
              className="w-8 h-8 rounded-full border-2 border-purple-500/50 overflow-hidden bg-black shadow-md"
            >
              <img src={img} alt="Guide" className="w-full h-full object-cover" />
            </div>
          ))}
          <span className="w-8 h-8 rounded-full bg-purple-900/80 border-2 border-purple-500/50 flex items-center justify-center text-[10px] font-mono text-purple-200 font-bold shadow-md">
            +12
          </span>
        </div>
      </div>

      <div className="p-5 -mt-16 relative z-10 space-y-3 text-left">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="bg-gradient-to-r from-purple-500/20 to-amber-500/20 border border-purple-500/30 text-purple-200 text-[10px] font-mono font-black uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
            <Shield className="w-3 h-3 text-purple-400" />
            Real Guides & Locals Directory (D07)
          </span>
          <span className="bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <Camera className="w-2.5 h-2.5 text-emerald-400" />
            7-Day Live Selfie Verified
          </span>
          <span className="bg-black border border-white/20 text-white text-[10px] font-mono font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
            <span>🤝</span>
            <span>Handshake Proof System</span>
          </span>
        </div>

        <div className="space-y-1">
          <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">Vibe Guardians</h3>
          <p className="text-xs text-zinc-300 font-normal leading-relaxed max-w-xl">
            Connect with verified tour guides and friendly locals. Pro Guardians show advance upfront rates;
            Local Legends offer free hangouts. Tap <strong>Hire</strong> or <strong>Vibe</strong> to establish official{' '}
            <strong>🤝 Handshake</strong> proof.
          </p>
        </div>

        <div className="pt-1 flex items-center gap-2.5 flex-wrap">
          <button
            type="button"
            onClick={onOpenSelfieModal}
            className="bg-purple-600 hover:bg-purple-500 text-white font-mono font-black text-xs uppercase tracking-wider px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all shadow-lg cursor-pointer"
          >
            <Camera className="w-3.5 h-3.5" />
            <span>Become a Guardian / In-App Selfie</span>
          </button>

          {expiredCount > 0 && (
            <button
              type="button"
              onClick={onToggleExpirationInspector}
              className="bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-zinc-200 border border-white/10 font-mono text-[11px] px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <AlertCircle className="w-3 h-3 text-amber-400" />
              <span>{expiredCount} Hidden (Selfie &gt; 7d)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
