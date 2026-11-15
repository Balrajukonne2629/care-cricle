'use client';

import React from 'react';
import { PillShape, PillColor } from '@/lib/types';

interface PillVisual3DProps {
  shape: PillShape;
  color: PillColor;
  dosage?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showDetails?: boolean;
}

export default function PillVisual3D({
  shape,
  color,
  dosage = '',
  size = 'md',
  showDetails = false,
}: PillVisual3DProps) {
  // Extract number from dosage for pill imprint e.g. "500mg" -> "500"
  const imprint = dosage.replace(/[^0-9]/g, '').slice(0, 4) || 'Rx';

  // Dimensional sizes
  const sizeMap = {
    sm: {
      round: 'w-7 h-7 text-[8px]',
      oval: 'w-9 h-6 text-[8px]',
      capsule: 'w-10 h-5 text-[8px]',
    },
    md: {
      round: 'w-10 h-10 text-[10px]',
      oval: 'w-13 h-8 text-[9px]',
      capsule: 'w-14 h-7 text-[9px]',
    },
    lg: {
      round: 'w-14 h-14 text-xs',
      oval: 'w-18 h-10 text-xs',
      capsule: 'w-20 h-9 text-xs',
    },
    xl: {
      round: 'w-20 h-20 text-sm',
      oval: 'w-28 h-14 text-sm',
      capsule: 'w-32 h-12 text-sm',
    },
  };

  // Color configurations with primary & secondary tone for capsule splits
  const colorPalette: Record<
    string,
    { primary: string; secondary: string; text: string; border: string }
  > = {
    blue: {
      primary: 'bg-gradient-to-br from-sky-400 to-sky-600',
      secondary: 'bg-gradient-to-br from-slate-100 to-slate-200',
      text: 'text-sky-950',
      border: 'border-sky-400',
    },
    gold: {
      primary: 'bg-gradient-to-br from-amber-300 to-amber-500',
      secondary: 'bg-gradient-to-br from-amber-100 to-amber-200',
      text: 'text-amber-950',
      border: 'border-amber-400',
    },
    mint: {
      primary: 'bg-gradient-to-br from-emerald-400 to-emerald-600',
      secondary: 'bg-gradient-to-br from-emerald-100 to-emerald-200',
      text: 'text-emerald-950',
      border: 'border-emerald-400',
    },
    coral: {
      primary: 'bg-gradient-to-br from-rose-400 to-rose-600',
      secondary: 'bg-gradient-to-br from-slate-100 to-slate-200',
      text: 'text-rose-950',
      border: 'border-rose-400',
    },
    purple: {
      primary: 'bg-gradient-to-br from-purple-400 to-purple-600',
      secondary: 'bg-gradient-to-br from-purple-100 to-purple-200',
      text: 'text-purple-950',
      border: 'border-purple-400',
    },
    white: {
      primary: 'bg-gradient-to-br from-slate-50 to-slate-200',
      secondary: 'bg-gradient-to-br from-slate-200 to-slate-300',
      text: 'text-slate-800',
      border: 'border-slate-300',
    },
    amber: {
      primary: 'bg-gradient-to-br from-orange-400 to-orange-600',
      secondary: 'bg-gradient-to-br from-orange-100 to-orange-200',
      text: 'text-orange-950',
      border: 'border-orange-400',
    },
  };

  const currentTheme = colorPalette[color] || colorPalette.blue;

  if (shape === 'capsule') {
    return (
      <div
        className={`pill-3d relative rounded-full border border-black/10 flex items-center justify-between ${sizeMap[size].capsule}`}
        title={`${color} capsule (${dosage})`}
      >
        {/* Left half */}
        <div
          className={`h-full w-1/2 ${currentTheme.primary} flex items-center justify-center font-black ${currentTheme.text} tracking-wider opacity-90`}
        >
          <span className="drop-shadow-sm select-none">{imprint.slice(0, 2)}</span>
        </div>

        {/* Center seam joint */}
        <div className="w-[1px] h-full bg-black/25 z-10" />

        {/* Right half */}
        <div
          className={`h-full w-1/2 ${currentTheme.secondary} flex items-center justify-center font-black text-slate-700 tracking-wider`}
        >
          <span className="drop-shadow-sm select-none">{imprint.slice(2, 4) || '•'}</span>
        </div>

        {/* Gloss sheen */}
        <div className="pill-gloss" />
      </div>
    );
  }

  if (shape === 'oval') {
    return (
      <div
        className={`pill-3d relative rounded-[50%] border border-black/10 flex items-center justify-center font-black ${currentTheme.primary} ${currentTheme.text} ${sizeMap[size].oval}`}
        title={`${color} oval tablet (${dosage})`}
      >
        <span className="drop-shadow-sm font-extrabold select-none">{imprint}</span>
        <div className="pill-scoreline opacity-50" />
        <div className="pill-gloss" />
      </div>
    );
  }

  // Round Tablet
  return (
    <div
      className={`pill-3d relative rounded-full border border-black/10 flex items-center justify-center font-black ${currentTheme.primary} ${currentTheme.text} ${sizeMap[size].round}`}
      title={`${color} round tablet (${dosage})`}
    >
      <span className="drop-shadow-sm font-extrabold select-none">{imprint}</span>
      <div className="pill-scoreline opacity-60" />
      <div className="pill-gloss" />
    </div>
  );
}
