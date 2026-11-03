import React, { useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import * as Lucide from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// 1. M3 DYNAMIC ICON COMPONENT
// ============================================================================
interface M3IconProps {
  name: string;
  className?: string;
  size?: number | string;
  filled?: boolean;
  strokeWidth?: number;
}

export const M3Icon: React.FC<M3IconProps> = ({
  name,
  className,
  size = 20,
  filled = false,
  strokeWidth = 2,
}) => {
  // Graceful lookup of the Lucide icon module
  const IconComponent = (Lucide as any)[name] || Lucide.HelpCircle;
  
  return (
    <span className={cn("inline-flex items-center justify-center select-none", className)}>
      <IconComponent
        size={size}
        strokeWidth={strokeWidth}
        className={cn(
          "transition-all duration-300",
          filled ? "fill-current" : "fill-none"
        )}
      />
    </span>
  );
};

// ============================================================================
// 2. M3 BUTTON SYSTEM
// ============================================================================
export type M3ButtonVariant = 'filled' | 'tonal' | 'outlined' | 'text' | 'elevated' | 'fab';

interface M3ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: M3ButtonVariant;
  icon?: string;
  iconPosition?: 'left' | 'right';
  loading?: boolean;
  className?: string;
  children?: React.ReactNode;
}

export const M3Button: React.FC<M3ButtonProps> = ({
  variant = 'filled',
  icon,
  iconPosition = 'left',
  loading = false,
  className,
  children,
  disabled,
  ...props
}) => {
  const isFab = variant === 'fab';
  
  // Base styling following strictly Google's Material Design 3 guidelines
  const baseClasses = cn(
    "relative inline-flex items-center justify-center font-sans font-semibold tracking-wide transition-all select-none duration-250",
    "focus:outline-none focus-visible:ring-2 focus-visible:ring-m3-primary/50 focus-visible:ring-offset-2",
    "disabled:opacity-40 disabled:pointer-events-none disabled:shadow-none",
    "active:scale-[0.97]"
  );

  // Variant styling matching M3 colors & elevations
  const variantClasses = {
    filled: "bg-m3-primary text-m3-on-primary shadow-sm hover:shadow-md hover:brightness-110 h-10 px-6 rounded-full text-sm",
    tonal: "bg-m3-primary-container text-m3-on-primary-container hover:bg-m3-primary-container/80 h-10 px-6 rounded-full text-sm",
    outlined: "bg-transparent border border-m3-outline text-m3-primary hover:bg-m3-primary/5 h-10 px-6 rounded-full text-sm",
    text: "bg-transparent text-m3-primary hover:bg-m3-primary/10 h-10 px-4 rounded-full text-sm",
    elevated: "bg-m3-surface text-m3-primary shadow-[0_1px_3px_rgba(0,0,0,0.1),0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_6px_rgba(0,0,0,0.1),0_2px_4px_rgba(0,0,0,0.06)] h-10 px-6 rounded-full text-sm",
    fab: "bg-m3-secondary-container text-m3-on-secondary-container shadow-md hover:shadow-lg rounded-2xl p-4 scale-110 active:scale-105"
  };

  return (
    <motion.button
      whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || loading ? 1 : 0.96 }}
      disabled={disabled || loading}
      className={cn(baseClasses, variantClasses[variant], className)}
      {...props}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <M3Icon name="Loader2" size={16} className="animate-spin text-current" />
          {!isFab && <span>Loading...</span>}
        </span>
      ) : (
        <span className="flex items-center justify-center gap-2">
          {icon && iconPosition === 'left' && (
            <M3Icon name={icon} size={isFab ? 24 : 16} className="text-current" />
          )}
          {children}
          {icon && iconPosition === 'right' && (
            <M3Icon name={icon} size={16} className="text-current" />
          )}
        </span>
      )}
    </motion.button>
  );
};

// ============================================================================
// 3. M3 MODAL SYSTEM (STANDARD CENTERED MODAL)
// ============================================================================
interface M3ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footerActions?: React.ReactNode;
}

