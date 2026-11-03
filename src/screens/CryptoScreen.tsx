import React from 'react';
import { Bitcoin } from 'lucide-react';
import { CryptoDashboard } from '@/features/crypto';

export const CryptoScreen: React.FC = () => {
  return (
    <div className="p-4 space-y-6 animate-in fade-in duration-300 max-w-lg mx-auto select-none text-left">
      {/* Header */}
      <div className="text-center space-y-1 py-2">
        <h1 className="text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-500 uppercase italic tracking-wider flex items-center justify-center gap-2">
          <Bitcoin className="w-8 h-8 text-orange-400 shrink-0" />
          Purse
        </h1>
        <p className="text-[10px] text-yellow-500 font-bold uppercase tracking-widest">My Assets & Local P2P Trading</p>
      </div>

      <CryptoDashboard />
    </div>
  );
};

export default CryptoScreen;
