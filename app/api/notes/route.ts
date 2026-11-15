import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { ActivityFeedItem, Role } from '@/lib/types';

export async function GET() {
  return NextResponse.json({
    success: true,
    data: careStore.activities,
  });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { authorName, role, text, category, severity } = body;

    if (!text || !text.trim()) {
      return NextResponse.json({ success: false, error: 'Note text cannot be empty' }, { status: 400 });
    }

    const newActivity: ActivityFeedItem = {
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: {
        name: authorName || 'Care Circle Member',
        role: (role as Role) || 'family',
      },
      category: category || 'note',
      title: `${authorName || 'Caregiver'} Note`,
      description: text.trim(),
      severity: severity || 'normal',
    };

    careStore.activities.unshift(newActivity);

    return NextResponse.json({
      success: true,
      data: newActivity,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
