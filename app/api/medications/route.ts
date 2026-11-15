import { NextResponse } from 'next/server';
import { careStore } from '@/lib/db';
import { Medication } from '@/lib/types';
import { checkMedicationInteractions } from '@/lib/drugInteractions';

// GET all medications
export async function GET() {
  const interactions = checkMedicationInteractions(careStore.medications);
  return NextResponse.json({
    success: true,
    data: careStore.medications,
    interactions,
  });
}

// POST create medication
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const newMed: Medication = {
      id: `med-${Date.now()}`,
      name: body.name,
      brandName: body.brandName || '',
      dosage: body.dosage,
      form: body.form || 'tablet',
      frequency: body.frequency || 'daily',
      schedules: body.schedules || [{ time: '08:00', label: 'Morning', doseTakenToday: false, status: 'pending' }],
      instructions: body.instructions || 'Take as directed by doctor.',
      foodRequirement: body.foodRequirement || 'no-restriction',
      pillColor: body.pillColor || 'blue',
      pillShape: body.pillShape || 'round',
      purpose: body.purpose || 'General health maintenance',
      prescribingDoctor: body.prescribingDoctor || 'Dr. Michael Chen, MD',
      prescriptionNumber: body.prescriptionNumber || `RX-${Math.floor(100000 + Math.random() * 900000)}`,
      startDate: new Date().toISOString().split('T')[0],
      remainingCount: Number(body.remainingCount) || 30,
      totalRefillCount: Number(body.totalRefillCount) || 30,
      refillThreshold: Number(body.refillThreshold) || 5,
      pharmacyPhone: body.pharmacyPhone || '(555) 892-4100',
      sideEffectsWarnings: body.sideEffectsWarnings || [],
      isActive: true,
    };

    careStore.medications.push(newMed);

    // Add activity record
    careStore.activities.unshift({
      id: `act-${Date.now()}`,
      timestamp: 'Just now',
      actor: { name: body.loggedBy || 'Caregiver', role: 'nurse' },
      category: 'medication',
      title: `New Medication Prescribed: ${newMed.name}`,
      description: `${newMed.dosage} - ${newMed.purpose}. Pill count: ${newMed.remainingCount}.`,
      severity: 'normal',
    });

    const interactions = checkMedicationInteractions(careStore.medications);

    return NextResponse.json({
      success: true,
      data: newMed,
      interactions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// PUT update medication
export async function PUT(req: Request) {
  try {
    const body = await req.json();
    const index = careStore.medications.findIndex(m => m.id === body.id);
    if (index === -1) {
      return NextResponse.json({ success: false, error: 'Medication not found' }, { status: 404 });
    }

    careStore.medications[index] = {
      ...careStore.medications[index],
      ...body,
    };

    const interactions = checkMedicationInteractions(careStore.medications);

    return NextResponse.json({
      success: true,
      data: careStore.medications[index],
      interactions,
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}

// DELETE deactivate or remove
export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ success: false, error: 'Medication ID required' }, { status: 400 });
    }

    careStore.medications = careStore.medications.filter(m => m.id !== id);
    return NextResponse.json({ success: true, message: 'Medication removed' });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 400 });
  }
}
