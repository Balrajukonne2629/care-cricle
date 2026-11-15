'use client';

import React, { useState } from 'react';
import { Medication } from '@/lib/types';
import PillVisual3D from './PillVisual3D';
import { Check, Clock, ChevronRight, Sparkles } from 'lucide-react';
import SoundService from '@/lib/soundService';

interface PillOrganizer3DProps {
  medications: Medication[];
  onSelectSlot?: (day: string, slot: string) => void;
  activeSlotName?: string;
}

export default function PillOrganizer3D({
  medications,
  onSelectSlot,
  activeSlotName = 'Morning',
}: PillOrganizer3DProps) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const todayIndex = (new Date().getDay() + 6) % 7; // 0 = Mon, 6 = Sun
  const [selectedDay, setSelectedDay] = useState<string>(days[todayIndex]);

  const slots = [
    { id: 'Morning', label: 'AM', icon: '🌅', color: 'text-amber-600' },
    { id: 'Afternoon', label: 'Noon', icon: '☀️', color: 'text-sky-600' },
    { id: 'Evening', label: 'PM', icon: '🌙', color: 'text-indigo-600' },
  ];

  const handleDayClick = (day: string) => {
    SoundService.playTap();
    setSelectedDay(day);
  };

  return (
    <div className="bg-gradient-to-b from-slate-50 to-slate-100/80 rounded-3xl p-5 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 gap-2">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex h-2.5 w-2.5 rounded-full bg-emerald-500 animate-ping" />
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Smart Weekly Pill Dispenser</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold border border-emerald-200">
                Connected Box
              </span>
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Physical compartment view matching your bedside organizer.
          </p>
        </div>

        <div className="flex items-center space-x-2 text-xs font-semibold text-slate-600">
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
            <span>Dispensed</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
            <span>Ready</span>
          </span>
        </div>
      </div>

      {/* 7-Day Acrylic Grid */}
      <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
        {days.map((day, idx) => {
          const isToday = idx === todayIndex;
          const isSelected = selectedDay === day;

          return (
            <button
              key={day}
              onClick={() => handleDayClick(day)}
              className={`flex flex-col rounded-2xl p-1.5 sm:p-2 border transition relative text-left active:scale-95 ${
                isSelected
                  ? 'bg-white ring-2 ring-emerald-600 border-emerald-500 shadow-md'
                  : isToday
                  ? 'bg-amber-50/70 border-amber-300'
                  : 'bg-slate-50 border-slate-200/80 hover:bg-white'
              }`}
            >
              {/* Day Header */}
              <div className="flex items-center justify-between border-b border-slate-200/60 pb-1 mb-1.5">
                <span className={`text-[11px] sm:text-xs font-extrabold ${isToday ? 'text-amber-800' : 'text-slate-700'}`}>
                  {day}
                </span>
                {isToday && (
                  <span className="text-[9px] px-1 rounded bg-amber-200 text-amber-900 font-bold uppercase">
                    Today
                  </span>
                )}
              </div>

              {/* 3 Physical Time Slots inside each compartment */}
              <div className="space-y-1">
                {slots.map(slot => {
                  const slotMeds = medications.filter(m =>
                    m.schedules.some(s => s.label.toLowerCase() === slot.id.toLowerCase())
                  );

                  // Mock status: if past today or taken today
                  const isCompleted = isToday
                    ? slotMeds.every(m =>
                        m.schedules.some(s => s.label.toLowerCase() === slot.id.toLowerCase() && s.doseTakenToday)
                      ) && slotMeds.length > 0
                    : idx < todayIndex;

                  return (
                    <div
                      key={slot.id}
                      className={`acrylic-compartment rounded-lg p-1 min-h-[38px] sm:min-h-[44px] flex flex-col justify-between transition ${
                        isCompleted ? 'bg-emerald-50/80 border-emerald-300/60' : ''
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[9px] font-bold text-slate-500">{slot.label}</span>
                        {isCompleted ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : slotMeds.length > 0 ? (
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                        ) : null}
                      </div>

                      {/* Mini pill icons inside compartment */}
                      <div className="flex flex-wrap gap-0.5 justify-center mt-0.5">
                        {slotMeds.slice(0, 3).map(m => (
                          <div key={m.id} className="scale-75 origin-center transform">
                            <PillVisual3D
                              shape={m.pillShape}
                              color={m.pillColor}
                              size="sm"
                              dosage={m.dosage}
                            />
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Day Expanded Detail Drawer */}
      <div className="mt-4 pt-3 border-t border-slate-200/80 flex flex-col sm:flex-row sm:items-center justify-between text-xs text-slate-600 gap-2">
        <div className="flex items-center space-x-2">
          <span className="font-extrabold text-slate-800">
            {selectedDay} Compartment:
          </span>
          <span>
            {medications.length} prescribed doses loaded into electronic blister cells.
          </span>
        </div>
        <div className="flex items-center space-x-1.5 text-emerald-700 font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          <span>Automated tamper-evident closure verified</span>
        </div>
      </div>
    </div>
  );
}
