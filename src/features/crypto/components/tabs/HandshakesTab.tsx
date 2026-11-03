import React from 'react';
import { Handshake, Award, CheckCircle2 } from 'lucide-react';
import { HandshakeAgreement } from '@/domains/d22_handshake';

interface HandshakesTabProps {
  handshakes: HandshakeAgreement[];
}

export const HandshakesTab: React.FC<HandshakesTabProps> = ({ handshakes }) => {
  return (
    <div className="space-y-4 text-left">
      <div className="bg-purple-950/20 border border-purple-500/20 rounded-2xl p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center font-bold text-base">
            🤝
          </div>
          <div>
            <h4 className="text-xs font-black uppercase text-purple-300 tracking-wider">
              Handshake Agreements (D22 Protocol)
            </h4>
            <p className="text-[11px] text-zinc-400">
              Formed upon mutual in-app agreement (Accept Tour/Hire, Confirm Deal). Awards +75 VQ and unlocks authentic reviews.
            </p>
          </div>
        </div>
        <span className="text-xs font-mono font-bold text-purple-300 bg-purple-500/10 px-2.5 py-1 rounded-full border border-purple-500/20">
          {handshakes.length} Agreements
        </span>
      </div>

      {handshakes.length === 0 ? (
        <div className="py-16 text-center border-2 border-dashed border-zinc-800 rounded-3xl space-y-2">
          <p className="text-xs text-zinc-400 font-bold uppercase tracking-wider">No Handshakes Yet</p>
          <p className="text-[11px] text-zinc-500">
            Book a Guardian, accept a Tour, or confirm a P2P listing deal to establish Handshakes.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {handshakes.map((hs) => (
            <div
              key={hs.id}
              className="p-4 bg-[#141219] rounded-2xl border border-white/10 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl p-2 bg-zinc-900 rounded-xl border border-white/5">
                  🤝
                </span>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-extrabold text-white">
                      {hs.providerHandle} & {hs.clientHandle}
                    </span>
                    <span className="text-[9px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold">
                      {hs.status}
                    </span>
                  </div>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Context: {hs.contextType} • Established {new Date(hs.establishedAt).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono font-bold">
                <CheckCircle2 className="w-4 h-4" />
                <span>+75 VQ Granted</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
