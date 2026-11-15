'use client';

import React, { useState } from 'react';
import { X, ShieldAlert, Phone, MapPin, AlertOctagon, Heart, CheckCircle2 } from 'lucide-react';
import { ElderProfile, CareCircleMember } from '@/lib/types';
import SoundService from '@/lib/soundService';

interface EmergencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  elder: ElderProfile;
  circleMembers: CareCircleMember[];
  onConfirmSos: () => Promise<void>;
  onResolveSos: (notes: string) => Promise<void>;
  isSosActive: boolean;
}

export default function EmergencyModal({
  isOpen,
  onClose,
  elder,
  circleMembers,
  onConfirmSos,
  onResolveSos,
  isSosActive,
}: EmergencyModalProps) {
  const [resolutionNote, setResolutionNote] = useState('');
  const [isResolving, setIsResolving] = useState(false);

  if (!isOpen) return null;

  const handleTrigger = async () => {
    SoundService.playAlarm();
    await onConfirmSos();
  };

  const handleResolve = async () => {
    setIsResolving(true);
    SoundService.playPillTaken();
    await onResolveSos(resolutionNote || 'Elder verified safe and comfortable.');
    setIsResolving(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-rose-950/80 backdrop-blur-md animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-xl w-full shadow-2xl border-4 border-rose-500 overflow-hidden text-slate-800">
        {/* Urgent Emergency Header */}
        <div className="bg-gradient-to-r from-rose-600 to-red-700 text-white p-6 relative text-center">
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/20 hover:bg-white/30 text-white transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="w-16 h-16 rounded-full bg-white text-rose-600 flex items-center justify-center mx-auto mb-3 shadow-lg animate-bounce">
            <ShieldAlert className="w-9 h-9" />
          </div>
          <h2 className="text-2xl font-black uppercase tracking-wider">
            {isSosActive ? '🚨 SOS BEACON BROADCASTING' : 'Emergency Assistance Beacon'}
          </h2>
          <p className="text-xs text-rose-100 font-medium mt-1">
            CareCircle Priority Dispatch & Family Circle Relay
          </p>
        </div>

        <div className="p-6 space-y-5">
          {/* Active status or Trigger button */}
          {!isSosActive ? (
            <div className="text-center space-y-3">
              <p className="text-base text-slate-700 font-semibold">
                Are you feeling unwell, fallen, or in need of immediate help?
              </p>
              <button
                onClick={handleTrigger}
                className="w-full py-4 rounded-2xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-black text-xl uppercase tracking-wider shadow-lg shadow-rose-600/40 border-b-4 border-rose-900 active:border-b-0 active:translate-y-1 transition"
              >
                🚨 Press to Alert Family & Responders Now
              </button>
              <p className="text-xs text-slate-400">
                Dispatches high-priority email alerts and SMS notifications to all circle contacts.
              </p>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-rose-50 border-2 border-rose-300 space-y-2">
              <div className="flex items-center space-x-2 text-rose-800 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-rose-600 animate-ping" />
                <span>Alerts Transmitted to Care Circle:</span>
              </div>
              <ul className="text-xs text-rose-900 space-y-1 pl-4 list-disc font-medium">
                {circleMembers.map(m => (
                  <li key={m.id}>
                    <strong>{m.name}</strong> ({m.relationship}) — Priority Email Sent
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Critical Medical ID Profile */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-xs space-y-2">
            <h4 className="font-extrabold text-slate-900 text-sm uppercase tracking-wider flex items-center space-x-1.5">
              <Heart className="w-4 h-4 text-rose-600" />
              <span>Patient Medical ID (First Responders)</span>
            </h4>
            <div className="grid grid-cols-2 gap-2 text-slate-700 pt-1">
              <p>Name: <strong>{elder.name}</strong></p>
              <p>Age / Gender: <strong>{elder.age} yo / {elder.gender}</strong></p>
              <p>Blood Type: <strong className="text-rose-600">{elder.bloodType}</strong></p>
              <p>Allergies: <strong className="text-rose-600">{elder.allergies.join(', ')}</strong></p>
            </div>
            <div className="pt-2 border-t border-slate-200">
              <p>📍 <strong>Registered Location:</strong> {elder.address}, {elder.apartmentSuite}</p>
              <p className="text-amber-800 font-bold mt-1">🔑 {elder.emergencyNotes}</p>
            </div>
          </div>

          {/* Direct Phone Dial Quick Action */}
          <div className="grid grid-cols-2 gap-3">
            <a
              href="tel:911"
              className="py-3 px-4 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm flex items-center justify-center space-x-2 transition"
            >
              <Phone className="w-4 h-4 text-rose-400" />
              <span>Dial 911</span>
            </a>
            <a
              href={`tel:${circleMembers[0]?.phone}`}
              className="py-3 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white font-bold text-sm flex items-center justify-center space-x-2 transition"
            >
              <Phone className="w-4 h-4" />
              <span>Call Sarah ({circleMembers[0]?.name.split(' ')[0]})</span>
            </a>
          </div>

          {/* Resolve / Stand-down control */}
          {isSosActive && (
            <div className="pt-4 border-t border-slate-200 space-y-2">
              <input
                type="text"
                placeholder="Resolution note (e.g. 'False alarm, checked in with Sarah')..."
                value={resolutionNote}
                onChange={e => setResolutionNote(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 font-medium"
              />
              <button
                onClick={handleResolve}
                disabled={isResolving}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 text-slate-700 font-bold text-xs border border-slate-300 transition"
              >
                {isResolving ? 'Resolving...' : 'Stand-Down / Resolve Active SOS'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
