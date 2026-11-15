import { Medication, ElderProfile, CareCircleMember, EmergencySosEvent } from './types';

/**
 * Generates an accessible, warm HTML template for elder daily pill reminders
 */
export function generateDailyPillEmailHtml(
  elder: ElderProfile,
  medications: Medication[],
  timeSlot: 'Morning' | 'Afternoon' | 'Evening'
): string {
  const currentSlotMeds = medications.filter(m =>
    m.schedules.some(s => s.label.toLowerCase() === timeSlot.toLowerCase())
  );

  const pillsHtml = currentSlotMeds
    .map(
      m => `
      <div style="background-color: #f8fafc; border-left: 6px solid #588258; border-radius: 12px; padding: 18px; margin-bottom: 14px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <h3 style="margin: 0; color: #1e293b; font-size: 20px; font-weight: 700;">${m.name} (${m.dosage})</h3>
          <span style="background-color: #e5ede5; color: #365236; padding: 4px 12px; border-radius: 20px; font-weight: 600; font-size: 14px;">
            ${m.foodRequirement.replace('-', ' ').toUpperCase()}
          </span>
        </div>
        <p style="margin: 8px 0 0 0; color: #475569; font-size: 16px; line-height: 1.4;">
          <strong>Instructions:</strong> ${m.instructions}
        </p>
        <p style="margin: 6px 0 0 0; color: #64748b; font-size: 14px;">
          Prescribed for: ${m.purpose} • Pills left: <strong>${m.remainingCount}</strong>
        </p>
      </div>`
    )
    .join('');

  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>CareCircle Daily Reminder</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf8; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
      <div style="background: linear-gradient(135deg, #588258, #365236); padding: 28px 24px; text-align: center; color: #ffffff;">
        <h1 style="margin: 0; font-size: 26px; font-weight: 800; letter-spacing: -0.5px;">🌿 CareCircle</h1>
        <p style="margin: 8px 0 0 0; font-size: 17px; opacity: 0.95;">Good day, ${elder.preferredName}! Here are your ${timeSlot} medications.</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 18px; color: #334155; margin-top: 0; line-height: 1.5;">
          Hello ${elder.preferredName}, keeping up with your health is a wonderful act of self-care. Please take a moment with a glass of water for your schedule:
        </p>
        <div style="margin: 20px 0;">
          ${pillsHtml.length > 0 ? pillsHtml : '<p style="color: #64748b; font-size: 16px;">No scheduled medications for this window.</p>'}
        </div>
        <div style="background-color: #fffbeb; border: 1px solid #fde68a; border-radius: 12px; padding: 16px; margin-top: 24px; text-align: center;">
          <p style="margin: 0; color: #92400e; font-size: 15px; font-weight: 600;">
            ❤️ Your Care Circle (Sarah & Nurse David) has been synced with your progress.
          </p>
        </div>
      </div>
      <div style="background-color: #f1f5f9; padding: 18px 24px; text-align: center; color: #64748b; font-size: 13px;">
        CareCircle Health Platform • Designed for ${elder.name} • 24/7 Family Sync
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generates emergency Missed Dose alert email for family & caregiver circle
 */
export function generateMissedDoseAlertHtml(
  elder: ElderProfile,
  medication: Medication,
  scheduledTime: string
): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>CareCircle Missed Dose Alert</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf8; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 2px solid #fbbf24; overflow: hidden; box-shadow: 0 4px 16px rgba(245, 158, 11, 0.15);">
      <div style="background: linear-gradient(135deg, #f59e0b, #d97706); padding: 24px; color: #ffffff; text-align: center;">
        <span style="font-size: 32px;">⚠️</span>
        <h1 style="margin: 8px 0 0 0; font-size: 22px; font-weight: 800;">Adherence Notice: Dose Not Recorded</h1>
        <p style="margin: 4px 0 0 0; font-size: 15px; opacity: 0.95;">Care Circle Attention Needed</p>
      </div>
      <div style="padding: 24px;">
        <p style="font-size: 16px; color: #1e293b; line-height: 1.5; margin-top: 0;">
          <strong>${elder.name}</strong> was scheduled to take <strong>${medication.name} (${medication.dosage})</strong> at <strong>${scheduledTime}</strong>, but confirmation was not logged within the 45-minute safe window.
        </p>
        <div style="background-color: #fff1f0; border-radius: 12px; padding: 16px; border-left: 5px solid #f8473c; margin: 18px 0;">
          <h4 style="margin: 0 0 6px 0; color: #831f17; font-size: 16px;">Medication Details:</h4>
          <p style="margin: 2px 0; color: #9f1d14; font-size: 14px;">• <strong>Purpose:</strong> ${medication.purpose}</p>
          <p style="margin: 2px 0; color: #9f1d14; font-size: 14px;">• <strong>Instructions:</strong> ${medication.instructions}</p>
          <p style="margin: 2px 0; color: #9f1d14; font-size: 14px;">• <strong>Doctor:</strong> ${medication.prescribingDoctor}</p>
        </div>
        <p style="font-size: 15px; color: #475569;">
          <strong>Suggested Next Steps:</strong>
        </p>
        <ul style="color: #475569; font-size: 14px; line-height: 1.6; padding-left: 20px;">
          <li>Give ${elder.preferredName} a gentle call at ${elder.primaryPhysician.phone}</li>
          <li>Check if she snoozed the reminder or took it without logging</li>
          <li>Confirm no dizziness or adverse symptoms</li>
        </ul>
      </div>
      <div style="background-color: #f8fafc; border-top: 1px solid #e2e8f0; padding: 16px 24px; text-align: center; font-size: 13px; color: #64748b;">
        Automated alert generated by CareCircle Real-time Safety Monitor
      </div>
    </div>
  </body>
  </html>
  `;
}

/**
 * Generates high-priority Emergency SOS Alert email with GPS and elder details
 */
export function generateSosAlertHtml(
  elder: ElderProfile,
  sosEvent: EmergencySosEvent,
  caregiver: CareCircleMember
): string {
  return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <title>CRITICAL EMERGENCY SOS ALERT</title>
  </head>
  <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #fbfaf8; margin: 0; padding: 24px;">
    <div style="max-width: 600px; margin: 0 auto; background: #ffffff; border-radius: 16px; border: 3px solid #e52a1e; overflow: hidden; box-shadow: 0 8px 30px rgba(229, 42, 30, 0.3);">
      <div style="background: linear-gradient(135deg, #e52a1e, #9f1d14); padding: 28px 24px; color: #ffffff; text-align: center;">
        <span style="font-size: 44px; display: block; margin-bottom: 8px;">🚨</span>
        <h1 style="margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px;">EMERGENCY SOS TRIGGERED</h1>
        <p style="margin: 8px 0 0 0; font-size: 16px; font-weight: 600;">Immediate Caregiver Action Required</p>
      </div>
      <div style="padding: 28px 24px;">
        <p style="font-size: 18px; color: #1e293b; margin-top: 0; font-weight: 600;">
          ${elder.name} has pressed the Emergency SOS button at ${new Date(sosEvent.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}.
        </p>

        <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 12px; padding: 18px; margin: 20px 0;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b; font-size: 18px;">📍 Registered Residence Location:</h3>
          <p style="margin: 4px 0; color: #374151; font-size: 16px;"><strong>Address:</strong> ${sosEvent.elderLocation.address}</p>
          <p style="margin: 4px 0; color: #374151; font-size: 16px;"><strong>Room/Area:</strong> ${sosEvent.elderLocation.room}</p>
          <p style="margin: 4px 0; color: #6b7280; font-size: 14px;"><strong>Emergency Medical Notes:</strong> ${elder.emergencyNotes}</p>
        </div>

        <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 12px; padding: 16px; margin-bottom: 20px;">
          <h4 style="margin: 0 0 8px 0; color: #166534; font-size: 16px;">🩺 Vital Health Profile for First Responders:</h4>
          <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">• Blood Type: <strong>${elder.bloodType}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">• Chronic Conditions: <strong>${elder.chronicConditions.join(', ')}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">• Allergies: <strong>${elder.allergies.join(', ')}</strong></p>
          <p style="margin: 4px 0; font-size: 14px; color: #1f2937;">• Primary Doctor: <strong>${elder.primaryPhysician.name} (${elder.primaryPhysician.phone})</strong></p>
        </div>

        <p style="font-size: 15px; color: #4b5563; text-align: center; margin-bottom: 0;">
          All circle members (${caregiver.name}, Family, Nurse) have received this alert.
        </p>
      </div>
    </div>
  </body>
  </html>
  `;
}
