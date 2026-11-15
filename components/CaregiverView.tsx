'use client';

import React, { useState } from 'react';
import {
  Activity,
  Calendar,
  AlertTriangle,
  Plus,
  FileText,
  Clock,
  CheckCircle,
  XCircle,
  Download,
  ShieldCheck,
  Send,
  Pill,
  User,
  Phone,
  AlertCircle,
  ExternalLink,
  Search,
  Eye,
  MapPin,
  Sparkles,
} from 'lucide-react';
import {
  Medication,
  Appointment,
  ActivityFeedItem,
  VitalSign,
  UserRolePin,
  CareCircleMember,
  DrugInteraction,
} from '@/lib/types';
import { checkMedicationInteractions, checkNewMedicationSafety } from '@/lib/drugInteractions';
import SoundService from '@/lib/soundService';
import PillVisual3D from './PillVisual3D';
import AdherenceHeatmap from './AdherenceHeatmap';
import MedicationDetailModal from './MedicationDetailModal';

interface CaregiverViewProps {
  currentRole: UserRolePin;
  medications: Medication[];
  appointments: Appointment[];
  activities: ActivityFeedItem[];
  vitals: VitalSign[];
  circleMembers: CareCircleMember[];
  onAddMedication: (med: Partial<Medication>) => Promise<void>;
  onAddAppointment: (appt: Partial<Appointment>) => Promise<void>;
  onPostNote: (text: string) => Promise<void>;
  onOpenDoctorReport: () => void;
  onSendTestNotification: (type: 'daily_schedule' | 'missed_dose' | 'refill' | 'sos') => Promise<void>;
}

