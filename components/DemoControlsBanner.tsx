'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  BellRing,
  AlertTriangle,
  Mail,
  Volume2,
  ChevronDown,
  ChevronUp,
  Flame,
  Zap,
} from 'lucide-react';
import SoundService from '@/lib/soundService';

interface DemoControlsBannerProps {
  onTriggerSimulatedEscalation: () => void;
  onTriggerLowRefill: () => void;
  onOpenEmailInspector: () => void;
  onOpenVoiceAssistant: () => void;
}

export default function DemoControlsBanner({
  onTriggerSimulatedEscalation,
  onTriggerLowRefill,
  onOpenEmailInspector,
  onOpenVoiceAssistant,
}: DemoControlsBannerProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-indigo-950 text-white rounded-2xl shadow-xl border border-slate-700/80 mb-6 overflow-hidden transition-all">
      {/* Header Bar */}
      <div
        onClick={() => setIsOpen(!isOpen)}
        className="px-4 py-2.5 flex items-center justify-between cursor-pointer hover:bg-white/5 transition"
      >
        <div className="flex items-center space-x-2">
          <span className="flex h-2 w-2 rounded-full bg-amber-400 animate-ping" />
          <span className="text-xs font-black uppercase tracking-widest text-amber-300 flex items-center gap-1.5">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Catalyst Hackathon • Live Interactive Simulation Bar</span>
          </span>
          <span className="hidden sm:inline-block text-[11px] text-slate-400">
            (1-click evaluator test triggers)
          </span>
        </div>

        <button className="text-slate-400 hover:text-white transition p-1">
          {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Action Buttons */}
      {isOpen && (
        <div className="px-4 py-3 bg-black/25 border-t border-slate-700/60 flex flex-wrap items-center gap-2 text-xs">
          <button
            onClick={() => {
              SoundService.playTap();
              onTriggerSimulatedEscalation();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 font-bold transition active:scale-95 shadow-sm text-white"
          >
            <BellRing className="w-3.5 h-3.5" />
            <span>Simulate Missed Dose & 30-min Family Alert</span>
          </button>

          <button
            onClick={() => {
              SoundService.playTap();
              onTriggerLowRefill();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 font-bold transition active:scale-95 shadow-sm text-white"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            <span>Simulate Low Refill Warning</span>
          </button>

          <button
            onClick={() => {
              SoundService.playTap();
              onOpenEmailInspector();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 font-bold transition active:scale-95 shadow-sm text-white"
          >
            <Mail className="w-3.5 h-3.5" />
            <span>Inspect Live Outbound HTML Emails</span>
          </button>

          <button
            onClick={() => {
              SoundService.playTap();
              onOpenVoiceAssistant();
            }}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-600 font-bold transition active:scale-95 shadow-sm text-white"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Launch Web Speech Voice Assistant</span>
          </button>

          <button
            onClick={() => {
              SoundService.playCelebration();
            }}
            className="flex items-center space-x-1 px-2.5 py-1.5 rounded-xl bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white font-medium transition active:scale-95"
            title="Test sound effect"
          >
            <Volume2 className="w-3.5 h-3.5" />
            <span>Chime Fanfare</span>
          </button>
        </div>
      )}
    </div>
  );
}
