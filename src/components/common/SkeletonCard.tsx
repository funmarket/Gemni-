import React from 'react';

export const SkeletonCard: React.FC = () => {
  return (
    <div className="relative overflow-hidden w-full h-[88px] bg-[#1C1C1E] rounded-[14px]">
      {/* Self-contained shimmer animation definitions */}
      <style>{`
        @keyframes shimmerInfinite {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
      `}</style>

      {/* Shimmer overlay gradient */}
      <div 
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"
        style={{
          animation: 'shimmerInfinite 1.5s infinite',
        }}
      />

      {/* Skeleton placeholders */}
      <div className="absolute inset-4 flex items-center gap-3">
        <div className="w-11 h-11 bg-[#2C2C2E] rounded-full shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#2C2C2E] rounded w-1/3" />
          <div className="h-3 bg-[#2C2C2E] rounded w-2/3" />
        </div>
      </div>
    </div>
  );
};
