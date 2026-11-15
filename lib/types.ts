export type Role = 'elder' | 'family' | 'nurse' | 'doctor' | 'system';
export type NativeLanguage = 'en' | 'hi' | 'te' | 'ta';

export interface UserRolePin {
  role: Role;
  name: string;
  pin: string;
  label: string;
  relationship: string;
  avatarColor: string;
}

export interface CareCircleMember {
  id: string;
  name: string;
  role: Role;
  relationship: string;
  phone: string;
  email: string;
  isPrimaryContact: boolean;
  avatar: string;
  notificationPreferences: {
    sms: boolean;
    email: boolean;
    push: boolean;
    urgentCalls: boolean;
  };
}

export interface ElderProfile {
  id: string;
  name: string;
  preferredName: string;
  birthDate: string;
  age: number;
  gender: string;
  bloodType: string;
  allergies: string[];
  chronicConditions: string[];
  address: string;
  apartmentSuite?: string;
  emergencyNotes: string;
  preferredVoice: string;
  voiceSpeed: number;
  fontSize: 'standard' | 'large' | 'extra-large';
  highContrast: boolean;
  preferredLanguage?: NativeLanguage;
  primaryPhysician: {
    name: string;
    clinic: string;
    phone: string;
  };
  preferredPharmacy: {
    name: string;
    address: string;
    phone: string;
  };
}

export type PillColor = 'blue' | 'gold' | 'mint' | 'coral' | 'purple' | 'white' | 'amber';
export type PillShape = 'round' | 'oval' | 'capsule' | 'diamond' | 'square';
export type FoodRequirement = 'empty-stomach' | 'with-food' | 'after-food' | 'no-restriction';
export type FrequencyType = 'daily' | 'twice-daily' | 'three-times-daily' | 'weekly' | 'as-needed';

export interface MedicationScheduleItem {
  time: string; // "08:00", "13:00", "20:00"
  label: 'Morning' | 'Afternoon' | 'Evening' | 'Bedtime' | 'As Needed';
  doseTakenToday?: boolean;
  takenAt?: string;
  status?: 'pending' | 'taken' | 'skipped' | 'snoozed' | 'missed';
}

export interface Medication {
  id: string;
  name: string;
  brandName?: string;
  dosage: string;
  form: 'tablet' | 'capsule' | 'liquid' | 'inhaler' | 'injection' | 'drop';
  frequency: FrequencyType;
  schedules: MedicationScheduleItem[];
  instructions: string;
  foodRequirement: FoodRequirement;
  pillColor: PillColor;
  pillShape: PillShape;
  purpose: string;
  prescribingDoctor: string;
  prescriptionNumber: string;
  startDate: string;
  endDate?: string;
  remainingCount: number;
  totalRefillCount: number;
  refillThreshold: number;
  pharmacyPhone?: string;
  sideEffectsWarnings?: string[];
  isActive: boolean;
  visualTagHindi?: string;
  visualTagTelugu?: string;
  voiceDescriptionHindi?: string;
  voiceDescriptionTelugu?: string;
  voiceDescriptionTeluguPhonetic?: string;
  voiceDescriptionTamil?: string;
  voiceDescriptionTamilPhonetic?: string;
  voiceDescriptionEnglish?: string;
}

export interface AdherenceLog {
  id: string;
  medicationId: string;
  medicationName: string;
  dosage: string;
  scheduledTime: string;
  actionTime: string;
  status: 'taken' | 'skipped' | 'snoozed';
  loggedBy: {
    name: string;
    role: Role;
  };
  notes?: string;
  voiceConfirmed?: boolean;
}

export interface Appointment {
  id: string;
  title: string;
  doctorName: string;
  specialty: string;
  clinic: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:mm
  location: string;
  notes?: string;
  transportationArranged: boolean;
  accompaniedBy?: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  reminderSent: boolean;
}

export interface VitalSign {
  id: string;
  type: 'blood_pressure' | 'blood_sugar' | 'heart_rate' | 'oxygen_saturation' | 'weight' | 'temperature';
  value: string; // "128/82" or "104"
  unit: string;  // "mmHg", "mg/dL", "bpm", "%", "lbs", "°F"
  measuredAt: string;
  status: 'normal' | 'caution' | 'critical';
  note?: string;
  loggedBy: string;
}

export interface ActivityFeedItem {
  id: string;
  timestamp: string;
  actor: {
    name: string;
    role: Role;
  };
  category: 'medication' | 'vitals' | 'sos' | 'appointment' | 'refill' | 'note' | 'escalation';
  title: string;
  description: string;
  severity?: 'normal' | 'warning' | 'urgent' | 'high' | 'medium';
}

export interface NotificationLog {
  id: string;
  timestamp: string;
  type: 'medication_reminder' | 'missed_dose_alert' | 'sos_emergency' | 'refill_alert' | 'appointment_reminder' | 'daily_schedule' | 'refill';
  recipientName: string;
  recipientEmail: string;
  subject: string;
  previewText: string;
  htmlContent: string;
  status: 'sent' | 'simulated' | 'delivered';
  metadata?: Record<string, any>;
}

export interface DrugInteraction {
  id: string;
  drugA: string;
  drugB?: string;
  foodOrSubstance?: string;
  type: 'drug-drug' | 'drug-food' | 'drug-condition';
  severity: 'critical' | 'major' | 'moderate' | 'minor';
  clinicalSummary: string;
  elderExplanation: string;
  recommendation: string;
}

export interface EmergencySosEvent {
  id: string;
  timestamp: string;
  status: 'active' | 'resolved' | 'false_alarm';
  initiatedBy: string;
  elderLocation: {
    address: string;
    room: string;
    coordinates?: { lat: number; lng: number };
  };
  notifiedContacts: string[];
  resolvedAt?: string;
  resolvedBy?: string;
  resolutionNotes?: string;
}
