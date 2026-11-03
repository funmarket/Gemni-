import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Compass, MapPin, ZoomIn, ZoomOut, RefreshCw, Flame, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { VenueTooltipPortal } from './components/VenueTooltipPortal';
import { RadarControlsOverlay } from './components/RadarControlsOverlay';

interface HeatmapVenue {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
  category: string;
  rating: number;
  visitors: number;
  pts: number;
  rarity: 'LEGENDARY' | 'RARE' | 'COMMON';
  emoji: string;
}

const getActivitySnippet = (venue: HeatmapVenue) => {
  const visitors = venue.visitors || 0;
  const rating = venue.rating || 0;
  const cat = (venue.category || '').toLowerCase();
  
  if (visitors >= 120) {
    return `🔥 Critical vibe flow! Severe localized surge detected with over ${visitors} active agents currently in the zone.`;
  }
  if (visitors >= 80) {
    return `⚡ High kinetic stream. ${visitors} gatherers have checked in. Amplified social resonance!`;
  }
  if (rating >= 4.7) {
    return `✨ Legendary spot. Exceptionally warm score of ${rating}★ loved by our friendly community.`;
  }
  if (cat.includes('cafe') || cat.includes('coffee') || cat.includes('study')) {
    return `☕ Cozy community workspace. Relaxing café vibe with ${visitors} friends reading, chatting & writing.`;
  }
  if (cat.includes('bar') || cat.includes('club') || cat.includes('night') || cat.includes('music')) {
    return `🎵 Lively evening rhythm. Wonderful acoustic setting joined by ${visitors} neighborhood music lovers.`;
  }
  if (cat.includes('restaurant') || cat.includes('food') || cat.includes('eat')) {
    return `🍽️ Warm local eatery. Welcoming flavors with ${visitors} diners enjoying fresh bites.`;
  }
  if (venue.rarity === 'LEGENDARY') {
    return `🏆 Highly recommended spot! Outstanding place loved by local community explorers.`;
  }
  return `📍 Nice community spot. Around ${visitors} helpful people hang out here.`;
};

export interface FlashEvent {
  id: string;
  title: string;
  description: string;
  targetLat: number;
  targetLng: number;
  timeLeft: number;
  initialTime: number;
  reward: number;
  claimed: boolean;
}

interface ExploreHeatmapProps {
  venues: HeatmapVenue[];
  userCoords: { lat: number; lng: number } | null;
  selectedVenue: HeatmapVenue | null;
  onSelectVenue: (venue: HeatmapVenue) => void;
  isLoading: boolean;
  onRefresh: () => void;
  flashEvents?: FlashEvent[];
  onSelectFlashEvent?: (event: FlashEvent) => void;
  selectedFlashEvent?: FlashEvent | null;
}

