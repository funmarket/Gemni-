import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { VibeGuardian } from '../types';

interface ExpiredGuardiansInspectorProps {
  expiredGuardians: VibeGuardian[];
  onRenewSelfie: (id: string) => void;
}

export const ExpiredGuardiansInspector: React.FC<ExpiredGuardiansInspectorProps> = ({
  expiredGuardians,
  onRenewSelfie,
}) => {
  if (expiredGuardians.length === 0) return null;

  return (
    <div className="bg-amber-950/20 border border-amber-500/25 rounded-2xl p-4 space-y-2.5 text-xs text-amber-200/90 leading-relaxed text-left">
      <div className="flex items-center justify-between">
        <span className="font-bold flex items-center gap-1.5 text-amber-300 font-mono text-[11px] uppercase">
          <AlertCircle className="w-4 h-4 text-amber-400" />
          <span>7-Day Selfie Expiration Engine</span>
        </span>
        <span className="text-[10px] font-mono text-zinc-400">Auto-hidden from directory</span>
      </div>
      <p className="text-[11px] text-zinc-300">
        To prevent catfishing and stale profiles, guardians whose live in-app selfies are older than 7
        days are hidden until they snap an updated front-camera verification.
      </p>

      <div className="space-y-2 pt-1">
        {expiredGuardians.map((g) => (
          <div
            key={g.id}
            className="flex items-center justify-between bg-black/40 p-2.5 rounded-xl border border-white/5"
          >
            <div className="flex items-center gap-2.5">
              <img src={g.selfieUrl} alt={g.name} className="w-8 h-8 rounded-full object-cover grayscale" />
              <div>
                <span className="text-white font-bold block">{g.name}</span>
                <span className="text-[10px] text-zinc-400 font-mono">
                  Captured: {new Date(g.selfieCapturedAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onRenewSelfie(g.id)}
              className="text-[10px] font-mono font-bold bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 px-2.5 py-1 rounded-lg flex items-center gap-1 cursor-pointer"
            >
              <RefreshCw className="w-3 h-3" /> Renew (7d)
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
