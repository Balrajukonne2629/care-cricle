'use client';

import React from 'react';
import { Medication } from '@/lib/types';
import PillVisual3D from './PillVisual3D';
import {
  X,
  ShieldCheck,
  AlertTriangle,
  Clock,
  Utensils,
  Phone,
  Droplets,
  Calendar,
  Building,
  FileCheck,
} from 'lucide-react';
import SoundService from '@/lib/soundService';

interface MedicationDetailModalProps {
  medication: Medication | null;
  onClose: () => void;
  onTakeDose?: (medId: string, time: string) => void;
}

export default function MedicationDetailModal({
  medication,
  onClose,
  onTakeDose,
}: MedicationDetailModalProps) {
  if (!medication) return null;

  const stockPercentage = Math.round(
    (medication.remainingCount / medication.totalRefillCount) * 100
  );

  const daysRemaining = medication.remainingCount; // Assuming 1 dose per day for simple calculation

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-lg w-full border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header with Pill Visual Preview */}
        <div className="bg-gradient-to-br from-slate-50 via-teal-50/40 to-slate-100 p-6 border-b border-slate-200 relative">
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/80 hover:bg-white text-slate-500 hover:text-slate-800 border border-slate-200 shadow-sm transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-5">
            {/* 3D Pill Preview */}
            <div className="p-3 bg-white rounded-2xl border border-slate-200/80 shadow-md flex items-center justify-center">
              <PillVisual3D
                shape={medication.pillShape}
                color={medication.pillColor}
                dosage={medication.dosage}
                size="lg"
              />
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded-full text-[11px] font-extrabold uppercase tracking-wide bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Rx Prescribed
                </span>
                <span className="text-xs text-slate-500 font-medium capitalize">
                  {medication.pillColor} {medication.pillShape}
                </span>
              </div>
              <h2 className="text-2xl font-black text-slate-900 tracking-tight mt-0.5">
                {medication.name}
              </h2>
              <p className="text-sm font-bold text-emerald-700">
                {medication.dosage} • {medication.frequency}
              </p>
            </div>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 space-y-5 overflow-y-auto">
          {/* Plain English Purpose */}
          <div className="bg-emerald-50/60 rounded-2xl p-4 border border-emerald-200/60">
            <h4 className="text-xs font-black uppercase tracking-wider text-emerald-900 flex items-center space-x-1.5 mb-1">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              <span>Why Eleanor Takes This</span>
            </h4>
            <p className="text-sm text-slate-700 font-medium leading-relaxed">
              {medication.purpose}. Helps maintain healthy blood pressure and protects cardiovascular stability.
            </p>
          </div>

          {/* Administration Instructions */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-500">
              Administration & Instructions
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5">
                <Utensils className="w-4 h-4 text-amber-600 shrink-0" />
                <span className="font-semibold text-slate-700 capitalize">
                  {medication.foodRequirement.replace('-', ' ')}
                </span>
              </div>
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 flex items-center space-x-2.5">
                <Droplets className="w-4 h-4 text-sky-600 shrink-0" />
                <span className="font-semibold text-slate-700">Full 8oz water glass</span>
              </div>
            </div>
            <p className="text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-slate-200">
              {medication.instructions}
            </p>
          </div>

          {/* Refill Gauge */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-extrabold text-slate-800">
                Supply & Pharmacy Refill
              </span>
              <span
                className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  medication.remainingCount <= medication.refillThreshold
                    ? 'bg-rose-100 text-rose-800'
                    : 'bg-emerald-100 text-emerald-800'
                }`}
              >
                {medication.remainingCount} pills remaining (~{daysRemaining} days)
              </span>
            </div>

            {/* Visual Bar */}
            <div className="w-full bg-slate-200 h-2.5 rounded-full overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${
                  medication.remainingCount <= medication.refillThreshold
                    ? 'bg-rose-500'
                    : 'bg-emerald-500'
                }`}
                style={{ width: `${Math.min(stockPercentage, 100)}%` }}
              />
            </div>
            <div className="flex justify-between text-[11px] text-slate-400 mt-1">
              <span>Threshold: {medication.refillThreshold} doses</span>
              <span>Total Bottle: {medication.totalRefillCount} doses</span>
            </div>
          </div>

          {/* Clinical Pharmacy Label */}
          <div className="border border-slate-200 rounded-2xl p-3.5 bg-white text-xs text-slate-600 space-y-1.5 font-mono">
            <div className="flex justify-between text-slate-800 font-bold">
              <span>CVS PHARMACY #4291</span>
              <span>Rx #7829104-B</span>
            </div>
            <div className="text-[11px] text-slate-500">
              Prescriber: Dr. Michael Chen, MD • Phone: (555) 392-1084
            </div>
            <div className="text-[10px] text-slate-400 border-t border-slate-100 pt-1">
              Store at 20°C to 25°C (68°F to 77°F). Keep container tightly closed.
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={() => {
              SoundService.playTap();
              onClose();
            }}
            className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 text-white font-bold text-sm shadow-sm transition active:scale-95"
          >
            Close Details
          </button>
        </div>
      </div>
    </div>
  );
}
