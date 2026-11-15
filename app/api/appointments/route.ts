import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { Appointment } from '@/lib/types';

// Helper to generate RFC 5545 iCalendar content (.ics)
function generateIcs(appt: Appointment): string {
  const [year, month, day] = appt.date.split('-');
  const dtStart = `${year}${month}${day}T100000Z`;
  const dtEnd = `${year}${month}${day}T110000Z`;

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//CareCircle//Healthcare Platform//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:carecircle-appt-${appt.id}@carecircle.health`,
    `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
    `DTSTART:${dtStart}`,
    `DTEND:${dtEnd}`,
    `SUMMARY:CareCircle: ${appt.title} - ${appt.doctorName}`,
    `DESCRIPTION:${appt.notes || 'Healthcare visit for Eleanor Vance.'}\\nClinic: ${appt.clinic}`,
    `LOCATION:${appt.location}`,
    'STATUS:CONFIRMED',
    'END:VEVENT',
    'END:VCALENDAR'
  ].join('\r\n');
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const format = searchParams.get('format');
  const id = searchParams.get('id');

  if (format === 'ics' && id) {
    const appt = careStore.appointments.find(a => a.id === id);
    if (!appt) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    const icsData = generateIcs(appt);
    return new Response(icsData, {
      status: 200,
      headers: {
        'Content-Type': 'text/calendar; charset=utf-8',
        'Content-Disposition': `attachment; filename="carecircle-appointment-${appt.id}.ics"`,
      },
    });
  }

  return NextResponse.json({
    success: true,
    data: careStore.appointments,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newAppt: Appointment = {
      id: `appt-${Date.now()}`,
      title: body.title,
      doctorName: body.doctorName,
      specialty: body.specialty || 'General Practice',
      clinic: body.clinic || 'Main Medical Center',
      date: body.date,
      time: body.time,
      location: body.location || 'Springfield Clinic',
      notes: body.notes || '',
      transportationArranged: !!body.transportationArranged,
      accompaniedBy: body.accompaniedBy || '',
      status: 'upcoming',
      reminderSent: false,
    };

    careStore.appointments.push(newAppt);

    careStore.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: { name: body.loggedBy || 'Sarah Vance-Miller', role: 'family' },
      category: 'appointment',
      title: `New Appointment Scheduled: ${newAppt.title}`,
      description: `${newAppt.date} at ${newAppt.time} with ${newAppt.doctorName}. Transport: ${newAppt.transportationArranged ? 'Arranged' : 'Needed'}`,
      severity: 'normal',
    });

    return NextResponse.json({ success: true, data: newAppt });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const index = careStore.appointments.findIndex(a => a.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Appointment not found' }, { status: 404 });
    }

    careStore.appointments[index] = {
      ...careStore.appointments[index],
      ...body,
    };

    return NextResponse.json({ success: true, data: careStore.appointments[index] });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
