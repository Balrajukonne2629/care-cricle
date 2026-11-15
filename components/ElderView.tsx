'use client';

import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Volume2,
  Clock,
  AlertCircle,
  Sparkles,
  ShieldAlert,
  Mic,
  Calendar,
  Info,
  Heart,
  Droplets,
  Utensils,
  Sun,
  Sunset,
  Moon,
  ChevronRight,
} from 'lucide-react';
import { Medication, ElderProfile, VitalSign } from '@/lib/types';
import { SpeechService } from '@/lib/speechService';
import SoundService from '@/lib/soundService';

interface ElderViewProps {
  elder: ElderProfile;
  medications: Medication[];
  onTakeDose: (medId: string, time: string) => Promise<void>;
  onTriggerSos: () => void;
  onOpenVoiceAssistant: () => void;
  vitals: VitalSign[];
  fontSize: 'standard' | 'large' | 'extra-large';
}

export default function ElderView({
  elder,
  medications,
  onTakeDose,
  onTriggerSos,
  onOpenVoiceAssistant,
  vitals,
  fontSize,
}: ElderViewProps) {
  const [activeSlot, setActiveSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'As Needed'>('Morning');
  const [wellbeingMood, setWellbeingMood] = useState<string | null>(null);
  const [wellbeingNote, setWellbeingNote] = useState<string>('');
  const [wellbeingSubmitted, setWellbeingSubmitted] = useState<boolean>(false);
  const [isReadingSpeech, setIsReadingSpeech] = useState<boolean>(false);

  // Text scaling classes
  const textTitleClass =
    fontSize === 'extra-large' ? 'text-3xl sm:text-4xl' : fontSize === 'large' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';
  const textBodyClass =
    fontSize === 'extra-large' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';
  const textSubClass =
    fontSize === 'extra-large' ? 'text-base' : fontSize === 'large' ? 'text-sm' : 'text-xs';

  // Read schedule aloud via Text-to-Speech
  const handleReadSchedule = async () => {
    SoundService.playTap();
    setIsReadingSpeech(true);

    const slotMeds = medications.filter(m =>
      m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase())
    );

    let textToSpeak = `Good day, ${elder.preferredName}. For your ${activeSlot} routine, `;

    if (slotMeds.length === 0) {
      textToSpeak += `you have no scheduled pills. Have a restful time!`;
    } else {
      textToSpeak += `you have ${slotMeds.length} items. `;
      slotMeds.forEach((m, idx) => {
        textToSpeak += `Number ${idx + 1}: ${m.name}, dosage ${m.dosage}. ${m.instructions}. `;
      });
      textToSpeak += `Remember to drink plenty of fresh water.`;
    }

    await SpeechService.speak(textToSpeak, {
      rate: 0.86,
      onEnd: () => setIsReadingSpeech(false),
    });
    setIsReadingSpeech(false);
  };

  // Submit daily wellbeing
  const handleSelectMood = async (mood: string) => {
    SoundService.playPillTaken();
    setWellbeingMood(mood);
    setWellbeingSubmitted(true);

    try {
      await fetch('/api/wellbeing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mood, notes: wellbeingNote }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Mark dose as taken with confetti & audio chime
  const handleMarkDose = async (medId: string, scheduledTime: string) => {
    SoundService.playPillTaken();
    await onTakeDose(medId, scheduledTime);

    // Fire joyful confetti
    confetti({
      particleCount: 45,
      spread: 60,
      origin: { y: 0.7 },
      colors: ['#34d399', '#fbbf24', '#60a5fa', '#f472b6'],
    });
  };

  // Pill visual colors
  const pillColorClasses: Record<string, string> = {
    coral: 'bg-rose-400 text-rose-950 border-rose-300',
    gold: 'bg-amber-300 text-amber-950 border-amber-400',
    white: 'bg-slate-100 text-slate-900 border-slate-300 shadow-inner',
    blue: 'bg-sky-400 text-sky-950 border-sky-300',
    mint: 'bg-emerald-400 text-emerald-950 border-emerald-300',
    amber: 'bg-orange-400 text-orange-950 border-orange-300',
    purple: 'bg-purple-300 text-purple-950 border-purple-400',
  };

  // Shape badge render
  const renderPillShape = (shape: string, color: string) => {
    const colorClass = pillColorClasses[color] || 'bg-slate-200 border-slate-300';
    if (shape === 'round') {
      return (
        <div className={`w-8 h-8 rounded-full border-2 shadow-sm flex items-center justify-center font-bold text-[10px] ${colorClass}`}>
          ●
        </div>
      );
    }
    if (shape === 'capsule') {
      return (
        <div className={`w-10 h-6 rounded-full border-2 shadow-sm flex items-center justify-center font-bold text-[10px] ${colorClass}`}>
          💊
        </div>
      );
    }
    // Oval
    return (
      <div className={`w-10 h-6 rounded-[50%] border-2 shadow-sm flex items-center justify-center font-bold text-[10px] ${colorClass}`}>
        ⬯
      </div>
    );
  };

  // Current slot pills
  const filteredMeds = medications.filter(m =>
    m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase())
  );

  const completedCount = filteredMeds.filter(m =>
    m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase() && s.doseTakenToday)
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 px-4 sm:px-6">
      {/* Warm Elder Welcome Banner */}
      <section className="bg-gradient-to-br from-emerald-50 via-teal-50/50 to-amber-50/40 rounded-3xl p-6 sm:p-8 border border-emerald-200/60 shadow-sm relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-semibold mb-1">
              <Sun className="w-5 h-5 text-amber-500 animate-spin-slow" />
              <span className="text-sm tracking-wide uppercase">
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <h1 className={`${textTitleClass} font-extrabold text-slate-900 tracking-tight`}>
              Good day, {elder.preferredName}! 🌸
            </h1>
            <p className={`${textBodyClass} text-slate-600 mt-1 max-w-xl`}>
              Your daughter <strong className="text-slate-800">Sarah</strong> and <strong className="text-slate-800">Nurse David</strong> are connected with your CareCircle today.
            </p>
          </div>

          {/* Quick Voice Assistant Mic Button */}
          <div className="flex flex-col sm:flex-row gap-2.5">
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-800 font-bold border-2 border-emerald-300 shadow-sm transition active:scale-95"
            >
              <Mic className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="text-base">Tap to Speak</span>
            </button>
            <button
              onClick={handleReadSchedule}
              disabled={isReadingSpeech}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl font-bold border transition shadow-sm active:scale-95 ${
                isReadingSpeech
                  ? 'bg-amber-100 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-700 hover:bg-emerald-800 text-white border-emerald-800'
              }`}
            >
              <Volume2 className="w-5 h-5" />
              <span className="text-sm">{isReadingSpeech ? 'Speaking...' : 'Read Aloud'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Daily Wellbeing Mood Check-in */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              How are you feeling right now, {elder.preferredName}?
            </h2>
          </div>
          {wellbeingSubmitted && (
            <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shared with Sarah</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'great', emoji: '🌸', label: 'Feeling Great', color: 'hover:border-emerald-400 bg-emerald-50/60' },
            { id: 'okay', emoji: '🌤️', label: 'Feeling Okay', color: 'hover:border-sky-400 bg-sky-50/60' },
            { id: 'tired', emoji: '☕', label: 'A Bit Tired', color: 'hover:border-amber-400 bg-amber-50/60' },
            { id: 'help', emoji: '💛', label: 'Need Extra Help', color: 'hover:border-rose-400 bg-rose-50/60' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleSelectMood(item.id)}
              className={`p-4 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center space-y-1.5 active:scale-95 ${
                wellbeingMood === item.id
                  ? 'border-emerald-600 bg-emerald-100/80 ring-2 ring-emerald-500/20'
                  : `border-slate-200/80 ${item.color}`
              }`}
            >
              <span className="text-3xl">{item.emoji}</span>
              <span className="font-extrabold text-slate-800 text-sm">{item.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* Routine Time Slot Selector (Morning, Afternoon, Evening, As Needed) */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-slate-900 flex items-center space-x-2">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Medication Schedule</span>
          </h2>
          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            {completedCount} of {filteredMeds.length} taken in this window
          </span>
        </div>

        {/* Tactile Slot Switch Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
          {[
            { id: 'Morning', label: 'Morning', time: '8:00 AM', icon: Sun },
            { id: 'Afternoon', label: 'Afternoon', time: '1:00 PM', icon: Sunset },
            { id: 'Evening', label: 'Evening', time: '7:00 PM', icon: Moon },
            { id: 'As Needed', label: 'As Needed', time: 'PRN', icon: Sparkles },
          ].map(slot => {
            const Icon = slot.icon;
            const isSelected = activeSlot === slot.id;
            return (
              <button
                key={slot.id}
                onClick={() => {
                  SoundService.playTap();
                  setActiveSlot(slot.id as any);
                }}
                className={`p-3.5 rounded-2xl border-2 font-bold transition flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-800 border-emerald-900 text-white shadow-md'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center space-x-1.5">
                  <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-200' : 'text-slate-500'}`} />
                  <span className="text-sm">{slot.label}</span>
                </div>
                <span className={`text-[11px] font-medium ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {slot.time}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of Scheduled Medication Cards */}
        <div className="space-y-3 mt-4">
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <p className="font-bold text-lg text-slate-800">All clear for {activeSlot}!</p>
              <p className="text-sm mt-1">No pending medications in this time slot.</p>
            </div>
          ) : (
            filteredMeds.map(med => {
              const currentSchedule = med.schedules.find(
                s => s.label.toLowerCase() === activeSlot.toLowerCase()
              );
              const isTaken = currentSchedule?.doseTakenToday;

              return (
                <div
                  key={med.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition-all shadow-sm ${
                    isTaken
                      ? 'border-emerald-300/80 bg-emerald-50/20'
                      : 'border-slate-200/90 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    {/* Pill visual & Information */}
                    <div className="flex items-start space-x-4">
                      {/* Pill appearance badge */}
                      <div className="pt-1 flex flex-col items-center space-y-1">
                        {renderPillShape(med.pillShape, med.pillColor)}
                        <span className="text-[10px] uppercase font-bold text-slate-400">
                          {med.pillColor}
                        </span>
                      </div>

                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className={`${textBodyClass} font-extrabold text-slate-900`}>
                            {med.name}
                          </h3>
                          <span className="px-2.5 py-0.5 rounded-lg bg-slate-100 text-slate-800 font-bold text-xs border border-slate-200">
                            {med.dosage}
                          </span>
                          {med.foodRequirement !== 'no-restriction' && (
                            <span className="px-2 py-0.5 rounded-lg bg-amber-50 text-amber-800 font-semibold text-[11px] border border-amber-200 flex items-center space-x-1">
                              <Utensils className="w-3 h-3 text-amber-600" />
                              <span>{med.foodRequirement.replace('-', ' ')}</span>
                            </span>
                          )}
                        </div>

                        <p className={`${textSubClass} text-slate-600 font-medium mt-1`}>
                          <strong>Instructions:</strong> {med.instructions}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-slate-500">
                          <span>For: <strong className="text-slate-700">{med.purpose}</strong></span>
                          <span>•</span>
                          <span>Remaining in bottle: <strong className={med.remainingCount <= med.refillThreshold ? 'text-rose-600 font-bold' : 'text-slate-700'}>{med.remainingCount} pills</strong></span>
                        </div>
                      </div>
                    </div>

                    {/* Action button */}
                    <div className="sm:self-center flex-shrink-0">
                      {isTaken ? (
                        <div className="flex items-center space-x-2 px-4 py-2.5 rounded-2xl bg-emerald-100 text-emerald-800 font-bold border border-emerald-300">
                          <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                          <span className="text-sm">Taken Today</span>
                        </div>
                      ) : (
                        <button
                          onClick={() => handleMarkDose(med.id, currentSchedule?.time || '08:00')}
                          className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-base shadow-md shadow-emerald-600/30 border-b-4 border-emerald-800 active:border-b-0 active:translate-y-1 transition flex items-center justify-center space-x-2"
                        >
                          <CheckCircle2 className="w-5 h-5 text-emerald-200" />
                          <span>Mark as Taken</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Prominent Emergency SOS Footer Action */}
      <section className="bg-rose-50/70 border-2 border-rose-300/80 rounded-3xl p-6 text-center space-y-3">
        <div className="flex items-center justify-center space-x-2 text-rose-700">
          <ShieldAlert className="w-6 h-6 animate-pulse" />
          <h3 className="text-lg font-extrabold uppercase tracking-wide">Emergency Assistance</h3>
        </div>
        <p className="text-sm text-slate-700 max-w-md mx-auto">
          Need immediate help or feeling unwell? Pressing below sends an alert to Sarah, Nurse David, and medical responders.
        </p>
        <button
          onClick={() => {
            SoundService.playTap();
            onTriggerSos();
          }}
          className="px-8 py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-lg tracking-wide uppercase shadow-lg shadow-rose-600/40 border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 transition flex items-center justify-center space-x-3 mx-auto"
        >
          <ShieldAlert className="w-6 h-6" />
          <span>Press for Emergency SOS</span>
        </button>
      </section>
    </div>
  );
}