export const M3Modal: React.FC<M3ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  footerActions
}) => {
  // Trap focus inside modal for better accessibility
  const modalRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (isOpen) {
      modalRef.current?.focus();
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Glassmorphic Dark Backdrop Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/55 backdrop-blur-[6px] transition-all"
          />

          {/* Centered Modal Container */}
          <motion.div
            ref={modalRef}
            tabIndex={-1}
            initial={{ scale: 0.92, opacity: 0, y: 15 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.92, opacity: 0, y: 15 }}
            transition={{ type: 'spring', damping: 25, stiffness: 240 }}
            className={cn(
              "relative bg-m3-surface text-m3-on-surface border border-m3-outline/20 shadow-xl rounded-3xl p-6 max-w-sm w-full z-10 space-y-4 focus:outline-none",
              "ring-1 ring-black/5"
            )}
            role="dialog"
            aria-modal="true"
          >
            {/* Header Block */}
            <div className="flex items-start justify-between">
              <div className="space-y-1">
                {title && (
                  <h3 className="text-lg font-bold tracking-tight text-m3-on-surface">
                    {title}
                  </h3>
                )}
                {description && (
                  <p className="text-xs text-m3-on-surface/60">
                    {description}
                  </p>
                )}
              </div>
              <M3Button
                variant="text"
                onClick={onClose}
                className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-m3-on-surface/60 hover:text-m3-on-surface min-w-[32px] min-h-[32px]"
                aria-label="Close dialogue"
              >
                <M3Icon name="X" size={18} />
              </M3Button>
            </div>

            {/* Modal Content */}
            <div className="text-sm leading-relaxed text-m3-on-surface/80">
              {children}
            </div>

            {/* Footer actions */}
            {footerActions && (
              <div className="flex justify-end gap-2 pt-2 border-t border-m3-outline/10">
                {footerActions}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 4. M3 BOTTOM SHEET SYSTEM
// ============================================================================
interface M3BottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children?: React.ReactNode;
}

export const M3BottomSheet: React.FC<M3BottomSheetProps> = ({
  isOpen,
  onClose,
  title,
  children
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center">
          {/* Backdrop Blur */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-black/60 backdrop-blur-[4px] transition-all cursor-pointer"
          />

          {/* Bottom Sheet Drawer Panel */}
          <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 220 }}
            /* Support swipe/drag down gesture to close */
            drag="y"
            dragConstraints={{ top: 0 }}
            dragElastic={{ top: 0.1, bottom: 0.8 }}
            onDragEnd={(e, info) => {
              if (info.offset.y > 100) {
                onClose();
              }
            }}
            className={cn(
              "relative bg-m3-surface text-m3-on-surface border-t border-m3-outline/10 rounded-t-[28px] shadow-2xl p-6 w-full max-w-md z-10 flex flex-col pointer-events-auto",
              "pb-10 max-h-[85vh] overflow-y-auto"
            )}
          >
            {/* Grab/Drag handle bar */}
            <div className="w-12 h-1.5 bg-m3-outline/30 rounded-full mx-auto mb-4 shrink-0 cursor-grab active:cursor-grabbing" />

            {/* Title segment */}
            {title && (
              <div className="flex justify-between items-center mb-4 border-b border-m3-outline/10 pb-3 shrink-0">
                <h3 className="text-lg font-extrabold tracking-tight">{title}</h3>
                <M3Button
                  variant="text"
                  onClick={onClose}
                  className="w-8 h-8 rounded-full p-0 flex items-center justify-center text-m3-on-surface/60"
                >
                  <M3Icon name="X" size={18} />
                </M3Button>
              </div>
            )}

            {/* Content box */}
            <div className="flex-1 overflow-y-auto min-h-0 text-sm leading-relaxed text-m3-on-surface/90">
              {children}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};

// ============================================================================
// 5. M3 INTERACTIVE SHOWCASE / PLAYGROUND SUITE
// ============================================================================
export const M3Playground: React.FC = () => {
  const [themeMode, setThemeMode] = React.useState<'light' | 'dark'>('dark');
  const [modalOpen, setModalOpen] = React.useState(false);
  const [sheetOpen, setSheetOpen] = React.useState(false);
  const [btnLoading, setBtnLoading] = React.useState(false);
  const [checkedIn, setCheckedIn] = React.useState(false);

  // Synchronize CSS class for dark/light mode switches inside the playground container
  const toggleTheme = () => {
    const newTheme = themeMode === 'light' ? 'dark' : 'light';
    setThemeMode(newTheme);
    const htmlEl = document.documentElement;
    if (newTheme === 'dark') {
      htmlEl.classList.add('dark');
    } else {
      htmlEl.classList.remove('dark');
    }
  };

  return (
    <div className={cn(
      "p-5 rounded-3xl border border-m3-outline/10 transition-colors duration-500 text-left font-sans shadow-lg",
      themeMode === 'dark' ? "bg-[#0f0e13] text-white" : "bg-white text-zinc-900"
    )}>
      {/* Upper header controls */}
      <div className="flex justify-between items-center mb-6 pb-4 border-b border-m3-outline/10">
        <div>
          <h2 className="text-xl font-extrabold tracking-tight flex items-center gap-2">
            🎨 Material You M3 Sandbox
          </h2>
          <p className="text-[11px] font-mono text-m3-primary uppercase tracking-widest mt-0.5">
            Google Material 3 System Custom Controls
          </p>
        </div>

        {/* Real-time Theme Mode Switcher */}
        <M3Button
          variant="tonal"
          onClick={toggleTheme}
          icon={themeMode === 'light' ? 'Moon' : 'Sun'}
          className="text-xs font-mono font-bold tracking-wider rounded-xl uppercase px-3 py-1.5 h-auto bg-m3-primary/10 text-m3-primary border border-m3-primary/20"
        >
          {themeMode.toUpperCase()} MODE
        </M3Button>
      </div>

      {/* Button controls row */}
      <div className="space-y-6">
        <div>
          <h4 className="text-xs font-black tracking-wider uppercase text-m3-outline mb-3">1. Complete Button Set</h4>
          <div className="grid grid-cols-2 gap-3.5">
            <M3Button variant="filled" icon="Compass">
              Primary Filled
            </M3Button>
            <M3Button variant="tonal" icon="Layers">
              Tonal Filled
            </M3Button>
            <M3Button variant="outlined" icon="Star">
              Outlined secondary
            </M3Button>
            <M3Button variant="elevated" icon="Cpu">
              Elevated Depth
            </M3Button>
            <M3Button variant="text" icon="HelpCircle">
              Text / Ghost
            </M3Button>
            <M3Button 
              variant="tonal" 
              loading={btnLoading}
              onClick={() => {
                setBtnLoading(true);
                setTimeout(() => setBtnLoading(false), 2000);
              }}
            >
              Click for Loading state
            </M3Button>
          </div>
        </div>

        {/* FAB and Icons */}
        <div className="grid grid-cols-2 gap-4 pt-2">
          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-m3-outline mb-3">2. Floating Action Button (FAB)</h4>
            <div className="flex items-center gap-4">
              <M3Button
                variant="fab"
                icon="Camera"
                onClick={() => {
                  alert("Accessing live smartphone camera feedback...");
                }}
                title="Camera Trigger FAB"
              />
              <span className="text-xs text-m3-on-surface/60 font-medium">
                Pill rounded FAB with depth elevations
              </span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-black tracking-wider uppercase text-m3-outline mb-3">3. Variable Material Symbols</h4>
            <div className="flex flex-wrap gap-3">
              <div className="p-2.5 rounded-xl bg-m3-surface-container flex flex-col items-center gap-1 border border-m3-outline/10 text-center w-14">
                <M3Icon name="Heart" filled className="text-red-500 scale-110" />
                <span className="text-[9px] text-m3-outline">Filled</span>
              </div>
              <div className="p-2.5 rounded-xl bg-m3-surface-container flex flex-col items-center gap-1 border border-m3-outline/10 text-center w-14">
                <M3Icon name="Heart" className="text-zinc-400 scale-110" />
                <span className="text-[9px] text-m3-outline">Stroke</span>
              </div>
              <div className="p-2.5 rounded-xl bg-m3-surface-container flex flex-col items-center gap-1 border border-m3-outline/10 text-center w-14">
                <M3Icon name="Compass" className="text-m3-primary animate-spin" />
                <span className="text-[9px] text-m3-outline">Spin</span>
              </div>
            </div>
          </div>
        </div>

        {/* Overlay controls */}
        <div className="pt-4 border-t border-m3-outline/10">
          <h4 className="text-xs font-black tracking-wider uppercase text-m3-outline mb-3.5">4. Modals & Bottom Sheets overlays</h4>
          <div className="flex flex-wrap gap-3">
            <M3Button
              variant="filled"
              icon="ExternalLink"
              onClick={() => setModalOpen(true)}
              className="bg-m3-secondary text-white hover:bg-m3-secondary/90 shadow-[0_4px_10px_rgba(14,165,233,0.2)]"
            >
              Launch Centered Modal
            </M3Button>

            <M3Button
              variant="tonal"
              icon="Compass"
              onClick={() => setSheetOpen(true)}
              className="bg-m3-primary/10 border border-m3-primary/20 text-m3-primary hover:bg-m3-primary/20"
            >
              Launch Mobile Bottom Sheet
            </M3Button>
          </div>
        </div>
      </div>

      {/* RENDER THE REUSABLE OVERLAYS FOR DEMONSTRATION */}
      <M3Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title="✨ Vibe Quest Settings Center"
        description="Configure your holographic Google Material 3 client-side local theme nodes."
        footerActions={
          <>
            <M3Button variant="text" onClick={() => setModalOpen(false)}>
              Cancel
            </M3Button>
            <M3Button variant="filled" onClick={() => {
              alert("Material You preferences synchronized!");
              setModalOpen(false);
            }}>
              Save Changes
            </M3Button>
          </>
        }
      >
        <div className="space-y-3 font-sans text-left">
          <p className="text-xs text-m3-on-surface/75 leading-relaxed">
            This dialog mimics Google's modern centered Material Design modal framework, incorporating <strong>backdrop-blur</strong>, 28px rounded borders, high contrast visibility, and keyboard escape hooks.
          </p>

          <div className="bg-m3-surface-container/60 border border-m3-outline/10 p-3 rounded-2xl space-y-2">
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-m3-on-surface">⚡ Hyper-local Quest notifications:</span>
              <span className="text-green-500 font-bold font-mono">ENABLED</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-semibold text-m3-on-surface">🌍 Satellite Maps Pre-caching:</span>
              <span className="text-m3-primary font-bold">AUTOMATIC</span>
            </div>
          </div>
        </div>
      </M3Modal>

      <M3BottomSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        title="📍 Secret Garden Café Spot Details"
      >
        <div className="space-y-4 text-left font-sans">
          {/* Quick Hero Spot Card */}
          <div className="relative rounded-2xl overflow-hidden h-36 bg-zinc-900 border border-m3-outline/10">
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent z-10" />
            
            {/* Soft decorative background pattern */}
            <div className="absolute inset-0 bg-[radial-gradient(#38bdf8_1.2px,transparent_1.2px)] [background-size:16px_16px] opacity-15" />
            
            <div className="absolute bottom-3 left-3 z-20 space-y-0.5">
              <span className="text-[10px] bg-emerald-500 text-black px-2 py-0.5 rounded-full font-extrabold uppercase tracking-widest font-mono">
                Active Landmark
              </span>
              <h4 className="text-lg font-extrabold text-white">Secret Garden Café</h4>
              <p className="text-[10px] text-zinc-300 font-mono">📍 Coordinates: 36.8065° N, 10.1815° E</p>
            </div>
          </div>

          <p className="text-xs text-m3-on-surface/85 leading-relaxed">
            The Material 3 Bottom Sheet features smooth motion-react sliding, swipe-to-dismiss drag gestures, and optimized layout dimensions that are ideal for displaying localized map point metadata.
          </p>

          <div className="flex items-center gap-3 bg-m3-primary/5 border border-m3-primary/10 rounded-2xl p-3.5">
            <div className="w-10 h-10 rounded-full bg-m3-primary/10 flex items-center justify-center text-m3-primary text-lg">
              🎯
            </div>
            <div className="flex-1 space-y-0.5">
              <span className="block text-[10px] text-m3-outline font-bold uppercase tracking-wider">Quest Challenge:</span>
              <span className="text-xs font-semibold text-m3-on-surface">Check in near the fountain to earn 250 VQ points</span>
            </div>
          </div>

          <div className="flex gap-2 justify-end pt-2 border-t border-m3-outline/10">
            <M3Button variant="outlined" onClick={() => setSheetOpen(false)}>
              Close Drawer
            </M3Button>
            <M3Button
              variant="filled"
              icon={checkedIn ? "Check" : "MapPin"}
              onClick={() => {
                setCheckedIn(true);
                alert("Simulated hardware GPS Check-in completed! +250 VQ added to purse.");
              }}
              className={checkedIn ? "bg-green-500 text-black border-none" : ""}
            >
              {checkedIn ? "Checked In!" : "Check In"}
            </M3Button>
          </div>
        </div>
      </M3BottomSheet>
    </div>
  );
};
