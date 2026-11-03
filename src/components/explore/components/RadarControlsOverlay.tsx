import React from 'react';
import { Compass, ZoomIn, ZoomOut, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface RadarControlsOverlayProps {
  contourIntensity: number;
  isLoading: boolean;
  onZoom: (dir: 'in' | 'out') => void;
  onRefresh: () => void;
}

export const RadarControlsOverlay: React.FC<RadarControlsOverlayProps> = ({
  contourIntensity,
  isLoading,
  onZoom,
  onRefresh,
}) => {
  return (
    <>
      {/* Reticle HUD Target Compass */}
      <div className="absolute inset-x-0 bottom-4 z-20 flex justify-center pointer-events-none select-none">
        <div className="bg-[#1C1C1E]/90 border border-zinc-800 backdrop-blur-md rounded-full px-4 py-1.5 text-[10px] font-mono text-zinc-400 flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-[#3DDC6C] animate-spin" style={{ animationDuration: '8s' }} />
          <span>GRID: CONTOUR INTENSITY {Math.round(contourIntensity * 100)}%</span>
        </div>
      </div>

      {/* Radar Controller Stack */}
      <div className="absolute right-4 top-4 z-20 flex flex-col gap-2 pointer-events-auto">
        <button
          type="button"
          onClick={() => onZoom('in')}
          className="w-10 h-10 bg-[#1C1C1E]/95 border border-zinc-800 rounded-xl hover:bg-[#2C2C2E] hover:text-white text-zinc-400 transition-all flex items-center justify-center cursor-pointer outline-none active:scale-95"
          title="Zoom In"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        
        <button
          type="button"
          onClick={() => onZoom('out')}
          className="w-10 h-10 bg-[#1C1C1E]/95 border border-zinc-800 rounded-xl hover:bg-[#2C2C2E] hover:text-white text-zinc-400 transition-all flex items-center justify-center cursor-pointer outline-none active:scale-95"
          title="Zoom Out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>

        <button
          type="button"
          disabled={isLoading}
          onClick={onRefresh}
          className={cn(
            "w-10 h-10 bg-[#1C1C1E]/95 border border-zinc-800 rounded-xl hover:bg-[#2C2C2E] text-zinc-400 transition-all flex items-center justify-center cursor-pointer outline-none active:scale-95",
            isLoading && "text-amber-500 animate-spin"
          )}
          title="Calibrate grid"
        >
          <RefreshCw className={cn("w-4 h-4", isLoading && "animate-spin")} />
        </button>
      </div>
    </>
  );
};