export const ExploreHeatmap: React.FC<ExploreHeatmapProps> = ({
  venues,
  userCoords,
  selectedVenue,
  onSelectVenue,
  isLoading,
  onRefresh,
  flashEvents = [],
  onSelectFlashEvent,
  selectedFlashEvent = null,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1.2); // zoom scale factor
  const [hoveredNode, setHoveredNode] = useState<HeatmapVenue | null>(null);
  const [activeTab, setActiveTab] = useState<'heatmap' | 'radar'>('heatmap');
  const [contourIntensity, setContourIntensity] = useState<number>(0.8);
  const [sweepAngle, setSweepAngle] = useState(0);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Animate the radar sweep line
  useEffect(() => {
    let animFrame: number;
    const animateSweep = () => {
      setSweepAngle((prev) => (prev + 1.5) % 360);
      animFrame = requestAnimationFrame(animateSweep);
    };
    animateSweep();
    return () => cancelAnimationFrame(animFrame);
  }, []);

  // Compute thermal intensity level based on venue properties (visitors + rating)
  const getThermalLevel = (venue: HeatmapVenue) => {
    // Score based on rating (max 5) and visitors (max ~150)
    const ratingWeight = (venue.rating - 3) * 20; // up to 40 max
    const visitorWeight = Math.min(60, (venue.visitors / 100) * 60); // up to 60 max
    const totalScore = Math.max(10, Math.min(100, Math.round(ratingWeight + visitorWeight)));

    if (totalScore >= 85) return { name: 'CRITICAL EVENT', color: '#FF375F', glow: 'rgba(255, 55, 95, 0.75)', value: totalScore, bgCls: 'bg-[#FF375F]' };
    if (totalScore >= 65) return { name: 'ACTIVE SHIELD', color: '#BF5AF2', glow: 'rgba(191, 90, 242, 0.75)', value: totalScore, bgCls: 'bg-[#BF5AF2]' };
    if (totalScore >= 45) return { name: 'STEADY WAVE', color: '#FF9F0A', glow: 'rgba(255, 159, 10, 0.75)', value: totalScore, bgCls: 'bg-[#FF9F0A]' };
    return { name: 'AMBIENT NODE', color: '#3DDC6C', glow: 'rgba(61, 220, 108, 0.7) ', value: totalScore, bgCls: 'bg-[#3DDC6C]' };
  };

  // Pre-calculate positions to prevent recalculation inside draw loops
  const getRelativePosition = (
    venueLat: number,
    venueLon: number,
    uCoords: { lat: number; lng: number } | null,
    width: number,
    height: number,
    zoom: number
  ) => {
    if (!uCoords) return { x: width / 2, y: height / 2, dx: 0, dy: 0, inBounds: true };

    const centerX = width / 2;
    const centerY = height / 2;

    // Approximate meters per degree coordinates for drawing projection
    // Latitude: 1 degree ≈ 111,000 meters
    // Longitude: 1 degree ≈ 111,000 meters * cos(lat)
    const latDiff = venueLat - uCoords.lat;
    const lonDiff = venueLon - uCoords.lng;
    const cosLat = Math.cos((uCoords.lat * Math.PI) / 180);

    // Apply scaling factor based on zoom state to scale visual grid bounds
    // At zoom = 1.0, 0.01 degree offset maps to about 120 pixels
    const scale = 25000 * zoom; 

    const dx = lonDiff * cosLat * scale;
    const dy = -latDiff * scale; // invert y for screen coordinates

    // Final coordinates projected on canvas bounds
    const x = centerX + dx;
    const y = centerY + dy;

    // Is the coordinate outside the circular radar boundary
    const radius = Math.max(0, Math.min(width, height) / 2 - 12);
    const distFromCenter = Math.sqrt(dx * dx + dy * dy);
    const inBounds = distFromCenter <= radius;

    return { x, y, dx, dy, inBounds, distFromCenter };
  };

  // Draw Heatmap / Radar overlay on Canvas 
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas dimensions with high-DPI scaling support
    const rect = canvas.getBoundingClientRect();
    const width = rect.width;
    const height = rect.height;
    canvas.width = width * 2;
    canvas.height = height * 2;
    ctx.scale(2, 2);

    const radius = Math.max(0, Math.min(width, height) / 2 - 12);
    if (radius <= 0) return;
    const centerX = width / 2;
    const centerY = height / 2;

    // Clear Canvas with rich pitch-black theme layer
    ctx.fillStyle = '#000000';
    ctx.fillRect(0, 0, width, height);

    // 1. Draw Simulated Sci-Fi Tactical Street grids (underlay)
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.03)';
    ctx.lineWidth = 1;
    // Draw vector street lines simulating a neat minimalist matrix grid
    for (let i = 0; i < width; i += 40) {
      ctx.beginPath();
      ctx.moveTo(i, 0);
      ctx.lineTo(i, height);
      ctx.stroke();
    }
    for (let j = 0; j < height; j += 40) {
      ctx.beginPath();
      ctx.moveTo(0, j);
      ctx.lineTo(width, j);
      ctx.stroke();
    }

    // Draw some stylized angle lines for geospatial projection
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.beginPath();
    ctx.ellipse(centerX, centerY, radius, radius, 0, 0, Math.PI * 2);
    ctx.stroke();

    // 2. Draw Concentric Range Rings (Radar distance rings)
    [0.3, 0.6, 0.9].forEach((ringMultiplier) => {
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, radius * ringMultiplier, radius * ringMultiplier, 0, 0, Math.PI * 2);
      ctx.stroke();

      // Mini text labels denoting distance calculations
      ctx.fillStyle = 'rgba(142, 142, 147, 0.4)';
      ctx.font = '9px "JetBrains Mono", Courier, monospace';
      ctx.fillText(
        `${(ringMultiplier * (2.0 / zoomLevel)).toFixed(1)}km`, 
        centerX + radius * ringMultiplier + 3, 
        centerY - 2
      );
    });

    // 3. Draw Axis Coordinates lines
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.035)';
    ctx.beginPath();
    ctx.moveTo(centerX - radius, centerY);
    ctx.lineTo(centerX + radius, centerY);
    ctx.moveTo(centerX, centerY - radius);
    ctx.lineTo(centerX, centerY + radius);
    ctx.stroke();

    // 4. Render Thermographic Heatmap Blobs (Overlay blending mode)
    if (activeTab === 'heatmap' && (venues.length > 0 || flashEvents.length > 0)) {
      ctx.save();
      // Mask thermographic blend fields inside the circular coordinate system
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Configure Screen blend operation to let heatwaves compound beautifully
      ctx.globalCompositeOperation = 'screen';

      venues.forEach((v) => {
        const pos = getRelativePosition(v.lat, v.lon, userCoords, width, height, zoomLevel);
        const term = getThermalLevel(v);

        // Core thermal radius based on intensity score
        const thermalRadius = (16 + (term.value / 100) * 32) * zoomLevel * contourIntensity;

        // Draw radial blend sphere representing localized thermal energy signature
        const hGrad = ctx.createRadialGradient(
          pos.x, pos.y, 1, 
          pos.x, pos.y, thermalRadius
        );
        hGrad.addColorStop(0, term.color);
        hGrad.addColorStop(0.2, term.color + '66'); // 40% opacity
        hGrad.addColorStop(0.5, term.color + '22'); // 13% opacity
        hGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, thermalRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw Flash Event thermographic intensity on top (Critical red)
      flashEvents.forEach((fe) => {
        if (fe.claimed) return;
        const pos = getRelativePosition(fe.targetLat, fe.targetLng, userCoords, width, height, zoomLevel);
        if (!pos.inBounds) return;

        // Flash Events are EXTREMELY intense (fluctuate size dynamically to animate)
        const pulseFactor = 0.85 + Math.sin(Date.now() / 200) * 0.15;
        const thermalRadius = 45 * zoomLevel * contourIntensity * pulseFactor;

        const hGrad = ctx.createRadialGradient(
          pos.x, pos.y, 2, 
          pos.x, pos.y, thermalRadius
        );
        hGrad.addColorStop(0, '#FF375F'); // Critical Red
        hGrad.addColorStop(0.3, 'rgba(255, 55, 95, 0.6)');
        hGrad.addColorStop(0.6, 'rgba(255, 159, 10, 0.2)');
        hGrad.addColorStop(1, 'transparent');

        ctx.fillStyle = hGrad;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, thermalRadius, 0, Math.PI * 2);
        ctx.fill();
      });

      ctx.restore();
    }

    // 5. Draw the Sweeping Sonar Line if Radar View is active
    if (activeTab === 'radar') {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.clip();

      // Draw sweeping gradient slice
      const radSweep = (sweepAngle * Math.PI) / 180;
      const sGrad = ctx.createRadialGradient(centerX, centerY, 5, centerX, centerY, radius);
      sGrad.addColorStop(0, 'rgba(61, 220, 108, 0.05)');
      sGrad.addColorStop(1, 'rgba(61, 220, 108, 0.0)');

      // Draw active line
      ctx.strokeStyle = 'rgba(61, 220, 108, 0.25)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.lineTo(
        centerX + radius * Math.cos(radSweep),
        centerY + radius * Math.sin(radSweep)
      );
      ctx.stroke();

      // Shadow overlay indicating scanned field
      ctx.fillStyle = 'rgba(61, 220, 108, 0.02)';
      ctx.beginPath();
      ctx.moveTo(centerX, centerY);
      ctx.arc(centerX, centerY, radius, radSweep - 0.35, radSweep);
      ctx.lineTo(centerX, centerY);
      ctx.fill();

      // Draw active flash event crosshair blips
      flashEvents.forEach((fe) => {
        if (fe.claimed) return;
        const pos = getRelativePosition(fe.targetLat, fe.targetLng, userCoords, width, height, zoomLevel);
        if (!pos.inBounds) return;

        const opacity = 0.5 + Math.sin(Date.now() / 150) * 0.5;
        ctx.strokeStyle = `rgba(255, 55, 95, ${opacity})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 8, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = 'rgba(255, 55, 95, 0.35)';
        ctx.beginPath();
        ctx.moveTo(pos.x - 12, pos.y);
        ctx.lineTo(pos.x + 12, pos.y);
        ctx.moveTo(pos.x, pos.y - 12);
        ctx.lineTo(pos.x, pos.y + 12);
        ctx.stroke();
      });

      ctx.restore();
    }

    // 6. Draw User Marker Node in Dead Center (Glowing beacon)
    ctx.shadowBlur = 10;
    ctx.shadowColor = '#3DDC6C';
    ctx.fillStyle = '#3DDC6C';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5, 0, Math.PI * 2);
    ctx.fill();

    // Pulse rings radiating from user position
    ctx.shadowBlur = 0;
    const pulseRadius = (Date.now() / 33) % 40;
    ctx.strokeStyle = `rgba(61, 220, 108, ${Math.max(0, 1 - pulseRadius / 40) * 0.45})`;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(centerX, centerY, 5 + pulseRadius, 0, Math.PI * 2);
    ctx.stroke();

  }, [venues, userCoords, zoomLevel, activeTab, contourIntensity, sweepAngle, flashEvents]);

  const handleZoom = (direction: 'in' | 'out') => {
    setZoomLevel((prev) => {
      const next = direction === 'in' ? prev + 0.2 : prev - 0.2;
      return Math.min(2.5, Math.max(0.4, next));
    });
  };

  if (isCollapsed) {
    return (
      <div id="vibe-heatmap-container" className="bg-[#1C1C1E] border border-zinc-800 rounded-3xl p-4 flex items-center justify-between select-none font-sans">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-4 h-4 text-orange-500/60" />
          </div>
          <h3 className="font-bold text-[14px] text-zinc-400 uppercase tracking-wide">VICINITY VIBE NET</h3>
        </div>
        <button
          type="button"
          onClick={() => setIsCollapsed(false)}
          className="text-[11px] font-black tracking-wider text-[#d5ead6] hover:text-white bg-[#d5ead6]/10 hover:bg-[#d5ead6]/25 border border-[#d5ead6]/20 px-4 py-1.5 rounded-full cursor-pointer transition-all uppercase font-semibold"
        >
          REVEAL
        </button>
      </div>
    );
  }

  return (
    <div id="vibe-heatmap-container" className="bg-[#1C1C1E] border border-zinc-800 rounded-3xl p-5 space-y-4 select-none">
      {/* HEADER HUD BAR */}
      <div className="flex flex-col gap-2.5 select-none">
        {/* Top line: Title */}
        <div className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded bg-orange-500/10 flex items-center justify-center">
            <Flame className="w-3.5 h-3.5 text-orange-500 animate-pulse" />
          </div>
          <h3 className="font-extrabold text-[13px] text-white tracking-wider uppercase">VICINITY VIBE NET</h3>
        </div>

        {/* Buttons (Tabs & Hide) below title */}
        <div className="flex items-center gap-2 select-none w-full">
          <div className="flex items-center bg-[#2C2C2E] p-0.5 rounded-xl border border-zinc-800 grow">
            <button
              type="button"
              onClick={() => setActiveTab('heatmap')}
              className={cn(
                "flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all text-center",
                activeTab === 'heatmap' ? "bg-zinc-800 text-amber-400" : "text-zinc-400 hover:text-white"
              )}
            >
              HEAT WAVE
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('radar')}
              className={cn(
                "flex-1 px-2.5 py-1.5 rounded-lg text-[10px] font-black tracking-tight transition-all text-center",
                activeTab === 'radar' ? "bg-zinc-800 text-[#3DDC6C]" : "text-zinc-400 hover:text-white"
              )}
            >
              SONAR SWEEP
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsCollapsed(true)}
            className="text-[9px] font-black text-zinc-400 hover:text-white bg-[#2C2C2E]/60 hover:bg-[#2C2C2E] border border-zinc-800/80 px-3 py-2 rounded-xl cursor-pointer transition-all uppercase tracking-wider"
          >
            Hide
          </button>
        </div>

        {/* Writing "CONTINUOUS THERMAL SCAN • CODES ACTIVE" below the buttons in one straight line with smaller font */}
        <div className="text-[8.5px] text-[#8E8E93] font-mono tracking-wider font-bold uppercase text-center sm:text-left">
          CONTINUOUS THERMAL SCAN • {venues.length} CODES ACTIVE
        </div>
      </div>

      {/* MATRIX CONTROLS & HUD SUMMARY */}
      <div className="flex justify-between items-center text-[11px] font-mono select-none px-1 text-[#8E8E93]">
        <div className="flex gap-4">
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF375F]" /> 
            PEAK ({(venues.filter(v => getRelativePosition(v.lat, v.lon, userCoords, 200, 200, zoomLevel).distFromCenter < 120 && getThermalLevel(v).value >= 65).length)})
          </span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF9F0A]" /> 
            STEADY ({(venues.filter(v => getRelativePosition(v.lat, v.lon, userCoords, 200, 200, zoomLevel).distFromCenter < 120 && getThermalLevel(v).value < 65 && getThermalLevel(v).value >= 40).length)})
          </span>
        </div>
        
        {/* RE-CALIBRATE SLIDER OR HEAT INTENSITY KNOB */}
        <div className="flex items-center gap-1.5">
          <span className="text-[10px]">RADAR ZOOM:</span>
          <span className="text-white font-bold tracking-tighter">{(zoomLevel).toFixed(1)}x</span>
        </div>
      </div>

      {/* THE HEATMAP CANVAS PORTAL */}
      <div className="relative w-full aspect-square border border-zinc-800/80 bg-black rounded-2xl overflow-hidden shadow-inner flex items-center justify-center">
        {/* Main interactive Canvas */}
        <canvas 
          ref={canvasRef} 
          className="w-full h-full block cursor-crosshair opacity-90 transition-opacity"
        />

        {/* OVERLAY: Absolute Clickable heat node nodes representing actual venues */}
        {userCoords && canvasRef.current && (
          <div className="absolute inset-0 z-10 pointer-events-none">
            {venues.map((v) => {
              const canvas = canvasRef.current;
              if (!canvas) return null;
              const width = canvas.clientWidth;
              const height = canvas.clientHeight;
              const pos = getRelativePosition(v.lat, v.lon, userCoords, width, height, zoomLevel);

              // Skip layout if node lands outside visual bounding sphere
              if (!pos.inBounds) return null;

              const level = getThermalLevel(v);
              const isSelected = selectedVenue?.id === v.id;

              return (
                <button
                  key={`node-${v.id}`}
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate(20);
                    }
                    onSelectVenue(v);
                  }}
                  onMouseEnter={() => setHoveredNode(v)}
                  onMouseLeave={() => setHoveredNode(null)}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer focus:outline-none z-20 group"
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                >
                  <div className="relative">
                    {/* Pulsing Heat Halo Ring */}
                    <span 
                      className={cn(
                        "absolute -inset-2.5 rounded-full opacity-60 scale-75 group-hover:scale-125 transition-transform duration-300",
                        v.rarity === 'LEGENDARY' ? 'bg-[#FF9F0A]/30 border border-[#FF9F0A]/60' : 'bg-[#3478F6]/20 border border-[#3478F6]/50'
                      )}
                      style={{
                        animation: isSelected 
                          ? 'ping 1.2s cubic-bezier(0, 0, 0.2, 1) infinite' 
                          : 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite'
                      }}
                    />

                    {/* Core Point Emoji (grows on selecting/interacting) */}
                    <div 
                      className={cn(
                        "w-7 h-7 rounded-full flex items-center justify-center text-xs font-semibold select-none shadow-lg transition-transform active:scale-95",
                        isSelected 
                          ? "bg-zinc-100 scale-125 border-2 border-[#FFD60A] text-black" 
                          : "bg-[#2C2C2E] hover:scale-115 border border-zinc-700 hover:border-zinc-500 text-white"
                      )}
                    >
                      {v.emoji}
                    </div>

                    {/* Quick indicator of thermal intensity */}
                    <span 
                      className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-black shadow"
                      style={{ backgroundColor: level.color }}
                    />
                  </div>
                </button>
              );
            })}

            {/* Flash Events Overlay Nodes */}
            {userCoords && flashEvents && flashEvents.map((fe) => {
              if (fe.claimed) return null;
              const canvas = canvasRef.current;
              if (!canvas) return null;
              const width = canvas.clientWidth;
              const height = canvas.clientHeight;
              const pos = getRelativePosition(fe.targetLat, fe.targetLng, userCoords, width, height, zoomLevel);

              if (!pos.inBounds) return null;

              const isSelected = selectedFlashEvent?.id === fe.id;

              return (
                <button
                  key={`flash-node-${fe.id}`}
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      navigator.vibrate([40, 30, 40]);
                    }
                    if (onSelectFlashEvent) {
                      onSelectFlashEvent(fe);
                    }
                  }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 pointer-events-auto cursor-pointer focus:outline-none z-30 group"
                  style={{ left: `${pos.x}px`, top: `${pos.y}px` }}
                >
                  <div className="relative">
                    {/* Pulsing Flash Border Halo */}
                    <span 
                      className="absolute -inset-3.5 rounded-full bg-red-500/25 border border-red-500/50 scale-75"
                      style={{
                        animation: 'ping 1.4s cubic-bezier(0, 0, 0.2, 1) infinite'
                      }}
                    />

                    {/* Core Lightning Bolt Circle */}
                    <div 
                      className={cn(
                        "w-8 h-8 rounded-full flex items-center justify-center text-sm font-black select-none transition-transform active:scale-95 border-2",
                        isSelected 
                          ? "bg-red-500 border-white text-white scale-125 shadow-[0_0_15px_rgba(239,68,68,1)]" 
                          : "bg-black border-red-500 text-red-500 hover:scale-110 shadow-[0_0_8px_rgba(239,68,68,0.5)]"
                      )}
                    >
                      ⚡
                    </div>
                  </div>
                </button>
              );
            })}

            {/* TOOLTIP PORTAL OVERLAY */}
            <AnimatePresence>
              {(() => {
                const activeNode = hoveredNode || selectedVenue;
                if (!activeNode) return null;

                const canvas = canvasRef.current;
                if (!canvas) return null;
                const width = canvas.clientWidth;
                const height = canvas.clientHeight;
                const pos = getRelativePosition(activeNode.lat, activeNode.lon, userCoords, width, height, zoomLevel);

                if (!pos.inBounds) return null;

                const level = getThermalLevel(activeNode);
                const snippet = getActivitySnippet(activeNode);

                return (
                  <VenueTooltipPortal
                    activeNode={activeNode}
                    pos={pos}
                    level={level}
                    snippet={snippet}
                  />
                );
              })()}
            </AnimatePresence>
          </div>
        )}

        <RadarControlsOverlay
          contourIntensity={contourIntensity}
          isLoading={isLoading}
          onZoom={handleZoom}
          onRefresh={onRefresh}
        />

        {/* LOADING INDICATOR STATE */}
        <AnimatePresence>
          {isLoading && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xs flex flex-col items-center justify-center gap-3 z-30 select-none pb-4"
            >
              <RefreshCw className="w-8 h-8 text-[#3DDC6C] animate-spin" />
              <div className="text-center font-mono text-zinc-400">
                <p className="text-xs font-bold uppercase tracking-wider text-white">RE-CALIBRATING SCANNER</p>
                <p className="text-[9px] mt-1 text-zinc-500">PINGING OPENSTREETMAP GDL NODES...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* FOOTER: SELECTED HOTSPOT QUICKVIEW HUD BAR */}
      <div className="min-h-[56px] bg-black/40 border border-zinc-800/60 rounded-2xl p-3 flex items-center justify-between select-none">
        {selectedVenue ? (
          <div className="flex-1 flex justify-between items-center select-none">
            <div className="flex items-center gap-3">
              <span className="text-[24px] shrink-0">{selectedVenue.emoji}</span>
              <div>
                <h4 className="text-white text-xs font-bold leading-tight line-clamp-1">{selectedVenue.name}</h4>
                <div className="flex items-center gap-2 mt-0.5 text-[10px] text-[#8E8E93] font-mono font-semibold">
                  <span className="text-[#FF9F0A]">Rating: {selectedVenue.rating} ★</span>
                  <span>•</span>
                  <span>{selectedVenue.distance}km away</span>
                </div>
              </div>
            </div>
            
            {/* Quick action triggers check-in sheet inside Explore */}
            <button
              type="button"
              onClick={() => onSelectVenue(selectedVenue)}
              className="px-3 py-2 bg-[#2D4A8C] hover:bg-[#3478F6] font-[600] text-white rounded-xl text-[11px] shrink-0 outline-none border-none cursor-pointer active:scale-95"
            >
              LOCATE
            </button>
          </div>
        ) : hoveredNode ? (
          <div className="flex-1 flex items-center gap-3">
            <span className="text-[24px]">{hoveredNode.emoji}</span>
            <div>
              <p className="text-[10px] text-[#8E8E93] font-mono uppercase tracking-widest font-black leading-none">inspecting spot vibes</p>
              <h4 className="text-zinc-100 text-xs font-semibold leading-tight line-clamp-1 mt-1">{hoveredNode.name}</h4>
            </div>
          </div>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center py-1 font-mono text-[11.5px] text-[#8E8E93]">
            <span>TAP ANY MAP NODE TO INITIATE THERMAL TELEMETRY RECON</span>
          </div>
        )}
      </div>

      {/* HEAT LEGEND INDEX */}
      <div className="grid grid-cols-4 gap-2 pt-1 font-mono text-[9px] font-black tracking-normal select-none uppercase">
        {[
          { label: 'CRITICAL EVENT', bgCls: 'bg-[#FF375F]', textCls: 'text-[#FF375F]' },
          { label: 'ACTIVE SHIELD', bgCls: 'bg-[#BF5AF2]', textCls: 'text-[#BF5AF2]' },
          { label: 'STEADY WAVE', bgCls: 'bg-[#FF9F0A]', textCls: 'text-[#FF9F0A]' },
          { label: 'AMBIENT NODE', bgCls: 'bg-[#3DDC6C]', textCls: 'text-[#3DDC6C]' },
        ].map((item) => (
          <div key={item.label} className="flex flex-col items-center gap-1 bg-[#2C2C2E]/40 rounded-lg p-1.5 border border-zinc-800/40 text-center">
            <span className={cn("w-1.5 h-1.5 rounded-full inline-block animate-pulse", item.bgCls)} />
            <span className={cn("font-black scale-95 origin-center leading-none", item.textCls)}>{item.label.split(' ')[0]}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
