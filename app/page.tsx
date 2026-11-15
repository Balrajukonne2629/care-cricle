'use client';

import React, { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';
import ElderView from '@/components/ElderView';
import CaregiverView from '@/components/CaregiverView';
import PasscodeModal from '@/components/PasscodeModal';
import VoiceAssistantModal from '@/components/VoiceAssistantModal';
import EmailInspectorModal from '@/components/EmailInspectorModal';
import EmergencyModal from '@/components/EmergencyModal';
import DoctorReportModal from '@/components/DoctorReportModal';

import {
  ROLE_PINS,
  INITIAL_ELDER,
  INITIAL_CIRCLE_MEMBERS,
  INITIAL_MEDICATIONS,
  INITIAL_APPOINTMENTS,
  INITIAL_VITALS,
  INITIAL_ACTIVITY_FEED,
  INITIAL_NOTIFICATIONS,
  careStore,
} from '@/lib/db';
import {
  UserRolePin,
  ElderProfile,
  Medication,
  Appointment,
  VitalSign,
  ActivityFeedItem,
  NotificationLog,
  CareCircleMember,
} from '@/lib/types';
import SoundService from '@/lib/soundService';
import { SpeechService } from '@/lib/speechService';

export default function CareCircleApp() {
  // Authentication & Profile State
  const [currentRole, setCurrentRole] = useState<UserRolePin>(ROLE_PINS[0]); // Default Elder

  // Core Data State
  const [elder, setElder] = useState<ElderProfile>(INITIAL_ELDER);
  const [medications, setMedications] = useState<Medication[]>(INITIAL_MEDICATIONS);
  const [appointments, setAppointments] = useState<Appointment[]>(INITIAL_APPOINTMENTS);
  const [activities, setActivities] = useState<ActivityFeedItem[]>(INITIAL_ACTIVITY_FEED);
  const [vitals, setVitals] = useState<VitalSign[]>(INITIAL_VITALS);
  const [circleMembers, setCircleMembers] = useState<CareCircleMember[]>(INITIAL_CIRCLE_MEMBERS);
  const [notifications, setNotifications] = useState<NotificationLog[]>(INITIAL_NOTIFICATIONS);

  // Accessibility State
  const [fontSize, setFontSize] = useState<'standard' | 'large' | 'extra-large'>('large');
  const [highContrast, setHighContrast] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  // Modals Visibility
  const [isPasscodeOpen, setIsPasscodeOpen] = useState<boolean>(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState<boolean>(false);
  const [isEmailInspectorOpen, setIsEmailInspectorOpen] = useState<boolean>(false);
  const [isEmergencyOpen, setIsEmergencyOpen] = useState<boolean>(false);
  const [isDoctorReportOpen, setIsDoctorReportOpen] = useState<boolean>(false);
  const [isSosActive, setIsSosActive] = useState<boolean>(false);

  // Initialize Speech Voices on Mount
  useEffect(() => {
    SpeechService.initVoice();
  }, []);

  // Action: Mark dose as taken
  const handleTakeDose = async (medId: string, scheduledTime: string) => {
    try {
      const res = await fetch('/api/adherence', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          medicationId: medId,
          scheduledTime,
          status: 'taken',
          loggedBy: { name: currentRole.name, role: currentRole.role },
        }),
      });

      const data = await res.json();
      if (data.success) {
        // Update local medications
        setMedications(prev =>
          prev.map(m => {
            if (m.id === medId) {
              const updatedSchedules = m.schedules.map(s => {
                if (s.time === scheduledTime || !scheduledTime) {
                  return { ...s, doseTakenToday: true, status: 'taken' as const };
                }
                return s;
              });
              return {
                ...m,
                remainingCount: data.remainingCount,
                schedules: updatedSchedules,
              };
            }
            return m;
          })
        );

        // Update activities feed
        setActivities(prev => [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            actor: { name: currentRole.name, role: currentRole.role },
            category: 'medication',
            title: `${data.log.medicationName} Dose Confirmed`,
            description: `${data.log.dosage} at ${data.log.actionTime}`,
            severity: 'normal',
          },
          ...prev,
        ]);

        if (data.allCompletedToday) {
          SoundService.playCelebration();
        }
      }
    } catch (e) {
      console.error('Error logging adherence:', e);
    }
  };

  // Action: Add new medication
  const handleAddMedication = async (med: Partial<Medication>) => {
    try {
      const res = await fetch('/api/medications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...med,
          loggedBy: currentRole.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setMedications(prev => [...prev, data.data]);
        setActivities(prev => [
          {
            id: `act-${Date.now()}`,
            timestamp: 'Just now',
            actor: { name: currentRole.name, role: currentRole.role },
            category: 'medication',
            title: `New Medication: ${data.data.name}`,
            description: `${data.data.dosage} - ${data.data.purpose}`,
            severity: 'normal',
          },
          ...prev,
        ]);
      }
    } catch (e) {
      console.error('Error adding medication:', e);
    }
  };

  // Action: Add new appointment
  const handleAddAppointment = async (appt: Partial<Appointment>) => {
    try {
      const res = await fetch('/api/appointments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...appt,
          loggedBy: currentRole.name,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setAppointments(prev => [...prev, data.data]);
      }
    } catch (e) {
      console.error('Error adding appointment:', e);
    }
  };

  // Action: Post collaborative care note
  const handlePostNote = async (text: string) => {
    try {
      const res = await fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          authorName: currentRole.name,
          role: currentRole.role,
          text,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setActivities(prev => [data.data, ...prev]);
      }
    } catch (e) {
      console.error('Error posting note:', e);
    }
  };

  // Action: Emergency SOS Trigger
  const handleConfirmSos = async () => {
    try {
      setIsSosActive(true);
      const res = await fetch('/api/emergency', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          initiatedBy: `${currentRole.name} (${currentRole.label})`,
        }),
      });
      const data = await res.json();
      if (data.success) {
        // Sync notifications
        const notifRes = await fetch('/api/notifications');
        const notifData = await notifRes.json();
        if (notifData.data) {
          setNotifications(notifData.data);
        }
      }
    } catch (e) {
      console.error('Error triggering SOS:', e);
    }
  };

  // Action: Emergency SOS Resolve
  const handleResolveSos = async (notes: string) => {
    try {
      const res = await fetch('/api/emergency', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resolvedBy: currentRole.name,
          resolutionNotes: notes,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setIsSosActive(false);
      }
    } catch (e) {
      console.error('Error resolving SOS:', e);
    }
  };

  // Action: Dispatch test email notification
  const handleTriggerTestEmail = async (type: 'daily_schedule' | 'missed_dose' | 'refill' | 'sos') => {
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          templateType: type,
          recipientEmail: circleMembers[0].email,
          recipientName: circleMembers[0].name,
        }),
      });
      const data = await res.json();
      if (data.success && data.log) {
        setNotifications(prev => [data.log, ...prev]);
      }
    } catch (e) {
      console.error('Error dispatching test email:', e);
    }
  };

  return (
    <div className={`min-h-screen bg-[#fbfaf8] ${highContrast ? 'elder-high-contrast' : ''}`}>
      {/* Top Accessible Navbar */}
      <Navbar
        currentRole={currentRole}
        onOpenPasscode={() => setIsPasscodeOpen(true)}
        onOpenEmailInspector={() => setIsEmailInspectorOpen(true)}
        onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
        onOpenEmergency={() => setIsEmergencyOpen(true)}
        unreadEmailCount={notifications.length}
        fontSize={fontSize}
        onChangeFontSize={setFontSize}
        highContrast={highContrast}
        onToggleHighContrast={() => setHighContrast(prev => !prev)}
        soundEnabled={soundEnabled}
        onToggleSound={() => {
          const newState = SoundService.toggleSound();
          setSoundEnabled(newState);
        }}
      />

      {/* Main Responsive Body */}
      <main className="py-6 sm:py-8">
        {currentRole.role === 'elder' ? (
          <ElderView
            elder={elder}
            medications={medications}
            onTakeDose={handleTakeDose}
            onTriggerSos={() => setIsEmergencyOpen(true)}
            onOpenVoiceAssistant={() => setIsVoiceAssistantOpen(true)}
            vitals={vitals}
            fontSize={fontSize}
          />
        ) : (
          <CaregiverView
            currentRole={currentRole}
            medications={medications}
            appointments={appointments}
            activities={activities}
            vitals={vitals}
            circleMembers={circleMembers}
            onAddMedication={handleAddMedication}
            onAddAppointment={handleAddAppointment}
            onPostNote={handlePostNote}
            onOpenDoctorReport={() => setIsDoctorReportOpen(true)}
            onSendTestNotification={handleTriggerTestEmail}
          />
        )}
      </main>

      {/* Modals & Dialogs */}
      <PasscodeModal
        isOpen={isPasscodeOpen}
        onClose={() => setIsPasscodeOpen(false)}
        onRoleSelected={role => setCurrentRole(role)}
        currentRole={currentRole}
      />

      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        elder={elder}
        medications={medications}
        appointments={appointments}
        onTakeDose={handleTakeDose}
        onTriggerSos={handleConfirmSos}
      />

      <EmailInspectorModal
        isOpen={isEmailInspectorOpen}
        onClose={() => setIsEmailInspectorOpen(false)}
        notifications={notifications}
        onTriggerTestEmail={handleTriggerTestEmail}
      />

      <EmergencyModal
        isOpen={isEmergencyOpen}
        onClose={() => setIsEmergencyOpen(false)}
        elder={elder}
        circleMembers={circleMembers}
        onConfirmSos={handleConfirmSos}
        onResolveSos={handleResolveSos}
        isSosActive={isSosActive}
      />

      <DoctorReportModal
        isOpen={isDoctorReportOpen}
        onClose={() => setIsDoctorReportOpen(false)}
        elder={elder}
        medications={medications}
        vitals={vitals}
        adherenceLogs={careStore.adherenceLogs}
      />
    </div>
  );
}
