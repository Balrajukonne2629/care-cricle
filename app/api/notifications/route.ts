import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import {
  sendEmailNotification,
  getEmailArchive,
  generateDailyPillEmailHtml,
  generateMissedDoseAlertHtml,
  generateSosAlertHtml
} from '@/lib/emailService';

export async function GET() {
  const archive = getEmailArchive();
  // Merge in-memory archive with initial notification logs (deduplicating by id)
  const combined = [...archive, ...careStore.notifications.filter(n => !archive.some(a => a.id === n.id))];

  return NextResponse.json({
    success: true,
    data: combined,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { templateType, recipientEmail, recipientName } = body;

    const email = recipientEmail || 'sarah.vance@example.com';
    const name = recipientName || 'Sarah Vance-Miller';

    let subject = '';
    let preview = '';
    let html = '';

    if (templateType === 'daily_schedule') {
      subject = `🌿 CareCircle Morning Schedule for ${careStore.elder.preferredName}`;
      preview = `Scheduled medications for 8:00 AM: Lisinopril, Metformin, and Aspirin.`;
      html = generateDailyPillEmailHtml(careStore.elder, careStore.medications, 'Morning');
    } else if (templateType === 'missed_dose') {
      const targetMed = careStore.medications[0];
      subject = `⚠️ CareCircle Notice: ${careStore.elder.preferredName} Dose Not Logged`;
      preview = `Morning dose of ${targetMed.name} (${targetMed.dosage}) past due.`;
      html = generateMissedDoseAlertHtml(careStore.elder, targetMed, '08:00 AM');
    } else if (templateType === 'refill') {
      const lowMed = careStore.medications.find(m => m.remainingCount <= m.refillThreshold) || careStore.medications[2];
      subject = `💊 Prescription Refill Needed: ${lowMed.name} (${lowMed.remainingCount} pills left)`;
      preview = `Pharmacy reorder required for prescription ${lowMed.prescriptionNumber}.`;
      html = `
        <div style="font-family:sans-serif;max-width:550px;margin:0 auto;background:#fff;border-radius:12px;border:2px solid #fbbf24;padding:24px;">
          <h2 style="color:#b45309;margin-top:0;">Prescription Refill Urgent Notice</h2>
          <p style="font-size:16px;color:#334155;"><strong>${careStore.elder.name}'s</strong> supply of <strong>${lowMed.name} (${lowMed.dosage})</strong> is down to <strong>${lowMed.remainingCount} pills</strong>.</p>
          <div style="background:#fef3c7;padding:16px;border-radius:8px;margin:16px 0;">
            <p style="margin:4px 0;"><strong>Prescription:</strong> ${lowMed.prescriptionNumber}</p>
            <p style="margin:4px 0;"><strong>Pharmacy:</strong> ${careStore.elder.preferredPharmacy.name}</p>
            <p style="margin:4px 0;"><strong>Direct Phone:</strong> ${careStore.elder.preferredPharmacy.phone}</p>
          </div>
          <p style="color:#64748b;font-size:14px;">Automated alert from CareCircle Safety Monitor.</p>
        </div>
      `;
    } else {
      // SOS emergency email
      const sosEvent = {
        id: `sos-${Date.now()}`,
        timestamp: new Date().toISOString(),
        status: 'active' as const,
        initiatedBy: 'Eleanor Vance (Elder Portal)',
        elderLocation: {
          address: careStore.elder.address,
          room: careStore.elder.apartmentSuite || 'Living Area',
        },
        notifiedContacts: ['Sarah Vance-Miller', 'Nurse David Martinez', 'Emergency Services'],
      };
      subject = `🚨 URGENT: EMERGENCY SOS ACTIVATED BY ${careStore.elder.name.toUpperCase()}`;
      preview = `Emergency beacon pressed at ${careStore.elder.address}. Immediate assistance required.`;
      html = generateSosAlertHtml(careStore.elder, sosEvent, careStore.circleMembers[0]);
    }

    const log = await sendEmailNotification(
      templateType === 'missed_dose' ? 'missed_dose_alert' : templateType === 'refill' ? 'refill_alert' : 'medication_reminder',
      name,
      email,
      subject,
      preview,
      html
    );

    return NextResponse.json({
      success: true,
      log,
      message: `Email dispatched to ${email}`,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
