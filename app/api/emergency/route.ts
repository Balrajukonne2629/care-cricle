import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { EmergencySosEvent } from '@/lib/types';
import { sendEmailNotification, generateSosAlertHtml } from '@/lib/emailService';

export async function GET() {
  return NextResponse.json({
    success: true,
    activeSos: careStore.activeSos,
    elder: {
      name: careStore.elder.name,
      address: careStore.elder.address,
      apartmentSuite: careStore.elder.apartmentSuite,
      emergencyNotes: careStore.elder.emergencyNotes,
      bloodType: careStore.elder.bloodType,
      allergies: careStore.elder.allergies,
      chronicConditions: careStore.elder.chronicConditions,
      physician: careStore.elder.primaryPhysician,
    },
    contacts: careStore.circleMembers,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const initiatedBy = body.initiatedBy || 'Eleanor Vance (One-Tap SOS Beacon)';

    const newSos: EmergencySosEvent = {
      id: `sos-${Date.now()}`,
      timestamp: new Date().toISOString(),
      status: 'active',
      initiatedBy,
      elderLocation: {
        address: careStore.elder.address,
        room: body.room || careStore.elder.apartmentSuite || 'Residence Main Area',
        coordinates: { lat: 39.7817, lng: -89.6501 }, // Springfield IL
      },
      notifiedContacts: careStore.circleMembers.map(m => `${m.name} (${m.relationship})`),
    };

    careStore.activeSos = newSos;

    // Add high severity activity feed record
    careStore.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: { name: 'Emergency Beacon', role: 'elder' },
      category: 'sos',
      title: '🚨 EMERGENCY SOS ACTIVATED',
      description: `Emergency alert triggered at ${newSos.elderLocation.address}. All circle contacts notified immediately.`,
      severity: 'urgent',
    });

    // Broadcast email to primary caregiver and nurse
    for (const member of careStore.circleMembers) {
      if (member.notificationPreferences.email) {
        const emailHtml = generateSosAlertHtml(careStore.elder, newSos, member);
        await sendEmailNotification(
          'sos_emergency',
          member.name,
          member.email,
          `🚨 CRITICAL: EMERGENCY SOS ACTIVATED FOR ${careStore.elder.name.toUpperCase()}`,
          `Immediate response requested at ${careStore.elder.address}`,
          emailHtml
        );
      }
    }

    return NextResponse.json({
      success: true,
      sos: newSos,
      message: 'Emergency broadcast transmitted to 3 contacts and recorded on CareCircle network.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const { resolvedBy, resolutionNotes } = body;

    if (careStore.activeSos) {
      careStore.activeSos.status = 'resolved';
      careStore.activeSos.resolvedAt = new Date().toISOString();
      careStore.activeSos.resolvedBy = resolvedBy || 'Sarah Vance-Miller (Daughter)';
      careStore.activeSos.resolutionNotes = resolutionNotes || 'In-person check completed. Situation safe and stable.';

      careStore.activities.unshift({
        id: `act-${Date.now()}`,
        timestamp: 'Just now',
        actor: { name: careStore.activeSos.resolvedBy || 'Caregiver', role: 'family' },
        category: 'sos',
        title: 'Emergency Stand-Down: SOS Resolved',
        description: `Resolved by ${careStore.activeSos.resolvedBy}: "${careStore.activeSos.resolutionNotes}"`,
        severity: 'normal',
      });
    }

    const resolved = careStore.activeSos;
    careStore.activeSos = null;

    return NextResponse.json({
      success: true,
      resolved,
      message: 'Emergency event resolved and archived.',
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
