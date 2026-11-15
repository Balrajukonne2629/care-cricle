'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, Volume2, X, Sparkles, AlertCircle, Heart, Stethoscope } from 'lucide-react';
import { ElderProfile, Medication, Appointment, NativeLanguage } from '@/lib/types';
import { SpeechService, parseElderVoiceCommand } from '@/lib/speechService';
import SoundService from '@/lib/soundService';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  elder: ElderProfile;
  medications: Medication[];
  appointments: Appointment[];
  onTakeDose: (medId: string, time: string) => Promise<void>;
  onTriggerSos: () => void;
  selectedLanguage: NativeLanguage;
}

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  elder,
  medications,
  appointments,
  onTakeDose,
  onTriggerSos,
  selectedLanguage,
}: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window)) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      const rec = new SpeechRecognition();
      rec.continuous = false;
      rec.interimResults = false;

      // Match recognition language to active selection
      const langMap: Record<NativeLanguage, string> = {
        hi: 'hi-IN',
        te: 'te-IN',
        ta: 'ta-IN',
        en: 'en-IN',
      };
      rec.lang = langMap[selectedLanguage] || 'en-IN';

      rec.onstart = () => setIsListening(true);
      rec.onend = () => setIsListening(false);
      rec.onresult = (event: any) => {
        const spokenText = event.results[0][0].transcript;
        processSpokenInput(spokenText);
      };
      rec.onerror = (e: any) => {
        console.warn('SpeechRecognition error:', e);
        setIsListening(false);
      };

      setRecognition(rec);
    }
  }, [isOpen, selectedLanguage]);

  if (!isOpen) return null;

  const toggleListen = () => {
    SoundService.playTap();
    if (isListening) {
      recognition?.stop();
    } else {
      setTranscript('');
      setAssistantResponse('');
      try {
        recognition?.start();
      } catch (err) {
        console.warn(err);
      }
    }
  };

  const processSpokenInput = async (inputStr: string) => {
    setTranscript(inputStr);
    const parsed = parseElderVoiceCommand(inputStr);

    if (parsed.action === 'trigger_sos') {
      let reply = `Emergency SOS activated for ${elder.preferredName}. Rajesh and Apollo Emergency have been alerted.`;
      let phoneticFallback: string | undefined = undefined;

      if (selectedLanguage === 'hi') {
        reply = `आपातकाल सक्रिय! राजेश और अपोलो इमरजेंसी को सूचना भेजी जा चुकी है। सहायता जल्द पहुंच रही है।`;
      } else if (selectedLanguage === 'te') {
        reply = `ఎమర్జెన్సీ అలర్ట్ పంపబడింది! రాజేష్ గారికి మరియు అపోలో ఎమర్జెన్సీకి సమాచారం చేరింది.`;
        phoneticFallback = `Emergency alert pampabadindi! Rajesh gariki mariyu Apollo Emergency ki samacharam cherindi.`;
      }
      setAssistantResponse(reply);
      await SpeechService.speak(reply, {
        lang: selectedLanguage,
        phoneticFallbackText: phoneticFallback,
        rate: 0.88,
      });
      onTriggerSos();
      return;
    }

    if (parsed.action === 'confirm_taken') {
      let medToTake = medications[0];
      if (parsed.targetMedication) {
        const found = medications.find(m => m.name.toLowerCase().includes(parsed.targetMedication!.toLowerCase()));
        if (found) medToTake = found;
      }
      await onTakeDose(medToTake.id, '08:00');

      let reply = `Very good! I have marked your ${medToTake.name} as taken. Rajesh has been updated.`;
      let phoneticFallback: string | undefined = undefined;

      if (selectedLanguage === 'hi') {
        reply = `बहुत अच्छा अम्मा! आपकी ${medToTake.name} ले ली गई है। राजेश भैया को सूचित कर दिया गया है।`;
      } else if (selectedLanguage === 'te') {
        reply = `చాలా మంచిది అమ్మా! మీ ${medToTake.name} తీసుకున్నట్లు నమోదు చేశాం. రాజేష్ గారికి సమాచారం చేరింది.`;
        phoneticFallback = `Chala manchidi Amma! Mee ${medToTake.name} teesukunnattlu namodu chesam. Rajesh gariki samacharam cherindi.`;
      }
      setAssistantResponse(reply);
      await SpeechService.speak(reply, {
        lang: selectedLanguage,
        phoneticFallbackText: phoneticFallback,
        rate: 0.88,
      });
      return;
    }

    if (parsed.action === 'query_appointment') {
      const nextAppt = appointments[0];
      let reply = `You have no upcoming hospital visits.`;
      let phoneticFallback: string | undefined = undefined;

      if (nextAppt) {
        if (selectedLanguage === 'hi') {
          reply = `अम्मा, आपका अगला चेकअप ${nextAppt.clinic} में ${nextAppt.doctorName} के साथ ${nextAppt.date} को सुबह ${nextAppt.time} बजे है।`;
        } else if (selectedLanguage === 'te') {
          reply = `అమ్మా, మీ తదుపరి చెకప్ ${nextAppt.clinic} లో ${nextAppt.doctorName} గారితో ${nextAppt.date} న ఉంది.`;
          phoneticFallback = `Amma, mee thadupari checkup ${nextAppt.clinic} lo Doctor ${nextAppt.doctorName} garitho ${nextAppt.date} na undi.`;
        } else {
          reply = `Your next visit is with ${nextAppt.doctorName} at ${nextAppt.clinic} on ${nextAppt.date} at ${nextAppt.time}.`;
        }
      }
      setAssistantResponse(reply);
      await SpeechService.speak(reply, {
        lang: selectedLanguage,
        phoneticFallbackText: phoneticFallback,
        rate: 0.88,
      });
      return;
    }

    // Default query schedule
    let reply = `For your morning routine, you have Telma 40 for BP and Glycomet for Sugar. Take with fresh water.`;
    let phoneticFallback: string | undefined = undefined;

    if (selectedLanguage === 'hi') {
      reply = `अम्मा, सुबह आपकी टेल्मा 40 बीपी की गुलाबी गोली और ग्लाइकोमेट शुगर की सफेद गोली नाश्ते के बाद लेनी है।`;
    } else if (selectedLanguage === 'te') {
      reply = `లక్ష్మి అమ్మా, ఉదయం మీ బి.పి. గులాబీ బిళ్ళ టెల్మా 40 మరియు షుగర్ తెల్ల బిళ్ళ టిఫిన్ తర్వాత వేసుకోండి.`;
      phoneticFallback = `Lakshmi Amma, udayam mee BP gulabi goli Telma 40 mariyu Sugar thella goli tiffin tharuvatha vesukondi.`;
    }
    setAssistantResponse(reply);
    await SpeechService.speak(reply, {
      lang: selectedLanguage,
      phoneticFallbackText: phoneticFallback,
      rate: 0.88,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl max-w-lg w-full border border-slate-200 shadow-xl p-6 sm:p-7 space-y-5 relative overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => {
            SpeechService.stop();
            SoundService.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold uppercase tracking-wider mb-1 border border-emerald-200">
            <Stethoscope className="w-3.5 h-3.5 text-emerald-700" />
            <span>
              {selectedLanguage === 'hi'
                ? 'स्वास्थ्य आवाज सहायिका (Voice Assistant)'
                : selectedLanguage === 'te'
                ? 'ఆరోగ్య వాయిస్ సహాయం (Voice Assistant)'
                : 'Clinical Voice Companion'}
            </span>
          </div>
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            {selectedLanguage === 'hi'
              ? 'अम्मा, बोलकर बताएं'
              : selectedLanguage === 'te'
              ? 'లక్ష్మి అమ్మా, మాట్లాడండి'
              : 'Elder Voice Assistant'}
          </h2>
          <p className="text-xs text-slate-500">
            {selectedLanguage === 'hi'
              ? 'माइक दबाकर हिंदी में बोलें (दवा ले ली, डॉक्टर कब है)'
              : selectedLanguage === 'te'
              ? 'తెలుగులో మాట్లాడి మందులు నమోదు చేయండి'
              : 'Speak naturally to confirm taken pills, check appointments, or request help.'}
          </p>
        </div>

        {/* Mic Button */}
        <div className="flex flex-col items-center justify-center py-2 space-y-2.5">
          <button
            onClick={toggleListen}
            className={`w-20 h-20 rounded-full flex items-center justify-center shadow-md transition-all active:scale-95 ${
              isListening
                ? 'bg-rose-600 text-white ring-4 ring-rose-200 animate-pulse'
                : 'bg-emerald-700 hover:bg-emerald-800 text-white ring-4 ring-emerald-50'
            }`}
          >
            {isListening ? <MicOff className="w-8 h-8" /> : <Mic className="w-8 h-8" />}
          </button>

          <span className="text-[11px] font-semibold text-slate-500">
            {isListening
              ? selectedLanguage === 'hi'
                ? 'सुन रहे हैं... बोलिए'
                : selectedLanguage === 'te'
                ? 'వింటున్నాము... మాట్లాడండి'
                : 'Listening... please speak'
              : selectedLanguage === 'hi'
              ? 'माइक दबाएं या नीचे दिए बटन छुएं'
              : selectedLanguage === 'te'
              ? 'మైక్ నొక్కండి లేదా కింద ఉన్న బటన్ తాకండి'
              : 'Tap mic to speak or click a prompt below'}
          </span>
        </div>

        {/* Live Transcript / Spoken Audio Card */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 min-h-[75px] flex flex-col justify-center text-center space-y-1">
          {transcript && (
            <div className="text-xs font-semibold text-slate-500">
              {selectedLanguage === 'hi' ? 'आपने कहा: ' : selectedLanguage === 'te' ? 'మీరు చెప్పారు: ' : 'You said: '}
              &ldquo;<span className="text-slate-800 font-bold">{transcript}</span>&rdquo;
            </div>
          )}
          {assistantResponse ? (
            <div className="text-xs sm:text-sm font-bold text-emerald-800 flex items-center justify-center space-x-1.5">
              <Volume2 className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>{assistantResponse}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              {selectedLanguage === 'hi'
                ? 'उदाहरण: "मैंने सुबह की दवाइयां ले लीं" या "डॉक्टर चेकअप कब है"'
                : selectedLanguage === 'te'
                ? 'ఉదాహరణ: "నేను ఉదయం మందులు తీసుకున్నాను" లేదా "డాక్టర్ చెకప్ ఎప్పుడు"'
                : 'Try saying: "I took my morning pills" or "When is doctor appointment"'}
            </span>
          )}
        </div>

        {/* 1-Tap Sample Prompts in Mother Tongue */}
        <div className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            {selectedLanguage === 'hi'
              ? 'त्वरित आवाज आदेश:'
              : selectedLanguage === 'te'
              ? 'సులభమైన వాయిస్ ఆదేశాలు:'
              : 'Quick Voice Prompts:'}
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              {
                textHi: 'मैंने सुबह की दवा ले ली',
                textTe: 'ఉదయం మందులు తీసుకున్నాను',
                textEn: 'I took my morning pills',
                action: 'confirm',
              },
              {
                textHi: 'डॉक्टर चेकअप कब है?',
                textTe: 'డాక్టర్ చెకప్ ఎప్పుడు?',
                textEn: 'When is doctor appointment?',
                action: 'query',
              },
              {
                textHi: 'आज कौन सी गोली खानी है?',
                textTe: 'ఈ రోజు ఏ మందులు వేసుకోవాలి?',
                textEn: 'What pills do I take today?',
                action: 'schedule',
              },
              {
                textHi: 'आपातकाल मदद चाहिए (SOS)',
                textTe: 'అత్యవసర సహాయం (SOS)',
                textEn: 'Emergency SOS Help',
                action: 'sos',
              },
            ].map((p, i) => {
              const label = selectedLanguage === 'hi' ? p.textHi : selectedLanguage === 'te' ? p.textTe : p.textEn;
              return (
                <button
                  key={i}
                  onClick={() => {
                    SoundService.playTap();
                    processSpokenInput(label);
                  }}
                  className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between active:scale-95 ${
                    p.action === 'sos'
                      ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                      : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <span>&ldquo;{label}&rdquo;</span>
                  <Sparkles className="w-3.5 h-3.5 text-slate-400" />
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
