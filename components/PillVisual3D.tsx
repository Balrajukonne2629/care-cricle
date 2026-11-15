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

/**
 * Authentic Pharmaceutical Tablet & Capsule Visualizer
 * Replaces cartoon candy aesthetics with clinical-grade, realistic tablet textures,
 * pharmaceutical deboss markings, and scored divide lines.
 */
export default function PillVisual3D({
  shape,
  color,
  dosage = '',
  size = 'md',
}: PillVisual3DProps) {
  // Extract imprint code e.g. "40", "500", "10"
  const imprint = dosage.replace(/[^0-9]/g, '').slice(0, 4) || 'Rx';

  // Clinical color configurations (Matte pharmaceutical grade, non-cartoon)
  const clinicalPalette: Record<
    PillColor,
    {
      top: string;
      bottom: string;
      rim: string;
      text: string;
      border: string;
      shadow: string;
    }
  > = {
    coral: {
      top: '#fb7185', // Film-coated pink / rose (Telma 40)
      bottom: '#f43f5e',
      rim: '#e11d48',
      text: '#881337',
      border: '#fda4af',
      shadow: 'rgba(244, 63, 94, 0.25)',
    },
    amber: {
      top: '#fbbf24', // Yellow capsule top (Pan-D)
      bottom: '#f59e0b',
      rim: '#d97706',
      text: '#78350f',
      border: '#fde68a',
      shadow: 'rgba(245, 158, 11, 0.25)',
    },
    white: {
      top: '#ffffff', // Scored chalk white (Glycomet-SR)
      bottom: '#f1f5f9',
      rim: '#cbd5e1',
      text: '#475569',
      border: '#e2e8f0',
      shadow: 'rgba(148, 163, 184, 0.25)',
    },
    gold: {
      top: '#fcd34d', // Enteric coated amber-gold (Rosuvas 10 / Ecosprin)
      bottom: '#f59e0b',
      rim: '#b45309',
      text: '#78350f',
      border: '#fde68a',
      shadow: 'rgba(217, 119, 6, 0.25)',
    },
    mint: {
      top: '#a7f3d0', // Pale mint green (Shelcal 500)
      bottom: '#6ee7b7',
      rim: '#059669',
      text: '#064e3b',
      border: '#d1fae5',
      shadow: 'rgba(16, 185, 129, 0.25)',
    },
    blue: {
      top: '#93c5fd', // Clinical pale blue
      bottom: '#60a5fa',
      rim: '#2563eb',
      text: '#1e3a8a',
      border: '#bfdbfe',
      shadow: 'rgba(37, 99, 235, 0.25)',
    },
    purple: {
      top: '#c4b5fd',
      bottom: '#a78bfa',
      rim: '#7c3aed',
      text: '#4c1d95',
      border: '#ddd6fe',
      shadow: 'rgba(124, 58, 237, 0.25)',
    },
  };

  const palette = clinicalPalette[color] || clinicalPalette.white;

  // Dimensions
  const dims = {
    sm: { w: 32, h: 32, font: '9px', capsuleW: 38, capsuleH: 20 },
    md: { w: 46, h: 46, font: '11px', capsuleW: 56, capsuleH: 26 },
    lg: { w: 60, h: 60, font: '13px', capsuleW: 74, capsuleH: 34 },
    xl: { w: 80, h: 80, font: '15px', capsuleW: 96, capsuleH: 42 },
  }[size];

  // Render authentic capsule
  if (shape === 'capsule') {
    return (
      <div
        className="relative inline-flex items-center justify-center shrink-0 transition-transform select-none"
        style={{
          width: `${dims.capsuleW}px`,
          height: `${dims.capsuleH}px`,
          filter: `drop-shadow(0 4px 6px ${palette.shadow})`,
        }}
      >
        <div
          className="w-full h-full rounded-full flex overflow-hidden border"
          style={{
            borderColor: palette.rim,
            background: '#ffffff',
          }}
        >
          {/* Left half colored gelatin */}
          <div
            className="w-1/2 h-full flex items-center justify-center font-bold text-white tracking-tighter"
            style={{
              background: `linear-gradient(135deg, ${palette.top} 0%, ${palette.bottom} 100%)`,
              fontSize: dims.font,
              borderRight: '1px solid rgba(0,0,0,0.1)',
            }}
          >
            {imprint}
          </div>
          {/* Right half opaque white gelatin with debossed Rx */}
          <div
            className="w-1/2 h-full flex items-center justify-center font-bold text-slate-500 tracking-tighter"
            style={{
              background: 'linear-gradient(135deg, #ffffff 0%, #f1f5f9 100%)',
              fontSize: dims.font,
            }}
          >
            Rx
          </div>
        </div>
      </div>
    );
  }

  // Render oval caplet with scored center line
  if (shape === 'oval') {
    return (
      <div
        className="relative inline-flex items-center justify-center shrink-0 transition-transform select-none"
        style={{
          width: `${dims.capsuleW}px`,
          height: `${dims.capsuleH}px`,
          filter: `drop-shadow(0 4px 6px ${palette.shadow})`,
        }}
      >
        <div
          className="w-full h-full rounded-full flex items-center justify-center font-bold relative border overflow-hidden"
          style={{
            background: `linear-gradient(145deg, ${palette.top} 0%, ${palette.bottom} 100%)`,
            borderColor: palette.rim,
            color: palette.text,
            fontSize: dims.font,
          }}
        >
          {/* Scored score-line in tablet center */}
          <div
            className="absolute top-1 bottom-1 w-[1.5px] opacity-40"
            style={{
              background: palette.text,
              left: '50%',
              transform: 'translateX(-50%)',
            }}
          />
          <span className="relative z-10 font-black tracking-tight">{imprint}</span>
        </div>
      </div>
    );
  }

  // Render round tablet with beveled pharmaceutical rim
  return (
    <div
      className="relative inline-flex items-center justify-center shrink-0 transition-transform select-none"
      style={{
        width: `${dims.w}px`,
        height: `${dims.h}px`,
        filter: `drop-shadow(0 4px 6px ${palette.shadow})`,
      }}
    >
      <div
        className="w-full h-full rounded-full flex items-center justify-center font-black relative border"
        style={{
          background: `radial-gradient(circle at 35% 35%, ${palette.top} 0%, ${palette.bottom} 90%)`,
          borderColor: palette.rim,
          color: palette.text,
          fontSize: dims.font,
        }}
      >
        {/* Subtle tablet score line */}
        <div
          className="absolute inset-y-1.5 w-[1px] opacity-35"
          style={{
            background: palette.text,
            left: '50%',
            transform: 'translateX(-50%)',
          }}
        />
        <span className="relative z-10 tracking-tight font-extrabold">{imprint}</span>
      </div>
    </div>
  );
}
