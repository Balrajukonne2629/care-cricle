import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { AdherenceLog } from '@/lib/types';
import { sendEmailNotification } from '@/lib/emailService';

export async function GET() {
  const totalLogs = careStore.adherenceLogs.length;
  const takenLogs = careStore.adherenceLogs.filter(l => l.status === 'taken').length;
  const adherenceRate7d = 94; // Baseline simulated 7-day adherence score
  const adherenceRate30d = 91; // Baseline simulated 30-day adherence score

  return NextResponse.json({
    success: true,
    logs: careStore.adherenceLogs,
    stats: {
      totalLogs,
      takenLogs,
      adherenceRate7d,
      adherenceRate30d,
      currentStreakDays: 6,
    },
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { medicationId, scheduledTime, status, loggedBy, notes, voiceConfirmed } = body;

    const med = careStore.medications.find(m => m.id === medicationId);
    if (!med) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 });
    }

    // Update schedule item status
    med.schedules = med.schedules.map(s => {
      if (s.time === scheduledTime || !scheduledTime) {
        return {
          ...s,
          doseTakenToday: status === 'taken',
          status: status,
          takenAt: status === 'taken' ? new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : undefined,
        };
      }
      return s;
    });

    // If taken, decrement remaining pill count
    if (status === 'taken' && med.remainingCount > 0) {
      med.remainingCount -= 1;

      // Check if low refill threshold reached
      if (med.remainingCount <= med.refillThreshold) {
        const primaryFamily = careStore.circleMembers.find(m => m.isPrimaryContact) || careStore.circleMembers[0];
        await sendEmailNotification(
          'refill_alert',
          primaryFamily.name,
          primaryFamily.email,
          `💊 Low Medication Notice: ${med.name} (${med.remainingCount} left)`,
          `Prescription ${med.prescriptionNumber} for Eleanor Vance is running low.`,
          `<div style="font-family:sans-serif;padding:20px;background:#fffbeb;border:1px solid #fcd34d;border-radius:12px;">
            <h3 style="color:#92400e;margin:0 0 10px 0;">Prescription Refill Alert</h3>
            <p><strong>${med.name} (${med.dosage})</strong> has only <strong>${med.remainingCount} tablets</strong> left.</p>
            <p><strong>Pharmacy:</strong> ${med.pharmacyPhone || '(555) 892-4100'}<br/><strong>Prescription:</strong> ${med.prescriptionNumber}</p>
          </div>`
        );

        careStore.activities.unshift({
          id: `act-${Date.now()}`,
          timestamp: 'Just now',
          actor: { name: 'CareCircle System', role: 'nurse' },
          category: 'refill',
          title: `Automatic Refill Warning: ${med.name}`,
          description: `Only ${med.remainingCount} pills remaining. Email sent to ${primaryFamily.name}.`,
          severity: 'warning',
        });
      }
    }

    // Create adherence log entry
    const newLog: AdherenceLog = {
      id: `log-${Date.now()}`,
      medicationId: med.id,
      medicationName: med.name,
      dosage: med.dosage,
      scheduledTime: scheduledTime || 'Routine',
      actionTime: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: status || 'taken',
      loggedBy: loggedBy || { name: 'Eleanor Vance', role: 'elder' },
      notes: notes || (voiceConfirmed ? 'Confirmed via voice command' : 'Confirmed on elder dashboard'),
      voiceConfirmed: !!voiceConfirmed,
    };

    careStore.adherenceLogs.unshift(newLog);

    // Add activity feed entry
    careStore.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: loggedBy || { name: 'Eleanor Vance', role: 'elder' },
      category: 'medication',
      title: `${med.name} Marked as ${status.toUpperCase()}`,
      description: `${med.dosage} (${scheduledTime || 'Scheduled'}) • Remaining: ${med.remainingCount} pills`,
      severity: status === 'skipped' ? 'warning' : 'normal',
    });

    // Check if all scheduled doses for today are completed
    const allPending = careStore.medications.flatMap(m => m.schedules).filter(s => s.status === 'pending');
    const allCompletedToday = allPending.length === 0;

    return NextResponse.json({
      success: true,
      log: newLog,
      allCompletedToday,
      remainingCount: med.remainingCount,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
