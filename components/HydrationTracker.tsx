'use client';

import React, { useState } from 'react';
import { Droplets, Plus, Minus, CheckCircle, HeartPulse, Info } from 'lucide-react';
import SoundService from '@/lib/soundService';

interface HydrationTrackerProps {
  initialCount?: number;
}

/**
 * Clinical Fluid Intake & Hydration Monitor
 * Professional, calm healthcare interface replacing cartoon waves.
 */
export default function HydrationTracker({ initialCount = 5 }: HydrationTrackerProps) {
  const [glasses, setGlasses] = useState(initialCount);
  const target = 8;
  const glassVolumeMl = 250; // Standard clinical glass

  const handleAdd = () => {
    if (glasses < target) {
      SoundService.playTap();
      setGlasses(prev => prev + 1);
    }
  };

  const handleRemove = () => {
    if (glasses > 0) {
      SoundService.playTap();
      setGlasses(prev => prev - 1);
    }
  };

  const currentMl = glasses * glassVolumeMl;
  const targetMl = target * glassVolumeMl;
  const percentage = Math.min(100, Math.round((glasses / target) * 100));

  return (
    <div className="bg-white rounded-2xl p-5 sm:p-6 border border-slate-200/90 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-sky-50 border border-sky-200 flex items-center justify-center text-sky-700">
            <Droplets className="w-5 h-5 text-sky-600" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <span>Daily Hydration & Fluid Balance</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-sky-50 text-sky-800 border border-sky-200">
                {currentMl} mL / {targetMl} mL Goal
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Essential for Telma 40 & Glycomet absorption and healthy renal clearance.
            </p>
          </div>
        </div>

        {/* Stepper Buttons */}
        <div className="flex items-center space-x-2 shrink-0">
          <button
            onClick={handleRemove}
            disabled={glasses <= 0}
            className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 hover:bg-slate-100 flex items-center justify-center font-bold text-sm disabled:opacity-40 transition"
            title="Deduct 250mL"
          >
            <Minus className="w-4 h-4" />
          </button>
          <span className="text-sm font-bold text-slate-800 px-2 min-w-[50px] text-center">
            {glasses} / {target}
          </span>
          <button
            onClick={handleAdd}
            disabled={glasses >= target}
            className="px-3.5 h-9 rounded-xl bg-sky-700 hover:bg-sky-800 text-white flex items-center space-x-1.5 font-bold text-xs disabled:opacity-40 transition shadow-sm"
            title="Add 250mL Glass"
          >
            <Plus className="w-4 h-4" />
            <span>+250 mL Glass</span>
          </button>
        </div>
      </div>

      {/* Segmented Progress Bar */}
      <div className="mt-4 space-y-2">
        <div className="flex items-center justify-between text-xs font-semibold text-slate-600">
          <span>{percentage}% Daily Goal Achieved</span>
          <span>{target - glasses > 0 ? `${(target - glasses) * 250} mL Remaining` : 'Daily Goal Completed'}</span>
        </div>

        {/* 8 segmented clinical bars */}
        <div className="grid grid-cols-8 gap-1.5 h-3">
          {Array.from({ length: target }).map((_, i) => (
            <div
              key={i}
              className={`rounded-md transition-all ${
                i < glasses ? 'bg-sky-600' : 'bg-slate-100 border border-slate-200'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
