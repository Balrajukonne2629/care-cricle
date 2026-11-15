'use client';

import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Volume2,
  Clock,
  AlertCircle,
  ShieldAlert,
  Mic,
  Calendar,
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
  Stethoscope,
  HeartPulse,
  UserCheck,
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

  // Comprehensive localized UI text dictionary for ALL languages
  const uiText: Record<
    NativeLanguage,
    {
      greeting: string;
      familyNote: string;
      speakBtn: string;
      readAllBtn: string;
      readingBtn: string;
      wellbeingQuestion: string;
      wellbeingUpdated: string;
      routineTitle: string;
      listenBtn: string;
      speakingBtn: string;
      markTakenBtn: string;
      takenBadge: string;
      waterNote: string;
      viewDetails: string;
      allDoneForSlot: string;
      noPendingSlot: string;
      sosTitle: string;
      sosSub: string;
      sosBtn: string;
      slots: Record<string, { label: string; time: string }>;
      moods: { id: string; label: string; sub: string }[];
    }
  > = {
    hi: {
      greeting: `नमस्ते, ${elder.preferredName}`,
      familyNote: 'सुपुत्र राजेश (हाइटेक सिटी) और सिस्टर कविता (अपोलो होमकेयर) आपकी देखभाल से जुड़े हैं।',
      speakBtn: 'माइक दबाकर बोलें',
      readAllBtn: 'पूरी दिनचर्या सुनें',
      readingBtn: 'सुना रहे हैं...',
      wellbeingQuestion: 'अम्मा, आप अभी कैसा महसूस कर रही हैं?',
      wellbeingUpdated: 'राजेश को सूचना भेज दी गई है',
      routineTitle: 'आज की दवाइयां (Daily Schedule)',
      listenBtn: 'दवा सुनो',
      speakingBtn: 'सुना रहे हैं...',
      markTakenBtn: 'मैंने दवा ले ली',
      takenBadge: 'ले ली (Taken)',
      waterNote: 'ताज़ा पानी के साथ',
      viewDetails: 'दवा विवरण',
      allDoneForSlot: 'इस समय की सभी दवाइयां पूरी हैं!',
      noPendingSlot: 'इस समय कोई दवा बाकी नहीं है। आराम करें।',
      sosTitle: 'आपातकालीन सहायता (Emergency SOS)',
      sosSub: 'लाल बटन दबाने पर राजेश, सिस्टर कविता और अपोलो इमरजेंसी को तुरंत सूचना भेजी जाएगी।',
      sosBtn: 'आपातकाल SOS',
      slots: {
        Morning: { label: 'सुबह (Morning)', time: '08:00 AM' },
        Afternoon: { label: 'दोपहर (Noon)', time: '01:30 PM' },
        Evening: { label: 'शाम (Evening)', time: '07:30 PM' },
        'As Needed': { label: 'रात (Bedtime)', time: '09:30 PM' },
      },
      moods: [
        { id: 'great', label: 'बहुत अच्छा', sub: 'ऊर्जावान और सामान्य' },
        { id: 'okay', label: 'बिल्कुल ठीक', sub: 'दैनिक दिनचर्या ठीक है' },
        { id: 'tired', label: 'थोड़ी थकान', sub: 'विश्राम की आवश्यकता' },
        { id: 'help', label: 'सहायता चाहिए', sub: 'केयरगिवर को बुलाएं' },
      ],
    },
    te: {
      greeting: `నమస్కారం, ${elder.preferredName}`,
      familyNote: 'మీ కుమారుడు రాజేష్ మరియు సిస్టర్ కవిత మీ ఆరోగ్యాన్ని పర్యవేక్షిస్తున్నారు.',
      speakBtn: 'వాయిస్ సహాయం',
      readAllBtn: 'మొత్తం మందులు వినండి',
      readingBtn: 'వినిపిస్తోంది...',
      wellbeingQuestion: 'లక్ష్మి అమ్మా, మీరు ఇప్పుడు ఎలా ఉన్నారు?',
      wellbeingUpdated: 'రాజేష్ గారికి సమాచారం చేరింది',
      routineTitle: 'ఈ రోజు మందుల పట్టిక (Daily Routine)',
      listenBtn: 'మందు వినండి',
      speakingBtn: 'వినిపిస్తోంది...',
      markTakenBtn: 'మందు తీసుకున్నాను',
      takenBadge: 'తీసుకున్నారు (Taken)',
      waterNote: 'మంచినీళ్లతో',
      viewDetails: 'వివరాలు',
      allDoneForSlot: 'ఈ సమయానికి మందులు పూర్తయ్యాయి!',
      noPendingSlot: 'ఈ సమయానికి ఏ మందులు లేవు. విశ్రాంతి తీసుకోండి.',
      sosTitle: 'అత్యవసర సహాయం (Emergency SOS)',
      sosSub: 'ఈ బటన్ నొక్కితే కుమారుడు రాజేష్ మరియు అపోలో ఎమర్జెన్సీకి వెంటనే సమాచారం వెళ్తుంది.',
      sosBtn: 'అత్యవసర SOS',
      slots: {
        Morning: { label: 'ఉదయం (Morning)', time: '08:00 AM' },
        Afternoon: { label: 'మధ్యాహ్నం (Noon)', time: '01:30 PM' },
        Evening: { label: 'సాయంత్రం (Evening)', time: '07:30 PM' },
        'As Needed': { label: 'రాత్రి (Bedtime)', time: '09:30 PM' },
      },
      moods: [
        { id: 'great', label: 'చాలా బాగున్నా', sub: 'ఆరోగ్యంగా ఉన్నాను' },
        { id: 'okay', label: 'బాగున్నాను', sub: 'సాధారణంగా ఉంది' },
        { id: 'tired', label: 'కొద్దిగా అలసట', sub: 'విశ్రాంతి అవసరం' },
        { id: 'help', label: 'సహాయం కావాలి', sub: 'కేర్‌గివర్‌ని పిలవండి' },
      ],
    },
    ta: {
      greeting: `வணக்கம், ${elder.preferredName}`,
      familyNote: 'உங்கள் மகன் ராஜேஷ் மற்றும் செவிலியர் கவிதா உங்களுடன் தொடர்பில் உள்ளனர்.',
      speakBtn: 'குரல் உதவி',
      readAllBtn: 'மருந்துகளைக் கேளுங்கள்',
      readingBtn: 'ஒலிக்கிறது...',
      wellbeingQuestion: 'அம்மா, இப்போது உங்கள் உடல்நிலை எப்படி உள்ளது?',
      wellbeingUpdated: 'ராஜேஷுக்கு தகவல் அனுப்பப்பட்டது',
      routineTitle: 'இன்றைய மருந்துகள் (Daily Routine)',
      listenBtn: 'கேளுங்கள்',
      speakingBtn: 'ஒலிக்கிறது...',
      markTakenBtn: 'மருந்து எடுத்தேன்',
      takenBadge: 'எடுத்தாயிற்று (Taken)',
      waterNote: 'குடிநீருடன்',
      viewDetails: 'விவரங்கள்',
      allDoneForSlot: 'இந்த நேர மருந்துகள் முடிந்தது!',
      noPendingSlot: 'இப்போது மருந்துகள் எதுவும் இல்லை. ஓய்வெடுங்கள்.',
      sosTitle: 'அவசர உதவி (Emergency SOS)',
      sosSub: 'சிவப்பு பொத்தானை அழுத்தினால் ராஜேஷ், செவிலியர் மற்றும் மருத்துவமனைக்கு தகவல் செல்லும்.',
      sosBtn: 'அவசர SOS',
      slots: {
        Morning: { label: 'காலை (Morning)', time: '08:00 AM' },
        Afternoon: { label: 'மதியம் (Noon)', time: '01:30 PM' },
        Evening: { label: 'மாலை (Evening)', time: '07:30 PM' },
        'As Needed': { label: 'இரவு (Bedtime)', time: '09:30 PM' },
      },
      moods: [
        { id: 'great', label: 'மிகவும் நன்று', sub: 'ஆரோக்கியமாக உள்ளேன்' },
        { id: 'okay', label: 'நன்றாக உள்ளது', sub: 'வழக்கமான நிலை' },
        { id: 'tired', label: 'சிறிது சோர்வு', sub: 'ஓய்வு தேவை' },
        { id: 'help', label: 'உதவி தேவை', sub: 'குடும்பத்தினரை அழையுங்கள்' },
      ],
    },
    en: {
      greeting: `Namaste, ${elder.preferredName}`,
      familyNote: 'Your son Rajesh (HITEC City) and Nurse Sister Kavitha (Apollo HomeCare) are actively connected.',
      speakBtn: 'Voice Assistant',
      readAllBtn: 'Read Routine Aloud',
      readingBtn: 'Reading Aloud...',
      wellbeingQuestion: `How are you feeling right now, ${elder.preferredName}?`,
      wellbeingUpdated: 'Care circle notified in real time',
      routineTitle: "Today's Medication Routine",
      listenBtn: 'Listen',
      speakingBtn: 'Speaking...',
      markTakenBtn: 'Mark as Taken',
      takenBadge: 'Taken',
      waterNote: 'With fresh water',
      viewDetails: 'Details',
      allDoneForSlot: 'All Scheduled Doses Completed!',
      noPendingSlot: 'No scheduled medications for this window. Have a restful time.',
      sosTitle: 'Emergency SOS Assistance',
      sosSub: 'Instantly alerts son Rajesh, Sister Kavitha, and Apollo Hospitals Emergency Dispatch.',
      sosBtn: 'Emergency SOS',
      slots: {
        Morning: { label: 'Morning', time: '08:00 AM' },
        Afternoon: { label: 'Afternoon', time: '01:30 PM' },
        Evening: { label: 'Evening', time: '07:30 PM' },
        'As Needed': { label: 'Bedtime', time: '09:30 PM' },
      },
      moods: [
        { id: 'great', label: 'Feeling Great', sub: 'Energetic & comfortable' },
        { id: 'okay', label: 'Feeling Okay', sub: 'Normal daily routine' },
        { id: 'tired', label: 'Mild Fatigue', sub: 'Extra rest recommended' },
        { id: 'help', label: 'Need Assistance', sub: 'Alert care circle' },
      ],
    },
  };

  const currentStrings = uiText[selectedLanguage] || uiText.en;

  // Speak single pill details aloud in native language
  const handleSpeakPill = async (med: Medication) => {
    SoundService.playTap();
    setSpeakingPillId(med.id);

    let textToSpeak = med.voiceDescriptionEnglish || `${med.name}. ${med.instructions}`;
    let phoneticFallback: string | undefined = undefined;

    if (selectedLanguage === 'hi' && med.voiceDescriptionHindi) {
      textToSpeak = med.voiceDescriptionHindi;
    } else if (selectedLanguage === 'te') {
      textToSpeak = med.voiceDescriptionTelugu || med.voiceDescriptionEnglish || `${med.name}. ${med.instructions}`;
      phoneticFallback = med.voiceDescriptionTeluguPhonetic;
    } else if (selectedLanguage === 'ta') {
      textToSpeak = med.voiceDescriptionTamil || med.voiceDescriptionEnglish || `${med.name}. ${med.instructions}`;
      phoneticFallback = med.voiceDescriptionTamilPhonetic;
    }

    await SpeechService.speak(textToSpeak, {
      lang: selectedLanguage,
      phoneticFallbackText: phoneticFallback,
      rate: 0.88,
      onEnd: () => setSpeakingPillId(null),
    });
    setSpeakingPillId(null);
  };

  // Read entire slot schedule aloud via Text-to-Speech
  const handleReadSchedule = async () => {
    SoundService.playTap();
    setIsReadingSpeech(true);

    const slotMeds = medications.filter(m =>
      m.schedules.some(s => s.label.toLowerCase() === activeSlot.toLowerCase())
    );

    let textToSpeak = '';
    let phoneticFallback: string | undefined = undefined;

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
      textToSpeak = `నమస్కారం లక్ష్మి అమ్మా! మీ ${activeSlot === 'Morning' ? 'ఉదయం' : activeSlot === 'Afternoon' ? 'మధ్యాహ్నం' : 'రాత్రి'} సమయానికి ${slotMeds.length} మందులు ఉన్నాయి. ` +
        slotMeds.map((m, idx) => `మందు ${idx + 1}: ${m.name}. ${m.instructions}.`).join(' ') +
        ` మంచినీళ్లు తాగడం మరచిపోకండి.`;

      phoneticFallback = `Namaskaram Lakshmi Amma! Mee ${activeSlot} schedule lo ${slotMeds.length} mandulu unnayi. ` +
        slotMeds.map((m, idx) => `Goli ${idx + 1}: ${m.name}. ${m.instructions}.`).join(' ') +
        ` Neellatho teesukondi.`;
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
      phoneticFallbackText: phoneticFallback,
      rate: 0.88,
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

  // Mark dose as taken with audio confirmation
  const handleMarkDose = async (medId: string, scheduledTime: string) => {
    SoundService.playPillTaken();
    await onTakeDose(medId, scheduledTime);

    let successMsg = 'Very good! Medicine marked as taken.';
    let phoneticFallback: string | undefined = undefined;

    if (selectedLanguage === 'hi') {
      successMsg = 'शाबाश अम्मा! आपने दवा ले ली है।';
    } else if (selectedLanguage === 'te') {
      successMsg = 'చాలా మంచిది అమ్మా! మీరు మందు తీసుకున్నారు.';
      phoneticFallback = 'Chala manchidi Amma! Meeru mandu teesukunnaru.';
    }

    SpeechService.speak(successMsg, {
      lang: selectedLanguage,
      phoneticFallbackText: phoneticFallback,
      rate: 0.88,
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
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Detail Modal */}
      <MedicationDetailModal
        medication={selectedMedForDetail}
        onClose={() => setSelectedMedForDetail(null)}
      />

      {/* Dignified Clinical Elder Welcome & Caregiver Sync Header */}
      <section className="bg-white rounded-2xl p-6 sm:p-7 border border-slate-200/90 shadow-sm relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 relative z-10">
          <div>
            <div className="flex items-center space-x-2 text-slate-500 font-semibold mb-1 text-xs tracking-wider uppercase">
              <Calendar className="w-3.5 h-3.5 text-emerald-700" />
              <span>
                {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
              </span>
              <span>•</span>
              <span className="text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md font-bold">
                {currentTimeStr || '08:00 AM'}
              </span>
            </div>

            <h1 className={`${textTitleClass} font-extrabold text-slate-900 tracking-tight`}>
              {currentStrings.greeting}
            </h1>
            <p className={`${textBodyClass} text-slate-600 mt-1 max-w-xl`}>
              {currentStrings.familyNote}
            </p>

            <div className="flex items-center space-x-2 mt-3 text-xs text-slate-500">
              <span className="flex h-2 w-2 rounded-full bg-emerald-600 inline-block" />
              <span className="font-semibold text-slate-700">
                Rajesh connected from HITEC City • Sister Kavitha on call (Apollo HomeCare)
              </span>
            </div>
          </div>

          {/* Action Buttons: Voice Mic + Read Aloud */}
          <div className="flex flex-col sm:flex-row gap-2.5 shrink-0">
            <button
              onClick={onOpenVoiceAssistant}
              className="flex items-center justify-center space-x-2 px-4 py-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-bold border border-emerald-300 shadow-sm transition active:scale-95"
            >
              <Mic className="w-4 h-4 text-emerald-700 animate-pulse" />
              <span className="text-sm">{currentStrings.speakBtn}</span>
            </button>

            <button
              onClick={handleReadSchedule}
              disabled={isReadingSpeech}
              className={`flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-bold border transition shadow-sm active:scale-95 ${
                isReadingSpeech
                  ? 'bg-amber-50 text-amber-900 border-amber-300 animate-pulse'
                  : 'bg-emerald-800 hover:bg-emerald-900 text-white border-emerald-900'
              }`}
            >
              <Volume2 className="w-4 h-4" />
              <span className="text-sm">{isReadingSpeech ? currentStrings.readingBtn : currentStrings.readAllBtn}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Weekly Prescription Schedule Bar */}
      <PillOrganizer3D
        medications={medications}
        activeSlotName={activeSlot}
        onSelectSlot={(day, slot) => {
          if (['Morning', 'Afternoon', 'Evening', 'As Needed'].includes(slot)) {
            setActiveSlot(slot as any);
          }
        }}
      />

      {/* Daily Clinical Wellbeing Check-in */}
      <section className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2 pb-3 border-b border-slate-100">
          <div className="flex items-center space-x-2.5">
            <div className="w-9 h-9 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-center text-rose-700">
              <HeartPulse className="w-4 h-4 text-rose-600" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900 tracking-tight">
                {currentStrings.wellbeingQuestion}
              </h2>
              <p className="text-xs text-slate-500">
                Recorded for Dr. K. S. Rao (Apollo Hospitals) & family visibility.
              </p>
            </div>
          </div>
          {wellbeingSubmitted && (
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 flex items-center space-x-1 border border-emerald-200 self-start sm:self-auto">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{currentStrings.wellbeingUpdated}</span>
            </span>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {currentStrings.moods.map(item => {
            const isSelected = wellbeingMood === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelectMood(item.id)}
                className={`p-3.5 rounded-xl border text-left transition flex flex-col justify-between space-y-1 ${
                  isSelected
                    ? 'border-emerald-800 bg-emerald-50/70 ring-1 ring-emerald-800 shadow-sm'
                    : 'border-slate-200 bg-slate-50/50 hover:bg-slate-50 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900 text-sm">{item.label}</span>
                  {isSelected && <Check className="w-4 h-4 text-emerald-700 stroke-[3]" />}
                </div>
                <span className="text-[11px] text-slate-500">{item.sub}</span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Routine Time Slot Selector & Pill Cards */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <h2 className="text-lg font-bold text-slate-900 flex items-center space-x-2 tracking-tight">
            <Clock className="w-5 h-5 text-emerald-700" />
            <span>{currentStrings.routineTitle}</span>
          </h2>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full border border-slate-200 self-start sm:self-auto">
            {completedCount} of {filteredMeds.length} Taken
          </span>
        </div>

        {/* Tactile Slot Switch Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {(['Morning', 'Afternoon', 'Evening', 'As Needed'] as const).map(slotId => {
            const slotInfo = currentStrings.slots[slotId] || { label: slotId, time: '' };
            const isSelected = activeSlot === slotId;
            return (
              <button
                key={slotId}
                onClick={() => {
                  SoundService.playTap();
                  setActiveSlot(slotId);
                }}
                className={`p-3 rounded-xl border font-bold transition flex flex-col items-center justify-center space-y-0.5 ${
                  isSelected
                    ? 'bg-emerald-800 border-emerald-900 text-white shadow-sm'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span className="text-xs sm:text-sm">{slotInfo.label}</span>
                <span className={`text-[11px] font-normal ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                  {slotInfo.time}
                </span>
              </button>
            );
          })}
        </div>

        {/* List of Scheduled Medication Cards with Clinical Badges & 1-Tap Audio */}
        <div className="space-y-3.5 mt-3">
          {filteredMeds.length === 0 ? (
            <div className="bg-white rounded-2xl p-8 border border-dashed border-slate-300 text-center text-slate-500 shadow-sm">
              <CheckCircle2 className="w-10 h-10 text-emerald-600 mx-auto mb-2 opacity-80" />
              <h3 className="text-base font-bold text-slate-800">
                {currentStrings.allDoneForSlot}
              </h3>
              <p className="text-xs mt-1 text-slate-500">{currentStrings.noPendingSlot}</p>
            </div>
          ) : (
            filteredMeds.map(med => {
              const currentSchedule = med.schedules.find(
                s => s.label.toLowerCase() === activeSlot.toLowerCase()
              );
              const isTaken = currentSchedule?.doseTakenToday;
              const isSpeakingThis = speakingPillId === med.id;

              // Visual tag by color/shape in chosen language
              const visualTag =
                selectedLanguage === 'hi'
                  ? med.visualTagHindi || `${med.pillColor} ${med.pillShape}`
                  : selectedLanguage === 'te'
                  ? med.visualTagTelugu || `${med.pillColor} ${med.pillShape}`
                  : `${med.pillColor.toUpperCase()} ${med.pillShape.toUpperCase()}`;

              return (
                <div
                  key={med.id}
                  className={`bg-white rounded-2xl p-5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                    isTaken ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200/90 hover:border-slate-300 shadow-sm'
                  }`}
                >
                  {/* Left Pill Info with Clinical Tablet Preview & Audio Speaker */}
                  <div className="flex items-start sm:items-center space-x-4">
                    {/* Clickable Pharmaceutical Pill Preview */}
                    <div
                      onClick={() => {
                        SoundService.playTap();
                        setSelectedMedForDetail(med);
                      }}
                      className="cursor-pointer group flex flex-col items-center justify-center p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 transition shrink-0"
                      title="Click to view full prescription"
                    >
                      <PillVisual3D
                        shape={med.pillShape}
                        color={med.pillColor}
                        dosage={med.dosage}
                        size="md"
                      />
                      <span className="text-[9px] font-bold text-slate-400 group-hover:text-emerald-700 mt-1 flex items-center">
                        <Eye className="w-2.5 h-2.5 mr-0.5" /> {currentStrings.viewDetails}
                      </span>
                    </div>

                    <div className="space-y-1 flex-1">
                      {/* Clinical Visual Identifier Chip */}
                      <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-800 border border-slate-200">
                        <span className="w-2 h-2 rounded-full bg-slate-500 inline-block" />
                        <span>{visualTag}</span>
                      </div>

                      <div className="flex items-center space-x-2 pt-0.5">
                        <h3 className="text-lg font-bold text-slate-900 tracking-tight">
                          {med.name}
                        </h3>
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-slate-100 text-slate-800 border border-slate-200">
                          {med.dosage}
                        </span>
                      </div>

                      <p className="text-xs sm:text-sm text-slate-600 font-medium">
                        {med.instructions}
                      </p>

                      <div className="flex flex-wrap items-center gap-2 text-xs text-slate-500 pt-0.5">
                        <span className="flex items-center space-x-1 font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                          <Utensils className="w-3 h-3 text-amber-700" />
                          <span>{med.foodRequirement.replace('-', ' ')}</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center space-x-1 text-slate-500">
                          <Droplets className="w-3 h-3 text-sky-600" />
                          <span>{currentStrings.waterNote}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right Actions: Native Voice Speaker Button + Mark Taken */}
                  <div className="flex items-center space-x-2 self-end sm:self-center shrink-0">
                    {/* Instant Audio Speaker Button for this pill */}
                    <button
                      onClick={() => handleSpeakPill(med)}
                      className={`p-2.5 sm:px-3 sm:py-2.5 rounded-xl border font-bold transition flex items-center justify-center space-x-1.5 shadow-sm active:scale-95 ${
                        isSpeakingThis
                          ? 'bg-amber-100 border-amber-400 text-amber-950 animate-pulse'
                          : 'bg-emerald-50 hover:bg-emerald-100 border-emerald-300 text-emerald-900'
                      }`}
                      title="Audio pill directions in your mother tongue"
                    >
                      <Volume2 className="w-4 h-4 text-emerald-800" />
                      <span className="text-xs font-bold hidden md:inline">
                        {isSpeakingThis ? currentStrings.speakingBtn : currentStrings.listenBtn}
                      </span>
                    </button>

                    {isTaken ? (
                      <div className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-100 text-emerald-900 font-bold text-xs sm:text-sm border border-emerald-300">
                        <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                        <span>{currentStrings.takenBadge}</span>
                      </div>
                    ) : (
                      <button
                        onClick={() => handleMarkDose(med.id, currentSchedule?.time || '08:00')}
                        className="flex items-center space-x-1.5 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs sm:text-sm shadow transition active:scale-95"
                      >
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>{currentStrings.markTakenBtn}</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>

      {/* Clinical Hydration Routine */}
      <HydrationTracker initialCount={5} />

      {/* Emergency SOS Bar */}
      <section className="bg-rose-50/70 rounded-2xl p-5 sm:p-6 border border-rose-200 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-11 h-11 rounded-xl bg-rose-600 text-white flex items-center justify-center shrink-0 shadow-sm">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {currentStrings.sosTitle}
            </h3>
            <p className="text-xs text-slate-600 max-w-xl">
              {currentStrings.sosSub}
            </p>
          </div>
        </div>

        <button
          onClick={onTriggerSos}
          className="shrink-0 px-5 py-3 rounded-xl bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-sm shadow-md flex items-center justify-center space-x-2 active:scale-95 transition"
        >
          <ShieldAlert className="w-4 h-4" />
          <span>{currentStrings.sosBtn}</span>
        </button>
      </section>
    </div>
  );
}
