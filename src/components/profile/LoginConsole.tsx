import React, { useState } from 'react';
import { useAuth } from '../../lib/auth';
import { VibeGem } from '../common/VibeGem';
import { Sparkles, Zap, ArrowRight, User } from 'lucide-react';
import { LoginModal } from './LoginModal';
import { ProfileView } from './ProfileView';

export const LoginConsole = () => {
  const { login, loginAsGuest } = useAuth();
  const [guestHandle, setGuestHandle] = useState('');
  const [pane, setPane] = useState<'splash' | 'login' | 'register'>('splash');
  const [verificationNotice, setVerificationNotice] = useState<{ email: string; avatarUploadNote?: string } | null>(null);

  const handleSimulate = (e: React.FormEvent) => {
    e.preventDefault();
    loginAsGuest(guestHandle || 'sunny_explorer');
  };

  if (pane === 'login') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 relative">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,transparent_60%)] pointer-events-none" />
        <LoginModal 
          onCancel={() => setPane('splash')} 
          onSwitchToRegister={() => setPane('register')}
        />
      </div>
    );
  }

  if (pane === 'register') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4 overflow-y-auto relative py-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,transparent_60%)] pointer-events-none" />
        <div className="w-full max-w-lg z-10">
          <ProfileView 
            onCancel={() => setPane('splash')}
            onSuccess={() => setPane('splash')}
            onVerificationRequired={(email, avatarUploadNote) => { setVerificationNotice({email, avatarUploadNote}); setPane('splash'); }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black grid grid-cols-1 lg:grid-cols-12 overflow-hidden text-white font-sans selection:bg-vibe-primary/30">
      {/* Visual Ambient Showcase Panel */}
      <div className="lg:col-span-7 relative flex items-center justify-center bg-zinc-950/80 border-b lg:border-b-0 lg:border-r border-white/5 h-[45vh] lg:h-screen">
        {/* Cosmos Gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.12)_0%,transparent_60%)] pointer-events-none" />
        <div className="absolute bottom-10 left-10 text-left hidden lg:block z-20 space-y-2">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-vibe-primary animate-ping" />
            <span className="text-[10px] font-mono tracking-[0.4em] uppercase text-vibe-secondary">Shared Spaces Online</span>
          </div>
          <h1 className="text-4xl font-black font-sans tracking-tighter uppercase italic text-white">
            Vibe<span className="text-vibe-primary">Quest</span>
          </h1>
          <p className="text-zinc-500 text-xs max-w-sm uppercase tracking-widest font-bold font-sans">
            Warm Event Discovery & Vibrant Communities
          </p>
        </div>

        {/* 3D Kinetic Floating Gem */}
        <div className="w-72 h-72 lg:w-96 lg:h-96 relative z-10">
          <VibeGem />
        </div>
      </div>

      {/* Connection & Auth Settings Panel */}
      <div className="lg:col-span-5 flex flex-col justify-between p-8 lg:p-12 h-[55vh] lg:h-screen bg-black select-none">
        {/* Top Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-vibe-primary animate-pulse" />
            <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">Shared Vibe Sanctuary</span>
          </div>
          <span className="text-[9px] font-bold font-mono px-3 py-1 bg-white/5 rounded-full border border-white/5 text-zinc-500">
            v1.2.0 (Gather)
          </span>
        </div>

        {/* Connection Form */}
        <div className="my-auto max-w-sm w-full mx-auto space-y-8">
          {verificationNotice && (
            <div role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-950/40 p-4 text-sm text-emerald-200">
              Account created. Check {verificationNotice.email} for the verification link, then return to sign in.
              {verificationNotice.avatarUploadNote && <p className="mt-2 text-amber-200">{verificationNotice.avatarUploadNote}</p>}
            </div>
          )}
          <div className="space-y-3">
            <div className="lg:hidden flex items-center gap-2 mb-3">
              <span className="text-3xl font-black italic uppercase tracking-tighter text-white">Vibe<span className="text-vibe-primary">Quest</span></span>
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tight italic">
              Step Into The <span className="text-vibe-primary">Gathering</span>
            </h2>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Step inside to discover lovely coffee spots, warm community gatherups, live acoustic music, and shared cozy moments.
            </p>
          </div>

          <form onSubmit={handleSimulate} className="space-y-5">
            <div className="space-y-3">
              <label className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-500 flex items-center gap-1.5">
                <User className="w-3 h-3 text-vibe-primary" /> Pick Your Nickname
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. sunny_wanderer, coffee_lover"
                  value={guestHandle}
                  onChange={(e) => setGuestHandle(e.target.value)}
                  maxLength={18}
                  className="w-full h-14 px-5 bg-zinc-950 border border-white/10 rounded-2xl text-sm text-zinc-200 outline-none focus:border-vibe-primary focus:ring-1 focus:ring-vibe-primary/50 transition-all font-sans"
                />
                <span className="absolute right-5 top-1/2 -translate-y-1/2 text-[9px] font-sans text-zinc-600">
                  VIBE ID
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {/* Simulation Mode Button */}
              <button
                type="submit"
                className="w-full h-14 vibe-gradient rounded-2xl flex items-center justify-between px-6 font-black tracking-[0.2em] text-xs text-white uppercase shadow-lg group hover:scale-[1.02] active:scale-[0.98] transition-all cursor-pointer"
              >
                <span className="flex items-center gap-3">
                  <Zap className="w-4 h-4 text-white animate-pulse" />
                  Start Exploring
                </span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <div className="relative flex items-center justify-center my-1.5">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/5" />
                </div>
                <span className="relative px-3 bg-black text-[9px] font-black text-zinc-650 uppercase tracking-widest">
                  OR PREPARE PROFILE
                </span>
              </div>

              {/* Secure Credentials sign-in inputs */}
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setPane('login')}
                  className="h-14 bg-[#9333ea]/15 hover:bg-[#9333ea]/25 border border-purple-500/20 text-[#c084fc] font-bold tracking-wider text-[10.5px] rounded-2xl uppercase transition-all cursor-pointer"
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => setPane('register')}
                  className="h-14 bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 font-bold tracking-wider text-[10.5px] rounded-2xl uppercase transition-all cursor-pointer"
                >
                  Create Profile
                </button>
              </div>

              {/* Standard OAuth Link */}
              <button
                type="button"
                onClick={login}
                className="w-full h-14 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl flex items-center justify-center gap-3 font-black tracking-[0.2em] text-xs text-zinc-300 uppercase transition-all cursor-pointer"
              >
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Join with Google Account
              </button>
            </div>
          </form>
        </div>

        {/* Footer info */}
        <p className="text-[10px] text-zinc-600 text-center uppercase tracking-[0.2em]">
          Built with Love by Neighbors & Friends
        </p>
      </div>
    </div>
  );
};
