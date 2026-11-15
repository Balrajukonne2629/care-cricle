'use client';

import React, { useState, useEffect } from 'react';
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
  Eye,
  Activity,
  Check,
} from 'lucide-react';
import { Medication, ElderProfile, VitalSign } from '@/lib/types';
import { SpeechService } from '@/lib/speechService';
import SoundService from '@/lib/soundService';
import PillVisual3D from './PillVisual3D';
import PillOrganizer3D from './PillOrganizer3D';
import HydrationTracker from './HydrationTracker';
import MedicationDetailModal from './MedicationDetailModal';

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
  const [wellbeingSubmitted, setWellbeingSubmitted] = useState<boolean>(false);
  const [isReadingSpeech, setIsReadingSpeech] = useState<boolean>(false);
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<Medication | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 30000);
    return () => clearInterval(interval);
  }, []);

  // Text scaling classes
  const textTitleClass =
    fontSize === 'extra-large' ? 'text-3xl sm:text-4xl' : fontSize === 'large' ? 'text-2xl sm:text-3xl' : 'text-xl sm:text-2xl';
  const textBodyClass =
    fontSize === 'extra-large' ? 'text-xl' : fontSize === 'large' ? 'text-lg' : 'text-base';

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
        body: JSON.stringify({ mood }),
      });
    } catch (e) {
      console.error(e);
    }
  };

  // Mark dose as taken with confetti & audio chime
  const handleMarkDose = async (medId: string, scheduledTime: string) => {
    SoundService.playPillTaken();
    await onTakeDose(medId, scheduledTime);

    // Joyful celebratory confetti
    confetti({
      particleCount: 50,
      spread: 70,
      origin: { y: 0.65 },
      colors: ['#10b981', '#f59e0b', '#3b82f6', '#ec4899', '#8b5cf6'],
    });
  };

  // Current slot pills
  const filteredMeds = medications.filter(m =>
    m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase())
  );

  const completedCount = filteredMeds.filter(m =>
    m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase() && s.doseTakenToday)
  ).length;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 px-4 sm:px-6">
      {/* Detail Modal */}
      <MedicationDetailModal
        medication={selectedMedForDetail}
        onClose={() => setSelectedMedForDetail(null)}
      />

      {/* Warm Elder Welcome & Telemetry Header */}
      <section className="glass-panel-elevated rounded-3xl p-6 sm:p-8 border border-emerald-200/80 shadow-md relative overflow-hidden">
        {/* Soft background ambient gradient */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/40 via-emerald-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1 text-xs tracking-wider uppercase">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>
                {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-black">
                {currentTimeStr || 'Morning'}
              </span>
            </div>

            <h1 className={`${textTitleClass} font-black text-slate-900 tracking-tight`}>
              Good day, {elder.preferredName}! 🌸
            </h1>
            <p className={`${textBodyClass} text-slate-600 mt-1 max-w-xl`}>
              Your daughter <strong className="text-slate-800">Sarah</strong> and <strong className="text-slate-800">Nurse David</strong> are connected with your CareCircle today.
            </p>

            {/* Micro Caregiver Live Presence Badge */}
            <div className="flex items-center space-x-2 mt-3 text-xs text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700">
                Sarah checked in 14 minutes ago • All reminders active
              </span>
            </div>
          </div>

          {/* Large Senior Action Buttons (Speak / Read Aloud) */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenVoiceAssistant}
              className="btn-tactile flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold border-2 border-emerald-300 shadow-sm transition active:scale-95"
            >
              <Mic className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="text-base">Tap to Speak</span>
            </button>

            <button
              onClick={handleReadSchedule}
              disabled={isReadingSpeech}
              className={`btn-tactile flex items-center justify-center space-x-2 px-4 py-3.5 rounded-2xl font-extrabold border transition shadow-sm active:scale-95 ${
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

      {/* Smart Weekly Pill Dispenser (Physical Organizer Component) */}
      <PillOrganizer3D
        medications={medications}
        activeSlotName={activeSlot}
        onSelectSlot={(day, slot) => {
          if (['Morning', 'Afternoon', 'Evening', 'As Needed'].includes(slot)) {
            setActiveSlot(slot as any);
          }
        }}
      />

      {/* Daily Wellbeing Mood Check-in */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              How are you feeling right now, {elder.preferredName}?
            </h2>
          </div>
          {wellbeingSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Shared with Sarah</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { id: 'great', emoji: '🌸', label: 'Feeling Great', color: 'hover:border-emerald-400 bg-emerald-50/50' },
            { id: 'okay', emoji: '🌤️', label: 'Feeling Okay', color: 'hover:border-sky-400 bg-sky-50/50' },
            { id: 'tired', emoji: '☕', label: 'A Bit Tired', color: 'hover:border-amber-400 bg-amber-50/50' },
            { id: 'help', emoji: '💛', label: 'Need Extra Help', color: 'hover:border-rose-400 bg-rose-50/50' },
          ].map(item => (
            <button
              key={item.id}
              onClick={() => handleSelectMood(item.id)}
              className={`p-4 rounded-2xl border-2 transition text-center flex flex-col items-center justify-center space-y-1.5 active:scale-95 ${
                wellbeingMood === item.id
                  ? 'border-emerald-600 bg-emerald-100/80 ring-2 ring-emerald-500/20 shadow-sm'
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>Today&apos;s Pill Routine</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
            {completedCount} of {filteredMeds.length} taken in this window
          </span>
        </div>

        {/* Tactile Slot Switch Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
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
                className={`p-3.5 rounded-2xl border-2 font-black transition flex flex-col items-center justify-center space-y-0.5 active:scale-95 ${
                  isSelected
                    ? 'bg-emerald-800 border-emerald-950 text-white shadow-md ring-2 ring-emerald-500/30'
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

        {/* List of Scheduled Medication Cards with 3D Pill Renderers */}
        <div className="space-y-3.5 mt-4">
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center text-slate-500 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h3 className="text-lg font-bold text-slate-800">All Done for {activeSlot}!</h3>
              <p className="text-sm mt-1">No pending pills for this routine window.</p>
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
                  className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken ? 'border-emerald-300/80 bg-emerald-50/20' : 'border-slate-200/90'
                  }`}
                >
                  {/* Left Pill Info with 3D Pill Renderer */}
                  <div className="flex items-center space-x-4">
                    {/* Clickable 3D Pill Preview */}
                    <div
                      onClick={() => {
                        SoundService.playTap();
                        setSelectedMedForDetail(med);
                      }}
                      className="cursor-pointer group flex flex-col items-center justify-center p-2 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition"
                      title="Click to view pill details"
                    >
                      <PillVisual3D
                        shape={med.pillShape}
                        color={med.pillColor}
                        dosage={med.dosage}
                        size="md"
                      />
                      <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-700 mt-1 flex items-center">
                        <Eye className="w-2.5 h-2.5 mr-0.5" /> Details
                      </span>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex items-center space-x-2">
                        <h3 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
                          {med.name}
                        </h3>
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                          {med.dosage}
                        </span>
                      </div>
                      <p className="text-xs sm:text-sm font-semibold text-slate-600">
                        {med.instructions}
                      </p>
                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                        <span className="flex items-center space-x-1 font-medium capitalize">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          <span>{med.foodRequirement.replace('-', ' ')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" />
                          <span>Full water glass</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Tactile Action Button */}
                  <div className="flex items-center space-x-2 self-end sm:self-center">
                    {isTaken ? (
                      <div className="flex items-center space-x-2 px-5 py-3 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-sm border-2 border-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>Taken Today</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkDose(med.id, currentSchedule?.time || '08:00')}
                        className="btn-tactile flex items-center space-x-2.5 px-6 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-base shadow-md transition active:scale-95"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>I Took This Pill</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Daily Hydration Routine */}
      <HydrationTracker initialCount={5} />

      {/* Big Emergency SOS Bar */}
      <section className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 rounded-3xl p-6 border-2 border-rose-300/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              Need Immediate Help or Medical Attention?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              Pressing the emergency beacon alerts Sarah, Nurse David, and local emergency dispatch.
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSos}
          className="btn-tactile shrink-0 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base shadow-lg animate-sos flex items-center justify-center space-x-2"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>Emergency SOS</span>
        </button>
      </section>
    </div>
  );
}
