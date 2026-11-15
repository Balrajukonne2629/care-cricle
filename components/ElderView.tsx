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
  Flame,
} from 'lucide-react';
import { Medication, ElderProfile, VitalSign, NativeLanguage } from '@/lib/types';
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
  selectedLanguage: NativeLanguage;
}

export default function ElderView({
  elder,
  medications,
  onTakeDose,
  onTriggerSos,
  onOpenVoiceAssistant,
  vitals,
  fontSize,
  selectedLanguage,
}: ElderViewProps) {
  const [activeSlot, setActiveSlot] = useState<'Morning' | 'Afternoon' | 'Evening' | 'As Needed'>('Morning');
  const [wellbeingMood, setWellbeingMood] = useState<string | null>(null);
  const [wellbeingSubmitted, setWellbeingSubmitted] = useState<boolean>(false);
  const [isReadingSpeech, setIsReadingSpeech] = useState<boolean>(false);
  const [speakingPillId, setSpeakingPillId] = useState<string | null>(null);
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<Medication | null>(null);
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');

  // Update clock
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTimeStr(
        now.toLocaleTimeString('en-IN', { hour: 'numeric', minute: '2-digit', hour12: true })
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

  // Localized greetings
  const greetingText: Record<NativeLanguage, { greeting: string; familyNote: string; speakBtn: string; readAllBtn: string }> = {
    hi: {
      greeting: `नमस्ते, ${elder.preferredName}! 🌸`,
      familyNote: 'आपके सुपुत्र राजेश और सिस्टर कविता आपकी देखभाल से जुड़े हैं।',
      speakBtn: 'माइक दबाकर बोलें',
      readAllBtn: 'पूरी दिनचर्या सुनें',
    },
    te: {
      greeting: `నమస్కారం, ${elder.preferredName}! 🌸`,
      familyNote: 'మీ కుమారుడు రాజేష్ మరియు సిస్టర్ కవిత మీ ఆరోగ్యాన్ని గమనిస్తున్నారు.',
      speakBtn: 'మాట్లాడటానికి నొక్కండి',
      readAllBtn: 'మొత్తం మందులు వినండి',
    },
    ta: {
      greeting: `வணக்கம், ${elder.preferredName}! 🌸`,
      familyNote: 'உங்கள் மகன் ராஜேஷ் மற்றும் செவிலியர் கவிதா உங்களுடன் தொடர்பில் உள்ளனர்.',
      speakBtn: 'பேச அழுத்தவும்',
      readAllBtn: 'அட்டவணையை கேளுங்கள்',
    },
    en: {
      greeting: `Namaste, ${elder.preferredName}! 🌸`,
      familyNote: 'Your son Rajesh and Nurse Sister Kavitha are actively connected today.',
      speakBtn: 'Tap to Speak',
      readAllBtn: 'Read Routine Aloud',
    },
  };

  const currentStrings = greetingText[selectedLanguage] || greetingText.en;

  // Speak single pill details aloud in native language
  const handleSpeakPill = async (med: Medication) => {
    SoundService.playTap();
    setSpeakingPillId(med.id);

    let textToSpeak = med.voiceDescriptionEnglish || `${med.name}. ${med.instructions}`;
    if (selectedLanguage === 'hi' && med.voiceDescriptionHindi) {
      textToSpeak = med.voiceDescriptionHindi;
    } else if (selectedLanguage === 'te' && med.voiceDescriptionTelugu) {
      textToSpeak = med.voiceDescriptionTelugu;
    } else if (selectedLanguage === 'ta' && med.voiceDescriptionTamil) {
      textToSpeak = med.voiceDescriptionTamil;
    }

    await SpeechService.speak(textToSpeak, {
      lang: selectedLanguage,
      rate: 0.84,
      onEnd: () => setSpeakingPillId(null),
    });
    setSpeakingPillId(null);
  };

  // Read schedule aloud via Text-to-Speech in selected Indian language
  const handleReadSchedule = async () => {
    SoundService.playTap();
    setIsReadingSpeech(true);

    const slotMeds = medications.filter(m =>
      m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase())
    );

    let textToSpeak = '';
    if (selectedLanguage === 'hi') {
      textToSpeak = `नमस्ते लक्ष्मी अम्मा! आपके ${activeSlot === 'Morning' ? 'सुबह' : activeSlot === 'Afternoon' ? 'दोपहर' : 'शाम'} के समय `;
      if (slotMeds.length === 0) {
        textToSpeak += 'कोई दवा नहीं है। आप आराम करें!';
      } else {
        textToSpeak += `कुल ${slotMeds.length} दवाइयां हैं। `;
        slotMeds.forEach((m, idx) => {
          textToSpeak += `दवा नंबर ${idx + 1}: ${m.name}, खुराक ${m.dosage}। ${m.instructions}। `;
        });
        textToSpeak += 'दवा के साथ गुनगुना पानी जरूर पिएं।';
      }
    } else if (selectedLanguage === 'te') {
      textToSpeak = `నమస్కారం లక్ష్మి అమ్మా! మీ ${activeSlot === 'Morning' ? 'ఉదయం' : activeSlot === 'Afternoon' ? 'మధ్యాహ్నం' : 'రాత్రి'} సమయానికి `;
      if (slotMeds.length === 0) {
        textToSpeak += 'ఏ మందులు లేవు. విశ్రాంతి తీసుకోండి!';
      } else {
        textToSpeak += `మొత్తం ${slotMeds.length} మందులు ఉన్నాయి. `;
        slotMeds.forEach((m, idx) => {
          textToSpeak += `మందు ${idx + 1}: ${m.name}, మోతాదు ${m.dosage}। ${m.instructions}। `;
        });
        textToSpeak += 'మంచినీళ్లు తాగడం మరచిపోకండి.';
      }
    } else {
      textToSpeak = `Namaste ${elder.preferredName}. For your ${activeSlot} schedule, `;
      if (slotMeds.length === 0) {
        textToSpeak += 'you have no scheduled medicines. Have a restful time!';
      } else {
        textToSpeak += `you have ${slotMeds.length} items. `;
        slotMeds.forEach((m, idx) => {
          textToSpeak += `Pill ${idx + 1}: ${m.name}, dosage ${m.dosage}. ${m.instructions}. `;
        });
        textToSpeak += 'Remember to drink a glass of water.';
      }
    }

    await SpeechService.speak(textToSpeak, {
      lang: selectedLanguage,
      rate: 0.84,
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

    // Audio celebration confirmation in native language
    const successMsg =
      selectedLanguage === 'hi'
        ? 'शाबाश अम्मा! आपने दवा ले ली है।'
        : selectedLanguage === 'te'
        ? 'చాలా మంచిది అమ్మా! మీరు మందు తీసుకున్నారు.'
        : 'Very good! Medicine marked as taken.';

    SpeechService.speak(successMsg, { lang: selectedLanguage, rate: 0.88 });

    // Joyful celebratory confetti
    confetti({
      particleCount: 55,
      spread: 75,
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
        <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-br from-amber-100/40 via-emerald-100/30 to-transparent rounded-full blur-2xl pointer-events-none" />

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-emerald-800 font-bold mb-1 text-xs tracking-wider uppercase">
              <Sun className="w-4 h-4 text-amber-500 animate-spin-slow" />
              <span>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span className="text-slate-300">•</span>
              <span className="text-emerald-700 bg-emerald-100/80 px-2 py-0.5 rounded-full font-black">
                {currentTimeStr || 'Morning'}
              </span>
            </div>

            <h1 className={`${textTitleClass} font-black text-slate-900 tracking-tight`}>
              {currentStrings.greeting}
            </h1>
            <p className={`${textBodyClass} text-slate-600 mt-1 max-w-xl`}>
              {currentStrings.familyNote}
            </p>

            <div className="flex items-center space-x-2 mt-3 text-xs text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              <span className="font-semibold text-slate-700">
                Rajesh checked in from office • All schedules synchronized
              </span>
            </div>
          </div>

          {/* Large Action Buttons (Voice Mic + Read Aloud) */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenVoiceAssistant}
              className="btn-tactile flex items-center justify-center space-x-2.5 px-5 py-3.5 rounded-2xl bg-white hover:bg-emerald-50 text-emerald-900 font-extrabold border-2 border-emerald-300 shadow-sm transition active:scale-95"
            >
              <Mic className="w-5 h-5 text-emerald-600 animate-pulse" />
              <span className="text-base">{currentStrings.speakBtn}</span>
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
              <span className="text-sm">{isReadingSpeech ? 'सुना रहे हैं...' : currentStrings.readAllBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Smart Weekly Pill Dispenser */}
      <PillOrganizer3D
        medications={medications}
        activeSlotName={activeSlot}
        onSelectSlot={(day, slot) => {
          if (['Morning', 'Afternoon', 'Evening', 'As Needed'].includes(slot)) {
            setActiveSlot(slot as any);
          }
        }}
      />

      {/* Daily Wellbeing Mood Check-in in Native Language */}
      <section className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <Heart className="w-5 h-5 text-rose-500 fill-rose-100" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 tracking-tight">
              {selectedLanguage === 'hi'
                ? `अम्मा, आप अभी कैसा महसूस कर रही हैं?`
                : selectedLanguage === 'te'
                ? `అమ్మా, మీరు ఇప్పుడు ఎలా ఉన్నారు?`
                : `How are you feeling right now, ${elder.preferredName}?`}
            </h2>
          </div>
          {wellbeingSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 flex items-center space-x-1 border border-emerald-200">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Rajesh ko update ho gaya</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            {
              id: 'great',
              emoji: '🌸',
              labelHi: 'बहुत अच्छा',
              labelTe: 'చాలా బాగున్నా',
              labelEn: 'Feeling Great',
              color: 'hover:border-emerald-400 bg-emerald-50/50',
            },
            {
              id: 'okay',
              emoji: '🌤️',
              labelHi: 'बिल्कुल ठीक',
              labelTe: 'బాగున్నాను',
              labelEn: 'Feeling Okay',
              color: 'hover:border-sky-400 bg-sky-50/50',
            },
            {
              id: 'tired',
              emoji: '☕',
              labelHi: 'थोड़ी थकान',
              labelTe: 'కొద్దిగా అలసట',
              labelEn: 'A Bit Tired',
              color: 'hover:border-amber-400 bg-amber-50/50',
            },
            {
              id: 'help',
              emoji: '💛',
              labelHi: 'मदद चाहिए',
              labelTe: 'సహాయం కావాలి',
              labelEn: 'Need Extra Help',
              color: 'hover:border-rose-400 bg-rose-50/50',
            },
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
              <span className="font-extrabold text-slate-800 text-sm">
                {selectedLanguage === 'hi' ? item.labelHi : selectedLanguage === 'te' ? item.labelTe : item.labelEn}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* Routine Time Slot Selector */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-xl font-black text-slate-900 flex items-center space-x-2 tracking-tight">
            <Clock className="w-5 h-5 text-emerald-600" />
            <span>
              {selectedLanguage === 'hi'
                ? 'आज की दवाइयां'
                : selectedLanguage === 'te'
                ? 'ఈ రోజు మందుల సమయం'
                : "Today's Pill Routine"}
            </span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
            {completedCount} of {filteredMeds.length} taken
          </span>
        </div>

        {/* Tactile Slot Switch Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { id: 'Morning', label: 'सुबह (Morning)', time: '08:00 AM', icon: Sun },
            { id: 'Afternoon', label: 'दोपहर (Noon)', time: '01:30 PM', icon: Sunset },
            { id: 'Evening', label: 'शाम (Evening)', time: '07:30 PM', icon: Flame },
            { id: 'As Needed', label: 'रात (Night/Bed)', time: '09:30 PM', icon: Moon },
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
                  <span className="text-xs sm:text-sm">{slot.label}</span>
                </div>
                <span className={`text-[11px] font-medium ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {slot.time}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of Scheduled Medication Cards with 3D Pill & Big Voice Button */}
        <div className="space-y-4 mt-4">
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-3xl p-8 border border-dashed border-slate-300 text-center text-slate-500 shadow-sm">
              <CheckCircle2 className="w-12 h-12 text-emerald-500 mx-auto mb-2 opacity-80" />
              <h3 className="text-lg font-bold text-slate-800">
                {selectedLanguage === 'hi' ? 'इस समय की सभी दवाइयां पूरी हैं!' : 'All Done for this time!'}
              </h3>
              <p className="text-sm mt-1">No pending pills for this routine window.</p>
            </div>
          ) : (
            filteredMeds.map(med => {
              const currentSchedule = med.schedules.find(
                s => s.label.toLowerCase() === activeSlot.toLowerCase()
              );
              const isTaken = currentSchedule?.doseTakenToday;
              const isSpeakingThis = speakingPillId === med.id;

              // Visual tag by color/shape
              const visualTag =
                selectedLanguage === 'hi'
                  ? med.visualTagHindi || `${med.pillColor} ${med.pillShape}`
                  : selectedLanguage === 'te'
                  ? med.visualTagTelugu || `${med.pillColor} ${med.pillShape}`
                  : `${med.pillColor.toUpperCase()} ${med.pillShape.toUpperCase()}`;

              return (
                <div
                  key={med.id}
                  className={`bg-white rounded-3xl p-5 sm:p-6 border-2 transition shadow-sm hover:shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken ? 'border-emerald-300/80 bg-emerald-50/20' : 'border-slate-200/90'
                  }`}
                >
                  {/* Left Pill Info with 3D Pill Renderer & Voice Speaker */}
                  <div className="flex items-start sm:items-center space-x-4">
                    {/* Clickable 3D Pill Preview */}
                    <div
                      onClick={() => {
                        SoundService.playTap();
                        setSelectedMedForDetail(med);
                      }}
                      className="cursor-pointer group flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shrink-0"
                      title="Click to view pill details"
                    >
                      <PillVisual3D
                        shape={med.pillShape}
                        color={med.pillColor}
                        dosage={med.dosage}
                        size="md"
                      />
                      <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-700 mt-1 flex items-center">
                        <Eye className="w-2.5 h-2.5 mr-0.5" /> विवरण
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      {/* Prominent Visual Color Badge (Elder Friendly) */}
                      <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full text-xs font-black bg-amber-100 text-amber-950 border border-amber-300">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block" />
                        <span>{visualTag}</span>
                      </div>

                      <div className="flex items-center space-x-2 pt-0.5">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight">
                          {med.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded-full text-xs font-black bg-slate-100 text-slate-800 border border-slate-200">
                          {med.dosage}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm font-semibold text-slate-700">
                        {med.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-1">
                        <span className="flex items-center space-x-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md">
                          <Utensils className="w-3.5 h-3.5 text-amber-600" />
                          <span>{med.foodRequirement.replace('-', ' ')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <Droplets className="w-3.5 h-3.5 text-sky-600" />
                          <span>ताज़ा पानी (Fresh Water)</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Native Voice Speaker Button + Mark Taken */}
                  <div className="flex items-center space-x-2.5 self-end sm:self-center shrink-0">
                    {/* Instant Audio Speaker Button for this pill */}
                    <button
                      onClick={() => handleSpeakPill(med)}
                      className={`btn-tactile p-3.5 rounded-2xl border-2 font-bold transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 ${
                        isSpeakingThis
                          ? 'bg-amber-100 border-amber-400 text-amber-950 animate-pulse'
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                      }`}
                      title="दवा की जानकारी आवाज में सुनें (Listen in mother tongue)"
                    >
                      <Volume2 className="w-5 h-5 text-emerald-700" />
                      <span className="text-xs font-black hidden md:inline">
                        {isSpeakingThis ? 'सुना रहे हैं...' : 'दवा सुनो 🔊'}
                      </span>
                    </button>

                    {isTaken ? (
                      <div className="flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-emerald-100 text-emerald-900 font-extrabold text-sm border-2 border-emerald-300">
                        <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                        <span>ले ली (Taken)</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkDose(med.id, currentSchedule?.time || '08:00')}
                        className="btn-tactile flex items-center space-x-2 px-5 py-3.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm sm:text-base shadow-md transition active:scale-95"
                      >
                        <Check className="w-5 h-5 stroke-[3]" />
                        <span>मैंने दवा ले ली</span>
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

      {/* Emergency SOS Bar */}
      <section className="bg-gradient-to-r from-rose-50 via-red-50 to-amber-50 rounded-3xl p-6 border-2 border-rose-300/80 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-slate-900">
              आपातकालीन सहायता (Emergency SOS)?
            </h3>
            <p className="text-xs sm:text-sm text-slate-600">
              लाल बटन दबाने पर राजेश, सिस्टर कविता और अपोलो इमरजेंसी को तुरंत संदेश चला जाएगा।
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSos}
          className="btn-tactile shrink-0 px-6 py-3.5 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-base shadow-lg animate-sos flex items-center justify-center space-x-2"
        >
          <ShieldAlert className="w-5 h-5" />
          <span>आपातकाल SOS</span>
        </button>
      </section>
    </div>
  );
}
