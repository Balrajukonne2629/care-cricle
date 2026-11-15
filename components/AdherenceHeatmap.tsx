'use client';

import React from 'react';
import { Flame, CheckCircle, TrendingUp, Award } from 'lucide-react';

interface AdherenceHeatmapProps {
  percentage7d?: number;
  percentage30d?: number;
  streakDays?: number;
}

export default function AdherenceHeatmap({
  percentage7d = 94,
  percentage30d = 91,
  streakDays = 14,
}: AdherenceHeatmapProps) {
  // Generate 28 days mock data (4 weeks x 7 days)
  const daysGrid = Array.from({ length: 28 }).map((_, i) => {
    // 2 missed doses in past 28 days for realistic telemetry
    if (i === 5 || i === 19) return { status: 'missed', delay: 'Skipped' };
    if (i === 11 || i === 22) return { status: 'late', delay: '+45 min' };
    return { status: 'taken', delay: 'On time' };
  });

  return (
    <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center space-x-2">
            <span className="flex items-center text-xs font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
              <Award className="w-3.5 h-3.5 mr-1 text-emerald-700" />
              <span>Clinical Compliance Rating: Grade A</span>
            </span>
          </div>
          <h3 className="text-lg font-black text-slate-900 tracking-tight mt-1">
            30-Day Medication Adherence Heatmap
          </h3>
          <p className="text-xs text-slate-500">
            Telemetry recorded from physical pill dispenser and voice confirmation logs.
          </p>
        </div>

        {/* Streak Badge */}
        <div className="flex items-center space-x-2 px-3 py-2 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900">
          <Flame className="w-5 h-5 text-orange-500 fill-orange-400 animate-bounce" />
          <div>
            <div className="text-xs font-black tracking-tight">{streakDays}-Day Active Streak!</div>
            <div className="text-[10px] text-amber-800/80">Top 5% elder consistency</div>
          </div>
        </div>
      </div>

      {/* 28-day 4x7 Visual Grid */}
      <div>
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
          {daysGrid.map((d, idx) => {
            const isToday = idx === daysGrid.length - 1;
            const bgClass =
              d.status === 'taken'
                ? 'bg-emerald-500 text-white'
                : d.status === 'late'
                ? 'bg-amber-400 text-amber-950'
                : 'bg-rose-400 text-white';

            return (
              <div
                key={idx}
                className={`h-9 sm:h-10 rounded-xl flex items-center justify-center font-bold text-xs shadow-sm transition hover:scale-105 cursor-pointer relative group ${bgClass} ${
                  isToday ? 'ring-2 ring-emerald-700 ring-offset-1' : ''
                }`}
                title={`Day ${idx + 1}: ${d.status} (${d.delay})`}
              >
                <span>{idx + 1}</span>
                {/* Tooltip on hover */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-col items-center z-20 pointer-events-none">
                  <div className="bg-slate-900 text-white text-[10px] px-2 py-1 rounded shadow-lg whitespace-nowrap">
                    Day {idx + 1}: {d.delay}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between text-xs text-slate-500 mt-3 pt-3 border-t border-slate-100">
          <div className="flex items-center space-x-4">
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" />
              <span>Taken on-time (93%)</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 inline-block" />
              <span>Grace period / Late</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-400 inline-block" />
              <span>Missed Dose</span>
            </span>
          </div>

          <span className="text-[11px] font-semibold text-emerald-800">
            Target Adherence &gt;85% achieved
          </span>
        </div>
      </div>
    </div>
  );
}
