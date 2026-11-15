'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import { Calendar, CheckCircle2, Clock, ShieldCheck, Stethoscope } from 'lucide-react';
import SoundService from '@/lib/soundService';

interface PillOrganizerProps {
  medications: Medication[];
  onSelectSlot?: (day: string, slot: string) => void;
  activeSlotName?: string;
}

/**
 * Clinical Weekly Prescription Schedule & Bedside Dispenser Strip
 * Professional, calm, healthcare-grade presentation inspired by modern clinical dashboards.
 */
export default function PillOrganizer3D({
  medications,
  onSelectSlot,
  activeSlotName = 'Morning',
}: PillOrganizerProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const [selectedDay, setSelectedDay] = useState<string>(days[todayIndex]);

  // Compute total pills today
  const totalMedsToday = medications.filter(m => m.isActive).length;

  const handleDayClick = (day: string) => {
    SoundService.playTap();
    setSelectedDay(day);
  };

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
      {/* Clinical Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-100 gap-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-800">
            <Calendar className="w-5 h-5 text-emerald-700" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Weekly Prescription Schedule</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 border border-slate-200">
                Dr. K. S. Rao • Apollo Cardiology
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Synchronized with physical bedside organizer & hospital care plan.
            </p>
          </div>
        </div>

        {/* Adherence Telemetry Status */}
        <div className="flex items-center space-x-3 text-xs font-medium text-slate-600 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
          <span className="flex items-center space-x-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-600 inline-block" />
            <span className="font-semibold text-slate-800">94% 7-Day Adherence</span>
          </span>
          <span className="text-slate-300">|</span>
          <span className="text-slate-600">{totalMedsToday} Active Prescriptions</span>
        </div>
      </div>

      {/* 7-Day Clean Treatment Strip */}
      <div className="grid grid-cols-7 gap-2">
        {days.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isSelected = selectedDay === day;
          const isPast = idx < todayIndex;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`flex flex-col items-center justify-center py-3 px-1 rounded-xl border transition-all text-center ${
                isSelected
                  ? 'bg-emerald-800 text-white border-emerald-900 shadow-sm'
                  : isToday
                  ? 'bg-emerald-50/70 border-emerald-300 text-slate-900'
                  : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
              }`}
            >
              <span className={`text-[11px] font-bold uppercase tracking-wider ${isSelected ? 'text-emerald-200' : 'text-slate-400'}`}>
                {day}
              </span>
              <span className={`text-base font-extrabold my-0.5 ${isSelected ? 'text-white' : 'text-slate-800'}`}>
                {idx + 10}
              </span>

              {/* Status Indicator */}
              <div className="mt-1">
                {isPast ? (
                  <span className={`text-[10px] font-semibold flex items-center ${isSelected ? 'text-emerald-200' : 'text-emerald-700'}`}>
                    <CheckCircle2 className="w-3 h-3 mr-0.5" /> Done
                  </span>
                ) : isToday ? (
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${isSelected ? 'bg-emerald-700 text-white' : 'bg-amber-100 text-amber-900'}`}>
                    Today
                  </span>
                ) : (
                  <span className={`text-[10px] font-medium ${isSelected ? 'text-emerald-300' : 'text-slate-400'}`}>
                    Due
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
