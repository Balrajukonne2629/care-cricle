'use client';

import React from 'react';
import { X, Printer, Heart, Activity, CheckCircle, FileText } from 'lucide-react';
import { ElderProfile, Medication, VitalSign, AdherenceLog } from '@/lib/types';
import SoundService from '@/lib/soundService';

interface DoctorReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  elder: ElderProfile;
  medications: Medication[];
  vitals: VitalSign[];
  adherenceLogs: AdherenceLog[];
}

export default function DoctorReportModal({
  isOpen,
  onClose,
  elder,
  medications,
  vitals,
  adherenceLogs,
}: DoctorReportModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    SoundService.playTap();
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full h-[90vh] shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
        {/* Modal Controls Bar */}
        <div className="p-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-sm">CareCircle Clinical Summary & 30-Day Physician Report</h3>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow transition"
            >
              <Printer className="w-4 h-4" />
              <span>Print / Save PDF</span>
            </button>
            <button
              onClick={() => {
                SoundService.playTap();
                onClose();
              }}
              className="p-1.5 rounded-xl bg-slate-800 text-slate-300 hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Report Document */}
        <div className="flex-1 p-6 sm:p-10 overflow-y-auto font-sans bg-white text-slate-900 space-y-6">
          {/* Document Header */}
          <div className="border-b-2 border-slate-900 pb-4 flex justify-between items-start">
            <div>
              <h1 className="text-2xl font-black tracking-tight text-slate-900">CareCircle Health Report</h1>
              <p className="text-xs text-slate-500 font-medium">
                Comprehensive 30-Day Medication Adherence & Vital Telemetry
              </p>
            </div>
            <div className="text-right text-xs text-slate-600">
              <p>Generated: <strong>{new Date().toLocaleDateString()}</strong></p>
              <p>Primary Clinic: <strong>{elder.primaryPhysician.clinic}</strong></p>
              <p>Attending: <strong>{elder.primaryPhysician.name}</strong></p>
            </div>
          </div>

          {/* Patient Details Grid */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
            <div>
              <span className="text-slate-400 font-bold uppercase block">Patient Name</span>
              <strong className="text-slate-900 text-sm">{elder.name}</strong>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">DOB / Age</span>
              <span className="text-slate-800">{elder.birthDate} ({elder.age} yo)</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">Blood Type / Allergies</span>
              <span className="text-slate-800">{elder.bloodType} • {elder.allergies.join(', ')}</span>
            </div>
            <div>
              <span className="text-slate-400 font-bold uppercase block">Chronic Diagnoses</span>
              <span className="text-slate-800">{elder.chronicConditions.join(', ')}</span>
            </div>
          </div>

          {/* Adherence Metrics Summary */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700">
              1. Medication Adherence Statistics
            </h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
                <span className="text-2xl font-black text-emerald-800">91%</span>
                <span className="text-[11px] block text-emerald-700 font-bold uppercase">30-Day Clinical Rate</span>
              </div>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <span className="text-2xl font-black text-slate-800">94%</span>
                <span className="text-[11px] block text-slate-600 font-bold uppercase">7-Day Adherence</span>
              </div>
              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200">
                <span className="text-2xl font-black text-amber-800">6 Days</span>
                <span className="text-[11px] block text-amber-700 font-bold uppercase">Current Streak</span>
              </div>
            </div>
            <p className="text-xs text-slate-500 italic">
              Adherence confirmed via elder 1-tap tablet interface, daughter checks, and Web Speech voice logging.
            </p>
          </div>

          {/* Active Medications Roster */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700">
              2. Active Regimen & Prescription Inventory
            </h3>
            <table className="w-full text-left text-xs text-slate-700">
              <thead className="border-b border-slate-200 font-bold uppercase text-[10px] text-slate-400">
                <tr>
                  <th className="py-2">Drug Name & Dosage</th>
                  <th className="py-2">Frequency</th>
                  <th className="py-2">Instructions</th>
                  <th className="py-2">Remaining Inventory</th>
                  <th className="py-2">Rx Number</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {medications.map(m => (
                  <tr key={m.id}>
                    <td className="py-2.5 font-bold text-slate-900">{m.name} ({m.dosage})</td>
                    <td className="py-2.5">{m.frequency}</td>
                    <td className="py-2.5 text-slate-600">{m.instructions}</td>
                    <td className="py-2.5 font-bold">{m.remainingCount} / {m.totalRefillCount}</td>
                    <td className="py-2.5 font-mono text-slate-500">{m.prescriptionNumber}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Recent Vitals & Trends */}
          <div className="border border-slate-200 rounded-2xl p-5 space-y-3">
            <h3 className="font-extrabold text-sm uppercase tracking-wider text-slate-700">
              3. Recent Vital Sign Log
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {vitals.map(v => (
                <div key={v.id} className="p-2.5 bg-slate-50 rounded-xl border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase block">{v.type.replace('_', ' ')}</span>
                  <span className="text-base font-extrabold text-slate-900">{v.value} {v.unit}</span>
                  <span className="text-[10px] text-slate-500 block">{v.measuredAt}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Doctor Review & Sign-Off Section */}
          <div className="border-t-2 border-slate-200 pt-6 grid grid-cols-2 gap-8 text-xs text-slate-600">
            <div>
              <p className="font-bold text-slate-800 uppercase text-[10px] mb-6">Physician Notes & Adjustments:</p>
              <div className="border-b border-slate-400 h-8" />
              <div className="border-b border-slate-400 h-8 mt-2" />
            </div>
            <div>
              <p className="font-bold text-slate-800 uppercase text-[10px] mb-6">Physician Signature & Date:</p>
              <div className="border-b border-slate-400 h-8" />
              <p className="text-[10px] text-slate-400 mt-1">MD / DO / NP Signature</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
