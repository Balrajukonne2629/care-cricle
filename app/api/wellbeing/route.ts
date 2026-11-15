import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { VitalSign } from '@/lib/types';
import { sendEmailNotification } from '@/lib/emailService';

export async function GET() {
  return NextResponse.json({
    success: true,
    vitals: careStore.vitals,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { mood, notes, bpReading, sugarReading } = body;

    // Record activity
    const moodLabels: Record<string, string> = {
      great: '😊 Feeling Great & Energized',
      okay: '🙂 Feeling Okay / Normal',
      tired: '😴 Feeling A Bit Tired / Resting',
      help: '🥺 Needs Extra Help Today',
    };

    const label = moodLabels[mood] || mood;
    const isUrgent = mood === 'help';

    careStore.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: { name: 'Eleanor Vance', role: 'elder' },
      category: 'vitals',
      title: `Daily Wellbeing Check-in: ${label}`,
      description: notes ? `"${notes}"` : 'Logged daily morning check-in.',
      severity: isUrgent ? 'warning' : 'normal',
    });

    // If BP reading is provided
    if (bpReading) {
      const vital: VitalSign = {
        id: `vital-${Date.now()}`,
        type: 'blood_pressure',
        value: bpReading,
        unit: 'mmHg',
        measuredAt: 'Just now',
        status: bpReading.includes('/') && parseInt(bpReading.split('/')[0]) > 140 ? 'caution' : 'normal',
        loggedBy: 'Eleanor Vance',
        note: notes,
      };
      careStore.vitals.unshift(vital);
    }

    // If elder tapped "Need Help"
    if (isUrgent) {
      const primaryContact = careStore.circleMembers.find(m => m.isPrimaryContact) || careStore.circleMembers[0];
      await sendEmailNotification(
        'medication_reminder',
        primaryContact.name,
        primaryContact.email,
        `💛 CareCircle: Eleanor checked in needing support`,
        `Eleanor reported "Need Extra Help" during her morning check-in. Notes: ${notes || 'None provided'}.`,
        `<div style="font-family:sans-serif;padding:20px;border-radius:12px;background:#fff1f0;border:1px solid #f87171;">
          <h3 style="color:#b91c1c;margin:0 0 8px 0;">Eleanor Requested Support</h3>
          <p>During daily check-in, Eleanor indicated she feels she needs extra help today.</p>
          <p><strong>Note:</strong> ${notes || 'No specific note added.'}</p>
          <p>Consider giving her a quick friendly call at ${careStore.elder.primaryPhysician.phone} or visiting.</p>
        </div>`
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Check-in recorded and synced with Care Circle',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
