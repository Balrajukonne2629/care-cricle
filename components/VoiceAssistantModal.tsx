'use client';

import React, { useState, useEffect } from 'react';
import { Mic, MicOff, X, Volume2, Sparkles, CheckCircle, ShieldAlert } from 'lucide-react';
import { parseElderVoiceCommand, SpeechService } from '@/lib/speechService';
import SoundService from '@/lib/soundService';
import { Medication, Appointment, ElderProfile } from '@/lib/types';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  elder: ElderProfile;
  medications: Medication[];
  appointments: Appointment[];
  onTakeDose: (medId: string, time: string) => Promise<void>;
  onTriggerSos: () => void;
}

export default function VoiceAssistantModal({
  isOpen,
  onClose,
  elder,
  medications,
  appointments,
  onTakeDose,
  onTriggerSos,
}: VoiceAssistantModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [assistantResponse, setAssistantResponse] = useState('');
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const reco = new SpeechRecognition();
        reco.continuous = false;
        reco.interimResults = true;
        reco.lang = 'en-US';

        reco.onresult = (e: any) => {
          const current = e.results[0][0].transcript;
          setTranscript(current);
        };

        reco.onend = () => {
          setIsListening(false);
        };

        reco.onerror = (e: any) => {
          console.warn('Speech recognition notice:', e.error);
          setIsListening(false);
        };

        setRecognition(reco);
      }
    }
  }, []);

  if (!isOpen) return null;

  const toggleListen = () => {
    SoundService.playTap();
    if (isListening) {
      recognition?.stop();
      setIsListening(false);
    } else {
      setTranscript('');
      setAssistantResponse('Listening for your voice... speak anytime.');
      setIsListening(true);
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
      const reply = `Emergency SOS activated for ${elder.preferredName}. Sarah and emergency responders have been alerted.`;
      setAssistantResponse(reply);
      await SpeechService.speak(reply, { rate: 0.9 });
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
      const reply = `Wonderful! I have marked your ${medToTake.name} as taken. Sarah has been updated.`;
      setAssistantResponse(reply);
      await SpeechService.speak(reply, { rate: 0.88 });
      return;
    }

    if (parsed.action === 'read_schedule') {
      const morningMeds = medications.filter(m => m.schedules.some(s => s.label === 'Morning'));
      const names = morningMeds.map(m => `${m.name} ${m.dosage}`).join(', and ');
      const reply = `Good day ${elder.preferredName}. For this morning, you have ${names}. Take with breakfast and a glass of water.`;
      setAssistantResponse(reply);
      await SpeechService.speak(reply, { rate: 0.88 });
      return;
    }

    if (parsed.action === 'query_appointment') {
      const nextAppt = appointments[0];
      const reply = `Your next visit is ${nextAppt.title} with ${nextAppt.doctorName} on ${nextAppt.date} at ${nextAppt.time}. Sarah is driving.`;
      setAssistantResponse(reply);
      await SpeechService.speak(reply, { rate: 0.88 });
      return;
    }

    const fallback = `I heard: "${inputStr}". You can ask me to read your schedule, confirm taking your pills, or call for help.`;
    setAssistantResponse(fallback);
    await SpeechService.speak(fallback, { rate: 0.88 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 text-center relative overflow-hidden">
        <button
          onClick={() => {
            SpeechService.stop();
            SoundService.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-slate-100 text-slate-500 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="space-y-4">
          <div className="w-16 h-16 rounded-3xl bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center shadow-inner">
            <Sparkles className="w-8 h-8 text-emerald-600 animate-pulse" />
          </div>

          <h3 className="text-2xl font-black text-slate-900">CareCircle Voice Companion</h3>
          <p className="text-sm text-slate-600 max-w-sm mx-auto">
            Speak naturally to check medicines, log taken doses, or call for help.
          </p>

          {/* Interactive Mic Orb */}
          <div className="py-4">
            <button
              onClick={toggleListen}
              className={`w-28 h-28 rounded-full flex flex-col items-center justify-center mx-auto transition shadow-xl active:scale-95 ${
                isListening
                  ? 'bg-rose-500 text-white ring-8 ring-rose-200 animate-pulse'
                  : 'bg-emerald-600 text-white hover:bg-emerald-700 ring-8 ring-emerald-100'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
              <span className="text-xs font-bold mt-1 uppercase tracking-wider">
                {isListening ? 'Stop' : 'Tap to Talk'}
              </span>
            </button>
          </div>

          {/* Transcript / Spoken text display */}
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-left min-h-[90px]">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
              {transcript ? 'Spoken Command:' : 'Status:'}
            </span>
            <p className="text-base font-bold text-slate-800 mt-1">
              {transcript || (isListening ? 'Listening... please speak.' : 'Press the microphone above or tap a sample question below.')}
            </p>
            {assistantResponse && (
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-start space-x-2 text-emerald-800 font-semibold text-sm">
                <Volume2 className="w-4 h-4 text-emerald-600 mt-0.5 flex-shrink-0" />
                <span>{assistantResponse}</span>
              </div>
            )}
          </div>

          {/* Fast 1-Tap Sample Voice Questions (Guarantees 100% demo success) */}
          <div className="text-left pt-2">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Try a Spoken Command:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {[
                { label: '🌿 "Read my morning pills"', q: 'Read my morning pills' },
                { label: '💊 "I took my Lisinopril"', q: 'I took my lisinopril' },
                { label: '📅 "When is my doctor visit?"', q: 'When is my next doctor appointment?' },
                { label: '🚨 "Emergency Help / SOS"', q: 'Emergency help me call family' },
              ].map(item => (
                <button
                  key={item.q}
                  onClick={() => {
                    SoundService.playTap();
                    processSpokenInput(item.q);
                  }}
                  className="px-3 py-2 rounded-xl bg-slate-100 hover:bg-emerald-50 text-slate-700 hover:text-emerald-900 border border-slate-200 text-xs font-bold text-left transition"
                >
                  {item.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
