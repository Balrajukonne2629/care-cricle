'use client';

import React from 'react';
import {
  Heart,
  Volume2,
  VolumeX,
  Sun,
  Moon,
  Type,
  Mail,
  ShieldAlert,
  Mic,
  UserCheck,
} from 'lucide-react';
import { UserRolePin, NativeLanguage } from '@/lib/types';
import SoundService from '@/lib/soundService';

interface NavbarProps {
  currentRole: UserRolePin;
  onOpenPasscode: () => void;
  onOpenEmailInspector: () => void;
  onOpenVoiceAssistant: () => void;
  onOpenEmergency: () => void;
  unreadEmailCount: number;
  fontSize: 'standard' | 'large' | 'extra-large';
  onChangeFontSize: (size: 'standard' | 'large' | 'extra-large') => void;
  highContrast: boolean;
  onToggleHighContrast: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  selectedLanguage: NativeLanguage;
  onSelectLanguage: (lang: NativeLanguage) => void;
}

export default function Navbar({
  currentRole,
  onOpenPasscode,
  onOpenEmailInspector,
  onOpenVoiceAssistant,
  onOpenEmergency,
  unreadEmailCount,
  fontSize,
  onChangeFontSize,
  highContrast,
  onToggleHighContrast,
  soundEnabled,
  onToggleSound,
  selectedLanguage,
  onSelectLanguage,
}: NavbarProps) {
  const cycleFontSize = () => {
    SoundService.playTap();
    if (fontSize === 'standard') onChangeFontSize('large');
    else if (fontSize === 'large') onChangeFontSize('extra-large');
    else onChangeFontSize('standard');
  };

  const roleBadgeStyles: Record<string, string> = {
    elder: 'bg-emerald-50 text-emerald-800 border-emerald-300',
    family: 'bg-amber-50 text-amber-900 border-amber-300',
    nurse: 'bg-blue-50 text-blue-900 border-blue-300',
    doctor: 'bg-purple-50 text-purple-900 border-purple-300',
  };

  const languageOptions: { code: NativeLanguage; label: string; shortLabel: string }[] = [
    { code: 'hi', label: 'हिन्दी', shortLabel: 'हि' },
    { code: 'te', label: 'తెలుగు', shortLabel: 'తె' },
    { code: 'ta', label: 'தமிழ்', shortLabel: 'த' },
    { code: 'en', label: 'English', shortLabel: 'EN' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/90 shadow-sm">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        {/* Main Navbar Row */}
        <div className="h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
          {/* Brand Identity */}
          <div className="flex items-center space-x-2.5 sm:space-x-3 shrink-0">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-emerald-800 flex items-center justify-center text-white shadow-sm">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 fill-white/20 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-xl sm:text-2xl tracking-tight text-slate-900">
                  Care<span className="text-emerald-700">Circle</span>
                </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-800 border border-emerald-200">
                  India Edition
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden md:block">
                Smt. Lakshmi Amma • Connected Caregiver Network
              </p>
            </div>
          </div>

          {/* Controls Container */}
          <div className="flex items-center space-x-1.5 sm:space-x-2.5 overflow-x-auto py-1">
            {/* Native Language Selector */}
            <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200 shrink-0">
              {languageOptions.map(l => (
                <button
                  key={l.code}
                  onClick={() => {
                    SoundService.playTap();
                    onSelectLanguage(l.code);
                  }}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition ${
                    selectedLanguage === l.code
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title={`Switch language to ${l.label}`}
                >
                  <span className="hidden sm:inline">{l.label}</span>
                  <span className="sm:hidden">{l.shortLabel}</span>
                </button>
              ))}
            </div>

            {/* Quick Voice Assistant Mic Button (Desktop & Tablet) */}
            <button
              onClick={() => {
                SoundService.playTap();
                onOpenVoiceAssistant();
              }}
              className="hidden md:flex items-center space-x-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-xs sm:text-sm transition shadow-sm shrink-0 active:scale-95"
              title="Open Voice Companion"
            >
              <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span>
                {selectedLanguage === 'hi' ? 'बोलकर बताएं' : selectedLanguage === 'te' ? 'వాయిస్ సహాయం' : 'Voice'}
              </span>
            </button>

            {/* Email Inspector / Outbox button (Hidden on very small mobile, visible in secondary bar) */}
            <button
              onClick={() => {
                SoundService.playTap();
                onOpenEmailInspector();
              }}
              className="relative p-2 sm:p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition shrink-0 active:scale-95"
              title="Inspect Notifications & Live Escalations"
            >
              <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-slate-600" />
              {unreadEmailCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[10px] font-black w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center shadow">
                  {unreadEmailCount}
                </span>
              )}
            </button>

            {/* Desktop-only secondary controls */}
            <div className="hidden lg:flex items-center space-x-1.5">
              {/* Audio toggle */}
              <button
                onClick={onToggleSound}
                className={`p-2 sm:p-2.5 rounded-xl border transition active:scale-95 ${
                  soundEnabled
                    ? 'bg-slate-50 text-slate-700 border-slate-200'
                    : 'bg-rose-50 text-rose-600 border-rose-200'
                }`}
                title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
              >
                {soundEnabled ? <Volume2 className="w-4 h-4 text-slate-600" /> : <VolumeX className="w-4 h-4 text-rose-500" />}
              </button>

              {/* Font scale cycle */}
              <button
                onClick={cycleFontSize}
                className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-1 transition active:scale-95"
                title="Adjust readable text size"
              >
                <Type className="w-3.5 h-3.5 text-slate-600" />
                <span className="text-[11px]">
                  {fontSize === 'standard' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
                </span>
              </button>

              {/* High contrast toggle */}
              <button
                onClick={() => {
                  SoundService.playTap();
                  onToggleHighContrast();
                }}
                className={`p-2 rounded-xl border transition active:scale-95 ${
                  highContrast
                    ? 'bg-slate-900 text-amber-400 border-black'
                    : 'bg-slate-50 text-slate-700 border-slate-200'
                }`}
                title="Toggle High-Contrast Senior Mode"
              >
                {highContrast ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
              </button>
            </div>

            {/* Active Role Switcher / PIN Button */}
            <button
              onClick={() => {
                SoundService.playTap();
                onOpenPasscode();
              }}
              className={`flex items-center space-x-1 sm:space-x-2 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl border font-bold text-xs sm:text-sm transition shadow-sm shrink-0 active:scale-95 ${
                roleBadgeStyles[currentRole.role] || 'bg-slate-100 text-slate-800'
              }`}
              title="Switch Care Profile (PIN Required)"
            >
              <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span className="max-w-[80px] sm:max-w-none truncate">{currentRole.label}</span>
              <span className="text-[10px] px-1 py-0.5 rounded bg-black/10 font-mono hidden sm:inline">PIN</span>
            </button>

            {/* Urgent Emergency SOS Pill */}
            <button
              onClick={() => {
                SoundService.playTap();
                onOpenEmergency();
              }}
              className="px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs sm:text-sm flex items-center space-x-1 shadow-sm transition shrink-0 active:scale-95"
              title="Trigger Immediate Emergency SOS"
            >
              <ShieldAlert className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>SOS</span>
            </button>
          </div>
        </div>

        {/* Mobile Secondary Quick Toolbar (Visible on screens < lg) */}
        <div className="lg:hidden py-1.5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600 gap-2">
          {/* Mobile Voice Mic */}
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenVoiceAssistant();
            }}
            className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold border border-emerald-200"
          >
            <Mic className="w-3.5 h-3.5 text-emerald-700 animate-pulse" />
            <span>
              {selectedLanguage === 'hi' ? 'बोलकर बताएं' : selectedLanguage === 'te' ? 'వాయిస్' : 'Voice Assistant'}
            </span>
          </button>

          <div className="flex items-center space-x-1.5">
            {/* Audio Mute Toggle */}
            <button
              onClick={onToggleSound}
              className="p-1.5 rounded-lg border border-slate-200 text-slate-600"
              title={soundEnabled ? 'Mute' : 'Unmute'}
            >
              {soundEnabled ? <Volume2 className="w-3.5 h-3.5" /> : <VolumeX className="w-3.5 h-3.5 text-rose-500" />}
            </button>

            {/* Font Scaler */}
            <button
              onClick={cycleFontSize}
              className="px-2 py-1 rounded-lg border border-slate-200 text-[11px] font-bold text-slate-700"
              title="Font Size"
            >
              Text: {fontSize === 'standard' ? 'A' : fontSize === 'large' ? 'A+' : 'A++'}
            </button>

            {/* High Contrast */}
            <button
              onClick={() => {
                SoundService.playTap();
                onToggleHighContrast();
              }}
              className="p-1.5 rounded-lg border border-slate-200"
              title="High Contrast"
            >
              {highContrast ? <Sun className="w-3.5 h-3.5 text-amber-500" /> : <Moon className="w-3.5 h-3.5 text-slate-600" />}
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
