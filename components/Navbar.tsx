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
  Languages,
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
    elder: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    family: 'bg-amber-100 text-amber-900 border-amber-300',
    nurse: 'bg-blue-100 text-blue-900 border-blue-300',
    doctor: 'bg-purple-100 text-purple-900 border-purple-300',
  };

  const languageOptions: { code: NativeLanguage; label: string; flag: string }[] = [
    { code: 'hi', label: 'हिन्दी', flag: '🇮🇳' },
    { code: 'te', label: 'తెలుగు', flag: '🇮🇳' },
    { code: 'ta', label: 'தமிழ்', flag: '🇮🇳' },
    { code: 'en', label: 'English', flag: '🌐' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        {/* Brand identity */}
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20">
            <Heart className="w-7 h-7 fill-white/20 stroke-[2.5]" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-extrabold text-2xl tracking-tight text-slate-900">
                Care<span className="text-emerald-700">Circle</span>
              </span>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[11px] font-bold tracking-wider uppercase bg-emerald-50 text-emerald-700 border border-emerald-200">
                India Edition
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium hidden sm:block">
              Smt. Lakshmi Amma • Connected Caregiver Network
            </p>
          </div>
        </div>

        {/* Action Controls & Role Switcher */}
        <div className="flex items-center space-x-2 sm:space-x-2.5">
          {/* Native Language Selector */}
          <div className="flex items-center rounded-xl bg-slate-100 p-0.5 border border-slate-200">
            {languageOptions.map(l => (
              <button
                key={l.code}
                onClick={() => {
                  SoundService.playTap();
                  onSelectLanguage(l.code);
                }}
                className={`px-2 py-1 rounded-lg text-xs font-black transition ${
                  selectedLanguage === l.code
                    ? 'bg-white text-emerald-800 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
                title={`Switch language to ${l.label}`}
              >
                {l.label}
              </button>
            ))}
          </div>

          {/* Quick Voice Assistant Mic Button */}
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenVoiceAssistant();
            }}
            className="flex items-center space-x-2 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 font-bold text-sm transition shadow-sm active:scale-95"
            title="Open Voice Companion"
          >
            <Mic className="w-4 h-4 text-emerald-600 animate-pulse" />
            <span className="hidden lg:inline">
              {selectedLanguage === 'hi' ? 'बोलकर बताएं' : selectedLanguage === 'te' ? 'వాయిస్ సహాయం' : 'Voice Assistant'}
            </span>
          </button>

          {/* Email Inspector / Outbox button */}
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenEmailInspector();
            }}
            className="relative p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 transition active:scale-95"
            title="Inspect Live Notifications & Safety Alerts"
          >
            <Mail className="w-5 h-5 text-slate-600" />
            {unreadEmailCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-amber-500 text-white text-[11px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow">
                {unreadEmailCount}
              </span>
            )}
          </button>

          {/* Audio toggle */}
          <button
            onClick={onToggleSound}
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              soundEnabled
                ? 'bg-slate-50 text-slate-700 border-slate-200'
                : 'bg-rose-50 text-rose-600 border-rose-200'
            }`}
            title={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
          >
            {soundEnabled ? <Volume2 className="w-5 h-5 text-slate-600" /> : <VolumeX className="w-5 h-5 text-rose-500" />}
          </button>

          {/* Font scale cycle */}
          <button
            onClick={cycleFontSize}
            className="px-2.5 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-bold text-xs flex items-center space-x-1 transition active:scale-95"
            title="Adjust readable text size"
          >
            <Type className="w-4 h-4 text-slate-600" />
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
            className={`p-2.5 rounded-xl border transition active:scale-95 ${
              highContrast
                ? 'bg-slate-900 text-amber-400 border-black'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
            title="Toggle High-Contrast Senior Mode"
          >
            {highContrast ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-600" />}
          </button>

          {/* Active Role Selector / PIN Switcher */}
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenPasscode();
            }}
            className={`flex items-center space-x-2 px-3.5 py-2 rounded-xl border font-bold text-sm transition shadow-sm active:scale-95 ${
              roleBadgeStyles[currentRole.role] || 'bg-slate-100 text-slate-800'
            }`}
            title="Switch Care Profile (PIN Required)"
          >
            <UserCheck className="w-4 h-4" />
            <span className="max-w-[120px] sm:max-w-none truncate">{currentRole.label}</span>
            <span className="text-[11px] px-1.5 py-0.5 rounded bg-black/10 font-mono">PIN</span>
          </button>

          {/* Urgent Emergency SOS Pill */}
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenEmergency();
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm flex items-center space-x-1.5 shadow-md shadow-rose-600/30 transition active:scale-95 animate-pulse"
            title="Trigger Immediate Emergency SOS"
          >
            <ShieldAlert className="w-4 h-4" />
            <span>SOS</span>
          </button>
        </div>
      </div>
    </header>
  );
}
