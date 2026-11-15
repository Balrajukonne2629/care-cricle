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

    if (parsed.action === 'query_appointment') {
      const nextAppt = appointments[0];
      let reply = `You have no upcoming visits scheduled.`;
      if (nextAppt) {
        reply = `Your next visit is with ${nextAppt.doctorName} for ${nextAppt.specialty} on ${nextAppt.date} at ${nextAppt.time}.`;
      }
      setAssistantResponse(reply);
      await SpeechService.speak(reply, { rate: 0.88 });
      return;
    }

    // Default query schedule
    const morningMeds = medications.filter(m => m.schedules.some(s => s.label === 'Morning'));
    const names = morningMeds.map(m => m.name).join(' and ');
    const reply = `For your morning routine, you have ${names}. Drink a full glass of water with them.`;
    setAssistantResponse(reply);
    await SpeechService.speak(reply, { rate: 0.88 });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow ambient circle */}
        <div className="absolute -top-20 -right-20 w-44 h-44 bg-emerald-200/40 rounded-full blur-3xl pointer-events-none" />

        {/* Close Button */}
        <button
          onClick={() => {
            SoundService.playTap();
            onClose();
          }}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Title */}
        <div className="text-center space-y-1">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black uppercase tracking-wider mb-1">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>Web Speech Voice Companion</span>
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">
            Speak to CareCircle
          </h2>
          <p className="text-sm text-slate-600">
            Natural voice assistance designed for senior clarity and hands-free logging.
          </p>
        </div>

        {/* Big Mic Button & Audio Equalizer Waveform */}
        <div className="flex flex-col items-center justify-center py-4 space-y-3">
          <div className="relative">
            {isListening && (
              <div className="absolute -inset-3 bg-emerald-400/20 rounded-full animate-ping pointer-events-none" />
            )}
            <button
              onClick={toggleListen}
              className={`w-24 h-24 rounded-full flex items-center justify-center shadow-lg transition-all transform active:scale-90 ${
                isListening
                  ? 'bg-rose-500 text-white ring-4 ring-rose-300 animate-pulse'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white ring-4 ring-emerald-100 hover:scale-105'
              }`}
            >
              {isListening ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
            </button>
          </div>

          {/* Equalizer Bars when listening */}
          {isListening ? (
            <div className="flex items-center justify-center space-x-1.5 h-8">
              <span className="w-1.5 bg-emerald-500 rounded-full wave-bar-1" />
              <span className="w-1.5 bg-emerald-500 rounded-full wave-bar-2" />
              <span className="w-1.5 bg-emerald-600 rounded-full wave-bar-3" />
              <span className="w-1.5 bg-emerald-500 rounded-full wave-bar-4" />
              <span className="w-1.5 bg-emerald-500 rounded-full wave-bar-5" />
            </div>
          ) : (
            <span className="text-xs font-extrabold text-slate-400 uppercase tracking-widest">
              Tap mic or click a prompt below
            </span>
          )}
        </div>

        {/* Live Transcript / Response Card */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4 min-h-[90px] flex flex-col justify-center text-center space-y-2">
          {transcript && (
            <div className="text-xs font-bold text-slate-500">
              You said: &ldquo;<span className="text-slate-800">{transcript}</span>&rdquo;
            </div>
          )}
          {assistantResponse ? (
            <div className="text-sm font-bold text-emerald-800 flex items-center justify-center space-x-2">
              <Volume2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{assistantResponse}</span>
            </div>
          ) : (
            <span className="text-xs text-slate-400">
              Try saying: &ldquo;I took my morning pills&rdquo; or &ldquo;When is my doctor appointment?&rdquo;
            </span>
          )}
        </div>

        {/* 1-Tap Sample Prompts */}
        <div className="space-y-2">
          <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Quick 1-Tap Voice Prompts:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {[
              { text: 'I took my morning pills', action: 'confirm' },
              { text: 'When is my doctor appointment?', action: 'query' },
              { text: 'What pills do I take today?', action: 'schedule' },
              { text: 'Emergency SOS Help', action: 'sos' },
            ].map((p, i) => (
              <button
                key={i}
                onClick={() => {
                  SoundService.playTap();
                  processSpokenInput(p.text);
                }}
                className={`p-2.5 rounded-xl border text-left text-xs font-bold transition flex items-center justify-between active:scale-95 ${
                  p.action === 'sos'
                    ? 'bg-rose-50 border-rose-200 text-rose-800 hover:bg-rose-100'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <span>&ldquo;{p.text}&rdquo;</span>
                <Sparkles className="w-3.5 h-3.5 text-slate-400" />
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