export default function CaregiverView({
  currentRole,
  medications,
  appointments,
  activities,
  vitals,
  circleMembers,
  onAddMedication,
  onAddAppointment,
  onPostNote,
  onOpenDoctorReport,
  onSendTestNotification,
}: CaregiverViewProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'medications' | 'interactions' | 'appointments' | 'notes'>('overview');
  const [selectedMedForDetail, setSelectedMedForDetail] = useState<Medication | null>(null);
  const [medCategoryFilter, setMedCategoryFilter] = useState<string>('all');
  
  // Note composer state
  const [newNoteText, setNewNoteText] = useState('');
  const [isPostingNote, setIsPostingNote] = useState(false);

  // New med modal state
  const [showAddMedModal, setShowAddMedModal] = useState(false);
  const [newMedName, setNewMedName] = useState('');
  const [newMedDosage, setNewMedDosage] = useState('');
  const [newMedPurpose, setNewMedPurpose] = useState('');
  const [newMedFood, setNewMedFood] = useState<'no-restriction' | 'with-food' | 'empty-stomach'>('with-food');
  const [newMedColor, setNewMedColor] = useState<'blue' | 'gold' | 'mint' | 'coral' | 'purple' | 'white' | 'amber'>('blue');
  const [newMedShape, setNewMedShape] = useState<'round' | 'oval' | 'capsule'>('round');
  const [newMedCount, setNewMedCount] = useState('30');
  const [newMedThreshold, setNewMedThreshold] = useState('5');

  // Prospective drug checker state
  const [checkerQuery, setCheckerQuery] = useState('');
  const [checkerResults, setCheckerResults] = useState<DrugInteraction[] | null>(null);

  // Check current interactions
  const currentInteractions = checkMedicationInteractions(medications);

  const handleTestProspective = (e: React.FormEvent) => {
    e.preventDefault();
    if (!checkerQuery.trim()) return;
    SoundService.playTap();
    const results = checkNewMedicationSafety(checkerQuery.trim(), medications);
    setCheckerResults(results);
  };

  const handleSaveMed = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMedName.trim() || !newMedDosage.trim()) return;

    SoundService.playPillTaken();
    await onAddMedication({
      name: newMedName.trim(),
      dosage: newMedDosage.trim(),
      purpose: newMedPurpose.trim() || 'General Health',
      foodRequirement: newMedFood,
      pillColor: newMedColor,
      pillShape: newMedShape,
      remainingCount: parseInt(newMedCount) || 30,
      totalRefillCount: parseInt(newMedCount) || 30,
      refillThreshold: parseInt(newMedThreshold) || 5,
      frequency: 'daily',
      schedules: [{ time: '08:00', label: 'Morning', doseTakenToday: false, status: 'pending' }],
      instructions: `Take 1 dose daily with water (${newMedFood.replace('-', ' ')}).`,
    });

    setShowAddMedModal(false);
    setNewMedName('');
    setNewMedDosage('');
    setNewMedPurpose('');
  };

  const handleCreateNote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newNoteText.trim()) return;
    setIsPostingNote(true);
    SoundService.playTap();
    await onPostNote(newNoteText);
    setNewNoteText('');
    setIsPostingNote(false);
  };

  // Filtered medications
  const filteredMeds = medications.filter(m => {
    if (medCategoryFilter === 'all') return true;
    if (medCategoryFilter === 'cardio') return m.purpose.toLowerCase().includes('pressure') || m.purpose.toLowerCase().includes('cholesterol') || m.purpose.toLowerCase().includes('cardio');
    if (medCategoryFilter === 'metabolic') return m.purpose.toLowerCase().includes('sugar') || m.purpose.toLowerCase().includes('diabetes');
    if (medCategoryFilter === 'pain') return m.purpose.toLowerCase().includes('pain') || m.purpose.toLowerCase().includes('arthritis');
    if (medCategoryFilter === 'vitamins') return m.purpose.toLowerCase().includes('bone') || m.purpose.toLowerCase().includes('vitamin');
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-24 px-4 sm:px-6">
      {/* Detail Modal */}
      <MedicationDetailModal
        medication={selectedMedForDetail}
        onClose={() => setSelectedMedForDetail(null)}
      />

      {/* Caregiver Command Header */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 border border-amber-200">
              {currentRole.label}
            </span>
            <span className="text-xs text-slate-400 font-medium">• Patient: Eleanor Vance (78 yo)</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            CareCircle Clinical & Family Portal
          </h1>
          <p className="text-sm text-slate-600 mt-0.5">
            Real-time adherence telemetry, clinical interaction alerts, and shared care coordination.
          </p>
        </div>

        {/* Action button bar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => {
              SoundService.playTap();
              onOpenDoctorReport();
            }}
            className="btn-tactile flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-extrabold text-sm shadow transition active:scale-95"
          >
            <FileText className="w-4 h-4 text-emerald-400" />
            <span>Physician Adherence Report</span>
          </button>
          <button
            onClick={() => {
              SoundService.playTap();
              setShowAddMedModal(true);
            }}
            className="btn-tactile flex items-center space-x-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-sm shadow transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Add Prescription</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 sm:space-x-2 border-b border-slate-200 overflow-x-auto pb-1">
        {[
          { id: 'overview', label: 'Adherence Overview', icon: Activity },
          { id: 'medications', label: `Medications (${medications.length})`, icon: Pill },
          { id: 'interactions', label: `Drug Safety (${currentInteractions.length})`, icon: AlertTriangle },
          { id: 'appointments', label: `Appointments (${appointments.length})`, icon: Calendar },
          { id: 'notes', label: 'Circle Feed & Notes', icon: Clock },
        ].map(tab => {
          const Icon = tab.icon;
          const isSelected = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                SoundService.playTap();
                setActiveTab(tab.id as any);
              }}
              className={`flex items-center space-x-2 px-4 py-3 rounded-t-2xl font-black text-sm transition border-b-2 whitespace-nowrap ${
                isSelected
                  ? 'border-emerald-600 text-emerald-900 bg-white shadow-sm'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-slate-100/60'
              }`}
            >
              <Icon className={`w-4 h-4 ${isSelected ? 'text-emerald-600' : 'text-slate-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab: Overview (Adherence Scorecard + Heatmap + Escalation Banner) */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Adherence Heatmap Visual Grid */}
          <AdherenceHeatmap percentage7d={94} percentage30d={91} streakDays={14} />

          {/* Adherence Scorecard Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">7-Day Adherence</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-emerald-600">94%</span>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">+4% vs last week</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">17 of 18 scheduled doses taken on schedule</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">30-Day Clinical Rate</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-slate-900">91%</span>
                <span className="text-xs text-slate-500">Benchmark: &gt;85%</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Qualifies for optimal hypertensive control</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Current Streak</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-amber-600">14 Days</span>
                <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full">Consistent</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">All morning doses taken before 08:30 AM</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Prescriptions Low</span>
              <div className="flex items-baseline space-x-2 mt-2">
                <span className="text-3xl font-extrabold text-rose-600">1</span>
                <span className="text-xs font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full">Refill Queued</span>
              </div>
              <p className="text-xs text-slate-500 mt-2">Atorvastatin Calcium (4 pills remaining)</p>
            </div>
          </div>

          {/* Low Refill Alert Banner */}
          <div className="bg-amber-50/80 border-2 border-amber-300 rounded-3xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-6 h-6 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-extrabold text-amber-950 text-base">Prescription Refill Threshold Warning</h3>
                <p className="text-xs text-amber-900 mt-0.5">
                  <strong>Atorvastatin 20mg</strong> has only <strong>4 pills remaining</strong> (below safe threshold of 5). Walgreens Pharmacy #4412 notification ready.
                </p>
              </div>
            </div>
            <button
              onClick={() => {
                SoundService.playTap();
                onSendTestNotification('refill');
              }}
              className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-sm transition active:scale-95 whitespace-nowrap"
            >
              Dispatch Pharmacy Email
            </button>
          </div>

          {/* Vitals Summary & Circle Contacts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Vitals */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <Activity className="w-5 h-5 text-emerald-600" />
                  <span>Recent Vital Signs Telemetry</span>
                </h3>
                <span className="text-xs text-slate-400">Live readings</span>
              </div>
              <div className="space-y-3">
                {vitals.slice(0, 4).map(v => (
                  <div key={v.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div>
                      <span className="text-xs font-bold uppercase text-slate-500">{v.type.replace('_', ' ')}</span>
                      <div className="flex items-baseline space-x-2">
                        <span className="text-xl font-black text-slate-900">{v.value}</span>
                        <span className="text-xs font-bold text-slate-500">{v.unit}</span>
                      </div>
                      <span className="text-[11px] text-slate-400">{v.measuredAt} • by {v.loggedBy}</span>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      v.status === 'normal' ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'
                    }`}>
                      {v.status.toUpperCase()}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Care Circle Members */}
            <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-extrabold text-slate-900 text-base flex items-center space-x-2">
                  <User className="w-5 h-5 text-indigo-600" />
                  <span>Active Care Circle Network</span>
                </h3>
                <span className="text-xs text-slate-400">3 Verified Members</span>
              </div>
              <div className="space-y-3">
                {circleMembers.map(m => (
                  <div key={m.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-200/70">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{m.avatar}</span>
                      <div>
                        <div className="flex items-center space-x-1.5">
                          <span className="font-extrabold text-slate-900 text-sm">{m.name}</span>
                          {m.isPrimaryContact && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              Primary
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-slate-500">{m.relationship}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 block">{m.phone}</span>
                      <span className="text-[11px] text-emerald-600 font-medium">Synced</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Medications (Elevated Prescription Catalog with 3D Visualizer & Category Filters) */}
      {activeTab === 'medications' && (
        <div className="space-y-4">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-xl font-black text-slate-900 tracking-tight">Active Prescriptions & Regimens</h3>
              <p className="text-xs text-slate-500">Track 3D pill appearances, schedules, remaining counts, and pharmacy details.</p>
            </div>

            {/* Filter pills */}
            <div className="flex flex-wrap gap-1.5 text-xs">
              {[
                { id: 'all', label: `All (${medications.length})` },
                { id: 'cardio', label: 'Heart & BP' },
                { id: 'metabolic', label: 'Diabetes' },
                { id: 'pain', label: 'Pain & Joint' },
                { id: 'vitamins', label: 'Supplements' },
              ].map(f => (
                <button
                  key={f.id}
                  onClick={() => {
                    SoundService.playTap();
                    setMedCategoryFilter(f.id);
                  }}
                  className={`px-3 py-1.5 rounded-xl font-bold transition ${
                    medCategoryFilter === f.id
                      ? 'bg-slate-900 text-white shadow-sm'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* Cards Grid with 3D Pill Renderers */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMeds.map(med => {
              const stockPct = Math.round((med.remainingCount / med.totalRefillCount) * 100);
              const isLow = med.remainingCount <= med.refillThreshold;

              return (
                <div
                  key={med.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-slate-50 rounded-2xl border border-slate-200/80 shadow-inner flex items-center justify-center">
                          <PillVisual3D
                            shape={med.pillShape}
                            color={med.pillColor}
                            dosage={med.dosage}
                            size="md"
                          />
                        </div>
                        <div>
                          <h4 className="font-black text-slate-900 text-base leading-snug">
                            {med.name}
                          </h4>
                          <span className="text-xs font-bold text-emerald-700">
                            {med.dosage} • {med.frequency}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                          isLow ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {isLow ? 'Low Stock' : 'Active'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 font-medium">
                      {med.instructions}
                    </p>

                    <div className="text-[11px] text-slate-400 space-y-0.5">
                      <div>Prescriber: {med.prescribingDoctor}</div>
                      <div className="font-mono">Rx: {med.prescriptionNumber}</div>
                    </div>
                  </div>

                  {/* Stock Bar & Detail Inspection Button */}
                  <div className="space-y-2 pt-2 border-t border-slate-100">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500 font-medium">Remaining Supply:</span>
                      <span className={`font-black ${isLow ? 'text-rose-600' : 'text-slate-800'}`}>
                        {med.remainingCount} / {med.totalRefillCount} pills
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${isLow ? 'bg-rose-500' : 'bg-emerald-500'}`}
                        style={{ width: `${Math.min(stockPct, 100)}%` }}
                      />
                    </div>

                    <button
                      onClick={() => {
                        SoundService.playTap();
                        setSelectedMedForDetail(med);
                      }}
                      className="w-full mt-2 py-2 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-700 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-95"
                    >
                      <Eye className="w-3.5 h-3.5 text-slate-500" />
                      <span>Inspect Clinical Sheet</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Drug Interaction Matrix */}
      {activeTab === 'interactions' && (
        <div className="space-y-6">
          {/* Active alerts */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <span>Clinical Drug-to-Drug & Drug-to-Food Matrix</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                Automated clinical safety rules evaluating Eleanor&apos;s active regimen against high-risk pharmacological interactions.
              </p>
            </div>

            <div className="space-y-3">
              {currentInteractions.map(int => (
                <div
                  key={int.id}
                  className={`p-5 rounded-2xl border-2 space-y-2 ${
                    int.severity === 'critical'
                      ? 'bg-rose-50/70 border-rose-300 text-rose-950'
                      : int.severity === 'major'
                      ? 'bg-amber-50/70 border-amber-300 text-amber-950'
                      : 'bg-blue-50/70 border-blue-300 text-blue-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black uppercase tracking-wider ${
                        int.severity === 'critical' ? 'bg-rose-600 text-white' : int.severity === 'major' ? 'bg-amber-600 text-white' : 'bg-blue-600 text-white'
                      }`}>
                        {int.severity} RISK
                      </span>
                      <h4 className="font-extrabold text-base">
                        {int.drugA} {int.drugB ? `+ ${int.drugB}` : `+ ${int.foodOrSubstance}`}
                      </h4>
                    </div>
                    <span className="text-xs font-bold uppercase tracking-wider opacity-70">{int.type}</span>
                  </div>

                  <p className="text-sm font-semibold">
                    <strong>Elder Explanation:</strong> {int.elderExplanation}
                  </p>

                  <div className="p-3 bg-white/80 rounded-xl text-xs space-y-1">
                    <p><strong>Clinical Mechanism:</strong> {int.clinicalSummary}</p>
                    <p className="text-emerald-800 font-bold"><strong>Action / Recommendation:</strong> {int.recommendation}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Prospective Interaction Checker */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
            <h3 className="text-base font-extrabold text-slate-900 flex items-center space-x-2">
              <Search className="w-5 h-5 text-indigo-600" />
              <span>Prospective Prescription Safety Checker</span>
            </h3>
            <p className="text-xs text-slate-500">
              Type any new prospective drug or substance (e.g. &ldquo;Warfarin&rdquo;, &ldquo;Ibuprofen&rdquo;, &ldquo;Grapefruit&rdquo;, &ldquo;Potassium&rdquo;) to test safety against Eleanor&apos;s active medications.
            </p>

            <form onSubmit={handleTestProspective} className="flex gap-2">
              <input
                type="text"
                value={checkerQuery}
                onChange={e => setCheckerQuery(e.target.value)}
                placeholder="e.g. Ibuprofen or Grapefruit"
                className="flex-1 px-4 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-sm shadow transition"
              >
                Evaluate Safety
              </button>
            </form>

            {checkerResults !== null && (
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in">
                {checkerResults.length === 0 ? (
                  <div className="flex items-center space-x-2 text-emerald-700 font-bold text-sm">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                    <span>No severe clinical conflicts detected for &ldquo;{checkerQuery}&rdquo; with current medications.</span>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-rose-600 uppercase">
                      ⚠️ {checkerResults.length} Interaction(s) Flagged:
                    </span>
                    {checkerResults.map(r => (
                      <div key={r.id} className="p-3 bg-white rounded-xl border border-rose-200 text-xs space-y-1">
                        <strong className="text-rose-700 block">{r.drugA} + {r.drugB || r.foodOrSubstance} ({r.severity.toUpperCase()})</strong>
                        <p>{r.elderExplanation}</p>
                        <p className="text-emerald-700 font-semibold">{r.recommendation}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Appointments with Enhanced Card Layout */}
      {activeTab === 'appointments' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900">Upcoming Healthcare Appointments</h3>
              <p className="text-xs text-slate-500">Transportation, clinic locations, and calendar sync.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {appointments.map(a => (
              <div key={a.id} className="p-5 rounded-3xl border-2 border-slate-200/90 space-y-3 bg-slate-50/50 flex flex-col justify-between hover:shadow-md transition">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-emerald-800 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200">
                      {a.specialty}
                    </span>
                    <span className="text-xs text-slate-400 font-bold uppercase">{a.status}</span>
                  </div>
                  <h4 className="font-extrabold text-slate-900 text-base mt-2">{a.title}</h4>
                  <p className="text-xs text-slate-600 font-semibold">{a.doctorName} • {a.clinic}</p>

                  <div className="mt-3 space-y-1.5 text-xs text-slate-600">
                    <p className="flex items-center space-x-1.5">
                      <Calendar className="w-3.5 h-3.5 text-emerald-600" />
                      <span><strong>Date:</strong> {a.date} at {a.time}</span>
                    </p>
                    <p className="flex items-center space-x-1.5">
                      <MapPin className="w-3.5 h-3.5 text-rose-500" />
                      <span>{a.location}</span>
                    </p>
                    {a.notes && <p className="bg-white p-2 rounded-xl border border-slate-200/80 text-[11px]">📝 {a.notes}</p>}
                    <p className="text-[11px] text-indigo-700 font-bold">
                      🚗 Transportation: {a.transportationArranged ? 'Arranged (Sarah)' : 'Needs ride'}
                    </p>
                  </div>
                </div>

                <a
                  href={`/api/appointments?format=ics&id=${a.id}`}
                  download={`carecircle-${a.id}.ics`}
                  onClick={() => SoundService.playTap()}
                  className="flex items-center justify-center space-x-1.5 px-3 py-2.5 rounded-xl bg-white hover:bg-slate-100 text-slate-800 text-xs font-bold border border-slate-200 shadow-sm transition active:scale-95"
                >
                  <Download className="w-3.5 h-3.5 text-slate-600" />
                  <span>Sync to Calendar (.ICS)</span>
                </a>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Feed & Collaborative Notes */}
      {activeTab === 'notes' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200/90 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-extrabold text-slate-900">Care Circle Activity Timeline & Family Notes</h3>
            <p className="text-xs text-slate-500">Continuous coordination log between Eleanor, Sarah, Nurse David, and Dr. Chen.</p>
          </div>

          {/* New note composer */}
          <form onSubmit={handleCreateNote} className="space-y-3">
            <textarea
              value={newNoteText}
              onChange={e => setNewNoteText(e.target.value)}
              placeholder="Post a caregiver observation or note (e.g. 'Stopped by with groceries. Eleanor was in great spirits and had finished breakfast.')..."
              rows={3}
              className="w-full p-4 rounded-2xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm font-medium"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={isPostingNote || !newNoteText.trim()}
                className="btn-tactile flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white font-bold text-sm shadow transition"
              >
                <Send className="w-4 h-4" />
                <span>{isPostingNote ? 'Posting...' : 'Post to Care Circle'}</span>
              </button>
            </div>
          </form>

          {/* Activity items */}
          <div className="space-y-3 border-t border-slate-100 pt-4">
            {activities.map(act => (
              <div key={act.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200/70 space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-slate-800">{act.actor.name}</span>
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-bold bg-slate-200 text-slate-700">
                      {act.actor.role}
                    </span>
                  </div>
                  <span className="text-slate-400">{act.timestamp}</span>
                </div>
                <h5 className="font-bold text-slate-900 text-sm">{act.title}</h5>
                <p className="text-xs text-slate-600">{act.description}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddMedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 space-y-4">
            <h3 className="text-xl font-bold text-slate-900">Add New Prescription / Supplement</h3>
            <form onSubmit={handleSaveMed} className="space-y-3 text-sm">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Medication Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Furosemide or Multivitamin"
                  value={newMedName}
                  onChange={e => setNewMedName(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Dosage</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. 20 mg or 1 tablet"
                    value={newMedDosage}
                    onChange={e => setNewMedDosage(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Purpose</label>
                  <input
                    type="text"
                    placeholder="e.g. Blood pressure"
                    value={newMedPurpose}
                    onChange={e => setNewMedPurpose(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Food Requirement</label>
                  <select
                    value={newMedFood}
                    onChange={e => setNewMedFood(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="with-food">With Food / Meals</option>
                    <option value="empty-stomach">Empty Stomach</option>
                    <option value="no-restriction">No Restriction</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-600 mb-1">Pill Shape</label>
                  <select
                    value={newMedShape}
                    onChange={e => setNewMedShape(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 font-medium bg-white"
                  >
                    <option value="round">Round Pill</option>
                    <option value="oval">Oval Tablet</option>
                    <option value="capsule">Capsule</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1">Pill Color Badge</label>
                <div className="flex gap-2">
                  {(['blue', 'gold', 'mint', 'coral', 'purple', 'white', 'amber'] as const).map(c => (
                    <button
                      type="button"
                      key={c}
                      onClick={() => setNewMedColor(c)}
                      className={`w-7 h-7 rounded-full border-2 transition ${
                        newMedColor === c ? 'scale-110 ring-2 ring-emerald-500' : 'opacity-70'
                      }`}
                      style={{
                        backgroundColor:
                          c === 'blue' ? '#38bdf8' : c === 'gold' ? '#fbbf24' : c === 'mint' ? '#34d399' : c === 'coral' ? '#fb7185' : c === 'purple' ? '#c084fc' : c === 'amber' ? '#f97316' : '#f1f5f9',
                      }}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowAddMedModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 shadow"
                >
                  Save Prescription
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
