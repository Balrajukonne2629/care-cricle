'use client';

import React, { useState } from 'react';
import { Droplets, Plus, Minus, Check, Sparkles } from 'lucide-react';
import SoundService from '@/lib/soundService';

interface HydrationTrackerProps {
  initialCount?: number;
}

export default function HydrationTracker({ initialCount = 4 }: HydrationTrackerProps) {
  const [glasses, setGlasses] = useState(initialCount);
  const target = 8;

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

  const percentage = Math.round((glasses / target) * 100);

  return (
    <div className="bg-gradient-to-br from-sky-50 via-teal-50/30 to-blue-50/50 rounded-3xl p-5 border border-sky-200/80 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
        <div className="flex items-center space-x-2.5">
          <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-200 flex items-center justify-center text-sky-600">
            <Droplets className="w-5 h-5 fill-sky-200" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 tracking-tight flex items-center gap-1.5">
              <span>Daily Hydration Routine</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-sky-100 text-sky-800 font-bold border border-sky-200">
                {glasses} / {target} Glasses
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Crucial for kidney health & medication absorption.
            </p>
          </div>
        </div>

        {/* Quick Stepper Buttons */}
        <div className="flex items-center space-x-2">
          <button
            onClick={handleRemove}
            disabled={glasses <= 0}
            className="w-9 h-9 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 flex items-center justify-center font-bold text-sm disabled:opacity-40 transition active:scale-95 shadow-sm"
            title="Minus 1 glass"
          >
            <Minus className="w-4 h-4" />
          </button>
          <button
            onClick={handleAdd}
            disabled={glasses >= target}
            className="px-3.5 h-9 rounded-xl bg-sky-600 hover:bg-sky-700 text-white flex items-center space-x-1.5 font-bold text-xs disabled:opacity-40 transition active:scale-95 shadow-sm"
            title="Drink 1 glass"
          >
            <Plus className="w-4 h-4" />
            <span>Drank Water</span>
          </button>
        </div>
      </div>

      {/* Visual Glass Row */}
      <div className="grid grid-cols-8 gap-1.5 sm:gap-2 my-2">
        {Array.from({ length: target }).map((_, idx) => {
          const isFilled = idx < glasses;
          return (
            <div
              key={idx}
              onClick={() => {
                SoundService.playTap();
                setGlasses(idx + 1);
              }}
              className={`h-11 sm:h-12 rounded-xl border flex flex-col justify-end overflow-hidden cursor-pointer transition-all transform active:scale-95 ${
                isFilled
                  ? 'bg-sky-500/10 border-sky-300 ring-1 ring-sky-400/30'
                  : 'bg-white border-slate-200/90 hover:bg-slate-50'
              }`}
              title={`Glass ${idx + 1}`}
            >
              <div
                className={`w-full transition-all duration-300 ${
                  isFilled
                    ? 'h-full bg-gradient-to-t from-sky-500 to-sky-400 flex items-center justify-center text-white'
                    : 'h-0'
                }`}
              >
                {isFilled && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-center justify-between text-xs text-sky-900 mt-2 font-medium">
        <span>💧 {percentage}% of daily hydration met</span>
        {glasses >= target ? (
          <span className="flex items-center space-x-1 font-bold text-emerald-700">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Optimal kidney hydration goal reached!</span>
          </span>
        ) : (
          <span className="text-slate-500 text-[11px]">Next glass recommended with lunch</span>
        )}
      </div>
    </div>
  );
}
